import React, { useState, useEffect, useRef } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

const OTPInput = ({ numInputs = 6, value = '', onChange, onComplete, onResend, isResending = false }) => {
  const [otp, setOtp] = useState(Array(numInputs).fill(''));
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (value) {
      const otpArray = value.split('').slice(0, numInputs);
      setOtp([...otpArray, ...Array(numInputs - otpArray.length).fill('')]);
    }
  }, [value, numInputs]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      setCanResend(false);
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const focusInput = (index) => {
    const targetIndex = Math.max(0, Math.min(index, numInputs - 1));
    if (inputRefs.current[targetIndex]) {
      inputRefs.current[targetIndex].focus();
      inputRefs.current[targetIndex].select();
    }
  };

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otp];
    const char = val.substring(val.length - 1);
    newOtp[index] = char;
    setOtp(newOtp);

    const fullCode = newOtp.join('');
    onChange && onChange(fullCode);

    if (char !== '') {
      if (index < numInputs - 1) {
        focusInput(index + 1);
      } else {
        onComplete && onComplete(fullCode);
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '') {
        const newOtp = [...otp];
        if (index > 0) {
          newOtp[index - 1] = '';
          setOtp(newOtp);
          onChange && onChange(newOtp.join(''));
          focusInput(index - 1);
        }
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        onChange && onChange(newOtp.join(''));
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && index < numInputs - 1) {
      focusInput(index + 1);
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, numInputs);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < numInputs; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    setOtp(newOtp);

    const fullCode = newOtp.join('');
    onChange && onChange(fullCode);

    const lastFilledIndex = Math.min(pastedData.length, numInputs - 1);
    focusInput(lastFilledIndex);

    if (pastedData.length === numInputs) {
      onComplete && onComplete(fullCode);
    }
  };

  const handleResendClick = async () => {
    if (!canResend || isResending) return;
    try {
      onResend && await onResend();
      setTimer(60);
      setCanResend(false);
      setOtp(Array(numInputs).fill(''));
      onChange && onChange('');
      focusInput(0);
    } catch (err) {
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full">
      <div className="flex gap-2 sm:gap-3 justify-center w-full">
        {otp.map((digit, idx) => (
          <input
            key={idx}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            ref={(el) => (inputRefs.current[idx] = el)}
            onChange={(e) => handleChange(e, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            onPaste={handlePaste}
            className="w-11 h-14 sm:w-14 sm:h-16 text-center text-2xl sm:text-3xl font-black bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-2xl outline-none transition-all placeholder:text-slate-200 tracking-normal focus:ring-4 focus:ring-indigo-500/10"
            autoFocus={idx === 0}
          />
        ))}
      </div>

      <div className="flex flex-col items-center space-y-2">
        {timer > 0 ? (
          <p className="text-slate-400 font-semibold text-xs sm:text-sm">
            Resend OTP in <span className="text-indigo-600 font-bold">{timer}s</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResendClick}
            disabled={isResending}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 disabled:text-indigo-300 font-bold text-xs sm:text-sm tracking-wide transition-all uppercase hover:underline cursor-pointer"
          >
            {isResending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 animate-spin-reverse" />
            )}
            Resend Verification Code
          </button>
        )}
      </div>
    </div>
  );
};

export default OTPInput;
