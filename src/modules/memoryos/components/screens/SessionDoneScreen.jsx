// src/modules/memoryos/components/screens/SessionDoneScreen.jsx
import { COLORS, PrimaryBtn, GhostBtn } from '../shared/UI.jsx';

export function SessionDoneScreen({ m }) {
  const s     = m.session;
  const stats = s.sessionStats;
  const cfg   = s.state.config;

  const SESSION_LABELS = { new: '🔥 New Learning', review: '📦 Box Review', preview: '🔭 Preview' };
  const sessionLabel   = cfg ? SESSION_LABELS[cfg.sessionType] || '' : '';
  const color          = cfg?.sessionType === 'new' ? COLORS.rose : cfg?.sessionType === 'review' ? COLORS.teal : COLORS.gold;

  const pct = stats.total > 0 ? Math.round((stats.owned / stats.total) * 100) : 0;

  const grade = pct >= 90 ? { icon: '🏆', label: 'Outstanding', color: COLORS.gold }
              : pct >= 70 ? { icon: '✅', label: 'Strong',       color: COLORS.sage }
              : pct >= 50 ? { icon: '⚡', label: 'Progressing',  color: COLORS.amber }
              :             { icon: '🔁', label: 'Keep Going',   color: COLORS.rose };

  // Next session suggestion
  const curriculumId = cfg?.curriculumId;
  const cards        = m.allCards[curriculumId] || [];
  const p            = m.dailyProgress[curriculumId] || {};

  const nextSessions = [];
  if (cfg?.sessionType === 'review' && !p.newDone) nextSessions.push({ id: 'new', label: 'New Learning', icon: '🔥' });
  if (cfg?.sessionType === 'new' && !p.previewDone) nextSessions.push({ id: 'preview', label: 'Preview & Priming', icon: '🔭' });

  return (
    <div className="section-scroll">
      <div className="section-content">

        {/* Header */}
        <div style={{ textAlign: 'center', padding: '32px 0 24px' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{grade.icon}</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: grade.color, marginBottom: 6 }}>Session Complete</div>
          <div style={{ fontSize: 14, color: '#666' }}>{sessionLabel}</div>
        </div>

        {/* Mastery rate circle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{
            width:        110, height: 110, borderRadius: '50%',
            background:   `conic-gradient(${grade.color} ${pct * 3.6}deg, #141620 0deg)`,
            display:      'flex', alignItems: 'center', justifyContent: 'center',
            position:     'relative',
          }}>
            <div style={{
              width: 86, height: 86, borderRadius: '50%',
              background: '#07080f',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: grade.color, lineHeight: 1 }}>{pct}%</div>
              <div style={{ fontSize: 10, color: '#444', letterSpacing: 1 }}>MASTERY</div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 24 }}>
          {[
            { l: 'Total',  v: stats.total,  c: '#666' },
            { l: 'Owned',  v: stats.owned,  c: COLORS.sage },
            { l: 'Almost', v: stats.almost, c: COLORS.gold },
            { l: 'Failed', v: stats.failed, c: COLORS.rose },
            { l: 'Grade',  v: grade.label,  c: grade.color },
            { l: 'Phase',  v: cfg?.sessionType === 'new' ? '6-Ph' : '4-Ph', c: color },
          ].map(s => (
            <div key={s.l} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: '13px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 9, color: '#444', letterSpacing: 1, marginTop: 3, textTransform: 'uppercase' }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Motivational message */}
        <div style={{ background: color + '10', border: `1px solid ${color}33`, borderRadius: 14, padding: '16px 18px', marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#888', lineHeight: 1.7 }}>
            {pct >= 80
              ? 'Excellent session. Your memory traces are deepening. The review intervals are now locked in.'
              : pct >= 60
              ? 'Good progress. The cards you marked Almost will come back at the same interval. Keep reviewing consistently.'
              : 'Every session builds the foundation. The failed cards have been reset to Box 1 — you will see them again soon.'}
          </div>
        </div>

        {/* Next session suggestion */}
        {nextSessions.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: '#444', letterSpacing: 1.5, marginBottom: 10, textTransform: 'uppercase' }}>Continue Today</div>
            {nextSessions.map(ns => (
              <button key={ns.id}
                onClick={() => {
                  m.startSession(curriculumId, ns.id);
                }}
                style={{
                  width: '100%', padding: '14px 20px', borderRadius: 12,
                  border: `1px solid ${COLORS.border2}`, background: COLORS.surface,
                  color: COLORS.text, fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                }}
              >
                {ns.icon} Start {ns.label}
              </button>
            ))}
          </div>
        )}

        {/* Primary actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PrimaryBtn color={color}
            onClick={() => {
              s.endSession();
              m.navigate('curriculum-detail', { curriculumId });
            }}
            style={{ width: '100%' }}
          >
            Back to Curriculum
          </PrimaryBtn>
          <GhostBtn onClick={() => { s.endSession(); m.navigate('home'); }} style={{ width: '100%' }}>
            ← Home
          </GhostBtn>
        </div>

      </div>
    </div>
  );
}
