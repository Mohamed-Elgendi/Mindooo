// src/modules/memoryos/components/screens/CurriculumScreen.jsx
import { useState } from 'react';
import { TopBar, BackButton, SectionHeader, Tag, COLORS, EmptyState, MiniMindMap } from '../shared/UI.jsx';
import { buildBoxStatus } from '../../config/boxes.config.js';

const SESSIONS = [
  { id:'review', label:'Box Review', icon:'📦', color:COLORS.teal, desc:'4 phases · cards due from boxes' },
  { id:'new', label:'New Learning', icon:'🔥', color:COLORS.rose, desc:'6 phases · encode new cards' },
  { id:'preview', label:'Preview & Priming', icon:'🔭', color:COLORS.gold, desc:'4 phases · prime upcoming cards' },
];

export function CurriculumScreen({ m }) {
  const curriculumId = m.navParams?.curriculumId || m.activeCurriculumId;
  const curriculum = m.curricula?.find(c => c.id === curriculumId);
  const cards = m.allCards[curriculumId] || [];
  const p = m.dailyProgress[curriculumId] || {};
  const [showCards, setShowCards] = useState(false);
  const [skipModal, setSkipModal] = useState(false);
  const [pendSession, setPendSession] = useState(null);
  const [skipVal, setSkipVal] = useState('');

  if (!curriculum && curriculumId !== 'custom') {
    return (
      <div className="section-scroll"><div className="section-content">
        <BackButton onClick={() => m.navigate('knowledge-archive')} />
        <EmptyState icon="📭" title="Curriculum not found" />
      </div></div>
    );
  }

  const color = curriculum ? (COLORS[curriculum.colorKey] || COLORS.teal) : COLORS.sage;
  const icon = curriculum?.icon || '✏️';
  const label = curriculum?.label || 'Custom Cards';
  const due = cards.filter(c => c.box > 0 && new Date() >= new Date(c.dueAt || 0)).length;
  const newCards = cards.filter(c => c.box === 0).length;
  const inBoxes = cards.filter(c => c.box > 0).length;
  const boxes = buildBoxStatus(cards);

  function attemptStart(sessionId) {
    const canStart = m.boxes.canStartSession(cards, sessionId, p, m.settings.strictOrder);
    if (canStart) m.startSession(curriculumId, sessionId);
    else { setPendSession(sessionId); setSkipVal(''); setSkipModal(true); }
  }

  function confirmSkip() { if (skipVal !== 'SKIP') return; setSkipModal(false); m.startSession(curriculumId, pendSession); }
  const blockingLabel = pendSession === 'new' ? 'Box Review' : 'New Learning';

  return (
    <div className="section-scroll">
      <div className="section-content">
        <TopBar left={<BackButton onClick={() => m.navigate('knowledge-archive')} />} center={<span style={{ color, fontWeight:800, fontSize:15 }}>{icon} {label}</span>} right={<button onClick={() => setShowCards(s => !s)} style={{ background:'none', border:'none', color:'#555', fontSize:12, cursor:'pointer' }}>{showCards?'Hide':'📋 Cards'}</button>} />

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:20 }}>
          {[{ l:'Total', v:cards.length, c:'#666' }, { l:'New', v:newCards, c:COLORS.sage }, { l:'In Boxes', v:inBoxes, c:COLORS.teal }, { l:'Due', v:due, c: due>0?COLORS.rose:COLORS.teal }].map(s => (
            <div key={s.l} style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:12, padding:'12px 8px', textAlign:'center' }}>
              <div style={{ fontSize:20, fontWeight:900, color:s.c }}>{s.v}</div>
              <div style={{ fontSize:9, color:'#444', letterSpacing:1, marginTop:3, textTransform:'uppercase' }}>{s.l}</div>
            </div>
          ))}
        </div>

        {newCards === 0 && due === 0 && cards.length > 0 && (
          <div style={{ background:'#0a1f0a', border:`1px solid ${COLORS.sage}44`, borderRadius:12, padding:'12px 16px', fontSize:13, color:COLORS.sage, marginBottom:16 }}>✓ All cards in boxes and not yet due. Come back later!</div>
        )}

        <SectionHeader label="Daily Sessions — In Order" />
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
          {SESSIONS.map((s,i) => {
            const done = p[`${s.id}Done`];
            const canStart = m.boxes.canStartSession(cards, s.id, p, m.settings.strictOrder);
            const prev = i > 0 ? SESSIONS[i-1] : null;
            const queue = m.boxes.getQueueForSession(cards, s.id, m.settings.dailyNewCards);
            const hasCards = queue.length > 0;
            return (
              <div key={s.id} style={{ background:COLORS.surface, border:`1.5px solid ${done?s.color+'55':canStart?s.color+'22':COLORS.border}`, borderRadius:16, padding:'16px 16px', opacity:done?0.6:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div style={{ display:'flex', gap:12, alignItems:'flex-start', flex:1 }}>
                    <div style={{ fontSize:26, marginTop:2 }}>{s.icon}</div>
                    <div>
                      <div style={{ fontWeight:800, color:done?s.color:COLORS.text, fontSize:14 }}>{i+1}. {s.label} {done?'✓':''}</div>
                      <div style={{ fontSize:11, color:'#555', marginTop:3 }}>{s.desc}</div>
                      {!canStart && !done && prev && <div style={{ fontSize:11, color:COLORS.rose, marginTop:5 }}>⚠ Complete {blockingLabel} first — or type SKIP</div>}
                      {canStart && !done && !hasCards && <div style={{ fontSize:11, color:'#555', marginTop:5 }}>{m.boxes.getEmptySessionReason(cards, s.id)}</div>}
                    </div>
                  </div>
                  <div style={{ flexShrink:0, marginLeft:10 }}>
                    {!done ? (
                      <button onClick={() => attemptStart(s.id)} style={{ padding:'9px 16px', borderRadius:10, border: canStart?'none':`1px solid ${COLORS.rose}44`, background: canStart&&hasCards?s.color:COLORS.surface2, color: canStart&&hasCards?COLORS.bg:canStart?'#555':COLORS.rose, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', minWidth:70 }}>
                        {canStart && hasCards ? 'Start →' : canStart ? 'Empty' : 'Skip →'}
                      </button>
                    ) : <div style={{ color:s.color, fontSize:22 }}>✓</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <SectionHeader label="Box Status" />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6, marginBottom:20 }}>
          {boxes.map(b => (
            <div key={b.box} style={{ background: b.isEmpty?'transparent':COLORS.surface2, border:`1px solid ${b.dueCount>0?COLORS.rose+'55':b.isEmpty?'transparent':COLORS.border}`, borderRadius:10, padding:'9px 4px', textAlign:'center', opacity:b.isEmpty?0.2:1, position:'relative' }}>
              {b.dueCount > 0 && <div style={{ position:'absolute', top:4, right:4, width:5, height:5, borderRadius:'50%', background:COLORS.rose }} />}
              <div style={{ fontSize:9, color:'#444' }}>B{b.box}</div>
              <div style={{ fontSize:14, fontWeight:900, color: b.dueCount>0?COLORS.rose:COLORS.teal, marginTop:2 }}>{b.count || '—'}</div>
              <div style={{ fontSize:8, color:'#333', marginTop:2 }}>{b.short}</div>
            </div>
          ))}
        </div>

        {showCards && (
          <>
            <SectionHeader label={`Cards (${cards.length})`} />
            {cards.length === 0 ? <EmptyState icon="📭" title="No cards yet" /> : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {cards.map(card => {
                  const cardColor = COLORS[card.colorKey] || color;
                  const isDue = card.box > 0 && new Date() >= new Date(card.dueAt || 0);
                  return (
                    <div key={card.id} style={{ background:COLORS.surface, border:`1px solid ${cardColor}33`, borderRadius:14, padding:'14px 16px' }}>
                      <div style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:8 }}>
                        {card.icon && <div style={{ fontSize:20, flexShrink:0 }}>{card.icon}</div>}
                        <div style={{ fontSize:13, lineHeight:1.7, color:COLORS.text, fontStyle:'italic', flex:1 }}>{card.unit}</div>
                      </div>
                      {m.settings.showKeypoints && card.keyPoints && (
                        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:8 }}>
                          {card.keyPoints.map((kp,i) => <div key={i} style={{ background:cardColor+'15', border:`1px solid ${cardColor}33`, borderRadius:6, padding:'3px 9px', fontSize:10, color:cardColor, fontWeight:600 }}>{kp}</div>)}
                        </div>
                      )}
                      {m.settings.showMindmap && card.mindmap && <div style={{ background:'#060810', borderRadius:10, padding:'10px 12px', border:`1px solid ${COLORS.border}`, marginBottom:8 }}><MiniMindMap data={card.mindmap} /></div>}
                      <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                        <Tag color={COLORS.teal}>Box {card.box}</Tag>
                        {card.topic && <Tag color={COLORS.gold}>{card.topic}</Tag>}
                        {card.difficulty && <Tag color="#444">{card.difficulty}</Tag>}
                        <Tag color={isDue && card.box > 0 ? COLORS.rose : COLORS.border2}>{card.box === 0 ? 'New' : isDue ? '⏰ Due' : '⏳ Scheduled'}</Tag>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        <div style={{ marginTop:24, textAlign:'center' }}>
          <button onClick={m.resetDailyProgress} style={{ background:'none', border:`1px solid ${COLORS.border}`, borderRadius:8, color:'#444', fontSize:11, padding:'6px 14px', cursor:'pointer' }}>Reset Today's Progress</button>
        </div>
      </div>

      {skipModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.92)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:COLORS.surface, border:`1px solid ${COLORS.border2}`, borderRadius:20, padding:'32px 24px', maxWidth:400, width:'100%', textAlign:'center' }}>
            <div style={{ fontSize:40, marginBottom:14 }}>⚠️</div>
            <div style={{ fontSize:17, fontWeight:800, color:COLORS.text, marginBottom:10 }}>Skip {blockingLabel}?</div>
            <div style={{ fontSize:13, color:'#666', lineHeight:1.7, marginBottom:16 }}>Your memory system works best in strict daily order. Type <strong style={{ color:COLORS.rose, letterSpacing:3 }}>SKIP</strong> to confirm.</div>
            <input style={{ width:'100%', padding:'13px', borderRadius:10, border:`1px solid ${COLORS.border2}`, background:COLORS.surface2, color:COLORS.text, fontSize:16, fontFamily:'inherit', textAlign:'center', letterSpacing:3, boxSizing:'border-box', marginBottom:14 }} value={skipVal} onChange={e => setSkipVal(e.target.value)} placeholder="Type SKIP here…" autoFocus />
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={confirmSkip} disabled={skipVal !== 'SKIP'} style={{ flex:1, padding:'12px', borderRadius:10, border:`1px solid ${skipVal==='SKIP'?COLORS.rose:COLORS.border2}`, background:skipVal==='SKIP'?COLORS.rose+'22':COLORS.surface2, color:skipVal==='SKIP'?COLORS.rose:'#444', fontWeight:700, fontSize:13, cursor:skipVal==='SKIP'?'pointer':'not-allowed', fontFamily:'inherit' }}>Confirm Skip</button>
              <button onClick={() => setSkipModal(false)} style={{ flex:1, padding:'12px', borderRadius:10, border:`1px solid ${COLORS.border2}`, background:COLORS.surface2, color:'#666', fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
