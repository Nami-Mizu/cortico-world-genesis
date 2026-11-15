import type { Atmosphere, Climate, Moon, Planet, PlanetKind, StarSystem } from './model.ts';

export const KIND_LABEL: Record<PlanetKind, string> = { rocky: '岩石', ice: '冰', gas: '气态' };
export const CLIMATE_LABEL: Record<Climate, string> = {
  frozen: '冰封',
  cold: '寒冷',
  temperate: '温带',
  hot: '炎热',
  scorched: '灼热',
};
export const ATMOSPHERE_LABEL: Record<Atmosphere, string> = {
  none: '无',
  thin: '稀薄',
  thick: '浓密',
  hydrogen: '氢氦',
};

function n(value: number, digits = 2): string {
  return value.toFixed(digits);
}

/** 恒星 + 宜居带这两行；没部署监测器时不该看到。 */
export function formatStarBlock(system: StarSystem, starName?: string): string[] {
  const s = system.star;
  return [
    `${starName ? `恒星「${starName}」` : '恒星'}：${n(s.massSun)} M☉ · ${s.spectralClass} 型 · ${n(s.luminositySun)} L☉ · 有效温度 ${Math.round(s.teffK)} K · 寿命约 ${n(s.lifetimeGyr, 1)} Gyr`,
    `宜居带：${n(s.hzInnerAU)} – ${n(s.hzOuterAU)} AU`,
  ];
}

/** 一颗卫星的明细行（缩进两格）。 */
export function formatMoonLine(planet: Planet, moon: Moon, name = moon.name): string {
  return `  卫星 ${name}：${n(moon.massEarth, 3)} M⊕ · 轨道 ${Math.round(moon.orbitKm).toLocaleString('en-US')} km · 周期 ${n(moon.periodDays, 1)} 天 · 潮汐 ${n(moon.tideMeters, 2)} m · 地表：卫星群系 · 均温 ${n(moon.surface.meanTempC, 1)} ℃`;
}

/** 一颗行星的明细（星卡里的一块）。`includeMoons=false` 时只给行星本身。 */
export function formatPlanetBlock(planet: Planet, includeMoons = true, name = planet.name): string[] {
  const p = planet;
  const lines: string[] = [];
  lines.push(`${name}（${KIND_LABEL[p.kind]}）— ${n(p.aAU)} AU · 周期 ${n(p.periodDays, 1)} 天`);
  lines.push(`  质量 ${n(p.massEarth)} M⊕ · 半径 ${n(p.radiusEarth)} R⊕ · 密度 ${n(p.densityGcc, 1)} g/cm³`);
  lines.push(
    `  重力 ${n(p.gravity / 9.80665)} g · 逃逸 ${n(p.escapeKms, 1)} km/s · 自转 ${n(p.rotationHours, 1)} 小时${p.tidallyLocked ? '（潮汐锁定）' : ''} · 倾角 ${Math.round(p.obliquityDeg)}°`,
  );
  lines.push(
    `  平衡温度 ${Math.round(p.eqTempK)} K · 平均 ${Math.round(p.meanTempK)} K · 气候：${CLIMATE_LABEL[p.climate]} · 大气：${ATMOSPHERE_LABEL[p.atmosphere]}${p.habitable ? ' · 宜居' : ''}`,
  );
  if (includeMoons) {
    for (const m of p.moons) lines.push(formatMoonLine(p, m));
  }
  const surf = p.surface;
  if (surf.kind === 'terrestrial') {
    const top = surf.biomes
      .filter((b) => b.id !== 0)
      .slice(0, 3)
      .map((b) => `${b.label} ${Math.round(b.fraction * 100)}%`)
      .join('、');
    lines.push(
      `  地表：海洋 ${Math.round(surf.oceanFraction * 100)}% · 海拔 ${Math.round(surf.minElevationM)} … ${Math.round(surf.maxElevationM)} m · 均温 ${n(surf.meanTempC, 1)} ℃`,
    );
    lines.push(`  群系：${top || '只有海洋'}`);
  } else {
    const spots = surf.biomes.filter((b) => b.id === 16).reduce((sum, b) => sum + b.count, 0);
    const top = surf.biomes
      .slice(0, 3)
      .map((b) => `${b.label} ${Math.round(b.fraction * 100)}%`)
      .join('、');
    lines.push(
      `  可活动区域（等气压面 ${surf.pressureBar} bar）：风速 ${surf.minWindMps} … ${surf.maxWindMps} m/s · 巨型风暴 ${spots} 处 · 均温 ${n(surf.meanTempC, 1)} ℃`,
    );
    lines.push(`  风暴带：${top}`);
  }
  return lines;
}

/** 完整的星卡：创世那一刻的「全貌」。0.7.0 之后模型只能通过监测器看局部，这个函数主要留给存档自检。 */
export function formatSystemCard(system: StarSystem, starName?: string): string {
  const lines: string[] = [];
  lines.push(`创世 #${system.specHash} · 种子 ${system.spec.seed}`);
  lines.push(...formatStarBlock(system, starName));
  lines.push(`行星 ${system.planets.length} 颗：`);
  for (const p of system.planets) {
    lines.push('');
    lines.push(...formatPlanetBlock(p));
  }
  return lines.join('\n');
}
