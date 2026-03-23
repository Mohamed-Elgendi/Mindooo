import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Shield } from 'lucide-react'

export default function Terms() {
  const navigate = useNavigate()

  return (
    <div className="page-bg" style={{ minHeight: '100vh' }}>
      <div className="glow-purple" />

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px' }}>

        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontFamily: 'Inter,sans-serif', padding: '0', marginBottom: '48px', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          <ChevronLeft size={14} /> Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={22} style={{ color: '#a78bfa' }} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Sora,sans-serif', fontWeight: '800', fontSize: '32px', color: '#ffffff', letterSpacing: '-0.03em', margin: 0 }}>Terms of Service</h1>
          </div>
        </div>
        <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '48px' }}>Last updated: March 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {[
            {
              num: '01', title: 'Acceptance of Terms',
              content: 'By accessing or using AXIS ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. These terms apply to all users, visitors, and others who access or use the Service.'
            },
            {
              num: '02', title: 'Description of Service',
              content: 'AXIS is a personal AI-powered second brain and productivity system that helps users organize thoughts, plan goals, execute tasks, and interact intelligently with AI language models. The Service includes a web application, prompt engineering tools, sequential prompt chains, templates, and a skill-building framework.'
            },
            {
              num: '03', title: 'User Accounts',
              content: 'To use the Service, you must create an account. You agree to provide accurate, complete, and current information during registration. You are responsible for maintaining the security of your password and account, and for all activities that occur under your account. Notify us immediately of any unauthorized access.'
            },
            {
              num: '04', title: 'Acceptable Use',
              content: 'You agree not to use the Service to violate any applicable laws or regulations, transmit harmful or unlawful content, attempt unauthorized access to any part of the Service, interfere with or disrupt the integrity or performance of the Service, collect personally identifiable information from other users, or use the Service for commercial purposes without prior written consent.'
            },
            {
              num: '05', title: 'Intellectual Property',
              content: 'The Service and its original content, features, and functionality are and will remain the exclusive property of AXIS and its licensors. Our trademarks and trade dress may not be used without prior written consent. You retain ownership of any content you create using the Service.'
            },
            {
              num: '06', title: 'AI-Generated Content',
              content: 'The Service uses artificial intelligence to generate responses, suggestions, and content. AI-generated content may not always be accurate, complete, or up to date. You are responsible for verifying any important information before acting on it. AXIS is not liable for decisions made based on AI-generated content, and such content should not replace professional advice.'
            },
            {
              num: '07', title: 'Privacy',
              content: 'Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Service, you consent to the collection and use of information as described in our Privacy Policy.'
            },
            {
              num: '08', title: 'Termination',
              content: 'We reserve the right to terminate or suspend your account and access to the Service at our sole discretion, without notice, for conduct that violates these Terms or is harmful to other users, us, or third parties. Upon termination, your right to use the Service will immediately cease.'
            },
            {
              num: '09', title: 'Limitation of Liability',
              content: 'To the maximum extent permitted by law, AXIS shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of or in connection with your use of the Service. Our total liability shall not exceed the amount you paid to us in the twelve months preceding the claim.'
            },
            {
              num: '10', title: 'Disclaimer of Warranties',
              content: 'The Service is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that the Service will be uninterrupted, error-free, or completely secure.'
            },
            {
              num: '11', title: 'Changes to Terms',
              content: 'We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the Service. Your continued use of the Service after such modifications constitutes your acceptance of the updated terms.'
            },
            {
              num: '12', title: 'Governing Law',
              content: 'These Terms shall be governed by and construed in accordance with applicable international law. Any disputes arising under these terms shall be resolved through good-faith negotiation, and if necessary, through binding arbitration.'
            },
            {
              num: '13', title: 'Contact Us',
              content: 'If you have any questions about these Terms of Service, please contact us at support@axis-app.com'
            },
          ].map(section => (
            <div key={section.num} style={{ display: 'flex', gap: '24px' }}>
              <div style={{ flexShrink: 0, paddingTop: '4px' }}>
                <span style={{ fontFamily: 'Sora,sans-serif', fontWeight: '700', fontSize: '12px', color: 'rgba(139,92,246,0.6)', letterSpacing: '0.05em' }}>{section.num}</span>
              </div>
              <div style={{ flex: 1, paddingBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ fontFamily: 'Sora,sans-serif', fontWeight: '700', fontSize: '18px', color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '12px' }}>{section.title}</h2>
                <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.8' }}>{section.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '40px', padding: '24px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '16px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Questions about these terms?</p>
          <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '15px', fontWeight: '600', color: '#a78bfa' }}>support@axis-app.com</p>
        </div>

      </div>
    </div>
  )
}