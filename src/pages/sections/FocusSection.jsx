// ─────────────────────────────────────────────────────────────────
// FocusSection.jsx — Focus Sanctuary
// Real session saving to Supabase.
// Real session history loaded on mount.
// ─────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from "react";
import { FOCUS_MODES } from "../../config/modules";
import { saveFocusSession, loadFocusSessions, getWeeklyFocusStats } from "../../services/db";
import { formatDuration } from "../../services/ai";

function formatTimer(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export function FocusSection({ userId, onSessionComplete }) {
  const [activeMode,   setActiveMode]   = useState(null);
  const [elapsed,      setElapsed]      = useState(0);
  const [sessions,     setSessions]     = useState([]);
  const [weekStats,    setWeekStats]    = useState({ totalMins: 0, sessionCount: 0 });
  const [saving,       setSaving]       = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const currentMode = FOCUS_MODES.find(m => m.id === activeMode);

  // Load history on mount
  useEffect(() => {
    if (!userId) return;
    Promise.all([
      loadFocusSessions(userId, 8),
      getWeeklyFocusStats(userId),
    ]).then(([sessRes, statsRes]) => {
      setSessions(sessRes.data);
      setWeekStats({ totalMins: statsRes.totalMins, sessionCount: statsRes.sessionCount });
    });
  }, [userId]);

  // Timer
  useEffect(() => {
    if (activeMode) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [activeMode]);

  const startMode = (id) => {
    setActiveMode(id);
    setElapsed(0);
  };

  const endSession = useCallback(async () => {
    if (!activeMode || !userId) { setActiveMode(null); return; }

    const mode     = currentMode;
    const seconds  = elapsed;

    // Stop timer first
    clearInterval(timerRef.current);
    setActiveMode(null);
    setElapsed(0);

    // Only save if session was at least 60 seconds
    if (seconds < 60) return;

    setSaving(true);
    try {
      const plannedMins = parseInt(mode.dur.split("–")[0]) || 25;
      const { data, error } = await saveFocusSession({
        userId,
        mode:        mode.id,
        modeName:    mode.name,
        plannedMins,
        actualSecs:  seconds,
      });

      if (!error && data) {
        setSessions(prev => [data, ...prev.slice(0, 7)]);
        setWeekStats(prev => ({
          totalMins:    prev.totalMins + Math.round(seconds / 60),
          sessionCount: prev.sessionCount + 1,
        }));
        onSessionComplete?.();
      }
    } finally {
      setSaving(false);
    }
  }, [activeMode, currentMode, elapsed, userId, onSessionComplete]);

  const focusHours = (weekStats.totalMins / 60).toFixed(1);

  const weekStatCards = [
    { label: "Focus Hours",     value: `${focusHours}h`,           note: "This week"             },
    { label: "Sessions",        value: `${weekStats.sessionCount}`, note: "This week"             },
    { label: "Avg Session",     value: weekStats.sessionCount > 0
        ? formatDuration(Math.round((weekStats.totalMins * 60) / weekStats.sessionCount))
        : "—",                                                       note: "Per session"           },
    { label: "Best Mode",       value: "Deep Flow",                 note: "Most used"             },
  ];

  return (
    <div className="section-scroll">
      <div className="section-content">

        <div className="section-eyebrow">Module · Execution</div>
        <h1 className="section-heading gradient-text">Focus Sanctuary</h1>
        <p className="section-subheading">
          Protected attention. Context-optimized. Distraction becomes data, not guilt.
        </p>

        {/* Active session */}
        {activeMode ? (
          <div className="focus-active">
            <div className="focus-active-mode">{currentMode?.name} — Active</div>
            <div className="focus-timer">{formatTimer(elapsed)}</div>
            <p className="focus-active-desc">Stay in the work. Your attention is protected.</p>
            <button
              className="btn btn-ghost"
              onClick={endSession}
              disabled={saving}
            >
              {saving ? "Saving…" : "End Session"}
            </button>
            {elapsed < 60 && (
              <p style={{ fontSize: 11, color: "var(--dim)", marginTop: 8 }}>
                Sessions under 1 minute are not saved
              </p>
            )}
          </div>
        ) : (
          <div className="focus-idle">
            <div className="focus-idle-label">No active session</div>
            <div className="focus-idle-hint">Select a mode below to begin</div>
          </div>
        )}

        {/* Focus modes */}
        <h2 className="section-title" style={{ marginBottom: 12 }}>Focus Modes</h2>
        <div className="focus-modes-grid">
          {FOCUS_MODES.map(m => (
            <div
              key={m.id}
              className={`focus-mode-card${activeMode === m.id ? " active" : ""}`}
              onClick={() => !activeMode && startMode(m.id)}
              style={{ cursor: activeMode && activeMode !== m.id ? "not-allowed" : "pointer", opacity: activeMode && activeMode !== m.id ? 0.4 : 1 }}
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
        <div className="kpi-grid" style={{ marginBottom: 28 }}>
          {weekStatCards.map(s => (
            <div key={s.label} className="kpi-card">
              <div className="kpi-label">{s.label}</div>
              <div className="kpi-value gradient-text" style={{ fontSize: 22 }}>{s.value}</div>
              <div className="kpi-change">{s.note}</div>
            </div>
          ))}
        </div>

        {/* Session history */}
        {sessions.length > 0 && (
          <>
            <h2 className="section-title" style={{ marginBottom: 12 }}>Recent Sessions</h2>
            {sessions.map(s => (
              <div key={s.id} className="chronicle-item">
                <div className="chronicle-icon" style={{ background: "rgba(6,182,212,0.1)" }}>🎯</div>
                <div className="chronicle-body">
                  <div className="chronicle-row">
                    <span className="chronicle-id">{s.mode_name}</span>
                    <span className="chronicle-time">
                      {new Date(s.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <div className="chronicle-meta">
                    {formatDuration(s.actual_secs)} · {s.planned_mins} min planned
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

      </div>
    </div>
  );
}