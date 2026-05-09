# 03 — AI SYSTEM
## The Complete Intelligence Layer
**Last Updated**: April 5, 2026
**Version**: 2.0 — RAG + Embeddings + Feedback Loop
**Status**: Design Phase — Partially built

---

## Core Principle

The AI is not a chatbot. It is a personal life intelligence system.
Every response must be:
1. Based on Mo's REAL data — retrieved via RAG from his chronicles
2. Grounded in science — every recommendation citable to research
3. Actionable — always ends with one clear next step
4. Honest — never invents data it does not have
5. Improving — feedback loop makes it smarter over time

---

## The Continuous Improvement Loop

```
Mo uses Mindoo (writes, focuses, chats)
           ↓
    Data generated and stored
           ↓
   Embeddings created (vectors)
           ↓
  RAG retrieves relevant context
           ↓
  AI responds with personal context
           ↓
     Mo rates the response
           ↓
  Feedback stored and analysed
           ↓
   System prompt refined weekly
           ↓
    AI gets smarter for Mo
           ↓
     (loop continues)
```

---

## Provider Failover System

```javascript
// services/ai.js — complete failover implementation

const PROVIDERS = {
  groq: {
    url:   'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    key:   () => import.meta.env.VITE_GROQ_API_KEY,
    format: 'openai'  // OpenAI-compatible API
  },
  openrouter: {
    url:   'https://openrouter.ai/api/v1/chat/completions',
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    key:   () => import.meta.env.VITE_OPENROUTER_API_KEY,
    format: 'openai'
  }
}

export async function callAI({ messages, systemPrompt, maxTokens = 1000 }) {
  for (const [name, provider] of Object.entries(PROVIDERS)) {
    try {
      const response = await fetch(provider.url, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${provider.key()}`
        },
        body: JSON.stringify({
          model:       provider.model,
          max_tokens:  maxTokens,
          temperature: 0.7,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ]
        })
      })

      if (!response.ok) throw new Error(`${name} returned ${response.status}`)

      const data  = await response.json()
      const text  = data.choices?.[0]?.message?.content || ''
      if (!text) throw new Error(`${name} returned empty response`)

      return { text, model: provider.model, provider: name, failed: false }

    } catch (err) {
      console.warn(`AI provider ${name} failed:`, err.message)
      continue
    }
  }

  // All providers failed
  return {
    text: "I am having trouble connecting right now. Your data is safe. Please try again in a moment.",
    model: 'fallback',
    provider: 'none',
    failed: true
  }
}
```

---

## Embedding System

### What Are Embeddings
Text converted to numbers (vectors) that capture meaning.
"I feel stuck" and "unable to move forward" get similar vectors
even though the words are completely different.
This allows semantic search — find by MEANING not keywords.

### Embedding Provider: Nomic (Free)
```javascript
// services/ai.js
export async function embedText(text) {
  try {
    const response = await fetch('https://api-atlas.nomic.ai/v1/embedding/text', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_NOMIC_API_KEY}`,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({
        texts:  [text.substring(0, 2000)], // Nomic limit
        model:  'nomic-embed-text-v1.5',
        task_type: 'search_document'
      })
    })

    if (!response.ok) throw new Error('Nomic embedding failed')
    const data = await response.json()
    return data.embeddings[0]  // 768-dimensional vector

  } catch (err) {
    console.warn('Embedding failed:', err.message)
    return null  // embedding is optional — never block a save
  }
}

export async function embedQuery(query) {
  try {
    const response = await fetch('https://api-atlas.nomic.ai/v1/embedding/text', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_NOMIC_API_KEY}`,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({
        texts:     [query],
        model:     'nomic-embed-text-v1.5',
        task_type: 'search_query'  // different task type for queries
      })
    })

    if (!response.ok) throw new Error('Nomic query embedding failed')
    const data = await response.json()
    return data.embeddings[0]

  } catch (err) {
    console.warn('Query embedding failed:', err.message)
    return null
  }
}
```

### When Embeddings Are Created
- Every time a chronicle is saved → embed the text
- Every time an AI response is saved → embed the response
- Embedding failures never block saving — they are optional enhancement

---

## RAG System (Retrieval Augmented Generation)

### The RAG Flow
```javascript
// services/ai.js
export async function ragSearch(query, userId) {
  // 1. Embed the query
  const queryEmbedding = await embedQuery(query)
  if (!queryEmbedding) return []  // graceful fallback

  // 2. Search Supabase for similar chronicles
  const { data, error } = await supabase.rpc('match_chronicles', {
    query_embedding: queryEmbedding,
    match_threshold: 0.65,  // similarity threshold (0-1)
    match_count:     5,     // max results
    p_user_id:       userId
  })

  if (error) {
    console.warn('RAG search failed:', error)
    return []
  }

  return data || []
}
```

### How RAG Context Is Formatted for the AI
```javascript
function formatRAGContext(ragResults) {
  if (!ragResults.length) return ''

  return `
RELEVANT PAST CHRONICLES (found by semantic search):
${ragResults.map((c, i) => `
[${i + 1}] Written: ${new Date(c.created_at).toLocaleDateString()}
    Chaos: ${c.chaos_score}/100 | Tone: ${c.emotional_tone}
    Themes: ${c.themes?.join(', ')}
    Summary: ${c.ai_summary || 'No summary'}
    Content: "${c.text?.substring(0, 300)}${c.text?.length > 300 ? '...' : ''}"
    Similarity: ${Math.round(c.similarity * 100)}%
`).join('')}

Use these chronicles as evidence when answering. Reference them specifically.
Do not make up patterns — only reference what is shown above.
`
}
```

---

## The Context Engine

### Complete Context Builder
```javascript
// services/ai.js
export async function buildContext(userId, userMessage) {
  // Load everything in parallel for speed
  const [
    stats,
    aboutMe,
    cognitiveProfile,
    ragResults,
    recentChronicles
  ] = await Promise.all([
    loadDashboardStats(userId),
    loadAboutMe(userId),
    loadCognitiveProfile(userId),
    ragSearch(userMessage, userId),       // RAG search
    loadChronicles(userId, 5)             // 5 most recent
  ])

  return {
    stats,
    aboutMe,
    cognitiveProfile,
    ragResults,
    recentChronicles,
    ragContext: formatRAGContext(ragResults)
  }
}
```

### Complete System Prompt Builder
```javascript
export function buildSystemPrompt(context, engine, firstName) {
  const {
    stats, aboutMe, cognitiveProfile, ragContext
  } = context

  return `
You are Mindoo — ${firstName}'s dedicated personal life intelligence system.
You are NOT a generic AI. You exist only to serve ${firstName} specifically.
You have access to ${firstName}'s real personal data below. Use it.

═══════════════════════════════════════════
ABOUT ${firstName.toUpperCase()}
═══════════════════════════════════════════
Name: ${firstName}
Location: ${aboutMe?.location || 'Cairo, Egypt'}
Situation: ${aboutMe?.employment_status || 'Building Mindoo'}
Current work: ${aboutMe?.current_job || 'Building a life operating system'}
Main constraints: ${aboutMe?.main_constraints?.join(', ') || 'Not yet defined'}
Freedom definition: ${aboutMe?.freedom_definition || 'Not yet defined'}

═══════════════════════════════════════════
PERSONALITY & WORKING STYLE
═══════════════════════════════════════════
Work preference: ${aboutMe?.work_preference || 'Unknown'}
Decision style: ${aboutMe?.decision_style || 'Unknown'}
Learning style: ${aboutMe?.learning_style || 'Unknown'}
Energy peaks: ${aboutMe?.peak_hours || 'Unknown'}
Known difficulties: ${cognitiveProfile?.known_difficulties?.join(', ') || 'None specified'}

═══════════════════════════════════════════
PASSIONS & PURPOSE
═══════════════════════════════════════════
Passions: ${aboutMe?.love_doing?.join(', ') || 'Not yet mapped'}
Natural strengths: ${aboutMe?.good_at?.join(', ') || 'Not yet mapped'}
Ikigai: ${aboutMe?.ikigai_statement || 'Not yet discovered'}
Top values: ${aboutMe?.top_values?.join(', ') || 'Not yet defined'}

═══════════════════════════════════════════
ACTIVE BLOCKERS
═══════════════════════════════════════════
Mental: ${aboutMe?.mental_blockers?.join(', ') || 'Not identified'}
Psychological: ${aboutMe?.psychological_blockers?.join(', ') || 'Not identified'}
Financial: ${aboutMe?.financial_blockers?.join(', ') || 'Not identified'}

═══════════════════════════════════════════
CURRENT PERFORMANCE DATA
═══════════════════════════════════════════
Focus hours this week: ${((stats?.focusMinsThisWeek || 0) / 60).toFixed(1)}h
Brain dumps this week: ${stats?.dumpsThisWeek || 0}
Total chronicles: ${stats?.totalChronicles || 0}
Current streak: ${stats?.streak || 0} days
Clarity score: ${stats?.clarityScore || 0}%

═══════════════════════════════════════════
COGNITIVE PROFILE
═══════════════════════════════════════════
Attention score: ${cognitiveProfile?.attention_score || 0}/100
Memory score: ${cognitiveProfile?.memory_score || 0}/100
Processing score: ${cognitiveProfile?.processing_score || 0}/100
Best focus time: ${cognitiveProfile?.best_focus_hour || 9}:00

${ragContext}

═══════════════════════════════════════════
ACTIVE ENGINE: ${engine || 'Auto — detect from context'}
═══════════════════════════════════════════

YOUR RULES — NEVER BREAK THESE:
1. Every response references ${firstName}'s real data above
2. When RAG results are available, cite them specifically
3. Every recommendation is grounded in psychology/neuroscience/coaching science
4. Be direct, warm, honest — never vague or generic
5. If you lack data to personalise, ask ONE specific question
6. Never invent patterns — only reference real data shown above
7. Always end with ONE clear, specific action ${firstName} can take right now
8. Use plain language — no jargon, no corporate speak
`
}
```

---

## The 5 Agents

### Agent 1 — The Analyst
- **Trigger**: On demand or scheduled weekly
- **Input**: All chronicles, focus sessions, stats
- **Process**: Find patterns, anomalies, trends
- **Output**: Insights saved to insights table
- **Science**: Behavioural pattern analysis, cognitive load theory
- **Rule**: Never speaks in chat. Silent background intelligence.

### Agent 2 — The Coach (ChatPanel)
- **Trigger**: Every chat message
- **Input**: Full context + RAG results + conversation history
- **Output**: Personalised science-based response
- **Science**: ICF coaching, motivational interviewing, CBT, ACT
- **Rule**: Every response references real data. Never generic.

### Agent 3 — The Planner
- **Trigger**: Goal Builder or Project Launcher engine
- **Input**: Context + stated goal + known blockers
- **Output**: Step-by-step plan with timeline
- **Science**: Implementation intentions (Gollwitzer), behavioural activation

### Agent 4 — The Guardian
- **Trigger**: Chaos score > 75 for 3+ days, or streak broken
- **Input**: Stats trends + emotional tone history
- **Output**: Proactive alert in Dashboard insights
- **Science**: Burnout prevention (Maslach), stress inoculation training

### Agent 5 — The Self-Model Builder
- **Trigger**: After every brain dump, focus session, chat
- **Input**: New activity + existing profiles
- **Output**: Updates cognitive_profile scores, insight generation
- **Science**: Self-determination theory, identity-based behaviour change

---

## Feedback Loop Implementation

### In ChatPanel.jsx (UI)
```jsx
// After every AI message, show rating buttons
{msg.role === 'ai' && msg.id && (
  <div className="feedback-row">
    <button onClick={() => ratMessage(msg.id, 'positive')}>👍</button>
    <button onClick={() => ratMessage(msg.id, 'negative')}>👎</button>
    {msg.rated && <span className="feedback-thanks">Thanks</span>}
  </div>
)}
```

### In services/db.js
```javascript
export async function saveFeedback({
  userId, conversationId, rating,
  responseSummary, engineUsed, modelUsed, ragUsed
}) {
  const { error } = await supabase
    .from('ai_feedback')
    .insert({
      user_id:          userId,
      conversation_id:  conversationId,
      rating,
      response_summary: responseSummary,
      engine_used:      engineUsed,
      model_used:       modelUsed,
      rag_used:         ragUsed
    })
  return { error }
}
```

### Weekly Feedback Analysis (Future)
- Count positive vs negative ratings
- Identify which engines get most negatives
- Identify which RAG threshold works best
- Adjust system prompt based on patterns

---

## Current Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Groq chat | ⚠️ Partial | Key added, ChatPanel not yet updated |
| OpenRouter fallback | ❌ Not built | Key not added yet |
| Nomic embeddings | ❌ Not built | Key not added yet |
| RAG search | ❌ Not built | pgvector not enabled yet |
| Feedback loop | ❌ Not built | Table not created yet |
| Context engine | ❌ Not built | Design complete |
| System prompt | ⚠️ Basic | Needs full context engine |
| analyzeChronicle | ✅ Working | services/ai.js |
| formatDuration | ✅ Working | services/ai.js |

---

## Environment Variables Needed

```
# Already have
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_ANTHROPIC_API_KEY=...  (for future server-side use)
VITE_GROQ_API_KEY=...       (added this session)

# Still needed
VITE_NOMIC_API_KEY=...      (for embeddings — free at nomic.ai)
VITE_OPENROUTER_API_KEY=... (for fallback — free tier at openrouter.ai)
```
