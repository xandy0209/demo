
import React, { useState, useRef, useEffect } from 'react';
import { ComplaintRecord, SubscriptionRecord } from '../types';
import { StyledButton, StyledSelect, StyledInput } from './UI';
import { RefreshCwIcon, PlusCircleIcon, CheckCircleIcon, EditIcon } from './Icons'; 
import { ServiceSelectionModal } from './ServiceSelectionModal';

interface Props {
  record: ComplaintRecord;
  targetTab?: 'basic' | 'flow' | 'process';
  triggerTimestamp?: number;
  onTabChange?: (tab: 'basic' | 'flow' | 'process') => void;
}

// Helper Components
const InfoItem = ({ label, value, span = 1, highlight = false, highlightColor, multiline = false }: any) => {
    let spanClass = 'col-span-1';
    if (span === 2) spanClass = 'col-span-2';
    if (span >= 3) spanClass = 'col-span-3';

    return (
        <div className={`${spanClass} flex ${multiline ? 'items-start' : 'items-baseline'}`}>
            <span className="text-sm text-white font-medium whitespace-nowrap mr-1">{label}：</span>
            <div className={`
                text-sm break-words flex-1
                ${highlight ? 'text-neon-blue font-bold' : 'text-white'}
                ${highlightColor ? highlightColor : ''}
            `}>
                {value || <span className="text-gray-500">-</span>}
            </div>
        </div>
    );
};

const FormRow = ({ label, required, children, align = 'center' }: { label: string, required?: boolean, children?: React.ReactNode, align?: 'center' | 'start' }) => (
    <div className={`flex ${align === 'center' ? 'items-center' : 'items-start'} gap-3`}>
        <label className={`w-[100px] text-right text-sm font-medium text-white shrink-0 whitespace-nowrap ${align === 'start' ? 'pt-1.5' : ''}`}>
            {required && <span className="text-red-500 mr-0.5">*</span>}
            {label}
        </label>
        <div className="flex-1 min-w-0">
            {children}
        </div>
    </div>
);

const FlowChart = ({ stage, isQCRejected, ticketNo, businessType, record }: { stage: string, isQCRejected?: boolean, ticketNo: string, businessType?: string, record?: ComplaintRecord }) => {
    const isBranched = businessType === '数据专线';
    const isClosed = stage === 'Closed' || stage === '已归档' || stage === '归档';

    // Get city names for labels
    const cityA = (record as any)?.cityA || record?.assigneeCity || '呼和浩特';
    const cityZ = (record as any)?.cityZ || '包头';

    const linearNodes = [
        { id: 'T0', label: '工单派发', x: 125, y: 70, aliases: ['待受理', 'T0', '待派发', '工单派发'] },
        { id: 'T1', label: '工单处理', x: 375, y: 70, aliases: ['处理中', 'T1', '工单处理'] },
        { id: 'T2', label: '工单质检', x: 625, y: 70, aliases: ['待质检', 'T2', '工单质检'] },
        { id: 'Closed', label: '归档', x: 875, y: 70, aliases: ['已归档', 'Closed', '归档'] }
    ];

    const branchedNodes = [
        { id: 'T0', label: '工单派发', x: 125, y: 100, aliases: ['待受理', 'T0', '待派发', '工单派发'] },
        { id: 'T1_A', label: '工单处理', x: 375, y: 60, aliases: ['处理中', 'T1', '工单处理'] },
        { id: 'T1_Z', label: '工单处理', x: 375, y: 140, aliases: ['处理中', 'T1', '工单处理'] },
        { id: 'T2', label: '工单质检', x: 625, y: 100, aliases: ['待质检', 'T2', '工单质检'] },
        { id: 'Closed', label: '归档', x: 875, y: 100, aliases: ['已归档', 'Closed', '归档'] }
    ];

    const nodes = isBranched ? branchedNodes : linearNodes;

    const linearEdges = [
        { from: 'T0', to: 'T1' },
        { from: 'T1', to: 'T2' },
        { from: 'T2', to: 'Closed' }
    ];

    const branchedEdges = [
        { from: 'T0', to: 'T1_A', label: cityA },
        { from: 'T0', to: 'T1_Z', label: cityZ },
        { from: 'T1_A', to: 'T2' },
        { from: 'T1_Z', to: 'T2' },
        { from: 'T2', to: 'Closed' }
    ];

    const edges = isBranched ? branchedEdges : linearEdges;

    // Determine which stages have been completed
    const completedStages = new Set<string>();
    if (isClosed) {
        nodes.forEach(s => completedStages.add(s.id));
    } else if (stage === '待质检' || stage === 'T2' || stage === '工单质检') {
        completedStages.add('T0');
        if (isBranched) {
            completedStages.add('T1_A');
            completedStages.add('T1_Z');
            completedStages.add('T2');
        } else {
            completedStages.add('T1');
            completedStages.add('T2');
        }
    } else if (stage === '处理中' || stage === 'T1' || stage === '工单处理') {
        completedStages.add('T0');
        if (isBranched) {
            completedStages.add('T1_A');
            completedStages.add('T1_Z');
        } else {
            completedStages.add('T1');
        }
    }
    
    // If rejected, the previous stages are still considered "completed" (passed through)
    if (isQCRejected) {
        completedStages.add('T0');
        if (isBranched) {
            completedStages.add('T1_A');
            completedStages.add('T1_Z');
            completedStages.add('T2_A');
            completedStages.add('T2_Z');
        } else {
            completedStages.add('T1');
            completedStages.add('T2');
        }
    }

    const activeNodes = new Set<string>();
    if (isClosed) {
        activeNodes.add('Closed');
    } else if (stage === '待质检' || stage === 'T2' || stage === '工单质检') {
        activeNodes.add('T2');
    } else if (stage === '处理中' || stage === 'T1' || stage === '工单处理') {
        if (isBranched) {
            activeNodes.add('T1_A');
            activeNodes.add('T1_Z');
        } else {
            activeNodes.add('T1');
        }
    } else {
        activeNodes.add('T0');
    }

    // Use localStorage to persist rejection status
    const [rejectionStatus, setRejectionStatus] = useState(() => {
        const saved = localStorage.getItem(`rejectionHistory_${ticketNo}`);
        return saved ? JSON.parse(saved) : { isRejectedToT0: false, isRejectedFromQC: false };
    });

    useEffect(() => {
        if (isQCRejected || stage === '待派发' || stage === '待受理' || stage === 'T0' || stage === '工单派发') {
            const isT0 = stage === '待派发' || stage === '待受理' || stage === 'T0' || stage === '工单派发';
            const newStatus = {
                isRejectedToT0: rejectionStatus.isRejectedToT0 || isT0,
                isRejectedFromQC: rejectionStatus.isRejectedFromQC || isQCRejected
            };
            setRejectionStatus(newStatus);
            localStorage.setItem(`rejectionHistory_${ticketNo}`, JSON.stringify(newStatus));
        }
    }, [isQCRejected, stage, ticketNo]);

    const isRejectedToT0 = rejectionStatus.isRejectedToT0;
    const isRejectedFromQC = rejectionStatus.isRejectedFromQC;

    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.9); 
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.clientWidth;
            const initialX = (containerWidth - 1000 * scale) / 2;
            setPosition({ x: initialX, y: isBranched ? 10 : 10 });
        }
    }, [isBranched]);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newScale = Math.min(Math.max(scale + delta, 0.4), 2.5);
        setScale(newScale);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const isNodeActiveOrCompleted = (id: string) => activeNodes.has(id) || completedStages.has(id);
    const isEdgeActive = (from: string, to: string) => {
        if (activeNodes.has(from)) return false; // If 'from' is currently active, edge to 'to' is not active yet
        return isNodeActiveOrCompleted(from) && isNodeActiveOrCompleted(to);
    };

    return (
        <div className={`relative w-full ${isBranched ? 'h-56' : 'h-32'} my-2 overflow-hidden group`}>
            <div 
                ref={containerRef}
                className={`w-full h-full cursor-${isDragging ? 'grabbing' : 'grab'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            >
                <div 
                    style={{ 
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: '0 0',
                        width: '1000px', 
                        height: isBranched ? '200px' : '120px',
                    }}
                    className="relative transition-transform duration-75 ease-linear"
                >
                    <svg 
                        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" 
                        viewBox={`0 0 1000 ${isBranched ? 200 : 120}`} 
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <marker id="arrow-blue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                                <path d="M0,0 L0,6 L9,3 z" fill="#00d2ff" />
                            </marker>
                            <marker id="arrow-gray" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                                <path d="M0,0 L0,6 L9,3 z" fill="#334155" />
                            </marker>
                            <marker id="arrow-reject" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                                <path d="M0,0 L0,6 L7,3 z" fill="#94a3b8" />
                            </marker>
                            <marker id="arrow-reject-active" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                                <path d="M0,0 L0,6 L7,3 z" fill="#ef4444" />
                            </marker>
                        </defs>

                        {edges.map((edge: any, idx) => {
                            const fromNode = nodes.find(n => n.id === edge.from)!;
                            const toNode = nodes.find(n => n.id === edge.to)!;
                            const isActive = isEdgeActive(edge.from, edge.to);
                            
                            // Calculate edge start and end points
                            // Node width is 130, so half is 65
                            const x1 = fromNode.x + 65;
                            const y1 = fromNode.y;
                            const x2 = toNode.x - 65;
                            const y2 = toNode.y;

                            let pathElement;
                            // If y1 != y2, we draw a curved or angled path
                            if (y1 !== y2) {
                                const midX = (x1 + x2) / 2;
                                pathElement = (
                                    <path 
                                        d={`M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`}
                                        fill="none"
                                        stroke={isActive ? "#00d2ff" : "#334155"} 
                                        strokeWidth="1.5"
                                        markerEnd={`url(#arrow-${isActive ? 'blue' : 'gray'})`}
                                    />
                                );
                            } else {
                                pathElement = (
                                    <line 
                                        x1={x1} y1={y1} x2={x2} y2={y2}
                                        stroke={isActive ? "#00d2ff" : "#334155"} 
                                        strokeWidth="1.5"
                                        markerEnd={`url(#arrow-${isActive ? 'blue' : 'gray'})`}
                                    />
                                );
                            }

                            return (
                                <g key={`edge-${idx}`}>
                                    {pathElement}
                                    {edge.label && (
                                        <text 
                                            x={x2 - 30} 
                                            y={y2 - 6} 
                                            fill={isActive ? "#00d2ff" : "#334155"} 
                                            fontSize="11" 
                                            textAnchor="middle"
                                        >
                                            {edge.label}
                                        </text>
                                    )}
                                </g>
                            );
                        })}

                        {isBranched ? (
                            <>
                                {/* Reject from QC (A) */}
                                <path d="M 615 80 L 615 20 L 385 20 L 385 40" fill="none" stroke={isRejectedFromQC ? "#ef4444" : "#94a3b8"} strokeWidth="1.5" markerEnd={`url(#arrow-reject${isRejectedFromQC ? '-active' : ''})`} />
                                <rect x="480" y="12" width="40" height="16" fill="#0b1730" fillOpacity="0.9" />
                                <text x="500" y="23" fill={isRejectedFromQC ? "#ef4444" : "#94a3b8"} fontSize="11" textAnchor="middle">驳回</text>

                                {/* Reject from QC (Z) */}
                                <path d="M 615 120 L 615 180 L 385 180 L 385 160" fill="none" stroke={isRejectedFromQC ? "#ef4444" : "#94a3b8"} strokeWidth="1.5" markerEnd={`url(#arrow-reject${isRejectedFromQC ? '-active' : ''})`} />
                                <rect x="480" y="172" width="40" height="16" fill="#0b1730" fillOpacity="0.9" />
                                <text x="500" y="183" fill={isRejectedFromQC ? "#ef4444" : "#94a3b8"} fontSize="11" textAnchor="middle">驳回</text>

                                {/* Reject to T0 (A) */}
                                <path d="M 365 40 L 365 20 L 135 20 L 135 80" fill="none" stroke={isRejectedToT0 ? "#ef4444" : "#94a3b8"} strokeWidth="1.5" markerEnd={`url(#arrow-reject${isRejectedToT0 ? '-active' : ''})`} />
                                <rect x="230" y="12" width="40" height="16" fill="#0b1730" fillOpacity="0.9" />
                                <text x="250" y="23" fill={isRejectedToT0 ? "#ef4444" : "#94a3b8"} fontSize="11" textAnchor="middle">驳回</text>

                                {/* Reject to T0 (Z) */}
                                <path d="M 365 160 L 365 180 L 135 180 L 135 120" fill="none" stroke={isRejectedToT0 ? "#ef4444" : "#94a3b8"} strokeWidth="1.5" markerEnd={`url(#arrow-reject${isRejectedToT0 ? '-active' : ''})`} />
                                <rect x="230" y="172" width="40" height="16" fill="#0b1730" fillOpacity="0.9" />
                                <text x="250" y="183" fill={isRejectedToT0 ? "#ef4444" : "#94a3b8"} fontSize="11" textAnchor="middle">驳回</text>
                            </>
                        ) : (
                            <>
                                <path 
                                    d="M 615 50 L 615 20 L 385 20 L 385 50" 
                                    fill="none" 
                                    stroke={isRejectedFromQC ? "#ef4444" : "#94a3b8"} 
                                    strokeWidth="1.5" 
                                    markerEnd={`url(#arrow-reject${isRejectedFromQC ? '-active' : ''})`}
                                />
                                <rect x="480" y="12" width="40" height="16" fill="#0b1730" fillOpacity="0.9" />
                                <text x="500" y="23" fill={isRejectedFromQC ? "#ef4444" : "#94a3b8"} fontSize="11" textAnchor="middle">驳回</text>

                                <path 
                                    d="M 365 50 L 365 20 L 135 20 L 135 50" 
                                    fill="none" 
                                    stroke={isRejectedToT0 ? "#ef4444" : "#94a3b8"} 
                                    strokeWidth="1.5" 
                                    markerEnd={`url(#arrow-reject${isRejectedToT0 ? '-active' : ''})`}
                                />
                                <rect x="230" y="12" width="40" height="16" fill="#0b1730" fillOpacity="0.9" />
                                <text x="250" y="23" fill={isRejectedToT0 ? "#ef4444" : "#94a3b8"} fontSize="11" textAnchor="middle">驳回</text>
                            </>
                        )}
                    </svg>

                    {nodes.map((step, idx) => {
                        const isActive = activeNodes.has(step.id);
                        const isCompleted = completedStages.has(step.id);
                        
                        let bgClass = "bg-[#0b1730] border-gray-700 text-gray-500"; 
                        let glowClass = "";

                        if (isCompleted) {
                            bgClass = "bg-[#007acc]/20 border-[#007acc] text-blue-200"; 
                        }
                        if (isActive) {
                            bgClass = "bg-[#0b1730] text-neon-blue border-neon-blue font-bold"; 
                            glowClass = "shadow-[0_0_15px_rgba(0,210,255,0.4)]";
                        }

                        if (step.id === 'Closed' && isClosed) {
                             bgClass = "bg-[#007acc]/20 border-[#007acc] text-blue-200";
                             glowClass = ""; 
                        }
                        
                        const left = step.x - 65;
                        const top = step.y - 20;

                        return (
                            <div 
                                key={step.id} 
                                className="absolute flex flex-col items-center justify-center gap-2"
                                style={{ left: `${left}px`, top: `${top}px`, width: '130px', height: '40px' }}
                            >
                                <div className={`
                                    w-full h-full flex items-center justify-center border rounded-sm text-sm transition-all duration-300 select-none
                                    ${bgClass} ${glowClass}
                                `}>
                                    {step.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const generateLogs = (record: ComplaintRecord) => {
    const isDedicatedLine = record.productType === '数据专线';
    const logs = [];
    const dispatchTime = record.complaintTime || '2026-01-11 06:30:48';
    const baseTime = new Date(dispatchTime.replace(' ', 'T')).getTime(); 
    
    // Get city names, fallback to A端/Z端 if not available
    const cityA = (record as any).cityA || record.assigneeCity || '呼和浩特';
    const cityZ = (record as any).cityZ || '包头';

    // Common Dispatch Log
    logs.push({
        time: dispatchTime,
        opName: '派发',
        stage: '工单派发',
        operator: '系统自动 (10086)',
        info: `客户[${record.customerName}]来电报障，系统自动派单至[${record.assigneeCity}]`
    });

    if (record.stage !== 'T0' && record.stage !== '待受理' && record.stage !== '待下派') {
        const t1Time = new Date(baseTime + 300000).toISOString().replace('T', ' ').substring(0, 19);
        
        if (isDedicatedLine) {
            // A-end Processing
            logs.push({
                time: t1Time,
                opName: '受理',
                stage: `工单处理[${cityA}]`,
                operator: `${record.assignee.split('-')[0]}张工 (13800138000)`,
                info: '已接单，准备前往现场排查'
            });
            // Z-end Processing
            logs.push({
                time: t1Time,
                opName: '受理',
                stage: `工单处理[${cityZ}]`,
                operator: `${record.assignee.split('-')[0]}李工 (13800138001)`,
                info: '已接单，准备前往现场排查'
            });
        } else {
            logs.push({
                time: t1Time,
                opName: '受理',
                stage: '工单处理',
                operator: `${record.assignee.split('-')[0]}张工 (13800138000)`,
                info: '已接单，准备前往现场排查'
            });
        }

        if (['T2', 'Closed', '待质检', '已归档'].includes(record.stage)) {
            const t1DoneTime = new Date(baseTime + 1200000).toISOString().replace('T', ' ').substring(0, 19);
            
            if (isDedicatedLine) {
                // A-end Done
                logs.push({
                    time: t1DoneTime,
                    opName: '回单',
                    stage: `工单处理[${cityA}]`,
                    operator: `${record.assignee.split('-')[0]}张工 (13800138000)`,
                    info: `故障已修复。原因：${record.faultType || '光缆故障'}。结果：${record.faultResult || '已修复'}`
                });
                // Z-end Done
                logs.push({
                    time: t1DoneTime,
                    opName: '回单',
                    stage: `工单处理[${cityZ}]`,
                    operator: `${record.assignee.split('-')[0]}李工 (13800138001)`,
                    info: `故障已修复。原因：${record.faultType || '光缆故障'}。结果：${record.faultResult || '已修复'}`
                });
            } else {
                logs.push({
                    time: t1DoneTime,
                    opName: '回单',
                    stage: '工单处理',
                    operator: `${record.assignee.split('-')[0]}张工 (13800138000)`,
                    info: `故障已修复。原因：${record.faultType || '光缆故障'}。结果：${record.faultResult || '已修复'}`
                });
            }
        }
    }

    if (record.stage === 'Closed' || record.stage === '已归档') {
        const t2Time = new Date(baseTime + 18000000).toISOString().replace('T', ' ').substring(0, 19);
        logs.push({
            time: t2Time,
            opName: '通过',
            stage: '工单质检',
            operator: '质检员李工 (13900139000)',
            info: '回访客户满意，工单归档'
        });
        
        const closeTime = new Date(baseTime + 18060000).toISOString().replace('T', ' ').substring(0, 19);
        logs.push({
            time: closeTime,
            opName: '系统归档',
            stage: '归档',
            operator: '系统自动',
            info: '流程结束'
        });
    }

    return logs.sort((a, b) => {
        return new Date(b.time.replace(' ', 'T')).getTime() - new Date(a.time.replace(' ', 'T')).getTime();
    });
};

export const ComplaintDetailView: React.FC<Props> = ({ record, targetTab, triggerTimestamp, onTabChange }) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'flow' | 'process'>('basic');
  const [currentStage, setCurrentStage] = useState(record.stage);
  const [logs, setLogs] = useState(() => generateLogs(record));
  const [isQCRejected, setIsQCRejected] = useState(false);

  useEffect(() => {
    if (targetTab) {
        setActiveTab(targetTab);
    }
  }, [triggerTimestamp, targetTab]); // Updated dependency to include targetTab for reliable updates
  
  const [businessInfo, setBusinessInfo] = useState({
      productType: record.productType,
      productInstance: record.productInstance,
      customerName: record.customerName,
      customerCode: record.customerCode,
      circuitCode: record.circuitCode,
      serviceAddressA: record.serviceAddressA,
      serviceAddressZ: record.serviceAddressZ,
      cityA: record.assigneeCity || '',
      districtA: (record as any).districtA || '',
      cityZ: (record as any).cityZ || '',
      districtZ: (record as any).districtZ || '',
      broadbandAccount: '',
      businessCategory: record.businessCategory,
      aAssuranceLevel: (record as any).aAssuranceLevel || '',
      zAssuranceLevel: (record as any).zAssuranceLevel || ''
  });

  const [processResultType, setProcessResultType] = useState<'reply' | 'reassign' | 'reject'>('reply');
  const [processRejectReason, setProcessRejectReason] = useState('');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const [replyData, setReplyData] = useState({
      faultResult: '',
      faultType: '',
      faultCause: ''
  });
  const [dispatchData, setDispatchData] = useState({
      dispatchA: true,
      dispatchZ: false,
      dispatchObjectA: '',
      dispatchObjectZ: '',
      teamA: '',
      teamZ: '',
      personA: '',
      personZ: '',
  });
  const [qcData, setQcData] = useState({
      qcResult: '',
      isSatisfied: '',
      isFaultRecovered: '',
      qcRemarks: '',
      rejectReason: ''
  });

  useEffect(() => {
      setCurrentStage(record.stage);
      setLogs(generateLogs(record));
      setIsQCRejected(false);
      setProcessResultType('reply');
      setReplyData({ faultResult: '', faultType: '', faultCause: '' });
      setQcData({ qcResult: '', isSatisfied: '', isFaultRecovered: '', qcRemarks: '', rejectReason: '' });
      setDispatchData({
          dispatchA: true,
          dispatchZ: false,
          dispatchObjectA: '',
          dispatchObjectZ: '',
          teamA: '',
          teamZ: '',
          personA: '',
          personZ: '',
      });
      setBusinessInfo({
          productType: record.productType,
          productInstance: record.productInstance,
          customerName: record.customerName,
          customerCode: record.customerCode,
          circuitCode: record.circuitCode,
          serviceAddressA: record.serviceAddressA,
          serviceAddressZ: record.serviceAddressZ,
          cityA: record.assigneeCity || '',
          districtA: (record as any).districtA || '',
          cityZ: (record as any).cityZ || '',
          districtZ: (record as any).districtZ || '',
          broadbandAccount: '',
          businessCategory: record.businessCategory,
          aAssuranceLevel: (record as any).aAssuranceLevel || '',
          zAssuranceLevel: (record as any).zAssuranceLevel || ''
      });
  }, [record]);

  const handleAccept = () => {
      setCurrentStage('处理中');
      setIsQCRejected(false);
      setLogs(prev => [
          {
              time: new Date().toISOString().replace('T', ' ').substring(0, 19),
              opName: '受理',
              stage: '工单处理',
              operator: `${record.assignee.split('-')[0]}张工 (13800138000)`,
              info: '已接单，准备前往现场排查'
          },
          ...prev
      ]);
  };

  const handleReplySubmit = () => {
      setCurrentStage('待质检');
      setIsQCRejected(false);
      setLogs(prev => [
          {
              time: new Date().toISOString().replace('T', ' ').substring(0, 19),
              opName: '回单',
              stage: '工单处理',
              operator: `${record.assignee.split('-')[0]}张工 (13800138000)`,
              info: `故障已修复。原因：${replyData.faultType || '光缆故障'}。结果：${replyData.faultResult || '已修复'}`
          },
          ...prev
      ]);
  };

  const handleRejectSubmit = () => {
      setCurrentStage('待派发');
      setIsQCRejected(false);
      setLogs(prev => [
          {
              time: new Date().toISOString().replace('T', ' ').substring(0, 19),
              opName: '驳回',
              stage: '工单处理',
              operator: `${record.assignee.split('-')[0]}张工 (13800138000)`,
              info: `工单已驳回。原因：${processRejectReason || '无'}`
          },
          ...prev
      ]);
  };

  const handleQCSubmit = () => {
      if (qcData.qcResult === '通过') {
          setCurrentStage('已归档');
          setLogs(prev => [
              {
                  time: new Date().toISOString().replace('T', ' ').substring(0, 19),
                  opName: '系统归档',
                  stage: '归档',
                  operator: '系统自动',
                  info: '流程结束'
              },
              {
                  time: new Date().toISOString().replace('T', ' ').substring(0, 19),
                  opName: '通过',
                  stage: '工单质检',
                  operator: '质检员李工 (13900139000)',
                  info: '回访客户满意，工单归档'
              },
              ...prev
          ]);
          setActiveTab('basic');
          if (onTabChange) onTabChange('basic');
      } else if (qcData.qcResult === '驳回') {
          setCurrentStage('处理中');
          setIsQCRejected(true);
          setLogs(prev => [
              {
                  time: new Date().toISOString().replace('T', ' ').substring(0, 19),
                  opName: '驳回',
                  stage: '工单质检',
                  operator: '质检员李工 (13900139000)',
                  info: `质检驳回，重新处理。`
              },
              ...prev
          ]);
      }
  };

  const handleServiceUpdate = (sub: SubscriptionRecord) => {
    setBusinessInfo({
        productType: sub.businessCategory === '企宽' ? '企宽' : sub.serviceType,
        productInstance: sub.productInstance || '',
        customerName: sub.customerName || '',
        customerCode: sub.customerCode || '',
        circuitCode: sub.circuitCode || '',
        serviceAddressA: sub.addressA || '',
        serviceAddressZ: sub.serviceType === '数据专线' ? (sub.addressZ || '') : '',
        cityA: sub.cityA || '',
        districtA: sub.districtA || '',
        cityZ: sub.cityZ || '',
        districtZ: sub.districtZ || '',
        broadbandAccount: sub.broadbandAccount || '',
        businessCategory: sub.businessCategory || '',
        aAssuranceLevel: sub.aAssuranceLevel || '',
        zAssuranceLevel: sub.zAssuranceLevel || ''
    });
    setIsServiceModalOpen(false);
  };

  const tabs = [
      { id: 'basic', label: '基本信息' },
      { id: 'flow', label: '流转信息' }
  ];
  
  // Adjusted processing logic to handle Chinese status labels correctly
  const processingStages = ['T0', 'T1', 'T2', '待受理', '处理中', '待质检'];
  const canShowProcess = processingStages.includes(currentStage);
  
  if (canShowProcess) {
      tabs.push({ id: 'process', label: '工单处理' });
  }

  const displayRecord = { ...record, stage: currentStage as any };
  const currentDisplayTab = (activeTab === 'process' && !canShowProcess) ? 'basic' : activeTab;

  const handleTabClick = (tabId: 'basic' | 'flow' | 'process') => {
      setActiveTab(tabId);
      if (onTabChange) onTabChange(tabId);
  };

  return (
    <div className="flex flex-col h-full bg-transparent backdrop-blur-sm text-blue-100 animate-[fadeIn_0.3s_ease-out] overflow-hidden border border-blue-500/30 shadow-[inset_0_0_20px_rgba(0,133,208,0.1)]">
        <div className="flex items-end pt-4">
            <div className="w-6 border-b border-blue-500/20"></div>
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id as any)}
                    className={`
                        px-6 py-2 text-sm font-medium transition-all relative rounded-t-sm 
                        ${currentDisplayTab === tab.id 
                            ? 'text-neon-blue bg-transparent border-t border-l border-r border-blue-500/30 border-b-transparent z-10' 
                            : 'text-gray-400 border-b border-blue-500/20 hover:text-gray-200 hover:bg-white/5'}
                    `}
                >
                    {tab.label}
                </button>
            ))}
            <div className="flex-1 border-b border-blue-500/20"></div> 
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {currentDisplayTab === 'basic' && (
                <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                    <div>
                        <h3 className="text-sm font-bold text-neon-blue mb-3 uppercase tracking-wider border-l-2 border-neon-blue pl-2">
                            工单基本信息
                        </h3>
                        <div className="grid grid-cols-3 gap-4 bg-blue-900/10 p-4 border border-blue-500/20 rounded-sm">
                            <InfoItem label="工单编号" value={displayRecord.ticketNo} />
                            <InfoItem label="工单状态" value={displayRecord.stage} />
                            <InfoItem label="工单来源" value={displayRecord.ticketSource || '客户来电'} />
                            <InfoItem label="派单时间" value={displayRecord.complaintTime} />
                            <InfoItem label="处理时限" value={displayRecord.slaDeadline} />
                            <InfoItem label="地市" value={displayRecord.assigneeCity} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-neon-blue mb-3 uppercase tracking-wider border-l-2 border-neon-blue pl-2 flex items-center gap-2">
                            客户业务信息
                            {['处理中', '待质检', 'T1', 'T2'].includes(currentStage) && (
                                <button 
                                    onClick={() => setIsServiceModalOpen(true)}
                                    className="text-blue-400 hover:text-white transition-colors p-0.5 rounded hover:bg-white/10"
                                    title="修改业务信息"
                                >
                                    <EditIcon />
                                </button>
                            )}
                        </h3>
                        <div className="grid grid-cols-3 gap-4 bg-blue-900/10 p-4 border border-blue-500/20 rounded-sm">
                            {(businessInfo.businessCategory === '企宽' || businessInfo.productType === '企宽') ? (
                                <>
                                    <InfoItem label="业务类型" value="企宽" />
                                    <InfoItem label="宽带账号" value={businessInfo.broadbandAccount || '无'} />
                                    <InfoItem label="客户名称" value={businessInfo.customerName} />
                                    <InfoItem label="客户编号" value={businessInfo.customerCode} />
                                    <InfoItem label="保障等级" value={(businessInfo as any).aAssuranceLevel || '普通'} />
                                    <InfoItem label="地市" value={businessInfo.cityA} />
                                    <InfoItem label="区县" value={businessInfo.districtA} />
                                    <InfoItem label="业务地址" value={businessInfo.serviceAddressA} span={3} />
                                </>
                            ) : (
                                <>
                                    <InfoItem label="业务类型" value={businessInfo.productType} />
                                    <InfoItem label="产品实例" value={businessInfo.productInstance} />
                                    <InfoItem label="电路编号" value={businessInfo.circuitCode} />
                                    <InfoItem label="客户名称" value={businessInfo.customerName} />
                                    <InfoItem label="客户编号" value={businessInfo.customerCode} />
                                    <InfoItem 
                                        label={businessInfo.productType === '数据专线' ? "A端保障等级" : "保障等级"} 
                                        value={(businessInfo as any).aAssuranceLevel || '普通'} 
                                    />
                                    {businessInfo.productType === '数据专线' ? (
                                        <>
                                            <InfoItem label="A端地市" value={businessInfo.cityA} />
                                            <InfoItem label="A端区县" value={businessInfo.districtA} />
                                            <InfoItem label="Z端保障等级" value={(businessInfo as any).zAssuranceLevel || '普通'} />
                                            <InfoItem label="A端地址" value={businessInfo.serviceAddressA} span={3} />
                                            <InfoItem label="Z端地市" value={businessInfo.cityZ} />
                                            <InfoItem label="Z端区县" value={businessInfo.districtZ} />
                                            <div className="col-span-1"></div>
                                            <InfoItem label="Z端地址" value={businessInfo.serviceAddressZ} span={3} />
                                        </>
                                    ) : (
                                        <>
                                            <InfoItem label="地市" value={businessInfo.cityA} />
                                            <InfoItem label="区县" value={businessInfo.districtA} />
                                            <div className="col-span-1"></div>
                                            <InfoItem label="业务地址" value={businessInfo.serviceAddressA} span={3} />
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-neon-blue mb-3 uppercase tracking-wider border-l-2 border-neon-blue pl-2">
                            投诉信息
                        </h3>
                        <div className="grid grid-cols-3 gap-4 bg-blue-900/10 p-4 border border-blue-500/20 rounded-sm">
                            <InfoItem label="故障时间" value={displayRecord.faultTime} />
                            <InfoItem label="投诉人" value={displayRecord.contactPerson} />
                            <InfoItem label="投诉人电话" value={displayRecord.contactPhone} />
                            <InfoItem label="投诉内容" value={displayRecord.complaintContent} span={3} multiline />
                            
                            {(displayRecord.stage === '已归档' || displayRecord.stage === 'Closed') && (
                                <>
                                    <div className="col-span-3 h-px bg-blue-500/20 my-2"></div>
                                    <InfoItem label="处理结果" value={displayRecord.faultResult} />
                                    <InfoItem label="故障类型" value={displayRecord.faultType} />
                                    <InfoItem label="客户是否满意" value={displayRecord.isSatisfied} />
                                    <InfoItem label="故障是否恢复" value={displayRecord.isRecovered} />
                                    <div className="col-span-2"></div>
                                    <InfoItem label="故障原因" value={displayRecord.faultCause} span={3} multiline />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {currentDisplayTab === 'flow' && (
                <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                    <div className="bg-blue-900/10 p-4 border border-blue-500/20 rounded-sm overflow-hidden">
                        <h4 className="text-xs font-bold text-blue-300 mb-2 uppercase">流程图</h4>
                        <FlowChart stage={displayRecord.stage} isQCRejected={isQCRejected} ticketNo={displayRecord.ticketNo} businessType={businessInfo.productType} record={record} />
                    </div>
                    <div className="bg-blue-900/10 p-0 border border-blue-500/20 rounded-sm overflow-hidden">
                        <div className="px-4 py-2 border-b border-blue-500/20 bg-[#0c2242]/50">
                             <h4 className="text-xs font-bold text-blue-300 uppercase">流转日志</h4>
                        </div>
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#0b1730] text-white">
                                <tr>
                                    <th className="p-3 font-medium border-b border-blue-500/10 w-[160px]">处理时间</th>
                                    <th className="p-3 font-medium border-b border-blue-500/10 w-[80px]">操作</th>
                                    <th className="p-3 font-medium border-b border-blue-500/10 w-[100px]">环节</th>
                                    <th className="p-3 font-medium border-b border-blue-500/10 w-[150px]">处理人</th>
                                    <th className="p-3 font-medium border-b border-blue-500/10">处理意见</th>
                                </tr>
                            </thead>
                            <tbody className="text-blue-100">
                                {logs.map((log, idx) => (
                                    <tr key={idx} className="hover:bg-blue-600/10 border-b border-blue-500/5 last:border-0">
                                        <td className="p-3 font-mono text-white whitespace-nowrap">{log.time}</td>
                                        <td className="p-3 whitespace-nowrap">
                                            <span className={`px-1.5 py-0.5 rounded-sm border ${
                                                log.opName === '派发' ? 'border-yellow-500/30 text-yellow-300 bg-yellow-500/10' :
                                                log.opName === '受理' ? 'border-blue-500/30 text-blue-300 bg-blue-500/10' :
                                                log.opName === '回单' ? 'border-green-500/30 text-green-300 bg-green-500/10' :
                                                log.opName === '通过' ? 'border-purple-500/30 text-purple-300 bg-purple-500/10' :
                                                'border-gray-500/30 text-gray-300 bg-gray-500/10'
                                            }`}>
                                                {log.opName}
                                            </span>
                                        </td>
                                        <td className="p-3 whitespace-nowrap">{log.stage}</td>
                                        <td className="p-3 text-white">{log.operator}</td>
                                        <td className="p-3 text-white">{log.info}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {currentDisplayTab === 'process' && (
                <div className="space-y-6 animate-[fadeIn_0.3s_ease-out] w-2/3 mx-auto">
                    {(currentStage === 'T0' || currentStage === '待受理') && (
                        <div className="bg-blue-900/10 p-6 border border-blue-500/20 rounded-sm space-y-4 min-h-[200px] flex flex-col">
                             <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider border-l-2 border-neon-blue pl-2">
                                工单受理
                            </h3>
                            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                <div className="text-blue-200 text-[14px] text-center">该工单目前处于<span className="text-yellow-400 font-bold">待受理</span>状态，请核实投诉内容后点击下方按钮进行受理。</div>
                                <StyledButton 
                                    variant="primary" 
                                    className="px-8 py-2 h-auto text-base"
                                    onClick={handleAccept}
                                    icon={<CheckCircleIcon />}
                                >
                                    立即受理
                                </StyledButton>
                            </div>
                        </div>
                    )}

                    {(currentStage === 'T1' || currentStage === '处理中') && (
                        <div className="p-6 border border-blue-500/20 rounded-sm space-y-6 flex flex-col items-center">
                            <div className="flex flex-col gap-4 w-full max-w-2xl">
                                <FormRow label="处理结果" required>
                                    <div className="flex items-center gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input 
                                                type="radio" 
                                                name="processResultType" 
                                                checked={processResultType === 'reply'} 
                                                onChange={() => setProcessResultType('reply')}
                                                className="accent-neon-blue w-3.5 h-3.5 cursor-pointer"
                                            />
                                            <span className={`text-sm font-medium ${processResultType === 'reply' ? 'text-neon-blue font-bold' : 'text-white/60 group-hover:text-white'}`}>回单</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input 
                                                type="radio" 
                                                name="processResultType" 
                                                checked={processResultType === 'reassign'} 
                                                onChange={() => setProcessResultType('reassign')}
                                                className="accent-neon-blue w-3.5 h-3.5 cursor-pointer"
                                            />
                                            <span className={`text-sm font-medium ${processResultType === 'reassign' ? 'text-neon-blue font-bold' : 'text-white/60 group-hover:text-white'}`}>转派</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input 
                                                type="radio" 
                                                name="processResultType" 
                                                checked={processResultType === 'reject'} 
                                                onChange={() => setProcessResultType('reject')}
                                                className="accent-neon-blue w-3.5 h-3.5 cursor-pointer"
                                            />
                                            <span className={`text-sm font-medium ${processResultType === 'reject' ? 'text-neon-blue font-bold' : 'text-white/60 group-hover:text-white'}`}>驳回</span>
                                        </label>
                                    </div>
                                </FormRow>
                            </div>

                            {processResultType === 'reply' ? (
                                <div className="grid grid-cols-2 gap-x-8 gap-y-4 animate-[fadeIn_0.2s_ease-out] w-full max-w-2xl">
                                    <FormRow label="故障类型" required>
                                        <StyledSelect 
                                            className="w-full"
                                            value={replyData.faultType}
                                            onChange={(e) => setReplyData({...replyData, faultType: e.target.value})}
                                        >
                                            <option value="">请选择</option>
                                            <option value="网络故障（客响）">网络故障（客响）</option>
                                            <option value="网络故障（传输）">网络故障（传输）</option>
                                            <option value="网络故障（承载）">网络故障（承载）</option>
                                            <option value="客户故障">客户故障</option>
                                        </StyledSelect>
                                    </FormRow>
                                    <FormRow label="处理结果" required>
                                        <StyledSelect 
                                            className="w-full"
                                            value={replyData.faultResult}
                                            onChange={(e) => setReplyData({...replyData, faultResult: e.target.value})}
                                        >
                                            <option value="">请选择</option>
                                            <option value="已解决">已解决</option>
                                            <option value="未解决">未解决</option>
                                        </StyledSelect>
                                    </FormRow>
                                    <div className="col-span-2">
                                        <FormRow label="故障原因" required align="start">
                                            <textarea 
                                                className="w-full bg-[#0f172a]/30 border border-[#0085D0]/50 text-blue-100 text-sm px-3 py-2 focus:outline-none focus:border-neon-blue transition-colors rounded-none h-24 resize-none leading-relaxed"
                                                value={replyData.faultCause}
                                                onChange={(e) => setReplyData({...replyData, faultCause: e.target.value})}
                                                placeholder="请详细描述故障处理过程及结果..."
                                            ></textarea>
                                        </FormRow>
                                    </div>
                                    <div className="col-span-2 flex justify-end gap-3 mt-2">
                                        <StyledButton variant="secondary">暂存</StyledButton>
                                        <StyledButton variant="primary" onClick={handleReplySubmit}>提交回单</StyledButton>
                                    </div>
                                </div>
                            ) : processResultType === 'reassign' ? (
                                <div className="space-y-4 animate-[fadeIn_0.2s_ease-out] w-full max-w-2xl">
                                    <div className="p-0 space-y-6">
                                        {/* A端下派 */}
                                        <div className="space-y-3">
                                            <div className="space-y-3 animate-[fadeIn_0.2s_ease-out]">
                                                <FormRow label="转派对象" required={dispatchData.dispatchA}>
                                                    <StyledSelect 
                                                        value={dispatchData.dispatchObjectA}
                                                        onChange={(e) => setDispatchData({...dispatchData, dispatchObjectA: e.target.value})}
                                                        className="w-[280px]"
                                                        disabled={!dispatchData.dispatchA}
                                                    >
                                                        <option value="">请选择</option>
                                                        <option value="铁通班组">铁通班组</option>
                                                        <option value="分公司客响人员">分公司客响人员</option>
                                                    </StyledSelect>
                                                </FormRow>
                                                {dispatchData.dispatchObjectA === '铁通班组' && (
                                                    <FormRow label="转派班组" required={dispatchData.dispatchA}>
                                                        <StyledSelect 
                                                            value={dispatchData.teamA}
                                                            onChange={(e) => setDispatchData({...dispatchData, teamA: e.target.value})}
                                                            className="w-[280px]"
                                                        >
                                                            <option value="">请选择</option>
                                                            <option value="铁通维护一班">铁通维护一班</option>
                                                            <option value="铁通抢修二班">铁通抢修二班</option>
                                                            <option value="综合维护组">综合维护组</option>
                                                        </StyledSelect>
                                                    </FormRow>
                                                )}
                                                {dispatchData.dispatchObjectA === '分公司客响人员' && (
                                                    <FormRow label="转派人员" required={dispatchData.dispatchA}>
                                                        <StyledSelect 
                                                            value={dispatchData.personA}
                                                            onChange={(e) => setDispatchData({...dispatchData, personA: e.target.value})}
                                                            className="w-[280px]"
                                                        >
                                                            <option value="">请选择</option>
                                                            <option value="王工 (13811112222)">王工 (13811112222)</option>
                                                            <option value="赵工 (13833334444)">赵工 (13833334444)</option>
                                                            <option value="孙工 (13855556666)">孙工 (13855556666)</option>
                                                        </StyledSelect>
                                                    </FormRow>
                                                )}
                                            </div>
                                        </div>

                                        {/* Z端下派 - 仅当是数据专线且有Z端地址时显示 */}
                                        {businessInfo.productType === '数据专线' && businessInfo.cityZ && (
                                            <div className="space-y-3 border-t border-blue-500/10 pt-6">
                                                <div className="space-y-3 animate-[fadeIn_0.2s_ease-out]">
                                                    <FormRow label="转派对象" required={dispatchData.dispatchZ}>
                                                        <StyledSelect 
                                                            value={dispatchData.dispatchObjectZ}
                                                            onChange={(e) => setDispatchData({...dispatchData, dispatchObjectZ: e.target.value})}
                                                            className="w-[280px]"
                                                            disabled={!dispatchData.dispatchZ}
                                                        >
                                                            <option value="">请选择</option>
                                                            <option value="铁通班组">铁通班组</option>
                                                            <option value="分公司客响人员">分公司客响人员</option>
                                                        </StyledSelect>
                                                    </FormRow>
                                                    {dispatchData.dispatchObjectZ === '铁通班组' && (
                                                        <FormRow label="转派班组" required={dispatchData.dispatchZ}>
                                                            <StyledSelect 
                                                                value={dispatchData.teamZ}
                                                                onChange={(e) => setDispatchData({...dispatchData, teamZ: e.target.value})}
                                                                className="w-[280px]"
                                                            >
                                                                <option value="">请选择</option>
                                                                <option value="铁通维护一班">铁通维护一班</option>
                                                                <option value="铁通抢修二班">铁通抢修二班</option>
                                                                <option value="综合维护组">综合维护组</option>
                                                            </StyledSelect>
                                                        </FormRow>
                                                    )}
                                                    {dispatchData.dispatchObjectZ === '分公司客响人员' && (
                                                        <FormRow label="转派人员" required={dispatchData.dispatchZ}>
                                                            <StyledSelect 
                                                                value={dispatchData.personZ}
                                                                onChange={(e) => setDispatchData({...dispatchData, personZ: e.target.value})}
                                                                className="w-[280px]"
                                                            >
                                                                <option value="">请选择</option>
                                                                <option value="周工 (13911112222)">周工 (13911112222)</option>
                                                                <option value="吴工 (13933334444)">吴工 (13933334444)</option>
                                                                <option value="郑工 (13955556666)">郑工 (13955556666)</option>
                                                            </StyledSelect>
                                                        </FormRow>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-end gap-3 mt-4">
                                        <StyledButton variant="secondary">暂存</StyledButton>
                                        <StyledButton 
                                            variant="primary" 
                                            onClick={() => {
                                                if (!dispatchData.dispatchA && !dispatchData.dispatchZ) {
                                                    alert('请至少选择一个下派地市');
                                                    return;
                                                }
                                                setLogs(prev => [
                                                    {
                                                        time: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                                        opName: '转派',
                                                        stage: '工单处理',
                                                        operator: `${record.assignee.split('-')[0]}张工 (13800138000)`,
                                                        info: `工单已转派。`
                                                    },
                                                    ...prev
                                                ]);
                                                alert('工单已成功转派！');
                                            }}
                                        >
                                            确认转派
                                        </StyledButton>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-x-8 gap-y-4 animate-[fadeIn_0.2s_ease-out] w-full max-w-2xl">
                                    <div className="col-span-2">
                                        <FormRow label="驳回原因" required align="start">
                                            <textarea 
                                                className="w-full bg-[#0f172a]/30 border border-[#0085D0]/50 text-blue-100 text-sm px-3 py-2 focus:outline-none focus:border-neon-blue transition-colors rounded-none h-24 resize-none leading-relaxed"
                                                value={processRejectReason}
                                                onChange={(e) => setProcessRejectReason(e.target.value)}
                                                placeholder="请详细描述驳回原因..."
                                            ></textarea>
                                        </FormRow>
                                    </div>
                                    <div className="col-span-2 flex justify-end gap-3 mt-2">
                                        <StyledButton variant="secondary">暂存</StyledButton>
                                        <StyledButton variant="primary" onClick={handleRejectSubmit}>提交驳回</StyledButton>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {(currentStage === 'T2' || currentStage === '待质检') && (
                        <div className="bg-blue-900/10 p-6 border border-blue-500/20 rounded-sm space-y-4">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                <FormRow label="质检结果" required>
                                    <StyledSelect 
                                        className="w-full"
                                        value={qcData.qcResult}
                                        onChange={(e) => setQcData({...qcData, qcResult: e.target.value})}
                                    >
                                        <option value="">请选择</option>
                                        <option value="通过">通过</option>
                                        <option value="驳回">驳回</option>
                                    </StyledSelect>
                                </FormRow>

                                {qcData.qcResult === '通过' && (
                                    <>
                                        <FormRow label="客户是否满意" required>
                                            <StyledSelect 
                                                className="w-full"
                                                value={qcData.isSatisfied}
                                                onChange={(e) => setQcData({...qcData, isSatisfied: e.target.value})}
                                            >
                                                <option value="">请选择</option>
                                                <option value="是">是</option>
                                                <option value="否">否</option>
                                            </StyledSelect>
                                        </FormRow>
                                        <FormRow label="故障是否恢复" required>
                                            <StyledSelect 
                                                className="w-full"
                                                value={qcData.isFaultRecovered}
                                                onChange={(e) => setQcData({...qcData, isFaultRecovered: e.target.value})}
                                            >
                                                <option value="">请选择</option>
                                                <option value="是">是</option>
                                                <option value="否">否</option>
                                            </StyledSelect>
                                        </FormRow>
                                    </>
                                )}

                                <div className="col-span-2 flex items-start gap-3">
                                    <label className="w-[100px] text-right text-sm font-medium text-white shrink-0 pt-1.5 whitespace-nowrap">
                                        {qcData.qcResult === '驳回' && <span className="text-red-500 mr-0.5">*</span>}
                                        {qcData.qcResult === '驳回' ? '驳回原因' : '质检备注'}
                                    </label>
                                    <textarea 
                                        className="flex-1 bg-[#0f172a]/30 border border-[#0085D0]/50 text-blue-100 text-[14px] px-3 py-2 focus:outline-none focus:border-neon-blue transition-colors rounded-none h-24 resize-none leading-relaxed"
                                        value={qcData.qcResult === '驳回' ? qcData.rejectReason : qcData.qcRemarks}
                                        onChange={(e) => qcData.qcResult === '驳回' 
                                            ? setQcData({...qcData, rejectReason: e.target.value})
                                            : setQcData({...qcData, qcRemarks: e.target.value})
                                        }
                                        placeholder={qcData.qcResult === '驳回' ? "请输入驳回原因..." : "请输入质检备注..."}
                                    ></textarea>
                                </div>
                                <div className="col-span-2 flex justify-end gap-3 mt-2">
                                    <StyledButton variant="primary" onClick={handleQCSubmit}>确认提交</StyledButton>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
        
        <ServiceSelectionModal 
            isOpen={isServiceModalOpen}
            onClose={() => setIsServiceModalOpen(false)}
            onConfirm={handleServiceUpdate}
            showAssuranceLevel={true}
        />
    </div>
  );
};
