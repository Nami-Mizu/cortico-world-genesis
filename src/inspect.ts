import {
  growthFactor,
  NUTRIENT_IDS,
  NUTRIENT_LABELS,
  NUTRIENT_NEEDS,
  scarcestNutrient,
  SPECIES,
  type ClimateSample,
  type PlantRecord,
} from './flora.ts';

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** 温度和水分两段单独算出来，用于「为什么长得慢」的拆解。 */
function pieces(plant: PlantRecord, climate: ClimateSample): {
  temp: number;
  water: number;
  nutrient: number;
  fertility: number;
  total: number;
} {
  const spec = SPECIES[plant.species];
  const t = plant.genes.tempOptC;
  const inBand = climate.tempC >= spec.tempMinC && climate.tempC <= spec.tempMaxC;
  const span = climate.tempC >= t ? Math.max(1e-6, spec.tempMaxC - t) : Math.max(1e-6, t - spec.tempMinC);
  const temp = inBand ? Math.max(0, Math.min(1, 1 - Math.abs(climate.tempC - t) / span)) : 0;
  const water = Math.max(0, Math.min(1, (climate.wetness - plant.genes.waterNeed) / 0.5));
  const need = NUTRIENT_NEEDS[plant.species];
  let nutrient = 1;
  if (climate.nutrients) {
    for (const dim of NUTRIENT_IDS) {
      const limit = need[dim];
      if (limit <= 0) continue;
      nutrient = Math.min(nutrient, Math.max(0, Math.min(1, climate.nutrients[dim] / limit)));
    }
  }
  return { temp, water, nutrient, fertility: 0.6 + 0.4 * climate.fertility, total: growthFactor(plant, climate) };
}

/** 生长因子的一句话拆解。 */
export function growFactorText(plant: PlantRecord, climate: ClimateSample): string {
  const p = pieces(plant, climate);
  return `温度 ×${round2(p.temp)} · 水分 ×${round2(p.water)} · 养分 ×${round2(p.nutrient)} · 肥力 ×${round2(p.fertility)} → 合计 ×${round2(p.total)}`;
}

/** 按当前气候还要多少母星时。0 表示已经到顶。 */
function hoursLeft(plant: PlantRecord, climate: ClimateSample): number | null {
  const spec = SPECIES[plant.species];
  const factor = growthFactor(plant, climate);
  if (factor <= 0) return null;
  if (plant.stage === 'ripe' || plant.stage === 'withering') return 0;
  if (spec.model === 'colony') {
    const cap = spec.yieldKg * plant.genes.yield;
    if (cap <= 0) return null;
    const rate = (cap * Math.LN2) / Math.max(1e-6, spec.cycleHomeHours);
    return Math.max(0, Math.round(((cap - plant.biomassKg) / (rate * factor)) * 10) / 10);
  }
  const perHour = (plant.genes.growthRate / Math.max(1e-6, spec.cycleHomeHours)) * factor;
  return Math.max(0, Math.round(((0.9 - plant.progress) / perHour) * 10) / 10);
}

/**
 * 一株作物的详情卡：基因、有效温区、当前气候、四维养分、生长因子拆解、预计收成。
 * 纯函数，面板与工具共用。
 */
export function inspectPlantText(plant: PlantRecord, climate: ClimateSample, siteLabel: string): string {
  const spec = SPECIES[plant.species];
  const p = pieces(plant, climate);
  const need = NUTRIENT_NEEDS[plant.species];
  const lines: string[] = [];
  lines.push(`${spec.name}（${plant.id}）· ${siteLabel}`);
  lines.push(`  阶段：${plant.stage} · 进度 ${pct(plant.progress)} · 健康 ${pct(plant.health)}${plant.stress ? ' · 应激' : ''}`);
  lines.push(
    `  基因：最适 ${plant.genes.tempOptC}℃ · 需水 ${plant.genes.waterNeed} · 长速 ×${plant.genes.growthRate} · 产量 ×${plant.genes.yield} · 耐人工气候 ${plant.genes.climateTolerance ?? 0}`,
  );
  lines.push(`  有效温区：${spec.tempMinC}–${plant.genes.tempOptC}–${spec.tempMaxC}℃（物种 ${spec.tempMinC}–${spec.tempOptC}–${spec.tempMaxC}）`);
  lines.push(`  这里：${climate.tempC}℃ · 湿度 ${climate.wetness} · 肥力 ${climate.fertility}`);
  if (climate.nutrients) {
    const parts = NUTRIENT_IDS.map((dim) => {
      const stock = climate.nutrients![dim];
      const ok = need[dim] <= 0 || stock >= need[dim];
      return `${NUTRIENT_LABELS[dim]} ${stock}/${need[dim]}${ok ? '' : '↓'}`;
    });
    const worst = scarcestNutrient(plant, climate);
    lines.push(`  养分：${parts.join(' · ')}${worst ? `（最缺${NUTRIENT_LABELS[worst]}）` : ''}`);
  } else {
    lines.push('  养分：这块地没有养分记录。');
  }
  lines.push(`  生长：${growFactorText(plant, climate)}`);
  const hours = hoursLeft(plant, climate);
  if (p.total <= 0) {
    lines.push('  现在完全不长：看上面哪一项是 ×0，先把它补上（温度/湿度/养分）。');
  } else if (hours !== null) {
    lines.push(hours <= 0 ? '  可以收了。' : `  按这个速度还要 ${hours} 母星时。`);
  }
  if (spec.model === 'individual') {
    const yieldKg = spec.yieldKg * plant.genes.yield * (0.7 + 0.3 * climate.fertility);
    lines.push(`  预计收成：${round2(yieldKg)} kg ${spec.resource}（按当前肥力）`);
  }
  return lines.join('\n');
}
