import React, { useState } from 'react';
import { CreditCard, Eye, EyeOff, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAccountBalance } from '../store/slices/accountSlice';
import TOTPVerifyModal from './TOTPVerifyModal';

const AccountSummaryCard = ({ account }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showBalance, setShowBalance] = useState(false);
  const [isTOTPOpen, setIsTOTPOpen] = useState(false);
  const [verifiedBalance, setVerifiedBalance] = useState(null);
  const [pendingAction, setPendingAction] = useState(null); // 'balance' or 'details'
  
  const { _id, accountNumber, accountType, balance, status } = account;
  const user = useSelector(state => state.auth.user);

  const isBlocked = status === 'BLOCKED' || status === 'CLOSED';
  const lastFourDigits = accountNumber ? accountNumber.slice(-4) : 'XXXX';
  const prefixDots = '•••• •••• ';

  const toggleBalance = (e) => {
    e.stopPropagation();
    if (showBalance) {
      setShowBalance(false);
      return;
    }

    if (user?.twoFactorEnabled && !verifiedBalance) {
      setPendingAction('balance');
      setIsTOTPOpen(true);
    } else {
      setShowBalance(true);
    }
  };

  const goToDetails = (e) => {
    if (e) e.stopPropagation();
    if (user?.twoFactorEnabled && !verifiedBalance) {
      setPendingAction('details');
      setIsTOTPOpen(true);
    } else {
      navigate(`/dashboard/accounts?id=${_id}`);
    }
  };

  const handleVerify = async (totpToken) => {
    const resultAction = await dispatch(fetchAccountBalance({ accountId: _id, totpToken }));
    if (fetchAccountBalance.fulfilled.match(resultAction)) {
      setVerifiedBalance(resultAction.payload.balance);
      setIsTOTPOpen(false);
      
      if (pendingAction === 'balance') {
        setShowBalance(true);
      } else if (pendingAction === 'details') {
        navigate(`/dashboard/accounts?id=${_id}`);
      }
      setPendingAction(null);
    } else {
      throw new Error(resultAction.payload || 'Invalid TOTP token');
    }
  };

  return (
    <div
      onClick={goToDetails}
      className={`relative p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl group overflow-hidden cursor-pointer
      ${isBlocked ? 'bg-slate-50 border-slate-200' : 'bg-gradient-to-br from-white to-slate-50 border-indigo-100'}`}>

      {/* Background Decorators */}
      {!isBlocked && (
        <div className="absolute top-0 right-0 p-8 rounded-full bg-indigo-50/50 -mr-10 -mt-10 blur-xl group-hover:bg-indigo-100/50 transition-colors" />
      )}

      {/* Header section */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl flex items-center justify-center
            ${isBlocked ? 'bg-slate-200 text-slate-500' : 'bg-indigo-100 text-indigo-600'}`}>
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h4 className={`text-sm font-black tracking-tight ${isBlocked ? 'text-slate-500' : 'text-slate-800'}`}>
              {accountType} ACCOUNT
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isBlocked ? (
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              )}
              <span className={`text-[10px] font-black tracking-widest uppercase
                ${isBlocked ? 'text-rose-500' : 'text-emerald-500'}`}>
                {status}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={toggleBalance}
          className="text-slate-400 hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-full active:scale-95"
        >
          {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {/* Account Balance */}
      <div className="mb-6 relative z-10">
        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1">Available Balance</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-lg font-bold ${isBlocked ? 'text-slate-400' : 'text-slate-500'}`}>₹</span>
          <span className={`text-4xl font-black tracking-tighter ${isBlocked ? 'text-slate-600' : 'text-slate-900'}`}>
            {showBalance
              ? ((verifiedBalance !== null ? verifiedBalance : balance)?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00')
              : '••••••'
            }
          </span>
        </div>
      </div>

      {/* Account Number & Interaction */}
      <div className="flex justify-between items-end pt-4 border-t border-slate-100 relative z-10">
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 mt-2">Account Number</p>
          <div className="flex items-center gap-2 font-mono text-sm tracking-widest font-medium text-slate-600">
            <span className="text-slate-300">{prefixDots}</span>
            <span className="text-slate-800 font-black">{lastFourDigits}</span>
          </div>
        </div>

        {!isBlocked && (
          <button
            onClick={(e) => { e.stopPropagation(); goToDetails(); }}
            className="flex items-center gap-1 text-sm font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition-colors hover:bg-indigo-100 active:scale-95"
          >
            Details <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        )}
      </div>

      <TOTPVerifyModal 
        isOpen={isTOTPOpen}
        onClose={() => { setIsTOTPOpen(false); setPendingAction(null); }}
        onVerify={handleVerify}
        title={pendingAction === 'balance' ? 'View Balance' : 'View Details'}
      />
    </div>
  );
};

export default AccountSummaryCard;
