import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { TOOLS_SNAPSHOT } from './tools-content.ts';

const cache = new Map<string, string>();

function toolsBody(): string {
  const hit = cache.get('all');
  if (hit !== undefined) return hit;
  let text: string;
  try {
    text = readFileSync(fileURLToPath(new URL('./TOOLS.md', import.meta.url)), 'utf8');
  } catch {
    text = TOOLS_SNAPSHOT;
  }
  if (!text) {
    throw new Error('工具表丢了：src/TOOLS.md（跑 node scripts/build-guide-content.mjs 重新生成快照）。');
  }
  cache.set('all', text);
  return text;
}

/** 整张工具表。 */
export function toolsText(): string {
  return toolsBody();
}

/** 按关键词过滤工具表：命中行 + 表格里它所在的那几行。 */
export function toolsSearch(query: string | undefined): string {
  const text = toolsBody();
  const q = (query ?? '').trim().toLowerCase();
  if (!q) return text;
  const lines = text.split('\n');
  const keep = new Set<number>();
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i]!.toLowerCase().includes(q)) {
      for (let k = Math.max(0, i - 1); k <= Math.min(lines.length - 1, i + 2); k += 1) keep.add(k);
    }
  }
  if (keep.size === 0) {
    return `工具表里没有「${query}」。不带参数可以看全表。`;
  }
  const picked = [...keep].sort((a, b) => a - b).map((i) => lines[i]!);
  return picked.join('\n').trim();
}
