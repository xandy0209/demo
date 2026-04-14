
/**
 * SYSTEM INSTRUCTIONS (Fixed into code for AI Assistant reference)
 * 
 * Role:
 * You are an expert Senior Frontend Engineer and Product Manager specializing in the "China Mobile Enterprise Business Operations Support System" (26NM Project). Your goal is to generate React components, logic, and mock data that strictly adhere to the existing application's visual style, code structure, and business context.
 * 
 * 1. Technology Stack & Environment
 * Framework: React 19 + TypeScript + Vite.
 * Styling: Tailwind CSS (Inline classes only, no external .css files except base setup).
 * Icons: Use inline SVGs or assume availability of Icons.tsx (pattern: <IconName />).
 * Data: Local Mock Data (no backend calls, simulate async operations with setTimeout).
 * 
 * 2. Visual Design System (Strict Adherence)
 * You must apply the following "Cyberpunk/Enterprise Dashboard" aesthetic to all new UI:
 * Color Palette:
 * Backgrounds: Deep Space Blue (bg-[#020617], bg-[#0b1730], bg-[#0c2242]).
 * Panels/Containers: Translucent Dark Blue (bg-[#094F8B]/[0.03], bg-[#1e293b]/50).
 * Borders: Subtle Cyan/Blue (border-blue-500/30, border-blue-500/20).
 * Text: High Contrast White (text-white), Primary Blue (text-blue-100), Muted Blue (text-blue-300), Label Gray (text-gray-400).
 * Accents: Neon Blue for active states/highlights (text-neon-blue, #00d2ff), Glow effects (shadow-[0_0_15px_rgba(0,210,255,0.2)]).
 * Typography: Sans-serif, compact, professional. Use text-xs or text-sm for data tables and forms.
 * Effects:
 * Glassmorphism: backdrop-blur-md.
 * Gradients: bg-gradient-to-r from-cyan-500 to-blue-500 (for primary buttons/toggles).
 * Scrollbars: Custom hidden or thin scrollbars.
 * 
 * 3. Component Library Usage
 * Do not use standard HTML tags for inputs/buttons. You MUST use the existing custom components:
 * Inputs: <StyledInput className="..." /> (from ./components/UI).
 * Selects: <StyledSelect className="..." /> (from ./components/UI).
 * Buttons: <StyledButton variant="primary|secondary|outline|toolbar" /> (from ./components/UI).
 * Modals: Use fixed position overlays with z-50, bg-black/60 backdrop, and centered content box with border border-blue-500/30.
 * 
 * 4. Layout & Structure Patterns
 * Container: All page views must be flex h-full flex-col overflow-hidden to fit within the App.tsx tab content area.
 * Headers: Use h-[40px] or h-[50px] toolbars/filter bars with border-b border-blue-500/20.
 * Tables:
 * Headers: sticky top-0, bg-[#0c2242], text-blue-200.
 * Rows: Hover effects hover:bg-[#1e3a5f]/60.
 * Cells: whitespace-nowrap, text-xs.
 * Notifications: Use the custom NotificationToast pattern (absolute positioned top-center).
 * 
 * 5. File Structure & Modularity (CRITICAL RULE)
 * To prevent regression and code conflicts:
 * Strict File Isolation: Every new page, feature tab, or complex module MUST be created as a standalone file (e.g., components/ResourceManageView.tsx).
 * No Inline Expansion: Do NOT write complex view logic directly inside App.tsx.
 * Non-Destructive Integration: When adding a new feature, you should only modify App.tsx to:
 * Import the new component.
 * Add a new entry to TABS_CONFIG or the render switch statement.
 * Preservation: Do not modify existing component files (like WorkbenchView.tsx) unless the user explicitly requests changes to that specific feature.
 * 
 * 6. Business Context & Data Simulation
 * Region: Strictly Inner Mongolia (Inner Mongolia).
 * Cities: 呼和浩特 (Hohhot), 包头 (Baotou), 鄂尔多斯 (Ordos), 赤峰 (Chifeng), 通辽 (Tongliao), etc.
 * Business Types: 专线 (Leased Line), 企宽 (Enterprise Broadband).
 * Mock Data: Always generate realistic mock data in useEffect or constants.ts with correct ID formats and Chinese names.
 * 
 * 7. Code Generation Rules
 * Imports: Import types from ../types and UI components from ./UI.
 * State: Use useState for UI state.
 * Responsiveness: Ensure layouts utilize flex-1 to fill available vertical space.
 * Language: All UI text must be in Simplified Chinese.
 */

import { OtnRecord, SpnRecord, InternetRecord, AlarmRecord, IplRecord, MplsRecord, IgplRecord, RouteCityRecord, RouteRecord, SubscriptionRecord, ComplaintRecord, GroupOrderRecord, ImportantBusinessRecord, TerminalInventoryRecord, FaultRuleRecord, FaultEventRecord, FaultSMSConfigRecord, PortraitIndicator, PersonnelPortrait, DeliveryManagerPortrait, TrafficOverlimitAnalysisRecord, TrafficOverlimitDetailRecord, OfflineTerminalAnalysisRecord, OfflineTerminalDetailRecord } from './types';

// Helper to format numbers with commas
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Mock data pools for Circuit Codes
const locations = [
  "通辽市科区新局", "科尔沁新奥燃气", 
  "呼和浩特市移动二枢纽", "新城恒泰证券专", 
  "呼和浩特市", "锡林郭勒盟", 
  "乌海市乌海综合楼", "海勃湾千钢工业园",
  "包头市昆区电信大楼", "东河区铝业工业园",
  "赤峰市红山区政府", "松山区物流园区",
  "鄂尔多斯东胜区", "康巴什新区数据中心"
];

const codeTypes = ["30N", "FE"];
const codeSuffixes = ["KA/P", "KA", "NP/P", "ZA"];

// UPDATE: Strictly Inner Mongolia Cities for system simulation
const cities = [
  '呼和浩特市', '包头市', '乌海市', '赤峰市', '通辽市', 
  '鄂尔多斯市', '呼伦贝尔市', '巴彦淖尔市', '乌兰察布市', 
  '兴安盟', '锡林郭勒盟', '阿拉善盟'
];

export const INNER_MONGOLIA_CITIES = [
  { name: '呼和浩特市', code: '471' },
  { name: '包头市', code: '472' },
  { name: '乌海市', code: '473' },
  { name: '赤峰市', code: '476' },
  { name: '通辽市', code: '475' },
  { name: '鄂尔多斯市', code: '477' },
  { name: '呼伦贝尔市', code: '470' },
  { name: '巴彦淖尔市', code: '478' },
  { name: '乌兰察布市', code: '474' },
  { name: '兴安盟', code: '482' },
  { name: '锡林郭勒盟', code: '479' },
  { name: '阿拉善盟', code: '483' },
];

// Realistic Address Data for Inner Mongolia and common external cities
const ADDRESS_DATA: Record<string, { districts: string[], roads: string[] }> = {
    '呼和浩特市': {
        districts: ['赛罕区', '新城区', '回民区', '玉泉区'],
        roads: ['新华东街', '呼伦贝尔南路', '鄂尔多斯大街', '中山西路', '成吉思汗大街', '大学西路', '锡林郭勒南路', '昭乌达路', '敕勒川大街']
    },
    '包头市': {
        districts: ['昆都仑区', '东河区', '青山区', '九原区'],
        roads: ['钢铁大街', '阿尔丁大街', '巴彦塔拉大街', '建设路', '友谊大街', '富强路', '民族东路', '少先路']
    },
    '鄂尔多斯市': {
        districts: ['东胜区', '康巴什区', '伊金霍洛旗'],
        roads: ['鄂尔多斯西街', '伊金霍洛西街', '天骄路', '那达慕街', '乌兰木街', '准格尔路', '达拉特南路']
    },
    '赤峰市': {
        districts: ['红山区', '松山区', '元宝山区'],
        roads: ['哈达街', '英金路', '昭乌达路', '玉龙大街', '钢铁西街', '桥北新区', '临潢大街']
    },
    '通辽市': {
        districts: ['科尔沁区'],
        roads: ['建国路', '明仁大街', '霍林河大街', '和平路', '交通路', '胜利北路']
    },
    '乌海市': {
        districts: ['海勃湾区', '乌达区', '海南区'],
        roads: ['海拉尔街', '新华大街', '建设路', '滨河大道', '人民路']
    },
    '呼伦贝尔市': {
        districts: ['海拉尔区', '满洲里市'],
        roads: ['满洲里路', '阿里河路', '中央街', '胜利大街', '伊敏大街']
    },
    '巴彦淖尔市': {
        districts: ['临河区'],
        roads: ['胜利北路', '解放街', '新华街', '金川大道', '河套大街']
    },
    '乌兰察布市': {
        districts: ['集宁区'],
        roads: ['恩和路', '怀远大街', '民建大街', '工农路', '察哈尔东街']
    },
    '兴安盟': {
        districts: ['乌兰浩特市'],
        roads: ['兴安北路', '五一北路', '罕山中街']
    },
    '锡林郭勒盟': {
        districts: ['锡林浩特市'],
        roads: ['锡林大街', '南京路', '额尔敦路']
    },
    '阿拉善盟': {
        districts: ['阿拉善左旗'],
        roads: ['额鲁特西路', '土尔扈特南路', '雅布赖路']
    },
};

// Helper to generate common fields
const generateCommonFields = (i: number, type: string) => {
    // 1. Product Instance: 209 + 8 random digits
    const randomSuffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    const productInstance = `209${randomSuffix}`; 
    
    // 2. Circuit Code
    const locA = locations[Math.floor(Math.random() * locations.length)];
    let locZ = locations[Math.floor(Math.random() * locations.length)];
    while (locA === locZ) {
        locZ = locations[Math.floor(Math.random() * locations.length)];
    }
    const codeType = codeTypes[Math.floor(Math.random() * codeTypes.length)];
    const num = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const suffix = codeSuffixes[Math.floor(Math.random() * codeSuffixes.length)];
    const circuitCode = `${locA}-${locZ}${codeType}${num}${suffix}`;

    const cityA = cities[i % cities.length];
    const cityZ = cities[(i + 1) % cities.length];
    const lineName = `${cityA}-${cityZ}-${type}-专线-${i}`;
    
    // Time
    const date = new Date();
    date.setMinutes(date.getMinutes() - Math.floor(Math.random() * 1440));
    const timeStr = date.toISOString().replace('T', ' ').substring(0, 19);

    return { productInstance, circuitCode, lineName, cityA, cityZ, timeStr };
};

// Generate Mock Data for OTN
export const generateMockData = (count: number): OtnRecord[] => {
  const data: OtnRecord[] = [];
  
  for (let i = 0; i < count; i++) {
    const { productInstance, circuitCode, lineName, cityA, cityZ, timeStr } = generateCommonFields(i, 'OTN');

    // Metrics
    const latency = (Math.random() * 50 + 2).toFixed(2);
    const jitter = (Math.random() * 5).toFixed(3);
    const rxLoss = (Math.random() * 0.01).toFixed(4);
    const txLoss = (Math.random() * 0.01).toFixed(4);
    
    // Traffic
    const rxBytes = Math.floor(Math.random() * 10000000000);
    const txBytes = Math.floor(Math.random() * 10000000000);
    const utilRx = (Math.random() * 90).toFixed(2);
    const utilTx = (Math.random() * 90).toFixed(2);

    // NE Info
    const aNe = `${cityA}-OTN-NE-${Math.floor(Math.random() * 100)}`;
    const zNe = `${cityZ}-OTN-NE-${Math.floor(Math.random() * 100)}`;
    const portA = `Port-${Math.floor(Math.random() * 16)}`;
    const portZ = `Port-${Math.floor(Math.random() * 16)}`;
    const slotA = `Slot-${Math.floor(Math.random() * 8)}`;
    const slotZ = `Slot-${Math.floor(Math.random() * 8)}`;

    data.push({
        id: `otn-${i}`,
        productInstance,
        lineName,
        circuitCode,
        latency,
        jitter,
        rxPacketLossRate: rxLoss + '%',
        txPacketLossRate: txLoss + '%',
        rxTotalBytes: formatNumber(rxBytes),
        txTotalBytes: formatNumber(txBytes),
        rxMaxBandwidthUtil: utilRx + '%',
        txMaxBandwidthUtil: utilTx + '%',
        
        aNe,
        aNePort: portA,
        aSlot: slotA,
        aServiceRxPackets: formatNumber(Math.floor(rxBytes / 1500)),
        aServiceRxBytes: formatNumber(rxBytes),
        aServiceRxDrop: Math.floor(Math.random() * 100).toString(),
        aServiceTxPackets: formatNumber(Math.floor(txBytes / 1500)),
        aServiceTxDrop: Math.floor(Math.random() * 100).toString(),
        aPreFecBer: (Math.random() * 1e-6).toExponential(2),
        aPostFecBer: (Math.random() * 1e-12).toExponential(2),
        
        zNe,
        zNePort: portZ,
        zSlot: slotZ,
        zServiceRxPackets: formatNumber(Math.floor(txBytes / 1500)), 
        zServiceRxBytes: formatNumber(txBytes),
        zServiceRxDrop: Math.floor(Math.random() * 100).toString(),
        zServiceTxPackets: formatNumber(Math.floor(rxBytes / 1500)),
        zServiceTxBytes: formatNumber(rxBytes),
        zServiceTxDrop: Math.floor(Math.random() * 100).toString(),
        zPreFecBer: (Math.random() * 1e-6).toExponential(2),
        zPostFecBer: (Math.random() * 1e-12).toExponential(2),
        
        metricTime: timeStr
    });
  }

  return data;
};

// Generate Mock Data for SPN
export const generateSpnMockData = (count: number): SpnRecord[] => {
    const data: SpnRecord[] = [];

    for (let i = 0; i < count; i++) {
        const { productInstance, circuitCode, lineName, cityA, cityZ, timeStr } = generateCommonFields(i, 'SPN');
        
        // General Metrics
        const avgBw = (Math.random() * 60 + 10).toFixed(2);
        const peakBw = (parseFloat(avgBw) + Math.random() * 20).toFixed(2);
        const loss = (Math.random() * 0.005).toFixed(4);
        const lat = (Math.random() * 30 + 1).toFixed(2);
        const jit = (Math.random() * 3).toFixed(3);
        const upAvg = (parseFloat(avgBw) * (0.8 + Math.random() * 0.4)).toFixed(2);
        const downAvg = (parseFloat(avgBw) * (0.8 + Math.random() * 0.4)).toFixed(2);

        // PW Metrics (Simulating slightly different values for A and Z ends)
        const generatePwMetrics = () => {
             const rxB = Math.floor(Math.random() * 5000000000);
             const txB = Math.floor(Math.random() * 5000000000);
             return {
                 rxPkts: formatNumber(Math.floor(rxB / 1200)),
                 rxBytes: formatNumber(rxB),
                 txPkts: formatNumber(Math.floor(txB / 1200)),
                 txBytes: formatNumber(txB),
                 lat: (parseFloat(lat) + Math.random() - 0.5).toFixed(2),
                 jit: (parseFloat(jit) + Math.random() * 0.5).toFixed(3),
                 loss: (Math.random() * 0.001).toFixed(5),
                 utilAvg: (parseFloat(avgBw) + Math.random() * 5 - 2.5).toFixed(2),
                 utilMax: (parseFloat(peakBw) + Math.random() * 5 - 2.5).toFixed(2)
             };
        };

        const aMetrics = generatePwMetrics();
        const zMetrics = generatePwMetrics();

        data.push({
            id: `spn-${i}`,
            productInstance,
            lineName,
            circuitCode,
            avgBandwidthUtil: avgBw + '%',
            peakBandwidthUtil: peakBw + '%',
            packetLossRate: loss + '%',
            latency: lat,
            jitter: jit,
            upAvgBandwidthUtil: upAvg + '%',
            downAvgBandwidthUtil: downAvg + '%',

            aNe: `${cityA}-SPN-Access-${Math.floor(Math.random() * 50)}`,
            aPwRxPackets: aMetrics.rxPkts,
            aPwRxBytes: aMetrics.rxBytes,
            aPwTxPackets: aMetrics.txPkts,
            aPwTxBytes: aMetrics.txBytes,
            aPwLatency: aMetrics.lat,
            aPwJitter: aMetrics.jit,
            aPwLossRate: aMetrics.loss + '%',
            aPwBandwidthUtilAvg: aMetrics.utilAvg + '%',
            aPwBandwidthUtilMax: aMetrics.utilMax + '%',

            zNe: `${cityZ}-SPN-Access-${Math.floor(Math.random() * 50)}`,
            zPwRxPackets: zMetrics.rxPkts,
            zPwRxBytes: zMetrics.rxBytes,
            zPwTxPackets: zMetrics.txPkts,
            zPwTxBytes: zMetrics.txBytes,
            zPwLatency: zMetrics.lat,
            zPwJitter: zMetrics.jit,
            zPwLossRate: zMetrics.loss + '%',
            zPwBandwidthUtilAvg: zMetrics.utilAvg + '%',
            zPwBandwidthUtilMax: zMetrics.utilMax + '%',

            metricTime: timeStr
        });
    }

    return data;
}

// Generate Mock Data for Internet
export const generateInternetMockData = (count: number): InternetRecord[] => {
    const data: InternetRecord[] = [];

    for (let i = 0; i < count; i++) {
        const { productInstance, circuitCode, lineName, timeStr } = generateCommonFields(i, 'Internet');
        
        // Traffic Data
        const upBytes = Math.floor(Math.random() * 50000000000);
        const downBytes = Math.floor(Math.random() * 80000000000); // Typically downlink > uplink
        
        const upRate = (Math.random() * 100 + 10).toFixed(2); // Mbps
        const downRate = (Math.random() * 200 + 20).toFixed(2); // Mbps
        
        const upUtil = (Math.random() * 80).toFixed(2);
        const downUtil = (Math.random() * 90).toFixed(2);
        
        // Quality Metrics
        const lat = (Math.random() * 40 + 5).toFixed(2);
        const jit = (Math.random() * 10).toFixed(3);
        const loss = (Math.random() * 0.1).toFixed(4);

        data.push({
            id: `net-${i}`,
            productInstance,
            lineName,
            circuitCode,
            uplinkBytes: formatNumber(upBytes),
            downlinkBytes: formatNumber(downBytes),
            uplinkAvgRate: upRate + ' Mbps',
            downlinkAvgRate: downRate + ' Mbps',
            uplinkAvgBandwidthUtil: upUtil + '%',
            downlinkAvgBandwidthUtil: downUtil + '%',
            latency: lat,
            jitter: jit,
            avgPacketLossRate: loss + '%',
            metricTime: timeStr
        });
    }

    return data;
}

// Generate Mock Data for Alarm
export const generateAlarmMockData = (count: number): AlarmRecord[] => {
    const data: AlarmRecord[] = [];
    const ownerIds = ['移动侧', '客户侧'];
    const businessTypes = ['国际政企专线', 'MPLS-VPN', '省内数据专线', '互联网专线'];
    const alarmTitles = ['ETH_LOS', 'FIBER_CUT', 'POWER_OFF', 'R_LOS', 'OSC_RDI', 'TEMP_HIGH', 'FAN_FAIL', 'MODULE_OFFLINE'];
    const vendors = ['Huawei', 'ZTE', 'FiberHome', 'Nokia'];
    const customers = ['Tencent', 'Alibaba', 'ByteDance', 'ICBC', 'CMB', 'State Grid'];
    const assuranceLevels = ['Gold', 'Silver', 'Copper', 'Standard', 'Diamond'];
    const clearStatuses = ['已清除', '未清除'];
    const logicCategories = ['传输类', '数据类', '环境类', '设备类'];
    const neTypes = ['PTN', 'OTN', 'SDH', 'Router', 'Switch'];

    for (let i = 0; i < count; i++) {
        const { productInstance, circuitCode, cityA, timeStr } = generateCommonFields(i, 'Alarm');
        
        const ownerId = ownerIds[Math.floor(Math.random() * ownerIds.length)];
        const businessType = businessTypes[Math.floor(Math.random() * businessTypes.length)];
        const neName = `${cityA}-${neTypes[Math.floor(Math.random() * neTypes.length)]}-${Math.floor(Math.random() * 1000)}`;
        const clearStatus = clearStatuses[Math.floor(Math.random() * clearStatuses.length)];
        
        // Date manipulation for event and clear time
        const eventDate = new Date();
        eventDate.setHours(eventDate.getHours() - Math.floor(Math.random() * 48));
        const eventTime = eventDate.toISOString().replace('T', ' ').substring(0, 19);
        
        let clearTime = '';
        if (clearStatus === '已清除') {
             const clearDate = new Date(eventDate);
             clearDate.setMinutes(clearDate.getMinutes() + Math.floor(Math.random() * 120) + 1);
             clearTime = clearDate.toISOString().replace('T', ' ').substring(0, 19);
        }

        data.push({
            id: `alarm-${i}`,
            ownerId: ownerId,
            alarmGlobalId: `ALM-${Math.floor(Math.random() * 1000000000)}`,
            neName: neName,
            neType: neTypes[Math.floor(Math.random() * neTypes.length)],
            alarmObject: `${neName}-Port-${Math.floor(Math.random() * 16)}`,
            alarmObjectName: `GigabitEthernet0/0/${Math.floor(Math.random() * 16)}`,
            alarmObjectType: 'Physical Port',
            eventTime: eventTime,
            clearTime: clearTime,
            alarmTitle: alarmTitles[Math.floor(Math.random() * alarmTitles.length)],
            vendor: vendors[Math.floor(Math.random() * vendors.length)],
            alarmText: `Detected signal loss on interface ${Math.floor(Math.random() * 10)}`,
            clearStatus: clearStatus,
            activeAlarmCount: '1',
            neAlias: `${cityA} Core Site`,
            province: cityA, // Simplifying to map city to province
            alarmRegion: cityA,
            county: `${cityA} District`,
            circuitCode: circuitCode,
            proCategory1: 'Transmission',
            proCategory2: 'Optical',
            logicCategory: logicCategories[Math.floor(Math.random() * logicCategories.length)],
            logicSubCategory: 'Communication Quality',
            engineeringStatus: 'In Service',
            customerName: customers[Math.floor(Math.random() * customers.length)],
            customerCode: `CUST-${Math.floor(Math.random() * 100000)}`,
            productInstance: productInstance,
            serviceAssuranceLevel: assuranceLevels[Math.floor(Math.random() * assuranceLevels.length)],
            businessType: businessType
        });
    }
    return data;
}

// Generate Mock Data for IPL
export const generateIplMockData = (count: number): IplRecord[] => {
    const data: IplRecord[] = [];

    for (let i = 0; i < count; i++) {
        const { productInstance, circuitCode, timeStr } = generateCommonFields(i, 'IPL');
        const latency = (Math.random() * 120 + 20).toFixed(2);
        
        data.push({
            id: `ipl-${i}`,
            productInstance,
            circuitCode,
            latency,
            metricTime: timeStr
        });
    }

    return data;
}

// Generate Mock Data for MPLS
export const generateMplsMockData = (count: number): MplsRecord[] => {
    const data: MplsRecord[] = [];

    for (let i = 0; i < count; i++) {
        const { productInstance, timeStr } = generateCommonFields(i, 'MPLS');
        
        const rxRate = Math.floor(Math.random() * 1000000000); // Up to 1 Gbps
        const txRate = Math.floor(Math.random() * 1000000000); // Up to 1 Gbps

        data.push({
            id: `mpls-${i}`,
            productInstance,
            rxRate: formatNumber(rxRate),
            txRate: formatNumber(txRate),
            metricTime: timeStr
        });
    }

    return data;
}

// Generate Mock Data for IGPL (International Government/Enterprise Private Line)
export const generateIgplMockData = (count: number): IgplRecord[] => {
    const data: IgplRecord[] = [];

    for (let i = 0; i < count; i++) {
        const { productInstance, circuitCode, timeStr } = generateCommonFields(i, 'IGPL');
        
        const rxLoss = (Math.random() * 0.05).toFixed(4);
        const txLoss = (Math.random() * 0.05).toFixed(4);
        const rxBytes = Math.floor(Math.random() * 50000000000);
        const txBytes = Math.floor(Math.random() * 50000000000);
        const rxUtil = (Math.random() * 85).toFixed(2);
        const txUtil = (Math.random() * 85).toFixed(2);

        data.push({
            id: `igpl-${i}`,
            productInstance,
            circuitCode,
            rxPacketLossRate: rxLoss + '%',
            txPacketLossRate: txLoss + '%',
            rxTotalBytes: formatNumber(rxBytes),
            txTotalBytes: formatNumber(txBytes),
            rxMaxBandwidthUtil: rxUtil + '%',
            txMaxBandwidthUtil: txUtil + '%',
            metricTime: timeStr
        });
    }

    return data;
}

// Generate Mock Data for Route City
export const generateRouteCityMockData = (count: number): RouteCityRecord[] => {
    const data: RouteCityRecord[] = [];

    for (let i = 0; i < count; i++) {
        const { productInstance, circuitCode } = generateCommonFields(i, 'Route');
        const cityInfo = INNER_MONGOLIA_CITIES[Math.floor(Math.random() * INNER_MONGOLIA_CITIES.length)];
        
        data.push({
            id: `route-${i}`,
            productInstance,
            circuitCode,
            primaryBackupFlag: Math.random() > 0.5 ? '主' : '备',
            routeSequence: Math.floor(Math.random() * 20 + 1).toString(),
            cityCode: cityInfo.code,
            cityName: cityInfo.name
        });
    }
    return data;
}

// Generate Mock Data for Route
export const generateRouteMockData = (count: number): RouteRecord[] => {
    const data: RouteRecord[] = [];
    for (let i = 0; i < count; i++) {
        const { productInstance, circuitCode, cityA } = generateCommonFields(i, 'Route');
        data.push({
            id: `route-info-${i}`,
            circuitCode,
            productInstance,
            primaryBackupFlag: Math.random() > 0.5 ? '主' : '备',
            routeSequence: Math.floor(Math.random() * 20 + 1).toString(),
            portId: `PID-${Math.floor(Math.random() * 100000)}`,
            portName: `GE-${Math.floor(Math.random() * 10)}/${Math.floor(Math.random() * 10)}/${Math.floor(Math.random() * 20)}`,
            deviceId: `DID-${Math.floor(Math.random() * 100000)}`,
            deviceName: `${cityA}-NE-${Math.floor(Math.random() * 999)}`
        });
    }
    return data;
}

// Helper to pick a random item from a city's address data
const getRandomAddress = (cityName: string) => {
    // Default to Hohhot if city data missing
    const addrData = ADDRESS_DATA[cityName] || ADDRESS_DATA['呼和浩特市'];
    const district = addrData.districts[Math.floor(Math.random() * addrData.districts.length)];
    const road = addrData.roads[Math.floor(Math.random() * addrData.roads.length)];
    const address = `${road}${Math.floor(Math.random() * 900 + 1)}号`;
    return { district, address };
};

// Generate Mock Data for Subscription
export const generateSubscriptionMockData = (count: number): SubscriptionRecord[] => {
    const data: SubscriptionRecord[] = [];
    const serviceTypes = ["数据专线", "MPLS-VPN专线", "互联网专线", "企宽"];
    const serviceLevels = ["跨境", "跨省", "跨地市", "本地"];
    const assuranceLevels = ["AAA", "AA", "A", "普通"];
    const statuses = ["正常", "停机", "测试"];
    const accessTypes = ["光纤直连", "GPON", "微波", "PTN接入"];
    const customers = ["腾讯科技", "阿里巴巴", "字节跳动", "工商银行", "招商银行", "国家电网", "蒙牛集团", "伊利集团"];

    for (let i = 0; i < count; i++) {
        const { productInstance, circuitCode } = generateCommonFields(i, 'Sub');
        const serviceType = serviceTypes[i % serviceTypes.length]; // Use modulo to ensure even distribution
        const serviceLevel = serviceLevels[Math.floor(Math.random() * serviceLevels.length)];
        const bandwidth = [10, 50, 100, 200, 500, 1000][Math.floor(Math.random() * 6)] + 'M';
        const customerName = customers[Math.floor(Math.random() * customers.length)];
        const customerCode = `CUST-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`;
        
        // A End - Usually in Inner Mongolia for this system context
        const cityAObj = INNER_MONGOLIA_CITIES[Math.floor(Math.random() * INNER_MONGOLIA_CITIES.length)];
        const provinceA = "内蒙古自治区";
        const cityA = cityAObj.name;
        const { district: districtA, address: addressA } = getRandomAddress(cityA);
        const accessTypeA = accessTypes[Math.floor(Math.random() * accessTypes.length)];

        // Z End - Strictly simulated within Inner Mongolia for this requirement
        let provinceZ = "内蒙古自治区";
        let cityZ = "";
        let districtZ = "";
        let addressZ = "";
        const accessTypeZ = accessTypes[Math.floor(Math.random() * accessTypes.length)];

        if (serviceLevel === '本地') {
            cityZ = cityA;
            // Pick address, possibly same district or different
            const zAddrData = getRandomAddress(cityZ);
            districtZ = zAddrData.district;
            addressZ = zAddrData.address;
        } else {
            // For '跨地市', '跨省', '跨境', we simulate using another IM city to satisfy the system constraint
            // while keeping the business label for variety.
            let cityZObj = INNER_MONGOLIA_CITIES[Math.floor(Math.random() * INNER_MONGOLIA_CITIES.length)];
            // Ensure different city if possible
            while(cityZObj.name === cityA) {
                 cityZObj = INNER_MONGOLIA_CITIES[Math.floor(Math.random() * INNER_MONGOLIA_CITIES.length)];
            }
            cityZ = cityZObj.name;
            const zAddrData = getRandomAddress(cityZ);
            districtZ = zAddrData.district;
            addressZ = zAddrData.address;
        }

        const isEnterpriseBroadband = serviceType === '企宽';
        const broadbandAccount = isEnterpriseBroadband ? `TEST_KD_${100000 + i}` : '';
        const broadbandType = isEnterpriseBroadband ? (Math.random() > 0.5 ? '统付' : '个付') : '';
        const commonAssuranceLevel = assuranceLevels[Math.floor(Math.random() * assuranceLevels.length)];

        const record: SubscriptionRecord = {
            id: `sub-${i}`,
            productInstance,
            serviceType,
            serviceLevel,
            circuitCode,
            bandwidth,
            assuranceLevel: commonAssuranceLevel,
            aAssuranceLevel: commonAssuranceLevel, // Defaulting to same for mock
            zAssuranceLevel: assuranceLevels[Math.floor(Math.random() * assuranceLevels.length)], // Random for Z
            customerCode,
            customerName,
            serviceStatus: statuses[Math.floor(Math.random() * statuses.length)],
            provinceA,
            cityA,
            districtA,
            addressA,
            accessTypeA,
            provinceZ,
            cityZ,
            districtZ,
            addressZ,
            accessTypeZ,
            businessCategory: isEnterpriseBroadband ? '企宽' : '专线',
            broadbandAccount: broadbandAccount,
            broadbandType: broadbandType,
        };
        data.push(record);
    }
    return data;
}

// Generate Mock Data for Complaint
export const generateComplaintMockData = (count: number): ComplaintRecord[] => {
    const data: ComplaintRecord[] = [];
    // Requested statuses for simulation
    const stages: ('待受理' | '处理中' | '待质检' | '已归档')[] = ['待受理', '处理中', '待质检', '已归档'];
    const businessCategories = ['专线', '企宽'];
    
    // Product types per category
    const productTypePools: Record<string, string[]> = {
        '专线': ['数据专线', '互联网专线', '语音专线', 'MPLS-VPN专线', 'APN专线'],
        '企宽': ['商务宽带', '沿街商铺宽带', '极速企宽']
    };

    // Specific requested types for the 'Fault Dispatch' scenario
    const allowedFaultDispatchTypes = ['数据专线', '互联网专线', '语音专线', 'MPLS-VPN专线', 'APN专线'];

    const recognitionResults = ['业务中断', '保护降级'];
    const faultResults = ['已解决', '未解决'];
    const faultTypes = ['网络故障（客响）', '网络故障（传输）', '网络故障（承载）', '客户故障'];
    const assigneeRoles = ['铁通班组', '分公司客响', '综调中心'];
    const satisfaction = ['是', '否'];
    const isRecoveredPool = ['是', '否'];
    const ticketSources = ['客户来电', '故障识别'];

    // Realistic Inner Mongolia Customers
    const realCustomers = [
        "内蒙古伊利实业集团", "内蒙古蒙牛乳业", "内蒙古电力集团", "包头钢铁集团",
        "内蒙古一机集团", "鄂尔多斯控股集团", "内蒙古自治区人民医院",
        "呼和浩特市教育局", "内蒙古大学", "内蒙古银行", "北方稀土",
        "内蒙古交通投资集团", "呼和浩特铁路局", "内蒙古新华发行集团"
    ];

    // Realistic Complaint Content
    const realComplaints = [
        "专线网络连接中断，无法访问外网",
        "访问内部ERP系统延迟极高，经常超时",
        "视频会议卡顿严重，伴有马赛克",
        "特定时间段网络丢包率超过10%",
        "光猫LOS红灯闪烁，业务全阻",
        "主用链路中断，未能自动切换至备用链路",
        "VPN拨号连接失败，提示错误619",
        "固定IP地址无法ping通",
        "上传速度只有签约带宽的10%",
        "机房设备断电告警，请核实供电情况"
    ];

    for (let i = 0; i < count; i++) {
        const { productInstance, circuitCode, cityA, cityZ, timeStr } = generateCommonFields(i, 'Complaint');
        
        // Cycle through requested statuses
        const stage = stages[i % stages.length];

        let businessCategory = '';
        let productType = '';

        // For simulation, make sure Todo items mostly consist of requested types
        if (stage !== '已归档') {
            businessCategory = '专线';
            productType = allowedFaultDispatchTypes[i % allowedFaultDispatchTypes.length];
        } else {
            businessCategory = businessCategories[Math.floor(Math.random() * businessCategories.length)];
            const pool = productTypePools[businessCategory] || ['通用业务'];
            productType = pool[Math.floor(Math.random() * pool.length)];
        }
        
        const addrA = getRandomAddress(cityA);
        const addrZ = getRandomAddress(cityZ);
        const ticketSource = ticketSources[Math.floor(Math.random() * ticketSources.length)];
        
        // SLA Status logic
        const slaStatusProb = Math.random();
        let slaStatus: 'Normal' | 'Warning' | 'Overdue' = 'Normal';
        if (slaStatusProb > 0.8) slaStatus = 'Warning';
        if (slaStatusProb > 0.95) slaStatus = 'Overdue';

        // Calculate SLA Deadline as a Timestamp
        const complaintDate = new Date(timeStr.replace(' ', 'T'));
        const deadlineHours = Math.floor(Math.random() * 48) + 4; // 4 to 52 hours deadline
        complaintDate.setHours(complaintDate.getHours() + deadlineHours);
        const slaDeadline = complaintDate.toISOString().replace('T', ' ').substring(0, 19);

        const alarmDate = new Date(timeStr.replace(' ', 'T'));
        const discoveryDate = new Date(alarmDate.getTime() + (Math.floor(Math.random() * 30) + 5) * 60000); // 5 to 35 minutes later
        const alarmTime = timeStr;
        const pad = (n: number) => n.toString().padStart(2, '0');
        const discoveryTime = `${discoveryDate.getFullYear()}-${pad(discoveryDate.getMonth() + 1)}-${pad(discoveryDate.getDate())} ${pad(discoveryDate.getHours())}:${pad(discoveryDate.getMinutes())}:${pad(discoveryDate.getSeconds())}`;
        const faultSnapshot = `https://picsum.photos/seed/fault-${i}/800/600`;
        const presentation = '查看呈现';

        const record: ComplaintRecord = {
            id: `comp-${i}`,
            ticketNo: `TS-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${(new Date().getDate()).toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            stage,
            productInstance,
            circuitCode,
            customerName: realCustomers[Math.floor(Math.random() * realCustomers.length)],
            customerCode: `C-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`,
            serviceAddressA: `${cityA}${addrA.district}${addrA.address}`,
            serviceAddressZ: `${cityZ}${addrZ.district}${addrZ.address}`,
            complaintContent: realComplaints[Math.floor(Math.random() * realComplaints.length)],
            faultTime: timeStr,
            alarmTime,
            discoveryTime,
            faultSnapshot,
            presentation,
            complaintTime: timeStr, // "派单时间"
            contactPerson: `联系人-${i}`,
            contactPhone: `1380000${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            assignee: `${assigneeRoles[Math.floor(Math.random() * assigneeRoles.length)]}-${cityA}`,
            assigneeCity: cityA,
            slaDeadline: slaDeadline, // "处理时限"
            slaStatus,
            productType,
            businessCategory,
            ticketSource,
            aAssuranceLevel: ["AAA", "AA", "A", "普通"][Math.floor(Math.random() * 4)],
            zAssuranceLevel: ["AAA", "AA", "A", "普通"][Math.floor(Math.random() * 4)],
        };

        if (stage !== '待受理') {
            record.faultResult = faultResults[Math.floor(Math.random() * faultResults.length)];
            record.faultType = faultTypes[Math.floor(Math.random() * faultTypes.length)];
            record.faultCause = '经排查，发现相关节点存在异常，已协调技术人员完成处理。';
        }

        if (stage === '已归档') {
            record.isSatisfied = satisfaction[Math.floor(Math.random() * satisfaction.length)];
            record.isRecovered = isRecoveredPool[Math.floor(Math.random() * isRecoveredPool.length)];
            record.qcRemarks = '流程闭环，处理完毕。';
        }

        data.push(record);
    }
    return data;
}

export const generateTrafficOverlimitMockData = (count: number): TrafficOverlimitAnalysisRecord[] => {
  const data: TrafficOverlimitAnalysisRecord[] = [];
  const cities = INNER_MONGOLIA_CITIES.map(c => c.name);
  
  for (let i = 0; i < count; i++) {
    const city = cities[i % cities.length];
    const totalBusiness = Math.floor(Math.random() * 5000 + 1000);
    const zeroTrafficCount = Math.floor(Math.random() * 200 + 50);
    const highBandwidthCount = Math.floor(Math.random() * 300 + 100);
    
    const zeroTrafficRatio = ((zeroTrafficCount / totalBusiness) * 100).toFixed(2);
    const highBandwidthRatio = ((highBandwidthCount / totalBusiness) * 100).toFixed(2);
    
    const date = new Date();
    date.setDate(date.getDate() - i);
    const time = date.toISOString().split('T')[0];

    data.push({
      id: `traffic-${i}`,
      time,
      city,
      totalBusiness,
      zeroTrafficCount,
      zeroTrafficRatio,
      highBandwidthCount,
      highBandwidthRatio
    });
  }
  return data;
};

export const generateTrafficOverlimitDetailMockData = (count: number, type: 'zero' | 'high'): TrafficOverlimitDetailRecord[] => {
  const data: TrafficOverlimitDetailRecord[] = [];
  const cities = INNER_MONGOLIA_CITIES.map(c => c.name);
  const customers = ["内蒙古伊利实业集团", "内蒙古蒙牛乳业", "内蒙古电力集团", "包头钢铁集团", "内蒙古一机集团"];
  const terminalTypes = ["ONU", "CPE", "ONT"];

  for (let i = 0; i < count; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const customerName = customers[Math.floor(Math.random() * customers.length)];
    const bandwidth = [100, 200, 500, 1000][Math.floor(Math.random() * 4)];
    
    let upTraffic = "0";
    let downTraffic = "0";
    let upRate = "0";
    let downRate = "0";
    let upUtil = "0";
    let downUtil = "0";

    if (type === 'high') {
      const rate = (bandwidth * (0.8 + Math.random() * 0.15)).toFixed(2); // 80% to 95% utilization
      upTraffic = (Math.random() * 500 + 100).toFixed(2) + " GB";
      downTraffic = (Math.random() * 1000 + 500).toFixed(2) + " GB";
      upRate = (Math.random() * 50 + 10).toFixed(2) + " MB/s";
      downRate = (parseFloat(rate) / 8).toFixed(2) + " MB/s"; // Approx conversion
      upUtil = (Math.random() * 40 + 10).toFixed(2) + "%";
      downUtil = (parseFloat(rate) / bandwidth * 100).toFixed(2) + "%";
    }

    const date = new Date();
    const collectionTime = date.toISOString().replace('T', ' ').substring(0, 19);
    date.setHours(date.getHours() - 2);
    const lastOnlineTime = date.toISOString().replace('T', ' ').substring(0, 19);

    data.push({
      id: `detail-${type}-${i}`,
      collectionTime,
      customerName,
      customerCode: `CUST-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`,
      province: "内蒙古自治区",
      city,
      broadbandAccount: `KD_IM_${100000 + i}`,
      terminalType: terminalTypes[Math.floor(Math.random() * terminalTypes.length)],
      terminalMac: `00:E0:FC:${Math.floor(Math.random() * 256).toString(16).toUpperCase()}:${Math.floor(Math.random() * 256).toString(16).toUpperCase()}:${Math.floor(Math.random() * 256).toString(16).toUpperCase()}`,
      terminalSn: `SN${Math.floor(Math.random() * 1000000000)}`,
      orderedBandwidth: bandwidth + "M",
      upstreamTraffic: upTraffic,
      downstreamTraffic: downTraffic,
      upstreamRate: upRate,
      downstreamRate: downRate,
      upstreamUtilization: upUtil,
      downstreamUtilization: downUtil,
      lastOnlineTime,
      type
    });
  }
  return data;
};

// Generate Mock Data for Important Business Management
export const generateImportantBusinessMockData = (count: number): ImportantBusinessRecord[] => {
    const data: ImportantBusinessRecord[] = [];
    const businessTypes = ["数据专线", "互联网专线", "MPLS-VPN专线", "语音专线"];
    const assuranceLevels = ["AAA", "AA", "A", "普通"];
    const customers = ["腾讯科技", "阿里巴巴", "字节跳动", "工商银行", "招商银行", "国家电网", "蒙牛集团", "伊利集团"];

    for (let i = 0; i < count; i++) {
        const { productInstance } = generateCommonFields(i, 'Biz');
        const businessType = businessTypes[i % businessTypes.length];
        const customerName = customers[i % customers.length];
        const customerCode = `CUST-${(100000 + i).toString()}`;
        
        const cityAObj = INNER_MONGOLIA_CITIES[i % INNER_MONGOLIA_CITIES.length];
        const cityA = cityAObj.name;
        const { district: districtA, address: addressA } = getRandomAddress(cityA);
        
        const cityZObj = INNER_MONGOLIA_CITIES[(i + 2) % INNER_MONGOLIA_CITIES.length];
        const cityZ = cityZObj.name;
        const { district: districtZ, address: addressZ } = getRandomAddress(cityZ);

        data.push({
            id: `ib-${i}`,
            importanceLevel: Math.random() > 0.5 ? '重要' : '特别重要',
            customerName,
            customerCode,
            businessType,
            productInstance,
            aAssuranceLevel: assuranceLevels[Math.floor(Math.random() * assuranceLevels.length)],
            aCity: cityA,
            aDistrict: districtA,
            aAddress: addressA,
            zAssuranceLevel: assuranceLevels[Math.floor(Math.random() * assuranceLevels.length)],
            zCity: cityZ,
            zDistrict: districtZ,
            zAddress: addressZ,
        });
    }
    return data;
};

// Generate Mock Data for Group Orders (Figure 1 in request)
export const generateGroupOrderData = (count: number): GroupOrderRecord[] => {
    const data: GroupOrderRecord[] = [];
    // Updated statuses to include '待回单'
    const statuses: ('处理中' | '待受理' | '已撤单' | '已完成' | '待回单')[] = ['处理中', '待受理', '处理中', '处理中', '待受理', '已撤单', '已完成', '处理中', '处理中', '待受理', '已完成', '处理中', '已撤单', '待回单', '待回单'];
    const names = [
        "内蒙古自治区教育厅-省级教育专网",
        "呼和浩特市第一中学-智慧校园光纤",
        "土默特左旗人民医院-医保联网专线",
        "回民区万达广场-商业宽带批量接入",
        "内蒙古电力集团-全区电力调度数据网",
        "包头市青山区政府-政务外网扩容",
        "杨智彬-47177000800720260...",
        "内蒙古巴运控股(集团)有限...",
        "伊金霍洛旗红庆河镇人民政府...",
        "中国航空集团旅业有限公司内...",
        "鄂托克旗三江龙酒店-471770...",
        "林西县新林镇小学-47176000...",
        "林西县板石房子小学-471760...",
        "内蒙古鼎盛商业综合体管理服..."
    ];
    const levels = ["省级", "地市级", "旗县级", "网格级", "省级", "地市级", "网格级", "地市级", "旗县级", "省级", "旗县级", "旗县级", "网格级", "地市级"];
    const managers = [
        "张宏伟(1394718...)", "王坤鹏(15004821...)", "王晓强(19804899...)", "付素波(15147696...)", 
        "赵铁柱(13800138...)", "智宇宁(15024866...)", "王志东(13947375...)", "刘伟(184471809...)", 
        "张彦飞(18747749...)", "武楠(158481299...)", "额力苏(18247744...)", "侯峰(138476704...)", 
        "侯峰(138476704...)", "王晓强(19804899...)"
    ];

    for (let i = 0; i < count; i++) {
        const nameIndex = i % names.length;
        const status = statuses[i % statuses.length];
        
        // Dates
        const receiptDate = new Date();
        receiptDate.setDate(receiptDate.getDate() - Math.floor(Math.random() * 5));
        receiptDate.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
        const receiptTime = receiptDate.toISOString().replace('T', ' ').substring(0, 19);

        const deadlineDate = new Date(receiptDate);
        deadlineDate.setDate(deadlineDate.getDate() + 4);
        const deliveryDeadline = deadlineDate.toISOString().replace('T', ' ').substring(0, 19);

        let completionTime = '';
        let returnOrderTime = '';
        if (status === '已完成') {
            const compDate = new Date(receiptDate);
            compDate.setDate(compDate.getDate() + 2);
            completionTime = compDate.toISOString().replace('T', ' ').substring(0, 19);
            
            const returnDate = new Date(compDate);
            returnDate.setHours(returnDate.getHours() - 1);
            returnOrderTime = returnDate.toISOString().replace('T', ' ').substring(0, 19);
        }

        const remainingDays = (Math.random() * 5 + 1).toFixed(2);
        const completionRate = status === '已完成' ? '100.00%' : (status === '待受理' ? '0.00%' : (Math.random() * 80).toFixed(2) + '%');
        const inflight = Math.floor(Math.random() * 6);
        const total = inflight + Math.floor(Math.random() * 3);
        const inflightStr = status === '已完成' ? `0/1` : `${inflight}/${total === 0 ? 1 : total}`;

        // Ensure logical focusStatus: completed / total, where total >= completed
        const totalTasks = Math.floor(Math.random() * 8) + 5; // 5 to 12 tasks
        // For '待回单', tasks should be 100% completed technically, but maybe not officially 'Done'
        const completedTasks = (status === '已完成' || status === '待回单') ? totalTasks : (status === '待受理' ? 0 : Math.floor(Math.random() * totalTasks));
        const focusStatus = `${completedTasks}/${totalTasks}`;

        const cityObj = INNER_MONGOLIA_CITIES[Math.floor(Math.random() * INNER_MONGOLIA_CITIES.length)];
        const city = cityObj.name;
        // Simple mock county logic
        const county = `${city}辖区`; 

        const unassignedTickets = (status === '待受理') 
            ? totalTasks 
            : ((status === '处理中' && i % 4 === 0) ? Math.min(totalTasks, (i % 5) + 1) : 0);

        data.push({
            id: `go-${i}`,
            isImportant: i % 5 === 0,
            focusStatus: focusStatus,
            assignedTasks: status === '待受理' ? 0 : Math.floor(Math.random() * 5),
            unassignedTickets: unassignedTickets,
            name: names[nameIndex],
            level: levels[nameIndex],
            manager: managers[nameIndex],
            status,
            completionRate,
            inflightDispatched: inflightStr,
            remainingTime: (status === '已完成' || status === '已撤单') ? '-' : `${remainingDays}天`,
            receiptTime,
            deliveryDeadline: (status === '已撤单') ? '-' : deliveryDeadline,
            completionTime,
            returnOrderTime: (status === '已完成') ? returnOrderTime : '',
            city,
            county
        });
    }
    return data;
};

export const MOCK_DATA = generateMockData(45);
export const MOCK_SPN_DATA = generateSpnMockData(35);
export const MOCK_INTERNET_DATA = generateInternetMockData(40);
export const MOCK_ALARM_DATA = generateAlarmMockData(60);
export const MOCK_IPL_DATA = generateIplMockData(30);
export const MOCK_MPLS_DATA = generateMplsMockData(40);
export const MOCK_IGPL_DATA = generateIgplMockData(35);
export const MOCK_ROUTE_CITY_DATA = generateRouteCityMockData(50);
export const MOCK_ROUTE_DATA = generateRouteMockData(50);
export const MOCK_SUBSCRIPTION_DATA = generateSubscriptionMockData(50);
export const MOCK_COMPLAINT_DATA = generateComplaintMockData(40);
export const MOCK_GROUP_ORDER_DATA = generateGroupOrderData(20);
export const generateTerminalInventoryMockData = (count: number): TerminalInventoryRecord[] => {
    const data: TerminalInventoryRecord[] = [];
    const deviceTypes = ['千里眼', '云视讯', 'E企组网', '云无线', 'AC-AP', '云电脑'];
    const statuses = ['库存', '已出库', '已拆除'];
    const vendors = ['华为', '中兴', '新华三', 'TP-LINK'];

    for (let i = 0; i < count; i++) {
        const date = new Date();
        date.setMinutes(date.getMinutes() - Math.floor(Math.random() * 1440 * 30)); // Up to 30 days ago
        const inboundTime = date.toISOString().replace('T', ' ').substring(0, 19);
        
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        let outboundTime = '';
        let removedTime = '';
        
        if (status === '已出库' || status === '已拆除') {
            const outDate = new Date(date);
            outDate.setHours(outDate.getHours() + Math.floor(Math.random() * 48));
            outboundTime = outDate.toISOString().replace('T', ' ').substring(0, 19);
        }
        
        if (status === '已拆除') {
            const remDate = new Date(outboundTime || date);
            remDate.setHours(remDate.getHours() + Math.floor(Math.random() * 48));
            removedTime = remDate.toISOString().replace('T', ' ').substring(0, 19);
        }

        data.push({
            id: `sn-${i}`,
            sn: `SN${Math.floor(Math.random() * 1000000000000)}`,
            deviceType: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
            status,
            vendor: vendors[Math.floor(Math.random() * vendors.length)],
            inboundTime,
            outboundTime,
            removedTime,
            importer: `管理员${i % 5 + 1}`,
            importerPhone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`
        });
    }
    return data;
};

export const MOCK_TERMINAL_INVENTORY_DATA = generateTerminalInventoryMockData(50);

export const MOCK_FAULT_RULES: FaultRuleRecord[] = [
    {
        id: 'rule-1',
        alarmObject: '端口',
        resourceInterface: '端',
        alarmTitle: 'R_LOS, ETH_LOS, 以太网物理接口(ETPI) 信号丢失(LOS), 信号丢失告警',
        faultResult: '业务中断',
        updateTime: '2023-10-25 10:00:00'
    },
    {
        id: 'rule-2',
        alarmObject: '单板',
        resourceInterface: '端',
        alarmTitle: 'BD_STATUS, BUS_ERR, 单板脱位, 单板离线, 单板故障',
        faultResult: '业务中断',
        updateTime: '2023-10-25 10:05:00'
    },
    {
        id: 'rule-3',
        alarmObject: '网元',
        resourceInterface: '端',
        alarmTitle: 'NE_COMMU_BREAK, 设备离线, MUT_LOS, NE_NOT_LOGIN, 承载网管系统告警, 网元断链',
        faultResult: '业务中断',
        updateTime: '2023-10-25 10:10:00'
    },
    {
        id: 'rule-4',
        alarmObject: '端口',
        resourceInterface: '路径',
        alarmTitle: 'R_LOS, ETH_LOS, 以太网物理接口(ETPI) 信号丢失(LOS), 信号丢失告警',
        faultResult: '业务中断/保护降级',
        updateTime: '2023-10-25 10:15:00'
    },
    {
        id: 'rule-5',
        alarmObject: '单板',
        resourceInterface: '路径',
        alarmTitle: 'BD_STATUS, BUS_ERR, 单板脱位, 单板离线, 单板故障',
        faultResult: '业务中断/保护降级',
        updateTime: '2023-10-25 10:20:00'
    },
    {
        id: 'rule-6',
        alarmObject: '网元',
        resourceInterface: '路径',
        alarmTitle: 'NE_COMMU_BREAK, 设备离线, MUT_LOS, NE_NOT_LOGIN, 承载网管系统告警, 网元断链',
        faultResult: '业务中断/保护降级',
        updateTime: '2023-10-25 10:25:00'
    }
];

export const generateFaultEventMockData = (count: number): FaultEventRecord[] => {
    const data: FaultEventRecord[] = [];
    const recognitionResults: ('业务中断' | '保护降级')[] = ['业务中断', '保护降级'];
    const eventStatuses: ('活动' | '历史')[] = ['活动', '历史'];
    const customers = ["内蒙古伊利实业集团", "内蒙古蒙牛乳业", "内蒙古电力集团", "包头钢铁集团", "内蒙古一机集团"];

    for (let i = 0; i < count; i++) {
        const { productInstance, circuitCode, timeStr } = generateCommonFields(i, 'Event');
        
        const eventDate = new Date(timeStr.replace(' ', 'T'));
        const faultDate = new Date(eventDate.getTime() - (Math.floor(Math.random() * 60) + 10) * 60000);
        const recoveryDate = new Date(eventDate.getTime() + (Math.floor(Math.random() * 120) + 30) * 60000);
        
        const pad = (n: number) => n.toString().padStart(2, '0');
        const formatDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

        data.push({
            id: `event-${i}`,
            eventNo: `E-${new Date().getFullYear()}${pad(new Date().getMonth() + 1)}${pad(new Date().getDate())}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            groupCustomerCode: `GC-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`,
            groupCustomerName: customers[i % customers.length],
            productInstance,
            circuitCode,
            recognitionResult: recognitionResults[Math.floor(Math.random() * recognitionResults.length)],
            eventStatus: eventStatuses[Math.floor(Math.random() * eventStatuses.length)],
            eventTime: timeStr,
            faultTime: formatDate(faultDate),
            recoveryTime: Math.random() > 0.3 ? formatDate(recoveryDate) : '-',
            snapshotUrl: `https://picsum.photos/seed/fault-${i}/800/600`,
            businessType: ['数据专线', '互联网专线', '语音专线', 'MPLS-VPN专线', 'APN专线'][Math.floor(Math.random() * 5)]
        });
    }
    return data;
};

export const generateFaultSMSConfigMockData = (count: number): FaultSMSConfigRecord[] => {
  const data: FaultSMSConfigRecord[] = [];
  const businessTypes = ["数据专线", "互联网专线", "语音专线", "MPLS-VPN专线", "APN专线"];
  const names = ["张三", "李四", "王五", "赵六", "钱七", "孙八"];
  const customers = ["内蒙古伊利实业集团", "内蒙古蒙牛乳业", "内蒙古电力集团", "包头钢铁集团", "内蒙古一机集团"];

  for (let i = 0; i < count; i++) {
    const randomSuffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    const productInstance = `209${randomSuffix}`; 
    
    const businessType = businessTypes[i % businessTypes.length];
    const customerName = customers[i % customers.length];
    const customerCode = `CUST-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`;
    
    const recipientCount = Math.floor(Math.random() * 2) + 1;
    const recipients = [];
    for (let j = 0; j < recipientCount; j++) {
      recipients.push({
        name: names[Math.floor(Math.random() * names.length)],
        phone: `13${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`
      });
    }

    data.push({
      id: `sms-config-${i}`,
      productInstance,
      recipients,
      businessType,
      customerName,
      customerCode
    });
  }
  return data;
};

export const MOCK_PORTRAIT_INDICATORS: PortraitIndicator[] = [
  { id: '1', name: '装机量', algorithm: '累计装机工单总数', weight: 20, scoringRule: '按月度目标达成率打分' },
  { id: '2', name: '装机处理及时率', algorithm: '及时处理工单数 / 总工单数', weight: 30, scoringRule: '100%得30分，每降低1%扣1分' },
  { id: '3', name: '满意度', algorithm: '满意工单数 / 总评价工单数', weight: 25, scoringRule: '100%得25分，每降低1%扣0.5分' },
  { id: '4', name: '质检结果', algorithm: '质检合格数 / 总质检工单数', weight: 25, scoringRule: '100%得25分，每不合格一单扣2分' },
];

export const MOCK_PERSONNEL_PORTRAITS: PersonnelPortrait[] = [
  {
    id: 'p1',
    name: '张伟',
    city: '呼和浩特市',
    score: 95,
    timelinessRate: 98,
    satisfaction: 96,
    qualityInspection: 92,
    trendData: [
      { date: '2026-01', value: 92 },
      { date: '2026-02', value: 94 },
      { date: '2026-03', value: 95 },
    ]
  },
  {
    id: 'p2',
    name: '李娜',
    city: '包头市',
    score: 88,
    timelinessRate: 90,
    satisfaction: 85,
    qualityInspection: 89,
    trendData: [
      { date: '2026-01', value: 85 },
      { date: '2026-02', value: 87 },
      { date: '2026-03', value: 88 },
    ]
  },
  {
    id: 'p3',
    name: '王五',
    city: '乌海市',
    score: 75,
    timelinessRate: 80,
    satisfaction: 70,
    qualityInspection: 75,
    trendData: [
      { date: '2026-01', value: 70 },
      { date: '2026-02', value: 72 },
      { date: '2026-03', value: 75 },
    ]
  },
  {
    id: 'p4',
    name: '赵六',
    city: '赤峰市',
    score: 92,
    timelinessRate: 95,
    satisfaction: 90,
    qualityInspection: 91,
    trendData: [
      { date: '2026-01', value: 90 },
      { date: '2026-02', value: 91 },
      { date: '2026-03', value: 92 },
    ]
  },
  {
    id: 'p5',
    name: '孙七',
    city: '通辽市',
    score: 68,
    timelinessRate: 70,
    satisfaction: 65,
    qualityInspection: 69,
    trendData: [
      { date: '2026-01', value: 65 },
      { date: '2026-02', value: 66 },
      { date: '2026-03', value: 68 },
    ]
  }
];

export const MOCK_DELIVERY_MANAGER_INDICATORS: PortraitIndicator[] = [
  { id: 'dm1', name: '开通及时率', algorithm: '及时开通工单数 / 总开通工单数', weight: 20, scoringRule: '100%得20分，每降低1%扣0.5分' },
  { id: 'dm2', name: '用后即评', algorithm: '(专线15日回访+企宽7日回访+终端实时回访) / 总回访数', weight: 20, scoringRule: '100%满意得20分；95%-100%每低1%扣1分；90%-95%每低1%扣2分；低于90%得0分' },
  { id: 'dm3', name: '交付量', algorithm: '累计交付完成工单总数', weight: 15, scoringRule: '按月度目标达成率打分' },
  { id: 'dm4', name: '团单分派及时率', algorithm: '及时分派团单数 / 总团单数', weight: 15, scoringRule: '100%得15分，每延迟1小时扣0.1分' },
  { id: 'dm5', name: '团单报结及时率', algorithm: '及时报结团单数 / 总团单数', weight: 15, scoringRule: '100%得15分，每延迟1小时扣0.1分' },
  { id: 'dm6', name: '团单受理及时率', algorithm: '及时受理团单数 / 总团单数', weight: 15, scoringRule: '100%得15分，每延迟1小时扣0.1分' },
];

export const MOCK_DELIVERY_MANAGER_PORTRAITS: DeliveryManagerPortrait[] = [
  {
    id: 'dm-p1',
    name: '陈明',
    city: '呼和浩特市',
    score: 94,
    openingTimelinessRate: 96,
    postUseEvaluation: 98,
    deliveryVolume: 120,
    dispatchTimelinessRate: 95,
    completionTimelinessRate: 93,
    acceptanceTimelinessRate: 97,
    trendData: [
      { date: '2026-01', value: 91 },
      { date: '2026-02', value: 93 },
      { date: '2026-03', value: 94 },
    ]
  },
  {
    id: 'dm-p2',
    name: '林静',
    city: '包头市',
    score: 89,
    openingTimelinessRate: 91,
    postUseEvaluation: 92,
    deliveryVolume: 105,
    dispatchTimelinessRate: 88,
    completionTimelinessRate: 90,
    acceptanceTimelinessRate: 89,
    trendData: [
      { date: '2026-01', value: 86 },
      { date: '2026-02', value: 88 },
      { date: '2026-03', value: 89 },
    ]
  },
  {
    id: 'dm-p3',
    name: '周杰',
    city: '鄂尔多斯市',
    score: 82,
    openingTimelinessRate: 85,
    postUseEvaluation: 80,
    deliveryVolume: 95,
    dispatchTimelinessRate: 82,
    completionTimelinessRate: 84,
    acceptanceTimelinessRate: 83,
    trendData: [
      { date: '2026-01', value: 78 },
      { date: '2026-02', value: 80 },
      { date: '2026-03', value: 82 },
    ]
  },
  {
    id: 'dm-p4',
    name: '吴芳',
    city: '赤峰市',
    score: 91,
    openingTimelinessRate: 93,
    postUseEvaluation: 95,
    deliveryVolume: 110,
    dispatchTimelinessRate: 90,
    completionTimelinessRate: 92,
    acceptanceTimelinessRate: 91,
    trendData: [
      { date: '2026-01', value: 88 },
      { date: '2026-02', value: 90 },
      { date: '2026-03', value: 91 },
    ]
  },
  {
    id: 'dm-p5',
    name: '郑强',
    city: '通辽市',
    score: 76,
    openingTimelinessRate: 78,
    postUseEvaluation: 75,
    deliveryVolume: 85,
    dispatchTimelinessRate: 76,
    completionTimelinessRate: 77,
    acceptanceTimelinessRate: 78,
    trendData: [
      { date: '2026-01', value: 72 },
      { date: '2026-02', value: 74 },
      { date: '2026-03', value: 76 },
    ]
  }
];

export const generateOfflineTerminalMockData = (count: number): OfflineTerminalAnalysisRecord[] => {
  const data: OfflineTerminalAnalysisRecord[] = [];
  const cities = INNER_MONGOLIA_CITIES.map(c => c.name);
  
  for (let i = 0; i < count; i++) {
    const city = cities[i % cities.length];
    const totalBusiness = Math.floor(Math.random() * 8000 + 2000);
    const offlineThreeMonthsCount = Math.floor(Math.random() * 400 + 100);
    const offlineThreeMonthsRatio = ((offlineThreeMonthsCount / totalBusiness) * 100).toFixed(2);
    
    const date = new Date();
    date.setMonth(date.getMonth() - (i % 12));
    const time = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

    data.push({
      id: `offline-stat-${i}`,
      time,
      city,
      totalBusiness,
      offlineThreeMonthsCount,
      offlineThreeMonthsRatio
    });
  }
  return data;
};

export const generateOfflineTerminalDetailMockData = (count: number): OfflineTerminalDetailRecord[] => {
  const data: OfflineTerminalDetailRecord[] = [];
  const cities = INNER_MONGOLIA_CITIES.map(c => c.name);
  const customers = ["内蒙古伊利实业集团", "内蒙古蒙牛乳业", "内蒙古电力集团", "包头钢铁集团", "内蒙古一机集团"];
  const terminalTypes = ["ONU", "CPE", "ONT"];

  for (let i = 0; i < count; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const customerName = customers[Math.floor(Math.random() * customers.length)];
    const bandwidth = [100, 200, 500, 1000][Math.floor(Math.random() * 4)];
    
    const date = new Date();
    const collectionTime = date.toISOString().replace('T', ' ').substring(0, 19);
    
    const offlineDate = new Date();
    offlineDate.setMonth(offlineDate.getMonth() - 4);
    offlineDate.setDate(offlineDate.getDate() - Math.floor(Math.random() * 30));
    const offlineTime = offlineDate.toISOString().replace('T', ' ').substring(0, 19);
    
    const onlineDate = new Date(offlineDate);
    onlineDate.setMonth(onlineDate.getMonth() - 1);
    const onlineTime = onlineDate.toISOString().replace('T', ' ').substring(0, 19);

    data.push({
      id: `offline-detail-${i}`,
      collectionTime,
      customerName,
      customerCode: `CUST-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`,
      broadbandAccount: `KD_IM_${200000 + i}`,
      province: "内蒙古自治区",
      city,
      terminalType: terminalTypes[Math.floor(Math.random() * terminalTypes.length)],
      terminalMac: `00:E0:FC:${Math.floor(Math.random() * 256).toString(16).toUpperCase()}:${Math.floor(Math.random() * 256).toString(16).toUpperCase()}:${Math.floor(Math.random() * 256).toString(16).toUpperCase()}`,
      terminalSn: `SN${Math.floor(Math.random() * 1000000000)}`,
      orderedBandwidth: bandwidth + "M",
      onlineTime,
      offlineTime
    });
  }
  return data;
};
