// src/pages/sections/AffirmationSection.jsx
// Mindooo — Embodied Affirmations
// Evidence-based identity formation. Not empty positivity — proof-based self-belief.
// Pulls real data from habits, journals, focus sessions, chronicles.
// Science: Self-concept (Markus), Growth Mindset (Dweck), Identity-based habits (Clear)

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase";
import { callAI } from "../../services/ai";
import { buildContext, buildFullSystemPrompt } from "../../services/context";
import { ENGINE_MAP } from "../../config/modules";

// ── Data loaders ──────────────────────────────────────────────
async function loadEvidenceData(userId) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  const [habitsRes, logsRes, journalRes, focusRes, chroniclesRes] = await Promise.all([
    supabase.from("habits").select("*").eq("user_id", userId).eq("active", true),
    supabase.from("habit_logs").select("*").eq("user_id", userId).gte("log_date", monthAgo.toISOString().split("T")[0]),
    supabase.from("journal_entries").select("wins, lessons, mood, created_at").eq("user_id", userId).gte("created_at", monthAgo.toISOString()).order("created_at", { ascending: false }).limit(20),
    supabase.from("focus_sessions").select("actual_secs, completed, created_at").eq("user_id", userId).gte("created_at", weekAgo.toISOString()),
    supabase.from("chronicles").select("themes, chaos_score, created_at").eq("user_id", userId).gte("created_at", weekAgo.toISOString()),
  ]);

  const habits    = habitsRes.data || [];
  const logs      = logsRes.data || [];
  const journals  = journalRes.data || [];
  const focus     = focusRes.data || [];
  const chronicles = chroniclesRes.data || [];

  // Compute evidence points
  const evidence = [];

  // Habit evidence
  habits.forEach(h => {
    const habitLogs = logs.filter(l => l.habit_id === h.id);
    const last7 = habitLogs.filter(l => {
      const d = new Date(l.log_date);
      return (new Date() - d) < 7 * 86400000;
    });
    if (last7.length >= 5) {
      evidence.push({ type: "habit", strength: 90, text: `Completed "${h.name}" ${last7.length}/7 days this week`, icon: "🔥", identity: h.identity_statement || `someone who ${h.name.toLowerCase()}` });
    } else if (last7.length >= 3) {
      evidence.push({ type: "habit", strength: 65, text: `Kept "${h.name}" going ${last7.length} days this week`, icon: "✓", identity: h.identity_statement || `someone building ${h.name.toLowerCase()}` });
    } else if (habitLogs.length > 0) {
      evidence.push({ type: "habit", strength: 35, text: `Started building "${h.name}"`, icon: "🌱", identity: h.identity_statement || `someone starting ${h.name.toLowerCase()}` });
    }
  });

  // Journal wins evidence
  const allWins = [];
  journals.forEach(j => { if (j.wins?.length) allWins.push(...j.wins); });
  if (allWins.length >= 5) {
    evidence.push({ type: "journal", strength: 80, text: `Recorded ${allWins.length} wins in your journal this month`, icon: "🏆", identity: "someone who celebrates progress" });
  } else if (allWins.length > 0) {
    evidence.push({ type: "journal", strength: 50, text: `Recorded ${allWins.length} wins: "${allWins[0]}"`, icon: "✨", identity: "someone who notices wins" });
  }

  // Focus evidence
  const completedSessions = focus.filter(f => f.completed);
  const totalFocusMins = Math.round(focus.reduce((s, f) => s + (f.actual_secs || 0), 0) / 60);
  if (completedSessions.length >= 5) {
    evidence.push({ type: "focus", strength: 85, text: `Completed ${completedSessions.length} focus sessions this week (${totalFocusMins} mins total)`, icon: "🎯", identity: "someone who protects their attention" });
  } else if (completedSessions.length > 0) {
    evidence.push({ type: "focus", strength: 55, text: `Completed ${completedSessions.length} focus session${completedSessions.length > 1 ? "s" : ""} this week`, icon: "🎯", identity: "someone building focus discipline" });
  }

  // Brain dump evidence
  if (chronicles.length >= 5) {
    evidence.push({ type: "chronicle", strength: 75, text: `Brain dumped ${chronicles.length} times this week — externalizing your thoughts consistently`, icon: "🧠", identity: "someone who clears mental clutter daily" });
  } else if (chronicles.length > 0) {
    evidence.push({ type: "chronicle", strength: 45, text: `Made ${chronicles.length} brain dump${chronicles.length > 1 ? "s" : ""} this week`, icon: "🧠", identity: "someone who captures their thoughts" });
  }

  // Journaling consistency
  const journalDays = new Set(journals.map(j => j.created_at?.split("T")[0])).size;
  if (journalDays >= 5) {
    evidence.push({ type: "journal", strength: 80, text: `Journaled ${journalDays} days this month`, icon: "📔", identity: "someone who reflects consistently" });
  }

  return {
    evidence,
    totalFocusMins,
    habitCount: habits.length,
    winCount: allWins.length,
    allWins: allWins.slice(0, 5),
  };
}

// ── Identity claims (hardcoded starting set, AI-enhanced) ─────
const DEFAULT_CLAIMS = [
  { id: "disciplined",  label: "Disciplined",   icon: "💎", color: "#8b5cf6" },
  { id: "focused",      label: "Focused",        icon: "🎯", color: "#3b82f6" },
  { id: "resilient",    label: "Resilient",      icon: "🌳", color: "#22c55e" },
  { id: "creative",     label: "Creative",       icon: "🎨", color: "#f59e0b" },
  { id: "growing",      label: "Growing",        icon: "🌱", color: "#34d399" },
  { id: "intentional",  label: "Intentional",    icon: "🧭", color: "#ec4899" },
  { id: "consistent",   label: "Consistent",     icon: "🔄", color: "#60a5fa" },
  { id: "self-aware",   label: "Self-Aware",     icon: "🪞", color: "#a78bfa" },
];

// ── Helpers ────────────────────────────────────────────────────
function strengthColor(pct) {
  if (pct >= 75) return "#22c55e";
  if (pct >= 50) return "#f59e0b";
  if (pct >= 25) return "#f97316";
  return "#ef4444";
}

function strengthLabel(pct) {
  if (pct >= 80) return "Strong evidence";
  if (pct >= 60) return "Good evidence";
  if (pct >= 40) return "Building";
  if (pct >= 20) return "Early stage";
  return "Just starting";
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
    border: active ? "1px solid rgba(245,158,11,0.6)" : "1px solid rgba(255,255,255,0.08)",
    background: active ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.03)",
    color: active ? "#fbbf24" : "rgba(255,255,255,0.4)", transition: "all 0.2s", userSelect: "none",
  }),
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "22px", marginBottom: "16px" },
  cardTitle: { fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "15px", color: "#fff", margin: "0 0 4px" },
  cardDesc: { fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: "0 0 18px", lineHeight: 1.6 },
  label: { display: "block", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" },
  // Identity cards
  identityGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px", marginBottom: "20px" },
  identityCard: (color, selected) => ({
    background: selected ? `${color}15` : "rgba(255,255,255,0.02)",
    border: selected ? `1.5px solid ${color}60` : "1px solid rgba(255,255,255,0.07)",
    borderRadius: "14px", padding: "16px", cursor: "pointer", transition: "all 0.2s",
  }),
  identityIcon: { fontSize: "24px", marginBottom: "8px" },
  identityLabel: (color, selected) => ({ fontSize: "13px", fontWeight: 700, color: selected ? color : "#fff", marginBottom: "4px" }),
  identityStrength: { height: "4px", borderRadius: "99px", background: "rgba(255,255,255,0.08)", overflow: "hidden", marginTop: "8px" },
  identityFill: (color, pct) => ({ height: "100%", width: `${pct}%`, background: color, borderRadius: "99px", transition: "width 0.6s ease" }),
  identityPct: (color) => ({ fontSize: "11px", color, marginTop: "4px", fontWeight: 600 }),
  // Evidence cards
  evidenceCard: (type) => {
    const colors = { habit: "#22c55e", focus: "#3b82f6", journal: "#f59e0b", chronicle: "#8b5cf6" };
    const c = colors[type] || "#a78bfa";
    return { background: `${c}0a`, border: `1px solid ${c}25`, borderRadius: "12px", padding: "14px 16px", marginBottom: "10px", display: "flex", gap: "12px", alignItems: "flex-start" };
  },
  evidenceIcon: { fontSize: "20px", flexShrink: 0, marginTop: "1px" },
  evidenceText: { fontSize: "13px", color: "rgba(255,255,255,0.8)", lineHeight: 1.6, flex: 1 },
  evidenceIdentity: { fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "3px", fontStyle: "italic" },
  evidenceStrength: (pct) => ({ fontSize: "11px", color: strengthColor(pct), fontWeight: 600, marginTop: "2px" }),
  // Daily affirmation
  affirmationBox: {
    background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))",
    border: "1px solid rgba(139,92,246,0.25)", borderRadius: "16px", padding: "28px", textAlign: "center", marginBottom: "16px",
  },
  affirmationDate: { fontSize: "11px", color: "rgba(255,255,255,0.3)", marginBottom: "12px", letterSpacing: "0.06em", textTransform: "uppercase" },
  affirmationText: { fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "18px", color: "#fff", lineHeight: 1.5, marginBottom: "14px" },
  affirmationEvidence: { fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, fontStyle: "italic" },
  btnPrimary: { background: "linear-gradient(135deg, #f59e0b, #8b5cf6)", border: "none", borderRadius: "10px", padding: "10px 22px", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" },
  btnSecondary: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 18px", color: "rgba(255,255,255,0.5)", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" },
  aiBox: { background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "12px", padding: "16px", marginTop: "16px" },
  aiBoxTitle: { fontSize: "11px", fontWeight: 700, color: "#fbbf24", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" },
  aiBoxText: { fontSize: "14px", color: "rgba(255,255,255,0.85)", lineHeight: 1.7, whiteSpace: "pre-line" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "20px" },
  statBox: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "14px", textAlign: "center" },
  statValue: { fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "22px", color: "#fbbf24" },
  statLabel: { fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px" },
  winTag: { display: "inline-flex", padding: "4px 10px", borderRadius: "99px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80", fontSize: "12px", margin: "3px" },
  empty: { textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.35)", fontSize: "14px" },
};

// ── Daily Affirmation ──────────────────────────────────────────
function DailyAffirmation({ userId, evidenceData }) {
  const [affirmation, setAffirmation] = useState("");
  const [loading, setLoading]         = useState(false);
  const [generated, setGenerated]     = useState(false);

  // Auto-generate on mount if evidence exists
  useEffect(() => {
    if (evidenceData?.evidence?.length > 0 && !generated) {
      generate();
    }
  }, [evidenceData]);

  async function generate() {
    if (!evidenceData?.evidence?.length) return;
    setLoading(true);
    try {
      const topEvidence = evidenceData.evidence.slice(0, 4).map(e => e.text).join("\n- ");
      const ctx = await buildContext(userId);
      const sys = buildFullSystemPrompt(ctx, null, "Mo", ENGINE_MAP);
      const result = await callAI({
        messages: [{ role: "user", content: `Based on this real evidence from the past week:\n- ${topEvidence}\n\nWrite ONE powerful identity affirmation (2-3 sentences). It must:\n1. Be grounded in the actual evidence above\n2. State who Mo IS (not who he wants to be)\n3. Be written in first person present tense ("I am...")\n4. Feel real and earned, not empty positivity\n\nThen on a new line write: "Evidence: [one sentence referencing the specific data]"\n\nNo headers. Just the affirmation then the evidence line.` }],
        systemPrompt: sys,
        maxTokens: 200,
        userId,
      });
      setAffirmation(result.text);
      setGenerated(true);
    } catch { setAffirmation("I am someone who shows up and does the work — even imperfectly, even when it's hard."); setGenerated(true); }
    setLoading(false);
  }

  const today = new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  return (
    <div>
      <div style={S.affirmationBox}>
        <div style={S.affirmationDate}>{today}</div>
        {loading && <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px", padding: "20px 0" }}>Generating your affirmation from real evidence…</div>}
        {!loading && affirmation && (
          <div style={S.affirmationText}>{affirmation}</div>
        )}
        {!loading && !affirmation && (
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px", padding: "20px 0" }}>
            No evidence yet. Log habits, journal entries, or focus sessions to generate a personalised affirmation.
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <button style={S.btnPrimary} onClick={generate} disabled={loading}>
          {loading ? "Generating…" : "✦ Regenerate"}
        </button>
      </div>
    </div>
  );
}

// ── Evidence View ──────────────────────────────────────────────
function EvidenceView({ evidenceData }) {
  if (!evidenceData) {
    return <div style={S.empty}>Loading your evidence…</div>;
  }

  const { evidence, totalFocusMins, habitCount, winCount, allWins } = evidenceData;

  return (
    <div>
      <div style={S.statsRow}>
        <div style={S.statBox}>
          <div style={S.statValue}>{habitCount}</div>
          <div style={S.statLabel}>Active habits</div>
        </div>
        <div style={S.statBox}>
          <div style={S.statValue}>{totalFocusMins}</div>
          <div style={S.statLabel}>Focus mins (week)</div>
        </div>
        <div style={S.statBox}>
          <div style={S.statValue}>{winCount}</div>
          <div style={S.statLabel}>Wins this month</div>
        </div>
      </div>

      {allWins.length > 0 && (
        <div style={S.card}>
          <div style={S.cardTitle}>🏆 Your Wins This Month</div>
          <div style={{ marginTop: "10px" }}>
            {allWins.map((w, i) => <span key={i} style={S.winTag}>{w}</span>)}
          </div>
        </div>
      )}

      <div style={S.card}>
        <div style={S.cardTitle}>📊 Evidence Points</div>
        <div style={S.cardDesc}>These are facts from your real behaviour — not opinions.</div>
        {evidence.length === 0 && (
          <div style={S.empty}>
            No evidence collected yet. Use Habits, Journal, and Focus sessions to generate evidence.
          </div>
        )}
        {evidence.map((e, i) => (
          <div key={i} style={S.evidenceCard(e.type)}>
            <span style={S.evidenceIcon}>{e.icon}</span>
            <div>
              <div style={S.evidenceText}>{e.text}</div>
              <div style={S.evidenceIdentity}>→ Identity: "{e.identity}"</div>
              <div style={S.evidenceStrength(e.strength)}>{strengthLabel(e.strength)} · {e.strength}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Identity Strength ──────────────────────────────────────────
function IdentityStrength({ userId, evidenceData }) {
  const [selected,    setSelected]   = useState(null);
  const [aiInsight,   setAIInsight]  = useState("");
  const [aiLoading,   setAILoading]  = useState(false);

  // Compute strength for each identity claim from evidence
  function getStrength(claimId) {
    if (!evidenceData?.evidence?.length) return 0;
    const matches = evidenceData.evidence.filter(e =>
      e.identity?.toLowerCase().includes(claimId.replace("-", " ")) ||
      e.type === claimId
    );
    if (matches.length === 0) {
      // Generic strength from overall evidence count
      return Math.min(40, evidenceData.evidence.length * 8);
    }
    return Math.round(matches.reduce((s, m) => s + m.strength, 0) / matches.length);
  }

  async function getAIInsight(claim) {
    setSelected(claim.id);
    setAIInsight("");
    setAILoading(true);
    const strength = getStrength(claim.id);
    const evidence = evidenceData?.evidence?.slice(0, 5).map(e => e.text).join(", ") || "limited data so far";
    try {
      const ctx = await buildContext(userId);
      const sys = buildFullSystemPrompt(ctx, null, "Mo", ENGINE_MAP);
      const result = await callAI({
        messages: [{ role: "user", content: `My identity claim: "I am ${claim.label.toLowerCase()}"\nEvidence strength: ${strength}%\nReal data: ${evidence}\n\nGive me:\n1. One honest sentence about where this identity currently stands based on the evidence\n2. One specific action I can take this week to strengthen it\n\nBe direct. No fluff. 3 sentences max total.` }],
        systemPrompt: sys,
        maxTokens: 150,
        userId,
      });
      setAIInsight(result.text);
    } catch { setAIInsight("Could not load insight right now."); }
    setAILoading(false);
  }

  return (
    <div>
      <div style={S.card}>
        <div style={S.cardTitle}>🪞 Identity Strength Scores</div>
        <div style={S.cardDesc}>Based on your actual behaviour — not aspirations. Click any identity to get AI analysis.</div>
        <div style={S.identityGrid}>
          {DEFAULT_CLAIMS.map(claim => {
            const pct = getStrength(claim.id);
            return (
              <div key={claim.id} style={S.identityCard(claim.color, selected === claim.id)} onClick={() => getAIInsight(claim)}>
                <div style={S.identityIcon}>{claim.icon}</div>
                <div style={S.identityLabel(claim.color, selected === claim.id)}>{claim.label}</div>
                <div style={S.identityStrength}>
                  <div style={S.identityFill(claim.color, pct)} />
                </div>
                <div style={S.identityPct(claim.color)}>{pct}% — {strengthLabel(pct)}</div>
              </div>
            );
          })}
        </div>
        {(aiInsight || aiLoading) && (
          <div style={S.aiBox}>
            <div style={S.aiBoxTitle}>🤖 Mindooo Analysis</div>
            <div style={S.aiBoxText}>
              {aiLoading ? "Analyzing…" : aiInsight}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export function AffirmationSection({ userId }) {
  const [tab, setTab]               = useState("daily");
  const [evidenceData, setEvidence] = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!userId) return;
    loadEvidenceData(userId).then(data => { setEvidence(data); setLoading(false); });
  }, [userId]);

  const tabs = [
    { id: "daily",    label: "⚡ Daily Affirmation" },
    { id: "evidence", label: "📊 My Evidence" },
    { id: "identity", label: "🪞 Identity Strength" },
  ];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}>Embodied Affirmations</h1>
        <p style={S.subtitle}>Identity built from evidence, not empty words. What your behaviour proves about who you are.</p>
      </div>

      <div style={S.tabs}>
        {tabs.map(t => (
          <span key={t.id} style={S.tab(tab === t.id)} onClick={() => setTab(t.id)}>{t.label}</span>
        ))}
      </div>

      {loading && <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: "40px", fontSize: "14px" }}>Loading your evidence…</div>}

      {!loading && tab === "daily"    && <DailyAffirmation userId={userId} evidenceData={evidenceData} />}
      {!loading && tab === "evidence" && <EvidenceView evidenceData={evidenceData} />}
      {!loading && tab === "identity" && <IdentityStrength userId={userId} evidenceData={evidenceData} />}
    </div>
  );
}
