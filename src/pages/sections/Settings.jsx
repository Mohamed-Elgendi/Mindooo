// ─────────────────────────────────────────────────────────────────
// Settings section
// ─────────────────────────────────────────────────────────────────
import { Icon } from "../../components/Icons";
import { STACK_INFO } from "../../config/modules";

export function Settings({ user, firstName, onLogout }) {
  const initials = firstName ? firstName[0].toUpperCase() : "M";

  return (
    <div className="section-scroll">
      <div className="section-content">

        <div className="section-eyebrow">Configuration</div>
        <h1 className="section-heading gradient-text">Settings</h1>

        <div className="settings-grid">

          {/* Account card */}
          <div className="settings-card">
            <h2 className="settings-card-title">Account</h2>
            <div className="settings-user">
              <div className="settings-avatar">{initials}</div>
              <div>
                <div className="settings-name">{firstName || "Boss"}</div>
                <div className="settings-email">{user?.email || ""}</div>
              </div>
            </div>
            <button className="btn btn-ghost" style={{ width: "100%" }} onClick={onLogout}>
              <Icon name="logout" size={14} />
              Sign out
            </button>
          </div>

          {/* Stack card */}
          <div className="settings-card">
            <h2 className="settings-card-title">Stack</h2>
            {STACK_INFO.map(s => (
              <div key={s.label} className="stack-row">
                <span className="stack-label">{s.label}</span>
                <span className="stack-value">{s.value}</span>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
