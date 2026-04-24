import React, { useState, useEffect } from 'react';
import { 
    SearchIcon, 
    RefreshCwIcon, 
    PlusIcon, 
    DownloadIcon,
    TrashIcon,
    XIcon,
    EditIcon
} from './Icons';
import { StyledInput, StyledButton, StyledSelect } from './UI';
import { Pagination } from './Pagination';
import { FaultSMSConfigRecord, SubscriptionRecord } from '../types';
import { generateFaultSMSConfigMockData } from '../constants';
import { ServiceSelectionModal } from './ServiceSelectionModal';

export const FaultSMSConfigView: React.FC = () => {
    const [filters, setFilters] = useState({
        keyword: '',
        businessType: ''
    });
    const [data, setData] = useState<FaultSMSConfigRecord[]>([]);
    const [filteredData, setFilteredData] = useState<FaultSMSConfigRecord[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10
    });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteConfirmIds, setDeleteConfirmIds] = useState<string[] | null>(null);
    const [recipientDeleteIndexes, setRecipientDeleteIndexes] = useState<number[] | null>(null);
    
    // New Config State
    const [newConfig, setNewConfig] = useState<{
        productInstances: string[];
        recipients: { name: string; phone: string }[];
    }>({
        productInstances: [],
        recipients: [{ name: '', phone: '' }]
    });

    useEffect(() => {
        const mockData = generateFaultSMSConfigMockData(25);
        setData(mockData);
        setFilteredData(mockData);
    }, []);

    const handleQuery = () => {
        let result = data;
        if (filters.keyword) {
            const kw = filters.keyword.toLowerCase();
            result = result.filter(item => 
                item.customerName.toLowerCase().includes(kw) ||
                item.customerCode.toLowerCase().includes(kw) ||
                item.productInstance.toLowerCase().includes(kw)
            );
        }
        if (filters.businessType) {
            result = result.filter(item => item.businessType === filters.businessType);
        }
        setFilteredData(result);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleReset = () => {
        setFilters({ keyword: '', businessType: '' });
        setFilteredData(data);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = new Set(filteredData.map(item => item.id));
            setSelectedIds(allIds);
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectOne = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const [selectedRecipientIndexes, setSelectedRecipientIndexes] = useState<Set<number>>(new Set());

    const handleAddRecipient = () => {
        setNewConfig(prev => ({
            ...prev,
            recipients: [...prev.recipients, { name: '', phone: '' }]
        }));
    };

    const handleRemoveRecipient = (index: number) => {
        if (newConfig.recipients.length > 1) {
            setRecipientDeleteIndexes([index]);
        }
    };

    const handleBatchRemoveRecipients = () => {
        if (selectedRecipientIndexes.size === 0) return;
        setRecipientDeleteIndexes(Array.from(selectedRecipientIndexes));
    };

    const confirmRemoveRecipients = () => {
        if (recipientDeleteIndexes) {
            const updated = newConfig.recipients.filter((_, i) => !recipientDeleteIndexes.includes(i));
            setNewConfig(prev => ({ ...prev, recipients: updated.length > 0 ? updated : [{ name: '', phone: '' }] }));
            
            const newSelected = new Set(selectedRecipientIndexes);
            recipientDeleteIndexes.forEach(idx => newSelected.delete(idx));
            setSelectedRecipientIndexes(newSelected);
            
            setRecipientDeleteIndexes(null);
        }
    };

    const toggleRecipientSelection = (index: number) => {
        const newSelected = new Set(selectedRecipientIndexes);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedRecipientIndexes(newSelected);
    };

    const toggleAllRecipients = () => {
        if (selectedRecipientIndexes.size === newConfig.recipients.length) {
            setSelectedRecipientIndexes(new Set());
        } else {
            setSelectedRecipientIndexes(new Set(newConfig.recipients.map((_, i) => i)));
        }
    };

    const handleRecipientChange = (index: number, field: 'name' | 'phone', value: string) => {
        const newRecipients = [...newConfig.recipients];
        newRecipients[index][field] = value;
        setNewConfig(prev => ({ ...prev, recipients: newRecipients }));
    };

    const handleServiceConfirm = (records: SubscriptionRecord[]) => {
        const instances = records.map(r => r.productInstance);
        setNewConfig(prev => ({ ...prev, productInstances: instances }));
        setIsServiceModalOpen(false);
    };

    const handleSaveConfig = () => {
        if (newConfig.productInstances.length === 0) {
            alert('请选择产品实例');
            return;
        }
        if (newConfig.recipients.some(r => !r.name || !r.phone)) {
            alert('请完善受理人信息');
            return;
        }

        if (editingId) {
            // Update existing
            const updatedData = data.map(item => {
                if (item.id === editingId) {
                    return {
                        ...item,
                        productInstance: newConfig.productInstances.join(', '),
                        recipients: [...newConfig.recipients]
                    };
                }
                return item;
            });
            setData(updatedData);
            setFilteredData(updatedData);
        } else {
            // Create new
            const newRecord: FaultSMSConfigRecord = {
                id: `sms-${Date.now()}`,
                productInstance: newConfig.productInstances.join(', '),
                recipients: [...newConfig.recipients],
                businessType: '数据专线', // Default or derived
                customerName: '新客户',
                customerCode: 'CUST-NEW'
            };
            const updatedData = [newRecord, ...data];
            setData(updatedData);
            setFilteredData(updatedData);
        }

        setIsAddModalOpen(false);
        setEditingId(null);
        setNewConfig({ productInstances: [], recipients: [{ name: '', phone: '' }] });
    };

    const handleEdit = (record: FaultSMSConfigRecord) => {
        setEditingId(record.id);
        setNewConfig({
            productInstances: record.productInstance.split(', ').filter(Boolean),
            recipients: record.recipients.map(r => ({ ...r }))
        });
        setIsAddModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setDeleteConfirmIds([id]);
    };

    const confirmDelete = () => {
        if (deleteConfirmIds) {
            const updatedData = data.filter(item => !deleteConfirmIds.includes(item.id));
            setData(updatedData);
            setFilteredData(updatedData);
            setDeleteConfirmIds(null);
            setSelectedIds(new Set());
        }
    };

    const handleBatchDelete = () => {
        if (selectedIds.size === 0) return;
        setDeleteConfirmIds(Array.from(selectedIds));
    };

    const paginatedData = filteredData.slice(
        (pagination.currentPage - 1) * pagination.pageSize,
        pagination.currentPage * pagination.pageSize
    );

    return (
        <div className="relative flex-1 flex flex-col h-full overflow-hidden bg-transparent border border-blue-500/30 shadow-[inset_0_0_20px_rgba(0,133,208,0.1)] text-white">
            {/* Filter Bar */}
            <div className="bg-transparent p-3 border-b border-blue-500/20 flex flex-wrap items-center justify-between gap-y-3 gap-x-6 shrink-0">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-300 whitespace-nowrap">查询条件:</span>
                        <StyledInput 
                            placeholder="客户名称/客户编号/产品实例" 
                            className="w-64"
                            value={filters.keyword}
                            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-300 whitespace-nowrap">业务类型:</span>
                        <StyledSelect 
                            className="w-40"
                            value={filters.businessType}
                            onChange={(e) => setFilters({ ...filters, businessType: e.target.value })}
                        >
                            <option value="">全部</option>
                            <option value="数据专线">数据专线</option>
                            <option value="互联网专线">互联网专线</option>
                            <option value="语音专线">语音专线</option>
                            <option value="MPLS-VPN专线">MPLS-VPN专线</option>
                            <option value="APN专线">APN专线</option>
                        </StyledSelect>
                    </div>
                    <div className="flex items-center gap-2">
                        <StyledButton variant="toolbar" icon={<SearchIcon />} onClick={handleQuery}>
                            查询
                        </StyledButton>
                        <StyledButton variant="secondary" icon={<RefreshCwIcon />} onClick={handleReset}>
                            重置
                        </StyledButton>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto bg-transparent scrollbar-thin">
                <table className="w-full text-left text-sm whitespace-nowrap border-separate border-spacing-0">
                    <thead className="sticky top-0 z-10 bg-[#0c2242] text-white shadow-sm">
                        <tr>
                            <th className="p-3 font-semibold border-b border-blue-500/40 w-10 text-center">
                                <input 
                                    type="checkbox" 
                                    className="accent-blue-500"
                                    onChange={handleSelectAll}
                                    checked={selectedIds.size === filteredData.length && filteredData.length > 0}
                                />
                            </th>
                            <th className="p-3 font-semibold border-b border-blue-500/40">产品实例</th>
                            <th className="p-3 font-semibold border-b border-blue-500/40">短信受理人</th>
                            <th className="p-3 font-semibold border-b border-blue-500/40">业务类型</th>
                            <th className="p-3 font-semibold border-b border-blue-500/40">客户名称</th>
                            <th className="p-3 font-semibold border-b border-blue-500/40">客户编号</th>
                            <th className="p-3 font-semibold border-b border-blue-500/40 text-center sticky right-0 bg-[#0c2242] z-20">操作</th>
                        </tr>
                    </thead>
                    <tbody className="text-white">
                        {paginatedData.length > 0 ? paginatedData.map((row) => (
                            <tr key={row.id} className="hover:bg-blue-600/10 transition-colors border-b border-blue-500/10 group">
                                <td className="p-3 border-b border-blue-500/10 text-center">
                                    <input 
                                        type="checkbox" 
                                        className="accent-blue-500"
                                        checked={selectedIds.has(row.id)}
                                        onChange={() => handleSelectOne(row.id)}
                                    />
                                </td>
                                <td className="p-3 border-b border-blue-500/10 text-blue-100">{row.productInstance}</td>
                                <td className="p-3 border-b border-blue-500/10">
                                    {row.recipients.map(r => `${r.name}(${r.phone})`).join(', ')}
                                </td>
                                <td className="p-3 border-b border-blue-500/10">{row.businessType}</td>
                                <td className="p-3 border-b border-blue-500/10">{row.customerName}</td>
                                <td className="p-3 border-b border-blue-500/10">{row.customerCode}</td>
                                <td className="p-3 border-b border-blue-500/10 text-center sticky right-0 bg-[#0c2242] group-hover:bg-[#1e3a5f] transition-colors z-10 shadow-[-4px_0_8px_rgba(0,0,0,0.2)]">
                                    <div className="flex items-center justify-center gap-3">
                                        <button 
                                            onClick={() => handleEdit(row)}
                                            className="text-blue-400 hover:text-blue-300 transition-colors"
                                            title="编辑"
                                        >
                                            <EditIcon className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(row.id)}
                                            className="text-red-400 hover:text-red-300 transition-colors"
                                            title="删除"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-blue-300/50 border-b border-blue-500/10">暂无数据</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="h-10 bg-transparent border-t border-blue-500/20 flex items-center justify-between px-3 shrink-0">
                <div className="flex items-center gap-2">
                    <StyledButton variant="secondary" icon={<DownloadIcon className="w-3.5 h-3.5" />} className="h-7" onClick={() => alert('下载模版成功')}>
                        导入模版
                    </StyledButton>
                    <StyledButton variant="secondary" icon={<DownloadIcon className="w-3.5 h-3.5" />} className="h-7" onClick={() => alert('导入成功')}>
                        导入
                    </StyledButton>
                    <StyledButton variant="secondary" icon={<DownloadIcon className="w-3.5 h-3.5" />} className="h-7" onClick={() => alert('导出成功')}>
                        导出
                    </StyledButton>
                    <StyledButton variant="primary" icon={<PlusIcon className="w-3.5 h-3.5" />} onClick={() => { setEditingId(null); setIsAddModalOpen(true); }} className="h-7">
                        新增配置
                    </StyledButton>
                    <div className="w-px h-4 bg-blue-500/20"></div>
                    <StyledButton 
                        variant="danger"
                        onClick={handleBatchDelete}
                        disabled={selectedIds.size === 0}
                        icon={<TrashIcon className="w-3 h-3" />}
                        className="h-7"
                    >
                        删除
                    </StyledButton>
                </div>
                <Pagination 
                    currentPage={pagination.currentPage}
                    totalItems={filteredData.length}
                    pageSize={pagination.pageSize}
                    onPageChange={(page) => setPagination({ ...pagination, currentPage: page })}
                    onPageSizeChange={(size) => setPagination({ ...pagination, pageSize: size, currentPage: 1 })}
                    className="py-0 px-0"
                />
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="absolute inset-0 z-[50] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#0b1730] border border-blue-500/30 rounded-lg shadow-[0_0_30px_rgba(0,210,255,0.2)] w-full max-w-2xl flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-blue-500/20 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">{editingId ? '编辑短信发送配置' : '新增短信发送配置'}</h3>
                            <button onClick={() => { setIsAddModalOpen(false); setEditingId(null); }} className="text-gray-400 hover:text-white transition-colors">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                            {/* Product Instance Section */}
                            <div className="space-y-2">
                                <label className="text-xs text-blue-300 block">产品实例 <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <textarea 
                                        readOnly
                                        onClick={() => setIsServiceModalOpen(true)}
                                        className="w-full h-24 bg-[#020617] border border-blue-500/30 rounded p-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer placeholder:text-gray-600"
                                        placeholder="点击选择产品实例..."
                                        value={newConfig.productInstances.join(', ')}
                                    />
                                    <div className="absolute bottom-2 right-2 text-[10px] text-blue-500/50">点击区域选择业务</div>
                                </div>
                            </div>

                            {/* Recipients Section */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <label className="text-[12px] text-blue-300 block">故障短信受理人 <span className="text-red-500">*</span></label>
                                        {newConfig.recipients.length > 1 && (
                                            <StyledButton 
                                                variant="danger" 
                                                onClick={handleBatchRemoveRecipients}
                                                disabled={selectedRecipientIndexes.size === 0}
                                                className="h-7 px-2"
                                                icon={<TrashIcon className="w-3 h-3" />}
                                            >
                                                删除 ({selectedRecipientIndexes.size})
                                            </StyledButton>
                                        )}
                                    </div>
                                    <StyledButton variant="toolbar" onClick={handleAddRecipient} className="h-7" icon={<PlusIcon className="w-3.5 h-3.5" />}>
                                        添加受理人
                                    </StyledButton>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 px-2 py-1 bg-blue-500/10 border-b border-blue-500/20">
                                        <input 
                                            type="checkbox" 
                                            className="accent-blue-500 w-3.5 h-3.5 cursor-pointer"
                                            checked={selectedRecipientIndexes.size === newConfig.recipients.length && newConfig.recipients.length > 0}
                                            onChange={toggleAllRecipients}
                                        />
                                        <span className="text-[12px] text-blue-300 uppercase tracking-wider">全选</span>
                                    </div>
                                    {newConfig.recipients.map((recipient, index) => (
                                        <div key={index} className="flex items-center gap-3 bg-blue-500/5 p-2 rounded border border-blue-500/10">
                                            <input 
                                                type="checkbox" 
                                                className="accent-blue-500 w-3.5 h-3.5 cursor-pointer"
                                                checked={selectedRecipientIndexes.has(index)}
                                                onChange={() => toggleRecipientSelection(index)}
                                            />
                                            <div className="flex items-center gap-2 flex-1">
                                                <span className="text-[12px] text-blue-400 whitespace-nowrap">姓名:</span>
                                                <StyledInput 
                                                    placeholder="请输入姓名"
                                                    value={recipient.name}
                                                    onChange={(e) => handleRecipientChange(index, 'name', e.target.value)}
                                                    className="flex-1 !text-xs h-6"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 flex-1">
                                                <span className="text-[12px] text-blue-400 whitespace-nowrap">电话:</span>
                                                <StyledInput 
                                                    placeholder="请输入电话"
                                                    value={recipient.phone}
                                                    onChange={(e) => handleRecipientChange(index, 'phone', e.target.value)}
                                                    className="flex-1 !text-xs h-6"
                                                />
                                            </div>
                                            <button 
                                                onClick={() => handleRemoveRecipient(index)}
                                                disabled={newConfig.recipients.length === 1}
                                                className={`p-1 rounded transition-colors ${newConfig.recipients.length === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-red-400 hover:bg-red-500/20'}`}
                                            >
                                                <TrashIcon className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-blue-500/20 flex justify-end gap-3">
                            <StyledButton variant="secondary" onClick={() => setIsAddModalOpen(false)}>取消</StyledButton>
                            <StyledButton variant="primary" onClick={handleSaveConfig}>确认保存</StyledButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Service Selection Modal */}
            <ServiceSelectionModal 
                isOpen={isServiceModalOpen}
                onClose={() => setIsServiceModalOpen(false)}
                onConfirmMulti={handleServiceConfirm}
                isMultiSelect={true}
                title="业务查询选择"
                isImportantBusinessMode={true}
            />

            {/* Delete Confirmation Modal */}
            {deleteConfirmIds && (
                <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#0b1730] border border-blue-500/30 rounded-lg shadow-[0_0_30px_rgba(0,210,255,0.2)] w-[400px] flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                        <div className="flex items-center justify-between p-4 border-b border-blue-500/20">
                            <h3 className="text-white font-bold">确认删除</h3>
                            <button onClick={() => setDeleteConfirmIds(null)} className="text-gray-400 hover:text-white transition-colors">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-blue-100">
                                确定要删除选中的 <span className="text-red-400 font-bold">{deleteConfirmIds.length}</span> 条短信发送配置吗？此操作不可恢复。
                            </p>
                        </div>
                        <div className="p-4 border-t border-blue-500/20 flex justify-end gap-3">
                            <StyledButton variant="secondary" onClick={() => setDeleteConfirmIds(null)}>取消</StyledButton>
                            <StyledButton variant="danger" onClick={confirmDelete}>确定删除</StyledButton>
                        </div>
                    </div>
                </div>
            )}
            {/* Recipient Delete Confirmation Modal */}
            {recipientDeleteIndexes && (
                <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#0b1730] border border-blue-500/30 rounded-lg shadow-[0_0_30px_rgba(0,210,255,0.2)] w-[320px] flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                        <div className="flex items-center justify-between p-4 border-b border-blue-500/20">
                            <h3 className="text-white font-bold">确认移除</h3>
                            <button onClick={() => setRecipientDeleteIndexes(null)} className="text-gray-400 hover:text-white transition-colors">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-blue-100">
                                确定要移除选中的 <span className="text-red-400 font-bold">{recipientDeleteIndexes.length}</span> 位受理人吗？
                            </p>
                        </div>
                        <div className="p-4 border-t border-blue-500/20 flex justify-end gap-3">
                            <StyledButton variant="secondary" onClick={() => setRecipientDeleteIndexes(null)}>取消</StyledButton>
                            <StyledButton variant="danger" onClick={confirmRemoveRecipients}>确定移除</StyledButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
