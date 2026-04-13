import React, { useState, useRef } from 'react';
import { StyledInput, StyledButton, StyledSelect } from './UI';
import { SearchIcon, PlusIcon, EditIcon, TrashIcon, XIcon, DownloadIcon, CloudUploadIcon, RefreshCwIcon } from './Icons';
import { INNER_MONGOLIA_CITIES } from '../constants';
import { Pagination } from './Pagination';

interface Personnel {
    id: string;
    name: string;
    phone: string;
    city: string;
    businessCategory: '专线' | '企宽';
}

const MOCK_PERSONNEL: Personnel[] = [
    { id: '1', name: '张三', phone: '13800138000', city: '呼和浩特', businessCategory: '专线' },
    { id: '2', name: '李四', phone: '13900139000', city: '包头', businessCategory: '企宽' },
];

export const CustomerResponsePersonnelView: React.FC = () => {
    const [personnelList, setPersonnelList] = useState<Personnel[]>(MOCK_PERSONNEL);
    const [keyword, setKeyword] = useState('');
    const [city, setCity] = useState('');
    const [businessCategory, setBusinessCategory] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', phone: '', city: '', businessCategory: '专线' as '专线' | '企宽' });
    const [deletingIds, setDeletingIds] = useState<string[] | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredList = personnelList.filter(p => {
        const matchKeyword = !keyword || p.name.includes(keyword) || p.phone.includes(keyword);
        const matchCity = !city || p.city === city;
        const matchBusinessCategory = !businessCategory || p.businessCategory === businessCategory;
        return matchKeyword && matchCity && matchBusinessCategory;
    });

    const totalItems = filteredList.length;
    const paginatedList = filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleSearchChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
        setter(value);
        setCurrentPage(1);
    };

    const handleDownloadTemplate = () => {
        const csvContent = "姓名,电话,地市\n张三,13800138000,呼和浩特\n";
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', '客响人员导入模版.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const newSelected = new Set(selectedIds);
            paginatedList.forEach(item => newSelected.add(item.id));
            setSelectedIds(newSelected);
        } else {
            const newSelected = new Set(selectedIds);
            paginatedList.forEach(item => newSelected.delete(item.id));
            setSelectedIds(newSelected);
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedIds);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedIds(newSelected);
    };

    const isAllSelected = paginatedList.length > 0 && paginatedList.every(item => selectedIds.has(item.id));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result as string;
                const lines = text.split('\n').filter(line => line.trim());
                const newPersonnel: Personnel[] = [];
                for (let i = 1; i < lines.length; i++) {
                    const parts = lines[i].split(',').map(s => s.trim());
                    if (parts.length >= 3) {
                        newPersonnel.push({
                            id: Math.random().toString(),
                            name: parts[0],
                            phone: parts[1],
                            city: parts[2],
                            businessCategory: (parts[3] as any) || '专线'
                        });
                    }
                }
                if (newPersonnel.length > 0) {
                    setPersonnelList(prev => [...prev, ...newPersonnel]);
                    showToast(`成功导入 ${newPersonnel.length} 条数据`);
                } else {
                    showToast('未找到有效数据，请检查文件格式');
                }
            } catch (error) {
                showToast('导入失败，请检查文件格式');
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    const handleAdd = () => {
        setEditingId(null);
        setFormData({ name: '', phone: '', city: '', businessCategory: '专线' });
        setIsModalOpen(true);
    };

    const handleEdit = (p: Personnel) => {
        setEditingId(p.id);
        setFormData({ name: p.name, phone: p.phone, city: p.city, businessCategory: p.businessCategory });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setDeletingIds([id]);
    };

    const handleBatchDeleteClick = () => {
        if (selectedIds.size === 0) return;
        setDeletingIds(Array.from(selectedIds));
    };

    const handleConfirmDelete = () => {
        if (deletingIds) {
            setPersonnelList(prev => prev.filter(p => !deletingIds.includes(p.id)));
            setDeletingIds(null);
            setSelectedIds(new Set());
        }
    };

    const handleCancelDelete = () => {
        setDeletingIds(null);
    };

    const handleSave = () => {
        if (!formData.name || !formData.phone || !formData.city || !formData.businessCategory) {
            showToast('请填写完整信息');
            return;
        }
        if (editingId) {
            setPersonnelList(prev => prev.map(p => p.id === editingId ? { ...p, ...formData } : p));
        } else {
            setPersonnelList(prev => [...prev, { id: Math.random().toString(), ...formData }]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="relative flex-1 flex flex-col h-full overflow-hidden bg-transparent border border-blue-500/30 shadow-[inset_0_0_20px_rgba(0,133,208,0.1)]">
            <div className="bg-transparent p-3 border-b border-blue-500/20 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-300">业务分类:</span>
                        <StyledSelect 
                            className="w-32"
                            value={businessCategory}
                            onChange={(e) => handleSearchChange(setBusinessCategory, e.target.value)}
                        >
                            <option value="">全部</option>
                            <option value="专线">专线</option>
                            <option value="企宽">企宽</option>
                        </StyledSelect>
                    </div>
                    <StyledInput 
                        placeholder="姓名/电话" 
                        className="w-64" 
                        value={keyword}
                        onChange={(e) => handleSearchChange(setKeyword, e.target.value)}
                    />
                    <StyledSelect 
                        className="w-32"
                        value={city}
                        onChange={(e) => handleSearchChange(setCity, e.target.value)}
                    >
                        <option value="">全部地市</option>
                        {INNER_MONGOLIA_CITIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                    </StyledSelect>
                    <StyledButton variant="toolbar" icon={<SearchIcon />}>查询</StyledButton>
                    <StyledButton 
                        variant="secondary" 
                        icon={<RefreshCwIcon />}
                        onClick={() => {
                            setKeyword('');
                            setCity('');
                            setBusinessCategory('');
                            setCurrentPage(1);
                        }}
                    >
                        重置
                    </StyledButton>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-transparent scrollbar-thin">
                <table className="w-full text-left text-sm whitespace-nowrap border-separate border-spacing-0">
                    <thead className="sticky top-0 bg-[#0c2242] text-white z-10 shadow-sm">
                        <tr>
                            <th className="p-3 font-semibold border-b border-blue-500/40 w-10">
                                <input 
                                    type="checkbox" 
                                    className="accent-blue-500" 
                                    checked={isAllSelected}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th className="p-3 font-semibold border-b border-blue-500/40">姓名</th>
                            <th className="p-3 font-semibold border-b border-blue-500/40">电话</th>
                            <th className="p-3 font-semibold border-b border-blue-500/40">业务分类</th>
                            <th className="p-3 font-semibold border-b border-blue-500/40">地市</th>
                            <th className="p-3 font-semibold border-b border-blue-500/40 text-center w-32">操作</th>
                        </tr>
                    </thead>
                    <tbody className="text-white">
                        {paginatedList.length > 0 ? paginatedList.map(p => (
                            <tr key={p.id} className="hover:bg-blue-600/10 transition-colors border-b border-blue-500/10">
                                <td className="p-3 border-b border-blue-500/10">
                                    <input 
                                        type="checkbox" 
                                        className="accent-blue-500" 
                                        checked={selectedIds.has(p.id)}
                                        onChange={(e) => handleSelectRow(p.id, e.target.checked)}
                                    />
                                </td>
                                <td className="p-3 border-b border-blue-500/10">{p.name}</td>
                                <td className="p-3 border-b border-blue-500/10 font-mono">{p.phone}</td>
                                <td className="p-3 border-b border-blue-500/10">{p.businessCategory}</td>
                                <td className="p-3 border-b border-blue-500/10">{p.city}</td>
                                <td className="p-3 border-b border-blue-500/10 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => handleEdit(p)} className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors" title="编辑">
                                            <EditIcon />
                                        </button>
                                        <button onClick={() => handleDeleteClick(p.id)} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors" title="删除">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-blue-300/50 border-b border-blue-500/10">暂无数据</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="h-10 bg-transparent border-t border-blue-500/20 flex items-center justify-between px-3 shrink-0">
                <div className="flex items-center gap-2">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".csv" 
                        className="hidden" 
                    />
                    <StyledButton variant="secondary" className="h-7" icon={<DownloadIcon className="w-3.5 h-3.5" />} onClick={handleDownloadTemplate}>导入模版</StyledButton>
                    <StyledButton variant="secondary" className="h-7" icon={<CloudUploadIcon className="w-3.5 h-3.5" />} onClick={handleImportClick}>导入</StyledButton>
                    <StyledButton variant="secondary" className="h-7" onClick={() => alert('导出成功')} icon={<DownloadIcon className="w-3.5 h-3.5" />}>
                        导出
                    </StyledButton>
                    
                    <div className="w-px h-4 bg-blue-500/20 mx-1"></div>
                    
                    <StyledButton variant="primary" className="h-7" icon={<PlusIcon className="w-3.5 h-3.5" />} onClick={handleAdd}>新增人员</StyledButton>
                    <StyledButton 
                        variant="danger" 
                        className="h-7"
                        icon={<TrashIcon className="w-3 h-3" />} 
                        onClick={handleBatchDeleteClick}
                        disabled={selectedIds.size === 0}
                    >
                        删除 {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
                    </StyledButton>
                </div>
                <Pagination 
                    currentPage={currentPage}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                    className="py-0 px-0"
                />
            </div>

            {isModalOpen && (
                <div className="absolute inset-0 z-[50] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#0b1730] border border-blue-500/30 p-6 w-[400px] shadow-[0_0_30px_rgba(0,210,255,0.2)]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">
                                {editingId ? '编辑客响人员' : '新增客响人员'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-blue-300 mb-1">姓名 <span className="text-red-500">*</span></label>
                                <StyledInput 
                                    className="w-full"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="请输入姓名"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-blue-300 mb-1">联系电话 <span className="text-red-500">*</span></label>
                                <StyledInput 
                                    className="w-full"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    placeholder="请输入联系电话"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-blue-300 mb-1">业务分类 <span className="text-red-500">*</span></label>
                                <StyledSelect 
                                    className="w-full"
                                    value={formData.businessCategory}
                                    onChange={(e) => setFormData({...formData, businessCategory: e.target.value as any})}
                                >
                                    <option value="专线">专线</option>
                                    <option value="企宽">企宽</option>
                                </StyledSelect>
                            </div>
                            <div>
                                <label className="block text-xs text-blue-300 mb-1">地市 <span className="text-red-500">*</span></label>
                                <StyledSelect 
                                    className="w-full"
                                    value={formData.city}
                                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                                >
                                    <option value="">请选择地市</option>
                                    {INNER_MONGOLIA_CITIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                                </StyledSelect>
                            </div>
                            
                            <div className="pt-4 flex justify-end gap-3">
                                <StyledButton variant="secondary" onClick={() => setIsModalOpen(false)}>取消</StyledButton>
                                <StyledButton variant="primary" onClick={handleSave}>保存</StyledButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deletingIds && (
                <div className="absolute inset-0 z-[50] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#0b1730] border border-blue-500/30 p-6 w-[320px] shadow-[0_0_30px_rgba(0,210,255,0.2)]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">确认删除</h3>
                            <button onClick={handleCancelDelete} className="text-gray-400 hover:text-white">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-blue-200 text-sm mb-6">确定要删除选中的 <span className="text-red-400 font-bold">{deletingIds.length}</span> 条客响人员记录吗？此操作不可恢复。</p>
                        <div className="flex justify-end gap-3">
                            <StyledButton variant="secondary" onClick={handleCancelDelete}>取消</StyledButton>
                            <StyledButton variant="primary" onClick={handleConfirmDelete} className="!bg-red-500/20 !text-red-400 !border-red-500/50 hover:!bg-red-500/40">确定删除</StyledButton>
                        </div>
                    </div>
                </div>
            )}

            {toastMessage && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[300] bg-blue-500 text-white px-6 py-3 rounded shadow-lg flex items-center gap-2 transition-all">
                    <span>{toastMessage}</span>
                </div>
            )}
        </div>
    );
};
