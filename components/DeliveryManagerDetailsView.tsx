import React, { useState, useMemo } from 'react';
import { INNER_MONGOLIA_CITIES } from '../constants';
import { Pagination } from './Pagination';
import { SearchIcon, RefreshCwIcon, DownloadIcon, InfoIcon } from './Icons';
import { StyledInput, StyledSelect, StyledButton } from './UI';

const Th = ({ children, className = "", ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={`p-3 font-semibold border-b border-blue-500/30 whitespace-nowrap text-sm bg-[#0c2242] text-blue-200 ${className}`} {...props}>
    {children}
  </th>
);

const generateDeliveryManagerData = () => {
    const names = ['陈明', '林静', '周杰', '吴芳', '郑强', '孙华', '李雷', '韩梅梅', '张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];
    const teams = ['交付一班', '交付二班', '交付三班', '交付四班'];
    const months = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'];
    const districtsMap: Record<string, string[]> = {
        '呼和浩特市': ['新城区', '回民区', '玉泉区', '赛罕区', '土默特左旗', '托克托县', '和林格尔县', '清水河县', '武川县'],
        '包头市': ['昆都仑区', '东河区', '青山区', '石拐区', '白云鄂博矿区', '九原区', '土默特右旗', '固阳县', '达尔罕茂明安联合旗'],
        '乌海市': ['海勃湾区', '海南区', '乌达区'],
        '赤峰市': ['红山区', '元宝山区', '松山区', '阿鲁科尔沁旗', '巴林左旗', '巴林右旗', '林西县', '克什克腾旗', '翁牛特旗', '喀喇沁旗', '宁城县', '敖汉旗'],
        '通辽市': ['科尔沁区', '科尔沁左翼中旗', '科尔沁左翼后旗', '开鲁县', '库伦旗', '奈曼旗', '扎鲁特旗', '霍林郭勒市'],
        '鄂尔多斯市': ['东胜区', '康巴什区', '达拉特旗', '准格尔旗', '鄂托克前旗', '鄂托克旗', '杭锦旗', '乌审旗', '伊金霍洛旗'],
        '呼伦贝尔市': ['海拉尔区', '扎赉诺尔区', '阿荣旗', '莫力达瓦达斡尔族自治旗', '鄂伦春自治旗', '鄂温克族自治旗', '陈巴尔虎旗', '新巴尔虎左旗', '新巴尔虎右旗', '满洲里市', '牙克石市', '扎兰屯市', '额尔古纳市', '根河市'],
        '巴彦淖尔市': ['临河区', '五原县', '磴口县', '乌拉特前旗', '乌拉特中旗', '乌拉特后旗', '杭锦后旗'],
        '乌兰察布市': ['集宁区', '卓资县', '化德县', '商都县', '兴和县', '凉城县', '察哈尔右翼前旗', '察哈尔右翼中旗', '察哈尔右翼后旗', '四子王旗', '丰镇市'],
        '兴安盟': ['乌兰浩特市', '阿尔山市', '科尔沁右翼前旗', '科尔沁右翼中旗', '扎赉特旗', '突泉县'],
        '锡林郭勒盟': ['锡林浩特市', '二连浩特市', '阿巴嘎旗', '苏尼特左旗', '苏尼特右旗', '东乌珠穆沁旗', '西乌珠穆沁旗', '太仆寺旗', '镶黄旗', '正镶白旗', '正蓝旗', '多伦县'],
        '阿拉善盟': ['阿拉善左旗', '阿拉善右旗', '额济纳旗']
    };

    const data = [];
    for (let i = 0; i < 150; i++) {
        const city = INNER_MONGOLIA_CITIES[Math.floor(Math.random() * INNER_MONGOLIA_CITIES.length)].name;
        const districts = districtsMap[city] || ['市辖区'];
        const district = districts[Math.floor(Math.random() * districts.length)];
        
        data.push({
            id: i,
            month: months[Math.floor(Math.random() * months.length)],
            name: names[i % names.length] + (Math.floor(i / names.length) > 0 ? Math.floor(i / names.length) : ''),
            team: teams[i % teams.length],
            city: city,
            district: district,
            score: Math.floor(Math.random() * 15) + 85,
            openingRate: (Math.random() * 5 + 95).toFixed(1) + '%',
            evaluation: (Math.random() * 5 + 90).toFixed(1) + '%',
            delivery: Math.floor(Math.random() * 50) + 100,
            dispatchRate: (Math.random() * 5 + 95).toFixed(1) + '%',
            completionRate: (Math.random() * 5 + 90).toFixed(1) + '%',
            acceptanceRate: (Math.random() * 5 + 92).toFixed(1) + '%',
        });
    }
    return data.sort((a, b) => b.score - a.score);
};

const allDeliveryManagerData = generateDeliveryManagerData();

export const DeliveryManagerDetailsView: React.FC = () => {
    const [searchMonth, setSearchMonth] = useState<string>('');
    const [searchCity, setSearchCity] = useState<string>('');
    const [searchDistrict, setSearchDistrict] = useState<string>('');
    const [searchTeam, setSearchTeam] = useState<string>('');
    const [searchName, setSearchName] = useState<string>('');
    
    const months = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'];
    const teams = ['交付一班', '交付二班', '交付三班', '交付四班'];

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>('desc');

    const districtsMap: Record<string, string[]> = {
        '呼和浩特市': ['新城区', '回民区', '玉泉区', '赛罕区', '土默特左旗', '托克托县', '和林格尔县', '清水河县', '武川县'],
        '包头市': ['昆都仑区', '东河区', '青山区', '石拐区', '白云鄂博矿区', '九原区', '土默特右旗', '固阳县', '达尔罕茂明安联合旗'],
        '乌海市': ['海勃湾区', '海南区', '乌达区'],
        '赤峰市': ['红山区', '元宝山区', '松山区', '阿鲁科尔沁旗', '巴林左旗', '巴林右旗', '林西县', '克什克腾旗', '翁牛特旗', '喀喇沁旗', '宁城县', '敖汉旗'],
        '通辽市': ['科尔沁区', '科尔沁左翼中旗', '科尔沁左翼后旗', '开鲁县', '库伦旗', '奈曼旗', '扎鲁特旗', '霍林郭勒市'],
        '鄂尔多斯市': ['东胜区', '康巴什区', '达拉特旗', '准格尔旗', '鄂托克前旗', '鄂托克旗', '杭锦旗', '乌审旗', '伊金霍洛旗'],
        '呼伦贝尔市': ['海拉尔区', '扎赉诺尔区', '阿荣旗', '莫力达瓦达斡尔族自治旗', '鄂伦春自治旗', '鄂温克族自治旗', '陈巴尔虎旗', '新巴尔虎左旗', '新巴尔虎右旗', '满洲里市', '牙克石市', '扎兰屯市', '额尔古纳市', '根河市'],
        '巴彦淖尔市': ['临河区', '五原县', '磴口县', '乌拉特前旗', '乌拉特中旗', '乌拉特后旗', '杭锦后旗'],
        '乌兰察布市': ['集宁区', '卓资县', '化德县', '商都县', '兴和县', '凉城县', '察哈尔右翼前旗', '察哈尔右翼中旗', '察哈尔右翼后旗', '四子王旗', '丰镇市'],
        '兴安盟': ['乌兰浩特市', '阿尔山市', '科尔沁右翼前旗', '科尔沁右翼中旗', '扎赉特旗', '突泉县'],
        '锡林郭勒盟': ['锡林浩特市', '二连浩特市', '阿巴嘎旗', '苏尼特左旗', '苏尼特右旗', '东乌珠穆沁旗', '西乌珠穆沁旗', '太仆寺旗', '镶黄旗', '正镶白旗', '正蓝旗', '多伦县'],
        '阿拉善盟': ['阿拉善左旗', '阿拉善右旗', '额济纳旗']
    };

    const availableDistricts = searchCity ? (districtsMap[searchCity] || []) : [];

    const filteredData = useMemo(() => {
        return allDeliveryManagerData.filter(item => {
            if (searchMonth && item.month !== searchMonth) return false;
            if (searchCity && item.city !== searchCity) return false;
            if (searchDistrict && item.district !== searchDistrict) return false;
            if (searchTeam && item.team !== searchTeam) return false;
            if (searchName && !item.name.includes(searchName)) return false;
            return true;
        });
    }, [searchMonth, searchCity, searchDistrict, searchTeam, searchName]);

    const sortedData = useMemo(() => {
        let result = [...filteredData];
        if (sortOrder === 'asc') result.sort((a, b) => a.score - b.score);
        else if (sortOrder === 'desc') result.sort((a, b) => b.score - a.score);
        return result;
    }, [filteredData, sortOrder]);

    const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleExport = () => {
        const headers = ['画像月份', '姓名', '班组', '地市', '区县', '得分', '开通及时率', '用后即评', '交付量', '分派及时率', '报结及时率', '受理及时率'];
        const csvContent = [
            headers.join(','),
            ...filteredData.map(row => 
                [row.month, row.name, row.team, row.city, row.district, row.score, row.openingRate, row.evaluation, row.delivery, row.dispatchRate, row.completionRate, row.acceptanceRate].join(',')
            )
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `交付经理画像明细_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="relative flex-1 flex flex-col h-full overflow-hidden bg-transparent border border-blue-500/30 shadow-[inset_0_0_20px_rgba(0,133,208,0.1)] text-white">
            <div className="bg-transparent p-3 border-b border-blue-500/20 flex flex-wrap items-center justify-between gap-y-3 gap-x-6 shrink-0">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-blue-300 text-sm whitespace-nowrap">画像月份:</span>
                        <StyledSelect className="w-32" value={searchMonth} onChange={e => { setSearchMonth(e.target.value); setCurrentPage(1); }}>
                            <option value="">全部</option>
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </StyledSelect>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-blue-300 text-sm whitespace-nowrap">地市:</span>
                        <StyledSelect className="w-32" value={searchCity} onChange={e => { setSearchCity(e.target.value); setSearchDistrict(''); setCurrentPage(1); }}>
                            <option value="">全部</option>
                            {INNER_MONGOLIA_CITIES.map(city => <option key={city.name} value={city.name}>{city.name}</option>)}
                        </StyledSelect>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-blue-300 text-sm whitespace-nowrap">区县:</span>
                        <StyledSelect className="w-32" value={searchDistrict} onChange={e => { setSearchDistrict(e.target.value); setCurrentPage(1); }} disabled={!searchCity}>
                            <option value="">全部</option>
                            {availableDistricts.map(district => <option key={district} value={district}>{district}</option>)}
                        </StyledSelect>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-blue-300 text-sm whitespace-nowrap">班组:</span>
                        <StyledSelect className="w-32" value={searchTeam} onChange={e => { setSearchTeam(e.target.value); setCurrentPage(1); }}>
                            <option value="">全部</option>
                            {teams.map(t => <option key={t} value={t}>{t}</option>)}
                        </StyledSelect>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-blue-300 text-sm whitespace-nowrap">姓名:</span>
                        <StyledInput type="text" placeholder="请输入姓名" className="w-40" value={searchName} onChange={e => { setSearchName(e.target.value); setCurrentPage(1); }} />
                    </div>
                    <div className="flex items-center gap-3">
                        <StyledButton variant="primary" onClick={() => setCurrentPage(1)} icon={<SearchIcon className="w-3.5 h-3.5" />}>查询</StyledButton>
                        <StyledButton variant="outline" onClick={() => { setSearchMonth(''); setSearchCity(''); setSearchDistrict(''); setSearchTeam(''); setSearchName(''); setCurrentPage(1); }} icon={<RefreshCwIcon className="w-3.5 h-3.5" />}>重置</StyledButton>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar min-h-0 relative">
                <table className="w-full text-left text-sm text-blue-100 whitespace-nowrap border-separate border-spacing-0">
                    <thead className="sticky top-0 bg-[#0c2242] text-blue-200 z-10 shadow-sm">
                        <tr>
                            <Th>画像月份</Th>
                            <Th>姓名</Th>
                            <Th>地市</Th>
                            <Th>区县</Th>
                            <Th>班组</Th>
                            <Th className="cursor-pointer hover:bg-blue-500/10 transition-colors" onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}>
                                <div className="flex items-center gap-1">得分<div className="flex flex-col"><span className={`text-[8px] leading-[4px] ${sortOrder === 'asc' ? 'text-neon-blue' : 'text-gray-500'}`}>▲</span><span className={`text-[8px] leading-[4px] ${sortOrder === 'desc' ? 'text-neon-blue' : 'text-gray-500'}`}>▼</span></div></div>
                            </Th>
                            <Th>开通及时率</Th>
                            <Th>
                                <div className="flex items-center gap-1">
                                    用后即评
                                    <div className="relative group/info">
                                        <InfoIcon className="w-3 h-3 text-blue-400 cursor-help hover:text-neon-blue transition-colors" />
                                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 p-3 bg-[#0b1730] border border-blue-500/40 rounded shadow-[0_0_20px_rgba(0,210,255,0.3)] z-[100] opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-300 pointer-events-none whitespace-normal text-left">
                                            <p className="text-white font-bold mb-1 border-b border-blue-500/20 pb-1">用后即评打分细则</p>
                                            <div className="space-y-1.5 text-[10px] text-blue-100 leading-relaxed font-normal">
                                                <p><span className="text-neon-blue">●</span> 100%满意得满分 (20分)</p>
                                                <p><span className="text-neon-blue">●</span> [95%, 100%) 区间：每低1%扣1分</p>
                                                <p><span className="text-neon-blue">●</span> [90%, 95%) 区间：每低1%扣2分</p>
                                                <p><span className="text-neon-blue">●</span> 低于90%计0分</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Th>
                            <Th>交付量</Th>
                            <Th>分派及时率</Th>
                            <Th>报结及时率</Th>
                            <Th>受理及时率</Th>
                        </tr>
                    </thead>
                    <tbody className="text-blue-100 text-sm">
                        {paginatedData.length > 0 ? paginatedData.map((row, idx) => (
                            <tr key={row.id} className={`hover:bg-[#1e3a5f]/40 transition-colors border-b border-blue-500/10 whitespace-nowrap ${idx % 2 === 1 ? 'bg-[#0c2242]/30' : ''}`}>
                                <td className="p-3 border-b border-blue-500/10">{row.month}</td>
                                <td className="p-3 border-b border-blue-500/10">{row.name}</td>
                                <td className="p-3 border-b border-blue-500/10">{row.city}</td>
                                <td className="p-3 border-b border-blue-500/10">{row.district}</td>
                                <td className="p-3 border-b border-blue-500/10">{row.team}</td>
                                <td className="p-3 border-b border-blue-500/10 text-neon-blue font-bold">{row.score}</td>
                                <td className="p-3 border-b border-blue-500/10">{row.openingRate}</td>
                                <td className="p-3 border-b border-blue-500/10">{row.evaluation}</td>
                                <td className="p-3 border-b border-blue-500/10">{row.delivery}</td>
                                <td className="p-3 border-b border-blue-500/10">{row.dispatchRate}</td>
                                <td className="p-3 border-b border-blue-500/10">{row.completionRate}</td>
                                <td className="p-3 border-b border-blue-500/10">{row.acceptanceRate}</td>
                            </tr>
                        )) : <tr><td colSpan={12} className="p-8 text-center text-blue-300/50 border-b border-blue-500/10">暂无数据</td></tr>}
                    </tbody>
                </table>
            </div>

            <div className="h-10 bg-transparent border-t border-blue-500/20 flex items-center justify-between px-3 shrink-0">
                <div className="flex items-center">
                    <StyledButton variant="secondary" onClick={handleExport} className="h-7" icon={<DownloadIcon className="w-3.5 h-3.5" />}>导出</StyledButton>
                </div>
                <Pagination currentPage={currentPage} totalItems={sortedData.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }} className="py-0 px-0" />
            </div>
        </div>
    );
};
