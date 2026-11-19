/**
 * 「概况」页签：一屏回答「我现在怎么样、下一步该干什么」。
 *
 * 只读：不发命令，所有动作仍然在各自页签里做（避免两套入口的语义漂移）。
 */
import type { WebUiPanel } from 'cortico/web/shared/client-panel.ts';
import type { GenesisPanelState } from '../../panel-types.ts';
import { text } from '../i18n.ts';
import { createShell, emptyText } from '../shell.ts';

function num(value: number, digits = 0): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function card(ctx: Parameters<WebUiPanel['mount']>[0], title: string): { el: HTMLElement; body: HTMLElement } {
  const el = ctx.ui.h('div', 'gx-card');
  const body = ctx.ui.h('div');
  el.append(ctx.ui.h('div', 'gx-card-head', title), body);
  return { el, body };
}

function row(ctx: Parameters<WebUiPanel['mount']>[0], key: string, value: string, tone?: string): HTMLElement {
  const line = ctx.ui.h('div', 'gx-row');
  line.append(ctx.ui.h('span', 'gx-k', key), ctx.ui.h('span', 'gx-gap'), ctx.ui.h('span', tone ? `gx-v ${tone}` : 'gx-v', value));
  return line;
}

/** 只用已有载荷推「下一步」，不猜服务端没给的东西。 */
function nextSteps(state: GenesisPanelState): Array<{ label: string; tone: 'bad' | 'warn' | 'ok'; tab: string }> {
  const out: Array<{ label: string; tone: 'bad' | 'warn' | 'ok'; tab: string }> = [];
  const power = state.power;
  const ship = power?.ship;
  const people = state.habitats.reduce((sum, h) => sum + h.awake, 0);
  const pending = state.protocol ? state.protocol.total - state.protocol.done : 0;

  if (ship && ship.sleepers > 0 && ship.hoursLeft !== null && ship.hoursLeft < 72) {
    out.push({ label: `着陆舱的氧气只够约 ${num(ship.hoursLeft)} 母星时：先去种、去产氧`, tone: 'bad', tab: '农场' });
  }
  if (power && power.capacityKj > 0 && power.energyKj < power.capacityKj * 0.1) {
    out.push({ label: '电快见底：手摇一下，或者去「工业」建太阳能帆', tone: 'bad', tab: '工业' });
  }
  if (people === 0 && ship && ship.sleepers > 0) {
    out.push({ label: '还没叫醒任何人：协议清单在「协议」页', tone: 'warn', tab: '协议' });
  }
  if (state.buildQueueFull) {
    out.push({ label: '施工队列满了：去「升级」修子代理', tone: 'warn', tab: '升级' });
  }
  if (pending > 0) {
    out.push({ label: `协议还差 ${pending} 项（共 ${state.protocol?.total ?? 0}）`, tone: 'warn', tab: '协议' });
  }
  if (out.length === 0) out.push({ label: '没有卡住的事：可以去「地表」看看地图，或者推一推进度', tone: 'ok', tab: '地表' });
  return out.slice(0, 4);
}

const panel: WebUiPanel = {
  async mount(ctx) {
    const t = text(ctx.language);
    const shell = createShell(ctx, { title: t.title, desc: t.desc ?? '' });
    let state: GenesisPanelState | null = null;

    const lockedNote = ctx.ui.h('div', 'gx-empty');
    const status = card(ctx, '状况');
    const vital = card(ctx, '要紧的数');
    const todo = card(ctx, '下一步');
    shell.body.append(lockedNote, status.el, vital.el, todo.el);

    const render = (): void => {
      shell.update(state);
      if (!state || state.locked) {
        lockedNote.textContent = emptyText(state);
        status.body.replaceChildren();
        vital.body.replaceChildren();
        todo.body.replaceChildren();
        return;
      }
      lockedNote.textContent = '';

      status.body.replaceChildren(
        row(ctx, '时间', state.game?.time ?? '—'),
        row(ctx, '位置', state.game?.where ?? '—'),
        row(ctx, '状态', state.game?.transit ?? '没有在移动', state.game?.transit ? 'gx-warn' : 'gx-ok'),
        row(ctx, '历法', state.game?.calendar ?? '—', 'gx-dim'),
      );

      const power = state.power;
      const ship = power?.ship;
      const people = state.habitats.reduce((sum, h) => sum + h.awake, 0);
      const capacity = state.habitats.length * 20;
      const food = ship ? `${num(ship.food, 1)} kg` : '—';
      const water = ship ? `${num(ship.water, 0)} L` : '—';
      const oxygen = ship ? `${num(ship.oxygen, 1)} kg` : '—';
      const hours = ship?.hoursLeft;
      const grid = ctx.ui.h('div', 'gx-grid-3');
      const cells: Array<[string, string, string?]> = [
        ['常住人口', `${num(people)} / ${num(capacity)}`, people === 0 ? 'gx-warn' : 'gx-ok'],
        ['着陆舱 · 粮', food],
        ['着陆舱 · 水', water],
        ['着陆舱 · 氧', oxygen],
        ['还能撑', hours === null || hours === undefined ? '—' : `${num(hours)} 母星时`, hours !== null && hours !== undefined && hours < 72 ? 'gx-bad' : undefined],
        ['电', power ? `${num(power.energyKj)} kJ` : '—'],
        ['信用点', power ? num(power.credits) : '—'],
        ['钨', power ? `${num(power.tungsten)} 份` : '—'],
      ];
      for (const [k, v, tone] of cells) {
        const cell = ctx.ui.h('div');
        cell.append(row(ctx, k, v, tone));
        grid.append(cell);
      }
      vital.body.replaceChildren(grid);

      const steps = nextSteps(state);
      const list = ctx.ui.h('div', 'gx-list');
      for (const step of steps) {
        const item = ctx.ui.h('div', 'gx-item');
        const light = step.tone === 'bad' ? 'gx-bad' : step.tone === 'warn' ? 'gx-warn' : 'gx-ok';
        item.append(ctx.ui.h('span', light, '●'), ctx.ui.h('span', 'gx-num', step.label), ctx.ui.h('span', 'gx-gap'), ctx.ui.h('span', 'gx-faint', step.tab));
        list.append(item);
      }
      todo.body.replaceChildren(list);
    };

    const load = async (): Promise<void> => {
      state = await ctx.invoke<GenesisPanelState>('state', []);
      render();
    };
    await load();
  },
};

export default panel;
