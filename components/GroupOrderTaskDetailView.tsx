
import React, { useState, useMemo, useEffect } from 'react';
import { StyledButton, StyledInput, StyledSelect } from './UI';
import { SearchIcon, RefreshCwIcon, DownloadIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, CheckCircleIcon, CheckIcon, XIcon, UserIcon } from './Icons';
import { INNER_MONGOLIA_CITIES } from '../constants';

interface GroupOrderTaskDetailViewProps {
    task: any; // Using any for the derived task object
    onBack: () => void;
    initialTab?: 'info' | 'flow' | 'process' | 'feedback';
    triggerTimestamp?: number;
    onTabChange?: (tab: 'info' | 'flow' | 'process' | 'feedback') => void;
}

const Th = ({ children, className = "", ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={`p-3 font-semibold border-b border-blue-500/30 whitespace-nowrap text-sm bg-[#0c2242] text-blue-200 ${className}`} {...props}>
    {children}
  </th>
);

const getStatusBadgeClass = (status: string) => {
    switch (status) {
        case '已完成': return 'bg-[#10b981]/20 text-[#34d399] border-[#10b981]/40';
        case '待受理': return 'bg-[#eab308]/20 text-[#fde047] border-[#eab308]/40';
        case '处理中': return 'bg-[#2563eb]/20 text-[#60a5fa] border-[#2563eb]/40';
        case '待回单': return 'bg-[#8b5cf6]/20 text-[#a78bfa] border-[#8b5cf6]/40';
        case '撤单': return 'bg-[#ef4444]/20 text-[#fca5a5] border-[#ef4444]/40';
        case '已撤单': return 'bg-[#ef4444]/20 text-[#fca5a5] border-[#ef4444]/40';
        default: return 'bg-[#2563eb]/20 text-[#60a5fa] border-[#2563eb]/40';
    }
};

const getTicketStatusBadge = (status: string) => {
    switch (status) {
        case '活动': return <span className="px-2 py-0.5 border border-blue-500/50 text-blue-300 rounded text-[10px] bg-blue-500/10">活动</span>;
        case '历史': return <span className="px-2 py-0.5 border border-gray-500/50 text-gray-300 rounded text-[10px] bg-gray-500/10">历史</span>;
        case '撤单': return <span className="px-2 py-0.5 border border-red-500/50 text-red-300 rounded text-[10px] bg-red-500/10">撤单</span>;
        case '退单': return <span className="px-2 py-0.5 border border-orange-500/50 text-orange-300 rounded text-[10px] bg-orange-500/10">退单</span>;
        default: return <span className="px-2 py-0.5 border border-blue-500/50 text-blue-300 rounded text-[10px] bg-blue-500/10">{status}</span>;
    }
};

// Custom Checkmark Icon for Flow Steps
const CompletedStepIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// Alert Icon for the warning box
const AlertTriangleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

// Generate Mock Tickets for the Task View
const generateTaskTickets = (task: any, count: number = 20) => {
    return Array.from({ length: count }).map((_, i) => {
        const idSuffix = (5000 + i).toString();
        
        // Random status for variety
        const statuses = ['活动', '历史', '撤单', '退单'];
        const status = i < 15 ? '活动' : statuses[i % statuses.length];

        return {
            id: `task-ticket-${i}`,
            title: `互联网专线-电路${i + 1}`,
            status: status,
            crmNo: `260219064939${idSuffix}`,
            stage: '待受理', 
            source: '家宽系统',
            bizType: '企业宽带',
            bizId: `1338475661150${10 + i}`,
            city: '呼和浩特市', 
            district: '赛罕区',
            address: `大学路网格${i}号`,
            netTime: '2026-02-10 11:21:18',
            grabTime: '2026-02-10 11:25:00',
            grabDuration: '5分',
            appointDuration: '0.5小时'
        };
    });
};

const flowSteps = [
    { id: 'dispatch', label: '分派', subLabel: '系统分派' },
    { id: 'accept', label: '受理', subLabel: '任务受理' },
    { id: 'finish', label: '完成', subLabel: '自动归档' }
];

// Constants for Flow Chart
const COMPLETED_BG = "#11365e"; 
const PENDING_LINE = "#4b5563"; 
const ACTIVE_GLOW = "shadow-[0_0_20px_rgba(0,210,255,0.5)]";

export const GroupOrderTaskDetailView: React.FC<GroupOrderTaskDetailViewProps> = ({ task, onBack, initialTab = 'info', triggerTimestamp, onTabChange }) => {
    const [activeTab, setActiveTab] = useState<'info' | 'flow' | 'process' | 'feedback'>(initialTab);
    const [tickets, setTickets] = useState<any[]>([]);
    const [filters, setFilters] = useState({ keyword: '', status: '' });
    const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 10 });
    
    // Status Logic
    const [taskStatus, setTaskStatus] = useState(task.status);
    const [taskLogs, setTaskLogs] = useState<any[]>([
        { time: '2026-02-10 11:21:18', operator: '系统', type: '任务分派', desc: '系统根据团单规则自动拆分创建' },
    ]);

    // Process Tab State
    const [lastAppointment, setLastAppointment] = useState<{start: string, end: string, expectedDelivery?: string} | null>(null);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTimeSlot, setAppointmentTimeSlot] = useState('');
    const [expectedDeliveryTime, setExpectedDeliveryTime] = useState('');

    // Feedback Tab State
    const [feedbackList, setFeedbackList] = useState([
        { id: 1, time: '2026-02-10 14:30:00', operator: task.manager || '张宏伟', content: '已联系客户，客户表示下午3点方便上门核查线路情况。' }
    ]);
    const [feedbackInput, setFeedbackInput] = useState('');

    useEffect(() => {
        if (initialTab) setActiveTab(initialTab);
    }, [initialTab]);

    useEffect(() => {
        setTickets(generateTaskTickets(task));
        setTaskStatus(task.status);
        // Reset lastAppointment when task changes or re-inits
        setLastAppointment(null);

        // Initialize logs based on status for simulation
        const initialLogs = [
             { time: task.receiptTime || '2026-02-10 11:21:18', operator: '系统', type: '任务分派', desc: '系统根据团单规则自动拆分创建' }
        ];
        if (task.status === '处理中' || task.status === '已完成') {
             initialLogs.unshift({ time: '2026-02-10 11:31:18', operator: task.manager || '张宏伟', type: '任务受理', desc: '确认受理任务' });
        }
        if (task.status === '已完成') {
             initialLogs.unshift({ time: '2026-02-12 10:00:00', operator: '系统', type: '任务完成', desc: '关联工单全部归档，任务自动完成' });
        }
        setTaskLogs(initialLogs);
        
        // Reset Feedback for demo if task changes significantly
        if (task.status === '待受理') {
            setFeedbackList([]);
        } else {
            setFeedbackList([
                { id: 1, time: '2026-02-10 14:30:00', operator: task.manager || '张宏伟', content: '已联系客户，客户表示下午3点方便上门核查线路情况。' }
            ]);
        }
    }, [task.id, triggerTimestamp]);

    const handleTabClick = (tab: 'info' | 'flow' | 'process' | 'feedback') => {
        setActiveTab(tab);
        if (onTabChange) onTabChange(tab);
    };

    const handleAcceptTask = () => {
        setTaskStatus('处理中');
        const now = new Date();
        const timeStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
        
        setTaskLogs(prev => [{
            time: timeStr,
            operator: task.manager || '当前用户',
            type: '任务受理',
            desc: '确认受理任务，进入预约环节'
        }, ...prev]);
    };

    const handleReschedule = () => {
        if(!appointmentDate || !appointmentTimeSlot) {
            alert("请选择完整的预约日期和时间段");
            return;
        }
        
        const [startTime, endTime] = appointmentTimeSlot.split('-');
        const startStr = `${appointmentDate} ${startTime}:00`;
        const endStr = `${appointmentDate} ${endTime}:00`;

        // Validate Expected Delivery Time
        if (expectedDeliveryTime) {
            const appointmentStart = new Date(startStr);
            const deliveryTime = new Date(expectedDeliveryTime);
            const deadline = new Date(task.deadline);

            if (deliveryTime < appointmentStart) {
                alert("用户期望交付时限不能早于预约时间");
                return;
            }
            if (deliveryTime > deadline) {
                alert("用户期望交付时限不能晚于任务交付时限");
                return;
            }
        }
        
        // This setter triggers re-render, switching text from '确认预约' to '确认改约'
        setLastAppointment({
            start: startStr,
            end: endStr,
            expectedDelivery: expectedDeliveryTime ? expectedDeliveryTime.replace('T', ' ') : undefined
        });
        
        const now = new Date();
        const timeStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
        
        setTaskLogs(prev => [{
            time: timeStr,
            operator: task.manager || '当前用户',
            type: '集中预约',
            desc: `更新预约时间为：${startStr} 至 ${endStr}${expectedDeliveryTime ? `，用户期望交付时限：${expectedDeliveryTime.replace('T', ' ')}` : ''}`
        }, ...prev]);

        setAppointmentDate('');
        setAppointmentTimeSlot('');
        setExpectedDeliveryTime('');
        
        // Visual feedback - logic simplified to just log, as UI update (Card appearing) is the feedback
        console.log("预约/改约成功");
    };

    const handleSubmitFeedback = () => {
        if (!feedbackInput.trim()) return;
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        
        const newEntry = {
            id: Date.now(),
            time: timeStr,
            operator: '当前用户', // Mock current user
            content: feedbackInput.trim()
        };
        
        setFeedbackList(prev => [newEntry, ...prev]);
        setFeedbackInput('');
    };

    const filteredData = useMemo(() => {
        return tickets.filter(t => {
            const matchKw = !filters.keyword || t.crmNo.includes(filters.keyword) || t.address.includes(filters.keyword);
            const matchStatus = !filters.status || t.status === filters.status;
            return matchKw && matchStatus;
        });
    }, [tickets, filters]);

    const paginatedData = useMemo(() => {
        const start = (pagination.currentPage - 1) * pagination.pageSize;
        return filteredData.slice(start, start + pagination.pageSize);
    }, [filteredData, pagination]);

    const totalPages = Math.ceil(filteredData.length / pagination.pageSize);

    // Flow Status Logic
    const getFlowStepStatus = (index: number) => {
        // 0: Dispatch, 1: Accept, 2: Finish
        if (index === 0) return 'completed'; // Dispatch always done
        
        if (taskStatus === '待受理') {
            if (index === 1) return 'active'; // Accept is next
            return 'pending';
        }
        
        if (taskStatus === '处理中') {
            if (index === 1) return 'completed';
            if (index === 2) return 'active'; // Finish is active/next
            return 'pending';
        }

        if (taskStatus === '已完成') {
            return 'completed';
        }
        
        if (taskStatus === '撤单' || taskStatus === '已撤单') {
             if (index <= 1) return 'completed';
             return 'pending';
        }

        return 'pending';
    };

    return (
        <div className="flex flex-col h-full w-full bg-transparent overflow-hidden animate-[fadeIn_0.3s_ease-out] font-sans text-sm">
            {/* Header */}
            <div className="bg-[#094F8B]/[0.05] pt-4 pb-0 space-y-4 shrink-0">
                <div className="flex items-start justify-between px-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-lg font-bold text-white tracking-wide">{task.name}</h2>
                            <span className={`px-2 py-0.5 rounded-sm text-xs border ${getStatusBadgeClass(taskStatus)}`}>
                                {taskStatus}
                            </span>
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                            任务标识号: {task.taskId}
                        </div>
                    </div>
                    {/* Back Button Removed */}
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-end w-full">
                    <div className="w-6 border-b border-blue-500/20"></div>
                    {['任务信息', '流程信息', '任务处理', '阶段反馈'].map((tab) => {
                        const tabMap: Record<string, 'info' | 'flow' | 'process' | 'feedback'> = {
                            '任务信息': 'info',
                            '流程信息': 'flow',
                            '任务处理': 'process',
                            '阶段反馈': 'feedback'
                        };
                        const tabId = tabMap[tab];
                        const isActive = activeTab === tabId;
                        return (
                            <button
                                key={tab}
                                onClick={() => handleTabClick(tabId)}
                                className={`
                                    px-6 py-2 text-sm font-medium transition-all relative rounded-t-sm
                                    ${isActive 
                                        ? 'text-neon-blue bg-transparent border-t border-l border-r border-blue-500/30 border-b-transparent z-10' 
                                        : 'text-gray-400 border-b border-blue-500/20 hover:text-gray-200 hover:bg-white/5'}
                                `}
                            >
                                {tab}
                            </button>
                        );
                    })}
                    <div className="flex-1 border-b border-blue-500/20"></div>
                </div>
            </div>

            {/* Content - Parent container handles vertical scrolling for the tab content */}
            <div className="flex-1 flex flex-col p-6 overflow-hidden bg-transparent">
                {activeTab === 'info' && (
                    <div className="flex flex-col h-full space-y-6 overflow-y-auto custom-scrollbar pr-2">
                        {/* Basic Info Section - 30% Opacity Background */}
                        <div className="space-y-3 shrink-0">
                            <div className="bg-[#13284c]/30 border border-blue-500/20 rounded-sm p-5 shadow-sm">
                                <h3 className="text-sm font-bold text-neon-blue border-l-2 border-neon-blue pl-2 flex items-center h-4 mb-4">基本信息</h3>
                                <div className="grid grid-cols-4 gap-y-4 gap-x-8 text-sm text-white whitespace-nowrap">
                                    {/* Task Level Removed as requested */}
                                    <div className="flex items-center gap-2"><span className="text-blue-300 w-28 text-right">交付经理：</span><span className="text-white">{task.manager || '-'}</span></div>
                                    <div className="flex items-center gap-2"><span className="text-blue-300 w-28 text-right">任务竣工率：</span><span className="text-white">{task.rate}</span></div>
                                    <div className="flex items-center gap-2"><span className="text-blue-300 w-28 text-right">在途量/任务派单量：</span><span className="text-white">{task.dispatchRatio}</span></div>
                                    <div className="flex items-center gap-2"><span className="text-blue-300 w-28 text-right">任务剩余时限：</span><span className="text-white">{task.remaining}</span></div>
                                    <div className="flex items-center gap-2"><span className="text-blue-300 w-28 text-right">任务交付时限：</span><span className="text-white font-mono">{task.deadline}</span></div>
                                    <div className="flex items-center gap-2"><span className="text-blue-300 w-28 text-right">用户期望交付时限：</span><span className="text-white font-mono">{lastAppointment?.expectedDelivery || '-'}</span></div>
                                    <div className="flex items-center gap-2"><span className="text-blue-300 w-28 text-right">任务完成时间：</span><span className="text-white font-mono">{task.finishTime || '-'}</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Task List Section - 30% Opacity Background, Full Height expansion in scrollable parent */}
                        <div className="flex flex-col min-h-0 space-y-3 pb-4">
                            <div className="flex flex-col bg-[#13284c]/30 border border-blue-500/20 rounded-sm p-4 shadow-sm">
                                <h3 className="text-sm font-bold text-neon-blue border-l-2 border-neon-blue pl-2 flex items-center h-4 mb-4">任务清单</h3>
                                {/* Filter Bar - Left Aligned */}
                                <div className="flex items-center justify-start gap-3 mb-4 shrink-0 flex-wrap">
                                    <StyledInput 
                                        placeholder="请输入CRM工单号、安装地址" 
                                        className="w-72 bg-[#0b1730]/50" 
                                        value={filters.keyword}
                                        onChange={e => setFilters({...filters, keyword: e.target.value})}
                                    />
                                    <StyledSelect 
                                        className="w-32 bg-[#0b1730]/50"
                                        value={filters.status}
                                        onChange={e => setFilters({...filters, status: e.target.value})}
                                    >
                                        <option value="">工单状态</option>
                                        <option value="活动">活动</option>
                                        <option value="历史">历史</option>
                                        <option value="撤单">撤单</option>
                                        <option value="退单">退单</option>
                                    </StyledSelect>
                                    
                                    <StyledButton variant="toolbar" icon={<SearchIcon />}>查询</StyledButton>
                                    <StyledButton variant="toolbar" className="bg-[#1e3a5f] border-gray-600" icon={<RefreshCwIcon />} onClick={() => setFilters({keyword: '', status: ''})}>重置</StyledButton>
                                </div>

                                {/* Table - Remove vertical scroll, allow it to expand naturally */}
                                <div className="w-full overflow-x-auto border border-blue-500/20 bg-transparent">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-[#0c2242] text-blue-200">
                                            <tr>
                                                <Th>工单标题</Th>
                                                <Th>状态</Th>
                                                <Th>CRM工单号</Th>
                                                <Th>当前环节</Th>
                                                <Th>工单来源</Th>
                                                <Th>业务类型</Th>
                                                <Th>业务标识</Th>
                                                <Th>地市</Th>
                                                <Th>区县</Th>
                                                <Th>安装地址</Th>
                                                <Th>网络侧收单时间</Th>
                                                <Th>抢单/受理时间</Th>
                                                <Th>抢单时长</Th>
                                                <Th>预约时长</Th>
                                                <Th className="text-center sticky right-0 bg-[#0c2242] shadow-[-5px_0_10px_rgba(0,0,0,0.1)] border-l border-blue-500/20">操作</Th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-blue-100">
                                            {paginatedData.map((row, idx) => (
                                                <tr key={row.id} className={`hover:bg-[#1e3a5f]/40 transition-colors border-b border-blue-500/10 ${idx % 2 === 1 ? 'bg-[#0c2242]/30' : ''}`}>
                                                    <td className="p-3 border-b border-blue-500/10">{row.title}</td>
                                                    <td className="p-3 border-b border-blue-500/10">{getTicketStatusBadge(row.status)}</td>
                                                    <td className="p-3 border-b border-blue-500/10 font-mono">{row.crmNo}</td>
                                                    <td className="p-3 border-b border-blue-500/10">{row.stage}</td>
                                                    <td className="p-3 border-b border-blue-500/10">{row.source}</td>
                                                    <td className="p-3 border-b border-blue-500/10">{row.bizType}</td>
                                                    <td className="p-3 border-b border-blue-500/10 font-mono">{row.bizId}</td>
                                                    <td className="p-3 border-b border-blue-500/10">{row.city}</td>
                                                    <td className="p-3 border-b border-blue-500/10">{row.district}</td>
                                                    <td className="p-3 border-b border-blue-500/10 max-w-[150px] truncate" title={row.address}>{row.address}</td>
                                                    <td className="p-3 border-b border-blue-500/10 font-mono text-gray-400">{row.netTime}</td>
                                                    <td className="p-3 border-b border-blue-500/10 font-mono text-gray-400">{row.grabTime}</td>
                                                    <td className="p-3 border-b border-blue-500/10">{row.grabDuration}</td>
                                                    <td className="p-3 border-b border-blue-500/10">{row.appointDuration}</td>
                                                    <td className="p-3 border-b border-blue-500/10 text-center sticky right-0 bg-[#0b1730] shadow-[-5px_0_10px_rgba(0,0,0,0.1)] border-l border-blue-500/20">
                                                        <div className="flex items-center justify-center gap-3 text-neon-blue text-xs">
                                                            <button className="hover:text-white hover:underline">发起支撑</button>
                                                            <button className="hover:text-white hover:underline">催办</button>
                                                            <button className="hover:text-white hover:underline">查看轨迹</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="flex items-center justify-between pt-4 border-t border-blue-500/20 shrink-0">
                                    <button className="flex items-center gap-1 text-neon-blue border border-neon-blue/30 px-3 py-1 rounded hover:bg-neon-blue/10 transition-colors text-xs">
                                        <DownloadIcon /> <span className="ml-1">导出</span>
                                    </button>
                                    <div className="flex items-center gap-4 text-blue-300 text-xs">
                                        <span>共 {filteredData.length} 条</span>
                                        <div className="flex items-center gap-1">
                                            <button className="p-1 hover:text-white disabled:opacity-30" disabled={pagination.currentPage === 1} onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}><ChevronLeftIcon /></button>
                                            <span className="px-2 py-0.5 bg-blue-600 text-white rounded">{pagination.currentPage}</span>
                                            <span className="text-gray-500">/ {totalPages}</span>
                                            <button className="p-1 hover:text-white disabled:opacity-30" disabled={pagination.currentPage === totalPages} onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}><ChevronRightIcon /></button>
                                        </div>
                                        <select 
                                            className="bg-[#0b1730] border border-blue-500/30 text-white px-2 py-0.5 rounded outline-none" 
                                            value={pagination.pageSize} 
                                            onChange={(e) => setPagination({ currentPage: 1, pageSize: Number(e.target.value) })}
                                        >
                                            <option value={10}>10条/页</option>
                                            <option value={15}>15条/页</option>
                                            <option value={30}>30条/页</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'flow' && (
                    <div className="flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar pr-1">
                        {/* Flow Chart Section - Transparent Container */}
                        <div className="bg-transparent border border-blue-500/20 rounded-sm pt-4 px-5 pb-16 shadow-sm flex flex-col items-center shrink-0">
                             <div className="w-full flex justify-start mb-6">
                                <div className="border-l-4 border-neon-blue pl-3 text-white font-bold text-sm">流程进度</div>
                             </div>
                             
                             <div className="flex items-center w-full max-w-[800px]">
                                {flowSteps.map((step, idx) => {
                                    const status = getFlowStepStatus(idx);
                                    const isCompleted = status === 'completed';
                                    const isActive = status === 'active';
                                    // Line status is based on the *next* step's status
                                    const nextStepStatus = idx < flowSteps.length - 1 ? getFlowStepStatus(idx + 1) : null;
                                    const isLineActive = nextStepStatus === 'completed' || nextStepStatus === 'active';

                                    return (
                                        <React.Fragment key={step.id}>
                                            <div className="relative flex flex-col items-center z-10">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${isCompleted ? '' : isActive ? `border-[2px] border-[#00d2ff] bg-[#0b1730] ${ACTIVE_GLOW}` : 'border border-[#4b5563] bg-[#0b1730]'}`} style={isCompleted ? { backgroundColor: COMPLETED_BG, border: `1px solid ${COMPLETED_BG}` } : {}}>
                                                    {isCompleted ? <div className="text-white"><CompletedStepIcon /></div> : isActive ? <span className="text-[#00d2ff] font-bold text-lg">{idx + 1}</span> : <span className="text-[#6b7280] text-lg font-medium">{idx + 1}</span>}
                                                </div>
                                                <div className="absolute top-14 flex flex-col items-center whitespace-nowrap gap-1">
                                                    <span className={`font-bold text-base ${isActive ? 'text-[#00d2ff]' : isCompleted ? 'text-white' : 'text-[#6b7280]'}`}>{step.label}</span>
                                                    <span className={`text-xs ${isActive ? 'text-[#00d2ff]' : 'text-gray-400'}`}>{step.subLabel}</span>
                                                </div>
                                            </div>
                                            {idx < flowSteps.length - 1 && (
                                                <div className="flex-1 flex items-center mx-2">
                                                    <div className="h-[2px] w-full" style={{ backgroundColor: isLineActive ? COMPLETED_BG : PENDING_LINE }}></div>
                                                    <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-b-[4px] border-b-transparent" style={{ borderLeftColor: isLineActive ? COMPLETED_BG : PENDING_LINE }}></div>
                                                </div>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                             </div>
                        </div>

                        {/* Logs Section - Transparent Container */}
                        <div className="bg-transparent border border-blue-500/20 rounded-sm shrink-0 flex flex-col mb-4">
                             <div className="p-4 border-b border-blue-500/20 shrink-0">
                                <div className="border-l-4 border-neon-blue pl-3 text-white font-bold text-sm">操作记录</div>
                             </div>
                             <div className="p-0">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-[#0c2242] text-white sticky top-0 z-10">
                                        <tr>
                                            <th className="p-4 font-medium border-b border-blue-500/20">操作时间</th>
                                            <th className="p-4 font-medium border-b border-blue-500/20">操作人</th>
                                            <th className="p-4 font-medium border-b border-blue-500/20">操作类型</th>
                                            <th className="p-4 font-medium border-b border-blue-500/20">操作描述</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-blue-100">
                                        {taskLogs.map((log, idx) => (
                                            <tr key={idx} className="hover:bg-[#1e3a5f]/30 border-b border-blue-500/10">
                                                <td className="p-4 font-mono">{log.time}</td>
                                                <td className="p-4">{log.operator}</td>
                                                <td className="p-4 font-bold">{log.type}</td>
                                                <td className="p-4">{log.desc}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        </div>
                    </div>
                )}

                {activeTab === 'process' && (
                    <div className="bg-transparent border border-blue-500/20 rounded-sm shadow-[0_0_15px_rgba(0,0,0,0.1)] flex flex-col h-full animate-[fadeIn_0.3s_ease-out] overflow-hidden relative w-full">
                        {/* Scenario 1: Pending Acceptance */}
                        {taskStatus === '待受理' && (
                            <div className="flex flex-col items-center justify-center h-full p-8 animate-[fadeIn_0.5s_ease-out]">
                                <div className="flex flex-col items-center justify-center p-8 bg-[#13284c]/30 border border-blue-500/20 rounded-sm shadow-xl max-w-[600px] w-full">
                                    <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 mb-6 border border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 tracking-wide">任务待受理</h3>
                                    <p className="text-blue-300 text-sm mb-8 text-center max-w-md leading-relaxed">
                                        当前任务尚未受理，请确认任务信息无误后，点击下方按钮进行受理。受理后将进入集中预约环节。
                                    </p>
                                    <StyledButton 
                                        variant="primary" 
                                        className="px-10 py-2.5 h-auto text-base font-bold tracking-wide shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
                                        onClick={handleAcceptTask}
                                        icon={<CheckCircleIcon />}
                                    >
                                        确认受理
                                    </StyledButton>
                                </div>
                            </div>
                        )}

                        {/* Scenario 2: Processing (Centralized Appointment & Completion) */}
                        {taskStatus === '处理中' && (
                            <div className="flex flex-col items-center h-full p-8 animate-[fadeIn_0.5s_ease-out] overflow-y-auto custom-scrollbar">
                                <div className="flex flex-col gap-6 w-full max-w-[720px] my-auto">
                                    {/* Top Card: Last Appointment Status - Only show if appointment exists (submitted) */}
                                    {lastAppointment && (
                                        <div className="bg-[#13284c]/30 border border-blue-500/20 rounded-sm p-6 flex flex-col gap-4 shadow-sm animate-[fadeIn_0.3s_ease-out] shrink-0">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center text-neon-blue border border-blue-500/30">
                                                        <ClockIcon />
                                                    </div>
                                                    <div>
                                                        <div className="text-blue-300 text-xs mb-1">上次预约/改约时间</div>
                                                        <div className="text-xl font-bold text-white tracking-wide font-mono">
                                                            {lastAppointment.start} 至 {lastAppointment.end}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="px-3 py-1 bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/40 text-sm rounded">已预约</span>
                                                </div>
                                            </div>
                                            {lastAppointment.expectedDelivery && (
                                                <div className="border-t border-blue-500/20 pt-3 flex items-center gap-2">
                                                    <span className="text-blue-300 text-xs">用户期望交付时限：</span>
                                                    <span className="text-white font-mono text-sm font-bold">{lastAppointment.expectedDelivery}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Bottom Card: Reschedule Form */}
                                    <div className="bg-[#13284c]/30 border border-blue-500/20 rounded-sm p-8 shadow-sm space-y-6 shrink-0">
                                        <h3 className="text-base font-bold text-white border-l-2 border-neon-blue pl-2 h-4 flex items-center">
                                            {lastAppointment ? '修改集中预约时间' : '集中预约时间'}
                                        </h3>
                                        
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="text-blue-300 text-sm">
                                                    {lastAppointment ? '请选择新的预约上门时间段：' : '请选择预约上门时间段：'}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <StyledInput 
                                                        type="date" 
                                                        className="flex-1 h-[38px] bg-[#0b1730]/50 border-blue-500/30 text-white min-w-0"
                                                        value={appointmentDate}
                                                        onChange={(e) => setAppointmentDate(e.target.value)}
                                                    />
                                                    <StyledSelect
                                                        className="flex-1 h-[38px] bg-[#0b1730]/50 border-blue-500/30 text-white min-w-0"
                                                        value={appointmentTimeSlot}
                                                        onChange={(e) => setAppointmentTimeSlot(e.target.value)}
                                                    >
                                                        <option value="">请选择时间段</option>
                                                        <option value="09:00-10:00">09:00-10:00</option>
                                                        <option value="10:00-11:00">10:00-11:00</option>
                                                        <option value="11:00-12:00">11:00-12:00</option>
                                                        <option value="12:00-13:00">12:00-13:00</option>
                                                        <option value="13:00-14:00">13:00-14:00</option>
                                                        <option value="14:00-15:00">14:00-15:00</option>
                                                        <option value="15:00-16:00">15:00-16:00</option>
                                                        <option value="16:00-17:00">16:00-17:00</option>
                                                        <option value="17:00-18:00">17:00-18:00</option>
                                                        <option value="18:00-19:00">18:00-19:00</option>
                                                        <option value="19:00-20:00">19:00-20:00</option>
                                                    </StyledSelect>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <div className="text-blue-300 text-sm">
                                                    用户期望交付时限（选填）：
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <StyledInput 
                                                        type="datetime-local"
                                                        className="flex-1 h-[38px] bg-[#0b1730]/50 border-blue-500/30 text-white min-w-0"
                                                        value={expectedDeliveryTime}
                                                        onChange={(e) => setExpectedDeliveryTime(e.target.value)}
                                                        placeholder="请选择用户期望交付时限"
                                                    />
                                                    <div className="flex-1"></div>
                                                    <StyledButton 
                                                        id="reschedule-btn"
                                                        variant="primary" 
                                                        className="h-[38px] px-8 text-sm ml-4 font-bold tracking-wide"
                                                        onClick={handleReschedule}
                                                    >
                                                        {lastAppointment ? '确认改约' : '确认预约'}
                                                    </StyledButton>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Warning Box */}
                                        <div className="bg-[#332a00]/30 border border-yellow-600/30 rounded p-4 flex items-start gap-3 mt-4">
                                            <div className="text-yellow-500 mt-0.5 shrink-0">
                                                <AlertTriangleIcon />
                                            </div>
                                            <div className="text-gray-300 text-sm leading-relaxed">
                                                <span className="text-yellow-500 font-bold mr-1">操作提示：</span>
                                                此操作将更新本次任务下所有关联工单的预约时间。请确保与客户沟通一致后再执行。
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Scenario 3: Completed */}
                        {taskStatus === '已完成' && (
                            <div className="flex flex-col items-center justify-center h-full p-8 animate-[fadeIn_0.5s_ease-out]">
                                <div className="flex flex-col items-center justify-center gap-4">
                                    <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center text-green-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </div>
                                    <div className="text-2xl font-bold text-white tracking-wide">任务已完成</div>
                                    <div className="text-blue-300 text-sm max-w-md text-center">所有关联工单已处理完毕，任务自动归档。</div>
                                </div>
                            </div>
                        )}

                        {/* Scenario 4: Canceled */}
                        {(taskStatus === '撤单' || taskStatus === '已撤单') && (
                            <div className="flex flex-col items-center justify-center h-full p-8 animate-[fadeIn_0.5s_ease-out]">
                                <div className="flex flex-col items-center justify-center gap-6 p-10 bg-transparent rounded-lg border border-red-500/20 shadow-[0_0_40px_rgba(220,38,38,0.1)]">
                                    <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/50 flex items-center justify-center text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <div className="text-2xl font-bold text-white tracking-wide">任务已撤销</div>
                                        <div className="text-red-300/80 text-sm max-w-md text-center bg-red-900/20 px-6 py-3 rounded border border-red-500/20">
                                            该任务已被撤销，流程已终止。无法进行受理、预约或回单操作。
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'feedback' && (
                    <div className="flex flex-col h-full space-y-4 animate-[fadeIn_0.3s_ease-out] overflow-hidden">
                        {/* Input Area */}
                        {taskStatus !== '待受理' && taskStatus !== '已完成' && taskStatus !== '撤单' && taskStatus !== '已撤单' && (
                            <div className="bg-[#13284c]/30 border border-blue-500/20 rounded-sm p-5 shadow-sm shrink-0">
                                <h3 className="text-sm font-bold text-neon-blue border-l-2 border-neon-blue pl-2 flex items-center h-4 mb-4">新增反馈</h3>
                                <div className="flex flex-col gap-4">
                                    <textarea 
                                        className="w-full h-24 bg-[#0b1730]/40 border border-blue-500/30 rounded-sm p-3 text-white text-sm focus:outline-none focus:border-neon-blue transition-colors resize-none placeholder-blue-300/30"
                                        placeholder="请输入阶段反馈信息..."
                                        value={feedbackInput}
                                        onChange={(e) => setFeedbackInput(e.target.value)}
                                    />
                                    <div className="flex justify-end">
                                        <StyledButton variant="primary" onClick={handleSubmitFeedback} className="px-6">提交反馈</StyledButton>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* List Area */}
                        <div className="flex-1 bg-[#13284c]/30 border border-blue-500/20 rounded-sm p-5 shadow-sm flex flex-col overflow-hidden">
                            <h3 className="text-sm font-bold text-neon-blue border-l-2 border-neon-blue pl-2 flex items-center h-4 mb-4 shrink-0">反馈记录</h3>
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                                {feedbackList.length > 0 ? (
                                    feedbackList.sort((a, b) => new Date(b.time.replace(' ', 'T')).getTime() - new Date(a.time.replace(' ', 'T')).getTime()).map(item => (
                                        <div key={item.id} className="bg-[#0b1730]/40 border border-blue-500/10 p-3 rounded-sm">
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-blue-300 font-bold text-xs">{item.operator}</span>
                                                </div>
                                                <span className="text-gray-400 font-mono text-xs">{item.time}</span>
                                            </div>
                                            <div className="text-white text-sm leading-relaxed pl-1">{item.content}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-blue-300/50 text-sm">
                                        暂无反馈记录
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
