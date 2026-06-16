import React from 'react';
import { Search, Filter, X, Calendar, ArrowRight } from 'lucide-react';

const TransactionFilters = ({ filters, onFilterChange, onReset }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value === 'ALL' ? undefined : value });
  };

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-[2.5rem] p-6 lg:p-8 mb-10 overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
      
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            name="search"
            value={filters.search || ''}
            onChange={handleChange}
            placeholder="Search by ID or description..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filters Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:items-center gap-4">
          {/* Type Filter */}
          <div className="relative group/select">
            <select
              name="type"
              value={filters.type || 'ALL'}
              onChange={handleChange}
              className="appearance-none w-full lg:w-40 px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 cursor-pointer transition-all hover:bg-slate-100 pr-12"
            >
              <option value="ALL">All Types</option>
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAW">Withdraw</option>
              <option value="TRANSFER">Transfer</option>
            </select>
            <Filter className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover/select:text-indigo-600 transition-colors" />
          </div>

          {/* Status Filter */}
          <div className="relative group/select">
            <select
              name="status"
              value={filters.status || 'ALL'}
              onChange={handleChange}
              className="appearance-none w-full lg:w-40 px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 cursor-pointer transition-all hover:bg-slate-100 pr-12"
            >
              <option value="ALL">All Status</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500 animate-pulse pointer-events-none" />
          </div>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-3xl text-slate-500 font-bold hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all group active:scale-95"
          >
            <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Date & Amount Filter Row (Secondary) */}
      <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center gap-6">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            name="startDate"
            value={filters.startDate || ''}
            onChange={handleChange}
            className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <ArrowRight className="w-3 h-3 text-slate-300" />
          <input
            type="date"
            name="endDate"
            value={filters.endDate || ''}
            onChange={handleChange}
            className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto ml-auto">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Amount</span>
          <input
            type="number"
            name="minAmount"
            value={filters.minAmount || ''}
            onChange={handleChange}
            placeholder="Min"
            className="w-24 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <input
            type="number"
            name="maxAmount"
            value={filters.maxAmount || ''}
            onChange={handleChange}
            placeholder="Max"
            className="w-24 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;
