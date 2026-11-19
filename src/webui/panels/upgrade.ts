/** 「升级」页签：升级与维修卡片。 */
import type { WebUiPanel } from 'cortico/web/shared/client-panel.ts';
import type { GenesisUpgradeState, GenesisPanelState } from '../../panel-types.ts';
import { text } from '../i18n.ts';
import { createShell } from '../shell.ts';
import { errorText, field } from '../ui-kit.ts';

export const upgradePanel: WebUiPanel = {
  async mount(ctx) {
    const t = text(ctx.language);
    const shell = createShell(ctx, { title: t.upTitle, desc: t.upDesc });
    const cards = ctx.ui.h('div', 'gx-list');
    shell.body.append(cards);
    const head = ctx.ui.rowbar();
    const energy = ctx.ui.h('span', 'grow', '');
    const refresh = ctx.ui.button(t.upRefresh, {
      size: 'sm',
      onClick: () => {
        void load();
      },
    });
    head.append(energy, refresh);
    shell.body.prepend(head);

    const render = (state: GenesisUpgradeState): void => {
      energy.textContent = state.locked ? t.upLocked : `${t.upEnergy}：${state.energyKj.toLocaleString('en-US')} kJ`;
      shell.updateLoose(state.locked ? {} : { energyKj: state.energyKj, capacityKj: state.capacityKj });
      cards.textContent = '';
      for (const card of state.cards) {
        const box = ctx.ui.h('div', 'gx-card');
        const status =
          card.status === 'ready'
            ? t.upReady
            : card.status === 'repairing'
              ? t.upRepairing
              : card.status === 'maxed'
                ? t.upMaxed
                : t.upBroken;
        const heading = card.level !== undefined ? `${card.label} · lv${card.level}${card.maxLevel ? ` / lv${card.maxLevel}` : ''}` : card.label;
        const title = ctx.ui.h('h3', '', `${heading} · ${status}`);
        title.style.margin = '0 0 6px';
        const flavor = ctx.ui.h('p', 'muted', card.flavor);
        flavor.style.margin = '0 0 8px';
        box.append(title, flavor);
        if (card.window) {
          const now = ctx.ui.h('p', '', `${t.upWindow}：${card.window}${card.limitFactor ? `（${t.upLimit} ×${card.limitFactor}）` : ''}`);
          now.style.margin = '0 0 6px';
          box.append(now);
        }
        if (card.status === 'repairing') {
          const left = ctx.ui.h('p', '', `${t.upRepairing} · 还剩 ${card.leftHomeHours.toFixed(1)} 母星时`);
          box.append(left);
          cards.append(box);
          continue;
        }
        if (card.status === 'maxed') {
          if (card.benefits) box.append(ctx.ui.h('p', 'muted', card.benefits));
          cards.append(box);
          continue;
        }
        const need = ctx.ui.h(
          'p',
          '',
          `${t.upNeed} ${card.costKj.toLocaleString('en-US')} kJ + ` +
            card.materials.map((m) => `${m.name} ${m.needKg} kg（${m.haveKg} kg）`).join('、') +
            ` · ${card.buildHours} 母星时`,
        );
        need.style.margin = '0 0 8px';
        box.append(need);
        if (card.benefits) {
          const benefit = ctx.ui.h('p', 'muted', `${t.upBenefit}：${card.benefits}`);
          benefit.style.margin = '0 0 6px';
          box.append(benefit);
        }
        const button = ctx.ui.button(card.status === 'broken' ? t.upRepair : t.upUpgrade, {
          variant: 'primary',
          size: 'sm',
          onClick: () => {
            void repair(card.id, button);
          },
        });
        if (!card.canRepair) {
          button.disabled = true;
          if (card.blockers.length > 0) {
            box.append(ctx.ui.h('p', 'muted', card.blockers.join('；')));
          }
        }
        box.append(button);
        cards.append(box);
      }
    };

    const load = async (): Promise<void> => {
      try {
        render(await ctx.invoke<GenesisUpgradeState>('state'));
      } catch (error) {
        ctx.ui.toast(errorText(error), 'bad');
      }
    };

    const repair = async (id: string, button: HTMLButtonElement): Promise<void> => {
      button.disabled = true;
      try {
        render(await ctx.invoke<GenesisUpgradeState>('repair', [id]));
        ctx.ui.toast(t.upRepairing, 'ok');
        void ctx.refresh();
      } catch (error) {
        ctx.ui.toast(errorText(error), 'bad');
        button.disabled = false;
      }
    };

    await load();
    // 顶栏（时间/位置/能量/钨/信用点/倍速）来自整份面板状态，四个页签的载荷不是它，单独取一次。
    const refreshHeader = async () => {
      try {
        const full = await ctx.invoke<GenesisPanelState>('header');
        shell.update(full);
      } catch {
        /* 顶栏刷新失败不影响本页 */
      }
    };
    void refreshHeader();
    ctx.interval(() => {
      void refreshHeader();
    }, 10_000);
    ctx.interval(() => {
      void load();
    }, 5000);
  },
};
