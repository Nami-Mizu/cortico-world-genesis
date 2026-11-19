/**
 * 墨卡托地图：把 `GenesisSurfaceMap` 画到 canvas 上。
 *
 * 第三参是动物领地（可选）：画半透明的琥珀圆环，只标当前行星上的。
 */
import type { GenesisPanelTerritory, GenesisSurfaceMap } from '../panel-types.ts';
import { BIOME_COLORS, pxToLatDeg, pxToLonDeg, xPx, yPx } from './ui-kit.ts';

export const WIDTH = 720;
export const HEIGHT = 360;

/** 1° 纬度在地图上多少像素（纵向 180° 铺满 HEIGHT）。 */
const PX_PER_DEG = HEIGHT / 180;

export function drawMap(canvas: HTMLCanvasElement, map: GenesisSurfaceMap, territories: GenesisPanelTerritory[] = []): void {
  const context = canvas.getContext('2d');
  if (!context) return;
  context.clearRect(0, 0, WIDTH, HEIGHT);
  const { grid } = map;
  const lonStep = 360 / grid.lon;
  const latStep = 180 / grid.lat;
  for (let i = 0; i < grid.lat; i += 1) {
    const latTop = -90 + i * latStep;
    const latBottom = latTop + latStep;
    for (let j = 0; j < grid.lon; j += 1) {
      const lonLeft = -180 + j * lonStep;
      const lonRight = lonLeft + lonStep;
      const x0 = xPx(lonLeft, WIDTH);
      const x1 = xPx(lonRight, WIDTH);
      const y0 = yPx(latTop, HEIGHT);
      const y1 = yPx(latBottom, HEIGHT);
      context.fillStyle = BIOME_COLORS[map.biome[i]![j]!] ?? '#000';
      context.fillRect(x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0));
    }
  }
  // 群系改造：在底色上叠目标群系的颜色，透明度就是进度——1 这里一格正在变成新样子。
  for (const cell of map.terra ?? []) {
    if (!(cell.p > 0)) continue;
    const latTop = -90 + cell.i * latStep;
    const lonLeft = -180 + cell.j * lonStep;
    const x0 = xPx(lonLeft, WIDTH);
    const x1 = xPx(lonLeft + lonStep, WIDTH);
    const y0 = yPx(latTop + latStep, HEIGHT);
    const y1 = yPx(latTop, HEIGHT);
    context.globalAlpha = Math.min(1, Math.max(0, cell.p));
    context.fillStyle = BIOME_COLORS[cell.targetBiome] ?? '#fff';
    context.fillRect(x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0));
    context.globalAlpha = 1;
  }
  // 采掘留下的疤：叠一层灰褐，越矿越深——地图上能一眼看出哪片山被挖薄了。
  for (const cell of map.scar ?? []) {
    if (!(cell.v > 0)) continue;
    const latTop = -90 + cell.i * latStep;
    const lonLeft = -180 + cell.j * lonStep;
    const x0 = xPx(lonLeft, WIDTH);
    const x1 = xPx(lonLeft + lonStep, WIDTH);
    const y0 = yPx(latTop + latStep, HEIGHT);
    const y1 = yPx(latTop, HEIGHT);
    context.globalAlpha = Math.min(0.75, Math.max(0, cell.v) * 0.75);
    context.fillStyle = '#6b5a4a';
    context.fillRect(x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0));
    context.globalAlpha = 1;
  }
  // 动物领地：琥珀色圆环。半径按「每度纬度多少像素」折算——墨卡托在中高纬会变形，
  // 这里是示意不是测量，够看清「谁的领地压到了我的地」就行。
  for (const territory of territories) {
    const cx = xPx(territory.lonDeg, WIDTH);
    const cy = yPx(territory.latDeg, HEIGHT);
    const radius = Math.max(2, (territory.radiusKm / 111) * PX_PER_DEG);
    context.beginPath();
    context.arc(cx, cy, radius, 0, Math.PI * 2);
    context.strokeStyle = '#ffb454';
    context.globalAlpha = 0.7;
    context.lineWidth = 1;
    context.stroke();
    context.globalAlpha = 1;
  }
}
