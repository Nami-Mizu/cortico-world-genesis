/**
 * 「生命与人事」页签：人口、居所、协议摘要、叫醒、变种。
 *
 * 与「协议」页签的分工：这里只说「人够不够、住得下吗、还差几条」，清单明细在「协议」。
 */
import type { WebUiPanel } from 'cortico/web/shared/client-panel.ts';
import type { GenesisPanelState } from '../../panel-types.ts';
import { text } from '../i18n.ts';
import { createShell, emptyText } from '../shell.ts';
import { errorText } from '../ui-kit.ts';

function num(value: number, digits = 0): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

const panel: WebUiPanel = {
  async mount(ctx) {
    const t = text(ctx.language);
    const shell = createShell(ctx, { title: '生命与人事', desc: '人口、居所、人手里在干什么。叫醒之后他们要吃要喝。' });
    let state: GenesisPanelState | null = null;

    const empty = ctx.ui.h('div', 'gx-empty');
    const msg = ctx.ui.h('div', 'gx-msg');
    msg.hidden = true;
    const peopleCard = ctx.ui.h('div', 'gx-card');
    const houseCard = ctx.ui.h('div', 'gx-card');
    const protocolCard = ctx.ui.h('div', 'gx-card');
    shell.body.append(empty, msg, peopleCard, houseCard, protocolCard);

    const showMsg = (value: string, bad = false): void => {
      msg.textContent = value;
      msg.className = bad ? 'gx-msg gx-bad' : 'gx-msg gx-ok';
      msg.hidden = false;
    };

    const act = async (method: string, args: unknown[] = []): Promise<void> => {
      try {
        const result = await ctx.invoke<unknown>(method, args);
        if (result && typeof result === 'object' && 'power' in (result as object)) {
          state = result as GenesisPanelState;
          const inner = (result as { text?: string }).text;
          if (inner) showMsg(inner);
        } else {
          const payload = result as { text?: string };
          showMsg(payload?.text ?? String(result));
          state = await ctx.invoke<GenesisPanelState>('state', []);
        }
      } catch (e) {
        showMsg(errorText(e), true);
      }
      render();
    };

    const head = (title: string, ...extra: HTMLElement[]): HTMLElement => {
      const bar = ctx.ui.h('div', 'gx-row');
      bar.append(ctx.ui.h('span', 'gx-card-head', title), ctx.ui.h('span', 'gx-gap'), ...extra);
      return bar;
    };

    const renderPeople = (): void => {
      peopleCard.replaceChildren();
      if (!state) return;
      const awake = state.habitats.reduce((sum, h) => sum + h.awake, 0);
      const capacity = state.habitats.length * 20;
      const sleepers = state.power?.ship?.sleepers ?? 0;
      const labor = Math.floor(awake / 5);
      const wake = ctx.ui.button('叫醒一批', {
        size: 'sm',
        variant: 'primary',
        onClick: () => void act('wake', []),
      });
      peopleCard.append(head('人口', wake));
      peopleCard.append(
        ctx.ui.h('div', 'gx-row', `常住 ${num(awake)} / ${num(capacity)} · 休眠舱 ${num(sleepers)} 人 · 人手 ${num(labor)} 份（每 5 人一份）`),
      );
      const ship = state.power?.ship;
      if (ship && ship.sleepers > 0) {
        const hours = ship.hoursLeft === null ? '—' : `${num(ship.hoursLeft)} 母星时`;
        peopleCard.append(ctx.ui.h('div', 'gx-faint', `舱里：粮 ${num(ship.food, 1)} kg · 水 ${num(ship.water)} L · 氧 ${num(ship.oxygen, 1)} kg · 还能撑 ${hours}`));
        peopleCard.append(ctx.ui.h('div', 'gx-faint', '舱空了不会自动去仓库拿货：补舱用仓库的 deposit，building 填「pod」。'));
      }
      if (awake > 0) {
        peopleCard.append(ctx.ui.h('div', 'gx-faint', '人手要「值班终端」才会干活：建终端、绑居所与仓库，然后每天自动收种施肥。'));
      }
    };

    const renderHouses = (): void => {
      houseCard.replaceChildren(head('居所'));
      const list = ctx.ui.h('div', 'gx-list');
      if ((state?.habitats ?? []).length === 0) list.append(ctx.ui.h('div', 'gx-empty', '还没有居所：先建一座（人只接受 5–32℃ 的室内）。'));
      for (const habitat of state?.habitats ?? []) {
        const rowEl = ctx.ui.h('div', 'gx-item');
        rowEl.append(ctx.ui.h('span', 'gx-num', `${habitat.nickname} · ${habitat.awake}/${habitat.awake + habitat.dormant} 人`));
        rowEl.append(
          ctx.ui.h('span', 'gx-dim', `粮 ${num(habitat.food, 1)} · 水 ${num(habitat.water)} · 氧 ${num(habitat.oxygen, 1)} · 还能撑 ${num(habitat.hoursLeft)} 时`),
        );
        const structure = (state?.structures ?? []).find((item) => item.siteKey && item.kind === 'habitat' && item.interiorC !== undefined);
        if (structure?.interiorC !== undefined) {
          const tone = structure.comfort === 'ok' ? 'gx-ok' : 'gx-warn';
          rowEl.append(ctx.ui.h('span', tone, `室内 ${structure.interiorC}℃`));
        }
        list.append(rowEl);
      }
      houseCard.append(list);
    };

    const renderProtocol = (): void => {
      protocolCard.replaceChildren(head('协议进度'));
      const protocol = state?.protocol;
      if (!protocol) {
        protocolCard.append(ctx.ui.h('div', 'gx-faint', '协议清单在「协议」页签。'));
        return;
      }
      protocolCard.append(ctx.ui.h('div', 'gx-row', `${protocol.done} / ${protocol.total} 条 · ${protocol.awakened ? '已经叫醒' : protocol.complete ? '可以叫醒了' : '还差几条'}`));
      const undone = protocol.tasks.filter((task) => !task.done).slice(0, 4);
      const list = ctx.ui.h('div', 'gx-list');
      for (const task of undone) {
        const rowEl = ctx.ui.h('div', 'gx-item');
        rowEl.append(ctx.ui.h('span', 'gx-warn', '●'), ctx.ui.h('span', 'gx-num', task.title), ctx.ui.h('span', 'gx-faint', task.progress));
        list.append(rowEl);
      }
      if (undone.length === 0) list.append(ctx.ui.h('div', 'gx-ok', '清单已经全绿。'));
      protocolCard.append(list);
    };

    const render = (): void => {
      shell.update(state);
      if (!state || state.locked) {
        empty.textContent = emptyText(state);
        for (const card of [peopleCard, houseCard, protocolCard]) card.hidden = true;
        return;
      }
      empty.textContent = '';
      for (const card of [peopleCard, houseCard, protocolCard]) card.hidden = false;
      renderPeople();
      renderHouses();
      renderProtocol();
    };

    state = await ctx.invoke<GenesisPanelState>('state', []);
    render();
  },
};

export default panel;
