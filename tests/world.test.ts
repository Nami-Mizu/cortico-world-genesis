import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ToolCallContext } from 'cortico/core/types.ts';
import { dryMountWorld, fakeWorldContext } from 'cortico/extensions/dry-mount.ts';
import { GENESIS_DEFAULTS } from '../src/config.ts';
import { GENESIS } from '../src/definition.ts';
import type { GenesisPanelState } from '../src/panel-types.ts';
import { FakeHost } from './helpers/fake-host.ts';

let scratchDir: string;
beforeEach(() => {
  scratchDir = mkdtempSync(join(tmpdir(), 'genesis-world-'));
});
afterEach(() => {
  rmSync(scratchDir, { recursive: true, force: true });
});

const CTX = {} as ToolCallContext;

function makeWorld() {
  return GENESIS.create(fakeWorldContext(GENESIS, { scratchDir }));
}

async function callTool(world: ReturnType<typeof makeWorld>, name: string, args: Record<string, unknown> = {}) {
  const tool = world.tools().find((t) => t.name === name);
  if (!tool) throw new Error(`no tool ${name}`);
  return tool.handler(args, CTX);
}

async function panel(world: ReturnType<typeof makeWorld>, method: string, args: unknown[] = []) {
  const decl = world.webUi?.();
  if (!decl?.invoke) throw new Error('no invoke');
  return (await decl.invoke('system', method, args)) as GenesisPanelState;
}

const SPEC = { seed: 424242, starMass: 1, planetCount: 4, maxMoons: 2 };

describe('Genesis World', () => {
  it('干装载不给 failures', async () => {
    const report = await dryMountWorld(GENESIS, { scratchDir });
    expect(report.failures).toEqual([]);
  });

  it('默认配置能构造，enabled 为 false', () => {
    const world = makeWorld();
    expect(world.id).toBe('genesis');
    expect(GENESIS.defaults().enabled).toBe(false);
    expect(GENESIS_DEFAULTS.enabled).toBe(false);
  });

  it('创世一次：写存档、推 genesis.created、星卡带恒星', async () => {
    const world = makeWorld();
    const host = new FakeHost();
    await world.start(host);
    const out = await callTool(world, 'genesis_create', SPEC);
    const text = typeof out === 'string' ? out : out.text;
    expect(text).toContain('恒星');
    expect(text).toContain('已写入存档');
    expect(host.events.map((e) => e.type)).toEqual(['genesis.created']);
    await world.stop();
  });

  it('第二次换 spec 也不覆盖，返回旧星卡', async () => {
    const world = makeWorld();
    await world.start(new FakeHost());
    const first = await callTool(world, 'genesis_create', SPEC);
    const second = await callTool(world, 'genesis_create', { ...SPEC, seed: 999, planetCount: 7 });
    const a = typeof first === 'string' ? first : first.text;
    const b = typeof second === 'string' ? second : second.text;
    expect(b).toContain('没有覆盖');
    const hashOf = (card: string) => card.split('\n')[0];
    expect(hashOf(b)).toBe(hashOf(a));
    await world.stop();
  });

  it('reset 必须带 DELETE，删档后可以重新创世', async () => {
    const world = makeWorld();
    await world.start(new FakeHost());
    await callTool(world, 'genesis_create', SPEC);
    const refused = await callTool(world, 'genesis_reset', { confirm: 'yes' });
    expect(typeof refused === 'string' ? refused : refused.failed).toBeTruthy();
    const removed = await callTool(world, 'genesis_reset', { confirm: 'DELETE' });
    expect(String(typeof removed === 'string' ? removed : removed.text)).toContain('可以重新创世');
    const again = await panel(world, 'state');
    expect(again.locked).toBe(false);
    await world.stop();
  });

  it('面板：未创世给菜单，创世后 locked 且有星卡', async () => {
    const world = makeWorld();
    await world.start(new FakeHost());
    const before = await panel(world, 'state');
    expect(before.locked).toBe(false);
    expect(before.card).toBeNull();
    expect(before.limits.planetCount.max).toBe(8);
    const after = await panel(world, 'create', [SPEC]);
    expect(after.locked).toBe(true);
    expect(after.card).toContain('恒星');
    expect(after.planets.length).toBe(4);
    await world.stop();
  });

  it('面板 reset 也要 DELETE', async () => {
    const world = makeWorld();
    await world.start(new FakeHost());
    await panel(world, 'create', [SPEC]);
    await expect(panel(world, 'reset', ['nope'])).rejects.toThrow(/DELETE/);
    const after = await panel(world, 'reset', ['DELETE']);
    expect(after.locked).toBe(false);
    await world.stop();
  });

  it('环境提示词两个变量都在', async () => {
    const world = makeWorld();
    await world.start(new FakeHost());
    const empty = (await world.envPromptVars()) as Record<string, string> | null;
    expect(empty).not.toBeNull();
    expect(Object.keys(empty ?? {})).toEqual(['genesis.summary', 'genesis.planets']);
    expect(empty?.['genesis.summary']).toContain('还没有创世');
    await callTool(world, 'genesis_create', SPEC);
    const filled = (await world.envPromptVars()) as Record<string, string> | null;
    expect(filled?.['genesis.summary']).toContain('已创世');
    expect(filled?.['genesis.planets']).toContain('AU');
    await world.stop();
  });

  it('越界参数被拒，且不写存档', async () => {
    const world = makeWorld();
    await world.start(new FakeHost());
    const bad = await callTool(world, 'genesis_create', { ...SPEC, planetCount: 99 });
    expect(typeof bad === 'string' ? bad : bad.failed).toBeTruthy();
    const state = await panel(world, 'state');
    expect(state.locked).toBe(false);
    await world.stop();
  });

  it('同 spec 两次创世得到同一张星卡（确定性）', async () => {
    const one = makeWorld();
    await one.start(new FakeHost());
    const a = await callTool(one, 'genesis_card');
    expect(typeof a === 'string' ? a : a.text).toContain('还没有创世');
    await callTool(one, 'genesis_create', SPEC);
    const cardOne = (await callTool(one, 'genesis_card')) as string;
    await one.stop();

    const two = makeWorld();
    await two.start(new FakeHost());
    await callTool(two, 'genesis_create', SPEC);
    const cardTwo = (await callTool(two, 'genesis_card')) as string;
    expect(cardTwo).toBe(cardOne);
    await two.stop();
  });
});
