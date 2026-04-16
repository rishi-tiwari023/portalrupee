import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, Lock, Loader2 } from 'lucide-react';
import TPINInput from './TPINInput';

const TPINSetupWizard = ({ onSuccess, onCancel, isChangeMode = false, title = "Setup Transaction PIN" }) => {
  const [step, setStep] = useState(1);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (pin.length !== 6) {
      setError("Please enter a 6-digit TPIN");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async () => {
    if (pin !== confirmPin) {
      setError("TPINs do not match. Please try again.");
      setConfirmPin("");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onSuccess(pin);
    } catch (err) {
      setError(err || "Failed to save TPIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
          <Lock size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        <p className="text-slate-500 text-sm mt-2">
          {step === 1 ? "Choose a secure 6-digit PIN for your transactions." : "Re-enter your TPIN to confirm it's correct."}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <TPINInput 
              value={pin} 
              onChange={(val) => { setPin(val); setError(""); }} 
              error={error}
            />
            
            <div className="flex flex-col gap-3">
              <button
                onClick={handleNext}
                disabled={pin.length !== 6}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>Continue</span>
                <ArrowRight size={20} />
              </button>
              {onCancel && (
                <button 
                  onClick={onCancel}
                  className="w-full py-3 bg-slate-50 text-slate-400 font-semibold rounded-2xl hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <TPINInput 
              value={confirmPin} 
              onChange={(val) => { setConfirmPin(val); setError(""); }} 
              error={error}
            />

            <div className="flex flex-col gap-3">
              <button
                onClick={handleSubmit}
                disabled={confirmPin.length !== 6 || loading}
                className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    <span>Confirm & Setup</span>
                    <ShieldCheck size={20} />
                  </>
                )}
              </button>
              <button
                onClick={() => setStep(1)}
                className="w-full py-3 bg-slate-50 text-slate-400 font-semibold rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
                <span>Go Back</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 flex justify-center gap-2">
        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-indigo-600' : 'bg-slate-200'}`} />
        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-indigo-600' : 'bg-slate-200'}`} />
      </div>
    </div>
  );
};

export default TPINSetupWizard;
