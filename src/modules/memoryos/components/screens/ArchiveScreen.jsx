// src/modules/memoryos/components/screens/ArchiveScreen.jsx
import { TopBar, BackButton, SectionHeader, Card, Tag, COLORS, EmptyState } from '../shared/UI.jsx';

const SESSIONS = [{ id:'review', label:'Box Review', icon:'📦', color:COLORS.teal }, { id:'new', label:'New', icon:'🔥', color:COLORS.rose }, { id:'preview', label:'Preview', icon:'🔭', color:COLORS.gold }];

export function ArchiveScreen({ m }) {
  const curricula = m.curricula || [];
  const nobelCards = m.allCards['nobel-mind'] || [];
  const allFlat = Object.values(m.allCards).flat();
  const totalDue = allFlat.filter(c => c.box > 0 && new Date() >= new Date(c.dueAt || 0)).length;
  const totalNew = allFlat.filter(c => c.box === 0).length;
  const totalIn = allFlat.filter(c => c.box > 0).length;

  return (
    <div className="section-scroll">
      <div className="section-content">
        <TopBar left={<BackButton onClick={() => m.navigate('home')} />} center={<div style={{ fontWeight:800, fontSize:16, color:COLORS.teal }}>📚 Knowledge Archive</div>} />

        <div style={{ fontSize:13, color:'#666', marginBottom:16, lineHeight:1.6 }}>
          Your mental library. Every curriculum runs through the 6-phase · 14-box system.
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:20 }}>
          {[{ label:'Due Now', value:totalDue, color: totalDue>0?COLORS.rose:COLORS.teal }, { label:'New', value:totalNew, color:COLORS.sage }, { label:'In Boxes', value:totalIn, color:COLORS.teal }].map(s => (
            <div key={s.label} style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:12, padding:'12px 8px', textAlign:'center' }}>
              <div style={{ fontSize:20, fontWeight:900, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:9, color:'#444', letterSpacing:1, marginTop:3, textTransform:'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <SectionHeader label="Pre-built Curricula" />

        {curricula.length === 0 ? (
          <EmptyState icon="📭" title="No curricula registered yet" sub="Add a curriculum to curricula/index.js to get started." />
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
            {curricula.map(c => {
              const cards = m.allCards[c.id] || [];
              const due = cards.filter(x => x.box > 0 && new Date() >= new Date(x.dueAt || 0)).length;
              const nw = cards.filter(x => x.box === 0).length;
              const mastered = cards.filter(x => x.box >= 14).length;
              const p = m.dailyProgress[c.id] || {};
              const color = COLORS[c.colorKey] || COLORS.teal;
              const allDone = p.reviewDone && p.newDone && p.previewDone;
              return (
                <Card key={c.id} color={color} onClick={() => { m.setActiveCurriculum(c.id); m.navigate('curriculum-detail', { curriculumId: c.id }); }} style={{ cursor:'pointer' }}>
                  <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:12 }}>
                    <div style={{ fontSize:26, width:46, height:46, borderRadius:10, flexShrink:0, background:color+'18', border:`1px solid ${color}44`, display:'flex', alignItems:'center', justifyContent:'center' }}>{c.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:800, fontSize:14, color, marginBottom:2 }}>{c.label}</div>
                      <div style={{ fontSize:11, color:'#555', lineHeight:1.4 }}>{c.description}</div>
                    </div>
                    {allDone && <div style={{ color, fontSize:18 }}>✓</div>}
                  </div>
                  <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:10 }}>
                    <Tag color="#666">{cards.length} cards</Tag>
                    {due > 0 && <Tag color={COLORS.rose}>{due} due</Tag>}
                    {nw > 0 && <Tag color={COLORS.sage}>{nw} new</Tag>}
                    {mastered > 0 && <Tag color={COLORS.gold}>{mastered} mastered</Tag>}
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    {SESSIONS.map(s => (
                      <div key={s.id} style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <div style={{ width:8, height:8, borderRadius:'50%', background: p[`${s.id}Done`] ? s.color : COLORS.border2 }} />
                        <span style={{ fontSize:10, color:'#444' }}>{s.icon} {s.label}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <SectionHeader label="Nobel Mind" />
        <Card color={COLORS.rose} onClick={() => m.navigate('nobel-mind')} style={{ cursor:'pointer', marginBottom:20 }}>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <div style={{ fontSize:28 }}>🏆</div>
            <div>
              <div style={{ fontWeight:800, fontSize:14, color:COLORS.rose }}>Nobel-Level Mind</div>
              <div style={{ fontSize:11, color:'#555', marginTop:2 }}>6 domains · {nobelCards.length} cards</div>
            </div>
          </div>
        </Card>

        <SectionHeader label="Custom Cards" />
        <div style={{ background:COLORS.surface, border:`1px dashed ${COLORS.border2}`, borderRadius:14, padding:'18px', textAlign:'center', color:'#444', fontSize:13 }}>
          Add your own cards from any book, course, or topic.<br />
          <span style={{ color:COLORS.teal, fontSize:12 }}>Use the AI generator in AI Mind Lab to create cards from any text.</span>
        </div>
      </div>
    </div>
  );
}
