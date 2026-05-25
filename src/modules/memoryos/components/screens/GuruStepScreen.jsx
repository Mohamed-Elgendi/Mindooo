// src/modules/memoryos/components/screens/GuruStepScreen.jsx
import { useState } from 'react';
import { TopBar, BackButton, Tag, COLORS, PrimaryBtn, GhostBtn } from '../shared/UI.jsx';
import { getGuru } from '../../data/gurus.data.js';
import { getGuruStepGuidance } from '../../lib/ai-mind-lab.js';

export function GuruStepScreen({ m }) {
  const guruId   = m.navParams?.guruId || m.activeGuruId;
  const stepId   = m.navParams?.stepId || m.activeGuruStepId;
  const guru     = getGuru(guruId);
  const step     = guru?.roadmap.find(s => s.id === stepId);

  const [phase,      setPhase]      = useState('lesson');   // 'lesson' | 'action' | 'done'
  const [aiGuide,    setAiGuide]    = useState('');
  const [aiInput,    setAiInput]    = useState('');
  const [aiLoading,  setAiLoading]  = useState(false);
  const [completed,  setCompleted]  = useState(false);

  if (!guru || !step) {
    return (
      <div className="section-scroll">
        <div className="section-content">
          <BackButton onClick={() => m.navigate('guru-detail', { guruId })} />
          <div style={{ color: '#666', marginTop: 24 }}>Step not found.</div>
        </div>
      </div>
    );
  }

  const color        = COLORS[guru.colorKey] || COLORS.gold;
  const isCompleted  = (m.completedGuruSteps[guru.id] || []).includes(step.id);
  const stepIndex    = guru.roadmap.findIndex(s => s.id === step.id);
  const nextStep     = guru.roadmap[stepIndex + 1];
  const isAI         = m.guruGuidanceMode === 'ai';
  const isHybrid     = m.guruGuidanceMode === 'hybrid';

  async function handleAskGuru() {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    try {
      const response = await getGuruStepGuidance(
        guru.name,
        step.title,
        step.lesson,
        aiInput,
        guru.aiSystemPrompt,
        m.progress?.analytics?.userId || 'user',
        m.session?.supabase || null,
      );
      setAiGuide(response);
    } catch {
      setAiGuide('Unable to connect to AI right now. Use the pre-written guidance above.');
    } finally {
      setAiLoading(false);
    }
  }

  async function markComplete() {
    setCompleted(true);
    await m.completeGuruStep(guru.id, step.id);
  }

  function goNext() {
    if (nextStep) {
      m.setActiveGuruStep(nextStep.id);
      m.navigate('guru-step', { guruId: guru.id, stepId: nextStep.id });
      setPhase('lesson');
      setAiGuide('');
      setAiInput('');
      setCompleted(false);
    } else {
      m.navigate('guru-detail', { guruId: guru.id });
    }
  }

  return (
    <div className="section-scroll">
      <div className="section-content">

        <TopBar
          left={<BackButton onClick={() => m.navigate('guru-detail', { guruId })} />}
          center={
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color, fontWeight: 700, letterSpacing: 1 }}>{guru.icon} {guru.name}</div>
              <div style={{ fontSize: 10, color: '#444' }}>Step {step.stepNumber} of {guru.roadmap.length}</div>
            </div>
          }
        />

        {/* Step header */}
        <div style={{ background: color + '10', border: `1px solid ${color}33`, borderRadius: 16, padding: '18px 18px', marginBottom: 18 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: color + '22', border: `1.5px solid ${color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color, flexShrink: 0,
            }}>{step.stepNumber}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color }}>{step.title}</div>
              <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>⏱ {step.duration}</div>
            </div>
          </div>

          {/* Phase tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['lesson', 'action'].map(p => (
              <button key={p}
                onClick={() => setPhase(p)}
                style={{
                  flex: 1, padding: '8px', borderRadius: 8,
                  border: `1px solid ${phase === p ? color : COLORS.border2}`,
                  background: phase === p ? color + '22' : COLORS.surface2,
                  color: phase === p ? color : '#555',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {p === 'lesson' ? '📖 Lesson' : '⚡ Action'}
              </button>
            ))}
          </div>
        </div>

        {/* LESSON PHASE */}
        {phase === 'lesson' && (
          <div>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: '18px 18px', marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: '#444', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>The Lesson</div>
              <div style={{ fontSize: 14, lineHeight: 1.85, color: COLORS.text, fontStyle: 'italic', borderLeft: `3px solid ${color}`, paddingLeft: 14 }}>
                {step.lesson}
              </div>
            </div>

            {/* AI guidance for lesson */}
            {(isAI || isHybrid) && (
              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.violet}33`, borderRadius: 14, padding: '16px 18px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: COLORS.violet, fontWeight: 700, marginBottom: 10 }}>
                  🤖 Ask {guru.name} a question about this lesson
                </div>
                <textarea
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  placeholder={`Ask ${guru.name} anything about this lesson...`}
                  style={S.textarea}
                  rows={3}
                />
                <button
                  onClick={handleAskGuru}
                  disabled={aiLoading || !aiInput.trim()}
                  style={{ ...S.aiBtn, background: aiLoading || !aiInput.trim() ? COLORS.surface2 : COLORS.violet + '22', color: COLORS.violet, border: `1px solid ${COLORS.violet}44` }}
                >
                  {aiLoading ? '⏳ Thinking...' : `Ask ${guru.name} →`}
                </button>
                {aiGuide && (
                  <div style={{ marginTop: 14, background: COLORS.violet + '10', border: `1px solid ${COLORS.violet}33`, borderRadius: 10, padding: '14px 16px', fontSize: 13, color: '#ccc', lineHeight: 1.75 }}>
                    <div style={{ fontSize: 10, color: COLORS.violet, fontWeight: 700, marginBottom: 8 }}>{guru.name} says:</div>
                    {aiGuide}
                  </div>
                )}
              </div>
            )}

            <PrimaryBtn color={color} onClick={() => setPhase('action')} style={{ width: '100%' }}>
              Ready for the Practical Action →
            </PrimaryBtn>
          </div>
        )}

        {/* ACTION PHASE */}
        {phase === 'action' && (
          <div>
            <div style={{ background: COLORS.surface, border: `1px solid ${color}33`, borderRadius: 14, padding: '18px 18px', marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: color, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
                ⚡ Your Practical Action
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>{step.practicalAction}</div>
              <div style={{ fontSize: 14, lineHeight: 1.85, color: '#aaa' }}>{step.actionPrompt}</div>
            </div>

            {/* Timer display */}
            <div style={{ background: COLORS.surface2, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>⏱</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>Suggested time: {step.duration}</div>
                <div style={{ fontSize: 11, color: '#555' }}>Set a timer and fully commit to this action before continuing.</div>
              </div>
            </div>

            {/* Practice on archive card */}
            {step.connectsTo && (
              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.teal}33`, borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: COLORS.teal, fontWeight: 700, marginBottom: 6 }}>💡 Practice this on a real card</div>
                <div style={{ fontSize: 12, color: '#666' }}>Open the Knowledge Archive and apply this technique to a card from your curriculum.</div>
                <button onClick={() => m.navigate('knowledge-archive')} style={{ ...S.aiBtn, marginTop: 8, color: COLORS.teal, border: `1px solid ${COLORS.teal}44`, background: COLORS.teal + '18' }}>
                  Open Knowledge Archive →
                </button>
              </div>
            )}

            {/* Completion */}
            {!isCompleted && !completed ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <PrimaryBtn color={color} onClick={markComplete} style={{ width: '100%' }}>
                  ✓ I completed this action
                </PrimaryBtn>
                <GhostBtn onClick={() => setPhase('lesson')} style={{ width: '100%' }}>
                  ← Back to lesson
                </GhostBtn>
              </div>
            ) : (
              <div>
                <div style={{ background: color + '15', border: `1px solid ${color}44`, borderRadius: 12, padding: '16px 18px', marginBottom: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>🎯</div>
                  <div style={{ fontWeight: 800, fontSize: 15, color, marginBottom: 4 }}>Step Complete!</div>
                  <div style={{ fontSize: 12, color: '#666' }}>You have completed Step {step.stepNumber} of {guru.roadmap.length}.</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <PrimaryBtn color={color} onClick={goNext} style={{ width: '100%' }}>
                    {nextStep ? `→ Step ${nextStep.stepNumber}: ${nextStep.title}` : '✓ Back to Guru Overview'}
                  </PrimaryBtn>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

const S = {
  textarea: {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: `1px solid ${COLORS.border2}`, background: COLORS.surface2,
    color: COLORS.text, fontSize: 13, fontFamily: 'inherit',
    resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6,
    marginBottom: 8,
  },
  aiBtn: {
    width: '100%', padding: '10px', borderRadius: 9,
    fontSize: 12, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'inherit', border: 'none',
  },
};
