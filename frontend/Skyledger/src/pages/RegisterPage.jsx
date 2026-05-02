// src/pages/RegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

// Reuse same style objects and components from LoginPage
// (in a real project you'd put S, LeftPanel, OTPInput in shared files)

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
    overflowY: "auto",
  },
  card: { width: "100%", maxWidth: 420 },
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
  error: {
    background: "rgba(220,53,69,0.12)",
    border: "1px solid rgba(220,53,69,0.3)",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#ff8fa3",
    fontSize: 13,
    marginBottom: 16,
  },
};

// Password strength checker
function PasswordStrength({ password }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background:
                i < score ? colors[score - 1] : "rgba(255,255,255,0.1)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {checks.map((c) => (
            <span
              key={c.label}
              style={{
                fontSize: 11,
                color: c.pass ? "#5DCAA5" : "rgba(255,255,255,0.3)",
              }}
            >
              {c.pass ? "✓" : "○"} {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span
            style={{ fontSize: 11, color: colors[score - 1], fontWeight: 600 }}
          >
            {labels[score - 1]}
          </span>
        )}
      </div>
    </div>
  );
}

// OTP Input (same as LoginPage)
function OTPInput({ value, onChange }) {
  const digits = value.split("");
  const refs = [];

  return (
    <div style={{ display: "flex", gap: 10, margin: "20px 0" }}>
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          ref={(el) => (refs[i] = el)}
          type="text"
          inputMode="numeric"
          value={digits[i] || ""}
          maxLength={1}
          onChange={(e) => {
            if (!/^\d*$/.test(e.target.value)) return;
            const next = [...digits];
            next[i] = e.target.value.slice(-1);
            onChange(next.join(""));
            if (e.target.value && i < 5) refs[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i] && i > 0)
              refs[i - 1]?.focus();
          }}
          style={{
            flex: 1,
            height: 52,
            borderRadius: 10,
            border: `1px solid ${digits[i] ? "#185FA5" : "rgba(255,255,255,0.12)"}`,
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            fontSize: 22,
            fontWeight: 600,
            textAlign: "center",
            outline: "none",
            fontFamily: "'DM Sans', sans-serif",
          }}
        />
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("register"); // 'register' | 'otp'
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const update = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));
  const focus = (e) => {
    e.target.style.borderColor = "#185FA5";
  };
  const blur = (e) => {
    e.target.style.borderColor = "rgba(255,255,255,0.1)";
  };

  const startResendTimer = () => {
    setResendCountdown(60);
    const t = setInterval(
      () =>
        setResendCountdown((c) => {
          if (c <= 1) {
            clearInterval(t);
            return 0;
          }
          return c - 1;
        }),
      1000,
    );
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Full name is required";
    if (!form.email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Enter a valid email address";
    if (!form.phone.trim()) return "Phone number is required";
    if (!/^\+?[\d\s-]{10,}$/.test(form.phone))
      return "Enter a valid phone number";
    if (form.password.length < 8)
      return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(form.password))
      return "Password needs at least 1 uppercase letter";
    if (!/[0-9]/.test(form.password)) return "Password needs at least 1 number";
    if (!/[^A-Za-z0-9]/.test(form.password))
      return "Password needs at least 1 special character";
    if (form.password !== confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) return setError(validationError);
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      setUserId(data.userId);
      setStep("otp");
      startResendTimer();
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return setError("Enter the complete 6-digit OTP");
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/verify-otp", { userId, otp });
      login(data.accessToken, data.user);
      navigate("/", { replace: true });
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
      startResendTimer();
    } catch {
      setError("Failed to resend OTP");
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <div style={S.page}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* Left panel */}
      <div style={S.left}>
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

        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.2,
              marginBottom: 14,
            }}
          >
            Your journey
            <br />
            <span style={{ color: "#60C4F8", fontStyle: "italic" }}>
              starts here.
            </span>
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 14,
              lineHeight: 1.65,
            }}
          >
            Create your free account and book your first flight in under 5
            minutes. OTP verified, always secure.
          </div>
        </div>

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
            ["✅", "Free to register, no credit card needed"],
            ["🛡️", "OTP email verification"],
            ["📱", "Manage bookings on any device"],
            ["🔄", "Cancel with instant refund"],
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
                  fontSize: 14,
                }}
              >
                {icon}
              </div>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={S.right}>
        <div style={S.card}>
          {/* ── Step: Register form ── */}
          {step === "register" && (
            <>
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 600,
                    color: "#fff",
                    marginBottom: 6,
                  }}
                >
                  Create account
                </div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    style={{
                      color: "#60C4F8",
                      textDecoration: "none",
                      fontWeight: 500,
                    }}
                  >
                    Sign in →
                  </Link>
                </div>
              </div>

              {error && <div style={S.error}>{error}</div>}

              <form onSubmit={handleRegister}>
                {/* Name + Phone */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <label style={S.label}>Full name</label>
                    <div style={S.inputWrap}>
                      <span style={S.icon}>👤</span>
                      <input
                        type="text"
                        value={form.name}
                        placeholder="Your full name"
                        onChange={update("name")}
                        onFocus={focus}
                        onBlur={blur}
                        style={S.input}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label style={S.label}>Phone</label>
                    <div style={S.inputWrap}>
                      <span style={S.icon}>📱</span>
                      <input
                        type="tel"
                        value={form.phone}
                        placeholder="+91 98765 43210"
                        onChange={update("phone")}
                        onFocus={focus}
                        onBlur={blur}
                        style={S.input}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div style={{ marginBottom: 16 }}>
                  <label style={S.label}>Email address</label>
                  <div style={S.inputWrap}>
                    <span style={S.icon}>✉</span>
                    <input
                      type="email"
                      value={form.email}
                      placeholder="you@example.com"
                      onChange={update("email")}
                      onFocus={focus}
                      onBlur={blur}
                      style={S.input}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: 16 }}>
                  <label style={S.label}>Password</label>
                  <div style={S.inputWrap}>
                    <span style={S.icon}>🔑</span>
                    <input
                      type={showPass ? "text" : "password"}
                      value={form.password}
                      placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special"
                      onChange={update("password")}
                      onFocus={focus}
                      onBlur={blur}
                      style={S.input}
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
                  <PasswordStrength password={form.password} />
                </div>

                {/* Confirm Password */}
                <div style={{ marginBottom: 20 }}>
                  <label style={S.label}>Confirm password</label>
                  <div style={S.inputWrap}>
                    <span style={S.icon}>🔑</span>
                    <input
                      type="password"
                      value={confirmPassword}
                      placeholder="Re-enter your password"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={focus}
                      onBlur={(e) => {
                        e.target.style.borderColor =
                          confirmPassword && confirmPassword !== form.password
                            ? "#ef4444"
                            : "rgba(255,255,255,0.1)";
                      }}
                      style={{
                        ...S.input,
                        borderColor:
                          confirmPassword && confirmPassword !== form.password
                            ? "#ef4444"
                            : "rgba(255,255,255,0.1)",
                      }}
                      required
                    />
                  </div>
                  {confirmPassword && confirmPassword !== form.password && (
                    <div
                      style={{ fontSize: 12, color: "#ff8fa3", marginTop: 4 }}
                    >
                      Passwords do not match
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "Creating account…" : "Create account →"}
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
                or sign up with
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "rgba(255,255,255,0.08)",
                  }}
                />
              </div>

              <button
                onClick={handleGoogleSignup}
                style={{
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
                }}
              >
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
                Sign up with Google
              </button>

              <p
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.25)",
                  textAlign: "center",
                  marginTop: 16,
                }}
              >
                By creating an account you agree to our Terms of Service.
              </p>
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
                ✉ Verification email sent
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: "#fff",
                  marginBottom: 6,
                }}
              >
                Check your inbox
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 14,
                  marginBottom: 4,
                }}
              >
                We sent a 6-digit OTP to{" "}
                <span style={{ color: "#fff" }}>{form.email}</span>
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                Check your spam folder if you don't see it within a minute.
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
                  {loading ? "Verifying…" : "Verify & get started →"}
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
                  setStep("register");
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
                ← Back to registration
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
