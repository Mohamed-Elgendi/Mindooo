import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, User, Phone, Loader2, RefreshCw, Copy, Check, ChevronLeft } from 'lucide-react'

const COUNTRIES = [
  { code: '+20', flag: '🇪🇬', name: 'Egypt', digits: 10 },
  { code: '+1', flag: '🇺🇸', name: 'USA', digits: 10 },
  { code: '+44', flag: '🇬🇧', name: 'UK', digits: 10 },
  { code: '+971', flag: '🇦🇪', name: 'UAE', digits: 9 },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia', digits: 9 },
  { code: '+974', flag: '🇶🇦', name: 'Qatar', digits: 8 },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait', digits: 8 },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain', digits: 8 },
  { code: '+968', flag: '🇴🇲', name: 'Oman', digits: 8 },
  { code: '+962', flag: '🇯🇴', name: 'Jordan', digits: 9 },
  { code: '+961', flag: '🇱🇧', name: 'Lebanon', digits: 8 },
  { code: '+963', flag: '🇸🇾', name: 'Syria', digits: 9 },
  { code: '+964', flag: '🇮🇶', name: 'Iraq', digits: 10 },
  { code: '+212', flag: '🇲🇦', name: 'Morocco', digits: 9 },
  { code: '+216', flag: '🇹🇳', name: 'Tunisia', digits: 8 },
  { code: '+213', flag: '🇩🇿', name: 'Algeria', digits: 9 },
  { code: '+249', flag: '🇸🇩', name: 'Sudan', digits: 9 },
  { code: '+33', flag: '🇫🇷', name: 'France', digits: 9 },
  { code: '+49', flag: '🇩🇪', name: 'Germany', digits: 10 },
  { code: '+39', flag: '🇮🇹', name: 'Italy', digits: 10 },
  { code: '+34', flag: '🇪🇸', name: 'Spain', digits: 9 },
  { code: '+7', flag: '🇷🇺', name: 'Russia', digits: 10 },
  { code: '+86', flag: '🇨🇳', name: 'China', digits: 11 },
  { code: '+91', flag: '🇮🇳', name: 'India', digits: 10 },
  { code: '+81', flag: '🇯🇵', name: 'Japan', digits: 10 },
  { code: '+55', flag: '🇧🇷', name: 'Brazil', digits: 11 },
  { code: '+27', flag: '🇿🇦', name: 'South Africa', digits: 9 },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria', digits: 10 },
  { code: '+254', flag: '🇰🇪', name: 'Kenya', digits: 9 },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan', digits: 10 },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh', digits: 10 },
  { code: '+62', flag: '🇮🇩', name: 'Indonesia', digits: 10 },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia', digits: 9 },
  { code: '+65', flag: '🇸🇬', name: 'Singapore', digits: 8 },
  { code: '+90', flag: '🇹🇷', name: 'Turkey', digits: 10 },
  { code: '+98', flag: '🇮🇷', name: 'Iran', digits: 10 },
  { code: '+82', flag: '🇰🇷', name: 'South Korea', digits: 10 },
  { code: '+61', flag: '🇦🇺', name: 'Australia', digits: 9 },
  { code: '+64', flag: '🇳🇿', name: 'New Zealand', digits: 9 },
  { code: '+52', flag: '🇲🇽', name: 'Mexico', digits: 10 },
  { code: '+54', flag: '🇦🇷', name: 'Argentina', digits: 10 },
]

function generatePassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const special = '!@#$%^&*'
  const all = upper + lower + numbers + special
  let p = ''
  p += upper[Math.floor(Math.random() * upper.length)]
  p += lower[Math.floor(Math.random() * lower.length)]
  p += numbers[Math.floor(Math.random() * numbers.length)]
  p += special[Math.floor(Math.random() * special.length)]
  for (let i = 4; i < 16; i++) p += all[Math.floor(Math.random() * all.length)]
  return p.split('').sort(() => Math.random() - 0.5).join('')
}

function getStrength(p) {
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  if (p.length >= 12) s++
  return s
}

const strengthLevels = [
  { label: 'Very weak', color: '#ef4444' },
  { label: 'Weak', color: '#f97316' },
  { label: 'Fair', color: '#eab308' },
  { label: 'Strong', color: '#3b82f6' },
  { label: 'Very strong', color: '#22c55e' },
]

function Req({ met, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontFamily: 'Inter,sans-serif', color: met ? '#4ade80' : 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }}>
      {met
        ? <Check size={12} style={{ color: '#4ade80', flexShrink: 0 }} />
        : <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
      }
      {text}
    </div>
  )
}

export default function SignUp() {
  const [step, setStep] = useState(1)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [countryCode, setCountryCode] = useState('+20')
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [firstNameError, setFirstNameError] = useState('')
  const [lastNameError, setLastNameError] = useState('')
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [resendSuccess, setResendSuccess] = useState(false)
  const [suggestedPassword, setSuggestedPassword] = useState('')
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [copied, setCopied] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!success) return
    if (countdown === 0) { handleAutoResend(); return }
    const timer = setInterval(() => {
      setCountdown(prev => { if (prev <= 1) { clearInterval(timer); return 0 } return prev - 1 })
    }, 1000)
    return () => clearInterval(timer)
  }, [success, countdown])

  useEffect(() => {
    if (step === 2) { setSuggestedPassword(generatePassword()); setShowSuggestion(true) }
  }, [step])

  async function handleAutoResend() {
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (!error) { setResendMessage('Confirmation email resent automatically.'); setResendSuccess(true); setCountdown(30) }
  }

  function validateEmail(val) {
    if (!val) return ''
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Please enter a valid email address'
    return ''
  }

  function validatePhone(val, code) {
    if (!val) return ''
    const country = COUNTRIES.find(c => c.code === code)
    if (val.length < 7) return 'Phone number is too short'
    if (val.length > 15) return 'Phone number is too long'
    if (country && val.length !== country.digits) return `${country.name} numbers must be ${country.digits} digits`
    return ''
  }

  function handlePhoneChange(val) {
    const cleaned = val.replace(/\D/g, '')
    setPhone(cleaned)
    if (cleaned) setPhoneError(validatePhone(cleaned, countryCode))
    else setPhoneError('')
  }

  function handleCountryChange(code) {
    setCountryCode(code)
    setShowCountryDropdown(false)
    setCountrySearch('')
    if (phone) setPhoneError(validatePhone(phone, code))
  }

  function handleStepOne() {
    let valid = true
    if (!firstName.trim()) { setFirstNameError('First name is required'); valid = false } else setFirstNameError('')
    if (!lastName.trim()) { setLastNameError('Last name is required'); valid = false } else setLastNameError('')
    const emailErr = validateEmail(email)
    if (!email) { setEmailError('Email is required'); valid = false }
    else if (emailErr) { setEmailError(emailErr); valid = false }
    else setEmailError('')
    if (phone) { const pe = validatePhone(phone, countryCode); if (pe) { setPhoneError(pe); valid = false } }
    if (!valid) return
    setError(''); setStep(2)
  }

  const reqs = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    match: password.length > 0 && confirmPassword.length > 0 && password === confirmPassword,
  }
  const passwordValid = reqs.length && reqs.upper && reqs.number && reqs.special
  const strength = getStrength(password)
  const strengthLevel = strengthLevels[Math.min(strength, 4)]

  async function handleSignUp(e) {
    e.preventDefault()
    if (!passwordValid) { setError('Please meet all password requirements'); return }
    if (!reqs.match) { setError('Passwords do not match'); return }
    if (!agreed) { setError('Please agree to the terms to continue'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}`, phone: phone ? `${countryCode}${phone}` : '' } }
    })
    if (error) { setError(error.message) } else { setSuccess(true); setCountdown(30) }
    setLoading(false)
  }

  async function handleGoogleSignUp() {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/dashboard' } })
  }

  async function handleManualResend() {
    setResending(true); setResendMessage(''); setResendSuccess(false)
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) { setResendMessage('Failed to resend. Please try again.'); setResendSuccess(false) }
    else { setResendMessage('Confirmation email sent successfully.'); setResendSuccess(true); setCountdown(30) }
    setResending(false)
  }

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.includes(countrySearch)
  )
  const selectedCountry = COUNTRIES.find(c => c.code === countryCode)

  const inputStyle = { paddingLeft: '42px' }
  const iconStyle = { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }

  if (success) {
    return (
      <div className="page-bg flex items-center justify-center px-4 py-12" style={{ minHeight: '100vh' }}>
        <div className="glow-purple" />
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="axis-logo gradient-text" style={{ marginBottom: '8px' }}>AXIS</div>
          </div>
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Check size={28} style={{ color: '#4ade80' }} />
            </div>
            <h2 style={{ fontFamily: 'Sora,sans-serif', fontWeight: '700', fontSize: '24px', color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '8px' }}>Check your email</h2>
            <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>We sent a confirmation link to</p>
            <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>{email}</p>
            <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '32px' }}>Click the link to activate your account. Check your spam folder if you do not see it.</p>
            {resendMessage && (
              <div className={resendSuccess ? 'alert-success' : 'alert-error'} style={{ marginBottom: '20px' }}>
                <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '13px', color: resendSuccess ? '#4ade80' : '#f87171' }}>{resendMessage}</p>
              </div>
            )}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'Inter,sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{countdown > 0 ? `Auto-resend in ${countdown}s` : 'Ready to resend'}</span>
                <span style={{ fontFamily: 'Inter,sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{Math.round((countdown / 30) * 100)}%</span>
              </div>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg,#8b5cf6,#3b82f6)', borderRadius: '2px', width: `${(countdown / 30) * 100}%`, transition: 'width 1s linear' }} />
              </div>
            </div>
            <button onClick={handleManualResend} disabled={countdown > 0 || resending} className="btn-primary" style={{ marginBottom: '12px' }}>
              {resending ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /><span>Sending...</span></> : countdown > 0 ? <span>Resend available in {countdown}s</span> : <span>Resend confirmation email</span>}
            </button>
            <button onClick={() => navigate('/signin')} className="btn-secondary">
              <span>Back to Sign In</span>
            </button>
          </div>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div className="page-bg flex items-center justify-center px-4 py-12" style={{ minHeight: '100vh' }}>
      <div className="glow-purple" />
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="axis-logo gradient-text" style={{ marginBottom: '8px' }}>AXIS</div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', fontFamily: 'Inter,sans-serif' }}>Create your Second Brain</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
            <div style={{ height: '3px', width: '60px', borderRadius: '2px', background: step >= 1 ? 'linear-gradient(90deg,#8b5cf6,#6366f1)' : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />
            <div style={{ height: '3px', width: '60px', borderRadius: '2px', background: step >= 2 ? 'linear-gradient(90deg,#6366f1,#3b82f6)' : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />
            <span style={{ fontFamily: 'Inter,sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginLeft: '8px' }}>Step {step} of 2</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '40px' }}>
          {error && (
            <div className="alert-error">
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ color: '#f87171', flexShrink: 0 }}>✗</span>
                <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '13px', color: 'rgba(248,113,113,0.9)' }}>{error}</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="label-text">First name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={iconStyle} />
                    <input type="text" value={firstName} onChange={e => { setFirstName(e.target.value); setFirstNameError('') }} autoFocus className={`glass-input ${firstNameError ? 'error' : ''}`} style={inputStyle} placeholder="John" />
                  </div>
                  {firstNameError && <p className="error-message">✗ {firstNameError}</p>}
                </div>
                <div>
                  <label className="label-text">Last name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={iconStyle} />
                    <input type="text" value={lastName} onChange={e => { setLastName(e.target.value); setLastNameError('') }} className={`glass-input ${lastNameError ? 'error' : ''}`} style={inputStyle} placeholder="Doe" />
                  </div>
                  {lastNameError && <p className="error-message">✗ {lastNameError}</p>}
                </div>
              </div>

              <div>
                <label className="label-text">Email address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={iconStyle} />
                  <input type="email" value={email} onChange={e => { setEmail(e.target.value); setEmailError(validateEmail(e.target.value)) }} className={`glass-input ${emailError ? 'error' : ''}`} style={inputStyle} placeholder="name@example.com" />
                </div>
                {emailError ? <p className="error-message">✗ {emailError}</p> : <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '6px' }}>We will never share your email with anyone.</p>}
              </div>

              <div>
                <label className="label-text">Phone number <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: '400' }}>(optional)</span></label>
                <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <button type="button" onClick={() => setShowCountryDropdown(!showCountryDropdown)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '13px 12px', color: 'white', cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap', fontFamily: 'Inter,sans-serif' }}>
                      <span>{selectedCountry?.flag}</span>
                      <span>{countryCode}</span>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>▼</span>
                    </button>
                    {showCountryDropdown && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', width: '280px', background: '#16162a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', zIndex: 100, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                        <div style={{ padding: '12px' }}>
                          <input type="text" value={countrySearch} onChange={e => setCountrySearch(e.target.value)} placeholder="Search country..." autoFocus className="glass-input" style={{ fontSize: '13px', padding: '10px 14px' }} />
                        </div>
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {filteredCountries.map(c => (
                            <button key={c.code} type="button" onClick={() => handleCountryChange(c.code)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: countryCode === c.code ? 'rgba(139,92,246,0.15)' : 'transparent', border: 'none', cursor: 'pointer', color: 'white', fontFamily: 'Inter,sans-serif', fontSize: '13px', textAlign: 'left' }}>
                              <span>{c.flag}</span>
                              <span style={{ flex: 1 }}>{c.name}</span>
                              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>{c.code} · {c.digits}d</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <Phone size={16} style={iconStyle} />
                    <input type="tel" value={phone} onChange={e => handlePhoneChange(e.target.value)} className={`glass-input ${phoneError ? 'error' : phone && !phoneError ? 'success' : ''}`} style={inputStyle} placeholder={`${selectedCountry?.digits || 10} digits`} maxLength={15} />
                  </div>
                </div>
                {phoneError && <p className="error-message">✗ {phoneError}</p>}
                {phone && !phoneError && <p className="success-message"><Check size={12} /> Valid phone number</p>}
              </div>

              <button type="button" onClick={handleStepOne} className="btn-primary" style={{ marginTop: '4px' }}>
                <span>Continue</span>
              </button>

              <div className="divider-line"><span>or</span></div>

              <button type="button" onClick={handleGoogleSignUp} className="btn-secondary">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                Already have an account?{' '}
                <Link to="/signin" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: '600' }}>Sign in</Link>
              </p>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button type="button" onClick={() => { setStep(1); setError('') }} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontFamily: 'Inter,sans-serif', padding: '0', marginBottom: '4px' }}>
                <ChevronLeft size={14} /> Back
              </button>

              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 16px' }}>
                <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>Signing up as</p>
                <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{firstName} {lastName} — {email}</p>
              </div>

              {showSuggestion && (
                <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '14px', padding: '16px' }}>
                  <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '12px', fontWeight: '600', color: '#a78bfa', marginBottom: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Suggested strong password</p>
                  <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '12px 14px', marginBottom: '10px' }}>
                    <p style={{ fontFamily: 'monospace', fontSize: '14px', color: '#ffffff', letterSpacing: '0.05em', wordBreak: 'break-all' }}>{suggestedPassword}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => { setPassword(suggestedPassword); setConfirmPassword(suggestedPassword); setShowPassword(true); setShowSuggestion(false) }} style={{ flex: 1, background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: 'white', border: 'none', borderRadius: '10px', padding: '9px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Use this</button>
                    <button type="button" onClick={() => { navigator.clipboard.writeText(suggestedPassword); setCopied(true); setTimeout(() => setCopied(false), 2000) }} style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 14px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter,sans-serif', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
                    </button>
                    <button type="button" onClick={() => setSuggestedPassword(generatePassword())} style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 14px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </div>
              )}

              {!showSuggestion && (
                <button type="button" onClick={() => { setSuggestedPassword(generatePassword()); setShowSuggestion(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a78bfa', fontSize: '13px', fontFamily: 'Inter,sans-serif', display: 'flex', alignItems: 'center', gap: '6px', padding: '0' }}>
                  ✦ Suggest a strong password
                </button>
              )}

              <div>
                <label className="label-text">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={iconStyle} />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} autoFocus className="glass-input" style={{ paddingLeft: '42px', paddingRight: '50px' }} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex', padding: '0' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {password && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                      {[0,1,2,3,4].map(i => (
                        <div key={i} className="strength-segment" style={{ background: i < strength ? strengthLevel.color : 'rgba(255,255,255,0.08)' }} />
                      ))}
                    </div>
                    <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '12px', color: strengthLevel.color }}>{strengthLevel.label}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="label-text">Confirm password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={iconStyle} />
                  <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={`glass-input ${confirmPassword && (reqs.match ? 'success' : 'error')}`} style={{ paddingLeft: '42px', paddingRight: '50px' }} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex', padding: '0' }}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && (
                  <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '12px', color: reqs.match ? '#4ade80' : '#f87171', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {reqs.match ? <><Check size={12} /> Passwords match</> : '✗ Passwords do not match'}
                  </p>
                )}
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Password requirements</p>
                <Req met={reqs.length} text="At least 8 characters" />
                <Req met={reqs.upper} text="One uppercase letter" />
                <Req met={reqs.number} text="One number" />
                <Req met={reqs.special} text="One special character (!@#$...)" />
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#8b5cf6', marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontFamily: 'Inter,sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
                  I agree to the{' '}
                  <Link to="/terms" target="_blank" style={{ color: '#a78bfa', textDecoration: 'underline' }}>Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" target="_blank" style={{ color: '#a78bfa', textDecoration: 'underline' }}>Privacy Policy</Link>.
                  {' '}We never share your data.
                </span>
              </label>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /><span>Creating account...</span></> : <span>Create Account</span>}
              </button>

              <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                Already have an account?{' '}
                <Link to="/signin" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: '600' }}>Sign in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}