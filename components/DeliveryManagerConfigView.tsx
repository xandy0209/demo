import React, { useState } from 'react';
import { PortraitIndicator } from '../types';
import { MOCK_DELIVERY_MANAGER_INDICATORS } from '../constants';
import { StyledInput, StyledButton } from './UI';
import { SettingsIcon, PlusCircleIcon, XIcon, EditIcon, TrashIcon, CheckCircleIcon, AlertCircleIcon } from './Icons';

export const DeliveryManagerConfigView: React.FC = () => {
    const [indicators, setIndicators] = useState<PortraitIndicator[]>(MOCK_DELIVERY_MANAGER_INDICATORS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isApplied, setIsApplied] = useState(true);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [newIndicator, setNewIndicator] = useState<Partial<PortraitIndicator>>({
        name: '',
        algorithm: '',
        weight: 0,
        scoringRule: ''
    });

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleApply = () => {
        const totalWeight = indicators.reduce((sum, ind) => sum + (Number(ind.weight) || 0), 0);
        if (totalWeight === 100) {
            setIsApplied(true);
            showNotification('success', '配置应用成功！当前权重总和为 100%');
        } else {
            showNotification('error', `配置应用失败：当前权重总和为 ${totalWeight}%，必须等于 100%`);
        }
    };

    const handleSave = () => {
        if (newIndicator.name && newIndicator.algorithm) {
            setIsApplied(false);
            if (editingId) {
                setIndicators(indicators.map(ind => 
                    ind.id === editingId 
                    ? { ...ind, ...newIndicator as PortraitIndicator } 
                    : ind
                ));
            } else {
                const indicator: PortraitIndicator = {
                    id: `ind-${Date.now()}`,
                    name: newIndicator.name!,
                    algorithm: newIndicator.algorithm!,
                    weight: Number(newIndicator.weight) || 0,
                    scoringRule: newIndicator.scoringRule || ''
                };
                setIndicators([...indicators, indicator]);
            }
            setIsModalOpen(false);
            setEditingId(null);
            setNewIndicator({ name: '', algorithm: '', weight: 0, scoringRule: '' });
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        setNewIndicator({ name: '', algorithm: '', weight: 0, scoringRule: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (ind: PortraitIndicator) => {
        setEditingId(ind.id);
        setNewIndicator({
            name: ind.name,
            algorithm: ind.algorithm,
            weight: ind.weight,
            scoringRule: ind.scoringRule
        });
        setIsModalOpen(true);
    };

    const handleDelete = () => {
        if (deletingId) {
            setIndicators(indicators.filter(i => i.id !== deletingId));
            setDeletingId(null);
            setIsApplied(false);
        }
    };

    return (
        <div className="relative flex-1 flex flex-col h-full overflow-hidden bg-transparent border border-blue-500/30 shadow-[inset_0_0_20px_rgba(0,133,208,0.1)] text-white">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between p-3 border-b border-blue-500/20 bg-transparent shrink-0">
                <div className="flex items-center gap-3">
                    <span className="text-xs text-blue-300">配置状态：</span>
                    {isApplied ? (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded-full">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] text-green-400 font-medium">已应用生效</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-full">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                            <span className="text-[10px] text-amber-400 font-medium">待应用（已修改）</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <StyledButton variant="outline" icon={<CheckCircleIcon className="text-green-400" />} onClick={handleApply}>配置应用</StyledButton>
                    <StyledButton variant="primary" icon={<PlusCircleIcon />} onClick={openAddModal}>新增指标</StyledButton>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto scrollbar-thin">
                <table className="w-full text-left text-xs whitespace-nowrap border-separate border-spacing-0">
                    <thead className="sticky top-0 bg-[#0c2242] text-blue-200 z-10 shadow-sm">
                        <tr>
                            <th className="p-3 border-b border-blue-500/20 font-medium">指标名称</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium">计算算法</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium">权重 (%)</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium">打分规则</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium text-center">操作</th>
                        </tr>
                    </thead>
                    <tbody className="text-white">
                        {indicators.map(ind => (
                            <tr key={ind.id} className="hover:bg-[#1e3a5f]/60 transition-colors border-b border-blue-500/10 last:border-0">
                                <td className="p-3 border-b border-blue-500/10">{ind.name}</td>
                                <td className="p-3 border-b border-blue-500/10 font-mono text-blue-300">{ind.algorithm}</td>
                                <td className="p-3 border-b border-blue-500/10 text-neon-blue font-bold">{ind.weight}%</td>
                                <td className="p-3 border-b border-blue-500/10 text-gray-300 italic">{ind.scoringRule}</td>
                                <td className="p-3 border-b border-blue-500/10 text-center">
                                    <div className="flex items-center justify-center gap-4">
                                        <button 
                                            className="text-blue-400 hover:text-neon-blue transition-colors p-1 hover:bg-blue-500/10 rounded-sm"
                                            onClick={() => openEditModal(ind)}
                                            title="编辑"
                                        >
                                            <EditIcon className="w-4 h-4" />
                                        </button>
                                        <button 
                                            className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-500/10 rounded-sm" 
                                            onClick={() => setDeletingId(ind.id)}
                                            title="删除"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Modal */}
            {isModalOpen && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#0b1730] border border-blue-500/30 p-6 w-[500px] shadow-[0_0_30px_rgba(0,210,255,0.4)] rounded-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <PlusCircleIcon className="w-5 h-5 text-neon-blue" />
                                {editingId ? '编辑交付画像指标' : '新增交付画像指标'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-blue-300 mb-1">指标名称</label>
                                <StyledInput 
                                    className="w-full" 
                                    value={newIndicator.name} 
                                    onChange={e => setNewIndicator({...newIndicator, name: e.target.value})} 
                                    placeholder="如：开通及时率"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-blue-300 mb-1">计算算法</label>
                                <StyledInput 
                                    className="w-full font-mono" 
                                    value={newIndicator.algorithm} 
                                    onChange={e => setNewIndicator({...newIndicator, algorithm: e.target.value})} 
                                    placeholder="如：count(及时) / count(总数)"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-blue-300 mb-1">权重 (%)</label>
                                <StyledInput 
                                    type="number"
                                    className="w-full" 
                                    value={newIndicator.weight} 
                                    onChange={e => setNewIndicator({...newIndicator, weight: Number(e.target.value)})} 
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-blue-300 mb-1">打分规则</label>
                                <textarea 
                                    className="w-full bg-[#0c2242] border border-blue-500/30 rounded-sm p-2 text-xs text-white focus:outline-none focus:border-neon-blue transition-colors h-20"
                                    value={newIndicator.scoringRule}
                                    onChange={e => setNewIndicator({...newIndicator, scoringRule: e.target.value})}
                                    placeholder="描述具体的扣分或加分逻辑"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <StyledButton variant="outline" onClick={() => setIsModalOpen(false)}>取消</StyledButton>
                                <StyledButton variant="primary" onClick={handleSave}>保存配置</StyledButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {deletingId && (
                <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#0b1730] border border-blue-500/30 rounded-lg shadow-[0_0_30px_rgba(0,210,255,0.2)] w-[400px] flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                        <div className="flex items-center justify-between p-4 border-b border-blue-500/20">
                            <h3 className="text-white font-bold">确认删除</h3>
                            <button onClick={() => setDeletingId(null)} className="text-gray-400 hover:text-white transition-colors">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-blue-100">
                                确定要删除该指标配置吗？此操作不可撤销。
                            </p>
                        </div>
                        <div className="p-4 border-t border-blue-500/20 flex justify-end gap-3">
                            <StyledButton variant="secondary" onClick={() => setDeletingId(null)}>取消</StyledButton>
                            <StyledButton variant="danger" onClick={handleDelete}>确定删除</StyledButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Toast */}
            {notification && (
                <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3 border shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 ${
                    notification.type === 'success' 
                    ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                    : 'bg-red-500/20 border-red-500/50 text-red-400'
                }`}>
                    {notification.type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <AlertCircleIcon className="w-5 h-5" />}
                    <span className="text-sm font-bold">{notification.message}</span>
                </div>
            )}
        </div>
    );
};
