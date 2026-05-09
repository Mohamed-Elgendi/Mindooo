# 11 — DECISIONS LOG
## Every Major Decision Made and Why
**Rule**: Every decision is logged here permanently. Never revisit without reading this first.

---

## April 5, 2026

### DECISION 001 — App Architecture
**Decision**: Brain Dump is a section inside Dashboard, not a separate route
**Why**: The app uses a shell architecture — Dashboard.jsx renders sections internally via sidebar navigation. A separate /brain-dump route was breaking the app.
**Alternative considered**: Separate route for each module
**Why rejected**: Would break the existing shell architecture and sidebar navigation
**Files affected**: App.jsx, Dashboard.jsx, pages/sections/BrainDump.jsx

---

### DECISION 002 — AI Chat Provider
**Decision**: Switch from Anthropic to Groq for Chat panel
**Why**: Anthropic blocks direct browser-to-API calls (CORS restriction, returns 400 Method Not Allowed). Groq allows browser calls, is free, and supports llama-3.3-70b-versatile which is highly capable.
**Alternative considered**: Proxy server to forward Anthropic calls
**Why rejected**: Adds infrastructure complexity, costs money, slower
**Files affected**: src/pages/sections/ChatPanel.jsx

---

### DECISION 003 — AI Failover Chain
**Decision**: Claude (primary) → Groq → OpenRouter → cached responses
**Why**: Ensures the AI never fails completely. Claude for quality analysis, Groq for fast chat, OpenRouter as universal fallback.
**Alternative considered**: Single provider only
**Why rejected**: Single point of failure — if provider is down or quota reached, whole AI stops

---

### DECISION 004 — Science-Based Only
**Decision**: Every AI recommendation must be grounded in real science
**Why**: Mo has learning difficulties and needs reliable, evidence-based guidance. Generic internet advice is harmful for someone making real life decisions.
**What this means in practice**: Every suggestion must cite psychology, neuroscience, or coaching research. No pop psychology. No generic tips.

---

### DECISION 005 — Modular Architecture
**Decision**: Every feature is a module. Adding a module never touches existing modules.
**Why**: Previous sessions showed that touching existing files to add features breaks things. The modular approach isolates changes.
**Rule**: New module = new files only. Existing files only get import additions, never logic changes.

---

### DECISION 006 — Documentation Rule
**Decision**: Every session documents everything — decisions, code changes, drift, next steps
**Why**: Mo and I kept losing context between sessions. Features got overwritten. The app broke multiple times because we did not have a source of truth.
**Rule**: Session handoff file updated every session. Project docs updated every time something changes.

---

### DECISION 007 — Complete Files Only
**Decision**: Every code delivery must be a complete, ready-to-use file
**Why**: Mo has zero coding skills. Partial files, snippets, or instructions to merge changes are useless and dangerous.
**Rule**: Never deliver partial files. Never ask Mo to edit code manually. Always deliver the complete file.

---

### DECISION 008 — Cognitive Performance is Core
**Decision**: Cognitive Performance monitoring is a core module, not an add-on
**Why**: Mo has learning difficulties, weak memory, and untrained cognitive functions. The platform cannot help him reach his potential without addressing the cognitive foundation.
**Science base**: Neuroplasticity research (Doidge, Merzenich), memory science (Ebbinghaus), executive function research (Diamond)

---

### DECISION 009 — Personal AI Only
**Decision**: The AI must be 100% personalised to Mo's real data — never generic
**Why**: Generic productivity advice has failed Mo before. The value of Mindoo is that it knows him specifically — his patterns, his blockers, his strengths, his data.
**Rule**: Every AI response must be traceable to real data Mo has provided or generated through platform use.

---

### DECISION 010 — About Me is a Living Profile
**Decision**: The About Me profile is not a one-time form — it builds progressively
**Why**: People cannot answer deep self-discovery questions all at once. The profile grows through conversations, dumps, and sessions over time.
**How**: Start with basic questions, deepen through AI conversations, auto-update from behaviour patterns.

---

### DECISION 011 — Open Source AI Stack Integration
**Date**: April 5, 2026
**Decision**: Do NOT switch to Python/LangChain/Ollama stack. Instead extract the best concepts and apply them to existing React + Vite + Supabase + Vercel stack.
**Why**: Mo has zero coding skills. Switching stacks means throwing away everything built, starting from zero, requiring a Python developer, and needing a powerful local machine for Ollama.
**What we take from the open source stack**:
- RAG (Retrieval Augmented Generation) — using Supabase pgvector
- Embeddings — using Nomic or OpenAI free tier embedding API
- Feedback loop — thumbs up/down on AI responses, stored in database
- Open source models — already using Groq (llama-3.3-70b) which IS open source
- Vector search — Supabase pgvector extension (same Postgres database, zero migration)
**What we reject**:
- Next.js (React + Vite already works)
- Ollama local serving (Groq gives same models for free via API)
- FastAPI (Supabase Edge Functions serve same purpose)
- LangChain (overkill for current scale — services/ai.js does the job)
- Docker/local infrastructure (Vercel + Supabase is fully managed)
**Alternative considered**: Full stack rewrite to Python + Next.js + Ollama
**Why rejected**: Would take weeks, break everything, require skills Mo does not have, and provide no additional user value over current approach
**Files affected**: 01_ARCHITECTURE.md, 02_DATABASE_SCHEMA.md, 03_AI_SYSTEM.md, 09_IMPLEMENTATION_PLAN.md
