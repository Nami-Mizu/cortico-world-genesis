/**
 * 星际商人的「基因订单」：每天 1–2 张，收购某种植物的、带着某种基因的收成。
 *
 * 为什么是基因订单：它是信用点的主要出口，也是「育种」这件事唯一的硬回报——
 * 你可以卖普通生物质，但只有养出对路的基因，才卖得出大价钱。
 */
import type { Genes, SpeciesId } from './flora.ts';
import { hashSeed } from './rng.ts';

export interface Order {
  id: string;
  /** 第几天（母星时 / 24）。 */
  day: number;
  species: SpeciesId;
  /** 要求的基因字段与下限。 */
  gene: keyof Genes;
  min: number;
  /** 要交多少 kg。 */
  kg: number;
  /** 完成后给多少信用点。 */
  reward: number;
}

const ORDER_POOL: Array<{ species: SpeciesId; gene: keyof Genes; min: number; kg: number; price: number }> = [
  { species: 'grass', gene: 'yield', min: 1.35, kg: 20, price: 220 },
  { species: 'grass', gene: 'growthRate', min: 1.3, kg: 15, price: 260 },
  { species: 'moss', gene: 'yield', min: 1.3, kg: 12, price: 320 },
  { species: 'moss', gene: 'growthRate', min: 1.25, kg: 10, price: 350 },
  { species: 'lichen', gene: 'yield', min: 1.25, kg: 8, price: 420 },
  { species: 'cyanobacteria', gene: 'growthRate', min: 1.35, kg: 10, price: 360 },
  { species: 'diatom', gene: 'yield', min: 1.3, kg: 12, price: 300 },
  { species: 'ice_alga', gene: 'yield', min: 1.25, kg: 10, price: 380 },
  { species: 'polar_moss', gene: 'yield', min: 1.2, kg: 8, price: 520 },
  { species: 'hot_fern', gene: 'yield', min: 1.2, kg: 10, price: 480 },
  { species: 'salt_grass', gene: 'growthRate', min: 1.2, kg: 10, price: 460 },
  { species: 'deep_root', gene: 'yield', min: 1.15, kg: 18, price: 400 },
];

/**
 * 当天有哪几张订单：由日期哈希确定，同一天永远是同一批（不刷新、不随机）。
 * 后期（有异星样本）会出极端物种的单子。
 */
export function ordersForDay(day: number, hasSamples = false): Order[] {
  const pool = hasSamples ? ORDER_POOL : ORDER_POOL.slice(0, 8);
  const rng = hashSeed(`orders:${day}`);
  const count = rng % 3 === 0 ? 2 : 1;
  const picked: Order[] = [];
  let cursor = rng;
  for (let n = 0; n < count; n += 1) {
    cursor = hashSeed(`${cursor}:${n}`);
    const item = pool[cursor % pool.length]!;
    if (picked.some((o) => o.species === item.species && o.gene === item.gene)) continue;
    picked.push({
      id: `order:${day}:${n}`,
      day,
      species: item.species,
      gene: item.gene,
      min: item.min,
      kg: item.kg,
      reward: Math.round(item.kg * item.price),
    });
  }
  return picked;
}

export const GENE_LABELS: Record<keyof Genes, string> = {
  tempOptC: '最适温',
  waterNeed: '需水',
  growthRate: '生长速率',
  yield: '产量',
  climateTolerance: '耐人工气候',
};

export function orderText(order: Order, speciesName: string): string {
  return `${speciesName} · ${GENE_LABELS[order.gene]} ≥ ${order.min.toFixed(2)} · ${order.kg} kg → ${order.reward.toLocaleString('en-US')} 信用点`;
}
