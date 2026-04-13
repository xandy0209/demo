import React, { useState, useMemo } from 'react';
import { TerminalInventoryRecord } from '../types';
import { MOCK_TERMINAL_INVENTORY_DATA } from '../constants';
import { StyledInput, StyledButton, StyledSelect } from './UI';
import { Pagination } from './Pagination';
import { PlusIcon, XIcon, DownloadIcon, UploadIcon, SearchIcon, RefreshCwIcon } from './Icons';

export const TerminalInventoryView: React.FC = () => {
    const [data, setData] = useState<TerminalInventoryRecord[]>(MOCK_TERMINAL_INVENTORY_DATA);
    const [filters, setFilters] = useState({ sn: '', deviceType: '', status: '', vendor: '', startDate: '', endDate: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newItem, setNewItem] = useState({ sn: '', deviceType: '千里眼', vendor: '', importer: '', importerPhone: '' });

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

    const filteredData = useMemo(() => {
        return data.filter(item => {
            if (filters.sn && !item.sn.includes(filters.sn)) return false;
            if (filters.deviceType && item.deviceType !== filters.deviceType) return false;
            if (filters.status && item.status !== filters.status) return false;
            if (filters.vendor && !item.vendor.includes(filters.vendor)) return false;
            if (filters.startDate && item.inboundTime < filters.startDate) return false;
            if (filters.endDate && item.inboundTime > filters.endDate) return false;
            return true;
        });
    }, [data, filters]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage, pageSize]);

    const handleReset = () => {
        setFilters({ sn: '', deviceType: '', status: '', vendor: '', startDate: '', endDate: '' });
        setCurrentPage(1);
        setSelectedIds(new Set());
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === paginatedData.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedData.map(r => r.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleDeleteSingle = (id: string) => {
        setDeletingIds(new Set([id]));
        setIsDeleteConfirmOpen(true);
    };

    const handleDeleteMultiple = () => {
        if (selectedIds.size === 0) {
            alert('请先选择要删除的记录');
            return;
        }
        setDeletingIds(selectedIds);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        setData(prev => prev.filter(item => !deletingIds.has(item.id)));
        setSelectedIds(prev => {
            const next = new Set(prev);
            deletingIds.forEach(id => next.delete(id));
            return next;
        });
        setIsDeleteConfirmOpen(false);
        setDeletingIds(new Set());
    };

    return (
        <div id="terminal-inventory-view" className="flex-1 flex flex-col h-full overflow-hidden bg-transparent border border-blue-500/30 shadow-[inset_0_0_20px_rgba(0,133,208,0.1)] relative">
            {/* Search Bar */}
            <div className="bg-transparent p-3 border-b border-blue-500/20 flex flex-wrap items-center gap-3 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white">SN码:</span>
                    <StyledInput id="filter-sn" placeholder="SN码" value={filters.sn} onChange={(e) => setFilters(prev => ({...prev, sn: e.target.value}))} className="w-40 text-xs" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white">设备类型:</span>
                    <StyledSelect id="filter-device-type" value={filters.deviceType} onChange={(e) => setFilters(prev => ({...prev, deviceType: e.target.value}))} className="w-40 text-xs">
                        <option value="">全部</option>
                        {['千里眼', '云视讯', 'E企组网', '云无线', 'AC-AP', '云电脑'].map(t => <option key={t} value={t}>{t}</option>)}
                    </StyledSelect>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white">厂家:</span>
                    <StyledInput id="filter-vendor" placeholder="厂家" value={filters.vendor} onChange={(e) => setFilters(prev => ({...prev, vendor: e.target.value}))} className="w-40 text-xs" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white">状态:</span>
                    <StyledSelect id="filter-status" value={filters.status} onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))} className="w-40 text-xs">
                        <option value="">全部</option>
                        {['库存', '已出库', '已拆除'].map(s => <option key={s} value={s}>{s}</option>)}
                    </StyledSelect>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white">时间:</span>
                    <StyledInput id="filter-start-date" type="date" value={filters.startDate} onChange={(e) => setFilters(prev => ({...prev, startDate: e.target.value}))} className="w-40 text-xs" />
                    <span className="text-white">-</span>
                    <StyledInput id="filter-end-date" type="date" value={filters.endDate} onChange={(e) => setFilters(prev => ({...prev, endDate: e.target.value}))} className="w-40 text-xs" />
                </div>
                <div className="flex items-center gap-3">
                    <StyledButton id="btn-search" variant="toolbar" onClick={() => setCurrentPage(1)} icon={<SearchIcon />} className="text-xs">查询</StyledButton>
                    <StyledButton id="btn-reset" variant="toolbar" onClick={handleReset} icon={<RefreshCwIcon />} className="text-xs">置回</StyledButton>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto bg-transparent scrollbar-thin">
                <table className="w-full text-left text-xs whitespace-nowrap border-separate border-spacing-0">
                    <thead className="sticky top-0 bg-[#0c2242] text-blue-200 z-10 shadow-sm">
                        <tr>
                            <th className="p-3 border-b border-blue-500/20 w-10">
                                <input 
                                    type="checkbox" 
                                    className="accent-blue-500"
                                    checked={paginatedData.length > 0 && selectedIds.size === paginatedData.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th className="p-3 border-b border-blue-500/20 font-medium">SN码</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium">设备类型</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium">厂家</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium">入库时间</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium">设备状态</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium">出库时间</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium">拆除时间</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium">导入人</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium">导入人电话</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium text-center sticky right-0 bg-[#0c2242] z-20 shadow-[-5px_0_10px_rgba(0,0,0,0.1)]">操作</th>
                        </tr>
                    </thead>
                    <tbody className="text-white">
                        {paginatedData.length > 0 ? (
                            paginatedData.map(item => (
                                <tr key={item.id} className={`hover:bg-[#1e3a5f]/60 transition-colors border-b border-blue-500/10 last:border-0 group ${selectedIds.has(item.id) ? 'bg-blue-500/20' : ''}`}>
                                    <td className="p-3 border-b border-blue-500/10 text-center">
                                        <input 
                                            type="checkbox" 
                                            className="accent-blue-500"
                                            checked={selectedIds.has(item.id)}
                                            onChange={() => toggleSelect(item.id)}
                                        />
                                    </td>
                                    <td className="p-3 border-b border-blue-500/10 font-mono">{item.sn}</td>
                                    <td className="p-3 border-b border-blue-500/10">{item.deviceType}</td>
                                    <td className="p-3 border-b border-blue-500/10">{item.vendor}</td>
                                    <td className="p-3 border-b border-blue-500/10">{item.inboundTime}</td>
                                    <td className="p-3 border-b border-blue-500/10">{item.status}</td>
                                    <td className="p-3 border-b border-blue-500/10">{item.outboundTime || '-'}</td>
                                    <td className="p-3 border-b border-blue-500/10">{item.removedTime || '-'}</td>
                                    <td className="p-3 border-b border-blue-500/10">{item.importer || '-'}</td>
                                    <td className="p-3 border-b border-blue-500/10">{item.importerPhone || '-'}</td>
                                    <td className="p-3 border-b border-blue-500/10 text-center sticky right-0 bg-[#0c2242] group-hover:bg-[#1e3a5f] transition-colors shadow-[-5px_0_10px_rgba(0,0,0,0.1)]">
                                        <div className="flex items-center justify-center gap-3">
                                            <button 
                                                id={`btn-edit-${item.id}`}
                                                onClick={() => {
                                                    setModalMode('edit');
                                                    setEditingId(item.id);
                                                    setNewItem({ 
                                                        sn: item.sn, 
                                                        deviceType: item.deviceType, 
                                                        vendor: item.vendor,
                                                        importer: item.importer || '',
                                                        importerPhone: item.importerPhone || ''
                                                    });
                                                    setIsModalOpen(true);
                                                }}
                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                                title="修改"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                            <button 
                                                id={`btn-delete-${item.id}`}
                                                onClick={() => handleDeleteSingle(item.id)}
                                                className="text-red-400 hover:text-red-300 transition-colors"
                                                title="删除"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={9} className="p-8 text-center text-blue-300/50 border-b border-blue-500/10 italic">暂无数据</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination & Actions */}
            <div className="bg-[#1e293b]/50 border-t border-blue-500/20 flex items-center justify-between px-4 py-2 shrink-0">
                <div className="flex items-center gap-2">
                    <StyledButton id="btn-import-template" variant="toolbar" icon={<DownloadIcon />} className="text-xs">导入模版</StyledButton>
                    <StyledButton id="btn-import" variant="toolbar" icon={<UploadIcon />} className="text-xs">导入</StyledButton>
                    <StyledButton id="btn-export" variant="toolbar" icon={<DownloadIcon />} className="text-xs">导出</StyledButton>
                    <StyledButton id="btn-add" variant="primary" onClick={() => {
                        setModalMode('add');
                        setEditingId(null);
                        setNewItem({ sn: '', deviceType: '千里眼', vendor: '', importer: '', importerPhone: '' });
                        setIsModalOpen(true);
                    }} icon={<PlusIcon />} className="text-xs">添加</StyledButton>
                    <button 
                        onClick={handleDeleteMultiple}
                        disabled={selectedIds.size === 0}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-sm text-xs font-medium transition-colors border ${
                            selectedIds.size > 0 
                                ? 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30 hover:text-red-300' 
                                : 'bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        删除
                    </button>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-xs text-blue-300/70">
                        已选择 <span className="text-neon-blue font-bold">{selectedIds.size}</span> 项
                    </div>
                    <Pagination 
                        currentPage={currentPage} 
                        totalItems={filteredData.length} 
                        pageSize={pageSize} 
                        onPageChange={setCurrentPage} 
                        onPageSizeChange={setPageSize} 
                        className="py-0 px-0 justify-end"
                    />
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#0b1730] border border-blue-500/30 rounded-lg shadow-[0_0_20px_rgba(0,133,208,0.2)] w-[400px] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-blue-500/20">
                            <h3 className="text-white font-medium">{modalMode === 'add' ? '录入终端库存信息' : '修改终端库存信息'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-blue-200">SN码 <span className="text-red-500">*</span></label>
                                <StyledInput 
                                    value={newItem.sn} 
                                    onChange={(e) => setNewItem({...newItem, sn: e.target.value})} 
                                    placeholder="请输入SN码" 
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-blue-200">设备类型 <span className="text-red-500">*</span></label>
                                <StyledSelect 
                                    value={newItem.deviceType} 
                                    onChange={(e) => setNewItem({...newItem, deviceType: e.target.value})}
                                >
                                    {['千里眼', '云视讯', 'E企组网', '云无线', 'AC-AP', '云电脑'].map(t => <option key={t} value={t}>{t}</option>)}
                                </StyledSelect>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-blue-200">厂家</label>
                                <StyledInput 
                                    value={newItem.vendor} 
                                    onChange={(e) => setNewItem({...newItem, vendor: e.target.value})} 
                                    placeholder="请输入厂家名称" 
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t border-blue-500/20 flex justify-end gap-3">
                            <StyledButton variant="outline" onClick={() => setIsModalOpen(false)}>取消</StyledButton>
                            <StyledButton variant="primary" onClick={() => {
                                if (newItem.sn) {
                                    if (modalMode === 'add') {
                                        const newRecord: TerminalInventoryRecord = {
                                            id: `sn-new-${Date.now()}`,
                                            sn: newItem.sn,
                                            deviceType: newItem.deviceType,
                                            vendor: newItem.vendor,
                                            importer: newItem.importer,
                                            importerPhone: newItem.importerPhone,
                                            status: '库存',
                                            inboundTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
                                        };
                                        setData([newRecord, ...data]);
                                    } else if (modalMode === 'edit' && editingId) {
                                        setData(data.map(item => item.id === editingId ? { 
                                            ...item, 
                                            sn: newItem.sn, 
                                            deviceType: newItem.deviceType, 
                                            vendor: newItem.vendor,
                                            importer: newItem.importer,
                                            importerPhone: newItem.importerPhone
                                        } : item));
                                    }
                                    setIsModalOpen(false);
                                }
                            }}>确定</StyledButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteConfirmOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#0b1730] border border-blue-500/30 rounded-lg shadow-[0_0_20px_rgba(0,133,208,0.2)] w-[400px] flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                        <div className="flex items-center justify-between p-4 border-b border-blue-500/20 bg-[#0c1a35]/50">
                            <h3 className="text-white font-medium">确认删除</h3>
                            <button onClick={() => setIsDeleteConfirmOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <XIcon />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-blue-100">
                                确定要删除选中的 <span className="text-red-400 font-bold">{deletingIds.size}</span> 条记录吗？此操作不可恢复。
                            </p>
                        </div>
                        <div className="p-4 border-t border-blue-500/20 bg-[#0c1a35]/30 flex justify-end gap-3">
                            <StyledButton variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>取消</StyledButton>
                            <StyledButton variant="danger" onClick={confirmDelete}>确定删除</StyledButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
