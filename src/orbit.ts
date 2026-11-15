/**
 * 圆轨道位置与距离。
 *
 * 生成器只存 aAU / periodDays，不存初相位；相位由行星 id 的哈希确定性地推出来，
 * 所以同一个星系在任何时候算出来的位置都一致。
 */
import type { Planet } from './model.ts';
import { hashSeed } from './rng.ts';

export interface Orbit {
  aAU: number;
  periodDays: number;
  /** 初相位（度，0 … 360）。 */
  phaseDeg: number;
}

export interface Vec2 {
  x: number;
  y: number;
}

export function orbitOf(p: Planet): Orbit {
  return {
    aAU: p.aAU,
    periodDays: p.periodDays,
    phaseDeg: (hashSeed(p.id) % 36000) / 100,
  };
}

/** 现实天 t 时的轨道位置（AU，日心平面）。 */
export function positionAt(o: Orbit, tDays: number): Vec2 {
  const deg = o.phaseDeg + 360 * (tDays / o.periodDays);
  const rad = (deg * Math.PI) / 180;
  return { x: o.aAU * Math.cos(rad), y: o.aAU * Math.sin(rad) };
}

export function distanceAU(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** 站在观测者位置看「行星相对太阳」的相位余弦：1 = 满相，−1 = 新月相。 */
export function phaseCosine(planetPos: Vec2, observerPos: Vec2, sunPos: Vec2 = { x: 0, y: 0 }): number {
  const v1x = sunPos.x - planetPos.x;
  const v1y = sunPos.y - planetPos.y;
  const v2x = observerPos.x - planetPos.x;
  const v2y = observerPos.y - planetPos.y;
  const n1 = Math.hypot(v1x, v1y);
  const n2 = Math.hypot(v2x, v2y);
  if (n1 === 0 || n2 === 0) return 1;
  return (v1x * v2x + v1y * v2y) / (n1 * n2);
}

/** 点到线段的最短距离（AU），用来判航线净空与「被太阳挡住」。 */
export function distancePointToSegment(p: Vec2, a: Vec2, b: Vec2): number {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const len2 = abx * abx + aby * aby;
  if (len2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * abx), p.y - (a.y + t * aby));
}
