/**
 * 观星。
 *
 * 用户口径：能见度大于阈值后可以观星，看到恒星和星等小于阈值的行星/卫星；
 * 观星后 1 母星时内才能选择星际航行，去能看见的天体；可以自由往返母星，不需要观星。
 *
 * 遮挡：天体如果走到恒星背后（视线穿过恒星圆面），就算星等够亮也看不见。
 */
import type { HomeCalendar } from './clock.ts';
import { realDaysFor } from './clock.ts';
import { bodyMagnitude, starMagnitude } from './magnitude.ts';
import type { StarSystem } from './model.ts';
import { distanceAU, distancePointToSegment, orbitOf, positionAt, type Vec2 } from './orbit.ts';

/** 能见度阈值：大于它才能观星。 */
export const STARGAZE_VISIBILITY_THRESHOLD = 0.5;

/** 目视星等阈值：小于它的天体才看得见（6.0 ≈ 肉眼极限，游戏里可调小）。 */
export const NAKED_EYE_MAGNITUDE_LIMIT = 6.0;

/** 观星后可航行的窗口（母星时）。 */
export const STARGAZE_WINDOW_PLANET_HOURS = 1;

/** 天文单位换算成太阳半径（R☉ → AU）。 */
export const AU_PER_SOLAR_RADIUS = 0.00465047;

export interface VisibleBody {
  /** 天体 key：行星是 `p1`，卫星是 `p2-m1`。 */
  key: string;
  name: string;
  kind: 'star' | 'planet' | 'moon';
  magnitude: number;
  /** 观测者到它的直线距离（AU）。 */
  distanceAU: number;
}

export interface StargazeResult {
  star: VisibleBody;
  bodies: VisibleBody[];
  visibility: number;
}

export function canStargaze(visibility: number): boolean {
  return visibility > STARGAZE_VISIBILITY_THRESHOLD;
}

/** 视线是否穿过恒星（观测者→天体 这条线段离恒星中心太近）。 */
export function occludedByStar(observer: Vec2, body: Vec2, starRadiusAU: number): boolean {
  return distancePointToSegment({ x: 0, y: 0 }, observer, body) < starRadiusAU;
}

export interface StargazeInput {
  /** 当前所在地的天体 id（行星或卫星）。 */
  bodyId: string;
  /** 所在地所在行星的序号（1 起）。 */
  planetIndex: number;
  /** 当前所在地的能见度（卫星按 1.0）。 */
  visibility: number;
}

/** 算出某时刻能看见的天体；能见度不够返回 null。 */
export function stargaze(
  system: StarSystem,
  cal: HomeCalendar,
  totalPlanetHours: number,
  input: StargazeInput,
  limit = NAKED_EYE_MAGNITUDE_LIMIT,
): StargazeResult | null {
  if (!canStargaze(input.visibility)) return null;
  const host = system.planets[input.planetIndex - 1];
  if (!host) return null;
  const tDays = realDaysFor(cal, totalPlanetHours);
  const observerPos: Vec2 = positionAt(orbitOf(host), tDays);
  const starRadiusAU = system.star.radiusSun * AU_PER_SOLAR_RADIUS;
  const star: VisibleBody = {
    key: 'star',
    name: '恒星',
    kind: 'star',
    magnitude: starMagnitude(system.star, host.aAU),
    distanceAU: host.aAU,
  };
  const bodies: VisibleBody[] = [];
  for (const p of system.planets) {
    const pos = positionAt(orbitOf(p), tDays);
    if (p.id !== input.bodyId) {
      const magnitude = bodyMagnitude(system.star, p, pos, observerPos);
      if (magnitude < limit && !occludedByStar(observerPos, pos, starRadiusAU)) {
        bodies.push({ key: p.id, name: p.name, kind: 'planet', magnitude, distanceAU: distanceAU(observerPos, pos) });
      }
    }
    for (const m of p.moons) {
      if (m.id === input.bodyId) continue;
      // 卫星没有单独的反照率字段，按暗一点的值估（0.12 ≈ 月球的 0.12）。
      const magnitude = bodyMagnitude(system.star, { albedo: 0.12, radiusEarth: m.radiusEarth }, pos, observerPos);
      if (magnitude < limit) {
        bodies.push({ key: m.id, name: m.name, kind: 'moon', magnitude, distanceAU: distanceAU(observerPos, pos) });
      }
    }
  }
  bodies.sort((a, b) => a.magnitude - b.magnitude);
  return { star, bodies, visibility: input.visibility };
}

/** 观星结果给模型的文本；nameOf 负责把 key 换成「命名过」的名字或【未抵行星】/【未抵卫星】。 */
export function stargazeText(result: StargazeResult, nameOf: (key: string) => string = (k) => k): string {
  const lines = [`观星（能见度 ${result.visibility.toFixed(2)}）：`];
  lines.push(`- 恒星 ${nameOf('star')}：视星等 ${result.star.magnitude.toFixed(1)}`);
  if (result.bodies.length === 0) {
    lines.push('- 没有看得清的行星或卫星。');
    return lines.join('\n');
  }
  for (const b of result.bodies) {
    const kind = b.kind === 'planet' ? '行星' : '卫星';
    lines.push(`- ${kind} ${nameOf(b.key)}：视星等 ${b.magnitude.toFixed(1)} · 距离 ${b.distanceAU.toFixed(3)} AU`);
  }
  lines.push('（观星后 1 母星时内可以选择星际航行。）');
  return lines.join('\n');
}
