import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { GenesisSpec, StarSystem } from './model.ts';
import { assertSave } from './schema.ts';
import { createSystem } from './system.ts';

export interface GenesisSave {
  schema: 5;
  createdAt: string;
  spec: GenesisSpec;
  system: StarSystem;
}

export interface CreateOnceResult {
  system: StarSystem;
  created: boolean;
  path: string;
}

export interface GenesisStoreOptions {
  dataDir: string;
  /** 便于测试注入固定时间；默认取真实时钟。 */
  clock?: () => string;
}

/**
 * 存档：一个部署只有一份创世记录，写进去就锁定。
 *
 * 锁定不是「界面上不给按钮」，而是 createOnce() 在文件存在时**不重写**：
 * 即使调用方换了一个 spec，也只会拿到旧系统，created=false。
 * 要重选只能 delete() 掉存档，等于删档重开。
 */
export class GenesisStore {
  readonly file: string;
  private readonly clock: () => string;

  constructor(options: GenesisStoreOptions) {
    this.file = join(options.dataDir, 'genesis', 'system.json');
    this.clock = options.clock ?? (() => new Date().toISOString());
  }

  async read(): Promise<GenesisSave | null> {
    let raw: string;
    try {
      raw = await readFile(this.file, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
    const save = JSON.parse(raw) as GenesisSave;
    // 先过格式校验：字段缺了、类型错了、轨道不是升序、卫星超了上限，都在这里被拦下，
    // 而不是等到后面某个计算拿到 undefined 才炸。
    assertSave(save);
    // spec 与 system 必须对得上：防止手改 spec 之后「重算出来的世界」和存档里的不是同一个。
    const recomputed = createSystem(save.spec);
    if (recomputed.specHash !== save.system.specHash) {
      throw new Error('存档里的系统与 spec 对不上，可能被改过；删掉存档重来。');
    }
    return save;
  }

  /**
   * 覆盖写入（导入存档用）。
   *
   * 与 createOnce 的区别只有一个：它不检查「已经存在就不写」。
   * 导入是玩家显式要求的覆盖，所以这里不做锁定；校验交给调用方（assertSave + specHash 比对）。
   */
  async overwrite(system: StarSystem): Promise<void> {
    const save: GenesisSave = { schema: 5, createdAt: this.clock(), spec: system.spec, system };
    await mkdir(dirname(this.file), { recursive: true });
    await writeFile(this.file, `${JSON.stringify(save, null, 2)}\n`, 'utf8');
  }

  async createOnce(spec: GenesisSpec): Promise<CreateOnceResult> {
    const existing = await this.read();
    if (existing) return { system: existing.system, created: false, path: this.file };

    const system = createSystem(spec);
    const save: GenesisSave = { schema: 5, createdAt: this.clock(), spec: system.spec, system };
    await mkdir(dirname(this.file), { recursive: true });
    await writeFile(this.file, `${JSON.stringify(save, null, 2)}\n`, 'utf8');
    return { system, created: true, path: this.file };
  }

  /**
   * 把当前这一局归档到 `genesis/runs/<run>/`（{system,game}.json 一起搬）。
   * 【再创世】时调用：旧地图从此只读、不再可进。
   */
  async archiveRun(run: number, gameFile: string): Promise<string> {
    const dir = join(dirname(this.file), 'runs', String(run));
    await mkdir(dir, { recursive: true });
    for (const src of [this.file, gameFile]) {
      const name = src.slice(src.lastIndexOf('\\') + 1).split('/').pop()!;
      try {
        await rename(src, join(dir, name));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      }
    }
    return dir;
  }

  /** 删档重开。返回是否真的删掉了文件。 */
  async delete(): Promise<boolean> {
    try {
      await unlink(this.file);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
      throw error;
    }
  }
}


