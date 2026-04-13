
import React, { useState, useRef, useEffect } from 'react';
import { MicIcon, CheckCircleIcon, XIcon, PaperclipIcon, TrashIcon } from './Icons';
import { StyledInput, StyledButton, StyledSelect } from './UI';
import { ServiceSelectionModal } from './ServiceSelectionModal';
import { SubscriptionRecord } from '../types';

interface ComplaintCreateViewProps {
  onCancel: () => void;
  onSubmit: () => void;
  initialData?: any;
}

// Custom Notification Component inside the view to guarantee visibility
const NotificationToast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
    <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-[9999] flex items-start gap-3 px-6 py-4 rounded-md shadow-2xl border animate-[fadeIn_0.2s_ease-out] min-w-[300px] max-w-[80%] backdrop-blur-md ${
        type === 'error' 
            ? 'bg-red-900/90 border-red-500 text-white' 
            : 'bg-green-900/90 border-green-500 text-white'
    }`}>
        <div className={`mt-0.5 ${type === 'error' ? 'text-red-300' : 'text-green-300'}`}>
            {type === 'error' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            ) : (
                <CheckCircleIcon />
            )}
        </div>
        <div className="flex-1 text-sm font-medium whitespace-pre-wrap leading-relaxed">
            {message}
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <XIcon />
        </button>
    </div>
);

// Helper for horizontal form field
const FormRow = ({ label, required, children }: { label: string, required?: boolean, children?: React.ReactNode }) => (
    <div className="flex items-center gap-2 w-full">
        <label className="w-[70px] text-right text-xs text-blue-300 shrink-0 select-none">
            {required && <span className="text-red-500 mr-0.5">*</span>}
            {label}
        </label>
        <div className="flex-1 min-w-0">
            {children}
        </div>
    </div>
);

export const ComplaintCreateView: React.FC<ComplaintCreateViewProps> = ({ onCancel, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    productInstance: '',
    circuitCode: '',
    customerName: '',
    complaintContent: '',
    contactPerson: '',
    contactPhone: '',
    assigneeCity: '呼和浩特市',
    assigneeRole: '铁通班组',
    businessCategory: '', 
    businessType: '',
    customerCode: '',
    serviceAddressA: '',
    serviceAddressZ: '',
    faultTime: '',
    
    dispatchA: false,
    dispatchZ: false,
    cityA: '', 
    cityZ: '',
    
    dispatchObjectA: '', 
    dispatchObjectZ: '', 
    teamA: '',           
    teamZ: '',           
    aAssuranceLevel: '',
    zAssuranceLevel: '',
    broadbandAccount: '',
    broadbandType: '',
    districtA: '',
    districtZ: '',
    isContentReadOnly: false,
    isFromFaultDispatch: false,
  });

  const [attachments, setAttachments] = useState<{ id: string, name: string, size: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState<'专线' | '企宽' | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // Custom Notification State
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (initialData) {
        try {
            setFormData(prev => ({
                ...prev,
                ...initialData,
                faultTime: initialData.faultTime && typeof initialData.faultTime === 'string' 
                    ? initialData.faultTime.replace(' ', 'T').substring(0, 16) 
                    : '',
                businessCategory: initialData.businessCategory || prev.businessCategory,
                businessType: initialData.businessType || prev.businessType,
                dispatchA: initialData.dispatchA !== undefined ? initialData.dispatchA : true,
                dispatchZ: initialData.dispatchZ !== undefined ? initialData.dispatchZ : false,
                isContentReadOnly: initialData.isContentReadOnly || false,
                isFromFaultDispatch: initialData.isFromFaultDispatch || false,
            }));
            if (initialData.initialAttachments) {
                setAttachments(prev => [...prev, ...initialData.initialAttachments]);
            }
        } catch (e) {
            console.error("Error setting initial data", e);
        }
    }
  }, [initialData]);

  // Auto-dismiss notification
  useEffect(() => {
      if (notification) {
          const timer = setTimeout(() => setNotification(null), 3000);
          return () => clearTimeout(timer);
      }
  }, [notification]);

  const handleChange = (field: string, value: any) => {
    if (field === 'businessCategory') {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        productInstance: '',
        circuitCode: '',
        businessType: '',
        broadbandAccount: '',
        customerName: '',
        customerCode: '',
        serviceAddressA: '',
        serviceAddressZ: '',
        cityA: '',
        cityZ: '',
        aAssuranceLevel: '',
        zAssuranceLevel: '',
        dispatchA: false,
        dispatchZ: false,
        dispatchObjectA: '',
        teamA: '',
        dispatchObjectZ: '',
        teamZ: '',
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleServiceSelect = (record: SubscriptionRecord) => {
    const isDataLine = record.serviceType === '数据专线';
    setFormData(prev => ({
        ...prev,
        productInstance: record.productInstance,
        circuitCode: record.circuitCode,
        businessType: record.serviceType,
        broadbandAccount: record.broadbandAccount || '',
        broadbandType: record.broadbandType || '',
        customerName: record.customerName,
        customerCode: record.customerCode,
        serviceAddressA: record.addressA || '',
        serviceAddressZ: isDataLine ? (record.addressZ || '') : '',
        cityA: record.cityA,
        districtA: record.districtA || '',
        cityZ: isDataLine ? record.cityZ : '',
        districtZ: isDataLine ? (record.districtZ || '') : '',
        dispatchA: true,
        dispatchZ: false,
        dispatchObjectA: '',
        teamA: '',
        dispatchObjectZ: '',
        teamZ: '',
        aAssuranceLevel: record.aAssuranceLevel || '',
        zAssuranceLevel: record.zAssuranceLevel || ''
    }));
    setIsServiceModalOpen(false);
  };

  const handleDispatchClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const errors: string[] = [];

      if (!formData.businessCategory) errors.push("业务分类");
      if (!formData.productInstance) errors.push("产品实例 (请点击选择)");
      if (!formData.faultTime) errors.push("故障时间");
      
      if (!formData.isFromFaultDispatch) {
          if (!formData.contactPerson) errors.push("投诉人");
          if (!formData.contactPhone) errors.push("投诉人电话");
      }

      if (!formData.complaintContent) errors.push("投诉内容");

      if (!formData.dispatchA && !formData.dispatchZ) {
          errors.push("请至少选择一个下派地市 (A端或Z端)");
      }

      if (formData.dispatchA) {
          if (!formData.dispatchObjectA) errors.push("A端下派对象");
          if (formData.dispatchObjectA === '铁通班组' && !formData.teamA) errors.push("A端下派班组");
      }

      if (formData.dispatchZ) {
          if (!formData.dispatchObjectZ) errors.push("Z端下派对象");
          if (formData.dispatchObjectZ === '铁通班组' && !formData.teamZ) errors.push("Z端下派班组");
      }

      if (errors.length > 0) {
          setNotification({
              type: 'error',
              message: `校验失败，请检查：\n${errors.join('、')}`
          });
          return;
      }

      setNotification({ type: 'success', message: '投诉派单成功！正在跳转...' });
      
      // Delay submit slightly to show success message
      setTimeout(() => {
          if (onSubmit) onSubmit();
      }, 1000);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
        setNotification({ type: 'error', message: "您的浏览器不支持语音识别功能，请使用Chrome浏览器。" });
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
    recognition.onerror = (event: any) => { setIsListening(false); };
    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
            setFormData(prev => ({
                ...prev,
                complaintContent: prev.complaintContent + (prev.complaintContent ? ' ' : '') + transcript
            }));
        }
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-blue-100 animate-[fadeIn_0.3s_ease-out] overflow-hidden border border-blue-500/30 shadow-[inset_0_0_20px_rgba(0,133,208,0.1)] relative">
        
        {/* Custom Notification Toast - Absolute Positioned on Top */}
        {notification && (
            <NotificationToast 
                message={notification.message} 
                type={notification.type} 
                onClose={() => setNotification(null)} 
            />
        )}

        {/* Header Area REMOVED */}

        {/* Content Area */}
        <div className="relative z-0 flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
            
            {/* 1. 投诉业务 */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-neon-blue"></span>
                    投诉业务
                </h3>
                <div className="grid grid-cols-3 gap-x-8 gap-y-4 bg-blue-900/10 p-6 border border-blue-500/30 rounded-sm shadow-sm">
                    <FormRow label="业务分类" required>
                        <StyledSelect 
                            className={`w-full ${formData.isFromFaultDispatch ? 'bg-[#0f172a]/20 text-gray-400 cursor-not-allowed border-blue-500/30' : ''}`}
                            value={formData.businessCategory} 
                            onChange={(e) => handleChange('businessCategory', e.target.value)}
                            disabled={formData.isFromFaultDispatch}
                        >
                            <option value="">请选择</option>
                            <option value="专线">专线</option>
                            <option value="企宽">企宽</option>
                        </StyledSelect>
                    </FormRow>

                    {formData.businessCategory === '专线' && (
                        <>
                            <FormRow label="产品实例" required>
                                <StyledInput 
                                    className={`w-full cursor-pointer hover:border-neon-blue bg-[#0f172a] placeholder-blue-500/50 ${formData.isFromFaultDispatch ? 'bg-slate-800/50 text-gray-400 cursor-not-allowed' : ''}`}
                                    value={formData.productInstance} 
                                    onClick={() => { if (!formData.isFromFaultDispatch) { setModalContext('专线'); setIsServiceModalOpen(true); } }}
                                    readOnly
                                    placeholder={formData.isFromFaultDispatch ? "自动回填" : "点击选择业务"}
                                />
                            </FormRow>
                            <FormRow label="业务类型">
                                <StyledSelect 
                                    className="w-full bg-[#0f172a]/20 text-gray-400 cursor-not-allowed border-blue-500/30"
                                    value={formData.businessType} 
                                    onChange={(e) => handleChange('businessType', e.target.value)}
                                    disabled={true}
                                >
                                    <option value="">自动回填</option>
                                    <option value="专线">专线</option>
                                    <option value="数据专线">数据专线</option>
                                    <option value="互联网专线">互联网专线</option>
                                    <option value="MPLS-VPN">MPLS-VPN</option>
                                    <option value="企宽">企宽</option>
                                    <option value="云网">云网</option>
                                </StyledSelect>
                            </FormRow>
                            <FormRow label="电路代号">
                                <StyledInput className="w-full bg-slate-800/50 text-gray-400 cursor-not-allowed" value={formData.circuitCode} readOnly disabled placeholder="自动回填" />
                            </FormRow>
                        </>
                    )}

                    {formData.businessCategory === '企宽' && (
                        <>
                            <FormRow label="宽带账号" required>
                                <StyledInput 
                                    className={`w-full cursor-pointer hover:border-neon-blue bg-[#0f172a] placeholder-blue-500/50 ${formData.isFromFaultDispatch ? 'bg-slate-800/50 text-gray-400 cursor-not-allowed' : ''}`}
                                    value={(formData as any).broadbandAccount || ''} 
                                    onClick={() => { if (!formData.isFromFaultDispatch) { setModalContext('企宽'); setIsServiceModalOpen(true); } }}
                                    readOnly
                                    placeholder={formData.isFromFaultDispatch ? "自动回填" : "点击选择企宽业务"}
                                />
                            </FormRow>
                            <FormRow label="宽带类型">
                                <StyledInput className="w-full bg-slate-800/50 text-gray-400 cursor-not-allowed" value={(formData as any).broadbandType || ''} readOnly disabled placeholder="自动回填" />
                            </FormRow>
                        </>
                    )}

                    {(formData.businessCategory === '专线' || formData.businessCategory === '企宽') && (
                        <>
                            <FormRow label="客户名称">
                                <StyledInput className="w-full bg-slate-800/50 text-gray-400 cursor-not-allowed" value={formData.customerName} readOnly disabled placeholder="自动回填" />
                            </FormRow>
                            <FormRow label="客户编号">
                                <StyledInput className="w-full bg-slate-800/50 text-gray-400 cursor-not-allowed" value={formData.customerCode} readOnly disabled placeholder="自动回填" />
                            </FormRow>
                            <FormRow label={formData.businessType === '数据专线' && formData.businessCategory === '专线' ? 'A端地市' : '地市'}>
                                <StyledInput className="w-full bg-slate-800/50 text-gray-400 cursor-not-allowed" value={formData.cityA} readOnly disabled placeholder="自动回填" />
                            </FormRow>
                            <FormRow label={formData.businessType === '数据专线' && formData.businessCategory === '专线' ? 'A端区县' : '区县'}>
                                <StyledInput className="w-full bg-slate-800/50 text-gray-400 cursor-not-allowed" value={formData.districtA} readOnly disabled placeholder="自动回填" />
                            </FormRow>
                            <FormRow label={formData.businessType === '数据专线' && formData.businessCategory === '专线' ? 'A端业务地址' : '业务地址'}>
                                <StyledInput className="w-full bg-slate-800/50 text-gray-400 cursor-not-allowed" value={formData.serviceAddressA} readOnly disabled placeholder="自动回填" />
                            </FormRow>
                            {formData.businessType === '数据专线' && formData.businessCategory === '专线' && (
                                <>
                                    <FormRow label="Z端地市">
                                        <StyledInput className="w-full bg-slate-800/50 text-gray-400 cursor-not-allowed" value={formData.cityZ} readOnly disabled placeholder="自动回填" />
                                    </FormRow>
                                    <FormRow label="Z端区县">
                                        <StyledInput className="w-full bg-slate-800/50 text-gray-400 cursor-not-allowed" value={formData.districtZ} readOnly disabled placeholder="自动回填" />
                                    </FormRow>
                                    <FormRow label="Z端业务地址">
                                        <StyledInput className="w-full bg-slate-800/50 text-gray-400 cursor-not-allowed" value={formData.serviceAddressZ} readOnly disabled placeholder="自动回填" />
                                    </FormRow>
                                </>
                            )}
                        </>
                    )}

                    {formData.businessCategory === '专线' && (
                        <>
                            <FormRow label={formData.businessType === '数据专线' ? 'A端保障等级' : '保障等级'}>
                                <StyledInput className="w-full bg-slate-800/50 text-gray-400 cursor-not-allowed" value={(formData as any).aAssuranceLevel} readOnly disabled placeholder="自动回填" />
                            </FormRow>
                            {formData.businessType === '数据专线' && (
                                <FormRow label="Z端保障等级">
                                    <StyledInput className="w-full bg-slate-800/50 text-gray-400 cursor-not-allowed" value={(formData as any).zAssuranceLevel} readOnly disabled placeholder="自动回填" />
                                </FormRow>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* 2. 投诉信息 */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-neon-blue"></span>
                    投诉信息
                </h3>
                <div className="grid grid-cols-3 gap-x-8 gap-y-4 bg-blue-900/10 p-6 border border-blue-500/30 rounded-sm shadow-sm">
                    <FormRow label="故障时间" required>
                        <StyledInput 
                            type="datetime-local"
                            className="w-full"
                            value={formData.faultTime} 
                            onChange={(e) => handleChange('faultTime', e.target.value)}
                        />
                    </FormRow>
                    <FormRow label="投诉人" required={!formData.isFromFaultDispatch}>
                        <StyledInput className="w-full" value={formData.contactPerson} onChange={(e) => handleChange('contactPerson', e.target.value)} />
                    </FormRow>
                    <FormRow label="投诉人电话" required={!formData.isFromFaultDispatch}>
                        <StyledInput className="w-full" value={formData.contactPhone} onChange={(e) => handleChange('contactPhone', e.target.value)} />
                    </FormRow>

                    <div className="col-span-3 flex items-start gap-3 mt-2">
                        <label className="w-[70px] text-right text-xs text-blue-300 shrink-0 pt-1.5 select-none">
                            <span className="text-red-500 mr-0.5">*</span>
                            投诉内容
                        </label>
                        <div className="flex-1 relative">
                            <textarea 
                                className={`w-full bg-[#0f172a]/30 border border-[#0085D0]/50 text-blue-100 text-sm px-3 py-2 focus:outline-none focus:border-neon-blue transition-colors rounded-none h-24 resize-none leading-relaxed pr-10 ${formData.isContentReadOnly ? 'bg-slate-800/50 text-gray-400 cursor-not-allowed' : ''}`}
                                value={formData.complaintContent} 
                                onChange={(e) => handleChange('complaintContent', e.target.value)}
                                placeholder="请输入投诉详情..."
                                readOnly={formData.isContentReadOnly}
                            />
                            {!formData.isContentReadOnly && (
                                <button 
                                    onClick={handleVoiceInput}
                                    className={`absolute right-2 bottom-2 p-1.5 rounded-full transition-all duration-300 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/30'}`}
                                    type="button"
                                >
                                    <MicIcon />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="col-span-3 flex items-start gap-3 mt-2">
                        <label className="w-[70px] text-right text-xs text-blue-300 shrink-0 pt-1.5 select-none">
                            附件上传
                        </label>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-900/40 border border-blue-500/50 text-blue-100 text-xs hover:bg-blue-800/60 transition-colors rounded-sm"
                                >
                                    <PaperclipIcon />
                                    选择文件
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const newFile = {
                                                id: Math.random().toString(36).substr(2, 9),
                                                name: file.name,
                                                size: (file.size / 1024).toFixed(1) + ' KB'
                                            };
                                            setAttachments(prev => [...prev, newFile]);
                                            e.target.value = ''; // Reset
                                        }
                                    }}
                                />
                                <span className="text-[10px] text-blue-400/60 italic">支持图片、文档、压缩包等格式</span>
                            </div>
                            
                            {attachments.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {attachments.map(file => (
                                        <div key={file.id} className="flex items-center justify-between px-3 py-2 bg-blue-950/40 border border-blue-500/20 rounded-sm group">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <PaperclipIcon />
                                                <div className="flex flex-col min-w-0">
                                                    <span className={`text-xs text-blue-100 truncate ${(file as any).url ? 'cursor-pointer hover:text-neon-blue underline underline-offset-2' : ''}`} title={file.name} onClick={() => (file as any).url && window.open((file as any).url, '_blank')}>{file.name}</span>
                                                    <span className="text-[10px] text-blue-400/60">{file.size}</span>
                                                </div>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => setAttachments(prev => prev.filter(a => a.id !== file.id))}
                                                className="p-1 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all rounded"
                                                title="删除附件"
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. 下派信息 */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-neon-blue"></span>
                    下派信息
                </h3>
                <div className="bg-blue-900/10 p-6 border border-blue-500/30 rounded-sm space-y-4 min-h-[100px] flex flex-col justify-center shadow-sm">
                    {!formData.productInstance ? (
                        <div className="flex items-center justify-center text-blue-300/50 italic py-4">请先选择投诉业务以生成下派信息</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-3 gap-x-8 gap-y-4 items-center">
                                    <div className="flex items-center gap-2">
                                        <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors select-none">
                                            <input 
                                                type="checkbox" 
                                                checked={formData.dispatchA}
                                                onChange={(e) => handleChange('dispatchA', e.target.checked)}
                                                className="accent-neon-blue w-3.5 h-3.5 cursor-pointer"
                                            />
                                            <span className={`text-sm font-medium ${formData.dispatchA ? 'text-white' : 'text-blue-300'}`}>
                                                A端地市 {formData.cityA ? `(${formData.cityA}${formData.districtA ? ` - ${formData.districtA}` : ''})` : ''}
                                            </span>
                                        </label>
                                    </div>
                                    <FormRow label="下派对象" required={formData.dispatchA}>
                                        <StyledSelect 
                                            value={formData.dispatchObjectA}
                                            onChange={(e) => handleChange('dispatchObjectA', e.target.value)}
                                            className="w-full"
                                            disabled={!formData.dispatchA}
                                        >
                                            <option value="">请选择</option>
                                            <option value="铁通班组">铁通班组</option>
                                            <option value="分公司客响人员">分公司客响人员</option>
                                        </StyledSelect>
                                    </FormRow>
                                    <div>
                                        {formData.dispatchObjectA === '铁通班组' && (
                                            <FormRow label="下派班组" required={formData.dispatchA}>
                                                <StyledSelect 
                                                    value={formData.teamA}
                                                    onChange={(e) => handleChange('teamA', e.target.value)}
                                                    className="w-full"
                                                >
                                                    <option value="">请选择</option>
                                                    <option value="铁通维护一班">铁通维护一班</option>
                                                    <option value="铁通抢修二班">铁通抢修二班</option>
                                                    <option value="综合维护组">综合维护组</option>
                                                </StyledSelect>
                                            </FormRow>
                                        )}
                                    </div>
                            </div>

                            {(formData.businessType === '数据专线' && formData.cityZ) && (
                            <div className="grid grid-cols-3 gap-x-8 gap-y-4 items-center border-t border-blue-500/10 pt-4">
                                    <div className="flex items-center gap-2">
                                        <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors select-none">
                                            <input 
                                                type="checkbox" 
                                                checked={formData.dispatchZ}
                                                onChange={(e) => handleChange('dispatchZ', e.target.checked)}
                                                className="accent-neon-blue w-3.5 h-3.5 cursor-pointer"
                                            />
                                            <span className={`text-sm font-medium ${formData.dispatchZ ? 'text-white' : 'text-blue-300'}`}>
                                                Z端地市 ({formData.cityZ})
                                            </span>
                                        </label>
                                    </div>
                                    <FormRow label="下派对象" required={formData.dispatchZ}>
                                        <StyledSelect 
                                            value={formData.dispatchObjectZ}
                                            onChange={(e) => handleChange('dispatchObjectZ', e.target.value)}
                                            className="w-full"
                                            disabled={!formData.dispatchZ}
                                        >
                                            <option value="">请选择</option>
                                            <option value="铁通班组">铁通班组</option>
                                            <option value="分公司客响人员">分公司客响人员</option>
                                        </StyledSelect>
                                    </FormRow>
                                    <div>
                                        {formData.dispatchObjectZ === '铁通班组' && (
                                            <FormRow label="下派班组" required={formData.dispatchZ}>
                                                <StyledSelect 
                                                    value={formData.teamZ}
                                                    onChange={(e) => handleChange('teamZ', e.target.value)}
                                                    className="w-full"
                                                >
                                                    <option value="">请选择</option>
                                                    <option value="铁通维护一班">铁通维护一班</option>
                                                    <option value="铁通抢修二班">铁通抢修二班</option>
                                                    <option value="综合维护组">综合维护组</option>
                                                </StyledSelect>
                                            </FormRow>
                                        )}
                                    </div>
                            </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>

        {/* Footer with Action Buttons - Adjusted height to 40px and transparency to 40% */}
        <div className="relative z-50 flex items-center justify-end gap-3 px-6 h-[40px] border-t border-blue-500/30 bg-[#0c2242]/40 shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.2)]">
            <button 
                type="button"
                onClick={onCancel}
                className="px-6 py-1.5 text-sm bg-slate-700/50 hover:bg-slate-600 border border-slate-500 text-slate-200 transition-colors cursor-pointer rounded-sm"
            >
                取消
            </button>
            <button
                type="button"
                onClick={handleDispatchClick}
                className="
                    relative
                    flex items-center justify-center gap-2 px-8 py-1.5 text-sm font-bold tracking-wide 
                    text-white bg-[#07596C] border border-[#00d2ff] 
                    shadow-[0_0_15px_rgba(0,210,255,0.4)]
                    hover:bg-[#097c96] hover:shadow-[0_0_20px_rgba(0,210,255,0.6)]
                    active:scale-95 active:bg-[#064e5f]
                    transition-all duration-100 cursor-pointer select-none rounded-sm
                "
            >
                派发工单
            </button>
        </div>

        <ServiceSelectionModal 
            isOpen={isServiceModalOpen}
            onClose={() => { setIsServiceModalOpen(false); setModalContext(null); }}
            onConfirm={handleServiceSelect}
            showAssuranceLevel={true}
            initialBusinessCategory={modalContext || undefined}
            hideServiceType={modalContext !== null}
            hideBusinessCategory={modalContext !== null}
        />
    </div>
  );
};
