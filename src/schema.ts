import { GENESIS_LIMITS } from './model.ts';

/**
 * 存档格式的运行时校验。
 *
 * JSON 是这套东西唯一对外的接口：面板、工具、CLI、以后的 M3 步行都读它。
 * 所以这里把「什么样的 JSON 才算一份合法存档」写死在代码里，而不是只在文档里。
 * 校验失败返回带路径的问题列表；`assertSave` 抛第一条给人类看。
 */

export interface SchemaIssue {
  path: string;
  message: string;
}

const CLIMATES = ['frozen', 'cold', 'temperate', 'hot', 'scorched'];
const ATMOSPHERES = ['none', 'thin', 'thick', 'hydrogen'];
const KINDS = ['rocky', 'ice', 'gas'];
const BIOME_IDS = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
const TERRESTRIAL_IDS = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
const STORM_IDS = new Set([12, 13, 14, 15, 16]);
const SURFACE_KINDS = ['terrestrial', 'isobaric', 'moon'];
const GRID_LON = 72;
const GRID_LAT = 36;
const SURFACE_MODEL = 'coarse-grid-v1';

type Obj = Record<string, unknown>;

function isObj(value: unknown): value is Obj {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNum(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isStr(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function validateGrid(surface: Obj, base: string, add: (path: string, message: string) => void): void {
  const grid = surface.grid;
  if (!isObj(grid) || grid.lon !== GRID_LON || grid.lat !== GRID_LAT) {
    add(`${base}.grid`, `应当是 { lon: ${GRID_LON}, lat: ${GRID_LAT} }`);
  }
}

function validateBiomes(surface: Obj, base: string, allowed: Set<number>, add: (path: string, message: string) => void): void {
  const biomes = surface.biomes;
  if (!Array.isArray(biomes) || biomes.length === 0) {
    add(`${base}.biomes`, '应当是非空数组');
  } else {
    biomes.forEach((entry, index) => {
      const path = `${base}.biomes[${index}]`;
      if (!isObj(entry)) {
        add(path, '应当是对象');
        return;
      }
      if (!isNum(entry.id) || !allowed.has(entry.id)) {
        add(`${path}.id`, `应当是 ${[...allowed].join(' / ')} 的整数`);
      }
      if (!isStr(entry.label)) add(`${path}.label`, '应当是非空字符串');
      if (!isNum(entry.count) || !Number.isInteger(entry.count) || entry.count < 0) add(`${path}.count`, '应当是非负整数');
      if (!isNum(entry.fraction) || entry.fraction < 0 || entry.fraction > 1) add(`${path}.fraction`, '应当在 0 … 1');
    });
  }

  const biome = surface.biome;
  if (!Array.isArray(biome) || biome.length !== GRID_LAT) {
    add(`${base}.biome`, `应当是 ${GRID_LAT} 行的二维数组`);
  } else {
    biome.forEach((row, index) => {
      const path = `${base}.biome[${index}]`;
      if (!Array.isArray(row) || row.length !== GRID_LON) {
        add(path, `应当是 ${GRID_LON} 个群系 id`);
        return;
      }
      if (!row.every((cell) => isNum(cell) && allowed.has(cell))) {
        add(path, `每个格子都应当是 ${[...allowed].join(' / ')} 的群系 id`);
      }
    });
  }
}

function validateNumberGrid(
  surface: Obj,
  key: string,
  base: string,
  add: (path: string, message: string) => void,
  min: number,
  max: number,
): void {
  const grid = surface[key];
  if (!Array.isArray(grid) || grid.length !== GRID_LAT) {
    add(`${base}.${key}`, `应当是 ${GRID_LAT} 行的二维数组`);
    return;
  }
  grid.forEach((row, index) => {
    const path = `${base}.${key}[${index}]`;
    if (!Array.isArray(row) || row.length !== GRID_LON) {
      add(path, `应当是 ${GRID_LON} 个数字`);
      return;
    }
    if (!row.every((cell) => isNum(cell) && cell >= min && cell <= max)) {
      add(path, `每个格子都应当是 ${min} … ${max} 的数字`);
    }
  });
}

function validateTerrestrialSurface(surface: Obj, base: string, add: (path: string, message: string) => void): void {
  for (const key of ['seaLevelM', 'minElevationM', 'maxElevationM', 'meanTempC']) {
    if (!isNum(surface[key])) add(`${base}.${key}`, '应当是有限数字');
  }
  for (const key of ['oceanFraction', 'landFraction']) {
    const value = surface[key];
    if (!isNum(value) || value < 0 || value > 1) add(`${base}.${key}`, '应当在 0 … 1');
  }
  if (isNum(surface.oceanFraction) && isNum(surface.landFraction)) {
    if (Math.abs(surface.oceanFraction + surface.landFraction - 1) > 1e-6) {
      add(`${base}.oceanFraction`, '应当与 landFraction 相加为 1');
    }
  }

  const elevation = surface.elevationM;
  if (!Array.isArray(elevation) || elevation.length !== GRID_LAT) {
    add(`${base}.elevationM`, `应当是 ${GRID_LAT} 行的二维数组`);
  } else {
    elevation.forEach((row, index) => {
      const path = `${base}.elevationM[${index}]`;
      if (!Array.isArray(row) || row.length !== GRID_LON) {
        add(path, `应当是 ${GRID_LON} 个数字`);
        return;
      }
      if (!row.every((cell) => isNum(cell))) add(path, '每个格子都应当是有限数字');
    });
  }
  validateBiomes(surface, base, TERRESTRIAL_IDS, add);
  validateNumberGrid(surface, 'wetness', base, add, 0, 1);
  validateNumberGrid(surface, 'fertility', base, add, 0, 1);
  validateNumberGrid(surface, 'tungsten', base, add, 0, 500);
  const ore = surface.tungsten;
  if (Array.isArray(ore)) {
    ore.forEach((row, index) => {
      if (Array.isArray(row) && !row.every((cell) => isNum(cell) && Number.isInteger(cell))) {
        add(`${base}.tungsten[${index}]`, '每一格都应当是整数份');
      }
    });
  }
}

function validateIsobaricSurface(surface: Obj, base: string, add: (path: string, message: string) => void): void {
  if (!isNum(surface.pressureBar) || surface.pressureBar <= 0) add(`${base}.pressureBar`, '应当是正数');
  if (!isNum(surface.minWindMps) || !isNum(surface.maxWindMps) || surface.minWindMps > surface.maxWindMps) {
    add(`${base}.minWindMps`, 'minWindMps 应当是不大于 maxWindMps 的有限数字');
  }
  if (!isNum(surface.meanTempC)) add(`${base}.meanTempC`, '应当是有限数字');
  validateBiomes(surface, base, STORM_IDS, add);
}

function validateMoonSurface(surface: Obj, base: string, add: (path: string, message: string) => void): void {
  if (!isNum(surface.meanTempC)) add(`${base}.meanTempC`, '应当是有限数字');
  validateBiomes(surface, base, new Set([11]), add);
}

function validateSurface(surface: Obj, base: string, add: (path: string, message: string) => void): void {
  if (surface.model !== SURFACE_MODEL) {
    add(`${base}.model`, `当前只认识 ${SURFACE_MODEL}，收到 ${String(surface.model)}`);
  }
  if (!isStr(surface.kind) || !SURFACE_KINDS.includes(surface.kind)) {
    add(`${base}.kind`, `应当是 ${SURFACE_KINDS.join(' / ')}`);
    return;
  }
  validateGrid(surface, base, add);
  if (surface.kind === 'terrestrial') validateTerrestrialSurface(surface, base, add);
  else if (surface.kind === 'isobaric') validateIsobaricSurface(surface, base, add);
  else validateMoonSurface(surface, base, add);
}

export function validateSave(value: unknown): SchemaIssue[] {
  const issues: SchemaIssue[] = [];
  const add = (path: string, message: string): void => {
    issues.push({ path, message });
  };

  if (!isObj(value)) {
    add('$', '顶层应当是一个对象');
    return issues;
  }
  if (value.schema !== 5) {
    add(
      '$.schema',
      `当前只认识 schema 5，收到 ${String(value.schema)}（schema 1 / 2 / 3 / 4 的旧存档不能读，需要重新创世；4 是还没有钨矿的那一版）`,
    );
  }
  if (!isStr(value.createdAt) || Number.isNaN(Date.parse(value.createdAt))) {
    add('$.createdAt', '应当是 ISO 时间字符串');
  }

  const spec = value.spec;
  if (!isObj(spec)) {
    add('$.spec', '缺少创世参数');
  } else {
    const seed = spec.seed;
    const seedOk = typeof seed === 'string'
      ? seed.length > 0 && seed.length <= 200
      : isNum(seed) && Number.isInteger(seed) && seed >= GENESIS_LIMITS.seed.min && seed <= GENESIS_LIMITS.seed.max;
    if (!seedOk) {
      add('$.spec.seed', `应当是 ${GENESIS_LIMITS.seed.min} … ${GENESIS_LIMITS.seed.max} 的整数，或 1–200 个字符的字符串`);
    }
    const starMass = spec.starMass;
    if (!isNum(starMass) || starMass < GENESIS_LIMITS.starMass.min || starMass > GENESIS_LIMITS.starMass.max) {
      add('$.spec.starMass', `应当在 ${GENESIS_LIMITS.starMass.min} … ${GENESIS_LIMITS.starMass.max}`);
    }
    const planetCount = spec.planetCount;
    if (!isNum(planetCount) || !Number.isInteger(planetCount) || planetCount < GENESIS_LIMITS.planetCount.min || planetCount > GENESIS_LIMITS.planetCount.max) {
      add('$.spec.planetCount', `应当是 ${GENESIS_LIMITS.planetCount.min} … ${GENESIS_LIMITS.planetCount.max} 的整数`);
    }
    const maxMoons = spec.maxMoons;
    if (!isNum(maxMoons) || !Number.isInteger(maxMoons) || maxMoons < GENESIS_LIMITS.maxMoons.min || maxMoons > GENESIS_LIMITS.maxMoons.max) {
      add('$.spec.maxMoons', `应当是 ${GENESIS_LIMITS.maxMoons.min} … ${GENESIS_LIMITS.maxMoons.max} 的整数`);
    }
  }

  const system = value.system;
  if (!isObj(system)) {
    add('$.system', '缺少系统');
    return issues;
  }
  if (!isStr(system.specHash) || !/^[0-9a-f]{8}$/.test(system.specHash)) {
    add('$.system.specHash', '应当是 8 位十六进制');
  }
  if (!isStr(system.generator)) add('$.system.generator', '应当是非空字符串');

  const star = system.star;
  if (!isObj(star)) {
    add('$.system.star', '缺少恒星');
  } else {
    for (const key of ['massSun', 'luminositySun', 'radiusSun', 'teffK', 'lifetimeGyr', 'hzInnerAU', 'hzOuterAU']) {
      if (!isNum(star[key])) add(`$.system.star.${key}`, '应当是有限数字');
    }
    if (!isStr(star.spectralClass)) add('$.system.star.spectralClass', '应当是非空字符串');
  }

  const planets = system.planets;
  if (!Array.isArray(planets)) {
    add('$.system.planets', '应当是数组');
    return issues;
  }
  const expected = isObj(spec) && isNum(spec.planetCount) ? spec.planetCount : null;
  if (expected !== null && planets.length !== expected) {
    add('$.system.planets', `数量应当等于 spec.planetCount（${expected}），收到 ${planets.length}`);
  }

  const seenId = new Set<string>();
  let previousAU = -1;
  planets.forEach((planet, index) => {
    const base = `$.system.planets[${index}]`;
    if (!isObj(planet)) {
      add(base, '应当是对象');
      return;
    }
    if (!isStr(planet.id) || seenId.has(planet.id)) add(`${base}.id`, '应当唯一且非空');
    else seenId.add(planet.id);
    if (!isStr(planet.name)) add(`${base}.name`, '应当是非空字符串');
    if (!isStr(planet.kind) || !KINDS.includes(planet.kind)) add(`${base}.kind`, `应当是 ${KINDS.join(' / ')}`);
    if (!isNum(planet.aAU) || planet.aAU <= 0) add(`${base}.aAU`, '应当大于 0');
    else {
      if (planet.aAU < previousAU) add(`${base}.aAU`, '轨道应当由内到外升序');
      previousAU = planet.aAU;
    }
    for (const key of [
      'periodDays',
      'eccentricity',
      'inclinationDeg',
      'massEarth',
      'radiusEarth',
      'densityGcc',
      'gravity',
      'escapeKms',
      'rotationHours',
      'obliquityDeg',
      'albedo',
      'eqTempK',
      'meanTempK',
    ]) {
      if (!isNum(planet[key])) add(`${base}.${key}`, '应当是有限数字');
    }
    if (typeof planet.tidallyLocked !== 'boolean') add(`${base}.tidallyLocked`, '应当是布尔值');
    if (typeof planet.habitable !== 'boolean') add(`${base}.habitable`, '应当是布尔值');
    if (!isStr(planet.climate) || !CLIMATES.includes(planet.climate)) add(`${base}.climate`, `应当是 ${CLIMATES.join(' / ')}`);
    if (!isStr(planet.atmosphere) || !ATMOSPHERES.includes(planet.atmosphere)) {
      add(`${base}.atmosphere`, `应当是 ${ATMOSPHERES.join(' / ')}`);
    }

    const moons = planet.moons;
    if (!Array.isArray(moons)) {
      add(`${base}.moons`, '应当是数组');
      return;
    }
    if (isObj(spec) && isNum(spec.maxMoons) && moons.length > spec.maxMoons) {
      add(`${base}.moons`, `数量不应超过 spec.maxMoons（${spec.maxMoons}），收到 ${moons.length}`);
    }
    moons.forEach((moon, moonIndex) => {
      const mbase = `${base}.moons[${moonIndex}]`;
      if (!isObj(moon)) {
        add(mbase, '应当是对象');
        return;
      }
      if (!isStr(moon.id) || seenId.has(moon.id)) add(`${mbase}.id`, '应当唯一且非空');
      else seenId.add(moon.id);
      if (!isStr(moon.name)) add(`${mbase}.name`, '应当是非空字符串');
      for (const key of ['massEarth', 'radiusEarth', 'orbitKm', 'periodDays', 'tideMeters']) {
        if (!isNum(moon[key])) add(`${mbase}.${key}`, '应当是有限数字');
      }
      if (isNum(moon.orbitKm) && isNum(planet.radiusEarth) && moon.orbitKm <= planet.radiusEarth * 6371 * 2) {
        add(`${mbase}.orbitKm`, '轨道应当至少在行星半径两倍之外');
      }
      if (!isObj(moon.surface)) add(`${mbase}.surface`, '卫星应当有地表');
      else validateSurface(moon.surface, `${mbase}.surface`, add);
    });

    if (!isObj(planet.surface)) {
      add(`${base}.surface`, '行星应当有地表');
      return;
    }
    validateSurface(planet.surface, `${base}.surface`, add);
    // 岩石行星必须是 terrestrial，气态/冰巨星必须是 isobaric（可活动区域）。
    const expectedKind = planet.kind === 'rocky' ? 'terrestrial' : 'isobaric';
    if (isStr(planet.surface.kind) && planet.surface.kind !== expectedKind) {
      add(`${base}.surface.kind`, `「${planet.kind}」行星应当是 ${expectedKind}，收到 ${planet.surface.kind}`);
    }
  });

  return issues;
}

export function assertSave(value: unknown): void {
  const issues = validateSave(value);
  if (issues.length === 0) return;
  const head = issues
    .slice(0, 3)
    .map((issue) => `${issue.path}：${issue.message}`)
    .join('；');
  throw new Error(`存档格式不对（${issues.length} 处）：${head}`);
}
