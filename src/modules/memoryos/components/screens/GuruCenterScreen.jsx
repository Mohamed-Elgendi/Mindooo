// src/modules/memoryos/components/screens/GuruCenterScreen.jsx
import { TopBar, BackButton, SectionHeader, Card, Tag, COLORS } from '../shared/UI.jsx';

export function GuruCenterScreen({ m }) {
  return (
    <div className="section-scroll">
      <div className="section-content">
        <TopBar
          left={<BackButton onClick={() => m.navigate('home')} />}
          center={<div style={{ fontWeight: 800, fontSize: 16, color: COLORS.gold }}>🧠 Guru Center</div>}
        />

        <div style={{ fontSize: 13, color: '#666', marginBottom: 20, lineHeight: 1.6 }}>
          Select a guru and follow their step-by-step training path.
          Each step delivers one lesson and one practical action — one at a time.
        </div>

        <SectionHeader label="Choose Your Guru" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {m.gurus.map(guru => {
            const completed  = m.completedGuruSteps[guru.id] || [];
            const total      = guru.roadmap.length;
            const pct        = total > 0 ? Math.round((completed.length / total) * 100) : 0;
            const color      = COLORS[guru.colorKey] || COLORS.gold;

            return (
              <Card key={guru.id} color={color} onClick={() => m.setActiveGuru(guru.id)}
                style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{
                    fontSize: 32, width: 52, height: 52, borderRadius: 12,
                    background: color + '18', border: `1px solid ${color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>{guru.icon}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color, marginBottom: 2 }}>{guru.name}</div>
                    <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>{guru.title}</div>
                    <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5, marginBottom: 10, fontStyle: 'italic' }}>
                      "{guru.tagline}"
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: '#444' }}>{completed.length}/{total} steps</span>
                        <span style={{ fontSize: 10, color }}>{ pct}%</span>
                      </div>
                      <div style={{ height: 4, background: COLORS.surface2, borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width .3s' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      <Tag color={color}>{guru.books.length} books</Tag>
                      <Tag color={color}>{total} steps</Tag>
                      {completed.length > 0 && <Tag color={COLORS.sage}>↻ In Progress</Tag>}
                      {completed.length === total && total > 0 && <Tag color={COLORS.gold}>✓ Complete</Tag>}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
