import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as zod from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { motion, AnimatePresence } from 'framer-motion';
import { loginUser, verify2FA, sendOTP, verifyOTP, resetPassword } from '../store/slices/authSlice';
import { Shield, Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, ArrowRight, Rocket, Loader2, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import OTPInput from '../components/OTPInput';

const loginSchema = zod.object({
  email: zod.string().email('Invalid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
});

const RecoveryProgress = ({ currentStep, steps }) => {
  return (
    <div className="mb-8 flex items-center justify-center">
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isActive = currentStep === stepNum;
        const isCompleted = currentStep > stepNum;
        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center relative">
              <div 
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] transition-all duration-300 shadow-sm
                  ${isCompleted 
                    ? 'bg-emerald-500 text-white shadow-emerald-100' 
                    : isActive 
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/10 shadow-indigo-100 scale-110' 
                      : 'bg-slate-100 text-slate-400 border border-slate-200'}
                `}
              >
                {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : stepNum}
              </div>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-2.5 absolute -bottom-4.5 whitespace-nowrap">
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-[2px] mx-1.5 rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-100'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Login = () => {

  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [requires2FA, setRequires2FA] = useState(false);
  const [otpToken, setOtpToken] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState('email');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showResetPasswords, setShowResetPasswords] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: toFormikValidationSchema(loginSchema),
    onSubmit: async (values) => {
      const resultAction = await dispatch(loginUser(values));
      if (loginUser.fulfilled.match(resultAction)) {
        if (resultAction.payload.data.requires2FA) {
          setRequires2FA(true);
          setUserEmail(values.email);
          return;
        }
        toast.success('Sign in successful!', {
          icon: <Rocket size={20} className="text-indigo-600" />,
          className: 'premium-toast'
        });
        navigate('/dashboard');
      } else if (loginUser.rejected.match(resultAction)) {
        toast.error(resultAction.payload || 'Invalid credentials. Please try again.', {
          className: 'premium-toast'
        });
      }
    },
  });

  const handle2FAVerify = async (e) => {
    e.preventDefault();
    if (otpToken.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    const resultAction = await dispatch(verify2FA({ email: userEmail, token: otpToken }));
    if (verify2FA.fulfilled.match(resultAction)) {
      toast.success('Identity verified!', {
        icon: <Rocket size={20} className="text-indigo-600" />,
        className: 'premium-toast'
      });
      navigate('/dashboard');
    } else {
      toast.error(resultAction.payload || 'Invalid 2FA code');
    }
  };

  const handleSendForgotOTP = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setForgotLoading(true);
    try {
      const resultAction = await dispatch(sendOTP({ email: forgotEmail, purpose: 'password_reset' }));
      if (sendOTP.fulfilled.match(resultAction)) {
        toast.success('Verification OTP sent to your email');
        setForgotStep('otp');
      } else {
        toast.error(resultAction.payload || 'Failed to send OTP. Please check your email.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyForgotOTP = async (otp) => {
    setForgotLoading(true);
    try {
      const resultAction = await dispatch(verifyOTP({ email: forgotEmail, otp, purpose: 'password_reset' }));
      if (verifyOTP.fulfilled.match(resultAction)) {
        toast.success('OTP verified successfully!');
        setForgotStep('reset');
      } else {
        toast.error(resultAction.payload || 'Invalid or expired OTP');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setForgotLoading(true);
    try {
      const resultAction = await dispatch(resetPassword({ email: forgotEmail, password: newPassword }));
      if (resetPassword.fulfilled.match(resultAction)) {
        toast.success('Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
        setForgotStep('success');
      } else {
        toast.error(resultAction.payload || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResendForgotOTP = async () => {
    try {
      const resultAction = await dispatch(sendOTP({ email: forgotEmail, purpose: 'password_reset' }));
      if (sendOTP.fulfilled.match(resultAction)) {
        toast.success('Verification OTP resent successfully');
      } else {
        toast.error(resultAction.payload || 'Failed to resend OTP');
        throw new Error('Failed');
      }
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-12 p-6 relative overflow-hidden bg-slate-50">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="premium-card p-8 md:p-10 bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-[2.5rem] relative overflow-hidden">


          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500 font-medium">Please enter your details to sign in</p>
          </div>

          {!requires2FA ? (
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <AnimatePresence mode='wait'>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    placeholder="name@domain.com"
                    className={`w-full pl-12 pr-4 py-4 bg-slate-100/50 border-2 rounded-2xl focus:outline-none transition-all ${formik.touched.email && formik.errors.email
                      ? 'border-red-300 focus:border-red-500 bg-red-50/10'
                      : 'border-transparent focus:border-indigo-500'
                      }`}
                    {...formik.getFieldProps('email')}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="text-xs text-red-500 font-bold ml-1">{formik.errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-sm font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(formik.values.email || '');
                      setForgotStep('email');
                      setShowForgotModal(false);
                      setOtpCode('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setShowForgotModal(true);
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-4 bg-slate-100/50 border-2 rounded-2xl focus:outline-none transition-all ${formik.touched.password && formik.errors.password
                      ? 'border-red-300 focus:border-red-500 bg-red-50/10'
                      : 'border-transparent focus:border-indigo-500'
                      }`}
                    {...formik.getFieldProps('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-xs text-red-500 font-bold ml-1">{formik.errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600">
                  <Shield size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">2FA Verification</h3>
                  <p className="text-sm text-slate-500 font-medium px-4">
                    Enter the 6-digit code from your Google Authenticator app
                  </p>
                </div>
              </div>

              <form onSubmit={handle2FAVerify} className="space-y-6">
                <div className="space-y-2">
                  <div className="relative group">
                    <input
                      autoFocus
                      type="text"
                      maxLength={6}
                      placeholder="000 000"
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-6 bg-slate-100/50 border-2 border-transparent focus:border-indigo-500 rounded-3xl text-center text-4xl font-black tracking-[0.3em] focus:outline-none transition-all placeholder:text-slate-200"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    type="submit"
                    disabled={loading || otpToken.length !== 6}
                    className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:bg-indigo-300"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <>Verify & Access <ArrowRight size={20} /></>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequires2FA(false)}
                    className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 font-bold hover:underline transition-all">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="mt-8 flex items-center justify-center gap-4 text-slate-400 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
          <span className="text-xs font-bold tracking-widest uppercase">PortalRupee Security</span>
          <div className="w-1 h-1 bg-slate-300 rounded-full" />
          <ArrowRight className="w-4 h-4" />
        </div>
      </motion.div>

      {/* Forgot Password / OTP Verification Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForgotModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
            />

            {/* Content Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] p-8 sm:p-10 z-10 border border-slate-100"
            >
              <button
                onClick={() => setShowForgotModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center text-indigo-600">
                  <Shield size={32} />
                </div>

                <div className="py-2">
                  <RecoveryProgress 
                    currentStep={
                      forgotStep === 'email' ? 1 :
                      forgotStep === 'otp' ? 2 :
                      forgotStep === 'reset' ? 3 : 4
                    } 
                    steps={['Send OTP', 'Verify', 'Reset Password', 'Success']} 
                  />
                </div>


                {forgotStep === 'email' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Account Recovery</h3>
                      <p className="text-slate-500 font-medium text-sm mt-2">
                        Enter your email address to receive a 6-digit verification code.
                      </p>
                    </div>

                    <form onSubmit={handleSendForgotOTP} className="space-y-4 text-left">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                          <input
                            type="email"
                            required
                            placeholder="name@domain.com"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                      >
                        {forgotLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Verification OTP'}
                      </button>
                    </form>
                  </div>
                )}

                {forgotStep === 'otp' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Enter Code</h3>
                      <p className="text-slate-500 font-medium text-sm mt-2">
                        We sent a 6-digit verification code to <strong className="text-slate-700">{forgotEmail}</strong>.
                      </p>
                    </div>

                    <div className="py-2">
                      <OTPInput
                        numInputs={6}
                        value={otpCode}
                        onChange={setOtpCode}
                        onComplete={handleVerifyForgotOTP}
                        onResend={handleResendForgotOTP}
                        isResending={forgotLoading}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setForgotStep('email')}
                      className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Change Email Address
                    </button>
                  </div>
                )}

                {forgotStep === 'reset' && (
                  <div className="space-y-6 text-left">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight text-center">New Password</h3>
                      <p className="text-slate-500 font-medium text-sm mt-2 text-center">
                        Please set your new secure password.
                      </p>
                    </div>

                    <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                          <input
                            type={showResetPasswords ? 'text' : 'password'}
                            required
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Confirm New Password</label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                          <input
                            type={showResetPasswords ? 'text' : 'password'}
                            required
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between px-1">
                        <button
                          type="button"
                          onClick={() => setShowResetPasswords(!showResetPasswords)}
                          className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          {showResetPasswords ? 'Hide Passwords' : 'Show Passwords'}
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                      >
                        {forgotLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
                      </button>
                    </form>
                  </div>
                )}

                {forgotStep === 'success' && (
                  <div className="space-y-6">
                    <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                      <CheckCircle2 size={36} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Password Updated</h3>
                      <p className="text-slate-500 font-medium text-sm mt-2">
                        Your password has been successfully updated!
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
