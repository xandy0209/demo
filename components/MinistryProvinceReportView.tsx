import React, { useState, useMemo } from 'react';
import { StyledInput, StyledSelect, StyledButton } from './UI';
import { DownloadIcon, SearchIcon, RefreshCwIcon } from './Icons';
import { Pagination } from './Pagination';

interface ReportRecord {
    id: string;
    provinceCode: string;
    city: string;
    customerName: string;
    customerCode: string;
    bandwidth: string;
    broadbandAccount: string;
    terminalMac: string;
    terminalSerial: string;
    exceptionType: string;
    statsTime: string;
    reportTime: string;
}

interface QIReportRecord {
    id: string;
    provinceCode: string;
    city: string;
    dataMonth: string;
    orderType: string;
    totalOrders: number;
    totalInspected: number;
    passedInspected: number;
    passRate: string;
    inspectionMethod: string;
    reportTime: string;
}

interface OfflineReportRecord {
    id: string;
    provinceCode: string;
    city: string;
    month: string;
    customerName: string;
    customerCode: string;
    bandwidth: string;
    broadbandAccount: string;
    terminalMac: string;
    terminalSerial: string;
    lastOfflineTime: string;
    reportTime: string;
}

const generateMockData = (count: number): ReportRecord[] => {
    return Array.from({ length: count }, (_, i) => ({
        id: `report-${i}`,
        provinceCode: '150000',
        city: ['呼和浩特市', '包头市', '乌海市', '赤峰市'][i % 4],
        customerName: `客户名称-${i}`,
        customerCode: `CUST-${10000 + i}`,
        bandwidth: ['100M', '200M', '500M', '1000M'][i % 4],
        broadbandAccount: `KD-${1000000 + i}`,
        terminalMac: `00:1A:2B:3C:4D:${(i % 100).toString().padStart(2, '0')}`,
        terminalSerial: `SN-${20260000 + i}`,
        exceptionType: ['零流量', '高带宽占用'][i % 2],
        statsTime: '2026-04-20',
        reportTime: '2026-04-21 10:00:00',
    }));
};

const generateMockOfflineData = (count: number): OfflineReportRecord[] => {
    return Array.from({ length: count }, (_, i) => ({
        id: `offline-${i}`,
        provinceCode: '150000',
        city: ['呼和浩特市', '包头市', '乌海市', '赤峰市'][i % 4],
        month: '2026-04',
        customerName: `客户-${i}`,
        customerCode: `CUST-${20000 + i}`,
        bandwidth: '100M',
        broadbandAccount: `KD-${2000000 + i}`,
        terminalMac: `00:1A:2B:3C:4E:${(i % 100).toString().padStart(2, '0')}`,
        terminalSerial: `SN-${30260000 + i}`,
        lastOfflineTime: '2026-04-10 12:00:00',
        reportTime: '2026-04-21 10:00:00',
    }));
};

const generateMockQIData = (count: number): QIReportRecord[] => {
    const rawData = Array.from({ length: count }, (_, i) => {
        const total = 100 + (i % 10) * 10;
        const inspected = Math.floor(total * 0.8);
        const passed = Math.floor(inspected * 0.9);
        return {
            id: `qi-${i}`,
            provinceCode: '150000',
            city: ['呼和浩特市', '包头市', '乌海市', '赤峰市'][i % 4],
            dataMonth: '2026-04',
            orderType: ['开通', '投诉'][i % 2],
            totalOrders: total,
            totalInspected: inspected,
            passedInspected: passed,
            inspectionMethod: ['图片质检', '语音质检', '视频质检'][i % 3],
            reportTime: '2026-04-21 10:00:00',
        };
    });

    const aggregatedMap = new Map<string, any>();
    rawData.forEach(item => {
        const key = `${item.city}-${item.dataMonth}-${item.orderType}`;
        if (!aggregatedMap.has(key)) {
            aggregatedMap.set(key, { ...item, inspectionMethods: new Set([item.inspectionMethod]) });
        } else {
            const existing = aggregatedMap.get(key);
            existing.totalOrders += item.totalOrders;
            existing.totalInspected += item.totalInspected;
            existing.passedInspected += item.passedInspected;
            existing.inspectionMethods.add(item.inspectionMethod);
        }
    });

    return Array.from(aggregatedMap.values()).map((item, i) => ({
        id: `qi-${i}`,
        provinceCode: item.provinceCode,
        city: item.city,
        dataMonth: item.dataMonth,
        orderType: item.orderType,
        totalOrders: item.totalOrders,
        totalInspected: item.totalInspected,
        passedInspected: item.passedInspected,
        passRate: item.totalInspected > 0 ? `${((item.passedInspected / item.totalInspected) * 100).toFixed(1)}%` : '0.0%',
        inspectionMethod: Array.from(item.inspectionMethods).join(','),
        reportTime: item.reportTime,
    }));
};

export const MinistryProvinceReportView: React.FC = () => {
    const [data] = useState<ReportRecord[]>(generateMockData(50));
    const [qiData] = useState<QIReportRecord[]>(generateMockQIData(40));
    const [offlineData] = useState<OfflineReportRecord[]>(generateMockOfflineData(30));
    const [filters, setFilters] = useState({ keyInfo: '', terminalInfo: '', exceptionType: '', statsTime: '2026-04-20' });
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 15;

    // Quality Inspection State
    const [qiFilters, setQiFilters] = useState({ month: '2026-04', orderType: '', inspectionMethod: '' });
    const [qiCurrentPage, setQiCurrentPage] = useState(1);

    // Offline State
    const [olFilters, setOlFilters] = useState({ keyInfo: '', month: '2026-04' });
    const [olCurrentPage, setOlCurrentPage] = useState(1);

    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchKey = !filters.keyInfo || item.customerName.includes(filters.keyInfo) || item.customerCode.includes(filters.keyInfo) || item.broadbandAccount.includes(filters.keyInfo);
            const matchTerminal = !filters.terminalInfo || item.terminalMac.includes(filters.terminalInfo) || item.terminalSerial.includes(filters.terminalInfo);
            const matchType = !filters.exceptionType || item.exceptionType === filters.exceptionType;
            return matchKey && matchTerminal && matchType;
        });
    }, [data, filters]);

    const filteredQiData = useMemo(() => {
        return qiData.filter(item => {
            const matchMonth = !qiFilters.month || item.dataMonth === qiFilters.month;
            const matchType = !qiFilters.orderType || item.orderType === qiFilters.orderType;
            const matchMethod = !qiFilters.inspectionMethod || item.inspectionMethod === qiFilters.inspectionMethod;
            return matchMonth && matchType && matchMethod;
        });
    }, [qiData, qiFilters]);

    const filteredOfflineData = useMemo(() => {
        return offlineData.filter(item => {
            const matchKey = !olFilters.keyInfo || item.customerName.includes(olFilters.keyInfo) || item.customerCode.includes(olFilters.keyInfo) || item.broadbandAccount.includes(olFilters.keyInfo) || item.terminalMac.includes(olFilters.keyInfo) || item.terminalSerial.includes(olFilters.keyInfo);
            const matchMonth = !olFilters.month || item.month === olFilters.month;
            return matchKey && matchMonth;
        });
    }, [offlineData, olFilters]);

    const paginatedData = useMemo(() => {
        return filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    }, [filteredData, currentPage, pageSize]);

    const qiPaginatedData = useMemo(() => {
        return filteredQiData.slice((qiCurrentPage - 1) * pageSize, qiCurrentPage * pageSize);
    }, [filteredQiData, qiCurrentPage, pageSize]);

    const olPaginatedData = useMemo(() => {
        return filteredOfflineData.slice((olCurrentPage - 1) * pageSize, olCurrentPage * pageSize);
    }, [filteredOfflineData, olCurrentPage, pageSize]);

    const [activeTab, setActiveTab] = useState('statistical');

    return (
        <div className="flex flex-col h-full">
            {/* Tab Bar Container */}
            <div className="flex items-end gap-[6px] pl-0 pr-4 h-[35px] border-b border-blue-500/20 bg-[#0c1a35]/20 shrink-0 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                {[ 
                    { id: 'statistical', label: '高带宽占用及零流量业务' },
                    { id: 'monitoring', label: '开通投诉工单质检结果' },
                    { id: 'reporting', label: '长期未上线业务清单' }
                ].map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <div 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                relative flex items-center justify-center h-full cursor-pointer transition-all duration-300 px-3 overflow-hidden group
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
                            <span className={`relative z-10 text-sm font-medium tracking-wide whitespace-nowrap ${isActive ? 'text-white font-bold' : 'text-gray-300'}`}>{tab.label}</span> 
                        </div>
                    );
                })}
            </div>

            {/* Content Container */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent border border-blue-500/30 shadow-[inset_0_0_20px_rgba(0,133,208,0.1)] relative">
                {activeTab === 'statistical' && (
                    <>
                        {/* Filter Bar */}
                        <div className="bg-transparent p-3 border-b border-blue-500/20 flex flex-wrap items-center gap-3 shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-white">关键信息:</span>
                                <StyledInput className="w-56 text-xs" placeholder="客户名称\客户编号\宽带账号" value={filters.keyInfo} onChange={(e) => setFilters(p => ({...p, keyInfo: e.target.value}))} />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-white">终端信息:</span>
                                <StyledInput className="w-48 text-xs" placeholder="终端MAC\终端串号" value={filters.terminalInfo} onChange={(e) => setFilters(p => ({...p, terminalInfo: e.target.value}))} />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-white">异常类型:</span>
                                <StyledSelect className="w-36 text-xs" value={filters.exceptionType} onChange={(e) => setFilters(p => ({...p, exceptionType: e.target.value}))}>
                                    <option value="">请选择</option>
                                    <option value="零流量">零流量</option>
                                    <option value="高带宽占用">高带宽占用</option>
                                </StyledSelect>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-white">统计时间:</span>
                                <StyledInput type="date" className="w-36 text-xs" value={filters.statsTime} onChange={(e) => setFilters(p => ({...p, statsTime: e.target.value}))} />
                            </div>
                            <StyledButton variant="toolbar" icon={<SearchIcon className="w-4 h-4"/>} className="text-xs">查询</StyledButton>
                            <StyledButton variant="toolbar" icon={<RefreshCwIcon className="w-4 h-4"/>} className="text-xs">重置</StyledButton>
                        </div>

                        {/* Main Table */}
                        <div className="flex-1 overflow-auto bg-transparent scrollbar-thin">
                            <table className="w-full text-left text-xs whitespace-nowrap border-separate border-spacing-0">
                                <thead className="sticky top-0 bg-[#0c2242] text-blue-200 z-10 shadow-sm">
                                    <tr>
                                        {['省份编码', '地市', '客户名称', '客户编号', '订购业务带宽', '宽带账号', '终端MAC', '终端串号', '流量异常类型', '统计时间', '上报时间'].map(h => (
                                            <th key={h} className="p-3 border-b border-blue-500/20 font-medium">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="text-white">
                                    {paginatedData.map(item => (
                                        <tr key={item.id} className="hover:bg-[#1e3a5f]/60 transition-colors border-b border-blue-500/10 text-xs">
                                            <td className="p-3 border-b border-blue-500/10">{item.provinceCode}</td>
                                            <td className="p-3 border-b border-blue-500/10">{item.city}</td>
                                            <td className="p-3 border-b border-blue-500/10">{item.customerName}</td>
                                            <td className="p-3 border-b border-blue-500/10 font-mono">{item.customerCode}</td>
                                            <td className="p-3 border-b border-blue-500/10">{item.bandwidth}</td>
                                            <td className="p-3 border-b border-blue-500/10 font-mono">{item.broadbandAccount}</td>
                                            <td className="p-3 border-b border-blue-500/10 font-mono">{item.terminalMac}</td>
                                            <td className="p-3 border-b border-blue-500/10 font-mono">{item.terminalSerial}</td>
                                            <td className={`p-3 border-b border-blue-500/10 ${item.exceptionType === '零流量' ? 'text-red-400' : 'text-yellow-400'}`}>{item.exceptionType}</td>
                                            <td className="p-3 border-b border-blue-500/10 font-mono">{item.statsTime}</td>
                                            <td className="p-3 border-b border-blue-500/10 font-mono">{item.reportTime}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Footer */}
                        <div className="bg-[#1e293b]/50 border-t border-blue-500/20 flex items-center justify-between px-4 py-2 shrink-0">
                            <StyledButton variant="toolbar" icon={<DownloadIcon className="w-4 h-4" />} className="text-xs">导出</StyledButton>
                            <Pagination 
                                currentPage={currentPage} 
                                totalPages={Math.ceil(filteredData.length / pageSize)} 
                                onPageChange={setCurrentPage} 
                                className="py-0 px-0 justify-end"
                            />
                        </div>
                    </>
                )}
                {activeTab === 'monitoring' && (
                    <>
                        {/* Filter Bar */}
                        <div className="bg-transparent p-3 border-b border-blue-500/20 flex flex-wrap items-center gap-3 shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-white">数据月份:</span>
                                <StyledInput type="month" className="w-36 text-xs" value={qiFilters.month} onChange={(e) => setQiFilters(p => ({...p, month: e.target.value}))} />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-white">工单类型:</span>
                                <StyledSelect className="w-36 text-xs" value={qiFilters.orderType} onChange={(e) => setQiFilters(p => ({...p, orderType: e.target.value}))}>
                                    <option value="">请选择</option>
                                    <option value="开通">开通</option>
                                    <option value="投诉">投诉</option>
                                </StyledSelect>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-white">质检手段:</span>
                                <StyledSelect className="w-36 text-xs" value={qiFilters.inspectionMethod} onChange={(e) => setQiFilters(p => ({...p, inspectionMethod: e.target.value}))}>
                                    <option value="">请选择</option>
                                    <option value="图片质检">图片质检</option>
                                    <option value="语音质检">语音质检</option>
                                    <option value="视频质检">视频质检</option>
                                </StyledSelect>
                            </div>
                            <StyledButton variant="toolbar" icon={<SearchIcon className="w-4 h-4"/>} className="text-xs">查询</StyledButton>
                            <StyledButton variant="toolbar" icon={<RefreshCwIcon className="w-4 h-4"/>} className="text-xs">重置</StyledButton>
                        </div>
                        
                        {/* Table */}
                        <div className="flex-1 overflow-auto bg-transparent scrollbar-thin">
                            <table className="w-full text-left text-xs whitespace-nowrap border-separate border-spacing-0">
                                <thead className="sticky top-0 bg-[#0c2242] text-blue-200 z-10 shadow-sm">
                                    <tr>
                                        {['省份编码', '地市', '数据月份', '工单类型', '工单总数', '质检工单总数', '通过质检工单数', '质检通过率', '质检手段', '上报时间'].map(h => (
                                            <th key={h} className="p-3 border-b border-blue-500/20 font-medium">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="text-white">
                                    {qiPaginatedData.map(item => (
                                        <tr key={item.id} className="hover:bg-[#1e3a5f]/60 transition-colors border-b border-blue-500/10 text-xs">
                                            <td className="p-3 border-b border-blue-500/10">{item.provinceCode}</td>
                                            <td className="p-3 border-b border-blue-500/10">{item.city}</td>
                                            <td className="p-3 border-b border-blue-500/10">{item.dataMonth}</td>
                                            <td className="p-3 border-b border-blue-500/10">{item.orderType}</td>
                                            <td className="p-3 border-b border-blue-500/10 font-mono">{item.totalOrders}</td>
                                            <td className="p-3 border-b border-blue-500/10 font-mono">{item.totalInspected}</td>
                                            <td className="p-3 border-b border-blue-500/10 font-mono">{item.passedInspected}</td>
                                            <td className="p-3 border-b border-blue-500/10 font-mono">{item.passRate}</td>
                                            <td className="p-3 border-b border-blue-500/10">{item.inspectionMethod}</td>
                                            <td className="p-3 border-b border-blue-500/10 font-mono">{item.reportTime}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="bg-[#1e293b]/50 border-t border-blue-500/20 flex items-center justify-between px-4 py-2 shrink-0">
                            <StyledButton variant="toolbar" icon={<DownloadIcon className="w-4 h-4" />} className="text-xs">导出</StyledButton>
                            <Pagination 
                                currentPage={qiCurrentPage} 
                                totalPages={Math.ceil(filteredQiData.length / pageSize)} 
                                onPageChange={setQiCurrentPage} 
                                className="py-0 px-0 justify-end"
                            />
                        </div>
                    </>
                )}
                {activeTab === 'reporting' && (
                    <>
                        {/* Filter Bar */}
                        <div className="bg-transparent p-3 border-b border-blue-500/20 flex flex-wrap items-center gap-3 shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-white">关键信息:</span>
                                <StyledInput className="w-56 text-xs" placeholder="客户名称/客户编号/宽带账号/终端MAC/终端串号" value={olFilters.keyInfo} onChange={(e) => setOlFilters(p => ({...p, keyInfo: e.target.value}))} />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-white">数据月份:</span>
                                <StyledInput type="month" className="w-36 text-xs" value={olFilters.month} onChange={(e) => setOlFilters(p => ({...p, month: e.target.value}))} />
                            </div>
                            <StyledButton variant="toolbar" icon={<SearchIcon className="w-4 h-4"/>} className="text-xs">查询</StyledButton>
                            <StyledButton variant="toolbar" icon={<RefreshCwIcon className="w-4 h-4"/>} className="text-xs">重置</StyledButton>
                        </div>
                        
                        {/* Table */}
                        <div className="flex-1 overflow-auto bg-transparent scrollbar-thin">
                            <table className="w-full text-left text-xs whitespace-nowrap border-separate border-spacing-0">
                                <thead className="sticky top-0 bg-[#0c2242] text-blue-200 z-10 shadow-sm">
                                    <tr>
                                        {['省份编码', '地市', '月份', '客户名称', '客户编号', '订购业务带宽', '宽带账号', '终端MAC', '终端串号', '最后下线时间', '上报时间'].map(h => (
                                            <th key={h} className="p-3 border-b border-blue-500/20 font-medium">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="text-white">
                                    {olPaginatedData.map(item => (
                                        <tr key={item.id} className="hover:bg-[#1e3a5f]/60 transition-colors border-b border-blue-500/10 text-xs">
                                            <td className="p-3 border-b border-blue-500/10">{item.provinceCode}</td>
                                            <td className="p-3 border-b border-blue-500/10">{item.city}</td>
                                            <td className="p-3 border-b border-blue-500/10 font-mono">{item.month}</td>
                                            <td className="p-3 border-b border-blue-500/10">{item.customerName}</td>
                                            <td className="p-3 border-b border-blue-500/10 font-mono">{item.customerCode}</td>
                                            <td className="p-3 border-b border-blue-500/10">{item.bandwidth}</td>
                                            <td className="p-3 border-b border-blue-500/10 font-mono">{item.broadbandAccount}</td>
                                            <td className="p-3 border-b border-blue-500/10 font-mono">{item.terminalMac}</td>
                                            <td className="p-3 border-b border-blue-500/10 font-mono">{item.terminalSerial}</td>
                                            <td className="p-3 border-b border-blue-500/10 font-mono">{item.lastOfflineTime}</td>
                                            <td className="p-3 border-b border-blue-500/10 font-mono">{item.reportTime}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="bg-[#1e293b]/50 border-t border-blue-500/20 flex items-center justify-between px-4 py-2 shrink-0">
                            <StyledButton variant="toolbar" icon={<DownloadIcon className="w-4 h-4" />} className="text-xs">导出</StyledButton>
                            <Pagination 
                                currentPage={olCurrentPage} 
                                totalPages={Math.ceil(filteredOfflineData.length / pageSize)} 
                                onPageChange={setOlCurrentPage} 
                                className="py-0 px-0 justify-end"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );

};
