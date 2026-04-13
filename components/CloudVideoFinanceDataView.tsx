import React, { useState, useMemo } from 'react';
import { StyledInput, StyledButton, StyledSelect } from './UI';
import { SearchIcon, DownloadIcon, XIcon, SidebarOpenIcon, SidebarCloseIcon, BarChartIcon, TrendingUpIcon, BellIcon, SettingsIcon, RefreshCwIcon, ZoomInIcon, PlusCircleIcon, EditIcon, TrashIcon, UploadIcon } from './Icons';
import { Pagination } from './Pagination';
import { INNER_MONGOLIA_CITIES } from '../constants';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Bar, Cell, PieChart, Pie } from 'recharts';

interface CloudVideoInstallRecord {
    id: string;
    month: string;
    city: string;
    cat1: string;
    cat2: string;
    volume: number;
    unitPrice: number;
    totalCost: number;
}

interface CloudVideoMaintenanceRecord {
    id: string;
    month: string;
    city: string;
    cat1: string;
    cat2: string;
    volume: number;
    unitPrice: number;
    totalCost: number;
}

interface CloudVideoInstallDetailRecord {
    id: string;
    ticketNo: string;
    subject: string;
    productInstanceId: string;
    customerName: string;
    customerCode: string;
    cat1: string;
    cat2: string;
    terminalModel: string;
    deviceSn: string;
    city: string;
    address: string;
    type: '装机' | '移机';
    completionTime: string;
}

interface CloudVideoMaintenanceDetailRecord {
    id: string;
    productInstanceId: string;
    customerName: string;
    customerCode: string;
    cat1: string;
    cat2: string;
    terminalModel: string;
    deviceSn: string;
    macAddress: string;
    city: string;
    address: string;
}

interface CloudVideoFaultTicketDetailRecord {
    id: string;
    ticketNo: string;
    subject: string;
    channel: '400热线' | '10086热线' | '政企综调平台' | '其他报障渠道';
    faultReason: '客户侧原因' | '云视讯硬件原因' | '接入网络原因' | '其他原因';
    customerCode: string;
    customerName: string;
    productInstanceId: string;
    city: string;
    currentStep: string;
    handler: string;
    status: string;
    reportTime: string;
    archiveTime: string;
    duration: string;
    month: string;
}

const MOCK_CV_INSTALL_DATA: CloudVideoInstallRecord[] = [
    { id: '1', month: '2024-03', city: '呼和浩特', cat1: '云视讯', cat2: '云视讯硬件', volume: 150, unitPrice: 200, totalCost: 30000 },
    { id: '2', month: '2024-03', city: '包头', cat1: '云视讯', cat2: '云视讯硬件', volume: 80, unitPrice: 200, totalCost: 16000 },
    { id: '3', month: '2024-03', city: '鄂尔多斯', cat1: '云视讯', cat2: '云视讯硬件', volume: 120, unitPrice: 100, totalCost: 12000 },
    { id: '4', month: '2024-02', city: '呼和浩特', cat1: '云视讯', cat2: '云视讯硬件', volume: 130, unitPrice: 200, totalCost: 26000 },
    { id: '5', month: '2024-02', city: '赤峰', cat1: '云视讯', cat2: '云视讯软件', volume: 500, unitPrice: 50, totalCost: 25000 },
];

const MOCK_CV_INSTALL_DETAILS: Record<string, CloudVideoInstallDetailRecord[]> = {
    '1': [
        { id: 'd1', ticketNo: 'CV-20240301-001', subject: '呼和浩特市政府云视讯终端装机', productInstanceId: 'PI-8839201', customerName: '呼和浩特市政府', customerCode: 'CUST-HHHT-001', cat1: '云视讯', cat2: '云视讯硬件', terminalModel: '华为TE40', deviceSn: 'SN-HW-TE40-001', city: '呼和浩特', address: '新华东街1号', type: '装机', completionTime: '2024-03-05 14:30:00' },
        { id: 'd2', ticketNo: 'CV-20240302-002', subject: '内蒙古大学云视讯终端移机', productInstanceId: 'PI-8839202', customerName: '内蒙古大学', customerCode: 'CUST-NMDX-001', cat1: '云视讯', cat2: '云视讯硬件', terminalModel: '中兴T800', deviceSn: 'SN-ZTE-T800-002', city: '呼和浩特', address: '大学西路235号', type: '移机', completionTime: '2024-03-10 10:15:00' },
    ]
};

const MOCK_CV_MAINTENANCE_DATA: CloudVideoMaintenanceRecord[] = [
    { id: 'm1', month: '2024-03', city: '呼和浩特', cat1: '云视讯', cat2: '云视讯硬件', volume: 1200, unitPrice: 15, totalCost: 18000 },
    { id: 'm2', month: '2024-03', city: '包头', cat1: '云视讯', cat2: '云视讯硬件', volume: 850, unitPrice: 15, totalCost: 12750 },
    { id: 'm3', month: '2024-03', city: '鄂尔多斯', cat1: '云视讯', cat2: '云视讯硬件', volume: 1500, unitPrice: 12, totalCost: 18000 },
];

const MOCK_CV_MAINTENANCE_DETAILS: Record<string, CloudVideoMaintenanceDetailRecord[]> = {
    'm1': [
        { id: 'md1', productInstanceId: 'PI-CV-HHHT-001', customerName: '呼和浩特市教育局', customerCode: 'CUST-EDU-001', cat1: '云视讯', cat2: '云视讯硬件', terminalModel: '华为TE30', deviceSn: 'SN-CV-001', macAddress: '00:11:22:33:44:55', city: '呼和浩特', address: '呼和浩特市赛罕区' },
        { id: 'md2', productInstanceId: 'PI-CV-HHHT-002', customerName: '呼和浩特市公安局', customerCode: 'CUST-POL-002', cat1: '云视讯', cat2: '云视讯硬件', terminalModel: '华为TE40', deviceSn: 'SN-CV-002', macAddress: '00:11:22:33:44:66', city: '呼和浩特', address: '呼和浩特市新城区' },
    ]
};

const MOCK_CV_FAULT_TICKET_DETAILS: CloudVideoFaultTicketDetailRecord[] = [
    { id: 'cvft1', ticketNo: 'CVFT20240301001', subject: '终端无法开机', channel: '400热线', faultReason: '云视讯硬件原因', customerCode: 'CUST-CV-001', customerName: '内蒙古电力公司', productInstanceId: 'CV-PI-001', city: '呼和浩特', currentStep: '已归档', handler: '张工', status: '已解决', reportTime: '2024-03-01 09:00:00', archiveTime: '2024-03-01 11:00:00', duration: '2小时', month: '2024-03' },
    { id: 'cvft2', ticketNo: 'CVFT20240302005', subject: '会议画面卡顿', channel: '10086热线', faultReason: '接入网络原因', customerCode: 'CUST-CV-045', customerName: '包钢集团', productInstanceId: 'CV-PI-056', city: '包头', currentStep: '处理中', handler: '李工', status: '处理中', reportTime: '2024-03-02 14:00:00', archiveTime: '', duration: '5小时', month: '2024-03' },
    { id: 'cvft3', ticketNo: 'CVFT20240303012', subject: '无法加入会议', channel: '政企综调平台', faultReason: '客户侧原因', customerCode: 'CUST-CV-088', customerName: '鄂尔多斯市政府', productInstanceId: 'CV-PI-102', city: '鄂尔多斯', currentStep: '已归档', handler: '王工', status: '已解决', reportTime: '2024-03-03 10:30:00', archiveTime: '2024-03-03 11:30:00', duration: '1小时', month: '2024-03' },
    { id: 'cvft4', ticketNo: 'CVFT20240304008', subject: '麦克风无声', channel: '其他报障渠道', faultReason: '其他原因', customerCode: 'CUST-CV-120', customerName: '赤峰市医院', productInstanceId: 'CV-PI-033', city: '赤峰', currentStep: '已归档', handler: '赵工', status: '已解决', reportTime: '2024-03-04 16:20:00', archiveTime: '2024-03-05 09:00:00', duration: '16小时', month: '2024-03' },
];

const Th = ({ children, className = "", ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={`p-3 font-semibold border-b border-blue-500/40 whitespace-nowrap text-xs ${className}`} {...props}>
    {children}
  </th>
);

const Td = ({ children, className = "", ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={`p-3 border-b border-blue-500/10 whitespace-nowrap text-xs ${className}`} {...props}>
    {children}
  </td>
);

const CloudVideoInstallRemoveView: React.FC = () => {
    const [filters, setFilters] = useState({ month: '', city: '', cat1: '', cat2: '' });
    const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 10 });
    const [selectedRecord, setSelectedRecord] = useState<CloudVideoInstallRecord | null>(null);
    const [detailPagination, setDetailPagination] = useState({ currentPage: 1, pageSize: 10 });

    const filteredData = useMemo(() => {
        return MOCK_CV_INSTALL_DATA.filter(item => {
            if (filters.month && item.month !== filters.month) return false;
            if (filters.city && item.city !== filters.city) return false;
            if (filters.cat1 && item.cat1 !== filters.cat1) return false;
            if (filters.cat2 && !item.cat2.includes(filters.cat2)) return false;
            return true;
        });
    }, [filters]);

    const totalCost = useMemo(() => {
        return filteredData.reduce((sum, item) => sum + item.totalCost, 0);
    }, [filteredData]);

    const paginatedData = useMemo(() => {
        const start = (pagination.currentPage - 1) * pagination.pageSize;
        return filteredData.slice(start, start + pagination.pageSize);
    }, [filteredData, pagination]);

    const paginatedDetails = useMemo(() => {
        if (!selectedRecord) return [];
        const details = MOCK_CV_INSTALL_DETAILS[selectedRecord.id] || [];
        const start = (detailPagination.currentPage - 1) * detailPagination.pageSize;
        return details.slice(start, start + detailPagination.pageSize);
    }, [selectedRecord, detailPagination]);

    const handleDrillDown = (record: CloudVideoInstallRecord) => {
        setSelectedRecord(record);
        setDetailPagination({ currentPage: 1, pageSize: 10 });
    };

    const handleExport = () => {
        const headers = ['月份', '地市', '一级分类', '二级分类', '装移机量（路）', '单价（元）', '装移机费用（元）'];
        const csvContent = [
            headers.join(','),
            ...filteredData.map(item => [
                item.month,
                item.city,
                item.cat1,
                item.cat2,
                item.volume,
                item.unitPrice.toFixed(2),
                item.totalCost
            ].join(','))
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `云视讯装移机数据_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="relative flex flex-col h-full p-4 animate-[fadeIn_0.3s_ease-out]">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-4 bg-[#0c2242]/50 p-4 border border-blue-500/20 rounded-sm">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-300 whitespace-nowrap">月份:</span>
                    <StyledInput type="month" value={filters.month} onChange={e => setFilters({ ...filters, month: e.target.value })} className="w-32" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-300 whitespace-nowrap">地市:</span>
                    <StyledSelect value={filters.city} onChange={e => setFilters({ ...filters, city: e.target.value })} className="w-32">
                        <option value="">全部</option>
                        {INNER_MONGOLIA_CITIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                    </StyledSelect>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-300 whitespace-nowrap">一级分类:</span>
                    <StyledSelect value={filters.cat1} onChange={e => setFilters({ ...filters, cat1: e.target.value })} className="w-32">
                        <option value="">全部</option>
                        <option value="云视讯">云视讯</option>
                    </StyledSelect>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-300 whitespace-nowrap">二级分类:</span>
                    <StyledSelect value={filters.cat2} onChange={e => setFilters({ ...filters, cat2: e.target.value })} className="w-32">
                        <option value="">全部</option>
                        <option value="云视讯硬件">云视讯硬件</option>
                        <option value="云视讯软件">云视讯软件</option>
                    </StyledSelect>
                </div>
                <StyledButton onClick={() => setPagination({ ...pagination, currentPage: 1 })} icon={<SearchIcon />} variant="toolbar">查询</StyledButton>
                {(filters.month || filters.city || filters.cat1 || filters.cat2) && (
                    <StyledButton onClick={() => setFilters({ month: '', city: '', cat1: '', cat2: '' })} variant="secondary" icon={<RefreshCwIcon />}>重置</StyledButton>
                )}
            </div>

            {/* Summary Metric */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gradient-to-r from-blue-600/20 to-blue-900/20 border border-blue-500/30 p-4 rounded-sm flex flex-col justify-center">
                    <span className="text-xs text-blue-300 mb-1">月份</span>
                    <span className="text-xl font-bold text-white">{filters.month || '2024-03'}</span>
                </div>
                <div className="bg-gradient-to-r from-blue-600/20 to-blue-900/20 border border-blue-500/30 p-4 rounded-sm flex flex-col justify-center">
                    <span className="text-xs text-blue-300 mb-1">本月全省云视讯应结总装移机工料费（元）</span>
                    <span className="text-2xl font-bold text-neon-blue">¥ {totalCost.toLocaleString()}</span>
                </div>
            </div>

            {/* Main Table */}
            <div className="flex-1 overflow-hidden flex flex-col border border-blue-500/30 bg-[#0A2744]/50 relative">
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10 bg-[#124979]/90 backdrop-blur-sm shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
                            <tr>
                                <Th className="text-blue-200">月份</Th>
                                <Th className="text-blue-200">地市</Th>
                                <Th className="text-blue-200">一级分类</Th>
                                <Th className="text-blue-200">二级分类</Th>
                                <Th className="text-blue-200 text-right">装移机量（路）</Th>
                                <Th className="text-blue-200 text-right">单价（元）</Th>
                                <Th className="text-blue-200 text-right">装移机费用（元）</Th>
                                <Th className="text-blue-200 text-center">操作</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length > 0 ? paginatedData.map((item, index) => (
                                <tr key={item.id} className={`hover:bg-blue-500/10 transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-[#0A3458]/20'}`}>
                                    <Td className="text-blue-100">{item.month}</Td>
                                    <Td className="text-blue-100">{item.city}</Td>
                                    <Td className="text-blue-100">{item.cat1}</Td>
                                    <Td className="text-blue-100">{item.cat2}</Td>
                                    <Td className="text-blue-100 text-right font-mono">{item.volume}</Td>
                                    <Td className="text-blue-100 text-right font-mono">{item.unitPrice.toFixed(2)}</Td>
                                    <Td className="text-neon-blue text-right font-mono font-bold">{item.totalCost.toLocaleString()}</Td>
                                    <Td className="text-center">
                                        <button 
                                            className="text-blue-400 hover:text-neon-blue underline text-xs"
                                            onClick={() => handleDrillDown(item)}
                                        >
                                            下钻详情
                                        </button>
                                    </Td>
                                </tr>
                            )) : (
                                <tr>
                                    <Td colSpan={8} className="text-center text-gray-400 py-8">暂无数据</Td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-[#1e293b]/50 h-[40px] shrink-0 border-t border-blue-500/20 flex items-center px-4 gap-4">
                    <StyledButton variant="toolbar" onClick={handleExport} icon={<DownloadIcon />} className="whitespace-nowrap h-8">导出</StyledButton>
                    <Pagination 
                        currentPage={pagination.currentPage} 
                        totalItems={filteredData.length} 
                        pageSize={pagination.pageSize} 
                        onPageChange={(page) => setPagination({ ...pagination, currentPage: page })} 
                        onPageSizeChange={(s) => setPagination({ currentPage: 1, pageSize: s })}
                        className="py-0 w-full"
                    />
                </div>
            </div>

            {/* Drill-down Modal */}
            {selectedRecord && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#0b1730] border border-blue-500/40 w-full max-w-6xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,210,255,0.3)]">
                        <div className="flex justify-between items-center p-4 border-b border-blue-500/30 bg-[#0c2242]">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <BarChartIcon className="w-5 h-5 text-neon-blue" />
                                装移机详情 - {selectedRecord.city} ({selectedRecord.month})
                            </h3>
                            <button onClick={() => setSelectedRecord(null)} className="text-gray-400 hover:text-white transition-colors">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-auto p-4 scrollbar-thin">
                            <table className="w-full text-left border-collapse min-w-[1200px]">
                                <thead className="sticky top-0 z-10 bg-[#1e3a5f]">
                                    <tr>
                                        <Th className="text-blue-200">工单编号</Th>
                                        <Th className="text-blue-200">工单主题</Th>
                                        <Th className="text-blue-200">产品实例标识</Th>
                                        <Th className="text-blue-200">客户名称</Th>
                                        <Th className="text-blue-200">客户编号</Th>
                                        <Th className="text-blue-200">一级分类</Th>
                                        <Th className="text-blue-200">二级分类</Th>
                                        <Th className="text-blue-200">终端型号</Th>
                                        <Th className="text-blue-200">设备序列号</Th>
                                        <Th className="text-blue-200">地市</Th>
                                        <Th className="text-blue-200">安装地址</Th>
                                        <Th className="text-blue-200">装移机类型</Th>
                                        <Th className="text-blue-200">装移机完成时间</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedDetails.map((detail, idx) => (
                                        <tr key={detail.id} className={`hover:bg-blue-500/10 transition-colors ${idx % 2 === 0 ? 'bg-transparent' : 'bg-[#0A3458]/20'}`}>
                                            <Td className="text-blue-100">{detail.ticketNo}</Td>
                                            <Td className="text-blue-100 truncate max-w-[150px]" title={detail.subject}>{detail.subject}</Td>
                                            <Td className="text-blue-100">{detail.productInstanceId}</Td>
                                            <Td className="text-blue-100 truncate max-w-[150px]" title={detail.customerName}>{detail.customerName}</Td>
                                            <Td className="text-blue-100">{detail.customerCode}</Td>
                                            <Td className="text-blue-100">{detail.cat1}</Td>
                                            <Td className="text-blue-100">{detail.cat2}</Td>
                                            <Td className="text-blue-100">{detail.terminalModel}</Td>
                                            <Td className="text-blue-100">{detail.deviceSn}</Td>
                                            <Td className="text-blue-100">{detail.city}</Td>
                                            <Td className="text-blue-100 truncate max-w-[150px]" title={detail.address}>{detail.address}</Td>
                                            <Td className="text-blue-100">
                                                <span className={`px-2 py-0.5 rounded text-[10px] ${detail.type === '装机' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                                                    {detail.type}
                                                </span>
                                            </Td>
                                            <Td className="text-blue-100">{detail.completionTime}</Td>
                                        </tr>
                                    ))}
                                    {paginatedDetails.length === 0 && (
                                        <tr>
                                            <Td colSpan={13} className="text-center text-gray-400 py-8">暂无详情数据</Td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-2 border-t border-blue-500/30 bg-[#0c2242] flex items-center justify-between px-4">
                            <div className="flex items-center gap-4 flex-1">
                                <StyledButton variant="toolbar" onClick={() => alert('导出详情')} icon={<DownloadIcon />} className="whitespace-nowrap h-8">导出</StyledButton>
                                <Pagination 
                                    currentPage={detailPagination.currentPage} 
                                    pageSize={detailPagination.pageSize} 
                                    totalItems={(MOCK_CV_INSTALL_DETAILS[selectedRecord.id] || []).length} 
                                    onPageChange={(page) => setDetailPagination({ ...detailPagination, currentPage: page })} 
                                    onPageSizeChange={(s) => setDetailPagination({ currentPage: 1, pageSize: s })} 
                                    className="py-0 w-full" 
                                />
                            </div>
                            <StyledButton onClick={() => setSelectedRecord(null)} className="ml-4">关闭</StyledButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CloudVideoMaintenanceDataView: React.FC = () => {
    const [filters, setFilters] = useState({ month: '2024-03', city: '', cat1: '', cat2: '' });
    const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 10 });
    const [selectedRecord, setSelectedRecord] = useState<CloudVideoMaintenanceRecord | null>(null);
    const [detailPagination, setDetailPagination] = useState({ currentPage: 1, pageSize: 10 });

    const filteredData = useMemo(() => {
        return MOCK_CV_MAINTENANCE_DATA.filter(item => {
            if (filters.month && item.month !== filters.month) return false;
            if (filters.city && item.city !== filters.city) return false;
            if (filters.cat1 && item.cat1 !== filters.cat1) return false;
            if (filters.cat2 && !item.cat2.includes(filters.cat2)) return false;
            return true;
        });
    }, [filters]);

    const totalCost = useMemo(() => {
        return filteredData.reduce((sum, item) => sum + item.totalCost, 0);
    }, [filteredData]);

    const paginatedData = useMemo(() => {
        const start = (pagination.currentPage - 1) * pagination.pageSize;
        return filteredData.slice(start, start + pagination.pageSize);
    }, [filteredData, pagination]);

    const paginatedDetails = useMemo(() => {
        if (!selectedRecord) return [];
        const details = MOCK_CV_MAINTENANCE_DETAILS[selectedRecord.id] || [];
        const start = (detailPagination.currentPage - 1) * detailPagination.pageSize;
        return details.slice(start, start + detailPagination.pageSize);
    }, [selectedRecord, detailPagination]);

    const handleDrillDown = (record: CloudVideoMaintenanceRecord) => {
        setSelectedRecord(record);
        setDetailPagination({ currentPage: 1, pageSize: 10 });
    };

    const handleExport = () => {
        const headers = ['月份', '地市', '一级分类', '二级分类', '维护量（路）', '单价（元）', '维护费用（元）'];
        const csvContent = [
            headers.join(','),
            ...filteredData.map(item => [
                item.month,
                item.city,
                item.cat1,
                item.cat2,
                item.volume,
                item.unitPrice.toFixed(2),
                item.totalCost
            ].join(','))
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `云视讯维护量数据_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="relative flex flex-col h-full p-4 animate-[fadeIn_0.3s_ease-out]">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-4 bg-[#0c2242]/50 p-4 border border-blue-500/20 rounded-sm">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-300 whitespace-nowrap">月份:</span>
                    <StyledInput type="month" value={filters.month} onChange={e => setFilters({ ...filters, month: e.target.value })} className="w-32" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-300 whitespace-nowrap">地市:</span>
                    <StyledSelect value={filters.city} onChange={e => setFilters({ ...filters, city: e.target.value })} className="w-32">
                        <option value="">全部</option>
                        {INNER_MONGOLIA_CITIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                    </StyledSelect>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-300 whitespace-nowrap">一级分类:</span>
                    <StyledSelect value={filters.cat1} onChange={e => setFilters({ ...filters, cat1: e.target.value })} className="w-32">
                        <option value="">全部</option>
                        <option value="云视讯">云视讯</option>
                    </StyledSelect>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-300 whitespace-nowrap">二级分类:</span>
                    <StyledSelect value={filters.cat2} onChange={e => setFilters({ ...filters, cat2: e.target.value })} className="w-32">
                        <option value="">全部</option>
                        <option value="云视讯硬件">云视讯硬件</option>
                        <option value="云视讯软件">云视讯软件</option>
                    </StyledSelect>
                </div>
                <StyledButton onClick={() => setPagination({ ...pagination, currentPage: 1 })} icon={<SearchIcon />} variant="toolbar">查询</StyledButton>
                {(filters.month !== '2024-03' || filters.city || filters.cat1 || filters.cat2) && (
                    <StyledButton onClick={() => setFilters({ month: '2024-03', city: '', cat1: '', cat2: '' })} variant="secondary" icon={<RefreshCwIcon />}>重置</StyledButton>
                )}
            </div>

            {/* Summary Metric */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gradient-to-r from-blue-600/20 to-blue-900/20 border border-blue-500/30 p-4 rounded-sm flex flex-col justify-center">
                    <span className="text-xs text-blue-300 mb-1">月份</span>
                    <span className="text-xl font-bold text-white">{filters.month || '2024-03'}</span>
                </div>
                <div className="bg-gradient-to-r from-blue-600/20 to-blue-900/20 border border-blue-500/30 p-4 rounded-sm flex flex-col justify-center">
                    <span className="text-xs text-blue-300 mb-1">本月全省云视讯总维护费用（元）</span>
                    <span className="text-2xl font-bold text-neon-blue">¥ {totalCost.toLocaleString()}</span>
                </div>
            </div>

            {/* Main Table */}
            <div className="flex-1 overflow-hidden flex flex-col border border-blue-500/30 bg-[#0A2744]/50 relative">
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10 bg-[#124979]/90 backdrop-blur-sm shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
                            <tr>
                                <Th className="text-blue-200">地市</Th>
                                <Th className="text-blue-200">一级分类</Th>
                                <Th className="text-blue-200">二级分类</Th>
                                <Th className="text-blue-200 text-right">维护量（路）</Th>
                                <Th className="text-blue-200 text-right">单价（元）</Th>
                                <Th className="text-blue-200 text-right">维护费用（元）</Th>
                                <Th className="text-blue-200 text-center">操作</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length > 0 ? paginatedData.map((item, index) => (
                                <tr key={item.id} className={`hover:bg-blue-500/10 transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-[#0A3458]/20'}`}>
                                    <Td className="text-blue-100">{item.city}</Td>
                                    <Td className="text-blue-100">{item.cat1}</Td>
                                    <Td className="text-blue-100">{item.cat2}</Td>
                                    <Td className="text-blue-100 text-right font-mono">{item.volume}</Td>
                                    <Td className="text-blue-100 text-right font-mono">{item.unitPrice.toFixed(2)}</Td>
                                    <Td className="text-neon-blue text-right font-mono font-bold">{item.totalCost.toLocaleString()}</Td>
                                    <Td className="text-center">
                                        <button 
                                            className="text-blue-400 hover:text-neon-blue underline text-xs"
                                            onClick={() => handleDrillDown(item)}
                                        >
                                            下钻详情
                                        </button>
                                    </Td>
                                </tr>
                            )) : (
                                <tr>
                                    <Td colSpan={7} className="text-center text-gray-400 py-8">暂无数据</Td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-[#1e293b]/50 h-[40px] shrink-0 border-t border-blue-500/20 flex items-center px-4 gap-4">
                    <StyledButton variant="toolbar" onClick={handleExport} icon={<DownloadIcon />} className="whitespace-nowrap h-8">导出</StyledButton>
                    <div className="flex-1 flex items-center text-[10px] text-blue-300/70 italic px-2">
                        * 维护量为截止统计月云视讯终端存量数
                    </div>
                    <Pagination 
                        currentPage={pagination.currentPage} 
                        totalItems={filteredData.length} 
                        pageSize={pagination.pageSize} 
                        onPageChange={(page) => setPagination({ ...pagination, currentPage: page })} 
                        onPageSizeChange={(s) => setPagination({ currentPage: 1, pageSize: s })}
                        className="py-0 w-auto"
                    />
                </div>
            </div>

            {/* Drill-down Modal */}
            {selectedRecord && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#0b1730] border border-blue-500/40 w-full max-w-6xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,210,255,0.3)]">
                        <div className="flex justify-between items-center p-4 border-b border-blue-500/30 bg-[#0c2242]">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <TrendingUpIcon className="w-5 h-5 text-neon-blue" />
                                维护量详情 - {selectedRecord.city} ({selectedRecord.month})
                            </h3>
                            <button onClick={() => setSelectedRecord(null)} className="text-gray-400 hover:text-white transition-colors">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-auto p-4 scrollbar-thin">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead className="sticky top-0 z-10 bg-[#1e3a5f]">
                                    <tr>
                                        <Th className="text-blue-200">产品实例标识</Th>
                                        <Th className="text-blue-200">客户名称</Th>
                                        <Th className="text-blue-200">客户编号</Th>
                                        <Th className="text-blue-200">一级分类</Th>
                                        <Th className="text-blue-200">二级分类</Th>
                                        <Th className="text-blue-200">终端型号</Th>
                                        <Th className="text-blue-200">设备序列号</Th>
                                        <Th className="text-blue-200">MAC地址</Th>
                                        <Th className="text-blue-200">地市</Th>
                                        <Th className="text-blue-200">安装地址</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedDetails.map((detail, idx) => (
                                        <tr key={detail.id} className={`hover:bg-blue-500/10 transition-colors ${idx % 2 === 0 ? 'bg-transparent' : 'bg-[#0A3458]/20'}`}>
                                            <Td className="text-blue-100">{detail.productInstanceId}</Td>
                                            <Td className="text-blue-100 truncate max-w-[150px]" title={detail.customerName}>{detail.customerName}</Td>
                                            <Td className="text-blue-100">{detail.customerCode}</Td>
                                            <Td className="text-blue-100">{detail.cat1}</Td>
                                            <Td className="text-blue-100">{detail.cat2}</Td>
                                            <Td className="text-blue-100">{detail.terminalModel}</Td>
                                            <Td className="text-blue-100">{detail.deviceSn}</Td>
                                            <Td className="text-blue-100 font-mono">{detail.macAddress}</Td>
                                            <Td className="text-blue-100">{detail.city}</Td>
                                            <Td className="text-blue-100 truncate max-w-[150px]" title={detail.address}>{detail.address}</Td>
                                        </tr>
                                    ))}
                                    {paginatedDetails.length === 0 && (
                                        <tr>
                                            <Td colSpan={10} className="text-center text-gray-400 py-8">暂无详情数据</Td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-2 border-t border-blue-500/30 bg-[#0c2242] flex items-center justify-between px-4">
                            <div className="flex items-center gap-4 flex-1">
                                <StyledButton variant="toolbar" onClick={() => alert('导出详情')} icon={<DownloadIcon />} className="whitespace-nowrap h-8">导出</StyledButton>
                                <Pagination 
                                    currentPage={detailPagination.currentPage} 
                                    pageSize={detailPagination.pageSize} 
                                    totalItems={(MOCK_CV_MAINTENANCE_DETAILS[selectedRecord.id] || []).length} 
                                    onPageChange={(page) => setDetailPagination({ ...detailPagination, currentPage: page })} 
                                    onPageSizeChange={(s) => setDetailPagination({ currentPage: 1, pageSize: s })} 
                                    className="py-0 w-full" 
                                />
                            </div>
                            <StyledButton onClick={() => setSelectedRecord(null)} className="ml-4">关闭</StyledButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CloudVideoFaultTicketDataView: React.FC = () => {
    const [filters, setFilters] = useState({ month: '2024-03', city: '', channel: '', faultReason: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [selectedChannel, setSelectedChannel] = useState<string>(''); 
    
    const [detailCurrentPage, setDetailCurrentPage] = useState(1);
    const [detailPageSize, setDetailPageSize] = useState(10);

    const aggregatedData = useMemo(() => {
        const filteredDetails = MOCK_CV_FAULT_TICKET_DETAILS.filter(d => {
            if (filters.month && d.month !== filters.month) return false;
            if (filters.city && d.city !== filters.city) return false;
            if (filters.channel && d.channel !== filters.channel) return false;
            if (filters.faultReason && d.faultReason !== filters.faultReason) return false;
            return true;
        });

        const cityMap = new Map<string, any>();
        filteredDetails.forEach(d => {
            const key = `${d.city}-${d.month}`;
            if (!cityMap.has(key)) {
                cityMap.set(key, { id: key, city: d.city, month: d.month, total: 0, hotline400: 0, hotline10086: 0, platform: 0, other: 0 });
            }
            const record = cityMap.get(key);
            record.total += 1;
            if (d.channel === '400热线') record.hotline400 += 1;
            else if (d.channel === '10086热线') record.hotline10086 += 1;
            else if (d.channel === '政企综调平台') record.platform += 1;
            else record.other += 1;
        });

        return Array.from(cityMap.values());
    }, [filters]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return aggregatedData.slice(start, start + pageSize);
    }, [aggregatedData, currentPage, pageSize]);

    const handleExport = () => {
        alert('导出云视讯报障工单数据');
    };

    const handleOpenDetail = (city: string, channel: string) => {
        setSelectedCity(city);
        setSelectedChannel(channel);
        setDetailCurrentPage(1);
        setIsDetailModalOpen(true);
    };

    const modalFilteredDetails = useMemo(() => {
        return MOCK_CV_FAULT_TICKET_DETAILS.filter(d => {
            if (filters.month && d.month !== filters.month) return false;
            if (selectedCity && d.city !== selectedCity) return false;
            if (selectedChannel && d.channel !== selectedChannel) return false;
            if (filters.faultReason && d.faultReason !== filters.faultReason) return false;
            return true;
        });
    }, [filters.month, filters.faultReason, selectedCity, selectedChannel]);

    const paginatedDetails = useMemo(() => {
        const start = (detailCurrentPage - 1) * detailPageSize;
        return modalFilteredDetails.slice(start, start + detailPageSize);
    }, [modalFilteredDetails, detailCurrentPage, detailPageSize]);

    const faultReasonBreakdown = useMemo(() => {
        const breakdown = new Map<string, number>();
        modalFilteredDetails.forEach(d => {
            const count = breakdown.get(d.faultReason) || 0;
            breakdown.set(d.faultReason, count + 1);
        });
        return Array.from(breakdown.entries()).map(([reason, count]) => ({ name: reason, value: count }));
    }, [modalFilteredDetails]);

    const mainViewChannelBreakdown = useMemo(() => {
        let hotline400 = 0;
        let hotline10086 = 0;
        let platform = 0;
        let other = 0;
        aggregatedData.forEach(d => {
            hotline400 += d.hotline400;
            hotline10086 += d.hotline10086;
            platform += d.platform;
            other += d.other;
        });
        return [
            { name: '400热线', value: hotline400 },
            { name: '10086热线', value: hotline10086 },
            { name: '政企综调平台', value: platform },
            { name: '其他', value: other },
        ].filter(item => item.value > 0);
    }, [aggregatedData]);

    const mainViewFaultReasonBreakdown = useMemo(() => {
        const breakdown = new Map<string, number>();
        const filteredDetails = MOCK_CV_FAULT_TICKET_DETAILS.filter(d => {
            if (filters.month && d.month !== filters.month) return false;
            if (filters.city && d.city !== filters.city) return false;
            if (filters.channel && d.channel !== filters.channel) return false;
            if (filters.faultReason && d.faultReason !== filters.faultReason) return false;
            return true;
        });
        filteredDetails.forEach(d => {
            const count = breakdown.get(d.faultReason) || 0;
            breakdown.set(d.faultReason, count + 1);
        });
        return Array.from(breakdown.entries()).map(([reason, count]) => ({ name: reason, value: count }));
    }, [filters]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="h-full flex flex-col relative p-4 animate-[fadeIn_0.3s_ease-out]">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-4 bg-[#0c2242]/50 p-4 border border-blue-500/20 rounded-sm">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-300 whitespace-nowrap">月份:</span>
                    <StyledInput type="month" className="w-32" value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })} />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-300 whitespace-nowrap">地市:</span>
                    <StyledSelect className="w-32" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })}>
                        <option value="">全部</option>
                        {INNER_MONGOLIA_CITIES.map(city => (
                            <option key={city.code} value={city.name}>{city.name}</option>
                        ))}
                    </StyledSelect>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-300 whitespace-nowrap">报障渠道:</span>
                    <StyledSelect className="w-40" value={filters.channel} onChange={(e) => setFilters({ ...filters, channel: e.target.value })}>
                        <option value="">全部</option>
                        <option value="400热线">400热线</option>
                        <option value="10086热线">10086热线</option>
                        <option value="政企综调平台">政企综调平台</option>
                        <option value="其他报障渠道">其他报障渠道</option>
                    </StyledSelect>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-300 whitespace-nowrap">故障原因:</span>
                    <StyledSelect className="w-40" value={filters.faultReason} onChange={(e) => setFilters({ ...filters, faultReason: e.target.value })}>
                        <option value="">全部</option>
                        <option value="客户侧原因">客户侧原因</option>
                        <option value="云视讯硬件原因">云视讯硬件原因</option>
                        <option value="接入网络原因">接入网络原因</option>
                        <option value="其他原因">其他原因</option>
                    </StyledSelect>
                </div>
                <StyledButton variant="toolbar" icon={<SearchIcon />} onClick={() => setCurrentPage(1)}>查询</StyledButton>
                {(filters.month !== '2024-03' || filters.city || filters.channel || filters.faultReason) && (
                    <StyledButton variant="secondary" icon={<RefreshCwIcon />} onClick={() => setFilters({ month: '2024-03', city: '', channel: '', faultReason: '' })}>重置</StyledButton>
                )}
            </div>

            {/* Charts Section */}
            <div className="flex gap-4 py-4 shrink-0 h-64">
                <div className="flex-1 bg-[#1e3a5f]/20 border border-blue-500/20 rounded-sm p-4 flex flex-col">
                    <h4 className="text-sm text-blue-200 mb-2 font-bold">各渠道报障量分布</h4>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mainViewChannelBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" vertical={false} />
                                <XAxis dataKey="name" stroke="#8ba3cb" fontSize={10} tickLine={false} axisLine={{ stroke: '#1e3a5f' }} />
                                <YAxis stroke="#8ba3cb" fontSize={10} tickLine={false} axisLine={false} />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#0A3458', borderColor: '#00d2ff', color: '#fff', fontSize: '12px' }}
                                    cursor={{ fill: '#1e3a5f', opacity: 0.4 }}
                                />
                                <Bar dataKey="value" fill="#00d2ff" radius={[2, 2, 0, 0]} barSize={40}>
                                    {mainViewChannelBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="flex-1 bg-[#1e3a5f]/20 border border-blue-500/20 rounded-sm p-4 flex flex-col">
                    <h4 className="text-sm text-blue-200 mb-2 font-bold">故障原因分类占比</h4>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={mainViewFaultReasonBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={{ stroke: '#8ba3cb', strokeWidth: 1 }}
                                >
                                    {mainViewFaultReasonBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#0A3458', borderColor: '#00d2ff', color: '#fff', fontSize: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-hidden flex flex-col border border-blue-500/30 bg-[#0A2744]/50 relative">
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10 bg-[#124979]/90 backdrop-blur-sm shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
                            <tr>
                                <Th className="text-blue-200">地市</Th>
                                <Th className="text-blue-200">月份</Th>
                                <Th className="text-blue-200">报障工单总量</Th>
                                <Th className="text-blue-200">400热线总报障量</Th>
                                <Th className="text-blue-200">10086热线总报障量</Th>
                                <Th className="text-blue-200">政企综调平台总报障量</Th>
                                <Th className="text-blue-200">其他报障渠道总报障量</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((row, index) => (
                                <tr key={row.id} className={`hover:bg-blue-500/10 transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-[#0A3458]/20'}`}>
                                    <Td className="text-blue-100">{row.city}</Td>
                                    <Td className="text-blue-100">{row.month}</Td>
                                    <Td className="text-neon-blue font-bold cursor-pointer hover:underline" onClick={() => handleOpenDetail(row.city, '')}>{row.total}</Td>
                                    <Td className="text-blue-300 cursor-pointer hover:underline" onClick={() => handleOpenDetail(row.city, '400热线')}>{row.hotline400}</Td>
                                    <Td className="text-blue-300 cursor-pointer hover:underline" onClick={() => handleOpenDetail(row.city, '10086热线')}>{row.hotline10086}</Td>
                                    <Td className="text-blue-300 cursor-pointer hover:underline" onClick={() => handleOpenDetail(row.city, '政企综调平台')}>{row.platform}</Td>
                                    <Td className="text-blue-300 cursor-pointer hover:underline" onClick={() => handleOpenDetail(row.city, '其他报障渠道')}>{row.other}</Td>
                                </tr>
                            ))}
                            {paginatedData.length === 0 && (
                                <tr>
                                    <Td colSpan={7} className="text-center text-gray-400 py-8">暂无数据</Td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-[#1e293b]/50 h-[40px] shrink-0 border-t border-blue-500/20 flex items-center px-4 gap-4">
                    <StyledButton variant="toolbar" onClick={handleExport} icon={<DownloadIcon />} className="whitespace-nowrap h-8">导出</StyledButton>
                    <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={aggregatedData.length} onPageChange={setCurrentPage} onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }} className="py-0 w-full" />
                </div>
            </div>

            {/* Drill-down Modal */}
            {isDetailModalOpen && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#0b1730] border border-blue-500/40 w-full max-w-7xl max-h-[95vh] flex flex-col shadow-[0_0_50px_rgba(0,210,255,0.3)]">
                        <div className="flex justify-between items-center p-4 border-b border-blue-500/30 bg-[#0c2242]">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <BellIcon className="w-5 h-5 text-neon-blue" />
                                报障工单详情 - {selectedCity} {selectedChannel ? `(${selectedChannel})` : ''}
                            </h3>
                            <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-white transition-colors"><XIcon className="w-6 h-6" /></button>
                        </div>
                        
                        <div className="flex-1 overflow-auto p-4 scrollbar-thin flex flex-col gap-4">
                            {/* Breakdown Section */}
                            <div className="bg-[#1e3a5f]/30 border border-blue-500/20 p-4 rounded-sm flex gap-8">
                                <div className="flex-1">
                                    <h4 className="text-sm text-blue-200 mb-2 font-bold border-b border-blue-500/30 pb-1">分故障原因分类报障数量</h4>
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="p-2 text-xs text-blue-300 border-b border-blue-500/20">报障渠道</th>
                                                <th className="p-2 text-xs text-blue-300 border-b border-blue-500/20">故障原因分类</th>
                                                <th className="p-2 text-xs text-blue-300 border-b border-blue-500/20">报障数量</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {faultReasonBreakdown.map((item, idx) => (
                                                <tr key={idx} className="border-b border-blue-500/10">
                                                    <td className="p-2 text-xs text-white">{selectedChannel || '全部渠道'}</td>
                                                    <td className="p-2 text-xs text-white">{item.name}</td>
                                                    <td className="p-2 text-xs text-neon-blue font-bold">{item.value}</td>
                                                </tr>
                                            ))}
                                            {faultReasonBreakdown.length === 0 && (
                                                <tr><td colSpan={3} className="p-2 text-center text-gray-400 text-xs">暂无数据</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="w-64 h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={faultReasonBreakdown}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={60}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {faultReasonBreakdown.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip 
                                                contentStyle={{ backgroundColor: '#0A3458', borderColor: '#00d2ff', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Detail Table */}
                            <div className="flex-1 overflow-auto border border-blue-500/20 rounded-sm">
                                <table className="w-full text-left border-collapse min-w-[1200px]">
                                    <thead className="sticky top-0 bg-[#1e3a5f] z-10">
                                        <tr>
                                            {['工单编号', '工单主题', '报障渠道', '故障原因分类', '客户编号', '客户名称', '产品实例标识', '报障来源地市', '当前处理环节', '处理人', '处理状态', '报障时间', '归档时间', '工单历时'].map(h => <th key={h} className="p-2 text-[10px] font-semibold text-blue-100 border-b border-blue-500/30 whitespace-nowrap">{h}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedDetails.map((detail) => (
                                            <tr key={detail.id} className="hover:bg-blue-500/10 border-b border-blue-500/10">
                                                <td className="p-2 text-[10px] text-blue-300 font-mono whitespace-nowrap">{detail.ticketNo}</td>
                                                <td className="p-2 text-[10px] text-white whitespace-nowrap truncate max-w-[150px]" title={detail.subject}>{detail.subject}</td>
                                                <td className="p-2 text-[10px] text-white whitespace-nowrap">{detail.channel}</td>
                                                <td className="p-2 text-[10px] text-white whitespace-nowrap">{detail.faultReason}</td>
                                                <td className="p-2 text-[10px] text-gray-400 font-mono whitespace-nowrap">{detail.customerCode}</td>
                                                <td className="p-2 text-[10px] text-white whitespace-nowrap truncate max-w-[150px]" title={detail.customerName}>{detail.customerName}</td>
                                                <td className="p-2 text-[10px] text-blue-300 font-mono whitespace-nowrap">{detail.productInstanceId}</td>
                                                <td className="p-2 text-[10px] text-white whitespace-nowrap">{detail.city}</td>
                                                <td className="p-2 text-[10px] text-white whitespace-nowrap">{detail.currentStep}</td>
                                                <td className="p-2 text-[10px] text-white whitespace-nowrap">{detail.handler}</td>
                                                <td className="p-2 text-[10px] text-white whitespace-nowrap">
                                                    <span className={`px-1.5 py-0.5 rounded-sm ${detail.status === '已解决' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                        {detail.status}
                                                    </span>
                                                </td>
                                                <td className="p-2 text-[10px] text-gray-400 whitespace-nowrap">{detail.reportTime}</td>
                                                <td className="p-2 text-[10px] text-gray-400 whitespace-nowrap">{detail.archiveTime}</td>
                                                <td className="p-2 text-[10px] text-white whitespace-nowrap">{detail.duration}</td>
                                            </tr>
                                        ))}
                                        {paginatedDetails.length === 0 && (
                                            <tr><td colSpan={14} className="p-4 text-center text-gray-400 text-xs">暂无数据</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="p-2 border-t border-blue-500/30 bg-[#0c2242] flex items-center justify-between px-4">
                            <div className="flex items-center gap-4 flex-1">
                                <StyledButton variant="toolbar" onClick={() => alert('导出详情')} icon={<DownloadIcon />} className="whitespace-nowrap h-8">导出</StyledButton>
                                <Pagination currentPage={detailCurrentPage} pageSize={detailPageSize} totalItems={modalFilteredDetails.length} onPageChange={setDetailCurrentPage} onPageSizeChange={(s) => { setDetailPageSize(s); setDetailCurrentPage(1); }} className="py-0 w-full" />
                            </div>
                            <StyledButton onClick={() => setIsDetailModalOpen(false)} className="ml-4">关闭</StyledButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface CloudVideoCostUnitRecord {
    id: string;
    city: string;
    businessType: '装机' | '移机' | '维护';
    cat1: string;
    cat2: string;
    unitPrice: number;
}

const MOCK_CV_COST_UNIT_DATA: CloudVideoCostUnitRecord[] = [
    { id: '1', city: '呼和浩特', businessType: '装机', cat1: '云视讯', cat2: '云视讯硬件', unitPrice: 200 },
    { id: '2', city: '包头', businessType: '维护', cat1: '云视讯', cat2: '云视讯硬件', unitPrice: 15 },
    { id: '3', city: '鄂尔多斯', businessType: '移机', cat1: '云视讯', cat2: '云视讯软件', unitPrice: 100 },
];

const CloudVideoCostUnitDataView: React.FC = () => {
    const [records, setRecords] = useState<CloudVideoCostUnitRecord[]>(MOCK_CV_COST_UNIT_DATA);
    const [filters, setFilters] = useState({ city: '', businessType: '', cat1: '', cat2: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<CloudVideoCostUnitRecord | null>(null);
    const [formData, setFormData] = useState<Partial<CloudVideoCostUnitRecord>>({});
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const filteredRecords = useMemo(() => {
        return records.filter(r => {
            if (filters.city && r.city !== filters.city) return false;
            if (filters.businessType && r.businessType !== filters.businessType) return false;
            if (filters.cat1 && r.cat1 !== filters.cat1) return false;
            if (filters.cat2 && !r.cat2.includes(filters.cat2)) return false;
            return true;
        });
    }, [records, filters]);

    const paginatedRecords = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredRecords.slice(start, start + pageSize);
    }, [filteredRecords, currentPage, pageSize]);

    const handleAdd = () => {
        setEditingRecord(null);
        setFormData({ businessType: '装机', cat1: '云视讯', cat2: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (record: CloudVideoCostUnitRecord) => {
        setEditingRecord(record);
        setFormData(record);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setDeleteConfirmId(id);
    };

    const confirmDelete = () => {
        if (deleteConfirmId) {
            setRecords(records.filter(r => r.id !== deleteConfirmId));
            setDeleteConfirmId(null);
        }
    };

    const handleSave = () => {
        if (!formData.city || !formData.businessType || !formData.cat1 || !formData.cat2 || formData.unitPrice === undefined) {
            alert('请填写完整信息！');
            return;
        }

        const isDuplicate = records.some(r => 
            r.id !== editingRecord?.id &&
            r.city === formData.city &&
            r.businessType === formData.businessType &&
            r.cat1 === formData.cat1 &&
            r.cat2 === formData.cat2
        );

        if (isDuplicate) {
            alert('同一地市、业务类型、分类组合下仅允许存在一条有效单价记录！');
            return;
        }

        if (editingRecord) {
            setRecords(records.map(r => r.id === editingRecord.id ? { ...r, ...formData } as CloudVideoCostUnitRecord : r));
        } else {
            setRecords([...records, { ...formData, id: Date.now().toString() } as CloudVideoCostUnitRecord]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="relative flex flex-col h-full bg-transparent p-4 gap-4 overflow-hidden">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-4 bg-[#0c2242]/50 p-4 border border-blue-500/20 rounded-sm">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-300 whitespace-nowrap">地市:</span>
                    <StyledSelect className="w-32" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })}>
                        <option value="">全部</option>
                        {INNER_MONGOLIA_CITIES.map(city => (
                            <option key={city.code} value={city.name}>{city.name}</option>
                        ))}
                    </StyledSelect>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-300 whitespace-nowrap">业务类型:</span>
                    <StyledSelect className="w-32" value={filters.businessType} onChange={(e) => setFilters({ ...filters, businessType: e.target.value })}>
                        <option value="">全部</option>
                        <option value="装机">装机</option>
                        <option value="移机">移机</option>
                        <option value="维护">维护</option>
                    </StyledSelect>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-300 whitespace-nowrap">一级分类:</span>
                    <StyledSelect className="w-32" value={filters.cat1} onChange={(e) => setFilters({ ...filters, cat1: e.target.value })}>
                        <option value="">全部</option>
                        <option value="云视讯">云视讯</option>
                    </StyledSelect>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-300 whitespace-nowrap">二级分类:</span>
                    <StyledInput className="w-32" placeholder="模糊搜索" value={filters.cat2} onChange={(e) => setFilters({ ...filters, cat2: e.target.value })} />
                </div>
                <StyledButton variant="toolbar" icon={<SearchIcon />} onClick={() => setCurrentPage(1)}>查询</StyledButton>
                <StyledButton variant="secondary" icon={<RefreshCwIcon />} onClick={() => setFilters({ city: '', businessType: '', cat1: '', cat2: '' })}>重置</StyledButton>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-hidden flex flex-col bg-[#0c2242]/30 border border-blue-500/20 rounded-sm">
                <div className="overflow-auto flex-1 scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-[#1e3a5f] z-10">
                            <tr>
                                {['地市', '业务类型', '一级分类', '二级分类', '单价 (元)', '操作'].map(h => (
                                    <Th key={h} className="text-blue-100">{h}</Th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRecords.map((row) => (
                                <tr key={row.id} className="hover:bg-blue-500/10 border-b border-blue-500/10 transition-colors group">
                                    <Td className="text-white">{row.city}</Td>
                                    <Td className="text-gray-300">{row.businessType}</Td>
                                    <Td className="text-gray-300">{row.cat1}</Td>
                                    <Td className="text-gray-300">{row.cat2}</Td>
                                    <Td className="text-neon-blue font-bold">{row.unitPrice}</Td>
                                    <Td>
                                        <div className="flex gap-3">
                                            <button onClick={() => handleEdit(row)} className="text-blue-400 hover:text-blue-300 transition-colors" title="编辑">
                                                <EditIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(row.id)} className="text-red-400 hover:text-red-300 transition-colors" title="删除">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </Td>
                                </tr>
                            ))}
                            {paginatedRecords.length === 0 && (
                                <tr>
                                    <Td colSpan={6} className="p-8 text-center text-gray-400">暂无数据</Td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-[#1e293b]/50 h-[40px] shrink-0 border-t border-blue-500/20 flex items-center px-4 gap-4">
                <div className="flex gap-2">
                    <StyledButton variant="secondary" icon={<UploadIcon />} onClick={() => alert('批量导入')} className="h-8 whitespace-nowrap">导入</StyledButton>
                    <StyledButton variant="secondary" icon={<DownloadIcon />} onClick={() => alert('批量导出')} className="h-8 whitespace-nowrap">导出</StyledButton>
                    <StyledButton variant="primary" icon={<PlusCircleIcon />} onClick={handleAdd} className="h-8 whitespace-nowrap">新增单价</StyledButton>
                </div>
                <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={filteredRecords.length} onPageChange={setCurrentPage} onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }} className="py-0 w-full" />
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#0b1730] border border-blue-500/40 w-[500px] flex flex-col shadow-[0_0_50px_rgba(0,210,255,0.3)] rounded-sm">
                        <div className="flex justify-between items-center p-4 border-b border-blue-500/30 bg-[#0c2242]">
                            <h3 className="text-lg font-bold text-white">{editingRecord ? '编辑费用单价' : '新增费用单价'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors"><XIcon className="w-6 h-6" /></button>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <span className="w-24 text-sm text-blue-200 text-right">地市 <span className="text-red-500">*</span></span>
                                <StyledSelect className="flex-1" value={formData.city || ''} onChange={e => setFormData({ ...formData, city: e.target.value })}>
                                    <option value="">请选择地市</option>
                                    {INNER_MONGOLIA_CITIES.map(city => (
                                        <option key={city.code} value={city.name}>{city.name}</option>
                                    ))}
                                </StyledSelect>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="w-24 text-sm text-blue-200 text-right">业务类型 <span className="text-red-500">*</span></span>
                                <StyledSelect className="flex-1" value={formData.businessType || ''} onChange={e => setFormData({ ...formData, businessType: e.target.value as any })}>
                                    <option value="装机">装机</option>
                                    <option value="移机">移机</option>
                                    <option value="维护">维护</option>
                                </StyledSelect>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="w-24 text-sm text-blue-200 text-right">一级分类 <span className="text-red-500">*</span></span>
                                <StyledSelect className="flex-1" value={formData.cat1 || ''} onChange={e => setFormData({ ...formData, cat1: e.target.value })}>
                                    <option value="云视讯">云视讯</option>
                                </StyledSelect>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="w-24 text-sm text-blue-200 text-right">二级分类 <span className="text-red-500">*</span></span>
                                <StyledInput className="flex-1" placeholder="请输入二级分类" value={formData.cat2 || ''} onChange={e => setFormData({ ...formData, cat2: e.target.value })} />
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="w-24 text-sm text-blue-200 text-right">单价 (元) <span className="text-red-500">*</span></span>
                                <StyledInput type="number" className="flex-1" placeholder="请输入单价" value={formData.unitPrice || ''} onChange={e => setFormData({ ...formData, unitPrice: Number(e.target.value) })} />
                            </div>
                        </div>
                        <div className="p-4 border-t border-blue-500/30 bg-[#0c2242] flex justify-end gap-4">
                            <StyledButton variant="secondary" onClick={() => setIsModalOpen(false)}>取消</StyledButton>
                            <StyledButton variant="primary" onClick={handleSave}>保存</StyledButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#0b1730] border border-blue-500/40 w-[400px] flex flex-col shadow-[0_0_50px_rgba(0,210,255,0.3)] rounded-sm">
                        <div className="flex justify-between items-center p-4 border-b border-blue-500/30 bg-[#0c2242]">
                            <h3 className="text-lg font-bold text-white">确认删除</h3>
                            <button onClick={() => setDeleteConfirmId(null)} className="text-gray-400 hover:text-white transition-colors"><XIcon className="w-6 h-6" /></button>
                        </div>
                        <div className="p-6 text-white text-center">
                            确定要删除该单价配置吗？此操作不可恢复。
                        </div>
                        <div className="p-4 border-t border-blue-500/30 bg-[#0c2242] flex justify-end gap-4">
                            <StyledButton variant="secondary" onClick={() => setDeleteConfirmId(null)}>取消</StyledButton>
                            <StyledButton variant="primary" onClick={confirmDelete} className="!bg-red-500/20 !text-red-400 !border-red-500/50 hover:!bg-red-500/40">确定删除</StyledButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const CloudVideoFinanceDataView: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [tabs, setTabs] = useState<{ id: string, label: string }[]>([
        { id: 'install-remove', label: '装移机数据管理' }
    ]);
    const [activeTabId, setActiveTabId] = useState<string>('install-remove');
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, tabId: string } | null>(null);

    React.useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const sidebarItems = [
        { id: 'install-remove', label: '装移机数据管理', icon: <BarChartIcon /> },
        { id: 'maintenance', label: '维护量数据管理', icon: <TrendingUpIcon /> },
        { id: 'fault-ticket', label: '报障工单数据管理', icon: <BellIcon /> },
        { id: 'cost-unit', label: '费用单价管理', icon: <SettingsIcon /> },
    ];

    const handleSidebarClick = (item: { id: string, label: string }) => {
        if (!tabs.find(t => t.id === item.id)) {
            setTabs([...tabs, { id: item.id, label: item.label }]);
        }
        setActiveTabId(item.id);
    };

    const handleCloseTab = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (tabs.length === 1) return; // Keep at least one tab
        
        const newTabs = tabs.filter(t => t.id !== id);
        setTabs(newTabs);
        if (activeTabId === id) {
            setActiveTabId(newTabs[newTabs.length - 1].id);
        }
    };

    const renderEmptyContent = (title: string) => (
        <div className="flex-1 flex items-center justify-center text-gray-400 bg-[#0A2744] border-l border-blue-500/30">
            <div className="text-center">
                <div className="text-4xl mb-4 opacity-50">🚧</div>
                <h2 className="text-xl font-bold text-blue-200 mb-2">{title}</h2>
                <p>具体菜单页面内容待定，参照千里眼业财数据设计</p>
            </div>
        </div>
    );

    return (
        <div className="flex flex-1 overflow-hidden h-full">
            {/* Sidebar */}
            <div className={`${isSidebarCollapsed ? 'w-[53px]' : 'w-48'} bg-transparent border border-blue-500/30 mr-2 transition-all duration-500 ease-in-out flex flex-col shadow-[0_0_15px_rgba(0,0,0,0.3)]`}>
                <div className={`h-[35px] flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-3'} border-b border-blue-500/20 bg-transparent shrink-0`}> 
                    {!isSidebarCollapsed && <span className="text-blue-100 font-bold tracking-wider text-[12px] whitespace-nowrap">云视讯业财数据</span>}
                    <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="text-blue-300 hover:text-white transition-colors flex items-center justify-center"> 
                        <div className="w-5 h-5 flex items-center justify-center">{isSidebarCollapsed ? <SidebarOpenIcon /> : <SidebarCloseIcon />}</div> 
                    </button> 
                </div>
                <div className="flex-1 py-2 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                    {sidebarItems.map(item => (
                        <div 
                            key={item.id} 
                            onClick={() => handleSidebarClick(item)} 
                            className={`relative flex items-center gap-3 px-3 py-2 cursor-pointer transition-all mx-1 rounded-sm ${activeTabId === item.id ? 'bg-gradient-to-r from-blue-600/40 to-blue-600/10 text-white border-l-2 border-neon-blue shadow-[0_0_10px_rgba(0,210,255,0.2)]' : 'text-white/80 hover:bg-white/10 hover:text-white border-l-2 border-transparent'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                            title={isSidebarCollapsed ? item.label : ''}
                        >
                            <div className="w-5 h-5 flex items-center justify-center shrink-0 relative">{item.icon}</div>
                            {!isSidebarCollapsed && <span className="text-sm whitespace-nowrap truncate">{item.label}</span>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full border border-blue-500/30 shadow-[inset_0_0_20px_rgba(0,133,208,0.1)] bg-[#0c1a35]/10">
                {/* Internal Tabs */}
                <div className="flex items-end gap-[6px] pl-0 pr-4 h-[35px] mt-px border-b border-blue-500/20 bg-[#0c1a35]/20 shrink-0 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
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
                                <span className={`relative z-10 text-sm font-medium tracking-wide whitespace-nowrap truncate max-w-[120px] ${isActive ? 'text-white font-bold' : 'text-gray-300'}`}>{tab.label}</span> 
                                <button onClick={(e) => handleCloseTab(e, tab.id)} className={`relative z-10 ml-2 p-0.5 rounded-full hover:bg-blue-500/20 transition-colors ${isActive ? 'opacity-100 text-white' : 'opacity-0 group-hover:opacity-100 text-gray-400'}`}> <XIcon className="w-3 h-3" /> </button> 
                            </div> 
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden relative">
                    {tabs.map(tab => (
                        <div key={tab.id} className={`absolute inset-0 flex flex-col ${activeTabId === tab.id ? 'z-10' : 'z-0 hidden'}`}>
                            {tab.id === 'install-remove' ? <CloudVideoInstallRemoveView /> : 
                             tab.id === 'maintenance' ? <CloudVideoMaintenanceDataView /> :
                             tab.id === 'fault-ticket' ? <CloudVideoFaultTicketDataView /> :
                             tab.id === 'cost-unit' ? <CloudVideoCostUnitDataView /> :
                             renderEmptyContent(tab.label)}
                        </div>
                    ))}
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div 
                    className="fixed z-[9999] bg-[#0A3458]/95 border border-blue-500/30 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md py-1 w-32 rounded-sm animate-[fadeIn_0.1s_ease-out]"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <div 
                        className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-xs text-blue-100 hover:text-white transition-colors" 
                        onClick={() => {
                            if (tabs.length > 1) {
                                const newTabs = tabs.filter(t => t.id !== contextMenu.tabId);
                                setTabs(newTabs);
                                if (activeTabId === contextMenu.tabId) {
                                    setActiveTabId(newTabs[newTabs.length - 1].id);
                                }
                            }
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
                            }
                            setContextMenu(null);
                        }}
                    >
                        关闭其他标签
                    </div>
                </div>
            )}
        </div>
    );
};
