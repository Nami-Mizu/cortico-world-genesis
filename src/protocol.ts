/**
 * 【协议】：把「叫醒人类」拆成十二章任务。
 *
 * 它不消耗物品、不升级任何东西——它只是一张检查表。
 * 但它是这个游戏第一次有「终局」：前八条让你把一颗星球的生存底线搭起来，
 * 后四条要求你走得更远（望远镜、异星样本、攒够能量）。
 *
 * 完不成不惩罚，只有完不成。
 */
import type { GameState } from './game.ts';

export interface ProtocolTask {
  id: string;
  chapter: 1 | 2 | 3;
  title: string;
}

export const CHAPTER_TITLES: Record<1 | 2 | 3, string> = {
  1: '第一章 · 活下来',
  2: '第二章 · 住得下',
  3: '第三章 · 叫醒他们',
};

export const PROTOCOL_TASKS: ProtocolTask[] = [
  { id: 'greenhouse', chapter: 1, title: '建起第一座温室核心' },
  { id: 'food', chapter: 1, title: '存下 200 kg 口粮（生物质）' },
  { id: 'battery', chapter: 1, title: '修复【蓄电池】到 lv1' },
  { id: 'energy', chapter: 1, title: '把能量存到 100,000 kJ' },
  { id: 'habitat', chapter: 2, title: '建起第一座居所' },
  { id: 'oxygen', chapter: 2, title: '备足 60 kg 氧气' },
  { id: 'water', chapter: 2, title: '备足 100 L 饮用水' },
  { id: 'sites', chapter: 2, title: '两座站点都种满（各 100 株/群）' },
  { id: 'telescope', chapter: 3, title: '把【射电望远镜阵列】修到 lv3' },
  { id: 'sample', chapter: 3, title: '带回一份异星生命样本' },
  { id: 'big_energy', chapter: 3, title: '把能量存到 1,000,000 kJ' },
  { id: 'wake', chapter: 3, title: '叫醒第一批人类' },
];

function totalOf(state: GameState, resource: string): number {
  let sum = state.inventory[resource] ?? 0;
  for (const store of Object.values(state.stores)) sum += store[resource] ?? 0;
  for (const store of Object.values(state.siteStores ?? {})) sum += store[resource] ?? 0;
  return sum;
}

/** 每一条的完成判据；`progress` 是 0…1 的小数，给面板画进度条。 */
export function protocolStatus(state: GameState): Array<ProtocolTask & { done: boolean; progress: number }> {
  const fullSites = state.sites.filter((s) => (state.plants[s.key]?.length ?? 0) >= 100).length;
  const habitats = state.structures.filter((s) => s.kind === 'habitat');
  const awake = habitats.reduce((n, h) => n + (h.awake ?? 0), 0);
  const check: Record<string, { done: boolean; progress: number }> = {
    greenhouse: {
      done: state.structures.some((s) => s.kind === 'greenhouse'),
      progress: state.structures.some((s) => s.kind === 'greenhouse') ? 1 : 0,
    },
    food: { done: totalOf(state, 'biomass') >= 200, progress: Math.min(1, totalOf(state, 'biomass') / 200) },
    battery: { done: state.upgrades.battery >= 1, progress: Math.min(1, state.upgrades.battery) },
    energy: { done: state.energyKj >= 100_000, progress: Math.min(1, state.energyKj / 100_000) },
    habitat: { done: habitats.length > 0, progress: habitats.length > 0 ? 1 : 0 },
    oxygen: { done: totalOf(state, 'oxygen') >= 60, progress: Math.min(1, totalOf(state, 'oxygen') / 60) },
    water: { done: totalOf(state, 'water_drink') >= 100, progress: Math.min(1, totalOf(state, 'water_drink') / 100) },
    sites: { done: fullSites >= 2, progress: Math.min(1, fullSites / 2) },
    telescope: { done: state.upgrades.telescope >= 3, progress: Math.min(1, state.upgrades.telescope / 3) },
    sample: { done: (state.samples ?? 0) >= 1, progress: Math.min(1, state.samples ?? 0) },
    big_energy: { done: state.energyKj >= 1_000_000, progress: Math.min(1, state.energyKj / 1_000_000) },
    wake: { done: awake > 0, progress: awake > 0 ? 1 : 0 },
  };
  return PROTOCOL_TASKS.map((task) => ({ ...task, ...(check[task.id] ?? { done: false, progress: 0 }) }));
}

export function protocolDone(state: GameState): number {
  return protocolStatus(state).filter((t) => t.done).length;
}

/** 「可以叫醒人类了」的门槛：前 11 条（不含第 12 条「叫醒第一批人类」本身）。 */
export function protocolReady(state: GameState): { done: number; total: number } {
  const rows = protocolStatus(state);
  return { done: rows.filter((t) => t.id !== 'wake' && t.done).length, total: rows.length - 1 };
}

export function protocolComplete(state: GameState): boolean {
  return protocolDone(state) === PROTOCOL_TASKS.length;
}

/** 给模型看的那份清单。 */
export function protocolText(state: GameState): string {
  const rows = protocolStatus(state);
  const lines = ['# 协议', ''];
  let chapter = 0;
  for (const row of rows) {
    if (row.chapter !== chapter) {
      chapter = row.chapter;
      lines.push('', `## ${CHAPTER_TITLES[row.chapter as 1 | 2 | 3]}`);
    }
    const mark = row.done ? '[x]' : '[ ]';
    const pct = row.done ? '' : `（${Math.round(row.progress * 100)}%）`;
    lines.push(`${mark} ${row.title}${pct}`);
  }
  lines.push('', `共 ${protocolDone(state)} / ${PROTOCOL_TASKS.length}。`);
  const ready = protocolReady(state);
  if (protocolComplete(state)) lines.push('', '全部完成。');
  else if (ready.done === ready.total) {
    lines.push('', `前 ${ready.total} 条都完成了。可以叫醒他们了——叫醒本身是最后一条。`);
  }
  return lines.join('\n');
}
