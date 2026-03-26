import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS + ALL STYLES  (injected once, never external files)
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;background:#09090f;color:#f8f8ff;font-family:'Inter',sans-serif}

:root{
  --bg:#09090f; --surf:#0d0d18; --s2:#121220;
  --card:rgba(255,255,255,0.028); --cb:rgba(255,255,255,0.07); --ch:rgba(255,255,255,0.05);
  --purple:#8b5cf6; --indigo:#6366f1; --blue:#3b82f6; --cyan:#06b6d4;
  --green:#22c55e; --amber:#f59e0b; --pink:#ec4899; --red:#ef4444;
  --text:#f8f8ff; --muted:rgba(248,248,255,0.52); --dim:rgba(248,248,255,0.28); --hint:rgba(248,248,255,0.1);
  --grad:linear-gradient(135deg,#8b5cf6,#6366f1,#3b82f6);
  --r:14px; --rsm:10px; --rxs:6px;
}

::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}

/* ── ROOT LAYOUT ── */
.md-wrap{display:flex;height:100vh;overflow:hidden;position:relative;z-index:1}
.bg-glow{
  position:fixed;inset:0;pointer-events:none;z-index:0;
  background:
    radial-gradient(ellipse 55% 40% at 18% 8%,rgba(139,92,246,0.07) 0%,transparent 70%),
    radial-gradient(ellipse 45% 35% at 82% 82%,rgba(59,130,246,0.055) 0%,transparent 70%)
}

/* ── SIDEBAR ── */
.sb{
  width:232px;flex-shrink:0;background:var(--surf);border-right:1px solid var(--cb);
  display:flex;flex-direction:column;height:100vh;overflow:hidden;
  transition:transform .28s cubic-bezier(.4,0,.2,1);z-index:50
}
.sb-logo{padding:18px 16px 14px;border-bottom:1px solid var(--cb);flex-shrink:0}
.sb-logo-text{
  font-family:'Sora',sans-serif;font-weight:800;font-size:20px;letter-spacing:-0.04em;
  background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text
}
.sb-logo-sub{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--dim);letter-spacing:.12em;text-transform:uppercase;margin-top:2px}
.sb-scroll{flex:1;overflow-y:auto;padding:10px}
.sb-section{margin-bottom:6px}
.sb-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim);padding:6px 8px 4px;display:block}
.sb-item{
  display:flex;align-items:center;gap:8px;padding:8px 9px;border-radius:var(--rsm);
  cursor:pointer;transition:all .15s;border:1px solid transparent;
  font-size:13px;font-weight:500;color:var(--muted);
  width:100%;background:none;text-align:left;font-family:'Inter',sans-serif
}
.sb-item:hover{background:var(--card);color:var(--text)}
.sb-item.on{background:rgba(139,92,246,0.1);color:var(--text);border-color:rgba(139,92,246,0.2)}
.sb-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.sb-badge{
  margin-left:auto;font-size:9px;font-weight:700;letter-spacing:.04em;
  background:rgba(139,92,246,0.18);color:#a78bfa;
  border:1px solid rgba(139,92,246,0.25);border-radius:100px;padding:1px 7px;
  font-family:'JetBrains Mono',monospace
}
.sb-foot{padding:10px;border-top:1px solid var(--cb);flex-shrink:0}
.sb-user{display:flex;align-items:center;gap:9px;padding:7px 9px;border-radius:var(--rsm)}
.sb-av{
  width:30px;height:30px;border-radius:50%;background:var(--grad);
  display:flex;align-items:center;justify-content:center;
  font-family:'Sora',sans-serif;font-weight:800;font-size:12px;color:#fff;flex-shrink:0
}
.sb-uname{font-size:13px;font-weight:600;color:var(--text);line-height:1.3}
.sb-email{font-size:10px;color:var(--dim);font-family:'JetBrains Mono',monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:130px}

/* ── MAIN ── */
.md-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}

/* ── TOPBAR ── */
.topbar{
  padding:0 26px;height:56px;flex-shrink:0;
  border-bottom:1px solid var(--cb);
  display:flex;align-items:center;justify-content:space-between;
  background:rgba(9,9,15,.88);backdrop-filter:blur(18px);z-index:40
}
.topbar-title{font-family:'Sora',sans-serif;font-weight:800;font-size:14.5px;letter-spacing:-0.02em;color:var(--text)}
.topbar-r{display:flex;align-items:center;gap:7px}
.toptime{font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--dim);letter-spacing:.04em}
.ibtn{
  width:32px;height:32px;border-radius:var(--rsm);background:var(--card);border:1px solid var(--cb);
  display:flex;align-items:center;justify-content:center;cursor:pointer;
  transition:all .15s;color:var(--muted);flex-shrink:0
}
.ibtn:hover{background:var(--ch);color:var(--text)}

/* ── MOBILE ── */
.mob-bar{display:none;padding:13px 18px;border-bottom:1px solid var(--cb);align-items:center;justify-content:space-between;background:var(--surf);flex-shrink:0}
.sb-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.62);z-index:48}
@media(max-width:768px){
  .sb{position:fixed;top:0;left:-236px;height:100vh;z-index:49}
  .sb.open{left:0}
  .sb-overlay.open{display:block}
  .mob-bar{display:flex}
  .topbar{display:none}
  .px{padding:16px}
  .g2,.g3{grid-template-columns:1fr!important}
  .g4{grid-template-columns:1fr 1fr!important}
}

/* ── CONTENT SCROLL ── */
.scroll{flex:1;overflow-y:auto}
.px{padding:26px}

/* ── UTILS ── */
.sora{font-family:'Sora',sans-serif}
.mono{font-family:'JetBrains Mono',monospace}
.grad{background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.mb8{margin-bottom:8px}.mb12{margin-bottom:12px}.mb16{margin-bottom:16px}.mb20{margin-bottom:20px}.mb28{margin-bottom:28px}
.pos{color:#4ade80}.neg{color:#f87171}.dim{color:var(--dim)}
.divider{height:1px;background:var(--cb);margin:20px 0}

/* ── CARD ── */
.card{background:var(--card);border:1px solid var(--cb);border-radius:var(--r);transition:background .2s,border-color .2s}
.card:hover{background:var(--ch)}
.cp{padding:20px 22px}
.csm{padding:14px 16px}

/* ── GRID ── */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.ga{display:grid;grid-template-columns:repeat(auto-fit,minmax(168px,1fr));gap:11px}
@media(max-width:1000px){.g4{grid-template-columns:repeat(2,1fr)}}
@media(max-width:700px){.g3{grid-template-columns:1fr 1fr}.g4{grid-template-columns:1fr 1fr}}

/* ── SECTION HEADER ── */
.slabel{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim);display:block;margin-bottom:8px}
.stitle{font-family:'Sora',sans-serif;font-weight:800;font-size:14px;letter-spacing:-.02em;color:var(--text);display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.slink{font-size:11px;font-weight:500;color:var(--purple);background:none;border:none;cursor:pointer;font-family:'Inter',sans-serif;transition:opacity .15s}
.slink:hover{opacity:.7}

/* ── GREETING ── */
.gtime{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--dim);letter-spacing:.06em;margin-bottom:6px}
.gtitle{font-family:'Sora',sans-serif;font-weight:800;font-size:clamp(20px,3vw,28px);letter-spacing:-.03em;line-height:1.25;margin-bottom:4px}
.gsub{font-size:13px;color:var(--muted);line-height:1.65}

/* ── KPI ── */
.kpi{background:var(--card);border:1px solid var(--cb);border-radius:var(--r);padding:16px 18px;transition:all .2s;cursor:default}
.kpi:hover{background:var(--ch);transform:translateY(-1px)}
.kpi-l{font-size:10px;font-weight:500;color:var(--dim);text-transform:uppercase;letter-spacing:.08em;margin-bottom:7px}
.kpi-v{font-family:'Sora',sans-serif;font-weight:800;font-size:24px;letter-spacing:-.04em;line-height:1;margin-bottom:5px}
.kpi-c{font-size:11px;display:flex;align-items:center;gap:4px}

/* ── MODULE CARD ── */
.mc{border-radius:var(--r);padding:16px;cursor:pointer;transition:all .2s;border:1px solid;position:relative;overflow:hidden}
.mc::before{content:'';position:absolute;top:0;left:0;right:0;height:2px}
.mc:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.3)}
.mc-name{font-family:'Sora',sans-serif;font-weight:700;font-size:13px;letter-spacing:-.01em;margin-bottom:2px;margin-top:7px}
.mc-desc{font-size:11px;color:var(--dim);line-height:1.5}
.mc-arr{position:absolute;top:13px;right:13px;font-size:12px;color:var(--dim)}

/* ── INSIGHT ── */
.ins{display:flex;align-items:flex-start;gap:10px;padding:11px 13px;border-radius:var(--rsm);background:rgba(255,255,255,.02);border:1px solid var(--cb);margin-bottom:8px;cursor:pointer;transition:all .15s}
.ins:hover{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.11)}
.ins-ic{width:27px;height:27px;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:13px}
.ins-t{font-size:12px;font-weight:600;margin-bottom:2px}
.ins-d{font-size:12px;color:var(--muted);line-height:1.55}

/* ── PROG BAR ── */
.pr-row{margin-bottom:9px}
.pr-meta{display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:3px}
.pr-val{font-family:'JetBrains Mono',monospace;font-size:10.5px}
.pr-bg{height:4px;background:rgba(255,255,255,.07);border-radius:2px;overflow:hidden}
.pr-fill{height:100%;border-radius:2px;transition:width 1s ease}

/* ── CHAT ── */
.chat-wrap{display:flex;flex-direction:column;overflow:hidden}
.chat-msgs{flex:1;overflow-y:auto;padding:18px 20px;display:flex;flex-direction:column;gap:13px}
.bub{padding:11px 15px;border-radius:15px;font-size:13.5px;line-height:1.67;max-width:84%;white-space:pre-wrap;word-break:break-word}
.bub-u{align-self:flex-end;background:rgba(139,92,246,.17);border:1px solid rgba(139,92,246,.27);border-radius:15px 15px 4px 15px;color:var(--text)}
.bub-a{align-self:flex-start;background:var(--card);border:1px solid var(--cb);border-radius:15px 15px 15px 4px;color:rgba(248,248,255,.88)}
.bub-hdr{display:flex;align-items:center;gap:7px;margin-bottom:8px}
.bub-av{width:19px;height:19px;border-radius:50%;background:var(--grad);display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif;font-weight:800;font-size:9px;color:#fff;flex-shrink:0}
.bub-name{font-size:11px;font-weight:600;color:var(--purple)}
.bub-time{font-size:10px;color:var(--dim);margin-left:2px}
.bub-utime{font-size:10px;color:rgba(255,255,255,.22);text-align:right;margin-top:4px}

.chat-bot{padding:13px 18px 16px;border-top:1px solid var(--cb);flex-shrink:0;display:flex;flex-direction:column;gap:9px}
.eng-row{display:flex;gap:5px;flex-wrap:wrap}
.ep{font-size:10.5px;font-weight:600;padding:3px 9px;border-radius:100px;cursor:pointer;transition:all .15s;border:1px solid;letter-spacing:.02em;background:rgba(255,255,255,.025)}
.chat-row{display:flex;gap:8px;align-items:flex-end}
.chat-ta{
  flex:1;background:rgba(255,255,255,.04);border:1px solid var(--cb);border-radius:12px;
  padding:10px 14px;color:var(--text);font-size:13.5px;font-family:'Inter',sans-serif;
  resize:none;outline:none;line-height:1.5;transition:border-color .2s;min-height:43px;max-height:120px
}
.chat-ta:focus{border-color:rgba(139,92,246,.48);box-shadow:0 0 0 3px rgba(139,92,246,.07)}
.chat-ta::placeholder{color:var(--dim)}
.sbtn{
  width:41px;height:41px;border-radius:12px;background:var(--grad);
  border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;
  transition:all .15s;flex-shrink:0
}
.sbtn:hover{opacity:.84;transform:scale(1.04)}
.sbtn:disabled{opacity:.32;cursor:not-allowed;transform:none}

.t-row{display:flex;gap:4px;align-items:center;padding:2px 0}
.td{width:6px;height:6px;border-radius:50%;background:var(--purple);opacity:.4;animation:tp 1.2s ease-in-out infinite}
.td:nth-child(2){animation-delay:.2s}
.td:nth-child(3){animation-delay:.4s}
@keyframes tp{0%,60%,100%{opacity:.2;transform:scale(1)}30%{opacity:1;transform:scale(1.25)}}

/* ── DUMP ── */
.dump-ta{
  width:100%;background:rgba(255,255,255,.025);border:1px solid rgba(139,92,246,.16);
  border-radius:13px;padding:18px 20px;color:var(--text);font-size:14.5px;
  font-family:'Inter',sans-serif;resize:none;outline:none;line-height:1.78;min-height:200px;
  transition:border-color .2s,box-shadow .2s
}
.dump-ta:focus{border-color:rgba(139,92,246,.4);box-shadow:0 0 0 4px rgba(139,92,246,.055)}
.dump-ta::placeholder{color:rgba(255,255,255,.14);line-height:1.78}

/* ── CHRONICLE ── */
.chr{display:flex;align-items:flex-start;gap:10px;padding:11px 13px;border-radius:var(--rsm);background:rgba(255,255,255,.02);border:1px solid var(--cb);margin-bottom:8px;cursor:pointer;transition:all .15s}
.chr:hover{background:rgba(255,255,255,.04)}
.chr-ic{width:27px;height:27px;border-radius:7px;background:rgba(139,92,246,.11);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:13px}

/* ── FOCUS ── */
.fm{padding:15px;border-radius:12px;border:1px solid var(--cb);cursor:pointer;transition:all .2s;background:rgba(255,255,255,.02)}
.fm:hover{background:rgba(255,255,255,.04);transform:translateY(-1px)}
.fm.on{background:rgba(6,182,212,.07);border-color:rgba(6,182,212,.3)}
.focus-timer{font-family:'Sora',sans-serif;font-weight:800;font-size:56px;letter-spacing:-.05em;line-height:1;color:#22d3ee}

/* ── BUTTONS ── */
.btn{display:inline-flex;align-items:center;gap:7px;padding:8px 15px;border-radius:var(--rsm);font-size:12.5px;font-weight:600;cursor:pointer;transition:all .15s;border:none;font-family:'Inter',sans-serif;letter-spacing:.01em;white-space:nowrap}
.btn-p{background:var(--grad);color:#fff}
.btn-p:hover{opacity:.87;transform:translateY(-1px)}
.btn-p:disabled{opacity:.35;cursor:not-allowed;transform:none}
.btn-g{background:rgba(255,255,255,.04);border:1px solid var(--cb);color:var(--muted)}
.btn-g:hover{background:rgba(255,255,255,.08);color:var(--text)}
.btn-g:disabled{opacity:.38;cursor:not-allowed}
.btn-ok{background:rgba(34,197,94,.13);border:1px solid rgba(34,197,94,.28);color:#4ade80}

/* ── HIGHLIGHT ── */
.hl{background:rgba(139,92,246,.07);border:1px solid rgba(139,92,246,.18);border-left:3px solid var(--purple);border-radius:12px;padding:15px 17px}

/* ── SETTINGS ROW ── */
.srow{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--hint);font-size:13px}
.srow:last-child{border-bottom:none}
.slbl{color:var(--dim);font-weight:500}
.sval{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted)}

/* ── ANIMATIONS ── */
@keyframes spin{to{transform:rotate(360deg)}}
.spin{display:inline-block;animation:spin .9s linear infinite}
@keyframes fu{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:translateY(0)}}
.fu{animation:fu .32s ease both}
.d1{animation-delay:.06s}.d2{animation-delay:.12s}.d3{animation-delay:.18s}
`;

// ─────────────────────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────────────────────
const MODULES = [
  { id:"brain",   label:"Brain Dump",    icon:"🧠", color:"#8b5cf6", bg:"rgba(139,92,246,0.08)", border:"rgba(139,92,246,0.22)", desc:"Capture anything, instantly"  },
  { id:"journal", label:"Journaling",    icon:"📔", color:"#3b82f6", bg:"rgba(59,130,246,0.08)",  border:"rgba(59,130,246,0.22)",  desc:"Reflect and find meaning"     },
  { id:"emotion", label:"Emotional",     icon:"💜", color:"#ec4899", bg:"rgba(236,72,153,0.08)", border:"rgba(236,72,153,0.22)", desc:"Know your inner state"        },
  { id:"habit",   label:"Habit Engine",  icon:"🔄", color:"#22c55e", bg:"rgba(34,197,94,0.08)",  border:"rgba(34,197,94,0.22)",  desc:"Build who you're becoming"    },
  { id:"affirm",  label:"Affirmations",  icon:"⚡", color:"#f59e0b", bg:"rgba(245,158,11,0.08)", border:"rgba(245,158,11,0.22)", desc:"Identity through evidence"    },
  { id:"focus",   label:"Focus",         icon:"🎯", color:"#06b6d4", bg:"rgba(6,182,212,0.08)",  border:"rgba(6,182,212,0.22)",  desc:"Deep work, protected"         },
  { id:"self",    label:"Self-Model",    icon:"🌐", color:"#6366f1", bg:"rgba(99,102,241,0.08)", border:"rgba(99,102,241,0.22)", desc:"Your living intelligence"     },
];

const ENGINES = [
  { id:"A", label:"Clarity",  color:"#8b5cf6", tip:"Vague feeling → Clear thought"  },
  { id:"B", label:"Goal",     color:"#3b82f6", tip:"Rough idea → Specific goal"      },
  { id:"C", label:"Solve",    color:"#ec4899", tip:"Stuck → Path forward"            },
  { id:"D", label:"Launch",   color:"#22c55e", tip:"Clear goal → Action plan"        },
  { id:"E", label:"Execute",  color:"#f59e0b", tip:"Know what → Perfect prompt"      },
  { id:"F", label:"Skill",    color:"#06b6d4", tip:"Want to grow → Learning path"    },
];

const FOCUS_MODES = [
  { id:"deep-flow",   name:"Deep Flow",   icon:"🌊", dur:"90–120 min", color:"#22d3ee", desc:"Single task, zero interruptions"  },
  { id:"execution",   name:"Execution",   icon:"🎯", dur:"25–50 min",  color:"#60a5fa", desc:"Checklist-driven completion"      },
  { id:"navigation",  name:"Navigation",  icon:"🧭", dur:"30–60 min",  color:"#a78bfa", desc:"Strategic thinking & decisions"   },
  { id:"processing",  name:"Processing",  icon:"🔄", dur:"15–30 min",  color:"#fbbf24", desc:"Inbox triage, quick choices"       },
  { id:"restoration", name:"Restoration", icon:"💤", dur:"10–60 min",  color:"#4ade80", desc:"Genuine recovery, no guilt"        },
  { id:"incubation",  name:"Incubation",  icon:"🌱", dur:"Ongoing",    color:"#f472b6", desc:"Background subconscious work"      },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const nowTime = () => new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
const nowFull = () =>
  new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }) + "  ·  " +
  new Date().toLocaleDateString([], { weekday:"long", month:"long", day:"numeric" });
const greet = (n) => {
  const h = new Date().getHours();
  const g = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return `${g}, ${n || "Boss"}.`;
};
const fmtT = (s) =>
  `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;

function buildPrompt(engine, name) {
  const base = `You are Mindoo — a personal AI co-pilot for the human mind. You help ${name||"the user"} think clearly, plan decisively, and execute with focus.

Rules:
— Warm, direct, deeply insightful. No hollow filler.
— One powerful question at a time when clarity is needed.
— Maximum insight per sentence. Zero corporate-speak.
— Adapt to energy. Short input = brief warm response.
— Always end with ONE clear next step.`;
  const map = {
    A: "\n\nACTIVE ENGINE — CLARITY (A): Ask exactly ONE gentle question to pull the vague thought into focus.",
    B: "\n\nACTIVE ENGINE — GOAL BUILDER (B): Shape the rough idea into one specific, time-bounded goal.",
    C: "\n\nACTIVE ENGINE — PROBLEM SOLVER (C): Diagnose what's broken, reframe it, present the clearest path forward.",
    D: "\n\nACTIVE ENGINE — PROJECT LAUNCHER (D): Build a full logical plan, step by step. One step at a time.",
    E: "\n\nACTIVE ENGINE — TASK EXECUTOR (E): Engineer the perfect prompt: role + context + chain-of-thought + format.",
    F: "\n\nACTIVE ENGINE — SKILL BUILDER (F): Design a personalized learning path with stages and milestones.",
  };
  return engine ? base + map[engine] : base;
}

// ─────────────────────────────────────────────────────────────────────────────
// INLINE SVG ICONS  (no external library, no broken imports)
// ─────────────────────────────────────────────────────────────────────────────
function Ic({ name, s = 15, c = "currentColor" }) {
  const p = {
    home:     "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
    chat:     "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
    send:     "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
    logout:   "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
    settings: "M12 15a3 3 0 100-6 3 3 0 000 6z M2 12h2 M20 12h2 M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M4.93 19.07l1.41-1.41 M17.66 6.34l1.41-1.41",
    menu:     "M3 6h18 M3 12h18 M3 18h18",
    close:    "M18 6L6 18 M6 6l12 12",
    check:    "M20 6L9 17l-5-5",
    archive:  "M21 8v13H3V8 M1 3h22v5H1z M10 12h4",
    trend:    "M23 6L13.5 15.5 8.5 10.5 1 18 M17 6h6v6",
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c}
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
      {(p[name] || "").split(" M").map((seg, i) => (
        <path key={i} d={i === 0 ? seg : "M" + seg} />
      ))}
    </svg>
  );
}

function Spinner() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" className="spin">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();

  // core
  const [user,        setUser]        = useState(null);
  const [name,        setName]        = useState("");
  const [section,     setSection]     = useState("home");
  const [sbOpen,      setSbOpen]      = useState(false);
  const [clock,       setClock]       = useState(nowFull());

  // chat
  const [msgs,        setMsgs]        = useState([]);
  const [input,       setInput]       = useState("");
  const [engine,      setEngine]      = useState(null);
  const [typing,      setTyping]      = useState(false);
  const msgsRef = useRef(null);

  // dump
  const [dump,        setDump]        = useState("");
  const [saved,       setSaved]       = useState(false);

  // focus
  const [fMode,       setFMode]       = useState(null);
  const [elapsed,     setElapsed]     = useState(0);
  const timerRef = useRef(null);

  // ── Inject CSS once ──
  useEffect(() => {
    const id = "md-css";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id; el.textContent = CSS;
      document.head.appendChild(el);
    }
  }, []);

  // ── Auth ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/signin"); return; }
      setUser(session.user);
      const meta = session.user?.user_metadata;
      const raw  = meta?.full_name || meta?.name || session.user.email?.split("@")[0] || "Boss";
      const first = raw.split(" ")[0];
      setName(first);
      setMsgs([{
        role:"ai",
        text:`Welcome back, ${first}. I'm your Mindoo co-pilot.\n\nTell me what's on your mind, or pick an engine below to activate a specific thinking mode. No formatting required — just talk.`,
        time: nowTime(),
      }]);
    });
    const { data:{ subscription } } = supabase.auth.onAuthStateChange((_,s) => {
      if (!s) navigate("/signin");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // ── Clock ──
  useEffect(() => {
    const t = setInterval(() => setClock(nowFull()), 30000);
    return () => clearInterval(t);
  }, []);

  // ── Scroll chat to bottom ──
  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [msgs, typing]);

  // ── Focus timer ──
  useEffect(() => {
    if (fMode) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => clearInterval(timerRef.current);
  }, [fMode]);

  // ── Logout ──
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  }, [navigate]);

  // ── Navigate ──
  const go = useCallback((id) => { setSection(id); setSbOpen(false); }, []);

  // ── Send message ──
  const send = useCallback(async () => {
    const txt = input.trim();
    if (!txt || typing) return;
    const t = nowTime();
    const userMsg = { role:"user", text:txt, time:t };
    setMsgs(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const history = msgs.map(m => ({
        role:    m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));
      history.push({ role:"user", content:txt });

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type":                              "application/json",
          "anthropic-dangerous-direct-browser-access": "true",
          "anthropic-version":                         "2023-06-01",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY || "",
        },
        body: JSON.stringify({
          model:      "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system:     buildPrompt(engine, name),
          messages:   history,
        }),
      });

      const data  = await res.json();
      const reply = data?.content?.map(c => c.text || "").join("") || "I'm here. Keep going.";
      setMsgs(prev => [...prev, { role:"ai", text:reply, time:nowTime() }]);
    } catch {
      setMsgs(prev => [...prev, {
        role:"ai",
        text:"Connection issue — check your API key in .env.local, then try again. Your thought is safe.",
        time: nowTime(),
      }]);
    } finally {
      setTyping(false);
    }
  }, [input, typing, msgs, engine, name]);

  const onKey = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }, [send]);

  const saveDump = useCallback(() => {
    if (!dump.trim()) return;
    setSaved(true);
    setTimeout(() => { setSaved(false); setDump(""); }, 2200);
  }, [dump]);

  const initials = name ? name[0].toUpperCase() : "M";

  // ─────────────────────────────────────────────────────────────────────────
  // SECTION RENDERERS
  // ─────────────────────────────────────────────────────────────────────────

  const Home = () => (
    <div className="scroll">
      <div className="px fu" style={{ paddingBottom:40 }}>

        {/* Greeting */}
        <div className="mb28">
          <div className="gtime">{clock}</div>
          <h1 className="gtitle">{greet(name)}<br /><span className="grad sora">What needs your mind today?</span></h1>
        </div>

        {/* KPIs */}
        <div className="g4 mb20">
          {[
            { l:"Focus Hours",   v:"4.2h",   c:"+1.1h this week",  ok:true },
            { l:"Brain Dumps",   v:"12",      c:"+3 this week",     ok:true },
            { l:"Habit Streak",  v:"7 days",  c:"🔥 Keep going",    ok:true },
            { l:"Clarity Score", v:"78%",     c:"+5% this week",    ok:true },
          ].map(k => (
            <div key={k.l} className="kpi">
              <div className="kpi-l">{k.l}</div>
              <div className={`kpi-v grad`}>{k.v}</div>
              <div className={`kpi-c ${k.ok ? "pos" : "neg"}`}>
                <Ic name="trend" s={10} c={k.ok ? "#4ade80" : "#f87171"} />
                {k.c}
              </div>
            </div>
          ))}
        </div>

        {/* Modules */}
        <div className="stitle mb12">All Modules <button className="slink">View all →</button></div>
        <div className="ga mb28">
          {MODULES.map(m => (
            <div key={m.id} className="mc" onClick={() => go(m.id)}
              style={{ background:m.bg, borderColor:m.border }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:m.color }} />
              <span style={{ fontSize:21 }}>{m.icon}</span>
              <div className="mc-name" style={{ color:m.color }}>{m.label}</div>
              <div className="mc-desc">{m.desc}</div>
              <span className="mc-arr">→</span>
            </div>
          ))}
        </div>

        {/* Two-col */}
        <div className="g2">

          {/* Insights */}
          <div>
            <div className="stitle">Today's Insights <button className="slink">All →</button></div>
            {[
              { ic:"📈", bg:"rgba(139,92,246,.1)", t:"Pattern detected",  d:"You focus 40% better Tuesdays 9–11am. That window is 47 minutes away." },
              { ic:"🌤", bg:"rgba(6,182,212,.1)",  t:"Emotional weather",  d:"Calm baseline. Good conditions for deep work and hard conversations."  },
              { ic:"⚡", bg:"rgba(245,158,11,.1)", t:"Identity win",       d:"You resisted 3 distractions yesterday. Disciplined identity at 83%."   },
              { ic:"🔥", bg:"rgba(34,197,94,.1)",  t:"Habit momentum",     d:"7-day streak on your #1 habit. Automaticity threshold in 23 days."     },
            ].map((x, i) => (
              <div key={i} className="ins">
                <div className="ins-ic" style={{ background:x.bg }}>{x.ic}</div>
                <div><div className="ins-t">{x.t}</div><div className="ins-d">{x.d}</div></div>
              </div>
            ))}
          </div>

          {/* Right column */}
          <div>
            {/* Quick actions */}
            <div className="stitle mb12">Quick Actions</div>
            <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:18 }}>
              {[
                { l:"Start brain dump",    ic:"🧠", to:"dump"    },
                { l:"Begin focus session", ic:"🎯", to:"focus"   },
                { l:"Open Mindoo Chat",    ic:"💬", to:"chat"    },
                { l:"Log emotion",         ic:"💜", to:"emotion" },
              ].map(a => (
                <button key={a.to} className="btn btn-g"
                  style={{ justifyContent:"flex-start", width:"100%" }}
                  onClick={() => go(a.to)}>
                  <span style={{ fontSize:13 }}>{a.ic}</span>
                  {a.l}
                  <span style={{ marginLeft:"auto", color:"var(--dim)" }}>→</span>
                </button>
              ))}
            </div>

            {/* Self-model */}
            <div className="card csm" style={{ background:"rgba(99,102,241,.06)", borderColor:"rgba(99,102,241,.2)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:13 }}>
                <span style={{ fontSize:15 }}>🌐</span>
                <span className="sora" style={{ fontWeight:700, fontSize:13, color:"#818cf8" }}>Self-Model</span>
                <span style={{ marginLeft:"auto", fontSize:9, color:"var(--dim)", fontFamily:"'JetBrains Mono',monospace" }}>LIVE</span>
              </div>
              {[
                { l:"Resilient",   p:89, c:"#a78bfa" },
                { l:"Disciplined", p:78, c:"#60a5fa" },
                { l:"Focused",     p:65, c:"#22d3ee" },
                { l:"Confident",   p:45, c:"#4ade80" },
              ].map(x => (
                <div key={x.l} className="pr-row">
                  <div className="pr-meta">
                    <span>{x.l}</span>
                    <span className="pr-val" style={{ color:x.c }}>{x.p}%</span>
                  </div>
                  <div className="pr-bg"><div className="pr-fill" style={{ width:`${x.p}%`, background:x.c }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Chat = () => (
    <div className="chat-wrap" style={{ height:"calc(100vh - 56px)" }}>
      <div className="chat-msgs" ref={msgsRef}>
        {msgs.map((m, i) => (
          <div key={i} className={`bub ${m.role === "user" ? "bub-u" : "bub-a"} fu`}>
            {m.role === "ai" && (
              <div className="bub-hdr">
                <div className="bub-av">M</div>
                <span className="bub-name">Mindoo</span>
                <span className="bub-time">{m.time}</span>
              </div>
            )}
            {m.text}
            {m.role === "user" && <div className="bub-utime">{m.time}</div>}
          </div>
        ))}
        {typing && (
          <div className="bub bub-a fu">
            <div className="bub-hdr">
              <div className="bub-av">M</div>
              <span className="bub-name">Mindoo</span>
            </div>
            <div className="t-row"><div className="td" /><div className="td" /><div className="td" /></div>
          </div>
        )}
      </div>

      <div className="chat-bot">
        <div>
          <div style={{ fontSize:"9px", fontFamily:"'JetBrains Mono',monospace", letterSpacing:".12em", textTransform:"uppercase", color:"var(--dim)", marginBottom:6 }}>
            Engines — select to activate a thinking mode
          </div>
          <div className="eng-row">
            {ENGINES.map(e => (
              <button key={e.id} className="ep" title={e.tip}
                style={{
                  borderColor: engine === e.id ? e.color : "rgba(255,255,255,.1)",
                  color:       engine === e.id ? e.color : "var(--muted)",
                  background:  engine === e.id ? `${e.color}18` : "rgba(255,255,255,.025)",
                }}
                onClick={() => setEngine(engine === e.id ? null : e.id)}>
                {e.id}: {e.label}
              </button>
            ))}
          </div>
        </div>
        <div className="chat-row">
          <textarea className="chat-ta" rows={1}
            placeholder="What's on your mind? Just talk…  (Enter to send)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
          />
          <button className="sbtn" onClick={send} disabled={!input.trim() || typing}>
            {typing ? <Spinner /> : <Ic name="send" s={15} c="#fff" />}
          </button>
        </div>
      </div>
    </div>
  );

  const BrainDump = () => {
    const wc = dump.trim().split(/\s+/).filter(Boolean).length;
    return (
      <div className="scroll"><div className="px fu" style={{ paddingBottom:40 }}>
        <div className="mb28">
          <span className="slabel">Module · Capture</span>
          <h1 className="gtitle"><span className="grad sora">Brain Dump Sanctuary</span></h1>
          <p className="gsub">Zero friction. Zero judgment. Zero organization needed. Just empty your mind.</p>
        </div>

        <textarea className="dump-ta mb12"
          rows={9}
          placeholder={"Start typing anything that's in your head…\n\ngroceries, that thing Sarah said, project deadline, feeling weird about the meeting, need to call mom, taxes — TAXES, why am I tired, the idea about the app, that conversation, everything…\n\nNo rules. No formatting. Just get it out."}
          value={dump}
          onChange={e => setDump(e.target.value)}
        />

        <div style={{ display:"flex", gap:9, alignItems:"center", marginBottom:22 }}>
          <button className={`btn ${saved ? "btn-ok" : "btn-p"}`} onClick={saveDump} disabled={!dump.trim()}>
            {saved ? <><Ic name="check" s={13} c="#4ade80" />Saved to chronicles</> : <><Ic name="archive" s={13} c="#fff" />Save Chronicle</>}
          </button>
          <button className="btn btn-g" onClick={() => setDump("")} disabled={!dump.trim()}>Clear</button>
          <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"var(--dim)" }}>
            {wc} {wc === 1 ? "word" : "words"}
          </span>
        </div>

        <div className="divider" />
        <div className="stitle">Recent Chronicles <button className="slink">View all →</button></div>
        {[
          { id:"#052", t:"Today, 2:15 PM",      type:"Voice", chaos:72, tone:"anxious"      },
          { id:"#051", t:"Yesterday, 11:47 PM", type:"Paper", chaos:85, tone:"overwhelmed"  },
          { id:"#050", t:"Mar 24, 3:30 PM",     type:"Text",  chaos:45, tone:"focused"      },
        ].map(c => (
          <div key={c.id} className="chr">
            <div className="chr-ic">🧠</div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:13, fontWeight:600 }}>Chronicle {c.id}</span>
                <span style={{ fontSize:11, color:"var(--dim)" }}>{c.t}</span>
              </div>
              <div style={{ fontSize:11, color:"var(--dim)", marginTop:3 }}>
                {c.type} · Chaos {c.chaos}/100 · {c.tone}
              </div>
            </div>
          </div>
        ))}
      </div></div>
    );
  };

  const Focus = () => {
    const cur = FOCUS_MODES.find(m => m.id === fMode);
    return (
      <div className="scroll"><div className="px fu" style={{ paddingBottom:40 }}>
        <div className="mb28">
          <span className="slabel">Module · Execution</span>
          <h1 className="gtitle"><span className="grad sora">Focus Sanctuary</span></h1>
          <p className="gsub">Protected attention. Context-optimized. Distraction becomes data, not guilt.</p>
        </div>

        {fMode ? (
          <div className="card cp mb20" style={{ background:"rgba(6,182,212,.07)", borderColor:"rgba(6,182,212,.28)", textAlign:"center" }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"#22d3ee", letterSpacing:".1em", textTransform:"uppercase", marginBottom:9 }}>
              {cur?.name} — Active
            </div>
            <div className="focus-timer">{fmtT(elapsed)}</div>
            <p style={{ fontSize:13, color:"var(--muted)", margin:"9px 0 15px", lineHeight:1.6 }}>
              Stay in the work. Your attention is protected.
            </p>
            <button className="btn btn-g" style={{ margin:"0 auto" }} onClick={() => setFMode(null)}>End Session</button>
          </div>
        ) : (
          <div className="card cp mb20" style={{ textAlign:"center", borderStyle:"dashed", borderColor:"rgba(6,182,212,.18)" }}>
            <div style={{ fontSize:13, color:"var(--dim)", marginBottom:3 }}>No active session</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,.14)" }}>Select a mode below to begin</div>
          </div>
        )}

        <div className="stitle mb12">Focus Modes</div>
        <div className="g3 mb28">
          {FOCUS_MODES.map(m => (
            <div key={m.id} className={`fm${fMode === m.id ? " on" : ""}`}
              onClick={() => setFMode(fMode === m.id ? null : m.id)}>
              <div style={{ fontSize:22, marginBottom:7 }}>{m.icon}</div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:13, color:m.color, marginBottom:2 }}>{m.name}</div>
              <div style={{ fontSize:11, color:"var(--dim)", marginBottom:3 }}>{m.dur}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.25)" }}>{m.desc}</div>
            </div>
          ))}
        </div>

        <div className="stitle mb12">This Week</div>
        <div className="g4">
          {[
            { l:"Deep Flow Hours",  v:"12.5h", n:"Goal: 15h"          },
            { l:"Flow States",      v:"4",     n:"Avg: 67 min"        },
            { l:"Distractions",     v:"23",    n:"↓15% vs last week"  },
            { l:"Session Quality",  v:"74%",   n:"Goal: 80%"          },
          ].map(x => (
            <div key={x.l} className="kpi">
              <div className="kpi-l">{x.l}</div>
              <div className="kpi-v" style={{ fontSize:22, background:"var(--grad)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>{x.v}</div>
              <div style={{ fontSize:11, color:"var(--dim)" }}>{x.n}</div>
            </div>
          ))}
        </div>
      </div></div>
    );
  };

  const ModulePage = ({ mod }) => (
    <div className="scroll"><div className="px fu" style={{ paddingBottom:40 }}>
      <div style={{ display:"flex", alignItems:"center", gap:13, marginBottom:22 }}>
        <div style={{ width:50, height:50, borderRadius:15, background:mod.bg, border:`1px solid ${mod.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>
          {mod.icon}
        </div>
        <div>
          <div className="sora" style={{ fontWeight:800, fontSize:21, letterSpacing:"-.03em", color:mod.color }}>{mod.label}</div>
          <div style={{ fontSize:13, color:"var(--muted)", marginTop:2 }}>{mod.desc}</div>
        </div>
      </div>

      <div className="hl mb20">
        <p style={{ fontSize:14, color:"var(--text)", lineHeight:1.7 }}>
          This module is active and wired into the system. Full UI rolls out in Phase 2 (Months 4–6).
          Right now, use Mindoo Chat with Engine <strong>A–F</strong> to engage its full intelligence immediately.
        </p>
      </div>

      <button className="btn btn-p mb20" onClick={() => go("chat")}>
        <Ic name="chat" s={13} c="#fff" />Open Mindoo Chat
      </button>

      <div className="divider" />
      <div className="stitle mb12">Module Info</div>
      <div className="g2">
        <div className="card csm">
          <div className="slabel">Module ID</div>
          <code style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:mod.color }}>
            {mod.id}-module@2.0.0
          </code>
        </div>
        <div className="card csm">
          <div className="slabel">Status</div>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:mod.color, boxShadow:`0 0 8px ${mod.color}` }} />
            <span style={{ fontSize:13, fontWeight:600 }}>Active · Official</span>
          </div>
        </div>
      </div>
    </div></div>
  );

  const Settings = () => (
    <div className="scroll"><div className="px fu" style={{ paddingBottom:40 }}>
      <div className="mb28">
        <span className="slabel">Configuration</span>
        <h1 className="gtitle"><span className="grad sora">Settings</span></h1>
      </div>
      <div className="g2">
        <div className="card cp">
          <div className="stitle" style={{ marginBottom:16 }}>Account</div>
          <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:18 }}>
            <div className="sb-av" style={{ width:42, height:42, fontSize:15 }}>{initials}</div>
            <div>
              <div style={{ fontWeight:600, fontSize:14 }}>{name}</div>
              <div style={{ fontSize:12, color:"var(--dim)" }}>{user?.email || ""}</div>
            </div>
          </div>
          <button className="btn btn-g" style={{ width:"100%" }} onClick={logout}>
            <Ic name="logout" s={13} />Sign out
          </button>
        </div>
        <div className="card cp">
          <div className="stitle" style={{ marginBottom:16 }}>Stack</div>
          {[
            { l:"Frontend",    v:"React + Vite + Tailwind" },
            { l:"Auth + DB",   v:"Supabase"                },
            { l:"AI Engine",   v:"Claude (Anthropic API)"  },
            { l:"Hosting",     v:"Vercel"                   },
            { l:"App Version", v:"Mindoo v2.0.0"           },
            { l:"Repo",        v:"axis-app → mindoo"       },
          ].map(x => (
            <div key={x.l} className="srow">
              <span className="slbl">{x.l}</span>
              <span className="sval">{x.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div></div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // SIDEBAR NAV DATA
  // ─────────────────────────────────────────────────────────────────────────
  const mainNav = [
    { id:"home",  label:"Home",       icon:<Ic name="home" s={14} /> },
    { id:"chat",  label:"Mindoo Chat",icon:<Ic name="chat" s={14} />, badge:"AI" },
    { id:"dump",  label:"Brain Dump", icon:<span style={{ fontSize:13 }}>🧠</span> },
    { id:"focus", label:"Focus",      icon:<span style={{ fontSize:13 }}>🎯</span> },
  ];

  const pageTitle = () => {
    if (section === "home")     return "Dashboard";
    if (section === "chat")     return "Mindoo Chat";
    if (section === "dump")     return "Brain Dump Sanctuary";
    if (section === "focus")    return "Focus Sanctuary";
    if (section === "settings") return "Settings";
    return MODULES.find(m => m.id === section)?.label || "Mindoo";
  };

  const activeMod = MODULES.find(m => m.id === section);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="bg-glow" />

      {/* Mobile sidebar overlay */}
      <div className={`sb-overlay${sbOpen ? " open" : ""}`} onClick={() => setSbOpen(false)} />

      <div className="md-wrap">

        {/* ── SIDEBAR ── */}
        <aside className={`sb${sbOpen ? " open" : ""}`}>
          <div className="sb-logo">
            <div className="sb-logo-text">Mindoo</div>
            <div className="sb-logo-sub">Modular Cognitive OS</div>
          </div>

          <div className="sb-scroll">
            {/* Main nav */}
            <div className="sb-section">
              <span className="sb-label">Navigate</span>
              {mainNav.map(n => (
                <button key={n.id} className={`sb-item${section === n.id ? " on" : ""}`} onClick={() => go(n.id)}>
                  {n.icon}
                  {n.label}
                  {n.badge && <span className="sb-badge">{n.badge}</span>}
                </button>
              ))}
            </div>

            {/* Modules */}
            <div className="sb-section">
              <span className="sb-label">Modules</span>
              {MODULES.map(m => (
                <button key={m.id} className={`sb-item${section === m.id ? " on" : ""}`} onClick={() => go(m.id)}>
                  <span className="sb-dot" style={{ background:m.color }} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="sb-foot">
            <div className="sb-user">
              <div className="sb-av">{initials}</div>
              <div style={{ flex:1, overflow:"hidden" }}>
                <div className="sb-uname">{name || "Boss"}</div>
                <div className="sb-email">{user?.email || ""}</div>
              </div>
            </div>
            <button className="sb-item" style={{ marginTop:3 }} onClick={logout}>
              <Ic name="logout" s={13} />Sign out
            </button>
          </div>
        </aside>

        {/* ── MAIN AREA ── */}
        <div className="md-main">

          {/* Mobile topbar */}
          <div className="mob-bar">
            <span className="sb-logo-text">Mindoo</span>
            <button className="ibtn" onClick={() => setSbOpen(true)}>
              <Ic name="menu" s={15} />
            </button>
          </div>

          {/* Desktop topbar */}
          <div className="topbar">
            <div className="topbar-title">{pageTitle()}</div>
            <div className="topbar-r">
              <span className="toptime">{clock}</span>
              <button className="ibtn" title="Settings" onClick={() => go("settings")}>
                <Ic name="settings" s={14} />
              </button>
              <button className="ibtn" title="Sign out" onClick={logout}>
                <Ic name="logout" s={14} />
              </button>
            </div>
          </div>

          {/* Content routing */}
          {section === "home"     && <Home />}
          {section === "chat"     && <Chat />}
          {section === "dump"     && <BrainDump />}
          {section === "focus"    && <Focus />}
          {section === "settings" && <Settings />}
          {activeMod              && <ModulePage mod={activeMod} />}

        </div>
      </div>
    </>
  );
}