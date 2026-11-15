export const G = 6.6743e-11;
export const AU_M = 1.495978707e11;
export const M_SUN = 1.98892e30;
export const R_SUN = 6.957e8;
export const L_SUN = 3.828e26;
export const M_EARTH = 5.9722e24;
export const R_EARTH = 6.371e6;
export const T_SUN_EFF = 5772;
export const YEAR_DAYS = 365.256363;
export const EARTH_GRAVITY = 9.80665;
export const EARTH_ESCAPE_KMS = 11.186;
export const EARTH_DENSITY = 5.514;

/** 主序质量-光度关系：M<0.43 用低质量分支，其余 L ≈ M^3.5。 */
export function massLuminosity(massSun: number): number {
  if (massSun < 0.43) return 0.23 * Math.pow(massSun, 2.3);
  return Math.pow(massSun, 3.5);
}

/** 主序质量-半径近似 R ≈ M^0.8。 */
export function massRadius(massSun: number): number {
  return Math.pow(massSun, 0.8);
}

/** 斯特藩-玻尔兹曼：L = 4πR²σT⁴。 */
export function effectiveTempK(lumSun: number, radiusSun: number): number {
  return T_SUN_EFF * Math.pow(lumSun / (radiusSun * radiusSun), 0.25);
}

/** 燃料/光度近似：太阳 10 Gyr。 */
export function lifetimeGyr(massSun: number, lumSun: number): number {
  return 10 * (massSun / lumSun);
}

/** 保守宜居带（Kasting 近似）。 */
export function habitableZone(lumSun: number): { innerAU: number; outerAU: number } {
  const s = Math.sqrt(lumSun);
  return { innerAU: 0.95 * s, outerAU: 1.37 * s };
}

/** 开普勒第三定律：P[天] = 365.256 · √(a³/M)。 */
export function orbitalPeriodDays(aAU: number, massSun: number): number {
  return YEAR_DAYS * Math.sqrt((aAU * aAU * aAU) / massSun);
}

export const EQ_TEMP_COEFF = 278.6;

/** 平衡温度：T_eq = 278.6 · L^0.25 / √a · (1-A)^0.25 K。 */
export function equilibriumTempK(lumSun: number, aAU: number, albedo: number): number {
  return (EQ_TEMP_COEFF * Math.pow(lumSun, 0.25) * Math.pow(1 - albedo, 0.25)) / Math.sqrt(aAU);
}

/** 表面重力（g，地球 = 1）。 */
export function surfaceGravity(mEarth: number, rEarth: number): number {
  return EARTH_GRAVITY * (mEarth / (rEarth * rEarth));
}

/** 逃逸速度 km/s。 */
export function escapeVelocityKms(mEarth: number, rEarth: number): number {
  return EARTH_ESCAPE_KMS * Math.sqrt(mEarth / rEarth);
}

/** 平均密度 g/cm³。 */
export function bulkDensityGcc(mEarth: number, rEarth: number): number {
  return (EARTH_DENSITY * mEarth) / (rEarth * rEarth * rEarth);
}

/** 质量-半径关系（近似）：岩石 R=M^0.27；冰 1.35·M^0.3；气态 1.15·M^0.4。 */
export function planetRadiusEarth(kind: 'rocky' | 'ice' | 'gas', massEarth: number): number {
  if (kind === 'rocky') return Math.min(2.6, Math.max(0.4, Math.pow(massEarth, 0.27)));
  if (kind === 'ice') return Math.min(6.5, Math.max(1.4, 1.35 * Math.pow(massEarth, 0.3)));
  return Math.min(14, Math.max(3.5, 1.15 * Math.pow(massEarth, 0.4)));
}

/** 平衡潮汐高度（米）：h = 1.5·R_p·(m_m/m_p)·(R_p/r)³。 */
export function tideMeters(
  mPlanetEarth: number,
  rPlanetEarth: number,
  mMoonEarth: number,
  orbitKm: number,
): number {
  const rp = rPlanetEarth * R_EARTH;
  const r = orbitKm * 1000;
  return 1.5 * rp * (mMoonEarth / mPlanetEarth) * Math.pow(rp / r, 3);
}
