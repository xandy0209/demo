
import React, { useState, useEffect, useRef } from 'react';
import { XIcon, MicIcon } from './Icons';
import { StyledInput, StyledButton, StyledSelect } from './UI';
import { INNER_MONGOLIA_CITIES } from '../constants';
import { ServiceSelectionModal } from './ServiceSelectionModal';
import { SubscriptionRecord } from '../types';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  // In a real app, this would pass the created/edited record back
  onConfirm: () => void; 
  initialData?: any; // For editing
  stage: 'T0' | 'T1' | 'T2';
}

// Helper for horizontal form field
const FormRow = ({ label, children }: { label: string, children?: React.ReactNode }) => (
    <div className="flex items-center gap-3">
        <label className="w-[70px] text-right text-xs text-blue-300 shrink-0">{label}</label>
        <div className="flex-1 min-w-0">
            {children}
        </div>
    </div>
);

export const ComplaintModal: React.FC<ComplaintModalProps> = ({ isOpen, onClose, onConfirm, initialData, stage }) => {
  const [formData, setFormData] = useState({
    productInstance: initialData?.productInstance || '',
    circuitCode: initialData?.circuitCode || '',
    customerName: initialData?.customerName || '',
    complaintContent: initialData?.complaintContent || '',
    contactPerson: initialData?.contactPerson || '',
    contactPhone: initialData?.contactPhone || '',
    assigneeCity: initialData?.assigneeCity || '呼和浩特市',
    assigneeRole: '铁通班组',
    // New fields for T0
    businessType: initialData?.productType || '专线', // using productType as businessType mock
    customerCode: initialData?.customerCode || '',
    serviceAddressA: initialData?.serviceAddressA || '',
    serviceAddressZ: initialData?.serviceAddressZ || '',
    faultTime: initialData?.faultTime || '',
    
    // Dispatch Logic
    dispatchA: true,
    dispatchZ: false,
    cityA: '', 
    cityZ: '',
    
    // Dispatch Object & Team
    dispatchObjectA: '', // 下派对象 A
    dispatchObjectZ: '', // 下派对象 Z
    teamA: '',           // 下派班组 A
    teamZ: '',           // 下派班组 Z
    aAssuranceLevel: initialData?.aAssuranceLevel || '',
    zAssuranceLevel: initialData?.zAssuranceLevel || '',

    // T1
    faultType: initialData?.faultType || '',
    faultResult: initialData?.faultResult || '',
    faultCause: initialData?.faultCause || '',
    // T2
    isSatisfied: initialData?.isSatisfied || '',
    qcRemarks: initialData?.qcRemarks || '',
  });

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Voice Recognition Logic
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

    recognition.onstart = () => {
        setIsListening(true);
    };

    recognition.onend = () => {
        setIsListening(false);
    };

    recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
    };

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


  // Update state when initialData changes
  useEffect(() => {
      if (isOpen && initialData) {
          setFormData(prev => ({
              ...prev,
              productInstance: initialData.productInstance || '',
              circuitCode: initialData.circuitCode || '',
              customerName: initialData.customerName || '',
              complaintContent: initialData.complaintContent || '',
              contactPerson: initialData.contactPerson || '',
              contactPhone: initialData.contactPhone || '',
              assigneeCity: initialData.assigneeCity || '呼和浩特市',
              businessType: initialData.productType || '专线',
              customerCode: initialData.customerCode || '',
              serviceAddressA: initialData.serviceAddressA || '',
              serviceAddressZ: initialData.serviceAddressZ || '',
              faultTime: initialData.faultTime || '',
              faultType: initialData.faultType || '',
              faultResult: initialData.faultResult || '',
              faultCause: initialData.faultCause || '',
              isSatisfied: initialData.isSatisfied || '',
              qcRemarks: initialData.qcRemarks || '',
              // Reset dispatch logic for existing tickets (simplified)
              dispatchObjectA: '铁通班组',
              teamA: initialData.assignee || '',
              // Try to extract city from address if not explicitly available, or default
              cityA: initialData.assigneeCity || '', 
              cityZ: '', 
          }));
      } else if (isOpen && !initialData) {
          // Reset for new
          setFormData(prev => ({
              ...prev,
              productInstance: '',
              circuitCode: '',
              customerName: '',
              complaintContent: '',
              contactPerson: '',
              contactPhone: '',
              businessType: '',
              customerCode: '',
              serviceAddressA: '',
              serviceAddressZ: '',
              faultTime: '',
              dispatchA: true,
              dispatchZ: false,
              dispatchObjectA: '',
              dispatchObjectZ: '',
              teamA: '',
              teamZ: '',
              cityA: '',
              cityZ: '',
          }));
      }
      // Stop listening if modal closes
      if (!isOpen && isListening) {
          recognitionRef.current?.stop();
          setIsListening(false);
      }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceSelect = (record: SubscriptionRecord) => {
    const isDataLine = record.serviceType === '数据专线';
    setFormData(prev => ({
        ...prev,
        productInstance: record.productInstance,
        circuitCode: record.circuitCode,
        businessType: record.serviceType,
        customerName: record.customerName,
        customerCode: record.customerCode,
        // Map addresses
        serviceAddressA: record.addressA || '',
        serviceAddressZ: isDataLine ? (record.addressZ || '') : '',
        // Update cities for dispatch info
        cityA: record.cityA,
        cityZ: isDataLine ? record.cityZ : '',
        // Reset dispatch toggles based on line type
        dispatchA: true,
        dispatchZ: false,
        aAssuranceLevel: record.aAssuranceLevel || '',
        zAssuranceLevel: record.zAssuranceLevel || ''
    }));
    setIsServiceModalOpen(false);
  };

  const getTitle = () => {
      // Stage T0 is handled by new tab view now, but keep fallback
      if (stage === 'T0') return '新建投诉工单';
      if (stage === 'T1') return '工单受理/处理 (T1)';
      return '工单质检/归档 (T2)';
  };

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
      <div className="w-[800px] bg-[#0f172a] border border-blue-500/30 text-blue-100 font-sans shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-2 bg-[#1e293b]/50 border-b border-blue-500/30">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white tracking-wide">
              {getTitle()}
            </span>
            {initialData && <span className="text-xs text-neon-blue bg-blue-500/10 px-2 py-0.5 border border-blue-500/20">{initialData.ticketNo}</span>}
          </div>
          <button onClick={onClose} className="text-blue-400 hover:text-white transition-colors">
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          
          {/* T0: New Ticket Form Structure (Single Page) */}
          {stage === 'T0' ? (
             <div className="flex items-center justify-center h-full text-gray-400">
                 请使用左侧“新增工单”菜单在Tab页中进行新建。
             </div>
          ) : (
            /* Layout for T1 and T2 - Kept mostly same but wrapped in fragments/divs for consistency */
            <>
                {/* Basic Info Read-only or limited edit for T1/T2 */}
                <div>
                    <h3 className="text-sm font-bold text-neon-blue mb-3 uppercase tracking-wider border-l-2 border-neon-blue pl-2">基本信息</h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 bg-blue-900/5 p-4 border border-blue-500/10">
                        <FormRow label="产品实例">
                            <StyledInput className="w-full" value={formData.productInstance} disabled />
                        </FormRow>
                        <FormRow label="电路代号">
                            <StyledInput className="w-full" value={formData.circuitCode} disabled />
                        </FormRow>
                        <FormRow label="客户名称">
                            <StyledInput className="w-full" value={formData.customerName} disabled />
                        </FormRow>
                        <FormRow label="A端保障等级">
                            <StyledInput className="w-full" value={(formData as any).aAssuranceLevel || '普通'} disabled />
                        </FormRow>
                        {formData.businessType === '数据专线' && (
                            <FormRow label="Z端保障等级">
                                <StyledInput className="w-full" value={(formData as any).zAssuranceLevel || '普通'} disabled />
                            </FormRow>
                        )}
                        <FormRow label="投诉内容">
                            <StyledInput className="w-full" value={formData.complaintContent} disabled />
                        </FormRow>
                    </div>
                </div>

                {/* T1 Section */}
                {(stage === 'T1' || (initialData && initialData.stage !== 'T0')) && (
                    <div>
                        <h3 className="text-sm font-bold text-neon-blue mb-3 uppercase tracking-wider border-l-2 border-neon-blue pl-2">处理回单</h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3 bg-blue-900/10 p-4 border border-blue-500/10">
                            <FormRow label="故障类型">
                                <StyledSelect 
                                    className="w-full"
                                    value={formData.faultType}
                                    onChange={(e) => handleChange('faultType', e.target.value)}
                                    disabled={stage !== 'T1'}
                                >
                                    <option value="">请选择</option>
                                    <option value="光缆故障">光缆故障</option>
                                    <option value="设备故障">设备故障</option>
                                    <option value="电力故障">电力故障</option>
                                    <option value="误报">误报</option>
                                </StyledSelect>
                            </FormRow>
                            <FormRow label="处理结果">
                                <StyledSelect 
                                    className="w-full"
                                    value={formData.faultResult}
                                    onChange={(e) => handleChange('faultResult', e.target.value)}
                                    disabled={stage !== 'T1'}
                                >
                                    <option value="">请选择</option>
                                    <option value="已修复">已修复</option>
                                    <option value="观察中">观察中</option>
                                    <option value="未发现异常">未发现异常</option>
                                </StyledSelect>
                            </FormRow>
                            <div className="col-span-2 flex items-start gap-3">
                                <label className="w-[70px] text-right text-xs text-blue-300 shrink-0 pt-1.5">处理说明</label>
                                <textarea 
                                    className="flex-1 bg-[#0f172a]/30 border border-[#0085D0]/50 text-blue-100 text-sm px-3 py-2 focus:outline-none focus:border-neon-blue transition-colors rounded-none h-20 resize-none"
                                    value={formData.faultCause}
                                    onChange={(e) => handleChange('faultCause', e.target.value)}
                                    disabled={stage !== 'T1'}
                                ></textarea>
                            </div>
                        </div>
                    </div>
                )}

                {/* T2 Section */}
                {stage === 'T2' && (
                    <div>
                        <h3 className="text-sm font-bold text-neon-blue mb-3 uppercase tracking-wider border-l-2 border-neon-blue pl-2">质检归档</h3>
                        <div className="grid grid-cols-1 gap-4 bg-blue-900/10 p-4 border border-blue-500/10">
                            <FormRow label="客户满意度">
                                <StyledSelect 
                                    className="w-full"
                                    value={formData.isSatisfied}
                                    onChange={(e) => handleChange('isSatisfied', e.target.value)}
                                >
                                    <option value="">请选择</option>
                                    <option value="满意">满意</option>
                                    <option value="基本满意">基本满意</option>
                                    <option value="不满意">不满意</option>
                                </StyledSelect>
                            </FormRow>
                            <div className="flex items-start gap-3">
                                <label className="w-[70px] text-right text-xs text-blue-300 shrink-0 pt-1.5">质检备注</label>
                                <textarea 
                                    className="flex-1 bg-[#0f172a]/30 border border-[#0085D0]/50 text-blue-100 text-sm px-3 py-2 focus:outline-none focus:border-neon-blue transition-colors rounded-none h-20 resize-none"
                                    value={formData.qcRemarks}
                                    onChange={(e) => handleChange('qcRemarks', e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                    </div>
                )}
            </>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-2 bg-[#1e293b]/50 border-t border-blue-500/30 shrink-0">
           <StyledButton variant="secondary" onClick={onClose}>
              取消
           </StyledButton>
           <StyledButton variant="primary" onClick={onConfirm}>
              {stage === 'T0' ? '派发工单' : stage === 'T1' ? '回单提交' : '归档'}
           </StyledButton>
        </div>
      </div>
      
      {/* Nested Modal for Correct Stacking Context */}
      <ServiceSelectionModal 
          isOpen={isServiceModalOpen}
          onClose={() => setIsServiceModalOpen(false)}
          onConfirm={handleServiceSelect}
          showAssuranceLevel={true}
      />
    </div>
    </>
  );
};
