// src/pages/sections/ChatPanel.jsx v5
// RAG wired — AI searches chronicles semantically before every response

import { useState, useEffect, useRef, useCallback } from "react";
import { ENGINES, ENGINE_MAP }                       from "../../config/modules";
import { Icon, Spinner }                             from "../../components/Icons";
import { callAI, getProviderStatus }                 from "../../services/ai";
import { buildContext, buildFullSystemPrompt }        from "../../services/context";
import {
  saveChatMessage, loadChatSessions,
  loadChatHistory, deleteChatSession,
} from "../../services/db";

// ── Utilities ─────────────────────────────────────────────────────
function uid()          { return `${Date.now()}-${Math.random().toString(36).slice(2,7)}`; }
function nowTime()      { return new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }); }
function newSessionId() { return crypto.randomUUID ? crypto.randomUUID() : uid(); }

// ── Markdown renderer ─────────────────────────────────────────────
function inlineRender(text) {
  if (!text) return null;
  const parts = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[0].startsWith("**"))
      parts.push(<strong key={m.index} style={{ color:"#fff", fontWeight:600 }}>{m[2]}</strong>);
    else if (m[0].startsWith("*"))
      parts.push(<em key={m.index} style={{ color:"rgba(255,255,255,0.75)" }}>{m[3]}</em>);
    else
      parts.push(<code key={m.index} style={{ background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.3)", borderRadius:"4px", padding:"1px 5px", fontSize:"12px", fontFamily:"monospace", color:"#a78bfa" }}>{m[4]}</code>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : parts;
}

function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split("\n");
  const out = [];
  let i = 0, listBuf = [], listType = null;

  function flushList() {
    if (!listBuf.length) return;
    const items = listBuf.map((item, idx) => (
      <li key={idx} style={{ marginBottom:"4px", lineHeight:1.7 }}>{inlineRender(item)}</li>
    ));
    out.push(listType === "ol"
      ? <ol key={`ol${i}`} style={{ paddingLeft:"20px", margin:"6px 0" }}>{items}</ol>
      : <ul key={`ul${i}`} style={{ paddingLeft:"20px", margin:"6px 0" }}>{items}</ul>);
    listBuf = []; listType = null;
  }

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith("```")) {
      flushList();
      const lang = line.trim().slice(3).trim();
      const code = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) { code.push(lines[i]); i++; }
      out.push(
        <pre key={`c${i}`} style={{ background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", padding:"14px 16px", fontSize:"12px", fontFamily:"monospace", color:"#a78bfa", overflowX:"auto", margin:"10px 0", lineHeight:1.6, whiteSpace:"pre" }}>
          {lang && <span style={{ color:"rgba(255,255,255,0.2)", fontSize:"10px", display:"block", marginBottom:"6px" }}>{lang}</span>}
          {code.join("\n")}
        </pre>
      );
      i++; continue;
    }
    if (line.startsWith("# "))   { flushList(); out.push(<h1 key={`h1${i}`} style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"18px", color:"#fff", margin:"18px 0 8px" }}>{inlineRender(line.slice(2))}</h1>); i++; continue; }
    if (line.startsWith("## "))  { flushList(); out.push(<h2 key={`h2${i}`} style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"15px", color:"#e2e8f0", margin:"14px 0 6px" }}>{inlineRender(line.slice(3))}</h2>); i++; continue; }
    if (line.startsWith("### ")) { flushList(); out.push(<h3 key={`h3${i}`} style={{ fontFamily:"Sora,sans-serif", fontWeight:600, fontSize:"13px", color:"#a78bfa", margin:"12px 0 4px", textTransform:"uppercase", letterSpacing:"0.06em" }}>{inlineRender(line.slice(4))}</h3>); i++; continue; }
    if (line.trim() === "---")   { flushList(); out.push(<hr key={`hr${i}`} style={{ border:"none", borderTop:"1px solid rgba(255,255,255,0.08)", margin:"14px 0" }} />); i++; continue; }
    if (/^[-*•]\s/.test(line.trim()))  { if (listType && listType !== "ul") flushList(); listType="ul"; listBuf.push(line.trim().replace(/^[-*•]\s/,"")); i++; continue; }
    if (/^\d+\.\s/.test(line.trim())) { if (listType && listType !== "ol") flushList(); listType="ol"; listBuf.push(line.trim().replace(/^\d+\.\s/,"")); i++; continue; }
    if (line.startsWith("> ")) { flushList(); out.push(<blockquote key={`bq${i}`} style={{ borderLeft:"3px solid #8b5cf6", paddingLeft:"12px", margin:"8px 0", color:"rgba(255,255,255,0.6)", fontStyle:"italic" }}>{inlineRender(line.slice(2))}</blockquote>); i++; continue; }
    if (line.trim() === "") { flushList(); out.push(<div key={`br${i}`} style={{ height:"8px" }} />); i++; continue; }
    flushList();
    out.push(<p key={`p${i}`} style={{ margin:"0 0 8px", lineHeight:1.78, color:"rgba(255,255,255,0.88)" }}>{inlineRender(line)}</p>);
    i++;
  }
  flushList();
  return out;
}

// ── Provider Status Bar ───────────────────────────────────────────
function ProviderBar({ userId }) {
  const [status, setStatus] = useState([]);
  useEffect(() => {
    if (!userId) return;
    let alive = true;
    getProviderStatus(userId).then(d => { if (alive) setStatus(d||[]); });
    const t = setInterval(() => getProviderStatus(userId).then(d => { if (alive) setStatus(d||[]); }), 30000);
    return () => { alive=false; clearInterval(t); };
  }, [userId]);
  const active  = status.find(p => p.available);
  const allDown = status.length > 0 && status.every(p => !p.available);
  const noKeys  = status.length > 0 && status.every(p => !p.hasKey);
  const color   = allDown ? "#ef4444" : active?.quotaPercent > 80 ? "#f59e0b" : "#22c55e";
  const label   = noKeys ? "No API keys" : allDown ? "All providers down" : active ? active.name : "…";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"11px", color:"rgba(255,255,255,0.3)" }}>
      <span style={{ width:"6px", height:"6px", borderRadius:"50%", backgroundColor:color, boxShadow:`0 0 4px ${color}`, flexShrink:0, display:"inline-block" }} />
      <span>{label}</span>
    </div>
  );
}

// ── Model Selector ────────────────────────────────────────────────
function ModelSelector({ userId, selectedId, onSelect }) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const [models, setModels] = useState([]);
  const ref     = useRef(null);
  const searchR = useRef(null);

  useEffect(() => { if (userId) getProviderStatus(userId).then(d => setModels(d||[])); }, [userId]);
  useEffect(() => {
    if (open) { getProviderStatus(userId).then(d => setModels(d||[])); setTimeout(() => searchR.current?.focus(), 50); }
  }, [open, userId]);
  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const sel  = models.find(m => m.providerId === selectedId);
  const filt = models.filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.model.toLowerCase().includes(search.toLowerCase()));
  function dotC(m) { return !m.isEnabled||!m.hasKey?"#ef4444":m.isPaused||m.coolingDown||!m.available?"#f59e0b":"#22c55e"; }

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button onClick={() => setOpen(o=>!o)} style={{ display:"flex", alignItems:"center", gap:"5px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", padding:"4px 10px", color:"#fff", fontSize:"11px", cursor:"pointer", fontFamily:"Inter,sans-serif", whiteSpace:"nowrap" }}>
        {sel ? (<><span style={{ width:"5px", height:"5px", borderRadius:"50%", backgroundColor:dotC(sel) }} /><span style={{ color:"rgba(255,255,255,0.7)" }}>{sel.name}</span></>) : <span style={{ color:"rgba(255,255,255,0.4)" }}>⚡ Auto</span>}
        <span style={{ color:"rgba(255,255,255,0.3)", fontSize:"9px" }}>▾</span>
      </button>
      {open && (
        <div style={{ position:"absolute", bottom:"calc(100% + 6px)", left:0, width:"280px", background:"#0f0f1a", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"12px", boxShadow:"0 16px 48px rgba(0,0,0,0.7)", zIndex:500, overflow:"hidden" }}>
          <div style={{ padding:"8px 8px 6px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <input ref={searchR} type="text" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} autoComplete="off"
              style={{ width:"100%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"7px", padding:"5px 10px", color:"#fff", fontSize:"12px", fontFamily:"Inter,sans-serif", outline:"none", boxSizing:"border-box" }} />
          </div>
          <div onClick={() => { onSelect(null); setOpen(false); setSearch(""); }}
            style={{ padding:"8px 12px", cursor:"pointer", fontSize:"12px", background:!selectedId?"rgba(139,92,246,0.1)":"transparent", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", gap:"7px" }}>
            <span>⚡</span>
            <div>
              <div style={{ fontWeight:600, color:!selectedId?"#a78bfa":"#fff", fontSize:"12px" }}>Auto — Smart Failover</div>
              <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)" }}>Tries all providers in priority order</div>
            </div>
          </div>
          <div style={{ maxHeight:"220px", overflowY:"auto" }}>
            {filt.map(m => {
              const isActive = selectedId === m.providerId;
              const c = dotC(m);
              return (
                <div key={m.id} onClick={() => { if (!m.available) return; onSelect(m.providerId); setOpen(false); setSearch(""); }}
                  style={{ padding:"8px 12px", cursor:m.available?"pointer":"not-allowed", opacity:m.available?1:0.4, background:isActive?"rgba(139,92,246,0.1)":"transparent", display:"flex", alignItems:"center", gap:"8px" }}>
                  <span style={{ width:"6px", height:"6px", borderRadius:"50%", backgroundColor:c, flexShrink:0 }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:"12px", color:isActive?"#a78bfa":"#fff" }}>{m.name}</div>
                    <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.model}</div>
                  </div>
                  <div style={{ fontSize:"9px", color:c, fontWeight:500, flexShrink:0 }}>{m.available?`${m.requestsToday}/${m.maxPerDay}`:"unavail"}</div>
                </div>
              );
            })}
          </div>
          <div style={{ padding:"5px 12px", borderTop:"1px solid rgba(255,255,255,0.06)", fontSize:"10px", color:"rgba(255,255,255,0.2)" }}>
            {models.filter(m=>m.available).length}/{models.length} available
          </div>
        </div>
      )}
    </div>
  );
}

// ── History Sidebar ───────────────────────────────────────────────
function HistorySidebar({ userId, currentSessionId, onSelectSession, onNewChat, open, onClose }) {
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [delId,    setDelId]    = useState(null);

  useEffect(() => {
    if (!userId || !open) return;
    setLoading(true);
    loadChatSessions(userId).then(({ data }) => { setSessions(data||[]); setLoading(false); });
  }, [userId, open]);

  async function handleDelete(sid, e) {
    e.stopPropagation();
    if (delId === sid) {
      await deleteChatSession(userId, sid);
      setSessions(prev => prev.filter(s => s.session_id !== sid));
      if (currentSessionId === sid) onNewChat();
      setDelId(null);
    } else {
      setDelId(sid);
      setTimeout(() => setDelId(null), 3000);
    }
  }

  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:498 }} />
      <div style={{ position:"fixed", top:0, left:"232px", bottom:0, width:"256px", background:"#0d0d18", borderRight:"1px solid rgba(255,255,255,0.08)", zIndex:499, display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"16px 14px 10px", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"13px", color:"#fff" }}>Chat History</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:"18px", cursor:"pointer", lineHeight:1 }}>×</button>
        </div>
        <div style={{ padding:"10px" }}>
          <button onClick={() => { onNewChat(); onClose(); }} style={{ width:"100%", background:"linear-gradient(135deg,#8b5cf6,#3b82f6)", border:"none", borderRadius:"8px", color:"#fff", fontSize:"12px", fontWeight:600, padding:"8px", cursor:"pointer", fontFamily:"Inter,sans-serif" }}>
            + New Chat
          </button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"0 10px 10px" }}>
          {loading && <div style={{ textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:"12px", padding:"16px 0" }}>Loading…</div>}
          {!loading && sessions.length === 0 && <div style={{ textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:"12px", padding:"20px 0" }}>No past chats yet</div>}
          {sessions.map(s => (
            <div key={s.session_id} onClick={() => { onSelectSession(s.session_id); onClose(); }}
              style={{ padding:"9px 10px", borderRadius:"8px", cursor:"pointer", marginBottom:"4px", background:currentSessionId===s.session_id?"rgba(139,92,246,0.12)":"rgba(255,255,255,0.02)", border:`1px solid ${currentSessionId===s.session_id?"rgba(139,92,246,0.3)":"rgba(255,255,255,0.06)"}`, display:"flex", gap:"8px", alignItems:"flex-start" }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:"12px", color:"#fff", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.content?.slice(0,48)||"Chat session"}</div>
                <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", marginTop:"2px" }}>{new Date(s.created_at).toLocaleDateString([],{month:"short",day:"numeric"})}</div>
              </div>
              <button onClick={e=>handleDelete(s.session_id,e)} style={{ background:"none", border:"none", color:delId===s.session_id?"#ef4444":"rgba(255,255,255,0.2)", fontSize:"13px", cursor:"pointer", padding:0, flexShrink:0 }}>
                {delId===s.session_id?"⚠":"×"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Context Indicator ─────────────────────────────────────────────
function ContextIndicator({ context, loading, ragCount }) {
  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"10px", color:"rgba(255,255,255,0.25)" }}>
      <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:"#f59e0b" }} />
      Loading context…
    </div>
  );
  if (!context) return null;
  const items = [];
  if (context.aboutMe)                     items.push("profile");
  if (context.stats?.dumpsThisWeek > 0)    items.push(`${context.stats.dumpsThisWeek} dumps`);
  if (context.stats?.totalChronicles > 0)  items.push(`${context.stats.totalChronicles} total`);
  if (context.cognitive)                   items.push("cognitive");
  if (!items.length) return null;

  return (
    <div style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"10px", color:"rgba(255,255,255,0.3)" }}>
      <span style={{ color:"#22c55e", fontSize:"9px" }}>●</span>
      <span>Context: {items.join(" · ")}</span>
      {ragCount > 0 && <span style={{ color:"#a78bfa" }}>· {ragCount} RAG</span>}
    </div>
  );
}

// ── Message Bubble ────────────────────────────────────────────────
function Bubble({ msg, onEdit, onRefine, rated, onRate, isRefining }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";
  const isAI   = msg.role === "ai";

  function copy() {
    navigator.clipboard.writeText(msg.text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  }

  return (
    <div className={`chat-bubble ${isUser?"bubble-user":"bubble-ai"}${msg.isRefined?" refined":""}`}>
      {isAI && (
        <div className="bubble-header">
          <div className="bubble-avatar">M</div>
          <span className="bubble-name">Mindoo</span>
          <span className="bubble-time">{msg.time}</span>
          {msg.provider && !msg.failed && <span className="bubble-provider">via {msg.provider}</span>}
          {msg.ragCount > 0 && <span style={{ fontSize:"9px", color:"#a78bfa", background:"rgba(139,92,246,0.12)", border:"1px solid rgba(139,92,246,0.25)", borderRadius:"4px", padding:"1px 5px" }}>RAG:{msg.ragCount}</span>}
          {msg.isRefined && <span className="bubble-refined-badge">✦ Refined</span>}
        </div>
      )}

      <div className="bubble-text" style={{ fontSize:"14px", lineHeight:1.78 }}>
        {isAI ? renderMarkdown(msg.text) : msg.text}
      </div>

      {isAI && msg.id && isRefining && (
        <div className="refine-progress">
          <div className="refine-spinner" />
          <span>Crafting a deeper, more comprehensive version…</span>
        </div>
      )}

      {(isUser || (isAI && msg.id)) && (
        <div className="bubble-actions">
          <div className="bubble-action-left">
            <button className="action-chip" onClick={copy}>{copied?"✓ Copied":"Copy"}</button>
            {isUser && <button className="action-chip" onClick={() => onEdit(msg)}>Edit</button>}
            {isAI && msg.id && !msg.failed && !isRefining && (
              <button className="action-chip refine" onClick={() => onRefine(msg)}>✦ Refine</button>
            )}
          </div>
          {isAI && msg.id && (
            <div className="bubble-action-right">
              {rated[msg.id] ? (
                <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.25)" }}>Thanks ✓</span>
              ) : (
                <>
                  <button className="thumb-btn" onClick={() => onRate(msg.id,"positive")}>👍</button>
                  <button className="thumb-btn" onClick={() => onRate(msg.id,"negative")}>👎</button>
                </>
              )}
            </div>
          )}
          {isUser && <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.2)", marginLeft:"auto" }}>{msg.time}</span>}
        </div>
      )}
    </div>
  );
}

// ── Refine prompt ─────────────────────────────────────────────────
function buildRefinePrompt(originalResponse, history, firstName) {
  return `You previously gave this response:

"${originalResponse}"

${firstName||"The user"} requests a REFINED version — substantially better in every dimension:
1. DRAMATICALLY MORE COMPREHENSIVE — every relevant angle covered
2. MORE LOGICALLY STRUCTURED — clear sections, numbered steps
3. DEEPER IN INSIGHT — name what hasn't been named
4. RICHER IN SCIENCE — more research citations with authors
5. MORE ACTIONABLE — complete prioritised action plan
6. MORE PERSONALISED — use more context from this conversation
7. SYNTHESISED — reference the thread of what was discussed

Do NOT simply repeat the original with minor edits.

Conversation context:
${history.slice(-8).map(m=>`${m.role.toUpperCase()}: ${m.content.slice(0,400)}`).join("\n\n")}

Now produce the definitive refined version:`;
}

// ═══════════════════════════════════════════════════════════════
// MAIN CHATPANEL
// ═══════════════════════════════════════════════════════════════
export function ChatPanel({ firstName, user }) {
  const userId     = user?.id;
  const sessionRef = useRef(newSessionId());

  const [context,        setContext]        = useState(null);
  const [contextLoading, setContextLoading] = useState(true);
  const [lastRagCount,   setLastRagCount]   = useState(0);

  const [messages,     setMessages]     = useState(() => [{
    role:"ai", id:null, provider:null, failed:false, time:nowTime(), isRefined:false, ragCount:0,
    text:`Welcome back, ${firstName||"Boss"}.\n\nLoading your personal context…`,
  }]);

  const [activeEngine,  setActiveEngine]  = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [isTyping,      setIsTyping]      = useState(false);
  const [refiningId,    setRefiningId]    = useState(null);
  const [rated,         setRated]         = useState({});
  const [editingMsg,    setEditingMsg]    = useState(null);
  const [showHistory,   setShowHistory]   = useState(false);

  const inputRef  = useRef(null);
  const scrollRef = useRef(null);

  // ── Load base context on mount ────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    setContextLoading(true);
    buildContext(userId).then(ctx => {
      setContext(ctx);
      setContextLoading(false);
      const dumps    = ctx.stats?.dumpsThisWeek || 0;
      const clarity  = ctx.stats?.clarityScore || 0;
      const hasAbout = !!ctx.aboutMe;
      setMessages(prev => {
        if (prev.length !== 1) return prev;
        return [{
          ...prev[0],
          text: [
            `Welcome back, ${firstName||"Boss"}.`,
            dumps > 0 ? `You've made ${dumps} brain dump${dumps>1?"s":""} this week.` : "No brain dumps this week yet.",
            clarity > 0 ? `Clarity score: ${clarity}%.` : "",
            hasAbout ? "Profile loaded." : "Fill in your About Me profile for deeper personalisation.",
            ctx.stats?.totalChronicles > 0 ? `I can search all ${ctx.stats.totalChronicles} of your chronicles to find relevant context for every message (RAG enabled).` : "",
            "\nWhat's on your mind?",
          ].filter(Boolean).join(" "),
        }];
      });
    });
  }, [userId, firstName]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    if (editingMsg && inputRef.current) { inputRef.current.value = editingMsg.originalText; inputRef.current.focus(); }
  }, [editingMsg]);

  async function loadSession(sessionId) {
    const { data } = await loadChatHistory(userId, sessionId);
    if (!data?.length) return;
    sessionRef.current = sessionId;
    setMessages(data.map(m => ({
      role:      m.role === "assistant" ? "ai" : "user",
      text:      m.content,
      id:        m.id,
      time:      new Date(m.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
      provider:  m.provider_id || null,
      isRefined: m.is_refined || false,
      ragCount:  0,
      failed:    false,
    })));
    setRated({});
  }

  function startNewChat() {
    sessionRef.current = newSessionId();
    setMessages([{
      role:"ai", id:null, provider:null, failed:false, time:nowTime(), isRefined:false, ragCount:0,
      text:`Fresh start. What's on your mind, ${firstName||"Boss"}?`,
    }]);
    setRated({}); setEditingMsg(null); setActiveEngine(null);
  }

  // ── Core send — RAG runs here ─────────────────────────────────
  const send = useCallback(async (overrideText=null, refineTarget=null) => {
    const raw = overrideText ?? inputRef.current?.value?.trim();
    if (!raw && !refineTarget) return;
    if (isTyping) return;
    if (!overrideText && !refineTarget) inputRef.current.value = "";

    let base = messages;
    if (editingMsg) {
      const idx = messages.findIndex(m => m.id === editingMsg.id);
      if (idx !== -1) base = messages.slice(0, idx);
      setEditingMsg(null);
    }

    let next = base;
    if (!refineTarget) {
      const userMsg = { role:"user", text:raw, time:nowTime(), id:uid(), provider:null, isRefined:false, ragCount:0, failed:false };
      next = [...base, userMsg];
      setMessages(next);
      saveChatMessage({ userId, sessionId:sessionRef.current, role:"user", content:raw, engineId:activeEngine||"", providerId:"", model:"" }).catch(()=>{});
    }

    if (refineTarget) setRefiningId(refineTarget.id);
    else setIsTyping(true);

    try {
      // Build history
      const history = next.filter(m=>m.role==="user"||m.role==="ai").map(m=>({role:m.role==="user"?"user":"assistant",content:m.text}));

      // ── RAG: search chronicles using the user's message ──────
      const query  = refineTarget ? null : raw;
      const ctxWithRAG = await buildContext(userId, query);
      setContext(ctxWithRAG);

      const ragCount = ctxWithRAG.ragResults?.length || 0;
      setLastRagCount(ragCount);

      // Build system prompt with RAG results injected
      const sysPrompt = buildFullSystemPrompt(ctxWithRAG, activeEngine, firstName, ENGINE_MAP);

      let finalHistory = history;
      if (refineTarget) {
        finalHistory = [...history, { role:"user", content:buildRefinePrompt(refineTarget.text, history, firstName) }];
      }

      const result = await callAI({
        messages:            finalHistory,
        systemPrompt:        sysPrompt,
        maxTokens:           refineTarget ? 3000 : 2000,
        userId,
        preferredProviderId: selectedModel || undefined,
      });

      const aiMsg = {
        role:"ai", text:result.text, time:nowTime(),
        id:uid(), provider:result.providerName, model:result.model,
        failed:result.failed||false, isRefined:!!refineTarget,
        ragCount: refineTarget ? 0 : ragCount,
      };

      if (refineTarget) setMessages(prev => prev.map(m => m.id===refineTarget.id ? {...aiMsg,id:refineTarget.id} : m));
      else              setMessages(prev => [...prev, aiMsg]);

      if (userId && !result.failed) {
        saveChatMessage({ userId, sessionId:sessionRef.current, role:"assistant", content:result.text, engineId:activeEngine||"", providerId:result.provider||"", model:result.model||"", isRefined:!!refineTarget }).catch(()=>{});
      }

    } catch {
      const errMsg = { role:"ai", text:"Something went wrong. Please try again.", time:nowTime(), id:null, provider:null, failed:true, isRefined:false, ragCount:0 };
      if (refineTarget) setMessages(prev => prev.map(m => m.id===refineTarget.id ? {...errMsg,id:refineTarget.id} : m));
      else              setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
      setRefiningId(null);
    }
  }, [messages, isTyping, activeEngine, firstName, userId, selectedModel, editingMsg, context]);

  function handleKeyDown(e) {
    if (e.key==="Enter"&&!e.shiftKey) { e.preventDefault(); send(); }
    if (e.key==="Escape"&&editingMsg) { setEditingMsg(null); if(inputRef.current) inputRef.current.value=""; }
  }

  return (
    <div className="chat-panel">
      <HistorySidebar userId={userId} currentSessionId={sessionRef.current} onSelectSession={loadSession} onNewChat={startNewChat} open={showHistory} onClose={()=>setShowHistory(false)} />

      <div className="chat-messages" ref={scrollRef}>
        {messages.map((msg,i) => (
          <Bubble key={msg.id||i} msg={msg}
            onEdit={m=>setEditingMsg({id:m.id,originalText:m.text})}
            onRefine={m=>send(null,m)}
            rated={rated}
            onRate={(id,r)=>setRated(p=>({...p,[id]:r}))}
            isRefining={refiningId===msg.id}
          />
        ))}
        {isTyping && (
          <div className="chat-bubble bubble-ai">
            <div className="bubble-header">
              <div className="bubble-avatar">M</div>
              <span className="bubble-name">Mindoo</span>
              <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", marginLeft:"4px" }}>thinking…</span>
            </div>
            <div className="typing-dots"><span/><span/><span/></div>
          </div>
        )}
      </div>

      {editingMsg && (
        <div className="edit-banner">
          <span>✏️ Editing — Enter to resend · Escape to cancel</span>
          <button onClick={()=>{setEditingMsg(null);if(inputRef.current)inputRef.current.value="";}} style={{ background:"none",border:"none",color:"#a78bfa",cursor:"pointer",fontSize:"12px" }}>Cancel</button>
        </div>
      )}

      <div className="chat-input-area">
        <div className="engine-section">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"8px", gap:"8px", flexWrap:"wrap" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <p className="engine-label" style={{ margin:0 }}>Engines</p>
              <ContextIndicator context={context} loading={contextLoading} ragCount={lastRagCount} />
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"6px", flexWrap:"wrap" }}>
              <ProviderBar userId={userId} />
              <ModelSelector userId={userId} selectedId={selectedModel} onSelect={setSelectedModel} />
              <button onClick={()=>setShowHistory(true)} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"7px", color:"rgba(255,255,255,0.5)", fontSize:"11px", padding:"3px 9px", cursor:"pointer", fontFamily:"Inter,sans-serif", whiteSpace:"nowrap" }}>📋 History</button>
              <button onClick={startNewChat} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"7px", color:"rgba(255,255,255,0.35)", fontSize:"11px", padding:"3px 9px", cursor:"pointer", fontFamily:"Inter,sans-serif", whiteSpace:"nowrap" }}>+ New</button>
            </div>
          </div>
          <div className="engine-row">
            {ENGINES.map(e => (
              <button key={e.id} className={`engine-pill${activeEngine===e.id?" active":""}`} style={{"--engine-color":e.color}} title={`${e.name}: ${e.tip}`} onClick={()=>setActiveEngine(activeEngine===e.id?null:e.id)}>
                {e.id}: {e.label}
              </button>
            ))}
          </div>
        </div>
        <div className="chat-input-row">
          <textarea ref={inputRef} className={`chat-textarea${editingMsg?" editing":""}`} rows={1}
            placeholder={editingMsg?"Edit your message… (Enter to resend, Escape to cancel)":"What's on your mind? (Enter to send · Shift+Enter for new line)"}
            onKeyDown={handleKeyDown} />
          <button className="send-btn" onClick={()=>send()} disabled={isTyping||!!refiningId} aria-label="Send">
            {isTyping?<Spinner size={15}/>:<Icon name="send" size={15} color="#fff"/>}
          </button>
        </div>
      </div>
    </div>
  );
}
