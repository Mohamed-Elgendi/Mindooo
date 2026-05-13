// src/components/Sidebar.jsx
import { Icon } from "./Icons";
import { NAV_SECTIONS, MODULES } from "../config/modules";

// NAV_SECTIONS = core navigation (no modules here)
// MODULES      = separate list shown below

export function Sidebar({ section, onNavigate, user, firstName, onLogout, isOpen, onClose }) {
  const initials = firstName ? firstName[0].toUpperCase() : "M";

  // Sections that appear in NAV_SECTIONS — do NOT repeat in modules list
  const navIds = new Set(NAV_SECTIONS.map(n => n.id));

  // Filter MODULES to exclude anything already in nav
  const sidebarModules = MODULES.filter(m => !navIds.has(m.id));

  return (
    <>
      <div
        className={`sb-overlay${isOpen ? " visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar${isOpen ? " open" : ""}`} aria-label="Navigation">

        {/* Logo */}
        <div className="sb-logo">
          <div className="sb-logo-text">Mindoo</div>
          <div className="sb-logo-sub">Life Operating System</div>
        </div>

        {/* Scrollable nav */}
        <nav className="sb-nav">

          {/* Core navigation */}
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

          {/* Modules — no duplicates */}
          <div className="sb-group">
            <span className="sb-group-label">Modules</span>
            {sidebarModules.map(m => (
              <button
                key={m.id}
                className={`sb-item${section === m.id ? " active" : ""}`}
                onClick={() => onNavigate(m.id)}
              >
                <span className="sb-dot" style={{ background: m.color }} />
                <span>{m.label}</span>
                {m.phase > 1 && <span className="sb-phase">P{m.phase}</span>}
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
