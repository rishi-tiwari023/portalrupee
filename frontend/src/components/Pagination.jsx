import React from 'react';
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast } from 'lucide-react';

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || !pagination.pages || pagination.pages <= 1) return null;
  const { page, pages, total, limit } = pagination;

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5;
    
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(pages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-10 h-10 rounded-xl text-sm font-black transition-all flex items-center justify-center
            ${page === i 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' 
              : 'text-slate-500 hover:bg-slate-100'
            }
          `}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-10 px-6 py-8 bg-white/50 backdrop-blur-sm border border-white rounded-[2.5rem]">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
           Viewing <span className="text-slate-900">{(page - 1) * limit + 1} - {Math.min(page * limit, total)}</span> of <span className="text-slate-900">{total}</span>
        </p>
        <div className="hidden sm:block h-4 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Rows per page:</span>
           <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{limit}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <ChevronFirst className="w-5 h-5" />
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:pointer-events-none transition-all mr-2"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1">
          {renderPageNumbers()}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:pointer-events-none transition-all ml-2"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => onPageChange(pages)}
          disabled={page === pages}
          className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <ChevronLast className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
