export const NEW_LEARNING_PHASES = [
  { id: 1, label: 'Read',          icon: '👁️',   colorKey: 'teal',  blind: false, writing: false, desc: 'Eyes open. Read every word aloud, slowly and deliberately.' },
  { id: 2, label: 'Read → Recite', icon: '👁️🗣️', colorKey: 'sky',   blind: false, writing: false, desc: 'Read it once, then immediately recite aloud from memory.' },
  { id: 3, label: 'Recite Blind',  icon: '🗣️',   colorKey: 'sage',  blind: true,  writing: false, desc: 'Eyes closed. Speak the entire unit from memory. Zero hesitation.' },
  { id: 4, label: 'Read Again',    icon: '👁️',   colorKey: 'gold',  blind: false, writing: false, desc: 'Eyes open. Read again. Re-anchor visually before writing.' },
  { id: 5, label: 'Read → Write',  icon: '✍️👁️', colorKey: 'amber', blind: false, writing: true,  desc: 'Read it, then write it from memory. Written bridge.' },
  { id: 6, label: 'Write Blind',   icon: '✍️',   colorKey: 'rose',  blind: true,  writing: true,  desc: 'Eyes closed. Write from memory. Word for word. Exact.' },
];
export const REVIEW_PHASES = [
  { id: 1, label: 'Read → Recite', icon: '👁️🗣️', colorKey: 'sky',   blind: false, writing: false, desc: 'Read it once, then immediately recite aloud from memory.' },
  { id: 2, label: 'Recite Blind',  icon: '🗣️',   colorKey: 'sage',  blind: true,  writing: false, desc: 'Eyes closed. Speak the entire unit from memory.' },
  { id: 3, label: 'Read → Write',  icon: '✍️👁️', colorKey: 'amber', blind: false, writing: true,  desc: 'Read it, then write it from memory.' },
  { id: 4, label: 'Write Blind',   icon: '✍️',   colorKey: 'rose',  blind: true,  writing: true,  desc: 'Eyes closed. Write from memory. Word for word. Exact.' },
];
export function getPhasesForSession(t) { return t === 'new' ? NEW_LEARNING_PHASES : REVIEW_PHASES; }
export function getPhaseIndexMap(phases) {
  return {
    reciteBlindIndex: phases.findIndex(p => p.blind && !p.writing),
    writeBridgeIndex: phases.findIndex(p => !p.blind && p.writing),
    writeBlindIndex:  phases.findIndex(p => p.blind && p.writing),
    totalPhases:      phases.length,
  };
}
export function getFailRestartRules(phases) {
  return { verbalFailRestartIndex: 0, writtenFailRestartIndex: phases.findIndex(p => !p.blind && p.writing) };
}
export const PHASE_COLORS = { teal:'#3dd9c4', sky:'#4db8f0', sage:'#5ec997', gold:'#f5c842', amber:'#f5a623', rose:'#f0657a', violet:'#a78bfa' };
export function getPhaseColor(k) { return PHASE_COLORS[k] || '#3dd9c4'; }
export const PHASE_BG_TINTS = { teal:'#020e0d', sky:'#020d12', sage:'#030f07', gold:'#0f0d00', amber:'#120900', rose:'#120009', violet:'#0a0520' };
export function getPhaseBgTint(k) { return PHASE_BG_TINTS[k] || '#07080f'; }
const REP_LABELS = { 'Read':'👁️ Read it','Read → Recite':'👁️🗣️ Recited!','Recite Blind':'🗣️ Said it!','Read Again':'👁️ Read it','Read → Write':'✍️ Wrote it!','Write Blind':'✍️ Done!' };
export function getRepButtonLabel(phase) { return REP_LABELS[phase.label] || '✓ Done'; }
