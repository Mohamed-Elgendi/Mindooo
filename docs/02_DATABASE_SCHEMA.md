# 02 — DATABASE SCHEMA
## Every Table, Every Column, Every Relationship
**Last Updated**: April 5, 2026
**Version**: 2.0 — pgvector + feedback loop added
**Database**: Supabase PostgreSQL + pgvector extension

---

## Required Extensions

```sql
-- Enable vector search (run once in Supabase SQL editor)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- for text search
```

---

## Existing Tables (Already in Supabase)

### chronicles
The core of Mindoo — every brain dump ever saved.
```sql
CREATE TABLE chronicles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users NOT NULL,
  title           text DEFAULT '',
  text            text,
  word_count      integer DEFAULT 0,
  origin          text DEFAULT 'text', -- 'text'|'voice'|'session'
  audio_url       text DEFAULT '',
  duration_secs   integer DEFAULT 0,
  chaos_score     integer DEFAULT 0,
  emotional_tone  text DEFAULT 'neutral',
  urgency_signals text[] DEFAULT '{}',
  themes          text[] DEFAULT '{}',
  ai_summary      text DEFAULT '',
  disposition     text DEFAULT 'archive',
  -- NEW: vector embedding for RAG search
  embedding       vector(768),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Index for fast vector similarity search
CREATE INDEX chronicles_embedding_idx
ON chronicles USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for fast user queries
CREATE INDEX chronicles_user_id_idx ON chronicles(user_id);
CREATE INDEX chronicles_created_at_idx ON chronicles(created_at DESC);

ALTER TABLE chronicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own chronicles"
ON chronicles FOR ALL USING (auth.uid() = user_id);
```

---

### focus_sessions
```sql
CREATE TABLE focus_sessions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users NOT NULL,
  mode         text,
  mode_name    text,
  planned_mins integer,
  actual_secs  integer,
  completed    boolean DEFAULT true,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sessions"
ON focus_sessions FOR ALL USING (auth.uid() = user_id);
```

---

### user_profiles
```sql
CREATE TABLE user_profiles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users UNIQUE NOT NULL,
  first_name text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile"
ON user_profiles FOR ALL USING (auth.uid() = user_id);
```

---

### chronicle_folders
```sql
CREATE TABLE chronicle_folders (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users NOT NULL,
  name       text NOT NULL,
  color      text DEFAULT '#8b5cf6',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chronicle_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own folders"
ON chronicle_folders FOR ALL USING (auth.uid() = user_id);
```

---

## New Tables (To Be Added in Phase 2)

### user_about_me
Progressive self-discovery profile.
```sql
CREATE TABLE user_about_me (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid REFERENCES auth.users UNIQUE NOT NULL,

  -- Section 1: Current Situation
  employment_status      text DEFAULT '',
  current_job            text DEFAULT '',
  monthly_income_range   text DEFAULT '',
  location               text DEFAULT '',
  living_situation       text DEFAULT '',
  main_constraints       text[] DEFAULT '{}',
  ideal_day              text DEFAULT '',
  actual_day             text DEFAULT '',

  -- Section 2: Personality
  work_preference        text DEFAULT '', -- solo|team|mixed
  decision_style         text DEFAULT '', -- analytical|intuitive|mixed
  communication_style    text DEFAULT '',
  learning_style         text DEFAULT '', -- visual|auditory|reading|kinesthetic
  self_description       text[] DEFAULT '{}',
  others_description     text DEFAULT '',

  -- Section 3: Energy
  peak_hours             text DEFAULT '', -- morning|afternoon|evening|night
  energy_crashes         text DEFAULT '',
  energy_drains          text[] DEFAULT '{}',
  energy_restorers       text[] DEFAULT '{}',
  optimal_sleep_hours    float DEFAULT 0,
  weekly_energy_pattern  text DEFAULT '',

  -- Section 4: Passions
  reading_topics         text[] DEFAULT '{}',
  endless_topics         text[] DEFAULT '{}',
  childhood_loves        text[] DEFAULT '{}',
  effortless_skills      text[] DEFAULT '{}',
  desired_skills         text[] DEFAULT '{}',

  -- Section 5: Values
  top_values             text[] DEFAULT '{}',
  non_negotiables        text[] DEFAULT '{}',
  would_refuse           text DEFAULT '',
  would_do_free          text DEFAULT '',

  -- Section 6: Ikigai
  love_doing             text[] DEFAULT '{}',
  good_at                text[] DEFAULT '{}',
  world_needs            text[] DEFAULT '{}',
  can_be_paid_for        text[] DEFAULT '{}',
  ikigai_statement       text DEFAULT '',

  -- Section 7: Financial
  financial_situation    text DEFAULT '',
  monthly_target         text DEFAULT '',
  money_relationship     text DEFAULT '',
  financial_mistakes     text DEFAULT '',
  financial_blockers     text[] DEFAULT '{}',
  best_past_income       text DEFAULT '',

  -- Section 8: Relationships
  top_supporters         text[] DEFAULT '{}',
  energy_draining_people text[] DEFAULT '{}',
  has_mentor             boolean DEFAULT false,
  support_gaps           text DEFAULT '',
  help_relationship      text DEFAULT '',

  -- Section 9: Dreams & Fears
  dream_no_constraints   text DEFAULT '',
  freedom_definition     text DEFAULT '',
  success_definition     text DEFAULT '',
  most_wanted_afraid     text DEFAULT '',
  biggest_regret_risk    text DEFAULT '',

  -- Section 10: Blockers
  mental_blockers        text[] DEFAULT '{}',
  limiting_beliefs       text[] DEFAULT '{}',
  self_sabotage_patterns text[] DEFAULT '{}',
  psychological_blockers text[] DEFAULT '{}',
  past_affecting_present text DEFAULT '',
  anxiety_triggers       text[] DEFAULT '{}',
  financial_blockers2    text[] DEFAULT '{}',
  physical_blockers      text[] DEFAULT '{}',
  relational_blockers    text[] DEFAULT '{}',

  -- Section 11: Cognitive
  known_difficulties     text[] DEFAULT '{}',
  memory_self_rating     text DEFAULT '', -- strong|average|weak
  focus_duration_mins    integer DEFAULT 0,
  hard_to_learn          text[] DEFAULT '{}',
  current_learning       text DEFAULT '',
  learning_blockers      text DEFAULT '',

  -- Meta
  completion_pct         integer DEFAULT 0,
  last_updated           timestamptz DEFAULT now(),
  created_at             timestamptz DEFAULT now()
);

ALTER TABLE user_about_me ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own about me"
ON user_about_me FOR ALL USING (auth.uid() = user_id);
```

---

### cognitive_profile
```sql
CREATE TABLE cognitive_profile (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid REFERENCES auth.users UNIQUE NOT NULL,

  -- Self-reported
  known_difficulties    text[] DEFAULT '{}',
  attention_baseline    integer DEFAULT 25,  -- minutes
  memory_self_rating    text DEFAULT 'average',
  learning_history      text DEFAULT '',
  cognitive_goals       text[] DEFAULT '{}',

  -- Inferred from usage (auto-updated)
  avg_focus_duration    float DEFAULT 0,
  focus_completion_rate float DEFAULT 0,
  best_focus_hour       integer DEFAULT 9,
  words_per_minute      float DEFAULT 0,
  vocabulary_richness   float DEFAULT 0,
  avg_dump_word_count   float DEFAULT 0,

  -- Cognitive scores (0-100)
  attention_score       integer DEFAULT 0,
  memory_score          integer DEFAULT 0,
  processing_score      integer DEFAULT 0,
  flexibility_score     integer DEFAULT 0,
  planning_score        integer DEFAULT 0,
  overall_score         integer DEFAULT 0,

  -- Dominant intelligence (Gardner)
  dominant_intelligence text DEFAULT '',

  -- Brain gym
  brain_gym_streak      integer DEFAULT 0,
  last_brain_gym        timestamptz,
  total_exercises       integer DEFAULT 0,

  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

ALTER TABLE cognitive_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cognitive profile"
ON cognitive_profile FOR ALL USING (auth.uid() = user_id);
```

---

### ai_conversations
Chat history for context continuity and RAG.
```sql
CREATE TABLE ai_conversations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users NOT NULL,
  session_id    uuid DEFAULT gen_random_uuid(), -- groups messages in one session
  role          text NOT NULL,  -- 'user'|'assistant'
  content       text NOT NULL,
  engine        text DEFAULT '', -- which engine was active
  model_used    text DEFAULT '', -- which AI model responded
  -- Embedding for RAG search across past conversations
  embedding     vector(768),
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX ai_conversations_user_idx ON ai_conversations(user_id);
CREATE INDEX ai_conversations_embedding_idx
ON ai_conversations USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 50);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own conversations"
ON ai_conversations FOR ALL USING (auth.uid() = user_id);
```

---

### ai_feedback
The feedback loop — thumbs up/down on AI responses.
```sql
CREATE TABLE ai_feedback (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid REFERENCES auth.users NOT NULL,
  conversation_id      uuid REFERENCES ai_conversations(id),
  rating               text NOT NULL, -- 'positive'|'negative'
  response_summary     text DEFAULT '',
  engine_used          text DEFAULT '',
  model_used           text DEFAULT '',
  rag_used             boolean DEFAULT false,
  rag_sources_count    integer DEFAULT 0,
  created_at           timestamptz DEFAULT now()
);

ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own feedback"
ON ai_feedback FOR ALL USING (auth.uid() = user_id);
```

---

### insights
AI-generated insights stored for dashboard display.
```sql
CREATE TABLE insights (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  type        text NOT NULL, -- 'pattern'|'warning'|'opportunity'|'milestone'
  title       text NOT NULL,
  description text NOT NULL,
  data_source text[] DEFAULT '{}',
  confidence  float DEFAULT 0,
  read        boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own insights"
ON insights FOR ALL USING (auth.uid() = user_id);
```

---

## RAG Functions (Supabase SQL)

### Chronicle Similarity Search
```sql
CREATE OR REPLACE FUNCTION match_chronicles(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count     int DEFAULT 5,
  p_user_id       uuid DEFAULT NULL
)
RETURNS TABLE (
  id             uuid,
  title          text,
  text           text,
  ai_summary     text,
  chaos_score    integer,
  emotional_tone text,
  themes         text[],
  created_at     timestamptz,
  similarity     float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id, title, text, ai_summary,
    chaos_score, emotional_tone, themes, created_at,
    1 - (embedding <=> query_embedding) AS similarity
  FROM chronicles
  WHERE user_id = p_user_id
    AND embedding IS NOT NULL
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
```

### Conversation History Search
```sql
CREATE OR REPLACE FUNCTION match_conversations(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count     int DEFAULT 3,
  p_user_id       uuid DEFAULT NULL
)
RETURNS TABLE (
  id         uuid,
  role       text,
  content    text,
  created_at timestamptz,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id, role, content, created_at,
    1 - (embedding <=> query_embedding) AS similarity
  FROM ai_conversations
  WHERE user_id = p_user_id
    AND role = 'assistant'
    AND embedding IS NOT NULL
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
```

---

## Table Relationships

```
auth.users (Supabase managed)
    │
    ├── user_profiles          (1:1)
    ├── user_about_me          (1:1)
    ├── cognitive_profile      (1:1)
    │
    ├── chronicles             (1:many)
    │       └── chronicle_folders (many:1)
    │       └── embedding vector  (1:1 per chronicle)
    │
    ├── focus_sessions         (1:many)
    │
    ├── ai_conversations       (1:many)
    │       └── ai_feedback    (1:many)
    │       └── embedding vector (1:1 per message)
    │
    └── insights               (1:many)
```

---

## Migration Order

Run these in order. Never skip a step.

```
Phase 1 (Already done):
  ✅ chronicles
  ✅ focus_sessions
  ✅ user_profiles
  ✅ chronicle_folders

Phase 2 (Next):
  1. Enable pgvector extension
  2. Add embedding column to chronicles
  3. Create chronicle vector index
  4. Create match_chronicles function
  5. Create user_about_me table
  6. Create cognitive_profile table
  7. Create ai_conversations table
  8. Create ai_feedback table
  9. Create insights table
  10. Create match_conversations function
```
