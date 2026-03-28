// ─────────────────────────────────────────────────────────────────
// Dashboard — thin shell. Routes between sections. Nothing else.
//
// ARCHITECTURE RULES (never violate these):
// 1. No business logic here — lives in sections/hooks/config
// 2. No styles here — lives in index.css
// 3. No data constants here — lives in config/modules.js
// 4. Every section is wrapped in ErrorBoundary
// 5. ChatPanel is a stable top-level component, never re-created
// ─────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { useAuth }         from "../hooks/useAuth";
import { Sidebar }         from "../components/Sidebar";
import { Topbar, MobileBar } from "../components/Topbar";
import { ErrorBoundary }   from "../components/ErrorBoundary";
import { MODULES }         from "../config/modules";

// Sections — each isolated in its own file
import { Home }         from "./sections/Home";
import { ChatPanel }    from "./sections/ChatPanel";
import { BrainDump }    from "./sections/BrainDump";
import { FocusSection } from "./sections/FocusSection";
import { ModulePage }   from "./sections/ModulePage";
import { Settings }     from "./sections/Settings";

// Clock helper
function useClock() {
  const [clock, setClock] = useState(formatClock());
  useEffect(() => {
    const t = setInterval(() => setClock(formatClock()), 30000);
    return () => clearInterval(t);
  }, []);
  return clock;
}
function formatClock() {
  return (
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
    "  ·  " +
    new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })
  );
}

// ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, firstName, loading, logout } = useAuth();
  const clock = useClock();

  const [section,   setSection]   = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeMod = MODULES.find(m => m.id === section);
  const isModulePage = activeMod && !["home","chat","dump","focus","settings"].includes(section);

  function navigate(id) {
    setSection(id);
    setSidebarOpen(false);
  }

  // Loading state while auth resolves
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">Mindoo</div>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="app-shell">

      {/* Background ambient glow */}
      <div className="bg-glow" aria-hidden="true" />

      {/* Sidebar — isolated, receives everything as props */}
      <Sidebar
        section={section}
        onNavigate={navigate}
        user={user}
        firstName={firstName}
        onLogout={logout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <main className="app-main">

        {/* Mobile topbar */}
        <MobileBar onMenuOpen={() => setSidebarOpen(true)} />

        {/* Desktop topbar */}
        <Topbar
          section={section}
          clock={clock}
          onSettings={() => navigate("settings")}
          onLogout={logout}
        />

        {/* Section content — every section in its own ErrorBoundary */}

        {section === "home" && (
          <ErrorBoundary key="home">
            <Home firstName={firstName} clock={clock} onNavigate={navigate} />
          </ErrorBoundary>
        )}

        {section === "chat" && (
          <ErrorBoundary key="chat">
            <ChatPanel firstName={firstName} />
          </ErrorBoundary>
        )}

        {section === "dump" && (
          <ErrorBoundary key="dump">
            <BrainDump />
          </ErrorBoundary>
        )}

        {section === "focus" && (
          <ErrorBoundary key="focus">
            <FocusSection />
          </ErrorBoundary>
        )}

        {section === "settings" && (
          <ErrorBoundary key="settings">
            <Settings user={user} firstName={firstName} onLogout={logout} />
          </ErrorBoundary>
        )}

        {isModulePage && (
          <ErrorBoundary key={section}>
            <ModulePage module={activeMod} onNavigate={navigate} />
          </ErrorBoundary>
        )}

      </main>
    </div>
  );
}
