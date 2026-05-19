# MINDOOO — DATABASE SCHEMA
## Every Table, Every Column, Every Relationship, Every Index
### The Living Memory of a Life Operating System

**Version**: 3.0 — The Synthesized Schema
**Last Updated**: May 19, 2026
**Status**: Phase 1 Complete → Phase 2 Build Phase
**Database**: Supabase PostgreSQL 15+ with pgvector extension
**Brand**: Mindooo (three o's) — zero tolerance for "Mindoo"
**GitHub**: https://github.com/Mohamed-Elgendi/Mindooo

---

## I. THE SCHEMA PHILOSOPHY

Mindooo's database is not just storage. It is the **memory of a life**.

Every table, every column, every index serves one purpose: to help Mo (and eventually every user) move from chaos to clarity. The schema is designed around the transformation pipeline:

| Stage | Database Role |
|---|---|
| **CAPTURE** | chronicles table — zero-friction input storage |
| **CLARIFY** | AI analysis fields (chaos_score, themes, emotional_tone) |
| **UNDERSTAND** | user_about_me — deep self-knowledge profile |
| **ELIMINATE** | blockers fields across multiple tables |
| **BUILD** | focus_sessions, goals tracking |
| **PERFORM** | cognitive_profile — brain training metrics |
| **PROTECT** | focus_sessions, energy patterns |
| **GUIDE** | ai_conversations, ai_feedback, insights |
| **GROW** | embeddings, feedback loops, progressive intelligence |

### The Core Equation Applied to Schema
**Traditional Database**: Tables × Rows = Static storage
**Mindooo Database**: (Tables × Relationships) ^ Vector Search × Feedback = Living Memory

---

## II. THE SCHEMA ARCHITECTURE: VISUAL OVERVIEW

```
╔═════════════════════════════════════════════════════════════════════════════╗
║                                                                             ║
║                    MINDOOO DATABASE ARCHITECTURE                             ║
║                    "Every Life Story, Stored, Searchable, Sacred"            ║
║                                                                             ║
╚═════════════════════════════════════════════════════════════════════════════╝
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
   ┌────▼────┐               ┌─────▼─────┐              ┌─────▼─────┐
   │  CORE   │               │  PROFILE  │              │  CONTEXT  │
   │ TABLES  │               │  TABLES   │              │  TABLES   │
   │         │               │           │              │           │
   │chronicle│               │user_about_│              │ai_conver- │
   │  focus_ │               │    me     │              │   sations │
   │ sessions│               │cognitive_ │              │ai_feedback│
   │chronicle│               │  profile  │              │ insights  │
   │ _folders│               │           │              │           │
   └────┬────┘               └─────┬─────┘              └─────┬─────┘
        │                          │                          │
        │                    ┌─────▼─────┐                    │
        │                    │   AUTH    │                    │
        │                    │  (RLS)    │                    │
        │                    │           │                    │
        │                    │  auth.    │                    │
        │                    │  users    │                    │
        │                    └───────────┘                    │
        │                          │                          │
        └──────────────────────────┼──────────────────────────┘
                                   │
                              ┌────▼────┐
                              │  USER   │
                              │   (Mo)  │
                              └─────────┘
```

### Table Relationship Map

```
auth.users (Supabase Auth — The Root)
    │
    ├── user_profiles (1:1) — Display name, stats, streak
    │
    ├── user_about_me (1:1) — Deep self-knowledge (14 sections)
    │
    ├── cognitive_profile (1:1) — Brain metrics, training history
    │
    ├── chronicles (1:many) — Brain dumps, voice notes, sessions
    │       │
    │       ├── chronicle_folders (many:1) — Organization
    │       │
    │       └── embedding (1:1 per row) — 768-dim vector for RAG
    │
    ├── focus_sessions (1:many) — Deep work tracking
    │
    ├── ai_conversations (1:many) — Chat history
    │       │
    │       ├── ai_feedback (1:many) — Thumbs up/down
    │       │
    │       └── embedding (1:1 per message) — For conversation RAG
    │
    └── insights (1:many) — AI-generated pattern discoveries
```

---

## III. REQUIRED EXTENSIONS

Run these ONCE in the Supabase SQL Editor. They enable the superpowers.

```sql
-- ============================================================
-- MINDOOO EXTENSIONS SETUP
-- Run once, never again
-- ============================================================

-- 1. PGVECTOR — Vector similarity search for RAG
-- This is what makes the AI personal. Without this, no RAG.
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. PG_TRGM — Fast text search (finds "procrast" matching "procrastination")
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 3. UUID GENERATION — Auto-generate unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 4. CRYPTO — For hashing and encryption helpers
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Verify extensions are active
SELECT extname, extversion
FROM pg_extension
WHERE extname IN ('vector', 'pg_trgm', 'uuid-ossp', 'pgcrypto')
ORDER BY extname;
```

### Extension Purpose Table

| Extension | Purpose | Critical For |
|---|---|---|
| **vector** | Store and search 768-dimensional vectors | RAG, similarity search, AI personalization |
| **pg_trgm** | Trigram text matching | Fuzzy search, typo tolerance, fast text lookup |
| **uuid-ossp** | Generate UUIDs | Primary keys, session IDs, unique identifiers |
| **pgcrypto** | Hashing, encryption | Security, data integrity, password helpers |

---

## IV. PHASE 1 TABLES: ALREADY BUILT

These tables are live in Supabase. They are the foundation of Mindooo.

---

### 4.1 — chronicles
**Purpose**: The heart of Mindooo. Every brain dump, voice note, and session ever captured.
**Why It Matters**: This is Mo's external brain. Every entry is a piece of his mental landscape. The AI reads these to understand him. RAG searches these to answer him. The system learns from these to guide him.

```sql
-- ============================================================
-- TABLE: chronicles
-- The core of Mindooo — every brain dump ever saved
-- ============================================================
CREATE TABLE IF NOT EXISTS chronicles (
  -- Identity
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users NOT NULL,

  -- Content
  title           text DEFAULT '',
  text            text,
  word_count      integer GENERATED ALWAYS AS (
    COALESCE(array_length(regexp_split_to_array(text, '\s+'), 1), 0)
  ) STORED,

  -- Origin & Media
  origin          text DEFAULT 'text',
  audio_url       text DEFAULT '',
  duration_secs   integer DEFAULT 0,

  -- AI Analysis (auto-populated)
  chaos_score     integer DEFAULT 0,
  emotional_tone  text DEFAULT 'neutral',
  urgency_signals text[] DEFAULT '{}',
  themes          text[] DEFAULT '{}',
  ai_summary      text DEFAULT '',
  disposition     text DEFAULT 'archive',

  -- RAG Vector (the magic — makes AI personal)
  embedding       vector(768),

  -- Metadata
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS chronicles_embedding_idx
ON chronicles USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS chronicles_user_id_idx ON chronicles(user_id);
CREATE INDEX IF NOT EXISTS chronicles_created_at_idx ON chronicles(created_at DESC);
CREATE INDEX IF NOT EXISTS chronicles_chaos_score_idx ON chronicles(chaos_score) WHERE chaos_score > 5;
CREATE INDEX IF NOT EXISTS chronicles_emotional_tone_idx ON chronicles(emotional_tone);

-- Triggers
CREATE OR REPLACE FUNCTION update_chronicles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_chronicles_updated_at
BEFORE UPDATE ON chronicles
FOR EACH ROW
EXECUTE FUNCTION update_chronicles_updated_at();

-- Row Level Security
ALTER TABLE chronicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own chronicles"
ON chronicles FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Description
COMMENT ON TABLE chronicles IS 'Mindooo Brain Dump Sanctuary — every captured thought, voice note, and session';
COMMENT ON COLUMN chronicles.embedding IS '768-dim vector for RAG similarity search. Generated by Nomic embed model.';
COMMENT ON COLUMN chronicles.chaos_score IS 'AI-inferred: 0 = crystal clear, 10 = maximum chaos';
```

#### chronicles: Data Flow
```
Mo writes brain dump
     |
     v
Frontend saves to chronicles table
     |
     v
Background AI analyzes:
   - word_count (auto-calculated)
   - chaos_score (AI inference)
   - emotional_tone (AI inference)
   - themes (AI extraction)
   - ai_summary (AI generation)
     |
     v
Embedding service converts text to 768-dim vector
     |
     v
Vector stored in embedding column
     |
     v
Now RAG can find this chronicle when Mo asks related questions
```

---

### 4.2 — focus_sessions
**Purpose**: Track every deep work session. Measure focus quality over time.
**Why It Matters**: What gets measured gets managed. Mo needs to see his focus improving. The system needs data to optimize his cognitive performance.

```sql
-- ============================================================
-- TABLE: focus_sessions
-- Every deep work, shallow work, and recovery session
-- ============================================================
CREATE TABLE IF NOT EXISTS focus_sessions (
  -- Identity
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users NOT NULL,

  -- Session Configuration
  mode            text DEFAULT 'deep_work',
  mode_name       text DEFAULT '',
  planned_mins    integer DEFAULT 25,
  actual_secs     integer DEFAULT 0,

  -- Session Quality
  completed       boolean DEFAULT true,
  interrupted     boolean DEFAULT false,
  interruption_count integer DEFAULT 0,
  self_rating     integer DEFAULT 0,
  notes           text DEFAULT '',

  -- Cognitive Data (for performance tracking)
  start_energy    integer DEFAULT 5,
  end_energy      integer DEFAULT 5,
  time_of_day     text DEFAULT '',
  day_of_week     integer DEFAULT 0,

  -- Metadata
  created_at      timestamptz DEFAULT now(),
  ended_at        timestamptz
);

-- Indexes
CREATE INDEX IF NOT EXISTS focus_sessions_user_id_idx ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS focus_sessions_created_at_idx ON focus_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS focus_sessions_mode_idx ON focus_sessions(mode);
CREATE INDEX IF NOT EXISTS focus_sessions_completed_idx ON focus_sessions(completed) WHERE completed = true;

-- Row Level Security
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own focus sessions"
ON focus_sessions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE focus_sessions IS 'Mindooo Focus Sanctuary — every protected attention block';
```

---

### 4.3 — user_profiles
**Purpose**: The dashboard's data source. Quick stats, streaks, identity claims.
**Why It Matters**: This is what Mo sees when he opens Mindooo. It must be fast, accurate, and inspiring.

```sql
-- ============================================================
-- TABLE: user_profiles
-- Dashboard stats, streaks, identity claims
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  -- Identity
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users UNIQUE NOT NULL,

  -- Display
  first_name      text DEFAULT '',
  display_name    text DEFAULT '',
  avatar_url      text DEFAULT '',

  -- Core Metrics (updated in real-time)
  clarity_score   integer DEFAULT 0,
  current_streak  integer DEFAULT 0,
  longest_streak  integer DEFAULT 0,
  dumps_this_week integer DEFAULT 0,
  focus_sessions_this_week integer DEFAULT 0,
  total_dumps     integer DEFAULT 0,
  total_focus_mins integer DEFAULT 0,

  -- Identity Claims (evidence-based, not affirmations)
  identity_claims jsonb DEFAULT '{}',

  -- Onboarding
  onboarding_complete boolean DEFAULT false,
  onboarding_step     integer DEFAULT 0,

  -- Preferences
  preferred_language  text DEFAULT 'en',
  theme               text DEFAULT 'dark',
  notification_enabled boolean DEFAULT true,

  -- Metadata
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON user_profiles(user_id);

-- Trigger for updated_at
CREATE TRIGGER trigger_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_chronicles_updated_at();

-- Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile"
ON user_profiles FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE user_profiles IS 'Mindooo Dashboard — live stats and identity tracking';
```

---

### 4.4 — chronicle_folders
**Purpose**: Organize chronicles into meaningful collections.
**Why It Matters**: Mo's brain dumps will number in the thousands. Folders keep them navigable without forcing rigid structure.

```sql
-- ============================================================
-- TABLE: chronicle_folders
-- Organization system for chronicles
-- ============================================================
CREATE TABLE IF NOT EXISTS chronicle_folders (
  -- Identity
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users NOT NULL,

  -- Content
  name            text NOT NULL,
  description     text DEFAULT '',
  color           text DEFAULT '#8b5cf6',
  icon            text DEFAULT 'folder',

  -- Organization
  sort_order      integer DEFAULT 0,
  is_default      boolean DEFAULT false,

  -- Metadata
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS chronicle_folders_user_id_idx ON chronicle_folders(user_id);
CREATE INDEX IF NOT EXISTS chronicle_folders_sort_order_idx ON chronicle_folders(sort_order);

-- Trigger
CREATE TRIGGER trigger_chronicle_folders_updated_at
BEFORE UPDATE ON chronicle_folders
FOR EACH ROW
EXECUTE FUNCTION update_chronicles_updated_at();

-- Row Level Security
ALTER TABLE chronicle_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own folders"
ON chronicle_folders FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE chronicle_folders IS 'Mindooo Organization — folders for brain dump collections';
```

---

## V. PHASE 2 TABLES: TO BE BUILT

These tables unlock the full power of Mindooo. They transform it from a capture tool into a complete life operating system.

---

### 5.1 — user_about_me
**Purpose**: The living document of self-knowledge. 14 comprehensive domains.
**Why It Matters**: Without self-knowledge, there is no direction. This table stores everything Mo discovers about himself — personality, values, ikigai, blockers, dreams.

```sql
-- ============================================================
-- TABLE: user_about_me
-- The living document of self-knowledge
-- 14 sections, progressively filled
-- ============================================================
CREATE TABLE IF NOT EXISTS user_about_me (
  -- Identity
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid REFERENCES auth.users UNIQUE NOT NULL,

  -- ==========================================================
  -- SECTION 1: CURRENT SITUATION
  -- Where Mo is right now. The starting point.
  -- ==========================================================
  employment_status      text DEFAULT '',
  current_job            text DEFAULT '',
  monthly_income_range   text DEFAULT '',
  location               text DEFAULT '',
  living_situation       text DEFAULT '',
  main_constraints       text[] DEFAULT '{}',
  daily_routine          text DEFAULT '',
  ideal_day              text DEFAULT '',
  actual_day             text DEFAULT '',

  -- ==========================================================
  -- SECTION 2: PERSONALITY & WORKING STYLE
  -- How Mo operates. The manual for his brain.
  -- ==========================================================
  big_five               jsonb DEFAULT '{}',
  mbti_type              text DEFAULT '',
  enneagram_type         text DEFAULT '',
  clifton_strengths      text[] DEFAULT '{}',
  work_preference        text DEFAULT '',
  decision_style         text DEFAULT '',
  communication_style    text DEFAULT '',
  learning_style         text DEFAULT '',
  self_description       text[] DEFAULT '{}',
  others_description     text DEFAULT '',

  -- ==========================================================
  -- SECTION 3: ENERGY PATTERNS
  -- When Mo is powerful vs. depleted.
  -- ==========================================================
  peak_hours             text[] DEFAULT '{}',
  energy_crashes         text DEFAULT '',
  energy_drains          text[] DEFAULT '{}',
  energy_restorers       text[] DEFAULT '{}',
  optimal_sleep_hours    float DEFAULT 7.5,
  weekly_energy_pattern  text DEFAULT '',

  -- ==========================================================
  -- SECTION 4: PASSIONS & INTERESTS
  -- What makes Mo come alive. Not performative — genuine.
  -- ==========================================================
  reading_topics         text[] DEFAULT '{}',
  endless_topics         text[] DEFAULT '{}',
  childhood_loves        text[] DEFAULT '{}',
  effortless_skills      text[] DEFAULT '{}',
  desired_skills         text[] DEFAULT '{}',
  flow_activities        text[] DEFAULT '{}',

  -- ==========================================================
  -- SECTION 5: VALUES HIERARCHY
  -- What Mo will not compromise. The compass.
  -- ==========================================================
  top_values             text[] DEFAULT '{}',
  non_negotiables        text[] DEFAULT '{}',
  would_refuse           text DEFAULT '',
  would_do_free          text DEFAULT '',

  -- ==========================================================
  -- SECTION 6: IKIGAI MAP
  -- The intersection of love, skill, need, and pay.
  -- ==========================================================
  love_doing             text[] DEFAULT '{}',
  good_at                text[] DEFAULT '{}',
  world_needs            text[] DEFAULT '{}',
  can_be_paid_for        text[] DEFAULT '{}',
  ikigai_statement       text DEFAULT '',
  ikigai_visual          text DEFAULT '',

  -- ==========================================================
  -- SECTION 7: FINANCIAL PICTURE
  -- Money clarity. The path to freedom.
  -- ==========================================================
  financial_situation    text DEFAULT '',
  monthly_expenses       text DEFAULT '',
  monthly_target         text DEFAULT '',
  money_relationship     text DEFAULT '',
  financial_mistakes     text DEFAULT '',
  financial_blockers     text[] DEFAULT '{}',
  best_past_income       text DEFAULT '',
  income_sources         text[] DEFAULT '{}',
  savings_goal           text DEFAULT '',

  -- ==========================================================
  -- SECTION 8: RELATIONSHIPS & SUPPORT
  -- Who lifts Mo up. Who drains him.
  -- ==========================================================
  top_supporters         text[] DEFAULT '{}',
  energy_draining_people text[] DEFAULT '{}',
  has_mentor             boolean DEFAULT false,
  mentor_name            text DEFAULT '',
  support_gaps           text DEFAULT '',
  help_relationship      text DEFAULT '',
  community_belonging    text DEFAULT '',

  -- ==========================================================
  -- SECTION 9: DREAMS & FEARS
  -- What Mo wants. What stops him.
  -- ==========================================================
  dream_no_constraints   text DEFAULT '',
  freedom_definition     text DEFAULT '',
  success_definition     text DEFAULT '',
  most_wanted_afraid     text DEFAULT '',
  biggest_regret_risk    text DEFAULT '',
  legacy_desire          text DEFAULT '',

  -- ==========================================================
  -- SECTION 10: BLOCKERS (ALL LEVELS)
  -- What stands between Mo and his potential.
  -- ==========================================================
  mental_blockers        text[] DEFAULT '{}',
  limiting_beliefs       text[] DEFAULT '{}',
  self_sabotage_patterns text[] DEFAULT '{}',
  psychological_blockers text[] DEFAULT '{}',
  past_affecting_present text DEFAULT '',
  anxiety_triggers       text[] DEFAULT '{}',
  financial_blockers2    text[] DEFAULT '{}',
  physical_blockers      text[] DEFAULT '{}',
  relational_blockers    text[] DEFAULT '{}',
  environmental_blockers text[] DEFAULT '{}',

  -- ==========================================================
  -- SECTION 11: HEALTH & BODY
  -- The vessel. Must be cared for.
  -- ==========================================================
  exercise_pattern       text DEFAULT '',
  nutrition_quality      text DEFAULT '',
  sleep_quality          text DEFAULT '',
  health_concerns        text[] DEFAULT '{}',
  body_energy_level      integer DEFAULT 5,

  -- ==========================================================
  -- SECTION 12: COGNITIVE PROFILE
  -- How Mo's brain works. Strengths and difficulties.
  -- ==========================================================
  known_difficulties     text[] DEFAULT '{}',
  memory_self_rating     text DEFAULT 'average',
  focus_duration_mins    integer DEFAULT 25,
  hard_to_learn          text[] DEFAULT '{}',
  current_learning       text DEFAULT '',
  learning_blockers      text DEFAULT '',
  preferred_input        text DEFAULT '',
  preferred_output       text DEFAULT '',

  -- ==========================================================
  -- META: PROGRESS TRACKING
  -- How complete is Mo's self-knowledge?
  -- ==========================================================
  completion_pct         integer DEFAULT 0,
  last_updated_section   text DEFAULT '',
  ai_insights            text[] DEFAULT '{}',

  -- Timestamps
  last_updated           timestamptz DEFAULT now(),
  created_at             timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS user_about_me_user_id_idx ON user_about_me(user_id);
CREATE INDEX IF NOT EXISTS user_about_me_completion_idx ON user_about_me(completion_pct);

-- Trigger
CREATE TRIGGER trigger_user_about_me_updated_at
BEFORE UPDATE ON user_about_me
FOR EACH ROW
EXECUTE FUNCTION update_chronicles_updated_at();

-- Row Level Security
ALTER TABLE user_about_me ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own about me"
ON user_about_me FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE user_about_me IS 'Mindooo Self-Discovery — the living document of who Mo is';
```

---

### 5.2 — cognitive_profile
**Purpose**: Track, train, and improve Mo's cognitive capabilities.
**Why It Matters**: The brain is a muscle. What gets trained gets stronger. This table measures baseline, tracks progress, and guides training.

```sql
-- ============================================================
-- TABLE: cognitive_profile
-- Brain metrics, training history, cognitive evolution
-- ============================================================
CREATE TABLE IF NOT EXISTS cognitive_profile (
  -- Identity
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid REFERENCES auth.users UNIQUE NOT NULL,

  -- ==========================================================
  -- SELF-REPORTED BASELINE
  -- What Mo knows about his own brain
  -- ==========================================================
  known_difficulties    text[] DEFAULT '{}',
  attention_baseline    integer DEFAULT 25,
  memory_self_rating    text DEFAULT 'average',
  learning_history      text DEFAULT '',
  cognitive_goals       text[] DEFAULT '{}',

  -- ==========================================================
  -- INFERRED FROM USAGE (Auto-updated by system)
  -- What the data reveals about Mo's brain
  -- ==========================================================
  avg_focus_duration    float DEFAULT 0,
  focus_completion_rate float DEFAULT 0,
  best_focus_hour       integer DEFAULT 9,
  best_focus_day        text DEFAULT 'Tuesday',
  words_per_minute      float DEFAULT 0,
  vocabulary_richness   float DEFAULT 0,
  avg_dump_word_count   float DEFAULT 0,
  writing_consistency   float DEFAULT 0,
  response_time_avg     float DEFAULT 0,

  -- ==========================================================
  -- COGNITIVE SCORES (0-100)
  -- The dimensions of cognitive performance
  -- ==========================================================
  working_memory        integer DEFAULT 0,
  short_term_memory     integer DEFAULT 0,
  long_term_memory      integer DEFAULT 0,
  episodic_memory       integer DEFAULT 0,
  procedural_memory     integer DEFAULT 0,
  attention_score       integer DEFAULT 0,
  focus_stamina         integer DEFAULT 0,
  cognitive_flexibility integer DEFAULT 0,
  inhibition_control    integer DEFAULT 0,
  planning_score        integer DEFAULT 0,
  processing_speed      integer DEFAULT 0,
  metacognition         integer DEFAULT 0,
  overall_score         integer DEFAULT 0,

  -- ==========================================================
  -- GARDNER MULTIPLE INTELLIGENCES
  -- Strength-based development
  -- ==========================================================
  linguistic_intel      integer DEFAULT 0,
  logical_intel         integer DEFAULT 0,
  spatial_intel         integer DEFAULT 0,
  musical_intel         integer DEFAULT 0,
  bodily_intel          integer DEFAULT 0,
  interpersonal_intel   integer DEFAULT 0,
  intrapersonal_intel   integer DEFAULT 0,
  naturalistic_intel    integer DEFAULT 0,
  dominant_intelligence text DEFAULT '',

  -- ==========================================================
  -- BRAIN GYM — COGNITIVE TRAINING
  -- Exercises completed, streaks, progress
  -- ==========================================================
  brain_gym_streak      integer DEFAULT 0,
  last_brain_gym        timestamptz,
  total_exercises       integer DEFAULT 0,
  exercises_this_week   integer DEFAULT 0,
  favorite_exercise     text DEFAULT '',
  weakest_area          text DEFAULT '',

  -- ==========================================================
  -- TRAINING HISTORY
  -- Log of every cognitive exercise
  -- ==========================================================
  training_history      jsonb DEFAULT '[]',

  -- Timestamps
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS cognitive_profile_user_id_idx ON cognitive_profile(user_id);
CREATE INDEX IF NOT EXISTS cognitive_profile_overall_idx ON cognitive_profile(overall_score);

-- Trigger
CREATE TRIGGER trigger_cognitive_profile_updated_at
BEFORE UPDATE ON cognitive_profile
FOR EACH ROW
EXECUTE FUNCTION update_chronicles_updated_at();

-- Row Level Security
ALTER TABLE cognitive_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own cognitive profile"
ON cognitive_profile FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE cognitive_profile IS 'Mindooo Cognitive Performance — brain training metrics and evolution';
```

---

### 5.3 — ai_conversations
**Purpose**: Complete chat history for context continuity and conversation RAG.
**Why It Matters**: The AI must remember what Mo said yesterday, last week, last month. This table is the AI's memory of their relationship.

```sql
-- ============================================================
-- TABLE: ai_conversations
-- Every message between Mo and Mindooo AI
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_conversations (
  -- Identity
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users NOT NULL,

  -- Session Grouping
  session_id    uuid DEFAULT gen_random_uuid(),
  message_index integer DEFAULT 0,

  -- Message Content
  role          text NOT NULL,
  content       text NOT NULL,
  content_summary text DEFAULT '',

  -- AI Metadata
  engine        text DEFAULT '',
  engine_name   text DEFAULT '',
  model_used    text DEFAULT '',
  provider      text DEFAULT '',

  -- Context Metadata
  context_loaded integer DEFAULT 0,
  rag_used       boolean DEFAULT false,
  rag_sources    uuid[] DEFAULT '{}',
  system_prompt_hash text DEFAULT '',

  -- RAG Vector (for searching past conversations)
  embedding     vector(768),

  -- Feedback (linked to ai_feedback table)
  feedback_rating text DEFAULT '',

  -- Metadata
  created_at    timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS ai_conversations_user_idx ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS ai_conversations_session_idx ON ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS ai_conversations_embedding_idx
ON ai_conversations USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 50);
CREATE INDEX IF NOT EXISTS ai_conversations_role_idx ON ai_conversations(role) WHERE role = 'assistant';
CREATE INDEX IF NOT EXISTS ai_conversations_engine_idx ON ai_conversations(engine);

-- Row Level Security
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own conversations"
ON ai_conversations FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE ai_conversations IS 'Mindooo Chat Memory — every interaction between Mo and the AI';
```

---

### 5.4 — ai_feedback
**Purpose**: The feedback loop. Thumbs up/down on AI responses to improve quality over time.
**Why It Matters**: Without feedback, the AI doesn't learn what works for Mo. This table is the engine of progressive intelligence.

```sql
-- ============================================================
-- TABLE: ai_feedback
-- The feedback loop — Mo teaches the AI what works
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_feedback (
  -- Identity
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid REFERENCES auth.users NOT NULL,

  -- Link to Conversation
  conversation_id      uuid REFERENCES ai_conversations(id),
  message_index        integer DEFAULT 0,

  -- The Feedback
  rating               text NOT NULL,
  reason               text DEFAULT '',

  -- AI Context (to learn from patterns)
  response_summary     text DEFAULT '',
  engine_used          text DEFAULT '',
  engine_name          text DEFAULT '',
  model_used           text DEFAULT '',
  provider             text DEFAULT '',
  rag_used             boolean DEFAULT false,
  rag_sources_count    integer DEFAULT 0,
  context_size         integer DEFAULT 0,
  prompt_version       text DEFAULT '',

  -- User Context (to understand when feedback happens)
  user_chaos_score     integer DEFAULT 0,
  user_energy_level    integer DEFAULT 5,
  time_of_day          text DEFAULT '',

  -- Metadata
  created_at           timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS ai_feedback_user_idx ON ai_feedback(user_id);
CREATE INDEX IF NOT EXISTS ai_feedback_conversation_idx ON ai_feedback(conversation_id);
CREATE INDEX IF NOT EXISTS ai_feedback_rating_idx ON ai_feedback(rating);
CREATE INDEX IF NOT EXISTS ai_feedback_engine_idx ON ai_feedback(engine_used);

-- Row Level Security
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own feedback"
ON ai_feedback FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE ai_feedback IS 'Mindooo Feedback Loop — teaching the AI what works for Mo';
```

---

### 5.5 — insights
**Purpose**: AI-generated pattern discoveries, warnings, opportunities, and milestones.
**Why It Matters**: The AI sees patterns Mo cannot. This table stores those discoveries so they can be displayed on the dashboard and acted upon.

```sql
-- ============================================================
-- TABLE: insights
-- AI-generated discoveries about Mo's patterns
-- ============================================================
CREATE TABLE IF NOT EXISTS insights (
  -- Identity
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,

  -- Classification
  type        text NOT NULL,
  severity    text DEFAULT 'info',

  -- Content
  title       text NOT NULL,
  description text NOT NULL,
  action_suggested text DEFAULT '',

  -- Evidence
  data_source text[] DEFAULT '{}',
  evidence_chronicles uuid[] DEFAULT '{}',
  confidence  float DEFAULT 0,

  -- Status
  read        boolean DEFAULT false,
  read_at     timestamptz,
  acted_upon  boolean DEFAULT false,
  acted_at    timestamptz,
  dismissed   boolean DEFAULT false,

  -- Metadata
  generated_by text DEFAULT '',
  created_at  timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS insights_user_idx ON insights(user_id);
CREATE INDEX IF NOT EXISTS insights_type_idx ON insights(type);
CREATE INDEX IF NOT EXISTS insights_read_idx ON insights(read) WHERE read = false;
CREATE INDEX IF NOT EXISTS insights_created_at_idx ON insights(created_at DESC);

-- Row Level Security
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own insights"
ON insights FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE insights IS 'Mindooo Insights — AI discoveries about patterns, warnings, and opportunities';
```

---

## VI. RAG FUNCTIONS: THE INTELLIGENCE QUERIES

These functions power the Retrieval Augmented Generation system. They are the bridge between Mo's data and the AI's understanding.

---

### 6.1 — match_chronicles
**Purpose**: Find the most relevant past brain dumps for any query.

```sql
-- ============================================================
-- FUNCTION: match_chronicles
-- RAG search across brain dumps
-- ============================================================
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
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
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
    c.created_at,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM chronicles c
  WHERE c.user_id = p_user_id
    AND c.embedding IS NOT NULL
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION match_chronicles TO authenticated;

COMMENT ON FUNCTION match_chronicles IS 'Mindooo RAG: Find relevant chronicles for AI context';
```

---

### 6.2 — match_conversations
**Purpose**: Find relevant past AI conversations for context continuity.

```sql
-- ============================================================
-- FUNCTION: match_conversations
-- RAG search across chat history
-- ============================================================
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
  engine     text,
  created_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ac.id,
    ac.role,
    ac.content,
    ac.engine,
    ac.created_at,
    1 - (ac.embedding <=> query_embedding) AS similarity
  FROM ai_conversations ac
  WHERE ac.user_id = p_user_id
    AND ac.role = 'assistant'
    AND ac.embedding IS NOT NULL
    AND 1 - (ac.embedding <=> query_embedding) > match_threshold
  ORDER BY ac.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION match_conversations TO authenticated;

COMMENT ON FUNCTION match_conversations IS 'Mindooo RAG: Find relevant past AI responses';
```

---

### 6.3 — get_user_stats
**Purpose**: Aggregate dashboard statistics in one query.

```sql
-- ============================================================
-- FUNCTION: get_user_stats
-- Dashboard statistics — fast, single-query
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id uuid)
RETURNS TABLE (
  total_chronicles bigint,
  total_focus_sessions bigint,
  total_focus_mins bigint,
  current_streak bigint,
  avg_chaos_score numeric,
  dominant_emotion text,
  top_themes text[],
  last_dump_at timestamptz,
  last_focus_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM chronicles WHERE user_id = p_user_id) as total_chronicles,
    (SELECT COUNT(*) FROM focus_sessions WHERE user_id = p_user_id AND completed = true) as total_focus_sessions,
    (SELECT COALESCE(SUM(actual_secs), 0) / 60 FROM focus_sessions WHERE user_id = p_user_id) as total_focus_mins,
    (SELECT current_streak FROM user_profiles WHERE user_id = p_user_id) as current_streak,
    (SELECT ROUND(AVG(chaos_score)::numeric, 1) FROM chronicles WHERE user_id = p_user_id) as avg_chaos_score,
    (SELECT mode() WITHIN GROUP (ORDER BY emotional_tone) FROM chronicles WHERE user_id = p_user_id) as dominant_emotion,
    (SELECT array_agg(DISTINCT theme) FROM chronicles, UNNEST(themes) as theme WHERE user_id = p_user_id LIMIT 5) as top_themes,
    (SELECT MAX(created_at) FROM chronicles WHERE user_id = p_user_id) as last_dump_at,
    (SELECT MAX(created_at) FROM focus_sessions WHERE user_id = p_user_id) as last_focus_at;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_stats TO authenticated;

COMMENT ON FUNCTION get_user_stats IS 'Mindooo Dashboard: Aggregate all user statistics in one call';
```

---

### 6.4 — analyze_chaos_trend
**Purpose**: Track chaos score over time to detect improvement or decline.

```sql
-- ============================================================
-- FUNCTION: analyze_chaos_trend
-- Detect if Mo is getting more or less chaotic
-- ============================================================
CREATE OR REPLACE FUNCTION analyze_chaos_trend(
  p_user_id uuid,
  days_back int DEFAULT 30
)
RETURNS TABLE (
  week_start date,
  avg_chaos numeric,
  dump_count bigint,
  trend text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH weekly AS (
    SELECT
      DATE_TRUNC('week', created_at)::date as week_start,
      ROUND(AVG(chaos_score)::numeric, 1) as avg_chaos,
      COUNT(*) as dump_count
    FROM chronicles
    WHERE user_id = p_user_id
      AND created_at > now() - (days_back || ' days')::interval
    GROUP BY DATE_TRUNC('week', created_at)
    ORDER BY week_start DESC
  )
  SELECT
    w.week_start,
    w.avg_chaos,
    w.dump_count,
    CASE
      WHEN w.avg_chaos < LAG(w.avg_chaos) OVER (ORDER BY w.week_start) THEN 'improving'
      WHEN w.avg_chaos > LAG(w.avg_chaos) OVER (ORDER BY w.week_start) THEN 'declining'
      ELSE 'stable'
    END as trend
  FROM weekly w;
END;
$$;

GRANT EXECUTE ON FUNCTION analyze_chaos_trend TO authenticated;

COMMENT ON FUNCTION analyze_chaos_trend IS 'Mindooo Guardian: Detect chaos trends over time';
```

---

## VII. MIGRATION ORDER

Run these in EXACT order. Never skip a step. Verify each step before proceeding.

```
PHASE 1: FOUNDATION (Already Complete ✅)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ chronicles          — Brain dumps with vector embeddings
  ✅ focus_sessions      — Deep work tracking
  ✅ user_profiles       — Dashboard stats and identity
  ✅ chronicle_folders   — Organization system

PHASE 2: SELF-KNOWLEDGE (Next Build Target 🔄)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. Enable extensions (pgvector, pg_trgm, uuid-ossp, pgcrypto)
  2. Add embedding column to chronicles (if not present)
  3. Create chronicle vector index (ivfflat)
  4. Create match_chronicles function
  5. Create user_about_me table
  6. Create cognitive_profile table
  7. Create ai_conversations table
  8. Create ai_feedback table
  9. Create insights table
  10. Create match_conversations function
  11. Create get_user_stats function
  12. Create analyze_chaos_trend function
  13. Verify all RLS policies are active
  14. Run test queries to confirm functionality

PHASE 3: OPTIMIZATION (Future)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  - Add materialized views for dashboard stats
  - Add partitioning for chronicles (by month)
  - Add connection pooling optimization
  - Add read replicas for analytics queries
```

---

## VIII. THE DATA LAYER PRINCIPLES

Every table, every column, every index serves these principles:

| Principle | Database Manifestation |
|---|---|
| **Science-Based** | Every field has a research-backed purpose (chaos_score, cognitive dimensions) |
| **Personal** | user_id on every table. No shared data. No generic profiles. |
| **Never Crashes** | RLS prevents unauthorized access. Indexes prevent slow queries. |
| **Modular** | Each table is self-contained. Adding user_about_me doesn't change chronicles. |
| **Data-Safe** | RLS on ALL tables. Embeddings isolated per user. No cross-contamination. |
| **Transparent AI** | ai_feedback table exposes what the AI gets right/wrong. |
| **Progressive** | Embeddings enable RAG. Feedback enables learning. The schema enables evolution. |

---

## IX. THE CLOSING STATEMENT

This schema is not just tables and columns. It is the **memory architecture of a life**.

- **chronicles** stores every thought Mo has ever captured
- **focus_sessions** tracks every moment of protected attention
- **user_about_me** holds the deepest knowledge of who Mo is
- **cognitive_profile** measures the evolution of his mind
- **ai_conversations** remembers every conversation with his AI coach
- **ai_feedback** teaches that coach to get better every day
- **insights** surfaces patterns Mo cannot see himself

Together, these tables create a **living system** that:
- Remembers everything
- Understands deeply
- Learns continuously
- Protects completely
- Guides personally

**From chaos to clarity. From data to wisdom. Now do more.**

---

*This document is the definitive database schema of Mindooo. It is the single source of truth for all data architecture decisions. It evolves with every session, but its core — the tables, the relationships, the RLS policies — never changes without documentation.*

**Version**: 3.0 — The Synthesized Schema
**Synthesized**: May 19, 2026
**Next Review**: Next session
**Status**: Phase 1 Complete → Phase 2 Build Phase
**Brand**: Mindooo (three o's) — zero tolerance for "Mindoo"
