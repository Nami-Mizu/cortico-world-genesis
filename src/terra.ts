// 群系改变器：把一片半径 1500 km 的格子慢慢改造成温和气候。
//
// 规则（用户口径）：
// - 通电时慢慢变向目标气候；断电时慢慢退回原气候。
// - 群系属性是「瞬间启停」的：进度没到 1 之前还是原群系，到 1 的那一刻整格变成目标群系；
//   退回时同理，掉到 0 的那一刻整格变回原群系。
// - 功率按「正在改造的格子数」缩放：每格每母星时 1,250 kJ。
// - 任何环境都能工作，相当于超级温室：温度、湿度、肥力一起拉向温和值。

import type { BiomeId, TerrestrialSurface } from './model.ts';
import { GRID_LAT, GRID_LON } from './surface.ts';
import { isLand } from './site.ts';

export const BIOME_CHANGER_RADIUS_KM = 1_500;
export const TERRA_CELL_KJ_PER_HOUR = 1_250;
export const TERRA_CONVERT_HOME_HOURS = 24;
export const TERRA_REVERT_HOME_HOURS = 48;
export const TERRA_TARGET_TEMP_C = 18;
export const TERRA_TARGET_WETNESS = 0.62;
export const TERRA_TARGET_FERTILITY = 0.5;

/** 目标群系：湿的地方长温带林，其余是草原。海洋不动。 */
const TERRA_WET_BIOME: BiomeId = 9;
const TERRA_DRY_BIOME: BiomeId = 5;

export interface TerraCell {
  i: number;
  j: number;
  /** 0 = 原样，1 = 完全改造成目标气候。中间值是过渡态（气候在插值，群系还没翻）。 */
  p: number;
}

export type TerraMap = Record<string, TerraCell>;

/** 1.2.2 起键里带行星序号：同一个 (i,j) 在母星和别的行星上是两格。 */
export function terraKey(planetIndex: number, cellI: number, cellJ: number): string {
  return `p${planetIndex}:${cellI}:${cellJ}`;
}

/** 1.2.2 之前的旧键（没有行星前缀）；反序列化时迁到母星。 */
export function legacyTerraKey(cellI: number, cellJ: number): string {
  return `${cellI}:${cellJ}`;
}

export function terraProgress(terra: TerraMap | undefined, planetIndex: number, cellI: number, cellJ: number): number {
  const cell = terra?.[terraKey(planetIndex, cellI, cellJ)] ?? terra?.[legacyTerraKey(cellI, cellJ)];
  if (!cell || !Number.isFinite(cell.p)) return 0;
  return Math.min(1, Math.max(0, cell.p));
}

/** 面板地图用：某颗行星上所有改造中的格子（含已改完的，进度 1）。 */
export function terraCellsFor(terra: TerraMap | undefined, planetIndex: number): Array<{ i: number; j: number; p: number }> {
  const prefix = `p${planetIndex}:`;
  const out: Array<{ i: number; j: number; p: number }> = [];
  for (const [key, cell] of Object.entries(terra ?? {})) {
    if (!key.startsWith(prefix)) continue;
    if (!Number.isFinite(cell.p)) continue;
    out.push({ i: cell.i, j: cell.j, p: Math.min(1, Math.max(0, cell.p)) });
  }
  return out;
}

/** 半径内的所有格子（按格心距离算，经度环绕）。 */
export function cellsInRadius(
  surface: TerrestrialSurface,
  latDeg: number,
  lonDeg: number,
  radiusKm = BIOME_CHANGER_RADIUS_KM,
): Array<{ i: number; j: number }> {
  const out: Array<{ i: number; j: number }> = [];
  const kmPerDegLat = 111.2;
  const spanLat = radiusKm / kmPerDegLat;
  const cellDeg = 180 / GRID_LAT;
  const cosLat = Math.max(0.05, Math.cos((latDeg * Math.PI) / 180));
  const spanLon = radiusKm / (kmPerDegLat * cosLat);
  const i0 = Math.max(0, Math.floor((latDeg - spanLat + 90) / cellDeg));
  const i1 = Math.min(GRID_LAT - 1, Math.ceil((latDeg + spanLat + 90) / cellDeg));
  const jSpan = Math.ceil(spanLon / (360 / GRID_LON));
  const jCenter = Math.floor((((lonDeg + 180) % 360) + 360) % 360 / (360 / GRID_LON));
  for (let i = i0; i <= i1; i += 1) {
    const cellLat = -90 + (i + 0.5) * cellDeg;
    for (let dj = -jSpan; dj <= jSpan; dj += 1) {
      const j = ((jCenter + dj) % GRID_LON + GRID_LON) % GRID_LON;
      const cellLon = -180 + (j + 0.5) * (360 / GRID_LON);
      const dLat = (cellLat - latDeg) * kmPerDegLat;
      const dLon = angleDiffDeg(cellLon, lonDeg) * kmPerDegLat * cosLat;
      if (Math.hypot(dLat, dLon) <= radiusKm) out.push({ i, j });
    }
  }
  return out;
}

export function angleDiffDeg(a: number, b: number): number {
  let d = ((a - b) % 360 + 360) % 360;
  if (d > 180) d -= 360;
  return d;
}

export function targetBiomeFor(surface: TerrestrialSurface, cellI: number, cellJ: number): BiomeId {
  const wet = surface.wetness?.[cellI]?.[cellJ] ?? 0;
  return wet >= 0.75 ? TERRA_WET_BIOME : TERRA_DRY_BIOME;
}

/** 这一格现在实际是什么群系：进度满格才切换，掉光才退回。 */
export function effectiveBiome(
  surface: TerrestrialSurface,
  terra: TerraMap | undefined,
  planetIndex: number,
  cellI: number,
  cellJ: number,
): BiomeId {
  const original = (surface.biome[cellI]?.[cellJ] ?? 0) as BiomeId;
  const p = terraProgress(terra, planetIndex, cellI, cellJ);
  if (p <= 0) return original;
  if (p >= 1) return targetBiomeFor(surface, cellI, cellJ);
  // 过渡态：已经「通电」但还没改完——群系属性按已改造算，但它还不是新的。
  return original;
}

/** 气候插值：过渡态也能被温室效果覆盖，这样作物在改造过程中就开始受益。 */
export function terraClimate(
  surface: TerrestrialSurface,
  terra: TerraMap | undefined,
  planetIndex: number,
  cellI: number,
  cellJ: number,
  base: { tempC: number; wetness: number; fertility: number },
): { tempC: number; wetness: number; fertility: number; converted: boolean; traceCapFactor: number } {
  const p = terraProgress(terra, planetIndex, cellI, cellJ);
  if (p <= 0 || !isLand(surface, cellI, cellJ)) {
    return { ...base, converted: false, traceCapFactor: 1 };
  }
  const t = Math.min(1, p);
  const converted = p >= 1;
  const fert = base.fertility + (Math.max(TERRA_TARGET_FERTILITY, base.fertility) - base.fertility) * t;
  return {
    tempC: Math.round((base.tempC + (TERRA_TARGET_TEMP_C - base.tempC) * t) * 10) / 10,
    wetness: Math.round((base.wetness + (Math.max(TERRA_TARGET_WETNESS, base.wetness) - base.wetness) * t) * 100) / 100,
    // 改完的地多出来的那 0.1 肥力，就是「富集微量元素」的可见部分。
    fertility: Math.round(Math.min(1, fert + (converted ? 0.1 : 0)) * 100) / 100,
    converted,
    // 改造完成的格子，微量元素上限翻倍（见 game.ts 的 nutrientCapOf）。
    traceCapFactor: converted ? 2 : 1,
  };
}

export function terraSummary(terra: TerraMap | undefined): { converted: number; active: number } {
  let converted = 0;
  let active = 0;
  for (const cell of Object.values(terra ?? {})) {
    if (cell.p >= 1) converted += 1;
    else if (cell.p > 0) active += 1;
  }
  return { converted, active };
}
