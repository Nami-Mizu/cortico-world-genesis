/**
 * 设计 token：整块面板只有这一处定义颜色、间距、字号。
 *
 * 风格取「示波器」——深底、磷光绿为主、琥珀为警、数字一律等宽。
 * 换皮只改这里，不在各页签里手写颜色。
 */

export const TOKENS = `
:root {
  --gx-bg: #080b0a;
  --gx-panel: #0d1210;
  --gx-line: #1d2a24;
  --gx-line-soft: #14201b;
  --gx-ink: #cfe7dc;
  --gx-ink-dim: #7d9a8c;
  --gx-ink-faint: #4d6158;
  --gx-accent: #5ef2a0;
  --gx-accent-dim: #2f8f63;
  --gx-warn: #ffb454;
  --gx-bad: #ff6b6b;
  --gx-glow: 0 0 0 1px rgba(94, 242, 160, 0.18), 0 0 14px rgba(94, 242, 160, 0.06);
  --gx-sp-1: 4px;
  --gx-sp-2: 8px;
  --gx-sp-3: 12px;
  --gx-sp-4: 16px;
  --gx-radius: 6px;
  --gx-mono: ui-monospace, SFMono-Regular, "Cascadia Mono", "JetBrains Mono", Menlo, Consolas, monospace;
  --gx-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.gx {
  background: var(--gx-bg);
  color: var(--gx-ink);
  font-family: var(--gx-sans);
  font-size: 13px;
  line-height: 1.55;
  border-radius: var(--gx-radius);
  padding: var(--gx-sp-4);
}

.gx-topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--gx-sp-2) var(--gx-sp-3);
  padding: var(--gx-sp-2) var(--gx-sp-3);
  margin-bottom: var(--gx-sp-3);
  background: var(--gx-panel);
  border: 1px solid var(--gx-line);
  border-radius: var(--gx-radius);
  box-shadow: var(--gx-glow);
}

.gx-topbar .gx-num { font-family: var(--gx-mono); font-variant-numeric: tabular-nums; }
.gx-topbar .gx-dim { color: var(--gx-ink-dim); }
.gx-topbar .gx-spacer { flex: 1 1 auto; }

.gx-body { display: grid; gap: var(--gx-sp-3); }

/* 宿主给 h1–h4 / p / li 上了深色，深色底上看不见：只重置文字容器，不碰 gx-ok/gx-bad 这类带色 span。 */
.gx h1, .gx h2, .gx h3, .gx h4, .gx h5,
.gx p, .gx li, .gx ul, .gx ol, .gx dl, .gx dt, .gx dd,
.gx label, .gx table, .gx th, .gx td {
  color: inherit;
}
.gx h3 { font-size: 14px; font-weight: 600; margin: 0 0 var(--gx-sp-1); }
.gx h4 { font-size: 13px; font-weight: 600; margin: var(--gx-sp-2) 0 var(--gx-sp-1); color: var(--gx-ink-dim); }
.gx ul { margin: 0; padding-left: 18px; }
.gx a { color: var(--gx-accent); }

.gx-card {
  background: var(--gx-panel);
  border: 1px solid var(--gx-line-soft);
  border-radius: var(--gx-radius);
  padding: var(--gx-sp-3);
}

.gx-card-head {
  display: flex;
  align-items: center;
  gap: var(--gx-sp-2);
  margin-bottom: var(--gx-sp-2);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.gx-card-head::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gx-accent);
  box-shadow: 0 0 8px var(--gx-accent);
}

.gx-grid-2 { display: grid; gap: var(--gx-sp-2); grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
.gx-grid-3 { display: grid; gap: var(--gx-sp-2); grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }

.gx-row { display: flex; align-items: baseline; gap: var(--gx-sp-2); }
.gx-row + .gx-row { margin-top: var(--gx-sp-1); }
.gx-row .gx-k { color: var(--gx-ink-dim); }
.gx-row .gx-v { font-family: var(--gx-mono); font-variant-numeric: tabular-nums; }
.gx-row .gx-gap { flex: 1 1 auto; }

.gx-num { font-family: var(--gx-mono); font-variant-numeric: tabular-nums; }
.gx-ok { color: var(--gx-accent); }
.gx-warn { color: var(--gx-warn); }
.gx-bad { color: var(--gx-bad); }
.gx-dim { color: var(--gx-ink-dim); }
.gx-faint { color: var(--gx-ink-faint); }

.gx-bar {
  height: 6px;
  background: var(--gx-line-soft);
  border-radius: 3px;
  overflow: hidden;
}
.gx-bar > i { display: block; height: 100%; background: var(--gx-accent-dim); }
.gx-bar.is-warn > i { background: var(--gx-warn); }
.gx-bar.is-bad > i { background: var(--gx-bad); }

.gx-list { display: grid; gap: var(--gx-sp-1); }
.gx-list .gx-item {
  display: flex;
  gap: var(--gx-sp-2);
  padding: var(--gx-sp-1) var(--gx-sp-2);
  border-radius: var(--gx-sp-1);
  border: 1px solid transparent;
}
.gx-list .gx-item:hover { border-color: var(--gx-line); background: rgba(94, 242, 160, 0.03); }

.gx-empty { color: var(--gx-ink-faint); font-style: italic; }
.gx-msg {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 13px;
  line-height: 1.55;
  padding: var(--gx-sp-1) var(--gx-sp-2);
  border-left: 2px solid var(--gx-line);
  color: var(--gx-ink-dim);
}
.gx-msg.gx-ok { border-left-color: var(--gx-accent); color: var(--gx-ink); }
.gx-msg.gx-bad { border-left-color: var(--gx-bad); color: var(--gx-bad); }

/* 窄屏：卡片叠成一列，顶栏允许换行，数字不挤在一起。 */
@media (max-width: 760px) {
  .gx-body { grid-template-columns: 1fr; }
  .gx-topbar { flex-wrap: wrap; gap: var(--gx-sp-1); }
  .gx-row { flex-wrap: wrap; }
  .gx-bar { width: 48px; }
  .gx-view { min-width: 0; }
}
`;

let installed = false;

/** 把 token 注入一次（同一页面里多个面板共用）。 */
export function ensureStyles(owner: Document): void {
  if (installed || owner.querySelector('style[data-gx-tokens]')) return;
  const style = owner.createElement('style');
  style.setAttribute('data-gx-tokens', '1');
  style.textContent = TOKENS;
  owner.head.append(style);
  installed = true;
}
