/** 极简 Markdown 渲染（手册与商店用）。 */

export function renderMarkdown(owner: Document, text: string): HTMLElement {
  const root = owner.createElement('div');
  root.className = 'rows';
  let listEl: HTMLElement | null = null;
  let listKind: 'ul' | 'ol' | null = null;
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) {
      listEl = null;
      listKind = null;
      continue;
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      listEl = null;
      listKind = null;
      const level = heading[1]!.length;
      const el = owner.createElement(level === 1 ? 'h2' : level === 2 ? 'h3' : 'h4');
      el.append(...inlineNodes(owner, heading[2]!));
      root.append(el);
      continue;
    }
    const quote = /^>\s?(.*)$/.exec(line);
    if (quote) {
      listEl = null;
      listKind = null;
      const el = owner.createElement('blockquote');
      el.append(...inlineNodes(owner, quote[1]!));
      root.append(el);
      continue;
    }
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const numbered = /^\d+\.\s+(.*)$/.exec(line);
    if (bullet || numbered) {
      const kind = bullet ? 'ul' : 'ol';
      if (!listEl || listKind !== kind) {
        listEl = owner.createElement(kind);
        listKind = kind;
        root.append(listEl);
      }
      const li = owner.createElement('li');
      li.append(...inlineNodes(owner, (bullet ?? numbered)![1]!));
      listEl.append(li);
      continue;
    }
    listEl = null;
    listKind = null;
    const p = owner.createElement('p');
    p.append(...inlineNodes(owner, line));
    root.append(p);
  }
  return root;
}

export function inlineNodes(owner: Document, text: string): Node[] {
  const nodes: Node[] = [];
  const pattern = /`([^`]+)`/g;
  let last = 0;
  let match: RegExpExecArray | null = pattern.exec(text);
  while (match) {
    if (match.index > last) nodes.push(owner.createTextNode(text.slice(last, match.index)));
    const code = owner.createElement('code');
    code.textContent = match[1]!;
    nodes.push(code);
    last = match.index + match[0].length;
    match = pattern.exec(text);
  }
  if (last < text.length) nodes.push(owner.createTextNode(text.slice(last)));
  return nodes;
}


/** 「商店」页签：买卖、订单，都在商人开张时。 */
