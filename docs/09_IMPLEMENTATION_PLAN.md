# 09 — IMPLEMENTATION PLAN
## Every Build Step In Order
**Last Updated**: April 5, 2026
**Version**: 2.0 — RAG + Embeddings + Feedback Loop added
**Current Phase**: Phase 0 — Architecture complete, ready to build

---

## The Golden Rules

1. Never start a new phase until the current phase is complete and tested
2. Every phase ends with a GitHub commit and Vercel deployment check
3. Never modify existing working files without reading them fully first
4. Always deliver complete files — never snippets or partial code
5. Test every feature manually before moving to the next

---

## Phase 0 — Architecture & Documentation ✅ COMPLETE
**Goal**: Full blueprint before any code
**Status**: Done

- [x] Master vision document (00_MASTER_VISION.md)
- [x] System architecture (01_ARCHITECTURE.md)
- [x] Database schema (02_DATABASE_SCHEMA.md)
- [x] AI system design (03_AI_SYSTEM.md)
- [x] Modules and engines (04_MODULES_AND_ENGINES.md)
- [x] About Me profile design (05_ABOUT_ME_PROFILE.md)
- [x] Cognitive performance design (06_COGNITIVE_PERFORMANCE.md)
- [x] File structure (07_FILE_STRUCTURE.md)
- [x] Current build state (08_CURRENT_BUILD_STATE.md)
- [x] Implementation plan (this document)
- [x] Session handoff (10_SESSION_HANDOFF.md)
- [x] Decisions log (11_DECISIONS_LOG.md)
- [x] BACKUP commit pushed to GitHub

---

## Phase 1 — Fix What Is Broken
**Goal**: Everything currently built works perfectly
**Prerequisite**: Phase 0 complete ✅

### Step 1.1 — Fix Chat AI (IMMEDIATE NEXT STEP)
- [ ] Rewrite ChatPanel.jsx to use Groq API
- [ ] Test: type message, get real AI response
- [ ] Commit to GitHub

### Step 1.2 — Fix Loading Speed
- [ ] Add Promise.all parallel loading to BrainDump
- [ ] Add skeleton loading screens
- [ ] Target: page loads in under 2 seconds

### Step 1.3 — Fix Self-Model Percentages
- [ ] Calculate real identity scores from usage data
- [ ] Wire to real Supabase data in Home.jsx

### Step 1.4 — Full Manual Test
- [ ] Test every feature in Brain Dump
- [ ] Test Dashboard KPIs
- [ ] Test Focus session
- [ ] Test Chat (after fix)
- [ ] Fix any console errors
- [ ] Commit: "Phase 1 complete"

---

## Phase 2 — Database Expansion
**Goal**: All new tables ready for new features
**Prerequisite**: Phase 1 complete

### Step 2.1 — Enable pgvector
Run in Supabase SQL editor:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### Step 2.2 — Add embedding to chronicles
```sql
ALTER TABLE chronicles ADD COLUMN embedding vector(768);
CREATE INDEX chronicles_embedding_idx
ON chronicles USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### Step 2.3 — Create RAG function
Run match_chronicles function from 02_DATABASE_SCHEMA.md

### Step 2.4 — Create new tables (in order)
1. user_about_me
2. cognitive_profile
3. ai_conversations (with embedding column)
4. ai_feedback
5. insights

### Step 2.5 — Update services/db.js
Add functions for all new tables:
- loadAboutMe(), saveAboutMe()
- loadCognitiveProfile(), saveCognitiveProfile()
- saveConversation(), loadConversations()
- saveFeedback()
- loadInsights(), saveInsight()

### Step 2.6 — Test all new functions
- [ ] Save and load About Me data
- [ ] Save and load Cognitive Profile
- [ ] Save conversation message
- [ ] Save feedback rating
- [ ] Commit: "Phase 2 complete — database expanded"

---

## Phase 3 — Embeddings + RAG
**Goal**: AI finds relevant chronicles before every response
**Prerequisite**: Phase 2 complete

### Step 3.1 — Get Nomic API key
- Go to nomic.ai, sign up free
- Add VITE_NOMIC_API_KEY to .env.local
- Add to Vercel environment variables

### Step 3.2 — Build embedding function
Add embedText() and embedQuery() to services/ai.js

### Step 3.3 — Embed existing chronicles
- One-time script to embed all existing chronicles
- Add embedding on save to services/db.js saveChronicle()

### Step 3.4 — Build RAG search
Add ragSearch() to services/ai.js

### Step 3.5 — Build context engine
Add buildContext() to services/ai.js
Add buildSystemPrompt() to services/ai.js

### Step 3.6 — Wire to ChatPanel
- ChatPanel loads context before every message
- RAG results included in system prompt
- Test: ask "how am I doing?" get personalised answer

### Step 3.7 — Commit: "Phase 3 complete — RAG working"

---

## Phase 4 — Feedback Loop
**Goal**: Every AI response can be rated, system improves
**Prerequisite**: Phase 3 complete

### Step 4.1 — Add thumbs up/down to ChatPanel
- Show 👍 👎 after every AI message
- On click: save to ai_feedback table
- Show "Thanks" confirmation

### Step 4.2 — Add feedback analytics to Home.jsx
- Show total positive vs negative ratings
- Show which engine gets best ratings

### Step 4.3 — Commit: "Phase 4 complete — feedback loop"

---

## Phase 5 — About Me Module
**Goal**: Self-discovery profile built and wired to AI
**Prerequisite**: Phase 4 complete

### Step 5.1 — Build About Me section UI
- New file: src/pages/sections/AboutMe.jsx
- Progressive questionnaire (11 sections)
- Progress indicator
- Save to Supabase

### Step 5.2 — Add to Dashboard navigation
- Add to config/modules.js
- Add import to Dashboard.jsx
- Add to sidebar

### Step 5.3 — Wire to AI context
- loadAboutMe() called in context engine
- Data included in every system prompt
- Test: AI responses now reference profile data

### Step 5.4 — AI-guided profile building
- Chat can ask self-discovery questions
- Answers auto-populate About Me sections

### Step 5.5 — Commit: "Phase 5 complete — About Me working"

---

## Phase 6 — Cognitive Performance Module
**Goal**: Cognitive monitoring and brain gym working
**Prerequisite**: Phase 5 complete

### Step 6.1 — Build cognitive score calculation
- Infer scores from existing usage data
- Update cognitive_profile automatically
- Functions in services/db.js

### Step 6.2 — Build Cognitive Dashboard section
- New file: src/pages/sections/CognitivePerformance.jsx
- Vitals panel (attention, memory, processing, flexibility)
- Weekly brain report
- Today's brain gym exercises

### Step 6.3 — Build brain gym exercise system
- 3 exercises per day
- Memory, attention, processing, flexibility
- Track completion

### Step 6.4 — Commit: "Phase 6 complete — Cognitive Performance"

---

## Phase 7 — Remaining Modules (One at a Time)
**Goal**: All planned modules built
**Prerequisite**: Phase 6 complete
**Rule**: One module, fully tested, committed before starting next

Order:
1. Journaling Nexus
2. Emotional Mastery System
3. Habit Transformation Engine
4. Embodied Affirmations
5. Self-Model (full version)
6. Life Clarity Engine
7. Blocker Elimination Engine
8. Financial Freedom Engine
9. Purpose & Ikigai Engine
10. Energy & Time Engine
11. Relationship & Support Engine

---

## Phase 8 — Polish & Performance
**Goal**: Platform is fast, stable, beautiful
**Prerequisite**: Phase 7 complete

- All pages under 2 seconds load time
- No console errors anywhere
- Mobile fully responsive
- All AI responses under 3 seconds
- Error boundaries on every section
- Offline graceful degradation

---

## Phase 9 — Prepare for Other Users
**Goal**: Platform ready for people beyond Mo
**Prerequisite**: Phase 8 complete

- Landing page
- Pricing page
- Onboarding flow
- User support system
- Analytics (privacy-respecting)

---

## Deployment Checklist (After Every Phase)

- [ ] npm run dev — no errors locally
- [ ] All features tested manually
- [ ] No red errors in browser console
- [ ] git add . && git commit -m "..."
- [ ] git push
- [ ] Vercel deployment successful
- [ ] Live URL tested
- [ ] Update 08_CURRENT_BUILD_STATE.md
- [ ] Update 10_SESSION_HANDOFF.md
