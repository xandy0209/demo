
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { SendIcon, ArrowDownLeftIcon, XIcon, MicIcon, BotIcon, ListIcon, PlusIcon, PaperclipIcon, EditIcon, TrashIcon, CheckIcon } from './Icons';
import { ChatMessage, ChatSession } from '../types';

interface AIChatPanelProps {
  messages: ChatMessage[]; // Current session messages
  sessions: ChatSession[]; // All sessions
  activeSessionId: string;
  onNewSession: () => void;
  onSelectSession: (id: string) => void;
  onSendMessage: (text: string, attachment?: { mimeType: string, data: string, fileName: string }) => void;
  isLoading: boolean;
  mode: 'sidebar' | 'tab';
  onExpand?: () => void;
  onClose?: () => void;
  onRenameSession?: (id: string, newTitle: string) => void;
  onDeleteSession?: (id: string) => void;
}

// --- Chart Component ---
const SimpleChart = ({ data }: { data: any }) => {
    const { type, title, xAxis, series } = data;
    const isLine = type === 'line';
    
    // Basic dimensions
    const width = 500;
    const height = 250;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Calculate Max Value for Y Axis scaling
    const allValues = series.flatMap((s: any) => s.data);
    const maxValue = Math.max(...allValues, 0) || 10;
    
    const colors = ['#00d2ff', '#fbbf24', '#f472b6', '#34d399'];

    // Helper to get coordinates
    const getX = (index: number) => padding + (index * (chartWidth / (xAxis.length - 1 || 1)));
    const getY = (value: number) => height - padding - ((value / maxValue) * chartHeight);
    
    // Bar chart helpers
    const barWidth = Math.min(40, (chartWidth / xAxis.length) * 0.6);
    const getBarX = (index: number, seriesIndex: number) => {
        const groupWidth = barWidth * series.length;
        const start = padding + (index * (chartWidth / xAxis.length)) + (chartWidth / xAxis.length - groupWidth) / 2;
        return start + (seriesIndex * barWidth);
    };

    return (
        <div className="bg-[#0b1730]/50 border border-blue-500/30 rounded p-4 my-2 w-full max-w-[600px]">
            {title && <div className="text-sm font-bold text-blue-100 mb-2 text-center">{title}</div>}
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
                    <line 
                        key={tick}
                        x1={padding} 
                        y1={height - padding - (tick * chartHeight)} 
                        x2={width - padding} 
                        y2={height - padding - (tick * chartHeight)} 
                        stroke="#1e3a5f" 
                        strokeWidth="1"
                        strokeDasharray="4 4"
                    />
                ))}

                {/* Axes */}
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#475569" strokeWidth="1" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#475569" strokeWidth="1" />

                {/* X Axis Labels */}
                {xAxis.map((label: string, i: number) => (
                    <text 
                        key={i} 
                        x={isLine ? getX(i) : getBarX(i, 0) + (barWidth * series.length) / 2} 
                        y={height - padding + 20} 
                        fill="#94a3b8" 
                        fontSize="10" 
                        textAnchor="middle"
                    >
                        {label}
                    </text>
                ))}

                {/* Y Axis Labels */}
                {[0, 0.5, 1].map((tick) => (
                    <text 
                        key={tick} 
                        x={padding - 10} 
                        y={height - padding - (tick * chartHeight) + 4} 
                        fill="#94a3b8" 
                        fontSize="10" 
                        textAnchor="end"
                    >
                        {Math.round(maxValue * tick)}
                    </text>
                ))}

                {/* Data */}
                {series.map((s: any, sIdx: number) => {
                    const color = colors[sIdx % colors.length];
                    
                    if (isLine) {
                        const points = s.data.map((v: number, i: number) => `${getX(i)},${getY(v)}`).join(' ');
                        return (
                            <g key={sIdx}>
                                <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
                                {s.data.map((v: number, i: number) => (
                                    <circle key={i} cx={getX(i)} cy={getY(v)} r="3" fill="#0f172a" stroke={color} strokeWidth="2" />
                                ))}
                            </g>
                        );
                    } else {
                        // Bar
                        return s.data.map((v: number, i: number) => (
                            <rect 
                                key={i}
                                x={getBarX(i, sIdx)}
                                y={getY(v)}
                                width={barWidth - 2} // Gap
                                height={height - padding - getY(v)}
                                fill={color}
                                opacity="0.8"
                            />
                        ));
                    }
                })}
            </svg>
            <div className="flex items-center justify-center gap-4 mt-2">
                {series.map((s: any, i: number) => (
                    <div key={i} className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }}></span>
                        <span className="text-xs text-blue-200">{s.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Smart Content Renderer ---
const SmartMessageContent = ({ text }: { text: string }) => {
    const parts = useMemo(() => {
        const segments: { type: 'text' | 'chart' | 'table'; content: any }[] = [];
        
        // Split by chart blocks first
        const chartRegex = /```chart\s*([\s\S]*?)```/g;
        let lastIndex = 0;
        let match;

        while ((match = chartRegex.exec(text)) !== null) {
            // Text before chart
            if (match.index > lastIndex) {
                const textPart = text.substring(lastIndex, match.index);
                if (textPart.trim()) segments.push({ type: 'text', content: textPart });
            }

            // Chart data
            try {
                const jsonStr = match[1];
                const chartData = JSON.parse(jsonStr);
                segments.push({ type: 'chart', content: chartData });
            } catch (e) {
                segments.push({ type: 'text', content: match[0] }); // Fallback if invalid JSON
            }

            lastIndex = chartRegex.lastIndex;
        }

        // Trailing text
        if (lastIndex < text.length) {
            segments.push({ type: 'text', content: text.substring(lastIndex) });
        }

        // Post-process text segments for Tables
        const finalSegments: typeof segments = [];
        
        segments.forEach(seg => {
            if (seg.type === 'chart') {
                finalSegments.push(seg);
                return;
            }

            // Table parsing logic
            const lines = (seg.content as string).split('\n');
            let inTable = false;
            let tableBuffer: string[] = [];
            let textBuffer: string[] = [];

            lines.forEach((line, i) => {
                const trimmed = line.trim();
                // Check for pipe table structure. Simple check: starts and ends with |, or contains at least one | and looks like data
                // Rigorous check: Line must contain |, and we look for separator row |---|
                
                const isTableLine = trimmed.startsWith('|') || (trimmed.includes('|') && trimmed.length > 5); // Heuristic
                
                if (isTableLine) {
                    if (!inTable) {
                        // Check next line for separator to confirm header? 
                        // Simplified: assume contiguous pipe lines are a table
                         if (textBuffer.length > 0) {
                             finalSegments.push({ type: 'text', content: textBuffer.join('\n') });
                             textBuffer = [];
                         }
                         inTable = true;
                    }
                    tableBuffer.push(line);
                } else {
                    if (inTable) {
                        // Table ended
                        if (tableBuffer.length > 0) {
                            finalSegments.push({ type: 'table', content: tableBuffer });
                            tableBuffer = [];
                        }
                        inTable = false;
                    }
                    textBuffer.push(line);
                }
            });

            if (inTable && tableBuffer.length > 0) {
                 finalSegments.push({ type: 'table', content: tableBuffer });
            }
            if (textBuffer.length > 0) {
                finalSegments.push({ type: 'text', content: textBuffer.join('\n') });
            }
        });

        return finalSegments;
    }, [text]);

    const renderTable = (lines: string[]) => {
        // Filter empty lines and parse
        const rows = lines.filter(l => l.trim().length > 0).map(line => {
             // Remove outer pipes if present
             let content = line.trim();
             if (content.startsWith('|')) content = content.substring(1);
             if (content.endsWith('|')) content = content.substring(0, content.length - 1);
             return content.split('|').map(c => c.trim());
        });

        if (rows.length < 2) return <pre className="whitespace-pre-wrap">{lines.join('\n')}</pre>;

        const header = rows[0];
        const separator = rows[1]; // Typically |---|---|
        const body = rows.slice(2);

        // Basic check if separator is valid (contains dashes)
        if (!separator[0].includes('-')) return <pre className="whitespace-pre-wrap">{lines.join('\n')}</pre>;

        return (
            <div className="overflow-x-auto my-3 border border-blue-500/30 rounded-sm">
                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className="bg-[#1e3a5f]/80 text-blue-100">
                            {header.map((h, i) => (
                                <th key={i} className="p-2 border-b border-blue-500/30 font-semibold">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {body.map((row, rIdx) => (
                            <tr key={rIdx} className="border-b border-blue-500/10 hover:bg-white/5">
                                {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="p-2 text-blue-200">{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="space-y-2">
            {parts.map((part, idx) => {
                if (part.type === 'chart') {
                    return (
                        <div key={idx} className="w-full">
                            <SimpleChart data={part.content} />
                        </div>
                    );
                } else if (part.type === 'table') {
                    return <div key={idx}>{renderTable(part.content)}</div>;
                } else {
                    return <div key={idx} className="whitespace-pre-wrap">{part.content}</div>;
                }
            })}
        </div>
    );
};

export const AIChatPanel: React.FC<AIChatPanelProps> = ({ 
  messages, 
  sessions,
  activeSessionId,
  onNewSession,
  onSelectSession,
  onSendMessage, 
  isLoading, 
  mode, 
  onExpand, 
  onClose,
  onRenameSession,
  onDeleteSession
}) => {
  const [inputText, setInputText] = useState('');
  // In tab mode, default to open; in sidebar mode, default to closed
  const [isSessionListOpen, setIsSessionListOpen] = useState(mode === 'tab');
  const [isListening, setIsListening] = useState(false);
  const [attachment, setAttachment] = useState<{ mimeType: string, data: string, fileName: string } | null>(null);
  
  // Session Edit State
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Session Delete State
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, attachment]);

  // Sync session list state when mode changes
  useEffect(() => {
      if (mode === 'tab') setIsSessionListOpen(true);
      else setIsSessionListOpen(false);
  }, [mode]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
        // Reset height to allow shrinking
        textarea.style.height = 'auto'; 
        const scrollHeight = textarea.scrollHeight;
        
        // Max height threshold (150px for tab mode, 120px for sidebar)
        const maxHeight = mode === 'tab' ? 200 : 120;
        if (scrollHeight > maxHeight) {
            textarea.style.height = `${maxHeight}px`;
            textarea.style.overflowY = 'auto';
        } else {
            // Ensure min height based on mode
            const minHeight = mode === 'tab' ? 44 : 40; 
            textarea.style.height = `${Math.max(scrollHeight, minHeight)}px`;
            textarea.style.overflowY = 'hidden';
        }
    }
  }, [inputText, mode]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSend = () => {
    if ((inputText.trim() || attachment) && !isLoading) {
      onSendMessage(inputText, attachment || undefined);
      setInputText('');
      setAttachment(null);
      // Reset height and overflow manually
      if (textareaRef.current) {
         textareaRef.current.style.height = mode === 'tab' ? '44px' : '40px';
         textareaRef.current.style.overflowY = 'hidden';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSessionSelect = (id: string) => {
    if (editingSessionId === id) return;
    onSelectSession(id);
    if (mode === 'sidebar') setIsSessionListOpen(false);
  };

  const handleCreateSession = () => {
    onNewSession();
    if (mode === 'sidebar') setIsSessionListOpen(false);
  };

  const startEditing = (e: React.MouseEvent, session: ChatSession) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingSessionId(null);
    setEditTitle('');
  };

  const saveEditing = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRenameSession && editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingSessionId(null);
    setEditTitle('');
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingSessionId(id);
  };

  const confirmDelete = () => {
    if (deletingSessionId && onDeleteSession) {
        onDeleteSession(deletingSessionId);
    }
    setDeletingSessionId(null);
  };

  const cancelDelete = () => {
    setDeletingSessionId(null);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
        alert("您的浏览器不支持语音识别功能，请使用Chrome浏览器。");
        return;
    }

    if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
        return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'zh-CN';

    recognition.onstart = () => { setIsListening(true); };
    recognition.onend = () => { setIsListening(false); };
    recognition.onerror = (event: any) => { 
        console.error("Speech recognition error", event.error);
        setIsListening(false); 
    };
    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
            setInputText(prev => prev + (prev ? ' ' : '') + transcript);
        }
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        setAttachment({
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          data: base64Data
        });
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  const exampleQueries = [
    '查询呼和浩特的金牌客户信息', 
    '查询209834专线的运行质量', 
    '查询AAA的质差互联网专线', 
    '查询20984736专线的时延'
  ];

  const currentSession = sessions.find(s => s.id === activeSessionId);

  const DeleteConfirmationModal = () => {
      if (!deletingSessionId) return null;
      return (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
              <div className="w-[320px] bg-[#0f172a] border border-blue-500/30 text-blue-100 shadow-[0_0_30px_rgba(0,0,0,0.5)] p-6 rounded-md animate-[fadeIn_0.2s_ease-out]">
                  <h3 className="text-lg font-bold text-white mb-3">删除会话</h3>
                  <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                      确定要删除此会话吗？<br/>删除后聊天记录将无法恢复。
                  </p>
                  <div className="flex justify-end gap-3">
                      <button 
                          onClick={cancelDelete}
                          className="px-4 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors border border-transparent"
                      >
                          取消
                      </button>
                      <button 
                          onClick={confirmDelete}
                          className="px-4 py-1.5 text-sm bg-red-600/80 hover:bg-red-600 text-white rounded shadow-sm transition-colors border border-red-500/50"
                      >
                          确认删除
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  // Shared inner logic extracted to keep return clean
  const renderMessageList = () => (
    <div className="flex-1 overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-transparent [&::-webkit-scrollbar-track]:bg-transparent">
        <div className={`mx-auto w-full ${mode === 'tab' ? 'max-w-[908px] pt-6 pb-36' : 'space-y-4'}`}>
            {messages.length === 0 ? (
                <div className={`flex flex-col ${mode === 'tab' ? 'items-start mt-4' : 'items-center justify-center h-full text-blue-300/60 space-y-6 px-8'} animate-[fadeIn_0.5s_ease-out]`}>
                    {mode === 'tab' ? (
                        <>
                            <div className="mb-10 space-y-4">
                                <h1 className="text-5xl font-bold bg-gradient-to-r from-neon-blue via-blue-400 to-cyan-300 text-transparent bg-clip-text drop-shadow-[0_0_20px_rgba(0,210,255,0.3)]">
                                    您好，吴军校
                                </h1>
                                <div className="text-base text-blue-200/70 leading-relaxed font-light space-y-4">
                                    <div>我是中国移动政企业务信息查询助手。专注于集团客户信息、专线\企宽\千里眼\云视讯等业务信息以及相关业务运行数据、运行情况的精准查询及分析，通过高效检索帮助您快速获取客户业务信息及业务运行情况，是政企客户业务管理的轻量查询工具。</div>
                                    <div>您可参照以下样例输入提问（用户提示词）：</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 w-full">
                                {exampleQueries.map((q, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => onSendMessage(q)}
                                        className="px-3 h-[40px] flex items-center bg-[#1e3a5f]/40 hover:bg-[#1e3a5f]/60 rounded-full text-left transition-all border border-blue-400/20 hover:border-neon-blue/50 group justify-between shadow-sm hover:shadow-[0_0_15px_rgba(0,210,255,0.15)]"
                                    >
                                        <span className="text-blue-200 text-xs group-hover:text-white truncate mr-2">{q}</span>
                                        <div className="p-0.5 rounded-full bg-[#0c2242]/50 text-neon-blue opacity-0 group-hover:opacity-100 transition-opacity shrink-0 transform scale-75">
                                            <ArrowDownLeftIcon /> 
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20 text-white animate-pulse">
                                <BotIcon />
                            </div>
                            <div className="text-sm font-medium leading-relaxed text-left max-w-[600px] space-y-4">
                                <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-neon-blue via-blue-400 to-cyan-300 text-transparent bg-clip-text drop-shadow-[0_0_10px_rgba(0,210,255,0.3)] mb-4">
                                    您好，吴军校
                                </h2>
                                <div className="text-blue-200/80 leading-7 text-justify tracking-wide space-y-4">
                                    <div>我是中国移动政企业务信息查询助手。专注于集团客户信息、专线\企宽\千里眼\云视讯等业务信息以及相关业务运行数据、运行情况的精准查询及分析，通过高效检索帮助您快速获取客户业务信息及业务运行情况，是政企客户业务管理的轻量查询工具。</div>
                                    <div>您可参照以下样例输入提问（用户提示词）：</div>
                                </div>
                                <div className="grid grid-cols-1 gap-3 w-full pt-2">
                                    {exampleQueries.map((q, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => onSendMessage(q)}
                                            className="w-full px-4 py-3 flex items-center justify-between bg-[#1e3a5f]/40 hover:bg-[#1e3a5f]/60 rounded-lg text-left transition-all border border-blue-400/20 hover:border-neon-blue/50 group shadow-sm hover:shadow-[0_0_15px_rgba(0,210,255,0.15)]"
                                        >
                                            <span className="text-blue-200 text-sm group-hover:text-white truncate mr-2">{q}</span>
                                            <div className="p-1 rounded-full bg-[#0c2242]/50 text-neon-blue opacity-0 group-hover:opacity-100 transition-opacity shrink-0 transform scale-90">
                                                <ArrowDownLeftIcon /> 
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="space-y-8">
                    {messages.map((msg, idx) => {
                        if (msg.role === 'model' && !msg.text && isLoading) return null;

                        return (
                            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'model' && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shrink-0 mt-1 shadow-[0_0_10px_rgba(0,210,255,0.3)]">
                                        <BotIcon />
                                    </div>
                                )}
                                
                                <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    {msg.attachment && (
                                        <div className="flex items-center gap-3 px-4 py-3 bg-[#1e3a5f]/50 border border-blue-400/30 rounded-xl text-sm text-blue-200 w-fit mb-1 shadow-[0_0_10px_rgba(0,0,0,0.2)]">
                                            <div className="p-2 bg-blue-500/20 rounded-lg"><PaperclipIcon /></div>
                                            <div className="flex flex-col">
                                                <span className="font-medium truncate max-w-[200px]">{msg.attachment.fileName}</span>
                                                <span className="text-xs text-blue-400">{msg.attachment.mimeType}</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className={`
                                        text-[15px] leading-7 font-sans
                                        ${msg.role === 'user' 
                                            ? 'bg-[#007acc] text-white px-5 py-3 rounded-2xl rounded-tr-sm border border-[#00d2ff]/30 shadow-[0_0_10px_rgba(0,122,204,0.3)]' 
                                            : 'text-blue-100 py-1 w-full' 
                                        }
                                    `}>
                                        <SmartMessageContent text={msg.text} />
                                    </div>
                                </div>

                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center shrink-0 mt-1 overflow-hidden border border-blue-400/30">
                                        <img src="https://tvbox-67o.pages.dev/head.jpg" alt="User" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {isLoading && (
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shrink-0 mt-1 animate-pulse shadow-[0_0_10px_rgba(0,210,255,0.3)]">
                                    <BotIcon />
                                </div>
                                <div className="py-2 flex gap-1 items-center">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                    )}
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    </div>
  );

  // Tab Mode Render
  if (mode === 'tab') {
      return (
          <div className="flex h-full w-full bg-transparent text-blue-100 font-sans overflow-hidden border-t border-blue-400/10 relative">
              <style>{`
                #session-list-container::-webkit-scrollbar { width: 4px; background-color: transparent; }
                #session-list-container::-webkit-scrollbar-track { background-color: transparent; border: none; }
                #session-list-container::-webkit-scrollbar-thumb { background-color: rgba(59, 130, 246, 0.15); border-radius: 4px; }
                #session-list-container:hover::-webkit-scrollbar-thumb { background-color: rgba(59, 130, 246, 0.4) !important; }
              `}</style>
              <DeleteConfirmationModal />
              <div className={`${isSessionListOpen ? 'w-[280px] border-r border-blue-500/30' : 'w-0 border-r-0'} transition-[width] duration-300 bg-transparent flex flex-col flex-shrink-0 overflow-hidden`}>
                  <div className="flex items-center justify-between px-4 py-4 shrink-0">
                      <div className="flex items-center gap-3 text-lg font-medium text-blue-100 overflow-hidden whitespace-nowrap">
                           <button onClick={() => setIsSessionListOpen(false)} className="text-blue-300 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10" title="收起侧边栏">
                              <ListIcon />
                           </button>
                           <div className="flex items-center gap-2">
                               <span>政企智能助手</span>
                               <span className="text-xs text-neon-blue px-1.5 py-0.5 bg-blue-500/10 rounded border border-blue-500/20 shadow-[0_0_5px_rgba(0,210,255,0.2)]">Pro</span>
                           </div>
                      </div>
                  </div>
                  <div className="px-2 pb-2 shrink-0">
                      <button onClick={handleCreateSession} className="flex items-center gap-3 px-4 py-3 bg-transparent hover:bg-[#1e3a5f]/50 text-blue-100 rounded-full transition-colors w-full border border-transparent hover:border-blue-400/30 group">
                          <PlusIcon />
                          <span className="text-sm font-medium text-blue-200 group-hover:text-white">新建对话</span>
                      </button>
                  </div>
                  <div id="session-list-container" className="flex-1 overflow-y-auto px-2 space-y-1 mt-2">
                      <div className="px-3 py-2 text-xs font-medium text-blue-400/70">最近</div>
                      {sessions.map(session => (
                         <div key={session.id} className={`group relative w-full rounded-full transition-all min-h-[36px] flex items-center border ${activeSessionId === session.id ? 'bg-blue-600/20 border-blue-500/30 text-neon-blue' : 'text-blue-300 border-transparent hover:bg-white/5 hover:text-blue-100'}`}>
                            <div className="absolute inset-0 z-0 cursor-pointer rounded-full" onClick={() => handleSessionSelect(session.id)} />
                            <div className="pl-4 pr-2 z-10 pointer-events-none opacity-70"><span className="scale-75 inline-block"><BotIcon /></span></div>
                            <div className={`relative z-10 flex-1 py-2 min-w-0 pointer-events-none ${editingSessionId === session.id ? 'pr-0' : 'pr-10'}`}>
                                {editingSessionId === session.id ? (
                                    <div className="flex items-center gap-1 w-full relative pointer-events-auto pr-2">
                                        <input autoFocus value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveEditing(e as any, session.id); if (e.key === 'Escape') cancelEditing(e as any); }} className="flex-1 min-w-0 bg-[#0c2242] border border-blue-500/50 text-white px-2 py-0.5 text-xs rounded focus:outline-none focus:border-neon-blue" />
                                        <button onClick={(e) => saveEditing(e, session.id)} className="text-green-400 hover:text-green-300 cursor-pointer"><CheckIcon /></button>
                                        <button onClick={cancelEditing} className="text-gray-400 hover:text-gray-300 cursor-pointer"><XIcon /></button>
                                    </div>
                                ) : (
                                    <div className="truncate text-sm font-normal">{session.title}</div>
                                )}
                            </div>
                            {editingSessionId !== session.id && (
                                <div className={`absolute right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto`}>
                                    <button onClick={(e) => startEditing(e, session)} className="p-1 text-blue-400 hover:text-white"><EditIcon /></button>
                                    <button onClick={(e) => handleDeleteClick(e, session.id)} className="p-1 text-blue-400 hover:text-red-400"><TrashIcon /></button>
                                </div>
                            )}
                         </div>
                      ))}
                  </div>
                  <div className="h-[40px] flex items-center px-4 shrink-0">
                      <div className="flex items-center gap-2 text-xs text-blue-300">
                         <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)]"></span>
                         <span>在线</span>
                      </div>
                  </div>
              </div>

              <div className="flex-1 flex flex-col relative h-full bg-transparent min-w-0">
                  <div className="h-16 flex items-center justify-between px-6 shrink-0 z-20">
                      <div className="flex items-center gap-3">
                          {!isSessionListOpen && (
                              <>
                                <button onClick={() => setIsSessionListOpen(true)} className="text-blue-300 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10" title="展开侧边栏"><ListIcon /></button>
                                <div className="flex items-center gap-2 text-lg font-medium text-blue-100 animate-[fadeIn_0.3s_ease-out]"><span>政企智能助手</span><span className="text-xs text-neon-blue px-2 py-0.5 bg-blue-500/10 rounded border border-blue-500/20 shadow-[0_0_5px_rgba(0,210,255,0.2)]">Pro</span></div>
                                {currentSession && (<> <div className="h-4 w-[1px] bg-blue-500/30 mx-2"></div> <div className="text-sm text-blue-300 animate-[fadeIn_0.3s_ease-out]">{currentSession.title}</div> </>)}
                              </>
                          )}
                      </div>
                  </div>

                  {renderMessageList()}

                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#081526] via-[#081526]/90 to-transparent z-30">
                      <div className="max-w-[908px] mx-auto">
                          {attachment && (
                              <div className="mb-2 inline-flex items-center gap-2 bg-[#1e3a5f] border border-blue-400/30 px-3 py-1.5 rounded-full animate-[slideInUp_0.2s_ease-out] shadow-lg">
                                  <span className="text-neon-blue text-xs"><PaperclipIcon /></span>
                                  <span className="text-xs text-white max-w-[200px] truncate">{attachment.fileName}</span>
                                  <button onClick={removeAttachment} className="text-gray-400 hover:text-red-400 ml-1 rounded-full p-0.5 hover:bg-white/10"><XIcon /></button>
                              </div>
                          )}
                          <div className="relative bg-[#1e3a5f]/60 backdrop-blur-md rounded-3xl border border-blue-400/30 hover:border-neon-blue/50 transition-colors shadow-[0_0_20px_rgba(0,0,0,0.3)] flex flex-col focus-within:ring-1 focus-within:ring-neon-blue/30">
                              <textarea ref={textareaRef} value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyDown} placeholder="输入问题或上传文件..." rows={1} className="w-full bg-transparent text-blue-100 text-base px-6 pt-4 pb-0 focus:outline-none resize-none leading-relaxed placeholder-blue-300/40" disabled={isLoading} />
                              <div className="flex items-center justify-between px-4 pb-2 pt-1">
                                  <div className="flex items-center gap-1">
                                      <button onClick={handleFileClick} className="p-1.5 text-blue-300 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="上传文件"><PlusIcon /></button>
                                      <button onClick={handleVoiceInput} className={`p-1.5 rounded-full transition-colors ${isListening ? 'text-red-400 bg-red-400/10' : 'text-blue-300 hover:text-white hover:bg-white/10'}`} title="语音输入"><MicIcon /></button>
                                      <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.docx,.doc,.txt,.csv,.pdf" onChange={handleFileChange} />
                                  </div>
                                  <button onClick={handleSend} disabled={isLoading || (!inputText.trim() && !attachment)} className="p-1.5 text-blue-300 hover:text-neon-blue hover:bg-white/10 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"><SendIcon /></button>
                              </div>
                          </div>
                          <div className="text-center mt-3 text-xs text-blue-400/60">政企智能助手可能会犯错。请核查重要信息。</div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // Sidebar Mode Render
  return (
    <div className={`flex flex-col h-full bg-[#0c2242]/30 backdrop-blur-md border border-blue-400/30 text-blue-100 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden`}>
      <DeleteConfirmationModal />
      <div className={`absolute top-[42px] bottom-0 left-0 w-64 bg-[#0c2242]/95 backdrop-blur-xl border-r border-blue-500/30 z-40 flex flex-col transition-transform duration-300 ease-in-out ${isSessionListOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-3 border-b border-blue-500/20">
             <button onClick={handleCreateSession} className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#1e3a5f]/50 hover:bg-[#1e3a5f] border border-blue-400/30 text-white text-sm rounded transition-colors">
                <PlusIcon /><span>新建会话</span>
             </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
             {sessions.map(session => (
                 <div key={session.id} className={`group relative w-full rounded transition-all min-h-[50px] border ${activeSessionId === session.id ? 'bg-blue-600/20 border-blue-500/30 text-neon-blue' : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-white'}`}>
                    <div className="absolute inset-0 z-0 cursor-pointer" onClick={() => handleSessionSelect(session.id)} />
                    <div className="relative z-10 w-full px-3 py-2.5 pointer-events-none">
                        {editingSessionId === session.id ? (
                            <div className="flex items-center gap-1 w-full relative pointer-events-auto">
                                <input autoFocus value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveEditing(e as any, session.id); if (e.key === 'Escape') cancelEditing(e as any); }} className="flex-1 min-w-0 bg-[#0f172a] border border-blue-500/50 text-white px-1 py-0.5 text-xs rounded focus:outline-none focus:border-neon-blue" />
                                <button onClick={(e) => saveEditing(e, session.id)} className="text-green-400 hover:text-green-300 p-1 cursor-pointer bg-gray-800/80 rounded"><CheckIcon /></button>
                                <button onClick={cancelEditing} className="text-gray-400 hover:text-gray-300 p-1 cursor-pointer bg-gray-800/80 rounded"><XIcon /></button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <div className="flex items-start justify-between w-full"><span className="font-medium whitespace-normal break-words leading-tight flex-1 pr-[60px] select-none">{session.title}</span></div>
                                <span className="text-[10px] opacity-60 select-none">{new Date(session.createdAt).toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                    {editingSessionId !== session.id && (
                        <div className={`absolute top-1.5 right-1.5 z-50 flex items-center gap-1 transition-opacity pointer-events-auto ${activeSessionId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <button onClick={(e) => startEditing(e, session)} onMouseDown={(e) => e.stopPropagation()} className="text-gray-400 hover:text-blue-300 p-1.5 rounded bg-transparent hover:bg-blue-500/30 transition-colors cursor-pointer border border-transparent hover:border-blue-500/30"><span className="pointer-events-none flex"><EditIcon /></span></button>
                            <button onClick={(e) => handleDeleteClick(e, session.id)} onMouseDown={(e) => e.stopPropagation()} className="text-gray-400 hover:text-red-400 p-1.5 rounded bg-transparent hover:bg-red-500/30 transition-colors cursor-pointer border border-transparent hover:border-red-500/30"><span className="pointer-events-none flex"><TrashIcon /></span></button>
                        </div>
                    )}
                 </div>
             ))}
        </div>
      </div>
      {isSessionListOpen && <div className="absolute inset-0 bg-black/40 z-[35]" onClick={() => setIsSessionListOpen(false)}></div>}
      <div className="flex items-center justify-between px-4 h-[42px] bg-[#13284c]/30 border-b border-blue-400/20 shrink-0 z-30 relative">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSessionListOpen(!isSessionListOpen)} className={`text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10 ${isSessionListOpen ? 'text-neon-blue' : ''}`} title="会话列表"><ListIcon /></button>
          <div className="flex items-center gap-2"><div className="text-neon-blue"><BotIcon /></div><span className="text-base font-bold text-white tracking-wide">智能助手</span></div>
        </div>
        <div className="flex items-center gap-2">
          {onExpand && <button onClick={onExpand} className="text-gray-400 hover:text-white transition-colors p-1" title="最大化至页签"><ArrowDownLeftIcon /></button>}
          {onClose && <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1" title="关闭"><XIcon /></button>}
        </div>
      </div>

      {renderMessageList()}

      <div className="p-4 bg-[#13284c]/30 border-t border-blue-400/20 shrink-0 relative z-30">
        {attachment && (
            <div className="absolute bottom-full left-4 mb-2 flex items-center gap-2 bg-[#0c2242] border border-blue-500/40 px-3 py-1.5 rounded shadow-lg animate-[fadeIn_0.2s_ease-out]">
                <span className="text-neon-blue"><PaperclipIcon /></span>
                <span className="text-xs text-white max-w-[200px] truncate">{attachment.fileName}</span>
                <button onClick={removeAttachment} className="text-gray-400 hover:text-red-400 ml-2"><XIcon /></button>
            </div>
        )}
        <div className="flex gap-2 items-end">
          <button onClick={handleFileClick} className="flex items-center justify-center w-[40px] h-[40px] bg-[#1e3a5f]/50 border border-blue-400/30 rounded-sm text-blue-300 hover:text-white hover:border-neon-blue transition-all shrink-0 mb-0" disabled={isLoading}><PaperclipIcon /></button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.docx,.doc,.txt,.csv,.pdf" onChange={handleFileChange} />
          <div className="flex-1 relative">
            <textarea ref={textareaRef} value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyDown} placeholder="输入您的问题或上传文件..." rows={1} className="block w-full bg-[#1e3a5f]/50 border border-blue-400/30 text-white text-sm px-3 py-2 pr-9 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-colors rounded-sm resize-none leading-normal placeholder-blue-300/40" disabled={isLoading} />
            <button onClick={handleVoiceInput} className={`absolute right-2 bottom-[9px] p-1 rounded-full transition-all duration-300 ${isListening ? 'text-red-400 bg-red-400/10' : 'text-blue-400 hover:text-white hover:bg-white/10'}`} title="语音输入" disabled={isLoading}><MicIcon /></button>
          </div>
          <button onClick={handleSend} disabled={isLoading || (!inputText.trim() && !attachment)} className="flex items-center justify-center px-4 h-[40px] bg-[#07596C]/80 hover:bg-[#07596C] border border-blue-500 text-white shadow-[0_0_10px_rgba(7,89,108,0.3)] rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"><SendIcon /></button>
        </div>
      </div>
    </div>
  );
};
