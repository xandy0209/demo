import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { OtnRecord, SpnRecord, InternetRecord, AlarmRecord, IplRecord, MplsRecord, IgplRecord, RouteCityRecord, RouteRecord, SubscriptionRecord, ComplaintRecord, FilterState, ChatMessage, ChatSession, GroupOrderRecord } from './types';
import { MOCK_DATA, MOCK_SPN_DATA, MOCK_INTERNET_DATA, MOCK_ALARM_DATA, MOCK_IPL_DATA, MOCK_MPLS_DATA, MOCK_IGPL_DATA, MOCK_ROUTE_CITY_DATA, MOCK_ROUTE_DATA, MOCK_SUBSCRIPTION_DATA, MOCK_COMPLAINT_DATA, INNER_MONGOLIA_CITIES } from './constants';
import { StyledInput, StyledButton, StyledSelect } from './components/UI';
import { Pagination } from './components/Pagination';
import { SearchIcon, DownloadIcon, XIcon, RefreshCwIcon, PlusCircleIcon, SendIcon, ClockIcon, CheckCircleIcon, SidebarCloseIcon, SidebarOpenIcon, FolderIcon, SettingsIcon, BarChartIcon, BellIcon, SparklesIcon, BotIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, UserIcon, ZoomInIcon, ZoomOutIcon } from './components/Icons';
import { ExportModal } from './components/ExportModal';
import { ComplaintModal } from './components/ComplaintModal';
import { ComplaintDetailView } from './components/ComplaintDetailView';
import { ComplaintCreateView } from './components/ComplaintCreateView';
import { ConfigCapabilitiesView } from './components/ConfigCapabilitiesView';
import { CustomerResponsePersonnelView } from './components/CustomerResponsePersonnelView';
import { ComplaintStatsView } from './components/ComplaintStatsView';
import { AIChatPanel } from './components/AIChatPanel';
import { WorkbenchView } from './components/WorkbenchView';
import { GroupOrderView, getInitialGroupOrderState, GroupOrderViewState } from './components/GroupOrderView';
import { GroupOrderDetailView } from './components/GroupOrderDetailView';
import { GroupOrderTaskDetailView } from './components/GroupOrderTaskDetailView';
import ImportantBusinessView from './components/ImportantBusinessView';
import { TerminalInventoryView } from './components/TerminalInventoryView';
import { FaultRuleManagementView } from './components/FaultRuleManagementView';
import { FaultEventMonitoringView } from './components/FaultEventMonitoringView';
import { FaultSMSConfigView } from './components/FaultSMSConfigView';
import { BusinessCustomerPortraitView } from './components/BusinessCustomerPortraitView';
import { DeliveryManagerPortraitView } from './components/DeliveryManagerPortraitView';
import { BusinessFinanceDataView } from './components/BusinessFinanceDataView';
import { CloudVideoFinanceDataView } from './components/CloudVideoFinanceDataView';
import { TrafficOverlimitAnalysisView } from './components/TrafficOverlimitAnalysisView';
import { BusinessOfflineTerminalView } from './components/BusinessOfflineTerminalView';
import { MinistryProvinceReportView } from './components/MinistryProvinceReportView';

const Th = ({ children, className = "", ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={`p-3 font-semibold border-b border-blue-500/40 whitespace-nowrap text-xs ${className}`} {...props}>
    {children}
  </th>
);

const Td = ({ children, className = "", ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={`p-3 border-b border-blue-500/10 text-white font-mono text-xs whitespace-nowrap ${className}`} {...props}>
    {children}
  </td>
);

// Tab types can now be extended strings
const TABS_CONFIG: { id: string; label: string }[] = [
  { id: 'workbench', label: '工作台' },
  { id: 'complaint', label: '投诉支撑' },
  { id: 'ai-chat', label: '智能助手' },
  { id: 'group-order', label: '团单管理' },
  { id: 'important-business', label: '重要业务管理' },
  { id: 'fault-management', label: '故障事件管理' },
  { id: 'terminal-inventory', label: '终端库存管理' },
  { id: 'business-customer-portrait', label: '商客装维画像' },
  { id: 'delivery-manager-portrait', label: '交付经理画像' },
  { id: 'business-finance-data', label: '千里眼业财数据' },
  { id: 'cloud-video-finance-data', label: '云视讯业财数据' },
  { id: 'traffic-overlimit-analysis', label: '业务流量超限分析' },
  { id: 'offline-terminal-analysis', label: '业务离线终端分析' },
  { id: 'ministry-province-report', label: '企宽部省上报管理' },
];

const MENU_ITEMS = [
  '5GToB(新)',
  '专线(新)',
  '云网(新)',
  '物联网(新)',
  '企宽(新)',
  '千里眼(新)',
  '云视讯(新)',
  '商客',
  '综合(新)',
  '系统管理(新)'
];

const BUSINESS_CATEGORIES = ['专线', '企宽'];
const BUSINESS_TYPES = ['数据专线', '互联网专线', '语音专线', 'MPLS-VPN专线', 'APN专线'];
const FAULT_TYPES_MAPPING: Record<string, string[]> = {
    '数据专线': ['光缆故障', '传输设备故障', '端口闪断', '其他'],
    '互联网专线': ['路由配置错误', 'DNS解析异常', '光缆故障', '其他'],
    '语音专线': ['语音网关故障', '线路杂音', '无法拨出', '其他'],
    'MPLS-VPN专线': ['VPN隧道中断', '路由不可达', '配置错误', '其他'],
    'APN专线': ['APN解析失败', '核心网侧故障', '无线侧信号弱', '其他']
};
const DEFAULT_FAULT_TYPES = ['光缆故障', '设备故障', '配置错误', '电力故障', '其他'];

interface ComplaintTabItem {
    id: string;
    label: string;
    type: 'pending' | 'todo' | 'done' | 'all' | 'detail' | 'create' | 'config' | 'stats' | 'personnel';
    record?: ComplaintRecord;
    targetTab?: 'basic' | 'flow' | 'process';
    triggerTimestamp?: number;
    initialData?: any;
}

interface SidebarItemDef {
    id: string;
    label: string;
    icon: React.ReactNode;
    count?: number;
    badgeColor?: string;
}

interface SidebarGroup {
    id: string;
    title: string;
    items: SidebarItemDef[];
}

const SIDEBAR_GROUPS: SidebarGroup[] = [
    {
        id: 'dispatch',
        title: '工单发起',
        items: [
            { id: 'new', label: '新增工单', icon: <PlusCircleIcon /> },
            { id: 'pendingDispatch', label: '故障派单(2)', icon: <SendIcon />, count: 2, badgeColor: 'bg-red-500' }
        ]
    },
    {
        id: 'processing',
        title: '工单处理',
        items: [
            { id: 'todo', label: '待办工单(10)', icon: <ClockIcon />, count: 10, badgeColor: 'bg-orange-500' },
            { id: 'done', label: '已办工单(28)', icon: <CheckCircleIcon /> }
        ]
    },
    {
        id: 'query',
        title: '综合查询',
        items: [
            { id: 'all', label: '全量工单(129)', icon: <FolderIcon /> },
            { id: 'stats', label: '统计分析', icon: <BarChartIcon /> }
        ]
    },
    {
        id: 'config',
        title: '配置管理',
        items: [
            { id: 'capabilities', label: '时限配置', icon: <SettingsIcon /> },
            { id: 'personnel', label: '客响人员管理', icon: <UserIcon /> }
        ]
    }
];

const FAULT_MANAGEMENT_SIDEBAR_GROUPS: SidebarGroup[] = [
    {
        id: 'fault-monitoring',
        title: '故障监控',
        items: [
            { id: 'fault-event-monitoring-sub', label: '故障事件监控', icon: <ClockIcon /> }
        ]
    },
    {
        id: 'fault-config',
        title: '配置管理',
        items: [
            { id: 'fault-rule-management-sub', label: '故障识别规则', icon: <SettingsIcon /> },
            { id: 'fault-sms-config-sub', label: '故障短信发送配置', icon: <SendIcon /> }
        ]
    }
];

const initialFilterState: FilterState = {
    productInstance: '',
    circuitCode: '',
    startDate: '',
    endDate: '',
    businessType: '',
    cityName: '',
    serviceLevel: '',
    customerName: '',
    customerCode: '',
    ticketNo: '',
    stage: '',
    keyword: '',
    ticketSource: '',
    faultType: '',
    businessCategory: '',
    productType: ''
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('complaint');
  const [visibleTabs, setVisibleTabs] = useState<string[]>(['complaint']);
  const [activeMenu, setActiveMenu] = useState('综合(新)'); 
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    const savedKey = localStorage.getItem('GEMINI_API_KEY');
    if (savedKey) {
        setApiKey(savedKey);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('GEMINI_API_KEY', key);
    // Clear existing chat sessions to force re-initialization with new key
    chatSessionRefs.current = {};
    setUIState({ isSettingsOpen: false });
  };

  // Data States
  const [otnData, setOtnData] = useState<OtnRecord[]>([]);
  const [filteredOtnData, setFilteredOtnData] = useState<OtnRecord[]>([]);
  
  const [spnData, setSpnData] = useState<SpnRecord[]>([]);
  const [filteredSpnData, setFilteredSpnData] = useState<SpnRecord[]>([]);

  const [internetData, setInternetData] = useState<InternetRecord[]>([]);
  const [filteredInternetData, setFilteredInternetData] = useState<InternetRecord[]>([]);

  const [alarmData, setAlarmData] = useState<AlarmRecord[]>([]);
  const [filteredAlarmData, setFilteredAlarmData] = useState<AlarmRecord[]>([]);

  const [iplData, setIplData] = useState<IplRecord[]>([]);
  const [filteredIplData, setFilteredIplData] = useState<IplRecord[]>([]);

  const [mplsData, setMplsData] = useState<MplsRecord[]>([]);
  const [filteredMplsData, setFilteredMplsData] = useState<MplsRecord[]>([]);

  const [igplData, setIgplData] = useState<IgplRecord[]>([]);
  const [filteredIgplData, setFilteredIgplData] = useState<IgplRecord[]>([]);

  const [routeCityData, setRouteCityData] = useState<RouteCityRecord[]>([]);
  const [filteredRouteCityData, setFilteredRouteCityData] = useState<RouteCityRecord[]>([]);

  const [routeData, setRouteData] = useState<RouteRecord[]>([]);
  const [filteredRouteData, setFilteredRouteData] = useState<RouteRecord[]>([]);

  const [subscriptionData, setSubscriptionData] = useState<SubscriptionRecord[]>([]);
  const [filteredSubscriptionData, setFilteredSubscriptionData] = useState<SubscriptionRecord[]>([]);

  const [complaintData, setComplaintData] = useState<ComplaintRecord[]>([]);
  const [filteredComplaintData, setFilteredComplaintData] = useState<ComplaintRecord[]>([]);

  const [complaintTabs, setComplaintTabs] = useState<ComplaintTabItem[]>([]);
  const [activeComplaintTabId, setActiveComplaintTabId] = useState<string | null>(null);

  const [tabFilters, setTabFilters] = useState<Record<string, FilterState>>({});

  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const [sessions, setSessions] = useState<ChatSession[]>([{
      id: 'default',
      title: '新会话 1',
      messages: [],
      createdAt: Date.now()
  }]);
  const [activeSessionId, setActiveSessionId] = useState('default');
  const chatSessionRefs = useRef<Record<string, Chat>>({});

  const [dropdownState, setDropdownState] = useState<{ isOpen: boolean, x: number, y: number, menu: string }>({ isOpen: false, x: 0, y: 0, menu: '' });
  const [subDropdownState, setSubDropdownState] = useState<{ isOpen: boolean, x: number, y: number, menu: string }>({ isOpen: false, x: 0, y: 0, menu: '' });
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, tabId: string } | null>(null);

  // GroupOrderView State - Lifted Up
  const [groupOrderViewState, setGroupOrderViewState] = useState<GroupOrderViewState>(getInitialGroupOrderState());
  
  // State for GroupOrderView active sub-tab persistence from Sidebar click
  const [groupOrderViewTab, setGroupOrderViewTab] = useState<'order' | 'task'>('order');

  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearDropdownTimer = () => {
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current);
      dropdownTimerRef.current = null;
    }
  };

  const startDropdownCloseTimer = () => {
    clearDropdownTimer();
    dropdownTimerRef.current = setTimeout(() => {
      setDropdownState(prev => ({ ...prev, isOpen: false }));
      setSubDropdownState(prev => ({ ...prev, isOpen: false }));
    }, 200);
  };

  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (menuRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = menuRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    const el = menuRef.current;
    if (el) {
        checkScroll();
        const observer = new ResizeObserver(() => {
            checkScroll();
        });
        observer.observe(el);
        
        el.addEventListener('scroll', checkScroll);
        window.addEventListener('resize', checkScroll);
        return () => {
            el.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
            observer.disconnect();
        };
    }
  }, []);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const scrollMenu = (direction: 'left' | 'right') => {
    if (menuRef.current) {
        const scrollAmount = 200;
        menuRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    }
  };

  const getChatInstance = (sessionId: string) => {
      if (!chatSessionRefs.current[sessionId]) {
           try {
               if (!apiKey) {
                   console.warn("API Key missing, utilizing Mock Chat Mode.");
                   const mockChat = {
                       sendMessageStream: async function* (params: { message: any }) {
                           const msg = typeof params.message === 'string' ? params.message : 'File/Image Input';
                           await new Promise(r => setTimeout(r, 600));
                           const responseParts = [
                               "【演示模式】\n",
                               "系统检测到未配置有效的 API_KEY，当前为您展示模拟回复。\n",
                               "--------------------------------\n",
                               `收到指令: “${JSON.stringify(msg).substring(0, 50)}...”\n`,
                               "--------------------------------\n",
                               "如需启用真实 AI 能力，请在部署环境或本地 .env 文件中配置 Google Gemini API Key。"
                           ];
                           for (const part of responseParts) {
                               yield { text: part } as GenerateContentResponse;
                               await new Promise(r => setTimeout(r, 100));
                           }
                       }
                   };
                   chatSessionRefs.current[sessionId] = mockChat as unknown as Chat;
                   return chatSessionRefs.current[sessionId];
               }

               const ai = new GoogleGenAI({ apiKey });
               chatSessionRefs.current[sessionId] = ai.chats.create({
                  model: 'gemini-3-flash-preview',
                  config: {
                    systemInstruction: `You are an expert AI assistant for the "China Mobile Enterprise Business Operations Support System" (26NM Project).
You help users query data, analyze alarms, manage tickets, and provide insights. Answer in Simplified Chinese.

**Business Context:**
- Region: Strictly Inner Mongolia (内蒙古).
- Cities: 呼和浩特 (Hohhot), 包头 (Baotou), 鄂尔多斯 (Ordos), 赤峰 (Chifeng), 通辽 (Tongliao), etc.
- Business Types: 专线 (Leased Line), 企宽 (Enterprise Broadband).

**Output Formatting Rules:**

1.  **Tables:** When presenting structured data (e.g., lists of tickets, metrics comparison, alarm logs), **ALWAYS** use standard Markdown tables.
    Example:
    | ID | Name | Status |
    |---|---|---|
    | 1 | Task A | Done |

2.  **Charts:** When presenting trend data, time-series, or numerical comparisons (e.g., traffic over time, alarm counts by type), **ALWAYS** output a JSON object wrapped in a code block with the language tag \`chart\`.
    The JSON structure must be:
    \`\`\`chart
    {
      "type": "line", // or "bar"
      "title": "Chart Title",
      "xAxis": ["Label1", "Label2", "Label3"],
      "series": [
        { "name": "Series 1", "data": [10, 20, 30] },
        { "name": "Series 2", "data": [15, 25, 35] }
      ]
    }
    \`\`\`
    Do not add extra text inside the code block.

3.  **Text:** Keep textual explanations concise and professional.
`,
                  },
               });
           } catch (error) {
               console.error("Failed to initialize AI Chat:", error);
               return null;
           }
      }
      return chatSessionRefs.current[sessionId];
  };

  const handleSendMessage = async (text: string, attachment?: { mimeType: string, data: string, fileName: string }) => {
    const currentSessionId = activeSessionId;
    setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
            const isDefaultTitle = s.title.startsWith('新会话');
            const newTitle = isDefaultTitle && s.messages.length === 0 
                ? (text.length > 10 ? text.substring(0, 10) + '...' : text) 
                : s.title;
            return { 
                ...s, 
                title: newTitle,
                messages: [...s.messages, { 
                    role: 'user', 
                    text,
                    attachment: attachment ? { fileName: attachment.fileName, mimeType: attachment.mimeType } : undefined 
                }] 
            };
        }
        return s;
    }));

    const chat = getChatInstance(currentSessionId);
    if (!chat) {
        setTimeout(() => {
            setSessions(prev => prev.map(s => {
                if (s.id === currentSessionId) {
                    return { ...s, messages: [...s.messages, { role: 'model', text: '系统错误：AI 服务初始化异常，请刷新重试。' }] };
                }
                return s;
            }));
        }, 600);
        return;
    }

    setIsChatLoading(true);
    try {
      setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
              return { ...s, messages: [...s.messages, { role: 'model', text: '' }] };
          }
          return s;
      }));
      let messagePayload: any = text;
      if (attachment) {
          messagePayload = [
              { inlineData: { mimeType: attachment.mimeType, data: attachment.data } },
              { text: text || `Please analyze this ${attachment.fileName} file.` }
          ];
      }
      // @ts-ignore
      const result = await chat.sendMessageStream({ message: messagePayload });
      let fullText = '';
      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          fullText += c.text;
          setSessions(prev => prev.map(s => {
              if (s.id === currentSessionId) {
                  const newMessages = [...s.messages];
                  const lastMsg = newMessages[newMessages.length - 1];
                  if (lastMsg.role === 'model') { lastMsg.text = fullText; }
                  return { ...s, messages: newMessages };
              }
              return s;
          }));
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
              const newMessages = [...s.messages];
              const lastMsg = newMessages[newMessages.length - 1];
              if (lastMsg.role === 'model' && !lastMsg.text) {
                   lastMsg.text = '抱歉，我遇到了一些问题，请稍后再试。(如果是文件分析，请确保文件格式受支持且大小在限制范围内)';
              }
              return { ...s, messages: newMessages };
          }
          return s;
      }));
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleNewSession = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
        id: newId,
        title: `新会话 ${sessions.length + 1}`,
        messages: [],
        createdAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    getChatInstance(newId);
  };

  const handleRenameSession = (id: string, newTitle: string) => {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
  };

  const handleDeleteSession = (id: string) => {
      const remainingSessions = sessions.filter(s => s.id !== id);
      if (remainingSessions.length === 0) {
          const newId = `session-${Date.now()}`;
          const newSession = {
              id: newId,
              title: '新会话 1',
              messages: [],
              createdAt: Date.now()
          };
          setSessions([newSession]);
          setActiveSessionId(newId);
          getChatInstance(newId);
      } else {
          setSessions(remainingSessions);
          if (activeSessionId === id) {
              setActiveSessionId(remainingSessions[0].id);
          }
      }
      if (chatSessionRefs.current[id]) {
          delete chatSessionRefs.current[id];
      }
  };

  const handleSelectSession = (id: string) => { setActiveSessionId(id); };
  
  const activeSessionMessages = useMemo(() => {
      const session = sessions.find(s => s.id === activeSessionId);
      return session ? session.messages : [];
  }, [sessions, activeSessionId]);

  const handleExpandChat = () => {
    setIsChatPanelOpen(false); 
    if (!visibleTabs.includes('ai-chat')) { setVisibleTabs(prev => [...prev, 'ai-chat']); }
    setActiveTab('ai-chat');
  };

  const getFilterKey = (tId?: string, cTabId?: string) => {
    const aTab = tId || activeTab;
    const acTabId = cTabId || activeComplaintTabId;
    return aTab === 'complaint' ? `complaint-${acTabId || 'default'}` : aTab;
  };
  const currentFilters = useMemo(() => tabFilters[getFilterKey()] || initialFilterState, [tabFilters, activeTab, activeComplaintTabId]);
  const setFilters = (newFilters: FilterState) => setTabFilters(prev => ({ ...prev, [getFilterKey()]: newFilters }));
  
  const [tabPagination, setTabPagination] = useState<Record<string, { currentPage: number, pageSize: number }>>({});
  const pagination = useMemo(() => tabPagination[getFilterKey()] || { currentPage: 1, pageSize: 15 }, [tabPagination, activeTab, activeComplaintTabId]);
  const setPagination = (newPagination: any) => {
      setTabPagination(prev => {
          const current = prev[getFilterKey()] || { currentPage: 1, pageSize: 15 };
          const updated = typeof newPagination === 'function' ? newPagination(current) : newPagination;
          return { ...prev, [getFilterKey()]: updated };
      });
  };

  const [tabUIStates, setTabUIStates] = useState<Record<string, any>>({});
  
  const getUIState = (tId?: string, cTabId?: string) => {
    const key = getFilterKey(tId, cTabId);
    return tabUIStates[key] || {
      isExportModalOpen: false,
      exportFilename: '',
      isComplaintModalOpen: false,
      complaintModalStage: 'T0',
      selectedComplaint: undefined,
      isSettingsOpen: false
    };
  };

  const setUIState = (updates: any, tId?: string, cTabId?: string) => {
    const key = getFilterKey(tId, cTabId);
    setTabUIStates(prev => ({
      ...prev,
      [key]: { ...(prev[key] || {
        isExportModalOpen: false,
        exportFilename: '',
        isComplaintModalOpen: false,
        complaintModalStage: 'T0',
        selectedComplaint: undefined,
        isSettingsOpen: false
      }), ...updates }
    }));
  };

  const [complaintSidebarCollapsed, setComplaintSidebarCollapsed] = useState(false);
  const [activeSidebarFolder, setActiveSidebarFolder] = useState<string>('');

  const [faultManagementTabs, setFaultManagementTabs] = useState<ComplaintTabItem[]>([]);
  const [activeFaultManagementTabId, setActiveFaultManagementTabId] = useState<string | null>(null);
  const [faultManagementSidebarCollapsed, setFaultManagementSidebarCollapsed] = useState(false);
  const [activeFaultSidebarFolder, setActiveFaultSidebarFolder] = useState<string>('');

  useEffect(() => {
    setOtnData(MOCK_DATA); setFilteredOtnData(MOCK_DATA);
    setSpnData(MOCK_SPN_DATA); setFilteredSpnData(MOCK_SPN_DATA);
    setInternetData(MOCK_INTERNET_DATA); setFilteredInternetData(MOCK_INTERNET_DATA);
    setAlarmData(MOCK_ALARM_DATA); setFilteredAlarmData(MOCK_ALARM_DATA);
    setIplData(MOCK_IPL_DATA); setFilteredIplData(MOCK_IPL_DATA);
    setMplsData(MOCK_MPLS_DATA); setFilteredMplsData(MOCK_MPLS_DATA);
    setIgplData(MOCK_IGPL_DATA); setFilteredIgplData(MOCK_IGPL_DATA);
    setRouteCityData(MOCK_ROUTE_CITY_DATA); setFilteredRouteCityData(MOCK_ROUTE_CITY_DATA);
    setRouteData(MOCK_ROUTE_DATA); setFilteredRouteData(MOCK_ROUTE_DATA);
    setSubscriptionData(MOCK_SUBSCRIPTION_DATA); setFilteredSubscriptionData(MOCK_SUBSCRIPTION_DATA);
    setComplaintData(MOCK_COMPLAINT_DATA); setFilteredComplaintData(MOCK_COMPLAINT_DATA);
    getChatInstance('default');
  }, []);

  const handleCloseTab = (e: React.MouseEvent | null, tabId: string) => {
      if (e) e.stopPropagation();
      const newTabs = visibleTabs.filter(id => id !== tabId);
      setVisibleTabs(newTabs);
      
      // Cleanup for Group Order tabs if needed, but since we persist state in App now, 
      // closing main tab doesn't necessarily mean clearing view state unless explicit.
      // Current behavior: State persists.

      if (activeTab === tabId && newTabs.length > 0) {
          const closedIndex = visibleTabs.indexOf(tabId);
          const nextIndex = Math.max(0, closedIndex - 1);
          setActiveTab(newTabs[nextIndex] || newTabs[0]);
      }
  };

  const handleRestoreTabs = () => { setVisibleTabs(['complaint']); setActiveTab('complaint'); };

  const handleOpenTab = (tabId: string) => {
      if (!visibleTabs.includes(tabId)) {
          setVisibleTabs(prev => [...prev, tabId]);
      }
      setActiveTab(tabId);
  };

  const handleSidebarClick = (key: string) => {
      if (activeTab === 'complaint') {
          setActiveSidebarFolder(key);
          if (key === 'new') {
              const tabId = 'new-ticket';
              if (!complaintTabs.find(t => t.id === tabId)) setComplaintTabs(prev => [...prev, { id: tabId, label: '新增工单', type: 'create' }]);
              setActiveComplaintTabId(tabId);
          } else if (key === 'capabilities') {
              const tabId = 'config-capabilities';
              if (!complaintTabs.find(t => t.id === tabId)) setComplaintTabs(prev => [...prev, { id: tabId, label: '时限配置', type: 'config' }]);
              setActiveComplaintTabId(tabId);
          } else if (key === 'personnel') {
              const tabId = 'config-personnel';
              if (!complaintTabs.find(t => t.id === tabId)) setComplaintTabs(prev => [...prev, { id: tabId, label: '客响人员管理', type: 'personnel' }]);
              setActiveComplaintTabId(tabId);
          } else if (key === 'stats') {
              const tabId = 'stats-analysis';
              if (!complaintTabs.find(t => t.id === tabId)) setComplaintTabs(prev => [...prev, { id: tabId, label: '统计分析', type: 'stats' }]);
              setActiveComplaintTabId(tabId);
          } else {
              const map: Record<string, {label: string, type: 'pending' | 'todo' | 'done' | 'all'}> = {
                  'pendingDispatch': { label: '故障派单', type: 'pending' },
                  'todo': { label: '待办工单', type: 'todo' },
                  'done': { label: '已办工单', type: 'done' },
                  'all': { label: '全量工单', type: 'all' }
              };
              const target = map[key];
              if (target) {
                  if (!complaintTabs.find(t => t.id === key)) setComplaintTabs(prev => [...prev, { id: key, label: target.label, type: target.type }]);
                  setActiveComplaintTabId(key);
              }
          }
      } else if (activeTab === 'fault-management') {
          setActiveFaultSidebarFolder(key);
          const map: Record<string, {label: string, type: any}> = {
              'fault-event-monitoring-sub': { label: '故障事件监控', type: 'all' },
              'fault-rule-management-sub': { label: '故障识别规则', type: 'config' },
              'fault-sms-config-sub': { label: '故障短信发送配置', type: 'personnel' }
          };
          const target = map[key];
          if (target) {
              if (!faultManagementTabs.find(t => t.id === key)) setFaultManagementTabs(prev => [...prev, { id: key, label: target.label, type: target.type }]);
              setActiveFaultManagementTabId(key);
          }
      }
  };

  const handleCloseComplaintTab = (e: React.MouseEvent | null, id: string) => {
      if (e) e.stopPropagation();
      if (activeTab === 'complaint') {
          const newTabs = complaintTabs.filter(t => t.id !== id);
          setComplaintTabs(newTabs);
          if (activeComplaintTabId === id) {
              if (newTabs.length > 0) {
                  const nextTab = newTabs[newTabs.length - 1];
                  setActiveComplaintTabId(nextTab.id);
                  if (nextTab.type === 'stats') setActiveSidebarFolder('stats');
                  else if (nextTab.type === 'config') setActiveSidebarFolder('capabilities');
                  else if (nextTab.type === 'personnel') setActiveSidebarFolder('personnel');
                  else if (nextTab.type === 'create') setActiveSidebarFolder('new');
                  else if (nextTab.type !== 'detail') setActiveSidebarFolder(nextTab.id);
                  else setActiveSidebarFolder('');
              } else {
                  setActiveComplaintTabId(null);
                  setActiveSidebarFolder('');
              }
          }
      } else if (activeTab === 'fault-management') {
          const newTabs = faultManagementTabs.filter(t => t.id !== id);
          setFaultManagementTabs(newTabs);
          if (activeFaultManagementTabId === id) {
              if (newTabs.length > 0) {
                  const nextTab = newTabs[newTabs.length - 1];
                  setActiveFaultManagementTabId(nextTab.id);
                  setActiveFaultSidebarFolder(nextTab.id);
              } else {
                  setActiveFaultManagementTabId(null);
                  setActiveFaultSidebarFolder('');
              }
          }
      }
  };

  const handleTicketClick = (record: ComplaintRecord) => {
      const tabId = `detail-${record.id}`;
      const todoStatuses = ['待下派', '待受理', '处理中', '待质检', 'T0', 'T1', 'T2'];
      const targetTab = todoStatuses.includes(record.stage) ? 'process' : 'basic';
      
      setComplaintTabs(prev => {
          const existing = prev.find(t => t.id === tabId);
          if (existing) {
              return prev.map(t => t.id === tabId ? { 
                  ...t, 
                  record,
                  targetTab, 
                  triggerTimestamp: Date.now() 
              } : t);
          }
          return [...prev, { 
              id: tabId, 
              label: `详情: ${record.ticketNo}`, 
              type: 'detail', 
              record: record, 
              targetTab, 
              triggerTimestamp: Date.now() 
          }];
      });
      setActiveComplaintTabId(tabId);
      setActiveSidebarFolder('');
  };

  const handleOperationClick = (record: ComplaintRecord, isViewOnly: boolean = false) => {
      const tabId = `detail-${record.id}`;
      const todoStatuses = ['待下派', '待受理', '处理中', '待质检', 'T0', 'T1', 'T2'];
      const shouldShowProcess = !isViewOnly && todoStatuses.includes(record.stage);
      const targetTab = shouldShowProcess ? 'process' : 'basic';
      
      setComplaintTabs(prev => {
          const existing = prev.find(t => t.id === tabId);
          if (existing) return prev.map(t => t.id === tabId ? { ...t, record, targetTab, triggerTimestamp: Date.now() } : t);
          return [...prev, { id: tabId, label: `详情: ${record.ticketNo}`, type: 'detail', record: record, targetTab, triggerTimestamp: Date.now() }];
      });
      setActiveComplaintTabId(tabId);
      setActiveSidebarFolder('');
  };

  const handleDispatchClick = (record: ComplaintRecord) => {
      const tabId = `dispatch-${record.id}`;
      if (!complaintTabs.find(t => t.id === tabId)) {
          setComplaintTabs(prev => [...prev, { 
              id: tabId, 
              label: '新增工单', 
              type: 'create', 
              initialData: { 
                  ...record, 
                  contactPerson: '', 
                  contactPhone: '', 
                  businessType: record.productType,
                  complaintContent: `由主动监控事件（${record.ticketNo}）触发`,
                  isContentReadOnly: true,
                  isFromFaultDispatch: true,
                  initialAttachments: record.faultSnapshot ? [{
                      id: 'snapshot-' + record.id,
                      name: '事件快照.png',
                      size: '124.5 KB',
                      url: record.faultSnapshot
                  }] : []
              } 
          }]);
      }
      setActiveComplaintTabId(tabId);
      setActiveSidebarFolder('new');
  };

  const handleDetailTabChange = (tabId: string, newTab: 'basic' | 'flow' | 'process') => {
      setComplaintTabs(prev => prev.map(t => 
          t.id === tabId ? { ...t, targetTab: newTab } : t
      ));
  };

  const handleSearch = () => {
    const f = currentFilters;
    const applyFilters = (item: any, isAlarm = false) => {
        let match = true;
        if (f.productInstance && !item.productInstance.toLowerCase().includes(f.productInstance.toLowerCase())) match = false;
        if (activeTab !== 'mpls' && activeTab !== 'subscription' && f.circuitCode && !item.circuitCode.toLowerCase().includes(f.circuitCode.toLowerCase())) match = false;
        
        if (activeTab !== 'igpl' && activeTab !== 'routeCity' && activeTab !== 'route' && activeTab !== 'subscription' && activeTab !== 'complaint' && activeTab !== 'ai-chat' && activeTab !== 'workbench' && activeTab !== 'group-order') {
            const timeField = isAlarm ? item.eventTime : item.metricTime;
            if (timeField) {
                if (f.startDate && new Date(timeField.replace(' ', 'T')).getTime() < new Date(f.startDate).getTime()) match = false;
                if (f.endDate && new Date(timeField.replace(' ', 'T')).getTime() > new Date(f.endDate).getTime()) match = false;
            }
        }
        
        if (isAlarm && f.businessType && item.businessType !== f.businessType) match = false;
        if (activeTab === 'routeCity' && f.cityName && !item.cityName.includes(f.cityName)) match = false;
        
        if (activeTab === 'subscription') {
            if (f.businessType && item.serviceType !== f.businessType) match = false;
            if (f.serviceLevel && item.serviceLevel !== f.serviceLevel) match = false;
            if (f.customerName && !item.customerName.toLowerCase().includes(f.customerName.toLowerCase())) match = false;
            if (f.customerCode && !item.customerCode.toLowerCase().includes(f.customerCode.toLowerCase())) match = false;
        }
        
        if (activeTab === 'complaint' && activeComplaintTabId) {
             const activeInternalTab = complaintTabs.find(t => t.id === activeComplaintTabId);
             
             if (f.keyword) {
                 const kw = f.keyword.toLowerCase();
                 const matchesKeyword = (item.ticketNo && item.ticketNo.toLowerCase().includes(kw)) || (item.customerName && item.customerName.toLowerCase().includes(kw)) || (item.customerCode && item.customerCode.toLowerCase().includes(kw)) || (item.circuitCode && item.circuitCode.toLowerCase().includes(kw)) || (item.productInstance && item.productInstance.toLowerCase().includes(kw));
                 if (!matchesKeyword) match = false;
             }
             
             if (f.assuranceLevel && item.aAssuranceLevel !== f.assuranceLevel && item.zAssuranceLevel !== f.assuranceLevel) match = false;
             
             if (activeInternalTab && activeInternalTab.type !== 'detail' && activeInternalTab.type !== 'create' && activeInternalTab.type !== 'config' && activeInternalTab.type !== 'stats' && activeInternalTab.type !== 'personnel') {
                 
                 if (activeInternalTab.type === 'pending') {
                     if (item.stage !== '待下派' && item.stage !== '待受理' && item.stage !== 'T0') match = false;
                     if (f.productType && item.productType !== f.productType) match = false;
                     if (f.faultType && item.faultType !== f.faultType) match = false;
                     if (f.eventTimeStart && new Date(item.complaintTime.replace(' ', 'T')).getTime() < new Date(f.eventTimeStart).getTime()) match = false;
                     if (f.eventTimeEnd && new Date(item.complaintTime.replace(' ', 'T')).getTime() > new Date(f.eventTimeEnd).getTime()) match = false;
                 }
                 else if (activeInternalTab.type === 'todo') {
                     if (!['待下派', '待受理', '处理中', '待质检', 'T0', 'T1', 'T2'].includes(item.stage)) match = false;
                     if (f.stage && item.stage !== f.stage) match = false;
                     if (f.businessCategory && item.businessCategory !== f.businessCategory) match = false;
                     if (f.productType && item.productType !== f.productType) match = false;
                 }
                 else if (activeInternalTab.type === 'done') {
                     if (f.stage && item.stage !== f.stage) match = false;
                     else if (!f.stage && item.stage !== '已归档' && item.stage !== 'Closed') match = false;
                     if (f.businessCategory && item.businessCategory !== f.businessCategory) match = false;
                     if (f.productType && item.productType !== f.productType) match = false;
                     if (f.startDate && new Date(item.complaintTime.replace(' ', 'T')).getTime() < new Date(f.startDate).getTime()) match = false;
                     if (f.endDate && new Date(item.complaintTime.replace(' ', 'T')).getTime() > new Date(f.endDate).getTime()) match = false;
                 }
                 else if (activeInternalTab.type === 'all') {
                     if (f.stage && item.stage !== f.stage) match = false;
                     if (f.startDate && new Date(item.complaintTime.replace(' ', 'T')).getTime() < new Date(f.startDate).getTime()) match = false;
                     if (f.endDate && new Date(item.complaintTime.replace(' ', 'T')).getTime() > new Date(f.endDate).getTime()) match = false;
                     if (f.ticketSource && item.ticketSource !== f.ticketSource) match = false;
                     if (f.faultType && item.faultType !== f.faultType) match = false;
                     if (f.businessCategory && item.businessCategory !== f.businessCategory) match = false;
                     if (f.productType && item.productType !== f.productType) match = false;
                 }
             }
        }
        return match;
    };

    if (activeTab === 'otn') setFilteredOtnData(otnData.filter(item => applyFilters(item)));
    else if (activeTab === 'spn') setFilteredSpnData(spnData.filter(item => applyFilters(item)));
    else if (activeTab === 'internet') setFilteredInternetData(internetData.filter(item => applyFilters(item)));
    else if (activeTab === 'ipl') setFilteredIplData(iplData.filter(item => applyFilters(item)));
    else if (activeTab === 'mpls') setFilteredMplsData(mplsData.filter(item => applyFilters(item)));
    else if (activeTab === 'igpl') setFilteredIgplData(igplData.filter(item => applyFilters(item)));
    else if (activeTab === 'routeCity') setFilteredRouteCityData(routeCityData.filter(item => applyFilters(item)));
    else if (activeTab === 'route') setFilteredRouteData(routeData.filter(item => applyFilters(item)));
    else if (activeTab === 'subscription') setFilteredSubscriptionData(subscriptionData.filter(item => applyFilters(item)));
    else if (activeTab === 'complaint') setFilteredComplaintData(complaintData.filter(item => applyFilters(item)));
    else if (activeTab === 'workbench') {} 
    else setFilteredAlarmData(alarmData.filter(item => applyFilters(item, true)));
    setPagination(prev => ({ ...prev, currentPage: 1 })); 
  };

  useEffect(() => { handleSearch(); }, [activeTab, activeComplaintTabId]);

  const currentFilteredData = useMemo(() => {
      switch(activeTab) {
          case 'otn': return filteredOtnData;
          case 'spn': return filteredSpnData;
          case 'internet': return filteredInternetData;
          case 'alarm': return filteredAlarmData;
          case 'ipl': return filteredIplData;
          case 'mpls': return filteredMplsData;
          case 'igpl': return filteredIgplData;
          case 'routeCity': return filteredRouteCityData;
          case 'route': return filteredRouteData;
          case 'subscription': return filteredSubscriptionData;
          case 'complaint': return filteredComplaintData;
          default: return [];
      }
  }, [activeTab, filteredOtnData, filteredSpnData, filteredInternetData, filteredAlarmData, filteredIplData, filteredMplsData, filteredIgplData, filteredRouteCityData, filteredRouteData, filteredSubscriptionData, filteredComplaintData]);

  const paginatedData = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return currentFilteredData.slice(start, end);
  }, [currentFilteredData, pagination]);

  const handleExportClick = () => {
    const now = new Date();
    const timestamp = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0') + now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0') + now.getSeconds().toString().padStart(2, '0');
    let prefix = 'OTN专线性能数据';
    if (activeTab === 'spn') prefix = 'SPN专线性能数据';
    if (activeTab === 'internet') prefix = '互联网专线性能数据';
    if (activeTab === 'alarm') prefix = '告警查询数据';
    if (activeTab === 'ipl') prefix = '国际政企专线时延数据';
    if (activeTab === 'mpls') prefix = 'MPLS-VPN专线性能数据';
    if (activeTab === 'igpl') prefix = '国际政企专线业务数据';
    if (activeTab === 'routeCity') prefix = '传输电路途径地市数据';
    if (activeTab === 'route') prefix = '传输电路路由数据';
    if (activeTab === 'subscription') prefix = '订购业务信息数据';
    if (activeTab === 'complaint') prefix = `投诉支撑_${activeComplaintTabId || 'all'}_数据`;
    
    setUIState({
        exportFilename: `${prefix}_${timestamp}.csv`,
        isExportModalOpen: true
    });
  };

  const handleExportConfirm = (filename: string) => { setUIState({ isExportModalOpen: false }); };
  const handleComplaintSubmit = () => { setUIState({ isComplaintModalOpen: false }); };
  
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((e) => { console.error(`Error attempting to enable full-screen mode: ${e.message} (${e.name})`); });
    } else { if (document.exitFullscreen) document.exitFullscreen(); }
  };

  const renderFaultManagementContent = () => {
    if (faultManagementTabs.length === 0) return null;

    return (
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {faultManagementTabs.map((tab) => {
          const isActive = activeFaultManagementTabId === tab.id;
          return (
            <div key={tab.id} className={`flex-1 flex flex-col h-full ${isActive ? '' : 'hidden'}`}>
              {tab.id === 'fault-event-monitoring-sub' ? <FaultEventMonitoringView /> : 
               tab.id === 'fault-rule-management-sub' ? <FaultRuleManagementView /> : 
               <FaultSMSConfigView />}
            </div>
          );
        })}
      </div>
    );
  };

  const renderStandardView = () => {
      // Logic for old dynamic tabs or standard modules
      return null; 
  };

  const renderComplaintContent = () => {
    if (complaintTabs.length === 0) return null;

    return (
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {complaintTabs.map((tab) => {
          const isActive = activeComplaintTabId === tab.id;
          return (
            <div key={tab.id} className={`flex-1 flex flex-col h-full ${isActive ? '' : 'hidden'}`}>
              {renderSingleComplaintTab(tab)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderSingleComplaintTab = (tab: ComplaintTabItem) => {
    const tabFilterKey = getFilterKey('complaint', tab.id);
    const currentFilters = tabFilters[tabFilterKey] || initialFilterState;
    const setFilters = (newFilters: FilterState) => setTabFilters(prev => ({ ...prev, [tabFilterKey]: newFilters }));
    
    const pagination = tabPagination[tabFilterKey] || { currentPage: 1, pageSize: 15 };
    const setPagination = (newPagination: any) => {
        setTabPagination(prev => {
            const current = prev[tabFilterKey] || { currentPage: 1, pageSize: 15 };
            const updated = typeof newPagination === 'function' ? newPagination(current) : newPagination;
            return { ...prev, [tabFilterKey]: updated };
        });
    };

    if (tab.type === 'create') return <ComplaintCreateView onCancel={() => handleCloseTab(null, tab.id)} onSubmit={() => { handleCloseComplaintTab(null, tab.id); handleSearch(); }} initialData={tab.initialData} />;
    if (tab.type === 'detail' && tab.record) return <ComplaintDetailView record={tab.record} targetTab={tab.targetTab} triggerTimestamp={tab.triggerTimestamp} onTabChange={(t) => handleDetailTabChange(tab.id, t)} />;
    if (tab.type === 'config') return <ConfigCapabilitiesView />;
    if (tab.type === 'personnel') return <CustomerResponsePersonnelView />;
    if (tab.type === 'stats') return <ComplaintStatsView />;

    const isPending = tab.type === 'pending';
    const isTodo = tab.type === 'todo';
    const isDone = tab.type === 'done';
    const isAll = tab.type === 'all';
    
    // ... (rest of renderComplaintContent logic stays the same)
    
    const pendingCols = [
        { label: '事件编号', key: 'ticketNo' },
        { label: '客户编码', key: 'customerCode' },
        { label: '客户名称', key: 'customerName' },
        { label: '产品实例', key: 'productInstance' },
        { label: '电路代号', key: 'circuitCode' },
        { label: '识别结果', key: 'faultType' },
        { label: '事件快照', key: 'faultSnapshot' },
        { label: '事件产生时间', key: 'complaintTime' },
        { label: '故障产生时间', key: 'faultTime' },
    ];
    
    const todoCols = [
        { label: '工单编号', key: 'ticketNo' },
        { label: '工单状态', key: 'stage' },
        { label: '派单时间', key: 'complaintTime' },
        { label: '处理时限', key: 'slaDeadline' },
        { label: '投诉内容', key: 'complaintContent' },
        { label: '业务分类', key: 'businessCategory' },
        { label: '业务类型', key: 'productType' }, 
        { label: '产品实例/宽带账号', key: 'productInstance' },
        { label: '保障等级', key: 'aAssuranceLevel' },
        { label: 'Z端保障等级', key: 'zAssuranceLevel' },
        { label: '客户名称', key: 'customerName' },
        { label: '客户编号', key: 'customerCode' },
    ];

    const doneCols = [
        { label: '工单编号', key: 'ticketNo' },
        { label: '工单状态', key: 'stage' },
        { label: '派单时间', key: 'complaintTime' },
        { label: '处理时限', key: 'slaDeadline' },
        { label: '投诉内容', key: 'complaintContent' },
        { label: '业务分类', key: 'businessCategory' },
        { label: '业务类型', key: 'productType' },
        { label: '产品实例/宽带账号', key: 'productInstance' },
        { label: '保障等级', key: 'aAssuranceLevel' },
        { label: 'Z端保障等级', key: 'zAssuranceLevel' },
        { label: '客户名称', key: 'customerName' },
        { label: '客户编号', key: 'customerCode' },
        { label: '故障恢复时间', key: 'finishTime' },
    ];

    const allCols = [
        { label: '工单编号', key: 'ticketNo' },
        { label: '工单状态', key: 'stage' },
        { label: '派单时间', key: 'complaintTime' },
        { label: '处理时限', key: 'slaDeadline' },
        { label: '投诉内容', key: 'complaintContent' },
        { label: '业务分类', key: 'businessCategory' },
        { label: '业务类型', key: 'productType' },
        { label: '产品实例/宽带账号', key: 'productInstance' },
        { label: '保障等级', key: 'aAssuranceLevel' },
        { label: 'Z端保障等级', key: 'zAssuranceLevel' },
        { label: '客户名称', key: 'customerName' },
        { label: '客户编号', key: 'customerCode' },
        { label: '故障恢复时间', key: 'finishTime' },
    ];

    const defaultCols = [
        { label: '工单编号', key: 'ticketNo' },
        { label: '工单状态', key: 'stage' },
        { label: '客户名称', key: 'customerName' },
        { label: '产品实例', key: 'productInstance' },
        { label: '电路代号', key: 'circuitCode' },
        { label: '故障时间', key: 'faultTime' },
        { label: 'SLA状态', key: 'slaStatus' },
        { label: '当前处理人', key: 'assignee' },
    ];

    const currentCols = isPending ? pendingCols : isTodo ? todoCols : isDone ? doneCols : isAll ? allCols : defaultCols;
    const currentPlaceholder = isPending ? "客户名称/客户编码/产品实例" : isTodo ? "工单编号/客户名称/客户编号/业务标识/电路代号" : isDone ? "工单编号/客户名称/客户编号/电路代号" : isAll ? "工单编号/客户名称/客户编号/业务标识/电路代号" : "工单号/客户/电路/关键字...";

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent border border-blue-500/30 shadow-[inset_0_0_20px_rgba(0,133,208,0.1)] relative">
            <ExportModal 
                isOpen={getUIState('complaint', tab.id).isExportModalOpen} 
                onClose={() => setUIState({ isExportModalOpen: false }, 'complaint', tab.id)} 
                onConfirm={handleExportConfirm} 
                defaultFilename={getUIState('complaint', tab.id).exportFilename} 
            />
            <ComplaintModal 
                isOpen={getUIState('complaint', tab.id).isComplaintModalOpen} 
                onClose={() => setUIState({ isComplaintModalOpen: false }, 'complaint', tab.id)} 
                onConfirm={handleComplaintSubmit} 
                initialData={getUIState('complaint', tab.id).selectedComplaint} 
                stage={getUIState('complaint', tab.id).complaintModalStage} 
            />
            {/* Filter bar code omitted for brevity as it is largely unchanged, just context */}
            <div className="bg-transparent p-3 border-b border-blue-500/20 flex flex-wrap items-center gap-3 shrink-0">
                <StyledInput 
                    placeholder={currentPlaceholder} 
                    className="w-80" 
                    value={currentFilters.keyword || ''} 
                    onChange={(e) => setFilters({...currentFilters, keyword: e.target.value})} 
                />
                
                {isTodo && (
                    <div className="flex items-center gap-2">
                        <span className="text-[14px] text-blue-300 whitespace-nowrap">工单状态:</span>
                        <StyledSelect 
                            className="w-32" 
                            value={currentFilters.stage || ''} 
                            onChange={(e) => setFilters({...currentFilters, stage: e.target.value})}
                        >
                            <option value="">全部状态</option>
                            <option value="待下派">待下派</option>
                            <option value="待受理">待受理</option>
                            <option value="处理中">处理中</option>
                            <option value="待质检">待质检</option>
                        </StyledSelect>
                    </div>
                )}

                {/* --- Added Filters Logic --- */}
                
                {!isPending && (
                    <div className="flex items-center gap-2">
                        <span className="text-[14px] text-blue-300 whitespace-nowrap">保障等级:</span>
                        <StyledSelect
                            className="w-32"
                            value={currentFilters.assuranceLevel || ''}
                            onChange={(e) => setFilters({...currentFilters, assuranceLevel: e.target.value})}
                        >
                            <option value="">全部</option>
                            <option value="AAA">AAA</option>
                            <option value="AA">AA</option>
                            <option value="A">A</option>
                            <option value="普通">普通</option>
                        </StyledSelect>
                    </div>
                )}

                {/* 1. Pending: Recognition Result, Event Time */}
                {isPending && (
                    <>
                        <div className="flex items-center gap-2">
                            <span className="text-[14px] text-blue-300 whitespace-nowrap">识别结果:</span>
                            <StyledSelect
                                className="w-32"
                                value={currentFilters.faultType || ''}
                                onChange={(e) => setFilters({...currentFilters, faultType: e.target.value})}
                            >
                                <option value="">全部</option>
                                <option value="业务中断">业务中断</option>
                                <option value="保护降级">保护降级</option>
                            </StyledSelect>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[14px] text-blue-300 whitespace-nowrap">事件产生时间:</span>
                            <StyledInput
                                type="datetime-local"
                                className="w-48"
                                value={currentFilters.eventTimeStart || ''}
                                onChange={(e) => setFilters({...currentFilters, eventTimeStart: e.target.value})}
                            />
                            <span className="text-blue-400">-</span>
                            <StyledInput
                                type="datetime-local"
                                className="w-48"
                                value={currentFilters.eventTimeEnd || ''}
                                onChange={(e) => setFilters({...currentFilters, eventTimeEnd: e.target.value})}
                            />
                        </div>
                    </>
                )}

                {/* Shared Logic for Todo, Done, All: Category & Conditional Type */}
                {(isTodo || isDone || isAll) && (
                    <>
                        {isAll && (
                            <div className="flex items-center gap-2">
                                <span className="text-[14px] text-blue-300 whitespace-nowrap">工单状态:</span>
                                <StyledSelect 
                                    className="w-32" 
                                    value={currentFilters.stage || ''} 
                                    onChange={(e) => setFilters({...currentFilters, stage: e.target.value})}
                                >
                                    <option value="">全部状态</option>
                                    <option value="待下派">待下派</option>
                                    <option value="待受理">待受理</option>
                                    <option value="处理中">处理中</option>
                                    <option value="待质检">待质检</option>
                                    <option value="已归档">已归档</option>
                                </StyledSelect>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="text-[14px] text-blue-300 whitespace-nowrap">业务分类:</span>
                            <StyledSelect
                                className="w-32"
                                value={currentFilters.businessCategory || ''}
                                onChange={(e) => setFilters({...currentFilters, businessCategory: e.target.value, productType: ''})}
                            >
                                <option value="">全部</option>
                                {BUSINESS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </StyledSelect>
                        </div>
                        {currentFilters.businessCategory === '专线' && (
                            <div className="flex items-center gap-2">
                                <span className="text-[14px] text-blue-300 whitespace-nowrap">业务类型:</span>
                                <StyledSelect
                                    className="w-32"
                                    value={currentFilters.productType || ''}
                                    onChange={(e) => setFilters({...currentFilters, productType: e.target.value})}
                                >
                                    <option value="">全部</option>
                                    {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </StyledSelect>
                            </div>
                        )}
                    </>
                )}

                {/* 4. All: Dispatch Time Range */}
                {isAll && (
                    <div className="flex items-center gap-2">
                    <span className="text-[14px] text-blue-300 whitespace-nowrap">派单时间:</span>
                        <StyledInput
                            type="date"
                            className="w-32"
                            value={currentFilters.startDate || ''}
                            onChange={(e) => setFilters({...currentFilters, startDate: e.target.value})}
                        />
                        <span className="text-blue-400">-</span>
                        <StyledInput
                            type="date"
                            className="w-32"
                            value={currentFilters.endDate || ''}
                            onChange={(e) => setFilters({...currentFilters, endDate: e.target.value})}
                        />
                    </div>
                )}

                {/* ... Selects based on type ... */}
                <div className="flex items-center gap-3">
                    <StyledButton variant="toolbar" onClick={handleSearch} icon={<SearchIcon />} className="whitespace-nowrap">查询</StyledButton>
                    <StyledButton variant="secondary" onClick={() => { setFilters(initialFilterState); handleSearch(); }} className="whitespace-nowrap" icon={<RefreshCwIcon />}>重置</StyledButton>
                </div>
            </div>
            
            <div className="flex-1 overflow-auto bg-transparent scrollbar-thin">
                <table className="w-full text-left text-sm whitespace-nowrap border-separate border-spacing-0">
                    <thead className="sticky top-0 bg-[#0c2242] text-white z-10 shadow-sm">
                        <tr>
                            {currentCols.map(col => <Th key={col.key}>{col.label}</Th>)}
                            <Th className="text-center bg-[#0c2242] sticky right-0 z-20 shadow-[-5px_0_10px_rgba(0,0,0,0.1)] border-l border-blue-500/20">操作</Th>
                        </tr>
                    </thead>
                    <tbody className="text-white">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((item) => {
                                const record = item as ComplaintRecord;
                                return (
                                <tr key={record.id} className="hover:bg-blue-600/10 transition-colors border-b border-blue-500/10 last:border-0 group">
                                    {isPending ? (
                                        <>
                                                <td className="p-3 font-mono text-white border-b border-blue-500/10">{record.ticketNo}</td>
                                                <td className="p-3 font-mono text-gray-300 border-b border-blue-500/10">{record.customerCode}</td>
                                                <td className="p-3 border-b border-blue-500/10">{record.customerName}</td>
                                                <td className="p-3 font-mono text-blue-300 border-b border-blue-500/10">{record.productInstance}</td>
                                                <td className="p-3 font-mono text-blue-300 border-b border-blue-500/10">{record.circuitCode}</td>
                                                <td className="p-3 border-b border-blue-500/10">{record.faultType || '-'}</td>
                                                <td className="p-3 border-b border-blue-500/10 text-center">
                                                    <button 
                                                        className="text-neon-blue hover:text-blue-300 transition-colors text-xs underline underline-offset-2"
                                                        onClick={() => setPreviewImage(record.faultSnapshot || '未知快照')}
                                                    >
                                                        查看快照
                                                    </button>
                                                </td>
                                                <td className="p-3 font-mono text-blue-300 border-b border-blue-500/10">{record.complaintTime}</td>
                                                <td className="p-3 font-mono text-blue-300 border-b border-blue-500/10">{record.faultTime}</td>
                                        </>
                                    ) : isTodo ? (
                                        <>
                                            <td className="p-3 font-mono text-neon-blue border-b border-blue-500/10">{record.ticketNo}</td>
                                            <td className="p-3 border-b border-blue-500/10">
                                                <span className={`px-2 py-0.5 rounded-sm text-[10px] border ${
                                                    record.stage === '处理中' || record.stage === 'T1' ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' :
                                                    record.stage === '待受理' || record.stage === 'T0' || record.stage === '待下派' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' :
                                                    'bg-green-500/20 border-green-500/40 text-green-300'
                                                }`}>
                                                    {record.stage}
                                                </span>
                                            </td>
                                            <td className="p-3 font-mono text-gray-300 border-b border-blue-500/10">{record.complaintTime}</td>
                                            <td className="p-3 font-mono text-white border-b border-blue-500/10">{record.slaDeadline}</td>
                                            <td className="p-3 max-w-[150px] truncate border-b border-blue-500/10" title={record.complaintContent}>{record.complaintContent}</td>
                                            <td className="p-3 border-b border-blue-500/10">{record.businessCategory}</td>
                                            <td className="p-3 border-b border-blue-500/10">{record.productType}</td>
                                            <td className="p-3 font-mono border-b border-blue-500/10">{record.productInstance}</td>
                                            <td className="p-3 border-b border-blue-500/10">{record.aAssuranceLevel || '-'}</td>
                                            <td className="p-3 border-b border-blue-500/10">{record.zAssuranceLevel || '-'}</td>
                                            <td className="p-3 border-b border-blue-500/10">{record.customerName}</td>
                                            <td className="p-3 text-gray-300 border-b border-blue-500/10">{record.customerCode}</td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="p-3 font-mono text-neon-blue border-b border-blue-500/10">{record.ticketNo}</td>
                                            <td className="p-3 border-b border-blue-500/10">{record.stage}</td>
                                            <td className="p-3 font-mono text-gray-300 border-b border-blue-500/10">{record.complaintTime}</td>
                                            <td className="p-3 font-mono text-gray-300 border-b border-blue-500/10">{record.slaDeadline}</td>
                                            <td className="p-3 max-w-[150px] truncate border-b border-blue-500/10" title={record.complaintContent}>{record.complaintContent}</td>
                                            <td className="p-3 border-b border-blue-500/10">{record.businessCategory}</td>
                                            <td className="p-3 border-b border-blue-500/10">
                                                {isDone && record.businessCategory !== '专线' ? '' : record.productType}
                                            </td>
                                            <td className="p-3 font-mono border-b border-blue-500/10">{record.productInstance}</td>
                                            <td className="p-3 border-b border-blue-500/10">{record.aAssuranceLevel || '-'}</td>
                                            <td className="p-3 border-b border-blue-500/10">{record.zAssuranceLevel || '-'}</td>
                                            <td className="p-3 border-b border-blue-500/10">{record.customerName}</td>
                                            <td className="p-3 text-gray-300 border-b border-blue-500/10">{record.customerCode}</td>
                                            { (isDone || isAll) && <td className="p-3 font-mono text-gray-400 border-b border-blue-500/10">2026-01-11 11:30:00</td> }
                                        </>
                                    )}
                                    <td className="p-3 text-center sticky right-0 shadow-[-5px_0_10px_rgba(0,0,0,0.1)] bg-[#0b1730] border-b border-blue-500/10 border-l border-blue-500/20">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={(e) => { 
                                                e.stopPropagation(); 
                                                if (isPending) {
                                                    handleDispatchClick(record);
                                                } else if (isTodo) {
                                                    handleOperationClick(record, false); 
                                                } else {
                                                    handleOperationClick(record, true); 
                                                }
                                            }} className="text-xs px-2 py-0.5 bg-blue-600/20 border border-blue-500/50 hover:bg-blue-600/50 text-blue-300 rounded">
                                                {isPending ? '派单' : 
                                                 isTodo ? (
                                                     record.stage === '待下派' ? '下派' :
                                                     record.stage === '待受理' || record.stage === 'T0' ? '受理' :
                                                     record.stage === '处理中' || record.stage === 'T1' ? '处理' :
                                                     record.stage === '待质检' || record.stage === 'T2' ? '质检' : '查看'
                                                 ) : '查看'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )})
                        ) : ( <tr><td colSpan={currentCols.length + 1} className="p-8 text-center text-blue-300/50 border-b border-blue-500/10">暂无数据</td></tr> )}
                    </tbody>
                </table>
            </div>
            
            <div className="bg-[#1e293b]/50 h-[40px] shrink-0 border-t border-blue-500/20 flex items-center px-4 gap-4">
                <StyledButton variant="toolbar" onClick={handleExportClick} icon={<DownloadIcon />} className="whitespace-nowrap h-8">导出</StyledButton>
                <Pagination 
                    currentPage={pagination.currentPage} 
                    pageSize={pagination.pageSize} 
                    totalItems={currentFilteredData.length} 
                    onPageChange={(p) => setPagination({...pagination, currentPage: p})} 
                    onPageSizeChange={(s) => setPagination({...pagination, pageSize: s, currentPage: 1})}
                    className="py-0 w-full"
                />
            </div>

            {previewImage && (
                <div className="absolute inset-0 z-[9999] flex items-center justify-center bg-[#020617]/80 backdrop-blur-sm" onClick={() => { setPreviewImage(null); setZoom(1); }}>
                    <div className="bg-[#0b1730] border border-blue-500/40 shadow-[0_0_50px_rgba(0,133,208,0.3)] flex flex-col max-w-[90vw] max-h-[70vh] relative overflow-hidden w-[800px]" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex justify-between items-center p-3 border-b border-blue-500/20 bg-[#0c2242]/50 shrink-0">
                            <h3 className="text-sm font-bold text-blue-100 flex items-center gap-2">
                                <SearchIcon className="w-4 h-4 text-blue-400" />
                                故障快照查看
                            </h3>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setZoom(prev => Math.min(prev + 0.2, 3))}
                                    className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors"
                                    title="放大"
                                >
                                    <ZoomInIcon className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}
                                    className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors"
                                    title="缩小"
                                >
                                    <ZoomOutIcon className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => setZoom(1)}
                                    className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors"
                                    title="重置"
                                >
                                    <RefreshCwIcon className="w-5 h-5" />
                                </button>
                                <div className="w-px h-4 bg-blue-500/20 mx-1"></div>
                                <button 
                                    onClick={() => { setPreviewImage(null); setZoom(1); }} 
                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                                >
                                    <XIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        
                        {/* Image Content */}
                        <div className="flex-1 overflow-auto bg-black/20 flex items-center justify-center p-4 scrollbar-thin">
                            <div 
                                className="transition-transform duration-200 ease-out flex items-center justify-center"
                                style={{ transform: `scale(${zoom})` }}
                            >
                                <img 
                                    src={previewImage} 
                                    alt="Fault Snapshot" 
                                    className="max-w-full max-h-full object-contain shadow-2xl"
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                        </div>
                        
                        {/* Zoom Indicator */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 border border-blue-500/30 rounded-full text-[10px] text-blue-300 pointer-events-none z-20">
                            {isNaN(zoom) ? 100 : Math.round(zoom * 100)}%
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans text-blue-100 selection:bg-neon-blue selection:text-white" style={{ backgroundImage: `url('https://tvbox-67o.pages.dev/bj.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundColor: '#020617' }}>
      <div className="relative z-10 flex flex-col h-full overflow-hidden max-w-[1920px] mx-auto">
        <nav className="h-[60px] bg-[#0b1730]/20 backdrop-blur-md border-b border-blue-400/30 brightness-125 shadow-[0_0_15px_rgba(0,210,255,0.2)] flex items-center justify-between px-6 shrink-0 z-50" style={{ backgroundImage: `url('https://tvbox-67o.pages.dev/topbj.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
           <div className="flex items-center gap-3 shrink-0"><img src="https://tvbox-67o.pages.dev/logo.png" alt="logo" className="max-h-[50px] w-auto -ml-[20px]" /></div>
           <div className="flex-1 flex items-center justify-center h-full overflow-hidden mx-4 min-w-0 relative">
                {showLeftArrow && ( <button onClick={() => scrollMenu('left')} className="h-full px-2 text-blue-400/50 hover:text-white transition-colors flex items-center justify-center cursor-pointer shrink-0 z-20"><ChevronLeftIcon /></button> )}
                <div ref={menuRef} className="flex-1 flex items-center gap-1 h-full overflow-x-auto no-scrollbar scroll-smooth px-2 min-w-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {MENU_ITEMS.map(item => { 
                        const isActive = activeMenu === item; 
                        const hasDropdown = item === '综合(新)' || item === '专线(新)' || item === '商客' || item === '千里眼(新)' || item === '云视讯(新)' || item === '企宽(新)'; 
                        if (hasDropdown) {
                            return (
                                <div 
                                    key={item} 
                                    className={`h-full flex items-center px-3 cursor-pointer text-sm font-medium tracking-wide transition-colors duration-300 shrink-0 whitespace-nowrap gap-1 ${isActive ? 'text-neon-blue' : 'text-white hover:text-neon-blue'}`}
                                    onClick={() => setActiveMenu(item)}
                                    onMouseEnter={(e) => {
                                        clearDropdownTimer();
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setDropdownState({ isOpen: true, x: rect.left, y: rect.bottom, menu: item });
                                    }}
                                    onMouseLeave={startDropdownCloseTimer}
                                >
                                    {item}
                                    <ChevronDownIcon />
                                </div>
                            );
                        }
                        return ( 
                            <div 
                                key={item} 
                                className={`h-full flex items-center px-3 cursor-pointer text-sm font-medium tracking-wide transition-colors duration-300 shrink-0 whitespace-nowrap ${isActive ? 'text-neon-blue' : 'text-white hover:text-neon-blue'}`} 
                                onClick={() => setActiveMenu(item)}
                                onMouseEnter={startDropdownCloseTimer}
                            >
                                {item}
                            </div> 
                        ); 
                    })}
                </div>
                {showRightArrow && ( <button onClick={() => scrollMenu('right')} className="h-full px-2 text-blue-400/50 hover:text-white transition-colors flex items-center justify-center cursor-pointer shrink-0 z-20"><ChevronRightIcon /></button> )}
           </div>
           <div className="flex items-center gap-5 text-blue-300 shrink-0 whitespace-nowrap">
              <button className="hover:opacity-80 transition-opacity" onClick={() => setUIState({ isSettingsOpen: true }, activeTab === 'complaint' ? 'complaint' : activeTab, activeTab === 'complaint' ? activeComplaintTabId || undefined : undefined)} title="系统设置"><SettingsIcon className="w-4 h-4" /></button>
              <button className="hover:opacity-80 transition-opacity" onClick={toggleFullScreen} title="全屏显示"><img src="https://tvbox-67o.pages.dev/qp.png" alt="全屏" className="w-[10px] h-[10px]" /></button>
              <div className="h-4 w-[1px] bg-blue-500/30"></div>
              <div className="flex items-center gap-3"><span className="text-sm font-medium text-blue-100 tracking-wide shrink-0">吴军校</span><div className="w-8 h-8 rounded-full overflow-hidden border border-blue-400/50 shadow-[0_0_8px_rgba(0,210,255,0.4)] shrink-0"><img src="https://tvbox-67o.pages.dev/head.jpg" alt="User" className="w-full h-full object-cover" /></div></div>
           </div>
        </nav>
        <div className="flex items-center shrink-0 w-full bg-[#0A3458]/90 z-40 overflow-x-auto no-scrollbar">
            {visibleTabs.length === 0 ? ( <div className="text-gray-400 text-sm px-4 py-2 italic">无打开的页签</div> ) : (
                visibleTabs.map(tabId => {
                    const staticTab = TABS_CONFIG.find(t => t.id === tabId);
                    const label = staticTab ? staticTab.label : tabId;
                    
                    const isActive = activeTab === tabId;
                    return ( <div 
                        key={tabId} 
                        className="relative group cursor-pointer min-w-0 max-w-[180px]" 
                        onClick={() => setActiveTab(tabId)}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            setContextMenu({ x: e.clientX, y: e.clientY, tabId: tabId });
                        }}
                    > 
                        <div className={`flex items-center justify-center gap-1 px-4 py-2 ${isActive ? 'bg-[#124979] border-blue-400/50 text-white' : 'bg-transparent border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#0e2a55]/10'} border-r border-t-0 border-b-0 border-l-0 border-blue-500/10 text-sm tracking-wide transition-all whitespace-nowrap overflow-hidden`}> 
                            <span className={`truncate ${isActive ? "drop-shadow-[0_0_5px_rgba(0,210,255,0.5)]" : ""}`} title={label}>{label}</span> 
                            <button onClick={(e) => handleCloseTab(e, tabId)} className={`ml-2 flex-shrink-0 transition-colors focus:outline-none ${isActive ? 'text-white hover:text-white' : 'text-gray-500 hover:text-gray-300'}`} title="关闭"><XIcon /></button> 
                        </div> 
                    </div> );
                })
            )}
        </div>
        <div className="flex-1 flex flex-col p-[10px] overflow-hidden min-h-0 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {visibleTabs.map(tabId => (
                    <div key={tabId} className={`flex-1 flex flex-col h-full ${activeTab === tabId ? '' : 'hidden'}`}>
                        {tabId === 'complaint' && (
                            <>
                                {getUIState('complaint', activeComplaintTabId || '').isSettingsOpen && (
                                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                        <div className="bg-[#0b1730] border border-blue-500/30 p-6 w-[400px] shadow-[0_0_30px_rgba(0,210,255,0.2)]">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                    <SettingsIcon className="w-5 h-5 text-neon-blue" />
                                                    系统设置
                                                </h3>
                                                <button onClick={() => setUIState({ isSettingsOpen: false })} className="text-gray-400 hover:text-white">
                                                    <XIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs text-blue-300 mb-1">Gemini API Key</label>
                                                    <StyledInput 
                                                        type="password"
                                                        placeholder="请输入您的 API Key"
                                                        className="w-full"
                                                        defaultValue={apiKey}
                                                        onChange={(e) => setApiKey(e.target.value)}
                                                    />
                                                    <StyledButton 
                                                        className="w-full mt-2" 
                                                        onClick={() => { handleSaveApiKey(apiKey); alert('API Key 已保存'); }}
                                                    >
                                                        提交
                                                    </StyledButton>
                                                </div>
                                                <div className="p-3 bg-blue-900/20 border border-blue-500/20 rounded text-[10px] text-blue-300 leading-relaxed">
                                                    提示：API Key 将安全地存储在您的浏览器本地存储中，仅用于与 Gemini 服务通信。
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        {tabId !== 'complaint' && tabId !== 'ai-chat' && tabId !== 'workbench' && (
                            <>
                                {getUIState(tabId).isSettingsOpen && (
                                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                        <div className="bg-[#0b1730] border border-blue-500/30 p-6 w-[400px] shadow-[0_0_30px_rgba(0,210,255,0.2)]">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                    <SettingsIcon className="w-5 h-5 text-neon-blue" />
                                                    系统设置
                                                </h3>
                                                <button onClick={() => setUIState({ isSettingsOpen: false }, tabId)} className="text-gray-400 hover:text-white">
                                                    <XIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs text-blue-300 mb-1">Gemini API Key</label>
                                                    <StyledInput 
                                                        type="password"
                                                        placeholder="请输入您的 API Key"
                                                        className="w-full"
                                                        defaultValue={apiKey}
                                                        onChange={(e) => setApiKey(e.target.value)}
                                                    />
                                                    <StyledButton 
                                                        className="w-full mt-2" 
                                                        onClick={() => { handleSaveApiKey(apiKey); alert('API Key 已保存'); }}
                                                    >
                                                        提交
                                                    </StyledButton>
                                                </div>
                                                <div className="p-3 bg-blue-900/20 border border-blue-500/20 rounded text-[10px] text-blue-300 leading-relaxed">
                                                    提示：API Key 将安全地存储在您的浏览器本地存储中，仅用于与 Gemini 服务通信。
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <ExportModal 
                                    isOpen={getUIState(tabId).isExportModalOpen} 
                                    onClose={() => setUIState({ isExportModalOpen: false }, tabId)} 
                                    onConfirm={handleExportConfirm} 
                                    defaultFilename={getUIState(tabId).exportFilename} 
                                />
                            </>
                        )}
                        {tabId === 'ai-chat' ? (
                            <AIChatPanel messages={activeSessionMessages} sessions={sessions} activeSessionId={activeSessionId} onNewSession={handleNewSession} onSelectSession={handleSelectSession} onSendMessage={handleSendMessage} isLoading={isChatLoading} mode="tab" onRenameSession={handleRenameSession} onDeleteSession={handleDeleteSession} />
                        ) : tabId === 'workbench' ? (
                            <WorkbenchView />
                        ) : tabId === 'group-order' ? (
                            <GroupOrderView 
                                viewState={groupOrderViewState}
                                setViewState={setGroupOrderViewState}
                                activeSubTab={groupOrderViewTab}
                                onSubTabChange={setGroupOrderViewTab}
                            />
                        ) : tabId === 'important-business' ? (
                            <ImportantBusinessView />
                        ) : tabId === 'fault-management' ? (
                            <div className="flex flex-1 overflow-hidden h-full">
                                <div className={`${faultManagementSidebarCollapsed ? 'w-[53px]' : 'w-48'} bg-transparent border border-blue-500/30 mr-2 transition-all duration-500 ease-in-out flex flex-col shadow-[0_0_15px_rgba(0,0,0,0.3)]`}>
                                    <div className={`h-[35px] flex items-center ${faultManagementSidebarCollapsed ? 'justify-center' : 'justify-between px-3'} border-b border-blue-500/20 bg-transparent shrink-0`}> 
                                        {!faultManagementSidebarCollapsed && <span className="text-blue-100 font-bold tracking-wider text-[12px] whitespace-nowrap">故障事件管理</span>}
                                        <button onClick={() => setFaultManagementSidebarCollapsed(!faultManagementSidebarCollapsed)} className="text-blue-300 hover:text-white transition-colors flex items-center justify-center"> 
                                            <div className="w-5 h-5 flex items-center justify-center">{faultManagementSidebarCollapsed ? <SidebarOpenIcon /> : <SidebarCloseIcon />}</div> 
                                        </button> 
                                    </div>
                                    <div className="flex-1 py-2 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                                        {FAULT_MANAGEMENT_SIDEBAR_GROUPS.map((group) => (
                                            <div key={group.id} className="flex flex-col gap-1">
                                                {!faultManagementSidebarCollapsed && ( <div className="px-3 py-1 text-xs text-blue-400/70 font-bold uppercase tracking-wider border-b border-blue-500/10 mb-1 mx-1">{group.title}</div> )}
                                                {group.items.map(item => ( <div key={item.id} onClick={() => handleSidebarClick(item.id)} className={`relative flex items-center gap-3 px-3 py-2 cursor-pointer transition-all mx-1 rounded-sm ${activeFaultSidebarFolder === item.id ? 'bg-gradient-to-r from-blue-600/40 to-blue-600/10 text-white border-l-2 border-neon-blue shadow-[0_0_10px_rgba(0,210,255,0.2)]' : 'text-white/80 hover:bg-white/10 hover:text-white border-l-2 border-transparent'} ${faultManagementSidebarCollapsed ? 'justify-center px-0' : ''}`} title={faultManagementSidebarCollapsed ? item.label : ''}> <div className="w-5 h-5 flex items-center justify-center shrink-0 relative">{item.icon}</div> {!faultManagementSidebarCollapsed && ( <span className="text-sm whitespace-nowrap truncate">{item.label}</span> )} </div> ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
                                    {faultManagementTabs.length > 0 && (
                                        <div className="flex items-end gap-[6px] pl-0 pr-4 h-[35px] mt-px border-b border-blue-500/20 bg-[#0c1a35]/20 shrink-0 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                                            {faultManagementTabs.map((tab) => {
                                                const isActive = activeFaultManagementTabId === tab.id;
                                                return (
                                                    <div 
                                                        key={tab.id} 
                                                        onContextMenu={(e) => {
                                                            e.preventDefault();
                                                            setContextMenu({ x: e.clientX, y: e.clientY, tabId: tab.id });
                                                        }}
                                                        onClick={() => { setActiveFaultManagementTabId(tab.id); setActiveFaultSidebarFolder(tab.id); }} 
                                                        className={`
                                                            relative flex items-center justify-center h-full cursor-pointer transition-all duration-300 min-w-[90px] px-3 overflow-hidden group
                                                            ${isActive 
                                                                ? 'z-10' 
                                                                : 'border-t border-x border-blue-500/30 border-b-transparent hover:bg-blue-500/5 opacity-80 hover:opacity-100 bg-[#094F8B]/[0.05]'}
                                                        `}
                                                    >
                                                         {isActive && (
                                                            <>
                                                                <div className="absolute inset-0 bg-gradient-to-b from-[#00d2ff]/10 to-transparent pointer-events-none" />
                                                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-neon-blue shadow-[0_0_10px_#00d2ff] pointer-events-none" />
                                                                <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-neon-blue via-neon-blue/50 to-transparent pointer-events-none" />
                                                                <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-gradient-to-b from-neon-blue via-neon-blue/50 to-transparent pointer-events-none" />
                                                            </>
                                                        )}
                                                        <span className={`relative z-10 text-sm font-medium tracking-wide whitespace-nowrap truncate max-w-[100px] ${isActive ? 'text-white font-bold' : 'text-gray-300'}`}>{tab.label}</span> 
                                                        <button onClick={(e) => handleCloseComplaintTab(e, tab.id)} className={`relative z-10 ml-2 p-0.5 rounded-full hover:bg-blue-500/20 transition-colors ${isActive ? 'opacity-100 text-white' : 'opacity-0 group-hover:opacity-100 text-gray-400'}`}> <XIcon /> </button> 
                                                    </div> 
                                                );
                                            })}
                                        </div>
                                    )}
                                    {renderFaultManagementContent()}
                                </div>
                            </div>
                        ) : tabId === 'terminal-inventory' ? (
                            <TerminalInventoryView />
                        ) : tabId === 'business-customer-portrait' ? (
                            <BusinessCustomerPortraitView />
                        ) : tabId === 'delivery-manager-portrait' ? (
                            <DeliveryManagerPortraitView />
                        ) : tabId === 'business-finance-data' ? (
                            <BusinessFinanceDataView />
                        ) : tabId === 'cloud-video-finance-data' ? (
                            <CloudVideoFinanceDataView />
                        ) : tabId === 'traffic-overlimit-analysis' ? (
                            <TrafficOverlimitAnalysisView />
                        ) : tabId === 'offline-terminal-analysis' ? (
                            <BusinessOfflineTerminalView />
                        ) : tabId === 'ministry-province-report' ? (
                             <MinistryProvinceReportView />
                         ) : tabId === 'complaint' ? (
                            <div className="flex flex-1 overflow-hidden h-full">
                                <div className={`${complaintSidebarCollapsed ? 'w-[53px]' : 'w-48'} bg-transparent border border-blue-500/30 mr-2 transition-all duration-500 ease-in-out flex flex-col shadow-[0_0_15px_rgba(0,0,0,0.3)]`}>
                                    <div className={`h-[35px] flex items-center ${complaintSidebarCollapsed ? 'justify-center' : 'justify-between px-3'} border-b border-blue-500/20 bg-transparent shrink-0`}> 
                                        {!complaintSidebarCollapsed && <span className="text-blue-100 font-bold tracking-wider text-[12px] whitespace-nowrap">投诉支撑</span>}
                                        <button onClick={() => setComplaintSidebarCollapsed(!complaintSidebarCollapsed)} className="text-blue-300 hover:text-white transition-colors flex items-center justify-center"> 
                                            <div className="w-5 h-5 flex items-center justify-center">{complaintSidebarCollapsed ? <SidebarOpenIcon /> : <SidebarCloseIcon />}</div> 
                                        </button> 
                                    </div>
                                    <div className="flex-1 py-2 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                                        {SIDEBAR_GROUPS.map((group) => (
                                            <div key={group.id} className="flex flex-col gap-1">
                                                {!complaintSidebarCollapsed && ( <div className="px-3 py-1 text-xs text-blue-400/70 font-bold uppercase tracking-wider border-b border-blue-500/10 mb-1 mx-1">{group.title}</div> )}
                                                {group.items.map(item => ( <div key={item.id} onClick={() => handleSidebarClick(item.id)} className={`relative flex items-center gap-3 px-3 py-2 cursor-pointer transition-all mx-1 rounded-sm ${activeSidebarFolder === item.id ? 'bg-gradient-to-r from-blue-600/40 to-blue-600/10 text-white border-l-2 border-neon-blue shadow-[0_0_10px_rgba(0,210,255,0.2)]' : 'text-white/80 hover:bg-white/10 hover:text-white border-l-2 border-transparent'} ${complaintSidebarCollapsed ? 'justify-center px-0' : ''}`} title={complaintSidebarCollapsed ? item.label : ''}> <div className="w-5 h-5 flex items-center justify-center shrink-0 relative">{item.icon}{complaintSidebarCollapsed && item.count && ( <div className={`absolute -top-1.5 -right-1.5 w-3.5 h-3.5 flex items-center justify-center text-[8px] rounded-full text-white ${item.badgeColor || 'bg-red-500'} ring-1 ring-[#0c2242]`}>{item.count > 9 ? '9+' : item.count}</div> )}</div> {!complaintSidebarCollapsed && ( <span className="text-sm whitespace-nowrap truncate">{item.label}</span> )} </div> ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
                                    {complaintTabs.length > 0 && (
                                        <div className="flex items-end gap-[6px] pl-0 pr-4 h-[35px] mt-px border-b border-blue-500/20 bg-[#0c1a35]/20 shrink-0 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                                            {complaintTabs.map((tab) => {
                                                const isActive = activeComplaintTabId === tab.id;
                                                return (
                                                    <div 
                                                        key={tab.id} 
                                                        onContextMenu={(e) => {
                                                            e.preventDefault();
                                                            setContextMenu({ x: e.clientX, y: e.clientY, tabId: tab.id });
                                                        }}
                                                        onClick={() => { setActiveComplaintTabId(tab.id); if (tab.type === 'stats') setActiveSidebarFolder('stats'); else if (tab.type === 'config') setActiveSidebarFolder('capabilities'); else if (tab.type === 'personnel') setActiveSidebarFolder('personnel'); else if (tab.type === 'create') setActiveSidebarFolder('new'); else if (tab.type !== 'detail') setActiveSidebarFolder(tab.id); else setActiveSidebarFolder(''); }} 
                                                        className={`
                                                            relative flex items-center justify-center h-full cursor-pointer transition-all duration-300 min-w-[90px] px-3 overflow-hidden group
                                                            ${isActive 
                                                                ? 'z-10' 
                                                                : 'border-t border-x border-blue-500/30 border-b-transparent hover:bg-blue-500/5 opacity-80 hover:opacity-100 bg-[#094F8B]/[0.05]'}
                                                        `}
                                                    >
                                                         {isActive && (
                                                            <>
                                                                <div className="absolute inset-0 bg-gradient-to-b from-[#00d2ff]/10 to-transparent pointer-events-none" />
                                                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-neon-blue shadow-[0_0_10px_#00d2ff] pointer-events-none" />
                                                                <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-neon-blue via-neon-blue/50 to-transparent pointer-events-none" />
                                                                <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-gradient-to-b from-neon-blue via-neon-blue/50 to-transparent pointer-events-none" />
                                                            </>
                                                        )}
                                                        <span className={`relative z-10 text-sm font-medium tracking-wide whitespace-nowrap truncate max-w-[100px] ${isActive ? 'text-white font-bold' : 'text-gray-300'}`}>{tab.label}</span> 
                                                        <button onClick={(e) => handleCloseComplaintTab(e, tab.id)} className={`relative z-10 ml-2 p-0.5 rounded-full hover:bg-blue-500/20 transition-colors ${isActive ? 'opacity-100 text-white' : 'opacity-0 group-hover:opacity-100 text-gray-400'}`}> <XIcon /> </button> 
                                                    </div> 
                                                );
                                            })}
                                        </div>
                                    )}
                                    {renderComplaintContent()}
                                </div>
                            </div>
                        ) : (
                            renderStandardView()
                        )}
                    </div>
                ))}
                {visibleTabs.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-blue-300/50"> <div className="text-6xl mb-4">🗂️</div> <div className="text-xl">所有页签已关闭</div> <button onClick={handleRestoreTabs} className="mt-4 px-4 py-2 bg-blue-600/30 border border-blue-500 hover:bg-blue-600/50 text-white rounded">重新打开</button> </div>
                )}
            </div>
            {isChatPanelOpen && activeTab !== 'ai-chat' && ( <div className="fixed right-0 top-[60px] bottom-0 w-[520px] z-[100] animate-[slideInRight_0.3s_ease-out]"> <AIChatPanel messages={activeSessionMessages} sessions={sessions} activeSessionId={activeSessionId} onNewSession={handleNewSession} onSelectSession={handleSelectSession} onSendMessage={handleSendMessage} isLoading={isChatLoading} mode="sidebar" onExpand={handleExpandChat} onClose={() => setIsChatPanelOpen(false)} onRenameSession={handleRenameSession} onDeleteSession={handleDeleteSession} /> </div> )}
            {!isChatPanelOpen && activeTab !== 'ai-chat' && ( <button onClick={() => setIsChatPanelOpen(true)} className="fixed right-6 bottom-10 z-50 w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-[0_0_20px_rgba(0,210,255,0.6)] flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 animate-pulse" title="打开智能助手"> <BotIcon /> </button> )}
            
            {dropdownState.isOpen && (
                <div 
                    className="fixed z-[60] bg-[#0A3458]/30 border border-blue-500/30 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md py-2 w-36 rounded-sm animate-[fadeIn_0.1s_ease-out]"
                    style={{ top: dropdownState.y, left: dropdownState.x }}
                    onMouseEnter={clearDropdownTimer}
                    onMouseLeave={startDropdownCloseTimer}
                >
                    {dropdownState.menu === '综合(新)' && (
                        <>
                            <div 
                                className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-sm text-blue-100 hover:text-white transition-colors border-l-2 border-transparent hover:border-neon-blue" 
                                onClick={() => { handleOpenTab('workbench'); setDropdownState(prev => ({...prev, isOpen: false})); setActiveMenu('综合(新)'); }}
                                onMouseEnter={() => { clearDropdownTimer(); setSubDropdownState(prev => ({...prev, isOpen: false})); }}
                            >
                                综调-工作台
                            </div>
                            <div 
                                className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-sm text-blue-100 hover:text-white transition-colors border-l-2 border-transparent hover:border-neon-blue" 
                                onClick={() => { handleOpenTab('complaint'); setDropdownState(prev => ({...prev, isOpen: false})); setActiveMenu('综合(新)'); }}
                                onMouseEnter={() => { clearDropdownTimer(); setSubDropdownState(prev => ({...prev, isOpen: false})); }}
                            >
                                投诉支撑
                            </div>
                            <div 
                                className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-sm text-blue-100 hover:text-white transition-colors border-l-2 border-transparent hover:border-neon-blue" 
                                onClick={() => { handleOpenTab('group-order'); setDropdownState(prev => ({...prev, isOpen: false})); setActiveMenu('综合(新)'); }}
                                onMouseEnter={() => { clearDropdownTimer(); setSubDropdownState(prev => ({...prev, isOpen: false})); }}
                            >
                                团单管理
                            </div>
                            <div 
                                className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-sm text-blue-100 hover:text-white transition-colors border-l-2 border-transparent hover:border-neon-blue" 
                                onClick={() => { handleOpenTab('terminal-inventory'); setDropdownState(prev => ({...prev, isOpen: false})); setActiveMenu('综合(新)'); }}
                                onMouseEnter={() => { clearDropdownTimer(); setSubDropdownState(prev => ({...prev, isOpen: false})); }}
                            >
                                终端库存管理
                            </div>
                        </>
                    )}
                    {dropdownState.menu === '商客' && (
                        <>
                            <div 
                                className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-sm text-blue-100 hover:text-white transition-colors border-l-2 border-transparent hover:border-neon-blue" 
                                onClick={() => { handleOpenTab('business-customer-portrait'); setDropdownState(prev => ({...prev, isOpen: false})); setActiveMenu('商客'); }}
                                onMouseEnter={() => { clearDropdownTimer(); setSubDropdownState(prev => ({...prev, isOpen: false})); }}
                            >
                                商客装维画像
                            </div>
                            <div 
                                className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-sm text-blue-100 hover:text-white transition-colors border-l-2 border-transparent hover:border-neon-blue" 
                                onClick={() => { handleOpenTab('delivery-manager-portrait'); setDropdownState(prev => ({...prev, isOpen: false})); setActiveMenu('商客'); }}
                                onMouseEnter={() => { clearDropdownTimer(); setSubDropdownState(prev => ({...prev, isOpen: false})); }}
                            >
                                交付经理画像
                            </div>
                        </>
                    )}
                    {dropdownState.menu === '专线(新)' && (
                        <>
                            <div 
                                className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-sm text-blue-100 hover:text-white transition-colors border-l-2 border-transparent hover:border-neon-blue" 
                                onClick={() => { handleOpenTab('important-business'); setDropdownState(prev => ({...prev, isOpen: false})); setActiveMenu('专线(新)'); }}
                                onMouseEnter={() => { clearDropdownTimer(); setSubDropdownState(prev => ({...prev, isOpen: false})); }}
                            >
                                重要业务管理
                            </div>
                            <div 
                                className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-sm text-blue-100 hover:text-white transition-colors border-l-2 border-transparent hover:border-neon-blue" 
                                onClick={() => { handleOpenTab('fault-management'); setDropdownState(prev => ({...prev, isOpen: false})); setActiveMenu('专线(新)'); }}
                                onMouseEnter={() => { clearDropdownTimer(); setSubDropdownState(prev => ({...prev, isOpen: false})); }}
                            >
                                故障事件管理
                            </div>
                        </>
                    )}
                    {dropdownState.menu === '千里眼(新)' && (
                        <>
                            <div 
                                className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-sm text-blue-100 hover:text-white transition-colors border-l-2 border-transparent hover:border-neon-blue" 
                                onClick={() => { handleOpenTab('business-finance-data'); setDropdownState(prev => ({...prev, isOpen: false})); setActiveMenu('千里眼(新)'); }}
                                onMouseEnter={() => { clearDropdownTimer(); setSubDropdownState(prev => ({...prev, isOpen: false})); }}
                            >
                                千里眼业财数据
                            </div>
                        </>
                    )}
                    {dropdownState.menu === '云视讯(新)' && (
                        <>
                            <div 
                                className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-sm text-blue-100 hover:text-white transition-colors border-l-2 border-transparent hover:border-neon-blue" 
                                onClick={() => { handleOpenTab('cloud-video-finance-data'); setDropdownState(prev => ({...prev, isOpen: false})); setActiveMenu('云视讯(新)'); }}
                                onMouseEnter={() => { clearDropdownTimer(); setSubDropdownState(prev => ({...prev, isOpen: false})); }}
                            >
                                云视讯业财数据
                            </div>
                        </>
                    )}
                    {dropdownState.menu === '企宽(新)' && (
                        <>
                            <div 
                                className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-sm text-blue-100 hover:text-white transition-colors border-l-2 border-transparent hover:border-neon-blue flex items-center justify-between group" 
                                onMouseEnter={(e) => {
                                    clearDropdownTimer();
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setSubDropdownState({ isOpen: true, x: rect.right, y: rect.top, menu: '综合分析' });
                                }}
                            >
                                <span>综合分析</span>
                                <ChevronRightIcon className="w-4 h-4 text-blue-400 group-hover:text-white transition-colors" />
                            </div>
                            <div 
                                className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-sm text-blue-100 hover:text-white transition-colors border-l-2 border-transparent hover:border-neon-blue" 
                                onClick={() => { handleOpenTab('ministry-province-report'); setDropdownState(prev => ({...prev, isOpen: false})); setActiveMenu('企宽(新)'); }}
                                onMouseEnter={() => { clearDropdownTimer(); setSubDropdownState(prev => ({...prev, isOpen: false})); }}
                            >
                                部省上报管理
                            </div>
                        </>
                    )}
                </div>
            )}

            {subDropdownState.isOpen && (
                <div 
                    className="fixed z-[70] bg-[#0A3458]/95 border border-blue-500/30 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md py-2 w-48 rounded-sm animate-[fadeIn_0.1s_ease-out]"
                    style={{ top: subDropdownState.y, left: subDropdownState.x }}
                    onMouseEnter={clearDropdownTimer}
                    onMouseLeave={startDropdownCloseTimer}
                >
                    {subDropdownState.menu === '综合分析' && (
                        <>
                            <div 
                                className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-sm text-blue-100 hover:text-white transition-colors border-l-2 border-transparent hover:border-neon-blue" 
                                onClick={() => { handleOpenTab('traffic-overlimit-analysis'); setSubDropdownState(prev => ({...prev, isOpen: false})); setDropdownState(prev => ({...prev, isOpen: false})); setActiveMenu('企宽(新)'); }}
                                onMouseEnter={clearDropdownTimer}
                            >
                                业务流量超限分析
                            </div>
                            <div 
                                className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-sm text-blue-100 hover:text-white transition-colors border-l-2 border-transparent hover:border-neon-blue" 
                                onClick={() => { handleOpenTab('offline-terminal-analysis'); setSubDropdownState(prev => ({...prev, isOpen: false})); setDropdownState(prev => ({...prev, isOpen: false})); setActiveMenu('企宽(新)'); }}
                                onMouseEnter={clearDropdownTimer}
                            >
                                业务离线终端分析
                            </div>
                        </>
                    )}
                </div>
            )}

            {contextMenu && (
                <div 
                    className="fixed z-[9999] bg-[#0A3458]/95 border border-blue-500/30 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md py-1 w-32 rounded-sm animate-[fadeIn_0.1s_ease-out]"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <div 
                        className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-xs text-blue-100 hover:text-white transition-colors" 
                        onClick={() => {
                            const tabId = contextMenu?.tabId;
                            if (!tabId) {
                                setContextMenu(null);
                                return;
                            }
                            
                            // Determine which tab list contains the tabId
                            if (complaintTabs.some(t => t.id === tabId)) {
                                handleCloseComplaintTab(null, tabId);
                            } else if (faultManagementTabs.some(t => t.id === tabId)) {
                                handleCloseComplaintTab(null, tabId); // handleCloseComplaintTab handles both
                            } else {
                                handleCloseTab(null, tabId);
                            }
                            setContextMenu(null);
                        }}
                    >
                        关闭当前标签
                    </div>
                    <div 
                        className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-xs text-blue-100 hover:text-white transition-colors" 
                        onClick={() => {
                            const tabId = contextMenu?.tabId;
                            if (!tabId) {
                                setContextMenu(null);
                                return;
                            }

                            if (complaintTabs.some(t => t.id === tabId)) {
                                const tabToKeep = complaintTabs.find(t => t.id === tabId);
                                if (tabToKeep) {
                                    setComplaintTabs([tabToKeep]);
                                    setActiveComplaintTabId(tabToKeep.id);
                                }
                            } else if (faultManagementTabs.some(t => t.id === tabId)) {
                                const tabToKeep = faultManagementTabs.find(t => t.id === tabId);
                                if (tabToKeep) {
                                    setFaultManagementTabs([tabToKeep]);
                                    setActiveFaultManagementTabId(tabToKeep.id);
                                }
                            } else {
                                setVisibleTabs([tabId]);
                                setActiveTab(tabId);
                            }
                            setContextMenu(null);
                        }}
                    >
                        关闭其他标签
                    </div>
                    <div 
                        className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-xs text-blue-100 hover:text-white transition-colors" 
                        onClick={() => {
                            const tabId = contextMenu?.tabId;
                            if (!tabId) {
                                setContextMenu(null);
                                return;
                            }

                            if (complaintTabs.some(t => t.id === tabId)) {
                                setComplaintTabs([]);
                                setActiveComplaintTabId(null);
                                setActiveSidebarFolder('');
                            } else if (faultManagementTabs.some(t => t.id === tabId)) {
                                setFaultManagementTabs([]);
                                setActiveFaultManagementTabId(null);
                                setActiveFaultSidebarFolder('');
                            } else {
                                // Close all tabs
                                setVisibleTabs([]);
                                setActiveTab('');
                            }
                            setContextMenu(null);
                        }}
                    >
                        关闭全部标签
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};