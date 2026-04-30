import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import { registerUser } from "../../services/LoginServices";
import Header from "../../components/Header";
import notify from "../../utils/notify";
import Footer from "../../components/Footer";
import { useTranslation } from 'react-i18next';
import axiosInstance from "../../custom/axios";
import ForgotPasswordModal from "../../components/ForgotPasswordModal";

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8081';

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "bg-gray-200" };
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 2) return { score, label: "Fair", color: "bg-amber-500" };
  if (score <= 3) return { score, label: "Good", color: "bg-blue-500" };
  return { score, label: "Strong", color: "bg-emerald-500" };
};

export default function LoginWave() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 pt-40">
        <AuthCard />
      </div>
      <Footer />
    </>
  );
}

// Auth Card Component
function AuthCard() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, user, getUserRole } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [showInactiveModal, setShowInactiveModal] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [inactiveUserInfo, setInactiveUserInfo] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  useEffect(() => {
    if (user) {
      const userRole = getUserRole();
      const from = location.state?.from?.pathname || "/";

      // Redirect based on role
      if (userRole === 'admin') {
        navigate('/admin', { replace: true });
      } else if (userRole === 'customer_service') {
        navigate('/customer-service', { replace: true });
      } else {
        // For customers, either go to the page they were trying to access or home
        navigate(from, { replace: true });
      }
    }
  }, [user, getUserRole, navigate, location]);
  // Form state
  const [signUpForm, setSignUpForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [signInForm, setSignInForm] = useState({
    email: '',
    password: ''
  });

  // Validation state
  const [signUpErrors, setSignUpErrors] = useState({});
  const [signInErrors, setSignInErrors] = useState({});

  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  // useEffect(() => {
  //   if (user) {
  //     const from = location.state?.from?.pathname || "/";
  //     navigate(from, { replace: true });
  //   }
  // }, [user, navigate, location]);

  // Handle input changes for signup form
  const handleSignUpChange = (e) => {
    const { name, value } = e.target;

    // Format phone number input
    if (name === 'phoneNumber') {
      // Allow digits and + sign (only at the beginning)
      let formattedPhone = value;

      // If starts with +, keep it and only digits after
      if (value.startsWith('+')) {
        const digitsAfterPlus = value.slice(1).replace(/\D/g, '');
        formattedPhone = '+' + digitsAfterPlus.slice(0, 11); // +84 + 9-10 digits
      } else {
        // Remove all non-digit characters
        const digitsOnly = value.replace(/\D/g, '');
        formattedPhone = digitsOnly.slice(0, 10); // 0 + 9 digits
      }

      setSignUpForm(prev => ({
        ...prev,
        [name]: formattedPhone
      }));
    } else {
      setSignUpForm(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user types
    if (signUpErrors[name]) {
      setSignUpErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle input changes for signin form
  const handleSignInChange = (e) => {
    const { name, value } = e.target;

    setSignInForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user types
    if (signInErrors[name]) {
      setSignInErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate signup form
  const validateSignUp = () => {
    const errors = {};

    if (!signUpForm.fullName.trim()) {
      errors.fullName = t('common.validation.full_name_required');
    }

    if (!signUpForm.email.trim()) {
      errors.email = t('common.validation.email_required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpForm.email)) {
      errors.email = t('common.validation.email_invalid');
    }

    if (!signUpForm.phoneNumber.trim()) {
      errors.phoneNumber = t('common.validation.phone_required');
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(signUpForm.phoneNumber)) {
      errors.phoneNumber = t('common.validation.phone_invalid');
    }

    if (!signUpForm.password) {
      errors.password = t('common.validation.password_required');
    } else if (signUpForm.password.length < 6) {
      errors.password = t('common.validation.password_min_length');
    }

    if (!signUpForm.confirmPassword) {
      errors.confirmPassword = t('common.validation.confirm_password_required');
    } else if (signUpForm.password !== signUpForm.confirmPassword) {
      errors.confirmPassword = t('common.validation.passwords_not_match');
    }

    setSignUpErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate signin form
  const validateSignIn = () => {
    const errors = {};

    if (!signInForm.email.trim()) {
      errors.email = t('common.validation.email_required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signInForm.email)) {
      errors.email = t('common.validation.email_invalid');
    }

    if (!signInForm.password) {
      errors.password = t('common.validation.password_required');
    }

    setSignInErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle signup submission
  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!validateSignUp()) {
      return;
    }

    setLoading(true);

    try {
      // Call real register service from LoginServices
      // Backend expects: { fullName, email, phoneNumber, password, confirmPassword }
      const registerData = {
        fullName: signUpForm.fullName,
        email: signUpForm.email,
        phoneNumber: signUpForm.phoneNumber,
        password: signUpForm.password,
        confirmPassword: signUpForm.confirmPassword
      };

      const response = await registerUser(registerData);

      if (response.success) {
        // Hiển thị thông báo thành công
        notify.success(t('common.auth.register_success'));

        // Giữ trạng thái loading thêm một chút để người dùng cảm giác
        // hệ thống đang lưu dữ liệu, sau đó mới chuyển sang màn hình đăng nhập
        setTimeout(() => {
          setIsLogin(true);
          setSignUpForm({
            fullName: '',
            email: '',
            phoneNumber: '',
            password: '',
            confirmPassword: ''
          });
          setLoading(false);
        }, 800);
      } else {
        // Trường hợp backend trả về không success nhưng cũng không throw
        notify.error(t('common.auth.register_failed'));
        setLoading(false);
      }

    } catch (err) {
      // Hiển thị lỗi từ service
      const errorMessage = err.message || t('common.auth.register_failed');
      notify.error(errorMessage);
      setLoading(false);
    }
  };

  // Handle signin submission
  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!validateSignIn()) {
      return;
    }

    setLoading(true);

    try {
      // Call the login function from UserContext
      await login({
        email: signInForm.email,
        password: signInForm.password
      });

      notify.success(t('common.auth.login_success'));
      // Redirect immediately based on role to avoid race with useEffect
      const role = getUserRole();
      if (role === 'admin') {
        navigate('/admin', { replace: true });
        return;
      }
      if (role === 'customer_service') {
        navigate('/customer-service', { replace: true });
        return;
      }
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });

    } catch (err) {
      // Display the error message from the service
      const errorMessage = err.message || t('common.auth.login_failed');
      
      // Check if account is inactive - show large modal in center instead of toast
      if (errorMessage.includes('vô hiệu hóa') || errorMessage.includes('ACCOUNT_INACTIVE') || errorMessage.includes('1110')) {
        // Try to fetch user info from email in form
        try {
          const userResponse = await axiosInstance.get(`/users/email/${signInForm.email}`);
          const userData = userResponse.data.result || userResponse.data;
          if (userData) {
            setInactiveUserInfo({
              email: userData.email || signInForm.email,
              userName: userData.fullName || signInForm.email,
              userPhone: userData.phoneNumber || null,
              userId: userData.id || null
            });
          } else {
            setInactiveUserInfo({
              email: signInForm.email,
              userName: null,
              userPhone: null,
              userId: null
            });
          }
        } catch {
          // If can't fetch user info, use email from form
          setInactiveUserInfo({
            email: signInForm.email,
            userName: null,
            userPhone: null,
            userId: null
          });
        }
        setEmailSent(false);
        setShowInactiveModal(true);
      } else {
        notify.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/oauth2/authorization/google`;
  };

  // Gửi email yêu cầu mở khóa tài khoản
  const handleRequestUnlock = async () => {
    if (!inactiveUserInfo || !inactiveUserInfo.email) {
      notify.error(t('common.auth.email_not_found'));
      return;
    }

    setIsSendingEmail(true);
    try {
      const response = await axiosInstance.post('/auth/request-unlock', {
        email: inactiveUserInfo.email,
        userName: inactiveUserInfo.userName,
        userPhone: inactiveUserInfo.userPhone,
        userId: inactiveUserInfo.userId
      });

      if (response.data && response.data.result && response.data.result.success) {
        setEmailSent(true);
        notify.success(t('common.auth.unlock_email_sent'));
      } else {
        notify.error(response.data?.message || t('common.auth.unlock_email_error'));
      }
    } catch (error) {
      console.error('Error sending unlock request:', error);
      notify.error(error.response?.data?.message || t('common.auth.unlock_request_error'));
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Đóng modal và reset state
  const handleCloseInactiveModal = () => {
    setShowInactiveModal(false);
    setEmailSent(false);
    setInactiveUserInfo(null);
  };

  return (
    <>
      {/* Global loading overlay cho cả đăng nhập và đăng ký */}
      {loading && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-md px-8 py-6 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-gray-700 border-t-transparent rounded-full animate-spin" />
            <div className="text-gray-900 font-semibold">
              Đang xử lý, vui lòng đợi trong giây lát...
            </div>
          </div>
        </div>
      )}

      {/* Inactive Account Modal - Simple and user-friendly */}
      {showInactiveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={handleCloseInactiveModal}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all" onClick={(e) => e.stopPropagation()}>
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-3">
              {t('common.auth.account_locked')}
            </h2>

            {/* Message */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-4">
                {t('common.auth.account_locked_message')}
              </p>
              
              {/* Success message */}
              {emailSent && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-700">
                    {t('common.auth.unlock_request_sent')}
                  </p>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="space-y-3">
              <button
                onClick={handleRequestUnlock}
                disabled={isSendingEmail || emailSent}
                className="w-full py-2.5 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingEmail ? t('common.auth.sending') : emailSent ? t('common.auth.unlock_request_sent_status') : t('common.auth.request_unlock')}
              </button>
              
              <button
                onClick={handleCloseInactiveModal}
                className="w-full py-2.5 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                {t('common.close')}
              </button>
            </div>

            {/* Contact info - subtle */}
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">
                {t('common.auth.need_support')} <span className="text-gray-700 font-medium">0901234567</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl mx-auto animate-[fadeIn_450ms_ease-out]">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left Side - Form */}
          <div className="p-8 lg:p-12 animate-[slideUp_500ms_ease-out]">
            {/* Toggle Tabs */}
            <div className="flex mb-8 bg-gray-50 rounded-xl p-1 border border-gray-100">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${isLogin
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {t('common.login')}
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${!isLogin
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {t('common.register')}
              </button>
            </div>

            {/* Login Form */}
            {isLogin ? (
              <form onSubmit={handleSignIn} className="space-y-5">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('common.welcome_back')}</h2>
                  <p className="text-gray-600">{t('common.sign_in_to_continue')}</p>
                </div>

                <ModernInput
                  name="email"
                  type="email"
                  label={t('common.email')}
                  value={signInForm.email}
                  onChange={handleSignInChange}
                  error={signInErrors.email}
                  icon={<IcEnvelope className="w-5 h-5" />}
                  autoComplete="email"
                />

                <ModernInput
                  name="password"
                  type="password"
                  label={t('common.password')}
                  value={signInForm.password}
                  onChange={handleSignInChange}
                  error={signInErrors.password}
                  icon={<IcLock className="w-5 h-5" />}
                  autoComplete="current-password"
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-400" />
                    <span className="ml-2 text-sm text-gray-600">{t('common.remember_me')}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-violet-700 hover:text-violet-800 font-medium"
                  >
                    {t('common.forgot_password')}
                  </button>
                </div>

                <ModernButton
                  text={loading ? t('common.signing_in') : t('common.sign_in')}
                  type="submit"
                  disabled={loading}
                  variant="primary"
                />

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">{t('common.or_continue_with')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <SocialButton icon={<IcGoogle className="w-5 h-5" />} onClick={handleGoogleLogin} />
                  <SocialButton icon={<IcFacebook className="w-5 h-5" />} />
                  <SocialButton icon={<IcGithub className="w-5 h-5" />} />
                  <SocialButton icon={<IcLinkedin className="w-5 h-5" />} />
                </div>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleSignUp} className="space-y-5">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('common.create_account')}</h2>
                  <p className="text-gray-600">{t('common.join_us_to_start')}</p>
                </div>

                <ModernInput
                  name="fullName"
                  label={t('common.full_name')}
                  value={signUpForm.fullName}
                  onChange={handleSignUpChange}
                  error={signUpErrors.fullName}
                  icon={<IcUser className="w-5 h-5" />}
                  autoComplete="name"
                />

                <ModernInput
                  name="email"
                  type="email"
                  label={t('common.email')}
                  value={signUpForm.email}
                  onChange={handleSignUpChange}
                  error={signUpErrors.email}
                  icon={<IcEnvelope className="w-5 h-5" />}
                  autoComplete="email"
                />

                <ModernInput
                  name="phoneNumber"
                  type="tel"
                  label={t('common.phone_number')}
                  value={signUpForm.phoneNumber}
                  onChange={handleSignUpChange}
                  error={signUpErrors.phoneNumber}
                  icon={<IcUser className="w-5 h-5" />}
                  autoComplete="tel"
                  inputMode="tel"
                />

                <ModernInput
                  name="password"
                  type="password"
                  label={t('common.password')}
                  value={signUpForm.password}
                  onChange={handleSignUpChange}
                  error={signUpErrors.password}
                  icon={<IcLock className="w-5 h-5" />}
                  autoComplete="new-password"
                />

                <ModernInput
                  name="confirmPassword"
                  type="password"
                  label={t('common.confirm_password')}
                  value={signUpForm.confirmPassword}
                  onChange={handleSignUpChange}
                  error={signUpErrors.confirmPassword}
                  icon={<IcShield className="w-5 h-5" />}
                  autoComplete="new-password"
                />
                {signUpForm.password && (
                  <PasswordStrengthIndicator password={signUpForm.password} />
                )}

                <div className="flex items-start">
                  <input type="checkbox" className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-400 mt-1" />
                  <span className="ml-2 text-sm text-gray-600">
                    {t('common.i_agree_to')} <a href="#" className="text-violet-700 hover:text-violet-800 font-medium">{t('common.terms_conditions')}</a>{t('common.and')}<a href="#" className="text-violet-700 hover:text-violet-800 font-medium">{t('common.privacy_policy')}</a>
                  </span>
                </div>

                <ModernButton
                  text={loading ? t('common.creating_account') : t('common.create_account')}
                  type="submit"
                  disabled={loading}
                  variant="primary"
                />

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">{t('common.or_sign_up_with')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <SocialButton icon={<IcGoogle className="w-5 h-5" />} onClick={handleGoogleLogin} />
                  <SocialButton icon={<IcFacebook className="w-5 h-5" />} />
                  <SocialButton icon={<IcGithub className="w-5 h-5" />} />
                  <SocialButton icon={<IcLinkedin className="w-5 h-5" />} />
                </div>
              </form>
            )}
          </div>

          {/* Right Side - Promo Banner (now light theme) */}
          <div className="bg-gray-50 p-8 lg:p-12 text-gray-900 flex flex-col justify-center relative overflow-hidden border-l border-gray-200 animate-[fadeIn_650ms_ease-out]">
            <div className="relative z-10">
              <div className="mb-8">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm ring-1 ring-gray-200">
                  <IcShield className="w-8 h-8 text-violet-600" />
                </div>
                <h3 className="text-4xl font-bold mb-4 text-gray-900">
                  {isLogin ? t('common.new_here') : t('common.already_have_account')}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  {isLogin
                    ? t('common.register_description')
                    : t('common.login_description')}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                <Feature text={t('common.secure_payment')} />
                <Feature text={t('common.fast_free_shipping')} />
                <Feature text={t('common.customer_support_24_7')} />
                <Feature text={t('common.exclusive_member_deals')} />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-200">
                <Stat number="10K+" label={t('common.products')} />
                <Stat number="50K+" label={t('common.customers')} />
                <Stat number="4.9★" label={t('common.rating')} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
      />
    </div>
    </>
  );
}

// Modern Input Component
const ModernInput = ({
  type = "text",
  label,
  name,
  value,
  onChange,
  error,
  icon,
  autoComplete,
  inputMode,
}) => (
  <div className="w-full">
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
        {icon}
      </div>
      <label
        htmlFor={name}
        className={`absolute left-12 transition-all duration-200 pointer-events-none ${
          value
            ? "top-1.5 text-[11px] text-violet-600"
            : "top-1/2 -translate-y-1/2 text-sm text-gray-400"
        }`}
      >
        {label}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        placeholder=" "
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={Boolean(error)}
        className={`w-full pl-12 pr-4 pt-5 pb-2 border rounded-xl bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 transition-all ${error
          ? 'border-red-500 focus:ring-red-500/30'
            : 'border-gray-200 focus:ring-violet-500/25 focus:border-violet-400'
          }`}
      />
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const PasswordStrengthIndicator = ({ password }) => {
  const { score, label, color } = getPasswordStrength(password);
  const filled = Math.max(1, score);
  return (
    <div className="mt-1">
      <div className="flex gap-1">
        {[...Array(4)].map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 flex-1 rounded-full ${idx < filled ? color : "bg-gray-200"}`}
          />
        ))}
      </div>
      <p className="text-[11px] text-gray-500 mt-1">Password strength: {label}</p>
    </div>
  );
};

// Modern Button Component
const ModernButton = ({ text, onClick, type = "button", disabled, variant = "primary" }) => {
  const base =
    "w-full py-3 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ring-1 ring-transparent";
  const primary =
    "bg-violet-600 hover:bg-violet-700 text-white ring-violet-600/10";
  const secondary = "bg-slate-800 text-slate-100 hover:bg-slate-700";
  const classes = `${base} ${variant === "secondary" ? secondary : primary}`;

  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={classes}
    >
      {text}
    </button>
  );
};

// Social Button Component
const SocialButton = ({ icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center justify-center p-3 border border-gray-200 rounded-xl bg-white hover:bg-violet-50 hover:border-violet-300 transition-all text-gray-600 hover:text-violet-700"
  >
    <span className="text-xl">{icon}</span>
  </button>
);

// Feature Component
const Feature = ({ text }) => (
  <div className="flex items-center gap-3">
    <div className="w-2 h-2 bg-violet-600 rounded-full"></div>
    <span className="text-gray-700">{text}</span>
  </div>
);

// Stat Component
const Stat = ({ number, label }) => (
  <div className="text-center">
    <div className="text-2xl font-bold text-gray-900 mb-1">{number}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

// Inline SVGs for lightweight loading
const IcEnvelope = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
  </svg>
);
const IcLock = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
  </svg>
);
const IcUser = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
  </svg>
);
const IcShield = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
  </svg>
);
const IcGoogle = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
  </svg>
);
const IcFacebook = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,2C6.477,2,2,6.477,2,12c0,5.013,3.693,9.153,8.505,9.876V14.65H8.031v-2.65h2.474v-1.748c0-2.433,1.428-3.791,3.642-3.791c1.074,0,2.196,0.194,2.196,0.194v2.39h-1.238c-1.211,0-1.595,0.741-1.595,1.507v1.448h2.721l-0.434,2.65h-2.287v7.226C18.307,21.153,22,17.013,22,12C22,6.477,17.523,2,12,2z"/>
  </svg>
);
const IcGithub = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,2C6.477,2,2,6.477,2,12c0,4.418,2.865,8.166,6.839,9.489c0.5,0.092,0.682-0.217,0.682-0.482c0-0.237-0.008-0.866-0.013-1.7c-2.782,0.604-3.369-1.341-3.369-1.341c-0.454-1.154-1.11-1.462-1.11-1.462c-0.908-0.621,0.069-0.608,0.069-0.608c1.003,0.07,1.531,1.03,1.531,1.03c0.892,1.529,2.341,1.087,2.91,0.831c0.092-0.646,0.35-1.087,0.636-1.337c-2.22-0.253-4.555-1.11-4.555-4.943c0-1.091,0.39-1.984,1.029-2.683c-0.103-0.253-0.446-1.27,0.098-2.647c0,0,0.84-0.269,2.75,1.026A9.564,9.564,0,0112,6.844c0.85,0.004,1.705,0.114,2.504,0.336c1.909-1.295,2.748-1.026,2.748-1.026c0.546,1.377,0.203,2.394,0.1,2.647c0.64,0.699,1.028,1.592,1.028,2.683c0,3.842-2.338,4.687-4.566,4.935c0.359,0.309,0.678,0.919,0.678,1.852c0,1.336-0.012,2.415-0.012,2.743c0,0.267,0.18,0.578,0.688,0.48C19.138,20.161,22,16.416,22,12C22,6.477,17.523,2,12,2z"/>
  </svg>
);
const IcLinkedin = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19,3a2,2 0 0 1 2,2v14a2,2 0 0 1-2,2H5a2,2 0 0 1-2-2V5a2,2 0 0 1 2-2h14m-.5,15.5v-5.3a3.26,3.26 0 0 0-3.26-3.26c-1.85,0-2.67,1-3.13,1.73v-1.48h-3.48v8.31h3.48v-4.63c0-1.22.24-2.42 1.76-2.42,1.5,0 1.52,1.42 1.52,2.5v4.56h3.48M6.88,8.56a2,2 0 0 0 2-2,2,2 0 0 0-2-2,2,2 0 0 0-2,2,2,2 0 0 0 2,2m1.74,9.94v-8.31H5.14v8.31H8.62z"/>
  </svg>
);
// Updated: 2025-10-12T16:06:23.114Z
