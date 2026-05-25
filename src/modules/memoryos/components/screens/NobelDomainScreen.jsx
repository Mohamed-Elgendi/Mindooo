// src/modules/memoryos/components/screens/NobelDomainScreen.jsx
import { useState } from 'react';
import { TopBar, BackButton, SectionHeader, Tag, COLORS, PrimaryBtn, MiniMindMap } from '../shared/UI.jsx';
import { getNobelDomain } from '../../data/nobel-mind.data.js';

export function NobelDomainScreen({ m }) {
  const domainId = m.navParams?.domainId || m.activeDomainId;
  const domain   = getNobelDomain(domainId);
  const [tab,    setTab] = useState('thinkers'); // 'thinkers' | 'cards' | 'exercises'

  if (!domain) {
    return (
      <div className="section-scroll">
        <div className="section-content">
          <BackButton onClick={() => m.navigate('nobel-mind')} />
          <div style={{ color: '#666', marginTop: 24 }}>Domain not found.</div>
        </div>
      </div>
    );
  }

  const color        = COLORS[domain.colorKey] || COLORS.teal;
  const nobelCards   = m.allCards['nobel-mind'] || [];
  const domainCards  = nobelCards.filter(c => domain.cards.some(dc => dc.id === c.id));
  const due          = domainCards.filter(c => c.box > 0 && new Date() >= new Date(c.dueAt || 0)).length;
  const newCards     = domainCards.filter(c => c.box === 0).length;

  return (
    <div className="section-scroll">
      <div className="section-content">

        <TopBar
          left={<BackButton onClick={() => m.navigate('nobel-mind')} />}
          center={<span style={{ color, fontWeight: 800, fontSize: 15 }}>{domain.icon} {domain.label}</span>}
        />

        {/* Hero */}
        <div style={{ background: color + '10', border: `1px solid ${color}33`, borderRadius: 16, padding: '18px', marginBottom: 18 }}>
          <div style={{ fontSize: 13, color: '#777', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 12 }}>{domain.tagline}</div>
          <div style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>{domain.description}</div>
        </div>

        {/* Session buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {due > 0 && (
            <button onClick={() => m.startSession('nobel-mind', 'review')}
              style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: COLORS.teal, color: '#07080f', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              📦 Review ({due})
            </button>
          )}
          {newCards > 0 && (
            <button onClick={() => m.startSession('nobel-mind', 'new')}
              style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: color, color: '#07080f', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              🔥 Learn ({newCards})
            </button>
          )}
          {due === 0 && newCards === 0 && (
            <div style={{ flex: 1, padding: '12px', borderRadius: 10, background: COLORS.surface2, color: '#555', fontSize: 13, textAlign: 'center' }}>
              ✓ All caught up
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
          {[['thinkers', '🧑‍🎓 Thinkers'], ['cards', '🃏 Cards'], ['exercises', '💪 Exercises']].map(([id, lbl]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, padding: '9px', borderRadius: 10,
              border: `1px solid ${tab === id ? color : COLORS.border2}`,
              background: tab === id ? color + '22' : COLORS.surface2,
              color: tab === id ? color : '#555',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>{lbl}</button>
          ))}
        </div>

        {/* THINKERS TAB */}
        {tab === 'thinkers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {domain.thinkers.map((t, i) => (
              <div key={i} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color, marginBottom: 2 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: '#555' }}>{t.years} · {t.nationality} · {t.field}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#777', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 8 }}>"{t.tagline}"</div>
                <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>{t.coreIdea}</div>
              </div>
            ))}
          </div>
        )}

        {/* CARDS TAB */}
        {tab === 'cards' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {domain.cards.map((card, i) => {
              const progress  = domainCards.find(c => c.id === card.id);
              const cardColor = COLORS[card.colorKey] || color;
              const isDue     = progress && progress.box > 0 && new Date() >= new Date(progress.dueAt || 0);

              return (
                <div key={card.id} style={{ background: COLORS.surface, border: `1.5px solid ${cardColor}33`, borderRadius: 16, padding: '18px 18px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 22 }}>{card.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: cardColor }}>{card.title}</div>
                      <div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>
                        {card.thinkers?.join(' · ')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <Tag color={COLORS.teal}>Box {progress?.box || 0}</Tag>
                      {isDue && <Tag color={COLORS.rose}>Due</Tag>}
                    </div>
                  </div>

                  {/* Unit */}
                  <div style={{ fontSize: 13, lineHeight: 1.85, color: '#ccc', fontStyle: 'italic', marginBottom: 14, borderLeft: `3px solid ${cardColor}44`, paddingLeft: 14 }}>
                    {card.unit}
                  </div>

                  {/* Key points */}
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: card.mindmap ? 12 : 0 }}>
                    {card.keyPoints.map((kp, j) => (
                      <div key={j} style={{ background: cardColor + '12', border: `1px solid ${cardColor}33`, borderRadius: 6, padding: '3px 10px', fontSize: 11, color: cardColor + 'cc', fontWeight: 600 }}>{kp}</div>
                    ))}
                  </div>

                  {/* Mind map */}
                  {card.mindmap && m.settings.showMindmap && (
                    <div style={{ background: '#060810', borderRadius: 10, padding: '10px', border: `1px solid ${COLORS.border}`, marginTop: 10 }}>
                      <MiniMindMap data={card.mindmap} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* EXERCISES TAB */}
        {tab === 'exercises' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {domain.exercises.map((ex, i) => (
              <div key={ex.id} style={{ background: COLORS.surface, border: `1px solid ${color}33`, borderRadius: 14, padding: '18px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color }}>{i + 1}. {ex.title}</div>
                  <Tag color={color}>⏱ {ex.duration}</Tag>
                </div>
                <div style={{ fontSize: 13, color: '#777', lineHeight: 1.75 }}>{ex.prompt}</div>
                <div style={{ marginTop: 14, height: 1, background: COLORS.border }} />
                <div style={{ marginTop: 12, fontSize: 11, color: '#444', fontStyle: 'italic' }}>
                  Complete this exercise in your notebook or journal. Come back to MemoryOS when done.
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
