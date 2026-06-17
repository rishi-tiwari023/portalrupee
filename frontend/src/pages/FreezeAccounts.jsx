import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShieldAlert,
  UserCheck,
  Building,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  AlertTriangle,
  Lock,
  Unlock,
  Users
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';

const STATUS_COLORS = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900',
  BLOCKED: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900',
  CLOSED: 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900 dark:text-slate-400'
};

const FreezeAccounts = () => {
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState(1);
  const limit = 8;

  const loadAccounts = async (page = 1) => {
    setLoading(true);
    try {
      if (searchTerm.trim() && /^\d+$/.test(searchTerm.trim())) {
        // If it's a numeric search, assume account number lookup
        try {
          const res = await api.get(`/accounts/number/${searchTerm.trim()}`);
          if (res.data.success) {
            setAccounts([res.data.data]);
            setTotal(1);
            setPages(1);
            setCurrentPage(1);
          }
        } catch (searchErr) {
          if (searchErr.response?.status === 404) {
            setAccounts([]);
            setTotal(0);
            setPages(1);
            setCurrentPage(1);
          } else {
            throw searchErr;
          }
        }
      } else {
        // Default list all accounts
        const res = await api.get(`/accounts/admin/all?page=${page}&limit=${limit}`);
        if (res.data.success) {
          setAccounts(res.data.data);
          setTotal(res.data.total);
          setPages(Math.ceil(res.data.total / limit) || 1);
          setCurrentPage(page);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load accounts list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounced search trigger
    const handler = setTimeout(() => {
      loadAccounts(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleFreeze = async (id) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const res = await api.patch(`/accounts/${id}/freeze`);
      if (res.data.success) {
        toast.success('Account successfully frozen!');
        loadAccounts(currentPage);
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to freeze account.';
      toast.error(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfreeze = async (id) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const res = await api.patch(`/accounts/${id}/unfreeze`);
      if (res.data.success) {
        toast.success('Account successfully unfrozen!');
        loadAccounts(currentPage);
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to unfreeze account.';
      toast.error(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return (val || 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    });
  };

  const blockedCount = accounts.filter(acc => acc.status === 'BLOCKED').length;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight dark:text-white">
            Freeze Accounts
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Restrict user actions by locking/unlocking bank accounts instantly.
          </p>
        </div>

        <button
          onClick={() => loadAccounts(currentPage)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-sm font-semibold">Sync Accounts</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="premium-card p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total System Accounts</span>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-4xl font-black text-slate-900 dark:text-white">{total}</span>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <Building className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="premium-card p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Audit Status</span>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-lg font-black text-slate-900 dark:text-white">Active Manager</span>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="premium-card p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Safety State</span>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-lg font-black text-slate-900 dark:text-white">Role Restrictive</span>
            <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm p-4 rounded-3xl mb-6 flex items-center">
        <div className="flex items-center gap-3 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-2.5 rounded-2xl border border-white/50 dark:border-slate-700 w-full md:max-w-md group focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:shadow-md transition-all">
          <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600" />
          <input
            type="text"
            placeholder="Search by 12-digit Account Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-xs font-semibold text-slate-700 dark:text-slate-300 placeholder:text-slate-400 w-full"
          />
        </div>
      </div>

      {/* Directory View */}
      {loading && accounts.length === 0 ? (
        <div className="w-full flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="p-16 text-center border border-slate-100 dark:border-slate-700 rounded-3xl bg-white dark:bg-slate-800 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h4 className="text-slate-800 dark:text-slate-200 font-black text-lg mb-1">No Accounts Found</h4>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold max-w-sm mx-auto">
            We couldn't find any account matching your criteria. Make sure the 12-digit account number is entered correctly.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm rounded-[2rem] overflow-hidden p-6 space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-4 pr-3">Account Holder</th>
                  <th className="pb-4 px-3">Account Number</th>
                  <th className="pb-4 px-3">Account Type</th>
                  <th className="pb-4 px-3 text-right">Balance</th>
                  <th className="pb-4 px-3 text-center">Status</th>
                  <th className="pb-4 pl-3 text-center">Freeze Control</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {accounts.map((acc) => (
                    <motion.tr
                      key={acc._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-4 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-black text-xs">
                            {acc.user?.firstName?.[0]?.toUpperCase()}{acc.user?.lastName?.[0]?.toUpperCase() || ''}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white block text-sm">
                              {acc.user ? `${acc.user.firstName} ${acc.user.lastName}` : 'Guest User'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold block">{acc.user?.email || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {acc.accountNumber}
                      </td>
                      <td className="py-4 px-3 font-semibold text-slate-500 dark:text-slate-400">
                        {acc.accountType}
                      </td>
                      <td className="py-4 px-3 font-black text-slate-900 dark:text-white text-right text-sm">
                        {formatCurrency(acc.balance)}
                      </td>
                      <td className="py-4 px-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${STATUS_COLORS[acc.status] || 'bg-slate-100 text-slate-700'}`}>
                          {acc.status}
                        </span>
                      </td>
                      <td className="py-4 pl-3">
                        <div className="flex items-center justify-center">
                          {acc.status === 'ACTIVE' ? (
                            <button
                              onClick={() => handleFreeze(acc._id)}
                              disabled={actionLoading}
                              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-[11px] tracking-wider uppercase shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <Lock size={12} />
                              <span>Freeze</span>
                            </button>
                          ) : acc.status === 'BLOCKED' ? (
                            <button
                              onClick={() => handleUnfreeze(acc._id)}
                              disabled={actionLoading}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] tracking-wider uppercase shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <Unlock size={12} />
                              <span>Unfreeze</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[10px] font-bold uppercase">Locked (Closed)</span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && !searchTerm.trim() && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700 text-xs font-bold text-slate-500">
              <span>Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, total)} of {total} accounts</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadAccounts(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="w-9 h-9 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 dark:hover:border-indigo-900 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="w-8 text-center text-slate-900 dark:text-white font-extrabold">{currentPage}</span>
                <button
                  onClick={() => loadAccounts(currentPage + 1)}
                  disabled={currentPage === pages || loading}
                  className="w-9 h-9 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 dark:hover:border-indigo-900 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FreezeAccounts;
