import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, Loader2, Check } from 'lucide-react'

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

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [validSession, setValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [redirectCount, setRedirectCount] = useState(3)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidSession(true)
      } else {
        navigate('/forgot-password')
      }
      setCheckingSession(false)
    })
  }, [])

  useEffect(() => {
    if (!success) return
    if (redirectCount === 0) { navigate('/signin'); return }
    const timer = setTimeout(() => setRedirectCount(prev => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [success, redirectCount])

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

  const iconStyle = {
    position: 'absolute', left: '14px', top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(255,255,255,0.25)', pointerEvents: 'none'
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!passwordValid) { setError('Please meet all password requirements'); return }
    if (!reqs.match) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      await supabase.auth.signOut()
      setSuccess(true)
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="page-bg flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <div className="glow-purple" />
        <Loader2 size={32} style={{ color: '#a78bfa', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

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
            <h2 style={{ fontFamily: 'Sora,sans-serif', fontWeight: '700', fontSize: '24px', color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Password updated
            </h2>
            <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '32px', lineHeight: '1.6' }}>
              Your password has been reset successfully. You will be redirected to sign in in {redirectCount} second{redirectCount !== 1 ? 's' : ''}.
            </p>
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden', marginBottom: '24px' }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg,#8b5cf6,#3b82f6)',
                borderRadius: '2px',
                width: `${(redirectCount / 3) * 100}%`,
                transition: 'width 1s linear'
              }} />
            </div>
            <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.25)' }}>
              Redirecting to sign in...
            </p>
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
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', fontFamily: 'Inter,sans-serif' }}>Set your new password</p>
        </div>

        <div className="glass-card" style={{ padding: '40px' }}>
          <h2 style={{ fontFamily: 'Sora,sans-serif', fontWeight: '700', fontSize: '22px', color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Create new password
          </h2>
          <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '28px', lineHeight: '1.6' }}>
            Choose a strong password to keep your account secure.
          </p>

          {error && (
            <div className="alert-error">
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ color: '#f87171', flexShrink: 0 }}>✗</span>
                <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '13px', color: 'rgba(248,113,113,0.9)' }}>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="label-text">New password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={iconStyle} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoFocus
                  className="glass-input"
                  style={{ paddingLeft: '42px', paddingRight: '50px' }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex', padding: '0' }}
                >
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
                  <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '12px', color: strengthLevel.color }}>
                    {strengthLevel.label}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="label-text">Confirm new password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={iconStyle} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className={`glass-input ${confirmPassword && (reqs.match ? 'success' : 'error')}`}
                  style={{ paddingLeft: '42px', paddingRight: '50px' }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex', padding: '0' }}
                >
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
              <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                Password requirements
              </p>
              <Req met={reqs.length} text="At least 8 characters" />
              <Req met={reqs.upper} text="One uppercase letter" />
              <Req met={reqs.number} text="One number" />
              <Req met={reqs.special} text="One special character (!@#$...)" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /><span>Updating password...</span></>
                : <span>Set new password</span>
              }
            </button>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}