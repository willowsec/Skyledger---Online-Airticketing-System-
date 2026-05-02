// src/pages/LoginPage.jsx
import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

// ── Shared styles ─────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh",
    display: "flex",
    background: "#0A1628",
    fontFamily: "'DM Sans', sans-serif",
  },
  left: {
    width: "42%",
    minHeight: "100vh",
    background:
      "linear-gradient(160deg, #0C447C 0%, #185FA5 50%, #0F3D6E 100%)",
    padding: "48px 44px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
  },
  right: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 56px",
  },
  card: { width: "100%", maxWidth: 400 },
  label: {
    display: "block",
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  inputWrap: { position: "relative" },
  input: {
    width: "100%",
    padding: "11px 14px 11px 42px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    color: "#fff",
    fontSize: 14,
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  icon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 15,
    opacity: 0.35,
    pointerEvents: "none",
  },
  btn: {
    width: "100%",
    padding: "12px 0",
    background: "linear-gradient(135deg, #185FA5, #0C447C)",
    border: "none",
    borderRadius: 10,
    color: "#fff",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    marginTop: 8,
    boxShadow: "0 4px 16px rgba(24,95,165,0.35)",
  },
  btnSecondary: {
    width: "100%",
    padding: "11px 0",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    color: "rgba(255,255,255,0.7)",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  error: {
    background: "rgba(220,53,69,0.12)",
    border: "1px solid rgba(220,53,69,0.3)",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#ff8fa3",
    fontSize: 13,
    marginBottom: 16,
  },
  success: {
    background: "rgba(29,158,117,0.12)",
    border: "1px solid rgba(29,158,117,0.3)",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#5DCAA5",
    fontSize: 13,
    marginBottom: 16,
  },
};

// ── OTP Input component ───────────────────────────────────────────────────────
function OTPInput({ value, onChange }) {
  const refs = useRef([]);
  const digits = value.split("");

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits];
    next[i] = val.slice(-1);
    onChange(next.join(""));
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6));
    refs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div style={{ display: "flex", gap: 10, margin: "20px 0" }}>
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          value={digits[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          maxLength={1}
          style={{
            flex: 1,
            height: 52,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            fontSize: 22,
            fontWeight: 600,
            textAlign: "center",
            outline: "none",
            fontFamily: "'DM Sans', sans-serif",
            borderColor: digits[i] ? "#185FA5" : "rgba(255,255,255,0.12)",
          }}
        />
      ))}
    </div>
  );
}

// ── Left decorative panel ─────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div style={S.left}>
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          bottom: -80,
          left: -80,
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -60,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
        }}
      />

      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}
        >
          ✈
        </div>
        <div>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 600 }}>
            OATS Air
          </div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>
            Online Air Ticketing System
          </div>
        </div>
      </div>

      {/* Headline */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.2,
            marginBottom: 14,
          }}
        >
          Fly anywhere,
          <br />
          <span style={{ color: "#60C4F8", fontStyle: "italic" }}>
            seamlessly.
          </span>
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.55)",
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          Real-time seat selection, instant PDF e-tickets, and secure Razorpay
          payments.
        </div>
      </div>

      {/* Features */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          position: "relative",
          zIndex: 1,
        }}
      >
        {[
          ["🔒", "JWT + bcrypt secured"],
          ["💺", "Interactive seat map"],
          ["📄", "Instant PDF e-ticket"],
          ["💳", "UPI / Card / Net Banking"],
        ].map(([icon, label]) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "rgba(255,255,255,0.65)",
              fontSize: 13,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
              }}
            >
              {icon}
            </div>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── LoginPage component ───────────────────────────────────────────────────────
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [step, setStep] = useState("login"); // 'login' | 'otp' | 'forgot'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const startResendTimer = () => {
    setResendCountdown(60);
    const t = setInterval(() => {
      setResendCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  // ── Submit login ───────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError("Please fill in all fields");
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.accessToken, data.user);
      navigate(data.user.role === "admin" ? "/admin" : from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password ────────────────────────────────────────────────────────
  const handleForgotRequest = async (e) => {
    e.preventDefault();
    if (!email) return setError("Enter your email address first");
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setUserId(data.userId);
      setStep("otp");
      setMessage("OTP sent to your email");
      startResendTimer();
    } catch (err) {
      setError(err.response?.data?.message || "Email not found");
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP (for forgot password) ──────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return setError("Enter the complete 6-digit OTP");
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/verify-otp", { userId, otp });
      login(data.accessToken, data.user);
      navigate(data.user.role === "admin" ? "/admin" : from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;
    try {
      await api.post("/auth/resend-otp", { userId });
      setMessage("New OTP sent!");
      startResendTimer();
    } catch {
      setError("Failed to resend OTP");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const inputFocus = (e) => {
    e.target.style.borderColor = "#185FA5";
  };
  const inputBlur = (e) => {
    e.target.style.borderColor = "rgba(255,255,255,0.1)";
  };

  return (
    <div style={S.page}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <LeftPanel />

      <div style={S.right}>
        <div style={S.card}>
          {/* ── Step: Login form ── */}
          {step === "login" && (
            <>
              <div style={{ marginBottom: 28 }}>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 600,
                    color: "#fff",
                    marginBottom: 6,
                  }}
                >
                  Welcome back
                </div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    style={{
                      color: "#60C4F8",
                      textDecoration: "none",
                      fontWeight: 500,
                    }}
                  >
                    Sign up free →
                  </Link>
                </div>
              </div>

              {error && <div style={S.error}>{error}</div>}
              {message && <div style={S.success}>{message}</div>}

              <form onSubmit={handleLogin}>
                {/* Email */}
                <div style={{ marginBottom: 16 }}>
                  <label style={S.label}>Email address</label>
                  <div style={S.inputWrap}>
                    <span style={S.icon}>✉</span>
                    <input
                      type="email"
                      value={email}
                      placeholder="you@example.com"
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                      style={S.input}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: 8 }}>
                  <label style={S.label}>Password</label>
                  <div style={S.inputWrap}>
                    <span style={S.icon}>🔑</span>
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      placeholder="••••••••"
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                      style={S.input}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "rgba(255,255,255,0.35)",
                        cursor: "pointer",
                        fontSize: 16,
                      }}
                    >
                      {showPass ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                {/* Forgot password */}
                <div style={{ textAlign: "right", marginBottom: 20 }}>
                  <button
                    type="button"
                    onClick={() => setStep("forgot")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#60C4F8",
                      fontSize: 13,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "Signing in…" : "Sign in →"}
                </button>
              </form>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  margin: "16px 0",
                  color: "rgba(255,255,255,0.2)",
                  fontSize: 12,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "rgba(255,255,255,0.08)",
                  }}
                />
                or continue with
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "rgba(255,255,255,0.08)",
                  }}
                />
              </div>

              <button onClick={handleGoogleLogin} style={S.btnSecondary}>
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                Continue with Google
              </button>
            </>
          )}

          {/* ── Step: Forgot password ── */}
          {step === "forgot" && (
            <>
              <button
                onClick={() => {
                  setStep("login");
                  setError("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                  fontSize: 13,
                  marginBottom: 24,
                  padding: 0,
                }}
              >
                ← Back to login
              </button>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: "#fff",
                  marginBottom: 6,
                }}
              >
                Reset password
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 14,
                  marginBottom: 24,
                }}
              >
                Enter your email and we'll send an OTP to reset your password.
              </div>
              {error && <div style={S.error}>{error}</div>}
              <form onSubmit={handleForgotRequest}>
                <div style={{ marginBottom: 20 }}>
                  <label style={S.label}>Email address</label>
                  <div style={S.inputWrap}>
                    <span style={S.icon}>✉</span>
                    <input
                      type="email"
                      value={email}
                      placeholder="you@example.com"
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                      style={S.input}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "Sending OTP…" : "Send OTP →"}
                </button>
              </form>
            </>
          )}

          {/* ── Step: OTP verification ── */}
          {step === "otp" && (
            <>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(29,158,117,0.12)",
                  border: "1px solid rgba(29,158,117,0.3)",
                  borderRadius: 20,
                  padding: "4px 12px",
                  color: "#5DCAA5",
                  fontSize: 12,
                  marginBottom: 16,
                }}
              >
                ✉ OTP sent to {email}
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: "#fff",
                  marginBottom: 6,
                }}
              >
                Verify your email
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 14,
                  marginBottom: 4,
                }}
              >
                Enter the 6-digit code from your inbox
              </div>
              {error && <div style={S.error}>{error}</div>}
              <form onSubmit={handleVerifyOTP}>
                <OTPInput value={otp} onChange={setOtp} />
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  style={{
                    ...S.btn,
                    opacity: loading || otp.length !== 6 ? 0.5 : 1,
                  }}
                >
                  {loading ? "Verifying…" : "Verify & continue →"}
                </button>
              </form>
              <div
                style={{
                  marginTop: 14,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                Didn't receive it?{" "}
                <button
                  onClick={handleResendOTP}
                  disabled={resendCountdown > 0}
                  style={{
                    background: "none",
                    border: "none",
                    color:
                      resendCountdown > 0
                        ? "rgba(255,255,255,0.25)"
                        : "#60C4F8",
                    cursor: resendCountdown > 0 ? "default" : "pointer",
                    fontSize: 13,
                    padding: 0,
                  }}
                >
                  {resendCountdown > 0
                    ? `Resend in ${resendCountdown}s`
                    : "Resend OTP"}
                </button>
              </div>
              <button
                onClick={() => {
                  setStep("login");
                  setOtp("");
                  setError("");
                }}
                style={{
                  display: "block",
                  marginTop: 10,
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.35)",
                  cursor: "pointer",
                  fontSize: 13,
                  padding: 0,
                }}
              >
                ← Back to login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
