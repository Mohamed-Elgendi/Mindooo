import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";

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
    width: "100%", maxWidth: "420px",
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
    fontSize: "24px",
    letterSpacing: "-0.04em",
    background: "linear-gradient(135deg,#8b5cf6,#6366f1,#3b82f6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    textAlign: "center",
    display: "block",
    marginBottom: "24px",
  },
  icon: {
    width: "56px", height: "56px",
    borderRadius: "16px",
    background: "rgba(139,92,246,0.12)",
    border: "1px solid rgba(139,92,246,0.25)",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 20px",
    fontSize: "24px",
  },
  title: {
    fontFamily: "'Sora', sans-serif",
    fontWeight: 800,
    fontSize: "22px",
    letterSpacing: "-0.03em",
    color: "#f8f8ff",
    textAlign: "center",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "13px",
    color: "rgba(248,248,255,0.45)",
    textAlign: "center",
    lineHeight: 1.65,
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
    transition: "border-color 0.2s, box-shadow 0.2s",
    display: "block",
    boxSizing: "border-box",
    marginBottom: "20px",
  },
  inputFocus: {
    borderColor: "rgba(139,92,246,0.6)",
    boxShadow: "0 0 0 3px rgba(139,92,246,0.12)",
    background: "rgba(255,255,255,0.08)",
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
    marginBottom: "20px",
  },
  backLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontSize: "13px",
    color: "rgba(248,248,255,0.4)",
    textDecoration: "none",
    transition: "color 0.15s",
  },
  alert: {
    borderRadius: "10px",
    padding: "12px 14px",
    fontSize: "13px",
    marginBottom: "20px",
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
};

export default function ForgotPassword() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");
  const [focused, setFocused] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email) { setError("Please enter your email address."); return; }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) throw err;
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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

          <div style={S.icon}>🔑</div>
          <h1 style={S.title}>{sent ? "Check your inbox" : "Reset your password"}</h1>
          <p style={S.subtitle}>
            {sent
              ? `We sent a reset link to ${email}. Check your inbox — it expires in 1 hour.`
              : "Enter your email and we'll send you a link to reset your password."}
          </p>

          {error && <div style={{ ...S.alert, ...S.alertError }}>{error}</div>}

          {!sent ? (
            <form onSubmit={handleSubmit} noValidate>
              <label style={S.label}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{ ...S.input, ...(focused ? S.inputFocus : {}) }}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <button
                type="submit"
                disabled={loading}
                style={{ ...S.btnPrimary, opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
            </form>
          ) : (
            <div style={{ ...S.alert, ...S.alertSuccess, textAlign: "center", marginBottom: "24px" }}>
              ✓ Reset link sent to {email}
            </div>
          )}

          <Link to="/signin" style={S.backLink}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to Sign In
          </Link>
        </div>
      </div>
    </>
  );
}
