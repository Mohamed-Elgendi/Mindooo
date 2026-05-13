// src/pages/sections/AIProviders.jsx
// Shared provider management — all users see the same providers.
// Admin adds/manages API keys. All users benefit from them.

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getProviderStatus, adminUpdateProvider, adminToggleProvider,
  adminUpdatePriority, adminAddProvider, adminDeleteProvider,
  resetProviderQuota, resetAllQuotas, invalidateProviderCache,
} from "../../services/ai";

// ── Catalogue (for add modal auto-fill) ──────────────────────────
const CAT = [
  { provider_id:"groq",      name:"Groq",             company:"Groq",      logo:"⚡", badge:"FREE", bc:"#22c55e", hint:"Starts with gsk_...",    link:"https://console.groq.com",          base_url:"https://api.groq.com/openai/v1/chat/completions",                                                  model:"llama-3.3-70b-versatile",                api_format:"openai",    priority:1,  rpm:30,  rpd:14400, tok:8000,  crl:62, ce:15, notes:"Free tier — fastest model" },
  { provider_id:"gemini",    name:"Gemini",            company:"Google",    logo:"🌐", badge:"FREE", bc:"#22c55e", hint:"Starts with AIza...",    link:"https://aistudio.google.com",       base_url:"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",      model:"gemini-2.0-flash",                       api_format:"google",    priority:2,  rpm:15,  rpd:1500,  tok:8000,  crl:65, ce:15, notes:"Google Gemini — free tier" },
  { provider_id:"openrouter",name:"OpenRouter",        company:"OpenRouter",logo:"🔀", badge:"FREE", bc:"#22c55e", hint:"Starts with sk-or-...", link:"https://openrouter.ai",              base_url:"https://openrouter.ai/api/v1/chat/completions",                                                    model:"meta-llama/llama-3.3-70b-instruct:free", api_format:"openai",    priority:3,  rpm:20,  rpd:200,   tok:8000,  crl:65, ce:20, notes:"Free — many models" },
  { provider_id:"glm",       name:"GLM (Zhipu)",       company:"Zhipu AI",  logo:"🤖", badge:"FREE", bc:"#22c55e", hint:"Get at bigmodel.cn",     link:"https://bigmodel.cn",               base_url:"https://open.bigmodel.cn/api/paas/v4/chat/completions",                                            model:"glm-4-flash",                            api_format:"openai",    priority:4,  rpm:60,  rpd:1000,  tok:8000,  crl:62, ce:15, notes:"Free flash tier" },
  { provider_id:"deepseek",  name:"DeepSeek",          company:"DeepSeek",  logo:"🔍", badge:"CHEAP",bc:"#60a5fa", hint:"platform.deepseek.com",  link:"https://platform.deepseek.com",     base_url:"https://api.deepseek.com/v1/chat/completions",                                                     model:"deepseek-chat",                          api_format:"openai",    priority:5,  rpm:60,  rpd:1000,  tok:32000, crl:62, ce:15, notes:"Very affordable" },
  { provider_id:"openai",    name:"ChatGPT (GPT-4o)",  company:"OpenAI",    logo:"💬", badge:"PAID", bc:"#a78bfa", hint:"Starts with sk-...",     link:"https://platform.openai.com",       base_url:"https://api.openai.com/v1/chat/completions",                                                       model:"gpt-4o-mini",                            api_format:"openai",    priority:6,  rpm:60,  rpd:1000,  tok:16000, crl:62, ce:15, notes:"GPT-4o-mini affordable" },
  { provider_id:"anthropic", name:"Claude",            company:"Anthropic", logo:"🧠", badge:"PAID", bc:"#a78bfa", hint:"Starts with sk-ant-...", link:"https://console.anthropic.com",     base_url:"https://api.anthropic.com/v1/messages",                                                            model:"claude-haiku-4-5-20251001",              api_format:"anthropic", priority:7,  rpm:60,  rpd:1000,  tok:8000,  crl:62, ce:15, notes:"Needs proxy — CORS blocked" },
  { provider_id:"mistral",   name:"Mistral",           company:"Mistral AI",logo:"💨", badge:"PAID", bc:"#a78bfa", hint:"console.mistral.ai",     link:"https://console.mistral.ai",        base_url:"https://api.mistral.ai/v1/chat/completions",                                                       model:"mistral-small-latest",                   api_format:"openai",    priority:8,  rpm:60,  rpd:1000,  tok:32000, crl:62, ce:15, notes:"European AI" },
  { provider_id:"qwen",      name:"Qwen (Alibaba)",    company:"Alibaba",   logo:"🔮", badge:"PAID", bc:"#a78bfa", hint:"dashscope.aliyun.com",   link:"https://dashscope.aliyun.com",      base_url:"https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",                              model:"qwen-plus",                              api_format:"openai",    priority:9,  rpm:60,  rpd:1000,  tok:30000, crl:62, ce:15, notes:"Multilingual" },
];

// ── Static styles (module-level = no re-render on keystroke) ─────
const card  = { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"14px", padding:"16px 18px", marginBottom:"10px" };
const inp   = { width:"100%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"10px", padding:"9px 13px", color:"#fff", fontSize:"13px", fontFamily:"Inter,sans-serif", outline:"none", boxSizing:"border-box" };
const btnP  = { background:"linear-gradient(135deg,#8b5cf6,#3b82f6)", border:"none", borderRadius:"9px", color:"#fff", fontSize:"13px", fontWeight:600, padding:"9px 20px", cursor:"pointer", fontFamily:"Inter,sans-serif", whiteSpace:"nowrap" };
const btnG  = { background:"none", border:"1px solid rgba(255,255,255,0.14)", borderRadius:"8px", color:"rgba(255,255,255,0.6)", fontSize:"12px", padding:"5px 12px", cursor:"pointer", fontFamily:"Inter,sans-serif", whiteSpace:"nowrap" };
const btnD  = { background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"8px", color:"#ef4444", fontSize:"12px", padding:"5px 12px", cursor:"pointer", fontFamily:"Inter,sans-serif", whiteSpace:"nowrap" };
const lbl   = { fontSize:"10px", color:"rgba(255,255,255,0.35)", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:"4px", display:"block" };

function dotColor(p) {
  if (!p.isEnabled)  return "#6b7280";
  if (p.isPaused)    return "#f59e0b";
  if (!p.hasKey)     return "#ef4444";
  if (p.coolingDown) return "#f59e0b";
  if (!p.available)  return "#f59e0b";
  if (p.quotaPercent > 80) return "#f59e0b";
  return "#22c55e";
}
function statusLbl(p) {
  if (!p.isEnabled)  return "Disabled";
  if (p.isPaused)    return "Paused";
  if (!p.hasKey)     return "No key";
  if (p.coolingDown) return `Cooldown ${p.cooldownSecsLeft}s`;
  if (!p.available)  return p.unavailableReason || "Unavailable";
  if (p.quotaPercent > 80) return `${p.quotaPercent}% quota`;
  return "Active";
}
function getCat(pid) { return CAT.find(c => c.provider_id === pid); }

// ── Add Provider Modal ────────────────────────────────────────────
function AddModal({ existingIds, onSave, onClose }) {
  const [sel,    setSel]    = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");
  const [custom, setCustom] = useState(false);
  const [cf, setCf] = useState({ provider_id:"", name:"", company:"", base_url:"", model:"", api_format:"openai", api_key:"", priority:20, max_requests_per_minute:30, max_requests_per_day:1000, max_tokens_per_request:4000, cooldown_on_rate_limit:62, cooldown_on_error:15, notes:"" });
  const keyRef = useRef(null);
  const avail = CAT.filter(c => !existingIds.includes(c.provider_id));

  function pick(cat) { setSel(cat); setApiKey(""); setErr(""); setTimeout(() => keyRef.current?.focus(), 80); }

  async function save() {
    if (!sel) { setErr("Pick a provider first."); return; }
    if (!apiKey.trim()) { setErr("Paste your API key."); return; }
    setSaving(true); setErr("");
    const { error } = await adminAddProvider({
      provider_id: sel.provider_id, name: sel.name, company: sel.company,
      api_key: apiKey.trim(), base_url: sel.base_url, model: sel.model,
      api_format: sel.api_format, priority: sel.priority,
      max_requests_per_minute: sel.rpm, max_requests_per_day: sel.rpd,
      max_tokens_per_request: sel.tok, cooldown_on_rate_limit: sel.crl,
      cooldown_on_error: sel.ce, notes: sel.notes,
      is_enabled: true, is_paused: false,
    });
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onSave(); onClose();
  }

  async function saveCustom() {
    if (!cf.provider_id || !cf.name || !cf.base_url || !cf.model) { setErr("ID, name, URL, and model required."); return; }
    setSaving(true);
    const { error } = await adminAddProvider({ ...cf, is_enabled: true, is_paused: false });
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onSave(); onClose();
  }

  function sc(k, v) { setCf(f => ({ ...f, [k]: v })); }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, padding:"16px" }}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#0f0f1a", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"18px", padding:"24px", width:"100%", maxWidth:"540px", maxHeight:"88vh", overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"18px" }}>
          <div>
            <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"17px", color:"#fff" }}>Add AI Provider</div>
            <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)", marginTop:"2px" }}>Pick a provider — paste API key — done</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:"22px", cursor:"pointer", lineHeight:1 }}>×</button>
        </div>

        {!custom ? (<>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"16px" }}>
            {avail.map(c => (
              <div key={c.provider_id} onClick={() => pick(c)}
                style={{ background:sel?.provider_id===c.provider_id?"rgba(139,92,246,0.15)":"rgba(255,255,255,0.03)", border:`1px solid ${sel?.provider_id===c.provider_id?"rgba(139,92,246,0.5)":"rgba(255,255,255,0.08)"}`, borderRadius:"10px", padding:"10px 12px", cursor:"pointer" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"3px" }}>
                  <span style={{ fontSize:"16px" }}>{c.logo}</span>
                  <span style={{ fontWeight:600, fontSize:"13px", color:"#fff" }}>{c.name}</span>
                  <span style={{ fontSize:"9px", background:`${c.bc}22`, color:c.bc, border:`1px solid ${c.bc}44`, borderRadius:"4px", padding:"1px 5px", marginLeft:"auto", fontWeight:700 }}>{c.badge}</span>
                </div>
                <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)" }}>{c.hint}</div>
              </div>
            ))}
            {avail.length === 0 && <div style={{ gridColumn:"1/-1", textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:"13px", padding:"16px" }}>All known providers added.</div>}
          </div>

          {sel && (<>
            <div style={{ marginBottom:"14px" }}>
              <label style={lbl}>API Key for {sel.name}</label>
              <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", marginBottom:"6px" }}>{sel.hint} — <a href={sel.link} target="_blank" rel="noopener noreferrer" style={{ color:"#a78bfa", textDecoration:"none" }}>Get it here →</a></div>
              <input ref={keyRef} type="password" style={inp} placeholder="Paste API key…" value={apiKey} onChange={e => { setApiKey(e.target.value); setErr(""); }} onKeyDown={e => e.key==="Enter" && save()} autoComplete="off" />
              {sel.provider_id === "anthropic" && <div style={{ fontSize:"11px", color:"#f59e0b", marginTop:"7px", background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:"8px", padding:"8px 12px" }}>⚠️ Claude blocks browser calls. Key will be saved but needs a server proxy to work.</div>}
            </div>
          </>)}

          {err && <div style={{ color:"#ef4444", fontSize:"12px", marginBottom:"10px" }}>{err}</div>}
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", alignItems:"center" }}>
            {sel && <button style={btnP} onClick={save} disabled={saving||!apiKey.trim()}>{saving?"Saving…":`Add ${sel.name}`}</button>}
            <button style={btnG} onClick={onClose}>Cancel</button>
            <button style={{ ...btnG, marginLeft:"auto", fontSize:"11px" }} onClick={() => { setCustom(true); setErr(""); }}>+ Custom</button>
          </div>
        </>) : (<>
          <button onClick={() => setCustom(false)} style={{ background:"none", border:"none", color:"#a78bfa", cursor:"pointer", fontSize:"13px", marginBottom:"14px", display:"block", padding:0 }}>← Back</button>
          {[["Provider ID (unique)", "provider_id", "e.g. my_ai"],["Display Name","name","e.g. My AI"],["API Endpoint URL","base_url","https://api.example.com/v1/chat/completions"],["Model Name","model","e.g. llama-3-70b"]].map(([l,k,ph]) => (
            <div key={k} style={{ marginBottom:"10px" }}>
              <label style={lbl}>{l}</label>
              <input type="text" style={inp} placeholder={ph} value={cf[k]} onChange={e => sc(k, e.target.value)} autoComplete="off" />
            </div>
          ))}
          <div style={{ marginBottom:"10px" }}>
            <label style={lbl}>API Format</label>
            <select style={{ ...inp, cursor:"pointer" }} value={cf.api_format} onChange={e => sc("api_format", e.target.value)}>
              <option value="openai">OpenAI-compatible (most providers)</option>
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="google">Google (Gemini)</option>
            </select>
          </div>
          <div style={{ marginBottom:"14px" }}>
            <label style={lbl}>API Key</label>
            <input type="password" style={inp} placeholder="Paste key…" value={cf.api_key} onChange={e => sc("api_key", e.target.value)} autoComplete="off" />
          </div>
          {err && <div style={{ color:"#ef4444", fontSize:"12px", marginBottom:"10px" }}>{err}</div>}
          <div style={{ display:"flex", gap:"8px" }}>
            <button style={btnP} onClick={saveCustom} disabled={saving}>{saving?"Adding…":"Add Provider"}</button>
            <button style={btnG} onClick={() => setCustom(false)}>Cancel</button>
          </div>
        </>)}
      </div>
    </div>
  );
}

// ── Provider Card ─────────────────────────────────────────────────
function ProvCard({ p, userId, onRefresh }) {
  const [editing,  setEditing]  = useState(false);
  const [keyVal,   setKeyVal]   = useState("");
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState("");
  const [confirm,  setConfirm]  = useState(false);
  const keyRef = useRef(null);
  const cat    = getCat(p.providerId);
  const color  = dotColor(p);

  function startEdit() { setEditing(true); setKeyVal(""); setTimeout(() => keyRef.current?.focus(), 80); }

  async function saveKey() {
    if (!keyVal.trim()) return;
    setSaving(true);
    const { error } = await adminUpdateProvider(p.providerId, { api_key: keyVal.trim() });
    setSaving(false);
    if (error) { setMsg("Failed"); return; }
    setMsg("Saved ✓"); setEditing(false); setKeyVal("");
    setTimeout(() => { setMsg(""); onRefresh(); }, 1500);
    invalidateProviderCache(); onRefresh();
  }

  async function tog(field, val) { await adminToggleProvider(p.providerId, field, val); invalidateProviderCache(); onRefresh(); }
  async function movePri(d)      { await adminUpdatePriority(p.providerId, Math.max(1, p.priority + d)); invalidateProviderCache(); onRefresh(); }
  async function del()           { await adminDeleteProvider(p.providerId); invalidateProviderCache(); onRefresh(); }
  function reset()               { resetProviderQuota(userId, p.providerId); setMsg("Reset ✓"); setTimeout(() => { setMsg(""); onRefresh(); }, 800); }

  return (
    <div style={{ ...card, opacity:p.isEnabled?1:0.5, borderColor:p.hasKey&&p.available?"rgba(255,255,255,0.08)":"rgba(239,68,68,0.15)" }}>
      <div style={{ display:"flex", gap:"12px", alignItems:"flex-start" }}>
        {/* Logo + dot */}
        <div style={{ position:"relative", flexShrink:0 }}>
          <div style={{ fontSize:"26px", lineHeight:1 }}>{cat?.logo||"🤖"}</div>
          <span style={{ position:"absolute", bottom:-1, right:-1, width:"9px", height:"9px", borderRadius:"50%", backgroundColor:color, border:"2px solid #09090f", boxShadow:`0 0 5px ${color}` }} />
        </div>

        {/* Info */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap", marginBottom:"3px" }}>
            <span style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"14px", color:"#fff" }}>{p.name}</span>
            {cat?.badge && <span style={{ fontSize:"9px", fontWeight:700, background:`${cat.bc}22`, color:cat.bc, border:`1px solid ${cat.bc}44`, borderRadius:"4px", padding:"1px 5px" }}>{cat.badge}</span>}
            <span style={{ fontSize:"11px", color, fontWeight:600 }}>{statusLbl(p)}</span>
            <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.2)", marginLeft:"auto" }}>#{p.priority}</span>
          </div>
          <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", marginBottom:"8px", fontFamily:"monospace" }}>{p.model}</div>

          {/* Quota bar */}
          {p.hasKey && (
            <div style={{ marginBottom:"10px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"10px", color:"rgba(255,255,255,0.25)", marginBottom:"3px" }}>
                <span>Today: {p.requestsToday}/{p.maxPerDay} · Min: {p.requestsThisMin}/{p.maxPerMin}</span>
                <span>✓ {p.successRate}%</span>
              </div>
              <div style={{ height:"3px", borderRadius:"2px", background:"rgba(255,255,255,0.06)" }}>
                <div style={{ height:"100%", borderRadius:"2px", width:`${p.quotaPercent}%`, background:p.quotaPercent>80?"#f59e0b":"#22c55e", transition:"width 0.4s" }} />
              </div>
            </div>
          )}

          {/* Key */}
          {!editing ? (
            <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
              <span style={{ fontSize:"12px", color:p.hasKey?"#22c55e":"#ef4444" }}>{p.hasKey?"● Key saved":"● No key — add to activate"}</span>
              <button style={{ ...btnG, fontSize:"11px", padding:"3px 9px" }} onClick={startEdit}>{p.hasKey?"Update key":"Add key"}</button>
              {msg && <span style={{ fontSize:"11px", color:"#22c55e" }}>{msg}</span>}
            </div>
          ) : (
            <div>
              {cat && <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", marginBottom:"5px" }}>{cat.hint} — <a href={cat.link} target="_blank" rel="noopener noreferrer" style={{ color:"#a78bfa", textDecoration:"none" }}>Get key →</a></div>}
              <div style={{ display:"flex", gap:"7px" }}>
                <input ref={keyRef} type="password" style={{ ...inp, flex:1 }} placeholder="Paste API key…" value={keyVal} onChange={e => setKeyVal(e.target.value)} onKeyDown={e => { if (e.key==="Enter") saveKey(); if (e.key==="Escape") { setEditing(false); setKeyVal(""); } }} autoComplete="off" />
                <button style={btnP} onClick={saveKey} disabled={saving||!keyVal.trim()}>{saving?"…":"Save"}</button>
                <button style={btnG} onClick={() => { setEditing(false); setKeyVal(""); }}>×</button>
              </div>
              {msg && <div style={{ fontSize:"11px", color:"#22c55e", marginTop:"5px" }}>{msg}</div>}
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ display:"flex", flexDirection:"column", gap:"5px", alignItems:"flex-end", flexShrink:0 }}>
          <div style={{ display:"flex", gap:"3px" }}>
            <button style={{ ...btnG, padding:"3px 8px" }} onClick={() => movePri(-1)} title="Higher priority">↑</button>
            <button style={{ ...btnG, padding:"3px 8px" }} onClick={() => movePri(1)}  title="Lower priority">↓</button>
          </div>
          {p.isEnabled && <button style={btnG} onClick={() => tog("is_paused", !p.isPaused)}>{p.isPaused?"Resume":"Pause"}</button>}
          <button style={btnG} onClick={() => tog("is_enabled", !p.isEnabled)}>{p.isEnabled?"Disable":"Enable"}</button>
          {(p.coolingDown||p.errors>0) && <button style={btnG} onClick={reset}>Reset</button>}
          {confirm
            ? <div style={{ display:"flex", gap:"3px" }}><button style={{ ...btnD, fontSize:"11px", padding:"3px 8px" }} onClick={del}>Confirm</button><button style={{ ...btnG, fontSize:"11px", padding:"3px 8px" }} onClick={() => setConfirm(false)}>×</button></div>
            : <button style={btnD} onClick={() => setConfirm(true)}>Delete</button>}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export function AIProviders({ user }) {
  const [providers, setProviders] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showAdd,   setShowAdd]   = useState(false);
  const [filter,    setFilter]    = useState("all");
  const [flash,     setFlash]     = useState("");
  const userId = user?.id;

  const refresh = useCallback(async () => {
    if (!userId) return;
    invalidateProviderCache();
    const data = await getProviderStatus(userId);
    setProviders(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { const t = setInterval(refresh, 15000); return () => clearInterval(t); }, [refresh]);

  function resetAll() {
    resetAllQuotas(userId);
    setFlash("All quotas reset ✓");
    setTimeout(() => { setFlash(""); refresh(); }, 1500);
  }

  const existingIds = providers.map(p => p.providerId);
  const active  = providers.filter(p => p.available).length;
  const issues  = providers.filter(p => !p.hasKey||p.coolingDown||p.errors>0).length;
  const total   = providers.reduce((s,p) => s+p.requestsToday, 0);

  const filtered = providers.filter(p => {
    if (filter==="active") return p.isEnabled && !p.isPaused && p.hasKey && p.available;
    if (filter==="issues") return !p.hasKey || p.coolingDown || p.errors > 0;
    return true;
  });

  return (
    <div style={{ padding:"24px", maxWidth:"860px", margin:"0 auto" }}>
      <h1 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"20px", color:"#fff", margin:"0 0 4px" }}>AI Providers</h1>
      <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"13px", margin:"0 0 22px" }}>
        Shared across all users. Add an API key here — everyone benefits immediately.
      </p>

      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px", marginBottom:"20px" }}>
        {[{v:active,label:"Active",c:"#22c55e"},{v:issues,label:"Need attention",c:issues>0?"#f59e0b":"rgba(255,255,255,0.7)"},{v:providers.length,label:"Total",c:"rgba(255,255,255,0.8)"},{v:total,label:"Requests today",c:"#a78bfa"}].map(({v,label,c})=>(
          <div key={label} style={{ ...card, padding:"12px 14px", marginBottom:0, textAlign:"center" }}>
            <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"22px", color:c }}>{v}</div>
            <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)", marginTop:"2px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"14px", gap:"8px", flexWrap:"wrap" }}>
        <div style={{ display:"flex", gap:"5px" }}>
          {["all","active","issues"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{ ...btnG, color:filter===f?"#a78bfa":"rgba(255,255,255,0.5)", borderColor:filter===f?"rgba(139,92,246,0.4)":"rgba(255,255,255,0.1)", background:filter===f?"rgba(139,92,246,0.08)":"none" }}>
              {f==="all"?"All":f==="active"?"Active":`Issues${issues>0?` (${issues})`:""}`}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:"7px", alignItems:"center" }}>
          {flash && <span style={{ fontSize:"12px", color:"#22c55e" }}>{flash}</span>}
          <button style={btnG} onClick={resetAll}>Reset quotas</button>
          <button style={btnP} onClick={() => setShowAdd(true)}>+ Add Provider</button>
        </div>
      </div>

      {/* Shared notice */}
      <div style={{ ...card, background:"rgba(59,130,246,0.05)", borderColor:"rgba(59,130,246,0.15)", marginBottom:"14px", padding:"10px 14px" }}>
        <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.5)", lineHeight:1.6 }}>
          🔗 <strong style={{color:"#60a5fa"}}>Shared providers</strong> — API keys added here are used by all logged-in users. Quota is tracked individually per user so no one monopolises the limits.
        </div>
      </div>

      {loading && <div style={{ textAlign:"center", color:"rgba(255,255,255,0.3)", padding:"40px 0", fontSize:"13px" }}>Loading…</div>}

      {!loading && providers.length === 0 && (
        <div style={{ ...card, textAlign:"center", padding:"40px 20px" }}>
          <div style={{ fontSize:"36px", marginBottom:"10px" }}>🤖</div>
          <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"15px", color:"#fff", marginBottom:"8px" }}>No providers yet</div>
          <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)", marginBottom:"18px" }}>Add Groq first — it's free and takes 30 seconds.</div>
          <button style={btnP} onClick={() => setShowAdd(true)}>+ Add First Provider</button>
        </div>
      )}

      {!loading && filtered.map(p => <ProvCard key={p.id} p={p} userId={userId} onRefresh={refresh} />)}

      {!loading && filtered.length===0 && providers.length>0 && (
        <div style={{ textAlign:"center", color:"rgba(255,255,255,0.3)", padding:"28px 0", fontSize:"13px" }}>No providers match this filter.</div>
      )}

      {/* How it works */}
      <div style={{ ...card, marginTop:"20px", background:"rgba(139,92,246,0.04)", borderColor:"rgba(139,92,246,0.12)", padding:"14px 16px" }}>
        <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"11px", color:"#a78bfa", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"8px" }}>Smart failover</div>
        <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.45)", lineHeight:1.7 }}>
          Mindoo tries providers in priority order. Rate-limited? Moves to next automatically. Daily quotas reset at midnight. Each user's usage is tracked independently. Use ↑ ↓ to change priority.
        </div>
      </div>

      {showAdd && <AddModal existingIds={existingIds} onSave={refresh} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
