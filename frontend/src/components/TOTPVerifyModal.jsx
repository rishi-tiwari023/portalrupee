import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const TOTPVerifyModal = ({ isOpen, onClose, onVerify, title = "Security Check" }) => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (token.length !== 6) {
      return toast.error('Please enter a 6-digit token');
    }

    setLoading(true);
    try {
      await onVerify(token);
      setToken('');
    } catch (error) {
      toast.error(error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
          {/* Enhanced Backdrop with heavy blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] p-8 sm:p-10"
          >
            <div className="flex flex-col items-center text-center">
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">{title}</h3>
              <p className="text-slate-500 font-medium text-sm mb-8">
                Enter the 6-digit verification code from your authenticator app.
              </p>

              <form onSubmit={handleSubmit} className="w-full space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={token}
                    onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-4xl font-black py-6 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none transition-all placeholder:text-slate-200 tracking-[0.1em]"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || token.length !== 6}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-xl shadow-indigo-100 flex items-center justify-center active:scale-95"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Verify & Unlock'}
                </button>
              </form>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default TOTPVerifyModal;
