// ─────────────────────────────────────────────────────────────────
// BrainDump.jsx — Brain Dump Sanctuary
//
// COMPLETE FEATURE LIST:
//  ✅ Editable title on every chronicle
//  ✅ Delete with 2-click confirmation
//  ✅ Real voice note (MediaRecorder → Supabase Storage → playback)
//  ✅ Brain Dump Session with adjustable timer (1–120 min)
//  ✅ Copy button on input and each chronicle
//  ✅ Font size control (A- / A+) — persisted in localStorage
//  ✅ Clickable links in all chronicle text
//  ✅ Speech-to-text in Write textarea toolbar
//  ✅ SHARING — WhatsApp, Facebook, X, Email, Telegram, Reddit,
//               Obsidian (Markdown file), Notion (clipboard),
//               Google Drive (file download), Native share sheet,
//               Copy as Markdown, Copy as plain text
// ─────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from "react";
import {
  saveChronicle, saveVoiceChronicle, saveSessionChronicle,
  uploadVoiceBlob, loadChronicles, updateChronicle, deleteChronicle,
} from "../../services/db";
import { analyzeChronicle } from "../../services/ai";

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  const d = new Date(iso), diff = Date.now() - d;
  const m = Math.floor(diff/60000), h = Math.floor(diff/3600000), dy = Math.floor(diff/86400000);
  if (m<2) return "Just now"; if (m<60) return `${m}m ago`;
  if (h<24) return `${h}h ago`; if (dy===1) return "Yesterday";
  if (dy<7) return `${dy}d ago`;
  return d.toLocaleDateString([],{month:"short",day:"numeric"});
}
function fmtSecs(s) { if(!s) return "0:00"; return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`; }
function fmtMins(m) { return m<60?`${m} min`:`${Math.floor(m/60)}h ${m%60>0?m%60+"m":""}`.trim(); }
function chaosColor(s) { if(s<30) return "#4ade80"; if(s<60) return "#fbbf24"; if(s<80) return "#f97316"; return "#f87171"; }
function toneEmoji(t) { return {calm:"😌",focused:"🎯",anxious:"😰",overwhelmed:"😩",excited:"🔥",sad:"😔",angry:"😤",neutral:"😐"}[t]??"😐"; }
function originIcon(o) { return o==="voice"?"🎙️":o==="session"?"⏱️":"🧠"; }

// ─────────────────────────────────────────────────────────────────
// CHRONICLE → FORMATTED TEXT (used by all share targets)
// ─────────────────────────────────────────────────────────────────
function buildMarkdown(c) {
  const title = c.title || c.ai_summary || (c.origin==="voice"?"Voice Note":c.origin==="session"?"Dump Session":"Brain Dump");
  const date  = new Date(c.created_at).toLocaleString([],{dateStyle:"long",timeStyle:"short"});
  const tags  = (c.themes??[]).map(t=>`#${t}`).join(" ");
  const meta  = [
    `📅 ${date}`,
    c.chaos_score>0 ? `🌀 Chaos: ${c.chaos_score}/100` : null,
    c.emotional_tone && c.emotional_tone!=="neutral" ? `${toneEmoji(c.emotional_tone)} Tone: ${c.emotional_tone}` : null,
    c.word_count>0  ? `📝 ${c.word_count} words` : null,
    c.duration_secs>0 ? `⏱ Duration: ${fmtSecs(c.duration_secs)}` : null,
    tags ? tags : null,
  ].filter(Boolean).join("  ·  ");

  let md = `# ${title}\n\n`;
  md += `${meta}\n\n`;
  if (c.text?.trim()) md += `---\n\n${c.text.trim()}\n\n`;
  if (c.audio_url)    md += `---\n\n🎙️ *Voice note attached — play at:* [Listen](${c.audio_url})\n\n`;
  md += `---\n*Captured with Mindoo — your cognitive OS*`;
  return md;
}

function buildPlainText(c) {
  const title = c.title || c.ai_summary || "Brain Dump";
  const date  = new Date(c.created_at).toLocaleString([],{dateStyle:"medium",timeStyle:"short"});
  let out = `${title}\n${"─".repeat(Math.min(title.length,50))}\n${date}\n\n`;
  if (c.text?.trim()) out += `${c.text.trim()}\n\n`;
  if (c.audio_url)    out += `Voice note: ${c.audio_url}\n\n`;
  out += "— Captured with Mindoo";
  return out;
}

function buildObsidianMd(c) {
  const title  = c.title || c.ai_summary || "Brain Dump";
  const date   = new Date(c.created_at).toISOString().split("T")[0];
  const tags   = (c.themes??[]).map(t=>`  - ${t}`).join("\n");
  let fm = `---\ntitle: "${title.replace(/"/g,'\"')}"\ndate: ${date}\ntype: brain-dump\nsource: mindoo\n`;
  if (tags) fm += `tags:\n${tags}\n`;
  if (c.chaos_score>0) fm += `chaos_score: ${c.chaos_score}\n`;
  if (c.emotional_tone && c.emotional_tone!=="neutral") fm += `emotional_tone: ${c.emotional_tone}\n`;
  fm += `---\n\n`;
  fm += `# ${title}\n\n`;
  if (c.text?.trim()) fm += `${c.text.trim()}\n\n`;
  if (c.audio_url)    fm += `## Voice Note\n\n[🎙️ Listen to recording](${c.audio_url})\n\n`;
  fm += `## Meta\n- **Date:** ${new Date(c.created_at).toLocaleString()}\n`;
  if (c.chaos_score>0)  fm += `- **Chaos Score:** ${c.chaos_score}/100\n`;
  if (c.word_count>0)   fm += `- **Word Count:** ${c.word_count}\n`;
  if (c.duration_secs>0) fm += `- **Duration:** ${fmtSecs(c.duration_secs)}\n`;
  return fm;
}

function buildNotionText(c) {
  const title = c.title || c.ai_summary || "Brain Dump";
  const date  = new Date(c.created_at).toLocaleString([],{dateStyle:"long",timeStyle:"short"});
  const props = [
    `Date: ${date}`,
    c.chaos_score>0  ? `Chaos Score: ${c.chaos_score}/100` : null,
    c.emotional_tone && c.emotional_tone!=="neutral" ? `Tone: ${c.emotional_tone}` : null,
    (c.themes??[]).length>0 ? `Tags: ${c.themes.join(", ")}` : null,
  ].filter(Boolean);

  let out = `${title}\n\n`;
  props.forEach(p => out += `• ${p}\n`);
  out += "\n";
  if (c.text?.trim()) out += `${c.text.trim()}\n\n`;
  if (c.audio_url)    out += `Voice note: ${c.audio_url}\n\n`;
  out += "Captured with Mindoo";
  return out;
}

async function copyToClipboard(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    try {
      const el = document.createElement("textarea");
      el.value = text; el.style.position = "fixed"; el.style.opacity = "0";
      document.body.appendChild(el); el.focus(); el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el); return ok;
    } catch { return false; }
  }
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeTitle(c) {
  const raw = c.title || c.ai_summary || "brain-dump";
  return raw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").substring(0, 50) || "chronicle";
}

// ─────────────────────────────────────────────────────────────────
// SHARE PANEL
// ─────────────────────────────────────────────────────────────────
const SHARE_TARGETS = [
  // Row 1: Quick shares
  {
    id: "native",     label: "Share…",        emoji: "📤",  color: "#8b5cf6",
    desc: "Opens your device share sheet (WhatsApp, Instagram, Messages, any app)",
    group: "native",
  },
  {
    id: "whatsapp",   label: "WhatsApp",      emoji: "💬",  color: "#25d366",
    desc: "Share via WhatsApp",    group: "social",
  },
  {
    id: "telegram",   label: "Telegram",      emoji: "✈️",  color: "#2aabee",
    desc: "Share via Telegram",   group: "social",
  },
  {
    id: "facebook",   label: "Facebook",      emoji: "👥",  color: "#1877f2",
    desc: "Share to Facebook",    group: "social",
  },
  {
    id: "x",          label: "X / Twitter",   emoji: "🐦",  color: "#e7e9ea",
    desc: "Post to X (Twitter)",  group: "social",
  },
  {
    id: "reddit",     label: "Reddit",        emoji: "🔴",  color: "#ff4500",
    desc: "Share to Reddit",      group: "social",
  },
  {
    id: "email",      label: "Email",         emoji: "📧",  color: "#60a5fa",
    desc: "Open in your email client with the chronicle pre-filled",
    group: "social",
  },
  // Row 2: Apps
  {
    id: "obsidian",   label: "Obsidian",      emoji: "🔮",  color: "#a78bfa",
    desc: "Download as .md file — drag into your Obsidian vault",
    group: "apps",
  },
  {
    id: "notion",     label: "Notion",        emoji: "📓",  color: "#f8f8ff",
    desc: "Copy formatted text → paste into any Notion page",
    group: "apps",
  },
  {
    id: "drive",      label: "Google Drive",  emoji: "🗂️",  color: "#fbbc04",
    desc: "Download as .txt → upload to your Google Drive",
    group: "apps",
  },
  // Row 3: Copy
  {
    id: "copy_md",    label: "Copy Markdown", emoji: "📋",  color: "#22d3ee",
    desc: "Copy full chronicle as Markdown (for any editor)",
    group: "copy",
  },
  {
    id: "copy_text",  label: "Copy Text",     emoji: "📄",  color: "#4ade80",
    desc: "Copy as plain readable text",
    group: "copy",
  },
];

function SharePanel({ c, onClose }) {
  const [feedback, setFeedback] = useState({}); // { [targetId]: "ok" | "error" }
  const title = c.title || c.ai_summary || "Brain Dump Chronicle";
  const text  = c.text?.trim() || "";
  const shareUrl = window.location.href;

  function flash(id, status) {
    setFeedback(prev => ({ ...prev, [id]: status }));
    setTimeout(() => setFeedback(prev => { const n={...prev}; delete n[id]; return n; }), 2500);
  }

  async function handle(id) {
    const shortText = text.length > 280
      ? text.substring(0, 277) + "…"
      : text;
    const fullText = buildPlainText(c);
    const md       = buildMarkdown(c);
    const obsMd    = buildObsidianMd(c);
    const notionTxt = buildNotionText(c);
    const encoded  = encodeURIComponent;

    switch (id) {
      case "native": {
        if (!navigator.share) {
          // Fallback: copy to clipboard
          const ok = await copyToClipboard(fullText);
          flash(id, ok ? "ok" : "error");
          return;
        }
        try {
          await navigator.share({
            title,
            text: text ? `${title}\n\n${shortText}` : title,
            url:  shareUrl,
          });
          flash(id, "ok");
        } catch(e) {
          if (e.name !== "AbortError") flash(id, "error");
        }
        return;
      }
      case "whatsapp": {
        const msg = `*${title}*\n\n${shortText}`;
        window.open(`https://wa.me/?text=${encoded(msg)}`, "_blank");
        flash(id, "ok"); return;
      }
      case "telegram": {
        const msg = `${title}\n\n${shortText}`;
        window.open(`https://t.me/share/url?url=${encoded(shareUrl)}&text=${encoded(msg)}`, "_blank");
        flash(id, "ok"); return;
      }
      case "facebook": {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encoded(shareUrl)}&quote=${encoded(title)}`, "_blank");
        flash(id, "ok"); return;
      }
      case "x": {
        const tweet = `${title}\n\n${shortText.substring(0, 200)}`;
        window.open(`https://twitter.com/intent/tweet?text=${encoded(tweet)}`, "_blank");
        flash(id, "ok"); return;
      }
      case "reddit": {
        window.open(`https://www.reddit.com/submit?title=${encoded(title)}&text=${encoded(text||title)}`, "_blank");
        flash(id, "ok"); return;
      }
      case "email": {
        const body = fullText;
        window.location.href = `mailto:?subject=${encoded(title)}&body=${encoded(body)}`;
        flash(id, "ok"); return;
      }
      case "obsidian": {
        const fname = `${safeTitle(c)}.md`;
        downloadFile(obsMd, fname, "text/markdown");
        flash(id, "ok"); return;
      }
      case "notion": {
        const ok = await copyToClipboard(notionTxt);
        flash(id, ok ? "ok" : "error"); return;
      }
      case "drive": {
        const fname = `${safeTitle(c)}.txt`;
        downloadFile(fullText, fname, "text/plain");
        flash(id, "ok"); return;
      }
      case "copy_md": {
        const ok = await copyToClipboard(md);
        flash(id, ok ? "ok" : "error"); return;
      }
      case "copy_text": {
        const ok = await copyToClipboard(fullText);
        flash(id, ok ? "ok" : "error"); return;
      }
      default: return;
    }
  }

  // Group targets
  const groups = [
    { key: "native",  label: null,               targets: SHARE_TARGETS.filter(t=>t.group==="native")  },
    { key: "social",  label: "Social & Messaging", targets: SHARE_TARGETS.filter(t=>t.group==="social")  },
    { key: "apps",    label: "Apps & Tools",        targets: SHARE_TARGETS.filter(t=>t.group==="apps")    },
    { key: "copy",    label: "Copy to Clipboard",   targets: SHARE_TARGETS.filter(t=>t.group==="copy")    },
  ];

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        padding: "0 0 0 0",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        animation: "shareFadeIn 0.18s ease both",
      }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: "100%", maxWidth: 520,
        background: "#0f0f1c",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "24px 24px 0 0",
        padding: "0 0 env(safe-area-inset-bottom,0)",
        boxShadow: "0 -20px 60px rgba(0,0,0,0.6)",
        animation: "shareSlideUp 0.22s cubic-bezier(0.4,0,0.2,1) both",
        maxHeight: "85vh",
        overflowY: "auto",
      }}>

        {/* Handle bar */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.18)" }} />
        </div>

        {/* Header */}
        <div style={{ padding: "12px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(248,248,255,0.38)",
                textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                Share Chronicle
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#f8f8ff",
                letterSpacing: "-0.01em", lineHeight: 1.3,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {title}
              </div>
              {text && (
                <div style={{ fontSize: 12, color: "rgba(248,248,255,0.35)", marginTop: 4,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {text.substring(0, 80)}{text.length > 80 ? "…" : ""}
                </div>
              )}
            </div>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.07)", border: "none", borderRadius: "50%",
              width: 30, height: 30, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(248,248,255,0.5)", fontSize: 16, flexShrink: 0,
            }}>✕</button>
          </div>
        </div>

        {/* Share targets */}
        <div style={{ padding: "8px 16px 20px" }}>
          {groups.map(group => (
            <div key={group.key} style={{ marginBottom: group.key === "copy" ? 0 : 4 }}>
              {group.label && (
                <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(248,248,255,0.28)",
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  padding: "12px 4px 8px" }}>
                  {group.label}
                </div>
              )}
              <div style={{
                display: "grid",
                gridTemplateColumns: group.key === "native"
                  ? "1fr"
                  : "repeat(auto-fill, minmax(140px, 1fr))",
                gap: 8,
              }}>
                {group.targets.map(target => {
                  const state = feedback[target.id];
                  const isDone  = state === "ok";
                  const isError = state === "error";
                  return (
                    <button
                      key={target.id}
                      onClick={() => handle(target.id)}
                      style={{
                        display: "flex",
                        flexDirection: group.key === "native" ? "row" : "column",
                        alignItems: group.key === "native" ? "center" : "flex-start",
                        gap: group.key === "native" ? 12 : 6,
                        padding: group.key === "native" ? "14px 16px" : "12px 14px",
                        borderRadius: 13,
                        background: isDone
                          ? "rgba(34,197,94,0.1)"
                          : isError
                          ? "rgba(239,68,68,0.1)"
                          : "rgba(255,255,255,0.04)",
                        border: isDone
                          ? "1px solid rgba(34,197,94,0.25)"
                          : isError
                          ? "1px solid rgba(239,68,68,0.25)"
                          : "1px solid rgba(255,255,255,0.08)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        textAlign: "left",
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={e => {
                        if (!state) e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                      }}
                      onMouseLeave={e => {
                        if (!state) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      }}
                    >
                      {/* Emoji / status */}
                      <div style={{
                        fontSize: group.key === "native" ? 22 : 20,
                        lineHeight: 1, flexShrink: 0,
                      }}>
                        {isDone ? "✅" : isError ? "❌" : target.emoji}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 600,
                          color: isDone ? "#4ade80" : isError ? "#f87171" : "#f8f8ff",
                          letterSpacing: "-0.01em", lineHeight: 1.3,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {isDone ? "Done!"
                            : isError ? "Failed — try again"
                            : target.label}
                        </div>
                        {group.key === "native" && (
                          <div style={{ fontSize: 11, color: "rgba(248,248,255,0.38)", marginTop: 2, lineHeight: 1.4 }}>
                            {target.desc}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Footer note */}
          <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 10,
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 11, color: "rgba(248,248,255,0.32)", lineHeight: 1.6 }}>
              <strong style={{ color: "rgba(248,248,255,0.5)" }}>Obsidian:</strong> Download the .md file → drag into your vault folder<br />
              <strong style={{ color: "rgba(248,248,255,0.5)" }}>Notion:</strong> Click "Copy Text" → open Notion → paste<br />
              <strong style={{ color: "rgba(248,248,255,0.5)" }}>Google Drive:</strong> Download .txt file → upload to Drive<br />
              <strong style={{ color: "rgba(248,248,255,0.5)" }}>Share…:</strong> Opens native share sheet on mobile (WhatsApp, Instagram, etc.)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// FONT SIZE
// ─────────────────────────────────────────────────────────────────
const FONT_MIN=12, FONT_MAX=22, FONT_STEP=2, FONT_KEY="mindoo_dump_fontsize";

function useFontSize() {
  const [size, setSize] = useState(() => {
    try { const n=parseInt(localStorage.getItem(FONT_KEY)||"15"); return isNaN(n)?15:Math.max(FONT_MIN,Math.min(FONT_MAX,n)); } catch { return 15; }
  });
  function increase() { setSize(prev=>{const n=Math.min(FONT_MAX,prev+FONT_STEP); try{localStorage.setItem(FONT_KEY,n);}catch{} return n;}); }
  function decrease() { setSize(prev=>{const n=Math.max(FONT_MIN,prev-FONT_STEP); try{localStorage.setItem(FONT_KEY,n);}catch{} return n;}); }
  return { size, increase, decrease };
}

function FontSizeControl({ size, onDecrease, onIncrease }) {
  return (
    <div style={{ display:"inline-flex",alignItems:"center",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,overflow:"hidden" }}>
      <button onClick={onDecrease} disabled={size<=FONT_MIN} title="Smaller text"
        style={{ padding:"4px 9px",background:"none",border:"none",color:size<=FONT_MIN?"rgba(255,255,255,0.18)":"rgba(248,248,255,0.5)",cursor:size<=FONT_MIN?"not-allowed":"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit",borderRight:"1px solid rgba(255,255,255,0.08)" }}>A−</button>
      <span style={{ padding:"4px 8px",fontSize:10.5,fontWeight:600,fontFamily:"var(--font-mono,monospace)",color:"rgba(248,248,255,0.35)",borderRight:"1px solid rgba(255,255,255,0.08)",minWidth:28,textAlign:"center" }}>{size}</span>
      <button onClick={onIncrease} disabled={size>=FONT_MAX} title="Larger text"
        style={{ padding:"4px 9px",background:"none",border:"none",color:size>=FONT_MAX?"rgba(255,255,255,0.18)":"rgba(248,248,255,0.5)",cursor:size>=FONT_MAX?"not-allowed":"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit" }}>A+</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// RICH TEXT (clickable URLs)
// ─────────────────────────────────────────────────────────────────
const URL_RX = /(https?:\/\/[^\s<>'")\]]+)/g;
function RichText({ text, fontSize=14, lineHeight=1.8 }) {
  if (!text) return null;
  const parts=[], orig=text;
  let last=0, match;
  URL_RX.lastIndex=0;
  while((match=URL_RX.exec(orig))!==null) {
    if(match.index>last) parts.push({type:"text",v:orig.slice(last,match.index)});
    parts.push({type:"url",v:match[0]});
    last=match.index+match[0].length;
  }
  if(last<orig.length) parts.push({type:"text",v:orig.slice(last)});
  return (
    <div style={{ fontSize,lineHeight,color:"rgba(248,248,255,0.78)",whiteSpace:"pre-wrap",wordBreak:"break-word",overflowWrap:"anywhere" }}>
      {parts.map((p,i)=> p.type==="url"
        ? <a key={i} href={p.v} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
            style={{ color:"#818cf8",textDecoration:"underline",textDecorationColor:"rgba(129,140,248,0.4)",textUnderlineOffset:3,cursor:"pointer",wordBreak:"break-all" }}
            onMouseEnter={e=>e.currentTarget.style.color="#a78bfa"}
            onMouseLeave={e=>e.currentTarget.style.color="#818cf8"}>{p.v}</a>
        : <span key={i}>{p.v}</span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────
const P = {
  copy: ["M9 9h13v13H9z","M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"],
  check:["M20 6L9 17l-5-5"],
  mic:  ["M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z","M19 10v2a7 7 0 01-14 0v-2","M12 19v4M8 23h8"],
  stop: ["M6 6h12v12H6z"],
  edit: ["M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7","M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"],
  save: ["M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z","M17 21v-8H7v8M7 3v5h8"],
  trash:["M3 6h18","M8 6V4h8v2","M19 6l-1 14H6L5 6"],
  x:    ["M18 6L6 18","M6 6l12 12"],
  timer:["M12 22a10 10 0 100-20 10 10 0 000 20z","M12 6v6l4 2"],
  share:["M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8","M16 6l-4-4-4 4","M12 2v13"],
};
function Ic({k,size=15,color="currentColor",fill="none",sw="1.5"}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,display:"block"}}>{(P[k]??[]).map((d,i)=><path key={i} d={d}/>)}</svg>;
}

// ─────────────────────────────────────────────────────────────────
// SHARED BUTTONS
// ─────────────────────────────────────────────────────────────────
function Btn({children,onClick,disabled,variant="ghost",style:sx={}}) {
  const base={display:"inline-flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:9,fontSize:12.5,fontWeight:600,cursor:disabled?"not-allowed":"pointer",border:"none",fontFamily:"inherit",transition:"all 0.15s",opacity:disabled?0.45:1};
  const V={primary:{background:"linear-gradient(135deg,#8b5cf6,#6366f1,#3b82f6)",color:"#fff"},ghost:{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(248,248,255,0.6)"},danger:{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",color:"#f87171"},success:{background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.25)",color:"#4ade80"},red:{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",color:"#f87171"}};
  return <button onClick={disabled?undefined:onClick} style={{...base,...V[variant],...sx}}>{children}</button>;
}

function IconBtn({iconKey,title,onClick,danger=false,size=14}) {
  const [h,setH]=useState(false);
  return <button title={title} onClick={e=>{e.stopPropagation();onClick?.(e);}} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:danger&&h?"rgba(239,68,68,0.12)":h?"rgba(255,255,255,0.07)":"none",border:"none",cursor:"pointer",padding:4,borderRadius:6,display:"flex",alignItems:"center",color:danger?(h?"#f87171":"rgba(248,248,255,0.28)"):"rgba(248,248,255,0.38)",transition:"all 0.15s"}}><Ic k={iconKey} size={size} color="currentColor"/></button>;
}

function CopyBtn({getText,size=14}) {
  const [ok,setOk]=useState(false);
  async function go(e) {
    e.stopPropagation();
    const t=typeof getText==="function"?getText():getText;
    if(!t?.trim()) return;
    await copyToClipboard(t);
    setOk(true); setTimeout(()=>setOk(false),2000);
  }
  return <IconBtn iconKey={ok?"check":"copy"} title={ok?"Copied!":"Copy"} onClick={go} size={size}/>;
}

function DeleteBtn({onConfirm}) {
  const [phase,setPhase]=useState("idle"); const t=useRef(null);
  useEffect(()=>()=>clearTimeout(t.current),[]);
  function click(e) {
    e.stopPropagation();
    if(phase==="idle"){setPhase("confirm"); t.current=setTimeout(()=>setPhase("idle"),3000);}
    else if(phase==="confirm"){clearTimeout(t.current);setPhase("deleting");Promise.resolve(onConfirm()).finally(()=>setPhase("idle"));}
  }
  if(phase==="deleting") return <span style={{fontSize:11,color:"var(--dim)"}}>Deleting…</span>;
  return <button onClick={click} style={{display:"flex",alignItems:"center",gap:4,padding:phase==="confirm"?"3px 9px":"4px",borderRadius:6,border:phase==="confirm"?"1px solid rgba(239,68,68,0.3)":"none",background:phase==="confirm"?"rgba(239,68,68,0.12)":"none",color:phase==="confirm"?"#f87171":"rgba(248,248,255,0.28)",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",whiteSpace:"nowrap"}} onMouseEnter={e=>{if(phase==="idle")e.currentTarget.style.color="#f87171";}} onMouseLeave={e=>{if(phase==="idle")e.currentTarget.style.color="rgba(248,248,255,0.28)";}}>
    <Ic k="trash" size={12} color="currentColor"/>{phase==="confirm"&&"Confirm?"}
  </button>;
}

// ─────────────────────────────────────────────────────────────────
// SPEECH-TO-TEXT
// ─────────────────────────────────────────────────────────────────
function SpeechBtn({onTranscript}) {
  const [on,setOn]=useState(false); const [sup,setSup]=useState(false); const recRef=useRef(null);
  useEffect(()=>{ setSup(!!(window.SpeechRecognition||window.webkitSpeechRecognition)); },[]);
  function toggle(e) {
    e.stopPropagation();
    if(on){recRef.current?.stop();setOn(false);return;}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR) return;
    const r=new SR(); r.continuous=true; r.interimResults=false; r.lang="en-US";
    r.onresult=ev=>{const t=Array.from(ev.results).map(r=>r[0].transcript).join(" ");onTranscript(t);};
    r.onerror=()=>setOn(false); r.onend=()=>setOn(false);
    recRef.current=r; r.start(); setOn(true);
  }
  if(!sup) return null;
  return <button onClick={toggle} title={on?"Stop speech-to-text":"Speech-to-text"} style={{background:on?"rgba(139,92,246,0.18)":"none",border:on?"1px solid rgba(139,92,246,0.4)":"none",borderRadius:6,cursor:"pointer",padding:"4px 6px",display:"flex",alignItems:"center",gap:4,color:on?"#a78bfa":"rgba(248,248,255,0.38)",fontSize:10.5,fontWeight:600,fontFamily:"inherit",transition:"all 0.15s",whiteSpace:"nowrap"}} onMouseEnter={e=>{if(!on)e.currentTarget.style.background="rgba(255,255,255,0.07)";}} onMouseLeave={e=>{if(!on)e.currentTarget.style.background="none";}}><Ic k="mic" size={14} color="currentColor"/>{on&&<span style={{animation:"stPulse 1.2s ease-in-out infinite"}}>Listening…</span>}</button>;
}

// ─────────────────────────────────────────────────────────────────
// MEDIA RECORDER
// ─────────────────────────────────────────────────────────────────
function useRecorder() {
  const [state,setState]=useState("idle"); const [secs,setSecs]=useState(0); const [recError,setRecError]=useState("");
  const mediaRef=useRef(null); const chunksRef=useRef([]); const timerRef=useRef(null);
  const supported=typeof window!=="undefined"&&!!navigator.mediaDevices?.getUserMedia;
  const start=useCallback(()=>new Promise(async(resolve,reject)=>{
    setRecError(""); setState("requesting"); setSecs(0); chunksRef.current=[];
    try {
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      const mime=MediaRecorder.isTypeSupported("audio/webm;codecs=opus")?"audio/webm;codecs=opus":MediaRecorder.isTypeSupported("audio/webm")?"audio/webm":MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")?"audio/ogg;codecs=opus":"";
      const rec=new MediaRecorder(stream,mime?{mimeType:mime}:{});
      mediaRef.current=rec;
      rec.ondataavailable=e=>{if(e.data?.size>0)chunksRef.current.push(e.data);};
      rec.onstop=()=>{ stream.getTracks().forEach(t=>t.stop()); clearInterval(timerRef.current); setState("idle"); resolve(new Blob(chunksRef.current,{type:rec.mimeType||"audio/webm"})); };
      rec.onerror=err=>{ stream.getTracks().forEach(t=>t.stop()); clearInterval(timerRef.current); setState("idle"); setRecError("Recording failed."); reject(err); };
      rec.start(250); setState("recording");
      timerRef.current=setInterval(()=>setSecs(s=>s+1),1000);
    } catch(err) { setState("idle"); setRecError(err.name==="NotAllowedError"?"Microphone denied. Allow it in browser settings.":`Mic error: ${err.message}`); reject(err); }
  }),[]);
  const stop=useCallback(()=>{mediaRef.current?.state==="recording"&&mediaRef.current.stop();},[]);
  const cancel=useCallback(()=>{ if(mediaRef.current?.state==="recording"){mediaRef.current.onstop=()=>{};mediaRef.current.stop();} clearInterval(timerRef.current);setState("idle");setSecs(0); },[]);
  return{state,secs,recError,supported,start,stop,cancel};
}

function WaveBars({color="#f87171",n=18}) {
  return <div style={{display:"flex",alignItems:"center",gap:2.5,height:28}}>{Array.from({length:n}).map((_,i)=><div key={i} style={{width:2.5,borderRadius:2,background:color,animation:`wvBar ${0.38+(i%5)*0.09}s ease-in-out infinite alternate`,animationDelay:`${i*0.045}s`,transformOrigin:"bottom"}}/>)}</div>;
}

// Inject CSS once
if(typeof document!=="undefined"&&!document.getElementById("dump-css")){
  const s=document.createElement("style"); s.id="dump-css";
  s.textContent=`
    @keyframes wvBar{from{transform:scaleY(0.25);opacity:0.5}to{transform:scaleY(1);opacity:1}}
    @keyframes sessionPulse{0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,0)}50%{box-shadow:0 0 0 8px rgba(139,92,246,0.12)}}
    @keyframes stPulse{0%,100%{opacity:1}50%{opacity:0.5}}
    @keyframes shareFadeIn{from{opacity:0}to{opacity:1}}
    @keyframes shareSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
  `;
  document.head.appendChild(s);
}

// ─────────────────────────────────────────────────────────────────
// VOICE NOTE PANEL
// ─────────────────────────────────────────────────────────────────
function VoiceNotePanel({userId,title,onSaved}) {
  const{state,secs,recError,supported,start,stop,cancel}=useRecorder();
  const[uploading,setUploading]=useState(false); const[upError,setUpError]=useState(""); const blobRef=useRef(null);
  if(!supported) return <div style={{padding:20,textAlign:"center",fontSize:13,color:"var(--dim)"}}>Voice recording not supported. Try Chrome or Edge.</div>;
  const isRec=state==="recording"; const isReq=state==="requesting";
  async function handleStop(){stop();setUploading(true);try{const blob=await blobRef.current;if(!blob||blob.size<100)throw new Error("Too short.");const{data,error}=await saveVoiceChronicle({userId,title,blob,duration:secs});if(error)throw error;onSaved?.(data);}catch(err){setUpError(err.message||"Upload failed.");}finally{setUploading(false);}}
  return(
    <div style={{background:isRec?"rgba(239,68,68,0.05)":"rgba(255,255,255,0.025)",border:`1px solid ${isRec?"rgba(239,68,68,0.22)":"rgba(255,255,255,0.09)"}`,borderRadius:14,padding:"15px 18px",transition:"all 0.25s"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:32,height:32,borderRadius:"50%",flexShrink:0,background:isRec?"rgba(239,68,68,0.14)":"rgba(139,92,246,0.12)",border:`1px solid ${isRec?"rgba(239,68,68,0.28)":"rgba(139,92,246,0.2)"}`,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic k="mic" size={15} color={isRec?"#f87171":"#a78bfa"}/></div>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:isRec?"#f87171":"rgba(248,248,255,0.8)"}}>{isReq?"Starting mic…":isRec?"Recording…":uploading?"Saving…":"Voice Note"}</div>{!isRec&&!uploading&&!isReq&&<div style={{fontSize:11,color:"var(--dim)",marginTop:1}}>Record audio — plays back in the chronicle</div>}</div>
        {!isRec&&!uploading&&!isReq&&<Btn variant="primary" onClick={()=>{setUpError("");blobRef.current=start();}}><Ic k="mic" size={13} color="#fff"/> Start</Btn>}
      </div>
      {isRec&&<div style={{marginTop:14}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><WaveBars/><span style={{marginLeft:"auto",fontFamily:"var(--font-mono,monospace)",fontSize:20,fontWeight:700,color:"#f87171"}}>{fmtSecs(secs)}</span></div><div style={{display:"flex",gap:8}}><Btn variant="primary" onClick={handleStop} style={{flex:1}}><Ic k="stop" size={12} color="#fff" fill="#fff"/> Stop & Save</Btn><Btn variant="ghost" onClick={cancel}>Discard</Btn></div></div>}
      {uploading&&<div style={{fontSize:12,color:"rgba(248,248,255,0.4)",marginTop:10}}>⬆ Uploading…</div>}
      {(recError||upError)&&<div style={{marginTop:10,padding:"8px 12px",borderRadius:8,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",fontSize:12,color:"#f87171"}}>{recError||upError}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SESSION MODE
// ─────────────────────────────────────────────────────────────────
function SessionMode({userId,fontSize,onDone}) {
  const[timerMins,setTimerMins]=useState(10); const[phase,setPhase]=useState("setup");
  const[elapsed,setElapsed]=useState(0); const[text,setText]=useState(""); const[sessionTitle,setSessionTitle]=useState("");
  const[saving,setSaving]=useState(false); const[saveError,setSaveError]=useState("");
  const{state:recState,secs:recSecs,recError,supported:micOk,start:startRec,stop:stopRec,cancel:cancelRec}=useRecorder();
  const blobPromRef=useRef(null); const[voiceBlob,setVoiceBlob]=useState(null); const[voiceSecs,setVoiceSecs]=useState(0);
  const timerRef=useRef(null); const totalSecs=timerMins*60; const remaining=Math.max(0,totalSecs-elapsed);
  const pct=Math.min(100,(elapsed/totalSecs)*100); const wordCount=text.trim().split(/\s+/).filter(Boolean).length;

  useEffect(()=>{
    if(phase==="running"){timerRef.current=setInterval(()=>{setElapsed(prev=>{if(prev+1>=totalSecs){clearInterval(timerRef.current);setPhase("ended");return totalSecs;}return prev+1;});},1000);}
    return()=>clearInterval(timerRef.current);
  },[phase,totalSecs]);

  function handleStart(){setElapsed(0);setText("");setVoiceBlob(null);setVoiceSecs(0);setSaveError("");setPhase("running");}
  function handleEndEarly(){clearInterval(timerRef.current);if(recState==="recording")stopRec();setPhase("ended");}
  async function handleStopVoice(){stopRec();try{const blob=await blobPromRef.current;setVoiceBlob(blob);setVoiceSecs(recSecs);}catch{}}

  async function handleSaveSession(){
    setSaving(true);setSaveError("");
    try{
      let audioUrl="";
      if(voiceBlob&&voiceBlob.size>100){const{url,error:upErr}=await uploadVoiceBlob({userId,blob:voiceBlob});if(upErr)throw upErr;audioUrl=url;}
      const analysis=text.trim().length>20?await analyzeChronicle(text).catch(()=>null):null;
      const{data,error}=await saveSessionChronicle({userId,title:sessionTitle.trim()||`Session — ${new Date().toLocaleDateString([],{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}`,text:text.trim(),wordCount,audioUrl,duration:elapsed,analysis});
      if(error)throw error; onDone?.(data);
    }catch(err){setSaveError(err.message||"Save failed.");}finally{setSaving(false);}
  }

  if(phase==="setup") return(
    <div style={{background:"rgba(139,92,246,0.05)",border:"1px solid rgba(139,92,246,0.2)",borderRadius:18,padding:"28px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}><div style={{width:40,height:40,borderRadius:12,background:"rgba(139,92,246,0.15)",border:"1px solid rgba(139,92,246,0.28)",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic k="timer" size={20} color="#a78bfa"/></div><div><div style={{fontSize:15,fontWeight:700,color:"#f8f8ff"}}>Brain Dump Session</div><div style={{fontSize:12,color:"var(--dim)"}}>Set a timer. Empty your mind completely. No rules.</div></div></div>
      <div style={{marginBottom:22}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10}}><span style={{fontSize:12,fontWeight:600,color:"rgba(248,248,255,0.55)",textTransform:"uppercase",letterSpacing:"0.06em"}}>Duration</span><span style={{fontFamily:"var(--font-mono,monospace)",fontSize:22,fontWeight:800,color:"#a78bfa",letterSpacing:"-0.03em"}}>{fmtMins(timerMins)}</span></div>
        <input type="range" min={1} max={120} value={timerMins} onChange={e=>setTimerMins(Number(e.target.value))} style={{width:"100%",accentColor:"#8b5cf6",cursor:"pointer"}}/>
        <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>{[2,5,10,15,25,30,45,60,90].map(m=><button key={m} onClick={()=>setTimerMins(m)} style={{padding:"4px 10px",borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",background:timerMins===m?"rgba(139,92,246,0.25)":"rgba(255,255,255,0.04)",border:timerMins===m?"1px solid rgba(139,92,246,0.45)":"1px solid rgba(255,255,255,0.08)",color:timerMins===m?"#c4b5fd":"rgba(248,248,255,0.4)"}}>{m}m</button>)}</div>
      </div>
      <div style={{background:"rgba(255,255,255,0.02)",borderRadius:10,padding:"12px 14px",marginBottom:20,fontSize:12,color:"rgba(248,248,255,0.42)",lineHeight:1.7}}>A focused writing space with a countdown. Type everything. Record your voice. Both save together as one chronicle.</div>
      <Btn variant="primary" onClick={handleStart} style={{width:"100%",justifyContent:"center",padding:"12px"}}><Ic k="timer" size={14} color="#fff"/> Start {fmtMins(timerMins)} Session</Btn>
    </div>
  );

  if(phase==="running"){
    const isRec=recState==="recording";
    return(
      <div style={{background:"rgba(9,9,15,0.98)",border:"1px solid rgba(139,92,246,0.25)",borderRadius:18,padding:"22px 24px",animation:"sessionPulse 4s ease-in-out infinite"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div><div style={{fontFamily:"var(--font-mono,monospace)",fontSize:32,fontWeight:800,color:remaining<60?"#f87171":"#a78bfa",letterSpacing:"-0.04em",lineHeight:1}}>{fmtSecs(remaining)}</div><div style={{fontSize:11,color:"var(--dim)",marginTop:2}}>{fmtSecs(elapsed)} elapsed · {wordCount} words</div></div>
          <Btn variant="ghost" onClick={handleEndEarly} style={{fontSize:12,padding:"7px 12px"}}>End Early</Btn>
        </div>
        <div style={{height:3,borderRadius:2,background:"rgba(255,255,255,0.07)",marginBottom:18,overflow:"hidden"}}><div style={{height:"100%",borderRadius:2,transition:"width 1s linear",width:`${pct}%`,background:remaining<60?"linear-gradient(90deg,#f97316,#f87171)":"linear-gradient(90deg,#8b5cf6,#6366f1,#3b82f6)"}}/></div>
        <textarea placeholder={"Everything in your head — right now.\n\nDon't think. Don't edit. Just type. All of it."} value={text} onChange={e=>setText(e.target.value)} autoFocus style={{width:"100%",minHeight:220,background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"16px 18px",color:"#f8f8ff",fontSize:fontSize,fontFamily:"var(--font-body,'Inter',sans-serif)",resize:"vertical",outline:"none",lineHeight:1.82,boxSizing:"border-box",marginBottom:14,transition:"border-color 0.2s,font-size 0.2s"}} onFocus={e=>e.target.style.borderColor="rgba(139,92,246,0.3)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.07)"}/>
        {micOk&&<div style={{background:isRec?"rgba(239,68,68,0.06)":"rgba(255,255,255,0.025)",border:`1px solid ${isRec?"rgba(239,68,68,0.22)":"rgba(255,255,255,0.07)"}`,borderRadius:12,padding:"12px 14px",marginBottom:16,transition:"all 0.2s"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Ic k="mic" size={15} color={isRec?"#f87171":"rgba(248,248,255,0.35)"}/>
            {isRec?<><WaveBars color="#f87171" n={14}/><span style={{fontFamily:"var(--font-mono,monospace)",fontSize:16,fontWeight:700,color:"#f87171",marginLeft:"auto"}}>{fmtSecs(recSecs)}</span><Btn variant="red" onClick={handleStopVoice} style={{padding:"5px 12px",fontSize:11}}><Ic k="stop" size={11} color="#f87171" fill="#f87171"/> Stop</Btn><Btn variant="ghost" onClick={cancelRec} style={{padding:"5px 10px",fontSize:11}}>Discard</Btn></>
            :voiceBlob?<><span style={{fontSize:12,color:"#4ade80"}}>✓ Voice recorded ({fmtSecs(voiceSecs)})</span><Btn variant="ghost" onClick={()=>{setVoiceBlob(null);setVoiceSecs(0);}} style={{marginLeft:"auto",fontSize:11,padding:"4px 10px"}}>Re-record</Btn></>
            :<><span style={{fontSize:12,color:"rgba(248,248,255,0.4)"}}>Add voice to this session</span><Btn variant="ghost" onClick={()=>{blobPromRef.current=startRec();}} style={{marginLeft:"auto",fontSize:11,padding:"5px 12px"}}>Record</Btn></>}
          </div>
          {recError&&<div style={{fontSize:11,color:"#f87171",marginTop:8}}>{recError}</div>}
        </div>}
      </div>
    );
  }

  return(
    <div style={{background:"rgba(34,197,94,0.04)",border:"1px solid rgba(34,197,94,0.18)",borderRadius:18,padding:"24px"}}>
      <div style={{textAlign:"center",marginBottom:22}}><div style={{fontSize:36,marginBottom:8}}>✅</div><div style={{fontFamily:"var(--font-display,'Sora',sans-serif)",fontWeight:800,fontSize:18,letterSpacing:"-0.02em",color:"#f8f8ff",marginBottom:4}}>Session complete</div><div style={{fontSize:13,color:"var(--dim)"}}>{fmtSecs(elapsed)} · {wordCount} words{voiceBlob?` · Voice (${fmtSecs(voiceSecs)})`:""}</div></div>
      <div style={{marginBottom:14}}><div style={{fontSize:11,fontWeight:600,color:"rgba(248,248,255,0.45)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Title (optional)</div><input type="text" value={sessionTitle} onChange={e=>setSessionTitle(e.target.value)} placeholder="e.g. Monday morning mind clear…" style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"10px 14px",color:"#f8f8ff",fontSize:13.5,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor="rgba(139,92,246,0.5)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/></div>
      {text.trim()&&<div style={{background:"rgba(255,255,255,0.02)",borderRadius:10,padding:"12px 14px",marginBottom:14,maxHeight:140,overflowY:"auto",borderLeft:"2px solid rgba(139,92,246,0.3)"}}><RichText text={text.trim()} fontSize={fontSize} lineHeight={1.7}/></div>}
      {voiceBlob&&<div style={{marginBottom:14,padding:"10px 12px",background:"rgba(139,92,246,0.06)",borderRadius:10,border:"1px solid rgba(139,92,246,0.2)",fontSize:12,color:"#a78bfa"}}>🎙️ Voice ({fmtSecs(voiceSecs)}) will be attached</div>}
      {saveError&&<div style={{marginBottom:12,padding:"9px 12px",borderRadius:9,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",fontSize:12,color:"#f87171"}}>{saveError}</div>}
      <div style={{display:"flex",gap:9}}><Btn variant="primary" onClick={handleSaveSession} disabled={saving} style={{flex:1,justifyContent:"center",padding:"11px 0"}}>{saving?"Saving…":"💾 Save Session Chronicle"}</Btn><Btn variant="ghost" onClick={()=>{if(recState==="recording")cancelRec();onDone?.(null);}} disabled={saving}>Discard</Btn></div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CHRONICLE ITEM
// ─────────────────────────────────────────────────────────────────
function ChronicleItem({c,expanded,onToggle,onUpdate,onDelete,fontSize}) {
  const[editingTitle,setEditingTitle]=useState(false); const[editTitle,setEditTitle]=useState(c.title||"");
  const[editingText,setEditingText]=useState(false);   const[editText,setEditText]=useState(c.text||"");
  const[saving,setSaving]=useState(false);
  const[showShare,setShowShare]=useState(false);

  const isVoice=c.origin==="voice"; const isSession=c.origin==="session";

  async function saveTitle(){if(editTitle===(c.title||"")){setEditingTitle(false);return;}setSaving(true);await onUpdate(c.id,{title:editTitle});setSaving(false);setEditingTitle(false);}
  async function saveText(){if(editText===(c.text||"")){setEditingText(false);return;}setSaving(true);await onUpdate(c.id,{text:editText});setSaving(false);setEditingText(false);}
  const displayTitle=c.title||c.ai_summary||(isVoice?"Voice Note":isSession?"Dump Session":"Brain Dump");

  return(
    <>
      {showShare && <SharePanel c={c} onClose={()=>setShowShare(false)}/>}
      <div onClick={()=>!editingTitle&&!editingText&&onToggle()}
        style={{borderRadius:14,marginBottom:10,overflow:"hidden",border:`1px solid ${expanded?"rgba(139,92,246,0.2)":"rgba(255,255,255,0.07)"}`,background:expanded?"rgba(255,255,255,0.035)":"rgba(255,255,255,0.02)",cursor:(editingTitle||editingText)?"default":"pointer",transition:"all 0.18s"}}>

        {/* Header */}
        <div style={{padding:"12px 14px",display:"flex",alignItems:"flex-start",gap:10}}>
          <div style={{width:30,height:30,borderRadius:9,flexShrink:0,background:isVoice?"rgba(139,92,246,0.14)":isSession?"rgba(99,102,241,0.14)":"rgba(139,92,246,0.09)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{originIcon(c.origin)}</div>
          <div style={{flex:1,minWidth:0}}>

            {/* Title */}
            {editingTitle?(
              <div onClick={e=>e.stopPropagation()} style={{display:"flex",gap:7,alignItems:"center",marginBottom:4}}>
                <input autoFocus value={editTitle} onChange={e=>setEditTitle(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")saveTitle();if(e.key==="Escape"){setEditTitle(c.title||"");setEditingTitle(false);}}} style={{flex:1,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(139,92,246,0.45)",borderRadius:7,padding:"5px 10px",color:"#f8f8ff",fontSize:13.5,fontWeight:700,fontFamily:"inherit",outline:"none"}}/>
                <Btn variant="primary" onClick={saveTitle} disabled={saving} style={{padding:"5px 12px",fontSize:11}}>{saving?"…":"Save"}</Btn>
                <Btn variant="ghost" onClick={()=>{setEditTitle(c.title||"");setEditingTitle(false);}} style={{padding:"5px 10px",fontSize:11}}>Cancel</Btn>
              </div>
            ):(
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                <span style={{fontSize:13.5,fontWeight:700,color:"#f8f8ff",letterSpacing:"-0.01em",lineHeight:1.3}}>{displayTitle}</span>
                {(isVoice||isSession)&&<span style={{fontSize:10,fontWeight:600,padding:"1px 7px",borderRadius:100,background:"rgba(139,92,246,0.15)",border:"1px solid rgba(139,92,246,0.25)",color:"#a78bfa"}}>{isSession?"Session":"Voice"}</span>}
              </div>
            )}

            {/* Meta row */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:4}}>
              <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                <span style={{fontSize:11,color:"var(--dim)"}}>{fmtDate(c.created_at)}</span>
                {c.duration_secs>0&&<span style={{fontSize:11,color:"var(--dim)"}}>{fmtSecs(c.duration_secs)}</span>}
                {c.word_count>0&&<span style={{fontSize:11,color:"var(--dim)"}}>{c.word_count} words</span>}
                {c.chaos_score>0&&<span style={{fontSize:11,fontWeight:600,color:chaosColor(c.chaos_score)}}>Chaos {c.chaos_score}</span>}
                {c.emotional_tone&&c.emotional_tone!=="neutral"&&<span style={{fontSize:11,color:"var(--dim)"}}>{toneEmoji(c.emotional_tone)} {c.emotional_tone}</span>}
              </div>
              {/* Action buttons — now includes share */}
              <div style={{display:"flex",alignItems:"center",gap:2}}>
                {!isVoice&&<CopyBtn getText={()=>c.text} size={13}/>}
                <IconBtn iconKey="edit" title="Edit title" size={13} onClick={()=>{setEditTitle(c.title||"");setEditingTitle(true);}}/>
                {/* SHARE BUTTON */}
                <button
                  title="Share this chronicle"
                  onClick={e=>{e.stopPropagation();setShowShare(true);}}
                  style={{background:"none",border:"none",cursor:"pointer",padding:4,borderRadius:6,display:"flex",alignItems:"center",color:"rgba(248,248,255,0.38)",transition:"all 0.15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(139,92,246,0.1)";e.currentTarget.style.color="#a78bfa";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color="rgba(248,248,255,0.38)";}}
                >
                  <Ic k="share" size={13} color="currentColor"/>
                </button>
                <DeleteBtn onConfirm={()=>onDelete(c.id)}/>
              </div>
            </div>

            {/* Tags */}
            {(c.themes??[]).length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:7}}>{c.themes.map(t=><span key={t} style={{fontSize:10.5,padding:"2px 8px",borderRadius:100,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",color:"rgba(248,248,255,0.45)"}}>{t}</span>)}</div>}
          </div>
        </div>

        {/* Expanded content */}
        {expanded&&(
          <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",padding:"14px 14px 16px"}} onClick={e=>e.stopPropagation()}>
            {c.audio_url&&<div style={{marginBottom:c.text?16:0}}><div style={{fontSize:11,color:"var(--dim)",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600}}>🎙️ Voice Recording</div><audio controls src={c.audio_url} style={{width:"100%",height:38,outline:"none",borderRadius:8,accentColor:"#8b5cf6"}}/></div>}
            {c.text&&!editingText&&(<>
              <div style={{fontSize:11,color:"var(--dim)",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600}}>✍️ Written Content</div>
              <div style={{padding:"14px 16px",background:"rgba(255,255,255,0.025)",borderRadius:10,borderLeft:"2px solid rgba(139,92,246,0.28)",marginBottom:10}}>
                <RichText text={c.text} fontSize={fontSize} lineHeight={1.82}/>
              </div>
              <Btn variant="ghost" onClick={()=>{setEditText(c.text||"");setEditingText(true);}} style={{fontSize:11,padding:"5px 12px"}}><Ic k="edit" size={11} color="currentColor"/> Edit text</Btn>
            </>)}
            {editingText&&(<>
              <textarea value={editText} onChange={e=>setEditText(e.target.value)} autoFocus style={{width:"100%",minHeight:100,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(139,92,246,0.4)",borderRadius:10,padding:"11px 13px",color:"#f8f8ff",fontSize:fontSize,fontFamily:"inherit",resize:"vertical",outline:"none",lineHeight:1.75,boxSizing:"border-box",marginBottom:8,transition:"font-size 0.2s"}}/>
              <div style={{display:"flex",gap:7}}><Btn variant="primary" onClick={saveText} disabled={saving} style={{fontSize:11,padding:"6px 14px"}}><Ic k="save" size={12} color="#fff"/>{saving?"Saving…":"Save"}</Btn><Btn variant="ghost" onClick={()=>{setEditText(c.text||"");setEditingText(false);}} style={{fontSize:11,padding:"6px 12px"}}>Cancel</Btn></div>
            </>)}
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────
export function BrainDump({userId,onChronicleAdded}) {
  const[text,setText]=useState(""); const[title,setTitle]=useState("");
  const[chronicles,setChronicles]=useState([]); const[status,setStatus]=useState("idle");
  const[errorMsg,setErrorMsg]=useState(""); const[expanded,setExpanded]=useState(null);
  const[activeTab,setActiveTab]=useState("text");
  const{size:fontSize,increase:fontIncrease,decrease:fontDecrease}=useFontSize();
  const wordCount=text.trim().split(/\s+/).filter(Boolean).length;

  const handleTranscript=useCallback((t)=>{ setText(prev=>prev.trim()?prev+" "+t:t); },[]);

  useEffect(()=>{ if(!userId) return; loadChronicles(userId,40).then(({data})=>setChronicles(data)); },[userId]);

  const handleSave=useCallback(async()=>{
    if(!text.trim()||!userId) return;
    setStatus("analyzing"); setErrorMsg("");
    try{
      const analysis=await analyzeChronicle(text);
      setStatus("saving");
      const{data,error}=await saveChronicle({userId,title,text:text.trim(),wordCount,analysis});
      if(error) throw error;
      setChronicles(prev=>[data,...prev]); setText(""); setTitle(""); setStatus("saved");
      onChronicleAdded?.(); setTimeout(()=>setStatus("idle"),2500);
    }catch(err){ setStatus("error"); setErrorMsg(err.message||"Save failed."); setTimeout(()=>setStatus("idle"),3000); }
  },[text,title,userId,wordCount,onChronicleAdded]);

  const handleVoiceSaved  =useCallback((d)=>{ if(d) setChronicles(p=>[d,...p]); onChronicleAdded?.(); },[onChronicleAdded]);
  const handleSessionDone =useCallback((d)=>{ if(d) setChronicles(p=>[d,...p]); onChronicleAdded?.(); setActiveTab("text"); },[onChronicleAdded]);
  const handleUpdate=useCallback(async(id,fields)=>{ const{error}=await updateChronicle(id,fields); if(!error) setChronicles(p=>p.map(c=>c.id===id?{...c,...fields,word_count:fields.text!==undefined?fields.text.trim().split(/\s+/).filter(Boolean).length:c.word_count}:c)); return{error}; },[]);
  const handleDelete=useCallback(async(id)=>{ const{error}=await deleteChronicle(id); if(!error){setChronicles(p=>p.filter(c=>c.id!==id));onChronicleAdded?.();} return{error}; },[onChronicleAdded]);

  const isBusy=status==="saving"||status==="analyzing";
  const TAB=({id,label,emoji})=><button onClick={()=>setActiveTab(id)} style={{flex:1,padding:"9px 0",borderRadius:9,fontSize:12.5,fontWeight:600,cursor:"pointer",border:"none",fontFamily:"inherit",transition:"all 0.15s",background:activeTab===id?"rgba(139,92,246,0.18)":"none",color:activeTab===id?"#c4b5fd":"rgba(248,248,255,0.38)",boxShadow:activeTab===id?"inset 0 0 0 1px rgba(139,92,246,0.35)":"none"}}>{emoji} {label}</button>;

  return(
    <div className="section-scroll">
      <div className="section-content">
        <div className="section-eyebrow">Module · Capture</div>
        <h1 className="section-heading gradient-text">Brain Dump Sanctuary</h1>
        <p className="section-subheading">Zero friction. Zero judgment. Zero organization. Just empty your mind.</p>

        {/* Tabs */}
        <div style={{display:"flex",gap:4,padding:5,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:13,marginBottom:18}}>
          <TAB id="text" label="Write" emoji="✍️"/><TAB id="voice" label="Voice" emoji="🎙️"/><TAB id="session" label="Session" emoji="⏱️"/>
        </div>

        {/* Write tab */}
        {activeTab==="text"&&(<>
          <input type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title (optional) — leave blank for AI to name it" style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:10,padding:"9px 14px",color:"#f8f8ff",fontSize:13.5,fontWeight:600,fontFamily:"var(--font-display,'Sora',sans-serif)",outline:"none",boxSizing:"border-box",marginBottom:10,transition:"border-color 0.2s"}} onFocus={e=>e.target.style.borderColor="rgba(139,92,246,0.45)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.09)"}/>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
            <span style={{fontSize:11,color:"var(--dim)"}}>Font size</span>
            <FontSizeControl size={fontSize} onDecrease={fontDecrease} onIncrease={fontIncrease}/>
          </div>
          <div style={{position:"relative",marginBottom:12}}>
            <textarea className="dump-textarea" style={{marginBottom:0,paddingBottom:44,fontSize:fontSize,transition:"font-size 0.2s"}} rows={9} placeholder={"Start typing anything in your head…\n\ngroceries, that thing Sarah said, project deadline, feeling weird about the meeting, taxes — TAXES, why am I tired…\n\nNo rules. No formatting. Just get it out."} value={text} onChange={e=>setText(e.target.value)}/>
            <div style={{position:"absolute",bottom:10,right:10,display:"flex",alignItems:"center",gap:4}}>
              <SpeechBtn onTranscript={handleTranscript}/>
              <CopyBtn getText={()=>text} size={15}/>
            </div>
          </div>
          {errorMsg&&<div className="alert alert-error" style={{marginBottom:12}}>{errorMsg}</div>}
          <div className="dump-actions">
            <button className={status==="saved"?"btn btn-success":status==="error"?"btn btn-danger":isBusy?"btn btn-ghost":"btn btn-primary"} onClick={handleSave} disabled={!text.trim()||isBusy}>
              {status==="idle"&&"💾 Save Chronicle"}{status==="analyzing"&&"🧠 Analysing…"}{status==="saving"&&"Saving…"}{status==="saved"&&"✓ Saved"}{status==="error"&&"Error — try again"}
            </button>
            <button className="btn btn-ghost" onClick={()=>{setText("");setTitle("");setStatus("idle");setErrorMsg("");}} disabled={!text.trim()&&!title.trim()}>Clear</button>
            <span className="word-count">{wordCount} words</span>
          </div>
          {status==="analyzing"&&<p style={{fontSize:12,color:"rgba(139,92,246,0.7)",marginTop:8}}>🧠 Mindoo is reading your dump…</p>}
        </>)}

        {activeTab==="voice"&&<VoiceNotePanel userId={userId} title={title} onSaved={handleVoiceSaved}/>}
        {activeTab==="session"&&<SessionMode userId={userId} fontSize={fontSize} onDone={handleSessionDone}/>}

        <div className="divider"/>

        {/* Chronicles header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
          <h2 className="section-title" style={{margin:0}}>Your Chronicles</h2>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <FontSizeControl size={fontSize} onDecrease={fontDecrease} onIncrease={fontIncrease}/>
            <span style={{fontSize:12,color:"var(--dim)",fontFamily:"var(--font-mono)"}}>{chronicles.length} saved</span>
          </div>
        </div>

        {chronicles.length===0&&(
          <div className="empty-state">
            <div className="empty-state-icon">🧠</div>
            <div className="empty-state-title">No chronicles yet</div>
            <div className="empty-state-desc">Write, record, or run a timed session</div>
          </div>
        )}

        {chronicles.map(c=>(
          <ChronicleItem key={c.id} c={c} expanded={expanded===c.id}
            onToggle={()=>setExpanded(p=>p===c.id?null:c.id)}
            onUpdate={handleUpdate} onDelete={handleDelete} fontSize={fontSize}/>
        ))}
      </div>
    </div>
  );
}
