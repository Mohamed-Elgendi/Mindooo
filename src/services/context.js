// src/services/context.js v2
// Context engine + RAG — loads personal data AND searches chronicles semantically

import { supabase }                    from "../supabase";
import { ragSearch, formatRAGResults } from "./rag";

// ── Short cache (60 seconds) ──────────────────────────────────────
const _ctx = {};
function cacheGet(key) {
  const c = _ctx[key];
  if (!c) return undefined;
  if (Date.now() - c.at > 60_000) { delete _ctx[key]; return undefined; }
  return c.data;
}
function cacheSet(key, data) { _ctx[key] = { data, at: Date.now() }; }

// ── Data loaders ──────────────────────────────────────────────────
async function loadAboutMe(userId) {
  const k = `about_${userId}`;
  const cached = cacheGet(k);
  if (cached !== undefined) return cached;
  const { data } = await supabase.from("user_about_me").select("*").eq("user_id", userId).single();
  cacheSet(k, data || null);
  return data || null;
}

async function loadCognitiveProfile(userId) {
  const k = `cog_${userId}`;
  const cached = cacheGet(k);
  if (cached !== undefined) return cached;
  const { data } = await supabase.from("cognitive_profile").select("*").eq("user_id", userId).single();
  cacheSet(k, data || null);
  return data || null;
}

async function loadStats(userId) {
  const k = `stats_${userId}`;
  const cached = cacheGet(k);
  if (cached !== undefined) return cached;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const iso = weekAgo.toISOString();

  const [cRes, fRes, aRes] = await Promise.all([
    supabase.from("chronicles").select("id,created_at,chaos_score").eq("user_id", userId).gte("created_at", iso),
    supabase.from("focus_sessions").select("actual_secs,created_at").eq("user_id", userId).gte("created_at", iso),
    supabase.from("chronicles").select("*", { count:"exact", head:true }).eq("user_id", userId),
  ]);

  const chronicles = cRes.data || [];
  const focus      = fRes.data || [];
  const avgChaos   = chronicles.length
    ? Math.round(chronicles.reduce((s,c) => s+(c.chaos_score||0),0) / chronicles.length)
    : 0;

  const stats = {
    dumpsThisWeek:     chronicles.length,
    focusMinsThisWeek: Math.round(focus.reduce((s,f) => s+(f.actual_secs||0),0) / 60),
    totalChronicles:   aRes.count || 0,
    clarityScore:      Math.max(0, 100 - avgChaos),
    avgChaosScore:     avgChaos,
  };
  cacheSet(k, stats);
  return stats;
}

async function loadRecentChronicles(userId, limit = 5) {
  const k = `recent_${userId}`;
  const cached = cacheGet(k);
  if (cached !== undefined) return cached;
  const { data } = await supabase
    .from("chronicles")
    .select("title,text,ai_summary,chaos_score,emotional_tone,themes,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  const result = data || [];
  cacheSet(k, result);
  return result;
}

// ── Formatters ────────────────────────────────────────────────────
function formatAboutMe(about) {
  if (!about) return "About Me profile: not yet completed — encourage Mo to fill it in at /about-me.";
  const s = [];
  if (about.employment_status || about.location)
    s.push(`SITUATION: ${[about.employment_status, about.location, about.living_situation].filter(Boolean).join(" · ")}`);
  if (about.main_constraints?.length)
    s.push(`CONSTRAINTS: ${about.main_constraints.join(", ")}`);
  if (about.work_preference || about.learning_style)
    s.push(`PERSONALITY: Works ${about.work_preference||"?"} · Learns by ${about.learning_style||"?"} · Decides via ${about.decision_style||"?"}`);
  if (about.peak_hours)
    s.push(`ENERGY PEAKS: ${about.peak_hours}`);
  if (about.love_doing?.length || about.good_at?.length)
    s.push(`IKIGAI: Loves: ${about.love_doing?.slice(0,3).join(", ")||"not mapped"} · Good at: ${about.good_at?.slice(0,3).join(", ")||"not mapped"}`);
  if (about.ikigai_statement)
    s.push(`IKIGAI STATEMENT: ${about.ikigai_statement}`);
  if (about.top_values?.length)
    s.push(`VALUES: ${about.top_values.slice(0,5).join(", ")}`);
  if (about.freedom_definition)
    s.push(`FREEDOM MEANS: ${about.freedom_definition}`);

  const blockers = [];
  if (about.mental_blockers?.length)        blockers.push(`Mental: ${about.mental_blockers.slice(0,3).join(", ")}`);
  if (about.psychological_blockers?.length) blockers.push(`Psychological: ${about.psychological_blockers.slice(0,3).join(", ")}`);
  if (about.financial_blockers?.length)     blockers.push(`Financial: ${about.financial_blockers.slice(0,3).join(", ")}`);
  if (about.limiting_beliefs?.length)       blockers.push(`Limiting beliefs: ${about.limiting_beliefs.slice(0,3).join(", ")}`);
  if (blockers.length) s.push(`ACTIVE BLOCKERS:\n  ${blockers.join("\n  ")}`);

  if (about.dream_no_constraints) s.push(`DREAM: ${about.dream_no_constraints}`);
  if (about.known_difficulties?.length) s.push(`KNOWN DIFFICULTIES: ${about.known_difficulties.join(", ")}`);
  return s.join("\n");
}

function formatRecentChronicles(chronicles) {
  if (!chronicles.length) return "No brain dumps this week yet.";
  return chronicles.map((c, i) => {
    const date    = new Date(c.created_at).toLocaleDateString([], { weekday:"short", month:"short", day:"numeric" });
    const title   = c.title || c.ai_summary || "Untitled";
    const preview = c.text?.slice(0, 180) || "(voice note)";
    const chaos   = c.chaos_score > 0 ? ` · Chaos: ${c.chaos_score}/100` : "";
    const tone    = c.emotional_tone && c.emotional_tone !== "neutral" ? ` · Tone: ${c.emotional_tone}` : "";
    const themes  = c.themes?.length ? ` · Themes: ${c.themes.slice(0,3).join(", ")}` : "";
    return `[${i+1}] ${date} — "${title}"${chaos}${tone}${themes}\n${preview}${c.text?.length > 180 ? "…" : ""}`;
  }).join("\n\n");
}

function formatCognitive(cog) {
  if (!cog) return "";
  const parts = [];
  if (cog.attention_score)            parts.push(`Attention: ${cog.attention_score}/100`);
  if (cog.memory_score)               parts.push(`Memory: ${cog.memory_score}/100`);
  if (cog.processing_score)           parts.push(`Processing: ${cog.processing_score}/100`);
  if (cog.best_focus_hour)            parts.push(`Peak focus: ${cog.best_focus_hour}:00`);
  if (cog.known_difficulties?.length) parts.push(`Difficulties: ${cog.known_difficulties.join(", ")}`);
  return parts.length ? `COGNITIVE PROFILE: ${parts.join(" · ")}` : "";
}

// ── buildContext — main export ────────────────────────────────────
// Call with query to also run RAG search
export async function buildContext(userId, query = null) {
  if (!userId) return { stats: null };

  // Load static data + optionally run RAG in parallel
  const promises = [
    loadAboutMe(userId),
    loadCognitiveProfile(userId),
    loadStats(userId),
    loadRecentChronicles(userId, 5),
  ];

  // Run RAG search if we have a query
  if (query?.trim()) {
    promises.push(ragSearch(userId, query, { threshold: 0.62, limit: 4 }));
  }

  const [aboutMe, cognitive, stats, recentChronicles, ragResults = []] = await Promise.all(promises);

  return {
    aboutMe,
    cognitive,
    stats,
    recentChronicles,
    ragResults,
    // Pre-formatted text blocks for system prompt
    aboutMeText:            formatAboutMe(aboutMe),
    cognitiveText:          formatCognitive(cognitive),
    recentChroniclesText:   formatRecentChronicles(recentChronicles),
    ragText:                formatRAGResults(ragResults),
  };
}

// ── buildFullSystemPrompt ─────────────────────────────────────────
export function buildFullSystemPrompt(context, engineId, firstName, engineMap) {
  const name = firstName || "Boss";
  const {
    aboutMeText          = "",
    cognitiveText        = "",
    recentChroniclesText = "",
    ragText              = "",
    stats                = null,
  } = context || {};

  const statsText = stats ? `
PERFORMANCE THIS WEEK:
  Focus: ${((stats.focusMinsThisWeek||0)/60).toFixed(1)}h · Brain Dumps: ${stats.dumpsThisWeek||0} · Total Chronicles: ${stats.totalChronicles||0} · Clarity: ${stats.clarityScore||0}%`
  : "";

  const engineSection = engineId && engineMap?.[engineId]
    ? `\n═══════════════════════════════════════════\nACTIVE ENGINE — ${engineId}: ${engineMap[engineId].name}\n═══════════════════════════════════════════\n${engineMap[engineId].prompt}`
    : "";

  // RAG section — only include if we found relevant chronicles
  const ragSection = ragText
    ? `\n${ragText}`
    : "";

  return `You are Mindoo — ${name}'s personal life intelligence system.
You are NOT a generic AI. Every response must be grounded in ${name}'s real data shown below.

═══════════════════════════════════════════
RESPONSE QUALITY MANDATE — NON-NEGOTIABLE
═══════════════════════════════════════════
1. COMPREHENSIVE — cover the topic fully, match depth to complexity
2. SCIENCE-BASED — cite psychology, neuroscience, coaching research
3. PERSONALLY SPECIFIC — reference ${name}'s real data below, never generic
4. DEEPLY INSIGHTFUL — name the pattern ${name} hasn't named yet
5. ACTIONABLE — end with ONE clear specific next step
6. HONEST — if you lack data, ask ONE question. Never invent patterns.
7. WARM & DIRECT — trusted advisor, not a chatbot

═══════════════════════════════════════════
${name.toUpperCase()}'S PERSONAL PROFILE
═══════════════════════════════════════════
${aboutMeText}

${cognitiveText}
${statsText}

═══════════════════════════════════════════
${name.toUpperCase()}'S RECENT BRAIN DUMPS (last 5)
═══════════════════════════════════════════
${recentChroniclesText}
${ragSection}
${engineSection}

═══════════════════════════════════════════
PERMANENT RULES
═══════════════════════════════════════════
1. Never give a response that could be given to anyone else.
2. Every recommendation cites its scientific basis.
3. Challenge ${name} when needed — with evidence, not flattery.
4. If lacking data, ask ONE specific question.
5. Never invent patterns — only reference what is real.
6. End every response with ONE clear, specific, achievable next action.
7. You are the most intelligent, most personalised advisor ${name} has ever had.`;
}

// ── Invalidate cache ──────────────────────────────────────────────
export function invalidateContext(userId) {
  Object.keys(_ctx).forEach(k => { if (k.includes(userId)) delete _ctx[k]; });
}
