import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase";

// Password strength checker
function getStrength(p) {
  if (!p) return { score: 0, label: "", color: "" };
  let score = 0;
  if (p.length >= 8)  score++;
  if (p.length >= 12) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  if (score <= 1) return { score, label: "Weak",      color: "#ef4444" };
  if (score <= 2) return { score, label: "Fair",       color: "#f59e0b" };
  if (score <= 3) return { score, label: "Good",       color: "#3b82f6" };
  if (score <= 4) return { score, label: "Strong",     color: "#8b5cf6" };
  return              { score, label: "Very strong", color: "#22c55e" };
}

const S = {
  page: {
    minHeight: "100vh",
    background: "#09090f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', sans-serif",
  },
  glowA: {
    position: "fixed",
    width: "600px", height: "600px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
    top: "-200px", left: "-100px",
    pointerEvents: "none", zIndex: 0,
  },
  glowB: {
    position: "fixed",
    width: "500px", height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
    bottom: "-150px", right: "-100px",
    pointerEvents: "none", zIndex: 0,
  },
  card: {
    position: "relative", zIndex: 1,
    width: "100%", maxWidth: "460px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "24px",
    padding: "40px 36px",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
  },
  logo: {
    fontFamily: "'Sora', sans-serif",
    fontWeight: 800,
    fontSize: "26px",
    letterSpacing: "-0.04em",
    background: "linear-gradient(135deg,#8b5cf6,#6366f1,#3b82f6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    textAlign: "center",
    marginBottom: "6px",
    display: "block",
  },
  tagline: {
    textAlign: "center",
    fontSize: "13px",
    color: "rgba(248,248,255,0.45)",
    marginBottom: "28px",
  },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "rgba(248,248,255,0.6)",
    marginBottom: "6px",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  inputWrap: {
    position: "relative",
    marginBottom: "16px",
  },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "12px",
    padding: "12px 16px",
    color: "#f8f8ff",
    fontSize: "14px",
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
    display: "block",
    boxSizing: "border-box",
  },
  inputFocus: {
    borderColor: "rgba(139,92,246,0.6)",
    boxShadow: "0 0 0 3px rgba(139,92,246,0.12)",
    background: "rgba(255,255,255,0.08)",
  },
  eyeBtn: {
    position: "absolute",
    right: "14px", top: "50%",
    transform: "translateY(-50%)",
    background: "none", border: "none",
    cursor: "pointer",
    color: "rgba(248,248,255,0.35)",
    display: "flex", alignItems: "center",
    padding: "4px",
  },
  btnPrimary: {
    width: "100%",
    background: "linear-gradient(135deg,#8b5cf6,#6366f1,#3b82f6)",
    border: "none",
    borderRadius: "12px",
    padding: "13px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 700,
    fontFamily: "'Inter', sans-serif",
    cursor: "pointer",
    transition: "opacity 0.2s, transform 0.15s",
    letterSpacing: "0.02em",
    marginBottom: "16px",
  },
  orRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  },
  orLine: { flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" },
  orText: { fontSize: "12px", color: "rgba(248,248,255,0.3)", whiteSpace: "nowrap" },
  googleBtn: {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "12px",
    padding: "11px 16px",
    color: "rgba(248,248,255,0.85)",
    fontSize: "13.5px",
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "all 0.2s",
    marginBottom: "24px",
  },
  bottomText: {
    textAlign: "center",
    fontSize: "13px",
    color: "rgba(248,248,255,0.4)",
  },
  bottomLink: {
    color: "#8b5cf6",
    fontWeight: 600,
    textDecoration: "none",
  },
  alert: {
    borderRadius: "10px",
    padding: "11px 14px",
    fontSize: "13px",
    marginBottom: "16px",
    lineHeight: 1.5,
  },
  alertError: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.25)",
    color: "#f87171",
  },
  alertSuccess: {
    background: "rgba(34,197,94,0.1)",
    border: "1px solid rgba(34,197,94,0.25)",
    color: "#4ade80",
  },
  termsText: {
    textAlign: "center",
    fontSize: "11.5px",
    color: "rgba(248,248,255,0.28)",
    lineHeight: 1.6,
    marginTop: "20px",
  },
  termsLink: {
    color: "rgba(139,92,246,0.8)",
    textDecoration: "none",
  },
};

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.4 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.1-2.7-.4-4z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.3-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.7-2.6-11.3-7H6.1c3.3 6.5 10 11 17.9 11z"/>
    <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.2 4-4 5.3l6.3 5.2C41.5 35.2 44 30 44 24c0-1.3-.1-2.7-.4-4z"/>
  </svg>
);

export default function SignUp() {
  const navigate = useNavigate();
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState(false);
  const [focused,   setFocused]   = useState("");

  const strength = getStrength(password);

  async function handleSignUp(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email)       { setError("Please enter your email."); return; }
    if (!password)    { setError("Please create a password."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name.trim() } },
      });
      if (err) throw err;
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (err) throw err;
    } catch (err) {
      setError(err.message || "Google sign up failed.");
      setLoading(false);
    }
  }

  function inputStyle(field) {
    return {
      ...S.input,
      ...(focused === field ? S.inputFocus : {}),
      paddingRight: ["password","confirm"].includes(field) ? "44px" : "16px",
    };
  }

  if (success) {
    return (
      <>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <div style={S.page}>
          <div style={S.glowA} /><div style={S.glowB} />
          <div style={{ ...S.card, textAlign: "center" }}>
            <span style={S.logo}>Mindoo</span>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>✉️</div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "22px", letterSpacing: "-0.03em", color: "#f8f8ff", marginBottom: "10px" }}>
              Check your inbox
            </h2>
            <p style={{ fontSize: "13px", color: "rgba(248,248,255,0.45)", lineHeight: 1.7, marginBottom: "28px" }}>
              We sent a confirmation link to <strong style={{ color: "#f8f8ff" }}>{email}</strong>.<br />
              Click it to activate your account.
            </p>
            <div style={{ ...S.alert, ...S.alertSuccess }}>✓ Account created — awaiting confirmation</div>
            <Link to="/signin" style={{ ...S.btnPrimary, display: "block", textDecoration: "none", textAlign: "center", lineHeight: "1.4" }}>
              Go to Sign In
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={S.page}>
        <div style={S.glowA} />
        <div style={S.glowB} />

        <div style={S.card}>
          <span style={S.logo}>Mindoo</span>
          <p style={S.tagline}>Your cognitive operating system. Free forever.</p>

          {error && <div style={{ ...S.alert, ...S.alertError }}>{error}</div>}

          <form onSubmit={handleSignUp} noValidate>

            {/* Name */}
            <label style={S.label}>Full name</label>
            <div style={S.inputWrap}>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused("")}
                style={inputStyle("name")}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <label style={S.label}>Email</label>
            <div style={S.inputWrap}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused("")}
                style={inputStyle("email")}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <label style={S.label}>Password</label>
            <div style={S.inputWrap}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused("")}
                style={inputStyle("password")}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
              />
              <button type="button" style={S.eyeBtn} onClick={() => setShowPass(p => !p)}>
                {showPass
                  ? <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>

            {/* Strength bar */}
            {password && (
              <div style={{ marginBottom: "16px", marginTop: "-8px" }}>
                <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{
                      flex: 1, height: "3px", borderRadius: "2px",
                      background: i <= strength.score ? strength.color : "rgba(255,255,255,0.1)",
                      transition: "background 0.3s",
                    }}/>
                  ))}
                </div>
                <div style={{ fontSize: "11px", color: strength.color, textAlign: "right" }}>
                  {strength.label}
                </div>
              </div>
            )}

            {/* Confirm password */}
            <label style={S.label}>Confirm password</label>
            <div style={S.inputWrap}>
              <input
                type={showConf ? "text" : "password"}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onFocus={() => setFocused("confirm")}
                onBlur={() => setFocused("")}
                style={{
                  ...inputStyle("confirm"),
                  borderColor: confirm && confirm !== password
                    ? "rgba(239,68,68,0.5)"
                    : confirm && confirm === password
                    ? "rgba(34,197,94,0.5)"
                    : focused === "confirm" ? "rgba(139,92,246,0.6)" : "rgba(255,255,255,0.12)",
                }}
                placeholder="Repeat your password"
                autoComplete="new-password"
              />
              <button type="button" style={S.eyeBtn} onClick={() => setShowConf(p => !p)}>
                {showConf
                  ? <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{ ...S.btnPrimary, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Creating account…" : "Create Free Account"}
            </button>
          </form>

          {/* Or Google */}
          <div style={S.orRow}>
            <div style={S.orLine} />
            <span style={S.orText}>or sign up with</span>
            <div style={S.orLine} />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            style={{ ...S.googleBtn, opacity: loading ? 0.6 : 1 }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          >
            <GoogleLogo />
            Continue with Google
          </button>

          <p style={S.bottomText}>
            Already have an account?{" "}
            <Link to="/signin" style={S.bottomLink}>Sign in</Link>
          </p>

          <p style={S.termsText}>
            By creating an account you agree to our{" "}
            <Link to="/terms" style={S.termsLink}>Terms</Link> and{" "}
            <Link to="/privacy" style={S.termsLink}>Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </>
  );
}
