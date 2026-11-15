import type { Atmosphere, Climate, GenesisSpec, Moon, Planet, PlanetKind, PlanetSurface, Star, StarSystem } from './model.ts';
import { GENESIS_DEFAULTS, GENESIS_LIMITS, validateSpec } from './model.ts';
import { hashSeed, makeRng, makeSeedRng, type Rng } from './rng.ts';
import * as physics from './physics.ts';
import { generateIsobaricSurface, generateMoonSurface, generateSurface } from './surface.ts';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

function spectralClass(teffK: number): string {
  if (teffK < 3700) return 'M';
  if (teffK < 5200) return 'K';
  if (teffK < 6000) return 'G';
  if (teffK < 7500) return 'F';
  if (teffK < 10000) return 'A';
  return 'B';
}

function logRange(rng: Rng, min: number, max: number): number {
  return Math.exp(rng.range(Math.log(min), Math.log(max)));
}

export function climateFor(meanTempK: number): Climate {
  if (meanTempK < 200) return 'frozen';
  if (meanTempK < 273) return 'cold';
  if (meanTempK < 323) return 'temperate';
  if (meanTempK < 373) return 'hot';
  return 'scorched';
}

function buildStar(massSun: number): Star {
  const luminositySun = physics.massLuminosity(massSun);
  const radiusSun = physics.massRadius(massSun);
  const teffK = physics.effectiveTempK(luminositySun, radiusSun);
  const hz = physics.habitableZone(luminositySun);
  return {
    massSun,
    luminositySun,
    radiusSun,
    teffK,
    spectralClass: spectralClass(teffK),
    lifetimeGyr: physics.lifetimeGyr(massSun, luminositySun),
    hzInnerAU: hz.innerAU,
    hzOuterAU: hz.outerAU,
  };
}

function pickOrbits(rng: Rng, star: Star, count: number): number[] {
  const lum = star.luminositySun;
  const inner = 0.12;
  const outer = 4.2 * Math.sqrt(lum);
  if (count === 1) return [Math.sqrt(lum) * rng.range(0.9, 1.1)];
  const span = Math.log(outer / inner);
  const orbits: number[] = [];
  for (let i = 0; i < count; i += 1) {
    const t = (i + 0.5) / count;
    const jitter = Math.exp(rng.gauss(0, 0.06));
    orbits.push(inner * Math.exp(span * t) * jitter);
  }
  orbits.sort((a, b) => a - b);
  for (let i = 1; i < orbits.length; i += 1) {
    if (orbits[i] < orbits[i - 1] * 1.2) orbits[i] = orbits[i - 1] * 1.2;
  }
  return orbits;
}

function buildMoons(
  rng: Rng,
  massEarth: number,
  radiusEarth: number,
  maxMoons: number,
  kind: PlanetKind,
  planetIndex: number,
  eqTempK: number,
): Moon[] {
  if (maxMoons <= 0) return [];
  let count = rng.int(0, maxMoons);
  if (kind === 'rocky' && massEarth < 0.5) count = 0;
  if (kind === 'gas' && rng.next() < 0.5) count = Math.min(maxMoons, count + 1);
  const moons: Moon[] = [];
  for (let i = 0; i < count; i += 1) {
    const fraction = kind === 'gas' ? rng.range(0.00005, 0.001) : rng.range(0.0005, 0.01);
    const mass = massEarth * fraction;
    const radius = Math.pow(fraction, 1 / 3) * radiusEarth;
    // 8–60 个行星半径：再近就会被潮汐撕碎，再远就飞出希尔球。
    const orbitKm = rng.range(8, 60) * radiusEarth * (physics.R_EARTH / 1000);
    const totalKg = (massEarth + mass) * physics.M_EARTH;
    const seconds = 2 * Math.PI * Math.sqrt(Math.pow(orbitKm * 1000, 3) / (physics.G * totalKg));
    const moon: Moon = {
      id: `p${planetIndex + 1}-m${i + 1}`,
      name: `${ROMAN[planetIndex]}-${String.fromCharCode(97 + i)}`,
      massEarth: mass,
      radiusEarth: radius,
      orbitKm,
      periodDays: seconds / 86400,
      tideMeters: physics.tideMeters(massEarth, radiusEarth, mass, orbitKm),
      surface: generateMoonSurface(eqTempK, Math.floor(rng.next() * 4294967296)),
    };
    moons.push(moon);
  }
  return moons;
}

function buildPlanet(rng: Rng, star: Star, aAU: number, index: number, maxMoons: number): Planet {
  const lum = star.luminositySun;
  const snowLine = 2.7 * Math.sqrt(lum);
  const roll = rng.next();
  let kind: PlanetKind;
  // 雪线以内不生成「冰」行星：那里最多是水世界，标成岩石更不容易误导。
  if (aAU < snowLine) kind = roll < 0.85 ? 'rocky' : 'gas';
  else kind = roll < 0.35 ? 'ice' : 'gas';

  const massEarth =
    kind === 'rocky' ? logRange(rng, 0.2, 6) : kind === 'ice' ? logRange(rng, 4, 25) : logRange(rng, 25, 320);
  const radiusEarth = physics.planetRadiusEarth(kind, massEarth);
  const albedo = kind === 'rocky' ? rng.range(0.12, 0.38) : kind === 'ice' ? rng.range(0.3, 0.6) : rng.range(0.28, 0.52);
  const periodDays = physics.orbitalPeriodDays(aAU, star.massSun);
  const eqTempK = physics.equilibriumTempK(lum, aAU, albedo);

  let atmosphere: Atmosphere = 'none';
  if (kind === 'gas') atmosphere = 'hydrogen';
  else if (massEarth >= 0.35 && eqTempK < 520) atmosphere = rng.next() < 0.6 ? 'thin' : 'thick';

  const greenhouse = atmosphere === 'thin' ? rng.range(4, 16) : atmosphere === 'thick' ? rng.range(14, 40) : 0;
  const meanTempK = eqTempK + greenhouse;
  const climate = climateFor(meanTempK);
  const tidallyLocked = periodDays < 20;
  const rotationHours = tidallyLocked ? periodDays * 24 : kind === 'gas' ? rng.range(8, 20) : rng.range(6, 48);
  const obliquityDeg = kind === 'gas' ? rng.range(0, 10) : rng.range(0, 45);
  const gravity = physics.surfaceGravity(massEarth, radiusEarth);
  const moons = buildMoons(rng, massEarth, radiusEarth, maxMoons, kind, index, eqTempK);
  const habitable = climate === 'temperate' && atmosphere !== 'none' && gravity >= 2 && gravity <= 20;
  const surfaceSeed = Math.floor(rng.next() * 4294967296);

  const planetBase = {
    id: `p${index + 1}`,
    name: `行星 ${ROMAN[index]}`,
    kind,
    aAU,
    periodDays,
    eccentricity: rng.range(0, 0.12),
    inclinationDeg: rng.range(0, 1.5),
    massEarth,
    radiusEarth,
    densityGcc: physics.bulkDensityGcc(massEarth, radiusEarth),
    gravity,
    escapeKms: physics.escapeVelocityKms(massEarth, radiusEarth),
    rotationHours,
    tidallyLocked,
    obliquityDeg,
    albedo,
    eqTempK,
    meanTempK,
    climate,
    atmosphere,
    habitable,
    moons,
  } as Omit<Planet, 'surface'>;

  // 岩石行星是地形；气态/冰巨星是等气压面上的风暴带（可活动区域）。
  const surface: PlanetSurface =
    kind === 'rocky'
      ? generateSurface(planetBase, star, surfaceSeed)
      : generateIsobaricSurface(planetBase, star, surfaceSeed);

  return { ...planetBase, surface };
}

export function createSystem(spec: GenesisSpec): StarSystem {
  validateSpec(spec);
  const normalized: GenesisSpec = {
    seed: spec.seed,
    starMass: spec.starMass,
    planetCount: spec.planetCount,
    maxMoons: spec.maxMoons,
  };
  const specHash = hashSeed(JSON.stringify(normalized)).toString(16).padStart(8, '0');
  // 数字种子沿用旧的 32 位流（老存档、老测试逐字节不变）；字符串种子走 64 位 sfc32。
  const rng = typeof normalized.seed === 'number'
    ? makeRng(hashSeed(`genesis:${specHash}`))
    : makeSeedRng(`genesis:${normalized.seed}:${specHash}`);
  const star = buildStar(normalized.starMass);
  const orbits = pickOrbits(rng, star, normalized.planetCount);
  const planets = orbits.map((orbit, index) => buildPlanet(rng, star, orbit, index, normalized.maxMoons));
  return { spec: normalized, specHash, star, planets, generator: 'genesis-m4' };
}

/**
 * 创世时由种子决定的形状：行星数 3–6，每颗行星最多 3 颗卫星。
 *
 * 这两个数以前是旋钮，现在收进种子里——「同一个种子永远是同一个星系」才算说全。
 * createSystem() 仍然按 spec 里的 planetCount / maxMoons 生成（老存档要能原样重算），
 * 推导只发生在入口（面板 / genesis_create）。
 */
export const GENESIS_SHAPE = { minPlanets: 3, maxPlanets: 6, maxMoons: 3 } as const;

export function deriveGenesisShape(seed: GenesisSpec['seed']): { planetCount: number; maxMoons: number } {
  // 加前缀是为了让「种子决定形状」与「种子决定内容」用两条独立的流，改一条不会连带改另一条。
  const key = typeof seed === 'number' ? `n:${seed}` : `s:${seed}`;
  const hash = hashSeed(`shape:${key}`);
  const span = GENESIS_SHAPE.maxPlanets - GENESIS_SHAPE.minPlanets + 1;
  return { planetCount: GENESIS_SHAPE.minPlanets + (hash % span), maxMoons: GENESIS_SHAPE.maxMoons };
}

export function describeGenesisMenu(): string {
  const l = GENESIS_LIMITS;
  return [
    '创世菜单（只在开局用一次，写进存档后锁定）：',
    `- seed 种子：0 … ${l.seed.max} 的整数，或者任意一句话/一串字符（推荐长字符串；默认 ${GENESIS_DEFAULTS.seed}）`,
    `- starMass 恒星质量：${l.starMass.min} … ${l.starMass.max} M☉（默认 ${GENESIS_DEFAULTS.starMass}；1 就是太阳）`,
    `行星数与卫星上限由种子决定：${GENESIS_SHAPE.minPlanets}–${GENESIS_SHAPE.maxPlanets} 颗行星，每颗最多 ${GENESIS_SHAPE.maxMoons} 颗卫星。`,
    '选定后调用 createSystem(spec)，结果不可重抽。',
  ].join('\n');
}

