# 08 — CURRENT BUILD STATE
**Last Updated**: April 5, 2026
**Current Commit**: BACKUP stable reference point (ed2b9a)
**Branch**: main
**Live URL**: https://axis-app-kappa.vercel.app

---

## What Is Working Right Now

### Authentication
- Email + password sign in / sign up ✅
- Google OAuth ✅
- Forgot password / reset password ✅
- Session persistence ✅
- First name stored in Supabase metadata ✅

### Dashboard
- Personalised greeting with first name ✅
- 4 KPI cards wired to real Supabase data ✅
  - Focus Hours (from focus_sessions table)
  - Brain Dumps (from chronicles table)
  - Streak (calculated from activity)
  - Clarity Score (100 - avg chaos score)
- All Modules grid with navigation ✅
- Today's Insights (dynamic, based on real data) ✅
- Quick Actions ✅
- Self-Model preview (currently hardcoded percentages) ⚠️

### Brain Dump Sanctuary
- Write tab — text dump with font size control ✅
- Voice tab — record audio, upload to Supabase Storage ✅
- Session tab — timed brain dump session ✅
- AI silent analysis — chaos score, emotional tone, themes, summary ✅
- Editable titles ✅
- Delete with 2-click confirmation ✅
- Copy button ✅
- Speech-to-text in textarea ✅
- Font size adjuster (A- / A+) persisted in localStorage ✅
- Clickable links in chronicle text ✅
- Sharing — WhatsApp, Facebook, X, Email, Telegram, Reddit,
  Obsidian, Notion, Google Drive, Native share, Copy Markdown ✅
- Chronicles list with all metadata ✅

### Mindoo Chat
- UI built and working ✅
- Groq API key added to .env.local ✅
- Model updated to claude-sonnet-4-5 ✅
- Still returning fallback message — API call failing ⚠️
- Root cause: needs to be switched to Groq fully ❌

### Focus Sanctuary
- Basic focus session timer ✅
- Session saved to Supabase ✅
- Needs expansion ⚠️

---

## What Is Broken / Incomplete

### Critical
- Mindoo Chat AI not working — returns "I'm here. Keep going." ❌
  - Cause: Anthropic blocks direct browser API calls (CORS)
  - Fix: Switch ChatPanel.jsx to use Groq API
  - Status: Groq key added, code not yet updated

### Important
- Self-Model identity percentages are hardcoded ⚠️
  - Should be calculated from real usage data
- Brain Dump page loads slowly (5-10 seconds) ⚠️
  - Cause: Multiple sequential Supabase calls
  - Fix: Parallel loading + skeleton screens

### Structural
- Duplicate files cleaned up ✅
  - src/pages/ai.js — deleted
  - src/pages/db.js — deleted
  - src/pages/BrainDump.jsx — deleted
- App.jsx restored to correct version ✅

---

## File Structure (Key Files)

```
src/
├── App.jsx                          ✅ Clean, correct routes
├── index.css                        ✅ Full design system
├── supabase.js                      ✅ Supabase client
├── main.jsx                         ✅ Entry point
│
├── components/
│   ├── ErrorBoundary.jsx            ✅
│   ├── Icons.jsx                    ✅
│   ├── Sidebar.jsx                  ✅
│   └── Topbar.jsx                   ✅
│
├── config/
│   └── modules.js                   ✅ Engines + system prompt builder
│
├── hooks/
│   ├── useAuth.js                   ✅
│   └── useData.js                   ✅ Dashboard data hook
│
├── pages/
│   ├── Dashboard.jsx                ✅ Main shell
│   ├── Dashboard.backup.jsx         📦 Backup, do not touch
│   ├── SignIn.jsx                   ✅
│   ├── SignUp.jsx                   ✅
│   ├── ForgotPassword.jsx           ✅
│   ├── ResetPassword.jsx            ✅
│   ├── Terms.jsx                    ✅
│   └── Privacy.jsx                  ✅
│
├── pages/sections/
│   ├── BrainDump.jsx                ✅ 946 lines, all features
│   ├── ChatPanel.jsx                ⚠️ Needs Groq switch
│   ├── FocusSection.jsx             ✅
│   ├── Home.jsx                     ✅ Real data
│   ├── ModulePage.jsx               ✅
│   └── Settings.jsx                 ✅
│
└── services/
    ├── ai.js                        ✅ analyzeChronicle function
    └── db.js                        ✅ All Supabase functions
```

---

## Database Tables (Supabase)

### chronicles
- id, user_id, title, text, word_count, origin
- chaos_score, emotional_tone, urgency_signals, themes, ai_summary
- audio_url, duration_secs, disposition
- created_at, updated_at
- Row Level Security: enabled ✅

### focus_sessions
- id, user_id, mode, mode_name, planned_mins, actual_secs, completed
- created_at
- Row Level Security: enabled ✅

### user_profiles
- id, user_id, first_name
- created_at
- Row Level Security: enabled ✅

### chronicle_folders (added recently)
- id, user_id, name, color
- created_at
- Row Level Security: enabled ✅

---

## Environment Variables Required

```
VITE_SUPABASE_URL=https://socevlvjuwsybvshxthk.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_GROQ_API_KEY=gsk_...
```

---

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Fonts: Sora 800 (headings) + Inter 400/500 (body)
- Icons: Lucide React
- Auth: Supabase Auth
- Database: Supabase PostgreSQL
- Storage: Supabase Storage (voice notes)
- Hosting: Vercel
- AI Analysis: Anthropic Claude (services/ai.js)
- AI Chat: Groq (needs implementation)
- Fallback: OpenRouter (planned)
