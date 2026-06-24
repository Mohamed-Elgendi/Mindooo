export const BOXES = [
  { box: 1,  label: '1 hour',     short: '1h',   ms: 3600000 },
  { box: 2,  label: '24 hours',   short: '24h',  ms: 86400000 },
  { box: 3,  label: '3 days',     short: '3d',   ms: 259200000 },
  { box: 4,  label: '7 days',     short: '7d',   ms: 604800000 },
  { box: 5,  label: '14 days',    short: '14d',  ms: 1209600000 },
  { box: 6,  label: '21 days',    short: '21d',  ms: 1814400000 },
  { box: 7,  label: '30 days',    short: '30d',  ms: 2592000000 },
  { box: 8,  label: '40 days',    short: '40d',  ms: 3456000000 },
  { box: 9,  label: '60 days',    short: '60d',  ms: 5184000000 },
  { box: 10, label: '90 days',    short: '90d',  ms: 7776000000 },
  { box: 11, label: '120 days',   short: '4mo',  ms: 10368000000 },
  { box: 12, label: '180 days',   short: '6mo',  ms: 15552000000 },
  { box: 13, label: '9 months',   short: '9mo',  ms: 23328000000 },
  { box: 14, label: '1 year',     short: '1yr',  ms: 31536000000 },
  { box: 15, label: '∞ 3 months', short: '∞3mo', ms: 7776000000 },
];
export const MAX_BOX = 15, MASTERED_BOX = 14, NEW_BOX = 0, HIGH_BOX = 8;
export function getBox(box) { return BOXES[Math.max(1, Math.min(box, MAX_BOX)) - 1]; }
export function getNextDueAt(box) { return new Date(Date.now() + getBox(box).ms); }
export function isCardDue(dueAt) { if (!dueAt) return true; return new Date() >= new Date(dueAt); }
export function calculateBoxTransition(currentBox, result) {
  if (result === 'owned') { const n = Math.min(currentBox + 1, MAX_BOX); return { nextBox: n, nextDueAt: getNextDueAt(n) }; }
  if (result === 'almost') { const n = Math.max(currentBox, 1); return { nextBox: n, nextDueAt: getNextDueAt(n) }; }
  return { nextBox: 1, nextDueAt: getNextDueAt(1) };
}
export function buildBoxStatus(cards) {
  return BOXES.slice(0, 14).map(b => {
    const bc = cards.filter(c => c.box === b.box);
    const dc = bc.filter(c => isCardDue(c.dueAt));
    return { box: b.box, label: b.label, short: b.short, count: bc.length, dueCount: dc.length, isEmpty: bc.length === 0 };
  });
}
