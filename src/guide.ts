// 新手教程：不塞进系统提示词，而是做成一个工具，调用一次给一篇。
//
// 为什么放工具里：系统提示词越短，模型越不会漏看关键约束；教程又长又碎，
// 需要时才查，比每次对话都背一遍更省上下文，也方便按主题分篇。
//
// 正文在 src/guide/<topic>.md —— 改文案就改那些文件，不用碰代码。
// 运行时先读文件（改完刷新面板即可看到）；World 被打成单文件时读不到，
// 退回 src/guide-content.ts 里的快照（由 scripts/build-guide-content.mjs 生成）。
//
// 1.3.1 起每篇开头带一句“船上的声音”——教程不只是参数表，也交代你为什么在这里。
// 1.9.2 把「矿与电网」「容器与自动化」拆成独立篇，并加了「路线图」。
// 1.9.5 正文从代码里搬进 .md，并给面板加了一个「手册」页签。

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { GUIDE_SNAPSHOT } from './guide-content.ts';

export type GuideTopic =
  | 'start'
  | 'plan'
  | 'time'
  | 'power'
  | 'mine'
  | 'farm'
  | 'logistics'
  | 'trade'
  | 'upgrade'
  | 'life'
  | 'trouble';

export const GUIDE_TOPICS: Array<{ id: GuideTopic; title: string }> = [
  { id: 'start', title: '醒来：创世与看四周' },
  { id: 'plan', title: '路线图：头一周做什么' },
  { id: 'time', title: '时间、移动与等待' },
  { id: 'power', title: '能量、设备与飞船' },
  { id: 'mine', title: '钨、矿与电网' },
  { id: 'farm', title: '种地、保鲜与群系改造' },
  { id: 'logistics', title: '容器与自动化：无人机、终端、机械臂' },
  { id: 'trade', title: '商人、信用点与订单' },
  { id: 'upgrade', title: '升级：修船坞' },
  { id: 'life', title: '生命维持与叫醒人类' },
  { id: 'trouble', title: '卡住了怎么办' },
];

const cache = new Map<GuideTopic, string>();

/** 先读盘上的 .md，读不到再用编译进来的快照。 */
function guideBody(topic: GuideTopic): string {
  const hit = cache.get(topic);
  if (hit !== undefined) return hit;
  let text: string | null = null;
  try {
    const file = fileURLToPath(new URL(`./guide/${topic}.md`, import.meta.url));
    text = `${readFileSync(file, 'utf8').trimEnd()}\n`;
  } catch {
    text = GUIDE_SNAPSHOT[topic] ?? null;
  }
  if (!text) throw new Error(`教程文件丢了：src/guide/${topic}.md（跑 node scripts/build-guide-content.mjs 重新生成快照）。`);
  cache.set(topic, text);
  return text;
}

export function guideTopics(): Array<{ id: GuideTopic; title: string }> {
  return GUIDE_TOPICS.map((topic) => ({ ...topic }));
}

/** 不带 topic 给目录 + 第一篇；带 topic 给那一篇全文。 */
export function guideText(topic?: string): string {
  if (topic) {
    const picked = GUIDE_TOPICS.find((entry) => entry.id === topic);
    if (!picked) throw new Error(`没有这篇教程：${topic}。可选：${GUIDE_TOPICS.map((t) => t.id).join(' / ')}。`);
    return guideBody(picked.id);
  }
  const index = GUIDE_TOPICS.map((topic2, i) => `${i + 1}. ${topic2.id} —— ${topic2.title}`).join('\n');
  return [
    '# 新手教程（目录）',
    '',
    '这篇不是系统提示词，是你要的时候才查的手册。',
    `调用 \`genesis_guide { "topic": "<id>" }\` 看某一篇：`,
    '',
    index,
    '',
    '不确定从哪看：先看 start，再看 plan。',
    '',
    guideBody('start'),
  ].join('\n');
}
