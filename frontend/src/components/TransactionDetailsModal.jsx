import React from 'react';
import { 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Hash,
  User,
  Calendar,
  CreditCard,
  Copy
} from 'lucide-react';
import { toast } from 'react-toastify';

const TransactionDetailsModal = ({ isOpen, onClose, transaction, currentUserId }) => {
  if (!isOpen || !transaction) return null;

  const isReceiver = (transaction.receiver?._id || transaction.receiver) === currentUserId;
  
  let isCredit = false;
  if (transaction.type === 'DEPOSIT') isCredit = true;
  if (transaction.type === 'WITHDRAW') isCredit = false;
  if (transaction.type === 'TRANSFER') isCredit = isReceiver;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const statusConfig = {
    SUCCESS: { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2, border: 'border-emerald-100' },
    PENDING: { color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock, border: 'border-amber-100' },
    FAILED: { color: 'text-rose-600', bg: 'bg-rose-50', icon: AlertCircle, border: 'border-rose-100' },
  };

  const { color, bg, icon: StatusIcon, border } = statusConfig[transaction.status] || statusConfig.PENDING;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/10 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center 
              ${isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}
            `}>
              {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-lg transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Money and Status */}
          <div className="text-center mb-6">
            <h2 className={`text-3xl font-black tracking-tight mb-2 ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>
              {isCredit ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h2>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${bg} ${color} ${border}`}>
              <StatusIcon className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-wider">{transaction.status}</span>
            </div>
            {/* Centered Description without heading */}
            <p className="mt-3 text-xs text-slate-500 font-medium max-w-[200px] mx-auto leading-relaxed">
              {transaction.description || 'No description provided'}
            </p>
          </div>

          {/* Compact Info Grid */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">TXN ID</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-700 font-mono">{transaction.transactionId.slice(-10)}</span>
                <button onClick={() => copyToClipboard(transaction.transactionId, 'ID')} className="text-slate-300 hover:text-indigo-600">
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Date & Time</span>
              </div>
              <span className="text-[11px] font-bold text-slate-700">
                {new Date(transaction.createdAt).toLocaleString('en-IN', { 
                  day: '2-digit', 
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            <div className="p-4 bg-slate-900 rounded-3xl text-white">
              <div className="space-y-3">
                {transaction.type === 'TRANSFER' ? (
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-left">
                      <p className="text-[8px] font-black text-white/40 uppercase mb-0.5">From</p>
                      <p className="text-[11px] font-bold truncate max-w-[80px]">
                        {transaction.sender?.firstName || 'User'}
                      </p>
                    </div>
                    <div className="flex-1 h-px bg-white/10 relative">
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-1">
                         <ArrowUpRight className="w-2.5 h-2.5 text-indigo-400" />
                       </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-white/40 uppercase mb-0.5">To</p>
                      <p className="text-[11px] font-bold truncate max-w-[80px]">
                        {transaction.receiver?.firstName || 'User'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-white/40" />
                    <div>
                      <p className="text-[8px] font-black text-white/40 uppercase mb-0.5">Source Account</p>
                      <p className="text-[11px] font-bold">
                        {isCredit ? transaction.receiverAccount?.accountNumber : transaction.senderAccount?.accountNumber}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Compact Actions */}
          <button 
            className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-[0.98]"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;
