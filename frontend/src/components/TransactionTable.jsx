import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  MoreHorizontal
} from 'lucide-react';

const TransactionTable = ({ transactions, isLoading, currentUserId }) => {
  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 w-full bg-slate-50 animate-pulse rounded-3xl border border-slate-100" />
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <Clock className="w-10 h-10 opacity-20" />
        </div>
        <h4 className="text-xl font-black text-slate-800 mb-2">No Transactions Found</h4>
        <p className="text-sm font-medium">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto no-scrollbar pb-4">
      <table className="w-full border-separate border-spacing-y-4">
        <thead>
          <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <th className="px-6 pb-2 text-left">Details</th>
            <th className="px-6 pb-2 text-left">Status</th>
            <th className="px-6 pb-2 text-left">Type</th>
            <th className="px-6 pb-2 text-right">Amount</th>
            <th className="px-6 pb-2 text-center w-12"></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, idx) => {
            // Determine if the current transaction is a credit or debit for the current user
            const isReceiver = (tx.receiver?._id || tx.receiver) === currentUserId;
            const isSender = (tx.sender?._id || tx.sender) === currentUserId;
            
            let isCredit = false;
            if (tx.type === 'DEPOSIT') isCredit = true;
            if (tx.type === 'WITHDRAW') isCredit = false;
            if (tx.type === 'TRANSFER') isCredit = isReceiver;

            return (
              <tr 
                key={tx._id || idx} 
                className="bg-white border border-slate-100 group hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300 rounded-[2rem] overflow-hidden"
              >
                {/* Details Column */}
                <td className="px-6 py-5 rounded-l-[1.5rem]">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110
                      ${isCredit ? 'bg-emerald-50 text-emerald-600' : 
                        tx.type === 'TRANSFER' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}
                    `}>
                      {isCredit ? <ArrowDownLeft className="w-6 h-6" /> : 
                       tx.type === 'TRANSFER' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-900 font-black truncate">{tx.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-slate-400 text-[10px] font-bold font-mono uppercase tracking-tighter bg-slate-50 px-1.5 py-0.5 rounded">
                          {tx.transactionId}
                        </span>
                        <span className="text-slate-300 text-xs">•</span>
                        <span className="text-slate-400 text-[10px] font-bold flex items-center gap-1 uppercase tracking-widest">
                          <Clock className="w-3 h-3" /> {new Date(tx.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Status Column */}
                <td className="px-6 py-5">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest
                    ${tx.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 
                      tx.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}
                  `}>
                    {tx.status === 'SUCCESS' ? <CheckCircle2 className="w-3 h-3" /> : 
                     tx.status === 'PENDING' ? <Clock className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {tx.status}
                  </div>
                </td>

                {/* Type Column */}
                <td className="px-6 py-5">
                  <span className="text-slate-500 text-xs font-black tracking-tight">{tx.type}</span>
                </td>

                {/* Amount Column */}
                <td className="px-6 py-5 text-right">
                  <p className={`text-lg font-black tracking-tight 
                    ${isCredit ? 'text-emerald-600' : 'text-slate-900'}
                  `}>
                    {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    {isCredit ? 'Credited' : 'Debited'}
                  </p>
                </td>

                {/* Action Column */}
                <td className="px-6 py-5 text-center rounded-r-[1.5rem]">
                  <button className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
