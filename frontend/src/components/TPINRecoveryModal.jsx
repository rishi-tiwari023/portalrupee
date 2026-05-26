import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, X, Loader2, CheckCircle2, Key } from 'lucide-react';
import { toast } from 'react-toastify';
import { sendOTP, verifyOTP, resetTPIN, updateUser } from '../store/slices/authSlice';
import OTPInput from './OTPInput';
import TPINInput from './TPINInput';

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
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-sm
                  ${isCompleted 
                    ? 'bg-emerald-500 text-white shadow-emerald-100' 
                    : isActive 
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/10 shadow-indigo-100 scale-110' 
                      : 'bg-slate-100 text-slate-400 border border-slate-200'}
                `}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2 absolute -bottom-5 whitespace-nowrap">
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-[2px] mx-2 rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-100'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const TPINRecoveryModal = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [forgotStep, setForgotStep] = useState('email'); // 'email', 'otp', 'reset', 'success'
  const [forgotLoading, setForgotLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newTpin, setNewTpin] = useState('');
  const [confirmTpin, setConfirmTpin] = useState('');
  const [tpinError, setTpinError] = useState('');

  if (!isOpen) return null;

  const email = user?.email;

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('No email address associated with this account');
      return;
    }

    setForgotLoading(true);
    try {
      const resultAction = await dispatch(sendOTP({ email, purpose: 'tpin_reset' }));
      if (sendOTP.fulfilled.match(resultAction)) {
        toast.success('Verification OTP sent to your email');
        setForgotStep('otp');
      } else {
        toast.error(resultAction.payload || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    setForgotLoading(true);
    try {
      const resultAction = await dispatch(verifyOTP({ email, otp, purpose: 'tpin_reset' }));
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

  const handleResendOTP = async () => {
    try {
      const resultAction = await dispatch(sendOTP({ email, purpose: 'tpin_reset' }));
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

  const handleResetTPIN = async (e) => {
    e.preventDefault();
    if (newTpin.length !== 6 || confirmTpin.length !== 6) {
      setTpinError('TPIN must be exactly 6 digits');
      return;
    }
    if (newTpin !== confirmTpin) {
      setTpinError('TPINs do not match');
      return;
    }

    setForgotLoading(true);
    setTpinError('');
    try {
      const resultAction = await dispatch(resetTPIN(newTpin));
      if (resetTPIN.fulfilled.match(resultAction)) {
        toast.success('TPIN reset successfully!');
        dispatch(updateUser({ tpinSet: true }));
        setForgotStep('success');
      } else {
        setTpinError(resultAction.payload || 'Failed to reset TPIN. Please try again.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setForgotLoading(false);
    }
  };

  const getStepNumber = () => {
    if (forgotStep === 'email') return 1;
    if (forgotStep === 'otp') return 2;
    if (forgotStep === 'reset') return 3;
    return 4;
  };

  const stepsList = ['Send OTP', 'Verify', 'Reset TPIN', 'Success'];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
      />

      {/* Content Container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] p-8 sm:p-10 z-10 border border-slate-100"
      >
        {/* Close Button */}
        {forgotStep !== 'success' && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center text-indigo-600">
            <Key size={32} />
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Reset Transaction PIN</h3>
            <p className="text-slate-500 font-medium text-sm mt-2">
              Follow the steps to securely recover and reset your TPIN.
            </p>
          </div>

          <div className="py-2">
            <RecoveryProgress currentStep={getStepNumber()} steps={stepsList} />
          </div>

          <AnimatePresence mode="wait">
            {forgotStep === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <form onSubmit={handleSendOTP} className="space-y-4 text-left">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Associated Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        disabled
                        value={email || ''}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 text-slate-500 rounded-2xl outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold ml-1">
                      We will send a 6-digit OTP code to this verified email address.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    {forgotLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Verification OTP'}
                  </button>
                </form>
              </motion.div>
            )}

            {forgotStep === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="text-left space-y-4">
                  <p className="text-slate-500 font-medium text-sm text-center">
                    Enter the code sent to your email address.
                  </p>
                  
                  <div className="py-2">
                    <OTPInput
                      numInputs={6}
                      value={otpCode}
                      onChange={setOtpCode}
                      onComplete={handleVerifyOTP}
                      onResend={handleResendOTP}
                      isResending={forgotLoading}
                    />
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setForgotStep('email')}
                      className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Back to Send OTP
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {forgotStep === 'reset' && (
              <motion.div
                key="reset"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <form onSubmit={handleResetTPIN} className="space-y-6 text-left">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1 text-center block">Enter New 6-digit TPIN</label>
                    <TPINInput
                      length={6}
                      value={newTpin}
                      onChange={(val) => { setNewTpin(val); setTpinError(''); }}
                      onEnter={() => {}}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1 text-center block">Confirm New 6-digit TPIN</label>
                    <TPINInput
                      length={6}
                      value={confirmTpin}
                      onChange={(val) => { setConfirmTpin(val); setTpinError(''); }}
                      onEnter={() => {}}
                    />
                  </div>

                  {tpinError && (
                    <p className="text-xs text-red-500 font-bold ml-1 text-center">{tpinError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={forgotLoading || newTpin.length !== 6 || confirmTpin.length !== 6}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    {forgotLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset TPIN'}
                  </button>
                </form>
              </motion.div>
            )}

            {forgotStep === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight">TPIN Recovered Successfully</h4>
                  <p className="text-slate-500 font-medium text-sm mt-2">
                    Your Transaction PIN has been updated. You can now use your new TPIN for secure banking transactions.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onSuccess) onSuccess();
                  }}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center cursor-pointer"
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default TPINRecoveryModal;
