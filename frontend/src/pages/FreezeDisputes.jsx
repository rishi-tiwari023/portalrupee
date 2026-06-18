import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, User as UserIcon, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const FreezeDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unfreezing, setUnfreezing] = useState({});

  const fetchDisputes = async () => {
    try {
      const res = await api.get('/accounts/disputes');
      setDisputes(res.data.data);
    } catch (err) {
      toast.error('Failed to load freeze disputes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleUnfreeze = async (accountId) => {
    setUnfreezing(prev => ({ ...prev, [accountId]: true }));
    try {
      await api.patch(`/accounts/${accountId}/unfreeze`);
      toast.success('Account unfrozen successfully');
      setDisputes(disputes.filter(d => d._id !== accountId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to unfreeze account');
    } finally {
      setUnfreezing(prev => ({ ...prev, [accountId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Freeze Disputes</h2>
        <p className="text-slate-500 font-medium mt-2">
          Review and resolve account freeze disputes submitted by users.
        </p>
      </div>

      {disputes.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-100 rounded-[2rem] shadow-sm">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Active Disputes</h3>
          <p className="text-slate-500">All freeze disputes have been resolved.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {disputes.map((account) => (
            <motion.div
              key={account._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-6 relative overflow-hidden"
            >
              {/* Decorative side border */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500" />

              <div className="flex justify-between items-start pl-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {account.user?.firstName} {account.user?.lastName}
                    </h3>
                    <p className="text-xs text-slate-500">{account.user?.email}</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-rose-100 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  DISPUTED
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pl-2">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account No</div>
                  <div className="font-bold text-slate-800">{account.accountNumber}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Type</div>
                  <div className="font-bold text-slate-800">{account.accountType}</div>
                </div>
              </div>

              <div className="pl-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">User Reason</label>
                <div className="p-4 bg-amber-50 text-amber-900 rounded-2xl border border-amber-100 text-sm font-medium leading-relaxed">
                  "{account.freezeDispute}"
                </div>
              </div>

              <div className="pl-2 pt-2 border-t border-slate-50 flex justify-end">
                <button
                  onClick={() => handleUnfreeze(account._id)}
                  disabled={unfreezing[account._id]}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center gap-2"
                >
                  {unfreezing[account._id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Unfreeze Account
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FreezeDisputes;
