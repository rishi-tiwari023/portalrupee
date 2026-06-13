import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users as UsersIcon,
  ShieldAlert,
  Search,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Building,
  CreditCard,
  TrendingUp,
  Award,
  X,
  FileText,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Activity,
  History
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  fetchAdminStats,
  fetchKycQueue,
  updateKycStatus,
  listUsers,
  updateUserRole
} from '../store/slices/adminSlice';
import api from '../api/axios';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const ROLE_COLORS = {
  CUSTOMER: 'bg-blue-50 text-blue-700 border-blue-100',
  CASHIER: 'bg-amber-50 text-amber-700 border-amber-100',
  MANAGER: 'bg-purple-50 text-purple-700 border-purple-100'
};

const KYC_COLORS = {
  NOT_STARTED: 'bg-slate-50 text-slate-700 border-slate-100',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
  VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-100'
};

const TRANSACTION_STATUS_COLORS = {
  SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
  FAILED: 'bg-rose-50 text-rose-700 border-rose-100'
};

const TYPE_COLORS = {
  DEPOSIT: '#10b981', // Emerald
  WITHDRAW: '#f43f5e', // Rose
  TRANSFER: '#6366f1' // Indigo
};

const Users = () => {
  const dispatch = useDispatch();
  
  // Slice State
  const {
    stats,
    kycQueue,
    usersList,
    totalUsers,
    currentPage,
    limit,
    statsLoading,
    kycLoading,
    usersLoading,
    loading: actionLoading,
    error
  } = useSelector((state) => state.admin);

  // Tabs: 'overview', 'kyc', 'directory'
  const [activeTab, setActiveTab] = useState('overview');

  // Directory Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [kycFilter, setKycFilter] = useState('');

  // KYC Secure Document Viewer Modal
  const [viewingKyc, setViewingKyc] = useState(null);
  const [loadingKycDoc, setLoadingKycDoc] = useState(false);

  useEffect(() => {
    if (activeTab === 'overview') {
      dispatch(fetchAdminStats());
    } else if (activeTab === 'kyc') {
      dispatch(fetchKycQueue());
    } else if (activeTab === 'directory') {
      loadUsersDirectory(1);
    }
  }, [dispatch, activeTab]);

  const loadUsersDirectory = (page) => {
    dispatch(listUsers({
      page,
      limit,
      role: roleFilter || undefined,
      kycStatus: kycFilter || undefined,
      search: searchTerm || undefined
    }));
  };

  // Trigger search on typing/filters
  useEffect(() => {
    if (activeTab === 'directory') {
      loadUsersDirectory(1);
    }
  }, [searchTerm, roleFilter, kycFilter]);

  const handleKycAudit = async (id, status) => {
    try {
      await dispatch(updateKycStatus({ id, status })).unwrap();
      toast.success(`KYC request successfully ${status.toLowerCase()}ed!`);
      if (viewingKyc) {
        setViewingKyc(null);
      }
    } catch (err) {
      toast.error(err || 'Failed to update KYC status.');
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await dispatch(updateUserRole({ userId, role })).unwrap();
      toast.success(`User role successfully changed to ${role}!`);
    } catch (err) {
      toast.error(err || 'Failed to update user role.');
    }
  };

  const handleLoadKycDocs = async (user) => {
    setLoadingKycDoc(true);
    try {
      let idUrl = null;
      let sigUrl = null;
      
      if (user.kycDocumentKey) {
        const resId = await api.get(`/uploads/url/${user.kycDocumentKey}`);
        idUrl = resId.data.url;
      }
      if (user.kycSignatureKey) {
        const resSig = await api.get(`/uploads/url/${user.kycSignatureKey}`);
        sigUrl = resSig.data.url;
      }

      setViewingKyc({
        ...user,
        kycDocumentUrl: idUrl,
        kycSignatureUrl: sigUrl
      });
    } catch (err) {
      toast.error('Failed to load secure KYC documents.');
    } finally {
      setLoadingKycDoc(false);
    }
  };

  const formatCurrency = (val) => {
    return (val || 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
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

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Manager Admin Panel
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Analyze system statistics, process KYC queues, and manage user directories.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-100/50 p-2 rounded-3xl border border-white/50 w-fit">
          {[
            { id: 'overview', name: 'Overview & Stats', icon: TrendingUp },
            { id: 'kyc', name: `KYC Queue (${kycQueue.length || 0})`, icon: ShieldAlert },
            { id: 'directory', name: 'User Directory', icon: UsersIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black tracking-wider uppercase transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-500/5 border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon size={14} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-10"
          >
            {statsLoading && !stats ? (
              <div className="w-full animate-pulse space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-slate-100 rounded-[2rem]" />
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 h-96 bg-slate-100 rounded-[2.5rem]" />
                  <div className="h-96 bg-slate-100 rounded-[2.5rem]" />
                </div>
              </div>
            ) : stats ? (
              <>
                {/* KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Users */}
                  <div className="premium-card p-6 bg-white border border-slate-100 shadow-sm rounded-[2rem] flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Users</span>
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                        <UsersIcon className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-3xl font-black text-slate-900 tracking-tight">
                        {stats.users?.total}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase mt-2">
                        {stats.users?.byRole?.CUSTOMER} Customers &bull; {stats.users?.byRole?.MANAGER} Managers
                      </p>
                    </div>
                  </div>

                  {/* Total Accounts */}
                  <div className="premium-card p-6 bg-white border border-slate-100 shadow-sm rounded-[2rem] flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Accounts</span>
                      <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
                        <Building className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-3xl font-black text-slate-900 tracking-tight">
                        {stats.accounts?.total}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase mt-2">active savings/current wallets</p>
                    </div>
                  </div>

                  {/* Total System Balance */}
                  <div className="premium-card p-6 bg-white border border-slate-100 shadow-sm rounded-[2rem] flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Balance</span>
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                        <CreditCard className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-3xl font-black text-slate-900 tracking-tight">
                        {formatCurrency(stats.accounts?.totalBalance)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase mt-2">aggregated user funds</p>
                    </div>
                  </div>

                  {/* Total Transaction Volume */}
                  <div className="premium-card p-6 bg-white border border-slate-100 shadow-sm rounded-[2rem] flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction Volume</span>
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-3xl font-black text-slate-900 tracking-tight">
                        {formatCurrency(stats.transactions?.totalVolume)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase mt-2">
                        across {stats.transactions?.totalCount} system transactions
                      </p>
                    </div>
                  </div>
                </div>

                {/* Analytical Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Transaction Volumes by Method */}
                  <div className="lg:col-span-2 premium-card p-6 sm:p-8 bg-white border border-slate-100 shadow-sm rounded-[2.5rem]">
                    <h3 className="text-slate-800 text-lg font-black tracking-tight mb-6 flex items-center gap-2">
                      <Activity size={18} className="text-indigo-600" />
                      <span>Volume & count by transaction type</span>
                    </h3>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Deposits', value: stats.transactions?.byType?.DEPOSIT?.volume, count: stats.transactions?.byType?.DEPOSIT?.count, color: TYPE_COLORS.DEPOSIT },
                            { name: 'Withdrawals', value: stats.transactions?.byType?.WITHDRAW?.volume, count: stats.transactions?.byType?.WITHDRAW?.count, color: TYPE_COLORS.WITHDRAW },
                            { name: 'Transfers', value: stats.transactions?.byType?.TRANSFER?.volume, count: stats.transactions?.byType?.TRANSFER?.count, color: TYPE_COLORS.TRANSFER }
                          ]}
                          margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
                        >
                          <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 'bold' }}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const d = payload[0].payload;
                                return (
                                  <div className="bg-slate-900/90 text-white p-4 rounded-2xl shadow-xl border border-slate-800 backdrop-blur-md text-xs font-sans">
                                    <p className="font-black text-sm mb-1" style={{ color: d.color }}>{d.name}</p>
                                    <p className="font-bold">Total Volume: <span className="text-indigo-300">{formatCurrency(d.value)}</span></p>
                                    <p className="text-slate-400">Total Count: {d.count}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={50}>
                            <Cell fill={TYPE_COLORS.DEPOSIT} />
                            <Cell fill={TYPE_COLORS.WITHDRAW} />
                            <Cell fill={TYPE_COLORS.TRANSFER} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* KYC Queue Distribution */}
                  <div className="premium-card p-6 sm:p-8 bg-white border border-slate-100 shadow-sm rounded-[2.5rem] flex flex-col justify-between">
                    <h3 className="text-slate-800 text-lg font-black tracking-tight mb-6">KYC Status Share</h3>
                    
                    <div className="h-52 w-full relative mb-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Not Started', value: stats.users?.byKycStatus?.NOT_STARTED, color: '#64748b' },
                              { name: 'Pending', value: stats.users?.byKycStatus?.PENDING, color: '#f59e0b' },
                              { name: 'Verified', value: stats.users?.byKycStatus?.VERIFIED, color: '#10b981' },
                              { name: 'Rejected', value: stats.users?.byKycStatus?.REJECTED, color: '#f43f5e' }
                            ]}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={3}
                          >
                            <Cell fill="#64748b" />
                            <Cell fill="#f59e0b" />
                            <Cell fill="#10b981" />
                            <Cell fill="#f43f5e" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Users</span>
                        <span className="text-2xl font-black text-slate-900 mt-0.5">{stats.users?.total}</span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { name: 'Not Started', count: stats.users?.byKycStatus?.NOT_STARTED, color: 'bg-slate-400' },
                        { name: 'Pending Approval', count: stats.users?.byKycStatus?.PENDING, color: 'bg-amber-500' },
                        { name: 'Verified', count: stats.users?.byKycStatus?.VERIFIED, color: 'bg-emerald-500' },
                        { name: 'Rejected', count: stats.users?.byKycStatus?.REJECTED, color: 'bg-rose-500' }
                      ].map((k) => (
                        <div key={k.name} className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${k.color}`} />
                            <span className="font-bold text-slate-600">{k.name}</span>
                          </div>
                          <span className="font-extrabold text-slate-950">{k.count || 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Audit & Transaction tables */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* System Transactions */}
                  <div className="premium-card p-6 sm:p-8 bg-white border border-slate-100 shadow-sm rounded-[2.5rem] space-y-6">
                    <h3 className="text-slate-800 text-lg font-black tracking-tight flex items-center gap-2">
                      <Activity size={18} className="text-indigo-600" />
                      <span>Recent System Transactions</span>
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="pb-3 pr-2">Txn ID</th>
                            <th className="pb-3 px-2">Sender</th>
                            <th className="pb-3 px-2">Receiver</th>
                            <th className="pb-3 px-2 text-right">Amount</th>
                            <th className="pb-3 px-2">Type</th>
                            <th className="pb-3 pl-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentTransactions?.map((txn) => (
                            <tr key={txn._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 pr-2 font-black text-slate-800 tracking-wide">{txn.transactionId}</td>
                              <td className="py-3 px-2 font-medium text-slate-600 max-w-[120px] truncate">
                                {txn.sender ? `${txn.sender.firstName} ${txn.sender.lastName}` : (txn.senderAccount?.accountNumber ? `ACC-${txn.senderAccount.accountNumber}` : 'System')}
                              </td>
                              <td className="py-3 px-2 font-medium text-slate-600 max-w-[120px] truncate">
                                {txn.receiver ? `${txn.receiver.firstName} ${txn.receiver.lastName}` : (txn.receiverAccount?.accountNumber ? `ACC-${txn.receiverAccount.accountNumber}` : 'System')}
                              </td>
                              <td className="py-3 px-2 font-black text-slate-900 text-right">{formatCurrency(txn.amount)}</td>
                              <td className="py-3 px-2 font-bold text-indigo-600">{txn.type}</td>
                              <td className="py-3 pl-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${TRANSACTION_STATUS_COLORS[txn.status] || 'bg-slate-100 text-slate-700'}`}>
                                  {txn.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {(!stats.recentTransactions || stats.recentTransactions.length === 0) && (
                            <tr>
                              <td colSpan="6" className="py-10 text-center text-slate-400 font-medium">No recent transactions.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Audit Logs */}
                  <div className="premium-card p-6 sm:p-8 bg-white border border-slate-100 shadow-sm rounded-[2.5rem] space-y-6">
                    <h3 className="text-slate-800 text-lg font-black tracking-tight flex items-center gap-2">
                      <History size={18} className="text-indigo-600" />
                      <span>Recent Audit Logs</span>
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="pb-3 pr-2">Actor</th>
                            <th className="pb-3 px-2">Action</th>
                            <th className="pb-3 px-2">Resource</th>
                            <th className="pb-3 px-2">Time</th>
                            <th className="pb-3 pl-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentAuditLogs?.map((log) => (
                            <tr key={log._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 pr-2 font-bold text-slate-800 truncate max-w-[150px]">
                                {log.actor === 'SYSTEM' ? 'SYSTEM' : (log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : 'Guest/Auth')}
                              </td>
                              <td className="py-3 px-2 font-black text-indigo-600 tracking-wide">{log.action}</td>
                              <td className="py-3 px-2 font-semibold text-slate-500">{log.resource}</td>
                              <td className="py-3 px-2 font-medium text-slate-400">{formatDate(log.createdAt)}</td>
                              <td className="py-3 pl-2">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-wider ${log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {(!stats.recentAuditLogs || stats.recentAuditLogs.length === 0) && (
                            <tr>
                              <td colSpan="5" className="py-10 text-center text-slate-400 font-medium">No recent audit logs.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </motion.div>
        )}

        {/* KYC AUDIT QUEUE TAB */}
        {activeTab === 'kyc' && (
          <motion.div
            key="kyc"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {kycLoading && kycQueue.length === 0 ? (
              <div className="w-full flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : kycQueue.length === 0 ? (
              <div className="p-16 text-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 max-w-xl mx-auto">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4 animate-bounce" />
                <h4 className="text-slate-800 font-black text-xl mb-1">Queue is Empty</h4>
                <p className="text-slate-500 text-sm font-medium">
                  Awesome! All customer identity verifications have been fully audited. No pending submissions in the queue.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {kycQueue.map((user) => (
                  <motion.div
                    key={user._id}
                    layoutId={user._id}
                    className="premium-card p-6 bg-white border border-slate-100 shadow-sm rounded-3xl flex flex-col justify-between relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-slate-900 font-black text-lg">{user.firstName} {user.lastName}</h4>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">{user.email} &bull; {user.mobile}</p>
                      </div>
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-black rounded uppercase tracking-wider">
                        <Clock size={10} />
                        <span>Awaiting Audit</span>
                      </span>
                    </div>

                    <div className="my-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-slate-400" />
                        <span className="font-bold">KYC Documents Attached</span>
                      </div>
                      <button
                        onClick={() => handleLoadKycDocs(user)}
                        disabled={loadingKycDoc}
                        className="text-xs font-black text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {loadingKycDoc ? 'Loading...' : 'Inspect Proofs'}
                        <ExternalLink size={12} />
                      </button>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleKycAudit(user._id, 'VERIFIED')}
                        disabled={actionLoading}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs tracking-wider uppercase shadow-lg shadow-emerald-500/10 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 size={14} />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleKycAudit(user._id, 'REJECTED')}
                        disabled={actionLoading}
                        className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 rounded-2xl font-black text-xs tracking-wider uppercase active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <XCircle size={14} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* USER DIRECTORY TAB */}
        {activeTab === 'directory' && (
          <motion.div
            key="directory"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Filters Bar */}
            <div className="bg-white border border-slate-100 shadow-sm p-4 rounded-3xl flex flex-col xl:flex-row items-center gap-4">
              {/* Search Box */}
              <div className="flex items-center gap-3 bg-slate-100/50 px-4 py-2.5 rounded-2xl border border-white/50 w-full xl:max-w-md group focus-within:bg-white focus-within:shadow-md transition-all">
                <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600" />
                <input
                  type="text"
                  placeholder="Search by name, email, or mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs font-semibold text-slate-700 placeholder:text-slate-400 w-full"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto ml-auto">
                {/* Role Filter */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-2 rounded-2xl text-xs">
                  <Filter size={12} className="text-slate-400" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-transparent outline-none font-bold text-slate-600 cursor-pointer"
                  >
                    <option value="">All Roles</option>
                    <option value="CUSTOMER">Customer</option>
                    <option value="CASHIER">Cashier</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                </div>

                {/* KYC Filter */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-2 rounded-2xl text-xs">
                  <Filter size={12} className="text-slate-400" />
                  <select
                    value={kycFilter}
                    onChange={(e) => setKycFilter(e.target.value)}
                    className="bg-transparent outline-none font-bold text-slate-600 cursor-pointer"
                  >
                    <option value="">All KYC Statuses</option>
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="PENDING">Pending Approval</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table Display */}
            {usersLoading && usersList.length === 0 ? (
              <div className="w-full flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : usersList.length === 0 ? (
              <div className="p-16 text-center border border-slate-100 rounded-3xl bg-white shadow-sm">
                <UsersIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h4 className="text-slate-800 font-black text-lg mb-1">No Users Found</h4>
                <p className="text-slate-500 text-xs font-semibold max-w-sm mx-auto">
                  We couldn't find any users matching your criteria. Try adjusting your query or filter keywords.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 shadow-sm rounded-[2rem] overflow-hidden p-6 space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-4 pr-3">Name</th>
                        <th className="pb-4 px-3">Contact</th>
                        <th className="pb-4 px-3">Registered</th>
                        <th className="pb-4 px-3">KYC Status</th>
                        <th className="pb-4 pl-3">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((user) => (
                        <tr key={user._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 pr-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/30 flex items-center justify-center font-black text-indigo-700 text-xs">
                                {user.firstName[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase() || ''}
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-900 block text-sm">{user.firstName} {user.lastName}</span>
                                <span className="text-[10px] text-slate-400 font-semibold block">{user._id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-3 font-medium text-slate-600">
                            <div>{user.email}</div>
                            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{user.mobile}</div>
                          </td>
                          <td className="py-4 px-3 font-semibold text-slate-500">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="py-4 px-3">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${KYC_COLORS[user.kycStatus] || 'bg-slate-100 text-slate-700'}`}>
                              {user.kycStatus === 'PENDING' ? 'Awaiting Audit' : user.kycStatus.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-4 pl-3">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user._id, e.target.value)}
                              disabled={actionLoading}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black border uppercase tracking-wider outline-none cursor-pointer border-slate-200 bg-white hover:bg-slate-50 ${ROLE_COLORS[user.role] || 'bg-slate-100 text-slate-700'}`}
                            >
                              <option value="CUSTOMER">Customer</option>
                              <option value="CASHIER">Cashier</option>
                              <option value="MANAGER">Manager</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalUsers > limit && (
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 text-xs font-bold text-slate-500">
                    <span>Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalUsers)} of {totalUsers} users</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => loadUsersDirectory(currentPage - 1)}
                        disabled={currentPage === 1 || usersLoading}
                        className="w-9 h-9 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="w-8 text-center text-slate-900 font-extrabold">{currentPage}</span>
                      <button
                        onClick={() => loadUsersDirectory(currentPage + 1)}
                        disabled={currentPage * limit >= totalUsers || usersLoading}
                        className="w-9 h-9 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECURE KYC INSPECTION MODAL */}
      <AnimatePresence>
        {viewingKyc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex bg-slate-900/60 backdrop-blur-sm p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-5xl h-full bg-white rounded-[2rem] border border-slate-100 shadow-2xl flex flex-col mx-auto overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">KYC Auditing for {viewingKyc.firstName} {viewingKyc.lastName}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{viewingKyc.email} &bull; {viewingKyc.mobile}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingKyc(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all active:scale-95"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Documents content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-slate-50/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                  {/* Doc 1: Identity doc */}
                  <div className="flex flex-col h-full space-y-3">
                    <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                      <FileText size={14} className="text-indigo-500" />
                      <span>1. Government ID Document Specimen</span>
                    </h4>
                    <div className="flex-1 min-h-[300px] md:min-h-0 bg-slate-100 border border-slate-200/50 rounded-2xl overflow-hidden relative flex items-center justify-center">
                      {viewingKyc.kycDocumentUrl ? (
                        viewingKyc.kycDocumentKey?.match(/\.(pdf)$/i) ? (
                          <iframe
                            src={viewingKyc.kycDocumentUrl}
                            title="Government ID Specimen"
                            className="w-full h-full border-none bg-white"
                          />
                        ) : (
                          <img
                            src={viewingKyc.kycDocumentUrl}
                            alt="Government ID Specimen"
                            className="max-w-full max-h-full object-contain"
                          />
                        )
                      ) : (
                        <span className="text-xs text-slate-400 font-bold uppercase">No Document Preview Available</span>
                      )}
                    </div>
                  </div>

                  {/* Doc 2: Signature doc */}
                  <div className="flex flex-col h-full space-y-3">
                    <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                      <FileText size={14} className="text-indigo-500" />
                      <span>2. Signature Specimen</span>
                    </h4>
                    <div className="flex-1 min-h-[300px] md:min-h-0 bg-slate-100 border border-slate-200/50 rounded-2xl overflow-hidden relative flex items-center justify-center">
                      {viewingKyc.kycSignatureUrl ? (
                        viewingKyc.kycSignatureKey?.match(/\.(pdf)$/i) ? (
                          <iframe
                            src={viewingKyc.kycSignatureUrl}
                            title="Signature Specimen"
                            className="w-full h-full border-none bg-white"
                          />
                        ) : (
                          <img
                            src={viewingKyc.kycSignatureUrl}
                            alt="Signature Specimen"
                            className="max-w-full max-h-full object-contain hover:scale-105 transition-transform cursor-zoom-in"
                          />
                        )
                      ) : (
                        <span className="text-xs text-slate-400 font-bold uppercase">No Document Preview Available</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer actions */}
              <div className="p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-slate-400" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide leading-relaxed">
                    Verify carefully that matching metadata profiles reflect identical signatures and biometric photo parameters.
                  </span>
                </div>

                <div className="flex gap-4 w-full sm:w-auto">
                  <button
                    onClick={() => handleKycAudit(viewingKyc._id, 'VERIFIED')}
                    disabled={actionLoading}
                    className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs tracking-wider uppercase active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} />
                    <span>Approve KYC</span>
                  </button>
                  <button
                    onClick={() => handleKycAudit(viewingKyc._id, 'REJECTED')}
                    disabled={actionLoading}
                    className="flex-1 sm:flex-none px-6 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 rounded-2xl font-black text-xs tracking-wider uppercase active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <XCircle size={14} />
                    <span>Reject KYC</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users;
