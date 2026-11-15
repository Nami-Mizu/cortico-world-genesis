/**
 * 商人：母星上的贸易窗口。
 *
 * - 望远镜修到 lv1 之前根本没有商人（信号到不了），之后按等级开窗（12:00–14:00 / 17:00 / 23:00）；
 * - 卖东西给「信用点」，信用点余额决定商人跟你的关系（0 / 500 / 5,000 / 20,000 四档），
 *   每件货有最低余额，不够就拒绝——所以花掉信用点会重新锁上高级货；
 * - 基础种子用 kJ 买（能量换种子），高级种子与以后的大型植物用信用点买；
 * - 价格每天用日期哈希浮动 ±15%，当天内固定。
 */
import { hashSeed } from './rng.ts';
import type { ResourceId, SpeciesId } from './flora.ts';

export type Currency = 'kj' | 'credits';

export const CREDIT_TIERS = [0, 500, 5_000, 20_000] as const;
export const TIER_LABELS = ['陌生人', '常客', '熟客', '合伙人'] as const;

export function creditTier(credits: number): { tier: number; label: string; next: number | null } {
  let tier = 0;
  for (let i = 0; i < CREDIT_TIERS.length; i += 1) {
    if (credits >= CREDIT_TIERS[i]!) tier = i;
  }
  return { tier, label: TIER_LABELS[tier]!, next: tier + 1 < CREDIT_TIERS.length ? CREDIT_TIERS[tier + 1]! : null };
}

export interface SellGood {
  id: ResourceId | 'survey';
  name: string;
  /** 基准价（信用点）。 */
  basePrice: number;
  /** 每天最多卖多少（kg 或份）。 */
  dailyLimit: number;
  unit: string;
}

/** 商人收购清单（信用点/单位）。 */
export const SELL_GOODS: SellGood[] = [
  { id: 'biomass', name: '生物质', basePrice: 30, dailyLimit: Number.POSITIVE_INFINITY, unit: 'kg' },
  { id: 'phycocyanin', name: '藻蓝素', basePrice: 120, dailyLimit: 10, unit: 'kg' },
  { id: 'silica', name: '硅质壳', basePrice: 80, dailyLimit: 15, unit: 'kg' },
  { id: 'antifreeze', name: '抗冻蛋白', basePrice: 250, dailyLimit: 3, unit: 'kg' },
  { id: 'fiber', name: '纤维', basePrice: 50, dailyLimit: 20, unit: 'kg' },
  { id: 'lichen_acid', name: '地衣酸', basePrice: 400, dailyLimit: 2, unit: 'kg' },
  { id: 'dry_food', name: '干粮', basePrice: 45, dailyLimit: 20, unit: 'kg' },
  // 尾矿：商人收，但只按原价走（净价 0，不赚不亏），而且每天收不了多少——市场处理不了成吨的废渣。
  { id: 'slag', name: '尾矿', basePrice: 0, dailyLimit: 50, unit: 'kg' },
  { id: 'survey', name: '测绘数据', basePrice: 50, dailyLimit: 1, unit: '份' },
];

export type BuyId = 'random_seed' | 'premium_seed' | 'giant_plant';

export interface BuyGood {
  id: BuyId;
  name: string;
  currency: Currency;
  /** 信用点货的最低余额门槛。 */
  minCredits: number;
  dailyLimit: number;
  /** 占位货：看得见、有门槛，但买不了。 */
  stub?: boolean;
  note: string;
}

export const BUY_GOODS: BuyGood[] = [
  {
    id: 'random_seed',
    name: '随机基因种子',
    currency: 'kj',
    minCredits: 0,
    dailyLimit: Number.POSITIVE_INFINITY,
    note: '每买一袋，下一袋贵 200 kJ。',
  },
  {
    id: 'premium_seed',
    name: '高级种子（耐寒·高产）',
    currency: 'credits',
    minCredits: 500,
    dailyLimit: 2,
    note: '固定好基因，每天两袋。',
  },
  {
    id: 'giant_plant',
    name: '大型植物',
    currency: 'credits',
    minCredits: 20_000,
    dailyLimit: 1,
    stub: true,
    note: '这条贸易线还没开通。',
  },
];

/** 基础种子的阶梯价（kJ）：第 n 袋 = 1000 + 200×(n−1)。 */
export function randomSeedPriceKj(purchased: number): number {
  return 1_000 + 200 * purchased;
}

export const PREMIUM_SEED_PRICE_CREDITS = 600;

/** 一天内的第几天（母星时，0 起）。 */
export function dayIndexOf(homeHours: number): number {
  return Math.floor(homeHours / 24);
}

/* ---------------------------------------------------------------- 射电望远镜阵列 */

/**
 * 星际商人不是随时都在的：母星上的【射电望远镜阵列】得先修好，才有信号把人喊来。
 *
 *   lv0  没有商店；
 *   lv1  每天 12:00–14:00 可交易，每日限额 ×1；
 *   lv2  每天 12:00–17:00，每日限额 ×1.3；
 *   lv3  每天 12:00–23:00，每日限额 ×1.7。
 *
 * 价格按「一场仗一次」定：lv1 只要 30,000 kJ（烧一株速生草就够），因为它就是
 * 「烧掉第一茬收成、把信号发出去」；lv2、lv3 吃的是前面种出来的材料——所以
 * 修望远镜本身就是「把农场变成市场」的那一步。
 */
export const TELESCOPE_MAX_LEVEL = 3;

export interface TelescopeLevelSpec {
  /** 这一级修好之后达到的等级。 */
  level: number;
  costKj: number;
  homeHours: number;
  materials: Partial<Record<ResourceId, number>>;
  openFrom: number;
  openTo: number;
  limitFactor: number;
  summary: string;
}

export const TELESCOPE_LEVELS: TelescopeLevelSpec[] = [
  {
    level: 1,
    costKj: 30_000,
    homeHours: 0.5,
    materials: {},
    openFrom: 12,
    openTo: 14,
    limitFactor: 1,
    summary: '解锁商店：每天 12:00–14:00 商人在母星上。',
  },
  {
    level: 2,
    costKj: 800_000,
    homeHours: 1,
    materials: { silica: 5, fiber: 4, lichen_acid: 0.4 },
    openFrom: 12,
    openTo: 17,
    limitFactor: 1.3,
    summary: '营业到 17:00，每日收购限额 ×1.3。',
  },
  {
    level: 3,
    costKj: 1_800_000,
    homeHours: 1.5,
    materials: { silica: 12, fiber: 10, phycocyanin: 0.6, antifreeze: 0.3 },
    openFrom: 12,
    openTo: 23,
    limitFactor: 1.7,
    summary: '营业到 23:00，每日收购限额 ×1.7。',
  },
];

export function telescopeLevel(level: number): TelescopeLevelSpec | null {
  return TELESCOPE_LEVELS.find((spec) => spec.level === level) ?? null;
}

/** 下一级要修的东西；已经满级就返回 null。 */
export function nextTelescopeLevel(level: number): TelescopeLevelSpec | null {
  return telescopeLevel(level + 1);
}

export function telescopeLimitFactor(level: number): number {
  return telescopeLevel(level)?.limitFactor ?? 0;
}

export function telescopeWindow(level: number): string {
  const spec = telescopeLevel(level);
  return spec ? `${String(spec.openFrom).padStart(2, '0')}:00–${String(spec.openTo).padStart(2, '0')}:00` : '';
}

/**
 * 【火花塞】：动能发电机的产能升级。
 *
 * 发电机本身是 50 kJ/次（人类手摇，0.5 秒冷却），火花塞每级往上抬一档：
 * lv1 200、lv2 350、lv3 500 kJ。它从来不是主电源——真正的电来自烧燃料和太阳能帆；
 * 火花塞只是让「实在没电、又等不到收货」的时候不至于卡死：满级约 40 分钟手摇能攒出 100,000 kJ。
 */
export const GENERATOR_BASE_KJ = 50;
export const SPARK_PLUG_MAX_LEVEL = 3;

export interface SparkPlugLevelSpec {
  level: number;
  costKj: number;
  homeHours: number;
  materials: Partial<Record<ResourceId, number>>;
  outputKj: number;
  summary: string;
}

export const SPARK_PLUG_LEVELS: SparkPlugLevelSpec[] = [
  { level: 1, costKj: 12_000, homeHours: 0.25, materials: { fiber: 0.5 }, outputKj: 200, summary: '手摇一次 200 kJ。' },
  { level: 2, costKj: 60_000, homeHours: 0.5, materials: { silica: 2, fiber: 1.5 }, outputKj: 350, summary: '手摇一次 350 kJ。' },
  { level: 3, costKj: 200_000, homeHours: 0.75, materials: { silica: 5, phycocyanin: 0.4 }, outputKj: 500, summary: '手摇一次 500 kJ。' },
];

export function sparkPlugLevel(level: number): SparkPlugLevelSpec | null {
  return SPARK_PLUG_LEVELS.find((spec) => spec.level === level) ?? null;
}

export function nextSparkPlugLevel(level: number): SparkPlugLevelSpec | null {
  return sparkPlugLevel(level + 1);
}

/** 当前等级下，人类手摇一次给多少 kJ。 */
export function sparkPlugOutputKj(level: number): number {
  return sparkPlugLevel(level)?.outputKj ?? GENERATOR_BASE_KJ;
}

/**
 * 【蓄电池】：能量上限。
 *
 * 初始容量 100,000 kJ；每升一级加一大块（+200k / +400k / +800k，满级 1.5M），
 * 因为监测器（1M）与无人机集群（3M）这种大件需要先有一个能装下它们的电池。
 * 溢出的电会白掉，所以电池也是「先攒钱还是先扩容」的选择。
 */
export const BATTERY_BASE_CAPACITY_KJ = 100_000;
export const BATTERY_MAX_LEVEL = 3;

export interface BatteryLevelSpec {
  level: number;
  costKj: number;
  homeHours: number;
  materials: Partial<Record<ResourceId, number>>;
  addCapacityKj: number;
  summary: string;
}

export const BATTERY_LEVELS: BatteryLevelSpec[] = [
  { level: 1, costKj: 120_000, homeHours: 0.5, materials: { silica: 3, fiber: 2 }, addCapacityKj: 200_000, summary: '能量上限 300,000 kJ。' },
  { level: 2, costKj: 350_000, homeHours: 1, materials: { silica: 6, fiber: 5, lichen_acid: 0.3 }, addCapacityKj: 400_000, summary: '能量上限 700,000 kJ。' },
  { level: 3, costKj: 800_000, homeHours: 1.5, materials: { silica: 12, fiber: 9, phycocyanin: 0.5 }, addCapacityKj: 800_000, summary: '能量上限 1,500,000 kJ。' },
];

export function batteryLevel(level: number): BatteryLevelSpec | null {
  return BATTERY_LEVELS.find((spec) => spec.level === level) ?? null;
}

export function nextBatteryLevel(level: number): BatteryLevelSpec | null {
  return batteryLevel(level + 1);
}

/** 当前蓄电池等级下的能量上限。 */
export function batteryCapacityKj(level: number): number {
  let capacity = BATTERY_BASE_CAPACITY_KJ;
  for (const spec of BATTERY_LEVELS) {
    if (spec.level <= level) capacity += spec.addCapacityKj;
  }
  return capacity;
}


/**
 * 【子代理】：并行施工队列。
 *
 * 你是舰载 AI，迫降时大部分子代理都停了，只剩一条能动的施工臂；每修好一组子代理，
 * 就多一条能同时推进的队列（1 → 2 → 3 → 4 条）。它不产能量、不产材料，只买时间，
 * 所以定价按「省下的母星时」算：lv3 的 900k 大约等于省下两整天。
 */
export const SUBAGENT_MAX_LEVEL = 3;
export const BASE_BUILD_SLOTS = 1;

export interface SubagentLevelSpec {
  level: number;
  costKj: number;
  homeHours: number;
  materials: Partial<Record<ResourceId, number>>;
  addSlots: number;
  summary: string;
}

export const SUBAGENT_LEVELS: SubagentLevelSpec[] = [
  { level: 1, costKj: 150_000, homeHours: 0.5, materials: { fiber: 2 }, addSlots: 1, summary: '同时能有 2 条施工队列。' },
  { level: 2, costKj: 400_000, homeHours: 1, materials: { silica: 4, fiber: 3 }, addSlots: 1, summary: '同时能有 3 条施工队列。' },
  { level: 3, costKj: 900_000, homeHours: 1.5, materials: { silica: 8, fiber: 6, phycocyanin: 0.4 }, addSlots: 1, summary: '同时能有 4 条施工队列。' },
];

export function subagentLevel(level: number): SubagentLevelSpec | null {
  return SUBAGENT_LEVELS.find((spec) => spec.level === level) ?? null;
}

export function nextSubagentLevel(level: number): SubagentLevelSpec | null {
  return subagentLevel(level + 1);
}

/** 当前能同时开工的工程数。 */
export function buildSlotsFor(level: number): number {
  return BASE_BUILD_SLOTS + Math.min(SUBAGENT_MAX_LEVEL, Math.max(0, Math.trunc(level)));
}

/** 商人营业时间：由望远镜等级决定；lv0 直接没人。 */
export function shopOpen(homeHours: number, level: number): boolean {
  const spec = telescopeLevel(level);
  if (!spec) return false;
  const hour = ((homeHours % 24) + 24) % 24;
  return hour >= spec.openFrom && hour < spec.openTo;
}

export function shopWindowText(homeHours: number, level: number): string {
  const spec = telescopeLevel(level);
  if (!spec) {
    return '母星上还没有商店——【射电望远镜阵列】还没修好，星际商人听不到你的信号。';
  }
  const window = telescopeWindow(level);
  return shopOpen(homeHours, level)
    ? `商人在营业（每天 ${window}）。`
    : `商人不在（每天 ${window} 营业）。`;
}

/** 当天的收购限额：等级越高，限额越高（生物质这种「不限」仍然不限）。 */
export function dailyLimitFor(good: SellGood, level: number): number {
  if (!Number.isFinite(good.dailyLimit)) return good.dailyLimit;
  const factor = telescopeLevel(level)?.limitFactor ?? 1;
  return Math.max(1, Math.round(good.dailyLimit * factor));
}

/** 采购限额同理（高级种子这类按袋算的）。 */
export function buyDailyLimitFor(good: BuyGood, level: number): number {
  if (!Number.isFinite(good.dailyLimit)) return good.dailyLimit;
  const factor = telescopeLevel(level)?.limitFactor ?? 1;
  return Math.max(1, Math.round(good.dailyLimit * factor));
}

/** 当天的价格系数（0.85 … 1.15），同一天固定、不同天不同。 */
export function dailyPriceFactor(dayIndex: number, goodId: string): number {
  const roll = (hashSeed(`${dayIndex}:${goodId}`) % 3001) / 10_000; // 0 … 0.3001
  return Math.round((0.85 + roll) * 1000) / 1000;
}

export function sellPrice(good: SellGood, dayIndex: number): number {
  return Math.max(1, Math.round(good.basePrice * dailyPriceFactor(dayIndex, good.id)));
}

export function buyPriceCredits(good: BuyGood, dayIndex: number): number {
  if (good.id !== 'premium_seed') return 0;
  return Math.max(1, Math.round(PREMIUM_SEED_PRICE_CREDITS * dailyPriceFactor(dayIndex, good.id)));
}

/** 每件可售货当天的价格表（面板与工具共用）。 */
export function sellPriceTable(
  dayIndex: number,
  level: number,
): Array<{ id: SellGood['id']; name: string; price: number; limit: number; unit: string }> {
  return SELL_GOODS.map((good) => ({
    id: good.id,
    name: good.name,
    price: sellPrice(good, dayIndex),
    limit: dailyLimitFor(good, level),
    unit: good.unit,
  }));
}

/** 一袋高级种子能种几次（一袋 = 5 粒，够开 5 株/群）。 */
export const SEEDS_PER_BAG = 5;

/** 按平衡随机挑一种可种的物种（受站点类型限制由调用方过滤）。 */
export function pickSpeciesForMedium(medium: 'land' | 'water', seed: number): SpeciesId {
  const pool: SpeciesId[] =
    medium === 'water' ? ['cyanobacteria', 'diatom', 'ice_alga'] : ['grass', 'moss', 'lichen'];
  return pool[hashSeed(`species:${seed}`) % pool.length]!;
}
