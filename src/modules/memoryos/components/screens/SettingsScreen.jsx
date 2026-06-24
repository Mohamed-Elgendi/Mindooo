// src/modules/memoryos/components/screens/SettingsScreen.jsx
import { TopBar, BackButton, SectionHeader, SettingsRow, Toggle, Adj, COLORS } from '../shared/UI.jsx';
import { MEMORYOS_VERSION } from '../../config/settings.config.js';

export function SettingsScreen({ m }) {
  const s = m.settings;
  return (
    <div className="section-scroll">
      <div className="section-content">
        <TopBar left={<BackButton onClick={() => m.navigate('home')} />} center={<div style={{ fontWeight:800, fontSize:16, color:COLORS.violet }}>⚙️ Settings</div>} />

        <SectionHeader label="Session" />
        <div style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:16, overflow:'hidden', marginBottom:18 }}>
          <SettingsRow label="Reps Per Phase" sub="Repetitions per phase before advancing" right={<Adj value={s.repsPerPhase} min={1} max={20} onChange={v => m.updateSettings({ repsPerPhase:v })} />} />
          <div style={{ height:1, background:COLORS.border }} />
          <SettingsRow label="Daily New Cards" sub="Max new cards per New Learning session" right={<Adj value={s.dailyNewCards} min={1} max={50} onChange={v => m.updateSettings({ dailyNewCards:v })} />} />
          <div style={{ height:1, background:COLORS.border }} />
          <SettingsRow label="Rep Mode" sub="Click through reps or use a timer" right={
            <div style={{ display:'flex', gap:6 }}>
              {['click','timer'].map(mode => <button key={mode} onClick={() => m.updateSettings({ mode })} style={{ padding:'7px 14px', borderRadius:8, border:`1px solid ${s.mode===mode?COLORS.teal:COLORS.border2}`, background:s.mode===mode?COLORS.teal+'22':COLORS.surface2, color:s.mode===mode?COLORS.teal:'#666', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>{mode}</button>)}
            </div>
          } />
          <div style={{ height:1, background:COLORS.border }} />
          <SettingsRow label="Strict Order" sub="Enforce Review → New → Preview daily order" right={<Toggle value={s.strictOrder} onChange={v => m.updateSettings({ strictOrder:v })} />} />
        </div>

        <SectionHeader label="Display" />
        <div style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:16, overflow:'hidden', marginBottom:18 }}>
          <SettingsRow label="Show Mind Maps" sub="Display mind maps on cards during sessions" right={<Toggle value={s.showMindmap} onChange={v => m.updateSettings({ showMindmap:v })} />} />
          <div style={{ height:1, background:COLORS.border }} />
          <SettingsRow label="Show Key Points" sub="Display key point chips on cards" right={<Toggle value={s.showKeypoints} onChange={v => m.updateSettings({ showKeypoints:v })} />} />
        </div>

        <SectionHeader label="Guru Center" />
        <div style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:16, overflow:'hidden', marginBottom:18 }}>
          <SettingsRow label="Default Guidance Mode" sub="How guru steps are presented" right={
            <div style={{ display:'flex', gap:5 }}>
              {[['pre-written','📄'],['ai','🤖'],['hybrid','⚡']].map(([val,icon]) => <button key={val} onClick={() => m.setGuruGuidanceMode(val)} style={{ padding:'6px 10px', borderRadius:8, border:`1px solid ${m.guruGuidanceMode===val?COLORS.gold:COLORS.border2}`, background:m.guruGuidanceMode===val?COLORS.gold+'22':COLORS.surface2, color:m.guruGuidanceMode===val?COLORS.gold:'#666', fontSize:13, cursor:'pointer' }}>{icon}</button>)}
            </div>
          } />
          <div style={{ height:1, background:COLORS.border }} />
          <div style={{ padding:'14px 20px' }}>
            <div style={{ fontSize:11, color:'#444', marginBottom:10 }}>Guru Progress</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {m.gurus.map(guru => {
                const completed = m.completedGuruSteps[guru.id] || [];
                const total = guru.roadmap.length;
                const pct = total > 0 ? Math.round((completed.length / total) * 100) : 0;
                const color = COLORS[guru.colorKey] || COLORS.gold;
                return (
                  <div key={guru.id}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}><span style={{ fontSize:12, color:'#777' }}>{guru.icon} {guru.name}</span><span style={{ fontSize:12, color }}>{completed.length}/{total}</span></div>
                    <div style={{ height:3, background:COLORS.surface2, borderRadius:2, overflow:'hidden' }}><div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:2 }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <SectionHeader label="Data" />
        <div style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:16, overflow:'hidden', marginBottom:18 }}>
          <SettingsRow label="Reset Today's Sessions" sub="Clears today's completion markers" right={<button onClick={() => { if (window.confirm("Reset today's session progress?")) m.resetDailyProgress(); }} style={{ padding:'7px 14px', borderRadius:8, border:`1px solid ${COLORS.rose}44`, background:COLORS.rose+'18', color:COLORS.rose, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Reset</button>} />
          <div style={{ height:1, background:COLORS.border }} />
          <SettingsRow label="Clear AI Coach History" sub="Removes all coach conversation history" right={<button onClick={() => { if (window.confirm('Clear coach history?')) m.clearCoachHistory(); }} style={{ padding:'7px 14px', borderRadius:8, border:`1px solid ${COLORS.border2}`, background:COLORS.surface2, color:'#666', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Clear</button>} />
        </div>

        <div style={{ textAlign:'center', padding:'16px 0 32px', color:'#2a2d3e', fontSize:11 }}>MemoryOS v{MEMORYOS_VERSION} · 6-Phase · 14-Box · Zero Mistakes</div>
      </div>
    </div>
  );
}
