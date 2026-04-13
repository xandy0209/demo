
import React, { useState } from 'react';
import { StyledButton, StyledInput, StyledSelect } from './UI';
import { DownloadIcon, PlusCircleIcon, XIcon, FolderIcon, EditIcon, TrashIcon } from './Icons';
import { MOCK_SUBSCRIPTION_DATA } from '../constants';
import { Pagination } from './Pagination';

interface GeneralRule {
    id: string;
    businessCategory: string;
    configConditions: string[];
    deadline: string;
    configTime: string;
    configurator: string;
}

interface PersonalRule {
    id: string;
    filename: string;
    deadline: string;
    configTime: string;
    configurator: string;
}

const businessCategories = ['专线', '企宽'];
const serviceLevels = ['AAA', 'AA', 'A', '普通'];
const broadbandConditions = ['统付', '个付'];
const MOCK_USER = '吴军校 (13800138000)';

export const ConfigCapabilitiesView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'personal'>('general');

    // --- General Config State ---
    const [genRules, setGenRules] = useState<GeneralRule[]>([
        { 
            id: '1', 
            businessCategory: '专线', 
            configConditions: ['AAA', 'AA'], 
            deadline: '4',
            configTime: '2025-01-15 09:30:21',
            configurator: '张三 (13900000001)'
        },
        { 
            id: '2', 
            businessCategory: '企宽', 
            configConditions: ['统付'], 
            deadline: '12',
            configTime: '2025-01-16 14:20:10',
            configurator: '李四 (13900000002)'
        },
        { 
            id: '3', 
            businessCategory: '企宽', 
            configConditions: ['个付'], 
            deadline: '24',
            configTime: '2025-02-10 10:15:45',
            configurator: '王五 (13900000003)'
        },
    ]);
    const [genForm, setGenForm] = useState({
        category: '专线',
        levels: [] as string[],
        deadline: ''
    });
    const [editingGenRule, setEditingGenRule] = useState<GeneralRule | null>(null);

    // --- Personal Config State ---
    const [perRules, setPerRules] = useState<PersonalRule[]>([
        { 
            id: '1', 
            filename: '2025重点客户保障清单.xlsx', 
            deadline: '2', 
            configTime: '2025-02-15 10:30:00',
            configurator: MOCK_USER
        }
    ]);
    const [perForm, setPerForm] = useState({
        deadline: '',
        filename: ''
    });

    // --- Batch Detail Modal State ---
    const [selectedBatch, setSelectedBatch] = useState<PersonalRule | null>(null);
    const [batchItems, setBatchItems] = useState<any[]>([]);
    const [selectedBatchItemIds, setSelectedBatchItemIds] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Delete Confirmation State
    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    const showDeleteConfirm = (title: string, message: string, onConfirm: () => void) => {
        setDeleteConfirm({ isOpen: true, title, message, onConfirm });
    };

    const closeDeleteConfirm = () => {
        setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
    };

    // --- General Handlers ---
    const handleLevelToggle = (level: string) => {
        setGenForm(prev => {
            if (prev.levels.includes(level)) {
                return { ...prev, levels: prev.levels.filter(l => l !== level) };
            } else {
                return { ...prev, levels: [...prev.levels, level] };
            }
        });
    };

    const addGeneralRule = () => {
        if (!genForm.deadline || genForm.levels.length === 0) {
            alert('请选择保障等级并输入处理时限');
            return;
        }
        setGenRules([...genRules, {
            id: Date.now().toString(),
            businessCategory: genForm.category,
            configConditions: genForm.levels,
            deadline: genForm.deadline,
            configTime: new Date().toLocaleString().replace(/\//g, '-'),
            configurator: MOCK_USER
        }]);
        setGenForm({ category: '专线', levels: [], deadline: '' });
    };

    const deleteGenRule = (id: string) => {
        showDeleteConfirm('确认删除', '确定要删除这条通用配置规则吗？此操作不可恢复。', () => {
            setGenRules(genRules.filter(r => r.id !== id));
        });
    };

    const handleEditGenRule = (rule: GeneralRule) => {
        setEditingGenRule(rule);
    };

    const saveEditedGenRule = () => {
        if (!editingGenRule) return;
        if (!editingGenRule.deadline || editingGenRule.configConditions.length === 0) {
            alert('请选择保障等级并输入处理时限');
            return;
        }
        setGenRules(genRules.map(r => r.id === editingGenRule.id ? editingGenRule : r));
        setEditingGenRule(null);
    };

    // --- Personal Handlers ---
    const handleDownloadTemplate = () => {
        // Mock download
        alert('正在下载专线清单导入模板...');
    };

    const handleImport = () => {
        // Mock import
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx, .xls';
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            if (file) {
                setPerForm(prev => ({ ...prev, filename: file.name }));
            }
        };
        input.click();
    };

    const addPersonalRule = () => {
        if (!perForm.deadline || !perForm.filename) {
            alert('请导入清单并输入处理时限');
            return;
        }
        setPerRules([...perRules, {
            id: Date.now().toString(),
            filename: perForm.filename,
            deadline: perForm.deadline,
            configTime: new Date().toLocaleString().replace(/\//g, '-'),
            configurator: MOCK_USER
        }]);
        setPerForm({ deadline: '', filename: '' });
    };

    const deletePerRule = (id: string) => {
        showDeleteConfirm('确认删除', '确定要删除这条个性化配置规则吗？此操作不可恢复。', () => {
            setPerRules(perRules.filter(r => r.id !== id));
        });
    };

    // --- Batch Modal Handlers ---
    const handleOpenBatch = (rule: PersonalRule) => {
        setSelectedBatch(rule);
        setCurrentPage(1); // Reset pagination
        setSelectedBatchItemIds(new Set()); // Reset selection
        // Mock data generation: reusing subscription mock data and mapping to required fields
        const mockDetails = MOCK_SUBSCRIPTION_DATA.map(item => ({
            id: item.id,
            productInstance: item.productInstance,
            serviceType: item.serviceType,
            customerName: item.customerName,
            customerCode: item.customerCode,
            assuranceLevelA: item.assuranceLevel || 'A', // Mocking separate levels if single source
            assuranceLevelZ: item.assuranceLevel || 'A',
            cityA: item.cityA,
            cityZ: item.cityZ
        }));
        setBatchItems(mockDetails);
    };

    const handleDeleteBatchItem = (itemId: string) => {
        showDeleteConfirm('确认删除', '确定要从清单中删除此业务吗？此操作不可恢复。', () => {
            setBatchItems(prev => prev.filter(i => i.id !== itemId));
            setSelectedBatchItemIds(prev => {
                const next = new Set(prev);
                next.delete(itemId);
                return next;
            });
        });
    };

    const handleBatchDeleteItems = () => {
        if (selectedBatchItemIds.size === 0) {
            alert('请先选择要删除的业务');
            return;
        }
        showDeleteConfirm('确认批量删除', `确定要删除选中的 ${selectedBatchItemIds.size} 条业务吗？此操作不可恢复。`, () => {
            setBatchItems(prev => prev.filter(i => !selectedBatchItemIds.has(i.id)));
            setSelectedBatchItemIds(new Set());
        });
    };

    const toggleBatchItemSelection = (id: string) => {
        setSelectedBatchItemIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const toggleSelectAllBatchItems = () => {
        if (selectedBatchItemIds.size === batchItems.length) {
            setSelectedBatchItemIds(new Set());
        } else {
            setSelectedBatchItemIds(new Set(batchItems.map(i => i.id)));
        }
    };

    // Pagination Logic for Modal
    const paginatedItems = batchItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="flex flex-col h-full bg-transparent text-blue-100 animate-[fadeIn_0.3s_ease-out] overflow-hidden border border-blue-500/30 shadow-[inset_0_0_20px_rgba(0,133,208,0.1)]">
            
            {/* Tab Switcher - Updated style to match ComplaintStatsView */}
            <div className="flex items-end pt-4">
                <div className="w-6 border-b border-blue-500/30"></div>
                {[
                    { id: 'general', label: '通用配置' },
                    { id: 'personal', label: '个性化配置' }
                ].map((tab, index) => (
                    <React.Fragment key={tab.id}>
                        {index > 0 && <div className="w-1 border-b border-blue-500/30"></div>}
                        <button
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                                px-6 py-2 text-sm font-medium transition-all relative rounded-t-sm border-t border-l border-r border-b
                                ${activeTab === tab.id 
                                    ? 'text-neon-blue bg-transparent border-blue-500/30 border-b-transparent z-10' 
                                    : 'text-gray-400 border-t-transparent border-l-transparent border-r-transparent border-b-blue-500/30 hover:text-gray-200 hover:bg-white/5'}
                            `}
                        >
                            {tab.label}
                        </button>
                    </React.Fragment>
                ))}
                <div className="flex-1 border-b border-blue-500/30"></div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                
                {/* --- General Configuration Content --- */}
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        {/* Config Form Panel - Left to Right, Evenly Distributed (Not Proportional) */}
                        <div className="bg-transparent p-4 border border-blue-500/20 rounded-sm shadow-sm">
                            <h3 className="text-sm font-bold text-neon-blue mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-neon-blue"></span>
                                新增规则
                            </h3>
                            
                            <div className="flex flex-wrap items-center justify-start gap-x-12 gap-y-4 w-full">
                                {/* Business Category */}
                                <div className="flex items-center gap-3">
                                    <label className="text-xs text-white shrink-0">业务分类：</label>
                                    <div className="flex flex-wrap gap-4">
                                        {businessCategories.map(cat => (
                                            <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                                                <input 
                                                    type="radio" 
                                                    name="category" 
                                                    className="accent-neon-blue w-3.5 h-3.5"
                                                    checked={genForm.category === cat}
                                                    onChange={() => setGenForm(prev => ({ ...prev, category: cat, levels: [] }))}
                                                />
                                                <span className={`text-sm ${genForm.category === cat ? 'text-white' : 'text-white group-hover:text-blue-200'}`}>
                                                    {cat}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Configuration Conditions */}
                                <div className="flex items-center gap-3">
                                    <label className="text-xs text-white shrink-0">配置条件：</label>
                                    <div className="flex flex-wrap gap-4">
                                        {(genForm.category === '企宽' ? broadbandConditions : serviceLevels).map(level => (
                                            <label key={level} className="flex items-center gap-2 cursor-pointer group">
                                                <input 
                                                    type="checkbox" 
                                                    className="accent-neon-blue w-3.5 h-3.5"
                                                    checked={genForm.levels.includes(level)}
                                                    onChange={() => handleLevelToggle(level)}
                                                />
                                                <span className={`text-sm ${genForm.levels.includes(level) ? 'text-white' : 'text-white group-hover:text-blue-200'}`}>
                                                    {level}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Deadline & Button */}
                                <div className="flex items-center gap-3">
                                    <label className="text-xs text-white shrink-0">处理时限(小时)：</label>
                                    <StyledInput 
                                        type="number" 
                                        className="w-20" 
                                        placeholder="4"
                                        value={genForm.deadline}
                                        onChange={e => setGenForm(prev => ({ ...prev, deadline: e.target.value }))}
                                    />
                                    <StyledButton onClick={addGeneralRule} icon={<PlusCircleIcon />}>
                                        添加规则
                                    </StyledButton>
                                </div>
                            </div>
                        </div>

                        {/* Rules List Table */}
                        <div className="border border-blue-500/20 bg-transparent">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#0c2242] text-white">
                                    <tr>
                                        <th className="p-3 border-b border-blue-500/20 font-medium">业务分类</th>
                                        <th className="p-3 border-b border-blue-500/20 font-medium">配置条件</th>
                                        <th className="p-3 border-b border-blue-500/20 font-medium">处理时限 (小时)</th>
                                        <th className="p-3 border-b border-blue-500/20 font-medium">配置时间</th>
                                        <th className="p-3 border-b border-blue-500/20 font-medium">配置人</th>
                                        <th className="p-3 border-b border-blue-500/20 font-medium w-24 text-center">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="text-blue-100">
                                    {genRules.length > 0 ? (
                                        genRules.map((rule, idx) => (
                                            <tr key={rule.id} className={`hover:bg-blue-600/10 transition-colors ${idx % 2 === 1 ? 'bg-[#0b1730]/30' : ''}`}>
                                                <td className="p-3 border-b border-blue-500/10">{rule.businessCategory}</td>
                                                <td className="p-3 border-b border-blue-500/10">
                                                    <div className="flex gap-2">
                                                        {rule.configConditions.map(l => (
                                                            <span key={l} className="px-2 py-0.5 bg-blue-500/20 text-neon-blue rounded-sm text-xs border border-blue-500/30">
                                                                {l}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-3 border-b border-blue-500/10 font-bold text-white">{rule.deadline}</td>
                                                <td className="p-3 border-b border-blue-500/10 text-gray-400 text-xs font-mono">{rule.configTime}</td>
                                                <td className="p-3 border-b border-blue-500/10 text-blue-300">{rule.configurator}</td>
                                                <td className="p-3 border-b border-blue-500/10 text-center">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button 
                                                            onClick={() => handleEditGenRule(rule)}
                                                            className="text-blue-400 hover:text-neon-blue transition-colors p-1"
                                                            title="修改"
                                                        >
                                                            <EditIcon />
                                                        </button>
                                                        <button 
                                                            onClick={() => deleteGenRule(rule.id)}
                                                            className="text-red-400 hover:text-red-300 transition-colors p-1"
                                                            title="删除"
                                                        >
                                                            <TrashIcon />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-blue-300/50">暂无配置规则</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- Personalized Configuration Content --- */}
                {activeTab === 'personal' && (
                    <div className="space-y-6">
                        {/* Config Form Panel - Left to Right, Evenly Distributed (Not Proportional) */}
                        <div className="bg-transparent p-4 border border-blue-500/20 rounded-sm shadow-sm">
                            <h3 className="text-sm font-bold text-neon-blue mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-neon-blue"></span>
                                导入配置
                            </h3>
                            
                            <div className="flex flex-wrap items-center justify-start gap-10 w-full">
                                {/* Import Section */}
                                <div className="flex items-center gap-3">
                                    <label className="text-xs text-white shrink-0">专线清单导入：</label>
                                    <div className="flex items-center gap-3">
                                        <StyledButton variant="secondary" onClick={handleDownloadTemplate} icon={<DownloadIcon />}>
                                            下载模版
                                        </StyledButton>
                                        <StyledButton variant="outline" onClick={handleImport} icon={<FolderIcon />}>
                                            导入清单
                                        </StyledButton>
                                        {perForm.filename && (
                                            <div className="flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                                <span className="text-xs text-green-400">
                                                    {perForm.filename}
                                                </span>
                                                <button 
                                                    onClick={() => setPerForm(prev => ({ ...prev, filename: '' }))}
                                                    className="text-blue-300 hover:text-white transition-colors"
                                                    title="删除文件"
                                                >
                                                    <XIcon />
                                                </button>
                                            </div>
                                        )}
                                        {!perForm.filename && <span className="text-[10px] text-gray-500">* 仅支持 .xlsx 格式</span>}
                                    </div>
                                </div>

                                {/* Deadline & Button */}
                                <div className="flex items-center gap-3">
                                    <label className="text-xs text-white shrink-0">处理时限(小时)：</label>
                                    <StyledInput 
                                        type="number" 
                                        className="w-20" 
                                        placeholder="2"
                                        value={perForm.deadline}
                                        onChange={e => setPerForm(prev => ({ ...prev, deadline: e.target.value }))}
                                    />
                                    <StyledButton onClick={addPersonalRule} icon={<PlusCircleIcon />}>
                                        保存配置
                                    </StyledButton>
                                </div>
                            </div>
                        </div>

                        {/* Rules List Table */}
                        <div className="border border-blue-500/20 bg-transparent">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#0c2242] text-white">
                                    <tr>
                                        {/* Header Changed from "导入清单批次" */}
                                        <th className="p-3 border-b border-blue-500/20 font-medium">配置业务清单</th>
                                        <th className="p-3 border-b border-blue-500/20 font-medium">处理时限 (小时)</th>
                                        <th className="p-3 border-b border-blue-500/20 font-medium">配置时间</th>
                                        <th className="p-3 border-b border-blue-500/20 font-medium">配置人</th>
                                        <th className="p-3 border-b border-blue-500/20 font-medium w-24 text-center">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="text-blue-100">
                                    {perRules.length > 0 ? (
                                        perRules.map((rule, idx) => (
                                            <tr key={rule.id} className={`hover:bg-blue-600/10 transition-colors ${idx % 2 === 1 ? 'bg-[#0b1730]/30' : ''}`}>
                                                <td className="p-3 border-b border-blue-500/10">
                                                    {/* Changed text from rule.filename to '查看业务清单' */}
                                                    <button 
                                                        onClick={() => handleOpenBatch(rule)}
                                                        className="flex items-center gap-2 text-blue-300 hover:text-neon-blue hover:underline transition-colors group"
                                                    >
                                                        <FolderIcon />
                                                        查看业务清单
                                                    </button>
                                                </td>
                                                <td className="p-3 border-b border-blue-500/10 font-bold text-white">{rule.deadline}</td>
                                                <td className="p-3 border-b border-blue-500/10 text-gray-400 text-xs font-mono">{rule.configTime}</td>
                                                <td className="p-3 border-b border-blue-500/10 text-blue-300">{rule.configurator}</td>
                                                <td className="p-3 border-b border-blue-500/10 text-center">
                                                    <button 
                                                        onClick={() => deletePerRule(rule.id)}
                                                        className="text-red-400 hover:text-red-300 transition-colors p-1"
                                                    >
                                                        <XIcon />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-blue-300/50">暂无个性化配置</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>

            {/* --- Batch Detail Modal --- */}
            {selectedBatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1730]/70 backdrop-blur-[2px]">
                    <div className="w-[1000px] bg-[#0f172a] border border-blue-500/30 text-blue-100 font-sans shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col max-h-[60vh] animate-[fadeIn_0.2s_ease-out]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-2 bg-[#0c2242]/70 border-b border-blue-500/30 shrink-0 h-[40px]">
                            <div className="flex items-center gap-4">
                                <span className="text-base font-bold text-white tracking-wide">业务清单详情</span>
                            </div>
                            <button onClick={() => setSelectedBatch(null)} className="text-blue-400 hover:text-white transition-colors">
                                <XIcon />
                            </button>
                        </div>
                        
                        {/* Modal Body (Table) */}
                        <div className="flex-1 overflow-auto p-0 scrollbar-thin">
                            <table className="w-full text-left text-xs">
                                <thead className="sticky top-0 bg-[#0c2242] text-blue-200 shadow-sm z-10">
                                    <tr>
                                        <th className="p-3 border-b border-blue-500/30 font-medium w-10 text-center">
                                            <input 
                                                type="checkbox" 
                                                className="accent-neon-blue cursor-pointer"
                                                checked={batchItems.length > 0 && selectedBatchItemIds.size === batchItems.length}
                                                onChange={toggleSelectAllBatchItems}
                                            />
                                        </th>
                                        <th className="p-3 border-b border-blue-500/30 font-medium whitespace-nowrap">产品实例</th>
                                        <th className="p-3 border-b border-blue-500/30 font-medium whitespace-nowrap">业务类型</th>
                                        <th className="p-3 border-b border-blue-500/30 font-medium whitespace-nowrap">客户名称</th>
                                        <th className="p-3 border-b border-blue-500/30 font-medium whitespace-nowrap">客户编号</th>
                                        <th className="p-3 border-b border-blue-500/30 font-medium whitespace-nowrap">A端保障等级</th>
                                        <th className="p-3 border-b border-blue-500/30 font-medium whitespace-nowrap">Z端保障等级</th>
                                        <th className="p-3 border-b border-blue-500/30 font-medium whitespace-nowrap">A端地市</th>
                                        <th className="p-3 border-b border-blue-500/30 font-medium whitespace-nowrap">Z端地市</th>
                                        <th className="p-3 border-b border-blue-500/30 font-medium whitespace-nowrap text-center">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedItems.length > 0 ? (
                                        paginatedItems.map((item, idx) => (
                                            <tr 
                                                key={item.id} 
                                                className={`hover:bg-blue-600/10 transition-colors border-b border-blue-500/10 ${idx % 2 === 1 ? 'bg-[#015478]/20' : ''} ${selectedBatchItemIds.has(item.id) ? 'bg-blue-500/10' : ''}`}
                                                onClick={() => toggleBatchItemSelection(item.id)}
                                            >
                                                <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <input 
                                                        type="checkbox" 
                                                        className="accent-neon-blue cursor-pointer"
                                                        checked={selectedBatchItemIds.has(item.id)}
                                                        onChange={() => toggleBatchItemSelection(item.id)}
                                                    />
                                                </td>
                                                <td className="p-3 font-mono text-neon-blue">{item.productInstance}</td>
                                                <td className="p-3 text-white">{item.serviceType}</td>
                                                <td className="p-3 text-white">{item.customerName}</td>
                                                <td className="p-3 text-gray-400">{item.customerCode}</td>
                                                <td className="p-3 text-blue-300">{item.assuranceLevelA}</td>
                                                <td className="p-3 text-blue-300">{item.assuranceLevelZ}</td>
                                                <td className="p-3 text-gray-300">{item.cityA}</td>
                                                <td className="p-3 text-gray-300">{item.cityZ}</td>
                                                <td className="p-3 text-center">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteBatchItem(item.id); }}
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1 rounded transition-colors"
                                                    >
                                                        删除
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={10} className="p-8 text-center text-gray-500">清单为空</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Modal Footer with Pagination */}
                        <div className="bg-[#1e293b]/50 border-t border-blue-500/30 flex items-center justify-between px-4">
                            <div className="flex items-center">
                                {selectedBatchItemIds.size > 0 && (
                                    <button 
                                        onClick={handleBatchDeleteItems}
                                        className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-sm text-xs hover:bg-red-500/30 transition-all"
                                    >
                                        <TrashIcon className="w-3 h-3" />
                                        批量删除 ({selectedBatchItemIds.size})
                                    </button>
                                )}
                            </div>
                            <Pagination 
                                currentPage={currentPage}
                                totalItems={batchItems.length}
                                pageSize={pageSize}
                                onPageChange={setCurrentPage}
                                onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                            />
                        </div>
                    </div>
                </div>
            )}
            {/* --- General Rule Edit Modal --- */}
            {editingGenRule && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1730]/70 backdrop-blur-[2px]">
                    <div className="w-[500px] bg-[#0f172a] border border-blue-500/30 text-blue-100 font-sans shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col animate-[fadeIn_0.2s_ease-out]">
                        <div className="flex items-center justify-between px-6 py-3 bg-[#0c2242]/70 border-b border-blue-500/30">
                            <span className="text-base font-bold text-white tracking-wide">修改规则</span>
                            <button onClick={() => setEditingGenRule(null)} className="text-blue-400 hover:text-white transition-colors">
                                <XIcon />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs text-blue-300">业务分类</label>
                                <div className="text-sm text-white font-medium bg-blue-500/10 px-3 py-2 border border-blue-500/20 rounded-sm">
                                    {editingGenRule.businessCategory}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-blue-300">配置条件</label>
                                <div className="flex flex-wrap gap-3 p-3 border border-blue-500/20 rounded-sm bg-[#0b1730]/30">
                                    {(editingGenRule.businessCategory === '企宽' ? broadbandConditions : serviceLevels).map(level => (
                                        <label key={level} className="flex items-center gap-2 cursor-pointer group">
                                            <input 
                                                type="checkbox" 
                                                className="accent-neon-blue w-3.5 h-3.5"
                                                checked={editingGenRule.configConditions.includes(level)}
                                                onChange={() => {
                                                    const levels = editingGenRule.configConditions;
                                                    const newLevels = levels.includes(level) 
                                                        ? levels.filter(l => l !== level)
                                                        : [...levels, level];
                                                    setEditingGenRule({ ...editingGenRule, configConditions: newLevels });
                                                }}
                                            />
                                            <span className={`text-sm ${editingGenRule.configConditions.includes(level) ? 'text-white' : 'text-gray-400 group-hover:text-blue-200'}`}>
                                                {level}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-blue-300">处理时限 (小时)</label>
                                <StyledInput 
                                    type="number" 
                                    className="w-full" 
                                    value={editingGenRule.deadline}
                                    onChange={e => setEditingGenRule({ ...editingGenRule, deadline: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-4 bg-[#0c2242]/30 border-t border-blue-500/20">
                            <StyledButton variant="outline" onClick={() => setEditingGenRule(null)}>
                                取消
                            </StyledButton>
                            <StyledButton variant="primary" onClick={saveEditedGenRule}>
                                保存修改
                            </StyledButton>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {deleteConfirm.isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#0b1730] border border-blue-500/30 rounded-lg shadow-[0_0_30px_rgba(0,210,255,0.2)] w-[320px] flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                        <div className="flex items-center justify-between p-4 border-b border-blue-500/20">
                            <h3 className="text-white font-bold">{deleteConfirm.title}</h3>
                            <button onClick={closeDeleteConfirm} className="text-gray-400 hover:text-white transition-colors">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-blue-100">
                                {deleteConfirm.message}
                            </p>
                        </div>
                        <div className="p-4 border-t border-blue-500/20 flex justify-end gap-3">
                            <StyledButton variant="secondary" onClick={closeDeleteConfirm}>取消</StyledButton>
                            <StyledButton variant="danger" onClick={() => { deleteConfirm.onConfirm(); closeDeleteConfirm(); }}>确定删除</StyledButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
