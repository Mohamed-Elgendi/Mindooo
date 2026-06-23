// src/pages/sections/HabitSection.jsx
// Mindooo — Habit Transformation Engine
// Habit loop mapper, identity-based design, streak tracker, AI-assisted creation
// Saves to habits and habit_logs tables

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase";
import { callAI } from "../../services/ai";
import { buildContext, buildFullSystemPrompt } from "../../services/context";
import { ENGINE_MAP } from "../../config/modules";

// ── DB functions ──────────────────────────────────────────────
async function loadHabits(userId) {
  const { data } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true)
    .order("created_at", { ascending: true });
  return data || [];
}

async function createHabit(userId, habit) {
  const { data, error } = await supabase
    .from("habits")
    .insert({ ...habit, user_id: userId })
    .select()
    .single();
  return { data, error };
}

async function archiveHabit(userId, id) {
  const { error } = await supabase
    .from("habits")
    .update({ active: false })
    .eq("id", id)
    .eq("user_id", userId);
  return { error };
}

async function loadLogsForHabit(userId, habitId, days = 70) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("habit_id", habitId)
    .gte("log_date", since.toISOString().split("T")[0])
    .order("log_date", { ascending: true });
  return data || [];
}

async function toggleLog(userId, habitId, dateStr, currentlyDone) {
  if (currentlyDone) {
    const { error } = await supabase
      .from("habit_logs")
      .delete()
      .eq("user_id", userId)
      .eq("habit_id", habitId)
      .eq("log_date", dateStr);
    return { error };
  } else {
    const { error } = await supabase
      .from("habit_logs")
      .upsert({ user_id: userId, habit_id: habitId, log_date: dateStr, completed: true }, { onConflict: "habit_id,log_date" });
    return { error };
  }
}

// ── Streak calculation ──────────────────────────────────────────
function calcStreak(logs) {
  if (!logs.length) return { current: 0, longest: 0 };
  const dates = new Set(logs.map(l => l.log_date));
  let current = 0;
  let cursor = new Date();

  // If today not done, check if yesterday was — streak continues until missed
  for (let i = 0; i < 365; i++) {
    const dateStr = cursor.toISOString().split("T")[0];
    if (dates.has(dateStr)) {
      current++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      if (i === 0) { cursor.setDate(cursor.getDate() - 1); continue; } // today not yet logged, ok
      break;
    }
  }

  // Longest streak
  const sorted = [...dates].sort();
  let longest = 0, run = 0, prev = null;
  for (const d of sorted) {
    if (prev) {
      const diff = (new Date(d) - new Date(prev)) / 86400000;
      run = diff === 1 ? run + 1 : 1;
    } else { run = 1; }
    longest = Math.max(longest, run);
    prev = d;
  }

  return { current, longest: Math.max(longest, current) };
}

function dateStr(d) { return d.toISOString().split("T")[0]; }
function last70Days() {
  const days = [];
  for (let i = 69; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(dateStr(d));
  }
  return days;
}

// ── Styles ────────────────────────────────────────────────────
const S = {
  page: { minHeight: "100%", padding: "28px 32px 60px", maxWidth: "820px", margin: "0 auto", fontFamily: "Inter, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" },
  title: { fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "28px", color: "#fff", letterSpacing: "-0.03em", margin: "0 0 6px" },
  subtitle: { fontSize: "14px", color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.6 },
  btnPrimary: { background: "linear-gradient(135deg, #22c55e, #3b82f6)", border: "none", borderRadius: "10px", padding: "10px 22px", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif", whiteSpace: "nowrap" },
  btnSecondary: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 18px", color: "rgba(255,255,255,0.5)", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "22px", marginBottom: "16px" },
  habitHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", gap: "10px" },
  habitTitleRow: { display: "flex", alignItems: "center", gap: "10px" },
  habitIcon: (color) => ({ width: "36px", height: "36px", borderRadius: "10px", background: `${color}22`, border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }),
  habitName: { fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "15px", color: "#fff" },
  habitIdentity: { fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "2px" },
  streakBadge: (color) => ({ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 700, color }),
  todayBtn: (done, color) => ({
    width: "44px", height: "44px", borderRadius: "12px", border: done ? `1.5px solid ${color}` : "1px solid rgba(255,255,255,0.1)",
    background: done ? `${color}22` : "rgba(255,255,255,0.03)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "20px", transition: "all 0.15s", flexShrink: 0,
  }),
  gridWrap: { display: "flex", gap: "2px", overflowX: "auto", paddingBottom: "4px" },
  gridCell: (done, color) => ({
    width: "10px", height: "10px", borderRadius: "2px",
    background: done ? color : "rgba(255,255,255,0.06)", flexShrink: 0,
  }),
  gridLabel: { fontSize: "10px", color: "rgba(255,255,255,0.25)", marginBottom: "6px" },
  loopGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginTop: "14px" },
  loopBox: (color) => ({ background: `${color}0d`, border: `1px solid ${color}33`, borderRadius: "10px", padding: "10px", textAlign: "center" }),
  loopLabel: (color) => ({ fontSize: "10px", fontWeight: 700, color, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "4px" }),
  loopText: { fontSize: "12px", color: "rgba(255,255,255,0.7)", lineHeight: 1.4 },
  archiveBtn: { background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: "12px" },
  // Modal
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
  modal: { background: "#13131f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "28px", maxWidth: "560px", width: "100%", maxHeight: "85vh", overflowY: "auto" },
  modalTitle: { fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "20px", color: "#fff", margin: "0 0 6px" },
  modalDesc: { fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: "0 0 20px", lineHeight: 1.6 },
  label: { display: "block", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" },
  input: { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 14px", color: "#fff", fontSize: "14px", fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box" },
  fieldGroup: { marginBottom: "14px" },
  categoryRow: { display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" },
  categoryBtn: (active, color) => ({
    padding: "8px 16px", borderRadius: "99px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
    border: active ? `1px solid ${color}` : "1px solid rgba(255,255,255,0.08)",
    background: active ? `${color}1a` : "rgba(255,255,255,0.02)", color: active ? color : "rgba(255,255,255,0.4)",
  }),
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" },
  aiBox: { background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "12px", padding: "14px", marginTop: "14px" },
  aiBoxTitle: { fontSize: "11px", fontWeight: 700, color: "#4ade80", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" },
  aiBoxText: { fontSize: "13px", color: "rgba(255,255,255,0.8)", lineHeight: 1.6 },
  empty: { textAlign: "center", padding: "50px 20px" },
};

const CATEGORIES = [
  { id: "build",  label: "Build (new habit)", color: "#22c55e", icon: "🌱" },
  { id: "break",  label: "Break (eliminate)",  color: "#ef4444", icon: "✂️" },
  { id: "health", label: "Health",             color: "#06b6d4", icon: "💪" },
  { id: "focus",  label: "Focus & Work",       color: "#8b5cf6", icon: "🎯" },
  { id: "mind",   label: "Mind & Spirit",      color: "#f59e0b", icon: "🧘" },
];

const CATEGORY_ICONS = { build: "🌱", break: "✂️", health: "💪", focus: "🎯", mind: "🧘" };

// ── New Habit Modal ────────────────────────────────────────────
function NewHabitModal({ userId, onClose, onCreated }) {
  const [name, setName]               = useState("");
  const [identity, setIdentity]       = useState("");
  const [category, setCategory]       = useState("build");
  const [cue, setCue]                 = useState("");
  const [craving, setCraving]         = useState("");
  const [response, setResponse]       = useState("");
  const [reward, setReward]           = useState("");
  const [stackAnchor, setStackAnchor] = useState("");
  const [aiHelp, setAiHelp]           = useState("");
  const [aiLoading, setAiLoading]     = useState(false);
  const [saving, setSaving]           = useState(false);

  async function getAIHelp() {
    if (!name.trim()) return;
    setAiLoading(true);
    try {
      const ctx = await buildContext(userId);
      const sys = buildFullSystemPrompt(ctx, "B", "Mo", ENGINE_MAP);
      const result = await callAI({
        messages: [{ role: "user", content: `I want to build this habit: "${name}".\n\nHelp me design the habit loop using Atomic Habits principles. Give me:\n1. An identity statement ("I am someone who...")\n2. A specific cue (when/where this happens)\n3. A specific reward (immediate, satisfying)\n4. One habit stacking suggestion (attach to an existing habit)\n\nBe concise — 4 short lines, one per item, no headers.` }],
        systemPrompt: sys,
        maxTokens: 250,
        userId,
      });
      setAiHelp(result.text);
    } catch { setAiHelp("Could not generate suggestions right now."); }
    setAiLoading(false);
  }

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    const cat = CATEGORIES.find(c => c.id === category);
    const { error } = await createHabit(userId, {
      name: name.trim(),
      identity_statement: identity.trim(),
      cue: cue.trim(),
      craving: craving.trim(),
      response: response.trim(),
      reward: reward.trim(),
      stack_anchor: stackAnchor.trim(),
      category,
      color: cat?.color || "#22c55e",
      icon: cat?.icon || "✓",
    });
    setSaving(false);
    if (!error) { onCreated?.(); onClose(); }
  }

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <h2 style={S.modalTitle}>New Habit</h2>
        <p style={S.modalDesc}>Design it using the habit loop: cue → craving → response → reward.</p>

        <div style={S.fieldGroup}>
          <label style={S.label}>Habit Name</label>
          <input style={S.input} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Morning brain dump, No social media before noon…" />
        </div>

        <div style={S.fieldGroup}>
          <label style={S.label}>Category</label>
          <div style={S.categoryRow}>
            {CATEGORIES.map(c => (
              <span key={c.id} style={S.categoryBtn(category === c.id, c.color)} onClick={() => setCategory(c.id)}>{c.icon} {c.label}</span>
            ))}
          </div>
        </div>

        <div style={S.fieldGroup}>
          <label style={S.label}>Identity Statement — "I am someone who..."</label>
          <input style={S.input} value={identity} onChange={e => setIdentity(e.target.value)} placeholder="e.g. I am someone who protects their mornings" />
        </div>

        <div style={S.fieldGroup}>
          <label style={S.label}>Cue — When/where does this happen?</label>
          <input style={S.input} value={cue} onChange={e => setCue(e.target.value)} placeholder="e.g. Right after I wake up and sit at my desk" />
        </div>

        <div style={S.fieldGroup}>
          <label style={S.label}>Reward — What's the immediate payoff?</label>
          <input style={S.input} value={reward} onChange={e => setReward(e.target.value)} placeholder="e.g. Mental clarity, checking it off the list" />
        </div>

        <div style={S.fieldGroup}>
          <label style={S.label}>Habit Stack — Attach to existing habit (optional)</label>
          <input style={S.input} value={stackAnchor} onChange={e => setStackAnchor(e.target.value)} placeholder="e.g. After I make coffee, I will..." />
        </div>

        {aiHelp && (
          <div style={S.aiBox}>
            <div style={S.aiBoxTitle}>🤖 Mindooo Suggestions</div>
            <div style={S.aiBoxText} style={{ whiteSpace: "pre-line" }}>{aiHelp}</div>
          </div>
        )}

        <div style={S.modalActions}>
          <button style={S.btnSecondary} onClick={getAIHelp} disabled={aiLoading || !name.trim()}>
            {aiLoading ? "Thinking…" : "✦ Get AI Help"}
          </button>
          <button style={S.btnSecondary} onClick={onClose}>Cancel</button>
          <button style={S.btnPrimary} onClick={save} disabled={saving || !name.trim()}>
            {saving ? "Saving…" : "Create Habit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Habit Card ───────────────────────────────────────────────
function HabitCard({ userId, habit, onRefresh }) {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const today = dateStr(new Date());

  useEffect(() => {
    loadLogsForHabit(userId, habit.id).then(data => { setLogs(data); setLoading(false); });
  }, [userId, habit.id]);

  const doneDates = new Set(logs.map(l => l.log_date));
  const todayDone = doneDates.has(today);
  const { current, longest } = calcStreak(logs);
  const days70 = last70Days();

  async function toggleToday() {
    await toggleLog(userId, habit.id, today, todayDone);
    const updated = await loadLogsForHabit(userId, habit.id);
    setLogs(updated);
  }

  async function handleArchive() {
    if (confirm(`Archive "${habit.name}"? Your history will be kept.`)) {
      await archiveHabit(userId, habit.id);
      onRefresh?.();
    }
  }

  return (
    <div style={S.card}>
      <div style={S.habitHeader}>
        <div style={S.habitTitleRow}>
          <div style={S.habitIcon(habit.color)}>{habit.icon}</div>
          <div>
            <div style={S.habitName}>{habit.name}</div>
            {habit.identity_statement && <div style={S.habitIdentity}>{habit.identity_statement}</div>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={S.streakBadge(habit.color)}>🔥 {current}</div>
          <div style={S.todayBtn(todayDone, habit.color)} onClick={toggleToday}>
            {todayDone ? "✓" : ""}
          </div>
        </div>
      </div>

      <div style={S.gridLabel}>Last 70 days · longest streak: {longest}</div>
      <div style={S.gridWrap}>
        {days70.map(d => (
          <div key={d} style={S.gridCell(doneDates.has(d), habit.color)} title={d} />
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
        <span style={{ ...S.archiveBtn, color: "rgba(255,255,255,0.3)", cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
          {expanded ? "Hide loop ▲" : "Show loop ▼"}
        </span>
        <span style={S.archiveBtn} onClick={handleArchive}>Archive</span>
      </div>

      {expanded && (
        <div style={S.loopGrid}>
          <div style={S.loopBox(habit.color)}>
            <div style={S.loopLabel(habit.color)}>Cue</div>
            <div style={S.loopText}>{habit.cue || "—"}</div>
          </div>
          <div style={S.loopBox(habit.color)}>
            <div style={S.loopLabel(habit.color)}>Craving</div>
            <div style={S.loopText}>{habit.craving || "—"}</div>
          </div>
          <div style={S.loopBox(habit.color)}>
            <div style={S.loopLabel(habit.color)}>Response</div>
            <div style={S.loopText}>{habit.name}</div>
          </div>
          <div style={S.loopBox(habit.color)}>
            <div style={S.loopLabel(habit.color)}>Reward</div>
            <div style={S.loopText}>{habit.reward || "—"}</div>
          </div>
          {habit.stack_anchor && (
            <div style={{ ...S.loopBox(habit.color), gridColumn: "span 4" }}>
              <div style={S.loopLabel(habit.color)}>Habit Stack</div>
              <div style={S.loopText}>{habit.stack_anchor}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export function HabitSection({ userId }) {
  const [habits, setHabits]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const refresh = useCallback(() => {
    if (!userId) return;
    loadHabits(userId).then(data => { setHabits(data); setLoading(false); });
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Habit Transformation</h1>
          <p style={S.subtitle}>Build who you're becoming, one identity-based habit at a time.</p>
        </div>
        <button style={S.btnPrimary} onClick={() => setShowModal(true)}>+ New Habit</button>
      </div>

      {loading && (
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: "32px", fontSize: "14px" }}>Loading habits…</div>
      )}

      {!loading && habits.length === 0 && (
        <div style={{ ...S.card, ...S.empty }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔄</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "15px", fontWeight: 600, marginBottom: "6px" }}>No habits yet</div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", marginBottom: "18px" }}>
            Identity-based habit design: change who you believe you are, and behaviour follows (Clear, 2018).
          </div>
          <button style={S.btnPrimary} onClick={() => setShowModal(true)}>Create Your First Habit</button>
        </div>
      )}

      {!loading && habits.map(h => (
        <HabitCard key={h.id} userId={userId} habit={h} onRefresh={refresh} />
      ))}

      {showModal && (
        <NewHabitModal userId={userId} onClose={() => setShowModal(false)} onCreated={refresh} />
      )}
    </div>
  );
}
