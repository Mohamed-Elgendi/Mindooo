# MINDOOO — CURRENT BUILD STATE
## The Living Technical Snapshot: What Exists, What Works, What Breaks, What's Next
### From Chaos to Clarity. Now Do More.

**Version**: 2.0 — The Architected Build State  
**Last Updated**: May 23, 2026  
**Current Commit**: `ed2b9a` (BACKUP stable reference point)  
**Branch**: `main`  
**Live URL**: https://axis-app-kappa.vercel.app  
**GitHub**: https://github.com/Mohamed-Elgendi/Mindooo  
**Primary User**: Mohamed (Mo) — Founder, First User, Living Blueprint  
**Brand**: Mindooo (three o's) — zero tolerance for "Mindoo"  
**Status**: Phase 1 Foundation Complete → Phase 2 AI Integration Critical Path

---

## DOCUMENT PURPOSE

This is the **living technical snapshot** of Mindooo. It is not a vision document. It is not a specification. It is the **ground truth** of what is deployed, what is broken, and what must be built next.

**Use this document to:**
- Know exactly what works before touching any code
- Understand the critical path — what blocks everything else
- Make build decisions without guessing
- Onboard Claude (or any AI coder) with zero ambiguity
- Track progress against a clear baseline

**Rule**: This document is updated after EVERY session. Never assume memory. Always reference this file first.

---

## I. THE BUILD PHILOSOPHY

### The Three States of Every Feature

| State | Icon | Meaning | Action |
|-------|------|---------|--------|
| **Working** | ✅ | Fully functional, tested, deployed | Protect. Do not break. |
| **Partial** | ⚠️ | Functional but incomplete or has known issues | Fix or complete. Document issue. |
| **Broken** | ❌ | Not functional, blocking, or critically flawed | Fix immediately. This is the critical path. |
| **Not Built** | 🔄 | Planned but not yet implemented | Do not touch until critical path is clear. |

### The Critical Path Rule
> **Only fix broken things and complete partial things. Never start new features while the critical path is blocked.**

**Current Critical Path**:
1. ❌ Chat AI not working (returns fallback) → Blocks all AI personalization
2. ⚠️ Brain Dump loads slowly (5-10s) → Blocks user experience
3. ⚠️ Self-Model hardcoded → Blocks profile-based AI context

---

## II. WHAT IS WORKING RIGHT NOW

### 2.1 — Authentication System
**Status**: ✅ COMPLETE — Fully Functional

| Feature | Status | Implementation | Notes |
|---------|--------|----------------|-------|
| Email + password sign in | ✅ | Supabase Auth | Working, RLS enforced |
| Email + password sign up | ✅ | Supabase Auth | Working, email confirmation |
| Google OAuth | ✅ | Supabase Auth | Working, redirects correct |
| Forgot password | ✅ | Supabase Auth | Email sent, reset flow works |
| Reset password | ✅ | Supabase Auth | Token validation, password update |
| Session persistence | ✅ | Supabase Auth | JWT stored, auto-refresh |
| First name in metadata | ✅ | Supabase Auth | Stored in `auth.users.raw_user_meta_data` |
| Logout | ✅ | Supabase Auth | Clears session, redirects to /signin |

**Files**:
- `src/pages/SignIn.jsx` — Sign in UI
- `src/pages/SignUp.jsx` — Sign up UI
- `src/pages/ForgotPassword.jsx` — Reset request UI
- `src/pages/ResetPassword.jsx` — Reset form UI
- `src/hooks/useAuth.js` — Auth state management
- `src/supabase.js` — Supabase client singleton

**Database**:
- `auth.users` — Supabase managed, RLS automatic

---

### 2.2 — Dashboard / Home (MODULE-04)
**Status**: ✅ ACTIVE — Real Data, Working

| Feature | Status | Data Source | Notes |
|---------|--------|-------------|-------|
| Personalised greeting | ✅ | `useAuth` hook — `firstName` | "Good morning, Mo" |
| KPI card: Focus Hours (Week) | ✅ | `focus_sessions.actual_secs` | SUM/60 WHERE created_at > now()-7days |
| KPI card: Brain Dumps (Week) | ✅ | `chronicles` | COUNT WHERE created_at > now()-7days |
| KPI card: Current Streak | ✅ | Calculated from chronicles + focus_sessions | Consecutive days with ≥1 activity |
| KPI card: Clarity Score | ✅ | `chronicles.chaos_score` | `100 - ROUND(AVG(chaos_score))` |
| All Modules grid | ✅ | `config/modules.js` — `MODULES` array | Dynamic rendering, routes to sections |
| Today's Insights | ✅ | Dynamic generation from real data | Pattern-based, not hardcoded |
| Quick Actions | ✅ | Static links to common actions | Brain dump, Focus session, Chat |
| Self-Model preview | ⚠️ | **Hardcoded percentages** | See Issue #1 below |

**Files**:
- `src/pages/sections/Home.jsx` — Dashboard UI
- `src/hooks/useData.js` — Dashboard data fetching
- `src/config/modules.js` — Module registry

**Performance**:
- Current: Sequential Supabase calls → 5-10 second load
- Target: Parallel loading → <2 second load
- Fix: See Issue #2 below

---

### 2.3 — Brain Dump Sanctuary (MODULE-01)
**Status**: ✅ ACTIVE — Full Features, 946 Lines

| Feature | Status | Implementation | Notes |
|---------|--------|----------------|-------|
| Text dump input | ✅ | Controlled textarea | Font size control (14px-24px) |
| Font size adjuster (A-/A+) | ✅ | localStorage persistence | User preference saved |
| Voice note recording | ✅ | Web Audio API + MediaRecorder | Uploads to Supabase Storage |
| Brain Dump Session with timer | ✅ | Configurable duration | Session mode with countdown |
| AI silent analysis | ✅ | `services/ai.js` — `analyzeChronicle()` | chaos_score, emotional_tone, themes, ai_summary |
| Editable titles | ✅ | Inline editing | Click to edit, blur to save |
| Delete with confirmation | ✅ | 2-click confirmation | First click "Delete", second click confirms |
| Copy button | ✅ | Clipboard API | Copies text to clipboard |
| Speech-to-text in textarea | ✅ | Web Speech API | Browser-native, mic permission |
| Clickable links in text | ✅ | URL regex detection | Auto-linkifies URLs |
| Sharing system | ✅ | Multiple platforms | WhatsApp, Facebook, X, Email, Telegram, Reddit, Obsidian, Notion, Google Drive, Native share, Copy Markdown |
| Chronicles list | ✅ | All metadata visible | Title, date, chaos score, tone, themes, summary |
| Folders (UI) | ⚠️ | UI built, backend partial | Can create folders, not fully wired |
| Tags (UI) | ⚠️ | UI exists, not wired | Tag input visible, not saved |
| Search (text) | ⚠️ | Basic text search works | Semantic search pending |
| Sort & filter | ⚠️ | Basic sort | Advanced filter pending |

**Files**:
- `src/pages/sections/BrainDump.jsx` — **SACRED FILE — 946 lines, DO NOT OVERWRITE**
- `src/services/ai.js` — `analyzeChronicle()` function
- `src/services/db.js` — Chronicle CRUD functions

**Database**:
- `chronicles` — Core table, RLS enabled
- `chronicle_folders` — Organization table, RLS enabled

**Performance Issue**:
- Current: Sequential Supabase calls → 5-10 second load
- Root cause: Multiple `await` calls in series
- Fix: Parallel loading with `Promise.all()` + skeleton screens
- Priority: P1 — See Issue #2

---

### 2.4 — Mindooo Chat (MODULE-02)
**Status**: ❌ BROKEN — AI Returns Fallback Message

| Feature | Status | Implementation | Notes |
|---------|--------|----------------|-------|
| Message history UI | ✅ | Scrollable list | Virtualized for performance |
| 6 engine selectors (A-F) | ✅ | Dropdown with descriptions | Clarity, Goal Builder, Problem Solver, Project Launcher, Task Executor, Skill Builder |
| Uncontrolled textarea | ✅ | Fixed from v1.0 crash | No crash on keystroke |
| AI response display | ❌ | **Returns fallback only** | "I'm here. Keep going." or generic message |
| Groq API key | ✅ | Added to `.env.local` | `VITE_GROQ_API_KEY=gsk_...` |
| Model configuration | ⚠️ | Currently set to `claude-sonnet-4-5` | **WRONG** — must be `llama-3.3-70b-versatile` |
| Anthropic integration | ❌ | **BLOCKED by CORS** | Direct browser calls to Claude API fail |
| Context engine | 🔄 | Not built | Required for personalization |
| System prompt builder | 🔄 | Not built | Required for personalized responses |
| RAG integration | 🔄 | Not built | Required for chronicle-based responses |
| Conversation persistence | 🔄 | Not built | `ai_conversations` table not created |
| Feedback buttons (👍/👎) | 🔄 | Not built | `ai_feedback` table not created |
| Voice input | 🔄 | Not built | Planned for v1.3 |
| Suggested prompts | 🔄 | Not built | Planned for v1.3 |

**Files**:
- `src/pages/sections/ChatPanel.jsx` — **NEEDS GROQ SWITCH**
- `src/services/ai.js` — Has `analyzeChronicle()`, needs `callMindoooAI()`
- `src/config/modules.js` — Has engine definitions

**Root Cause of Failure**:
1. ChatPanel.jsx is still configured for Anthropic Claude API
2. Anthropic blocks direct browser API calls (CORS policy)
3. Groq API key is present but NOT used in ChatPanel.jsx
4. Model name is wrong (`claude-sonnet-4-5` instead of `llama-3.3-70b-versatile`)

**Fix Required**:
1. Switch ChatPanel.jsx to use `services/ai.js` — `callMindoooAI()`
2. Update model to `llama-3.3-70b-versatile`
3. Implement proper message formatting for Groq API
4. Add conversation history management

**Priority**: **P0 — BLOCKS ALL AI WORK**

---

### 2.5 — Focus Sanctuary (MODULE-03)
**Status**: ✅ BASIC — Functional, Needs Expansion

| Feature | Status | Implementation | Notes |
|---------|--------|----------------|-------|
| Focus timer (countdown) | ✅ | setInterval-based | Configurable duration |
| Session modes | ✅ | deep_work, shallow_work, recovery | User selects mode |
| Save to Supabase | ✅ | `focus_sessions` table | Stores duration, mode, completion |
| Session notes | ✅ | Post-session reflection | Text input after session |
| Interruption tracking | 🔄 | Not built | Planned for v1.2 |
| Energy rating (start/end) | 🔄 | Not built | Planned for v1.2 |
| Focus quality score | 🔄 | Not built | Planned for v1.2 |
| Session analytics | 🔄 | Not built | Planned for v1.2 |
| Distraction blocking | 🔄 | Not built | Planned for v1.3 (browser extension) |
| Ambient sound | 🔄 | Not built | Planned for v1.3 |

**Files**:
- `src/pages/sections/FocusSection.jsx` — Basic timer UI
- `src/services/db.js` — `saveFocusSession()` function

**Database**:
- `focus_sessions` — Core table, RLS enabled

---

### 2.6 — Settings (MODULE-05)
**Status**: ✅ ACTIVE — Basic Preferences

| Feature | Status | Implementation | Notes |
|---------|--------|----------------|-------|
| Theme toggle | ✅ | Light/Dark mode | Persisted in localStorage |
| Notification settings | ✅ | Enable/disable | Basic toggle |
| User preferences | ✅ | Various toggles | Account-related settings |

**Files**:
- `src/pages/sections/Settings.jsx`

---

### 2.7 — Module Page (MODULE-00)
**Status**: ✅ ACTIVE — Coming Soon Placeholder

| Feature | Status | Implementation | Notes |
|---------|--------|----------------|-------|
| Placeholder for unbuilt modules | ✅ | Dynamic rendering | Shows module name, description, phase, ETA |
| Phase indicator | ✅ | Phase 1/2/3 badge | Visual phase indicator |

**Files**:
- `src/pages/sections/ModulePage.jsx`

---

## III. WHAT IS BROKEN / INCOMPLETE

### Issue #1 — CRITICAL: Chat AI Not Working
**Status**: ❌ BROKEN  
**Priority**: P0 — Blocks all AI personalization  
**Impact**: HIGH — Core feature of Mindooo is non-functional

#### Symptoms
- Chat returns generic fallback message: "I'm here. Keep going."
- No personalization — does not reference user's chronicles or profile
- No context — does not remember previous messages
- No RAG — does not search chronicles for relevant context

#### Root Cause Analysis
```
ChatPanel.jsx
    │
    ├── Currently calls: Anthropic Claude API directly
    │   └── URL: https://api.anthropic.com/v1/messages
    │   └── Problem: CORS blocked in browser
    │   └── Result: Request fails, fallback shown
    │
    ├── Should call: services/ai.js → callMindoooAI()
    │   └── Primary: Groq API (browser-safe)
    │   └── Fallback 1: OpenRouter
    │   └── Fallback 2: Cached message
    │   └── Result: Always returns something useful
    │
    └── Model mismatch:
        ├── Current: claude-sonnet-4-5 (Anthropic model name)
        ├── Should be: llama-3.3-70b-versatile (Groq model name)
        └── Fix: Update model constant in ChatPanel.jsx
```

#### Required Fix
1. **Update ChatPanel.jsx** to import and use `callMindoooAI()` from `services/ai.js`
2. **Update model name** to `llama-3.3-70b-versatile`
3. **Implement conversation history** — store messages in state, pass to AI
4. **Add message formatting** — Groq expects OpenAI-compatible format
5. **Test failover** — Verify fallback chain works when Groq is down

#### Files to Modify
- `src/pages/sections/ChatPanel.jsx` — **PRIMARY FIX**
- `src/services/ai.js` — Verify `callMindoooAI()` is complete
- `src/services/db.js` — Add `saveAIConversation()` for persistence

#### Verification Steps
- [ ] Chat returns meaningful response (not fallback)
- [ ] Chat references user's chronicles (after RAG is built)
- [ ] Chat remembers conversation context
- [ ] Chat works when Groq is down (fallback to OpenRouter)
- [ ] Chat handles errors gracefully (never crashes)

---

### Issue #2 — IMPORTANT: Brain Dump Page Loads Slowly
**Status**: ⚠️ PARTIAL — Functional but slow  
**Priority**: P1 — Degrades user experience  
**Impact**: MEDIUM — Frustrating but not blocking

#### Symptoms
- Brain Dump page takes 5-10 seconds to load
- User sees blank screen during load
- No loading indicator or skeleton

#### Root Cause Analysis
```javascript
// ❌ CURRENT (Sequential — 5-10 seconds)
const chronicles = await loadChronicles(userId)
const folders = await loadFolders(userId)
const stats = await loadDashboardStats(userId)
const profile = await loadUserProfile(userId)
// Total time = sum of all individual call times
```

#### Required Fix
```javascript
// ✅ TARGET (Parallel — <2 seconds)
const [chronicles, folders, stats, profile] = await Promise.all([
  loadChronicles(userId),
  loadFolders(userId),
  loadDashboardStats(userId),
  loadUserProfile(userId)
])
// Total time = max of all individual call times
```

#### Additional Fixes
1. **Add skeleton loading screen** — `MindoooSkeleton.jsx` component
2. **Add loading states** — Show progress during data fetch
3. **Implement caching** — `services/cache.js` for frequently accessed data
4. **Optimize Supabase queries** — Add indexes, limit initial load

#### Files to Modify
- `src/pages/sections/BrainDump.jsx` — Add `Promise.all()`
- `src/hooks/useData.js` — Implement parallel loading
- `src/components/MindoooSkeleton.jsx` — Create skeleton component
- `src/services/cache.js` — Create caching layer

---

### Issue #3 — IMPORTANT: Self-Model Preview is Hardcoded
**Status**: ⚠️ PARTIAL — Visual only, no real data  
**Priority**: P1 — Blocks profile-based AI context  
**Impact**: MEDIUM — AI cannot personalize without real profile data

#### Symptoms
- Dashboard shows identity percentages (e.g., "Disciplined: 73%")
- These percentages are **hardcoded** in Home.jsx
- Not calculated from actual usage data
- Not connected to `user_profiles.identity_claims`

#### Root Cause Analysis
```javascript
// ❌ CURRENT (Hardcoded in Home.jsx)
const identityClaims = {
  disciplined: 73,
  focused: 65,
  creative: 82,
  resilient: 58
}
// These are STATIC values, not derived from data
```

#### Required Fix
```javascript
// ✅ TARGET (Calculated from real data)
const identityClaims = calculateIdentityClaims(userId)
// disciplined: based on focus session streak
// focused: based on average session duration
// creative: based on theme diversity in chronicles
// resilient: based on recovery from missed days
```

#### Files to Modify
- `src/pages/sections/Home.jsx` — Replace hardcoded values
- `src/services/db.js` — Add `calculateIdentityClaims()` function
- `src/hooks/useData.js` — Include identity claims in dashboard data

#### Identity Claim Calculation Logic
| Claim | Data Source | Calculation |
|-------|-------------|-------------|
| **Disciplined** | Focus sessions + chronicles | Streak consistency × completion rate |
| **Focused** | Focus sessions | Average session duration / target duration |
| **Creative** | Chronicles | Theme diversity index × unique concepts |
| **Resilient** | All activity | Recovery speed after missed days |
| **Clear** | Chronicles | Inverse of average chaos score |
| **Growing** | All modules | Week-over-week improvement rate |

---

### Issue #4 — STRUCTURAL: Missing Database Tables for Phase 2
**Status**: 🔄 NOT BUILT  
**Priority**: P1 — Required for Phase 2 modules  
**Impact**: MEDIUM — Blocks journaling, emotions, habits, etc.

#### Missing Tables
| Table | Purpose | Phase | Blocker For |
|-------|---------|-------|-------------|
| `ai_conversations` | Chat history | Phase 2 | Chat persistence, context |
| `ai_feedback` | Thumbs up/down | Phase 2 | Feedback loop, AI improvement |
| `insights` | AI-generated discoveries | Phase 2 | Dashboard insights, Guardian alerts |
| `user_about_me` | 14-section self-profile | Phase 3 | About Me module, AI personalization |
| `cognitive_profile` | Brain metrics | Phase 3 | Cognitive Performance module |
| `journal_entries` | Structured reflection | Phase 2 | Journaling Nexus module |
| `emotional_logs` | Emotion tracking | Phase 2 | Emotional Mastery module |
| `habits` | Habit definitions | Phase 2 | Habit Transformation module |

#### Required Action
1. Create tables in Supabase SQL Editor
2. Add RLS policies for each table
3. Add indexes for performance
4. Add functions to `services/db.js`

**Reference**: See `02_MINDOOO_DATABASE_SCHEMA.md` for complete SQL

---

### Issue #5 — STRUCTURAL: pgvector Not Enabled
**Status**: 🔄 NOT BUILT  
**Priority**: P1 — Required for RAG  
**Impact**: HIGH — Without this, AI cannot search chronicles

#### Required Action
```sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE chronicles
ADD COLUMN IF NOT EXISTS embedding vector(768);

CREATE INDEX idx_chronicles_embedding 
ON chronicles 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

---

### Issue #6 — STRUCTURAL: Nomic API Key Not Added
**Status**: 🔄 NOT BUILT  
**Priority**: P1 — Required for embeddings  
**Impact**: HIGH — Without this, RAG cannot work

#### Required Action
1. Sign up at https://nomic.ai
2. Get API key (free tier)
3. Add to `.env.local`:
```
VITE_NOMIC_API_KEY=nomic-...
```

---

## IV. FILE STRUCTURE — COMPLETE MAP

### The Sacred Files (Never Modify Without Reading)

| File | Lines | Status | Why Sacred |
|------|-------|--------|------------|
| `src/pages/sections/BrainDump.jsx` | 946 | ✅ Active | Complete feature set, complex logic |
| `src/services/db.js` | ~200 | ✅ Active | All database functions |
| `src/services/ai.js` | ~150 | ⚠️ Partial | AI functions, needs completion |
| `src/components/ErrorBoundary.jsx` | ~50 | ✅ Active | Crash protection |
| `src/App.jsx` | ~80 | ✅ Active | Routing |
| `src/pages/Dashboard.backup.jsx` | — | 📦 Backup | Emergency restore point |

### Complete Directory Tree

```
~/axis-app/
│
├── 🔐 .env.local                          API keys — NEVER commit
│   ├── VITE_SUPABASE_URL=https://socevlvjuwsybvshxthk.supabase.co
│   ├── VITE_SUPABASE_ANON_KEY=sb_publishable_...
│   ├── VITE_GROQ_API_KEY=gsk_...          ✅ Added, not used yet
│   ├── VITE_ANTHROPIC_API_KEY=sk-ant-...  ❌ Remove — CORS blocked
│   └── VITE_OPENROUTER_API_KEY=...        🔄 Add for fallback
│
├── 📁 public/
│   ├── favicon.ico
│   ├── manifest.json
│   └── assets/
│       ├── mindooo-logo.svg
│       └── mindooo-og-image.png
│
├── 📁 src/
│   │
│   ├── 🚀 main.jsx                          Entry point — NEVER MODIFY
│   │
│   ├── 🧭 App.jsx                           Router
│   │   ├── Routes: /signin, /signup, /dashboard, /forgot-password, /reset-password
│   │   └── Protected route wrapper for /dashboard
│   │
│   ├── 🎨 index.css                         Global design system
│   │   ├── CSS variables (Mindooo palette)
│   │   ├── Typography: Sora 800 + Inter 400/500
│   │   ├── Dyslexia-friendly font stack
│   │   └── Animation keyframes
│   │
│   ├── 🔌 supabase.js                       Supabase client singleton
│   │   ├── IMPORTED BY: services/db.js ONLY
│   │   └── NEVER IMPORT IN COMPONENTS
│   │
│   ├── 📁 components/                       UI BUILDING BLOCKS
│   │   ├── ErrorBoundary.jsx              ✅ Crash protection
│   │   ├── Icons.jsx                      ✅ SVG icon library
│   │   ├── Sidebar.jsx                    ✅ Dynamic navigation
│   │   ├── Topbar.jsx                     ✅ Context bar
│   │   ├── MindoooSkeleton.jsx            🔄 Create for loading states
│   │   ├── MindoooFeedback.jsx            🔄 Create for chat thumbs up/down
│   │   └── MindoooMarkdown.jsx            🔄 Create for AI response formatting
│   │
│   ├── 📁 config/                           CENTRAL AUTHORITY
│   │   └── modules.js                     ✅ Module + engine registry
│   │       ├── MODULES array (17 modules)
│   │       ├── ENGINES array (13 engines A-M)
│   │       └── System prompt builder
│   │
│   ├── 📁 hooks/                            REUSABLE LOGIC
│   │   ├── useAuth.js                     ✅ Auth state
│   │   ├── useData.js                     ✅ Dashboard data (needs parallel loading)
│   │   ├── useFocus.js                    🔄 Create for focus logic
│   │   └── useRAG.js                      🔄 Create for RAG search
│   │
│   ├── 📁 pages/                            ROUTE ENTRY POINTS
│   │   ├── Dashboard.jsx                  ✅ SACRED SHELL — thin coordinator
│   │   ├── Dashboard.backup.jsx           📦 EMERGENCY BACKUP — DO NOT DELETE
│   │   ├── SignIn.jsx                     ✅
│   │   ├── SignUp.jsx                     ✅
│   │   ├── ForgotPassword.jsx             ✅
│   │   ├── ResetPassword.jsx              ✅
│   │   ├── Terms.jsx                      ✅
│   │   └── Privacy.jsx                    ✅
│   │
│   ├── 📁 pages/sections/                   FEATURE MODULES
│   │   ├── BrainDump.jsx                  ✅ 946 lines — DO NOT OVERWRITE
│   │   ├── ChatPanel.jsx                  ❌ NEEDS GROQ SWITCH
│   │   ├── FocusSection.jsx               ✅ Basic version
│   │   ├── Home.jsx                       ✅ Real data (needs identity fix)
│   │   ├── ModulePage.jsx                 ✅ Coming soon placeholder
│   │   ├── Settings.jsx                   ✅ Basic preferences
│   │   ├── JournalSection.jsx             🔄 Phase 2
│   │   ├── EmotionSection.jsx             🔄 Phase 2
│   │   ├── HabitSection.jsx               🔄 Phase 2
│   │   ├── AffirmationSection.jsx         🔄 Phase 2
│   │   ├── SelfModelSection.jsx           🔄 Phase 2
│   │   ├── AboutMeSection.jsx             🔄 Phase 3
│   │   ├── CognitionSection.jsx           🔄 Phase 3
│   │   ├── ClaritySection.jsx             🔄 Phase 3
│   │   ├── BlockerSection.jsx             🔄 Phase 3
│   │   ├── FinanceSection.jsx             🔄 Phase 3
│   │   ├── PurposeSection.jsx             🔄 Phase 3
│   │   ├── EnergySection.jsx              🔄 Phase 3
│   │   └── RelationshipSection.jsx        🔄 Phase 3
│   │
│   └── 📁 services/                         EXTERNAL GATEWAYS
│       ├── db.js                          ✅ Database gateway
│       │   ├── Chronicle functions
│       │   ├── Focus session functions
│       │   ├── Profile functions
│       │   └── 🔄 NEEDS: AI conversation, feedback, brain gym, etc.
│       ├── ai.js                          ⚠️ AI gateway (incomplete)
│       │   ├── analyzeChronicle()         ✅ Working
│       │   ├── callMindoooAI()            🔄 NEEDS COMPLETION
│       │   ├── callGroq()                 🔄 NEEDS IMPLEMENTATION
│       │   ├── callOpenRouter()           🔄 NEEDS IMPLEMENTATION
│       │   ├── buildContext()             🔄 NEEDS IMPLEMENTATION
│       │   ├── buildSystemPrompt()        🔄 NEEDS IMPLEMENTATION
│       │   ├── embedDocument()            🔄 NEEDS IMPLEMENTATION
│       │   ├── embedQuery()               🔄 NEEDS IMPLEMENTATION
│       │   ├── ragSearch()                🔄 NEEDS IMPLEMENTATION
│       │   └── saveConversation()         🔄 NEEDS IMPLEMENTATION
│       ├── embeddings.js                  🔄 Create — Nomic integration
│       ├── context.js                     🔄 Create — Context engine
│       ├── prompts.js                     🔄 Create — Prompt builder
│       ├── rag.js                         🔄 Create — RAG engine
│       └── cache.js                       🔄 Create — Caching layer
│
├── 📄 index.html                          <title>Mindooo — [Page]</title>
├── 📄 package.json                        "name": "mindooo"
├── 📄 vite.config.js                      Vite configuration
├── 📄 tailwind.config.js                  Custom Mindooo palette
├── 📄 .eslintrc.cjs                       Linting rules
├── 📄 .gitignore                          node_modules, .env.local, dist
└── 📄 README.md                           # Mindooo — The Life Operating System
```

---

## V. DATABASE TABLES — CURRENT STATE

### Working Tables (Phase 1)

#### chronicles
```sql
CREATE TABLE chronicles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users NOT NULL,
  title           text DEFAULT '',
  text            text,
  word_count      integer GENERATED ALWAYS AS (COALESCE(array_length(regexp_split_to_array(text, '\s+'), 1), 0)) STORED,
  origin          text DEFAULT 'text',
  audio_url       text DEFAULT '',
  duration_secs   integer DEFAULT 0,
  chaos_score     integer DEFAULT 0,
  emotional_tone  text DEFAULT 'neutral',
  urgency_signals text[] DEFAULT '{}',
  themes          text[] DEFAULT '{}',
  ai_summary      text DEFAULT '',
  disposition     text DEFAULT 'archive',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
-- RLS: ENABLED ✅
-- Indexes: user_id, created_at ✅
-- embedding column: ❌ NOT ADDED (needs pgvector)
```

#### focus_sessions
```sql
CREATE TABLE focus_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users NOT NULL,
  mode            text DEFAULT 'deep_work',
  mode_name       text DEFAULT '',
  planned_mins    integer DEFAULT 25,
  actual_secs     integer DEFAULT 0,
  completed       boolean DEFAULT true,
  interrupted     boolean DEFAULT false,
  interruption_count integer DEFAULT 0,
  self_rating     integer DEFAULT 0,
  notes           text DEFAULT '',
  created_at      timestamptz DEFAULT now(),
  ended_at        timestamptz
);
-- RLS: ENABLED ✅
```

#### user_profiles
```sql
CREATE TABLE user_profiles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users UNIQUE NOT NULL,
  first_name      text DEFAULT '',
  created_at      timestamptz DEFAULT now()
);
-- RLS: ENABLED ✅
-- NOTE: Missing fields from schema v3.0 (clarity_score, streak, etc.)
```

#### chronicle_folders
```sql
CREATE TABLE chronicle_folders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users NOT NULL,
  name            text NOT NULL,
  color           text DEFAULT '#8b5cf6',
  created_at      timestamptz DEFAULT now()
);
-- RLS: ENABLED ✅
```

### Missing Tables (Phase 2-3)

| Table | Status | Priority | Unblocks |
|-------|--------|----------|----------|
| `ai_conversations` | ❌ Not created | P1 | Chat persistence |
| `ai_feedback` | ❌ Not created | P2 | Feedback loop |
| `insights` | ❌ Not created | P2 | Dashboard insights |
| `user_about_me` | ❌ Not created | P1 | About Me module |
| `cognitive_profile` | ❌ Not created | P1 | Cognitive Performance module |
| `journal_entries` | ❌ Not created | P2 | Journaling Nexus |
| `emotional_logs` | ❌ Not created | P2 | Emotional Mastery |
| `habits` | ❌ Not created | P2 | Habit Transformation |

---

## VI. ENVIRONMENT VARIABLES

### Current .env.local

```bash
# ✅ CONFIRMED WORKING
VITE_SUPABASE_URL=https://socevlvjuwsybvshxthk.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...

# ✅ ADDED BUT NOT USED
VITE_GROQ_API_KEY=gsk_...

# ❌ BROKEN — REMOVE OR COMMENT OUT
VITE_ANTHROPIC_API_KEY=sk-ant-...
# Reason: CORS blocked in browser. Server-side only.

# 🔄 NEEDS TO BE ADDED
VITE_OPENROUTER_API_KEY=...
# Reason: Fallback AI provider

VITE_NOMIC_API_KEY=...
# Reason: Embeddings for RAG
```

### Variable Status Matrix

| Variable | Status | Purpose | Cost | Action |
|----------|--------|---------|------|--------|
| `VITE_SUPABASE_URL` | ✅ Working | Database + Auth | Free tier | Keep |
| `VITE_SUPABASE_ANON_KEY` | ✅ Working | Database access | Free tier | Keep |
| `VITE_GROQ_API_KEY` | ✅ Added | Primary AI | Free tier | **Start using** |
| `VITE_ANTHROPIC_API_KEY` | ❌ Broken | Claude AI | Paid | **Remove** |
| `VITE_OPENROUTER_API_KEY` | 🔄 Missing | Fallback AI | Free tier | **Add** |
| `VITE_NOMIC_API_KEY` | 🔄 Missing | Embeddings | Free tier | **Add** |

---

## VII. TECH STACK — VERIFIED

| Layer | Technology | Version | Status | Notes |
|-------|-----------|---------|--------|-------|
| **Framework** | React | 18+ | ✅ | Component-based |
| **Build Tool** | Vite | Latest | ✅ | Fast HMR |
| **Styling** | Tailwind CSS | Latest | ✅ | Utility-first |
| **Fonts** | Sora + Inter | Google Fonts | ✅ | Sora 800 headings, Inter 400/500 body |
| **Icons** | Lucide React | Latest | ✅ | Comprehensive icon set |
| **Auth** | Supabase Auth | Latest | ✅ | JWT-based |
| **Database** | Supabase PostgreSQL | 15+ | ✅ | With RLS |
| **Storage** | Supabase Storage | Latest | ✅ | Voice notes |
| **Hosting** | Vercel | Latest | ✅ | Edge network |
| **AI Analysis** | Anthropic Claude | API | ⚠️ | **Switch to Groq** |
| **AI Chat** | Groq | llama-3.3-70b | 🔄 | **Needs implementation** |
| **AI Fallback** | OpenRouter | Universal | 🔄 | **Needs setup** |
| **Embeddings** | Nomic | nomic-embed-text-v1.5 | 🔄 | **Needs setup** |
| **Vector Search** | pgvector | Supabase ext | 🔄 | **Needs enable** |

---

## VIII. THE CRITICAL PATH — NEXT SESSION PRIORITY

### Session Goal: Fix Chat AI (P0)

**What must happen in the next coding session:**

```
┌─────────────────────────────────────────────────────────────────┐
│  SESSION OBJECTIVE: Make Mindooo Chat Work                      │
│                                                                 │
│  STEP 1: VERIFY GROQ API KEY                                    │
│  ├── Test key validity with curl or simple fetch               │
│  └── Confirm model availability: llama-3.3-70b-versatile       │
│                                                                 │
│  STEP 2: UPDATE services/ai.js                                  │
│  ├── Complete callMindoooAI() function                         │
│  ├── Implement callGroq() with correct headers                 │
│  ├── Implement callOpenRouter() as fallback                    │
│  └── Add proper error handling and logging                     │
│                                                                 │
│  STEP 3: UPDATE ChatPanel.jsx                                   │
│  ├── Replace Anthropic call with callMindoooAI()               │
│  ├── Update model name to llama-3.3-70b-versatile              │
│  ├── Implement conversation history state                      │
│  └── Add message formatting for Groq API                       │
│                                                                 │
│  STEP 4: TEST                                                   │
│  ├── Send test message → expect real response                  │
│  ├── Verify no fallback message                                │
│  ├── Test with Groq down (simulate) → expect fallback         │
│  └── Test error handling → expect graceful degradation        │
│                                                                 │
│  STEP 5: UPDATE THIS DOCUMENT                                   │
│  ├── Mark Chat AI as ✅ Working                                 │
│  ├── Update file structure if new files created                │
│  └── Document any new issues discovered                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### If Time Permits (P1)

| Task | Effort | Impact |
|------|--------|--------|
| Fix Brain Dump loading speed | 30 min | High UX improvement |
| Fix Self-Model hardcoded values | 45 min | Enables profile-based AI |
| Add MindoooSkeleton component | 20 min | Better loading UX |
| Create ai_conversations table | 15 min | Enables chat persistence |

---

## IX. DECISION LOG

| Date | Decision | Reason | Status |
|------|----------|--------|--------|
| 2026-04-05 | Switch AI from Anthropic to Groq | CORS blocked in browser | In progress |
| 2026-04-05 | Keep Anthropic for `analyzeChronicle()` | Server-side analysis still works | Active |
| 2026-04-05 | Add Groq API key to .env.local | Primary chat AI provider | Done |
| 2026-04-05 | Model: llama-3.3-70b-versatile | Fast, free, browser-safe | Pending switch |
| 2026-04-05 | Remove duplicate files (ai.js, db.js in pages/) | Clean file structure | Done |
| 2026-04-05 | Keep Dashboard.backup.jsx | Emergency restore point | Protected |
| 2026-05-23 | Document current state comprehensively | Eliminate ambiguity | Done |

---

## X. KNOWN RISKS & MITIGATIONS

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Groq API rate limits | Medium | Chat unavailable | Implement OpenRouter fallback |
| Supabase free tier limits | Medium | Database blocked | Monitor usage, upgrade if needed |
| Browser compatibility (Safari) | Medium | Voice recording fails | Test on Safari, add polyfills |
| Data loss during migration | Low | Critical | Backup before any schema change |
| CORS issues with new providers | Medium | AI fails | Test all providers in browser |
| Build size growing too large | Low | Slow deployment | Code splitting, lazy loading |

---

## XI. THE NON-NEGOTIABLES

1. **Never deploy without testing Chat AI first** — P0 feature must work
2. **Never modify BrainDump.jsx without reading all 946 lines first** — Sacred file
3. **Never commit .env.local** — API keys must stay private
4. **Never hardcode "Mindoo" (two o's)** — Brand integrity is P0
5. **Never skip updating this document after sessions** — This is the ground truth
6. **Never add a feature while critical path is blocked** — Fix broken first
7. **Never delete Dashboard.backup.jsx** — Emergency restore point
8. **Never import supabase in components** — Always through services/db.js
9. **Never call AI APIs directly from components** — Always through services/ai.js
10. **Never skip RLS on new tables** — Data isolation is absolute

---

## XII. CLOSING STATEMENT

This document is the **single source of truth** for Mindooo's current technical state. It is not aspirational. It is not a roadmap. It is the **ground truth** of what exists right now.

**What works**: Authentication, Dashboard, Brain Dump, Focus (basic), Settings  
**What is broken**: Chat AI (critical), Brain Dump speed, Self-Model data  
**What is missing**: Phase 2 tables, pgvector, embeddings, context engine  

**The next session has one goal**: Make the Chat AI work. Everything else waits.

**From chaos to clarity. From broken to working. Now do more.**

---

*This document is the definitive build state of Mindooo. It is updated after every session. It is the first file to read before writing any code. It is the last file to update before ending any session.*

**Version**: 2.0 — The Architected Build State  
**Synthesized**: May 23, 2026  
**Next Update**: After next coding session  
**Status**: Phase 1 Foundation Complete → Phase 2 AI Integration Critical Path  
**Brand**: Mindooo (three o's) — zero tolerance for "Mindoo"  
**GitHub**: https://github.com/Mohamed-Elgendi/Mindooo
