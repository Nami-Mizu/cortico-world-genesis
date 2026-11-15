/**
 * 星等。
 *
 * 用于观星：恒星永远可见；行星/卫星按「反射恒星光 + Lambertian 相位」算视星等，
 * 只有视星等小于阈值的才出现在观星结果里。
 *
 * 标定：用一个常量把「地球满相、1 AU 处看」校准到约 −3.99；木星约 −2.7。
 */
import type { Star } from './model.ts';
import { distanceAU, phaseCosine, type Vec2 } from './orbit.ts';

/** 太阳在 1 AU 处的视星等，作为整条标定链的锚点。 */
export const SUN_MAG_AT_1AU = -26.74;

const R_EARTH_AU = 4.2635e-5;

/** 反射光强的标定常数（把地球满相校准到 −3.99）。 */
const MAG_CAL = 0.686;

/** 恒星在某距离处的视星等。 */
export function starMagnitude(star: Star, atAU: number): number {
  const ratio = star.luminositySun / Math.max(atAU * atAU, 1e-12);
  return SUN_MAG_AT_1AU - 2.5 * Math.log10(Math.max(ratio, 1e-30));
}

/**
 * 行星/卫星的视星等。
 *
 * - `bodyPos` 是天体所在轨道位置（卫星与母行星同位置，卫星轨道半径远小于行星间距）；
 * - `observerPos` 是观测者所在位置；
 * - 太阳固定在原点。
 */
export function bodyMagnitude(
  star: Star,
  body: { albedo: number; radiusEarth: number },
  bodyPos: Vec2,
  observerPos: Vec2,
  sunPos: Vec2 = { x: 0, y: 0 },
): number {
  const dSun = Math.max(distanceAU(sunPos, bodyPos), 1e-9);
  const dObs = Math.max(distanceAU(observerPos, bodyPos), 1e-9);
  const rAU = body.radiusEarth * R_EARTH_AU;
  const phase = (1 + phaseCosine(bodyPos, observerPos, sunPos)) / 2;
  const ratio =
    (body.albedo * star.luminositySun * rAU * rAU * phase) / (MAG_CAL * dSun * dSun * dObs * dObs);
  return SUN_MAG_AT_1AU - 2.5 * Math.log10(Math.max(ratio, 1e-30));
}
