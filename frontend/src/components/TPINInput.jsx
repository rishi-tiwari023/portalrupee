import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TPINInput = ({ value, onChange, length = 6, error, onEnter }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    // If external value is cleared, clear local state
    if (!value) {
      setOtp(new Array(length).fill(""));
    }
  }, [value, length]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newOtp = [...otp];
    // Take only the last character entered
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);
    
    const combinedOtp = newOtp.join("");
    onChange(combinedOtp);

    // Auto focus next
    if (val && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === "Enter" && onEnter) {
      onEnter();
    }
  };

  const handlePaste = (e) => {
    const data = e.clipboardData.getData("text").slice(0, length);
    if (!/^\d+$/.test(data)) return;

    const newOtp = data.split("").concat(new Array(length - data.length).fill(""));
    setOtp(newOtp.slice(0, length));
    onChange(data);
    
    // Focus last character or current end
    const lastIdx = Math.min(data.length, length - 1);
    inputRefs.current[lastIdx].focus();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2 sm:gap-4 justify-center">
        {otp.map((digit, index) => (
          <motion.input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="password"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={index === 0 ? handlePaste : undefined}
            className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-2xl font-bold bg-slate-50 border-2 rounded-xl focus:outline-none transition-all ${
              error ? 'border-rose-300 ring-4 ring-rose-500/10' : 'border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
            }`}
            whileFocus={{ scale: 1.05 }}
          />
        ))}
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-rose-500 font-medium"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default TPINInput;
