import { useState, useEffect, useCallback } from 'react';
import { MASTERED_BOX, isCardDue } from '../config/boxes.config.js';
export function useProgress(supabase, userId, curricula, allCards) {
  const [analytics, setAnalytics] = useState(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  function getDueCount(cid) { return (allCards[cid]||[]).filter(c=>c.box>0&&isCardDue(c.dueAt)).length; }
  function getNewCount(cid) { return (allCards[cid]||[]).filter(c=>c.box===0).length; }
  function getMasteredCount(cid) { return (allCards[cid]||[]).filter(c=>c.box>=MASTERED_BOX).length; }
  function getTotalCount(cid) { return (allCards[cid]||[]).length; }
  function getGlobalStats() {
    const flat = Object.values(allCards).flat();
    return { total:flat.length, inBoxes:flat.filter(c=>c.box>0).length, mastered:flat.filter(c=>c.box>=MASTERED_BOX).length, due:flat.filter(c=>c.box>0&&isCardDue(c.dueAt)).length };
  }
  const computeLocalAnalytics = useCallback(() => {
    const flat = Object.values(allCards).flat();
    const boxDist = {}; for(let i=0;i<=15;i++) boxDist[i]=0;
    flat.forEach(c=>{boxDist[c.box]=(boxDist[c.box]||0)+1;});
    const perCurriculum = (curricula||[]).map(cur => {
      const cards = allCards[cur.id]||[];
      const tr = cards.reduce((s,c)=>s+(c.totalReviews||0),0);
      const to = cards.reduce((s,c)=>s+(c.totalOwned||0),0);
      return { curriculumId:cur.id, label:cur.label, icon:cur.icon, colorKey:cur.colorKey||'teal', totalCards:cards.length, inBoxes:cards.filter(c=>c.box>0).length, due:cards.filter(c=>c.box>0&&isCardDue(c.dueAt)).length, mastered:cards.filter(c=>c.box>=MASTERED_BOX).length, reviews:tr, masteryRate:tr>0?Math.round((to/tr)*100):0 };
    });
    const tr=flat.reduce((s,c)=>s+(c.totalReviews||0),0), to=flat.reduce((s,c)=>s+(c.totalOwned||0),0), ta=flat.reduce((s,c)=>s+(c.totalAlmost||0),0), tf=flat.reduce((s,c)=>s+(c.totalFailed||0),0);
    return { totalCards:flat.length, totalReviews:tr, totalOwned:to, totalAlmost:ta, totalFailed:tf, cardsInBoxes:flat.filter(c=>c.box>0).length, cardsMastered:flat.filter(c=>c.box>=MASTERED_BOX).length, cardsDue:flat.filter(c=>c.box>0&&isCardDue(c.dueAt)).length, masteryRate:tr>0?Math.round((to/tr)*100):0, boxDistribution:boxDist, perCurriculum };
  }, [allCards, curricula]);
  const fetchStreak = useCallback(async () => { try { const {data} = await supabase.rpc('memoryos_get_streak',{p_user_id:userId}); return data??0; } catch { return 0; } }, [supabase, userId]);
  const fetchLast7Days = useCallback(async () => {
    const days=[]; for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const ds=d.toISOString().split('T')[0];days.push({date:ds,label:d.toLocaleDateString('en',{weekday:'short'}),total:0,owned:0,almost:0,failed:0});}
    try { const {data} = await supabase.from('memoryos_review_history').select('result, reviewed_at').eq('user_id',userId).gte('reviewed_at',`${days[0].date}T00:00:00Z`);
      (data||[]).forEach(row=>{const day=days.find(d=>d.date===row.reviewed_at.split('T')[0]);if(!day)return;day.total++;if(row.result==='owned')day.owned++;if(row.result==='almost')day.almost++;if(row.result==='fail')day.failed++;});
    } catch {}
    return days;
  }, [supabase, userId]);
  const refreshAnalytics = useCallback(async () => {
    if (!userId) return; setLoading(true); setError(null);
    try {
      const [sv, last7Days] = await Promise.all([fetchStreak(), fetchLast7Days()]);
      const local = computeLocalAnalytics(); setStreak(sv);
      setAnalytics({ streak:sv, ...local, last7Days });
    } catch(e) { setError(e?.message||'Analytics error'); } finally { setLoading(false); }
  }, [userId, fetchStreak, fetchLast7Days, computeLocalAnalytics]);
  useEffect(() => { if(userId&&Object.keys(allCards).length>0) refreshAnalytics(); }, [userId, allCards, refreshAnalytics]);
  function buildEmptyDailyProgress(cid) { return {curriculumId:cid,date:new Date().toISOString().split('T')[0],reviewDone:false,newDone:false,previewDone:false}; }
  function isAllDone(p) { return p.reviewDone&&p.newDone&&p.previewDone; }
  return { analytics, streak, loading, error, refreshAnalytics, buildEmptyDailyProgress, isAllDone, getDueCount, getNewCount, getMasteredCount, getTotalCount, getGlobalStats };
}
