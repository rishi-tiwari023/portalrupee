import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyAccounts } from '../store/slices/accountSlice';
import {
  Plus,
  Search,
  Filter,
  CreditCard,
  Info,
  ArrowRight,
  RefreshCcw,
  AlertCircle
} from 'lucide-react';
import AccountSummaryCard from '../components/AccountSummaryCard';
import CreateAccountModal from '../components/CreateAccountModal';
import BalanceCheckModal from '../components/BalanceCheckModal';
import { useSearchParams } from 'react-router-dom';

const Accounts = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { accounts, loading, error } = useSelector((state) => state.account);
  const { user } = useSelector((state) => state.auth);

  const [isOpeningAccount, setIsOpeningAccount] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    dispatch(fetchMyAccounts());
  }, [dispatch]);

  useEffect(() => {
    const accountId = searchParams.get('id');
    if (accountId && accounts.length > 0) {
      const acc = accounts.find(a => a._id === accountId);
      if (acc) setSelectedAccount(acc);
    }
  }, [searchParams, accounts]);

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.accountNumber.includes(searchTerm) ||
      acc.accountType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'ALL' || acc.accountType === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            My Accounts
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Manage your savings and current accounts from one place.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(fetchMyAccounts())}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all active:scale-95 shadow-sm"
          >
            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsOpeningAccount(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Plus className="w-5 h-5" /> Open Account
          </button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Accounts</p>
            <p className="text-2xl font-black text-slate-900">{accounts.length}</p>
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <RefreshCcw className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active Accounts</p>
            <p className="text-2xl font-black text-slate-900">{accounts.filter(a => a.status === 'ACTIVE').length}</p>
          </div>
        </div>

        <div className="p-6 bg-indigo-600 rounded-[2rem] shadow-lg shadow-indigo-100 flex items-center gap-6 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 rounded-full bg-white/10 -mr-10 -mt-10 blur-xl" />
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 relative z-10">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">KYC Status</p>
            <p className="text-xl font-black">{user?.isVerified ? 'VERIFIED' : 'PENDING'}</p>
          </div>
        </div>
      </div>

      {/* Filters & Content */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-8 min-h-[500px]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Account Listing</h2>
            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
              {filteredAccounts.length} Result{filteredAccounts.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search account number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-full sm:w-auto">
              {['ALL', 'SAVINGS', 'CURRENT'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all
                      ${filterType === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}
                    `}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="font-bold text-slate-400 tracking-widest uppercase text-xs">Loading Accounts...</p>
          </div>
        ) : filteredAccounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredAccounts.map((account) => (
              <AccountSummaryCard key={account._id} account={account} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-6">
              {searchTerm ? <Search className="w-10 h-10" /> : <CreditCard className="w-10 h-10" />}
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">
              {searchTerm ? 'No accounts found' : 'No accounts active'}
            </h3>
            <p className="text-slate-500 font-medium max-w-xs mx-auto mb-8">
              {searchTerm
                ? "We couldn't find any account matching your search criteria."
                : "It looks like you don't have any bank accounts with us yet. Open one to start banking."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsOpeningAccount(true)}
                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Initialize Now
              </button>
            )}
          </div>
        )}
      </div>

      {/* Info Notice */}
      <div className="mt-10 p-6 bg-amber-50 border border-amber-100 rounded-[2rem] flex items-start gap-4">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
          <Info className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-black text-amber-900 tracking-tight">Account Policy Notice</h4>
          <p className="text-sm text-amber-800/80 font-medium mt-1 leading-relaxed">
            Customers are allowed one Savings and one Current account each. To open additional accounts or for corporate banking, please contact our support team.
          </p>
        </div>
      </div>

      {/* Modals */}
      <CreateAccountModal
        isOpen={isOpeningAccount}
        onClose={() => setIsOpeningAccount(false)}
      />

      <BalanceCheckModal
        isOpen={!!selectedAccount}
        onClose={() => setSelectedAccount(null)}
        account={selectedAccount}
      />
    </div>
  );
};

export default Accounts;
