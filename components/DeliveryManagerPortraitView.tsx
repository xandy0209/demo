import React, { useState, useEffect } from 'react';
import { DeliveryManagerConfigView } from './DeliveryManagerConfigView';
import { DeliveryManagerDashboardView } from './DeliveryManagerDashboardView';
import { DeliveryManagerDetailsView } from './DeliveryManagerDetailsView';
import { SettingsIcon, BarChartIcon, SidebarCloseIcon, SidebarOpenIcon, ListIcon, XIcon } from './Icons';

export const DeliveryManagerPortraitView: React.FC = () => {
    const [tabs, setTabs] = useState<{ id: string, label: string }[]>([{ id: 'dashboard', label: '交付经理画像' }]);
    const [activeTabId, setActiveTabId] = useState<string>('dashboard');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, tabId: string } | null>(null);

    const sidebarItems = [
        { id: 'dashboard', label: '交付经理画像概览', icon: <BarChartIcon /> },
        { id: 'details', label: '交付经理画像明细', icon: <ListIcon /> },
        { id: 'config', label: '画像配置', icon: <SettingsIcon /> },
    ];

    const handleSidebarClick = (item: { id: string, label: string }) => {
        if (!tabs.find(t => t.id === item.id)) {
            const label = item.id === 'dashboard' ? '交付经理画像' : item.label;
            setTabs([...tabs, { id: item.id, label }]);
        }
        setActiveTabId(item.id);
    };

    const handleCloseTab = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newTabs = tabs.filter(t => t.id !== id);
        setTabs(newTabs);
        if (activeTabId === id) {
            if (newTabs.length > 0) {
                setActiveTabId(newTabs[newTabs.length - 1].id);
            } else {
                setActiveTabId('');
            }
        }
        setContextMenu(null);
    };

    const handleCloseOtherTabs = (id: string) => {
        const tabToKeep = tabs.find(t => t.id === id);
        if (tabToKeep) {
            setTabs([tabToKeep]);
            setActiveTabId(id);
        }
        setContextMenu(null);
    };

    const handleCloseAllTabs = () => {
        setTabs([]);
        setActiveTabId('');
        setContextMenu(null);
    };

    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    return (
        <div className="flex flex-1 overflow-hidden h-full">
            {/* Sidebar */}
            <div className={`${isSidebarCollapsed ? 'w-[53px]' : 'w-48'} bg-transparent border border-blue-500/30 mr-2 transition-all duration-500 ease-in-out flex flex-col shadow-[0_0_15px_rgba(0,0,0,0.3)]`}>
                <div className={`h-[35px] flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-3'} border-b border-blue-500/20 bg-transparent shrink-0`}> 
                    {!isSidebarCollapsed && <span className="text-blue-100 font-bold tracking-wider text-[12px] whitespace-nowrap">交付经理画像</span>}
                    <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="text-blue-300 hover:text-white transition-colors flex items-center justify-center"> 
                        <div className="w-5 h-5 flex items-center justify-center">{isSidebarCollapsed ? <SidebarOpenIcon /> : <SidebarCloseIcon />}</div> 
                    </button> 
                </div>
                <div className="flex-1 py-2 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                    {sidebarItems.map(item => {
                        const isActive = activeTabId === item.id;
                        return (
                            <div
                                key={item.id}
                                onClick={() => handleSidebarClick(item)}
                                className={`relative flex items-center gap-3 px-3 py-2 cursor-pointer transition-all mx-1 rounded-sm ${isActive ? 'bg-gradient-to-r from-blue-600/40 to-blue-600/10 text-white border-l-2 border-neon-blue shadow-[0_0_10px_rgba(0,210,255,0.2)]' : 'text-white/80 hover:bg-white/10 hover:text-white border-l-2 border-transparent'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                                title={isSidebarCollapsed ? item.label : ''}
                            >
                                <div className="w-5 h-5 flex items-center justify-center shrink-0 relative">
                                    {item.icon}
                                </div>
                                {!isSidebarCollapsed && <span className="text-sm whitespace-nowrap truncate">{item.label}</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
                {tabs.length > 0 && (
                    <div className="flex items-end gap-[6px] pl-0 pr-4 h-[35px] mt-px border-b border-blue-500/20 bg-[#0c1a35]/20 shrink-0 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                        {tabs.map((tab) => {
                            const isActive = activeTabId === tab.id;
                            return (
                                <div 
                                    key={tab.id} 
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        setContextMenu({ x: e.clientX, y: e.clientY, tabId: tab.id });
                                    }}
                                    onClick={() => setActiveTabId(tab.id)} 
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
                                    <button onClick={(e) => handleCloseTab(e, tab.id)} className={`relative z-10 ml-2 p-0.5 rounded-full hover:bg-blue-500/20 transition-colors ${isActive ? 'opacity-100 text-white' : 'opacity-0 group-hover:opacity-100 text-gray-400'}`}> <XIcon className="w-3 h-3" /> </button> 
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex-1 flex flex-col overflow-hidden relative">
                    {tabs.map(tab => {
                        const isActive = activeTabId === tab.id;
                        return (
                            <div key={tab.id} className={`flex-1 flex flex-col h-full ${isActive ? '' : 'hidden'}`}>
                                {tab.id === 'config' ? (
                                    <DeliveryManagerConfigView />
                                ) : tab.id === 'details' ? (
                                    <DeliveryManagerDetailsView />
                                ) : (
                                    <DeliveryManagerDashboardView 
                                        isSidebarCollapsed={isSidebarCollapsed} 
                                        onNavigateToDetails={() => handleSidebarClick({ id: 'details', label: '交付经理画像明细' })}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Context Menu */}
                {contextMenu && (
                    <div 
                        className="fixed z-[9999] bg-[#0A3458]/95 border border-blue-500/30 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md py-1 w-32 rounded-sm animate-[fadeIn_0.1s_ease-out]"
                        style={{ left: contextMenu.x, top: contextMenu.y }}
                    >
                        <div 
                            className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-xs text-blue-100 hover:text-white transition-colors"
                            onClick={() => {
                                const e = { stopPropagation: () => {} } as React.MouseEvent;
                                handleCloseTab(e, contextMenu.tabId);
                            }}
                        >
                            关闭当前标签
                        </div>
                        <div 
                            className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-xs text-blue-100 hover:text-white transition-colors"
                            onClick={() => handleCloseOtherTabs(contextMenu.tabId)}
                        >
                            关闭其他标签
                        </div>
                        <div 
                            className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-xs text-blue-100 hover:text-white transition-colors"
                            onClick={handleCloseAllTabs}
                        >
                            关闭所有标签
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
