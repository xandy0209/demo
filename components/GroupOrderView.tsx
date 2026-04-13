
import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_GROUP_ORDER_DATA, INNER_MONGOLIA_CITIES } from '../constants';
import { StyledInput, StyledButton, StyledSelect } from './UI';
import { 
    SearchIcon, 
    RefreshCwIcon, 
    DownloadIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    SidebarCloseIcon, 
    SidebarOpenIcon, 
    FolderIcon,
    ListIcon,
    UserIcon,
    PlusCircleIcon,
    EditIcon,
    TrashIcon,
    XIcon
} from './Icons';
import { GroupOrderRecord } from '../types';
import { GroupOrderDetailView } from './GroupOrderDetailView';
import { GroupOrderTaskDetailView } from './GroupOrderTaskDetailView';
import * as XLSX from 'xlsx';

// Star Icon for importance column
const StarIcon = ({ filled, onClick }: { filled: boolean; onClick?: (e: React.MouseEvent) => void }) => (
    <div onClick={onClick} className={`${onClick ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#fbbf24" : "none"} stroke={filled ? "#fbbf24" : "#94a3b8"} strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
    </div>
);

const Th = ({ children, className = "", ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={`p-3 font-semibold border-b border-blue-500/30 whitespace-nowrap text-sm bg-[#0c2242] text-blue-200 ${className}`} {...props}>
    {children}
  </th>
);

// Helper to generate Group Order ID
const getGroupOrderId = (index: number) => `BN-${new Date().getFullYear()}0210-${(index + 1).toString().padStart(3, '0')}`;

// Mock Data for Managers
const MOCK_MANAGERS = [
    { id: 1, name: '张宏伟', phone: '13947180001', level: '省级', city: '呼和浩特市', county: '赛罕区', grid: '大学西路网格', company: '铁通公司', businesses: [] },
    { id: 2, name: '赵铁柱', phone: '13800138000', level: '省级', city: '包头市', county: '昆区', grid: '阿尔丁大街网格', company: '中移铁通', businesses: [] },
    { id: 3, name: '王坤鹏', phone: '15004820003', level: '地市级', city: '呼和浩特市', county: '新城区', grid: '成吉思汗大街网格', company: '润建通信', businesses: ['专线', '宽带'] },
    { id: 4, name: '刘伟', phone: '18447180004', level: '地市级', city: '呼和浩特市', county: '回民区', grid: '中山西路网格', company: '中移工程', businesses: ['宽带'] },
    { id: 5, name: '孙八', phone: '13600000005', level: '地市级', city: '包头市', county: '青山区', grid: '科学路网格', company: '立通通信', businesses: ['专线'] },
    { id: 6, name: '王晓强', phone: '19804890007', level: '旗县级', city: '呼和浩特市', county: '赛罕区', grid: '人民路网格', company: '铁通公司', businesses: ['终端'] },
    { id: 7, name: '张彦飞', phone: '18747740008', level: '旗县级', city: '呼和浩特市', county: '赛罕区', grid: '大学东路网格', company: '润建通信', businesses: ['专线', '终端'] },
    { id: 8, name: '李明', phone: '15800000011', level: '网格级', city: '呼和浩特市', county: '赛罕区', grid: '大学西路网格', company: '铁通公司', businesses: ['专线', '宽带', '终端'] },
    { id: 9, name: '武楠', phone: '13500000012', level: '网格级', city: '呼和浩特市', county: '新城区', grid: '海拉尔东路网格', company: '中移铁通', businesses: ['宽带', '终端'] },
    { id: 10, name: '赵六', phone: '13400000013', level: '网格级', city: '包头市', county: '昆区', grid: '钢铁大街网格', company: '立通通信', businesses: ['专线'] },
];

const CASCADING_COUNTIES: Record<string, string[]> = {
    '呼和浩特市': ['赛罕区', '新城区', '回民区', '玉泉区', '土默特左旗', '托克托县'],
    '包头市': ['昆都仑区', '东河区', '青山区', '九原区', '土默特右旗', '固阳县'],
    '鄂尔多斯市': ['东胜区', '康巴什区', '达拉特旗', '准格尔旗'],
    '赤峰市': ['红山区', '松山区', '元宝山区', '阿鲁科尔沁旗'],
    '通辽市': ['科尔沁区', '开鲁县'],
    'default': ['市辖区', '某某县']
};

export interface TabItem {
    id: string;
    label: string;
    type?: 'module' | 'detail' | 'task-detail';
    initialTab?: 'info' | 'flow' | 'process' | 'feedback';
    triggerTimestamp?: number; // Used to force refresh when clicking same item
}

export interface GroupOrderViewState {
    tabs: TabItem[];
    activeTabId: string;
    detailRecords: Record<string, GroupOrderRecord>;
    taskDetailRecords: Record<string, any>;
    isSidebarCollapsed: boolean;
    targetOrderId: string | null;
    orderData: any[];
    managerData: any[];
    managerKeyword: string;
    managerFilters: {
        level: string;
        city: string;
        county: string;
    };
    orderFilters: {
        keyword: string;
        status: string;
        level: string;
        isImportant: string;
        startDate: string;
        endDate: string;
    };
    taskFilters: {
        keyword: string;
        status: string;
        startDate: string;
        endDate: string;
    };
    pagination: { currentPage: number; pageSize: number; };
}

// Initial State Generator
export const getInitialGroupOrderState = (): GroupOrderViewState => ({
    tabs: [{ id: 'order', label: '团单信息管理', type: 'module' }],
    activeTabId: 'order',
    detailRecords: {},
    taskDetailRecords: {},
    isSidebarCollapsed: false,
    targetOrderId: null,
    orderData: MOCK_GROUP_ORDER_DATA.map((item, index) => ({
        ...item,
        groupOrderId: getGroupOrderId(index) 
    })),
    managerData: MOCK_MANAGERS,
    managerKeyword: '',
    managerFilters: { level: '', city: '', county: '' },
    orderFilters: { keyword: '', status: '', level: '', isImportant: '', startDate: '', endDate: '' },
    taskFilters: { keyword: '', status: '', startDate: '', endDate: '' },
    pagination: { currentPage: 1, pageSize: 15 }
});

interface GroupOrderViewProps {
    viewState: GroupOrderViewState;
    setViewState: React.Dispatch<React.SetStateAction<GroupOrderViewState>>;
    // Keeping old props for compatibility if needed, though mostly replaced by viewState logic
    onOpenDetail?: (order: GroupOrderRecord, tab?: 'info' | 'flow' | 'process') => void;
    onOpenTaskDetail?: (task: any, tab?: 'info' | 'flow' | 'process') => void;
    activeSubTab?: 'order' | 'task';
    onSubTabChange?: (tab: 'order' | 'task') => void;
}

export const GroupOrderView: React.FC<GroupOrderViewProps> = ({ 
    viewState, 
    setViewState, 
    activeSubTab, 
    onSubTabChange 
}) => {
    
    // Destructure state from props
    const { 
        tabs, 
        activeTabId, 
        detailRecords, 
        taskDetailRecords, 
        isSidebarCollapsed, 
        targetOrderId, 
        orderData, 
        managerData,
        managerKeyword, 
        managerFilters,
        orderFilters, 
        taskFilters, 
        pagination
    } = viewState;

    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, tabId: string } | null>(null);
    
    // Modal States
    const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
    const [editingManagerId, setEditingManagerId] = useState<number | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    const [newManagerForm, setNewManagerForm] = useState({
        name: '',
        phone: '',
        level: '',
        city: '',
        county: '',
        counties: [] as string[],
        countyTeams: {} as Record<string, string>,
        grid: '',
        company: '',
        businesses: [] as string[]
    });

    const [isCountyDropdownOpen, setIsCountyDropdownOpen] = useState(false);

    // Import/Export Handlers
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImportTemplate = () => {
        const headers = [
            '序号', '盟市', '旗县', '代维公司', 
            '网格交付经理', '网格交付经理电话', '网格交付经理管辖业务\n(枚举值：专线、宽带、终端)', 
            '旗县交付经理', '旗县交付经理电话', '旗县交付经理管辖业务\n(枚举值：专线、宽带、终端)', 
            '分公司交付经理', '分公司交付经理电话', '分公司交付经理管辖业务\n(枚举值：专线、宽带、终端)', 
            '区公司交付经理', '区公司交付经理电话'
        ];
        // Create an empty row with just the index 1
        const data = [
            headers,
            [1, '', '', '', '', '', '', '', '', '', '', '', '', '', '']
        ];
        const ws = XLSX.utils.aoa_to_sheet(data);
        
        // Set column widths to accommodate longer headers
        ws['!cols'] = [
            { wch: 6 },  // 序号
            { wch: 10 }, // 盟市
            { wch: 10 }, // 旗县
            { wch: 15 }, // 代维公司
            { wch: 15 }, // 网格交付经理
            { wch: 18 }, // 网格交付经理电话
            { wch: 35 }, // 网格交付经理管辖业务
            { wch: 15 }, // 旗县交付经理
            { wch: 18 }, // 旗县交付经理电话
            { wch: 35 }, // 旗县交付经理管辖业务
            { wch: 15 }, // 分公司交付经理
            { wch: 18 }, // 分公司交付经理电话
            { wch: 35 }, // 分公司交付经理管辖业务
            { wch: 15 }, // 区公司交付经理
            { wch: 18 }  // 区公司交付经理电话
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "交付经理导入模版.xlsx");
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            console.log("Imported Data:", jsonData);
            // Here you would typically process the data and update the state
            // For now, we just log it as the requirements didn't specify the exact mapping logic
        } catch (error) {
            console.error("Error reading file:", error);
        }

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    // Helper Setters to mimic local state API
    const updateState = (updates: Partial<GroupOrderViewState>) => setViewState(prev => ({ ...prev, ...updates }));
    
    const setTabs = (val: any) => setViewState(prev => ({ ...prev, tabs: typeof val === 'function' ? val(prev.tabs) : val }));
    const setActiveTabId = (val: any) => setViewState(prev => ({ ...prev, activeTabId: typeof val === 'function' ? val(prev.activeTabId) : val }));
    const setDetailRecords = (val: any) => setViewState(prev => ({ ...prev, detailRecords: typeof val === 'function' ? val(prev.detailRecords) : val }));
    const setTaskDetailRecords = (val: any) => setViewState(prev => ({ ...prev, taskDetailRecords: typeof val === 'function' ? val(prev.taskDetailRecords) : val }));
    const setIsSidebarCollapsed = (val: any) => setViewState(prev => ({ ...prev, isSidebarCollapsed: typeof val === 'function' ? val(prev.isSidebarCollapsed) : val }));
    const setTargetOrderId = (val: any) => setViewState(prev => ({ ...prev, targetOrderId: typeof val === 'function' ? val(prev.targetOrderId) : val }));
    const setOrderData = (val: any) => setViewState(prev => ({ ...prev, orderData: typeof val === 'function' ? val(prev.orderData) : val }));
    const setManagerData = (val: any) => setViewState(prev => ({ ...prev, managerData: typeof val === 'function' ? val(prev.managerData) : val }));
    const setManagerKeyword = (val: any) => setViewState(prev => ({ ...prev, managerKeyword: typeof val === 'function' ? val(prev.managerKeyword) : val }));
    const setManagerFilters = (val: any) => setViewState(prev => ({ ...prev, managerFilters: typeof val === 'function' ? val(prev.managerFilters) : val }));
    const setOrderFilters = (val: any) => setViewState(prev => ({ ...prev, orderFilters: typeof val === 'function' ? val(prev.orderFilters) : val }));
    const setTaskFilters = (val: any) => setViewState(prev => ({ ...prev, taskFilters: typeof val === 'function' ? val(prev.taskFilters) : val }));
    const setPagination = (val: any) => setViewState(prev => ({ ...prev, pagination: typeof val === 'function' ? val(prev.pagination) : val }));

    const handleSidebarClick = (module: 'order' | 'task' | 'config') => {
        const labels: Record<string, string> = {
            'order': '团单信息管理',
            'task': '团单任务管理',
            'config': '交付经理配置'
        };

        setViewState(prev => {
            const exists = prev.tabs.find(t => t.id === module);
            const newTabs = exists ? prev.tabs : [...prev.tabs, { id: module, label: labels[module], type: 'module' as const }];
            return {
                ...prev,
                tabs: newTabs,
                activeTabId: module
            };
        });

        // Only propagate 'order' or 'task' to parent if required, ignore 'config' for parent sync
        if (onSubTabChange && (module === 'order' || module === 'task')) {
            onSubTabChange(module);
        }
    }

    const handleCloseTab = (e: React.MouseEvent | null, tabId: string) => {
        if (e) e.stopPropagation();
        
        setViewState(prev => {
            const newTabs = prev.tabs.filter(t => t.id !== tabId);
            let newActiveId = prev.activeTabId;
            const newDetailRecords = { ...prev.detailRecords };
            const newTaskDetailRecords = { ...prev.taskDetailRecords };

            if (tabId.startsWith('detail-')) delete newDetailRecords[tabId];
            if (tabId.startsWith('task-detail-')) delete newTaskDetailRecords[tabId];

            if (prev.activeTabId === tabId) {
                if (newTabs.length > 0) {
                    newActiveId = newTabs[newTabs.length - 1].id;
                } else {
                    newActiveId = ''; // Handle case where all tabs are closed
                }
            }

            return {
                ...prev,
                tabs: newTabs,
                activeTabId: newActiveId,
                detailRecords: newDetailRecords,
                taskDetailRecords: newTaskDetailRecords
            };
        });
    };
    
    // Handle Drill Down from Order List
    const handleDispatchClick = (row: any) => {
        setViewState(prev => ({
            ...prev,
            targetOrderId: row.groupOrderId,
            taskFilters: { ...prev.taskFilters, keyword: row.name },
            pagination: { ...prev.pagination, currentPage: 1 }
        }));
        handleSidebarClick('task');
    };

    // Handle opening Group Order Detail in local tab
    const handleOpenOrderDetailLocal = (row: GroupOrderRecord, targetTab: 'info' | 'flow' | 'process' | 'feedback' = 'info') => {
        const tabId = `detail-${row.id}`;
        const timestamp = Date.now();
        
        setViewState(prev => {
            const exists = prev.tabs.find(t => t.id === tabId);
            const newTabs = exists 
                ? prev.tabs.map(t => t.id === tabId ? { ...t, initialTab: targetTab, triggerTimestamp: timestamp } : t)
                : [...prev.tabs, { id: tabId, label: '团单详情', type: 'detail' as const, initialTab: targetTab, triggerTimestamp: timestamp }];
            
            return {
                ...prev,
                tabs: newTabs,
                activeTabId: tabId,
                detailRecords: { ...prev.detailRecords, [tabId]: row }
            };
        });
    };

    // Handle update order from detail view
    const handleUpdateOrder = (tabId: string, updates: Partial<GroupOrderRecord>) => {
        setViewState(prev => {
            // Update detail record
            const oldDetail = prev.detailRecords[tabId];
            if (!oldDetail) return prev; // Should not happen

            const newDetail = { ...oldDetail, ...updates };
            
            // Update main data list as well to persist state
            const newOrderData = prev.orderData.map(order => 
                order.id === newDetail.id ? { ...order, ...updates } : order
            );

            return {
                ...prev,
                detailRecords: {
                    ...prev.detailRecords,
                    [tabId]: newDetail
                },
                orderData: newOrderData
            };
        });
    };

    // Handle opening related order from task view
    const handleOpenRelatedOrder = (groupOrderId: string) => {
        const order = orderData.find((o: any) => o.groupOrderId === groupOrderId);
        if (order) {
            handleOpenOrderDetailLocal(order, 'info');
        }
    };

    // Handle opening Task Detail in local tab
    const handleOpenTaskDetailLocal = (task: any, targetTab: 'info' | 'flow' | 'process' | 'feedback' = 'info') => {
        const tabId = `task-detail-${task.id}`;
        const timestamp = Date.now();
        
        setViewState(prev => {
            // const label = task.name.length > 8 ? task.name.substring(0, 8) + '...' : task.name;
            const exists = prev.tabs.find(t => t.id === tabId);
            const newTabs = exists
                ? prev.tabs.map(t => t.id === tabId ? { ...t, initialTab: targetTab, triggerTimestamp: timestamp } : t)
                : [...prev.tabs, { id: tabId, label: '团单任务详情', type: 'task-detail' as const, initialTab: targetTab, triggerTimestamp: timestamp }];

            return {
                ...prev,
                tabs: newTabs,
                activeTabId: tabId,
                taskDetailRecords: { ...prev.taskDetailRecords, [tabId]: task }
            };
        });
    };

    // Handler to preserve inner tab state when switching inside details
    const handleDetailTabChange = (tabId: string, newTab: 'info' | 'flow' | 'process' | 'feedback') => {
        setTabs((prev: TabItem[]) => prev.map(t => t.id === tabId ? { ...t, initialTab: newTab } : t));
    };

    // Handle Important Toggle
    const handleToggleImportant = (id: string) => {
        setOrderData((prev: any[]) => prev.map((item: any) => 
            item.id === id ? { ...item, isImportant: !item.isImportant } : item
        ));
    };

    // Manager Edit/Delete Actions
    const handleEditManager = (manager: any) => {
        setNewManagerForm({
            name: manager.name,
            phone: manager.phone,
            level: manager.level,
            city: manager.city,
            county: manager.county,
            counties: manager.counties || (manager.county ? manager.county.split('、') : []),
            countyTeams: manager.countyTeams || {},
            grid: manager.grid,
            company: manager.company,
            businesses: manager.businesses || []
        });
        setEditingManagerId(manager.id);
        setIsManagerModalOpen(true);
    };

    const handleDeleteManager = (id: number) => {
        setDeleteConfirmId(id);
    };

    const confirmDeleteManager = () => {
        if (deleteConfirmId) {
            setManagerData((prev: any[]) => prev.filter(m => m.id !== deleteConfirmId));
            setDeleteConfirmId(null);
        }
    };

    // Add/Edit Manager Submit Handler
    const handleManagerSave = () => {
        const { name, phone, level, city, counties, countyTeams, businesses } = newManagerForm;
        const errors = [];

        if (!name) errors.push('姓名');
        if (!phone) errors.push('电话');
        if (!level) errors.push('级别');

        if (level === '地市级') {
            if (!city) errors.push('地市');
            if (businesses.length === 0) errors.push('管辖业务');
        } else if (level === '旗县级') {
            if (!city) errors.push('地市');
            if (counties.length === 0) errors.push('旗县');
            if (businesses.length === 0) errors.push('管辖业务');
        } else if (level === '网格级') {
            if (!city) errors.push('地市');
            if (counties.length === 0) errors.push('旗县');
            const missingTeams = counties.filter(c => !countyTeams[c]);
            if (missingTeams.length > 0) errors.push('对应班组');
            if (businesses.length === 0) errors.push('管辖业务');
        }

        if (errors.length > 0) {
            alert(`请完善必填信息：${errors.join('、')}`);
            return;
        }
        
        const managerToSave = {
            ...newManagerForm,
            county: ['旗县级', '网格级'].includes(level) ? counties.join('、') : ''
        };
        
        if (editingManagerId) {
            // Update existing
            setManagerData((prev: any[]) => prev.map(m => m.id === editingManagerId ? { ...m, ...managerToSave } : m));
        } else {
            // Add new
            const newManager = {
                id: Date.now(),
                ...managerToSave
            };
            setManagerData((prev: any[]) => [newManager, ...prev]);
        }
        
        closeManagerModal();
    };

    const closeManagerModal = () => {
        setIsManagerModalOpen(false);
        setEditingManagerId(null);
        setNewManagerForm({
            name: '',
            phone: '',
            level: '',
            city: '',
            county: '',
            grid: '',
            company: ''
        });
    };

    // Filter & Sort Logic for Orders
    const filteredOrderData = useMemo(() => {
        let data = orderData.filter((item: any) => {
            const matchesKeyword = !orderFilters.keyword || item.name.includes(orderFilters.keyword) || item.groupOrderId.includes(orderFilters.keyword);
            const matchesStatus = !orderFilters.status || item.status === orderFilters.status;
            const matchesLevel = !orderFilters.level || item.level === orderFilters.level;
            const matchesImportant = !orderFilters.isImportant || String(item.isImportant) === orderFilters.isImportant;
            return matchesKeyword && matchesStatus && matchesLevel && matchesImportant;
        });

        return data.sort((a: any, b: any) => {
            if (a.isImportant !== b.isImportant) {
                return a.isImportant ? -1 : 1;
            }
            const timeA = new Date(a.receiptTime).getTime();
            const timeB = new Date(b.receiptTime).getTime();
            return timeB - timeA;
        });
    }, [orderFilters, orderData]);

    // Generate comprehensive task list from all orders based on focusStatus count
    const allGeneratedTasks = useMemo(() => {
        return orderData.flatMap((order: any) => {
            const parts = order.focusStatus.split('/');
            const completed = parseInt(parts[0]) || 0;
            const total = parseInt(parts[1]) || 1; 
            
            return Array.from({ length: total }).map((_, i) => {
                const isCompleted = i < completed;
                let status = isCompleted ? '已完成' : (order.status === '待受理' ? '待受理' : '处理中');
                if (!isCompleted && order.status === '已撤单') status = '已撤单';

                return {
                    id: `${order.id}_t${i}`,
                    taskId: `${order.groupOrderId}-${(i + 1).toString().padStart(2, '0')}`,
                    name: order.name,
                    groupOrderId: order.groupOrderId,
                    level: order.level,
                    status: status,
                    rate: isCompleted ? '100.00%' : '0.00%',
                    dispatchRatio: '0/1',
                    remaining: order.remainingTime,
                    deadline: order.deliveryDeadline,
                    finishTime: isCompleted ? '2026-02-12 10:00:00' : '',
                    op: (isCompleted || status === '已撤单') ? '查看' : '处理',
                    manager: order.manager
                };
            });
        });
    }, [orderData]);

    // Filter Logic for Tasks
    const filteredTaskData = useMemo(() => {
        let data = allGeneratedTasks;

        if (targetOrderId) {
            data = data.filter((t: any) => t.groupOrderId === targetOrderId);
        }

        data = data.filter((item: any) => {
            const matchesKeyword = !taskFilters.keyword || 
                item.name.includes(taskFilters.keyword) || 
                item.taskId.includes(taskFilters.keyword) ||
                (item.groupOrderId && item.groupOrderId.includes(taskFilters.keyword));
            const matchesStatus = !taskFilters.status || item.status === taskFilters.status;
            return matchesKeyword && matchesStatus;
        });
        
        return data;
    }, [allGeneratedTasks, taskFilters, targetOrderId]);

    // Filter Logic for Managers
    const filteredManagerData = useMemo(() => {
        return managerData.filter((m: any) => {
            const matchKeyword = !managerKeyword || 
                m.name.includes(managerKeyword) || 
                m.phone.includes(managerKeyword) || 
                (m.grid && m.grid.includes(managerKeyword)) ||
                (m.company && m.company.includes(managerKeyword));
            
            const matchLevel = !managerFilters.level || m.level === managerFilters.level;
            const matchCity = !managerFilters.city || m.city === managerFilters.city;
            const matchCounty = !managerFilters.county || m.county === managerFilters.county;

            return matchKeyword && matchLevel && matchCity && matchCounty;
        });
    }, [managerData, managerKeyword, managerFilters]);

    // Calculate Active Counts (excluding Completed and Cancelled)
    const activeOrderCount = useMemo(() => orderData.filter(o => o.status !== '已完成' && o.status !== '已撤单').length, [orderData]);
    const activeTaskCount = useMemo(() => allGeneratedTasks.filter(t => t.status !== '已完成' && t.status !== '已撤单').length, [allGeneratedTasks]);

    // Current active data based on TAB ID
    const currentData = activeTabId === 'order' ? filteredOrderData : activeTabId === 'task' ? filteredTaskData : filteredManagerData;
    
    const paginatedData = useMemo(() => {
        const start = (pagination.currentPage - 1) * pagination.pageSize;
        return currentData.slice(start, start + pagination.pageSize);
    }, [currentData, pagination]);

    const totalItems = currentData.length;
    const totalPages = Math.ceil(totalItems / pagination.pageSize);

    // Status Badge Helper
    const getStatusBadge = (status: string) => {
        switch (status) {
            case '处理中': return <span className="px-3 py-0.5 rounded text-xs bg-[#2563eb]/20 text-[#60a5fa] border border-[#2563eb]/40">处理中</span>;
            case '待受理': return <span className="px-3 py-0.5 rounded text-xs bg-[#eab308]/20 text-[#fde047] border border-[#eab308]/40">待受理</span>;
            case '已撤单': return <span className="px-3 py-0.5 rounded text-xs bg-[#ef4444]/20 text-[#fca5a5] border border-[#ef4444]/40">已撤单</span>;
            case '已完成': return <span className="px-3 py-0.5 rounded text-xs bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/40">已完成</span>;
            case '待回单': return <span className="px-3 py-0.5 rounded text-xs bg-[#8b5cf6]/20 text-[#a78bfa] border border-[#8b5cf6]/40">待回单</span>;
            default: return <span className="px-3 py-0.5 rounded text-xs text-gray-400">{status}</span>;
        }
    };

    const MenuItem = ({ id, label, icon, count, showCount = true }: { id: 'order' | 'task' | 'config', label: string, icon: React.ReactNode, count: number, showCount?: boolean }) => {
        const isActive = activeTabId === id;
        return (
            <div 
                onClick={() => {
                    handleSidebarClick(id as any);
                    setPagination({ ...pagination, currentPage: 1 });
                    if (id === 'order' || id === 'task') setTargetOrderId(null);
                }}
                className={`
                    relative flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 border-l-2
                    ${isActive 
                        ? 'border-neon-blue bg-gradient-to-r from-blue-600/30 to-transparent text-white' 
                        : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'}
                    ${isSidebarCollapsed ? 'justify-center px-2' : ''}
                `}
                title={isSidebarCollapsed ? (showCount ? `${label} (${count})` : label) : ''}
            >
                <div className={`w-6 h-6 flex items-center justify-center shrink-0 relative ${isActive ? 'text-neon-blue' : 'text-current'}`}>
                    {icon}
                    {isSidebarCollapsed && showCount && count > 0 && (
                        <div className="absolute -top-2 -right-2 min-w-[14px] h-[14px] px-0.5 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border border-[#0c2242] shadow-sm z-10">
                            {count > 99 ? '99+' : count}
                        </div>
                    )}
                </div>
                {!isSidebarCollapsed && (
                    <span className="text-sm font-medium tracking-wide whitespace-nowrap">
                        {label} {showCount && <span className="text-xs opacity-70 font-normal">({count})</span>}
                    </span>
                )}
            </div>
        );
    };

    // Tab Scrolling Logic
    const tabsContainerRef = React.useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const checkScroll = React.useCallback(() => {
        if (tabsContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
            // Use a small threshold (1px) for float precision issues
            const hasOverflow = scrollWidth > clientWidth;
            setShowLeftArrow(scrollLeft > 1);
            setShowRightArrow(hasOverflow && Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1);
        }
    }, []);

    // Use useLayoutEffect to ensure check runs immediately after DOM updates but before paint
    React.useLayoutEffect(() => {
        checkScroll();
        
        // Double check after a short delay to ensure layout is fully stable (e.g. fonts loaded)
        const timer = setTimeout(checkScroll, 100);

        // Observe container resize (handles window resize and sidebar toggle)
        const observer = new ResizeObserver(() => {
            checkScroll();
        });

        if (tabsContainerRef.current) {
            observer.observe(tabsContainerRef.current);
        }

        return () => {
            observer.disconnect();
            clearTimeout(timer);
        };
    }, [tabs, isSidebarCollapsed, checkScroll]);

    const scrollTabs = (direction: 'left' | 'right') => {
        if (tabsContainerRef.current) {
            const scrollAmount = 200;
            const newScrollLeft = direction === 'left' 
                ? tabsContainerRef.current.scrollLeft - scrollAmount 
                : tabsContainerRef.current.scrollLeft + scrollAmount;
            
            tabsContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
            // checkScroll will be called by onScroll event
        }
    };

    // Helper to get tab specific props
    const getActiveTabProps = () => {
        const tab = tabs.find(t => t.id === activeTabId);
        return tab;
    };

    const isLevelCity = ['地市级', '旗县级', '网格级'].includes(newManagerForm.level);
    const isLevelCounty = ['旗县级', '网格级'].includes(newManagerForm.level);
    const isLevelGrid = newManagerForm.level === '网格级';

    return (
        <div className="flex h-full w-full bg-transparent overflow-hidden relative">
            
            {/* Sidebar - Separated container */}
            <div className={`${isSidebarCollapsed ? 'w-[42px]' : 'w-[180px]'} bg-transparent border border-blue-500/30 mr-2 transition-all duration-300 ease-in-out flex flex-col shadow-[0_0_15px_rgba(0,0,0,0.3)]`}>
                {/* Header - Transparent Background */}
                <div className="h-[35px] flex items-center justify-between px-4 border-b border-blue-500/20 bg-transparent shrink-0">
                    {!isSidebarCollapsed && <span className="text-blue-100 font-bold tracking-wider text-[12px]">团单管理</span>}
                    <button 
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className={`text-blue-400 hover:text-white transition-colors ${isSidebarCollapsed ? 'mx-auto' : ''}`}
                    >
                        {isSidebarCollapsed ? <SidebarOpenIcon /> : <SidebarCloseIcon />}
                    </button>
                </div>
                <div className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                    <MenuItem id="order" label="团单信息管理" icon={<FolderIcon />} count={activeOrderCount} />
                    <MenuItem id="task" label="团单任务管理" icon={<ListIcon />} count={activeTaskCount} />
                    <MenuItem id="config" label="交付经理配置" icon={<UserIcon />} count={managerData.length} showCount={false} />
                </div>
            </div>

            {/* Main Content - Separated container with Tab Bar */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-transparent">
                
                {/* Tab Bar - Consistent with Complaint Support */}
                <div className="flex items-center h-[35px] bg-[#0c1a35]/20 shrink-0 border-none relative pr-4 w-full">
                    {/* Left Arrow */}
                    {showLeftArrow && (
                        <button 
                            onClick={() => scrollTabs('left')}
                            className="absolute left-0 z-20 h-full px-1 bg-[#0c1a35]/80 text-neon-blue hover:text-white hover:bg-blue-500/20 transition-colors border-r border-blue-500/30"
                        >
                            <ChevronLeftIcon />
                        </button>
                    )}

                    <div 
                        ref={tabsContainerRef}
                        onScroll={checkScroll}
                        className="flex-1 min-w-0 flex items-end gap-[6px] pl-0 h-full overflow-x-auto [&::-webkit-scrollbar]:hidden scroll-smooth" 
                        style={{ scrollbarWidth: 'none' }}
                    >
                        {tabs.map((tab) => {
                            const isActive = activeTabId === tab.id;
                            return (
                                <div 
                                    key={tab.id} 
                                    onClick={() => setActiveTabId(tab.id)}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        setContextMenu({ x: e.clientX, y: e.clientY, tabId: tab.id });
                                    }}
                                    className={`
                                        relative flex items-center justify-center h-full cursor-pointer transition-all duration-300 min-w-[120px] px-3 overflow-hidden group shrink-0
                                        ${isActive 
                                            ? 'z-10' 
                                            : 'border-b-transparent hover:bg-blue-500/5 opacity-80 hover:opacity-100 bg-transparent'}
                                    `}
                                >
                                    {/* Active Tab Indicators */}
                                    {isActive && (
                                        <>
                                            <div className="absolute inset-0 bg-gradient-to-b from-[#00d2ff]/10 to-transparent pointer-events-none" />
                                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-neon-blue shadow-[0_0_10px_#00d2ff] pointer-events-none" />
                                            <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-neon-blue via-neon-blue/50 to-transparent pointer-events-none" />
                                            <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-gradient-to-b from-neon-blue via-neon-blue/50 to-transparent pointer-events-none" />
                                        </>
                                    )}
                                    <span className={`relative z-10 text-sm font-medium tracking-wide whitespace-nowrap truncate max-w-[100px] ${isActive ? 'text-white font-bold' : 'text-gray-300'}`}>{tab.label}</span> 
                                    <button 
                                        onClick={(e) => handleCloseTab(e, tab.id)} 
                                        className={`relative z-10 ml-2 p-0.5 rounded-full hover:bg-blue-500/20 transition-colors flex items-center justify-center ${isActive ? 'opacity-100 text-white' : 'opacity-0 group-hover:opacity-100 text-gray-400'}`}
                                    > 
                                        <XIcon /> 
                                    </button> 
                                </div> 
                            );
                        })}
                    </div>

                    {/* Right Arrow */}
                    {showRightArrow && (
                        <button 
                            onClick={() => scrollTabs('right')}
                            className="absolute right-0 z-20 h-full px-1 bg-[#0c1a35]/80 text-neon-blue hover:text-white hover:bg-blue-500/20 transition-colors border-l border-blue-500/30"
                        >
                            <ChevronRightIcon />
                        </button>
                    )}
                </div>

                {/* Content Area - Now has the border */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden border border-blue-500/30 bg-[#0b1730]/20 relative">
                    {tabs.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-blue-300/50">
                            <div className="text-5xl mb-4">👈</div>
                            <div className="text-lg">请点击左侧菜单查看模块</div>
                        </div>
                    ) : activeTabId.startsWith('detail-') && detailRecords[activeTabId] ? (
                        // Render Detail View for Order Detail Tabs
                        <div className="h-full p-0">
                            <GroupOrderDetailView 
                                order={detailRecords[activeTabId]} 
                                onBack={() => handleCloseTab(null, activeTabId)}
                                initialTab={getActiveTabProps()?.initialTab}
                                triggerTimestamp={getActiveTabProps()?.triggerTimestamp}
                                onTabChange={(tab) => handleDetailTabChange(activeTabId, tab)}
                                onUpdateOrder={(updates) => handleUpdateOrder(activeTabId, updates)}
                            />
                        </div>
                    ) : activeTabId.startsWith('task-detail-') && taskDetailRecords[activeTabId] ? (
                        // Render Detail View for Task Detail Tabs
                        <div className="h-full p-0">
                            <GroupOrderTaskDetailView 
                                task={taskDetailRecords[activeTabId]} 
                                onBack={() => handleCloseTab(null, activeTabId)}
                                initialTab={getActiveTabProps()?.initialTab}
                                triggerTimestamp={getActiveTabProps()?.triggerTimestamp}
                                onTabChange={(tab) => handleDetailTabChange(activeTabId, tab)}
                            />
                        </div>
                    ) : (
                        // Render List View for Module Tabs
                        <>
                            {/* Filter Bar */}
                            <div className="p-4 border-b border-blue-500/20 flex flex-wrap items-center gap-4 text-sm shrink-0 bg-transparent">
                                {activeTabId === 'order' && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <label className="text-blue-200">关键字</label>
                                            <StyledInput 
                                                placeholder="请输入集团客户名称、团单标识" 
                                                className="w-64 bg-[#0b1730]/50" 
                                                value={orderFilters.keyword}
                                                onChange={(e) => setOrderFilters({...orderFilters, keyword: e.target.value})}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-blue-200">团单状态</label>
                                            <StyledSelect 
                                                className="w-32 bg-[#0b1730]/50" 
                                                value={orderFilters.status}
                                                onChange={(e) => setOrderFilters({...orderFilters, status: e.target.value})}
                                            >
                                                <option value="">请选择</option>
                                                <option value="待受理">待受理</option>
                                                <option value="处理中">处理中</option>
                                                <option value="已完成">已完成</option>
                                                <option value="待回单">待回单</option>
                                                <option value="已撤单">已撤单</option>
                                            </StyledSelect>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-blue-200">团单等级</label>
                                            <StyledSelect 
                                                className="w-32 bg-[#0b1730]/50"
                                                value={orderFilters.level}
                                                onChange={(e) => setOrderFilters({...orderFilters, level: e.target.value})}
                                            >
                                                <option value="">请选择</option>
                                                <option value="省级">省级</option>
                                                <option value="地市级">地市级</option>
                                                <option value="旗县级">旗县级</option>
                                                <option value="网格级">网格级</option>
                                            </StyledSelect>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-blue-200">是否收藏</label>
                                            <StyledSelect 
                                                className="w-32 bg-[#0b1730]/50"
                                                value={orderFilters.isImportant}
                                                onChange={(e) => setOrderFilters({...orderFilters, isImportant: e.target.value})}
                                            >
                                                <option value="">请选择</option>
                                                <option value="true">是</option>
                                                <option value="false">否</option>
                                            </StyledSelect>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-blue-200">网络侧收单时间</label>
                                            <StyledInput 
                                                type="date" 
                                                className="w-32 bg-[#0b1730]/50"
                                                value={orderFilters.startDate}
                                                onChange={(e) => setOrderFilters({...orderFilters, startDate: e.target.value})}
                                            />
                                            <span className="text-blue-400">至</span>
                                            <StyledInput 
                                                type="date" 
                                                className="w-32 bg-[#0b1730]/50" 
                                                value={orderFilters.endDate}
                                                onChange={(e) => setOrderFilters({...orderFilters, endDate: e.target.value})}
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <StyledButton variant="toolbar" onClick={() => {}} icon={<SearchIcon />}>查询</StyledButton>
                                            <StyledButton variant="toolbar" className="bg-[#1e3a5f] border-gray-600" onClick={() => setOrderFilters({ keyword: '', status: '', level: '', isImportant: '', startDate: '', endDate: '' })} icon={<RefreshCwIcon />}>重置</StyledButton>
                                        </div>
                                    </>
                                )} 
                                
                                {activeTabId === 'task' && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <label className="text-blue-200">关键字</label>
                                            <StyledInput 
                                                placeholder="请输入团单标识号/团单名称/任务标识号" 
                                                className="w-80 bg-[#0b1730]/50" 
                                                value={taskFilters.keyword}
                                                onChange={(e) => setTaskFilters({...taskFilters, keyword: e.target.value})}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-blue-200">任务状态</label>
                                            <StyledSelect 
                                                className="w-32 bg-[#0b1730]/50" 
                                                value={taskFilters.status}
                                                onChange={(e) => setTaskFilters({...taskFilters, status: e.target.value})}
                                            >
                                                <option value="">请选择</option>
                                                <option value="待受理">待受理</option>
                                                <option value="处理中">处理中</option>
                                                <option value="已完成">已完成</option>
                                                <option value="已撤单">已撤单</option>
                                            </StyledSelect>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-blue-200">派发时间</label>
                                            <StyledInput 
                                                type="date" 
                                                className="w-36 bg-[#0b1730]/50"
                                                value={taskFilters.startDate}
                                                onChange={(e) => setTaskFilters({...taskFilters, startDate: e.target.value})}
                                            />
                                            <span className="text-blue-400">至</span>
                                            <StyledInput 
                                                type="date" 
                                                className="w-36 bg-[#0b1730]/50" 
                                                value={taskFilters.endDate}
                                                onChange={(e) => setTaskFilters({...taskFilters, endDate: e.target.value})}
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 ml-auto">
                                            <StyledButton variant="toolbar" onClick={() => {}} icon={<SearchIcon />}>查询</StyledButton>
                                            <StyledButton variant="toolbar" className="bg-[#1e3a5f] border-gray-600" onClick={() => { setTaskFilters({ keyword: '', status: '', startDate: '', endDate: '' }); setTargetOrderId(null); }} icon={<RefreshCwIcon />}>重置</StyledButton>
                                        </div>
                                    </>
                                )}

                                {activeTabId === 'config' && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <label className="text-blue-200">交付经理级别</label>
                                            <StyledSelect 
                                                className="w-32 bg-[#0b1730]/50"
                                                value={managerFilters.level}
                                                onChange={(e) => setManagerFilters({...managerFilters, level: e.target.value})}
                                            >
                                                <option value="">请选择</option>
                                                <option value="省级">省级</option>
                                                <option value="地市级">地市级</option>
                                                <option value="旗县级">旗县级</option>
                                                <option value="网格级">网格级</option>
                                            </StyledSelect>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-blue-200">地市</label>
                                            <StyledSelect 
                                                className="w-32 bg-[#0b1730]/50"
                                                value={managerFilters.city}
                                                onChange={(e) => setManagerFilters({...managerFilters, city: e.target.value, county: ''})}
                                            >
                                                <option value="">请选择</option>
                                                {INNER_MONGOLIA_CITIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                                            </StyledSelect>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-blue-200">区县</label>
                                            <StyledSelect 
                                                className="w-32 bg-[#0b1730]/50"
                                                value={managerFilters.county}
                                                onChange={(e) => setManagerFilters({...managerFilters, county: e.target.value})}
                                                disabled={!managerFilters.city}
                                            >
                                                <option value="">请选择</option>
                                                {(managerFilters.city && CASCADING_COUNTIES[managerFilters.city] ? CASCADING_COUNTIES[managerFilters.city] : CASCADING_COUNTIES['default']).map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </StyledSelect>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-blue-200">关键字</label>
                                            <StyledInput 
                                                placeholder="请输入姓名/电话/网格名称/代维公司名称" 
                                                className="w-80 bg-[#0b1730]/50" 
                                                value={managerKeyword}
                                                onChange={(e) => setManagerKeyword(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 ml-4">
                                            <StyledButton variant="toolbar" onClick={() => {}} icon={<SearchIcon />}>查询</StyledButton>
                                            <StyledButton variant="toolbar" className="bg-[#1e3a5f] border-gray-600" onClick={() => { setManagerKeyword(''); setManagerFilters({ level: '', city: '', county: '' }); }} icon={<RefreshCwIcon />}>重置</StyledButton>
                                            
                                            <div className="ml-4 pl-4 border-l border-blue-500/30">
                                                <StyledButton variant="toolbar" className="bg-[#07596C] border-[#5FBADD]" icon={<PlusCircleIcon />} onClick={() => setIsManagerModalOpen(true)}>添加交付经理</StyledButton>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Table Area */}
                            <div className="flex-1 overflow-auto custom-scrollbar bg-transparent">
                                <table className="w-full text-left text-sm border-separate border-spacing-0">
                                    <thead className="sticky top-0 z-10 shadow-sm">
                                        {activeTabId === 'order' && (
                                            <tr>
                                                <Th className="w-10 text-center">重点</Th>
                                                <Th className="text-center">分派任务</Th>
                                                <Th className="text-center">未分派工单</Th>
                                                <Th>团单标识号</Th>
                                                <Th>团单名称</Th>
                                                <Th>团单等级</Th>
                                                <Th>交付经理</Th>
                                                <Th className="text-center">状态</Th>
                                                <Th className="text-center">竣工率</Th>
                                                <Th className="text-center">在途量/派单量</Th>
                                                <Th className="text-center">剩余时限</Th>
                                                <Th>网络侧收单时间</Th>
                                                <Th>交付时限</Th>
                                                <Th>完成时间</Th>
                                                <Th>回单时间</Th>
                                                <Th className="text-center sticky right-0 bg-[#0c2242] shadow-[-5px_0_10px_rgba(0,0,0,0.1)] border-l border-blue-500/20">操作</Th>
                                            </tr>
                                        )}
                                        {activeTabId === 'task' && (
                                            <tr>
                                                <Th>任务标识号</Th>
                                                <Th>团单标识号</Th>
                                                <Th>团单名称</Th>
                                                <Th>团单等级</Th>
                                                <Th className="text-center">任务状态</Th>
                                                <Th className="text-center">任务竣工率</Th>
                                                <Th className="text-center">在途量/任务派单量</Th>
                                                <Th className="text-center">任务剩余时限</Th>
                                                <Th>任务交付时限</Th>
                                                <Th>任务完成时间</Th>
                                                <Th className="text-center sticky right-0 bg-[#0c2242] shadow-[-5px_0_10px_rgba(0,0,0,0.1)] border-l border-blue-500/20">操作</Th>
                                            </tr>
                                        )}
                                        {activeTabId === 'config' && (
                                            <tr>
                                                <Th>交付经理级别</Th>
                                                <Th>管辖业务</Th>
                                                <Th>交付经理姓名</Th>
                                                <Th>交付经理电话</Th>
                                                <Th>地市</Th>
                                                <Th>旗县</Th>
                                                <Th>网格</Th>
                                                <Th>代维公司</Th>
                                                <Th className="text-center sticky right-0 bg-[#0c2242] shadow-[-5px_0_10px_rgba(0,0,0,0.1)] border-l border-blue-500/20">操作</Th>
                                            </tr>
                                        )}
                                    </thead>
                                    <tbody className="text-blue-100 text-sm">
                                        {activeTabId === 'config' ? (
                                            // Manager Table Body
                                            paginatedData.length > 0 ? paginatedData.map((row: any, idx) => {
                                                // Display Logic based on level
                                                const showCity = row.level === '地市级' || row.level === '旗县级' || row.level === '网格级';
                                                const showCounty = row.level === '旗县级' || row.level === '网格级';
                                                const showGrid = row.level === '网格级';
                                                const showCompany = row.level === '网格级';

                                                return (
                                                <tr key={row.id} className={`hover:bg-[#1e3a5f]/40 transition-colors border-b border-blue-500/10 whitespace-nowrap ${idx % 2 === 1 ? 'bg-[#0c2242]/30' : ''}`}>
                                                    <td className="p-3 border-b border-blue-500/10">{row.level}</td>
                                                    <td className="p-3 border-b border-blue-500/10 text-blue-300 text-xs">{row.businesses?.join('、') || '-'}</td>
                                                    <td className="p-3 border-b border-blue-500/10">{row.name}</td>
                                                    <td className="p-3 border-b border-blue-500/10 font-mono text-gray-300">{row.phone}</td>
                                                    <td className="p-3 border-b border-blue-500/10">{showCity ? row.city : '-'}</td>
                                                    <td className="p-3 border-b border-blue-500/10">{showCounty ? row.county : '-'}</td>
                                                    <td className="p-3 border-b border-blue-500/10">{showGrid ? row.grid : '-'}</td>
                                                    <td className="p-3 border-b border-blue-500/10">{showCompany ? row.company : '-'}</td>
                                                    <td className="p-3 text-center border-b border-blue-500/10 sticky right-0 bg-[#0b1730] shadow-[-5px_0_10px_rgba(0,0,0,0.1)] border-l border-blue-500/20">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button className="text-blue-400 hover:text-white p-1" title="编辑" onClick={() => handleEditManager(row)}><EditIcon /></button>
                                                            <button className="text-red-400 hover:text-red-300 p-1" title="删除" onClick={() => handleDeleteManager(row.id)}><TrashIcon /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}) : <tr><td colSpan={9} className="p-8 text-center text-gray-500 border-b border-blue-500/10">暂无经理数据</td></tr>
                                        ) : (
                                            // Order/Task Table Body
                                            paginatedData.length > 0 ? (
                                                paginatedData.map((row: any, idx) => (
                                                    <tr key={row.id} className={`hover:bg-[#1e3a5f]/40 transition-colors border-b border-blue-500/10 whitespace-nowrap ${idx % 2 === 1 ? 'bg-[#0c2242]/30' : ''} ${row.isImportant ? 'bg-yellow-500/5' : ''}`}>
                                                        {activeTabId === 'order' ? (
                                                            <>
                                                                <td className="p-3 text-center border-b border-blue-500/10">
                                                                    <div className="flex justify-center">
                                                                        <StarIcon 
                                                                            filled={row.isImportant} 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleToggleImportant(row.id);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </td>
                                                                <td className="p-3 text-center text-neon-blue font-mono border-b border-blue-500/10">
                                                                    {/* Clickable Assigned Tasks Cell */}
                                                                    <span 
                                                                        className="cursor-pointer hover:underline"
                                                                        onClick={() => handleDispatchClick(row)}
                                                                    >
                                                                        {row.focusStatus}
                                                                    </span>
                                                                </td>
                                                                <td className="p-3 text-center font-mono border-b border-blue-500/10">{row.unassignedTickets}</td>
                                                                <td className="p-3 font-mono text-gray-300 border-b border-blue-500/10">{row.groupOrderId}</td>
                                                                <td className="p-3 border-b border-blue-500/10">
                                                                    <span 
                                                                        className="text-neon-blue hover:underline block max-w-[200px] truncate cursor-pointer" 
                                                                        title={row.name}
                                                                        onClick={() => handleOpenOrderDetailLocal(row, 'info')}
                                                                    >
                                                                        {row.name}
                                                                    </span>
                                                                </td>
                                                                <td className="p-3 border-b border-blue-500/10 text-white">{row.level}</td>
                                                                <td className="p-3 border-b border-blue-500/10 text-white font-mono text-[11px]">{row.manager}</td>
                                                                <td className="p-3 text-center border-b border-blue-500/10">{getStatusBadge(row.status)}</td>
                                                                <td className="p-3 text-center font-mono border-b border-blue-500/10">{row.completionRate}</td>
                                                                <td className="p-3 text-center text-neon-blue font-mono border-b border-blue-500/10">{row.inflightDispatched}</td>
                                                                <td className="p-3 text-center font-mono border-b border-blue-500/10">{row.remainingTime}</td>
                                                                <td className="p-3 font-mono border-b border-blue-500/10 text-gray-300">{row.receiptTime}</td>
                                                                <td className="p-3 font-mono border-b border-blue-500/10 text-gray-300">{row.deliveryDeadline}</td>
                                                                <td className="p-3 font-mono border-b border-blue-500/10 text-gray-300">{row.completionTime}</td>
                                                                <td className="p-3 font-mono border-b border-blue-500/10 text-gray-300">{row.returnOrderTime || '-'}</td>
                                                                <td className="p-3 text-center border-b border-blue-500/10 sticky right-0 bg-[#0b1730] shadow-[-5px_0_10px_rgba(0,0,0,0.1)] border-l border-blue-500/20">
                                                                    {row.status === '已完成' || row.status === '已撤单' ? (
                                                                        <button 
                                                                            className="text-neon-blue hover:text-white hover:underline"
                                                                            onClick={() => handleOpenOrderDetailLocal(row, 'info')}
                                                                        >
                                                                            查看
                                                                        </button>
                                                                    ) : (
                                                                        <button 
                                                                            className="text-neon-blue hover:text-white hover:underline"
                                                                            onClick={() => handleOpenOrderDetailLocal(row, 'process')}
                                                                        >
                                                                            {row.status === '待受理' ? '受理' : '处理'}
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <td className="p-3 font-mono border-b border-blue-500/10">
                                                                    <span 
                                                                        className="text-neon-blue hover:underline cursor-pointer"
                                                                        onClick={() => handleOpenTaskDetailLocal(row, 'info')}
                                                                    >
                                                                        {row.taskId}
                                                                    </span>
                                                                </td>
                                                                <td className="p-3 font-mono text-gray-300 border-b border-blue-500/10">{row.groupOrderId}</td>
                                                                <td className="p-3 border-b border-blue-500/10">
                                                                    <span 
                                                                        className="text-neon-blue hover:underline block max-w-[300px] truncate cursor-pointer" 
                                                                        title={row.name}
                                                                        onClick={() => handleOpenRelatedOrder(row.groupOrderId)}
                                                                    >
                                                                        {row.name}
                                                                    </span>
                                                                </td>
                                                                <td className="p-3 border-b border-blue-500/10">{row.level}</td>
                                                                <td className="p-3 text-center border-b border-blue-500/10">{getStatusBadge(row.status)}</td>
                                                                <td className="p-3 text-center font-mono border-b border-blue-500/10">{row.rate}</td>
                                                                <td className="p-3 text-center font-mono border-b border-blue-500/10">{row.dispatchRatio}</td>
                                                                <td className="p-3 text-center font-mono border-b border-blue-500/10">{row.remaining}</td>
                                                                <td className="p-3 font-mono border-b border-blue-500/10">{row.deadline}</td>
                                                                <td className="p-3 font-mono border-b border-blue-500/10">{row.finishTime}</td>
                                                                <td className="p-3 text-center border-b border-blue-500/10 sticky right-0 bg-[#0b1730] shadow-[-5px_0_10px_rgba(0,0,0,0.1)] border-l border-blue-500/20">
                                                                    <button 
                                                                        className="text-neon-blue hover:text-white hover:underline"
                                                                        onClick={() => handleOpenTaskDetailLocal(row, row.op === '处理' ? 'process' : 'info')}
                                                                    >
                                                                        {row.op}
                                                                    </button>
                                                                </td>
                                                            </>
                                                        )}
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={14} className="p-8 text-center text-gray-500 border-b border-blue-500/10">暂无数据</td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer */}
                            <div className="h-[40px] bg-transparent border-t border-blue-500/20 flex items-center justify-between px-4 shrink-0 text-xs">
                                <div className="flex items-center gap-2">
                                    <button className="flex items-center gap-1 text-neon-blue border border-neon-blue/30 px-3 py-1 rounded hover:bg-neon-blue/10 transition-colors">
                                        <DownloadIcon /> <span className="ml-1">导出</span>
                                    </button>
                                    {activeTabId === 'config' && (
                                        <>
                                            <button onClick={handleImportClick} className="flex items-center gap-1 text-neon-blue border border-neon-blue/30 px-3 py-1 rounded hover:bg-neon-blue/10 transition-colors">
                                                <span className="ml-1">导入</span>
                                            </button>
                                            <button onClick={handleImportTemplate} className="flex items-center gap-1 text-neon-blue border border-neon-blue/30 px-3 py-1 rounded hover:bg-neon-blue/10 transition-colors">
                                                <span className="ml-1">导入模版</span>
                                            </button>
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                onChange={handleFileChange} 
                                                className="hidden" 
                                                accept=".xlsx, .xls" 
                                            />
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-blue-300">
                                    <span>共 {totalItems} 条</span>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            className="p-1 hover:text-white disabled:opacity-30" 
                                            disabled={pagination.currentPage === 1}
                                            onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                                        >
                                            <ChevronLeftIcon />
                                        </button>
                                        <span className="px-2 py-0.5 bg-blue-600 text-white rounded">{pagination.currentPage}</span>
                                        <span className="text-gray-500">/ {totalPages}</span>
                                        <button 
                                            className="p-1 hover:text-white disabled:opacity-30" 
                                            disabled={pagination.currentPage === totalPages}
                                            onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                                        >
                                            <ChevronRightIcon />
                                        </button>
                                    </div>
                                    <select 
                                        className="bg-[#0b1730] border border-blue-500/30 text-white px-2 py-0.5 rounded outline-none"
                                        value={pagination.pageSize}
                                        onChange={(e) => setPagination({ currentPage: 1, pageSize: Number(e.target.value) })}
                                    >
                                        <option value={15}>15条/页</option>
                                        <option value={30}>30条/页</option>
                                        <option value={50}>50条/页</option>
                                    </select>
                                </div>
                            </div>

                            {/* Modals Scoped to Config Tab */}
                            {activeTabId === 'config' && (
                                <>
                                    {/* Add/Edit Manager Modal */}
                                    {isManagerModalOpen && (
                                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                                            <div className="w-[530px] bg-[#0f172a] border border-blue-500/30 text-blue-100 font-sans shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col">
                                                <div className="flex items-center justify-between px-6 py-3 bg-[#0c2242] border-b border-blue-500/30">
                                                    <span className="text-base font-bold text-white tracking-wide">{editingManagerId ? '编辑交付经理' : '添加交付经理'}</span>
                                                    <button onClick={closeManagerModal} className="text-blue-400 hover:text-white transition-colors"><XIcon /></button>
                                                </div>
                                                <div className="p-6 space-y-4">
                                                    {/* Row 1: Name and Phone */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[12px] text-blue-300">交付经理姓名 <span className="text-red-500">*</span></label>
                                                            <StyledInput className="w-full" value={newManagerForm.name} onChange={(e) => setNewManagerForm({...newManagerForm, name: e.target.value})} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[12px] text-blue-300">交付经理电话 <span className="text-red-500">*</span></label>
                                                            <StyledInput className="w-full" value={newManagerForm.phone} onChange={(e) => setNewManagerForm({...newManagerForm, phone: e.target.value})} />
                                                        </div>
                                                    </div>

                                                    {/* Row 2: Level (Full Width) */}
                                                    <div className="space-y-1 w-full">
                                                        <label className="text-[12px] text-blue-300">交付经理级别 <span className="text-red-500">*</span></label>
                                                        <StyledSelect 
                                                            className="w-full" 
                                                            value={newManagerForm.level} 
                                                            onChange={(e) => {
                                                                const lvl = e.target.value;
                                                                setNewManagerForm(prev => ({
                                                                    ...prev, 
                                                                    level: lvl,
                                                                    city: ['省级'].includes(lvl) ? '' : prev.city,
                                                                    counties: ['省级', '地市级'].includes(lvl) ? [] : prev.counties,
                                                                    countyTeams: ['省级', '地市级'].includes(lvl) ? {} : prev.countyTeams,
                                                                    grid: lvl !== '网格级' ? '' : prev.grid,
                                                                    company: lvl !== '网格级' ? '' : prev.company
                                                                }));
                                                            }}
                                                        >
                                                            <option value="">请选择</option>
                                                            <option value="省级">省级</option>
                                                            <option value="地市级">地市级</option>
                                                            <option value="旗县级">旗县级</option>
                                                            <option value="网格级">网格级</option>
                                                        </StyledSelect>
                                                    </div>

                                                    {/* Row 3: Jurisdiction Business (Full Width) - Only for non-Provincial */}
                                                    {newManagerForm.level && newManagerForm.level !== '省级' && (
                                                        <div className="space-y-1 w-full animate-[fadeIn_0.3s_ease-out]">
                                                            <label className="text-[12px] text-blue-300">管辖业务 <span className="text-red-500">*</span></label>
                                                            <div className="flex items-center gap-6 h-[38px] px-2">
                                                                {['专线', '宽带', '终端'].map(biz => (
                                                                    <label key={biz} className="flex items-center gap-2 cursor-pointer group">
                                                                        <div className="relative flex items-center">
                                                                            <input 
                                                                                type="checkbox" 
                                                                                className="peer appearance-none w-4 h-4 border border-blue-500/50 rounded bg-[#0b1730]/50 checked:bg-neon-blue checked:border-neon-blue transition-all"
                                                                                checked={newManagerForm.businesses.includes(biz)}
                                                                                onChange={(e) => {
                                                                                    const newBusinesses = e.target.checked 
                                                                                        ? [...newManagerForm.businesses, biz]
                                                                                        : newManagerForm.businesses.filter(b => b !== biz);
                                                                                    setNewManagerForm({...newManagerForm, businesses: newBusinesses});
                                                                                }}
                                                                            />
                                                                            <svg className="absolute w-3 h-3 text-[#0b1730] pointer-events-none opacity-0 peer-checked:opacity-100 left-0.5 top-0.5 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                                                <polyline points="20 6 9 17 4 12"></polyline>
                                                                            </svg>
                                                                        </div>
                                                                        <span className="text-white text-sm group-hover:text-neon-blue transition-colors">{biz}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Conditional Rendering based on Level */}
                                                    {['地市级', '旗县级', '网格级'].includes(newManagerForm.level) && (
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-1">
                                                                <label className="text-[12px] text-blue-300">地市 <span className="text-red-500">*</span></label>
                                                                <StyledSelect className="w-full" value={newManagerForm.city} onChange={(e) => setNewManagerForm({...newManagerForm, city: e.target.value, counties: [], countyTeams: {}})}>
                                                                    <option value="">请选择</option>
                                                                    {INNER_MONGOLIA_CITIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                                                                </StyledSelect>
                                                            </div>
                                                            
                                                            {['旗县级', '网格级'].includes(newManagerForm.level) && (
                                                                <div className="space-y-1 relative">
                                                                    <label className="text-[12px] text-blue-300">旗县 <span className="text-red-500">*</span></label>
                                                                    <div 
                                                                        className={`flex items-center justify-between p-2 bg-[#0b1730]/50 border ${isCountyDropdownOpen ? 'border-neon-blue' : 'border-blue-500/30'} min-h-[38px] rounded-sm cursor-pointer ${!newManagerForm.city ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                        onClick={() => {
                                                                            if (newManagerForm.city) {
                                                                                setIsCountyDropdownOpen(!isCountyDropdownOpen);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {newManagerForm.counties.length > 0 ? (
                                                                                <span className="text-sm text-blue-100">{newManagerForm.counties.join('、')}</span>
                                                                            ) : (
                                                                                <span className="text-sm text-gray-500">请选择旗县</span>
                                                                            )}
                                                                        </div>
                                                                        <svg className={`w-4 h-4 text-blue-400 transition-transform ${isCountyDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                                    </div>
                                                                    
                                                                    {isCountyDropdownOpen && newManagerForm.city && (
                                                                        <div className="absolute z-10 w-full mt-1 bg-[#0f172a] border border-blue-500/30 rounded-sm shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
                                                                            <div className="p-2 flex flex-col gap-1">
                                                                                {(CASCADING_COUNTIES[newManagerForm.city] || CASCADING_COUNTIES['default']).map(c => (
                                                                                    <label key={c} className="flex items-center gap-2 p-1.5 hover:bg-[#1e3a5f]/50 rounded cursor-pointer group">
                                                                                        <input 
                                                                                            type="checkbox" 
                                                                                            className="accent-neon-blue w-3.5 h-3.5"
                                                                                            checked={newManagerForm.counties.includes(c)}
                                                                                            onChange={(e) => {
                                                                                                const newCounties = e.target.checked 
                                                                                                    ? [...newManagerForm.counties, c] 
                                                                                                    : newManagerForm.counties.filter(county => county !== c);
                                                                                                const newCountyTeams = { ...newManagerForm.countyTeams };
                                                                                                if (!e.target.checked) delete newCountyTeams[c];
                                                                                                setNewManagerForm({...newManagerForm, counties: newCounties, countyTeams: newCountyTeams});
                                                                                            }}
                                                                                        />
                                                                                        <span className={`text-sm ${newManagerForm.counties.includes(c) ? 'text-neon-blue font-medium' : 'text-blue-100 group-hover:text-blue-300'} transition-colors`}>{c}</span>
                                                                                    </label>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {newManagerForm.level === '网格级' && newManagerForm.counties.length > 0 && (
                                                        <div className="space-y-2 w-full animate-[fadeIn_0.3s_ease-out]">
                                                            <label className="text-[12px] text-blue-300">旗县对应班组 <span className="text-red-500">*</span></label>
                                                            <div className="grid grid-cols-2 gap-4 bg-[#0b1730]/30 p-4 border border-blue-500/20 rounded-sm">
                                                                {newManagerForm.counties.map(c => (
                                                                    <div key={c} className="space-y-1">
                                                                        <label className="text-[12px] text-blue-200">{c} 班组</label>
                                                                        <StyledSelect 
                                                                            className="w-full" 
                                                                            value={newManagerForm.countyTeams[c] || ''} 
                                                                            onChange={(e) => setNewManagerForm({
                                                                                ...newManagerForm, 
                                                                                countyTeams: { ...newManagerForm.countyTeams, [c]: e.target.value }
                                                                            })}
                                                                        >
                                                                            <option value="">请选择班组</option>
                                                                            <option value="铁通班组A">铁通班组A</option>
                                                                            <option value="铁通班组B">铁通班组B</option>
                                                                            <option value="分公司班组A">分公司班组A</option>
                                                                            <option value="分公司班组B">分公司班组B</option>
                                                                        </StyledSelect>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-end gap-3 px-6 py-3 bg-[#0c2242] border-t border-blue-500/30">
                                                    <StyledButton variant="secondary" onClick={closeManagerModal}>取消</StyledButton>
                                                    <StyledButton variant="primary" onClick={handleManagerSave}>保存</StyledButton>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Delete Confirmation Modal */}
                                    {deleteConfirmId && (
                                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                                            <div className="w-[300px] bg-[#0f172a] border border-blue-500/30 text-blue-100 font-sans shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-sm">
                                                <div className="p-6 text-center space-y-4">
                                                    <div className="text-red-400 mx-auto w-10 h-10 flex items-center justify-center rounded-full bg-red-500/10 border border-red-500/30">
                                                        <TrashIcon />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-white">确认删除?</h3>
                                                    <p className="text-xs text-blue-300">删除后该交付经理信息将无法恢复。</p>
                                                </div>
                                                <div className="flex items-center justify-center gap-3 p-4 border-t border-blue-500/20 bg-[#0c2242]/50">
                                                    <StyledButton variant="secondary" onClick={() => setDeleteConfirmId(null)}>取消</StyledButton>
                                                    <StyledButton variant="primary" className="bg-red-600 hover:bg-red-700 border-red-500" onClick={confirmDeleteManager}>确认删除</StyledButton>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
            
            {/* Context Menu for Tabs */}
            {contextMenu && (
                <div 
                    className="fixed z-[9999] bg-[#0A3458]/95 border border-blue-500/30 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md py-1 w-32 rounded-sm animate-[fadeIn_0.1s_ease-out]"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <div 
                        className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-xs text-blue-100 hover:text-white transition-colors" 
                        onClick={() => {
                            handleCloseTab(null, contextMenu.tabId);
                            setContextMenu(null);
                        }}
                    >
                        关闭当前标签
                    </div>
                    <div 
                        className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-xs text-blue-100 hover:text-white transition-colors" 
                        onClick={() => {
                            const tabToKeep = tabs.find(t => t.id === contextMenu.tabId);
                            if (tabToKeep) {
                                setTabs([tabToKeep]);
                                setActiveTabId(tabToKeep.id);
                                // Clean up records not in the kept tab
                                const newDetailRecords: Record<string, any> = {};
                                const newTaskDetailRecords: Record<string, any> = {};
                                if (tabToKeep.id.startsWith('detail-')) newDetailRecords[tabToKeep.id] = detailRecords[tabToKeep.id];
                                if (tabToKeep.id.startsWith('task-detail-')) newTaskDetailRecords[tabToKeep.id] = taskDetailRecords[tabToKeep.id];
                                setDetailRecords(newDetailRecords);
                                setTaskDetailRecords(newTaskDetailRecords);
                            }
                            setContextMenu(null);
                        }}
                    >
                        关闭其他标签
                    </div>
                    <div 
                        className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-xs text-blue-100 hover:text-white transition-colors" 
                        onClick={() => {
                            setTabs([]);
                            setActiveTabId('');
                            setDetailRecords({});
                            setTaskDetailRecords({});
                            setContextMenu(null);
                        }}
                    >
                        关闭所有标签
                    </div>
                </div>
            )}
        </div>
    );
};
