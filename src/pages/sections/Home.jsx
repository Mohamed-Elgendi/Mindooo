// ─────────────────────────────────────────────────────────────────
// Home.jsx — Dashboard overview with real data
// ─────────────────────────────────────────────────────────────────
import { MODULES } from "../../config/modules";
import { Icon } from "../../components/Icons";
import { useDashboardData } from "../../hooks/useData";

function greet(name) {
  const h = new Date().getHours();
  const g = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return `${g}, ${name || "Boss"}.`;
}

const IDENTITY = [
  { label: "Resilient",   pct: 89, color: "#a78bfa" },
  { label: "Disciplined", pct: 78, color: "#60a5fa" },
  { label: "Focused",     pct: 65, color: "#22d3ee" },
  { label: "Confident",   pct: 45, color: "#4ade80" },
];

export function Home({ firstName, userId, clock, onNavigate, refreshKey }) {
  const { stats, loading } = useDashboardData(userId);

  // Build KPIs from real data, fall back to dashes while loading
  const kpis = [
    {
      label:  "Focus Hours",
      value:  loading ? "—" : stats ? `${(stats.focusMinsThisWeek / 60).toFixed(1)}h` : "0h",
      change: loading ? "" : stats?.focusMinsThisWeek > 0 ? "this week" : "Start your first session",
      up:     true,
    },
    {
      label:  "Brain Dumps",
      value:  loading ? "—" : stats ? `${stats.dumpsThisWeek}` : "0",
      change: loading ? "" : stats?.totalChronicles > 0 ? `${stats.totalChronicles} total` : "Save your first dump",
      up:     true,
    },
    {
      label:  "Streak",
      value:  loading ? "—" : stats ? `${stats.streak}d` : "0d",
      change: loading ? "" : stats?.streak > 0 ? "🔥 Keep going" : "Start today",
      up:     stats?.streak > 0,
    },
    {
      label:  "Clarity Score",
      value:  loading ? "—" : stats ? `${stats.clarityScore}%` : "—",
      change: loading ? "" : "Based on your dumps",
      up:     true,
    },
  ];

  const insights = loading || !stats ? [
    { emoji: "🧠", bg: "rgba(139,92,246,.1)", title: "Start your journey",     desc: "Save your first brain dump to begin building your self-model." },
    { emoji: "🎯", bg: "rgba(6,182,212,.1)",  title: "Begin a focus session",  desc: "Click Focus in the sidebar to start your first protected work block." },
    { emoji: "💬", bg: "rgba(59,130,246,.1)", title: "Talk to Mindoo",         desc: "Open Mindoo Chat and tell it what's on your mind. Just talk." },
    { emoji: "🌐", bg: "rgba(99,102,241,.1)", title: "Self-Model building",    desc: "As you use Mindoo, your self-model builds automatically." },
  ] : [
    stats.dumpsThisWeek > 0
      ? { emoji: "📈", bg: "rgba(139,92,246,.1)", title: "Brain Dump activity",   desc: `${stats.dumpsThisWeek} dumps this week. Your self-model is growing.` }
      : { emoji: "🧠", bg: "rgba(139,92,246,.1)", title: "No dumps yet this week", desc: "Start a brain dump to clear your mind and feed your self-model." },
    stats.clarityScore > 70
      ? { emoji: "✨", bg: "rgba(34,197,94,.1)",  title: "High clarity",           desc: `Your clarity score is ${stats.clarityScore}%. Your mind is organized.` }
      : { emoji: "🌤", bg: "rgba(6,182,212,.1)",  title: "Clarity building",       desc: `Clarity at ${stats.clarityScore}%. More dumps = lower chaos = higher clarity.` },
    stats.streak > 2
      ? { emoji: "🔥", bg: "rgba(245,158,11,.1)", title: `${stats.streak}-day streak`, desc: "Consistency is identity. You're proving who you're becoming." }
      : { emoji: "⚡", bg: "rgba(245,158,11,.1)", title: "Build your streak",      desc: "Show up daily. Even one dump counts." },
    stats.focusMinsThisWeek > 60
      ? { emoji: "🎯", bg: "rgba(59,130,246,.1)", title: "Focus momentum",         desc: `${(stats.focusMinsThisWeek / 60).toFixed(1)} hours of protected work this week.` }
      : { emoji: "💤", bg: "rgba(99,102,241,.1)", title: "Protect your attention", desc: "Deep work sessions are waiting. Select a focus mode to begin." },
  ];

  return (
    <div className="section-scroll">
      <div className="section-content">

        {/* Greeting */}
        <div className="greeting">
          <p className="greeting-time">{clock}</p>
          <h1 className="greeting-title">
            {greet(firstName)}<br />
            <span className="gradient-text">What needs your mind today?</span>
          </h1>
        </div>

        {/* KPIs */}
        <div className="kpi-grid">
          {kpis.map(k => (
            <div key={k.label} className="kpi-card">
              <div className="kpi-label">{k.label}</div>
              <div className={`kpi-value${loading ? "" : " gradient-text"}`}
                style={loading ? { color: "var(--dim)", fontSize: 22 } : {}}>
                {k.value}
              </div>
              {k.change && (
                <div className={`kpi-change ${k.up ? "positive" : ""}`}>
                  {!loading && <Icon name="trend" size={10} color={k.up ? "#4ade80" : "var(--dim)"} />}
                  {k.change}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modules */}
        <div className="section-header">
          <h2 className="section-title">All Modules</h2>
          <button className="text-btn" onClick={() => {}}>View all →</button>
        </div>
        <div className="modules-grid">
          {MODULES.map(m => (
            <div
              key={m.id}
              className="module-card"
              style={{ background: m.bg, borderColor: m.border }}
              onClick={() => onNavigate(m.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === "Enter" && onNavigate(m.id)}
            >
              <div className="module-card-stripe" style={{ background: m.color }} />
              <span className="module-card-emoji">{m.icon}</span>
              <div className="module-card-name" style={{ color: m.color }}>{m.label}</div>
              <div className="module-card-desc">{m.desc}</div>
              <span className="module-card-arrow">→</span>
            </div>
          ))}
        </div>

        {/* Two-column bottom */}
        <div className="home-bottom">

          {/* Insights — dynamic based on real data */}
          <div>
            <div className="section-header" style={{ marginBottom: 12 }}>
              <h2 className="section-title">Today's Insights</h2>
            </div>
            {insights.map((ins, i) => (
              <div key={i} className="insight-item">
                <div className="insight-icon" style={{ background: ins.bg }}>{ins.emoji}</div>
                <div>
                  <div className="insight-title">{ins.title}</div>
                  <div className="insight-desc">{ins.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right column */}
          <div>
            <h2 className="section-title" style={{ marginBottom: 12 }}>Quick Actions</h2>
            <div className="quick-actions">
              {[
                { label: "Start brain dump",    emoji: "🧠", to: "dump"    },
                { label: "Begin focus session", emoji: "🎯", to: "focus"   },
                { label: "Open Mindoo Chat",    emoji: "💬", to: "chat"    },
                { label: "View Self-Model",     emoji: "🌐", to: "self"    },
              ].map(a => (
                <button key={a.to} className="action-btn" onClick={() => onNavigate(a.to)}>
                  <span>{a.emoji}</span>
                  <span>{a.label}</span>
                  <span className="action-arrow">→</span>
                </button>
              ))}
            </div>

            {/* Self-model preview */}
            <div className="self-model-card">
              <div className="self-model-header">
                <span>🌐</span>
                <span className="self-model-title">Self-Model</span>
                <span className="self-model-live">BUILDING</span>
              </div>
              {IDENTITY.map(id => (
                <div key={id.label} className="identity-row">
                  <div className="identity-meta">
                    <span>{id.label}</span>
                    <span style={{ color: id.color, fontFamily: "var(--font-mono)", fontSize: 11 }}>
                      {id.pct}%
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${id.pct}%`, background: id.color }} />
                  </div>
                </div>
              ))}
              <p style={{ fontSize: 11, color: "var(--dim)", marginTop: 12, lineHeight: 1.5 }}>
                Grows with every dump, session, and chat.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
