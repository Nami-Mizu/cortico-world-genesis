import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { populationOf, sleepersOf, type GameState, type SeedBag, type Upgrades } from './game.ts';

/** 点火燃料的资源 id（`flora.ts` 的 RESOURCE_LABELS 里叫「氘氚燃料」）。 */
export const FUEL_RESOURCE = 'deuterium';

/** 档案：能跨地图带走的那一小块。其余（站点、建筑、作物、疤）都长在地图上。 */
export interface Profile {
  schema: 1;
  /** 已经过了几颗星（第一次是 1）。 */
  runs: number;
  /** 上一颗星的名字，星卡里留一行。 */
  lastStar?: string;
  credits: number;
  tungsten: number;
  energyKj: number;
  inventory: Record<string, number>;
  upgrades: Upgrades;
  seedBags: SeedBag[];
  /** 所有人类（醒着的也算）——再创世时全体回休眠舱。 */
  people: number;
  samples: number;
  updatedAt: string;
}

export const PROFILE_SCHEMA = 1;
/** 【再创世】的门槛：一百万 kJ、一百公斤氘氚燃料、一份异星样本、机动核心修好。 */
export const RECREATE_ENERGY_KJ = 1_000_000;
export const RECREATE_FUEL_KG = 100;
export const RECREATE_SAMPLES = 1;

/** 从一局游戏里轧出档案。 */
export function exportProfile(
  state: GameState,
  meta: { runs?: number; lastStar?: string; nowMs?: number } = {},
): Profile {
  return {
    schema: PROFILE_SCHEMA,
    runs: meta.runs ?? 1,
    ...(meta.lastStar ? { lastStar: meta.lastStar } : {}),
    credits: state.credits,
    tungsten: state.tungsten,
    energyKj: state.energyKj,
    inventory: { ...state.inventory, [FUEL_RESOURCE]: state.inventory[FUEL_RESOURCE] ?? 0 },
    upgrades: { ...state.upgrades },
    seedBags: state.seedBags.map((bag) => ({ ...bag, ...(bag.at ? {} : {}) })),
    people: populationOf(state) + sleepersOf(state),
    samples: state.samples,
    updatedAt: new Date(meta.nowMs ?? Date.now()).toISOString(),
  };
}

/** 门槛检查：返回空数组表示可以点火。 */
export function recreateBlockers(state: GameState): string[] {
  const blockers: string[] = [];
  if (state.energyKj < RECREATE_ENERGY_KJ) {
    blockers.push(`能量不够：要 ${RECREATE_ENERGY_KJ.toLocaleString('en-US')} kJ，现在 ${Math.round(state.energyKj).toLocaleString('en-US')} kJ。`);
  }
  const fuel = state.inventory[FUEL_RESOURCE] ?? 0;
  if (fuel < RECREATE_FUEL_KG) {
    blockers.push(`氘氚燃料不够：要 ${RECREATE_FUEL_KG} kg，现在 ${fuel} kg。`);
  }
  if (state.samples < RECREATE_SAMPLES) {
    blockers.push(`异星生命样本不够：要 ${RECREATE_SAMPLES} 份，现在 ${state.samples} 份。`);
  }
  if (state.upgrades.mobilityCore !== 'ready') {
    blockers.push('机动核心还没修好：先修它，不然飞船起不来。');
  }
  if (state.transit) blockers.push('移动途中不能点火。');
  return blockers;
}

/** 扣掉点火成本（能量、燃料、样本）。 */
export function consumeRecreate(state: GameState): GameState {
  const blockers = recreateBlockers(state);
  if (blockers.length > 0) throw new Error(blockers.join('\n'));
  return {
    ...state,
    energyKj: state.energyKj - RECREATE_ENERGY_KJ,
    inventory: { ...state.inventory, [FUEL_RESOURCE]: (state.inventory[FUEL_RESOURCE] ?? 0) - RECREATE_FUEL_KG },
    samples: state.samples - RECREATE_SAMPLES,
  };
}

export interface ProfileStoreOptions {
  dataDir: string;
}

/** `<dataDir>/genesis/profile.json`：档案单独一份，和地图的 runs/ 分开。 */
export class ProfileStore {
  readonly file: string;

  constructor(options: ProfileStoreOptions) {
    this.file = join(options.dataDir, 'genesis', 'profile.json');
  }

  async read(): Promise<Profile | null> {
    let raw: string;
    try {
      raw = await readFile(this.file, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
    const parsed = JSON.parse(raw) as Profile;
    if (parsed.schema !== PROFILE_SCHEMA) {
      throw new Error(`profile.json 的 schema 是 ${String(parsed.schema)}，这一版只认识 ${PROFILE_SCHEMA}。`);
    }
    return parsed;
  }

  async write(profile: Profile): Promise<void> {
    await mkdir(dirname(this.file), { recursive: true });
    await writeFile(this.file, `${JSON.stringify(profile, null, 2)}\n`, 'utf8');
  }
}
