
export interface OtnRecord {
  id: string;
  productInstance: string;          // 产品实例标识
  lineName: string;                 // 专线名称
  circuitCode: string;              // 电路代号
  latency: string;                  // 时延
  jitter: string;                   // 时延抖动
  rxPacketLossRate: string;         // 接收方向丢包率
  txPacketLossRate: string;         // 发送方向丢包率
  rxTotalBytes: string;             // 接收总字节数
  txTotalBytes: string;             // 发送总字节数
  rxMaxBandwidthUtil: string;       // 接收方向最大带宽利用率
  txMaxBandwidthUtil: string;       // 发送方向最大带宽利用率
  
  // A End
  aNe: string;                      // A端传输网元
  aNePort: string;                  // A端传输网元端口
  aSlot: string;                    // A端传输时隙
  aServiceRxPackets: string;        // A端业务端口接收总数据包数
  aServiceRxBytes: string;          // A端业务端口接收总字节数
  aServiceRxDrop: string;           // A端业务端口接收丢包数
  aServiceTxPackets: string;        // A端业务端口发送总数据包数
  aServiceTxDrop: string;           // A端业务端口发送丢包数
  aPreFecBer: string;               // A端业务端口纠错前FEC误码率
  aPostFecBer: string;              // A端业务端口纠错后FEC误码率
  
  // Z End
  zNe: string;                      // Z端传输网元
  zNePort: string;                  // Z端传输网元端口
  zSlot: string;                    // Z端传输时隙
  zServiceRxPackets: string;        // Z端业务端口接收总数据包数
  zServiceRxBytes: string;          // Z端业务端口接收总字节数
  zServiceRxDrop: string;           // Z端业务端口接收丢包数
  zServiceTxPackets: string;        // Z端业务端口发送总数据包数
  zServiceTxBytes: string;          // Z端业务端口发送总字节数
  zServiceTxDrop: string;           // Z端业务端口发送丢包数
  zPreFecBer: string;               // Z端业务端口纠错前FEC误码率
  zPostFecBer: string;              // Z端业务端口纠错后FEC误码率
  
  metricTime: string;               // 指标时间
}

export interface SpnRecord {
  id: string;
  productInstance: string;          // 产品实例标识
  lineName: string;                 // 专线名称
  circuitCode: string;              // 电路代号
  
  avgBandwidthUtil: string;         // 平均带宽利用率
  peakBandwidthUtil: string;        // 峰值带宽利用率
  packetLossRate: string;           // 丢包率
  latency: string;                  // 时延
  jitter: string;                   // 抖动
  upAvgBandwidthUtil: string;       // 上行平均带宽利用率
  downAvgBandwidthUtil: string;     // 下行平均带宽利用率

  // A End
  aNe: string;                      // A端传输网元
  aPwRxPackets: string;             // A端伪线端点接收报文的包数
  aPwRxBytes: string;               // A端伪线端点接收报文的字节数
  aPwTxPackets: string;             // A端伪线端点发送报文的包数
  aPwTxBytes: string;               // A端伪线端点发送报文的字节数
  aPwLatency: string;               // A端伪线端点PW时延
  aPwJitter: string;                // A端伪线端点PW时延抖动
  aPwLossRate: string;              // A端伪线端点PW丢包率
  aPwBandwidthUtilAvg: string;      // A端伪线端点PW带宽利用率平均值
  aPwBandwidthUtilMax: string;      // A端伪线端点PW带宽利用率最大值

  // Z End
  zNe: string;                      // Z端传输网元
  zPwRxPackets: string;             // Z端伪线端点接收报文的包数
  zPwRxBytes: string;               // Z端伪线端点接收报文的字节数
  zPwTxPackets: string;             // Z端伪线端点发送报文的包数
  zPwTxBytes: string;               // Z端伪线端点发送报文的字节数
  zPwLatency: string;               // Z端伪线端点PW时延
  zPwJitter: string;                // Z端伪线端点PW时延抖动
  zPwLossRate: string;              // Z端伪线端点PW丢包率
  zPwBandwidthUtilAvg: string;      // Z端伪线端点PW带宽利用率平均值
  zPwBandwidthUtilMax: string;      // Z端伪线端点PW带宽利用率最大值

  metricTime: string;               // 指标时间
}

export interface InternetRecord {
  id: string;
  productInstance: string;          // 产品实例标识
  lineName: string;                 // 专线名称
  circuitCode: string;              // 电路代号
  
  uplinkBytes: string;              // 业务上行字节数
  downlinkBytes: string;            // 业务下行字节数
  uplinkAvgRate: string;            // 业务上行平均速率
  downlinkAvgRate: string;          // 业务下行平均速率
  uplinkAvgBandwidthUtil: string;   // 业务上行平均带宽利用率
  downlinkAvgBandwidthUtil: string; // 业务下行平均带宽利用率
  latency: string;                  // 时延
  jitter: string;                   // 时延抖动
  avgPacketLossRate: string;        // 双向平均丢包率
  
  metricTime: string;               // 指标时间
}

export interface IplRecord {
  id: string;
  productInstance: string;          // 产品实例标识
  circuitCode: string;              // 电路代号
  latency: string;                  // 时延
  metricTime: string;               // 指标时间
}

export interface MplsRecord {
  id: string;
  productInstance: string;          // 产品实例
  rxRate: string;                   // 接收流速
  txRate: string;                   // 发送流速
  metricTime: string;               // 指标时间
}

export interface IgplRecord {
  id: string;
  productInstance: string;          // 产品实例
  circuitCode: string;              // 电路代号
  rxPacketLossRate: string;         // 接收方向丢包率
  txPacketLossRate: string;         // 发送方向丢包率
  rxTotalBytes: string;             // 接收总字节数
  txTotalBytes: string;             // 发送总字节数
  rxMaxBandwidthUtil: string;       // 接收方向最大带宽利用率
  txMaxBandwidthUtil: string;       // 发送方向最大带宽利用率
  metricTime: string;               // 指标时间
}

export interface RouteCityRecord {
  id: string;
  circuitCode: string;       // 电路代号
  productInstance: string;   // 产品实例
  primaryBackupFlag: string; // 主备标识
  routeSequence: string;     // 路由序号
  cityCode: string;          // 地市编码
  cityName: string;          // 地市名称
}

export interface RouteRecord {
  id: string;
  circuitCode: string;       // 电路代号
  productInstance: string;   // 产品实例
  primaryBackupFlag: string; // 主备标识
  routeSequence: string;     // 路由序号
  portId: string;            // 端口ID
  portName: string;          // 端口名称
  deviceId: string;          // 设备ID
  deviceName: string;        // 设备名称
}

export interface SubscriptionRecord {
  id: string;
  productInstance: string;  // 产品实例
  serviceType: string;      // 业务类型
  serviceLevel: string;     // 业务级别
  circuitCode: string;      // 电路代号
  bandwidth: string;        // 带宽
  assuranceLevel: string;   // 业务保障等级
  aAssuranceLevel?: string; // A端保障等级
  zAssuranceLevel?: string; // Z端保障等级
  customerCode: string;     // 客户编号
  customerName: string;     // 客户名称
  serviceStatus: string;    // 业务状态
  provinceA: string;        // A端所属省份
  cityA: string;            // A端所属地市
  districtA: string;        // A端所属区县
  addressA: string;         // A端地址
  accessTypeA: string;      // A端接入方式
  provinceZ: string;        // Z端所属省份
  cityZ: string;            // Z端所属地市
  districtZ: string;        // Z端所属区县
  addressZ: string;         // Z端地址
  accessTypeZ: string;      // Z端接入方式
  businessCategory: string; // 业务分类
  broadbandAccount: string; // 宽带账号
  broadbandType?: string;   // 宽带类型 (统付/个付)
}

export interface AlarmRecord {
  id: string;
  ownerId: string;                  // 归属方标识
  alarmGlobalId: string;            // 告警全局标识
  neName: string;                   // 网元名称
  neType: string;                   // 网元类型
  alarmObject: string;              // 告警定位对象
  alarmObjectName: string;          // 告警定位对象名称
  alarmObjectType: string;          // 告警定位对象类型
  eventTime: string;                // 事件发生时间
  clearTime: string;                // 告警清除时间
  alarmTitle: string;               // 告警标题
  vendor: string;                   // 厂家
  alarmText: string;                // 告警正文
  clearStatus: string;              // 告警清除状态
  activeAlarmCount: string;         // 活动告警计数
  neAlias: string;                  // 网元别名
  province: string;                 // 省
  alarmRegion: string;              // 告警地区
  county: string;                   // 县
  circuitCode: string;              // 电路代号
  proCategory1: string;             // 一级专业分类
  proCategory2: string;             // 二级专业分类
  logicCategory: string;            // 告警逻辑分类
  logicSubCategory: string;         // 告警逻辑子类
  engineeringStatus: string;        // 告警工程状态
  customerName: string;             // 客户名称
  customerCode: string;             // 客户编码
  productInstance: string;          // 产品实例标识
  serviceAssuranceLevel: string;    // 业务保障等级
  
  // Internal helper for filtering
  businessType: string;
}

export interface ComplaintRecord {
  id: string;
  ticketNo: string;               // 工单编号
  stage: 'T0' | 'T1' | 'T2' | 'Closed' | '待下派' | '待受理' | '处理中' | '待质检' | '已归档'; // 工单状态 (Updated to support Chinese status)
  productInstance: string;        // 产品实例
  circuitCode: string;            // 电路代号
  customerName: string;           // 客户名称
  customerCode: string;           // 客户编码
  serviceAddressA: string;        // A端业务地址
  serviceAddressZ: string;        // Z端业务地址
  complaintContent: string;       // 故障/投诉内容
  faultTime: string;              // 故障时间
  alarmTime?: string;             // 告警时间
  discoveryTime?: string;         // 发现时间
  faultSnapshot?: string;         // 故障快照
  presentation?: string;          // 呈现
  complaintTime: string;          // 投诉时间
  contactPerson: string;          // 投诉人
  contactPhone: string;           // 投诉人电话
  assignee: string;               // 当前处理人/班组
  assigneeCity: string;           // 处理地市
  
  // T1 Fields
  faultResult?: string;           // 故障处理结果
  faultType?: string;             // 故障类型
  faultCause?: string;            // 故障原因
  
  // T2 Fields
  isSatisfied?: string;           // 客户是否满意
  isRecovered?: string;           // 故障是否恢复
  qcRemarks?: string;             // 质检备注

  slaDeadline: string;            // SLA时限
  slaStatus: 'Normal' | 'Warning' | 'Overdue'; // 时限状态
  productType: string;            // 产品类型 (for stats)
  businessCategory: string;       // 业务分类
  ticketSource?: string;          // 工单来源
  aAssuranceLevel?: string;       // A端保障等级
  zAssuranceLevel?: string;       // Z端保障等级
  finishTime?: string;            // 完成时间
  recognitionResult?: string;     // 识别结果
}

export interface GroupOrderRecord {
  id: string;
  isImportant: boolean;
  focusStatus: string; // 重点 e.g., "4/6"
  assignedTasks: number; // 分派任务
  unassignedTickets: number; // 未分派工单
  name: string; // 团单名称
  level: string; // 团单等级 (省级, 地市级, etc.)
  manager: string; // 交付经理
  status: '处理中' | '待受理' | '已撤单' | '已完成' | '待回单'; // 状态
  completionRate: string; // 竣工率
  inflightDispatched: string; // 在途量/派单量 e.g. "2/6"
  remainingTime: string; // 剩余时限 e.g. "3.85天" or "-"
  receiptTime: string; // 网络侧收单时间
  deliveryDeadline: string; // 交付时限
  completionTime: string; // 完成时间
  returnOrderTime?: string; // 回单时间
  groupOrderId?: string; // 团单标识号
  city?: string; // 地市
  county?: string; // 旗县
}

export interface ImportantBusinessRecord {
  id: string;
  importanceLevel?: '重要' | '特别重要'; // 重要等级
  customerName: string;      // 客户名称
  customerCode: string;      // 客户编号
  businessType: string;      // 业务类型
  productInstance: string;   // 产品实例
  aAssuranceLevel: string;   // A端保障等级
  aCity: string;             // A端地市
  aDistrict: string;         // A端区县
  aAddress: string;          // A端地址
  zAssuranceLevel: string;   // Z端保障等级
  zCity: string;             // Z端地市
  zDistrict: string;         // Z端区县
  zAddress: string;          // Z端地址
}

export interface TerminalInventoryRecord {
  id: string;
  sn: string;               // SN码
  deviceType: string;       // 设备类型
  status: string;           // 设备状态
  vendor: string;           // 厂家
  inboundTime: string;      // 入库时间
  outboundTime?: string;    // 出库时间
  removedTime?: string;     // 拆除时间
  importer?: string;        // 导入人
  importerPhone?: string;   // 导入人电话
}

export interface FaultRuleRecord {
  id: string;
  alarmObject: string;       // 告警对象
  resourceInterface: string; // 传输资源界面
  alarmTitle: string;        // 告警标题
  faultResult: string;       // 识别结果
  updateTime: string;        // 最后修改时间
}

export interface FaultEventRecord {
  id: string;
  eventNo: string;            // 事件编号
  groupCustomerCode: string;  // 集团客户编码
  groupCustomerName: string;  // 集团客户名称
  productInstance: string;    // 产品实例标识
  circuitCode: string;        // 电路代号
  recognitionResult: '业务中断' | '保护降级'; // 识别结果
  eventStatus: '活动' | '历史'; // 事件状态
  eventTime: string;          // 事件产生时间
  faultTime: string;          // 故障产生时间
  recoveryTime: string;       // 故障恢复时间
  snapshotUrl: string;        // 事件快照 (URL or base64)
  businessType: string;       // 业务类型
}

export interface FaultSMSConfigRecord {
  id: string;
  productInstance: string;    // 产品实例
  recipients: { name: string; phone: string }[]; // 短信受理人
  businessType: string;       // 业务类型
  customerName: string;       // 客户名称
  customerCode: string;       // 客户编号
}

export interface FilterState {
  productInstance: string;
  circuitCode: string;
  startDate: string;
  endDate: string;
  businessType?: string;
  cityName?: string;
  serviceLevel?: string;
  customerName?: string;
  customerCode?: string;
  ticketNo?: string;
  stage?: string;
  keyword?: string;
  ticketSource?: string;
  faultType?: string;
  businessCategory?: string;
  productType?: string;
  assuranceLevel?: string;
  recognitionResult?: string;
  eventTime?: string;
  eventTimeStart?: string;
  eventTimeEnd?: string;
}

export interface PortraitIndicator {
  id: string;
  name: string;
  algorithm: string;
  weight: number;
  scoringRule: string;
}

export interface PersonnelPortrait {
  id: string;
  name: string;
  city: string;
  score: number;
  timelinessRate: number; // 装机处理及时率
  satisfaction: number;    // 满意度
  qualityInspection: number; // 质检结果
  trendData: { date: string; value: number }[];
}

export interface DeliveryManagerPortrait {
  id: string;
  name: string;
  city: string;
  score: number;
  openingTimelinessRate: number; // 开通及时率
  postUseEvaluation: number;     // 用后即评
  deliveryVolume: number;        // 交付量
  dispatchTimelinessRate: number; // 团单分派及时率
  completionTimelinessRate: number; // 团单报结及时率
  acceptanceTimelinessRate: number; // 团单受理及时率
  trendData: { date: string; value: number }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  attachment?: {
    fileName: string;
    mimeType: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

export interface TrafficOverlimitAnalysisRecord {
  id: string;
  time: string;                     // 时间
  city: string;                     // 地市
  totalBusiness: number;            // 业务总数
  zeroTrafficCount: number;         // 零流量业务数
  zeroTrafficRatio: string;         // 零流量业务占比 (%)
  highBandwidthCount: number;       // 高带宽占用超限业务数
  highBandwidthRatio: string;       // 高带宽占用超限业务占比 (%)
}

export interface TrafficOverlimitDetailRecord {
  id: string;
  collectionTime: string;           // 采集时间
  customerName: string;             // 客户名称
  customerCode: string;             // 客户编号
  province: string;                 // 省份
  city: string;                     // 地市
  broadbandAccount: string;         // 宽带账号
  terminalType: string;             // 终端类型
  terminalMac: string;              // 终端MAC
  terminalSn: string;               // 终端串号
  orderedBandwidth: string;         // 订购业务带宽
  upstreamTraffic: string;          // 上行流量
  downstreamTraffic: string;        // 下行流量
  upstreamRate: string;             // 上行速率
  downstreamRate: string;           // 下行速率
  upstreamUtilization: string;      // 上行带宽利用率
  downstreamUtilization: string;    // 下行带宽利用率
  lastOnlineTime: string;           // 最后一次上线时间
  type: 'zero' | 'high';            // 类型 (零流量/高带宽)
}

export interface OfflineTerminalAnalysisRecord {
  id: string;
  time: string;                     // 时间 (月粒度)
  city: string;                     // 地市
  totalBusiness: number;            // 业务总数
  offlineThreeMonthsCount: number;  // 连续三月终端不在线业务数
  offlineThreeMonthsRatio: string;  // 连续三月终端不在线业务占比 (%)
}

export interface OfflineTerminalDetailRecord {
  id: string;
  collectionTime: string;           // 采集时间
  customerName: string;             // 客户名称
  customerCode: string;             // 客户编号
  broadbandAccount: string;         // 宽带账号
  province: string;                 // 省份
  city: string;                     // 地市
  terminalType: string;             // 终端类型
  terminalMac: string;              // 终端MAC
  terminalSn: string;               // 终端串号
  orderedBandwidth: string;         // 订购业务带宽
  onlineTime: string;               // 上线时间
  offlineTime: string;              // 下线时间
}
