// ─────────────────────────────────────────────────────────────────
// MINDOO CONFIG — single source of truth for all app constants
// Change here, changes everywhere. Never hardcode elsewhere.
// ─────────────────────────────────────────────────────────────────

export const MODULES = [
  {
    id: "brain",
    label: "Brain Dump",
    icon: "🧠",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.22)",
    desc: "Capture anything, instantly",
    phase: 1,
  },
  {
    id: "journal",
    label: "Journaling",
    icon: "📔",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.22)",
    desc: "Reflect and find meaning",
    phase: 2,
  },
  {
    id: "emotion",
    label: "Emotional",
    icon: "💜",
    color: "#ec4899",
    bg: "rgba(236,72,153,0.08)",
    border: "rgba(236,72,153,0.22)",
    desc: "Know your inner state",
    phase: 2,
  },
  {
    id: "habit",
    label: "Habit Engine",
    icon: "🔄",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.22)",
    desc: "Build who you're becoming",
    phase: 2,
  },
  {
    id: "affirm",
    label: "Affirmations",
    icon: "⚡",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.22)",
    desc: "Identity through evidence",
    phase: 2,
  },
  {
    id: "focus",
    label: "Focus",
    icon: "🎯",
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.22)",
    desc: "Deep work, protected",
    phase: 1,
  },
  {
    id: "self",
    label: "Self-Model",
    icon: "🌐",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.22)",
    desc: "Your living intelligence",
    phase: 3,
  },
];

export const ENGINES = [
  { id: "A", label: "Clarity", color: "#8b5cf6", tip: "Vague feeling → Clear thought" },
  { id: "B", label: "Goal",    color: "#3b82f6", tip: "Rough idea → Specific goal"    },
  { id: "C", label: "Solve",   color: "#ec4899", tip: "Stuck → Path forward"          },
  { id: "D", label: "Launch",  color: "#22c55e", tip: "Clear goal → Action plan"      },
  { id: "E", label: "Execute", color: "#f59e0b", tip: "Know what → Perfect prompt"    },
  { id: "F", label: "Skill",   color: "#06b6d4", tip: "Want to grow → Learning path"  },
];

export const FOCUS_MODES = [
  { id: "deep-flow",   name: "Deep Flow",   emoji: "🌊", dur: "90–120 min", color: "#22d3ee", desc: "Single task, zero interruptions" },
  { id: "execution",   name: "Execution",   emoji: "🎯", dur: "25–50 min",  color: "#60a5fa", desc: "Checklist-driven completion"     },
  { id: "navigation",  name: "Navigation",  emoji: "🧭", dur: "30–60 min",  color: "#a78bfa", desc: "Strategic thinking & decisions"  },
  { id: "processing",  name: "Processing",  emoji: "🔄", dur: "15–30 min",  color: "#fbbf24", desc: "Inbox triage, quick choices"      },
  { id: "restoration", name: "Restoration", emoji: "💤", dur: "10–60 min",  color: "#4ade80", desc: "Genuine recovery, no guilt"       },
  { id: "incubation",  name: "Incubation",  emoji: "🌱", dur: "Ongoing",    color: "#f472b6", desc: "Background subconscious work"     },
];

export const NAV_SECTIONS = [
  { id: "home",     label: "Home",         icon: "home" },
  { id: "chat",     label: "Mindoo Chat",  icon: "chat",  badge: "AI" },
  { id: "dump",     label: "Brain Dump",   icon: "brain" },
  { id: "focus",    label: "Focus",        icon: "focus" },
];

export const STACK_INFO = [
  { label: "Frontend",   value: "React + Vite + CSS" },
  { label: "Auth + DB",  value: "Supabase" },
  { label: "AI Engine",  value: "Claude (Anthropic)" },
  { label: "Hosting",    value: "Vercel" },
  { label: "Version",    value: "Mindoo v2.0" },
];

// AI system prompt builder — lives with data, not UI
export function buildSystemPrompt(engineId, userName) {
  const base = `You are Mindoo — a personal AI co-pilot for the human mind.
You help ${userName || "the user"} think clearly, plan decisively, and execute with focus.

Core rules:
- Warm, direct, deeply insightful. Zero hollow filler.
- Ask one powerful question at a time when clarification is needed.
- Maximum insight per sentence.
- Always end with ONE clear, specific next step.
- Adapt to energy level. Short input = brief warm response.`;

  const enginePrompts = {
    A: "\n\nACTIVE ENGINE — CLARITY: The user has a vague feeling. Ask exactly ONE gentle question to pull the real thought out.",
    B: "\n\nACTIVE ENGINE — GOAL BUILDER: Shape the rough idea into one specific, time-bounded, motivating goal.",
    C: "\n\nACTIVE ENGINE — PROBLEM SOLVER: Diagnose what is actually broken. Reframe it. Give the clearest path forward.",
    D: "\n\nACTIVE ENGINE — PROJECT LAUNCHER: Build a full logical plan. Present one step at a time. Be concrete.",
    E: "\n\nACTIVE ENGINE — TASK EXECUTOR: Engineer the perfect prompt for the user's task: role + context + reasoning + format.",
    F: "\n\nACTIVE ENGINE — SKILL BUILDER: Design a personalized learning path with clear stages, milestones, and celebration.",
  };

  return engineId ? base + enginePrompts[engineId] : base;
}
