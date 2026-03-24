import { useState } from 'react'
import { supabase } from '../supabase'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Loader2, ChevronLeft } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  function validateEmail(val) {
    if (!val) return ''
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Please enter a valid email address'
    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const emailErr = validateEmail(email)
    if (!email) { setEmailError('Email is required'); return }
    if (emailErr) { setEmailError(emailErr); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password'
    })
    if (error) { setError(error.message) } else { setSuccess(true) }
    setLoading(false)
  }

  if (success) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px 16px',background:'#09090f',position:'relative'}}>
        <div className="glow-purple" />
        <div style={{width:'100%',maxWidth:'480px',position:'relative',zIndex:1}}>
          <div style={{textAlign:'center',marginBottom:'32px'}}>
            <div className="axis-logo gradient-text" style={{marginBottom:'8px'}}>Mindoo</div>
          </div>
          <div className="glass-card" style={{padding:'clamp(24px, 5vw, 40px)',textAlign:'center'}}>
            <div style={{width:'64px',height:'64px',borderRadius:'20px',background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px'}}>
              <Mail size={28} style={{color:'#a78bfa'}} />
            </div>
            <h2 style={{fontFamily:'Sora,sans-serif',fontWeight:'700',fontSize:'24px',color:'#ffffff',letterSpacing:'-0.02em',marginBottom:'8px'}}>Check your email</h2>
            <p style={{fontFamily:'Inter,sans-serif',fontSize:'14px',color:'rgba(255,255,255,0.4)',marginBottom:'4px'}}>We sent a password reset link to</p>
            <p style={{fontFamily:'Inter,sans-serif',fontSize:'15px',fontWeight:'600',color:'#ffffff',marginBottom:'8px',wordBreak:'break-all'}}>{email}</p>
            <p style={{fontFamily:'Inter,sans-serif',fontSize:'13px',color:'rgba(255,255,255,0.3)',marginBottom:'32px',lineHeight:'1.6'}}>
              Click the link in the email to reset your password. Check your spam folder if you do not see it.
            </p>
            <button onClick={() => navigate('/signin')} className="btn-primary">
              <span>Back to Sign In</span>
            </button>
          </div>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px 16px',background:'#09090f',position:'relative'}}>
      <div className="glow-purple" />
      <div style={{width:'100%',maxWidth:'480px',position:'relative',zIndex:1}}>

        {/* HEADER */}
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div className="axis-logo gradient-text" style={{marginBottom:'8px'}}>Mindoo</div>
          <p style={{color:'rgba(255,255,255,0.4)',fontSize:'15px',fontFamily:'Inter,sans-serif'}}>From chaos to clarity. Now do more.</p>
        </div>

        {/* CARD */}
        <div className="glass-card" style={{padding:'clamp(24px, 5vw, 40px)'}}>
          <button
            onClick={() => navigate('/signin')}
            style={{display:'flex',alignItems:'center',gap:'6px',background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.4)',fontSize:'13px',fontFamily:'Inter,sans-serif',padding:'0',marginBottom:'24px'}}
          >
            <ChevronLeft size={14} /> Back to Sign In
          </button>

          <h2 style={{fontFamily:'Sora,sans-serif',fontWeight:'700',fontSize:'22px',color:'#ffffff',letterSpacing:'-0.02em',marginBottom:'8px'}}>Forgot your password?</h2>
          <p style={{fontFamily:'Inter,sans-serif',fontSize:'14px',color:'rgba(255,255,255,0.4)',marginBottom:'28px',lineHeight:'1.6'}}>
            No worries. Enter your email address and we will send you a link to reset your password.
          </p>

          {error && (
            <div className="alert-error" style={{marginBottom:'16px'}}>
              <div style={{display:'flex',gap:'10px',alignItems:'flex-start'}}>
                <span style={{color:'#f87171',flexShrink:0}}>✗</span>
                <p style={{fontFamily:'Inter,sans-serif',fontSize:'13px',color:'rgba(248,113,113,0.9)'}}>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            <div>
              <label className="label-text">Email address</label>
              <div style={{position:'relative'}}>
                <Mail size={16} style={{position:'absolute',left:'14px',top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.25)',pointerEvents:'none'}} />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError(validateEmail(e.target.value)) }}
                  autoFocus
                  className={`glass-input ${emailError ? 'error' : ''}`}
                  style={{paddingLeft:'42px'}}
                  placeholder="name@example.com"
                  required
                />
              </div>
              {emailError && <p className="error-message">✗ {emailError}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading
                ? <><Loader2 size={16} style={{animation:'spin 1s linear infinite'}}/><span>Sending...</span></>
                : <span>Send reset link</span>
              }
            </button>
          </form>

          <div style={{marginTop:'24px',paddingTop:'24px',borderTop:'1px solid rgba(255,255,255,0.06)',textAlign:'center'}}>
            <p style={{fontFamily:'Inter,sans-serif',fontSize:'12px',color:'rgba(255,255,255,0.25)',marginBottom:'12px'}}>
              Forgot which email you used? Check your password manager or inbox for a message from Mindoo.
            </p>
            <p style={{fontFamily:'Inter,sans-serif',fontSize:'14px',color:'rgba(255,255,255,0.4)'}}>
              Remember your password?{' '}
              <Link to="/signin" style={{color:'#a78bfa',textDecoration:'none',fontWeight:'600'}}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}