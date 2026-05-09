# 07 — FILE STRUCTURE
## Every File, What It Does, What It Must Never Do
**Last Updated**: April 5, 2026
**Status**: Current as of commit ed2b9a

---

## The Golden Rules

1. Components NEVER call Supabase directly — always through services/db.js
2. Components NEVER call AI APIs directly — always through services/ai.js
3. Sections NEVER import from other sections
4. New modules = new files only — never modify existing section files
5. services/db.js and services/ai.js are the ONLY files that talk to outside world

---

## Full File Map

```
~/axis-app/
├── .env.local                          🔐 API keys — never commit to GitHub
│   VITE_SUPABASE_URL
│   VITE_SUPABASE_ANON_KEY
│   VITE_ANTHROPIC_API_KEY
│   VITE_GROQ_API_KEY
│
├── src/
│   ├── main.jsx                        Entry point — renders App into DOM
│   │                                   Must never be modified
│   │
│   ├── App.jsx                         Router — defines all URL routes
│   │                                   Only file that imports pages
│   │                                   Current routes:
│   │                                   / → /signin
│   │                                   /signin, /signup
│   │                                   /dashboard (main app)
│   │                                   /forgot-password, /reset-password
│   │                                   /terms, /privacy
│   │
│   ├── index.css                       Global design system
│   │                                   All CSS variables and classes
│   │                                   Never add inline styles to components
│   │                                   if a class exists here
│   │
│   ├── supabase.js                     Supabase client singleton
│   │                                   One import, used by services/db.js only
│   │                                   Never import in components
│   │
│   ├── components/
│   │   ├── ErrorBoundary.jsx           Catches crashes, shows fallback UI
│   │   │                               Wraps every section in Dashboard
│   │   │                               Never modify — critical for stability
│   │   │
│   │   ├── Icons.jsx                   All SVG icons as React components
│   │   │                               Add new icons here, never inline SVG
│   │   │
│   │   ├── Sidebar.jsx                 Left navigation sidebar
│   │   │                               Reads MODULES from config/modules.js
│   │   │                               Never hardcode navigation here
│   │   │
│   │   └── Topbar.jsx                  Top bar with clock and user info
│   │
│   ├── config/
│   │   └── modules.js                  Central config for all modules/engines
│   │                                   MODULES array — sidebar navigation
│   │                                   ENGINES array — chat engine pills
│   │                                   buildSystemPrompt() — AI prompt builder
│   │                                   Add new modules here ONLY
│   │                                   Never hardcode module data elsewhere
│   │
│   ├── hooks/
│   │   ├── useAuth.js                  Authentication hook
│   │   │                               Returns: user, firstName, loading, logout
│   │   │                               Used by Dashboard.jsx only
│   │   │
│   │   └── useData.js                  Dashboard data hook
│   │                                   Returns: stats, loading, error, refresh
│   │                                   Calls loadDashboardStats from services/db
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx               MAIN SHELL — thin coordinator only
│   │   │                               Handles: auth, section switching, clock
│   │   │                               Never contains UI features
│   │   │                               Never calls database directly
│   │   │
│   │   ├── Dashboard.backup.jsx        📦 Backup — DO NOT TOUCH OR DELETE
│   │   │
│   │   ├── SignIn.jsx                  Sign in page (standalone, no Dashboard)
│   │   ├── SignUp.jsx                  Sign up page (standalone)
│   │   ├── ForgotPassword.jsx          Password reset request
│   │   ├── ResetPassword.jsx           Password reset form
│   │   ├── Terms.jsx                   Terms of service
│   │   └── Privacy.jsx                 Privacy policy
│   │
│   ├── pages/sections/                 ALL FEATURES LIVE HERE
│   │   │                               Each file = one module
│   │   │                               Never import across sections
│   │   │
│   │   ├── BrainDump.jsx              ✅ 946 lines — DO NOT OVERWRITE
│   │   │                               The complete Brain Dump Sanctuary
│   │   │                               Imports from: services/db, services/ai
│   │   │                               Never modify without reading fully first
│   │   │
│   │   ├── ChatPanel.jsx              ⚠️ Needs Groq implementation
│   │   │                               AI chat interface
│   │   │                               Currently: broken (Anthropic CORS)
│   │   │                               Fix: switch to Groq API
│   │   │
│   │   ├── FocusSection.jsx           ✅ Basic focus timer
│   │   │                               Needs expansion in Phase 6
│   │   │
│   │   ├── Home.jsx                   ✅ Dashboard overview
│   │   │                               Real KPI data via useData hook
│   │   │                               Self-Model percentages hardcoded
│   │   │
│   │   ├── ModulePage.jsx             ✅ Coming Soon placeholder
│   │   │                               Shown for unbuilt modules
│   │   │
│   │   └── Settings.jsx               ✅ User settings
│   │
│   └── services/                      THE ONLY FILES THAT TALK TO OUTSIDE WORLD
│       │
│       ├── db.js                      ✅ ALL Supabase calls live here
│       │                               Functions:
│       │                               saveChronicle()
│       │                               saveVoiceChronicle()
│       │                               saveSessionChronicle()
│       │                               uploadVoiceBlob()
│       │                               loadChronicles()
│       │                               updateChronicle()
│       │                               deleteChronicle()
│       │                               saveFocusSession()
│       │                               loadFocusSessions()
│       │                               getWeeklyFocusStats()
│       │                               getOrCreateProfile()
│       │                               loadDashboardStats()
│       │
│       └── ai.js                      ✅ ALL AI calls live here
│                                       Functions:
│                                       analyzeChronicle() — silent analysis
│                                       formatDuration() — utility
│                                       (Groq chat to be added here)
```

---

## Files That Must Never Be Modified Without Reading First

1. `src/pages/sections/BrainDump.jsx` — 946 lines, all features
2. `src/services/db.js` — all database functions
3. `src/services/ai.js` — all AI functions
4. `src/components/ErrorBoundary.jsx` — crash protection
5. `src/App.jsx` — routing

---

## Files That Must Never Be Deleted

1. `src/pages/Dashboard.backup.jsx` — emergency restore point
2. `src/supabase.js` — database connection
3. `src/hooks/useAuth.js` — authentication

---

## How to Add a New Module (The Safe Way)

1. Create new file: `src/pages/sections/NewModule.jsx`
2. Add database functions to `src/services/db.js`
3. Add AI prompts to `src/services/ai.js`
4. Add module config to `src/config/modules.js`
5. Import and render in `src/pages/Dashboard.jsx`
6. Never modify any existing section file

---

## Import Rules

```javascript
// ✅ Correct imports in a section file
import { supabase } from '../supabase'           // WRONG — use services
import { saveChronicle } from '../../services/db' // CORRECT
import { analyzeChronicle } from '../../services/ai' // CORRECT

// ✅ Correct imports in services/db.js
import { supabase } from '../supabase' // CORRECT — only db.js imports supabase

// ❌ Never do this
import { BrainDump } from './BrainDump' // sections never import sections
import supabase from '../supabase'       // components never import supabase
```
