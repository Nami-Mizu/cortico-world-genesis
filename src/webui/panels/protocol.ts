/** 「协议」页签：12 条清单、叫醒、再创世。 */
import type { WebUiPanel } from 'cortico/web/shared/client-panel.ts';
import type { GenesisProtocolPanel, GenesisPanelState } from '../../panel-types.ts';
import { text } from '../i18n.ts';
import { createShell } from '../shell.ts';
import { errorText, field } from '../ui-kit.ts';

export const protocolPanel: WebUiPanel = {
  async mount(ctx) {
    const t = text(ctx.language);
    const shell = createShell(ctx, { title: t.protoTitle, desc: t.protoDesc });
    const head = ctx.ui.rowbar();
    const progress = ctx.ui.h('span', 'grow', '');
    const refresh = ctx.ui.button(t.protoRefresh, {
      size: 'sm',
      onClick: () => {
        void load();
      },
    });
    head.append(progress, refresh);
    const body = ctx.ui.h('div', 'gx-card');
    const habitatBox = ctx.ui.h('div', 'gx-card');
    const wakeButton = ctx.ui.button(t.protoWake, {
      variant: 'primary',
      onClick: () => {
        void wake(wakeButton);
      },
    });
    // 未创世 / 读不到存档时，这个按钮不该存在——它按下去只会报错。
    wakeButton.hidden = true;
    wakeButton.style.marginTop = '10px';
    // 【再创世】：条件不成就置灰，阻塞原因直接列出来。
    const recreateBox = ctx.ui.h('div');
    recreateBox.style.marginTop = '18px';
    recreateBox.hidden = true;
    const recreateRow = ctx.ui.rowbar();
    const recreateSeedInput = ctx.ui.input({ placeholder: '20261111' });
    recreateSeedInput.type = 'text';
    recreateSeedInput.style.width = '110px';
    const recreateMassInput = ctx.ui.input({});
    recreateMassInput.type = 'range';
    recreateMassInput.min = '0.15';
    recreateMassInput.max = '2';
    recreateMassInput.step = '0.05';
    const recreateMassLabel = ctx.ui.h('span', 'mono', '1.00');
    const recreateButton = ctx.ui.button(t.recreateGo, { variant: 'primary' });
    recreateRow.append(
      ctx.ui.h('span', 'muted', t.recreateSeed),
      recreateSeedInput,
      ctx.ui.h('span', 'muted', t.recreateMass),
      recreateMassInput,
      recreateMassLabel,
      recreateButton,
    );
    const recreateList = ctx.ui.h('ul', '');
    recreateBox.append(ctx.ui.h('h3', '', t.recreateTitle), ctx.ui.h('p', 'muted', t.recreateDesc), recreateRow, recreateList);
    recreateBox.classList.add('gx-card');
    shell.body.append(head, body, habitatBox, wakeButton, recreateBox);

    const paintMass = (): void => {
      recreateMassLabel.textContent = Number(recreateMassInput.value || '1').toFixed(2);
    };
    recreateMassInput.addEventListener('input', paintMass);
    recreateButton.addEventListener('click', () => {
      void recreate(recreateButton);
    });


    const render = (panel: GenesisProtocolPanel): void => {
      wakeButton.hidden = false;
      progress.textContent = `${t.protoDone} ${panel.done} / ${panel.total}`;
      body.textContent = '';
      for (const chapter of panel.chapters) {
        const heading = ctx.ui.h('h3', '', `${chapter.title} · ${chapter.done}/${chapter.total}`);
        heading.style.margin = '10px 0 4px';
        body.append(heading);
        for (const task of chapter.tasks) {
          const row = ctx.ui.h('div', '', `${task.done ? '✓' : '○'} ${task.title}${task.done ? '' : ` · ${task.progress}`}`);
          row.style.padding = '2px 0';
          row.style.color = task.done ? 'var(--muted, #8a8a8a)' : '';
          body.append(row);
        }
      }
      habitatBox.textContent = '';
      if (panel.population) {
        const p = panel.population;
        habitatBox.append(
          ctx.ui.h('h3', '', t.protoPopulation),
          ctx.ui.h(
            'p',
            '',
            `${p.population} / ${p.capacity} · ${t.protoSleepers} ${p.sleepers} · ${t.protoLabor} ${p.laborUnits}` +
              (p.population < p.capacity
                ? ` · ${t.protoBirthProgress} ${Math.floor(p.birthHours)} / 192`
                : ''),
          ),
        );
      }
      if (panel.habitat) {
        const h = panel.habitat;
        habitatBox.append(
          ctx.ui.h('h3', '', `${t.protoHabitat}`),
          ctx.ui.h(
            'p',
            '',
            `${t.protoAwake} ${h.awake} · ${t.protoDormant} ${h.dormant} · ` +
              `${t.protoFood} ${h.food.toFixed(1)} kg · ${t.protoWater} ${h.water.toFixed(1)} L · ` +
              `${t.protoOxygen} ${h.oxygen.toFixed(1)} kg · ${t.protoHours} ${Number.isFinite(h.hoursLeft) ? `${Math.floor(h.hoursLeft)} 母星时` : '—'}`,
          ),
        );
      }
      recreateBox.hidden = false;
      if (recreateSeedInput.value === '') recreateSeedInput.value = panel.recreate.seed;
      if (recreateMassInput.value === '') recreateMassInput.value = String(panel.recreate.starMass);
      paintMass();
      recreateButton.disabled = !panel.recreate.ready;
      recreateList.textContent = '';
      if (!panel.recreate.ready) {
        recreateList.append(ctx.ui.h('li', 'muted', t.recreateBlocked));
        for (const blocker of panel.recreate.blockers) recreateList.append(ctx.ui.h('li', '', blocker));
      }
      if (panel.awakened) {
        wakeButton.disabled = true;
        wakeButton.textContent = t.protoAwakened;
      } else {
        wakeButton.disabled = !panel.ready || !panel.habitat;
        wakeButton.textContent = panel.ready ? t.protoWake : `${t.protoWake}（${t.protoDone} ${panel.done}/${panel.total}）`;
      }
    };

    const load = async (): Promise<void> => {
      try {
        render(await ctx.invoke<GenesisProtocolPanel>('state'));
      } catch (error) {
        // 没有存档是常态（第一次打开面板），不是错误：给一句引导，别留一个会报错的按钮。
        wakeButton.hidden = true;
        recreateBox.hidden = true;
        progress.textContent = '';
        body.textContent = '';
        habitatBox.textContent = '';
        const message = errorText(error);
        body.append(
          ctx.ui.h('p', 'muted', /还没有创世|旧版本/.test(message) ? t.protoLocked : message),
        );
        if (/旧版本/.test(message)) body.append(ctx.ui.h('p', 'muted', message));
      }
    };

    const wake = async (button: HTMLButtonElement): Promise<void> => {
      button.disabled = true;
      try {
        const panel = await ctx.invoke<GenesisProtocolPanel>('wake', []);
        render(panel);
        ctx.ui.toast(t.protoAwakened, 'ok');
        void ctx.refresh();
      } catch (error) {
        ctx.ui.toast(errorText(error), 'bad');
        button.disabled = false;
      }
    };

    const recreate = async (button: HTMLButtonElement): Promise<void> => {
      button.disabled = true;
      try {
        const result = await ctx.invoke<{ text: string }>('recreate', [
          recreateSeedInput.value,
          Number(recreateMassInput.value),
        ]);
        ctx.ui.toast(t.recreateDone, 'ok');
        progress.textContent = result.text;
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
        void ctx.refresh();
      } catch (error) {
        ctx.ui.toast(errorText(error), 'bad');
        button.disabled = false;
      }
    };

    await load();
    ctx.interval(() => {
      void load();
    }, 5000);
  },
};
