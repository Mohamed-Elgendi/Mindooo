// ─────────────────────────────────────────────────────────────────
// FocusSection — focus sanctuary with timer
// ─────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { FOCUS_MODES } from "../../config/modules";

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

const WEEK_STATS = [
  { label: "Deep Flow Hours", value: "12.5h", note: "Goal: 15h"          },
  { label: "Flow States",     value: "4",     note: "Avg: 67 min"        },
  { label: "Distractions",    value: "23",    note: "↓15% vs last week"  },
  { label: "Session Quality", value: "74%",   note: "Goal: 80%"          },
];

export function FocusSection() {
  const [activeMode, setActiveMode] = useState(null);
  const [elapsed,    setElapsed]    = useState(0);
  const timerRef = useRef(null);

  const currentMode = FOCUS_MODES.find(m => m.id === activeMode);

  useEffect(() => {
    if (activeMode) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => clearInterval(timerRef.current);
  }, [activeMode]);

  function selectMode(id) {
    setActiveMode(prev => prev === id ? null : id);
  }

  return (
    <div className="section-scroll">
      <div className="section-content">

        <div className="section-eyebrow">Module · Execution</div>
        <h1 className="section-heading gradient-text">Focus Sanctuary</h1>
        <p className="section-subheading">Protected attention. Context-optimized. Distraction becomes data.</p>

        {/* Session status */}
        {activeMode ? (
          <div className="focus-active">
            <div className="focus-active-mode">{currentMode?.name} — Active</div>
            <div className="focus-timer">{formatTime(elapsed)}</div>
            <p className="focus-active-desc">Stay in the work. Your attention is protected.</p>
            <button className="btn btn-ghost" onClick={() => setActiveMode(null)}>
              End Session
            </button>
          </div>
        ) : (
          <div className="focus-idle">
            <div className="focus-idle-label">No active session</div>
            <div className="focus-idle-hint">Select a mode below to begin</div>
          </div>
        )}

        {/* Focus mode cards */}
        <h2 className="section-title" style={{ marginBottom: 12 }}>Focus Modes</h2>
        <div className="focus-modes-grid">
          {FOCUS_MODES.map(m => (
            <div
              key={m.id}
              className={`focus-mode-card${activeMode === m.id ? " active" : ""}`}
              onClick={() => selectMode(m.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === "Enter" && selectMode(m.id)}
            >
              <div className="focus-mode-emoji">{m.emoji}</div>
              <div className="focus-mode-name" style={{ color: m.color }}>{m.name}</div>
              <div className="focus-mode-dur">{m.dur}</div>
              <div className="focus-mode-desc">{m.desc}</div>
            </div>
          ))}
        </div>

        {/* Weekly stats */}
        <h2 className="section-title" style={{ marginBottom: 12 }}>This Week</h2>
        <div className="kpi-grid">
          {WEEK_STATS.map(s => (
            <div key={s.label} className="kpi-card">
              <div className="kpi-label">{s.label}</div>
              <div className="kpi-value gradient-text" style={{ fontSize: 22 }}>{s.value}</div>
              <div className="kpi-change">{s.note}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
