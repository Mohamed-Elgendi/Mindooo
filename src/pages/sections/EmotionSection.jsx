// src/pages/sections/EmotionSection.jsx
// Mindooo — Emotional Mastery
// Emotion logging, trigger mapping, regulation toolkit, AI pattern insight
// Saves to emotional_logs table

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase";
import { callAI } from "../../services/ai";
import { buildContext, buildFullSystemPrompt } from "../../services/context";
import { ENGINE_MAP } from "../../config/modules";

// ── DB functions ──────────────────────────────────────────────
async function saveLog(userId, log) {
  const { data, error } = await supabase
    .from("emotional_logs")
    .insert({ ...log, user_id: userId })
    .select()
    .single();
  return { data, error };
}

async function loadLogs(userId, limit = 50) {
  const { data } = await supabase
    .from("emotional_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

async function deleteLog(userId, id) {
  const { error } = await supabase
    .from("emotional_logs")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  return { error };
}

// ── Emotion wheel ────────────────────────────────────────────
const EMOTIONS = [
  { id: "joy",        label: "Joy",        emoji: "😄", color: "#22c55e", group: "positive" },
  { id: "gratitude",  label: "Gratitude",  emoji: "🙏", color: "#34d399", group: "positive" },
  { id: "excitement", label: "Excitement", emoji: "🤩", color: "#a78bfa", group: "positive" },
  { id: "calm",       label: "Calm",       emoji: "😌", color: "#60a5fa", group: "positive" },
  { id: "pride",      label: "Pride",      emoji: "😎", color: "#fbbf24", color2: "#f59e0b", group: "positive" },
  { id: "anxiety",    label: "Anxiety",    emoji: "😰", color: "#f97316", group: "negative" },
  { id: "stress",     label: "Stress",     emoji: "😤", color: "#ef4444", group: "negative" },
  { id: "frustration",label: "Frustration",emoji: "😠", color: "#dc2626", group: "negative" },
  { id: "sadness",    label: "Sadness",    emoji: "😔", color: "#6366f1", group: "negative" },
  { id: "overwhelm",  label: "Overwhelm",  emoji: "🥵", color: "#f43f5e", group: "negative" },
  { id: "fear",       label: "Fear",       emoji: "😨", color: "#7c3aed", group: "negative" },
  { id: "shame",      label: "Shame",      emoji: "😞", color: "#71717a", group: "negative" },
  { id: "boredom",    label: "Boredom",    emoji: "😑", color: "#94a3b8", group: "neutral" },
  { id: "confusion",  label: "Confusion",  emoji: "😕", color: "#fb923c", group: "neutral" },
  { id: "numbness",   label: "Numbness",   emoji: "😶", color: "#64748b", group: "neutral" },
];

const BODY_LOCATIONS = ["Head", "Chest", "Stomach", "Shoulders", "Throat", "Jaw", "Hands", "Whole body"];

// ── Regulation techniques (science-based library) ─────────────
const TECHNIQUES = [
  {
    id: "box-breathing", name: "Box Breathing", duration: "2 min", icon: "🫁",
    forEmotions: ["anxiety", "stress", "overwhelm", "fear"],
    science: "Activates the parasympathetic nervous system (Jerath et al., 2006)",
    steps: ["Inhale for 4 seconds", "Hold for 4 seconds", "Exhale for 4 seconds", "Hold for 4 seconds", "Repeat 4-6 cycles"],
  },
  {
    id: "name-it", name: "Name It to Tame It", duration: "1 min", icon: "🏷️",
    forEmotions: ["anxiety", "anger", "frustration", "fear", "shame", "overwhelm"],
    science: "Affect labelling reduces amygdala activity (Lieberman et al., 2007)",
    steps: ["Pause and notice the emotion", "Name it precisely — not 'bad', but 'anxious about deadline'", "Say internally: 'I am noticing anxiety'", "Let the precision create distance"],
  },
  {
    id: "5-4-3-2-1", name: "5-4-3-2-1 Grounding", duration: "3 min", icon: "🌍",
    forEmotions: ["anxiety", "overwhelm", "fear", "numbness"],
    science: "Sensory grounding interrupts rumination loops (Najmi & Wegner, 2008)",
    steps: ["Name 5 things you can see", "Name 4 things you can touch", "Name 3 things you can hear", "Name 2 things you can smell", "Name 1 thing you can taste"],
  },
  {
    id: "cognitive-reframe", name: "Cognitive Reframe", duration: "5 min", icon: "🔄",
    forEmotions: ["frustration", "sadness", "shame", "fear"],
    science: "CBT cognitive restructuring (Beck, 1976)",
    steps: ["Write the thought causing this feeling", "Ask: Is this 100% true?", "Ask: What would I tell a friend in this situation?", "Write a more balanced version of the thought"],
  },
  {
    id: "urge-surf", name: "Urge Surfing", duration: "2-5 min", icon: "🌊",
    forEmotions: ["frustration", "overwhelm", "anxiety"],
    science: "Mindful observation of impulses without acting (Linehan, 1993)",
    steps: ["Notice the urge without acting on it", "Observe it like a wave — rising, peaking, falling", "Breathe through the peak", "Notice it naturally subsides within minutes"],
  },
  {
    id: "self-compassion", name: "Self-Compassion Break", duration: "2 min", icon: "💛",
    forEmotions: ["shame", "sadness", "frustration"],
    science: "Self-compassion reduces cortisol and increases resilience (Neff, 2003)",
    steps: ["Place a hand on your heart", "Say: 'This is a moment of difficulty'", "Say: 'Difficulty is part of life'", "Say: 'May I be kind to myself right now'"],
  },
  {
    id: "movement-break", name: "Movement Reset", duration: "3-10 min", icon: "🏃",
    forEmotions: ["stress", "frustration", "boredom", "numbness"],
    science: "Physical movement reduces stress hormones (Salmon, 2001)",
    steps: ["Stand up", "Walk for 3-10 minutes — outside if possible", "Let your mind wander without a goal", "Notice how your body feels different on return"],
  },
  {
    id: "gratitude-shift", name: "Gratitude Shift", duration: "1 min", icon: "✨",
    forEmotions: ["sadness", "boredom", "numbness", "frustration"],
    science: "Gratitude practice increases positive affect (Emmons & McCullough, 2003)",
    steps: ["Pause", "Think of one specific thing — however small — that's good right now", "Notice it fully for 30 seconds", "Let the feeling register before moving on"],
  },
];

// ── Helpers ────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ── Styles ────────────────────────────────────────────────────
const S = {
  page: { minHeight: "100%", padding: "28px 32px 60px", maxWidth: "820px", margin: "0 auto", fontFamily: "Inter, sans-serif" },
  header: { marginBottom: "28px" },
  title: { fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "28px", color: "#fff", letterSpacing: "-0.03em", margin: "0 0 6px" },
  subtitle: { fontSize: "14px", color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.6 },
  tabs: { display: "flex", gap: "6px", marginBottom: "24px", flexWrap: "wrap" },
  tab: (active) => ({
    padding: "8px 18px", borderRadius: "99px", fontSize: "13px", fontWeight: 600, cursor: "pointer",
    border: active ? "1px solid rgba(236,72,153,0.6)" : "1px solid rgba(255,255,255,0.08)",
    background: active ? "rgba(236,72,153,0.15)" : "rgba(255,255,255,0.03)",
    color: active ? "#f472b6" : "rgba(255,255,255,0.4)", transition: "all 0.2s", userSelect: "none",
  }),
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "24px", marginBottom: "16px" },
  cardTitle: { fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "16px", color: "#fff", margin: "0 0 4px" },
  cardDesc: { fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: "0 0 20px", lineHeight: 1.6 },
  label: { display: "block", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "10px" },
  emotionGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "8px", marginBottom: "20px" },
  emotionBtn: (active, color) => ({
    display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "12px 8px",
    borderRadius: "12px", cursor: "pointer", border: active ? `1.5px solid ${color}` : "1px solid rgba(255,255,255,0.08)",
    background: active ? `${color}1a` : "rgba(255,255,255,0.02)", transition: "all 0.15s", userSelect: "none",
  }),
  emotionEmoji: { fontSize: "22px" },
  emotionLabel: (active, color) => ({ fontSize: "11px", fontWeight: 600, color: active ? color : "rgba(255,255,255,0.5)" }),
  fieldGroup: { marginBottom: "18px" },
  input: { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 14px", color: "#fff", fontSize: "14px", fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px 14px", color: "#fff", fontSize: "14px", fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box", resize: "vertical", lineHeight: 1.7, minHeight: "80px" },
  intensityRow: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" },
  intensityLabel: { fontSize: "12px", color: "rgba(255,255,255,0.4)", minWidth: "90px" },
  intensityValue: { fontSize: "14px", fontWeight: 700, color: "#f472b6", minWidth: "30px" },
  tagWrap: { display: "flex", flexWrap: "wrap", gap: "6px" },
  bodyTag: (active) => ({
    padding: "6px 12px", borderRadius: "99px", fontSize: "12px", fontWeight: 500, cursor: "pointer",
    border: active ? "1px solid rgba(236,72,153,0.5)" : "1px solid rgba(255,255,255,0.08)",
    background: active ? "rgba(236,72,153,0.12)" : "rgba(255,255,255,0.02)",
    color: active ? "#f472b6" : "rgba(255,255,255,0.4)", transition: "all 0.15s", userSelect: "none",
  }),
  btnPrimary: { background: "linear-gradient(135deg, #ec4899, #8b5cf6)", border: "none", borderRadius: "10px", padding: "10px 24px", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" },
  btnSecondary: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 18px", color: "rgba(255,255,255,0.5)", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" },
  saveRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "20px", gap: "12px", flexWrap: "wrap" },
  saveStatus: (s) => ({ fontSize: "12px", color: s === "saved" ? "#22c55e" : s === "error" ? "#ef4444" : "rgba(255,255,255,0.25)" }),
  techCard: (highlighted) => ({
    background: highlighted ? "rgba(236,72,153,0.08)" : "rgba(255,255,255,0.02)",
    border: highlighted ? "1px solid rgba(236,72,153,0.3)" : "1px solid rgba(255,255,255,0.06)",
    borderRadius: "14px", padding: "18px", marginBottom: "12px", cursor: "pointer", transition: "all 0.2s",
  }),
  techHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" },
  techIcon: { fontSize: "22px" },
  techName: { fontSize: "14px", fontWeight: 700, color: "#fff" },
  techDuration: { fontSize: "11px", color: "rgba(255,255,255,0.3)", marginLeft: "auto" },
  techScience: { fontSize: "11px", color: "rgba(167,139,250,0.7)", fontStyle: "italic", marginBottom: "10px" },
  techSteps: { fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: 1.8, paddingLeft: "18px", margin: 0 },
  logCard: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "14px 16px", marginBottom: "8px" },
  logRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" },
  logEmotion: { display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 600, color: "#fff" },
  logMeta: { fontSize: "11px", color: "rgba(255,255,255,0.3)" },
  logBody: { fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "6px", lineHeight: 1.6 },
  deleteBtn: { background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: "13px", padding: "2px 6px" },
  aiBox: { background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.2)", borderRadius: "12px", padding: "16px", marginTop: "16px" },
  aiBoxTitle: { fontSize: "11px", fontWeight: 700, color: "#f472b6", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" },
  aiBoxText: { fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: 1.7 },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "20px" },
  statBox: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "14px", textAlign: "center" },
  statValue: { fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "22px", color: "#f472b6" },
  statLabel: { fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px" },
};

// ── Emotion Logger ───────────────────────────────────────────
function EmotionLogger({ userId, onSaved }) {
  const [selectedEmotion, setSelected] = useState(null);
  const [intensity, setIntensity]      = useState(5);
  const [trigger, setTrigger]          = useState("");
  const [context, setContext]          = useState("");
  const [bodyLocs, setBodyLocs]        = useState([]);
  const [saveStatus, setSave]          = useState("idle");
  const [suggestedTechs, setSuggested] = useState([]);

  function toggleBody(loc) {
    setBodyLocs(prev => prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]);
  }

  function selectEmotion(emo) {
    setSelected(emo);
    const matches = TECHNIQUES.filter(t => t.forEmotions.includes(emo.id));
    setSuggested(matches.slice(0, 3));
  }

  async function save() {
    if (!selectedEmotion) return;
    setSave("saving");
    const { error } = await saveLog(userId, {
      emotion: selectedEmotion.id,
      intensity,
      trigger,
      context,
      body_location: bodyLocs,
    });
    if (error) { setSave("error"); return; }
    setSave("saved");
    setTimeout(() => {
      setSave("idle");
      setSelected(null);
      setIntensity(5);
      setTrigger("");
      setContext("");
      setBodyLocs([]);
      setSuggested([]);
    }, 1500);
    onSaved?.();
  }

  return (
    <div style={S.card}>
      <div style={S.cardTitle}>💭 How are you feeling right now?</div>
      <div style={S.cardDesc}>Name it precisely. The act of naming an emotion reduces its intensity (Lieberman et al., 2007).</div>

      <div style={S.emotionGrid}>
        {EMOTIONS.map(e => (
          <div key={e.id} style={S.emotionBtn(selectedEmotion?.id === e.id, e.color)} onClick={() => selectEmotion(e)}>
            <span style={S.emotionEmoji}>{e.emoji}</span>
            <span style={S.emotionLabel(selectedEmotion?.id === e.id, e.color)}>{e.label}</span>
          </div>
        ))}
      </div>

      {selectedEmotion && (
        <>
          <div style={S.intensityRow}>
            <span style={S.intensityLabel}>Intensity</span>
            <input type="range" min="1" max="10" value={intensity} onChange={e => setIntensity(parseInt(e.target.value))}
              style={{ flex: 1, accentColor: selectedEmotion.color }} />
            <span style={{ ...S.intensityValue, color: selectedEmotion.color }}>{intensity}/10</span>
          </div>

          <div style={S.fieldGroup}>
            <label style={S.label}>What triggered this?</label>
            <input style={S.input} value={trigger} onChange={e => setTrigger(e.target.value)}
              placeholder="e.g. Looked at my unfinished tasks list…" />
          </div>

          <div style={S.fieldGroup}>
            <label style={S.label}>Where do you feel it in your body?</label>
            <div style={S.tagWrap}>
              {BODY_LOCATIONS.map(loc => (
                <span key={loc} style={S.bodyTag(bodyLocs.includes(loc))} onClick={() => toggleBody(loc)}>{loc}</span>
              ))}
            </div>
          </div>

          <div style={S.fieldGroup}>
            <label style={S.label}>Anything else? (optional)</label>
            <textarea style={S.textarea} rows={2} value={context} onChange={e => setContext(e.target.value)}
              placeholder="Any additional context…" />
          </div>

          {suggestedTechs.length > 0 && (
            <div style={S.fieldGroup}>
              <label style={S.label}>Suggested techniques for {selectedEmotion.label.toLowerCase()}</label>
              {suggestedTechs.map(t => (
                <div key={t.id} style={{ ...S.techCard(false), marginBottom: "8px", cursor: "default" }}>
                  <div style={S.techHeader}>
                    <span style={S.techIcon}>{t.icon}</span>
                    <span style={S.techName}>{t.name}</span>
                    <span style={S.techDuration}>{t.duration}</span>
                  </div>
                  <div style={S.techScience}>{t.science}</div>
                </div>
              ))}
            </div>
          )}

          <div style={S.saveRow}>
            <span style={S.saveStatus(saveStatus)}>
              {saveStatus === "saving" && "💾 Saving…"}
              {saveStatus === "saved"  && "✓ Logged"}
              {saveStatus === "error"  && "⚠ Save failed"}
            </span>
            <button style={S.btnPrimary} onClick={save}>Log This Feeling</button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Regulation Toolkit ────────────────────────────────────────
function RegulationToolkit() {
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter]     = useState("all");

  const filtered = filter === "all" ? TECHNIQUES : TECHNIQUES.filter(t => t.forEmotions.includes(filter));

  const filterOptions = [
    { id: "all",       label: "All" },
    { id: "anxiety",   label: "😰 Anxiety" },
    { id: "stress",    label: "😤 Stress" },
    { id: "overwhelm", label: "🥵 Overwhelm" },
    { id: "sadness",   label: "😔 Sadness" },
    { id: "frustration", label: "😠 Frustration" },
  ];

  return (
    <div style={S.card}>
      <div style={S.cardTitle}>🧰 Regulation Toolkit</div>
      <div style={S.cardDesc}>Evidence-based techniques. Click a technique to see the steps.</div>

      <div style={{ ...S.tagWrap, marginBottom: "18px" }}>
        {filterOptions.map(f => (
          <span key={f.id} style={S.bodyTag(filter === f.id)} onClick={() => setFilter(f.id)}>{f.label}</span>
        ))}
      </div>

      {filtered.map(t => (
        <div key={t.id} style={S.techCard(expanded === t.id)} onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
          <div style={S.techHeader}>
            <span style={S.techIcon}>{t.icon}</span>
            <span style={S.techName}>{t.name}</span>
            <span style={S.techDuration}>{t.duration}</span>
          </div>
          <div style={S.techScience}>{t.science}</div>
          {expanded === t.id && (
            <ol style={S.techSteps}>
              {t.steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Pattern Insight ────────────────────────────────────────────
function PatternInsight({ userId, logs }) {
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);

  async function getInsight() {
    if (logs.length < 3) return;
    setLoading(true);
    try {
      const summary = logs.slice(0, 20).map(l =>
        `${new Date(l.created_at).toLocaleDateString()}: ${l.emotion} (intensity ${l.intensity}/10)${l.trigger ? ` — trigger: ${l.trigger}` : ""}`
      ).join("\n");

      const ctx = await buildContext(userId);
      const sys = buildFullSystemPrompt(ctx, "C", "Mo", ENGINE_MAP);
      const result = await callAI({
        messages: [{ role: "user", content: `Here are my recent emotional logs:\n\n${summary}\n\nWhat pattern do you see? Identify triggers, timing patterns, or emotional cycles I might not notice myself. Be specific and reference the actual data. End with one concrete suggestion. 4-5 sentences max.` }],
        systemPrompt: sys,
        maxTokens: 350,
        userId,
      });
      setInsight(result.text);
    } catch { setInsight("Could not analyze patterns right now."); }
    setLoading(false);
  }

  if (logs.length < 3) {
    return (
      <div style={{ ...S.card, textAlign: "center", padding: "32px" }}>
        <div style={{ fontSize: "28px", marginBottom: "10px" }}>📊</div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>Log at least 3 emotions to unlock pattern analysis.</div>
      </div>
    );
  }

  // Compute basic stats
  const counts = {};
  logs.forEach(l => { counts[l.emotion] = (counts[l.emotion] || 0) + 1; });
  const topEmotion = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const avgIntensity = (logs.reduce((s, l) => s + l.intensity, 0) / logs.length).toFixed(1);
  const emotionDef = EMOTIONS.find(e => e.id === topEmotion?.[0]);

  return (
    <div style={S.card}>
      <div style={S.cardTitle}>📊 Emotional Patterns</div>
      <div style={S.cardDesc}>Based on your last {logs.length} logged emotions.</div>

      <div style={S.statsRow}>
        <div style={S.statBox}>
          <div style={S.statValue}>{emotionDef?.emoji} {topEmotion?.[1]}x</div>
          <div style={S.statLabel}>Most logged: {topEmotion?.[0]}</div>
        </div>
        <div style={S.statBox}>
          <div style={S.statValue}>{avgIntensity}</div>
          <div style={S.statLabel}>Avg intensity</div>
        </div>
        <div style={S.statBox}>
          <div style={S.statValue}>{logs.length}</div>
          <div style={S.statLabel}>Total logs</div>
        </div>
      </div>

      {insight && (
        <div style={S.aiBox}>
          <div style={S.aiBoxTitle}>🤖 Mindooo Insight</div>
          <div style={S.aiBoxText}>{insight}</div>
        </div>
      )}

      <div style={S.saveRow}>
        <span />
        <button style={S.btnSecondary} onClick={getInsight} disabled={loading}>
          {loading ? "Analyzing…" : "✦ Find My Patterns"}
        </button>
      </div>
    </div>
  );
}

// ── History ────────────────────────────────────────────────────
function History({ userId, logs, onDeleted }) {
  const [deleting, setDeleting] = useState(null);

  async function handleDelete(id) {
    if (deleting === id) {
      await deleteLog(userId, id);
      onDeleted?.();
      setDeleting(null);
    } else {
      setDeleting(id);
      setTimeout(() => setDeleting(null), 3000);
    }
  }

  if (!logs.length) {
    return (
      <div style={{ ...S.card, textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>💜</div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>No emotions logged yet.</div>
        <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px", marginTop: "4px" }}>Start by logging how you feel right now.</div>
      </div>
    );
  }

  return (
    <div>
      {logs.map(log => {
        const emo = EMOTIONS.find(e => e.id === log.emotion);
        return (
          <div key={log.id} style={S.logCard}>
            <div style={S.logRow}>
              <div style={S.logEmotion}>
                <span style={{ fontSize: "18px" }}>{emo?.emoji || "💭"}</span>
                <span style={{ color: emo?.color || "#fff" }}>{emo?.label || log.emotion}</span>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>· {log.intensity}/10</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={S.logMeta}>{timeAgo(log.created_at)}</span>
                <button style={S.deleteBtn} onClick={() => handleDelete(log.id)}>{deleting === log.id ? "⚠" : "×"}</button>
              </div>
            </div>
            {(log.trigger || log.context || log.body_location?.length > 0) && (
              <div style={S.logBody}>
                {log.trigger && <div>Trigger: {log.trigger}</div>}
                {log.body_location?.length > 0 && <div>Felt in: {log.body_location.join(", ")}</div>}
                {log.context && <div>{log.context}</div>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export function EmotionSection({ userId }) {
  const [tab, setTab]   = useState("log");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (!userId) return;
    loadLogs(userId).then(data => { setLogs(data); setLoading(false); });
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  const tabs = [
    { id: "log",      label: "💭 Log Emotion" },
    { id: "toolkit",  label: "🧰 Toolkit" },
    { id: "patterns", label: "📊 Patterns" },
    { id: "history",  label: "📋 History" },
  ];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}>Emotional Mastery</h1>
        <p style={S.subtitle}>Know what you feel, why you feel it, and what to do about it.</p>
      </div>

      <div style={S.tabs}>
        {tabs.map(t => (
          <span key={t.id} style={S.tab(tab === t.id)} onClick={() => setTab(t.id)}>{t.label}</span>
        ))}
      </div>

      {tab === "log"      && <EmotionLogger userId={userId} onSaved={refresh} />}
      {tab === "toolkit"  && <RegulationToolkit />}
      {tab === "patterns" && <PatternInsight userId={userId} logs={logs} />}
      {tab === "history"  && <History userId={userId} logs={logs} onDeleted={refresh} />}
    </div>
  );
}
