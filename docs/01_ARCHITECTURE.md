# 01 — SYSTEM ARCHITECTURE
## Complete Technical Blueprint
**Last Updated**: April 5, 2026
**Version**: 2.0 — RAG + Embeddings + Feedback Loop added
**Status**: Design Phase

---

## The Four Layers

```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                     │
│            React + Vite + Tailwind CSS                   │
│      Dashboard Shell → Sections → Components            │
│              Hosted on Vercel                           │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                 INTELLIGENCE LAYER                       │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              CONTEXT ENGINE                      │   │
│  │  1. Load user profile + stats + about me        │   │
│  │  2. RAG search — find relevant chronicles       │   │
│  │  3. Build personalised system prompt            │   │
│  │  4. Call AI with full context                   │   │
│  │  5. Store response + collect feedback           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  AI Providers (failover chain):                         │
│  Claude → Groq (llama-3.3) → OpenRouter → Cached       │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│              RETRIEVAL LAYER (RAG)                       │
│                                                         │
│  Query → Embed query → Vector search in Supabase       │
│       → Find top 5 relevant chronicles                  │
│       → Return with similarity scores                   │
│                                                         │
│  Embedding model: Nomic (free) or OpenAI ada-002        │
│  Vector store: Supabase pgvector (same Postgres DB)     │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                    DATA LAYER                            │
│              Supabase PostgreSQL                         │
│                                                         │
│  chronicles (+ embedding vector column)                 │
│  focus_sessions                                         │
│  user_profiles                                          │
│  user_about_me                                          │
│  cognitive_profile                                      │
│  ai_conversations                                       │
│  ai_feedback (NEW)                                      │
│  chronicle_embeddings (NEW)                             │
└─────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Shell Pattern
- Dashboard.jsx is the main shell — never contains features
- All features live in src/pages/sections/
- Sidebar navigation switches sections internally
- No page reloads — single page application

### Component Hierarchy
```
App.jsx (router)
└── Dashboard.jsx (shell + auth guard)
    ├── Sidebar.jsx (navigation)
    ├── Topbar.jsx (clock + user)
    └── [Active Section]
        ├── Home.jsx
        ├── ChatPanel.jsx
        ├── BrainDump.jsx
        ├── FocusSection.jsx
        ├── ModulePage.jsx
        └── Settings.jsx
```

### Data Flow Rule (NEVER break this)
```
Component → services/db.js → Supabase
Component → services/ai.js → AI Provider
NEVER: Component → Supabase directly
NEVER: Component → AI API directly
```

---

## RAG Architecture (Retrieval Augmented Generation)

### What RAG Does
Instead of the AI guessing from training data, it searches
Mo's actual chronicles for relevant content before answering.

```
User asks: "Why do I keep procrastinating?"
     ↓
Embed the question into a vector
     ↓
Search chronicles table for similar vectors
     ↓
Find top 5 most relevant past chronicles
     ↓
Include those chronicles in the AI prompt
     ↓
AI answers using Mo's ACTUAL words and patterns
     ↓
Answer is personal, specific, evidence-based
```

### Why This Is Powerful for Mindoo
- Every answer references real chronicles, not generic advice
- The AI can say "3 weeks ago you wrote X, and now you are writing Y"
- Patterns across hundreds of chronicles become visible
- The more Mo writes, the smarter the AI gets

### RAG Implementation Plan

**Step 1: Enable pgvector in Supabase**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

**Step 2: Add embedding column to chronicles**
```sql
ALTER TABLE chronicles
ADD COLUMN embedding vector(768);
```

**Step 3: Create similarity search function**
```sql
CREATE OR REPLACE FUNCTION match_chronicles(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
RETURNS TABLE (
  id uuid,
  title text,
  text text,
  ai_summary text,
  chaos_score int,
  emotional_tone text,
  themes text[],
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id, title, text, ai_summary,
    chaos_score, emotional_tone, themes,
    1 - (embedding <=> query_embedding) AS similarity
  FROM chronicles
  WHERE user_id = p_user_id
    AND embedding IS NOT NULL
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
```

**Step 4: Embed chronicles when saved**
```javascript
// In services/ai.js
async function embedText(text) {
  const response = await fetch('https://api.nomic.ai/v1/embedding/text', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_NOMIC_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      texts: [text],
      model: 'nomic-embed-text-v1.5'
    })
  })
  const data = await response.json()
  return data.embeddings[0]
}
```

**Step 5: Search before every AI response**
```javascript
async function ragSearch(query, userId) {
  const queryEmbedding = await embedText(query)
  const { data } = await supabase.rpc('match_chronicles', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: 5,
    p_user_id: userId
  })
  return data || []
}
```

---

## The Feedback Loop

### How It Works
```
AI gives response
     ↓
User sees 👍 / 👎 buttons
     ↓
User clicks one
     ↓
Feedback stored in ai_feedback table
     ↓
Weekly analysis: what responses scored well?
     ↓
System prompt adjusted based on patterns
     ↓
AI improves over time
```

### What Gets Stored Per Feedback
```javascript
{
  user_id: uuid,
  conversation_id: uuid,
  message_index: integer,
  rating: 'positive' | 'negative',
  ai_response_summary: text,
  engine_used: text,
  model_used: text,
  context_size: integer,  // how much context was loaded
  created_at: timestamp
}
```

### How Feedback Improves the System
- Responses rated 👎 → flag for prompt review
- Responses rated 👍 → use as examples in future prompts
- Patterns in 👎 → identify what the AI gets wrong for Mo
- Patterns in 👍 → identify what works for Mo specifically

---

## The Continuous Improvement Loop

```
Mo uses Mindoo
     ↓
Data generated (chronicles, focus, chat)
     ↓
Embeddings created (vectors stored in pgvector)
     ↓
RAG retrieval (relevant context found)
     ↓
AI responds with full personal context
     ↓
Mo gives feedback (👍 / 👎)
     ↓
Feedback analysed weekly
     ↓
Prompts refined
     ↓
Mo uses Mindoo (loop repeats, AI gets smarter)
```

---

## AI Provider Architecture

### Failover Chain
```javascript
async function callAI(messages, systemPrompt) {
  // 1. Try Groq (primary — browser compatible, free)
  try {
    return await callGroq(messages, systemPrompt)
  } catch (e) {
    logFailure('groq', e)
  }

  // 2. Try OpenRouter (secondary — universal fallback)
  try {
    return await callOpenRouter(messages, systemPrompt)
  } catch (e) {
    logFailure('openrouter', e)
  }

  // 3. Return cached/honest fallback
  return {
    text: "I am having trouble connecting right now. Your data is safe. Please try again in a moment.",
    model: 'cached',
    failed: true
  }
}
```

### Models Used
| Job | Provider | Model | Why |
|-----|----------|-------|-----|
| Chat | Groq | llama-3.3-70b-versatile | Fast, free, browser-safe |
| Analysis | Groq | llama-3.3-70b-versatile | Same model, silent background |
| Embeddings | Nomic | nomic-embed-text-v1.5 | Free, 768 dimensions, excellent quality |
| Fallback | OpenRouter | meta-llama/llama-3.3-70b | Universal fallback |

---

## Performance Architecture

### Target: Every page loads in under 2 seconds

### Current Problem
Sequential Supabase calls = 5-10 second load time

### Solution: Parallel Loading
```javascript
// Always load data in parallel
const [chronicles, folders, stats] = await Promise.all([
  loadChronicles(userId),
  loadFolders(userId),
  loadDashboardStats(userId)
])
```

### Skeleton Loading
Show page structure immediately.
Replace skeletons with real data as it loads.
User sees something in under 500ms always.

---

## Security Architecture

- Row Level Security on ALL Supabase tables
- Every table: user sees only their own data
- API keys in .env.local — never in code
- Embeddings stored per user — never cross-contaminated
- AI context engine only loads the requesting user's data
- Feedback data private per user

---

## What We Are NOT Building (And Why)

| Rejected | Why |
|----------|-----|
| Next.js | React + Vite already works and is deployed |
| Ollama local | Groq gives same models free via API |
| LangChain | Overkill — services/ai.js does the job |
| FastAPI Python | Supabase Edge Functions are serverless equivalent |
| Docker | Vercel + Supabase is fully managed |
| Milvus/Weaviate | pgvector in existing Supabase is sufficient |
| Metaflow | No ML pipeline needed at current scale |
