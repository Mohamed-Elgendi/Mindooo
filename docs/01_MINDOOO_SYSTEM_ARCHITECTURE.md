# MINDOOO — SYSTEM ARCHITECTURE
## The Complete Technical Blueprint
### From Chaos to Clarity. Now Do More.

**Version**: 3.0 — The Synthesized Architecture  
**Last Updated**: May 18, 2026  
**Status**: Design Phase → Build Phase Transition  
**Current URL**: https://axis-app-kappa.vercel.app  
**GitHub**: https://github.com/Mohamed-Elgendi/Mindooo  
**Primary User**: Mohamed (Mo) — Founder, First User, Living Blueprint  
**Brand Standard**: Mindooo (three o's) — zero tolerance for "Mindoo"

---

## I. THE ARCHITECTURE PHILOSOPHY

Mindooo's architecture is not merely technical. It is the physical manifestation of the seven immutable principles:

1. **Science-Based** → Every technical choice has a documented reason
2. **Personal** → The system adapts to Mo's constraints (zero coding, dyslexia, ADHD)
3. **Never Crashes** → Failovers at every layer, graceful degradation
4. **Modular** → Adding a module never touches existing code
5. **Data-Safe** → RLS, encryption, backups, zero cross-contamination
6. **Transparent AI** → RAG shows its sources, feedback loops expose reasoning
7. **Progressive** → The system gets smarter with every interaction

### The Core Equation Applied to Architecture
**Traditional Architecture**: Monolithic, fragile, hard to change  
**Mindooo Architecture**: (Simplicity × Reliability) ^ Modularity × Intelligence = Exponential Evolution

---

## II. THE FOUR LAYERS: VISUAL ARCHITECTURE

```
╔═════════════════════════════════════════════════════════════════════════════╗
║                                                                             ║
║                    MINDOOO: THE LIFE OPERATING SYSTEM                        ║
║                        "From Chaos to Clarity. Now Do More."                 ║
║                                                                             ║
╚═════════════════════════════════════════════════════════════════════════════╝
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
   ┌────▼────┐               ┌─────▼─────┐              ┌─────▼─────┐
   │ LAYER 1 │               │  LAYER 2  │              │  LAYER 3  │
   │PRESENTA-│               │INTELLIGEN-│              │ RETRIEVAL │
   │  TION   │◄─────────────►│   CE      │◄────────────►│   (RAG)   │
   │         │               │           │              │           │
   │ React   │               │  Context  │              │  Vector   │
   │  Vite   │               │  Engine   │              │  Search   │
   │Tailwind │               │  AI Chain │              │  pgvector │
   │ Vercel  │               │  Agents   │              │  Nomic    │
   └────┬────┘               └─────┬─────┘              └─────┬─────┘
        │                          │                          │
        │                    ┌─────▼─────┐                    │
        │                    │  LAYER 4  │                    │
        │                    │   DATA    │◄───────────────────┘
        │                    │           │
        │                    │ Supabase  │
        │                    │ Postgres  │
        │                    │   RLS     │
        │                    │  Tables   │
        │                    └───────────┘
        │                          │
        └──────────────────────────┘
                    │
              ┌─────▼─────┐
              │   USER    │
              │   (Mo)    │
              └───────────┘
```

---

## III. LAYER 1: PRESENTATION LAYER

### Technology Stack
| Technology | Role | Why Chosen |
|---|---|---|
| **React 18+** | UI Framework | Component-based, massive ecosystem, Mo can learn it |
| **Vite** | Build Tool | Fast dev server, instant HMR, simpler than Webpack |
| **Tailwind CSS** | Styling | Utility-first, rapid prototyping, no CSS files to manage |
| **Vercel** | Hosting | Zero-config deployment, edge network, free tier |

### Shell Pattern (The Golden Rule)
```
Dashboard.jsx = The Sacred Shell
├── NEVER contains feature logic
├── ONLY contains: layout, navigation, auth guard
└── All features live in src/pages/sections/
```

### Component Hierarchy
```
App.jsx (React Router)
│
└── Dashboard.jsx (The Shell — auth guard + layout)
    │
    ├── Sidebar.jsx (Navigation — switches sections)
    │   ├── Mindooo Logo (top)
    │   ├── Module Navigation
    │   └── User Profile (bottom)
    │
    ├── Topbar.jsx (Context Bar)
    │   ├── Clock / Date
    │   ├── Notifications
    │   └── User Avatar
    │
    └── [Active Section] (Dynamic Content)
        ├── Home.jsx (Dashboard Overview)
        ├── ChatPanel.jsx (Mindooo Chat)
        ├── BrainDump.jsx (Brain Dump Sanctuary)
        ├── FocusSection.jsx (Focus Sanctuary)
        ├── ModulePage.jsx (Dynamic Module Loader)
        └── Settings.jsx (Mindooo Settings)
```

### Section Loading Architecture
```javascript
// Dashboard.jsx — The Shell
import { lazy, Suspense } from 'react'

// Lazy load all sections for performance
const sections = {
  home: lazy(() => import('./sections/Home')),
  chat: lazy(() => import('./sections/ChatPanel')),
  braindump: lazy(() => import('./sections/BrainDump')),
  focus: lazy(() => import('./sections/FocusSection')),
  module: lazy(() => import('./sections/ModulePage')),
  settings: lazy(() => import('./sections/Settings'))
}

function Dashboard() {
  const [activeSection, setActiveSection] = useState('home')
  const ActiveComponent = sections[activeSection]

  return (
    <div className="mindooo-shell">
      <Sidebar onNavigate={setActiveSection} />
      <main className="mindooo-main">
        <Topbar />
        <Suspense fallback={<MindoooSkeleton />}>
          <ActiveComponent />
        </Suspense>
      </main>
    </div>
  )
}
```

### Data Flow Rule (NEVER Break This)
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Component  │────►│ services/   │────►│  Supabase   │
│             │     │    db.js    │     │   (Data)    │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       │            ┌─────────────┐     ┌─────────────┐
       └───────────►│ services/   │────►│  AI Provider│
                    │    ai.js    │     │  (Groq etc) │
                    └─────────────┘     └─────────────┘

FORBIDDEN:
❌ Component → Supabase directly
❌ Component → AI API directly
❌ Component → LocalStorage for app data
```

### Brand Display Rules (Enforced)
Every component must display "Mindooo" correctly:
- Logo: `Mindooo` (not Mindoo)
- Browser tab: `Mindooo — [Section Name]`
- Loading states: `Mindooo is loading your clarity...`
- Error states: `Mindooo encountered a moment of chaos...`
- Empty states: `Mindooo is ready when you are`

---

## IV. LAYER 2: INTELLIGENCE LAYER

### The Context Engine: The Brain of Mindooo

```
┌─────────────────────────────────────────────────────────────────┐
│                    MINDOOO CONTEXT ENGINE                        │
│                                                                  │
│  Step 1: LOAD                                                    │
│  ├── user_profiles (identity, preferences, constraints)         │
│  ├── user_about_me (personality, values, ikigai)                │
│  ├── cognitive_profile (strengths, difficulties, training)      │
│  └── dashboard_stats (streak, clarity_score, dumps_per_week)    │
│                                                                  │
│  Step 2: RAG SEARCH                                              │
│  ├── Embed user query into vector (Nomic)                       │
│  ├── Search chronicles table (pgvector similarity)              │
│  └── Return top 5 relevant chronicles with scores               │
│                                                                  │
│  Step 3: BUILD PROMPT                                            │
│  ├── System prompt (science-based, personalized)                │
│  ├── Context block (user profile + relevant chronicles)         │
│  └── User message (the actual question/request)                 │
│                                                                  │
│  Step 4: CALL AI                                                 │
│  ├── Primary: Groq (llama-3.3-70b) — fast, free, browser-safe   │
│  ├── Fallback 1: OpenRouter (universal routing)                 │
│  └── Fallback 2: Cached insights (honest limitation)            │
│                                                                  │
│  Step 5: STORE & FEEDBACK                                        │
│  ├── Save conversation to ai_conversations                      │
│  ├── Show 👍 / 👎 buttons to user                               │
│  └── Store feedback in ai_feedback table                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### The 5 AI Agents of Mindooo

| Agent | Display Name | Role | Activation Trigger |
|---|---|---|---|
| **The Analyst** | Mindooo Analyst | Pattern recognition, insight generation | Background — every data write |
| **The Coach** | Mindooo Coach | Personal guidance, chat responses | User opens Mindooo Chat |
| **The Planner** | Mindooo Planner | Goal decomposition, step sequencing | User activates Goal Builder engine |
| **The Guardian** | Mindooo Guardian | Proactive monitoring, crisis alerts | Background — anomaly detection |
| **The Self-Model Builder** | Mindooo Self-Model Builder | Profile evolution, identity updates | Weekly or on significant events |

### AI Failover Chain (Code)
```javascript
// services/ai.js — The Mindooo AI Gateway

const AI_CONFIG = {
  primary: {
    name: 'Groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    key: import.meta.env.VITE_GROQ_API_KEY
  },
  fallback1: {
    name: 'OpenRouter',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'meta-llama/llama-3.3-70b',
    key: import.meta.env.VITE_OPENROUTER_API_KEY
  },
  fallback2: {
    name: 'Cached',
    response: {
      text: "Mindooo is having trouble connecting right now. Your data is completely safe. Please try again in a moment — clarity is worth the wait.",
      model: 'mindooo-cached',
      failed: true,
      retry_after: 30
    }
  }
}

async function callMindoooAI(messages, systemPrompt, engine = 'coach') {
  const context = await buildContext(engine)
  const fullSystemPrompt = `${systemPrompt}

${context}`

  // Try Primary
  try {
    const response = await fetch(AI_CONFIG.primary.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.primary.key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: AI_CONFIG.primary.model,
        messages: [
          { role: 'system', content: fullSystemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    })
    if (response.ok) return await response.json()
    throw new Error('Primary failed')
  } catch (primaryError) {
    logFailure('groq', primaryError)

    // Try Fallback 1
    try {
      const response = await fetch(AI_CONFIG.fallback1.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AI_CONFIG.fallback1.key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://mindooo.vercel.app',
          'X-Title': 'Mindooo'
        },
        body: JSON.stringify({
          model: AI_CONFIG.fallback1.model,
          messages: [
            { role: 'system', content: fullSystemPrompt },
            ...messages
          ]
        })
      })
      if (response.ok) return await response.json()
      throw new Error('Fallback 1 failed')
    } catch (fallbackError) {
      logFailure('openrouter', fallbackError)

      // Return Fallback 2 (Cached)
      return AI_CONFIG.fallback2.response
    }
  }
}
```

---

## V. LAYER 3: RETRIEVAL LAYER (RAG)

### Why RAG Is Essential for Mindooo

Without RAG, the AI gives generic advice.  
With RAG, the AI gives **Mo's own words back to him**, transformed into insight.

```
┌─────────────────────────────────────────────────────────────────┐
│              MINDOOO RAG PIPELINE                                │
│                                                                  │
│  USER INPUT                                                      │
│  "Why do I keep procrastinating on my most important goals?"    │
│                                                                  │
│       ↓                                                          │
│  EMBEDDING                                                       │
│  Nomic nomic-embed-text-v1.5 → 768-dimension vector             │
│                                                                  │
│       ↓                                                          │
│  VECTOR SEARCH                                                   │
│  SELECT * FROM chronicles                                        │
│  WHERE embedding <-> query_vector < 0.3                          │
│  ORDER BY similarity DESC                                        │
│  LIMIT 5                                                         │
│                                                                  │
│       ↓                                                          │
│  RETRIEVED CHRONICLES                                            │
│  1. "I keep avoiding the portfolio..." (92% match)              │
│  2. "Every time I sit to code, I open YouTube..." (87% match)   │
│  3. "My brain says 'later' but later never comes..." (85%)      │
│  4. "I feel paralyzed when the task feels too big..." (82%)     │
│  5. "I need to break things down but I don't know how..." (79%) │
│                                                                  │
│       ↓                                                          │
│  AI PROMPT (Context + Question)                                  │
│  "Based on Mo's chronicles from the past 3 months..."           │
│  "He repeatedly mentions feeling paralyzed by task size..."     │
│  "He opens YouTube as an escape pattern..."                     │
│  "Question: Why does he procrastinate on important goals?"      │
│                                                                  │
│       ↓                                                          │
│  AI RESPONSE (Personal, Evidence-Based)                          │
│  "Mo, I see a pattern in your chronicles..."                    │
│  "3 weeks ago you wrote: 'I feel paralyzed when...'"            │
│  "This suggests your procrastination is not laziness..."        │
│  "It's a protective response to overwhelm..."                   │
│  "Here's what the research says about this..."                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### RAG Database Schema

**Step 1: Enable pgvector**
```sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

**Step 2: Add embedding column**
```sql
ALTER TABLE chronicles
ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Create index for fast similarity search
CREATE INDEX idx_chronicles_embedding 
ON chronicles 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

**Step 3: Create similarity search function**
```sql
CREATE OR REPLACE FUNCTION match_chronicles(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  text text,
  ai_summary text,
  chaos_score int,
  emotional_tone text,
  themes text[],
  similarity float,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.title,
    c.text,
    c.ai_summary,
    c.chaos_score,
    c.emotional_tone,
    c.themes,
    1 - (c.embedding <=> query_embedding) AS similarity,
    c.created_at
  FROM chronicles c
  WHERE c.user_id = p_user_id
    AND c.embedding IS NOT NULL
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

**Step 4: Embedding service**
```javascript
// services/embeddings.js — Mindooo Embedding Service

const NOMIC_API_KEY = import.meta.env.VITE_NOMIC_API_KEY
const EMBEDDING_MODEL = 'nomic-embed-text-v1.5'
const EMBEDDING_DIMENSIONS = 768

async function embedText(text) {
  if (!text || text.trim().length === 0) {
    throw new Error('Mindooo: Cannot embed empty text')
  }

  const response = await fetch('https://api.nomic.ai/v1/embedding/text', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOMIC_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      texts: [text.slice(0, 8000)], // Nomic limit
      model: EMBEDDING_MODEL,
      task_type: 'search_document'
    })
  })

  if (!response.ok) {
    throw new Error(`Mindooo: Embedding failed — ${response.status}`)
  }

  const data = await response.json()
  return data.embeddings[0]
}

async function embedQuery(query) {
  const response = await fetch('https://api.nomic.ai/v1/embedding/text', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOMIC_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      texts: [query],
      model: EMBEDDING_MODEL,
      task_type: 'search_query'
    })
  })

  const data = await response.json()
  return data.embeddings[0]
}

export { embedText, embedQuery }
```

**Step 5: RAG search function**
```javascript
// services/rag.js — Mindooo RAG Engine

import { embedQuery } from './embeddings'
import { supabase } from './db'

async function ragSearch(query, userId, options = {}) {
  const {
    threshold = 0.7,
    count = 5,
    includeMetadata = true
  } = options

  console.log(`Mindooo RAG: Searching for "${query.slice(0, 50)}..."`)

  // 1. Embed the query
  const queryEmbedding = await embedQuery(query)

  // 2. Search Supabase
  const { data: chronicles, error } = await supabase.rpc('match_chronicles', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: count,
    p_user_id: userId
  })

  if (error) {
    console.error('Mindooo RAG Error:', error)
    return []
  }

  // 3. Format results for AI context
  const contextBlock = chronicles.map((c, i) => `
[Chronicle ${i + 1}] — ${c.similarity.toFixed(2)}% relevant
Date: ${new Date(c.created_at).toLocaleDateString()}
Title: ${c.title || 'Untitled'}
Content: ${c.text.slice(0, 500)}...
Emotional Tone: ${c.emotional_tone || 'Unknown'}
Chaos Score: ${c.chaos_score || 'N/A'}
Themes: ${c.themes?.join(', ') || 'None detected'}
`).join('
---
')

  console.log(`Mindooo RAG: Found ${chronicles.length} relevant chronicles`)

  return {
    chronicles,
    contextBlock,
    totalFound: chronicles.length
  }
}

export { ragSearch }
```

---

## VI. LAYER 4: DATA LAYER

### Supabase PostgreSQL Schema

```
┌─────────────────────────────────────────────────────────────────┐
│              MINDOOO DATA LAYER                                  │
│                    Supabase PostgreSQL                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  chronicles                                             │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  id (uuid, PK)                                          │   │
│  │  user_id (uuid, FK → auth.users)                        │   │
│  │  title (text)                                           │   │
│  │  text (text) — the raw brain dump                       │   │
│  │  ai_summary (text) — auto-generated summary             │   │
│  │  chaos_score (int, 1-10) — how scattered is the input   │   │
│  │  emotional_tone (text) — detected emotion               │   │
│  │  themes (text[]) — extracted themes                     │   │
│  │  embedding (vector(768)) — for RAG search               │   │
│  │  created_at (timestamp)                                 │   │
│  │  updated_at (timestamp)                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  focus_sessions                                         │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  id (uuid, PK)                                          │   │
│  │  user_id (uuid, FK)                                     │   │
│  │  duration (int) — minutes                               │   │
│  │  mode (text) — deep_work, shallow_work, recovery        │   │
│  │  quality_score (int, 1-10) — self-rated or AI-inferred  │   │
│  │  interruptions (int)                                    │   │
│  │  notes (text)                                           │   │
│  │  started_at (timestamp)                                 │   │
│  │  ended_at (timestamp)                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  user_profiles                                          │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  id (uuid, PK)                                          │   │
│  │  user_id (uuid, FK)                                     │   │
│  │  display_name (text)                                    │   │
│  │  clarity_score (int, 0-100)                             │   │
│  │  current_streak (int) — days                            │   │
│  │  longest_streak (int)                                   │   │
│  │  dumps_this_week (int)                                  │   │
│  │  focus_sessions_this_week (int)                         │   │
│  │  identity_claims (jsonb) — {strength: %, ...}           │   │
│  │  onboarding_complete (boolean)                          │   │
│  │  created_at (timestamp)                                 │   │
│  │  updated_at (timestamp)                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  user_about_me                                          │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  id (uuid, PK)                                          │   │
│  │  user_id (uuid, FK)                                     │   │
│  │  personality_type (jsonb) — Big Five, MBTI, etc.        │   │
│  │  values_hierarchy (jsonb)                               │   │
│  │  ikigai_map (jsonb)                                     │   │
│  │  energy_patterns (jsonb) — peak hours, crash times      │   │
│  │  passions (text[])                                      │   │
│  │  blockers (jsonb) — mental, financial, physical...      │   │
│  │  financial_picture (jsonb)                              │   │
│  │  relationships (jsonb)                                  │   │
│  │  dreams_and_fears (jsonb)                               │   │
│  │  health_patterns (jsonb)                                │   │
│  │  learning_style (jsonb)                                 │   │
│  │  updated_at (timestamp)                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  cognitive_profile                                      │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  id (uuid, PK)                                          │   │
│  │  user_id (uuid, FK)                                     │   │
│  │  working_memory_score (int, 0-100)                      │   │
│  │  attention_score (int, 0-100)                           │   │
│  │  cognitive_flexibility (int, 0-100)                     │   │
│  │  processing_speed (int, 0-100)                          │   │
│  │  metacognition (int, 0-100)                             │   │
│  │  overall_index (int, 0-100)                             │   │
│  │  training_history (jsonb)                               │   │
│  │  updated_at (timestamp)                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ai_conversations                                       │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  id (uuid, PK)                                          │   │
│  │  user_id (uuid, FK)                                     │   │
│  │  engine_used (text) — A, B, C...                        │   │
│  │  model_used (text) — groq, openrouter...                │   │
│  │  messages (jsonb) — full conversation history           │   │
│  │  context_loaded (int) — how many chronicles used        │   │
│  │  created_at (timestamp)                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ai_feedback (NEW)                                      │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  id (uuid, PK)                                          │   │
│  │  user_id (uuid, FK)                                     │   │
│  │  conversation_id (uuid, FK)                             │   │
│  │  message_index (int)                                    │   │
│  │  rating (text) — positive | negative                    │   │
│  │  ai_response_summary (text)                             │   │
│  │  engine_used (text)                                     │   │
│  │  model_used (text)                                      │   │
│  │  context_size (int)                                     │   │
│  │  created_at (timestamp)                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE chronicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_about_me ENABLE ROW LEVEL SECURITY;
ALTER TABLE cognitive_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "Users can only access their own chronicles"
ON chronicles FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own focus sessions"
ON focus_sessions FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own profile"
ON user_profiles FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own about me"
ON user_about_me FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own cognitive profile"
ON cognitive_profile FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own conversations"
ON ai_conversations FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own feedback"
ON ai_feedback FOR ALL
USING (auth.uid() = user_id);
```

---

## VII. THE FEEDBACK LOOP: CONTINUOUS IMPROVEMENT

### How Mindooo Gets Smarter

```
┌─────────────────────────────────────────────────────────────────┐
│           MINDOOO CONTINUOUS IMPROVEMENT LOOP                    │
│                                                                  │
│   Mo uses Mindooo                                                │
│        ↓                                                         │
│   Data Generated (chronicles, focus, chat, feedback)            │
│        ↓                                                         │
│   ┌─────────────────┐    ┌─────────────────┐                   │
│   │  EMBEDDINGS     │    │  ANALYTICS      │                   │
│   │  ─────────────  │    │  ─────────────  │                   │
│   │  Text → Vector  │    │  Pattern Spotting│                  │
│   │  Store in       │    │  Trend Detection │                  │
│   │  pgvector       │    │  Anomaly Alerts  │                  │
│   └────────┬────────┘    └────────┬────────┘                   │
│            │                      │                             │
│            └──────────┬───────────┘                             │
│                       ↓                                          │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              RAG RETRIEVAL                               │   │
│   │  Query → Embed → Vector Search → Top 5 Chronicles       │   │
│   └─────────────────────────────────────────────────────────┘   │
│                       ↓                                          │
│   AI Responds with Full Personal Context                        │
│   ("3 weeks ago you wrote X, and now you're asking Y...")       │
│                       ↓                                          │
│   Mo gives feedback (👍 / 👎)                                   │
│                       ↓                                          │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              FEEDBACK ANALYSIS                           │   │
│   │  • Store rating in ai_feedback                          │   │
│   │  • Weekly: aggregate 👍 vs 👎                           │   │
│   │  • Identify: what does AI get wrong for Mo?             │   │
│   │  • Identify: what does AI get right for Mo?             │   │
│   └─────────────────────────────────────────────────────────┘   │
│                       ↓                                          │
│   System Prompt Adjusted Based on Patterns                      │
│   (More of what works, less of what doesn't)                    │
│                       ↓                                          │
│   Mo uses Mindooo (loop repeats — AI gets smarter)              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Feedback Collection UI
```javascript
// components/FeedbackButtons.jsx — Mindooo Feedback

function FeedbackButtons({ conversationId, messageIndex }) {
  const [submitted, setSubmitted] = useState(false)

  async function submitFeedback(rating) {
    await supabase.from('ai_feedback').insert({
      conversation_id: conversationId,
      message_index: messageIndex,
      rating: rating,
      created_at: new Date().toISOString()
    })
    setSubmitted(true)
  }

  if (submitted) {
    return <span className="mindooo-feedback-thanks">Thank you — Mindooo learns from this.</span>
  }

  return (
    <div className="mindooo-feedback">
      <span>Was this helpful?</span>
      <button onClick={() => submitFeedback('positive')} aria-label="Helpful">
        👍
      </button>
      <button onClick={() => submitFeedback('negative')} aria-label="Not helpful">
        👎
      </button>
    </div>
  )
}
```

---

## VIII. PERFORMANCE ARCHITECTURE

### Target: Every Page Loads in Under 2 Seconds

### Current Problem
Sequential Supabase calls = 5-10 second load time

### Solution 1: Parallel Loading
```javascript
// services/db.js — Mindooo Data Service

async function loadDashboardData(userId) {
  // ❌ BAD: Sequential — 5-10 seconds
  // const chronicles = await loadChronicles(userId)
  // const folders = await loadFolders(userId)
  // const stats = await loadDashboardStats(userId)

  // ✅ GOOD: Parallel — under 2 seconds
  const [chronicles, folders, stats, profile] = await Promise.all([
    loadChronicles(userId),
    loadFolders(userId),
    loadDashboardStats(userId),
    loadUserProfile(userId)
  ])

  return { chronicles, folders, stats, profile }
}
```

### Solution 2: Skeleton Loading
```javascript
// components/MindoooSkeleton.jsx

function MindoooSkeleton() {
  return (
    <div className="mindooo-skeleton">
      <div className="skeleton-header" />
      <div className="skeleton-content">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
      </div>
      <div className="skeleton-stats">
        <div className="skeleton-stat" />
        <div className="skeleton-stat" />
        <div className="skeleton-stat" />
      </div>
    </div>
  )
}

// Usage in Dashboard.jsx
<Suspense fallback={<MindoooSkeleton />}>
  <ActiveSection />
</Suspense>
```

### Solution 3: Intelligent Caching
```javascript
// services/cache.js — Mindooo Cache Layer

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const cache = new Map()

function getCached(key) {
  const item = cache.get(key)
  if (item && Date.now() - item.timestamp < CACHE_DURATION) {
    return item.data
  }
  cache.delete(key)
  return null
}

function setCached(key, data) {
  cache.set(key, { data, timestamp: Date.now() })
}

async function loadWithCache(key, fetcher) {
  const cached = getCached(key)
  if (cached) return cached

  const data = await fetcher()
  setCached(key, data)
  return data
}

export { loadWithCache }
```

---

## IX. SECURITY ARCHITECTURE

### The Mindooo Security Promise
"Your data is never lost, never corrupted, never exploited, never cross-contaminated."

### Security Layers

| Layer | Implementation | Purpose |
|---|---|---|
| **Authentication** | Supabase Auth (JWT) | Verify identity |
| **Authorization** | Row Level Security (RLS) | Control access |
| **Data Isolation** | user_id column on every table | Prevent cross-user leaks |
| **API Security** | Keys in .env.local only | Prevent exposure |
| **Embedding Isolation** | Per-user vector search | Prevent cross-user RAG |
| **AI Context Isolation** | Load only requesting user's data | Prevent AI hallucinating other users |
| **Feedback Privacy** | Private per user | Prevent feedback contamination |
| **Transport** | HTTPS everywhere | Prevent interception |
| **Input Validation** | Zod schemas | Prevent injection |
| **Error Masking** | Generic error messages to user | Prevent information leakage |

### Environment Variables (.env.local)
```bash
# Mindooo Environment Configuration
# NEVER commit this file. NEVER expose these keys.

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# AI Providers
VITE_GROQ_API_KEY=your-groq-key
VITE_OPENROUTER_API_KEY=your-openrouter-key
VITE_NOMIC_API_KEY=your-nomic-key

# App Config
VITE_APP_NAME=Mindooo
VITE_APP_VERSION=2.2
VITE_APP_URL=https://mindooo.vercel.app
```

---

## X. WHAT WE ARE NOT BUILDING (And Why)

| Rejected Technology | Why Rejected | What We Use Instead |
|---|---|---|
| **Next.js** | Already have React + Vite deployed | React 18 + Vite |
| **Ollama (local)** | Groq gives same models free via API | Groq API |
| **LangChain** | Overkill for our needs | Custom services/ai.js |
| **FastAPI (Python)** | Supabase Edge Functions are equivalent | Supabase Edge Functions |
| **Docker** | Vercel + Supabase is fully managed | Vercel + Supabase |
| **Milvus / Weaviate** | pgvector in Supabase is sufficient | Supabase pgvector |
| **Metaflow** | No ML pipeline needed at current scale | Direct API calls |
| **Redux** | Overkill for current state complexity | React Context + Zustand |
| **GraphQL** | REST is sufficient, simpler for Mo | REST + Supabase RPC |
| **MongoDB** | Relational data fits our model better | PostgreSQL |
| **Firebase** | Supabase is open-source, SQL-based | Supabase |
| **AWS Lambda** | Vercel Functions are simpler | Vercel Edge Functions |

---

## XI. THE MODULE ARCHITECTURE

### How Modules Plug Into Mindooo

```
┌─────────────────────────────────────────────────────────────────┐
│                    MINDOOO MODULE SYSTEM                         │
│                                                                  │
│  ┌─────────────┐                                                │
│  │  CORE APP   │                                                │
│  │  (Shell)    │                                                │
│  │             │                                                │
│  │  Dashboard  │                                                │
│  │  Sidebar    │                                                │
│  │  Router     │                                                │
│  └──────┬──────┘                                                │
│         │                                                        │
│         │  ┌────────────────────────────────────────────────┐   │
│         └──┤           MODULE INTERFACE                      │   │
│            │  ┌──────────────────────────────────────────┐  │   │
│            │  │  Required:                               │  │   │
│            │  │  • manifest.json (name, version, routes) │  │   │
│            │  │  • index.jsx (main component)            │  │   │
│            │  │  • styles.css (scoped styles)            │  │   │
│            │  │  • api.js (data functions)               │  │   │
│            │  │                                          │  │   │
│            │  │  Optional:                               │  │   │
│            │  │  • engine.js (AI engine integration)     │  │   │
│            │  │  • icons/ (custom icons)                 │  │   │
│            │  │  • tests/ (unit tests)                   │  │   │
│            │  └──────────────────────────────────────────┘  │   │
│            └────────────────────────────────────────────────┘   │
│                              │                                   │
│         ┌────────────────────┼────────────────────┐             │
│         │                    │                    │             │
│    ┌────▼────┐          ┌────▼────┐          ┌────▼────┐       │
│    │ MODULE  │          │ MODULE  │          │ MODULE  │       │
│    │   A     │          │   B     │          │   C     │       │
│    │         │          │         │          │         │       │
│    │BrainDump│          │  Chat   │          │  Focus  │       │
│    │Sanctuary│          │  Panel  │          │Sanctuary│       │
│    └─────────┘          └─────────┘          └─────────┘       │
│                                                                  │
│  RULE: Adding Module C never touches Module A or B              │
│  RULE: Removing Module B never breaks Module A or C             │
│  RULE: Each module is self-contained with its own data layer    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Module Manifest Example
```json
// modules/brain-dump/manifest.json
{
  "name": "Mindooo Brain Dump Sanctuary",
  "version": "1.0.0",
  "description": "Zero-friction capture of all mental inputs",
  "route": "/brain-dump",
  "icon": "BrainIcon",
  "color": "#3B82F6",
  "dependencies": [],
  "engines": ["A", "C"],
  "tables": ["chronicles"],
  "author": "Mindooo Team",
  "license": "MIT"
}
```

---

## XII. THE DEPLOYMENT PIPELINE

```
┌─────────────────────────────────────────────────────────────────┐
│              MINDOOO DEPLOYMENT PIPELINE                         │
│                                                                  │
│  DEVELOPER (Mo + AI)                                             │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────┐                                                 │
│  │  LOCAL DEV  │  Vite dev server                                │
│  │  localhost  │  Hot Module Replacement                         │
│  └──────┬──────┘                                                 │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐                                                 │
│  │  GIT COMMIT │  Pre-commit hook:                               │
│  │             │  • Check for "Mindoo" (block if found)          │
│  │             │  • Run lint                                     │
│  │             │  • Run type check                               │
│  └──────┬──────┘                                                 │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐                                                 │
│  │   GITHUB    │  Push triggers:                                 │
│  │             │  • Brand Check (no "Mindoo" allowed)            │
│  │             │  • Build Check (must compile)                   │
│  │             │  • Test Check (must pass)                       │
│  └──────┬──────┘                                                 │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐                                                 │
│  │   VERCEL    │  Auto-deploy on main branch:                    │
│  │   (PROD)    │  • Build React app                              │
│  │             │  • Deploy to edge network                       │
│  │             │  • Invalidate CDN cache                         │
│  └─────────────┘                                                 │
│                                                                  │
│  SUPABASE (Database + Auth + Storage)                           │
│  ├── Migrations auto-applied                                     │
│  ├── RLS policies enforced                                       │
│  └── Embeddings indexed                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## XIII. THE MONITORING & ALERTING SYSTEM

### What Mindooo Monitors

| Metric | Threshold | Alert Action |
|---|---|---|
| **Page Load Time** | > 2 seconds | Log warning, trigger optimization |
| **AI Response Time** | > 5 seconds | Switch to fallback provider |
| **Error Rate** | > 1% | Notify Guardian agent, log incident |
| **Database Connections** | > 80% capacity | Scale connection pool |
| **Failed Logins** | > 5 per minute | Block IP, notify admin |
| **RAG Search Time** | > 3 seconds | Optimize vector index |
| **User Streak Break** | User misses 2 days | Guardian sends gentle nudge |
| **Chaos Score Spike** | > 7/10 for 3 days | Guardian suggests focus session |

### Guardian Alert Examples
```
┌─────────────────────────────────────────────────┐
│  🛡️ Mindooo Guardian Alert                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  Hi Mo,                                         │
│                                                 │
│  I noticed your chaos score has been above 7    │
│  for three consecutive days. Your chronicles    │
│  show increasing overwhelm about "the big       │
│  project."                                       │
│                                                 │
│  Suggestion: Take a 15-minute Brain Dump        │
│  session right now. Empty your head. I'll       │
│  help you find clarity in the noise.            │
│                                                 │
│  [Start Brain Dump]  [Snooze 1 hour]            │
│                                                 │
│  — Mindooo Guardian                             │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## XIV. THE DOCUMENTATION RULE: PERMANENT

Every session must:

1. **Document** what was decided or built
2. **Track and name** any drift from the architecture
3. **Update** the session handoff file
4. **Never assume** memory from previous sessions
5. **Version** every change with date and reason

### Architecture Change Log
```
| Date       | Version | Change                          | Reason           |
|------------|---------|---------------------------------|------------------|
| 2026-04-05 | 1.0     | Initial architecture            | Foundation       |
| 2026-04-05 | 2.0     | Added RAG + Embeddings          | Personalization  |
| 2026-04-05 | 2.0     | Added Feedback Loop             | AI improvement   |
| 2026-05-17 | 2.1     | Synthesized with Vision doc     | Completeness     |
| 2026-05-18 | 3.0     | Rebranded to Mindooo            | Brand alignment  |
| 2026-05-18 | 3.0     | Added Module Architecture       | Modularity       |
| 2026-05-18 | 3.0     | Added Deployment Pipeline       | Reliability      |
| 2026-05-18 | 3.0     | Added Monitoring & Alerts       | Proactive care   |
```

---

## XV. THE CLOSING STATEMENT

This architecture is not just code. It is the skeleton of Mindooo — the Life Operating System.

Every layer serves the mission:
- **Presentation Layer** → Mo sees clarity, not chaos
- **Intelligence Layer** → Mo gets personal insight, not generic advice
- **Retrieval Layer** → Mo's own words become his greatest teacher
- **Data Layer** → Mo's life story is safe, organized, and always accessible

Every technical decision answers to the seven principles:
- Science-Based → Every choice documented and justified
- Personal → Built for Mo's constraints first
- Never Crashes → Failovers at every layer
- Modular → Add without breaking
- Data-Safe → RLS, encryption, isolation
- Transparent AI → RAG shows sources, feedback exposes reasoning
- Progressive → The system learns and improves

**Mindooo is not built to be perfect. It is built to evolve.**

From chaos to clarity. From stuck to free. Now do more.

---

*This document is the definitive technical architecture of Mindooo. It is the single source of truth for all development decisions. It evolves with every session, but its core — the four layers, the modular system, the commitment to Mo — never changes.*

**Version**: 3.0 — The Synthesized Architecture  
**Synthesized**: May 18, 2026  
**Next Review**: Next session  
**Status**: Design Phase → Build Phase Transition  
**Brand**: Mindooo (three o's) — zero tolerance for "Mindoo"  
