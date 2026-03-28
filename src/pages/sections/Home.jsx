// ─────────────────────────────────────────────────────────────────
// Home — dashboard overview section
// ─────────────────────────────────────────────────────────────────
import { MODULES } from "../../config/modules";
import { Icon } from "../../components/Icons";

function greet(name) {
  const h = new Date().getHours();
  const g = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return `${g}, ${name || "Boss"}.`;
}

const KPI_DATA = [
  { label: "Focus Hours",   value: "4.2h",   change: "+1.1h this week",  up: true  },
  { label: "Brain Dumps",   value: "12",     change: "+3 this week",     up: true  },
  { label: "Habit Streak",  value: "7 days", change: "🔥 Keep going",    up: true  },
  { label: "Clarity Score", value: "78%",    change: "+5% this week",    up: true  },
];

const INSIGHTS = [
  { emoji: "📈", bg: "rgba(139,92,246,.1)", title: "Pattern detected",  desc: "You focus 40% better Tuesdays 9–11am. That window opens in 47 minutes." },
  { emoji: "🌤", bg: "rgba(6,182,212,.1)",  title: "Emotional weather",  desc: "Calm baseline. Good conditions for deep work and hard conversations."  },
  { emoji: "⚡", bg: "rgba(245,158,11,.1)", title: "Identity win",       desc: "You resisted 3 distractions yesterday. Disciplined identity at 83%."   },
  { emoji: "🔥", bg: "rgba(34,197,94,.1)",  title: "Habit momentum",     desc: "7-day streak on your #1 habit. Automaticity threshold in 23 days."     },
];

const IDENTITY = [
  { label: "Resilient",   pct: 89, color: "#a78bfa" },
  { label: "Disciplined", pct: 78, color: "#60a5fa" },
  { label: "Focused",     pct: 65, color: "#22d3ee" },
  { label: "Confident",   pct: 45, color: "#4ade80" },
];

export function Home({ firstName, clock, onNavigate }) {
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
          {KPI_DATA.map(k => (
            <div key={k.label} className="kpi-card">
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value gradient-text">{k.value}</div>
              <div className={`kpi-change ${k.up ? "positive" : "negative"}`}>
                <Icon name="trend" size={10} color={k.up ? "#4ade80" : "#f87171"} />
                {k.change}
              </div>
            </div>
          ))}
        </div>

        {/* Modules grid */}
        <div className="section-header">
          <h2 className="section-title">All Modules</h2>
          <button className="text-btn">View all →</button>
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

        {/* Two column: insights + actions */}
        <div className="home-bottom">

          {/* Insights */}
          <div>
            <div className="section-header" style={{ marginBottom: 12 }}>
              <h2 className="section-title">Today's Insights</h2>
              <button className="text-btn">All →</button>
            </div>
            {INSIGHTS.map((ins, i) => (
              <div key={i} className="insight-item">
                <div className="insight-icon" style={{ background: ins.bg }}>
                  {ins.emoji}
                </div>
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
                { label: "Log emotion",         emoji: "💜", to: "emotion" },
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
                <span className="self-model-live">LIVE</span>
              </div>
              {IDENTITY.map(id => (
                <div key={id.label} className="identity-row">
                  <div className="identity-meta">
                    <span>{id.label}</span>
                    <span style={{ color: id.color, fontFamily: "var(--font-mono)", fontSize: 11 }}>{id.pct}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${id.pct}%`, background: id.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
