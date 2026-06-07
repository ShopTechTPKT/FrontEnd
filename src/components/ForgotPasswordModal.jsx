import { useState } from "react";
import { useTranslation } from "react-i18next";
import axiosInstance from "../custom/axios";
import notify from "../utils/notify";

/* ── SVG Icons ──────────────────────────────────── */
const IcEnvelope = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const IcKey = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);
const IcLock = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const IcShield = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const IcClose = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IcCheck = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1); // 1: email & confirm, 2: OTP, 3: new password
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validateEmail = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = t('forgotPassword.validation.email_required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = t('forgotPassword.validation.email_invalid');
    }
    if (!confirmEmail.trim()) {
      errors.confirmEmail = t('forgotPassword.validation.confirm_email_required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(confirmEmail)) {
      errors.confirmEmail = t('forgotPassword.validation.email_invalid');
    } else if (email.trim() && confirmEmail.trim() && email.toLowerCase() !== confirmEmail.toLowerCase()) {
      errors.confirmEmail = t('forgotPassword.validation.emails_not_match');
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateOTP = () => {
    const errors = {};
    if (!otp.trim()) {
      errors.otp = t('forgotPassword.validation.otp_required');
    } else if (!/^\d{6}$/.test(otp)) {
      errors.otp = t('forgotPassword.validation.otp_invalid');
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = () => {
    const errors = {};
    if (!newPassword) {
      errors.newPassword = t('forgotPassword.validation.password_required');
    } else if (newPassword.length < 6) {
      errors.newPassword = t('forgotPassword.validation.password_min_length');
    }
    if (!confirmPassword) {
      errors.confirmPassword = t('forgotPassword.validation.confirm_password_required');
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = t('forgotPassword.validation.passwords_not_match');
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setLoading(true);
    try {
      const response = await axiosInstance.post(`${API_URL}/api/auth/forgot-password`, { email });
      if (response.data && response.data.result && response.data.result.success) {
        notify.success(t('forgotPassword.otp_sent'));
        setStep(2);
        setErrors({});
      } else {
        notify.error(response.data?.message || t('forgotPassword.error.send_otp_failed'));
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      const errorMessage = error.response?.data?.message || error.message || t('forgotPassword.error.send_otp_failed');
      notify.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!validateOTP()) return;

    setLoading(true);
    try {
      const response = await axiosInstance.post(`${API_URL}/api/auth/verify-otp`, { email, otp });
      if (response.data && response.data.result && response.data.result.success) {
        notify.success(t('forgotPassword.otp_verified'));
        setStep(3);
        setErrors({});
      } else {
        notify.error(response.data?.message || t('forgotPassword.error.otp_invalid'));
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      const errorMessage = error.response?.data?.message || error.message || t('forgotPassword.error.otp_invalid');
      notify.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setLoading(true);
    try {
      const response = await axiosInstance.post(`${API_URL}/api/auth/reset-password`, {
        email,
        otp,
        newPassword
      });
      if (response.data && response.data.result && response.data.result.success) {
        notify.success(t('forgotPassword.reset_success'));
        handleClose();
      } else {
        notify.error(response.data?.message || t('forgotPassword.error.reset_failed'));
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      const errorMessage = error.response?.data?.message || error.message || t('forgotPassword.error.reset_failed');
      notify.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setEmail("");
    setConfirmEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
    onClose();
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setOtp("");
      setErrors({});
    } else if (step === 3) {
      setStep(2);
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[10000] p-4" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('forgotPassword.title')}
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <IcClose className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              {step > s ? (
                <div className="flex items-center justify-center w-10 h-10 rounded-full font-semibold bg-indigo-500 text-white">
                  <IcCheck className="w-4 h-4" />
                </div>
              ) : (
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                  step >= s ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {s}
                </div>
              )}
              {s < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  step > s ? 'bg-indigo-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Enter Email and Confirm */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <IcEnvelope className="w-8 h-8 text-indigo-600" />
              </div>
              <p className="text-gray-600">{t('forgotPassword.step1.description')}</p>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <IcEnvelope className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder={t('forgotPassword.step1.email_placeholder')}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <IcEnvelope className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder={t('forgotPassword.step1.confirm_email_placeholder')}
                value={confirmEmail}
                onChange={(e) => {
                  setConfirmEmail(e.target.value);
                  if (errors.confirmEmail) setErrors({ ...errors, confirmEmail: '' });
                }}
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.confirmEmail
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
            </div>
            {errors.confirmEmail && <p className="text-red-500 text-sm">{errors.confirmEmail}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 active:scale-[0.97] text-white font-semibold rounded-lg transition-all shadow-sm"
            >
              {loading ? t('forgotPassword.sending') : t('forgotPassword.step1.send_otp')}
            </button>
          </form>
        )}

        {/* Step 2: Enter OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <IcKey className="w-8 h-8 text-indigo-600" />
              </div>
              <p className="text-gray-600">{t('forgotPassword.step2.description', { email })}</p>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <IcKey className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder={t('forgotPassword.step2.otp_placeholder')}
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                  if (errors.otp) setErrors({ ...errors, otp: '' });
                }}
                maxLength={6}
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all text-center text-2xl tracking-widest ${
                  errors.otp
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
            </div>
            {errors.otp && <p className="text-red-500 text-sm">{errors.otp}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t('forgotPassword.back')}
              </button>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 active:scale-[0.97] text-white font-semibold rounded-lg transition-all shadow-sm"
              >
                {loading ? t('forgotPassword.verifying') : t('forgotPassword.step2.verify')}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <IcLock className="w-8 h-8 text-indigo-600" />
              </div>
              <p className="text-gray-600">{t('forgotPassword.step3.description')}</p>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <IcLock className="w-4 h-4" />
              </div>
              <input
                type="password"
                placeholder={t('forgotPassword.step3.new_password_placeholder')}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
                }}
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.newPassword
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
            </div>
            {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword}</p>}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <IcShield className="w-4 h-4" />
              </div>
              <input
                type="password"
                placeholder={t('forgotPassword.step3.confirm_password_placeholder')}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                }}
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.confirmPassword
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t('forgotPassword.back')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 active:scale-[0.97] text-white font-semibold rounded-lg transition-all shadow-sm"
              >
                {loading ? t('forgotPassword.resetting') : t('forgotPassword.step3.reset_password')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;

