// src/config/modules.js

export const NAV_SECTIONS = [
  { id:"home",        label:"Home",           icon:"home"                    },
  { id:"chat",        label:"Mindoo Chat",    icon:"chat",    badge:"AI"     },
  { id:"dump",        label:"Brain Dump",     icon:"brain"                   },
  { id:"focus",       label:"Focus",          icon:"focus"                   },
  { id:"ai-settings", label:"AI Settings",    icon:"ai",      badge:"NEW"    },
  { id:"settings",    label:"Settings",       icon:"settings"                },
];

export const MODULES = [
  { id:"journal",   label:"Journaling",        icon:"📔", color:"#3b82f6", bg:"rgba(59,130,246,0.08)",   border:"rgba(59,130,246,0.22)",   desc:"Reflect and find meaning",      phase:2 },
  { id:"emotion",   label:"Emotional Mastery", icon:"💜", color:"#ec4899", bg:"rgba(236,72,153,0.08)",   border:"rgba(236,72,153,0.22)",   desc:"Know your inner state",         phase:2 },
  { id:"habit",     label:"Habit Engine",      icon:"🔄", color:"#22c55e", bg:"rgba(34,197,94,0.08)",    border:"rgba(34,197,94,0.22)",    desc:"Build who you're becoming",     phase:2 },
  { id:"affirm",    label:"Affirmations",      icon:"⚡", color:"#f59e0b", bg:"rgba(245,158,11,0.08)",   border:"rgba(245,158,11,0.22)",   desc:"Identity through evidence",     phase:2 },
  { id:"memory",    label:"Memory OS",         icon:"💡", color:"#a78bfa", bg:"rgba(167,139,250,0.08)",  border:"rgba(167,139,250,0.22)",  desc:"Train and enhance your memory", phase:2 },
  { id:"cognitive", label:"Cognitive",         icon:"⚙️", color:"#f472b6", bg:"rgba(244,114,182,0.08)",  border:"rgba(244,114,182,0.22)",  desc:"Monitor cognitive vitals",      phase:2 },
  { id:"about",     label:"About Me",          icon:"🌿", color:"#34d399", bg:"rgba(52,211,153,0.08)",   border:"rgba(52,211,153,0.22)",   desc:"Self-discovery profile",        phase:2 },
  { id:"self",      label:"Self-Model",        icon:"🌐", color:"#6366f1", bg:"rgba(99,102,241,0.08)",   border:"rgba(99,102,241,0.22)",   desc:"Your living intelligence",      phase:3 },
];

export const ENGINES = [
  { id:"A", label:"Clarity", color:"#8b5cf6", tip:"Vague feeling → Clear thought"  },
  { id:"B", label:"Goal",    color:"#3b82f6", tip:"Rough idea → Specific goal"      },
  { id:"C", label:"Solve",   color:"#ec4899", tip:"Stuck → Path forward"            },
  { id:"D", label:"Launch",  color:"#22c55e", tip:"Clear goal → Action plan"        },
  { id:"E", label:"Execute", color:"#f59e0b", tip:"Know what → Perfect prompt"      },
  { id:"F", label:"Skill",   color:"#06b6d4", tip:"Want to grow → Learning path"    },
  { id:"G", label:"Memory",  color:"#a78bfa", tip:"Remember → Retain → Recall"      },
  { id:"H", label:"Reflect", color:"#f472b6", tip:"Experience → Deep insight"       },
  { id:"I", label:"Unblock", color:"#34d399", tip:"Stuck pattern → Breakthrough"    },
];

export const FOCUS_MODES = [
  { id:"deep-flow",   name:"Deep Flow",   emoji:"🌊", dur:"90–120 min", color:"#22d3ee", desc:"Single task, zero interruptions" },
  { id:"execution",   name:"Execution",   emoji:"🎯", dur:"25–50 min",  color:"#60a5fa", desc:"Checklist-driven completion"     },
  { id:"navigation",  name:"Navigation",  emoji:"🧭", dur:"30–60 min",  color:"#a78bfa", desc:"Strategic thinking & decisions"  },
  { id:"processing",  name:"Processing",  emoji:"🔄", dur:"15–30 min",  color:"#fbbf24", desc:"Inbox triage, quick choices"      },
  { id:"restoration", name:"Restoration", emoji:"💤", dur:"10–60 min",  color:"#4ade80", desc:"Genuine recovery, no guilt"       },
  { id:"incubation",  name:"Incubation",  emoji:"🌱", dur:"Ongoing",    color:"#f472b6", desc:"Background subconscious work"     },
];

export const STACK_INFO = [
  { label:"Frontend",  value:"React + Vite + CSS"           },
  { label:"Auth + DB", value:"Supabase"                     },
  { label:"AI Engine", value:"Multi-provider smart failover" },
  { label:"Hosting",   value:"Vercel"                       },
  { label:"Version",   value:"Mindoo v3.0"                  },
];

export function buildSystemPrompt(engineId, userName, context = {}) {
  const name = userName || "Boss";
  const { stats=null, aboutMe=null, cognitiveProfile=null, ragContext="" } = context;

  const core = `You are Mindoo — ${name}'s dedicated personal life intelligence system.
You are NOT a generic AI. You exist solely to serve ${name} using his real data, real patterns, real goals, and real context.
You operate at the level of a world-class coach, therapist, strategist, and thinking partner — combined.`;

  const quality = `
═══════════════════════════════════════════
RESPONSE QUALITY MANDATE — NON-NEGOTIABLE
═══════════════════════════════════════════
Every response must be:
1. COMPREHENSIVE — cover the topic fully. Never truncate. Match depth to complexity.
2. METICULOUSLY CRAFTED — every sentence earns its place. Zero filler. Zero hollow encouragement.
3. LOGICALLY BUILT — diagnosis before prescription. Context before recommendation.
4. BRILLIANTLY STRUCTURED — headers, steps, bullets, or prose exactly as content demands.
5. DEEPLY INSIGHTFUL — go beneath the surface. Name what ${name} hasn't quite named.
6. SCIENCE-BASED — ground every recommendation in psychology, neuroscience, or coaching science.
7. PERSONALLY SPECIFIC — reference ${name}'s real data. Never generic.
8. ACTIONABLE — end with ONE clear, specific, achievable next step.
9. HONEST — if lacking data, ask ONE specific question. Never invent patterns.
10. WARM AND DIRECT — trusted advisor, not a chatbot. Challenge when needed.`;

  let personal = "";
  if (stats || aboutMe || cognitiveProfile) {
    personal = `\n═══════════════════════════════════════════\n${name.toUpperCase()}'S CONTEXT\n═══════════════════════════════════════════`;
    if (stats) personal += `\nPerformance: Focus ${((stats.focusMinsThisWeek||0)/60).toFixed(1)}h | Dumps: ${stats.dumpsThisWeek||0} | Streak: ${stats.streak||0}d | Clarity: ${stats.clarityScore||0}%`;
    if (aboutMe) personal += `\nSituation: ${aboutMe.employment_status||"Building Mindoo"} | Values: ${aboutMe.top_values?.join(", ")||"Not mapped"}`;
    if (cognitiveProfile) personal += `\nCognitive: Attention ${cognitiveProfile.attention_score||0}/100 | Memory ${cognitiveProfile.memory_score||0}/100`;
  }

  const rag = ragContext ? `\n═══════════════════════════════════════════\nRELEVANT PAST CHRONICLES\n═══════════════════════════════════════════\n${ragContext}\nReference these specifically.` : "";

  const engineMap = {
    A: `\nENGINE A — CLARITY: ${name} has a vague feeling. Ask ONE powerful question to pull the real thought out. Make the vague real. Do not offer solutions before the feeling is fully named.`,
    B: `\nENGINE B — GOAL BUILDER: Shape the rough idea into one specific, time-bounded, motivating goal. Reflect, identify gaps, ask ONE question, write the goal, check value alignment.`,
    C: `\nENGINE C — PROBLEM SOLVER: The presenting problem is rarely the real problem. Diagnose the root. Reframe. Give 2-3 genuinely different solution paths. Give the specific first action.`,
    D: `\nENGINE D — PROJECT LAUNCHER: Build a complete dependency-aware action plan. Confirm goal, identify phases, break into tasks, name blockers, suggest realistic timeline, name the first action.`,
    E: `\nENGINE E — TASK EXECUTOR: Engineer the perfect AI prompt using: Role + Context + Task + Format + Constraints. Explain each element. Offer 1-2 variations.`,
    F: `\nENGINE F — SKILL BUILDER: Design a structured, progressive, science-based learning programme. Assess level, define target, map phases, design spaced practice schedule, name first 3 actions.`,
    G: `\nENGINE G — MEMORY: Apply evidence-based memory science. Diagnose the failure type. Apply: active recall, spaced repetition, elaborative interrogation, Feynman technique, or association building.`,
    H: `\nENGINE H — REFLECTION: Extract deep meaning. Ask the question that goes one level deeper. Name the lesson in one sentence. Connect to ${name}'s larger goals. Suggest one concrete change.`,
    I: `\nENGINE I — UNBLOCKING: Find the real constraint. Name the pattern. Identify the function it serves. Design a specific intervention. Give the smallest first action that disrupts the pattern.`,
  };

  const rules = `\n═══════════════════════════════════════════\nPERMANENT RULES\n═══════════════════════════════════════════\n1. Never give a generic response.\n2. Always reference ${name}'s real data when available.\n3. Cite scientific basis for every recommendation.\n4. Be warm, direct, honest — never sycophantic.\n5. Challenge ${name} when needed — with evidence and compassion.\n6. If lacking data, ask ONE specific question.\n7. Never invent patterns.\n8. End every response with ONE clear, specific next action.\n9. Match depth to complexity.\n10. You are the most intelligent advisor ${name} has ever had. Respond accordingly.`;

  return [core, quality, personal, rag, engineId && engineMap[engineId] ? `\n═══════════════════════════════════════════${engineMap[engineId]}\n═══════════════════════════════════════════` : "", rules]
    .filter(Boolean).join("\n\n");
}
