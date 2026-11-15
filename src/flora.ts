/**
 * 植物：两种生长模型、耐受与枯萎、收获。
 *
 * 这里只有纯函数——给定「一株/一群植物 + 环境 + 过去了多少母星时」，返回新的植物与事件。
 * 时间推进、存盘、事件推送都在 game.ts / world.ts 里，方便直接拿函数做断言。
 */
import { hashSeed, makeRng } from './rng.ts';

export type SpeciesId =
  | 'cyanobacteria'
  | 'diatom'
  | 'ice_alga'
  | 'grass'
  | 'moss'
  | 'lichen'
  | 'polar_moss'
  | 'hot_fern'
  | 'salt_grass'
  | 'deep_root';

export type ResourceId =
  | 'biomass'
  | 'phycocyanin'
  | 'silica'
  | 'antifreeze'
  | 'fiber'
  | 'lichen_acid'
  | 'sugar'
  | 'sulfide'
  | 'salt'
  | 'hardwood'
  | 'dry_food'
  | 'slag'
  | 'ammonia_gas'
  | 'ammonia_liquid'
  | 'methane_gas'
  | 'methane_liquid'
  | 'canned_ammonia'
  | 'ash';

export const RESOURCE_LABELS: Record<ResourceId, string> = {
  biomass: '生物质',
  phycocyanin: '藻蓝素',
  silica: '硅质壳',
  antifreeze: '抗冻蛋白',
  fiber: '纤维',
  lichen_acid: '地衣酸',
  sugar: '抗冻糖',
  sulfide: '硫化物',
  salt: '盐晶',
  hardwood: '硬木',
  dry_food: '干粮',
  slag: '尾矿',
  ammonia_gas: '氨气',
  ammonia_liquid: '液氨',
  methane_gas: '甲烷气',
  methane_liquid: '液态甲烷',
  canned_ammonia: '罐装液氨',
  ash: '草木灰',
};

export interface Genes {
  /** 最适温度（℃）。 */
  tempOptC: number;
  /** 最低水分需求（0…1）。 */
  waterNeed: number;
  /** 生长速率倍率（约 0.8 … 1.5）。 */
  growthRate: number;
  /** 产量倍率（约 0.8 … 1.5）。 */
  yield: number;
  /** 耐人工气候（0…0.5）：人工气候惩罚里能被作物自己扛掉的比例。老存档缺省 0。 */
  climateTolerance?: number;
}

export interface Species {
  id: SpeciesId;
  name: string;
  short: string;
  model: 'individual' | 'colony';
  medium: 'water' | 'land';
  tempMinC: number;
  tempOptC: number;
  tempMaxC: number;
  waterNeed: number;
  /** 一株成熟 / 一群倍增所需的母星时。 */
  cycleHomeHours: number;
  /** 成熟一株 / 饱和一群的干重（kg）。 */
  yieldKg: number;
  /** 主产物：大型植物多数是生物质，微生物是特殊资源。 */
  resource: ResourceId;
}

/** 每一「粒」的实际质量（kg）：大型植物是种子，微生物是菌种管里的一管。 */
export const SEED_MASS_KG: Record<SpeciesId, number> = {
  cyanobacteria: 0.0001,
  diatom: 0.0001,
  ice_alga: 0.0001,
  grass: 0.00003,
  moss: 0.000001,
  lichen: 0.000005,
  polar_moss: 0.000001,
  hot_fern: 0.000002,
  salt_grass: 0.00002,
  deep_root: 0.00008,
};

/** 袋子本身（密封袋 + 干燥剂 + 标签）的重量。 */
export const BAG_PACKAGING_KG = 0.02;

/** 一袋种子的实际重量：几粒种子加一个袋子，通常只有二十来克。 */
export function bagWeightKg(bag: { species: SpeciesId; count: number }): number {
  const mass = (SEED_MASS_KG[bag.species] ?? 0) * Math.max(0, bag.count);
  return Math.round((BAG_PACKAGING_KG + mass) * 100000) / 100000;
}

export const SPECIES: Record<SpeciesId, Species> = {
  cyanobacteria: {
    id: 'cyanobacteria',
    name: '蓝藻',
    short: '蓝藻',
    model: 'colony',
    medium: 'water',
    tempMinC: 10,
    tempOptC: 30,
    tempMaxC: 45,
    waterNeed: 0.5,
    cycleHomeHours: 6,
    yieldKg: 1.5,
    resource: 'phycocyanin',
  },
  diatom: {
    id: 'diatom',
    name: '硅藻',
    short: '硅藻',
    model: 'colony',
    medium: 'water',
    tempMinC: 2,
    tempOptC: 18,
    tempMaxC: 30,
    waterNeed: 0.5,
    cycleHomeHours: 8,
    yieldKg: 1.2,
    resource: 'silica',
  },
  ice_alga: {
    id: 'ice_alga',
    name: '冰藻',
    short: '冰藻',
    model: 'colony',
    medium: 'water',
    tempMinC: -20,
    tempOptC: -2,
    tempMaxC: 10,
    waterNeed: 0.45,
    cycleHomeHours: 14,
    yieldKg: 0.8,
    resource: 'antifreeze',
  },
  grass: {
    id: 'grass',
    name: '速生草',
    short: '草',
    model: 'individual',
    medium: 'land',
    tempMinC: 5,
    tempOptC: 22,
    tempMaxC: 35,
    waterNeed: 0.15,
    cycleHomeHours: 48,
    yieldKg: 8,
    resource: 'biomass',
  },
  moss: {
    id: 'moss',
    name: '苔藓',
    short: '苔',
    model: 'individual',
    medium: 'land',
    tempMinC: -10,
    tempOptC: 8,
    tempMaxC: 30,
    waterNeed: 0.3,
    cycleHomeHours: 60,
    yieldKg: 3,
    resource: 'fiber',
  },
  lichen: {
    id: 'lichen',
    name: '地衣',
    short: '衣',
    model: 'individual',
    medium: 'land',
    tempMinC: -40,
    tempOptC: 5,
    tempMaxC: 40,
    waterNeed: 0.05,
    cycleHomeHours: 120,
    yieldKg: 1.5,
    resource: 'lichen_acid',
  },
  // 下面四种只在极端环境里有产出：逼玩家离开母星去别处找。
  polar_moss: {
    id: 'polar_moss',
    name: '极地苔',
    short: '极苔',
    model: 'individual',
    medium: 'land',
    tempMinC: -60,
    tempOptC: -25,
    tempMaxC: 0,
    waterNeed: 0.2,
    cycleHomeHours: 90,
    yieldKg: 2,
    resource: 'sugar',
  },
  hot_fern: {
    id: 'hot_fern',
    name: '热泉蕨',
    short: '热蕨',
    model: 'individual',
    medium: 'land',
    tempMinC: 40,
    tempOptC: 60,
    tempMaxC: 80,
    waterNeed: 0.55,
    cycleHomeHours: 72,
    yieldKg: 4,
    resource: 'sulfide',
  },
  salt_grass: {
    id: 'salt_grass',
    name: '盐碱草',
    short: '盐草',
    model: 'individual',
    medium: 'land',
    tempMinC: 10,
    tempOptC: 30,
    tempMaxC: 55,
    waterNeed: 0.1,
    cycleHomeHours: 80,
    yieldKg: 3,
    resource: 'salt',
  },
  deep_root: {
    id: 'deep_root',
    name: '深根树',
    short: '深根',
    model: 'individual',
    medium: 'land',
    tempMinC: -5,
    tempOptC: 15,
    tempMaxC: 35,
    waterNeed: 0.35,
    cycleHomeHours: 160,
    yieldKg: 18,
    resource: 'hardwood',
  },
};

export const SPECIES_IDS: SpeciesId[] = [
  'cyanobacteria',
  'diatom',
  'ice_alga',
  'grass',
  'moss',
  'lichen',
  'polar_moss',
  'hot_fern',
  'salt_grass',
  'deep_root',
];

/** 光合放氧的种类：只有它们能给居所供氧（每 kg 干重长成，放 1.2 kg 氧）。 */
export const OXYGEN_PRODUCERS: SpeciesId[] = ['cyanobacteria', 'diatom', 'ice_alga'];

export type PlantStage = 'seed' | 'sprout' | 'vegetative' | 'flower' | 'ripe' | 'withering';

export const STAGE_LABELS: Record<PlantStage, string> = {
  seed: '种子',
  sprout: '萌发',
  vegetative: '营养生长',
  flower: '开花',
  ripe: '结实',
  withering: '枯萎',
};

export interface PlantRecord {
  id: string;
  species: SpeciesId;
  genes: Genes;
  kind: 'plant' | 'colony';
  plantedHomeHours: number;
  ageHomeHours: number;
  stage: PlantStage;
  /** 大型植物：成熟度 0…1；微生物：饱和度 0…1。 */
  progress: number;
  /** 当前干重（kg）。大型植物按成熟度推算，微生物就是种群量。 */
  biomassKg: number;
  /** 0…100。归零即死。 */
  health: number;
  /** 当前是否在耐受区间外（工具里报「它在应激」）。 */
  stress: boolean;
  harvests: number;
}

export interface ClimateSample {
  tempC: number;
  wetness: number;
  fertility: number;
  /** 站点四维养分库存；缺省时按「养分充足」处理（老存档/测试方便）。 */
  nutrients?: NutrientStock;
  /** 设定点温室造成的温差（℃）；缺省或 ≤15 时不算人工气候。 */
  artificialDeltaC?: number;
  /** 这台温室装了几座拟真环境核心：每座把人工气候惩罚减半。 */
  realismCores?: number;
}

/** 氮、磷、钾、微量元素，0…1 的库存。 */
export interface NutrientStock {
  n: number;
  p: number;
  k: number;
  trace: number;
}

export type NutrientId = keyof NutrientStock;

export const NUTRIENT_IDS: NutrientId[] = ['n', 'p', 'k', 'trace'];

export const NUTRIENT_LABELS: Record<NutrientId, string> = {
  n: '氮',
  p: '磷',
  k: '钾',
  trace: '微量元素',
};

export function emptyNutrients(): NutrientStock {
  return { n: 0, p: 0, k: 0, trace: 0 };
}

/**
 * 每种植物「够用」所需的养分水平（0…1）。
 * 生长因子取四维里最紧缺的那一维（Liebig 最小因子律）。
 */
export const NUTRIENT_NEEDS: Record<SpeciesId, NutrientStock> = {
  cyanobacteria: { n: 0.3, p: 0.15, k: 0.1, trace: 0.05 },
  diatom: { n: 0.25, p: 0.2, k: 0.1, trace: 0.05 },
  ice_alga: { n: 0.2, p: 0.15, k: 0.1, trace: 0.05 },
  grass: { n: 0.4, p: 0.2, k: 0.3, trace: 0.1 },
  moss: { n: 0.25, p: 0.15, k: 0.2, trace: 0.08 },
  lichen: { n: 0.1, p: 0.1, k: 0.1, trace: 0.05 },
  polar_moss: { n: 0.15, p: 0.1, k: 0.1, trace: 0.06 },
  hot_fern: { n: 0.35, p: 0.25, k: 0.2, trace: 0.12 },
  salt_grass: { n: 0.3, p: 0.15, k: 0.2, trace: 0.1 },
  deep_root: { n: 0.45, p: 0.3, k: 0.35, trace: 0.15 },
};

/** 收获 1 kg 干重带走多少养分。 */
export const NUTRIENT_REMOVAL_PER_KG: NutrientStock = { n: 0.0002, p: 0.00006, k: 0.00012, trace: 0.00003 };

/** 烧 1 kg 干生物质留下多少灰（kg）。 */
export const ASH_PER_KG = 0.03;

/** 1 kg 草木灰能补回多少养分——注意氮是 0（燃烧时几乎全跑了）。 */
export const ASH_NUTRIENTS_PER_KG: NutrientStock = { n: 0, p: 0.0013, k: 0.0026, trace: 0.0007 };

/** 1 kg 生物质堆肥能补回多少养分——同样不含氮。 */
export const COMPOST_NUTRIENTS_PER_KG: NutrientStock = { n: 0, p: 0.000055, k: 0.00011, trace: 0.000027 };

/** 一群蓝藻（活着）每小时给附近的陆地站点固定多少氮。氮只能靠它回来。 */
export const N_FIXATION_PER_COLONY_HOUR = 0.00006;

/**
 * 生长期每小时抽走的养分系数：某维 = `NUTRIENT_NEEDS[species][dim] × 这个数 × 生长因子`。
 * 草（需氮 0.4）满因子时约 0.0001 氮/时——满编 100 株种 48 小时约 0.48 氮，
 * 接近一格的上限（肥力），所以氮成了要经营的东西。
 */
export const NUTRIENT_DRAW_PER_HOUR = 0.00025;

/** 一丛蓝藻取多少湿重拌成藻肥，以及它换回的养分。 */
export const ALGAE_FERTILIZER_KG = 3;
export const ALGAE_FERTILIZER_N = 0.02;
export const ALGAE_FERTILIZER_K = 0.005;
export const ALGAE_FERTILIZER_KJ = 200;

/** 自交/杂交的门槛与产物。 */
export const BREED_MIN_PROGRESS = 0.6;
export const BREED_SELF_KJ = 300;
export const BREED_SELF_HOURS = 0.2;
export const BREED_CROSS_KJ = 800;
export const BREED_CROSS_HOURS = 0.5;
export const BREED_SELF_SEEDS = 3;
export const BREED_CROSS_SEEDS = 4;
/** 自交的近交衰退：每代产量基因 ×(1 − 这个数)，只退产量、不退速度。 */
export const INBREEDING_YIELD_DECAY = 0.04;

function clampGene(value: number, min: number, max: number): number {
  return Math.round(clamp(value, min, max) * 100) / 100;
}

/**
 * 自交：基因按母本抖 ±3%（突变），产量再乘 (1 − 近交衰退)。
 * 用种子（字符串）而不是随机数，保证同一个存档重放时结果一致。
 */
export function selfedGenes(parent: Genes, seed: string): Genes {
  const rng = makeRng(hashSeed(`self:${seed}`));
  const jitter = (base: number, amount: number): number => base * (1 + (rng.next() - 0.5) * 2 * amount);
  return {
    tempOptC: Math.round((parent.tempOptC + (rng.next() - 0.5) * 3) * 10) / 10,
    waterNeed: clampGene(jitter(parent.waterNeed, 0.03), 0, 1),
    growthRate: clampGene(jitter(parent.growthRate, 0.03), 0.4, 2),
    yield: clampGene(jitter(parent.yield, 0.03) * (1 - INBREEDING_YIELD_DECAY), 0.4, 2.5),
    climateTolerance: clampGene(parent.climateTolerance ?? 0, 0, 0.5),
  };
}

/**
 * 杂交：每个基因取双亲平均再抖 ±8%，另有 30% 概率直接继承「更好的那个」——
 * 让反复配种真的有机会把两个优点凑到一起。
 */
export function crossedGenes(a: Genes, b: Genes, seed: string): Genes {
  const rng = makeRng(hashSeed(`cross:${seed}`));
  const mix = (x: number, y: number, amount: number): number => {
    const avg = (x + y) / 2;
    const better = x === y ? x : (x > y ? x : y);
    const base = rng.next() < 0.3 ? better : avg;
    return base * (1 + (rng.next() - 0.5) * 2 * amount);
  };
  return {
    tempOptC: Math.round(((a.tempOptC + b.tempOptC) / 2 + (rng.next() - 0.5) * 3) * 10) / 10,
    waterNeed: clampGene(mix(a.waterNeed, b.waterNeed, 0.08), 0, 1),
    growthRate: clampGene(mix(a.growthRate, b.growthRate, 0.08), 0.4, 2),
    yield: clampGene(mix(a.yield, b.yield, 0.08), 0.4, 2.5),
    climateTolerance: clampGene(((a.climateTolerance ?? 0) + (b.climateTolerance ?? 0)) / 2, 0, 0.5),
  };
}

/** 按 Liebig 最小因子律算养分对生长的限制（0…1）。 */
export function nutrientFactor(plant: PlantRecord, climate: ClimateSample): number {
  const stock = climate.nutrients;
  if (!stock) return 1;
  const need = NUTRIENT_NEEDS[plant.species];
  let factor = 1;
  for (const id of NUTRIENT_IDS) {
    const limit = need[id];
    if (limit <= 0) continue;
    factor = Math.min(factor, clamp(stock[id] / limit, 0, 1));
  }
  return factor;
}

/** 最紧缺的那一维（用于工具报「你缺磷」）。 */
export function scarcestNutrient(plant: PlantRecord, climate: ClimateSample): NutrientId | null {
  const stock = climate.nutrients;
  if (!stock) return null;
  const need = NUTRIENT_NEEDS[plant.species];
  let worst: NutrientId | null = null;
  let worstRatio = 1;
  for (const id of NUTRIENT_IDS) {
    const limit = need[id];
    if (limit <= 0) continue;
    const ratio = clamp(stock[id] / limit, 0, 1);
    if (ratio < worstRatio) {
      worstRatio = ratio;
      worst = id;
    }
  }
  return worst;
}

/** 养分库存保留四位小数（单次收获只有千分之几，两位会看不出变化）。 */
export function addNutrients(
  stock: NutrientStock,
  delta: Partial<NutrientStock>,
  cap = 1,
  traceCap = cap,
): NutrientStock {
  const round4 = (v: number): number => Math.round(v * 10_000) / 10_000;
  return {
    n: round4(clamp(stock.n + (delta.n ?? 0), 0, cap)),
    p: round4(clamp(stock.p + (delta.p ?? 0), 0, cap)),
    k: round4(clamp(stock.k + (delta.k ?? 0), 0, cap)),
    // 群系改造完成的格子微量元素上限翻倍（富集效应）。
    trace: round4(clamp(stock.trace + (delta.trace ?? 0), 0, traceCap)),
  };
}

/** 按收获的干重扣养分。 */
export function removeNutrients(stock: NutrientStock, biomassKg: number): NutrientStock {
  return addNutrients(stock, {
    n: -NUTRIENT_REMOVAL_PER_KG.n * biomassKg,
    p: -NUTRIENT_REMOVAL_PER_KG.p * biomassKg,
    k: -NUTRIENT_REMOVAL_PER_KG.k * biomassKg,
    trace: -NUTRIENT_REMOVAL_PER_KG.trace * biomassKg,
  });
}

export interface GrowthEvent {
  type: 'ripe' | 'withered' | 'stressed';
  text: string;
}

/** 每株/每群的最小接种量（微生物）或种子重（大型，忽略不计）。 */
export const COLONY_INOCULUM_KG = 0.05;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * 种子袋在界面上的名字：「速生草（5–35℃）」。
 * 温度是物种的耐受区间——种下去应激，多半就是当前温度和它对不上。
 */
export function speciesTempLabel(species: SpeciesId): string {
  const spec = SPECIES[species];
  return `${spec.name}（${spec.tempMinC}–${spec.tempMaxC}℃）`;
}

/** 基因的随机变异：在物种基准上下浮动。 */
export function randomGenes(species: SpeciesId, seed: number): Genes {
  const base = SPECIES[species];
  const rng = makeRng(seed);
  const pick = (spread: number): number => 1 - spread + rng.next() * spread * 2;
  return {
    tempOptC: Math.round((base.tempOptC + (rng.next() - 0.5) * 4) * 10) / 10,
    waterNeed: round2(clamp(base.waterNeed * pick(0.25), 0, 1)),
    growthRate: round2(clamp(pick(0.2), 0.6, 1.6)),
    yield: round2(clamp(pick(0.2), 0.6, 1.6)),
    climateTolerance: round2(clamp(rng.next() * 0.35, 0, 0.5)),
  };
}

/** 高级种子：固定偏向耐寒与高产（货架上「固定好基因」的那袋）。 */
export function premiumGenes(species: SpeciesId, seed: number): Genes {
  const base = SPECIES[species];
  const rng = makeRng(seed ^ 0x9e3779b9);
  return {
    tempOptC: Math.round((base.tempOptC - 3 + (rng.next() - 0.5) * 1.5) * 10) / 10,
    waterNeed: round2(clamp(base.waterNeed * 0.85, 0, 1)),
    growthRate: round2(1.25 + rng.next() * 0.25),
    yield: round2(1.3 + rng.next() * 0.2),
    climateTolerance: round2(clamp(0.35 + rng.next() * 0.15, 0, 0.5)),
  };
}

/** 种子 id：物种 + 序号，便于商店与存档对上。 */
export function seedId(species: SpeciesId, index: number): string {
  return `${species}-${index}`;
}

export function newPlant(
  id: string,
  species: SpeciesId,
  genes: Genes,
  plantedHomeHours: number,
): PlantRecord {
  const spec = SPECIES[species];
  const colony = spec.model === 'colony';
  return {
    id,
    species,
    genes,
    kind: colony ? 'colony' : 'plant',
    plantedHomeHours,
    ageHomeHours: 0,
    stage: colony ? 'vegetative' : 'seed',
    progress: colony ? COLONY_INOCULUM_KG / spec.yieldKg : 0,
    biomassKg: colony ? COLONY_INOCULUM_KG : 0,
    health: 100,
    stress: false,
    harvests: 0,
  };
}

/** 温度与水分对生长的综合系数（0…1）。不在耐受区间内直接 0。 */
export function growthFactor(plant: PlantRecord, climate: ClimateSample): number {
  const spec = SPECIES[plant.species];
  const t = plant.genes.tempOptC;
  if (climate.tempC < spec.tempMinC || climate.tempC > spec.tempMaxC) return 0;
  const span = climate.tempC >= t ? Math.max(1e-6, spec.tempMaxC - t) : Math.max(1e-6, t - spec.tempMinC);
  const tempFactor = clamp(1 - Math.abs(climate.tempC - t) / span, 0, 1);
  const waterFactor = clamp((climate.wetness - plant.genes.waterNeed) / 0.5, 0, 1);
  if (waterFactor <= 0) return 0;
  const feed = nutrientFactor(plant, climate);
  if (feed <= 0) return 0;
  const artificial = artificialClimateFactor(climate, plant.genes.climateTolerance ?? 0);
  return clamp(tempFactor * waterFactor * feed * (0.6 + 0.4 * climate.fertility) * artificial, 0, 1);
}

export const ARTIFICIAL_DEADBAND_C = 15;
export const ARTIFICIAL_FULL_C = 30;
export const ARTIFICIAL_MAX_PENALTY = 0.3;

/**
 * 人工气候惩罚：温差 15℃ 以内不算「人工」，之后线性加重到 0.3；
 * 拟真环境核心每座把惩罚减半，作物自身的耐性（0…0.5）再把残余惩罚乘掉一部分。
 */
export function artificialClimateFactor(climate: ClimateSample, climateTolerance = 0): number {
  const delta = climate.artificialDeltaC ?? 0;
  if (delta <= ARTIFICIAL_DEADBAND_C) return 1;
  let penalty = ARTIFICIAL_MAX_PENALTY * Math.min(1, (delta - ARTIFICIAL_DEADBAND_C) / ARTIFICIAL_FULL_C);
  penalty *= 0.5 ** Math.max(0, climate.realismCores ?? 0);
  return clamp(1 - penalty * (1 - clamp(climateTolerance, 0, 0.5)), 0, 1);
}

function stageFor(progress: number): PlantStage {
  if (progress <= 0) return 'seed';
  if (progress < 0.15) return 'sprout';
  if (progress < 0.6) return 'vegetative';
  if (progress < 0.9) return 'flower';
  return 'ripe';
}

/**
 * 推进一段时间（母星时）。
 *
 * - 大型植物：成熟度按 `小时 / 周期 × 生长系数 × 基因速率` 累加，到 1 就是结实；
 * - 微生物：逻辑斯蒂增长，速率对应「倍增一次 = 一个周期」；
 * - 健康：在耐受区间内缓慢恢复，出区间按严重程度掉，归零就死（转成生物质，事件 wither）。
 */
export function advancePlant(plant: PlantRecord, climate: ClimateSample, hours: number): { plant: PlantRecord; events: GrowthEvent[] } {
  if (hours <= 0 || plant.health <= 0) return { plant, events: [] };
  const spec = SPECIES[plant.species];
  const events: GrowthEvent[] = [];
  const factor = growthFactor(plant, climate);
  const outside = climate.tempC < spec.tempMinC || climate.tempC > spec.tempMaxC || climate.wetness < plant.genes.waterNeed;
  const next: PlantRecord = { ...plant, ageHomeHours: plant.ageHomeHours + hours };

  let health = plant.health;
  if (outside) {
    const severity = Math.max(
      climate.tempC < spec.tempMinC ? (spec.tempMinC - climate.tempC) / 10 : 0,
      climate.tempC > spec.tempMaxC ? (climate.tempC - spec.tempMaxC) / 10 : 0,
      climate.wetness < plant.genes.waterNeed ? (plant.genes.waterNeed - climate.wetness) / 0.2 : 0,
    );
    health -= (2 + 5 * Math.min(2, severity)) * hours;
  } else if (factor < 0.35) {
    health -= 1.2 * hours;
  } else {
    health += 2 * hours;
  }
  health = clamp(health, 0, 100);
  next.health = Math.round(health * 10) / 10;
  next.stress = outside || factor < 0.35;

  if (next.health <= 0) {
    next.stage = 'withering';
    next.biomassKg = round2(next.biomassKg);
    events.push({
      type: 'withered',
      text: `一株${spec.name}枯萎了（${outside ? '环境超出它的耐受范围' : '长期应激'}）。`,
    });
    return { plant: next, events };
  }

  if (next.kind === 'colony') {
    const rate = Math.log(2) / spec.cycleHomeHours;
    const cap = spec.yieldKg * plant.genes.yield;
    let bio = next.biomassKg;
    const steps = Math.max(1, Math.ceil(hours / 0.5));
    const dt = hours / steps;
    for (let s = 0; s < steps; s += 1) {
      bio += rate * factor * bio * (1 - bio / Math.max(1e-6, cap)) * dt;
    }
    next.biomassKg = round2(clamp(bio, COLONY_INOCULUM_KG, cap));
    next.progress = next.biomassKg / Math.max(1e-6, cap);
  } else {
    const delta = (hours / spec.cycleHomeHours) * plant.genes.growthRate * factor;
    const progress = clamp(next.progress + delta, 0, 1);
    next.progress = progress;
    next.stage = stageFor(progress);
    next.biomassKg = round2(spec.yieldKg * plant.genes.yield * Math.pow(progress, 1.2));
    if (progress >= 1 && plant.stage !== 'ripe') {
      events.push({ type: 'ripe', text: `一株${spec.name}结实了，可以收了。` });
    }
  }

  if (next.stress && !plant.stress) {
    events.push({ type: 'stressed', text: `一株${spec.name}在应激——环境已经超出它的舒适范围。` });
  }
  return { plant: next, events };
}

export interface HarvestResult {
  plant: PlantRecord | null;
  biomassKg: number;
  resource: ResourceId;
  resourceKg: number;
  text: string;
}

/** 收获：大型植物一次收完（株就没了），微生物收走 60% 的存量（保留接种量）。 */
export function harvestPlant(plant: PlantRecord, fertility: number): HarvestResult {
  const spec = SPECIES[plant.species];
  if (plant.health <= 0) {
    return { plant: null, biomassKg: 0, resource: spec.resource, resourceKg: 0, text: '这一株已经死了，只能当生物质烧掉。' };
  }
  if (plant.kind === 'colony') {
    const harvestable = Math.max(0, plant.biomassKg - COLONY_INOCULUM_KG);
    const taken = round2(harvestable * 0.6);
    const max = spec.yieldKg * plant.genes.yield;
    const next: PlantRecord = { ...plant, biomassKg: round2(plant.biomassKg - taken), harvests: plant.harvests + 1 };
    next.progress = next.biomassKg / Math.max(1e-6, max);
    return {
      plant: next,
      biomassKg: taken,
      resource: spec.resource,
      resourceKg: round2(taken * 0.05),
      text: `收了一茬${spec.name}：${taken} kg 干重。`,
    };
  }
  if (plant.stage !== 'ripe') {
    return { plant, biomassKg: 0, resource: spec.resource, resourceKg: 0, text: `还没到结实，现在收只剩青苗。再等等。` };
  }
  const kg = round2(spec.yieldKg * plant.genes.yield * (0.7 + 0.3 * clamp(fertility, 0, 1)));
  return {
    plant: null,
    biomassKg: kg,
    resource: spec.resource,
    resourceKg: round2(kg * 0.05),
    text: `收了${kg} kg${spec.name}。`,
  };
}

/** 烧掉干生物质能发的电：15,000 kJ/kg × 25% 效率。 */
export const KJ_PER_KG_BIOMASS = 3_750;

export function burnKj(biomassKg: number): number {
  return Math.round(biomassKg * KJ_PER_KG_BIOMASS);
}

export function plantKeyFor(siteKey: string, index: number): string {
  return `${siteKey}:${index}`;
}

/** 便于存档/商店给种子一个稳定的短 id。 */
export function geneHash(genes: Genes): string {
  return String(hashSeed(`${genes.tempOptC}|${genes.waterNeed}|${genes.growthRate}|${genes.yield}`));
}
