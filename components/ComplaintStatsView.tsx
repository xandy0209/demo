
import React, { useState, useMemo, useEffect } from 'react';
import { StyledButton, StyledSelect, StyledInput } from './UI';
import { Pagination } from './Pagination';
import { DownloadIcon, SearchIcon, RefreshCwIcon } from './Icons';
import { INNER_MONGOLIA_CITIES } from '../constants';

// Helper for table header cells
const Th = ({ children, className = "", ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={`p-3 font-semibold border-b border-blue-500/40 whitespace-nowrap text-xs ${className}`} {...props}>
    {children}
  </th>
);

const businessCategories = ['专线', '企宽'];
const serviceTypes = ['数据专线', '互联网专线', '语音专线', 'MPLS-VPN专线'];
const faultTypes = ['网络故障（客响）', '网络故障（传输）', '网络故障（承载）', '客户故障'];
const customers = ["腾讯科技", "阿里巴巴", "字节跳动", "工商银行", "招商银行", "国家电网", "蒙牛集团", "伊利集团", "内蒙古电力", "包钢集团"];

// --- Mock Data Generators ---

const generateVolumeData = () => {
    const data = [];
    const months = ['2025-01', '2024-12'];
    let id = 0;
    for (const month of months) {
        for (const city of INNER_MONGOLIA_CITIES) {
            for (const category of businessCategories) {
                for (const fault of faultTypes) {
                    data.push({
                        id: id++,
                        city: city.name,
                        month,
                        productType: category,
                        faultType: fault,
                        count: Math.floor(Math.random() * 20) + 5
                    });
                }
            }
        }
    }
    return data;
};

const generateTimelinessData = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: i,
        city: INNER_MONGOLIA_CITIES[Math.floor(Math.random() * INNER_MONGOLIA_CITIES.length)].name,
        month: '2025-01',
        productType: businessCategories[Math.floor(Math.random() * businessCategories.length)],
        rate: (Math.random() * 20 + 80).toFixed(2) + '%'
    }));
};

const generateRepeatedData = (count: number) => {
    return Array.from({ length: count }).map((_, i) => {
        const category = businessCategories[Math.floor(Math.random() * businessCategories.length)];
        return {
            id: i,
            city: INNER_MONGOLIA_CITIES[Math.floor(Math.random() * INNER_MONGOLIA_CITIES.length)].name,
            month: '2025-01',
            productType: category,
            serviceType: category === '专线' ? serviceTypes[Math.floor(Math.random() * serviceTypes.length)] : '',
            businessId: `209${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`,
            count: Math.floor(Math.random() * 5) + 2,
            customerName: customers[Math.floor(Math.random() * customers.length)],
            customerCode: `CUST-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`
        };
    });
};

const generateAvailabilityData = (count: number) => {
    return Array.from({ length: count }).map((_, i) => {
        const category = businessCategories[Math.floor(Math.random() * businessCategories.length)];
        return {
            id: i,
            city: INNER_MONGOLIA_CITIES[Math.floor(Math.random() * INNER_MONGOLIA_CITIES.length)].name,
            month: '2025-01',
            productType: category,
            serviceType: category === '专线' ? serviceTypes[Math.floor(Math.random() * serviceTypes.length)] : '',
            businessId: `209${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`,
            rate: (Math.random() * 5 + 95).toFixed(4) + '%',
            customerName: customers[Math.floor(Math.random() * customers.length)],
            customerCode: `CUST-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`
        };
    });
};

const MOCK_VOLUME = generateVolumeData();
const MOCK_TIMELINESS = generateTimelinessData(30);
const MOCK_REPEATED = generateRepeatedData(20);
const MOCK_AVAILABILITY = generateAvailabilityData(20);

export const ComplaintStatsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'volume' | 'timeliness' | 'repeated' | 'availability'>('volume');
    const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 15 });

    // State for filters
    const [subTabFilters, setSubTabFilters] = useState<Record<string, { month: string; city: string; category?: string }>>({
        volume: { month: '2025-01', city: '' },
        timeliness: { month: '2025-01', city: '' },
        repeated: { month: '2025-01', city: '' },
        availability: { month: '2025-01', city: '', category: '' }
    });

    const [appliedFilters, setAppliedFilters] = useState<{ month: string; city: string; category?: string }>({
        month: '2025-01', city: '', category: ''
    });

    const currentInputs = subTabFilters[activeTab] || { month: '2025-01', city: '', category: '' };

    const updateFilter = (key: string, value: string) => {
        setSubTabFilters(prev => ({
            ...prev,
            [activeTab]: { ...(prev[activeTab] || { month: '2025-01', city: '' }), [key]: value }
        }));
    };

    const handleSearch = () => {
        setPagination({ ...pagination, currentPage: 1 });
        setAppliedFilters(currentInputs);
    };

    const handleReset = () => {
        const resetValue = { month: '2025-01', city: '', category: '' };
        setSubTabFilters(prev => ({
            ...prev,
            [activeTab]: resetValue
        }));
        setAppliedFilters(resetValue);
        setPagination({ ...pagination, currentPage: 1 });
    };

    useEffect(() => {
        setAppliedFilters(subTabFilters[activeTab] || { month: '2025-01', city: '', category: '' });
        setPagination({ ...pagination, currentPage: 1 });
    }, [activeTab]);

    const currentData = useMemo(() => {
        let data: any[] = [];
        switch (activeTab) {
            case 'volume': {
                let base = [...MOCK_VOLUME];
                
                // 1. Filter by Month
                if (appliedFilters.month) {
                    base = base.filter(d => d.month === appliedFilters.month);
                }
                
                // 2. Aggregate by Region and Month to get counts for each fault type
                const groups: Record<string, any> = {};
                base.forEach(d => {
                    const key = `${d.city}-${d.month}`;
                    if (!groups[key]) {
                        groups[key] = { 
                            city: d.city, 
                            month: d.month,
                            '专线_网络故障（客响）': 0,
                            '专线_网络故障（传输）': 0,
                            '专线_网络故障（承载）': 0,
                            '专线_客户故障': 0,
                            '企宽_网络故障（客响）': 0,
                            '企宽_网络故障（传输）': 0,
                            '企宽_网络故障（承载）': 0,
                            '企宽_客户故障': 0
                        };
                    }
                    if (faultTypes.includes(d.faultType)) {
                        const prefix = d.productType === '专线' ? '专线_' : '企宽_';
                        groups[key][prefix + d.faultType] += d.count;
                    }
                });

                let aggregated = Object.values(groups);

                // 3. Handle Region "All"
                if (!appliedFilters.city) {
                    const wholeRegion: any = {
                        city: '全区',
                        month: appliedFilters.month || '2025-01',
                        '专线_网络故障（客响）': 0,
                        '专线_网络故障（传输）': 0,
                        '专线_网络故障（承载）': 0,
                        '专线_客户故障': 0,
                        '企宽_网络故障（客响）': 0,
                        '企宽_网络故障（传输）': 0,
                        '企宽_网络故障（承载）': 0,
                        '企宽_客户故障': 0
                    };
                    aggregated.forEach(d => {
                        faultTypes.forEach(t => {
                            wholeRegion['专线_' + t] += d['专线_' + t];
                            wholeRegion['企宽_' + t] += d['企宽_' + t];
                        });
                    });
                    data = [wholeRegion, ...aggregated];
                } else if (appliedFilters.city === '全区') {
                    const wholeRegion: any = {
                        city: '全区',
                        month: appliedFilters.month || '2025-01',
                        '专线_网络故障（客响）': 0,
                        '专线_网络故障（传输）': 0,
                        '专线_网络故障（承载）': 0,
                        '专线_客户故障': 0,
                        '企宽_网络故障（客响）': 0,
                        '企宽_网络故障（传输）': 0,
                        '企宽_网络故障（承载）': 0,
                        '企宽_客户故障': 0
                    };
                    aggregated.forEach(d => {
                        faultTypes.forEach(t => {
                            wholeRegion['专线_' + t] += d['专线_' + t];
                            wholeRegion['企宽_' + t] += d['企宽_' + t];
                        });
                    });
                    data = [wholeRegion];
                } else {
                    data = aggregated.filter(d => d.city === appliedFilters.city);
                }

                // Re-assign IDs and calculate total
                data = data.map((d, index) => {
                    const total专线 = faultTypes.reduce((sum, t) => sum + (d['专线_' + t] || 0), 0);
                    const total企宽 = faultTypes.reduce((sum, t) => sum + (d['企宽_' + t] || 0), 0);
                    return { ...d, id: `vol-${index}`, total专线, total企宽 };
                });
                break;
            }
            case 'timeliness': {
                let base = [...MOCK_TIMELINESS];
                if (appliedFilters.month) {
                    base = base.filter(d => d.month === appliedFilters.month);
                }
                
                const groups: Record<string, any> = {};
                base.forEach(d => {
                    const key = `${d.city}-${d.month}`;
                    if (!groups[key]) {
                        groups[key] = { 
                            city: d.city, 
                            month: d.month, 
                            zxTotalRate: 0, zxCount: 0,
                            qkTotalRate: 0, qkCount: 0 
                        };
                    }
                    if (d.productType === '专线') {
                        groups[key].zxTotalRate += parseFloat(d.rate);
                        groups[key].zxCount += 1;
                    } else {
                        groups[key].qkTotalRate += parseFloat(d.rate);
                        groups[key].qkCount += 1;
                    }
                });
                
                let aggregated = Object.values(groups).map((g: any) => ({
                    ...g,
                    zxRate: g.zxCount > 0 ? (g.zxTotalRate / g.zxCount).toFixed(2) + '%' : '-',
                    qkRate: g.qkCount > 0 ? (g.qkTotalRate / g.qkCount).toFixed(2) + '%' : '-'
                }));

                if (!appliedFilters.city) {
                    const zxTotal = aggregated.filter(d => d.zxRate !== '-').reduce((sum, d) => sum + parseFloat(d.zxRate), 0);
                    const zxLen = aggregated.filter(d => d.zxRate !== '-').length;
                    const qkTotal = aggregated.filter(d => d.qkRate !== '-').reduce((sum, d) => sum + parseFloat(d.qkRate), 0);
                    const qkLen = aggregated.filter(d => d.qkRate !== '-').length;
                    
                    const avgZxRate = zxLen > 0 ? (zxTotal / zxLen).toFixed(2) + '%' : '-';
                    const avgQkRate = qkLen > 0 ? (qkTotal / qkLen).toFixed(2) + '%' : '-';
                    
                    data = [{ city: '全区', month: appliedFilters.month || '2025-01', zxRate: avgZxRate, qkRate: avgQkRate }, ...aggregated];
                } else if (appliedFilters.city === '全区') {
                    const zxTotal = aggregated.filter(d => d.zxRate !== '-').reduce((sum, d) => sum + parseFloat(d.zxRate), 0);
                    const zxLen = aggregated.filter(d => d.zxRate !== '-').length;
                    const qkTotal = aggregated.filter(d => d.qkRate !== '-').reduce((sum, d) => sum + parseFloat(d.qkRate), 0);
                    const qkLen = aggregated.filter(d => d.qkRate !== '-').length;
                    
                    const avgZxRate = zxLen > 0 ? (zxTotal / zxLen).toFixed(2) + '%' : '-';
                    const avgQkRate = qkLen > 0 ? (qkTotal / qkLen).toFixed(2) + '%' : '-';
                    
                    data = [{ city: '全区', month: appliedFilters.month || '2025-01', zxRate: avgZxRate, qkRate: avgQkRate }];
                } else {
                    data = aggregated.filter(d => d.city === appliedFilters.city);
                }
                data = data.map((d, i) => ({ ...d, id: `time-${i}` }));
                break;
            }
            case 'repeated': {
                const base = MOCK_REPEATED.filter(d => 
                    (!appliedFilters.month || d.month === appliedFilters.month)
                );
                
                const groups: Record<string, any> = {};
                const targetMonth = appliedFilters.month || '2025-01';

                // Initialize with all cities to ensure they are all included
                INNER_MONGOLIA_CITIES.forEach(city => {
                    const key = `${city.name}-${targetMonth}`;
                    groups[key] = { 
                        city: city.name, 
                        month: targetMonth, 
                        zxCount: 0, 
                        qkCount: 0 
                    };
                });

                base.forEach(d => {
                    const key = `${d.city}-${d.month}`;
                    if (groups[key]) {
                        if (d.productType === '专线') {
                            groups[key].zxCount += d.count;
                        } else {
                            groups[key].qkCount += d.count;
                        }
                    }
                });

                let aggregated = Object.values(groups);

                if (!appliedFilters.city) {
                    const wholeRegion = {
                        city: '全区',
                        month: targetMonth,
                        zxCount: aggregated.reduce((sum, d: any) => sum + d.zxCount, 0),
                        qkCount: aggregated.reduce((sum, d: any) => sum + d.qkCount, 0)
                    };
                    data = [wholeRegion, ...aggregated];
                } else if (appliedFilters.city === '全区') {
                    const wholeRegion = {
                        city: '全区',
                        month: targetMonth,
                        zxCount: aggregated.reduce((sum, d: any) => sum + d.zxCount, 0),
                        qkCount: aggregated.reduce((sum, d: any) => sum + d.qkCount, 0)
                    };
                    data = [wholeRegion];
                } else {
                    data = aggregated.filter((d: any) => d.city === appliedFilters.city);
                }
                data = data.map((d, i) => ({ ...d, id: `rep-${i}` }));
                break;
            }
            case 'availability': {
                let base = MOCK_AVAILABILITY.filter(d => 
                    (!appliedFilters.month || d.month === appliedFilters.month)
                );

                if (appliedFilters.category) {
                    base = base.filter(d => d.productType === appliedFilters.category);
                }

                if (!appliedFilters.city) {
                    data = base;
                } else if (appliedFilters.city === '全区') {
                    data = base;
                } else {
                    data = base.filter(d => d.city === appliedFilters.city);
                }
                break;
            }
            default: data = [];
        }

        if (activeTab !== 'volume') {
            if (appliedFilters.month) data = data.filter(item => item.month === appliedFilters.month);
            if (appliedFilters.city && activeTab === 'timeliness') {
                data = data.filter(item => item.city === appliedFilters.city);
            }
        }

        return data;
    }, [activeTab, appliedFilters]); 

    const paginatedData = currentData.slice((pagination.currentPage - 1) * pagination.pageSize, pagination.currentPage * pagination.pageSize);

    return (
        <div className="flex flex-col h-full bg-transparent text-blue-100 animate-[fadeIn_0.3s_ease-out] overflow-hidden border border-blue-500/30 shadow-[inset_0_0_20px_rgba(0,133,208,0.1)]">
            
            {/* Tabs */}
            <div className="flex items-end pt-4">
                <div className="w-6 border-b border-blue-500/30"></div>
                {[
                    { id: 'volume', label: '投诉量统计' },
                    { id: 'timeliness', label: '处理及时率统计' },
                    { id: 'repeated', label: '业务重复故障统计' },
                    { id: 'availability', label: '业务可用率统计' }
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

            {/* Filter Bar */}
            <div className="flex-1 flex flex-col p-6 overflow-hidden">
                <div className="bg-transparent p-3 border border-blue-500/20 rounded-sm mb-4 flex flex-wrap items-center gap-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-white">月份</label>
                        <StyledInput 
                            type="month" 
                            className="w-[140px]" 
                            value={currentInputs.month}
                            onChange={(e) => updateFilter('month', e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-white">区域</label>
                        <StyledSelect 
                            className="w-[120px]"
                            value={currentInputs.city}
                            onChange={(e) => updateFilter('city', e.target.value)}
                        >
                            <option value="">全部</option>
                            <option value="全区">全区</option>
                            {INNER_MONGOLIA_CITIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                        </StyledSelect>
                    </div>

                    {activeTab === 'availability' && (
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-white">业务分类</label>
                            <StyledSelect 
                                className="w-[120px]"
                                value={currentInputs.category || ''}
                                onChange={(e) => updateFilter('category', e.target.value)}
                            >
                                <option value="">全部</option>
                                <option value="专线">专线</option>
                                <option value="企宽">企宽</option>
                            </StyledSelect>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                        <StyledButton variant="toolbar" onClick={handleSearch} icon={<SearchIcon />}>
                            查询
                        </StyledButton>
                        <StyledButton variant="secondary" onClick={handleReset} icon={<RefreshCwIcon />}>
                            重置
                        </StyledButton>
                    </div>
                </div>

                {/* Table & Footer Container */}
                <div className="flex-1 flex flex-col border border-blue-500/20 rounded-sm overflow-hidden">
                    <div className="flex-1 overflow-auto bg-transparent scrollbar-thin">
                        <table className="w-full text-left text-sm whitespace-nowrap [&_th]:align-middle [&_td]:align-middle">
                        <thead className="sticky top-0 bg-[#0c2242] text-white z-10 shadow-sm">
                            <tr>
                                {activeTab === 'volume' && (
                                    <>
                                        <Th className="text-center" rowSpan={2}>区域</Th>
                                        <Th className="text-center" rowSpan={2}>月份</Th>
                                        <Th className="text-center" colSpan={5}>故障类型-专线</Th>
                                        <Th className="text-center" colSpan={5}>故障类型-企宽</Th>
                                    </>
                                )}
                                {activeTab !== 'volume' && (
                                    <>
                                        {activeTab === 'timeliness' && (
                                            <>
                                                <Th className="text-center">区域</Th>
                                                <Th className="text-center">月份</Th>
                                                <Th className="text-center">专线处理及时率</Th>
                                                <Th className="text-center">企宽处理及时率</Th>
                                            </>
                                        )}
                                        {activeTab === 'repeated' && (
                                            <>
                                                <Th className="text-center">区域</Th>
                                                <Th className="text-center">月份</Th>
                                                <Th className="text-center">重复故障次数-专线</Th>
                                                <Th className="text-center">重复故障次数-企宽</Th>
                                            </>
                                        )}
                                        {activeTab === 'availability' && (
                                            <>
                                                <Th className="text-center">区域</Th>
                                                <Th className="text-center">月份</Th>
                                                <Th className="text-center">客户名称</Th>
                                                <Th className="text-center">客户编号</Th>
                                                <Th className="text-center">产品实例/宽带账号</Th>
                                                <Th className="text-center">业务类型</Th>
                                                <Th className="text-center">业务可用率</Th>
                                            </>
                                        )}
                                    </>
                                )}
                            </tr>
                            {activeTab === 'volume' && (
                                <tr>
                                    <Th className="text-center border-t border-blue-500/20">全部</Th>
                                    {faultTypes.map(t => (
                                        <Th key={`zx-${t}`} className="text-center border-t border-blue-500/20">{t}</Th>
                                    ))}
                                    <Th className="text-center border-t border-blue-500/20">全部</Th>
                                    {faultTypes.map(t => (
                                        <Th key={`qk-${t}`} className="text-center border-t border-blue-500/20">{t}</Th>
                                    ))}
                                </tr>
                            )}
                        </thead>
                        <tbody className="text-white">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item: any, idx) => (
                                    <tr key={item.id} className={`hover:bg-blue-600/10 transition-colors border-b border-blue-500/10 ${idx % 2 === 1 ? 'bg-[#015478]/20' : ''}`}>
                                        {activeTab === 'volume' && (
                                            <>
                                                <td className="p-2 text-center text-white">{item.city}</td>
                                                <td className="p-2 text-center font-mono text-white">{item.month}</td>
                                                <td className="p-2 text-center font-bold text-yellow-400">{item.total专线 || 0}</td>
                                                {faultTypes.map(t => (
                                                    <td key={`zx-${t}`} className="p-2 text-center font-bold text-neon-blue">{item['专线_' + t] || 0}</td>
                                                ))}
                                                <td className="p-2 text-center font-bold text-yellow-400">{item.total企宽 || 0}</td>
                                                {faultTypes.map(t => (
                                                    <td key={`qk-${t}`} className="p-2 text-center font-bold text-neon-blue">{item['企宽_' + t] || 0}</td>
                                                ))}
                                            </>
                                        )}
                                        {activeTab === 'timeliness' && (
                                            <>
                                                <td className="p-2 text-center text-white">{item.city}</td>
                                                <td className="p-2 text-center font-mono text-white">{item.month}</td>
                                                <td className="p-2 text-center font-bold text-neon-blue">{item.zxRate}</td>
                                                <td className="p-2 text-center font-bold text-neon-blue">{item.qkRate}</td>
                                            </>
                                        )}
                                        {activeTab === 'repeated' && (
                                            <>
                                                <td className="p-2 text-center text-white">{item.city}</td>
                                                <td className="p-2 text-center font-mono text-white">{item.month}</td>
                                                <td className="p-2 text-center font-bold text-neon-blue">{item.zxCount}</td>
                                                <td className="p-2 text-center font-bold text-neon-blue">{item.qkCount}</td>
                                            </>
                                        )}
                                        {activeTab === 'availability' && (
                                            <>
                                                <td className="p-2 text-center text-white">{item.city}</td>
                                                <td className="p-2 text-center font-mono text-white">{item.month}</td>
                                                <td className="p-2 text-center text-white">{item.customerName}</td>
                                                <td className="p-2 text-center font-mono text-white">{item.customerCode}</td>
                                                <td className="p-2 text-center font-mono text-neon-blue">{item.businessId}</td>
                                                <td className="p-2 text-center text-white">{item.productType === '专线' ? item.serviceType : '企宽'}</td>
                                                <td className="p-2 text-center font-bold text-green-400">{item.rate}</td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-blue-300/50">暂无数据</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                    {/* Footer */}
                    <div className="h-10 bg-transparent border-t border-blue-500/20 shrink-0 flex items-center justify-between px-4">
                        <StyledButton variant="toolbar" onClick={() => {}} icon={<DownloadIcon />} className="h-7">
                            导出
                        </StyledButton>
                        <Pagination 
                            currentPage={pagination.currentPage}
                            pageSize={pagination.pageSize}
                            totalItems={currentData.length}
                            onPageChange={(p) => setPagination({...pagination, currentPage: p})}
                            onPageSizeChange={(s) => setPagination({...pagination, pageSize: s, currentPage: 1})}
                            className="py-0 px-0"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
