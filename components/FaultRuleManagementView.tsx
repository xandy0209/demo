import React, { useState, useMemo } from 'react';
import { FaultRuleRecord } from '../types';
import { MOCK_FAULT_RULES } from '../constants';
import { StyledInput, StyledButton, StyledSelect } from './UI';
import { Pagination } from './Pagination';
import { DownloadIcon, SearchIcon, RefreshCwIcon, PlusIcon, XIcon, TrashIcon, EditIcon } from './Icons';

export const FaultRuleManagementView: React.FC = () => {
    const [data, setData] = useState<FaultRuleRecord[]>(MOCK_FAULT_RULES);
    const [filters, setFilters] = useState({ alarmObject: '', resourceInterface: '', faultResult: '', alarmTitle: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editRuleId, setEditRuleId] = useState<string | null>(null);
    const [deleteConfirmIds, setDeleteConfirmIds] = useState<string[] | null>(null);
    const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
    const [modalError, setModalError] = useState<string>('');
    const [newRule, setNewRule] = useState<Partial<FaultRuleRecord>>({
        alarmObject: '',
        resourceInterface: '',
        faultResult: '',
        alarmTitle: ''
    });

    const filteredData = useMemo(() => {
        return data.filter(item => {
            if (filters.alarmObject && item.alarmObject !== filters.alarmObject) return false;
            if (filters.resourceInterface && item.resourceInterface !== filters.resourceInterface) return false;
            if (filters.faultResult && !item.faultResult.includes(filters.faultResult)) return false;
            if (filters.alarmTitle && !item.alarmTitle.includes(filters.alarmTitle)) return false;
            return true;
        });
    }, [data, filters]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage, pageSize]);

    const handleReset = () => {
        setFilters({ alarmObject: '', resourceInterface: '', faultResult: '', alarmTitle: '' });
        setCurrentPage(1);
    };

    const handleDeleteClick = (id: string) => {
        setDeleteConfirmIds([id]);
    };

    const handleBatchDeleteClick = () => {
        if (selectedRowIds.size === 0) return;
        setDeleteConfirmIds(Array.from(selectedRowIds));
    };

    const confirmDelete = () => {
        if (deleteConfirmIds) {
            setData(data.filter(item => !deleteConfirmIds.includes(item.id)));
            setDeleteConfirmIds(null);
            setSelectedRowIds(new Set());
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const newSelected = new Set(selectedRowIds);
            paginatedData.forEach(item => newSelected.add(item.id));
            setSelectedRowIds(newSelected);
        } else {
            const newSelected = new Set(selectedRowIds);
            paginatedData.forEach(item => newSelected.delete(item.id));
            setSelectedRowIds(newSelected);
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedRowIds);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedRowIds(newSelected);
    };

    const isAllSelected = paginatedData.length > 0 && paginatedData.every(item => selectedRowIds.has(item.id));

    const handleEditClick = (rule: FaultRuleRecord) => {
        setEditRuleId(rule.id);
        setNewRule({ ...rule });
        setModalError('');
        setIsAddModalOpen(true);
    };

    const handleSaveRule = () => {
        if (!newRule.alarmObject) {
            setModalError('请选择告警对象');
            return;
        }
        if (!newRule.resourceInterface) {
            setModalError('请选择传输资源界面');
            return;
        }
        if (!newRule.alarmTitle) {
            setModalError('请输入告警标题');
            return;
        }
        if (!newRule.faultResult) {
            setModalError('请选择识别结果');
            return;
        }
        
        setModalError('');
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        const targetAlarmObject = newRule.alarmObject;
        const targetResourceInterface = newRule.resourceInterface;
        const targetFaultResult = newRule.faultResult;
        
        if (editRuleId) {
            // Edit mode
            const updatedData = data.map(item => {
                if (item.id === editRuleId) {
                    return {
                        ...item,
                        alarmObject: targetAlarmObject,
                        resourceInterface: targetResourceInterface,
                        faultResult: targetFaultResult,
                        alarmTitle: newRule.alarmTitle || '',
                        updateTime: formattedDate
                    };
                }
                return item;
            });
            setData(updatedData);
        } else {
            // Add mode with merge logic
            const existingRuleIndex = data.findIndex(
                r => r.alarmObject === targetAlarmObject &&
                     r.resourceInterface === targetResourceInterface &&
                     r.faultResult === targetFaultResult
            );

            if (existingRuleIndex >= 0) {
                const updatedData = [...data];
                const existingRule = updatedData[existingRuleIndex];
                
                const existingTitles = existingRule.alarmTitle.split(',').map(t => t.trim()).filter(Boolean);
                const newTitles = (newRule.alarmTitle || '').split(',').map(t => t.trim()).filter(Boolean);
                const mergedTitles = Array.from(new Set([...existingTitles, ...newTitles])).join(', ');
                
                existingRule.alarmTitle = mergedTitles;
                existingRule.updateTime = formattedDate;
                
                setData(updatedData);
            } else {
                const ruleToAdd: FaultRuleRecord = {
                    id: `rule-${Date.now()}`,
                    alarmObject: targetAlarmObject,
                    resourceInterface: targetResourceInterface,
                    faultResult: targetFaultResult,
                    alarmTitle: newRule.alarmTitle || '',
                    updateTime: formattedDate
                };
                setData([ruleToAdd, ...data]);
            }
        }
        
        setIsAddModalOpen(false);
        setEditRuleId(null);
        setNewRule({
            alarmObject: '',
            resourceInterface: '',
            faultResult: '',
            alarmTitle: ''
        });
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        setEditRuleId(null);
        setModalError('');
        setNewRule({
            alarmObject: '',
            resourceInterface: '',
            faultResult: '',
            alarmTitle: ''
        });
    };

    return (
        <div id="fault-rule-management-view" className="relative flex-1 flex flex-col h-full overflow-hidden bg-transparent border border-blue-500/30 shadow-[inset_0_0_20px_rgba(0,133,208,0.1)] text-white">
            {/* Search Bar */}
            <div className="bg-transparent p-3 border-b border-blue-500/20 flex flex-wrap items-center justify-between gap-y-3 gap-x-6 shrink-0">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-300 whitespace-nowrap">告警对象:</span>
                        <StyledSelect id="filter-alarm-object" value={filters.alarmObject} onChange={(e) => setFilters(prev => ({...prev, alarmObject: e.target.value}))} className="w-32">
                            <option value="">全部</option>
                            {['网元', '端口', '单板'].map(t => <option key={t} value={t}>{t}</option>)}
                        </StyledSelect>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-300 whitespace-nowrap">传输资源界面:</span>
                        <StyledSelect id="filter-resource-interface" value={filters.resourceInterface} onChange={(e) => setFilters(prev => ({...prev, resourceInterface: e.target.value}))} className="w-32">
                            <option value="">全部</option>
                            {['端', '路径'].map(t => <option key={t} value={t}>{t}</option>)}
                        </StyledSelect>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-300 whitespace-nowrap">识别结果:</span>
                        <StyledSelect id="filter-fault-result" value={filters.faultResult} onChange={(e) => setFilters(prev => ({...prev, faultResult: e.target.value}))} className="w-32">
                            <option value="">全部</option>
                            {['业务中断', '保护降级'].map(t => <option key={t} value={t}>{t}</option>)}
                        </StyledSelect>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-300 whitespace-nowrap">告警标题:</span>
                        <StyledInput id="filter-alarm-title" placeholder="请输入告警标题" value={filters.alarmTitle} onChange={(e) => setFilters(prev => ({...prev, alarmTitle: e.target.value}))} className="w-48" />
                    </div>
                    <div className="flex items-center gap-2">
                        <StyledButton id="btn-search" variant="toolbar" onClick={() => setCurrentPage(1)} icon={<SearchIcon />}>
                            查询
                        </StyledButton>
                        <StyledButton id="btn-secondary" variant="secondary" onClick={handleReset} icon={<RefreshCwIcon />}>
                            重置
                        </StyledButton>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto bg-transparent scrollbar-thin">
                <table className="w-full text-left text-sm whitespace-nowrap border-separate border-spacing-0">
                    <thead className="sticky top-0 bg-[#0c2242] text-white z-10 shadow-sm">
                        <tr>
                            <th className="p-3 font-semibold border-b border-blue-500/40 w-10 text-center">
                                <input 
                                    type="checkbox" 
                                    className="accent-blue-500"
                                    checked={isAllSelected}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th className="p-3 font-semibold border-b border-blue-500/40">告警对象</th>
                            <th className="p-3 font-semibold border-b border-blue-500/40">传输资源界面</th>
                            <th className="p-3 font-semibold border-b border-blue-500/40">告警标题</th>
                            <th className="p-3 font-semibold border-b border-blue-500/40">识别结果</th>
                            <th className="p-3 font-semibold border-b border-blue-500/40">最后修改时间</th>
                            <th className="p-3 font-semibold border-b border-blue-500/40 text-center sticky right-0 bg-[#0c2242] z-20">操作</th>
                        </tr>
                    </thead>
                    <tbody className="text-white">
                        {paginatedData.length > 0 ? (
                            paginatedData.map(item => (
                                <tr key={item.id} className="hover:bg-blue-600/10 transition-colors border-b border-blue-500/10 group">
                                    <td className="p-3 border-b border-blue-500/10 text-center">
                                        <input 
                                            type="checkbox" 
                                            className="accent-blue-500"
                                            checked={selectedRowIds.has(item.id)}
                                            onChange={(e) => handleSelectRow(item.id, e.target.checked)}
                                        />
                                    </td>
                                    <td className="p-3 border-b border-blue-500/10">{item.alarmObject}</td>
                                    <td className="p-3 border-b border-blue-500/10">{item.resourceInterface}</td>
                                    <td className="p-3 border-b border-blue-500/10 max-w-xs truncate" title={item.alarmTitle}>{item.alarmTitle}</td>
                                    <td className="p-3 border-b border-blue-500/10">{item.faultResult}</td>
                                    <td className="p-3 border-b border-blue-500/10">{item.updateTime}</td>
                                    <td className="p-3 border-b border-blue-500/10 text-center sticky right-0 bg-[#0c2242] group-hover:bg-[#1e3a5f] transition-colors">
                                        <div className="flex items-center justify-center gap-3">
                                            <button 
                                                onClick={() => handleEditClick(item)}
                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                                title="修改"
                                            >
                                                <EditIcon className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(item.id)}
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
                                <td colSpan={7} className="p-8 text-center text-blue-300/50 border-b border-blue-500/10 italic">暂无数据</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination & Actions */}
            <div className="h-10 bg-transparent border-t border-blue-500/20 flex items-center justify-between px-3 shrink-0">
                <div className="flex items-center gap-2">
                    <StyledButton id="btn-export" variant="secondary" className="h-7" onClick={() => alert('导出成功')} icon={<DownloadIcon className="w-3.5 h-3.5" />}>
                        导出
                    </StyledButton>
                    <StyledButton id="btn-add" variant="primary" onClick={() => { setEditRuleId(null); setIsAddModalOpen(true); }} className="h-7" icon={<PlusIcon className="w-3.5 h-3.5" />}>
                        新增规则
                    </StyledButton>
                    <div className="w-px h-4 bg-blue-500/20"></div>
                    <StyledButton 
                        variant="danger"
                        onClick={handleBatchDeleteClick}
                        disabled={selectedRowIds.size === 0}
                        icon={<TrashIcon className="w-3 h-3" />}
                        className="h-7"
                    >
                        删除
                    </StyledButton>
                </div>

                <Pagination 
                    currentPage={currentPage} 
                    totalItems={filteredData.length} 
                    pageSize={pageSize} 
                    onPageChange={setCurrentPage} 
                    onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }} 
                    className="py-0 px-0"
                />
            </div>

            {/* Add/Edit Rule Modal */}
            {isAddModalOpen && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#0b1730] border border-blue-500/30 rounded-lg shadow-[0_0_30px_rgba(0,210,255,0.2)] w-[500px] flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                        <div className="flex items-center justify-between p-4 border-b border-blue-500/20">
                            <h3 className="text-lg font-bold text-white tracking-wider">{editRuleId ? '修改故障识别规则' : '添加故障识别规则'}</h3>
                            <button onClick={closeAddModal} className="text-gray-400 hover:text-white transition-colors">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            {modalError && (
                                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-2 rounded text-sm">
                                    {modalError}
                                </div>
                            )}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-blue-300">告警对象 <span className="text-red-500">*</span></label>
                                <StyledSelect 
                                    value={newRule.alarmObject} 
                                    onChange={(e) => setNewRule({...newRule, alarmObject: e.target.value})}
                                    className="w-full"
                                >
                                    <option value="">请选择</option>
                                    {['网元', '端口', '单板'].map(t => <option key={t} value={t}>{t}</option>)}
                                </StyledSelect>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-blue-300">传输资源界面 <span className="text-red-500">*</span></label>
                                <StyledSelect 
                                    value={newRule.resourceInterface} 
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        let updatedFaultResult = newRule.faultResult || '';
                                        if (val === '端' && updatedFaultResult.includes('保护降级')) {
                                            updatedFaultResult = updatedFaultResult.split('/').filter(t => t !== '保护降级').join('/');
                                        }
                                        setNewRule({...newRule, resourceInterface: val, faultResult: updatedFaultResult});
                                    }}
                                    className="w-full"
                                >
                                    <option value="">请选择</option>
                                    {['端', '路径'].map(t => <option key={t} value={t}>{t}</option>)}
                                </StyledSelect>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-blue-300">告警标题 <span className="text-red-500">*</span></label>
                                <textarea 
                                    value={newRule.alarmTitle} 
                                    onChange={(e) => setNewRule({...newRule, alarmTitle: e.target.value})}
                                    placeholder="请输入告警标题（多个用逗号分隔）"
                                    className="w-full bg-[#020617] border border-blue-500/30 rounded p-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600 min-h-[80px] resize-y"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-blue-300">识别结果 <span className="text-red-500">*</span></label>
                                <div className="flex items-center gap-6 mt-1">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            className="accent-blue-500"
                                            checked={newRule.faultResult?.includes('业务中断') || false}
                                            onChange={(e) => {
                                                const current = newRule.faultResult ? newRule.faultResult.split('/') : [];
                                                let next = [...current];
                                                if (e.target.checked) {
                                                    if (!next.includes('业务中断')) next.push('业务中断');
                                                } else {
                                                    next = next.filter(t => t !== '业务中断');
                                                }
                                                // Ensure correct order
                                                const sorted = ['业务中断', '保护降级'].filter(t => next.includes(t));
                                                setNewRule({...newRule, faultResult: sorted.join('/')});
                                            }}
                                        />
                                        <span className="text-sm text-white group-hover:text-blue-300 transition-colors">业务中断</span>
                                    </label>
                                    {newRule.resourceInterface !== '端' && (
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input 
                                                type="checkbox" 
                                                className="accent-blue-500"
                                                checked={newRule.faultResult?.includes('保护降级') || false}
                                                onChange={(e) => {
                                                    const current = newRule.faultResult ? newRule.faultResult.split('/') : [];
                                                    let next = [...current];
                                                    if (e.target.checked) {
                                                        if (!next.includes('保护降级')) next.push('保护降级');
                                                    } else {
                                                        next = next.filter(t => t !== '保护降级');
                                                    }
                                                    // Ensure correct order
                                                    const sorted = ['业务中断', '保护降级'].filter(t => next.includes(t));
                                                    setNewRule({...newRule, faultResult: sorted.join('/')});
                                                }}
                                            />
                                            <span className="text-sm text-white group-hover:text-blue-300 transition-colors">保护降级</span>
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-blue-500/20 flex justify-end gap-3">
                            <StyledButton variant="secondary" onClick={closeAddModal}>取消</StyledButton>
                            <StyledButton variant="primary" onClick={handleSaveRule}>确定</StyledButton>
                        </div>
                    </div>
                </div>
            )}

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
                                确定要删除选中的 <span className="text-red-400 font-bold">{deleteConfirmIds.length}</span> 条故障识别规则吗？此操作不可恢复。
                            </p>
                        </div>
                        <div className="p-4 border-t border-blue-500/20 flex justify-end gap-3">
                            <StyledButton variant="secondary" onClick={() => setDeleteConfirmIds(null)}>取消</StyledButton>
                            <StyledButton variant="danger" onClick={confirmDelete}>确定删除</StyledButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
