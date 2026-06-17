import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardSummary } from '../store/slices/dashboardSlice';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Send,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  RefreshCcw,
  LayoutGrid,
  CreditCard
} from 'lucide-react';
import AccountSummaryCard from '../components/AccountSummaryCard';
import CreateAccountModal from '../components/CreateAccountModal';
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';
import TransactionDetailsModal from '../components/TransactionDetailsModal';

const DashboardHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { summary, loading } = useSelector((state) => state.dashboard);
  const [isOpeningAccount, setIsOpeningAccount] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user?._id) {
      if (user.role === 'CASHIER') {
        navigate('/dashboard/approve-deposits', { replace: true });
      } else if (user.role === 'MANAGER') {
        navigate('/dashboard/users', { replace: true });
      } else {
        dispatch(fetchDashboardSummary());
      }
    }
  }, [dispatch, user, navigate]);

  const quickActions = [
    {
      name: 'Add Funds',
      icon: Plus,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      onClick: () => setIsDepositOpen(true)
    },
    {
      name: 'Withdraw',
      icon: ArrowUpRight,
      color: 'bg-rose-500',
      textColor: 'text-rose-600',
      onClick: () => setIsWithdrawOpen(true)
    },
    {
      name: 'Send Money',
      icon: Send,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      onClick: () => navigate('/dashboard/transfer') // Future Day 11
    },
    {
      name: 'Statements',
      icon: FileText,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      onClick: () => { }
    },
  ];

  const handleViewDetails = (tx) => {
    setSelectedTransaction(tx);
    setIsModalOpen(true);
  };

  if (loading && !summary.accountCount) {
    return (
      <div className="w-full animate-pulse space-y-10 mt-4">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-3">
            <div className="h-10 w-48 bg-slate-200 rounded-lg"></div>
            <div className="h-4 w-72 bg-slate-200 rounded"></div>
          </div>
          <div className="h-10 w-32 bg-slate-200 rounded-xl"></div>
        </div>

        {/* Main Stats Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="h-64 bg-slate-200 rounded-[2.5rem]"></div>
            <div className="h-64 bg-slate-200 rounded-[2.5rem]"></div>
          </div>
          <div className="h-64 bg-slate-200 rounded-[2.5rem]"></div>
        </div>

        {/* Accounts Skeleton */}
        <div className="space-y-6">
          <div className="h-8 w-40 bg-slate-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-40 bg-slate-200 rounded-3xl"></div>
            <div className="h-40 bg-slate-200 rounded-3xl"></div>
            <div className="h-40 bg-slate-200 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Welcome back, <span className="text-indigo-600 font-bold">{user?.firstName || 'User'}</span>! Here's your financial overview.
          </p>
        </div>
        <button
          onClick={() => dispatch(fetchDashboardSummary())}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all shadow-sm active:scale-95"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-sm font-semibold">Sync Data</span>
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Balance Card - High Fidelity Bank Card Look */}
          <div className="premium-card relative overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] text-white rounded-[2.5rem] shadow-2xl shadow-indigo-200 group transition-all duration-500 hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-400/20 transition-colors" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/10 rounded-full -ml-24 -mb-24 blur-3xl" />

            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-indigo-200/80 text-xs font-black uppercase tracking-[0.2em] mb-1">Available Balance</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-medium text-indigo-300">₹</span>
                  <span className="text-5xl font-black tracking-tighter">
                    {summary?.totalBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                  </span>
                </div>
              </div>
              <div className="w-14 h-10 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 flex items-center justify-center overflow-hidden">
                <div className="w-8 h-6 bg-amber-400/80 rounded-sm relative shadow-inner">
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-[1px] opacity-30">
                    {[...Array(6)].map((_, i) => <div key={i} className="border-[0.5px] border-black/20" />)}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4 text-indigo-100/40 font-mono text-lg tracking-[0.3em]">
                {summary?.accounts?.length > 0 ? (
                  <>
                    <span>****</span> <span>****</span>
                    <span className="text-white font-bold tracking-normal">
                      {summary.accounts[0].accountNumber.slice(-4)}
                    </span>
                  </>
                ) : (
                  <>
                    <span>****</span> <span>****</span> <span>****</span>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-indigo-500/20 backdrop-blur-md border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-100">
                    {summary?.accountCount || 0} {summary?.accountCount === 1 ? 'Primary Account' : 'Active Accounts'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-500/80 border border-white/20" />
                  <div className="w-8 h-8 rounded-full bg-amber-500/80 border border-white/20 -ml-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="premium-card p-6 sm:p-8 bg-white border border-slate-100 shadow-sm rounded-[2.5rem] flex flex-col justify-between">
            <h3 className="text-slate-800 text-lg font-black tracking-tight mb-6 sm:mb-8">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  onClick={action.onClick}
                  className="flex flex-col items-center gap-3 p-5 rounded-[2rem] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group active:scale-95"
                >
                  <div className={`w-14 h-14 rounded-2xl ${action.color} text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                    <action.icon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-black text-slate-500 group-hover:text-indigo-600 transition-colors">{action.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Savings Goals Card - More Detailed & Glowing */}
        <div className="premium-card p-6 sm:p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col border border-slate-800">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl" />

          <div className="flex justify-between items-center mb-8 sm:mb-10">
            <div>
              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Savings Goal</h3>
              <p className="text-3xl font-black tracking-tighter">Emergency Fund</p>
            </div>
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
              <LayoutGrid className="w-7 h-7 text-indigo-400" />
            </div>
          </div>

          <div className="space-y-8 flex-1 flex flex-col justify-center">
            <div>
              <div className="flex justify-between items-end mb-3">
                <span className="text-4xl font-black text-indigo-400 tracking-tighter">₹12,450<span className="text-xl text-slate-600">.00</span></span>
                <span className="text-slate-500 text-xs font-bold">of ₹20,000</span>
              </div>

              <div className="h-4 w-full bg-slate-800/50 rounded-full overflow-hidden p-1 relative border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 via-indigo-400 to-cyan-400 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-1000 ease-out"
                  style={{ width: '62%' }}
                />
              </div>
              <div className="flex justify-between mt-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progress</span>
                <span className="text-sm font-black text-indigo-400">62%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Daily Avg</p>
                <p className="text-sm font-black text-white">₹450.00</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">ETA</p>
                <p className="text-sm font-black text-white">18 Days</p>
              </div>
            </div>
          </div>

          <button className="mt-8 w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
            Customize Goal
          </button>
        </div>
      </div>

      {/* Individual Accounts Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-slate-800 text-xl font-black tracking-tight">My Accounts</h3>
          <button
            onClick={() => navigate('/dashboard/accounts')}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-bold hover:underline"
          >
            Manage Accounts
          </button>
        </div>

        {summary?.accounts?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {summary.accounts.map((account, index) => (
              <AccountSummaryCard key={account._id || index} account={account} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8" />
            </div>
            <h4 className="text-slate-800 font-black text-lg mb-2">No Accounts Found</h4>
            <p className="text-slate-500 font-medium mb-6">You don't have any active accounts yet. Open one to get started.</p>
            <button
              onClick={() => setIsOpeningAccount(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95 transition-all"
            >
              Open Account
            </button>
          </div>
        )}
      </div>

      {/* Transactions Section */}
      <div className="w-full">
        {/* Recent Transactions */}
        <div className="w-full premium-card p-4 sm:p-8 bg-white border border-slate-100 shadow-sm rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-8 px-2">
            <h3 className="text-slate-800 text-xl font-black tracking-tight">Recent Transactions</h3>
            <button 
              onClick={() => navigate('/dashboard/transactions')}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-bold hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {summary?.recentActivity?.map((tx, idx) => {
              const isReceiver = (tx.receiver?._id || tx.receiver) === user?._id;
              let isCredit = false;
              if (tx.type === 'DEPOSIT') isCredit = true;
              if (tx.type === 'WITHDRAW') isCredit = false;
              if (tx.type === 'TRANSFER') isCredit = isReceiver;

              return (
                <div 
                  key={tx._id || idx} 
                  onClick={() => handleViewDetails(tx)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 hover:bg-slate-50 transition-colors rounded-3xl group cursor-pointer gap-4 border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center
                      ${isCredit ? 'bg-emerald-50 text-emerald-600' : 
                        tx.type === 'TRANSFER' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}
                    `}>
                      {isCredit ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                    </div>
                    <div className="min-w-0 overflow-hidden">
                      <p className="text-slate-900 font-bold truncate">{tx.description || 'Transaction'}</p>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col justify-between items-end sm:text-right">
                    <p className={`font-black text-lg ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    <span className={`text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase
                      ${tx.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 
                        tx.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}
                    `}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}

            {(!summary?.recentActivity || summary.recentActivity.length === 0) && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Clock className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-bold text-sm">No recent transactions</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <CreateAccountModal
        isOpen={isOpeningAccount}
        onClose={() => setIsOpeningAccount(false)}
      />
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        accounts={summary?.accounts}
      />
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        accounts={summary?.accounts}
      />
      <TransactionDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        transaction={selectedTransaction} 
        currentUserId={user?._id} 
      />
    </div>
  );
};

export default DashboardHome;
