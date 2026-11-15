/**
 * 地形补丁：给模型看「某坐标附近」的地表，而不是单个格子。
 *
 * 网格是 72×36 的 5° 粗网格，所以「附近」按格子的中心点取一个方形补丁：
 * 补丁半径（km）由调用方决定（World 里是「可配置定值 × 能见度」），
 * 这里只负责把半径换算成「每边取几个格子」并把那块格子连同海拔/群系/温度读出来。
 *
 * 三种地表都用同一个补丁：
 * - 岩石（terrestrial）：海拔 + 气候群系，温度按 surface.ts 同一条公式重算（纬度 + 海拔 + 平移）；
 * - 气态/冰（isobaric）：等气压面，群系 = 风暴强度，温度均匀；
 * - 卫星（moon）：固定「卫星」群系，温度均匀。
 */
import {
  BIOME_LABELS,
  STORM_WIND_MPS,
  isStormBiome,
  type Atmosphere,
  type BiomeId,
  type MoonSurface,
  type PlanetSurface,
  type SurfaceKind,
} from './model.ts';
import { GRID_LAT, GRID_LON, latitudeTempC, surfaceTempBiasC } from './surface.ts';

/** 相邻纬线的距离（km）。同 surface.ts 的 CELL_KM。 */
const CELL_KM = (Math.PI * 6371) / GRID_LAT;

/** 每个群系在补丁里用的单字。 */
export const TERRAIN_GLYPH: Record<BiomeId, string> = {
  0: '海',
  1: '冰',
  2: '苔',
  3: '山',
  4: '沙',
  5: '草',
  6: '稀',
  7: '针',
  8: '温',
  9: '季',
  10: '雨',
  11: '月',
  12: '静',
  13: '风',
  14: '暴',
  15: '狂',
  16: '巨',
};

/**
 * 能见度系数：只看大气（没有天气，雾/沙尘留到以后）。
 * 卫星没有大气，按 1.0 算。
 */
export function planetVisibility(atmosphere: Atmosphere): number {
  const byAtmosphere: Record<Atmosphere, number> = {
    none: 1.0,
    thin: 0.8,
    thick: 0.45,
    hydrogen: 0.7,
  };
  return byAtmosphere[atmosphere];
}

/** 一块能读地表的东西：行星（岩石/气态/冰）或卫星。 */
export interface TerrainBody {
  id: string;
  name: string;
  meanTempK: number;
  obliquityDeg: number;
  atmosphere: Atmosphere;
  surface: PlanetSurface | MoonSurface;
}

export interface TerrainCell {
  latDeg: number;
  lonDeg: number;
  biome: BiomeId;
  tempC: number;
  /** 只有岩石地表有海拔。 */
  elevationM?: number;
}

export interface TerrainPatch {
  bodyId: string;
  kind: SurfaceKind;
  centerLatDeg: number;
  centerLonDeg: number;
  radiusKm: number;
  visibility: number;
  /** 每边取几个格子（不含中心，所以补丁是 (2*half+1)^2）。 */
  half: number;
  cells: TerrainCell[][];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function latIndexOf(latDeg: number): number {
  return clamp(Math.floor((clamp(latDeg, -90, 90) + 90) / 5), 0, GRID_LAT - 1);
}

function lonIndexOf(lonDeg: number): number {
  const wrapped = ((lonDeg + 180) % 360 + 360) % 360 - 180;
  return clamp(Math.floor((wrapped + 180) / 5), 0, GRID_LON - 1);
}

function cellLatDeg(index: number): number {
  return -90 + (index + 0.5) * 5;
}

function cellLonDeg(index: number): number {
  return -180 + (index + 0.5) * 5;
}

export function terrainPatch(
  body: TerrainBody,
  centerLatDeg: number,
  centerLonDeg: number,
  radiusKm: number,
): TerrainPatch {
  const surface = body.surface;
  const kind = surface.kind;
  const visibility = kind === 'moon' ? 1.0 : planetVisibility(body.atmosphere);
  const half = clamp(Math.ceil(radiusKm / CELL_KM), 1, 6);
  const ci = latIndexOf(centerLatDeg);
  const cj = lonIndexOf(centerLonDeg);
  const biasC = kind === 'terrestrial' ? surfaceTempBiasC(body) : 0;

  const cells: TerrainCell[][] = [];
  for (let i = ci - half; i <= ci + half; i += 1) {
    if (i < 0 || i >= GRID_LAT) continue;
    const row: TerrainCell[] = [];
    for (let j = cj - half; j <= cj + half; j += 1) {
      const nj = ((j % GRID_LON) + GRID_LON) % GRID_LON;
      const biome = surface.biome[i]![nj]!;
      const latDeg = cellLatDeg(i);
      let tempC: number;
      let elevationM: number | undefined;
      if (kind === 'terrestrial') {
        elevationM = surface.elevationM[i]![nj]!;
        const isOcean = elevationM < 0;
        tempC =
          latitudeTempC(body.meanTempK, latDeg, body.obliquityDeg) +
          biasC -
          (isOcean ? 0 : 6.5 * (Math.max(0, elevationM) / 1000));
      } else {
        tempC = surface.meanTempC;
      }
      row.push({ latDeg, lonDeg: cellLonDeg(nj), biome, tempC, elevationM });
    }
    cells.push(row);
  }

  return { bodyId: body.id, kind, centerLatDeg, centerLonDeg, radiusKm, visibility, half, cells };
}

/** 把补丁画成一行一个格子的可读文本（含图例，图例只列补丁里出现的群系）。 */
export function terrainPatchText(patch: TerrainPatch): string {
  const present = [...new Set(patch.cells.flat().map((c) => c.biome))].sort((a, b) => a - b);
  const legend = present.map((id) => {
    const label = BIOME_LABELS[id];
    if (isStormBiome(id)) {
      const w = STORM_WIND_MPS[id];
      return `${TERRAIN_GLYPH[id]}${label}(${w.min}–${w.max} m/s)`;
    }
    return `${TERRAIN_GLYPH[id]}${label}`;
  });
  const lines: string[] = [
    `围绕 (${patch.centerLatDeg}°, ${patch.centerLonDeg}°) 的地表，半径约 ${Math.round(patch.radiusKm)} km（能见度 ${patch.visibility}，取 ${patch.cells.length}×${patch.cells[0]?.length ?? 0} 格）：`,
  ];
  for (const row of patch.cells) {
    lines.push(row.map((c) => TERRAIN_GLYPH[c.biome]).join(' '));
  }
  lines.push('图例：' + legend.join(' · '));
  if (patch.kind === 'terrestrial') {
    lines.push(
      '每格海拔（米）：' + patch.cells.flat().map((c) => `${TERRAIN_GLYPH[c.biome]}${c.elevationM}`).join('，'),
    );
    lines.push('每格均温（℃）：' + patch.cells.flat().map((c) => `${TERRAIN_GLYPH[c.biome]}${Math.round(c.tempC)}`).join('，'));
  } else {
    const all = patch.cells[0]?.[0];
    lines.push(`均温（℃）：${all ? Math.round(all.tempC) : '—'}（整片相同${patch.kind === 'moon' ? '，卫星地表' : ''}）`);
  }
  return lines.join('\n');
}
