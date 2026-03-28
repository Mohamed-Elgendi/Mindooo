// ─────────────────────────────────────────────────────────────────
// Icons — all SVG icons as named exports
// Add new icons here. Never import an external library.
// Usage: <Icon name="home" size={16} />
// ─────────────────────────────────────────────────────────────────

const PATHS = {
  home:     ["M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", "M9 22V12h6v10"],
  chat:     ["M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"],
  send:     ["M22 2L11 13", "M22 2l-7 20-4-9-9-4 20-7z"],
  logout:   ["M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  settings: ["M12 15a3 3 0 100-6 3 3 0 000 6z", "M2 12h2", "M20 12h2", "M12 2v2", "M12 20v2", "M4.93 4.93l1.41 1.41", "M17.66 17.66l1.41 1.41", "M4.93 19.07l1.41-1.41", "M17.66 6.34l1.41-1.41"],
  menu:     ["M3 6h18", "M3 12h18", "M3 18h18"],
  close:    ["M18 6L6 18", "M6 6l12 12"],
  check:    ["M20 6L9 17l-5-5"],
  archive:  ["M21 8v13H3V8", "M1 3h22v5H1z", "M10 12h4"],
  trend:    ["M23 6L13.5 15.5 8.5 10.5 1 18", "M17 6h6v6"],
  clock:    ["M12 22a10 10 0 100-20 10 10 0 000 20z", "M12 6v6l4 2"],
  brain:    ["M9.5 2A2.5 2.5 0 017 4.5v15a2.5 2.5 0 01-4.96-.44 2.5 2.5 0 01-2.96-3.08 3 3 0 01-.34-5.58 2.5 2.5 0 011.32-4.24 2.5 2.5 0 011.98-3A2.5 2.5 0 019.5 2z", "M14.5 2A2.5 2.5 0 0117 4.5v15a2.5 2.5 0 004.96-.44 2.5 2.5 0 002.96-3.08 3 3 0 00.34-5.58 2.5 2.5 0 00-1.32-4.24 2.5 2.5 0 00-1.98-3A2.5 2.5 0 0014.5 2z"],
  focus:    ["M12 22a10 10 0 100-20 10 10 0 000 20z", "M12 18a6 6 0 100-12 6 6 0 000 12z", "M12 14a2 2 0 100-4 2 2 0 000 4z"],
  zap:      ["M13 2L3 14h9l-1 8 10-12h-9l1-8z"],
  star:     ["M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"],
};

export function Icon({ name, size = 16, color = "currentColor", strokeWidth = 1.5 }) {
  const paths = PATHS[name];
  if (!paths) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, display: "block" }}
    >
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

export function Spinner({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      style={{ flexShrink: 0, display: "block", animation: "spin 0.9s linear infinite" }}
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}
