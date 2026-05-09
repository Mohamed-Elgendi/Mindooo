// ─────────────────────────────────────────────────────────────────
// services/ai.js
// THE ONLY FILE THAT CALLS AI APIS.
//
// Contains:
//   PROVIDER_REGISTRY   — all AI providers, one config card each
//   Quota Manager       — tracks usage, cooldowns, errors per provider
//   callAI()            — smart failover loop, returns first success
//   getProviderStatus() — exposes provider health for UI display
//   resetProvider()     — manual recovery tool
//   analyzeChronicle()  — silent AI analysis of brain dumps
//   formatDuration()    — utility for focus session display
//   embedText()         — embed text for RAG (future)
//   embedQuery()        — embed a search query for RAG (future)
// ─────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════
// PROVIDER REGISTRY
// To add a new provider: add one object here. Nothing else changes.
// ═══════════════════════════════════════════════════════════════════

export const PROVIDER_REGISTRY = [

  // ── TIER 1: Primary (tried first) ────────────────────────────────
  {
    id: 'groq',
    name: 'Groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    envKey: 'VITE_GROQ_API_KEY',
    format: 'openai',
    priority: 1,
    maxRequestsPerMinute: 30,
    maxRequestsPerDay: 14400,
    maxTokensPerRequest: 8000,
    cooldownOnRateLimit: 62,
    cooldownOnError: 15,
    browserSafe: true,
    free: true,
    quality: 'high',
    enabled: true,
  },

  // ── TIER 2: Secondary (tried if Tier 1 fails) ────────────────────
  {
    id: 'openrouter',
    name: 'OpenRouter',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    envKey: 'VITE_OPENROUTER_API_KEY',
    format: 'openai',
    priority: 2,
    maxRequestsPerMinute: 20,
    maxRequestsPerDay: 200,
    maxTokensPerRequest: 8000,
    cooldownOnRateLimit: 65,
    cooldownOnError: 20,
    browserSafe: true,
    free: true,
    quality: 'high',
    enabled: true,
  },

  {
    id: 'deepseek',
    name: 'DeepSeek',
    url: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    envKey: 'VITE_DEEPSEEK_API_KEY',
    format: 'openai',
    priority: 3,
    maxRequestsPerMinute: 60,
    maxRequestsPerDay: 1000,
    maxTokensPerRequest: 64000,
    cooldownOnRateLimit: 62,
    cooldownOnError: 15,
    browserSafe: true,
    free: false,
    quality: 'high',
    enabled: true,
  },

  // ── TIER 3: Additional fallbacks ─────────────────────────────────
  {
    id: 'mistral',
    name: 'Mistral',
    url: 'https://api.mistral.ai/v1/chat/completions',
    model: 'mistral-small-latest',
    envKey: 'VITE_MISTRAL_API_KEY',
    format: 'openai',
    priority: 4,
    maxRequestsPerMinute: 60,
    maxRequestsPerDay: 1000,
    maxTokensPerRequest: 32000,
    cooldownOnRateLimit: 62,
    cooldownOnError: 15,
    browserSafe: true,
    free: false,
    quality: 'medium',
    enabled: true,
  },

  {
    id: 'qwen',
    name: 'Qwen (Alibaba)',
    url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    model: 'qwen-plus',
    envKey: 'VITE_QWEN_API_KEY',
    format: 'openai',
    priority: 5,
    maxRequestsPerMinute: 60,
    maxRequestsPerDay: 1000,
    maxTokensPerRequest: 30000,
    cooldownOnRateLimit: 62,
    cooldownOnError: 15,
    browserSafe: true,
    free: false,
    quality: 'medium',
    enabled: true,
  },

  {
    id: 'openrouter_qwen',
    name: 'OpenRouter (Qwen Free)',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'qwen/qwen-2.5-72b-instruct:free',
    envKey: 'VITE_OPENROUTER_API_KEY',
    format: 'openai',
    priority: 6,
    maxRequestsPerMinute: 10,
    maxRequestsPerDay: 100,
    maxTokensPerRequest: 8000,
    cooldownOnRateLimit: 70,
    cooldownOnError: 20,
    browserSafe: true,
    free: true,
    quality: 'medium',
    enabled: true,
  },

  {
    id: 'openrouter_mistral',
    name: 'OpenRouter (Mistral Free)',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'mistralai/mistral-7b-instruct:free',
    envKey: 'VITE_OPENROUTER_API_KEY',
    format: 'openai',
    priority: 7,
    maxRequestsPerMinute: 10,
    maxRequestsPerDay: 100,
    maxTokensPerRequest: 8000,
    cooldownOnRateLimit: 70,
    cooldownOnError: 20,
    browserSafe: true,
    free: true,
    quality: 'low',
    enabled: true,
  },
];

// ═══════════════════════════════════════════════════════════════════
// QUOTA MANAGER
// Tracks per-provider usage in localStorage.
// Persists across page reloads. Resets automatically by time.
// ═══════════════════════════════════════════════════════════════════

const QUOTA_KEY = 'mindoo_quota';

function getQuotaState() {
  try {
    const raw = localStorage.getItem(QUOTA_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveQuotaState(state) {
  try {
    localStorage.setItem(QUOTA_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable — degrade gracefully
  }
}

function getProviderState(providerId) {
  const state = getQuotaState();
  const now = Date.now();
  const today = new Date().toDateString();
  const existing = state[providerId] || {};

  // Reset minute counter if more than 60 seconds since last request
  const minuteReset = (now - (existing.lastRequestAt || 0)) > 60000;

  // Reset day counter if it's a new calendar day
  const dayReset = existing.lastDay !== today;

  return {
    requestsThisMinute: minuteReset ? 0 : (existing.requestsThisMinute || 0),
    requestsToday:      dayReset    ? 0 : (existing.requestsToday      || 0),
    lastRequestAt:      existing.lastRequestAt    || 0,
    lastDay:            dayReset ? today : (existing.lastDay || today),
    coolingDownUntil:   existing.coolingDownUntil || null,
    consecutiveErrors:  existing.consecutiveErrors || 0,
    totalRequests:      existing.totalRequests     || 0,
    totalFailures:      existing.totalFailures     || 0,
    lastFailureReason:  existing.lastFailureReason || null,
    disabledForSession: existing.disabledForSession || false,
  };
}

function updateProviderState(providerId, update) {
  const state = getQuotaState();
  state[providerId] = { ...getProviderState(providerId), ...update };
  saveQuotaState(state);
}

// ═══════════════════════════════════════════════════════════════════
// AVAILABILITY CHECK
// Returns { available: true } or { available: false, reason: '...' }
// ═══════════════════════════════════════════════════════════════════

function isProviderAvailable(provider) {
  if (!provider.enabled) {
    return { available: false, reason: 'disabled in config' };
  }

  const key = import.meta.env[provider.envKey];
  if (!key) {
    return { available: false, reason: 'no API key in .env.local' };
  }

  const ps = getProviderState(provider.id);
  const now = Date.now();

  if (ps.disabledForSession) {
    return { available: false, reason: 'auth failed this session — check API key' };
  }

  if (ps.coolingDownUntil && now < ps.coolingDownUntil) {
    const secsLeft = Math.ceil((ps.coolingDownUntil - now) / 1000);
    return { available: false, reason: `cooling down — ${secsLeft}s remaining` };
  }

  if (ps.requestsThisMinute >= provider.maxRequestsPerMinute) {
    return { available: false, reason: 'minute quota reached' };
  }

  if (ps.requestsToday >= provider.maxRequestsPerDay) {
    return { available: false, reason: 'daily quota reached' };
  }

  return { available: true };
}

// ═══════════════════════════════════════════════════════════════════
// SINGLE PROVIDER CALL
// Calls one provider. Handles all error types. Updates quota state.
// Throws on failure so the main loop can try the next provider.
// ═══════════════════════════════════════════════════════════════════

async function callProvider(provider, messages, systemPrompt, maxTokens) {
  const key = import.meta.env[provider.envKey];
  const now = Date.now();
  const ps  = getProviderState(provider.id);

  // Record the attempt immediately
  updateProviderState(provider.id, {
    requestsThisMinute: ps.requestsThisMinute + 1,
    requestsToday:      ps.requestsToday      + 1,
    lastRequestAt:      now,
    totalRequests:      ps.totalRequests      + 1,
  });

  const headers = {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${key}`,
  };

  // OpenRouter requires these extra headers
  if (provider.id === 'openrouter' || provider.id.startsWith('openrouter_')) {
    headers['HTTP-Referer'] = 'https://axis-app-kappa.vercel.app';
    headers['X-Title']      = 'Mindoo';
  }

  const body = {
    model:       provider.model,
    max_tokens:  maxTokens,
    temperature: 0.7,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
  };

  let response;
  try {
    response = await fetch(provider.url, {
      method:  'POST',
      headers,
      body:    JSON.stringify(body),
    });
  } catch (networkErr) {
    // Network-level failure (offline, DNS, etc.)
    const cur = getProviderState(provider.id);
    updateProviderState(provider.id, {
      coolingDownUntil:  now + (provider.cooldownOnError * 1000),
      consecutiveErrors: cur.consecutiveErrors + 1,
      totalFailures:     cur.totalFailures     + 1,
      lastFailureReason: 'network error',
    });
    throw new Error(`${provider.name}: network error`);
  }

  if (!response.ok) {
    const cur = getProviderState(provider.id);

    if (response.status === 429) {
      updateProviderState(provider.id, {
        coolingDownUntil:  now + (provider.cooldownOnRateLimit * 1000),
        consecutiveErrors: cur.consecutiveErrors + 1,
        totalFailures:     cur.totalFailures     + 1,
        lastFailureReason: '429 rate limited',
      });
      throw new Error(`${provider.name}: 429 rate limited`);
    }

    if (response.status === 401 || response.status === 403) {
      updateProviderState(provider.id, {
        disabledForSession: true,
        totalFailures:      cur.totalFailures + 1,
        lastFailureReason:  `${response.status} auth failed`,
      });
      throw new Error(`${provider.name}: ${response.status} auth failed`);
    }

    if (response.status >= 500) {
      updateProviderState(provider.id, {
        coolingDownUntil:  now + (provider.cooldownOnError * 1000),
        consecutiveErrors: cur.consecutiveErrors + 1,
        totalFailures:     cur.totalFailures     + 1,
        lastFailureReason: `${response.status} server error`,
      });
      throw new Error(`${provider.name}: ${response.status} server error`);
    }

    throw new Error(`${provider.name}: ${response.status} unexpected error`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`${provider.name}: invalid JSON response`);
  }

  const text = data?.choices?.[0]?.message?.content || '';
  if (!text.trim()) {
    throw new Error(`${provider.name}: empty response`);
  }

  // Success — reset error counters for this provider
  updateProviderState(provider.id, {
    consecutiveErrors: 0,
    coolingDownUntil:  null,
  });

  return {
    text,
    model:        provider.model,
    provider:     provider.id,
    providerName: provider.name,
    failed:       false,
  };
}

// ═══════════════════════════════════════════════════════════════════
// callAI — THE MAIN FUNCTION
// Smart failover loop. Tries providers in priority order.
// Skips unavailable ones. Returns first success.
// Components call this — never individual providers directly.
// ═══════════════════════════════════════════════════════════════════

export async function callAI({ messages, systemPrompt, maxTokens = 1000 }) {
  const sorted  = [...PROVIDER_REGISTRY].sort((a, b) => a.priority - b.priority);
  const skipped = [];

  for (const provider of sorted) {
    const { available, reason } = isProviderAvailable(provider);

    if (!available) {
      skipped.push({ provider: provider.name, reason });
      console.info(`[AI] Skipping ${provider.name}: ${reason}`);
      continue;
    }

    try {
      console.info(`[AI] Trying ${provider.name} (${provider.model})...`);
      const result = await callProvider(provider, messages, systemPrompt, maxTokens);
      console.info(`[AI] ✓ ${provider.name} responded successfully`);
      return result;
    } catch (err) {
      skipped.push({ provider: provider.name, reason: err.message });
      console.warn(`[AI] ✗ ${provider.name} failed: ${err.message}`);
      // Continue to next provider
    }
  }

  // All providers exhausted
  console.error('[AI] All providers failed or unavailable:', skipped);
  return {
    text:         "I'm having trouble connecting right now. All AI providers are temporarily unavailable. Your data is safe — please try again in a minute.",
    model:        'none',
    provider:     'fallback',
    providerName: 'Fallback',
    failed:       true,
    skipped,
  };
}

// ═══════════════════════════════════════════════════════════════════
// getProviderStatus
// Returns health data for every provider — used by UI status dots.
// ═══════════════════════════════════════════════════════════════════

export function getProviderStatus() {
  return PROVIDER_REGISTRY.map(provider => {
    const { available, reason } = isProviderAvailable(provider);
    const ps     = getProviderState(provider.id);
    const hasKey = !!import.meta.env[provider.envKey];

    return {
      id:               provider.id,
      name:             provider.name,
      model:            provider.model,
      priority:         provider.priority,
      available,
      reason:           available ? null : reason,
      hasKey,
      requestsToday:    ps.requestsToday,
      maxPerDay:        provider.maxRequestsPerDay,
      quotaPercent:     Math.min(100, Math.round((ps.requestsToday / provider.maxRequestsPerDay) * 100)),
      coolingDown:      !!(ps.coolingDownUntil && Date.now() < ps.coolingDownUntil),
      consecutiveErrors: ps.consecutiveErrors,
      totalRequests:    ps.totalRequests,
      free:             provider.free,
      quality:          provider.quality,
    };
  });
}

// ═══════════════════════════════════════════════════════════════════
// resetProvider
// Manual recovery — clears cooldown and error state for one provider.
// Call from Settings page if a provider was wrongly disabled.
// ═══════════════════════════════════════════════════════════════════

export function resetProvider(providerId) {
  updateProviderState(providerId, {
    coolingDownUntil:   null,
    consecutiveErrors:  0,
    disabledForSession: false,
    lastFailureReason:  null,
  });
  console.info(`[AI] Provider ${providerId} manually reset`);
}

// ═══════════════════════════════════════════════════════════════════
// resetAllProviders
// Nuclear option — wipe all quota state and start fresh.
// ═══════════════════════════════════════════════════════════════════

export function resetAllProviders() {
  try {
    localStorage.removeItem(QUOTA_KEY);
    console.info('[AI] All provider states reset');
  } catch {
    // ignore
  }
}

// ═══════════════════════════════════════════════════════════════════
// analyzeChronicle
// Silent AI analysis of a brain dump.
// Called by BrainDump.jsx after every save.
// Returns: chaos score, emotional tone, themes, summary.
// Uses the smart failover — never blocks the save if AI is down.
// ═══════════════════════════════════════════════════════════════════

export async function analyzeChronicle(text) {
  if (!text || text.trim().length < 20) {
    return {
      chaosScore:    0,
      emotionalTone: 'neutral',
      themes:        [],
      summary:       '',
    };
  }

  const systemPrompt = `You are a silent background analyst. Analyse the brain dump below.
Return ONLY a JSON object — no explanation, no markdown, no extra text.

Required format:
{
  "chaosScore": <integer 0-100>,
  "emotionalTone": "<one word: calm|anxious|motivated|frustrated|sad|excited|confused|neutral>",
  "themes": ["<theme1>", "<theme2>", "<theme3>"],
  "summary": "<one sentence, max 20 words>"
}`;

  const messages = [
    { role: 'user', content: `Brain dump to analyse:\n\n${text.substring(0, 3000)}` },
  ];

  try {
    const result = await callAI({ messages, systemPrompt, maxTokens: 300 });

    if (result.failed) {
      return { chaosScore: 0, emotionalTone: 'neutral', themes: [], summary: '' };
    }

    // Strip markdown fences if the model added them despite instructions
    const clean = result.text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(clean);

    return {
      chaosScore:    Math.min(100, Math.max(0, parseInt(parsed.chaosScore) || 0)),
      emotionalTone: parsed.emotionalTone || 'neutral',
      themes:        Array.isArray(parsed.themes) ? parsed.themes.slice(0, 5) : [],
      summary:       parsed.summary || '',
    };
  } catch (err) {
    console.warn('[AI] analyzeChronicle failed:', err.message);
    return { chaosScore: 0, emotionalTone: 'neutral', themes: [], summary: '' };
  }
}

// ═══════════════════════════════════════════════════════════════════
// embedText + embedQuery
// Convert text into vectors for RAG search.
// Requires VITE_NOMIC_API_KEY in .env.local
// Failures are always silent — never block a save or a chat response.
// ═══════════════════════════════════════════════════════════════════

export async function embedText(text) {
  const key = import.meta.env.VITE_NOMIC_API_KEY;
  if (!key || !text?.trim()) return null;

  try {
    const response = await fetch('https://api-atlas.nomic.ai/v1/embedding/text', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        texts:     [text.substring(0, 2000)],
        model:     'nomic-embed-text-v1.5',
        task_type: 'search_document',
      }),
    });
    if (!response.ok) throw new Error('Nomic embed failed');
    const data = await response.json();
    return data.embeddings?.[0] || null;
  } catch (err) {
    console.warn('[AI] embedText failed:', err.message);
    return null;
  }
}

export async function embedQuery(query) {
  const key = import.meta.env.VITE_NOMIC_API_KEY;
  if (!key || !query?.trim()) return null;

  try {
    const response = await fetch('https://api-atlas.nomic.ai/v1/embedding/text', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        texts:     [query],
        model:     'nomic-embed-text-v1.5',
        task_type: 'search_query',
      }),
    });
    if (!response.ok) throw new Error('Nomic query embed failed');
    const data = await response.json();
    return data.embeddings?.[0] || null;
  } catch (err) {
    console.warn('[AI] embedQuery failed:', err.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════
// formatDuration
// Utility for focus session time display.
// ═══════════════════════════════════════════════════════════════════

export function formatDuration(seconds) {
  if (seconds < 60)   return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
