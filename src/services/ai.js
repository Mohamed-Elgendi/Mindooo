// src/services/ai.js — Universal AI Engine v4.0
// Providers are now SHARED — stored in ai_providers table, readable by all users.
// API keys managed by admin via Supabase dashboard or AIProviders panel.
// Per-user quota tracked in localStorage (fast, no DB calls per message).

import { supabase } from '../supabase';

// ═══════════════════════════════════════════════════════════════
// SHARED PROVIDER CACHE
// ═══════════════════════════════════════════════════════════════
let _cache = [], _cacheAt = 0;
const CACHE_TTL = 120_000; // 2 minutes

export async function loadProviders() {
  const now = Date.now();
  if (_cache.length > 0 && now - _cacheAt < CACHE_TTL) return _cache;
  const { data, error } = await supabase
    .from("ai_providers")
    .select("*")
    .eq("is_enabled", true)
    .eq("is_paused", false)
    .order("priority", { ascending: true });
  if (error) { console.warn("[AI] Cannot load providers:", error.message); return _cache; }
  _cache = data || [];
  _cacheAt = now;
  return _cache;
}

export async function loadAllProviders() {
  const { data, error } = await supabase
    .from("ai_providers")
    .select("*")
    .order("priority", { ascending: true });
  return { data: data || [], error };
}

export function invalidateProviderCache() { _cacheAt = 0; }

// ═══════════════════════════════════════════════════════════════
// QUOTA — localStorage per user (fast, no DB round-trip)
// ═══════════════════════════════════════════════════════════════
function quotaKey(userId) { return `mindoo_quota_${userId}`; }

function getQ(userId, pid) {
  try {
    const all  = JSON.parse(localStorage.getItem(quotaKey(userId)) || "{}");
    const now  = Date.now();
    const today = new Date().toDateString();
    const ex   = all[pid] || {};
    const minR = (now - (ex.lastAt || 0)) > 60_000;
    const dayR = ex.day !== today;
    return {
      min:   minR ? 0 : (ex.min || 0),
      day:   dayR ? 0 : (ex.day_count || 0),
      lastAt: ex.lastAt || 0,
      day:    dayR ? today : (ex.day || today),
      day_count: dayR ? 0 : (ex.day_count || 0),
      coolUntil:  ex.coolUntil  || null,
      errors:     ex.errors     || 0,
      total:      ex.total      || 0,
      failures:   ex.failures   || 0,
      disabled:   ex.disabled   || false,
    };
  } catch { return { min: 0, day_count: 0, lastAt: 0, coolUntil: null, errors: 0, total: 0, failures: 0, disabled: false }; }
}

function patchQ(userId, pid, patch) {
  try {
    const key = quotaKey(userId);
    const all = JSON.parse(localStorage.getItem(key) || "{}");
    all[pid]  = { ...getQ(userId, pid), ...patch };
    localStorage.setItem(key, JSON.stringify(all));
  } catch {}
}

function isAvail(p, userId) {
  if (!p.api_key?.trim())
    return { ok: false, reason: "no API key — add in AI Providers settings" };
  const q   = getQ(userId, p.provider_id);
  const now = Date.now();
  if (q.disabled)
    return { ok: false, reason: "auth failed this session" };
  if (q.coolUntil && now < q.coolUntil)
    return { ok: false, reason: `cooldown — ${Math.ceil((q.coolUntil - now) / 1000)}s left` };
  if (q.min >= p.max_requests_per_minute)
    return { ok: false, reason: "per-minute quota reached" };
  if (q.day_count >= p.max_requests_per_day)
    return { ok: false, reason: "daily quota reached" };
  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════
// FORMAT ADAPTERS
// ═══════════════════════════════════════════════════════════════
async function callOpenAI(p, msgs, sys, maxTok) {
  const h = { "Content-Type": "application/json", "Authorization": `Bearer ${p.api_key}` };
  if (p.base_url.includes("openrouter.ai")) {
    h["HTTP-Referer"] = "https://mindooo.vercel.app";
    h["X-Title"] = "Mindoo";
  }
  const res = await fetch(p.base_url, {
    method: "POST", headers: h,
    body: JSON.stringify({ model: p.model, max_tokens: maxTok, temperature: 0.7, messages: [{ role: "system", content: sys }, ...msgs] }),
  });
  return { res, extract: d => d?.choices?.[0]?.message?.content || "" };
}

async function callAnthropic(p, msgs, sys, maxTok) {
  const res = await fetch(p.base_url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": p.api_key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify({ model: p.model, max_tokens: maxTok, system: sys, messages: msgs }),
  });
  return { res, extract: d => d?.content?.map(c => c.text || "").join("") || "" };
}

async function callGoogle(p, msgs, sys, maxTok) {
  const url = `${p.base_url}?key=${p.api_key}`;
  const contents = msgs.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  const res = await fetch(url, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system_instruction: { parts: [{ text: sys }] }, contents, generationConfig: { maxOutputTokens: maxTok, temperature: 0.7 } }),
  });
  return { res, extract: d => d?.candidates?.[0]?.content?.parts?.[0]?.text || "" };
}

// ═══════════════════════════════════════════════════════════════
// SINGLE PROVIDER CALL
// ═══════════════════════════════════════════════════════════════
async function callOne(p, msgs, sys, maxTok, userId) {
  const pid = p.provider_id;
  const now = Date.now();
  const q   = getQ(userId, pid);
  patchQ(userId, pid, { min: q.min + 1, day_count: q.day_count + 1, lastAt: now, total: q.total + 1 });

  let res, extract;
  try {
    const fmt = (p.api_format || "openai").toLowerCase();
    if      (fmt === "anthropic") ({ res, extract } = await callAnthropic(p, msgs, sys, maxTok));
    else if (fmt === "google")    ({ res, extract } = await callGoogle(p, msgs, sys, maxTok));
    else                          ({ res, extract } = await callOpenAI(p, msgs, sys, maxTok));
  } catch (e) {
    const cur = getQ(userId, pid);
    patchQ(userId, pid, { coolUntil: now + p.cooldown_on_error * 1000, errors: cur.errors + 1, failures: cur.failures + 1 });
    throw new Error(`${p.name}: network error`);
  }

  if (!res.ok) {
    const cur = getQ(userId, pid);
    if (res.status === 429) {
      patchQ(userId, pid, { coolUntil: now + p.cooldown_on_rate_limit * 1000, errors: cur.errors + 1, failures: cur.failures + 1 });
      throw new Error(`${p.name}: rate limited`);
    }
    if (res.status === 401 || res.status === 403) {
      patchQ(userId, pid, { disabled: true, failures: cur.failures + 1 });
      throw new Error(`${p.name}: auth failed — check API key`);
    }
    if (res.status >= 500) {
      patchQ(userId, pid, { coolUntil: now + p.cooldown_on_error * 1000, errors: cur.errors + 1, failures: cur.failures + 1 });
      throw new Error(`${p.name}: server error ${res.status}`);
    }
    throw new Error(`${p.name}: error ${res.status}`);
  }

  let data;
  try { data = await res.json(); } catch { throw new Error(`${p.name}: invalid JSON`); }
  const text = extract(data);
  if (!text?.trim()) throw new Error(`${p.name}: empty response`);

  patchQ(userId, pid, { errors: 0, coolUntil: null });
  return { text, model: p.model, provider: pid, providerName: p.name, failed: false };
}

// ═══════════════════════════════════════════════════════════════
// callAI — THE MAIN FUNCTION
// ═══════════════════════════════════════════════════════════════
export async function callAI({ messages, systemPrompt, maxTokens = 1500, userId, preferredProviderId }) {
  const uid = userId || "anonymous";
  let providers = await loadProviders();

  if (!providers.length) return _fallback([{ provider: "system", reason: "no providers configured" }]);

  // Pin preferred provider to front if specified
  if (preferredProviderId) {
    const pinned = providers.find(p => p.provider_id === preferredProviderId);
    if (pinned) providers = [pinned, ...providers.filter(p => p.provider_id !== preferredProviderId)];
  }

  const skipped = [];
  for (const p of providers) {
    const { ok, reason } = isAvail(p, uid);
    if (!ok) { skipped.push({ provider: p.name, reason }); console.info(`[AI] Skip ${p.name}: ${reason}`); continue; }
    try {
      console.info(`[AI] Trying ${p.name} (${p.model})...`);
      const result = await callOne(p, messages, systemPrompt, maxTokens, uid);
      console.info(`[AI] ✓ ${p.name}`);
      return result;
    } catch (e) {
      skipped.push({ provider: p.name, reason: e.message });
      console.warn(`[AI] ✗ ${p.name}: ${e.message}`);
    }
  }

  console.error("[AI] All failed:", skipped);
  return _fallback(skipped);
}

function _fallback(skipped) {
  return {
    text: "I'm having trouble connecting right now. All AI providers are temporarily unavailable or have no API key configured. Please check the AI Providers settings and try again.",
    model: "none", provider: "fallback", providerName: "Fallback", failed: true, skipped,
  };
}

// ═══════════════════════════════════════════════════════════════
// getProviderStatus — live health for all users
// ═══════════════════════════════════════════════════════════════
export async function getProviderStatus(userId) {
  const { data: all } = await supabase
    .from("ai_providers")
    .select("*")
    .order("priority", { ascending: true });
  if (!all) return [];
  const uid = userId || "anonymous";
  const now = Date.now();
  return all.map(p => {
    const q = getQ(uid, p.provider_id);
    const { ok, reason } = isAvail(p, uid);
    return {
      id:               p.id,
      providerId:       p.provider_id,
      name:             p.name,
      company:          p.company,
      model:            p.model,
      apiFormat:        p.api_format,
      priority:         p.priority,
      isEnabled:        p.is_enabled,
      isPaused:         p.is_paused,
      hasKey:           !!p.api_key?.trim(),
      available:        ok && p.is_enabled && !p.is_paused,
      unavailableReason: p.is_paused ? "paused" : !p.is_enabled ? "disabled" : ok ? null : reason,
      requestsToday:    q.day_count,
      maxPerDay:        p.max_requests_per_day,
      quotaPercent:     Math.min(100, Math.round((q.day_count / p.max_requests_per_day) * 100)),
      requestsThisMin:  q.min,
      maxPerMin:        p.max_requests_per_minute,
      coolingDown:      !!(q.coolUntil && now < q.coolUntil),
      cooldownSecsLeft: q.coolUntil && now < q.coolUntil ? Math.ceil((q.coolUntil - now) / 1000) : 0,
      errors:           q.errors,
      totalRequests:    q.total,
      totalFailures:    q.failures,
      successRate:      q.total > 0 ? Math.round(((q.total - q.failures) / q.total) * 100) : 100,
      notes:            p.notes,
    };
  });
}

// ═══════════════════════════════════════════════════════════════
// ADMIN — update provider (requires service role in production)
// For now uses anon key — add RLS policy if needed
// ═══════════════════════════════════════════════════════════════
export async function adminUpdateProvider(providerId, updates) {
  const { error } = await supabase
    .from("ai_providers")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("provider_id", providerId);
  invalidateProviderCache();
  return { error };
}

export async function adminToggleProvider(providerId, field, value) {
  const { error } = await supabase
    .from("ai_providers")
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq("provider_id", providerId);
  invalidateProviderCache();
  return { error };
}

export async function adminUpdatePriority(providerId, priority) {
  const { error } = await supabase
    .from("ai_providers")
    .update({ priority, updated_at: new Date().toISOString() })
    .eq("provider_id", providerId);
  invalidateProviderCache();
  return { error };
}

export async function adminAddProvider(data) {
  const { error } = await supabase.from("ai_providers").insert(data);
  invalidateProviderCache();
  return { error };
}

export async function adminDeleteProvider(providerId) {
  const { error } = await supabase.from("ai_providers").delete().eq("provider_id", providerId);
  invalidateProviderCache();
  return { error };
}

export function resetProviderQuota(userId, providerId) {
  patchQ(userId, providerId, { coolUntil: null, errors: 0, disabled: false, min: 0 });
}

export function resetAllQuotas(userId) {
  try { localStorage.removeItem(quotaKey(userId)); } catch {}
}

// ═══════════════════════════════════════════════════════════════
// analyzeChronicle
// ═══════════════════════════════════════════════════════════════
export async function analyzeChronicle(text, userId) {
  if (!text?.trim() || text.trim().length < 20)
    return { chaosScore: 0, emotionalTone: "neutral", themes: [], summary: "" };
  const sys = `You are a silent analyst. Return ONLY valid JSON, no markdown, no explanation.\nFormat: {"chaosScore":<0-100>,"emotionalTone":"<calm|anxious|motivated|frustrated|sad|excited|confused|neutral>","themes":["t1","t2","t3"],"summary":"<one sentence max 20 words>"}`;
  try {
    const r = await callAI({ messages: [{ role: "user", content: `Brain dump:\n\n${text.substring(0, 3000)}` }], systemPrompt: sys, maxTokens: 300, userId });
    if (r.failed) return { chaosScore: 0, emotionalTone: "neutral", themes: [], summary: "" };
    const parsed = JSON.parse(r.text.replace(/```json|```/gi, "").trim());
    return {
      chaosScore:    Math.min(100, Math.max(0, parseInt(parsed.chaosScore) || 0)),
      emotionalTone: parsed.emotionalTone || "neutral",
      themes:        Array.isArray(parsed.themes) ? parsed.themes.slice(0, 5) : [],
      summary:       parsed.summary || "",
    };
  } catch (e) { console.warn("[AI] analyzeChronicle failed:", e.message); return { chaosScore: 0, emotionalTone: "neutral", themes: [], summary: "" }; }
}

// ═══════════════════════════════════════════════════════════════
// Embeddings (Nomic — for RAG)
// ═══════════════════════════════════════════════════════════════
export async function embedText(text) {
  const key = import.meta.env.VITE_NOMIC_API_KEY;
  if (!key || !text?.trim()) return null;
  try {
    const res = await fetch("https://api-atlas.nomic.ai/v1/embedding/text", { method: "POST", headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ texts: [text.substring(0, 2000)], model: "nomic-embed-text-v1.5", task_type: "search_document" }) });
    return (await res.json()).embeddings?.[0] || null;
  } catch { return null; }
}

export async function embedQuery(query) {
  const key = import.meta.env.VITE_NOMIC_API_KEY;
  if (!key || !query?.trim()) return null;
  try {
    const res = await fetch("https://api-atlas.nomic.ai/v1/embedding/text", { method: "POST", headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ texts: [query], model: "nomic-embed-text-v1.5", task_type: "search_query" }) });
    return (await res.json()).embeddings?.[0] || null;
  } catch { return null; }
}

export function formatDuration(s) {
  if (s < 60)   return `${s}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
