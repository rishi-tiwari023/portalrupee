import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, ArrowUpRight, ArrowDownLeft, Calendar, ShieldCheck, ShieldAlert, History } from 'lucide-react';

const BalanceCheckModal = ({ isOpen, onClose, account }) => {
  if (!account) return null;

  const { accountNumber, accountType, balance, status, createdAt } = account;
  const isBlocked = status === 'BLOCKED' || status === 'CLOSED';

  const stats = [
    { label: 'Last Transaction', value: '₹2,450.00', icon: ArrowUpRight, color: 'text-emerald-500' },
    { label: 'Pending Clearances', value: '₹0.00', icon: ArrowDownLeft, color: 'text-rose-500' },
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
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header / Banner */}
            <div className={`p-8 text-white relative overflow-hidden
              ${isBlocked ? 'bg-slate-700' : 'bg-gradient-to-br from-indigo-600 to-indigo-800'}`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              
              <div className="flex justify-between items-start relative z-10 mb-8">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20">
                  <Wallet className="w-6 h-6" />
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="relative z-10">
                <p className="text-indigo-200 text-xs font-black uppercase tracking-[0.2em] mb-1">Total Available</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-medium text-indigo-300">₹</span>
                  <span className="text-5xl font-black tracking-tighter">
                    {balance ? balance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="p-8">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Account Info</p>
                  <p className="font-black text-slate-800 tracking-tight">{accountType} ACCOUNT</p>
                  <p className="font-mono text-xs text-slate-500 tracking-widest">{accountNumber}</p>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase
                  ${isBlocked ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {isBlocked ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                  {status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {stats.map((stat, idx) => (
                  <div key={idx} className="p-4 border border-slate-100 rounded-3xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">{stat.label}</p>
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg bg-slate-50 ${stat.color}`}>
                        <stat.icon className="w-4 h-4" />
                      </div>
                      <p className="font-black text-slate-900">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <span className="font-medium">Member since <span className="font-black text-slate-800">{new Date(createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span></span>
                </div>
                {/* Visual placeholder for interest rate if savings */}
                {accountType === 'SAVINGS' && (
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="w-5 h-5 flex items-center justify-center text-indigo-600 font-black">%</div>
                    <span className="font-medium">Annual Interest Rate: <span className="font-black text-indigo-600">4.5% p.a.</span></span>
                  </div>
                )}
              </div>

              <div className="mt-8 flex gap-3">
                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                  <History className="w-4 h-4" /> View History
                </button>
                <button 
                  onClick={onClose}
                  className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-sm transition-all active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Micro-footer */}
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest flex items-center justify-center gap-2">
                <ShieldCheck className="w-3 h-3" /> Encrypted & Secure Connection
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BalanceCheckModal;
