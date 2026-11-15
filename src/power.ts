/**
 * 能量与太阳能帆。
 *
 * - 初始 0 kJ；面板上的动能发电机每按一次 +10 kJ（修火花塞后变多），冷却 0.5 秒（只能由人类按）。
 * - 太阳能帆建在当前行星的任何**陆地**上；白天每 1 母星时产出 7,000 kJ，夜里不产。
 * - 每颗行星最多 10 个；气态/冰巨星不能部署。
 *
 * 帆的产出按「母星时」记账：结算时把 [上次结算, 现在] 这段母星时里
 * 「这台帆所在的经纬度正被太阳照着」的部分挑出来，乘以 7,000。
 * 高纬冬天短、夏天长，极地有极昼极夜——这是选址的意义。
 */

export const GENERATOR_COOLDOWN_MS = 500;

export const MONITOR_COST_KJ = 150_000;
export const COUNTER_COST_KJ = 1_000_000;
export const DEVICE_TIME_COST_HOME_HOURS = 0.1;

export const SAIL_COST_KJ = 6_000;
export const SAIL_KJ_PER_HOME_HOUR = 7_000;
export const SAIL_MAX_PER_PLANET = 10;

export interface Sail {
  bodyKey: string;
  /** 部署时的母星时。 */
  deployedHomeHours: number;
  /** 帆所在的纬度（度）。旧存档没有这两个字段，按 (0°, 0°) 算。 */
  latDeg?: number;
  lonDeg?: number;
}


