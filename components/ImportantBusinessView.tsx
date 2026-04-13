import React, { useState, useMemo } from 'react';
import { ImportantBusinessRecord, SubscriptionRecord } from '../types';
import { INNER_MONGOLIA_CITIES, generateImportantBusinessMockData } from '../constants';
import { StyledInput, StyledSelect, StyledButton } from './UI';
import { SearchIcon, DownloadIcon, PlusIcon, UploadIcon, FileTextIcon, RefreshCwIcon, XIcon, TrashIcon, EditIcon } from './Icons';
import { Pagination } from './Pagination';
import { ServiceSelectionModal } from './ServiceSelectionModal';

export const ImportantBusinessView: React.FC = () => {
    const [filters, setFilters] = useState({
        keyword: '',
        importanceLevel: '',
        businessType: '',
        productInstance: '',
        assuranceLevel: '',
        city: ''
    });

    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 15
    });

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isImportanceLevelModalOpen, setIsImportanceLevelModalOpen] = useState(false);
    const [selectedImportanceLevel, setSelectedImportanceLevel] = useState<'重要' | '特别重要'>('重要');
    const [pendingSelectedItems, setPendingSelectedItems] = useState<SubscriptionRecord[]>([]);

    const [isEditImportanceModalOpen, setIsEditImportanceModalOpen] = useState(false);
    const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
    const [editImportanceLevel, setEditImportanceLevel] = useState<'重要' | '特别重要'>('重要');

    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

    // Generate mock data once
    const [allData, setAllData] = useState<ImportantBusinessRecord[]>(() => generateImportantBusinessMockData(100));

    // Filter logic
    const filteredData = useMemo(() => {
        return allData.filter(item => {
            const matchesKeyword = !filters.keyword || 
                item.customerName.includes(filters.keyword) || 
                item.customerCode.includes(filters.keyword) || 
                item.aAddress.includes(filters.keyword) || 
                item.zAddress.includes(filters.keyword);
            
            const matchesImportanceLevel = !filters.importanceLevel || item.importanceLevel === filters.importanceLevel;
            const matchesBusinessType = !filters.businessType || item.businessType === filters.businessType;
            const matchesProductInstance = !filters.productInstance || item.productInstance.includes(filters.productInstance);
            const matchesAssuranceLevel = !filters.assuranceLevel || 
                item.aAssuranceLevel === filters.assuranceLevel || 
                item.zAssuranceLevel === filters.assuranceLevel;
            const matchesCity = !filters.city || item.aCity === filters.city || item.zCity === filters.city;

            return matchesKeyword && matchesImportanceLevel && matchesBusinessType && matchesProductInstance && matchesAssuranceLevel && matchesCity;
        });
    }, [allData, filters]);

    // Pagination logic
    const paginatedData = useMemo(() => {
        const start = (pagination.currentPage - 1) * pagination.pageSize;
        return filteredData.slice(start, start + pagination.pageSize);
    }, [filteredData, pagination]);

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        setSelectedIds(new Set());
    };

    const handleReset = () => {
        setFilters({
            keyword: '',
            importanceLevel: '',
            businessType: '',
            productInstance: '',
            assuranceLevel: '',
            city: ''
        });
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        setSelectedIds(new Set());
    };

    const handleExport = () => {
        alert('正在导出重要业务数据...');
    };

    const handleDownloadTemplate = () => {
        alert('正在下载导入模版 (包含产品实例)...');
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx, .xls';
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            if (file) {
                alert(`已选择文件: ${file.name}，正在导入...`);
            }
        };
        input.click();
    };

    const handleAddBusinesses = (records: SubscriptionRecord[]) => {
        setPendingSelectedItems(records);
        setIsServiceModalOpen(false);
        setIsImportanceLevelModalOpen(true);
    };

    const confirmAddBusinesses = () => {
        const newRecords: ImportantBusinessRecord[] = pendingSelectedItems.map((record, index) => ({
            id: `ib-new-${Date.now()}-${index}`,
            importanceLevel: selectedImportanceLevel,
            customerName: record.customerName,
            customerCode: `CUST-NEW-${Date.now().toString().substring(8)}`, // Mock code
            businessType: record.serviceType,
            productInstance: record.productInstance,
            aAssuranceLevel: 'A', // Default mock
            aCity: record.city,
            aDistrict: record.county,
            aAddress: '默认A端地址', // Default mock
            zAssuranceLevel: 'A', // Default mock
            zCity: record.city,
            zDistrict: record.county,
            zAddress: '默认Z端地址', // Default mock
        }));
        setAllData(prev => [...newRecords, ...prev]);
        setIsImportanceLevelModalOpen(false);
        setPendingSelectedItems([]);
        setSelectedImportanceLevel('重要');
    };

    const handleEditImportance = (record: ImportantBusinessRecord) => {
        setEditingRecordId(record.id);
        setEditImportanceLevel(record.importanceLevel || '重要');
        setIsEditImportanceModalOpen(true);
    };

    const confirmEditImportance = () => {
        if (editingRecordId) {
            setAllData(prev => prev.map(item => 
                item.id === editingRecordId ? { ...item, importanceLevel: editImportanceLevel } : item
            ));
        }
        setIsEditImportanceModalOpen(false);
        setEditingRecordId(null);
    };

    const handleDeleteSingle = (id: string) => {
        setDeletingIds(new Set([id]));
        setIsDeleteConfirmOpen(true);
    };

    const handleDeleteMultiple = () => {
        if (selectedIds.size === 0) {
            alert('请先选择要删除的业务');
            return;
        }
        setDeletingIds(selectedIds);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        setAllData(prev => prev.filter(item => !deletingIds.has(item.id)));
        setSelectedIds(prev => {
            const next = new Set(prev);
            deletingIds.forEach(id => next.delete(id));
            return next;
        });
        setIsDeleteConfirmOpen(false);
        setDeletingIds(new Set());
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

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent border border-blue-500/30 shadow-[inset_0_0_20px_rgba(0,133,208,0.1)] relative">
            {/* Search Bar */}
            <div className="bg-transparent p-3 border-b border-blue-500/20 flex flex-wrap items-center gap-3 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white">关键字:</span>
                    <StyledInput 
                        placeholder="客户名称/客户编号/业务地址" 
                        className="w-64 text-xs" 
                        value={filters.keyword} 
                        onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} 
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white">重要等级:</span>
                    <StyledSelect 
                        className="w-auto text-xs" 
                        value={filters.importanceLevel} 
                        onChange={(e) => setFilters({ ...filters, importanceLevel: e.target.value })}
                    >
                        <option value="">全部</option>
                        <option value="重要">重要</option>
                        <option value="特别重要">特别重要</option>
                    </StyledSelect>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white">业务类型:</span>
                    <StyledSelect 
                        className="w-auto text-xs" 
                        value={filters.businessType} 
                        onChange={(e) => setFilters({ ...filters, businessType: e.target.value })}
                    >
                        <option value="">业务类型</option>
                        <option value="数据专线">数据专线</option>
                        <option value="互联网专线">互联网专线</option>
                        <option value="MPLS-VPN专线">MPLS-VPN专线</option>
                        <option value="语音专线">语音专线</option>
                    </StyledSelect>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white">产品实例:</span>
                    <StyledInput 
                        placeholder="产品实例" 
                        className="w-40 text-xs" 
                        value={filters.productInstance} 
                        onChange={(e) => setFilters({ ...filters, productInstance: e.target.value })} 
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white">保障等级:</span>
                    <StyledSelect 
                        className="w-auto text-xs" 
                        value={filters.assuranceLevel} 
                        onChange={(e) => setFilters({ ...filters, assuranceLevel: e.target.value })}
                    >
                        <option value="">保障等级</option>
                        <option value="AAA">AAA</option>
                        <option value="AA">AA</option>
                        <option value="A">A</option>
                        <option value="普通">普通</option>
                    </StyledSelect>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white">地市:</span>
                    <StyledSelect 
                        className="w-auto text-xs" 
                        value={filters.city} 
                        onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    >
                        <option value="">地市</option>
                        {INNER_MONGOLIA_CITIES.map(city => (
                            <option key={city.code} value={city.name}>{city.name}</option>
                        ))}
                    </StyledSelect>
                </div>
                
                <div className="flex items-center gap-3">
                    <StyledButton variant="toolbar" onClick={handleSearch} icon={<SearchIcon />} className="text-xs">查询</StyledButton>
                    <StyledButton variant="toolbar" onClick={handleReset} icon={<RefreshCwIcon />} className="text-xs">置回</StyledButton>
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
                            <th className="p-3 border-b border-blue-500/20 font-medium text-center">重要等级</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium">客户名称</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium">客户编号</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium">业务类型</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium">产品实例</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium text-center">A端保障等级</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium text-center">A端地市</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium text-center">A端区县</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium">A端地址</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium text-center">Z端保障等级</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium text-center">Z端地市</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium text-center">Z端区县</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium">Z端地址</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium text-center sticky right-0 bg-[#0c2242] z-20 shadow-[-5px_0_10px_rgba(0,0,0,0.1)]">操作</th>
                        </tr>
                    </thead>
                    <tbody className="text-white">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((record, idx) => (
                                <tr 
                                    key={record.id} 
                                    className={`hover:bg-[#1e3a5f]/60 transition-colors border-b border-blue-500/10 last:border-0 group ${selectedIds.has(record.id) ? 'bg-blue-500/20' : ''}`}
                                >
                                    <td className="p-3 border-b border-blue-500/10 text-center">
                                        <input 
                                            type="checkbox" 
                                            className="accent-blue-500"
                                            checked={selectedIds.has(record.id)}
                                            onChange={() => toggleSelect(record.id)}
                                        />
                                    </td>
                                    <td className="p-3 border-b border-blue-500/10 text-center">
                                        <span className={`px-2 py-0.5 rounded-sm text-[10px] border ${
                                            record.importanceLevel === '特别重要' ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-orange-500/20 border-orange-500/40 text-orange-300'
                                        }`}>
                                            {record.importanceLevel || '重要'}
                                        </span>
                                    </td>
                                    <td className="p-3 border-b border-blue-500/10">{record.customerName}</td>
                                    <td className="p-3 border-b border-blue-500/10 text-gray-400 font-mono">{record.customerCode}</td>
                                    <td className="p-3 border-b border-blue-500/10">{record.businessType}</td>
                                    <td className="p-3 border-b border-blue-500/10 font-mono text-blue-300">{record.productInstance}</td>
                                    <td className="p-3 border-b border-blue-500/10 text-center">
                                        <span className={`px-2 py-0.5 rounded-sm text-[10px] border ${
                                            record.aAssuranceLevel === 'AAA' ? 'bg-red-500/20 border-red-500/40 text-red-300' :
                                            record.aAssuranceLevel === 'AA' ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' :
                                            record.aAssuranceLevel === 'A' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' :
                                            'bg-blue-500/20 border-blue-500/40 text-blue-300'
                                        }`}>
                                            {record.aAssuranceLevel}
                                        </span>
                                    </td>
                                    <td className="p-3 border-b border-blue-500/10 text-center">{record.aCity}</td>
                                    <td className="p-3 border-b border-blue-500/10 text-center text-gray-400">{record.aDistrict}</td>
                                    <td className="p-3 border-b border-blue-500/10 max-w-[150px] truncate" title={record.aAddress}>{record.aAddress}</td>
                                    <td className="p-3 border-b border-blue-500/10 text-center">
                                        <span className={`px-2 py-0.5 rounded-sm text-[10px] border ${
                                            record.zAssuranceLevel === 'AAA' ? 'bg-red-500/20 border-red-500/40 text-red-300' :
                                            record.zAssuranceLevel === 'AA' ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' :
                                            record.zAssuranceLevel === 'A' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' :
                                            'bg-blue-500/20 border-blue-500/40 text-blue-300'
                                        }`}>
                                            {record.zAssuranceLevel}
                                        </span>
                                    </td>
                                    <td className="p-3 border-b border-blue-500/10 text-center">{record.zCity}</td>
                                    <td className="p-3 border-b border-blue-500/10 text-center text-gray-400">{record.zDistrict}</td>
                                    <td className="p-3 border-b border-blue-500/10 max-w-[150px] truncate" title={record.zAddress}>{record.zAddress}</td>
                                    <td className="p-3 border-b border-blue-500/10 text-center sticky right-0 bg-[#0c2242] group-hover:bg-[#1e3a5f] transition-colors shadow-[-5px_0_10px_rgba(0,0,0,0.1)]">
                                        <div className="flex items-center justify-center gap-3">
                                            <button 
                                                onClick={() => handleEditImportance(record)}
                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                                title="修改重要等级"
                                            >
                                                <EditIcon className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteSingle(record.id)}
                                                className="text-red-400 hover:text-red-300 transition-colors"
                                                title="删除"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={14} className="p-8 text-center text-blue-300/50 border-b border-blue-500/10 italic">暂无匹配的重要业务数据</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination & Actions */}
            <div className="bg-[#1e293b]/50 border-t border-blue-500/20 flex items-center justify-between px-4 py-2 shrink-0">
                <div className="flex items-center gap-2">
                    <StyledButton variant="toolbar" onClick={handleDownloadTemplate} icon={<FileTextIcon />} className="text-xs">导入模版</StyledButton>
                    <StyledButton variant="toolbar" onClick={handleImport} icon={<UploadIcon />} className="text-xs">导入</StyledButton>
                    <StyledButton variant="toolbar" onClick={handleExport} icon={<DownloadIcon />} className="text-xs">导出</StyledButton>
                    <StyledButton variant="primary" onClick={() => setIsServiceModalOpen(true)} icon={<PlusIcon />} className="text-xs">添加</StyledButton>
                    <StyledButton 
                        variant="danger"
                        onClick={handleDeleteMultiple}
                        disabled={selectedIds.size === 0}
                        className="h-7"
                        icon={<TrashIcon className="w-3 h-3" />}
                    >
                        删除
                    </StyledButton>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-xs text-blue-300/70">
                        已选择 <span className="text-neon-blue font-bold">{selectedIds.size}</span> 项
                    </div>
                    <Pagination 
                        currentPage={pagination.currentPage}
                        pageSize={pagination.pageSize}
                        totalItems={filteredData.length}
                        onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
                        onPageSizeChange={(size) => setPagination(prev => ({ ...prev, pageSize: size, currentPage: 1 }))}
                        className="py-0 px-0 justify-end"
                    />
                </div>
            </div>

            {/* Service Selection Modal */}
            <ServiceSelectionModal 
                isOpen={isServiceModalOpen}
                onClose={() => setIsServiceModalOpen(false)}
                onConfirmMulti={handleAddBusinesses}
                isMultiSelect={true}
                isImportantBusinessMode={true}
                title="重要业务查询添加"
                hideBusinessCategory={true}
                hideServiceType={true}
            />

            {/* Importance Level Selection Modal */}
            {isImportanceLevelModalOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#0b1730] border border-blue-500/30 rounded-lg shadow-[0_0_20px_rgba(0,133,208,0.2)] w-[350px] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-blue-500/20">
                            <h3 className="text-white font-medium">重要等级选择</h3>
                            <button onClick={() => setIsImportanceLevelModalOpen(false)} className="text-gray-400 hover:text-white">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <p className="text-xs text-blue-200 mb-2">请为所选的 {pendingSelectedItems.length} 个业务选择重要等级：</p>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="importanceLevel" 
                                    value="重要" 
                                    checked={selectedImportanceLevel === '重要'}
                                    onChange={() => setSelectedImportanceLevel('重要')}
                                    className="w-4 h-4 text-blue-500 bg-transparent border-blue-500/50 focus:ring-blue-500 focus:ring-offset-0 focus:ring-offset-transparent"
                                />
                                <span className="text-sm text-white group-hover:text-blue-300 transition-colors">重要</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="importanceLevel" 
                                    value="特别重要" 
                                    checked={selectedImportanceLevel === '特别重要'}
                                    onChange={() => setSelectedImportanceLevel('特别重要')}
                                    className="w-4 h-4 text-blue-500 bg-transparent border-blue-500/50 focus:ring-blue-500 focus:ring-offset-0 focus:ring-offset-transparent"
                                />
                                <span className="text-sm text-white group-hover:text-blue-300 transition-colors">特别重要</span>
                            </label>
                        </div>
                        <div className="p-4 border-t border-blue-500/20 flex justify-end gap-3">
                            <StyledButton variant="outline" onClick={() => setIsImportanceLevelModalOpen(false)}>取消</StyledButton>
                            <StyledButton variant="primary" onClick={confirmAddBusinesses}>确定</StyledButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Importance Level Modal */}
            {isEditImportanceModalOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#0b1730] border border-blue-500/30 rounded-lg shadow-[0_0_20px_rgba(0,133,208,0.2)] w-[350px] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-blue-500/20">
                            <h3 className="text-white font-medium">修改重要等级</h3>
                            <button onClick={() => setIsEditImportanceModalOpen(false)} className="text-gray-400 hover:text-white">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <p className="text-xs text-blue-200 mb-2">请选择新的重要等级：</p>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="editImportanceLevel" 
                                    value="重要" 
                                    checked={editImportanceLevel === '重要'}
                                    onChange={() => setEditImportanceLevel('重要')}
                                    className="w-4 h-4 text-blue-500 bg-transparent border-blue-500/50 focus:ring-blue-500 focus:ring-offset-0 focus:ring-offset-transparent"
                                />
                                <span className="text-sm text-white group-hover:text-blue-300 transition-colors">重要</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="editImportanceLevel" 
                                    value="特别重要" 
                                    checked={editImportanceLevel === '特别重要'}
                                    onChange={() => setEditImportanceLevel('特别重要')}
                                    className="w-4 h-4 text-blue-500 bg-transparent border-blue-500/50 focus:ring-blue-500 focus:ring-offset-0 focus:ring-offset-transparent"
                                />
                                <span className="text-sm text-white group-hover:text-blue-300 transition-colors">特别重要</span>
                            </label>
                        </div>
                        <div className="p-4 border-t border-blue-500/20 flex justify-end gap-3">
                            <StyledButton variant="outline" onClick={() => setIsEditImportanceModalOpen(false)}>取消</StyledButton>
                            <StyledButton variant="primary" onClick={confirmEditImportance}>确定</StyledButton>
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
                                确定要删除选中的 <span className="text-red-400 font-bold">{deletingIds.size}</span> 条重要业务数据吗？此操作不可恢复。
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

export default ImportantBusinessView;
