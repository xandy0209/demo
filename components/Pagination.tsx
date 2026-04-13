
import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Calculate range of items being shown
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={`flex items-center space-x-4 text-xs text-blue-200 ${className?.includes('justify-') ? '' : 'justify-end'} ${className || 'py-4 px-2'}`}>
      <div className="flex items-center space-x-2">
        <span>共 {totalItems} 条</span>
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors rounded-none"
        >
          <ChevronLeftIcon />
        </button>

        <div className="flex space-x-1">
            {/* Simple pagination logic: Show current, mostly */}
            {/* Updated background to #07596C/80 */}
            <span className="bg-[#07596C]/80 text-white px-2 py-0.5 border border-blue-400 rounded-none">
                {isNaN(currentPage) ? 1 : currentPage}
            </span>
            <span className="px-1 text-blue-400">/</span>
            <span className="px-1">{isNaN(totalPages) ? 1 : totalPages}</span>
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors rounded-none"
        >
          <ChevronRightIcon />
        </button>
      </div>

      <div className="relative">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="bg-[#0f172a]/30 border border-blue-500/30 text-blue-200 text-xs px-2 py-1 appearance-none pr-6 focus:outline-none focus:border-neon-blue rounded-none"
        >
          <option value={10}>10条/页</option>
          <option value={15}>15条/页</option>
          <option value={20}>20条/页</option>
          <option value={50}>50条/页</option>
        </select>
        <div className="absolute right-1.5 top-1.5 pointer-events-none text-blue-400">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </div>
  );
};
