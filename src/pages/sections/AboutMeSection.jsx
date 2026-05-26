// src/pages/sections/AboutMeSection.jsx
// Mindooo — About Me / Self-Discovery Module
// Progressive 14-section profile. Saves to user_about_me table.

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase";

// ── Helpers ───────────────────────────────────────────────────────
function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

async function loadProfile(userId) {
  const { data } = await supabase
    .from("user_about_me")
    .select("*")
    .eq("user_id", userId)
    .single();
  return data || null;
}

async function saveProfile(userId, patch) {
  const { data: existing } = await supabase
    .from("user_about_me")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("user_about_me")
      .update({ ...patch, last_updated: new Date().toISOString() })
      .eq("user_id", userId);
    return { error };
  } else {
    const { error } = await supabase
      .from("user_about_me")
      .insert({ user_id: userId, ...patch, last_updated: new Date().toISOString() });
    return { error };
  }
}

function calcCompletion(profile) {
  if (!profile) return 0;
  const fields = [
    profile.employment_status, profile.location, profile.ideal_day,
    profile.work_preference, profile.learning_style, profile.peak_hours?.length,
    profile.love_doing?.length, profile.good_at?.length, profile.top_values?.length,
    profile.ikigai_statement, profile.freedom_definition, profile.dream_no_constraints,
    profile.mental_blockers?.length, profile.known_difficulties,
  ];
  const filled = fields.filter(f => f && f !== "" && f !== 0).length;
  return Math.round((filled / fields.length) * 100);
}

// ── Styles ────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100%",
    padding: "28px 32px 60px",
    maxWidth: "760px",
    margin: "0 auto",
    fontFamily: "Inter, sans-serif",
  },
  header: {
    marginBottom: "32px",
  },
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
  progressWrap: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    padding: "16px 20px",
    marginBottom: "28px",
  },
  progressRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  progressLabel: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.5)",
    fontWeight: 500,
  },
  progressPct: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#a78bfa",
  },
  progressBar: {
    height: "6px",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "99px",
    overflow: "hidden",
  },
  progressFill: (pct) => ({
    height: "100%",
    width: `${pct}%`,
    background: "linear-gradient(90deg, #8b5cf6, #3b82f6)",
    borderRadius: "99px",
    transition: "width 0.5s ease",
  }),
  sectionNav: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "28px",
  },
  navPill: (active) => ({
    padding: "6px 14px",
    borderRadius: "99px",
    fontSize: "12px",
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
    fontSize: "15px",
    color: "#fff",
    margin: "0 0 4px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
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
    transition: "border-color 0.2s",
    resize: "vertical",
    lineHeight: 1.6,
  },
  select: {
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
    cursor: "pointer",
    appearance: "none",
  },
  fieldGroup: {
    marginBottom: "18px",
  },
  row2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginBottom: "18px",
  },
  tagWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "8px",
  },
  tag: (active) => ({
    padding: "5px 12px",
    borderRadius: "99px",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
    border: active ? "1px solid rgba(139,92,246,0.6)" : "1px solid rgba(255,255,255,0.1)",
    background: active ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
    color: active ? "#a78bfa" : "rgba(255,255,255,0.5)",
    transition: "all 0.15s",
    userSelect: "none",
  }),
  addTagRow: {
    display: "flex",
    gap: "8px",
    marginTop: "8px",
  },
  addTagInput: {
    flex: 1,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    padding: "7px 12px",
    color: "#fff",
    fontSize: "13px",
    fontFamily: "Inter, sans-serif",
    outline: "none",
  },
  addTagBtn: {
    background: "rgba(139,92,246,0.2)",
    border: "1px solid rgba(139,92,246,0.3)",
    borderRadius: "8px",
    padding: "7px 14px",
    color: "#a78bfa",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "Inter, sans-serif",
  },
  saveIndicator: (saved) => ({
    fontSize: "11px",
    color: saved ? "#22c55e" : "rgba(255,255,255,0.25)",
    marginTop: "8px",
    transition: "color 0.3s",
  }),
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    paddingBottom: "14px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  sectionIcon: {
    fontSize: "22px",
  },
  sectionTitleBlock: {},
  sectionTitle: {
    fontFamily: "Sora, sans-serif",
    fontWeight: 800,
    fontSize: "18px",
    color: "#fff",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  sectionSubtitle: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.35)",
    margin: "2px 0 0",
  },
  aiHint: {
    background: "rgba(139,92,246,0.08)",
    border: "1px solid rgba(139,92,246,0.2)",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "12px",
    color: "rgba(167,139,250,0.8)",
    marginBottom: "20px",
    lineHeight: 1.6,
  },
  navButtons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "24px",
    gap: "12px",
  },
  btnSecondary: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    padding: "10px 20px",
    color: "rgba(255,255,255,0.5)",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "Inter, sans-serif",
  },
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
};

// ── Reusable field components ─────────────────────────────────────
function TextField({ label, field, value, onChange, placeholder, rows = 3, hint }) {
  return (
    <div style={S.fieldGroup}>
      <label style={S.label}>{label}</label>
      {hint && <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginBottom: "6px" }}>{hint}</div>}
      <textarea
        style={S.input}
        rows={rows}
        value={value || ""}
        placeholder={placeholder || ""}
        onChange={e => onChange(field, e.target.value)}
      />
    </div>
  );
}

function SelectField({ label, field, value, onChange, options, hint }) {
  return (
    <div style={S.fieldGroup}>
      <label style={S.label}>{label}</label>
      {hint && <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginBottom: "6px" }}>{hint}</div>}
      <select
        style={S.select}
        value={value || ""}
        onChange={e => onChange(field, e.target.value)}
      >
        <option value="">— Select —</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function TagField({ label, field, value = [], onChange, suggestions = [], placeholder, hint }) {
  const [input, setInput] = useState("");

  function add(tag) {
    const t = tag.trim();
    if (!t || value.includes(t)) return;
    onChange(field, [...value, t]);
    setInput("");
  }

  function remove(tag) {
    onChange(field, value.filter(t => t !== tag));
  }

  function handleKey(e) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(input); }
    if (e.key === "Backspace" && !input && value.length) remove(value[value.length - 1]);
  }

  return (
    <div style={S.fieldGroup}>
      <label style={S.label}>{label}</label>
      {hint && <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginBottom: "6px" }}>{hint}</div>}
      {value.length > 0 && (
        <div style={S.tagWrap}>
          {value.map(t => (
            <span key={t} style={{ ...S.tag(true), display: "flex", alignItems: "center", gap: "5px" }}>
              {t}
              <span onClick={() => remove(t)} style={{ cursor: "pointer", opacity: 0.6, fontSize: "11px" }}>×</span>
            </span>
          ))}
        </div>
      )}
      {suggestions.length > 0 && (
        <div style={{ ...S.tagWrap, marginBottom: "8px" }}>
          {suggestions.filter(s => !value.includes(s)).slice(0, 8).map(s => (
            <span key={s} style={S.tag(false)} onClick={() => add(s)}>{s}</span>
          ))}
        </div>
      )}
      <div style={S.addTagRow}>
        <input
          style={S.addTagInput}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder || "Type and press Enter…"}
        />
        <button style={S.addTagBtn} onClick={() => add(input)}>Add</button>
      </div>
    </div>
  );
}

function ToggleField({ label, field, value, onChange, hint }) {
  return (
    <div style={{ ...S.fieldGroup, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: "13px", color: "#fff", fontWeight: 500 }}>{label}</div>
        {hint && <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>{hint}</div>}
      </div>
      <div
        onClick={() => onChange(field, !value)}
        style={{
          width: "40px", height: "22px", borderRadius: "99px", cursor: "pointer",
          background: value ? "linear-gradient(135deg,#8b5cf6,#3b82f6)" : "rgba(255,255,255,0.1)",
          position: "relative", transition: "background 0.2s", flexShrink: 0,
        }}
      >
        <div style={{
          position: "absolute", top: "3px", left: value ? "21px" : "3px",
          width: "16px", height: "16px", borderRadius: "50%", background: "#fff",
          transition: "left 0.2s",
        }} />
      </div>
    </div>
  );
}

// ── Section definitions ───────────────────────────────────────────
const SECTIONS = [
  { id: "situation",     label: "Situation",    icon: "📍" },
  { id: "personality",   label: "Personality",  icon: "🧠" },
  { id: "energy",        label: "Energy",       icon: "⚡" },
  { id: "passions",      label: "Passions",     icon: "🔥" },
  { id: "values",        label: "Values",       icon: "🧭" },
  { id: "ikigai",        label: "Ikigai",       icon: "🌀" },
  { id: "finance",       label: "Finance",      icon: "💰" },
  { id: "relationships", label: "Connections",  icon: "🤝" },
  { id: "dreams",        label: "Dreams",       icon: "🌙" },
  { id: "blockers",      label: "Blockers",     icon: "🛡️" },
  { id: "health",        label: "Health",       icon: "💪" },
  { id: "cognitive",     label: "Cognitive",    icon: "⚙️" },
];

// ── Individual section renderers ──────────────────────────────────
function SectionSituation({ profile, onChange }) {
  return (
    <>
      <div style={S.aiHint}>
        🤖 This section helps the AI understand where you are right now. Without this, every recommendation is generic.
      </div>
      <div style={S.row2}>
        <SelectField label="Employment Status" field="employment_status" value={profile.employment_status} onChange={onChange}
          options={[
            { value: "building", label: "Building something" },
            { value: "employed-full", label: "Employed full-time" },
            { value: "employed-part", label: "Employed part-time" },
            { value: "self-employed", label: "Self-employed" },
            { value: "unemployed", label: "Unemployed" },
            { value: "student", label: "Student" },
          ]} />
        <TextField label="Current Work / Role" field="current_job" value={profile.current_job} onChange={onChange} rows={1} placeholder="e.g. Building Mindooo" />
      </div>
      <div style={S.row2}>
        <TextField label="Location" field="location" value={profile.location} onChange={onChange} rows={1} placeholder="e.g. Cairo, Egypt" />
        <SelectField label="Income Range (Monthly)" field="monthly_income_range" value={profile.monthly_income_range} onChange={onChange}
          options={[
            { value: "<500", label: "Under $500" },
            { value: "500-1000", label: "$500 – $1,000" },
            { value: "1000-2000", label: "$1,000 – $2,000" },
            { value: "2000-5000", label: "$2,000 – $5,000" },
            { value: "5000+", label: "$5,000+" },
            { value: "prefer-not", label: "Prefer not to say" },
          ]} />
      </div>
      <TagField label="Your 3 Biggest Constraints Right Now" field="main_constraints" value={profile.main_constraints} onChange={onChange}
        suggestions={["No income", "No coding skills", "Limited time", "Health issues", "Family responsibilities", "No team", "No capital"]}
        hint="What's holding you back most right now?" />
      <TextField label="Describe Your Ideal Day (wake to sleep)" field="ideal_day" value={profile.ideal_day} onChange={onChange} rows={4}
        placeholder="Walk me through your perfect day in detail…" />
      <TextField label="Describe Your Actual Day Yesterday (be honest)" field="actual_day" value={profile.actual_day} onChange={onChange} rows={4}
        placeholder="What did you actually do from morning to night?" />
    </>
  );
}

function SectionPersonality({ profile, onChange }) {
  return (
    <>
      <div style={S.aiHint}>
        🤖 This is your operating manual. The AI adapts its communication, learning paths, and recommendations entirely based on how your brain works.
      </div>
      <div style={S.row2}>
        <SelectField label="How Do You Work Best?" field="work_preference" value={profile.work_preference} onChange={onChange}
          options={[
            { value: "alone", label: "Alone — deep solo work" },
            { value: "team", label: "In a team — collaborative" },
            { value: "mix", label: "Mix of both" },
          ]} />
        <SelectField label="How Do You Make Decisions?" field="decision_style" value={profile.decision_style} onChange={onChange}
          options={[
            { value: "logic", label: "Logic & analysis first" },
            { value: "intuition", label: "Gut & intuition first" },
            { value: "both", label: "Blend of both" },
          ]} />
      </div>
      <div style={S.row2}>
        <SelectField label="How Do You Communicate Best?" field="communication_style" value={profile.communication_style} onChange={onChange}
          options={[
            { value: "written", label: "Written — clear and precise" },
            { value: "verbal", label: "Verbal — talking it through" },
            { value: "visual", label: "Visual — diagrams, maps" },
            { value: "mix", label: "Mix" },
          ]} />
        <SelectField label="How Do You Learn Best?" field="learning_style" value={profile.learning_style} onChange={onChange}
          options={[
            { value: "watching", label: "Watching — videos, demos" },
            { value: "reading", label: "Reading — books, articles" },
            { value: "doing", label: "Doing — hands-on, trial" },
            { value: "listening", label: "Listening — audio, talk" },
            { value: "mix", label: "Mix of styles" },
          ]} />
      </div>
      <TagField label="Describe Yourself in 5 Words (honest, not aspirational)" field="self_description" value={profile.self_description} onChange={onChange}
        suggestions={["Creative", "Ambitious", "Scattered", "Sensitive", "Determined", "Overthinking", "Visionary", "Restless", "Disciplined", "Empathetic"]}
        placeholder="Add a word…" />
      <TextField label="What Do People Who Know You Well Say About You?" field="others_description" value={profile.others_description} onChange={onChange} rows={3}
        placeholder="What do your closest people say — the honest version, not the flattering one?" />
      <div style={S.row2}>
        <SelectField label="MBTI Type (if known)" field="mbti_type" value={profile.mbti_type} onChange={onChange}
          options={["INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP","ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"].map(t => ({ value: t, label: t }))} />
        <SelectField label="Enneagram Type (if known)" field="enneagram_type" value={profile.enneagram_type} onChange={onChange}
          options={[1,2,3,4,5,6,7,8,9].map(n => ({ value: String(n), label: `Type ${n}` }))} />
      </div>
    </>
  );
}

function SectionEnergy({ profile, onChange }) {
  return (
    <>
      <div style={S.aiHint}>
        🤖 The AI schedules all recommendations around your biological rhythms — not the clock. This section unlocks personalised energy management.
      </div>
      <TagField label="When Are You Sharpest and Most Creative?" field="peak_hours" value={profile.peak_hours} onChange={onChange}
        suggestions={["Early morning (5-8am)", "Morning (8-11am)", "Late morning (10am-12pm)", "Afternoon (1-4pm)", "Evening (6-9pm)", "Late night (10pm+)"]}
        hint="Select all that apply" placeholder="Add a time…" />
      <TextField label="When Do You Typically Crash or Feel Foggy?" field="energy_crashes" value={profile.energy_crashes} onChange={onChange} rows={2}
        placeholder="e.g. After lunch, around 3pm, after social interaction…" />
      <TagField label="What Drains Your Energy Fastest?" field="energy_drains" value={profile.energy_drains} onChange={onChange}
        suggestions={["Social media", "Unclear tasks", "Conflict", "Meetings", "Multitasking", "Decisions", "Noise", "People pleasing", "Perfectionism"]}
        placeholder="Add an energy drain…" />
      <TagField label="What Restores Your Energy Most Reliably?" field="energy_restorers" value={profile.energy_restorers} onChange={onChange}
        suggestions={["Sleep", "Exercise", "Nature", "Alone time", "Music", "Reading", "Creative work", "Social time", "Meditation", "Walking"]}
        placeholder="Add an energy restorer…" />
    </>
  );
}

function SectionPassions({ profile, onChange }) {
  return (
    <>
      <div style={S.aiHint}>
        🤖 Not your performative interests — your genuine ones. The ones nobody told you to have. This is where your Ikigai begins.
      </div>
      <TextField label="What Topics Do You Read About When Nobody Is Watching?" field="reading_topics" value={Array.isArray(profile.reading_topics) ? profile.reading_topics.join(", ") : profile.reading_topics} onChange={(f, v) => onChange(f, v.split(",").map(s => s.trim()).filter(Boolean))} rows={2}
        placeholder="AI, psychology, productivity, history…" />
      <TextField label="What Could You Talk About For Hours Without Getting Bored?" field="endless_topics" value={Array.isArray(profile.endless_topics) ? profile.endless_topics.join(", ") : profile.endless_topics} onChange={(f, v) => onChange(f, v.split(",").map(s => s.trim()).filter(Boolean))} rows={2}
        placeholder="Topics that make you forget time…" />
      <TextField label="What Did You Love Doing as a Child Before Anyone Told You What to Be?" field="childhood_loves" value={Array.isArray(profile.childhood_loves) ? profile.childhood_loves.join(", ") : profile.childhood_loves} onChange={(f, v) => onChange(f, v.split(",").map(s => s.trim()).filter(Boolean))} rows={2}
        placeholder="Drawing, building things, storytelling, exploring…" />
      <TagField label="Skills That Feel Effortless to You But Hard for Others" field="effortless_skills" value={profile.effortless_skills} onChange={onChange}
        suggestions={["Seeing patterns", "Explaining complex things", "Creative thinking", "Empathy", "Writing", "Problem solving", "Building systems", "Connecting ideas"]}
        placeholder="Add a skill…" />
      <TagField label="Skills You Wish You Had" field="desired_skills" value={profile.desired_skills} onChange={onChange}
        suggestions={["Coding", "Design", "Public speaking", "Marketing", "Sales", "Video editing", "Data analysis", "Writing"]}
        placeholder="Add a desired skill…" />
    </>
  );
}

function SectionValues({ profile, onChange }) {
  const ALL_VALUES = [
    "Freedom", "Family", "Creativity", "Security", "Health", "Adventure",
    "Learning", "Impact", "Wealth", "Recognition", "Authenticity", "Connection",
    "Growth", "Stability", "Justice", "Beauty", "Independence", "Collaboration",
    "Innovation", "Compassion", "Excellence", "Balance", "Honesty", "Loyalty",
    "Purpose", "Curiosity", "Generosity", "Resilience", "Wisdom", "Playfulness",
  ];

  function toggleValue(v) {
    const cur = profile.top_values || [];
    if (cur.includes(v)) {
      onChange("top_values", cur.filter(x => x !== v));
    } else if (cur.length < 7) {
      onChange("top_values", [...cur, v]);
    }
  }

  return (
    <>
      <div style={S.aiHint}>
        🤖 The AI filters every recommendation through your values. A goal that conflicts with your values will never stick — the AI knows this.
      </div>
      <div style={S.fieldGroup}>
        <label style={S.label}>Your Top Values (pick up to 7)</label>
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginBottom: "10px" }}>
          {(profile.top_values || []).length}/7 selected
        </div>
        <div style={S.tagWrap}>
          {ALL_VALUES.map(v => (
            <span key={v} style={S.tag((profile.top_values || []).includes(v))} onClick={() => toggleValue(v)}>{v}</span>
          ))}
        </div>
      </div>
      <TextField label="What Would You Refuse to Do Even If It Paid Very Well?" field="would_refuse" value={profile.would_refuse} onChange={onChange} rows={2}
        placeholder="Be specific — what are your hard limits?" />
      <TextField label="What Would You Do Even If It Paid Nothing?" field="would_do_free" value={profile.would_do_free} onChange={onChange} rows={2}
        placeholder="The thing you'd do purely for its own sake…" />
      <TagField label="Your Non-Negotiables in Life" field="non_negotiables" value={profile.non_negotiables} onChange={onChange}
        suggestions={["Time with family", "Creative freedom", "Physical health", "Intellectual growth", "Financial independence", "Honesty", "Autonomy"]}
        placeholder="Add a non-negotiable…" />
    </>
  );
}

function SectionIkigai({ profile, onChange }) {
  return (
    <>
      <div style={S.aiHint}>
        🤖 Ikigai is the Japanese concept of "reason for being." The AI uses this intersection to suggest aligned career paths, projects, and daily actions.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "18px" }}>
        <div style={{ ...S.card, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)", margin: 0 }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#a78bfa", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "10px" }}>❤️ What You Love</div>
          <textarea style={{ ...S.input, minHeight: "80px" }} value={Array.isArray(profile.love_doing) ? profile.love_doing.join(", ") : profile.love_doing || ""}
            onChange={e => onChange("love_doing", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
            placeholder="Activities, topics, experiences that genuinely excite you…" />
        </div>
        <div style={{ ...S.card, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", margin: 0 }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#60a5fa", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "10px" }}>⚡ What You're Good At</div>
          <textarea style={{ ...S.input, minHeight: "80px" }} value={Array.isArray(profile.good_at) ? profile.good_at.join(", ") : profile.good_at || ""}
            onChange={e => onChange("good_at", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
            placeholder="Skills, talents, things that come naturally…" />
        </div>
        <div style={{ ...S.card, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", margin: 0 }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#4ade80", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "10px" }}>🌍 What The World Needs</div>
          <textarea style={{ ...S.input, minHeight: "80px" }} value={Array.isArray(profile.world_needs) ? profile.world_needs.join(", ") : profile.world_needs || ""}
            onChange={e => onChange("world_needs", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
            placeholder="Problems you can solve, needs you can meet…" />
        </div>
        <div style={{ ...S.card, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", margin: 0 }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#fbbf24", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "10px" }}>💰 What You Can Be Paid For</div>
          <textarea style={{ ...S.input, minHeight: "80px" }} value={Array.isArray(profile.can_be_paid_for) ? profile.can_be_paid_for.join(", ") : profile.can_be_paid_for || ""}
            onChange={e => onChange("can_be_paid_for", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
            placeholder="Services, products, expertise people would pay for…" />
        </div>
      </div>
      <TextField label="Your Ikigai Statement — The Intersection (AI will help refine this)" field="ikigai_statement" value={profile.ikigai_statement} onChange={onChange} rows={3}
        placeholder='e.g. "My ikigai is helping overwhelmed people build clarity through AI-powered systems — combining my love for psychology, my skill at simplifying complexity, and the world\'s need for better thinking tools."' />
    </>
  );
}

function SectionFinance({ profile, onChange }) {
  return (
    <>
      <div style={S.aiHint}>
        🤖 The AI cannot suggest realistic income strategies without knowing your current reality. This section is private — it lives only in your profile.
      </div>
      <TextField label="Describe Your Current Financial Situation Honestly" field="financial_situation" value={profile.financial_situation} onChange={onChange} rows={4}
        placeholder="Where do you stand financially right now? Be specific and honest." />
      <TextField label="What Is Your Monthly Income Target for Feeling Free?" field="monthly_target" value={profile.monthly_target} onChange={onChange} rows={1}
        placeholder="e.g. $3,000/month would mean genuine freedom for me because…" />
      <TextField label="What Is Your Relationship With Money?" field="money_relationship" value={profile.money_relationship} onChange={onChange} rows={3}
        placeholder="How do you feel about money? What patterns do you notice?" />
      <TagField label="Current Income Sources" field="income_sources" value={profile.income_sources} onChange={onChange}
        suggestions={["Freelance", "Job salary", "Side project", "Family support", "Savings", "None currently"]}
        placeholder="Add an income source…" />
      <TagField label="Financial Blockers Holding You Back" field="financial_blockers" value={profile.financial_blockers} onChange={onChange}
        suggestions={["No savings", "Debt", "Scarcity mindset", "No clients", "No product", "Fear of pricing", "No financial knowledge"]}
        placeholder="Add a blocker…" />
    </>
  );
}

function SectionRelationships({ profile, onChange }) {
  return (
    <>
      <div style={S.aiHint}>
        🤖 Your relationships shape your energy and trajectory. The AI maps who lifts you up and who drains you — then builds strategy around that reality.
      </div>
      <TagField label="People Who Energise and Support You Most" field="top_supporters" value={profile.top_supporters} onChange={onChange}
        suggestions={["Partner", "Parent", "Friend", "Mentor", "Online community", "Coach"]}
        placeholder="Add a name or type…" />
      <TagField label="People Who Consistently Drain Your Energy" field="energy_draining_people" value={profile.energy_draining_people} onChange={onChange}
        suggestions={["Negative family member", "Toxic colleague", "Unsupportive friend", "Critical parent"]}
        placeholder="Add a type (no names needed)…" />
      <ToggleField label="Do you have a mentor or someone you actively learn from?" field="has_mentor" value={profile.has_mentor} onChange={onChange} />
      {profile.has_mentor && (
        <TextField label="Who Is Your Mentor? (brief description)" field="mentor_name" value={profile.mentor_name} onChange={onChange} rows={1}
          placeholder="e.g. A business mentor I speak with monthly…" />
      )}
      <TextField label="What Kind of Support Are You Missing Most?" field="support_gaps" value={profile.support_gaps} onChange={onChange} rows={3}
        placeholder="What support would make the biggest difference to you right now?" />
      <SelectField label="What Is Your Relationship With Asking for Help?" field="help_relationship" value={profile.help_relationship} onChange={onChange}
        options={[
          { value: "easy", label: "Easy — I ask freely" },
          { value: "uncomfortable", label: "Uncomfortable but I do it" },
          { value: "hard", label: "Very hard — I rarely ask" },
          { value: "never", label: "I never ask for help" },
        ]} />
    </>
  );
}

function SectionDreams({ profile, onChange }) {
  return (
    <>
      <div style={S.aiHint}>
        🤖 This section anchors the AI to your real vision — not a generic success template. Every goal, plan, and recommendation will be filtered through what you actually want.
      </div>
      <TextField label="If You Had No Constraints, What Would You Build or Do?" field="dream_no_constraints" value={profile.dream_no_constraints} onChange={onChange} rows={4}
        placeholder="No limits on money, skills, or time. What would you actually create?" />
      <TextField label="What Does Freedom Look Like for You — Specifically?" field="freedom_definition" value={profile.freedom_definition} onChange={onChange} rows={3}
        placeholder="Freedom means something specific to you. What does it look like in your life?" />
      <TextField label="What Does Success Look Like for You — Specifically?" field="success_definition" value={profile.success_definition} onChange={onChange} rows={3}
        placeholder="Not society's definition — yours. What would make you feel genuinely successful?" />
      <TextField label="What Is the Thing You Most Want But Are Most Afraid to Pursue?" field="most_wanted_afraid" value={profile.most_wanted_afraid} onChange={onChange} rows={3}
        placeholder="The dream with the most fear attached to it…" />
      <TextField label="What Do You Want to Leave Behind? (Legacy)" field="legacy_desire" value={profile.legacy_desire} onChange={onChange} rows={3}
        placeholder="In 20 years, what do you want to have created, changed, or contributed?" />
    </>
  );
}

function SectionBlockers({ profile, onChange }) {
  return (
    <>
      <div style={S.aiHint}>
        🤖 This is the most important section. The AI cannot help you break through what it doesn't know about. Everything that follows is private — used only to help you.
      </div>
      <TagField label="Mental Blockers (thoughts that hold you back)" field="mental_blockers" value={profile.mental_blockers} onChange={onChange}
        suggestions={["Procrastination", "Perfectionism", "Overthinking", "Fear of failure", "Imposter syndrome", "Self-doubt", "Analysis paralysis"]}
        placeholder="Add a mental blocker…" />
      <TagField label="Limiting Beliefs (stories you tell yourself)" field="limiting_beliefs" value={profile.limiting_beliefs} onChange={onChange}
        suggestions={["I'm not smart enough", "I'm too old/young", "I always fail", "I'm not technical", "I don't deserve success", "It's too late for me"]}
        placeholder="Add a limiting belief…" />
      <TagField label="Self-Sabotage Patterns (where you consistently get in your own way)" field="self_sabotage_patterns" value={profile.self_sabotage_patterns} onChange={onChange}
        suggestions={["Give up before finishing", "Distract with social media", "Start too many things", "Avoid important tasks", "Undercharge", "Don't ask for help"]}
        placeholder="Add a pattern…" />
      <TagField label="Psychological Blockers (fears, anxieties, past wounds)" field="psychological_blockers" value={profile.psychological_blockers} onChange={onChange}
        suggestions={["Fear of rejection", "Fear of judgment", "Fear of success", "Anxiety", "Past trauma affecting decisions", "Attachment issues"]}
        placeholder="Add a psychological blocker…" />
      <TagField label="Physical Blockers (health, body, environment)" field="physical_blockers" value={profile.physical_blockers} onChange={onChange}
        suggestions={["Low energy", "Poor sleep", "No exercise", "Chronic pain", "Poor nutrition", "Noisy environment"]}
        placeholder="Add a physical blocker…" />
      <TextField label="Past Experience That Still Affects Your Decisions Today" field="past_affecting_present" value={profile.past_affecting_present} onChange={onChange} rows={3}
        placeholder="What happened that still shapes how you think or act?" />
    </>
  );
}

function SectionHealth({ profile, onChange }) {
  return (
    <>
      <div style={S.aiHint}>
        🤖 Cognitive performance, emotional regulation, and creative output are all downstream of physical health. The AI uses this to calibrate recommendations realistically.
      </div>
      <div style={S.row2}>
        <SelectField label="Exercise Pattern" field="exercise_pattern" value={profile.exercise_pattern} onChange={onChange}
          options={[
            { value: "daily", label: "Daily" },
            { value: "3-4x", label: "3-4x per week" },
            { value: "1-2x", label: "1-2x per week" },
            { value: "rarely", label: "Rarely" },
            { value: "never", label: "Never" },
          ]} />
        <SelectField label="Sleep Quality" field="sleep_quality" value={profile.sleep_quality} onChange={onChange}
          options={[
            { value: "excellent", label: "Excellent — deep, consistent" },
            { value: "good", label: "Good — mostly fine" },
            { value: "fair", label: "Fair — sometimes poor" },
            { value: "poor", label: "Poor — regularly disrupted" },
          ]} />
      </div>
      <div style={S.row2}>
        <SelectField label="Nutrition Quality" field="nutrition_quality" value={profile.nutrition_quality} onChange={onChange}
          options={[
            { value: "excellent", label: "Excellent" },
            { value: "good", label: "Good" },
            { value: "fair", label: "Fair" },
            { value: "poor", label: "Poor" },
          ]} />
        <div style={S.fieldGroup}>
          <label style={S.label}>Daily Energy Level (1-10)</label>
          <input type="range" min="1" max="10" value={profile.body_energy_level || 5}
            onChange={e => onChange("body_energy_level", parseInt(e.target.value))}
            style={{ width: "100%", accentColor: "#8b5cf6", marginTop: "8px" }} />
          <div style={{ textAlign: "center", color: "#a78bfa", fontSize: "13px", fontWeight: 700, marginTop: "4px" }}>
            {profile.body_energy_level || 5}/10
          </div>
        </div>
      </div>
      <TagField label="Health Concerns or Challenges" field="health_concerns" value={profile.health_concerns} onChange={onChange}
        suggestions={["Chronic fatigue", "Anxiety", "Depression", "Back pain", "Poor sleep", "Digestive issues", "Headaches"]}
        placeholder="Add a concern…" />
    </>
  );
}

function SectionCognitive({ profile, onChange }) {
  return (
    <>
      <div style={S.aiHint}>
        🤖 This tells the AI how your brain works — its strengths, its challenges, and how it learns best. Every explanation, exercise, and plan will be adapted to this.
      </div>
      <TagField label="Known Learning Difficulties or Neurodivergent Patterns" field="known_difficulties" value={profile.known_difficulties} onChange={onChange}
        suggestions={["Dyslexia", "ADHD", "Dyscalculia", "Autism", "Anxiety", "None identified"]}
        placeholder="Add a difficulty…" hint="This is private. The AI adapts to support you, not judge you." />
      <div style={S.row2}>
        <SelectField label="How Is Your Memory?" field="memory_self_rating" value={profile.memory_self_rating} onChange={onChange}
          options={[
            { value: "strong", label: "Strong — I remember well" },
            { value: "average", label: "Average — depends on topic" },
            { value: "weak", label: "Weak — I forget quickly" },
          ]} />
        <div style={S.fieldGroup}>
          <label style={S.label}>Focus Duration Before Mind Wanders (mins)</label>
          <input type="range" min="5" max="120" step="5" value={profile.focus_duration_mins || 25}
            onChange={e => onChange("focus_duration_mins", parseInt(e.target.value))}
            style={{ width: "100%", accentColor: "#8b5cf6", marginTop: "8px" }} />
          <div style={{ textAlign: "center", color: "#a78bfa", fontSize: "13px", fontWeight: 700, marginTop: "4px" }}>
            {profile.focus_duration_mins || 25} mins
          </div>
        </div>
      </div>
      <div style={S.row2}>
        <SelectField label="Preferred Way to Receive Information" field="preferred_input" value={profile.preferred_input} onChange={onChange}
          options={[
            { value: "visual", label: "Visual — diagrams, images" },
            { value: "auditory", label: "Auditory — spoken, audio" },
            { value: "reading", label: "Reading — text, books" },
            { value: "kinesthetic", label: "Doing — hands-on" },
            { value: "mix", label: "Mix of styles" },
          ]} />
        <SelectField label="Preferred Way to Show Understanding" field="preferred_output" value={profile.preferred_output} onChange={onChange}
          options={[
            { value: "writing", label: "Writing it out" },
            { value: "speaking", label: "Explaining verbally" },
            { value: "doing", label: "Building / making" },
            { value: "teaching", label: "Teaching others" },
          ]} />
      </div>
      <TextField label="What Are You Currently Trying to Learn? What's Blocking You?" field="current_learning" value={profile.current_learning} onChange={onChange} rows={3}
        placeholder="e.g. I'm trying to understand AI/ML but get lost in the math…" />
    </>
  );
}

// ── Main component ────────────────────────────────────────────────
export function AboutMeSection({ userId }) {
  const [profile,       setProfile]       = useState({});
  const [loading,       setLoading]       = useState(true);
  const [activeSection, setActiveSection] = useState("situation");
  const [saveStatus,    setSaveStatus]    = useState("idle"); // idle | saving | saved | error

  // Load on mount
  useEffect(() => {
    if (!userId) return;
    loadProfile(userId).then(data => {
      setProfile(data || {});
      setLoading(false);
    });
  }, [userId]);

  // Debounced auto-save
  const debouncedSave = useCallback(
    debounce(async (userId, patch) => {
      setSaveStatus("saving");
      const completion = calcCompletion(patch);
      const { error } = await saveProfile(userId, { ...patch, completion_pct: completion });
      setSaveStatus(error ? "error" : "saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    }, 1200),
    []
  );

  function onChange(field, value) {
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    debouncedSave(userId, updated);
  }

  const currentIdx  = SECTIONS.findIndex(s => s.id === activeSection);
  const completion  = calcCompletion(profile);

  function goNext() {
    if (currentIdx < SECTIONS.length - 1) setActiveSection(SECTIONS[currentIdx + 1].id);
  }
  function goPrev() {
    if (currentIdx > 0) setActiveSection(SECTIONS[currentIdx - 1].id);
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px", color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>
        Loading your profile…
      </div>
    );
  }

  const sec = SECTIONS.find(s => s.id === activeSection);

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <h1 style={S.title}>About Me</h1>
        <p style={S.subtitle}>Your living self-discovery profile. The AI uses every answer to personalise every response.</p>
      </div>

      {/* Progress bar */}
      <div style={S.progressWrap}>
        <div style={S.progressRow}>
          <span style={S.progressLabel}>Profile Completion</span>
          <span style={S.progressPct}>{completion}%</span>
        </div>
        <div style={S.progressBar}>
          <div style={S.progressFill(completion)} />
        </div>
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", marginTop: "8px" }}>
          {completion < 30 && "Fill in more sections to unlock personalised AI responses"}
          {completion >= 30 && completion < 60 && "Good progress — the AI is getting to know you"}
          {completion >= 60 && completion < 90 && "Almost there — the AI has strong context about you"}
          {completion >= 90 && "✓ Full profile — the AI knows you deeply"}
        </div>
      </div>

      {/* Section nav pills */}
      <div style={S.sectionNav}>
        {SECTIONS.map(s => (
          <span key={s.id} style={S.navPill(activeSection === s.id)} onClick={() => setActiveSection(s.id)}>
            {s.icon} {s.label}
          </span>
        ))}
      </div>

      {/* Active section card */}
      <div style={S.card}>
        <div style={S.sectionHeader}>
          <span style={S.sectionIcon}>{sec.icon}</span>
          <div style={S.sectionTitleBlock}>
            <h2 style={S.sectionTitle}>{sec.label}</h2>
            <p style={S.sectionSubtitle}>Section {currentIdx + 1} of {SECTIONS.length}</p>
          </div>
        </div>

        {activeSection === "situation"     && <SectionSituation     profile={profile} onChange={onChange} />}
        {activeSection === "personality"   && <SectionPersonality   profile={profile} onChange={onChange} />}
        {activeSection === "energy"        && <SectionEnergy        profile={profile} onChange={onChange} />}
        {activeSection === "passions"      && <SectionPassions      profile={profile} onChange={onChange} />}
        {activeSection === "values"        && <SectionValues        profile={profile} onChange={onChange} />}
        {activeSection === "ikigai"        && <SectionIkigai        profile={profile} onChange={onChange} />}
        {activeSection === "finance"       && <SectionFinance       profile={profile} onChange={onChange} />}
        {activeSection === "relationships" && <SectionRelationships profile={profile} onChange={onChange} />}
        {activeSection === "dreams"        && <SectionDreams        profile={profile} onChange={onChange} />}
        {activeSection === "blockers"      && <SectionBlockers      profile={profile} onChange={onChange} />}
        {activeSection === "health"        && <SectionHealth        profile={profile} onChange={onChange} />}
        {activeSection === "cognitive"     && <SectionCognitive     profile={profile} onChange={onChange} />}

        {/* Save indicator */}
        <div style={S.saveIndicator(saveStatus === "saved")}>
          {saveStatus === "saving" && "💾 Saving…"}
          {saveStatus === "saved"  && "✓ Saved"}
          {saveStatus === "error"  && "⚠ Save failed — check connection"}
          {saveStatus === "idle"   && "Auto-saves as you type"}
        </div>

        {/* Navigation buttons */}
        <div style={S.navButtons}>
          <button style={S.btnSecondary} onClick={goPrev} disabled={currentIdx === 0}
            onMouseEnter={e => e.target.style.opacity = "0.7"}
            onMouseLeave={e => e.target.style.opacity = "1"}>
            ← Previous
          </button>
          <button style={S.btnPrimary} onClick={goNext} disabled={currentIdx === SECTIONS.length - 1}
            onMouseEnter={e => { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = "0 6px 20px rgba(139,92,246,0.4)"; }}
            onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }}>
            {currentIdx === SECTIONS.length - 1 ? "✓ Complete" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
