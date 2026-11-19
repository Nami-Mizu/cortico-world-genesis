/**
 * 野生动物（3.0.0）。
 *
 * 这版只做「活物」：个体级的初级消费者（吃作物与野草）与次级消费者（吃初级消费者），
 * 不吃人、不能被杀。玩家能做的只有围栏与稻草人。
 *
 * 个体数很少（每颗行星 20–40 只），所以寻路用最便宜的贪心：朝目标直线迈一步，遇海就绕。
 */
import type { BiomeId, Planet, StarSystem } from './model.ts';
import type { PlantRecord } from './flora.ts';
import { cellCenter } from './site.ts';
import { hashSeed } from './rng.ts';

export type AnimalKind = 'grazer' | 'hunter';

export interface AnimalSpecies {
  id: string;
  name: string;
  kind: AnimalKind;
  /** 只在这些群系里出现。 */
  biomes: BiomeId[];
  /** 地图上的颜色。 */
  color: string;
  /** 每小时吃掉多少进度（作物）。 */
  bitePerHour: number;
  /** 每小时走多少公里。 */
  speedKmPerHour: number;
  /** 游客愿意为它买票（3.0.0：猫科）。 */
  viewable?: boolean;
}

export const ANIMAL_SPECIES: AnimalSpecies[] = [
  { id: 'dusk_deer', name: '暮色鹿', kind: 'grazer', biomes: [3, 4, 5, 6, 7, 8, 9], color: '#c58a5a', bitePerHour: 0.3, speedKmPerHour: 90 },
  { id: 'ash_hare', name: '灰砂兔', kind: 'grazer', biomes: [2, 3, 5, 6], color: '#b9a184', bitePerHour: 0.2, speedKmPerHour: 60 },
  { id: 'ice_goat', name: '冰原羊', kind: 'grazer', biomes: [1, 10, 4], color: '#dfe6ee', bitePerHour: 0.25, speedKmPerHour: 50 },
  { id: 'marsh_crab', name: '湿地蟹', kind: 'grazer', biomes: [5, 6, 7, 8], color: '#8fc1a8', bitePerHour: 0.15, speedKmPerHour: 40 },
  { id: 'shadow_stalker', name: '掠影兽', kind: 'hunter', biomes: [4, 5, 6, 7], color: '#6a5a72', bitePerHour: 0, speedKmPerHour: 130 },
  { id: 'dune_cat', name: '沙丘猫', kind: 'hunter', biomes: [2, 3, 5], color: '#d7b46a', bitePerHour: 0, speedKmPerHour: 110, viewable: true },
  { id: 'frost_lynx', name: '霜纹猞猁', kind: 'hunter', biomes: [1, 4, 10], color: '#a8bccc', bitePerHour: 0, speedKmPerHour: 120, viewable: true },
];

export const ANIMAL_SPECIES_IDS = ANIMAL_SPECIES.map((species) => species.id);

export function animalSpecies(id: string): AnimalSpecies {
  const found = ANIMAL_SPECIES.find((species) => species.id === id);
  if (!found) throw new Error(`不认识的动物：${id}`);
  return found;
}

export interface Animal {
  id: string;
  species: string;
  planetIndex: number;
  latDeg: number;
  lonDeg: number;
  /** 0 = 吃饱，越大越饿；超过 48 就饿死。 */
  hunger: number;
  ageHomeHours: number;
  /** 正在盯着的站点 key（没有就闲逛）。 */
  target?: string;
}

/** 每颗行星的个体上限。 */
export const ANIMAL_CAP_PER_PLANET = 40;
/** 一只动物最多吃「到 80% 停下」——熟了不摘就会被盯上。 */
export const ANIMAL_BITE_FLOOR = 0.8;
/** 吃饱后每 96 母星时生一只。 */
export const ANIMAL_BREED_HOME_HOURS = 96;
/** 饿到 48 母星时死掉。 */
export const ANIMAL_STARVE_HOME_HOURS = 48;
/** 围栏/稻草人的作用半径。 */
export const DETERRENT_RADIUS_KM = 1.5;
/** 喂食槽的容量（kg 生物质），以及动物愿意为它走多远。 */
export const TROUGH_CAPACITY_KG = 50;
export const TROUGH_RADIUS_KM = 5;
/** 领地：默认半径 3 km、上限 10 km；巡逻时走得更快、饿得也更快。 */
export const PATROL_RADIUS_DEFAULT_KM = 3;
export const PATROL_RADIUS_MAX_KM = 10;
export const PATROL_SPEED_FACTOR = 1.5;
export const PATROL_HUNGER_FACTOR = 1.5;

/** 一块领地：某颗行星上、某一种初级消费者的巡视范围。 */
export interface Territory {
  species: string;
  planetIndex: number;
  latDeg: number;
  lonDeg: number;
  radiusKm: number;
}

export function territoryFor(territories: Territory[] | undefined, planetIndex: number, species: string): Territory | undefined {
  return (territories ?? []).find((territory) => territory.planetIndex === planetIndex && territory.species === species);
}

/** 这个点在谁的领地里（返回领地；自己不在自己的领地里算「没越界」）。 */
export function foreignTerritoryAt(
  territories: Territory[] | undefined,
  planetIndex: number,
  species: string,
  point: { latDeg: number; lonDeg: number },
): Territory | undefined {
  return (territories ?? []).find((territory) => {
    if (territory.planetIndex !== planetIndex || territory.species === species) return false;
    return animalDistanceKm(point, territory) <= territory.radiusKm;
  });
}

/** 设一块领地：同种同星球的旧领地会被覆盖。只允许初级消费者。 */
export function setTerritory(
  territories: Territory[] | undefined,
  planetIndex: number,
  speciesId: string,
  latDeg: number,
  lonDeg: number,
  radiusKm: number,
): Territory[] {
  const species = animalSpecies(speciesId);
  if (species.kind !== 'grazer') {
    throw new Error(`${species.name}是次级消费者，不划领地：一划就会把猎物赶光，等于自断食物。`);
  }
  const radius = Math.max(1, Math.min(PATROL_RADIUS_MAX_KM, radiusKm));
  const next: Territory = { species: speciesId, planetIndex, latDeg, lonDeg, radiusKm: radius };
  return [...(territories ?? []).filter((territory) => !(territory.planetIndex === planetIndex && territory.species === speciesId)), next];
}

const KM_PER_DEGREE = 111.32;

export function animalsOn(state: { animals?: Animal[] }, planetIndex: number): Animal[] {
  return (state.animals ?? []).filter((animal) => animal.planetIndex === planetIndex);
}

/** 开局在母星撒一批，之后到新行星再撒——按种子决定，同一存档永远同一批。 */
export function seedAnimals(system: StarSystem, state: { animals?: Animal[] }, planetIndex: number, seed: number | string | undefined): Animal[] {
  const existing = state.animals ?? [];
  if (existing.some((animal) => animal.planetIndex === planetIndex)) return existing;
  const planet = system.planets[planetIndex - 1];
  if (!planet || planet.kind !== 'rocky' || planet.surface.kind !== 'terrestrial') return existing;
  const surface = planet.surface;
  const spawnable = ANIMAL_SPECIES.filter((species) =>
    species.kind === 'grazer' &&
    surface.biome.some((row, i) => row.some((cell, j) => species.biomes.includes(cell) && (surface.elevationM[i]?.[j] ?? -1) >= 0)),
  );
  if (spawnable.length === 0) return existing;
  const count = 20 + (hashSeed(`animals:${seed}:${planetIndex}`) % 21);
  const added: Animal[] = [];
  for (let n = 0; n < count; n += 1) {
    const roll = hashSeed(`animal:${seed}:${planetIndex}:${n}`);
    const species = spawnable[roll % spawnable.length]!;
    let picked: { i: number; j: number } | null = null;
    for (let probe = 0; probe < 500; probe += 1) {
      const i = hashSeed(`animal-i:${seed}:${planetIndex}:${n}:${probe}`) % surface.biome.length;
      const j = hashSeed(`animal-j:${seed}:${planetIndex}:${n}:${probe}`) % (surface.biome[0]?.length ?? 1);
      const biome = surface.biome[i]?.[j];
      const elevation = surface.elevationM[i]?.[j] ?? -1;
      if (biome !== undefined && elevation >= 0 && species.biomes.includes(biome)) {
        picked = { i, j };
        break;
      }
    }
    if (!picked) continue;
    const center = cellCenter(picked.i, picked.j);
    added.push({
      id: `a${planetIndex}-${n + 1}`,
      species: species.id,
      planetIndex,
      latDeg: center.latDeg,
      lonDeg: center.lonDeg,
      hunger: 6 + (hashSeed(`animal-h:${seed}:${n}`) % 12),
      ageHomeHours: hashSeed(`animal-age:${seed}:${n}`) % 48,
    });
  }
  // 次级消费者（掠食者 / 猫科）：每颗行星 2–4 只，单独撒。
  const hunters = ANIMAL_SPECIES.filter((species) => species.kind === 'hunter');
  const hunterCount = 2 + (hashSeed(`hunters:${seed}:${planetIndex}`) % 3);
  for (let n = 0; n < hunterCount && hunters.length > 0; n += 1) {
    const roll = hashSeed(`hunter:${seed}:${planetIndex}:${n}`);
    const species = hunters[roll % hunters.length]!;
    let picked: { i: number; j: number } | null = null;
    for (let probe = 0; probe < 400; probe += 1) {
      const i = hashSeed(`hunter-i:${seed}:${planetIndex}:${n}:${probe}`) % surface.biome.length;
      const j = hashSeed(`hunter-j:${seed}:${planetIndex}:${n}:${probe}`) % (surface.biome[0]?.length ?? 1);
      const biome = surface.biome[i]?.[j];
      const elevation = surface.elevationM[i]?.[j] ?? -1;
      if (biome !== undefined && elevation >= 0) {
        picked = { i, j };
        break;
      }
    }
    if (!picked) continue;
    const center = cellCenter(picked.i, picked.j);
    added.push({
      id: `h${planetIndex}-${n + 1}`,
      species: species.id,
      planetIndex,
      latDeg: center.latDeg,
      lonDeg: center.lonDeg,
      hunger: 10 + (hashSeed(`hunter-h:${seed}:${n}`) % 10),
      ageHomeHours: 24 + (hashSeed(`hunter-age:${seed}:${n}`) % 72),
    });
  }
  return [...existing, ...added];
}

/** 附近能当「观赏对象」的猫科数量（旅游线用）。 */
export function viewableCatsNear(
  state: { animals?: Animal[] },
  planetIndex: number,
  latDeg: number,
  lonDeg: number,
  radiusKm: number,
): number {
  return (state.animals ?? []).filter((animal) => {
    if (animal.planetIndex !== planetIndex) return false;
    if (!animalSpecies(animal.species).viewable) return false;
    return animalDistanceKm(animal, { latDeg, lonDeg }) <= radiusKm;
  }).length;
}
export function animalDistanceKm(a: { latDeg: number; lonDeg: number }, b: { latDeg: number; lonDeg: number }): number {
  const lat1 = (a.latDeg * Math.PI) / 180;
  const lat2 = (b.latDeg * Math.PI) / 180;
  const dLat = lat2 - lat1;
  const dLon = ((b.lonDeg - a.lonDeg) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

function stepToward(animal: Animal, latDeg: number, lonDeg: number, km: number): { latDeg: number; lonDeg: number } {
  const total = animalDistanceKm(animal, { latDeg, lonDeg });
  if (total <= km || total === 0) return { latDeg, lonDeg };
  const ratio = km / total;
  let nextLat = animal.latDeg + (latDeg - animal.latDeg) * ratio;
  const lonSpan = lonDeg - animal.lonDeg;
  const nextLon = animal.lonDeg + lonSpan * ratio;
  nextLat = Math.max(-89, Math.min(89, nextLat));
  // 经度回绕：跨过 ±180 时取短边。
  const wrapped = nextLon > 180 ? nextLon - 360 : nextLon < -180 ? nextLon + 360 : nextLon;
  return { latDeg: Math.round(nextLat * 10) / 10, lonDeg: Math.round(wrapped * 10) / 10 };
}

function wanderStep(animal: Animal, planet: Planet, hours: number): { latDeg: number; lonDeg: number } {
  const leg = Math.floor(animal.ageHomeHours / 6);
  const angle = (hashSeed(`wander:${animal.id}:${leg}`) % 360) * (Math.PI / 180);
  const speed = animalSpecies(animal.species).speedKmPerHour * hours;
  let lat = animal.latDeg + (Math.cos(angle) * speed) / KM_PER_DEGREE;
  let lon = animal.lonDeg + (Math.sin(angle) * speed) / (KM_PER_DEGREE * Math.max(0.2, Math.cos((animal.latDeg * Math.PI) / 180)));
  lat = Math.max(-85, Math.min(85, lat));
  lon = lon > 180 ? lon - 360 : lon < -180 ? lon + 360 : lon;
  if (planet.surface.kind === 'terrestrial') {
    const i = Math.max(0, Math.min(planet.surface.elevationM.length - 1, Math.round((90 - lat) / (180 / planet.surface.elevationM.length)) - 0 + 0));
    const j = Math.max(0, Math.min((planet.surface.elevationM[0]?.length ?? 1) - 1, Math.round((lon + 180) / (360 / (planet.surface.elevationM[0]?.length ?? 1)))));
    if ((planet.surface.elevationM[i]?.[j] ?? -1) < 0) {
      // 前面是海：原地掉头。
      return { latDeg: animal.latDeg, lonDeg: animal.lonDeg };
    }
  }
  return { latDeg: Math.round(lat * 10) / 10, lonDeg: Math.round(lon * 10) / 10 };
}

/** 站点附近有没有围栏/稻草人挡着。 */
export function siteGuarded(
  state: { structures: Array<{ kind: string; siteKey: string; planetIndex: number; latDeg?: number }> },
  planetIndex: number,
  latDeg: number,
  lonDeg: number,
): boolean {
  return state.structures.some((structure) => {
    if (structure.kind !== 'fence' && structure.kind !== 'scarecrow') return false;
    if (structure.planetIndex !== planetIndex) return false;
    return animalDistanceKm(structure as unknown as { latDeg: number; lonDeg: number }, { latDeg, lonDeg }) <= DETERRENT_RADIUS_KM;
  });
}

export interface AnimalTickResult {
  animals: Animal[];
  plants: Record<string, PlantRecord[]>;
  /** 喂食槽被吃掉的部分（kg 生物质）。 */
  stores: Record<string, Record<string, number>>;
  /** 被吃掉的「进度」总量，用来报一句话。 */
  bitten: number;
  events: Array<{ type: string; text: string }>;
}

interface AnimalWorldState {
  animals?: Animal[];
  sites: Array<{ key: string; planetIndex: number; latDeg: number; lonDeg: number }>;
  plants: Record<string, PlantRecord[]>;
  structures: Array<{ id: string; kind: string; siteKey: string; planetIndex: number; latDeg?: number; lonDeg?: number }>;
  stores?: Record<string, Record<string, number>>;
  territories?: Territory[];
  lastAnimalHomeHours?: number;
}

/** 领地里挑一个点：按年龄分段取哈希，保证同一只动物同一段里方向稳定。 */
function patrolStep(animal: Animal, territory: Territory, hours: number): { latDeg: number; lonDeg: number } {
  const leg = Math.floor(animal.ageHomeHours / 4);
  const angle = ((hashSeed(`patrol:${animal.id}:${leg}`) % 360) * Math.PI) / 180;
  const speed = animalSpecies(animal.species).speedKmPerHour * PATROL_SPEED_FACTOR * hours;
  let lat = animal.latDeg + (Math.cos(angle) * speed) / KM_PER_DEGREE;
  let lon = animal.lonDeg + (Math.sin(angle) * speed) / (KM_PER_DEGREE * Math.max(0.2, Math.cos((animal.latDeg * Math.PI) / 180)));
  // 出了领地就往回走（把点夹在圆内）。
  if (animalDistanceKm({ latDeg: lat, lonDeg: lon }, territory) > territory.radiusKm) {
    const back = stepToward({ ...animal, latDeg: lat, lonDeg: lon }, territory.latDeg, territory.lonDeg, speed);
    lat = back.latDeg;
    lon = back.lonDeg;
  }
  lat = Math.max(-85, Math.min(85, lat));
  lon = lon > 180 ? lon - 360 : lon < -180 ? lon + 360 : lon;
  return { latDeg: Math.round(lat * 10) / 10, lonDeg: Math.round(lon * 10) / 10 };
}

/**
 * 结算一段母星时：吃作物、吃同类、闲逛、饿死、繁殖。
 * 作物只吃进度 > 80% 的——熟了不摘就会被吃，这是本系统的主要压力。
 */
export function advanceAnimals(
  system: StarSystem,
  state: AnimalWorldState,
  nowHome: number,
  powered?: (structureId: string) => boolean,
): AnimalTickResult {
  const since = state.lastAnimalHomeHours ?? nowHome;
  const hours = Math.max(0, Math.min(24, nowHome - since));
  const animals0 = [...(state.animals ?? [])];
  const stores0: Record<string, Record<string, number>> = {};
  for (const [key, value] of Object.entries(state.stores ?? {})) stores0[key] = { ...value };
  if (hours <= 0 || animals0.length === 0) {
    return { animals: animals0, plants: state.plants, stores: stores0, bitten: 0, events: [] };
  }

  const troughs = state.structures.filter(
    (structure) => structure.kind === 'feed_trough' && (powered ? powered(structure.id) : true),
  );
  const troughFood: Record<string, number> = {};
  for (const trough of troughs) troughFood[trough.id] = stores0[trough.id]?.biomass ?? 0;
  let troughEaten = 0;

  let bitten = 0;
  const plants = { ...state.plants };
  const survivors: Animal[] = [];
  const pool = [...animals0];

  for (const animal of pool) {
    const planet = system.planets[animal.planetIndex - 1];
    if (!planet || planet.surface.kind !== 'terrestrial') {
      continue;
    }
    const species = animalSpecies(animal.species);
    let next: Animal = { ...animal, ageHomeHours: animal.ageHomeHours + hours, hunger: animal.hunger + hours };

    if (species.kind === 'hunter') {
      // 次级消费者：追最近的一只初级消费者，追上就吃掉它（算 30 kg）。
      const prey = pool
        .filter((other) => other.id !== animal.id && other.planetIndex === animal.planetIndex && animalSpecies(other.species).kind === 'grazer')
        .map((other) => ({ other, km: animalDistanceKm(animal, other) }))
        .sort((a, b) => a.km - b.km)[0];
      if (prey) {
        const reach = species.speedKmPerHour * hours;
        if (prey.km <= reach) {
          next = { ...next, hunger: Math.max(0, next.hunger - 30), latDeg: prey.other.latDeg, lonDeg: prey.other.lonDeg };
          survivors.push(next);
          const at = pool.indexOf(prey.other);
          if (at >= 0) pool.splice(at, 1);
          continue;
        }
        next = { ...next, ...stepToward(next, prey.other.latDeg, prey.other.lonDeg, reach) };
      } else {
        next = { ...next, ...wanderStep(next, planet, hours) };
      }
      survivors.push(next);
      continue;
    }

    // 初级消费者：先看领地（被赶/巡逻），再找喂食槽，最后才去啃熟透的作物。
    const reach = species.speedKmPerHour * hours;
    const territory = territoryFor(state.territories, animal.planetIndex, animal.species);
    const intruded = foreignTerritoryAt(state.territories, animal.planetIndex, animal.species, animal);
    if (intruded) {
      // 闯进别人的领地：被赶出去（不受伤），这一段不吃东西。
      const away = stepToward(next, intruded.latDeg, intruded.lonDeg, Math.max(reach * PATROL_SPEED_FACTOR, intruded.radiusKm));
      const pushed = animalDistanceKm({ latDeg: away.latDeg, lonDeg: away.lonDeg }, intruded) <= intruded.radiusKm
        ? stepToward(next, intruded.latDeg, intruded.lonDeg, intruded.radiusKm + 1)
        : away;
      next = { ...next, ...pushed, target: undefined };
      survivors.push(next);
      continue;
    }
    if (territory) {
      // 在自己的领地里：走得更快、也饿得更快。
      next = { ...next, hunger: animal.hunger + hours * PATROL_HUNGER_FACTOR };
    }

    const inPatrol = (point: { latDeg: number; lonDeg: number }): boolean =>
      !territory || animalDistanceKm(point, territory) <= territory.radiusKm;

    // 喂食槽：通了电、还有粮，就优先去最近的那个。
    const trough = troughs
      .filter((candidate) => candidate.planetIndex === animal.planetIndex)
      .filter((candidate) => (troughFood[candidate.id] ?? 0) > 0.001)
      .map((candidate) => ({ candidate, km: animalDistanceKm(animal, candidate as unknown as { latDeg: number; lonDeg: number }) }))
      .filter((entry) => entry.km <= TROUGH_RADIUS_KM && inPatrol(entry.candidate as unknown as { latDeg: number; lonDeg: number }))
      .sort((a, b) => a.km - b.km)[0];
    if (trough) {
      const aim = trough.candidate as unknown as { latDeg: number; lonDeg: number };
      if (trough.km > reach) {
        next = { ...next, ...stepToward(next, aim.latDeg, aim.lonDeg, reach), target: trough.candidate.id };
        survivors.push(next);
        continue;
      }
      const wanted = species.bitePerHour * hours * 4;
      const take = Math.min(troughFood[trough.candidate.id] ?? 0, wanted);
      if (take > 0) {
        troughFood[trough.candidate.id] = Math.round(((troughFood[trough.candidate.id] ?? 0) - take) * 1000) / 1000;
        troughEaten += take;
        next = { ...next, hunger: Math.max(0, next.hunger - take * 8), target: trough.candidate.id };
      }
      survivors.push(next);
      continue;
    }

    // 作物：只吃进度 > 80% 的，且不碰围栏/稻草人护住的站点。
    const candidates = state.sites
      .filter((site) => site.planetIndex === animal.planetIndex)
      .filter((site) => !siteGuarded(state, animal.planetIndex, site.latDeg, site.lonDeg))
      .filter((site) => inPatrol(site))
      .map((site) => {
        const list = plants[site.key] ?? [];
        const ripe = list.filter((plant) => !plant.starved && plant.progress > ANIMAL_BITE_FLOOR && plant.stage !== 'withering');
        return { site, ripe, km: animalDistanceKm(animal, site) };
      })
      .filter((entry) => entry.ripe.length > 0)
      .sort((a, b) => a.km - b.km);

    const target = candidates[0];
    if (target && target.km > reach) {
      next = { ...next, ...stepToward(next, target.site.latDeg, target.site.lonDeg, reach), target: target.site.key };
      survivors.push(next);
      continue;
    }

    if (target) {
      // 复制再改：纯函数，不能动调用方传进来的作物对象。
      const list = (plants[target.site.key] ?? []).map((plant) => ({ ...plant }));
      const wanted = species.bitePerHour * hours;
      let eaten = 0;
      for (const plant of list) {
        if (eaten >= wanted) break;
        if (plant.progress <= ANIMAL_BITE_FLOOR) continue;
        const room = plant.progress - ANIMAL_BITE_FLOOR;
        const take = Math.min(room, wanted - eaten);
        plant.progress = Math.round((plant.progress - take) * 1000) / 1000;
        eaten += take;
      }
      if (eaten > 0) {
        plants[target.site.key] = list;
        bitten += eaten;
        next = { ...next, hunger: Math.max(0, next.hunger - eaten * 8), ...stepToward(next, target.site.latDeg, target.site.lonDeg, reach), target: target.site.key };
      } else {
        const roam = territory ? patrolStep(next, territory, hours) : wanderStep(next, planet, hours);
        next = { ...next, ...roam, target: undefined };
      }
    } else {
      const roam = territory ? patrolStep(next, territory, hours) : wanderStep(next, planet, hours);
      next = { ...next, ...roam, target: undefined };
    }

    if (next.hunger >= ANIMAL_STARVE_HOME_HOURS) continue; // 饿死了
    survivors.push(next);
  }

  // 繁殖：吃饱的个体慢慢生，数量不超过上限。
  const byPlanet = new Map<number, number>();
  for (const animal of survivors) byPlanet.set(animal.planetIndex, (byPlanet.get(animal.planetIndex) ?? 0) + 1);
  for (const animal of [...survivors]) {
    if (animal.hunger > 12) continue;
    if ((byPlanet.get(animal.planetIndex) ?? 0) >= ANIMAL_CAP_PER_PLANET) continue;
    if ((animal.ageHomeHours % ANIMAL_BREED_HOME_HOURS) > hours) continue;
    if (hashSeed(`birth:${animal.id}:${Math.floor(animal.ageHomeHours / ANIMAL_BREED_HOME_HOURS)}`) % 2 === 0) continue;
    const species = animalSpecies(animal.species);
    if (species.kind !== 'grazer') continue;
    survivors.push({
      id: `${animal.id}b${Math.floor(animal.ageHomeHours)}`,
      species: animal.species,
      planetIndex: animal.planetIndex,
      latDeg: animal.latDeg,
      lonDeg: animal.lonDeg,
      hunger: 4,
      ageHomeHours: 0,
    });
    byPlanet.set(animal.planetIndex, (byPlanet.get(animal.planetIndex) ?? 0) + 1);
  }

  const events: Array<{ type: string; text: string }> = [];
  if (troughEaten > 0.01) {
    for (const trough of troughs) {
      const rest = Math.round((troughFood[trough.id] ?? 0) * 1000) / 1000;
      stores0[trough.id] = { ...(stores0[trough.id] ?? {}), biomass: rest };
    }
    events.push({
      type: 'genesis.animals_fed',
      text: `动物在喂食槽里吃了约 ${troughEaten.toFixed(2)} kg 生物质。`,
    });
  }
  if (bitten > 0.05) {
    events.push({
      type: 'genesis.animals_fed',
      text: `野外的动物吃了地里的作物：约 ${(bitten * 8).toFixed(1)} kg 的进度被啃掉了（它们只吃熟了没摘的）。`,
    });
  }
  return { animals: survivors, plants, stores: stores0, bitten, events };
}

/** 附近（半径 km 内）的动物，给看附近/面板用。 */
export function animalsNear(
  system: StarSystem,
  state: { animals?: Animal[] },
  planetIndex: number,
  latDeg: number,
  lonDeg: number,
  radiusKm: number,
): Array<{ animal: Animal; species: AnimalSpecies; km: number }> {
  return (state.animals ?? [])
    .filter((animal) => animal.planetIndex === planetIndex)
    .map((animal) => ({ animal, species: animalSpecies(animal.species), km: animalDistanceKm(animal, { latDeg, lonDeg }) }))
    .filter((entry) => entry.km <= radiusKm)
    .sort((a, b) => a.km - b.km);
}
