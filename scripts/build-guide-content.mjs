// 把 src/guide/*.md 编成 src/guide-content.ts。
//
// 运行时优先直接读 .md（改完刷新面板就能看到）；读不到时才用这份快照兜底
// ——World 被打包成单文件跑时（比如本地 harness），.md 不在旁边。
//
// 用法：node scripts/build-guide-content.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dir = join(root, 'src', 'guide');
const files = readdirSync(dir).filter((name) => name.endsWith('.md')).sort();
const order = [
  'start',
  'plan',
  'time',
  'power',
  'mine',
  'farm',
  'logistics',
  'trade',
  'upgrade',
  'life',
  'trouble',
];

const entries = order
  .filter((id) => files.includes(`${id}.md`))
  .map((id) => {
    const text = readFileSync(join(dir, `${id}.md`), 'utf8').trimEnd();
    return `  ${id}: ${JSON.stringify(`${text}\n`)},`;
  });

const out = `// 由 scripts/build-guide-content.mjs 从 src/guide/*.md 生成，别手改。
// 运行时优先读 .md；这份快照只在读不到文件时兜底（比如 World 被包成单文件）。
export const GUIDE_SNAPSHOT: Record<string, string> = {
${entries.join('\n')}
};
`;

writeFileSync(join(root, 'src', 'guide-content.ts'), out, 'utf8');
console.log(`wrote src/guide-content.ts (${entries.length} chapters)`);

// 工具表也一起编，理由同上：打包后 .md 不在旁边。
const tools = readFileSync(join(root, 'src', 'TOOLS.md'), 'utf8').trimEnd();
const toolsOut = `// 由 scripts/build-guide-content.mjs 从 src/TOOLS.md 生成，别手改。
export const TOOLS_SNAPSHOT: string = ${JSON.stringify(`${tools}\n`)};
`;
writeFileSync(join(root, 'src', 'tools-content.ts'), toolsOut, 'utf8');
console.log(`wrote src/tools-content.ts (${tools.split('\n').length} lines)`);
