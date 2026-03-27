import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import {
  MessageSquare,
  Zap,
  Brain,
  Link2,
  BookOpen,
  TrendingUp,
  ScrollText,
  Settings,
  LogOut,
  ChevronRight,
  Anchor,
  Save,
  Send,
  Menu,
  X,
  Sparkles,
  Target,
  Layers,
  Lightbulb,
  Wrench,
  GraduationCap,
  Sun,
  Moon,
  Star
} from 'lucide-react'

// ─── Engine config ──────────────────────────────────────────────────────────
const ENGINES = [
  {
    id: 'A',
    code: '01',
    label: 'Clarity Engine',
    short: 'Clarity',
    description: 'Turn a vague feeling into a clear thought',
    icon: Lightbulb,
    color: '#8b5cf6',
  },
  {
    id: 'B',
    code: '02',
    label: 'Goal Builder',
    short: 'Goal Builder',
    description: 'Shape rough ideas into one specific goal',
    icon: Target,
    color: '#6366f1',
  },
  {
    id: 'C',
    code: '03',
    label: 'Problem Solver',
    short: 'Problem Solver',
    description: 'Diagnose what is broken and find the path',
    icon: Wrench,
    color: '#3b82f6',
  },
  {
    id: 'D',
    code: '04',
    label: 'Project Launcher',
    short: 'Project Launcher',
    description: 'Build a full logical plan, step by step',
    icon: Layers,
    color: '#8b5cf6',
  },
  {
    id: 'E',
    code: '05',
    label: 'Task Executor',
    short: 'Task Executor',
    description: 'Engineer the perfect AI prompt for any task',
    icon: Zap,
    color: '#6366f1',
  },
  {
    id: 'F',
    code: '06',
    label: 'Skill Builder',
    short: 'Skill Builder',
    description: 'Design your personal learning path',
    icon: GraduationCap,
    color: '#3b82f6',
  },
]

// ─── Nav items ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'chat',      label: 'Mindoo Chat',      icon: MessageSquare },
  { id: 'engines',   label: 'Engine Selector',  icon: Zap },
  { id: 'memory',    label: 'Memory',           icon: Brain },
  { id: 'chains',    label: 'Prompt Chains',    icon: Link2 },
  { id: 'templates', label: 'Templates',        icon: BookOpen },
  { id: 'skills',    label: 'Skill Builder',    icon: TrendingUp },
  { id: 'log',       label: 'Session Log',      icon: ScrollText },
]

// ─── Greeting helper ─────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ─── Coming Soon panel ───────────────────────────────────────────────────────
function ComingSoon({ label }) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      opacity: 0.4,
    }}>
      <Star size={32} strokeWidth={1.5} color="#8b5cf6" />
      <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '16px', color: '#ffffff', margin: 0 }}>
        {label}
      </p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
        Coming in a future phase
      </p>
    </div>
  )
}

// ─── Chat panel ──────────────────────────────────────────────────────────────
function ChatPanel({ firstName, activeEngine, setActiveEngine, setActivePanel }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hey ${firstName || 'there'} — I'm Mindoo, your second brain. Tell me what's on your mind and I'll route you to the right engine automatically. Or pick one yourself from the Engine Selector.`,
    },
  ])

  function handleSend() {
    const text = input.trim()
    if (!text) return
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `Got it. The AI engine will be connected in Phase 4. For now, you can explore the Engine Selector to see all 6 engines — or just keep typing and I'll be ready.`,
        },
      ])
    }, 800)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>

      {/* Active engine badge */}
      <div style={{ padding: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>
          ACTIVE ENGINE
        </span>
        <button
          onClick={() => setActivePanel('engines')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.15))',
            border: '1px solid rgba(139,92,246,0.4)',
            borderRadius: '20px',
            padding: '4px 12px',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            color: '#a78bfa',
          }}
        >
          <Sparkles size={12} strokeWidth={1.5} />
          {activeEngine ? `${activeEngine.code} — ${activeEngine.short}` : 'Auto-detect'}
          <ChevronRight size={12} strokeWidth={1.5} />
        </button>
        {activeEngine && (
          <button
            onClick={() => setActiveEngine(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.3)',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              padding: '4px 8px',
            }}
          >
            clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        paddingRight: '4px',
        minHeight: 0,
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{
              maxWidth: '80%',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                : 'rgba(255,255,255,0.05)',
              border: msg.role === 'user'
                ? 'none'
                : '1px solid rgba(255,255,255,0.08)',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              padding: '12px 16px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              lineHeight: '1.7',
              color: '#ffffff',
            }}>
              {msg.role === 'assistant' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Sparkles size={12} strokeWidth={1.5} color="#8b5cf6" />
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>MINDOO</span>
                </div>
              )}
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div style={{ paddingTop: '16px' }}>
        {/* Command buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          {['/anchor', '/save', '/status', '/refresh'].map(cmd => (
            <button
              key={cmd}
              onClick={() => setInput(cmd)}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '5px 10px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                letterSpacing: '0.02em',
              }}
            >
              {cmd}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Tell Mindoo what you need…"
            rows={2}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '12px 16px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              color: '#ffffff',
              resize: 'none',
              outline: 'none',
              lineHeight: '1.6',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          <button
            onClick={handleSend}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'opacity 0.2s, transform 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Send size={16} strokeWidth={1.5} color="#ffffff" />
          </button>
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '8px', textAlign: 'center' }}>
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

// ─── Engine Selector panel ────────────────────────────────────────────────────
function EnginesPanel({ activeEngine, setActiveEngine, setActivePanel }) {
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px', lineHeight: '1.7' }}>
        Pick an engine to activate it. Mindoo will use it for your next chat session. Or leave it on Auto-detect and Mindoo will choose for you.
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '12px',
      }}>
        {ENGINES.map(engine => {
          const Icon = engine.icon
          const isActive = activeEngine?.id === engine.id
          return (
            <button
              key={engine.id}
              onClick={() => {
                setActiveEngine(engine)
                setActivePanel('chat')
              }}
              style={{
                background: isActive
                  ? `linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.15))`
                  : 'rgba(255,255,255,0.03)',
                border: isActive
                  ? '1px solid rgba(139,92,246,0.5)'
                  : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${engine.color}30, ${engine.color}15)`,
                  border: `1px solid ${engine.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={16} strokeWidth={1.5} color={engine.color} />
                </div>
                <div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em', marginBottom: '2px' }}>
                    {engine.id} → {engine.code}
                  </div>
                  <div style={{ fontFamily: 'Sora, sans-serif', fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                    {engine.short}
                  </div>
                </div>
                {isActive && (
                  <div style={{ marginLeft: 'auto', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '20px', padding: '3px 10px', fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#a78bfa', letterSpacing: '0.05em' }}>
                    ACTIVE
                  </div>
                )}
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: '1.6' }}>
                {engine.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [activePanel, setActivePanel] = useState('chat')
  const [activeEngine, setActiveEngine] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // ── Auth guard + fetch name ─────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/signin')
        return
      }
      const meta = session.user.user_metadata
      setFirstName(meta?.first_name || meta?.name?.split(' ')[0] || '')
      setLoading(false)
    }
    init()
  }, [navigate])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/signin')
  }

  // ── Derived values ──────────────────────────────────────────────────────
  const panelLabel = NAV_ITEMS.find(n => n.id === activePanel)?.label || 'Dashboard'

  function renderPanel() {
    if (activePanel === 'chat') {
      return (
        <ChatPanel
          firstName={firstName}
          activeEngine={activeEngine}
          setActiveEngine={setActiveEngine}
          setActivePanel={setActivePanel}
        />
      )
    }
    if (activePanel === 'engines') {
      return (
        <EnginesPanel
          activeEngine={activeEngine}
          setActiveEngine={setActiveEngine}
          setActivePanel={setActivePanel}
        />
      )
    }
    return <ComingSoon label={panelLabel} />
  }

  if (loading) {
    return (
      <div className="page-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '2px solid rgba(139,92,246,0.3)',
            borderTopColor: '#8b5cf6',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>Loading Mindoo…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ── Layout ──────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: '#09090f',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* Background glows */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 600px 400px at 20% 0%, rgba(139,92,246,0.07) 0%, transparent 70%),
          radial-gradient(ellipse 500px 300px at 80% 100%, rgba(59,130,246,0.06) 0%, transparent 70%)
        `,
      }} />

      {/* ── Top bar (mobile) ── */}
      <div style={{
        position: 'relative', zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(9,9,15,0.9)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setSidebarOpen(v => !v)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.6)',
              display: 'flex', alignItems: 'center',
            }}
          >
            {sidebarOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
          <span className="axis-logo" style={{ fontSize: '20px' }}>Mindoo</span>
        </div>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
          {panelLabel}
        </span>
        <button
          onClick={handleSignOut}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontFamily: 'Inter, sans-serif', fontSize: '13px',
          }}
        >
          <LogOut size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* ── Main body ── */}
      <div style={{
        position: 'relative', zIndex: 1,
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        height: 'calc(100vh - 57px)',
      }}>

        {/* ── Sidebar overlay (mobile) ── */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 30,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
            }}
          />
        )}

        {/* ── Sidebar ── */}
        <aside style={{
          position: 'fixed',
          top: '57px',
          left: 0,
          bottom: 0,
          zIndex: 40,
          width: '240px',
          background: 'rgba(15,15,26,0.97)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 12px',
          gap: '2px',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',

          // Desktop: always visible
          '@media (min-width: 768px)': {
            transform: 'translateX(0)',
          },
        }}>

          {/* User info */}
          <div style={{
            padding: '12px 12px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            marginBottom: '8px',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Sora, sans-serif', fontSize: '14px', fontWeight: 700,
              color: '#ffffff', marginBottom: '10px',
            }}>
              {firstName ? firstName[0].toUpperCase() : 'M'}
            </div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
              {firstName || 'Boss'}
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
              {getGreeting()}
            </div>
          </div>

          {/* Nav */}
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const isActive = activePanel === item.id
            return (
              <button
                key={item.id}
                onClick={() => { setActivePanel(item.id); setSidebarOpen(false) }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.15))'
                    : 'transparent',
                  transition: 'background 0.2s',
                  textAlign: 'left',
                  width: '100%',
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent'
                }}
              >
                <Icon
                  size={16}
                  strokeWidth={1.5}
                  color={isActive ? '#a78bfa' : 'rgba(255,255,255,0.4)'}
                />
                <span style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                  fontWeight: isActive ? 500 : 400,
                }}>
                  {item.label}
                </span>
                {isActive && (
                  <div style={{
                    marginLeft: 'auto',
                    width: '4px', height: '4px', borderRadius: '50%',
                    background: '#8b5cf6',
                  }} />
                )}
              </button>
            )
          })}

          <div style={{ flex: 1 }} />

          {/* Bottom nav */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <button
              onClick={() => { setActivePanel('settings'); setSidebarOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px', border: 'none',
                cursor: 'pointer',
                background: activePanel === 'settings' ? 'rgba(255,255,255,0.06)' : 'transparent',
                width: '100%', textAlign: 'left',
              }}
            >
              <Settings size={16} strokeWidth={1.5} color="rgba(255,255,255,0.4)" />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Settings</span>
            </button>
            <button
              onClick={handleSignOut}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px', border: 'none',
                cursor: 'pointer', background: 'transparent',
                width: '100%', textAlign: 'left',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={16} strokeWidth={1.5} color="rgba(239,68,68,0.5)" />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'rgba(239,68,68,0.6)' }}>Sign out</span>
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main style={{
          flex: 1,
          marginLeft: '0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          // Push content right of sidebar on desktop
        }}>
          {/* Desktop: offset for fixed sidebar */}
          <style>{`
            @media (min-width: 768px) {
              .mindoo-sidebar {
                transform: translateX(0) !important;
              }
              .mindoo-main {
                margin-left: 240px !important;
              }
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .panel-animate {
              animation: fadeIn 0.25s ease forwards;
            }
            textarea::placeholder { color: rgba(255,255,255,0.25); }
            ::-webkit-scrollbar { width: 4px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
          `}</style>

          {/* Workaround: apply desktop margin via class */}
          <div
            className="mindoo-main panel-animate"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              height: '100%',
            }}
          >
            {/* Header bar */}
            <div style={{
              padding: 'clamp(16px, 3vw, 24px) clamp(20px, 4vw, 32px)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div>
                <h1 style={{
                  fontFamily: 'Sora, sans-serif',
                  fontSize: 'clamp(18px, 3vw, 24px)',
                  fontWeight: 800,
                  color: '#ffffff',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}>
                  {panelLabel}
                </h1>
                {activePanel === 'chat' && (
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.35)',
                    margin: '4px 0 0',
                  }}>
                    {getGreeting()}, {firstName || 'Boss'} — your second brain is ready
                  </p>
                )}
              </div>

              {/* Stat pills (chat panel only) */}
              {activePanel === 'chat' && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px',
                    padding: '6px 14px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.5)',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                    AI Connected
                  </div>
                </div>
              )}
            </div>

            {/* Panel content */}
            <div
              key={activePanel}
              className="panel-animate"
              style={{
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                padding: 'clamp(20px, 4vw, 32px)',
              }}
            >
              {renderPanel()}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
