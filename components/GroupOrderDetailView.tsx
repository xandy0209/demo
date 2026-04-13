
import React, { useState, useMemo, useEffect } from 'react';
import { GroupOrderRecord } from '../types';
import { StyledButton, StyledInput, StyledSelect } from './UI';
import { SearchIcon, RefreshCwIcon, DownloadIcon, ChevronLeftIcon, ChevronRightIcon, CheckIcon, CheckCircleIcon, XIcon } from './Icons';

interface GroupOrderDetailViewProps {
    order: GroupOrderRecord;
    onBack: () => void;
    initialTab?: 'info' | 'flow' | 'process' | 'feedback';
    triggerTimestamp?: number;
    onTabChange?: (tab: 'info' | 'flow' | 'process' | 'feedback') => void;
    onUpdateOrder?: (updates: Partial<GroupOrderRecord>) => void;
}

const Th = ({ children, className = "", ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={`p-3 font-semibold border-b border-blue-500/30 whitespace-nowrap text-sm bg-[#0c2242] text-blue-200 ${className}`} {...props}>
    {children}
  </th>
);

// Helper to manipulate date strings without UTC conversion issues
const addMinutesToTimeStr = (timeStr: string, minutesToAdd: number): string => {
    if (!timeStr) return '';
    // Replace space with T for standard parsing, ensuring local time interpretation
    const date = new Date(timeStr.replace(' ', 'T'));
    if (isNaN(date.getTime())) return timeStr; // Fallback if invalid

    date.setMinutes(date.getMinutes() + minutesToAdd);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const mins = pad(date.getMinutes());
    const secs = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${mins}:${secs}`;
};

// Custom Checkmark Icon for Completed Steps
const CompletedStepIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// Mock Managers for Cascading Logic
const MOCK_MANAGERS_MAP: Record<string, string[] | Record<string, string[]>> = {
    '省级': ['张宏伟 (13947180001)', '赵铁柱 (13800138000)', '钱七 (13604710002)'],
    '地市级': {
        '呼和浩特市': ['王坤鹏 (15004820003)', '刘伟 (18447180004)'],
        '包头市': ['孙八 (13600000005)', '周九 (13700000006)'],
        'default': ['地市经理A (13800000001)', '地市经理B (13900000002)']
    },
    '旗县级': {
        '赛罕区': ['王晓强 (19804890007)', '张彦飞 (18747740008)'],
        '新城区': ['吴十 (13500000009)', '郑十一 (13300000010)'],
        'default': ['县级经理A (13700000003)', '县级经理B (13600000004)']
    },
    '网格级': {
        'default': ['李明 (15800000011)', '武楠 (13500000012)', '赵六 (13400000013)']
    }
};

// Helper to generate tickets based on Order Status
const generateDetailTickets = (order: GroupOrderRecord, count: number = 46) => {
    const cities = ['呼和浩特市', '包头市', '通辽市', '赤峰市'];
    const districtsMap: Record<string, string[]> = {
        '呼和浩特市': ['赛罕区', '土默特左旗', '回民区'],
        '包头市': ['东河区', '固阳县', '九原区'],
        '通辽市': ['开鲁县', '科尔沁区'],
        '赤峰市': ['宁城县']
    };
    
    // Determine how many tickets should be unassigned
    // This now directly and consistently uses the value from the parent order record.
    const unassignedTarget = order.unassignedTickets !== undefined ? order.unassignedTickets : 0;

    return Array.from({ length: count }).map((_, i) => {
        const city = cities[i % cities.length];
        const districts = districtsMap[city];
        const district = districts[i % districts.length];
        const idSuffix = (4000 + i).toString();
        
        const isUnassigned = i < unassignedTarget;

        // Generate status with weights: mostly '活动'
        let itemStatus = '活动';
        // If the order is '待回单' or '已完成' or '撤单', force tickets to be non-active (e.g. History or Cancelled)
        if (order.status === '已完成' || order.status === '待回单') {
             itemStatus = '历史';
        } else if (order.status === '已撤单') {
             itemStatus = '撤单';
        } else {
            const r = Math.random();
            if (r > 0.95) itemStatus = '历史';
            else if (r > 0.92) itemStatus = '撤单';
            else if (r > 0.90) itemStatus = '退单';
        }

        return {
            id: i,
            dispatchManager: isUnassigned ? '待分派' : (order.manager.split('(')[0] || '张宏伟'),
            title: `互联网专线-电路${i + 1}`,
            status: itemStatus,
            crmNo: `260219064939${idSuffix}`,
            stage: isUnassigned ? '待受理' : '处理中',
            source: '家宽系统',
            bizType: '企业宽带',
            bizId: `1338475661150${10 + i}`,
            city: city,
            district: district,
            address: `保康镇保南村${i}号`,
            netTime: order.receiptTime || '2026-02-10 11:21:18',
            grabTime: `2026-02-10 11:${34 + (i % 20)}:${49 + (i % 10)}`,
            grabDuration: `${14 + (i % 40)}分`,
            respDuration: `0.${26 + (i % 50)}小时`,
            appointDuration: `${(Math.random() * 48).toFixed(1)}小时`,
            appointTime: `2026-02-12 10:${30 + (i % 30)}:00`,
            appointCount: Math.floor(Math.random() * 3).toString(),
            changeCount: Math.floor(Math.random() * 2).toString(),
            deadline: order.deliveryDeadline || `2026-02-14 12:00:00`,
            finishTime: (order.status === '已完成' || order.status === '已撤单' || itemStatus === '历史' || itemStatus === '撤单') ? order.completionTime : '-'
        };
    });
};

// Dynamic Log Generator with logical timestamps
const generateProcessLogs = (order: GroupOrderRecord, currentStatus: string, unassignedCount: number, totalTickets: number, completionTimeOverride?: string) => {
    const logs = [];
    
    // Base Time: Creation Time
    const receiptTimeStr = order.receiptTime || '2026-02-10 11:21:18';

    // 1. Creation (Always exists)
    logs.push({
        time: receiptTimeStr,
        operator: '系统自动',
        type: '生成团单',
        description: '系统根据规则自动创建，流转至受理环节'
    });

    // 2. Accept (If not pending) - Base + 10 mins
    if (currentStatus !== '待受理') {
        const acceptTime = addMinutesToTimeStr(receiptTimeStr, 10);
        logs.unshift({
            time: acceptTime,
            operator: order.manager || '张宏伟',
            type: '受理团单',
            description: '交付经理确认受理团单，流转至处理环节'
        });
    }

    // 3. Dispatch (If some tickets dispatched or processing/completed) - Base + 45 mins
    // Also show if Cancelled, assuming it might have reached this stage or we just show flow
    if (currentStatus !== '待受理' && (unassignedCount < totalTickets || currentStatus === '撤单')) {
        const processTime = addMinutesToTimeStr(receiptTimeStr, 45);
        logs.unshift({
            time: processTime,
            operator: order.manager || '张宏伟',
            type: '任务分派',
            description: `已分派 ${totalTickets - unassignedCount} 张工单至执行人员`
        });
    }

    // 4. Reply / Complete (If completed) - Completion Time
    if (currentStatus === '已完成') {
        const completeTime = completionTimeOverride || order.completionTime || addMinutesToTimeStr(receiptTimeStr, 2880);
        logs.unshift({
            time: completeTime,
            operator: order.manager || '张宏伟', // Using order manager as operator
            type: '团单回单',
            description: '所有工单处理完毕，提交回单，流程结束'
        });
    }

    // 5. Cancelled Logic
    if (currentStatus === '撤单') {
        // Assume cancellation happened after dispatch or recently
        const cancelTime = order.completionTime || addMinutesToTimeStr(receiptTimeStr, 60);
        logs.unshift({
            time: cancelTime,
            operator: order.manager || '张宏伟',
            type: '团单撤单',
            description: '团单已撤销，流程终止，自动归档'
        });
    }

    return logs;
};

// Ticket Status Badge Helper
const getTicketStatusBadge = (status: string) => {
    switch (status) {
        case '活动': return <span className="px-2 py-0.5 border border-blue-500/50 text-blue-300 rounded text-[10px] bg-blue-500/10">活动</span>;
        case '历史': return <span className="px-2 py-0.5 border border-gray-500/50 text-gray-300 rounded text-[10px] bg-gray-500/10">历史</span>;
        case '撤单': return <span className="px-2 py-0.5 border border-red-500/50 text-red-300 rounded text-[10px] bg-red-500/10">撤单</span>;
        case '退单': return <span className="px-2 py-0.5 border border-orange-500/50 text-orange-300 rounded text-[10px] bg-orange-500/10">退单</span>;
        default: return <span className="px-2 py-0.5 border border-blue-500/50 text-blue-300 rounded text-[10px] bg-blue-500/10">{status}</span>;
    }
};

// Cascading Data Constants
const CASCADING_CITIES = ['呼和浩特市', '包头市', '鄂尔多斯市', '赤峰市', '通辽市', '乌海市', '呼伦贝尔市', '巴彦淖尔市', '乌兰察布市', '兴安盟', '锡林郭勒盟', '阿拉善盟'];

const CASCADING_COUNTIES: Record<string, string[]> = {
    '呼和浩特市': ['赛罕区', '新城区', '回民区', '玉泉区', '土默特左旗', '托克托县'],
    '包头市': ['昆都仑区', '东河区', '青山区', '九原区', '土默特右旗', '固阳县'],
    '鄂尔多斯市': ['东胜区', '康巴什区', '达拉特旗', '准格尔旗'],
    '赤峰市': ['红山区', '松山区', '元宝山区', '阿鲁科尔沁旗'],
    'default': ['市辖区', '某某县']
};

const CASCADING_GRIDS: Record<string, string[]> = {
    '赛罕区': ['大学西路网格', '乌兰察布东路网格', '昭乌达南路网格', '敕勒川路网格'],
    '新城区': ['成吉思汗大街网格', '海拉尔东路网格', '锡林北路网格'],
    'default': ['网格001', '网格002', '网格003']
};

export const GroupOrderDetailView: React.FC<GroupOrderDetailViewProps> = ({ order, onBack, initialTab = 'info', triggerTimestamp, onTabChange, onUpdateOrder }) => {
    // Core Data State
    const [tickets, setTickets] = useState<any[]>([]);
    const [orderStatus, setOrderStatus] = useState(order.status);
    const [completionTimestamp, setCompletionTimestamp] = useState<string>('');
    const [allTaskFeedback, setAllTaskFeedback] = useState<any[]>([]);
    
    // UI State
    const [activeTab, setActiveTab] = useState(initialTab);
    const [subTab, setSubTab] = useState<'all' | 'unassigned'>('all');
    const [filters, setFilters] = useState({ keyword: '', status: '', city: '' });
    
    // Process Tab State
    const [processFilters, setProcessFilters] = useState({ crmNo: '', status: '', city: '', district: '', address: '' });
    const [selectedTicketIds, setSelectedTicketIds] = useState<Set<number>>(new Set());
    
    // Dispatch Action State
    const [dispatchLevel, setDispatchLevel] = useState('');
    const [dispatchCity, setDispatchCity] = useState('');
    const [dispatchCounty, setDispatchCounty] = useState('');
    const [dispatchGrid, setDispatchGrid] = useState('');
    const [dispatchManager, setDispatchManager] = useState('');

    // Reply Action State
    const [replyComment, setReplyComment] = useState('');

    const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 50 });
    const [processPagination, setProcessPagination] = useState({ currentPage: 1, pageSize: 15 });

    // Sync State with Props (Initialization Only on Order ID change or explicit Trigger)
    useEffect(() => {
        const generatedTickets = generateDetailTickets(order);
        setTickets(generatedTickets);
        setOrderStatus(order.status);
        setCompletionTimestamp('');
        // NOTE: We do not reset activeTab here to preserve tab state on remount
        // unless it's a new trigger
        setSubTab('all');
        setReplyComment('');
        setSelectedTicketIds(new Set());
        setDispatchLevel('');
        setDispatchCity('');
        setDispatchCounty('');
        setDispatchGrid('');
        setDispatchManager('');

        // Generate Aggregated Feedback from the generated tickets
        // Simulating feedback entered for specific tasks
        const generatedFeedback = generatedTickets.flatMap(t => {
            // Generate 0-2 feedback items per ticket for a subset of tickets to simulate real activity
            if (Math.random() > 0.85) {
                return Array.from({ length: Math.floor(Math.random() * 2) + 1 }).map((_, i) => ({
                    id: `${t.id}_fb_${i}`,
                    taskId: t.title,
                    taskName: t.title,
                    time: addMinutesToTimeStr(t.netTime, 120 + Math.floor(Math.random() * 4000)), // Feedback happens after creation
                    operator: t.dispatchManager !== '待分派' ? t.dispatchManager : '系统',
                    operatorPhone: t.dispatchManager !== '待分派' ? `13${Math.floor(Math.random() * 9 + 1)}${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}` : '',
                    content: i === 0 ? '已联系客户，预约上门时间。' : '上门核查完毕，资源具备。'
                }));
            }
            return [];
        }).sort((a, b) => new Date(b.time.replace(' ', 'T')).getTime() - new Date(a.time.replace(' ', 'T')).getTime());
        setAllTaskFeedback(generatedFeedback);

    }, [order.id, triggerTimestamp]);

    // Sync Active Tab separately
    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab, triggerTimestamp]);

    // Pre-fill City/County based on Order Level for Dispatch
    useEffect(() => {
        if (activeTab === 'process') {
            if (order.level !== '省级' && order.city) {
                setDispatchCity(order.city);
            }
            if ((order.level === '旗县级' || order.level === '网格级') && order.county) {
                setDispatchCounty(order.county);
            }
        }
    }, [activeTab, order.level, order.city, order.county]);

    // Effect: Update status to '待回单' if all tickets are not '活动'
    useEffect(() => {
        if (tickets.length > 0) {
            const allNonActive = tickets.every(t => t.status !== '活动');
            if (allNonActive && orderStatus !== '已完成' && orderStatus !== '撤单' && orderStatus !== '待回单') {
                setOrderStatus('待回单');
            }
        }
    }, [tickets, orderStatus]);

    // Derived Status
    const processLogs = useMemo(() => generateProcessLogs(order, orderStatus, order.unassignedTickets, tickets.length, completionTimestamp), [order, orderStatus, tickets.length, completionTimestamp]);

    // Derived Manager Options based on cascading selection
    const managerOptions = useMemo(() => {
        if (!dispatchLevel) return [];

        if (dispatchLevel === '省级') {
            return MOCK_MANAGERS_MAP['省级'] as string[];
        }
        if (dispatchLevel === '地市级') {
            if (!dispatchCity) return [];
            const map = MOCK_MANAGERS_MAP['地市级'] as Record<string, string[]>;
            return (dispatchCity && map[dispatchCity]) ? map[dispatchCity] : map['default'];
        }
        if (dispatchLevel === '旗县级') {
            if (!dispatchCity || !dispatchCounty) return [];
            const map = MOCK_MANAGERS_MAP['旗县级'] as Record<string, string[]>;
            return (dispatchCounty && map[dispatchCounty]) ? map[dispatchCounty] : map['default'];
        }
        if (dispatchLevel === '网格级') {
            if (!dispatchCity || !dispatchCounty || !dispatchGrid) return [];
            const map = MOCK_MANAGERS_MAP['网格级'] as Record<string, string[]>;
            return map['default'];
        }
        return [];
    }, [dispatchLevel, dispatchCity, dispatchCounty, dispatchGrid]);

    // Filter Logic for Info Tab
    const filteredData = useMemo(() => {
        let data = tickets;
        if (filters.keyword) {
            const lowerKeyword = filters.keyword.toLowerCase();
            data = data.filter(item => 
                (item.crmNo && item.crmNo.toLowerCase().includes(lowerKeyword)) ||
                (item.bizId && item.bizId.toLowerCase().includes(lowerKeyword)) ||
                (item.title && item.title.toLowerCase().includes(lowerKeyword)) ||
                (item.address && item.address.toLowerCase().includes(lowerKeyword))
            );
        }
        if (filters.status) data = data.filter(item => item.status === filters.status);
        if (filters.city) data = data.filter(item => item.city === filters.city);
        if (subTab === 'unassigned') {
            data = data.filter(item => item.dispatchManager === '待分派');
        }
        return data;
    }, [filters, subTab, tickets]);

    const paginatedData = useMemo(() => {
        const start = (pagination.currentPage - 1) * pagination.pageSize;
        return filteredData.slice(start, start + pagination.pageSize);
    }, [filteredData, pagination]);

    const totalPages = Math.ceil(filteredData.length / pagination.pageSize);

    // Filter Logic for Process Tab
    const processFilteredData = useMemo(() => {
        // In dispatch view, only show tickets that need dispatching
        let data = tickets.filter(t => t.dispatchManager === '待分派');
        
        if (processFilters.crmNo) data = data.filter(item => item.crmNo.includes(processFilters.crmNo));
        if (processFilters.status) data = data.filter(item => item.status === processFilters.status);
        if (processFilters.city) data = data.filter(item => item.city === processFilters.city);
        if (processFilters.district) data = data.filter(item => item.district === processFilters.district);
        if (processFilters.address) data = data.filter(item => item.address.includes(processFilters.address));
        return data;
    }, [processFilters, tickets]);

    const processPaginatedData = useMemo(() => {
        const start = (processPagination.currentPage - 1) * processPagination.pageSize;
        return processFilteredData.slice(start, start + processPagination.pageSize);
    }, [processFilteredData, processPagination]);

    const processTotalPages = Math.ceil(processFilteredData.length / processPagination.pageSize);

    // Actions
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedTicketIds(new Set(processFilteredData.map(t => t.id)));
        } else {
            setSelectedTicketIds(new Set());
        }
    };

    const handleSelectRow = (id: number) => {
        const newSet = new Set(selectedTicketIds);
        if (newSet.has(id)) { newSet.delete(id); } else { newSet.add(id); }
        setSelectedTicketIds(newSet);
    };

    const handleAcceptOrder = () => {
        setOrderStatus('处理中');
        if (onUpdateOrder) {
            onUpdateOrder({ status: '处理中' });
        }
    };

    const handleConfirmDispatch = () => {
        if (selectedTicketIds.size === 0) {
            alert("请选择要分派的工单");
            return;
        }
        if (!dispatchManager) {
            alert("请选择分派交付经理");
            return;
        }
        const manager = dispatchManager.split(' ')[0] || '系统分派';
        setTickets(prev => prev.map(t => {
            if (selectedTicketIds.has(t.id)) {
                return { ...t, dispatchManager: manager, stage: '处理中' };
            }
            return t;
        }));
        setSelectedTicketIds(new Set());
        setDispatchManager('');
    };

    const handleSubmitReply = () => {
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        setCompletionTimestamp(timeStr);
        setOrderStatus('已完成');
        
        // Propagate changes to parent
        if (onUpdateOrder) {
            onUpdateOrder({ 
                status: '已完成', 
                completionTime: timeStr 
            });
        }
    };

    const handleTabClick = (tab: 'info' | 'flow' | 'process' | 'feedback') => {
        setActiveTab(tab);
        if (onTabChange) onTabChange(tab);
    };

    // --- Dynamic Flow Chart Logic ---
    // Steps: [0:下派, 1:受理, 2:处理, 3:回单]
    const getStepStatus = (index: number): 'completed' | 'active' | 'pending' => {
        const status = orderStatus;
        
        // 1. Dispatch (Index 0) - Always Completed
        if (index === 0) return 'completed';

        // 2. Accept (Index 1)
        if (index === 1) {
            if (status === '待受理') return 'active';
            // If Cancelled, treating as "completed" path for visualization (as it passed this stage)
            if (status === '撤单') return 'completed';
            // If processing or completed, Accept is done
            return 'completed'; 
        }

        // 3. Process (Index 2) - Assignment logic
        if (index === 2) {
            if (status === '待受理') return 'pending';
            if (status === '已完成') return 'completed';
            if (status === '待回单') return 'completed'; 
            if (status === '撤单') return 'completed'; // Treat cancelled as completed step (automatically finished current stage)
            if (status === '处理中') {
                // If there are unassigned tickets, we are actively processing assignments
                if (order.unassignedTickets > 0) return 'active';
                // If all assigned, this step is effectively done, waiting for reply
                return 'completed';
            }
        }

        // 4. Reply (Index 3)
        if (index === 3) {
            if (status === '已完成') return 'completed';
            if (status === '撤单') return 'pending'; // Future stage is PENDING if cancelled
            if (status === '待回单') return 'active';
            if (status === '处理中' && order.unassignedTickets === 0) return 'active';
            return 'pending';
        }

        return 'pending';
    };

    // Constants for Flow Chart
    const COMPLETED_BG = "#11365e"; 
    const PENDING_LINE = "#4b5563"; 
    const ACTIVE_GLOW = "shadow-[0_0_20px_rgba(0,210,255,0.5)]";

    const flowSteps = [
        { id: 'dispatch', label: '下派', subLabel: '下派' },
        { id: 'accept', label: '受理', subLabel: '受理' },
        { id: 'process', label: '处理', subLabel: '分派' },
        { id: 'reply', label: '回单', subLabel: '回单' }
    ];

    // Helper for Status Badge Color in Header
    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case '已完成': return 'bg-[#10b981]/20 text-[#34d399] border-[#10b981]/40';
            case '待受理': return 'bg-[#eab308]/20 text-[#fde047] border-[#eab308]/40';
            case '待回单': return 'bg-[#8b5cf6]/20 text-[#a78bfa] border-[#8b5cf6]/40';
            case '撤单': return 'bg-[#ef4444]/20 text-[#fca5a5] border-[#ef4444]/40';
            default: return 'bg-[#2563eb]/20 text-[#60a5fa] border-[#2563eb]/40';
        }
    };

    // Determine tabs based on status
    const visibleTabs = useMemo(() => {
        const tabs = ['团单信息', '流程信息', '团单处理', '阶段反馈'];
        return tabs;
    }, [orderStatus]);

    return (
        <div className="flex flex-col h-full w-full bg-transparent overflow-hidden animate-[fadeIn_0.3s_ease-out] font-sans text-sm">
            
            {/* Top Header Area */}
            <div className="bg-[#094F8B]/[0.05] pt-4 pb-0 space-y-4 shrink-0">
                <div className="flex items-start justify-between px-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-lg font-bold text-white tracking-wide">{order.name}</h2>
                            <span className={`px-2 py-0.5 rounded-sm text-xs border ${getStatusBadgeClass(orderStatus)}`}>
                                {orderStatus}
                            </span>
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                            团单标识号: {order.groupOrderId || 'BN-20260210-0089'}
                        </div>
                    </div>
                    {/* Back Button Removed */}
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-end w-full">
                    <div className="w-6 border-b border-blue-500/20"></div>
                    {visibleTabs.map((tab) => {
                        const tabMap: Record<string, 'info' | 'flow' | 'process' | 'feedback'> = {
                            '团单信息': 'info',
                            '流程信息': 'flow',
                            '团单处理': 'process',
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

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col p-6 ${activeTab === 'process' ? 'overflow-hidden' : 'space-y-6 overflow-y-auto custom-scrollbar'}`}>
                
                {/* --- TAB: INFO --- */}
                {activeTab === 'info' && (
                    <>
                        <div className="bg-transparent border border-blue-500/20 rounded-sm p-5 shadow-[0_0_15px_rgba(0,0,0,0.1)]">
                            <h3 className="text-sm font-bold text-neon-blue mb-4 flex items-center h-4">
                                <div className="w-1 h-3.5 bg-neon-blue mr-2"></div>
                                基本信息
                            </h3>
                            <div className="grid grid-cols-4 gap-y-4 gap-x-8 text-sm text-white whitespace-nowrap">
                                <div className="flex items-center gap-2"><span className="text-white w-24 text-right">团单等级：</span><span className="text-white">{order.level}</span></div>
                                <div className="flex items-center gap-2"><span className="text-white w-24 text-right">交付经理：</span><span className="text-white">{order.manager}</span></div>
                                <div className="flex items-center gap-2"><span className="text-white w-24 text-right">竣工率：</span><span className="text-white">{orderStatus === '已完成' ? '100.00%' : order.completionRate}</span></div>
                                <div className="flex items-center gap-2"><span className="text-white w-24 text-right">在途量/派单量：</span><span className="text-white">{orderStatus === '已完成' ? '0/46' : `${46 - (order.unassignedTickets || 0)}/46`}</span></div>
                                <div className="flex items-center gap-2"><span className="text-white w-24 text-right">剩余时限：</span><span className="text-white">{orderStatus === '已完成' ? '-' : order.remainingTime}</span></div>
                                <div className="flex items-center gap-2"><span className="text-white w-24 text-right">网络侧收单时间：</span><span className="text-white font-mono">{order.receiptTime}</span></div>
                                <div className="flex items-center gap-2"><span className="text-white w-24 text-right">交付时限：</span><span className="text-white font-mono">{order.deliveryDeadline}</span></div>
                                <div className="flex items-center gap-2"><span className="text-white w-24 text-right">完成时间：</span><span className="text-white font-mono">{orderStatus === '已完成' ? (completionTimestamp || order.completionTime || '2026-02-13 15:00:00') : '-'}</span></div>
                            </div>
                        </div>

                        <div className="bg-transparent border border-blue-500/20 rounded-sm p-5 shadow-[0_0_15px_rgba(0,0,0,0.1)] flex flex-col gap-4">
                            <div className="flex items-center gap-4 border-b border-blue-500/20 pb-3">
                                <h3 className="text-sm font-bold text-neon-blue flex items-center h-4"><div className="w-1 h-3.5 bg-neon-blue mr-2"></div>团单工单清单</h3>
                                <div className="flex items-center gap-2 ml-4">
                                    <button onClick={() => setSubTab('all')} className={`px-4 py-1 rounded-full text-xs transition-colors border ${subTab === 'all' ? 'bg-[#162B4D] border-blue-500 text-white shadow-sm' : 'border-transparent text-gray-400 hover:text-white'}`}>全部 ({tickets.length})</button>
                                    <button onClick={() => setSubTab('unassigned')} className={`px-4 py-1 rounded-full text-xs transition-colors border ${subTab === 'unassigned' ? 'bg-[#162B4D] border-blue-500 text-white shadow-sm' : 'border-transparent text-gray-400 hover:text-white'}`}>未分派工单 ({order.unassignedTickets})</button>
                                </div>
                            </div>
                            {/* ... Filter Bar and Table ... */}
                            <div className="flex items-center gap-3 pb-2 pt-1">
                                <StyledInput placeholder="CRM工单号/业务标识/工单标题/安装地址" className="w-80 bg-[#0b1730]/50 h-[28px]" value={filters.keyword} onChange={(e) => setFilters({...filters, keyword: e.target.value})} />
                                <div className="relative">
                                    <StyledSelect className="w-32 bg-[#0b1730]/50 h-[28px]" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
                                        <option value="">工单状态</option>
                                        <option value="活动">活动</option>
                                        <option value="历史">历史</option>
                                        <option value="撤单">撤单</option>
                                        <option value="退单">退单</option>
                                    </StyledSelect>
                                </div>
                                <div className="relative"><StyledSelect className="w-32 bg-[#0b1730]/50 h-[28px]" value={filters.city} onChange={(e) => setFilters({...filters, city: e.target.value})}><option value="">地市</option>{CASCADING_CITIES.map(c => <option key={c} value={c}>{c}</option>)}</StyledSelect></div>
                                <StyledButton variant="toolbar" className="h-[28px]" icon={<SearchIcon />}>查询</StyledButton>
                                <StyledButton variant="toolbar" className="h-[28px] bg-[#1e3a5f] border-gray-600" icon={<RefreshCwIcon />} onClick={() => setFilters({keyword: '', status: '', city: ''})}>重置</StyledButton>
                            </div>
                            <div className="w-full overflow-x-auto border border-blue-500/20 bg-[#0b1730]/30 custom-scrollbar">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-[#0c2242] text-blue-200">
                                        <tr>
                                            <Th>分派交付经理</Th><Th>工单标题</Th><Th>状态</Th><Th>CRM工单号</Th><Th>当前环节</Th><Th>工单来源</Th><Th>业务类型</Th><Th>业务标识</Th><Th>地市</Th><Th>区县</Th><Th>安装地址</Th><Th>网络侧收单时间</Th><Th>抢单/受理时间</Th><Th>抢单时长</Th><Th>预约响应时长</Th><Th>预约时长</Th><Th>预约交付时间</Th><Th>预约次数</Th><Th>改约次数</Th><Th>交付时限</Th><Th>完成时间</Th><Th className="text-center sticky right-0 bg-[#0c2242] border-l border-blue-500/20 shadow-[-5px_0_10px_rgba(0,0,0,0.2)]">操作</Th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-blue-100">
                                        {paginatedData.map((row, idx) => (
                                            <tr key={row.id} className={`hover:bg-[#1e3a5f]/40 transition-colors border-b border-blue-500/10 ${idx % 2 === 1 ? 'bg-[#0c2242]/30' : ''}`}>
                                                <td className="p-3 border-b border-blue-500/10">{row.dispatchManager}</td>
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
                                                <td className="p-3 border-b border-blue-500/10">{row.respDuration}</td>
                                                <td className="p-3 border-b border-blue-500/10">{row.appointDuration}</td>
                                                <td className="p-3 border-b border-blue-500/10 font-mono text-gray-400">{row.appointTime}</td>
                                                <td className="p-3 border-b border-blue-500/10">{row.appointCount}</td>
                                                <td className="p-3 border-b border-blue-500/10">{row.changeCount}</td>
                                                <td className="p-3 border-b border-blue-500/10 font-mono text-gray-400">{row.deadline}</td>
                                                <td className="p-3 border-b border-blue-500/10 font-mono text-gray-400">{row.finishTime}</td>
                                                <td className="p-3 border-b border-blue-500/10 text-center sticky right-0 bg-[#0b1730] border-l border-blue-500/20 shadow-[-5px_0_10px_rgba(0,0,0,0.2)]">
                                                    <div className="flex items-center justify-center gap-3 text-neon-blue text-xs"><a href="#" className="hover:text-white hover:underline">发起支撑</a><a href="#" className="hover:text-white hover:underline">催办</a><a href="#" className="hover:text-white hover:underline">查看轨迹</a></div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-blue-500/20">
                                <button className="flex items-center gap-1 text-neon-blue border border-neon-blue/30 px-3 py-1 rounded hover:bg-neon-blue/10 transition-colors text-xs"><DownloadIcon /> <span className="ml-1">导出</span></button>
                                <div className="flex items-center gap-4 text-blue-300 text-xs">
                                    <span>共 {filteredData.length} 条</span>
                                    <div className="flex items-center gap-1">
                                        <button className="p-1 hover:text-white disabled:opacity-30" disabled={pagination.currentPage === 1} onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}><ChevronLeftIcon /></button>
                                        <span className="px-2 py-0.5 bg-blue-600 text-white rounded">{pagination.currentPage}</span>
                                        <span className="text-gray-500">/ {totalPages}</span>
                                        <button className="p-1 hover:text-white disabled:opacity-30" disabled={pagination.currentPage === totalPages} onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}><ChevronRightIcon /></button>
                                    </div>
                                    <select className="bg-[#0b1730] border border-blue-500/30 text-white px-2 py-0.5 rounded outline-none" value={pagination.pageSize} onChange={(e) => setPagination({ currentPage: 1, pageSize: Number(e.target.value) })}><option value={10}>10条/页</option><option value={15}>15条/页</option><option value={30}>30条/页</option><option value={50}>50条/页</option></select>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* --- TAB: FLOW --- */}
                {activeTab === 'flow' && (
                    <div className="w-full flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out]">
                        <div className="bg-transparent border border-blue-500/20 rounded-sm pt-4 px-5 pb-16 shadow-sm flex flex-col items-center shrink-0">
                            <div className="w-full flex justify-start mb-6">
                                <div className="border-l-4 border-neon-blue pl-3 text-white font-bold text-sm">流程进度</div>
                            </div>
                            <div className="flex items-center w-full max-w-[800px]">
                                {flowSteps.map((step, idx) => {
                                        const status = getStepStatus(idx);
                                        const isCompleted = status === 'completed';
                                        const isActive = status === 'active';
                                        const nextStepStatus = idx < flowSteps.length - 1 ? getStepStatus(idx + 1) : null;
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

                        <div className="bg-transparent border border-blue-500/20 rounded-sm p-0 shadow-[0_0_15px_rgba(0,0,0,0.1)] overflow-hidden">
                            <div className="p-4 border-b border-blue-500/20 bg-transparent">
                                <h3 className="text-sm font-bold text-neon-blue flex items-center h-4 border-l-2 border-neon-blue pl-2">操作记录</h3>
                            </div>
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#0c2242] text-white">
                                    <tr>
                                        <th className="p-3 font-medium border-b border-blue-500/20 w-1/5">操作时间</th>
                                        <th className="p-3 font-medium border-b border-blue-500/20 w-1/5">操作人</th>
                                        <th className="p-3 font-medium border-b border-blue-500/20 w-1/5">操作类型</th>
                                        <th className="p-3 font-medium border-b border-blue-500/20">操作描述</th>
                                    </tr>
                                </thead>
                                <tbody className="text-blue-100">
                                    {processLogs.map((log, idx) => (
                                        <tr key={idx} className="hover:bg-blue-600/10 border-b border-blue-500/10 last:border-0 transition-colors">
                                            <td className="p-3 font-mono text-gray-300">{log.time}</td>
                                            <td className="p-3 text-white">{log.operator}</td>
                                            <td className="p-3 font-bold text-white">{log.type}</td>
                                            <td className="p-3 text-gray-300">{log.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- TAB: PROCESS --- */}
                {activeTab === 'process' && (
                    <div className="bg-transparent border border-blue-500/20 rounded-sm shadow-[0_0_15px_rgba(0,0,0,0.1)] flex flex-col h-full animate-[fadeIn_0.3s_ease-out] overflow-hidden relative">

                        {/* Process Tab Content ... (rest of the file remains unchanged in logic) */}
                        {/* ... omitted for brevity as change is only in outer container style ... */}
                        {/* Re-including the process tab content for completeness */}
                        {orderStatus === '撤单' ? (
                            <div className="flex flex-col items-center justify-center h-full p-8 animate-[fadeIn_0.5s_ease-out]">
                                <div className="flex flex-col items-center justify-center gap-6 p-10 bg-transparent rounded-lg border border-red-500/20 shadow-[0_0_40px_rgba(220,38,38,0.1)]">
                                    <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/50 flex items-center justify-center text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <div className="text-2xl font-bold text-white tracking-wide">团单已撤销</div>
                                        <div className="text-red-300/80 text-sm max-w-md text-center bg-red-900/20 px-6 py-3 rounded border border-red-500/20">
                                            该团单已被撤销，流程已终止。无法进行受理、分派或回单操作。
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : orderStatus === '待受理' ? (
                            <div className="flex flex-col items-center justify-center h-full p-8 animate-[fadeIn_0.5s_ease-out]">
                                <div className="flex flex-col w-full max-w-2xl bg-transparent border border-blue-500/30 rounded-md p-8 shadow-xl">
                                    <div className="flex items-center gap-3 mb-6 border-b border-blue-500/20 pb-4">
                                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">团单待受理</h3>
                                            <p className="text-sm text-blue-300">请确认团单信息无误后，点击下方按钮进行受理。</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-center pt-4">
                                        <StyledButton variant="primary" className="px-8 py-3 h-auto text-base" onClick={handleAcceptOrder} icon={<CheckCircleIcon />}>确认受理</StyledButton>
                                    </div>
                                </div>
                            </div>
                        ) : (orderStatus === '处理中' && order.unassignedTickets > 0) ? (
                            <>
                                <div className="flex items-center justify-between p-4 border-b border-blue-500/20 bg-transparent shrink-0">
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white text-xs whitespace-nowrap">团单等级：</span>
                                            <span className="text-white text-xs font-bold mr-2">{order.level}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white text-xs whitespace-nowrap">分派层级：</span>
                                            <StyledSelect 
                                                className="w-24 bg-[#0b1730]/50 h-[28px]" 
                                                value={dispatchLevel} 
                                                onChange={(e) => { 
                                                    setDispatchLevel(e.target.value); 
                                                    // Only reset downstream if they are NOT fixed by order level
                                                    if (order.level === '省级') setDispatchCity(''); 
                                                    if (order.level === '省级' || order.level === '地市级') setDispatchCounty('');
                                                    setDispatchGrid(''); 
                                                    setDispatchManager(''); 
                                                }}
                                            >
                                                <option value="">请选择</option>
                                                {(order.level === '省级' ? ['省级', '地市级', '旗县级', '网格级'] :
                                                  order.level === '地市级' ? ['地市级', '旗县级', '网格级'] :
                                                  order.level === '旗县级' ? ['旗县级', '网格级'] :
                                                  order.level === '网格级' ? ['网格级'] : []).map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </StyledSelect>
                                        </div>
                                        {['地市级', '旗县级', '网格级'].includes(dispatchLevel) && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-white text-xs whitespace-nowrap">地市：</span>
                                                <StyledSelect 
                                                    className="w-28 bg-[#0b1730]/50 h-[28px]" 
                                                    value={dispatchCity} 
                                                    onChange={(e) => { 
                                                        setDispatchCity(e.target.value); 
                                                        setDispatchCounty(''); 
                                                        setDispatchGrid(''); 
                                                        setDispatchManager(''); 
                                                    }}
                                                    disabled={order.level !== '省级'}
                                                >
                                                    <option value="">请选择</option>
                                                    {CASCADING_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                </StyledSelect>
                                            </div>
                                        )}
                                        {['旗县级', '网格级'].includes(dispatchLevel) && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-white text-xs whitespace-nowrap">旗县：</span>
                                                <StyledSelect 
                                                    className="w-28 bg-[#0b1730]/50 h-[28px]" 
                                                    value={dispatchCounty} 
                                                    onChange={(e) => { 
                                                        setDispatchCounty(e.target.value); 
                                                        setDispatchGrid(''); 
                                                        setDispatchManager(''); 
                                                    }} 
                                                    disabled={!dispatchCity || order.level === '网格级'}
                                                >
                                                    <option value="">请选择</option>
                                                    {(CASCADING_COUNTIES[dispatchCity] || CASCADING_COUNTIES['default']).map(c => <option key={c} value={c}>{c}</option>)}
                                                </StyledSelect>
                                            </div>
                                        )}
                                        {dispatchLevel === '网格级' && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-white text-xs whitespace-nowrap">网格：</span>
                                                <StyledSelect 
                                                    className="w-28 bg-[#0b1730]/50 h-[28px]" 
                                                    value={dispatchGrid} 
                                                    onChange={(e) => { 
                                                        setDispatchGrid(e.target.value); 
                                                        setDispatchManager(''); 
                                                    }} 
                                                    disabled={!dispatchCounty}
                                                >
                                                    <option value="">请选择</option>
                                                    {(CASCADING_GRIDS[dispatchCounty] || CASCADING_GRIDS['default']).map(g => <option key={g} value={g}>{g}</option>)}
                                                </StyledSelect>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2"><span className="text-white text-xs whitespace-nowrap">分派交付经理：</span><StyledSelect className="w-48 bg-[#0b1730]/50 h-[28px]" value={dispatchManager} onChange={(e) => setDispatchManager(e.target.value)} disabled={managerOptions.length === 0}><option value="">请选择</option>{managerOptions.map(m => (<option key={m} value={m.split(' ')[0]}>{m}</option>))}</StyledSelect></div>
                                        <StyledButton variant="primary" className="h-[28px] bg-[#07596C] border-[#5FBADD]" onClick={handleConfirmDispatch}>确认分派</StyledButton>
                                    </div>
                                    <div className="text-blue-300 text-xs whitespace-nowrap ml-4">已选择 <span className="text-neon-blue font-bold text-sm mx-1">{selectedTicketIds.size}</span> 张工单</div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 p-4 border-b border-blue-500/20 bg-transparent shrink-0">
                                    <StyledInput placeholder="请输入CRM工单号" className="w-48 bg-[#0b1730]/50 h-[28px]" value={processFilters.crmNo} onChange={(e) => setProcessFilters({...processFilters, crmNo: e.target.value})} />
                                    <div className="relative"><StyledSelect className="w-32 bg-[#0b1730]/50 h-[28px]" value={processFilters.status} onChange={(e) => setProcessFilters({...processFilters, status: e.target.value})}><option value="">工单状态</option><option value="活动">活动</option></StyledSelect></div>
                                    <div className="relative"><StyledSelect className="w-32 bg-[#0b1730]/50 h-[28px]" value={processFilters.city} onChange={(e) => setProcessFilters({...processFilters, city: e.target.value})}><option value="">地市</option>{CASCADING_CITIES.map(c => <option key={c} value={c}>{c}</option>)}</StyledSelect></div>
                                    <div className="relative ml-2"><StyledSelect className="w-32 bg-[#0b1730]/50 h-[28px]" value={processFilters.district} onChange={(e) => setProcessFilters({...processFilters, district: e.target.value})}><option value="">区县</option>{['赛罕区', '新城区', '回民区'].map(d => <option key={d} value={d}>{d}</option>)}</StyledSelect></div>
                                    <StyledInput placeholder="安装地址" className="w-48 bg-[#0b1730]/50 h-[28px]" value={processFilters.address} onChange={(e) => setProcessFilters({...processFilters, address: e.target.value})} />
                                    <StyledButton variant="toolbar" className="h-[28px]" icon={<SearchIcon />}>查询</StyledButton>
                                    <StyledButton variant="toolbar" className="h-[28px] bg-[#1e3a5f] border-gray-600" icon={<RefreshCwIcon />} onClick={() => setProcessFilters({crmNo: '', status: '', city: '', district: '', address: ''})}>重置</StyledButton>
                                </div>
                                <div className="flex-1 overflow-x-auto overflow-y-auto bg-transparent custom-scrollbar">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-[#0c2242] text-blue-200 sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th className="p-3 border-b border-blue-500/30 w-10 text-center"><input type="checkbox" className="accent-neon-blue cursor-pointer" checked={processPaginatedData.length > 0 && selectedTicketIds.size === processPaginatedData.length} onChange={handleSelectAll} /></th>
                                                <Th>工单标题</Th><Th>状态</Th><Th>CRM工单号</Th><Th>当前环节</Th><Th>当前处理人</Th><Th>工单来源</Th><Th>业务类型</Th><Th>业务标识</Th><Th>地市</Th><Th>区县</Th><Th>安装地址</Th><Th>网络侧收单时间</Th><Th>抢单/受理时间</Th><Th>抢单时长</Th><Th>预约响应时长</Th><Th>预约时长</Th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-blue-100">
                                            {processPaginatedData.length > 0 ? (
                                                processPaginatedData.map((row, idx) => {
                                                    const isSelected = selectedTicketIds.has(row.id);
                                                    return (
                                                        <tr key={row.id} className={`hover:bg-[#1e3a5f]/40 transition-colors border-b border-blue-500/10 ${idx % 2 === 1 ? 'bg-[#0c2242]/30' : ''} ${isSelected ? 'bg-[#1e3a5f]/60' : ''}`} onClick={() => handleSelectRow(row.id)}>
                                                            <td className="p-3 border-b border-blue-500/10 text-center" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="accent-neon-blue cursor-pointer" checked={isSelected} onChange={() => handleSelectRow(row.id)} /></td>
                                                            <td className="p-3 border-b border-blue-500/10">{row.title}</td><td className="p-3 border-b border-blue-500/10"><span className="px-2 py-0.5 border border-blue-500/50 text-blue-300 rounded text-[10px] bg-blue-500/10">{row.status}</span></td><td className="p-3 border-b border-blue-500/10 font-mono">{row.crmNo}</td><td className="p-3 border-b border-blue-500/10">{row.stage}</td><td className="p-3 border-b border-blue-500/10">{row.dispatchManager}</td><td className="p-3 border-b border-blue-500/10">{row.source}</td><td className="p-3 border-b border-blue-500/10">{row.bizType}</td><td className="p-3 border-b border-blue-500/10 font-mono">{row.bizId}</td><td className="p-3 border-b border-blue-500/10">{row.city}</td><td className="p-3 border-b border-blue-500/10">{row.district}</td><td className="p-3 border-b border-blue-500/10 max-w-[150px] truncate" title={row.address}>{row.address}</td><td className="p-3 border-b border-blue-500/10 font-mono text-gray-400">{row.netTime}</td><td className="p-3 border-b border-blue-500/10 font-mono text-gray-400">{row.grabTime}</td><td className="p-3 border-b border-blue-500/10">{row.grabDuration}</td><td className="p-3 border-b border-blue-500/10">{row.respDuration}</td><td className="p-3 border-b border-blue-500/10">{row.appointDuration}</td>
                                                        </tr>
                                                    );
                                                })
                                            ) : ( <tr><td colSpan={17} className="p-8 text-center text-blue-300/50">暂无未分派工单</td></tr> )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex items-center justify-between p-3 border-t border-blue-500/20 bg-transparent shrink-0">
                                    <div className="flex items-center gap-4 text-blue-300 text-xs ml-auto">
                                        <span>共 {processFilteredData.length} 条</span>
                                        <div className="flex items-center gap-1">
                                            <button className="p-1 hover:text-white disabled:opacity-30" disabled={processPagination.currentPage === 1} onClick={() => setProcessPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}><ChevronLeftIcon /></button>
                                            <span className="px-2 py-0.5 bg-blue-600 text-white rounded">{processPagination.currentPage}</span>
                                            <span className="text-gray-500">/ {processTotalPages}</span>
                                            <button className="p-1 hover:text-white disabled:opacity-30" disabled={processPagination.currentPage === processTotalPages} onClick={() => setProcessPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}><ChevronRightIcon /></button>
                                        </div>
                                        <select className="bg-[#0b1730] border border-blue-500/30 text-white px-2 py-0.5 rounded outline-none" value={processPagination.pageSize} onChange={(e) => setProcessPagination({ currentPage: 1, pageSize: Number(e.target.value) })}><option value={15}>15条/页</option><option value={30}>30条/页</option><option value={50}>50条/页</option></select>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-8 animate-[fadeIn_0.5s_ease-out]">
                                {orderStatus === '已完成' ? (
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center text-green-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                        <div className="text-2xl font-bold text-white tracking-wide">团单已完成</div>
                                        <div className="text-blue-300 text-sm max-w-md text-center">所有工单已处理完毕，团单流程已归档。您可以在“团单信息”标签页查看完整工单清单。</div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center w-full max-w-[500px]">
                                        <div className="w-12 h-12 rounded-full border border-[#10b981]/50 bg-[#064e3b]/30 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(16,185,129,0.15)]"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                                        <h2 className="text-xl font-bold text-white mb-2 tracking-wider">所有工单已分派完毕</h2>
                                        <p className="text-blue-200/60 text-sm mb-8 tracking-wide">请填写回单说明并提交，完成团单处理流程。</p>
                                        <div className="w-full flex flex-col gap-3">
                                            <label className="text-blue-100 text-sm pl-1 tracking-wide">回单说明（选填）：</label>
                                            <textarea className="w-full h-32 bg-[#0b1730]/40 border border-blue-500/30 rounded-sm p-4 text-white text-sm placeholder-blue-400/20 focus:outline-none focus:border-[#10b981]/50 focus:bg-[#0b1730]/60 transition-all resize-none shadow-inner" placeholder="请输入回单说明..." value={replyComment} onChange={(e) => setReplyComment(e.target.value)}></textarea>
                                            <div className="flex justify-center mt-6"><button onClick={handleSubmitReply} className="bg-[#15803d] hover:bg-[#166534] text-white px-10 py-2 rounded-[2px] transition-all duration-300 text-sm font-medium tracking-widest shadow-lg hover:shadow-green-900/40 border border-green-600/50">提交回单</button></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* --- TAB: FEEDBACK --- */}
                {activeTab === 'feedback' && (
                    <div className="flex flex-col h-full bg-transparent border border-blue-500/20 rounded-sm p-5 shadow-sm animate-[fadeIn_0.3s_ease-out] overflow-hidden">
                        <h3 className="text-sm font-bold text-neon-blue border-l-2 border-neon-blue pl-2 flex items-center h-4 mb-4 shrink-0">
                            任务阶段反馈汇总
                        </h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                            {orderStatus !== '待受理' && allTaskFeedback.length > 0 ? (
                                allTaskFeedback.map(item => (
                                    <div key={item.id} className="bg-[#0b1730]/40 border border-blue-500/10 p-4 rounded-sm hover:bg-[#0b1730]/60 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-neon-blue font-bold text-sm">
                                                    {item.operator}
                                                </span>
                                                {item.operatorPhone && (
                                                    <span className="text-blue-300 text-xs font-mono">
                                                        {item.operatorPhone}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-gray-400 font-mono text-xs">{item.time}</span>
                                        </div>
                                        <div className="text-white text-sm leading-relaxed pl-1 border-l-2 border-blue-500/20 ml-1">
                                            {item.content}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-blue-300/50 text-sm">
                                    暂无反馈记录
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
