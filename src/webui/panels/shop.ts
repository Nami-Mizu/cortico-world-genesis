/** 「商店」页签：买卖与订单。 */
import type { WebUiPanel } from 'cortico/web/shared/client-panel.ts';
import type { GenesisShopPanel, GenesisPanelState } from '../../panel-types.ts';
import { text } from '../i18n.ts';
import { createShell } from '../shell.ts';
import { errorText } from '../ui-kit.ts';

export const shopPanel: WebUiPanel = {
  mount(ctx) {
    const t = text(ctx.language);
    const shell = createShell(ctx, { title: t.shopTitle, desc: t.shopDesc });
    const head = ctx.ui.rowbar();
    const statusLine = ctx.ui.msgline();
    const wallet = ctx.ui.h('span', 'mono', '');
    const refreshButton = ctx.ui.button('刷新', { size: 'sm' });
    head.append(refreshButton, statusLine, wallet);

    const sellBox = ctx.ui.h('div', 'gx-card');
    const buyBox = ctx.ui.h('div', 'gx-card');
    const orderBox = ctx.ui.h('div', 'gx-card');
    shell.body.append(head, sellBox, buyBox, orderBox);

    const fmt = (value: number): string => value.toLocaleString('en-US');

    async function act(method: string, args: unknown[]): Promise<void> {
      try {
        const result = await ctx.invoke<{ text?: string; state?: GenesisShopPanel }>(method, args);
        if (result?.text) ctx.ui.toast(result.text, 'ok');
        if (result?.state) render(result.state);
        else await load();
        void ctx.refresh();
      } catch (error) {
        ctx.ui.toast(error instanceof Error ? error.message : String(error), 'bad');
      }
    }

    function buyArgs(row: { id: string; species?: string }): Record<string, unknown> {
      if (row.id === 'random_seed' || row.id === 'premium_seed') {
        return { kind: row.id, ...(row.species ? { species: row.species } : {}) };
      }
      if (row.id === 'fertilizer') return { kind: 'fertilizer', kg: 5 };
      if (row.id === 'cylinder') return { kind: 'cylinder', count: 10 };
      return { kind: row.id };
    }

    function render(panel: GenesisShopPanel): void {
      const open = panel.open;
      statusLine.textContent = open ? t.shopOpenNow : t.shopClosedNow;
      shell.updateLoose({ energyKj: panel.energyKj, capacityKj: panel.capacityKj, credits: panel.credits, tungsten: panel.tungsten });
      wallet.textContent = [
        t.shopCredits + ' ' + fmt(panel.credits),
        t.shopEnergy + ' ' + fmt(panel.energyKj) + ' kJ',
        t.shopTungsten + ' ' + fmt(panel.tungsten) + ' kg',
        t.shopWindowLabel + ' ' + panel.window,
        open ? (panel.closedNote ?? '') : t.shopNextOpen(panel.nextOpenHours),
      ]
        .filter(Boolean)
        .join(' · ');

      sellBox.replaceChildren(ctx.ui.h('h4', '', t.shopSellHeader));
      for (const row of panel.sellables) {
        const line = ctx.ui.h('div');
        line.style.display = 'flex';
        line.style.gap = '8px';
        line.style.alignItems = 'center';
        line.append(
          ctx.ui.h('span', 'mono', row.name + ' · ' + row.priceLabel + ' · ' + row.limitLabel),
          ctx.ui.h('span', 'muted', t.shopHeld(fmt(row.held ?? 0))),
        );
        const sell = ctx.ui.button(t.shopSell(row.name, '1'), {
          size: 'sm',
          onClick: () => void act('sell', [{ id: row.id, amount: 1 }]),
        });
        sell.disabled = !open || (row.held ?? 0) <= 0;
        line.append(sell);
        sellBox.append(line);
      }

      buyBox.replaceChildren(ctx.ui.h('h4', '', t.shopBuyHeader));
      for (const row of panel.buyables) {
        const line = ctx.ui.h('div');
        line.style.display = 'flex';
        line.style.gap = '8px';
        line.style.alignItems = 'center';
        line.append(ctx.ui.h('span', 'mono', row.name + ' · ' + row.priceLabel + ' · ' + row.limitLabel));
        if (row.note) line.append(ctx.ui.h('span', 'muted', row.note));
        const buy = ctx.ui.button(t.shopBuy(row.name), {
          size: 'sm',
          onClick: () => void act('buy', [buyArgs(row)]),
        });
        buy.disabled = !open;
        line.append(buy);
        buyBox.append(line);
      }

      orderBox.replaceChildren(ctx.ui.h('h4', '', t.shopOrdersHeader));
      if (panel.orders.length === 0) {
        orderBox.append(ctx.ui.h('p', 'muted', t.shopNoOrders));
      }
      for (const order of panel.orders) {
        const line = ctx.ui.h('div');
        line.style.display = 'flex';
        line.style.gap = '8px';
        line.style.alignItems = 'center';
        line.append(ctx.ui.h('span', 'mono', order.label));
        if (order.note) line.append(ctx.ui.h('span', 'muted', order.note));
        const deliver = ctx.ui.button(t.shopDeliver, { size: 'sm', onClick: () => void act('order', [{ id: order.id }]) });
        deliver.disabled = !open;
        line.append(deliver);
        orderBox.append(line);
      }
    }

    async function load(): Promise<void> {
      try {
        const panel = await ctx.invoke<GenesisShopPanel>('state', []);
        render(panel);
      } catch (error) {
        statusLine.textContent = error instanceof Error ? error.message : String(error);
      }
    }

    refreshButton.addEventListener('click', () => void load());
    void load();

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
  },
};
