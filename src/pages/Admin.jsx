// src/pages/Admin.jsx — Admin Panel v2
// Clean UI, working priority system, key management, live status

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

// ── Catalogue ─────────────────────────────────────────────────────
const CATALOGUE = [
  { provider_id:"groq",       name:"Groq",            company:"Groq",      logo:"⚡", badge:"FREE",  bc:"#22c55e", hint:"Get free key at console.groq.com",        base_url:"https://api.groq.com/openai/v1/chat/completions",                                                model:"llama-3.3-70b-versatile",                api_format:"openai",    priority:1,  rpm:30,  rpd:14400, tok:8000,  crl:62, ce:15 },
  { provider_id:"gemini",     name:"Gemini",           company:"Google",    logo:"🌐", badge:"FREE",  bc:"#22c55e", hint:"Get free key at aistudio.google.com",     base_url:"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",      model:"gemini-2.0-flash",                       api_format:"google",    priority:2,  rpm:15,  rpd:1500,  tok:8000,  crl:65, ce:15 },
  { provider_id:"openrouter", name:"OpenRouter",       company:"OpenRouter",logo:"🔀", badge:"FREE",  bc:"#22c55e", hint:"Get free key at openrouter.ai",           base_url:"https://openrouter.ai/api/v1/chat/completions",                                                  model:"meta-llama/llama-3.3-70b-instruct:free", api_format:"openai",    priority:3,  rpm:20,  rpd:200,   tok:8000,  crl:65, ce:20 },
  { provider_id:"glm",        name:"GLM (Zhipu)",      company:"Zhipu AI",  logo:"🤖", badge:"FREE",  bc:"#22c55e", hint:"Get free key at bigmodel.cn",             base_url:"https://open.bigmodel.cn/api/paas/v4/chat/completions",                                          model:"glm-4-flash",                            api_format:"openai",    priority:4,  rpm:60,  rpd:1000,  tok:8000,  crl:62, ce:15 },
  { provider_id:"deepseek",   name:"DeepSeek",         company:"DeepSeek",  logo:"🔍", badge:"CHEAP", bc:"#60a5fa", hint:"Get key at platform.deepseek.com",        base_url:"https://api.deepseek.com/v1/chat/completions",                                                   model:"deepseek-chat",                          api_format:"openai",    priority:5,  rpm:60,  rpd:1000,  tok:32000, crl:62, ce:15 },
  { provider_id:"openai",     name:"ChatGPT (GPT-4o)", company:"OpenAI",    logo:"💬", badge:"PAID",  bc:"#a78bfa", hint:"Get key at platform.openai.com",          base_url:"https://api.openai.com/v1/chat/completions",                                                     model:"gpt-4o-mini",                            api_format:"openai",    priority:6,  rpm:60,  rpd:1000,  tok:16000, crl:62, ce:15 },
  { provider_id:"anthropic",  name:"Claude",           company:"Anthropic", logo:"🧠", badge:"PAID",  bc:"#a78bfa", hint:"Get key at console.anthropic.com",        base_url:"https://api.anthropic.com/v1/messages",                                                          model:"claude-haiku-4-5-20251001",              api_format:"anthropic", priority:7,  rpm:60,  rpd:1000,  tok:8000,  crl:62, ce:15 },
  { provider_id:"mistral",    name:"Mistral",          company:"Mistral AI",logo:"💨", badge:"PAID",  bc:"#a78bfa", hint:"Get key at console.mistral.ai",           base_url:"https://api.mistral.ai/v1/chat/completions",                                                     model:"mistral-small-latest",                   api_format:"openai",    priority:8,  rpm:60,  rpd:1000,  tok:32000, crl:62, ce:15 },
  { provider_id:"qwen",       name:"Qwen (Alibaba)",   company:"Alibaba",   logo:"🔮", badge:"PAID",  bc:"#a78bfa", hint:"Get key at dashscope.aliyun.com",         base_url:"https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",                            model:"qwen-plus",                              api_format:"openai",    priority:9,  rpm:60,  rpd:1000,  tok:30000, crl:62, ce:15 },
];

function getCat(pid) { return CATALOGUE.find(c => c.provider_id === pid); }

// ── Add Modal ─────────────────────────────────────────────────────
function AddModal({ existingIds, onSave, onClose }) {
  const [sel,    setSel]    = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");
  const [custom, setCustom] = useState(false);
  const [cf, setCf] = useState({
    provider_id:"", name:"", company:"", base_url:"", model:"",
    api_format:"openai", api_key:"", priority:20,
    max_requests_per_minute:30, max_requests_per_day:1000,
    max_tokens_per_request:4000, cooldown_on_rate_limit:62,
    cooldown_on_error:15, notes:"",
  });
  const keyRef = useRef(null);
  const avail  = CATALOGUE.filter(c => !existingIds.includes(c.provider_id));

  function pick(cat) {
    setSel(cat); setApiKey(""); setErr("");
    setTimeout(() => keyRef.current?.focus(), 80);
  }

  async function save() {
    if (!sel)           { setErr("Pick a provider first."); return; }
    if (!apiKey.trim()) { setErr("Paste your API key."); return; }
    setSaving(true); setErr("");
    const { error } = await supabase.from("ai_providers").insert({
      provider_id:             sel.provider_id,
      name:                    sel.name,
      company:                 sel.company,
      api_key:                 apiKey.trim(),
      base_url:                sel.base_url,
      model:                   sel.model,
      api_format:              sel.api_format,
      priority:                sel.priority,
      max_requests_per_minute: sel.rpm,
      max_requests_per_day:    sel.rpd,
      max_tokens_per_request:  sel.tok,
      cooldown_on_rate_limit:  sel.crl,
      cooldown_on_error:       sel.ce,
      notes:                   sel.badge === "FREE" ? "Free tier" : "",
      is_enabled:              true,
      is_paused:               false,
    });
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onSave(); onClose();
  }

  async function saveCustom() {
    if (!cf.provider_id || !cf.name || !cf.base_url || !cf.model) {
      setErr("ID, name, URL and model are required."); return;
    }
    setSaving(true);
    const { error } = await supabase.from("ai_providers").insert({
      ...cf, is_enabled: true, is_paused: false,
    });
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onSave(); onClose();
  }

  function sc(k, v) { setCf(f => ({ ...f, [k]: v })); }

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, padding:"16px" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background:"#0f0f1a", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"20px", padding:"28px", width:"100%", maxWidth:"560px", maxHeight:"90vh", overflowY:"auto" }}
      >
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"20px" }}>
          <div>
            <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"18px", color:"#fff" }}>
              {custom ? "Add Custom Provider" : "Add AI Provider"}
            </div>
            <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)", marginTop:"3px" }}>
              {custom ? "Any OpenAI-compatible API endpoint" : "Pick from catalogue — everything is pre-configured"}
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:"22px", cursor:"pointer", lineHeight:1, padding:"0 4px", flexShrink:0 }}>×</button>
        </div>

        {!custom ? (<>
          {/* Provider grid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"20px" }}>
            {avail.map(c => (
              <div key={c.provider_id} onClick={() => pick(c)} style={{
                background:   sel?.provider_id === c.provider_id ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
                border:       `1px solid ${sel?.provider_id === c.provider_id ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: "12px", padding:"12px 14px", cursor:"pointer", transition:"all 0.15s",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"4px" }}>
                  <span style={{ fontSize:"18px" }}>{c.logo}</span>
                  <span style={{ fontWeight:600, fontSize:"13px", color:"#fff" }}>{c.name}</span>
                  <span style={{ fontSize:"9px", fontWeight:700, background:`${c.bc}22`, color:c.bc, border:`1px solid ${c.bc}44`, borderRadius:"4px", padding:"1px 5px", marginLeft:"auto" }}>{c.badge}</span>
                </div>
                <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)" }}>{c.hint}</div>
              </div>
            ))}
            {avail.length === 0 && (
              <div style={{ gridColumn:"1/-1", textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:"13px", padding:"20px" }}>
                All known providers are already added.
              </div>
            )}
          </div>

          {/* Key input */}
          {sel && (
            <div style={{ marginBottom:"20px" }}>
              <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:"6px" }}>
                API Key for {sel.name}
              </div>
              <input
                ref={keyRef}
                type="password"
                placeholder={`Paste your ${sel.name} API key here…`}
                value={apiKey}
                onChange={e => { setApiKey(e.target.value); setErr(""); }}
                onKeyDown={e => e.key === "Enter" && save()}
                autoComplete="off"
                style={{ width:"100%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:"10px", padding:"11px 14px", color:"#fff", fontSize:"13px", fontFamily:"Inter,sans-serif", outline:"none", boxSizing:"border-box" }}
              />
              {sel.provider_id === "anthropic" && (
                <div style={{ fontSize:"11px", color:"#f59e0b", marginTop:"8px", background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:"8px", padding:"8px 12px" }}>
                  ⚠️ Claude currently blocks browser calls due to CORS. Key will be saved but won't work until a server proxy is added.
                </div>
              )}
            </div>
          )}

          {err && <div style={{ color:"#ef4444", fontSize:"12px", marginBottom:"12px" }}>{err}</div>}

          <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
            {sel && (
              <button
                onClick={save}
                disabled={saving || !apiKey.trim()}
                style={{ background:"linear-gradient(135deg,#8b5cf6,#3b82f6)", border:"none", borderRadius:"10px", color:"#fff", fontSize:"13px", fontWeight:600, padding:"10px 22px", cursor:"pointer", fontFamily:"Inter,sans-serif", opacity: saving || !apiKey.trim() ? 0.5 : 1 }}
              >
                {saving ? "Saving…" : `Add ${sel.name}`}
              </button>
            )}
            <button onClick={onClose} style={{ background:"none", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"9px", color:"rgba(255,255,255,0.6)", fontSize:"12px", padding:"9px 16px", cursor:"pointer", fontFamily:"Inter,sans-serif" }}>
              Cancel
            </button>
            <button onClick={() => { setCustom(true); setErr(""); }} style={{ background:"none", border:"none", color:"#a78bfa", fontSize:"12px", cursor:"pointer", fontFamily:"Inter,sans-serif", marginLeft:"auto" }}>
              + Custom endpoint →
            </button>
          </div>
        </>) : (<>
          <button onClick={() => setCustom(false)} style={{ background:"none", border:"none", color:"#a78bfa", cursor:"pointer", fontSize:"13px", marginBottom:"18px", display:"block", padding:0 }}>
            ← Back to catalogue
          </button>

          {[
            ["Provider ID (unique, no spaces)", "provider_id", "e.g. together_ai"],
            ["Display Name",                   "name",        "e.g. Together AI"],
            ["Company",                         "company",     "e.g. Together"],
            ["API Endpoint URL",                "base_url",    "https://api.together.xyz/v1/chat/completions"],
            ["Model Name",                      "model",       "e.g. meta-llama/Llama-3-70b-chat-hf"],
          ].map(([label, key, ph]) => (
            <div key={key} style={{ marginBottom:"12px" }}>
              <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:"5px" }}>{label}</div>
              <input type="text" placeholder={ph} value={cf[key]} onChange={e => sc(key, e.target.value)} autoComplete="off"
                style={{ width:"100%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"10px", padding:"9px 13px", color:"#fff", fontSize:"13px", fontFamily:"Inter,sans-serif", outline:"none", boxSizing:"border-box" }} />
            </div>
          ))}

          <div style={{ marginBottom:"12px" }}>
            <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:"5px" }}>API Format</div>
            <select value={cf.api_format} onChange={e => sc("api_format", e.target.value)}
              style={{ width:"100%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"10px", padding:"9px 13px", color:"#fff", fontSize:"13px", fontFamily:"Inter,sans-serif", outline:"none", cursor:"pointer" }}>
              <option value="openai">OpenAI-compatible (works with most providers)</option>
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="google">Google (Gemini)</option>
            </select>
          </div>

          <div style={{ marginBottom:"18px" }}>
            <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:"5px" }}>API Key</div>
            <input type="password" placeholder="Paste API key…" value={cf.api_key} onChange={e => sc("api_key", e.target.value)} autoComplete="off"
              style={{ width:"100%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"10px", padding:"9px 13px", color:"#fff", fontSize:"13px", fontFamily:"Inter,sans-serif", outline:"none", boxSizing:"border-box" }} />
          </div>

          {err && <div style={{ color:"#ef4444", fontSize:"12px", marginBottom:"12px" }}>{err}</div>}

          <div style={{ display:"flex", gap:"10px" }}>
            <button onClick={saveCustom} disabled={saving}
              style={{ background:"linear-gradient(135deg,#8b5cf6,#3b82f6)", border:"none", borderRadius:"10px", color:"#fff", fontSize:"13px", fontWeight:600, padding:"10px 22px", cursor:"pointer", fontFamily:"Inter,sans-serif", opacity:saving?0.5:1 }}>
              {saving ? "Adding…" : "Add Provider"}
            </button>
            <button onClick={() => setCustom(false)}
              style={{ background:"none", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"9px", color:"rgba(255,255,255,0.6)", fontSize:"12px", padding:"9px 16px", cursor:"pointer", fontFamily:"Inter,sans-serif" }}>
              Cancel
            </button>
          </div>
        </>)}
      </div>
    </div>
  );
}

// ── Provider Card ─────────────────────────────────────────────────
function ProviderCard({ p, total, onRefresh }) {
  const [editingKey, setEditingKey] = useState(false);
  const [keyVal,     setKeyVal]     = useState("");
  const [saving,     setSaving]     = useState(false);
  const [msg,        setMsg]        = useState("");
  const [confirmDel, setConfirmDel] = useState(false);
  const keyRef = useRef(null);
  const cat    = getCat(p.provider_id);

  const hasKey  = !!p.api_key?.trim();
  const isGood  = p.is_enabled && !p.is_paused && hasKey;
  const dotCol  = !p.is_enabled ? "#6b7280" : p.is_paused ? "#f59e0b" : !hasKey ? "#ef4444" : "#22c55e";
  const statusT = !p.is_enabled ? "Disabled" : p.is_paused ? "Paused" : !hasKey ? "No key" : "Active";

  function startEdit() {
    setEditingKey(true);
    setKeyVal("");
    setTimeout(() => keyRef.current?.focus(), 80);
  }

  async function saveKey() {
    if (!keyVal.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("ai_providers")
      .update({ api_key: keyVal.trim(), updated_at: new Date().toISOString() })
      .eq("provider_id", p.provider_id);
    setSaving(false);
    if (error) { setMsg("❌ Failed to save"); return; }
    setMsg("✓ Saved");
    setEditingKey(false);
    setKeyVal("");
    setTimeout(() => { setMsg(""); onRefresh(); }, 1500);
  }

  async function toggle(field, val) {
    await supabase
      .from("ai_providers")
      .update({ [field]: val, updated_at: new Date().toISOString() })
      .eq("provider_id", p.provider_id);
    onRefresh();
  }

  async function setPriority(newPriority) {
    if (newPriority < 1 || newPriority > total) return;
    // Shift other providers to make room
    const { data: others } = await supabase
      .from("ai_providers")
      .select("provider_id, priority")
      .neq("provider_id", p.provider_id)
      .order("priority", { ascending: true });

    if (others) {
      // Reorder: remove current, insert at new position
      const sorted = others.sort((a, b) => a.priority - b.priority);
      sorted.splice(newPriority - 1, 0, { provider_id: p.provider_id });
      // Update all priorities
      for (let i = 0; i < sorted.length; i++) {
        await supabase
          .from("ai_providers")
          .update({ priority: i + 1, updated_at: new Date().toISOString() })
          .eq("provider_id", sorted[i].provider_id);
      }
    }
    onRefresh();
  }

  async function del() {
    await supabase.from("ai_providers").delete().eq("provider_id", p.provider_id);
    onRefresh();
  }

  return (
    <div style={{
      background:   isGood ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.02)",
      border:       `1px solid ${isGood ? "rgba(255,255,255,0.09)" : hasKey ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)"}`,
      borderRadius: "16px",
      padding:      "20px",
      marginBottom: "10px",
      opacity:      p.is_enabled ? 1 : 0.6,
      transition:   "all 0.2s",
    }}>
      <div style={{ display:"flex", gap:"14px", alignItems:"flex-start" }}>

        {/* Priority badge + logo */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"8px", flexShrink:0 }}>
          <div style={{ width:"32px", height:"32px", borderRadius:"8px", background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"13px", color:"#a78bfa" }}>
            {p.priority}
          </div>
          <div style={{ fontSize:"22px", lineHeight:1, position:"relative" }}>
            {cat?.logo || "🤖"}
            <span style={{ position:"absolute", bottom:-2, right:-2, width:"9px", height:"9px", borderRadius:"50%", backgroundColor:dotCol, border:"2px solid #09090f", boxShadow:`0 0 5px ${dotCol}` }} />
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex:1, minWidth:0 }}>
          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap", marginBottom:"6px" }}>
            <span style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"15px", color:"#fff" }}>{p.name}</span>
            {cat?.badge && (
              <span style={{ fontSize:"9px", fontWeight:700, background:`${cat.bc}22`, color:cat.bc, border:`1px solid ${cat.bc}44`, borderRadius:"4px", padding:"2px 6px" }}>
                {cat.badge}
              </span>
            )}
            <span style={{ fontSize:"11px", color:dotCol, fontWeight:600 }}>{statusT}</span>
          </div>

          {/* Model + format */}
          <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", fontFamily:"monospace", marginBottom:"12px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {p.model} · {p.api_format?.toUpperCase()}
          </div>

          {/* API Key section */}
          {!editingKey ? (
            <div style={{ display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                <span style={{ width:"8px", height:"8px", borderRadius:"50%", backgroundColor:hasKey?"#22c55e":"#ef4444", display:"inline-block" }} />
                <span style={{ fontSize:"12px", color:hasKey?"rgba(255,255,255,0.6)":"#ef4444" }}>
                  {hasKey ? `API key saved (${p.api_key.length} chars)` : "No API key — provider inactive"}
                </span>
              </div>
              <button onClick={startEdit} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"7px", color:"rgba(255,255,255,0.6)", fontSize:"11px", padding:"4px 10px", cursor:"pointer", fontFamily:"Inter,sans-serif" }}>
                {hasKey ? "Update key" : "Add key"}
              </button>
              {msg && <span style={{ fontSize:"11px", color: msg.startsWith("✓") ? "#22c55e" : "#ef4444" }}>{msg}</span>}
            </div>
          ) : (
            <div style={{ marginTop:"4px" }}>
              <div style={{ display:"flex", gap:"8px", marginBottom:"6px" }}>
                <input
                  ref={keyRef}
                  type="password"
                  placeholder={`Paste your ${p.name} API key here…`}
                  value={keyVal}
                  onChange={e => setKeyVal(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") saveKey(); if (e.key === "Escape") { setEditingKey(false); setKeyVal(""); } }}
                  autoComplete="off"
                  style={{ flex:1, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(139,92,246,0.4)", borderRadius:"9px", padding:"9px 13px", color:"#fff", fontSize:"13px", fontFamily:"Inter,sans-serif", outline:"none" }}
                />
                <button onClick={saveKey} disabled={saving || !keyVal.trim()}
                  style={{ background:"linear-gradient(135deg,#8b5cf6,#3b82f6)", border:"none", borderRadius:"9px", color:"#fff", fontSize:"12px", fontWeight:600, padding:"0 16px", cursor:"pointer", fontFamily:"Inter,sans-serif", opacity:saving||!keyVal.trim()?0.5:1, whiteSpace:"nowrap" }}>
                  {saving ? "Saving…" : "Save Key"}
                </button>
                <button onClick={() => { setEditingKey(false); setKeyVal(""); }}
                  style={{ background:"none", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"9px", color:"rgba(255,255,255,0.5)", fontSize:"12px", padding:"0 12px", cursor:"pointer", fontFamily:"Inter,sans-serif" }}>
                  Cancel
                </button>
              </div>
              {cat?.hint && (
                <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)" }}>{cat.hint}</div>
              )}
              {msg && <div style={{ fontSize:"11px", color: msg.startsWith("✓") ? "#22c55e" : "#ef4444", marginTop:"4px" }}>{msg}</div>}
            </div>
          )}
        </div>

        {/* Controls column */}
        <div style={{ display:"flex", flexDirection:"column", gap:"6px", alignItems:"flex-end", flexShrink:0 }}>
          {/* Priority controls */}
          <div style={{ display:"flex", gap:"4px", marginBottom:"4px" }}>
            <button
              onClick={() => setPriority(p.priority - 1)}
              disabled={p.priority <= 1}
              title="Move up — higher priority"
              style={{ width:"30px", height:"30px", background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.25)", borderRadius:"8px", color:"#a78bfa", fontSize:"14px", cursor:p.priority<=1?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity:p.priority<=1?0.3:1 }}>
              ↑
            </button>
            <button
              onClick={() => setPriority(p.priority + 1)}
              disabled={p.priority >= total}
              title="Move down — lower priority"
              style={{ width:"30px", height:"30px", background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.25)", borderRadius:"8px", color:"#a78bfa", fontSize:"14px", cursor:p.priority>=total?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity:p.priority>=total?0.3:1 }}>
              ↓
            </button>
          </div>

          {/* Pause / Resume */}
          {p.is_enabled && (
            <button
              onClick={() => toggle("is_paused", !p.is_paused)}
              style={{ background:"none", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"8px", color:"rgba(255,255,255,0.6)", fontSize:"11px", padding:"5px 12px", cursor:"pointer", fontFamily:"Inter,sans-serif", whiteSpace:"nowrap" }}>
              {p.is_paused ? "▶ Resume" : "⏸ Pause"}
            </button>
          )}

          {/* Enable / Disable */}
          <button
            onClick={() => toggle("is_enabled", !p.is_enabled)}
            style={{ background:"none", border:`1px solid ${p.is_enabled?"rgba(255,255,255,0.12)":"rgba(139,92,246,0.3)"}`, borderRadius:"8px", color:p.is_enabled?"rgba(255,255,255,0.6)":"#a78bfa", fontSize:"11px", padding:"5px 12px", cursor:"pointer", fontFamily:"Inter,sans-serif", whiteSpace:"nowrap" }}>
            {p.is_enabled ? "Disable" : "Enable"}
          </button>

          {/* Delete */}
          {confirmDel ? (
            <div style={{ display:"flex", gap:"4px" }}>
              <button onClick={del} style={{ background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:"8px", color:"#ef4444", fontSize:"11px", padding:"5px 10px", cursor:"pointer", fontFamily:"Inter,sans-serif", whiteSpace:"nowrap" }}>
                Confirm
              </button>
              <button onClick={() => setConfirmDel(false)} style={{ background:"none", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", color:"rgba(255,255,255,0.4)", fontSize:"11px", padding:"5px 8px", cursor:"pointer", fontFamily:"Inter,sans-serif" }}>
                ×
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDel(true)} style={{ background:"none", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"8px", color:"rgba(239,68,68,0.7)", fontSize:"11px", padding:"5px 12px", cursor:"pointer", fontFamily:"Inter,sans-serif", whiteSpace:"nowrap" }}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────
export default function Admin() {
  const navigate  = useNavigate();
  const [checking,  setChecking]  = useState(true);
  const [isAdmin,   setIsAdmin]   = useState(false);
  const [providers, setProviders] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showAdd,   setShowAdd]   = useState(false);

  // ── Auth check ─────────────────────────────────────────────────
  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/signin"); return; }
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("is_admin")
        .eq("user_id", user.id)
        .single();
      if (!profile?.is_admin) { navigate("/dashboard"); return; }
      setIsAdmin(true);
      setChecking(false);
    }
    check();
  }, [navigate]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("ai_providers")
      .select("*")
      .order("priority", { ascending: true });
    setProviders(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { if (isAdmin) refresh(); }, [isAdmin, refresh]);

  if (checking) return (
    <div style={{ minHeight:"100vh", background:"#09090f", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"14px", fontFamily:"Inter,sans-serif" }}>Checking access…</div>
    </div>
  );

  if (!isAdmin) return null;

  const active  = providers.filter(p => p.is_enabled && !p.is_paused && p.api_key?.trim()).length;
  const noKey   = providers.filter(p => !p.api_key?.trim()).length;
  const paused  = providers.filter(p => p.is_paused).length;

  return (
    <div style={{ minHeight:"100vh", background:"#09090f", color:"#f8f8ff", fontFamily:"Inter,sans-serif" }}>

      {/* Top bar */}
      <div style={{ borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"0 32px", height:"60px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(9,9,15,0.9)", backdropFilter:"blur(16px)", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"18px", background:"linear-gradient(135deg,#8b5cf6,#3b82f6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
            Mindoo
          </div>
          <div style={{ width:"1px", height:"20px", background:"rgba(255,255,255,0.12)" }} />
          <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"14px", color:"#fff" }}>Admin Panel</div>
          <span style={{ fontSize:"9px", fontWeight:700, background:"rgba(139,92,246,0.2)", color:"#a78bfa", border:"1px solid rgba(139,92,246,0.35)", borderRadius:"6px", padding:"2px 8px", letterSpacing:"0.08em" }}>
            ADMIN ONLY
          </span>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"9px", color:"rgba(255,255,255,0.6)", fontSize:"12px", padding:"7px 14px", cursor:"pointer", fontFamily:"Inter,sans-serif" }}>
          ← Back to app
        </button>
      </div>

      <div style={{ maxWidth:"920px", margin:"0 auto", padding:"32px 24px" }}>

        {/* Page header */}
        <div style={{ marginBottom:"32px" }}>
          <h1 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"26px", color:"#fff", margin:"0 0 6px", letterSpacing:"-0.03em" }}>
            AI Provider Management
          </h1>
          <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"13px", margin:0, lineHeight:1.6 }}>
            Add API keys here once — all users benefit immediately. Keys are stored securely in Supabase and never exposed to users.
            Use ↑ ↓ to set the global fallback priority order.
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px", marginBottom:"28px" }}>
          {[
            { v:providers.length, l:"Total providers",   c:"rgba(255,255,255,0.8)", icon:"🤖" },
            { v:active,           l:"Active with key",   c:"#22c55e",               icon:"✅" },
            { v:paused,           l:"Paused",            c:paused>0?"#f59e0b":"rgba(255,255,255,0.4)", icon:"⏸" },
            { v:noKey,            l:"Missing API key",   c:noKey>0?"#ef4444":"rgba(255,255,255,0.4)", icon:"🔑" },
          ].map(({ v, l, c, icon }) => (
            <div key={l} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"14px", padding:"16px", textAlign:"center" }}>
              <div style={{ fontSize:"20px", marginBottom:"6px" }}>{icon}</div>
              <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"26px", color:c, lineHeight:1 }}>{v}</div>
              <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)", marginTop:"4px" }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Fallback chain visual */}
        {providers.filter(p => p.is_enabled && !p.is_paused && p.api_key?.trim()).length > 0 && (
          <div style={{ background:"rgba(139,92,246,0.05)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:"14px", padding:"16px 20px", marginBottom:"24px" }}>
            <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"11px", color:"#a78bfa", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"12px" }}>
              Active Failover Chain
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
              {providers
                .filter(p => p.is_enabled && !p.is_paused && p.api_key?.trim())
                .sort((a, b) => a.priority - b.priority)
                .map((p, idx, arr) => {
                  const cat = getCat(p.provider_id);
                  return (
                    <div key={p.provider_id} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"6px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", padding:"5px 10px" }}>
                        <span style={{ fontSize:"14px" }}>{cat?.logo || "🤖"}</span>
                        <span style={{ fontSize:"12px", fontWeight:600, color:"#fff" }}>{p.name}</span>
                      </div>
                      {idx < arr.length - 1 && (
                        <span style={{ color:"rgba(255,255,255,0.25)", fontSize:"12px" }}>→</span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Add button */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
          <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"15px", color:"#fff" }}>
            Providers ({providers.length})
          </div>
          <button
            onClick={() => setShowAdd(true)}
            style={{ background:"linear-gradient(135deg,#8b5cf6,#3b82f6)", border:"none", borderRadius:"10px", color:"#fff", fontSize:"13px", fontWeight:600, padding:"10px 22px", cursor:"pointer", fontFamily:"Inter,sans-serif" }}>
            + Add Provider
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:"center", color:"rgba(255,255,255,0.3)", padding:"48px 0", fontSize:"13px" }}>
            Loading providers…
          </div>
        )}

        {/* Empty state */}
        {!loading && providers.length === 0 && (
          <div style={{ background:"rgba(255,255,255,0.02)", border:"1px dashed rgba(255,255,255,0.1)", borderRadius:"16px", padding:"48px", textAlign:"center" }}>
            <div style={{ fontSize:"40px", marginBottom:"12px" }}>🚀</div>
            <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"16px", color:"#fff", marginBottom:"8px" }}>
              No providers yet
            </div>
            <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)", marginBottom:"20px", lineHeight:1.6 }}>
              Add Groq first — it's free, takes 30 seconds, and gives you instant AI in the chat.
            </div>
            <button onClick={() => setShowAdd(true)}
              style={{ background:"linear-gradient(135deg,#8b5cf6,#3b82f6)", border:"none", borderRadius:"10px", color:"#fff", fontSize:"13px", fontWeight:600, padding:"10px 22px", cursor:"pointer", fontFamily:"Inter,sans-serif" }}>
              + Add First Provider
            </button>
          </div>
        )}

        {/* Provider list */}
        {!loading && providers.map(p => (
          <ProviderCard key={p.id} p={p} total={providers.length} onRefresh={refresh} />
        ))}

        {/* How it works */}
        {providers.length > 0 && (
          <div style={{ background:"rgba(59,130,246,0.04)", border:"1px solid rgba(59,130,246,0.12)", borderRadius:"14px", padding:"16px 20px", marginTop:"24px" }}>
            <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"11px", color:"#60a5fa", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"10px" }}>
              How the failover system works
            </div>
            <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.45)", lineHeight:1.75 }}>
              When a user sends a message, Mindoo tries providers in priority order — #1 first. If that provider is rate-limited, unavailable, or errors,
              it automatically moves to #2, then #3, and so on. Users never see the failure — the switch is seamless.
              Each user can also set their own priority order in their AI Settings. Daily quotas reset at midnight.
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <AddModal
          existingIds={providers.map(p => p.provider_id)}
          onSave={refresh}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
