// ─────────────────────────────────────────────────────────────────
// BrainDump.jsx — Brain Dump Sanctuary
// Features:
//   ✅ Copy icon on input box
//   ✅ Copy icon on every chronicle
//   ✅ Editable chronicles (inline edit + save)
//   ✅ Voice entry (Web Speech API — works in Chrome/Edge/Safari)
// ─────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from "react";
import { saveChronicle, loadChronicles, updateChronicle } from "../../services/db";
import { analyzeChronicle } from "../../services/ai";

// ── HELPERS ───────────────────────────────────────────────────────
function formatDate(isoString) {
  const d    = new Date(isoString);
  const diff = Date.now() - d;
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 2)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7)   return `${days} days ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function chaosColor(s) {
  if (s < 30) return "#4ade80";
  if (s < 60) return "#fbbf24";
  if (s < 80) return "#f97316";
  return "#f87171";
}

function toneEmoji(t) {
  return { calm:"😌", focused:"🎯", anxious:"😰", overwhelmed:"😩",
           excited:"🔥", sad:"😔", angry:"😤", neutral:"😐" }[t] || "😐";
}

// ── INLINE SVG ICONS (no import needed) ──────────────────────────
function CopyIcon({ size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
    </svg>
  );
}
function CheckIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function MicIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
      <path d="M19 10v2a7 7 0 01-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  );
}
function EditIcon({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}
function SaveIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
  );
}
function XIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

// ── COPY BUTTON ───────────────────────────────────────────────────
function CopyBtn({ getText, size = 15 }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e) {
    e.stopPropagation(); // don't expand chronicle on click
    const text = typeof getText === "function" ? getText() : getText;
    if (!text?.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that block clipboard
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy to clipboard"}
      style={{
        background: "none", border: "none", cursor: "pointer",
        color: copied ? "#4ade80" : "rgba(248,248,255,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "4px", borderRadius: "6px",
        transition: "color 0.15s, background 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
      onMouseLeave={e => e.currentTarget.style.background = "none"}
    >
      {copied ? <CheckIcon size={size} /> : <CopyIcon size={size} color="currentColor" />}
    </button>
  );
}

// ── VOICE RECORDING HOOK ──────────────────────────────────────────
function useVoice(onTranscript) {
  const [recording,    setRecording]    = useState(false);
  const [supported,    setSupported]    = useState(false);
  const [errorMsg,     setVoiceError]   = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!SpeechRecognition);
  }, []);

  const startRecording = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setVoiceError("");
    const recognition = new SpeechRecognition();
    recognition.continuous    = true;
    recognition.interimResults = false;
    recognition.lang          = "en-US";

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join(" ");
      onTranscript(transcript);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setVoiceError("Microphone access denied. Please allow it in your browser.");
      } else if (event.error !== "aborted") {
        setVoiceError(`Voice error: ${event.error}`);
      }
      setRecording(false);
    };

    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }, [onTranscript]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setRecording(false);
  }, []);

  return { recording, supported, voiceError: errorMsg, startRecording, stopRecording };
}

// ── CHRONICLE ITEM ────────────────────────────────────────────────
function ChronicleItem({ chronicle, expanded, onToggle, onUpdate }) {
  const [editing,    setEditing]    = useState(false);
  const [editText,   setEditText]   = useState(chronicle.text);
  const [saving,     setSaving]     = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saved | error

  async function handleEditSave(e) {
    e.stopPropagation();
    if (!editText.trim()) return;
    setSaving(true);
    const { error } = await onUpdate(chronicle.id, editText.trim());
    setSaving(false);
    if (!error) {
      setSaveStatus("saved");
      setEditing(false);
      setTimeout(() => setSaveStatus("idle"), 2000);
    } else {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2500);
    }
  }

  function handleCancelEdit(e) {
    e.stopPropagation();
    setEditText(chronicle.text);
    setEditing(false);
  }

  function handleStartEdit(e) {
    e.stopPropagation();
    setEditText(chronicle.text);
    setEditing(true);
  }

  return (
    <div
      style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        padding: "12px 14px",
        borderRadius: 10,
        background: expanded ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)",
        marginBottom: 8,
        cursor: editing ? "default" : "pointer",
        transition: "background 0.15s",
      }}
      onClick={() => !editing && onToggle()}
    >
      {/* Left icon */}
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: "rgba(139,92,246,0.11)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13,
      }}>
        🧠
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(248,248,255,0.85)" }}>
            {chronicle.word_count} words
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 11, color: "rgba(248,248,255,0.28)", marginRight: 4 }}>
              {formatDate(chronicle.created_at)}
            </span>
            {/* Copy button */}
            <CopyBtn getText={() => chronicle.text} size={14} />
            {/* Edit button */}
            {!editing && (
              <button
                onClick={handleStartEdit}
                title="Edit this chronicle"
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(248,248,255,0.35)", display: "flex",
                  alignItems: "center", padding: "4px", borderRadius: 6,
                  transition: "color 0.15s, background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                <EditIcon size={14} />
              </button>
            )}
          </div>
        </div>

        {/* AI summary */}
        {chronicle.ai_summary && !editing && (
          <div style={{
            fontSize: 12, color: "rgba(248,248,255,0.45)",
            marginBottom: 5, lineHeight: 1.5, fontStyle: "italic",
          }}>
            {chronicle.ai_summary}
          </div>
        )}

        {/* Tags */}
        {!editing && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: expanded ? 10 : 0 }}>
            {chronicle.emotional_tone && chronicle.emotional_tone !== "neutral" && (
              <span style={{
                fontSize: "10.5px", fontWeight: 500, padding: "2px 8px",
                borderRadius: 100, background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)", color: "rgba(248,248,255,0.5)",
              }}>
                {toneEmoji(chronicle.emotional_tone)} {chronicle.emotional_tone}
              </span>
            )}
            {chronicle.chaos_score > 0 && (
              <span style={{
                fontSize: "10.5px", fontWeight: 500, padding: "2px 8px",
                borderRadius: 100, background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: chaosColor(chronicle.chaos_score),
              }}>
                Chaos {chronicle.chaos_score}/100
              </span>
            )}
            {(chronicle.themes ?? []).map(t => (
              <span key={t} style={{
                fontSize: "10.5px", fontWeight: 500, padding: "2px 8px",
                borderRadius: 100, background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)", color: "rgba(248,248,255,0.5)",
              }}>
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Expanded: full text OR edit mode */}
        {expanded && !editing && (
          <div style={{
            padding: "12px 14px",
            background: "rgba(255,255,255,0.02)",
            borderRadius: 8,
            fontSize: 13,
            color: "rgba(248,248,255,0.7)",
            lineHeight: 1.75,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            borderLeft: "2px solid rgba(139,92,246,0.3)",
          }}>
            {chronicle.text}
          </div>
        )}

        {/* Edit mode */}
        {editing && (
          <div onClick={e => e.stopPropagation()}>
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              autoFocus
              style={{
                width: "100%", minHeight: 120,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(139,92,246,0.4)",
                borderRadius: 10, padding: "12px 14px",
                color: "#f8f8ff", fontSize: 13,
                fontFamily: "var(--font-body, 'Inter', sans-serif)",
                resize: "vertical", outline: "none",
                lineHeight: 1.7, boxSizing: "border-box",
                boxShadow: "0 0 0 3px rgba(139,92,246,0.08)",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={handleEditSave}
                disabled={saving || !editText.trim()}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 8,
                  background: "linear-gradient(135deg,#8b5cf6,#6366f1)",
                  border: "none", color: "#fff", fontSize: 12,
                  fontWeight: 600, cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.6 : 1, transition: "opacity 0.15s",
                  fontFamily: "inherit",
                }}
              >
                <SaveIcon size={13} />
                {saving ? "Saving…" : saveStatus === "saved" ? "Saved!" : "Save changes"}
              </button>
              <button
                onClick={handleCancelEdit}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 8,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(248,248,255,0.5)", fontSize: 12,
                  fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <XIcon size={13} />
                Cancel
              </button>
              {saveStatus === "error" && (
                <span style={{ fontSize: 12, color: "#f87171", alignSelf: "center" }}>
                  Save failed. Try again.
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────
export function BrainDump({ userId, onChronicleAdded }) {
  const [text,       setText]       = useState("");
  const [chronicles, setChronicles] = useState([]);
  const [status,     setStatus]     = useState("idle");
  const [errorMsg,   setErrorMsg]   = useState("");
  const [expanded,   setExpanded]   = useState(null);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  // Voice: appends transcript to existing text
  const handleTranscript = useCallback((transcript) => {
    setText(prev => {
      const sep = prev.trim() ? " " : "";
      return prev + sep + transcript;
    });
  }, []);

  const {
    recording, supported: voiceSupported,
    voiceError, startRecording, stopRecording,
  } = useVoice(handleTranscript);

  // Load chronicles
  useEffect(() => {
    if (!userId) return;
    loadChronicles(userId, 20).then(({ data }) => setChronicles(data));
  }, [userId]);

  // Save
  const handleSave = useCallback(async () => {
    if (!text.trim() || !userId) return;
    setStatus("analyzing");
    setErrorMsg("");
    try {
      const analysis = await analyzeChronicle(text);
      setStatus("saving");
      const { data, error } = await saveChronicle({
        userId, text: text.trim(), wordCount, analysis,
      });
      if (error) throw error;
      setChronicles(prev => [data, ...prev]);
      setText("");
      setStatus("saved");
      onChronicleAdded?.();
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Save failed. Try again.");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }, [text, userId, wordCount, onChronicleAdded]);

  // Update chronicle text (for edit)
  const handleUpdate = useCallback(async (chronicleId, newText) => {
    const { error } = await import("../../services/db").then(m =>
      m.updateChronicle(chronicleId, newText)
    );
    if (!error) {
      setChronicles(prev =>
        prev.map(c => c.id === chronicleId
          ? { ...c, text: newText, word_count: newText.trim().split(/\s+/).filter(Boolean).length }
          : c
        )
      );
    }
    return { error };
  }, []);

  const isBusy = status === "saving" || status === "analyzing";

  return (
    <div className="section-scroll">
      <div className="section-content">

        {/* Header */}
        <div className="section-eyebrow">Module · Capture</div>
        <h1 className="section-heading gradient-text">Brain Dump Sanctuary</h1>
        <p className="section-subheading">
          Zero friction. Zero judgment. Zero organization needed. Just empty your mind.
        </p>

        {/* Voice error */}
        {voiceError && (
          <div className="alert alert-error" style={{ marginBottom: 12 }}>
            {voiceError}
          </div>
        )}

        {/* Textarea + toolbar */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <textarea
            className="dump-textarea"
            style={{ marginBottom: 0, paddingBottom: 44 }}
            rows={9}
            placeholder={"Start typing anything that's in your head…\n\ngroceries, that thing Sarah said, project deadline, feeling weird about the meeting, taxes — TAXES, why am I tired…\n\nNo rules. No formatting. Just get it out."}
            value={text}
            onChange={e => setText(e.target.value)}
          />

          {/* Textarea toolbar — bottom-right corner */}
          <div style={{
            position: "absolute", bottom: 10, right: 12,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            {/* Copy input box content */}
            <CopyBtn getText={() => text} size={15} />

            {/* Voice button */}
            {voiceSupported && (
              <button
                onClick={recording ? stopRecording : startRecording}
                title={recording ? "Stop recording" : "Voice entry"}
                style={{
                  background: recording ? "rgba(239,68,68,0.15)" : "none",
                  border: recording ? "1px solid rgba(239,68,68,0.35)" : "none",
                  cursor: "pointer",
                  color: recording ? "#f87171" : "rgba(248,248,255,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "4px 6px", borderRadius: 6,
                  transition: "all 0.15s",
                  gap: 4, fontSize: 11, fontWeight: 600,
                  fontFamily: "inherit",
                }}
                onMouseEnter={e => {
                  if (!recording) e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                }}
                onMouseLeave={e => {
                  if (!recording) e.currentTarget.style.background = "none";
                }}
              >
                <MicIcon size={15} color={recording ? "#f87171" : "currentColor"} />
                {recording && (
                  <span style={{ animation: "pulse 1s ease-in-out infinite" }}>
                    Recording…
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="alert alert-error" style={{ marginBottom: 12 }}>
            {errorMsg}
          </div>
        )}

        {/* Actions */}
        <div className="dump-actions">
          <button
            className={
              status === "saved" ? "btn btn-success" :
              status === "error" ? "btn btn-danger" :
              isBusy ? "btn btn-ghost" : "btn btn-primary"
            }
            onClick={handleSave}
            disabled={!text.trim() || isBusy}
          >
            {status === "idle"      && "💾 Save Chronicle"}
            {status === "analyzing" && "🧠 Analysing…"}
            {status === "saving"    && "Saving…"}
            {status === "saved"     && "✓ Saved"}
            {status === "error"     && "Error — try again"}
          </button>

          <button
            className="btn btn-ghost"
            onClick={() => { setText(""); setStatus("idle"); setErrorMsg(""); }}
            disabled={!text.trim()}
          >
            Clear
          </button>

          <span className="word-count">
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
        </div>

        {status === "analyzing" && (
          <p style={{ fontSize: 12, color: "rgba(139,92,246,0.7)", marginTop: 8 }}>
            🧠 Mindoo is reading your dump…
          </p>
        )}

        <div className="divider" />

        {/* Chronicles list */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 className="section-title" style={{ margin: 0 }}>Your Chronicles</h2>
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
          <ChronicleItem
            key={c.id}
            chronicle={c}
            expanded={expanded === c.id}
            onToggle={() => setExpanded(expanded === c.id ? null : c.id)}
            onUpdate={handleUpdate}
          />
        ))}

      </div>
    </div>
  );
}