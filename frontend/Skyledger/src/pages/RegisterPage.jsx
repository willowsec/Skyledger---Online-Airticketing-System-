import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

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
    <div className="flex gap-2 sm:gap-3 my-6">
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
          className={`flex-1 h-12 sm:h-14 rounded-xl border bg-bg text-text-primary text-xl font-semibold text-center outline-none transition-all ${
            digits[i] ? "border-accent ring-1 ring-accent/30" : "border-slate-300 focus:border-accent focus:ring-1 focus:ring-accent/30"
          }`}
        />
      ))}
    </div>
  );
}

// Password strength checker
function PasswordStrength({ password }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["bg-error", "bg-warning", "bg-yellow-500", "bg-success"];
  const textColors = ["text-error", "text-warning", "text-yellow-600", "text-success"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
              i < score ? colors[score - 1] : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {checks.map((c) => (
            <span
              key={c.label}
              className={`text-[11px] font-medium flex items-center gap-1 ${
                c.pass ? "text-success" : "text-slate-400"
              }`}
            >
              <span>{c.pass ? "✓" : "○"}</span> {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span className={`text-[11px] font-bold uppercase tracking-wider ${textColors[score - 1]}`}>
            {labels[score - 1]}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Left decorative panel ─────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div className="hidden lg:flex w-[45%] bg-gradient-hero p-12 flex-col justify-between relative overflow-hidden text-surface">
      {/* Decorative circles */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
      <div className="absolute -top-10 -right-16 w-48 h-48 rounded-full bg-white/5 blur-xl" />

      {/* Logo */}
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm">
          ✈️
        </div>
        <div>
          <div className="text-xl font-bold tracking-tight">SkyLedger</div>
          <div className="text-white/60 text-xs font-medium tracking-wide uppercase mt-0.5">
            Transparent Pricing. Zero Friction.
          </div>
        </div>
      </div>

      {/* Headline */}
      <div className="relative z-10 my-auto py-12">
        <h1 className="text-[42px] font-bold leading-[1.15] mb-4 tracking-tight">
          Your journey<br />
          <span className="text-info italic font-medium tracking-normal">starts here.</span>
        </h1>
        <p className="text-white/70 text-base leading-relaxed max-w-sm">
          Create your free account and book your first flight in under 5 minutes. OTP verified, always secure.
        </p>
      </div>

      {/* Features */}
      <div className="flex flex-col gap-4 relative z-10">
        {[
          ["✅", "Free to register, no credit card needed"],
          ["🛡️", "OTP email verification"],
          ["📱", "Manage bookings on any device"],
          ["🔄", "Cancel with instant refund"],
        ].map(([icon, label]) => (
          <div key={label} className="flex items-center gap-3 text-white/80 text-sm font-medium">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-base backdrop-blur-sm">
              {icon}
            </div>
            {label}
          </div>
        ))}
      </div>
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
    <div className="min-h-screen flex bg-bg font-sans">
      <LeftPanel />

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-20 relative overflow-y-auto">
        <div className="w-full max-w-[420px] bg-surface sm:shadow-soft sm:border border-slate-100 rounded-2xl sm:p-10 my-8 sm:my-0">
          
          {/* Logo visible only on mobile/tablet */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-2xl text-surface">
              ✈️
            </div>
            <div className="text-xl font-bold tracking-tight text-text-primary">SkyLedger</div>
          </div>

          {/* ── Step: Register form ── */}
          {step === "register" && (
            <>
              <div className="mb-8">
                <h2 className="text-[28px] font-bold text-text-primary mb-2 tracking-tight">Create account</h2>
                <div className="text-text-secondary text-body-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="text-accent font-semibold hover:underline decoration-2 underline-offset-2">
                    Sign in &rarr;
                  </Link>
                </div>
              </div>

              {error && <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg text-sm mb-5 font-medium">{error}</div>}

              <form onSubmit={handleRegister}>
                {/* Name + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-label text-text-secondary uppercase tracking-wider mb-1.5">Full name</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40">👤</span>
                      <input
                        type="text"
                        value={form.name}
                        placeholder="Your full name"
                        onChange={update("name")}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-bg text-text-primary text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-slate-400 font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-label text-text-secondary uppercase tracking-wider mb-1.5">Phone</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40">📱</span>
                      <input
                        type="tel"
                        value={form.phone}
                        placeholder="+91 98765 43210"
                        onChange={update("phone")}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-bg text-text-primary text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-slate-400 font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="mb-4">
                  <label className="block text-label text-text-secondary uppercase tracking-wider mb-1.5">Email address</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40">✉️</span>
                    <input
                      type="email"
                      value={form.email}
                      placeholder="you@example.com"
                      onChange={update("email")}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-bg text-text-primary text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-slate-400 font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label className="block text-label text-text-secondary uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40">🔑</span>
                    <input
                      type={showPass ? "text" : "password"}
                      value={form.password}
                      placeholder="Min 8 chars, 1 uppercase..."
                      onChange={update("password")}
                      className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 bg-bg text-text-primary text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-slate-400 font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPass ? "🙈" : "👁️"}
                    </button>
                  </div>
                  <PasswordStrength password={form.password} />
                </div>

                {/* Confirm Password */}
                <div className="mb-8">
                  <label className="block text-label text-text-secondary uppercase tracking-wider mb-1.5">Confirm password</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40">🔑</span>
                    <input
                      type="password"
                      value={confirmPassword}
                      placeholder="Re-enter your password"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-bg text-text-primary text-sm focus:outline-none transition-all placeholder:text-slate-400 font-medium ${
                        confirmPassword && confirmPassword !== form.password
                          ? "border-error focus:border-error focus:ring-1 focus:ring-error"
                          : "border-slate-200 focus:border-accent focus:ring-1 focus:ring-accent"
                      }`}
                      required
                    />
                  </div>
                  {confirmPassword && confirmPassword !== form.password && (
                    <div className="text-xs text-error mt-1.5 font-medium">
                      Passwords do not match
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-accent text-surface font-semibold py-3.5 rounded-xl shadow-soft hover:shadow-hover transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating account..." : "Create account \u2192"}
                </button>
              </form>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">or sign up with</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              <button 
                onClick={handleGoogleSignup} 
                className="w-full flex items-center justify-center gap-3 bg-surface border border-slate-200 hover:bg-slate-50 text-text-primary font-medium py-3 rounded-xl transition-colors shadow-sm"
              >
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                Google
              </button>

              <p className="text-xs text-text-secondary text-center mt-6">
                By creating an account you agree to our Terms of Service.
              </p>
            </>
          )}

          {/* ── Step: OTP verification ── */}
          {step === "otp" && (
            <>
              <div className="inline-flex items-center gap-2 bg-success/10 border border-success/20 text-success px-3 py-1.5 rounded-full text-xs font-semibold mb-6">
                <span>✉️</span> Verification email sent
              </div>
              <h2 className="text-[28px] font-bold text-text-primary mb-2 tracking-tight">Check your inbox</h2>
              <p className="text-text-secondary text-body-base mb-1">
                We sent a 6-digit OTP to <span className="font-semibold text-text-primary">{form.email}</span>
              </p>
              <p className="text-xs text-slate-400 mb-6">
                Check your spam folder if you don't see it within a minute.
              </p>

              {error && <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg text-sm mb-2 font-medium mt-4">{error}</div>}

              <form onSubmit={handleVerifyOTP}>
                <OTPInput value={otp} onChange={setOtp} />
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-primary hover:bg-accent text-surface font-semibold py-3.5 rounded-xl shadow-soft hover:shadow-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify & get started \u2192"}
                </button>
              </form>

              <div className="mt-6 text-sm text-text-secondary font-medium text-center">
                Didn't receive it?{" "}
                <button
                  onClick={handleResendOTP}
                  disabled={resendCountdown > 0}
                  className={`font-semibold ${resendCountdown > 0 ? "text-slate-400 cursor-not-allowed" : "text-accent hover:underline decoration-2 underline-offset-2"}`}
                >
                  {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend OTP"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
