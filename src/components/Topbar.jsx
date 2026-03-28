// ─────────────────────────────────────────────────────────────────
// Topbar — desktop header bar, completely isolated
// ─────────────────────────────────────────────────────────────────
import { Icon } from "./Icons";
import { MODULES } from "../config/modules";

const TITLES = {
  home:     "Dashboard",
  chat:     "Mindoo Chat",
  dump:     "Brain Dump Sanctuary",
  focus:    "Focus Sanctuary",
  settings: "Settings",
};

export function Topbar({ section, clock, onSettings, onLogout }) {
  const title = TITLES[section] || MODULES.find(m => m.id === section)?.label || "Mindoo";

  return (
    <header className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-actions">
        <span className="topbar-clock">{clock}</span>
        <button className="icon-btn" onClick={onSettings} title="Settings" aria-label="Settings">
          <Icon name="settings" size={15} />
        </button>
        <button className="icon-btn" onClick={onLogout} title="Sign out" aria-label="Sign out">
          <Icon name="logout" size={15} />
        </button>
      </div>
    </header>
  );
}

// Mobile top bar
export function MobileBar({ onMenuOpen }) {
  return (
    <div className="mobile-bar">
      <span className="sb-logo-text">Mindoo</span>
      <button className="icon-btn" onClick={onMenuOpen} aria-label="Open menu">
        <Icon name="menu" size={16} />
      </button>
    </div>
  );
}
