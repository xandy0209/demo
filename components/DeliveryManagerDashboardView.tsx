import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as echarts from 'echarts';
import { INNER_MONGOLIA_CITIES } from '../constants';
import { MapIcon, TrendingUpIcon, BarChartIcon, ChevronRightIcon, InfoIcon } from './Icons';
import { StyledSelect } from './UI';

const AutoResizingChart = ({ option, onEvents, className }: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<echarts.ECharts | null>(null);

    useEffect(() => {
        if (!chartRef.current || !containerRef.current) return;
        
        const instance = echarts.init(chartRef.current, undefined, { renderer: 'canvas' });
        instanceRef.current = instance;

        if (onEvents) {
            Object.keys(onEvents).forEach(eventName => {
                instance.on(eventName, onEvents[eventName]);
            });
        }

        if (option) {
            instance.setOption(option, true);
        }

        const observer = new ResizeObserver(() => {
            requestAnimationFrame(() => {
                if (instanceRef.current) {
                    instanceRef.current.resize({ animation: { duration: 0 } });
                }
            });
        });
        
        observer.observe(containerRef.current);

        return () => {
            observer.disconnect();
            if (instanceRef.current) {
                instanceRef.current.dispose();
                instanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (instanceRef.current && option) {
            instanceRef.current.setOption(option, true);
        }
    }, [option]);

    return (
        <div ref={containerRef} className={`w-full h-full absolute inset-0 ${className || ''}`}>
            <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export const DeliveryManagerDashboardView: React.FC<{ 
    isSidebarCollapsed?: boolean,
    onNavigateToDetails?: () => void 
}> = ({ 
    isSidebarCollapsed,
    onNavigateToDetails
}) => {
    const [mapLoaded, setMapLoaded] = useState(false);
    const [selectedCity, setSelectedCity] = useState<string>('全省');
    const [selectedMonth, setSelectedMonth] = useState<string>('2024-05'); // Default to last month
    const [openingChartType, setOpeningChartType] = useState<'line' | 'bar'>('bar');
    const [evaluationChartType, setEvaluationChartType] = useState<'line' | 'bar'>('bar');
    const [deliveryChartType, setDeliveryChartType] = useState<'line' | 'bar'>('bar');
    const [dispatchChartType, setDispatchChartType] = useState<'line' | 'bar'>('bar');
    const [acceptanceChartType, setAcceptanceChartType] = useState<'line' | 'bar'>('bar');
    const [completionChartType, setCompletionChartType] = useState<'line' | 'bar'>('bar');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch('https://geo.datav.aliyun.com/areas_v3/bound/150000_full.json')
            .then(res => res.json())
            .then(data => {
                echarts.registerMap('neimenggu', data);
                setMapLoaded(true);
            })
            .catch(err => {
                console.error('Failed to load map data:', err);
                setMapLoaded(true);
            });
    }, []);

    const months = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'];
    const monthIndex = months.indexOf(selectedMonth);
    const citySeed = selectedCity === '全省' ? 1 : (selectedCity.charCodeAt(0) % 5) + 0.5;
    const monthSeed = (monthIndex + 1) * 0.1 + 0.7; // Month affects the data slightly
    
    const openingData = [94, 95, 93, 96, 97, 98].map(v => {
        const base = selectedCity === '全省' ? v : Math.min(100, Math.max(85, v + (citySeed - 2.5)));
        return Math.min(100, base * monthSeed);
    });
    const evaluationData = [90, 92, 91, 93, 94, 95].map(v => {
        const base = selectedCity === '全省' ? v : Math.min(100, Math.max(80, v + (citySeed - 3)));
        return Math.min(100, base * monthSeed);
    });
    const deliveryData = (selectedCity === '全省' ? [800, 950, 850, 1100, 1200, 1300] : [80, 95, 85, 110, 120, 130].map(v => Math.floor(v * citySeed))).map(v => Math.floor(v * monthSeed));
    const dispatchData = [96, 97, 95, 98, 98.5, 99].map(v => {
        const base = selectedCity === '全省' ? v : Math.min(100, Math.max(90, v + (citySeed - 1.5)));
        return Math.min(100, base * monthSeed);
    });
    const acceptanceTrendData = [92, 94, 93, 95, 96, 97].map(v => {
        const base = selectedCity === '全省' ? v : Math.min(100, Math.max(85, v + (citySeed - 2)));
        return Math.min(100, base * monthSeed);
    });
    const completionTrendData = [90, 93, 92, 94, 95, 96].map(v => {
        const base = selectedCity === '全省' ? v : Math.min(100, Math.max(80, v + (citySeed - 3)));
        return Math.min(100, base * monthSeed);
    });

    const cityNames = INNER_MONGOLIA_CITIES.map(c => c.name.replace('市', '').replace('盟', ''));
    const cityOpeningData = [98.2, 97.5, 96.8, 96.1, 95.4, 94.7, 94.0, 93.3, 92.6, 91.9, 91.2, 90.5];
    const cityEvaluationData = [96.5, 95.8, 95.1, 94.4, 93.7, 93.0, 92.3, 91.6, 90.9, 90.2, 89.5, 88.8];
    const cityDeliveryData = [320, 280, 250, 220, 200, 180, 160, 140, 120, 100, 80, 60];
    const cityDispatchData = [99.5, 99.1, 98.7, 98.3, 97.9, 97.5, 97.1, 96.7, 96.3, 95.9, 95.5, 95.1];
    const cityAcceptanceData = [97.8, 97.2, 96.5, 95.8, 95.1, 94.4, 93.7, 93.0, 92.3, 91.6, 90.9, 90.2];
    const cityCompletionData = [96.5, 95.8, 95.1, 94.4, 93.7, 93.0, 92.3, 91.6, 90.9, 90.2, 89.5, 88.8];

    const businessData = [
        { name: '团单报结及时率', value: 94.5 },
        { name: '团单受理及时率', value: 96.2 },
        { name: '团单分派及时率', value: 97.8 }
    ];

    const commonChartOptions = {
        grid: { top: 10, right: 10, bottom: 20, left: 35 },
        tooltip: {
            trigger: 'axis',
            confine: true,
            backgroundColor: 'rgba(11, 23, 48, 0.9)',
            borderColor: 'rgba(0, 210, 255, 0.3)',
            textStyle: { color: '#fff', fontSize: 12 }
        },
        xAxis: {
            type: 'category',
            data: months,
            axisLine: { lineStyle: { color: '#1e3a5f' } },
            axisLabel: { color: '#94a3b8', fontSize: 10 }
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } },
            axisLabel: { color: '#94a3b8', fontSize: 10 }
        }
    };

    const getOption = (name: string, data: number[], cityData: number[], chartType: 'line' | 'bar', colorStart: string, colorEnd: string, isPercent = true) => ({
        ...commonChartOptions,
        xAxis: {
            ...commonChartOptions.xAxis,
            data: (selectedCity === '全省' && chartType === 'bar') ? cityNames : months,
            axisLabel: { 
                ...commonChartOptions.xAxis.axisLabel, 
                interval: 0,
                rotate: (selectedCity === '全省' && chartType === 'bar') ? 35 : 0
            }
        },
        yAxis: { ...commonChartOptions.yAxis, min: isPercent ? 80 : undefined, max: isPercent ? 100 : undefined },
        series: [{
            name: name,
            type: (selectedCity === '全省' && chartType === 'bar') ? 'bar' : 'line',
            smooth: true,
            data: (selectedCity === '全省' && chartType === 'bar') ? cityData : data,
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: colorStart },
                    { offset: 1, color: colorEnd }
                ]),
                borderRadius: (selectedCity === '全省' && chartType === 'bar') ? [4, 4, 0, 0] : 0
            },
            lineStyle: { color: colorStart, width: 3 },
            areaStyle: (selectedCity === '全省' && chartType === 'bar') ? null : {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: `${colorStart}4D` }, // 30% opacity
                    { offset: 1, color: `${colorStart}00` }  // 0% opacity
                ])
            },
            barWidth: '40%'
        }]
    });

    const businessOption = {
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(11, 23, 48, 0.9)',
            borderColor: 'rgba(0, 210, 255, 0.3)',
            textStyle: { color: '#fff', fontSize: 12 }
        },
        legend: {
            orient: 'vertical',
            right: '5%',
            top: 'center',
            textStyle: { color: '#94a3b8', fontSize: 11 },
            itemWidth: 10,
            itemHeight: 10
        },
        series: [{
            name: '团单指标',
            type: 'pie',
            radius: ['50%', '70%'],
            center: ['35%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 4, borderColor: '#0b1730', borderWidth: 2 },
            label: { show: false },
            data: businessData,
            color: ['#00d2ff', '#ff00ff', '#00ffcc']
        }]
    };

    const mapData = INNER_MONGOLIA_CITIES.map(city => ({
        name: city.name,
        value: Math.floor(Math.random() * 15) + 85,
        selected: city.name === selectedCity
    }));

    const mapOption = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}<br/>综合得分: {c}',
            backgroundColor: 'rgba(11, 23, 48, 0.9)',
            borderColor: 'rgba(0, 210, 255, 0.3)',
            textStyle: { color: '#fff', fontSize: 12 }
        },
        visualMap: {
            min: 85, max: 100, left: 0, bottom: 10, itemWidth: 10, text: ['高', '低'], calculable: true,
            inRange: { color: ['#0b1730', '#00d2ff'] },
            textStyle: { color: '#94a3b8', fontSize: 10 }
        },
        series: [{
            name: '内蒙古', type: 'map', map: 'neimenggu', roam: true, 
            zoom: isSidebarCollapsed ? 1.3 : 1.05,
            layoutCenter: isSidebarCollapsed ? ['55%', '50%'] : ['50%', '50%'],
            layoutSize: '100%',
            label: {
                show: true, color: '#fff', fontSize: 10,
                formatter: (params: any) => params.value ? params.value + '分' : ''
            },
            itemStyle: { areaColor: '#0c2242', borderColor: '#00d2ff', borderWidth: 1 },
            emphasis: {
                itemStyle: { areaColor: '#3b82f6', borderColor: '#fff', borderWidth: 2, shadowColor: 'rgba(0, 210, 255, 0.8)', shadowBlur: 10 },
                label: { color: '#fff', fontWeight: 'bold' }
            },
            select: {
                itemStyle: { areaColor: '#f5af19', borderColor: '#fff', borderWidth: 2, shadowColor: 'rgba(245, 175, 25, 0.8)', shadowBlur: 15 },
                label: { color: '#fff', fontWeight: 'bold' }
            },
            selectedMode: 'single',
            data: mapData
        }]
    };

    const onMapEvents = {
        click: (params: any) => {
            if (params.name) setSelectedCity(prev => prev === params.name ? '全省' : params.name);
        }
    };

    const ChartCard = ({ title, option, showSwitch, currentType, onToggleType }: any) => (
        <div className="flex-1 bg-[#0b1730]/50 border border-blue-500/20 p-3 rounded-sm shadow-[0_0_15px_rgba(0,210,255,0.1)] flex flex-col min-h-0 min-w-0">
            <div className="text-xs font-bold text-blue-300 mb-2 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-neon-blue rounded-full"></div>
                    {title} {selectedCity !== '全省' && <span className="text-neon-blue ml-1">({selectedCity})</span>}
                    {title === '用后即评' && (
                        <div className="relative group/info ml-1">
                            <InfoIcon className="w-3.5 h-3.5 text-blue-400 cursor-help hover:text-neon-blue transition-colors" />
                            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-[#0b1730] border border-blue-500/40 rounded shadow-[0_0_20px_rgba(0,210,255,0.3)] z-[100] opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-300 pointer-events-none">
                                <p className="text-white font-bold mb-1 border-b border-blue-500/20 pb-1">用后即评打分细则</p>
                                <div className="space-y-1.5 text-[10px] text-blue-100 leading-relaxed font-normal">
                                    <p><span className="text-neon-blue">●</span> 100%满意得满分 (20分)</p>
                                    <p><span className="text-neon-blue">●</span> [95%, 100%) 区间：每低1%扣1分</p>
                                    <p><span className="text-neon-blue">●</span> [90%, 95%) 区间：每低1%扣2分</p>
                                    <p><span className="text-neon-blue">●</span> 低于90%计0分</p>
                                    <p className="mt-2 text-gray-400 italic">计算口径：(专线15日+企宽7日+终端实时)满意数 / 总评价数</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {showSwitch && selectedCity === '全省' && (
                    <div className="flex items-center gap-2 bg-[#1e3a5f]/30 p-0.5 rounded">
                        <button onClick={() => onToggleType?.('bar')} className={`p-1 rounded transition-colors ${currentType === 'bar' ? 'bg-neon-blue text-white' : 'text-blue-400 hover:text-blue-200'}`} title="地市分布">
                            <BarChartIcon className="w-3 h-3" />
                        </button>
                        <button onClick={() => onToggleType?.('line')} className={`p-1 rounded transition-colors ${currentType === 'line' ? 'bg-neon-blue text-white' : 'text-blue-400 hover:text-blue-200'}`} title="趋势分析">
                            <TrendingUpIcon className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
            <div className="flex-1 w-full min-h-0 min-w-0 overflow-hidden relative">
                <AutoResizingChart option={option} />
            </div>
        </div>
    );

    const generatePersonnelData = (city: string) => {
        const names = ['陈明', '林静', '周杰', '吴芳', '郑强', '孙华', '李雷', '韩梅梅'];
        const levels = ['高级', '中级', '初级'];
        return Array.from({ length: 10 }).map((_, i) => ({
            id: i,
            name: names[i % names.length],
            level: levels[i % levels.length],
            region: `${city === '全省' ? '呼和浩特市' : city}`,
            score: Math.floor(Math.random() * 15) + 85,
            openingRate: (Math.random() * 5 + 95).toFixed(1) + '%',
            evaluation: (Math.random() * 5 + 90).toFixed(1) + '%',
            delivery: Math.floor(Math.random() * 50) + 100,
            dispatchRate: (Math.random() * 5 + 95).toFixed(1) + '%',
            completionRate: (Math.random() * 5 + 90).toFixed(1) + '%',
            acceptanceRate: (Math.random() * 5 + 92).toFixed(1) + '%',
        })).sort((a, b) => b.score - a.score);
    };

    const personnelData = useMemo(() => generatePersonnelData(selectedCity), [selectedCity]);

    return (
        <div className="relative flex-1 flex flex-col overflow-hidden bg-transparent border border-blue-500/30 shadow-[inset_0_0_20px_rgba(0,133,208,0.1)] text-white p-4 gap-4">
            <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden">
                {/* Left Column - 4 Equal Height Charts */}
                <div className="w-full lg:w-[28%] flex flex-col gap-4 min-w-0 shrink-0">
                    <ChartCard title="开通及时率" option={getOption('开通及时率', openingData, cityOpeningData, openingChartType, '#00d2ff', '#3a7bd5')} showSwitch currentType={openingChartType} onToggleType={setOpeningChartType} />
                    <ChartCard title="用后即评" option={getOption('用后即评', evaluationData, cityEvaluationData, evaluationChartType, '#00ffcc', '#00a884')} showSwitch currentType={evaluationChartType} onToggleType={setEvaluationChartType} />
                    <ChartCard title="团单受理及时率" option={getOption('团单受理及时率', acceptanceTrendData, cityAcceptanceData, acceptanceChartType, '#00ffcc', '#00a884')} showSwitch currentType={acceptanceChartType} onToggleType={setAcceptanceChartType} />
                    <ChartCard title="团单报结及时率" option={getOption('团单报结及时率', completionTrendData, cityCompletionData, completionChartType, '#00d2ff', '#3a7bd5')} showSwitch currentType={completionChartType} onToggleType={setCompletionChartType} />
                </div>

                {/* Right Section */}
                <div className="flex-1 flex flex-col gap-4 min-w-0">
                    {/* Top Right Section */}
                    <div className="w-full lg:h-[58%] flex flex-col lg:flex-row gap-4 min-h-0 shrink-0">
                        <div className="flex-1 bg-[#0b1730]/30 border border-blue-500/20 p-4 rounded-sm shadow-[0_0_15px_rgba(0,210,255,0.1)] flex flex-col relative min-w-0">
                            <div className="text-sm font-bold text-white mb-2 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2">
                                    <MapIcon className="w-4 h-4 text-neon-blue" />
                                    区域画像得分分布 {selectedCity !== '全省' && <span className="text-neon-blue">({selectedCity})</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-300 text-xs font-normal">画像月份:</span>
                                    <StyledSelect 
                                        value={selectedMonth} 
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="w-28 h-6 text-xs"
                                    >
                                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                                    </StyledSelect>
                                </div>
                            </div>
                            <div className="flex-1 relative min-h-0 min-w-0 overflow-hidden">
                                {mapLoaded ? <AutoResizingChart option={mapOption} onEvents={onMapEvents} /> : <div className="absolute inset-0 flex items-center justify-center text-blue-300 text-sm"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue mr-3"></div>加载地图数据...</div>}
                                {selectedCity !== '全省' && (
                                    <button 
                                        className="absolute top-2 right-2 z-20 px-2 py-1 bg-[#1e3a5f]/80 border border-blue-500/40 rounded text-[10px] text-blue-200 hover:text-white hover:bg-blue-600/80 transition-all cursor-pointer flex items-center gap-1 shadow-lg"
                                        onClick={() => setSelectedCity('全省')}
                                    >
                                        <span>返回全省</span>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="w-full lg:w-[38.8%] flex flex-col gap-4 min-w-0">
                            <ChartCard title="交付量" option={getOption('交付量', deliveryData, cityDeliveryData, deliveryChartType, '#ff00ff', '#7028e4', false)} showSwitch currentType={deliveryChartType} onToggleType={setDeliveryChartType} />
                            <ChartCard title="团单分派及时率" option={getOption('团单分派及时率', dispatchData, cityDispatchData, dispatchChartType, '#f5af19', '#f12711')} showSwitch currentType={dispatchChartType} onToggleType={setDispatchChartType} />
                        </div>
                    </div>

                    {/* Bottom Right Section - Personnel List */}
                    <div className="flex-1 flex flex-col min-w-0 bg-[#0b1730]/50 border border-blue-500/20 p-3 rounded-sm shadow-[0_0_15px_rgba(0,210,255,0.1)] overflow-hidden">
                        <div className="text-xs font-bold text-blue-300 mb-2 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-3 bg-neon-blue rounded-full"></div>
                                交付经理画像TOP5 {selectedCity !== '全省' && <span className="text-neon-blue">({selectedCity})</span>}
                            </div>
                            <button onClick={onNavigateToDetails} className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-neon-blue transition-colors cursor-pointer group">
                                <span>更多</span>
                                <ChevronRightIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden min-h-0">
                            <table className="w-full text-left text-xs text-blue-100 whitespace-nowrap">
                                <thead className="sticky top-0 bg-[#0b1730] z-10">
                                    <tr>
                                        <th className="p-2 border-b border-blue-500/30">姓名</th>
                                        <th className="p-2 border-b border-blue-500/30">区域（地市-区县）</th>
                                        <th className="p-2 border-b border-blue-500/30">得分</th>
                                        <th className="p-2 border-b border-blue-500/30">交付量</th>
                                        <th className="p-2 border-b border-blue-500/30">开通及时率</th>
                                        <th className="p-2 border-b border-blue-500/30">用户即评</th>
                                        <th className="p-2 border-b border-blue-500/30">团单分派及时率</th>
                                        <th className="p-2 border-b border-blue-500/30">团单受理及时率</th>
                                        <th className="p-2 border-b border-blue-500/30">团单报结及时率</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {personnelData.slice(0, 5).map((row) => (
                                        <tr key={row.id} className="border-b border-blue-500/10 hover:bg-blue-500/10 transition-colors">
                                            <td className="p-2">{row.name}</td>
                                            <td className="p-2">{row.region}</td>
                                            <td className="p-2 text-neon-blue font-bold">{row.score}</td>
                                            <td className="p-2">{row.delivery}</td>
                                            <td className="p-2">{row.openingRate}</td>
                                            <td className="p-2">{row.evaluation}</td>
                                            <td className="p-2">{row.dispatchRate}</td>
                                            <td className="p-2">{row.acceptanceRate}</td>
                                            <td className="p-2">{row.completionRate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
