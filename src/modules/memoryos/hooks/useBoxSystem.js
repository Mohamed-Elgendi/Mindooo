import { BOXES, MAX_BOX, NEW_BOX, HIGH_BOX, MASTERED_BOX, getNextDueAt, isCardDue, calculateBoxTransition, buildBoxStatus } from '../config/boxes.config.js';
export function useBoxSystem() {
  function getReviewQueue(cards) { return cards.filter(c => c.box > NEW_BOX && isCardDue(c.dueAt)).sort((a,b) => (a.dueAt?new Date(a.dueAt).getTime():0)-(b.dueAt?new Date(b.dueAt).getTime():0)); }
  function getNewQueue(cards, limit) { return cards.filter(c => c.box === NEW_BOX).slice(0, limit); }
  function getPreviewQueue(cards, limit=8) { return cards.filter(c => c.box > NEW_BOX && !isCardDue(c.dueAt)).sort((a,b)=>(a.dueAt?new Date(a.dueAt).getTime():Infinity)-(b.dueAt?new Date(b.dueAt).getTime():Infinity)).slice(0,limit); }
  function getQueueForSession(cards, sessionType, dailyNew) {
    if (sessionType==='review') return getReviewQueue(cards);
    if (sessionType==='new') return getNewQueue(cards, dailyNew);
    if (sessionType==='preview') return getPreviewQueue(cards);
    return [];
  }
  function applyResult(card, result) { return calculateBoxTransition(card.box, result); }
  function isHighBoxFail(card) { return card.box >= HIGH_BOX; }
  function countNew(cards) { return cards.filter(c => c.box === NEW_BOX).length; }
  function countDue(cards) { return cards.filter(c => c.box > NEW_BOX && isCardDue(c.dueAt)).length; }
  function countInBoxes(cards) { return cards.filter(c => c.box > NEW_BOX).length; }
  function countMastered(cards) { return cards.filter(c => c.box >= MASTERED_BOX).length; }
  function countByBox(cards) { const r={}; for(let i=0;i<=MAX_BOX;i++) r[i]=0; cards.forEach(c=>{r[c.box]=(r[c.box]||0)+1;}); return r; }
  function getBoxStatus(cards) { return buildBoxStatus(cards); }
  function hasCardsForSession(cards, sessionType, dailyNew) { return getQueueForSession(cards, sessionType, dailyNew).length > 0; }
  function getEmptySessionReason(cards, sessionType) {
    if (sessionType==='review') return countDue(cards)===0&&countInBoxes(cards)>0?'No cards due yet — all scheduled for future review.':'No cards in boxes yet — complete New Learning first.';
    if (sessionType==='new') return countNew(cards)===0&&countInBoxes(cards)>0?'All cards studied. Check Box Review.':'No cards available. Add cards first.';
    return 'No upcoming cards to preview yet.';
  }
  function canStartSession(cards, sessionType, dailyProgress, strictOrder) {
    if (!strictOrder) return true;
    const due = countDue(cards), nw = countNew(cards);
    if (sessionType==='review') return true;
    if (sessionType==='new') return due===0?true:(dailyProgress?.reviewDone||false);
    if (sessionType==='preview') return nw===0?(dailyProgress?.reviewDone||false):(dailyProgress?.newDone||false);
    return false;
  }
  function getBlockingSession(sessionType) { return sessionType==='new'?'review':sessionType==='preview'?'new':null; }
  return { getReviewQueue, getNewQueue, getPreviewQueue, getQueueForSession, applyResult, isHighBoxFail, countNew, countDue, countInBoxes, countMastered, countByBox, getBoxStatus, hasCardsForSession, getEmptySessionReason, canStartSession, getBlockingSession, BOXES, MAX_BOX, NEW_BOX, HIGH_BOX, MASTERED_BOX, getNextDueAt, isCardDue };
}
