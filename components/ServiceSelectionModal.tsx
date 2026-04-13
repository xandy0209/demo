
import React, { useState, useEffect } from 'react';
import { XIcon, SearchIcon } from './Icons';
import { StyledInput, StyledButton, StyledSelect } from './UI';
import { SubscriptionRecord } from '../types';
import { MOCK_SUBSCRIPTION_DATA, INNER_MONGOLIA_CITIES } from '../constants';
import { Pagination } from './Pagination';

interface ServiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (record: SubscriptionRecord) => void;
  onConfirmMulti?: (records: SubscriptionRecord[]) => void;
  isMultiSelect?: boolean;
  title?: string;
  hideBusinessCategory?: boolean;
  hideServiceType?: boolean;
  isImportantBusinessMode?: boolean;
  showAssuranceLevel?: boolean;
  initialBusinessCategory?: string;
}

export const ServiceSelectionModal: React.FC<ServiceSelectionModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  onConfirmMulti,
  isMultiSelect = false,
  title = "投诉业务查询选择",
  hideBusinessCategory = false,
  hideServiceType = false,
  isImportantBusinessMode = false,
  showAssuranceLevel = false,
  initialBusinessCategory
}) => {
  const [filters, setFilters] = useState({
    keyword: '',
    businessCategory: initialBusinessCategory || '专线',
    serviceType: '',
    city: '',
    assuranceLevel: ''
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filteredData, setFilteredData] = useState<SubscriptionRecord[]>(MOCK_SUBSCRIPTION_DATA.filter(item => item.businessCategory === '专线'));
  const [pagination, setPagination] = useState({
      currentPage: 1,
      pageSize: 10
  });

  // Sync filtered data when filters change or modal opens
  useEffect(() => {
    if (isOpen) {
        handleSearch();
    }
  }, [isOpen, filters.businessCategory, filters.city]);

  useEffect(() => {
    if (initialBusinessCategory) {
      setFilters(prev => ({ ...prev, businessCategory: initialBusinessCategory }));
    }
  }, [initialBusinessCategory]);

  const handleSearch = () => {
    const lowerKeyword = filters.keyword.toLowerCase();
    const lowerType = filters.serviceType.toLowerCase();

    const filtered = MOCK_SUBSCRIPTION_DATA.filter(item => {
        // If in Important Business Mode, exclude '企宽'
        if (isImportantBusinessMode && item.serviceType === '企宽') return false;

        const matchKeyword = !filters.keyword || 
                             item.customerName.toLowerCase().includes(lowerKeyword) ||
                             item.customerCode.toLowerCase().includes(lowerKeyword) ||
                             item.productInstance.toLowerCase().includes(lowerKeyword) ||
                             (item.broadbandAccount && item.broadbandAccount.toLowerCase().includes(lowerKeyword)) ||
                             (item.addressA && item.addressA.toLowerCase().includes(lowerKeyword)) || 
                             (item.addressZ && item.addressZ.toLowerCase().includes(lowerKeyword));
                             
        const matchCategory = hideBusinessCategory || !filters.businessCategory || item.businessCategory === filters.businessCategory;
        const matchType = (isImportantBusinessMode || !hideServiceType) ? (!filters.serviceType || item.serviceType.toLowerCase().includes(lowerType)) : true;
        const matchCity = !filters.city || item.cityA === filters.city || item.cityZ === filters.city;
        const matchAssurance = !(isImportantBusinessMode || showAssuranceLevel) || !filters.assuranceLevel || item.assuranceLevel === filters.assuranceLevel;
        
        return matchKeyword && matchCategory && matchType && matchCity && matchAssurance;
    });
    setFilteredData(filtered);
    setSelectedId(null);
    setSelectedIds(new Set());
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleConfirm = () => {
      if (isMultiSelect) {
          if (onConfirmMulti && selectedIds.size > 0) {
              const records = filteredData.filter(r => selectedIds.has(r.id));
              onConfirmMulti(records);
          }
      } else {
          if (selectedId && onConfirm) {
              const record = filteredData.find(r => r.id === selectedId);
              if (record) {
                  onConfirm(record);
              }
          }
      }
  };

  const toggleSelect = (id: string) => {
      if (isMultiSelect) {
          const newSelected = new Set(selectedIds);
          if (newSelected.has(id)) {
              newSelected.delete(id);
          } else {
              newSelected.add(id);
          }
          setSelectedIds(newSelected);
      } else {
          setSelectedId(id);
      }
  };

  const toggleSelectAll = () => {
      if (selectedIds.size === paginatedData.length) {
          setSelectedIds(new Set());
      } else {
          const newSelected = new Set(selectedIds);
          paginatedData.forEach(r => newSelected.add(r.id));
          setSelectedIds(newSelected);
      }
  };

  // Pagination Logic
  const paginatedData = filteredData.slice(
      (pagination.currentPage - 1) * pagination.pageSize,
      pagination.currentPage * pagination.pageSize
  );

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-[#0b1730]/70 backdrop-blur-[2px]">
      {/* Container Background: Dark Space Blue #0b1730 */}
      <div className="w-[1100px] bg-[#0b1730] border border-blue-500/30 text-blue-100 font-sans shadow-[0_0_30px_rgba(0,133,208,0.2)] flex flex-col max-h-[55vh]">
        {/* Header: #0c2242/70 */}
        <div className="flex items-center justify-between px-6 py-2 bg-[#0c2242]/70 border-b border-blue-500/30 shrink-0 h-[40px]">
          <span className="text-base font-bold text-white tracking-wide">{title}</span>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
            <XIcon />
          </button>
        </div>

        {/* Search Bar: #13284c/30 */}
        <div className="p-4 bg-[#13284c]/30 border-b border-blue-500/10 flex items-center gap-3 shrink-0">
            {!hideBusinessCategory && !isImportantBusinessMode && (
                <StyledSelect 
                    className="w-auto"
                    value={filters.businessCategory}
                    onChange={e => setFilters({...filters, businessCategory: e.target.value, serviceType: ''})}
                >
                    <option value="专线">专线</option>
                    <option value="企宽">企宽</option>
                </StyledSelect>
            )}
            <StyledInput 
                placeholder={filters.businessCategory === '企宽' ? "客户名称/宽带账号/业务地址" : "客户名称/客户编号/产品实例/电路编号/业务地址"} 
                className="w-[350px]"
                value={filters.keyword}
                onChange={e => setFilters({...filters, keyword: e.target.value})}
            />
            {(isImportantBusinessMode || (!hideServiceType && filters.businessCategory === '专线')) && (
                <StyledSelect 
                    className="w-auto"
                    value={filters.serviceType}
                    onChange={e => setFilters({...filters, serviceType: e.target.value})}
                >
                    <option value="">业务类型</option>
                    <option value="数据专线">数据专线</option>
                    <option value="互联网专线">互联网专线</option>
                    <option value="语音专线">语音专线</option>
                    <option value="MPLS-VPN专线">MPLS-VPN专线</option>
                </StyledSelect>
            )}
            {(filters.businessCategory !== '企宽') && (isImportantBusinessMode || showAssuranceLevel) && (
                <StyledSelect 
                    className="w-auto"
                    value={filters.assuranceLevel}
                    onChange={e => setFilters({...filters, assuranceLevel: e.target.value})}
                >
                    <option value="">保障等级</option>
                    <option value="AAA">AAA</option>
                    <option value="AA">AA</option>
                    <option value="A">A</option>
                    <option value="普通">普通</option>
                </StyledSelect>
            )}
            <StyledSelect 
                 className="w-auto"
                 value={filters.city}
                 onChange={e => setFilters({...filters, city: e.target.value})}
            >
                <option value="">业务地市</option>
                {INNER_MONGOLIA_CITIES.map(c => (
                    <option key={c.code} value={c.name}>{c.name}</option>
                ))}
            </StyledSelect>
            <StyledButton variant="toolbar" onClick={handleSearch} icon={<SearchIcon />}>
                查询
            </StyledButton>
        </div>

        {/* Table List: #0b1730/50 */}
        <div className="flex-1 overflow-auto p-0 scrollbar-thin bg-[#0b1730]/50">
            <table className="w-full text-left border-separate border-spacing-0 text-xs whitespace-nowrap">
                <thead className="text-blue-100">
                    <tr>
                        {isMultiSelect && (
                            <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold shadow-sm w-10">
                                <input 
                                    type="checkbox" 
                                    className="accent-blue-500"
                                    checked={paginatedData.length > 0 && paginatedData.every(r => selectedIds.has(r.id))}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                        )}
                        <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold shadow-sm">客户名称</th>
                        <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold shadow-sm">客户编号</th>
                        {filters.businessCategory === '企宽' ? (
                            <>
                                <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold shadow-sm">宽带类型</th>
                                <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold shadow-sm">宽带账号</th>
                                <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold shadow-sm">地市</th>
                                <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold shadow-sm">区县</th>
                                <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold shadow-sm">业务地址</th>
                            </>
                        ) : (isImportantBusinessMode || showAssuranceLevel) ? (
                            <>
                                <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold shadow-sm">业务类型</th>
                                <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold shadow-sm">产品实例</th>
                                <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold shadow-sm">电路代号</th>
                                <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold shadow-sm">A端保障等级</th>
                                <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold shadow-sm">A端地市</th>
                                <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold shadow-sm">A端地址</th>
                                <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold shadow-sm">Z端保障等级</th>
                                <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold shadow-sm">Z端地市</th>
                                <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold shadow-sm">Z端地址</th>
                            </>
                        ) : (
                            <>
                                <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold shadow-sm">业务类型</th>
                                <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold shadow-sm">产品实例</th>
                                <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold shadow-sm">电路代号</th>
                                <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold shadow-sm">A端地市</th>
                                <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold shadow-sm">A端地址</th>
                                <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold shadow-sm">Z端地市</th>
                                <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold shadow-sm">Z端地址</th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.length > 0 ? (
                        paginatedData.map((row, idx) => {
                            const isSelected = isMultiSelect ? selectedIds.has(row.id) : selectedId === row.id;
                            return (
                                <tr 
                                    key={row.id}
                                    onClick={() => toggleSelect(row.id)}
                                    className={`
                                        cursor-pointer transition-colors border-b border-blue-500/10
                                        ${isSelected ? 'bg-[#007acc]/60' : 'hover:bg-blue-500/10'}
                                        ${idx % 2 === 1 && !isSelected ? 'bg-[#13284c]/40' : ''}
                                    `}
                                >
                                    {isMultiSelect && (
                                        <td className="p-3 text-center border-r border-blue-500/5 border-b border-blue-500/10">
                                            <input 
                                                type="checkbox" 
                                                className="accent-blue-500"
                                                checked={isSelected}
                                                onChange={() => {}} // Handled by tr onClick
                                            />
                                        </td>
                                    )}
                                    <td className="p-3 text-white border-r border-blue-500/5 border-b border-blue-500/10">{row.customerName}</td>
                                    <td className="p-3 text-blue-300 border-r border-blue-500/5 border-b border-blue-500/10">{row.customerCode}</td>
                                    {filters.businessCategory === '企宽' ? (
                                        <>
                                            <td className="p-3 text-blue-200 border-r border-blue-500/5 border-b border-blue-500/10">{row.broadbandType || '-'}</td>
                                            <td className="p-3 text-blue-200 border-r border-blue-500/5 border-b border-blue-500/10">{row.broadbandAccount || '无账号'}</td>
                                            <td className="p-3 text-white border-r border-blue-500/5 border-b border-blue-500/10">{row.cityA}</td>
                                            <td className="p-3 text-white border-r border-blue-500/5 border-b border-blue-500/10">{row.districtA}</td>
                                            <td className="p-3 text-gray-300 border-b border-blue-500/10" title={row.addressA}>{row.addressA}</td>
                                        </>
                                    ) : (isImportantBusinessMode || showAssuranceLevel) ? (
                                        <>
                                            <td className="p-3 text-blue-200 border-r border-blue-500/5 border-b border-blue-500/10">{row.serviceType}</td>
                                            <td className="p-3 font-mono text-neon-blue border-r border-blue-500/5 border-b border-blue-500/10">{row.productInstance}</td>
                                            <td className="p-3 text-white border-r border-blue-500/5 border-b border-blue-500/10">{row.circuitCode}</td>
                                            <td className="p-3 text-center border-r border-blue-500/5 border-b border-blue-500/10">
                                                <span className={`px-2 py-0.5 rounded text-[10px] ${
                                                    (row.aAssuranceLevel || row.assuranceLevel) === 'AAA' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                    (row.aAssuranceLevel || row.assuranceLevel) === 'AA' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                                    (row.aAssuranceLevel || row.assuranceLevel) === 'A' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                    'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                                }`}>
                                                    {row.aAssuranceLevel || row.assuranceLevel}
                                                </span>
                                            </td>
                                            <td className="p-3 text-white border-r border-blue-500/5 border-b border-blue-500/10">{row.cityA}</td>
                                            <td className="p-3 text-gray-300 border-r border-blue-500/5 border-b border-blue-500/10" title={row.addressA}>{row.addressA}</td>
                                            <td className="p-3 text-center border-r border-blue-500/5 border-b border-blue-500/10">
                                                <span className={`px-2 py-0.5 rounded text-[10px] ${
                                                    (row.zAssuranceLevel || row.assuranceLevel) === 'AAA' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                    (row.zAssuranceLevel || row.assuranceLevel) === 'AA' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                                    (row.zAssuranceLevel || row.assuranceLevel) === 'A' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                    'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                                }`}>
                                                    {row.zAssuranceLevel || row.assuranceLevel}
                                                </span>
                                            </td>
                                            <td className="p-3 text-white border-r border-blue-500/5 border-b border-blue-500/10">{row.serviceType === '数据专线' ? row.cityZ : '-'}</td>
                                            <td className="p-3 text-gray-300 border-b border-blue-500/10" title={row.serviceType === '数据专线' ? row.addressZ : ''}>{row.serviceType === '数据专线' ? row.addressZ : '-'}</td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="p-3 text-blue-200 border-r border-blue-500/5 border-b border-blue-500/10">{row.serviceType}</td>
                                            <td className="p-3 font-mono text-neon-blue border-r border-blue-500/5 border-b border-blue-500/10">{row.productInstance}</td>
                                            <td className="p-3 text-white border-r border-blue-500/5 border-b border-blue-500/10">{row.circuitCode}</td>
                                            <td className="p-3 text-white border-r border-blue-500/5 border-b border-blue-500/10">{row.cityA}</td>
                                            <td className="p-3 text-gray-300 border-r border-blue-500/5 border-b border-blue-500/10" title={row.addressA}>{row.addressA}</td>
                                            <td className="p-3 text-white border-r border-blue-500/5 border-b border-blue-500/10">{row.serviceType === '数据专线' ? row.cityZ : '-'}</td>
                                            <td className="p-3 text-gray-300 border-b border-blue-500/10" title={row.serviceType === '数据专线' ? row.addressZ : ''}>{row.serviceType === '数据专线' ? row.addressZ : '-'}</td>
                                        </>
                                    )}
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={isMultiSelect ? ((filters.businessCategory === '企宽' ? 8 : (isImportantBusinessMode || showAssuranceLevel) ? 12 : 10)) : ((filters.businessCategory === '企宽' ? 7 : (isImportantBusinessMode || showAssuranceLevel) ? 11 : 9))} className="p-8 text-center text-blue-300/60 border-b border-blue-500/10">暂无数据</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Pagination Bar: #0c2242/40 (No top border) */}
        <div className="bg-[#0c2242]/40 shrink-0 h-[40px] flex items-center">
             <div className="w-full px-4">
                 <Pagination 
                     currentPage={pagination.currentPage}
                     pageSize={pagination.pageSize}
                     totalItems={filteredData.length}
                     onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
                     onPageSizeChange={(size) => setPagination(prev => ({ ...prev, pageSize: size, currentPage: 1 }))}
                     className="py-0 px-0 w-full"
                 />
             </div>
        </div>

        {/* Action Bar (Footer): #0c2242/70 */}
        <div className="flex items-center justify-end gap-3 px-6 py-2 bg-[#0c2242]/70 border-t border-blue-500/30 shrink-0">
            <span className="text-xs text-blue-300 mr-auto">
                {isMultiSelect 
                    ? (selectedIds.size > 0 ? `已选择 ${selectedIds.size} 条记录` : '请点击列表复选框选择记录')
                    : (selectedId ? '已选择 1 条记录' : '请点击列表选择一条记录')
                }
            </span>
            <StyledButton variant="secondary" onClick={onClose}>
                取消
            </StyledButton>
            <StyledButton 
                variant="primary" 
                onClick={handleConfirm} 
                disabled={isMultiSelect ? selectedIds.size === 0 : !selectedId} 
                className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
                确认选择
            </StyledButton>
        </div>
      </div>
    </div>
  );
};
