// ─────────────────────────────────────────────────────────────────
// Dashboard.jsx — thin shell, now passes userId to sections
// and coordinates refresh when data changes
// ─────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import { useAuth }           from "../hooks/useAuth";
import { Sidebar }           from "../components/Sidebar";
import { Topbar, MobileBar } from "../components/Topbar";
import { ErrorBoundary }     from "../components/ErrorBoundary";
import { MODULES }           from "../config/modules";

import { Home }         from "./sections/Home";
import { ChatPanel }    from "./sections/ChatPanel";
import { BrainDump }    from "./sections/BrainDump";
import { FocusSection } from "./sections/FocusSection";
import { ModulePage }   from "./sections/ModulePage";
import { Settings }     from "./sections/Settings";

// Clock
function useClock() {
  const fmt = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
    "  ·  " +
    new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
  const [clock, setClock] = useState(fmt);
  useEffect(() => {
    const t = setInterval(() => setClock(fmt()), 30000);
    return () => clearInterval(t);
  }, []);
  return clock;
}

export default function Dashboard() {
  const { user, firstName, loading, logout } = useAuth();
  const clock = useClock();

  const [section,     setSection]     = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // refreshKey increments when data changes → Home re-fetches KPIs
  const [refreshKey,  setRefreshKey]  = useState(0);

  const onDataChanged = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  function navigate(id) {
    setSection(id);
    setSidebarOpen(false);
  }

  const activeMod    = MODULES.find(m => m.id === section);
  const isModulePage = activeMod && !["home","chat","dump","focus","settings"].includes(section);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">Mindoo</div>
        <div className="loading-spinner" />
      </div>
    );
  }

  const userId = user?.id;

  return (
    <div className="app-shell">
      <div className="bg-glow" aria-hidden="true" />

      <Sidebar
        section={section}
        onNavigate={navigate}
        user={user}
        firstName={firstName}
        onLogout={logout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="app-main">
        <MobileBar onMenuOpen={() => setSidebarOpen(true)} />

        <Topbar
          section={section}
          clock={clock}
          onSettings={() => navigate("settings")}
          onLogout={logout}
        />

        {section === "home" && (
          <ErrorBoundary key="home">
            <Home
              firstName={firstName}
              userId={userId}
              clock={clock}
              onNavigate={navigate}
              refreshKey={refreshKey}
            />
          </ErrorBoundary>
        )}

        {section === "chat" && (
          <ErrorBoundary key="chat">
            <ChatPanel firstName={firstName} />
          </ErrorBoundary>
        )}

        {section === "dump" && (
          <ErrorBoundary key="dump">
            <BrainDump
              userId={userId}
              onChronicleAdded={onDataChanged}
            />
          </ErrorBoundary>
        )}

        {section === "focus" && (
          <ErrorBoundary key="focus">
            <FocusSection
              userId={userId}
              onSessionComplete={onDataChanged}
            />
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
