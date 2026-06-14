// src/pages/sections/JournalSection.jsx
// Mindooo — Journaling Nexus
// Morning charter, evening inventory, free journal, AI insight
// Auto-saves to journal_entries table

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../supabase";
import { callAI } from "../../services/ai";
import { buildContext, buildFullSystemPrompt } from "../../services/context";
import { ENGINE_MAP } from "../../config/modules";

// ── Helpers ───────────────────────────────────────────────────
function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function todayStr() {
  return new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function timeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function wordCount(text) {
  return text?.trim().split(/\s+/).filter(Boolean).length || 0;
}

// ── DB functions ──────────────────────────────────────────────
async function saveEntry(userId, entry) {
  if (entry.id) {
    const { error } = await supabase
      .from("journal_entries")
      .update({ ...entry, updated_at: new Date().toISOString() })
      .eq("id", entry.id)
      .eq("user_id", userId);
    return { error };
  } else {
    const { data, error } = await supabase
      .from("journal_entries")
      .insert({ ...entry, user_id: userId })
      .select()
      .single();
    return { data, error };
  }
}

async function loadEntries(userId, limit = 30) {
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

async function deleteEntry(userId, id) {
  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  return { error };
}

// ── Styles ────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100%",
    padding: "28px 32px 60px",
    maxWidth: "820px",
    margin: "0 auto",
    fontFamily: "Inter, sans-serif",
  },
  header: { marginBottom: "28px" },
  title: {
    fontFamily: "Sora, sans-serif",
    fontWeight: 800,
    fontSize: "28px",
    color: "#fff",
    letterSpacing: "-0.03em",
    margin: "0 0 6px",
  },
  subtitle: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.4)",
    margin: 0,
    lineHeight: 1.6,
  },
  tabs: {
    display: "flex",
    gap: "6px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  tab: (active) => ({
    padding: "8px 18px",
    borderRadius: "99px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    border: active ? "1px solid rgba(139,92,246,0.6)" : "1px solid rgba(255,255,255,0.08)",
    background: active ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
    color: active ? "#a78bfa" : "rgba(255,255,255,0.4)",
    transition: "all 0.2s",
    userSelect: "none",
  }),
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "16px",
  },
  cardTitle: {
    fontFamily: "Sora, sans-serif",
    fontWeight: 700,
    fontSize: "16px",
    color: "#fff",
    margin: "0 0 4px",
  },
  cardDesc: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.35)",
    margin: "0 0 20px",
    lineHeight: 1.6,
  },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: 600,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "6px",
  },
  textarea: {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    padding: "12px 14px",
    color: "#fff",
    fontSize: "14px",
    fontFamily: "Inter, sans-serif",
    outline: "none",
    boxSizing: "border-box",
    resize: "vertical",
    lineHeight: 1.8,
    minHeight: "120px",
    transition: "border-color 0.2s",
  },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    padding: "10px 14px",
    color: "#fff",
    fontSize: "14px",
    fontFamily: "Inter, sans-serif",
    outline: "none",
    boxSizing: "border-box",
  },
  fieldGroup: { marginBottom: "18px" },
  moodRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },
  moodBtn: (active, color) => ({
    padding: "6px 14px",
    borderRadius: "99px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    border: active ? `1px solid ${color}` : "1px solid rgba(255,255,255,0.08)",
    background: active ? `${color}22` : "rgba(255,255,255,0.03)",
    color: active ? color : "rgba(255,255,255,0.4)",
    transition: "all 0.15s",
    userSelect: "none",
  }),
  tagInput: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
  },
  tagList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "8px",
  },
  tag: {
    padding: "4px 10px",
    borderRadius: "99px",
    fontSize: "12px",
    background: "rgba(139,92,246,0.12)",
    border: "1px solid rgba(139,92,246,0.25)",
    color: "#a78bfa",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  saveRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "20px",
    gap: "12px",
    flexWrap: "wrap",
  },
  saveStatus: (s) => ({
    fontSize: "12px",
    color: s === "saved" ? "#22c55e" : s === "error" ? "#ef4444" : "rgba(255,255,255,0.25)",
  }),
  btnPrimary: {
    background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
    border: "none",
    borderRadius: "10px",
    padding: "10px 24px",
    color: "#fff",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "Inter, sans-serif",
  },
  btnSecondary: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    padding: "10px 18px",
    color: "rgba(255,255,255,0.5)",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "Inter, sans-serif",
  },
  aiBox: {
    background: "rgba(139,92,246,0.08)",
    border: "1px solid rgba(139,92,246,0.2)",
    borderRadius: "12px",
    padding: "16px",
    marginTop: "16px",
  },
  aiBoxTitle: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#a78bfa",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  aiBoxText: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.8)",
    lineHeight: 1.7,
  },
  entryCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "16px 18px",
    marginBottom: "10px",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  entryDate: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.3)",
    marginBottom: "4px",
  },
  entryTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#fff",
    marginBottom: "4px",
  },
  entryPreview: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.4)",
    lineHeight: 1.5,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  entryMeta: {
    display: "flex",
    gap: "10px",
    marginTop: "8px",
    fontSize: "11px",
    color: "rgba(255,255,255,0.25)",
  },
  typeTag: (type) => {
    const colors = {
      morning: "#f59e0b",
      evening: "#6366f1",
      free:    "#22c55e",
      reflect: "#ec4899",
    };
    const c = colors[type] || "#a78bfa";
    return {
      padding: "2px 8px",
      borderRadius: "99px",
      fontSize: "10px",
      fontWeight: 700,
      background: `${c}22`,
      border: `1px solid ${c}44`,
      color: c,
    };
  },
  row2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginBottom: "18px",
  },
  energyRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
  },
  energyLabel: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.4)",
    minWidth: "100px",
  },
  energyValue: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#a78bfa",
    minWidth: "30px",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.2)",
    cursor: "pointer",
    fontSize: "13px",
    padding: "2px 6px",
    borderRadius: "4px",
    transition: "color 0.2s",
  },
  wordCountBadge: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.25)",
    marginTop: "4px",
  },
};

// ── Mood options ───────────────────────────────────────────────
const MOODS = [
  { id: "great",     label: "🌟 Great",     color: "#22c55e" },
  { id: "good",      label: "😊 Good",      color: "#60a5fa" },
  { id: "neutral",   label: "😐 Neutral",   color: "#94a3b8" },
  { id: "low",       label: "😔 Low",       color: "#f59e0b" },
  { id: "stressed",  label: "😤 Stressed",  color: "#ef4444" },
  { id: "anxious",   label: "😰 Anxious",   color: "#f97316" },
  { id: "excited",   label: "🚀 Excited",   color: "#a78bfa" },
  { id: "grateful",  label: "🙏 Grateful",  color: "#34d399" },
];

// ── Tag input component ────────────────────────────────────────
function TagInput({ label, value = [], onChange, placeholder }) {
  const [input, setInput] = useState("");

  function add() {
    const t = input.trim();
    if (!t || value.includes(t)) { setInput(""); return; }
    onChange([...value, t]);
    setInput("");
  }

  function remove(tag) { onChange(value.filter(t => t !== tag)); }

  function handleKey(e) {
    if (e.key === "Enter") { e.preventDefault(); add(); }
    if (e.key === "Backspace" && !input && value.length) remove(value[value.length - 1]);
  }

  return (
    <div style={S.fieldGroup}>
      <label style={S.label}>{label}</label>
      {value.length > 0 && (
        <div style={S.tagList}>
          {value.map(t => (
            <span key={t} style={S.tag}>
              {t}
              <span onClick={() => remove(t)} style={{ cursor: "pointer", opacity: 0.6 }}>×</span>
            </span>
          ))}
        </div>
      )}
      <div style={S.tagInput}>
        <input style={S.input} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey} placeholder={placeholder || "Type and press Enter…"} />
        <button style={S.btnSecondary} onClick={add}>Add</button>
      </div>
    </div>
  );
}

// ── Morning Charter ────────────────────────────────────────────
function MorningCharter({ userId, onSaved }) {
  const [entry, setEntry]       = useState({ type: "morning", mood: "good", energy_level: 7, intentions: [], gratitude: [], content: "", title: "" });
  const [saveStatus, setSave]   = useState("idle");
  const [aiInsight, setAI]      = useState("");
  const [aiLoading, setAILoad]  = useState(false);

  function update(field, value) { setEntry(prev => ({ ...prev, [field]: value })); }

  async function save() {
    setSave("saving");
    const toSave = { ...entry, word_count: wordCount(entry.content), title: entry.title || `Morning Charter — ${new Date().toLocaleDateString()}` };
    const { data, error } = await saveEntry(userId, toSave);
    if (error) { setSave("error"); return; }
    if (data?.id) setEntry(prev => ({ ...prev, id: data.id }));
    setSave("saved");
    setTimeout(() => setSave("idle"), 2500);
    onSaved?.();
  }

  async function getAIInsight() {
    if (!entry.content || entry.content.length < 30) return;
    setAILoad(true);
    try {
      const ctx = await buildContext(userId);
      const sys = buildFullSystemPrompt(ctx, "A", "Mo", ENGINE_MAP);
      const result = await callAI({
        messages: [{ role: "user", content: `This is my morning charter for today:\n\nIntentions: ${entry.intentions.join(", ")}\nGratitude: ${entry.gratitude.join(", ")}\nThoughts: ${entry.content}\n\nGive me one specific, science-based insight about my intentions and one concrete suggestion to make today powerful. Be personal and direct. 3-4 sentences max.` }],
        systemPrompt: sys,
        maxTokens: 300,
        userId,
      });
      setAI(result.text);
    } catch { setAI("Could not load insight right now."); }
    setAILoad(false);
  }

  return (
    <div style={S.card}>
      <div style={S.cardTitle}>🌅 Morning Charter</div>
      <div style={S.cardDesc}>Set your intentions before the day sets them for you. Takes 3 minutes.</div>

      <div style={S.fieldGroup}>
        <label style={S.label}>How are you feeling right now?</label>
        <div style={S.moodRow}>
          {MOODS.map(m => (
            <span key={m.id} style={S.moodBtn(entry.mood === m.id, m.color)} onClick={() => update("mood", m.id)}>{m.label}</span>
          ))}
        </div>
      </div>

      <div style={S.energyRow}>
        <span style={S.energyLabel}>Energy Level</span>
        <input type="range" min="1" max="10" value={entry.energy_level}
          onChange={e => update("energy_level", parseInt(e.target.value))}
          style={{ flex: 1, accentColor: "#8b5cf6" }} />
        <span style={S.energyValue}>{entry.energy_level}/10</span>
      </div>

      <TagInput label="What are you grateful for today? (3 things)" value={entry.gratitude}
        onChange={v => update("gratitude", v)} placeholder="Add something you're grateful for…" />

      <TagInput label="What are your top 3 intentions for today?" value={entry.intentions}
        onChange={v => update("intentions", v)} placeholder="Add an intention…" />

      <div style={S.fieldGroup}>
        <label style={S.label}>Morning Thoughts (free write)</label>
        <textarea style={S.textarea} rows={5} value={entry.content}
          onChange={e => update("content", e.target.value)}
          placeholder="What's on your mind? What do you want to accomplish? What are you worried about? Just write…" />
        <div style={S.wordCountBadge}>{wordCount(entry.content)} words</div>
      </div>

      {aiInsight && (
        <div style={S.aiBox}>
          <div style={S.aiBoxTitle}>🤖 Mindooo Insight</div>
          <div style={S.aiBoxText}>{aiInsight}</div>
        </div>
      )}

      <div style={S.saveRow}>
        <span style={S.saveStatus(saveStatus)}>
          {saveStatus === "saving" && "💾 Saving…"}
          {saveStatus === "saved"  && "✓ Saved"}
          {saveStatus === "error"  && "⚠ Save failed"}
          {saveStatus === "idle"   && ""}
        </span>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={S.btnSecondary} onClick={getAIInsight} disabled={aiLoading}>
            {aiLoading ? "Thinking…" : "✦ Get Insight"}
          </button>
          <button style={S.btnPrimary} onClick={save}>Save Charter</button>
        </div>
      </div>
    </div>
  );
}

// ── Evening Inventory ──────────────────────────────────────────
function EveningInventory({ userId, onSaved }) {
  const [entry, setEntry]      = useState({ type: "evening", mood: "neutral", energy_level: 5, wins: [], lessons: [], content: "", title: "" });
  const [saveStatus, setSave]  = useState("idle");
  const [aiInsight, setAI]     = useState("");
  const [aiLoading, setAILoad] = useState(false);

  function update(field, value) { setEntry(prev => ({ ...prev, [field]: value })); }

  async function save() {
    setSave("saving");
    const toSave = { ...entry, word_count: wordCount(entry.content), title: entry.title || `Evening Inventory — ${new Date().toLocaleDateString()}` };
    const { data, error } = await saveEntry(userId, toSave);
    if (error) { setSave("error"); return; }
    if (data?.id) setEntry(prev => ({ ...prev, id: data.id }));
    setSave("saved");
    setTimeout(() => setSave("idle"), 2500);
    onSaved?.();
  }

  async function getAIInsight() {
    if (!entry.content && !entry.wins.length && !entry.lessons.length) return;
    setAILoad(true);
    try {
      const ctx = await buildContext(userId);
      const sys = buildFullSystemPrompt(ctx, "H", "Mo", ENGINE_MAP);
      const result = await callAI({
        messages: [{ role: "user", content: `This is my evening inventory:\n\nWins today: ${entry.wins.join(", ")}\nLessons: ${entry.lessons.join(", ")}\nReflection: ${entry.content}\nMood: ${entry.mood}\n\nGive me one deep insight about the pattern you see in today's reflection — something I might not have noticed myself. Connect it to my growth. Be specific. 3-4 sentences.` }],
        systemPrompt: sys,
        maxTokens: 300,
        userId,
      });
      setAI(result.text);
    } catch { setAI("Could not load insight right now."); }
    setAILoad(false);
  }

  return (
    <div style={S.card}>
      <div style={S.cardTitle}>🌙 Evening Inventory</div>
      <div style={S.cardDesc}>Close the day with clarity. What happened? What did you learn? What deserves celebration?</div>

      <div style={S.fieldGroup}>
        <label style={S.label}>How did the day feel?</label>
        <div style={S.moodRow}>
          {MOODS.map(m => (
            <span key={m.id} style={S.moodBtn(entry.mood === m.id, m.color)} onClick={() => update("mood", m.id)}>{m.label}</span>
          ))}
        </div>
      </div>

      <div style={S.energyRow}>
        <span style={S.energyLabel}>End Energy</span>
        <input type="range" min="1" max="10" value={entry.energy_level}
          onChange={e => update("energy_level", parseInt(e.target.value))}
          style={{ flex: 1, accentColor: "#8b5cf6" }} />
        <span style={S.energyValue}>{entry.energy_level}/10</span>
      </div>

      <TagInput label="Today's wins (big or small — all count)" value={entry.wins}
        onChange={v => update("wins", v)} placeholder="Add a win…" />

      <TagInput label="What did you learn today?" value={entry.lessons}
        onChange={v => update("lessons", v)} placeholder="Add a lesson…" />

      <div style={S.fieldGroup}>
        <label style={S.label}>Evening Reflection (free write)</label>
        <textarea style={S.textarea} rows={5} value={entry.content}
          onChange={e => update("content", e.target.value)}
          placeholder="How did the day go? What would you do differently? What are you thinking about as you close the day?" />
        <div style={S.wordCountBadge}>{wordCount(entry.content)} words</div>
      </div>

      {aiInsight && (
        <div style={S.aiBox}>
          <div style={S.aiBoxTitle}>🤖 Mindooo Insight</div>
          <div style={S.aiBoxText}>{aiInsight}</div>
        </div>
      )}

      <div style={S.saveRow}>
        <span style={S.saveStatus(saveStatus)}>
          {saveStatus === "saving" && "💾 Saving…"}
          {saveStatus === "saved"  && "✓ Saved"}
          {saveStatus === "error"  && "⚠ Save failed"}
          {saveStatus === "idle"   && ""}
        </span>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={S.btnSecondary} onClick={getAIInsight} disabled={aiLoading}>
            {aiLoading ? "Thinking…" : "✦ Get Insight"}
          </button>
          <button style={S.btnPrimary} onClick={save}>Save Inventory</button>
        </div>
      </div>
    </div>
  );
}

// ── Free Journal ───────────────────────────────────────────────
function FreeJournal({ userId, onSaved }) {
  const [entry, setEntry]      = useState({ type: "free", mood: "neutral", energy_level: 5, content: "", title: "" });
  const [saveStatus, setSave]  = useState("idle");
  const [aiInsight, setAI]     = useState("");
  const [aiLoading, setAILoad] = useState(false);

  function update(field, value) { setEntry(prev => ({ ...prev, [field]: value })); }

  const debouncedSave = useCallback(debounce(async (userId, entry) => {
    if (!entry.content || entry.content.length < 20) return;
    setSave("saving");
    const toSave = { ...entry, word_count: wordCount(entry.content), title: entry.title || `Journal — ${new Date().toLocaleDateString()}` };
    const { data, error } = await saveEntry(userId, toSave);
    if (!error && data?.id) setEntry(prev => ({ ...prev, id: data.id }));
    setSave(error ? "error" : "saved");
    setTimeout(() => setSave("idle"), 2000);
  }, 1500), []);

  function handleChange(field, value) {
    const updated = { ...entry, [field]: value };
    setEntry(updated);
    debouncedSave(userId, updated);
  }

  async function getAIInsight() {
    if (!entry.content || entry.content.length < 50) return;
    setAILoad(true);
    try {
      const ctx = await buildContext(userId, entry.content.slice(0, 200));
      const sys = buildFullSystemPrompt(ctx, "A", "Mo", ENGINE_MAP);
      const result = await callAI({
        messages: [{ role: "user", content: `I just wrote this in my journal:\n\n"${entry.content}"\n\nWhat pattern or insight do you see that I might be missing? Be specific, personal, and direct. Reference what I actually wrote. 3-4 sentences.` }],
        systemPrompt: sys,
        maxTokens: 300,
        userId,
      });
      setAI(result.text);
    } catch { setAI("Could not load insight right now."); }
    setAILoad(false);
  }

  async function saveNow() {
    if (!entry.content || entry.content.length < 10) return;
    setSave("saving");
    const toSave = { ...entry, word_count: wordCount(entry.content), title: entry.title || `Journal — ${new Date().toLocaleDateString()}` };
    const { data, error } = await saveEntry(userId, toSave);
    if (!error && data?.id) setEntry(prev => ({ ...prev, id: data.id }));
    setSave(error ? "error" : "saved");
    setTimeout(() => setSave("idle"), 2500);
    onSaved?.();
  }

  return (
    <div style={S.card}>
      <div style={S.cardTitle}>📝 Free Journal</div>
      <div style={S.cardDesc}>No structure. No prompts. Just write whatever is on your mind. Auto-saves as you type.</div>

      <div style={S.fieldGroup}>
        <input style={S.input} value={entry.title} onChange={e => handleChange("title", e.target.value)}
          placeholder={`Journal — ${todayStr()}`} />
      </div>

      <div style={S.fieldGroup}>
        <label style={S.label}>How are you feeling?</label>
        <div style={S.moodRow}>
          {MOODS.map(m => (
            <span key={m.id} style={S.moodBtn(entry.mood === m.id, m.color)} onClick={() => update("mood", m.id)}>{m.label}</span>
          ))}
        </div>
      </div>

      <div style={S.fieldGroup}>
        <textarea style={{ ...S.textarea, minHeight: "240px" }} value={entry.content}
          onChange={e => handleChange("content", e.target.value)}
          placeholder="Just start writing. Don't worry about structure. Let it flow…" />
        <div style={S.wordCountBadge}>{wordCount(entry.content)} words · auto-saves as you type</div>
      </div>

      {aiInsight && (
        <div style={S.aiBox}>
          <div style={S.aiBoxTitle}>🤖 Mindooo Insight</div>
          <div style={S.aiBoxText}>{aiInsight}</div>
        </div>
      )}

      <div style={S.saveRow}>
        <span style={S.saveStatus(saveStatus)}>
          {saveStatus === "saving" && "💾 Saving…"}
          {saveStatus === "saved"  && "✓ Saved"}
          {saveStatus === "error"  && "⚠ Save failed"}
        </span>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={S.btnSecondary} onClick={getAIInsight} disabled={aiLoading || entry.content.length < 50}>
            {aiLoading ? "Thinking…" : "✦ Get Insight"}
          </button>
          <button style={S.btnPrimary} onClick={saveNow}>Save Entry</button>
        </div>
      </div>
    </div>
  );
}

// ── Past Entries ───────────────────────────────────────────────
function PastEntries({ userId, refreshKey }) {
  const [entries,    setEntries]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [expanded,   setExpanded]   = useState(null);
  const [deleting,   setDeleting]   = useState(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    loadEntries(userId).then(data => { setEntries(data); setLoading(false); });
  }, [userId, refreshKey]);

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (deleting === id) {
      await deleteEntry(userId, id);
      setEntries(prev => prev.filter(e => e.id !== id));
      setDeleting(null);
      if (expanded === id) setExpanded(null);
    } else {
      setDeleting(id);
      setTimeout(() => setDeleting(null), 3000);
    }
  }

  const typeLabel = { morning: "🌅 Morning", evening: "🌙 Evening", free: "📝 Free", reflect: "💭 Reflect" };

  if (loading) return <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: "32px", fontSize: "14px" }}>Loading entries…</div>;
  if (!entries.length) return (
    <div style={{ ...S.card, textAlign: "center", padding: "40px" }}>
      <div style={{ fontSize: "32px", marginBottom: "12px" }}>📔</div>
      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>No journal entries yet.</div>
      <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px", marginTop: "4px" }}>Start with a Morning Charter or free write.</div>
    </div>
  );

  return (
    <div>
      {entries.map(entry => (
        <div key={entry.id}>
          <div style={S.entryCard} onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={S.entryDate}>{new Date(entry.created_at).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</div>
                <div style={S.entryTitle}>{entry.title || "Untitled"}</div>
                {!expanded || expanded !== entry.id ? (
                  <div style={S.entryPreview}>{entry.content || (entry.intentions?.join(", ")) || (entry.wins?.join(", ")) || "No content"}</div>
                ) : null}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginLeft: "12px" }}>
                <span style={S.typeTag(entry.type)}>{typeLabel[entry.type] || entry.type}</span>
                <button style={S.deleteBtn} onClick={e => handleDelete(entry.id, e)}>
                  {deleting === entry.id ? "⚠" : "×"}
                </button>
              </div>
            </div>
            <div style={S.entryMeta}>
              {entry.mood && <span>Mood: {entry.mood}</span>}
              {entry.energy_level > 0 && <span>Energy: {entry.energy_level}/10</span>}
              {entry.word_count > 0 && <span>{entry.word_count} words</span>}
              {entry.wins?.length > 0 && <span>{entry.wins.length} wins</span>}
              {entry.intentions?.length > 0 && <span>{entry.intentions.length} intentions</span>}
            </div>
          </div>

          {expanded === entry.id && (
            <div style={{ ...S.card, marginTop: "-8px", borderTop: "none", borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
              {entry.intentions?.length > 0 && (
                <div style={S.fieldGroup}>
                  <label style={S.label}>Intentions</label>
                  <div style={S.tagList}>{entry.intentions.map(t => <span key={t} style={S.tag}>{t}</span>)}</div>
                </div>
              )}
              {entry.gratitude?.length > 0 && (
                <div style={S.fieldGroup}>
                  <label style={S.label}>Gratitude</label>
                  <div style={S.tagList}>{entry.gratitude.map(t => <span key={t} style={S.tag}>{t}</span>)}</div>
                </div>
              )}
              {entry.wins?.length > 0 && (
                <div style={S.fieldGroup}>
                  <label style={S.label}>Wins</label>
                  <div style={S.tagList}>{entry.wins.map(t => <span key={t} style={S.tag}>{t}</span>)}</div>
                </div>
              )}
              {entry.lessons?.length > 0 && (
                <div style={S.fieldGroup}>
                  <label style={S.label}>Lessons</label>
                  <div style={S.tagList}>{entry.lessons.map(t => <span key={t} style={S.tag}>{t}</span>)}</div>
                </div>
              )}
              {entry.content && (
                <div style={S.fieldGroup}>
                  <label style={S.label}>Entry</label>
                  <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{entry.content}</div>
                </div>
              )}
              {entry.ai_insight && (
                <div style={S.aiBox}>
                  <div style={S.aiBoxTitle}>🤖 Mindooo Insight</div>
                  <div style={S.aiBoxText}>{entry.ai_insight}</div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export function JournalSection({ userId }) {
  const tod = timeOfDay();
  const defaultTab = tod === "morning" ? "morning" : tod === "evening" ? "evening" : "free";

  const [tab,        setTab]        = useState(defaultTab);
  const [refreshKey, setRefreshKey] = useState(0);

  function onSaved() { setRefreshKey(k => k + 1); }

  const tabs = [
    { id: "morning", label: "🌅 Morning Charter" },
    { id: "evening", label: "🌙 Evening Inventory" },
    { id: "free",    label: "📝 Free Write" },
    { id: "history", label: "📔 Past Entries" },
  ];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}>Journaling Nexus</h1>
        <p style={S.subtitle}>
          {todayStr()} · {tod === "morning" ? "Good morning — set your intentions." : tod === "evening" ? "Good evening — close the day with clarity." : "A good time to reflect."}
        </p>
      </div>

      <div style={S.tabs}>
        {tabs.map(t => (
          <span key={t.id} style={S.tab(tab === t.id)} onClick={() => setTab(t.id)}>{t.label}</span>
        ))}
      </div>

      {tab === "morning" && <MorningCharter userId={userId} onSaved={onSaved} />}
      {tab === "evening" && <EveningInventory userId={userId} onSaved={onSaved} />}
      {tab === "free"    && <FreeJournal userId={userId} onSaved={onSaved} />}
      {tab === "history" && <PastEntries userId={userId} refreshKey={refreshKey} />}
    </div>
  );
}
