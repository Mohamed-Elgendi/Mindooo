// src/modules/memoryos/components/screens/AIMindLabScreen.jsx
import { useState } from 'react';
import { TopBar, BackButton, SectionHeader, Tag, COLORS, PrimaryBtn, Spinner } from '../shared/UI.jsx';

export function AIMindLabScreen({ m }) {
  const [tab, setTab] = useState('analysis'); // 'analysis' | 'generator' | 'insights'

  return (
    <div className="section-scroll">
      <div className="section-content">

        <TopBar
          left={<BackButton onClick={() => m.navigate('home')} />}
          center={<div style={{ fontWeight: 800, fontSize: 16, color: COLORS.violet }}>🤖 AI Mind Lab</div>}
          right={
            <button onClick={() => m.navigate('ai-coach')}
              style={{ background: COLORS.violet + '22', border: `1px solid ${COLORS.violet}44`, borderRadius: 9, color: COLORS.violet, fontSize: 12, padding: '6px 12px', cursor: 'pointer', fontWeight: 700 }}>
              Coach
            </button>
          }
        />

        <div style={{ fontSize: 13, color: '#666', marginBottom: 18, lineHeight: 1.6 }}>
          AI understands your current memory state, training level, and performance data
          to deliver data-driven insights and personalized recommendations.
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
          {[['analysis', '🧠 Mind State'], ['insights', '💡 Insights'], ['generator', '✨ Generator']].map(([id, lbl]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, padding: '9px 6px', borderRadius: 10,
              border: `1px solid ${tab === id ? COLORS.violet : COLORS.border2}`,
              background: tab === id ? COLORS.violet + '22' : COLORS.surface2,
              color: tab === id ? COLORS.violet : '#555',
              fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>{lbl}</button>
          ))}
        </div>

        {/* MIND STATE TAB */}
        {tab === 'analysis' && <MindStateTab m={m} />}

        {/* INSIGHTS TAB */}
        {tab === 'insights' && <InsightsTab m={m} />}

        {/* GENERATOR TAB */}
        {tab === 'generator' && <GeneratorTab m={m} />}

      </div>
    </div>
  );
}

// ── Mind State Tab ─────────────────────────────────────────────
function MindStateTab({ m }) {
  const r = m.mindStateReport;

  const LEVEL_COLORS = {
    beginner:     COLORS.rose,
    developing:   COLORS.amber,
    intermediate: COLORS.gold,
    advanced:     COLORS.sage,
    master:       COLORS.teal,
  };

  return (
    <div>
      {!r ? (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 20 }}>
            AI will analyze your training data and deliver a complete assessment of your current memory state.
          </div>
          <PrimaryBtn color={COLORS.violet} onClick={m.refreshMindState} disabled={m.aiLoading} style={{ width: '100%' }}>
            {m.aiLoading ? '🤖 Analyzing...' : '🧠 Analyze My Mind State'}
          </PrimaryBtn>
        </div>
      ) : (
        <div>
          {/* Level badge */}
          <div style={{ background: COLORS.violet + '10', border: `1px solid ${COLORS.violet}33`, borderRadius: 16, padding: '20px', marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#444', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>Overall Level</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: LEVEL_COLORS[r.overallLevel] || COLORS.violet, marginBottom: 6, textTransform: 'capitalize' }}>
              {r.overallLevel}
            </div>
            <div style={{ fontSize: 13, color: '#777', lineHeight: 1.7, fontStyle: 'italic' }}>{r.aiNarrative}</div>
          </div>

          {/* Score bars */}
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: '16px 18px', marginBottom: 16 }}>
            {[
              { l: 'Memory Capacity',    v: r.memoryCapacity,    c: COLORS.teal   },
              { l: 'Retention Strength', v: r.retentionStrength, c: COLORS.sage   },
              { l: 'Consistency Score',  v: r.consistencyScore,  c: COLORS.gold   },
              { l: 'Mastery Rate',       v: r.masteryRate,       c: COLORS.violet },
            ].map(s => (
              <div key={s.l} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: '#888' }}>{s.l}</span>
                  <span style={{ fontSize: 12, color: s.c, fontWeight: 700 }}>{s.v}%</span>
                </div>
                <div style={{ height: 5, background: COLORS.surface2, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.v}%`, background: s.c, borderRadius: 3, transition: 'width .5s' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Strengths & weaknesses */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div style={{ background: COLORS.sage + '10', border: `1px solid ${COLORS.sage}33`, borderRadius: 12, padding: '14px' }}>
              <div style={{ fontSize: 10, color: COLORS.sage, fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>STRENGTHS</div>
              {r.strengths?.map((s, i) => <div key={i} style={{ fontSize: 12, color: '#888', marginBottom: 5 }}>✓ {s}</div>)}
            </div>
            <div style={{ background: COLORS.rose + '10', border: `1px solid ${COLORS.rose}33`, borderRadius: 12, padding: '14px' }}>
              <div style={{ fontSize: 10, color: COLORS.rose, fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>FOCUS ON</div>
              {r.weaknesses?.map((w, i) => <div key={i} style={{ fontSize: 12, color: '#888', marginBottom: 5 }}>→ {w}</div>)}
            </div>
          </div>

          {/* Recommendations */}
          {r.recommendations?.length > 0 && (
            <>
              <SectionHeader label="AI Recommendations" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {r.recommendations.map((rec, i) => (
                  <div key={i} style={{ background: COLORS.surface, border: `1px solid ${rec.priority === 'high' ? COLORS.rose + '44' : COLORS.border}`, borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{rec.title}</span>
                      <Tag color={rec.priority === 'high' ? COLORS.rose : rec.priority === 'medium' ? COLORS.gold : '#666'}>{rec.priority}</Tag>
                    </div>
                    <div style={{ fontSize: 12, color: '#777', marginBottom: 8, lineHeight: 1.6 }}>{rec.description}</div>
                    <div style={{ fontSize: 12, color: COLORS.teal, fontWeight: 600 }}>→ {rec.action}</div>
                    <div style={{ fontSize: 11, color: '#444', marginTop: 4, fontStyle: 'italic' }}>Based on: {rec.dataReason}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Next milestone */}
          {r.nextMilestone && (
            <div style={{ background: COLORS.gold + '10', border: `1px solid ${COLORS.gold}33`, borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: COLORS.gold, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>NEXT MILESTONE</div>
              <div style={{ fontSize: 13, color: '#aaa' }}>{r.nextMilestone}</div>
              {r.estimatedDaysToNextLevel && (
                <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>Est. {r.estimatedDaysToNextLevel} days at current pace</div>
              )}
            </div>
          )}

          <button onClick={m.refreshMindState} disabled={m.aiLoading}
            style={{ width: '100%', padding: '11px', borderRadius: 10, border: `1px solid ${COLORS.violet}44`, background: COLORS.violet + '18', color: COLORS.violet, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            {m.aiLoading ? '⏳ Refreshing...' : '↻ Refresh Analysis'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Insights Tab ───────────────────────────────────────────────
function InsightsTab({ m }) {
  const TYPE_COLORS = { warning: COLORS.rose, success: COLORS.sage, suggestion: COLORS.gold, milestone: COLORS.violet };
  const TYPE_ICONS  = { warning: '⚠️', success: '✅', suggestion: '💡', milestone: '🏆' };

  return (
    <div>
      {/* Smart recommendations (rule-based, instant) */}
      {m.recommendations.length > 0 && (
        <>
          <SectionHeader label="Smart Recommendations" sub="Data-driven · No AI tokens" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {m.recommendations.map((rec, i) => (
              <div key={i} style={{ background: COLORS.surface, border: `1px solid ${rec.priority === 'high' ? COLORS.rose + '44' : COLORS.border}`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>{rec.title}</div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{rec.description}</div>
                <div style={{ fontSize: 12, color: COLORS.teal }}>→ {rec.action}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* AI insights */}
      <SectionHeader label="AI Performance Insights" />
      {m.aiInsights.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>Generate AI-powered insights from your training data.</div>
          <PrimaryBtn color={COLORS.violet} onClick={m.refreshMindState} disabled={m.aiLoading} style={{ width: '100%' }}>
            {m.aiLoading ? '⏳ Generating...' : '💡 Generate Insights'}
          </PrimaryBtn>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {m.aiInsights.map((insight, i) => {
            const color = TYPE_COLORS[insight.type] || COLORS.violet;
            return (
              <div key={i} style={{ background: color + '10', border: `1px solid ${color}33`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{TYPE_ICONS[insight.type] || '💡'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 5 }}>{insight.title}</div>
                    <div style={{ fontSize: 12, color: '#777', lineHeight: 1.65 }}>{insight.message}</div>
                    {insight.metric && (
                      <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                        <Tag color={color}>{insight.metric}: {insight.value}</Tag>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Generator Tab ──────────────────────────────────────────────
function GeneratorTab({ m }) {
  const [text,        setText]        = useState('');
  const [topic,       setTopic]       = useState('');
  const [targetCurr,  setTargetCurr]  = useState('custom');
  const [generated,   setGenerated]   = useState([]);
  const [generating,  setGenerating]  = useState(false);

  async function handleGenerate() {
    if (!text.trim() || !topic.trim()) return;
    setGenerating(true);
    setGenerated([]);
    try {
      const cards = await m.generateCards(text, topic, targetCurr);
      setGenerated(cards);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: '#666', marginBottom: 16, lineHeight: 1.6 }}>
        Paste any text — a book chapter, article, notes, or concept — and AI converts it into memorizable cards.
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, color: '#444', letterSpacing: 1, display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Topic / Subject</label>
        <input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="e.g. Stoic Philosophy, JavaScript Closures..."
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, color: '#444', letterSpacing: 1, display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Paste Your Text</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste a book chapter, article, notes, or any text you want to memorize..."
          rows={6}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
        <div style={{ fontSize: 10, color: '#333', marginTop: 4 }}>{text.length} chars · AI reads up to 3,000</div>
      </div>

      <PrimaryBtn color={COLORS.violet}
        onClick={handleGenerate}
        disabled={generating || !text.trim() || !topic.trim()}
        style={{ width: '100%', marginBottom: 20 }}
      >
        {generating ? '✨ Generating cards...' : '✨ Generate Cards'}
      </PrimaryBtn>

      {generating && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: COLORS.violet, fontSize: 13 }}>
          AI is reading your text and creating memory cards...
        </div>
      )}

      {generated.length > 0 && (
        <>
          <div style={{ background: COLORS.sage + '10', border: `1px solid ${COLORS.sage}33`, borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
            <span style={{ color: COLORS.sage, fontWeight: 700, fontSize: 13 }}>✓ {generated.length} cards generated and added to {targetCurr}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {generated.map((card, i) => (
              <div key={i} style={{ background: COLORS.surface, border: `1px solid ${COLORS.violet}33`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>{card.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, color: COLORS.violet, fontWeight: 700 }}>{card.topic}</div>
                    <div style={{ fontSize: 10, color: '#444' }}>{card.difficulty}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.75, color: '#ccc', fontStyle: 'italic', marginBottom: 10 }}>{card.unit}</div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {card.keyPoints?.map((kp, j) => (
                    <div key={j} style={{ background: COLORS.violet + '12', border: `1px solid ${COLORS.violet}33`, borderRadius: 6, padding: '3px 9px', fontSize: 10, color: COLORS.violet + 'cc', fontWeight: 600 }}>{kp}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 10,
  border: `1px solid ${COLORS.border2}`, background: COLORS.surface2,
  color: COLORS.text, fontSize: 13, fontFamily: 'inherit',
  lineHeight: 1.6, boxSizing: 'border-box',
};
