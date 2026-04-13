import React, { useState, useEffect, useMemo } from 'react';
import { FaultEventRecord } from '../types';
import { generateFaultEventMockData } from '../constants';
import { StyledInput, StyledSelect, StyledButton } from './UI';
import { Pagination } from './Pagination';
import { SearchIcon, DownloadIcon, RefreshCwIcon, XIcon, ZoomInIcon, ZoomOutIcon } from './Icons';

export const FaultEventMonitoringView: React.FC = () => {
    const [data, setData] = useState<FaultEventRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [showSnapshot, setShowSnapshot] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);

    const [filters, setFilters] = useState({
        keyword: '',
        businessType: '',
        recognitionResult: '',
        eventStatus: '活动',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        // Simulate initial data fetch
        const mockData = generateFaultEventMockData(50);
        setData(mockData);
        setLoading(false);
    }, []);

    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchKeyword = !filters.keyword || 
                item.groupCustomerName.includes(filters.keyword) || 
                item.groupCustomerCode.includes(filters.keyword) || 
                item.productInstance.includes(filters.keyword) || 
                item.circuitCode.includes(filters.keyword);
            const matchResult = !filters.recognitionResult || item.recognitionResult === filters.recognitionResult;
            const matchBusinessType = !filters.businessType || item.businessType === filters.businessType;
            const matchStatus = !filters.eventStatus || item.eventStatus === filters.eventStatus;
            
            // Date filtering
            let matchDate = true;
            if (filters.startDate || filters.endDate) {
                const itemDate = new Date(item.eventTime.replace(' ', 'T')).getTime();
                if (filters.startDate) {
                    matchDate = matchDate && itemDate >= new Date(filters.startDate).getTime();
                }
                if (filters.endDate) {
                    matchDate = matchDate && itemDate <= new Date(filters.endDate).getTime();
                }
            }

            return matchKeyword && matchResult && matchBusinessType && matchStatus && matchDate;
        });
    }, [data, filters]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage, pageSize]);

    const handleSearch = () => {
        setCurrentPage(1);
    };

    const handleReset = () => {
        setFilters({
            keyword: '',
            businessType: '',
            recognitionResult: '',
            eventStatus: '活动',
            startDate: '',
            endDate: ''
        });
        setCurrentPage(1);
    };

    const handleExport = () => {
        alert('正在导出数据...');
    };

    return (
        <div className="relative flex-1 flex flex-col h-full overflow-hidden bg-transparent border border-blue-500/30 shadow-[inset_0_0_20px_rgba(0,133,208,0.1)] text-white">
            {/* Filter Bar */}
            <div className="bg-transparent p-3 border-b border-blue-500/20 flex flex-wrap items-center justify-between gap-y-3 gap-x-6 shrink-0">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <div className="flex items-center gap-2">
                        <StyledInput 
                            placeholder="客户名称/客户编号/产品实例/电路代号" 
                            className="w-64"
                            value={filters.keyword}
                            onChange={(e) => setFilters({...filters, keyword: e.target.value})}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-300 whitespace-nowrap">业务类型:</span>
                        <StyledSelect 
                            className="w-32"
                            value={filters.businessType}
                            onChange={(e) => setFilters({...filters, businessType: e.target.value})}
                        >
                            <option value="">全部</option>
                            <option value="数据专线">数据专线</option>
                            <option value="互联网专线">互联网专线</option>
                            <option value="语音专线">语音专线</option>
                            <option value="MPLS-VPN专线">MPLS-VPN专线</option>
                            <option value="APN专线">APN专线</option>
                        </StyledSelect>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-300 whitespace-nowrap">识别结果:</span>
                        <StyledSelect 
                            className="w-32"
                            value={filters.recognitionResult}
                            onChange={(e) => setFilters({...filters, recognitionResult: e.target.value})}
                        >
                            <option value="">全部</option>
                            <option value="业务中断">业务中断</option>
                            <option value="保护降级">保护降级</option>
                        </StyledSelect>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-300 whitespace-nowrap">事件状态:</span>
                        <StyledSelect 
                            className="w-24"
                            value={filters.eventStatus}
                            onChange={(e) => setFilters({...filters, eventStatus: e.target.value})}
                        >
                            <option value="">全部</option>
                            <option value="活动">活动</option>
                            <option value="历史">历史</option>
                        </StyledSelect>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-300 whitespace-nowrap">产生时间:</span>
                        <StyledInput 
                            type="date" 
                            className="w-36"
                            value={filters.startDate}
                            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                        />
                        <span className="text-blue-400">-</span>
                        <StyledInput 
                            type="date" 
                            className="w-36"
                            value={filters.endDate}
                            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                    <StyledButton variant="toolbar" onClick={handleSearch} icon={<SearchIcon />}>
                        查询
                    </StyledButton>
                    <StyledButton variant="secondary" onClick={handleReset} icon={<RefreshCwIcon />}>
                        重置
                    </StyledButton>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-auto bg-transparent scrollbar-thin">
                <table className="w-full text-left text-sm whitespace-nowrap border-separate border-spacing-0">
                    <thead className="sticky top-0 z-10 bg-[#0c2242] text-white shadow-sm">
                        <tr>
                            <th className="p-3 font-semibold border-b border-blue-500/40">事件状态</th>
                            <th className="p-3 font-semibold border-b border-blue-500/40">事件编号</th>
                            <th className="p-3 font-semibold border-b border-blue-500/40">客户编号</th>
                            <th className="p-3 font-semibold border-b border-blue-500/40">客户名称</th>
                            <th className="p-3 font-semibold border-b border-blue-500/40">业务类型</th>
                            <th className="p-3 font-semibold border-b border-blue-500/40">产品实例标识</th>
                            <th className="p-3 font-semibold border-b border-blue-500/40">电路代号</th>
                            <th className="p-3 font-semibold border-b border-blue-500/40">识别结果</th>
                            <th className="p-3 font-semibold border-b border-blue-500/40">事件产生时间</th>
                            <th className="p-3 font-semibold border-b border-blue-500/40">故障产生时间</th>
                            <th className="p-3 font-semibold border-b border-blue-500/40">故障恢复时间</th>
                            <th className="p-3 font-semibold border-b border-blue-500/40 text-center sticky right-0 z-20 bg-[#0c2242] shadow-[-5px_0_10px_rgba(0,0,0,0.1)] border-l border-blue-500/20">事件快照</th>
                        </tr>
                    </thead>
                    <tbody className="text-white">
                        {loading ? (
                            <tr>
                                <td colSpan={12} className="p-8 text-center text-blue-300/50 border-b border-blue-500/10 italic">加载中...</td>
                            </tr>
                        ) : paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={12} className="p-8 text-center text-blue-300/50 border-b border-blue-500/10 italic">暂无匹配的故障事件数据</td>
                            </tr>
                        ) : paginatedData.map((item) => (
                            <tr key={item.id} className="hover:bg-blue-600/10 transition-colors border-b border-blue-500/10 group">
                                <td className="p-3 border-b border-blue-500/10">
                                    <span className={`px-2 py-0.5 rounded-sm text-[10px] border ${
                                        item.eventStatus === '活动' ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'bg-gray-500/20 text-gray-400 border-gray-500/40'
                                    }`}>
                                        {item.eventStatus}
                                    </span>
                                </td>
                                <td className="p-3 border-b border-blue-500/10 font-mono text-gray-400">{item.eventNo}</td>
                                <td className="p-3 border-b border-blue-500/10 font-mono text-gray-400">{item.groupCustomerCode}</td>
                                <td className="p-3 border-b border-blue-500/10">{item.groupCustomerName}</td>
                                <td className="p-3 border-b border-blue-500/10">{item.businessType}</td>
                                <td className="p-3 border-b border-blue-500/10 font-mono text-blue-300">{item.productInstance}</td>
                                <td className="p-3 border-b border-blue-500/10 font-mono text-blue-300">{item.circuitCode}</td>
                                <td className="p-3 border-b border-blue-500/10">
                                    <span className={`px-2 py-0.5 rounded-sm text-[10px] border ${
                                        item.recognitionResult === '业务中断' ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                                    }`}>
                                        {item.recognitionResult}
                                    </span>
                                </td>
                                <td className="p-3 border-b border-blue-500/10 font-mono text-blue-300">{item.eventTime}</td>
                                <td className="p-3 border-b border-blue-500/10 font-mono text-blue-300">{item.faultTime}</td>
                                <td className="p-3 border-b border-blue-500/10 font-mono text-blue-300">{item.recoveryTime}</td>
                                <td className="p-3 border-b border-blue-500/10 text-center sticky right-0 z-10 bg-[#0b1730] shadow-[-5px_0_10px_rgba(0,0,0,0.1)] border-l border-blue-500/20">
                                    <button 
                                        className="text-neon-blue hover:text-blue-300 transition-colors text-xs underline underline-offset-2"
                                        onClick={() => setShowSnapshot(item.snapshotUrl)}
                                    >
                                        查看快照
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="h-10 bg-transparent border-t border-blue-500/20 flex items-center justify-between px-3 shrink-0">
                <div className="flex items-center">
                    <StyledButton variant="secondary" onClick={handleExport} className="h-7" icon={<DownloadIcon className="w-3.5 h-3.5" />}>
                        导出
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

            {/* Snapshot Modal */}
            {showSnapshot && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#0b1730] border border-blue-500/40 shadow-[0_0_50px_rgba(0,133,208,0.3)] flex flex-col max-w-[90vw] max-h-[70vh] relative overflow-hidden">
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
                                    onClick={() => { setShowSnapshot(null); setZoom(1); }} 
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
                                    src={showSnapshot} 
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
