/**
 * 粗粒度地表：72×36 经纬网格（5° 一格）。
 *
 * 只做「行星尺度的真实」：温度按纬度与海拔衰减，降水按哈得来环流与离海距离，
 * 群系由 (温度, 降水, 海拔) 三件事决定；不做季节、河流、洋流这些细结构。
 * 群系的分带参考行星自身的温度（而温度由轨道距离与恒星光度算出），
 * 所以宜居带内的行星自然会长出温带/热带，靠外的是冰盖与苔原，靠内的是沙漠与裸岩。
 */
import { fbm } from './noise.ts';
import {
  BIOME_LABELS,
  MOON_BIOME,
  STORM_WIND_MPS,
  isStormBiome,
  type BiomeId,
  type BiomeStat,
  type IsobaricSurface,
  type MoonSurface,
  type Planet,
  type TerrestrialSurface,
  type Star,
} from './model.ts';

export const GRID_LON = 72;
export const GRID_LAT = 36;
/** 相邻纬线的距离（km，近似球面）。 */
export const CELL_KM = (Math.PI * 6371) / GRID_LAT;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function hash01(seed: number, x: number, y: number): number {
  let h = (seed ^ Math.imul(x | 0, 2654435761) ^ Math.imul(y | 0, 40503)) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0;
  return ((h ^ (h >>> 13)) >>> 0) / 4294967296;
}

/**
 * 年平均温度的纬度分布（摄氏度）。
 *
 * 用「赤道—极地」线性梯度近似：梯度随转轴倾角变浅（倾角越大，极地拿到的年积温越多），
 * 再按 cos^1.5 分配。对地球（288 K、23.4°）给出赤道约 27 ℃、极地约 -23 ℃，与实况接近。
 */
export function latitudeTempC(meanTempK: number, latDeg: number, obliquityDeg: number): number {
  const obliquity = clamp(obliquityDeg, 0, 90);
  const span = 0.13 * (1 - 0.3 * (obliquity / 45));
  const equatorK = meanTempK * (1 + span);
  const poleK = meanTempK * (1 - span);
  const cosLat = Math.cos((clamp(latDeg, -90, 90) * Math.PI) / 180);
  const kelvin = poleK + (equatorK - poleK) * Math.pow(Math.max(0, cosLat), 1.5);
  return kelvin - 273.15;
}

/**
 * 生成地表时把整张纬度温度图整体平移到行星的 meanTempK 用的那个偏置（摄氏度）。
 * 地形补丁重算温度时要用同一个数，否则会和星卡上的均温对不上。
 */
export function surfaceTempBiasC(body: { meanTempK: number; obliquityDeg: number }): number {
  let sum = 0;
  let weight = 0;
  for (let i = 0; i < GRID_LAT; i += 1) {
    const latDeg = -90 + ((i + 0.5) * 180) / GRID_LAT;
    const w = Math.cos((latDeg * Math.PI) / 180);
    sum += latitudeTempC(body.meanTempK, latDeg, body.obliquityDeg) * w;
    weight += w;
  }
  const baseMean = sum / Math.max(1e-9, weight);
  return body.meanTempK - 273.15 - baseMean;
}

/** 哈得来环流近似：赤道湿、副热带干、中纬湿、极地干。返回 0.03…1 的相对强度。 */
export function hadleyStrength(latDeg: number): number {
  const abs = Math.abs(latDeg);
  const value =
    0.3 +
    0.8 * Math.exp(-Math.pow(latDeg / 13, 2)) +
    0.45 * Math.exp(-Math.pow((abs - 58) / 13, 2)) -
    0.32 * Math.exp(-Math.pow((abs - 27) / 9, 2));
  return clamp(value, 0.03, 1);
}

function oceanTargetFor(planet: Omit<Planet, 'surface'>, star: Star, seed: number): number {
  const byClimate: Record<Planet['climate'], number> = {
    frozen: 0.55,
    cold: 0.5,
    temperate: 0.62,
    hot: 0.22,
    scorched: 0.02,
  };
  let fraction = byClimate[planet.climate];
  if (planet.atmosphere === 'none') fraction *= 0.35;
  if (planet.atmosphere === 'thick') fraction *= 1.15;
  if (planet.atmosphere === 'hydrogen') fraction *= 0.5;
  if (planet.meanTempK > 373) fraction = 0.01;
  const inHz = planet.aAU >= star.hzInnerAU && planet.aAU <= star.hzOuterAU;
  if (inHz) fraction = Math.max(fraction, 0.45);
  return clamp(fraction * (0.85 + 0.3 * hash01(seed, 7, 11)), 0.02, 0.95);
}

/** 各群系的肥力底数（0…1）。海洋与冰盖几乎没有，森林与雨林最高。 */
const FERTILITY_BY_BIOME: Record<BiomeId, number> = {
  0: 0,
  1: 0.02,
  2: 0.2,
  3: 0.12,
  4: 0.06,
  5: 0.55,
  6: 0.5,
  7: 0.45,
  8: 0.7,
  9: 0.75,
  10: 0.8,
  11: 0.01,
  12: 0,
  13: 0,
  14: 0,
  15: 0,
  16: 0,
};

function biomeFor(ocean: boolean, tempC: number, precipMm: number, elevationM: number): BiomeId {
  if (ocean) return 0;
  if (tempC < -12) return 1;
  if (elevationM > 3500 && tempC < 10) return 3;
  if (tempC < 0) return 2;
  if (precipMm < 220 && tempC > 8) return 4;
  if (precipMm < 500) return 5;
  if (tempC < 6) return 7;
  if (tempC > 22 && precipMm > 1400) return 10;
  if (tempC > 17 && precipMm > 800) return 9;
  if (precipMm > 800) return 8;
  return 6;
}

/** 多源 BFS：每个陆地格子到最近海洋的步数（km，近似）。 */
function coastDistanceKm(ocean: boolean[][]): number[][] {
  const distance: number[][] = [];
  const queue: Array<[number, number]> = [];
  for (let i = 0; i < GRID_LAT; i += 1) {
    distance.push(new Array<number>(GRID_LON).fill(Number.POSITIVE_INFINITY));
    for (let j = 0; j < GRID_LON; j += 1) {
      if (ocean[i]![j]) {
        distance[i]![j] = 0;
        queue.push([i, j]);
      }
    }
  }
  const steps: Array<[number, number]> = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (let head = 0; head < queue.length; head += 1) {
    const [i, j] = queue[head]!;
    const next = distance[i]![j]! + CELL_KM;
    for (const [di, dj] of steps) {
      const ni = i + di;
      if (ni < 0 || ni >= GRID_LAT) continue;
      const nj = ((j + dj) % GRID_LON + GRID_LON) % GRID_LON;
      if (distance[ni]![nj]! <= next) continue;
      distance[ni]![nj] = next;
      queue.push([ni, nj]);
    }
  }
  return distance;
}

export function generateSurface(planet: Omit<Planet, 'surface'>, star: Star, noiseSeed: number): TerrestrialSurface {
  // 400 K 以上就当水全蒸干了：没有海洋，只有裸岩与沙。
  const oceanTarget = planet.meanTempK > 400 ? 0 : oceanTargetFor(planet, star, noiseSeed);

  const raw: number[][] = [];
  for (let i = 0; i < GRID_LAT; i += 1) {
    const row: number[] = [];
    for (let j = 0; j < GRID_LON; j += 1) {
      const x = (j / GRID_LON) * 6;
      const y = ((i + 0.5) / GRID_LAT) * 3;
      const continents = fbm(noiseSeed, x, y, 4, 6);
      const detail = fbm(noiseSeed + 977, x * 2.2, y * 2.2, 5, 13.2);
      row.push(continents * 0.78 + detail * 0.22);
    }
    raw.push(row);
  }

  const sorted = raw.flat().sort((a, b) => a - b);
  const seaIndex = clamp(Math.round(oceanTarget * (sorted.length - 1)), 1, sorted.length - 1);
  const sea = oceanTarget === 0 ? -1 : sorted[seaIndex]!;
  const landMax = 1200 + 2400 * Math.min(1.6, planet.radiusEarth) + 700 * Math.max(0, planet.gravity - 8);

  const elevationM: number[][] = [];
  const ocean: boolean[][] = [];
  for (let i = 0; i < GRID_LAT; i += 1) {
    const row: number[] = [];
    const oceanRow: boolean[] = [];
    for (let j = 0; j < GRID_LON; j += 1) {
      const value = raw[i]![j]!;
      if (value <= sea) {
        const depth = ((sea - value) / Math.max(1e-6, sea)) * 6200;
        row.push(-Math.max(2, Math.round(depth)));
        oceanRow.push(true);
      } else {
        const land = (value - sea) / Math.max(1e-6, 1 - sea);
        row.push(Math.round(Math.pow(land, 1.7) * landMax));
        oceanRow.push(false);
      }
    }
    elevationM.push(row);
    ocean.push(oceanRow);
  }

  const coastKm = coastDistanceKm(ocean);
  const biome: BiomeId[][] = [];
  let oceanCells = 0;
  let landCells = 0;
  let minElevationM = Number.POSITIVE_INFINITY;
  let maxElevationM = Number.NEGATIVE_INFINITY;
  let tempSum = 0;
  let weightSum = 0;
  const counts = new Map<BiomeId, number>();
  const weights = new Map<BiomeId, number>();

  // 先算一遍纬度温度，按面积加权求平均，再整体平移到行星的 meanTempK：
  // 这样「行星平均温度」与「地表均温」是同一个数，不会各说各话。
  const baseTempC: number[][] = [];
  let baseSum = 0;
  let baseWeight = 0;
  for (let i = 0; i < GRID_LAT; i += 1) {
    const latDeg = -90 + ((i + 0.5) * 180) / GRID_LAT;
    const weight = Math.cos((latDeg * Math.PI) / 180);
    const row: number[] = [];
    for (let j = 0; j < GRID_LON; j += 1) {
      const temp = latitudeTempC(planet.meanTempK, latDeg, planet.obliquityDeg);
      row.push(temp);
      baseSum += temp * weight;
      baseWeight += weight;
    }
    baseTempC.push(row);
  }
  const meanBias = planet.meanTempK - 273.15 - baseSum / Math.max(1e-9, baseWeight);

  const wetness: number[][] = [];
  const fertility: number[][] = [];
  const tungsten: number[][] = [];
  // 钨矿：山越高越可能有富矿，海洋永远是 0。用独立种子的低频噪声，
  // 所以它是「几片矿区」而不是满地图的椒盐点。
  const oreSeed = (noiseSeed ^ 0x9e3779b9) >>> 0;
  const oreField = (i: number, j: number): number =>
    fbm(oreSeed, j / 6, i / 6, 3, GRID_LON / 6);

  for (let i = 0; i < GRID_LAT; i += 1) {
    const rowBiomes: BiomeId[] = [];
    const rowWet: number[] = [];
    const rowFert: number[] = [];
    const rowTungsten: number[] = [];
    const latDeg = -90 + ((i + 0.5) * 180) / GRID_LAT;
    const weight = Math.cos((latDeg * Math.PI) / 180);
    for (let j = 0; j < GRID_LON; j += 1) {
      const elev = elevationM[i]![j]!;
      const isOcean = ocean[i]![j]!;
      const tempC = baseTempC[i]![j]! + meanBias - (isOcean ? 0 : 6.5 * (Math.max(0, elev) / 1000));
      const hadley = hadleyStrength(latDeg);
      const coast = Math.exp(-coastKm[i]![j]! / 1600);
      const cold = tempC < -5 ? 0.45 : 1;
      const precipMm = 2400 * hadley * (0.25 + 0.75 * coast) * cold;
      const id = isOcean && tempC < -2 ? 1 : biomeFor(isOcean, tempC, precipMm, elev);
      rowBiomes.push(id);

      // 水分：离海距离直接决定补给，再乘一点降水带（赤道湿、副热带干）。
      // grid 一个格子 555 km，所以「贴着海」的陆地 coastKm 本身就是一格（555）——先扣掉一格，
      // 再按 900 km 的尺度衰减，沿海陆地才有 0.6–1 的湿度，往内陆才逐渐变干。
      const inlandKm = Math.max(0, coastKm[i]![j]! - CELL_KM);
      const wet = isOcean ? 1 : clamp(Math.exp(-inlandKm / 900) * (0.6 + 0.4 * hadley), 0.02, 1);
      // 肥力：群系打底，水分加成，海拔打折。
      const altitude = clamp(1 - Math.max(0, elev) / 8000, 0.3, 1);
      const base = isOcean ? 0 : FERTILITY_BY_BIOME[id];
      const fert = isOcean ? 0 : clamp(base * (0.6 + 0.4 * wet) * altitude, 0.01, 1);
      rowWet.push(Math.round(wet * 100) / 100);
      rowFert.push(Math.round(fert * 100) / 100);
      // 0…500 份：噪声取平方，让「富矿区」更少、更明显；再乘海拔权重（4000 m 以上满权重）。
      const stretch = Math.pow(oreField(i, j), 2.2);
      const altitudeWeight = 0.25 + 0.75 * clamp(Math.max(0, elev) / 4000, 0, 1);
      rowTungsten.push(isOcean ? 0 : Math.round(clamp(stretch * altitudeWeight, 0, 1) * 500));

      counts.set(id, (counts.get(id) ?? 0) + 1);
      weights.set(id, (weights.get(id) ?? 0) + weight);
      if (isOcean) oceanCells += 1;
      else landCells += 1;
      minElevationM = Math.min(minElevationM, elev);
      maxElevationM = Math.max(maxElevationM, elev);
      tempSum += tempC * weight;
      weightSum += weight;
    }
    biome.push(rowBiomes);
    wetness.push(rowWet);
    fertility.push(rowFert);
    tungsten.push(rowTungsten);
  }

  const totalWeight = Math.max(1e-9, weightSum);
  const biomes: BiomeStat[] = [...counts.keys()]
    .map((id) => ({
      id,
      label: BIOME_LABELS[id],
      count: counts.get(id) ?? 0,
      fraction: (weights.get(id) ?? 0) / totalWeight,
    }))
    .sort((a, b) => b.fraction - a.fraction);

  return {
    model: 'coarse-grid-v1',
    kind: 'terrestrial',
    grid: { lon: GRID_LON, lat: GRID_LAT },
    seaLevelM: 0,
    oceanFraction: oceanCells / (GRID_LON * GRID_LAT),
    landFraction: landCells / (GRID_LON * GRID_LAT),
    minElevationM,
    maxElevationM,
    meanTempC: Math.round((tempSum / totalWeight) * 10) / 10,
    biomes,
    elevationM,
    biome,
    wetness,
    fertility,
    tungsten,
  };
}

function cellLatDeg(index: number): number {
  return -90 + (index + 0.5) * 5;
}

function cellLonDeg(index: number): number {
  return -180 + (index + 0.5) * 5;
}

function lonDiff(a: number, b: number): number {
  return (((a - b) % 360) + 540) % 360 - 180;
}

interface GreatSpot {
  lat: number;
  lon: number;
  majorHalfLat: number;
  majorHalfLon: number;
}

/**
 * 气态/冰巨星的「可活动区域」：等气压面（1 bar），群系表示风暴强度。
 *
 * 大结构是纬向的风带（belt/zone）——赤道附近平静、中纬是风暴带、副热带急流最强，
 * 再叠上经向的扰动与 1–2 个巨型风暴（类大红斑/大暗斑的椭圆斑）。
 * 冰巨星比气态巨星的斑少一点（大暗斑不那么稳定），其余同一条规则。
 */
export function generateIsobaricSurface(planet: Omit<Planet, 'surface'>, star: Star, noiseSeed: number): IsobaricSurface {
  const spotRoll = hash01(noiseSeed, 3, 4);
  const spotCount = planet.kind === 'gas' ? (spotRoll < 0.5 ? 2 : 1) : spotRoll < 0.45 ? 1 : 0;
  const spots: GreatSpot[] = [];
  for (let s = 0; s < spotCount; s += 1) {
    spots.push({
      lat: hash01(noiseSeed, 10 + s, 20) * 56 - 28,
      lon: hash01(noiseSeed, 30 + s, 40) * 360 - 180,
      majorHalfLat: 4 + hash01(noiseSeed, 50 + s, 60) * 6,
      majorHalfLon: 9 + hash01(noiseSeed, 70 + s, 80) * 12,
    });
  }

  const biome: BiomeId[][] = [];
  const counts = new Map<BiomeId, number>();
  const weights = new Map<BiomeId, number>();
  for (let i = 0; i < GRID_LAT; i += 1) {
    const latDeg = cellLatDeg(i);
    const weight = Math.cos((latDeg * Math.PI) / 180);
    const row: BiomeId[] = [];
    for (let j = 0; j < GRID_LON; j += 1) {
      const lonDeg = cellLonDeg(j);
      const abs = Math.abs(latDeg);
      const band = Math.floor(abs / 14);
      let level: BiomeId;
      if (abs < 5) level = 12;
      else if (band % 2 === 0) level = 14;
      else level = 13;
      const nearJet = (abs > 18 && abs < 28) || (abs > 42 && abs < 56);
      if (nearJet) level = 15;
      const cell = hash01(noiseSeed, i * GRID_LON + j, 997);
      if (level === 14 && cell > 0.8) level = 15;
      if (level === 13 && cell < 0.12) level = 12;
      for (const sp of spots) {
        const dLat = latDeg - sp.lat;
        const dLon = lonDiff(lonDeg, sp.lon);
        if (dLat * dLat / (sp.majorHalfLat * sp.majorHalfLat) + dLon * dLon / (sp.majorHalfLon * sp.majorHalfLon) <= 1) {
          level = 16;
        }
      }
      row.push(level);
      counts.set(level, (counts.get(level) ?? 0) + 1);
      weights.set(level, (weights.get(level) ?? 0) + weight);
    }
    biome.push(row);
  }

  const totalWeight = [...weights.values()].reduce((a, b) => a + b, 0);
  const biomes: BiomeStat[] = [...counts.keys()]
    .map((id) => ({
      id,
      label: BIOME_LABELS[id],
      count: counts.get(id) ?? 0,
      fraction: (weights.get(id) ?? 0) / Math.max(1e-9, totalWeight),
    }))
    .sort((a, b) => b.fraction - a.fraction);

  const stormIds = [...counts.keys()].filter(isStormBiome);
  const minWindMps = stormIds.length ? Math.min(...stormIds.map((id) => STORM_WIND_MPS[id].min)) : 0;
  const maxWindMps = stormIds.length ? Math.max(...stormIds.map((id) => STORM_WIND_MPS[id].max)) : 50;

  return {
    model: 'coarse-grid-v1',
    kind: 'isobaric',
    grid: { lon: GRID_LON, lat: GRID_LAT },
    pressureBar: 1,
    minWindMps,
    maxWindMps,
    meanTempC: Math.round((planet.meanTempK - 273.15) * 10) / 10,
    biomes,
    biome,
  };
}

/**
 * 卫星地表：固定「卫星」群系，无大气，比行星简单。
 * 表面温度取母行星的平衡温度（同一颗恒星光下，卫星没有温室也没有大气）。
 */
export function generateMoonSurface(parentEqTempK: number, noiseSeed: number): MoonSurface {
  void noiseSeed;
  const biome: BiomeId[][] = [];
  for (let i = 0; i < GRID_LAT; i += 1) {
    biome.push(new Array<BiomeId>(GRID_LON).fill(MOON_BIOME));
  }
  const total = GRID_LON * GRID_LAT;
  return {
    model: 'coarse-grid-v1',
    kind: 'moon',
    grid: { lon: GRID_LON, lat: GRID_LAT },
    meanTempC: Math.round((parentEqTempK - 273.15) * 10) / 10,
    biomes: [{ id: MOON_BIOME, label: BIOME_LABELS[MOON_BIOME], count: total, fraction: 1 }],
    biome,
  };
}
