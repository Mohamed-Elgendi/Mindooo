// ─────────────────────────────────────────────────────────────────
// ai.js — AI Analysis Service
//
// All Claude API calls for analysis live here.
// Separate from the chat service — this is background intelligence,
// not conversation.
// ─────────────────────────────────────────────────────────────────

/**
 * Analyze a brain dump text with Claude.
 * Returns chaos score, emotional tone, themes, urgency signals, summary.
 * Called silently when user saves a chronicle.
 */
export async function analyzeChronicle(text) {
  // Don't analyze very short dumps
  if (!text || text.trim().length < 20) {
    return defaultAnalysis();
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":                              "application/json",
        "anthropic-version":                         "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
        "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY || "",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: `You are a cognitive analysis engine. Analyze brain dump text and return ONLY valid JSON. No prose, no markdown, no explanation.`,
        messages: [{
          role: "user",
          content: `Analyze this brain dump and return ONLY this JSON structure:
{
  "chaosScore": <integer 0-100, higher = more chaotic/anxious>,
  "emotionalTone": <one word: calm|focused|anxious|overwhelmed|excited|sad|angry|neutral>,
  "urgencySignals": <array of up to 3 strings that signal urgency>,
  "themes": <array of up to 3 one-word themes like: work|health|relationships|finances|creativity|personal>,
  "summary": <one sentence summary under 12 words>
}

Brain dump text:
"""
${text.substring(0, 1000)}
"""`,
        }],
      }),
    });

    const data   = await response.json();
    const raw    = data?.content?.[0]?.text ?? "";
    const clean  = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return {
      chaosScore:     clamp(parseInt(parsed.chaosScore) || 50, 0, 100),
      emotionalTone:  parsed.emotionalTone  || "neutral",
      urgencySignals: Array.isArray(parsed.urgencySignals) ? parsed.urgencySignals.slice(0,3) : [],
      themes:         Array.isArray(parsed.themes)         ? parsed.themes.slice(0,3)         : [],
      summary:        parsed.summary || "",
    };

  } catch {
    // Analysis is bonus — never block a save because of it
    return defaultAnalysis();
  }
}

function defaultAnalysis() {
  return {
    chaosScore:     50,
    emotionalTone:  "neutral",
    urgencySignals: [],
    themes:         [],
    summary:        "",
  };
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Format elapsed seconds into human-readable duration.
 * Used for focus session display.
 */
export function formatDuration(seconds) {
  if (seconds < 60)   return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}