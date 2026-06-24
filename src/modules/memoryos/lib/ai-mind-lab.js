// src/modules/memoryos/lib/ai-mind-lab.js
// Uses the platform's existing callAI() — no separate gateway needed
// All API keys, providers, and quota management handled by the platform

import { callAI } from '../../../services/ai.js';

// ─── SYSTEM PROMPTS ───────────────────────────────────────────

const MIND_ANALYSIS_SYSTEM = `You are MemoryOS Mind Analyst — an expert in memory science, learning psychology, and cognitive performance optimization. You analyze a user's memory training data and produce a precise, data-driven assessment of their current mind state, strengths, weaknesses, and specific actionable recommendations. You speak with authority and warmth. Every recommendation names a specific action with a specific frequency. Respond ONLY with valid JSON — no markdown, no explanation.`;

const CARD_GENERATOR_SYSTEM = `You are MemoryOS Card Generator — an expert at converting any body of text into perfectly structured memory flashcards. Each card must contain one complete, self-contained unit of information that can be read aloud, recited, and written from memory. You ALWAYS respond with valid JSON only — no markdown, no explanation, just the JSON array.`;

const COACH_SYSTEM = `You are MemoryOS Coach — a personal AI memory coach with deep expertise in all major memory systems (Method of Loci, PAO, Link System, Major System, Mind Mapping) and the neuroscience of learning. You have intimate knowledge of Tony Buzan, Dominic O'Brien, Harry Lorayne, Kevin Trudeau, and Joshua Foer's methods. You coach one step at a time. You ask one question at a time. You give specific, actionable guidance. You are warm, encouraging, and direct.`;

const PERFORMANCE_SYSTEM = `You are MemoryOS Performance Analyst. You interpret memory training analytics and translate them into clear, human-readable insights and specific recommendations. Every insight is tied to a specific data point. Every recommendation is specific and actionable. Respond only with valid JSON.`;

// ─── DATA SUMMARY BUILDER ─────────────────────────────────────

function buildDataSummary(analytics) {
  const { last7Days = [] } = analytics;
  const activeDays = last7Days.filter(d => d.total > 0).length;
  const avgPerDay  = last7Days.reduce((s, d) => s + d.total, 0) / 7;
  return `
- Streak: ${analytics.streak} days
- Mastery Rate: ${analytics.masteryRate}%
- Total Cards: ${analytics.totalCards}
- Cards in Boxes: ${analytics.cardsInBoxes}
- Cards Mastered: ${analytics.cardsMastered}
- Cards Due: ${analytics.cardsDue}
- Total Reviews: ${analytics.totalReviews}
- Owned: ${analytics.totalOwned}
- Almost: ${analytics.totalAlmost}
- Failed: ${analytics.totalFailed}
- Active Days Last 7: ${activeDays}/7
- Avg Reviews Per Day: ${avgPerDay.toFixed(1)}
- Per Curriculum: ${(analytics.perCurriculum || []).map(c => `${c.label}: ${c.totalCards} cards, ${c.masteryRate}% mastery`).join(', ')}
  `.trim();
}

// ─── FALLBACK REPORT ──────────────────────────────────────────

function computeFallbackReport(analytics) {
  const { masteryRate = 0, streak = 0, totalCards = 0, totalReviews = 0 } = analytics;
  let overallLevel = 'beginner';
  if (masteryRate >= 80 && totalReviews >= 500) overallLevel = 'master';
  else if (masteryRate >= 70 && totalReviews >= 200) overallLevel = 'advanced';
  else if (masteryRate >= 60 && totalReviews >= 100) overallLevel = 'intermediate';
  else if (masteryRate >= 40 && totalReviews >= 30)  overallLevel = 'developing';
  return {
    overallLevel,
    memoryCapacity:    Math.min(100, Math.round((totalCards / 200) * 100)),
    retentionStrength: masteryRate,
    consistencyScore:  Math.min(100, streak * 5),
    masteryRate,
    strengths:         masteryRate >= 60 ? ['Strong recall rate', 'Consistent practice'] : ['Getting started with memory training'],
    weaknesses:        masteryRate < 60  ? ['Mastery rate needs improvement'] : [],
    recommendations: [{
      priority: 'high', category: 'session',
      title: 'Complete daily Box Review first',
      description: 'Your retention improves fastest when reviews happen at the right intervals.',
      action: 'Start every day with Box Review before New Learning.',
      dataReason: `You have ${analytics.cardsDue || 0} cards due right now.`,
    }],
    nextMilestone: '50% mastery rate',
    estimatedDaysToNextLevel: 14,
    aiNarrative: `You have reviewed ${totalReviews} cards with a ${masteryRate}% mastery rate. Keep your daily practice consistent and your retention will grow exponentially.`,
  };
}

// ─── MIND STATE ANALYSIS ──────────────────────────────────────

export async function analyzeMindState(analytics, userId) {
  const result = await callAI({
    userId,
    systemPrompt: MIND_ANALYSIS_SYSTEM,
    messages: [{
      role: 'user',
      content: `Analyze this MemoryOS training data and return a Mind State Report as JSON.

${buildDataSummary(analytics)}

Return ONLY this exact JSON structure:
{
  "overallLevel": "beginner|developing|intermediate|advanced|master",
  "memoryCapacity": 0,
  "retentionStrength": 0,
  "consistencyScore": 0,
  "masteryRate": 0,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommendations": [{"priority":"high","category":"session","title":"string","description":"string","action":"string","dataReason":"string"}],
  "nextMilestone": "string",
  "estimatedDaysToNextLevel": 14,
  "aiNarrative": "2-3 sentence personalized summary"
}`,
    }],
    maxTokens: 1200,
  });

  try {
    const clean = (result.text || '').replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return computeFallbackReport(analytics);
  }
}

// ─── CARD GENERATOR ───────────────────────────────────────────

export async function generateCardsFromText(text, topic, cardCount = 8, userId) {
  const result = await callAI({
    userId,
    systemPrompt: CARD_GENERATOR_SYSTEM,
    messages: [{
      role: 'user',
      content: `Convert this text into ${cardCount} MemoryOS flashcards about "${topic}".

TEXT:
${text.slice(0, 3000)}${text.length > 3000 ? '... [truncated]' : ''}

Rules:
- Each unit: 2-4 sentences, 30-80 words, self-contained
- Begin with the most important claim
- 3-5 keyPoints per card (retrieval hooks not summaries)
- Difficulty: simple / technique / complex
- Relevant emoji icon

Return ONLY this JSON array:
[{"unit":"complete text to memorize","keyPoints":["hook1","hook2","hook3"],"topic":"sub-topic","difficulty":"simple","icon":"emoji"}]`,
    }],
    maxTokens: 2000,
  });

  try {
    const clean  = (result.text || '').replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ─── AI COACH ─────────────────────────────────────────────────

export async function sendCoachMessage(message, history, userId) {
  // Build conversation history in the format callAI expects
  const messages = [
    ...history.slice(-10).map(m => ({
      role:    m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
    { role: 'user', content: message },
  ];

  const result = await callAI({
    userId,
    systemPrompt: COACH_SYSTEM,
    messages,
    maxTokens: 600,
  });

  return result.text?.trim() || "I'm having trouble connecting. Please check your AI Providers settings.";
}

// Stream via yield (callAI is non-streaming but we yield the full response)
export async function* streamCoachMessage(message, history, userId) {
  const reply = await sendCoachMessage(message, history, userId);
  yield reply;
}

// ─── PERFORMANCE INSIGHTS ─────────────────────────────────────

export async function generatePerformanceInsights(analytics, userId) {
  const result = await callAI({
    userId,
    systemPrompt: PERFORMANCE_SYSTEM,
    messages: [{
      role: 'user',
      content: `Generate 4-6 specific performance insights from this MemoryOS training data.

${buildDataSummary(analytics)}

Return ONLY a JSON array:
[{"type":"warning|success|suggestion|milestone","title":"short title","message":"1-2 sentence insight","metric":"optional metric name","value":"optional value"}]`,
    }],
    maxTokens: 600,
  });

  try {
    const clean  = (result.text || '').replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed) ? parsed : computeFallbackInsights(analytics);
  } catch {
    return computeFallbackInsights(analytics);
  }
}

function computeFallbackInsights(analytics) {
  const insights = [];
  const { streak = 0, cardsDue = 0, masteryRate = 0, totalReviews = 0, last7Days = [] } = analytics;

  if (streak >= 7)
    insights.push({ type: 'milestone', title: `${streak}-Day Streak!`, message: 'Outstanding consistency. The most powerful force in memory training.', metric: 'Streak', value: streak });
  if (cardsDue > 10)
    insights.push({ type: 'warning', title: 'Reviews Accumulating', message: `${cardsDue} cards due. Delayed reviews weaken retention. Start Box Review today.`, metric: 'Due', value: cardsDue });
  if (masteryRate >= 80)
    insights.push({ type: 'success', title: 'Strong Mastery Rate', message: `Your ${masteryRate}% mastery rate is excellent. Building genuine long-term retention.`, metric: 'Mastery', value: `${masteryRate}%` });
  if (masteryRate < 50 && totalReviews > 20)
    insights.push({ type: 'suggestion', title: 'Mastery Rate Below 50%', message: 'Reduce daily new cards and focus on reviewing existing ones until mastery improves.', metric: 'Mastery', value: `${masteryRate}%` });

  const activeDays = last7Days.filter(d => d.total > 0).length;
  if (activeDays < 4)
    insights.push({ type: 'suggestion', title: 'Inconsistent Practice', message: `Only ${activeDays} active days last week. Daily practice beats occasional long sessions.` });

  return insights;
}

// ─── GURU STEP AI GUIDANCE ────────────────────────────────────

export async function getGuruStepGuidance(guruName, stepTitle, stepLesson, userQuestion, aiSystemPrompt, userId) {
  const result = await callAI({
    userId,
    systemPrompt: aiSystemPrompt,
    messages: [{
      role: 'user',
      content: `Step: "${stepTitle}"
Lesson summary: ${stepLesson.slice(0, 400)}
Student question: ${userQuestion}
Respond as ${guruName} with specific, actionable guidance for this exact step.`,
    }],
    maxTokens: 500,
  });

  return result.text?.trim() || `Unable to connect. Please check AI Providers settings.`;
}

// ─── SMART RECOMMENDATIONS (rule-based, no AI tokens) ─────────

export function computeSmartRecommendations(analytics, dailyProgress) {
  const recs = [];
  const { cardsDue = 0, masteryRate = 0, streak = 0, cardsMastered = 0, last7Days = [] } = analytics;

  if (cardsDue > 20)
    recs.push({ priority: 'high', category: 'session', title: 'Box Review Urgent',
      description: `${cardsDue} cards are due. Delayed reviews weaken the memory traces you have built.`,
      action: 'Start Box Review now before doing anything else.',
      dataReason: `${cardsDue} cards past their review date.` });

  if (masteryRate < 50 && (analytics.totalReviews || 0) > 30)
    recs.push({ priority: 'high', category: 'session', title: 'Reduce New Card Pace',
      description: 'Your mastery rate suggests cards are not consolidating before new ones are added.',
      action: 'Reduce daily new cards to 5 in Settings until mastery reaches 65%.',
      dataReason: `Mastery rate is ${masteryRate}% (target: 65%+).` });

  if (streak === 0)
    recs.push({ priority: 'high', category: 'habit', title: 'Start Your Daily Streak',
      description: 'Consistency is the single most important factor in memory training.',
      action: 'Set a daily MemoryOS alarm for the same time every day.',
      dataReason: 'No active streak detected.' });

  if (masteryRate >= 70 && cardsMastered >= 20)
    recs.push({ priority: 'medium', category: 'nobel', title: 'Explore Nobel Mind',
      description: 'Your strong mastery shows your memory system is working. Nobel Mind will challenge it.',
      action: 'Open Nobel Mind and start Scientific Thinking.',
      dataReason: `${masteryRate}% mastery, ${cardsMastered} cards mastered.` });

  const activeDays = last7Days.filter(d => d.total > 0).length;
  if (activeDays <= 2 && (analytics.totalReviews || 0) < 50)
    recs.push({ priority: 'medium', category: 'guru', title: 'Try Guru-Guided Training',
      description: 'Structured guru guidance builds the habit more effectively than self-directed practice.',
      action: 'Open Guru Center and start with Tony Buzan Step 1.',
      dataReason: `Only ${activeDays} active days in the last 7.` });

  return recs.slice(0, 4);
}

// ─── SECTION ORDER ────────────────────────────────────────────

export const DEFAULT_SECTION_ORDER = [
  { id: 'guru-center',       label: 'Guru Center',       icon: '🧠', visible: true, order: 0 },
  { id: 'knowledge-archive', label: 'Knowledge Archive', icon: '📚', visible: true, order: 1 },
  { id: 'nobel-mind',        label: 'Nobel Mind',        icon: '🏆', visible: true, order: 2 },
  { id: 'ai-mind-lab',       label: 'AI Mind Lab',       icon: '🤖', visible: true, order: 3 },
];

export async function saveSectionOrder(sections, userId, supabase) {
  await supabase
    .from('memoryos_user_settings')
    .upsert({ user_id: userId, section_order: sections, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
}

export async function loadSectionOrder(userId, supabase) {
  const { data } = await supabase
    .from('memoryos_user_settings')
    .select('section_order')
    .eq('user_id', userId)
    .single();
  if (data?.section_order && Array.isArray(data.section_order)) return data.section_order;
  return DEFAULT_SECTION_ORDER;
}
