/**
 * 「存档」页签：新建（创世）、导入、导出、删除。放在页签最后。
 *
 * 这一页只做四件事，不显示玩法数据——想看点数和地，去「概况」「地表」。
 */
import type { WebUiPanel, WebUiPanelContext } from 'cortico/web/shared/client-panel.ts';
import type { GenesisPanelState } from '../../panel-types.ts';
import { errorText } from '../ui-kit.ts';
import { createShell, emptyText } from '../shell.ts';

function normalizeSeed(raw: string): number | string {
  const text = raw.trim();
  if (text === '') return 20261111;
  return /^\d{1,15}$/.test(text) ? Number(text) : text;
}

const panel: WebUiPanel = {
  async mount(ctx: WebUiPanelContext) {
    const shell = createShell(ctx, {
      title: '存档',
      desc: '新建一局、导入别人的存档、导出这一局、或者删掉重来。',
    });
    let state: GenesisPanelState | null = null;

    // 当前存档
    const nowCard = ctx.ui.h('div', 'gx-card');
    const nowLine = ctx.ui.h('p', 'gx-dim');
    nowCard.append(ctx.ui.h('h3', undefined, '当前存档'), nowLine);

    // 新建
    const newCard = ctx.ui.h('div', 'gx-card');
    const seedInput = ctx.ui.input({ type: 'text', value: '20261111', placeholder: '数字，或任意一句话' });
    const starNameInput = ctx.ui.input({ type: 'text', value: '长庚', placeholder: '恒星名' });
    const homeNameInput = ctx.ui.input({ type: 'text', value: '栖原', placeholder: '母星名' });
    const starMassLabel = ctx.ui.h('span', 'gx-num', '1.00 M☉');
    const starMassInput = ctx.ui.h('input') as HTMLInputElement;
    starMassInput.type = 'range';
    starMassInput.min = '0.15';
    starMassInput.max = '2';
    starMassInput.step = '0.05';
    starMassInput.value = '1';
    starMassInput.oninput = () => {
      starMassLabel.textContent = `${Number(starMassInput.value).toFixed(2)} M☉`;
    };
    const shapeLine = ctx.ui.h('p', 'gx-dim', '');
    const createButton = ctx.ui.button('创世', { variant: 'primary' });
    let previewTimer: number | undefined;

    const refreshShape = async () => {
      try {
        const shape = await ctx.invoke<{ planetCount: number; maxMoons: number; minPlanets: number; maxPlanets: number }>(
          'preview',
          [normalizeSeed(seedInput.value)],
        );
        shapeLine.textContent = `这颗种子会长出 ${shape.planetCount} 颗行星（${shape.minPlanets}–${shape.maxPlanets}），每颗最多 ${shape.maxMoons} 颗卫星。`;
      } catch {
        shapeLine.textContent = '';
      }
    };
    seedInput.oninput = () => {
      if (previewTimer !== undefined) window.clearTimeout(previewTimer);
      previewTimer = window.setTimeout(() => void refreshShape(), 180);
    };

    createButton.onclick = async () => {
      createButton.disabled = true;
      try {
        const next = await ctx.invoke<GenesisPanelState>('create', [
          {
            seed: normalizeSeed(seedInput.value),
            starMass: Number(starMassInput.value),
            starName: starNameInput.value.trim() || '恒星',
            homeName: homeNameInput.value.trim() || '母星',
          },
        ]);
        state = next;
        render();
        void ctx.refresh();
      } catch (error) {
        msg(errorText(error), 'bad');
      } finally {
        createButton.disabled = false;
      }
    };

    const formRows = ctx.ui.h('div', 'gx-rows');
    formRows.append(
      row(ctx, '种子', seedInput),
      row(ctx, '恒星质量', (() => {
        const wrap = ctx.ui.h('div', 'gx-row');
        wrap.append(starMassInput, starMassLabel);
        return wrap;
      })()),
      row(ctx, '恒星名', starNameInput),
      row(ctx, '母星名', homeNameInput),
    );
    newCard.append(ctx.ui.h('h3', undefined, '新建存档（创世）'), formRows, shapeLine, createButton);

    // 导入
    const importCard = ctx.ui.h('div', 'gx-card');
    const importInput = ctx.ui.h('input') as HTMLInputElement;
    importInput.type = 'file';
    importInput.accept = 'application/json';
    const importButton = ctx.ui.button('导入这份存档', { size: 'sm' });
    importButton.onclick = async () => {
      const file = importInput.files?.[0];
      if (!file) {
        msg('先选一个 .json 文件。', 'bad');
        return;
      }
      importButton.disabled = true;
      try {
        const text = await file.text();
        const result = await ctx.invoke<{ text: string }>('import', [text]);
        msg(result.text, 'ok');
        state = await ctx.invoke<GenesisPanelState>('state', []);
        render();
        void ctx.refresh();
      } catch (error) {
        msg(errorText(error), 'bad');
      } finally {
        importButton.disabled = false;
      }
    };
    importCard.append(ctx.ui.h('h3', undefined, '导入'), importInput, importButton);

    // 导出
    const exportCard = ctx.ui.h('div', 'gx-card');
    const exportButton = ctx.ui.button('导出这一局', { size: 'sm' });
    exportButton.onclick = async () => {
      exportButton.disabled = true;
      try {
        const result = await ctx.invoke<{ text: string; filename: string }>('export', []);
        const blob = new Blob([result.text], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 5_000);
        msg(`已导出：${result.filename}`, 'ok');
      } catch (error) {
        msg(errorText(error), 'bad');
      } finally {
        exportButton.disabled = false;
      }
    };
    exportCard.append(ctx.ui.h('h3', undefined, '导出'), ctx.ui.h('p', 'gx-dim', '一份 JSON 就是整局：星系、存档、种子都在里面。'), exportButton);

    // 删除
    const deleteCard = ctx.ui.h('div', 'gx-card');
    const deleteInput = ctx.ui.input({ type: 'text', placeholder: '输入 DELETE 确认' });
    const deleteButton = ctx.ui.button('删掉这一局', { size: 'sm', variant: 'primary' });
    deleteButton.onclick = async () => {
      if (deleteInput.value.trim() !== 'DELETE') {
        msg('要删档请在框里输入 DELETE（大写）。', 'bad');
        return;
      }
      deleteButton.disabled = true;
      try {
        const next = await ctx.invoke<GenesisPanelState>('reset', ['DELETE']);
        state = next;
        deleteInput.value = '';
        render();
        void ctx.refresh();
      } catch (error) {
        msg(errorText(error), 'bad');
      } finally {
        deleteButton.disabled = false;
      }
    };
    deleteCard.append(ctx.ui.h('h3', undefined, '删除'), deleteInput, deleteButton);

    const message = ctx.ui.h('p', 'gx-msg');
    const msg = (text: string, tone: 'ok' | 'bad') => {
      message.textContent = text;
      message.className = `gx-msg gx-${tone}`;
    };

    shell.body.append(nowCard, newCard, importCard, exportCard, deleteCard, message);

    function row(ctx2: WebUiPanelContext, label: string, field: HTMLElement): HTMLElement {
      const line = ctx2.ui.h('div', 'gx-row');
      line.append(ctx2.ui.h('span', 'gx-dim', label), field);
      return line;
    }

    function render() {
      const created = !!state && !state.locked;
      nowLine.textContent = state === null ? emptyText(null) : created ? `${state.game?.time ?? '—'} · ${state.game?.where ?? ''}` : emptyText(state);
      newCard.hidden = created;
      exportCard.hidden = !created;
      deleteCard.hidden = !created;
      importCard.hidden = created;
      shell.update(state);
    }

    try {
      state = await ctx.invoke<GenesisPanelState>('state', []);
    } catch (error) {
      msg(errorText(error), 'bad');
    }
    render();
    void refreshShape();
  },
};

export default panel;
