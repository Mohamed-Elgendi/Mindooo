// src/modules/memoryos/hooks/useProgress.js
import { useState, useEffect, useCallback } from 'react';
import { MASTERED_BOX, isCardDue } from '../config/boxes.config.js';

export function useProgress(supabase, userId, curricula, allCards) {
  const [analytics, setAnalytics] = useState(null);
  const [streak,    setStreak]    = useState(0);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  function getDueCount(curriculumId) {
    return (allCards[curriculumId] || []).filter(c => c.box > 0 && isCardDue(c.dueAt)).length;
  }
  function getNewCount(curriculumId) {
    return (allCards[curriculumId] || []).filter(c => c.box === 0).length;
  }
  function getMasteredCount(curriculumId) {
    return (allCards[curriculumId] || []).filter(c => c.box >= MASTERED_BOX).length;
  }
  function getTotalCount(curriculumId) {
    return (allCards[curriculumId] || []).length;
  }
  function getGlobalStats() {
    const flat = Object.values(allCards).flat();
    return {
      total:    flat.length,
      inBoxes:  flat.filter(c => c.box > 0).length,
      mastered: flat.filter(c => c.box >= MASTERED_BOX).length,
      due:      flat.filter(c => c.box > 0 && isCardDue(c.dueAt)).length,
    };
  }

  const computeLocalAnalytics = useCallback(() => {
    const flat = Object.values(allCards).flat();
    const boxDist = {};
    for (let i = 0; i <= 15; i++) boxDist[i] = 0;
    flat.forEach(c => { boxDist[c.box] = (boxDist[c.box] || 0) + 1; });

    const perCurriculum = (curricula || []).map(cur => {
      const cards        = allCards[cur.id] || [];
      const totalReviews = cards.reduce((s, c) => s + (c.totalReviews || 0), 0);
      const totalOwned   = cards.reduce((s, c) => s + (c.totalOwned   || 0), 0);
      const masteryRate  = totalReviews > 0 ? Math.round((totalOwned / totalReviews) * 100) : 0;
      return {
        curriculumId: cur.id, label: cur.label, icon: cur.icon,
        colorKey: cur.colorKey || 'teal', totalCards: cards.length,
        inBoxes:  cards.filter(c => c.box > 0).length,
        due:      cards.filter(c => c.box > 0 && isCardDue(c.dueAt)).length,
        mastered: cards.filter(c => c.box >= MASTERED_BOX).length,
        reviews: totalReviews, masteryRate,
      };
    });

    const totalReviews = flat.reduce((s, c) => s + (c.totalReviews || 0), 0);
    const totalOwned   = flat.reduce((s, c) => s + (c.totalOwned   || 0), 0);
    const totalAlmost  = flat.reduce((s, c) => s + (c.totalAlmost  || 0), 0);
    const totalFailed  = flat.reduce((s, c) => s + (c.totalFailed  || 0), 0);

    return {
      totalCards:      flat.length,
      totalReviews, totalOwned, totalAlmost, totalFailed,
      cardsInBoxes:    flat.filter(c => c.box > 0).length,
      cardsMastered:   flat.filter(c => c.box >= MASTERED_BOX).length,
      cardsDue:        flat.filter(c => c.box > 0 && isCardDue(c.dueAt)).length,
      masteryRate:     totalReviews > 0 ? Math.round((totalOwned / totalReviews) * 100) : 0,
      boxDistribution: boxDist,
      perCurriculum,
    };
  }, [allCards, curricula]);

  const fetchStreak = useCallback(async () => {
    try {
      const { data } = await supabase.rpc('memoryos_get_streak', { p_user_id: userId });
      return data ?? 0;
    } catch { return 0; }
  }, [supabase, userId]);

  const fetchLast7Days = useCallback(async () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({ date: dateStr, label: d.toLocaleDateString('en', { weekday: 'short' }), total: 0, owned: 0, almost: 0, failed: 0 });
    }
    const startDate = days[0].date;
    try {
      const { data } = await supabase
        .from('memoryos_review_history')
        .select('result, reviewed_at')
        .eq('user_id', userId)
        .gte('reviewed_at', `${startDate}T00:00:00Z`);

      (data || []).forEach(row => {
        const dateStr = row.reviewed_at.split('T')[0];
        const day     = days.find(d => d.date === dateStr);
        if (!day) return;
        day.total++;
        if (row.result === 'owned')  day.owned++;
        if (row.result === 'almost') day.almost++;
        if (row.result === 'fail')   day.failed++;
      });
    } catch { /* return empty days */ }
    return days;
  }, [supabase, userId]);

  const refreshAnalytics = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [streakVal, last7Days] = await Promise.all([fetchStreak(), fetchLast7Days()]);
      const local = computeLocalAnalytics();
      setStreak(streakVal);
      setAnalytics({ streak: streakVal, ...local, last7Days });
    } catch (err) {
      setError(err?.message || 'Analytics error');
    } finally {
      setLoading(false);
    }
  }, [userId, fetchStreak, fetchLast7Days, computeLocalAnalytics]);

  useEffect(() => {
    if (userId && Object.keys(allCards).length > 0) refreshAnalytics();
  }, [userId, allCards, refreshAnalytics]);

  function buildEmptyDailyProgress(curriculumId) {
    return { curriculumId, date: new Date().toISOString().split('T')[0], reviewDone: false, newDone: false, previewDone: false };
  }
  function isAllDone(progress) {
    return progress.reviewDone && progress.newDone && progress.previewDone;
  }

  return {
    analytics, streak, loading, error, refreshAnalytics,
    buildEmptyDailyProgress, isAllDone,
    getDueCount, getNewCount, getMasteredCount, getTotalCount, getGlobalStats,
  };
}
