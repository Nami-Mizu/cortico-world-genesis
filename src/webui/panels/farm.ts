/**
 * 「农场」页签：站点、作物、种子、温室、种植盆、护地与喂食。
 *
 * 只做用地里那些事；建造、升级、航行在「工业」，人口在「生命」。
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
    const shell = createShell(ctx, { title: '农场', desc: '站点、作物、种子、温室。建站先走到有地的地方。' });
    let state: GenesisPanelState | null = null;
    let siteKey = '';

    const empty = ctx.ui.h('div', 'gx-empty');
    const msg = ctx.ui.h('div', 'gx-msg');
    msg.hidden = true;
    const sitesCard = ctx.ui.h('div', 'gx-card');
    const cropsCard = ctx.ui.h('div', 'gx-card');
    const seedsCard = ctx.ui.h('div', 'gx-card');
    const houseCard = ctx.ui.h('div', 'gx-card');
    shell.body.append(empty, msg, sitesCard, cropsCard, seedsCard, houseCard);

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
          render();
          return;
        }
        const payload = result as { text?: string };
        showMsg(payload?.text ?? String(result));
        state = await ctx.invoke<GenesisPanelState>('state', []);
        render();
      } catch (e) {
        showMsg(errorText(e), true);
      }
    };

    const flora = () => state?.flora ?? null;

    const head = (title: string, ...extra: HTMLElement[]): HTMLElement => {
      const bar = ctx.ui.h('div', 'gx-row');
      bar.append(ctx.ui.h('span', 'gx-card-head', title), ctx.ui.h('span', 'gx-gap'), ...extra);
      return bar;
    };

    const renderSites = (): void => {
      const f = flora();
      sitesCard.replaceChildren();
      if (!f) return;
      const buildSite = ctx.ui.button('在这儿建站', { size: 'sm', variant: 'primary', onClick: () => void act('site', []) });
      sitesCard.append(head('站点', buildSite));
      if (f.sites.length === 0) {
        sitesCard.append(ctx.ui.h('div', 'gx-empty', '还没有站点：走到一块陆地上，点「在这儿建站」。'));
        return;
      }
      for (const site of f.sites) {
        const rowEl = ctx.ui.h('div', 'gx-item');
        const active = site.key === siteKey;
        const pick = ctx.ui.button(site.key, {
          size: 'sm',
          variant: active ? 'primary' : undefined,
          onClick: () => {
            siteKey = site.key;
            render();
          },
        });
        const wet = site.wetness === null || site.wetness === undefined ? '—' : `${Math.round(site.wetness * 100)}%`;
        const fert = site.fertility === null || site.fertility === undefined ? '—' : `${Math.round(site.fertility * 100)}%`;
        rowEl.append(
          pick,
          ctx.ui.h('span', 'gx-dim', `${site.kind === 'water' ? '水边湿地' : '旱地'} · 湿 ${wet} · 肥 ${fert} · ${site.plants} 株/群${site.ripe > 0 ? ` · ${site.ripe} 熟` : ''}`),
        );
        sitesCard.append(rowEl);
      }
    };

    const renderCrops = (): void => {
      const f = flora();
      cropsCard.replaceChildren();
      if (!f) return;
      cropsCard.append(head('作物'));
      const crops = f.crops ?? [];
      if (crops.length === 0) {
        cropsCard.append(ctx.ui.h('div', 'gx-empty', '还没有作物：在种子区选一袋，种到站点或种植盆里。'));
        return;
      }
      for (const crop of crops.slice(0, 40)) {
        const rowEl = ctx.ui.h('div', 'gx-item');
        const label = `${crop.name} ${crop.id} · ${crop.site}`;
        rowEl.append(ctx.ui.h('span', crop.dead ? 'gx-bad' : 'gx-num', label), ctx.ui.h('span', 'gx-dim', `${crop.stage} ${Math.round(crop.progress * 100)}%`));
        const buttons: HTMLElement[] = [];
        if (crop.ripe) buttons.push(ctx.ui.button('收', { size: 'sm', onClick: () => void act('harvest', [crop.site, crop.id]) }));
        buttons.push(ctx.ui.button('详情', { size: 'sm', onClick: () => void act('inspect', [crop.id, crop.site]) }));
        if (!crop.dead) {
          buttons.push(ctx.ui.button('留种', { size: 'sm', onClick: () => void act('breed', [crop.id, crop.site, 'self']) }));
          buttons.push(ctx.ui.button('移栽', { size: 'sm', onClick: () => void act('transplant', [crop.id, crop.site]) }));
        }
        if (crop.dead || crop.health < 20) {
          buttons.push(ctx.ui.button('拔掉', { size: 'sm', onClick: () => void act('remove', [crop.id, crop.site]) }));
        }
        rowEl.append(...buttons);
        cropsCard.append(rowEl);
      }
    };

    const renderSeeds = (): void => {
      const f = flora();
      seedsCard.replaceChildren();
      if (!f) return;
      const planterSelect = ctx.ui.select({
        options: [
          { value: '', label: '种到：选中的站点' },
          ...(f.planters ?? []).map((p) => ({ value: p.key, label: `${p.key}（${p.plants}/3）` })),
        ],
      }) as HTMLSelectElement;
      seedsCard.append(head('种子', planterSelect));
      if (f.bags.length === 0) {
        seedsCard.append(ctx.ui.h('div', 'gx-empty', '没有种子：商店买、留种、或者移栽回来。'));
      }
      for (const bag of f.bags) {
        const rowEl = ctx.ui.h('div', 'gx-item');
        rowEl.append(ctx.ui.h('span', 'gx-num', `${bag.premium ? '高级' : '随机'} · ${bag.name} ×${bag.count}`));
        rowEl.append(
          ctx.ui.button('种下', {
            size: 'sm',
            onClick: () => {
              const target = planterSelect.value !== '' ? planterSelect.value : siteKey;
              if (!target) {
                showMsg('先选一个站点（或者一只种植盆）。', true);
                return;
              }
              void act('plant', [bag.id, target]);
            },
          }),
        );
        seedsCard.append(rowEl);
      }
      const inv = (f.inventory ?? []).filter((item) => item.amount > 0);
      if (inv.length > 0) {
        seedsCard.append(ctx.ui.h('div', 'gx-faint', `背包：${inv.map((item) => `${item.name} ${num(item.amount, item.amount < 10 ? 1 : 0)}`).join(' · ')}`));
      }
      const fert = (f.inventory ?? []).find((item) => item.id === 'fertilizer');
      if (fert && fert.amount > 0) {
        seedsCard.append(
          ctx.ui.button('给选中站点撒 1 kg 复合肥', {
            size: 'sm',
            onClick: () => void act('fertilize', [1, siteKey]),
          }),
        );
      }
    };

    const renderHouse = (): void => {
      const f = flora();
      houseCard.replaceChildren();
      if (!f) return;
      houseCard.append(head('温室与种植盆'));
      const list = ctx.ui.h('div', 'gx-list');
      const greenhouses = state?.greenhouses ?? [];
      if (greenhouses.length === 0) list.append(ctx.ui.h('div', 'gx-empty', '还没有温室：温室按站点生效，整站作物都算。'));
      for (const gh of greenhouses) {
        const rowEl = ctx.ui.h('div', 'gx-item');
        const inside = gh.interiorC === null ? '断电' : `${gh.interiorC}℃`;
        rowEl.append(ctx.ui.h('span', 'gx-num', `${gh.siteKey} · ${gh.targetC === null ? '自动' : `设定 ${gh.targetC}℃`} · 室内 ${inside}（室外 ${gh.ambientC ?? '—'}℃）`));
        const slider = ctx.ui.h('input') as HTMLInputElement;
        slider.type = 'range';
        slider.value = gh.targetC === null ? '0' : String(gh.targetC);
        slider.min = '-60';
        slider.max = '80';
        slider.step = '1';
        slider.onchange = () => {
          const value = Number(slider.value);
          // 滑杆调的是「设定点」，不是「再建一座温室」：id 必须是 setpoint。
          void act('install', [{ id: 'setpoint', site: gh.siteKey, tempC: value === 0 ? 'auto' : value }]);
        };
        rowEl.append(slider);
        list.append(rowEl);
      }
      for (const planter of f.planters ?? []) {
        const rowEl = ctx.ui.h('div', 'gx-item');
        rowEl.append(ctx.ui.h('span', 'gx-num', `${planter.key} · ${planter.plants}/3${planter.ripe > 0 ? ` · ${planter.ripe} 熟` : ''}`));
        rowEl.append(ctx.ui.h('span', 'gx-dim', planter.powered ? `通电 · 室外 ${planter.ambientC ?? '—'}℃` : '断电（跟室外）'));
        list.append(rowEl);
      }
      houseCard.append(list);
      const build = ctx.ui.h('div', 'gx-row');
      for (const [kind, label] of [
        ['greenhouse', '建温室核心'],
        ['planter', '建种植盆'],
        ['fence', '建围栏'],
        ['scarecrow', '建稻草人'],
        ['feed_trough', '建喂食槽'],
      ] as const) {
        build.append(ctx.ui.button(label, { size: 'sm', onClick: () => void act('install', [{ id: kind, site: siteKey }]) }));
      }
      houseCard.append(build);
    };

    const render = (): void => {
      shell.update(state);
      if (!state || state.locked) {
        empty.textContent = emptyText(state);
        for (const card of [sitesCard, cropsCard, seedsCard, houseCard]) card.hidden = true;
        return;
      }
      empty.textContent = '';
      for (const card of [sitesCard, cropsCard, seedsCard, houseCard]) card.hidden = false;
      if (!siteKey || !(state.flora?.sites ?? []).some((site) => site.key === siteKey)) {
        siteKey = state.flora?.sites[0]?.key ?? '';
      }
      renderSites();
      renderCrops();
      renderSeeds();
      renderHouse();
    };

    state = await ctx.invoke<GenesisPanelState>('state', []);
    render();
  },
};

export default panel;
