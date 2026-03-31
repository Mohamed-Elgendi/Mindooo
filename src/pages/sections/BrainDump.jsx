// ─────────────────────────────────────────────────────────────────
// BrainDump.jsx — Brain Dump Sanctuary
// Real saves to Supabase. AI analysis on every save.
// Real chronicle history loaded on mount.
// ─────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import { Icon } from "../../components/Icons";
import { saveChronicle, loadChronicles } from "../../services/db";
import { analyzeChronicle } from "../../services/ai";

function formatDate(isoString) {
  const d = new Date(isoString);
  const now = new Date();
  const diff = now - d;
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (mins < 2)    return "Just now";
  if (mins < 60)   return `${mins} minutes ago`;
  if (hours < 24)  return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days === 1)  return "Yesterday";
  if (days < 7)    return `${days} days ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function chaosColor(score) {
  if (score < 30) return "#4ade80";
  if (score < 60) return "#fbbf24";
  if (score < 80) return "#f97316";
  return "#f87171";
}

function toneEmoji(tone) {
  const map = {
    calm: "😌", focused: "🎯", anxious: "😰",
    overwhelmed: "😩", excited: "🔥", sad: "😔",
    angry: "😤", neutral: "😐",
  };
  return map[tone] || "😐";
}

export function BrainDump({ userId, onChronicleAdded }) {
  const [text,       setText]       = useState("");
  const [chronicles, setChronicles] = useState([]);
  const [status,     setStatus]     = useState("idle"); // idle | saving | analyzing | saved | error
  const [errorMsg,   setErrorMsg]   = useState("");
  const [expanded,   setExpanded]   = useState(null);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  // Load chronicles on mount
  useEffect(() => {
    if (!userId) return;
    loadChronicles(userId, 15).then(({ data }) => {
      setChronicles(data);
    });
  }, [userId]);

  const handleSave = useCallback(async () => {
    if (!text.trim() || !userId) return;

    setStatus("saving");
    setErrorMsg("");

    try {
      // Step 1: Analyze with AI (background — doesn't block save)
      setStatus("analyzing");
      const analysis = await analyzeChronicle(text);

      // Step 2: Save to Supabase
      setStatus("saving");
      const { data, error } = await saveChronicle({
        userId,
        text:      text.trim(),
        wordCount,
        analysis,
      });

      if (error) throw error;

      // Step 3: Update local state
      setChronicles(prev => [data, ...prev]);
      setText("");
      setStatus("saved");
      onChronicleAdded?.(); // notify parent to refresh KPIs

      // Reset status after 2.5s
      setTimeout(() => setStatus("idle"), 2500);

    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Save failed. Try again.");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }, [text, userId, wordCount, onChronicleAdded]);

  const statusLabel = {
    idle:      <><Icon name="archive" size={13} color="#fff" /> Save Chronicle</>,
    saving:    "Saving…",
    analyzing: "Analysing…",
    saved:     <><Icon name="check" size={13} color="#4ade80" /> Saved</>,
    error:     "Error — try again",
  };

  const btnClass = {
    idle:      "btn btn-primary",
    saving:    "btn btn-ghost",
    analyzing: "btn btn-ghost",
    saved:     "btn btn-success",
    error:     "btn btn-danger",
  };

  return (
    <div className="section-scroll">
      <div className="section-content">

        {/* Header */}
        <div className="section-eyebrow">Module · Capture</div>
        <h1 className="section-heading gradient-text">Brain Dump Sanctuary</h1>
        <p className="section-subheading">
          Zero friction. Zero judgment. Zero organization needed. Just empty your mind.
        </p>

        {/* Dump textarea */}
        <textarea
          className="dump-textarea"
          rows={9}
          placeholder={"Start typing anything that's in your head…\n\ngroceries, that thing Sarah said, project deadline, feeling weird about the meeting, need to call mom, taxes — TAXES, why am I tired…\n\nNo rules. No formatting. Just get it out."}
          value={text}
          onChange={e => setText(e.target.value)}
        />

        {/* Error message */}
        {errorMsg && (
          <div className="alert alert-error" style={{ marginBottom: 12 }}>
            {errorMsg}
          </div>
        )}

        {/* Actions row */}
        <div className="dump-actions">
          <button
            className={btnClass[status] || "btn btn-primary"}
            onClick={handleSave}
            disabled={!text.trim() || status === "saving" || status === "analyzing"}
          >
            {statusLabel[status]}
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => { setText(""); setStatus("idle"); }}
            disabled={!text.trim()}
          >
            Clear
          </button>
          <span className="word-count">{wordCount} {wordCount === 1 ? "word" : "words"}</span>
        </div>

        {/* AI analysis hint */}
        {status === "analyzing" && (
          <p style={{ fontSize: 12, color: "rgba(139,92,246,0.7)", marginTop: 8, marginBottom: 0 }}>
            🧠 Mindoo is reading your dump…
          </p>
        )}

        <div className="divider" />

        {/* Chronicles */}
        <div className="section-header">
          <h2 className="section-title">Your Chronicles</h2>
          <span style={{ fontSize: 12, color: "var(--dim)", fontFamily: "var(--font-mono)" }}>
            {chronicles.length} total
          </span>
        </div>

        {chronicles.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🧠</div>
            <div className="empty-state-title">No chronicles yet</div>
            <div className="empty-state-desc">Your first dump will appear here</div>
          </div>
        )}

        {chronicles.map(c => (
          <div
            key={c.id}
            className={`chronicle-item${expanded === c.id ? " expanded" : ""}`}
            onClick={() => setExpanded(expanded === c.id ? null : c.id)}
          >
            <div className="chronicle-icon">🧠</div>
            <div className="chronicle-body">
              <div className="chronicle-row">
                <span className="chronicle-id">{c.word_count} words</span>
                <span className="chronicle-time">{formatDate(c.created_at)}</span>
              </div>

              {/* AI summary if available */}
              {c.ai_summary && (
                <div className="chronicle-summary">{c.ai_summary}</div>
              )}

              {/* Tags row */}
              <div className="chronicle-tags">
                {c.emotional_tone && c.emotional_tone !== "neutral" && (
                  <span className="chronicle-tag">
                    {toneEmoji(c.emotional_tone)} {c.emotional_tone}
                  </span>
                )}
                {c.chaos_score > 0 && (
                  <span className="chronicle-tag" style={{ color: chaosColor(c.chaos_score) }}>
                    Chaos {c.chaos_score}/100
                  </span>
                )}
                {(c.themes ?? []).map(t => (
                  <span key={t} className="chronicle-tag">{t}</span>
                ))}
              </div>

              {/* Expanded: show full text */}
              {expanded === c.id && (
                <div className="chronicle-full-text">
                  {c.text}
                </div>
              )}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
