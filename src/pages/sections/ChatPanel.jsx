// src/pages/sections/ChatPanel.jsx v3
// Full chat with history, model selector, copy, edit, refine, markdown

import { useState, useEffect, useRef, useCallback } from "react";
import { ENGINES, buildSystemPrompt }    from "../../config/modules";
import { Icon, Spinner }                 from "../../components/Icons";
import { callAI, getProviderStatus }     from "../../services/ai";
import {
  saveChatMessage, loadChatSessions, loadChatHistory, deleteChatSession,
} from "../../services/db";

// ── Utilities ─────────────────────────────────────────────────────
function uid()     { return `${Date.now()}-${Math.random().toString(36).slice(2,7)}`; }
function nowTime() { return new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }); }
function newSessionId() { return crypto.randomUUID ? crypto.randomUUID() : uid(); }

// ── Inline markdown renderer ──────────────────────────────────────
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
      out.push(<pre key={`c${i}`} style={{ background:"rgba(0,0,0,0.35)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", padding:"12px 14px", fontSize:"12px", fontFamily:"monospace", color:"#a78bfa", overflowX:"auto", margin:"8px 0", lineHeight:1.6, whiteSpace:"pre" }}>
        {lang && <span style={{ color:"rgba(255,255,255,0.2)", fontSize:"10px" }}>{lang}{"\n"}</span>}
        {code.join("\n")}
      </pre>);
      i++; continue;
    }
    if (line.startsWith("# "))   { flushList(); out.push(<h1 key={`h1${i}`} style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"17px", color:"#fff", margin:"16px 0 7px" }}>{inlineRender(line.slice(2))}</h1>); i++; continue; }
    if (line.startsWith("## "))  { flushList(); out.push(<h2 key={`h2${i}`} style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"14px", color:"#e2e8f0", margin:"14px 0 5px" }}>{inlineRender(line.slice(3))}</h2>); i++; continue; }
    if (line.startsWith("### ")) { flushList(); out.push(<h3 key={`h3${i}`} style={{ fontFamily:"Sora,sans-serif", fontWeight:600, fontSize:"12px", color:"#a78bfa", margin:"12px 0 4px", textTransform:"uppercase", letterSpacing:"0.06em" }}>{inlineRender(line.slice(4))}</h3>); i++; continue; }
    if (line.trim() === "---")   { flushList(); out.push(<hr key={`hr${i}`} style={{ border:"none", borderTop:"1px solid rgba(255,255,255,0.08)", margin:"14px 0" }} />); i++; continue; }
    if (/^[-*•]\s/.test(line.trim()))  { if (listType&&listType!=="ul") flushList(); listType="ul"; listBuf.push(line.trim().replace(/^[-*•]\s/,"")); i++; continue; }
    if (/^\d+\.\s/.test(line.trim())) { if (listType&&listType!=="ol") flushList(); listType="ol"; listBuf.push(line.trim().replace(/^\d+\.\s/,"")); i++; continue; }
    if (line.startsWith("> "))  { flushList(); out.push(<blockquote key={`bq${i}`} style={{ borderLeft:"3px solid #8b5cf6", paddingLeft:"12px", margin:"8px 0", color:"rgba(255,255,255,0.55)", fontStyle:"italic" }}>{inlineRender(line.slice(2))}</blockquote>); i++; continue; }
    if (line.trim() === "")     { flushList(); out.push(<div key={`br${i}`} style={{ height:"7px" }} />); i++; continue; }
    flushList();
    out.push(<p key={`p${i}`} style={{ margin:"0 0 7px", lineHeight:1.75, color:"rgba(255,255,255,0.88)" }}>{inlineRender(line)}</p>);
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
    const t = setInterval(() => getProviderStatus(userId).then(d => { if (alive) setStatus(d||[]); }), 20000);
    return () => { alive=false; clearInterval(t); };
  }, [userId]);

  const active  = status.find(p => p.available);
  const allDown = status.length > 0 && status.every(p => !p.available);
  const noKeys  = status.length > 0 && status.every(p => !p.hasKey);
  const color   = allDown ? "#ef4444" : active?.quotaPercent > 80 ? "#f59e0b" : "#22c55e";
  const label   = noKeys ? "No API keys configured" : allDown ? "All providers unavailable" : active ? `${active.name} — ${active.model.split("/").pop()}` : "Loading…";

  return (
    <div style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"11px", color:"rgba(255,255,255,0.3)" }}>
      <span style={{ width:"7px", height:"7px", borderRadius:"50%", backgroundColor:color, boxShadow:`0 0 5px ${color}`, flexShrink:0, display:"inline-block" }} />
      <span style={{ maxWidth:"200px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{label}</span>
    </div>
  );
}

// ── Smart Model Selector ──────────────────────────────────────────
function ModelSelector({ userId, selectedId, onSelect }) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const [models, setModels] = useState([]);
  const ref     = useRef(null);
  const searchR = useRef(null);

  useEffect(() => {
    if (!userId) return;
    getProviderStatus(userId).then(d => setModels(d||[]));
  }, [userId]);

  useEffect(() => {
    if (open) {
      getProviderStatus(userId).then(d => setModels(d||[]));
      setTimeout(() => searchR.current?.focus(), 50);
    }
  }, [open, userId]);

  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const sel  = models.find(m => m.id===selectedId || m.providerId===selectedId);
  const filt = models.filter(m =>
    !search ||
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.model.toLowerCase().includes(search.toLowerCase())
  );

  function dot(m) {
    if (!m.isEnabled||!m.hasKey) return "#ef4444";
    if (m.isPaused||m.coolingDown||!m.available) return "#f59e0b";
    return "#22c55e";
  }
  function stxt(m) {
    if (!m.isEnabled) return "disabled";
    if (!m.hasKey)    return "no key";
    if (m.isPaused)   return "paused";
    if (m.coolingDown) return `cd ${m.cooldownSecsLeft}s`;
    if (!m.available) return "unavailable";
    if (m.quotaPercent > 80) return `${m.quotaPercent}%`;
    return "ready";
  }

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button onClick={() => setOpen(o=>!o)} style={{ display:"flex", alignItems:"center", gap:"6px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"9px", padding:"5px 11px", color:"#fff", fontSize:"11px", cursor:"pointer", fontFamily:"Inter,sans-serif", whiteSpace:"nowrap" }}>
        {sel ? (
          <>
            <span style={{ width:"6px", height:"6px", borderRadius:"50%", backgroundColor:dot(sel), flexShrink:0 }} />
            <span style={{ color:"rgba(255,255,255,0.7)" }}>{sel.name}</span>
          </>
        ) : (
          <span style={{ color:"rgba(255,255,255,0.4)" }}>⚡ Auto</span>
        )}
        <span style={{ color:"rgba(255,255,255,0.3)" }}>▾</span>
      </button>

      {open && (
        <div style={{ position:"absolute", bottom:"calc(100% + 6px)", left:0, width:"320px", background:"#0f0f1a", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"12px", boxShadow:"0 16px 48px rgba(0,0,0,0.6)", zIndex:1000, overflow:"hidden" }}>
          <div style={{ padding:"10px 10px 6px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <input ref={searchR} type="text" placeholder="Search models…" value={search} onChange={e=>setSearch(e.target.value)}
              style={{ width:"100%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"7px", padding:"6px 10px", color:"#fff", fontSize:"12px", fontFamily:"Inter,sans-serif", outline:"none", boxSizing:"border-box" }}
              autoComplete="off"
            />
          </div>
          {/* Auto option */}
          <div onClick={() => { onSelect(null); setOpen(false); setSearch(""); }}
            style={{ padding:"9px 12px", cursor:"pointer", fontSize:"12px", color:selectedId===null?"#a78bfa":"rgba(255,255,255,0.6)", background:selectedId===null?"rgba(139,92,246,0.1)":"transparent", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", gap:"7px" }}>
            <span style={{ fontSize:"14px" }}>⚡</span>
            <div>
              <div style={{ fontWeight:600, color:selectedId===null?"#a78bfa":"#fff", fontSize:"12px" }}>Auto — Smart Failover</div>
              <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)" }}>Tries all providers in priority order</div>
            </div>
          </div>
          <div style={{ maxHeight:"260px", overflowY:"auto" }}>
            {filt.length === 0 && <div style={{ padding:"16px", textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:"12px" }}>No results for "{search}"</div>}
            {filt.map(m => {
              const isActive = selectedId===m.id || selectedId===m.providerId;
              const c = dot(m);
              return (
                <div key={m.id} onClick={() => { if (!m.available) return; onSelect(m.providerId); setOpen(false); setSearch(""); }}
                  style={{ padding:"9px 12px", cursor:m.available?"pointer":"not-allowed", opacity:m.available?1:0.45, background:isActive?"rgba(139,92,246,0.1)":"transparent", display:"flex", alignItems:"center", gap:"9px" }}>
                  <span style={{ width:"7px", height:"7px", borderRadius:"50%", backgroundColor:c, boxShadow:`0 0 4px ${c}`, flexShrink:0 }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:"12px", color:isActive?"#a78bfa":"#fff" }}>{m.name}</div>
                    <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.model}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:"10px", color:c, fontWeight:500 }}>{stxt(m)}</div>
                    <div style={{ fontSize:"9px", color:"rgba(255,255,255,0.2)" }}>{m.requestsToday}/{m.maxPerDay}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ padding:"6px 12px", borderTop:"1px solid rgba(255,255,255,0.06)", fontSize:"10px", color:"rgba(255,255,255,0.2)", display:"flex", justifyContent:"space-between" }}>
            <span>{models.filter(m=>m.available).length}/{models.length} available</span>
            <span>Manage in AI Providers</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Chat History Sidebar ──────────────────────────────────────────
function HistorySidebar({ userId, currentSessionId, onSelectSession, onNewChat, open, onClose }) {
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [delId,    setDelId]    = useState(null);

  useEffect(() => {
    if (!userId || !open) return;
    setLoading(true);
    loadChatSessions(userId).then(({ data }) => {
      setSessions(data || []);
      setLoading(false);
    });
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
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:998 }} />
      <div style={{ position:"fixed", top:0, left:"232px", bottom:0, width:"260px", background:"#0d0d18", borderRight:"1px solid rgba(255,255,255,0.08)", zIndex:999, display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"16px 14px 12px", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"13px", color:"#fff" }}>Chat History</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:"18px", cursor:"pointer", lineHeight:1, padding:"0 4px" }}>×</button>
        </div>
        <div style={{ padding:"10px" }}>
          <button onClick={() => { onNewChat(); onClose(); }} style={{ width:"100%", background:"linear-gradient(135deg,#8b5cf6,#3b82f6)", border:"none", borderRadius:"9px", color:"#fff", fontSize:"12px", fontWeight:600, padding:"8px", cursor:"pointer", fontFamily:"Inter,sans-serif" }}>
            + New Chat
          </button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"0 10px 10px" }}>
          {loading && <div style={{ textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:"12px", padding:"20px 0" }}>Loading…</div>}
          {!loading && sessions.length === 0 && (
            <div style={{ textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:"12px", padding:"20px 0" }}>No past chats yet</div>
          )}
          {sessions.map(s => (
            <div key={s.session_id} onClick={() => { onSelectSession(s.session_id); onClose(); }}
              style={{ padding:"10px 10px", borderRadius:"9px", cursor:"pointer", marginBottom:"4px", background: currentSessionId===s.session_id ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.02)", border:`1px solid ${currentSessionId===s.session_id?"rgba(139,92,246,0.3)":"rgba(255,255,255,0.06)"}`, transition:"all 0.15s", display:"flex", gap:"8px", alignItems:"flex-start" }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:"12px", color:"#fff", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:"2px" }}>
                  {s.content?.slice(0,50) || "Chat session"}
                </div>
                <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)" }}>
                  {new Date(s.created_at).toLocaleDateString([], { month:"short", day:"numeric" })}
                </div>
              </div>
              <button onClick={e => handleDelete(s.session_id, e)}
                style={{ background:"none", border:"none", color: delId===s.session_id?"#ef4444":"rgba(255,255,255,0.2)", fontSize:"14px", cursor:"pointer", padding:"0", flexShrink:0, transition:"color 0.15s" }}
                title={delId===s.session_id?"Click again to confirm delete":"Delete"}>
                {delId===s.session_id?"⚠":"×"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Message Bubble ────────────────────────────────────────────────
function Bubble({ msg, onEdit, onRefine, onCopy, rated, onRate, isRefining }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";
  const isAI   = msg.role === "ai";

  function copy() {
    navigator.clipboard.writeText(msg.text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
    onCopy?.(msg);
  }

  return (
    <div className={`chat-bubble ${isUser?"bubble-user":"bubble-ai"}${msg.isRefined?" refined":""}`}>
      {isAI && (
        <div className="bubble-header">
          <div className="bubble-avatar">M</div>
          <span className="bubble-name">Mindoo</span>
          <span className="bubble-time">{msg.time}</span>
          {msg.provider && !msg.failed && <span className="bubble-provider">via {msg.provider}</span>}
          {msg.isRefined && <span className="bubble-refined-badge">✦ Refined</span>}
        </div>
      )}

      <div className="bubble-text" style={{ fontSize:"14px", lineHeight:1.78 }}>
        {isAI ? renderMarkdown(msg.text) : msg.text}
      </div>

      {/* Refine in progress indicator */}
      {isAI && msg.id && isRefining && (
        <div className="refine-progress">
          <div className="refine-spinner" />
          <span>Crafting a deeper, more comprehensive version…</span>
        </div>
      )}

      {/* Action bar */}
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

// ── REFINE SYSTEM PROMPT ──────────────────────────────────────────
function buildRefinePrompt(originalResponse, conversationHistory, engineId, firstName) {
  return `You previously gave this response:

"${originalResponse}"

The user has requested a REFINED version. This is your opportunity to produce the absolute best possible version of this response.

The refined version must be:
1. DRAMATICALLY MORE COMPREHENSIVE — cover every relevant angle, sub-topic, and implication
2. MORE LOGICALLY STRUCTURED — clear sections with headers where appropriate, numbered steps where sequential, bullets where listing
3. DEEPER IN INSIGHT — go beyond the surface. Find the non-obvious. Name what hasn't been named.
4. RICHER IN SCIENCE — cite more research, principles, and frameworks with their authors
5. MORE ACTIONABLE — end with a complete, prioritised action plan (not just one step)
6. MORE PERSONALISED — use more of ${firstName}'s context and history from this conversation
7. BETTER WRITTEN — every sentence more precise, more powerful, more worth reading
8. SYNTHESISED with the full conversation — reference the thread of what has been discussed

Do NOT simply repeat the original with minor edits. This should be visibly, substantially better in every dimension.

Full conversation context for synthesis:
${conversationHistory.slice(-10).map(m => `${m.role.toUpperCase()}: ${m.content.slice(0,500)}`).join("\n\n")}

Now produce the definitive, refined version:`;
}

// ═══════════════════════════════════════════════════════════════
// MAIN CHATPANEL
// ═══════════════════════════════════════════════════════════════
export function ChatPanel({ firstName, user }) {
  const userId    = user?.id;
  const sessionRef = useRef(newSessionId());

  const [messages,      setMessages]      = useState(() => [{
    role:"ai", id:null, provider:null, failed:false, time:nowTime(), isRefined:false,
    text:`Welcome back, ${firstName||"Boss"}.\n\nI'm Mindoo — your personal AI intelligence system. I give comprehensive, science-based, deeply personalised responses.\n\nTell me what's on your mind, or select an engine and model below.`,
  }]);

  const [activeEngine,   setActiveEngine]   = useState(null);
  const [selectedModel,  setSelectedModel]  = useState(null);
  const [isTyping,       setIsTyping]       = useState(false);
  const [refiningId,     setRefiningId]     = useState(null);
  const [rated,          setRated]          = useState({});
  const [editingMsg,     setEditingMsg]     = useState(null);
  const [showHistory,    setShowHistory]    = useState(false);

  const inputRef  = useRef(null);
  const scrollRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  // Populate input when editing
  useEffect(() => {
    if (editingMsg && inputRef.current) {
      inputRef.current.value = editingMsg.originalText;
      inputRef.current.focus();
    }
  }, [editingMsg]);

  // Load a previous session
  async function loadSession(sessionId) {
    const { data } = await loadChatHistory(userId, sessionId);
    if (!data?.length) return;
    sessionRef.current = sessionId;
    const loaded = data.map(m => ({
      role:       m.role === "assistant" ? "ai" : "user",
      text:       m.content,
      id:         m.id,
      time:       new Date(m.created_at).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }),
      provider:   m.provider_id || null,
      isRefined:  m.is_refined || false,
      failed:     false,
    }));
    setMessages(loaded);
    setRated({});
  }

  function startNewChat() {
    sessionRef.current = newSessionId();
    setMessages([{
      role:"ai", id:null, provider:null, failed:false, time:nowTime(), isRefined:false,
      text:`Fresh start. What's on your mind, ${firstName||"Boss"}?`,
    }]);
    setRated({});
    setEditingMsg(null);
    setActiveEngine(null);
  }

  // ── Core send ──────────────────────────────────────────────────
  const send = useCallback(async (overrideText=null, refineTarget=null) => {
    const raw = overrideText ?? inputRef.current?.value?.trim();
    if (!raw && !refineTarget) return;
    if (isTyping) return;
    if (!overrideText && !refineTarget) inputRef.current.value = "";

    // Handle edit — remove messages from edit point onwards
    let base = messages;
    if (editingMsg) {
      const idx = messages.findIndex(m => m.id === editingMsg.id);
      if (idx !== -1) base = messages.slice(0, idx);
      setEditingMsg(null);
    }

    // Add user message (unless silent refine)
    let next = base;
    let userMsgId = null;
    if (!refineTarget) {
      const userMsg = { role:"user", text:raw, time:nowTime(), id:uid(), provider:null, isRefined:false, failed:false };
      next = [...base, userMsg];
      setMessages(next);
      userMsgId = userMsg.id;
      // Save to DB
      if (userId) {
        saveChatMessage({ userId, sessionId:sessionRef.current, role:"user", content:raw, engineId:activeEngine||"", providerId:"", model:"" });
      }
    }

    if (refineTarget) setRefiningId(refineTarget.id);
    else setIsTyping(true);

    try {
      // Build history for API
      const history = next
        .filter(m => m.role==="user"||m.role==="ai")
        .map(m => ({ role:m.role==="user"?"user":"assistant", content:m.text }));

      let systemPrompt;
      let userContent;

      if (refineTarget) {
        systemPrompt = buildSystemPrompt(activeEngine, firstName);
        userContent  = buildRefinePrompt(refineTarget.text, history, activeEngine, firstName);
        history.push({ role:"user", content:userContent });
      } else {
        systemPrompt = buildSystemPrompt(activeEngine, firstName);
      }

      const result = await callAI({
        messages:            history,
        systemPrompt,
        maxTokens:           refineTarget ? 3000 : 2000,
        userId,
        preferredProviderId: selectedModel || undefined,
      });

      const aiMsg = {
        role:"ai", text:result.text, time:nowTime(),
        id:uid(), provider:result.providerName, model:result.model,
        failed:result.failed||false, isRefined:!!refineTarget,
      };

      if (refineTarget) {
        setMessages(prev => prev.map(m => m.id===refineTarget.id ? { ...aiMsg, id:refineTarget.id } : m));
      } else {
        setMessages(prev => [...prev, aiMsg]);
      }

      // Save AI message to DB
      if (userId && !result.failed) {
        saveChatMessage({
          userId, sessionId:sessionRef.current,
          role:"assistant", content:result.text,
          engineId:activeEngine||"", providerId:result.provider||"",
          model:result.model||"", isRefined:!!refineTarget,
        });
      }

    } catch {
      const errMsg = { role:"ai", text:"Something went wrong. Please try again.", time:nowTime(), id:null, provider:null, failed:true, isRefined:false };
      if (refineTarget) {
        setMessages(prev => prev.map(m => m.id===refineTarget.id ? { ...m, ...errMsg, id:refineTarget.id } : m));
      } else {
        setMessages(prev => [...prev, errMsg]);
      }
    } finally {
      setIsTyping(false);
      setRefiningId(null);
    }
  }, [messages, isTyping, activeEngine, firstName, userId, selectedModel, editingMsg]);

  function handleKeyDown(e) {
    if (e.key==="Enter"&&!e.shiftKey) { e.preventDefault(); send(); }
    if (e.key==="Escape"&&editingMsg) { setEditingMsg(null); if (inputRef.current) inputRef.current.value=""; }
  }

  function handleRate(msgId, rating) {
    setRated(prev => ({ ...prev, [msgId]:rating }));
  }

  return (
    <div className="chat-panel">
      {/* History sidebar */}
      <HistorySidebar
        userId={userId}
        currentSessionId={sessionRef.current}
        onSelectSession={loadSession}
        onNewChat={startNewChat}
        open={showHistory}
        onClose={() => setShowHistory(false)}
      />

      {/* Messages */}
      <div className="chat-messages" ref={scrollRef}>
        {messages.map((msg, i) => (
          <Bubble
            key={msg.id || i}
            msg={msg}
            onEdit={m => setEditingMsg({ id:m.id, originalText:m.text })}
            onRefine={m => send(null, m)}
            onCopy={() => {}}
            rated={rated}
            onRate={handleRate}
            isRefining={refiningId === msg.id}
          />
        ))}
        {isTyping && (
          <div className="chat-bubble bubble-ai">
            <div className="bubble-header">
              <div className="bubble-avatar">M</div>
              <span className="bubble-name">Mindoo</span>
              <span className="bubble-time" style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)" }}>thinking…</span>
            </div>
            <div className="typing-dots"><span/><span/><span/></div>
          </div>
        )}
      </div>

      {/* Edit banner */}
      {editingMsg && (
        <div className="edit-banner">
          <span>✏️ Editing — Enter to resend · Escape to cancel</span>
          <button onClick={() => { setEditingMsg(null); if (inputRef.current) inputRef.current.value=""; }} style={{ background:"none", border:"none", color:"#a78bfa", cursor:"pointer", fontSize:"12px" }}>Cancel</button>
        </div>
      )}

      {/* Input area */}
      <div className="chat-input-area">
        <div className="engine-section">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"8px", gap:"8px", flexWrap:"wrap" }}>
            <p className="engine-label" style={{ margin:0 }}>Engines</p>
            <div style={{ display:"flex", alignItems:"center", gap:"7px", flexWrap:"wrap" }}>
              <ProviderBar userId={userId} />
              <ModelSelector userId={userId} selectedId={selectedModel} onSelect={setSelectedModel} />
              <button onClick={() => setShowHistory(true)} title="Chat history" style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", color:"rgba(255,255,255,0.5)", fontSize:"11px", padding:"4px 10px", cursor:"pointer", fontFamily:"Inter,sans-serif", whiteSpace:"nowrap" }}>
                📋 History
              </button>
              <button onClick={startNewChat} title="New chat" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"8px", color:"rgba(255,255,255,0.35)", fontSize:"11px", padding:"4px 10px", cursor:"pointer", fontFamily:"Inter,sans-serif", whiteSpace:"nowrap" }}>
                + New
              </button>
            </div>
          </div>
          <div className="engine-row">
            {ENGINES.map(e => (
              <button key={e.id} className={`engine-pill${activeEngine===e.id?" active":""}`}
                style={{ "--engine-color":e.color }} title={e.tip}
                onClick={() => setActiveEngine(activeEngine===e.id?null:e.id)}>
                {e.id}: {e.label}
              </button>
            ))}
          </div>
        </div>

        <div className="chat-input-row">
          <textarea ref={inputRef} className={`chat-textarea${editingMsg?" editing":""}`} rows={1}
            placeholder={editingMsg?"Edit your message… (Enter to resend, Escape to cancel)":"What's on your mind? Just talk… (Enter to send, Shift+Enter for new line)"}
            onKeyDown={handleKeyDown}
          />
          <button className="send-btn" onClick={() => send()} disabled={isTyping||!!refiningId} aria-label="Send">
            {isTyping ? <Spinner size={15}/> : <Icon name="send" size={15} color="#fff"/>}
          </button>
        </div>
      </div>
    </div>
  );
}
