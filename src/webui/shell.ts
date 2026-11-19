/**
 * 顶栏 + 页签外壳：所有新页签共用一条「你在哪、还剩多少」的常驻信息带。
 *
 * 数据来自 `invoke('state')` 的同一份载荷，这里只负责显示，不发命令。
 */
import type { WebUiPanelContext } from 'cortico/web/shared/client-panel.ts';
import type { GenesisPanelState } from '../panel-types.ts';
import { ensureStyles } from './tokens.ts';

const EMPTY = '还没有存档 —— 去最后那个「存档」页签新建一局。';

/** 「读不到状态」有两种原因，说的话要不一样：没创世 vs 存档读不进来。 */
export function emptyText(state: { locked?: boolean; loadError?: string | null } | null): string {
  if (state && state.loadError) return `存档读不进来：${state.loadError}（原文件已备份为 game.json.before-repair）`;
  return EMPTY;
}

export interface ShellInfo {
  time?: string;
  where?: string;
  energyKj?: number;
  capacityKj?: number;
  credits?: number;
  tungsten?: number;
  speed?: number;
  baseMinutesPerHomeHour?: number;
}

export interface Shell {
  root: HTMLElement;
  body: HTMLElement;
  update(state: GenesisPanelState | null): void;
  /** 页签载荷不是整份 state 时用这个：只更新它知道的几格。 */
  updateLoose(info: ShellInfo): void;
}

function num(value: number, digits = 0): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** 百分比条：0…1。 */
function bar(ratio: number, tone?: 'warn' | 'bad'): HTMLElement {
  const wrap = document.createElement('span');
  wrap.className = tone ? `gx-bar is-${tone}` : 'gx-bar';
  wrap.style.width = '72px';
  wrap.style.display = 'inline-block';
  wrap.style.verticalAlign = 'middle';
  const fill = document.createElement('i');
  fill.style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
  wrap.append(fill);
  return wrap;
}

export function createShell(ctx: WebUiPanelContext, opts: { title: string; desc?: string }): Shell {
  ensureStyles(ctx.root.ownerDocument);
  const sheet = ctx.ui.sheet({ title: opts.title, desc: opts.desc });
  const root = ctx.ui.h('div', 'gx');
  const topbar = ctx.ui.h('div', 'gx-topbar');
  const body = ctx.ui.h('div', 'gx-body');
  root.append(topbar, body);
  sheet.body.append(root);
  ctx.root.append(sheet.el);

  const clock = ctx.ui.h('span', 'gx-num');
  const where = ctx.ui.h('span', 'gx-dim');
  const energy = ctx.ui.h('span', 'gx-num');
  const energyBar = ctx.ui.h('span');
  const tungsten = ctx.ui.h('span', 'gx-num');
  const credits = ctx.ui.h('span', 'gx-num');
  const ship = ctx.ui.h('span', 'gx-num');
  const charter = ctx.ui.h('span', 'gx-num');

  // 时间倍速：1–200，拖动后立即生效（服务端重锚 epoch，不会跳时间）。
  const speedWrap = ctx.ui.h('span', 'gx-row');
  speedWrap.style.gap = '4px';
  speedWrap.style.alignItems = 'center';
  const speedInput = ctx.ui.h('input') as HTMLInputElement;
  speedInput.type = 'range';
  speedInput.min = '1';
  speedInput.max = '200';
  speedInput.step = '1';
  speedInput.value = '1';
  speedInput.style.width = '84px';
  const speedLabel = ctx.ui.h('span', 'gx-num gx-dim', '×1');
  speedInput.onchange = async () => {
    const value = Number(speedInput.value) || 1;
    speedLabel.textContent = `×${value}`;
    try {
      await ctx.invoke('speed', [value]);
    } catch {
      speedLabel.textContent = '×?';
    }
    void ctx.refresh();
  };
  speedWrap.append(speedInput, speedLabel);
  topbar.append(clock, where, ctx.ui.h('span', 'gx-spacer'), speedWrap, energy, energyBar, tungsten, credits, ship, charter);

  return {
    root,
    body,
    updateLoose(info: ShellInfo) {
      clock.textContent = info.time ?? '—';
      where.textContent = info.where ?? '';
      if (info.energyKj !== undefined) {
        const capacity = info.capacityKj ?? 300_000;
        const ratio = capacity > 0 ? info.energyKj / capacity : 0;
        energy.textContent = `⚡ ${num(info.energyKj)} / ${num(capacity)} kJ`;
        energy.className = ratio < 0.1 ? 'gx-num gx-bad' : ratio < 0.25 ? 'gx-num gx-warn' : 'gx-num';
        energyBar.replaceChildren(bar(ratio, ratio < 0.1 ? 'bad' : ratio < 0.25 ? 'warn' : undefined));
      }
      if (info.tungsten !== undefined) tungsten.textContent = `钨 ${num(info.tungsten)}`;
      if (info.speed !== undefined) {
        speedInput.value = String(info.speed);
        const minutes = info.baseMinutesPerHomeHour !== undefined ? info.baseMinutesPerHomeHour / info.speed : undefined;
        speedLabel.textContent = minutes === undefined ? `×${info.speed}` : `×${info.speed} · ${minutes < 1 ? minutes.toFixed(2) : Math.round(minutes)} 分/时`;
      }
      if (info.credits !== undefined) credits.textContent = `💳 ${num(info.credits)}`;
    },

    update(state: GenesisPanelState | null) {
      if (!state || state.locked) {
        clock.textContent = '未创世';
        where.textContent = '';
        energy.textContent = '';
        tungsten.textContent = '';
        credits.textContent = '';
        ship.textContent = '';
        charter.textContent = '';
        energyBar.replaceChildren();
        return;
      }
      clock.textContent = state.game?.time ?? '—';
      where.textContent = state.game?.where ?? '';
      const power = state.power;
      if (power) {
        const ratio = power.capacityKj > 0 ? power.energyKj / power.capacityKj : 0;
        energy.textContent = `⚡ ${num(power.energyKj)} / ${num(power.capacityKj)} kJ`;
        energy.className = ratio < 0.1 ? 'gx-num gx-bad' : ratio < 0.25 ? 'gx-num gx-warn' : 'gx-num';
        energyBar.replaceChildren(bar(ratio, ratio < 0.1 ? 'bad' : ratio < 0.25 ? 'warn' : undefined));
        tungsten.textContent = `钨 ${num(power.tungsten)}`;
        credits.textContent = `💳 ${num(power.credits)}`;
        credits.className = 'gx-num gx-dim';
        const charterInfo = power.charter;
        if (charterInfo) {
          const speed = charterInfo.speed ?? 1;
          speedInput.value = String(speed);
          const minutes = charterInfo.baseMinutesPerHomeHour !== undefined ? charterInfo.baseMinutesPerHomeHour / speed : undefined;
          speedLabel.textContent = minutes === undefined ? `×${speed}` : `×${speed} · ${minutes < 1 ? minutes.toFixed(3) : minutes.toFixed(1)} 分/时`;
        }
        const sleepers = power.ship?.sleepers ?? 0;
        if (sleepers > 0) {
          const hours = power.ship?.hoursLeft;
          ship.textContent = hours === null || hours === undefined ? `舱内 ${sleepers} 人` : `舱内 ${sleepers} 人 · 约 ${num(hours)} 时`;
          ship.className = hours !== null && hours !== undefined && hours < 72 ? 'gx-num gx-warn' : 'gx-num gx-dim';
        } else {
          ship.textContent = '';
        }
      } else {
        energy.textContent = '';
        energyBar.replaceChildren();
        tungsten.textContent = '';
        credits.textContent = '';
        ship.textContent = '';
      }
      const c = state.power?.charter;
      if (c?.charter === 'tourism') {
        charter.textContent = `旅游 · 知名度 ${num(c.reputation ?? 0, 0)}`;
        charter.className = 'gx-num gx-ok';
      } else if (c?.charter === 'tech') {
        charter.textContent = `科技 · 算力 ${num(c.compute ?? 0, 1)}`;
        charter.className = 'gx-num gx-ok';
      } else {
        charter.textContent = '';
      }
    },
  };
}
