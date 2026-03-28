// ─────────────────────────────────────────────────────────────────
// Sidebar — completely isolated component
// Receives everything as props. No internal auth or routing logic.
// ─────────────────────────────────────────────────────────────────
import { Icon } from "./Icons";
import { MODULES, NAV_SECTIONS } from "../config/modules";

export function Sidebar({ section, onNavigate, user, firstName, onLogout, isOpen, onClose }) {
  const initials = firstName ? firstName[0].toUpperCase() : "M";

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`sb-overlay${isOpen ? " visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar${isOpen ? " open" : ""}`} aria-label="Navigation">
        {/* Logo */}
        <div className="sb-logo">
          <div className="sb-logo-text">Mindoo</div>
          <div className="sb-logo-sub">Modular Cognitive OS</div>
        </div>

        {/* Scrollable nav area */}
        <nav className="sb-nav">

          {/* Main sections */}
          <div className="sb-group">
            <span className="sb-group-label">Navigate</span>
            {NAV_SECTIONS.map(n => (
              <button
                key={n.id}
                className={`sb-item${section === n.id ? " active" : ""}`}
                onClick={() => onNavigate(n.id)}
              >
                <Icon name={n.icon} size={14} />
                <span>{n.label}</span>
                {n.badge && <span className="sb-badge">{n.badge}</span>}
              </button>
            ))}
          </div>

          {/* Modules */}
          <div className="sb-group">
            <span className="sb-group-label">Modules</span>
            {MODULES.map(m => (
              <button
                key={m.id}
                className={`sb-item${section === m.id ? " active" : ""}`}
                onClick={() => onNavigate(m.id)}
              >
                <span className="sb-dot" style={{ background: m.color }} />
                <span>{m.label}</span>
                {m.phase > 1 && (
                  <span className="sb-phase">P{m.phase}</span>
                )}
              </button>
            ))}
          </div>

        </nav>

        {/* User footer */}
        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-avatar">{initials}</div>
            <div className="sb-user-info">
              <div className="sb-user-name">{firstName || "Boss"}</div>
              <div className="sb-user-email">{user?.email || ""}</div>
            </div>
          </div>
          <button className="sb-item sb-logout" onClick={onLogout}>
            <Icon name="logout" size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
