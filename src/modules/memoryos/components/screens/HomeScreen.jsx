// src/modules/memoryos/components/screens/HomeScreen.jsx
// Main MemoryOS dashboard — 4 sections + global stats

import { useState } from 'react';
import { C, Tag, StatBox, SectionHeader } from '../shared/UI.jsx';

const ACCENT = '#a78bfa';

export function HomeScreen({ m }) {
  const stats      = m.progress.getGlobalStats();
  const sections   = m.sections.filter(s => s.visible).sort((a, b) => a.order - b.order);
  const [dragOver, setDragOver] = useState(null);
  const [dragItem, setDragItem] = useState(null);

  // ── Simple drag-and-drop reorder ──────────────────────────
  function handleDragStart(e, sectionId) {
    setDragItem(sectionId);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e, sectionId) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(sectionId);
  }

  function handleDrop(e, targetId) {
    e.preventDefault();
    if (!dragItem || dragItem === targetId) { setDragItem(null); setDragOver(null); return; }

    const all      = [...m.sections];
    const fromIdx  = all.findIndex(s => s.id === dragItem);
    const toIdx    = all.findIndex(s => s.id === targetId);
    const [moved]  = all.splice(fromIdx, 1);
    all.splice(toIdx, 0, moved);
    const reordered = all.map((s, i) => ({ ...s, order: i }));
    m.reorderSections(reordered);
    setDragItem(null);
    setDragOver(null);
  }

  function handleDragEnd() {
    setDragItem(null);
    setDragOver(null);
  }

  // ── Move up/down (mobile fallback) ───────────────────────
  function moveSection(id, dir) {
    const all     = [...m.sections].sort((a, b) => a.order - b.order);
    const idx     = all.findIndex(s => s.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= all.length) return;
    [all[idx].order, all[swapIdx].order] = [all[swapIdx].order, all[idx].order];
    m.reorderSections(all.sort((a, b) => a.order - b.order));
  }

  // ── Section card config ────────────────────────────────────
  const SECTION_CONFIG = {
    'guru-center':       { color: '#f5c842', desc: 'Step-by-step memory training guided by the world\'s greatest memory experts.',     screen: 'guru-center' },
    'knowledge-archive': { color: '#3dd9c4', desc: 'Memorize any curriculum using the 6-phase · 14-box spaced repetition system.',    screen: 'knowledge-archive' },
    'nobel-mind':        { color: '#f0657a', desc: 'Mental models and thinking frameworks from history\'s greatest minds.',            screen: 'nobel-mind' },
    'ai-mind-lab':       { color: '#a78bfa', desc: 'AI-powered coaching, card generation, mind analysis, and performance insights.',   screen: 'ai-mind-lab' },
  };

  return (
    <div className="section-scroll">
      <div className="section-content">

        {/* Header */}
        <div style={S.header}>
          <div>
            <div style={S.logo}>⬡ MemoryOS</div>
            <div style={S.logoSub}>6-Phase · 14-Box · Zero Mistakes</div>
          </div>
          <div style={S.headerActions}>
            <button style={S.iconBtn} onClick={() => m.navigate('analytics')} title="Analytics">📊</button>
            <button style={S.iconBtn} onClick={() => m.navigate('settings')}  title="Settings">⚙️</button>
          </div>
        </div>

        {/* Global stats */}
        <div style={S.statsRow}>
          <StatBox label="Due Now"  value={stats.due}      color={stats.due > 0 ? '#f0657a' : '#3dd9c4'} />
          <StatBox label="In Boxes" value={stats.inBoxes}  color="#3dd9c4" />
          <StatBox label="Mastered" value={stats.mastered} color="#f5c842" />
          <StatBox label="Total"    value={stats.total}    color="#666" />
        </div>

        {/* Smart recommendations */}
        {m.recommendations.length > 0 && (
          <div style={S.recsWrap}>
            {m.recommendations.slice(0, 2).map((rec, i) => (
              <div key={i} style={{ ...S.recCard, borderColor: rec.priority === 'high' ? '#f0657a44' : '#a78bfa44' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: rec.priority === 'high' ? '#f0657a' : '#a78bfa', marginBottom: 4 }}>
                  {rec.priority === 'high' ? '🔴' : '🟡'} {rec.title}
                </div>
                <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>{rec.action}</div>
              </div>
            ))}
          </div>
        )}

        {/* Section label */}
        <SectionHeader label="Your Sections" sub="Drag to reorder · click eye to hide" />

        {/* Draggable sections */}
        <div style={S.sectionsGrid}>
          {sections.map((sec, idx) => {
            const cfg     = SECTION_CONFIG[sec.id] || {};
            const isDragging  = dragItem === sec.id;
            const isOver      = dragOver === sec.id;
            return (
              <div
                key={sec.id}
                draggable
                onDragStart={e => handleDragStart(e, sec.id)}
                onDragOver={e  => handleDragOver(e, sec.id)}
                onDrop={e      => handleDrop(e, sec.id)}
                onDragEnd={handleDragEnd}
                onClick={() => m.navigate(cfg.screen || sec.id)}
                style={{
                  ...S.sectionCard,
                  borderColor:   isOver ? cfg.color : `${cfg.color}33`,
                  opacity:       isDragging ? 0.4 : 1,
                  background:    isOver ? `${cfg.color}10` : '#0e1018',
                  cursor:        'pointer',
                  transform:     isOver ? 'scale(1.01)' : 'scale(1)',
                  transition:    'all .15s',
                }}
              >
                {/* Drag handle */}
                <div style={S.dragHandle} onClick={e => e.stopPropagation()}>⠿</div>

                {/* Icon + title */}
                <div style={S.cardTop}>
                  <div style={{ ...S.cardIcon, background: `${cfg.color}18`, border: `1px solid ${cfg.color}44` }}>
                    {sec.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: cfg.color }}>{sec.label}</div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 3, lineHeight: 1.4 }}>{cfg.desc}</div>
                  </div>
                </div>

                {/* Quick stats per section */}
                <SectionQuickStats m={m} sectionId={sec.id} color={cfg.color} />

                {/* Up/down buttons (mobile) */}
                <div style={S.moveButtons} onClick={e => e.stopPropagation()}>
                  <button style={S.moveBtn} onClick={() => moveSection(sec.id, -1)} disabled={idx === 0}>↑</button>
                  <button style={S.moveBtn} onClick={() => moveSection(sec.id, +1)} disabled={idx === sections.length - 1}>↓</button>
                  <button style={{ ...S.moveBtn, color: '#666' }} onClick={() => m.toggleSection(sec.id)}>👁</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hidden sections toggle */}
        {m.sections.some(s => !s.visible) && (
          <div style={S.hiddenWrap}>
            <div style={S.hiddenLabel}>Hidden sections:</div>
            {m.sections.filter(s => !s.visible).map(s => (
              <button key={s.id} style={S.showBtn} onClick={() => m.toggleSection(s.id)}>
                {s.icon} {s.label} (show)
              </button>
            ))}
          </div>
        )}

        {/* Daily progress dots */}
        <SectionHeader label="Today's Progress" />
        <DailyProgressRow m={m} />

      </div>
    </div>
  );
}

// ── Section quick stats ────────────────────────────────────────
function SectionQuickStats({ m, sectionId, color }) {
  if (sectionId === 'knowledge-archive') {
    const all  = Object.values(m.allCards).flat();
    const due  = all.filter(c => c.box > 0 && new Date() >= new Date(c.dueAt || 0)).length;
    const nw   = all.filter(c => c.box === 0).length;
    return (
      <div style={S.quickStats}>
        {due > 0 && <Tag color="#f0657a">{due} due</Tag>}
        {nw  > 0 && <Tag color="#3dd9c4">{nw} new</Tag>}
        {due === 0 && nw === 0 && <Tag color="#333">All caught up ✓</Tag>}
      </div>
    );
  }
  if (sectionId === 'nobel-mind') {
    const cards  = m.allCards['nobel-mind'] || [];
    const due    = cards.filter(c => c.box > 0 && new Date() >= new Date(c.dueAt || 0)).length;
    return (
      <div style={S.quickStats}>
        <Tag color={color}>{cards.length} cards</Tag>
        {due > 0 && <Tag color="#f0657a">{due} due</Tag>}
      </div>
    );
  }
  if (sectionId === 'guru-center') {
    const total     = m.gurus.length;
    const started   = Object.keys(m.completedGuruSteps).length;
    return (
      <div style={S.quickStats}>
        <Tag color={color}>{total} gurus</Tag>
        {started > 0 && <Tag color="#3dd9c4">{started} in progress</Tag>}
      </div>
    );
  }
  if (sectionId === 'ai-mind-lab') {
    return (
      <div style={S.quickStats}>
        <Tag color={color}>AI Coach</Tag>
        <Tag color={color}>Card Generator</Tag>
      </div>
    );
  }
  return null;
}

// ── Daily progress dots ────────────────────────────────────────
function DailyProgressRow({ m }) {
  const SESSIONS = [
    { id: 'review',  label: 'Box Review', icon: '📦', color: '#3dd9c4' },
    { id: 'new',     label: 'New',        icon: '🔥', color: '#f0657a' },
    { id: 'preview', label: 'Preview',    icon: '🔭', color: '#f5c842' },
  ];

  const curricula = m.curricula || [];
  if (!curricula.length) return null;

  return (
    <div style={S.progressTable}>
      {curricula.slice(0, 4).map(c => {
        const p = m.dailyProgress[c.id] || {};
        return (
          <div key={c.id} style={S.progressRow}>
            <span style={{ fontSize: 13, color: '#888', flex: 1 }}>{c.icon} {c.label}</span>
            <div style={{ display: 'flex', gap: 10 }}>
              {SESSIONS.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: p[`${s.id}Done`] ? s.color : '#1e2130',
                    border:     `1.5px solid ${p[`${s.id}Done`] ? s.color : '#2a2d3e'}`,
                    transition: 'all .2s',
                  }} />
                  <span style={{ fontSize: 9, color: '#444' }}>{s.icon}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────
const S = {
  header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  logo:          { fontSize: 20, fontWeight: 900, color: '#e8eaf0', letterSpacing: '-0.5px' },
  logoSub:       { fontSize: 10, color: '#3a3d50', letterSpacing: 2, marginTop: 2 },
  headerActions: { display: 'flex', gap: 6 },
  iconBtn:       { background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', padding: '4px 6px', color: '#555' },
  statsRow:      { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 18 },
  recsWrap:      { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 },
  recCard:       { background: '#0e1018', border: '1px solid', borderRadius: 12, padding: '12px 14px' },
  sectionsGrid:  { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 },
  sectionCard:   { background: '#0e1018', border: '1.5px solid', borderRadius: 16, padding: '16px 16px 12px', position: 'relative', userSelect: 'none' },
  dragHandle:    { position: 'absolute', top: 14, right: 14, color: '#2a2d3e', fontSize: 14, cursor: 'grab', lineHeight: 1 },
  cardTop:       { display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 },
  cardIcon:      { width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 },
  quickStats:    { display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 },
  moveButtons:   { display: 'flex', gap: 4, justifyContent: 'flex-end' },
  moveBtn:       { background: '#141620', border: '1px solid #1e2130', borderRadius: 6, color: '#444', fontSize: 11, padding: '3px 8px', cursor: 'pointer' },
  hiddenWrap:    { marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  hiddenLabel:   { fontSize: 11, color: '#444', letterSpacing: 1 },
  showBtn:       { background: '#141620', border: '1px solid #1e2130', borderRadius: 8, color: '#666', fontSize: 11, padding: '5px 10px', cursor: 'pointer' },
  progressTable: { background: '#0e1018', border: '1px solid #1e2130', borderRadius: 12, overflow: 'hidden' },
  progressRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 16px', borderBottom: '1px solid #1e2130' },
};
