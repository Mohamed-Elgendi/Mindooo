import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Lock } from 'lucide-react'

export default function Privacy() {
  const navigate = useNavigate()

  const sections = [
    {
      num: '01',
      title: 'Introduction',
      content: 'Mindoo ("we", "our", or "us") is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, store, and protect your information when you use our Service. We take your privacy seriously and will never sell your personal data to third parties.'
    },
    {
      num: '02',
      title: 'Information we collect',
      content: 'We collect information you provide directly: first and last name, email address, phone number (optional), password (stored encrypted — we never see your plain password), content you create or save within the Service, and prompt chains, templates, and skill progress you build. We also collect automatically: device type, browser type, IP address (security only), usage patterns, and session duration.'
    },
    {
      num: '03',
      title: 'How we use your information',
      content: 'We use the information we collect to create and manage your account, provide and improve the Service, personalize your experience including greeting you by name, send transactional emails such as account confirmation and password resets, respond to support requests, monitor usage to improve the Service, detect and prevent fraudulent activity, and comply with legal obligations.'
    },
    {
      num: '04',
      title: 'How we store and protect your data',
      content: 'All data is stored using Supabase, a secure cloud database platform with enterprise-grade security. All data transmission is encrypted using TLS/SSL. Passwords are hashed using bcrypt and are never stored in plain text. Row Level Security (RLS) ensures each user can only access their own data. We conduct regular security reviews and access to user data is strictly limited to authorized personnel only.'
    },
    {
      num: '05',
      title: 'Data sharing and third parties',
      content: 'We do not sell, trade, or rent your personal information to third parties. We may share your information only with trusted service providers that help us operate the Service (Supabase, Vercel), when required by law or court order, to protect the rights or safety of Mindoo or our users, or in the event of a merger or acquisition where users will be notified before data is transferred.'
    },
    {
      num: '06',
      title: 'Your rights',
      content: 'You have the right to access a copy of the personal data we hold about you, request correction of inaccurate data, request deletion of your personal data, request your data in a portable format, object to processing of your personal data, restrict how we use your data, and withdraw consent at any time. To exercise any of these rights, contact us at privacy@mindoo.app'
    },
    {
      num: '07',
      title: 'Cookies and tracking',
      content: 'We use minimal, essential cookies and local storage only to maintain your login session, remember your preferences such as remembered email, and ensure the security of your account. We do not use advertising cookies or third-party tracking pixels. You can clear cookies at any time through your browser settings.'
    },
    {
      num: '08',
      title: 'Data retention',
      content: 'We retain your personal data for as long as your account is active or as needed to provide the Service. If you delete your account, we will delete your personal data within 30 days, except where required by law to retain it longer. Anonymized usage data may be retained for analytical purposes.'
    },
    {
      num: '09',
      title: "Children's privacy",
      content: 'The Service is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us and we will take steps to delete such information immediately.'
    },
    {
      num: '10',
      title: 'International data transfers',
      content: 'Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and that appropriate safeguards are in place to protect your personal information.'
    },
    {
      num: '11',
      title: 'Changes to this policy',
      content: 'We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by placing a prominent notice on the Service. Your continued use of the Service after changes become effective constitutes your acceptance of the revised policy.'
    },
    {
      num: '12',
      title: 'Contact us',
      content: 'If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our Privacy Team at privacy@mindoo.app. We respond within 72 hours.'
    },
  ]

  return (
    <div style={{minHeight:'100vh',background:'#09090f',position:'relative'}}>
      <div className="glow-purple" />

      <div style={{maxWidth:'760px',margin:'0 auto',padding:'clamp(24px, 5vw, 48px) clamp(16px, 5vw, 24px)',position:'relative',zIndex:1}}>

        <button
          onClick={() => navigate(-1)}
          style={{display:'flex',alignItems:'center',gap:'6px',background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.4)',fontSize:'13px',fontFamily:'Inter,sans-serif',padding:'0',marginBottom:'48px',transition:'color 0.2s'}}
          onMouseEnter={e => e.currentTarget.style.color='#a78bfa'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.4)'}
        >
          <ChevronLeft size={14} /> Back
        </button>

        {/* HEADER */}
        <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'12px',flexWrap:'wrap'}}>
          <div style={{width:'48px',height:'48px',borderRadius:'14px',background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <Lock size={22} style={{color:'#a78bfa'}} />
          </div>
          <h1 style={{fontFamily:'Sora,sans-serif',fontWeight:'800',fontSize:'clamp(24px, 5vw, 32px)',color:'#ffffff',letterSpacing:'-0.03em',margin:0}}>Privacy Policy</h1>
        </div>
        <p style={{fontFamily:'Inter,sans-serif',fontSize:'13px',color:'rgba(255,255,255,0.3)',marginBottom:'48px'}}>Last updated: March 2026</p>

        {/* TRUST BADGE */}
        <div style={{background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.15)',borderRadius:'14px',padding:'16px 20px',marginBottom:'48px',display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#4ade80',flexShrink:0}} />
          <p style={{fontFamily:'Inter,sans-serif',fontSize:'14px',color:'rgba(255,255,255,0.6)',margin:0}}>
            We never sell your personal data. Your privacy is a right, not a feature.
          </p>
        </div>

        {/* SECTIONS */}
        <div style={{display:'flex',flexDirection:'column',gap:'0'}}>
          {sections.map((section, index) => (
            <div key={section.num} style={{display:'flex',gap:'clamp(12px, 3vw, 24px)'}}>
              <div style={{flexShrink:0,paddingTop:'4px'}}>
                <span style={{fontFamily:'Sora,sans-serif',fontWeight:'700',fontSize:'12px',color:'rgba(139,92,246,0.6)',letterSpacing:'0.05em'}}>{section.num}</span>
              </div>
              <div style={{flex:1,paddingBottom:'40px',borderBottom: index < sections.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'}}>
                <h2 style={{fontFamily:'Sora,sans-serif',fontWeight:'700',fontSize:'18px',color:'#ffffff',letterSpacing:'-0.02em',marginBottom:'12px',textTransform:'capitalize'}}>{section.title}</h2>
                <p style={{fontFamily:'Inter,sans-serif',fontSize:'15px',color:'rgba(255,255,255,0.5)',lineHeight:'1.8'}}>{section.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER GRID — stacks on mobile */}
        <div style={{marginTop:'40px',display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:'12px'}}>
          <div style={{padding:'20px',background:'rgba(139,92,246,0.06)',border:'1px solid rgba(139,92,246,0.15)',borderRadius:'14px'}}>
            <p style={{fontFamily:'Inter,sans-serif',fontSize:'12px',color:'rgba(255,255,255,0.3)',marginBottom:'4px',textTransform:'uppercase',letterSpacing:'0.06em'}}>General inquiries</p>
            <p style={{fontFamily:'Inter,sans-serif',fontSize:'14px',fontWeight:'600',color:'#a78bfa'}}>support@mindoo.app</p>
          </div>
          <div style={{padding:'20px',background:'rgba(139,92,246,0.06)',border:'1px solid rgba(139,92,246,0.15)',borderRadius:'14px'}}>
            <p style={{fontFamily:'Inter,sans-serif',fontSize:'12px',color:'rgba(255,255,255,0.3)',marginBottom:'4px',textTransform:'uppercase',letterSpacing:'0.06em'}}>Privacy requests</p>
            <p style={{fontFamily:'Inter,sans-serif',fontSize:'14px',fontWeight:'600',color:'#a78bfa'}}>privacy@mindoo.app</p>
          </div>
        </div>

      </div>
    </div>
  )
}