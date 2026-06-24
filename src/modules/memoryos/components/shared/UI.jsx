// src/modules/memoryos/components/shared/UI.jsx
export const COLORS = {
  teal:'#3dd9c4', sky:'#4db8f0', sage:'#5ec997', gold:'#f5c842', amber:'#f5a623',
  rose:'#f0657a', violet:'#a78bfa', muted:'#64748b', bg:'#07080f', surface:'#0e1018',
  surface2:'#141620', border:'#1e2130', border2:'#2a2d3e', text:'#e8eaf0', dim:'#3a3d50',
};
export function getColor(key) { return COLORS[key] || COLORS.muted; }

export function Tag({ color = '#a78bfa', children, onClick }) {
  return (
    <span onClick={onClick} style={{ display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:20, background:color+'18', border:`1px solid ${color}44`, color, fontSize:11, fontWeight:700, letterSpacing:0.2, cursor:onClick?'pointer':'default', whiteSpace:'nowrap' }}>
      {children}
    </span>
  );
}

export function StatBox({ label, value, color = '#a78bfa' }) {
  return (
    <div style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:12, padding:'13px 8px', textAlign:'center' }}>
      <div style={{ fontSize:22, fontWeight:900, color }}>{value}</div>
      <div style={{ fontSize:9, color:COLORS.dim, letterSpacing:1.5, marginTop:3, textTransform:'uppercase' }}>{label}</div>
    </div>
  );
}

export function SectionHeader({ label, sub, action, onAction }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', margin:'22px 0 10px' }}>
      <div>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, color:COLORS.dim, textTransform:'uppercase' }}>{label}</div>
        {sub && <div style={{ fontSize:10, color:'#333', marginTop:2 }}>{sub}</div>}
      </div>
      {action && (
        <button onClick={onAction} style={{ background:'none', border:`1px solid ${COLORS.border2}`, borderRadius:8, color:COLORS.dim, fontSize:11, padding:'4px 10px', cursor:'pointer' }}>{action}</button>
      )}
    </div>
  );
}

export function BackButton({ onClick, label = '← Back' }) {
  return <button onClick={onClick} style={{ background:'none', border:'none', color:COLORS.dim, fontSize:13, cursor:'pointer', padding:'4px 0', fontFamily:'inherit' }}>{label}</button>;
}

export function TopBar({ left, center, right }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 0 14px', gap:8 }}>
      <div style={{ minWidth:60 }}>{left}</div>
      <div style={{ textAlign:'center', flex:1 }}>{center}</div>
      <div style={{ minWidth:60, display:'flex', justifyContent:'flex-end' }}>{right}</div>
    </div>
  );
}

export function Card({ children, color, onClick, style = {} }) {
  return (
    <div onClick={onClick} style={{ background:COLORS.surface, border:`1.5px solid ${color?color+'33':COLORS.border}`, borderRadius:16, padding:'18px 16px', cursor:onClick?'pointer':'default', transition:'border-color .2s', ...style }}>
      {children}
    </div>
  );
}

export function SettingsRow({ label, sub, right }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px 20px', gap:12, flexWrap:'wrap' }}>
      <div>
        <div style={{ fontSize:13, fontWeight:700, color:COLORS.text }}>{label}</div>
        {sub && <div style={{ fontSize:11, color:COLORS.dim, marginTop:3 }}>{sub}</div>}
      </div>
      <div>{right}</div>
    </div>
  );
}

export function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{ width:46, height:25, borderRadius:13, background:value?COLORS.teal+'33':COLORS.surface2, border:`1.5px solid ${value?COLORS.teal:COLORS.border2}`, cursor:'pointer', position:'relative', transition:'all .2s', flexShrink:0 }}>
      <div style={{ width:17, height:17, borderRadius:'50%', background:value?COLORS.teal:'#444', position:'absolute', top:2, left:value?24:2, transition:'all .2s' }} />
    </div>
  );
}

export function Adj({ value, onChange, min = 1, max = null }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
      {[-5,-1].map(d => <button key={d} style={btnStyle} onClick={() => onChange(max?Math.min(max,Math.max(min,value+d)):Math.max(min,value+d))}>{d}</button>)}
      <span style={{ color:COLORS.text, fontWeight:900, fontSize:18, minWidth:32, textAlign:'center' }}>{value}</span>
      {[1,5].map(d => <button key={d} style={btnStyle} onClick={() => onChange(max?Math.min(max,value+d):value+d)}>+{d}</button>)}
    </div>
  );
}

export const btnStyle = { background:COLORS.surface2, border:`1px solid ${COLORS.border}`, color:COLORS.dim, borderRadius:6, padding:'5px 9px', fontSize:11, cursor:'pointer', fontFamily:'inherit' };

export function PrimaryBtn({ children, onClick, color = COLORS.teal, disabled = false, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding:'12px 24px', borderRadius:10, border:'none', background:disabled?'#1e2130':color, color:disabled?'#444':'#07080f', fontWeight:800, fontSize:14, cursor:disabled?'not-allowed':'pointer', fontFamily:'inherit', letterSpacing:0.2, ...style }}>
      {children}
    </button>
  );
}

export function GhostBtn({ children, onClick, style = {} }) {
  return (
    <button onClick={onClick} style={{ padding:'10px 20px', borderRadius:10, border:`1px solid ${COLORS.border2}`, background:'transparent', color:COLORS.dim, fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'inherit', ...style }}>
      {children}
    </button>
  );
}

export function MiniMindMap({ data }) {
  if (!data) return null;
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'6px 0' }}>
      <div style={{ background:'#0a0d1a', border:`2px solid ${COLORS.teal}44`, borderRadius:10, padding:'5px 14px', fontSize:11, fontWeight:800, color:COLORS.teal, textAlign:'center', letterSpacing:1.5, whiteSpace:'pre-line' }}>{data.center}</div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:5, justifyContent:'center' }}>
        {(data.branches||[]).map((b,i) => {
          const col = getColor(b.colorKey) || b.color || COLORS.teal;
          return (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:3 }}>
              <div style={{ width:14, height:1.5, background:col, borderRadius:1 }} />
              <div style={{ background:col+'18', border:`1px solid ${col}44`, borderRadius:6, padding:'3px 8px', fontSize:10, fontWeight:700, color:col }}>{b.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function EmptyState({ icon = '📭', title, sub }) {
  return (
    <div style={{ textAlign:'center', padding:'48px 0', color:COLORS.dim }}>
      <div style={{ fontSize:40, marginBottom:12 }}>{icon}</div>
      <div style={{ fontSize:14, fontWeight:700, color:'#555', marginBottom:6 }}>{title}</div>
      {sub && <div style={{ fontSize:12, color:'#333', lineHeight:1.6 }}>{sub}</div>}
    </div>
  );
}

export function Spinner({ color = COLORS.violet, size = 24 }) {
  return <div style={{ width:size, height:size, borderRadius:'50%', border:`3px solid ${color}22`, borderTop:`3px solid ${color}`, animation:'spin 0.8s linear infinite', flexShrink:0 }} />;
}

export const C = COLORS;
