// src/services/rag.js
// RAG — Retrieval Augmented Generation
// Searches Mo's chronicles semantically before every AI call

import { supabase } from "../supabase";

const NOMIC_KEY = import.meta.env.VITE_NOMIC_API_KEY;

// ── Embed a query string ──────────────────────────────────────────
async function embedQuery(text) {
  if (!NOMIC_KEY || !text?.trim()) return null;
  try {
    const res = await fetch("https://api-atlas.nomic.ai/v1/embedding/text", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOMIC_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        texts:     [text.slice(0, 1000)],
        model:     "nomic-embed-text-v1.5",
        task_type: "search_query",
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.embeddings?.[0] || null;
  } catch { return null; }
}

// ── Search chronicles via pgvector ────────────────────────────────
export async function ragSearch(userId, query, { threshold = 0.65, limit = 4 } = {}) {
  if (!userId || !query?.trim()) return [];

  const embedding = await embedQuery(query);
  if (!embedding) return [];

  const { data, error } = await supabase.rpc("match_chronicles", {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count:     limit,
    p_user_id:       userId,
  });

  if (error) { console.warn("[RAG] Search failed:", error.message); return []; }
  return data || [];
}

// ── Format RAG results for system prompt injection ────────────────
export function formatRAGResults(results) {
  if (!results?.length) return "";
  return `
═══════════════════════════════════════════
SEMANTICALLY RELEVANT CHRONICLES
(Retrieved from Mo's archive — most relevant to this conversation)
═══════════════════════════════════════════
${results.map((r, i) => {
  const date      = new Date(r.created_at).toLocaleDateString([], { weekday:"short", month:"short", day:"numeric" });
  const title     = r.title || r.ai_summary || "Untitled";
  const preview   = r.text?.slice(0, 300) || "";
  const chaos     = r.chaos_score > 0 ? ` · Chaos: ${r.chaos_score}/100` : "";
  const tone      = r.emotional_tone && r.emotional_tone !== "neutral" ? ` · Tone: ${r.emotional_tone}` : "";
  const themes    = r.themes?.length ? ` · Themes: ${r.themes.slice(0,3).join(", ")}` : "";
  const sim       = r.similarity ? ` · Relevance: ${Math.round(r.similarity * 100)}%` : "";
  return `[${i+1}] ${date} — "${title}"${chaos}${tone}${themes}${sim}
${preview}${r.text?.length > 300 ? "…" : ""}`;
}).join("\n\n")}

Reference these when directly relevant. Say "In your chronicle from [date]..." 
Do not force references — only use when genuinely relevant to the question.`;
}

// ── Embed a new chronicle on save ─────────────────────────────────
export async function embedChronicle(chronicleId, text, title, themes, summary) {
  if (!NOMIC_KEY) return;
  const combined = [title, summary, (themes||[]).join(" "), text].filter(Boolean).join(" ").trim();
  if (!combined || combined.length < 10) return;

  try {
    const res = await fetch("https://api-atlas.nomic.ai/v1/embedding/text", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOMIC_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        texts:     [combined.slice(0, 2000)],
        model:     "nomic-embed-text-v1.5",
        task_type: "search_document",
      }),
    });
    if (!res.ok) return;
    const data = await res.json();
    const embedding = data.embeddings?.[0];
    if (!embedding) return;

    await supabase
      .from("chronicles")
      .update({ embedding })
      .eq("id", chronicleId);
  } catch (e) {
    console.warn("[RAG] Embed failed:", e.message);
  }
}
