import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { deserializeGame, serializeGame, type GameState } from './game.ts';
import type { StarSystem } from './model.ts';

export interface GameStoreOptions {
  dataDir: string;
}

/**
 * 游戏状态：`<dataDir>/genesis/game.json`。
 *
 * 与 `system.json` 分开存：system 是创世结果（写进去就不动），
 * game 是时间轴、位置、在途、观星窗口、名字——随时会变。
 * 时间按现实毫秒记，所以进程重启后照样能把「还剩多久到达」算回来。
 */
export class GameStore {
  readonly file: string;

  constructor(options: GameStoreOptions) {
    this.file = join(options.dataDir, 'genesis', 'game.json');
  }

  async read(system: StarSystem): Promise<GameState | null> {
    let raw: string;
    try {
      raw = await readFile(this.file, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
    return deserializeGame(system, JSON.parse(raw));
  }

  async write(state: GameState): Promise<void> {
    await mkdir(dirname(this.file), { recursive: true });
    await writeFile(this.file, `${JSON.stringify(serializeGame(state), null, 2)}\n`, 'utf8');
  }

  /** 删档时一起删；返回是否真的删掉了文件。 */
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
