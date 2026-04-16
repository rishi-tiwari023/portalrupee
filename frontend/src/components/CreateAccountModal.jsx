import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Landmark, PiggyBank, Briefcase, CheckCircle2, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createAccount, resetAccountStatus } from '../store/slices/accountSlice';
import { toast } from 'react-toastify';

const CreateAccountModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.account);
  const [accountType, setAccountType] = useState('SAVINGS');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(createAccount({ accountType }));
    if (createAccount.fulfilled.match(resultAction)) {
      toast.success(`${accountType} account created successfully!`);
      setTimeout(() => {
        onClose();
        dispatch(resetAccountStatus());
      }, 2000);
    } else {
      toast.error(resultAction.payload || 'Failed to create account');
    }
  };

  const accountOptions = [
    {
      type: 'SAVINGS',
      title: 'Savings Account',
      description: 'Ideal for personal savings with high interest rates.',
      icon: PiggyBank,
      color: 'bg-indigo-50 text-indigo-600',
      activeColor: 'ring-2 ring-indigo-600 bg-indigo-50/50',
    },
    {
      type: 'CURRENT',
      title: 'Current Account',
      description: 'Perfect for business transactions with no limits.',
      icon: Briefcase,
      color: 'bg-emerald-50 text-emerald-600',
      activeColor: 'ring-2 ring-emerald-600 bg-emerald-50/50',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Open New Account</h3>
                  <p className="text-sm text-slate-500 font-medium">Choose your account type</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8">
              {success ? (
                <div className="py-12 flex flex-col items-center text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6"
                  >
                    <CheckCircle2 className="w-10 h-10" />
                  </motion.div>
                  <h4 className="text-2xl font-black text-slate-900 mb-2">Account Created!</h4>
                  <p className="text-slate-500 font-medium max-w-xs mx-auto">
                    Your new {accountType.toLowerCase()} account has been successfully initialized.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    {accountOptions.map((option) => (
                      <button
                        key={option.type}
                        type="button"
                        onClick={() => setAccountType(option.type)}
                        className={`flex items-start gap-4 p-5 rounded-3xl transition-all border text-left
                          ${accountType === option.type 
                            ? option.activeColor + ' border-transparent' 
                            : 'border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200'}
                        `}
                      >
                        <div className={`p-4 rounded-2xl ${option.color}`}>
                          <option.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-slate-900">{option.title}</h4>
                          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                            {option.description}
                          </p>
                        </div>
                        {accountType === option.type && (
                          <div className="mt-1">
                            <CheckCircle2 className={`w-5 h-5 ${option.type === 'SAVINGS' ? 'text-indigo-600' : 'text-emerald-600'}`} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {error && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-2">
                       {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-lg shadow-indigo-100 active:scale-95 flex items-center justify-center"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Initialize Account'
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                By clicking "Initialize Account", you agree to PortalRupee terms of service.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateAccountModal;
