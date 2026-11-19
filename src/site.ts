/**
 * 站点：1 km² 的一小块地，植物与建筑都在站点上。
 *
 * 一个 5° 的格子里最多 3 个站点；站点的气候取自它所在的格子（温度再按季节与海拔修正）。
 */
import { latitudeTempC, surfaceTempBiasC, GRID_LAT, GRID_LON } from './surface.ts';
import type { BiomeId, TerrestrialSurface } from './model.ts';
import { NUTRIENT_LABELS, type ClimateSample, type NutrientId, type NutrientStock } from './flora.ts';

const round2 = (v: number): number => Math.round(v * 100) / 100;

export const MAX_SITES_PER_CELL = 3;

/** 站点上那四库养分：氮、磷、钾、微量元素（0…1），上限是格子的 `fertility`。 */
export interface Site {
  /** `p3@12.4,-33.2` 之类，稳定可读。 */
  key: string;
  planetIndex: number;
  latDeg: number;
  lonDeg: number;
  cellI: number;
  cellJ: number;
  kind: 'land' | 'water';
  foundedHomeHours: number;
  /** 四维养分库存；收获会扣，草木灰/堆肥会补。 */
  nutrients: NutrientStock;
  /** 冰盖站点自带冰窖里的水（L，0…100）：融雪攒、灌溉喝，同时给作物加湿润度。 */
  waterL?: number;
}

/**
 * 不同群系的初始养分禀赋（乘在格子 `fertility` 上）。
 * 雨林高氮低磷、沙漠全面偏低、草原均衡——不同种子开局的难点不一样。
 */
export const NUTRIENT_ENDOWMENT: Record<BiomeId, { n: number; p: number; k: number; trace: number }> = {
  0: { n: 0, p: 0, k: 0, trace: 0 }, // 海洋
  1: { n: 0.05, p: 0.05, k: 0.05, trace: 0.05 }, // 冰盖
  2: { n: 0.6, p: 0.7, k: 0.8, trace: 0.6 }, // 苔原
  3: { n: 0.35, p: 0.5, k: 0.6, trace: 0.4 }, // 高山
  4: { n: 0.5, p: 0.6, k: 0.9, trace: 0.7 }, // 沙漠（钾不低、氮磷少）
  5: { n: 0.9, p: 0.8, k: 0.9, trace: 0.8 }, // 草原
  6: { n: 0.8, p: 0.7, k: 0.85, trace: 0.7 }, // 稀树草原
  7: { n: 0.75, p: 0.6, k: 0.8, trace: 0.7 }, // 针叶林
  8: { n: 0.9, p: 0.7, k: 0.85, trace: 0.75 }, // 温带森林
  9: { n: 1.0, p: 0.5, k: 0.8, trace: 0.7 }, // 热带季雨林
  10: { n: 1.0, p: 0.45, k: 0.8, trace: 0.7 }, // 热带雨林（高氮低磷）
  11: { n: 0, p: 0, k: 0, trace: 0 }, // 卫星
  12: { n: 0, p: 0, k: 0, trace: 0 },
  13: { n: 0, p: 0, k: 0, trace: 0 },
  14: { n: 0, p: 0, k: 0, trace: 0 },
  15: { n: 0, p: 0, k: 0, trace: 0 },
  16: { n: 0, p: 0, k: 0, trace: 0 },
};

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

/** 按格子算一个站点的初始养分（带一点确定性抖动，同格子不同站点略不同）。 */
export function endowmentFor(surface: TerrestrialSurface, latDeg: number, lonDeg: number): NutrientStock {
  const sample = sampleCell(surface, latDeg, lonDeg);
  const cap = clamp01(sample.fertility);
  const endowment = NUTRIENT_ENDOWMENT[sample.biome] ?? NUTRIENT_ENDOWMENT[0];
  const jitter = (offset: number): number => {
    const h = Math.abs(Math.sin((latDeg * 12.9898 + lonDeg * 78.233 + offset * 37.719) * 43758.5453));
    return 0.9 + 0.2 * (h - Math.floor(h));
  };
  return {
    n: round2(Math.min(cap, cap * endowment.n * jitter(1))),
    p: round2(Math.min(cap, cap * endowment.p * jitter(2))),
    k: round2(Math.min(cap, cap * endowment.k * jitter(3))),
    trace: round2(Math.min(cap, cap * endowment.trace * jitter(4))),
  };
}

/** 一行紧凑的养分读数：`氮 0.32 磷 0.05↓ 钾 0.60 微量 0.21`（↓ 表示低于该作物需求）。 */
export function nutrientsLine(stock: NutrientStock, needs?: NutrientStock): string {
  const parts: NutrientId[] = ['n', 'p', 'k', 'trace'];
  return parts
    .map((id) => {
      const short = needs && needs[id] > 0 && stock[id] < needs[id] ? '↓' : '';
      return `${NUTRIENT_LABELS[id]} ${stock[id].toFixed(2)}${short}`;
    })
    .join(' ');
}

export function cellIndexFor(latDeg: number, lonDeg: number): { i: number; j: number } {
  const i = Math.min(GRID_LAT - 1, Math.max(0, Math.floor(((latDeg + 90) / 180) * GRID_LAT)));
  const j = Math.min(GRID_LON - 1, Math.max(0, Math.floor(((lonDeg + 180) / 360) * GRID_LON)));
  return { i, j };
}

export function cellCenter(i: number, j: number): { latDeg: number; lonDeg: number } {
  return { latDeg: -90 + (i + 0.5) * (180 / GRID_LAT), lonDeg: -180 + (j + 0.5) * (360 / GRID_LON) };
}

export function siteKeyOf(planetIndex: number, latDeg: number, lonDeg: number): string {
  const lat = (Math.round(latDeg * 10) / 10).toFixed(1);
  const lon = (Math.round(lonDeg * 10) / 10).toFixed(1);
  return `p${planetIndex}@${lat},${lon}`;
}

export function isLand(surface: TerrestrialSurface, i: number, j: number): boolean {
  const elev = surface.elevationM[i]?.[j];
  const biome = surface.biome[i]?.[j];
  return typeof elev === 'number' && elev >= 0 && biome !== undefined && biome !== 0;
}

/**
 * 季节温度修正：转轴倾角越大、纬度越高，年内摆动越大。
 * 一年按 `yearHomeHours` 走一个完整正弦；相位取「年中为北半球夏至」。
 */
export function seasonalOffsetC(homeHours: number, yearHomeHours: number, obliquityDeg: number, latDeg: number): number {
  if (yearHomeHours <= 0) return 0;
  const amp = 0.45 * Math.max(0, obliquityDeg) * (Math.abs(latDeg) / 90);
  const phase = (2 * Math.PI * (homeHours % yearHomeHours)) / yearHomeHours;
  return Math.sin(phase) * amp * Math.sign(latDeg || 1);
}

/** 真正实现：需要海拔，所以直接从格子取。 */
export function siteTempAtCell(
  surface: TerrestrialSurface,
  cellI: number,
  cellJ: number,
  homeHours: number,
  yearHomeHours: number,
  obliquityDeg: number,
): number {
  const latDeg = -90 + (cellI + 0.5) * (180 / GRID_LAT);
  const elev = surface.elevationM[cellI]?.[cellJ] ?? 0;
  const base = latitudeTempC(surface.meanTempC + 273.15, latDeg, obliquityDeg) + surfaceTempBiasC({
    meanTempK: surface.meanTempC + 273.15,
    obliquityDeg,
  });
  const lapse = elev > 0 ? 6.5 * (elev / 1000) : 0;
  return base - lapse + seasonalOffsetC(homeHours, yearHomeHours, obliquityDeg, latDeg);
}

export interface CellSample {
  cellI: number;
  cellJ: number;
  elevationM: number;
  wetness: number;
  fertility: number;
  biome: BiomeId;
  land: boolean;
}

export function sampleCell(surface: TerrestrialSurface, latDeg: number, lonDeg: number): CellSample {
  const { i, j } = cellIndexFor(latDeg, lonDeg);
  return {
    cellI: i,
    cellJ: j,
    elevationM: surface.elevationM[i]?.[j] ?? 0,
    wetness: surface.wetness?.[i]?.[j] ?? 0,
    fertility: surface.fertility?.[i]?.[j] ?? 0,
    biome: surface.biome[i]?.[j] ?? 0,
    land: isLand(surface, i, j),
  };
}

export function climateAt(
  surface: TerrestrialSurface,
  latDeg: number,
  lonDeg: number,
  homeHours: number,
  yearHomeHours: number,
  obliquityDeg: number,
): ClimateSample {
  const sample = sampleCell(surface, latDeg, lonDeg);
  return {
    tempC: Math.round(siteTempAtCell(surface, sample.cellI, sample.cellJ, homeHours, yearHomeHours, obliquityDeg) * 10) / 10,
    wetness: sample.wetness,
    fertility: sample.fertility,
  };
}

/** 选站点的理由：返回 null 表示可以建。 */
export function siteRefusal(surface: TerrestrialSurface, latDeg: number, lonDeg: number, existing: Site[]): string | null {
  const sample = sampleCell(surface, latDeg, lonDeg);
  if (!sample.land) return '这里是水面（海洋），站点要建在陆地上。';
  // 冰盖可以建站（2.1.7）：自带 100 L 冰窖、下降风发电，苦但能活。
  const sameCell = existing.filter((site) => site.cellI === sample.cellI && site.cellJ === sample.cellJ);
  if (sameCell.length >= MAX_SITES_PER_CELL) {
    return `这一格已经有 ${MAX_SITES_PER_CELL} 个站点了（上限 ${MAX_SITES_PER_CELL} 个）。`;
  }
  return null;
}

/** 湿站点要求：wetness ≥ 0.5（约等于离海 150 km 以内），水生作物才种得活。 */
export const WET_SITE_WETNESS = 0.5;
