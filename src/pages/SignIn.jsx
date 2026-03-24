import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberEmail, setRememberEmail] = useState(false)
  const [rememberSession, setRememberSession] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [showMotivation, setShowMotivation] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const savedEmail = localStorage.getItem('axis_remembered_email')
    const rememberedEmail = localStorage.getItem('axis_remember_email') === 'true'
    const rememberedSession = localStorage.getItem('axis_remember_session') === 'true'
    if (savedEmail && rememberedEmail) { setEmail(savedEmail); setRememberEmail(true) }
    if (rememberedSession) setRememberSession(true)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && rememberedSession) {
        const expiresAt = localStorage.getItem('axis_session_expires')
        if (expiresAt && Date.now() < parseInt(expiresAt)) navigate('/dashboard')
      }
    })
  }, [])

  function validateEmail(val) {
    if (!val) return ''
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Please enter a valid email address'
    return ''
  }

  function handleEmailChange(e) {
    setEmail(e.target.value)
    setEmailError(validateEmail(e.target.value))
    setShowMotivation(false)
    setError('')
  }

  async function handleSignIn(e) {
    e.preventDefault()
    const emailErr = validateEmail(email)
    if (emailErr) { setEmailError(emailErr); return }
    setLoading(true)
    setError('')
    setShowMotivation(false)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message === 'Invalid login credentials') {
        setError('We could not find an account with these credentials.')
        setShowMotivation(true)
      } else {
        setError(error.message)
      }
    } else {
      if (rememberEmail) {
        localStorage.setItem('axis_remembered_email', email)
        localStorage.setItem('axis_remember_email', 'true')
      } else {
        localStorage.removeItem('axis_remembered_email')
        localStorage.removeItem('axis_remember_email')
      }
      if (rememberSession) {
        localStorage.setItem('axis_remember_session', 'true')
        const thirtyDays = Date.now() + 30 * 24 * 60 * 60 * 1000
        localStorage.setItem('axis_session_expires', thirtyDays.toString())
      } else {
        localStorage.removeItem('axis_remember_session')
        localStorage.removeItem('axis_session_expires')
      }
      localStorage.setItem('axis_last_method', 'email')
      navigate('/dashboard')
    }
    setLoading(false)
  }

  async function handleGoogleSignIn() {
    localStorage.setItem('axis_last_method', 'google')
    if (rememberSession) {
      localStorage.setItem('axis_remember_session', 'true')
      const thirtyDays = Date.now() + 30 * 24 * 60 * 60 * 1000
      localStorage.setItem('axis_session_expires', thirtyDays.toString())
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
        queryParams: { prompt: 'select_account' }
      }
    })
  }

  const lastMethod = localStorage.getItem('axis_last_method')

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px 16px',background:'#09090f',position:'relative',overflow:'hidden'}}>
      <div className="glow-purple" />

      <div style={{width:'100%',maxWidth:'480px',position:'relative',zIndex:1}}>

        {/* HEADER */}
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div className="axis-logo gradient-text" style={{marginBottom:'8px'}}>Mindoo</div>
          <p style={{color:'rgba(255,255,255,0.4)',fontSize:'15px',fontFamily:'Inter,sans-serif'}}>
            From chaos to clarity. Now do more.
          </p>
          {lastMethod && (
            <p style={{color:'#a78bfa',fontSize:'12px',marginTop:'8px',fontFamily:'Inter,sans-serif'}}>
              You last signed in with {lastMethod === 'google' ? 'Google' : 'email'}
            </p>
          )}
        </div>

        {/* MOTIVATION BOX */}
        {showMotivation && (
          <div style={{
            borderRadius:'20px',
            padding:'28px',
            marginBottom:'16px',
            background:'rgba(34,197,94,0.06)',
            border:'1px solid rgba(34,197,94,0.18)',
          }}>
            <div style={{
              width:'40px',height:'40px',borderRadius:'12px',
              background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.2)',
              display:'flex',alignItems:'center',justifyContent:'center',
              marginBottom:'16px',fontSize:'20px'
            }}>✦</div>
            <p style={{
              fontFamily:'Sora,sans-serif',fontWeight:'700',fontSize:'18px',
              color:'#ffffff',lineHeight:'1.35',letterSpacing:'-0.02em',marginBottom:'12px'
            }}>
              You are one step away from something powerful.
            </p>
            <p style={{
              fontFamily:'Inter,sans-serif',fontSize:'14px',
              color:'rgba(255,255,255,0.5)',lineHeight:'1.75',marginBottom:'12px'
            }}>
              Every great thinker, creator, and builder started exactly where you are right now — with a thought they could not yet put into words.
            </p>
            <p style={{
              fontFamily:'Inter,sans-serif',fontSize:'14px',
              color:'rgba(255,255,255,0.5)',lineHeight:'1.75',marginBottom:'20px'
            }}>
              Mindoo was built for that exact moment. It takes less than 60 seconds to unlock your second brain. No credit card. No complexity. Just you and your ideas — finally organized, finally moving forward.
            </p>
            <div style={{
              background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.15)',
              borderRadius:'12px',padding:'14px 16px'
            }}>
              <p style={{
                fontFamily:'Inter,sans-serif',fontSize:'13px',
                color:'rgba(134,239,172,0.9)',lineHeight:'1.6',fontWeight:'500'
              }}>
                Ready to start? Hit <span style={{color:'#86efac',fontWeight:'700'}}>"Sign up free"</span> below — it is waiting for you.
              </p>
            </div>
          </div>
        )}

        {/* FORM CARD */}
        <div className="glass-card" style={{padding:'clamp(24px, 5vw, 40px)'}}>

          {error && (
            <div className="alert-error" style={{marginBottom:'20px'}}>
              <div style={{display:'flex',alignItems:'flex-start',gap:'10px'}}>
                <span style={{color:'#f87171',fontSize:'16px',marginTop:'1px',flexShrink:0}}>✗</span>
                <div>
                  <p style={{fontFamily:'Inter,sans-serif',fontWeight:'600',color:'#fca5a5',fontSize:'13px',marginBottom:'4px'}}>
                    Sign in failed
                  </p>
                  <p style={{fontFamily:'Inter,sans-serif',color:'rgba(248,113,113,0.8)',fontSize:'12px',lineHeight:'1.5'}}>
                    {error} Please check your email and password and try again.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSignIn} style={{display:'flex',flexDirection:'column',gap:'16px',marginBottom:'20px'}}>

            <div>
              <label className="label-text">Email</label>
              <div style={{position:'relative'}}>
                <Mail size={16} style={{position:'absolute',left:'14px',top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.25)',pointerEvents:'none'}} />
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  autoFocus
                  className={`glass-input ${emailError ? 'error' : ''}`}
                  style={{paddingLeft:'42px'}}
                  placeholder="name@example.com"
                  required
                />
              </div>
              {emailError && <p className="error-message">✗ {emailError}</p>}
            </div>

            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                <label className="label-text" style={{margin:0}}>Password</label>
                <Link to="/forgot-password" style={{fontSize:'12px',color:'#a78bfa',textDecoration:'none',fontFamily:'Inter,sans-serif'}}>
                  Forgot password?
                </Link>
              </div>
              <div style={{position:'relative'}}>
                <Lock size={16} style={{position:'absolute',left:'14px',top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.25)',pointerEvents:'none'}} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="glass-input"
                  style={{paddingLeft:'42px',paddingRight:'50px'}}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{position:'absolute',right:'14px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.3)',display:'flex',alignItems:'center',padding:'0'}}
                >
                  {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'12px',padding:'14px 16px',display:'flex',flexDirection:'column',gap:'12px'}}>
              <label style={{display:'flex',alignItems:'flex-start',gap:'10px',cursor:'pointer'}}>
                <input
                  type="checkbox"
                  checked={rememberEmail}
                  onChange={e => setRememberEmail(e.target.checked)}
                  style={{width:'16px',height:'16px',accentColor:'#8b5cf6',marginTop:'2px',flexShrink:0}}
                />
                <div>
                  <p style={{fontFamily:'Inter,sans-serif',fontSize:'13px',color:'rgba(255,255,255,0.7)',fontWeight:'500',marginBottom:'2px'}}>Remember my email</p>
                  <p style={{fontFamily:'Inter,sans-serif',fontSize:'11px',color:'rgba(255,255,255,0.3)'}}>Pre-fills your email next time</p>
                </div>
              </label>
              <div style={{height:'1px',background:'rgba(255,255,255,0.05)'}}/>
              <label style={{display:'flex',alignItems:'flex-start',gap:'10px',cursor:'pointer'}}>
                <input
                  type="checkbox"
                  checked={rememberSession}
                  onChange={e => setRememberSession(e.target.checked)}
                  style={{width:'16px',height:'16px',accentColor:'#8b5cf6',marginTop:'2px',flexShrink:0}}
                />
                <div>
                  <p style={{fontFamily:'Inter,sans-serif',fontSize:'13px',color:'rgba(255,255,255,0.7)',fontWeight:'500',marginBottom:'2px'}}>Keep me signed in for 30 days</p>
                  <p style={{fontFamily:'Inter,sans-serif',fontSize:'11px',color:'rgba(255,255,255,0.3)'}}>Stay logged in automatically</p>
                </div>
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading
                ? <><Loader2 size={16} style={{animation:'spin 1s linear infinite'}}/><span>Signing in...</span></>
                : <span>Sign In</span>
              }
            </button>
          </form>

          <div className="divider-line"><span>or continue with</span></div>

          <button onClick={handleGoogleSignIn} className="btn-secondary" style={{marginBottom:'24px'}}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:'20px'}}>
            <p style={{fontFamily:'Inter,sans-serif',fontSize:'12px',color:'rgba(255,255,255,0.25)',textAlign:'center',marginBottom:'12px'}}>
              Forgot which email you used? Check your password manager or inbox for a message from Mindoo.
            </p>
            <p style={{fontFamily:'Inter,sans-serif',fontSize:'14px',color:'rgba(255,255,255,0.4)',textAlign:'center'}}>
              Do not have an account?{' '}
              <Link to="/signup" style={{color:'#a78bfa',textDecoration:'none',fontWeight:'600'}}>
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}