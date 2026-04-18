import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Shield, X, Loader2, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { get2FASetup, enable2FA, disable2FA } from '../store/slices/authSlice';
import { toast } from 'react-toastify';

const TwoFactorSetup = ({ onCancel, isEnabled }) => {
  const dispatch = useDispatch();
  const [setupData, setSetupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpToken, setOtpToken] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSetup = async () => {
      try {
        const result = await dispatch(get2FASetup()).unwrap();
        setSetupData(result.data);
      } catch (error) {
        toast.error(error || 'Failed to load 2FA setup');
      } finally {
        setLoading(false);
      }
    };

    fetchSetup();
  }, [dispatch]);

  const handleAction = async () => {
    if (!otpToken || otpToken.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setVerifying(true);
    try {
      if (isEnabled) {
        await dispatch(disable2FA(otpToken)).unwrap();
        toast.success('Two-factor authentication disabled');
      } else {
        await dispatch(enable2FA(otpToken)).unwrap();
        toast.success('Two-factor authentication enabled');
      }
      onCancel();
    } catch (error) {
      toast.error(error || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading security settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isEnabled ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <Shield size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {isEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Google Authenticator TOTP
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {!isEnabled && setupData && (
        <div className="space-y-6">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center space-y-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
              <img src={setupData.qrCode} alt="2FA QR Code" className="w-48 h-48" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-semibold text-slate-700">Scan this QR Code</p>
              <p className="text-xs text-slate-500 max-w-[240px] leading-relaxed">
                Open Google Authenticator or any TOTP app and scan the code above to add your account.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Manual Entry Key</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-mono text-sm text-slate-600 truncate">
                {setupData.secret}
              </div>
              <button
                onClick={() => copyToClipboard(setupData.secret)}
                className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all"
              >
                {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEnabled && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3">
          <AlertCircle className="text-rose-500 shrink-0" size={20} />
          <p className="text-sm text-rose-700 font-medium leading-relaxed">
            Disabling two-factor authentication will make your account less secure. You will only need your password to log in.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Verification Code
          </label>
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            value={otpToken}
            onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAction();
            }}
            className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-center text-2xl font-bold tracking-[0.5em] focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all placeholder:text-slate-200"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleAction}
            disabled={verifying || otpToken.length !== 6}
            className={`flex-[2] py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
              isEnabled 
                ? 'bg-rose-600 shadow-rose-100 hover:bg-rose-700 disabled:bg-rose-300' 
                : 'bg-indigo-600 shadow-indigo-100 hover:bg-indigo-700 disabled:bg-indigo-300'
            }`}
          >
            {verifying ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                {isEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                <CheckCircle2 size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorSetup;
