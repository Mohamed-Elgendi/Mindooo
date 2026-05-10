// src/pages/sections/ChatPanel.jsx
// Professional AI chat — searchable model selector, copy, edit, refine, markdown
import { useState, useEffect, useRef, useCallback } from "react";
import { ENGINES, buildSystemPrompt }               from "../../config/modules";
import { Icon, Spinner }                            from "../../components/Icons";
import { callAI, getProviderStatus }                from "../../services/ai";

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function uid() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
}

// ── Markdown renderer ──────────────────────────────────────────────
function inlineRender(text) {
  if (!text) return null;
  const parts = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let last = 0, match;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[0].startsWith("**"))
      parts.push(<strong key={match.index} style={{color:"#fff",fontWeight:600}}>{match[2]}</strong>);
    else if (match[0].startsWith("*"))
      parts.push(<em key={match.index} style={{color:"rgba(255,255,255,0.75)"}}>{match[3]}</em>);
    else
      parts.push(<code key={match.index} style={{background:"rgba(139,92,246,0.15)",border:"1px solid rgba(139,92,246,0.3)",borderRadius:"4px",padding:"1px 5px",fontSize:"12px",fontFamily:"monospace",color:"#a78bfa"}}>{match[4]}</code>);
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : parts;
}

function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split("\n");
  const output = [];
  let i = 0, listBuf = [], listType = null;

  function flushList() {
    if (!listBuf.length) return;
    const items = listBuf.map((item,idx) => <li key={idx} style={{marginBottom:"4px",lineHeight:1.7}}>{inlineRender(item)}</li>);
    output.push(listType === "ol"
      ? <ol key={`ol${i}`} style={{paddingLeft:"20px",margin:"8px 0"}}>{items}</ol>
      : <ul key={`ul${i}`} style={{paddingLeft:"20px",margin:"8px 0"}}>{items}</ul>);
    listBuf = []; listType = null;
  }

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith("```")) {
      flushList();
      const codeLines = [];
      const lang = line.trim().slice(3).trim();
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) { codeLines.push(lines[i]); i++; }
      output.push(<pre key={`code${i}`} style={{background:"rgba(0,0,0,0.35)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"10px",padding:"14px 16px",fontSize:"12px",fontFamily:"monospace",color:"#a78bfa",overflowX:"auto",margin:"10px 0",lineHeight:1.6,whiteSpace:"pre"}}>{lang && <span style={{color:"rgba(255,255,255,0.2)",fontSize:"10px"}}>{lang}{"\n"}</span>}{codeLines.join("\n")}</pre>);
      i++; continue;
    }
    if (line.startsWith("# "))   { flushList(); output.push(<h1 key={`h1${i}`} style={{fontFamily:"Sora,sans-serif",fontWeight:800,fontSize:"18px",color:"#fff",margin:"18px 0 8px"}}>{inlineRender(line.slice(2))}</h1>); i++; continue; }
    if (line.startsWith("## "))  { flushList(); output.push(<h2 key={`h2${i}`} style={{fontFamily:"Sora,sans-serif",fontWeight:700,fontSize:"15px",color:"#e2e8f0",margin:"16px 0 6px"}}>{inlineRender(line.slice(3))}</h2>); i++; continue; }
    if (line.startsWith("### ")) { flushList(); output.push(<h3 key={`h3${i}`} style={{fontFamily:"Sora,sans-serif",fontWeight:600,fontSize:"13px",color:"#a78bfa",margin:"14px 0 4px",textTransform:"uppercase",letterSpacing:"0.06em"}}>{inlineRender(line.slice(4))}</h3>); i++; continue; }
    if (line.trim() === "---")   { flushList(); output.push(<hr key={`hr${i}`} style={{border:"none",borderTop:"1px solid rgba(255,255,255,0.08)",margin:"16px 0"}} />); i++; continue; }
    if (/^[-*•]\s/.test(line.trim())) { if (listType&&listType!=="ul") flushList(); listType="ul"; listBuf.push(line.trim().replace(/^[-*•]\s/,"")); i++; continue; }
    if (/^\d+\.\s/.test(line.trim())) { if (listType&&listType!=="ol") flushList(); listType="ol"; listBuf.push(line.trim().replace(/^\d+\.\s/,"")); i++; continue; }
    if (line.startsWith("> ")) { flushList(); output.push(<blockquote key={`bq${i}`} style={{borderLeft:"3px solid #8b5cf6",paddingLeft:"14px",margin:"10px 0",color:"rgba(255,255,255,0.55)",fontStyle:"italic"}}>{inlineRender(line.slice(2))}</blockquote>); i++; continue; }
    if (line.trim() === "") { flushList(); output.push(<div key={`br${i}`} style={{height:"8px"}} />); i++; continue; }
    flushList();
    output.push(<p key={`p${i}`} style={{margin:"0 0 8px",lineHeight:1.75,color:"rgba(255,255,255,0.88)"}}>{inlineRender(line)}</p>);
    i++;
  }
  flushList();
  return output;
}

// ── Smart Model Selector ───────────────────────────────────────────
function ModelSelector({ userId, selectedId, onSelect }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const [models, setModels] = useState([]);
  const dropRef             = useRef(null);
  const searchRef           = useRef(null);

  useEffect(() => {
    if (!userId) return;
    getProviderStatus(userId).then(d => setModels(d||[]));
  }, [userId]);

  useEffect(() => {
    if (open && userId) {
      getProviderStatus(userId).then(d => setModels(d||[]));
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open, userId]);

  useEffect(() => {
    function h(e) { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); }
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const filtered = models.filter(m =>
    !search ||
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.model.toLowerCase().includes(search.toLowerCase()) ||
    (m.company||"").toLowerCase().includes(search.toLowerCase())
  );

  const selected = models.find(m => m.id === selectedId || m.providerId === selectedId);

  function dot(m) {
    if (!m.isEnabled||!m.hasKey) return "#ef4444";
    if (m.isPaused||m.coolingDown||!m.available) return "#f59e0b";
    return "#22c55e";
  }
  function statusTxt(m) {
    if (!m.isEnabled) return "disabled";
    if (!m.hasKey)    return "no key";
    if (m.isPaused)   return "paused";
    if (m.coolingDown) return `cooldown ${m.cooldownSecsLeft}s`;
    if (!m.available) return "unavailable";
    if (m.quotaPercent > 80) return `${m.quotaPercent}% quota`;
    return "ready";
  }

  const triggerStyle = {
    display:"flex",alignItems:"center",gap:"7px",
    background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",
    borderRadius:"10px",padding:"6px 12px",color:"#fff",fontSize:"12px",
    cursor:"pointer",fontFamily:"Inter,sans-serif",whiteSpace:"nowrap",
  };

  return (
    <div ref={dropRef} style={{position:"relative"}}>
      <button onClick={() => setOpen(o => !o)} style={triggerStyle}>
        {selected ? (
          <>
            <span style={{width:"6px",height:"6px",borderRadius:"50%",backgroundColor:dot(selected),flexShrink:0}} />
            <span style={{color:"rgba(255,255,255,0.7)"}}>{selected.name}</span>
            <span style={{color:"rgba(255,255,255,0.3)",fontSize:"10px"}}>{selected.model.split("/").pop()}</span>
          </>
        ) : (
          <span style={{color:"rgba(255,255,255,0.4)"}}>⚡ Auto failover</span>
        )}
        <span style={{color:"rgba(255,255,255,0.3)"}}>▾</span>
      </button>

      {open && (
        <div style={{position:"absolute",bottom:"calc(100% + 8px)",left:0,width:"360px",background:"#0f0f1a",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"14px",boxShadow:"0 20px 60px rgba(0,0,0,0.6)",zIndex:1000,overflow:"hidden"}}>
          {/* Search */}
          <div style={{padding:"12px 12px 8px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
            <input ref={searchRef} type="text" placeholder="Search models, providers…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",padding:"7px 12px",color:"#fff",fontSize:"12px",fontFamily:"Inter,sans-serif",outline:"none",boxSizing:"border-box"}}
            />
          </div>

          {/* Auto option */}
          <div onClick={() => { onSelect(null); setOpen(false); setSearch(""); }}
            style={{padding:"10px 14px",cursor:"pointer",fontSize:"12px",color:selectedId===null?"#a78bfa":"rgba(255,255,255,0.6)",background:selectedId===null?"rgba(139,92,246,0.1)":"transparent",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",gap:"8px"}}>
            <span style={{fontSize:"16px"}}>⚡</span>
            <div>
              <div style={{fontWeight:600,color:selectedId===null?"#a78bfa":"#fff"}}>Auto — Smart Failover</div>
              <div style={{fontSize:"10px",color:"rgba(255,255,255,0.3)",marginTop:"1px"}}>Tries all providers in priority order</div>
            </div>
          </div>

          {/* List */}
          <div style={{maxHeight:"320px",overflowY:"auto"}}>
            {filtered.length === 0 && (
              <div style={{padding:"20px",textAlign:"center",color:"rgba(255,255,255,0.3)",fontSize:"12px"}}>No models match "{search}"</div>
            )}
            {filtered.map(m => {
              const isActive = selectedId === m.id || selectedId === m.providerId;
              const c = dot(m);
              return (
                <div key={m.id}
                  onClick={() => { if (!m.available) return; onSelect(m.providerId); setOpen(false); setSearch(""); }}
                  style={{padding:"10px 14px",cursor:m.available?"pointer":"not-allowed",opacity:m.available?1:0.45,background:isActive?"rgba(139,92,246,0.1)":"transparent",display:"flex",alignItems:"center",gap:"10px"}}>
                  <span style={{width:"8px",height:"8px",borderRadius:"50%",backgroundColor:c,boxShadow:`0 0 5px ${c}`,flexShrink:0}} />
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                      <span style={{fontWeight:600,fontSize:"13px",color:isActive?"#a78bfa":"#fff"}}>{m.name}</span>
                      {(m.notes||"").toLowerCase().includes("free") && (
                        <span style={{fontSize:"9px",background:"rgba(34,197,94,0.15)",color:"#22c55e",border:"1px solid rgba(34,197,94,0.3)",borderRadius:"4px",padding:"1px 5px",fontWeight:600}}>FREE</span>
                      )}
                    </div>
                    <div style={{fontSize:"10px",color:"rgba(255,255,255,0.3)",marginTop:"2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.model}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:"10px",color:c,fontWeight:500}}>{statusTxt(m)}</div>
                    {m.requestsToday > 0 && <div style={{fontSize:"9px",color:"rgba(255,255,255,0.2)",marginTop:"2px"}}>{m.requestsToday}/{m.maxPerDay} today</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{padding:"8px 14px",borderTop:"1px solid rgba(255,255,255,0.06)",fontSize:"10px",color:"rgba(255,255,255,0.2)",display:"flex",justifyContent:"space-between"}}>
            <span>{models.filter(m=>m.available).length}/{models.length} available</span>
            <span>Manage in AI Providers settings</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Action button ──────────────────────────────────────────────────
function Btn({ onClick, children, purple }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{background:h?(purple?"rgba(139,92,246,0.2)":"rgba(255,255,255,0.08)"):(purple?"rgba(139,92,246,0.1)":"rgba(255,255,255,0.04)"),border:`1px solid ${purple?"rgba(139,92,246,0.3)":"rgba(255,255,255,0.08)"}`,borderRadius:"6px",color:h?(purple?"#a78bfa":"rgba(255,255,255,0.8)"):(purple?"#8b5cf6":"rgba(255,255,255,0.4)"),fontSize:"11px",padding:"3px 9px",cursor:"pointer",fontFamily:"Inter,sans-serif",transition:"all 0.15s"}}>
      {children}
    </button>
  );
}

// ── Message bubble ─────────────────────────────────────────────────
function Bubble({ msg, onEdit, onRefine, rated, onRate }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";
  const isAI   = msg.role === "ai";

  function copy() {
    navigator.clipboard.writeText(msg.text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  }

  return (
    <div className={`chat-bubble ${isUser ? "bubble-user" : "bubble-ai"}`}>
      {isAI && (
        <div className="bubble-header">
          <div className="bubble-avatar">M</div>
          <span className="bubble-name">Mindoo</span>
          <span className="bubble-time">{msg.time}</span>
          {msg.provider && !msg.failed && (
            <span style={{fontSize:"10px",color:"rgba(255,255,255,0.2)",marginLeft:"4px"}}>via {msg.provider}</span>
          )}
        </div>
      )}

      <div className="bubble-text" style={{fontSize:"14px",lineHeight:1.75}}>
        {isAI ? renderMarkdown(msg.text) : msg.text}
      </div>

      {/* Action bar */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:"10px",gap:"6px",flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:"6px"}}>
          <Btn onClick={copy}>{copied ? "✓ Copied" : "Copy"}</Btn>
          {isUser && <Btn onClick={() => onEdit(msg)}>Edit</Btn>}
          {isAI && msg.id && !msg.failed && <Btn onClick={() => onRefine(msg)} purple>✦ Refine</Btn>}
        </div>

        {isAI && msg.id && (
          <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
            {rated[msg.id] ? (
              <span style={{fontSize:"11px",color:"rgba(255,255,255,0.25)"}}>Thanks ✓</span>
            ) : (
              ["👍","👎"].map((emoji, ri) => (
                <button key={ri} onClick={() => onRate(msg.id, ri===0?"positive":"negative")}
                  style={{background:"none",border:"none",cursor:"pointer",fontSize:"14px",padding:"0",opacity:0.4,transition:"opacity 0.15s"}}
                  onMouseEnter={e => e.currentTarget.style.opacity=1}
                  onMouseLeave={e => e.currentTarget.style.opacity=0.4}>
                  {emoji}
                </button>
              ))
            )}
          </div>
        )}

        {isUser && <span style={{fontSize:"10px",color:"rgba(255,255,255,0.2)"}}>{msg.time}</span>}
      </div>
    </div>
  );
}

// ── Main ChatPanel ─────────────────────────────────────────────────
export function ChatPanel({ firstName, user }) {
  const userId = user?.id;

  const [messages,     setMessages]     = useState(() => [{
    role:"ai", id:null, provider:null, failed:false, time:nowTime(),
    text:`Welcome back, ${firstName||"Boss"}.\n\nI'm Mindoo — your personal AI intelligence system. I give comprehensive, science-based, deeply personalised responses — not one-liners.\n\nTell me what's on your mind, or select an engine below to activate a specific thinking mode.`,
  }]);

  const [activeEngine,  setActiveEngine]  = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [isTyping,      setIsTyping]      = useState(false);
  const [rated,         setRated]         = useState({});
  const [editingMsg,    setEditingMsg]     = useState(null);

  const inputRef  = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    if (editingMsg && inputRef.current) {
      inputRef.current.value = editingMsg.originalText;
      inputRef.current.focus();
    }
  }, [editingMsg]);

  const send = useCallback(async (overrideText=null, refineTarget=null) => {
    const raw = overrideText ?? inputRef.current?.value?.trim();
    if (!raw || isTyping) return;
    if (!overrideText) inputRef.current.value = "";

    let base = messages;
    if (editingMsg) {
      const idx = messages.findIndex(m => m.id === editingMsg.id);
      if (idx !== -1) base = messages.slice(0, idx);
      setEditingMsg(null);
    }

    let next = base;
    if (!refineTarget) {
      const userMsg = { role:"user", text:raw, time:nowTime(), id:uid(), provider:null };
      next = [...base, userMsg];
      setMessages(next);
    }

    setIsTyping(true);

    try {
      const history = next
        .filter(m => m.role==="user"||m.role==="ai")
        .map(m => ({ role: m.role==="user"?"user":"assistant", content: m.text }));

      const effectiveText = refineTarget
        ? `Rewrite and significantly expand your previous response. Make it dramatically more comprehensive, more detailed, more logically structured, and more actionable. Original:\n\n"${refineTarget.text}"\n\nNow produce the complete, definitive version.`
        : raw;

      if (refineTarget) history.push({ role:"user", content:effectiveText });

      const result = await callAI({
        messages:            history,
        systemPrompt:        buildSystemPrompt(activeEngine, firstName),
        maxTokens:           2000,
        userId,
        preferredProviderId: selectedModel || undefined,
      });

      const aiMsg = {
        role:"ai", text:result.text, time:nowTime(),
        id:uid(), provider:result.providerName, model:result.model,
        failed:result.failed||false,
      };

      if (refineTarget) {
        setMessages(prev => prev.map(m => m.id===refineTarget.id ? {...aiMsg, id:refineTarget.id} : m));
      } else {
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch {
      setMessages(prev => [...prev, { role:"ai", text:"Something went wrong. Please try again.", time:nowTime(), id:null, provider:null, failed:true }]);
    } finally {
      setIsTyping(false);
    }
  }, [messages, isTyping, activeEngine, firstName, userId, selectedModel, editingMsg]);

  function handleKeyDown(e) {
    if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(); }
    if (e.key==="Escape" && editingMsg) { setEditingMsg(null); if (inputRef.current) inputRef.current.value=""; }
  }

  function handleRate(msgId, rating) {
    setRated(prev => ({...prev, [msgId]:rating}));
  }

  function clearChat() {
    setMessages([{ role:"ai", id:null, provider:null, failed:false, time:nowTime(), text:`Fresh start. What's on your mind, ${firstName||"Boss"}?` }]);
    setRated({});
  }

  return (
    <div className="chat-panel">
      {/* Messages */}
      <div className="chat-messages" ref={scrollRef}>
        {messages.map((msg, i) => (
          <Bubble key={msg.id||i} msg={msg}
            onEdit={m => setEditingMsg({ id:m.id, originalText:m.text })}
            onRefine={m => send(null, m)}
            rated={rated} onRate={handleRate}
          />
        ))}
        {isTyping && (
          <div className="chat-bubble bubble-ai">
            <div className="bubble-header">
              <div className="bubble-avatar">M</div>
              <span className="bubble-name">Mindoo</span>
              <span className="bubble-time" style={{fontSize:"10px",color:"rgba(255,255,255,0.3)"}}>thinking…</span>
            </div>
            <div className="typing-dots"><span/><span/><span/></div>
          </div>
        )}
      </div>

      {/* Edit banner */}
      {editingMsg && (
        <div style={{padding:"8px 16px",background:"rgba(139,92,246,0.1)",borderTop:"1px solid rgba(139,92,246,0.2)",fontSize:"11px",color:"#a78bfa",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span>✏️ Editing — Enter to resend, Escape to cancel</span>
          <button onClick={() => { setEditingMsg(null); if(inputRef.current) inputRef.current.value=""; }} style={{background:"none",border:"none",color:"#a78bfa",cursor:"pointer",fontSize:"12px"}}>Cancel</button>
        </div>
      )}

      {/* Input area */}
      <div className="chat-input-area">
        <div className="engine-section">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px",gap:"8px",flexWrap:"wrap"}}>
            <p className="engine-label" style={{margin:0}}>Engines — activate a thinking mode</p>
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <ModelSelector userId={userId} selectedId={selectedModel} onSelect={setSelectedModel} />
              <button onClick={clearChat} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"8px",color:"rgba(255,255,255,0.35)",fontSize:"11px",padding:"5px 10px",cursor:"pointer",fontFamily:"Inter,sans-serif",whiteSpace:"nowrap"}}>Clear</button>
            </div>
          </div>
          <div className="engine-row">
            {ENGINES.map(e => (
              <button key={e.id} className={`engine-pill${activeEngine===e.id?" active":""}`} style={{"--engine-color":e.color}} title={e.tip} onClick={() => setActiveEngine(activeEngine===e.id?null:e.id)}>
                {e.id}: {e.label}
              </button>
            ))}
          </div>
        </div>
        <div className="chat-input-row">
          <textarea ref={inputRef} className="chat-textarea" rows={1}
            placeholder={editingMsg ? "Edit your message… (Enter to resend, Escape to cancel)" : "What's on your mind? Just talk… (Enter to send, Shift+Enter for new line)"}
            onKeyDown={handleKeyDown}
            style={editingMsg ? {borderColor:"rgba(139,92,246,0.4)"} : {}}
          />
          <button className="send-btn" onClick={() => send()} disabled={isTyping} aria-label="Send">
            {isTyping ? <Spinner size={15}/> : <Icon name="send" size={15} color="#fff"/>}
          </button>
        </div>
      </div>
    </div>
  );
}
