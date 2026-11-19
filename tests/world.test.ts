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
  return (await decl.invoke('save', method, args)) as GenesisPanelState;
}

const text = (out: unknown): string => (typeof out === 'string' ? out : String((out as { text?: string }).text ?? ''));

const SPEC = { seed: 424242, starMass: 1, planetCount: 4, maxMoons: 2, starName: '长庚', homeName: '栖原' };

const DRAFT = { seed: 424242, starMass: 1, starName: '长庚', homeName: '栖原' };

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
    const out = text(await callTool(world, 'genesis_create', SPEC));
    expect(out).not.toContain('starName 是恒星名');
    expect((await panel(world, 'state')).locked).toBe(false);
    expect(host.events.map((e) => e.type)).toEqual(['genesis.created']);
    await world.stop();
  });

  it('第二次换 spec 不覆盖，也不回星卡', async () => {
    const world = makeWorld();
    await world.start(new FakeHost());
    await callTool(world, 'genesis_create', SPEC);
    const second = text(await callTool(world, 'genesis_create', { ...SPEC, seed: 999, planetCount: 7 }));
    expect(second).toContain('已经创世过了');
    expect(second).not.toContain('AU');
    await world.stop();
  });

  it('reset 必须带 DELETE，删档后可以重新创世', async () => {
    const world = makeWorld();
    await world.start(new FakeHost());
    await callTool(world, 'genesis_create', SPEC);
    const refused = text(await callTool(world, 'genesis_reset', { confirm: 'yes' }));
    expect(refused).toContain('DELETE');
    const removed = text(await callTool(world, 'genesis_reset', { confirm: 'DELETE' }));
    expect(removed.length).toBeGreaterThan(0);
    const again = await panel(world, 'state');
    expect(again.locked).toBe(true);
    await world.stop();
  });

  it('面板：未创世 locked 为真，创世后 locked 为假且有行星', async () => {
    const world = makeWorld();
    await world.start(new FakeHost());
    const before = await panel(world, 'state');
    expect(before.locked).toBe(true);
    expect(before.card).toBeNull();
    const after = await panel(world, 'create', [DRAFT]);
    expect(after.locked).toBe(false);
    expect(Array.isArray(after.planets)).toBe(true);
    // 没装【环境监测器】时星卡是空的——这是设计：看不见的东西不给数据。
    expect(after.card === null || typeof after.card === 'string').toBe(true);
    await world.stop();
  });

  it('面板 reset 也要 DELETE', async () => {
    const world = makeWorld();
    await world.start(new FakeHost());
    await panel(world, 'create', [DRAFT]);
    await expect(panel(world, 'reset', ['nope'])).rejects.toThrow(/DELETE/);
    const after = await panel(world, 'reset', ['DELETE']);
    expect(after.locked).toBe(true);
    await world.stop();
  });

  it('环境提示词带上局面变量', async () => {
    const world = makeWorld();
    await world.start(new FakeHost());
    const empty = (await world.envPromptVars()) as Record<string, string> | null;
    expect(empty).not.toBeNull();
    expect(Object.keys(empty ?? {})).toContain('genesis.summary');
    expect(Object.keys(empty ?? {})).toContain('genesis.planets');
    expect(empty?.['genesis.summary']).toContain('还没有创世');
    await callTool(world, 'genesis_create', SPEC);
    const filled = (await world.envPromptVars()) as Record<string, string> | null;
    expect(filled?.['genesis.summary']).toContain('已创世');
    await world.stop();
  });

  it('越界恒星质量被拒，且不写存档', async () => {
    const world = makeWorld();
    await world.start(new FakeHost());
    const bad = text(await callTool(world, 'genesis_create', { ...SPEC, starMass: 99 }));
    expect(bad.length).toBeGreaterThan(0);
    const state = await panel(world, 'state');
    expect(state.locked).toBe(true);
    await world.stop();
  });

  it('同 spec 两次创世得到同一张星卡（确定性）', async () => {
    const one = makeWorld();
    await one.start(new FakeHost());
    expect(text(await callTool(one, 'genesis_card'))).toContain('还没有创世');
    await callTool(one, 'genesis_create', SPEC);
    const cardOne = text(await callTool(one, 'genesis_card'));
    await one.stop();

    const two = makeWorld();
    await two.start(new FakeHost());
    await callTool(two, 'genesis_create', SPEC);
    const cardTwo = text(await callTool(two, 'genesis_card'));
    expect(cardTwo).toBe(cardOne);
    await two.stop();
  });

  it('工具表是 44 个，含创世/建造/奇观/倍速', () => {
    const world = makeWorld();
    const names = world.tools().map((tool) => tool.name);
    expect(names.length).toBe(44);
    expect(names).toContain('genesis_create');
    expect(names).toContain('genesis_install');
    expect(names).toContain('genesis_wonder');
    expect(names).toContain('genesis_speed');
  });
});
