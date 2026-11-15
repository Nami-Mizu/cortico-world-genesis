export type PlanetKind = 'rocky' | 'ice' | 'gas';

export type Climate = 'frozen' | 'cold' | 'temperate' | 'hot' | 'scorched';

export type Atmosphere = 'none' | 'thin' | 'thick' | 'hydrogen';

export interface GenesisSpec {
  /** 种子：64 位整数（number）或任意字符串（内部展开成 64 位）。 */
  seed: number | string;
  starMass: number;
  planetCount: number;
  maxMoons: number;
}

export interface Moon {
  id: string;
  name: string;
  massEarth: number;
  radiusEarth: number;
  orbitKm: number;
  periodDays: number;
  tideMeters: number;
  /** 卫星地表：固定「卫星」群系，无大气，比行星简单。 */
  surface: MoonSurface;
}

/**
 * 地表群系。数值就是 JSON 里存的 ids（稳定，不随文案变）。
 *
 * - 0 … 10 是岩石行星的地形群系；
 * - 11 是卫星的固定群系；
 * - 12 … 16 是气态/冰巨星的「可活动区域」——等气压面上的风暴强度。
 */
export type BiomeId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

export const BIOME_LABELS: Record<BiomeId, string> = {
  0: '海洋',
  1: '冰盖',
  2: '苔原',
  3: '高山',
  4: '沙漠',
  5: '草原',
  6: '稀树草原',
  7: '针叶林',
  8: '温带森林',
  9: '热带季雨林',
  10: '热带雨林',
  11: '卫星',
  12: '平静带',
  13: '微风带',
  14: '风暴带',
  15: '强风暴带',
  16: '巨型风暴',
};

/** 卫星的固定群系 id。 */
export const MOON_BIOME: BiomeId = 11;

/** 等气压面上每个风暴等级对应的风速范围（m/s）。 */
export const STORM_WIND_MPS: Record<12 | 13 | 14 | 15 | 16, { min: number; max: number }> = {
  12: { min: 0, max: 50 },
  13: { min: 50, max: 150 },
  14: { min: 150, max: 300 },
  15: { min: 300, max: 500 },
  16: { min: 500, max: 700 },
};

export function isStormBiome(id: BiomeId): id is 12 | 13 | 14 | 15 | 16 {
  return id >= 12 && id <= 16;
}

export function isTerrestrialBiome(id: BiomeId): id is 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 {
  return id <= 10;
}

export interface BiomeStat {
  id: BiomeId;
  label: string;
  count: number;
  fraction: number;
}

export type SurfaceKind = 'terrestrial' | 'isobaric' | 'moon';

export interface SurfaceGrid {
  lon: number;
  lat: number;
}

/** 岩石行星：地形 + 气候群系。 */
export interface TerrestrialSurface {
  model: 'coarse-grid-v1';
  kind: 'terrestrial';
  grid: SurfaceGrid;
  seaLevelM: number;
  oceanFraction: number;
  landFraction: number;
  minElevationM: number;
  maxElevationM: number;
  meanTempC: number;
  biomes: BiomeStat[];
  /** 行是纬度（-90 → +90），列是经度（-180 → +180），单位米。 */
  elevationM: number[][];
  /** 与 elevationM 同形状的群系 id。 */
  biome: BiomeId[][];
  /**
   * 水分（0…1，按离海距离与降水带算出）。站点能不能扎营、作物长得快慢都看它；
   * 离海约 150 km 以内算「湿」，是水生作物的最低要求。
   */
  wetness: number[][];
  /** 肥力（0…1，按群系与海拔算出）：影响生长速度与产量。 */
  fertility: number[][];
  /**
   * 钨矿含量（0…500 份）。创世时一次算好，写进存档——山越高越可能有矿，
   * 海洋永远是 0。采矿机挖的就是这一格；挖掉的量记在 game.json 的 mined 里。
   */
  tungsten: number[][];
}

/** 气态/冰巨星：等气压面上的「可活动区域」，群系 = 风暴强度。 */
export interface IsobaricSurface {
  model: 'coarse-grid-v1';
  kind: 'isobaric';
  grid: SurfaceGrid;
  /** 等气压面（bar）。 */
  pressureBar: number;
  minWindMps: number;
  maxWindMps: number;
  meanTempC: number;
  biomes: BiomeStat[];
  /** 与 grid 同形状的风暴强度 id（12 … 16）。 */
  biome: BiomeId[][];
}

/** 卫星：固定「卫星」群系，无大气。 */
export interface MoonSurface {
  model: 'coarse-grid-v1';
  kind: 'moon';
  grid: SurfaceGrid;
  meanTempC: number;
  biomes: BiomeStat[];
  /** 全部是 MOON_BIOME。 */
  biome: BiomeId[][];
}

/** 行星地表：岩石是地形，气态/冰是等气压面（风暴带）。 */
export type PlanetSurface = TerrestrialSurface | IsobaricSurface;

export interface Planet {
  id: string;
  name: string;
  kind: PlanetKind;
  aAU: number;
  periodDays: number;
  eccentricity: number;
  inclinationDeg: number;
  massEarth: number;
  radiusEarth: number;
  densityGcc: number;
  gravity: number;
  escapeKms: number;
  rotationHours: number;
  tidallyLocked: boolean;
  obliquityDeg: number;
  albedo: number;
  eqTempK: number;
  meanTempK: number;
  climate: Climate;
  atmosphere: Atmosphere;
  habitable: boolean;
  moons: Moon[];
  /** 所有行星都有地表：岩石是地形，气态/冰是等气压面（风暴带）。 */
  surface: PlanetSurface;
}

export interface Star {
  massSun: number;
  luminositySun: number;
  radiusSun: number;
  teffK: number;
  spectralClass: string;
  lifetimeGyr: number;
  hzInnerAU: number;
  hzOuterAU: number;
}

export interface StarSystem {
  spec: GenesisSpec;
  specHash: string;
  star: Star;
  planets: Planet[];
  generator: string;
}

export interface GenesisLimits {
  seed: { min: number; max: number };
  starMass: { min: number; max: number };
  planetCount: { min: number; max: number };
  maxMoons: { min: number; max: number };
}

export const GENESIS_LIMITS: GenesisLimits = {
  seed: { min: 0, max: Number.MAX_SAFE_INTEGER },
  starMass: { min: 0.15, max: 2.0 },
  planetCount: { min: 1, max: 8 },
  maxMoons: { min: 0, max: 4 },
};

export const GENESIS_DEFAULTS: GenesisSpec = {
  seed: 20261111,
  starMass: 1.0,
  planetCount: 3,
  maxMoons: 2,
};

function checkRange(name: string, value: number, min: number, max: number): void {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new RangeError(`${name} 必须是有限数字，收到 ${String(value)}`);
  }
  if (value < min || value > max) {
    throw new RangeError(`${name} 必须在 ${min} … ${max} 之间，收到 ${value}`);
  }
}

export function validateSpec(spec: GenesisSpec): void {
  if (typeof spec.seed === 'string') {
    if (spec.seed.length === 0) throw new RangeError('seed 不能是空字符串');
    if (spec.seed.length > 200) throw new RangeError('seed 太长了（最多 200 个字符）');
  } else {
    checkRange('seed', spec.seed, 0, Number.MAX_SAFE_INTEGER);
    if (!Number.isSafeInteger(spec.seed)) throw new RangeError('seed 必须是安全整数（≤ 2^53−1），或者一个字符串');
  }
  checkRange('starMass', spec.starMass, GENESIS_LIMITS.starMass.min, GENESIS_LIMITS.starMass.max);
  checkRange('planetCount', spec.planetCount, GENESIS_LIMITS.planetCount.min, GENESIS_LIMITS.planetCount.max);
  checkRange('maxMoons', spec.maxMoons, GENESIS_LIMITS.maxMoons.min, GENESIS_LIMITS.maxMoons.max);
  if (!Number.isInteger(spec.planetCount)) throw new RangeError('planetCount 必须是整数');
  if (!Number.isInteger(spec.maxMoons)) throw new RangeError('maxMoons 必须是整数');
}
