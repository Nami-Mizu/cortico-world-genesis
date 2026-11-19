/** 「手册」页签：章节目录 + 正文 + 搜索 + 工具表。 */
import type { WebUiPanel } from 'cortico/web/shared/client-panel.ts';
import { text } from '../i18n.ts';
import { renderMarkdown } from '../markdown.ts';
import type { GenesisPanelState } from '../../panel-types.ts';
import { createShell } from '../shell.ts';
import { errorText } from '../ui-kit.ts';

export const guidePanel: WebUiPanel = {
  mount(ctx) {
    const t = text(ctx.language);
    const shell = createShell(ctx, { title: t.guideTitle, desc: t.guideDesc });
    const searchRow = ctx.ui.rowbar();
    const searchInput = ctx.ui.input({ placeholder: t.guideSearchHint });
    searchInput.type = 'text';
    const searchButton = ctx.ui.button(t.guideSearch, { size: 'sm' });
    const toolsButton = ctx.ui.button(t.guideTools, { size: 'sm' });
    searchRow.append(searchInput, searchButton, toolsButton);
    const chips = ctx.ui.h('div', 'gx-card');
    const article = ctx.ui.h('div', 'gx-card');
    const hint = ctx.ui.h('p', 'muted', t.guideEmpty);
    chips.append(ctx.ui.h('span', 'muted', t.guidePick));
    article.append(hint);
    shell.body.append(searchRow, chips, article);

    let current: string | null = null;
    let topics: Array<{ id: string; title: string }> = [];

    const paintChips = (): void => {
      for (const chip of Array.from(chips.querySelectorAll('button'))) chip.remove();
      for (const topic of topics) {
        const button = ctx.ui.button(topic.title, { size: 'sm', variant: topic.id === current ? 'primary' : undefined });
        button.addEventListener('click', () => {
          void open(topic.id);
        });
        chips.append(button);
      }
    };

    const open = async (id: string): Promise<void> => {
      current = id;
      paintChips();
      try {
        const payload = await ctx.invoke<{ id: string; title: string; text: string }>('read', [id]);
        article.replaceChildren(renderMarkdown(document, payload.text));
      } catch (error) {
        article.replaceChildren(ctx.ui.h('p', 'muted', errorText(error)));
      }
    };

    const search = async (): Promise<void> => {
      const query = searchInput.value.trim();
      if (!query) return;
      const busy = ctx.ui.disable(searchButton);
      try {
        const payload = await ctx.invoke<{ text: string }>('search', [query]);
        const card = renderMarkdown(document, payload.text);
        card.classList.add('mono');
        article.replaceChildren(card);
      } catch (error) {
        article.replaceChildren(ctx.ui.h('p', 'muted', errorText(error)));
      } finally {
        busy.dispose();
      }
    };

    searchButton.addEventListener('click', () => void search());
    toolsButton.addEventListener('click', () => {
      void (async () => {
        try {
          const payload = await ctx.invoke<{ text: string }>('tools', []);
          const card = renderMarkdown(document, payload.text);
          card.classList.add('mono');
          article.replaceChildren(card);
        } catch (error) {
          article.replaceChildren(ctx.ui.h('p', 'muted', errorText(error)));
        }
      })();
    });
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') void search();
    });

    const load = async (): Promise<void> => {
      try {
        const payload = await ctx.invoke<{ topics: Array<{ id: string; title: string }> }>('topics');
        topics = payload.topics ?? [];
        paintChips();
        if (topics.length === 0) return;
        if (!current || !topics.some((topic) => topic.id === current)) {
          await open(topics[0]!.id);
        }
      } catch (error) {
        hint.textContent = errorText(error);
      }
    };

    void load();

    // 顶栏（时间/位置/能量/钨/信用点/倍速）来自整份面板状态，本页载荷只有课程表。
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

/** 把教程正文的 markdown 铺成节点：标题、引用、列表、`代码`。 */
