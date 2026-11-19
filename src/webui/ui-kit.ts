/** 面板共用的小工具：颜色表、墨卡托换算、输入行、错误文案。 */
import type { WebUiPanelContext } from 'cortico/web/shared/client-panel.ts';

export const BIOME_LABELS = [
  '海洋', '冰盖', '苔原', '高山', '沙漠', '草原', '稀树草原', '针叶林', '温带森林', '热带季雨林', '热带雨林',
  '卫星', '平静带', '微风带', '风暴带', '强风暴带', '巨型风暴',
];
export const BIOME_COLORS = [
  '#1f6fb2', // 0 海洋
  '#e8f4fb', // 1 冰盖
  '#9aa9a0', // 2 苔原
  '#8a7a6a', // 3 高山
  '#e0c070', // 4 沙漠
  '#a8c478', // 5 草原
  '#c2b06a', // 6 稀树草原
  '#5e7a52', // 7 针叶林
  '#4e8a44', // 8 温带森林
  '#3f9e5f', // 9 热带季雨林
  '#1f7a3f', // 10 热带雨林
  '#9a9aa0', // 11 卫星
  '#9fd0e8', // 12 平静带
  '#5ba6c9', // 13 微风带
  '#4a7fb5', // 14 风暴带
  '#7a5fb5', // 15 强风暴带
  '#c14b6b', // 16 巨型风暴
];

export const MERC_LIMIT_DEG = 85;

export function mercY(latDeg: number): number {
  const rad = (Math.min(MERC_LIMIT_DEG, Math.max(-MERC_LIMIT_DEG, latDeg)) * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
}

export function yPx(latDeg: number, height: number): number {
  const half = mercY(MERC_LIMIT_DEG);
  return (1 - (mercY(latDeg) + half) / (2 * half)) * height;
}

export function xPx(lonDeg: number, width: number): number {
  return ((lonDeg + 180) / 360) * width;
}

export function pxToLatDeg(y: number, height: number): number {
  const half = mercY(MERC_LIMIT_DEG);
  const m = half - (y / height) * 2 * half;
  return ((2 * Math.atan(Math.exp(m)) - Math.PI / 2) * 180) / Math.PI;
}

export function pxToLonDeg(x: number, width: number): number {
  return (x / width) * 360 - 180;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** 一行「标签 + 控件 + 说明」。控件既可以是 input，也可以是一整块（比如带读数的滑块）。 */
export function field(ui: WebUiPanelContext['ui'], label: string, input: HTMLElement, hint: string): HTMLElement {
  const row = ui.h('div');
  row.style.display = 'grid';
  row.style.gap = '4px';
  const help = ui.h('span', 'muted', hint);
  help.style.fontSize = '12px';
  row.append(ui.h('label', 'muted', label), input, help);
  return row;
}


export function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function normalizeSeedInput(raw: string): number | string {
  const text = raw.trim();
  if (!text) return 20261111;
  return /^\d{1,15}$/.test(text) ? Number(text) : text;
}
