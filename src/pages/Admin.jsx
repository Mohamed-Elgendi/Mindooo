// src/pages/Admin.jsx — Admin Panel at /admin route
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

const CATALOGUE = [
  { provider_id:"groq",       name:"Groq",            company:"Groq",      logo:"⚡", base_url:"https://api.groq.com/openai/v1/chat/completions",                                                model:"llama-3.3-70b-versatile",                api_format:"openai",    priority:1,  rpm:30,  rpd:14400, tok:8000,  crl:62, ce:15 },
  { provider_id:"gemini",     name:"Gemini",           company:"Google",    logo:"🌐", base_url:"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",      model:"gemini-2.0-flash",                       api_format:"google",    priority:2,  rpm:15,  rpd:1500,  tok:8000,  crl:65, ce:15 },
  { provider_id:"openrouter", name:"OpenRouter",       company:"OpenRouter",logo:"🔀", base_url:"https://openrouter.ai/api/v1/chat/completions",                                                 model:"meta-llama/llama-3.3-70b-instruct:free", api_format:"openai",    priority:3,  rpm:20,  rpd:200,   tok:8000,  crl:65, ce:20 },
  { provider_id:"glm",        name:"GLM (Zhipu)",      company:"Zhipu AI",  logo:"🤖", base_url:"https://open.bigmodel.cn/api/paas/v4/chat/completions",                                         model:"glm-4-flash",                            api_format:"openai",    priority:4,  rpm:60,  rpd:1000,  tok:8000,  crl:62, ce:15 },
  { provider_id:"deepseek",   name:"DeepSeek",         company:"DeepSeek",  logo:"🔍", base_url:"https://api.deepseek.com/v1/chat/completions",                                                  model:"deepseek-chat",                          api_format:"openai",    priority:5,  rpm:60,  rpd:1000,  tok:32000, crl:62, ce:15 },
  { provider_id:"openai",     name:"ChatGPT (GPT-4o)", company:"OpenAI",    logo:"💬", base_url:"https://api.openai.com/v1/chat/completions",                                                    model:"gpt-4o-mini",                            api_format:"openai",    priority:6,  rpm:60,  rpd:1000,  tok:16000, crl:62, ce:15 },
  { provider_id:"anthropic",  name:"Claude",           company:"Anthropic", logo:"🧠", base_url:"https://api.anthropic.com/v1/messages",                                                         model:"claude-haiku-4-5-20251001",              api_format:"anthropic", priority:7,  rpm:60,  rpd:1000,  tok:8000,  crl:62, ce:15 },
  { provider_id:"mistral",    name:"Mistral",          company:"Mistral AI",logo:"💨", base_url:"https://api.mistral.ai/v1/chat/completions",                                                    model:"mistral-small-latest",                   api_format:"openai",    priority:8,  rpm:60,  rpd:1000,  tok:32000, crl:62, ce:15 },
  { provider_id:"qwen",       name:"Qwen (Alibaba)",   company:"Alibaba",   logo:"🔮", base_url:"https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",                            model:"qwen-plus",                              api_format:"openai",    priority:9,  rpm:60,  rpd:1000,  tok:30000, crl:62, ce:15 },
];

const inp  = { width:"100%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"10px", padding:"9px 13px", color:"#fff", fontSize:"13px", fontFamily:"Inter,sans-serif", outline:"none", boxSizing:"border-box" };
const btnP = { background:"linear-gradient(135deg,#8b5cf6,#3b82f6)", border:"none", borderRadius:"9px", color:"#fff", fontSize:"13px", fontWeight:600, padding:"9px 20px", cursor:"pointer", fontFamily:"Inter,sans-serif", whiteSpace:"nowrap" };
const btnG = { background:"none", border:"1px solid rgba(255,255,255,0.14)", borderRadius:"8px", color:"rgba(255,255,255,0.6)", fontSize:"12px", padding:"5px 12px", cursor:"pointer", fontFamily:"Inter,sans-serif", whiteSpace:"nowrap" };
const btnD = { background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"8px", color:"#ef4444", fontSize:"12px", padding:"5px 12px", cursor:"pointer", fontFamily:"Inter,sans-serif", whiteSpace:"nowrap" };
const card = { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"14px", padding:"18px 20px", marginBottom:"12px" };
const lbl  = { fontSize:"10px", color:"rgba(255,255,255,0.35)", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:"4px", display:"block" };

function dotColor(p) {
  if (!p.is_enabled) return "#6b7280";
  if (p.is_paused)   return "#f59e0b";
  if (!p.api_key?.trim()) return "#ef4444";
  return "#22c55e";
}
function statusTxt(p) {
  if (!p.is_enabled) return "Disabled";
  if (p.is_paused)   return "Paused";
  if (!p.api_key?.trim()) return "No key";
  return "Active";
}
function getCat(pid) { return CATALOGUE.find(c => c.provider_id === pid); }

function AddModal({ existingIds, onSave, onClose }) {
  const [sel,    setSel]    = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");
  const [custom, setCustom] = useState(false);
  const [cf, setCf] = useState({ provider_id:"", name:"", company:"", base_url:"", model:"", api_format:"openai", api_key:"", priority:20, max_requests_per_minute:30, max_requests_per_day:1000, max_tokens_per_request:4000, cooldown_on_rate_limit:62, cooldown_on_error:15, notes:"" });
  const keyRef = useRef(null);
  const avail  = CATALOGUE.filter(c => !existingIds.includes(c.provider_id));

  function pick(cat) { setSel(cat); setApiKey(""); setErr(""); setTimeout(() => keyRef.current?.focus(), 80); }

  async function save() {
    if (!sel)           { setErr("Pick a provider."); return; }
    if (!apiKey.trim()) { setErr("Paste API key."); return; }
    setSaving(true);
    const { error } = await supabase.from("ai_providers").insert({
      provider_id: sel.provider_id, name: sel.name, company: sel.company,
      api_key: apiKey.trim(), base_url: sel.base_url, model: sel.model,
      api_format: sel.api_format, priority: sel.priority,
      max_requests_per_minute: sel.rpm, max_requests_per_day: sel.rpd,
      max_tokens_per_request: sel.tok, cooldown_on_rate_limit: sel.crl,
      cooldown_on_error: sel.ce, notes: "", is_enabled: true, is_paused: false,
    });
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onSave(); onClose();
  }

  async function saveCustom() {
    if (!cf.provider_id || !cf.name || !cf.base_url || !cf.model) { setErr("ID, name, URL and model required."); return; }
    setSaving(true);
    const { error } = await supabase.from("ai_providers").insert({ ...cf, is_enabled: true, is_paused: false });
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onSave(); onClose();
  }

  function sc(k, v) { setCf(f => ({ ...f, [k]: v })); }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, padding:"16px" }}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#0f0f1a", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"18px", padding:"24px", width:"100%", maxWidth:"540px", maxHeight:"88vh", overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"18px" }}>
          <div>
            <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"17px", color:"#fff" }}>Add AI Provider</div>
            <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)", marginTop:"2px" }}>Pick from catalogue or add custom endpoint</div>
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
                </div>
                <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", fontFamily:"monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.model}</div>
              </div>
            ))}
            {avail.length === 0 && <div style={{ gridColumn:"1/-1", textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:"13px", padding:"16px" }}>All known providers added.</div>}
          </div>

          {sel && (
            <div style={{ marginBottom:"14px" }}>
              <label style={lbl}>API Key for {sel.name}</label>
              <input ref={keyRef} type="password" style={inp} placeholder="Paste API key here…"
                value={apiKey} onChange={e => { setApiKey(e.target.value); setErr(""); }}
                onKeyDown={e => e.key === "Enter" && save()} autoComplete="off" />
              {sel.provider_id === "anthropic" && (
                <div style={{ fontSize:"11px", color:"#f59e0b", marginTop:"7px", background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:"8px", padding:"8px 12px" }}>
                  ⚠️ Claude blocks browser calls. Key saved but needs a server proxy to work.
                </div>
              )}
            </div>
          )}

          {err && <div style={{ color:"#ef4444", fontSize:"12px", marginBottom:"10px" }}>{err}</div>}
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", alignItems:"center" }}>
            {sel && <button style={btnP} onClick={save} disabled={saving || !apiKey.trim()}>{saving ? "Saving…" : `Add ${sel.name}`}</button>}
            <button style={btnG} onClick={onClose}>Cancel</button>
            <button style={{ ...btnG, marginLeft:"auto", fontSize:"11px" }} onClick={() => { setCustom(true); setErr(""); }}>+ Custom</button>
          </div>
        </>) : (<>
          <button onClick={() => setCustom(false)} style={{ background:"none", border:"none", color:"#a78bfa", cursor:"pointer", fontSize:"13px", marginBottom:"14px", display:"block", padding:0 }}>← Back to catalogue</button>
          {[["Provider ID (unique)","provider_id","e.g. my_ai"],["Display Name","name","e.g. My AI"],["API Endpoint URL","base_url","https://api.example.com/v1/chat/completions"],["Model Name","model","e.g. llama-3-70b"]].map(([l,k,ph]) => (
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
            <button style={btnP} onClick={saveCustom} disabled={saving}>{saving ? "Adding…" : "Add Provider"}</button>
            <button style={btnG} onClick={() => setCustom(false)}>Cancel</button>
          </div>
        </>)}
      </div>
    </div>
  );
}

function ProvRow({ p, onRefresh }) {
  const [editing, setEditing] = useState(false);
  const [keyVal,  setKeyVal]  = useState("");
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState("");
  const [confirm, setConfirm] = useState(false);
  const keyRef = useRef(null);
  const cat    = getCat(p.provider_id);
  const color  = dotColor(p);

  function startEdit() { setEditing(true); setKeyVal(""); setTimeout(() => keyRef.current?.focus(), 80); }

  async function saveKey() {
    if (!keyVal.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("ai_providers").update({ api_key: keyVal.trim(), updated_at: new Date().toISOString() }).eq("provider_id", p.provider_id);
    setSaving(false);
    if (error) { setMsg("Failed"); return; }
    setMsg("Saved ✓"); setEditing(false); setKeyVal("");
    setTimeout(() => { setMsg(""); onRefresh(); }, 1500);
  }

  async function tog(field, val) {
    await supabase.from("ai_providers").update({ [field]: val, updated_at: new Date().toISOString() }).eq("provider_id", p.provider_id);
    onRefresh();
  }

  async function movePri(d) {
    await supabase.from("ai_providers").update({ priority: Math.max(1, p.priority + d), updated_at: new Date().toISOString() }).eq("provider_id", p.provider_id);
    onRefresh();
  }

  async function del() {
    await supabase.from("ai_providers").delete().eq("provider_id", p.provider_id);
    onRefresh();
  }

  return (
    <div style={{ ...card, opacity: p.is_enabled ? 1 : 0.55, borderColor: p.api_key?.trim() && p.is_enabled ? "rgba(255,255,255,0.08)" : "rgba(239,68,68,0.15)" }}>
      <div style={{ display:"flex", gap:"12px", alignItems:"flex-start" }}>
        <div style={{ position:"relative", flexShrink:0 }}>
          <div style={{ fontSize:"26px", lineHeight:1 }}>{cat?.logo || "🤖"}</div>
          <span style={{ position:"absolute", bottom:-1, right:-1, width:"9px", height:"9px", borderRadius:"50%", backgroundColor:color, border:"2px solid #09090f", boxShadow:`0 0 5px ${color}` }} />
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap", marginBottom:"3px" }}>
            <span style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"14px", color:"#fff" }}>{p.name}</span>
            <span style={{ fontSize:"11px", color, fontWeight:600 }}>{statusTxt(p)}</span>
            <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.2)", marginLeft:"auto" }}>Priority #{p.priority}</span>
          </div>
          <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", marginBottom:"8px", fontFamily:"monospace" }}>{p.model} · {p.api_format}</div>

          {!editing ? (
            <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
              <span style={{ fontSize:"12px", color: p.api_key?.trim() ? "#22c55e" : "#ef4444" }}>
                {p.api_key?.trim() ? "● API key saved" : "● No key — add one to activate"}
              </span>
              <button style={{ ...btnG, fontSize:"11px", padding:"3px 9px" }} onClick={startEdit}>
                {p.api_key?.trim() ? "Update key" : "Add key"}
              </button>
              {msg && <span style={{ fontSize:"11px", color:"#22c55e" }}>{msg}</span>}
            </div>
          ) : (
            <div>
              <div style={{ display:"flex", gap:"7px" }}>
                <input ref={keyRef} type="password" style={{ ...inp, flex:1 }} placeholder="Paste API key here…"
                  value={keyVal} onChange={e => setKeyVal(e.target.value)}
                  onKeyDown={e => { if (e.key==="Enter") saveKey(); if (e.key==="Escape") { setEditing(false); setKeyVal(""); } }}
                  autoComplete="off" />
                <button style={btnP} onClick={saveKey} disabled={saving || !keyVal.trim()}>{saving ? "…" : "Save"}</button>
                <button style={btnG} onClick={() => { setEditing(false); setKeyVal(""); }}>×</button>
              </div>
              {msg && <div style={{ fontSize:"11px", color:"#22c55e", marginTop:"5px" }}>{msg}</div>}
            </div>
          )}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:"5px", alignItems:"flex-end", flexShrink:0 }}>
          <div style={{ display:"flex", gap:"3px" }}>
            <button style={{ ...btnG, padding:"3px 8px" }} onClick={() => movePri(-1)} title="Higher priority">↑</button>
            <button style={{ ...btnG, padding:"3px 8px" }} onClick={() => movePri(1)}  title="Lower priority">↓</button>
          </div>
          {p.is_enabled && <button style={btnG} onClick={() => tog("is_paused", !p.is_paused)}>{p.is_paused ? "Resume" : "Pause"}</button>}
          <button style={btnG} onClick={() => tog("is_enabled", !p.is_enabled)}>{p.is_enabled ? "Disable" : "Enable"}</button>
          {confirm ? (
            <div style={{ display:"flex", gap:"3px" }}>
              <button style={{ ...btnD, fontSize:"11px", padding:"3px 8px" }} onClick={del}>Confirm delete</button>
              <button style={{ ...btnG, fontSize:"11px", padding:"3px 8px" }} onClick={() => setConfirm(false)}>×</button>
            </div>
          ) : (
            <button style={btnD} onClick={() => setConfirm(true)}>Delete</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const navigate  = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdmin,  setIsAdmin]  = useState(false);
  const [providers, setProviders] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showAdd,   setShowAdd]   = useState(false);
  const [stats,     setStats]     = useState({ users:0 });

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/signin"); return; }
      const { data: profile } = await supabase.from("user_profiles").select("is_admin").eq("user_id", user.id).single();
      if (!profile?.is_admin) { navigate("/dashboard"); return; }
      setIsAdmin(true);
      setChecking(false);
    }
    check();
  }, [navigate]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("ai_providers").select("*").order("priority", { ascending: true });
    setProviders(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { if (isAdmin) refresh(); }, [isAdmin, refresh]);

  if (checking) return (
    <div style={{ minHeight:"100vh", background:"#09090f", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontFamily:"Sora,sans-serif", color:"rgba(255,255,255,0.4)", fontSize:"14px" }}>Checking access…</div>
    </div>
  );

  if (!isAdmin) return null;

  const active = providers.filter(p => p.is_enabled && !p.is_paused && p.api_key?.trim()).length;
  const noKey  = providers.filter(p => !p.api_key?.trim()).length;

  return (
    <div style={{ minHeight:"100vh", background:"#09090f", color:"#f8f8ff", fontFamily:"Inter,sans-serif" }}>
      <div style={{ maxWidth:"900px", margin:"0 auto", padding:"32px 24px" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"32px", flexWrap:"wrap", gap:"12px" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"4px" }}>
              <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"24px", color:"#fff" }}>Mindoo Admin</div>
              <span style={{ fontSize:"10px", fontWeight:700, background:"rgba(139,92,246,0.2)", color:"#a78bfa", border:"1px solid rgba(139,92,246,0.35)", borderRadius:"6px", padding:"2px 8px", letterSpacing:"0.08em" }}>ADMIN</span>
            </div>
            <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)" }}>AI Provider Management · Backend Control Panel</div>
          </div>
          <button onClick={() => navigate("/dashboard")} style={btnG}>← Back to app</button>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px", marginBottom:"28px" }}>
          {[
            { v:providers.length, l:"Total providers", c:"rgba(255,255,255,0.8)" },
            { v:active,           l:"Active with key",  c:"#22c55e"              },
            { v:noKey,            l:"Missing key",      c:noKey>0?"#ef4444":"rgba(255,255,255,0.4)" },
          ].map(({ v, l, c }) => (
            <div key={l} style={{ ...card, padding:"14px 16px", marginBottom:0, textAlign:"center" }}>
              <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"28px", color:c }}>{v}</div>
              <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)", marginTop:"2px" }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Notice */}
        <div style={{ ...card, background:"rgba(139,92,246,0.05)", borderColor:"rgba(139,92,246,0.15)", marginBottom:"20px", padding:"12px 16px" }}>
          <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.55)", lineHeight:1.7 }}>
            🔑 <strong style={{ color:"#a78bfa" }}>Admin only</strong> — API keys you add here are stored in Supabase and used by all users automatically. Users never see the keys — they only see provider names and can manage their own preferences.
          </div>
        </div>

        {/* Controls */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px", flexWrap:"wrap", gap:"8px" }}>
          <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"16px", color:"#fff" }}>
            AI Providers ({providers.length})
          </div>
          <button style={btnP} onClick={() => setShowAdd(true)}>+ Add Provider</button>
        </div>

        {loading && <div style={{ textAlign:"center", color:"rgba(255,255,255,0.3)", padding:"40px 0", fontSize:"13px" }}>Loading…</div>}

        {!loading && providers.length === 0 && (
          <div style={{ ...card, textAlign:"center", padding:"40px 20px" }}>
            <div style={{ fontSize:"36px", marginBottom:"10px" }}>🤖</div>
            <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"15px", color:"#fff", marginBottom:"8px" }}>No providers yet</div>
            <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)", marginBottom:"18px" }}>Add Groq first — free, fast, and 30 seconds to set up.</div>
            <button style={btnP} onClick={() => setShowAdd(true)}>+ Add First Provider</button>
          </div>
        )}

        {!loading && providers.map(p => <ProvRow key={p.id} p={p} onRefresh={refresh} />)}

        {/* How it works */}
        <div style={{ ...card, marginTop:"24px", background:"rgba(59,130,246,0.04)", borderColor:"rgba(59,130,246,0.12)", padding:"14px 16px" }}>
          <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"11px", color:"#60a5fa", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"8px" }}>How it works</div>
          <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.45)", lineHeight:1.75 }}>
            You add providers and their API keys here once. Keys are encrypted in Supabase and never exposed to users.
            Users see the provider names in their AI settings and can control which ones they use.
            The smart failover system tries providers in priority order — rate limited? moves to next automatically.
            Use ↑ ↓ to set the global default priority order.
          </div>
        </div>

        {showAdd && (
          <AddModal
            existingIds={providers.map(p => p.provider_id)}
            onSave={refresh}
            onClose={() => setShowAdd(false)}
          />
        )}
      </div>
    </div>
  );
}
