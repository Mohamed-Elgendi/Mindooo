// src/pages/sections/AIProviders.jsx
// ─────────────────────────────────────────────────────────────────
// AI Provider Control Panel — simplified, zero technical knowledge needed.
//
// To add a provider:
//   1. Pick from the dropdown
//   2. Paste your API key
//   3. Click Save
//   That's it. Everything else is pre-filled automatically.
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
// PROVIDER CATALOGUE
// Everything pre-filled. User only needs to paste their API key.
// ═══════════════════════════════════════════════════════════════

const PROVIDER_CATALOGUE = [
  {
    provider_id: "groq",
    name:        "Groq",
    company:     "Groq",
    logo:        "⚡",
    tagline:     "Fastest free AI — best place to start",
    badge:       "FREE",
    badgeColor:  "#22c55e",
    keyHint:     "Starts with gsk_... — get it free at console.groq.com",
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
    notes:       "Free tier — fast llama model. Best primary provider.",
  },
  {
    provider_id: "gemini",
    name:        "Gemini",
    company:     "Google",
    logo:        "🌐",
    tagline:     "Google's AI — free and very capable",
    badge:       "FREE",
    badgeColor:  "#22c55e",
    keyHint:     "Starts with AIza... — get it free at aistudio.google.com",
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
    notes:       "Google Gemini — free tier, fast and capable.",
  },
  {
    provider_id: "openrouter",
    name:        "OpenRouter",
    company:     "OpenRouter",
    logo:        "🔀",
    tagline:     "Routes to best available model — free tier",
    badge:       "FREE",
    badgeColor:  "#22c55e",
    keyHint:     "Starts with sk-or-... — get it free at openrouter.ai",
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
    notes:       "Free tier — access to many models via one key.",
  },
  {
    provider_id: "glm",
    name:        "GLM (Zhipu AI)",
    company:     "Zhipu AI",
    logo:        "🤖",
    tagline:     "Chinese LLM — free flash tier",
    badge:       "FREE",
    badgeColor:  "#22c55e",
    keyHint:     "Get it free at bigmodel.cn",
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
    notes:       "GLM-4-Flash — completely free tier.",
  },
  {
    provider_id: "deepseek",
    name:        "DeepSeek",
    company:     "DeepSeek",
    logo:        "🔍",
    tagline:     "Incredibly cheap, strong reasoning",
    badge:       "CHEAP",
    badgeColor:  "#60a5fa",
    keyHint:     "Get it at platform.deepseek.com — top up $2 minimum",
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
    notes:       "Very affordable — about $0.001 per message.",
  },
  {
    provider_id: "openai",
    name:        "ChatGPT (GPT-4o)",
    company:     "OpenAI",
    logo:        "💬",
    tagline:     "The original — GPT-4o mini is affordable",
    badge:       "PAID",
    badgeColor:  "#a78bfa",
    keyHint:     "Starts with sk-... — get it at platform.openai.com",
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
    tagline:     "Highest quality reasoning — needs server setup",
    badge:       "PAID",
    badgeColor:  "#a78bfa",
    keyHint:     "Starts with sk-ant-... — get it at console.anthropic.com",
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
    notes:       "⚠️ Claude blocks direct browser calls. Will work once a server proxy is added.",
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
    notes:       "Alibaba Qwen — strong multilingual capabilities.",
  },
];

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function dotColor(p) {
  if (!p.isEnabled || !p.hasKey) return "#ef4444";
  if (p.isPaused || p.coolingDown || !p.available) return "#f59e0b";
  if (p.quotaPercent > 80) return "#f59e0b";
  return "#22c55e";
}

function statusLabel(p) {
  if (!p.isEnabled)       return "Disabled";
  if (p.isPaused)         return "Paused";
  if (!p.hasKey)          return "No API key";
  if (p.coolingDown)      return `Cooldown ${p.cooldownSecsLeft}s`;
  if (!p.available)       return p.unavailableReason || "Unavailable";
  if (p.quotaPercent > 80) return `Quota ${p.quotaPercent}%`;
  return "Active";
}

// Get catalogue entry for a provider
function getCatalogue(providerId) {
  return PROVIDER_CATALOGUE.find(c => c.provider_id === providerId);
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════

const S = {
  page:   { padding: "24px", maxWidth: "860px", margin: "0 auto" },
  card:   { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "18px 20px", marginBottom: "12px" },
  row:    { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  label:  { fontSize: "11px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "4px" },
  input:  { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "10px 14px", color: "#fff", fontSize: "13px", fontFamily: "Inter,sans-serif", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" },
  btnG:   { background: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "rgba(255,255,255,0.6)", fontSize: "12px", padding: "6px 14px", cursor: "pointer", fontFamily: "Inter,sans-serif", whiteSpace: "nowrap" },
  btnP:   { background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: 600, padding: "10px 22px", cursor: "pointer", fontFamily: "Inter,sans-serif", whiteSpace: "nowrap" },
  btnD:   { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#ef4444", fontSize: "12px", padding: "6px 14px", cursor: "pointer", fontFamily: "Inter,sans-serif", whiteSpace: "nowrap" },
};

// ═══════════════════════════════════════════════════════════════
// ADD PROVIDER MODAL
// Pick from catalogue → paste key → done
// ═══════════════════════════════════════════════════════════════

function AddProviderModal({ userId, existingIds, onSave, onClose }) {
  const [selected, setSelected] = useState(null);
  const [apiKey,   setApiKey]   = useState("");
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const keyRef = useRef(null);

  // Custom provider form state
  const [custom, setCustom] = useState({
    provider_id: "", name: "", base_url: "", model: "",
    api_format: "openai", api_key: "", priority: 20,
    max_requests_per_minute: 30, max_requests_per_day: 1000,
    max_tokens_per_request: 4000, cooldown_on_rate_limit: 62,
    cooldown_on_error: 15, notes: "",
  });

  const available = PROVIDER_CATALOGUE.filter(c => !existingIds.includes(c.provider_id));

  function selectProvider(cat) {
    setSelected(cat);
    setApiKey("");
    setErr("");
    setTimeout(() => keyRef.current?.focus(), 100);
  }

  async function handleSave() {
    if (!selected) { setErr("Please select a provider first."); return; }
    if (!apiKey.trim()) { setErr("Please paste your API key."); return; }
    setSaving(true);
    setErr("");

    // Build full provider record from catalogue
    const record = {
      ...selected,
      api_key:     apiKey.trim(),
      is_enabled:  true,
      is_paused:   false,
    };
    delete record.logo;
    delete record.tagline;
    delete record.badge;
    delete record.badgeColor;
    delete record.keyHint;
    delete record.keyLink;

    const { error } = await addCustomProvider(record, userId);
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onSave();
    onClose();
  }

  async function handleSaveCustom() {
    if (!custom.provider_id || !custom.name || !custom.base_url || !custom.model) {
      setErr("ID, name, URL, and model are required."); return;
    }
    setSaving(true);
    const { error } = await addCustomProvider({ ...custom, is_enabled: true, is_paused: false }, userId);
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onSave();
    onClose();
  }

  function setC(k, v) { setCustom(f => ({ ...f, [k]: v })); }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 999, padding: "20px",
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "560px",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "18px", color: "#fff" }}>
              Add AI Provider
            </div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "3px" }}>
              Pick a provider and paste your API key — that's all you need
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "20px", cursor: "pointer", padding: "4px" }}>×</button>
        </div>

        {!showCustom ? (
          <>
            {/* Provider grid */}
            <div style={{ marginBottom: "20px" }}>
              <div style={S.label}>Choose a provider</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px" }}>
                {available.map(cat => (
                  <div
                    key={cat.provider_id}
                    onClick={() => selectProvider(cat)}
                    style={{
                      background:   selected?.provider_id === cat.provider_id ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
                      border:       `1px solid ${selected?.provider_id === cat.provider_id ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
                      borderRadius: "12px",
                      padding:      "12px 14px",
                      cursor:       "pointer",
                      transition:   "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "18px" }}>{cat.logo}</span>
                      <span style={{ fontWeight: 600, fontSize: "13px", color: "#fff" }}>{cat.name}</span>
                      <span style={{
                        fontSize: "9px", fontWeight: 700,
                        background: `${cat.badgeColor}22`, color: cat.badgeColor,
                        border: `1px solid ${cat.badgeColor}44`,
                        borderRadius: "4px", padding: "1px 5px", marginLeft: "auto",
                      }}>{cat.badge}</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>{cat.tagline}</div>
                  </div>
                ))}

                {available.length === 0 && (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "13px", padding: "20px" }}>
                    All known providers are already added.
                  </div>
                )}
              </div>
            </div>

            {/* API Key input — shown after provider selected */}
            {selected && (
              <div style={{ marginBottom: "20px" }}>
                <div style={S.label}>Your API Key for {selected.name}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>
                  {selected.keyHint} —{" "}
                  <a href={selected.keyLink} target="_blank" rel="noopener noreferrer"
                    style={{ color: "#a78bfa", textDecoration: "none" }}>
                    Get it here →
                  </a>
                </div>
                <input
                  ref={keyRef}
                  type="password"
                  style={S.input}
                  placeholder="Paste your API key here…"
                  value={apiKey}
                  onChange={e => { setApiKey(e.target.value); setErr(""); }}
                  onKeyDown={e => e.key === "Enter" && handleSave()}
                />
                {selected.provider_id === "anthropic" && (
                  <div style={{ fontSize: "11px", color: "#f59e0b", marginTop: "6px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "8px", padding: "8px 12px" }}>
                    ⚠️ Claude currently blocks direct browser calls. The key will be saved but won't work until a server proxy is added. Add it now so it's ready when we build the proxy.
                  </div>
                )}
              </div>
            )}

            {err && <div style={{ color: "#ef4444", fontSize: "12px", marginBottom: "12px" }}>{err}</div>}

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {selected && (
                <button style={S.btnP} onClick={handleSave} disabled={saving || !apiKey.trim()}>
                  {saving ? "Saving…" : `Add ${selected.name}`}
                </button>
              )}
              <button style={S.btnG} onClick={onClose}>Cancel</button>
              <button
                style={{ ...S.btnG, marginLeft: "auto", fontSize: "11px" }}
                onClick={() => setShowCustom(true)}
              >
                + Custom provider
              </button>
            </div>
          </>
        ) : (
          /* Custom provider form — for advanced users */
          <>
            <div style={{ marginBottom: "16px" }}>
              <button onClick={() => setShowCustom(false)} style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", fontSize: "13px", padding: 0 }}>
                ← Back to catalogue
              </button>
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "16px" }}>
              Add any OpenAI-compatible API endpoint. You need the URL and model name from the provider's documentation.
            </div>

            {[
              { label: "Provider ID (unique, no spaces)", k: "provider_id", placeholder: "e.g. my_provider" },
              { label: "Display Name",                    k: "name",        placeholder: "e.g. My Provider" },
              { label: "API Endpoint URL",                k: "base_url",    placeholder: "https://api.example.com/v1/chat/completions" },
              { label: "Model Name",                      k: "model",       placeholder: "e.g. llama-3-70b" },
            ].map(({ label, k, placeholder }) => (
              <div key={k} style={{ marginBottom: "12px" }}>
                <div style={S.label}>{label}</div>
                <input type="text" style={S.input} placeholder={placeholder}
                  value={custom[k]} onChange={e => setC(k, e.target.value)} />
              </div>
            ))}

            <div style={{ marginBottom: "12px" }}>
              <div style={S.label}>API Format</div>
              <select style={{ ...S.input, cursor: "pointer" }} value={custom.api_format} onChange={e => setC("api_format", e.target.value)}>
                <option value="openai">OpenAI-compatible (works with most providers)</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="google">Google (Gemini)</option>
              </select>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={S.label}>API Key (optional — add later)</div>
              <input type="password" style={S.input} placeholder="Paste API key…"
                value={custom.api_key} onChange={e => setC("api_key", e.target.value)} />
            </div>

            {err && <div style={{ color: "#ef4444", fontSize: "12px", marginBottom: "12px" }}>{err}</div>}

            <div style={{ display: "flex", gap: "10px" }}>
              <button style={S.btnP} onClick={handleSaveCustom} disabled={saving}>
                {saving ? "Adding…" : "Add Custom Provider"}
              </button>
              <button style={S.btnG} onClick={() => setShowCustom(false)}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PROVIDER CARD — simplified, only shows what matters
// ═══════════════════════════════════════════════════════════════

function ProviderCard({ p, userId, onRefresh }) {
  const [editing,    setEditing]    = useState(false);
  const [keyInput,   setKeyInput]   = useState("");
  const [saving,     setSaving]     = useState(false);
  const [msg,        setMsg]        = useState("");
  const [confirmDel, setConfirmDel] = useState(false);
  const keyRef = useRef(null);

  const cat    = getCatalogue(p.providerId);
  const color  = dotColor(p);
  const status = statusLabel(p);

  async function handleSaveKey() {
    if (!keyInput.trim()) return;
    setSaving(true);
    const { error } = await saveProviderKey(p.providerId, keyInput.trim(), userId);
    setSaving(false);
    if (error) { setMsg("Failed to save — try again"); return; }
    setMsg("Saved ✓");
    setKeyInput("");
    setEditing(false);
    setTimeout(() => setMsg(""), 2000);
    onRefresh();
  }

  function startEditing() {
    setEditing(true);
    setTimeout(() => keyRef.current?.focus(), 80);
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
    <div style={{
      ...S.card,
      opacity:     p.isEnabled ? 1 : 0.5,
      borderColor: p.hasKey && p.available ? "rgba(255,255,255,0.08)" : "rgba(239,68,68,0.15)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>

        {/* Logo + status dot */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ fontSize: "28px", lineHeight: 1 }}>{cat?.logo || "🤖"}</div>
          <span style={{
            position: "absolute", bottom: -2, right: -2,
            width: "10px", height: "10px", borderRadius: "50%",
            backgroundColor: color, border: "2px solid #09090f",
            boxShadow: `0 0 6px ${color}`,
          }} />
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name + status + priority */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
            <span style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "15px", color: "#fff" }}>
              {p.name}
            </span>
            {cat?.badge && (
              <span style={{
                fontSize: "9px", fontWeight: 700,
                background: `${cat.badgeColor}22`, color: cat.badgeColor,
                border: `1px solid ${cat.badgeColor}44`,
                borderRadius: "4px", padding: "1px 6px",
              }}>{cat.badge}</span>
            )}
            <span style={{ fontSize: "11px", color, fontWeight: 600 }}>{status}</span>
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", marginLeft: "auto" }}>
              Priority #{p.priority}
            </span>
          </div>

          {/* Model */}
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginBottom: "8px" }}>
            {p.model}
          </div>

          {/* Quota bar */}
          {p.hasKey && (
            <div style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "rgba(255,255,255,0.25)", marginBottom: "4px" }}>
                <span>Today: {p.requestsToday} / {p.maxPerDay} requests</span>
                <span>Success: {p.successRate}%</span>
              </div>
              <div style={{ height: "3px", borderRadius: "2px", background: "rgba(255,255,255,0.06)" }}>
                <div style={{ height: "100%", borderRadius: "2px", width: `${p.quotaPercent}%`, background: p.quotaPercent > 80 ? "#f59e0b" : "#22c55e", transition: "width 0.4s" }} />
              </div>
            </div>
          )}

          {/* API Key section */}
          {!editing ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <div style={{ fontSize: "12px", color: p.hasKey ? "#22c55e" : "#ef4444" }}>
                {p.hasKey ? "● API key saved" : "● No API key — add one to activate"}
              </div>
              <button style={{ ...S.btnG, fontSize: "11px", padding: "4px 10px" }} onClick={startEditing}>
                {p.hasKey ? "Update key" : "Add key"}
              </button>
              {msg && <span style={{ fontSize: "11px", color: "#22c55e" }}>{msg}</span>}
            </div>
          ) : (
            <div>
              {cat?.keyHint && (
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginBottom: "6px" }}>
                  {cat.keyHint}
                  {cat.keyLink && (
                    <a href={cat.keyLink} target="_blank" rel="noopener noreferrer"
                      style={{ color: "#a78bfa", marginLeft: "6px", textDecoration: "none" }}>
                      Get key →
                    </a>
                  )}
                </div>
              )}
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  ref={keyRef}
                  type="password"
                  style={{ ...S.input, flex: 1 }}
                  placeholder="Paste your API key here…"
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleSaveKey();
                    if (e.key === "Escape") { setEditing(false); setKeyInput(""); }
                  }}
                />
                <button style={S.btnP} onClick={handleSaveKey} disabled={saving || !keyInput.trim()}>
                  {saving ? "Saving…" : "Save"}
                </button>
                <button style={S.btnG} onClick={() => { setEditing(false); setKeyInput(""); }}>
                  Cancel
                </button>
              </div>
              {msg && <div style={{ fontSize: "11px", color: "#22c55e", marginTop: "6px" }}>{msg}</div>}
            </div>
          )}
        </div>

        {/* Right controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: "4px" }}>
            <button style={{ ...S.btnG, padding: "4px 8px" }} onClick={() => handlePriority(-1)} title="Move up in priority">↑</button>
            <button style={{ ...S.btnG, padding: "4px 8px" }} onClick={() => handlePriority(1)}  title="Move down in priority">↓</button>
          </div>

          {p.isEnabled && (
            <button style={S.btnG} onClick={() => handleToggle("is_paused", !p.isPaused)}>
              {p.isPaused ? "Resume" : "Pause"}
            </button>
          )}

          <button style={S.btnG} onClick={() => handleToggle("is_enabled", !p.isEnabled)}>
            {p.isEnabled ? "Disable" : "Enable"}
          </button>

          {(p.coolingDown || p.consecutiveErrors > 0) && (
            <button style={S.btnG} onClick={handleReset}>Reset</button>
          )}

          {confirmDel ? (
            <div style={{ display: "flex", gap: "4px" }}>
              <button style={{ ...S.btnD, padding: "4px 8px", fontSize: "11px" }} onClick={handleDelete}>Confirm</button>
              <button style={{ ...S.btnG, padding: "4px 8px", fontSize: "11px" }} onClick={() => setConfirmDel(false)}>×</button>
            </div>
          ) : (
            <button style={S.btnD} onClick={() => setConfirmDel(true)}>Delete</button>
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

  // Auto-refresh every 15s to update cooldown timers
  useEffect(() => {
    const t = setInterval(refresh, 15_000);
    return () => clearInterval(t);
  }, [refresh]);

  function handleResetAll() {
    resetAllQuotas();
    setFlashMsg("All quotas reset ✓");
    setTimeout(() => { setFlashMsg(""); refresh(); }, 1500);
  }

  const existingIds  = providers.map(p => p.providerId);
  const activeCount  = providers.filter(p => p.available).length;
  const issueCount   = providers.filter(p => !p.hasKey || p.coolingDown || p.consecutiveErrors > 0).length;
  const totalReqs    = providers.reduce((s, p) => s + p.requestsToday, 0);

  const filtered = providers.filter(p => {
    if (filter === "active") return p.isEnabled && !p.isPaused && p.hasKey && p.available;
    if (filter === "issues") return !p.hasKey || p.coolingDown || p.consecutiveErrors > 0;
    return true;
  });

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "22px", color: "#fff", margin: "0 0 4px" }}>
          AI Providers
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: 0 }}>
          Connect your AI models. Pick a provider, paste your API key — that's all you need.
          Mindoo handles everything else automatically.
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { val: activeCount,       label: "Active",        color: "#22c55e" },
          { val: issueCount,        label: "Need attention", color: issueCount > 0 ? "#f59e0b" : "rgba(255,255,255,0.6)" },
          { val: providers.length,  label: "Total added",   color: "rgba(255,255,255,0.8)" },
          { val: totalReqs,         label: "Requests today", color: "#a78bfa" },
        ].map(({ val, label, color }) => (
          <div key={label} style={{ ...S.card, padding: "14px 16px", marginBottom: 0, textAlign: "center" }}>
            <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "24px", color }}>{val}</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {["all", "active", "issues"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              ...S.btnG,
              color:       filter === f ? "#a78bfa" : "rgba(255,255,255,0.5)",
              borderColor: filter === f ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.1)",
              background:  filter === f ? "rgba(139,92,246,0.08)" : "none",
            }}>
              {f === "all" ? "All" : f === "active" ? "Active" : `Issues${issueCount > 0 ? ` (${issueCount})` : ""}`}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {flashMsg && <span style={{ fontSize: "12px", color: "#22c55e" }}>{flashMsg}</span>}
          <button style={S.btnG} onClick={handleResetAll}>Reset all quotas</button>
          <button style={S.btnP} onClick={() => setShowAdd(true)}>+ Add Provider</button>
        </div>
      </div>

      {/* Empty state */}
      {!loading && providers.length === 0 && (
        <div style={{ ...S.card, textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🤖</div>
          <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "16px", color: "#fff", marginBottom: "8px" }}>
            No providers added yet
          </div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "20px" }}>
            Add your first AI provider to start using Mindoo Chat.
            Groq is free and takes 30 seconds to set up.
          </div>
          <button style={S.btnP} onClick={() => setShowAdd(true)}>+ Add First Provider</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: "48px 0", fontSize: "13px" }}>
          Loading providers…
        </div>
      )}

      {/* Provider list */}
      {!loading && filtered.map(p => (
        <ProviderCard key={p.id} p={p} userId={userId} onRefresh={refresh} />
      ))}

      {!loading && filtered.length === 0 && providers.length > 0 && (
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: "32px 0", fontSize: "13px" }}>
          No providers match this filter.
        </div>
      )}

      {/* How it works */}
      <div style={{ ...S.card, marginTop: "24px", background: "rgba(139,92,246,0.04)", borderColor: "rgba(139,92,246,0.12)" }}>
        <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "12px", color: "#a78bfa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
          How smart failover works
        </div>
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
          When you send a message, Mindoo tries your providers in priority order — #1 first, then #2, and so on.
          If a provider is rate-limited, it cools down automatically and the next one takes over — seamlessly.
          You never see an error unless every single provider fails at the same time.
          Use the ↑ ↓ arrows to change which provider gets tried first.
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <AddProviderModal
          userId={userId}
          existingIds={existingIds}
          onSave={refresh}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
