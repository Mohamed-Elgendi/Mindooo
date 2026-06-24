// src/modules/memoryos/components/MemoryOS.jsx
import { useMemoryOS } from '../hooks/useMemoryOS.js';
import { HomeScreen } from './screens/HomeScreen.jsx';
import { GuruCenterScreen } from './screens/GuruCenterScreen.jsx';
import { GuruDetailScreen } from './screens/GuruDetailScreen.jsx';
import { GuruStepScreen } from './screens/GuruStepScreen.jsx';
import { ArchiveScreen } from './screens/ArchiveScreen.jsx';
import { CurriculumScreen } from './screens/CurriculumScreen.jsx';
import { SessionScreen } from './screens/SessionScreen.jsx';
import { SessionDoneScreen } from './screens/SessionDoneScreen.jsx';
import { NobelMindScreen } from './screens/NobelMindScreen.jsx';
import { NobelDomainScreen } from './screens/NobelDomainScreen.jsx';
import { AIMindLabScreen } from './screens/AIMindLabScreen.jsx';
import { AiCoachScreen } from './screens/AiCoachScreen.jsx';
import { AnalyticsScreen } from './screens/AnalyticsScreen.jsx';
import { SettingsScreen } from './screens/SettingsScreen.jsx';

export function MemoryOS({ user, supabase, onNavigate }) {
  const m = useMemoryOS({ supabaseClient: supabase, userId: user?.id, initialScreen: 'home' });

  if (m.loading) {
    return (
      <div className="section-scroll">
        <div style={S.center}>
          <div style={S.loadingDot} />
          <div style={S.loadingText}>Loading MemoryOS...</div>
        </div>
      </div>
    );
  }

  if (m.error) {
    return (
      <div className="section-scroll">
        <div style={S.center}>
          <div style={{ color:'#f87171', fontSize:14, textAlign:'center', maxWidth:340 }}>
            <div style={{ fontSize:32, marginBottom:12 }}>⚠️</div>
            <div style={{ fontWeight:700, marginBottom:6 }}>MemoryOS failed to initialize</div>
            <div style={{ color:'#888', fontSize:12, marginBottom:16 }}>{m.error}</div>
            <button onClick={() => window.location.reload()} style={S.retryBtn}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  const screenProps = { m, onNavigate };
  switch (m.screen) {
    case 'home': return <HomeScreen {...screenProps} />;
    case 'guru-center': return <GuruCenterScreen {...screenProps} />;
    case 'guru-detail': return <GuruDetailScreen {...screenProps} />;
    case 'guru-step': return <GuruStepScreen {...screenProps} />;
    case 'knowledge-archive': return <ArchiveScreen {...screenProps} />;
    case 'curriculum-detail': return <CurriculumScreen {...screenProps} />;
    case 'session': return m.session.state.sessionDone ? <SessionDoneScreen {...screenProps} /> : <SessionScreen {...screenProps} />;
    case 'session-done': return <SessionDoneScreen {...screenProps} />;
    case 'nobel-mind': return <NobelMindScreen {...screenProps} />;
    case 'nobel-domain': return <NobelDomainScreen {...screenProps} />;
    case 'ai-mind-lab': return <AIMindLabScreen {...screenProps} />;
    case 'ai-coach': return <AiCoachScreen {...screenProps} />;
    case 'analytics': return <AnalyticsScreen {...screenProps} />;
    case 'settings': return <SettingsScreen {...screenProps} />;
    default: return <HomeScreen {...screenProps} />;
  }
}

const S = {
  center: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:360, gap:12 },
  loadingDot: { width:32, height:32, borderRadius:'50%', border:'3px solid #a78bfa33', borderTop:'3px solid #a78bfa', animation:'spin 0.8s linear infinite' },
  loadingText: { color:'#a78bfa', fontSize:13, fontWeight:600 },
  retryBtn: { padding:'9px 22px', borderRadius:8, border:'1px solid #a78bfa44', background:'#a78bfa22', color:'#a78bfa', fontSize:13, fontWeight:600, cursor:'pointer' },
};
