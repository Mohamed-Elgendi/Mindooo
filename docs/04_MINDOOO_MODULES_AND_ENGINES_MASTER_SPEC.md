# MINDOOO — MODULES & ENGINES MASTER SPECIFICATION
## The Complete Build Blueprint: Every Module, Every Engine, Every Detail
### From Chaos to Clarity. Now Do More.

**Version**: 4.0 — The Architected Specification  
**Last Updated**: May 23, 2026  
**Status**: Active Development — Phase 1 Complete → Phase 2 Build  
**Brand**: Mindooo (three o's) — zero tolerance for "Mindoo"  
**GitHub**: https://github.com/Mohamed-Elgendi/Mindooo  
**Primary User**: Mohamed (Mo) — Founder, First User, Living Blueprint  

---

## DOCUMENT PURPOSE

This is the **single source of truth** for all Mindooo modules and engines. It replaces all previous module lists, engine inventories, and build trackers. Every module is fully specified. Every engine is fully mapped. Every dependency is declared. Every database table is named. Every AI prompt is referenced. Every build priority is ranked.

**Use this document to:**
- Know exactly what exists, what is planned, and what is next
- Build new modules without touching existing code
- Understand the full ecosystem at a glance
- Track build progress against a clear standard
- Onboard new contributors (future) with zero ambiguity

---

## TABLE OF CONTENTS

I. [The Module Architecture Philosophy](#i-the-module-architecture-philosophy)  
II. [The Module Interface Contract](#ii-the-module-interface-contract)  
III. [Current Modules — Phase 1 (Built)](#iii-current-modules--phase-1-built)  
IV. [Planned Modules — Phase 2 (Next Build)](#iv-planned-modules--phase-2-next-build)  
V. [Future Modules — Phase 3+ (Vision)](#v-future-modules--phase-3-vision)  
VI. [The 13 Engines — Complete Matrix](#vi-the-13-engines--complete-matrix)  
VII. [Module-Engine Dependency Map](#vii-module-engine-dependency-map)  
VIII. [Database Table Registry](#viii-database-table-registry)  
IX. [Build Priority & Roadmap](#ix-build-priority--roadmap)  
X. [The Non-Negotiables](#x-the-non-negotiables)  
XI. [Visual Ecosystem Map](#xi-visual-ecosystem-map)  
XII. [Closing Statement](#xii-closing-statement)  

---

## I. THE MODULE ARCHITECTURE PHILOSOPHY

### The Golden Rule
> **Adding a module never touches existing module files. Removing a module never breaks the system. Each module is a sovereign, self-contained universe.**

### The Five Architectural Laws

| Law | Meaning | Violation Consequence |
|---|---|---|
| **1. Sovereignty** | Each module owns its files, its data, its state, its routes. No module reaches into another. | Cross-module dependencies = technical debt = system fragility |
| **2. Interface Contract** | Every module exposes exactly one interface: `manifest.json` + `index.jsx`. The shell never imports module internals. | Direct imports between modules = coupling = impossible to remove |
| **3. Data Isolation** | Each module owns its database tables. Shared data lives in core tables (chronicles, user_profiles) accessed via services. | Module-specific tables bleeding into other modules = data corruption risk |
| **4. AI Isolation** | Each module may register engine prompts. Engines are shared, but module-specific prompts are module-owned. | Hardcoded AI logic in the shell = unmaintainable, unscalable |
| **5. Brand Unity** | Every module displays "Mindooo" correctly. Every module follows the visual identity (colors, typography, tone). | Brand inconsistency = broken trust = P0 bug |

### The Module Lifecycle

```
DESIGN -> BUILD -> INTEGRATE -> TEST -> DEPLOY
```

| Stage | Deliverables |
|---|---|
| **Design** | Manifest draft, DB schema, AI prompts, science citations |
| **Build** | Files created, DB table created, AI engine registered, services layer built |
| **Integrate** | Register in shell, route mapped, sidebar icon set, data flow verified |
| **Test** | Unit tests, RLS verified, AI quality check, cross-module isolation |
| **Deploy** | Brand audit, RLS verified, performance check, failover test |

---

## II. THE MODULE INTERFACE CONTRACT

Every module MUST provide these files. No exceptions.

### Required Files

```
modules/[module-name]/
├── manifest.json          <- Module identity, dependencies, routes
├── index.jsx              <- Main component (lazy-loaded by shell)
├── api.js                 <- All Supabase calls for this module
├── ai-prompts.js          <- Module-specific AI prompt templates
├── styles.module.css      <- Scoped styles (CSS Modules)
└── README.md              <- Module documentation (for Mo + future team)
```

### manifest.json Schema

```json
{
  "name": "Mindooo [Module Name]",
  "version": "1.0.0",
  "description": "One-sentence purpose statement",
  "route": "/[kebab-case-route]",
  "icon": "[LucideIconName]",
  "color": "#HEXCODE",
  "dependencies": {
    "modules": [],
    "tables": [],
    "engines": []
  },
  "database": {
    "tables": ["table_name"],
    "rls": true
  },
  "ai": {
    "engines": ["A", "B"],
    "prompts": ["clarify", "summarize"]
  },
  "science": [
    {
      "concept": "Name of scientific principle",
      "source": "Author, Title, Year",
      "application": "How this module applies it"
    }
  ],
  "author": "Mindooo Team",
  "license": "MIT",
  "phase": 1,
  "status": "active | building | planned"
}
```

### Shell Integration Rule

The shell (`Dashboard.jsx`) NEVER imports module internals. It ONLY:
1. Reads `manifest.json` to discover modules
2. Lazy-loads `index.jsx` via React.lazy()
3. Passes `userId` and `supabase` as props
4. Renders the module in a layout container

```javascript
// Dashboard.jsx — The Sacred Shell
// NEVER import module files directly

const modules = import.meta.glob('/modules/*/manifest.json', { eager: true })

function ModuleLoader({ route, userId, supabase }) {
  const manifest = modules[`/modules/${route}/manifest.json`]
  const ModuleComponent = lazy(() => import(`/modules/${route}/index.jsx`))

  return (
    <Suspense fallback={<MindoooSkeleton />}>
      <ModuleComponent userId={userId} supabase={supabase} manifest={manifest} />
    </Suspense>
  )
}
```

---

## III. CURRENT MODULES — PHASE 1 (BUILT)

These modules are live in production. They are the foundation of Mindooo.

---

### MODULE 01 — Brain Dump Sanctuary

| Attribute | Value |
|---|---|
| **Display Name** | Mindooo Brain Dump |
| **Status** | ACTIVE — Full Features |
| **Version** | 1.2.0 |
| **File** | `src/pages/sections/BrainDump.jsx` (946 lines) |
| **Route** | `/brain-dump` |
| **Icon** | `Brain` |
| **Color** | `#3B82F6` (Clarity Blue) |
| **Purpose** | Zero-friction capture of everything in the mind — text, voice, session |
| **Science** | Cognitive offloading (Kirsch), external memory (Clark & Chalmers), expressive writing (Pennebaker) |

#### Features (Complete)

| Feature | Status | Notes |
|---|---|---|
| Text dump with font size control | Done | Adjustable 14px-24px |
| Voice note recording | Done | Web Audio API + Supabase Storage |
| Brain Dump Session with timer | Done | Configurable duration |
| AI silent analysis | Done | chaos_score, emotional_tone, themes, ai_summary |
| Editable titles | Done | Inline editing |
| Delete with confirmation | Done | Soft delete with undo |
| Copy button | Done | Clipboard API |
| Speech-to-text | Done | Web Speech API |
| Sharing | Done | WhatsApp, Telegram, Email, Obsidian, Notion, Drive, social |
| Chronicles list | Done | All metadata visible |
| Folders | Partial | UI built, backend needs completion |
| Tags | Partial | UI exists, not wired |
| Search | Partial | Text search works, semantic search pending |
| Sort & filter | Partial | Basic sort, advanced filter pending |

#### Database Tables

| Table | Purpose | Status |
|---|---|---|
| `chronicles` | Core brain dump storage | Live |
| `chronicle_folders` | Organization system | Live |

#### AI Integration

| Function | File | Purpose |
|---|---|---|
| `analyzeChronicle()` | `services/ai.js` | Generates chaos_score, tone, themes, summary |
| `embedDocument()` | `services/embeddings.js` | Creates 768-dim vector for RAG |

#### Science Foundation

| Principle | Source | Application |
|---|---|---|
| Cognitive offloading | Kirsch (1996) | Externalizing thoughts reduces working memory load |
| Extended mind | Clark & Chalmers (1998) | Chronicles serve as external cognitive scaffold |
| Expressive writing | Pennebaker (1997) | Writing about stress improves health and clarity |
| Zeigarnik effect | Zeigarnik (1927) | Open tasks loop in mind; capture closes the loop |

#### Known Issues & Next Steps

| Issue | Priority | Fix |
|---|---|---|
| Folders backend incomplete | P1 | Complete folder CRUD in `api.js` |
| Tags not wired | P1 | Add tags array to chronicles, build tag UI |
| Semantic search pending | P1 | Enable pgvector, build RAG search |
| Voice upload size limit | P2 | Add compression before Supabase upload |
| Mobile voice recording | P2 | Test iOS Safari Web Audio API compatibility |

---

### MODULE 02 — Mindooo Chat

| Attribute | Value |
|---|---|
| **Display Name** | Mindooo Chat |
| **Status** | BUILT — AI INTEGRATION IN PROGRESS |
| **Version** | 1.1.0 |
| **File** | `src/pages/sections/ChatPanel.jsx` |
| **Route** | `/chat` |
| **Icon** | `MessageCircle` |
| **Color** | `#F4A261` (Focus Gold) |
| **Purpose** | Personal AI coach with full life context — not a chatbot, a life intelligence system |
| **Science** | ICF coaching standards, motivational interviewing (Miller & Rollnick), CBT (Beck), ACT (Hayes) |

#### Features (Current)

| Feature | Status | Notes |
|---|---|---|
| Message history with scroll | Done | Virtualized list for performance |
| 6 engine selectors (A-F) | Done | Dropdown with engine descriptions |
| Uncontrolled textarea | Done | No crash on keystroke (fixed from v1.0) |
| AI response display | Partial | Groq integration in progress |
| RAG context loading | Not built | Requires pgvector + Nomic |
| Feedback buttons (thumbs up/down) | Not built | Requires ai_feedback table |
| Conversation persistence | Not built | Requires ai_conversations table |
| Voice input | Not built | Planned for v1.3 |
| Suggested prompts | Not built | Planned for v1.3 |

#### Current Issue: AI Integration

| Problem | Root Cause | Solution | Status |
|---|---|---|---|
| Anthropic CORS blocked | Claude API requires server-side call | Switch to Groq (browser-safe) | In progress |
| No context engine | Not yet built | Build `services/context.js` | Not started |
| No system prompt builder | Not yet built | Build `services/prompts.js` | Not started |
| No RAG | pgvector not enabled | Enable pgvector, build `services/rag.js` | Not started |

#### Database Tables

| Table | Purpose | Status |
|---|---|---|
| `ai_conversations` | Chat history | Not created |
| `ai_feedback` | Thumbs up/down ratings | Not created |

#### AI Integration

| Function | File | Purpose | Status |
|---|---|---|---|
| `callMindoooAI()` | `services/ai.js` | Failover AI gateway | Partial — Groq key added |
| `buildMindoooContext()` | `services/context.js` | Load all user data | Not built |
| `buildSystemPrompt()` | `services/prompts.js` | Personalized prompt | Not built |
| `ragSearch()` | `services/rag.js` | Semantic retrieval | Not built |

#### Build Priority for Chat

**P0 (Blocks all other AI work):**
1. Complete Groq integration in ChatPanel
2. Create ai_conversations table
3. Save conversation history

**P1 (Enables personalization):**
4. Build Context Engine (services/context.js)
5. Build System Prompt Builder (services/prompts.js)
6. Enable pgvector in Supabase
7. Add Nomic API key
8. Build RAG search (services/rag.js)

**P2 (Improves quality):**
9. Create ai_feedback table
10. Add thumbs up/down buttons to UI
11. Add OpenRouter fallback
12. Implement conversation RAG

---

### MODULE 03 — Focus Sanctuary

| Attribute | Value |
|---|---|
| **Display Name** | Mindooo Focus |
| **Status** | BASIC — Functional, Needs Expansion |
| **Version** | 1.0.0 |
| **File** | `src/pages/sections/FocusSection.jsx` |
| **Route** | `/focus` |
| **Icon** | `Target` |
| **Color** | `#2A9D8F` (Freedom Green) |
| **Purpose** | Protected deep work sessions — guard attention, measure quality |
| **Science** | Deep Work (Newport), ultradian rhythms (Kleitman), attention restoration theory (Kaplan) |

#### Features (Current)

| Feature | Status | Notes |
|---|---|---|
| Timer (countdown) | Done | Configurable duration |
| Session modes | Done | deep_work, shallow_work, recovery |
| Save to Supabase | Done | focus_sessions table |
| Session notes | Done | Post-session reflection |
| Interruption tracking | Not built | Planned for v1.2 |
| Energy rating (start/end) | Not built | Planned for v1.2 |
| Focus quality score | Not built | Planned for v1.2 |
| Distraction blocking | Not built | Planned for v1.3 (browser extension) |
| Ambient sound | Not built | Planned for v1.3 |
| Session analytics | Not built | Planned for v1.2 |

#### Database Tables

| Table | Purpose | Status |
|---|---|---|
| `focus_sessions` | Session tracking | Live |

#### Science Foundation

| Principle | Source | Application |
|---|---|---|
| Deep work | Newport (2016) | 90-minute blocks of uninterrupted focus |
| Ultradian rhythms | Kleitman (1963) | 90-120 minute cycles of high to low energy |
| Attention restoration | Kaplan (1995) | Brief nature exposure restores focus capacity |
| Ego depletion | Baumeister (1998) | Willpower is finite; protect it with structure |

#### Expansion Plan (Phase 6)

| Feature | Version | Science |
|---|---|---|
| Interruption tracking | v1.2 | Self-monitoring increases awareness |
| Energy rating | v1.2 | Subjective energy correlates with objective performance |
| Focus quality AI inference | v1.2 | Pattern recognition from session data |
| Session analytics dashboard | v1.2 | Visual feedback loop |
| Distraction blocking | v1.3 | Stimulus control (behavioural psychology) |
| Ambient sound | v1.3 | Auditory masking reduces environmental distractions |
| Pre-session priming | v1.3 | Implementation intentions boost follow-through |

---

### MODULE 04 — Dashboard / Home

| Attribute | Value |
|---|---|
| **Display Name** | Mindooo Dashboard |
| **Status** | ACTIVE — Real Data, Working |
| **Version** | 1.2.0 |
| **File** | `src/pages/sections/Home.jsx` |
| **Route** | `/` (default) |
| **Icon** | `LayoutDashboard` |
| **Color** | `#1E3A5F` (Deep Clarity Blue) |
| **Purpose** | Central command — overview, KPIs, insights, quick actions, navigation hub |
| **Science** | Dashboard design (Few), situational awareness (Endsley), feedback loops (Carver & Scheier) |

#### Features (Current)

| Feature | Status | Notes |
|---|---|---|
| Real KPI data | Done | Focus hours, dumps, streak, clarity score |
| Dynamic insights | Done | Based on real data patterns |
| Module grid navigation | Done | Visual module cards |
| Quick actions | Done | Fast entry points |
| Self-Model preview | Partial | Hardcoded — needs real data from cognitive_profile |
| Weekly trend charts | Not built | Planned for v1.3 |
| Guardian alerts | Not built | Planned for v1.3 |
| Morning briefing | Not built | Planned for v1.4 |
| Energy forecast | Not built | Planned for v1.4 |

#### Database Tables

| Table | Purpose | Status |
|---|---|---|
| `user_profiles` | Dashboard stats | Live |
| `chronicles` | KPI calculation | Live |
| `focus_sessions` | KPI calculation | Live |
| `insights` | Dynamic insights | Not created |

#### KPI Definitions

| KPI | Calculation | Target |
|---|---|---|
| **Clarity Score** | Composite: (1 - avg_chaos_score/10) x 100 + streak_bonus + focus_bonus | 80%+ by Month 2 |
| **Focus Hours (Week)** | SUM(actual_secs) / 60 FROM focus_sessions WHERE created_at > now() - 7 days | 10+ hours/week |
| **Brain Dumps (Week)** | COUNT(*) FROM chronicles WHERE created_at > now() - 7 days | 7+ dumps/week |
| **Current Streak** | Consecutive days with at least 1 chronicle OR at least 1 focus session | 21+ days |
| **Longest Streak** | MAX(consecutive days) in history | Track personal best |

#### Self-Model Preview (Current vs Target)

| Element | Current | Target |
|---|---|---|
| Identity claims | Hardcoded percentages | Live from user_profiles.identity_claims |
| Cognitive vitals | Static placeholders | Live from cognitive_profile |
| Energy pattern | Generic | Personalized from about_me.peak_hours |
| Blocker count | Static | Live count from about_me.blockers |
| Purpose alignment | Static | Live from about_me.ikigai_statement |

---

## IV. PLANNED MODULES — PHASE 2 (NEXT BUILD)

These modules transform Mindooo from a capture tool into a complete life operating system. They are the next build target.

---

### MODULE 05 — Journaling Nexus

| Attribute | Value |
|---|---|
| **Display Name** | Mindooo Journal |
| **Status** | PLANNED — Phase 2 |
| **Version** | 0.1.0 (Design) |
| **Route** | `/journal` |
| **Icon** | `BookOpen` |
| **Color** | `#8B5CF6` (Wisdom Purple) |
| **Purpose** | Structured reflection and meaning-making — morning charter, evening inventory, weekly synthesis |
| **Science** | Expressive writing (Pennebaker), reflective practice (Schon), gratitude research (Emmons), meaning-making (Frankl) |
| **Phase** | 2 |
| **Priority** | P1 |

#### Features (Planned)

| Feature | Version | Description |
|---|---|---|
| Morning Charter | v1.0 | Intention-setting template: "Today I will... because..." |
| Evening Inventory | v1.0 | Reflection template: "What went well... What I learned..." |
| Weekly Synthesis | v1.0 | Auto-generated weekly summary from all entries |
| AI-Guided Depth | v1.0 | 5 depth levels: 1=facts, 2=feelings, 3=patterns, 4=meaning, 5=transformation |
| Pattern Recognition | v1.1 | Cross-entry theme detection |
| Emotional Arc Tracking | v1.1 | Mood trajectory across entries |
| Photo/Artifact Attachment | v1.2 | Multimedia journaling |
| Voice Journaling | v1.2 | Speech-to-text with emotion detection |

#### Database Tables

| Table | Columns | Purpose |
|---|---|---|
| `journal_entries` | id, user_id, type (morning/evening/weekly), content, depth_level, emotional_tone, themes, ai_insights, created_at | Core journal storage |
| `journal_templates` | id, type, prompts, science_ref | Customizable templates |

#### AI Integration

| Engine | Prompt Purpose |
|---|---|
| **A — Clarity Engine** | Clarify vague journal entries |
| **C — Problem Solver** | Identify patterns in repeated struggles |
| **Analyst Agent** | Background pattern detection across entries |

#### Science Foundation

| Principle | Source | Application |
|---|---|---|
| Expressive writing | Pennebaker (1997) | Writing about trauma/stress improves immune function and clarity |
| Reflective practice | Schon (1983) | Reflection-in-action and reflection-on-action |
| Gratitude intervention | Emmons & McCullough (2003) | Daily gratitude increases well-being |
| Meaning-making | Frankl (1946) | Finding meaning in suffering builds resilience |
| Narrative identity | McAdams (2001) | Life story construction shapes identity |

#### Build Dependencies

| Dependency | Status | Blocker? |
|---|---|---|
| ai_conversations table | Not created | Yes — journal AI guidance needs conversation history |
| Context engine | Not built | Yes — personalization requires context |
| insights table | Not created | No — can use basic analysis without insights table |

---

### MODULE 06 — Emotional Mastery System

| Attribute | Value |
|---|---|
| **Display Name** | Mindooo Emotions |
| **Status** | PLANNED — Phase 2 |
| **Version** | 0.1.0 (Design) |
| **Route** | `/emotions` |
| **Icon** | `Heart` |
| **Color** | `#EC4899` (Emotion Pink) |
| **Purpose** | Real-time emotional awareness and regulation — know what you feel, why you feel it, and what to do about it |
| **Science** | CBT (Beck), DBT (Linehan), somatic therapy (Levine), polyvagal theory (Porges), emotion regulation (Gross) |
| **Phase** | 2 |
| **Priority** | P1 |

#### Features (Planned)

| Feature | Version | Description |
|---|---|---|
| Emotion Logger | v1.0 | Quick emotion check-in: wheel selector + intensity (1-10) + trigger |
| Regulation Technique Library | v1.0 | Science-based techniques: breathing, grounding, cognitive reappraisal, somatic release |
| Trigger Mapping | v1.0 | "When X happens, I feel Y" pattern detection |
| Personalised Toolkit | v1.1 | AI-recommended techniques based on what works for Mo |
| Emotional Forecast | v1.1 | "Based on your patterns, you may feel stressed tomorrow — here's a pre-emptive technique" |
| Crisis Protocol | v1.2 | Emergency regulation for overwhelm (chaos_score > 8) |
| Emotional Trend Dashboard | v1.1 | Weekly/monthly emotional patterns |
| Body Map | v1.2 | Somatic tracking: where emotions live in the body |

#### Database Tables

| Table | Columns | Purpose |
|---|---|---|
| `emotional_logs` | id, user_id, emotion, intensity, trigger, context, regulation_used, effectiveness, body_location, created_at | Emotion tracking |
| `regulation_techniques` | id, name, description, science_ref, steps, duration, difficulty | Technique library |
| `user_regulation_prefs` | id, user_id, technique_id, effectiveness_rating, use_count | Personalised toolkit |

#### AI Integration

| Engine | Prompt Purpose |
|---|---|
| **C — Problem Solver** | Identify emotional triggers from chronicles |
| **Analyst Agent** | Detect emotional patterns across logs |
| **Guardian Agent** | Alert on emotional crisis patterns |

#### Science Foundation

| Principle | Source | Application |
|---|---|---|
| Cognitive behavioural therapy | Beck (1976) | Thoughts -> emotions -> behaviours cycle |
| Dialectical behaviour therapy | Linehan (1993) | Distress tolerance, emotion regulation skills |
| Somatic experiencing | Levine (1997) | Trauma stored in body; release through somatic awareness |
| Polyvagal theory | Porges (2011) | Autonomic nervous system states: ventral vagal (safe), sympathetic (fight/flight), dorsal (shutdown) |
| Emotion regulation | Gross (1998) | Situation selection, modification, attention deployment, cognitive change, response modulation |
| Affect labelling | Lieberman et al. (2007) | Naming emotions reduces amygdala activity |

#### Build Dependencies

| Dependency | Status | Blocker? |
|---|---|---|
| insights table | Not created | No — basic logging works without insights |
| Guardian agent | Not built | No — basic alerts can be rule-based |
| Context engine | Not built | No — emotion logging is self-contained |

---

### MODULE 07 — Habit Transformation Engine

| Attribute | Value |
|---|---|
| **Display Name** | Mindooo Habits |
| **Status** | PLANNED — Phase 2 |
| **Version** | 0.1.0 (Design) |
| **Route** | `/habits` |
| **Icon** | `Repeat` |
| **Color** | `#10B981` (Growth Green) |
| **Purpose** | Science-based habit formation and addiction elimination — build what serves, remove what harms |
| **Science** | Atomic Habits (Clear), BJ Fogg Behaviour Model, habit loop (Duhigg), implementation intentions (Gollwitzer), MBRP |
| **Phase** | 2 |
| **Priority** | P1 |

#### Features (Planned)

| Feature | Version | Description |
|---|---|---|
| Habit Loop Mapper | v1.0 | Cue -> Craving -> Response -> Reward visualisation |
| If-Then Planner | v1.0 | Implementation intention builder: "If [situation], then [behaviour]" |
| Streak Tracker | v1.0 | Visual streak with science-based recovery (not shaming) |
| Identity-Based Design | v1.0 | "I am a [identity]" rather than "I will [action]" |
| Relapse Recovery Protocol | v1.1 | "Never miss twice" — immediate recovery plan |
| Habit Stacking | v1.1 | Attach new habit to existing habit |
| Environment Design | v1.2 | Reduce friction for good habits, increase friction for bad |
| Temptation Bundling | v1.2 | Pair want-to-do with need-to-do |
| Social Accountability | v1.3 | Share habit progress (optional) |

#### Database Tables

| Table | Columns | Purpose |
|---|---|---|
| `habits` | id, user_id, name, identity_statement, cue, craving, response, reward, stack_anchor, environment_design, created_at | Habit definitions |
| `habit_logs` | id, habit_id, completed, notes, difficulty, created_at | Daily tracking |
| `habit_streaks` | id, habit_id, current_streak, longest_streak, last_completed, relapse_count | Streak analytics |

#### AI Integration

| Engine | Prompt Purpose |
|---|---|
| **B — Goal Builder** | Turn vague intentions into specific habits |
| **D — Project Launcher** | Build habit implementation plans |
| **Analyst Agent** | Detect habit failure patterns |
| **Guardian Agent** | Nudge on missed habits (gentle, not shaming) |

#### Science Foundation

| Principle | Source | Application |
|---|---|---|
| Atomic habits | Clear (2018) | 1% daily improvement compounds exponentially |
| Behaviour model | Fogg (2009) | Behaviour = Motivation x Ability x Prompt |
| Habit loop | Duhigg (2012) | Cue -> Routine -> Reward cycle |
| Implementation intentions | Gollwitzer (1999) | If-then plans double follow-through rates |
| Identity-based change | Clear (2018) | Change identity first, behaviour follows |
| Never miss twice | Clear (2018) | One miss is an accident; two is a pattern |
| Temptation bundling | Milkman et al. (2014) | Pair indulgence with productivity |
| Mindfulness-based relapse prevention | Bowen et al. (2014) | Non-judgmental awareness prevents relapse |

#### Build Dependencies

| Dependency | Status | Blocker? |
|---|---|---|
| user_profiles (streak) | Live | No |
| Context engine | Not built | No — habit tracking is self-contained |
| Guardian agent | Not built | No — basic nudges can be rule-based |

---

### MODULE 08 — Embodied Affirmations

| Attribute | Value |
|---|---|
| **Display Name** | Mindooo Affirmations |
| **Status** | PLANNED — Phase 2 |
| **Version** | 0.1.0 (Design) |
| **Route** | `/affirmations` |
| **Icon** | `Sparkles` |
| **Color** | `#F59E0B` (Belief Amber) |
| **Purpose** | Evidence-based identity formation — not empty positivity, but proof-based self-belief |
| **Science** | Self-concept research (Markus), growth mindset (Dweck), self-affirmation theory (Steele), identity-based habits (Clear) |
| **Phase** | 2 |
| **Priority** | P2 |

#### Features (Planned)

| Feature | Version | Description |
|---|---|---|
| Evidence Collector | v1.0 | Auto-gathers evidence from all modules: "You completed 5 focus sessions this week" |
| Identity Strength Scoring | v1.0 | "Disciplined: 73% (evidence: 21 sessions, 15-day streak)" |
| Morning Evidence Review | v1.0 | Daily ritual: review evidence before the day begins |
| Gap Analysis | v1.1 | Aspiration vs reality: "You want to be 'focused' — evidence shows 60% — here's the gap" |
| Identity Builder | v1.1 | AI-guided identity statement refinement |
| Affirmation Generator | v1.2 | Personalised affirmations based on evidence, not generic |
| Social Proof Integration | v1.3 | Import positive feedback from others (future) |

#### Database Tables

| Table | Columns | Purpose |
|---|---|---|
| `identity_evidence` | id, user_id, identity_claim, evidence_type, evidence_source, evidence_data, strength_points, created_at | Evidence storage |
| `identity_claims` | id, user_id, claim_statement, target_strength, current_strength, evidence_count, created_at | Identity definitions |

#### AI Integration

| Engine | Prompt Purpose |
|---|---|
| **Analyst Agent** | Scan all modules for evidence of identity claims |
| **Self-Model Builder** | Update identity strength based on new evidence |
| **A — Clarity Engine** | Clarify vague identity aspirations |

#### Science Foundation

| Principle | Source | Application |
|---|---|---|
| Self-concept | Markus (1977) | Self-schema shapes perception and behaviour |
| Growth mindset | Dweck (2006) | Belief in malleability increases resilience |
| Self-affirmation theory | Steele (1988) | Affirming core values reduces defensive responses |
| Identity-based habits | Clear (2018) | "I am a runner" > "I will run" |
| Possible selves | Markus & Nurius (1986) | Future self-concepts motivate present action |
| Self-efficacy | Bandura (1977) | Belief in capability drives effort and persistence |

#### Build Dependencies

| Dependency | Status | Blocker? |
|---|---|---|
| All Phase 1 modules | Live | No — evidence can be gathered from existing data |
| insights table | Not created | No — basic evidence collection works without insights |
| Self-Model Builder agent | Not built | No — rule-based evidence gathering works |

---

### MODULE 09 — Self-Model

| Attribute | Value |
|---|---|
| **Display Name** | Mindooo Self-Model |
| **Status** | PLANNED — Phase 2 |
| **Version** | 0.1.0 (Design) |
| **Route** | `/self-model` |
| **Icon** | `UserCircle` |
| **Color** | `#6366F1` (Identity Indigo) |
| **Purpose** | Living digital representation of Mo's patterns — cognitive, emotional, behavioural, predictive |
| **Science** | Self-determination theory (Deci & Ryan), personality psychology (Big Five), predictive processing (Clark), digital twins |
| **Phase** | 2 |
| **Priority** | P2 |

#### Features (Planned)

| Feature | Version | Description |
|---|---|---|
| Cognitive Profile Visualisation | v1.0 | Radar chart: working memory, attention, flexibility, speed, metacognition |
| Emotional Profile | v1.0 | Emotional landscape: triggers, patterns, regulation strategies |
| Behavioural Profile | v1.0 | Habit patterns, focus patterns, productivity rhythms |
| Predictive Insights | v1.1 | "Based on your patterns, you will likely feel overwhelmed on Tuesday — here's a pre-emptive plan" |
| Identity Evolution Timeline | v1.1 | Visual timeline of identity strength changes |
| Pattern Heatmap | v1.2 | Calendar view: energy, mood, productivity by day/hour |
| Comparison to Past Self | v1.2 | "You vs You 3 months ago" |
| AI-Generated Self-Report | v1.3 | "Here is what your data says about you" — updated weekly |

#### Database Tables

| Table | Columns | Purpose |
|---|---|---|
| `cognitive_profile` | (see Database Schema doc) | Brain metrics |
| `user_about_me` | (see Database Schema doc) | Self-knowledge |
| `self_model_snapshots` | id, user_id, snapshot_date, cognitive_data, emotional_data, behavioural_data, predictions, created_at | Historical snapshots |

#### AI Integration

| Agent | Purpose |
|---|---|
| **Self-Model Builder** | Continuous profile updates based on new activity |
| **Analyst** | Pattern detection across all data |
| **Guardian** | Anomaly detection and alerts |

#### Science Foundation

| Principle | Source | Application |
|---|---|---|
| Self-determination theory | Deci & Ryan (1985) | Autonomy, competence, relatedness drive motivation |
| Big Five personality | Costa & McCrae (1992) | Trait-based self-understanding |
| Predictive processing | Clark (2013) | Brain as prediction machine; model self to predict behaviour |
| Digital twins | Grieves (2014) | Virtual representation mirrors physical entity |
| Quantified self | Wolf (2009) | Self-knowledge through numbers |

#### Build Dependencies

| Dependency | Status | Blocker? |
|---|---|---|
| cognitive_profile table | Not created | Yes — core data source |
| user_about_me table | Not created | Yes — core data source |
| Analyst agent | Not built | Yes — pattern detection |
| Self-Model Builder agent | Not built | Yes — profile evolution |
| insights table | Not created | No — can use basic aggregation |

---

## V. FUTURE MODULES — PHASE 3+ (VISION)

These modules complete the Life Operating System. They are specified but not yet scheduled.

---

### MODULE 10 — About Me / Self-Discovery

| Attribute | Value |
|---|---|
| **Display Name** | Mindooo About Me |
| **Status** | NEW DESIGN — Phase 3 |
| **Route** | `/about-me` |
| **Icon** | `Compass` |
| **Color** | `#0EA5E9` (Discovery Sky) |
| **Purpose** | Progressive self-knowledge profile — 14 sections of deep discovery |
| **Science** | Positive psychology (Seligman), Ikigai research (Garcia & Miralles), coaching frameworks (ICF), self-determination theory |
| **Phase** | 3 |
| **Priority** | P1 |

#### The 14 Sections

| Section | Domain | Key Questions | AI Role |
|---|---|---|---|
| 1 | Current Situation | Where am I right now? | Context gathering |
| 2 | Personality & Working Style | How do I operate? | Assessment interpretation |
| 3 | Energy Patterns | When am I powerful vs depleted? | Pattern detection |
| 4 | Passions & Interests | What makes me come alive? | Evidence gathering |
| 5 | Values Hierarchy | What will I not compromise? | Clarification |
| 6 | Ikigai Map | What is my intersection? | Synthesis |
| 7 | Financial Picture | What is my money reality? | Strategy |
| 8 | Relationships & Support | Who lifts me up? | Mapping |
| 9 | Dreams & Fears | What do I want? What stops me? | Exploration |
| 10 | Blockers (All Levels) | What stands in my way? | Identification |
| 11 | Health & Body | How is my vessel? | Tracking |
| 12 | Cognitive Profile | How does my brain work? | Assessment |
| 13 | Learning Style | How do I absorb best? | Personalisation |
| 14 | Legacy & Purpose | What will I leave behind? | Visioning |

#### Database

| Table | Status |
|---|---|
| `user_about_me` | Not created — specified in Database Schema doc |

---

### MODULE 11 — Cognitive Performance System

| Attribute | Value |
|---|---|
| **Display Name** | Mindooo Cognition |
| **Status** | NEW DESIGN — Phase 3 |
| **Route** | `/cognition` |
| **Icon** | `BrainCircuit` |
| **Color** | `#7C3AED` (Mind Violet) |
| **Purpose** | Monitor and train cognitive functions — brain gym, cognitive vitals, weekly reports |
| **Science** | Neuroplasticity (Doidge, Merzenich), memory research (Ebbinghaus), attention (Diamond), cognitive training (Jaeggi) |
| **Phase** | 3 |
| **Priority** | P1 |

#### Cognitive Dimensions Trained

| Dimension | Assessment | Training Exercise |
|---|---|---|
| Working Memory | N-back task | Dual N-back |
| Attention | Sustained attention task | Focus meditation |
| Cognitive Flexibility | Task-switching | Stroop task |
| Processing Speed | Reaction time | Speed matching |
| Inhibition Control | Go/no-go | Stop-signal task |
| Planning | Tower of London | Sequence planning |
| Metacognition | Confidence calibration | Post-task reflection |

#### Database

| Table | Status |
|---|---|
| `cognitive_profile` | Not created — specified in Database Schema doc |

---

### MODULE 12 — Life Clarity Engine

| Attribute | Value |
|---|---|
| **Display Name** | Mindooo Clarity |
| **Status** | NEW DESIGN — Phase 3 |
| **Route** | `/clarity` |
| **Icon** | `Lightbulb` |
| **Color** | `#FBBF24` (Insight Yellow) |
| **Purpose** | Turn confusion into clear direction — life wheel, values clarification, priority mapping |
| **Science** | Solution-focused coaching (de Shazer), values clarification (Rokeach), decision science (Kahneman) |
| **Phase** | 3 |
| **Priority** | P2 |

---

### MODULE 13 — Blocker Elimination Engine

| Attribute | Value |
|---|---|
| **Display Name** | Mindooo Blockers |
| **Status** | NEW DESIGN — Phase 3 |
| **Route** | `/blockers` |
| **Icon** | `Shield` |
| **Color** | `#EF4444` (Break Red) |
| **Purpose** | Identify and eliminate blockers on all levels — mental, psychological, financial, physical, relational |
| **Science** | CBT (Beck), ACT (Hayes), motivational interviewing (Miller & Rollnick), root cause analysis (Ishikawa) |
| **Phase** | 3 |
| **Priority** | P1 |

#### Blocker Categories

| Category | Examples | Elimination Approach |
|---|---|---|
| Mental | Procrastination, perfectionism, overwhelm | CBT reframing, task decomposition |
| Psychological | Trauma, anxiety, depression | ACT, somatic therapy, professional referral |
| Financial | Debt, scarcity mindset, no income | Financial psychology, income strategy |
| Physical | Fatigue, pain, poor sleep | Sleep hygiene, movement, nutrition |
| Relational | Toxic relationships, isolation, conflict | Boundary setting, communication skills |
| Environmental | Clutter, noise, digital distraction | Environment design, digital minimalism |

---

### MODULE 14 — Financial Freedom Engine

| Attribute | Value |
|---|---|
| **Display Name** | Mindooo Finance |
| **Status** | NEW DESIGN — Phase 3 |
| **Route** | `/finance` |
| **Icon** | `TrendingUp` |
| **Color** | `#059669` (Wealth Emerald) |
| **Purpose** | Build financial clarity and momentum — situation mapping, Ikigai-based income path, money mindset |
| **Science** | Behavioural economics (Kahneman & Tversky), financial psychology (Klontz), scarcity mindset (Mullainathan & Shafir) |
| **Phase** | 3 |
| **Priority** | P1 |

---

### MODULE 15 — Purpose & Ikigai Engine

| Attribute | Value |
|---|---|
| **Display Name** | Mindooo Purpose |
| **Status** | NEW DESIGN — Phase 3 |
| **Route** | `/purpose` |
| **Icon** | `Compass` |
| **Color** | `#DB2777` (Purpose Rose) |
| **Purpose** | Find the intersection of passion, skill, need, and income — Ikigai mapping, purpose statement, aligned paths |
| **Science** | Ikigai research (Garcia & Miralles), self-determination theory (Deci & Ryan), calling research (Dik & Duffy) |
| **Phase** | 3 |
| **Priority** | P1 |

---

### MODULE 16 — Energy & Time Engine

| Attribute | Value |
|---|---|
| **Display Name** | Mindooo Energy |
| **Status** | NEW DESIGN — Phase 3 |
| **Route** | `/energy` |
| **Icon** | `Zap` |
| **Color** | `#F97316` (Energy Orange) |
| **Purpose** | Optimise how time and energy are spent — energy pattern mapping, time audit, ultradian rhythm optimisation |
| **Science** | Ultradian rhythms (Kleitman), energy management (Loehr & Schwartz), chronobiology (Foster) |
| **Phase** | 3 |
| **Priority** | P2 |

---

### MODULE 17 — Relationship & Support Engine

| Attribute | Value |
|---|---|
| **Display Name** | Mindooo Relationships |
| **Status** | NEW DESIGN — Phase 3 |
| **Route** | `/relationships` |
| **Icon** | `Users` |
| **Color** | `#8B5CF6` (Connection Violet) |
| **Purpose** | Map and strengthen the support system — network mapping, energy giver vs taker analysis, communication patterns |
| **Science** | Attachment theory (Bowlby), social support research (Cohen & Wills), relationship science (Gottman) |
| **Phase** | 3 |
| **Priority** | P2 |

---

## VI. THE 13 ENGINES — COMPLETE MATRIX

Engines are the AI processing core. They are shared across modules but triggered by specific user actions. Each engine has a unique system prompt, context requirements, and output format.

### Engine Architecture

```
USER ACTION
    |
    v
ENGINE SELECTOR -> CONTEXT ENGINE -> AI CALL -> OUTPUT FORMATTER -> SAVE TO DATABASE
```

| Stage | Function |
|---|---|
| **Engine Selector** | Maps user action to engine code (A-M) |
| **Context Engine** | Loads user data + RAG results |
| **AI Call** | Sends personalised prompt to provider |
| **Output Formatter** | Structures response per engine spec |
| **Save to Database** | Stores in ai_conversations |

### Current Engines (A-F) — Active

| Code | Name | Display Name | Purpose | Trigger | Output | Science | Status |
|---|---|---|---|---|---|---|---|
| **A** | Clarity Engine | Mindooo Clarity Engine | Turn vague feelings into clear, structured thoughts | User pastes chaotic text or says "I'm confused" | Structured clarity statement with identified core issue | CBT thought records, conceptual clarification | Active |
| **B** | Goal Builder | Mindooo Goal Builder | Shape rough ideas into one specific, actionable goal | User says "I want to..." | SMART goal + implementation intention + first step | Goal-setting theory (Locke & Latham), implementation intentions (Gollwitzer) | Active |
| **C** | Problem Solver | Mindooo Problem Solver | Diagnose what is broken, find the precise path forward | User describes a problem | Root cause analysis + 3 possible solutions + recommended path | Root cause analysis (Ishikawa), solution-focused therapy (de Shazer) | Active |
| **D** | Project Launcher | Mindooo Project Launcher | Build a full logical plan, step by step | User says "I need to build..." | Phased project plan with milestones, deadlines, resources | Project management (PMBOK), GTD (Allen), agile planning | Active |
| **E** | Task Executor | Mindooo Task Executor | Engineer the perfect AI prompt for any task | User says "Help me do X" | Optimised prompt + tool recommendations + execution steps | Prompt engineering, tool literacy, decomposition | Active |
| **F** | Skill Builder | Mindooo Skill Builder | Design a personal learning path for any capability | User says "I want to learn..." | Learning path: resources, milestones, practice schedule, assessment | Deliberate practice (Ericsson), spaced repetition (Ebbinghaus), learning styles | Active |

### New Life Engines (G-M) — Planned

| Code | Name | Display Name | Purpose | Trigger | Output | Science | Status | Phase |
|---|---|---|---|---|---|---|---|---|
| **G** | Self-Discovery Engine | Mindooo Self-Discovery Engine | Map personality, values, passions, cognitive style | User opens About Me module or asks "Who am I?" | Comprehensive self-profile: Big Five, values, ikigai, working style | Personality psychology (Big Five, MBTI), values clarification (Rokeach), Ikigai research | Planned | 3 |
| **H** | Blocker Elimination Engine | Mindooo Blocker Elimination Engine | Identify and systematically remove all blockers | User says "I can't because..." or opens Blockers module | Blocker inventory + root cause + elimination plan + timeline | CBT (Beck), ACT (Hayes), motivational interviewing (Miller & Rollnick) | Planned | 3 |
| **I** | Financial Freedom Engine | Mindooo Financial Freedom Engine | Build financial clarity, strategy, and freedom path | User opens Finance module or asks about money | Financial situation map + income strategy + mindset shift plan | Behavioural economics (Kahneman), financial psychology (Klontz), scarcity research | Planned | 3 |
| **J** | Purpose & Ikigai Engine | Mindooo Purpose & Ikigai Engine | Discover and align life with core purpose | User asks "Why am I here?" or opens Purpose module | Ikigai map + purpose statement + aligned career paths | Self-determination theory (Deci & Ryan), calling research (Dik & Duffy), Ikigai | Planned | 3 |
| **K** | Energy & Time Engine | Mindooo Energy & Time Engine | Optimise energy patterns and time architecture | User asks about productivity or opens Energy module | Energy map + time audit + ultradian-aligned schedule | Ultradian rhythms (Kleitman), energy management (Loehr & Schwartz), chronobiology | Planned | 3 |
| **L** | Relationship & Support Engine | Mindooo Relationship & Support Engine | Map and optimise relationship ecosystem | User opens Relationships module | Support network map + energy analysis + communication plan | Attachment theory (Bowlby), social support (Cohen & Wills), Gottman methods | Planned | 3 |
| **M** | Cognitive Performance Engine | Mindooo Cognitive Performance Engine | Train, monitor, and enhance cognitive capabilities | User opens Cognition module or asks about brain training | Cognitive baseline + training plan + progress metrics | Neuroplasticity (Doidge, Merzenich), cognitive training (Jaeggi), memory research | Planned | 3 |

### Engine System Prompt Template

Every engine uses the same base context (from Context Engine) but adds engine-specific instructions:

```javascript
// services/prompts.js — Engine-specific prompt builder

function buildEnginePrompt(baseContext, engineCode) {
  const enginePrompts = {
    A: `
ENGINE: CLARITY (A)
ROLE: Conceptual clarifier
METHOD: 
1. Identify the core confusion
2. Distinguish facts from interpretations
3. Structure into: Situation -> Feeling -> Thought -> Need
4. Ask ONE clarifying question if needed
OUTPUT FORMAT:
- Clarity Statement: [Clear sentence]
- Core Issue: [Single phrase]
- Next Step: [ONE specific action]
`,
    B: `
ENGINE: GOAL BUILDER (B)
ROLE: Goal architect
METHOD:
1. Transform vague desire into SMART goal
2. Create implementation intention (If-Then)
3. Identify potential blockers
4. Define first 24-hour action
OUTPUT FORMAT:
- Goal: [Specific, measurable, time-bound]
- Implementation Intention: If [situation], then [action]
- Blockers: [List of 2-3]
- First Step: [Action for today]
`,
    // C through M follow same pattern
  }

  return `${baseContext}
${enginePrompts[engineCode]}`
}
```

---

## VII. MODULE-ENGINE DEPENDENCY MAP

### Who Needs What

| Module | Engines Used | Agents Used | Tables |
|---|---|---|---|
| Brain Dump Sanctuary | A, C | Analyst | chronicles |
| Mindooo Chat | A, B, C, D, E, F | Coach, Guardian | ai_conversations |
| Focus Sanctuary | — | Guardian | focus_sessions |
| Dashboard / Home | — | Analyst, Guardian | user_profiles |
| Journaling Nexus | A, C | Analyst | journal_entries |
| Emotional Mastery | C, H | Analyst, Guardian | emotional_logs |
| Habit Transformation | B, D | Analyst, Guardian | habits |
| Embodied Affirmations | — | Self-Model | identity_evidence |
| Self-Model | G, M | Self-Model, Analyst | cognitive_profile, user_about_me |
| About Me / Self-Discovery | G | Coach | user_about_me |
| Cognitive Performance | M | Self-Model | cognitive_profile |
| Life Clarity | A, G | Coach | (uses existing tables) |
| Blocker Elimination | H | Coach, Guardian | (uses existing tables) |
| Financial Freedom | I | Coach | (uses existing tables) |
| Purpose & Ikigai | J | Coach | (uses existing tables) |
| Energy & Time | K | Coach, Guardian | (uses existing tables) |
| Relationship & Support | L | Coach | (uses existing tables) |

---

## VIII. DATABASE TABLE REGISTRY

### All Tables by Module

| Table | Module Owner | Status | Purpose | Phase |
|---|---|---|---|---|
| `chronicles` | Brain Dump | Live | Core brain dump storage | 1 |
| `chronicle_folders` | Brain Dump | Live | Organization system | 1 |
| `focus_sessions` | Focus | Live | Deep work tracking | 1 |
| `user_profiles` | Dashboard | Live | Dashboard stats, identity | 1 |
| `ai_conversations` | Chat | Not created | Chat history | 2 |
| `ai_feedback` | Chat | Not created | Thumbs up/down ratings | 2 |
| `insights` | Dashboard | Not created | AI-generated discoveries | 2 |
| `journal_entries` | Journal | Not created | Structured reflection | 2 |
| `journal_templates` | Journal | Not created | Customizable templates | 2 |
| `emotional_logs` | Emotions | Not created | Emotion tracking | 2 |
| `regulation_techniques` | Emotions | Not created | Technique library | 2 |
| `user_regulation_prefs` | Emotions | Not created | Personalised toolkit | 2 |
| `habits` | Habits | Not created | Habit definitions | 2 |
| `habit_logs` | Habits | Not created | Daily tracking | 2 |
| `habit_streaks` | Habits | Not created | Streak analytics | 2 |
| `identity_evidence` | Affirmations | Not created | Evidence storage | 2 |
| `identity_claims` | Affirmations | Not created | Identity definitions | 2 |
| `self_model_snapshots` | Self-Model | Not created | Historical snapshots | 2 |
| `user_about_me` | About Me | Not created | 14-section self-knowledge | 3 |
| `cognitive_profile` | Cognition | Not created | Brain metrics | 3 |

---

## IX. BUILD PRIORITY & ROADMAP

### The Build Sequence

**PHASE 1: FOUNDATION — COMPLETE**
- Brain Dump Sanctuary — Full features, working
- Mindooo Chat — Built, AI integration in progress
- Focus Sanctuary — Basic version working
- Dashboard / Home — Real data, working

**PHASE 2: DEPTH — IN PROGRESS**

P0 (Critical — blocks everything):
- Complete Groq integration in ChatPanel
- Create ai_conversations table
- Save conversation history
- Build Context Engine (services/context.js)
- Build System Prompt Builder (services/prompts.js)
- Enable pgvector in Supabase
- Add Nomic API key
- Build RAG search (services/rag.js)

P1 (Important — enables core features):
- Create ai_feedback table
- Add thumbs up/down buttons to Chat UI
- Add OpenRouter fallback
- Test failover chain
- Create insights table
- Build Analyst agent (background)
- Build Guardian agent (background)

P2 (Enhancement — improves quality):
- Journaling Nexus — Design + build
- Emotional Mastery System — Design + build
- Habit Transformation Engine — Design + build
- Embodied Affirmations — Design + build
- Self-Model — Design + build

**PHASE 3: EXPANSION — PLANNED**
- About Me / Self-Discovery
- Cognitive Performance System
- Life Clarity Engine
- Blocker Elimination Engine
- Financial Freedom Engine
- Purpose & Ikigai Engine
- Energy & Time Engine
- Relationship & Support Engine

**PHASE 4: MASTERY — FUTURE**
- Self-Model v2 (AI-driven evolution)
- Public beta
- Monetization strategy
- Multi-user architecture

**PHASE 5: SCALE — VISION**
- Community features
- Coaching marketplace
- Enterprise version
- Open-source components

### Weekly Build Targets (Suggested)

| Week | Target | Deliverable |
|---|---|---|
| Week 1 | Chat AI completion | Groq fully integrated, conversations saving, basic context |
| Week 2 | RAG + Context | pgvector enabled, Nomic working, RAG search functional |
| Week 3 | Feedback loop | ai_feedback table, thumbs up/down buttons, weekly analysis |
| Week 4 | Agents v1 | Analyst + Guardian running in background |
| Week 5 | Journaling Nexus | Module built, templates working, AI-guided depth |
| Week 6 | Emotional Mastery | Emotion logging, regulation library, trigger mapping |
| Week 7 | Habit Engine | Habit loop mapper, streak tracker, recovery protocol |
| Week 8 | Integration | All Phase 2 modules wired to Dashboard, insights flowing |

---

## X. THE NON-NEGOTIABLES

### Module Build Rules

1. **Every module displays "Mindooo" correctly** — P0 bug if wrong
2. **Every module has RLS on all tables** — No exceptions
3. **Every module has a manifest.json** — No exceptions
4. **Every module has a README.md** — Document for Mo + future team
5. **Every module cites its science** — No woo, no guesswork
6. **Every module is lazy-loaded** — Shell performance depends on it
7. **Every module handles its own errors** — Never crash the shell
8. **Every module works for Mo's constraints** — Dyslexia, ADHD, zero coding
9. **Every module has a delete path** — Must be removable without breaking the system
10. **Every module has a test plan** — Even if tests are manual for now

### Engine Build Rules

1. **Every engine has a unique system prompt** — No generic prompts
2. **Every engine loads full context** — Partial context = generic response = bug
3. **Every engine cites sources when possible** — Science-based always
4. **Every engine ends with ONE action** — Actionable always
5. **Every engine saves to ai_conversations** — Memory depends on it
6. **Every engine has a fallback** — Never crash on AI failure
7. **Every engine is testable in isolation** — Debug without full system
8. **Every engine has a feedback loop** — Thumbs up/down on every response

---

## XI. VISUAL ECOSYSTEM MAP

### The Complete Module Universe

```
                    MINDOOO MODULE ECOSYSTEM — FULL MAP

        PHASE 1 (BUILT)         PHASE 2 (BUILD)         PHASE 3 (PLAN)
        ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
        │ Brain Dump  │          │ Journaling  │          │ About Me    │
        │ Sanctuary   │          │ Nexus       │          │ Self-Disc.  │
        ├─────────────┤          ├─────────────┤          ├─────────────┤
        │ Mindooo     │          │ Emotional   │          │ Cognitive   │
        │ Chat        │          │ Mastery     │          │ Performance │
        ├─────────────┤          ├─────────────┤          ├─────────────┤
        │ Focus       │          │ Habit       │          │ Life        │
        │ Sanctuary   │          │ Transform.  │          │ Clarity     │
        ├─────────────┤          ├─────────────┤          ├─────────────┤
        │ Dashboard   │          │ Embodied    │          │ Blocker     │
        │ / Home      │          │ Affirmations│          │ Elimination │
        └─────────────┘          ├─────────────┤          ├─────────────┤
                               │ Self-Model  │          │ Financial   │
                               └─────────────┘          │ Freedom     │
                                                        ├─────────────┤
                                                        │ Purpose &   │
                                                        │ Ikigai      │
                                                        ├─────────────┤
                                                        │ Energy &    │
                                                        │ Time        │
                                                        ├─────────────┤
                                                        │ Relationship│
                                                        │ & Support   │
                                                        └─────────────┘

                                CORE SYSTEMS (All Phases)
                                ┌─────────────────────────┐
                                │  Context Engine         │
                                │  RAG System             │
                                │  AI Gateway             │
                                │  Feedback Loop          │
                                │  13 Engines (A-M)       │
                                │  5 Agents               │
                                └─────────────────────────┘
```

### The Engine Matrix

```
    CURRENT ENGINES (A-F) — ACTIVE           NEW LIFE ENGINES (G-M) — PLANNED
    ┌───┬─────────────────────────┐           ┌───┬─────────────────────────┐
    │ A │ CLARITY ENGINE          │           │ G │ SELF-DISCOVERY ENGINE   │
    │   │ Vague -> Clear Thought  │           │   │ Map personality, values │
    ├───┼─────────────────────────┤           ├───┼─────────────────────────┤
    │ B │ GOAL BUILDER            │           │ H │ BLOCKER ELIMINATION     │
    │   │ Rough Idea -> Specific  │           │   │ Identify -> Remove all  │
    ├───┼─────────────────────────┤           ├───┼─────────────────────────┤
    │ C │ PROBLEM SOLVER          │           │ I │ FINANCIAL FREEDOM       │
    │   │ Diagnose -> Find Path   │           │   │ Clarity -> Strategy     │
    ├───┼─────────────────────────┤           ├───┼─────────────────────────┤
    │ D │ PROJECT LAUNCHER        │           │ J │ PURPOSE & IKIGAI        │
    │   │ Full Logical Plan       │           │   │ Discover -> Align       │
    ├───┼─────────────────────────┤           ├───┼─────────────────────────┤
    │ E │ TASK EXECUTOR           │           │ K │ ENERGY & TIME           │
    │   │ Perfect AI Prompt       │           │   │ Optimize rhythms        │
    ├───┼─────────────────────────┤           ├───┼─────────────────────────┤
    │ F │ SKILL BUILDER           │           │ L │ RELATIONSHIP & SUPPORT  │
    │   │ Personal Learning Path  │           │   │ Map -> Optimize         │
    └───┴─────────────────────────┘           ├───┼─────────────────────────┤
                                                │ M │ COGNITIVE PERFORMANCE   │
                                                │   │ Train -> Enhance        │
                                                └───┴─────────────────────────┘
```

---

## XII. CLOSING STATEMENT

This document is the **definitive specification** for every module and engine in Mindooo. It is not a wish list. It is a build contract.

Every module in this document has been designed with:
- **Mo's constraints first** — dyslexia, ADHD, zero coding skills
- **Science as foundation** — every feature cites peer-reviewed research
- **Modularity as law** — add without breaking, remove without crashing
- **Brand as sacred** — "Mindooo" (three o's) appears correctly everywhere
- **Action as output** — every AI response ends with one clear next step

The modules are the **what**. The engines are the **how**. The science is the **why**. Mo is the **who**.

**Phase 1 is built. Phase 2 is next. Phase 3 is vision. Phase 5 is legacy.**

From chaos to clarity. From planned to built. From stuck to free. Now do more.

---

*This document is the definitive modules and engines specification of Mindooo. It is the single source of truth for all build decisions. It evolves with every session, but its core — the 17 modules, the 13 engines, the modular architecture, the commitment to Mo — never changes without documentation.*

**Version**: 4.0 — The Architected Specification  
**Synthesized**: May 23, 2026  
**Next Review**: Next session  
**Status**: Active — Phase 1 Complete, Phase 2 Build In Progress  
**Brand**: Mindooo (three o's) — zero tolerance for "Mindoo"
