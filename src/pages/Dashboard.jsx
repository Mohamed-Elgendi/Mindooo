// src/pages/Dashboard.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth }              from "../hooks/useAuth";
import { Sidebar }              from "../components/Sidebar";
import { Topbar, MobileBar }    from "../components/Topbar";
import { ErrorBoundary }        from "../components/ErrorBoundary";
import { MODULES }              from "../config/modules";

import { Home }                 from "./sections/Home";
import { ChatPanel }            from "./sections/ChatPanel";
import { BrainDump }            from "./sections/BrainDump";
import { FocusSection }         from "./sections/FocusSection";
import { AISettings }           from "./sections/AISettings";
import { ModulePage }           from "./sections/ModulePage";
import { Settings }             from "./sections/Settings";
import { AboutMeSection }       from "./sections/AboutMeSection";
import { JournalSection }       from "./sections/JournalSection";
import { EmotionSection }       from "./sections/EmotionSection";
import { HabitSection }         from "./sections/HabitSection";
import { AffirmationSection }   from "./sections/AffirmationSection";
import { MemoryOS }             from "../modules/memoryos/components/MemoryOS.jsx";
import { supabase }             from "../supabase";

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

function ScrollWrap({ children }) {
  return (
    <div style={{
      flex: 1,
      overflowY: "auto",
      overflowX: "hidden",
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

  const activeMod = MODULES.find(m => m.id === section);

  const knownSections = [
    "home", "chat", "dump", "focus",
    "ai-settings", "settings", "memory",
    "about", "journal", "emotion", "habit", "affirm",
  ];

  const isModulePage = activeMod && !knownSections.includes(section);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">Mindooo</div>
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
          <ScrollWrap><ErrorBoundary key="home">
            <Home firstName={firstName} userId={userId} clock={clock} onNavigate={navigate} refreshKey={refreshKey} />
          </ErrorBoundary></ScrollWrap>
        )}

        {section === "chat" && (
          <ErrorBoundary key="chat">
            <ChatPanel firstName={firstName} user={user} />
          </ErrorBoundary>
        )}

        {section === "dump" && (
          <ScrollWrap><ErrorBoundary key="dump">
            <BrainDump userId={userId} onChronicleAdded={onDataChanged} />
          </ErrorBoundary></ScrollWrap>
        )}

        {section === "focus" && (
          <ScrollWrap><ErrorBoundary key="focus">
            <FocusSection userId={userId} onSessionComplete={onDataChanged} />
          </ErrorBoundary></ScrollWrap>
        )}

        {section === "ai-settings" && (
          <ScrollWrap><ErrorBoundary key="ai-settings">
            <AISettings user={user} />
          </ErrorBoundary></ScrollWrap>
        )}

        {section === "settings" && (
          <ScrollWrap><ErrorBoundary key="settings">
            <Settings user={user} firstName={firstName} onLogout={logout} />
          </ErrorBoundary></ScrollWrap>
        )}

        {section === "memory" && (
          <ScrollWrap><ErrorBoundary key="memory">
            <MemoryOS user={user} supabase={supabase} onNavigate={navigate} />
          </ErrorBoundary></ScrollWrap>
        )}

        {section === "about" && (
          <ScrollWrap><ErrorBoundary key="about">
            <AboutMeSection userId={userId} />
          </ErrorBoundary></ScrollWrap>
        )}

        {section === "journal" && (
          <ScrollWrap><ErrorBoundary key="journal">
            <JournalSection userId={userId} />
          </ErrorBoundary></ScrollWrap>
        )}

        {section === "emotion" && (
          <ScrollWrap><ErrorBoundary key="emotion">
            <EmotionSection userId={userId} />
          </ErrorBoundary></ScrollWrap>
        )}

        {section === "habit" && (
          <ScrollWrap><ErrorBoundary key="habit">
            <HabitSection userId={userId} />
          </ErrorBoundary></ScrollWrap>
        )}

        {section === "affirm" && (
          <ScrollWrap><ErrorBoundary key="affirm">
            <AffirmationSection userId={userId} />
          </ErrorBoundary></ScrollWrap>
        )}

        {isModulePage && (
          <ScrollWrap><ErrorBoundary key={section}>
            <ModulePage module={activeMod} onNavigate={navigate} />
          </ErrorBoundary></ScrollWrap>
        )}
      </main>
    </div>
  );
}
