// ─────────────────────────────────────────────────────────────────
// BrainDump.jsx — Brain Dump Sanctuary
//
// FEATURES:
//  1. Editable title on every chronicle
//  2. Delete with confirmation
//  3. Real voice note (MediaRecorder → Supabase Storage → audio player)
//  4. Brain Dump Session — timed full-screen writing + voice sanctuary
//  5. Adjustable timer (slider, 1–120 min)
// ─────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from "react";
import {
  saveChronicle, saveVoiceChronicle, saveSessionChronicle,
  uploadVoiceBlob, loadChronicles, updateChronicle, deleteChronicle,
} from "../../services/db";
import { analyzeChronicle } from "../../services/ai";

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  const d = new Date(iso), diff = Date.now() - d;
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), dy = Math.floor(diff / 86400000);
  if (m < 2)    return "Just now";
  if (m < 60)   return `${m}m ago`;
  if (h < 24)   return `${h}h ago`;
  if (dy === 1) return "Yesterday";
  if (dy < 7)   return `${dy}d ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function fmtSecs(s) {
  if (!s) return "0:00";
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function fmtMins(m) {
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60 > 0 ? m % 60 + "m" : ""}`.trim();
}

function chaosColor(s) {
  if (s < 30) return "#4ade80"; if (s < 60) return "#fbbf24";
  if (s < 80) return "#f97316"; return "#f87171";
}

function toneEmoji(t) {
  return { calm:"😌", focused:"🎯", anxious:"😰", overwhelmed:"😩",
           excited:"🔥", sad:"😔", angry:"😤", neutral:"😐" }[t] ?? "😐";
}

function originIcon(o) {
  return o === "voice" ? "🎙️" : o === "session" ? "⏱️" : "🧠";
}

// ─────────────────────────────────────────────────────────────────
// MINIMAL ICON SYSTEM
// ─────────────────────────────────────────────────────────────────
const P = {
  copy:  ["M9 9h13v13H9z","M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"],
  check: ["M20 6L9 17l-5-5"],
  mic:   ["M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z","M19 10v2a7 7 0 01-14 0v-2","M12 19v4M8 23h8"],
  stop:  ["M6 6h12v12H6z"],
  edit:  ["M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7","M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"],
  save:  ["M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z","M17 21v-8H7v8M7 3v5h8"],
  trash: ["M3 6h18","M8 6V4h8v2","M19 6l-1 14H6L5 6"],
  x:     ["M18 6L6 18","M6 6l12 12"],
  timer: ["M12 22a10 10 0 100-20 10 10 0 000 20z","M12 6v6l4 2"],
  play:  ["M5 3l14 9-14 9V3z"],
  plus:  ["M12 5v14","M5 12h14"],
};

function Ic({ k, size = 15, color = "currentColor", fill = "none", sw = "1.5" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
      stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: "block" }}>
      {(P[k] ?? []).map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// SHARED SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────────
function Btn({ children, onClick, disabled, variant = "ghost", style: sx = {} }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "8px 14px", borderRadius: 9, fontSize: 12.5, fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer", border: "none",
    fontFamily: "inherit", transition: "all 0.15s",
    opacity: disabled ? 0.45 : 1,
  };
  const variants = {
    primary: { background: "linear-gradient(135deg,#8b5cf6,#6366f1,#3b82f6)", color: "#fff" },
    ghost:   { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(248,248,255,0.6)" },
    danger:  { background: "rgba(239,68,68,0.1)",   border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" },
    success: { background: "rgba(34,197,94,0.1)",   border: "1px solid rgba(34,197,94,0.25)", color: "#4ade80" },
    red:     { background: "rgba(239,68,68,0.15)",  border: "1px solid rgba(239,68,68,0.3)",  color: "#f87171" },
  };
  return (
    <button onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variants[variant], ...sx }}>
      {children}
    </button>
  );
}

function IconBtn({ iconKey, title, onClick, danger = false, size = 14 }) {
  const [h, setH] = useState(false);
  return (
    <button title={title}
      onClick={e => { e.stopPropagation(); onClick?.(e); }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: danger && h ? "rgba(239,68,68,0.12)" : h ? "rgba(255,255,255,0.07)" : "none",
        border: "none", cursor: "pointer", padding: 4, borderRadius: 6,
        display: "flex", alignItems: "center",
        color: danger ? (h ? "#f87171" : "rgba(248,248,255,0.28)") : "rgba(248,248,255,0.38)",
        transition: "all 0.15s",
      }}>
      <Ic k={iconKey} size={size} color="currentColor" />
    </button>
  );
}

function CopyBtn({ getText, size = 14 }) {
  const [ok, setOk] = useState(false);
  async function go(e) {
    e.stopPropagation();
    const t = typeof getText === "function" ? getText() : getText;
    if (!t?.trim()) return;
    try { await navigator.clipboard.writeText(t); }
    catch {
      const el = document.createElement("textarea");
      el.value = t; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    }
    setOk(true); setTimeout(() => setOk(false), 2000);
  }
  return <IconBtn iconKey={ok ? "check" : "copy"} title={ok ? "Copied!" : "Copy"} onClick={go} size={size} />;
}

function DeleteBtn({ onConfirm }) {
  const [phase, setPhase] = useState("idle"); // idle | confirm | deleting
  const t = useRef(null);
  useEffect(() => () => clearTimeout(t.current), []);
  function click(e) {
    e.stopPropagation();
    if (phase === "idle") {
      setPhase("confirm");
      t.current = setTimeout(() => setPhase("idle"), 3000);
    } else if (phase === "confirm") {
      clearTimeout(t.current);
      setPhase("deleting");
      Promise.resolve(onConfirm()).finally(() => setPhase("idle"));
    }
  }
  if (phase === "deleting") return <span style={{ fontSize: 11, color: "var(--dim)" }}>Deleting…</span>;
  return (
    <button onClick={click}
      style={{
        display: "flex", alignItems: "center", gap: 4,
        padding: phase === "confirm" ? "3px 9px" : "4px",
        borderRadius: 6, border: phase === "confirm" ? "1px solid rgba(239,68,68,0.3)" : "none",
        background: phase === "confirm" ? "rgba(239,68,68,0.12)" : "none",
        color: phase === "confirm" ? "#f87171" : "rgba(248,248,255,0.28)",
        fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
        transition: "all 0.15s", whiteSpace: "nowrap",
      }}
      onMouseEnter={e => { if (phase === "idle") { e.currentTarget.style.color = "#f87171"; } }}
      onMouseLeave={e => { if (phase === "idle") { e.currentTarget.style.color = "rgba(248,248,255,0.28)"; } }}
    >
      <Ic k="trash" size={12} color="currentColor" />
      {phase === "confirm" && "Confirm?"}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// MEDIA RECORDER HOOK — real audio capture
// ─────────────────────────────────────────────────────────────────
function useRecorder() {
  const [state,    setState]    = useState("idle"); // idle | requesting | recording
  const [secs,     setSecs]     = useState(0);
  const [recError, setRecError] = useState("");
  const mediaRef  = useRef(null);
  const chunksRef = useRef([]);
  const timerRef  = useRef(null);

  const supported = typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

  const start = useCallback(() => new Promise(async (resolve, reject) => {
    setRecError(""); setState("requesting"); setSecs(0); chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime =
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" :
        MediaRecorder.isTypeSupported("audio/webm")             ? "audio/webm" :
        MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")  ? "audio/ogg;codecs=opus" : "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : {});
      mediaRef.current = rec;
      rec.ondataavailable = e => { if (e.data?.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        clearInterval(timerRef.current);
        setState("idle");
        resolve(new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" }));
      };
      rec.onerror = err => {
        stream.getTracks().forEach(t => t.stop());
        clearInterval(timerRef.current);
        setState("idle"); setRecError("Recording failed."); reject(err);
      };
      rec.start(250); setState("recording");
      timerRef.current = setInterval(() => setSecs(s => s + 1), 1000);
    } catch (err) {
      setState("idle");
      setRecError(err.name === "NotAllowedError"
        ? "Microphone denied. Allow it in browser settings."
        : `Mic error: ${err.message}`);
      reject(err);
    }
  }), []);

  const stop   = useCallback(() => { mediaRef.current?.state === "recording" && mediaRef.current.stop(); }, []);
  const cancel = useCallback(() => {
    if (mediaRef.current?.state === "recording") {
      mediaRef.current.onstop = () => {};
      mediaRef.current.stop();
    }
    clearInterval(timerRef.current); setState("idle"); setSecs(0);
  }, []);

  return { state, secs, recError, supported, start, stop, cancel };
}

// ─────────────────────────────────────────────────────────────────
// WAVEFORM BARS — animated visual while recording
// ─────────────────────────────────────────────────────────────────
function WaveBars({ color = "#f87171", n = 18 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2.5, height: 28 }}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} style={{
          width: 2.5, borderRadius: 2, background: color,
          animation: `wvBar ${0.38 + (i % 5) * 0.09}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.045}s`,
          transformOrigin: "bottom",
        }} />
      ))}
    </div>
  );
}

// inject wave keyframes once
if (typeof document !== "undefined" && !document.getElementById("wv-css")) {
  const s = document.createElement("style");
  s.id = "wv-css";
  s.textContent = `
    @keyframes wvBar {
      from { transform: scaleY(0.25); opacity:0.5; }
      to   { transform: scaleY(1.0);  opacity:1; }
    }
    @keyframes sessionPulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(139,92,246,0); }
      50% { box-shadow: 0 0 0 8px rgba(139,92,246,0.12); }
    }
  `;
  document.head.appendChild(s);
}

// ─────────────────────────────────────────────────────────────────
// STANDALONE VOICE NOTE PANEL (quick voice notes, no timer)
// ─────────────────────────────────────────────────────────────────
function VoiceNotePanel({ userId, title, onSaved }) {
  const { state, secs, recError, supported, start, stop, cancel } = useRecorder();
  const [uploading, setUploading] = useState(false);
  const [upError,   setUpError]   = useState("");
  const blobRef = useRef(null);

  async function handleStart() {
    setUpError("");
    blobRef.current = start(); // returns a promise
  }

  async function handleStop() {
    stop();
    setUploading(true);
    try {
      const blob = await blobRef.current;
      if (!blob || blob.size < 100) throw new Error("Recording too short or empty.");
      const { data, error } = await saveVoiceChronicle({ userId, title, blob, duration: secs });
      if (error) throw error;
      onSaved?.(data);
    } catch (err) {
      setUpError(err.message || "Upload failed.");
    } finally { setUploading(false); }
  }

  if (!supported) return null;

  const isRec = state === "recording";
  const isReq = state === "requesting";

  return (
    <div style={{
      background: isRec ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.025)",
      border: `1px solid ${isRec ? "rgba(239,68,68,0.22)" : "rgba(255,255,255,0.09)"}`,
      borderRadius: 14, padding: "15px 18px",
      transition: "all 0.25s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: isRec ? "rgba(239,68,68,0.14)" : "rgba(139,92,246,0.12)",
          border: `1px solid ${isRec ? "rgba(239,68,68,0.28)" : "rgba(139,92,246,0.2)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Ic k="mic" size={15} color={isRec ? "#f87171" : "#a78bfa"} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600,
            color: isRec ? "#f87171" : "rgba(248,248,255,0.8)" }}>
            {isReq ? "Starting mic…" : isRec ? "Recording…" : uploading ? "Saving…" : "Voice Note"}
          </div>
          {!isRec && !uploading && !isReq && (
            <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 1 }}>
              Record a voice note — plays back in the chronicle
            </div>
          )}
        </div>
        {!isRec && !uploading && !isReq && (
          <Btn variant="primary" onClick={handleStart}>
            <Ic k="mic" size={13} color="#fff" /> Start
          </Btn>
        )}
      </div>

      {isRec && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <WaveBars />
            <span style={{
              marginLeft: "auto", fontFamily: "var(--font-mono, monospace)",
              fontSize: 20, fontWeight: 700, color: "#f87171", letterSpacing: "-0.03em",
            }}>{fmtSecs(secs)}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="primary" onClick={handleStop} style={{ flex: 1 }}>
              <Ic k="stop" size={12} color="#fff" fill="#fff" /> Stop & Save
            </Btn>
            <Btn variant="ghost" onClick={cancel}>Discard</Btn>
          </div>
        </div>
      )}

      {uploading && (
        <div style={{ fontSize: 12, color: "rgba(248,248,255,0.4)", marginTop: 10 }}>
          ⬆ Uploading voice note…
        </div>
      )}
      {(recError || upError) && (
        <div style={{
          marginTop: 10, padding: "8px 12px", borderRadius: 8,
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
          fontSize: 12, color: "#f87171",
        }}>{recError || upError}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// BRAIN DUMP SESSION — timed sanctuary mode
// ─────────────────────────────────────────────────────────────────
function SessionMode({ userId, onDone }) {
  // Timer config
  const [timerMins,  setTimerMins]  = useState(10);
  const [phase,      setPhase]      = useState("setup"); // setup | running | ended
  const [elapsed,    setElapsed]    = useState(0);
  const [text,       setText]       = useState("");
  const [sessionTitle, setSessionTitle] = useState("");
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState("");

  // Voice within session
  const { state: recState, secs: recSecs, recError, supported: micOk,
          start: startRec, stop: stopRec, cancel: cancelRec } = useRecorder();
  const blobPromRef = useRef(null);
  const [voiceBlob, setVoiceBlob]  = useState(null);
  const [voiceSecs, setVoiceSecs]  = useState(0);

  const timerRef    = useRef(null);
  const totalSecs   = timerMins * 60;
  const remaining   = Math.max(0, totalSecs - elapsed);
  const pct         = Math.min(100, (elapsed / totalSecs) * 100);
  const wordCount   = text.trim().split(/\s+/).filter(Boolean).length;

  // Run timer
  useEffect(() => {
    if (phase === "running") {
      timerRef.current = setInterval(() => {
        setElapsed(prev => {
          if (prev + 1 >= totalSecs) {
            clearInterval(timerRef.current);
            setPhase("ended");
            return totalSecs;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, totalSecs]);

  function handleStart() {
    setElapsed(0); setText(""); setVoiceBlob(null); setVoiceSecs(0);
    setSaveError(""); setPhase("running");
  }

  function handleEndEarly() {
    clearInterval(timerRef.current);
    if (recState === "recording") stopRec();
    setPhase("ended");
  }

  async function handleStartVoice() {
    blobPromRef.current = startRec();
  }

  async function handleStopVoice() {
    stopRec();
    try {
      const blob = await blobPromRef.current;
      setVoiceBlob(blob);
      setVoiceSecs(recSecs);
    } catch { /* ignore */ }
  }

  async function handleSaveSession() {
    if (!userId) return;
    setSaving(true); setSaveError("");
    try {
      let audioUrl = "";

      // Upload voice if recorded
      if (voiceBlob && voiceBlob.size > 100) {
        const { url, error: upErr } = await uploadVoiceBlob({ userId, blob: voiceBlob });
        if (upErr) throw upErr;
        audioUrl = url;
      }

      // AI analysis on text
      const analysis = text.trim().length > 20
        ? await analyzeChronicle(text).catch(() => null)
        : null;

      const { data, error } = await saveSessionChronicle({
        userId,
        title:     sessionTitle.trim() || `Session — ${new Date().toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`,
        text:      text.trim(),
        wordCount,
        audioUrl,
        duration:  elapsed,
        analysis,
      });

      if (error) throw error;
      onDone?.(data);
    } catch (err) {
      setSaveError(err.message || "Save failed. Try again.");
    } finally { setSaving(false); }
  }

  function handleDiscard() {
    if (recState === "recording") cancelRec();
    onDone?.(null);
  }

  // ── SETUP SCREEN ──
  if (phase === "setup") {
    return (
      <div style={{
        background: "rgba(139,92,246,0.05)",
        border: "1px solid rgba(139,92,246,0.2)",
        borderRadius: 18, padding: "28px 28px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.28)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Ic k="timer" size={20} color="#a78bfa" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f8f8ff", letterSpacing: "-0.01em" }}>
              Brain Dump Session
            </div>
            <div style={{ fontSize: 12, color: "var(--dim)" }}>
              Set a timer. Empty your mind completely. No rules.
            </div>
          </div>
        </div>

        {/* Timer picker */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between",
            alignItems: "baseline", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(248,248,255,0.55)",
              textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Session Duration
            </span>
            <span style={{
              fontFamily: "var(--font-mono, monospace)", fontSize: 22, fontWeight: 800,
              color: "#a78bfa", letterSpacing: "-0.03em",
            }}>
              {fmtMins(timerMins)}
            </span>
          </div>

          {/* Slider */}
          <input type="range" min={1} max={120} value={timerMins}
            onChange={e => setTimerMins(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#8b5cf6", cursor: "pointer", height: 4 }}
          />

          {/* Quick presets */}
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {[2, 5, 10, 15, 25, 30, 45, 60, 90].map(m => (
              <button key={m} onClick={() => setTimerMins(m)}
                style={{
                  padding: "4px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                  background: timerMins === m ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.04)",
                  border: timerMins === m ? "1px solid rgba(139,92,246,0.45)" : "1px solid rgba(255,255,255,0.08)",
                  color: timerMins === m ? "#c4b5fd" : "rgba(248,248,255,0.4)",
                }}>
                {m}m
              </button>
            ))}
          </div>
        </div>

        {/* What happens info */}
        <div style={{
          background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "12px 14px",
          marginBottom: 20, fontSize: 12, color: "rgba(248,248,255,0.42)", lineHeight: 1.7,
        }}>
          You'll get a focused writing space + microphone. Write everything in your head.
          Record your voice. Do both. When the timer ends, everything saves as one Session Chronicle.
        </div>

        <Btn variant="primary" onClick={handleStart} style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
          <Ic k="timer" size={14} color="#fff" /> Start {fmtMins(timerMins)} Session
        </Btn>
      </div>
    );
  }

  // ── RUNNING SCREEN ──
  if (phase === "running") {
    const isRec = recState === "recording";
    return (
      <div style={{
        background: "rgba(9,9,15,0.98)",
        border: "1px solid rgba(139,92,246,0.25)",
        borderRadius: 18,
        padding: "22px 24px",
        animation: "sessionPulse 4s ease-in-out infinite",
      }}>

        {/* Timer header */}
        <div style={{ display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 32,
              fontWeight: 800, color: remaining < 60 ? "#f87171" : "#a78bfa",
              letterSpacing: "-0.04em", lineHeight: 1 }}>
              {fmtSecs(remaining)}
            </div>
            <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 2 }}>
              remaining · {fmtSecs(elapsed)} elapsed
            </div>
          </div>
          <Btn variant="ghost" onClick={handleEndEarly}
            style={{ fontSize: 12, padding: "7px 12px" }}>
            End Early
          </Btn>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 3, borderRadius: 2, background: "rgba(255,255,255,0.07)",
          marginBottom: 18, overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: 2, transition: "width 1s linear",
            width: `${pct}%`,
            background: remaining < 60
              ? "linear-gradient(90deg,#f97316,#f87171)"
              : "linear-gradient(90deg,#8b5cf6,#6366f1,#3b82f6)",
          }} />
        </div>

        {/* Writing area */}
        <textarea
          placeholder={"Everything in your head — right now.\n\nDon't think. Don't edit. Don't organize.\nJust type. Stream of consciousness. Let it all out.\n\nTaxes? Type it. That thing from last Tuesday? Type it.\nWhat you're scared of? Type it. What you want? Type it.\n\nThis space is yours. Nothing leaves until you say so."}
          value={text}
          onChange={e => setText(e.target.value)}
          autoFocus
          style={{
            width: "100%", minHeight: 220, background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12,
            padding: "16px 18px", color: "#f8f8ff", fontSize: 14.5,
            fontFamily: "var(--font-body, 'Inter', sans-serif)",
            resize: "vertical", outline: "none", lineHeight: 1.82,
            boxSizing: "border-box", transition: "border-color 0.2s",
            marginBottom: 14,
          }}
          onFocus={e => e.target.style.borderColor = "rgba(139,92,246,0.3)"}
          onBlur={e  => e.target.style.borderColor = "rgba(255,255,255,0.07)"}
        />

        {/* Word count */}
        <div style={{ fontSize: 11, color: "var(--dim)",
          textAlign: "right", marginTop: -10, marginBottom: 14,
          fontFamily: "var(--font-mono, monospace)" }}>
          {wordCount} words
        </div>

        {/* Voice controls within session */}
        {micOk && (
          <div style={{
            background: isRec ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.025)",
            border: `1px solid ${isRec ? "rgba(239,68,68,0.22)" : "rgba(255,255,255,0.07)"}`,
            borderRadius: 12, padding: "12px 14px", marginBottom: 16,
            transition: "all 0.2s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Ic k="mic" size={15} color={isRec ? "#f87171" : "rgba(248,248,255,0.35)"} />
              {isRec ? (
                <>
                  <WaveBars color="#f87171" n={14} />
                  <span style={{ fontFamily: "var(--font-mono, monospace)",
                    fontSize: 16, fontWeight: 700, color: "#f87171",
                    marginLeft: "auto", letterSpacing: "-0.02em" }}>
                    {fmtSecs(recSecs)}
                  </span>
                  <Btn variant="red" onClick={handleStopVoice} style={{ padding: "5px 12px", fontSize: 11 }}>
                    <Ic k="stop" size={11} color="#f87171" fill="#f87171" /> Stop
                  </Btn>
                  <Btn variant="ghost" onClick={cancelRec} style={{ padding: "5px 10px", fontSize: 11 }}>
                    Discard
                  </Btn>
                </>
              ) : voiceBlob ? (
                <>
                  <span style={{ fontSize: 12, color: "#4ade80" }}>
                    ✓ Voice note recorded ({fmtSecs(voiceSecs)})
                  </span>
                  <Btn variant="ghost" onClick={() => { setVoiceBlob(null); setVoiceSecs(0); }}
                    style={{ marginLeft: "auto", fontSize: 11, padding: "4px 10px" }}>
                    Re-record
                  </Btn>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 12, color: "rgba(248,248,255,0.4)" }}>
                    Add a voice note to this session
                  </span>
                  <Btn variant="ghost" onClick={handleStartVoice}
                    style={{ marginLeft: "auto", fontSize: 11, padding: "5px 12px" }}>
                    Record
                  </Btn>
                </>
              )}
            </div>
            {recError && <div style={{ fontSize: 11, color: "#f87171", marginTop: 8 }}>{recError}</div>}
          </div>
        )}

      </div>
    );
  }

  // ── ENDED SCREEN ──
  return (
    <div style={{
      background: "rgba(34,197,94,0.04)",
      border: "1px solid rgba(34,197,94,0.18)",
      borderRadius: 18, padding: "24px 24px 20px",
    }}>
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
        <div style={{ fontFamily: "var(--font-display, 'Sora', sans-serif)", fontWeight: 800,
          fontSize: 18, letterSpacing: "-0.02em", color: "#f8f8ff", marginBottom: 4 }}>
          Session complete
        </div>
        <div style={{ fontSize: 13, color: "var(--dim)" }}>
          {fmtSecs(elapsed)} · {wordCount} words
          {voiceBlob && ` · Voice note (${fmtSecs(voiceSecs)})`}
        </div>
      </div>

      {/* Title field */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(248,248,255,0.45)",
          textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
          Give this session a title (optional)
        </div>
        <input
          type="text"
          value={sessionTitle}
          onChange={e => setSessionTitle(e.target.value)}
          placeholder="e.g. Monday morning mind clear, Work anxiety dump…"
          style={{
            width: "100%", background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
            padding: "10px 14px", color: "#f8f8ff", fontSize: 13.5,
            fontFamily: "inherit", outline: "none", boxSizing: "border-box",
          }}
          onFocus={e => e.target.style.borderColor = "rgba(139,92,246,0.5)"}
          onBlur={e  => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
        />
      </div>

      {/* Text preview */}
      {text.trim() && (
        <div style={{
          background: "rgba(255,255,255,0.02)", borderRadius: 10,
          padding: "12px 14px", marginBottom: 14, maxHeight: 140, overflowY: "auto",
          fontSize: 13, color: "rgba(248,248,255,0.55)", lineHeight: 1.7,
          whiteSpace: "pre-wrap", wordBreak: "break-word",
          borderLeft: "2px solid rgba(139,92,246,0.3)",
        }}>
          {text.trim()}
        </div>
      )}

      {voiceBlob && (
        <div style={{ marginBottom: 14, padding: "10px 12px",
          background: "rgba(139,92,246,0.06)", borderRadius: 10,
          border: "1px solid rgba(139,92,246,0.2)", fontSize: 12, color: "#a78bfa" }}>
          🎙️ Voice note ({fmtSecs(voiceSecs)}) will be attached to this chronicle
        </div>
      )}

      {saveError && (
        <div style={{ marginBottom: 12, padding: "9px 12px", borderRadius: 9,
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
          fontSize: 12, color: "#f87171" }}>
          {saveError}
        </div>
      )}

      <div style={{ display: "flex", gap: 9 }}>
        <Btn variant="primary" onClick={handleSaveSession} disabled={saving}
          style={{ flex: 1, justifyContent: "center", padding: "11px 0" }}>
          {saving ? "Saving…" : "💾 Save Session Chronicle"}
        </Btn>
        <Btn variant="ghost" onClick={handleDiscard} disabled={saving}>
          Discard
        </Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CHRONICLE ITEM
// ─────────────────────────────────────────────────────────────────
function ChronicleItem({ c, expanded, onToggle, onUpdate, onDelete }) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitle,    setEditTitle]    = useState(c.title || "");
  const [editingText,  setEditingText]  = useState(false);
  const [editText,     setEditText]     = useState(c.text  || "");
  const [saving,       setSaving]       = useState(false);

  const isVoice   = c.origin === "voice";
  const isSession = c.origin === "session";

  async function saveTitle() {
    if (editTitle === (c.title || "")) { setEditingTitle(false); return; }
    setSaving(true);
    await onUpdate(c.id, { title: editTitle });
    setSaving(false); setEditingTitle(false);
  }

  async function saveText() {
    if (editText === (c.text || "")) { setEditingText(false); return; }
    setSaving(true);
    await onUpdate(c.id, { text: editText });
    setSaving(false); setEditingText(false);
  }

  const displayTitle = c.title || c.ai_summary || (isVoice ? "Voice Note" : isSession ? "Dump Session" : "Brain Dump");

  return (
    <div
      onClick={() => !editingTitle && !editingText && onToggle()}
      style={{
        borderRadius: 14, marginBottom: 10, overflow: "hidden",
        border: `1px solid ${expanded ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.07)"}`,
        background: expanded ? "rgba(255,255,255,0.035)" : "rgba(255,255,255,0.02)",
        cursor: (editingTitle || editingText) ? "default" : "pointer",
        transition: "all 0.18s",
      }}
    >
      {/* Header strip */}
      <div style={{ padding: "12px 14px", display: "flex",
        alignItems: "flex-start", gap: 10 }}>

        {/* Icon */}
        <div style={{
          width: 30, height: 30, borderRadius: 9, flexShrink: 0,
          background: isVoice   ? "rgba(139,92,246,0.14)"
                    : isSession ? "rgba(99,102,241,0.14)"
                    : "rgba(139,92,246,0.09)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
        }}>
          {originIcon(c.origin)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title row */}
          {editingTitle ? (
            <div onClick={e => e.stopPropagation()} style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 4 }}>
              <input
                autoFocus value={editTitle} onChange={e => setEditTitle(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") { setEditTitle(c.title||""); setEditingTitle(false); } }}
                style={{
                  flex: 1, background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(139,92,246,0.45)", borderRadius: 7,
                  padding: "5px 10px", color: "#f8f8ff", fontSize: 13.5,
                  fontWeight: 700, fontFamily: "inherit", outline: "none",
                }}
              />
              <Btn variant="primary" onClick={saveTitle} disabled={saving}
                style={{ padding: "5px 12px", fontSize: 11 }}>
                {saving ? "…" : "Save"}
              </Btn>
              <Btn variant="ghost" onClick={() => { setEditTitle(c.title||""); setEditingTitle(false); }}
                style={{ padding: "5px 10px", fontSize: 11 }}>
                Cancel
              </Btn>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3,
              flexWrap: "wrap" }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: "#f8f8ff",
                letterSpacing: "-0.01em", lineHeight: 1.3 }}>
                {displayTitle}
              </span>
              {(isVoice || isSession) && (
                <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px",
                  borderRadius: 100, background: "rgba(139,92,246,0.15)",
                  border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa" }}>
                  {isSession ? "Session" : "Voice"}
                </span>
              )}
            </div>
          )}

          {/* Meta row */}
          <div style={{ display: "flex", alignItems: "center",
            justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "var(--dim)" }}>{fmtDate(c.created_at)}</span>
              {c.duration_secs > 0 && (
                <span style={{ fontSize: 11, color: "var(--dim)" }}>
                  {fmtSecs(c.duration_secs)}
                </span>
              )}
              {c.word_count > 0 && (
                <span style={{ fontSize: 11, color: "var(--dim)" }}>{c.word_count} words</span>
              )}
              {c.chaos_score > 0 && (
                <span style={{ fontSize: 11, fontWeight: 600, color: chaosColor(c.chaos_score) }}>
                  Chaos {c.chaos_score}
                </span>
              )}
              {c.emotional_tone && c.emotional_tone !== "neutral" && (
                <span style={{ fontSize: 11, color: "var(--dim)" }}>
                  {toneEmoji(c.emotional_tone)} {c.emotional_tone}
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {!isVoice && <CopyBtn getText={() => c.text} size={13} />}
              <IconBtn iconKey="edit" title="Edit title" size={13}
                onClick={() => { setEditTitle(c.title || ""); setEditingTitle(true); }} />
              <DeleteBtn onConfirm={() => onDelete(c.id)} />
            </div>
          </div>

          {/* Theme tags */}
          {(c.themes ?? []).length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 7 }}>
              {c.themes.map(t => (
                <span key={t} style={{
                  fontSize: 10.5, padding: "2px 8px", borderRadius: 100,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
                  color: "rgba(248,248,255,0.45)",
                }}>{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "14px 14px 16px" }}
          onClick={e => e.stopPropagation()}>

          {/* Voice player */}
          {c.audio_url && (
            <div style={{ marginBottom: c.text ? 14 : 0 }}>
              <div style={{ fontSize: 11, color: "var(--dim)",
                marginBottom: 6, textTransform: "uppercase",
                letterSpacing: "0.06em", fontWeight: 600 }}>
                🎙️ Voice Recording
              </div>
              <audio controls src={c.audio_url} style={{
                width: "100%", height: 38, outline: "none", borderRadius: 8,
                accentColor: "#8b5cf6",
              }} />
            </div>
          )}

          {/* Text content */}
          {c.text && !editingText && (
            <>
              <div style={{ fontSize: 11, color: "var(--dim)", marginBottom: 6,
                textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                ✍️ Written Content
              </div>
              <div style={{
                padding: "12px 14px",
                background: "rgba(255,255,255,0.02)",
                borderRadius: 9, fontSize: 13.5, color: "rgba(248,248,255,0.72)",
                lineHeight: 1.78, whiteSpace: "pre-wrap", wordBreak: "break-word",
                borderLeft: "2px solid rgba(139,92,246,0.28)",
                marginBottom: 10,
              }}>
                {c.text}
              </div>
              <Btn variant="ghost" onClick={() => { setEditText(c.text||""); setEditingText(true); }}
                style={{ fontSize: 11, padding: "5px 12px" }}>
                <Ic k="edit" size={11} color="currentColor" /> Edit text
              </Btn>
            </>
          )}

          {/* Edit text */}
          {editingText && (
            <>
              <textarea value={editText} onChange={e => setEditText(e.target.value)} autoFocus
                style={{
                  width: "100%", minHeight: 100,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(139,92,246,0.4)",
                  borderRadius: 10, padding: "11px 13px", color: "#f8f8ff",
                  fontSize: 13.5, fontFamily: "inherit", resize: "vertical",
                  outline: "none", lineHeight: 1.75, boxSizing: "border-box",
                  marginBottom: 8,
                }}
              />
              <div style={{ display: "flex", gap: 7 }}>
                <Btn variant="primary" onClick={saveText} disabled={saving}
                  style={{ fontSize: 11, padding: "6px 14px" }}>
                  <Ic k="save" size={12} color="#fff" /> {saving ? "Saving…" : "Save"}
                </Btn>
                <Btn variant="ghost" onClick={() => { setEditText(c.text||""); setEditingText(false); }}
                  style={{ fontSize: 11, padding: "6px 12px" }}>
                  Cancel
                </Btn>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────
export function BrainDump({ userId, onChronicleAdded }) {
  const [text,       setText]       = useState("");
  const [title,      setTitle]      = useState("");
  const [chronicles, setChronicles] = useState([]);
  const [status,     setStatus]     = useState("idle");
  const [errorMsg,   setErrorMsg]   = useState("");
  const [expanded,   setExpanded]   = useState(null);
  const [activeTab,  setActiveTab]  = useState("text"); // text | voice | session

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    if (!userId) return;
    loadChronicles(userId, 40).then(({ data }) => setChronicles(data));
  }, [userId]);

  const handleSave = useCallback(async () => {
    if (!text.trim() || !userId) return;
    setStatus("analyzing"); setErrorMsg("");
    try {
      const analysis = await analyzeChronicle(text);
      setStatus("saving");
      const { data, error } = await saveChronicle({
        userId, title, text: text.trim(), wordCount, analysis,
      });
      if (error) throw error;
      setChronicles(prev => [data, ...prev]);
      setText(""); setTitle(""); setStatus("saved");
      onChronicleAdded?.();
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      setStatus("error"); setErrorMsg(err.message || "Save failed.");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }, [text, title, userId, wordCount, onChronicleAdded]);

  const handleVoiceSaved = useCallback((data) => {
    if (data) setChronicles(prev => [data, ...prev]);
    onChronicleAdded?.();
  }, [onChronicleAdded]);

  const handleSessionDone = useCallback((data) => {
    if (data) setChronicles(prev => [data, ...prev]);
    onChronicleAdded?.();
    setActiveTab("text");
  }, [onChronicleAdded]);

  const handleUpdate = useCallback(async (id, fields) => {
    const { error } = await updateChronicle(id, fields);
    if (!error) {
      setChronicles(prev => prev.map(c =>
        c.id === id ? { ...c, ...fields,
          word_count: fields.text !== undefined
            ? fields.text.trim().split(/\s+/).filter(Boolean).length
            : c.word_count
        } : c
      ));
    }
    return { error };
  }, []);

  const handleDelete = useCallback(async (id) => {
    const { error } = await deleteChronicle(id);
    if (!error) { setChronicles(prev => prev.filter(c => c.id !== id)); onChronicleAdded?.(); }
    return { error };
  }, [onChronicleAdded]);

  const isBusy = status === "saving" || status === "analyzing";

  const TAB = ({ id, label, emoji }) => (
    <button onClick={() => setActiveTab(id)} style={{
      flex: 1, padding: "9px 0", borderRadius: 9, fontSize: 12.5, fontWeight: 600,
      cursor: "pointer", border: "none", fontFamily: "inherit", transition: "all 0.15s",
      background: activeTab === id ? "rgba(139,92,246,0.18)" : "none",
      color: activeTab === id ? "#c4b5fd" : "rgba(248,248,255,0.38)",
      boxShadow: activeTab === id ? "inset 0 0 0 1px rgba(139,92,246,0.35)" : "none",
    }}>
      {emoji} {label}
    </button>
  );

  return (
    <div className="section-scroll">
      <div className="section-content">

        <div className="section-eyebrow">Module · Capture</div>
        <h1 className="section-heading gradient-text">Brain Dump Sanctuary</h1>
        <p className="section-subheading">
          Zero friction. Zero judgment. Zero organization. Just empty your mind.
        </p>

        {/* Tab switcher */}
        <div style={{
          display: "flex", gap: 4, padding: 5,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 13, marginBottom: 18,
        }}>
          <TAB id="text"    label="Write"   emoji="✍️"  />
          <TAB id="voice"   label="Voice"   emoji="🎙️" />
          <TAB id="session" label="Session" emoji="⏱️"  />
        </div>

        {/* ── TAB: WRITE ── */}
        {activeTab === "text" && (
          <>
            {/* Title input */}
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Title (optional) — or leave blank and AI will name it"
              style={{
                width: "100%", background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10,
                padding: "9px 14px", color: "#f8f8ff", fontSize: 13.5, fontWeight: 600,
                fontFamily: "var(--font-display, 'Sora', sans-serif)",
                outline: "none", boxSizing: "border-box", marginBottom: 10,
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(139,92,246,0.45)"}
              onBlur={e  => e.target.style.borderColor = "rgba(255,255,255,0.09)"}
            />

            {/* Text area with copy button */}
            <div style={{ position: "relative", marginBottom: 12 }}>
              <textarea
                className="dump-textarea"
                style={{ marginBottom: 0, paddingBottom: 40 }}
                rows={9}
                placeholder={"Start typing anything in your head…\n\ngroceries, that thing Sarah said, project deadline, feeling weird about the meeting, taxes — TAXES, why am I tired…\n\nNo rules. No formatting. Just get it out."}
                value={text}
                onChange={e => setText(e.target.value)}
              />
              <div style={{ position: "absolute", bottom: 10, right: 12 }}>
                <CopyBtn getText={() => text} size={15} />
              </div>
            </div>

            {errorMsg && <div className="alert alert-error" style={{ marginBottom: 12 }}>{errorMsg}</div>}

            <div className="dump-actions">
              <button
                className={status === "saved" ? "btn btn-success" : status === "error" ? "btn btn-danger" : isBusy ? "btn btn-ghost" : "btn btn-primary"}
                onClick={handleSave} disabled={!text.trim() || isBusy}>
                {status === "idle"      && "💾 Save Chronicle"}
                {status === "analyzing" && "🧠 Analysing…"}
                {status === "saving"    && "Saving…"}
                {status === "saved"     && "✓ Saved"}
                {status === "error"     && "Error — try again"}
              </button>
              <button className="btn btn-ghost"
                onClick={() => { setText(""); setTitle(""); setStatus("idle"); setErrorMsg(""); }}
                disabled={!text.trim() && !title.trim()}>Clear</button>
              <span className="word-count">{wordCount} words</span>
            </div>

            {status === "analyzing" && (
              <p style={{ fontSize: 12, color: "rgba(139,92,246,0.7)", marginTop: 8 }}>
                🧠 Mindoo is reading your dump…
              </p>
            )}
          </>
        )}

        {/* ── TAB: VOICE ── */}
        {activeTab === "voice" && (
          <VoiceNotePanel userId={userId} title={title} onSaved={handleVoiceSaved} />
        )}

        {/* ── TAB: SESSION ── */}
        {activeTab === "session" && (
          <SessionMode userId={userId} onDone={handleSessionDone} />
        )}

        <div className="divider" />

        {/* Chronicles list */}
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 14 }}>
          <h2 className="section-title" style={{ margin: 0 }}>Your Chronicles</h2>
          <span style={{ fontSize: 12, color: "var(--dim)", fontFamily: "var(--font-mono)" }}>
            {chronicles.length} saved
          </span>
        </div>

        {chronicles.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🧠</div>
            <div className="empty-state-title">No chronicles yet</div>
            <div className="empty-state-desc">Write, record, or run a timed session</div>
          </div>
        )}

        {chronicles.map(c => (
          <ChronicleItem
            key={c.id} c={c}
            expanded={expanded === c.id}
            onToggle={() => setExpanded(p => p === c.id ? null : c.id)}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}

      </div>
    </div>
  );
}
