// src/pages/sections/AIProviders.jsx
// ─────────────────────────────────────────────────────────────────
// AI Provider Control Panel
// Simple: pick a provider → paste API key → done.
// All styles defined at module level (outside components) so
// inputs never lose focus on re-render.
// ─────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from "react";
import {
  getProviderStatus,
  saveProviderKey,
  toggleProvider,
  updateProviderPriority,
  addCustomProvider,
  deleteProvider,
  resetProviderQuota,
  resetAllQuotas,
  invalidateProviderCache,
} from "../../services/ai";

// ═══════════════════════════════════════════════════════════════
// PROVIDER CATALOGUE — everything pre-filled
// User only needs to paste their API key
// ═══════════════════════════════════════════════════════════════
const CATALOGUE = [
  {
    provider_id: "groq",
    name:        "Groq",
    company:     "Groq",
    logo:        "⚡",
    tagline:     "Fastest free AI — best place to start",
    badge:       "FREE",
    badgeColor:  "#22c55e",
    keyHint:     "Starts with gsk_...",
    keyLink:     "https://console.groq.com",
    base_url:    "https://api.groq.com/openai/v1/chat/completions",
    model:       "llama-3.3-70b-versatile",
    api_format:  "openai",
    priority:    1,
    max_requests_per_minute: 30,
    max_requests_per_day:    14400,
    max_tokens_per_request:  8000,
    cooldown_on_rate_limit:  62,
    cooldown_on_error:       15,
    notes:       "Free tier — fast llama model.",
  },
  {
    provider_id: "gemini",
    name:        "Gemini",
    company:     "Google",
    logo:        "🌐",
    tagline:     "Google's AI — free and very capable",
    badge:       "FREE",
    badgeColor:  "#22c55e",
    keyHint:     "Starts with AIza...",
    keyLink:     "https://aistudio.google.com",
    base_url:    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    model:       "gemini-2.0-flash",
    api_format:  "google",
    priority:    2,
    max_requests_per_minute: 15,
    max_requests_per_day:    1500,
    max_tokens_per_request:  8000,
    cooldown_on_rate_limit:  65,
    cooldown_on_error:       15,
    notes:       "Google Gemini — free tier.",
  },
  {
    provider_id: "openrouter",
    name:        "OpenRouter",
    company:     "OpenRouter",
    logo:        "🔀",
    tagline:     "Access many models with one key — free tier",
    badge:       "FREE",
    badgeColor:  "#22c55e",
    keyHint:     "Starts with sk-or-...",
    keyLink:     "https://openrouter.ai",
    base_url:    "https://openrouter.ai/api/v1/chat/completions",
    model:       "meta-llama/llama-3.3-70b-instruct:free",
    api_format:  "openai",
    priority:    3,
    max_requests_per_minute: 20,
    max_requests_per_day:    200,
    max_tokens_per_request:  8000,
    cooldown_on_rate_limit:  65,
    cooldown_on_error:       20,
    notes:       "Free tier — many models via one key.",
  },
  {
    provider_id: "glm",
    name:        "GLM (Zhipu AI)",
    company:     "Zhipu AI",
    logo:        "🤖",
    tagline:     "Chinese LLM — free flash tier",
    badge:       "FREE",
    badgeColor:  "#22c55e",
    keyHint:     "Get it at bigmodel.cn",
    keyLink:     "https://bigmodel.cn",
    base_url:    "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    model:       "glm-4-flash",
    api_format:  "openai",
    priority:    4,
    max_requests_per_minute: 60,
    max_requests_per_day:    1000,
    max_tokens_per_request:  8000,
    cooldown_on_rate_limit:  62,
    cooldown_on_error:       15,
    notes:       "GLM-4-Flash — completely free.",
  },
  {
    provider_id: "deepseek",
    name:        "DeepSeek",
    company:     "DeepSeek",
    logo:        "🔍",
    tagline:     "Incredibly cheap, strong reasoning",
    badge:       "CHEAP",
    badgeColor:  "#60a5fa",
    keyHint:     "Get it at platform.deepseek.com",
    keyLink:     "https://platform.deepseek.com",
    base_url:    "https://api.deepseek.com/v1/chat/completions",
    model:       "deepseek-chat",
    api_format:  "openai",
    priority:    5,
    max_requests_per_minute: 60,
    max_requests_per_day:    1000,
    max_tokens_per_request:  32000,
    cooldown_on_rate_limit:  62,
    cooldown_on_error:       15,
    notes:       "Very affordable — ~$0.001 per message.",
  },
  {
    provider_id: "openai",
    name:        "ChatGPT (GPT-4o)",
    company:     "OpenAI",
    logo:        "💬",
    tagline:     "The original — GPT-4o mini is affordable",
    badge:       "PAID",
    badgeColor:  "#a78bfa",
    keyHint:     "Starts with sk-...",
    keyLink:     "https://platform.openai.com",
    base_url:    "https://api.openai.com/v1/chat/completions",
    model:       "gpt-4o-mini",
    api_format:  "openai",
    priority:    6,
    max_requests_per_minute: 60,
    max_requests_per_day:    1000,
    max_tokens_per_request:  16000,
    cooldown_on_rate_limit:  62,
    cooldown_on_error:       15,
    notes:       "GPT-4o-mini is the most affordable OpenAI option.",
  },
  {
    provider_id: "anthropic",
    name:        "Claude (Anthropic)",
    company:     "Anthropic",
    logo:        "🧠",
    tagline:     "Highest quality reasoning",
    badge:       "PAID",
    badgeColor:  "#a78bfa",
    keyHint:     "Starts with sk-ant-...",
    keyLink:     "https://console.anthropic.com",
    base_url:    "https://api.anthropic.com/v1/messages",
    model:       "claude-haiku-4-5-20251001",
    api_format:  "anthropic",
    priority:    7,
    max_requests_per_minute: 60,
    max_requests_per_day:    1000,
    max_tokens_per_request:  8000,
    cooldown_on_rate_limit:  62,
    cooldown_on_error:       15,
    notes:       "⚠️ Blocked by browser CORS — needs server proxy.",
  },
  {
    provider_id: "mistral",
    name:        "Mistral",
    company:     "Mistral AI",
    logo:        "💨",
    tagline:     "European AI — fast and efficient",
    badge:       "PAID",
    badgeColor:  "#a78bfa",
    keyHint:     "Get it at console.mistral.ai",
    keyLink:     "https://console.mistral.ai",
    base_url:    "https://api.mistral.ai/v1/chat/completions",
    model:       "mistral-small-latest",
    api_format:  "openai",
    priority:    8,
    max_requests_per_minute: 60,
    max_requests_per_day:    1000,
    max_tokens_per_request:  32000,
    cooldown_on_rate_limit:  62,
    cooldown_on_error:       15,
    notes:       "Mistral Small — efficient European model.",
  },
  {
    provider_id: "qwen",
    name:        "Qwen (Alibaba)",
    company:     "Alibaba",
    logo:        "🔮",
    tagline:     "Strong multilingual model",
    badge:       "PAID",
    badgeColor:  "#a78bfa",
    keyHint:     "Get it at dashscope.aliyun.com",
    keyLink:     "https://dashscope.aliyun.com",
    base_url:    "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    model:       "qwen-plus",
    api_format:  "openai",
    priority:    9,
    max_requests_per_minute: 60,
    max_requests_per_day:    1000,
    max_tokens_per_request:  30000,
    cooldown_on_rate_limit:  62,
    cooldown_on_error:       15,
    notes:       "Alibaba Qwen — strong multilingual.",
  },
];

// ═══════════════════════════════════════════════════════════════
// STYLES — defined at module level so they never cause re-renders
// ═══════════════════════════════════════════════════════════════
const page    = { padding: "28px", maxWidth: "860px", margin: "0 auto" };
const card    = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "18px 20px", marginBottom: "12px" };
const row     = { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" };
const lbl     = { fontSize: "11px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "4px" };
const inp     = { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px", padding: "10px 14px", color: "#fff", fontSize: "13px", fontFamily: "Inter,sans-serif", outline: "none", boxSizing: "border-box" };
const btnG    = { background: "none", border: "1px solid rgba(255,255,255,0.14)", borderRadius: "8px", color: "rgba(255,255,255,0.6)", fontSize: "12px", padding: "6px 14px", cursor: "pointer", fontFamily: "Inter,sans-serif", whiteSpace: "nowrap" };
const btnP    = { background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: 600, padding: "10px 22px", cursor: "pointer", fontFamily: "Inter,sans-serif", whiteSpace: "nowrap" };
const btnD    = { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#ef4444", fontSize: "12px", padding: "6px 14px", cursor: "pointer", fontFamily: "Inter,sans-serif", whiteSpace: "nowrap" };

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
function dotColor(p) {
  if (!p.isEnabled || !p.hasKey) return "#ef4444";
  if (p.isPaused || p.coolingDown || !p.available) return "#f59e0b";
  if (p.quotaPercent > 80) return "#f59e0b";
  return "#22c55e";
}
function statusLabel(p) {
  if (!p.isEnabled)        return "Disabled";
  if (p.isPaused)          return "Paused";
  if (!p.hasKey)           return "No API key";
  if (p.coolingDown)       return `Cooldown ${p.cooldownSecsLeft}s`;
  if (!p.available)        return p.unavailableReason || "Unavailable";
  if (p.quotaPercent > 80) return `Quota ${p.quotaPercent}%`;
  return "Active";
}
function getCat(pid) {
  return CATALOGUE.find(c => c.provider_id === pid);
}

// ═══════════════════════════════════════════════════════════════
// ADD PROVIDER MODAL
// ═══════════════════════════════════════════════════════════════
function AddModal({ userId, existingIds, onSave, onClose }) {
  const [selected,   setSelected]   = useState(null);
  const [apiKey,     setApiKey]     = useState("");
  const [saving,     setSaving]     = useState(false);
  const [err,        setErr]        = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [custom,     setCustom]     = useState({
    provider_id: "", name: "", base_url: "", model: "",
    api_format: "openai", api_key: "", priority: 20,
    max_requests_per_minute: 30, max_requests_per_day: 1000,
    max_tokens_per_request: 4000,
    cooldown_on_rate_limit: 62, cooldown_on_error: 15, notes: "",
  });

  const keyRef = useRef(null);
  const available = CATALOGUE.filter(c => !existingIds.includes(c.provider_id));

  function pickProvider(cat) {
    setSelected(cat);
    setApiKey("");
    setErr("");
    setTimeout(() => keyRef.current?.focus(), 80);
  }

  async function handleSave() {
    if (!selected)       { setErr("Please select a provider first."); return; }
    if (!apiKey.trim())  { setErr("Please paste your API key."); return; }
    setSaving(true);
    setErr("");
    const record = {
      provider_id: selected.provider_id,
      name:        selected.name,
      company:     selected.company,
      base_url:    selected.base_url,
      model:       selected.model,
      api_format:  selected.api_format,
      priority:    selected.priority,
      max_requests_per_minute: selected.max_requests_per_minute,
      max_requests_per_day:    selected.max_requests_per_day,
      max_tokens_per_request:  selected.max_tokens_per_request,
      cooldown_on_rate_limit:  selected.cooldown_on_rate_limit,
      cooldown_on_error:       selected.cooldown_on_error,
      notes:       selected.notes,
      api_key:     apiKey.trim(),
      is_enabled:  true,
      is_paused:   false,
    };
    const { error } = await addCustomProvider(record, userId);
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onSave();
    onClose();
  }

  async function handleSaveCustom() {
    if (!custom.provider_id || !custom.name || !custom.base_url || !custom.model) {
      setErr("ID, name, URL and model are all required."); return;
    }
    setSaving(true);
    const { error } = await addCustomProvider({ ...custom, is_enabled: true, is_paused: false }, userId);
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onSave();
    onClose();
  }

  function setC(k, v) { setCustom(prev => ({ ...prev, [k]: v })); }

  // Modal overlay style — defined inline here is fine since modal only mounts once
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, padding:"20px" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background:"#0f0f1a", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"20px", padding:"28px", width:"100%", maxWidth:"560px", maxHeight:"90vh", overflowY:"auto", position:"relative" }}
      >
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
          <div>
            <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"18px", color:"#fff" }}>Add AI Provider</div>
            <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)", marginTop:"3px" }}>
              Pick a provider and paste your API key — that's all you need
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:"22px", cursor:"pointer", lineHeight:1, padding:"4px 8px" }}>×</button>
        </div>

        {!showCustom ? (
          <>
            {/* Provider grid */}
            <div style={{ marginBottom:"20px" }}>
              <div style={lbl}>Choose a provider</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginTop:"8px" }}>
                {available.length === 0 && (
                  <div style={{ gridColumn:"1/-1", textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:"13px", padding:"20px" }}>
                    All known providers are already added.
                  </div>
                )}
                {available.map(cat => (
                  <div
                    key={cat.provider_id}
                    onClick={() => pickProvider(cat)}
                    style={{
                      background:   selected?.provider_id === cat.provider_id ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
                      border:       `1px solid ${selected?.provider_id === cat.provider_id ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
                      borderRadius: "12px", padding:"12px 14px", cursor:"pointer", transition:"all 0.15s",
                    }}
                  >
                    <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"4px" }}>
                      <span style={{ fontSize:"18px" }}>{cat.logo}</span>
                      <span style={{ fontWeight:600, fontSize:"13px", color:"#fff" }}>{cat.name}</span>
                      <span style={{ fontSize:"9px", fontWeight:700, background:`${cat.badgeColor}22`, color:cat.badgeColor, border:`1px solid ${cat.badgeColor}44`, borderRadius:"4px", padding:"1px 5px", marginLeft:"auto" }}>
                        {cat.badge}
                      </span>
                    </div>
                    <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)" }}>{cat.tagline}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* API Key input */}
            {selected && (
              <div style={{ marginBottom:"20px" }}>
                <div style={lbl}>Your API key for {selected.name}</div>
                <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)", marginBottom:"8px" }}>
                  {selected.keyHint} —{" "}
                  <a href={selected.keyLink} target="_blank" rel="noopener noreferrer" style={{ color:"#a78bfa", textDecoration:"none" }}>
                    Get it here →
                  </a>
                </div>
                <input
                  ref={keyRef}
                  type="password"
                  style={inp}
                  placeholder="Paste your API key here…"
                  value={apiKey}
                  onChange={e => { setApiKey(e.target.value); setErr(""); }}
                  onKeyDown={e => e.key === "Enter" && handleSave()}
                  autoComplete="off"
                />
                {selected.provider_id === "anthropic" && (
                  <div style={{ fontSize:"11px", color:"#f59e0b", marginTop:"8px", background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:"8px", padding:"8px 12px" }}>
                    ⚠️ Claude blocks direct browser calls. The key will be saved but won't work until a server proxy is added.
                  </div>
                )}
              </div>
            )}

            {err && <div style={{ color:"#ef4444", fontSize:"12px", marginBottom:"12px" }}>{err}</div>}

            <div style={{ display:"flex", gap:"10px", alignItems:"center", flexWrap:"wrap" }}>
              {selected && (
                <button style={btnP} onClick={handleSave} disabled={saving || !apiKey.trim()}>
                  {saving ? "Saving…" : `Add ${selected.name}`}
                </button>
              )}
              <button style={btnG} onClick={onClose}>Cancel</button>
              <button style={{ ...btnG, marginLeft:"auto", fontSize:"11px" }} onClick={() => { setShowCustom(true); setErr(""); }}>
                + Custom provider
              </button>
            </div>
          </>
        ) : (
          /* Custom provider form */
          <>
            <button onClick={() => setShowCustom(false)} style={{ background:"none", border:"none", color:"#a78bfa", cursor:"pointer", fontSize:"13px", padding:0, marginBottom:"16px", display:"block" }}>
              ← Back to catalogue
            </button>
            <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.45)", marginBottom:"16px", lineHeight:1.6 }}>
              Add any OpenAI-compatible API. You need the endpoint URL and model name from the provider's documentation.
            </div>

            {[
              { label:"Provider ID (unique, no spaces)", k:"provider_id", ph:"e.g. my_provider" },
              { label:"Display Name",                    k:"name",        ph:"e.g. My Provider" },
              { label:"API Endpoint URL",                k:"base_url",    ph:"https://api.example.com/v1/chat/completions" },
              { label:"Model Name",                      k:"model",       ph:"e.g. llama-3-70b" },
            ].map(({ label, k, ph }) => (
              <div key={k} style={{ marginBottom:"12px" }}>
                <div style={lbl}>{label}</div>
                <input type="text" style={inp} placeholder={ph}
                  value={custom[k]}
                  onChange={e => setC(k, e.target.value)}
                  autoComplete="off"
                />
              </div>
            ))}

            <div style={{ marginBottom:"12px" }}>
              <div style={lbl}>API Format</div>
              <select style={{ ...inp, cursor:"pointer" }} value={custom.api_format} onChange={e => setC("api_format", e.target.value)}>
                <option value="openai">OpenAI-compatible (works with most providers)</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="google">Google (Gemini)</option>
              </select>
            </div>

            <div style={{ marginBottom:"16px" }}>
              <div style={lbl}>API Key (optional — add later)</div>
              <input type="password" style={inp} placeholder="Paste API key…"
                value={custom.api_key}
                onChange={e => setC("api_key", e.target.value)}
                autoComplete="off"
              />
            </div>

            {err && <div style={{ color:"#ef4444", fontSize:"12px", marginBottom:"12px" }}>{err}</div>}

            <div style={{ display:"flex", gap:"10px" }}>
              <button style={btnP} onClick={handleSaveCustom} disabled={saving}>
                {saving ? "Adding…" : "Add Custom Provider"}
              </button>
              <button style={btnG} onClick={() => setShowCustom(false)}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PROVIDER CARD
// ═══════════════════════════════════════════════════════════════
function ProviderCard({ p, userId, onRefresh }) {
  const [editing,    setEditing]    = useState(false);
  const [keyInput,   setKeyInput]   = useState("");
  const [saving,     setSaving]     = useState(false);
  const [msg,        setMsg]        = useState("");
  const [confirmDel, setConfirmDel] = useState(false);
  const keyRef = useRef(null);

  const cat    = getCat(p.providerId);
  const color  = dotColor(p);
  const status = statusLabel(p);

  function startEdit() {
    setEditing(true);
    setKeyInput("");
    setTimeout(() => keyRef.current?.focus(), 80);
  }

  async function handleSaveKey() {
    if (!keyInput.trim()) return;
    setSaving(true);
    const { error } = await saveProviderKey(p.providerId, keyInput.trim(), userId);
    setSaving(false);
    if (error) { setMsg("Failed — try again"); return; }
    setMsg("Saved ✓");
    setEditing(false);
    setKeyInput("");
    setTimeout(() => setMsg(""), 2000);
    onRefresh();
  }

  async function handleToggle(field, value) {
    await toggleProvider(p.id, field, value, userId);
    onRefresh();
  }

  async function handlePriority(delta) {
    await updateProviderPriority(p.id, Math.max(1, p.priority + delta), userId);
    onRefresh();
  }

  async function handleDelete() {
    await deleteProvider(p.id, userId);
    onRefresh();
  }

  function handleReset() {
    resetProviderQuota(p.providerId);
    setMsg("Reset ✓");
    setTimeout(() => { setMsg(""); onRefresh(); }, 800);
  }

  return (
    <div style={{ ...card, opacity: p.isEnabled ? 1 : 0.5, borderColor: p.hasKey && p.available ? "rgba(255,255,255,0.08)" : "rgba(239,68,68,0.15)" }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:"14px" }}>

        {/* Logo + dot */}
        <div style={{ position:"relative", flexShrink:0 }}>
          <div style={{ fontSize:"28px", lineHeight:1 }}>{cat?.logo || "🤖"}</div>
          <span style={{ position:"absolute", bottom:-2, right:-2, width:"10px", height:"10px", borderRadius:"50%", backgroundColor:color, border:"2px solid #09090f", boxShadow:`0 0 6px ${color}` }} />
        </div>

        {/* Info */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ ...row, marginBottom:"4px" }}>
            <span style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"15px", color:"#fff" }}>{p.name}</span>
            {cat?.badge && (
              <span style={{ fontSize:"9px", fontWeight:700, background:`${cat.badgeColor}22`, color:cat.badgeColor, border:`1px solid ${cat.badgeColor}44`, borderRadius:"4px", padding:"1px 6px" }}>
                {cat.badge}
              </span>
            )}
            <span style={{ fontSize:"11px", color, fontWeight:600 }}>{status}</span>
            <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.2)", marginLeft:"auto" }}>Priority #{p.priority}</span>
          </div>

          <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", marginBottom:"8px" }}>{p.model}</div>

          {/* Quota bar */}
          {p.hasKey && (
            <div style={{ marginBottom:"10px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"10px", color:"rgba(255,255,255,0.25)", marginBottom:"4px" }}>
                <span>Today: {p.requestsToday} / {p.maxPerDay} requests</span>
                <span>Success: {p.successRate}%</span>
              </div>
              <div style={{ height:"3px", borderRadius:"2px", background:"rgba(255,255,255,0.06)" }}>
                <div style={{ height:"100%", borderRadius:"2px", width:`${p.quotaPercent}%`, background: p.quotaPercent > 80 ? "#f59e0b" : "#22c55e", transition:"width 0.4s" }} />
              </div>
            </div>
          )}

          {/* Key section */}
          {!editing ? (
            <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
              <div style={{ fontSize:"12px", color: p.hasKey ? "#22c55e" : "#ef4444" }}>
                {p.hasKey ? "● API key saved" : "● No API key — add one to activate"}
              </div>
              <button style={{ ...btnG, fontSize:"11px", padding:"4px 10px" }} onClick={startEdit}>
                {p.hasKey ? "Update key" : "Add key"}
              </button>
              {msg && <span style={{ fontSize:"11px", color:"#22c55e" }}>{msg}</span>}
            </div>
          ) : (
            <div>
              {cat?.keyHint && (
                <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", marginBottom:"6px" }}>
                  {cat.keyHint}
                  {cat.keyLink && (
                    <a href={cat.keyLink} target="_blank" rel="noopener noreferrer" style={{ color:"#a78bfa", marginLeft:"6px", textDecoration:"none" }}>
                      Get key →
                    </a>
                  )}
                </div>
              )}
              <div style={{ display:"flex", gap:"8px" }}>
                <input
                  ref={keyRef}
                  type="password"
                  style={{ ...inp, flex:1 }}
                  placeholder="Paste your API key here…"
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter")  handleSaveKey();
                    if (e.key === "Escape") { setEditing(false); setKeyInput(""); }
                  }}
                  autoComplete="off"
                />
                <button style={btnP} onClick={handleSaveKey} disabled={saving || !keyInput.trim()}>
                  {saving ? "Saving…" : "Save"}
                </button>
                <button style={btnG} onClick={() => { setEditing(false); setKeyInput(""); }}>Cancel</button>
              </div>
              {msg && <div style={{ fontSize:"11px", color:"#22c55e", marginTop:"6px" }}>{msg}</div>}
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ display:"flex", flexDirection:"column", gap:"6px", alignItems:"flex-end", flexShrink:0 }}>
          <div style={{ display:"flex", gap:"4px" }}>
            <button style={{ ...btnG, padding:"4px 9px" }} onClick={() => handlePriority(-1)} title="Higher priority">↑</button>
            <button style={{ ...btnG, padding:"4px 9px" }} onClick={() => handlePriority(1)}  title="Lower priority">↓</button>
          </div>
          {p.isEnabled && (
            <button style={btnG} onClick={() => handleToggle("is_paused", !p.isPaused)}>
              {p.isPaused ? "Resume" : "Pause"}
            </button>
          )}
          <button style={btnG} onClick={() => handleToggle("is_enabled", !p.isEnabled)}>
            {p.isEnabled ? "Disable" : "Enable"}
          </button>
          {(p.coolingDown || p.consecutiveErrors > 0) && (
            <button style={btnG} onClick={handleReset}>Reset</button>
          )}
          {confirmDel ? (
            <div style={{ display:"flex", gap:"4px" }}>
              <button style={{ ...btnD, padding:"4px 8px", fontSize:"11px" }} onClick={handleDelete}>Confirm</button>
              <button style={{ ...btnG, padding:"4px 8px", fontSize:"11px" }} onClick={() => setConfirmDel(false)}>×</button>
            </div>
          ) : (
            <button style={btnD} onClick={() => setConfirmDel(true)}>Delete</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export function AIProviders({ user }) {
  const [providers, setProviders] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showAdd,   setShowAdd]   = useState(false);
  const [filter,    setFilter]    = useState("all");
  const [flashMsg,  setFlashMsg]  = useState("");
  const userId = user?.id;

  const refresh = useCallback(async () => {
    if (!userId) return;
    invalidateProviderCache();
    const data = await getProviderStatus(userId);
    setProviders(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    const t = setInterval(refresh, 15_000);
    return () => clearInterval(t);
  }, [refresh]);

  function handleResetAll() {
    resetAllQuotas();
    setFlashMsg("All quotas reset ✓");
    setTimeout(() => { setFlashMsg(""); refresh(); }, 1500);
  }

  const existingIds = providers.map(p => p.providerId);
  const activeCount = providers.filter(p => p.available).length;
  const issueCount  = providers.filter(p => !p.hasKey || p.coolingDown || p.consecutiveErrors > 0).length;
  const totalReqs   = providers.reduce((s, p) => s + p.requestsToday, 0);

  const filtered = providers.filter(p => {
    if (filter === "active") return p.isEnabled && !p.isPaused && p.hasKey && p.available;
    if (filter === "issues") return !p.hasKey || p.coolingDown || p.consecutiveErrors > 0;
    return true;
  });

  return (
    <div style={page}>
      {/* Header */}
      <div style={{ marginBottom:"24px" }}>
        <h1 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"22px", color:"#fff", margin:"0 0 4px" }}>
          AI Providers
        </h1>
        <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"13px", margin:0 }}>
          Connect your AI models. Pick a provider, paste your API key — Mindoo handles everything else.
        </p>
      </div>

      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px", marginBottom:"24px" }}>
        {[
          { val:activeCount,      label:"Active",         color:"#22c55e"              },
          { val:issueCount,       label:"Need attention", color:issueCount>0?"#f59e0b":"rgba(255,255,255,0.7)" },
          { val:providers.length, label:"Total added",    color:"rgba(255,255,255,0.8)" },
          { val:totalReqs,        label:"Requests today", color:"#a78bfa"              },
        ].map(({ val, label, color }) => (
          <div key={label} style={{ ...card, padding:"14px 16px", marginBottom:0, textAlign:"center" }}>
            <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"24px", color }}>{val}</div>
            <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)", marginTop:"2px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px", gap:"10px", flexWrap:"wrap" }}>
        <div style={{ display:"flex", gap:"6px" }}>
          {["all","active","issues"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              ...btnG,
              color:       filter===f ? "#a78bfa" : "rgba(255,255,255,0.5)",
              borderColor: filter===f ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.1)",
              background:  filter===f ? "rgba(139,92,246,0.08)" : "none",
            }}>
              {f==="all" ? "All" : f==="active" ? "Active" : `Issues${issueCount>0?` (${issueCount})`:""}`}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
          {flashMsg && <span style={{ fontSize:"12px", color:"#22c55e" }}>{flashMsg}</span>}
          <button style={btnG} onClick={handleResetAll}>Reset all quotas</button>
          <button style={btnP} onClick={() => setShowAdd(true)}>+ Add Provider</button>
        </div>
      </div>

      {/* Empty state */}
      {!loading && providers.length === 0 && (
        <div style={{ ...card, textAlign:"center", padding:"48px 24px" }}>
          <div style={{ fontSize:"40px", marginBottom:"12px" }}>🤖</div>
          <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"16px", color:"#fff", marginBottom:"8px" }}>No providers added yet</div>
          <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)", marginBottom:"20px" }}>
            Add your first AI provider to start using Mindoo Chat.<br />Groq is free and takes 30 seconds to set up.
          </div>
          <button style={btnP} onClick={() => setShowAdd(true)}>+ Add First Provider</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign:"center", color:"rgba(255,255,255,0.3)", padding:"48px 0", fontSize:"13px" }}>
          Loading providers…
        </div>
      )}

      {/* List */}
      {!loading && filtered.map(p => (
        <ProviderCard key={p.id} p={p} userId={userId} onRefresh={refresh} />
      ))}

      {!loading && filtered.length === 0 && providers.length > 0 && (
        <div style={{ textAlign:"center", color:"rgba(255,255,255,0.3)", padding:"32px 0", fontSize:"13px" }}>
          No providers match this filter.
        </div>
      )}

      {/* How it works */}
      <div style={{ ...card, marginTop:"24px", background:"rgba(139,92,246,0.04)", borderColor:"rgba(139,92,246,0.12)" }}>
        <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"12px", color:"#a78bfa", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"10px" }}>
          How smart failover works
        </div>
        <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.45)", lineHeight:1.7 }}>
          When you send a message, Mindoo tries your providers in priority order — #1 first, then #2, and so on.
          If a provider is rate-limited or unavailable, it moves to the next one seamlessly.
          Use the ↑ ↓ arrows to change the order. Daily quotas reset at midnight automatically.
        </div>
      </div>

      {/* Modal */}
      {showAdd && (
        <AddModal
          userId={userId}
          existingIds={existingIds}
          onSave={refresh}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
