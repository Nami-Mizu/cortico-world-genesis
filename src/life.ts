/**
 * 生命维持：人吃什么、喝什么、呼吸什么，以及把原料变成补给品的那几条链。
 *
 * 这里只放「数」和纯函数；状态怎么存、谁扣谁加，由 `game.ts` 负责。
 * 一条原则：所有补给都是「每小时」结算的，和作物、帆、改造器同一个节拍。
 */

/** 一座居所装多少人。 */
export const PEOPLE_PER_HABITAT = 20;

/** 全船带多少乘客：20 个，叫醒一次就全醒；之后靠自然增长。 */
export const SHIP_CREW = 20;

/** 连续多少个母星时的「健康」（没断供）添一个人。 */
export const BIRTH_HEALTHY_HOME_HOURS = 96;

/** 每 5 个常住人口算一个「人手」。 */
export const RESIDENTS_PER_LABOR = 5;

/**
 * 一个「人手」每母星时能干多少活：收 3 批、种 3 株、施 20 kg 肥。
 * 份数比 1.10.0 多了四倍（5 人一份），所以单份的活比原来少一点。
 */
export const LABOR_PER_HOUR = { harvest: 3, sow: 3, fertilizeKg: 20 } as const;

/** 一份人手在地里照看，这块地多收 8%；单站封顶 +40%。 */
export const LABOR_YIELD_BONUS = 0.08;
export const LABOR_YIELD_BONUS_MAX = 0.4;

/** 休眠的人只按清醒时的 20% 消耗——否则开局太仓促。 */
export const DORMANT_FRACTION = 0.2;

/** 每人每母星时的消耗（清醒）。 */
export const PER_PERSON_HOUR = {
  /** 干生物质（当口粮）。 */
  food: 0.025,
  /** 饮用水（升，按 1 kg/L 记）。 */
  water: 0.1,
  /** 氧气（kg）。 */
  oxygen: 0.035,
  /** 维持舱段本身（照明、循环、保温）。 */
  kj: 40,
};

/** 每人每母星时的消耗（休眠）。 */
export const PER_PERSON_DORMANT = {
  food: PER_PERSON_HOUR.food * DORMANT_FRACTION,
  water: PER_PERSON_HOUR.water * DORMANT_FRACTION,
  oxygen: PER_PERSON_HOUR.oxygen * DORMANT_FRACTION,
  kj: PER_PERSON_HOUR.kj * DORMANT_FRACTION,
};

/** 居所内仓容量。 */
export const HABITAT_CAP = { food: 300, water: 300, oxygen: 60 } as const;

/** 居所自身的耗电（不含按人算的那份）。 */
export const HABITAT_UPKEEP_KJ_PER_HOUR = 800;

/** 站点堆场：每站 1,000 kg 的缓冲，生产链与居所都从这里取放。 */
export const SITE_STORE_CAPACITY_KG = 1_000;

export interface LifeDemand {
  food: number;
  water: number;
  oxygen: number;
  kj: number;
}

/** 一群人在 `hours` 母星时里的总需求。 */
export function lifeDemand(awake: number, dormant: number, hours: number): LifeDemand {
  const a = Math.max(0, awake);
  const d = Math.max(0, dormant);
  return {
    food: (a * PER_PERSON_HOUR.food + d * PER_PERSON_DORMANT.food) * hours,
    water: (a * PER_PERSON_HOUR.water + d * PER_PERSON_DORMANT.water) * hours,
    oxygen: (a * PER_PERSON_HOUR.oxygen + d * PER_PERSON_DORMANT.oxygen) * hours,
    kj: (a * PER_PERSON_HOUR.kj + d * PER_PERSON_DORMANT.kj) * hours,
  };
}

/** 一座居所满员（20 人）时的每小时需求，用来给面板估「还能撑几小时」。 */
export const FULL_HABITAT_DEMAND: LifeDemand = lifeDemand(PEOPLE_PER_HABITAT, 0, 1);
export const FULL_HABITAT_DORMANT_DEMAND: LifeDemand = lifeDemand(0, PEOPLE_PER_HABITAT, 1);

// ── 生产链 ──────────────────────────────────────────────

/** 炭化炉：把生物质焖成活性炭（顺带留一点灰）。 */
export const KILN_KJ_PER_HOUR = 100;
export const KILN_BIOMASS_PER_HOUR = 1;
export const KILN_CHARCOAL_PER_BIOMASS = 0.25;
export const KILN_ASH_PER_BIOMASS = 0.15;

/** 水泵：每小时抽多少淡水（kg）。海水只能脱盐，产出打对折。 */
export const PUMP_WATER_PER_HOUR = 20;
export const SEA_WATER_FACTOR = 0.5;
/** 站点离海多近才算出「海水」。 */
export const SEA_WATER_COAST_KM = 150;

/** 净化器：活性炭 + 原水 → 饮用水。 */
export const PURIFIER_KJ_PER_HOUR = 300;
export const PURIFIER_RAW_WATER_PER_HOUR = 1.2;
export const PURIFIER_CHARCOAL_PER_HOUR = 0.05;
export const PURIFIER_DRINK_PER_HOUR = 1;

/** 封装器：氧气 + 钢瓶 → 氧气瓶。 */
export const SEALER_KJ_PER_HOUR = 300;
export const SEALER_OXYGEN_PER_HOUR = 0.5;
/** 一个钢瓶装得下多少 kg 氧气。 */
export const O2_PER_BOTTLE = 5;

/** 大气提取器：O₂ 占比够高时直接从空气里分氧。 */
export const EXTRACTOR_KJ_PER_HOUR = 500;
export const EXTRACTOR_OXYGEN_PER_HOUR = 2;
export const EXTRACTOR_MIN_O2_FRACTION = 0.15;

/** 光合放氧：每长成 1 kg 干重，放出多少 kg 氧气（偏高的游戏化系数）。 */
export const OXYGEN_PER_KG_GROWTH = 1.2;

/** 高强度钢瓶：信用点购买，按累计购买量打折。 */
export const CYLINDER_COST_CREDITS = 40;

/**
 * 一次买 `count` 个钢瓶的总价（信用点）。
 * 折扣按**累计**购买量算，避免「一次囤 50 个」套利。
 */
export function cylinderPriceCredits(alreadyOwned: number, count: number): number {
  let total = 0;
  for (let n = 0; n < count; n += 1) {
    const cumulative = alreadyOwned + n;
    if (cumulative >= 50) total += 30;
    else if (cumulative >= 10) total += 36;
    else total += CYLINDER_COST_CREDITS;
  }
  return Math.round(total);
}

/** 大气成分（按体积分数）——给大气提取器与「这星球能不能住人」用。 */
export interface AtmosphereReading {
  composition: Array<{ gas: string; fraction: number }>;
  oxygenFraction: number;
  breathable: boolean;
}

export function describeAtmosphere(reading: AtmosphereReading): string {
  const list = reading.composition
    .map((c) => `${c.gas} ${(c.fraction * 100).toFixed(1)}%`)
    .join('、');
  return `${list}（氧气 ${(reading.oxygenFraction * 100).toFixed(1)}%${reading.breathable ? '，可直接呼吸' : '，不能直接呼吸'}）`;
}

// ── 腐败、冷库与干粮 ────────────────────────────────────

/** 20℃ 时新鲜食物的保质期（母星时）。 */
export const ROT_BASE_HOURS = 72;
/** 每冷 10℃，保质期翻一倍。 */
export const ROT_COLD_FACTOR = 2;
/** 没有冷库时，每个站点/居所「不会坏」的那部分。 */
export const PANTRY_BASE_KG = 50;
/** 惰性气体室：比冷库便宜，但容量小、效果弱，且要吃星球的大气。 */
export const INERT_ROOM_CAPACITY_KG = 120;
export const INERT_ROOM_ROT_FACTOR = 0.75;
/** 惰性气体（氮+氩+二氧化碳+甲烷）至少要占这么多，气调才有意义。 */
export const INERT_MIN_FRACTION = 0.68;
/** 氧气太浓就不是惰性气氛了。 */
export const INERT_MAX_OXYGEN = 0.22;
/** 每座冷库额外保住的量。 */
export const COLD_STORE_CAPACITY_KG = 200;
/** 有冷库时，腐烂速度减半。 */
export const COLD_STORE_ROT_FACTOR = 0.5;
/** 仓库只是铁皮货架，比地窖烂得快。 */
export const WAREHOUSE_ROT_FACTOR = 1.5;
/** 干粮：1 kg 新鲜食物能做出多少。 */
export const DRIED_FOOD_RATIO = 0.6;
/** 每 kg 新鲜食物做干粮要花的电。 */
export const DRY_KJ_PER_KG = 500;
/** 干粮的保质期：不随温度变，够长。 */
export const DRIED_ROT_HOURS = 720;
/** 烂掉的部分有多少转成堆肥养分（磷/钾/微量，不含氮）。 */
export const ROT_COMPOST_FRACTION = 0.3;
/** 冷库的功耗（每母星时）。 */
export const COLD_STORE_UPKEEP_KJ_PER_HOUR = 300;

/** 某个温度下新鲜食物的保质期。 */
export function rotHoursFor(tempC: number): number {
  const span = 20 - tempC;
  return ROT_BASE_HOURS * ROT_COLD_FACTOR ** (span / 10);
}

/** 保鲜容量：地窖底子 + 每座冷库 + 每座惰性气体室。 */
export function pantryCapacityKg(coldStores: number, inertRooms = 0): number {
  return (
    PANTRY_BASE_KG +
    Math.max(0, coldStores) * COLD_STORE_CAPACITY_KG +
    Math.max(0, inertRooms) * INERT_ROOM_CAPACITY_KG
  );
}

/** 一个小时里，超出容量的那部分坏掉的比例。冷库优先于惰性气体室。 */
export function rotFractionPerHour(tempC: number, coldStores: number, inertRooms = 0): number {
  const hours = rotHoursFor(tempC);
  const factor =
    coldStores > 0 ? COLD_STORE_ROT_FACTOR : inertRooms > 0 ? INERT_ROOM_ROT_FACTOR : 1;
  return (1 / hours) * factor;
}

// ── 温室设定点与拟真环境核心 ─────────────────────────────

/** 温室设定点的可设范围。 */
export const SETPOINT_MIN_C = -60;
export const SETPOINT_MAX_C = 80;
/** 温差计费：每 1℃ 每小时多少钱。 */
export const SETPOINT_KJ_PER_DEGREE_HOUR = 25;
/** 温室基础维护费。 */
export const GREENHOUSE_BASE_UPKEEP_KJ_PER_HOUR = 100;
/** 拟真环境核心：造价、功耗、惩罚减半的系数。 */
export const REALISM_CORE_COST_KJ = 60_000;
export const REALISM_CORE_UPKEEP_KJ_PER_HOUR = 1_200;
/** 一座核心把人工气候惩罚乘上这个系数。 */
export const REALISM_CORE_FACTOR = 0.5;
