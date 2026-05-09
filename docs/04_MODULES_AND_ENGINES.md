# 04 — MODULES AND ENGINES
## Every Module and Engine — Current and Planned
**Last Updated**: April 5, 2026
**Status**: Design Phase

---

## The Rule
Every module is completely self-contained.
Adding a new module never touches existing module files.
Each module has its own section file, database functions, and AI prompts.

---

## Current Modules

### 1. Brain Dump Sanctuary ✅ ACTIVE
**File**: src/pages/sections/BrainDump.jsx (946 lines)
**Purpose**: Zero-friction capture of everything in the mind
**Features**:
- Text dump with font size control
- Voice note recording + Supabase Storage upload
- Brain Dump Session with timer
- AI silent analysis (chaos score, tone, themes, summary)
- Editable titles
- Delete with confirmation
- Copy button
- Speech-to-text
- Sharing (WhatsApp, Telegram, Email, Obsidian, Notion, Drive, social)
- Chronicles list with all metadata
- Folders, tags, search, sort, filter (partially built)
**Database**: chronicles, chronicle_folders
**AI**: analyzeChronicle() in services/ai.js

---

### 2. Mindoo Chat ✅ BUILT — AI BROKEN
**File**: src/pages/sections/ChatPanel.jsx
**Purpose**: Personal AI coach with full life context
**Features**:
- Message history with scroll
- 6 engine selectors
- Uncontrolled textarea (no crash on keystroke)
**Current Issue**: Anthropic CORS blocks browser calls
**Fix**: Switch to Groq API
**Database**: ai_conversations (not yet created)
**AI**: Groq (llama-3.3-70b-versatile)

---

### 3. Focus Sanctuary ✅ BASIC
**File**: src/pages/sections/FocusSection.jsx
**Purpose**: Protected deep work sessions
**Features**: Timer, session modes, save to Supabase
**Needs**: Full expansion in Phase 6
**Database**: focus_sessions

---

### 4. Dashboard / Home ✅ ACTIVE
**File**: src/pages/sections/Home.jsx
**Purpose**: Overview, KPIs, insights, quick actions
**Features**:
- Real KPI data (focus hours, dumps, streak, clarity)
- Dynamic insights based on real data
- Module grid navigation
- Quick actions
- Self-Model preview (hardcoded — needs real data)
**Database**: chronicles, focus_sessions, user_profiles

---

## Planned Modules

### 5. Journaling Nexus 🔵 PLANNED
**Purpose**: Structured reflection and meaning-making
**Key Features**:
- Morning charter
- Evening inventory
- Weekly synthesis
- AI-guided depth levels (1-5)
- Pattern recognition across entries
**Database**: journal_entries (to be created)
**Science**: Expressive writing research (Pennebaker), reflective practice

---

### 6. Emotional Mastery System 🔵 PLANNED
**Purpose**: Real-time emotional awareness and regulation
**Key Features**:
- Emotion logging with triggers
- Regulation technique library (science-based)
- Pattern recognition (what triggers what)
- Personalised regulation toolkit
**Database**: emotional_logs (to be created)
**Science**: CBT, DBT, somatic therapy, polyvagal theory

---

### 7. Habit Transformation Engine 🔵 PLANNED
**Purpose**: Science-based habit formation and addiction elimination
**Key Features**:
- Habit loop mapping (cue, craving, response, reward)
- If-then implementation intentions
- Streak tracking
- Relapse recovery protocol
**Database**: habits (to be created)
**Science**: Atomic Habits (Clear), BJ Fogg, Duhigg, MBRP

---

### 8. Embodied Affirmations 🔵 PLANNED
**Purpose**: Evidence-based identity formation
**Key Features**:
- Evidence collection from all modules
- Identity strength scoring
- Morning evidence review ritual
- Gap analysis (aspiration vs reality)
**Database**: identity_evidence (to be created)
**Science**: Self-concept research, growth mindset (Dweck)

---

### 9. Self-Model 🔵 PLANNED
**Purpose**: Living digital representation of Mo's patterns
**Key Features**:
- Cognitive profile visualization
- Emotional profile
- Behavioural profile
- Predictive insights
**Database**: cognitive_profile, user_about_me
**Science**: Self-determination theory, personality psychology

---

### 10. About Me / Self-Discovery 🆕 NEW
**Purpose**: Progressive self-knowledge profile
**Key Features**:
- Guided self-discovery questionnaire
- Ikigai mapping
- Personality profiling
- Blocker identification
- AI-guided exploration in chat
**Database**: user_about_me (to be created)
**Science**: Positive psychology, Ikigai research, coaching frameworks

---

### 11. Cognitive Performance System 🆕 NEW
**Purpose**: Monitor and train cognitive functions
**Key Features**:
- Cognitive vitals dashboard
- Brain gym exercises (daily)
- Attention training
- Memory training
- Processing speed exercises
- Weekly brain report
**Database**: cognitive_profile (to be created)
**Science**: Doidge, Merzenich, Ebbinghaus, Diamond, Kahneman

---

### 12. Life Clarity Engine 🆕 NEW
**Purpose**: Turn confusion into clear direction
**Key Features**:
- Life wheel assessment
- Values clarification
- Priority mapping
- Weekly clarity score
**Science**: Positive psychology, solution-focused coaching

---

### 13. Blocker Elimination Engine 🆕 NEW
**Purpose**: Identify and eliminate blockers on all levels
**Key Features**:
- Blocker audit (mental, psychological, financial, physical, relational)
- Root cause analysis
- Step-by-step elimination plan
- Progress tracking
**Science**: CBT, ACT, motivational interviewing

---

### 14. Financial Freedom Engine 🆕 NEW
**Purpose**: Build financial clarity and momentum
**Key Features**:
- Financial situation mapping
- Ikigai-based income path identification
- Most profitable skill identification
- Money mindset work
**Science**: Behavioural economics, financial psychology

---

### 15. Purpose & Ikigai Engine 🆕 NEW
**Purpose**: Find the intersection of passion, skill, need, and income
**Key Features**:
- Full Ikigai mapping
- Purpose statement builder
- Most aligned career/project paths
**Science**: Ikigai research, self-determination theory

---

### 16. Energy & Time Engine 🆕 NEW
**Purpose**: Optimise how time and energy are spent
**Key Features**:
- Energy pattern mapping
- Time audit
- Ultradian rhythm optimisation
- Weekly time design
**Science**: Ultradian rhythms (Kleitman), energy management (Loehr & Schwartz)

---

### 17. Relationship & Support Engine 🆕 NEW
**Purpose**: Map and strengthen the support system
**Key Features**:
- Support network mapping
- Energy giver vs taker analysis
- Communication pattern awareness
**Science**: Attachment theory, social support research

---

## The 13 Engines

| ID | Name | Purpose | Status |
|----|------|---------|--------|
| A | Clarity Engine | Turn vague feeling into clear thought | ✅ Active |
| B | Goal Builder | Shape rough idea into specific goal | ✅ Active |
| C | Problem Solver | Diagnose what is broken | ✅ Active |
| D | Project Launcher | Build logical plan step by step | ✅ Active |
| E | Task Executor | Engineer perfect AI prompt | ✅ Active |
| F | Skill Builder | Design personal learning path | ✅ Active |
| G | Self-Discovery | Deep self-knowledge exploration | 🔵 Planned |
| H | Blocker Elimination | Remove what holds you back | 🔵 Planned |
| I | Financial Freedom | Find your path to income | 🔵 Planned |
| J | Purpose & Ikigai | Find your why and your what | 🔵 Planned |
| K | Energy & Time | Optimise your most finite resources | 🔵 Planned |
| L | Relationship & Support | Strengthen your network | 🔵 Planned |
| M | Cognitive Performance | Train your brain systematically | 🔵 Planned |
