// src/modules/memoryos/components/screens/AnalyticsScreen.jsx
import { TopBar, BackButton, SectionHeader, Tag, COLORS, ProgressBar } from '../shared/UI.jsx';

export function AnalyticsScreen({ m }) {
  const a = m.progress.analytics;

  if (!a) {
    return (
      <div className="section-scroll">
        <div className="section-content">
          <TopBar left={<BackButton onClick={() => m.navigate('home')} />}
            center={<div style={{ fontWeight: 800, fontSize: 16, color: COLORS.teal }}>📊 Analytics</div>} />
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#555', fontSize: 13 }}>
            Loading analytics...
          </div>
        </div>
      </div>
    );
  }

  const maxDay = Math.max(...(a.last7Days || []).map(d => d.total), 1);

  return (
    <div className="section-scroll">
      <div className="section-content">

        <TopBar
          left={<BackButton onClick={() => m.navigate('home')} />}
          center={<div style={{ fontWeight: 800, fontSize: 16, color: COLORS.teal }}>📊 Analytics</div>}
          right={<button onClick={m.progress.refreshAnalytics} style={{ background: 'none', border: 'none', color: '#555', fontSize: 13, cursor: 'pointer' }}>↻</button>}
        />

        {/* Streak */}
        <div style={{ background: `linear-gradient(135deg, ${COLORS.gold}18, ${COLORS.amber}10)`, border: `1px solid ${COLORS.gold}44`, borderRadius: 18, padding: '22px', marginBottom: 18, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 4 }}>🔥</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: COLORS.gold, lineHeight: 1 }}>{a.streak}</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 4, letterSpacing: 1 }}>DAY STREAK</div>
          <div style={{ fontSize: 12, color: '#555', marginTop: 8 }}>
            {a.streak === 0 ? 'Start today to build your streak.' : a.streak >= 7 ? 'Outstanding consistency. Keep going.' : 'Building momentum — don\'t break the chain.'}
          </div>
        </div>

        {/* Global stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 18 }}>
          {[
            { l: 'Total Reviews', v: a.totalReviews,  c: COLORS.teal   },
            { l: 'Mastery Rate',  v: `${a.masteryRate}%`, c: COLORS.sage },
            { l: 'Cards Mastered',v: a.cardsMastered, c: COLORS.gold   },
            { l: 'Cards Due',     v: a.cardsDue,      c: a.cardsDue > 0 ? COLORS.rose : COLORS.teal },
          ].map(s => (
            <div key={s.l} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: '16px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 10, color: '#444', letterSpacing: 1, marginTop: 4, textTransform: 'uppercase' }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Review breakdown */}
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: '16px 18px', marginBottom: 18 }}>
          <div style={{ fontSize: 10, color: '#444', letterSpacing: 1.5, marginBottom: 14, textTransform: 'uppercase' }}>Review Breakdown</div>
          {[
            { l: 'Owned',  v: a.totalOwned,  c: COLORS.sage,  pct: a.totalReviews > 0 ? Math.round((a.totalOwned  / a.totalReviews) * 100) : 0 },
            { l: 'Almost', v: a.totalAlmost, c: COLORS.gold,  pct: a.totalReviews > 0 ? Math.round((a.totalAlmost / a.totalReviews) * 100) : 0 },
            { l: 'Failed', v: a.totalFailed, c: COLORS.rose,  pct: a.totalReviews > 0 ? Math.round((a.totalFailed / a.totalReviews) * 100) : 0 },
          ].map(s => (
            <div key={s.l} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: '#888' }}>{s.l}</span>
                <span style={{ fontSize: 12, color: s.c, fontWeight: 700 }}>{s.v} ({s.pct}%)</span>
              </div>
              <div style={{ height: 5, background: COLORS.surface2, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${s.pct}%`, background: s.c, borderRadius: 3, transition: 'width .5s' }} />
              </div>
            </div>
          ))}
        </div>

        {/* 7-day activity chart */}
        <SectionHeader label="Last 7 Days" />
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: '18px 14px', marginBottom: 18 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 80 }}>
            {(a.last7Days || []).map((day, i) => {
              const pct = maxDay > 0 ? (day.total / maxDay) * 100 : 0;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: '100%', height: 64, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <div style={{
                      width: '100%', borderRadius: '4px 4px 0 0',
                      height: `${Math.max(pct, day.total > 0 ? 8 : 2)}%`,
                      background: day.total > 0
                        ? `linear-gradient(to top, ${COLORS.teal}, ${COLORS.sage})`
                        : COLORS.border,
                      transition: 'height .4s',
                      minHeight: day.total > 0 ? 6 : 2,
                    }} />
                  </div>
                  <div style={{ fontSize: 9, color: '#444' }}>{day.label}</div>
                  {day.total > 0 && <div style={{ fontSize: 9, color: COLORS.teal, fontWeight: 700 }}>{day.total}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Box distribution */}
        <SectionHeader label="Box Distribution" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6, marginBottom: 18 }}>
          {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(box => {
            const count = a.boxDistribution?.[box] || 0;
            return (
              <div key={box} style={{
                background:   count > 0 ? COLORS.surface2 : 'transparent',
                border:       `1px solid ${count > 0 ? COLORS.border : 'transparent'}`,
                borderRadius: 10, padding: '8px 4px', textAlign: 'center',
                opacity:      count === 0 ? 0.2 : 1,
              }}>
                <div style={{ fontSize: 9, color: '#444' }}>B{box}</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: COLORS.teal, marginTop: 2 }}>{count || '—'}</div>
              </div>
            );
          })}
        </div>

        {/* Per curriculum */}
        {a.perCurriculum?.length > 0 && (
          <>
            <SectionHeader label="Per Curriculum" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              {a.perCurriculum.map(c => {
                const color = COLORS[c.colorKey] || COLORS.teal;
                return (
                  <div key={c.curriculumId} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color }}>
                        {c.icon} {c.label}
                      </div>
                      <Tag color={color}>{c.masteryRate}% mastery</Tag>
                    </div>
                    <div style={{ height: 4, background: COLORS.surface2, borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
                      <div style={{ height: '100%', width: `${c.masteryRate}%`, background: color, borderRadius: 2 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: '#555' }}>{c.totalCards} cards</span>
                      <span style={{ fontSize: 11, color: '#555' }}>·</span>
                      <span style={{ fontSize: 11, color: '#555' }}>{c.inBoxes} in boxes</span>
                      <span style={{ fontSize: 11, color: '#555' }}>·</span>
                      <span style={{ fontSize: 11, color: COLORS.gold }}>{c.mastered} mastered</span>
                      {c.due > 0 && <>
                        <span style={{ fontSize: 11, color: '#555' }}>·</span>
                        <span style={{ fontSize: 11, color: COLORS.rose }}>{c.due} due</span>
                      </>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
