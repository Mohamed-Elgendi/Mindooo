// src/modules/memoryos/components/screens/SessionScreen.jsx
import { useState } from 'react';
import { COLORS, MiniMindMap, Tag } from '../shared/UI.jsx';
import { getPhaseColor } from '../../config/phases.config.js';

export function SessionScreen({ m }) {
  const s    = m.session;
  const card = s.card;

  if (!card) return (
    <div className="section-scroll">
      <div className="section-content" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
        <div style={{ color: '#666', fontSize: 14 }}>No card loaded.</div>
        <button onClick={() => m.navigate('home')} style={btnBase}>← Back</button>
      </div>
    </div>
  );

  const phase   = s.curPhase;
  const color   = phase ? getPhaseColor(phase.colorKey) : COLORS.teal;
  const bg      = s.phaseBgTint || '#07080f';
  const cfg     = m.session.state.config;

  // Session type label
  const SESSION_LABELS = { new: '🔥 New Learning', review: '📦 Box Review', preview: '🔭 Preview' };
  const sessionLabel   = cfg ? SESSION_LABELS[cfg.sessionType] || '' : '';

  return (
    <div style={{ minHeight: '100vh', background: bg, transition: 'background .5s', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{ padding: '16px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => { s.endSession(); m.navigate('home'); }} style={{ background: 'none', border: 'none', color: '#444', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          ✕ End
        </button>
        <div style={{ fontSize: 12, color: '#444' }}>
          {s.state.currentIndex + 1} / {s.state.queue.length}
        </div>
        <div style={{ fontSize: 11, color: '#333' }}>{sessionLabel}</div>
      </div>

      {/* Session progress */}
      <div style={{ padding: '10px 20px 0' }}>
        <div style={{ height: 3, background: '#0f1020', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${s.sessionProgress}%`, background: color, borderRadius: 2, transition: 'width .3s' }} />
        </div>
      </div>

      {/* Phase tabs */}
      <div style={{ padding: '12px 20px 0', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {s.phases.map((ph, i) => {
          const phColor  = getPhaseColor(ph.colorKey);
          const isActive = i === s.state.currentPhase;
          const isDone   = i < s.state.currentPhase || (i === s.state.currentPhase && s.state.phaseDone);
          return (
            <div key={i} style={{
              padding:      '5px 10px',
              borderRadius: 20,
              background:   isActive ? phColor + '22' : 'transparent',
              border:       `1px solid ${isActive ? phColor : isDone ? phColor + '44' : '#1e2130'}`,
              fontSize:     11,
              fontWeight:   isActive ? 800 : 600,
              color:        isActive ? phColor : isDone ? phColor + 'aa' : '#333',
              whiteSpace:   'nowrap',
              flexShrink:   0,
              transition:   'all .2s',
            }}>
              {ph.icon} {ph.label}
            </div>
          );
        })}
      </div>

      {/* Phase description */}
      {phase && (
        <div style={{ padding: '10px 20px 0', fontSize: 12, color: '#555', lineHeight: 1.5, fontStyle: 'italic' }}>
          {phase.desc}
        </div>
      )}

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px 0' }}>

        {/* Card content */}
        {!s.isWriteBlind && (
          <div style={{
            background:   '#0a0c17',
            border:       `1.5px solid ${color}33`,
            borderRadius: 20,
            padding:      '22px 20px',
            marginBottom: 16,
            transition:   'border-color .4s',
          }}>
            {/* Card header */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
              {card.icon && <span style={{ fontSize: 22 }}>{card.icon}</span>}
              <div style={{ flex: 1 }}>
                {card.topic && <div style={{ fontSize: 10, color, fontWeight: 700, letterSpacing: 1 }}>{card.topic}</div>}
                {card.difficulty && <div style={{ fontSize: 9, color: '#333', marginTop: 2 }}>{card.difficulty}</div>}
              </div>
              <div style={{ display: 'flex', gap: 5, flexDirection: 'column', alignItems: 'flex-end' }}>
                <Tag color={COLORS.teal} style={{ fontSize: 9 }}>Box {card.box}</Tag>
              </div>
            </div>

            {/* Card unit — hidden when blind */}
            {!s.isBlindPhase ? (
              <div style={{ fontSize: 15, lineHeight: 1.9, color: '#e8eaf0', fontStyle: 'italic', letterSpacing: 0.1 }}>
                {card.unit}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>🙈</div>
                <div style={{ fontSize: 13, color: '#555' }}>Eyes closed — recite from memory</div>
              </div>
            )}

            {/* Key points */}
            {m.settings.showKeypoints && !s.isBlindPhase && card.keyPoints && (
              <div style={{ marginTop: 16, borderTop: `1px solid #1e2130`, paddingTop: 14 }}>
                <div style={{ fontSize: 9, color: '#333', letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>Key Points</div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {card.keyPoints.map((kp, i) => (
                    <div key={i} style={{ background: color + '12', border: `1px solid ${color}33`, borderRadius: 6, padding: '4px 10px', fontSize: 11, color: color + 'cc', fontWeight: 600 }}>{kp}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Mind map */}
            {m.settings.showMindmap && !s.isBlindPhase && card.mindmap && (
              <div style={{ marginTop: 14, background: '#060810', borderRadius: 12, padding: '12px', border: `1px solid #0f1020` }}>
                <MiniMindMap data={card.mindmap} />
              </div>
            )}
          </div>
        )}

        {/* PHASE VIEWS ─────────────────────────────────────── */}

        {/* Rep counter view */}
        {s.showRepCounter && (
          <RepCounterView s={s} color={color} />
        )}

        {/* Verbal check view */}
        {s.isVerbalCheck && (
          <VerbalCheckView s={s} color={color} />
        )}

        {/* Write bridge view */}
        {s.isWriteBridge && (
          <WriteBridgeView s={s} color={color} />
        )}

        {/* Write blind view */}
        {s.isWriteBlind && (
          <WriteBlindView s={s} card={card} color={color} m={m} />
        )}

        {/* Phase advance view */}
        {s.isPhaseAdvance && !s.state.cardDone && (
          <PhaseAdvanceView s={s} color={color} />
        )}

        {/* Card done — mastery judgment */}
        {s.state.cardDone && !s.state.sessionDone && (
          <MasteryJudgment s={s} card={card} />
        )}

      </div>

      {/* Bottom spacer */}
      <div style={{ height: 40 }} />
    </div>
  );
}

// ── Rep Counter ────────────────────────────────────────────────
function RepCounterView({ s, color }) {
  return (
    <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
      {/* Rep dots */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
        {Array.from({ length: s.state.repsTarget }).map((_, i) => (
          <div key={i} style={{
            width:        14, height: 14, borderRadius: '50%',
            background:   i < s.state.repsDone ? color : 'transparent',
            border:       `2px solid ${i < s.state.repsDone ? color : '#2a2d3e'}`,
            transition:   'all .2s',
          }} />
        ))}
      </div>

      <div style={{ fontSize: 13, color: '#555', marginBottom: 20 }}>
        {s.state.repsDone} / {s.state.repsTarget} reps
      </div>

      {/* Rep button */}
      <button onClick={s.handleRep} style={{
        width: '100%', padding: '18px', borderRadius: 14,
        background: color, color: '#07080f', fontWeight: 900,
        fontSize: 16, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        letterSpacing: 0.3, transition: 'opacity .15s',
      }}>
        {s.repButtonLabel}
      </button>

      {/* Adjust reps */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14 }}>
        {[-1, +1].map(d => (
          <button key={d} onClick={() => s.adjustReps(d)} style={{ background: 'none', border: `1px solid #1e2130`, borderRadius: 8, color: '#444', fontSize: 12, padding: '6px 14px', cursor: 'pointer' }}>
            {d > 0 ? '+' : ''}{ d} rep
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Verbal Check ───────────────────────────────────────────────
function VerbalCheckView({ s, color }) {
  return (
    <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>🎤</div>
      <div style={{ fontSize: 14, color: '#888', marginBottom: 6 }}>Did you recite it perfectly?</div>
      <div style={{ fontSize: 12, color: '#555', marginBottom: 24, lineHeight: 1.6 }}>
        Zero hesitation · Every word · Exact order
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={s.failVerbal} style={{ flex: 1, padding: '14px', borderRadius: 12, border: `1.5px solid ${COLORS.rose}55`, background: COLORS.rose + '18', color: COLORS.rose, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
          🔁 Not yet
        </button>
        <button onClick={s.advancePhase} style={{ flex: 1, padding: '14px', borderRadius: 12, border: 'none', background: color, color: '#07080f', fontWeight: 900, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
          ✓ Yes!
        </button>
      </div>
    </div>
  );
}

// ── Write Bridge ───────────────────────────────────────────────
function WriteBridgeView({ s, color }) {
  return (
    <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
      <div style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>
        ✍️ Read the card above, then write it from memory below.
      </div>
      <button onClick={s.advancePhase} style={{
        width: '100%', padding: '16px', borderRadius: 12,
        border: 'none', background: color, color: '#07080f',
        fontWeight: 900, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
      }}>
        ✍️ I've read it — Ready to Write Blind
      </button>
    </div>
  );
}

// ── Write Blind ────────────────────────────────────────────────
function WriteBlindView({ s, card, color, m }) {
  const result = s.state.checkResult;

  return (
    <div style={{ padding: '10px 0 20px' }}>
      <div style={{ fontSize: 13, color: '#666', marginBottom: 14, textAlign: 'center', fontStyle: 'italic' }}>
        🙈 Eyes closed — write the complete unit from memory:
      </div>

      {!result ? (
        <>
          <textarea
            value={s.state.writeInput}
            onChange={e => s.setWriteInput(e.target.value)}
            placeholder="Write the complete unit here, word for word..."
            style={{
              width: '100%', minHeight: 160, padding: '14px 16px',
              borderRadius: 14, border: `1.5px solid ${color}44`,
              background: '#0a0c17', color: '#e8eaf0', fontSize: 14,
              fontFamily: 'inherit', lineHeight: 1.8, resize: 'vertical',
              boxSizing: 'border-box', marginBottom: 14,
            }}
            autoFocus
          />
          <button onClick={s.checkWritten} disabled={!s.state.writeInput.trim()} style={{
            width: '100%', padding: '15px', borderRadius: 12, border: 'none',
            background: s.state.writeInput.trim() ? color : '#1e2130',
            color: s.state.writeInput.trim() ? '#07080f' : '#444',
            fontWeight: 800, fontSize: 15, cursor: s.state.writeInput.trim() ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
          }}>
            Check My Answer →
          </button>
        </>
      ) : (
        <WriteResult result={result} s={s} card={card} color={color} />
      )}
    </div>
  );
}

// ── Write Result ───────────────────────────────────────────────
function WriteResult({ result, s, card, color }) {
  const pct = Math.round((result.diff.filter(d => d.type === 'ok').length / Math.max(result.diff.length, 1)) * 100);

  return (
    <div>
      {/* Accuracy bar */}
      <div style={{ background: '#0a0c17', border: `1px solid ${result.correct ? COLORS.sage + '44' : COLORS.rose + '44'}`, borderRadius: 14, padding: '16px', marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: result.correct ? COLORS.sage : COLORS.rose }}>
            {result.correct ? '✓ Perfect!' : `${pct}% accuracy`}
          </span>
          <span style={{ fontSize: 12, color: '#555' }}>{pct}%</span>
        </div>
        <div style={{ height: 5, background: '#1e2130', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: result.correct ? COLORS.sage : COLORS.rose, borderRadius: 3 }} />
        </div>
      </div>

      {/* Correct answer */}
      {!result.correct && (
        <div style={{ background: '#0a0c17', border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: '14px', marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: '#444', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Correct Answer</div>
          <div style={{ fontSize: 13, lineHeight: 1.8, color: '#aaa', fontStyle: 'italic' }}>{card.unit}</div>
        </div>
      )}

      {/* Action buttons */}
      {result.correct ? (
        <button onClick={s.completeAllPhases} style={{
          width: '100%', padding: '15px', borderRadius: 12, border: 'none',
          background: COLORS.sage, color: '#07080f', fontWeight: 900,
          fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
        }}>✓ Owned it!</button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={s.failWritten} style={{
            width: '100%', padding: '14px', borderRadius: 12, border: 'none',
            background: COLORS.rose + '22', color: COLORS.rose, fontWeight: 700,
            fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', border: `1px solid ${COLORS.rose}44`,
          }}>🔁 Restart Written Loop</button>
          <button onClick={s.retryWrite} style={{
            width: '100%', padding: '12px', borderRadius: 12,
            border: `1px solid ${COLORS.border2}`, background: 'transparent',
            color: '#666', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          }}>Try Again</button>
        </div>
      )}
    </div>
  );
}

// ── Phase Advance ──────────────────────────────────────────────
function PhaseAdvanceView({ s, color }) {
  const nextPhase = s.phases[s.state.currentPhase + 1];
  return (
    <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
      <div style={{ fontSize: 14, color: '#888', marginBottom: 6 }}>Phase complete!</div>
      {nextPhase && (
        <div style={{ fontSize: 12, color: '#555', marginBottom: 20 }}>
          Next: {nextPhase.icon} {nextPhase.label}
        </div>
      )}
      <button onClick={s.advancePhase} style={{
        width: '100%', padding: '15px', borderRadius: 12, border: 'none',
        background: color, color: '#07080f', fontWeight: 900,
        fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
      }}>
        → Continue
      </button>
    </div>
  );
}

// ── Mastery Judgment ───────────────────────────────────────────
function MasteryJudgment({ s, card }) {
  const RESULTS = [
    { id: 'owned',  icon: '✅', label: 'Owned',  sub: 'Autopilot · instant · zero effort',  color: COLORS.sage, next: 'Next box' },
    { id: 'almost', icon: '⚡', label: 'Almost', sub: 'Slight hesitation or effort',          color: COLORS.gold, next: 'Stay box' },
    { id: 'fail',   icon: '🔁', label: 'Fail',   sub: 'Not there yet',                        color: COLORS.rose, next: 'Box 1'   },
  ];

  return (
    <div style={{ padding: '10px 0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>How did you do?</div>
        <div style={{ fontSize: 12, color: '#555' }}>Currently in Box {card.box}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {RESULTS.map(r => (
          <button key={r.id} onClick={() => s.markCard(r.id)} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '16px 20px', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit',
            background: r.color + '12', border: `1.5px solid ${r.color}44`,
            transition: 'all .15s', textAlign: 'left', width: '100%',
          }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>{r.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: r.color, marginBottom: 2 }}>{r.label}</div>
              <div style={{ fontSize: 11, color: '#555' }}>{r.sub}</div>
            </div>
            <div style={{ fontSize: 11, color: r.color, fontWeight: 700, flexShrink: 0 }}>→ {r.next}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

const btnBase = {
  background: 'none', border: `1px solid ${COLORS.border2}`, borderRadius: 8,
  color: '#666', fontSize: 13, padding: '8px 16px', cursor: 'pointer',
  marginTop: 20, fontFamily: 'inherit',
};
