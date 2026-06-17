import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCcw,
  Check
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';

const ApproveDeposits = () => {
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState(1);
  const limit = 8;

  const loadPendingDeposits = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/transactions/pending-deposits?page=${page}&limit=${limit}`);
      if (res.data.status === 'success') {
        setTransactions(res.data.data.transactions);
        setTotal(res.data.pagination.total);
        setPages(res.data.pagination.pages);
        setCurrentPage(res.data.pagination.page);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load pending deposit requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingDeposits(1);
  }, []);

  const handleApprove = async (id) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const res = await api.patch(`/transactions/${id}/approve`, { status: 'SUCCESS' });
      if (res.data.status === 'success') {
        toast.success('Deposit request successfully approved & credited!');
        // Reload current page, or previous page if current page becomes empty
        const isPageEmpty = transactions.length === 1 && currentPage > 1;
        loadPendingDeposits(isPageEmpty ? currentPage - 1 : currentPage);
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to approve deposit request.';
      toast.error(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const res = await api.patch(`/transactions/${id}/approve`, { status: 'FAILED', description: 'Deposit request rejected by Cashier.' });
      if (res.data.status === 'success') {
        toast.success('Deposit request rejected.');
        const isPageEmpty = transactions.length === 1 && currentPage > 1;
        loadPendingDeposits(isPageEmpty ? currentPage - 1 : currentPage);
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to reject deposit request.';
      toast.error(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (val) => {
    return (val || 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    });
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight dark:text-white">
            Approve Transactions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Review, verify, and approve pending deposit requests for credit.
          </p>
        </div>

        <button
          onClick={() => loadPendingDeposits(currentPage)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-sm font-semibold">Refresh Queue</span>
        </button>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="premium-card p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending Requests</span>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-4xl font-black text-slate-900 dark:text-white">{total}</span>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="premium-card p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verification Agent</span>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-lg font-black text-slate-900 dark:text-white">Active Duties</span>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <Check className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="premium-card p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Limits</span>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-lg font-black text-slate-900 dark:text-white">Uncapped Auditing</span>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Queue View */}
      {loading && transactions.length === 0 ? (
        <div className="w-full flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 max-w-xl mx-auto">
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4 animate-pulse" />
          <h4 className="text-slate-800 dark:text-slate-200 font-black text-xl mb-1">Queue is Empty</h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Excellent work! There are currently no pending deposits requiring cashier approval.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm rounded-[2rem] overflow-hidden p-6 space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-4 pr-3">Txn ID</th>
                  <th className="pb-4 px-3">Date</th>
                  <th className="pb-4 px-3">Target Account</th>
                  <th className="pb-4 px-3">Owner Details</th>
                  <th className="pb-4 px-3 text-right">Amount</th>
                  <th className="pb-4 pl-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {transactions.map((tx) => (
                    <motion.tr
                      key={tx._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-4 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <ArrowDownLeft size={16} />
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white block text-sm">{tx.transactionId}</span>
                            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Deposit Request</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3 font-semibold text-slate-500 dark:text-slate-400">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="py-4 px-3">
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                          {tx.receiverAccount?.accountNumber || 'N/A'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase mt-0.5">
                          {tx.receiverAccount?.accountType || 'SAVINGS'}
                        </span>
                      </td>
                      <td className="py-4 px-3 font-medium text-slate-600 dark:text-slate-400">
                        <div>
                          {tx.receiver ? `${tx.receiver.firstName} ${tx.receiver.lastName}` : 'System User'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          {tx.receiver?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-3 font-black text-slate-900 dark:text-white text-right text-sm">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="py-4 pl-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprove(tx._id)}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] tracking-wider uppercase shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 size={13} />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(tx._id)}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-white dark:bg-slate-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl font-bold text-[11px] tracking-wider uppercase active:scale-95 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <XCircle size={13} />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700 text-xs font-bold text-slate-500">
              <span>Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, total)} of {total} requests</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadPendingDeposits(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="w-9 h-9 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 dark:hover:border-indigo-900 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="w-8 text-center text-slate-900 dark:text-white font-extrabold">{currentPage}</span>
                <button
                  onClick={() => loadPendingDeposits(currentPage + 1)}
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

export default ApproveDeposits;
