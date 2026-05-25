# MINDOOO — FILE STRUCTURE & MODULE SYSTEM
## The Complete Technical Map: Every File, Every Rule, Every Boundary
### From Chaos to Clarity. Now Do More.

**Version**: 4.0 — The Architected File System  
**Last Updated**: May 23, 2026  
**Status**: Active — Foundation for All Builds  
**Brand**: Mindooo (three o's) — zero tolerance for "Mindoo"  
**GitHub**: https://github.com/Mohamed-Elgendi/Mindooo  
**Primary User**: Mohamed (Mo) — Founder, First User, Living Blueprint  

---

## TABLE OF CONTENTS

I. [The Architecture Philosophy](#i-the-architecture-philosophy)  
II. [The Golden Rules — Immutable Laws](#ii-the-golden-rules--immutable-laws)  
III. [The Complete File Map](#iii-the-complete-file-map)  
IV. [The Module System — How to Add Anything](#iv-the-module-system--how-to-add-anything)  
V. [The Import Rules — Dependency Boundaries](#v-the-import-rules--dependency-boundaries)  
VI. [The Service Layer Contract](#vi-the-service-layer-contract)  
VII. [The Config Layer — Central Authority](#vii-the-config-layer--central-authority)  
VIII. [The Component Layer — UI Building Blocks](#viii-the-component-layer--ui-building-blocks)  
IX. [The Pages Layer — Route Entry Points](#ix-the-pages-layer--route-entry-points)  
X. [The Sections Layer — Feature Modules](#x-the-sections-layer--feature-modules)  
XI. [The Hooks Layer — Reusable Logic](#xi-the-hooks-layer--reusable-logic)  
XII. [The Data Flow Architecture](#xii-the-data-flow-architecture)  
XIII. [The Error & Crash Protection System](#xiii-the-error--crash-protection-system)  
XIV. [The Sacred Files — Never Touch](#xiv-the-sacred-files--never-touch)  
XV. [The Build Checklist — Adding a New Module](#xv-the-build-checklist--adding-a-new-module)  
XVI. [The Non-Negotiables](#xvi-the-non-negotiables)  
XVII. [Closing Statement](#xvii-closing-statement)  

---

## I. THE ARCHITECTURE PHILOSOPHY

### The Core Truth
Mindooo's file structure is not just organisation. It is **enforcement of the seven immutable principles** through code boundaries.

| Principle | File Structure Manifestation |
|-----------|------------------------------|
| **Science-Based** | Every module has a `science/` subfolder with citations |
| **Personal** | `user_about_me`, `cognitive_profile` tables isolated per user |
| **Never Crashes** | `ErrorBoundary.jsx` wraps every section; services handle all failures |
| **Modular** | Adding a module = adding files only. Never modify existing files. |
| **Data-Safe** | `services/db.js` is the ONLY file that touches Supabase. RLS enforced. |
| **Transparent AI** | `services/ai.js` is the ONLY file that calls AI. All prompts versioned. |
| **Progressive** | `config/modules.js` registers new capabilities without touching old code. |

### The Structural Equation
**Traditional File Structure**: Flat folders, cross-imports, spaghetti dependencies  
**Mindooo File Structure**: (Isolation × Clarity) ^ Modularity × Enforcement = Exponential Scalability

### Why This Matters for Mo
Mo has zero coding skills, dyslexia-type learning challenges, and ADHD-type execution challenges. The file structure must be:
- **Predictable**: Every module looks the same
- **Safe**: Adding features never breaks existing features
- **Documented**: Every file's purpose is explicit
- **Enforced**: Rules are structural, not just written

---

## II. THE GOLDEN RULES — IMMUTABLE LAWS

These rules are not suggestions. They are structural boundaries enforced by the architecture itself.

### Rule 1: The Service Gatekeeper Law
> **Components NEVER call Supabase directly. Components NEVER call AI APIs directly.**

| Layer | Can Touch Supabase? | Can Touch AI APIs? | Why |
|-------|----------------------|-------------------|-----|
| `components/` | ❌ NEVER | ❌ NEVER | UI only. No side effects. |
| `pages/sections/` | ❌ NEVER | ❌ NEVER | Feature logic only. No direct I/O. |
| `hooks/` | ❌ NEVER | ❌ NEVER | Reusable logic. No direct I/O. |
| `services/db.js` | ✅ ONLY HERE | ❌ NEVER | Single database gateway. Testable. Secure. |
| `services/ai.js` | ❌ NEVER | ✅ ONLY HERE | Single AI gateway. Failover handled. Prompts versioned. |
| `services/rag.js` | ❌ NEVER | ❌ NEVER (calls ai.js for embeddings) | RAG retrieval only. No direct AI calls. |
| `services/context.js` | ❌ NEVER | ❌ NEVER (calls db.js) | Context assembly only. |

**Violation Consequence**: P0 bug. Breaks data isolation, breaks failover chain, breaks testability.

### Rule 2: The Section Sovereignty Law
> **Sections NEVER import from other sections. Each section is a sovereign universe.**

```javascript
// ❌ FORBIDDEN — sections never import sections
import { BrainDump } from './BrainDump'
import { useFocusData } from './FocusSection'

// ✅ CORRECT — sections only import from services, hooks, components, config
import { saveChronicle } from '../../services/db'
import { useAuth } from '../../hooks/useAuth'
import { MindoooButton } from '../../components/MindoooButton'
import { MODULES } from '../../config/modules'
```

**Violation Consequence**: Cross-module coupling. Removing one section breaks another. Violates modularity principle.

### Rule 3: The Add-Only Law
> **Adding a module = adding files only. Never modify existing section files. Never modify existing service functions.**

| Action | What You Do | What You NEVER Do |
|--------|-------------|-------------------|
| Add a module | Create `NewModule.jsx` | Modify `BrainDump.jsx` |
| Add a database function | Add function to `services/db.js` | Modify `saveChronicle()` |
| Add an AI prompt | Add prompt to `services/ai.js` | Modify `analyzeChronicle()` |
| Add a route | Add entry to `config/modules.js` | Modify `App.jsx` routes directly |
| Add a sidebar item | Add to `MODULES` array in `config/modules.js` | Modify `Sidebar.jsx` |

**Violation Consequence**: Regression bugs. Lost features. Broken stability. Technical debt.

### Rule 4: The Config Authority Law
> **All module metadata lives in `config/modules.js`. Never hardcode module data elsewhere.**

`Sidebar.jsx` reads `MODULES` array.  
`Dashboard.jsx` reads `MODULES` array.  
`App.jsx` reads `MODULES` array for routes.  

**Violation Consequence**: Inconsistent navigation. Missing routes. Brand display errors.

### Rule 5: The Supabase Singleton Law
> **`supabase.js` is imported by `services/db.js` ONLY. Never in components. Never in hooks. Never in sections.**

```javascript
// ❌ FORBIDDEN — components never import supabase
import { supabase } from '../supabase'

// ✅ CORRECT — components import from services
typeof import { saveChronicle } from '../../services/db'

// ✅ CORRECT — only services/db.js imports supabase
import { supabase } from '../supabase'
```

**Violation Consequence**: Security exposure. Connection pool exhaustion. Untestable code.

### Rule 6: The Brand Enforcement Law
> **"Mindooo" (three o's) appears correctly in every file name, every comment, every string. Zero tolerance for "Mindoo" (two o's).**

| Context | Correct | Forbidden |
|---------|---------|-----------|
| File names | `mindooo-dashboard.jsx` | `mindoo-dashboard.jsx` |
| CSS classes | `.mindooo-btn` | `.mindoo-btn` |
| Comments | `// Mindooo: handles RAG` | `// Mindoo: handles RAG` |
| Variables | `const mindoooUser = ...` | `const mindooUser = ...` |
| Display text | `Welcome to Mindooo` | `Welcome to Mindoo` |

**Violation Consequence**: P0 bug. Brand integrity breach. User trust erosion.

---

## III. THE COMPLETE FILE MAP

### Visual Architecture

```
~/axis-app/
│
├── 🔐 .env.local                          API keys — NEVER commit
│   ├── VITE_SUPABASE_URL
│   ├── VITE_SUPABASE_ANON_KEY
│   ├── VITE_GROQ_API_KEY                  Primary AI provider
│   ├── VITE_OPENROUTER_API_KEY            Fallback AI provider
│   ├── VITE_NOMIC_API_KEY                 Embedding provider (free)
│   ├── VITE_APP_NAME=Mindooo
│   └── VITE_APP_VERSION=3.0
│
├── 📁 public/
│   ├── favicon.ico                          M∞ or M3 icon
│   ├── manifest.json                        PWA manifest
│   └── assets/
│       ├── mindooo-logo.svg
│       └── mindooo-og-image.png
│
├── 📁 src/
│   │
│   ├── 🚀 main.jsx                          Entry point — renders App
│   │   └── NEVER MODIFY — bootstrap only
│   │
│   ├── 🧭 App.jsx                           Router — ALL routes defined here
│   │   ├── / → /signin
│   │   ├── /signin, /signup
│   │   ├── /dashboard (main app shell)
│   │   ├── /forgot-password, /reset-password
│   │   ├── /terms, /privacy
│   │   └── NEVER ADD ROUTES HERE — use config/modules.js
│   │
│   ├── 🎨 index.css                         Global design system
│   │   ├── CSS variables (colors, spacing, typography)
│   │   ├── Utility classes
│   │   ├── Animation keyframes
│   │   └── Dyslexia-friendly font stack
│   │   └── NEVER ADD INLINE STYLES if class exists here
│   │
│   ├── 🔌 supabase.js                       Supabase client singleton
│   │   ├── ONE import: createClient
│   │   ├── Exported: supabase instance
│   │   └── IMPORTED BY: services/db.js ONLY
│   │   └── NEVER IMPORT IN COMPONENTS
│   │
│   ├── 📁 components/                       UI BUILDING BLOCKS
│   │   │                                    Reusable, stateless, pure
│   │   │
│   │   ├── 🛡️ ErrorBoundary.jsx              Crash protection wrapper
│   │   │   ├── Catches all React errors
│   │   │   ├── Shows Mindooo-branded fallback UI
│   │   │   ├── Logs to console + optional error reporting
│   │   │   └── NEVER MODIFY — critical for stability
│   │   │
│   │   ├── 🎨 Icons.jsx                      ALL SVG icons
│   │   │   ├── Every icon as React component
│   │   │   ├── Add new icons here ONLY
│   │   │   └── NEVER inline SVG in components
│   │   │
│   │   ├── 🧭 Sidebar.jsx                    Left navigation
│   │   │   ├── Reads MODULES from config/modules.js
│   │   │   ├── Renders module links dynamically
│   │   │   ├── Shows Mindooo logo (top)
│   │   │   ├── Shows user profile (bottom)
│   │   │   └── NEVER HARDCODE navigation items
│   │   │
│   │   ├── 📊 Topbar.jsx                     Top bar
│   │   │   ├── Clock / Date
│   │   │   ├── Notifications
│   │   │   ├── User avatar
│   │   │   └── Module title
│   │   │
│   │   ├── 🔄 MindoooSkeleton.jsx            Loading placeholder
│   │   │   ├── Branded skeleton screens
│   │   │   └── Used by Suspense fallback
│   │   │
│   │   ├── 👍 MindoooFeedback.jsx            Thumbs up/down buttons
│   │   │   ├── Submits to ai_feedback table
│   │   │   └── Shows in ChatPanel
│   │   │
│   │   └── 📝 MindoooMarkdown.jsx            Markdown renderer
│   │       ├── AI response formatting
│   │       └── Citation links
│   │
│   ├── 📁 config/                           CENTRAL AUTHORITY
│   │   │
│   │   └── 🧩 modules.js                    THE SINGLE SOURCE OF TRUTH
│   │       ├── MODULES array — all 17 modules
│   │       ├── ENGINES array — all 13 engines
│   │       ├── buildSystemPrompt() — AI prompt builder
│   │       ├── Route mappings
│   │       ├── Color definitions
│   │       └── Icon assignments
│   │       └── ADD NEW MODULES HERE ONLY
│   │       └── NEVER HARDCODE MODULE DATA ELSEWHERE
│   │
│   ├── 📁 hooks/                            REUSABLE LOGIC
│   │   │
│   │   ├── 🔐 useAuth.js                     Authentication
│   │   │   ├── Returns: { user, firstName, loading, logout }
│   │   │   ├── Used by: Dashboard.jsx
│   │   │   └── Manages Supabase Auth state
│   │   │
│   │   ├── 📊 useData.js                     Dashboard data
│   │   │   ├── Returns: { stats, loading, error, refresh }
│   │   │   ├── Calls: loadDashboardStats from services/db
│   │   │   └── Parallel loading for performance
│   │   │
│   │   ├── 🎯 useFocus.js                    Focus session logic
│   │   │   ├── Timer management
│   │   │   ├── Session state
│   │   │   └── Interruption tracking
│   │   │
│   │   └── 🧠 useRAG.js                      RAG search hook
│   │       ├── Query embedding
│   │       ├── Vector search
│   │       └── Context formatting
│   │
│   ├── 📁 pages/                            ROUTE ENTRY POINTS
│   │   │
│   │   ├── 🏠 Dashboard.jsx                  THE SACRED SHELL
│   │   │   ├── Thin coordinator ONLY
│   │   │   ├── Handles: auth guard, section switching, clock
│   │   │   ├── Reads active section from URL/state
│   │   │   ├── Lazy-loads sections via React.lazy()
│   │   │   ├── Wraps sections in ErrorBoundary
│   │   │   ├── NEVER CONTAINS UI FEATURES
│   │   │   ├── NEVER CALLS DATABASE DIRECTLY
│   │   │   └── NEVER IMPORTS SECTION FILES DIRECTLY
│   │   │
│   │   ├── 📦 Dashboard.backup.jsx           EMERGENCY RESTORE
│   │   │   └── DO NOT TOUCH OR DELETE
│   │   │
│   │   ├── 🔑 SignIn.jsx                     Sign in page
│   │   ├── 📝 SignUp.jsx                     Sign up page
│   │   ├── 🔓 ForgotPassword.jsx             Password reset request
│   │   ├── 🔄 ResetPassword.jsx              Password reset form
│   │   ├── 📄 Terms.jsx                      Terms of service
│   │   └── 🔒 Privacy.jsx                    Privacy policy
│   │
│   ├── 📁 pages/sections/                   FEATURE MODULES
│   │   │                                      THE HEART OF MINDOOO
│   │   │                                      Each file = one module
│   │   │                                      NEVER IMPORT ACROSS SECTIONS
│   │   │
│   │   ├── 🧠 BrainDump.jsx                  MODULE-01 — Brain Dump Sanctuary
│   │   │   ├── 946 lines — DO NOT OVERWRITE
│   │   │   ├── Imports: services/db, services/ai
│   │   │   ├── Features: text, voice, session, AI analysis
│   │   │   └── Status: ✅ ACTIVE — Full features
│   │   │
│   │   ├── 💬 ChatPanel.jsx                  MODULE-02 — Mindooo Chat
│   │   │   ├── AI chat interface
│   │   │   ├── 6 engine selectors (A-F)
│   │   │   ├── Needs: Groq implementation
│   │   │   ├── Status: ⚠️ PARTIAL — AI integration in progress
│   │   │   └── Next: Context engine, RAG, feedback buttons
│   │   │
│   │   ├── 🎯 FocusSection.jsx               MODULE-03 — Focus Sanctuary
│   │   │   ├── Basic focus timer
│   │   │   ├── Session modes: deep_work, shallow_work, recovery
│   │   │   ├── Status: ✅ BASIC — Functional
│   │   │   └── Next: Interruption tracking, energy rating, analytics
│   │   │
│   │   ├── 🏠 Home.jsx                       MODULE-04 — Dashboard / Home
│   │   │   ├── Real KPI data via useData hook
│   │   │   ├── Module grid navigation
│   │   │   ├── Quick actions
│   │   │   ├── Self-Model preview (hardcoded → needs real data)
│   │   │   └── Status: ✅ ACTIVE — Real data
│   │   │
│   │   ├── 📦 ModulePage.jsx                 MODULE-00 — Coming Soon
│   │   │   ├── Placeholder for unbuilt modules
│   │   │   ├── Shows: module name, description, phase, ETA
│   │   │   └── Status: ✅ ACTIVE
│   │   │
│   │   ├── ⚙️ Settings.jsx                   MODULE-05 — Settings
│   │   │   ├── User preferences
│   │   │   ├── Theme toggle
│   │   │   ├── Notification settings
│   │   │   └── Status: ✅ ACTIVE
│   │   │
│   │   ├── 📖 JournalSection.jsx             MODULE-06 — Journaling Nexus
│   │   │   ├── Status: 🔄 PLANNED — Phase 2
│   │   │   └── Next: Morning charter, evening inventory, weekly synthesis
│   │   │
│   │   ├── 💝 EmotionSection.jsx             MODULE-07 — Emotional Mastery
│   │   │   ├── Status: 🔄 PLANNED — Phase 2
│   │   │   └── Next: Emotion logger, regulation library, trigger mapping
│   │   │
│   │   ├── 🔄 HabitSection.jsx               MODULE-08 — Habit Transformation
│   │   │   ├── Status: 🔄 PLANNED — Phase 2
│   │   │   └── Next: Habit loop mapper, streak tracker, recovery protocol
│   │   │
│   │   ├── ✨ AffirmationSection.jsx         MODULE-09 — Embodied Affirmations
│   │   │   ├── Status: 🔄 PLANNED — Phase 2
│   │   │   └── Next: Evidence collector, identity scoring, gap analysis
│   │   │
│   │   ├── 👤 SelfModelSection.jsx           MODULE-10 — Self-Model
│   │   │   ├── Status: 🔄 PLANNED — Phase 2
│   │   │   └── Next: Cognitive profile, emotional profile, behavioural profile
│   │   │
│   │   ├── 🧭 AboutMeSection.jsx             MODULE-11 — About Me / Self-Discovery
│   │   │   ├── Status: 🔄 PLANNED — Phase 3
│   │   │   └── Next: 14-section progressive build
│   │   │
│   │   ├── 🧠 CognitionSection.jsx           MODULE-12 — Cognitive Performance
│   │   │   ├── Status: 🔄 PLANNED — Phase 3
│   │   │   └── Next: 14-dimension monitoring, brain gym, weekly reports
│   │   │
│   │   ├── 💡 ClaritySection.jsx             MODULE-13 — Life Clarity
│   │   │   ├── Status: 🔄 PLANNED — Phase 3
│   │   │   └── Next: Life wheel, values clarification, priority mapping
│   │   │
│   │   ├── 🛡️ BlockerSection.jsx             MODULE-14 — Blocker Elimination
│   │   │   ├── Status: 🔄 PLANNED — Phase 3
│   │   │   └── Next: Blocker inventory, root cause, elimination plan
│   │   │
│   │   ├── 💰 FinanceSection.jsx             MODULE-15 — Financial Freedom
│   │   │   ├── Status: 🔄 PLANNED — Phase 3
│   │   │   └── Next: Financial mapping, income strategy, mindset shift
│   │   │
│   │   ├── 🌟 PurposeSection.jsx             MODULE-16 — Purpose & Ikigai
│   │   │   ├── Status: 🔄 PLANNED — Phase 3
│   │   │   └── Next: Ikigai mapping, purpose statement, aligned paths
│   │   │
│   │   ├── ⚡ EnergySection.jsx               MODULE-17 — Energy & Time
│   │   │   ├── Status: 🔄 PLANNED — Phase 3
│   │   │   └── Next: Energy mapping, time audit, ultradian optimisation
│   │   │
│   │   └── 🤝 RelationshipSection.jsx      MODULE-18 — Relationship & Support
│   │       ├── Status: 🔄 PLANNED — Phase 3
│   │       └── Next: Network mapping, energy analysis, communication plan
│   │
│   └── 📁 services/                         THE ONLY FILES THAT TALK TO OUTSIDE WORLD
│       │
│       ├── 🗄️ db.js                         DATABASE GATEWAY
│       │   ├── ALL Supabase calls live here
│       │   ├── Functions:
│       │   │   ├── saveChronicle()
│       │   │   ├── saveVoiceChronicle()
│       │   │   ├── saveSessionChronicle()
│       │   │   ├── uploadVoiceBlob()
│       │   │   ├── loadChronicles()
│       │   │   ├── updateChronicle()
│       │   │   ├── deleteChronicle()
│       │   │   ├── saveFocusSession()
│       │   │   ├── loadFocusSessions()
│       │   │   ├── getWeeklyFocusStats()
│       │   │   ├── getOrCreateProfile()
│       │   │   ├── loadDashboardStats()
│       │   │   ├── saveUserAboutMe()
│       │   │   ├── loadUserAboutMe()
│       │   │   ├── saveCognitiveProfile()
│       │   │   ├── loadCognitiveProfile()
│       │   │   ├── saveAIConversation()
│       │   │   ├── loadAIConversations()
│       │   │   ├── saveAIFeedback()
│       │   │   ├── loadAIFeedback()
│       │   │   ├── saveInsight()
│       │   │   ├── loadInsights()
│       │   │   ├── saveBrainGymSession()
│       │   │   ├── loadBrainGymSessions()
│       │   │   ├── saveEmotionalLog()
│       │   │   ├── loadEmotionalLogs()
│       │   │   ├── saveHabit()
│       │   │   ├── loadHabits()
│       │   │   ├── saveHabitLog()
│       │   │   ├── saveIdentityEvidence()
│       │   │   ├── loadIdentityEvidence()
│       │   │   ├── saveJournalEntry()
│       │   │   ├── loadJournalEntries()
│       │   │   ├── saveRegulationTechnique()
│       │   │   ├── loadRegulationTechniques()
│       │   │   ├── saveSelfModelSnapshot()
│       │   │   └── loadSelfModelSnapshots()
│       │   ├── Imports: supabase from '../supabase'
│       │   └── NEVER IMPORTED BY COMPONENTS DIRECTLY
│       │
│       ├── 🤖 ai.js                         AI GATEWAY
│       │   ├── ALL AI calls live here
│       │   ├── Functions:
│       │   │   ├── analyzeChronicle()           — Silent chronicle analysis
│       │   │   ├── callMindoooAI()              — Main AI gateway with failover
│       │   │   ├── callGroq()                   — Primary provider
│       │   │   ├── callOpenRouter()             — Fallback provider
│       │   │   ├── formatDuration()             — Utility
│       │   │   ├── buildSystemPrompt()          — Context + engine prompt
│       │   │   ├── buildContext()               — Load all user data
│       │   │   ├── embedDocument()              — Nomic document embedding
│       │   │   ├── embedQuery()                 — Nomic query embedding
│       │   │   ├── ragSearch()                  — Vector similarity search
│       │   │   ├── saveConversation()           — Persist chat history
│       │   │   ├── loadConversationHistory()     — Retrieve chat history
│       │   │   ├── runAnalystAgent()            — Background pattern detection
│       │   │   ├── runGuardianAgent()           — Background anomaly detection
│       │   │   ├── runSelfModelBuilder()        — Profile evolution
│       │   │   ├── generateWeeklyReport()       — Cognitive weekly report
│       │   │   ├── coachResponse()              — Chat coach agent
│       │   │   ├── plannerResponse()            — Goal planner agent
│       │   │   └── analyzeWeeklyFeedback()      — Feedback loop analysis
│       │   ├── Config: AI_CONFIG object with failover chain
│       │   └── NEVER IMPORTED BY COMPONENTS DIRECTLY
│       │
│       ├── 🔍 embeddings.js                 EMBEDDING SERVICE
│       │   ├── Nomic API integration
│       │   ├── Functions:
│       │   │   ├── embedDocument()
│       │   │   ├── embedQuery()
│       │   │   └── embedBatch()
│       │   └── Called by: ai.js, db.js (background jobs)
│       │
│       ├── 🧠 context.js                    CONTEXT ENGINE
│       │   ├── Builds complete user context for AI
│       │   ├── Functions:
│       │   │   ├── buildMindoooContext()        — Load all user data
│       │   │   ├── loadUserProfile()            — Quick stats
│       │   │   ├── loadUserAboutMe()            — Deep self-knowledge
│       │   │   ├── loadCognitiveProfile()       — Brain metrics
│       │   │   ├── loadRecentChronicles()       — Last 5 dumps
│       │   │   ├── loadRecentConversations()    — Last 10 messages
│       │   │   └── loadDashboardStats()         — Aggregated KPIs
│       │   └── Called by: ai.js
│       │
│       ├── 📝 prompts.js                  PROMPT BUILDER
│       │   ├── System prompt templates for all engines
│       │   ├── Functions:
│       │   │   ├── buildMindoooSystemPrompt()   — Base prompt + context
│       │   │   ├── buildEnginePrompt()          — Engine-specific instructions
│       │   │   ├── buildCoachPrompt()             — Coach agent prompt
│       │   │   ├── buildAnalystPrompt()         — Analyst agent prompt
│       │   │   ├── buildGuardianPrompt()        — Guardian agent prompt
│       │   │   ├── buildPlannerPrompt()         — Planner agent prompt
│       │   │   └── buildSelfModelPrompt()       — Self-Model agent prompt
│       │   └── Called by: ai.js
│       │
│       └── 🔄 rag.js                        RAG ENGINE
│           ├── Vector search and retrieval
│           ├── Functions:
│           │   ├── ragSearch()                  — Main RAG search
│           │   ├── formatRAGContext()           — Format results for AI
│           │   ├── matchChronicles()            — Chronicle similarity
│           │   ├── matchConversations()         — Conversation similarity
│           │   └── indexChronicle()             — Embed and store vector
│           └── Called by: ai.js, context.js
│
├── 📄 index.html                            HTML entry point
│   ├── <title>Mindooo — [Page Name]</title>
│   └── Meta tags for SEO/social
│
├── 📄 package.json
│   ├── "name": "mindooo"
│   ├── Dependencies: react, react-dom, react-router-dom, @supabase/supabase-js
│   └── Scripts: dev, build, preview
│
├── 📄 vite.config.js                        Vite configuration
│   └── Plugins, aliases, build settings
│
├── 📄 tailwind.config.js                      Tailwind configuration
│   ├── Custom colors (Mindooo palette)
│   ├── Custom fonts
│   └── Custom spacing
│
├── 📄 .eslintrc.cjs                         Linting rules
│   └── Enforces import boundaries
│
├── 📄 .gitignore
│   ├── node_modules
│   ├── .env.local
│   └── dist
│
└── 📄 README.md
    ├── # Mindooo — The Life Operating System
    ├── Setup instructions
    └── Environment variables list
```

---

## IV. THE MODULE SYSTEM — HOW TO ADD ANYTHING

### The Module Interface Contract

Every module MUST provide these files. No exceptions.

```
src/pages/sections/[ModuleName].jsx     <- Main component (lazy-loaded)
src/config/modules.js                    <- Module registration (ONE entry)
src/services/db.js                       <- Database functions (added, not modified)
src/services/ai.js                       <- AI prompts (added, not modified)
```

### The 5-Step Module Addition Process

```
┌─────────────────────────────────────────────────────────────────┐
│              ADDING A NEW MODULE TO MINDOOO                    │
│                                                                 │
│  STEP 1: CREATE SECTION FILE                                    │
│  ├── Create: src/pages/sections/NewModule.jsx                 │
│  ├── Structure:                                               │
│  │   ├── Imports (services, hooks, components, config)         │
│  │   ├── Component function                                    │
│  │   ├── State management (useState, useEffect)                │
│  │   ├── Event handlers (call services only)                   │
│  │   ├── JSX return (UI)                                       │
│  │   └── Export default                                        │
│  └── NEVER import from other sections                          │
│                                                                 │
│  STEP 2: ADD DATABASE FUNCTIONS                                 │
│  ├── Open: src/services/db.js                                 │
│  ├── Add NEW functions at the bottom (never modify existing)  │
│  ├── Example:                                                  │
│  │   export async function saveNewModuleData(userId, data) {   │
│  │     return await supabase.from('new_table').insert(...)     │
│  │   }                                                         │
│  └── NEVER modify existing functions                           │
│                                                                 │
│  STEP 3: ADD AI PROMPTS (if needed)                             │
│  ├── Open: src/services/ai.js                                 │
│  ├── Add NEW prompt functions (never modify existing)         │
│  ├── Example:                                                  │
│  │   export async function newModuleAI(userId, input) {        │
│  │     const context = await buildContext(userId)             │
│  │     const prompt = buildNewModulePrompt(context)           │
│  │     return await callMindoooAI(prompt, input)              │
│  │   }                                                         │
│  └── NEVER modify existing AI functions                        │
│                                                                 │
│  STEP 4: REGISTER IN CONFIG                                     │
│  ├── Open: src/config/modules.js                              │
│  ├── Add to MODULES array:                                     │
│  │   {                                                         │
│  │     id: 'new-module',                                        │
│  │     name: 'Mindooo New Module',                              │
│  │     route: '/new-module',                                    │
│  │     icon: 'NewIcon',                                         │
│  │     color: '#HEXCODE',                                       │
│  │     phase: 2,                                                │
│  │     status: 'active',                                        │
│  │     description: 'What this module does'                     │
│  │   }                                                         │
│  └── Sidebar, router, and dashboard auto-update                  │
│                                                                 │
│  STEP 5: VERIFY (Before Commit)                                │
│  ├── [ ] Module file created and follows structure              │
│  ├── [ ] Database functions added (not modified existing)       │
│  ├── [ ] AI prompts added (not modified existing)               │
│  ├── [ ] Config entry added with correct name/spelling          │
│  ├── [ ] "Mindooo" (3 o's) verified in all strings             │
│  ├── [ ] No cross-section imports                               │
│  ├── [ ] No direct Supabase/AI imports in component             │
│  ├── [ ] RLS policies added for new tables (if any)           │
│  ├── [ ] Test: Module loads without errors                      │
│  └── [ ] Test: Existing modules still work                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Module Status Definitions

| Status | Icon | Meaning | User Sees |
|--------|------|---------|-----------|
| **active** | ✅ | Fully built and working | Full module UI |
| **building** | 🔄 | In development | "Building..." with progress |
| **planned** | 📋 | Scheduled for future | "Coming in Phase X" |
| **deprecated** | ⚠️ | Being replaced | Migration notice |

---

## V. THE IMPORT RULES — DEPENDENCY BOUNDARIES

### The Import Matrix

| From ↓ / To → | components | hooks | pages | sections | services | config | supabase |
|---------------|:----------:|:-----:|:-----:|:--------:|:--------:|:------:|:--------:|
| **components** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| **hooks** | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| **pages** | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| **sections** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| **services** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **config** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **supabase** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |

### Correct Import Patterns

```javascript
// ============================================================
// IN A SECTION FILE (e.g., BrainDump.jsx)
// ============================================================

// ✅ Services — the ONLY way to touch data or AI
import { saveChronicle, loadChronicles } from '../../services/db'
import { analyzeChronicle } from '../../services/ai'

// ✅ Hooks — reusable logic
import { useAuth } from '../../hooks/useAuth'
import { useData } from '../../hooks/useData'

// ✅ Components — UI building blocks
import { MindoooButton } from '../../components/MindoooButton'
import { MindoooSkeleton } from '../../components/MindoooSkeleton'

// ✅ Config — central authority
import { MODULES } from '../../config/modules'

// ❌ FORBIDDEN — never do these
import { supabase } from '../../supabase'           // NEVER in components
import { ChatPanel } from './ChatPanel'              // NEVER cross-section
import { saveFocusSession } from '../services/db'    // Wrong relative path


// ============================================================
// IN services/db.js
// ============================================================

// ✅ ONLY db.js imports supabase
import { supabase } from '../supabase'

// ✅ db.js can import other services
import { embedDocument } from './embeddings'

// ❌ FORBIDDEN
import { useAuth } from '../hooks/useAuth'            // No hooks in services
import { BrainDump } from '../pages/sections/BrainDump' // No sections in services


// ============================================================
// IN services/ai.js
// ============================================================

// ✅ ai.js imports from services
import { supabase } from '../supabase'               // For conversation storage
import { embedQuery } from './embeddings'
import { buildMindoooContext } from './context'
import { buildMindoooSystemPrompt } from './prompts'

// ❌ FORBIDDEN
import { useState } from 'react'                      // No React in services
import { MindoooButton } from '../components/MindoooButton' // No components in services
```

---

## VI. THE SERVICE LAYER CONTRACT

### services/db.js — The Database Gateway

**Purpose**: ALL database operations. Single point of contact with Supabase.  
**Imports**: `supabase` from `../supabase` (ONLY import from outside)  
**Exports**: Named exports for every database operation  
**Rules**:
- Every function takes `userId` as first parameter
- Every function returns `{ data, error }` shape
- Every function handles errors gracefully
- Every function includes RLS compliance

```javascript
// services/db.js — Contract Template

/**
 * Save a new chronicle to the database
 * @param {string} userId — The authenticated user's UUID
 * @param {object} chronicle — The chronicle data object
 * @returns {Promise<{data: object|null, error: Error|null}>}
 */
export async function saveChronicle(userId, chronicle) {
  if (!userId) {
    console.error('Mindooo db: saveChronicle called without userId')
    return { data: null, error: new Error('Authentication required') }
  }

  try {
    const { data, error } = await supabase
      .from('chronicles')
      .insert({
        user_id: userId,
        title: chronicle.title || '',
        text: chronicle.text || '',
        origin: chronicle.origin || 'text',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }

  } catch (err) {
    console.error('Mindooo db: saveChronicle failed', err)
    return { data: null, error: err }
  }
}
```

### services/ai.js — The AI Gateway

**Purpose**: ALL AI operations. Single point of contact with AI providers.  
**Imports**: Config, context builder, prompt builder, embeddings  
**Exports**: Named exports for every AI operation  
**Rules**:
- Every function implements failover chain (Groq → OpenRouter → Cached)
- Every function logs provider used
- Every function returns consistent shape: `{ text, model, provider, failed, tokens }`
- Every function handles errors with graceful fallback

```javascript
// services/ai.js — Contract Template

const AI_CONFIG = {
  primary: { name: 'Groq', url: '...', model: 'llama-3.3-70b-versatile' },
  fallback1: { name: 'OpenRouter', url: '...', model: 'meta-llama/llama-3.3-70b' },
  fallback2: { name: 'Cached', response: { text: 'Mindooo is having trouble...', failed: true } }
}

/**
 * Call Mindooo AI with full failover chain
 * @param {Array} messages — Conversation messages
 * @param {string} systemPrompt — System prompt with context
 * @param {string} engine — Engine code (A-M)
 * @returns {Promise<{text: string, model: string, provider: string, failed: boolean, tokens: number}>}
 */
export async function callMindoooAI(messages, systemPrompt, engine = 'coach') {
  // Try primary → fallback1 → fallback2
  // Return consistent shape regardless of outcome
}
```

---

## VII. THE CONFIG LAYER — CENTRAL AUTHORITY

### config/modules.js — The Single Source of Truth

This file is the **brain of the module system**. Every module, engine, route, and display name is defined here. Nothing is hardcoded elsewhere.

```javascript
// config/modules.js — Complete Structure

// ============================================================
// MODULES ARRAY — All 17 modules
// ============================================================
export const MODULES = [
  {
    id: 'home',
    name: 'Mindooo Dashboard',
    shortName: 'Dashboard',
    route: '/',
    icon: 'LayoutDashboard',
    color: '#1E3A5F',
    phase: 1,
    status: 'active',
    description: 'Central command with live metrics',
    table: 'user_profiles',
    engine: null
  },
  {
    id: 'brain-dump',
    name: 'Mindooo Brain Dump',
    shortName: 'Brain Dump',
    route: '/brain-dump',
    icon: 'Brain',
    color: '#3B82F6',
    phase: 1,
    status: 'active',
    description: 'Zero-friction capture of all mental inputs',
    table: 'chronicles',
    engine: null
  },
  {
    id: 'chat',
    name: 'Mindooo Chat',
    shortName: 'Chat',
    route: '/chat',
    icon: 'MessageCircle',
    color: '#F4A261',
    phase: 1,
    status: 'active',
    description: 'Personal AI coach with full life context',
    table: 'ai_conversations',
    engine: 'coach'
  },
  {
    id: 'focus',
    name: 'Mindooo Focus',
    shortName: 'Focus',
    route: '/focus',
    icon: 'Target',
    color: '#2A9D8F',
    phase: 1,
    status: 'active',
    description: 'Protected deep work sessions',
    table: 'focus_sessions',
    engine: null
  },
  {
    id: 'settings',
    name: 'Mindooo Settings',
    shortName: 'Settings',
    route: '/settings',
    icon: 'Settings',
    color: '#6B7280',
    phase: 1,
    status: 'active',
    description: 'User preferences and configuration',
    table: null,
    engine: null
  },
  // Phase 2 modules...
  {
    id: 'journal',
    name: 'Mindooo Journal',
    shortName: 'Journal',
    route: '/journal',
    icon: 'BookOpen',
    color: '#8B5CF6',
    phase: 2,
    status: 'planned',
    description: 'Structured reflection and meaning-making',
    table: 'journal_entries',
    engine: 'analyst'
  },
  // ... all 17 modules defined
]

// ============================================================
// ENGINES ARRAY — All 13 engines
// ============================================================
export const ENGINES = [
  { code: 'A', name: 'Mindooo Clarity Engine', description: 'Vague → Clear Thought' },
  { code: 'B', name: 'Mindooo Goal Builder', description: 'Rough Idea → Specific Goal' },
  { code: 'C', name: 'Mindooo Problem Solver', description: 'Diagnose → Find Path' },
  { code: 'D', name: 'Mindooo Project Launcher', description: 'Full Logical Plan' },
  { code: 'E', name: 'Mindooo Task Executor', description: 'Perfect AI Prompt' },
  { code: 'F', name: 'Mindooo Skill Builder', description: 'Personal Learning Path' },
  { code: 'G', name: 'Mindooo Self-Discovery Engine', description: 'Map personality, values' },
  { code: 'H', name: 'Mindooo Blocker Elimination Engine', description: 'Identify → Remove all' },
  { code: 'I', name: 'Mindooo Financial Freedom Engine', description: 'Clarity → Strategy' },
  { code: 'J', name: 'Mindooo Purpose & Ikigai Engine', description: 'Discover → Align' },
  { code: 'K', name: 'Mindooo Energy & Time Engine', description: 'Optimize rhythms' },
  { code: 'L', name: 'Mindooo Relationship & Support Engine', description: 'Map → Optimize' },
  { code: 'M', name: 'Mindooo Cognitive Performance Engine', description: 'Train → Enhance' }
]

// ============================================================
// SYSTEM PROMPT BUILDER
// ============================================================
export function buildSystemPrompt(context, engine = 'coach') {
  // Builds complete personalized system prompt
  // Combines: base identity + user context + engine instructions
}

// ============================================================
// ROUTE MAP
// ============================================================
export const ROUTES = MODULES.reduce((acc, module) => {
  acc[module.route] = module.id
  return acc
}, {})

// ============================================================
// SIDEBAR NAVIGATION (active modules only)
// ============================================================
export const SIDEBAR_MODULES = MODULES.filter(m => m.status === 'active')

// ============================================================
// MODULE BY ID
// ============================================================
export function getModuleById(id) {
  return MODULES.find(m => m.id === id)
}

export function getModuleByRoute(route) {
  return MODULES.find(m => m.route === route)
}
```

---

## VIII. THE COMPONENT LAYER — UI BUILDING BLOCKS

### Component Philosophy
- **Reusable**: Used by multiple sections
- **Stateless**: Props in, UI out (where possible)
- **Pure**: Same props = same output
- **Accessible**: ARIA labels, keyboard nav, screen reader
- **Branded**: "Mindooo" correct, colors from config

### Component Registry

| Component | Purpose | Used By | Props |
|-----------|---------|---------|-------|
| **ErrorBoundary** | Crash protection | Dashboard.jsx (wraps sections) | children, fallback |
| **Icons** | SVG icon library | All sections | name, size, color |
| **Sidebar** | Navigation | Dashboard.jsx | activeModule, onNavigate |
| **Topbar** | Context bar | Dashboard.jsx | user, notifications |
| **MindoooSkeleton** | Loading UI | Suspense fallback | variant |
| **MindoooFeedback** | 👍 / 👎 buttons | ChatPanel.jsx | conversationId, messageIndex |
| **MindoooMarkdown** | AI response formatter | ChatPanel.jsx | content |
| **MindoooButton** | Branded button | All sections | variant, size, onClick |
| **MindoooCard** | Branded card | All sections | title, children, color |
| **MindoooProgress** | Progress indicator | All sections | value, max, color |
| **MindoooToast** | Notification | Dashboard.jsx | message, type, duration |

---

## IX. THE PAGES LAYER — ROUTE ENTRY POINTS

### Page Philosophy
- **Thin**: Delegate to sections for features
- **Routing**: URL → component mapping only
- **Auth**: Guard protected routes
- **Standalone**: SignIn, SignUp work without Dashboard shell

### Page Registry

| Page | Route | Purpose | Auth Required |
|------|-------|---------|---------------|
| **SignIn** | /signin | Authentication | No |
| **SignUp** | /signup | Registration | No |
| **ForgotPassword** | /forgot-password | Reset request | No |
| **ResetPassword** | /reset-password | Reset form | No |
| **Terms** | /terms | Legal | No |
| **Privacy** | /privacy | Legal | No |
| **Dashboard** | /dashboard | Main app shell | Yes |

---

## X. THE SECTIONS LAYER — FEATURE MODULES

### Section Philosophy
- **Sovereign**: Owns its files, data, state
- **Lazy-loaded**: Loaded on demand via React.lazy()
- **Error-contained**: Errors don't crash other sections
- **Service-mediated**: All I/O through services/db.js and services/ai.js

### Section Loading Architecture

```javascript
// Dashboard.jsx — The Sacred Shell

import { lazy, Suspense } from 'react'
import { MODULES } from '../config/modules'
import { MindoooSkeleton } from '../components/MindoooSkeleton'
import { ErrorBoundary } from '../components/ErrorBoundary'

// Lazy load ALL sections
const sectionComponents = {
  'home': lazy(() => import('./sections/Home')),
  'brain-dump': lazy(() => import('./sections/BrainDump')),
  'chat': lazy(() => import('./sections/ChatPanel')),
  'focus': lazy(() => import('./sections/FocusSection')),
  'settings': lazy(() => import('./sections/Settings')),
  // Phase 2+ sections...
  'journal': lazy(() => import('./sections/JournalSection')),
  'emotions': lazy(() => import('./sections/EmotionSection')),
  // ... etc
}

function Dashboard() {
  const [activeSection, setActiveSection] = useState('home')
  const ActiveComponent = sectionComponents[activeSection]

  return (
    <div className="mindooo-shell">
      <Sidebar onNavigate={setActiveSection} activeModule={activeSection} />
      <main className="mindooo-main">
        <Topbar />
        <ErrorBoundary>
          <Suspense fallback={<MindoooSkeleton />}>
            <ActiveComponent />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  )
}
```

---

## XI. THE HOOKS LAYER — REUSABLE LOGIC

### Hook Philosophy
- **Single responsibility**: One hook, one purpose
- **Composable**: Hooks can use other hooks
- **Testable**: Pure logic, no side effects in render
- **Documented**: JSDoc comments with return shapes

### Hook Registry

| Hook | Purpose | Returns | Used By |
|------|---------|---------|---------|
| **useAuth** | Authentication state | { user, firstName, loading, logout } | Dashboard.jsx |
| **useData** | Dashboard statistics | { stats, loading, error, refresh } | Home.jsx |
| **useFocus** | Focus session logic | { timer, start, stop, pause, mode } | FocusSection.jsx |
| **useRAG** | RAG search | { results, search, loading } | ChatPanel.jsx |
| **useBrainGym** | Brain gym state | { exercises, complete, streak } | CognitionSection.jsx |
| **useEmotions** | Emotion tracking | { log, history, patterns } | EmotionSection.jsx |
| **useHabits** | Habit tracking | { habits, log, streaks } | HabitSection.jsx |
| **useInsights** | AI insights | { insights, dismiss, read } | Home.jsx, Dashboard.jsx |

---

## XII. THE DATA FLOW ARCHITECTURE

### The Unidirectional Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    MINDOOO DATA FLOW                            │
│                                                                 │
│   USER ACTION                                                   │
│        │                                                        │
│        ▼                                                        │
│   ┌─────────────┐                                               │
│   │  SECTION    │  BrainDump.jsx, ChatPanel.jsx, etc.           │
│   │  (UI Layer) │  Handles: user input, display, state        │
│   └──────┬──────┘                                               │
│          │                                                      │
│          ▼                                                      │
│   ┌─────────────┐                                               │
│   │   HOOKS     │  useAuth, useData, useFocus, etc.            │
│   │  (Logic)    │  Handles: state management, side effects    │
│   └──────┬──────┘                                               │
│          │                                                      │
│          ▼                                                      │
│   ┌─────────────┐                                               │
│   │  SERVICES   │  db.js, ai.js, embeddings.js, rag.js         │
│   │  (Gateway)  │  Handles: ALL external communication        │
│   └──────┬──────┘                                               │
│          │                                                      │
│          ▼                                                      │
│   ┌─────────────┐     ┌─────────────┐                         │
│   │  SUPABASE   │     │  AI PROVIDER│                         │
│   │  (Database) │     │  (Groq etc) │                         │
│   └─────────────┘     └─────────────┘                         │
│                                                                 │
│   FORBIDDEN PATHS (will crash or corrupt):                      │
│   ❌ Section → Supabase                                         │
│   ❌ Section → AI API                                           │
│   ❌ Component → Supabase                                       │
│   ❌ Hook → AI API                                              │
│   ❌ Section → Section                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## XIII. THE ERROR & CRASH PROTECTION SYSTEM

### The Three Layers of Protection

| Layer | Component | Purpose |
|-------|-----------|---------|
| **1. ErrorBoundary** | React error boundary | Catches React render errors |
| **2. Service Try/Catch** | services/db.js, services/ai.js | Catches API failures |
| **3. Fallback UI** | MindoooSkeleton, error messages | Shows something when all else fails |

### ErrorBoundary Implementation

```javascript
// components/ErrorBoundary.jsx

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Mindooo ErrorBoundary caught:', error, errorInfo)
    // Optional: Send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mindooo-error-fallback">
          <h2>Mindooo encountered a moment of chaos</h2>
          <p>Even systems need clarity sometimes. Your data is completely safe.</p>
          <button onClick={() => window.location.reload()}>
            Restore Clarity
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

---

## XIV. THE SACRED FILES — NEVER TOUCH

### Files That Must Never Be Modified Without Reading First

| File | Why | Size | Status |
|------|-----|------|--------|
| `src/pages/sections/BrainDump.jsx` | Complete feature set, 946 lines | 946 lines | ✅ Active |
| `src/services/db.js` | All database functions | ~200 lines | ✅ Active |
| `src/services/ai.js` | All AI functions | ~150 lines | ⚠️ Partial |
| `src/components/ErrorBoundary.jsx` | Crash protection | ~50 lines | ✅ Active |
| `src/App.jsx` | Routing | ~80 lines | ✅ Active |

### Files That Must Never Be Deleted

| File | Purpose | Backup Of |
|------|---------|-----------|
| `src/pages/Dashboard.backup.jsx` | Emergency restore point | Dashboard.jsx |
| `src/supabase.js` | Database connection | N/A — singleton |
| `src/hooks/useAuth.js` | Authentication | N/A — critical |

---

## XV. THE BUILD CHECKLIST — ADDING A NEW MODULE

### Pre-Build Verification

- [ ] Module name uses "Mindooo" (3 o's) correctly
- [ ] Module ID is kebab-case (e.g., `brain-dump`)
- [ ] Route is unique and follows pattern `/{kebab-id}`
- [ ] Icon exists in `components/Icons.jsx`
- [ ] Color is from Mindooo palette or new approved color

### Build Steps

- [ ] **Step 1**: Create `src/pages/sections/[ModuleName].jsx`
  - [ ] Imports only from services, hooks, components, config
  - [ ] No cross-section imports
  - [ ] No direct Supabase/AI imports
  - [ ] "Mindooo" (3 o's) in all strings
  - [ ] Error handling for all async operations
  - [ ] Loading states for all data fetching

- [ ] **Step 2**: Add database functions to `src/services/db.js`
  - [ ] Functions added at bottom (never modify existing)
  - [ ] JSDoc comments with params and returns
  - [ ] Error handling with graceful fallback
  - [ ] RLS-compliant (user_id filtering)

- [ ] **Step 3**: Add AI functions to `src/services/ai.js` (if needed)
  - [ ] Functions added at bottom (never modify existing)
  - [ ] Failover chain implemented
  - [ ] Prompts versioned and documented

- [ ] **Step 4**: Register in `src/config/modules.js`
  - [ ] Added to MODULES array
  - [ ] All fields populated (id, name, route, icon, color, phase, status)
  - [ ] Name uses "Mindooo" (3 o's)
  - [ ] Route is unique

- [ ] **Step 5**: Test
  - [ ] Module loads without errors
  - [ ] Sidebar shows correct name
  - [ ] Route works correctly
  - [ ] Existing modules still work
  - [ ] No console errors
  - [ ] Brand name correct everywhere

### Post-Build Verification

- [ ] Run `grep -r "Mindoo[^o]" src/` — must return zero results
- [ ] Run `npm run build` — must compile without errors
- [ ] Test on mobile viewport — must be responsive
- [ ] Test keyboard navigation — must work without mouse
- [ ] Verify RLS policies for new tables (if any)

---

## XVI. THE NON-NEGOTIABLES

1. **"Mindooo" (three o's) appears correctly in every file name, every comment, every string** — P0 bug if violated
2. **Components NEVER call Supabase directly** — Always through services/db.js
3. **Components NEVER call AI APIs directly** — Always through services/ai.js
4. **Sections NEVER import from other sections** — Each is sovereign
5. **New modules = new files only** — Never modify existing section files
6. **services/db.js and services/ai.js are the ONLY files that talk to outside world**
7. **Every new module follows the 5-step addition process** — No shortcuts
8. **Every database function has JSDoc and error handling** — No exceptions
9. **Every AI function implements failover chain** — Never crash on AI failure
10. **ErrorBoundary wraps every section** — Never crash the app
11. **Lazy loading for all sections** — Dashboard performance depends on it
12. **Config/modules.js is the single source of truth** — Never hardcode elsewhere
13. **Supabase.js imported by db.js ONLY** — Never in components
14. **Git pre-commit hook blocks "Mindoo" (two o's)** — Zero tolerance
15. **Dashboard.jsx is a thin coordinator ONLY** — Never add features to the shell

---

## XVII. CLOSING STATEMENT

This file structure is not just organisation. It is **the physical enforcement of Mindooo's architecture**.

Every rule exists to protect:
- **Mo's data** — Service gatekeepers prevent leaks
- **Mo's experience** — Error boundaries prevent crashes
- **Mo's future** — Modularity enables infinite growth
- **Mo's trust** — Brand enforcement maintains integrity

The structure is designed so that Mo — with zero coding skills, dyslexia, and ADHD — can build a complete Life Operating System without ever breaking what already works.

**Add without breaking. Remove without crashing. Build without fear.**

From chaos to clarity. From planned to built. From stuck to free.
Now do more.

---

*This document is the definitive file structure specification of Mindooo. It is the single source of truth for all development organisation. It evolves with every session, but its core — the golden rules, the service boundaries, the module sovereignty — never changes without documentation.*

**Version**: 4.0 — The Architected File System  
**Synthesized**: May 23, 2026  
**Next Review**: Next session  
**Status**: Active — Foundation for All Builds  
**Brand**: Mindooo (three o's) — zero tolerance for "Mindoo"  
**GitHub**: https://github.com/Mohamed-Elgendi/Mindooo
