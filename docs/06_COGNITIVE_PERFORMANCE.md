# 06 — COGNITIVE PERFORMANCE SYSTEM
## Monitor and Train the Brain
**Last Updated**: April 5, 2026
**Status**: Design Phase — Not yet built

---

## Core Principle

Most apps assume your brain is fully functional.
Mindoo does not. The brain is a muscle — trainable, measurable, improvable.
This module monitors cognitive operations silently through natural usage
and builds a personalised brain training programme.

No artificial tests. Real measurement from real behaviour.

---

## What Gets Monitored

### Memory Systems
- **Working memory** — how much held in mind at once
  - Measured by: chronicle complexity, multi-step task tracking
- **Short-term retention** — do you remember what you dumped yesterday?
  - Measured by: chronicle recall patterns in chat
- **Long-term memory** — retention of important information
  - Measured by: spaced repetition performance (future feature)
- **Episodic memory** — memory of personal experiences
  - Measured by: journal entry detail and accuracy over time

### Attention Functions
- **Sustained attention** — how long before mind wanders
  - Measured by: focus session completion rate and duration
- **Selective attention** — filtering distractions
  - Measured by: distraction logging in focus sessions
- **Attentional recovery** — how fast focus returns after interruption
  - Measured by: time between interruption and session resume

### Executive Functions
- **Planning** — ability to sequence steps logically
  - Measured by: project launcher engine usage quality
- **Cognitive flexibility** — switching between tasks and ideas
  - Measured by: theme diversity in brain dumps
- **Inhibition control** — stopping impulsive reactions
  - Measured by: habit engine data (urge resistance)
- **Working memory updating** — holding and updating mental info
  - Measured by: chat conversation depth and tracking

### Processing Speed
- **Input speed** — how fast new information is absorbed
  - Measured by: words per minute in brain dumps
- **Output speed** — how fast thoughts are articulated
  - Measured by: dump session efficiency (words per minute)
- **Decision speed** — time to reach conclusions in chat

### Cognitive Awareness (Metacognition)
- How well Mo knows what he knows
- Measured by: self-assessment accuracy vs actual performance
- Blind spots identified by AI pattern analysis

---

## How Scores Are Calculated (Inference Engine)

All scores are 0-100. All inferred from real behaviour.

### Attention Score
```
Base = focus_completion_rate * 40
+ (avg_focus_duration / 90) * 30   // 90 min = perfect score
+ (1 - distraction_rate) * 30
```

### Memory Score
```
Base = chronicle_recall_accuracy * 50  // future feature
+ vocabulary_consistency * 25          // same words used = good recall
+ theme_consistency * 25               // recurring themes = retention
```

### Processing Speed Score
```
Base = words_per_minute_normalized * 50
+ dump_complexity_score * 30
+ response_latency_score * 20
```

### Overall Cognitive Score
```
(attention_score + memory_score + processing_score) / 3
```

---

## The Brain Gym Programme

Three micro-exercises per day. Total time: 5-10 minutes.
All grounded in neuroscience research.

### Memory Exercises (Ebbinghaus, spaced repetition)
1. **Chronicle Recall** — shown a past chronicle, asked to recall one detail
2. **Theme Tracker** — identify which theme appeared most this week
3. **Pattern Spotter** — find the connection between two random chronicles

### Attention Exercises (Kahneman, attention restoration)
1. **Focus Sprint** — 10-minute timed focus block with distraction logging
2. **Single-Task Challenge** — one task, no switching, track completion
3. **Attention Audit** — review what pulled focus away today and why

### Processing Speed Exercises (Merzenich, cognitive training)
1. **Speed Dump** — 60 seconds, dump as many thoughts as possible
2. **Rapid Categorise** — sort 5 chronicles into themes in under 30 seconds
3. **Quick Decision** — given two options, decide in under 10 seconds with reason

### Cognitive Flexibility Exercises (Diamond)
1. **Reframe Challenge** — take a problem, find 3 completely different solutions
2. **Opposite Thinking** — what would the opposite of your current plan look like?
3. **Perspective Shift** — how would someone you admire see this situation?

---

## The Cognitive Dashboard

### Vitals Panel
```
┌─────────────────────────────────────────┐
│  COGNITIVE VITALS          Week of Apr 5 │
│                                          │
│  Attention     ████████░░  78/100  ↑ 5  │
│  Memory        ██████░░░░  62/100  → 0  │
│  Processing    ███████░░░  71/100  ↑ 3  │
│  Flexibility   █████░░░░░  53/100  ↑ 8  │
│                                          │
│  Overall Score: 66/100  ↑ 4 this week   │
└─────────────────────────────────────────┘
```

### Weekly Brain Report
Generated every Sunday. Contains:
- How each cognitive score changed
- Which brain gym exercises were completed
- One specific insight about cognitive patterns
- One targeted recommendation for next week

### Today's Brain Gym
```
┌─────────────────────────────────────────┐
│  TODAY'S BRAIN GYM          Est. 7 min  │
│                                          │
│  1. 🧠 Chronicle Recall     2 min       │
│     Find what you wrote 3 days ago      │
│                                          │
│  2. ⚡ Speed Dump            1 min       │
│     60 seconds, go                      │
│                                          │
│  3. 🎯 Reframe Challenge     4 min       │
│     3 solutions to your current blocker │
│                                          │
│  [Start Brain Gym]                       │
└─────────────────────────────────────────┘
```

---

## Learning Difficulties Support

Mo has identified learning difficulties. The system adapts:

### For Attention Difficulties (ADHD-type)
- Shorter focus sessions with more breaks (Pomodoro adapted)
- More frequent reminders and anchors
- Visual progress indicators
- Celebrate small wins more explicitly
- Science: Barkley's ADHD executive function model

### For Memory Difficulties
- More frequent spaced repetition prompts
- Summary cards from each brain dump
- Weekly "what you captured" review
- Science: Ebbinghaus forgetting curve, spaced repetition (Wozniak)

### For Processing Speed
- No time pressure on inputs (brain dump has no timer)
- Extra processing time before action prompts
- Voice-first options everywhere
- Science: Processing speed research (Decker, 2020)

### For Learning Style
- Multiple format options for every exercise
- Visual, auditory, and kinesthetic options
- Never one-size-fits-all recommendations

---

## Science References

| Area | Research | Application |
|------|----------|-------------|
| Neuroplasticity | Doidge (2007), Merzenich (2013) | Brain training is real and effective |
| Memory | Ebbinghaus (1885), Wozniak (1994) | Spaced repetition prevents forgetting |
| Attention | Diamond (2013), Kaplan (1995) | Attention can be trained and restored |
| Executive Function | Diamond (2013), Barkley (1997) | EF is the master cognitive skill |
| Processing Speed | Decker et al. (2020) | Speed improves with targeted practice |
| Multiple Intelligence | Gardner (1983, updated 2011) | Intelligence is multidimensional |
| Learning Difficulties | Shaywitz (2003), Barkley (2015) | Specific interventions for specific patterns |
| Cognitive Load | Sweller (1988) | Manage complexity to optimise learning |
