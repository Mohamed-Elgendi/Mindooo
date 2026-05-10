// src/pages/sections/AIProviders.jsx — AI Provider Control Panel
import { useState, useEffect, useCallback } from "react";
import {
  getProviderStatus, saveProviderKey, toggleProvider,
  updateProviderPriority, addCustomProvider, deleteProvider,
  resetProviderQuota, resetAllQuotas, invalidateProviderCache,
} from "../../services/ai";

const S = {
  page:    { padding:"24px", maxWidth:"900px", margin:"0 auto" },
  heading: { fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"22px", color:"#fff", marginBottom:"4px" },
  sub:     { color:"rgba(255,255,255,0.4)", fontSize:"13px", marginBottom:"28px" },
  card:    { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"16px", padding:"18px 20px", marginBottom:"12px" },
  row:     { display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap" },
  label:   { fontSize:"11px", color:"rgba(255,255,255,0.35)", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:"4px" },
  input:   { width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", padding:"9px 13px", color:"#fff", fontSize:"13px", fontFamily:"Inter,sans-serif", outline:"none", boxSizing:"border-box" },
  btnG:    { background:"none", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"8px", color:"rgba(255,255,255,0.6)", fontSize:"12px", padding:"5px 12px", cursor:"pointer", fontFamily:"Inter,sans-serif" },
  btnP:    { background:"linear-gradient(135deg,#8b5cf6,#3b82f6)", border:"none", borderRadius:"10px", color:"#fff", fontSize:"13px", fontWeight:600, padding:"9px 20px", cursor:"pointer", fontFamily:"Inter,sans-serif" },
  btnD:    { background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:"8px", color:"#ef4444", fontSize:"12px", padding:"5px 12px", cursor:"pointer", fontFamily:"Inter,sans-serif" },
};

function dot(p) {
  if (!p.isEnabled)  return "#6b7280";
  if (p.isPaused)    return "#f59e0b";
  if (!p.hasKey)     return "#ef4444";
  if (p.coolingDown) return "#f59e0b";
  if (!p.available)  return "#f59e0b";
  if (p.quotaPercent > 80) return "#f59e0b";
  return "#22c55e";
}
function statusLabel(p) {
  if (!p.isEnabled)  return "Disabled";
  if (p.isPaused)    return "Paused";
  if (!p.hasKey)     return "No API key";
  if (p.coolingDown) return `Cooldown ${p.cooldownSecsLeft}s`;
  if (!p.available)  return p.unavailableReason || "Unavailable";
  if (p.quotaPercent > 80) return `Quota ${p.quotaPercent}%`;
  return "Active";
}
function formatBadge(p) {
  if (p.apiFormat==="anthropic") return { label:"Anthropic", color:"#c084fc" };
  if (p.apiFormat==="google")    return { label:"Google",    color:"#60a5fa" };
  return { label:"OpenAI API", color:"#34d399" };
}

function ProviderCard({ p, userId, onRefresh }) {
  const [editing,    setEditing]    = useState(false);
  const [keyInput,   setKeyInput]   = useState("");
  const [saving,     setSaving]     = useState(false);
  const [msg,        setMsg]        = useState("");
  const [confirmDel, setConfirmDel] = useState(false);
  const color = dot(p);
  const badge = formatBadge(p);

  async function saveKey() {
    if (!keyInput.trim()) return;
    setSaving(true);
    const { error } = await saveProviderKey(p.providerId, keyInput.trim(), userId);
    setSaving(false);
    if (error) { setMsg("Failed to save"); return; }
    setMsg("Saved ✓"); setKeyInput(""); setEditing(false);
    setTimeout(() => setMsg(""), 2000);
    onRefresh();
  }
  async function toggle(field, value) {
    await toggleProvider(p.id, field, value, userId);
    onRefresh();
  }
  async function movePriority(delta) {
    await updateProviderPriority(p.id, Math.max(1, p.priority + delta), userId);
    onRefresh();
  }
  async function remove() { await deleteProvider(p.id, userId); onRefresh(); }
  function resetQuota() {
    resetProviderQuota(p.providerId);
    setMsg("Reset ✓");
    setTimeout(() => { setMsg(""); onRefresh(); }, 800);
  }

  return (
    <div style={{ ...S.card, opacity: p.isEnabled ? 1 : 0.5 }}>
      <div style={{ ...S.row, justifyContent:"space-between", marginBottom:"10px" }}>
        <div style={{ ...S.row, gap:"10px" }}>
          <span style={{ width:"8px", height:"8px", borderRadius:"50%", backgroundColor:color, boxShadow:`0 0 6px ${color}`, flexShrink:0, display:"inline-block" }} />
          <div>
            <div style={{ fontFamily:"Sora,sans-serif", fontWeight:600, fontSize:"15px", color:"#fff" }}>{p.name}</div>
            <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)", marginTop:"2px" }}>{p.model}</div>
          </div>
          <span style={{ fontSize:"10px", background:`${badge.color}22`, color:badge.color, border:`1px solid ${badge.color}44`, borderRadius:"6px", padding:"2px 7px", fontWeight:500 }}>{badge.label}</span>
          <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)" }}>#{p.priority}</span>
        </div>
        <div style={{ ...S.row, gap:"6px" }}>
          <span style={{ fontSize:"11px", color, fontWeight:500 }}>{statusLabel(p)}</span>
          <button style={S.btnG} onClick={() => movePriority(-1)}>↑</button>
          <button style={S.btnG} onClick={() => movePriority(1)}>↓</button>
          {p.isEnabled && <button style={S.btnG} onClick={() => toggle("is_paused", !p.isPaused)}>{p.isPaused?"Resume":"Pause"}</button>}
          <button style={S.btnG} onClick={() => toggle("is_enabled", !p.isEnabled)}>{p.isEnabled?"Disable":"Enable"}</button>
          {(p.coolingDown||p.consecutiveErrors>0) && <button style={S.btnG} onClick={resetQuota}>Reset</button>}
          {confirmDel
            ? <><button style={S.btnD} onClick={remove}>Confirm</button><button style={S.btnG} onClick={() => setConfirmDel(false)}>Cancel</button></>
            : <button style={S.btnD} onClick={() => setConfirmDel(true)}>Delete</button>
          }
        </div>
      </div>

      {/* Stats */}
      <div style={{ ...S.row, gap:"20px", marginBottom:"8px" }}>
        <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)" }}>Today: <span style={{color:"#fff"}}>{p.requestsToday}</span>/{p.maxPerDay}</div>
        <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)" }}>Success: <span style={{color:p.successRate>80?"#22c55e":"#f59e0b"}}>{p.successRate}%</span></div>
        {p.consecutiveErrors>0 && <div style={{fontSize:"12px",color:"#ef4444"}}>{p.consecutiveErrors} consecutive errors</div>}
        <div style={{fontSize:"11px",color:"rgba(255,255,255,0.2)"}}>{p.apiFormat?.toUpperCase()}</div>
      </div>

      {/* Quota bar */}
      <div style={{height:"3px",borderRadius:"2px",background:"rgba(255,255,255,0.08)",marginBottom:"14px"}}>
        <div style={{height:"100%",borderRadius:"2px",width:`${p.quotaPercent}%`,background:p.quotaPercent>80?"#f59e0b":"#22c55e",transition:"width 0.3s"}} />
      </div>

      {/* API Key */}
      <div>
        <div style={{ ...S.row, justifyContent:"space-between" }}>
          <div style={{fontSize:"12px",color:"rgba(255,255,255,0.35)"}}>
            API Key: {p.hasKey
              ? <span style={{color:"#22c55e"}}>● Saved</span>
              : <span style={{color:"#ef4444"}}>● Not set</span>}
          </div>
          <button style={S.btnG} onClick={() => setEditing(!editing)}>{editing?"Cancel":p.hasKey?"Update Key":"Add Key"}</button>
        </div>
        {editing && (
          <div style={{marginTop:"10px",display:"flex",gap:"8px"}}>
            <input type="password" style={S.input} placeholder="Paste API key…"
              value={keyInput} onChange={e => setKeyInput(e.target.value)}
              onKeyDown={e => e.key==="Enter" && saveKey()} />
            <button style={S.btnP} onClick={saveKey} disabled={saving||!keyInput.trim()}>{saving?"Saving…":"Save"}</button>
          </div>
        )}
        {msg && <div style={{fontSize:"12px",color:"#22c55e",marginTop:"6px"}}>{msg}</div>}
      </div>
      {p.notes && <div style={{fontSize:"11px",color:"rgba(255,255,255,0.2)",marginTop:"8px"}}>{p.notes}</div>}
    </div>
  );
}

function AddForm({ userId, onRefresh, onClose }) {
  const [form, setForm] = useState({
    provider_id:"", name:"", company:"", base_url:"", model:"",
    api_format:"openai", api_key:"", priority:99,
    max_requests_per_minute:30, max_requests_per_day:1000,
    max_tokens_per_request:4000, cooldown_on_rate_limit:62,
    cooldown_on_error:15, is_enabled:true, is_paused:false, notes:"",
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");
  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  async function submit() {
    if (!form.provider_id||!form.name||!form.base_url||!form.model) {
      setErr("ID, name, URL, and model are required."); return;
    }
    setSaving(true);
    const { error } = await addCustomProvider(form, userId);
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onRefresh(); onClose();
  }

  const Field = ({label, k, type="text", placeholder=""}) => (
    <div style={{flex:1,minWidth:"180px"}}>
      <div style={S.label}>{label}</div>
      <input type={type} style={S.input} placeholder={placeholder}
        value={form[k]} onChange={e => set(k, type==="number"?Number(e.target.value):e.target.value)} />
    </div>
  );

  return (
    <div style={{...S.card, border:"1px solid rgba(139,92,246,0.3)", marginBottom:"20px"}}>
      <div style={{fontFamily:"Sora,sans-serif",fontWeight:700,fontSize:"13px",color:"#a78bfa",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"16px"}}>Add Custom Provider</div>
      <div style={{display:"flex",gap:"12px",flexWrap:"wrap",marginBottom:"12px"}}>
        <Field label="Provider ID (unique)" k="provider_id" placeholder="e.g. my_groq" />
        <Field label="Display Name"        k="name"        placeholder="e.g. My Groq" />
        <Field label="Company"             k="company"     placeholder="e.g. Groq"    />
      </div>
      <div style={{marginBottom:"12px"}}>
        <div style={S.label}>Base URL</div>
        <input type="text" style={S.input} placeholder="https://api.groq.com/openai/v1/chat/completions"
          value={form.base_url} onChange={e => set("base_url",e.target.value)} />
      </div>
      <div style={{display:"flex",gap:"12px",flexWrap:"wrap",marginBottom:"12px"}}>
        <Field label="Model" k="model" placeholder="llama-3.3-70b-versatile" />
        <div style={{flex:1,minWidth:"180px"}}>
          <div style={S.label}>API Format</div>
          <select style={{...S.input,cursor:"pointer"}} value={form.api_format} onChange={e=>set("api_format",e.target.value)}>
            <option value="openai">OpenAI-compatible (most providers)</option>
            <option value="anthropic">Anthropic (Claude)</option>
            <option value="google">Google (Gemini)</option>
          </select>
        </div>
        <Field label="Priority" k="priority" type="number" />
      </div>
      <div style={{display:"flex",gap:"12px",flexWrap:"wrap",marginBottom:"12px"}}>
        <Field label="Max req/min" k="max_requests_per_minute" type="number" />
        <Field label="Max req/day" k="max_requests_per_day"    type="number" />
        <Field label="Max tokens"  k="max_tokens_per_request"  type="number" />
      </div>
      <div style={{marginBottom:"12px"}}>
        <div style={S.label}>API Key (optional — add later)</div>
        <input type="password" style={S.input} placeholder="Paste API key…"
          value={form.api_key} onChange={e=>set("api_key",e.target.value)} />
      </div>
      <div style={{marginBottom:"16px"}}>
        <div style={S.label}>Notes</div>
        <input type="text" style={S.input} placeholder="e.g. Free tier, great for coding"
          value={form.notes} onChange={e=>set("notes",e.target.value)} />
      </div>
      {err && <div style={{color:"#ef4444",fontSize:"12px",marginBottom:"10px"}}>{err}</div>}
      <div style={{display:"flex",gap:"8px"}}>
        <button style={S.btnP} onClick={submit} disabled={saving}>{saving?"Adding…":"Add Provider"}</button>
        <button style={S.btnG} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export function AIProviders({ user }) {
  const [providers, setProviders] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showAdd,   setShowAdd]   = useState(false);
  const [filter,    setFilter]    = useState("all");
  const [resetMsg,  setResetMsg]  = useState("");
  const userId = user?.id;

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    invalidateProviderCache();
    const data = await getProviderStatus(userId);
    setProviders(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { const t = setInterval(refresh, 15_000); return () => clearInterval(t); }, [refresh]);

  function handleResetAll() {
    resetAllQuotas();
    setResetMsg("All quotas reset ✓");
    setTimeout(() => { setResetMsg(""); refresh(); }, 1500);
  }

  const filtered = providers.filter(p => {
    if (filter==="active") return p.isEnabled && !p.isPaused && p.hasKey && p.available;
    if (filter==="issues") return !p.hasKey || p.coolingDown || !p.available || p.consecutiveErrors>0;
    return true;
  });

  const activeCount = providers.filter(p=>p.available).length;
  const issueCount  = providers.filter(p=>!p.hasKey||p.coolingDown||p.consecutiveErrors>0).length;
  const totalReqs   = providers.reduce((s,p)=>s+p.requestsToday,0);

  return (
    <div style={S.page}>
      <h1 style={S.heading}>AI Provider Control Panel</h1>
      <p style={S.sub}>Manage every AI provider — add keys, set priorities, pause, resume, and monitor live health.</p>

      {/* Summary */}
      <div style={{...S.row, marginBottom:"24px", gap:"16px"}}>
        {[
          {val:activeCount, label:"Active",       color:"#22c55e"},
          {val:issueCount,  label:"Need attention",color:issueCount>0?"#f59e0b":"#fff"},
          {val:providers.length, label:"Total",   color:"#fff"},
          {val:totalReqs,   label:"Requests today",color:"#a78bfa"},
        ].map(({val,label,color}) => (
          <div key={label} style={{...S.card, padding:"12px 16px", flex:1, minWidth:"110px", marginBottom:0}}>
            <div style={{fontSize:"22px",fontWeight:700,color,fontFamily:"Sora,sans-serif"}}>{val}</div>
            <div style={{fontSize:"11px",color:"rgba(255,255,255,0.35)"}}>{label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{...S.row, justifyContent:"space-between", marginBottom:"16px"}}>
        <div style={S.row}>
          {["all","active","issues"].map(f => (
            <button key={f} style={{...S.btnG, color:filter===f?"#a78bfa":"rgba(255,255,255,0.5)", borderColor:filter===f?"rgba(139,92,246,0.4)":"rgba(255,255,255,0.1)"}}
              onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
              {f==="issues"&&issueCount>0&&<span style={{marginLeft:"5px",color:"#f59e0b"}}>({issueCount})</span>}
            </button>
          ))}
        </div>
        <div style={S.row}>
          {resetMsg && <span style={{fontSize:"12px",color:"#22c55e"}}>{resetMsg}</span>}
          <button style={S.btnG} onClick={handleResetAll}>Reset all quotas</button>
          <button style={S.btnP} onClick={() => setShowAdd(!showAdd)}>{showAdd?"Cancel":"+ Add Provider"}</button>
        </div>
      </div>

      {showAdd && <AddForm userId={userId} onRefresh={refresh} onClose={() => setShowAdd(false)} />}

      {loading ? (
        <div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"40px 0"}}>Loading providers…</div>
      ) : filtered.length===0 ? (
        <div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"40px 0"}}>
          {filter==="all" ? 'No providers yet — click "+ Add Provider".' : `No providers match "${filter}".`}
        </div>
      ) : (
        filtered.map(p => <ProviderCard key={p.id} p={p} userId={userId} onRefresh={refresh} />)
      )}

      {/* How it works */}
      <div style={{...S.card, marginTop:"28px", background:"rgba(139,92,246,0.05)", borderColor:"rgba(139,92,246,0.15)"}}>
        <div style={{fontFamily:"Sora,sans-serif",fontWeight:700,fontSize:"13px",color:"#a78bfa",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"12px"}}>How the smart failover works</div>
        <div style={{fontSize:"13px",color:"rgba(255,255,255,0.5)",lineHeight:1.7}}>
          Before every AI call, Mindoo checks each provider in priority order (#1 first).
          A provider is skipped if it has no API key, is cooling down after an error,
          its per-minute or daily quota is full, or it failed authentication this session.
          The first available provider is used. If all fail, you see a clear message.
          Cooldowns reset automatically. Daily quotas reset at midnight.
          Add any provider — OpenAI, Anthropic, Gemini, Groq, DeepSeek, Mistral, Qwen, GLM,
          OpenRouter, or any custom OpenAI-compatible endpoint.
        </div>
      </div>
    </div>
  );
}
