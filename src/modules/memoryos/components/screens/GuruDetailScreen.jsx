// src/modules/memoryos/components/screens/GuruDetailScreen.jsx
import { TopBar, BackButton, SectionHeader, Tag, COLORS, PrimaryBtn, GhostBtn } from '../shared/UI.jsx';
import { getGuru } from '../../data/gurus.data.js';

export function GuruDetailScreen({ m }) {
  const guruId = m.navParams?.guruId || m.activeGuruId;
  const guru   = getGuru(guruId);

  if (!guru) {
    return (
      <div className="section-scroll">
        <div className="section-content">
          <BackButton onClick={() => m.navigate('guru-center')} />
          <div style={{ color: '#666', marginTop: 24 }}>Guru not found.</div>
        </div>
      </div>
    );
  }

  const color      = COLORS[guru.colorKey] || COLORS.gold;
  const completed  = m.completedGuruSteps[guru.id] || [];
  const total      = guru.roadmap.length;
  const pct        = total > 0 ? Math.round((completed.length / total) * 100) : 0;

  // Find next incomplete step
  const nextStep = guru.roadmap.find(s => !completed.includes(s.id));

  function openStep(step) {
    m.setActiveGuruStep(step.id);
    m.navigate('guru-step', { guruId: guru.id, stepId: step.id });
  }

  return (
    <div className="section-scroll">
      <div className="section-content">
        <TopBar
          left={<BackButton onClick={() => m.navigate('guru-center')} />}
          center={<span style={{ color, fontWeight: 800, fontSize: 15 }}>{guru.icon} {guru.name}</span>}
        />

        {/* Hero */}
        <div style={{ background: color + '10', border: `1px solid ${color}33`, borderRadius: 16, padding: '20px 18px', marginBottom: 20 }}>
          <div style={{ fontSize: 12, color, fontWeight: 700, marginBottom: 4 }}>{guru.title}</div>
          <div style={{ fontSize: 13, color: '#888', fontStyle: 'italic', lineHeight: 1.65, marginBottom: 14 }}>"{guru.tagline}"</div>
          <div style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>{guru.bio}</div>
        </div>

        {/* Progress */}
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: '16px 18px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>Your Progress</span>
            <span style={{ fontSize: 13, color }}>{completed.length}/{total} steps · {pct}%</span>
          </div>
          <div style={{ height: 6, background: COLORS.surface2, borderRadius: 3, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width .4s' }} />
          </div>

          {/* Guidance mode */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#444', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>Guidance Mode</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[['pre-written', '📄 Pre-written'], ['ai', '🤖 AI'], ['hybrid', '⚡ Hybrid']].map(([val, lbl]) => (
                <button key={val}
                  onClick={() => m.setGuruGuidanceMode(val)}
                  style={{
                    flex: 1, padding: '8px 6px', borderRadius: 8,
                    border: `1px solid ${m.guruGuidanceMode === val ? color : COLORS.border2}`,
                    background: m.guruGuidanceMode === val ? color + '22' : COLORS.surface2,
                    color: m.guruGuidanceMode === val ? color : '#666',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >{lbl}</button>
              ))}
            </div>
          </div>

          {nextStep && (
            <PrimaryBtn color={color} onClick={() => openStep(nextStep)} style={{ width: '100%' }}>
              {completed.length === 0 ? `Start Step 1 — ${nextStep.title}` : `Continue → Step ${nextStep.stepNumber}`}
            </PrimaryBtn>
          )}
          {!nextStep && total > 0 && (
            <div style={{ textAlign: 'center', color, fontWeight: 700, fontSize: 14 }}>🏆 All steps complete!</div>
          )}
        </div>

        {/* Core teaching */}
        <SectionHeader label="Core Teaching" />
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: '16px 18px', marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#777', lineHeight: 1.7 }}>{guru.coreTeaching}</div>
        </div>

        {/* Books */}
        <SectionHeader label={`Books (${guru.books.length})`} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {guru.books.map((book, i) => (
            <div key={i} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: COLORS.text, flex: 1, paddingRight: 8 }}>{book.title}</div>
                <Tag color={color}>{book.year}</Tag>
              </div>
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6, marginBottom: 8 }}>{book.summary}</div>
              <div style={{ fontSize: 11, color, fontStyle: 'italic' }}>Key lesson: {book.keyLesson}</div>
            </div>
          ))}
        </div>

        {/* Roadmap */}
        <SectionHeader label={`Training Roadmap (${total} Steps)`} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {guru.roadmap.map((step, i) => {
            const done    = completed.includes(step.id);
            const isCurrent = nextStep?.id === step.id;
            return (
              <div key={step.id}
                onClick={() => openStep(step)}
                style={{
                  background:   COLORS.surface,
                  border:       `1.5px solid ${done ? color + '55' : isCurrent ? color + '33' : COLORS.border}`,
                  borderRadius: 12,
                  padding:      '14px 16px',
                  cursor:       'pointer',
                  opacity:      done ? 0.65 : 1,
                  display:      'flex',
                  gap:          12,
                  alignItems:   'flex-start',
                  transition:   'border-color .2s',
                }}
              >
                {/* Step number */}
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: done ? color : isCurrent ? color + '22' : COLORS.surface2,
                  border: `1.5px solid ${done || isCurrent ? color : COLORS.border2}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800,
                  color: done ? COLORS.bg : isCurrent ? color : '#555',
                }}>
                  {done ? '✓' : step.stepNumber}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: done ? color : COLORS.text, marginBottom: 3 }}>{step.title}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>⏱ {step.duration} · {step.practicalAction}</div>
                </div>

                <div style={{ color: '#333', fontSize: 14, marginTop: 2 }}>→</div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
