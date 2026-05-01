import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../custom/axios";
import { UserContext } from "../../context/UserContext";
import { useTranslation } from "react-i18next";

// ── Inline SVG icons (no emoji) ───────────────────────────────────────────────
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" />
  </svg>
);
const IconTruck = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);
const IconSupport = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const IconEmail = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 7l10 7 10-7" />
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 12S5.5 6 12 6s9.5 6 9.5 6-3 6-9.5 6S2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.5" />
  </svg>
);
const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const FEATURES = [
  { icon: <IconShield />, title: "Bảo mật cao", desc: "Dữ liệu được mã hóa SSL 256-bit" },
  { icon: <IconTruck />, title: "Giao hàng nhanh", desc: "Miễn phí vận chuyển đơn từ 500K" },
  { icon: <IconSupport />, title: "Hỗ trợ 24/7", desc: "Đội ngũ tư vấn luôn sẵn sàng" },
  { icon: <IconStar />, title: "Hàng chính hãng", desc: "100% sản phẩm có bảo hành hãng" },
];

const LoginPage = () => {
  const { t } = useTranslation();
  const { loginContext } = useContext(UserContext);
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Vui lòng nhập email và mật khẩu."); return; }
    setLoading(true); setError("");
    try {
      const res = await axiosInstance.post("/api/getUserByEmailAndPassword", { email, password });
      const user = res.data.DT;
      if (user) { loginContext(user); navigate("/home"); }
      else { setError("Email hoặc mật khẩu không chính xác."); }
    } catch {
      setError("Đã xảy ra lỗi, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    // Registration logic placeholder
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* ── Left Brand Panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative overflow-hidden flex-col justify-between p-12 bg-gradient-to-br from-violet-700 via-violet-600 to-purple-700">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-purple-900/30 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.03] rounded-full" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 7H4C2.9 7 2 7.9 2 9v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <span className="text-white text-xl font-bold tracking-tight">ShopPC</span>
          </div>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Chào mừng đến<br />
              <span className="text-violet-200">ShopPC Premium</span>
            </h1>
            <p className="mt-3 text-violet-200 text-base leading-relaxed max-w-xs">
              Trải nghiệm mua sắm công nghệ đỉnh cao — hàng chính hãng, giá tốt nhất thị trường.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {FEATURES.map((f, i) => (
              <li key={i} className="flex items-center gap-3.5">
                <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-white/15 flex items-center justify-center text-violet-100 backdrop-blur-sm">
                  {f.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-violet-300 text-xs">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10">
          <p className="text-violet-300 text-xs">© 2025 ShopPC — Công nghệ đến tay bạn</p>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8">
            {/* Tab switch */}
            <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
              <button
                onClick={() => { setIsSignUp(false); setError(""); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  !isSignUp
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t("cart.sign_in") || "Đăng nhập"}
              </button>
              <button
                onClick={() => { setIsSignUp(true); setError(""); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  isSignUp
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t("common.sign_up") || "Đăng ký"}
              </button>
            </div>

            {/* Heading */}
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900">
                {isSignUp ? "Tạo tài khoản mới" : "Đăng nhập tài khoản"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {isSignUp
                  ? "Đăng ký để trải nghiệm mua sắm premium"
                  : "Chào mừng trở lại! Vui lòng đăng nhập."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
              {isSignUp && (
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("customer.name") || "Họ và tên"}</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("common.email") || "Email"}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><IconEmail /></span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("common.password") || "Mật khẩu"}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><IconLock /></span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              {!isSignUp && (
                <div className="flex justify-end">
                  <button type="button" className="text-xs text-violet-600 hover:text-violet-800 font-medium transition-colors">
                    {t("common.forgot_your_password") || "Quên mật khẩu?"}
                  </button>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2.5">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm rounded-xl shadow-md shadow-violet-300/40 hover:shadow-violet-400/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isSignUp ? (
                  t("common.sign_up") || "Đăng ký"
                ) : (
                  t("cart.sign_in") || "Đăng nhập"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">hoặc</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google sign-in */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-sm transition-all duration-200"
            >
              <svg viewBox="0 0 48 48" className="w-5 h-5">
                <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 29.9 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
                <path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z"/>
                <path fill="#FBBC05" d="M24 46c5.8 0 10.8-1.9 14.8-5.2l-6.8-5.6C29.9 36.5 27.1 37 24 37c-5.8 0-10.7-3.1-13.2-7.7l-7 5.4C7.8 41.8 15.3 46 24 46z"/>
                <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-1.1 3.1-3.2 5.6-6 7.2l6.8 5.6C40.8 37.5 44.5 31.3 44.5 24c0-1.3-.2-2.7-.5-4z"/>
              </svg>
              Tiếp tục với Google
            </button>

            {/* Switch mode hint */}
            <p className="text-center text-xs text-gray-500 mt-5">
              {isSignUp ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
              <button
                type="button"
                onClick={() => { setIsSignUp((v) => !v); setError(""); }}
                className="text-violet-600 font-semibold hover:underline"
              >
                {isSignUp ? "Đăng nhập ngay" : "Đăng ký miễn phí"}
              </button>
            </p>
          </div>

          {/* Mobile-only brand note */}
          <p className="text-center text-xs text-gray-400 mt-6 lg:hidden">
            © 2025 ShopPC — Công nghệ đến tay bạn
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
