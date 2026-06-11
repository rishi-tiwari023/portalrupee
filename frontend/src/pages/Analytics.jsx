import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExpenditureAnalytics } from '../store/slices/analyticsSlice';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CreditCard,
  DollarSign,
  PieChart as PieIcon,
  BarChart3 as BarIcon,
  Inbox,
  AlertCircle,
  RefreshCcw
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';

const CATEGORY_COLORS = {
  'Food & Dining': '#6366f1',       // Indigo
  'Utilities & Bills': '#f59e0b',   // Amber
  'Shopping': '#ec4899',            // Pink
  'Travel & Transport': '#06b6d4',  // Cyan
  'Investment & Savings': '#10b981',// Emerald
  'Transfer Out': '#8b5cf6',        // Violet
  'Cash Withdrawal': '#f43f5e',     // Rose
  'Other': '#64748b'                // Slate
};

const TYPE_COLORS = {
  'TRANSFER': '#6366f1',
  'WITHDRAW': '#f43f5e'
};

const Analytics = () => {
  const dispatch = useDispatch();
  const { analyticsData, loading, error } = useSelector((state) => state.analytics);

  const [timeRange, setTimeRange] = useState('30d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customRangeApplied, setCustomRangeApplied] = useState(false);

  useEffect(() => {
    if (timeRange !== 'custom') {
      dispatch(fetchExpenditureAnalytics({ timeRange }));
    }
  }, [dispatch, timeRange]);

  const handleApplyCustomRange = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    setCustomRangeApplied(true);
    dispatch(fetchExpenditureAnalytics({ timeRange: 'custom', startDate, endDate }));
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    if (range !== 'custom') {
      setCustomRangeApplied(false);
      setStartDate('');
      setEndDate('');
    }
  };

  // Helper to format currency
  const formatCurrency = (val) => {
    return (val || 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  // Custom tooltips for Recharts
  const CustomTrendTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 text-white p-4 rounded-2xl shadow-xl border border-slate-800 backdrop-blur-md text-xs font-sans">
          <p className="text-slate-400 font-bold uppercase tracking-wider mb-1">
            {payload[0].payload.date}
          </p>
          <p className="text-sm font-black text-indigo-400">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { category, amount, percentage, count } = payload[0].payload;
      return (
        <div className="bg-slate-900/90 text-white p-4 rounded-2xl shadow-xl border border-slate-800 backdrop-blur-md text-xs font-sans">
          <p className="font-black text-sm mb-1" style={{ color: CATEGORY_COLORS[category] || '#fff' }}>
            {category}
          </p>
          <div className="space-y-1">
            <p className="font-bold">Total: <span className="text-indigo-300">{formatCurrency(amount)}</span></p>
            <p className="text-slate-400">Share: {percentage}%</p>
            <p className="text-slate-400">Transactions: {count}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Loading skeleton layout
  if (loading && !analyticsData) {
    return (
      <div className="w-full animate-pulse space-y-10">
        <div className="h-20 bg-slate-100 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-[2rem]" />
          ))}
        </div>
        <div className="h-44 bg-slate-100 rounded-[2.5rem]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-slate-100 rounded-[2.5rem]" />
          <div className="h-96 bg-slate-100 rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  // Handle errors
  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-center bg-white/50 backdrop-blur-sm rounded-[2.5rem] border border-white p-8">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
        <h3 className="text-xl font-black text-slate-800 mb-2">Failed to load analytics</h3>
        <p className="text-slate-500 font-medium max-w-md mb-6">{error}</p>
        <button
          onClick={() => dispatch(fetchExpenditureAnalytics({ timeRange: '30d' }))}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all hover:bg-indigo-500"
        >
          <RefreshCcw className="w-4 h-4" />
          Retry Request
        </button>
      </div>
    );
  }

  // Retrieve variables
  const data = analyticsData || {
    summary: { totalSpent: 0, prevTotalSpent: 0, percentageChange: 0, averageTransactionSize: 0, maxTransactionSize: 0, totalTransactions: 0 },
    inflowVsOutflow: { inflow: 0, outflow: 0, netSavings: 0 },
    spendingTrend: [],
    categoryBreakdown: [],
    typeBreakdown: []
  };

  const { summary: stats, inflowVsOutflow: flow, spendingTrend: trend, categoryBreakdown: categories, typeBreakdown: types } = data;

  const isNoData = stats.totalSpent === 0 && flow.inflow === 0;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header & Filter Section */}
      <div className="mb-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Expenditure Analytics
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Dive deep into your cashflows, spending trends, and category distribution.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-100/50 p-2 rounded-3xl border border-white/50 w-fit">
          {['7d', '30d', '12m', 'custom'].map((range) => (
            <button
              key={range}
              onClick={() => handleTimeRangeChange(range)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black tracking-wider uppercase transition-all duration-300 ${
                timeRange === range
                  ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-500/5 border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '12m' ? '12 Months' : 'Custom'}
            </button>
          ))}
        </div>
      </div>

      {/* Custom range inputs */}
      {timeRange === 'custom' && (
        <form onSubmit={handleApplyCustomRange} className="mb-10 p-6 bg-white border border-slate-100 shadow-sm rounded-[2rem] flex flex-col md:flex-row md:items-end gap-6 max-w-3xl animate-in fade-in duration-500">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white text-sm text-slate-700 transition-all font-semibold"
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              min={startDate}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white text-sm text-slate-700 transition-all font-semibold"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-xs tracking-wider uppercase hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all active:scale-95 whitespace-nowrap"
          >
            Apply Range
          </button>
        </form>
      )}

      {/* Main content display */}
      {isNoData ? (
        <div className="p-20 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50">
          <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Inbox className="w-10 h-10" />
          </div>
          <h4 className="text-slate-800 font-black text-2xl mb-2">No Transactions Found</h4>
          <p className="text-slate-500 font-medium max-w-md mx-auto mb-6">
            We couldn't find any successful withdrawals or transfers for this timeframe. Go make some transactions to see your spending analytics!
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* KPI Dashboard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Spent */}
            <div className="premium-card p-6 bg-white border border-slate-100 shadow-sm rounded-[2rem] flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Spent</span>
                <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-black text-slate-900 tracking-tight">
                  {formatCurrency(stats.totalSpent)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                    stats.percentageChange > 0 
                      ? 'bg-rose-50 text-rose-600' 
                      : stats.percentageChange < 0 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-slate-50 text-slate-500'
                  }`}>
                    {stats.percentageChange > 0 ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : stats.percentageChange < 0 ? <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> : null}
                    {Math.abs(stats.percentageChange)}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">vs last period</span>
                </div>
              </div>
            </div>

            {/* Average size */}
            <div className="premium-card p-6 bg-white border border-slate-100 shadow-sm rounded-[2rem] flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Average Expense</span>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-black text-slate-900 tracking-tight">
                  {formatCurrency(stats.averageTransactionSize)}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-2">per transaction</p>
              </div>
            </div>

            {/* Max size */}
            <div className="premium-card p-6 bg-white border border-slate-100 shadow-sm rounded-[2rem] flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Largest Expense</span>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-black text-slate-900 tracking-tight">
                  {formatCurrency(stats.maxTransactionSize)}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-2">single payment peak</p>
              </div>
            </div>

            {/* Transactions Count */}
            <div className="premium-card p-6 bg-white border border-slate-100 shadow-sm rounded-[2rem] flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transactions Count</span>
                <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <BarIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-black text-slate-900 tracking-tight">
                  {stats.totalTransactions}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-2">successful outflows</p>
              </div>
            </div>
          </div>

          {/* Inflow vs Outflow Compare Track */}
          <div className="premium-card p-6 sm:p-8 bg-white border border-slate-100 shadow-sm rounded-[2.5rem]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-slate-800 text-lg font-black tracking-tight">Cash Inflow vs Outflow</h3>
              <span className={`text-xs font-black px-4 py-2 rounded-2xl tracking-wider uppercase border ${
                flow.netSavings >= 0 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                  : 'bg-rose-50 text-rose-700 border-rose-100'
              }`}>
                {flow.netSavings >= 0 ? 'Net Savings: ' : 'Net Deficit: '} 
                {formatCurrency(Math.abs(flow.netSavings))}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-xs font-black uppercase tracking-wider text-slate-400">
                <span className="flex items-center text-emerald-600"><ArrowDownLeft className="w-4 h-4 mr-1" /> Inflow: {formatCurrency(flow.inflow)}</span>
                <span className="flex items-center text-rose-600">Outflow: {formatCurrency(flow.outflow)} <ArrowUpRight className="w-4 h-4 ml-1" /></span>
              </div>

              {/* Progress gauge tracks */}
              <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden p-1 flex gap-1 relative border border-slate-200/50">
                {flow.inflow + flow.outflow > 0 ? (
                  <>
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(flow.inflow / (flow.inflow + flow.outflow)) * 100}%` }}
                    />
                    <div 
                      className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(flow.outflow / (flow.inflow + flow.outflow)) * 100}%` }}
                    />
                  </>
                ) : (
                  <div className="h-full w-full bg-slate-200 rounded-full" />
                )}
              </div>
              
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                <span>{flow.inflow + flow.outflow > 0 ? `${Math.round((flow.inflow / (flow.inflow + flow.outflow)) * 100)}% Inflow` : '0%'}</span>
                <span>{flow.inflow + flow.outflow > 0 ? `${Math.round((flow.outflow / (flow.inflow + flow.outflow)) * 100)}% Outflow` : '0%'}</span>
              </div>
            </div>
          </div>

          {/* Main Visual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chronological Spending Trend (Area Chart) */}
            <div className="lg:col-span-2 premium-card p-6 sm:p-8 bg-white border border-slate-100 shadow-sm rounded-[2.5rem]">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-slate-800 text-lg font-black tracking-tight">Spending Trend</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Chronological cash outflows</p>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                    <XAxis 
                      dataKey="date" 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                      tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} 
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      dx={-10}
                      tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} 
                    />
                    <Tooltip content={<CustomTrendTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#6366f1" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorSpent)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Breakdown (Pie/Donut Chart) */}
            <div className="premium-card p-6 sm:p-8 bg-white border border-slate-100 shadow-sm rounded-[2.5rem] flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600">
                  <PieIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-slate-800 text-lg font-black tracking-tight">Expenses by Category</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Distribution of categories</p>
                </div>
              </div>

              {/* Pie display */}
              <div className="h-56 w-full relative mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Pie
                      data={categories}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {categories.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CATEGORY_COLORS[entry.category] || CATEGORY_COLORS['Other']} 
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Spent</span>
                  <span className="text-xl font-black text-slate-900 mt-0.5">{formatCurrency(stats.totalSpent)}</span>
                </div>
              </div>

              {/* List of categories with custom legend details */}
              <div className="flex-1 overflow-y-auto max-h-48 space-y-3 pr-2 no-scrollbar">
                {categories.map((item, index) => (
                  <div key={item.category || index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Other'] }}
                      />
                      <span className="font-bold text-slate-700 truncate">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-3 pl-2 text-right">
                      <span className="text-slate-900 font-black">{formatCurrency(item.amount)}</span>
                      <span className="text-slate-400 font-semibold text-[10px] w-8">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Type Breakdown Grid */}
          <div className="premium-card p-6 sm:p-8 bg-white border border-slate-100 shadow-sm rounded-[2.5rem] max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600">
                <BarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-slate-800 text-lg font-black tracking-tight">Spending by Method</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Transfers vs ATM cash withdrawals</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Vertical Progress Bar layout */}
              <div className="space-y-6">
                {types.map((typeObj, index) => {
                  const percentage = stats.totalSpent > 0 ? Math.round((typeObj.amount / stats.totalSpent) * 100) : 0;
                  const color = TYPE_COLORS[typeObj.type] || '#64748b';
                  return (
                    <div key={typeObj.type || index} className="space-y-2">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="font-black text-slate-700">{typeObj.type === 'TRANSFER' ? 'Transfers Out' : 'Cash Withdrawals'}</span>
                        <span className="font-black text-slate-900">{formatCurrency(typeObj.amount)} <span className="text-slate-400 text-[10px] font-bold">({percentage}%)</span></span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-[2px] border border-slate-200/50">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${percentage}%`, backgroundColor: color }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">{typeObj.count} transactions</div>
                    </div>
                  );
                })}

                {types.length === 0 && (
                  <p className="text-xs text-slate-400 font-bold uppercase">No data details available</p>
                )}
              </div>

              {/* Bar Chart Visual representation */}
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={types} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="type" 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => val === 'TRANSFER' ? 'Transfer' : 'Withdrawal'}
                      tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} 
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} 
                    />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={40}>
                      {types.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={TYPE_COLORS[entry.type] || '#64748b'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
