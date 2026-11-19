/**
 * 「工业」页签：能量与设备、已建建筑、建造、跨星航行、奇观。
 */
import type { WebUiPanel } from 'cortico/web/shared/client-panel.ts';
import type { GenesisPanelState } from '../../panel-types.ts';
import { text } from '../i18n.ts';
import { createShell, emptyText } from '../shell.ts';
import { errorText } from '../ui-kit.ts';

function num(value: number, digits = 0): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

const KINDS: Array<[string, string]> = [
  ['', '农业与食物'],
  ['greenhouse', '温室核心'],
  ['planter', '种植盆'],
  ['pump', '抽水机'],
  ['purifier', '净水器'],
  ['kiln', '炭窑'],
  ['sealer', '封装器'],
  ['mutation_room', '诱变室'],
  ['feed_trough', '喂食槽'],
  ['fence', '围栏'],
  ['scarecrow', '稻草人'],
  ['biome_changer', '群系改变器'],
  ['', '仓储与物流'],
  ['warehouse', '仓库'],
  ['cold_store', '冷库'],
  ['inert_room', '惰性气体室'],
  ['terminal', '交易终端'],
  ['storage_terminal', '仓储终端'],
  ['arm', '机械臂'],
  ['drone_cluster', '无人机集群'],
  ['rocket', '火箭'],
  ['', '电力与工业'],
  ['rectifier', '整流电塔'],
  ['wind', '风力发电站'],
  ['fire', '火力发电站'],
  ['converter', '气液转换机'],
  ['atmo_extractor', '大气提取机'],
  ['miner', '采矿机'],
  ['', '生命与人事'],
  ['habitat', '居所'],
  ['duty', '值班终端'],
  ['carrier', '空天母舰'],
  ['', '旅游线'],
  ['tourism_dock', '观光塔台（旅游）'],
  ['visitor_lodge', '访客驿站（旅游）'],
  ['tour_line', '观光线路站（旅游）'],
  ['souvenir', '纪念品店（旅游）'],
  ['', '科技线'],
  ['recruit_office', '招募站（科技）'],
  ['staff_housing', '员工公寓（科技）'],
  ['fab', '晶圆厂（科技）'],
  ['compute_array', '计算阵列（科技）'],
  ['heavy_water', '重水提取器（科技）'],
  ['enrichment', '富集塔（科技）'],
  ['', '安装件（不进施工队列，装完立即可用）'],
  ['sail', '太阳能帆'],
  ['monitor', '环境监测器'],
  ['counter', '凌日计数器'],
  ['cooler', '制冷核心（装在温室上）'],
  ['heater', '制热核心（装在温室上）'],
  ['realism', '拟真核心（装在温室上）'],
];

const WONDERS: Array<[string, string]> = [
  ['sky_ring', '天穹环'],
  ['under_ice_eye', '冰下之眼'],
  ['silicon_valley', '硅谷'],
  ['orbital_mirror', '轨道镜阵'],
  ['s2_engine', '拟造S2机关'],
];

const panel: WebUiPanel = {
  async mount(ctx) {
    const t = text(ctx.language);
    const shell = createShell(ctx, { title: '工业', desc: '电、建筑、建造、航行。手摇出来的电先存进电池。' });
    let state: GenesisPanelState | null = null;

    const empty = ctx.ui.h('div', 'gx-empty');
    const msg = ctx.ui.h('div', 'gx-msg');
    msg.hidden = true;
    const powerCard = ctx.ui.h('div', 'gx-card');
    const buildCard = ctx.ui.h('div', 'gx-card');
    const listCard = ctx.ui.h('div', 'gx-card');
    const travelCard = ctx.ui.h('div', 'gx-card');
    const wonderCard = ctx.ui.h('div', 'gx-card');
    shell.body.append(empty, msg, powerCard, buildCard, listCard, travelCard, wonderCard);

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

    const renderPower = (): void => {
      powerCard.replaceChildren();
      const power = state?.power;
      if (!power) return;
      const ratio = power.capacityKj > 0 ? power.energyKj / power.capacityKj : 0;
      const press = ctx.ui.button('手摇一次', { size: 'sm', variant: 'primary', onClick: () => void act('press', []) });
      const sail = ctx.ui.button('建太阳能帆', { size: 'sm', onClick: () => void act('install', [{ id: 'sail' }]) });
      const monitor = ctx.ui.button('装环境监测器', { size: 'sm', onClick: () => void act('monitor', []) });
      powerCard.append(head('能量与设备', press, sail, monitor));
      powerCard.append(
        ctx.ui.h('div', 'gx-row', `⚡ ${num(power.energyKj)} / ${num(power.capacityKj)} kJ（${Math.round(ratio * 100)}%）`),
        ctx.ui.h('div', 'gx-row', `钨 ${num(power.tungsten)} kg · 太阳能帆 ${power.sails} 台`),
      );
      if (power.grid) {
        powerCard.append(
          ctx.ui.h('div', 'gx-row', `电网 ${num(power.grid.storedKj)} / ${num(power.grid.capacityKj)} kJ · ${power.grid.hasTower ? (power.grid.reachable ? '在电塔旁（可搬电）' : '电塔在别处') : '没有电塔'}`),
        );
        // 电网搬电：一次 10,000 kJ，要站在电塔旁边（服务端会校验）。
        const kjInput = ctx.ui.input({ type: 'number', value: '10000' }) as HTMLInputElement;
        kjInput.min = '100';
        kjInput.style.width = '90px';
        const gridIn = ctx.ui.button('存进电网', {
          size: 'sm',
          onClick: () => void act('storeDo', [{ action: 'grid_in', kj: Number(kjInput.value) || 10000 }]),
        });
        const gridOut = ctx.ui.button('从电网取', {
          size: 'sm',
          onClick: () => void act('storeDo', [{ action: 'grid_out', kj: Number(kjInput.value) || 10000 }]),
        });
        gridIn.disabled = !power.grid.hasTower || !power.grid.reachable;
        gridOut.disabled = gridIn.disabled;
        const gridRow = ctx.ui.h('div', 'gx-row');
        gridRow.append(kjInput, gridIn, gridOut);
        powerCard.append(ctx.ui.h('div', 'gx-row', '电网搬电（一次最多 10,000 kJ）'), gridRow);
      }
    };

    const renderBuild = (): void => {
      const select = ctx.ui.select({ options: KINDS.map(([value, label]) => ({ value, label })) }) as HTMLSelectElement;
      const button = ctx.ui.button('建在脚下', {
        size: 'sm',
        variant: 'primary',
        onClick: () => void act('install', [{ id: select.value }]),
      });
      buildCard.replaceChildren(head('建造', select, button));
      if (state?.builds.length) {
        buildCard.append(
          ctx.ui.h('div', 'gx-faint', `施工中：${state.builds.map((b) => `${b.label}（还剩 ${num(b.leftHomeHours, 1)} 时）`).join(' · ')}`),
        );
      } else {
        buildCard.append(ctx.ui.h('div', 'gx-faint', `施工队列 ${state?.builds.length ?? 0} / ${state?.buildSlots ?? 1}`));
      }
    };

    const renderList = (): void => {
      listCard.replaceChildren(head('已建建筑'));
      const list = ctx.ui.h('div', 'gx-list');
      for (const item of state?.structures ?? []) {
        const rowEl = ctx.ui.h('div', 'gx-item');
        rowEl.append(ctx.ui.h('span', 'gx-num', `${item.label} · ${item.siteKey}`));
        if (item.capKg > 0) rowEl.append(ctx.ui.h('span', 'gx-dim', `${num(item.usedKg, 1)} / ${num(item.capKg)} kg`));
        if (item.interiorC !== undefined) rowEl.append(ctx.ui.h('span', 'gx-dim', `室内 ${item.interiorC}℃`));
        if (item.armText) rowEl.append(ctx.ui.h('span', 'gx-dim', item.armText));
        if (item.dutyText) rowEl.append(ctx.ui.h('span', 'gx-dim', item.dutyText));
        rowEl.append(
          ctx.ui.button('走过去', { size: 'sm', onClick: () => void act('move', [{ latDeg: item.latDeg, lonDeg: item.lonDeg }]) }),
        );
        list.append(rowEl);
      }
      if ((state?.structures ?? []).length === 0) list.append(ctx.ui.h('div', 'gx-empty', '还没有建筑。'));
      listCard.append(list);
    };

    const renderTravel = (): void => {
      travelCard.replaceChildren(head('跨星航行'));
      const list = ctx.ui.h('div', 'gx-chips');
      for (const body of state?.bodies ?? []) {
        if (body.kind === 'moon') continue;
        list.append(
          ctx.ui.button(body.label, {
            size: 'sm',
            onClick: () => void act('move', [{ kind: 'interstellar', target: body.key }]),
          }),
        );
      }
      travelCard.append(list, ctx.ui.h('div', 'gx-faint', '要先把【机动核心】修好、并且看得见（观星）或者手里有星图。'));
    };

    const renderWonders = (): void => {
      wonderCard.replaceChildren(head('奇观'));
      const charter = state?.power?.charter;
      if (!charter || charter.charter === null) {
        wonderCard.append(ctx.ui.h('div', 'gx-faint', '还没买执照：去「商店」买一张星际广播。'));
        return;
      }
      if (charter.wonder) {
        wonderCard.append(ctx.ui.h('div', 'gx-row', `${charter.wonder.label} · ${Math.round(charter.wonder.progress * 100)}%（断电会烂尾）`));
      } else {
        const chips = ctx.ui.h('div', 'gx-chips');
        for (const [id, label] of WONDERS) {
          chips.append(ctx.ui.button(`造${label}`, { size: 'sm', onClick: () => void act('wonder', [{ id }]) }));
        }
        wonderCard.append(chips);
      }
      if (charter.wonders.length > 0) wonderCard.append(ctx.ui.h('div', 'gx-faint', `已落成：${charter.wonders.join(' · ')}`));
    };

    const render = (): void => {
      shell.update(state);
      if (!state || state.locked) {
        empty.textContent = emptyText(state);
        for (const card of [powerCard, buildCard, listCard, travelCard, wonderCard]) card.hidden = true;
        return;
      }
      empty.textContent = '';
      for (const card of [powerCard, buildCard, listCard, travelCard, wonderCard]) card.hidden = false;
      renderPower();
      renderBuild();
      renderList();
      renderTravel();
      renderWonders();
    };

    state = await ctx.invoke<GenesisPanelState>('state', []);
    render();
  },
};

export default panel;
