// src/modules/memoryos/components/screens/NobelMindScreen.jsx
import { TopBar, BackButton, SectionHeader, Card, Tag, COLORS } from '../shared/UI.jsx';

export function NobelMindScreen({ m }) {
  return (
    <div className="section-scroll">
      <div className="section-content">

        <TopBar
          left={<BackButton onClick={() => m.navigate('home')} />}
          center={<div style={{ fontWeight: 800, fontSize: 16, color: COLORS.rose }}>🏆 Nobel Mind</div>}
        />

        <div style={{ fontSize: 13, color: '#666', marginBottom: 20, lineHeight: 1.6 }}>
          Simulation of combined noble minds. Six domains of world-class thinking —
          mental models, frameworks, and memorizable cards that shape how you reason.
        </div>

        {/* Global Nobel stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
          {(() => {
            const cards    = m.allCards['nobel-mind'] || [];
            const due      = cards.filter(c => c.box > 0 && new Date() >= new Date(c.dueAt || 0)).length;
            const mastered = cards.filter(c => c.box >= 14).length;
            return [
              { l: 'Total Cards', v: cards.length, c: COLORS.rose },
              { l: 'Due Now',     v: due,           c: due > 0 ? COLORS.rose : COLORS.teal },
              { l: 'Mastered',    v: mastered,      c: COLORS.gold },
            ].map(s => (
              <div key={s.l} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: s.c }}>{s.v}</div>
                <div style={{ fontSize: 9, color: '#444', letterSpacing: 1, marginTop: 3, textTransform: 'uppercase' }}>{s.l}</div>
              </div>
            ));
          })()}
        </div>

        {/* Session launcher */}
        {(() => {
          const cards = m.allCards['nobel-mind'] || [];
          const due   = cards.filter(c => c.box > 0 && new Date() >= new Date(c.dueAt || 0)).length;
          const nw    = cards.filter(c => c.box === 0).length;
          if (due === 0 && nw === 0) return null;
          return (
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {due > 0 && (
                <button onClick={() => m.startSession('nobel-mind', 'review')}
                  style={{ flex: 1, padding: '13px', borderRadius: 12, border: 'none', background: COLORS.teal, color: '#07080f', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                  📦 Review ({due})
                </button>
              )}
              {nw > 0 && (
                <button onClick={() => m.startSession('nobel-mind', 'new')}
                  style={{ flex: 1, padding: '13px', borderRadius: 12, border: 'none', background: COLORS.rose, color: '#07080f', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                  🔥 Learn ({nw})
                </button>
              )}
            </div>
          );
        })()}

        <SectionHeader label="Six Domains" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {m.nobelDomains.map(domain => {
            const color       = COLORS[domain.colorKey] || COLORS.teal;
            const domainCards = (m.allCards['nobel-mind'] || []).filter(c =>
              domain.cards.some(dc => dc.id === c.id)
            );
            const due      = domainCards.filter(c => c.box > 0 && new Date() >= new Date(c.dueAt || 0)).length;
            const mastered = domainCards.filter(c => c.box >= 14).length;

            return (
              <Card key={domain.id} color={color}
                onClick={() => m.setActiveDomain(domain.id)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{
                    fontSize: 28, width: 50, height: 50, borderRadius: 12, flexShrink: 0,
                    background: color + '18', border: `1px solid ${color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{domain.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color, marginBottom: 3 }}>{domain.label}</div>
                    <div style={{ fontSize: 11, color: '#555', lineHeight: 1.5, fontStyle: 'italic' }}>{domain.tagline}</div>
                  </div>
                </div>

                {/* Thinkers */}
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
                  {domain.thinkers.slice(0, 3).map((t, i) => (
                    <Tag key={i} color={color}>{t.name.split(' ').pop()}</Tag>
                  ))}
                  {domain.thinkers.length > 3 && <Tag color="#444">+{domain.thinkers.length - 3}</Tag>}
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  <Tag color="#444">{domain.cards.length} cards</Tag>
                  <Tag color="#444">{domain.exercises.length} exercises</Tag>
                  {due > 0      && <Tag color={COLORS.rose}>{due} due</Tag>}
                  {mastered > 0 && <Tag color={COLORS.gold}>{mastered} mastered</Tag>}
                </div>
              </Card>
            );
          })}
        </div>

      </div>
    </div>
  );
}
