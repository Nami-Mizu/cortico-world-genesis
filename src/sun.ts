/**
 * 太阳位置：给定天体、经纬度和「这一刻在该天体上是几点」，算太阳高度角、方位角与昼夜。
 *
 * 模型假设（够用，且与存档里的自转/倾角一致）：
 * - 自转轴与公转面夹角 = 转轴倾角 `obliquityDeg`，太阳赤纬按公转相位正弦变化；
 * - 本地太阳时 = 自转相位 + 经度（东经为正，每 15° 差一小时）；
 * - 母星在创世时刻被校准成「起点经度是午夜」，别的天体默认「历元时经度 0 是午夜」；
 * - 卫星按潮汐锁定处理：自转周期 = 公转周期，转轴倾角 0。
 *
 * 昼夜就是「太阳高度角 > 0」，不引入大气折射与地形遮挡。
 */
import type { Moon, Planet } from './model.ts';

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

export interface SunBody {
  id: string;
  /** 自转一圈的现实小时数（= 24 个天体自己的「时」）。 */
  rotationHours: number;
  /** 转轴倾角（度）。 */
  obliquityDeg: number;
  /** 公转周期（现实天），用来算太阳赤纬的季节变化。 */
  periodDays: number;
  /** 历元时刻（t=0）经度 0 处的本地太阳时（小时，0–24）。 */
  epochSolarHours: number;
}

export interface SunPosition {
  /** 太阳高度角（度），> 0 是白天。 */
  altitudeDeg: number;
  /** 方位角（度）：北 0、东 90、南 180、西 270。 */
  azimuthDeg: number;
  /** 太阳赤纬（度）。 */
  declinationDeg: number;
  /** 时角（度）：正午 0，上午为负，下午为正。 */
  hourAngleDeg: number;
  /** 本地太阳时（0–24）。 */
  localSolarHours: number;
  isDay: boolean;
}

export interface SunBodyOptions {
  /** 母星：把它的历元太阳时校准到「起点经度是午夜」。 */
  homeStartLonDeg?: number;
}

export function planetSunBody(planet: Planet, opts: SunBodyOptions = {}): SunBody {
  const epochSolarHours = opts.homeStartLonDeg === undefined
    ? 0
    : mod24(-opts.homeStartLonDeg / 15);
  return {
    id: planet.id,
    rotationHours: planet.rotationHours,
    obliquityDeg: planet.obliquityDeg,
    periodDays: planet.periodDays,
    epochSolarHours,
  };
}

export function moonSunBody(moon: Moon): SunBody {
  return {
    id: moon.id,
    rotationHours: moon.periodDays * 24,
    obliquityDeg: 0,
    periodDays: moon.periodDays,
    epochSolarHours: 0,
  };
}

function mod24(x: number): number {
  return ((x % 24) + 24) % 24;
}

/** 把「母星时」换算成该天体自己的「时」。 */
export function bodyHoursFromHome(homeHours: number, homeRealHoursPerPlanetHour: number, body: SunBody): number {
  const bodyRealHoursPerHour = body.rotationHours / 24;
  return homeHours * (homeRealHoursPerPlanetHour / bodyRealHoursPerHour);
}

/**
 * 太阳位置。`bodyHours` 是该天体自己的「时」（自转相位），`realDays` 是自创世起的现实天数。
 */
export function sunPosition(
  body: SunBody,
  latDeg: number,
  lonDeg: number,
  bodyHours: number,
  realDays: number,
): SunPosition {
  const localSolarHours = mod24(bodyHours + body.epochSolarHours + lonDeg / 15);
  const hourAngleDeg = (localSolarHours - 12) * 15;
  const declinationDeg = body.obliquityDeg * Math.sin((2 * Math.PI * realDays) / Math.max(body.periodDays, 1e-6));

  const lat = latDeg * RAD;
  const dec = declinationDeg * RAD;
  const ha = hourAngleDeg * RAD;
  const sinAlt = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(ha);
  const altitudeDeg = Math.asin(clamp(sinAlt, -1, 1)) * DEG;

  const cosAlt = Math.cos(altitudeDeg * RAD);
  const cosLat = Math.cos(lat);
  let azimuthDeg = 0;
  if (Math.abs(cosAlt * cosLat) > 1e-9) {
    const cosAz = (Math.sin(dec) - Math.sin(altitudeDeg * RAD) * Math.sin(lat)) / (cosAlt * cosLat);
    azimuthDeg = Math.acos(clamp(cosAz, -1, 1)) * DEG;
    if (hourAngleDeg > 0) azimuthDeg = 360 - azimuthDeg;
  }

  return {
    altitudeDeg,
    azimuthDeg,
    declinationDeg,
    hourAngleDeg,
    localSolarHours,
    isDay: altitudeDeg > 0,
  };
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

/** 赤道上的一昼夜正好半天——没有经纬度时按这个近似。 */
export const EQUATOR_DAY_FRACTION = 0.5;

/**
 * [fromHome, toHome] 这段母星时里，`latDeg/lonDeg` 这一点处在白天的母星时数。
 *
 * 按太阳高度角 > 0 判定，所以纬度、经度、季节都会影响结果：高纬冬天短、夏天长，
 * 极地会出现极昼极夜；经度让各地「天亮」错开。步长按区间均分（最多 2000 步），
 * 边界误差不超过半步——一母星时约 0.1–0.5 天，半步就是几分钟，够用。
 */
export function daylightHomeHoursAt(
  body: SunBody,
  homeRealHoursPerPlanetHour: number,
  fromHome: number,
  toHome: number,
  latDeg: number,
  lonDeg: number,
): number {
  if (!(toHome > fromHome)) return 0;
  const span = toHome - fromHome;
  const step = Math.max(0.02, span / 2000);
  let total = 0;
  let h = fromHome;
  let guard = 0;
  while (h < toHome && guard++ < 4000) {
    const next = Math.min(toHome, h + step);
    const mid = (h + next) / 2;
    const bodyHours = bodyHoursFromHome(mid, homeRealHoursPerPlanetHour, body);
    const realDays = (mid * homeRealHoursPerPlanetHour) / 24;
    if (sunPosition(body, latDeg, lonDeg, bodyHours, realDays).isDay) total += next - h;
    h = next;
  }
  return total;
}
