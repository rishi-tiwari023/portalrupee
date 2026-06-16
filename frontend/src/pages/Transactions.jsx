import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions } from '../store/slices/transactionSlice';
import { fetchMyAccounts } from '../store/slices/accountSlice';
import { 
  Download, 
  History, 
  Info,
  Calendar,
  Filter as FilterIcon,
  RefreshCcw,
  ArrowRight,
  FileText
} from 'lucide-react';
import TransactionTable from '../components/TransactionTable';
import TransactionFilters from '../components/TransactionFilters';
import Pagination from '../components/Pagination';
import TransactionDetailsModal from '../components/TransactionDetailsModal';
import DownloadStatementModal from '../components/DownloadStatementModal';

const Transactions = () => {
  const dispatch = useDispatch();
  const { history, pagination, loading, error } = useSelector((state) => state.transaction);
  const { accounts } = useSelector((state) => state.account);
  const { user } = useSelector((state) => state.auth);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    type: undefined,
    status: undefined,
    startDate: undefined,
    endDate: undefined,
    minAmount: undefined,
    maxAmount: undefined,
    search: '',
  });

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);

  const loadTransactions = useCallback(() => {
    // Sanitize filters before sending to API
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')
    );
    dispatch(fetchTransactions(activeFilters));
  }, [dispatch, filters]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    dispatch(fetchMyAccounts());
  }, [dispatch]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleViewDetails = (tx) => {
    setSelectedTransaction(tx);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleReset = () => {
    setFilters({
      page: 1,
      limit: 10,
      type: undefined,
      status: undefined,
      startDate: undefined,
      endDate: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      search: '',
    });
  };

  const exportToCSV = () => {
    if (!history || history.length === 0) return;
    
    const headers = ['Date', 'ID', 'Description', 'Type', 'Amount', 'Status'];
    const rows = (history || []).map(tx => [
      new Date(tx.createdAt).toLocaleDateString(),
      tx.transactionId,
      tx.description,
      tx.type,
      tx.amount,
      tx.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PortalRupee_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && (!history || history.length === 0)) {
    return (
      <div className="w-full animate-pulse space-y-8 mt-4">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 bg-slate-100 rounded-2xl" />
               <div className="h-6 w-32 bg-slate-100 rounded-full" />
             </div>
             <div className="h-10 w-64 bg-slate-100 rounded-lg" />
             <div className="h-4 w-96 bg-slate-100 rounded" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-slate-100 rounded-2xl" />
            <div className="h-12 w-40 bg-slate-100 rounded-3xl" />
            <div className="h-12 w-40 bg-slate-100 rounded-3xl" />
          </div>
        </div>

        {/* Info Banner Skeleton */}
        <div className="h-16 w-full bg-slate-100 rounded-3xl" />

        {/* Filters Section Skeleton */}
        <div className="h-20 w-full bg-slate-100 rounded-[2rem]" />

        {/* Table Area Skeleton */}
        <div className="h-[500px] w-full bg-slate-100 rounded-[2.5rem]" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                <History className="w-5 h-5 text-white" />
             </div>
             <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
                Activity Ledger
             </h4>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Transactions
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Track and manage all your banking activities with advanced filtering.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadTransactions}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-95 group"
            title="Refresh"
          >
            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          </button>

          <button
            onClick={() => setIsStatementModalOpen(true)}
            className="flex items-center gap-2 px-6 py-4 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-3xl font-black text-sm hover:bg-indigo-100 hover:border-indigo-200 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">PDF Statement</span>
          </button>

          <button
            onClick={exportToCSV}
            disabled={!history || history.length === 0}
            className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-3xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-8 p-4 bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100/50 dark:border-indigo-800/30 rounded-3xl flex items-center gap-4">
         <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center flex-shrink-0 font-bold">
            <Info className="w-4 h-4" />
         </div>
         <p className="text-xs font-bold text-slate-600 leading-relaxed">
            Transactions are processed in real-time. Transfers between PortalRupee accounts are instant.
         </p>
      </div>

      {/* Filters Section */}
      <TransactionFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onReset={handleReset}
      />

      {/* Main Content Area */}
      <div className="relative">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold flex items-center gap-3">
             <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
             {error}
          </div>
        )}

        <div className="premium-card bg-white/40 backdrop-blur-sm border border-white rounded-[2.5rem] p-4 lg:p-8">
           <TransactionTable 
             transactions={history} 
             isLoading={loading} 
             currentUserId={user?._id}
             onViewDetails={handleViewDetails}
           />
           <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </div>
      </div>

      <TransactionDetailsModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        transaction={selectedTransaction} 
        currentUserId={user?._id} 
      />

      <DownloadStatementModal
        isOpen={isStatementModalOpen}
        onClose={() => setIsStatementModalOpen(false)}
        accounts={accounts}
      />

      {/* Footer Insight */}
      <div className="mt-12 text-center pb-10">
         <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Secured by PortalRupee Transaction Guard</p>
         <div className="flex items-center justify-center gap-4 opacity-30 grayscale contrast-125">
            <div className="w-12 h-6 bg-slate-400 rounded-lg" />
            <div className="w-12 h-4 bg-slate-400 rounded-lg" />
            <div className="w-8 h-8 bg-slate-400 rounded-full" />
         </div>
      </div>
    </div>
  );
};

export default Transactions;
