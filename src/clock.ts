/**
 * 母星历法与游戏时钟。
 *
 * 用户口径：
 * - 母星（最宜居的那颗行星）的自转周期固定为「24 星球时 = 1 星球日」；
 * - 要算「1 星球时 = 多少现实世界的标准时」；
 * - 公转周期换算成「多少星球日」；
 * - 内部时间戳自定，但给模型的文本统一写成 `Y<母星名>年-D<母星名>日-H<母星名>时`，小时为浮点数。
 */
import type { Planet, StarSystem } from './model.ts';

/** 1 星球日固定 24 星球时。 */
export const HOURS_PER_PLANET_DAY = 24;

export interface HomeCalendar {
  homePlanetId: string;
  homePlanetName: string;
  /** 母星自转周期（现实小时）——也就是 1 星球日的真实长度。 */
  rotationHours: number;
  /** 母星公转周期（现实天）。 */
  orbitDays: number;
  /** 1 星球时 = 多少现实小时。 */
  realHoursPerPlanetHour: number;
  /** 1 星球年 = 多少星球日。 */
  planetDaysPerYear: number;
}

/**
 * 宜居度评分：只用来在创世后挑「最宜居的星球」当母星。
 * 越高越好；只是一个排序工具，不参与存档。
 */
export function habitabilityScore(p: Planet): number {
  const temp = -Math.abs(p.meanTempK - 288);
  const gravity = -Math.abs(p.gravity / 9.80665 - 1) * 20;
  const rocky = p.kind === 'rocky' ? 100 : -200;
  const ocean = p.surface.kind === 'terrestrial' ? (p.surface.oceanFraction > 0.05 ? 40 : -40) : -80;
  const air = p.atmosphere === 'none' ? -60 : 0;
  const habitable = p.habitable ? 200 : 0;
  return rocky + temp + gravity + ocean + air + habitable;
}

export function mostHabitable(system: StarSystem): Planet {
  let best = system.planets[0]!;
  for (const p of system.planets) {
    if (habitabilityScore(p) > habitabilityScore(best)) best = p;
  }
  return best;
}

/** 只依赖自转与公转周期，测试里可以直接传一个最小对象。 */
export interface CalendarSource {
  id?: string;
  rotationHours: number;
  periodDays: number;
}

export function calendarFor(home: CalendarSource, name: string): HomeCalendar {
  return {
    homePlanetId: home.id ?? name,
    homePlanetName: name,
    rotationHours: home.rotationHours,
    orbitDays: home.periodDays,
    realHoursPerPlanetHour: home.rotationHours / HOURS_PER_PLANET_DAY,
    planetDaysPerYear: (home.periodDays * HOURS_PER_PLANET_DAY) / home.rotationHours,
  };
}

/** 星球时 → 现实小时。 */
export function realHoursFor(cal: HomeCalendar, planetHours: number): number {
  return planetHours * cal.realHoursPerPlanetHour;
}

/** 星球时 → 现实天（轨道位置要用现实天推进）。 */
export function realDaysFor(cal: HomeCalendar, planetHours: number): number {
  return realHoursFor(cal, planetHours) / 24;
}

/**
 * 把「自创世起的星球时」格式化成给模型的文本。
 *
 * 年 = 完整公转圈数；日 = 本年内的星球日（0 起）；时 = 当日内的星球时（浮点，0 … 24）。
 */
export function formatTime(cal: HomeCalendar, totalPlanetHours: number): string {
  const h = Math.max(0, totalPlanetHours);
  const totalDays = h / HOURS_PER_PLANET_DAY;
  const year = Math.floor(totalDays / cal.planetDaysPerYear);
  const day = Math.floor(totalDays - year * cal.planetDaysPerYear);
  const hour = h - Math.floor(h / HOURS_PER_PLANET_DAY) * HOURS_PER_PLANET_DAY;
  const n = cal.homePlanetName;
  return `${year}${n}年-${day}${n}日-${hour.toFixed(1)}${n}时`;
}

export function describeCalendar(cal: HomeCalendar): string {
  const n = cal.homePlanetName;
  return [
    `母星「${n}」的历法：`,
    `- 1 ${n}日 = 24 ${n}时 = ${cal.rotationHours.toFixed(2)} 现实小时`,
    `- 1 ${n}时 = ${cal.realHoursPerPlanetHour.toFixed(3)} 现实小时（${(cal.realHoursPerPlanetHour * 60).toFixed(1)} 现实分钟）`,
    `- 1 ${n}年 = ${cal.planetDaysPerYear.toFixed(1)} ${n}日 = ${cal.orbitDays.toFixed(1)} 现实天`,
  ].join('\n');
}
