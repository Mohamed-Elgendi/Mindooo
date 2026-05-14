// src/pages/sections/AISettings.jsx
// User's personal AI provider preferences
// Users can see all available providers, enable/disable/pause/resume,
// set their own priority order. Keys are never shown.

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase";

const card = { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"14px", padding:"16px 18px", marginBottom:"10px" };
const btnG = { background:"none", border:"1px solid rgba(255,255,255,0.14)", borderRadius:"8px", color:"rgba(255,255,255,0.6)", fontSize:"12px", padding:"5px 12px", cursor:"pointer", fontFamily:"Inter,sans-serif", whiteSpace:"nowrap" };
const btnP = { background:"linear-gradient(135deg,#8b5cf6,#3b82f6)", border:"none", borderRadius:"9px", color:"#fff", fontSize:"12px", fontWeight:600, padding:"6px 14px", cursor:"pointer", fontFamily:"Inter,sans-serif", whiteSpace:"nowrap" };

const LOGOS = { groq:"⚡", gemini:"🌐", openrouter:"🔀", glm:"🤖", deepseek:"🔍", openai:"💬", anthropic:"🧠", mistral:"💨", qwen:"🔮" };

function dotColor(pref, provider) {
  if (!provider.is_enabled) return "#6b7280";
  if (!pref.is_enabled)     return "#6b7280";
  if (pref.is_paused)       return "#f59e0b";
  if (!provider.api_key?.trim()) return "#ef4444";
  return "#22c55e";
}

function statusLabel(pref, provider) {
  if (!provider.is_enabled)      return "Unavailable (admin disabled)";
  if (!provider.api_key?.trim()) return "No key (admin needs to add)";
  if (!pref.is_enabled)          return "Disabled by you";
  if (pref.is_paused)            return "Paused by you";
  return "Active";
}

export function AISettings({ user }) {
  const [providers, setProviders] = useState([]);  // global providers from admin
  const [prefs,     setPrefs]     = useState({});  // user's preferences keyed by provider_id
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState("");
  const [flash,     setFlash]     = useState("");
  const userId = user?.id;

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    // Load all global providers
    const { data: provData } = await supabase
      .from("ai_providers")
      .select("*")
      .order("priority", { ascending: true });

    // Load user's preferences
    const { data: prefData } = await supabase
      .from("user_provider_preferences")
      .select("*")
      .eq("user_id", userId);

    const prefMap = {};
    (prefData || []).forEach(p => { prefMap[p.provider_id] = p; });

    setProviders(provData || []);
    setPrefs(prefMap);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  // Get user's effective pref for a provider (defaults if not set)
  function getPref(pid) {
    return prefs[pid] || { provider_id: pid, is_enabled: true, is_paused: false, priority: 99 };
  }

  async function upsertPref(providerId, updates) {
    setSaving(providerId);
    const existing = prefs[providerId];

    if (existing?.id) {
      await supabase.from("user_provider_preferences")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabase.from("user_provider_preferences")
        .insert({ user_id: userId, provider_id: providerId, ...updates });
    }

    setSaving("");
    await load();
  }

  async function movePriority(providerId, delta) {
    const pref = getPref(providerId);
    const newPriority = Math.max(1, (pref.priority || 99) + delta);
    await upsertPref(providerId, { priority: newPriority });
  }

  async function resetAll() {
    if (!userId) return;
    await supabase.from("user_provider_preferences").delete().eq("user_id", userId);
    setFlash("Reset to defaults ✓");
    setTimeout(() => setFlash(""), 2000);
    await load();
  }

  // Sort providers by user's personal priority
  const sorted = [...providers].sort((a, b) => {
    const pa = getPref(a.provider_id).priority ?? 99;
    const pb = getPref(b.provider_id).priority ?? 99;
    if (pa !== pb) return pa - pb;
    return a.priority - b.priority; // fallback to global priority
  });

  const activeCount = sorted.filter(p => {
    const pref = getPref(p.provider_id);
    return p.is_enabled && p.api_key?.trim() && pref.is_enabled && !pref.is_paused;
  }).length;

  return (
    <div style={{ padding:"24px", maxWidth:"840px", margin:"0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom:"24px" }}>
        <h1 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"20px", color:"#fff", margin:"0 0 4px" }}>
          My AI Preferences
        </h1>
        <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"13px", margin:0 }}>
          Control which AI providers you use and in what order. Your preferences are saved across all devices.
        </p>
      </div>

      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px", marginBottom:"20px" }}>
        {[
          { v: activeCount,       l:"Active for you",   c:"#22c55e" },
          { v: providers.length,  l:"Available total",  c:"rgba(255,255,255,0.7)" },
          { v: providers.filter(p=>!p.api_key?.trim()).length, l:"Pending key (admin)", c:"rgba(255,255,255,0.4)" },
        ].map(({ v, l, c }) => (
          <div key={l} style={{ ...card, padding:"12px 14px", marginBottom:0, textAlign:"center" }}>
            <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"22px", color:c }}>{v}</div>
            <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)", marginTop:"2px" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Notice */}
      <div style={{ ...card, background:"rgba(59,130,246,0.05)", borderColor:"rgba(59,130,246,0.12)", marginBottom:"16px", padding:"10px 14px" }}>
        <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.5)", lineHeight:1.65 }}>
          💡 The AI uses your providers in the order shown below. Drag priority with ↑ ↓.
          If a provider hits its limit, Mindoo automatically tries the next active one.
          API keys are managed by the admin — you never see or touch them.
        </div>
      </div>

      {/* Controls */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"14px", flexWrap:"wrap", gap:"8px" }}>
        <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.5)" }}>
          Your priority order — drag with ↑ ↓
        </div>
        <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
          {flash && <span style={{ fontSize:"12px", color:"#22c55e" }}>{flash}</span>}
          <button style={btnG} onClick={resetAll}>Reset to defaults</button>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign:"center", color:"rgba(255,255,255,0.3)", padding:"40px 0", fontSize:"13px" }}>
          Loading providers…
        </div>
      )}

      {!loading && providers.length === 0 && (
        <div style={{ ...card, textAlign:"center", padding:"40px 20px" }}>
          <div style={{ fontSize:"32px", marginBottom:"10px" }}>🤖</div>
          <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"14px", color:"rgba(255,255,255,0.6)", marginBottom:"6px" }}>
            No providers configured yet
          </div>
          <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.35)" }}>
            The admin needs to add AI providers. Check back soon.
          </div>
        </div>
      )}

      {/* Provider list */}
      {!loading && sorted.map((provider, idx) => {
        const pref  = getPref(provider.provider_id);
        const color = dotColor(pref, provider);
        const label = statusLabel(pref, provider);
        const logo  = LOGOS[provider.provider_id] || "🤖";
        const isActive = provider.is_enabled && provider.api_key?.trim() && pref.is_enabled && !pref.is_paused;
        const isSaving = saving === provider.provider_id;

        return (
          <div key={provider.provider_id}
            style={{ ...card, opacity: provider.is_enabled ? 1 : 0.5, borderColor: isActive ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)" }}>
            <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>

              {/* Logo + dot */}
              <div style={{ position:"relative", flexShrink:0 }}>
                <div style={{ fontSize:"24px", lineHeight:1 }}>{logo}</div>
                <span style={{ position:"absolute", bottom:-1, right:-1, width:"8px", height:"8px", borderRadius:"50%", backgroundColor:color, border:"2px solid #09090f", boxShadow:`0 0 4px ${color}` }} />
              </div>

              {/* Info */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
                  <span style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"14px", color:"#fff" }}>{provider.name}</span>
                  <span style={{ fontSize:"11px", color, fontWeight:500 }}>{label}</span>
                </div>
                <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.25)", marginTop:"2px", fontFamily:"monospace" }}>
                  {provider.model}
                </div>
              </div>

              {/* Controls */}
              <div style={{ display:"flex", gap:"5px", alignItems:"center", flexShrink:0, flexWrap:"wrap", justifyContent:"flex-end" }}>
                {/* Priority */}
                <div style={{ display:"flex", gap:"3px" }}>
                  <button style={{ ...btnG, padding:"3px 8px" }} onClick={() => movePriority(provider.provider_id, -1)} disabled={isSaving} title="Move up">↑</button>
                  <button style={{ ...btnG, padding:"3px 8px" }} onClick={() => movePriority(provider.provider_id, 1)}  disabled={isSaving} title="Move down">↓</button>
                </div>

                {/* Pause / Resume */}
                {pref.is_enabled && (
                  <button style={btnG} disabled={isSaving || !provider.is_enabled}
                    onClick={() => upsertPref(provider.provider_id, { is_paused: !pref.is_paused })}>
                    {isSaving ? "…" : pref.is_paused ? "Resume" : "Pause"}
                  </button>
                )}

                {/* Enable / Disable */}
                <button
                  style={pref.is_enabled ? btnG : btnP}
                  disabled={isSaving || !provider.is_enabled}
                  onClick={() => upsertPref(provider.provider_id, { is_enabled: !pref.is_enabled, is_paused: false })}>
                  {isSaving ? "…" : pref.is_enabled ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Failover explanation */}
      <div style={{ ...card, marginTop:"20px", background:"rgba(139,92,246,0.04)", borderColor:"rgba(139,92,246,0.12)", padding:"14px 16px" }}>
        <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"11px", color:"#a78bfa", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"8px" }}>
          How your preferences work
        </div>
        <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.45)", lineHeight:1.75 }}>
          When you send a message in chat, Mindoo tries your active providers in the order shown above.
          If a provider is rate-limited or unavailable, it automatically moves to the next one — you never notice.
          Disabled or paused providers are skipped entirely.
          Your order is personal — other users have their own priority settings.
        </div>
      </div>
    </div>
  );
}
