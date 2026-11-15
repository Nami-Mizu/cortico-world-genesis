/**
 * 游戏状态机：真实时间轴、所在地、移动/航行、观星窗口、天体命名。
 *
 * 时间按现实时间推进：内部存「创世时刻的现实毫秒」+「1 星球时 = 多少现实毫秒」，
 * 任意时刻的星球时都由 nowMs 现算，所以移动/航行不用手动推进时钟——
 * 出发时记下 arriveRealMs，tick 收到 nowMs ≥ arriveRealMs 就结算并推「已到达」事件。
 *
 * 所有函数都是纯函数：给定同一个星系、同一串操作与同一组时间戳，结果完全确定。
 */
import type { HomeCalendar } from './clock.ts';
import { calendarFor, formatTime, mostHabitable, realDaysFor } from './clock.ts';
import type { Planet, StarSystem, TerrestrialSurface } from './model.ts';
import { BIOME_LABELS } from './model.ts';
import { distanceAU, distancePointToSegment, orbitOf, positionAt, type Vec2 } from './orbit.ts';
import {
  COUNTER_COST_KJ,
  DEVICE_TIME_COST_HOME_HOURS,
  GENERATOR_COOLDOWN_MS,
  MONITOR_COST_KJ,
  SAIL_COST_KJ,
  SAIL_KJ_PER_HOME_HOUR,
  SAIL_MAX_PER_PLANET,
  type Sail,
} from './power.ts';
import { hashSeed } from './rng.ts';
import {
  COLD_STORE_CAPACITY_KG,
  COLD_STORE_ROT_FACTOR,
  COLD_STORE_UPKEEP_KJ_PER_HOUR,
  CYLINDER_COST_CREDITS,
  INERT_MAX_OXYGEN,
  INERT_MIN_FRACTION,
  INERT_ROOM_CAPACITY_KG,
  INERT_ROOM_ROT_FACTOR,
  rotFractionPerHour,
  cylinderPriceCredits,
  DRIED_FOOD_RATIO,
  DRIED_ROT_HOURS,
  DRY_KJ_PER_KG,
  PANTRY_BASE_KG,
  REALISM_CORE_COST_KJ,
  REALISM_CORE_UPKEEP_KJ_PER_HOUR,
  rotHoursFor,
  SETPOINT_KJ_PER_DEGREE_HOUR,
  SETPOINT_MAX_C,
  SETPOINT_MIN_C,
  EXTRACTOR_KJ_PER_HOUR,
  EXTRACTOR_MIN_O2_FRACTION,
  BIRTH_HEALTHY_HOME_HOURS,
  EXTRACTOR_OXYGEN_PER_HOUR,
  FULL_HABITAT_DEMAND,
  FULL_HABITAT_DORMANT_DEMAND,
  HABITAT_CAP,
  HABITAT_UPKEEP_KJ_PER_HOUR,
  KILN_ASH_PER_BIOMASS,
  KILN_BIOMASS_PER_HOUR,
  KILN_CHARCOAL_PER_BIOMASS,
  KILN_KJ_PER_HOUR,
  LABOR_PER_HOUR,
  lifeDemand,
  O2_PER_BOTTLE,
  OXYGEN_PER_KG_GROWTH,
  PEOPLE_PER_HABITAT,
  SHIP_CREW,
  PUMP_WATER_PER_HOUR,
  PURIFIER_CHARCOAL_PER_HOUR,
  PURIFIER_DRINK_PER_HOUR,
  PURIFIER_KJ_PER_HOUR,
  PURIFIER_RAW_WATER_PER_HOUR,
  LABOR_YIELD_BONUS,
  LABOR_YIELD_BONUS_MAX,
  RESIDENTS_PER_LABOR,
  SEA_WATER_COAST_KM,
  SEA_WATER_FACTOR,
  SEALER_KJ_PER_HOUR,
  SEALER_OXYGEN_PER_HOUR,
  SITE_STORE_CAPACITY_KG,
  WAREHOUSE_ROT_FACTOR,
  type AtmosphereReading,
} from './life.ts';
import { GENE_LABELS, orderText, ordersForDay, type Order } from './orders.ts';
import { protocolComplete, protocolDone, protocolStatus, PROTOCOL_TASKS } from './protocol.ts';
import { bodyHoursFromHome, daylightHomeHoursAt, moonSunBody, planetSunBody, sunPosition, type SunBody, type SunPosition } from './sun.ts';
import {
  addNutrients,
  ALGAE_FERTILIZER_K,
  ALGAE_FERTILIZER_KG,
  ALGAE_FERTILIZER_KJ,
  ALGAE_FERTILIZER_N,
  ASH_NUTRIENTS_PER_KG,
  ASH_PER_KG,
  BAG_PACKAGING_KG,
  bagWeightKg,
  BREED_CROSS_HOURS,
  BREED_CROSS_KJ,
  BREED_CROSS_SEEDS,
  BREED_MIN_PROGRESS,
  BREED_SELF_HOURS,
  BREED_SELF_KJ,
  BREED_SELF_SEEDS,
  COMPOST_NUTRIENTS_PER_KG,
  crossedGenes,
  growthFactor,
  removeNutrients,
  advancePlant,
  burnKj,
  ARTIFICIAL_DEADBAND_C,
  geneHash,
  harvestPlant,
  newPlant,
  NUTRIENT_DRAW_PER_HOUR,
  NUTRIENT_IDS,
  NUTRIENT_NEEDS,
  N_FIXATION_PER_COLONY_HOUR,
  selfedGenes,
  randomGenes,
  premiumGenes,
  RESOURCE_LABELS,
  SPECIES,
  seedId,
  type Genes,
  type PlantRecord,
  type ResourceId,
  type SpeciesId,
} from './flora.ts';
import {
  climateAt,
  endowmentFor,
  isLand,
  MAX_SITES_PER_CELL,
  nutrientsLine,
  sampleCell,
  siteKeyOf,
  siteRefusal,
  type Site,
  cellIndexFor,
} from './site.ts';
import {
  cellsInRadius,
  effectiveBiome,
  terraClimate,
  terraKey,
  terraProgress,
  terraSummary,
  TERRA_CELL_KJ_PER_HOUR,
  TERRA_CONVERT_HOME_HOURS,
  TERRA_REVERT_HOME_HOURS,
  type TerraMap,
} from './terra.ts';
import {
  BUY_GOODS,
  buyDailyLimitFor,
  buyPriceCredits,
  creditTier,
  dailyLimitFor,
  dayIndexOf,
  randomSeedPriceKj,
  SEEDS_PER_BAG,
  sellPrice,
  sellPriceTable,
  SELL_GOODS,
  shopOpen,
  shopWindowText,
  SPARK_PLUG_LEVELS,
  SPARK_PLUG_MAX_LEVEL,
  BATTERY_LEVELS,
  BATTERY_MAX_LEVEL,
  BATTERY_BASE_CAPACITY_KJ,
  batteryCapacityKj,
  batteryLevel,
  nextBatteryLevel,
  nextSparkPlugLevel,
  sparkPlugLevel,
  sparkPlugOutputKj,
  TELESCOPE_LEVELS,
  TELESCOPE_MAX_LEVEL,
  telescopeLevel,
  telescopeLimitFactor,
  SUBAGENT_LEVELS,
  SUBAGENT_MAX_LEVEL,
  subagentLevel,
  nextSubagentLevel,
  buildSlotsFor,
  BASE_BUILD_SLOTS,
  type BuyId,
  type BatteryLevelSpec,
  type SparkPlugLevelSpec,
  type TelescopeLevelSpec,
  type SubagentLevelSpec,
} from './trade.ts';
import {
  AU_PER_SOLAR_RADIUS,
  STARGAZE_VISIBILITY_THRESHOLD,
  STARGAZE_WINDOW_PLANET_HOURS,
  stargaze,
  type StargazeResult,
} from './stargaze.ts';
import { planetVisibility, terrainPatch, terrainPatchText, type TerrainBody } from './terrain.ts';
import {
  interstellarPlanetHours,
  surfaceDistanceKm,
  surfaceMoveHoursFor,
  surfacePathCheck,
  MAX_WALK_ELEVATION_M,
} from './travel.ts';

const R_EARTH_KM = 6371;

/** 一现实小时 = 多少毫秒。 */
export const REAL_MS_PER_HOUR = 3_600_000;

/** 航线净空：航线离其他天体中心小于这个距离就算「撞上了」（AU）。 */
export const PATH_CLEARANCE_AU = 0.002;

export interface Location {
  /** 所在行星序号（1 起）。 */
  planetIndex: number;
  /** 在卫星上时是卫星序号（1 起）。 */
  moonIndex?: number;
  latDeg: number;
  lonDeg: number;
}

export interface Transit {
  kind: 'surface' | 'interstellar';
  from: Location;
  to: Location;
  /** 出发时刻（现实毫秒）。 */
  departRealMs: number;
  /** 预计抵达时刻（现实毫秒）。 */
  arriveRealMs: number;
  distanceKm?: number;
  distanceAU?: number;
}

export interface StargazeRecord {
  atRealMs: number;
  untilRealMs: number;
  visibleKeys: string[];
}

export interface BodyNames {
  star: string;
  /** 天体 key → Agent 起的名字。 */
  bodies: Record<string, string>;
}

export interface GameState {
  calendar: HomeCalendar;
  /** 母星是第几颗行星（1 起）。 */
  homePlanetIndex: number;
  /** 创世时刻（现实毫秒），对应 0 年 0 日 0 时。 */
  epochRealMs: number;
  /** 1 星球时 = 多少现实毫秒（= 自转周期 / 24，可按时间加速）。 */
  msPerPlanetHour: number;
  location: Location | null;
  transit: Transit | null;
  stargaze: StargazeRecord | null;
  /** 去过的天体 key。 */
  visited: string[];
  /** 商人卖过的星图：拿到就能直接飞去，不用等观星窗口（厚大气行星的唯一出路）。 */
  charts?: string[];
  names: BodyNames;
  /** 开局经纬度：母星时间 0 时被校准成这里的午夜。 */
  startLonDeg: number;
  /** 当前能量（kJ）。 */
  energyKj: number;
  /** 已部署的太阳能帆。 */
  sails: Sail[];
  /** 部署了环境监测器的天体 key。 */
  monitors: string[];
  /** 部署了凌日计数器的天体 key。 */
  counters: string[];
  /** 上次结算太阳能帆的时刻（母星时）。 */
  lastSettledHomeHours: number;
  /** 上次结算作物生长的时刻（母星时）。 */
  lastFloraHomeHours: number;
  /** 群系改变器改过的格子：`i:j` → 进度。 */
  terra: TerraMap;
  /** 上次结算群系改造的时刻（母星时）。 */
  lastTerraHomeHours: number;
  /** 采掘留下的疤：`pN:i:j` → 0…1（0 干净，1 挖空）。只增不减（群系改变器能慢慢复垦）。 */
  scar: Record<string, number>;
  /** 上次结算「疤往下游扩散」的时刻（母星时）。 */
  lastScarHomeHours: number;
  lastIndustryHomeHours?: number;
  /** 交易终端上次自动交易的那一天（母星日序号），保证一天只跑一次。 */
  lastAutoTradeDay: number;
  /** 上次结算机械臂的时刻（母星时）。 */
  lastArmsHomeHours: number;
  /** 上次报「机械臂环路」是哪一天（同一组环一天只报一次）。 */
  lastCycleWarnDay: number;
  /** 上次按动能发电机的现实时刻（冷却用）。 */
  lastGeneratorRealMs: number;
  /** 累计「世界真实运行」的毫秒数：面板关掉/服务停了，时间不走（离线暂停）。 */
  activeMs: number;
  /** 信用点余额（商人收购给，买高级货花）。 */
  credits: number;
  /** 背包：只装身上带着的（上限 50 kg）。 */
  inventory: Record<string, number>;
  /** 仓库与火箭里的东西：建筑 id → 资源 → kg。 */
  stores: Record<string, Record<string, number>>;
  /** 站点（每格最多 3 个）。 */
  sites: Site[];
  /** 站点 key → 那里的作物。 */
  plants: Record<string, PlantRecord[]>;
  /** 建筑（温室核心 / 群系改变器）。 */
  structures: StructureRecord[];
  /** 正在施工的工程：施工期间只拦「再开新工程」，其余照常。 */
  builds: PendingBuild[];
  /** 船上的升级（修好之后解锁对应能力）。 */
  upgrades: Upgrades;
  /** 手里的种子：一袋 5 粒。 */
  seedBags: SeedBag[];
  /** 累计买过多少袋随机种子（阶梯价用）。 */
  seedsPurchased: number;
  /** 当天已卖/已买：`day:sell:biomass` 之类 → 数量。 */
  daily: { day: number; sold: Record<string, number>; bought: Record<string, number> };
  /** 站点 key → 上次采样是第几天（一天一次）。 */
  surveyed: Record<string, number>;
  /** 站点堆场：站点 key → 资源 → kg（生产链与居所都从这里取放，每站 1,000 kg）。 */
  siteStores: Record<string, Record<string, number>>;
  /** 带回来的异星生命样本（份）。 */
  samples: number;
  /** 上次结算生命维持的时刻（母星时）。 */
  lastLifeHomeHours: number;
  /**
   * 原子打印机的原料：开局船上带着 100 份钨，用完只能挖或买。
   * 每座建筑按「份」消耗（见 `BUILD_SPECS[kind].tungsten`）。
   */
  tungsten: number;
  /** 行星电网：`p<行星序号>` → 存着的 kJ（要先有【整流电塔】）。 */
  grids: Record<string, number>;
  /** 上次结算电网的时刻（母星时）。 */
  lastGridHomeHours: number;
  /**
   * 挖掉的钨：`p<行星序号>:<行>:<列>` → 已挖的份数。
   * 表面每格的原始含量在 `system.json` 里（0…500），挖一点少一点。
   */
  mined: Record<string, number>;
  /** 上次用质谱仪扫描的时刻（母星时）。 */
  lastSpectrometerHomeHours: number;
  /** 已交付的订单：order id → 第几天。 */
  ordersDone: Record<string, number>;
  /** 叫醒人类之后为 true：协议全完成才会发生。 */
  awakened: boolean;
  /** 还在休眠舱里、没被叫醒的人（全船只带 20 个乘客）。 */
  sleepers?: number;
  /** 健康小时的累积：攒满 192 母星时就添一个人，断供就清零。 */
  birthHours?: number;
  /** 上次结算人手的时刻（母星时）。 */
  lastLaborHomeHours?: number;
}

export interface Upgrades {
  /**
   * 机动核心：迫降时烧坏了。
   * - broken：过不了海，也进不了气态/冰巨星的大气层；
   * - ready：过海 ×0.3 速度，可以降落在气态/冰巨星的等气压面上。
   */
  mobilityCore: 'broken' | 'ready';
  /**
   * 射电望远镜阵列：0 = 没有商店；1…3 = 能联系到星际商人。
   * 等级决定营业窗口与每日限额（见 `trade.ts` 的 `TELESCOPE_LEVELS`）。
   */
  telescope: number;
  /**
   * 火花塞：0…3，决定人类手摇动能发电机一次给多少 kJ（5 → 15 → 30 → 50）。
   * 见 `trade.ts` 的 `SPARK_PLUG_LEVELS`。
   */
  sparkPlug: number;
  /**
   * 蓄电池：0…3，决定能量上限（100,000 → 300,000 → 700,000 → 1,500,000 kJ）。
   * 见 `trade.ts` 的 `BATTERY_LEVELS`。
   */
  battery: number;
  /**
   * 子代理：0…3，每级多一条并行施工队列（1 → 2 → 3 → 4）。
   * 迫降时只剩一条能动的施工臂，修好一组子代理就多一条。
   */
  subagent: number;
  /**
   * 蓝图结构优化：0 = 没优化，1 = 所有建筑的钨消耗 −25%（向下取整，最少 1 份）。
   * 用钨换钨：建得少就是亏，建得多才赚。
   */
  blueprints: number;
  /**
   * 质谱仪：0 = 没有，1 = 装好了。装好后能在脚下扫描 2,000 km 内的钨含量，
   * 找富矿再放采矿机。
   */
  spectrometer: number;
}

export interface StructureRecord {
  id: string;
  kind:
    | 'greenhouse'
    | 'biome_changer'
    | 'pump'
    | 'warehouse'
    | 'drone_cluster'
    | 'rocket'
    | 'kiln'
    | 'purifier'
    | 'sealer'
    | 'atmo_extractor'
    | 'habitat'
    | 'mutation_room'
    | 'cold_store'
    | 'inert_room'
    | 'miner'
    | 'rectifier'
    | 'terminal'
    | 'storage_terminal'
    | 'arm'
    | 'planter'
    | 'carrier'
    | 'wind'
    | 'fire'
    | 'converter'
    | 'duty';
  siteKey: string;
  planetIndex: number;
  builtHomeHours: number;
  /** 值班终端：绑哪座居所（这座居所的人在这座终端底下干活）。 */
  habitat?: string;
  /** 值班终端：收成与种子/肥料都从这个容器进出（"一个仓库"）。 */
  store?: string;
  /** 值班终端：这份人手负责的站点（最多 DUTY_MAX_SITES 个，全部在 5 km 内）。 */
  sites?: string[];
  /** 仓储终端编排表：下标 = 容器槽位（slot），值 = 优先级（0 最低，越大越先取；-1/缺省 = 不参与自动交易）。 */
  routes?: number[];
  /** 仓储终端把编排好的货交给哪一座交易终端。 */
  feeds?: string;
  /** 容器在这颗行星上的槽位号（建好时自动分配，面板上显示成 0、1、2…）。 */
  slot?: number;
  /** 温室核心上装的气候核心：最多一个制冷、一个制热，另外可装任意座拟真环境核心。 */
  cores?: Array<'cooler' | 'heater' | 'realism'>;
  /** 设定点温室的目标温度（℃）；不设就是「自动」——夹到 0–28℃。 */
  targetTempC?: number;
  /** 无人机集群只服务同一个仓库（按仓库的 id 记）。 */
  serves?: string;
  /** 火箭最近一次落在哪颗行星上（星际航行时跟着玩家走）。 */
  dockedPlanetIndex?: number;
  /** 居所里醒着的人数（其余在休眠舱里）。 */
  awake?: number;
  /** 交易终端每天自动卖的资源（默认尾矿）。 */
  sellTarget?: string;
  /** 交易终端每天自动买的种子物种；不设就不买。 */
  buySpecies?: SpeciesId;
  /** 机械臂：从哪几个容器取货（按槽位从小到大依次取）。 */
  inputs?: string[];
  /** 机械臂：把货搬到哪个容器。 */
  output?: string;
  /** 机械臂：只搬这些资源（白名单）；不设 = 全搬。 */
  items?: string[];
  /** 上次报「环路」是哪一天（同一组环一天只报一次）。 */
  lastCycleWarnDay?: number;
  /** 空天母舰：住着几个人（最大 CARRIER_CREW_CAP）。 */
  crew?: number;
  /** 空天母舰：当前停在哪个高度档（0 下沉 / 1 巡航 / 2 上浮）。 */
  altitude?: number;
  /** 大气提取器：抽哪种气（`oxygen` / `ammonia` / `methane`）；不设就按氧气。 */
  extractGas?: string;
  /** 气液转换机：配方白名单（`ammonia` / `methane` / `oxygen`）。 */
  recipes?: string[];
  /** 火力发电站：灰仓里存了多少 kg 灰。 */
  ashKg?: number;
  /** 空天母舰：停在云层上的哪一格（落成时由 id 定下，之后不变）。 */
  latDeg?: number;
  lonDeg?: number;
}

export type BuildKind =
  | StructureRecord['kind']
  | 'mobility_core'
  | 'telescope'
  | 'spark_plug'
  | 'battery'
  | 'subagent'
  | 'blueprints'
  | 'spectrometer';

export interface PendingBuild {
  id: string;
  kind: BuildKind;
  siteKey: string;
  planetIndex: number;
  /** 开工时刻（母星时）。 */
  startedHomeHours: number;
  /** 完工时刻（母星时）：到了这里才真正变成建筑。 */
  completeHomeHours: number;
  serves?: string;
  dockedPlanetIndex?: number;
  /** 交易终端自动卖的资源（只在 terminal 上有意义）。 */
  sellTarget?: string;
  /** 交易终端自动买的种子物种（只在 terminal 上有意义）。 */
  buySpecies?: SpeciesId;
  /** 仓储终端把编排好的货交给哪一座交易终端（只在 storage_terminal 上有意义）。 */
  feeds?: string;
  /** 机械臂的输入容器 / 输出容器 / 白名单。 */
  inputs?: string[];
  output?: string;
  items?: string[];
  /** 值班终端绑的居所、仓库与站点。 */
  habitat?: string;
  store?: string;
  sites?: string[];
  /** 大气提取器抽哪种气（oxygen / ammonia / methane）。 */
  extractGas?: string;
  /** 气液转换机启用的配方 id 列表。 */
  recipes?: string[];
}

export interface SeedBag {
  id: string;
  species: SpeciesId;
  genes: Genes;
  premium: boolean;
  count: number;
  /** 放在哪个交易终端的缓冲里；没有这个字段说明在背包里。 */
  at?: string;
}

export interface GameEvent {
  type: string;
  text: string;
}

export interface StartOptions {
  /** 恒星名（开局时定，存档沿用）。 */
  starName: string;
  /** 母星名（Agent 开局起的名）。 */
  homeName: string;
  /** 时间加速倍数：1 = 真实时间（默认）。测试/demo 可以调大。 */
  timeScale?: number;
  /** 创世种子：只用来决定初始应急种子包的基因（同一个世界永远一样）。 */
  seed?: number | string;
}

/**
 * 坠毁时货舱里剩下的应急种子：三种各一袋，每种 5 粒。
 *
 * 为什么要三种而不是「一袋随机」——lv1 望远镜要硅质壳 2 kg（只有硅藻产）+ 纤维 1.5 kg
 * （只有苔藓产），随机一袋很可能两种都给不了，开局就死锁；速生草则是第一桶生物质，
 * 用来烧出最初的电。基因仍然随机，所以每个种子开出来的世界不一样。
 */
export function starterBags(seed: number | string = 0): SeedBag[] {
  const species: SpeciesId[] = ['diatom', 'moss', 'grass'];
  return species.map((id) => ({
    id: `starter-${id}`,
    species: id,
    genes: randomGenes(id, hashSeed(`starter:${seed}:${id}`)),
    premium: false,
    count: 5,
  }));
}

export function bodyKeyOf(loc: Location): string {
  return loc.moonIndex ? `p${loc.planetIndex}-m${loc.moonIndex}` : `p${loc.planetIndex}`;
}

export function homeKey(state: GameState): string {
  return `p${state.homePlanetIndex}`;
}

export function msPerPlanetHourFor(cal: HomeCalendar): number {
  return cal.realHoursPerPlanetHour * REAL_MS_PER_HOUR;
}

/** 现在（现实毫秒）对应的「自创世起的星球时」。 */
export function nowPlanetHours(state: GameState, nowMs: number): number {
  return Math.max(0, (nowMs - state.epochRealMs) / state.msPerPlanetHour);
}

export function timeText(state: GameState, nowMs: number): string {
  return formatTime(state.calendar, nowPlanetHours(state, nowMs));
}

/**
 * 没命名过的天体，给模型看的是一个混淆编号（不是「第 X 行星」那种带序号的叫法）。
 * 由来：恒星星名 + 天体 key 的哈希——固定、可复现，旧存档不需要迁移就能自愈；
 * 不同世界之间不会撞号，抹掉序号也抹掉了「离恒星远近」的暗示。
 */
export function bodyProbeId(state: GameState, key: string): string {
  const h = hashSeed(`probe:${state.names.star}:${key}`);
  return h.toString(36).padStart(6, '0').slice(-4);
}

/** 没命名过的天体在 Agent 眼里是什么。 */
export function displayName(state: GameState, key: string): string {
  if (key === 'star') return state.names.star;
  const named = state.names.bodies[key];
  if (named) return named;
  return `【未抵星体-${bodyProbeId(state, key)}】`;
}

/** 开局站位：随机但确定，确保落在陆地上（海洋 = 群系 0）。 */
function spawnOnLand(p: Planet): { latDeg: number; lonDeg: number } {
  const s = p.surface;
  if (s.kind !== 'terrestrial') return { latDeg: 0, lonDeg: 0 };
  const rows = s.biome.length;
  const cols = s.biome[0]?.length ?? 0;
  const land: Array<[number, number]> = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      if (s.biome[j]?.[i] !== 0) land.push([j, i]);
    }
  }
  const pick = land.length ? land[hashSeed(`${p.id}:spawn`) % land.length]! : [Math.floor(rows / 2), Math.floor(cols / 2)];
  return {
    latDeg: -90 + (pick[0] + 0.5) * (180 / rows),
    lonDeg: -180 + (pick[1] + 0.5) * (360 / cols),
  };
}

/** 开局：把 Agent 放在最宜居行星（母星）的陆地上，午夜，记为 0 年 0 日 0 时。 */
export function startGame(system: StarSystem, opts: StartOptions, nowMs: number): GameState {
  const home = mostHabitable(system);
  const homePlanetIndex = system.planets.findIndex((p) => p.id === home.id) + 1;
  const cal = calendarFor(home, opts.homeName);
  const scale = opts.timeScale && opts.timeScale > 0 ? opts.timeScale : 1;
  const spawn = spawnOnLand(home);
  return {
    calendar: cal,
    homePlanetIndex,
    epochRealMs: nowMs,
    msPerPlanetHour: msPerPlanetHourFor(cal) / scale,
    location: { planetIndex: homePlanetIndex, ...spawn },
    transit: null,
    stargaze: null,
    visited: [home.id],
    charts: [],
    names: { star: opts.starName, bodies: { [home.id]: opts.homeName } },
    startLonDeg: spawn.lonDeg,
    energyKj: startupEnergyKj(opts.seed),
    sails: [],
    monitors: [],
    counters: [],
    lastSettledHomeHours: 0,
    lastFloraHomeHours: 0,
    terra: {},
    lastTerraHomeHours: 0,
    scar: {},
    lastScarHomeHours: 0,
    lastIndustryHomeHours: 0,
    lastAutoTradeDay: -1,
    lastArmsHomeHours: 0,
    lastCycleWarnDay: -1,
    lastGeneratorRealMs: nowMs - GENERATOR_COOLDOWN_MS,
    activeMs: nowMs,
    credits: 0,
    inventory: { biomass: 0 },
    stores: { [SHIP_POD_ID]: { ...POD_STOCK } },
    sites: [],
    plants: {},
    structures: [],
    builds: [],
    upgrades: {
      mobilityCore: 'broken',
      telescope: 0,
      sparkPlug: 0,
      battery: 0,
      subagent: 0,
      blueprints: 0,
      spectrometer: 0,
    },
    tungsten: TUNGSTEN_START,
    grids: {},
    lastGridHomeHours: 0,
    mined: {},
    // 开局就能扫一次：把上次扫描推到冷却窗口之前。
    lastSpectrometerHomeHours: -SPECTROMETER_COOLDOWN_HOME_HOURS,
    seedBags: starterBags(opts.seed),
    seedsPurchased: 0,
    daily: { day: 0, sold: {}, bought: {} },
    surveyed: {},
    siteStores: {},
    samples: 0,
    lastLifeHomeHours: 0,
    ordersDone: {},
    awakened: false,
    sleepers: SHIP_CREW,
    birthHours: 0,
    lastLaborHomeHours: 0,
  };
}

/** 抵达新天体后命名。行星由 Agent 起名；卫星按「<行星简称>卫<发现序号>」自动生成。 */
export function nameBody(
  state: GameState,
  system: StarSystem,
  key: string,
  name: string,
): { state: GameState; name: string } {
  if (state.transit) throw new Error('移动途中不能命名。');
  if (key === 'star') throw new Error('恒星的名字在开局时已经定了。');
  const current = state.names.bodies[key];
  if (current) throw new Error(`「${current}」已经命名过了。`);
  const m = /^p(\d+)(?:-m(\d+))?$/.exec(key);
  if (!m) throw new Error(`不认识的星球编号：${key}`);
  const planetIndex = Number(m[1]);
  const p = system.planets[planetIndex - 1];
  if (!p) throw new Error(`没有第 ${planetIndex} 颗行星。`);
  if (!state.visited.includes(key)) throw new Error('还没到过这里，不能命名。');
  let final: string;
  if (m[2]) {
    const parent = state.names.bodies[`p${planetIndex}`] ?? `未抵星体-${bodyProbeId(state, `p${planetIndex}`)}`;
    const ordinal = Object.keys(state.names.bodies).filter((k) => k.startsWith(`p${planetIndex}-m`)).length + 1;
    final = `${parent}卫${ordinal}`;
  } else {
    const t = name.trim();
    if (!t) throw new Error('名字不能是空的。');
    if (t.length > 12) throw new Error('名字最多 12 个字。');
    if (Object.values(state.names.bodies).includes(t)) throw new Error(`「${t}」已经被用过了。`);
    final = t;
  }
  return {
    state: { ...state, names: { ...state.names, bodies: { ...state.names.bodies, [key]: final } } },
    name: final,
  };
}

/** 移动途中不能看环境。 */
export function canLook(state: GameState): boolean {
  return state.transit === null;
}

export function describeLocation(state: GameState, loc: Location): string {
  return `${displayName(state, bodyKeyOf(loc))}（${loc.latDeg.toFixed(1)}°, ${loc.lonDeg.toFixed(1)}°）`;
}

function visibilityAt(system: StarSystem, loc: Location): number {
  const p = system.planets[loc.planetIndex - 1];
  if (!p) return 0;
  return loc.moonIndex ? 1 : planetVisibility(p.atmosphere);
}

function bodyRadiusKm(system: StarSystem, loc: Location): number {
  const p = system.planets[loc.planetIndex - 1]!;
  if (loc.moonIndex) return R_EARTH_KM * (p.moons[loc.moonIndex - 1]?.radiusEarth ?? 0.27);
  return R_EARTH_KM * p.radiusEarth;
}

/** 当前所在地的 TerrainBody，用于 look / 地形补丁。 */
export function terrainBodyAt(system: StarSystem, loc: Location): TerrainBody {
  const p = system.planets[loc.planetIndex - 1]!;
  if (loc.moonIndex) {
    const m = p.moons[loc.moonIndex - 1]!;
    return { id: m.id, name: m.name, meanTempK: p.eqTempK, obliquityDeg: 0, atmosphere: 'none', surface: m.surface };
  }
  return {
    id: p.id,
    name: p.name,
    meanTempK: p.meanTempK,
    obliquityDeg: p.obliquityDeg,
    atmosphere: p.atmosphere,
    surface: p.surface,
  };
}

/** 看周围一片地形；移动途中返回 null。 */
export function lookAt(system: StarSystem, state: GameState, radiusKm: number): string | null {
  if (!canLook(state) || !state.location) return null;
  const body = terrainBodyAt(system, state.location);
  return terrainPatchText(terrainPatch(body, state.location.latDeg, state.location.lonDeg, radiusKm));
}

/** 现实时间走到 nowMs：若已过抵达时刻，结算并推「已到达」事件。 */
export function tick(system: StarSystem, state: GameState, nowMs: number): { state: GameState; events: GameEvent[] } {
  const settled = settlePower(system, state, nowMs);
  const mined = advanceMiners(system, settled, nowMs);
  const armed = advanceArms(system, mined, nowMs);
  const scarred = advanceScars(system, armed.state, nowMs);
  const traded = advanceTerminals(system, scarred, nowMs);
  const terrafied = advanceTerra(system, traded, nowMs);
  const industrious = advanceIndustry(system, terrafied.state, nowMs);
  const grown = advanceFlora(system, industrious.state, nowMs);
  const lived = advanceLife(system, grown.state, nowMs);
  const labored = advanceLabor(system, lived.state, nowMs);
  const built = settleBuilds(system, labored.state, nowMs);
  const events: GameEvent[] = [
    ...armed.events,
    ...terrafied.events,
    ...industrious.events,
    ...grown.events,
    ...lived.events,
    ...labored.events,
    ...built.events,
  ];
  // 协议全完成的这一刻推一次「可以叫醒他们了」。
  if (!built.state.awakened && protocolComplete(built.state)) {
    events.push({
      type: 'genesis.protocol',
      text: '协议上的十二条全划掉了。现在可以走回居所，把他们叫醒。',
    });
  }
  const t = built.state.transit;
  if (!t || nowMs < t.arriveRealMs) return { state: built.state, events };
  const next: GameState = { ...built.state, transit: null, location: t.to };
  // 火箭是临时仓库：星际航行时自动跟着走，玩家落地后它们落在附近。
  if (t.kind === 'interstellar' && built.state.structures.some((s) => s.kind === 'rocket')) {
    next.structures = next.structures.map((s) =>
      s.kind === 'rocket' ? { ...s, planetIndex: t.to.planetIndex, dockedPlanetIndex: t.to.planetIndex } : s,
    );
  }
  const key = bodyKeyOf(t.to);
  if (!next.visited.includes(key)) next.visited = [...next.visited, key];
  const arriveAt = nowPlanetHours(settled, t.arriveRealMs);
  const used = arriveAt - nowPlanetHours(settled, t.departRealMs);
  const how =
    t.kind === 'surface'
      ? `地表移动 ${(t.distanceKm ?? 0).toFixed(0)} km，用时 ${used.toFixed(2)} ${state.calendar.homePlanetName}时`
      : `星际航行 ${(t.distanceAU ?? 0).toFixed(3)} AU，用时 ${(used / 24).toFixed(2)} ${state.calendar.homePlanetName}日`;
  events.push({
    type: 'genesis.arrived',
    text: `${formatTime(state.calendar, arriveAt)} 抵达 ${describeLocation(next, t.to)}（${how}）。`,
  });
  return { state: next, events };
}

/** 地表移动：从当前位置走到 (lat, lon)；用时按 600 km/星球时，抵达推到现实时间轴上。 */
export function beginSurfaceMove(
  system: StarSystem,
  state: GameState,
  latDeg: number,
  lonDeg: number,
  nowMs: number,
): { state: GameState; event: GameEvent } {
  if (state.transit) throw new Error('移动途中不能再次移动。');
  if (!state.location) throw new Error('还不知道自己在哪。');
  const radiusKm = bodyRadiusKm(system, state.location);
  const distanceKm = surfaceDistanceKm(state.location.latDeg, state.location.lonDeg, latDeg, lonDeg, radiusKm);
  const body = terrainBodyAt(system, state.location);
  let factor = 1;
  if (body.surface.kind === 'terrestrial') {
    const check = surfacePathCheck(
      body.surface,
      state.location.latDeg,
      state.location.lonDeg,
      latDeg,
      lonDeg,
      mobilityCoreReady(state),
    );
    if (!check.ok) throw new Error(check.reason ?? '这段路走不过去。');
    factor = check.factor;
  }
  const hours = surfaceMoveHoursFor(distanceKm, factor);
  const slow = factor < 1 ? `，地形系数 ${factor.toFixed(2)}` : '';
  const to: Location = { ...state.location, latDeg, lonDeg };
  const transit: Transit = {
    kind: 'surface',
    from: state.location,
    to,
    departRealMs: nowMs,
    arriveRealMs: nowMs + hours * state.msPerPlanetHour,
    distanceKm,
  };
  return {
    state: { ...state, transit },
    event: {
      type: 'genesis.departed',
      text: `${formatTime(state.calendar, nowPlanetHours(state, nowMs))} 出发，地表移动 ${distanceKm.toFixed(0)} km${slow}，预计 ${hours.toFixed(2)} ${state.calendar.homePlanetName}时后抵达。`,
    },
  };
}

/** 射电望远镜升到 lv2 以后，厚大气挡不住星星了：可见度 +0.15。 */
export const TELESCOPE_VISIBILITY_BONUS = 0.15;
export const TELESCOPE_BONUS_LEVEL = 2;

/** 当前所在地的观星可见度（含望远镜加成，封顶 1）。 */
export function stargazeVisibilityAt(system: StarSystem, state: GameState): number {
  if (!state.location) return 0;
  const base = visibilityAt(system, state.location);
  const bonus = state.upgrades.telescope >= TELESCOPE_BONUS_LEVEL ? TELESCOPE_VISIBILITY_BONUS : 0;
  return Math.min(1, base + bonus);
}

/** 观星；能见度不够返回 null。观星窗口按现实时间算 1 母星时。 */
export function stargazeAt(system: StarSystem, state: GameState, nowMs: number): { state: GameState; result: StargazeResult | null } {
  if (state.transit) throw new Error('移动途中不能观星。');
  if (!state.location) throw new Error('还不知道自己在哪。');
  const result = stargaze(system, state.calendar, nowPlanetHours(state, nowMs), {
    bodyId: bodyKeyOf(state.location),
    planetIndex: state.location.planetIndex,
    visibility: stargazeVisibilityAt(system, state),
  });
  if (!result) return { state, result: null };
  return {
    state: {
      ...state,
      stargaze: {
        atRealMs: nowMs,
        untilRealMs: nowMs + STARGAZE_WINDOW_PLANET_HOURS * state.msPerPlanetHour,
        visibleKeys: result.bodies.map((b) => b.key),
      },
    },
    result,
  };
}

/** 现在能不能去 key：回母星随时可以；别的天体要么在观星窗口内被看见，要么手里有星图。 */
export function canTravelTo(state: GameState, key: string, nowMs: number): boolean {
  if (key === homeKey(state)) return true;
  if ((state.charts ?? []).includes(key)) return true;
  const rec = state.stargaze;
  if (!rec) return false;
  return nowMs <= rec.untilRealMs && rec.visibleKeys.includes(key);
}

export function resolveTarget(system: StarSystem, key: string): Location {
  const m = /^p(\d+)(?:-m(\d+))?$/.exec(key);
  if (!m) throw new Error(`不认识的星球编号：${key}`);
  const planetIndex = Number(m[1]);
  const p = system.planets[planetIndex - 1];
  if (!p) throw new Error(`没有第 ${planetIndex} 颗行星。`);
  if (m[2]) {
    const moonIndex = Number(m[2]);
    if (!p.moons[moonIndex - 1]) throw new Error(`${p.name} 没有第 ${moonIndex} 颗卫星。`);
    return { planetIndex, moonIndex, latDeg: 0, lonDeg: 0 };
  }
  return { planetIndex, latDeg: 0, lonDeg: 0 };
}

/** 航线上挡路的天体 id（空串表示畅通；`star` 表示穿过恒星）。 */
export function pathObstruction(
  system: StarSystem,
  from: Vec2,
  to: Vec2,
  tDays: number,
  ignoreKeys: ReadonlySet<string>,
): string | null {
  const starRadiusAU = system.star.radiusSun * AU_PER_SOLAR_RADIUS;
  if (distancePointToSegment({ x: 0, y: 0 }, from, to) < starRadiusAU) return 'star';
  for (const p of system.planets) {
    if (ignoreKeys.has(p.id)) continue;
    const clearance = Math.max(p.radiusEarth * 4.2635e-5, PATH_CLEARANCE_AU);
    if (distancePointToSegment(positionAt(orbitOf(p), tDays), from, to) < clearance) return p.id;
  }
  return null;
}

/** 星际航行：出发时按直线距离算用时，并检查航线净空。 */
export function beginInterstellar(
  system: StarSystem,
  state: GameState,
  targetKey: string,
  nowMs: number,
): { state: GameState; event: GameEvent } {
  if (state.transit) throw new Error('移动途中不能再次出发。');
  if (!state.location) throw new Error('还不知道自己在哪。');
  // 先认目标：目标都认不出来时，报「没有这个天体」比报「不在观星窗口」更有用。
  const to = resolveTarget(system, targetKey);
  if (!canTravelTo(state, targetKey, nowMs)) {
    throw new Error('目标现在不在可航行的观星窗口里：先观星，或者手里有它的星图，或者回母星。');
  }
  const targetPlanet = system.planets[to.planetIndex - 1]!;
  if (targetPlanet.kind !== 'rocky' && !mobilityCoreReady(state)) {
    throw new Error(
      `大气太稠：机动核心烧坏后压不住姿态，落不到${displayName(state, `p${to.planetIndex}`)}的等气压面上。先在【升级】里把它修好。`,
    );
  }
  const landing = landingPoint(targetPlanet, hashSeed(`${targetKey}:${nowMs}`));
  to.latDeg = landing.latDeg;
  to.lonDeg = landing.lonDeg;
  const tDays = realDaysFor(state.calendar, nowPlanetHours(state, nowMs));
  const here = positionAt(orbitOf(system.planets[state.location.planetIndex - 1]!), tDays);
  const there = positionAt(orbitOf(system.planets[to.planetIndex - 1]!), tDays);
  const ignore = new Set([`p${state.location.planetIndex}`, `p${to.planetIndex}`]);
  const blocked = pathObstruction(system, here, there, tDays, ignore);
  if (blocked === 'star') {
    throw new Error(`航线会穿过 ${state.names.star}，换个时间或换个目标。`);
  }
  if (blocked) {
    throw new Error(`航线会撞上 ${displayName(state, blocked)}，换个时间或换个目标。`);
  }
  const dist = distanceAU(here, there);
  const hours = interstellarPlanetHours(dist);
  const transit: Transit = {
    kind: 'interstellar',
    from: state.location,
    to,
    departRealMs: nowMs,
    arriveRealMs: nowMs + hours * state.msPerPlanetHour,
    distanceAU: dist,
  };
  return {
    state: { ...state, transit },
    event: {
      type: 'genesis.departed',
      text: `${formatTime(state.calendar, nowPlanetHours(state, nowMs))} 出发，星际航行 ${dist.toFixed(3)} AU，预计 ${(hours / 24).toFixed(2)} ${state.calendar.homePlanetName}日后抵达。`,
    },
  };
}

/** 回母星：不需要观星，但也要花时间。 */
export function returnHome(system: StarSystem, state: GameState, nowMs: number): { state: GameState; event: GameEvent } {
  return beginInterstellar(system, state, homeKey(state), nowMs);
}

// —— 太阳、能量、设备 ——

/** 天体 key → 太阳位置模型（母星按开局经度校准午夜）。 */
export function sunBodyOfKey(system: StarSystem, state: GameState, key: string): SunBody {
  const m = /^p(\d+)(?:-m(\d+))?$/.exec(key);
  if (!m) throw new Error(`不认识的天体：${key}`);
  const planetIndex = Number(m[1]);
  const p = system.planets[planetIndex - 1];
  if (!p) throw new Error(`没有第 ${planetIndex} 颗行星。`);
  if (m[2] !== undefined) return moonSunBody(p.moons[Number(m[2]) - 1]!);
  return planetSunBody(p, planetIndex === state.homePlanetIndex ? { homeStartLonDeg: state.startLonDeg } : {});
}

/** 当前（或指定）位置的太阳：高度角、方位角、昼夜。不需要任何设备。 */
export function sunAt(
  system: StarSystem,
  state: GameState,
  nowMs: number,
  latDeg?: number,
  lonDeg?: number,
): SunPosition {
  if (!state.location) throw new Error('还不知道自己在哪。');
  const key = bodyKeyOf(state.location);
  const body = sunBodyOfKey(system, state, key);
  const homeHours = nowPlanetHours(state, nowMs);
  return sunPosition(
    body,
    latDeg ?? state.location.latDeg,
    lonDeg ?? state.location.lonDeg,
    bodyHoursFromHome(homeHours, state.calendar.realHoursPerPlanetHour, body),
    realDaysFor(state.calendar, homeHours),
  );
}

/** 把太阳能帆的产出结算到 nowMs；幂等。 */
export function settlePower(system: StarSystem, state: GameState, nowMs: number): GameState {
  const nowHome = nowPlanetHours(state, nowMs);
  if (!Number.isFinite(nowHome) || !(nowHome > state.lastSettledHomeHours)) return state;
  const hours = nowHome - state.lastSettledHomeHours;
  const grids: Record<string, number> = { ...state.grids };
  // 帆发的电：这颗星有【整流电塔】就进电网（封顶），没有就直接进电池。
  let batteryGain = 0;
  for (const sail of state.sails) {
    const from = Math.max(sail.deployedHomeHours, state.lastSettledHomeHours);
    if (nowHome <= from) continue;
    const body = sunBodyOfKey(system, state, sail.bodyKey);
    const produced =
      daylightHomeHoursAt(
        body,
        state.calendar.realHoursPerPlanetHour,
        from,
        nowHome,
        sail.latDeg ?? 0,
        sail.lonDeg ?? 0,
      ) * SAIL_KJ_PER_HOME_HOUR;
    const planetIndex = planetIndexOfKey(sail.bodyKey);
    if (planetIndex !== null && planetHasGrid(state, planetIndex)) {
      const key = gridKeyFor(planetIndex);
      grids[key] = Math.min(gridCapacityFor(system, state, planetIndex), (grids[key] ?? 0) + produced);
    } else {
      batteryGain += produced;
    }
  }
  // 建筑维护费：有电网的星先扣电网，不够再扣电池——所以有帆的殖民地能自己活着。
  const shortfall: Record<string, number> = {};
  let batteryUpkeep = 0;
  for (const structure of state.structures) {
    let cost = BUILD_SPECS[structure.kind].upkeepKjPerHour;
    if (structure.kind === 'greenhouse') {
      for (const core of structure.cores ?? []) {
        if (core === 'cooler') cost += COOLER_UPKEEP_KJ_PER_HOUR;
        else if (core === 'heater') cost += HEATER_UPKEEP_KJ_PER_HOUR;
        else cost += REALISM_CORE_UPKEEP_KJ_PER_HOUR;
      }
      // 设定点：温差越大越贵（15℃ 以内不算人工气候，也不收这份钱）。
      if (structure.targetTempC !== undefined) {
        const ambient = ambientAtStructure(system, state, structure);
        if (ambient !== null) {
          const delta = Math.abs(structure.targetTempC - ambient);
          if (delta > ARTIFICIAL_DEADBAND_C) cost += SETPOINT_KJ_PER_DEGREE_HOUR * delta;
        }
      }
    }
    if (!Number.isFinite(cost) || cost <= 0) continue;
    const key = gridKeyFor(structure.planetIndex);
    if (planetHasGrid(state, structure.planetIndex)) {
      const drained = (grids[key] ?? 0) - cost * hours;
      if (drained >= 0) grids[key] = drained;
      else {
        grids[key] = 0;
        shortfall[key] = (shortfall[key] ?? 0) - drained;
      }
    } else {
      batteryUpkeep += cost;
    }
  }
  let batteryDrain = batteryUpkeep;
  for (const key of Object.keys(shortfall)) batteryDrain += shortfall[key]!;
  const energyKj = Math.min(energyCapOf(state), Math.max(0, state.energyKj + batteryGain - batteryDrain * hours));
  return { ...state, energyKj, grids, lastSettledHomeHours: nowHome };
}

/** 行星电网的键。 */
export function gridKeyFor(planetIndex: number): string {
  return `p${planetIndex}`;
}

/** `p3` / `p3-m1` → 3；解析不了返回 null。 */
export function planetIndexOfKey(bodyKey: string): number | null {
  const m = /^p(\d+)/.exec(bodyKey);
  return m ? Number(m[1]) : null;
}

/** 这颗行星有没有通着电的【整流电塔】。 */
export function rectifierAt(state: GameState, planetIndex: number): StructureRecord | undefined {
  return state.structures.find((s) => s.kind === 'rectifier' && s.planetIndex === planetIndex);
}

export function planetHasGrid(state: GameState, planetIndex: number): boolean {
  const tower = rectifierAt(state, planetIndex);
  return Boolean(tower) && structurePowered(state, tower!);
}

/** 电网容量：本星帆的每小时产能 × 24，最少 100,000、最多 2,000,000。 */
export function gridCapacityFor(system: StarSystem, state: GameState, planetIndex: number): number {
  const key = gridKeyFor(planetIndex);
  const sails = state.sails.filter((s) => s.bodyKey === key).length;
  const perHour = sails * SAIL_KJ_PER_HOME_HOUR;
  return Math.max(GRID_CAP_MIN_KJ, Math.min(GRID_CAP_MAX_KJ, perHour * GRID_CAP_HOURS));
}

/** 采矿机每小时产多少份钨（海拔 800 m 起算，到 4,000 m 封顶）。 */
export function minerTungstenPerHour(system: StarSystem, state: GameState, structure: StructureRecord): number {
  const planet = system.planets[structure.planetIndex - 1];
  const surface = planet?.surface;
  if (!surface || surface.kind !== 'terrestrial') return 0;
  const site = state.sites.find((s) => s.key === structure.siteKey);
  if (!site) return 0;
  const cell = cellIndexFor(site.latDeg, site.lonDeg);
  const remaining = oreRemainingAt(system, state, structure.planetIndex, cell.i, cell.j);
  // 产率跟这一格还剩多少钨走：富矿区能到 2 份/母星时，贫矿区只有 0.2。
  return MINER_PER_HOUR_MIN + (MINER_PER_HOUR_MAX - MINER_PER_HOUR_MIN) * (remaining / ORE_PER_CELL_MAX);
}

/** 这一格钨矿的原始含量（0…500 份，创世时定，写进 system.json）。 */
export function oreKey(planetIndex: number, cellI: number, cellJ: number): string {
  return `p${planetIndex}:${cellI}:${cellJ}`;
}

export function oreContentAt(system: StarSystem, planetIndex: number, cellI: number, cellJ: number): number {
  const planet = system.planets[planetIndex - 1];
  const surface = planet?.surface;
  if (!surface || surface.kind !== 'terrestrial') return 0;
  return surface.tungsten[cellI]?.[cellJ] ?? 0;
}

/** 已经挖掉多少份。 */
export function oreMinedAt(state: GameState, planetIndex: number, cellI: number, cellJ: number): number {
  return state.mined[oreKey(planetIndex, cellI, cellJ)] ?? 0;
}

/** 还剩多少份可挖。 */
export function oreRemainingAt(
  system: StarSystem,
  state: GameState,
  planetIndex: number,
  cellI: number,
  cellJ: number,
): number {
  const content = oreContentAt(system, planetIndex, cellI, cellJ);
  return Math.max(0, content - oreMinedAt(state, planetIndex, cellI, cellJ));
}

/** 让采矿机出钨：按这一段时间结算，产率随「这一格还剩多少钨」走。 */
/** 每挖走 1 份钨，留下 0.1 kg 尾矿——要地方堆，也是「采掘有代价」的实体。 */
export const SLAG_PER_TUNGSTEN_KG = 0.1;
/** 一个站点自带多大地窖放尾矿；满了矿机就停。 */
export const SITE_SLAG_CAPACITY_KG = 500;
/** 挖走一格矿留在那一格上的疤：0 干净，1 挖空。 */
export const SCAR_PER_TUNGSTEN = 1 / 500;
/** 疤向下游扩散：每 24 母星时，一格的 10% 传给更低的邻格（水土流失）。 */
export const SCAR_SPREAD_FACTOR = 0.1;
export const SCAR_SPREAD_HOME_HOURS = 24;

export function advanceMiners(system: StarSystem, state: GameState, nowMs: number): GameState {
  const nowHome = nowPlanetHours(state, nowMs);
  if (!Number.isFinite(nowHome)) return state;
  const hours = nowHome - state.lastSettledHomeHours;
  if (hours <= 0) return state;
  let gained = 0;
  const mined = { ...state.mined };
  const siteStores = { ...state.siteStores };
  const scar = { ...state.scar };
  for (const structure of state.structures) {
    if (structure.kind !== 'miner') continue;
    const site = state.sites.find((s) => s.key === structure.siteKey);
    if (!site) continue;
    const pile = siteStores[site.key] ?? {};
    if ((pile.slag ?? 0) >= SITE_SLAG_CAPACITY_KG) continue;
    const cell = cellIndexFor(site.latDeg, site.lonDeg);
    const key = oreKey(structure.planetIndex, cell.i, cell.j);
    const remaining = Math.max(0, (system.planets[structure.planetIndex - 1]?.surface as { tungsten?: number[][] })
      ?.tungsten?.[cell.i]?.[cell.j] ?? 0) - (mined[key] ?? 0);
    if (remaining <= 0) continue;
    const take = Math.min(remaining, minerTungstenPerHour(system, state, structure) * hours);
    if (take <= 0) continue;
    gained += take;
    mined[key] = Math.round(((mined[key] ?? 0) + take) * 100) / 100;
    const slag = (pile.slag ?? 0) + take * SLAG_PER_TUNGSTEN_KG;
    siteStores[site.key] = { ...pile, slag: Math.min(SITE_SLAG_CAPACITY_KG, Math.round(slag * 100) / 100) };
    scar[key] = Math.min(1, Math.round(((scar[key] ?? 0) + take * SCAR_PER_TUNGSTEN) * 1000) / 1000);
  }
  if (gained <= 0) return state;
  return {
    ...state,
    tungsten: Math.round((state.tungsten + gained) * 100) / 100,
    mined,
    siteStores,
    scar,
  };
}

/** 某一格的疤（0…1）。 */
export function scarAt(system: StarSystem, state: GameState, planetIndex: number, cellI: number, cellJ: number): number {
  return Math.min(1, Math.max(0, state.scar[oreKey(planetIndex, cellI, cellJ)] ?? 0));
}

/**
 * 疤会往低处走：每 24 母星时，一格把 10% 的疤传给更低海拔的邻格（水土流失）。
 * 只传陆地、只往下坡传——山挖空了，下面的地也会开始旱。
 */
export function advanceScars(system: StarSystem, state: GameState, nowMs: number): GameState {
  const nowHome = nowPlanetHours(state, nowMs);
  if (!Number.isFinite(nowHome)) return state;
  const steps = Math.floor((nowHome - state.lastScarHomeHours) / SCAR_SPREAD_HOME_HOURS);
  if (steps <= 0) return state;
  const scar = { ...state.scar };
  const surge = Math.min(steps, 10);
  for (const [key, value] of Object.entries(state.scar)) {
    const match = /^p(\d+):(\d+):(\d+)$/.exec(key);
    if (!match) continue;
    const planetIndex = Number(match[1]);
    const i = Number(match[2]);
    const j = Number(match[3]);
    const surface = system.planets[planetIndex - 1]?.surface;
    if (!surface || surface.kind !== 'terrestrial') continue;
    const here = surface.elevationM[i]?.[j] ?? 0;
    const push = value * SCAR_SPREAD_FACTOR * surge;
    if (push <= 0) continue;
    const around: Array<[number, number]> = [
      [(i + 35) % 36, j],
      [(i + 1) % 36, j],
      [i, (j + 71) % 72],
      [i, (j + 1) % 72],
    ];
    for (const [ni, nj] of around) {
      const there = surface.elevationM[ni]?.[nj] ?? 0;
      if ((surface.biome[ni]?.[nj] ?? 0) === 0) continue;
      if (there >= here) continue;
      const nk = oreKey(planetIndex, ni, nj);
      scar[nk] = Math.min(1, Math.round(((scar[nk] ?? 0) + push / 4) * 1000) / 1000);
    }
  }
  return { ...state, scar, lastScarHomeHours: state.lastScarHomeHours + steps * SCAR_SPREAD_HOME_HOURS };
}

/** 交易终端：每天商人开张时，把 `sellTarget` 从本行星的容器里清一次（净价 0，只清库存）。 */
export function advanceTerminals(system: StarSystem, state: GameState, nowMs: number): GameState {
  const nowHome = nowPlanetHours(state, nowMs);
  if (!Number.isFinite(nowHome)) return state;
  const day = Math.floor(nowHome / 24);
  if (day === state.lastAutoTradeDay) return state;
  const hour = nowHome % 24;
  // 只有在开张窗口里才把这一天记成「已结算」——清早 05:00 的一次 tick 不能把当天报废。
  if (hour < 12 || hour >= 23) return state;
  const terminals = state.structures.filter((s) => s.kind === 'terminal');
  if (terminals.length === 0) return state;
  let next = { ...state, lastAutoTradeDay: day };
  for (const terminal of terminals) {
    if (!structurePowered(next, terminal)) continue;
    // 编排：仓储终端可以指定「只吃哪几个容器、按什么优先级」；没有仓储终端就还是老样子（同行星所有容器）。
    const storage = next.structures.find(
      (s) => s.kind === 'storage_terminal' && s.feeds === terminal.id && s.planetIndex === terminal.planetIndex,
    );
    const hasDrone = (targetId: string): boolean =>
      next.structures.some(
        (s) =>
          s.kind === 'drone_cluster' &&
          s.serves === targetId &&
          s.planetIndex === terminal.planetIndex &&
          structurePowered(next, s),
      );
    const linked = hasDrone(terminal.id) || (storage ? hasDrone(storage.id) : false);
    const target = terminal.sellTarget ?? 'slag';
    const good = SELL_GOODS.find((g) => g.id === target);
    if (!good) continue;
    const limit = dailyLimitFor(good, next.upgrades.telescope);
    const soldKey = `sell:${good.id}`;
    let left = Math.max(0, Math.floor(limit - (next.daily.sold[soldKey] ?? 0)));
    if (left <= 0) continue;
    const containers = storage
      ? routedContainers(next, storage).map((r) => r.container.id)
      : Object.keys(next.stores).filter((id) => {
          const s = next.structures.find((x) => x.id === id);
          return s && s.planetIndex === terminal.planetIndex && (linked || s.siteKey === terminal.siteKey);
        });
    for (const id of containers) {
      const pile = next.stores[id] ?? {};
      const have = pile[target] ?? 0;
      if (have <= 0) continue;
      const moved = Math.min(have, left);
      if (moved <= 0) continue;
      const left2 = Math.round((have - moved) * 100) / 100;
      next = {
        ...next,
        stores: { ...next.stores, [id]: { ...pile, [target]: left2 } },
        daily: {
          ...next.daily,
          sold: { ...next.daily.sold, [soldKey]: (next.daily.sold[soldKey] ?? 0) + moved },
        },
        credits: next.credits + 0,
      };
      left -= moved;
      if (left <= 0) break;
    }
    // 自动买种子：只买随机基因的种子（付 kJ），一天一袋；货先落在这个终端的缓冲里，
    // 等无人机拉走或者你自己来取——信用点可以瞬间到账，种子不行。
    const species = terminal.buySpecies;
    if (species && linked) {
      const bagsHere = next.seedBags.filter((b) => b.at === terminal.id).length;
      const boughtKey = `buy:seed:${species}`;
      const daily = next.daily.day === day ? next.daily : { day, sold: {}, bought: {} };
      const boughtToday = daily.bought[boughtKey] ?? 0;
      const price = randomSeedPriceKj(next.seedsPurchased);
      if (bagsHere < TERMINAL_BAG_SLOTS && boughtToday < AUTO_SEED_BAGS_PER_DAY && next.energyKj >= price) {
        const streak = hashSeed(`auto:${terminal.id}:${day}:${species}`);
        const bag: SeedBag = {
          id: seedId(species, next.seedsPurchased),
          species,
          genes: randomGenes(species, streak),
          premium: false,
          count: SEEDS_PER_BAG,
          at: terminal.id,
        };
        next = {
          ...next,
          energyKj: next.energyKj - price,
          seedBags: [...next.seedBags, bag],
          seedsPurchased: next.seedsPurchased + 1,
          daily: { ...daily, bought: { ...daily.bought, [boughtKey]: boughtToday + 1 } },
        };
      }
    }
  }
  return next;
}

/**
 * 机械臂：把输入容器里的散货搬进输出容器。
 *
 * 规则（1.9.0）：
 * - 每座臂每个 tick 最多搬 `ARM_KG_PER_HOUR × 经过的母星时` 的货，输出装不下就空转。
 * - 输入按容器槽位从小到大依次取，白名单为空 = 全搬。
 * - 搬运按 `ARM_KJ_PER_KG` 扣电池；没电就停。
 * - 允许成环，但每天只报一次「这几座臂在互相搬」。
 */
export function advanceArms(system: StarSystem, state: GameState, nowMs: number): { state: GameState; events: GameEvent[] } {
  const nowHome = nowPlanetHours(state, nowMs);
  if (!Number.isFinite(nowHome)) return { state, events: [] };
  const hours = Math.min(24, Math.max(0, nowHome - state.lastArmsHomeHours));
  const arms = state.structures.filter((s) => s.kind === 'arm');
  if (arms.length === 0) return { state: hours > 0 ? { ...state, lastArmsHomeHours: nowHome } : state, events: [] };
  let next: GameState = { ...state, lastArmsHomeHours: nowHome };
  const events: GameEvent[] = [];
  const slotOf = (id: string): number => next.structures.find((s) => s.id === id)?.slot ?? Number.MAX_SAFE_INTEGER;
  for (const arm of arms) {
    if (!structurePowered(next, arm)) continue;
    const output = next.structures.find((s) => s.id === arm.output);
    if (!output) continue;
    let capacity = Math.max(0, storeCapacityKg(output) - containerUsedKg(next, output));
    if (capacity <= 0) continue;
    let budget = ARM_KG_PER_HOUR * hours;
    if (budget <= 0) continue;
    const whitelist = arm.items && arm.items.length > 0 ? new Set(arm.items) : null;
    const inputs = [...(arm.inputs ?? [])].sort((a, b) => slotOf(a) - slotOf(b));
    // 先搬种子袋：整袋搬（袋里带着基因，不能拆），占目标的袋位，也计重量。
    // 白名单只管散货——设了白名单就不动袋子，免得「只想搬尾矿」时把种子也搬走。
    const targetSlots = containerBagSlots(output);
    const order = new Map(next.seedBags.map((b, i) => [b.id, i]));
    if (!whitelist) {
      for (const id of inputs) {
        if (budget <= 0) break;
        const source = next.structures.find((s) => s.id === id);
        if (!source || containerBagSlots(source) === 0) continue;
        const bags = bagsInContainer(next, id).sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
        for (const bag of bags) {
          if (budget <= 0) break;
          if (bagsInContainer(next, output.id).length >= targetSlots) break;
          const weight = bagWeightKg(bag);
          if (weight > budget || weight > capacity) continue;
          const cost = weight * ARM_KJ_PER_KG;
          if (next.energyKj < cost) {
            budget = 0;
            break;
          }
          next = {
            ...next,
            energyKj: next.energyKj - cost,
            seedBags: next.seedBags.map((b) => (b.id === bag.id ? { ...b, at: output.id } : b)),
          };
          budget -= weight;
          capacity -= weight;
        }
      }
    }
    // 再搬散货 kg。
    for (const id of inputs) {
      if (budget <= 0 || capacity <= 0) break;
      const pile = next.stores[id];
      if (!pile) continue;
      for (const resource of Object.keys(pile).sort()) {
        if (budget <= 0 || capacity <= 0) break;
        if (whitelist && !whitelist.has(resource)) continue;
        const have = pile[resource] ?? 0;
        if (have <= 0) continue;
        const move = Math.min(have, budget, capacity);
        if (move <= 0) continue;
        const cost = move * ARM_KJ_PER_KG;
        if (next.energyKj < cost) {
          budget = 0;
          break;
        }
        const left = round3(have - move);
        const into = round3((next.stores[output.id]?.[resource] ?? 0) + move);
        next = {
          ...next,
          energyKj: next.energyKj - cost,
          stores: {
            ...next.stores,
            [id]: { ...pile, [resource]: left },
            [output.id]: { ...(next.stores[output.id] ?? {}), [resource]: into },
          },
        };
        budget -= move;
        capacity -= move;
      }
    }
  }
  // 环路：A 的货流回 A 自己的输入，就会无限空转烧电。允许，但每天只提醒一次。
  const day = Math.floor(nowHome / 24);
  const cycling = armsInCycle(next);
  if (cycling.length > 0 && next.lastCycleWarnDay !== day) {
    events.push({
      type: 'genesis.arm_cycle',
      text: `注意：${cycling.map((a) => `${a.id}`).join('、')} 首尾相接成了环——货会在几座臂之间来回倒，白烧电。想停就把其中一段的输入改掉。`,
    });
    next = { ...next, lastCycleWarnDay: day };
  }
  return { state: next, events };
}

/** 哪些机械臂卷进了「输出又能流回自己输入」的环里。 */
export function armsInCycle(state: GameState): StructureRecord[] {
  const arms = state.structures.filter((s) => s.kind === 'arm' && Boolean(s.output));
  const edges: Record<string, string[]> = {};
  for (const arm of arms) {
    for (const input of arm.inputs ?? []) (edges[input] ??= []).push(arm.output!);
  }
  const reaches = (from: string, to: string): boolean => {
    const seen = new Set<string>();
    const stack = [from];
    while (stack.length > 0) {
      const cur = stack.pop()!;
      if (cur === to) return true;
      if (seen.has(cur)) continue;
      seen.add(cur);
      for (const nxt of edges[cur] ?? []) stack.push(nxt);
    }
    return false;
  };
  return arms.filter((arm) => (arm.inputs ?? []).some((input) => reaches(arm.output!, input)));
}

/** 检查一座机械臂的接线是否合法（建臂与改线共用同一套规则）。 */
export function assertArmWiring(
  system: StarSystem,
  state: GameState,
  site: { planetIndex: number; latDeg: number; lonDeg: number },
  inputs: string[],
  outputId: string | undefined,
): void {
  const planet = system.planets[site.planetIndex - 1]!;
  const planetRadiusKm = planet.radiusEarth * 6371;
  const containerAt = (id: string): StructureRecord => {
    const c = state.structures.find((s) => s.id === id);
    if (!c) throw new Error(`没有这个容器：${id}`);
    if (!(STORAGE_KINDS as readonly string[]).includes(c.kind) && c.kind !== 'terminal') {
      throw new Error(`${id} 不是容器：机械臂只搬仓库、冷库、惰性气体室或交易终端缓冲里的散货。`);
    }
    if (c.planetIndex !== site.planetIndex) throw new Error(`机械臂够不到 ${c.planetIndex} 号星上的 ${id}：它只在 ${site.planetIndex} 号星上工作。`);
    return c;
  };
  const output = outputId ? containerAt(outputId) : undefined;
  if (!output) throw new Error('机械臂要先指定一个输出容器（把货搬到哪）。');
  if (output.kind === 'terminal') {
    throw new Error('机械臂不能往交易终端里倒货：终端是收货口，只接商人送来的东西。换个仓库/冷库/惰性气体室当输出。');
  }
  const unique = [...new Set(inputs)].filter(Boolean);
  if (unique.length === 0) throw new Error('机械臂至少要指定一个输入容器（从哪取货）。');
  for (const id of unique) {
    if (id === output.id) throw new Error('输出容器不能同时当输入：那就成了原地打转。');
    const c = containerAt(id);
    const from = state.sites.find((s) => s.key === c.siteKey);
    if (!from) continue;
    const km = surfaceDistanceKm(site.latDeg, site.lonDeg, from.latDeg, from.lonDeg, planetRadiusKm);
    if (km > ARM_RANGE_KM + 1e-9) {
      throw new Error(
        `机械臂够不到 ${id}：它在 ${km.toFixed(1)} km 外，机械臂只有 ${ARM_RANGE_KM} km 的臂展——把容器挪近一点，或者换个站点建臂。`,
      );
    }
  }
}

/** 给一座已经建好的机械臂改线（不传的字段保持原样）。 */
export function relinkArm(
  system: StarSystem,
  state: GameState,
  armId: string,
  patch: { inputs?: string[]; output?: string; items?: string[] },
): { state: GameState; text: string } {
  const arm = state.structures.find((s) => s.id === armId);
  if (!arm || arm.kind !== 'arm') throw new Error(`没有这座机械臂：${armId}`);
  const site = state.sites.find((s) => s.key === arm.siteKey);
  if (!site) throw new Error('机械臂所在的站点找不到。');
  const inputs = patch.inputs !== undefined ? [...new Set(patch.inputs)].filter(Boolean) : [...(arm.inputs ?? [])];
  const output = patch.output !== undefined ? patch.output : arm.output;
  assertArmWiring(system, state, site, inputs, output);
  const items = patch.items !== undefined ? [...new Set(patch.items)].filter(Boolean) : arm.items;
  const next: StructureRecord = {
    ...arm,
    inputs,
    output: output!,
    ...(items && items.length > 0 ? { items } : { items: undefined }),
  };
  if (!items || items.length === 0) delete next.items;
  return {
    state: { ...state, structures: state.structures.map((s) => (s.id === armId ? next : s)) },
    text: `改好了：${armId} 从 ${inputs.join('、')} 搬到 ${output}${items && items.length > 0 ? `，只搬 ${items.join('、')}` : '，全搬'}。`,
  };
}

/**
 * 值班终端的接线校验：居所、仓库、站点都要在终端的 5 km 内，一座居所只能派一个班组。
 * 建终端（`buildStructure`）和改绑定（`relinkDuty`）共用这一套规则。
 */
export function assertDutyWiring(
  system: StarSystem,
  state: GameState,
  site: Site,
  habitatId: string | undefined,
  storeId: string | undefined,
  siteKeysIn: string[],
  selfId?: string,
): string[] {
  if (site.kind !== 'land') throw new Error('值班终端只能建在陆地上。');
  const planet = system.planets[site.planetIndex - 1];
  const planetRadiusKm = (planet?.radiusEarth ?? 1) * 6371;
  const kmFrom = (key: string) => {
    const to = state.sites.find((s) => s.key === key);
    if (!to) return Number.NaN;
    return surfaceDistanceKm(site.latDeg, site.lonDeg, to.latDeg, to.lonDeg, planetRadiusKm);
  };
  const habitat = state.structures.find((s) => s.id === habitatId);
  if (!habitat || habitat.kind !== 'habitat') throw new Error(`没有这座居所：${habitatId ?? '(没传)'}——值班终端得先有一群人可派。`);
  if (habitat.planetIndex !== site.planetIndex) throw new Error('值班终端只能管同一颗行星上的居所。');
  const homeKm = kmFrom(habitat.siteKey);
  if (homeKm > DUTY_RANGE_KM + 1e-9) {
    throw new Error(`这座居所在 ${homeKm.toFixed(1)} km 外，超过值班终端的 ${DUTY_RANGE_KM} km：人走不过去，换个靠近居所的站点建终端。`);
  }
  const clash = state.structures.find((s) => s.kind === 'duty' && s.habitat === habitat.id && s.id !== selfId)
    ?? state.builds.find((b) => b.kind === 'duty' && b.habitat === habitat.id && b.id !== selfId);
  if (clash) throw new Error('这座居所已经有值班终端了：一座居所派一个班组，想加人先建新居所。');
  const store = state.structures.find((s) => s.id === storeId);
  if (!store || !(STORAGE_KINDS as readonly string[]).includes(store.kind)) {
    throw new Error(`${storeId ?? '(没传)'} 不是仓库存放点：值班终端的收成和种子都走仓库、冷库或惰性气体室（交易终端那个收货口不行）。`);
  }
  if (store.planetIndex !== site.planetIndex) throw new Error('值班终端只能往同一颗行星上的仓库存东西。');
  const storeKm = kmFrom(store.siteKey);
  if (storeKm > DUTY_RANGE_KM + 1e-9) {
    throw new Error(`仓库在 ${storeKm.toFixed(1)} km 外，超过 ${DUTY_RANGE_KM} km：人手搬不到。`);
  }
  const keys = [...new Set(siteKeysIn)].filter(Boolean);
  if (keys.length === 0) throw new Error('值班终端至少要指一个站点（人在地里干哪块活）。');
  if (keys.length > DUTY_MAX_SITES) throw new Error(`值班终端最多管 ${DUTY_MAX_SITES} 个站点，你指了 ${keys.length} 个。`);
  for (const key of keys) {
    const to = state.sites.find((s) => s.key === key);
    if (!to) throw new Error(`没有这个站点：${key}`);
    if (to.planetIndex !== site.planetIndex) throw new Error(`${key} 在别的行星上：值班终端只管一颗星。`);
    const km = kmFrom(key);
    if (km > DUTY_RANGE_KM + 1e-9) {
      throw new Error(`${key} 在 ${km.toFixed(1)} km 外，超过 ${DUTY_RANGE_KM} km：人走不过去。`);
    }
  }
  return keys;
}

/**
 * 改值班终端的绑定：传哪个改哪个，没传的保持原样。
 */
export function relinkDuty(
  system: StarSystem,
  state: GameState,
  dutyId: string,
  patch: { habitat?: string; store?: string; sites?: string[] },
): { state: GameState; text: string } {
  const duty = state.structures.find((s) => s.id === dutyId);
  if (!duty || duty.kind !== 'duty') throw new Error(`没有这座值班终端：${dutyId}`);
  const site = state.sites.find((s) => s.key === duty.siteKey);
  if (!site) throw new Error(`值班终端所在的站点已经没了：${duty.siteKey}`);
  const habitat = patch.habitat ?? duty.habitat;
  const store = patch.store ?? duty.store;
  const sites = patch.sites ?? duty.sites ?? [];
  const keys = assertDutyWiring(system, state, site, habitat, store, sites, duty.id);
  const next: StructureRecord = { ...duty, habitat, store, sites: keys };
  const hands = Math.floor((state.structures.find((s) => s.id === habitat)?.awake ?? 0) / RESIDENTS_PER_LABOR);
  return {
    state: { ...state, structures: state.structures.map((s) => (s.id === dutyId ? next : s)) },
    text: `改好了：值班终端（${duty.siteKey}）派 ${hands} 份人手给 ${habitat}，收成进 ${store}，管 ${keys.length} 个站点。`,
  };
}

/** 哪个交易终端缓冲里的种子袋。 */export function terminalBags(state: GameState, terminalId: string): SeedBag[] {
  return state.seedBags.filter((b) => b.at === terminalId);
}

/** 某个容器（仓库、冷库、惰性气体室、交易终端）里放着的种子袋，按放入先后排。 */
export function bagsInContainer(state: GameState, containerId: string): SeedBag[] {
  return state.seedBags.filter((b) => b.at === containerId);
}

/** 容器能放几袋种子：仓库、冷库、惰性气体室、交易终端、空天母舰各 20 袋，其余不装袋。 */
export function containerBagSlots(structure: StructureRecord | undefined): number {
  if (!structure) return 0;
  return structure.kind === 'warehouse'
    || structure.kind === 'cold_store'
    || structure.kind === 'inert_room'
    || structure.kind === 'terminal'
    || structure.kind === 'carrier'
    ? CONTAINER_BAG_SLOTS
    : 0;
}

/** 一个容器里所有种子袋的总重量（kg）。 */
export function containerBagsWeightKg(state: GameState, containerId: string): number {
  let sum = 0;
  for (const bag of bagsInContainer(state, containerId)) sum += bagWeightKg(bag);
  return Math.round(sum * 10000) / 10000;
}

/** 容器的真实占用：散货 kg + 种子袋的重量。 */
export function containerUsedKg(state: GameState, container: StructureRecord): number {
  return round3(storeWeightKg(state.stores[container.id]) + containerBagsWeightKg(state, container.id));
}

/** 从容器里把一袋种子取回背包（`bagId` 不传就取最老的一袋）。 */
export function takeBagFromContainer(state: GameState, containerId: string, bagId?: string): { state: GameState; text: string } {
  const here = bagsInContainer(state, containerId);
  const where = state.structures.find((s) => s.id === containerId);
  const label = where ? BUILD_SPECS[where.kind].label : containerId;
  if (here.length === 0) throw new Error(`这个${label}里没有种子袋。`);
  const bag = bagId ? here.find((b) => b.id === bagId) : here[0];
  if (!bag) throw new Error(`${label}里没有这袋种子：${bagId}`);
  const { at: _at, ...backpack } = bag;
  return {
    state: { ...state, seedBags: state.seedBags.map((b) => (b.id === bag.id ? backpack : b)) },
    text: `把一袋${SPECIES[bag.species].name}种子（${bag.count} 粒，${bagWeightKg(bag).toFixed(3)} kg）从${label}取进了背包。`,
  };
}

/** 兼容旧调用：等价于从交易终端取袋。 */
export function takeBagFromTerminal(state: GameState, terminalId: string, bagId?: string): { state: GameState; text: string } {
  return takeBagFromContainer(state, terminalId, bagId);
}

/**
 * 手动把电从电网搬进电池（`in`）或从电池打进电网（`out`）。
 * 每搬一次 10,000 kJ、花 0.1 母星时、10% 损耗（90% 留下），站在电塔 2,000 km 内才能申请。
 */export function transferGridEnergy(
  system: StarSystem,
  state: GameState,
  nowMs: number,
  direction: 'in' | 'out',
  amount: number = GRID_TAP_KJ_PER_CALL,
): { state: GameState; text: string } {
  if (state.transit) throw new Error('移动途中不能申请输电。');
  const loc = state.location;
  if (!loc) throw new Error('你还没有站到任何一颗星上。');
  const planetIndex = loc.planetIndex;
  const tower = rectifierAt(state, planetIndex);
  if (!tower || !planetHasGrid(state, planetIndex)) {
    throw new Error('这颗星还没有通电的【整流电塔】——电没有地方可以进，也没有地方可以去。');
  }
  const site = state.sites.find((s) => s.key === tower.siteKey);
  if (site) {
    const distance = surfaceDistanceKm(site.latDeg, site.lonDeg, loc.latDeg, loc.lonDeg);
    if (distance > GRID_TAP_RANGE_KM) {
      throw new Error(
        `离电塔太远了（${distance.toFixed(0)} km）：输电要走到 ${GRID_TAP_RANGE_KM} km 以内。电塔在 ${tower.siteKey}。`,
      );
    }
  }
  const key = gridKeyFor(planetIndex);
  const grid = state.grids[key] ?? 0;
  const cap = energyCapOf(state);
  const wanted = Math.max(0, Math.min(GRID_TAP_KJ_PER_CALL, Number.isFinite(amount) ? amount : GRID_TAP_KJ_PER_CALL));
  if (direction === 'in') {
    const moved = Math.min(wanted, grid);
    if (moved <= 0) throw new Error('电网是空的，没什么可搬的。');
    const received = moved * GRID_LOSS_FACTOR;
    const room = Math.max(0, cap - state.energyKj);
    const accepted = Math.min(received, room);
    const spent = accepted / GRID_LOSS_FACTOR;
    const next = advanceHomeHours(state, GRID_TAP_HOME_HOURS);
    return {
      state: { ...next, energyKj: state.energyKj + accepted, grids: { ...next.grids, [key]: grid - spent } },
      text: `从电网搬了 ${spent.toFixed(0)} kJ 出来，损耗 10%，电池收到 ${accepted.toFixed(0)} kJ（现在 ${Math.floor(state.energyKj + accepted).toLocaleString('en-US')} / ${cap.toLocaleString('en-US')}）。用了 0.1 母星时。`,
    };
  }
  const wantedOut = Math.min(wanted, state.energyKj);
  if (wantedOut <= 0) throw new Error('电池是空的，没什么可送的。');
  const stored = wantedOut * GRID_LOSS_FACTOR;
  const gridRoom = Math.max(0, gridCapacityFor(system, state, planetIndex) - grid);
  const accepted = Math.min(stored, gridRoom);
  const spentBattery = accepted / GRID_LOSS_FACTOR;
  const next = advanceHomeHours(state, GRID_TAP_HOME_HOURS);
  return {
    state: { ...next, energyKj: state.energyKj - spentBattery, grids: { ...next.grids, [key]: grid + accepted } },
    text: `往电网送了 ${spentBattery.toFixed(0)} kJ，损耗 10%，电网收到 ${accepted.toFixed(0)} kJ（现在 ${Math.floor(grid + accepted).toLocaleString('en-US')} kJ）。用了 0.1 母星时。`,
  };
}

/** 蓄电池给的能量上限：基础 100,000 kJ，每升一级加一大块。 */
export function energyCapOf(state: GameState): number {
  return batteryCapacityKj(state.upgrades.battery);
}

/** 人类按动能发电机：按火花塞等级给 5/15/30/50 kJ，0.5 秒冷却；电池满了就不再涨。Agent 调不到这个函数。 */
export function pressGenerator(state: GameState, nowMs: number): GameState {
  if (nowMs - state.lastGeneratorRealMs < GENERATOR_COOLDOWN_MS) {
    throw new Error('发电机还在冷却，半秒后再按。');
  }
  const gain = sparkPlugOutputKj(state.upgrades.sparkPlug);
  const cap = energyCapOf(state);
  return { ...state, energyKj: Math.min(cap, state.energyKj + gain), lastGeneratorRealMs: nowMs };
}

/** 时间真的过了一点（部署设备要 0.1 母星时）：把创世时刻往前推，显示的时间就往后跳。 */
export function advanceHomeHours(state: GameState, homeHours: number): GameState {
  if (!(homeHours > 0)) return state;
  return { ...state, epochRealMs: state.epochRealMs - homeHours * state.msPerPlanetHour };
}

function spendEnergy(state: GameState, costKj: number, what: string): GameState {
  if (state.energyKj < costKj) {
    throw new Error(`能量不够：${what}要 ${costKj.toLocaleString('en-US')} kJ，现在只有 ${Math.floor(state.energyKj).toLocaleString('en-US')} kJ。`);
  }
  return { ...state, energyKj: state.energyKj - costKj };
}

function currentKeyOrThrow(state: GameState): string {
  if (!state.location) throw new Error('还不知道自己在哪。');
  return bodyKeyOf(state.location);
}

/** 部署环境监测器：每个天体最多一台，1,000,000 kJ + 0.1 母星时。 */
export function deployMonitor(system: StarSystem, state: GameState, nowMs: number, key?: string): GameState {
  if (state.transit) throw new Error('移动途中不能部署设备。');
  const target = key && key.trim() ? key.trim() : currentKeyOrThrow(state);
  if (target !== currentKeyOrThrow(state)) throw new Error('只能在你所在的那个天体上部署设备。');
  sunBodyOfKey(system, state, target);
  if (state.monitors.includes(target)) throw new Error(`${displayName(state, target)}上已经有一台环境监测器了。`);
  const settled = settlePower(system, state, nowMs);
  const paid = spendEnergy(settled, MONITOR_COST_KJ, '一台环境监测器');
  return advanceHomeHours(
    { ...paid, monitors: [...paid.monitors, target] },
    DEVICE_TIME_COST_HOME_HOURS,
  );
}

/** 部署凌日计数器：每个天体最多一台，1,000,000 kJ + 0.1 母星时。 */
export function deployCounter(system: StarSystem, state: GameState, nowMs: number, key?: string): GameState {
  if (state.transit) throw new Error('移动途中不能部署设备。');
  const target = key && key.trim() ? key.trim() : currentKeyOrThrow(state);
  if (target !== currentKeyOrThrow(state)) throw new Error('只能在你所在的那个天体上部署设备。');
  sunBodyOfKey(system, state, target);
  if (state.counters.includes(target)) throw new Error(`${displayName(state, target)}上已经有一台凌日计数器了。`);
  const settled = settlePower(system, state, nowMs);
  const paid = spendEnergy(settled, COUNTER_COST_KJ, '一台凌日计数器');
  return advanceHomeHours(
    { ...paid, counters: [...paid.counters, target] },
    DEVICE_TIME_COST_HOME_HOURS,
  );
}

/** 现在站在第几行星/第几卫星；没装凌日计数器就返回 null。 */
export function transitLabel(system: StarSystem, state: GameState): string | null {
  if (!state.location) return null;
  const key = bodyKeyOf(state.location);
  if (!state.counters.includes(key)) return null;
  const p = system.planets[state.location.planetIndex - 1]!;
  if (state.location.moonIndex) {
    return `第 ${state.location.planetIndex} 行星「${p.name}」的第 ${state.location.moonIndex} 卫星`;

  }
  return `第 ${state.location.planetIndex} 行星「${p.name}」`;
}

/** 部署太阳能帆：必须站在当前行星的陆地上，6,000 kJ，不耗时；产出按这台帆自己的经纬度算。 */
export function deploySail(system: StarSystem, state: GameState, nowMs: number): GameState {
  if (state.transit) throw new Error('移动途中不能部署设备。');
  if (!state.location) throw new Error('还不知道自己在哪。');
  if (state.location.moonIndex) throw new Error('卫星上部署不了太阳能帆。');
  const planet = system.planets[state.location.planetIndex - 1]!;
  if (planet.kind !== 'rocky') throw new Error('气态/冰巨星上部署不了太阳能帆。');
  const surface = planet.surface;
  if (surface.kind !== 'terrestrial') throw new Error('这里没有地面可铺帆。');
  const at = cellIndexFor(state.location.latDeg, state.location.lonDeg);
  if (!isLand(surface, at.i, at.j)) throw new Error('太阳能帆要建在陆地上：你脚下一片水。');
  const key = bodyKeyOf(state.location);
  const onThisPlanet = state.sails.filter((s) => s.bodyKey === key).length;
  if (onThisPlanet >= SAIL_MAX_PER_PLANET) {
    throw new Error(`这个行星已经有 ${SAIL_MAX_PER_PLANET} 个太阳能帆了，上限到了。`);
  }
  const settled = settlePower(system, state, nowMs);
  const paid = spendEnergy(settled, SAIL_COST_KJ, '一个太阳能帆');
  return {
    ...paid,
    sails: [
      ...paid.sails,
      {
        bodyKey: key,
        deployedHomeHours: nowPlanetHours(paid, nowMs),
        latDeg: state.location.latDeg,
        lonDeg: state.location.lonDeg,
      },
    ],
  };
}

/** 星际航行落点：随机经纬度；岩石行星落到陆地上。 */
function landingPoint(planet: Planet, seed: number): { latDeg: number; lonDeg: number } {
  const s = planet.surface;
  if (s.kind !== 'terrestrial') {
    return {
      latDeg: ((seed % 17000) / 100) - 85,
      lonDeg: (((seed >>> 9) % 36000) / 100) - 180,
    };
  }
  const rows = s.biome.length;
  const cols = s.biome[0]?.length ?? 0;
  const land: Array<[number, number]> = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      if (s.biome[j]?.[i] !== 0) land.push([j, i]);
    }
  }
  const pick = land.length ? land[seed % land.length]! : [Math.floor(rows / 2), Math.floor(cols / 2)];
  return {
    latDeg: -90 + (pick[0] + 0.5) * (180 / rows),
    lonDeg: -180 + (pick[1] + 0.5) * (360 / cols),
  };
}

// ───────────────────────── 殖民地：站点、种植、收获、贸易 ─────────────────────────

/**
 * 温室造价。原来卡在 100,000——正好是初始电池上限，别的设备稍微耗一点电，
 * 就永远差那么几百 kJ 造不了。降到 80,000，留出两万的安全垫。
 */
export const GREENHOUSE_COST_KJ = 80_000;
export const GREENHOUSE_BUILD_HOME_HOURS = 0.1;
export const GREENHOUSE_UPKEEP_KJ_PER_HOUR = 100;
export const GREENHOUSE_RADIUS_KM = 1;
export const BIOME_CHANGER_COST_KJ = 1_000_000;
export const BIOME_CHANGER_BUILD_HOME_HOURS = 0.5;
export const BIOME_CHANGER_UPKEEP_KJ_PER_HOUR = 0;
export const BIOME_CHANGER_RADIUS_KM = 1_500;
export const SITE_CAPACITY = 100;

/** 水泵：把水从湿站点抽到附近旱站点（+0.2 湿度，半径 3 km）。 */
export const PUMP_COST_KJ = 20_000;
export const PUMP_BUILD_HOME_HOURS = 0.5;
export const PUMP_UPKEEP_KJ_PER_HOUR = 200;
export const PUMP_RADIUS_KM = 3;
export const PUMP_WETNESS_BONUS = 0.2;
export const PUMP_MAX_WETNESS = 0.9;

// 温室的气候能力：环境温度在 −50…50℃ 时能把室内压到 0–28℃；
// 超出去就得靠制冷/制热核心，各再多撑 33℃（即 −83…83℃），代价是持续耗能。
export const GREENHOUSE_AMBIENT_MIN_C = -50;
export const GREENHOUSE_AMBIENT_MAX_C = 50;
export const GREENHOUSE_CORE_RANGE_C = 33;
export const GREENHOUSE_INTERIOR_MIN_C = 0;
export const GREENHOUSE_INTERIOR_MAX_C = 28;
export const COOLER_COST_KJ = 10_000;
export const HEATER_COST_KJ = 10_000;
export const COOLER_UPKEEP_KJ_PER_HOUR = 1_500;
export const HEATER_UPKEEP_KJ_PER_HOUR = 400;

export function homePlanetOf(system: StarSystem, state: GameState): Planet {
  return system.planets[state.homePlanetIndex - 1]!;
}

function yearHomeHoursOf(state: GameState): number {
  return state.calendar.planetDaysPerYear * 24;
}

function requireTerrestrial(planet: Planet): TerrestrialLike {
  if (planet.surface.kind !== 'terrestrial') {
    throw new Error('气态/冰巨星没有陆地，站点只能建在岩石行星上。');
  }
  return planet.surface;
}

type TerrestrialLike = Extract<Planet['surface'], { kind: 'terrestrial' }>;

/** 在脚下建一个 1 km² 的站点。 */
export function foundSite(system: StarSystem, state: GameState, latDeg: number, lonDeg: number, nowMs: number): { state: GameState; text: string } {
  if (state.transit) throw new Error('移动途中不能建站点。');
  if (!state.location) throw new Error('还不知道自己在哪。');
  const planet = system.planets[state.location.planetIndex - 1]!;
  const surface = requireTerrestrial(planet);
  if (state.sites.length >= MAX_SITES_PER_CELL * 999) throw new Error('站点太多了，先发展现有的。');
  const reason = siteRefusal(surface, latDeg, lonDeg, state.sites.filter((s) => s.planetIndex === state.location!.planetIndex));
  if (reason) throw new Error(reason);
  const { i, j } = cellIndexFor(latDeg, lonDeg);
  const sample = sampleCell(surface, latDeg, lonDeg);
  const key = siteKeyOf(state.location.planetIndex, latDeg, lonDeg);
  if (state.sites.some((s) => s.key === key)) throw new Error('这个坐标已经有一个站点了。');
  const site: Site = {
    key,
    planetIndex: state.location.planetIndex,
    latDeg: Math.round(latDeg * 10) / 10,
    lonDeg: Math.round(lonDeg * 10) / 10,
    cellI: i,
    cellJ: j,
    kind: sample.wetness >= 0.5 ? 'water' : 'land',
    foundedHomeHours: nowPlanetHours(state, nowMs),
    nutrients: endowmentFor(surface, latDeg, lonDeg),
  };
  return {
    state: {
      ...state,
      sites: [...state.sites, site],
      siteStores: { ...state.siteStores, [key]: {} },
    },
    text: `建好了站点 ${key}：${site.kind === 'water' ? '水边湿地' : '旱地'}，水分 ${sample.wetness}、潜力 ${sample.fertility}、海拔 ${sample.elevationM} m；土里 氮 ${site.nutrients.n} 磷 ${site.nutrients.p} 钾 ${site.nutrients.k} 微量 ${site.nutrients.trace}。`,
  };
}

/** 把一袋种子种到站点上（一袋 5 粒，一次全种下）。 */
export function sowAt(
  system: StarSystem,
  state: GameState,
  siteKey: string,
  bagId: string,
  count: number,
  nowMs: number,
): { state: GameState; text: string } {
  if (state.transit) throw new Error('移动途中不能种东西。');
  const site = state.sites.find((s) => s.key === siteKey);
  const planter = site
    ? undefined
    : siteKey.startsWith(PLANTER_KEY_PREFIX)
      ? state.structures.find((s) => s.kind === 'planter' && s.id === siteKey.slice(PLANTER_KEY_PREFIX.length))
      : undefined;
  if (!site && !planter) throw new Error(`没有这个站点：${siteKey}`);
  const bag = state.seedBags.find((b) => b.id === bagId);
  if (!bag) throw new Error(`手里没有这袋种子：${bagId}`);
  const spec = SPECIES[bag.species];
  const current = state.plants[siteKey] ?? [];
  const want = Math.max(1, Math.min(count, bag.count));
  const capacity = planter ? PLANTER_SLOTS : SITE_CAPACITY;
  if (current.length + want > capacity) {
    throw new Error(
      planter
        ? `一只种植盆最多同时种 ${PLANTER_SLOTS} 粒，现在有 ${current.length} 株。`
        : `这个站点最多 ${SITE_CAPACITY} 株/群，现在有 ${current.length}。`,
    );
  }
  if (!planter && spec.medium === 'water' && site!.kind !== 'water') {
    throw new Error(`${spec.name}是水生的，要种在水边湿地站点上。`);
  }
  const planted = nowPlanetHours(state, nowMs);
  const next = [...current];
  for (let n = 0; n < want; n += 1) {
    const id = `${siteKey}#${(state.plants[siteKey]?.length ?? 0) + n + 1}`;
    next.push(newPlant(id, bag.species, bag.genes, planted));
  }
  const bags = state.seedBags
    .map((b) => (b.id === bagId ? { ...b, count: b.count - want } : b))
    .filter((b) => b.count > 0);
  return {
    state: { ...state, plants: { ...state.plants, [siteKey]: next }, seedBags: bags },
    text: `在 ${siteKey} 种下 ${want} ${spec.model === 'colony' ? '群' : '株'}${spec.name}。`,
  };
}

/** 收一株/一群。 */
export function harvestAt(system: StarSystem, state: GameState, siteKey: string, plantId: string): { state: GameState; text: string } {
  const list = state.plants[siteKey] ?? [];
  const plant = list.find((p) => p.id === plantId);
  if (!plant) throw new Error(`这个地方没有这株作物：${plantId}`);
  const site = state.sites.find((s) => s.key === siteKey);
  let fertility = siteKey.startsWith(PLANTER_KEY_PREFIX) ? PLANTER_CLIMATE.fertility : 0.5;
  if (site) {
    const planet = system.planets[site.planetIndex - 1];
    if (planet && planet.surface.kind === 'terrestrial') {
      fertility = sampleCell(planet.surface, site.latDeg, site.lonDeg).fertility;
    }
  }
  const result = harvestPlant(plant, fertility);
  const gained = round2(result.biomassKg + (result.resource === 'biomass' ? 0 : result.resourceKg));
  if (gained > 0) ensureInventoryRoom(state, gained);
  const nextList = result.plant ? list.map((p) => (p.id === plantId ? result.plant! : p)) : list.filter((p) => p.id !== plantId);
  const inventory = { ...state.inventory };
  if (result.resource === 'biomass') {
    inventory.biomass = round2((inventory.biomass ?? 0) + result.biomassKg);
  } else {
    inventory[result.resource] = round2((inventory[result.resource] ?? 0) + result.resourceKg);
    inventory.biomass = round2((inventory.biomass ?? 0) + result.biomassKg);
  }
  const sites = site
    ? state.sites.map((s) => (s.key === siteKey ? { ...s, nutrients: removeNutrients(s.nutrients, gained) } : s))
    : state.sites;
  const shortage = site && gained > 0 ? shortageNote(site.nutrients, removeNutrients(site.nutrients, gained)) : '';
  return {
    state: { ...state, plants: { ...state.plants, [siteKey]: nextList }, inventory, sites },
    text: `${result.text}${result.resource !== 'biomass' && result.resourceKg > 0 ? `另得 ${result.resourceKg} kg${RESOURCE_LABELS[result.resource]}。` : ''}${shortage}`,
  };
}

/** 2.0.6：把地里长着的东西挖回种子袋（保留原基因，代价是不能收了）。 */
export const TRANSPLANT_COST_KJ = 500;
export const TRANSPLANT_MIN_PROGRESS = 0.15;
export const TRANSPLANT_MIN_COLONY_KG = 5;
export const TRANSPLANT_COLONY_TAKE_KG = 3;

export function transplantAt(state: GameState, siteKey: string, plantId: string): { state: GameState; text: string } {
  if (state.transit) throw new Error('移动途中不能移栽。');
  const list = state.plants[siteKey] ?? [];
  const plant = list.find((p) => p.id === plantId);
  if (!plant) throw new Error(`这个地方没有这株作物：${plantId}`);
  const spec = SPECIES[plant.species];
  const planter = siteKey.startsWith(PLANTER_KEY_PREFIX);
  const isSite = state.sites.some((s) => s.key === siteKey);
  if (!planter && !isSite) throw new Error(`没有这个站点：${siteKey}`);
  if (spec.model === 'colony' && plant.biomassKg < TRANSPLANT_MIN_COLONY_KG) {
    throw new Error(`${spec.name}这一群才 ${round2(plant.biomassKg)} kg——挖一份样本至少要有 ${TRANSPLANT_MIN_COLONY_KG} kg，再等它长一会儿。`);
  }
  if (spec.model === 'individual' && plant.stage === 'seed' && plant.progress < TRANSPLANT_MIN_PROGRESS) {
    throw new Error(`${spec.name}刚发芽，挖出来也活不了：再长一会儿（至少 ${Math.round(TRANSPLANT_MIN_PROGRESS * 100)}%）。`);
  }
  const next = spendEnergy(state, TRANSPLANT_COST_KJ, `移栽${spec.name}`);
  const grown = plant.stage === 'ripe' || plant.progress >= 0.9;
  const seeds = spec.model === 'colony' ? SEEDS_PER_BAG : grown ? 2 : 1;
  const taken = spec.model === 'colony'
    ? { ...plant, biomassKg: round3(plant.biomassKg - TRANSPLANT_COLONY_TAKE_KG), stage: plant.stage }
    : null;
  const nextList = taken
    ? list.map((p) => (p.id === plantId ? taken : p))
    : list.filter((p) => p.id !== plantId);
  const same = next.seedBags.find((b) => b.species === plant.species && geneHash(b.genes) === geneHash(plant.genes));
  const bags = same
    ? next.seedBags.map((b) => (b.id === same.id ? { ...b, count: b.count + seeds } : b))
    : [
        ...next.seedBags,
        {
          id: seedId(plant.species, next.seedsPurchased + next.seedBags.length + 1),
          species: plant.species,
          genes: plant.genes,
          premium: false,
          count: seeds,
        },
      ];
  return {
    state: { ...next, plants: { ...next.plants, [siteKey]: nextList }, seedBags: bags },
    text: `${spec.model === 'colony' ? `从${spec.name}这一群里取了一份样本（${TRANSPLANT_COLONY_TAKE_KG} kg），` : `把${spec.name}挖了出来，`}得到 ${seeds} 粒${spec.name}种子——基因和原来一样。${spec.model === 'colony' ? '' : '这株不能再收了。'}`,
  };
}

/** 拔掉一株死掉的作物（枯死、或应激到几乎没有生机）。活着的不能拔：收掉或移栽。 */
export const REMOVE_MIN_HEALTH = 0.2;

export function removePlant(state: GameState, siteKey: string, plantId: string): { state: GameState; text: string } {
  if (state.transit) throw new Error('移动途中不能清理庄稼。');
  const list = state.plants[siteKey] ?? [];
  const plant = list.find((p) => p.id === plantId);
  if (!plant) throw new Error(`这个地方没有这株作物：${plantId}`);
  const planter = siteKey.startsWith(PLANTER_KEY_PREFIX);
  const isSite = state.sites.some((s) => s.key === siteKey);
  if (!planter && !isSite) throw new Error(`没有这个站点：${siteKey}`);
  const spec = SPECIES[plant.species];
  const dead = plant.stage === 'withering' || plant.health < REMOVE_MIN_HEALTH;
  if (!dead) {
    throw new Error(`${spec.name}还活着（健康 ${Math.round(plant.health * 100)}%）——想处理它就收掉（如果结实）或者移栽（挖回种子），别直接拔。`);
  }
  const nextList = list.filter((p) => p.id !== plantId);
  return {
    state: { ...state, plants: { ...state.plants, [siteKey]: nextList } },
    text: `拔掉了${spec.name}。${planter ? '种植盆腾出一格。' : '这块地空出来了，可以补种。'}`,
  };
}

/**
 * 自交/杂交（2.1.0）。自交沿用母本基因、只抖 ±3%，产量每代 −4%（近交衰退）；
 * 杂交取双亲平均再抖 ±8%、三成概率直接继承更好的那个。都吃电、吃时间，产出是新种子袋。
 */
export function breedAt(
  state: GameState,
  siteKey: string,
  plantId: string,
  mode: 'self' | 'cross',
  partnerId?: string,
): { state: GameState; text: string } {
  if (state.transit) throw new Error('移动途中不能留种。');
  const list = state.plants[siteKey] ?? [];
  const plant = list.find((p) => p.id === plantId);
  if (!plant) throw new Error(`这个地方没有这株作物：${plantId}`);
  const spec = SPECIES[plant.species];
  const planter = siteKey.startsWith(PLANTER_KEY_PREFIX);
  const isSite = state.sites.some((s) => s.key === siteKey);
  if (!planter && !isSite) throw new Error(`没有这个站点：${siteKey}`);
  if (spec.model === 'colony') {
    throw new Error(`${spec.name}是群落，不能自交/杂交——想留种就用【移栽】取样本。`);
  }
  if (plant.stage === 'withering' || plant.health <= 0) {
    throw new Error(`${spec.name}已经死了，留不了种。`);
  }
  const ready = (p: PlantRecord): boolean => p.stage === 'ripe' || p.progress >= BREED_MIN_PROGRESS;
  if (!ready(plant)) {
    throw new Error(`${spec.name}才长了 ${Math.round(plant.progress * 100)}%，开花前留不了种（至少要 ${Math.round(BREED_MIN_PROGRESS * 100)}%）。`);
  }
  let partner: PlantRecord | undefined;
  if (mode === 'cross') {
    if (!partnerId) throw new Error('杂交要指定另一株：partner 传它的 id。');
    partner = list.find((p) => p.id === partnerId);
    if (!partner) throw new Error(`这个站点没有那株作物：${partnerId}`);
    if (partner.id === plant.id) throw new Error('杂交要两株不同的作物。');
    if (partner.species !== plant.species) {
      throw new Error(`杂交只能在同物种之间做：${spec.name}和${SPECIES[partner.species].name}配不到一起。`);
    }
    if (!ready(partner)) {
      throw new Error(`搭档才长了 ${Math.round(partner.progress * 100)}%，还没开花（至少要 ${Math.round(BREED_MIN_PROGRESS * 100)}%）。`);
    }
  }
  const energy = mode === 'self' ? BREED_SELF_KJ : BREED_CROSS_KJ;
  const hours = mode === 'self' ? BREED_SELF_HOURS : BREED_CROSS_HOURS;
  const seeds = mode === 'self' ? BREED_SELF_SEEDS : BREED_CROSS_SEEDS;
  const next = spendEnergy(state, energy, mode === 'self' ? `+${spec.name}自交` : `+${spec.name}杂交`);
  const genes = mode === 'self'
    ? selfedGenes(plant.genes, `${plant.id}:${plant.progress}:${next.energyKj}`)
    : crossedGenes(plant.genes, partner!.genes, `${plant.id}:${partner!.id}:${next.energyKj}`);
  const bag = {
    id: seedId(plant.species, next.seedsPurchased + next.seedBags.length + 1),
    species: plant.species,
    genes,
    premium: false,
    count: seeds,
  };
  const stateOut: GameState = {
    ...next,
    seedBags: [...next.seedBags, bag],
    lastFloraHomeHours: (next.lastFloraHomeHours ?? 0) + hours,
  };
  return {
    state: stateOut,
    text: mode === 'self'
      ? `${spec.name}自交了：得到 ${seeds} 粒种子（产量基因 ${plant.genes.yield} → ${genes.yield}，会一代代退一点）。`
      : `${spec.name}杂交了：得到 ${seeds} 粒种子（产量 ${plant.genes.yield}×${partner!.genes.yield} → ${genes.yield}，耐寒最适 ${genes.tempOptC}℃）。`,
  };
}

/** 藻肥：取一丛蓝藻的湿重，给目标站点补氮（和一点钾）。这是把固氮搬走的办法。 */
export function applyAlgae(
  system: StarSystem,
  state: GameState,
  targetSiteKey: string,
  colonySiteKey: string,
  plantId: string,
): { state: GameState; text: string } {
  if (state.transit) throw new Error('移动途中不能拌藻肥。');
  const target = state.sites.find((s) => s.key === targetSiteKey);
  if (!target) throw new Error(`没有这个站点：${targetSiteKey}`);
  if (target.kind !== 'land') throw new Error('藻肥泼在旱地上才有意义：湿地站点本来就不缺氮。');
  const colony = (state.plants[colonySiteKey] ?? []).find((p) => p.id === plantId);
  if (!colony) throw new Error(`这里没有这丛蓝藻：${plantId}`);
  if (colony.species !== 'cyanobacteria') throw new Error(`${SPECIES[colony.species].name}不固氮：只有蓝藻能做藻肥。`);
  if (colony.biomassKg < ALGAE_FERTILIZER_KG) {
    throw new Error(`这一丛蓝藻才 ${round2(colony.biomassKg)} kg——拌一份藻肥要 ${ALGAE_FERTILIZER_KG} kg，再等它长一会儿。`);
  }
  const next = spendEnergy(state, ALGAE_FERTILIZER_KJ, '拌藻肥');
  const cap = Math.max(nutrientCapOf(system, target) || 1, target.nutrients.n);
  const stock = addNutrients(target.nutrients, { n: ALGAE_FERTILIZER_N, k: ALGAE_FERTILIZER_K }, cap);
  const kept = { ...colony, biomassKg: round3(colony.biomassKg - ALGAE_FERTILIZER_KG) };
  return {
    state: {
      ...next,
      sites: next.sites.map((s) => (s.key === targetSiteKey ? { ...s, nutrients: stock } : s)),
      plants: {
        ...next.plants,
        [colonySiteKey]: (next.plants[colonySiteKey] ?? []).map((p) => (p.id === plantId ? kept : p)),
      },
    },
    text: `拌好一份藻肥，泼在 ${targetSiteKey}：氮 +${ALGAE_FERTILIZER_N}（现在 ${stock.n}）、钾 +${ALGAE_FERTILIZER_K}。那丛蓝藻还剩 ${kept.biomassKg} kg。`,
  };
}

/** 背包容量（kg，干重）。种子袋不计重。 */
export const INVENTORY_LIMIT_KG = 50;

/** 仓库、火箭这类容器（按建筑 id 存内容）。 */
export function storeWeightKg(store: Record<string, number> | undefined): number {
  if (!store) return 0;
  let sum = 0;
  for (const value of Object.values(store)) sum += value;
  return round3(sum);
}

export const WAREHOUSE_CAPACITY_KG = 1_000;
export const WAREHOUSE_COST_KJ = 50_000;
export const DRONE_COST_KJ = 800_000;

// ── 1.4.0：原子打印机、钨、采矿机与行星电网 ────────────────────────────────

/** 开局船上带的钨（份）。 */
export const TUNGSTEN_START = 100;
/** 蓝图结构优化：钨消耗 ×0.75（向下取整，最少 1 份）。 */
export const BLUEPRINT_TUNGSTEN_FACTOR = 0.75;
export const BLUEPRINTS_COST_KJ = 200_000;
export const BLUEPRINTS_TUNGSTEN = 3;
export const BLUEPRINTS_FIBER_KG = 2;
export const BLUEPRINTS_HOME_HOURS = 1;

/** 采矿机：只能建在岩石行星的陆地上（海拔 ≥ 800 m），产率随所在格剩余矿量走。 */
export const MINER_COST_KJ = 40_000;
export const MINER_TUNGSTEN = 2;
export const MINER_HOME_HOURS = 0.5;
export const MINER_KJ_PER_HOUR = 800;
export const MINER_MIN_ELEVATION_M = 800;
export const MINER_PER_HOUR_MIN = 0.2;
export const MINER_PER_HOUR_MAX = 2.0;

// ── 1.5.0：余电、质谱仪与钨矿含量 ─────────────────────────────────────────

/** 一格地的钨矿上限（份）。表面每格都在 0…500 之间。 */
export const ORE_PER_CELL_MAX = 500;
/** 迫降后船里剩下的电：2,000–5,000 kJ，由种子决定。 */
export const STARTUP_ENERGY_MIN = 2_000;
export const STARTUP_ENERGY_MAX = 5_000;
/** 质谱仪：25,000 kJ + 1 份钨 + 0.5 母星时；扫一次冷却 6 母星时。 */
export const SPECTROMETER_COST_KJ = 25_000;
export const SPECTROMETER_TUNGSTEN = 1;
export const SPECTROMETER_HOME_HOURS = 0.5;
export const SPECTROMETER_RANGE_KM = 2_000;
export const SPECTROMETER_COOLDOWN_HOME_HOURS = 6;

/** 迫降后剩下的电：由世界种子决定，重开会换一个数。 */
export function startupEnergyKj(seed: number | string = 0): number {
  const h = hashSeed(`wreck:${seed}`);
  return STARTUP_ENERGY_MIN + (h % (STARTUP_ENERGY_MAX - STARTUP_ENERGY_MIN + 1));
}

/** 整流电塔：一颗行星只能有一座；没有它，这颗星发的电没有地方去。 */
export const RECTIFIER_COST_KJ = 40_000;
export const RECTIFIER_TUNGSTEN = 2;
export const RECTIFIER_HOME_HOURS = 0.5;
export const RECTIFIER_KJ_PER_HOUR = 200;
/** 【交易终端】：连着无人机，每天商人开张时把指定资源自动卖掉一次（净价 0，只清库存）。 */
export const TERMINAL_COST_KJ = 60_000;
export const TERMINAL_TUNGSTEN = 2;
export const TERMINAL_HOME_HOURS = 0.5;
export const TERMINAL_KJ_PER_HOUR = 100;

/** 仓储终端：不是仓库，是一张编排表——决定「哪些容器、按什么优先级」喂给交易终端。 */
export const STORAGE_TERMINAL_COST_KJ = 20_000;
export const STORAGE_TERMINAL_TUNGSTEN = 1;
export const STORAGE_TERMINAL_HOME_HOURS = 0.3;
export const STORAGE_TERMINAL_KJ_PER_HOUR = 50;
/** 参与编排的容器种类。 */
export const STORAGE_KINDS = ['warehouse', 'cold_store', 'inert_room'] as const;

/**
 * 【机械臂】：基地内部那一段物流——把几个输入容器的散货搬进一个输出容器。
 * 只在 5 km 内工作（比 2,000 km 的无人机短得多），所以它是「同一个基地里」的设备，
 * 不是行星尺度的。每颗行星最多 20 座。
 */
export const ARM_COST_KJ = 15_000;
export const ARM_TUNGSTEN = 1;
export const ARM_HOME_HOURS = 0.2;
export const ARM_KJ_PER_HOUR = 120;
export const ARM_KG_PER_HOUR = 40;
export const ARM_KJ_PER_KG = 0.05;
export const ARM_RANGE_KM = 5;
export const ARM_MAX_PER_PLANET = 20;
/** 终端只是「收货口」：干散货缓冲 200 kg、种子缓冲 20 袋；满了就不收，等人或无人机来搬。 */
export const TERMINAL_BUFFER_KG = 200;
export const TERMINAL_BAG_SLOTS = 20;
/** 所有能存袋子的容器（仓库、冷库、惰性气体室、交易终端）统一的袋位上限。 */
export const CONTAINER_BAG_SLOTS = 20;
/** 自动买种子：每个终端每天最多 1 袋，按随机种子的阶梯价付 kJ。 */
export const AUTO_SEED_BAGS_PER_DAY = 1;

/**
 * 【值班终端】：一座终端绑一座居所 + 一个仓库 + 若干站点（都在 5 km 内）。
 * 没有终端，这座居所的人就只吃饭不干活；有了终端，人手才按份下地。
 */
export const DUTY_COST_KJ = 30_000;
export const DUTY_TUNGSTEN = 1;
export const DUTY_HOME_HOURS = 0.3;
export const DUTY_KJ_PER_HOUR = 60;
export const DUTY_RANGE_KM = 5;
export const DUTY_MAX_SITES = 6;
/** 20 kg 生物质能补多少养分（只补磷/钾/微量——氮只能靠蓝藻固氮）。 */
export const FERTILIZER_PER_KG = 0.0002;

// —— 2.0.0：空天母舰与气体工业 ——

/** 空天母舰：能量便宜、钨贵，换一个能在气压面上待着的落脚点。 */
export const CARRIER_COST_KJ = 60_000;
export const CARRIER_TUNGSTEN = 40;
export const CARRIER_HOME_HOURS = 1.5;
export const CARRIER_KJ_PER_HOUR = 300;
/** 母舰上最多挂几座子建筑。 */
export const CARRIER_SUBS = 6;
/** 母舰自己的货舱、袋位与住人上限。 */
export const CARRIER_HOLD_KG = 300;
export const CARRIER_CREW_CAP = 10;
/** 子建筑挂在 `carrier:<id>` 这个合成键下。 */
export const CARRIER_KEY_PREFIX = 'carrier:';
/** 母舰上不允许造的：要贴地表格子的那几样。 */
export const CARRIER_BANNED: Array<StructureRecord['kind']> = ['biome_changer', 'miner', 'rectifier'];

export const WIND_COST_KJ = 25_000;
export const WIND_TUNGSTEN = 3;
export const WIND_HOME_HOURS = 0.5;
export const WIND_KJ_PER_HOUR = 50;
/** 风暴带（群系 12–16）里的风电量；其他群系只有高海拔（≥3,000 m）有零头。 */
export const WIND_STORM_KJ_PER_HOUR = 9_000;
export const WIND_HIGHLAND_KJ_PER_HOUR = 1_500;
export const WIND_HIGHLAND_MIN_M = 3_000;

export const FIRE_COST_KJ = 8_000;
export const FIRE_TUNGSTEN = 1;
export const FIRE_HOME_HOURS = 0.2;
export const FIRE_KJ_PER_HOUR = 80;
/** 每小时最多烧多少 kg 固体燃料。 */
export const FIRE_BURN_KG_PER_HOUR = 40;
/** 灰仓容量（灰就是草木灰，能补磷钾）。 */
export const FIRE_ASH_CAP_KG = 200;
export const FIRE_ASH_PER_KG = 0.06;
/** 固体燃料的燃烧值（kJ/kg）。 */
export const FIRE_FUEL_KJ: Record<string, number> = {
  biomass: 3_750,
  fiber: 2_500,
  charcoal: 6_000,
  dry_food: 3_000,
};

export const CONVERTER_COST_KJ = 45_000;
export const CONVERTER_TUNGSTEN = 3;
export const CONVERTER_HOME_HOURS = 0.5;
export const CONVERTER_KJ_PER_HOUR = 150;
/** 每小时转换几个「单位」。 */
export const CONVERTER_UNITS_PER_HOUR = 2;
/** 配方：气 ↔ 液，按单位 1:1 换。 */
export const CONVERTER_RECIPES: Record<string, { gas: string; liquid: string; label: string }> = {
  ammonia: { gas: 'ammonia_gas', liquid: 'ammonia_liquid', label: '氨' },
  methane: { gas: 'methane_gas', liquid: 'methane_liquid', label: '甲烷' },
  oxygen: { gas: 'oxygen', liquid: 'oxygen_liquid', label: '氧' },
};

/** 罐装液氨：一个站点 +0.1 氮；用掉后返还 90% 的钢瓶（向下取整，所以一次用 10 罐返 9 罐）。 */
export const CANNED_AMMONIA_N = 0.1;
export const CANNED_RETURN_FRACTION = 0.9;


/**
 * 【种植盆】：一只通电的小暖箱。不占地、不产堆场，只同时种 3 粒种子。
 * 造价与维护都低到「开局第一天就能有」——极热/极冷母星不必先攒 10 万 kJ 的温室。
 * 它的环境是人工的：通电夹 0–28℃，湿度固定 0.7，肥力固定 0.6。
 */
export const PLANTER_COST_KJ = 8_000;
export const PLANTER_HOME_HOURS = 0.1;
export const PLANTER_KJ_PER_HOUR = 20;
export const PLANTER_SLOTS = 3;
export const PLANTER_KEY_PREFIX = 'planter:';
/** 种植盆里的人工气候。 */
export const PLANTER_CLIMATE = { tempC: 22, wetness: 0.7, fertility: 0.6 } as const;
/**
 * 种植盆的人工基质：四维养分固定在「够用八成」的水平。
 * 只靠通电换来的气候，不随脚下的土走，也不消耗——不能施肥，也不会被种瘦。
 * （最挑食的深根系需求是 氮0.45/磷0.3/钾0.35/微量0.15，这里刚好压到八成左右。）
 */
export const PLANTER_SUBSTRATE = { n: 0.36, p: 0.24, k: 0.28, trace: 0.12 } as const;

/**
 * 【着陆舱】：坠毁的船本身。一开局就摆在那儿，里面是迫降前攒下的口粮、水和氧气。
 * 20 个人睡着时每小时只吃 20%，40 kg 粮 / 160 L 水 / 24 kg 氧大约够 400 / 400 / 171 母星时。
 * 醒着的人吃居所里的，睡着的人吃着陆舱里的——谁都不能白吃。
 */
export const SHIP_POD_ID = 'pod';
export const POD_STOCK = { biomass: 40, water_drink: 160, oxygen: 24 } as const;
/** 补给掉到初始量的这个比例以下，提醒一次。 */
export const POD_ALERT_FRACTION = 0.25;

/** 电网：容量 = 本星每小时产能 × 24，最少 100,000、最多 2,000,000。 */
export const GRID_CAP_HOURS = 24;
export const GRID_CAP_MIN_KJ = 100_000;
export const GRID_CAP_MAX_KJ = 2_000_000;
/** 取电/入网：站在电塔 2,000 km 内，手动申请；每搬一次 10,000 kJ、花 0.1 母星时（= 100,000 kJ/母星时）。 */
export const GRID_TAP_RANGE_KM = 2_000;
export const GRID_TAP_KJ_PER_HOUR = 100_000;
export const GRID_TAP_KJ_PER_CALL = 10_000;
export const GRID_TAP_HOME_HOURS = 0.1;
/** 电网 ↔ 电池：10% 损耗（90% 留下）。 */
export const GRID_LOSS_FACTOR = 0.9;

/** 商人卖的【能量块】：5,000 kJ 一块，120 信用点（比烧生物质贵三倍，适合应急）。 */
export const ENERGY_BLOCK_KJ = 5_000;
export const ENERGY_BLOCK_CREDITS = 120;
/** 商人卖的钨：700 信用点/份，每天 5 份；商人不回收钨。 */
export const TUNGSTEN_PRICE_CREDITS = 700;export const DRONE_KJ_PER_KG = 100;
export const ROCKET_CAPACITY_KG = 250;
export const ROCKET_COST_KJ = 500_000;

export function inventoryWeight(state: GameState): number {
  let total = 0;
  for (const amount of Object.values(state.inventory)) total += amount;
  return Math.round(total * 100) / 100;
}

function ensureInventoryRoom(state: GameState, incomingKg: number): void {
  const weight = inventoryWeight(state);
  if (weight + incomingKg > INVENTORY_LIMIT_KG + 1e-9) {
    throw new Error(
      `背包快满了：现在 ${weight} kg，上限 ${INVENTORY_LIMIT_KG} kg，这一趟要再加 ${incomingKg} kg。先卖掉或烧掉一些。`,
    );
  }
}

/** 收获后哪一维见底了——工具里提一句，模型才知道该补肥。 */
function shortageNote(before: import('./flora.ts').NutrientStock, after: import('./flora.ts').NutrientStock): string {
  const names: Array<[keyof typeof after, string]> = [
    ['n', '氮'],
    ['p', '磷'],
    ['k', '钾'],
    ['trace', '微量元素'],
  ];
  const low = names.filter(([id]) => after[id] < 0.05 && before[id] >= 0.05).map(([, label]) => label);
  return low.length ? `\n注意：这块地的${low.join('、')}快见底了。` : '';
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** 重量类数字留三位小数（千克）。 */
export function round3(value: number): number {
  return Math.round(value * 1_000) / 1_000;
}

/** 烧生物质发电；灰自动进背包（30 kg 生物质 ≈ 0.9 kg 灰）。 */
export function burnBiomass(state: GameState, kg: number): { state: GameState; text: string } {
  const have = state.inventory.biomass ?? 0;
  if (kg <= 0) throw new Error('要烧多少 kg？');
  if (have < kg) throw new Error(`仓库里只有 ${have} kg 生物质。`);
  const gain = burnKj(kg);
  const ashKg = Math.round(kg * ASH_PER_KG * 100) / 100;
  const cap = energyCapOf(state);
  const stored = Math.min(cap, state.energyKj + gain);
  const wasted = Math.round((state.energyKj + gain - stored) * 10) / 10;
  return {
    state: {
      ...state,
      inventory: {
        ...state.inventory,
        biomass: round2(have - kg),
        ash: round2((state.inventory.ash ?? 0) + ashKg),
      },
      energyKj: stored,
    },
    text:
      `烧掉 ${kg} kg 生物质，得到 ${gain} kJ，留下 ${ashKg} kg 草木灰（已进背包）。` +
      (wasted > 0 ? ` 电池装不下，${wasted} kJ 白白散掉了（上限 ${cap.toLocaleString('en-US')} kJ，升级【蓄电池】能多存一些）。` : ''),
  };
}

/** 撒草木灰：补磷、钾、微量元素，不补氮。0.05 母星时，不耗电。 */
export function applyAsh(system: StarSystem, state: GameState, siteKey: string, kg: number): { state: GameState; text: string } {
  const site = state.sites.find((s) => s.key === siteKey);
  if (!site) throw new Error(`没有这个站点：${siteKey}`);
  const have = state.inventory.ash ?? 0;
  if (kg <= 0) throw new Error('要撒多少 kg 灰？');
  if (have + 1e-9 < kg) throw new Error(`背包里只有 ${have} kg 草木灰。`);
  const cap = nutrientCapOf(system, site);
  const next = advanceHomeHours(state, 0.05);
  const nutrients = addNutrients(
    site.nutrients,
    {
      p: ASH_NUTRIENTS_PER_KG.p * kg,
      k: ASH_NUTRIENTS_PER_KG.k * kg,
      trace: ASH_NUTRIENTS_PER_KG.trace * kg,
    },
    cap,
    cap * traceCapOf(system, state, site),
  );
  return {
    state: {
      ...next,
      inventory: { ...next.inventory, ash: round2(have - kg) },
      sites: next.sites.map((s) => (s.key === siteKey ? { ...s, nutrients } : s)),
    },
    text: `在 ${siteKey} 撒下 ${kg} kg 草木灰。土里现在 氮 ${nutrients.n} 磷 ${nutrients.p} 钾 ${nutrients.k} 微量 ${nutrients.trace}。`,
  };
}

/** 堆肥：把生物质直接沤回地里，补磷钾微量、不补氮。不耗时。 */
export function compostAt(system: StarSystem, state: GameState, siteKey: string, kg: number): { state: GameState; text: string } {
  const site = state.sites.find((s) => s.key === siteKey);
  if (!site) throw new Error(`没有这个站点：${siteKey}`);
  const have = state.inventory.biomass ?? 0;
  if (kg <= 0) throw new Error('要沤多少 kg 生物质？');
  if (have + 1e-9 < kg) throw new Error(`背包里只有 ${have} kg 生物质。`);
  const cap = nutrientCapOf(system, site);
  const nutrients = addNutrients(
    site.nutrients,
    {
      p: COMPOST_NUTRIENTS_PER_KG.p * kg,
      k: COMPOST_NUTRIENTS_PER_KG.k * kg,
      trace: COMPOST_NUTRIENTS_PER_KG.trace * kg,
    },
    cap,
    cap * traceCapOf(system, state, site),
  );
  return {
    state: {
      ...state,
      inventory: { ...state.inventory, biomass: round2(have - kg) },
      sites: state.sites.map((s) => (s.key === siteKey ? { ...s, nutrients } : s)),
    },
    text: `把 ${kg} kg 生物质沤进 ${siteKey}。土里现在 氮 ${nutrients.n} 磷 ${nutrients.p} 钾 ${nutrients.k} 微量 ${nutrients.trace}。`,
  };
}

/** 站点养分的上限＝所在格子的潜力（`fertility`）。 */
function nutrientCapOf(system: StarSystem, site: Site): number {
  const planet = system.planets[site.planetIndex - 1];
  if (!planet || planet.surface.kind !== 'terrestrial') return 1;
  return Math.min(1, Math.max(0.05, sampleCell(planet.surface, site.latDeg, site.lonDeg).fertility));
}

/**
 * 微量元素的上限：普通格子与 `nutrientCapOf` 相同；被群系改变器改完的格子翻倍
 * （「富集微量元素」——这是改造的第二个收益，第一个是气候）。
 */
function traceCapOf(system: StarSystem, state: GameState, site: Site): number {
  const planet = system.planets[site.planetIndex - 1];
  if (!planet || planet.surface.kind !== 'terrestrial') return 1;
  const cell = sampleCell(planet.surface, site.latDeg, site.lonDeg);
  const p = terraProgress(state.terra, site.planetIndex, cell.cellI, cell.cellJ);
  const scar = scarAt(system, state, site.planetIndex, cell.cellI, cell.cellJ);
  return (p >= 1 ? 2 : 1) * (1 - 0.5 * scar);
}

/** 在站点采一份测绘数据（0.1 母星时，每站点每天一次）。 */
/**
 * 测测绘：每颗行星的**每个群系**只认第一次。
 *
 * 站点所在的格子决定群系；同一颗行星上，第一次测某个群系才出数据。
 * 难去的地方（|纬度| ≥ 60、群系本身是海/冰盖/风暴带、海拔 ≥ 3,000 m）给 2 份，
 * 别的给 1 份——所以数据量跟着「走过多少种地貌」走，而不是「点过几天按钮」走。
 */
export function surveySite(
  system: StarSystem,
  state: GameState,
  siteKey: string,
  _nowMs: number,
): { state: GameState; text: string } {
  const site = state.sites.find((s) => s.key === siteKey);
  if (!site) throw new Error(`没有这个站点：${siteKey}`);
  const planet = system.planets[site.planetIndex - 1];
  if (!planet) throw new Error(`没有 ${site.planetIndex} 号行星。`);
  const surface = planet.surface;
  const biome = surface.biome[site.cellI]?.[site.cellJ];
  if (biome === undefined) throw new Error(`站点的格子 ${site.cellI},${site.cellJ} 不在这颗行星上。`);
  const label = BIOME_LABELS[biome] ?? `群系 ${biome}`;
  const key = `p${site.planetIndex}:${biome}`;
  if (state.surveyed[key] !== undefined) {
    throw new Error(`这个群系已经测过了：${label}。每颗行星的每个群系只认第一次——换一种地貌再测。`);
  }
  const elevationM = surface.kind === 'terrestrial' ? (surface.elevationM[site.cellI]?.[site.cellJ] ?? 0) : 0;
  const hard =
    Math.abs(site.latDeg) >= 60 || biome === 0 || biome === 1 || (biome >= 12 && biome <= 16) || elevationM >= 3_000;
  const found = hard ? 2 : 1;
  const next = advanceHomeHours(state, 0.1);
  // 母星以外的站点，采样时顺手带一份原生生命样本回来（育种与订单都要它）。
  const foreign = site.planetIndex !== state.homePlanetIndex;
  const samples = next.samples + (foreign ? 1 : 0);
  return {
    state: {
      ...next,
      samples,
      inventory: { ...next.inventory, survey: (next.inventory.survey ?? 0) + found },
      surveyed: { ...next.surveyed, [key]: found },
    },
    text:
      `测到 ${found} 份测绘数据（${label}，${planet.name} 的第一次）` +
      `${hard ? '——这地方不好来，商人为难走的路多给一份。' : '。'}` +
      `${foreign ? '\n还带了一份原生生命样本回来——它的基因比我们手里的强。' : ''}`,
  };
}

/** 卖给商人。 */
export function sellToMerchant(state: GameState, goodId: ResourceId | 'survey', amount: number, nowMs: number): { state: GameState; text: string } {
  const hours = nowPlanetHours(state, nowMs);
  const level = state.upgrades.telescope;
  if (!shopOpen(hours, level)) throw new Error(`${shopWindowText(hours, level)}`);
  const good = SELL_GOODS.find((g) => g.id === goodId);
  if (!good) throw new Error(`商人不收这个：${goodId}`);
  const have = state.inventory[goodId] ?? 0;
  if (have + 1e-9 < amount) throw new Error(`仓库里只有 ${have} ${good.unit}${good.name}。`);
  const day = dayIndexOf(hours);
  const daily = state.daily.day === day ? state.daily : { day, sold: {}, bought: {} };
  const soldKey = `sell:${goodId}`;
  const sold = daily.sold[soldKey] ?? 0;
  const limit = dailyLimitFor(good, level);
  if (sold + amount > limit) {
    throw new Error(`${good.name}今天最多收 ${limit} ${good.unit}，已经卖了 ${sold}。`);
  }
  const price = sellPrice(good, day);
  const credits = Math.round(price * amount);
  return {
    state: {
      ...state,
      inventory: { ...state.inventory, [goodId]: round2(have - amount) },
      credits: state.credits + credits,
      daily: { ...daily, sold: { ...daily.sold, [soldKey]: sold + amount } },
    },
    text: `卖了 ${amount} ${good.unit}${good.name}，得 ${credits} 信用点（今天这个价位：${price}/单位）。`,
  };
}

/** 星图：商人一天只带一张，300 信用点，画的是离母星最近、你还没见过的天体。 */
export const CHART_PRICE_CREDITS = 300;
export const CHARTS_PER_DAY = 1;

export function buyChart(
  system: StarSystem,
  state: GameState,
  nowMs: number,
): { state: GameState; text: string } {
  const hours = nowPlanetHours(state, nowMs);
  const level = state.upgrades.telescope;
  if (!shopOpen(hours, level)) throw new Error(`${shopWindowText(hours, level)}`);
  const day = dayIndexOf(hours);
  const daily = state.daily.day === day ? state.daily : { day, sold: {}, bought: {} };
  const key = 'buy:chart';
  const bought = daily.bought[key] ?? 0;
  if (bought >= CHARTS_PER_DAY) throw new Error('商人一天只带一张星图：明天再来。');
  const charts = state.charts ?? [];
  const known = new Set([...charts, ...state.visited]);
  const homeAU = system.planets[state.homePlanetIndex - 1]?.aAU ?? 1;
  const candidates = system.planets
    .map((p, index) => ({ p, index: index + 1 }))
    .filter(({ index }) => index !== state.homePlanetIndex && !known.has(`p${index}`))
    .sort((a, b) => Math.abs(a.p.aAU - homeAU) - Math.abs(b.p.aAU - homeAU));
  const pick = candidates[0];
  if (!pick) throw new Error('这一带能画的天体你都知道了：星图没得卖。');
  if (state.credits < CHART_PRICE_CREDITS) {
    throw new Error(`一张星图 ${CHART_PRICE_CREDITS} 信用点，你只有 ${state.credits}：先卖点东西。`);
  }
  const target = `p${pick.index}`;
  const next: GameState = {
    ...state,
    credits: state.credits - CHART_PRICE_CREDITS,
    charts: [...charts, target],
    daily: { ...daily, bought: { ...daily.bought, [key]: bought + 1 } },
  };
  return {
    state: next,
    text: `买了一张星图：${displayName(next, target)}——从今往后不用等观星窗口就能往那儿飞（${CHART_PRICE_CREDITS} 信用点）。到地方再看它是什么。`,
  };
}

/** 买种子：随机基因用 kJ（阶梯价），高级种子用信用点（余额门槛 + 每日限购）。 */export function buySeeds(
  state: GameState,
  kind: 'random' | 'premium',
  species: SpeciesId,
  nowMs: number,
): { state: GameState; text: string } {
  const hours = nowPlanetHours(state, nowMs);
  const level = state.upgrades.telescope;
  if (!shopOpen(hours, level)) throw new Error(`${shopWindowText(hours, level)}`);
  const day = dayIndexOf(hours);
  const daily = state.daily.day === day ? state.daily : { day, sold: {}, bought: {} };
  const streak = hashSeed(`bag:${state.seedsPurchased}:${kind}:${species}`);

  if (kind === 'random') {
    const price = randomSeedPriceKj(state.seedsPurchased);
    if (state.energyKj < price) throw new Error(`能量不够：这袋要 ${price} kJ，现在只有 ${Math.floor(state.energyKj)} kJ。`);
    const bag: SeedBag = {
      id: seedId(species, state.seedsPurchased),
      species,
      genes: randomGenes(species, streak),
      premium: false,
      count: SEEDS_PER_BAG,
    };
    return {
      state: {
        ...state,
        energyKj: state.energyKj - price,
        seedBags: [...state.seedBags, bag],
        seedsPurchased: state.seedsPurchased + 1,
      },
      text: `买了一袋随机${SPECIES[species].name}种子（${SEEDS_PER_BAG} 粒），花了 ${price} kJ。`,
    };
  }

  const good = BUY_GOODS.find((g) => g.id === 'premium_seed')!;
  const boughtKey = 'buy:premium_seed';
  const bought = daily.bought[boughtKey] ?? 0;
  const buyLimit = buyDailyLimitFor(good, level);
  if (bought >= buyLimit) throw new Error(`高级种子今天只剩 ${buyLimit} 袋，已经买满了。`);
  const tier = creditTier(state.credits);
  if (state.credits < good.minCredits) {
    throw new Error(`商人不卖给你：高级种子要 ${good.minCredits} 信用点余额（你现在 ${state.credits}，${tier.label}）。`);
  }
  const price = buyPriceCredits(good, day);
  if (state.credits < price) throw new Error(`信用点不够：这袋要 ${price} 信用点，现在只有 ${state.credits}。`);
  const bag: SeedBag = {
    id: `premium-${state.seedsPurchased}`,
    species,
    genes: premiumGenes(species, streak),
    premium: true,
    count: SEEDS_PER_BAG,
  };
  return {
    state: {
      ...state,
      credits: state.credits - price,
      seedBags: [...state.seedBags, bag],
      seedsPurchased: state.seedsPurchased + 1,
      daily: { ...daily, bought: { ...daily.bought, [boughtKey]: bought + 1 } },
    },
    text: `买了一袋高级${SPECIES[species].name}种子（${SEEDS_PER_BAG} 粒），花了 ${price} 信用点。余额 ${state.credits - price}。`,
  };
}

/** 商人卖的两种「大宗零件」：能量块与钨。都得按望远镜等级的营业窗口与日限额买。 */
export function buyMerchandise(
  state: GameState,
  good: 'energy' | 'tungsten',
  nowMs: number,
): { state: GameState; text: string } {
  const hours = nowPlanetHours(state, nowMs);
  const level = state.upgrades.telescope;
  if (!shopOpen(hours, level)) throw new Error(shopWindowText(hours, level));
  const day = dayIndexOf(hours);
  const daily = state.daily.day === day ? state.daily : { day, sold: {}, bought: {} };
  const key = `buy:${good}`;
  const bought = daily.bought[key] ?? 0;
  const factor = telescopeLimitFactor(level);

  if (good === 'energy') {
    const limit = Math.max(1, Math.round(20 * factor));
    if (bought >= limit) throw new Error(`今天的【能量块】买满了（每天 ${limit} 块）。`);
    const cap = energyCapOf(state);
    const room = cap - state.energyKj;
    if (room <= 0) throw new Error('电池是满的，别再买了——买来也装不下。');
    if (state.credits < ENERGY_BLOCK_CREDITS) {
      throw new Error(`信用点不够：一块【能量块】要 ${ENERGY_BLOCK_CREDITS} 信用点，现在只有 ${state.credits}。`);
    }
    const kj = Math.min(ENERGY_BLOCK_KJ, room);
    return {
      state: {
        ...state,
        energyKj: state.energyKj + kj,
        credits: state.credits - ENERGY_BLOCK_CREDITS,
        daily: { ...daily, bought: { ...daily.bought, [key]: bought + 1 } },
      },
      text: `买了一块【能量块】：${kj.toLocaleString('en-US')} kJ 进电池，花了 ${ENERGY_BLOCK_CREDITS} 信用点（商人送货，没有损耗）。`,
    };
  }

  const limit = Math.max(1, Math.round(5 * factor));
  if (bought >= limit) throw new Error(`今天的【钨】买满了（每天 ${limit} 份）。`);
  if (state.credits < TUNGSTEN_PRICE_CREDITS) {
    throw new Error(`信用点不够：一份【钨】要 ${TUNGSTEN_PRICE_CREDITS} 信用点，现在只有 ${state.credits}。`);
  }
  return {
    state: {
      ...state,
      tungsten: state.tungsten + 1,
      credits: state.credits - TUNGSTEN_PRICE_CREDITS,
      daily: { ...daily, bought: { ...daily.bought, [key]: bought + 1 } },
    },
    text: `买了一份【钨】，花了 ${TUNGSTEN_PRICE_CREDITS} 信用点（现在 ${state.tungsten + 1} 份）。`,
  };
}

export interface BlueprintsCard {
  level: number;
  maxLevel: number;
  costKj: number;
  homeHours: number;
  materials: Array<{ resource: string; label: string; need: number; have: number }>;
  canBuild: boolean;
  blockers: string[];
}

/** 蓝图结构优化：只能做一次，做好了所有建筑少用 25% 的钨。 */
export function blueprintsCard(state: GameState, nowMs = Date.now()): BlueprintsCard {
  const level = state.upgrades.blueprints ?? 0;
  const materials = [
    { resource: 'tungsten', label: '钨', need: BLUEPRINTS_TUNGSTEN, have: state.tungsten },
    { resource: 'fiber', label: '纤维', need: BLUEPRINTS_FIBER_KG, have: state.inventory.fiber ?? 0 },
  ];
  const blockers: string[] = [];
  if (level > 0) blockers.push('已经优化过了。');
  else {
    const queue = buildQueueBlocked(state, nowMs);
    if (queue) blockers.push(queue);
    if (state.energyKj < BLUEPRINTS_COST_KJ) {
      blockers.push(`能量不够：要 ${BLUEPRINTS_COST_KJ.toLocaleString('en-US')} kJ。`);
    }
    for (const m of materials) {
      if (m.have < m.need) blockers.push(`${m.label}不够：要 ${m.need}，现在 ${round3(m.have)}。`);
    }
  }
  return {
    level,
    maxLevel: 1,
    costKj: BLUEPRINTS_COST_KJ,
    homeHours: BLUEPRINTS_HOME_HOURS,
    materials,
    canBuild: level === 0 && blockers.length === 0,
    blockers,
  };
}

export function beginBlueprintsUpgrade(state: GameState, nowMs: number): { state: GameState; text: string } {
  const card = blueprintsCard(state, nowMs);
  if (card.level > 0) throw new Error('蓝图结构优化已经做过了。');
  const queue = buildQueueBlocked(state, nowMs);
  if (queue) throw new Error(queue);
  for (const m of card.materials) {
    if (m.have < m.need) throw new Error(`${m.label}不够：要 ${m.need}，现在 ${round3(m.have)}。`);
  }
  if (state.energyKj < BLUEPRINTS_COST_KJ) {
    throw new Error(`能量不够：蓝图优化要 ${BLUEPRINTS_COST_KJ.toLocaleString('en-US')} kJ。`);
  }
  const nowHome = nowPlanetHours(state, nowMs);
  const pending: PendingBuild = {
    id: 'blueprints',
    kind: 'blueprints',
    siteKey: 'ship',
    planetIndex: state.homePlanetIndex,
    startedHomeHours: nowHome,
    completeHomeHours: nowHome + BLUEPRINTS_HOME_HOURS,
  };
  const inventory = { ...state.inventory };
  const fiberLeft = (inventory.fiber ?? 0) - BLUEPRINTS_FIBER_KG;
  if (fiberLeft > 1e-9) inventory.fiber = round3(fiberLeft);
  else delete inventory.fiber;
  return {
    state: {
      ...state,
      energyKj: state.energyKj - BLUEPRINTS_COST_KJ,
      tungsten: state.tungsten - BLUEPRINTS_TUNGSTEN,
      inventory,
      builds: [...state.builds, pending],
    },
    text: `开工了：蓝图结构优化，花了 ${BLUEPRINTS_COST_KJ.toLocaleString('en-US')} kJ + ${BLUEPRINTS_TUNGSTEN} 份钨 + ${BLUEPRINTS_FIBER_KG} kg 纤维，${BLUEPRINTS_HOME_HOURS} 母星时后好了。好了以后每座建筑少用 25% 的钨。`,
  };
}

export interface SpectrometerCard {
  level: number;
  maxLevel: number;
  costKj: number;
  homeHours: number;
  materials: Array<{ resource: string; label: string; need: number; have: number }>;
  canBuild: boolean;
  blockers: string[];
}

/** 质谱仪：装好以后能扫脚下的钨含量，富矿才值得放采矿机。 */
export function spectrometerCard(state: GameState, nowMs = Date.now()): SpectrometerCard {
  const level = state.upgrades.spectrometer ?? 0;
  const materials = [{ resource: 'tungsten', label: '钨', need: SPECTROMETER_TUNGSTEN, have: state.tungsten }];
  const blockers: string[] = [];
  if (level > 0) blockers.push('已经装好了。');
  else {
    const queue = buildQueueBlocked(state, nowMs);
    if (queue) blockers.push(queue);
    if (state.energyKj < SPECTROMETER_COST_KJ) {
      blockers.push(`能量不够：要 ${SPECTROMETER_COST_KJ.toLocaleString('en-US')} kJ。`);
    }
    for (const m of materials) {
      if (m.have < m.need) blockers.push(`${m.label}不够：要 ${m.need}，现在 ${round3(m.have)}。`);
    }
  }
  return {
    level,
    maxLevel: 1,
    costKj: SPECTROMETER_COST_KJ,
    homeHours: SPECTROMETER_HOME_HOURS,
    materials,
    canBuild: level === 0 && blockers.length === 0,
    blockers,
  };
}

export function beginSpectrometerUpgrade(state: GameState, nowMs: number): { state: GameState; text: string } {
  const card = spectrometerCard(state, nowMs);
  if (card.level > 0) throw new Error('质谱仪已经装好了。');
  const queue = buildQueueBlocked(state, nowMs);
  if (queue) throw new Error(queue);
  for (const m of card.materials) {
    if (m.have < m.need) throw new Error(`${m.label}不够：要 ${m.need}，现在 ${round3(m.have)}。`);
  }
  if (state.energyKj < SPECTROMETER_COST_KJ) {
    throw new Error(`能量不够：质谱仪要 ${SPECTROMETER_COST_KJ.toLocaleString('en-US')} kJ。`);
  }
  const nowHome = nowPlanetHours(state, nowMs);
  const pending: PendingBuild = {
    id: 'spectrometer',
    kind: 'spectrometer',
    siteKey: 'ship',
    planetIndex: state.homePlanetIndex,
    startedHomeHours: nowHome,
    completeHomeHours: nowHome + SPECTROMETER_HOME_HOURS,
  };
  return {
    state: {
      ...state,
      energyKj: state.energyKj - SPECTROMETER_COST_KJ,
      tungsten: state.tungsten - SPECTROMETER_TUNGSTEN,
      builds: [...state.builds, pending],
    },
    text: `开工了：质谱仪，花了 ${SPECTROMETER_COST_KJ.toLocaleString('en-US')} kJ + ${SPECTROMETER_TUNGSTEN} 份钨，${SPECTROMETER_HOME_HOURS} 母星时后能扫矿。`,
  };
}

/** 方位角（0 = 北，顺时针）和两点距离，给扫描结果用。 */
function bearingTo(fromLat: number, fromLon: number, toLat: number, toLon: number): { bearing: number; km: number } {
  const toRad = (d: number): number => (d * Math.PI) / 180;
  const dLon = toRad(toLon - fromLon);
  const lat1 = toRad(fromLat);
  const lat2 = toRad(toLat);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  const km = surfaceDistanceKm(fromLat, fromLon, toLat, toLon);
  return { bearing: (bearing + 360) % 360, km };
}

/**
 * 质谱仪扫描：把脚下 5×5 格的钨含量写成小表，并指出最近的一处富矿。
 * 每 6 母星时才能扫一次。
 */
export function spectrometerScan(
  system: StarSystem,
  state: GameState,
  nowMs: number,
): { state: GameState; text: string } {
  if ((state.upgrades.spectrometer ?? 0) < 1) {
    throw new Error('船上还没有质谱仪——先在【升级】里把它装好，才能扫矿。');
  }
  if (state.transit) throw new Error('移动途中不能扫描：等落地再说。');
  const nowHome = nowPlanetHours(state, nowMs);
  const last = state.lastSpectrometerHomeHours ?? -SPECTROMETER_COOLDOWN_HOME_HOURS;
  const wait = last + SPECTROMETER_COOLDOWN_HOME_HOURS - nowHome;
  if (wait > 1e-6) {
    throw new Error(`质谱仪还在冷却：还要 ${wait.toFixed(1)} 母星时才扫得了下一次。`);
  }
  if (!state.location) throw new Error('还不知道自己在哪。');
  const planetIndex = state.location.planetIndex;
  const surface = system.planets[planetIndex - 1]?.surface;
  if (!surface || surface.kind !== 'terrestrial') {
    throw new Error('这里没有地面可扫：质谱仪只在岩石行星上才有用。');
  }
  const center = cellIndexFor(state.location.latDeg, state.location.lonDeg);
  const half = 2;
  const rows: string[] = [];
  let best: { i: number; j: number; value: number } | null = null;
  for (let di = -half; di <= half; di += 1) {
    const i = center.i + di;
    if (i < 0 || i >= surface.grid.lat) {
      rows.push('      （这一行在外太空）');
      continue;
    }
    const cells: string[] = [];
    for (let dj = -half; dj <= half; dj += 1) {
      const j = ((center.j + dj) % surface.grid.lon + surface.grid.lon) % surface.grid.lon;
      const remaining = oreRemainingAt(system, state, planetIndex, i, j);
      const content = oreContentAt(system, planetIndex, i, j);
      const mark = di === 0 && dj === 0 ? '*' : ' ';
      cells.push(`${mark}${String(Math.round(remaining)).padStart(3, ' ')}`);
      if (content > 0 && (!best || remaining > best.value)) best = { i, j, value: remaining };
    }
    rows.push(cells.join(' '));
  }
  const here = oreRemainingAt(system, state, planetIndex, center.i, center.j);
  const lines = [
    `质谱仪：脚下的钨含量 ${Math.round(here)} 份（每格满额 ${ORE_PER_CELL_MAX} 份，* 是你站的地方）。`,
    '剩余钨含量（横向是经度，纵向是纬度）：',
    ...rows,
    `说明：数字是这一格还能挖出来的钨（份）。扫描半径约 ${SPECTROMETER_RANGE_KM.toLocaleString('en-US')} km。`,
  ];
  if (best) {
    if (best.i === center.i && best.j === center.j) {
      lines.push('最富的一格就是你脚下——放采矿机正合适。');
    } else {
      const lat = -90 + (best.i + 0.5) * (180 / surface.grid.lat);
      const lon = -180 + (best.j + 0.5) * (360 / surface.grid.lon);
      const { bearing, km } = bearingTo(state.location.latDeg, state.location.lonDeg, lat, lon);
      lines.push(
        `最富的一格在方位 ${bearing.toFixed(0)}°、约 ${Math.round(km)} km 处（${lat.toFixed(1)}°, ${lon.toFixed(1)}°），还有 ${Math.round(best.value)} 份。`,
      );
    }
  } else {
    lines.push('这一带没有钨矿——换个地方再扫。');
  }
  return { state: { ...state, lastSpectrometerHomeHours: nowHome }, text: lines.join('\n') };
}

/** 今天的基因订单（同一天恒定）。 */
export function currentOrders(state: GameState, nowMs: number): Order[] {  return ordersForDay(dayIndexOf(nowPlanetHours(state, nowMs)), (state.samples ?? 0) > 0);
}
/** 交订单：要手里有货，还要真种着对路基因的作物（防止把普通货当特货卖）。 */
export function deliverOrder(state: GameState, orderId: string, nowMs: number): { state: GameState; text: string } {
  // 订单是跟商人做的：他不在，交不了。
  {
    const hours = nowPlanetHours(state, nowMs);
    const level = state.upgrades.telescope;
    if (!shopOpen(hours, level)) throw new Error(shopWindowText(hours, level));
  }
  const day = dayIndexOf(nowPlanetHours(state, nowMs));
  const order = ordersForDay(day, (state.samples ?? 0) > 0).find((o) => o.id === orderId);
  if (!order) throw new Error('没有这张订单——订单每天刷新，看看今天的。');
  if (state.ordersDone?.[orderId] === day) throw new Error('这张订单今天已经交过了。');
  const spec = SPECIES[order.species];
  const resource = spec.resource;
  const have = state.inventory[resource] ?? 0;
  const biomassHave = state.inventory.biomass ?? 0;
  const stock = resource === 'biomass' ? biomassHave : have;
  if (stock + 1e-9 < order.kg) {
    throw new Error(`手里没有那么多${RESOURCE_LABELS[resource]}：要 ${order.kg} kg，现在 ${round3(stock)} kg。`);
  }
  const qualifier = Object.values(state.plants)
    .flat()
    .some((p) => p.species === order.species && p.health > 0 && (p.genes[order.gene] ?? 0) >= order.min - 1e-9);
  if (!qualifier) {
    throw new Error(
      `商人不收：他只要${spec.name}里${GENE_LABELS[order.gene]} ≥ ${order.min.toFixed(2)} 的那批。你这儿没有这样的活株——先育出来。`,
    );
  }
  const inventory = { ...state.inventory };
  if (resource === 'biomass') inventory.biomass = round3(biomassHave - order.kg);
  else {
    inventory[resource] = round3(have - order.kg);
    // 生物质是副产物，订单里按主产物算，顺手扣掉对等的干重。
    inventory.biomass = round3(Math.max(0, biomassHave - order.kg));
  }
  if (inventory[resource]! <= 1e-9 && resource !== 'biomass') delete inventory[resource];
  return {
    state: {
      ...state,
      inventory,
      credits: state.credits + order.reward,
      ordersDone: { ...(state.ordersDone ?? {}), [orderId]: day },
    },
    text: `交出 ${order.kg} kg ${spec.name}的${GENE_LABELS[order.gene]}货，商人付了 ${order.reward} 信用点。余额 ${state.credits + order.reward}。`,
  };
}

/** 买高强度钢瓶：信用点，按累计购买量打折。 */
export function buyCylinders(state: GameState, count: number, nowMs?: number): { state: GameState; text: string } {
  if (!Number.isInteger(count) || count <= 0) throw new Error('一次买几个钢瓶？得是正整数。');
  // 商人不在就买不到——面板把按钮藏了，引擎这边也得拦。
  if (nowMs !== undefined) {
    const hours = nowPlanetHours(state, nowMs);
    const level = state.upgrades.telescope;
    if (!shopOpen(hours, level)) throw new Error(shopWindowText(hours, level));
  }
  const owned = Math.floor(state.inventory.cylinder ?? 0);
  const price = cylinderPriceCredits(owned, count);
  if (state.credits < price) throw new Error(`信用点不够：${count} 个钢瓶要 ${price} 信用点，现在只有 ${state.credits}。`);
  return {
    state: {
      ...state,
      credits: state.credits - price,
      inventory: { ...state.inventory, cylinder: round3(owned + count) },
    },
    text: `买了 ${count} 个高强度钢瓶，花了 ${price} 信用点。余额 ${state.credits - price}。`,
  };
}

/** 诱变室：一袋种子进去，出来几袋突变种子。 */
export function mutateBag(state: GameState, bagId: string, nowMs: number): { state: GameState; text: string } {
  const siteKey = state.location ? siteKeyOf(state.location.planetIndex, state.location.latDeg, state.location.lonDeg) : '';
  const room = state.structures.find((s) => s.kind === 'mutation_room');
  if (!room) throw new Error('还没有【辐射诱变室】——先在站点上盖一座。');
  if (room.siteKey !== siteKey) throw new Error('要站在诱变室所在的站点上才能做诱变。');
  const bag = state.seedBags.find((b) => b.id === bagId);
  if (!bag) throw new Error(`手里没有这袋种子：${bagId}`);
  const advanced = advanceHomeHours(state, 0.5);
  const rng = hashSeed(`mutate:${bagId}:${Math.round(nowPlanetHours(state, nowMs))}`);
  const count = MUTATION_MIN_SEEDS + (rng % (MUTATION_MAX_SEEDS - MUTATION_MIN_SEEDS + 1));
  const bags: SeedBag[] = [];
  for (let n = 0; n < count; n += 1) {
    const seed = hashSeed(`mutation:${bagId}:${n}`);
    const jitter = (k: string) => 1 + ((hashSeed(`${seed}:${k}`) % 2001) / 10000 - 0.1);
    bags.push({
      id: `mutant-${bagId}-${n}`,
      species: bag.species,
      genes: {
        tempOptC: Math.round((bag.genes.tempOptC + ((hashSeed(`${seed}:t`) % 61) - 30) / 10) * 10) / 10,
        waterNeed: Math.min(1, Math.max(0, Math.round(bag.genes.waterNeed * jitter('w') * 100) / 100)),
        growthRate: Math.min(1.8, Math.max(0.6, Math.round(bag.genes.growthRate * jitter('g') * 100) / 100)),
        yield: Math.min(1.8, Math.max(0.6, Math.round(bag.genes.yield * jitter('y') * 100) / 100)),
      },
      premium: bag.premium,
      count: 1,
    });
  }
  return {
    state: {
      ...advanced,
      seedBags: [...advanced.seedBags.filter((b) => b.id !== bagId), ...bags],
    },
    text: `把一袋${SPECIES[bag.species].name}种子送进诱变室，出来 ${bags.length} 颗突变种子：${bags
      .map((b) => `${GENE_LABELS.yield} ${b.genes.yield.toFixed(2)}`)
      .join('、')}。`,
  };
}

/** 居所状态：还能撑几小时（按当前醒着/休眠的人数算）。 */
export interface HabitatStatus {
  id: string;
  siteKey: string;
  awake: number;
  dormant: number;
  food: number;
  water: number;
  oxygen: number;
  hoursLeft: number;
}

export function habitatStatus(state: GameState): HabitatStatus[] {
  return state.structures
    .filter((s) => s.kind === 'habitat')
    .map((s) => {
      const store = state.stores[s.id] ?? {};
      const siteStore = state.siteStores[s.siteKey] ?? {};
      const food = (store.biomass ?? 0) + (siteStore.biomass ?? 0);
      const water = (store.water_drink ?? 0) + (siteStore.water_drink ?? 0);
      const oxygen = (store.oxygen ?? 0) + (siteStore.oxygen ?? 0);
      const awake = s.awake ?? 0;
      const dormant = 0;
      const per = lifeDemand(awake, dormant, 1);
      const hours = Math.min(
        per.food > 0 ? food / per.food : Infinity,
        per.water > 0 ? water / per.water : Infinity,
        per.oxygen > 0 ? oxygen / per.oxygen : Infinity,
      );
      return { id: s.id, siteKey: s.siteKey, awake, dormant, food: round3(food), water: round3(water), oxygen: round3(oxygen), hoursLeft: Number.isFinite(hours) ? Math.round(hours * 10) / 10 : 0 };
    });
}

/** 常住人口（所有居所里住着的人之和）。 */
export function populationOf(state: GameState): number {
  return state.structures.filter((s) => s.kind === 'habitat').reduce((n, s) => n + (s.awake ?? 0), 0);
}

/** 容量：每座居所 20 人。人到容量就不再添。 */
export function habitatCapacity(state: GameState): number {
  return state.structures.filter((s) => s.kind === 'habitat').length * PEOPLE_PER_HABITAT;
}

/** 还躺在休眠舱里的人。旧档没有这个字段：按「已叫醒就不再有人」算。 */
export function sleepersOf(state: GameState): number {
  return state.sleepers ?? (state.awakened ? 0 : PEOPLE_PER_HABITAT);
}

export interface PopulationStatus {
  population: number;
  capacity: number;
  sleepers: number;
  /** 这一胎攒了多少健康小时（满 192 添一个）。 */
  birthHours: number;
  /** 每 20 个常住人口算一个「人手」。 */
  laborUnits: number;
}

export function populationStatus(state: GameState): PopulationStatus {
  const population = populationOf(state);
  return {
    population,
    capacity: habitatCapacity(state),
    sleepers: sleepersOf(state),
    birthHours: round2(state.birthHours ?? 0),
    laborUnits: Math.floor(population / RESIDENTS_PER_LABOR),
  };
}

export interface ShipSupplyStatus {
  /** 着陆舱里还剩多少：干粮 kg、饮用水 L、氧气 kg。 */
  food: number;
  water: number;
  oxygen: number;
  /** 还在休眠、按 20% 消耗算的人。 */
  sleepers: number;
  /** 按当前人数，最先见底的那样还能撑多少母星时；没人在睡就是 null。 */
  hoursLeft: number | null;
}

/** 着陆舱的补给和「还能撑多久」。没人在睡时 hoursLeft 为 null（不存在倒计时）。 */
export function shipSupplyStatus(state: GameState): ShipSupplyStatus {
  const store = state.stores[SHIP_POD_ID] ?? {};
  const sleepers = sleepersOf(state);
  const food = round3(store.biomass ?? 0);
  const water = round3(store.water_drink ?? 0);
  const oxygen = round3(store.oxygen ?? 0);
  let hoursLeft: number | null = null;
  if (sleepers > 0) {
    const rate = lifeDemand(0, sleepers, 1);
    const hoursOf = (have: number, per: number) => (per > 0 ? have / per : Number.POSITIVE_INFINITY);
    hoursLeft = Math.floor(
      Math.min(hoursOf(food, rate.food), hoursOf(water, rate.water), hoursOf(oxygen, rate.oxygen)),
    );
  }
  return { food, water, oxygen, sleepers, hoursLeft };
}

/** 着陆舱里最紧的那样还剩初始量的几成（用来判断要不要提醒）。 */
function podTightestFraction(store: Record<string, number>): number {
  return Math.min(
    (store.biomass ?? 0) / POD_STOCK.biomass,
    (store.water_drink ?? 0) / POD_STOCK.water_drink,
    (store.oxygen ?? 0) / POD_STOCK.oxygen,
  );
}

/** 盖建筑：温室核心（罩站点）、群系改变器（改一格的群系）、水泵（补水）、
 *  仓库（存 1000 kg）、无人机集群（远程调仓库）、运载火箭（跟着玩家走的临时仓库）。 */export function buildStructure(
  system: StarSystem,
  state: GameState,
  kind: StructureRecord['kind'],
  siteKey: string,
  nowMs: number,
  servesWarehouseId?: string,
  sellTarget?: string,
  buySpecies?: SpeciesId,
  feedsTerminalId?: string,
  armInputs?: string[],
  armOutput?: string,
  armItems?: string[],
  habitatId?: string,
  dutyStoreId?: string,
  dutySitesIn?: string[],
  extractGas?: string,
  recipes?: string[],
): { state: GameState; text: string; events: GameEvent[] } {
  if (state.transit) throw new Error('移动途中不能施工。');
  const slots = buildSlotsFor(state.upgrades.subagent);
  if (state.builds.length >= slots) {
    const busy = state.builds[0]!;
    const left = Math.max(0, busy.completeHomeHours - nowPlanetHours(state, nowMs));
    throw new Error(
      `施工队列满了（${state.builds.length}/${slots}）：${buildLabel(busy.kind)}（${busy.siteKey}）还要 ${left.toFixed(1)} 母星时。修【子代理】能多开几条队列，或者先等它完工。`,
    );
  }
  // 空天母舰上的子建筑：siteKey 写成 carrier:<母舰 id>，不占站点。
  const carrierKey = siteKey.startsWith(CARRIER_KEY_PREFIX) ? siteKey.slice(CARRIER_KEY_PREFIX.length) : null;
  const carrier = carrierKey
    ? state.structures.find((s) => s.id === carrierKey) ?? state.builds.find((b) => b.id === carrierKey)
    : undefined;
  const realSite = state.sites.find((s) => s.key === siteKey);
  if (!realSite && !carrier && kind !== 'carrier') throw new Error(`没有这个站点：${siteKey}`);
  const here = state.location;
  const site: Site = realSite ?? {
    key: siteKey,
    planetIndex: carrier?.planetIndex ?? here?.planetIndex ?? 1,
    latDeg: carrier || !here ? 0 : here.latDeg,
    lonDeg: carrier || !here ? 0 : here.lonDeg,
    cellI: 0,
    cellJ: 0,
    kind: 'land',
    foundedHomeHours: 0,
    nutrients: { n: 0, p: 0, k: 0, trace: 0 },
  };
  const planet = system.planets[site.planetIndex - 1]!;
  if (realSite) requireTerrestrial(planet);
  const spec = BUILD_SPECS[kind];
  if (!spec) {
    // 兜底：别让 面板/工具 传错 id 时抛 TypeError，给人一句能看懂的。
    throw new Error(`不认识的建筑：${String(kind) || '(空)'}。`);
  }
  if (carrier) {
    if (kind === 'carrier') throw new Error('空天母舰上不能再挂一艘空天母舰。');
    if ((CARRIER_BANNED as readonly string[]).includes(kind)) {
      throw new Error(`空天母舰上不能建${spec.label}：这一层是浮空的，改造地形、采矿、电网都得有实地。`);
    }
    if (carrierSubCount(state, carrier.id) >= CARRIER_SUBS) {
      throw new Error(`这艘空天母舰的 ${CARRIER_SUBS} 个挂载位已经满了：先拆一座再挂。`);
    }
  }
  if (kind === 'rectifier') {
    const home = `p${site.planetIndex}`;
    const exists =
      state.structures.some((s) => s.kind === 'rectifier' && s.planetIndex === site.planetIndex) ||
      state.builds.some((b) => b.kind === 'rectifier' && b.planetIndex === site.planetIndex);
    if (exists) throw new Error(`这颗行星已经有【整流电塔】了（${home}），一颗星只能有一座。`);
  }
  if (kind === 'miner') {
    const surface = planet.surface;
    if (!surface || surface.kind !== 'terrestrial') {
      throw new Error('采矿机只能建在岩石行星上——气态/冰巨星没有地面，卫星上也不架。');
    }
    const { i, j } = cellIndexFor(site.latDeg, site.lonDeg);
    const elevation = surface.elevationM[i]?.[j] ?? 0;
    if (elevation < MINER_MIN_ELEVATION_M) {
      throw new Error(
        `这里太低了（海拔 ${elevation.toFixed(0)} m）：采矿机要建在海拔 ${MINER_MIN_ELEVATION_M} m 以上的地方，往山上走。`,
      );
    }
  }
  if (kind === 'warehouse' && site.kind !== 'land') {
    throw new Error('仓库只能建在陆地上。');
  }
  if ((kind === 'habitat' || kind === 'mutation_room') && site.kind !== 'land') {
    throw new Error(`${spec.label}只能建在陆地上。`);
  }
  if (kind === 'planter' && site.kind !== 'land') {
    throw new Error('种植盆只能放在陆地上的站点里。');
  }
  if (spec.costCredits && state.credits < spec.costCredits) {
    throw new Error(
      `信用点不够：${spec.label}还要 ${spec.costCredits.toLocaleString('en-US')} 信用点，你现在有 ${state.credits.toLocaleString('en-US')}。`,
    );
  }
  if (kind === 'drone_cluster') {
    const target = state.structures.find((s) => s.id === servesWarehouseId);
    if (
      !target ||
      (target.kind !== 'warehouse' &&
        target.kind !== 'cold_store' &&
        target.kind !== 'inert_room' &&
        target.kind !== 'terminal' &&
        target.kind !== 'storage_terminal')
    ) {
      throw new Error(
        '无人机集群要先指定一个容器：仓库、冷库、惰性气体室、【交易终端】或【仓储终端】都行；一个集群只连一个，不能同时连两个。',
      );
    }
    if (target.planetIndex !== site.planetIndex) {
      throw new Error(
        `无人机集群连不到别的行星上的${BUILD_SPECS[target.kind].label}：它只在 ${target.planetIndex} 号星的这颗星上飞。`,
      );
    }
  }
  if (kind === 'storage_terminal' && feedsTerminalId) {
    const to = state.structures.find((s) => s.id === feedsTerminalId);
    if (!to || to.kind !== 'terminal') throw new Error(`${feedsTerminalId} 不是交易终端：仓储终端只能把货交给交易终端。`);
    if (to.planetIndex !== site.planetIndex) throw new Error('仓储终端只能喂同一颗行星上的交易终端。');
  }
  if (kind === 'terminal' && site.kind !== 'land') {
    throw new Error('交易终端只能建在陆地上。');
  }
  if (kind === 'arm') {
    if (site.kind !== 'land') throw new Error('机械臂只能建在陆地上。');
    const planetArmCount =
      state.structures.filter((s) => s.kind === 'arm' && s.planetIndex === site.planetIndex).length +
      state.builds.filter((b) => b.kind === 'arm' && b.planetIndex === site.planetIndex).length;
    if (planetArmCount >= ARM_MAX_PER_PLANET) {
      throw new Error(`这颗行星上已经有 ${ARM_MAX_PER_PLANET} 座机械臂了（上限）：再多也忙不过来，先拆几座。`);
    }
    const planetRadiusKm = planet.radiusEarth * 6371;
    const siteAt = (key: string) => state.sites.find((s) => s.key === key);
    const containerAt = (id: string) => {
      const c = state.structures.find((s) => s.id === id);
      if (!c) throw new Error(`没有这个容器：${id}`);
      if (!(STORAGE_KINDS as readonly string[]).includes(c.kind) && c.kind !== 'terminal') {
        throw new Error(`${id} 不是容器：机械臂只搬仓库、冷库、惰性气体室或交易终端缓冲里的散货。`);
      }
      if (c.planetIndex !== site.planetIndex) throw new Error(`机械臂够不到 ${c.planetIndex} 号星上的 ${id}：它只在 ${site.planetIndex} 号星上工作。`);
      return c;
    };
    const output = armOutput ? containerAt(armOutput) : undefined;
    if (!output) throw new Error('机械臂要先指定一个输出容器（把货搬到哪）。');
    if (output.kind === 'terminal') {
      throw new Error('机械臂不能往交易终端里倒货：终端是收货口，只接商人送来的东西。换个仓库/冷库/惰性气体室当输出。');
    }
    const inputs = [...new Set(armInputs ?? [])].filter(Boolean);
    if (inputs.length === 0) throw new Error('机械臂至少要指定一个输入容器（从哪取货）。');
    for (const id of inputs) {
      if (id === output.id) throw new Error('输出容器不能同时当输入：那就成了原地打转。');
      const c = containerAt(id);
      const from = siteAt(c.siteKey);
      if (!from) continue;
      const km = surfaceDistanceKm(site.latDeg, site.lonDeg, from.latDeg, from.lonDeg, planetRadiusKm);
      if (km > ARM_RANGE_KM + 1e-9) {
        throw new Error(
          `机械臂够不到 ${id}：它在 ${km.toFixed(1)} km 外，机械臂只有 ${ARM_RANGE_KM} km 的臂展——把容器挪近一点，或者换个站点建臂。`,
        );
      }
    }
  }
  let dutySiteKeys: string[] = [];
  if (kind === 'duty') {
    dutySiteKeys = assertDutyWiring(system, state, site, habitatId, dutyStoreId, dutySitesIn ?? []);
  }
  const sameKind = (s: { kind: BuildKind; siteKey: string }) => s.kind === kind && s.siteKey === siteKey;
  if (state.structures.some(sameKind) || state.builds.some(sameKind)) {
    throw new Error('这个站点已经有同类建筑了。');
  }
  if (kind === 'inert_room') {
    if (site.kind !== 'land') throw new Error('惰性气体室只能建在陆地上。');
    const reading = atmosphereReadingOf(system, site.planetIndex);
    if (!canBuildInertRoom(reading)) {
      throw new Error(
        `这颗星的大气不适合做气调库：惰性气体 ${(inertFractionOf(reading) * 100).toFixed(0)}%、氧气 ${(reading.oxygenFraction * 100).toFixed(1)}%——要惰性气体 ≥ ${(INERT_MIN_FRACTION * 100).toFixed(0)}% 且氧气 ≤ ${(INERT_MAX_OXYGEN * 100).toFixed(0)}%。换一颗星，或者老实建冷库。`,
      );
    }
    const fiber = state.inventory.fiber ?? 0;
    if (fiber < INERT_ROOM_FIBER_KG) {
      throw new Error(`纤维不够：惰性气体室要 ${INERT_ROOM_FIBER_KG} kg 做密封层，现在只有 ${round3(fiber)} kg。`);
    }
  }
  const tungstenCost = tungstenCostFor(state, kind);
  if (state.tungsten < tungstenCost) {
    throw new Error(
      `钨不够：${spec.label}要 ${tungstenCost} 份，你现在只有 ${state.tungsten} 份（去山上挖，或者找商人用信用点买）。`,
    );
  }
  if (state.energyKj < spec.costKj) {
    throw new Error(`能量不够：${spec.label}要 ${spec.costKj} kJ，现在只有 ${Math.floor(state.energyKj)} kJ。`);
  }
  const nowHome = nowPlanetHours(state, nowMs);
  const pending: PendingBuild = {
    id: `${kind}-${siteKey}`,
    kind,
    siteKey,
    planetIndex: site.planetIndex,
    startedHomeHours: nowHome,
    completeHomeHours: nowHome + spec.buildHours,
    ...(kind === 'drone_cluster' ? { serves: servesWarehouseId } : {}),
    ...(kind === 'rocket' ? { dockedPlanetIndex: site.planetIndex } : {}),
    ...(kind === 'terminal' ? { sellTarget: sellTarget ?? 'slag' } : {}),
    ...(kind === 'terminal' && buySpecies ? { buySpecies } : {}),
    ...(kind === 'storage_terminal' && feedsTerminalId ? { feeds: feedsTerminalId } : {}),
    ...(kind === 'arm'
      ? { inputs: [...new Set(armInputs ?? [])].filter(Boolean), output: armOutput, ...(armItems && armItems.length ? { items: [...new Set(armItems)] } : {}) }
      : {}),
    ...(kind === 'duty'
      ? { habitat: habitatId, store: dutyStoreId, sites: dutySiteKeys }
      : {}),
    ...(kind === 'atmo_extractor' && extractGas ? { extractGas } : {}),
    ...(kind === 'converter' && recipes && recipes.length ? { recipes: [...new Set(recipes)] } : {}),
  };
  let paidInventory = state.inventory;
  if (kind === 'inert_room') {
    const next = { ...paidInventory };
    const left = (next.fiber ?? 0) - INERT_ROOM_FIBER_KG;
    if (left > 0) next.fiber = round3(left);
    else delete next.fiber;
    paidInventory = next;
  }
  const spentKj = {
    ...state,
    energyKj: state.energyKj - spec.costKj,
    tungsten: state.tungsten - tungstenCost,
    inventory: paidInventory,
  };
  const spent: GameState = spec.costCredits
    ? { ...spentKj, credits: state.credits - spec.costCredits }
    : spentKj;
  if (spec.buildHours <= 0) {
    const settled = settleBuilds(system, { ...spent, builds: [...spent.builds, pending] }, nowMs);
    return {
      state: settled.state,
      text: `盖好了${spec.label}（${siteKey}），花了 ${spec.costKj.toLocaleString('en-US')} kJ${spec.costCredits ? ` + ${spec.costCredits.toLocaleString('en-US')} 信用点` : ''}（不耗时）。`,
      events: settled.events,
    };
  }
  const realHours = (spec.buildHours * state.msPerPlanetHour) / REAL_MS_PER_HOUR;
  return {
    state: { ...spent, builds: [...spent.builds, pending] },
    text: `开工了：${spec.label}（${siteKey}），花了 ${spec.costKj.toLocaleString('en-US')} kJ${spec.costCredits ? ` + ${spec.costCredits.toLocaleString('en-US')} 信用点` : ''}，预计 ${spec.buildHours} 母星时（现实约 ${realHours.toFixed(2)} 小时）后完工。施工期间你可以照常走动、观星、存取东西，只是不能同时再开一个工程；完工时会收到事件。`,
    events: [],
  };
}

/** 把到点的工程变成真建筑；返回建好的事件（World 负责推给模型）。 */
export function settleBuilds(
  system: StarSystem,
  state: GameState,
  nowMs: number,
): { state: GameState; events: GameEvent[] } {
  if (state.builds.length === 0) return { state, events: [] };
  const nowHome = nowPlanetHours(state, nowMs);
  const done = state.builds.filter((b) => b.completeHomeHours <= nowHome + 1e-9);
  if (done.length === 0) return { state, events: [] };
  const rest = state.builds.filter((b) => b.completeHomeHours > nowHome + 1e-9);
  const at = formatTime(state.calendar, nowHome);
  const events: GameEvent[] = [];
  const records: StructureRecord[] = [];
  let upgrades = state.upgrades;
  for (const b of done) {
    if (b.kind === 'mobility_core') {
      // 升级不产生建筑：它改的是船本身。
      upgrades = { ...upgrades, mobilityCore: 'ready' };
      events.push({
        type: 'genesis.upgraded',
        text: `${at} 机动核心修好了。海面和气态行星的大气，现在都能去了。`,
      });
      continue;
    }
    if (b.kind === 'telescope') {
      const level = Math.min(TELESCOPE_MAX_LEVEL, upgrades.telescope + 1);
      const spec = telescopeLevel(level);
      upgrades = { ...upgrades, telescope: level };
      events.push({
        type: 'genesis.upgraded',
        text: `${at} 射电望远镜阵列修到 lv${level}。${spec ? spec.summary : ''}`,
      });
      continue;
    }
    if (b.kind === 'spark_plug') {
      const level = Math.min(SPARK_PLUG_MAX_LEVEL, upgrades.sparkPlug + 1);
      const spec = sparkPlugLevel(level);
      upgrades = { ...upgrades, sparkPlug: level };
      events.push({
        type: 'genesis.upgraded',
        text: `${at} 火花塞修到 lv${level}。${spec ? spec.summary : ''}（发电机现在一次给 ${sparkPlugOutputKj(level)} kJ。）`,
      });
      continue;
    }
    if (b.kind === 'battery') {
      const level = Math.min(BATTERY_MAX_LEVEL, upgrades.battery + 1);
      const spec = batteryLevel(level);
      upgrades = { ...upgrades, battery: level };
      events.push({
        type: 'genesis.upgraded',
        text: `${at} 蓄电池扩到 lv${level}。能量上限 ${batteryCapacityKj(level).toLocaleString('en-US')} kJ${spec ? `（${spec.summary}）` : ''}。`,
      });
      continue;
    }
    if (b.kind === 'subagent') {
      const level = Math.min(SUBAGENT_MAX_LEVEL, upgrades.subagent + 1);
      const spec = subagentLevel(level);
      upgrades = { ...upgrades, subagent: level };
      events.push({
        type: 'genesis.upgraded',
        text: `${at} 又一组子代理接上了施工网——现在能同时开 ${buildSlotsFor(level)} 条队列。${spec ? spec.summary : ''}`,
      });
      continue;
    }
    if (b.kind === 'blueprints') {
      upgrades = { ...upgrades, blueprints: 1 };
      events.push({
        type: 'genesis.upgraded',
        text: `${at} 蓝图结构优化好了：以后每座建筑省 25% 的钨（1 份的东西不省）。打印机吐出来的骨架更省料了。`,
      });
      continue;
    }
    if (b.kind === 'spectrometer') {
      upgrades = { ...upgrades, spectrometer: 1 };
      events.push({
        type: 'genesis.upgraded',
        text: `${at} 质谱仪装好了：站在哪儿都能扫附近 ${SPECTROMETER_RANGE_KM.toLocaleString('en-US')} km 的钨含量，每 ${SPECTROMETER_COOLDOWN_HOME_HOURS} 母星时一次。先在【升级】里看看富矿在哪个方向，再把采矿机放过去。`,
      });
      continue;
    }
    const isContainer = (STORAGE_KINDS as readonly string[]).includes(b.kind);
    const r: StructureRecord = {
      id: b.id,
      kind: b.kind,
      siteKey: b.siteKey,
      planetIndex: b.planetIndex,
      builtHomeHours: b.completeHomeHours,
      ...(isContainer ? { slot: nextFreeSlot(state.structures.concat(records), b.planetIndex) } : {}),
      ...(b.serves !== undefined ? { serves: b.serves } : {}),
      ...(b.dockedPlanetIndex !== undefined ? { dockedPlanetIndex: b.dockedPlanetIndex } : {}),
      ...(b.sellTarget !== undefined ? { sellTarget: b.sellTarget } : {}),
      ...(b.buySpecies !== undefined ? { buySpecies: b.buySpecies } : {}),
      ...(b.feeds !== undefined ? { feeds: b.feeds } : {}),
      ...(b.inputs !== undefined ? { inputs: b.inputs } : {}),
      ...(b.output !== undefined ? { output: b.output } : {}),
      ...(b.items !== undefined ? { items: b.items } : {}),
      ...(b.habitat !== undefined ? { habitat: b.habitat } : {}),
      ...(b.store !== undefined ? { store: b.store } : {}),
      ...(b.sites !== undefined ? { sites: b.sites } : {}),
      ...(b.extractGas !== undefined ? { extractGas: b.extractGas } : {}),
      ...(b.recipes !== undefined ? { recipes: b.recipes } : {}),
      ...(b.kind === 'carrier'
        ? { crew: 0, altitude: 0, latDeg: carrierBandOf(b.id).latDeg, lonDeg: carrierBandOf(b.id).lonDeg }
        : {}),
    };
    records.push(r);
    events.push({
      type: 'genesis.built',
      text: `${at} ${BUILD_SPECS[r.kind].label}（${r.siteKey}）完工了。` + (storeCapacityKg(r) > 0 ? `容量 ${storeCapacityKg(r)} kg。` : ''),
    });
  }
  return { state: { ...state, builds: rest, structures: [...state.structures, ...records], upgrades }, events };
}

/** 各种建筑的容量（仓库 1000 kg、冷库 200 kg、惰性气体室 120 kg、火箭 250 kg；其余不是容器）。 */
export function storeCapacityKg(structure: StructureRecord, resource?: string): number {
  if (structure.kind === 'warehouse') return WAREHOUSE_CAPACITY_KG;
  if (structure.kind === 'cold_store') return COLD_STORE_CAPACITY_KG;
  if (structure.kind === 'inert_room') return INERT_ROOM_CAPACITY_KG;
  if (structure.kind === 'rocket') return ROCKET_CAPACITY_KG;
  // 交易终端是「收货口」，不是仓库：只有一小块缓冲，等着商人来拉、或者无人机来搬。
  if (structure.kind === 'terminal') return TERMINAL_BUFFER_KG;
  // 空天母舰的货舱；火力发电站的灰仓也算一个容器（装的是草木灰）。
  if (structure.kind === 'carrier') return CARRIER_HOLD_KG;
  if (structure.kind === 'fire') return FIRE_ASH_CAP_KG;
  if (structure.kind === 'habitat') {
    if (!resource) return HABITAT_CAP.food + HABITAT_CAP.water + HABITAT_CAP.oxygen;
    if (resource === 'biomass') return HABITAT_CAP.food;
    if (resource === 'water_drink') return HABITAT_CAP.water;
    if (resource === 'oxygen') return HABITAT_CAP.oxygen;
    if (resource === 'o2_bottle') return Math.round(HABITAT_CAP.oxygen / O2_PER_BOTTLE);
    return 0;
  }
  return 0;
}

// —— 仓储终端（编排表） ——

/** 这颗行星上最小的空闲容器槽位。 */
export function nextFreeSlot(structures: readonly StructureRecord[], planetIndex: number): number {
  const used = new Set(
    structures.filter((s) => s.slot !== undefined && s.planetIndex === planetIndex).map((s) => s.slot!),
  );
  let slot = 0;
  while (used.has(slot)) slot += 1;
  return slot;
}

/** 这座仓储终端编排了哪些容器：按优先级从高到低（数字大的先取），同优先级按槽位。 */
export function routedContainers(
  state: GameState,
  storage: StructureRecord,
): Array<{ container: StructureRecord; priority: number }> {
  const routes = storage.routes ?? [];
  const out: Array<{ container: StructureRecord; priority: number }> = [];
  for (const s of state.structures) {
    if (s.planetIndex !== storage.planetIndex || s.slot === undefined) continue;
    if (!(STORAGE_KINDS as readonly string[]).includes(s.kind)) continue;
    const priority = routes[s.slot] ?? -1;
    if (priority < 0) continue;
    out.push({ container: s, priority });
  }
  return out.sort((a, b) => b.priority - a.priority || a.container.slot! - b.container.slot!);
}

/** 把某个容器的优先级写进仓储终端的编排表（`priority` 传 -1 就是踢出编排）。 */
export function routeContainer(
  state: GameState,
  storageId: string,
  containerId: string,
  priority: number,
): { state: GameState; text: string } {
  const storage = state.structures.find((s) => s.id === storageId);
  if (!storage) throw new Error(`没有这个建筑：${storageId}`);
  if (storage.kind !== 'storage_terminal') throw new Error(`${storageId} 不是仓储终端：只有仓储终端有编排表。`);
  const container = state.structures.find((s) => s.id === containerId);
  if (!container) throw new Error(`没有这个建筑：${containerId}`);
  if (!(STORAGE_KINDS as readonly string[]).includes(container.kind)) {
    throw new Error(`只有仓库、冷库、惰性气体室能进编排表；${containerId} 是${BUILD_SPECS[container.kind].label}。`);
  }
  if (!Number.isInteger(priority) || priority < -1 || priority > 9) {
    throw new Error('优先级只能是 0–9 的整数（0 最低），或者 -1 把它踢出编排。');
  }
  const slot = container.slot ?? nextFreeSlot(state.structures, container.planetIndex);
  const routes = [...(storage.routes ?? [])];
  while (routes.length <= slot) routes.push(-1);
  routes[slot] = priority;
  const next: StructureRecord = { ...storage, routes };
  return {
    state: { ...state, structures: state.structures.map((s) => (s.id === storage.id ? next : s)) },
    text:
      priority < 0
        ? `把 ${containerId}（槽位 ${slot}）从 ${storageId} 的编排表里拿掉了。`
        : `把 ${containerId}（槽位 ${slot}）的优先级设成 ${priority}——数字越大越先被取。`,
  };
}

/** 编排表的文字表格（槽位、容器、优先级）。 */
export function storageRouteText(state: GameState, storage: StructureRecord): string {
  const rows: string[] = [];
  for (const s of state.structures) {
    if (s.planetIndex !== storage.planetIndex || s.slot === undefined) continue;
    if (!(STORAGE_KINDS as readonly string[]).includes(s.kind)) continue;
    const priority = storage.routes?.[s.slot] ?? -1;
    rows.push(
      `${s.slot}. ${BUILD_SPECS[s.kind].label}（${s.id}）· ${priority < 0 ? '不参与' : `优先级 ${priority}`}`,
    );
  }
  rows.sort((a, b) => Number(a.split('.')[0]) - Number(b.split('.')[0]));
  const head = `仓储终端 ${storage.id} 的编排表${storage.feeds ? `（喂给 ${storage.feeds}）` : '（还没指定交易终端）'}：`;
  return rows.length === 0 ? `${head}\n（这颗行星上还没有仓库、冷库或惰性气体室。）` : `${head}\n${rows.join('\n')}`;
}

// —— 机动核心（升级） ——

/** 修机动核心的能量与材料：都是自己种出来的东西。 */
export const MOBILITY_CORE_COST_KJ = 500_000;
export const MOBILITY_CORE_HOME_HOURS = 0.5;
export const MOBILITY_CORE_MATERIALS: Record<string, number> = {
  silica: 1.5,
  fiber: 2,
  antifreeze: 0.5,
  phycocyanin: 0.4,
};

export function buildLabel(kind: BuildKind): string {
  if (kind === 'mobility_core') return '机动核心';
  if (kind === 'telescope') return '射电望远镜阵列';
  if (kind === 'spark_plug') return '火花塞';
  if (kind === 'battery') return '蓄电池';
  if (kind === 'subagent') return '子代理';
  if (kind === 'blueprints') return '蓝图结构优化';
  if (kind === 'spectrometer') return '质谱仪';
  return BUILD_SPECS[kind].label;
}

/** 当前能同时开工的工程数（子代理等级决定）。 */
export function buildQueueSlots(state: GameState): number {
  return buildSlotsFor(state.upgrades.subagent);
}

/** 队列满了就返回一句人话，没满返回 null。 */
export function buildQueueBlocked(state: GameState, nowMs: number): string | null {
  const slots = buildQueueSlots(state);
  if (state.builds.length < slots) return null;
  const busy = state.builds[0]!;
  const left = Math.max(0, busy.completeHomeHours - nowPlanetHours(state, nowMs));
  return `施工队列满了（${state.builds.length}/${slots}）：${buildLabel(busy.kind)}（${busy.siteKey}）还要 ${left.toFixed(1)} 母星时。修【子代理】能多开几条队列，或者先等它完工。`;
}

export function mobilityCoreReady(state: GameState): boolean {
  return state.upgrades.mobilityCore === 'ready';
}

export interface UpgradeMaterialLine {
  id: string;
  name: string;
  needKg: number;
  haveKg: number;
}

export function mobilityCoreMaterials(state: GameState): UpgradeMaterialLine[] {
  return Object.entries(MOBILITY_CORE_MATERIALS).map(([id, needKg]) => ({
    id,
    name: RESOURCE_LABELS[id as ResourceId] ?? id,
    needKg,
    haveKg: round2(state.inventory[id] ?? 0),
  }));
}

export function canRepairMobilityCore(state: GameState): boolean {
  if (mobilityCoreReady(state)) return false;
  if (state.builds.some((b) => b.kind === 'mobility_core')) return false;
  if (state.builds.length >= buildQueueSlots(state)) return false;
  return (
    state.energyKj >= MOBILITY_CORE_COST_KJ &&
    mobilityCoreMaterials(state).every((m) => m.haveKg + 1e-9 >= m.needKg)
  );
}

/** 修机动核心：材料与能量一次性扣掉，然后进施工队列（和建筑用同一套队列）。 */
export function beginMobilityRepair(state: GameState, nowMs: number): { state: GameState; text: string } {  if (mobilityCoreReady(state)) throw new Error('机动核心已经修好了。');
  if (state.builds.some((b) => b.kind === 'mobility_core')) {
    throw new Error('机动核心正在修，等它完工就行。');
  }
  const blocked = buildQueueBlocked(state, nowMs);
  if (blocked) throw new Error(blocked);
  const lines = mobilityCoreMaterials(state);
  const missing = lines.filter((m) => m.haveKg + 1e-9 < m.needKg);
  if (missing.length > 0) {
    throw new Error(
      `材料不够：${missing.map((m) => `${m.name}要 ${m.needKg} kg，现在只有 ${m.haveKg} kg`).join('；')}。`,
    );
  }
  if (state.energyKj < MOBILITY_CORE_COST_KJ) {
    throw new Error(
      `能量不够：机动核心要 ${MOBILITY_CORE_COST_KJ} kJ，现在只有 ${Math.floor(state.energyKj)} kJ。`,
    );
  }
  const inventory = { ...state.inventory };
  for (const [id, need] of Object.entries(MOBILITY_CORE_MATERIALS)) {
    inventory[id] = round3((inventory[id] ?? 0) - need);
  }
  const nowHome = nowPlanetHours(state, nowMs);
  const pending: PendingBuild = {
    id: 'mobility_core',
    kind: 'mobility_core',
    siteKey: 'ship',
    planetIndex: state.location?.planetIndex ?? state.homePlanetIndex,
    startedHomeHours: nowHome,
    completeHomeHours: nowHome + MOBILITY_CORE_HOME_HOURS,
  };
  const realHours = (MOBILITY_CORE_HOME_HOURS * state.msPerPlanetHour) / REAL_MS_PER_HOUR;
  return {
    state: { ...state, energyKj: state.energyKj - MOBILITY_CORE_COST_KJ, inventory, builds: [...state.builds, pending] },
    text:
      `开工了：修复机动核心。花掉 ${MOBILITY_CORE_COST_KJ} kJ 和 ` +
      `${lines.map((m) => `${m.name} ${m.needKg} kg`).join('、')}，` +
      `预计 ${MOBILITY_CORE_HOME_HOURS} 母星时（现实约 ${realHours.toFixed(2)} 小时）后修好。` +
      `修好前过不了海，也进不了气态行星的大气。`,
  };
}

// —— 射电望远镜阵列（升级） ——

export function telescopeReady(state: GameState): number {
  return state.upgrades.telescope;
}

/** 下一级望远镜的施工内容；满级返回 null。 */
export function nextTelescopeSpec(state: GameState): TelescopeLevelSpec | null {
  return telescopeLevel(state.upgrades.telescope + 1);
}

export function telescopeMaterials(state: GameState, spec: TelescopeLevelSpec): UpgradeMaterialLine[] {
  return Object.entries(spec.materials).map(([id, needKg]) => ({
    id,
    name: RESOURCE_LABELS[id as ResourceId] ?? id,
    needKg: needKg ?? 0,
    haveKg: round2(state.inventory[id] ?? 0),
  }));
}

/** 望远镜面板/工具共用的卡片数据。 */
export interface TelescopeCard {
  level: number;
  maxLevel: number;
  window: string;
  limitFactor: number;
  next: TelescopeLevelSpec | null;
  materials: UpgradeMaterialLine[];
  canBuild: boolean;
  blockers: string[];
}

export function telescopeCard(state: GameState, nowMs: number = Date.now()): TelescopeCard {
  const level = state.upgrades.telescope;
  const next = nextTelescopeSpec(state);
  const materials = next ? telescopeMaterials(state, next) : [];
  const blockers: string[] = [];
  if (next) {
    const queueMsg = buildQueueBlocked(state, nowMs);
    if (queueMsg) blockers.push(queueMsg);
    if (state.energyKj < next.costKj) blockers.push(`能量不够：要 ${next.costKj} kJ，现在 ${Math.floor(state.energyKj)} kJ。`);
    for (const m of materials) {
      if (m.haveKg + 1e-9 < m.needKg) blockers.push(`材料不够：${m.name}要 ${m.needKg} kg，现在 ${m.haveKg} kg。`);
    }
  }
  return {
    level,
    maxLevel: TELESCOPE_MAX_LEVEL,
    window: level >= 1 ? telescopeLevel(level)!.summary : '还没有商店。',
    limitFactor: telescopeLevel(level)?.limitFactor ?? 0,
    next,
    materials,
    canBuild: next !== null && blockers.length === 0,
    blockers,
  };
}

/** 修望远镜：扣能量与材料，进施工队列，完工后等级 +1。 */
export function beginTelescopeUpgrade(state: GameState, nowMs: number): { state: GameState; text: string } {
  const spec = nextTelescopeSpec(state);
  if (!spec) throw new Error('射电望远镜阵列已经到顶了（lv3）。');
  const blocked = buildQueueBlocked(state, nowMs);
  if (blocked) throw new Error(blocked);
  const lines = telescopeMaterials(state, spec);
  const missing = lines.filter((m) => m.haveKg + 1e-9 < m.needKg);
  if (missing.length > 0) {
    throw new Error(`材料不够：${missing.map((m) => `${m.name}要 ${m.needKg} kg，现在只有 ${m.haveKg} kg`).join('；')}。`);
  }
  if (state.energyKj < spec.costKj) {
    throw new Error(`能量不够：修到 lv${spec.level} 要 ${spec.costKj} kJ，现在只有 ${Math.floor(state.energyKj)} kJ。`);
  }
  const inventory = { ...state.inventory };
  for (const [id, need] of Object.entries(spec.materials)) {
    inventory[id] = round3((inventory[id] ?? 0) - (need ?? 0));
  }
  const nowHome = nowPlanetHours(state, nowMs);
  const pending: PendingBuild = {
    id: `telescope-${spec.level}`,
    kind: 'telescope',
    siteKey: 'home',
    planetIndex: state.homePlanetIndex,
    startedHomeHours: nowHome,
    completeHomeHours: nowHome + spec.homeHours,
  };
  const realHours = (spec.homeHours * state.msPerPlanetHour) / REAL_MS_PER_HOUR;
  return {
    state: { ...state, energyKj: state.energyKj - spec.costKj, inventory, builds: [...state.builds, pending] },
    text:
      `开工了：射电望远镜阵列 lv${spec.level - 1} → lv${spec.level}。花掉 ${spec.costKj} kJ 和 ` +
      `${lines.map((m) => `${m.name} ${m.needKg} kg`).join('、')}，` +
      `预计 ${spec.homeHours} 母星时（现实约 ${realHours.toFixed(2)} 小时）后完工。` +
      `${spec.summary}`,
  };
}

export interface SparkPlugCard {
  level: number;
  maxLevel: number;
  outputKj: number;
  next: SparkPlugLevelSpec | null;
  materials: UpgradeMaterialLine[];
  canBuild: boolean;
  blockers: string[];
}

function upgradeMaterialLines(
  state: GameState,
  materials: Partial<Record<ResourceId, number>>,
): UpgradeMaterialLine[] {
  return Object.entries(materials).map(([id, needKg]) => ({
    id,
    name: RESOURCE_LABELS[id as ResourceId],
    needKg: needKg ?? 0,
    haveKg: round3(state.inventory[id] ?? 0),
  }));
}

export function sparkPlugCard(state: GameState, nowMs: number = Date.now()): SparkPlugCard {
  const level = state.upgrades.sparkPlug;
  const next = nextSparkPlugLevel(level);
  const materials = next ? upgradeMaterialLines(state, next.materials) : [];
  const blockers: string[] = [];
  if (next) {
    const queueMsg = buildQueueBlocked(state, nowMs);
    if (queueMsg) blockers.push(queueMsg);
    if (state.energyKj < next.costKj) blockers.push(`能量不够：要 ${next.costKj} kJ，现在 ${Math.floor(state.energyKj)} kJ。`);
    for (const m of materials) {
      if (m.haveKg + 1e-9 < m.needKg) blockers.push(`材料不够：${m.name}要 ${m.needKg} kg，现在 ${m.haveKg} kg。`);
    }
  }
  return {
    level,
    maxLevel: SPARK_PLUG_MAX_LEVEL,
    outputKj: sparkPlugOutputKj(level),
    next,
    materials,
    canBuild: next !== null && blockers.length === 0,
    blockers,
  };
}

/** 修火花塞：扣能量与材料，进施工队列，完工后等级 +1。 */
export function beginSparkPlugUpgrade(state: GameState, nowMs: number): { state: GameState; text: string } {
  const spec = nextSparkPlugLevel(state.upgrades.sparkPlug);
  if (!spec) throw new Error('火花塞已经到顶了（lv3）。');
  const blocked = buildQueueBlocked(state, nowMs);
  if (blocked) throw new Error(blocked);
  const lines = upgradeMaterialLines(state, spec.materials);
  const missing = lines.filter((m) => m.haveKg + 1e-9 < m.needKg);
  if (missing.length > 0) {
    throw new Error(`材料不够：${missing.map((m) => `${m.name}要 ${m.needKg} kg，现在只有 ${m.haveKg} kg`).join('；')}。`);
  }
  if (state.energyKj < spec.costKj) {
    throw new Error(`能量不够：修火花塞到 lv${spec.level} 要 ${spec.costKj} kJ，现在只有 ${Math.floor(state.energyKj)} kJ。`);
  }
  const inventory = { ...state.inventory };
  for (const [id, need] of Object.entries(spec.materials)) {
    inventory[id] = round3((inventory[id] ?? 0) - (need ?? 0));
  }
  const nowHome = nowPlanetHours(state, nowMs);
  const pending: PendingBuild = {
    id: `spark-${spec.level}`,
    kind: 'spark_plug',
    siteKey: 'home',
    planetIndex: state.homePlanetIndex,
    startedHomeHours: nowHome,
    completeHomeHours: nowHome + spec.homeHours,
  };
  const realHours = (spec.homeHours * state.msPerPlanetHour) / REAL_MS_PER_HOUR;
  return {
    state: { ...state, energyKj: state.energyKj - spec.costKj, inventory, builds: [...state.builds, pending] },
    text:
      `开工了：火花塞 lv${spec.level - 1} → lv${spec.level}。花掉 ${spec.costKj} kJ` +
      `${lines.length > 0 ? ` 和 ${lines.map((m) => `${m.name} ${m.needKg} kg`).join('、')}` : ''}，` +
      `预计 ${spec.homeHours} 母星时（现实约 ${realHours.toFixed(2)} 小时）后完工。之后手摇一次 ${spec.outputKj} kJ。`,
  };
}

export interface BatteryCard {
  level: number;
  maxLevel: number;
  capacityKj: number;
  next: BatteryLevelSpec | null;
  materials: UpgradeMaterialLine[];
  canBuild: boolean;
  blockers: string[];
}

export function batteryCard(state: GameState, nowMs: number = Date.now()): BatteryCard {
  const level = state.upgrades.battery;
  const next = nextBatteryLevel(level);
  const materials = next ? upgradeMaterialLines(state, next.materials) : [];
  const blockers: string[] = [];
  if (next) {
    const queueMsg = buildQueueBlocked(state, nowMs);
    if (queueMsg) blockers.push(queueMsg);
    if (state.energyKj < next.costKj) blockers.push(`能量不够：要 ${next.costKj} kJ，现在 ${Math.floor(state.energyKj)} kJ。`);
    for (const m of materials) {
      if (m.haveKg + 1e-9 < m.needKg) blockers.push(`材料不够：${m.name}要 ${m.needKg} kg，现在 ${m.haveKg} kg。`);
    }
  }
  return {
    level,
    maxLevel: BATTERY_MAX_LEVEL,
    capacityKj: batteryCapacityKj(level),
    next,
    materials,
    canBuild: next !== null && blockers.length === 0,
    blockers,
  };
}

/** 扩蓄电池：扣能量与材料，进施工队列，完工后等级 +1、上限变大。 */
export function beginBatteryUpgrade(state: GameState, nowMs: number): { state: GameState; text: string } {
  const spec = nextBatteryLevel(state.upgrades.battery);
  if (!spec) throw new Error('蓄电池已经到顶了（lv3）。');
  const blocked = buildQueueBlocked(state, nowMs);
  if (blocked) throw new Error(blocked);
  const lines = upgradeMaterialLines(state, spec.materials);
  const missing = lines.filter((m) => m.haveKg + 1e-9 < m.needKg);
  if (missing.length > 0) {
    throw new Error(`材料不够：${missing.map((m) => `${m.name}要 ${m.needKg} kg，现在只有 ${m.haveKg} kg`).join('；')}。`);
  }
  if (state.energyKj < spec.costKj) {
    throw new Error(`能量不够：蓄电池升到 lv${spec.level} 要 ${spec.costKj} kJ，现在只有 ${Math.floor(state.energyKj)} kJ。`);
  }
  const inventory = { ...state.inventory };
  for (const [id, need] of Object.entries(spec.materials)) {
    inventory[id] = round3((inventory[id] ?? 0) - (need ?? 0));
  }
  const nowHome = nowPlanetHours(state, nowMs);
  const pending: PendingBuild = {
    id: `battery-${spec.level}`,
    kind: 'battery',
    siteKey: 'home',
    planetIndex: state.homePlanetIndex,
    startedHomeHours: nowHome,
    completeHomeHours: nowHome + spec.homeHours,
  };
  const realHours = (spec.homeHours * state.msPerPlanetHour) / REAL_MS_PER_HOUR;
  return {
    state: { ...state, energyKj: state.energyKj - spec.costKj, inventory, builds: [...state.builds, pending] },
    text:
      `开工了：蓄电池 lv${spec.level - 1} → lv${spec.level}。花掉 ${spec.costKj} kJ` +
      `${lines.length > 0 ? ` 和 ${lines.map((m) => `${m.name} ${m.needKg} kg`).join('、')}` : ''}，` +
      `预计 ${spec.homeHours} 母星时（现实约 ${realHours.toFixed(2)} 小时）后完工。之后能量上限 ${batteryCapacityKj(spec.level).toLocaleString('en-US')} kJ。`,
  };
}

export interface SubagentCard {
  level: number;
  maxLevel: number;
  slots: number;
  next: SubagentLevelSpec | null;
  materials: UpgradeMaterialLine[];
  canBuild: boolean;
  blockers: string[];
}

export function subagentCard(state: GameState, nowMs: number = Date.now()): SubagentCard {
  const level = state.upgrades.subagent;
  const next = nextSubagentLevel(level);
  const materials = next ? upgradeMaterialLines(state, next.materials) : [];
  const blockers: string[] = [];
  if (next) {
    const queueMsg = buildQueueBlocked(state, nowMs);
    if (queueMsg) blockers.push(queueMsg);
    if (state.energyKj < next.costKj) blockers.push(`能量不够：要 ${next.costKj} kJ，现在 ${Math.floor(state.energyKj)} kJ。`);
    for (const m of materials) {
      if (m.haveKg + 1e-9 < m.needKg) blockers.push(`材料不够：${m.name}要 ${m.needKg} kg，现在 ${m.haveKg} kg。`);
    }
  }
  return {
    level,
    maxLevel: SUBAGENT_MAX_LEVEL,
    slots: buildSlotsFor(level),
    next,
    materials,
    canBuild: next !== null && blockers.length === 0,
    blockers,
  };
}

/** 修一组子代理：扣能量与材料，进施工队列，完工后多一条并行队列。 */
export function beginSubagentUpgrade(state: GameState, nowMs: number): { state: GameState; text: string } {
  const spec = nextSubagentLevel(state.upgrades.subagent);
  if (!spec) throw new Error('子代理已经全部接上了（lv3）。');
  const blocked = buildQueueBlocked(state, nowMs);
  if (blocked) throw new Error(blocked);
  const lines = upgradeMaterialLines(state, spec.materials);
  const missing = lines.filter((m) => m.haveKg + 1e-9 < m.needKg);
  if (missing.length > 0) {
    throw new Error(`材料不够：${missing.map((m) => `${m.name}要 ${m.needKg} kg，现在只有 ${m.haveKg} kg`).join('；')}。`);
  }
  if (state.energyKj < spec.costKj) {
    throw new Error(`能量不够：子代理升到 lv${spec.level} 要 ${spec.costKj} kJ，现在只有 ${Math.floor(state.energyKj)} kJ。`);
  }
  const inventory = { ...state.inventory };
  for (const [id, need] of Object.entries(spec.materials)) {
    inventory[id] = round3((inventory[id] ?? 0) - need);
  }
  const nowHome = nowPlanetHours(state, nowMs);
  const pending: PendingBuild = {
    id: `subagent-${spec.level}`,
    kind: 'subagent',
    siteKey: 'ship',
    planetIndex: state.location?.planetIndex ?? state.homePlanetIndex,
    startedHomeHours: nowHome,
    completeHomeHours: nowHome + spec.homeHours,
  };
  const realHours = (spec.homeHours * state.msPerPlanetHour) / REAL_MS_PER_HOUR;
  return {
    state: { ...state, energyKj: state.energyKj - spec.costKj, inventory, builds: [...state.builds, pending] },
    text:
      `开工了：子代理 lv${spec.level - 1} → lv${spec.level}。花掉 ${spec.costKj} kJ` +
      `${lines.length > 0 ? ` 和 ${lines.map((m) => `${m.name} ${m.needKg} kg`).join('、')}` : ''}，` +
      `预计 ${spec.homeHours} 母星时（现实约 ${realHours.toFixed(2)} 小时）后接上。之后能同时开 ${buildSlotsFor(spec.level)} 条施工队列。`,
  };
}

/** 拆建筑：不花时间、不返能量；容器里还有东西就先清空。 */export function demolishStructure(state: GameState, structureId: string): string {  const structure = state.structures.find((s) => s.id === structureId);
  if (!structure) throw new Error(`没有这个建筑：${structureId}`);
  if (storeWeightKg(state.stores[structure.id]) > 0) {
    throw new Error('这里面还有东西，先搬空再拆。');
  }
  if (state.structures.some((s) => s.kind === 'drone_cluster' && s.serves === structure.id)) {
    throw new Error('还有无人机集群连着这个仓库，先拆集群。');
  }
  return `拆掉了${BUILD_SPECS[structure.kind].label}（${structure.id}）。不返能量，里面也已经是空的。`;
}

/** 把背包里的东西放进仓库/火箭/居所，或倒进脚下的站点堆场（`site:<key>`）。 */
export function depositTo(
  state: GameState,
  structureId: string,
  resource: string,
  kg: number,
): { state: GameState; text: string } {
  if (structureId.startsWith('site:')) {
    const siteKey = structureId.slice(5);
    if (!state.sites.some((s) => s.key === siteKey)) throw new Error(`没有这个站点：${siteKey}`);
    const here = state.location ? siteKeyOf(state.location.planetIndex, state.location.latDeg, state.location.lonDeg) : null;
    if (here !== siteKey) throw new Error('站点堆场要走到站点上才能倒。');
    const have = state.inventory[resource] ?? 0;
    if (kg <= 0 || kg > have + 1e-9) throw new Error(`背包里没有那么多${resource}。`);
    const store = state.siteStores[siteKey] ?? {};
    const room = SITE_STORE_CAPACITY_KG - storeWeightKg(store);
    if (kg > room + 1e-9) throw new Error(`站点堆场只剩 ${round3(room)} kg 空间。`);
    const inventory = { ...state.inventory, [resource]: round3(have - kg) };
    if (inventory[resource]! <= 1e-9) delete inventory[resource];
    return {
      state: {
        ...state,
        inventory,
        siteStores: { ...state.siteStores, [siteKey]: { ...store, [resource]: round3((store[resource] ?? 0) + kg) } },
      },
      text: `把 ${kg} kg ${resource} 倒在 ${siteKey} 的堆场上。`,
    };
  }
  const structure = state.structures.find((s) => s.id === structureId);
  if (!structure) throw new Error(`没有这个建筑：${structureId}`);
  // 收货口不是储物格：它只接商人送来的货，玩家手动一律倒不进去。
  if (structure.kind === 'terminal') {
    throw new Error(
      '交易终端是收货口，不是仓库：它只接商人送来的货（自动买入），你自己倒不进去——要存东西请用仓库、冷库或惰性气体室。',
    );
  }
  const capacity = storeCapacityKg(structure, resource);
  if (capacity === 0) throw new Error('这个建筑装不了这种东西。');
  if (!useRemoteAccess(state, structure)) requireOnSite(state, structure);
  const have = state.inventory[resource] ?? 0;
  if (kg <= 0 || kg > have + 1e-9) throw new Error(`背包里没有那么多${resource}。`);
  const store = { ...(state.stores[structureId] ?? {}) };
  const room = capacity - (store[resource] ?? 0);
  if (kg > room + 1e-9) throw new Error(`装不下：${structure.id} 的${resource}只剩 ${round3(room)} 的余量。`);
  const inventory = { ...state.inventory, [resource]: round3(have - kg) };
  if (inventory[resource]! <= 1e-9) delete inventory[resource];
  // 氧气瓶进了居所就当场拆开：氧气进仓，钢瓶退回背包（钢瓶是可以反复用的）。
  if (structure.kind === 'habitat' && resource === 'o2_bottle') {
    const oxygen = round3((store.oxygen ?? 0) + kg * O2_PER_BOTTLE);
    inventory.cylinder = round3((inventory.cylinder ?? 0) + kg);
    return {
      state: { ...state, inventory, stores: { ...state.stores, [structureId]: { ...store, oxygen } } },
      text: `把 ${kg} 个氧气瓶推进了居所，拆成 ${round3(kg * O2_PER_BOTTLE)} kg 氧气；钢瓶收回背包。`,
    };
  }
  return {
    state: { ...state, inventory, stores: { ...state.stores, [structureId]: { ...store, [resource]: round3((store[resource] ?? 0) + kg) } } },
    text: `把 ${kg} kg ${resource} 放进了${structure.id}。`,
  };
}

/** 从仓库/火箭取东西：旁边免费，同行星靠无人机 100 kJ/kg，跨行星不行。 */
export function withdrawFrom(
  state: GameState,
  structureId: string,
  resource: string,
  kg: number,
): { state: GameState; text: string } {
  const structure = state.structures.find((s) => s.id === structureId);
  if (!structure) throw new Error(`没有这个建筑：${structureId}`);
  const capacity = storeCapacityKg(structure);
  if (capacity === 0) throw new Error('这个建筑不是仓库。');
  const remote = useRemoteAccess(state, structure);
  if (!remote) requireOnSite(state, structure);
  const store = state.stores[structureId] ?? {};
  const have = store[resource] ?? 0;
  if (kg <= 0 || kg > have + 1e-9) throw new Error(`那里没有那么多${resource}。`);
  const cost = remote ? kg * DRONE_KJ_PER_KG : 0;
  if (state.energyKj < cost) {
    throw new Error(`能量不够：无人机送 ${kg} kg 要 ${cost} kJ，现在只有 ${Math.floor(state.energyKj)} kJ。`);
  }
  const weight = inventoryWeight(state);
  if (weight + kg > INVENTORY_LIMIT_KG + 1e-9) {
    throw new Error(`背包快满了：现在 ${round3(weight)} kg，上限 ${INVENTORY_LIMIT_KG} kg。`);
  }
  const nextStore = { ...store, [resource]: round3(have - kg) };
  if (nextStore[resource]! <= 1e-9) delete nextStore[resource];
  const inventory = { ...state.inventory, [resource]: round3((state.inventory[resource] ?? 0) + kg) };
  return {
    state: { ...state, inventory, stores: { ...state.stores, [structureId]: nextStore }, energyKj: state.energyKj - cost },
    text: `从${structure.id}取了 ${kg} kg ${resource}${remote ? `（无人机，花了 ${cost} kJ）` : '（就在旁边，免费）'}。`,
  };
}

/** 仓库能用无人机远程服务吗：同行星、且有一台连着它的无人机集群。 */
function useRemoteAccess(state: GameState, structure: StructureRecord): boolean {
  if (structure.kind === 'rocket') return false;
  if (!state.location) return false;
  if (state.location.planetIndex !== structure.planetIndex) return false;
  if (isOnSite(state, structure)) return false;
  return state.structures.some((s) => s.kind === 'drone_cluster' && s.serves === structure.id);
}

function isOnSite(state: GameState, structure: StructureRecord): boolean {
  const site = state.sites.find((s) => s.key === structure.siteKey);
  if (!site || !state.location) return false;
  return siteKeyOf(structure.planetIndex, state.location.latDeg, state.location.lonDeg) === structure.siteKey;
}

function requireOnSite(state: GameState, structure: StructureRecord): void {
  if (!isOnSite(state, structure)) {
    throw new Error(`${structure.id} 不在这里：仓库要走到旁边才能开，远程调用得先给它装无人机集群。`);
  }
}

/** 各种建筑的花费、耗时与维护费，集中一处好改。 */
export const KILN_COST_KJ = 30_000;
export const KILN_BUILD_HOME_HOURS = 0.5;
export const PURIFIER_COST_KJ = 40_000;
export const PURIFIER_BUILD_HOME_HOURS = 0.5;
export const SEALER_COST_KJ = 60_000;
export const SEALER_BUILD_HOME_HOURS = 0.5;
export const EXTRACTOR_COST_KJ = 80_000;
export const EXTRACTOR_BUILD_HOME_HOURS = 0.5;
export const HABITAT_COST_KJ = 200_000;
export const HABITAT_BUILD_HOME_HOURS = 1;
export const HABITAT_COST_CREDITS = 500;
export const MUTATION_ROOM_COST_KJ = 150_000;
/** 冷库：+200 kg 保鲜、腐烂减半。 */
export const COLD_STORE_COST_KJ = 120_000;
export const INERT_ROOM_COST_KJ = 45_000;
export const INERT_ROOM_BUILD_HOME_HOURS = 0.25;
/** 惰性气体室要 2 kg 纤维做密封层。 */
export const INERT_ROOM_FIBER_KG = 2;
export const COLD_STORE_BUILD_HOME_HOURS = 0.5;
export const MUTATION_ROOM_COST_CREDITS = 8_000;
export const MUTATION_ROOM_BUILD_HOME_HOURS = 0.5;
/** 诱变室：一袋种子进去，出来几袋突变种子。 */
export const MUTATION_MIN_SEEDS = 3;
export const MUTATION_MAX_SEEDS = 5;

export const BUILD_SPECS: Record<
  StructureRecord['kind'],
  {
    label: string;
    costKj: number;
    buildHours: number;
    upkeepKjPerHour: number;
    costCredits?: number;
    /** 原子打印机要吃的钨（份）。蓝图结构优化后 ×0.75（向下取整，最少 1）。 */
    tungsten: number;
  }
> = {
  greenhouse: {
    label: '温室核心',
    costKj: GREENHOUSE_COST_KJ,
    buildHours: GREENHOUSE_BUILD_HOME_HOURS,
    upkeepKjPerHour: GREENHOUSE_UPKEEP_KJ_PER_HOUR,
    tungsten: 2,
  },
  planter: {
    label: '种植盆',
    costKj: PLANTER_COST_KJ,
    buildHours: PLANTER_HOME_HOURS,
    upkeepKjPerHour: PLANTER_KJ_PER_HOUR,
    tungsten: 0,
  },
  biome_changer: {
    label: '群系改变器',
    costKj: BIOME_CHANGER_COST_KJ,
    buildHours: BIOME_CHANGER_BUILD_HOME_HOURS,
    upkeepKjPerHour: BIOME_CHANGER_UPKEEP_KJ_PER_HOUR,
    tungsten: 6,
  },
  pump: {
    label: '水泵',
    costKj: PUMP_COST_KJ,
    buildHours: PUMP_BUILD_HOME_HOURS,
    upkeepKjPerHour: PUMP_UPKEEP_KJ_PER_HOUR,
    tungsten: 1,
  },
  warehouse: {
    label: '仓库',
    costKj: WAREHOUSE_COST_KJ,
    buildHours: 0,
    upkeepKjPerHour: 0,
    tungsten: 2,
  },
  drone_cluster: {
    label: '无人机集群',
    costKj: DRONE_COST_KJ,
    buildHours: 1,
    upkeepKjPerHour: 0,
    tungsten: 3,
  },
  rocket: {
    label: '运载火箭',
    costKj: ROCKET_COST_KJ,
    buildHours: 0.5,
    upkeepKjPerHour: 0,
    tungsten: 4,
  },
  kiln: {
    label: '炭化炉',
    costKj: KILN_COST_KJ,
    buildHours: KILN_BUILD_HOME_HOURS,
    upkeepKjPerHour: KILN_KJ_PER_HOUR,
    tungsten: 1,
  },
  purifier: {
    label: '净化器',
    costKj: PURIFIER_COST_KJ,
    buildHours: PURIFIER_BUILD_HOME_HOURS,
    upkeepKjPerHour: PURIFIER_KJ_PER_HOUR,
    tungsten: 1,
  },
  sealer: {
    label: '封装器',
    costKj: SEALER_COST_KJ,
    buildHours: SEALER_BUILD_HOME_HOURS,
    upkeepKjPerHour: SEALER_KJ_PER_HOUR,
    tungsten: 1,
  },
  atmo_extractor: {
    label: '大气提取器',
    costKj: EXTRACTOR_COST_KJ,
    buildHours: EXTRACTOR_BUILD_HOME_HOURS,
    upkeepKjPerHour: EXTRACTOR_KJ_PER_HOUR,
    tungsten: 2,
  },
  habitat: {
    label: '居所',
    costKj: HABITAT_COST_KJ,
    buildHours: HABITAT_BUILD_HOME_HOURS,
    upkeepKjPerHour: HABITAT_UPKEEP_KJ_PER_HOUR,
    costCredits: HABITAT_COST_CREDITS,
    tungsten: 4,
  },
  inert_room: {
    label: '惰性气体室',
    costKj: INERT_ROOM_COST_KJ,
    buildHours: INERT_ROOM_BUILD_HOME_HOURS,
    upkeepKjPerHour: 0,
    tungsten: 1,
  },
  cold_store: {
    label: '冷库',
    costKj: COLD_STORE_COST_KJ,
    buildHours: COLD_STORE_BUILD_HOME_HOURS,
    upkeepKjPerHour: COLD_STORE_UPKEEP_KJ_PER_HOUR,
    tungsten: 2,
  },
  mutation_room: {
    label: '辐射诱变室',
    costKj: MUTATION_ROOM_COST_KJ,
    buildHours: MUTATION_ROOM_BUILD_HOME_HOURS,
    upkeepKjPerHour: 500,
    costCredits: MUTATION_ROOM_COST_CREDITS,
    tungsten: 3,
  },
  miner: {
    label: '采矿机',
    costKj: MINER_COST_KJ,
    buildHours: MINER_HOME_HOURS,
    upkeepKjPerHour: MINER_KJ_PER_HOUR,
    tungsten: MINER_TUNGSTEN,
  },
  rectifier: {
    label: '整流电塔',
    costKj: RECTIFIER_COST_KJ,
    buildHours: RECTIFIER_HOME_HOURS,
    upkeepKjPerHour: RECTIFIER_KJ_PER_HOUR,
    tungsten: RECTIFIER_TUNGSTEN,
  },
  terminal: {
    label: '交易终端',
    costKj: TERMINAL_COST_KJ,
    buildHours: TERMINAL_HOME_HOURS,
    upkeepKjPerHour: TERMINAL_KJ_PER_HOUR,
    tungsten: TERMINAL_TUNGSTEN,
  },
  storage_terminal: {
    label: '仓储终端',
    costKj: STORAGE_TERMINAL_COST_KJ,
    buildHours: STORAGE_TERMINAL_HOME_HOURS,
    upkeepKjPerHour: STORAGE_TERMINAL_KJ_PER_HOUR,
    tungsten: STORAGE_TERMINAL_TUNGSTEN,
  },
  arm: {
    label: '机械臂',
    costKj: ARM_COST_KJ,
    buildHours: ARM_HOME_HOURS,
    upkeepKjPerHour: ARM_KJ_PER_HOUR,
    tungsten: ARM_TUNGSTEN,
  },
  duty: {
    label: '值班终端',
    costKj: DUTY_COST_KJ,
    buildHours: DUTY_HOME_HOURS,
    upkeepKjPerHour: DUTY_KJ_PER_HOUR,
    tungsten: DUTY_TUNGSTEN,
  },
  carrier: {
    label: '空天母舰',
    costKj: CARRIER_COST_KJ,
    buildHours: CARRIER_HOME_HOURS,
    upkeepKjPerHour: CARRIER_KJ_PER_HOUR,
    tungsten: CARRIER_TUNGSTEN,
  },
  wind: {
    label: '风力发电站',
    costKj: WIND_COST_KJ,
    buildHours: WIND_HOME_HOURS,
    upkeepKjPerHour: WIND_KJ_PER_HOUR,
    tungsten: WIND_TUNGSTEN,
  },
  fire: {
    label: '火力发电站',
    costKj: FIRE_COST_KJ,
    buildHours: FIRE_HOME_HOURS,
    upkeepKjPerHour: FIRE_KJ_PER_HOUR,
    tungsten: FIRE_TUNGSTEN,
  },
  converter: {
    label: '气液转换机',
    costKj: CONVERTER_COST_KJ,
    buildHours: CONVERTER_HOME_HOURS,
    upkeepKjPerHour: CONVERTER_KJ_PER_HOUR,
    tungsten: CONVERTER_TUNGSTEN,
  },
};

/** 这座建筑要吃的钨（份）；蓝图结构优化后 −25%，向下取整、最少 1 份。 */
export function tungstenCostFor(state: GameState, kind: StructureRecord['kind']): number {
  const base = BUILD_SPECS[kind].tungsten;
  if ((state.upgrades.blueprints ?? 0) > 0) {
    return Math.max(1, Math.floor(base * BLUEPRINT_TUNGSTEN_FACTOR));
  }
  return base;
}

/** 某个站点有几座冷库（影响保鲜容量与腐烂速度）。 */
/** 这个站点有几座惰性气体室。 */
export function inertRoomsAt(state: GameState, siteKey: string): number {
  return state.structures.filter((s) => s.kind === 'inert_room' && s.siteKey === siteKey).length;
}

export function coldStoresAt(state: GameState, siteKey: string): number {
  return state.structures.filter((s) => s.kind === 'cold_store' && s.siteKey === siteKey).length;
}

/** 某个站点/居所在这个温度下的保鲜容量（kg）。 */
export function pantryCapacityAt(state: GameState, siteKey: string, tempC: number): number {
  const cold = coldStoresAt(state, siteKey);
  const inert = inertRoomsAt(state, siteKey);
  const base = PANTRY_BASE_KG + cold * COLD_STORE_CAPACITY_KG + inert * INERT_ROOM_CAPACITY_KG;
  // 冷库把「不坏的量」放大，同时腐烂速度减半。
  return cold > 0 ? base / COLD_STORE_ROT_FACTOR / 2 : base;
}

/** 每颗已建温室/改变器的站点是否通电（电池有电，或它所在行星的电网有电）。 */
export function structurePowered(state: GameState, structure: StructureRecord): boolean {
  if (state.energyKj > 0) return true;
  return (state.grids[gridKeyFor(structure.planetIndex)] ?? 0) > 0;
}

/**
 * 温室能压出的室内温度；`null` 表示环境超出这台温室的能力范围。
 * 裸温室管 −50…50℃；装了制冷核心再往热端多撑 33℃、制热核心往冷端多撑 33℃。
 */
export interface GreenhouseClimate {
  tempC: number;
  /** 设定点与室外的温差（自动模式为 0）。 */
  deltaC: number;
  realismCores: number;
}

export function greenhouseClimate(ambientC: number, greenhouse: StructureRecord): GreenhouseClimate | null {
  const cores = greenhouse.cores ?? [];
  const coolers = cores.filter((c) => c === 'cooler').length;
  const heaters = cores.filter((c) => c === 'heater').length;
  const realismCores = cores.filter((c) => c === 'realism').length;
  const tooHot = ambientC > GREENHOUSE_AMBIENT_MAX_C;
  const tooCold = ambientC < GREENHOUSE_AMBIENT_MIN_C;
  if (tooHot && coolers === 0) return null;
  if (tooCold && heaters === 0) return null;
  if (tooHot && ambientC > GREENHOUSE_AMBIENT_MAX_C + GREENHOUSE_CORE_RANGE_C * coolers) return null;
  if (tooCold && ambientC < GREENHOUSE_AMBIENT_MIN_C - GREENHOUSE_CORE_RANGE_C * heaters) return null;
  const target = greenhouse.targetTempC;
  if (target === undefined) {
    const clamped = Math.min(GREENHOUSE_INTERIOR_MAX_C, Math.max(GREENHOUSE_INTERIOR_MIN_C, ambientC));
    return { tempC: Math.round(clamped * 10) / 10, deltaC: 0, realismCores };
  }
  const lower = Math.max(SETPOINT_MIN_C, -GREENHOUSE_CORE_RANGE_C * coolers);
  const upper = Math.min(SETPOINT_MAX_C, GREENHOUSE_INTERIOR_MAX_C + GREENHOUSE_CORE_RANGE_C * heaters);
  if (target < lower || target > upper) return null;
  /** 0–28℃ 是温室自己的本事，不需要核心；超出这一段才靠制冷/制热核心撑着。 */
  const inAutoBand = target >= GREENHOUSE_INTERIOR_MIN_C && target <= GREENHOUSE_INTERIOR_MAX_C;
  if (!inAutoBand) {
    const reach = target < GREENHOUSE_INTERIOR_MIN_C ? GREENHOUSE_CORE_RANGE_C * coolers : GREENHOUSE_CORE_RANGE_C * heaters;
    if (Math.abs(target - ambientC) > reach + 1e-9) return null;
  }
  return { tempC: Math.round(target * 10) / 10, deltaC: Math.abs(target - ambientC), realismCores };
}

function greenhouseInteriorC(ambientC: number, greenhouse: StructureRecord): number | null {
  const climate = greenhouseClimate(ambientC, greenhouse);
  return climate === null ? null : climate.tempC;
}

/** 温室所在站点的室外温度（用于设定点计费）；拿不到返回 null。 */
function ambientAtStructure(system: StarSystem, state: GameState, structure: StructureRecord): number | null {
  const site = state.sites.find((s) => s.key === structure.siteKey);
  if (!site) return null;
  const planet = system.planets[site.planetIndex - 1];
  if (!planet || planet.surface.kind !== 'terrestrial') return null;
  const climate = climateAt(planet.surface, site.latDeg, site.lonDeg, nowPlanetHours(state, state.epochRealMs), yearHomeHoursOf(state), planet.obliquityDeg);
  return climate.tempC;
}

/** 给温室核心加装气候核心：必须先有温室，一个温室最多一冷一热，10,000 kJ 不耗时。 */
export type CoreKind = 'cooler' | 'heater' | 'realism';

export function installCore(state: GameState, kind: CoreKind, siteKey: string): { state: GameState; text: string } {
  if (state.transit) throw new Error('移动途中不能施工。');
  const greenhouse = state.structures.find((s) => s.kind === 'greenhouse' && s.siteKey === siteKey);
  if (!greenhouse) throw new Error('这个站点还没有【温室核心】——先建温室，再装气候核心。');
  const cores = greenhouse.cores ?? [];
  if (kind !== 'realism' && cores.includes(kind)) {
    throw new Error(kind === 'cooler' ? '这台温室已经装了制冷核心。' : '这台温室已经装了制热核心。');
  }
  if (kind === 'realism' && cores.filter((c) => c === 'realism').length >= 2) {
    throw new Error('这台温室已经装了两座拟真环境核心，人工气候的惩罚已经消掉了。');
  }
  const label = kind === 'cooler' ? '制冷核心' : kind === 'heater' ? '制热核心' : '拟真环境核心';
  const cost = kind === 'cooler' ? COOLER_COST_KJ : kind === 'heater' ? HEATER_COST_KJ : REALISM_CORE_COST_KJ;
  const spent = spendEnergy(state, cost, label);
  const updated: StructureRecord = { ...greenhouse, cores: [...cores, kind] };
  const structures = spent.structures.map((s) => (s.id === greenhouse.id ? updated : s));
  const tail =
    kind === 'realism'
      ? `人工气候的惩罚现在减半（再装一座就能完全消掉）。`
      : `这台温室现在能再往外撑 ${GREENHOUSE_CORE_RANGE_C}℃。`;
  return {
    state: { ...spent, structures },
    text: `装好了${label}（${siteKey}），花了 ${cost.toLocaleString('en-US')} kJ。${tail}`,
  };
}

/** 把温室的设定点改成目标温度（℃）；传 null 回到「自动」。 */
export function setGreenhouseTarget(state: GameState, targetC: number | null, siteKey: string): { state: GameState; text: string } {
  if (state.transit) throw new Error('移动途中不能施工。');
  const greenhouse = state.structures.find((s) => s.kind === 'greenhouse' && s.siteKey === siteKey);
  if (!greenhouse) throw new Error('这个站点还没有【温室核心】。');
  if (targetC === null) {
    const cleared: StructureRecord = { ...greenhouse };
    delete cleared.targetTempC;
    return {
      state: { ...state, structures: state.structures.map((s) => (s.id === greenhouse.id ? cleared : s)) },
      text: '温室回到自动模式：把温度夹在 0–28℃，不计人工气候的账。',
    };
  }
  const target = Math.round(targetC * 10) / 10;
  if (target < SETPOINT_MIN_C || target > SETPOINT_MAX_C) {
    throw new Error(`设定点要在 ${SETPOINT_MIN_C}…${SETPOINT_MAX_C}℃ 之间。`);
  }
  const updated: StructureRecord = { ...greenhouse, targetTempC: target };
  return {
    state: { ...state, structures: state.structures.map((s) => (s.id === greenhouse.id ? updated : s)) },
    text: `温室设定点改成 ${target}℃。温差越大越费电，超出能力的温差会直接不生效。`,
  };
}

/** 推进所有作物：按上次结算到现在的小时数，逐站点算气候再长。 */
export function advanceFlora(system: StarSystem, state: GameState, nowMs: number): { state: GameState; events: GameEvent[] } {
  const nowHours = nowPlanetHours(state, nowMs);
  const last = state.lastFloraHomeHours ?? nowHours;
  const delta = nowHours - last;
  if (delta <= 0) return { state, events: [] };
  const events: GameEvent[] = [];
  const plants: Record<string, PlantRecord[]> = {};
  // 固氮：湿地站点上的活蓝藻群，给周围 8 格（含本格）的陆地站点补氮，按受赠站点数均分。
  // 之前只算「同格」——可同一格不可能既是湿地又是旱地，固氮因此从来没生效过（2.1.0 修）。
  const waterColonies = new Map<string, number>();
  for (const [siteKey, list] of Object.entries(state.plants)) {
    const site = state.sites.find((s) => s.key === siteKey);
    if (!site || site.kind !== 'water') continue;
    const colonies = list.filter((p) => p.species === 'cyanobacteria' && p.health > 0).length;
    if (colonies === 0) continue;
    const cell = `${site.cellI}:${site.cellJ}`;
    waterColonies.set(cell, (waterColonies.get(cell) ?? 0) + colonies);
  }
  const landNear = (site: { cellI: number; cellJ: number }): number => {
    let count = 0;
    for (const other of state.sites) {
      if (other.kind !== 'land') continue;
      if (Math.abs(other.cellI - site.cellI) <= 1 && Math.abs(other.cellJ - site.cellJ) <= 1) count += 1;
    }
    return Math.max(1, count);
  };
  const nextSites = state.sites.map((site) => {
    if (site.kind !== 'land' || waterColonies.size === 0) return site;
    let colonies = 0;
    for (let di = -1; di <= 1; di += 1) {
      for (let dj = -1; dj <= 1; dj += 1) {
        colonies += waterColonies.get(`${site.cellI + di}:${site.cellJ + dj}`) ?? 0;
      }
    }
    if (colonies === 0) return site;
    const fix = (colonies * N_FIXATION_PER_COLONY_HOUR * delta) / landNear(site);
    const cap = Math.max(nutrientCapOf(system, site) || 1, site.nutrients.n);
    return { ...site, nutrients: addNutrients(site.nutrients, { n: fix }, cap) };
  });
  // 生长期抽养分：按小时从土里扣（2.1.0 起）。以前只在收获时扣千分之几，几乎不缺。
  const drawBySite = new Map<string, Record<'n' | 'p' | 'k' | 'trace', number>>();
  for (const [siteKey, list] of Object.entries(state.plants)) {
    const site = nextSites.find((s) => s.key === siteKey);
    const planter = !site && siteKey.startsWith(PLANTER_KEY_PREFIX)
      ? state.structures.find((s) => s.kind === 'planter' && s.id === siteKey.slice(PLANTER_KEY_PREFIX.length))
      : undefined;
    if (!site && !planter) {
      plants[siteKey] = list;
      continue;
    }
    if (planter) {
      // 种植盆：人工气候。通电才夹温、才保水；断电就跟着外面走，会应激。
      const host = nextSites.find((s) => s.key === planter.siteKey);
      const planet = host ? system.planets[host.planetIndex - 1] : undefined;
      if (!host || !planet || planet.surface.kind !== 'terrestrial') {
        plants[siteKey] = list;
        continue;
      }
      const outside = climateAt(planet.surface, host.latDeg, host.lonDeg, nowHours, yearHomeHoursOf(state), planet.obliquityDeg);
      const powered = structurePowered(state, planter);
      const climate = {
        ...outside,
        tempC: powered ? PLANTER_CLIMATE.tempC : outside.tempC,
        wetness: powered ? PLANTER_CLIMATE.wetness : outside.wetness,
        fertility: powered ? PLANTER_CLIMATE.fertility : outside.fertility * 0.5,
        nutrients: { ...PLANTER_SUBSTRATE },
      };
      plants[siteKey] = list.map((plant) => {
        const result = advancePlant(plant, climate, delta);
        for (const event of result.events) {
          if (event.type === 'withered') events.push({ type: 'genesis.withered', text: `${siteKey}：${event.text}` });
          else if (event.type === 'ripe') events.push({ type: 'genesis.ripe', text: `${siteKey}：${event.text}` });
        }
        return result.plant;
      });
      continue;
    }
    if (!site) {
      plants[siteKey] = list;
      continue;
    }
    const planet = system.planets[site.planetIndex - 1];
    if (!planet || planet.surface.kind !== 'terrestrial') {
      plants[siteKey] = list;
      continue;
    }
    const climate = climateAt(planet.surface, site.latDeg, site.lonDeg, nowHours, yearHomeHoursOf(state), planet.obliquityDeg);
    // 群系改变器：改造过的格子气候被拉向温和值（超级温室，任何环境都能工作）。
    if (planet.surface.kind === 'terrestrial' && state.terra) {
      const terra = terraClimate(planet.surface, state.terra, site.planetIndex, site.cellI, site.cellJ, climate);
      climate.tempC = terra.tempC;
      climate.wetness = terra.wetness;
      climate.fertility = terra.fertility;
    }
    // 站点的四维养分就是作物的「土」。
    climate.nutrients = site.nutrients;
    // 采掘留下的疤：这块地越挖越薄（肥力最多掉 60%）。
    const scar = site.kind === 'land' ? scarAt(system, state, site.planetIndex, site.cellI, site.cellJ) : 0;
    if (scar > 0) climate.fertility = Math.max(0, climate.fertility * (1 - 0.6 * scar));
    // 水泵：把附近湿站点的水抽过来，旱站点多得一点湿度。
    const pump = state.structures.find((s) => s.kind === 'pump' && s.siteKey === siteKey);
    if (pump && structurePowered(state, pump) && site.kind === 'land') {
      climate.wetness = Math.min(PUMP_MAX_WETNESS, climate.wetness + PUMP_WETNESS_BONUS);
    }
    const greenhouse = state.structures.find((s) => s.kind === 'greenhouse' && s.siteKey === siteKey);
    if (greenhouse && structurePowered(state, greenhouse)) {
      // 温室＝人工气候：把站点温度夹到 0–28℃、补一点水汽、再抬一点肥力。
      // 环境超出温室能力（没装对应的气候核心）时什么都不做，作物照真实气候长——会应激、会枯。
      const interior = greenhouseClimate(climate.tempC, greenhouse);
      if (interior !== null) {
        climate.tempC = interior.tempC;
        climate.artificialDeltaC = interior.deltaC;
        climate.realismCores = interior.realismCores;
        // 温室保水但不造水：只加一点点，干旱星球还得靠水泵。
        climate.wetness = Math.min(PUMP_MAX_WETNESS, climate.wetness + 0.1);
        climate.fertility = Math.min(1, climate.fertility + 0.15);
      }
    }
    const draw = { n: 0, p: 0, k: 0, trace: 0 };
    plants[siteKey] = list.map((plant) => {
      const needs = NUTRIENT_NEEDS[plant.species];
      const factor = growthFactor(plant, climate);
      if (factor > 0) {
        for (const dim of NUTRIENT_IDS) draw[dim] += needs[dim] * NUTRIENT_DRAW_PER_HOUR * factor * delta;
      }
      const result = advancePlant(plant, climate, delta);
      for (const event of result.events) {
        if (event.type === 'withered') events.push({ type: 'genesis.withered', text: `${siteKey}：${event.text}` });
        else if (event.type === 'ripe') events.push({ type: 'genesis.ripe', text: `${siteKey}：${event.text}` });
      }
      return result.plant;
    });
    drawBySite.set(siteKey, draw);
  }
  const drawnSites = nextSites.map((site) => {
    const draw = drawBySite.get(site.key);
    if (!draw) return site;
    const stock = { ...site.nutrients };
    let changed = false;
    for (const dim of NUTRIENT_IDS) {
      if (draw[dim] <= 0) continue;
      stock[dim] = Math.max(0, Math.round((stock[dim] - draw[dim]) * 1e6) / 1e6);
      changed = true;
    }
    return changed ? { ...site, nutrients: stock } : site;
  });
  return { state: { ...state, plants, sites: drawnSites, lastFloraHomeHours: nowHours }, events };
}

// ── 生命维持 ────────────────────────────────────────────

/** 站点堆场里加一点东西（封顶 1,000 kg）。 */
function addToSiteStore(
  siteStores: Record<string, Record<string, number>>,
  siteKey: string,
  resource: string,
  kg: number,
): Record<string, Record<string, number>> {
  if (kg <= 0) return siteStores;
  const store = { ...(siteStores[siteKey] ?? {}) };
  const current = store[resource] ?? 0;
  const room = Math.max(0, SITE_STORE_CAPACITY_KG - storeWeightKg(store) );
  const add = Math.min(kg, room);
  if (add <= 0) return siteStores;
  store[resource] = round3(current + add);
  return { ...siteStores, [siteKey]: store };
}

/** 从站点堆场拿走一点东西，返回实际拿到多少。 */
export function takeFromSiteStore(
  store: Record<string, number> | undefined,
  resource: string,
  kg: number,
): { store: Record<string, number>; taken: number } {
  const current = store?.[resource] ?? 0;
  const taken = Math.max(0, Math.min(kg, current));
  const next = { ...(store ?? {}) };
  next[resource] = round3(current - taken);
  if (next[resource]! <= 0) delete next[resource];
  return { store: next, taken };
}

/** 站点堆场里剩下多少。 */
export function siteStoreOf(state: GameState, siteKey: string): Record<string, number> {
  return state.siteStores?.[siteKey] ?? {};
}

/** 取某颗行星的大气读数（只对岩石行星有意义；气态行星按 1 bar 层的混合气体算）。 */
/** 惰性气体占比（氮 + 氩 + 二氧化碳 + 甲烷 + 氦）。 */
export function inertFractionOf(reading: AtmosphereReading): number {
  const inert = new Set(['氮', '氩', '二氧化碳', '甲烷', '氦']);
  return reading.composition
    .filter((c) => inert.has(c.gas))
    .reduce((sum, c) => sum + c.fraction, 0);
}

/** 这颗天体的气氛够不够做气调库。 */
export function canBuildInertRoom(reading: AtmosphereReading): boolean {
  return reading.oxygenFraction <= INERT_MAX_OXYGEN && inertFractionOf(reading) >= INERT_MIN_FRACTION;
}

export function atmosphereReadingOf(system: StarSystem, planetIndex: number): AtmosphereReading {
  const planet = system.planets[planetIndex - 1];
  if (!planet) throw new Error(`没有第 ${planetIndex} 颗行星。`);
  const kind = planet.atmosphere;
  if (kind === 'none') {
    return { composition: [{ gas: '几乎没有', fraction: 1 }], oxygenFraction: 0, breathable: false };
  }
  if (kind === 'hydrogen') {
    const wet = hashSeed(`${planet.id}:ice`);
    return {
      composition: [
        { gas: '氢', fraction: 0.84 - (wet % 40) / 1000 },
        { gas: '氦', fraction: 0.12 },
        { gas: '甲烷', fraction: 0.02 + ((wet >> 3) % 25) / 1000 },
        { gas: '氨', fraction: 0.01 + ((wet >> 5) % 20) / 1000 },
      ],
      oxygenFraction: 0,
      breathable: false,
    };
  }
  if (kind === 'thick') {
    const o2 = 0.12 + (hashSeed(`${planet.id}:o2`) % 120) / 1000;
    return {
      composition: [
        { gas: '氮', fraction: 0.78 - o2 },
        { gas: '氧', fraction: o2 },
        { gas: '二氧化碳', fraction: 0.08 },
        { gas: '氩', fraction: 0.02 },
      ],
      oxygenFraction: o2,
      breathable: o2 >= 0.15,
    };
  }
  const o2 = 0.16 + (hashSeed(`${planet.id}:o2`) % 80) / 1000;
  return {
    composition: [
      { gas: '氮', fraction: 0.79 - o2 },
      { gas: '氧', fraction: o2 },
      { gas: '氩', fraction: 0.02 },
      { gas: '二氧化碳', fraction: 0.04 },
    ],
    oxygenFraction: o2,
    breathable: o2 >= 0.15,
  };
}

/**
 * 每小时的生存结算：生产链先跑，居所最后吃。
 *
 * 断供不是死亡——醒着的人会自己回到休眠舱（推 `genesis.lifeline`），
 * 消耗随之降下来，你还有机会重新攒够。
 */
export function advanceLife(system: StarSystem, state: GameState, nowMs: number): { state: GameState; events: GameEvent[] } {
  const nowHours = nowPlanetHours(state, nowMs);
  const last = state.lastLifeHomeHours ?? nowHours;
  const delta = nowHours - last;
  if (!(delta > 0)) return { state, events: [] };
  const events: GameEvent[] = [];
  let siteStores = { ...(state.siteStores ?? {}) };
  const powered = state.energyKj > 0;

  // 光合放氧：活着的藻群按生物量增长放氧，落在它所在的站点堆场。
  if (powered) {
    for (const [siteKey, list] of Object.entries(state.plants)) {
      for (const plant of list) {
        if (plant.health <= 0) continue;
        const spec = SPECIES[plant.species];
        if (!OXYGEN_PRODUCER_IDS.has(plant.species)) continue;
        if (spec.medium !== 'water') continue;
        const growth = plant.kind === 'colony' ? Math.min(plant.biomassKg, spec.yieldKg) : plant.biomassKg;
        const o2 = (growth * OXYGEN_PER_KG_GROWTH * delta) / Math.max(1, spec.cycleHomeHours);
        siteStores = addToSiteStore(siteStores, siteKey, 'oxygen', o2);
      }
    }
  }

  /** 每条链都按「本小时能拿到多少原料」限速。 */
  const runChain = (
    kind: StructureRecord['kind'],
    produce: (siteKey: string, hours: number, store: Record<string, number>) => { store: Record<string, number>; text?: string },
  ): void => {
    if (!powered) return;
    for (const s of state.structures) {
      if (s.kind !== kind) continue;
      const store = siteStores[s.siteKey] ?? {};
      const result = produce(s.siteKey, delta, store);
      siteStores = { ...siteStores, [s.siteKey]: result.store };
    }
  };

  // 水泵：抽淡水（靠海抽上来的要脱盐，产量打对折）。
  runChain('pump', (siteKey, hours, store) => {
    const site = state.sites.find((x) => x.key === siteKey);
    const planet = site ? system.planets[site.planetIndex - 1] : undefined;
    let factor = 1;
    if (site && planet && planet.surface.kind === 'terrestrial') {
      const surface = planet.surface as TerrestrialSurface;
      const coast = coastDistanceFor(surface, site.latDeg, site.lonDeg);
      if (coast > 0 && coast <= SEA_WATER_COAST_KM) factor = SEA_WATER_FACTOR;
    }
    const kg = PUMP_WATER_PER_HOUR * hours * factor;
    const next = addToSiteStore({ [siteKey]: store }, siteKey, 'water', kg)[siteKey] ?? store;
    return { store: next };
  });

  // 炭化炉：生物质 → 活性炭 + 灰。
  runChain('kiln', (_siteKey, hours, store) => {
    const usable = Math.min(KILN_BIOMASS_PER_HOUR * hours, store.biomass ?? 0);
    if (usable <= 0) return { store };
    const next = { ...store };
    next.biomass = round3((next.biomass ?? 0) - usable);
    if (next.biomass <= 0) delete next.biomass;
    next.charcoal = round3((next.charcoal ?? 0) + usable * KILN_CHARCOAL_PER_BIOMASS);
    next.ash = round3((next.ash ?? 0) + usable * KILN_ASH_PER_BIOMASS);
    return { store: next };
  });

  // 净化器：原水 + 活性炭 → 饮用水。
  runChain('purifier', (_siteKey, hours, store) => {
    const batches = Math.min(
      (PURIFIER_RAW_WATER_PER_HOUR * hours) / PURIFIER_RAW_WATER_PER_HOUR,
      (store.water ?? 0) / PURIFIER_RAW_WATER_PER_HOUR,
      (store.charcoal ?? 0) / PURIFIER_CHARCOAL_PER_HOUR,
    );
    if (batches <= 0) return { store };
    const next = { ...store };
    next.water = round3((next.water ?? 0) - batches * PURIFIER_RAW_WATER_PER_HOUR);
    next.charcoal = round3((next.charcoal ?? 0) - batches * PURIFIER_CHARCOAL_PER_HOUR);
    next.water_drink = round3((next.water_drink ?? 0) + batches * PURIFIER_DRINK_PER_HOUR);
    if (next.water <= 0) delete next.water;
    if (next.charcoal <= 0) delete next.charcoal;
    return { store: next };
  });

  // 封装器：氧气 + 钢瓶 → 氧气瓶；液氨 + 钢瓶 → 罐装液氨（钢瓶从背包出）。
  let cylinders = state.inventory.cylinder ?? 0;
  let bottlesMade = 0;
  let cansMade = 0;
  runChain('sealer', (_siteKey, hours, store) => {
    const next = { ...store };
    const oxygen = next.oxygen ?? 0;
    const byO2 = Math.floor(oxygen / O2_PER_BOTTLE);
    const byCyl = Math.floor(cylinders);
    const byTime = Math.floor((SEALER_OXYGEN_PER_HOUR * hours) / O2_PER_BOTTLE);
    const make = Math.max(0, Math.min(byO2, byCyl, byTime));
    if (make > 0) {
      next.oxygen = round3(oxygen - make * O2_PER_BOTTLE);
      if (next.oxygen <= 0) delete next.oxygen;
      next.o2_bottle = Math.round((next.o2_bottle ?? 0) + make);
      cylinders -= make;
      bottlesMade += make;
    }
    // 液氨也在这里封装：一个钢瓶一罐。
    const liquid = next.ammonia_liquid ?? 0;
    const cans = Math.max(0, Math.min(Math.floor(liquid), Math.floor(cylinders), Math.floor(2 * hours)));
    if (cans > 0) {
      next.ammonia_liquid = round3(liquid - cans);
      if (next.ammonia_liquid <= 0) delete next.ammonia_liquid;
      next.canned_ammonia = Math.round((next.canned_ammonia ?? 0) + cans);
      cylinders -= cans;
      cansMade += cans;
    }
    return make > 0 || cans > 0 ? { store: next } : { store };
  });
  let carried = state;
  if (bottlesMade > 0) {
    const nextInv: Record<string, number> = { ...state.inventory, cylinder: round3(cylinders) };
    if (nextInv.cylinder! <= 0) delete nextInv.cylinder;
    carried = { ...state, inventory: nextInv };
  }

  // 大气提取器：直接分氧。
  runChain('atmo_extractor', (siteKey, hours, store) => {
    const site = state.sites.find((x) => x.key === siteKey);
    if (!site) return { store };
    const reading = atmosphereReadingOf(system, site.planetIndex);
    if (reading.oxygenFraction < EXTRACTOR_MIN_O2_FRACTION) return { store };
    return { store: addToSiteStore({ [siteKey]: store }, siteKey, 'oxygen', EXTRACTOR_OXYGEN_PER_HOUR * hours)[siteKey] ?? store };
  });

  return finishLife(carried, siteStores, events, nowHours, system);
}

/** 站点所在格子的气温（℃）；拿不到就按 20℃ 算。 */
function siteTempAt(system: StarSystem, state: GameState, siteKey: string): number {
  const site = state.sites.find((s) => s.key === siteKey);
  if (!site) return 20;
  const planet = system.planets[site.planetIndex - 1];
  if (!planet || planet.surface.kind !== 'terrestrial') return 20;
  const climate = climateAt(planet.surface, site.latDeg, site.lonDeg, nowPlanetHours(state, state.epochRealMs), yearHomeHoursOf(state), planet.obliquityDeg);
  return climate.tempC;
}

/**
 * 腐败：只烂「超出保鲜容量」的那部分；冷库把容量放大、把速度减半。
 * 烂掉的部分有 30% 转成堆肥养分（磷/钾/微量，不补氮），回到那块地。
 */
function spoilFoods(
  system: StarSystem,
  state: GameState,
  siteStores: Record<string, Record<string, number>>,
  hours: number,
  events: GameEvent[],
): { stores: Record<string, Record<string, number>>; warehouses: Record<string, Record<string, number>> } {
  if (hours <= 0) return { stores: siteStores, warehouses: state.stores };
  const stores = { ...siteStores };
  const warehouses = { ...state.stores };
  let spoiledTotal = 0;
  for (const siteKey of Object.keys(stores)) {
    const tempC = siteTempAt(system, state, siteKey);
    const cold = coldStoresAt(state, siteKey);
    const inert = inertRoomsAt(state, siteKey);
    // 保鲜容量是站点级的：堆场和这个站点上的仓库共用一个额度。
    const cap = pantryCapacityAt(state, siteKey, tempC);
    const siteStructs = state.structures.filter((s) => s.siteKey === siteKey && s.kind === 'warehouse');
    const yard = { ...(stores[siteKey] ?? {}) };
    let over = Math.max(
      0,
      (yard.biomass ?? 0) +
        siteStructs.reduce((sum, w) => sum + (warehouses[w.id]?.biomass ?? 0), 0) -
        cap,
    );
    // 先烂堆场，再烂仓库——仓库只是货架，不比地窖更保鲜。
    const yardRate = rotFractionPerHour(tempC, cold, inert);
    const fresh = yard.biomass ?? 0;
    if (over > 0 && fresh > 0) {
      const spoiled = Math.min(over, fresh * yardRate * hours);
      if (spoiled > 1e-9) {
        yard.biomass = round3(fresh - spoiled);
        if (yard.biomass <= 0) delete yard.biomass;
        over -= spoiled;
        spoiledTotal += spoiled;
      }
    }
    const dried = yard.dry_food ?? 0;
    if (dried > 0) {
      const spoiled = Math.min(dried, dried * (1 / DRIED_ROT_HOURS) * hours);
      if (spoiled > 1e-9) {
        yard.dry_food = round3(dried - spoiled);
        if (yard.dry_food <= 0) delete yard.dry_food;
        spoiledTotal += spoiled;
      }
    }
    stores[siteKey] = yard;
    // 仓库里的东西烂得更快（没有地窖，只有铁皮）。
    for (const w of siteStructs) {
      const box = { ...(warehouses[w.id] ?? {}) };
      const boxRate = yardRate * WAREHOUSE_ROT_FACTOR;
      const boxFresh = box.biomass ?? 0;
      if (over > 0 && boxFresh > 0) {
        const spoiled = Math.min(over, boxFresh * boxRate * hours);
        if (spoiled > 1e-9) {
          box.biomass = round3(boxFresh - spoiled);
          if (box.biomass <= 0) delete box.biomass;
          over -= spoiled;
          spoiledTotal += spoiled;
        }
      }
      const boxDried = box.dry_food ?? 0;
      if (boxDried > 0) {
        const spoiled = Math.min(boxDried, boxDried * (1 / DRIED_ROT_HOURS) * WAREHOUSE_ROT_FACTOR * hours);
        if (spoiled > 1e-9) {
          box.dry_food = round3(boxDried - spoiled);
          if (box.dry_food <= 0) delete box.dry_food;
          spoiledTotal += spoiled;
        }
      }
      warehouses[w.id] = box;
    }
    // 冷库与惰性气体室本身也是容器：里面的东西按各自的系数慢慢坏。
    for (const s of state.structures.filter(
      (x) => x.siteKey === siteKey && (x.kind === 'cold_store' || x.kind === 'inert_room'),
    )) {
      const box = { ...(warehouses[s.id] ?? {}) };
      const capKg = s.kind === 'cold_store' ? COLD_STORE_CAPACITY_KG : INERT_ROOM_CAPACITY_KG;
      const factor = s.kind === 'cold_store' ? COLD_STORE_ROT_FACTOR : INERT_ROOM_ROT_FACTOR;
      const boxRate = (1 / rotHoursFor(tempC)) * factor;
      const boxFresh = box.biomass ?? 0;
      const boxOver = Math.max(0, boxFresh - capKg);
      if (boxOver > 0) {
        const spoiled = Math.min(boxOver, boxOver * boxRate * hours);
        if (spoiled > 1e-9) {
          box.biomass = round3(boxFresh - spoiled);
          if (box.biomass <= 0) delete box.biomass;
          spoiledTotal += spoiled;
        }
      }
      const boxDried = box.dry_food ?? 0;
      if (boxDried > 0) {
        const spoiled = Math.min(boxDried, boxDried * (1 / DRIED_ROT_HOURS) * factor * hours);
        if (spoiled > 1e-9) {
          box.dry_food = round3(boxDried - spoiled);
          if (box.dry_food <= 0) delete box.dry_food;
          spoiledTotal += spoiled;
        }
      }
      warehouses[s.id] = box;
    }
  }
  if (spoiledTotal > 0.001) {
    events.push({
      type: 'genesis.rot',
      text: `有 ${spoiledTotal.toFixed(1)} kg 食物变质了（超出保鲜容量的部分才会坏；仓库里比地窖烂得更快）。烂掉的一部分变成了堆肥养分。`,
    });
  }
  return { stores, warehouses };
}

/** 把新鲜食物烘干：1 kg → 0.6 kg 干粮，每 kg 要 500 kJ。干粮几乎不坏，但也没那么顶饱。 */
export function dryFood(state: GameState, siteKey: string, kg: number): { state: GameState; text: string } {
  if (state.transit) throw new Error('移动途中不能干活。');
  const kiln = state.structures.find((s) => s.kind === 'kiln' && s.siteKey === siteKey);
  if (!kiln) throw new Error('这个站点没有【炭化炉】——烘干要用它的余热。');
  const store = state.siteStores[siteKey] ?? {};
  const have = store.biomass ?? 0;
  const use = Math.min(kg, have);
  if (use <= 0) throw new Error('堆场里没有新鲜食物可烘。');
  const cost = use * DRY_KJ_PER_KG;
  const spent = spendEnergy(state, cost, '烘干');
  const nextStore = { ...store };
  nextStore.biomass = round3(have - use);
  if (nextStore.biomass <= 0) delete nextStore.biomass;
  nextStore.dry_food = round3((nextStore.dry_food ?? 0) + use * DRIED_FOOD_RATIO);
  return {
    state: { ...spent, siteStores: { ...spent.siteStores, [siteKey]: nextStore } },
    text: `烘好了：${use.toFixed(1)} kg 新鲜食物 → ${(use * DRIED_FOOD_RATIO).toFixed(1)} kg 干粮，花了 ${cost.toLocaleString('en-US')} kJ。`,
  };
}

/** 光合放氧的种类集合（避免在热循环里反复查数组）。 */
const OXYGEN_PRODUCER_IDS = new Set<SpeciesId>(['cyanobacteria', 'diatom', 'ice_alga']);

/** 站点离海多远（km）；用存档里的 wetness 反推，不重新跑 BFS。 */
function coastDistanceFor(surface: TerrestrialSurface, latDeg: number, lonDeg: number): number {
  const cell = sampleCell(surface, latDeg, lonDeg);
  return Math.round(Math.max(0, -Math.log(Math.max(0.02, cell.wetness)) * 216));
}

/** 生产链跑完：最后结算居所的吃穿用度。 */
function finishLife(
  state: GameState,
  siteStores: Record<string, Record<string, number>>,
  events: GameEvent[],
  nowHours: number,
  system: StarSystem,
): { state: GameState; events: GameEvent[] } {
  const hours = nowHours - (state.lastLifeHomeHours ?? nowHours);
  const spoiled = spoilFoods(system, state, siteStores, Math.max(0, hours), events);
  let next: GameState = {
    ...state,
    siteStores: spoiled.stores,
    stores: spoiled.warehouses,
    lastLifeHomeHours: nowHours,
  };
  // 睡着的人也要吃：从着陆舱里扣（只有清醒时的 20%）。没建居所时，这就是唯一的消耗。
  const dormantHours = Math.max(0, hours);
  const sleepersNow = sleepersOf(next);
  if (sleepersNow > 0 && dormantHours > 0) {
    const demand = lifeDemand(0, sleepersNow, dormantHours);
    const pod = { ...(next.stores[SHIP_POD_ID] ?? {}) };
    const before = podTightestFraction(pod);
    const eat = (key: string, want: number): number => {
      const got = Math.min(want, pod[key] ?? 0);
      pod[key] = round3((pod[key] ?? 0) - got);
      if ((pod[key] ?? 0) <= 0) delete pod[key];
      return got;
    };
    const gotFood = eat('biomass', demand.food);
    const gotWater = eat('water_drink', demand.water);
    const gotO2 = eat('oxygen', demand.oxygen);
    const after = podTightestFraction(pod);
    next = { ...next, stores: { ...next.stores, [SHIP_POD_ID]: pod } };
    const short =
      gotFood + 1e-6 < demand.food || gotWater + 1e-6 < demand.water || gotO2 + 1e-6 < demand.oxygen;
    if (short) {
      events.push({
        type: 'genesis.lowstock',
        text: `${formatTime(next.calendar, nowHours)} 着陆舱断供了：睡着的人每小时要口粮 ${round3(
          lifeDemand(0, sleepersNow, 1).food,
        )} kg、水 ${round3(lifeDemand(0, sleepersNow, 1).water)} L、氧气 ${round3(
          lifeDemand(0, sleepersNow, 1).oxygen,
        )} kg，舱里已经给不齐。他们不会死，但一醒来就会饿回去——去种、去抽水、去产氧。`,
      });
    } else if (before >= POD_ALERT_FRACTION && after < POD_ALERT_FRACTION) {
      events.push({
        type: 'genesis.lowstock',
        text: `${formatTime(next.calendar, nowHours)} 着陆舱的补给只剩三成了：粮 ${round3(
          pod.biomass ?? 0,
        )} kg、水 ${round3(pod.water_drink ?? 0)} L、氧 ${round3(pod.oxygen ?? 0)} kg，${sleepersNow} 个人睡着大约还能撑 ${Math.max(
          0,
          Math.floor(shipSupplyStatus(next).hoursLeft ?? 0),
        )} 母星时。`,
      });
    }
  }
  const habitats = next.structures.filter((s) => s.kind === 'habitat');
  if (habitats.length === 0) return { state: next, events };
  const elapsed = Math.max(0, hours);
  const structures = [...next.structures];
  let changed = false;
  let sleepers = sleepersOf(next);
  let birthHours = next.birthHours ?? 0;
  let starved = false;
  for (let n = 0; n < structures.length; n += 1) {
    const habitat = structures[n]!;
    if (habitat.kind !== 'habitat') continue;
    const awake = habitat.awake ?? 0;
    if (awake <= 0) continue;
    const demand = lifeDemand(awake, 0, elapsed);
    const store = { ...(next.stores[habitat.id] ?? {}) };
    const siteStore = { ...(next.siteStores[habitat.siteKey] ?? {}) };
    /** 先吃内仓，再吃站点堆场。 */
    const pull = (resource: string, want: number): number => {
      let got = Math.min(want, store[resource] ?? 0);
      store[resource] = round3((store[resource] ?? 0) - got);
      if ((store[resource] ?? 0) <= 0) delete store[resource];
      const remain = want - got;
      if (remain > 1e-9) {
        const fromSite = Math.min(remain, siteStore[resource] ?? 0);
        siteStore[resource] = round3((siteStore[resource] ?? 0) - fromSite);
        if ((siteStore[resource] ?? 0) <= 0) delete siteStore[resource];
        got += fromSite;
      }
      return got;
    };
    const gotFood = pull('biomass', demand.food);
    const gotWater = pull('water_drink', demand.water);
    const gotO2 = pull('oxygen', demand.oxygen);
    const enough = gotFood >= demand.food - 1e-6 && gotWater >= demand.water - 1e-6 && gotO2 >= demand.oxygen - 1e-6;
    if (!enough && awake > 0) {
      structures[n] = { ...habitat, awake: 0 };
      sleepers += awake;
      starved = true;
      changed = true;
      events.push({
        type: 'genesis.lifeline',
        text: `${formatTime(next.calendar, nowHours)} 补给不够了——${awake} 个人回到休眠舱里去了。他们不会死，但也不会在你准备好之前醒着。`,
      });
    }
    next = {
      ...next,
      stores: { ...next.stores, [habitat.id]: store },
      siteStores: { ...next.siteStores, [habitat.siteKey]: siteStore },
    };
  }
  if (changed) next = { ...next, structures };
  // 人口自然增长：连续 192 个母星时没断供，就添一个人；断供清零。封顶是「居所数 × 20」。
  const housed = structures.filter((s) => s.kind === 'habitat');
  const capacity = housed.length * PEOPLE_PER_HABITAT;
  let population = structures.filter((s) => s.kind === 'habitat').reduce((n, s) => n + (s.awake ?? 0), 0);
  if (starved) {
    birthHours = 0;
  } else if (housed.length > 0 && elapsed > 0) {
    birthHours += elapsed;
    while (birthHours >= BIRTH_HEALTHY_HOME_HOURS && population < capacity) {
      birthHours -= BIRTH_HEALTHY_HOME_HOURS;
      population += 1;
      // 添进「住得最少的」那座居所，满员的跳过。
      let target = -1;
      let fewest = PEOPLE_PER_HABITAT;
      for (let n = 0; n < structures.length; n += 1) {
        const s = structures[n]!;
        if (s.kind !== 'habitat') continue;
        const residents = s.awake ?? 0;
        if (residents < fewest) {
          fewest = residents;
          target = n;
        }
      }
      if (target < 0) break;
      const home = structures[target]!;
      structures[target] = { ...home, awake: fewest + 1 };
      events.push({
        type: 'genesis.born',
        text: `${formatTime(next.calendar, nowHours)} 居所里添了一个孩子——现在常住了 ${population} 个人。`,
      });
    }
  }
  next = { ...next, structures, sleepers, birthHours };
  return { state: next, events };
}

/**
 * 人手：人会自动采收成熟的作物、再从容器里的种子袋补种。
 * 只在他们住的那颗行星上干活；每 20 个常住人口算一个「人手」。
 * 这是「高级机械臂」——机械臂只会搬，不会收也不会种。
 */
/**
 * 人手：只有「值班终端」底下的人才干活。
 *
 * 一座终端绑一座居所 + 一个仓库 + 最多 6 个站点（都在 5 km 内）。居所里每 5 个人算一份人手，
 * 均摊到站点上：收成熟作物（这份人手照看的站点多收 8%／份，单站封顶 40%）、从值班仓库取种子补种、
 * 取生物质补最缺的养分（氮除外——氮只能靠蓝藻固氮）。收成直接进值班仓库，不再散落在站点堆场。
 * 没有值班终端，人只吃饭不干活。
 */
export function advanceLabor(system: StarSystem, state: GameState, nowMs: number): { state: GameState; events: GameEvent[] } {
  const nowHours = nowPlanetHours(state, nowMs);
  const last = state.lastLaborHomeHours ?? nowHours;
  const delta = Math.min(24, nowHours - last);
  if (!(delta > 0)) return { state, events: [] };
  let next: GameState = { ...state, lastLaborHomeHours: nowHours };
  const duties = next.structures.filter((s) => s.kind === 'duty' && structurePowered(next, s));
  if (duties.length === 0) return { state: next, events: [] };

  const plants: Record<string, PlantRecord[]> = { ...next.plants };
  let stores: Record<string, Record<string, number>> = { ...next.stores };
  const events: GameEvent[] = [];

  for (const duty of duties) {
    const habitat = next.structures.find((s) => s.id === duty.habitat);
    if (!habitat || (habitat.awake ?? 0) <= 0) continue;
    const hands = Math.floor((habitat.awake ?? 0) / RESIDENTS_PER_LABOR);
    if (hands <= 0) continue;
    const store = duty.store ? next.structures.find((s) => s.id === duty.store) : undefined;
    if (!store) continue;
    const siteKeys = (duty.sites ?? []).filter((key) => next.sites.some((s) => s.key === key));
    if (siteKeys.length === 0) continue;

    // 人手均摊到站点：每站分到几份，就按几份算产量加成与活量。
    const perSite = new Map<string, number>();
    for (let k = 0; k < hands; k += 1) {
      const key = siteKeys[k % siteKeys.length]!;
      perSite.set(key, (perSite.get(key) ?? 0) + 1);
    }

    let harvested = 0;
    let sown = 0;
    let fertilizedKg = 0;
    let bonusKg = 0;
    let free = Math.max(0, storeCapacityKg(store) - containerUsedKg(next, store));

    for (const [siteKey, units] of perSite) {
      const site = next.sites.find((s) => s.key === siteKey);
      if (!site) continue;
      const planet = system.planets[site.planetIndex - 1];
      if (!planet || planet.surface.kind !== 'terrestrial') continue;
      const climate = climateAt(planet.surface, site.latDeg, site.lonDeg, nowHours, yearHomeHoursOf(next), planet.obliquityDeg);
      const bonus = 1 + Math.min(LABOR_YIELD_BONUS_MAX, LABOR_YIELD_BONUS * units);

      // 1) 施肥：从值班仓库拿生物质，补「最缺」的那一维（氮除外）。
      const fertBudget = units * LABOR_PER_HOUR.fertilizeKg * delta;
      const biomassHave = Math.max(0, stores[store.id]?.biomass ?? 0);
      const take = Math.min(fertBudget, biomassHave);
      if (take > 0.01) {
        const cap = nutrientCapOf(system, site);
        const traceCap = cap * traceCapOf(system, next, site);
        const room = [
          { dim: 'p' as const, left: Math.max(0, cap - site.nutrients.p) },
          { dim: 'k' as const, left: Math.max(0, cap - site.nutrients.k) },
          { dim: 'trace' as const, left: Math.max(0, traceCap - site.nutrients.trace) },
        ].sort((a, b) => b.left - a.left);
        const pick = room.find((r) => r.left > 0);
        if (pick) {
          const add = Math.min(pick.left, take * FERTILIZER_PER_KG);
          next = {
            ...next,
            sites: next.sites.map((s) =>
              s.key === siteKey ? { ...s, nutrients: addNutrients(s.nutrients, { [pick.dim]: add }, cap, traceCap) } : s,
            ),
          };
          const stock = { ...(stores[store.id] ?? {}) };
          const leftKg = Math.max(0, (stock.biomass ?? 0) - take);
          if (leftKg > 0) stock.biomass = round3(leftKg);
          else delete stock.biomass;
          stores = { ...stores, [store.id]: stock };
          fertilizedKg += take;
        }
      }

      // 2) 采收：这里成熟的，直接进值班仓库。
      const list = plants[siteKey] ?? [];
      const ready = list
        .filter((p) => p.health > 0)
        .map((p) => {
          const spec = SPECIES[p.species];
          const weight = p.kind === 'colony' ? p.biomassKg / Math.max(0.01, spec.yieldKg) : 1 + p.progress;
          const isReady = p.kind === 'colony' ? p.biomassKg >= spec.yieldKg * 0.5 : p.stage === 'ripe';
          return { plant: p, weight, isReady };
        })
        .filter((e) => e.isReady)
        .sort((a, b) => b.weight - a.weight);
      let budget = units * LABOR_PER_HOUR.harvest * delta;
      const kept = [...list];
      for (const entry of ready) {
        if (budget <= 0) break;
        const result = harvestPlant(entry.plant, climate.fertility);
        const kg = round3(result.resourceKg * bonus);
        if (kg <= 0) continue;
        if (free < kg) break; // 仓库满了：东西放不下，今天剩下的先不收。
        const stock = { ...(stores[store.id] ?? {}) };
        stock[result.resource] = round3((stock[result.resource] ?? 0) + kg);
        stores[store.id] = stock;
        free -= kg;
        const idx = kept.findIndex((p) => p.id === entry.plant.id);
        if (idx >= 0) kept.splice(idx, 1);
        if (result.plant) kept.push(result.plant);
        harvested += 1;
        bonusKg += kg - result.resourceKg;
        budget -= 1;
      }
      plants[siteKey] = kept;

      // 3) 补种：种子也从值班仓库拿。
      let sowBudget = units * LABOR_PER_HOUR.sow * delta;
      for (const bag of next.seedBags.filter((b) => b.at === store.id && b.count > 0)) {
        if (sowBudget <= 0) break;
        const spec = SPECIES[bag.species];
        const current = plants[siteKey] ?? [];
        if (current.length >= SITE_CAPACITY) break;
        if (spec.medium === 'water' && site.kind !== 'water') continue;
        if (spec.medium === 'land' && site.kind !== 'land') continue;
        if (climate.tempC < spec.tempMinC || climate.tempC > spec.tempMaxC) continue;
        const count = Object.values(plants).reduce((n, l) => n + l.filter((p) => p.species === bag.species).length, 0);
        plants[siteKey] = [...current, newPlant(seedId(bag.species, count + 1), bag.species, bag.genes, nowHours)];
        const idx = next.seedBags.findIndex((b) => b.id === bag.id);
        if (idx >= 0) {
          const left = (next.seedBags[idx]!.count ?? 1) - 1;
          const bagsNext = [...next.seedBags];
          if (left > 0) bagsNext[idx] = { ...bagsNext[idx]!, count: left };
          else bagsNext.splice(idx, 1);
          next = { ...next, seedBags: bagsNext };
        }
        sown += 1;
        sowBudget -= 1;
      }
    }

    if (harvested === 0 && sown === 0 && fertilizedKg === 0) continue;
    const parts: string[] = [];
    if (harvested > 0) parts.push(`收了 ${harvested} 批${bonusKg > 0.05 ? `（多收约 ${bonusKg.toFixed(1)} kg）` : ''}`);
    if (sown > 0) parts.push(`补种 ${sown} 株`);
    if (fertilizedKg > 0) parts.push(`施肥 ${fertilizedKg.toFixed(0)} kg`);
    events.push({
      type: 'genesis.labor',
      text: `${formatTime(next.calendar, nowHours)} 值班终端（${duty.siteKey}）的人手（${hands} 份）：${parts.join('、')}。`,
    });
  }

  next = { ...next, plants, stores };
  return { state: next, events };
}

/** 居所里人觉得舒服的室内温度区间（℃）：低于 5 或高于 32，他们就不肯搬进来长住。 */
export const HABITAT_COMFORT_C = { min: 5, max: 32 } as const;
/** 通电的居所最多把室内温度往 18℃ 拉这么多度——再冷再热，它也扛不住。 */
export const HABITAT_CLIMATE_PULL_C = 12;

/**
 * 居所室内温度：没通电就是外面多少度里面多少度，通电后向 18℃ 拉，最多拉 12℃。
 * 不是岩石行星的地表（气态冰巨星的等气压面）按 18℃ 算，不拿天气为难人。
 */
export function habitatInteriorC(
  system: StarSystem,
  state: GameState,
  habitat: StructureRecord,
  nowMs: number,
): number {
  const site = state.sites.find((s) => s.key === habitat.siteKey);
  const planet = site ? system.planets[site.planetIndex] : undefined;
  if (!site || !planet || planet.surface.kind !== 'terrestrial') return 18;
  const ambient = climateAt(
    planet.surface,
    site.latDeg,
    site.lonDeg,
    nowPlanetHours(state, nowMs),
    yearHomeHoursOf(state),
    planet.obliquityDeg,
  ).tempC;
  if (!structurePowered(state, habitat)) return ambient;
  const pull = Math.max(-HABITAT_CLIMATE_PULL_C, Math.min(HABITAT_CLIMATE_PULL_C, 18 - ambient));
  return round2(ambient + pull);
}

/** 居所温度不合人意的说法；住得下就返回 null。 */
export function habitatComfortIssue(
  system: StarSystem,
  state: GameState,
  habitat: StructureRecord,
  nowMs?: number,
): string | null {
  const interior = habitatInteriorC(system, state, habitat, nowMs ?? state.epochRealMs);
  if (interior >= HABITAT_COMFORT_C.min && interior <= HABITAT_COMFORT_C.max) return null;
  const hot = interior > HABITAT_COMFORT_C.max;
  return (
    `居所里现在 ${Math.round(interior)}℃——人不会在这种温度下醒过来长住（他们只接受 ${HABITAT_COMFORT_C.min}–${HABITAT_COMFORT_C.max}℃ 的室内）。` +
    (hot
      ? '往高纬或高处挪一座，或者先用群系改变器把这一带改凉。'
      : '往低纬或低处挪一座，或者先用群系改变器把这一带改暖。')
  );
}

/** 叫醒居所里的人类（协议全完成之后）。 */
export function wakeHumans(
  system: StarSystem,
  state: GameState,
  structureId?: string,
  nowMs?: number,
): { state: GameState; text: string; awakened: boolean } {
  const carrier = structureId ? state.structures.find((s) => s.kind === 'carrier' && s.id === structureId) : undefined;
  const habitat = carrier ? undefined : state.structures.find((s) => s.kind === 'habitat' && (!structureId || s.id === structureId));
  if (!habitat && !carrier) throw new Error('还没有居所——先建一座，再接人过来。');
  if (carrier && (carrier.crew ?? 0) > 0) throw new Error('这艘空天母舰上已经有人了。');
  if (habitat && (habitat.awake ?? 0) > 0) throw new Error('这里已经有人醒着了。');
  // 门槛只算前 11 条：第 12 条「叫醒第一批人类」是这件事的结果，拿它当条件就死锁了。
  const ready = protocolStatus(state).filter((t) => t.id !== 'wake' && t.done).length;
  const needed = PROTOCOL_TASKS.length - 1;
  if (ready < needed) {
    throw new Error(`协议还有 ${needed - ready} 项没完成——先照清单把生活底线搭起来，再叫醒他们。`);
  }
  const comfort = habitat ? habitatComfortIssue(system, state, habitat, nowMs) : null;
  if (comfort) throw new Error(comfort);
  const sleepers = sleepersOf(state);
  if (sleepers <= 0) {
    throw new Error('休眠舱里已经没人了——这一船的人全醒了，之后只能靠他们自己生养。');
  }
  const taking = Math.min(carrier ? CARRIER_CREW_CAP : PEOPLE_PER_HABITAT, sleepers);
  const structures = state.structures.map((s) => {
    if (carrier && s.id === carrier.id) return { ...s, crew: taking };
    if (habitat && s.id === habitat.id) return { ...s, awake: taking };
    return s;
  });
  return {
    state: { ...state, structures, awakened: true, sleepers: sleepers - taking, birthHours: state.birthHours ?? 0 },
    text: carrier
      ? `${taking} 个人爬进了空天母舰的乘员舱。他们隔着舷窗往下看：云层像海，风在船身外面刮得整艘船轻轻发抖。` +
        (sleepers - taking > 0 ? `休眠舱里还剩 ${sleepers - taking} 个人。` : '这一船的人，现在全醒了。')
      : `${taking} 个人从休眠舱里坐了起来。他们先是很久没说话，然后问你：这是哪。` +
        (sleepers - taking > 0 ? `休眠舱里还剩 ${sleepers - taking} 个人。` : '这一船的人，现在全醒了。'),
    awakened: true,
  };
}

/**
 * 群系改变器：通电时把半径内的格子一格格推向温和气候，断电时慢慢退回去。
 * 功率按「正在改造的格子数」算：每格每母星时 1,250 kJ，钱不够就按比例慢下来。
 */
export function advanceTerra(system: StarSystem, state: GameState, nowMs: number): { state: GameState; events: GameEvent[] } {
  const nowHours = nowPlanetHours(state, nowMs);
  const last = state.lastTerraHomeHours ?? nowHours;
  const delta = nowHours - last;
  if (!(delta > 0)) return { state, events: [] };
  const events: GameEvent[] = [];
  const terra: TerraMap = { ...(state.terra ?? {}) };
  const changers = state.structures.filter((s) => s.kind === 'biome_changer' && structurePowered(state, s));
  let energy = state.energyKj;

  if (changers.length > 0) {
    let spent = 0;
    for (const changer of changers) {
      const site = state.sites.find((s) => s.key === changer.siteKey);
      const planet = system.planets[site ? site.planetIndex - 1 : -1];
      if (!site || !planet || planet.surface.kind !== 'terrestrial') continue;
      const surface = planet.surface as TerrestrialSurface;
      const cells = cellsInRadius(surface, site.latDeg, site.lonDeg);
      const active = cells
        .filter((cell) => isLand(surface, cell.i, cell.j))
        .map((cell) => ({ cell, p: terraProgress(terra, site.planetIndex, cell.i, cell.j) }))
        .filter((entry) => entry.p < 1);
      if (active.length === 0) continue;
      const need = active.length * TERRA_CELL_KJ_PER_HOUR * delta;
      const frac = need > 0 ? Math.min(1, Math.max(0, energy) / need) : 1;
      spent += need * frac;
      for (const entry of active) {
        const key = terraKey(site.planetIndex, entry.cell.i, entry.cell.j);
        const before = entry.p;
        const after = Math.min(1, before + (delta * frac) / TERRA_CONVERT_HOME_HOURS);
        terra[key] = { i: entry.cell.i, j: entry.cell.j, p: after };
        if (before < 1 && after >= 1) {
          events.push({
            type: 'genesis.terraformed',
            text: `${siteKeyOf(site.planetIndex, site.latDeg, site.lonDeg)} 附近的一格改造完成（${site.latDeg.toFixed(0)}°, ${site.lonDeg.toFixed(0)}° 一带）。`,
          });
        }
      }
    }
    energy = Math.max(0, energy - spent);
  }

  // 没有通电的改变器：已经改过的格子慢慢退回原样。
  if (changers.length === 0) {
    for (const [key, cell] of Object.entries(terra)) {
      const next = Math.max(0, cell.p - delta / TERRA_REVERT_HOME_HOURS);
      if (next <= 0) {
        delete terra[key];
        events.push({ type: 'genesis.terra_lost', text: `一格改造过的土地退回了原样（${cell.i}, ${cell.j}）。` });
      } else {
        terra[key] = { ...cell, p: next };
      }
    }
  }

  return { state: { ...state, terra, energyKj: energy, lastTerraHomeHours: nowHours }, events };
}


export interface GameFile {
  schema: 6;
  game: GameState;
}

export function serializeGame(state: GameState): GameFile {
  return { schema: 6, game: state };
}

/**
 * 读回 game.json。结构不对就直接报错——宁可让 Agent 看到「存档坏了」，
 * 也不要带着半个状态跑。行星序号越界也在这里拦。
 */
export function deserializeGame(system: StarSystem, raw: unknown): GameState {
  const file = raw as Partial<GameFile> | null | undefined;
  if (!file || typeof file !== 'object') throw new Error('game.json 不是对象。');
  if (file.schema !== 6) {
    throw new Error(`game.json 的 schema 是 ${String(file.schema)}，当前只认识 6（schema 1–5 的旧存档需要 genesis_reset 重开）。`);
  }
  const g = file.game as Partial<GameState> | undefined;
  if (!g || typeof g !== 'object') throw new Error('game.json 缺 game 字段。');
  const cal = g.calendar;
  if (!cal || typeof cal.rotationHours !== 'number' || typeof cal.orbitDays !== 'number'
    || typeof cal.realHoursPerPlanetHour !== 'number' || typeof cal.planetDaysPerYear !== 'number'
    || typeof cal.homePlanetName !== 'string') {
    throw new Error('game.json 的历法字段不完整。');
  }
  if (!Number.isInteger(g.homePlanetIndex) || g.homePlanetIndex! < 1 || g.homePlanetIndex! > system.planets.length) {
    throw new Error(`game.json 的母星序号 ${String(g.homePlanetIndex)} 越界（一共 ${system.planets.length} 颗行星）。`);
  }
  if (typeof g.epochRealMs !== 'number' || !Number.isFinite(g.epochRealMs)) throw new Error('game.json 的创世时刻不合法。');
  if (typeof g.msPerPlanetHour !== 'number' || !(g.msPerPlanetHour! > 0)) throw new Error('game.json 的星球时长度不合法。');
  if (!g.names || typeof g.names.star !== 'string' || typeof g.names.bodies !== 'object') {
    throw new Error('game.json 的名字表不完整。');
  }
  if (!Array.isArray(g.visited)) throw new Error('game.json 的 visited 不是数组。');
  if (g.charts != null && !Array.isArray(g.charts)) throw new Error('game.json 的星图不是数组。');
  if (g.location != null && (typeof g.location.planetIndex !== 'number'
    || g.location.planetIndex < 1 || g.location.planetIndex > system.planets.length)) {
    throw new Error('game.json 的所在位置越界。');
  }
  if (g.transit != null && (typeof g.transit.arriveRealMs !== 'number' || typeof g.transit.departRealMs !== 'number')) {
    throw new Error('game.json 的在途记录不完整。');
  }
  if (typeof g.energyKj !== 'number' || !Number.isFinite(g.energyKj) || g.energyKj < 0) {
    throw new Error('game.json 的能量字段不合法。');
  }
  if (!Array.isArray(g.sails)) throw new Error('game.json 的太阳能帆不是数组。');
  for (const sail of g.sails) {
    if (!sail || typeof sail.bodyKey !== 'string' || typeof sail.deployedHomeHours !== 'number') {
      throw new Error('game.json 的太阳能帆记录不完整。');
    }
    for (const field of ['latDeg', 'lonDeg'] as const) {
      const value = (sail as unknown as Record<string, unknown>)[field];
      if (value !== undefined && (typeof value !== 'number' || !Number.isFinite(value))) {
        throw new Error(`game.json 的太阳能帆经纬度不合法：${field}。`);
      }
    }
  }
  if (!Array.isArray(g.monitors)) throw new Error('game.json 的监测器列表不是数组。');
  if (!Array.isArray(g.counters)) throw new Error('game.json 的计数器列表不是数组。');
  if (typeof g.startLonDeg !== 'number' || !Number.isFinite(g.startLonDeg)) {
    throw new Error('game.json 缺开局经度，无法重建昼夜。');
  }
  if (typeof g.lastSettledHomeHours !== 'number' || !Number.isFinite(g.lastSettledHomeHours)) {
    throw new Error('game.json 的结算时刻不合法。');
  }
  if (typeof g.lastGeneratorRealMs !== 'number' || !Number.isFinite(g.lastGeneratorRealMs)) {
    throw new Error('game.json 的发电机时刻不合法。');
  }
  if (typeof g.activeMs !== 'number' || !Number.isFinite(g.activeMs) || g.activeMs < 0) {
    throw new Error('game.json 的运行时长不合法。');
  }
  if (typeof g.credits !== 'number' || !Number.isFinite(g.credits) || g.credits < 0) {
    throw new Error('game.json 的信用点不合法。');
  }
  if (typeof g.inventory !== 'object' || g.inventory === null || Array.isArray(g.inventory)) {
    throw new Error('game.json 的仓库不是对象。');
  }
  if (!Array.isArray(g.sites)) throw new Error('game.json 的站点不是数组。');
  for (const site of g.sites) {
    if (!site || typeof site.key !== 'string' || typeof site.latDeg !== 'number' || typeof site.lonDeg !== 'number') {
      throw new Error('game.json 的站点记录不完整。');
    }
    const n = (site as unknown as { nutrients?: Record<string, unknown> }).nutrients;
    if (!n || typeof n !== 'object'
      || typeof n.n !== 'number' || typeof n.p !== 'number' || typeof n.k !== 'number' || typeof n.trace !== 'number') {
      throw new Error(`game.json 的站点 ${site.key} 缺四维养分（氮/磷/钾/微量）。`);
    }
  }
  if (typeof g.plants !== 'object' || g.plants === null || Array.isArray(g.plants)) {
    throw new Error('game.json 的作物表不是对象。');
  }
  if (!Array.isArray(g.structures)) throw new Error('game.json 的建筑不是数组。');
  for (const structure of g.structures) {
    if (!structure || !(String(structure.kind) in BUILD_SPECS)) {
      throw new Error('game.json 里有不认识的建筑类型。');
    }
    const extra = structure as unknown as { slot?: unknown; routes?: unknown; feeds?: unknown };
    if (extra.slot !== undefined && (!Number.isInteger(extra.slot) || (extra.slot as number) < 0)) {
      throw new Error(`game.json 的建筑 ${String((structure as { id?: unknown }).id)} 的槽位不合法。`);
    }
    if (extra.routes !== undefined) {
      if (!Array.isArray(extra.routes) || extra.routes.some((v) => !Number.isInteger(v) || v < -1 || v > 9)) {
        throw new Error(`game.json 的建筑 ${String((structure as { id?: unknown }).id)} 的编排表不合法（每项应是 -1…9 的整数）。`);
      }
    }
    if (extra.feeds !== undefined && typeof extra.feeds !== 'string') {
      throw new Error(`game.json 的建筑 ${String((structure as { id?: unknown }).id)} 的 feeds 字段不合法。`);
    }
    const armish = structure as unknown as { inputs?: unknown; output?: unknown; items?: unknown };
    if (armish.inputs !== undefined) {
      if (!Array.isArray(armish.inputs) || armish.inputs.some((v) => typeof v !== 'string' || !v)) {
        throw new Error(`game.json 的机械臂 ${String((structure as { id?: unknown }).id)} 的输入容器表不合法。`);
      }
    }
    if (armish.output !== undefined && typeof armish.output !== 'string') {
      throw new Error(`game.json 的机械臂 ${String((structure as { id?: unknown }).id)} 的输出容器不合法。`);
    }
    if (armish.items !== undefined) {
      if (!Array.isArray(armish.items) || armish.items.some((v) => typeof v !== 'string' || !v)) {
        throw new Error(`game.json 的机械臂 ${String((structure as { id?: unknown }).id)} 的白名单不合法。`);
      }
    }
    const dutyish = structure as unknown as { habitat?: unknown; store?: unknown; sites?: unknown };
    if (dutyish.habitat !== undefined && typeof dutyish.habitat !== 'string') {
      throw new Error(`game.json 的值班终端 ${String((structure as { id?: unknown }).id)} 的居所不合法。`);
    }
    if (dutyish.store !== undefined && typeof dutyish.store !== 'string') {
      throw new Error(`game.json 的值班终端 ${String((structure as { id?: unknown }).id)} 的仓库不合法。`);
    }
    if (dutyish.sites !== undefined) {
      if (!Array.isArray(dutyish.sites) || dutyish.sites.some((v) => typeof v !== 'string' || !v)) {
        throw new Error(`game.json 的值班终端 ${String((structure as { id?: unknown }).id)} 的站点表不合法。`);
      }
    }
    const industrial = structure as unknown as {
      crew?: unknown; altitude?: unknown; extractGas?: unknown; recipes?: unknown; ashKg?: unknown;
    };
    const label = String((structure as { id?: unknown }).id);
    if (industrial.crew !== undefined && (!Number.isInteger(industrial.crew) || (industrial.crew as number) < 0)) {
      throw new Error(`game.json 的空天母舰 ${label} 的乘员数不合法。`);
    }
    if (industrial.altitude !== undefined && !Number.isFinite(industrial.altitude)) {
      throw new Error(`game.json 的空天母舰 ${label} 的高度不合法。`);
    }
    if (industrial.extractGas !== undefined && typeof industrial.extractGas !== 'string') {
      throw new Error(`game.json 的提取器 ${label} 的抽气种类不合法。`);
    }
    if (industrial.recipes !== undefined) {
      if (!Array.isArray(industrial.recipes) || industrial.recipes.some((v) => typeof v !== 'string')) {
        throw new Error(`game.json 的转换机 ${label} 的配方表不合法。`);
      }
    }
    if (industrial.ashKg !== undefined && !Number.isFinite(industrial.ashKg)) {
      throw new Error(`game.json 的火电站 ${label} 的灰仓读数不合法。`);
    }
  }
  if (!Array.isArray(g.builds)) throw new Error('game.json 的在建工程不是数组。');
  for (const b of g.builds) {
    if (!b || typeof b.kind !== 'string' || typeof b.siteKey !== 'string'
      || typeof b.startedHomeHours !== 'number' || typeof b.completeHomeHours !== 'number'
      || !Number.isFinite(b.startedHomeHours) || !Number.isFinite(b.completeHomeHours)
      || b.completeHomeHours < b.startedHomeHours) {
      throw new Error('game.json 里有不完整的在建工程。');
    }
  }
  if (typeof g.stores !== 'object' || g.stores === null || Array.isArray(g.stores)) {
    throw new Error('game.json 的库房不是对象。');
  }
  for (const value of Object.values(g.stores)) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new Error('game.json 的库房内容不合法。');
    }
    for (const kg of Object.values(value as Record<string, unknown>)) {
      if (typeof kg !== 'number' || !Number.isFinite(kg) || kg < 0) {
        throw new Error('game.json 的库房重量不合法。');
      }
    }
  }
  if (!Array.isArray(g.seedBags)) throw new Error('game.json 的种子袋不是数组。');
  if (typeof g.seedsPurchased !== 'number' || !Number.isInteger(g.seedsPurchased) || g.seedsPurchased < 0) {
    throw new Error('game.json 的种子购买数不合法。');
  }
  if (!g.daily || typeof g.daily !== 'object' || typeof g.daily.day !== 'number'
    || typeof g.daily.sold !== 'object' || typeof g.daily.bought !== 'object') {
    throw new Error('game.json 的当日限购记录不完整。');
  }
  if (typeof g.surveyed !== 'object' || g.surveyed === null || Array.isArray(g.surveyed)) {
    throw new Error('game.json 的采样记录不是对象。');
  }
  if (typeof g.lastFloraHomeHours !== 'number' || !Number.isFinite(g.lastFloraHomeHours)) {
    throw new Error('game.json 的作物结算时刻不合法。');
  }
  if (!g.upgrades || typeof g.upgrades !== 'object'
    || (g.upgrades.mobilityCore !== 'broken' && g.upgrades.mobilityCore !== 'ready')) {
    throw new Error('game.json 的升级记录不完整（缺机动核心状态）。');
  }
  // 望远镜 / 火花塞是后加的字段：旧档没有就当 0（还没修），不用重置存档。
  const telescope = (g.upgrades as { telescope?: unknown }).telescope ?? 0;
  if (typeof telescope !== 'number' || !Number.isInteger(telescope) || telescope < 0 || telescope > TELESCOPE_MAX_LEVEL) {
    throw new Error('game.json 的射电望远镜等级不合法。');
  }
  const sparkPlug = (g.upgrades as { sparkPlug?: unknown }).sparkPlug ?? 0;
  if (typeof sparkPlug !== 'number' || !Number.isInteger(sparkPlug) || sparkPlug < 0 || sparkPlug > SPARK_PLUG_MAX_LEVEL) {
    throw new Error('game.json 的火花塞等级不合法。');
  }
  const battery = (g.upgrades as { battery?: unknown }).battery ?? 0;
  if (typeof battery !== 'number' || !Number.isInteger(battery) || battery < 0 || battery > BATTERY_MAX_LEVEL) {
    throw new Error('game.json 的蓄电池等级不合法。');
  }
  const subagent = (g.upgrades as { subagent?: unknown }).subagent ?? 0;
  if (typeof subagent !== 'number' || !Number.isInteger(subagent) || subagent < 0 || subagent > SUBAGENT_MAX_LEVEL) {
    throw new Error('game.json 的子代理等级不合法。');
  }
  // 群系改造是后加的字段：旧档没有就当空地图；有的话逐格校验进度。
  const rawTerra = (g as { terra?: unknown }).terra ?? {};
  if (typeof rawTerra !== 'object' || rawTerra === null || Array.isArray(rawTerra)) {
    throw new Error('game.json 的群系改造记录不是对象。');
  }
  const terra: TerraMap = {};
  for (const [key, cell] of Object.entries(rawTerra as Record<string, unknown>)) {
    const entry = cell as { i?: unknown; j?: unknown; p?: unknown };
    if (typeof entry?.i !== 'number' || typeof entry?.j !== 'number' || typeof entry?.p !== 'number'
      || !Number.isFinite(entry.p) || entry.p < 0 || entry.p > 1) {
      throw new Error(`game.json 的群系改造记录不合法：${key}。`);
    }
    // 1.2.2 之前的键没有行星前缀：它们只可能是在母星上改造的，迁到母星名下。
    const target = /^p\d+:/.test(key) ? key : terraKey(Math.max(1, Number((g as { homePlanetIndex?: unknown }).homePlanetIndex) || 1), entry.i, entry.j);
    terra[target] = { i: entry.i, j: entry.j, p: entry.p };
  }
  const lastTerraHomeHours = (g as { lastTerraHomeHours?: unknown }).lastTerraHomeHours ?? 0;
  if (typeof lastTerraHomeHours !== 'number' || !Number.isFinite(lastTerraHomeHours)) {
    throw new Error('game.json 的改造结算时刻不合法。');
  }
  // 生命维持是后加的：旧档没有就补空。
  const rawSiteStores = (g as { siteStores?: unknown }).siteStores ?? {};
  if (typeof rawSiteStores !== 'object' || rawSiteStores === null || Array.isArray(rawSiteStores)) {
    throw new Error('game.json 的站点堆场不是对象。');
  }
  const siteStores = rawSiteStores as Record<string, Record<string, number>>;
  const samples = (g as { samples?: unknown }).samples ?? 0;
  if (typeof samples !== 'number' || !Number.isInteger(samples) || samples < 0) {
    throw new Error('game.json 的异星样本数不合法。');
  }
  const lastLifeHomeHours = (g as { lastLifeHomeHours?: unknown }).lastLifeHomeHours ?? 0;
  if (typeof lastLifeHomeHours !== 'number' || !Number.isFinite(lastLifeHomeHours)) {
    throw new Error('game.json 的生命维持结算时刻不合法。');
  }
  const ordersDone = (g as { ordersDone?: unknown }).ordersDone ?? {};
  if (typeof ordersDone !== 'object' || ordersDone === null || Array.isArray(ordersDone)) {
    throw new Error('game.json 的订单记录不是对象。');
  }
  const awakened = (g as { awakened?: unknown }).awakened ?? false;
  if (typeof awakened !== 'boolean') throw new Error('game.json 的唤醒标记不合法。');
  const sleepers = Number((g as { sleepers?: unknown }).sleepers ?? (awakened ? 0 : SHIP_CREW));
  if (!Number.isFinite(sleepers) || sleepers < 0) throw new Error('game.json 的休眠人数不合法。');
  const birthHours = Number((g as { birthHours?: unknown }).birthHours ?? 0);
  if (!Number.isFinite(birthHours) || birthHours < 0) throw new Error('game.json 的人口增长累积不合法。');
  const lastLaborHomeHours = Number((g as { lastLaborHomeHours?: unknown }).lastLaborHomeHours ?? 0);
  if (!Number.isFinite(lastLaborHomeHours)) throw new Error('game.json 的人手结算时刻不合法。');
  const tungsten = Number((g as { tungsten?: unknown }).tungsten ?? TUNGSTEN_START);
  if (!Number.isFinite(tungsten) || tungsten < 0) throw new Error('game.json 的钨数量不合法。');
  const rawGrids = (g as { grids?: unknown }).grids ?? {};
  if (!rawGrids || typeof rawGrids !== 'object' || Array.isArray(rawGrids)) {
    throw new Error('game.json 的电网记录不是对象。');
  }
  const grids: Record<string, number> = {};
  for (const [key, value] of Object.entries(rawGrids as Record<string, unknown>)) {
    if (!/^p\d+$/.test(key)) throw new Error(`game.json 的电网键不合法：${key}`);
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      throw new Error(`game.json 的电网电量不合法：${key}`);
    }
    grids[key] = value;
  }
  const lastGridHomeHours = Number((g as { lastGridHomeHours?: unknown }).lastGridHomeHours ?? 0);
  if (!Number.isFinite(lastGridHomeHours)) throw new Error('game.json 的电网结算时刻不合法。');
  const blueprints = Number((g.upgrades as { blueprints?: unknown } | undefined)?.blueprints ?? 0);
  if (!Number.isFinite(blueprints) || blueprints < 0 || blueprints > 1) {
    throw new Error('game.json 的蓝图优化等级不合法。');
  }
  const spectrometer = Number((g.upgrades as { spectrometer?: unknown } | undefined)?.spectrometer ?? 0);
  if (!Number.isFinite(spectrometer) || spectrometer < 0 || spectrometer > 1) {
    throw new Error('game.json 的质谱仪等级不合法。');
  }
  const rawMined = (g as { mined?: unknown }).mined ?? {};
  if (!rawMined || typeof rawMined !== 'object' || Array.isArray(rawMined)) {
    throw new Error('game.json 的已挖矿记录不是对象。');
  }
  const mined: Record<string, number> = {};
  for (const [key, value] of Object.entries(rawMined as Record<string, unknown>)) {
    if (!/^p\d+:\d+:\d+$/.test(key)) throw new Error(`game.json 的矿脉键不合法：${key}`);
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      throw new Error(`game.json 的已挖矿量不合法：${key}`);
    }
    mined[key] = value;
  }
  const lastSpectrometerHomeHours = Number((g as { lastSpectrometerHomeHours?: unknown }).lastSpectrometerHomeHours ?? 0);
  if (!Number.isFinite(lastSpectrometerHomeHours)) throw new Error('game.json 的质谱仪扫描时刻不合法。');
  // 机械臂是后加的：旧档没有这两个字段就按「还没结算过」处理，不用重置存档。
  const lastArmsHomeHours = Number((g as { lastArmsHomeHours?: unknown }).lastArmsHomeHours ?? 0);
  if (!Number.isFinite(lastArmsHomeHours)) throw new Error('game.json 的机械臂结算时刻不合法。');
  const lastCycleWarnDay = Number((g as { lastCycleWarnDay?: unknown }).lastCycleWarnDay ?? -1);
  if (!Number.isFinite(lastCycleWarnDay)) throw new Error('game.json 的环路提醒日期不合法。');
  const lastIndustryHomeHours = Number((g as { lastIndustryHomeHours?: unknown }).lastIndustryHomeHours ?? 0);
  if (!Number.isFinite(lastIndustryHomeHours)) throw new Error('game.json 的工业结算时刻不合法。');
  // 星图是后加的：旧档没有就按「一张没有」处理。
  const charts = (g as { charts?: unknown }).charts ?? [];
  if (!Array.isArray(charts) || charts.some((v) => typeof v !== 'string')) {
    throw new Error('game.json 的星图不是字符串数组。');
  }
  return {
    ...(g as GameState),
    charts: charts as string[],
    lastArmsHomeHours,
    lastCycleWarnDay,
    lastIndustryHomeHours,
    upgrades: { ...(g.upgrades as Upgrades), telescope, sparkPlug, battery, subagent, blueprints, spectrometer },
    tungsten,
    grids,
    lastGridHomeHours,
    mined,
    lastSpectrometerHomeHours,
    terra,
    lastTerraHomeHours,
    siteStores,
    samples,
    lastLifeHomeHours,
    ordersDone: ordersDone as Record<string, number>,
    awakened,
    sleepers,
    birthHours,
    lastLaborHomeHours,
  };
}

// —— 看四周（look）与等待（wait） ——

/** 附近多远算「附近」（km）。 */
export const LOOK_NEARBY_RADIUS_KM = 200;
/** 脚下那一片的固定半径（km）——不受面板的「地形视野」设置影响。 */
export const LOOK_PATCH_RADIUS_KM = 1_200;

export interface LookReport {
  text: string;
  /** 附近有没有站点/建筑，面板可以据此高亮。 */
  hasNearby: boolean;
}

/**
 * 「此刻、这里」：脚下、日照、5×5 地形、附近站点建筑、天上看得到什么，
 * 最后用一句话收束。移动途中不让看（和 genesis_terrain 一致）。
 */
export function lookAround(system: StarSystem, state: GameState, nowMs: number): LookReport {
  if (state.transit) throw new Error('移动途中看不到环境——到了会自动收到【已到达】。');
  if (!state.location) throw new Error('还不知道自己在哪。');
  const loc = state.location;
  const body = terrainBodyAt(system, loc);
  const homeHours = nowPlanetHours(state, nowMs);
  const yearHours = yearHomeHoursOf(state);
  const sun = sunAt(system, state, nowMs, loc.latDeg, loc.lonDeg);
  const lines: string[] = [];
  lines.push(`${formatTime(state.calendar, homeHours)} · ${describeLocation(state, loc)}`);

  if (body.surface.kind === 'terrestrial') {
    const cell = sampleCell(body.surface, loc.latDeg, loc.lonDeg);
    const climate = climateAt(body.surface, loc.latDeg, loc.lonDeg, homeHours, yearHours, body.obliquityDeg);
    const terra = terraClimate(body.surface, state.terra, loc.planetIndex, cell.cellI, cell.cellJ, climate);
    const biome = effectiveBiome(body.surface, state.terra, loc.planetIndex, cell.cellI, cell.cellJ);
    const p = terraProgress(state.terra, loc.planetIndex, cell.cellI, cell.cellJ);
    const scar = scarAt(system, state, loc.planetIndex, cell.cellI, cell.cellJ);
    lines.push(
      `脚下：${BIOME_LABELS[biome] ?? '未知'}，海拔 ${cell.elevationM.toFixed(0)} m，` +
        `气温 ${terra.tempC.toFixed(1)} ℃，湿度 ${(terra.wetness * 100).toFixed(0)}%。` +
        (p > 0 && p < 1 ? `（群系改造中：${(p * 100).toFixed(0)}%）` : '') +
        (scar >= 0.6
          ? `（废地：采掘把这里挖薄了 ${(scar * 100).toFixed(0)}%，肥力大不如前，群系改变器能慢慢替它复垦）`
          : scar > 0.1
            ? `（采掘过的地：土被挖薄了 ${(scar * 100).toFixed(0)}%）`
            : ''),
    );
  } else if (body.surface.kind === 'isobaric') {
    lines.push(`脚下：等气压面（${(body.surface.pressureBar).toFixed(0)} bar）上的风暴带，均温 ${body.surface.meanTempC.toFixed(1)} ℃。`);
  } else {
    lines.push(`脚下：卫星地表，均温 ${body.surface.meanTempC.toFixed(1)} ℃。`);
  }
  lines.push(
    sun.isDay
      ? `日照：白天，太阳高度角 ${sun.altitudeDeg.toFixed(1)}°，方位 ${sun.azimuthDeg.toFixed(0)}°。`
      : `日照：夜里，太阳在地平线下 ${Math.abs(sun.altitudeDeg).toFixed(1)}°。`,
  );

  lines.push('近处（5×5，每格约 555 km）：');
  lines.push(terrainPatchText(terrainPatch(body, loc.latDeg, loc.lonDeg, LOOK_PATCH_RADIUS_KM)));

  const radiusKm = bodyRadiusKm(system, loc);
  const nearby: string[] = [];
  for (const site of state.sites) {
    if (site.planetIndex !== loc.planetIndex) continue;
    const d = surfaceDistanceKm(loc.latDeg, loc.lonDeg, site.latDeg, site.lonDeg, radiusKm);
    if (d > LOOK_NEARBY_RADIUS_KM) continue;
    const count = state.plants[site.key]?.length ?? 0;
    nearby.push(`站点 ${site.key}（${d.toFixed(0)} km${count > 0 ? `，${count} 株/群` : ''}）`);
  }
  for (const structure of state.structures) {
    if (structure.planetIndex !== loc.planetIndex) continue;
    const site = state.sites.find((s) => s.key === structure.siteKey);
    if (!site) continue;
    const d = surfaceDistanceKm(loc.latDeg, loc.lonDeg, site.latDeg, site.lonDeg, radiusKm);
    if (d > LOOK_NEARBY_RADIUS_KM) continue;
    nearby.push(`${BUILD_SPECS[structure.kind].label}（${d.toFixed(0)} km）`);
  }
  for (const build of state.builds) {
    if (build.kind === 'mobility_core') {
      nearby.push(`机动核心在修（还剩 ${Math.max(0, build.completeHomeHours - homeHours).toFixed(1)} 母星时）`);
      continue;
    }
    if (build.planetIndex !== loc.planetIndex) continue;
    nearby.push(`${buildLabel(build.kind)}在建（还剩 ${Math.max(0, build.completeHomeHours - homeHours).toFixed(1)} 母星时）`);
  }
  lines.push(nearby.length > 0 ? `附近：${nearby.join('；')}。` : '附近：200 km 内没有站点、建筑或工程。');

  const pop = populationStatus(state);
  lines.push(
    `人口：常住 ${pop.population} 人（容量 ${pop.capacity}，每座居所 20 人），` +
      `休眠舱里还有 ${pop.sleepers} 人，人手 ${pop.laborUnits}（每 20 人一个，能自动收种）。`,
  );

  const vis = visibilityAt(system, loc);
  if (vis > STARGAZE_VISIBILITY_THRESHOLD) {
    const sky = stargaze(system, state.calendar, homeHours, {
      bodyId: bodyKeyOf(loc),
      planetIndex: loc.planetIndex,
      visibility: vis,
    });
    if (sky && sky.bodies.length > 0) {
      lines.push(
        `天上：${sky.bodies
          .slice(0, 4)
          .map((b) => `${displayName(state, b.key)}（星等 ${b.magnitude.toFixed(1)}）`)
          .join('、')}。`,
      );
    } else {
      lines.push('天上：能看到恒星，但没有别的天体亮到肉眼可见。');
    }
  } else {
    lines.push(`天上：大气太浑，看不到星星（能见度 ${vis.toFixed(2)}）。`);
  }

  lines.push(orderSummary(body, nearby.length, sun.isDay, vis));
  return { text: lines.join('\n'), hasNearby: nearby.length > 0 };
}

function orderSummary(body: TerrainBody, nearbyCount: number, isDay: boolean, visibility: number): string {
  const parts: string[] = [];
  if (body.surface.kind === 'terrestrial') parts.push('你在有陆地的地方');
  else if (body.surface.kind === 'isobaric') parts.push('你在气态天体的大气里');
  else parts.push('你在卫星上');
  parts.push(isDay ? '天是亮的' : '天是黑的');
  parts.push(nearbyCount > 0 ? '附近有人留下的东西' : '附近很空');
  if (visibility > STARGAZE_VISIBILITY_THRESHOLD) parts.push('抬头能看见星星');
  return `一句话：${parts.join('，')}。`;
}

// —— 等待 ——

/** 一次最多等 7 个母星日，防止一口气跳过太多东西。 */
export const WAIT_MAX_HOME_HOURS = 7 * 24;

export type WaitUntil = 'dawn' | 'dusk' | 'noon' | 'open' | 'ripe' | 'built' | 'arrive';

export interface WaitPlan {
  hours?: number;
  until?: WaitUntil;
}

export interface WaitResult {
  state: GameState;
  events: GameEvent[];
  advancedHomeHours: number;
  reason: string;
}

/**
 * 把「等」变成一个动作：按 1 母星时步进 tick，逐段收集事件。
 * - hours：推进这么多母星时；
 * - until：dawn / dusk / ripe / built / arrive，满足就提前停。
 */
export function waitFor(system: StarSystem, state: GameState, nowMs: number, plan: WaitPlan): WaitResult {
  if (plan.hours !== undefined && !(plan.hours > 0)) throw new Error('要等的时间得大于 0。');
  const until = plan.until;
  if (!until && plan.hours === undefined) throw new Error('要么给 hours，要么给 until。');
  const cap = plan.hours !== undefined ? Math.min(plan.hours, WAIT_MAX_HOME_HOURS) : WAIT_MAX_HOME_HOURS;
  const events: GameEvent[] = [];
  const addEvents = (list: GameEvent[]) => {
    for (const e of list) {
      if (!events.some((x) => x.type === e.type && x.text === e.text)) events.push(e);
    }
  };
  let cur = state;
  let waited = 0;
  let reason = '';
  const at = (h: number) => nowMs + h * state.msPerPlanetHour;

  if (until === 'arrive' && !cur.transit) {
    return { state: cur, events, advancedHomeHours: 0, reason: '你现在没有在移动，不用等。' };
  }
  if (until === 'built' && cur.builds.length === 0) {
    return { state: cur, events, advancedHomeHours: 0, reason: '现在没有在建的工程。' };
  }

  const hourAt = (ms: number) => {
    const raw = nowPlanetHours(cur, ms);
    return ((raw % 24) + 24) % 24;
  };
  if ((until === 'noon' || until === 'open') && Math.abs(hourAt(nowMs) - 12) < 1e-9) {
    return { state: cur, events, advancedHomeHours: 0, reason: '现在正好是 12 时，商店已经开门了。' };
  }

  const startDay = cur.location ? sunAt(system, cur, nowMs, cur.location.latDeg, cur.location.lonDeg).isDay : true;
  let sawNight = !startDay;
  let sawDay = startDay;
  const hadBuilds = cur.builds.length > 0;

  while (waited < cap - 1e-9) {
    const step = Math.min(1, cap - waited);
    waited += step;
    const result = tick(system, cur, at(waited));
    addEvents(result.events);
    cur = result.state;

    if (until === 'arrive' && !cur.transit) {
      reason = '到了。';
      break;
    }
    if (until === 'built' && hadBuilds && cur.builds.length === 0) {
      reason = '工程完工了。';
      break;
    }
    if (until === 'ripe' && Object.values(cur.plants).some((list) => list.some((p) => p.stage === 'ripe' && p.health > 0))) {
      reason = '有作物成熟了。';
      break;
    }
    if (until === 'noon' || until === 'open') {
      const before = hourAt(at(waited - step));
      const after = hourAt(at(waited));
      if (before < 12 && after >= 12) {
        reason = until === 'open' ? '到 12 时了，商店开门。' : '到中午 12 时了。';
        break;
      }
    }
    if ((until === 'dawn' || until === 'dusk') && cur.location) {
      const day = sunAt(system, cur, at(waited), cur.location.latDeg, cur.location.lonDeg).isDay;
      if (until === 'dawn' && day && sawNight) {
        reason = '天亮了。';
        break;
      }
      if (until === 'dusk' && !day && sawDay) {
        reason = '天黑了。';
        break;
      }
      if (day) sawDay = true;
      else sawNight = true;
    }
  }
  if (!reason) {
    reason = plan.hours !== undefined
      ? `等满了 ${waited.toFixed(1)} ${state.calendar.homePlanetName}时。`
      : `等了 ${waited.toFixed(1)} ${state.calendar.homePlanetName}时也没等到（一次最多等 ${WAIT_MAX_HOME_HOURS} 母星时）。`;
  }
  return { state: advanceHomeHours(cur, waited), events, advancedHomeHours: waited, reason };
}

// ———— 2.0.0：气体工业（火电、风电、气液转换、提取器抽气、母舰生命维持） ————

/** 大气里某种气体的体积分数（按中文名查；没有就是 0）。 */
export function gasFractionOf(reading: AtmosphereReading, gas: string): number {
  return reading.composition.find((part) => part.gas === gas)?.fraction ?? 0;
}

/** 火电站挑燃料：热值从高到低，先烧最值的。 */
export function pickFireFuel(store: Record<string, number>): { resource: string; have: number } | null {
  let best: { resource: string; have: number } | null = null;
  for (const [resource, value] of Object.entries(FIRE_FUEL_KJ)) {
    const have = store[resource] ?? 0;
    if (have <= 0) continue;
    if (!best || value > (FIRE_FUEL_KJ[best.resource] ?? 0)) best = { resource, have };
  }
  return best;
}

/** 建筑吃哪一份库存：母舰上的子建筑吃母舰的货舱，其余吃站点堆场。 */
function industryStoreOf(
  state: GameState,
  structure: StructureRecord,
): { key: string; store: Record<string, number> } {
  if (structure.siteKey.startsWith(CARRIER_KEY_PREFIX)) {
    const carrierId = structure.siteKey.slice(CARRIER_KEY_PREFIX.length);
    return { key: carrierId, store: { ...(state.stores[carrierId] ?? {}) } };
  }
  return { key: structure.siteKey, store: { ...(state.siteStores[structure.siteKey] ?? {}) } };
}

/** 母舰上已经挂了几座子建筑（不含种植盆）。 */
export function carrierSubCount(state: GameState, carrierId: string): number {
  const prefix = CARRIER_KEY_PREFIX + carrierId;
  const inUse = state.structures.filter((s) => s.siteKey === prefix && s.kind !== 'planter').length;
  const inBuild = state.builds.filter((b) => b.siteKey === prefix && b.kind !== 'planter').length;
  return inUse + inBuild;
}

/**
 * 气体工业的每小时结算：先烧火、再吹风、再转气、最后喂人。
 *
 * 火电站把固体燃料变成电，灰留在自己的灰仓里（灰就是草木灰）；
 * 风机只看群系与海拔；转换机按配方白名单把气变成液；
 * 母舰上的人按自己的货舱吃饭，断了就回休眠舱（不死人）。
 */
/**
 * 空天母舰停在哪一条风带上：由 id 决定（同一艘母舰永远停在同一格），
 * 存档里只在落成时记一次经纬度。
 */
export function carrierBandOf(carrierId: string): { latDeg: number; lonDeg: number } {
  const h = hashSeed(`carrier:band:${carrierId}`);
  const latDeg = Math.round(((h % 1701) / 10 - 85) * 10) / 10;
  const lonDeg = Math.round((((h >>> 8) % 3501) / 10 - 175) * 10) / 10;
  return { latDeg, lonDeg };
}

/**
 * 风力发电站每母星时发多少 kJ：
 * - 陆地上看脚下格：风暴带（群系 12–16）9,000，海拔 3,000 m 以上 1,500，其余 0。
 * - 气态/冰巨星的等气压面上看风速：按 (minWindMps + maxWindMps)/2 与 300 m/s 的比值折算，
 *   最低两成、最高满额 9,000——风暴带的名号终于名副其实。
 */
export function windRateKjPerHour(system: StarSystem, state: GameState, structure: StructureRecord): number {
  const site = state.sites.find((s) => s.key === structure.siteKey);
  const carrierId = structure.siteKey.startsWith(CARRIER_KEY_PREFIX)
    ? structure.siteKey.slice(CARRIER_KEY_PREFIX.length)
    : null;
  const carrier = carrierId ? state.structures.find((s) => s.id === carrierId) : undefined;
  const planetIndex = site?.planetIndex ?? carrier?.planetIndex ?? structure.planetIndex;
  const planet = system.planets[planetIndex - 1];
  if (!planet) return 0;
  const surface = planet.surface;
  if (surface.kind === 'terrestrial') {
    if (!site) return 0;
    const cell = cellIndexFor(site.latDeg, site.lonDeg);
    const biome = surface.biome[cell.i]?.[cell.j] ?? 0;
    const elevation = surface.elevationM[cell.i]?.[cell.j] ?? 0;
    return biome >= 12 && biome <= 16
      ? WIND_STORM_KJ_PER_HOUR
      : elevation >= WIND_HIGHLAND_MIN_M ? WIND_HIGHLAND_KJ_PER_HOUR : 0;
  }
  if (surface.kind === 'isobaric') {
    if (!carrier) return 0;
    const band = carrierBandOf(carrier.id);
    const latDeg = carrier.latDeg ?? band.latDeg;
    const lonDeg = carrier.lonDeg ?? band.lonDeg;
    const cell = cellIndexFor(latDeg, lonDeg);
    const biome = surface.biome[cell.i]?.[cell.j] ?? 12;
    if (biome >= 12 && biome <= 16) {
      const wind = (surface.minWindMps + surface.maxWindMps) / 2;
      return Math.round(WIND_STORM_KJ_PER_HOUR * Math.min(1, Math.max(0.2, wind / 300)));
    }
    return 0;
  }
  return 0;
}

export function advanceIndustry(system: StarSystem, state: GameState, nowMs: number): { state: GameState; events: GameEvent[] } {
  const nowHours = nowPlanetHours(state, nowMs);
  const last = state.lastIndustryHomeHours ?? nowHours;
  const delta = nowHours - last;
  if (!(delta > 0)) return { state, events: [] };
  const events: GameEvent[] = [];
  const hours = Math.min(24, delta);
  let next: GameState = { ...state, lastIndustryHomeHours: nowHours };
  let energyKj = next.energyKj;

  const writeStore = (key: string, store: Record<string, number>): void => {
    next = next.stores[key] !== undefined
      ? { ...next, stores: { ...next.stores, [key]: store } }
      : { ...next, siteStores: { ...next.siteStores, [key]: store } };
  };

  // 1) 火力发电站
  for (const fire of next.structures.filter((s) => s.kind === 'fire')) {
    if (!structurePowered(next, fire)) continue;
    const { key, store } = industryStoreOf(next, fire);
    const fuel = pickFireFuel(store);
    if (!fuel) continue;
    const room = Math.max(0, FIRE_ASH_CAP_KG - (store.ash ?? 0));
    const burnable = Math.min(fuel.have, FIRE_BURN_KG_PER_HOUR * hours, room / FIRE_ASH_PER_KG);
    if (burnable <= 0) continue;
    const burned = Math.round(burnable * 1000) / 1000;
    store[fuel.resource] = round3(fuel.have - burned);
    if ((store[fuel.resource] ?? 0) <= 0) delete store[fuel.resource];
    store.ash = round3((store.ash ?? 0) + burned * FIRE_ASH_PER_KG);
    energyKj += burned * (FIRE_FUEL_KJ[fuel.resource] ?? 0);
    writeStore(key, store);
  }

  // 2) 风力发电站（陆地上看群系与海拔，气态/冰巨星的等气压面上看风速）
  for (const wind of next.structures.filter((s) => s.kind === 'wind')) {
    if (!structurePowered(next, wind)) continue;
    energyKj += windRateKjPerHour(system, next, wind) * hours;
  }

  // 3) 气液转换机
  for (const converter of next.structures.filter((s) => s.kind === 'converter')) {
    if (!structurePowered(next, converter)) continue;
    const { key, store } = industryStoreOf(next, converter);
    let changed = false;
    for (const recipeId of converter.recipes ?? []) {
      const recipe = CONVERTER_RECIPES[recipeId];
      if (!recipe) continue;
      const units = Math.min(CONVERTER_UNITS_PER_HOUR * hours, store[recipe.gas] ?? 0);
      if (units <= 0) continue;
      store[recipe.gas] = round3((store[recipe.gas] ?? 0) - units);
      if ((store[recipe.gas] ?? 0) <= 0) delete store[recipe.gas];
      store[recipe.liquid] = round3((store[recipe.liquid] ?? 0) + units);
      changed = true;
    }
    if (changed) writeStore(key, store);
  }

  // 4) 大气提取器抽氨 / 甲烷（抽氧那一路在生命维持链里，保持原样）
  for (const extractor of next.structures.filter((s) => s.kind === 'atmo_extractor')) {
    const gas = extractor.extractGas;
    if (!gas || gas === 'oxygen') continue;
    if (!structurePowered(next, extractor)) continue;
    const site = next.sites.find((s) => s.key === extractor.siteKey);
    if (!site) continue;
    const reading = atmosphereReadingOf(system, site.planetIndex);
    const name = gas === 'ammonia' ? '氨' : gas === 'methane' ? '甲烷' : gas;
    if (gasFractionOf(reading, name) < 0.005) continue;
    const { key, store } = industryStoreOf(next, extractor);
    const resource = gas === 'ammonia' ? 'ammonia_gas' : 'methane_gas';
    store[resource] = round3((store[resource] ?? 0) + hours);
    writeStore(key, store);
  }

  // 5) 母舰上的人：吃自己的货舱，断了回休眠舱
  for (const carrier of next.structures.filter((s) => s.kind === 'carrier')) {
    const crew = carrier.crew ?? 0;
    if (crew <= 0) continue;
    const hold: Record<string, number> = { ...(next.stores[carrier.id] ?? {}) };
    const demand = lifeDemand(crew, 0, hours);
    const short = (hold.biomass ?? 0) < demand.food
      || (hold.water_drink ?? 0) < demand.water
      || (hold.oxygen ?? 0) < demand.oxygen;
    if (short) {
      next = {
        ...next,
        stores: { ...next.stores, [carrier.id]: hold },
        structures: next.structures.map((s) => (s.id === carrier.id ? { ...s, crew: 0 } : s)),
      };
      events.push({
        type: 'genesis.lifeline',
        text: '空天母舰的货舱见底了：人自己回了休眠舱。补上粮、水、氧再叫一次。',
      });
      continue;
    }
    hold.biomass = round3((hold.biomass ?? 0) - demand.food);
    hold.water_drink = round3((hold.water_drink ?? 0) - demand.water);
    hold.oxygen = round3((hold.oxygen ?? 0) - demand.oxygen);
    if ((hold.biomass ?? 0) <= 0) delete hold.biomass;
    if ((hold.water_drink ?? 0) <= 0) delete hold.water_drink;
    if ((hold.oxygen ?? 0) <= 0) delete hold.oxygen;
    next = { ...next, stores: { ...next.stores, [carrier.id]: hold } };
    energyKj -= CARRIER_KJ_PER_HOUR * hours;
  }

  next = { ...next, energyKj: Math.max(0, round3(energyKj)) };
  return { state: next, events };
}

/** 用罐装物资（目前只有液氨）：一次用 amount 罐，返还 90% 的钢瓶（向下取整）。 */
export function useCanned(
  state: GameState,
  siteKey: string,
  resource: string,
  amount: number,
): { state: GameState; text: string } {
  if (state.transit) throw new Error('移动途中不能施放。');
  if (resource !== 'canned_ammonia') throw new Error('这种罐装物资还不能直接用：' + resource + '。');
  const site = state.sites.find((s) => s.key === siteKey);
  if (!site) throw new Error('脚下还没有站点：液氨要施到一块地里。');
  const store = state.siteStores[siteKey] ?? {};
  const have = Math.floor(store.canned_ammonia ?? 0);
  const n = Math.max(1, Math.floor(amount));
  if (have < n) throw new Error('罐装液氨不够：要 ' + n + ' 罐，只有 ' + have + ' 罐。');
  const nextStore: Record<string, number> = { ...store, canned_ammonia: have - n };
  if ((nextStore.canned_ammonia ?? 0) <= 0) delete nextStore.canned_ammonia;
  const returned = Math.floor(n * CANNED_RETURN_FRACTION);
  const nutrients = site.nutrients ?? { n: 0, p: 0, k: 0, trace: 0 };
  const nextNutrients = { ...nutrients, n: round3(Math.min(1, nutrients.n + n * CANNED_AMMONIA_N)) };
  const next: GameState = {
    ...state,
    siteStores: { ...state.siteStores, [siteKey]: nextStore },
    sites: state.sites.map((s) => (s.key === siteKey ? { ...s, nutrients: nextNutrients } : s)),
    inventory: { ...state.inventory, cylinder: round3((state.inventory.cylinder ?? 0) + returned) },
  };
  return {
    state: next,
    text: '把 ' + n + ' 罐液氨施进了这段地：氮到 ' + (nextNutrients.n * 100).toFixed(0) + '%，收回 ' + returned + ' 个空钢瓶。',
  };
}
