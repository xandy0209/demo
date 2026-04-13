import React, { useState, useEffect } from 'react';
import { XIcon, CopyIcon, FolderIcon } from './Icons';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (filename: string) => void;
  defaultFilename: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onConfirm, defaultFilename }) => {
  const [filename, setFilename] = useState(defaultFilename);
  
  useEffect(() => {
    if (isOpen) {
      setFilename(defaultFilename);
    }
  }, [isOpen, defaultFilename]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
      <div className="w-[520px] bg-white text-gray-800 font-sans animate-[fadeIn_0.1s_ease-out] rounded-[3px] shadow-[0_8px_24px_rgba(0,0,0,0.15)] border border-gray-300 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#f0f3f5] border-b border-gray-300/80">
          <span className="text-[13px] font-bold text-gray-700 tracking-wide">新建下载</span>
          <button onClick={onClose} className="text-gray-400 hover:text-[#e81123] transition-colors p-1">
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4 text-[13px]">
          {/* Row 1: URL */}
          <div className="flex items-center gap-3">
            <label className="w-[70px] text-right text-gray-600">下载链接：</label>
            <div className="flex-1 flex gap-2">
               <input 
                  type="text" 
                  readOnly
                  value="//10.221.230.218:18023/45b1528a-82ba-44a2-aacc-8a9ae1e3b39e"
                  className="flex-1 border border-gray-300 px-2 py-1.5 text-gray-500 bg-white focus:outline-none cursor-text select-all"
               />
               <button className="px-2.5 py-1.5 border border-gray-300 bg-[#f9f9f9] hover:bg-[#e1e1e1] text-gray-600 transition-colors rounded-[2px]" title="复制链接">
                  <CopyIcon />
               </button>
            </div>
          </div>

          {/* Row 2: Path */}
          <div className="flex items-center gap-3">
            <label className="w-[70px] text-right text-gray-600">下载到：</label>
            <div className="flex-1 flex gap-2">
               <div className="flex-1 flex items-center border border-gray-300 px-2 py-1.5 bg-white">
                  <span className="flex-1 truncate text-gray-800">E:\TSBrowserDownloads</span>
                  <span className="text-gray-400 text-xs whitespace-nowrap pl-2 border-l border-gray-200 ml-2">剩: 183.45GB</span>
                  <span className="text-gray-500 ml-1 text-[8px] transform scale-x-125">▼</span>
               </div>
               <button className="px-2.5 py-1.5 border border-gray-300 bg-[#fbfbfb] hover:bg-[#e1e1e1] text-[#e8b339] transition-colors rounded-[2px]" title="选择文件夹">
                  <FolderIcon />
               </button>
            </div>
          </div>

          {/* Row 3: Filename */}
          <div className="flex items-center gap-3">
            <label className="w-[70px] text-right text-gray-600">文件名：</label>
            <div className="flex-1 flex items-center border border-gray-300 px-2 py-1.5 bg-white focus-within:border-[#4dabf7] focus-within:ring-1 focus-within:ring-[#4dabf7]/30 transition-all">
               <input 
                  type="text" 
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-gray-800 selection:bg-[#2DB7F5] selection:text-white"
               />
               <span className="text-gray-400 pl-2">5.00KB</span>
            </div>
          </div>

          {/* Checkbox */}
          <div className="flex items-center gap-2 pl-[82px] pt-1">
             <input 
              type="checkbox" 
              id="open-after" 
              className="accent-[#3b82f6] w-3.5 h-3.5"
             />
             <label htmlFor="open-after" className="text-gray-600 cursor-pointer select-none hover:text-gray-800">下载完成后打开</label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-3 bg-[#f0f3f5] border-t border-gray-300/80">
           <button 
              onClick={() => onConfirm(filename)}
              className="px-8 py-1.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-[13px] transition-colors rounded-[2px] shadow-sm font-medium tracking-wide"
           >
              下载
           </button>
           <button 
              onClick={onClose}
              className="px-8 py-1.5 border border-gray-300 bg-white hover:bg-[#f3f3f3] text-gray-700 text-[13px] transition-colors rounded-[2px] shadow-sm"
           >
              取消
           </button>
        </div>
      </div>
    </div>
  );
};
