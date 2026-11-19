/**
 * 「地表」页签：地图、看附近、走一段、等一会、探矿脉（质谱仪）、测绘、观星。
 *
 * 只做「在当前这颗星上」的事；跨星航行在「工业」页（有推进器与鳍的地方）。
 */
import type { WebUiPanel } from 'cortico/web/shared/client-panel.ts';
import type { GenesisPanelState, GenesisSurfaceMap } from '../../panel-types.ts';
import { text } from '../i18n.ts';
import { drawMap } from '../map.ts';
import { createShell, emptyText } from '../shell.ts';
import { errorText } from '../ui-kit.ts';

function num(value: number, digits = 0): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

const panel: WebUiPanel = {
  async mount(ctx) {
    const t = text(ctx.language);
    const shell = createShell(ctx, { title: t.mapTitle, desc: '地图、看附近、走一段、等一会。跨星航行在「工业」页签。' });
    let state: GenesisPanelState | null = null;
    let bodyKey = '';
    let map: GenesisSurfaceMap | null = null;

    const empty = ctx.ui.h('div', 'gx-empty');
    const cardMap = ctx.ui.h('div', 'gx-card');
    const cardLook = ctx.ui.h('div', 'gx-card');
    const cardAct = ctx.ui.h('div', 'gx-card');
    const canvas = ctx.ui.h('canvas') as HTMLCanvasElement;
    canvas.style.width = '100%';
    canvas.style.imageRendering = 'pixelated';
    canvas.style.borderRadius = '6px';
    canvas.style.display = 'block';
    const legend = ctx.ui.h('div', 'gx-legend');
    const lookPre = ctx.ui.h('pre', 'gx-pre');
    lookPre.style.display = 'none';
    const picker = ctx.ui.h('div', 'gx-chips');
    const msg = ctx.ui.h('div', 'gx-msg');
    msg.hidden = true;

    const mapWrap = ctx.ui.h('div', 'gx-mapwrap');
    mapWrap.append(canvas);
    cardMap.append(ctx.ui.h('div', 'gx-card-head', t.mapTitle), picker, legend, mapWrap);
    cardLook.append(ctx.ui.h('div', 'gx-card-head', t.lookHere), lookPre);
    cardAct.append(ctx.ui.h('div', 'gx-card-head', '动作'), msg);
    shell.body.append(empty, cardMap, cardLook, cardAct);

    const showMsg = (value: string, bad = false): void => {
      msg.textContent = value;
      msg.className = bad ? 'gx-msg gx-bad' : 'gx-msg gx-ok';
      msg.hidden = false;
    };

    const run = async (method: string, args: unknown[] = [], consumeState = false): Promise<void> => {
      try {
        const result = await ctx.invoke<unknown>(method, args);
        if (consumeState && result && typeof result === 'object' && 'power' in (result as object)) {
          state = result as GenesisPanelState;
          render();
          const inner = (result as { text?: string }).text;
          if (inner) showMsg(inner);
          return;
        }
        const payload = result as { text?: string };
        showMsg(payload?.text ?? String(result));
      } catch (e) {
        showMsg(errorText(e), true);
      }
    };

    const refreshMap = async (): Promise<void> => {
      if (!state || state.locked) {
        map = null;
        return;
      }
      try {
        map = await ctx.invoke<GenesisSurfaceMap>('map', [bodyKey]);
      } catch (e) {
        map = null;
        showMsg(errorText(e), true);
      }
      draw();
    };

    const draw = (): void => {
      if (!map) {
        canvas.width = 0;
        canvas.height = 0;
        legend.replaceChildren();
        return;
      }
      drawMap(canvas, map, state?.territories ?? []);
      const seen = new Set<number>();
      legend.replaceChildren();
      for (const row of map.biome) {
        for (const id of row) {
          if (seen.has(id)) continue;
          seen.add(id);
          const chip = ctx.ui.h('span', 'gx-chip');
          const dot = ctx.ui.h('span', 'gx-dot');
          dot.style.background = mapColor(id);
          chip.append(dot, ctx.ui.h('span', 'gx-faint', String(id)));
          legend.append(chip);
        }
      }
    };

    const mapColor = (id: number): string => {
      const palette = ['#1d4ed8', '#e5edf7', '#c2a35a', '#b7a06a', '#8bbf6b', '#5f9e4f', '#2f7a3f', '#1f6b3a', '#0f5a33', '#345e6e', '#6c7a83', '#9a9aa0', '#9fd0e8', '#5ba6c9', '#4a7fb5', '#7a5fb5', '#c14b6b'];
      return palette[id] ?? '#555';
    };

    const rebuildPicker = (): void => {
      picker.replaceChildren();
      if (!state) return;
      for (const body of state.bodies) {
        if (body.kind === 'moon') continue;
        const active = body.key === bodyKey;
        const chip = ctx.ui.button(`${body.label}`, {
          size: 'sm',
          variant: active ? 'primary' : undefined,
          onClick: () => {
            bodyKey = body.key;
            rebuildPicker();
            void refreshMap();
          },
        });
        picker.append(chip);
      }
    };

    const render = (): void => {
      shell.update(state);
      if (!state || state.locked) {
        empty.textContent = emptyText(state);
        cardMap.hidden = true;
        cardLook.hidden = true;
        cardAct.hidden = true;
        return;
      }
      empty.textContent = '';
      cardMap.hidden = false;
      cardLook.hidden = false;
      cardAct.hidden = false;
      if (!bodyKey || !state.bodies.some((b) => b.key === bodyKey)) bodyKey = state.bodies.find((b) => b.kind !== 'moon')?.key ?? '';
      rebuildPicker();
    };

    // —— 动作区 ——
    const latInput = ctx.ui.input({ value: '0' }) as HTMLInputElement;
    const lonInput = ctx.ui.input({ value: '0' }) as HTMLInputElement;
    const goButton = ctx.ui.button('走过去', {
      size: 'sm',
      variant: 'primary',
      onClick: () => {
        void run('move', [{ latDeg: Number(latInput.value), lonDeg: Number(lonInput.value) }], true);
      },
    });
    const hereButton = ctx.ui.button('填脚下的经纬', {
      size: 'sm',
      onClick: () => {
        if (!state?.location) return;
        latInput.value = state.location.latDeg.toFixed(1);
        lonInput.value = state.location.lonDeg.toFixed(1);
      },
    });
    const lookButton = ctx.ui.button(t.lookHere, { size: 'sm', onClick: () => void run('look', []) });
    const waitButton = ctx.ui.button('等 1 时', { size: 'sm', onClick: () => void run('wait', [{ until: 'hours', hours: 1 }], true) });
    const noonButton = ctx.ui.button('等到中午', { size: 'sm', onClick: () => void run('wait', [{ until: 'noon' }], true) });
    const veinsButton = ctx.ui.button('探矿脉', { size: 'sm', onClick: () => void run('veins', []) });
    const surveyButton = ctx.ui.button('测绘一圈', { size: 'sm', onClick: () => void run('survey', [], true) });
    const stargazeButton = ctx.ui.button('观星', { size: 'sm', onClick: () => void run('stargaze', []) });

    const travel = ctx.ui.h('div', 'gx-row');
    travel.append(ctx.ui.h('span', 'gx-k', '去哪'), latInput, lonInput, goButton, hereButton);
    const quick = ctx.ui.h('div', 'gx-row');
    quick.append(lookButton, waitButton, noonButton, veinsButton, surveyButton, stargazeButton);
    cardAct.append(travel, quick);

    const load = async (): Promise<void> => {
      state = await ctx.invoke<GenesisPanelState>('state', []);
      render();
      await refreshMap();
      void run('look', []);
    };
    await load();
  },
};

export default panel;
