// ─────────────────────────────────────────────────────────────────
// ModulePage — shown for any module not yet fully built
// Receives the module config as a prop. Zero hardcoded data.
// ─────────────────────────────────────────────────────────────────
import { Icon } from "../../components/Icons";

export function ModulePage({ module: mod, onNavigate }) {
  if (!mod) return null;

  return (
    <div className="section-scroll">
      <div className="section-content">

        {/* Module header */}
        <div className="module-page-header">
          <div className="module-page-icon" style={{ background: mod.bg, border: `1px solid ${mod.border}` }}>
            <span>{mod.icon}</span>
          </div>
          <div>
            <h1 className="module-page-name" style={{ color: mod.color }}>{mod.label}</h1>
            <p className="module-page-desc">{mod.desc}</p>
          </div>
        </div>

        {/* Phase notice */}
        <div className="module-phase-notice">
          <p>
            This module is active and wired into the system.
            Full UI ships in Phase {mod.phase} of the roadmap.
            Right now, use <strong>Mindoo Chat with Engine A–F</strong> to engage its full intelligence immediately.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => onNavigate("chat")}>
          <Icon name="chat" size={14} color="#fff" />
          Open Mindoo Chat
        </button>

        <div className="divider" />

        <h2 className="section-title" style={{ marginBottom: 14 }}>Module Info</h2>
        <div className="module-info-grid">
          <div className="info-card">
            <div className="info-card-label">Module ID</div>
            <code className="info-card-value" style={{ color: mod.color }}>
              {mod.id}-module@2.0.0
            </code>
          </div>
          <div className="info-card">
            <div className="info-card-label">Status</div>
            <div className="module-status">
              <div className="status-dot" style={{ background: mod.color, boxShadow: `0 0 8px ${mod.color}` }} />
              <span>Active · Official</span>
            </div>
          </div>
          <div className="info-card">
            <div className="info-card-label">Build Phase</div>
            <div className="module-status">
              <span style={{ color: mod.color, fontWeight: 600 }}>Phase {mod.phase}</span>
            </div>
          </div>
          <div className="info-card">
            <div className="info-card-label">Version</div>
            <code className="info-card-value">v2.0.0</code>
          </div>
        </div>

      </div>
    </div>
  );
}
