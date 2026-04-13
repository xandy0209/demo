import React, { useState, useEffect, useMemo } from 'react';
import { OfflineTerminalAnalysisRecord, OfflineTerminalDetailRecord } from '../types';
import { generateOfflineTerminalMockData, generateOfflineTerminalDetailMockData, INNER_MONGOLIA_CITIES } from '../constants';
import { StyledInput, StyledButton, StyledSelect } from './UI';
import { SearchIcon, DownloadIcon, XIcon, ClockIcon, RefreshCwIcon, BotIcon } from './Icons';
import { Pagination } from './Pagination';

export const BusinessOfflineTerminalView: React.FC = () => {
    const [data, setData] = useState<OfflineTerminalAnalysisRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        city: '',
        month: ''
    });
    
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 15
    });
    
    const [detailView, setDetailView] = useState<{ isOpen: boolean, record: OfflineTerminalAnalysisRecord | null }>({
        isOpen: false,
        record: null
    });
    
    const [detailData, setDetailData] = useState<OfflineTerminalDetailRecord[]>([]);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailPagination, setDetailPagination] = useState({
        currentPage: 1,
        pageSize: 15
    });

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setData(generateOfflineTerminalMockData(100));
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchCity = !filter.city || item.city === filter.city;
            const matchMonth = !filter.month || item.time === filter.month;
            return matchCity && matchMonth;
        });
    }, [data, filter]);

    const paginatedData = useMemo(() => {
        const start = (pagination.currentPage - 1) * pagination.pageSize;
        return filteredData.slice(start, start + pagination.pageSize);
    }, [filteredData, pagination]);

    const paginatedDetailData = useMemo(() => {
        const start = (detailPagination.currentPage - 1) * detailPagination.pageSize;
        return detailData.slice(start, start + detailPagination.pageSize);
    }, [detailData, detailPagination]);

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleReset = () => {
        setFilter({
            city: '',
            month: ''
        });
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleOpenDetail = (record: OfflineTerminalAnalysisRecord) => {
        setDetailView({ isOpen: true, record });
        setDetailPagination(prev => ({ ...prev, currentPage: 1 }));
        setDetailLoading(true);
        setTimeout(() => {
            setDetailData(generateOfflineTerminalDetailMockData(50));
            setDetailLoading(false);
        }, 600);
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent border border-blue-500/30 shadow-[inset_0_0_20px_rgba(0,133,208,0.1)] relative">
            {/* Header / Filters */}
            <div className="bg-transparent p-3 border-b border-blue-500/20 flex flex-wrap items-center gap-3 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white">统计月份:</span>
                    <StyledInput 
                        type="month" 
                        value={filter.month} 
                        onChange={(e) => setFilter(prev => ({...prev, month: e.target.value}))}
                        className="w-40 text-xs"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white">地市:</span>
                    <StyledSelect 
                        value={filter.city} 
                        onChange={(e) => setFilter(prev => ({...prev, city: e.target.value}))}
                        className="w-32 text-xs"
                    >
                        <option value="">全部</option>
                        {INNER_MONGOLIA_CITIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                    </StyledSelect>
                </div>
                <div className="flex items-center gap-3">
                    <StyledButton variant="toolbar" onClick={handleSearch} icon={<SearchIcon className="w-4 h-4" />} className="text-xs">查询</StyledButton>
                    <StyledButton variant="toolbar" onClick={handleReset} icon={<RefreshCwIcon className="w-4 h-4" />} className="text-xs">重置</StyledButton>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto bg-transparent scrollbar-thin">
                <table className="w-full text-left text-xs whitespace-nowrap border-separate border-spacing-0">
                    <thead className="sticky top-0 bg-[#0c2242] text-blue-200 z-10 shadow-sm">
                        <tr>
                            <th className="p-3 border-b border-blue-500/20 font-medium">统计时间</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium">地市</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium text-center">业务总数</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium text-center">连续三月终端不在线业务数</th>
                            <th className="p-3 border-b border-blue-500/20 font-medium text-center">连续三月终端不在线业务占比 (%)</th>
                        </tr>
                    </thead>
                    <tbody className="text-white">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-10 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-blue-400 text-sm">正在分析离线终端数据...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((item) => (
                                <tr key={item.id} className="hover:bg-[#1e3a5f]/60 transition-colors border-b border-blue-500/10 last:border-0">
                                    <td className="p-3 border-b border-blue-500/10 font-mono">{item.time}</td>
                                    <td className="p-3 border-b border-blue-500/10">{item.city}</td>
                                    <td className="p-3 border-b border-blue-500/10 text-center font-mono">{item.totalBusiness}</td>
                                    <td className="p-3 border-b border-blue-500/10 text-center">
                                        <button 
                                            onClick={() => handleOpenDetail(item)}
                                            className="text-red-400 hover:underline font-mono"
                                        >
                                            {item.offlineThreeMonthsCount}
                                        </button>
                                    </td>
                                    <td className="p-3 border-b border-blue-500/10 text-center font-mono">{item.offlineThreeMonthsRatio}%</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-10 text-center text-blue-300/50 border-b border-blue-500/10 italic">暂无统计数据</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="bg-[#1e293b]/50 border-t border-blue-500/20 flex items-center justify-between px-4 py-2 shrink-0">
                <div className="flex items-center gap-4">
                    <StyledButton variant="toolbar" icon={<DownloadIcon className="w-4 h-4" />} className="text-xs">导出</StyledButton>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-[10px] text-blue-400/70">
                        共 <span className="text-neon-blue font-bold">{filteredData.length}</span> 条统计记录
                    </div>
                    <Pagination 
                        currentPage={pagination.currentPage}
                        pageSize={pagination.pageSize}
                        totalItems={filteredData.length}
                        onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
                        onPageSizeChange={(size) => setPagination(prev => ({ ...prev, pageSize: size, currentPage: 1 }))}
                        className="py-0 px-0 justify-end"
                    />
                </div>
            </div>

            {/* Detail Modal */}
            {detailView.isOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#0b1730] border border-blue-500/30 w-full h-full flex flex-col shadow-2xl rounded-sm">
                        <div className="py-2 px-4 border-b border-blue-500/20 flex items-center justify-between bg-[#0c2242]/50">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-3 bg-blue-500"></div>
                                <h3 className="text-white font-medium text-sm">
                                    连续三月终端不在线业务详情 - {detailView.record?.city} ({detailView.record?.time})
                                </h3>
                            </div>
                            <button 
                                onClick={() => setDetailView({ isOpen: false, record: null })}
                                className="text-blue-400 hover:text-white transition-colors"
                            >
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="p-4 flex-1 flex flex-col overflow-hidden gap-4">
                            <div className="flex-1 overflow-auto bg-transparent scrollbar-thin border border-blue-500/20 rounded-sm">
                                <table className="w-full text-left text-[11px] whitespace-nowrap border-separate border-spacing-0 min-w-[1500px]">
                                    <thead className="sticky top-0 bg-[#0c2242] text-blue-200 z-10 shadow-sm">
                                        <tr>
                                            <th className="p-3 border-b border-blue-500/20 font-medium">采集时间</th>
                                            <th className="p-3 border-b border-blue-500/20 font-medium">客户名称</th>
                                            <th className="p-3 border-b border-blue-500/20 font-medium">客户编号</th>
                                            <th className="p-3 border-b border-blue-500/20 font-medium">宽带账号</th>
                                            <th className="p-3 border-b border-blue-500/20 font-medium">省份</th>
                                            <th className="p-3 border-b border-blue-500/20 font-medium">地市</th>
                                            <th className="p-3 border-b border-blue-500/20 font-medium">终端类型</th>
                                            <th className="p-3 border-b border-blue-500/20 font-medium">终端MAC</th>
                                            <th className="p-3 border-b border-blue-500/20 font-medium">终端串号</th>
                                            <th className="p-3 border-b border-blue-500/20 font-medium">订购带宽</th>
                                            <th className="p-3 border-b border-blue-500/20 font-medium">上线时间</th>
                                            <th className="p-3 border-b border-blue-500/20 font-medium">下线时间</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-white">
                                        {detailLoading ? (
                                            <tr>
                                                <td colSpan={12} className="p-10 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                        <span className="text-blue-400 text-sm">正在加载详情数据...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : paginatedDetailData.length > 0 ? (
                                            paginatedDetailData.map((item) => (
                                                <tr key={item.id} className="hover:bg-[#1e3a5f]/60 transition-colors border-b border-blue-500/10 last:border-0">
                                                    <td className="p-3 border-b border-blue-500/10 font-mono">{item.collectionTime}</td>
                                                    <td className="p-3 border-b border-blue-500/10">{item.customerName}</td>
                                                    <td className="p-3 border-b border-blue-500/10 font-mono">{item.customerCode}</td>
                                                    <td className="p-3 border-b border-blue-500/10 font-mono">{item.broadbandAccount}</td>
                                                    <td className="p-3 border-b border-blue-500/10">{item.province}</td>
                                                    <td className="p-3 border-b border-blue-500/10">{item.city}</td>
                                                    <td className="p-3 border-b border-blue-500/10">{item.terminalType}</td>
                                                    <td className="p-3 border-b border-blue-500/10 font-mono">{item.terminalMac}</td>
                                                    <td className="p-3 border-b border-blue-500/10 font-mono">{item.terminalSn}</td>
                                                    <td className="p-3 border-b border-blue-500/10 font-mono">{item.orderedBandwidth}</td>
                                                    <td className="p-3 border-b border-blue-500/10 font-mono">{item.onlineTime}</td>
                                                    <td className="p-3 border-b border-blue-500/10 font-mono text-red-400">{item.offlineTime}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={12} className="p-10 text-center text-blue-300/50 border-b border-blue-500/10 italic">暂无详情数据</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <div className="h-[44px] border-t border-blue-500/20 bg-[#0c2242]/30 flex items-center justify-between px-6">
                            <div className="flex items-center gap-4">
                                <StyledButton variant="toolbar" icon={<DownloadIcon className="w-3.5 h-3.5" />} className="text-[11px] py-1">导出</StyledButton>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-[10px] text-blue-400/70">
                                    共 <span className="text-neon-blue font-bold">{detailData.length}</span> 条详情记录
                                </div>
                                <Pagination 
                                    currentPage={detailPagination.currentPage}
                                    pageSize={detailPagination.pageSize}
                                    totalItems={detailData.length}
                                    onPageChange={(page) => setDetailPagination(prev => ({ ...prev, currentPage: page }))}
                                    onPageSizeChange={(size) => setDetailPagination(prev => ({ ...prev, pageSize: size, currentPage: 1 }))}
                                    className="py-0 px-0 justify-end scale-90 origin-right"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
