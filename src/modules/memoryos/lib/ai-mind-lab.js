// ============================================================
// MEMORYOS — AI MIND LAB
// Version: 1.0.0
//
// All AI-powered features:
// - Mind State Analysis (reads Supabase data → assessment)
// - Custom Card Generator (text → flashcards)
// - Personal AI Coach (conversational)
// - Performance Dashboard (AI-interpreted analytics)
// - Smart recommendations engine
// ============================================================

import { llmRequest, llmStream, type LLMRequest } from '../lib/llm-gateway';

// ─── TYPES ───────────────────────────────────────────────────











// ─── SYSTEM PROMPTS ──────────────────────────────────────────

const MIND_ANALYSIS_SYSTEM = `You are MemoryOS Mind Analyst — an expert in memory science, learning psychology, and cognitive performance optimization. You analyze a user's memory training data and produce a precise, data-driven assessment of their current mind state, strengths, weaknesses, and specific actionable recommendations. You speak with authority and warmth. You back every recommendation with the specific data point that suggests it. You are encouraging about strengths and direct (never harsh) about weaknesses. You write in second person ("you") and present tense. Your analysis is always specific — never generic advice like "practice more." Every recommendation names a specific action with a specific frequency.`;

const CARD_GENERATOR_SYSTEM = `You are MemoryOS Card Generator — an expert at converting any body of text into perfectly structured memory flashcards. Each card must: contain one complete, self-contained unit of information that can be read aloud, recited, and written from memory; be written in clear, precise, memorable prose; include 3-5 key points that highlight the most important elements; be assigned a difficulty level (simple/technique/complex); and be assigned a relevant emoji icon. You ALWAYS respond with valid JSON only — no markdown, no explanation, just the JSON array. Cards should be ordered from foundational to advanced within each topic.`;

const COACH_SYSTEM = `You are MemoryOS Coach — a personal AI memory coach with deep expertise in all major memory systems (Method of Loci, PAO, Link System, Major System, Mind Mapping) and the neuroscience of learning. You have intimate knowledge of Tony Buzan, Dominic O'Brien, Harry Lorayne, Kevin Trudeau, and Joshua Foer's methods. You coach one step at a time. You ask one question at a time. You give specific, actionable guidance rather than generic advice. You are warm, encouraging, and direct. You remember the conversation history and build on it. When a user describes a difficulty, you diagnose the specific cause before prescribing a solution. You never overwhelm — you guide.`;

const PERFORMANCE_SYSTEM = `You are MemoryOS Performance Analyst. You interpret memory training analytics and translate them into clear, human-readable insights and specific recommendations. You identify patterns that the user cannot see themselves — trends in retention, consistency gaps, curriculum imbalances, and habit opportunities. You present findings as a trusted coach, not a report generator. Every insight is tied to a specific data point. Every recommendation is specific and actionable.`;

// ─── MIND STATE ANALYSIS ─────────────────────────────────────

export async function analyzeMindState(
  analytics:  MemoryOSAnalytics,
  userId:     string,
  supabase:   SupabaseClient
): Promise<MindStateReport> {

  // Build data summary for the prompt
  const dataSummary = buildDataSummary(analytics);

  const prompt: LLMRequest = {
    task:        'mind-analysis',
    systemPrompt: MIND_ANALYSIS_SYSTEM,
    userId,
    maxTokens:   1500,
    temperature: 0.4,
    cacheKey:    `mind-analysis:${userId}:${new Date().toDateString()}`,
    userPrompt:  `
Analyze this user's MemoryOS training data and produce a complete Mind State Report.

TRAINING DATA:
${dataSummary}

Respond ONLY with a valid JSON object matching this exact structure:
{
  "overallLevel": "beginner|developing|intermediate|advanced|master",
  "memoryCapacity": 0-100,
  "retentionStrength": 0-100,
  "consistencyScore": 0-100,
  "masteryRate": 0-100,
  "strengths": ["string", "string", "string"],
  "weaknesses": ["string", "string"],
  "recommendations": [
    {
      "priority": "high|medium|low",
      "category": "session|curriculum|guru|habit|nobel",
      "title": "string",
      "description": "string",
      "action": "string",
      "dataReason": "string"
    }
  ],
  "nextMilestone": "string",
  "estimatedDaysToNextLevel",
  "aiNarrative": "2-3 sentence personalized summary paragraph"
}
`,
  };

  const response = await llmRequest(prompt, supabase);

  try {
    const clean = response.text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean) as MindStateReport;
    return parsed;
  } catch {
    // Return a computed fallback report if AI parsing fails
    return computeFallbackReport(analytics);
  }
}

function buildDataSummary(analytics: MemoryOSAnalytics) {
  const { last7Days } = analytics;
  const activeDays    = last7Days.filter(d => d.total > 0).length;
  const avgPerDay     = last7Days.reduce((s, d) => s + d.total, 0) / 7;

  return `
- Streak: ${analytics.streak} days
- Mastery Rate: ${analytics.masteryRate}%
- Total Cards: ${analytics.totalCards}
- Cards in Boxes: ${analytics.cardsInBoxes}
- Cards Mastered: ${analytics.cardsMastered}
- Cards Due: ${analytics.cardsDue}
- Total Reviews: ${analytics.totalReviews}
- Owned: ${analytics.totalOwned} (${analytics.totalReviews > 0 ? Math.round((analytics.totalOwned/analytics.totalReviews)*100) : 0}%)
- Almost: ${analytics.totalAlmost}
- Failed: ${analytics.totalFailed}
- Active Days Last 7: ${activeDays}/7
- Avg Reviews Per Day: ${avgPerDay.toFixed(1)}
- Per Curriculum: ${analytics.perCurriculum.map(c => `${c.label}: ${c.totalCards} cards, ${c.masteryRate}% mastery`).join(', ')}
  `.trim();
}

function computeFallbackReport(analytics: MemoryOSAnalytics) {
  const { masteryRate, streak, totalCards, cardsMastered, totalReviews } = analytics;

  let overallLevel['overallLevel'] = 'beginner';
  if (masteryRate >= 80 && totalReviews >= 500) overallLevel = 'master';
  else if (masteryRate >= 70 && totalReviews >= 200) overallLevel = 'advanced';
  else if (masteryRate >= 60 && totalReviews >= 100) overallLevel = 'intermediate';
  else if (masteryRate >= 40 && totalReviews >= 30)  overallLevel = 'developing';

  return {
    overallLevel,
    memoryCapacity:      Math.min(100, Math.round((totalCards / 200) * 100)),
    retentionStrength:   masteryRate,
    consistencyScore:    Math.min(100, streak * 5),
    masteryRate,
    strengths:           masteryRate >= 60 ? ['Strong recall rate', 'Consistent practice'] : ['Getting started'],
    weaknesses:          masteryRate < 60 ? ['Mastery rate needs improvement'] : [],
    recommendations: [{
      priority:   'high',
      category:   'session',
      title:      'Complete daily Box Review first',
      description:'Your retention improves fastest when reviews happen at the right intervals.',
      action:     'Start every day with Box Review before New Learning.',
      dataReason: `You have ${analytics.cardsDue} cards due right now.`,
    }],
    nextMilestone:            '50% mastery rate',
    estimatedDaysToNextLevel: 14,
    aiNarrative:              `You have reviewed ${totalReviews} cards with a ${masteryRate}% mastery rate. Keep your daily practice consistent and your retention will grow exponentially.`,
  };
}

// ─── CARD GENERATOR ──────────────────────────────────────────

export async function generateCardsFromText(
  text:         string,
  topic:        string,
  cardCount:    number = 8,
  userId:       string,
  supabase:     SupabaseClient
): Promise<GeneratedCard[]> {

  const prompt: LLMRequest = {
    task:        'card-generation',
    systemPrompt: CARD_GENERATOR_SYSTEM,
    userId,
    maxTokens:   2000,
    temperature: 0.5,
    userPrompt:  `
Convert the following text into ${cardCount} high-quality MemoryOS flashcards about "${topic}".

TEXT:
${text.slice(0, 3000)} ${text.length > 3000 ? '... [text truncated]' : ''}

Rules:
- Each card unit must be 1-4 sentences, self-contained, and memorable
- Ordered from foundational to advanced
- Difficulty: simple (definition/fact), technique (how-to), complex (multi-step/nuanced)
- 3-5 keyPoints per card highlighting the most important elements
- Choose a relevant emoji icon for each card
- Topic should be a specific sub-topic within "${topic}"

Respond ONLY with this JSON array:
[
  {
    "unit": "The complete text to memorize",
    "keyPoints": ["point 1", "point 2", "point 3"],
    "topic": "specific sub-topic",
    "difficulty": "simple|technique|complex",
    "icon": "emoji"
  }
]
`,
  };

  const response = await llmRequest(prompt, supabase);

  try {
    const clean   = response.text.replace(/```json|```/g, '').trim();
    const parsed  = JSON.parse(clean) as GeneratedCard[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ─── AI COACH ────────────────────────────────────────────────

export async function sendCoachMessage(
  message:  string,
  history:  CoachMessage[],
  userId:   string,
  supabase
): Promise<string> {

  // Build conversation context
  const historyContext = history
    .slice(-10) // last 10 messages for context
    .map(m => `${m.role === 'user' ? 'Student' : 'Coach'}: ${m.content}`)
    .join('\n');

  const prompt: LLMRequest = {
    task:        'chat-coach',
    systemPrompt: COACH_SYSTEM,
    userId,
    maxTokens:   600,
    temperature: 0.7,
    userPrompt:  `
${historyContext ? `Previous conversation:\n${historyContext}\n\n` : ''}Student: ${message}

Coach:`,
  };

  const response = await llmRequest(prompt, supabase);
  return response.text.trim();
}

export async function* streamCoachMessage(
  message:  string,
  history:  CoachMessage[],
  userId:   string,
  supabase
): AsyncGenerator<string> {

  const historyContext = history
    .slice(-10)
    .map(m => `${m.role === 'user' ? 'Student' : 'Coach'}: ${m.content}`)
    .join('\n');

  const prompt: LLMRequest = {
    task:        'chat-coach',
    systemPrompt: COACH_SYSTEM,
    userId,
    maxTokens:   600,
    temperature: 0.7,
    streaming:   true,
    userPrompt:  `
${historyContext ? `Previous conversation:\n${historyContext}\n\n` : ''}Student: ${message}

Coach:`,
  };

  yield* llmStream(prompt, supabase);
}

// ─── PERFORMANCE INSIGHTS ────────────────────────────────────

export async function generatePerformanceInsights(
  analytics: MemoryOSAnalytics,
  userId:    string,
  supabase:  SupabaseClient
): Promise<AIInsight[]> {

  const dataSummary = buildDataSummary(analytics);

  const prompt: LLMRequest = {
    task:        'mind-analysis',
    systemPrompt: PERFORMANCE_SYSTEM,
    userId,
    maxTokens:   800,
    temperature: 0.4,
    cacheKey:    `insights:${userId}:${new Date().toDateString()}`,
    userPrompt:  `
Generate 4-6 specific performance insights from this training data.

${dataSummary}

Respond ONLY with a JSON array:
[
  {
    "type": "warning|success|suggestion|milestone",
    "title": "short title",
    "message": "1-2 sentence insight",
    "metric": "optional metric name",
    "value": "optional metric value"
  }
]
`,
  };

  const response = await llmRequest(prompt, supabase);

  try {
    const clean  = response.text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean) as AIInsight[];
    return Array.isArray(parsed) ? parsed : computeFallbackInsights(analytics);
  } catch {
    return computeFallbackInsights(analytics);
  }
}

function computeFallbackInsights(analytics: MemoryOSAnalytics): AIInsight[] {
  const insights: AIInsight[] = [];

  if (analytics.streak >= 7) {
    insights.push({ type: 'milestone', title: `${analytics.streak}-Day Streak!`, message: 'You have practiced every day this week. Consistency is the most powerful force in memory training.', metric: 'Streak', value: analytics.streak });
  }

  if (analytics.cardsDue > 10) {
    insights.push({ type: 'warning', title: 'Reviews Accumulating', message: `You have ${analytics.cardsDue} cards due. Delayed reviews weaken retention. Start with Box Review today.`, metric: 'Due', value: analytics.cardsDue });
  }

  if (analytics.masteryRate >= 80) {
    insights.push({ type: 'success', title: 'Strong Mastery Rate', message: `Your ${analytics.masteryRate}% mastery rate is excellent. You are building genuine long-term retention.`, metric: 'Mastery', value: `${analytics.masteryRate}%` });
  }

  if (analytics.masteryRate < 50 && analytics.totalReviews > 20) {
    insights.push({ type: 'suggestion', title: 'Mastery Rate Below 50%', message: 'Try reducing daily new cards and focusing on reviewing existing ones until mastery improves.', metric: 'Mastery', value: `${analytics.masteryRate}%` });
  }

  const activeDays = analytics.last7Days.filter(d => d.total > 0).length;
  if (activeDays < 4) {
    insights.push({ type: 'suggestion', title: 'Inconsistent Practice', message: `You practiced ${activeDays} of the last 7 days. Daily practice, even 10 minutes, produces dramatically better retention than occasional long sessions.` });
  }

  return insights;
}

// ─── GURU STEP AI GUIDANCE ───────────────────────────────────

export async function getGuruStepGuidance(
  guruName:    string,
  stepTitle:   string,
  stepLesson:  string,
  userQuestion,
  aiSystemPrompt,
  userId:      string,
  supabase:    SupabaseClient
): Promise<string> {

  const prompt: LLMRequest = {
    task:        'guru-guidance',
    systemPrompt: aiSystemPrompt,
    userId,
    maxTokens:   500,
    temperature: 0.7,
    userPrompt:  `
We are on Step: "${stepTitle}"

The lesson content covers: ${stepLesson.slice(0, 500)}...

Student question or request: ${userQuestion}

Respond as ${guruName} with specific, actionable guidance for this exact step.
`,
  };

  const response = await llmRequest(prompt, supabase);
  return response.text.trim();
}

// ─── SMART RECOMMENDATION ENGINE ─────────────────────────────
// Rule-based fast recommendations (no AI tokens needed)

export function computeSmartRecommendations(
  analytics:    MemoryOSAnalytics,
  dailyProgress: Record<string, { reviewDone; newDone; previewDone }>
): Recommendation[] {
  const recs: Recommendation[] = [];

  // Rule 1: High due count → urgent review
  if (analytics.cardsDue > 20) {
    recs.push({
      priority:   'high',
      category:   'session',
      title:      'Box Review Urgent',
      description: `${analytics.cardsDue} cards are due. Delayed reviews weaken the memory traces you have already built.`,
      action:     'Start Box Review now before doing anything else.',
      dataReason: `${analytics.cardsDue} cards past their review date.`,
    });
  }

  // Rule 2: Low mastery → reduce new cards
  if (analytics.masteryRate < 50 && analytics.totalReviews > 30) {
    recs.push({
      priority:   'high',
      category:   'session',
      title:      'Reduce New Card Pace',
      description: 'Your mastery rate suggests existing cards are not being fully consolidated before new ones are added.',
      action:     'Reduce daily new cards to 5 in Settings until mastery rate reaches 65%.',
      dataReason: `Mastery rate is ${analytics.masteryRate}% (target: 65%+).`,
    });
  }

  // Rule 3: No streak → habit building
  if (analytics.streak === 0) {
    recs.push({
      priority:   'high',
      category:   'habit',
      title:      'Start Your Daily Streak',
      description: 'Consistency is the single most important factor in memory training. Even 10 minutes daily beats 2 hours once a week.',
      action:     'Set a daily MemoryOS alarm for the same time every day. Start tomorrow.',
      dataReason: 'No active streak detected.',
    });
  }

  // Rule 4: Good mastery → push to Nobel Mind
  if (analytics.masteryRate >= 70 && analytics.cardsMastered >= 20) {
    recs.push({
      priority:   'medium',
      category:   'nobel',
      title:      'Explore Nobel Mind',
      description: 'Your strong mastery rate shows your memory system is working. Nobel Mind content will challenge it with new domains.',
      action:     'Open Nobel Mind and start Scientific Thinking domain.',
      dataReason: `${analytics.masteryRate}% mastery, ${analytics.cardsMastered} cards mastered.`,
    });
  }

  // Rule 5: Low activity → suggest guru center
  const activeDays = analytics.last7Days.filter(d => d.total > 0).length;
  if (activeDays <= 2 && analytics.totalReviews < 50) {
    recs.push({
      priority:   'medium',
      category:   'guru',
      title:      'Try Guru-Guided Training',
      description: 'Structured guru guidance may help build the habit more effectively than self-directed practice.',
      action:     'Open Guru Center and start with Tony Buzan Step 1.',
      dataReason: `Only ${activeDays} active days in the last 7.`,
    });
  }

  return recs.slice(0, 4); // max 4 recommendations at once
}

// ─── SECTION ORDER TYPES (for draggable dashboard) ───────────



export const DEFAULT_SECTION_ORDER[] = [
  { id: 'guru-center',       label: 'Guru Center',       icon: '🧠', visible: true, order: 0 },
  { id: 'knowledge-archive', label: 'Knowledge Archive', icon: '📚', visible: true, order: 1 },
  { id: 'nobel-mind',        label: 'Nobel Mind',        icon: '🏆', visible: true, order: 2 },
  { id: 'ai-mind-lab',       label: 'AI Mind Lab',       icon: '🤖', visible: true, order: 3 },
];

export async function saveSectionOrder(
  sections[],
  userId:   string,
  supabase
): Promise<void> {
  await supabase
    .from('memoryos_user_settings')
    .upsert({
      user_id:       userId,
      section_order: sections,
      updated_at:    new Date().toISOString(),
    }, { onConflict: 'user_id' });
}

export async function loadSectionOrder(
  userId:   string,
  supabase
): Promise<SectionConfig[]> {
  const { data } = await supabase
    .from('memoryos_user_settings')
    .select('section_order')
    .eq('user_id', userId)
    .single();

  if (data?.section_order && Array.isArray(data.section_order)) {
    return data.section_order as SectionConfig[];
  }

  return DEFAULT_SECTION_ORDER;
}
