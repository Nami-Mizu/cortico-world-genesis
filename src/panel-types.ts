import type { GenesisLimits, GenesisSpec } from './model.ts';

export interface GenesisPlanetRow {
  name: string;
  kindLabel: string;
  aAU: number;
  periodDays: number;
  climateLabel: string;
  habitable: boolean;
  moons: number;
}

/** 一个能画地图的天体：行星（岩石/气态/冰）或卫星。`key` 供 map 方法定位。 */
export interface GenesisBody {
  key: string; // 行星 'p1'，卫星 'p2-m1'
  label: string; // '1 · 行星 I' / '2 · 卫星 II-a'
  kind: 'terrestrial' | 'isobaric' | 'moon';
  /** 只有星图、还没装监测器：能去，但画不了地图。 */
  charted?: boolean;
}

/** 面板上「此刻」一行：时间、所在地、有没有在移动。 */
export interface GenesisPanelClock {
  time: string;
  where: string | null;
  transit: string | null;
  calendar: string;
}

/** 面板「能量」区：储能、太阳帆数、动能发电机冷却。 */
export interface GenesisPanelPower {
  energyKj: number;
  /** 信用点（交易用；放在这里是为了让顶栏与概览不用再问一次商店）。 */
  credits: number;
  /** 原子打印机剩下的钨（份）。 */
  tungsten: number;
  /** 着陆舱：开局的口粮/水/氧气和还能撑多久。 */
  ship: GenesisPanelShip;
  /** 执照与两条线的存量。 */
  charter: GenesisPanelCharter;
  /** 本地行星电网：有没有整流电塔、离多远、存了多少。 */
  grid: GenesisPanelGrid;
  sails: number;
  /** 人类手摇一次给多少 kJ（随火花塞等级变）。 */
  generatorKj: number;
  /** 火花塞等级 0…3。 */
  sparkPlug: number;
  /** 能量上限（随蓄电池等级变）。 */
  capacityKj: number;
  /** 蓄电池等级 0…3。 */
  battery: number;
  /** 距离下一次可以按，还有多少毫秒；0 表示现在就能按。 */
  generatorCooldownMs: number;
}

/** 着陆舱：一开局就摆在那儿的补给，睡着的人按 20% 消耗。 */
export interface GenesisPanelShip {
  food: number;
  water: number;
  oxygen: number;
  sleepers: number;
  /** 最先见底的那样还能撑多少母星时；没人在睡就是 null。 */
  hoursLeft: number | null;
}

/** 本地行星电网（整流电塔）。 */
export interface GenesisPanelGrid {
  hasTower: boolean;
  /** 是否站在电塔 2,000 km 内（能搬电）。 */
  reachable: boolean;
  storedKj: number;
  capacityKj: number;
  distanceKm: number;
  towerSite: string | null;
}

/** 面板「监测」区：已装监测器的天体、恒星是否解锁。 */
export interface GenesisPanelMonitor {
  monitored: string[];
  starUnlocked: boolean;
  /** 你现在所在的天体；没装监测器时按钮要能就地装。 */
  currentKey: string | null;
  currentMonitored: boolean;
}

/** 面板「农场」区：站点、作物、库存、商店。 */
/** 一座温室的设定点状态（面板滑杆用）。 */
export interface GenesisPanelGreenhouse {
  siteKey: string;
  /** 设定点（℃）；null = 自动模式。 */
  targetC: number | null;
  /** 室外温度（℃）。 */
  ambientC: number | null;
  /** 当前温差（℃）。 */
  deltaC: number;
  /** 室内温度（℃）；断电或超出能力时为 null。 */
  interiorC: number | null;
  /** 是否通电（断电时温室不工作）。 */
  powered: boolean;
  realismCores: number;
  /** 冷库数量（影响保鲜）。 */
  coldStores: number;
}

export interface GenesisPanelFlora {
  credits: number;
  tier: string;
  energyKj: number;
  shopOpen: boolean;
  shopWindow: string;
  shopLevel: number;
  sites: {
    key: string;
    kind: string;
    plants: number;
    ripe: number;
    latDeg: number;
    lonDeg: number;
    /** 这一格的湿度与肥力（0…1，取当前季节的气候）；气态行星或没有地表时为 null。 */
    wetness?: number | null;
    fertility?: number | null;
  }[];
  /** 每株/每群的当前状态（移栽时挑得到具体哪一株）。 */
  crops?: { site: string; id: string; species: string; name: string; stage: string; progress: number; ripe: boolean; health: number; dead: boolean }[];
  inventory: { id: string; name: string; amount: number }[];
  bags: { id: string; name: string; count: number; premium: boolean }[];
  /** 种植盆：不占站点、不能当容器，只同时种 3 粒；通电时人工气候。 */
  planters: { key: string; siteKey: string; plants: number; ripe: number; powered: boolean; ambientC: number | null }[];
}

/** 地图上的一个建筑：内容物、容量、位置，供点击后看详情/拆除/走过去。 */
export interface GenesisPanelStructure {
  id: string;
  kind: string;
  label: string;
  siteKey: string;
  latDeg: number;
  lonDeg: number;
  usedKg: number;
  capKg: number;
  contents: { name: string; kg: number }[];
  /** 交易终端自动卖的资源 id（默认尾矿）。 */
  sellTarget?: string;
  /** 交易终端自动买的种子物种；不设就不买。 */
  buySpecies?: string;
  /** 终端种子缓冲里现在有几袋（只有交易终端有）。 */
  bags?: number;
  /** 容器在这颗行星上的槽位号（面板里显示 0、1、2…）。 */
  slot?: number;
  /** 仓储终端把货喂给哪座交易终端。 */
  feeds?: string;
  /** 仓储终端的编排表（多行文本）。 */
  routesText?: string;
  /** 机械臂的一行摘要：入 → 出 · 搬什么 · 速率。 */
  armText?: string;
  /** 机械臂接成了环（面板上给个黄条）。 */
  armCycle?: boolean;
  /** 值班终端的一行摘要：派几份人手、收成去哪、管几个站点、现在干不干活。 */
  dutyText?: string;
  /** 居所室内温度（℃）；只有居所有。 */
  interiorC?: number;
  /** 居所温度对人来说合不合适：ok / 太冷 / 太热。 */
  comfort?: 'ok' | 'hot' | 'cold';
}

/** 正在施工的工程（只拦新工程，其余照常）。 */
export interface GenesisPanelBuild {
  kind: string;
  label: string;
  siteKey: string;
  leftHomeHours: number;
}

/** 执照与两条线的存量（2.4.0）。 */
export interface GenesisPanelCharter {
  /** 还没选就是 null。 */
  charter: 'tourism' | 'tech' | null;
  /** 0–100，只有旅游线会长。 */
  reputation: number;
  /** 只有科技线会长。 */
  compute: number;
  /** 科技线的员工数与上限。 */
  staff: number;
  staffCap: number;
  /** 昨日到港游客（旅游线）。 */
  visitors: number;
  /** 时间倍速（1–200）。 */
  speed: number;
  /** 1 倍速下「一个母星时 = 多少现实分钟」。 */
  baseMinutesPerHomeHour: number;
  /** 住得下（温度合适、通电）的访客床位。 */
  lodgeBeds: number;
  /** 住得下的员工床位。 */
  housingBeds: number;
  /** 因为太热/太冷而白建的住所。 */
  tempBlocked: string[];
  /** 当前倍速下同一件事。 */
  minutesPerHomeHour: number;
  /** 停泊位 / 床位 / 招募站 / 晶圆厂数量，面板直接拿去说人话。 */
  docks: number;
  lodges: number;
  offices: number;
  fabs: number;
  /** 正在建的奇观（一次只有一座）。 */
  wonder: { id: string; label: string; progress: number } | null;
  /** 已经落成的奇观。 */
  wonders: string[];
}

/** 动物划的领地（面板画圆环用）。 */
export interface GenesisPanelTerritory {
  species: string;
  label: string;
  latDeg: number;
  lonDeg: number;
  radiusKm: number;
}

/** 面板一次拿到的全部数据；`locked` 为真时说明已经创世，界面不再给表单。 */
export interface GenesisPanelState {
  /** 读档失败的原因（null = 正常）。面板用它区分「没创世」与「存档坏了」。 */
  loadError?: string | null;
  locked: boolean;
  card: string | null;
  planets: GenesisPlanetRow[];
  bodies: GenesisBody[];
  limits: GenesisLimits;
  defaults: GenesisSpec;
  game: GenesisPanelClock | null;
  power: GenesisPanelPower | null;
  monitor: GenesisPanelMonitor | null;
  flora: GenesisPanelFlora | null;
  greenhouses?: GenesisPanelGreenhouse[];
  /** 地图上要标的建筑（已完成）。 */
  structures: GenesisPanelStructure[];
  /** 正在施工的工程。 */
  builds: GenesisPanelBuild[];
  /** 你此刻的经纬度（旅行输入与「原地建造」用）。 */
  location: { bodyKey: string; latDeg: number; lonDeg: number } | null;
  /** 能同时开工的工程数（子代理等级决定）。 */
  buildSlots: number;
  /** 队列是不是满了（满了就该提示去修子代理）。 */
  buildQueueFull: boolean;
  /** 唤醒协议：三章 12 条，谁做完了、谁还差多少。 */
  protocol: GenesisPanelProtocol | null;
  /** 居所：住了几个、还能撑几小时。 */
  habitats: GenesisPanelHabitat[];
  /** 今天的基因订单。 */
  orders: GenesisPanelOrder[];
  /** 动物领地（地表页画圆环用）。 */
  territories?: GenesisPanelTerritory[];
}

export interface GenesisPanelProtocolTask {
  id: string;
  chapter: string;
  title: string;
  done: boolean;
  progress: string;
}

export interface GenesisPanelProtocol {
  tasks: GenesisPanelProtocolTask[];
  done: number;
  total: number;
  complete: boolean;
  awakened: boolean;
}

/** 「协议」面板：按章分组，外加居所里的人与还能撑多久。 */
export interface GenesisProtocolPanel {
  chapters: Array<{
    id: number;
    title: string;
    tasks: GenesisPanelProtocolTask[];
    done: number;
    total: number;
  }>;
  done: number;
  total: number;
  complete: boolean;
  /** 前 11 条都完成（第 12 条「叫醒」本身就是结果，不参与门槛）。 */
  ready: boolean;
  awakened: boolean;
  habitat: {
    awake: number;
    dormant: number;
    food: number;
    water: number;
    oxygen: number;
    hoursLeft: number;
  } | null;
  /** 人口：常住 / 容量 / 舱里还剩多少人 / 每 20 人一个「人手」。 */
  /** 【再创世】：带着档案去下一张地图。blockers 为空才点得动。 */
  recreate: { blockers: string[]; ready: boolean; seed: string; starMass: number };
  population?: {
    population: number;
    capacity: number;
    sleepers: number;
    birthHours: number;
    laborUnits: number;
  } | null;
}

export interface GenesisPanelHabitat {
  id: string;
  nickname: string;
  awake: number;
  dormant: number;
  food: number;
  water: number;
  oxygen: number;
  hoursLeft: number;
}

export interface GenesisPanelOrder {
  id: string;
  species: string;
  gene: string;
  min: number;
  kg: number;
  reward: number;
}

interface GenesisMapBase {
  name: string;
  grid: { lon: number; lat: number };
  /** 行是纬度（-90 → +90），列是经度（-180 → +180），群系 id。 */
  biome: number[][];
  meanTempC: number;
  /** 群系改造中的格子；`p` 是进度 0…1，`targetBiome` 是它改完之后的样子。 */
  terra?: Array<{ i: number; j: number; p: number; targetBiome: number }>;
  /** 被采掘挖薄的格子；`v` 是疤 0…1（地图上叠灰褐）。 */
  scar?: Array<{ i: number; j: number; v: number }>;
}

/** 岩石行星的地图数据（按需取，避免 state 一次背全部网格）。 */
export interface GenesisTerrestrialMap extends GenesisMapBase {
  kind: 'terrestrial';
  minElevationM: number;
  maxElevationM: number;
  oceanFraction: number;
  /** 与 biome 同形状，单位米（海洋为负）。 */
  elevationM: number[][];
}

/** 气态/冰巨星的「可活动区域」：等气压面，群系 = 风暴强度。 */
export interface GenesisIsobaricMap extends GenesisMapBase {
  kind: 'isobaric';
  minWindMps: number;
  maxWindMps: number;
}

/** 卫星地表：固定「卫星」群系。 */
export interface GenesisMoonMap extends GenesisMapBase {
  kind: 'moon';
}

export type GenesisSurfaceMap = GenesisTerrestrialMap | GenesisIsobaricMap | GenesisMoonMap;

/** 面板「创世」按钮提交的四个数 + 两个名字；全部必填，越界由 World 侧拒绝。 */
export interface GenesisDraft {
  /** 数字，或任意一句话（服务端按字符串哈希）。 */
  seed: number | string;
  starMass: number;
  planetCount: number;
  maxMoons: number;
  starName: string;
  homeName: string;
}

/** 升级面板：一件可修的东西需要哪些材料、现在有多少。 */
export interface GenesisUpgradeMaterial {
  id: string;
  name: string;
  needKg: number;
  haveKg: number;
}

/** 升级面板的一张卡（机动核心、射电望远镜阵列）。 */
export interface GenesisUpgradeCard {
  id: string;
  label: string;
  status: 'ready' | 'repairing' | 'broken' | 'maxed';
  costKj: number;
  buildHours: number;
  leftHomeHours: number;
  materials: GenesisUpgradeMaterial[];
  canRepair: boolean;
  blockers: string[];
  flavor: string;
  /** 望远镜这类分级升级：当前等级、上限、当前营业窗口与限额系数。 */
  level?: number;
  maxLevel?: number;
  window?: string;
  limitFactor?: number;
  /** 下一级能带来什么（满级时写满级收益）。 */
  benefits?: string;
}

export interface GenesisUpgradeState {
  locked: boolean;
  energyKj: number;
  /** 电池上限（顶栏按它算百分比）。 */
  capacityKj: number;
  cards: GenesisUpgradeCard[];
}

/** 商店页签的一行货（买或卖）。 */
export interface GenesisShopRow {
  id: string;
  name: string;
  /** 已格式化好的一行价格，比如「1,200 kJ」「30 信用点/kg」。 */
  priceLabel: string;
  /** 今天还能买卖多少。 */
  limitLabel: string;
  note?: string;
  /** 卖出时：我手里有多少（kg 或份）。 */
  held?: number;
  /** 这一行今天卖的具体物种（种子行才有）。 */
  species?: string;
}

/** 商店页签的一张基因订单。 */
export interface GenesisShopOrder {
  id: string;
  label: string;
  note: string;
}

/** 「商店」页签：开没开张、货架、收购价、订单。 */
export interface GenesisShopPanel {
  open: boolean;
  /** 「12:00–23:00 营业」这类说明；关张时说明为什么。 */
  window: string;
  /** 离下次开张还有几个母星时（开张时为 0）。 */
  nextOpenHours: number;
  level: number;
  credits: number;
  energyKj: number;
  capacityKj: number;
  tungsten: number;
  buyables: GenesisShopRow[];
  sellables: GenesisShopRow[];
  orders: GenesisShopOrder[];
  /** 关张时给一句总说明。 */
  closedNote?: string;
}
