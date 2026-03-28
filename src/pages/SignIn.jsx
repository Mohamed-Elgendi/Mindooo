import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase";

// ─── Inline styles — self-contained, no external CSS dependency ───────────────
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
    width: "100%", maxWidth: "440px",
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
    lineHeight: 1.5,
  },
  divider: {
    height: "1px",
    background: "rgba(255,255,255,0.08)",
    margin: "24px 0",
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
    transition: "color 0.15s",
  },
  forgotRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
  },
  forgotLink: {
    fontSize: "12px",
    color: "rgba(139,92,246,0.9)",
    textDecoration: "none",
    fontWeight: 500,
    transition: "color 0.15s",
  },
  checkboxCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    padding: "14px 16px",
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  checkRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    cursor: "pointer",
  },
  checkbox: {
    width: "18px", height: "18px",
    minWidth: "18px",
    borderRadius: "5px",
    border: "1.5px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.05)",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s",
    marginTop: "1px",
  },
  checkboxOn: {
    background: "linear-gradient(135deg,#8b5cf6,#6366f1)",
    border: "1.5px solid rgba(139,92,246,0.8)",
  },
  checkLabel: {
    fontSize: "13px",
    fontWeight: 600,
    color: "rgba(248,248,255,0.85)",
    lineHeight: 1.3,
  },
  checkSub: {
    fontSize: "11px",
    color: "rgba(248,248,255,0.35)",
    marginTop: "1px",
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
  hint: {
    textAlign: "center",
    fontSize: "12px",
    color: "rgba(248,248,255,0.28)",
    lineHeight: 1.6,
    marginTop: "20px",
  },
};

// Google SVG logo
const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.4 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.1-2.7-.4-4z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.3-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.7-2.6-11.3-7H6.1c3.3 6.5 10 11 17.9 11z"/>
    <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.2 4-4 5.3l6.3 5.2C41.5 35.2 44 30 44 24c0-1.3-.1-2.7-.4-4z"/>
  </svg>
);

export default function SignIn() {
  const navigate = useNavigate();
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [remember,    setRemember]    = useState(true);
  const [keepSigned,  setKeepSigned]  = useState(true);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [lastMethod,  setLastMethod]  = useState("");
  const [focusedField, setFocused]    = useState("");

  // Load remembered email
  useEffect(() => {
    const saved = localStorage.getItem("mindoo_email");
    if (saved) setEmail(saved);
    const method = localStorage.getItem("mindoo_last_method");
    if (method) setLastMethod(method);
  }, []);

  async function handleSignIn(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      if (remember) localStorage.setItem("mindoo_email", email);
      else localStorage.removeItem("mindoo_email");
      localStorage.setItem("mindoo_last_method", "email");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Sign in failed. Check your email and password.");
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
      localStorage.setItem("mindoo_last_method", "google");
    } catch (err) {
      setError(err.message || "Google sign in failed.");
      setLoading(false);
    }
  }

  function inputStyle(field) {
    return {
      ...S.input,
      ...(focusedField === field ? S.inputFocus : {}),
      paddingRight: field === "password" ? "44px" : "16px",
    };
  }

  return (
    <>
      {/* Load fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={S.page}>
        <div style={S.glowA} />
        <div style={S.glowB} />

        <div style={S.card}>
          {/* Logo */}
          <span style={S.logo}>Mindoo</span>
          <p style={S.tagline}>From chaos to clarity. Now do more.</p>

          {/* Last sign-in hint */}
          {lastMethod === "google" && (
            <div style={{ ...S.alert, ...S.alertSuccess, textAlign: "center", marginBottom: "20px" }}>
              ✓ You last signed in with Google
            </div>
          )}

          {/* Error */}
          {error && <div style={{ ...S.alert, ...S.alertError }}>{error}</div>}

          {/* Form */}
          <form onSubmit={handleSignIn} noValidate>
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
            <div style={S.forgotRow}>
              <label style={{ ...S.label, margin: 0 }}>Password</label>
              <Link to="/forgot-password" style={S.forgotLink}>Forgot password?</Link>
            </div>
            <div style={S.inputWrap}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused("")}
                style={inputStyle("password")}
                placeholder="Your password"
                autoComplete="current-password"
              />
              <button type="button" style={S.eyeBtn} onClick={() => setShowPass(p => !p)}>
                {showPass ? (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>

            {/* Checkboxes */}
            <div style={S.checkboxCard}>
              <div style={S.checkRow} onClick={() => setRemember(r => !r)}>
                <div style={{ ...S.checkbox, ...(remember ? S.checkboxOn : {}) }}>
                  {remember && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <div>
                  <div style={S.checkLabel}>Remember my email</div>
                  <div style={S.checkSub}>Pre-fills your email next time</div>
                </div>
              </div>
              <div style={S.checkRow} onClick={() => setKeepSigned(k => !k)}>
                <div style={{ ...S.checkbox, ...(keepSigned ? S.checkboxOn : {}) }}>
                  {keepSigned && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <div>
                  <div style={S.checkLabel}>Keep me signed in for 30 days</div>
                  <div style={S.checkSub}>Stay logged in automatically</div>
                </div>
              </div>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              style={{ ...S.btnPrimary, opacity: loading ? 0.6 : 1 }}
              onMouseEnter={e => { if (!loading) e.target.style.opacity = "0.88"; e.target.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.target.style.opacity = loading ? "0.6" : "1"; e.target.style.transform = "translateY(0)"; }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div style={S.orRow}>
            <div style={S.orLine} />
            <span style={S.orText}>or continue with</span>
            <div style={S.orLine} />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            style={{ ...S.googleBtn, opacity: loading ? 0.6 : 1 }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
          >
            <GoogleLogo />
            Continue with Google
          </button>

          {/* Sign up link */}
          <p style={S.bottomText}>
            Do not have an account?{" "}
            <Link to="/signup" style={S.bottomLink}>Sign up free</Link>
          </p>

          {/* Hint */}
          <p style={S.hint}>
            Forgot which email you used? Check your password manager or inbox for a message from Mindoo.
          </p>
        </div>
      </div>
    </>
  );
}
