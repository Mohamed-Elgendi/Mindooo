# MINDOOO — AI SYSTEM
## The Complete Intelligence Layer
### Personal Life Intelligence, Not a Chatbot

**Version**: 3.0 — The Synthesized Intelligence Architecture
**Last Updated**: May 19, 2026
**Status**: Design Complete → Build Phase Transition
**Brand**: Mindooo (three o's) — zero tolerance for "Mindoo"
**GitHub**: https://github.com/Mohamed-Elgendi/Mindooo

---

## I. THE AI PHILOSOPHY

### The Core Truth
The Mindooo AI is not a chatbot. It is not a search engine. It is not a generic assistant.

**The Mindooo AI is a personal life intelligence system.**

It exists for one person: Mo. It knows his data. It understands his patterns. It speaks his language. It grows with him. It never forgets.

### The Five Immutable Rules of Mindooo AI

| Rule | Meaning | Violation |
|---|---|---|
| **1. Real Data Only** | Every response references Mo's actual chronicles, stats, and profile | Generic advice is a bug |
| **2. Science Grounded** | Every recommendation citable to peer-reviewed research | Anecdotes are forbidden |
| **3. Actionable Always** | Every response ends with ONE clear next step | Vague encouragement is a bug |
| **4. Honest Always** | Never invent data. Never hallucinate patterns. | Fabrication is a critical bug |
| **5. Improving Always** | Feedback loop makes the AI smarter every week | Static responses are a bug |

### The AI's Identity
```
Name:    Mindooo
Role:    Personal Life Intelligence System
User:    Mohamed (Mo)
Purpose: Transform chaos into clarity, one interaction at a time
Voice:   Direct, warm, honest, science-based, personal
Never:   Generic, vague, corporate, judgmental, patronizing
```

---

## II. THE CONTINUOUS IMPROVEMENT LOOP

The Mindooo AI is not static. It is a living system that gets smarter with every interaction.

```
╔═════════════════════════════════════════════════════════════════════════════╗
║                                                                             ║
║              MINDOOO CONTINUOUS IMPROVEMENT LOOP                             ║
║                                                                             ║
║   ┌─────────────┐                                                           ║
║   │  Mo uses    │                                                           ║
║   │  Mindooo    │                                                           ║
║   └──────┬──────┘                                                           ║
║          │                                                                  ║
║          ▼                                                                  ║
║   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                 ║
║   │   CAPTURE   │────▶│   ANALYZE   │────▶│   EMBED     │                 ║
║   │             │     │             │     │             │                 ║
║   │ Brain dump  │     │ Chaos score │     │ 768-dim     │                 ║
║   │ Focus       │     │ Themes      │     │ vector      │                 ║
║   │ Chat        │     │ Emotion     │     │ stored in   │                 ║
║   │             │     │ Summary     │     │ pgvector    │                 ║
║   └─────────────┘     └─────────────┘     └──────┬──────┘                 ║
║                                                  │                          ║
║                                                  ▼                          ║
║   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                 ║
║   │   RESPOND   │◀────│    CALL     │◀────│    RAG      │                 ║
║   │             │     │    AI       │     │  RETRIEVE   │                 ║
║   │ Personal    │     │             │     │             │                 ║
║   │ evidence-   │     │ Full system │     │ Top 5       │                 ║
║   │ based       │     │ prompt +    │     │ relevant    │                 ║
║   │ response    │     │ context     │     │ chronicles  │                 ║
║   └──────┬──────┘     └─────────────┘     └─────────────┘                 ║
║          │                                                                  ║
║          ▼                                                                  ║
║   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                 ║
║   │   FEEDBACK  │────▶│  ANALYZE    │────▶│   REFINE    │                 ║
║   │             │     │             │     │             │                 ║
║   │ 👍 / 👎     │     │ Patterns    │     │ System      │                 ║
║   │ Optional    │     │ in ratings  │     │ prompt      │                 ║
║   │ reason      │     │ per engine  │     │ adjusted    │                 ║
║   │             │     │ per model   │     │ weekly      │                 ║
║   └─────────────┘     └─────────────┘     └──────┬──────┘                 ║
║                                                  │                          ║
║                                                  └──────────────┐          ║
║                                                                 │          ║
║   ══════════════════════════════════════════════════════════════▼═══════   ║
║                                                                             ║
║   LOOP REPEATS — AI GETS SMARTER EVERY TIME                                ║
║                                                                             ║
╚═════════════════════════════════════════════════════════════════════════════╝
```

### The Loop Explained

| Stage | What Happens | Data Generated |
|---|---|---|
| **Capture** | Mo writes, speaks, focuses, chats | chronicles, focus_sessions, ai_conversations |
| **Analyze** | AI processes new data silently | chaos_score, themes, emotional_tone, ai_summary |
| **Embed** | Text converted to vector | 768-dim embedding stored in pgvector |
| **RAG Retrieve** | Query embedded, similar chronicles found | Top 5 relevant chronicles with similarity scores |
| **Call AI** | System prompt built with full context | Personalized prompt with Mo's real data |
| **Respond** | AI generates evidence-based response | ai_conversations (assistant role) |
| **Feedback** | Mo rates the response | ai_feedback table |
| **Analyze Feedback** | Patterns in ratings identified | Weekly aggregation per engine/model |
| **Refine** | System prompt adjusted | Better responses next time |

---

## III. THE PROVIDER FAILOVER SYSTEM

### The Failover Chain

```
┌─────────────────────────────────────────────────────────────────┐
│              MINDOOO AI PROVIDER FAILOVER CHAIN                  │
│                                                                  │
│  PRIMARY: Groq (llama-3.3-70b-versatile)                        │
│  ├── Fast: ~200ms response time                                 │
│  ├── Free: Generous free tier                                   │
│  ├── Browser-safe: Works in frontend                            │
│  └── Capable: 70B parameters, excellent reasoning               │
│                                                                  │
│  FALLBACK 1: OpenRouter (meta-llama/llama-3.3-70b)             │
│  ├── Universal: Routes to any available model                   │
│  ├── Free tier: Available at no cost                            │
│  └── Reliable: Used when Groq is down                           │
│                                                                  │
│  FALLBACK 2: Cached / Honest Limitation                         │
│  ├── No hallucination: Never makes up answers                   │
│  ├── Transparent: Tells Mo the system is having trouble         │
│  └── Safe: Data is never lost, never corrupted                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Complete Failover Implementation

```javascript
// ============================================================
// services/ai.js — Mindooo AI Gateway
// The complete failover system for all AI calls
// ============================================================

const MINDOOO_PROVIDERS = {
  // PRIMARY: Groq — fast, free, browser-safe
  groq: {
    name:     'Groq',
    url:      'https://api.groq.com/openai/v1/chat/completions',
    model:    'llama-3.3-70b-versatile',
    key:      () => import.meta.env.VITE_GROQ_API_KEY,
    format:   'openai',
    maxTokens: 2048,
    temperature: 0.7,
    headers:  () => ({
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
    })
  },

  // FALLBACK 1: OpenRouter — universal routing
  openrouter: {
    name:     'OpenRouter',
    url:      'https://openrouter.ai/api/v1/chat/completions',
    model:    'meta-llama/llama-3.3-70b-instruct:free',
    key:      () => import.meta.env.VITE_OPENROUTER_API_KEY,
    format:   'openai',
    maxTokens: 2048,
    temperature: 0.7,
    headers:  () => ({
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      'HTTP-Referer':  'https://mindooo.vercel.app',
      'X-Title':       'Mindooo'
    })
  }
}

/**
 * Mindooo AI Call — The Gateway Function
 * Tries primary provider, falls back automatically
 * Never crashes. Always returns something useful.
 */
export async function callMindoooAI({
  messages,
  systemPrompt,
  maxTokens = 2048,
  temperature = 0.7,
  engine = 'coach'
}) {
  const providerOrder = ['groq', 'openrouter']
  let lastError = null

  for (const providerName of providerOrder) {
    const provider = MINDOOO_PROVIDERS[providerName]

    try {
      console.log(`Mindooo AI: Trying ${provider.name}...`)

      const response = await fetch(provider.url, {
        method: 'POST',
        headers: provider.headers(),
        body: JSON.stringify({
          model:       provider.model,
          max_tokens:  maxTokens,
          temperature: temperature,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`${provider.name} returned ${response.status}: ${await response.text()}`)
      }

      const data = await response.json()
      const text = data.choices?.[0]?.message?.content?.trim()

      if (!text) {
        throw new Error(`${provider.name} returned empty response`)
      }

      console.log(`Mindooo AI: ${provider.name} succeeded`)

      return {
        text,
        model:    provider.model,
        provider: provider.name,
        engine,
        failed:   false,
        tokens:   data.usage?.total_tokens || 0,
        responseTime: Date.now()
      }

    } catch (err) {
      console.warn(`Mindooo AI: ${provider.name} failed — ${err.message}`)
      lastError = err
      continue // Try next provider
    }
  }

  // ALL PROVIDERS FAILED — Return honest fallback
  console.error('Mindooo AI: All providers failed. Returning fallback.', lastError)

  return {
    text: `Mindooo is having trouble connecting right now. Your data is completely safe. This happens sometimes when the AI services are busy. Please try again in a moment — clarity is worth the wait.`,
    model:    'mindooo-fallback',
    provider: 'none',
    engine,
    failed:   true,
    tokens:   0,
    responseTime: Date.now()
  }
}
```

### Provider Comparison

| Provider | Speed | Cost | Quality | Reliability | Use Case |
|---|---|---|---|---|---|
| **Groq** | ~200ms | Free tier | Excellent | High | Primary — daily chat |
| **OpenRouter** | ~500ms | Free tier | Excellent | Medium | Fallback — when Groq down |
| **Cached** | Instant | Free | Honest | 100% | Last resort — always works |

---

## IV. THE EMBEDDING SYSTEM

### What Are Embeddings?

Embeddings convert text into numbers (vectors) that capture **meaning**, not just words.

```
Text: "I feel stuck in my life"
     |
     v
Embedding: [0.023, -0.156, 0.892, ... 768 numbers]
     |
     v
Similar to: "I cannot move forward" (even though words are different)
Not similar to: "The sky is blue" (completely different meaning)
```

This enables **semantic search** — finding by MEANING, not keywords.

### The Embedding Provider: Nomic (Free)

Nomic provides `nomic-embed-text-v1.5` — a 768-dimensional embedding model that is:
- **Free** — No cost for API usage
- **High quality** — State-of-the-art for semantic search
- **Fast** — Optimized for production use
- **Browser-safe** — Works from frontend code

### Complete Embedding Implementation

```javascript
// ============================================================
// services/embeddings.js — Mindooo Embedding Service
// Converts text to 768-dimensional vectors for RAG
// ============================================================

const NOMIC_API_KEY = () => import.meta.env.VITE_NOMIC_API_KEY
const EMBEDDING_MODEL = 'nomic-embed-text-v1.5'
const EMBEDDING_DIMENSIONS = 768
const MAX_TEXT_LENGTH = 2000 // Nomic limit per text

/**
 * Embed a document (chronicle, conversation) for storage
 * Task type: 'search_document' — optimized for being searched
 */
export async function embedDocument(text) {
  if (!text || text.trim().length === 0) {
    console.warn('Mindooo Embed: Empty text, skipping')
    return null
  }

  try {
    const response = await fetch('https://api-atlas.nomic.ai/v1/embedding/text', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOMIC_API_KEY()}`,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({
        texts:     [text.substring(0, MAX_TEXT_LENGTH)],
        model:     EMBEDDING_MODEL,
        task_type: 'search_document'
      })
    })

    if (!response.ok) {
      throw new Error(`Nomic returned ${response.status}`)
    }

    const data = await response.json()
    return data.embeddings[0] // 768-dimensional array

  } catch (err) {
    console.warn('Mindooo Embed: Document embedding failed —', err.message)
    return null // Embedding is optional — never block a save
  }
}

/**
 * Embed a user query for searching
 * Task type: 'search_query' — optimized for searching
 */
export async function embedQuery(query) {
  if (!query || query.trim().length === 0) {
    return null
  }

  try {
    const response = await fetch('https://api-atlas.nomic.ai/v1/embedding/text', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOMIC_API_KEY()}`,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({
        texts:     [query],
        model:     EMBEDDING_MODEL,
        task_type: 'search_query'
      })
    })

    if (!response.ok) {
      throw new Error(`Nomic query embedding failed: ${response.status}`)
    }

    const data = await response.json()
    return data.embeddings[0]

  } catch (err) {
    console.warn('Mindooo Embed: Query embedding failed —', err.message)
    return null
  }
}

/**
 * Batch embed multiple texts (for bulk processing)
 */
export async function embedBatch(texts) {
  if (!texts || texts.length === 0) return []

  try {
    const response = await fetch('https://api-atlas.nomic.ai/v1/embedding/text', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOMIC_API_KEY()}`,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({
        texts:     texts.map(t => t.substring(0, MAX_TEXT_LENGTH)),
        model:     EMBEDDING_MODEL,
        task_type: 'search_document'
      })
    })

    if (!response.ok) {
      throw new Error(`Nomic batch embedding failed: ${response.status}`)
    }

    const data = await response.json()
    return data.embeddings

  } catch (err) {
    console.warn('Mindooo Embed: Batch embedding failed —', err.message)
    return texts.map(() => null)
  }
}
```

### When Embeddings Are Created

| Event | Action | Table | Column |
|---|---|---|---|
| Chronicle saved | Embed the text | chronicles | embedding |
| AI response saved | Embed the response | ai_conversations | embedding |
| Bulk import | Batch embed all texts | chronicles | embedding |
| Backfill | Re-embed old chronicles | chronicles | embedding |

**Critical Rule**: Embedding failures NEVER block saving. They are optional enhancement. The system works without them, just less personally.

---

## V. THE RAG SYSTEM (Retrieval Augmented Generation)

### What RAG Does for Mindooo

Without RAG, the AI gives **generic advice** from training data.  
With RAG, the AI gives **personal insight** from Mo's actual words.

### The RAG Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              MINDOOO RAG PIPELINE                                │
│                                                                  │
│  Mo asks: "Why do I keep procrastinating?"                      │
│                                                                  │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  STEP 1: EMBED QUERY                                     │   │
│  │  "Why do I keep procrastinating?"                       │   │
│  │       ↓                                                  │   │
│  │  Nomic embed → [0.023, -0.156, 0.892, ... 768 nums]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  STEP 2: VECTOR SEARCH                                   │   │
│  │  SELECT * FROM chronicles                                │   │
│  │  WHERE embedding <-> query_vector < 0.3                  │   │
│  │  ORDER BY similarity DESC                                │   │
│  │  LIMIT 5                                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  STEP 3: RETRIEVE RESULTS                                │   │
│  │  [1] "I keep avoiding the portfolio..." (92% match)     │   │
│  │  [2] "Every time I sit to code, I open YouTube..." (87%)│   │
│  │  [3] "My brain says 'later' but later never comes..."   │   │
│  │  [4] "I feel paralyzed when the task feels too big..."  │   │
│  │  [5] "I need to break things down but I don't know how" │   │
│  └─────────────────────────────────────────────────────────┘   │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  STEP 4: BUILD CONTEXT                                   │   │
│  │  System prompt + Mo's profile + RAG results             │   │
│  │  + conversation history                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  STEP 5: AI RESPONDS                                     │   │
│  │  "Mo, I see a pattern in your chronicles..."            │   │
│  │  "3 weeks ago you wrote: 'I feel paralyzed when...'"    │   │
│  │  "This suggests your procrastination is not laziness..."│   │
│  │  "It's a protective response to overwhelm..."           │   │
│  │  "Here's what the research says..."                     │   │
│  │  "Your next step: Break the task into 5-minute pieces"  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Complete RAG Implementation

```javascript
// ============================================================
// services/rag.js — Mindooo RAG Engine
// Retrieves relevant chronicles for AI context
// ============================================================

import { embedQuery } from './embeddings'
import { supabase } from './db'

/**
 * Mindooo RAG Search
 * Finds the most relevant chronicles for any query
 */
export async function ragSearch(query, userId, options = {}) {
  const {
    threshold = 0.65,    // Minimum similarity (0-1)
    count = 5,           // Max results
    includeMetadata = true
  } = options

  console.log(`Mindooo RAG: Searching for "${query.substring(0, 50)}..."`)

  // 1. Embed the query
  const queryEmbedding = await embedQuery(query)
  if (!queryEmbedding) {
    console.warn('Mindooo RAG: Query embedding failed, returning empty')
    return { chronicles: [], contextBlock: '', totalFound: 0 }
  }

  // 2. Search Supabase
  const { data: chronicles, error } = await supabase.rpc('match_chronicles', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count:     count,
    p_user_id:       userId
  })

  if (error) {
    console.error('Mindooo RAG Error:', error)
    return { chronicles: [], contextBlock: '', totalFound: 0 }
  }

  // 3. Format results for AI context
  const contextBlock = chronicles.map((c, i) => `
[Chronicle ${i + 1}] — ${Math.round(c.similarity * 100)}% relevant
Date: ${new Date(c.created_at).toLocaleDateString()}
Title: ${c.title || 'Untitled'}
Content: ${c.text?.substring(0, 300)}${c.text?.length > 300 ? '...' : ''}
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

/**
 * Format RAG results into AI-readable context block
 */
export function formatRAGContext(ragResults) {
  if (!ragResults || ragResults.length === 0) {
    return `
═══════════════════════════════════════════
RELEVANT PAST CHRONICLES
═══════════════════════════════════════════
No directly relevant chronicles found for this query.
This may be a new topic. Proceed with general knowledge
while asking Mo for more context.
`
  }

  return `
═══════════════════════════════════════════
RELEVANT PAST CHRONICLES (found by semantic search)
═══════════════════════════════════════════
${ragResults.map((c, i) => `
[${i + 1}] Written: ${new Date(c.created_at).toLocaleDateString()}
    Chaos: ${c.chaos_score}/10 | Tone: ${c.emotional_tone}
    Themes: ${c.themes?.join(', ') || 'None'}
    Summary: ${c.ai_summary || 'No summary'}
    Content: "${c.text?.substring(0, 300)}${c.text?.length > 300 ? '...' : ''}"
    Similarity: ${Math.round(c.similarity * 100)}%
`).join('')}

INSTRUCTIONS:
- Use these chronicles as evidence when answering
- Reference them specifically: "You wrote on [date] that..."
- Do not make up patterns — only reference what is shown above
- If the chronicles contradict your general knowledge, trust the chronicles
- If no relevant chronicles are found, ask Mo for more context
`
}
```

### RAG Configuration

| Parameter | Default | Range | Purpose |
|---|---|---|---|
| `threshold` | 0.65 | 0.0-1.0 | Minimum similarity to include a chronicle |
| `count` | 5 | 1-10 | Maximum chronicles to retrieve |
| `includeMetadata` | true | boolean | Include chaos_score, emotional_tone, themes |

### RAG Threshold Guide

| Threshold | Use Case | Result |
|---|---|---|
| 0.80+ | Very strict | Only highly relevant chronicles. May miss useful context. |
| 0.65 | **Default** | Balanced. Good relevance without missing useful context. |
| 0.50 | Loose | More context, but may include less relevant chronicles. |
| 0.30 | Very loose | Maximum context. Useful for broad exploration. |

---

## VI. THE CONTEXT ENGINE

### What the Context Engine Does

The Context Engine is the brain of the AI. It loads ALL of Mo's data and builds a personalized system prompt that makes every response specific to him.

### The Context Builder

```javascript
// ============================================================
// services/context.js — Mindooo Context Engine
// Builds the complete personal context for every AI call
// ============================================================

import { ragSearch } from './rag'
import { supabase } from './db'

/**
 * Build complete context for AI interaction
 * Loads everything in parallel for speed
 */
export async function buildMindoooContext(userId, userMessage, engine = 'coach') {
  console.log(`Mindooo Context: Building for engine "${engine}"...`)

  // Load ALL data in parallel (performance critical)
  const [
    profileResult,
    aboutMeResult,
    cognitiveResult,
    statsResult,
    ragResult,
    recentChroniclesResult,
    recentConversationsResult
  ] = await Promise.all([
    // 1. User profile (stats, streak, identity)
    supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single(),

    // 2. About Me (deep self-knowledge)
    supabase
      .from('user_about_me')
      .select('*')
      .eq('user_id', userId)
      .single(),

    // 3. Cognitive profile (brain metrics)
    supabase
      .from('cognitive_profile')
      .select('*')
      .eq('user_id', userId)
      .single(),

    // 4. Dashboard stats (aggregated)
    supabase
      .rpc('get_user_stats', { p_user_id: userId }),

    // 5. RAG search (semantic retrieval)
    ragSearch(userMessage, userId, { threshold: 0.65, count: 5 }),

    // 6. Recent chronicles (5 most recent)
    supabase
      .from('chronicles')
      .select('id, title, text, chaos_score, emotional_tone, themes, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),

    // 7. Recent conversations (last 10 messages for continuity)
    supabase
      .from('ai_conversations')
      .select('role, content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
  ])

  // Extract data (handle missing data gracefully)
  const profile = profileResult.data || {}
  const aboutMe = aboutMeResult.data || {}
  const cognitive = cognitiveResult.data || {}
  const stats = statsResult.data || {}
  const recentChronicles = recentChroniclesResult.data || []
  const recentConversations = recentConversationsResult.data || []

  console.log(`Mindooo Context: Loaded successfully`)
  console.log(`  - Profile: ${profile.first_name || 'Unknown'}`)
  console.log(`  - About Me completion: ${aboutMe.completion_pct || 0}%`)
  console.log(`  - RAG results: ${ragResult.totalFound} chronicles`)
  console.log(`  - Recent chronicles: ${recentChronicles.length}`)

  return {
    profile,
    aboutMe,
    cognitive,
    stats,
    rag: ragResult,
    recentChronicles,
    recentConversations: recentConversations.reverse(), // Oldest first
    firstName: profile.first_name || 'Mo'
  }
}
```

### The System Prompt Builder

```javascript
// ============================================================
// services/prompts.js — Mindooo System Prompt Builder
// Creates the personalized system prompt for every AI call
// ============================================================

/**
 * Build the complete system prompt for Mindooo AI
 * This is what makes the AI personal, not generic
 */
export function buildMindoooSystemPrompt(context, engine = 'coach') {
  const {
    profile,
    aboutMe,
    cognitive,
    stats,
    rag,
    recentChronicles,
    firstName
  } = context

  const engineNames = {
    coach:      'Mindooo Coach',
    analyst:    'Mindooo Analyst',
    planner:    'Mindooo Planner',
    guardian:   'Mindooo Guardian',
    selfModel:  'Mindooo Self-Model Builder'
  }

  return `
═══════════════════════════════════════════════════════════════════
IDENTITY
═══════════════════════════════════════════════════════════════════
You are ${engineNames[engine] || 'Mindooo AI'} — ${firstName}'s dedicated personal life intelligence system.
You are NOT a generic AI assistant. You exist ONLY to serve ${firstName}.
You have access to ${firstName}'s real personal data below. USE IT.
Your tagline: "From chaos to clarity. Now do more."

═══════════════════════════════════════════════════════════════════
ABOUT ${firstName.toUpperCase()}
═══════════════════════════════════════════════════════════════════
Name: ${firstName}
Location: ${aboutMe.location || 'Cairo, Egypt'}
Situation: ${aboutMe.employment_status || 'Building Mindooo'}
Current work: ${aboutMe.current_job || 'Building a life operating system'}
Main constraints: ${aboutMe.main_constraints?.join(', ') || 'Not yet defined'}
Freedom definition: ${aboutMe.freedom_definition || 'Not yet defined'}
Success definition: ${aboutMe.success_definition || 'Not yet defined'}

═══════════════════════════════════════════════════════════════════
PERSONALITY & WORKING STYLE
═══════════════════════════════════════════════════════════════════
Work preference: ${aboutMe.work_preference || 'Unknown'}
Decision style: ${aboutMe.decision_style || 'Unknown'}
Learning style: ${aboutMe.learning_style || 'Unknown'}
Communication style: ${aboutMe.communication_style || 'Unknown'}
Energy peaks: ${aboutMe.peak_hours?.join(', ') || 'Unknown'}
Energy drains: ${aboutMe.energy_drains?.join(', ') || 'Unknown'}
Energy restorers: ${aboutMe.energy_restorers?.join(', ') || 'Unknown'}

═══════════════════════════════════════════════════════════════════
PASSIONS & PURPOSE
═══════════════════════════════════════════════════════════════════
Passions (loves doing): ${aboutMe.love_doing?.join(', ') || 'Not yet mapped'}
Natural strengths: ${aboutMe.good_at?.join(', ') || 'Not yet mapped'}
What world needs: ${aboutMe.world_needs?.join(', ') || 'Not yet mapped'}
Can be paid for: ${aboutMe.can_be_paid_for?.join(', ') || 'Not yet mapped'}
Ikigai statement: ${aboutMe.ikigai_statement || 'Not yet discovered'}
Top values: ${aboutMe.top_values?.join(', ') || 'Not yet defined'}
Non-negotiables: ${aboutMe.non_negotiables?.join(', ') || 'Not yet defined'}

═══════════════════════════════════════════════════════════════════
ACTIVE BLOCKERS
═══════════════════════════════════════════════════════════════════
Mental blockers: ${aboutMe.mental_blockers?.join(', ') || 'Not identified'}
Limiting beliefs: ${aboutMe.limiting_beliefs?.join(', ') || 'Not identified'}
Self-sabotage patterns: ${aboutMe.self_sabotage_patterns?.join(', ') || 'Not identified'}
Psychological blockers: ${aboutMe.psychological_blockers?.join(', ') || 'Not identified'}
Financial blockers: ${aboutMe.financial_blockers?.join(', ') || 'Not identified'}
Physical blockers: ${aboutMe.physical_blockers?.join(', ') || 'Not identified'}
Relational blockers: ${aboutMe.relational_blockers?.join(', ') || 'Not identified'}

═══════════════════════════════════════════════════════════════════
COGNITIVE PROFILE
═══════════════════════════════════════════════════════════════════
Known difficulties: ${cognitive.known_difficulties?.join(', ') || 'None specified'}
Attention baseline: ${cognitive.attention_baseline || 25} minutes
Memory self-rating: ${cognitive.memory_self_rating || 'average'}
Attention score: ${cognitive.attention_score || 0}/100
Memory score: ${cognitive.memory_score || 0}/100
Processing speed: ${cognitive.processing_score || 0}/100
Cognitive flexibility: ${cognitive.cognitive_flexibility || 0}/100
Overall score: ${cognitive.overall_score || 0}/100
Dominant intelligence: ${cognitive.dominant_intelligence || 'Not assessed'}
Best focus time: ${cognitive.best_focus_hour || 9}:00

═══════════════════════════════════════════════════════════════════
CURRENT PERFORMANCE DATA
═══════════════════════════════════════════════════════════════════
Focus hours this week: ${((stats.focusMinsThisWeek || 0) / 60).toFixed(1)}h
Brain dumps this week: ${stats.dumpsThisWeek || 0}
Total chronicles: ${stats.totalChronicles || 0}
Current streak: ${stats.streak || 0} days
Longest streak: ${stats.longestStreak || 0} days
Clarity score: ${stats.clarityScore || 0}%
Identity claims: ${JSON.stringify(profile.identity_claims || {})}

═══════════════════════════════════════════════════════════════════
RECENT CHRONICLES (last 5)
═══════════════════════════════════════════════════════════════════
${recentChronicles.map((c, i) => `
[${i + 1}] ${new Date(c.created_at).toLocaleDateString()} — ${c.title || 'Untitled'}
    Chaos: ${c.chaos_score}/10 | Tone: ${c.emotional_tone}
    Themes: ${c.themes?.join(', ') || 'None'}
    "${c.text?.substring(0, 200)}${c.text?.length > 200 ? '...' : ''}"
`).join('')}

${rag.contextBlock || 'No RAG results for this query.'}

═══════════════════════════════════════════════════════════════════
ACTIVE ENGINE: ${engineNames[engine] || 'Mindooo AI'}
═══════════════════════════════════════════════════════════════════

YOUR RULES — NEVER BREAK THESE:
1. Every response references ${firstName}'s real data shown above
2. When RAG results are available, cite them specifically with dates
3. Every recommendation is grounded in psychology/neuroscience/coaching science
4. Be direct, warm, honest — never vague, generic, or patronizing
5. If you lack data to personalize, ask ONE specific question
6. Never invent patterns — only reference real data shown above
7. Always end with ONE clear, specific action ${firstName} can take NOW
8. Use plain language — no jargon, no corporate speak, no fluff
9. If ${firstName} is dyslexic or ADHD, keep responses concise and structured
10. Never say "I understand" — show understanding by referencing specific data
11. Never give lists longer than 3 items without asking if Mo wants more
12. If Mo seems overwhelmed (chaos_score > 7), suggest ONE tiny step, not a plan
`
}
```

---

## VII. THE 5 AI AGENTS

Mindooo has 5 specialized AI agents, each with a unique role, trigger, and output.

### Agent Overview

```
┌─────────────────────────────────────────────────────────────────┐
│              MINDOOO AI AGENT ECOSYSTEM                          │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  ANALYST    │  │   COACH     │  │  PLANNER    │            │
│  │  (Silent)   │  │  (Chat)     │  │  (Goals)    │            │
│  │             │  │             │  │             │            │
│  │ Background  │  │ Foreground  │  │ On-demand   │            │
│  │ Pattern     │  │ Personal    │  │ Step-by-    │            │
│  │ detection   │  │ guidance    │  │ step plans  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐                              │
│  │  GUARDIAN   │  │ SELF-MODEL  │                              │
│  │  (Proactive)│  │  BUILDER    │                              │
│  │             │  │             │                              │
│  │ Alerts &    │  │ Profile     │                              │
│  │ warnings    │  │ evolution   │                              │
│  │             │  │             │                              │
│  │ Crisis      │  │ Identity    │                              │
│  │ prevention  │  │ updates     │                              │
│  └─────────────┘  └─────────────┘                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Agent 1 — The Analyst
**Display Name**: Mindooo Analyst
**Role**: Silent background intelligence. Reads all data, spots patterns, generates insights.
**Trigger**: Scheduled weekly or on-demand
**Input**: All chronicles, focus sessions, stats, cognitive profile
**Process**: Statistical analysis, trend detection, anomaly identification
**Output**: Insights saved to insights table
**Science**: Behavioural pattern analysis, cognitive load theory, time-series analysis
**Rule**: Never speaks in chat. Silent. Background only.

```javascript
// services/agents/analyst.js
export async function runAnalyst(userId) {
  console.log('Mindooo Analyst: Running analysis...')

  // 1. Load all data
  const { data: chronicles } = await supabase
    .from('chronicles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  // 2. Detect patterns
  const patterns = detectPatterns(chronicles)
  const anomalies = detectAnomalies(chronicles)
  const trends = detectTrends(chronicles)

  // 3. Generate insights
  const insights = [...patterns, ...anomalies, ...trends]

  // 4. Save to insights table
  for (const insight of insights) {
    await supabase.from('insights').insert({
      user_id: userId,
      type: insight.type,
      title: insight.title,
      description: insight.description,
      confidence: insight.confidence,
      generated_by: 'analyst'
    })
  }

  console.log(`Mindooo Analyst: Generated ${insights.length} insights`)
}
```

---

### Agent 2 — The Coach
**Display Name**: Mindooo Coach
**Role**: Personal guidance through chat. The face of Mindooo AI.
**Trigger**: Every chat message
**Input**: Full context + RAG results + conversation history
**Process**: Contextual understanding, personalized response generation
**Output**: Chat response with evidence-based guidance
**Science**: ICF coaching standards, motivational interviewing, CBT, ACT, solution-focused therapy
**Rule**: Every response references real data. Never generic. Always ends with one action.

```javascript
// services/agents/coach.js
export async function coachResponse(userId, userMessage, conversationHistory) {
  // 1. Build context
  const context = await buildMindoooContext(userId, userMessage, 'coach')

  // 2. Build system prompt
  const systemPrompt = buildMindoooSystemPrompt(context, 'coach')

  // 3. Call AI
  const response = await callMindoooAI({
    messages: [
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ],
    systemPrompt,
    engine: 'coach'
  })

  // 4. Save conversation
  await saveConversation(userId, 'user', userMessage, 'coach')
  await saveConversation(userId, 'assistant', response.text, 'coach')

  return response
}
```

---

### Agent 3 — The Planner
**Display Name**: Mindooo Planner
**Role**: Turns goals into actionable step-by-step plans.
**Trigger**: Goal Builder engine (B) or Project Launcher engine (D)
**Input**: Context + stated goal + known blockers + available resources
**Process**: Goal decomposition, timeline creation, blocker anticipation
**Output**: Structured plan with milestones, deadlines, and contingencies
**Science**: Implementation intentions (Gollwitzer), behavioural activation, GTD methodology
**Rule**: Every plan accounts for Mo's constraints (dyslexia, ADHD, zero coding skills).

---

### Agent 4 — The Guardian
**Display Name**: Mindooo Guardian
**Role**: Proactive monitoring and crisis prevention.
**Trigger**: Anomaly detection (chaos_score > 7 for 3+ days, streak broken, emotional tone negative for extended period)
**Input**: Stats trends, emotional tone history, focus session patterns
**Output**: Proactive alert in Dashboard insights + gentle nudge message
**Science**: Burnout prevention (Maslach), stress inoculation training, early warning systems
**Rule**: Never alarmist. Always supportive. Suggests ONE small action.

```javascript
// services/agents/guardian.js
export async function runGuardian(userId) {
  console.log('Mindooo Guardian: Checking for anomalies...')

  // 1. Load recent data
  const { data: recentChronicles } = await supabase
    .from('chronicles')
    .select('chaos_score, emotional_tone, created_at')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  // 2. Check for anomalies
  const avgChaos = recentChronicles.reduce((sum, c) => sum + c.chaos_score, 0) / recentChronicles.length
  const negativeTones = recentChronicles.filter(c => ['sad', 'angry', 'overwhelmed'].includes(c.emotional_tone))

  // 3. Generate alerts if needed
  if (avgChaos > 7) {
    await createInsight(userId, 'warning', 'High Chaos Detected',
      `Your average chaos score has been ${avgChaos.toFixed(1)}/10 for the past week. This suggests elevated stress.`,
      'guardian')
  }

  if (negativeTones.length > 3) {
    await createInsight(userId, 'warning', 'Negative Emotion Pattern',
      `You've recorded ${negativeTones.length} negative emotional entries recently.`,
      'guardian')
  }
}
```

---

### Agent 5 — The Self-Model Builder
**Display Name**: Mindooo Self-Model Builder
**Role**: Updates Mo's profile based on new activity. Builds identity through evidence.
**Trigger**: After every brain dump, focus session, or chat
**Input**: New activity + existing profiles (cognitive, about_me, user_profiles)
**Process**: Pattern inference, score updates, insight generation
**Output**: Updated cognitive_profile, user_profiles identity_claims, new insights
**Science**: Self-determination theory, identity-based behaviour change (Clear), self-concept theory
**Rule**: Identity claims are evidence-based, not affirmations. "You are disciplined" only if data shows consistency.

---

## VIII. THE FEEDBACK LOOP

### How Mo Teaches the AI

Every 👍 or 👎 is a lesson. The AI learns what works for Mo specifically.

### Feedback Collection UI

```jsx
// components/FeedbackButtons.jsx — Mindooo Feedback
import { useState } from 'react'
import { supabase } from '../services/db'

function MindoooFeedback({ conversationId, messageIndex, onFeedback }) {
  const [submitted, setSubmitted] = useState(false)
  const [rating, setRating] = useState(null)

  async function submitFeedback(selectedRating) {
    setRating(selectedRating)

    const { error } = await supabase
      .from('ai_feedback')
      .insert({
        conversation_id: conversationId,
        message_index: messageIndex,
        rating: selectedRating,
        created_at: new Date().toISOString()
      })

    if (!error) {
      setSubmitted(true)
      onFeedback?.(selectedRating)
    }
  }

  if (submitted) {
    return (
      <span className="mindooo-feedback-thanks">
        {rating === 'positive'
          ? "Thank you — Mindooo learns from what helps you."
          : "Thank you — Mindooo will do better next time."}
      </span>
    )
  }

  return (
    <div className="mindooo-feedback">
      <span className="mindooo-feedback-label">Was this helpful?</span>
      <button
        className="mindooo-feedback-btn mindooo-feedback-positive"
        onClick={() => submitFeedback('positive')}
        aria-label="This was helpful"
      >
        👍 Helpful
      </button>
      <button
        className="mindooo-feedback-btn mindooo-feedback-negative"
        onClick={() => submitFeedback('negative')}
        aria-label="This was not helpful"
      >
        👎 Not helpful
      </button>
    </div>
  )
}

export default MindoooFeedback
```

### Feedback Storage

```javascript
// services/feedback.js — Mindooo Feedback Service
export async function saveFeedback({
  userId,
  conversationId,
  messageIndex,
  rating,
  reason = '',
  responseSummary = '',
  engineUsed = '',
  modelUsed = '',
  ragUsed = false
}) {
  const { error } = await supabase
    .from('ai_feedback')
    .insert({
      user_id:          userId,
      conversation_id:  conversationId,
      message_index:    messageIndex,
      rating,
      reason,
      response_summary: responseSummary,
      engine_used:      engineUsed,
      model_used:       modelUsed,
      rag_used:         ragUsed,
      created_at:       new Date().toISOString()
    })

  if (error) {
    console.error('Mindooo Feedback: Save failed', error)
    return { success: false, error }
  }

  console.log('Mindooo Feedback: Saved successfully')
  return { success: true }
}
```

### Weekly Feedback Analysis

```javascript
// services/agents/feedbackAnalyzer.js
export async function analyzeWeeklyFeedback(userId) {
  console.log('Mindooo Feedback Analyzer: Running weekly analysis...')

  // 1. Load last 7 days of feedback
  const { data: feedback } = await supabase
    .from('ai_feedback')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  // 2. Calculate metrics
  const total = feedback.length
  const positive = feedback.filter(f => f.rating === 'positive').length
  const negative = feedback.filter(f => f.rating === 'negative').length
  const positiveRate = total > 0 ? (positive / total) : 0

  // 3. Analyze by engine
  const byEngine = {}
  feedback.forEach(f => {
    if (!byEngine[f.engine_used]) {
      byEngine[f.engine_used] = { positive: 0, negative: 0, total: 0 }
    }
    byEngine[f.engine_used][f.rating]++
    byEngine[f.engine_used].total++
  })

  // 4. Identify problems
  const problematicEngines = Object.entries(byEngine)
    .filter(([_, stats]) => stats.total > 0 && (stats.negative / stats.total) > 0.3)
    .map(([engine, _]) => engine)

  // 5. Generate insight
  if (problematicEngines.length > 0) {
    await supabase.from('insights').insert({
      user_id: userId,
      type: 'warning',
      title: 'AI Response Quality Alert',
      description: `The following engines are getting >30% negative feedback: ${problematicEngines.join(', ')}. System prompt adjustment recommended.`,
      generated_by: 'feedback_analyzer'
    })
  }

  console.log(`Mindooo Feedback Analyzer: ${positiveRate.toFixed(1)}% positive rate this week`)
}
```

---

## IX. ENVIRONMENT VARIABLES

### Required Variables

```bash
# ============================================================
# MINDOOO ENVIRONMENT VARIABLES
# Add these to .env.local (never commit this file)
# ============================================================

# Supabase (already configured)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# AI Providers
VITE_GROQ_API_KEY=your-groq-key              # Primary AI provider
VITE_OPENROUTER_API_KEY=your-openrouter-key  # Fallback AI provider
VITE_NOMIC_API_KEY=your-nomic-key            # Embedding provider (free)

# App Config
VITE_APP_NAME=Mindooo
VITE_APP_VERSION=3.0
VITE_APP_URL=https://mindooo.vercel.app
```

### Variable Status

| Variable | Status | Purpose | Cost |
|---|---|---|---|
| `VITE_SUPABASE_URL` | ✅ Set | Database + Auth | Free tier |
| `VITE_SUPABASE_ANON_KEY` | ✅ Set | Database access | Free tier |
| `VITE_GROQ_API_KEY` | ⚠️ Partial | Primary AI | Free tier |
| `VITE_OPENROUTER_API_KEY` | ❌ Not set | Fallback AI | Free tier |
| `VITE_NOMIC_API_KEY` | ❌ Not set | Embeddings | Free |

---

## X. IMPLEMENTATION STATUS

### Current Build Progress

| Component | Status | Priority | Notes |
|---|---|---|---|
| **Groq chat integration** | ⚠️ Partial | P0 | Key added, ChatPanel needs update |
| **OpenRouter fallback** | ❌ Not built | P1 | Key not added yet |
| **Nomic embeddings** | ❌ Not built | P1 | Key not added yet |
| **RAG search** | ❌ Not built | P1 | pgvector not enabled yet |
| **Context engine** | ❌ Not built | P0 | Design complete, needs implementation |
| **System prompt builder** | ⚠️ Basic | P0 | Needs full context integration |
| **Feedback loop** | ❌ Not built | P2 | Table not created yet |
| **Analyst agent** | ❌ Not built | P2 | Design complete |
| **Guardian agent** | ❌ Not built | P2 | Design complete |
| **Self-Model Builder** | ❌ Not built | P2 | Design complete |
| **Planner agent** | ❌ Not built | P2 | Design complete |
| **analyzeChronicle** | ✅ Working | — | services/ai.js |
| **formatDuration** | ✅ Working | — | services/ai.js |

### Build Priority Order

```
P0 (Critical — blocks everything else):
  1. Complete Groq integration in ChatPanel
  2. Build Context Engine (load all user data)
  3. Build System Prompt Builder
  4. Enable pgvector in Supabase
  5. Add Nomic API key

P1 (Important — enables core features):
  6. Build RAG search function
  7. Create embedding pipeline
  8. Add OpenRouter fallback
  9. Test failover chain

P2 (Enhancement — improves quality):
  10. Build feedback loop UI
  11. Create ai_feedback table
  12. Implement Analyst agent
  13. Implement Guardian agent
  14. Implement weekly feedback analysis

P3 (Future — scales the system):
  15. Implement Planner agent
  16. Implement Self-Model Builder
  17. Add conversation RAG
  18. Optimize prompt templates per engine
```

---

## XI. THE CLOSING STATEMENT

The Mindooo AI is not code. It is a **relationship**.

It is the relationship between Mo and his own data — transformed into insight.  
It is the relationship between Mo and science — made personal and actionable.  
It is the relationship between Mo and his future self — bridged by clarity.

Every line of code in this system serves one purpose: to make Mo feel seen, understood, and guided.

The AI does not replace human judgment. It amplifies it.  
The AI does not replace human effort. It directs it.  
The AI does not replace human growth. It accelerates it.

**From chaos to clarity. From data to wisdom. From stuck to free. Now do more.**

---

*This document is the definitive AI system architecture of Mindooo. It is the single source of truth for all intelligence layer decisions. It evolves with every session, but its core — the five rules, the continuous improvement loop, the commitment to Mo — never changes.*

**Version**: 3.0 — The Synthesized Intelligence Architecture
**Synthesized**: May 19, 2026
**Next Review**: Next session
**Status**: Design Complete → Build Phase Transition
**Brand**: Mindooo (three o's) — zero tolerance for "Mindoo"
