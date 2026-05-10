// src/pages/Dashboard.jsx
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
import { AIProviders }  from "./sections/AIProviders";
import { ModulePage }   from "./sections/ModulePage";
import { Settings }     from "./sections/Settings";

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

// Scroll wrapper — every non-chat section sits inside this
function ScrollWrap({ children }) {
  return (
    <div style={{
      flex:                  1,
      overflowY:             "auto",
      overflowX:             "hidden",
      WebkitOverflowScrolling: "touch",
    }}>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const { user, firstName, loading, logout } = useAuth();
  const clock = useClock();

  const [section,     setSection]     = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey,  setRefreshKey]  = useState(0);

  const onDataChanged = useCallback(() => setRefreshKey(k => k + 1), []);

  function navigate(id) {
    setSection(id);
    setSidebarOpen(false);
  }

  const activeMod     = MODULES.find(m => m.id === section);
  const knownSections = ["home","chat","dump","focus","providers","settings"];
  const isModulePage  = activeMod && !knownSections.includes(section);

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

        {/* HOME */}
        {section === "home" && (
          <ScrollWrap>
            <ErrorBoundary key="home">
              <Home
                firstName={firstName}
                userId={userId}
                clock={clock}
                onNavigate={navigate}
                refreshKey={refreshKey}
              />
            </ErrorBoundary>
          </ScrollWrap>
        )}

        {/* CHAT — has its own internal scroll, no ScrollWrap */}
        {section === "chat" && (
          <ErrorBoundary key="chat">
            <ChatPanel firstName={firstName} user={user} />
          </ErrorBoundary>
        )}

        {/* BRAIN DUMP */}
        {section === "dump" && (
          <ScrollWrap>
            <ErrorBoundary key="dump">
              <BrainDump userId={userId} onChronicleAdded={onDataChanged} />
            </ErrorBoundary>
          </ScrollWrap>
        )}

        {/* FOCUS */}
        {section === "focus" && (
          <ScrollWrap>
            <ErrorBoundary key="focus">
              <FocusSection userId={userId} onSessionComplete={onDataChanged} />
            </ErrorBoundary>
          </ScrollWrap>
        )}

        {/* AI PROVIDERS */}
        {section === "providers" && (
          <ScrollWrap>
            <ErrorBoundary key="providers">
              <AIProviders user={user} />
            </ErrorBoundary>
          </ScrollWrap>
        )}

        {/* SETTINGS */}
        {section === "settings" && (
          <ScrollWrap>
            <ErrorBoundary key="settings">
              <Settings user={user} firstName={firstName} onLogout={logout} />
            </ErrorBoundary>
          </ScrollWrap>
        )}

        {/* ALL OTHER MODULES */}
        {isModulePage && (
          <ScrollWrap>
            <ErrorBoundary key={section}>
              <ModulePage module={activeMod} onNavigate={navigate} />
            </ErrorBoundary>
          </ScrollWrap>
        )}
      </main>
    </div>
  );
}
