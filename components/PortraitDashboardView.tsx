import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import * as echarts from 'echarts';
import { INNER_MONGOLIA_CITIES } from '../constants';
import { MapIcon, TrendingUpIcon, BarChartIcon, ChevronRightIcon } from './Icons';
import { StyledSelect } from './UI';

const AutoResizingChart = ({ option, onEvents, className }: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<echarts.ECharts | null>(null);

    useEffect(() => {
        if (!chartRef.current || !containerRef.current) return;
        
        // Initialize raw echarts instance on the inner div
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

        // Observe the PARENT container, which is strictly controlled by Flexbox/CSS
        // and won't have its width/height hardcoded by ECharts.
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
    }, []); // Empty dependency array ensures this runs once

    // Update option when it changes
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

export const PortraitDashboardView: React.FC<{ 
    isSidebarCollapsed?: boolean,
    onNavigateToDetails?: () => void 
}> = ({ 
    isSidebarCollapsed,
    onNavigateToDetails
}) => {
    const [mapLoaded, setMapLoaded] = useState(false);
    const [selectedCity, setSelectedCity] = useState<string>('全省');
    const [selectedMonth, setSelectedMonth] = useState<string>('2024-05'); // Default to last month
    const [volumeChartType, setVolumeChartType] = useState<'line' | 'bar'>('bar');
    const [timelinessChartType, setTimelinessChartType] = useState<'line' | 'bar'>('bar');
    const [satisfactionChartType, setSatisfactionChartType] = useState<'line' | 'bar'>('bar');
    const [qualityChartType, setQualityChartType] = useState<'line' | 'bar'>('bar');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fetch Inner Mongolia GeoJSON
        fetch('https://geo.datav.aliyun.com/areas_v3/bound/150000_full.json')
            .then(res => res.json())
            .then(data => {
                echarts.registerMap('neimenggu', data);
                setMapLoaded(true);
            })
            .catch(err => {
                console.error('Failed to load map data:', err);
                // Fallback to empty map if fetch fails
                setMapLoaded(true);
            });
    }, []);

    const months = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'];

    // Generate dynamic mock data based on selected city
    const monthIndex = months.indexOf(selectedMonth);
    const citySeed = selectedCity === '全省' ? 1 : (selectedCity.charCodeAt(0) % 5) + 0.5;
    const monthSeed = (monthIndex + 1) * 0.1 + 0.7;
    
    const volumeData = (selectedCity === '全省' 
        ? [1200, 1350, 1100, 1500, 1650, 1800]
        : [120, 135, 110, 150, 165, 180].map(v => Math.floor(v * citySeed))).map(v => Math.floor(v * monthSeed));
        
    const timelinessData = [92, 94, 91, 95, 96, 98].map(v => {
        const base = selectedCity === '全省' ? v : Math.min(100, Math.max(80, v + (citySeed - 2.5) * 2));
        return Math.min(100, base * monthSeed);
    });
    
    const satisfactionData = [88, 90, 89, 92, 94, 95].map(v => {
        const base = selectedCity === '全省' ? v : Math.min(100, Math.max(80, v + (citySeed - 3) * 1.5));
        return Math.min(100, base * monthSeed);
    });
    
    const qualityData = [95, 96, 94, 97, 98, 99].map(v => {
        const base = selectedCity === '全省' ? v : Math.min(100, Math.max(80, v + (citySeed - 1.5) * 1.2));
        return Math.min(100, base * monthSeed);
    });

    // City-wise data for bar charts (when no city is selected)
    const cityNames = INNER_MONGOLIA_CITIES.map(c => c.name.replace('市', '').replace('盟', ''));
    const cityVolumeData = [450, 380, 320, 290, 260, 240, 220, 200, 180, 160, 140, 120];
    const cityTimelinessData = [98.5, 97.2, 96.8, 96.2, 95.5, 95.1, 94.8, 94.2, 93.5, 93.1, 92.8, 92.2];
    const citySatisfactionData = [96.5, 95.2, 94.8, 94.2, 93.5, 93.1, 92.8, 92.2, 91.5, 91.1, 90.8, 90.2];
    const cityQualityData = [99.2, 98.5, 97.8, 97.2, 96.5, 96.1, 95.8, 95.2, 94.5, 94.1, 93.8, 93.2];

    const baseBusinessData = [
        { name: '互联网专线', value: 450 },
        { name: '企宽', value: 320 },
        { name: 'E企组网', value: 210 },
        { name: '专线卫士', value: 150 },
        { name: '千里眼', value: 180 },
        { name: '云视讯', value: 120 }
    ];
    
    const businessData = baseBusinessData.map(item => ({
        name: item.name,
        value: selectedCity === '全省' ? item.value : Math.floor(item.value * citySeed)
    }));

    const commonChartOptions = {
        grid: { top: 10, right: 10, bottom: 20, left: 30 },
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

    const volumeOption = {
        ...commonChartOptions,
        xAxis: {
            ...commonChartOptions.xAxis,
            data: (selectedCity === '全省' && volumeChartType === 'bar') ? cityNames : months,
            axisLabel: { 
                ...commonChartOptions.xAxis.axisLabel, 
                interval: 0,
                rotate: (selectedCity === '全省' && volumeChartType === 'bar') ? 35 : 0
            }
        },
        series: [{
            name: '装机量',
            // User request: "点击柱图图标呈现各地市的对应统计值，点击折线图图标以折线图呈现最近6个月的指标趋势"
            // So if selectedCity is '全省':
            //   - bar type: x-axis = cities, data = cityVolumeData
            //   - line type: x-axis = months, data = volumeData (6 months trend)
            // If selectedCity is NOT '全省':
            //   - always line type: x-axis = months, data = volumeData
            type: (selectedCity === '全省' && volumeChartType === 'bar') ? 'bar' : 'line',
            smooth: true,
            data: (selectedCity === '全省' && volumeChartType === 'bar') ? cityVolumeData : volumeData,
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#00d2ff' },
                    { offset: 1, color: '#3a7bd5' }
                ]),
                borderRadius: (selectedCity === '全省' && volumeChartType === 'bar') ? [4, 4, 0, 0] : 0
            },
            lineStyle: { color: '#00d2ff', width: 3 },
            areaStyle: (selectedCity === '全省' && volumeChartType === 'bar') ? null : {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(0, 210, 255, 0.3)' },
                    { offset: 1, color: 'rgba(0, 210, 255, 0)' }
                ])
            },
            barWidth: '40%'
        }]
    };

    const timelinessOption = {
        ...commonChartOptions,
        xAxis: {
            ...commonChartOptions.xAxis,
            data: (selectedCity === '全省' && timelinessChartType === 'bar') ? cityNames : months,
            axisLabel: { 
                ...commonChartOptions.xAxis.axisLabel, 
                interval: 0,
                rotate: (selectedCity === '全省' && timelinessChartType === 'bar') ? 35 : 0
            }
        },
        yAxis: { ...commonChartOptions.yAxis, min: 80, max: 100 },
        series: [{
            name: '及时率(%)',
            type: (selectedCity === '全省' && timelinessChartType === 'bar') ? 'bar' : 'line',
            smooth: true,
            data: (selectedCity === '全省' && timelinessChartType === 'bar') ? cityTimelinessData : timelinessData,
            lineStyle: { color: '#00ffcc', width: 3 },
            itemStyle: { 
                color: '#00ffcc',
                borderRadius: (selectedCity === '全省' && timelinessChartType === 'bar') ? [4, 4, 0, 0] : 0
            },
            areaStyle: (selectedCity === '全省' && timelinessChartType === 'bar') ? null : {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(0, 255, 204, 0.3)' },
                    { offset: 1, color: 'rgba(0, 255, 204, 0)' }
                ])
            },
            barWidth: '40%'
        }]
    };

    const satisfactionOption = {
        ...commonChartOptions,
        xAxis: {
            ...commonChartOptions.xAxis,
            data: (selectedCity === '全省' && satisfactionChartType === 'bar') ? cityNames : months,
            axisLabel: { 
                ...commonChartOptions.xAxis.axisLabel, 
                interval: 0,
                rotate: (selectedCity === '全省' && satisfactionChartType === 'bar') ? 35 : 0
            }
        },
        yAxis: { ...commonChartOptions.yAxis, min: 80, max: 100 },
        series: [{
            name: '满意度(%)',
            type: (selectedCity === '全省' && satisfactionChartType === 'bar') ? 'bar' : 'line',
            smooth: true,
            data: (selectedCity === '全省' && satisfactionChartType === 'bar') ? citySatisfactionData : satisfactionData,
            lineStyle: { color: '#ff00ff', width: 3 },
            itemStyle: { 
                color: '#ff00ff',
                borderRadius: (selectedCity === '全省' && satisfactionChartType === 'bar') ? [4, 4, 0, 0] : 0
            },
            areaStyle: (selectedCity === '全省' && satisfactionChartType === 'bar') ? null : {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(255, 0, 255, 0.3)' },
                    { offset: 1, color: 'rgba(255, 0, 255, 0)' }
                ])
            },
            barWidth: '40%'
        }]
    };

    const qualityOption = {
        ...commonChartOptions,
        xAxis: {
            ...commonChartOptions.xAxis,
            data: (selectedCity === '全省' && qualityChartType === 'bar') ? cityNames : months,
            axisLabel: { 
                ...commonChartOptions.xAxis.axisLabel, 
                interval: 0,
                rotate: (selectedCity === '全省' && qualityChartType === 'bar') ? 35 : 0
            }
        },
        yAxis: { ...commonChartOptions.yAxis, min: 80, max: 100 },
        series: [{
            name: '质检合格率(%)',
            type: (selectedCity === '全省' && qualityChartType === 'bar') ? 'bar' : 'line',
            smooth: true,
            data: (selectedCity === '全省' && qualityChartType === 'bar') ? cityQualityData : qualityData,
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#f5af19' },
                    { offset: 1, color: '#f12711' }
                ]),
                borderRadius: (selectedCity === '全省' && qualityChartType === 'bar') ? [4, 4, 0, 0] : 0
            },
            lineStyle: { color: '#f5af19', width: 3 },
            areaStyle: (selectedCity === '全省' && qualityChartType === 'bar') ? null : {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(245, 175, 25, 0.3)' },
                    { offset: 1, color: 'rgba(245, 175, 25, 0)' }
                ])
            },
            barWidth: '40%'
        }]
    };

    const totalBusinessVolume = businessData.reduce((sum, item) => sum + item.value, 0);

    const businessOption = {
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(11, 23, 48, 0.9)',
            borderColor: 'rgba(0, 210, 255, 0.3)',
            textStyle: { color: '#fff', fontSize: 12 }
        },
        legend: {
            type: 'scroll',
            orient: 'vertical',
            right: '5%',
            top: 'center',
            data: businessData.map(item => item.name),
            textStyle: { 
                color: '#94a3b8', 
                fontSize: 11,
                rich: {
                    name: { width: 75, color: '#94a3b8' },
                    value: { width: 35, align: 'right', color: '#fff', fontWeight: 'bold' }
                }
            },
            pageIconColor: '#00d2ff',
            pageIconInactiveColor: '#1e3a5f',
            pageTextStyle: { color: '#94a3b8' },
            itemWidth: 10,
            itemHeight: 10,
            formatter: function (name: string) {
                const item = businessData.find(i => i.name === name);
                return `{name|${name}} {value|${item ? item.value : 0}}`;
            }
        },
        series: [{
            name: '业务工单量',
            type: 'pie',
            radius: ['50%', '70%'],
            center: ['25%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 4,
                borderColor: '#0b1730',
                borderWidth: 2
            },
            label: { show: false },
            labelLine: { show: false },
            data: businessData,
            color: ['#00d2ff', '#3a7bd5', '#ff00ff', '#00ffcc', '#f5af19', '#f12711']
        }, {
            type: 'pie',
            radius: ['0%', '0%'],
            center: ['25%', '50%'],
            silent: true,
            label: {
                show: true,
                position: 'center',
                formatter: totalBusinessVolume.toString(),
                color: '#fff',
                fontSize: 20,
                fontWeight: 'bold'
            },
            data: [{ value: 0, name: '' }]
        }]
    };

    const mapData = INNER_MONGOLIA_CITIES.map(city => ({
        name: city.name,
        value: Math.floor(Math.random() * 20) + 80, // Random score between 80-100
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
            min: 80,
            max: 100,
            left: 0,
            bottom: 10,
            itemWidth: 10,
            text: ['高', '低'],
            calculable: true,
            inRange: {
                color: ['#0b1730', '#00d2ff']
            },
            textStyle: { color: '#94a3b8', fontSize: 10 }
        },
        series: [
            {
                name: '内蒙古',
                type: 'map',
                map: 'neimenggu',
                roam: true,
                zoom: isSidebarCollapsed ? 1.3 : 1.05,
                layoutCenter: isSidebarCollapsed ? ['55%', '50%'] : ['50%', '50%'],
                layoutSize: '100%',
                label: {
                    show: true,
                    color: '#fff',
                    fontSize: 10,
                    formatter: (params: any) => {
                        return params.value ? params.value + '分' : '';
                    }
                },
                itemStyle: {
                    areaColor: '#0c2242',
                    borderColor: '#00d2ff',
                    borderWidth: 1
                },
                emphasis: {
                    itemStyle: {
                        areaColor: '#3b82f6',
                        borderColor: '#fff',
                        borderWidth: 2,
                        shadowColor: 'rgba(0, 210, 255, 0.8)',
                        shadowBlur: 10
                    },
                    label: { color: '#fff', fontWeight: 'bold' }
                },
                select: {
                    itemStyle: {
                        areaColor: '#f5af19',
                        borderColor: '#fff',
                        borderWidth: 2,
                        shadowColor: 'rgba(245, 175, 25, 0.8)',
                        shadowBlur: 15
                    },
                    label: { color: '#fff', fontWeight: 'bold' }
                },
                selectedMode: 'single',
                data: mapData
            }
        ]
    };

    const onMapEvents = {
        click: (params: any) => {
            if (params.name) {
                setSelectedCity(prev => prev === params.name ? '全省' : params.name);
            }
        }
    };

    const ChartCard = ({ title, option, showSwitch, currentType, onToggleType }: { 
        title: string, 
        option: any, 
        showSwitch?: boolean, 
        currentType?: 'line' | 'bar',
        onToggleType?: (type: 'line' | 'bar') => void 
    }) => (
        <div className="flex-1 bg-[#0b1730]/50 border border-blue-500/20 p-3 rounded-sm shadow-[0_0_15px_rgba(0,210,255,0.1)] flex flex-col min-h-0 min-w-0">
            <div className="text-xs font-bold text-blue-300 mb-2 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-neon-blue rounded-full"></div>
                    {title} {selectedCity !== '全省' && <span className="text-neon-blue ml-1">({selectedCity})</span>}
                </div>
                {showSwitch && selectedCity === '全省' && (
                    <div className="flex items-center gap-2 bg-[#1e3a5f]/30 p-0.5 rounded">
                        <button 
                            onClick={() => onToggleType?.('bar')}
                            className={`p-1 rounded transition-colors ${currentType === 'bar' ? 'bg-neon-blue text-white' : 'text-blue-400 hover:text-blue-200'}`}
                            title="地市分布"
                        >
                            <BarChartIcon className="w-3 h-3" />
                        </button>
                        <button 
                            onClick={() => onToggleType?.('line')}
                            className={`p-1 rounded transition-colors ${currentType === 'line' ? 'bg-neon-blue text-white' : 'text-blue-400 hover:text-blue-200'}`}
                            title="趋势分析"
                        >
                            <TrendingUpIcon className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
            <div className="flex-1 w-full min-h-0 min-w-0 overflow-hidden relative">
                <AutoResizingChart 
                    option={option} 
                />
            </div>
        </div>
    );

    const generatePersonnelData = (city: string) => {
        const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];
        const teams = ['装维一班', '装维二班', '装维三班'];
        const districts = ['新城区', '回民区', '玉泉区', '赛罕区', '土默特左旗', '托克托县', '和林格尔县', '清水河县', '武川县'];
        
        return Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            name: names[i % names.length] + i,
            team: teams[i % teams.length],
            region: `${city === '全省' ? '呼和浩特市' : city}-${districts[i % districts.length]}`,
            score: Math.floor(Math.random() * 20) + 80,
            volume: Math.floor(Math.random() * 100) + 50,
            timeliness: (Math.random() * 10 + 90).toFixed(1) + '%',
            satisfaction: (Math.random() * 10 + 90).toFixed(1) + '%',
            quality: (Math.random() * 10 + 90).toFixed(1) + '%'
        })).sort((a, b) => b.score - a.score);
    };

    const personnelData = useMemo(() => generatePersonnelData(selectedCity), [selectedCity]);

    return (
        <div ref={containerRef} className="relative flex-1 flex flex-col h-full overflow-hidden bg-transparent border border-blue-500/30 shadow-[inset_0_0_20px_rgba(0,133,208,0.1)] text-white p-4 gap-4">
            <div className="w-full lg:h-[66%] flex flex-col lg:flex-row gap-4 min-h-0 shrink-0">
                {/* Left Column */}
                <div className="w-full lg:w-[28%] flex flex-col gap-4 min-w-0">
                    <ChartCard 
                        title="装机量" 
                        option={volumeOption} 
                        showSwitch 
                        currentType={volumeChartType}
                        onToggleType={setVolumeChartType}
                    />
                    <ChartCard 
                        title="装机及时率" 
                        option={timelinessOption} 
                        showSwitch
                        currentType={timelinessChartType}
                        onToggleType={setTimelinessChartType}
                    />
                </div>

                {/* Center Column (Map) */}
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
                        {mapLoaded ? (
                            <AutoResizingChart 
                                option={mapOption} 
                                onEvents={onMapEvents}
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-blue-300 text-sm">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue mr-3"></div>
                                加载地图数据...
                            </div>
                        )}
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

                {/* Right Column */}
                <div className="w-full lg:w-[28%] flex flex-col gap-4 min-w-0">
                    <ChartCard 
                        title="满意度" 
                        option={satisfactionOption} 
                        showSwitch
                        currentType={satisfactionChartType}
                        onToggleType={setSatisfactionChartType}
                    />
                    <ChartCard 
                        title="质检合格率" 
                        option={qualityOption} 
                        showSwitch
                        currentType={qualityChartType}
                        onToggleType={setQualityChartType}
                    />
                </div>
            </div>

            {/* Bottom Row */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
                {/* Bottom Left Column */}
                <div className="w-full lg:w-[28%] flex flex-col min-w-0">
                    <ChartCard title="装机工单量分布" option={businessOption} />
                </div>
                {/* Bottom Right Column - Personnel List */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#0b1730]/50 border border-blue-500/20 p-3 rounded-sm shadow-[0_0_15px_rgba(0,210,255,0.1)]">
                    <div className="text-xs font-bold text-blue-300 mb-2 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-3 bg-neon-blue rounded-full"></div>
                            商客装维画像TOP5 {selectedCity !== '全省' && <span className="text-neon-blue">({selectedCity})</span>}
                        </div>
                        <button 
                            onClick={onNavigateToDetails}
                            className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-neon-blue transition-colors cursor-pointer group"
                        >
                            <span>更多</span>
                            <ChevronRightIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto custom-scrollbar min-h-0">
                        <table className="w-full text-left text-xs text-blue-100 whitespace-nowrap">
                            <thead className="sticky top-0 bg-[#0b1730] z-10">
                                <tr>
                                    <th className="p-2 border-b border-blue-500/30">姓名</th>
                                    <th className="p-2 border-b border-blue-500/30">班组</th>
                                    <th className="p-2 border-b border-blue-500/30">区域</th>
                                    <th className="p-2 border-b border-blue-500/30">得分</th>
                                    <th className="p-2 border-b border-blue-500/30">装机量</th>
                                    <th className="p-2 border-b border-blue-500/30">及时率</th>
                                    <th className="p-2 border-b border-blue-500/30">满意度</th>
                                    <th className="p-2 border-b border-blue-500/30">质检通过率</th>
                                </tr>
                            </thead>
                            <tbody>
                                {personnelData.slice(0, 5).map((row) => (
                                    <tr key={row.id} className="border-b border-blue-500/10 hover:bg-blue-500/10 transition-colors">
                                        <td className="p-2">{row.name}</td>
                                        <td className="p-2">{row.team}</td>
                                        <td className="p-2">{row.region}</td>
                                        <td className="p-2 text-neon-blue font-bold">{row.score}</td>
                                        <td className="p-2">{row.volume}</td>
                                        <td className="p-2">{row.timeliness}</td>
                                        <td className="p-2">{row.satisfaction}</td>
                                        <td className="p-2">{row.quality}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
