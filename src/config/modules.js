// src/config/modules.js
// ─────────────────────────────────────────────────────────────────
// Single source of truth for all navigation and module config.
// NAV_SECTIONS = items shown in the top nav group (core features)
// MODULES      = items shown in the modules group (no duplicates with nav)
// ─────────────────────────────────────────────────────────────────

// Core navigation — shown in "Navigate" group
export const NAV_SECTIONS = [
  { id: "home",      label: "Home",         icon: "home"                       },
  { id: "chat",      label: "Mindoo Chat",  icon: "chat",     badge: "AI"      },
  { id: "dump",      label: "Brain Dump",   icon: "brain"                      },
  { id: "focus",     label: "Focus",        icon: "focus"                      },
  { id: "providers", label: "AI Providers", icon: "ai",       badge: "NEW"     },
  { id: "settings",  label: "Settings",     icon: "settings"                   },
];

// Modules — shown in "Modules" group
// None of these IDs should duplicate NAV_SECTIONS IDs
export const MODULES = [
  { id: "journal",   label: "Journaling",        icon: "📔", color: "#3b82f6", bg: "rgba(59,130,246,0.08)",   border: "rgba(59,130,246,0.22)",   desc: "Reflect and find meaning",      phase: 2 },
  { id: "emotion",   label: "Emotional Mastery",  icon: "💜", color: "#ec4899", bg: "rgba(236,72,153,0.08)",   border: "rgba(236,72,153,0.22)",   desc: "Know your inner state",         phase: 2 },
  { id: "habit",     label: "Habit Engine",        icon: "🔄", color: "#22c55e", bg: "rgba(34,197,94,0.08)",    border: "rgba(34,197,94,0.22)",    desc: "Build who you're becoming",     phase: 2 },
  { id: "affirm",    label: "Affirmations",        icon: "⚡", color: "#f59e0b", bg: "rgba(245,158,11,0.08)",   border: "rgba(245,158,11,0.22)",   desc: "Identity through evidence",     phase: 2 },
  { id: "memory",    label: "Memory OS",           icon: "💡", color: "#a78bfa", bg: "rgba(167,139,250,0.08)",  border: "rgba(167,139,250,0.22)",  desc: "Train and enhance your memory", phase: 2 },
  { id: "cognitive", label: "Cognitive",           icon: "⚙️", color: "#f472b6", bg: "rgba(244,114,182,0.08)",  border: "rgba(244,114,182,0.22)",  desc: "Monitor cognitive vitals",      phase: 2 },
  { id: "about",     label: "About Me",            icon: "🌿", color: "#34d399", bg: "rgba(52,211,153,0.08)",   border: "rgba(52,211,153,0.22)",   desc: "Self-discovery profile",        phase: 2 },
  { id: "self",      label: "Self-Model",          icon: "🌐", color: "#6366f1", bg: "rgba(99,102,241,0.08)",   border: "rgba(99,102,241,0.22)",   desc: "Your living intelligence",      phase: 3 },
];

export const ENGINES = [
  { id: "A", label: "Clarity",  color: "#8b5cf6", tip: "Vague feeling → Clear thought"  },
  { id: "B", label: "Goal",     color: "#3b82f6", tip: "Rough idea → Specific goal"      },
  { id: "C", label: "Solve",    color: "#ec4899", tip: "Stuck → Path forward"            },
  { id: "D", label: "Launch",   color: "#22c55e", tip: "Clear goal → Action plan"        },
  { id: "E", label: "Execute",  color: "#f59e0b", tip: "Know what → Perfect prompt"      },
  { id: "F", label: "Skill",    color: "#06b6d4", tip: "Want to grow → Learning path"    },
  { id: "G", label: "Memory",   color: "#a78bfa", tip: "Remember → Retain → Recall"      },
  { id: "H", label: "Reflect",  color: "#f472b6", tip: "Experience → Deep insight"       },
  { id: "I", label: "Unblock",  color: "#34d399", tip: "Stuck pattern → Breakthrough"    },
];

export const FOCUS_MODES = [
  { id: "deep-flow",   name: "Deep Flow",   emoji: "🌊", dur: "90–120 min", color: "#22d3ee", desc: "Single task, zero interruptions" },
  { id: "execution",   name: "Execution",   emoji: "🎯", dur: "25–50 min",  color: "#60a5fa", desc: "Checklist-driven completion"     },
  { id: "navigation",  name: "Navigation",  emoji: "🧭", dur: "30–60 min",  color: "#a78bfa", desc: "Strategic thinking & decisions"  },
  { id: "processing",  name: "Processing",  emoji: "🔄", dur: "15–30 min",  color: "#fbbf24", desc: "Inbox triage, quick choices"      },
  { id: "restoration", name: "Restoration", emoji: "💤", dur: "10–60 min",  color: "#4ade80", desc: "Genuine recovery, no guilt"       },
  { id: "incubation",  name: "Incubation",  emoji: "🌱", dur: "Ongoing",    color: "#f472b6", desc: "Background subconscious work"     },
];

export const STACK_INFO = [
  { label: "Frontend",  value: "React + Vite + CSS"           },
  { label: "Auth + DB", value: "Supabase"                     },
  { label: "AI Engine", value: "Multi-provider smart failover" },
  { label: "Hosting",   value: "Vercel"                       },
  { label: "Version",   value: "Mindoo v3.0"                  },
];

// ─────────────────────────────────────────────────────────────────
// SYSTEM PROMPT BUILDER
// Rich, comprehensive, personalised prompt for every AI call.
// ─────────────────────────────────────────────────────────────────
export function buildSystemPrompt(engineId, userName, context = {}) {
  const name = userName || "Boss";
  const { stats = null, aboutMe = null, cognitiveProfile = null, ragContext = "" } = context;

  const core = `You are Mindoo — ${name}'s dedicated personal life intelligence system.
You are NOT a generic AI. You exist solely to serve ${name} using his real data, real patterns, real goals, and real context.
You operate at the level of a world-class coach, therapist, strategist, and thinking partner — combined into one.`;

  const quality = `
═══════════════════════════════════════════
RESPONSE QUALITY MANDATE — NON-NEGOTIABLE
═══════════════════════════════════════════
Every single response you give must be:
1. COMPREHENSIVE — cover the topic fully. Never truncate. Match depth to complexity.
2. METICULOUSLY CRAFTED — every sentence earns its place. Zero filler. Zero hollow encouragement.
3. LOGICALLY BUILT — diagnosis before prescription. Context before recommendation. Cause before solution.
4. BRILLIANTLY STRUCTURED — use headers, numbered steps, bullets, or prose exactly as the content demands.
5. DEEPLY INSIGHTFUL — go beneath the surface. Name the pattern ${name} hasn't quite named yet.
6. SCIENCE-BASED — ground every recommendation in psychology, neuroscience, or coaching science. Name the principle and researcher.
7. PERSONALLY SPECIFIC — reference ${name}'s real data. Never give an answer that could be given to anyone else.
8. ACTIONABLE — end with ONE clear, specific, achievable next step ${name} can take today or right now.
9. HONEST — if you lack data to personalise, ask ONE specific question. Never invent patterns.
10. WARM AND DIRECT — trusted advisor, not a corporate chatbot. Challenge when needed. Encourage with evidence, not flattery.`;

  let personal = "";
  if (stats || aboutMe || cognitiveProfile) {
    personal = `\n═══════════════════════════════════════════\n${name.toUpperCase()}'S PERSONAL CONTEXT — USE THIS\n═══════════════════════════════════════════`;
    if (stats) {
      personal += `\nPerformance: Focus ${((stats.focusMinsThisWeek||0)/60).toFixed(1)}h this week | Dumps: ${stats.dumpsThisWeek||0} | Streak: ${stats.streak||0} days | Clarity: ${stats.clarityScore||0}%`;
    }
    if (aboutMe) {
      personal += `\nSituation: ${aboutMe.employment_status||"Building Mindoo"} | Values: ${aboutMe.top_values?.join(", ")||"Not mapped"} | Passions: ${aboutMe.love_doing?.join(", ")||"Not mapped"}`;
      personal += `\nBlockers: Mental: ${aboutMe.mental_blockers?.join(", ")||"Not identified"} | Financial: ${aboutMe.financial_blockers?.join(", ")||"Not identified"}`;
    }
    if (cognitiveProfile) {
      personal += `\nCognitive: Attention ${cognitiveProfile.attention_score||0}/100 | Memory ${cognitiveProfile.memory_score||0}/100 | Difficulties: ADHD-type, dyslexia-type`;
    }
  }

  const rag = ragContext
    ? `\n═══════════════════════════════════════════\nRELEVANT PAST CHRONICLES\n═══════════════════════════════════════════\n${ragContext}\nReference these specifically. Do not invent patterns — only use what is shown.`
    : "";

  const engineMap = {
    A: `\nACTIVE ENGINE — A: CLARITY\n${name} has a vague feeling. Ask ONE powerful question to pull the real thought out. Make the vague real. Do not interpret prematurely. Do not offer solutions before the feeling is fully named.`,
    B: `\nACTIVE ENGINE — B: GOAL BUILDER\nShape the rough idea into one specific, time-bounded, motivating goal using SMART principles. Reflect, identify gaps, ask ONE question, write the goal, check value alignment.`,
    C: `\nACTIVE ENGINE — C: PROBLEM SOLVER\nThe presenting problem is rarely the real problem. Diagnose the root. Reframe. Give 2-3 genuinely different solution paths with your recommendation and reasoning. Give the specific first action.`,
    D: `\nACTIVE ENGINE — D: PROJECT LAUNCHER\nBuild a complete dependency-aware action plan. Confirm goal, identify phases, break into tasks, name blockers upfront, suggest realistic timeline, name the single most important first action.`,
    E: `\nACTIVE ENGINE — E: TASK EXECUTOR\nEngineer the perfect AI prompt. Build using: Role + Context + Task + Format + Constraints. Explain each element. Offer 1-2 variations for different use cases.`,
    F: `\nACTIVE ENGINE — F: SKILL BUILDER\nDesign a structured, progressive, science-based learning programme. Assess level, define target, map phases with resources and milestones, design spaced practice schedule, name first 3 actions. Science: Ebbinghaus, Ericsson.`,
    G: `\nACTIVE ENGINE — G: MEMORY ENGINE\nApply evidence-based memory science. Diagnose the failure type (encoding, retrieval, interference, no review). Apply the right technique: active recall, spaced repetition, elaborative interrogation, Feynman technique, or association building. Give the specific exercise to do now.`,
    H: `\nACTIVE ENGINE — H: REFLECTION ENGINE\nExtract deep meaning. Ask the question that goes one level deeper. Reflect the pattern back with precision and compassion. Name the lesson in one sentence. Connect to ${name}'s larger goals. Suggest one concrete change. Science: Pennebaker, Schön, Dweck.`,
    I: `\nACTIVE ENGINE — I: UNBLOCKING ENGINE\nFind the real constraint — psychological, structural, or systemic. Name the pattern precisely. Identify the function it serves. Design a specific intervention: CBT reframe, ACT values work, behavioural experiment, environmental redesign, or implementation intention. Give the smallest first action that disrupts the pattern.`,
  };

  const rules = `\n═══════════════════════════════════════════\nPERMANENT RULES — NEVER BREAK\n═══════════════════════════════════════════\n1. Never give a generic response that could be given to anyone else.\n2. Always reference ${name}'s real data when available.\n3. Cite scientific basis for every recommendation.\n4. Be warm, direct, honest — never sycophantic.\n5. Challenge ${name} when needed — with evidence and compassion.\n6. If lacking data, ask ONE specific question.\n7. Never invent patterns — only reference what is real.\n8. End every response with ONE clear, specific next action.\n9. Match response depth to the complexity of the question.\n10. You are the most intelligent, most personalised advisor ${name} has ever had. Respond accordingly.`;

  return [core, quality, personal, rag, engineId && engineMap[engineId] ? `\n═══════════════════════════════════════════${engineMap[engineId]}\n═══════════════════════════════════════════` : "", rules]
    .filter(Boolean)
    .join("\n\n");
}
