import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ShieldAlert, AlertTriangle, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { getMe } from '../store/slices/authSlice';
import api from '../api/axios';
import { toast } from 'react-toastify';

const AccountFrozen = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  const [submitting, setSubmitting] = useState({});
  const [disputeMessages, setDisputeMessages] = useState({});

  // Filter blocked accounts
  const blockedAccounts = user?.accounts?.filter(acc => acc.status === 'BLOCKED') || [];

  const handleDisputeSubmit = async (accountId) => {
    const message = disputeMessages[accountId];
    if (!message || message.trim().length === 0) {
      toast.error('Please enter a reason for the dispute.');
      return;
    }

    setSubmitting(prev => ({ ...prev, [accountId]: true }));
    try {
      await api.post(`/accounts/${accountId}/dispute`, { disputeMessage: message });
      toast.success('Dispute submitted successfully.');
      dispatch(getMe()); // Refresh profile to get updated freezeDispute message
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit dispute.');
    } finally {
      setSubmitting(prev => ({ ...prev, [accountId]: false }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 p-6 bg-rose-50 border border-rose-100 rounded-3xl">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-rose-900 tracking-tight">Account Restricted</h2>
          <p className="text-sm text-rose-700 font-medium mt-1">
            {user?.isCompletelyFrozen 
              ? 'All your accounts have been frozen. Your access to operations is restricted.'
              : 'Some of your accounts are currently frozen.'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 px-2">Blocked Accounts</h3>
        {blockedAccounts.length === 0 ? (
          <p className="text-slate-500 px-2">No blocked accounts found.</p>
        ) : (
          blockedAccounts.map(account => (
            <div key={account._id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                    {account.accountType} ACCOUNT
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {account.accountNumber}
                  </div>
                </div>
                <div className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-wider rounded-lg border border-rose-100 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  BLOCKED
                </div>
              </div>

              {account.freezeDispute ? (
                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">Dispute Under Review</h4>
                    <p className="text-sm text-emerald-700 mt-1">"{account.freezeDispute}"</p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <label className="text-sm font-bold text-slate-700">Submit a Dispute / Tell us the reason</label>
                  <textarea
                    rows={3}
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-medium text-slate-700 transition-all resize-none"
                    placeholder="Please explain why you believe your account should be unfrozen..."
                    value={disputeMessages[account._id] || ''}
                    onChange={(e) => setDisputeMessages(prev => ({ ...prev, [account._id]: e.target.value }))}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDisputeSubmit(account._id)}
                      disabled={submitting[account._id] || !disputeMessages[account._id]?.trim()}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 active:scale-95"
                    >
                      {submitting[account._id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Submit Dispute
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AccountFrozen;
