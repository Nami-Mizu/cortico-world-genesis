/**
 * 移动与航行的时间开销，以及地表能不能走过去。
 *
 * - 地表：600 km / 星球时（乘以地形系数）；
 * - 星际：2 AU / 星球日。
 *
 * 地形系数只做「同一段路在不同地面上花的时间不一样」，不做寻路：
 * 直线采样，遇到过不去的地面就拒绝，并告诉模型是哪一格挡住的。
 */

import type { TerrestrialSurface } from './model.ts';

export const SURFACE_SPEED_KM_PER_PLANET_HOUR = 600;
export const INTERSTELLAR_SPEED_AU_PER_PLANET_DAY = 2;

/** 冰盖上走不快。 */
export const ICE_SPEED_FACTOR = 0.5;
/** 沙漠、苔原也慢一点。 */
export const DESERT_SPEED_FACTOR = 1.3;
export const TUNDRA_SPEED_FACTOR = 1.2;
/** 修好机动核心后过海的速度系数（修好前不能过海）。 */
export const OCEAN_SPEED_FACTOR = 0.3;

/** 走不过去的高度与落差。 */
export const MAX_WALK_ELEVATION_M = 4_000;
export const MAX_WALK_STEP_M = 1_500;

/** 采样步长：大约半格（一格 5°）。 */
const SAMPLE_STEP_DEG = 2;

const EARTH_RADIUS_KM = 6371;

/** 地表两点的大圆距离（km）；半径默认地球，行星/卫星可传自己的半径。 */
export function surfaceDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  radiusKm = EARTH_RADIUS_KM,
): number {
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) ** 2;
  return 2 * radiusKm * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** 星际航行要花多少星球日。 */
export function interstellarPlanetDays(distanceAU: number): number {
  return distanceAU / INTERSTELLAR_SPEED_AU_PER_PLANET_DAY;
}

/** 星际航行要花多少星球时。 */
export function interstellarPlanetHours(distanceAU: number): number {
  return interstellarPlanetDays(distanceAU) * 24;
}

// —— 地表可通行性 ——

export interface StepCheck {
  ok: boolean;
  /** 过不去的原因（ok 为 true 时为空）。 */
  reason?: string;
  /** 速度系数：越小越慢；过不去时是 0。 */
  factor: number;
}

// 群系 id 的定义在 model.ts：0 海、1 冰盖、2 苔原、3 高山、4 沙漠、5 草原……
function biomeSpeedFactor(biome: number): number {
  if (biome === 0) return OCEAN_SPEED_FACTOR;
  if (biome === 1) return ICE_SPEED_FACTOR;
  if (biome === 2) return TUNDRA_SPEED_FACTOR;
  if (biome === 3) return ICE_SPEED_FACTOR; // 高山（能走的那部分）也慢
  if (biome === 4) return DESERT_SPEED_FACTOR;
  return 1;
}

const BIOME_NAME: Record<number, string> = {
  0: '海',
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
};

/** 一格能不能走：海要机动核心，高山与断崖一律不行。 */
export function stepWalkabilityAt(
  surface: TerrestrialSurface,
  latDeg: number,
  lonDeg: number,
  mobilityCore: boolean,
  prevElevationM?: number,
): StepCheck {
  const rows = surface.biome.length;
  const cols = surface.biome[0]?.length ?? 0;
  const j = Math.min(rows - 1, Math.max(0, Math.floor(((latDeg + 90) / 180) * rows)));
  const i = Math.min(cols - 1, Math.max(0, Math.floor(((lonDeg + 180) / 360) * cols)));
  const biome = surface.biome[j]?.[i] ?? 0;
  const elev = surface.elevationM[j]?.[i] ?? 0;
  if (biome === 0) {
    if (!mobilityCore) {
      return { ok: false, reason: `这里是${BIOME_NAME[0]}（没有陆地可走）。机动核心还没修好，过不去。`, factor: 0 };
    }
    return { ok: true, factor: biomeSpeedFactor(biome) };
  }
  if (elev > MAX_WALK_ELEVATION_M) {
    return { ok: false, reason: `这里海拔 ${elev.toFixed(0)} m，太高了，走不过去。`, factor: 0 };
  }
  if (prevElevationM !== undefined && Math.abs(elev - prevElevationM) > MAX_WALK_STEP_M) {
    return {
      ok: false,
      reason: `这一段有 ${Math.abs(elev - prevElevationM).toFixed(0)} m 的落差（断崖），走不过去。`,
      factor: 0,
    };
  }
  return { ok: true, factor: biomeSpeedFactor(biome) };
}

export interface PathCheck {
  ok: boolean;
  /** 过不去时的说明（含挡路的坐标）。 */
  reason?: string;
  /** 整段路的速度系数（取最慢的一段）。 */
  factor: number;
}

/**
 * 沿大圆直线采样，判断整段路能不能走，并给出整段的平均速度系数。
 * 只沿直线走；绕路要自己换坐标（这一版不做寻路）。
 */
export function surfacePathCheck(
  surface: TerrestrialSurface,
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  mobilityCore: boolean,
): PathCheck {
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dLat), Math.abs(dLon)) / SAMPLE_STEP_DEG));
  let worst = 1;
  let prevElev: number | undefined;
  for (let s = 1; s <= steps; s++) {
    const t = s / steps;
    const lat = lat1 + dLat * t;
    const lon = lon1 + dLon * t;
    const check = stepWalkabilityAt(surface, lat, lon, mobilityCore, prevElev);
    if (!check.ok) {
      const why = (check.reason ?? '地形挡路').replace(/。$/, '');
      return {
        ok: false,
        reason: `走到 ${lat.toFixed(1)}°, ${lon.toFixed(1)}° 这里过不去：${why}。换个坐标，绕开它。`,
        factor: 0,
      };
    }
    worst = Math.min(worst, check.factor);
    prevElev = (() => {
      const rows = surface.biome.length;
      const cols = surface.biome[0]?.length ?? 0;
      const j = Math.min(rows - 1, Math.max(0, Math.floor(((lat + 90) / 180) * rows)));
      const i = Math.min(cols - 1, Math.max(0, Math.floor(((lon + 180) / 360) * cols)));
      return surface.elevationM[j]?.[i];
    })();
  }
  return { ok: true, factor: worst };
}

/** 带地形系数的地表耗时。 */
export function surfaceMoveHoursFor(distanceKm: number, factor: number): number {
  return distanceKm / (SURFACE_SPEED_KM_PER_PLANET_HOUR * Math.max(0.01, factor));
}

/** 平地（系数 1）的地表耗时，保留旧名字。 */
export function surfaceMovePlanetHours(distanceKm: number): number {
  return surfaceMoveHoursFor(distanceKm, 1);
}
