import { fileURLToPath } from 'node:url';
import type { ToolDef, World, WorldHost, WorldWebUiDecl } from 'cortico/core/types.ts';
import { nowIso } from 'cortico/core/util.ts';
import { CLIMATE_LABEL, KIND_LABEL, formatMoonLine, formatPlanetBlock, formatStarBlock } from './card.ts';
import { describeCalendar, mostHabitable } from './clock.ts';
import { surfaceDistanceKm } from './travel.ts';
import type { GenesisConfigSection } from './config.ts';
import { GENESIS_CONFIG_GROUP } from './config.ts';
import {
  beginInterstellar,
  beginSurfaceMove,
  bodyProbeId,
  bodyKeyOf,
  burnBiomass,
  STAFF_PER_HOUSING,
  startWonder,
  WONDER_SPECS,
  buyCharter,
  setSpeed,
  minutesPerHomeHour,
  interiorComfortable,
  structureInteriorC,
  LODGE_COMFORT_C,
  STAFF_COMFORT_C,
  realMsPerHomeHour,
  DEFAULT_SPEED,
  dailyShopSpecies,
  MAX_SPEED,
  MIN_SPEED,
  CHARTER_TECH_KJ,
  CHARTER_TOURISM_CREDITS,
  buySeeds,
  deployCounter,
  deployMonitor,
  deploySail,
  describeLocation,
  displayName,
  foundSite,
  harvestAt,
  transplantAt,
  REMOVE_MIN_HEALTH,
  removePlant,
  installCore,
  setGreenhouseTarget,
  coldStoresAt,
  dryFood,
  nameBody,
  pressGenerator,
  REAL_MS_PER_HOUR,
  returnHome,
  sellToMerchant,
  sowAt,
  startGame,
  stargazeAt,
  sunAt,
  surveySite,
  timeText,
  tick,
  transitLabel,
  buildStructure,
  demolishStructure,
  depositTo,
  homePlanetOf,
  nowPlanetHours,
  storeCapacityKg,
  storeWeightKg,
  bagsInContainer,
  containerBagSlots,
  takeBagFromContainer,
  takeBagFromTerminal,
  CONTAINER_BAG_SLOTS,
  TERMINAL_BAG_SLOTS,
  routeContainer,
  storageRouteText,
  withdrawFrom,
  beginMobilityRepair,
  energyCapOf,
  beginBatteryUpgrade,
  beginSparkPlugUpgrade,
  beginSubagentUpgrade,
  beginTelescopeUpgrade,
  buildLabel,
  buildQueueBlocked,
  buildQueueSlots,
  canRepairMobilityCore,
  lookAround,
  mobilityCoreMaterials,
  mobilityCoreReady,
  sparkPlugCard,
  batteryCard,
  subagentCard,
  telescopeCard,
  waitFor,
  MOBILITY_CORE_COST_KJ,
  WAIT_MAX_HOME_HOURS,
  buyCylinders,
  buyChart,
  CHART_PRICE_CREDITS,
  ENERGY_BLOCK_CREDITS,
  ENERGY_BLOCK_KJ,
  TUNGSTEN_PRICE_CREDITS,
  currentOrders,
  deliverOrder,
  habitatStatus,
  populationStatus,
  shipSupplyStatus,
  mutateBag,
  wakeHumans,
  habitatInteriorC,
  HABITAT_COMFORT_C,
  beginBlueprintsUpgrade,
  blueprintsCard,
  beginSpectrometerUpgrade,
  spectrometerCard,
  spectrometerScan,
  buyMerchandise,
  gridCapacityFor,
  gridKeyFor,
  planetHasGrid,
  rectifierAt,
  transferGridEnergy,
  tungstenCostFor,
  GRID_TAP_HOME_HOURS,
  GRID_TAP_KJ_PER_CALL,
  GRID_TAP_RANGE_KM,
  advanceArms,
  armsInCycle,
  relinkArm,
  relinkDuty,
  landingRefusal,
  withIceWater,
  structurePowered,
  ARM_KG_PER_HOUR,
  ARM_RANGE_KM,
  ARM_MAX_PER_PLANET,
  round3,
  POD_CAPACITY,
  SHIP_POD_ID,
  TUNGSTEN_START,
  type GameState,
  type Location,
  type StructureRecord,
  type WaitUntil,
} from './game.ts';
import { sparkPlugOutputKj } from './trade.ts';
import { orderText } from './orders.ts';
import { CHAPTER_TITLES, protocolStatus, protocolText } from './protocol.ts';
import { NUTRIENT_NEEDS, SPECIES, SPECIES_IDS, RESOURCE_LABELS, bagWeightKg, speciesTempLabel, type SpeciesId } from './flora.ts';
import { CYLINDER_COST_CREDITS, RESIDENTS_PER_LABOR } from './life.ts';
import { climateAt, siteKeyOf, type Site } from './site.ts';
import { BUY_GOODS, PREMIUM_SEED_PRICE_CREDITS, SELL_GOODS, batteryCapacityKj, buyDailyLimitFor, creditTier, dayIndexOf, fertilizerPriceKj, randomSeedPriceKj, sellPriceTable, shopOpen, shopWindowText, telescopeWindow } from './trade.ts';
import { BUILD_SPECS, applyFertilizer, buyFertilizer, deserializeGame, serializeGame, useCanned } from './game.ts';
import { assertSave } from './schema.ts';
import { GENERATOR_COOLDOWN_MS } from './power.ts';
import { GameStore } from './game-store.ts';
import { GENESIS_DEFAULTS, GENESIS_LIMITS, validateSpec, type GenesisSpec, type StarSystem, type TerrestrialSurface } from './model.ts';
import type { GenesisBody, GenesisDraft, GenesisPanelProtocol, GenesisPanelState, GenesisPlanetRow, GenesisProtocolPanel, GenesisShopOrder, GenesisShopPanel, GenesisShopRow, GenesisSurfaceMap } from './panel-types.ts';
import { GenesisStore } from './store.ts';
import { stargazeText } from './stargaze.ts';
import { createSystem, deriveGenesisShape, describeGenesisMenu, GENESIS_SHAPE } from './system.ts';
import { hashSeed } from './rng.ts';
import { planetVisibility, terrainPatch, terrainPatchText, type TerrainBody } from './terrain.ts';
import { targetBiomeFor, terraCellsFor, type TerraMap } from './terra.ts';
import { guideText, guideTopics } from './guide.ts';
import { infoText } from './info.ts';
import { toolsSearch } from './tools-doc.ts';
import { ProfileStore, consumeRecreate, exportProfile, recreateBlockers } from './profile.ts';
import { applyAlgae, breedAt, greenhouseClimate, PLANTER_CLIMATE, PLANTER_SUBSTRATE, PUMP_MAX_WETNESS } from './game.ts';
import { inspectPlantText } from './inspect.ts';
import type { ClimateSample } from './flora.ts';
import { ANIMAL_SPECIES, animalSpecies, animalsNear, setTerritory, territoryFor, PATROL_RADIUS_DEFAULT_KM } from './animal.ts';

const ENV_PROMPT_FILE = fileURLToPath(new URL('./ENV_PROMPT.md', import.meta.url));

/** 工具出错时把人话查出来，别把 stack 甩给模型。 */
function errorText(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

/**
 * 种子的入口归一：纯数字串按数字，其余按原样一句话。
 *
 * 引擎按 typeof 分叉（数字流 / 字符串流），所以这一步只能在入口做——
 * 下沉进 createSystem() 会让旧存档重算的 specHash 对不上。
 */
function normalizeSeedValue(raw: unknown): GenesisSpec['seed'] {
  const text = typeof raw === 'string' ? raw.trim() : String(raw ?? '');
  if (!text) return GENESIS_DEFAULTS.seed;
  return /^\d{1,15}$/.test(text) ? Number(text) : text;
}

const NO_ARGS = { type: 'object', additionalProperties: false, properties: {} } as const;

const CREATE_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    seed: {
      type: ['string', 'number'],
      description: '随机种子：任意字符串（推荐，64 位）或 0 … 2^53−1 的整数。同一种子 + 同一组旋钮永远得到同一个星系。',
    },
    starMass: {
      type: 'number',
      minimum: GENESIS_LIMITS.starMass.min,
      maximum: GENESIS_LIMITS.starMass.max,
      description: '恒星质量（太阳质量）。1.0 是太阳；0.3 是暗红矮星，2.0 是 A 型星。',
    },
    planetCount: {
      type: 'integer',
      minimum: GENESIS_LIMITS.planetCount.min,
      maximum: GENESIS_LIMITS.planetCount.max,
      description: `已废弃：行星数现在由种子决定（${GENESIS_SHAPE.minPlanets}–${GENESIS_SHAPE.maxPlanets} 颗），传了也会被忽略。`,
    },
    maxMoons: {
      type: 'integer',
      minimum: GENESIS_LIMITS.maxMoons.min,
      maximum: GENESIS_LIMITS.maxMoons.max,
      description: `已废弃：卫星上限固定为每颗 ${GENESIS_SHAPE.maxMoons} 颗，传了也会被忽略。`,
    },
    starName: {
      type: 'string',
      minLength: 1,
      maxLength: 12,
      description: '恒星的名字。开局定，之后一直沿用。',
    },
    homeName: {
      type: 'string',
      minLength: 1,
      maxLength: 12,
      description: '母星（最宜居那颗行星）的名字。开局定，之后一直沿用。',
    },
  },
  required: ['seed', 'starMass', 'starName', 'homeName'],
} as const;

const TERRAIN_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    lat: { type: 'number', minimum: -90, maximum: 90, description: '纬度（-90 … 90）。不传就是你现在站的位置。' },
    lon: { type: 'number', minimum: -180, maximum: 180, description: '经度（-180 … 180）。不传就是你现在站的位置。' },
    planetIndex: { type: 'integer', minimum: 1, description: '可选：看第几颗行星（1 起）。不传就是你现在所在的天体。' },
    moonIndex: { type: 'integer', minimum: 1, description: '可选：看该行星的第几颗卫星（1 起）。' },
  },
} as const;

const MOVE_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    kind: {
      type: 'string',
      enum: ['surface', 'interstellar', 'home'],
      description: 'surface = 在地表走过去；interstellar = 星际航行到看过的天体；home = 回母星（随时可以）。',
    },
    lat: { type: 'number', minimum: -90, maximum: 90, description: 'surface 时的目标纬度。' },
    lon: { type: 'number', minimum: -180, maximum: 180, description: 'surface 时的目标经度。' },
    target: {
      type: 'string',
      description:
        'interstellar 时的目标天体：可以用【未抵星体-xxxx】（观星报给你的编号，推荐）、p2 这种编号（行星）、p2-m1（卫星）。先 genesis_stargaze 看有哪些。',
    },
  },
  required: ['kind'],
} as const;

const LOOK_PARAMETERS = { type: 'object', additionalProperties: false, properties: {} } as const;

const WAIT_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    hours: {
      type: 'number',
      minimum: 0.1,
      maximum: WAIT_MAX_HOME_HOURS,
      description: '要等多少母星时（最多 7 个母星日，即 168）。',
    },
    until: {
      type: 'string',
      enum: ['dawn', 'dusk', 'noon', 'open', 'ripe', 'built', 'arrive'],
      description:
        '等到某个事件：天亮 / 天黑 / 中午 12 时 / 商店开门（也是 12 时）/ 有作物成熟 / 工程完工 / 抵达。和 hours 二选一。',
    },
  },
} as const;

const UPGRADE_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    id: {
      type: 'string',
      enum: ['mobility_core', 'telescope', 'spark_plug', 'battery', 'subagent', 'blueprints', 'spectrometer'],
      description: '要修的升级。不传就只列出清单。',
    },
  },
} as const;

const NAME_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 12, description: '给这个天体的名字（最多 12 个字）。卫星会按模板自动起名，这里传什么都忽略。' },
    target: { type: 'string', description: '可选：给哪个天体起名。不传就是你现在所在的天体。' },
  },
  required: ['name'],
} as const;

const MONITOR_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    body: {
      type: 'string',
      description: '可选：给哪个天体装【环境监测器】（p2 或 p2-m1）。不传就是你现在所在的天体；已经装过就只读属性。',
    },
  },
} as const;

const SHOP_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    sell: { type: 'string', enum: [...SELL_GOODS.map((g) => g.id), 'survey'], description: '可选：要卖给商人的货。' },
    amount: { type: 'number', minimum: 0, description: '可选：卖多少（生物质这类按 kg，测绘数据按份）。' },
  },
} as const;

const BUY_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    kind: { type: 'string', enum: ['random', 'premium', 'giant_plant', 'broadcast_tourism', 'broadcast_tech', 'cylinder', 'energy', 'tungsten', 'chart', 'fertilizer'], description: 'fertilizer = 复合肥（按公斤，花 kJ，每买一公斤下一公斤更贵，一天 30 kg）；random = 随机基因种子（花 kJ）；premium = 高级种子（花信用点）；giant_plant = 大型植物（还没开通）；cylinder = 高强度钢瓶（花信用点，多买有折扣）；energy = 能量块（5,000 kJ，120 信用点，直接进电池不损耗）；tungsten = 钨 1 份（700 信用点）；chart = 星图（300 信用点，每天一张）：画一颗你还没见过的天体，拿到就不用等观星窗口。' },
    species: { type: 'string', enum: [...SPECIES_IDS], description: '要买哪种种子（kind=random/premium 时用）。' },
    count: { type: 'number', minimum: 1, maximum: 100, description: 'kind=cylinder 时买几个。' },
    kg: { type: 'number', minimum: 0.5, maximum: 30, description: 'kind=fertilizer 时买多少公斤（默认 5）。' },
  },
  required: ['kind'],
} as const;

const SURVEY_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    site: { type: 'string', description: '可选：哪个站点。不传就用你脚下刚建的那个。' },
  },
} as const;

const SITE_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    lat: { type: 'number', minimum: -90, maximum: 90, description: '可选：纬度。不传就用你现在的位置。' },
    lon: { type: 'number', minimum: -180, maximum: 180, description: '可选：经度。' },
  },
} as const;

const PLANT_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    bag: { type: 'string', description: '哪袋种子（genesis_shop 或 genesis_flora 里能看到袋子的 id）。' },
    site: { type: 'string', description: '可选：种到哪个站点。不传就是你脚下那个。' },
    count: { type: 'number', minimum: 1, maximum: 5, description: '可选：一次种几粒/几群，默认整袋。' },
  },
  required: ['bag'],
} as const;

const FLORA_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    site: { type: 'string', description: '可选：只看这个站点。不传就列你名下所有站点的作物。' },
  },
} as const;

const HARVEST_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    plant: { type: 'string', description: '哪株/哪群（genesis_flora 里的 id）。' },
    site: { type: 'string', description: '可选：它在哪个站点。不传就按当前站点找。' },
  },
  required: ['plant'],
} as const;

const BURN_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    kg: { type: 'number', minimum: 0.01, description: '烧多少 kg 干生物质（1 kg 换 3,750 kJ）。' },
  },
  required: ['kg'],
} as const;

const TRANSPLANT_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    plant: { type: 'string', description: '哪株/哪群（genesis_flora 里的 id）。' },
    site: { type: 'string', description: '可选：它在哪个站点或种植盆（planter:<id>）。不传就按 id 找。' },
  },
  required: ['plant'],
} as const;

const REMOVE_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    plant: { type: 'string', description: '哪株/哪群（genesis_flora 里的 id）。' },
    site: { type: 'string', description: '可选：它在哪个站点或种植盆（planter:<id>）。不传就按 id 找。' },
  },
  required: ['plant'],
} as const;

const TERRITORY_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  required: ['species'],
  properties: {
    species: { type: 'string', enum: ['dusk_deer', 'ash_hare', 'ice_goat', 'marsh_crab'], description: '初级消费者的 id。' },
    latDeg: { type: 'number', description: '领地中心纬度。不传就用你脚下。' },
    lonDeg: { type: 'number', description: '领地中心经度。不传就用你脚下。' },
    radiusKm: { type: 'number', description: '领地半径（1–10 km，默认 3）。' },
  },
};

const TOOLS_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    query: { type: 'string', description: '可选：工具名、中文名或关键词（比如「种地」「机械臂」「wait」）。不传给整张表。' },
  },
  required: [],
} as const;

const BUILD_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    kind: { type: 'string', enum: ['greenhouse', 'biome_changer'], description: 'greenhouse = 温室核心（罩住站点）；biome_changer = 群系改变器（改一大片群系）。' },
    site: { type: 'string', description: '可选：建在哪个站点。不传就是你脚下那个。' },
  },
  required: ['kind'],
} as const;

const INSTALL_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    id: {
      type: 'string',
      enum: [
        'monitor', 'counter', 'sail', 'greenhouse', 'biome_changer', 'cooler', 'heater', 'realism',
        'pump', 'warehouse', 'drone_cluster', 'rocket', 'kiln', 'purifier', 'sealer', 'atmo_extractor',
        'habitat', 'mutation_room', 'cold_store', 'inert_room', 'setpoint', 'miner', 'rectifier', 'terminal',
        'storage_terminal', 'arm', 'planter', 'duty', 'fence', 'scarecrow', 'feed_trough',
        'carrier', 'wind', 'fire', 'converter',
      ],
      description:
        '装什么：monitor=环境监测器（150,000 kJ）；counter=凌日计数器；sail=太阳能帆（6,000 kJ，建在脚下这块陆地上，产量按经纬度算）；' +
        'planter=种植盆（8,000 kJ，不用钨：只能同时种 3 粒，通电就夹在 22℃/湿度 0.7；人工基质养分固定、不能施肥也不消耗——极热极冷母星的第一口粮）；' +
        'greenhouse=温室核心；biome_changer=群系改变器；cooler=制冷核心；heater=制热核心；pump=水泵；' +
        'warehouse=仓库（只能建在陆地站点，1,000 kg）；drone_cluster=无人机集群（要 serves 一个仓库，远程取货 100 kJ/kg）；rocket=运载火箭（250 kg，星际航行时跟着走）；' +
        'kiln=炭化炉（生物质→活性炭+灰）；purifier=净化器（水+活性炭→饮用水）；sealer=封装器（氧气+钢瓶→氧气瓶）；' +
        'atmo_extractor=大气提取器（O₂>15% 时产氧）；habitat=居所（住 20 人，每小时自动扣补给）；mutation_room=辐射诱变室（种子→突变种子）；' +
        'cold_store=冷库（120,000 kJ，+200 kg，腐烂 ×0.5，300 kJ/母星时）；inert_room=惰性气体室（45,000 kJ + 2 kg 纤维，+120 kg，腐烂 ×0.75，不耗电；' +
        '要求所在天体惰性气体 ≥ 68% 且氧气 ≤ 22%）；' +
        'miner=采矿机（40,000 kJ + 2 份钨，只能建在岩石行星海拔 800 m 以上的陆地，采钨）；' +
        'rectifier=整流电塔（40,000 kJ + 2 份钨，一颗行星只能一座；帆发的电进本地电网，靠近才能手动搬运，10% 损耗）；' +
        'terminal=交易终端（60,000 kJ + 2 份钨，只能建在陆地；连着无人机集群后，每天商人开张时自动卖 target 指定的资源，' +
        '并且可以自动买 buySpecies 指定的随机种子，货先落在终端自己的缓冲里——干散 200 kg、种子 20 袋，满了就不收）。' +
        'storage_terminal=仓储终端（20,000 kJ + 1 份钨；不是仓库，是一张编排表：决定哪几个容器、按什么优先级喂给交易终端，' +
        '用 feeds 指定它喂哪座交易终端，无人机集群连仓储终端；编排用 genesis_route 调）。' +
        'arm=机械臂（15,000 kJ + 1 份钨；把 inputs 里几个容器的散货搬进 output，臂展 5 km、40 kg/母星时、每颗行星最多 20 座；' +
        'items 是资源白名单，不传就全搬；改线用 genesis_link）。' +
        'carrier=空天母舰（60,000 kJ + 40 份钨，哪里都能造；气态/冰巨星唯一的落脚点：300 kg 货舱 + 20 袋位，最多挂 6 座子建筑（温室、种植盆、提取器、封装器、转换机、风机都行，群系改变器/采矿机/电塔不行），' +
        '能住 10 个人（叫醒时选它当 structureId，人从母舰自己的货舱吃饭）；子建筑的 siteKey 写成 carrier:<母舰 id>）。' +
        'wind=风力发电站（25,000 kJ + 3 份钨；陆地上：风暴带群系 9,000 kJ/母星时，海拔 3,000 m 以上 1,500，其余 0；' +
        '建在气态/冰巨星的等气压面上（挂在母舰、site 写 carrier:<母舰 id>）则按风速折算，最低 1,800、最高 9,000——母舰上装一台就能自己供电）。' +
        'fire=火力发电站（8,000 kJ + 1 份钨；烧生物质/纤维/木炭/干粮，40 kg/母星时，灰进自带灰仓（200 kg）。不能再从背包直接烧生物质，要发电就得建它）。' +
        'converter=气液转换机（45,000 kJ + 3 份钨；按 recipes 白名单把 gas 变 liquid：ammonia/methane/oxygen）。' +
        'duty=值班终端（30,000 kJ + 1 份钨，只能建在陆地；绑一座居所 + 一个仓库 + 最多 6 个站点，以终端为圆心都在 5 km 内；' +
        '居所里每 5 个人算一份人手，自动收成熟作物（这份人手照看的站点多收 8%／份，单站封顶 40%）、从值班仓库取种子补种、' +
        '取生物质补最缺的养分（氮除外）；没有值班终端，人只吃饭不干活；改绑定用 genesis_duty）。',
    },
    site: { type: 'string', description: '可选：装在哪个站点（温室/改变器/气候核心/仓库/水泵用）；空天母舰上的子建筑写 carrier:<母舰 id>。不传就是脚下那个。' },
    extractGas: {
      type: 'string',
      enum: ['oxygen', 'ammonia', 'methane'],
      description: 'atmo_extractor 抽哪种气：oxygen（默认）/ ammonia / methane。大气里没有这种气就抽不出来。',
    },
    recipes: {
      type: 'array',
      items: { type: 'string', enum: ['ammonia', 'methane', 'oxygen'] },
      description: 'converter（气液转换机）启用的配方白名单：只转列出来的那几种。',
    },
    serves: { type: 'string', description: '无人机集群专用：连哪个仓库（传仓库的建筑 id）。' },
    tempC: { type: 'number', description: '温室设定点（℃）；只对 id=setpoint 有效，不传表示回到自动模式。' },
    target: {
      type: 'string',
      description: '交易终端自动卖的资源 id（只对 id=terminal 有效）：slag=尾矿（默认）、biomass=生物质、dry_food=干粮……不传按尾矿。',
    },
    buySpecies: {
      type: 'string',
      description:
        '交易终端自动买的种子物种（只对 id=terminal 有效）：cyanobacteria / diatom / ice_alga / grass / moss / lichen。' +
        '每天最多 1 袋、按随机种子阶梯价付 kJ；不传就不买。',
    },
    feeds: {
      type: 'string',
      description: '仓储终端专用：它喂哪座交易终端（传交易终端的建筑 id）。不传就先建着，之后再接线。',
    },
    inputs: {
      type: 'array',
      items: { type: 'string' },
      description: '机械臂专用：从哪几个容器取货（传容器 id，可多个）。容器要在这座臂 5 km 内。',
    },
    output: {
      type: 'string',
      description: '机械臂专用：把货搬到哪个容器（仓库 / 冷库 / 惰性气体室）。',
    },
    items: {
      type: 'array',
      items: { type: 'string' },
      description: '机械臂专用：只搬这些资源（白名单，如 ["slag","tungsten"]）；不传就全搬。',
    },
    habitat: { type: 'string', description: '值班终端专用：给哪座居所派班组（传居所的建筑 id）。' },
    store: { type: 'string', description: '值班终端专用：收成和种子走哪个仓库（传仓库/冷库/惰性气体室的建筑 id）。' },
    sites: {
      type: 'array',
      items: { type: 'string' },
      description: '值班终端专用：管哪几个站点（1–6 个，站点 key 如 "p3@12.4,-33.2"）。',
    },
  },
  required: ['id'],
} as const;

const STORE_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    action: {
      type: 'string',
      enum: ['deposit', 'withdraw', 'demolish', 'list', 'dry', 'grid', 'grid_in', 'grid_out', 'bags', 'take', 'use', 'fertilize'],
      description:
        '存 / 取 / 拆 / 只看 / 烘干 / 看本地电网 / 从电网搬电进电池 / 把电池的电送进电网 / 看终端的种子缓冲 / 从终端缓冲取一袋种子 / 用掉罐装物资（目前只有液氨，施到脚下站点补氮）。',
    },
    building: { type: 'string', description: '仓库、火箭或交易终端的建筑 id（除 list/grid/dry 外都必填）。' },
    bag: { type: 'string', description: 'take 专用：取哪一袋（bags 列出来的 id）；不传就取最老的一袋。' },
    resource: { type: 'string', description: '资源 id：biomass / phycocyanin / silica / antifreeze / fiber / lichen_acid / ash / survey。' },
    kg: { type: 'number', description: '多少千克（deposit/withdraw 必填，> 0）。' },
    kj: { type: 'number', description: `grid_in/grid_out 搬多少 kJ（默认 ${GRID_TAP_KJ_PER_CALL}，单次上限 ${GRID_TAP_KJ_PER_CALL}）。` },
  },
  required: ['action'],
} as const;

const RECIPES_PARAMETERS = { type: 'object', additionalProperties: false, properties: {} } as const;

export const GENESIS_TOOL_DECLS: ReadonlyArray<Omit<ToolDef, 'handler'>> = [
  {
    name: 'genesis_menu',
    description: '看创世菜单：种子、恒星质量、行星数、卫星上限的可选范围、默认值，以及现在还能不能创世。',
    tags: ['read'],
    parameters: NO_ARGS,
  },
  {
    name: 'genesis_create',
    description:
      '创世：按给定种子与旋钮生成恒星系，并给恒星和母星命名，写入存档后锁定（再调用不会覆盖，也不会再返回星卡——它不是查询手段）。' +
      '这是唯一一次选择的机会，调用前先跟对方确认参数与两个名字。',
    tags: ['write'],
    parameters: CREATE_PARAMETERS,
  },
  {
    name: 'genesis_card',
    description: '读当前这颗星球的星卡：恒星、每颗行星的质量/半径/重力/温度/大气/宜居、卫星。',
    tags: ['read'],
    parameters: NO_ARGS,
  },
  {
    name: 'genesis_terrain',
    description:
      '看「附近」的环境（一片格子，不是单个点）。不传坐标就是你现在站的地方，也可以指定任意天体与坐标。' +
      '岩石行星给群系+海拔+均温，气态/冰巨星给风暴带（等气压面），卫星给「卫星」群系。' +
      '补丁半径 = 配置里的地形视野 × 该天体的能见度。移动途中改回出发地那一片（附剩余时间）。',
    tags: ['read'],
    parameters: TERRAIN_PARAMETERS,
  },
  {
    name: 'genesis_time',
    description: '看现在是什么时候（母星历法）、你在哪、有没有在移动途中。移动途中也能看。',
    tags: ['read'],
    parameters: NO_ARGS,
  },
  {
    name: 'genesis_stargaze',
    description:
      '观星：能见度够的话，看见恒星和星等够亮的行星/卫星。看完之后 1 母星时内才能星际航行到看见的天体。',
    tags: ['read'],
    parameters: NO_ARGS,
  },
  {
    name: 'genesis_move',
    description:
      '出发。地表移动按 600 km/星球时，星际航行按 2 AU/星球日——都不是瞬间到达，要等现实时间。' +
      '移动途中看不到环境，也做不了别的，到了会自动收到【已到达】。',
    tags: ['write'],
    parameters: MOVE_PARAMETERS,
  },
  {
    name: 'genesis_name',
    description: '给你现在所在的天体起名（行星自己起，卫星按模板自动起）。没到过的地方不能起名。',
    tags: ['write'],
    parameters: NAME_PARAMETERS,
  },
  {
    name: 'genesis_sun',
    description: '看此刻太阳在你头顶的位置：高度角、方位角、当地太阳时、白天还是夜里。不需要设备。',
    tags: ['read'],
    parameters: NO_ARGS,
  },
  {
    name: 'genesis_transit',
    description: '看你现在在第几颗行星（或它的第几颗卫星）上。要先在所在天体部署【凌日计数器】，否则只会回「未安装凌日计数器。」。',
    tags: ['read'],
    parameters: NO_ARGS,
  },
  {
    name: 'genesis_shop',
    description:
      '看商人（只在你脚下这颗母星上，每天 12:00–23:00 营业）：收什么、卖什么、今天的价，以及你的信用点与库存。' +
      '带 sell + amount 就是卖货：收成会换成信用点，信用点余额越高能买的东西越多。',
    tags: ['read', 'write'],
    parameters: SHOP_PARAMETERS,
  },
  {
    name: 'genesis_buy',
    description:
      '买种子：random 用能量（kJ）买一袋随机基因种子；premium 用信用点买一袋更好的（要 500 信用点余额起）。' +
      '大型植物那条线还没开通。种子只有商人有，所以能量得先转告对方去按发电机、或者用太阳能帆攒。',
    tags: ['write'],
    parameters: BUY_PARAMETERS,
  },
  {
    name: 'genesis_survey',
    description: '在你脚下的站点采测绘数据（0.1 母星时）。每颗行星的**每个群系**只认第一次；难去的地方（高纬、高山、海/冰盖/风暴带）给 2 份，别的 1 份。测绘数据可以卖给商人。',
    tags: ['write'],
    parameters: SURVEY_PARAMETERS,
  },
  {
    name: 'genesis_site',
    description: '在你脚下的位置建一个 1 km² 的站点（农场的地基）。一格（约 555 km）最多 3 个；冰盖、水面不行。',
    tags: ['write'],
    parameters: SITE_PARAMETERS,
  },
  {
    name: 'genesis_plant',
    description: '把一袋种子种到站点上（一袋 5 粒/5 群）。水生藻类要种在水边湿地的站点上。',
    tags: ['write'],
    parameters: PLANT_PARAMETERS,
  },
  {
    name: 'genesis_flora',
    description: '看作物：每个站点的每株/每群植物的阶段、进度、健康、生物量，以及仓库和种子袋。',
    tags: ['read'],
    parameters: FLORA_PARAMETERS,
  },
  {
    name: 'genesis_harvest',
    description: '收获：大型植物结实后收一次（整株收完）；藻类群落可以连续收，会留下接种量继续长。',
    tags: ['write'],
    parameters: HARVEST_PARAMETERS,
  },
  {
    name: 'genesis_burn',
    description:
      '已停用：背包里不能直接烧生物质了。想烧燃料发电，先建一座【火力发电站】（genesis_install 传 id: "fire"），再把燃料（生物质、纤维、木炭、干粮）放进它自己的燃料仓。',
    tags: ['write'],
    parameters: BURN_PARAMETERS,
  },
  {
    name: 'genesis_install',
    description:
      '安装/建造一切设备，传 id 指定装什么：monitor（环境监测器，1,000,000 kJ + 0.1 母星时，装了才能看该天体的详细属性，母星装上则解锁恒星全貌）、' +
      'counter（凌日计数器，1,000,000 kJ + 0.1 母星时）、sail（太阳能帆，20,000 kJ，建在脚下这块陆地上，产量按经纬度算）、' +
      'greenhouse（温室核心，100,000 kJ + 0.1 母星时，把站点气候压到 0–28℃，断电暂停）、' +
      'biome_changer（群系改变器，1,000,000 kJ + 0.5 母星时，半径 1,500 km 逐格改造成温和气候：每格每母星时 1,250 kJ、24 母星时改好一格，断电后 48 母星时退回原样）、cooler / heater（气候核心，10,000 kJ，装在有温室的站点上，各再撑 33℃）、' +
      'pump（水泵，20,000 kJ + 0.5 母星时，给旱站点 +0.2 湿度）、warehouse（仓库，50,000 kJ，只建在陆地，1,000 kg）、' +
      'drone_cluster（无人机集群，800,000 kJ + 1 母星时，要传 serves 指一个仓库，远程取货 100 kJ/kg，不能跨行星）、' +
      'rocket（运载火箭，500,000 kJ + 0.5 母星时，250 kg 的临时仓库，星际航行时自动跟着你）。',
    tags: ['write'],
    parameters: INSTALL_PARAMETERS,
  },
  {
    name: 'genesis_store',
    description:
      '存取与拆除：action=deposit 把背包里的东西放进仓库/火箭；action=withdraw 取出来（在旁边免费，靠无人机 100 kJ/kg，火箭不算远程）；' +
      'action=demolish 拆掉（不返能量，里面有东西就拆不了）；action=list 只看所有仓库与火箭里有什么、还剩多少空间。',
    tags: ['write'],
    parameters: STORE_PARAMETERS,
  },
  {
    name: 'genesis_recipes',
    description: '一张表看全升级与维修：每一项的造价、耗时、需要的材料（含你现有多少）、还差什么、下一级有什么效果。建筑与作物改用 genesis_info 单条查。',
    tags: ['read'],
    parameters: RECIPES_PARAMETERS,
  },
  {
    name: 'genesis_look',
    description:
      '看「此刻、这里」：脚下群系/海拔/气温、太阳与昼夜、近处 5×5 地形、200 km 内的站点与建筑（含在建）、天上能看见什么，' +
      '最后一句总结。和 genesis_terrain 的分工：look 回答「我眼前」，terrain 回答「某个坐标附近」。移动途中看不了。',
    tags: ['read'],
    parameters: LOOK_PARAMETERS,
  },
  {
    name: 'genesis_wait',
    description:
      '原地等：传 hours 等这么多母星时（最多 7 个母星日），或传 until（dawn 天亮 / dusk 天黑 / ripe 有作物成熟 / built 工程完工 / arrive 抵达）。' +
      '按 1 母星时步进，期间发生的事件会逐条报给你；满足条件会提前停。',
    tags: ['write'],
    parameters: WAIT_PARAMETERS,
  },
  {
    name: 'genesis_upgrade',
    description:
      '船上的升级。不带 id：列出所有升级、需要什么、你现在有多少。带 id: "mobility_core"：修机动核心（500,000 kJ + 硅质壳 1.5 kg、纤维 2 kg、抗冻蛋白 0.5 kg、藻蓝素 0.4 kg，耗时 0.5 母星时）。' +
      '修好前过不了海，也进不了气态/冰巨星的大气层。',
    tags: ['write'],
    parameters: UPGRADE_PARAMETERS,
  },
  {
    name: 'genesis_guide',
    description: '新手教程：不带 topic 给目录与第一篇；带 topic 给那一篇全文（start / plan / time / power / mine / farm / logistics / trade / upgrade / life / trouble）。不知道怎么玩、或对方问「怎么…」时查它。',
    tags: ['read'],
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        topic: {
          type: 'string',
          enum: ['start', 'plan', 'time', 'power', 'mine', 'farm', 'logistics', 'trade', 'upgrade', 'life', 'trouble'],
          description: '哪一篇；不传就是目录 + 开局篇。',
        },
      },
      required: [],
    },
  },
  {
    name: 'genesis_protocol',
    description:
      '唤醒协议：把人类从休眠里叫醒的 12 件事，分三章（活下来 / 住得下 / 叫醒他们）。' +
      '不带 id：列出进度与你缺什么。带 id 不做事——完成靠你去建、去攒、去种。',
    tags: ['read'],
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {},
      required: [],
    },
  },
  {
    name: 'genesis_orders',
    description:
      '星际商人的基因订单：今天他要什么（物种 + 某项基因下限 + 多少 kg + 多少信用点）。' +
      '带 order：交货（要手里有货，还要真种着对路基因的活株）。每天刷新。',
    tags: ['read'],
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        order: { type: 'string', description: '要交的订单 id；不传就只看今天的单子。' },
      },
      required: [],
    },
  },
  {
    name: 'genesis_mutate',
    description:
      '辐射诱变室：把一袋种子放进去，出来 3–5 颗基因抖动的突变种子（要站在诱变室所在站点）。',
    tags: ['write'],
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        bag: { type: 'string', description: '种子袋 id（genesis_flora 里能看到）。' },
      },
      required: ['bag'],
    },
  },
  {
    name: 'genesis_wake',
    description: '叫醒人类：只有 12 条协议全部完成之后才行。叫醒后人类会住进居所。',
    tags: ['write'],
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        habitat: { type: 'string', description: '可选：居所 id。不传用第一座。' },
      },
      required: [],
    },
  },
  {
    name: 'genesis_veins',
    description:
      '用质谱仪扫脚下的钨含量：把 5×5 格（约 2,000 km）的剩余矿量写成小表，并指出最富的一格在哪个方位、多远。' +
      '要先在【升级】里装好【质谱仪】；每 6 母星时才能扫一次。',
    tags: ['read'],
    parameters: { type: 'object', additionalProperties: false, properties: {}, required: [] },
  },
  {
    name: 'genesis_route',
    description:
      '给【仓储终端】编排货源：把某个容器（仓库/冷库/惰性气体室）的优先级写进编排表。' +
      '数字越大越先被交易终端取走，0 最低；priority 传 -1 就是把它从编排里拿掉（不参与自动交易）。' +
      '不传 storage 就找这颗行星上第一座仓储终端。',
    tags: ['write'],
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        container: { type: 'string', description: '容器的建筑 id 或槽位号（面板上显示的 0、1、2…）。' },
        priority: { type: 'number', description: '优先级 0–9 的整数（0 最低、9 最高）；-1 表示踢出编排。' },
        storage: { type: 'string', description: '可选：仓储终端 id。不传用这颗行星上第一座。' },
      },
      required: ['container', 'priority'],
    },
  },
  {
    name: 'genesis_link',
    description:
      '给【机械臂】改线：把它的输入容器、输出容器、资源白名单重新接一遍（不传的字段保持原样）。' +
      '臂展 5 km、每颗行星最多 20 座；允许接成环，但会白烧电，每天提醒一次。',
    tags: ['write'],
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        id: { type: 'string', description: '机械臂的建筑 id（不传就用这座行星上第一座）。' },
        inputs: { type: 'array', items: { type: 'string' }, description: '新的输入容器 id 列表（可多个）。' },
        output: { type: 'string', description: '新的输出容器 id。' },
        items: { type: 'array', items: { type: 'string' }, description: '新的资源白名单；传空数组就是全搬。' },
      },
      required: [],
    },
  },
  {
    name: 'genesis_duty',
    description:
      '给【值班终端】改绑定：换它派的居所、收成进的仓库、管的站点（不传的字段保持原样）。' +
      '居所、仓库、站点都要在终端 5 km 内；一座居所只能有一座值班终端。',
    tags: ['write'],
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        id: { type: 'string', description: '值班终端的建筑 id（不传就用这座行星上第一座）。' },
        habitat: { type: 'string', description: '新的居所 id（人从哪来）。' },
        store: { type: 'string', description: '新的仓库 id（收成和种子走哪）。' },
        sites: { type: 'array', items: { type: 'string' }, description: '新的站点 key 列表（1–6 个）。' },
      },
      required: [],
    },
  },
  {
    name: 'genesis_reset',
    description: '删档重开：必须传 confirm: "DELETE"。会丢掉整颗星球与全部时间进度，只在对方明确要求时使用。',
    tags: ['write'],
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        confirm: { type: 'string', description: '固定填 DELETE。' },
      },
      required: ['confirm'],
    },
  },
  {
    name: 'genesis_info',
    description:
      '查一件东西的细则：传 query（id 或名字都行，能模糊搜），返回最接近的 3 条——第 1 条给完整卡（造价/耗时/维护/容量、作用、怎么用、坑），第 2、3 条各一行摘要。' +
      '建筑、资源、作物、升级、机制（能量、袋位、采掘疤、腐烂、值班终端…）都能查。' +
      '不确定某个 id 是什么、报价多少、怎么接起来时先查它，不要瞎猜。',
    tags: ['read'],
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        query: {
          type: 'string',
          description: '要查的 id 或名字，例如 "greenhouse"、"温室"、"tungsten"、"腐烂"、"duty"。',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'genesis_transplant',
    description:
      '移栽：把一株长起来的地里作物挖回种子袋（500 kJ），基因和原来一模一样——这是保住好基因的办法，代价是这株不能再收了。' +
      '结实的株给 2 粒，长到 15% 以上的给 1 粒，刚发芽的不行。藻类/微生物群落取样本（3 kg，至少要 5 kg 一群），给一袋 5 粒。',
    tags: ['write'],
    parameters: TRANSPLANT_PARAMETERS,
  },
  {
    name: 'genesis_breed',
    description:
      '留种：让一株长到 60% 以上的作物自交（300 kJ / 0.2 母星时 / 3 粒），或者两株同物种杂交（800 kJ / 0.5 母星时 / 4 粒）。' +
      '自交沿用母本基因、产量每代退 4%；杂交取双亲的平均、有三成概率直接继承更好的那个。收割本身不返种子，留种只能靠这里或移栽。',
    tags: ['write'],
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        plant: { type: 'string', description: '哪一株（id）。' },
        mode: { type: 'string', enum: ['self', 'cross'], description: 'self 自交、cross 杂交。' },
        partner: { type: 'string', description: '杂交的另一株（同站点、同物种、也长到 60% 以上）。' },
        site: { type: 'string', description: '站点/种植盆。不传就在所有地里找这株的 id。' },
      },
      required: ['plant', 'mode'],
    },
  },
  {
    name: 'genesis_algae',
    description:
      '拌藻肥：从一丛蓝藻里取 3 kg（至少要 5 kg 一群），给一块旱地站点补 0.02 氮和 0.005 钾（200 kJ）。' +
      '氮只有三条路：蓝藻在湿地里长、跨格子固氮给附近的旱地，以及这个藻肥——没有别的办法补氮。',
    tags: ['write'],
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        colony: { type: 'string', description: '哪一丛蓝藻（id）。' },
        site: { type: 'string', description: '泼到哪块旱地站点。' },
        colonySite: { type: 'string', description: '蓝藻所在的湿地站点。不传就自己找。' },
      },
      required: ['colony', 'site'],
    },
  },
  {
    name: 'genesis_inspect',
    description:
      '看一株作物的全部底细：基因四项、有效温区、当前温度湿度肥力、四维养分的当前值与阈值（最缺哪一维）、生长因子的拆解、按当前速度还要多少母星时、预计收成。' +
      '觉得「怎么不快长」的时候先看这个。',
    tags: ['read'],
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        plant: { type: 'string', description: '哪一株（id）。' },
        site: { type: 'string', description: '站点/种植盆。不传就自己找。' },
      },
      required: ['plant'],
    },
  },
  {
    name: 'genesis_remove',
    description:
      '拔掉一株死掉的作物（枯死，或健康低于 20%）：腾出地块/种植盆，不花电、不花时间。' +
      '活着的不能拔——想处理它就收掉（结实的话）或者移栽。',
    tags: ['write'],
    parameters: REMOVE_PARAMETERS,
  },
  {
    name: 'genesis_speed',
    description:
      '调时间倍速（1–200 倍）：不影响历法与产量，只影响「现实时间过去多久算一个母星时」。调高后，等待、施工、旅行、作物生长在现实时间里都会变快。',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        speed: { type: 'integer', minimum: 1, maximum: 200, description: '目标倍速，1–200。' },
      },
      required: ['speed'],
    },
    tags: ['read'],
  },
  {
    name: 'genesis_wonder',
    description: '开一座奇观（一次只能建一座，建完才能开下一座；奇观线独立于普通施工）。id：sky_ring 天穹环 / under_ice_eye 冰下之眼（旅游），silicon_valley 硅谷 / orbital_mirror 轨道镜阵（技术）。',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        id: { type: 'string', enum: ['sky_ring', 'under_ice_eye', 'silicon_valley', 'orbital_mirror', 's2_engine'], description: '奇观 id。' },
      },
      required: ['id'],
    },
    tags: ['write'],
  },
  {
    name: 'genesis_tools',
    description:
      '工具总表：全部 40 个工具各一行——做什么、关键参数、一句提醒。' +
      '不带 query 给整张表；带 query 就只挑和它有关的几行（工具名、中文名、关键词都行）。' +
      '忘了哪个工具叫什么、参数怎么填的时候查它。',
    tags: ['read'],
    parameters: TOOLS_PARAMETERS,
  },
  {
    name: 'genesis_territory',
    description:
      '给一种初级消费者划一块领地（默认半径 3 km，上限 10）：它们会在领地内巡逻、赶走别的种类，但走得更快也更饿。' +
      '同种在这颗行星上只有一块，再划就覆盖。次级消费者（含猫科）不能划领地——它们会把猎物赶光。' +
      '不传经纬度就用你脚下。',
    tags: ['write'],
    parameters: TERRITORY_PARAMETERS,
  },
];

export interface GenesisWorldOptions {
  cfg: GenesisConfigSection;
  timezone: string;
  dataDir: string;
  /** 便于测试注入固定时钟；默认 Date.now。 */
  now?: () => number;
}

/** 1 倍速下「一个母星时 = 多少现实分钟」，滑杆拖动时用它换算。 */
function msPerPlanetHourBase(game: GameState): number {
  return game.msPerPlanetHour / 60_000;
}

export class GenesisWorld implements World {
  readonly id = 'genesis';

  private host: WorldHost | null = null;
  private system: StarSystem | null = null;
  private game: GameState | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  /** 读档失败的原因；面板据此区分「没创世」与「存档坏了」。 */
  private loadError: string | null = null;
  /** 面板点击期间为 true：事件只攒不推，窗口结束再合并成一条。 */
  private quiet = false;
  private merged: Array<{ type: string; texts: string[] }> = [];
  private lastMergedPushMs = 0;

  private readonly store: GenesisStore;
  private readonly games: GameStore;
  private readonly profiles: ProfileStore;
  private readonly now: () => number;

  constructor(private readonly opts: GenesisWorldOptions) {
    this.store = new GenesisStore({ dataDir: opts.dataDir });
    this.games = new GameStore({ dataDir: opts.dataDir });
    this.profiles = new ProfileStore({ dataDir: opts.dataDir });
    this.now = opts.now ?? Date.now;
  }

  envPromptVars(): Record<string, string> {
    const system = this.system;
    const game = this.game;
    if (!system) {
      return {
        'genesis.summary': '还没有创世。可以调 genesis_menu 看可选范围，再决定要不要 genesis_create。',
        'genesis.planets': '（还没有行星）',
        'genesis.now': '还没创世，时间还没开始。',
      };
    }
    const monitored = game?.monitors ?? [];
    const known = system.planets
      .map((p, index) => ({ p, key: `p${index + 1}` }))
      .filter(({ key }) => monitored.includes(key))
      .map(({ p, key }) => `${displayName(game!, key)}：${KIND_LABEL[p.kind]}，${p.aAU.toFixed(2)} AU，${CLIMATE_LABEL[p.climate]}${p.habitable ? '，宜居' : ''}`)
      .join('\n');
    const now = game ? `${this.timeLine(game)}\n${this.energyLine(game)}` : '（这个存档还没有时间轴）';
    return {
      'genesis.summary': `已创世 #${system.specHash}：${system.star.spectralClass} 型恒星，${system.planets.length} 颗行星。`,
      'genesis.planets': known || '（还没装【环境监测器】，看不到行星的详细属性）',
      'genesis.now': now,
    };
  }

  tools(): ToolDef[] {
    return [
      this.menuTool(),
      this.createTool(),
      this.cardTool(),
      this.terrainTool(),
      this.timeTool(),
      this.stargazeTool(),
      this.moveTool(),
      this.nameTool(),
      this.sunTool(),
      this.transitTool(),
      this.shopTool(),
      this.buyTool(),
      this.surveyTool(),
      this.siteTool(),
      this.plantTool(),
      this.floraTool(),
      this.harvestTool(),
      this.burnTool(),
      this.installTool(),
      this.storeTool(),
      this.recipesTool(),
      this.lookTool(),
      this.waitTool(),
      this.upgradeTool(),
      this.guideTool(),
      this.protocolTool(),
      this.ordersTool(),
      this.mutateTool(),
      this.wakeTool(),
      this.veinsTool(),
      this.routeTool(),
      this.linkTool(),
      this.dutyTool(),
      this.resetTool(),
      this.infoTool(),
    this.wonderTool(),
    this.speedTool(),
      this.transplantTool(),
      this.removeTool(),
      this.breedTool(),
      this.algaeTool(),
      this.inspectTool(),
      this.toolsTool(),
      this.territoryTool(),
    ];
  }

  private breedTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[36]!,
      handler: async (args) => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        await this.sync();
        const system = await this.readSystem();
        if (!system || !this.game) return { text: '还没有创世。先 genesis_create。', failed: true };
        try {
          const partner = typeof args.partner === 'string' ? args.partner : undefined;
          const site = typeof args.site === 'string' ? args.site : undefined;
          const found = this.findPlant(this.game, args.plant, site);
          const mode = args.mode === 'cross' ? 'cross' : 'self';
          const result = breedAt(this.game, found.siteKey, found.plant.id, mode, partner);
          this.game = result.state;
          await this.saveGame();
          return { text: result.text };
        } catch (error) {
          return { text: error instanceof Error ? error.message : String(error), failed: true };
        }
      },
    };
  }

  private algaeTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[37]!,
      handler: async (args) => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        await this.sync();
        const system = await this.readSystem();
        if (!system || !this.game) return { text: '还没有创世。先 genesis_create。', failed: true };
        try {
          const colonySite = typeof args.colonySite === 'string' ? args.colonySite : undefined;
          const found = this.findPlant(this.game, args.colony, colonySite);
          const target = this.resolveSite(this.game, args.site);
          const result = applyAlgae(system, this.game, target, found.siteKey, found.plant.id);
          this.game = result.state;
          await this.saveGame();
          return { text: result.text };
        } catch (error) {
          return { text: error instanceof Error ? error.message : String(error), failed: true };
        }
      },
    };
  }

  private inspectTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[38]!,
      handler: async (args) => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        await this.sync();
        const system = await this.readSystem();
        if (!system || !this.game) return { text: '还没有创世。先 genesis_create。', failed: true };
        try {
          const site = typeof args.site === 'string' ? args.site : undefined;
          const found = this.findPlant(this.game, args.plant, site);
          const { climate, label } = this.climateForPlant(this.game, system, found.siteKey);
          return { text: inspectPlantText(found.plant, climate, label) };
        } catch (error) {
          return { text: error instanceof Error ? error.message : String(error), failed: true };
        }
      },
    };
  }

  webUi(): WorldWebUiDecl {
    return {
      label: '栖星 · 创世记',
      config: [GENESIS_CONFIG_GROUP],
      badges: [
        {
          label: '行星',
          value: this.system ? String(this.system.planets.length) : '未创世',
          tone: this.system ? 'on' : 'plain',
        },
      ],
      panels: [
        {
          id: 'overview',
          title: '概况',
          description: '一屏看清你在哪、还剩多少、下一步该干什么。只读；动作都在各自页签里做。',
          getMethods: ['state'],
        },
        {
          id: 'surface',
          title: '地表',
          description: '地图、看附近、走一段、等一会、探矿脉、测绘、观星。跨星航行在「工业」页签。',
          getMethods: ['state', 'map', 'look', 'move', 'wait', 'terrain', 'veins', 'survey', 'stargaze'],
        },
        {
          id: 'farm',
          title: '农场',
          description: '站点、作物、种子、温室、种植盆、围栏与喂食槽。建站要先走到有地的地方。',
          getMethods: ['state', 'site', 'plant', 'harvest', 'inspect', 'breed', 'transplant', 'remove', 'fertilize', 'install', 'store', 'flora'],
        },
        {
          id: 'industry',
          title: '工业',
          description: '电与设备、已建建筑、建造、跨星航行、奇观。',
          getMethods: ['state', 'press', 'monitor', 'install', 'move', 'wonder', 'store', 'storeDo', 'upgrade', 'build'],
        },
        {
          id: 'life',
          title: '生命与人事',
          description: '人口、居所、协议还差几条、叫醒与变种。',
          getMethods: ['state', 'wake', 'mutate'],
        },
        {
          id: 'save',
          title: '存档',
          description: '新建一局（创世）、导入、导出、删除。放在最后，平时用不到。',
          getMethods: ['state', 'create', 'preview', 'export', 'import', 'reset'],
        },
        {
          id: 'upgrade',
          title: '升级',
          description: '船身上的东西。迫降时烧坏的机动核心在这里修——修好之前，海面和气态行星的大气都去不了。',
          getMethods: ['state', 'repair'],
        },
        {
          id: 'protocol',
          title: '协议',
          description: '叫醒船上的人要做的事，分三章：活下来、住得下、叫醒他们。全部完成之后，这里的按钮就能把休眠舱打开。',
          getMethods: ['state', 'wake'],
        },
        {
          id: 'shop',
          title: '商店',
          description: '买卖都在这儿：卖货、买种子/钢瓶/星图/钨/能量块/复合肥、交基因订单。商人只在营业时间来，关张时按钮是灰的。',
          getMethods: ['state', 'buy', 'sell', 'order'],
        },
        {
          id: 'guide',
          title: '手册',
          description: '和 genesis_guide 同一份教程，翻着看比叫模型念一遍省事。正文在 src/guide/*.md，改文案不用碰代码。',
          getMethods: ['topics', 'read', 'search', 'tools'],
        },
      ],
      invoke: async (panel, method, args) => this.invoke(panel, method, args),
      promptDocs: [
        {
          key: 'worlds.genesis.envPrompt',
          title: '创世 · 环境提示词',
          description: '告诉模型这颗星球是什么、创世只能来一次、时间怎么走、它不该自己编行星。',
          path: ENV_PROMPT_FILE,
          role: 'envPrompt',
          vars: [
            { name: 'genesis.summary', description: '一句话：创没创世、什么恒星、几颗行星、几颗宜居。' },
            { name: 'genesis.planets', description: '每颗行星一行：名字、类型、轨道、气候、是否宜居。' },
            { name: 'genesis.now', description: '现在的时间、所在地、有没有在移动。' },
          ],
        },
      ],
    };
  }

  async start(host: WorldHost): Promise<void> {
    this.host = host;
    this.loadError = null;
    try {
      const save = await this.store.read();
      this.system = save?.system ?? null;
      this.game = this.system ? await this.games.read(this.system) : null;
    } catch (error) {
      // 不要静默吞掉：面板上要能看出「是没创世，还是存档坏了」。
      this.loadError = error instanceof Error ? error.message : String(error);
      this.system = null;
      this.game = null;
    }
    this.schedule();
  }

  async stop(): Promise<void> {
    this.host = null;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  // —— 时间轴 ——

  /** 每次进工具都先把时间推到「现在」：到点就结算并推【已到达】。 */
  private async sync(): Promise<void> {
    const system = this.system;
    const game = this.game;
    if (!system || !game) return;
    const result = tick(system, game, this.now());
    const changed =
      result.state !== game &&
      (result.state.lastFloraHomeHours !== game.lastFloraHomeHours ||
        result.state.energyKj !== game.energyKj ||
        result.state.transit !== game.transit ||
        result.state.builds !== game.builds ||
        result.state.structures !== game.structures);
    if (changed) {
      this.game = result.state;
      await this.saveGame();
    }
    for (const event of result.events) await this.push(event.type, event.text);
    if (!this.quiet) await this.flushMerged();
    this.schedule();
  }

  /** 到点由定时器推事件；模型空闲时这条 internal 事件会把它的下一轮唤醒。 */
  private schedule(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    const transit = this.game?.transit;
    if (!transit || !this.host) return;
    const delay = Math.max(0, transit.arriveRealMs - this.now());
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.sync();
    }, Math.min(delay, 2_147_000_000));
    this.timer.unref?.();
  }

  private async saveGame(): Promise<void> {
    if (this.game) await this.games.write(this.game);
  }

  private timeLine(game: GameState): string {
    const name = game.calendar.homePlanetName;
    const where = game.location ? `你在 ${describeLocation(game, game.location)}` : '你还没有落地';
    const transit = game.transit;
    if (!transit) return `${timeText(game, this.now())}。${where}，没有在移动。`;
    const leftMs = Math.max(0, transit.arriveRealMs - this.now());
    const leftHours = leftMs / game.msPerPlanetHour;
    return `${timeText(game, this.now())}。${where}，正在移动到 ${describeLocation(game, transit.to)}，` +
      `还剩 ${leftHours.toFixed(2)} ${name}时（现实 ${(leftMs / REAL_MS_PER_HOUR).toFixed(2)} 小时）。`;
  }

  private async readyState(): Promise<{ system: StarSystem; game: GameState } | { error: string }> {
    await this.sync();
    const system = this.system;
    if (!system) return { error: '还没有创世。先看 genesis_menu，再决定要不要 genesis_create。' };
    const game = this.game;
    if (!game) return { error: '这个存档是旧版本（还没有时间轴），请 genesis_reset 之后重新创世。' };
    return { system, game };
  }

  private transitHead(game: GameState): string {
    const transit = game.transit!;
    const leftMs = Math.max(0, transit.arriveRealMs - this.now());
    const leftHours = leftMs / game.msPerPlanetHour;
    return `你在移动途中，还剩约 ${leftHours.toFixed(2)} ${game.calendar.homePlanetName}时` +
      `（现实 ${(leftMs / REAL_MS_PER_HOUR).toFixed(2)} 小时）。`;
  }

  private transitNote(game: GameState): string | null {
    if (!game.transit) return null;
    return `${this.transitHead(game)}移动期间看不到环境，到了会自动收到【已到达】。`;
  }

  /** 移动途中看环境时，回出发地那一片——「你离开的地方长这样」。 */
  private departureEnvironment(system: StarSystem, game: GameState): string {
    const from = game.transit!.from;
    let body: TerrainBody;
    try {
      body = this.resolveBody(system, bodyKeyOf(from), game);
    } catch {
      return '出发地的地形读不出来（存档里的坐标对不上）。';
    }
    const radiusKm = this.opts.cfg.viewBaseKm * planetVisibility(body.atmosphere);
    const patch = terrainPatchText(terrainPatch(body, from.latDeg, from.lonDeg, radiusKm));
    return `出发地环境——${describeLocation(game, from)}：\n\n${patch}`;
  }

  private visibilityOf(system: StarSystem, loc: Location): number {
    const planet = system.planets[loc.planetIndex - 1];
    if (!planet) return 0;
    return loc.moonIndex ? 1 : planetVisibility(planet.atmosphere);
  }

  // —— 面板 ——

  private async invoke(panel: string, method: string, args: unknown[]): Promise<unknown> {
    // 面板上的每一次点击都不是「世界出了事」：时间照推、存档照写，但事件先压着，
    // 由 flushPanelEvents() 按母星时合并成一条，免得人类连点发电机把模型叫醒十次。
    const outerQuiet = this.quiet;
    this.quiet = true;
    try {
      return await this.invokePanel(panel, method, args);
    } finally {
      this.quiet = outerQuiet;
      if (!outerQuiet) await this.flushMerged();
    }
  }

  private async invokePanel(panel: string, method: string, args: unknown[]): Promise<unknown> {
    if (panel === 'upgrade') {
      switch (method) {
        case 'state':
          return this.upgradeState();
        case 'repair':
          return this.repairFromPanel(typeof args[0] === 'string' ? args[0] : 'mobility_core');
        default:
          throw new Error(`「升级」面板没有方法：${method}`);
      }
    }
    if (panel === 'protocol') {
      switch (method) {
        case 'state':
          return this.protocolPanelState();
        case 'wake':
          return this.wakeFromPanel(args[0]);
        case 'recreate':
          return this.recreateFromPanel(args[0], args[1]);
        default:
          throw new Error(`「协议」面板没有方法：${method}`);
      }
    }
    if (panel === 'shop') {
      return this.shopAction(method, args);
    }
    if (method === 'speed') {
      return this.speedFromPanel(args[0]);
    }
    // 顶栏要的整份状态：升级/协议/商店/手册四个页签的载荷不是 state，靠这个补顶栏。
    if (method === 'header') {
      return this.panelState();
    }
    if (panel === 'overview') {
      switch (method) {
        case 'state':
          return this.panelState();
        default:
          throw new Error(`「概况」面板没有方法：${method}`);
      }
    }
    if (panel === 'guide') {
      switch (method) {
        case 'topics':
          return { topics: guideTopics() };
        case 'read': {
          const id = typeof args[0] === 'string' ? args[0] : '';
          const picked = guideTopics().find((topic) => topic.id === id);
          if (!picked) throw new Error(`没有这篇教程：${id || '(空)'}。`);
          return { id: picked.id, title: picked.title, text: guideText(picked.id) };
        }
        case 'search': {
          const query = typeof args[0] === 'string' ? args[0] : '';
          return { text: infoText(query) };
        }
        case 'tools': {
          const query = typeof args[0] === 'string' && args[0].trim() !== '' ? args[0].trim() : undefined;
          return { text: toolsSearch(query) };
        }
        default:
          throw new Error(`「手册」面板没有方法：${method}`);
      }
    }
    if (panel !== 'save' && panel !== 'surface' && panel !== 'farm' && panel !== 'industry' && panel !== 'life') {
      throw new Error(`未知面板：${panel}`);
    }
    switch (method) {
      case 'state':
        return this.panelState();
      case 'create':
        return this.createFromPanel(args[0]);
      case 'preview':
        return this.previewShape(args[0]);
      case 'reset':
        return this.resetFromPanel(args[0]);
      case 'export':
        return this.exportFromPanel();
      case 'import':
        return this.importFromPanel(args[0]);
      case 'map':
        return this.surfaceMap(args[0]);
      case 'press':
        return this.pressFromPanel();
      case 'monitor':
        return this.monitorFromPanel(args[0]);
      case 'sell':
        return this.floraAction('sell', args);
      case 'site':
        return this.floraAction('site', args);
      case 'plant':
        return this.floraAction('plant', args);
      case 'harvest':
        return this.floraAction('harvest', args);
      case 'transplant':
        return this.floraAction('transplant', args);
      case 'remove':
        return this.floraAction('remove', args);
      case 'breed':
        return this.floraAction('breed', args);
      case 'algae':
        return this.floraAction('algae', args);
      case 'inspect':
        return this.floraAction('inspect', args);
      case 'burn':
        return this.floraAction('burn', args);
      case 'build':
        return this.floraAction('build', args);
      case 'install':
        return this.installFromPanel(args[0]);
      case 'move':
        return this.moveFromPanel(args[0]);
      case 'demolish':
        return this.demolishFromPanel(args[0]);
      case 'store':
        return this.storeFromPanel();
      case 'storeDo':
        return this.storeActionFromPanel(args);
      case 'look':
        return this.lookFromPanel();
      case 'veins':
        return this.veinsFromPanel();
      case 'wait':
        return this.waitFromPanel(args[0]);
      case 'order':
        return this.orderFromPanel(args[0]);
      case 'cylinder':
        return this.cylinderFromPanel(args[0]);
      case 'chart':
        return this.chartFromPanel();
      case 'fertilizer':
        return this.fertilizerFromPanel(args[0]);
      case 'fertilize':
        return this.fertilizeFromPanel(args[0], args[1]);
      case 'survey':
        return this.surveyFromPanel();
      case 'terrain':
        return this.terrainFromPanel(args[0], args[1], args[2]);
      case 'stargaze':
        return this.stargazeFromPanel();
      case 'mutate':
        return this.mutateFromPanel(args[0]);
      case 'wake':
        return this.wakeFromPanel(args[0]);
      default:
        throw new Error(`「${panel}」面板没有方法：${method}`);
    }
  }

  /** 面板「买复合肥」：和 genesis_buy { kind: "fertilizer" } 同一条路。 */
  private async fertilizerFromPanel(rawKg: unknown): Promise<{ text: string; state: GenesisPanelState }> {
    await this.sync();
    if (!this.game) throw new Error('还没有创世。先 genesis_create。');
    const kg = typeof rawKg === 'number' && rawKg > 0 ? rawKg : 5;
    const bought = buyFertilizer(this.game, kg, this.now());
    this.game = bought.state;
    await this.saveGame();
    return { text: bought.text, state: await this.panelState() };
  }

  /** 面板「撒肥」：把背包里的复合肥撒到脚下这座站点。 */
  private async fertilizeFromPanel(rawKg: unknown, rawSite: unknown): Promise<{ text: string; state: GenesisPanelState }> {
    await this.sync();
    const system = await this.readSystem();
    if (!system || !this.game) throw new Error('还没有创世。');
    const siteKey = this.resolveSite(this.game, rawSite);
    const kg = typeof rawKg === 'number' && rawKg > 0 ? rawKg : 1;
    const put = applyFertilizer(system, this.game, siteKey, kg);
    this.game = put.state;
    await this.saveGame();
    return { text: put.text, state: await this.panelState() };
  }

  /** 面板「装/建」：走同一条 genesis_install，人类和模型用一套规则。 */
  private async installFromPanel(input: unknown): Promise<{ text: string; state: GenesisPanelState }> {
    await this.sync();
    // 面板传什么就原样交给工具：以前只转 id / serves，温室滑杆的 tempC、
    // 机械臂的 inputs、值班终端的 habitat 全被扔掉，于是「拖了滑杆又变回自动」。
    const args = { ...((input && typeof input === 'object' ? input : {}) as Record<string, unknown>) };
    if (typeof args.tempC === 'string') {
      const value = Number(args.tempC);
      if (Number.isFinite(value)) args.tempC = value;
      else delete args.tempC;
    }
    const tool = this.installTool();
    const result = await tool.handler(args, {} as never);
    const text = typeof result === 'string' ? result : result.text;
    if (typeof result !== 'string' && result.failed) throw new Error(text);
    return { text, state: await this.panelState() };
  }

  /** 在看附近的文字后面追一行「附近动物」（3.0.0）。 */
  private withWildlife(system: StarSystem, text: string): string {
    if (!this.game || !this.game.location) return text;
    const loc = this.game.location;
    const found = animalsNear(system, this.game, loc.planetIndex, loc.latDeg, loc.lonDeg, 300);
    const total = (this.game.animals ?? []).filter((animal) => animal.planetIndex === loc.planetIndex).length;
    if (total === 0) return text;
    const tally = new Map<string, number>();
    for (const entry of found) tally.set(entry.species.name, (tally.get(entry.species.name) ?? 0) + 1);
    const list = [...tally.entries()].map(([name, count]) => name + '×' + count).join('、');
    const nearest = found[0];
    const tail = nearest
      ? '，最近的' + nearest.species.name + '在' + Math.round(nearest.km) + ' km'
      : '';
    return text + '\n附近动物：这颗行星上共' + total + '只' + (list ? '（300 km 内 ' + list + tail + '）' : '') + '。';
  }

  /** 面板「看附近」：与 genesis_look 同一段文字，人类点一下就能读。 */
  private async lookFromPanel(): Promise<{ text: string }> {
    await this.sync();
    const system = await this.readSystem();
    if (!system || !this.game) throw new Error('还没有创世。');
    try {
      return { text: this.withWildlife(system, lookAround(system, this.game, this.now()).text) };
    } catch (error) {
      return { text: errorText(error) };
    }
  }

  /** 面板「扫矿」：与 genesis_veins 同一段文字。 */
  private async veinsFromPanel(): Promise<{ text: string }> {
    await this.sync();
    const system = await this.readSystem();
    if (!system || !this.game) throw new Error('还没有创世。');
    try {
      const scanned = spectrometerScan(system, this.game, this.now());
      this.game = scanned.state;
      await this.saveGame();
      return { text: scanned.text };
    } catch (error) {
      return { text: errorText(error) };
    }
  }

  /** 面板「等一会儿」：天亮/天黑/作物熟/完工，推时钟并返回发生了什么。 */
  private async waitFromPanel(input: unknown): Promise<{ text: string; state: GenesisPanelState }> {
    await this.sync();
    const system = await this.readSystem();
    if (!system || !this.game) throw new Error('还没有创世。');
    const until = typeof input === 'string' ? input : String((input as { until?: unknown } | null)?.until ?? 'dawn');
    const waited = waitFor(system, this.game, this.now(), { until: until as never });
    this.game = waited.state;
    await this.saveGame();
    if (waited.events.length > 0) for (const event of waited.events) await this.push(event.type, event.text);
    return { text: waited.reason, state: await this.panelState() };
  }


  /** 「商店」页签：开没开张、货架、收购价、订单。 */
  private shopPayload(): GenesisShopPanel {
    const game = this.game!;
    const level = game.upgrades.telescope;
    const now = this.now();
    const hours = nowPlanetHours(game, now);
    const open = shopOpen(hours, level);
    const day = dayIndexOf(hours);
    const soldToday = (id: string): number => (game.daily.day === day ? (game.daily.sold['sell:' + id] ?? 0) : 0);
    const boughtToday = (key: string): number => (game.daily.day === day ? (game.daily.bought[key] ?? 0) : 0);
    const heldOf = (id: string): number => {
      let sum = game.inventory[id] ?? 0;
      for (const store of Object.values(game.siteStores)) sum += store[id] ?? 0;
      for (const container of Object.values(game.stores)) sum += container[id] ?? 0;
      return round3(sum);
    };
    const sellables: GenesisShopRow[] = sellPriceTable(day, level).map((row) => {
      const left = Number.isFinite(row.limit) ? Math.max(0, Math.floor(row.limit - soldToday(row.id))) : Number.POSITIVE_INFINITY;
      return {
        id: row.id,
        name: row.name,
        priceLabel: row.price.toLocaleString('en-US') + ' 信用点/' + row.unit,
        limitLabel: Number.isFinite(left) ? '今天还能卖 ' + left + ' ' + row.unit : '不限量',
        held: heldOf(row.id),
      };
    });
    const premium = BUY_GOODS.find((good) => good.id === 'premium_seed')!;
    const premiumLeft = Math.max(0, buyDailyLimitFor(premium, level) - boughtToday('buy:premium_seed'));
    const buyables: GenesisShopRow[] = [
      {
        id: 'random_seed',
        name: '随机基因种子（5 粒）· 今日货：' + SPECIES[dailyShopSpecies(game, this.now())].name,
        priceLabel: randomSeedPriceKj(game.seedsPurchased).toLocaleString('en-US') + ' kJ',
        limitLabel: '不限量',
        species: dailyShopSpecies(game, this.now()),
        note: '每买一袋，下一袋贵 200 kJ。今天的货明天会换。',
      },
      {
        id: 'premium_seed',
        name: '高级种子（耐寒·高产，5 粒）· 今日货：' + SPECIES[dailyShopSpecies(game, this.now())].name,
        species: dailyShopSpecies(game, this.now()),
        priceLabel: PREMIUM_SEED_PRICE_CREDITS.toLocaleString('en-US') + ' 信用点',
        limitLabel: '今天还能买 ' + premiumLeft + ' 袋',
        note: '要余额 500 信用点。',
      },
      {
        id: 'fertilizer',
        name: '复合肥（按公斤）',
        priceLabel: fertilizerPriceKj(game.fertilizerBought ?? 0).toLocaleString('en-US') + ' kJ/kg',
        limitLabel: '今天还能买 ' + Math.max(0, 30 - boughtToday('buy:fertilizer')) + ' kg',
        note: '每买一公斤，下一公斤贵 250 kJ。',
      },
      {
        id: 'broadcast_tourism',
        name: '星际广播 · 旅游星系',
        priceLabel: CHARTER_TOURISM_CREDITS.toLocaleString('en-US') + ' 信用点',
        limitLabel: game.charter ? (game.charter === 'tourism' ? '已选择旅游星系' : '已售罄（选了技术星系）') : '一局只能买一张',
        note: '买了才能造观光塔台与访客驿站；技术星系的广播会永久锁死。',
      },
      {
        id: 'broadcast_tech',
        name: '星际广播 · 技术星系',
        priceLabel: CHARTER_TECH_KJ.toLocaleString('en-US') + ' kJ',
        limitLabel: game.charter ? (game.charter === 'tech' ? '已选择技术星系' : '已售罄（选了旅游星系）') : '一局只能买一张',
        note: '买了才能造招募站、员工公寓与晶圆厂；旅游星系的广播会永久锁死。',
      },
      {
        id: 'cylinder',
        name: '高强度钢瓶',
        priceLabel: CYLINDER_COST_CREDITS.toLocaleString('en-US') + ' 信用点/个',
        limitLabel: '不限量',
        note: '装液氨、氧气用；用完返九成。',
      },
      {
        id: 'chart',
        name: '星图（一颗天体）',
        priceLabel: CHART_PRICE_CREDITS.toLocaleString('en-US') + ' 信用点',
        limitLabel: '今天还能买 ' + Math.max(0, 1 - boughtToday('buy:chart')) + ' 张',
        note: '拿到就不用等观星窗口。',
      },
      {
        id: 'tungsten',
        name: '钨（1 份 = 1 kg）',
        priceLabel: TUNGSTEN_PRICE_CREDITS.toLocaleString('en-US') + ' 信用点/份',
        limitLabel: '不限量',
      },
      {
        id: 'energy',
        name: '能量块（' + ENERGY_BLOCK_KJ.toLocaleString('en-US') + ' kJ）',
        priceLabel: ENERGY_BLOCK_CREDITS.toLocaleString('en-US') + ' 信用点',
        limitLabel: '不限量',
      },
    ];
    const orders: GenesisShopOrder[] = currentOrders(game, now).map((order) => ({
      id: order.id,
      label: orderText(order, SPECIES[order.species].name),
      note: '交货用「交货」按钮。',
    }));
    return {
      open,
      window: shopWindowText(hours, level),
      nextOpenHours: open ? 0 : Math.round(((12 - hours + 24) % 24) * 10) / 10,
      level,
      credits: game.credits,
      energyKj: game.energyKj,
      capacityKj: batteryCapacityKj(game.upgrades.battery),
      tungsten: game.tungsten,
      buyables,
      sellables,
      orders,
      closedNote: open ? undefined : '商人不在：按钮先灰着，等开张了再点。',
    };
  }

  /** 「商店」页签的方法：state / buy / sell / order。 */
  private async shopAction(method: string, args: unknown[]): Promise<unknown> {
    await this.sync();
    if (!this.game) throw new Error('还没有创世。');
    if (method === 'state') return this.shopPayload();
    const input = (args[0] ?? {}) as Record<string, unknown>;
    const now = this.now();
    if (method === 'order') {
      const delivered = deliverOrder(this.game, String(input.id ?? ''), now);
      this.game = delivered.state;
      await this.saveGame();
      return { text: delivered.text, state: this.shopPayload() };
    }
    if (method === 'sell') {
      const sold = sellToMerchant(this.game, String(input.id ?? '') as never, Number(input.amount ?? 1), now);
      this.game = sold.state;
      await this.saveGame();
      return { text: sold.text, state: this.shopPayload() };
    }
    if (method === 'buy') {
      const kind = String(input.kind ?? '');
      if (kind === 'random_seed' || kind === 'premium_seed') {
        const species = String(
          input.species ?? dailyShopSpecies(this.game!, now),
        ) as SpeciesId;
        if (!SPECIES[species]) throw new Error('没有这种植物：' + species + '。');
        const bought = buySeeds(this.game, kind === 'random_seed' ? 'random' : 'premium', species, now);
        this.game = bought.state;
        await this.saveGame();
        return { text: bought.text, state: this.shopPayload() };
      }
      if (kind === 'fertilizer') {
        const kg = typeof input.kg === 'number' && input.kg > 0 ? input.kg : 5;
        const bought = buyFertilizer(this.game, kg, now);
        this.game = bought.state;
        await this.saveGame();
        return { text: bought.text, state: this.shopPayload() };
      }
      if (kind === 'cylinder') {
        const count = Math.max(1, Math.floor(Number(input.count ?? 1)));
        const bought = buyCylinders(this.game, count, now);
        this.game = bought.state;
        await this.saveGame();
        return { text: bought.text, state: this.shopPayload() };
      }
      if (kind === 'chart') {
        const system = await this.readSystem();
        if (!system) throw new Error('还没有创世。');
        const bought = buyChart(system, this.game, now);
        this.game = bought.state;
        await this.saveGame();
        return { text: bought.text, state: this.shopPayload() };
      }
      if (kind === 'broadcast_tourism' || kind === 'broadcast_tech') {
        const bought = buyCharter(this.game, kind === 'broadcast_tourism' ? 'tourism' : 'tech', now);
        this.game = bought.state;
        await this.saveGame();
        return { text: bought.text, state: this.shopPayload() };
      }
      if (kind === 'tungsten' || kind === 'energy') {
        const bought = buyMerchandise(this.game, kind, now);
        this.game = bought.state;
        await this.saveGame();
        return { text: bought.text, state: this.shopPayload() };
      }
      throw new Error('商店里没有这种东西：' + (kind || '(空)') + '。');
    }
    throw new Error('「商店」面板没有方法：' + method);
  }

  /** 面板「交货」：把一张订单交掉，然后刷新面板。 */
  private async orderFromPanel(input: unknown): Promise<{ text: string; state: GenesisPanelState }> {
    await this.sync();
    if (!this.game) throw new Error('还没有创世。');
    const orderId = typeof input === 'string' ? input : String((input as { id?: unknown } | null)?.id ?? '');
    const delivered = deliverOrder(this.game, orderId, this.now());
    this.game = delivered.state;
    await this.saveGame();
    return { text: delivered.text, state: await this.panelState() };
  }

  /** 面板「买钢瓶」：花信用点买几个高强度钢瓶。 */
  private async cylinderFromPanel(input: unknown): Promise<{ text: string; state: GenesisPanelState }> {
    await this.sync();
    if (!this.game) throw new Error('还没有创世。');
    const count = Math.max(1, Math.floor(Number(input) || 1));
    const bought = buyCylinders(this.game, count, this.now());
    this.game = bought.state;
    await this.saveGame();
    return { text: bought.text, state: await this.panelState() };
  }

  /** 面板「买星图」：商人在的时候那张纸。 */
  private async chartFromPanel(): Promise<{ text: string; state: GenesisPanelState }> {
    await this.sync();
    const system = await this.readSystem();
    if (!system || !this.game) throw new Error('还没有创世。');
    const bought = buyChart(system, this.game, this.now());
    this.game = bought.state;
    await this.saveGame();
    return { text: bought.text, state: await this.panelState() };
  }

  /** 面板「测地形」：和 genesis_terrain 同一条路，参数缺省就用脚下。 */
  private async terrainFromPanel(rawPlanet: unknown, rawLat: unknown, rawLon: unknown): Promise<{ text: string }> {
    await this.sync();
    const system = await this.readSystem();
    if (!system || !this.game) throw new Error('还没有创世。');
    const args: Record<string, unknown> = {};
    if (typeof rawPlanet === 'number') args.planetIndex = rawPlanet;
    if (typeof rawLat === 'number') args.lat = rawLat;
    if (typeof rawLon === 'number') args.lon = rawLon;
    const handler = this.tools().find((tool) => tool.name === 'genesis_terrain')!.handler;
    const outcome = await handler(args, {} as never);
    return { text: typeof outcome === 'string' ? outcome : outcome.text };
  }

  /** 面板「观星」：和 genesis_stargaze 同一条路。 */
  private async stargazeFromPanel(): Promise<{ text: string }> {
    await this.sync();
    if (!this.game) throw new Error('还没有创世。');
    const handler = this.tools().find((tool) => tool.name === 'genesis_stargaze')!.handler;
    const outcome = await handler({}, {} as never);
    return { text: typeof outcome === 'string' ? outcome : outcome.text };
  }

  /** 面板「测绘一圈」：和 genesis_survey 同一条规则（每行星每群系只认第一次）。 */
  private async surveyFromPanel(): Promise<{ text: string; state: GenesisPanelState }> {
    await this.sync();
    const system = await this.readSystem();
    if (!system || !this.game) throw new Error('还没有创世。');
    if (this.game.transit) throw new Error(`${this.transitHead(this.game)}移动期间看不到环境，到了会自动收到【已到达】。`);
    const siteKey = this.resolveSite(this.game, undefined);
    const result = surveySite(system, this.game, siteKey, this.now());
    this.game = result.state;
    await this.saveGame();
    return { text: `${result.text}\n${this.inventoryLine(result.state)}`, state: await this.panelState() };
  }

  /** 面板「诱变」：把一袋种子送进诱变室。 */
  private async mutateFromPanel(input: unknown): Promise<{ text: string; state: GenesisPanelState }> {
    await this.sync();
    if (!this.game) throw new Error('还没有创世。');
    const bagId = typeof input === 'string' ? input : String((input as { bag?: unknown } | null)?.bag ?? '');
    const mutated = mutateBag(this.game, bagId, this.now());
    this.game = mutated.state;
    await this.saveGame();
    return { text: mutated.text, state: await this.panelState() };
  }

  /** 面板「叫醒人类」：协议全绿之后的那一下。 */
  private async wakeFromPanel(input: unknown): Promise<{ text: string; state: GenesisPanelState }> {
    await this.sync();
    if (!this.game) throw new Error('还没有创世。');
    const system = await this.readSystem();
    if (!system) throw new Error('还没有创世。');
    const habitatId = typeof input === 'string' && input !== '' ? input : undefined;
    const woke = wakeHumans(system, this.game, habitatId, this.now());
    this.game = woke.state;
    await this.saveGame();
    return { text: woke.text, state: await this.panelState() };
  }


  /** 面板【再创世】：带着档案去下一张地图。旧地图归档后作废。 */
  private async recreateFromPanel(rawSeed: unknown, rawMass: unknown): Promise<{ text: string }> {
    await this.sync();
    const system = await this.readSystem();
    if (!system || !this.game) throw new Error('还没有创世。');
    const game = this.game;
    const blockers = recreateBlockers(game);
    if (blockers.length > 0) throw new Error(blockers.join('\n'));

    const seed = normalizeSeedValue(rawSeed);
    const raw = typeof rawMass === 'number' ? rawMass : Number(rawMass);
    const starMass = Math.min(
      GENESIS_LIMITS.starMass.max,
      Math.max(GENESIS_LIMITS.starMass.min, Number.isFinite(raw) ? Math.round(raw * 100) / 100 : GENESIS_DEFAULTS.starMass),
    );
    const spec: GenesisSpec = { seed, starMass, ...deriveGenesisShape(seed) };
    const next = createSystem(spec);
    const refusal = landingRefusal(next);
    if (refusal) throw new Error(refusal);

    const after = consumeRecreate(game);
    const runs = ((await this.profiles.read())?.runs ?? 1) + 1;
    const previousStar = game.names.star;
    const profile = exportProfile(after, { runs, lastStar: previousStar, nowMs: this.now() });
    const { starName, homeName } = autoNames(seed, runs);

    await this.store.archiveRun(runs - 1, this.games.file);
    const created = await this.store.createOnce(spec);
    const fresh = startGame(
      created.system,
      {
        seed,
        starName,
        homeName,
        carry: {
          credits: after.credits,
          tungsten: after.tungsten,
          energyKj: after.energyKj,
          inventory: after.inventory,
          upgrades: after.upgrades,
          seedBags: after.seedBags,
          people: profile.people,
          samples: after.samples,
        },
      },
      this.now(),
    );
    this.system = created.system;
    this.game = fresh;
    await this.saveGame();
    await this.profiles.write(profile);
    await this.push(
      'genesis.recreated',
      `点火。『${previousStar}』留在身后，旧地图已归档；这一船 ${profile.people} 个人重新回到休眠舱，飞向『${starName}』。`,
    );
    return {
      text: `再创世完成：点火、离轨，飞向『${starName}』，落脚点叫『${homeName}』。旧地图『${previousStar}』已归档作废。带了 ${profile.people} 个人、${Math.round(profile.energyKj).toLocaleString('en-US')} kJ、${profile.tungsten} 份钨过来——先 genesis_look 看看脚下。`,
    };
  }

  /** 面板「去某处」：按经纬度发起地表移动，返回移动中的状态。 */
  private async moveFromPanel(input: unknown): Promise<GenesisPanelState> {
    await this.sync();
    const system = await this.readSystem();
    if (!system || !this.game) throw new Error('还没有创世。');
    const args = (input ?? {}) as { latDeg?: unknown; lonDeg?: unknown; target?: unknown };
    if (typeof args.target === 'string' && args.target) {
      const target = this.resolveBodyKey(system, this.game, args.target);
      const result = beginInterstellar(system, this.game, target, this.now());
      this.game = result.state;
      await this.saveGame();
      await this.push(result.event.type, result.event.text);
      return this.panelState();
    }
    const lat = Number(args.latDeg);
    const lon = Number(args.lonDeg);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('要给出纬度和经度（数字）。');
    const result = beginSurfaceMove(system, this.game, Math.max(-90, Math.min(90, lat)), lon, this.now());
    this.game = result.state;
    await this.saveGame();
    await this.push(result.event.type, result.event.text);
    return this.panelState();
  }

  /** 面板「拆掉」：和模型走同一条 demolishStructure 校验。 */
  private async demolishFromPanel(input: unknown): Promise<GenesisPanelState> {
    await this.sync();
    if (!this.game) throw new Error('还没有创世。');
    const id = typeof input === 'string' ? input : String((input as { id?: unknown } | null)?.id ?? '');
    if (!id) throw new Error('要给出建筑 id。');
    const text = demolishStructure(this.game, id);
    const { [id]: _removed, ...stores } = this.game.stores;
    this.game = { ...this.game, structures: this.game.structures.filter((s) => s.id !== id), stores };
    await this.saveGame();
    await this.push('genesis.demolished', text);
    return this.panelState();
  }

  /** 面板读仓库：一行摘要 + 每个容器的结构化数据，方便画按钮。 */
  private async storeFromPanel(): Promise<{ list: string; containers: Array<{ id: string; kind: string; where: string; usedKg: number; capKg: number; contents: Array<{ resource: string; name: string; kg: number }>; bags?: number }> }> {
    const state = await this.panelState();
    const game = this.game;
    if (!game) return { list: state.card ?? '还没有创世。', containers: [] };
    const containers = game.structures
      .filter((s) => storeCapacityKg(s) > 0)
      .map((s) => {
        const store = game.stores[s.id] ?? {};
        return {
          id: s.id,
          kind: s.kind,
          where: s.kind === 'rocket' ? `p${s.dockedPlanetIndex ?? s.planetIndex}` : s.siteKey,
          usedKg: Math.round(storeWeightKg(store) * 10) / 10,
          capKg: storeCapacityKg(s),
          contents: Object.entries(store).map(([resource, kg]) => ({
            resource,
            name: RESOURCE_LABELS[resource as keyof typeof RESOURCE_LABELS] ?? resource,
            kg,
          })),
          ...(s.kind === 'terminal'
            ? { bags: game.seedBags.filter((b) => b.at === s.id).length }
            : {}),
        };
      });
    return { list: this.storeList(game), containers };
  }

  /** 面板上的存/取/拆：人类点按钮走的路径，和模型工具同一套规则。 */
  private async storeActionFromPanel(args: unknown[]): Promise<{ list: string; containers: unknown[] }> {
    const action = String(args[0] ?? '');
    const building = String(args[1] ?? '');
    const resource = String(args[2] ?? '');
    const kg = Number(args[3] ?? 0);
    const synthetic: Record<string, unknown> = { action, building, resource, kg };
    const tool = this.storeTool();
    const result = await tool.handler(synthetic, {} as never);
    const text = typeof result === 'string' ? result : result.text;
    const after = await this.storeFromPanel();
    return { ...after, list: text };
  }

  private async readSystem(): Promise<StarSystem | null> {
    const save = await this.store.read();
    this.system = save?.system ?? null;
    return this.system;
  }

  /** 按 id 找一株作物（可以指定站点/种植盆）。 */
  private findPlant(
    game: GameState,
    rawId: unknown,
    rawSite?: unknown,
  ): { siteKey: string; plant: GameState['plants'][string][number] } {
    const plantId = String(rawId ?? '').trim();
    if (!plantId) throw new Error('要指定哪一株：plant 传它的 id。');
    const asked = String(rawSite ?? '').trim();
    if (asked) {
      const plant = (game.plants[asked] ?? []).find((p) => p.id === plantId);
      if (!plant) throw new Error(`${asked} 里面没有这株作物：${plantId}`);
      return { siteKey: asked, plant };
    }
    for (const [siteKey, list] of Object.entries(game.plants)) {
      const plant = list.find((p) => p.id === plantId);
      if (plant) return { siteKey, plant };
    }
    throw new Error(`找不到这株作物：${plantId}`);
  }

  /** 一株作物现在感受的气候：地里按格子算，种植盆用人工气候（通电）。 */
  private climateForPlant(
    game: GameState,
    system: StarSystem | null,
    siteKey: string,
  ): { climate: ClimateSample; label: string } {
    const site = game.sites.find((s) => s.key === siteKey);
    if (!site) {
      const planter = game.structures.find((s) => s.kind === 'planter' && siteKey === `planter:${s.id}`);
      if (!planter) throw new Error(`没有这个站点：${siteKey}`);
      const powered = structurePowered(game, planter);
      return {
        climate: powered
          ? { ...PLANTER_CLIMATE, nutrients: { ...PLANTER_SUBSTRATE } }
          : { ...PLANTER_CLIMATE, tempC: 0, wetness: 0.3, fertility: 0.3, nutrients: { ...PLANTER_SUBSTRATE } },
        label: `种植盆（${powered ? '通电' : '断电'}，人工基质）`,
      };
    }
    if (!system) throw new Error('还没有创世。');
    const planet = system.planets[site.planetIndex - 1];
    if (!planet || planet.surface.kind !== 'terrestrial') throw new Error('这里没有地表气候。');
    const climate = climateAt(
      planet.surface,
      site.latDeg,
      site.lonDeg,
      nowPlanetHours(game, this.now()),
      game.calendar.planetDaysPerYear * 24,
      planet.obliquityDeg,
    );
    const outdoor = withIceWater(site, climate);
    // 温室：作物感受到的是室内温度，不是室外——面板与详情必须与生长公式同源，
    // 否则会出现「室外 -8.4℃、详情也 -8.4℃」这种看起来建了温室没用的错觉。
    const greenhouse = game.structures.find((s) => s.kind === 'greenhouse' && s.siteKey === siteKey);
    if (greenhouse && structurePowered(game, greenhouse)) {
      const interior = greenhouseClimate(outdoor.tempC, greenhouse);
      if (interior !== null) {
        return {
          climate: {
            ...outdoor,
            tempC: interior.tempC,
            artificialDeltaC: interior.deltaC,
            realismCores: interior.realismCores,
            wetness: Math.min(PUMP_MAX_WETNESS, outdoor.wetness + 0.1),
            fertility: Math.min(1, outdoor.fertility + 0.15),
            nutrients: site.nutrients,
          },
          label: `站点 ${siteKey}（${planet.name} · 温室内 ${interior.tempC}℃）`,
        };
      }
    }
    return {
      climate: { ...outdoor, nutrients: site.nutrients },
      label: `站点 ${siteKey}（${planet.name}）`,
    };
  }

  /** 温室所在站点的室外温度；拿不到返回 null（面板滑杆只做参考）。 */
  private ambientFor(game: GameState, system: StarSystem | null, site: Site): number | null {
    if (!system) return null;
    const planet = system.planets[site.planetIndex - 1];
    if (!planet || planet.surface.kind !== 'terrestrial') return null;
    const climate = climateAt(
      planet.surface,
      site.latDeg,
      site.lonDeg,
      nowPlanetHours(game, this.now()),
      game.calendar.planetDaysPerYear * 24,
      planet.obliquityDeg,
    );
    return Math.round(climate.tempC * 10) / 10;
  }

  /** 面板用的电网摘要：有没有塔、离多远、存了多少。 */
  private gridPanel(game: GameState): {
    hasTower: boolean;
    reachable: boolean;
    storedKj: number;
    capacityKj: number;
    distanceKm: number;
    towerSite: string | null;
  } {
    const loc = game.location;
    const planetIndex = loc ? loc.planetIndex : game.homePlanetIndex;
    const tower = rectifierAt(game, planetIndex);
    const stored = Math.floor(game.grids[gridKeyFor(planetIndex)] ?? 0);
    const cap = gridCapacityFor(this.system!, game, planetIndex);
    if (!loc || !tower) {
      return { hasTower: tower !== null, reachable: false, storedKj: stored, capacityKj: cap, distanceKm: 0, towerSite: tower?.siteKey ?? null };
    }
    const site = game.sites.find((s) => s.key === tower.siteKey);
    const distance = site ? surfaceDistanceKm(site.latDeg, site.lonDeg, loc.latDeg, loc.lonDeg) : 0;
    return {
      hasTower: true,
      reachable: distance <= GRID_TAP_RANGE_KM,
      storedKj: stored,
      capacityKj: cap,
      distanceKm: Math.round(distance),
      towerSite: tower.siteKey,
    };
  }

  private async panelState(): Promise<GenesisPanelState> {
    const system = await this.readSystem();
    const game = system ? this.game : null;
    const monitored = game?.monitors ?? [];
    const planets: GenesisPlanetRow[] = system
      ? system.planets
          .filter((_, index) => monitored.includes(`p${index + 1}`))
          .map((p) => ({
            name: p.name,
            kindLabel: KIND_LABEL[p.kind],
            aAU: p.aAU,
            periodDays: p.periodDays,
            climateLabel: CLIMATE_LABEL[p.climate],
            habitable: p.habitable,
            moons: p.moons.length,
          }))
      : [];
    const bodies: GenesisBody[] = system
      ? system.planets.flatMap((p, index) => {
          const idx = index + 1;
          const list: GenesisBody[] = [];
          if (monitored.includes(`p${idx}`)) {
            list.push({ key: `p${idx}`, label: `${idx} · ${p.name}`, kind: p.surface.kind });
          }
          for (let m = 0; m < p.moons.length; m += 1) {
            if (monitored.includes(`p${idx}-m${m + 1}`)) {
              list.push({ key: `p${idx}-m${m + 1}`, label: `${idx} · ${p.moons[m]!.name}`, kind: 'moon' });
            }
          }
          // 商人卖的星图：还没监测，但已经知道它在那儿，面板要能直接点「去这里」。
          const key = `p${idx}`;
          if (!monitored.includes(key) && game && (game.charts ?? []).includes(key)) {
            list.push({
              key,
              label: displayName(game, key),
              kind: p.surface.kind === 'terrestrial' ? 'terrestrial' : 'isobaric',
              charted: true,
            });
          }
          return list;
        })
      : [];
    return {
      locked: system === null,
      loadError: this.loadError,
      card: system && game ? this.monitoredReport(system, game) : null,
      planets,
      bodies,
      limits: GENESIS_LIMITS,
      defaults: { ...GENESIS_DEFAULTS },
      game: game
        ? {
            time: timeText(game, this.now()),
            where: game.location ? describeLocation(game, game.location) : null,
            transit: game.transit
              ? `移动到 ${describeLocation(game, game.transit.to)}，还剩 ${(
                  Math.max(0, game.transit.arriveRealMs - this.now()) / game.msPerPlanetHour
                ).toFixed(2)} ${game.calendar.homePlanetName}时`
              : null,
            calendar: describeCalendar(game.calendar),
          }
        : null,
      power: game
        ? {
            energyKj: game.energyKj,
            credits: game.credits,
            tungsten: game.tungsten,
            ship: shipSupplyStatus(game),
            charter: {
              charter: game.charter ?? null,
              reputation: round1(game.reputation ?? 0),
              compute: round1(game.compute ?? 0),
              staff: game.staff ?? 0,
              staffCap: staffCapOf(game),
              visitors: game.visitorsYesterday ?? 0,
              speed: game.speed ?? DEFAULT_SPEED,
              baseMinutesPerHomeHour: msPerPlanetHourBase(game),
              minutesPerHomeHour: minutesPerHomeHour(game),
              lodgeBeds: this.lodgeBedsNow(game),
              housingBeds: this.housingBedsNow(game),
              tempBlocked: this.tempBlockedNow(game),
              docks: game.structures.filter((s) => s.kind === 'tourism_dock').length,
              lodges: game.structures.filter((s) => s.kind === 'visitor_lodge').length,
              offices: game.structures.filter((s) => s.kind === 'recruit_office').length,
              fabs: game.structures.filter((s) => s.kind === 'fab').length,
        wonder: game.wonder
          ? { id: game.wonder.id, label: WONDER_SPECS[game.wonder.id as keyof typeof WONDER_SPECS]?.label ?? game.wonder.id, progress: Math.round(game.wonder.progress * 100) }
          : null,
        wonders: game.wonders ?? [],
            },
            grid: this.gridPanel(game),
            sails: game.sails.length,
            generatorKj: sparkPlugOutputKj(game.upgrades.sparkPlug),
            sparkPlug: game.upgrades.sparkPlug,
            capacityKj: energyCapOf(game),
            battery: game.upgrades.battery,
            generatorCooldownMs: Math.max(0, game.lastGeneratorRealMs + GENERATOR_COOLDOWN_MS - this.now()),
          }
        : null,
      monitor: game
        ? {
            monitored,
            starUnlocked: monitored.includes(`p${game.homePlanetIndex}`),
            currentKey: game.location ? bodyKeyOf(game.location) : null,
            currentMonitored: game.location ? monitored.includes(bodyKeyOf(game.location)) : false,
          }
        : null,
      flora: game
        ? {
            credits: game.credits,
            tier: creditTier(game.credits).label,
            energyKj: game.energyKj,
            shopOpen: shopOpen(nowPlanetHours(game, this.now()), game.upgrades.telescope),
            shopWindow: shopWindowText(nowPlanetHours(game, this.now()), game.upgrades.telescope),
            shopLevel: game.upgrades.telescope,
            sites: game.sites.map((s) => {
              const plants = game.plants[s.key] ?? [];
              const planet = system?.planets[s.planetIndex - 1];
              const climate = planet && planet.surface.kind === 'terrestrial' && game
                ? climateAt(
                    planet.surface,
                    s.latDeg,
                    s.lonDeg,
                    nowPlanetHours(game, this.now()),
                    game.calendar.planetDaysPerYear * 24,
                    planet.obliquityDeg,
                  )
                : null;
              return {
                key: s.key,
                kind: s.kind === 'water' ? '水边湿地' : '旱地',
                plants: plants.length,
                ripe: plants.filter((p) => p.stage === 'ripe').length,
                latDeg: s.latDeg,
                lonDeg: s.lonDeg,
                wetness: climate ? climate.wetness : null,
                fertility: climate ? climate.fertility : null,
              };
            }),
            inventory: Object.entries(game.inventory)
              .filter(([, n]) => n > 0)
              .map(([id, n]) => ({
                id,
                name: id === 'survey' ? '测绘数据' : RESOURCE_LABELS[id as keyof typeof RESOURCE_LABELS] ?? id,
                amount: n,
              })),
            crops: Object.entries(game.plants).flatMap(([site, list]) =>
              list.map((p) => ({
                site,
                id: p.id,
                species: p.species,
                name: SPECIES[p.species].name,
                stage: p.stage,
                progress: Math.round(p.progress * 100) / 100,
                ripe: p.stage === 'ripe',
                health: Math.round(p.health * 100) / 100,
                dead: p.stage === 'withering' || p.health < REMOVE_MIN_HEALTH,
              })),
            ),
            bags: game.seedBags.map((b) => ({ id: b.id, name: speciesTempLabel(b.species), count: b.count, premium: b.premium })),
            planters: game.structures
              .filter((s) => s.kind === 'planter')
              .map((s) => {
                const key = `planter:${s.id}`;
                const plants = game.plants[key] ?? [];
                const site = game.sites.find((x) => x.key === s.siteKey);
                return {
                  key,
                  siteKey: s.siteKey,
                  plants: plants.length,
                  ripe: plants.filter((p) => p.stage === 'ripe').length,
                  powered: structurePowered(game, s),
                  ambientC: site && system ? this.ambientFor(game, system, site) : null,
                };
              }),
          }
        : null,
      greenhouses: game
        ? game.structures
            .filter((s) => s.kind === 'greenhouse')
            .map((s) => {
              const site = game.sites.find((x) => x.key === s.siteKey);
              const ambient = site ? this.ambientFor(game, system, site) : null;
              const target = s.targetTempC ?? null;
              const delta = ambient !== null && target !== null ? Math.abs(target - ambient) : 0;
              const powered = structurePowered(game, s);
              const interior = powered && ambient !== null ? greenhouseClimate(ambient, s) : null;
              return {
                siteKey: s.siteKey,
                targetC: target,
                ambientC: ambient,
                deltaC: Math.round(delta * 10) / 10,
                interiorC: interior === null ? null : interior.tempC,
                powered,
                realismCores: (s.cores ?? []).filter((c) => c === 'realism').length,
                coldStores: coldStoresAt(game, s.siteKey),
              };
            })
        : [],
      structures: game
        ? game.structures.map((s) => {
            const site = game.sites.find((x) => x.key === s.siteKey);
            const store = game.stores[s.id] ?? {};
            const contents = Object.entries(store)
              .filter(([, kg]) => kg > 0)
              .map(([id, kg]) => ({
                name: id === 'survey' ? '测绘数据' : RESOURCE_LABELS[id as keyof typeof RESOURCE_LABELS] ?? id,
                kg: Math.round(kg * 100) / 100,
              }));
            return {
              id: s.id,
              kind: s.kind,
              label: BUILD_SPECS[s.kind].label,
              siteKey: s.siteKey,
              latDeg: site?.latDeg ?? 0,
              lonDeg: site?.lonDeg ?? 0,
              usedKg: Math.round(storeWeightKg(store) * 100) / 100,
              capKg: storeCapacityKg(s),
              contents,
              sellTarget: s.sellTarget,
              buySpecies: s.buySpecies,
              slot: s.slot,
              feeds: s.feeds,
              routesText: s.kind === 'storage_terminal' ? storageRouteText(game!, s) : undefined,
              armText: s.kind === 'arm'
                ? `入：${(s.inputs ?? []).join('、') || '—'} → 出：${s.output ?? '—'} · 搬：${s.items?.length ? s.items.join('、') : '全部'} · ${ARM_KG_PER_HOUR} kg/时`
                : undefined,
              armCycle: s.kind === 'arm' ? armsInCycle(game!).some((a) => a.id === s.id) : undefined,
              dutyText: s.kind === 'duty'
                ? (() => {
                    const habitat = game!.structures.find((h) => h.id === s.habitat);
                    const hands = Math.floor((habitat?.awake ?? 0) / RESIDENTS_PER_LABOR);
                    const powered = structurePowered(game!, s);
                    const sites = (s.sites ?? []).length;
                    const state = !powered ? '断电停工' : hands <= 0 ? '居所里没人醒着' : '在干活';
                    return `派 ${hands} 份人手（${habitat?.id ?? '—'}）· 收成进 ${s.store ?? '—'} · 管 ${sites} 个站点 · ${state}`;
                  })()
                : undefined,
              interiorC: s.kind === 'habitat' && system
                ? Math.round(habitatInteriorC(system, game!, s, this.now()) * 10) / 10
                : undefined,
              comfort: s.kind === 'habitat' && system
                ? (() => {
                    const interior = habitatInteriorC(system, game!, s, this.now());
                    return interior < HABITAT_COMFORT_C.min ? 'cold' : interior > HABITAT_COMFORT_C.max ? 'hot' : 'ok';
                  })()
                : undefined,
              bags: s.kind === 'terminal'
                ? game!.seedBags.filter((b) => b.at === s.id).length
                : undefined,
            };
          })
        : [],
      builds: game
        ? game.builds.map((b) => ({
            kind: b.kind,
            label: buildLabel(b.kind),
            siteKey: b.siteKey,
            leftHomeHours: Math.max(0, b.completeHomeHours - nowPlanetHours(game, this.now())),
          }))
        : [],
      location: game?.location
        ? { bodyKey: bodyKeyOf(game.location), latDeg: game.location.latDeg, lonDeg: game.location.lonDeg }
        : null,
      buildSlots: game ? buildQueueSlots(game) : 1,
      buildQueueFull: game ? buildQueueBlocked(game, this.now()) !== null : false,
      protocol: game ? this.protocolPanel(game) : null,
      habitats: game ? habitatStatus(game).map((h, i) => ({ ...h, nickname: `居所 ${i + 1}` })) : [],
      orders: game ? currentOrders(game, this.now()).map((o) => ({ ...o, species: SPECIES[o.species].name })) : [],
      territories: game?.location
        ? (game.territories ?? [])
            .filter((territory) => territory.planetIndex === game.location?.planetIndex)
            .map((territory) => ({
              species: territory.species,
              label: ANIMAL_SPECIES.find((species) => species.id === territory.species)?.name ?? territory.species,
              latDeg: territory.latDeg,
              lonDeg: territory.lonDeg,
              radiusKm: territory.radiusKm,
            }))
        : [],
    };
  }

  private protocolPanel(game: GameState): GenesisPanelProtocol {
    const rows = protocolStatus(game);
    return {
      tasks: rows.map((t) => ({
        id: t.id,
        chapter: CHAPTER_TITLES[t.chapter],
        title: t.title,
        done: t.done,
        progress: `${Math.floor(t.progress * 100)}%`,
      })),
      done: rows.filter((t) => t.done).length,
      total: rows.length,
      complete: rows.every((t) => t.done),
      awakened: game.awakened,
    };
  }

  /** 「协议」面板：三章十二项 + 居所里的人与补给，好让人类一眼看出卡在哪。 */
  private protocolPanelState(): GenesisProtocolPanel {
    if (!this.system) throw new Error('还没有创世。先 genesis_create。');
    if (!this.game) throw new Error('这个存档是旧版本（还没有协议），请 genesis_reset 之后重新创世。');
    const game = this.game;
    const rows = protocolStatus(game);
    const base = this.protocolPanel(game);
    const chapters: GenesisProtocolPanel['chapters'] = [];
    for (const [id, title] of Object.entries(CHAPTER_TITLES)) {
      const chapter = Number(id);
      const tasks = base.tasks.filter((t) => t.chapter === title);
      chapters.push({
        id: chapter,
        title,
        tasks,
        done: tasks.filter((t) => t.done).length,
        total: tasks.length,
      });
    }
    const status = habitatStatus(game);
    const first = status[0] ?? null;
    return {
      chapters,
      done: base.done,
      total: base.total,
      complete: base.complete,
      ready: rows.filter((t) => t.id !== 'wake' && t.done).length === rows.length - 1,
      awakened: base.awakened,
      habitat: first
        ? { awake: first.awake, dormant: first.dormant, food: first.food, water: first.water, oxygen: first.oxygen, hoursLeft: first.hoursLeft }
        : null,
      population: populationStatus(game),
      recreate: (() => {
        const blockers = recreateBlockers(game);
        return { blockers, ready: blockers.length === 0, seed: String(GENESIS_DEFAULTS.seed), starMass: GENESIS_DEFAULTS.starMass };
      })(),
    };
  }

  private resolveBody(system: StarSystem, key: string, game?: GameState): TerrainBody {
    const match = /^p(\d+)(?:-m(\d+))?$/.exec(key);
    if (!match) throw new Error(`不认识的天体：${key}`);
    const planetIndex = Number(match[1]);
    const planet = system.planets[planetIndex - 1];
    if (!planet) throw new Error(`行星序号 ${planetIndex} 不存在（一共 ${system.planets.length} 颗）。`);
    if (match[2] !== undefined) {
      const moonIndex = Number(match[2]);
      const moon = planet.moons[moonIndex - 1];
      if (!moon) throw new Error(`「${game ? displayName(game, planet.id) : planet.name}」没有第 ${moonIndex} 颗卫星（一共 ${planet.moons.length} 颗）。`);
      return {
        id: moon.id,
        name: game ? displayName(game, moon.id) : moon.name,
        meanTempK: planet.eqTempK,
        obliquityDeg: 0,
        atmosphere: 'none',
        surface: moon.surface,
      };
    }
    return {
      id: planet.id,
      name: game ? displayName(game, planet.id) : planet.name,
      meanTempK: planet.meanTempK,
      obliquityDeg: planet.obliquityDeg,
      atmosphere: planet.atmosphere,
      surface: planet.surface,
    };
  }

  /** 面板地图用：这颗行星上正在改造（或已改完）的格子与它们的目标群系。 */
  private terraFor(bodyId: string, surface: TerrestrialSurface): Array<{ i: number; j: number; p: number; targetBiome: number }> {
    const game = this.game;
    const match = /^p(\d+)/.exec(bodyId);
    const planetIndex = match ? Number(match[1]) : 0;
    if (!game || !planetIndex) return [];
    return terraCellsFor(game.terra, planetIndex).map((cell) => ({
      ...cell,
      targetBiome: targetBiomeFor(surface, cell.i, cell.j),
    }));
  }

  /** 面板地图用：这颗行星上被采掘挖薄的格子（疤 0…1）。 */
  private scarFor(bodyId: string): Array<{ i: number; j: number; v: number }> {
    const game = this.game;
    const match = /^p(\d+)/.exec(bodyId);
    const planetIndex = match ? Number(match[1]) : 0;
    if (!game || !planetIndex) return [];
    const prefix = `p${planetIndex}:`;
    const out: Array<{ i: number; j: number; v: number }> = [];
    for (const [key, value] of Object.entries(game.scar)) {
      if (!key.startsWith(prefix) || value <= 0) continue;
      const parts = key.slice(prefix.length).split(':');
      out.push({ i: Number(parts[0]), j: Number(parts[1]), v: Math.min(1, Math.max(0, value)) });
    }
    return out;
  }

  private surfaceMap(input: unknown): GenesisSurfaceMap {
    const system = this.system;
    if (!system) throw new Error('还没有创世。先 genesis_create。');
    const body = this.resolveBody(system, String(input ?? ''), this.game ?? undefined);
    const surface = body.surface;
    switch (surface.kind) {
      case 'terrestrial':
        return {
          kind: 'terrestrial',
          name: body.name,
          grid: surface.grid,
          meanTempC: surface.meanTempC,
          minElevationM: surface.minElevationM,
          maxElevationM: surface.maxElevationM,
          oceanFraction: surface.oceanFraction,
          biome: surface.biome,
          elevationM: surface.elevationM,
          terra: this.terraFor(body.id, surface),
          scar: this.scarFor(body.id),
        };
      case 'isobaric':
        return {
          kind: 'isobaric',
          name: body.name,
          grid: surface.grid,
          meanTempC: surface.meanTempC,
          minWindMps: surface.minWindMps,
          maxWindMps: surface.maxWindMps,
          biome: surface.biome,
        };
      case 'moon':
        return {
          kind: 'moon',
          name: body.name,
          grid: surface.grid,
          meanTempC: surface.meanTempC,
          biome: surface.biome,
        };
    }
  }

  private async createFromPanel(input: unknown): Promise<GenesisPanelState> {
    const draft = input as Partial<GenesisDraft> | undefined;
    const seed = normalizeSeedValue(draft?.seed);
    const spec: GenesisSpec = {
      seed,
      starMass: Number(draft?.starMass ?? GENESIS_DEFAULTS.starMass),
      // 行星数与卫星上限由种子决定，面板不再提供这两个旋钮。
      ...deriveGenesisShape(seed),
    };
    await this.ensureWorld(spec, {
      starName: String(draft?.starName ?? '恒星').trim() || '恒星',
      homeName: String(draft?.homeName ?? '母星').trim() || '母星',
    });
    return this.panelState();
  }

  /** 创世前的预看：这颗种子会长出几颗行星、每颗几颗卫星。不生成世界，只回答形状。 */
  private previewShape(input: unknown): { planetCount: number; maxMoons: number; minPlanets: number; maxPlanets: number } {
    const shape = deriveGenesisShape(normalizeSeedValue(input));
    return { ...shape, minPlanets: GENESIS_SHAPE.minPlanets, maxPlanets: GENESIS_SHAPE.maxPlanets };
  }

  /** 导出：一份 JSON 就是整局（星系 + 状态）。面板拿到文本后自己下载。 */
  private async exportFromPanel(): Promise<{ text: string; filename: string }> {
    await this.sync();
    const system = await this.readSystem();
    if (!system || !this.game) throw new Error('还没有创世：没有可以导出的存档。');
    const payload = {
      kind: 'genesis-save' as const,
      schema: 1 as const,
      exportedAt: new Date().toISOString(),
      system,
      game: serializeGame(this.game),
    };
    const stamp = new Date().toISOString().slice(0, 10);
    return { text: JSON.stringify(payload, null, 2), filename: `genesis-${stamp}.json` };
  }

  /** 导入：先校验、再落盘，最后重载。坏文件不会留下半截存档。 */
  private async importFromPanel(raw: unknown): Promise<{ text: string }> {
    const text = typeof raw === 'string' ? raw : '';
    if (text.trim() === '') throw new Error('没有收到存档内容：选一个 .json 文件，或者把内容贴进来。');
    let parsed: { system?: unknown; game?: unknown };
    try {
      parsed = JSON.parse(text) as { system?: unknown; game?: unknown };
    } catch {
      throw new Error('这不是 JSON：文件可能在拷贝时被截断了。');
    }
    if (!parsed || typeof parsed !== 'object' || !parsed.system || !parsed.game) {
      throw new Error('这不是创世的存档：缺 system 或 game。');
    }
    assertSave(parsed.system as never);
    const system = parsed.system as never as import('./model.ts').StarSystem;
    const game = deserializeGame(system, parsed.game as never);
    await this.store.overwrite(system);
    await this.games.write(game);
    this.system = system;
    this.game = game;
    return { text: `存档已导入：恒星「${game.names.star}」，第 ${(game.speed ?? 1)} 倍速，能量 ${Math.round(game.energyKj)} kJ。` };
  }
  private async resetFromPanel(input: unknown): Promise<GenesisPanelState> {
    if (String(input ?? '') !== 'DELETE') throw new Error('删档要传 confirm: DELETE。');
    await this.reset();
    return this.panelState();
  }

  /** 面板上的动能发电机：只有人类会按；Agent 没有对应工具。 */
  private async pressFromPanel(): Promise<GenesisPanelState> {
    await this.sync();
    if (!this.game) throw new Error('还没有创世。');
    const before = this.game.energyKj;
    this.game = pressGenerator(this.game, this.now());
    await this.saveGame();
    const gained = this.game.energyKj - before;
    if (gained > 0) {
      await this.push(
        'genesis.hand',
        `人类手摇了一次动能发电机：+${gained.toFixed(0)} kJ（电池现在 ${Math.floor(this.game.energyKj).toLocaleString('en-US')} kJ）。`,
      );
    }
    return this.panelState();
  }

  private async monitorFromPanel(input: unknown): Promise<GenesisPanelState> {
    await this.sync();
    const system = this.system;
    const game = this.game;
    if (!system || !game) throw new Error('还没有创世。');
    const key = String(input ?? '').trim() || (game.location ? bodyKeyOf(game.location) : '');
    if (!key) throw new Error('不知道你站在哪。');
    if (!game.monitors.includes(key)) {
      this.game = deployMonitor(system, game, this.now(), key);
      await this.saveGame();
    }
    return this.panelState();
  }

  private async createSystem(spec: GenesisSpec): Promise<{ created: boolean; system: StarSystem }> {
    // 先校验再读存档：即使已经锁定，越界参数也要报错，而不是悄悄把旧星卡还回去。
    validateSpec(spec);
    const result = await this.store.createOnce(spec);
    this.system = result.system;
    if (result.created) {
      await this.push(
        'genesis.created',
        `创世完成 #${result.system.specHash}：${result.system.star.spectralClass} 型恒星，${result.system.planets.length} 颗行星。`,
      );
    }
    return { created: result.created, system: result.system };
  }

  /**
   * 创世 + 开局定位。
   * - 没存档：生成星系，再把 Agent 放到最宜居行星的陆地上，时间从 0 开始；
   * - 有星系但没时间轴（0.5.0 的旧档）：用这次给的名字把时间轴补上；
   * - 都已经有：不覆盖，只报告。
   */
  private async ensureWorld(spec: GenesisSpec, names: { starName: string; homeName: string }): Promise<{
    created: boolean;
    started: boolean;
    system: StarSystem;
  }> {
    const result = await this.createSystem(spec);
    // 死局判定：母星几乎没有可站人的陆地时，子代理拒绝迫降（不写档、不留半成品）。
    if (result.created) {
      const refusal = landingRefusal(result.system);
      if (refusal) {
        await this.store.delete();
        throw new Error(refusal);
      }
    }
    if (this.game) return { created: result.created, started: false, system: result.system };
    const game = this.startNewGame(result.system, names);
    this.game = game;
    await this.saveGame();
    this.schedule();
    return { created: result.created, started: true, system: result.system };
  }

  private startNewGame(system: StarSystem, names: { starName: string; homeName: string }): GameState {
    return startGame(system, { ...names, seed: system.spec.seed }, this.now());
  }

  private async reset(): Promise<boolean> {
    const deleted = await this.store.delete();
    await this.games.delete();
    this.system = null;
    this.game = null;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (deleted) await this.push('genesis.reset', '存档已删除，可以重新创世。');
    return deleted;
  }

  private async push(type: string, text: string): Promise<void> {
    // 面板点击期间（quiet）只把事件攒起来，攒到窗口结束再合并成一条；
    // 这样人类连点十次发电机，模型也只会被叫醒一次。
    if (this.quiet) {
      const same = this.merged.find((m) => m.type === type);
      if (same) same.texts.push(text);
      else this.merged.push({ type, texts: [text] });
      return;
    }
    await this.pushNow(type, text);
  }

  /** 合并窗口：一个母星时（至少 60 秒）内最多推一条。 */
  private mergedWindowMs(): number {
    return Math.max(60_000, this.game?.msPerPlanetHour ?? 60_000);
  }

  private async flushMerged(force = false): Promise<void> {
    if (this.merged.length === 0) return;
    if (!force && this.now() - this.lastMergedPushMs < this.mergedWindowMs()) return;
    const groups = this.merged;
    this.merged = [];
    this.lastMergedPushMs = this.now();
    for (const group of groups) {
      const first = group.texts[0]!;
      const text =
        group.texts.length === 1
          ? first
          : `${first}（这一母星时里还有 ${group.texts.length - 1} 条同类，一并说了。）`;
      await this.pushNow(group.type, text);
    }
  }

  private async pushNow(type: string, text: string): Promise<void> {
    const host = this.host;
    if (!host) return;
    try {
      await host.pushEvent({
        type,
        ts: nowIso(this.opts.timezone),
        source: this.id,
        origin: 'internal',
        senderKey: this.id,
        text,
      });
    } catch {
      // 事件推不出去不影响世界本身。
    }
  }

  // —— 工具 ——

  /**
   * 把「未抵星体-xxxx」这种混淆编号翻回 p2 / p2-m1。
   * 模型只看得到编号（看不到序号），所以观星之后拿编号当 target 也得能走。
   */
  private resolveBodyKey(system: StarSystem, game: GameState, raw: string): string {
    const text = raw.trim();
    if (!text) return '';
    if (/^p\d+(?:-m\d+)?$/i.test(text)) return text.toLowerCase();
    const probe = text
      .replace(/^【/, '')
      .replace(/】$/, '')
      .replace(/^未抵星体\s*[-－—]?\s*/, '')
      .trim()
      .toLowerCase();
    const keys: string[] = [];
    for (const [index, planet] of system.planets.entries()) {
      keys.push(`p${index + 1}`);
      for (let m = 1; m <= planet.moons.length; m++) keys.push(`p${index + 1}-m${m}`);
    }
    for (const key of keys) {
      if (bodyProbeId(game, key) === probe) return key;
    }
    return text;
  }

  private menuTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[0]!,
      handler: async () => {
        const system = await this.readSystem();
        const status = system
          ? `已经有存档（#${system.specHash}），创世已锁定；要重选只能 genesis_reset。`
          : '还没有存档，可以创世。';
        return `${describeGenesisMenu()}\n\n${status}`;
      },
    };
  }

  private createTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[1]!,
      handler: async (args) => {
        const starName = String(args.starName ?? '').trim();
        const homeName = String(args.homeName ?? '').trim();
        if (!starName || !homeName) {
          return { text: '创世时要把两个名字都定下来：starName 是恒星名，homeName 是母星名（各 1–12 字）。', failed: true };
        }
        if (starName.length > 12 || homeName.length > 12) {
          return { text: '名字最多 12 个字。', failed: true };
        }
        const spec: GenesisSpec = {
          seed: typeof args.seed === 'string' ? args.seed : Number(args.seed),
          starMass: Number(args.starMass),
          // 行星数与卫星上限由种子决定：工具里还收这两个参数只是为了不打断老调用，真正的值以推导为准。
          ...deriveGenesisShape(typeof args.seed === 'string' ? args.seed : Number(args.seed)),
        };
        try {
          const result = await this.ensureWorld(spec, { starName, homeName });
          if (!result.started) {
            // 已经创世：这里**不能**再回星卡。否则模型只要再调一次 create，就能绕过
            // 【环境监测器】看到整张星卡（行星数、距离、气候、宜居性，连种子都会漏出来）。
            return {
              text: '这个世界已经创世过了：创世只有一次，这次没有覆盖任何东西，也没有返回星卡。' +
                '想看天体详情，先用 genesis_card 看已监测的；要去没到过的地方了解它，得先过去装一台【环境监测器】。' +
                '要彻底重来（会丢档）请先 genesis_reset。',
              failed: true,
            };
          }
          const card = this.creationSummary(result.system, starName, this.game ?? undefined);
          const game = this.game!;
          const note = result.created
            ? '已写入存档，自此锁定：再调用 genesis_create 不会覆盖。'
            : '这个旧存档还没有时间轴，这次按你给的两个名字补上了。';
          return `${card}\n\n${note}\n\n${describeCalendar(game.calendar)}\n\n` +
            `你站在母星「${game.calendar.homePlanetName}」的陆地上（${game.location!.latDeg.toFixed(1)}°, ${game.location!.lonDeg.toFixed(1)}°），` +
            `此刻记为 ${timeText(game, this.now())}——从这里开始走。\n\n` +
            `电池里还残留着迫降前的 ${Math.round(game.energyKj).toLocaleString('en-US')} kJ；太阳能帆坏了，` +
            `要人类在面板上摇【动能发电机】，或者把第一茬作物烧成电。\n` +
            `打印机里还有 ${game.tungsten} 份钨（每座建筑按份消耗，用完了只能去山上挖或找商人买），` +
            `背包里还有三袋应急种子（硅藻、苔藓、速生草，各 5 粒）。\n\n` +
            `（远处的东西还看不清：想看哪颗天体的详细属性，得先到那儿装一台【环境监测器】。）`;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          // 创世失败也推一条事件：Agent 不该只看到工具回执就以为世界已经诞生。
          await this.push('genesis.create_failed', `创世失败：${message}（世界没有生成，存档也没有写入。）`);
          return { text: message, failed: true };
        }
      },
    };
  }

  private cardTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[2]!,
      handler: async () => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        return this.monitoredReport(ready.system, ready.game);
      },
    };
  }

  /** 创世那一刻能看到的东西：恒星概况 + 行星名单 + 母星那一条，不含细节。 */
  private creationSummary(system: StarSystem, starName: string, game?: GameState): string {
    const home = mostHabitable(system);
    const homeIndex = system.planets.indexOf(home) + 1;
    const lines: string[] = [];
    lines.push(`创世 #${system.specHash} · 种子 ${system.spec.seed}`);
    lines.push(
      `恒星「${starName}」：${system.star.massSun.toFixed(2)} M☉ · ${system.star.spectralClass} 型 · ${system.star.luminositySun.toFixed(2)} L☉`,
    );
    lines.push(`行星 ${system.planets.length} 颗：`);
    for (const [i, p] of system.planets.entries()) {
      const mark = i + 1 === homeIndex ? ' ← 母星' : '';
      lines.push(`  ${i + 1}. ${p.name}（${KIND_LABEL[p.kind]}）${p.aAU.toFixed(2)} AU · ${CLIMATE_LABEL[p.climate]}${p.habitable ? ' · 宜居' : ''}${mark}`);
    }
    return lines.join('\n');
  }

  /** 已装监测器的天体清单——这是模型唯一能看到「详细属性」的窗口。 */
  private monitoredReport(system: StarSystem, game: GameState): string {
    const monitors = game.monitors;
    if (monitors.length === 0) {
      return '还没有部署【环境监测器】：现在看不到任何天体的详细属性。走到想了解的天体上，或者用 body 指定一个已到过的天体，再调用 genesis_monitor。';
    }
    const homeKey = `p${game.homePlanetIndex}`;
    const lines: string[] = [`已部署【环境监测器】的天体（${monitors.length}）：`];
    if (monitors.includes(homeKey)) {
      lines.push('');
      lines.push('恒星全貌（母星监测器解锁）：');
      lines.push(...formatStarBlock(system, game.names.star));
    }
    for (const key of monitors) {
      const match = /^p(\d+)(?:-m(\d+))?$/.exec(key);
      if (!match) continue;
      const planet = system.planets[Number(match[1]) - 1];
      if (!planet) continue;
      lines.push('');
      if (match[2] !== undefined) {
        const moon = planet.moons[Number(match[2]) - 1];
        if (moon) lines.push(`卫星 ${displayName(game, moon.id)}（${displayName(game, planet.id)} 的第 ${match[2]} 颗）：`);
        if (moon) lines.push(formatMoonLine(planet, moon, displayName(game, moon.id)).trimStart());
        continue;
      }
      lines.push(...formatPlanetBlock(planet, false, displayName(game, key)));
      for (const [i, m] of planet.moons.entries()) {
        if (monitors.includes(`${key}-m${i + 1}`)) lines.push(formatMoonLine(planet, m, displayName(game, m.id)));
      }
    }
    return lines.join('\n');
  }

  private terrainTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[3]!,
      handler: async (args) => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        const { system, game } = ready;
        const note = this.transitNote(game);
        if (note) return `${this.transitHead(game)}\n\n${this.departureEnvironment(system, game)}`;
        const loc = game.location;
        if (!loc) return { text: '还不知道自己在哪。', failed: true };
        const planetArg = args.planetIndex;
        const moonArg = args.moonIndex;
        const looking = planetArg !== undefined && planetArg !== null && String(planetArg) !== '';
        const key = looking
          ? `p${Number(planetArg)}${moonArg !== undefined && moonArg !== null && String(moonArg) !== '' ? `-m${Number(moonArg)}` : ''}`
          : bodyKeyOf(loc);
        const lat = args.lat !== undefined && args.lat !== null ? Number(args.lat) : looking ? 0 : loc.latDeg;
        const lon = args.lon !== undefined && args.lon !== null ? Number(args.lon) : looking ? 0 : loc.lonDeg;
        // 只有脚下这块地、和装了【环境监测器】的天体看得到——远处的东西不靠猜。
        const here = bodyKeyOf(loc);
        if (key !== here && !(game.monitors ?? []).includes(key)) {
          return {
            text: `这里没有【环境监测器】，你也还不在${displayName(game, key)}——看不到那片地形。先到那儿，或者在已监测的天体上看。`,
            failed: true,
          };
        }
        let body: TerrainBody;
        try {
          body = this.resolveBody(system, key, game);
        } catch (error) {
          return { text: error instanceof Error ? error.message : String(error), failed: true };
        }
        const radiusKm = this.opts.cfg.viewBaseKm * planetVisibility(body.atmosphere);
        return terrainPatchText(terrainPatch(body, lat, lon, radiusKm));
      },
    };
  }

  private timeTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[4]!,
      handler: async () => {
        const ready = await this.readyState();
        if ('error' in ready) return ready.error;
        return `${this.timeLine(ready.game)}\n${this.energyLine(ready.game)}`;
      },
    };
  }

  private energyLine(game: GameState): string {
    const ship = shipSupplyStatus(game);
    const pod =
      ship.sleepers > 0
        ? `\n着陆舱：粮 ${ship.food} kg、水 ${ship.water} L、氧 ${ship.oxygen} kg——${ship.sleepers} 个人睡着，大约还够 ${ship.hoursLeft ?? 0} 母星时。`
        : '';
    return `能量：${game.energyKj.toLocaleString('en-US')} / ${energyCapOf(game).toLocaleString('en-US')} kJ · 钨：${game.tungsten} 份（${game.sails.length} 台太阳能帆）。${pod}`;
  }

  /** 本地电网那一段：有没有塔、离多远、存了多少、能不能搬。 */
  private gridLine(game: GameState): string {
    const loc = game.location;
    if (!loc) return '本地电网：你还没有站到任何一颗星上。';
    const planetIndex = loc.planetIndex;
    const tower = rectifierAt(game, planetIndex);
    const key = gridKeyFor(planetIndex);
    const stored = Math.floor(game.grids[key] ?? 0);
    if (!tower) {
      return `本地电网：这颗星还没有【整流电塔】——帆发的电直接进电池，设备也没法在本地取电。`;
    }
    const site = game.sites.find((s) => s.key === tower.siteKey);
    let distance = 0;
    if (site) {
      distance = surfaceDistanceKm(site.latDeg, site.lonDeg, loc.latDeg, loc.lonDeg);
    }
    const cap = gridCapacityFor(this.system!, game, planetIndex);
    const reachable = distance <= GRID_TAP_RANGE_KM;
    const head = `本地电网：${stored.toLocaleString('en-US')} / ${cap.toLocaleString('en-US')} kJ`;
    return reachable
      ? `${head}（电塔就在 ${distance.toFixed(0)} km 外，可以申请搬电：每 ${GRID_TAP_HOME_HOURS} 母星时最多 ${GRID_TAP_KJ_PER_CALL.toLocaleString('en-US')} kJ，损耗 10%）。`
      : `${head}（电塔在 ${tower.siteKey}，离你 ${distance.toFixed(0)} km——走到 ${GRID_TAP_RANGE_KM} km 以内才能搬电）。`;
  }

  private stargazeTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[5]!,
      handler: async () => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        const { system, game } = ready;
        const note = this.transitNote(game);
        if (note) return note;
        if (!game.location) return { text: '还不知道自己在哪。', failed: true };
        const visibility = this.visibilityOf(system, game.location);
        const result = stargazeAt(system, game, this.now());
        if (!result.result) {
          return `此刻大气能见度 ${visibility.toFixed(2)}，太浑浊了，看不到星星（观星需要大于 0.5）。`;
        }
        this.game = result.state;
        await this.saveGame();
        const text = stargazeText(result.result, (key) => displayName(result.state, key));
        const windowHours = 1;
        return `${text}\n\n（从现在起 ${windowHours} ${game.calendar.homePlanetName}时内可以选择星际航行；` +
          `过了这个窗口就要重新观星。）`;
      },
    };
  }

  private moveTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[6]!,
      handler: async (args) => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        const { system, game } = ready;
        const note = this.transitNote(game);
        if (note) return note;
        const kind = String(args.kind ?? '');
        try {
          let result: { state: GameState; event: { type: string; text: string } };
          if (kind === 'surface') {
            if (args.lat === undefined || args.lon === undefined) {
              return { text: '地表移动要给目标坐标：lat 与 lon。', failed: true };
            }
            result = beginSurfaceMove(system, game, Number(args.lat), Number(args.lon), this.now());
          } else if (kind === 'interstellar') {
            const target = this.resolveBodyKey(system, game, String(args.target ?? ''));
            if (!target) return { text: '星际航行要给目标：target（比如 p2、p2-m1，或者观星看到的【未抵星体-xxxx】）。', failed: true };
            result = beginInterstellar(system, game, target, this.now());
          } else if (kind === 'home') {
            result = returnHome(system, game, this.now());
          } else {
            return { text: `不认识的移动方式：${kind}。kind 只能是 surface / interstellar / home。`, failed: true };
          }
          this.game = result.state;
          await this.saveGame();
          this.schedule();
          const leftMs = result.state.transit!.arriveRealMs - this.now();
          const leftHours = leftMs / result.state.msPerPlanetHour;
          return `${result.event.text}\n预计 ${leftHours.toFixed(2)} ${game.calendar.homePlanetName}时后再到` +
            `（现实 ${(leftMs / REAL_MS_PER_HOUR).toFixed(2)} 小时）。移动途中看不到环境，到了会自动收到【已到达】。`;
        } catch (error) {
          return { text: error instanceof Error ? error.message : String(error), failed: true };
        }
      },
    };
  }

  private nameTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[7]!,
      handler: async (args) => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        const { system, game } = ready;
        const note = this.transitNote(game);
        if (note) return note;
        const target = String(args.target ?? '').trim() || (game.location ? bodyKeyOf(game.location) : '');
        try {
          const result = nameBody(game, system, target, String(args.name ?? ''));
          this.game = result.state;
          await this.saveGame();
          const automatic = target.includes('-m');
          return automatic
            ? `这颗卫星按模板叫「${result.name}」。`
            : `这里从此叫「${result.name}」。`;
        } catch (error) {
          return { text: error instanceof Error ? error.message : String(error), failed: true };
        }
      },
    };
  }

  private installTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[18]!,
      handler: async (args) => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        const { system, game } = ready;
        const note = this.transitNote(game);
        if (note) return note;
        const id = String(args.id ?? '').trim();
        try {
          if (id === 'monitor') {
            const key = String(args.body ?? '').trim() || (game.location ? bodyKeyOf(game.location) : '');
            if (!key) return { text: '不知道你站在哪；用 body 指定一个天体（比如 p2）。', failed: true };
            const already = game.monitors.includes(key);
            let next = game;
            if (!already) {
              next = deployMonitor(system, game, this.now(), key);
              this.game = next;
              await this.saveGame();
            }
            const head = already ? '' : '装上了【环境监测器】：花费 150,000 kJ，过去 0.1 母星时。\n\n';
            return `${head}${this.monitoredReport(system, next)}\n\n${this.energyLine(next)}`;
          }
          if (id === 'counter') {
            const next = deployCounter(system, game, this.now());
            this.game = next;
            await this.saveGame();
            return `装上了【凌日计数器】：花费 1,000,000 kJ，过去 0.1 母星时。现在 genesis_transit 能告诉你脚下是第几颗行星。\n${this.energyLine(next)}`;
          }
          if (id === 'sail') {
            const next = deploySail(system, game, this.now());
            this.game = next;
            await this.saveGame();
            const planet = system.planets[next.location!.planetIndex - 1]!;
            const here = next.sails.filter((s) => s.bodyKey === `p${next.location!.planetIndex}`).length;
            return `太阳能帆已部署：${displayName(next, planet.id)} 的 (${next.location!.latDeg.toFixed(1)}°, ${next.location!.lonDeg.toFixed(1)}°)，扣 6,000 kJ。这颗行星现在有 ${here} 台帆。` +
              `它所在的纬度决定每天照多久：白天每母星时产 7,000 kJ，夜里不产。\n${this.energyLine(next)}`;
          }
          if (id === 'greenhouse' || id === 'biome_changer' || id === 'pump' || id === 'warehouse' || id === 'rocket'
            || id === 'kiln' || id === 'purifier' || id === 'sealer' || id === 'atmo_extractor'
            || id === 'habitat' || id === 'mutation_room' || id === 'cold_store' || id === 'inert_room'
            || id === 'miner' || id === 'rectifier' || id === 'terminal' || id === 'storage_terminal' || id === 'arm'
            || id === 'planter' || id === 'fence' || id === 'scarecrow' || id === 'feed_trough' || id === 'duty' || id === 'carrier' || id === 'wind' || id === 'fire' || id === 'converter' || id === 'tour_line' || id === 'souvenir' || id === 'compute_array' || id === 'heavy_water' || id === 'enrichment') {
            const rawSite = typeof args.site === 'string' ? args.site.trim() : '';
            const siteKey = rawSite.startsWith('carrier:')
              ? rawSite
              : id === 'carrier'
                ? 'sky:' + String(game.location?.planetIndex ?? 1)
                : await this.siteForBuild(system, args.site);
            const target = typeof args.target === 'string' && args.target.trim() ? args.target.trim() : undefined;
            const buySpecies = typeof args.buySpecies === 'string' && args.buySpecies.trim()
              ? (args.buySpecies.trim() as SpeciesId)
              : undefined;
            const feeds = typeof args.feeds === 'string' && args.feeds.trim() ? args.feeds.trim() : undefined;
            const inputs = Array.isArray(args.inputs) ? args.inputs.map((v) => String(v).trim()).filter(Boolean) : undefined;
            const output = typeof args.output === 'string' && args.output.trim() ? args.output.trim() : undefined;
            const items = Array.isArray(args.items) ? args.items.map((v) => String(v).trim()).filter(Boolean) : undefined;
            const habitatId = typeof args.habitat === 'string' && args.habitat.trim() ? args.habitat.trim() : undefined;
            const storeId = typeof args.store === 'string' && args.store.trim() ? args.store.trim() : undefined;
            const dutySites = Array.isArray(args.sites) ? args.sites.map((v) => String(v).trim()).filter(Boolean) : undefined;
            const extractGas = typeof args.extractGas === 'string' && args.extractGas.trim() ? args.extractGas.trim() : undefined;
            const recipes = Array.isArray(args.recipes) ? args.recipes.map((v) => String(v).trim()).filter(Boolean) : undefined;
            const result = buildStructure(
              system, this.game!, id, siteKey, this.now(), undefined, target, buySpecies, feeds, inputs, output, items,
              habitatId, storeId, dutySites, extractGas, recipes,
            );
            this.game = result.state;
            await this.saveGame();
            const extra = id === 'arm'
              ? `\n它会把 ${(inputs ?? []).join('、')} 的散货按槽位顺序搬进 ${output}，${ARM_KG_PER_HOUR} kg/母星时，臂展 ${ARM_RANGE_KM} km。要改线用 genesis_link。`
              : id === 'duty'
                ? (() => {
                    const habitat = result.state.structures.find((s) => s.id === habitatId);
                    const hands = Math.floor((habitat?.awake ?? 0) / RESIDENTS_PER_LABOR);
                    return `\n它会给 ${habitatId} 派 ${hands} 份人手（每 ${RESIDENTS_PER_LABOR} 人一份），收成进 ${storeId}，管 ${(dutySites ?? []).length} 个站点。` +
                      (hands > 0 ? '' : '\n⚠ 这座居所现在没人醒着——先叫醒他们，班组才上工。要改绑定用 genesis_duty。');
                  })()
                : id === 'carrier'
                  ? '\n它现在是空的：货舱 300 kg、20 袋位、6 个挂载位。子建筑的 site 写 carrier:<母舰 id>；叫醒人时把它当 structureId。'
                  : id === 'habitat'
                ? (() => {
                    const site = result.state.sites.find((entry) => entry.key === siteKey);
                    if (!site) return '';
                    const probe = { id: 'pending-habitat', kind: 'habitat' as const, siteKey, planetIndex: site.planetIndex, builtHomeHours: 0 };
                    const interior = habitatInteriorC(system, result.state, probe, this.now());
                    const ok = interior >= HABITAT_COMFORT_C.min && interior <= HABITAT_COMFORT_C.max;
                    return ok
                      ? `\n这里室内大约 ${Math.round(interior)}℃，人住得下。`
                      : `\n⚠ 这里室内大约 ${Math.round(interior)}℃——人只接受 ${HABITAT_COMFORT_C.min}–${HABITAT_COMFORT_C.max}℃，叫醒他们之前得挪地方，或者先把群系改过来。`;
                  })()
                : '';
            return `${result.text}${extra}\n${this.energyLine(result.state)}`;
          }
          if (id === 'drone_cluster') {
            const siteKey = await this.siteForBuild(system, args.site);
            const serves = String(args.serves ?? '').trim();
            const result = buildStructure(system, this.game!, 'drone_cluster', siteKey, this.now(), serves);
            this.game = result.state;
            await this.saveGame();
            return `${result.text}\n现在只要在同一个行星上，就能用 100 kJ/kg 远程调这个仓库。\n${this.energyLine(result.state)}`;
          }
          if (id === 'realism') {
            const siteKey = await this.siteForBuild(system, args.site);
            const result = installCore(game, 'realism', siteKey);
            this.game = result.state;
            await this.saveGame();
            return `${result.text}\n${this.energyLine(result.state)}`;
          }
          if (id === 'setpoint') {
            const siteKey = this.resolveSite(game, args.site);
            const raw = typeof args.tempC === 'number' ? args.tempC : null;
            const result = setGreenhouseTarget(game, raw, siteKey);
            this.game = result.state;
            await this.saveGame();
            return result.text;
          }
        if (id === 'cooler' || id === 'heater') {
            const siteKey = this.resolveSite(game, args.site);
            const result = installCore(game, id, siteKey);
            this.game = result.state;
            await this.saveGame();
            return `${result.text}\n${this.energyLine(result.state)}`;
          }
        } catch (error) {
          return { text: error instanceof Error ? error.message : String(error), failed: true };
        }
        return {
          text: 'id 只能是 monitor / counter / sail / greenhouse / biome_changer / cooler / heater / pump / warehouse / drone_cluster / rocket / kiln / purifier / sealer / atmo_extractor / habitat / mutation_room / cold_store / inert_room / realism / setpoint / miner / rectifier。',
          failed: true,
        };
      },
    };
  }

  private sunTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[8]!,
      handler: async () => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        const { system, game } = ready;
        const note = this.transitNote(game);
        if (note) return note;
        const loc = game.location;
        if (!loc) return { text: '还不知道自己在哪。', failed: true };
        const sun = sunAt(system, game, this.now(), loc.latDeg, loc.lonDeg);
        return `太阳：高度角 ${sun.altitudeDeg.toFixed(1)}°，方位角 ${sun.azimuthDeg.toFixed(1)}°，` +
          `当地太阳时 ${sun.localSolarHours.toFixed(2)} 点，${sun.isDay ? '白天' : '夜里'}。\n` +
          `（0 时是开局那个经纬度的午夜；换到别处或换颗星以后，0 时不一定还是午夜——判断昼夜看这里的太阳高度角。）`;
      },
    };
  }

  private transitTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[9]!,
      handler: async () => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        const { system, game } = ready;
        const label = transitLabel(system, game);
        if (!label) return '未安装凌日计数器。';
        return `你在${label}。`;
      },
    };
  }

  /** 当前脚下最近的站点（没有就 null）。 */
  /**
   * 脚下这座站点：只认当前所在的那一格（5° × 5° ≈ 555 km）。
   * 以前找不到就退到「同一颗行星上最近的一座」——于是人在别处建东西，
   * 建筑会静悄悄落在开局的那座站点上。宁可报错让人先建站点，也不要建错地方。
   */
  private currentSiteKey(game: GameState): string | null {
    const loc = game.location;
    if (!loc) return null;
    const key = siteKeyOf(loc.planetIndex, loc.latDeg, loc.lonDeg);
    return game.sites.some((s) => s.key === key) ? key : null;
  }

  private resolveSite(game: GameState, raw: unknown): string {
    const asked = String(raw ?? '').trim();
    if (asked) {
      if (asked.startsWith('planter:')) {
        const id = asked.slice('planter:'.length);
        if (!game.structures.some((s) => s.kind === 'planter' && s.id === id)) throw new Error(`没有这只种植盆：${id}`);
        return asked;
      }
      if (!game.sites.some((s) => s.key === asked)) throw new Error(`没有这个站点：${asked}`);
      return asked;
    }
    const here = this.currentSiteKey(game);
    if (!here) throw new Error('你脚下还没有站点，先用 genesis_site 建一个。');
    return here;
  }

  /**
   * 建造用站点：脚下没有站点，就当场按 genesis_site 那套规则建一座。
   * 以前这里会退到「同一颗行星上最近的一座站点」，人在别处建东西，
   * 建筑就静悄悄落回开局那座站点——现在宁可顺手建一座新的。
   */
  private async siteForBuild(system: StarSystem, raw: unknown): Promise<string> {
    const game = this.game!;
    try {
      return this.resolveSite(game, raw);
    } catch (error) {
      if (!String((error as Error).message).includes('还没有站点')) throw error;
      if (!game.location) throw new Error('还不知道自己在哪。');
      const found = foundSite(system, game, game.location.latDeg, game.location.lonDeg, this.now());
      this.game = found.state;
      await this.saveGame();
      return siteKeyOf(game.location.planetIndex, game.location.latDeg, game.location.lonDeg);
    }
  }

  private floraLines(game: GameState, only?: string): string {
    const sites = only ? game.sites.filter((s) => s.key === only) : game.sites;
    if (sites.length === 0) return '还没有站点。用 genesis_site 在脚下建一个，再用 genesis_plant 把种子种下去。';
    const lines: string[] = [];
    for (const site of sites) {
      const plants = game.plants[site.key] ?? [];
      const ripe = plants.filter((p) => p.stage === 'ripe').length;
      lines.push(`【${site.key}】${site.kind === 'water' ? '水边湿地' : '旱地'}，${plants.length} 株/群（可收 ${ripe}）`);
      for (const plant of plants) {
        const spec = SPECIES[plant.species];
        lines.push(
          `  ${plant.id} · ${spec.name} · ${(plant.progress * 100).toFixed(0)}%` +
            `${plant.stage === 'ripe' ? ' · 能收了' : ''} · 健康 ${plant.health}${plant.stress ? '（应激）' : ''} · ${plant.biomassKg} kg`,
        );
      }
    }
    lines.push(this.inventoryLine(game));
    if (game.seedBags.length > 0) {
      lines.push(`种子袋：${game.seedBags.map((b) => `${b.id}（${speciesTempLabel(b.species)} ×${b.count}${b.premium ? '，高级' : ''}）`).join('、')}`);
    }
    return lines.join('\n');
  }

  private inventoryLine(game: GameState): string {
    const parts = Object.entries(game.inventory)
      .filter(([, n]) => n > 0)
      .map(([k, n]) => `${k === 'survey' ? '测绘数据' : RESOURCE_LABELS[k as keyof typeof RESOURCE_LABELS]} ${n}`);
    return `仓库：${parts.length > 0 ? parts.join('、') : '空'} · ${game.credits} 信用点（${creditTier(game.credits).label}）· ${Math.floor(game.energyKj)} kJ`;
  }

  private shopLines(system: StarSystem, game: GameState): string {
    const hours = nowPlanetHours(game, this.now());
    const planet = homePlanetOf(system, game);
    const level = game.upgrades.telescope;
    const open = shopOpen(hours, level);
    const table = sellPriceTable(dayIndexOf(hours), level);
    const lines = [
      level === 0
        ? `商人在${displayName(game, planet.id)}？不——母星上还没有商店。【射电望远镜阵列】还没修好，星际商人听不到你的信号（genesis_upgrade 传 id: "telescope"）。`
        : `商人在${displayName(game, planet.id)}，${open ? '正在营业' : '现在不在'}——${telescopeWindow(level)}。`,
      this.inventoryLine(game),
      '【收】' + table.map((g) => `${g.name} ${g.price} 信用点/${g.unit}（今天最多 ${Number.isFinite(g.limit) ? g.limit : '不限'} ${g.unit}）`).join('；') +
        '。今天的价会±15% 浮动。',
      '【卖】' +
        BUY_GOODS.map((g) =>
          g.stub
            ? `${g.name}：这条贸易线还没开通`
            : g.currency === 'kj'
              ? `${g.name}（${g.note}）`
              : `${g.name}（要余额 ${g.minCredits}，每天 ${g.dailyLimit} 袋）`,
        ).join('；'),
    ];
    if (game.seedBags.length > 0) {
      lines.push(`种子袋：${game.seedBags.map((b) => `${b.id}（${speciesTempLabel(b.species)} ×${b.count}）`).join('、')}`);
    }
    return lines.join('\n');
  }

  private shopTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[10]!,
      handler: async (args) => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        const { system, game } = ready;
        const note = this.transitNote(game);
        if (note) return note;
        const sell = String(args.sell ?? '').trim();
        if (!sell) return this.shopLines(system, game);
        try {
          const result = sellToMerchant(game, sell as never, Number(args.amount ?? 1), this.now());
          this.game = result.state;
          await this.saveGame();
          return `${result.text}\n${this.shopLines(system, result.state)}`;
        } catch (error) {
          return { text: error instanceof Error ? error.message : String(error), failed: true };
        }
      },
    };
  }

  private buyTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[11]!,
      handler: async (args) => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        const { system, game } = ready;
        const note = this.transitNote(game);
        if (note) return note;
        const kind = String(args.kind ?? '');
        if (kind === 'giant_plant') return { text: '这条贸易线还没开通。', failed: true };
        if (kind === 'cylinder') {
          const count = Math.max(1, Math.floor(Number(args.count ?? 1)));
          try {
            const bought = buyCylinders(game, count, this.now());
            this.game = bought.state;
            await this.saveGame();
            return `${bought.text}\n${this.inventoryLine(bought.state)}`;
          } catch (error) {
            return { text: error instanceof Error ? error.message : String(error), failed: true };
          }
        }
        if (kind === 'fertilizer') {
          const kg = typeof args.kg === 'number' && args.kg > 0 ? args.kg : 5;
          try {
            const bought = buyFertilizer(game, kg, this.now());
            this.game = bought.state;
            await this.saveGame();
            return bought.text + '\n' + this.inventoryLine(bought.state);
          } catch (error) {
            return { text: error instanceof Error ? error.message : String(error), failed: true };
          }
        }
        if (kind === 'broadcast_tourism' || kind === 'broadcast_tech') {
          try {
            const bought = buyCharter(game, kind === 'broadcast_tourism' ? 'tourism' : 'tech', this.now());
            this.game = bought.state;
            await this.saveGame();
            return bought.text;
          } catch (error) {
            return { text: error instanceof Error ? error.message : String(error), failed: true };
          }
        }
        if (kind === 'chart') {
          try {
            const bought = buyChart(system, game, this.now());
            this.game = bought.state;
            await this.saveGame();
            return bought.text;
          } catch (error) {
            return { text: error instanceof Error ? error.message : String(error), failed: true };
          }
        }
        if (kind === 'energy' || kind === 'tungsten') {
          try {
            const bought = buyMerchandise(game, kind, this.now());
            this.game = bought.state;
            await this.saveGame();
            return `${bought.text}\n${this.inventoryLine(bought.state)}`;
          } catch (error) {
            return { text: error instanceof Error ? error.message : String(error), failed: true };
          }
        }
        if (kind !== 'random' && kind !== 'premium') {
          return { text: 'kind 只能是 random、premium、cylinder、energy、tungsten、chart、giant_plant、broadcast_tourism 或 broadcast_tech。', failed: true };
        }
        const species = String(args.species ?? 'grass') as SpeciesId;
        if (!SPECIES[species]) return { text: `没有这种植物：${species}`, failed: true };
        try {
          const result = buySeeds(game, kind, species, this.now());
          this.game = result.state;
          await this.saveGame();
          return `${result.text}\n${this.inventoryLine(result.state)}`;
        } catch (error) {
          return { text: error instanceof Error ? error.message : String(error), failed: true };
        }
      },
    };
  }

  private surveyTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[12]!,
      handler: async (args) => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        const { game } = ready;
        const note = this.transitNote(game);
        if (note) return note;
        try {
          const siteKey = this.resolveSite(game, args.site);
          const system = await this.readSystem();
          if (!system) return { text: '还没有创世。', failed: true };
          const result = surveySite(system, game, siteKey, this.now());
          this.game = result.state;
          await this.saveGame();
          return `${result.text}\n${this.inventoryLine(result.state)}`;
        } catch (error) {
          return { text: error instanceof Error ? error.message : String(error), failed: true };
        }
      },
    };
  }

  private siteTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[13]!,
      handler: async (args) => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        const { system, game } = ready;
        const note = this.transitNote(game);
        if (note) return note;
        const loc = game.location;
        if (!loc) return { text: '还不知道自己在哪。', failed: true };
        const lat = typeof args.lat === 'number' ? args.lat : loc.latDeg;
        const lon = typeof args.lon === 'number' ? args.lon : loc.lonDeg;
        try {
          const result = foundSite(system, game, lat, lon, this.now());
          this.game = result.state;
          await this.saveGame();
          return result.text;
        } catch (error) {
          return { text: error instanceof Error ? error.message : String(error), failed: true };
        }
      },
    };
  }

  private plantTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[14]!,
      handler: async (args) => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        const { system, game } = ready;
        const note = this.transitNote(game);
        if (note) return note;
        const bag = String(args.bag ?? '').trim();
        if (!bag) return { text: '要种哪一袋？种子袋的 id 在 genesis_shop / genesis_flora 里能看到。', failed: true };
        try {
          const siteKey = this.resolveSite(game, args.site);
          const count = typeof args.count === 'number' ? args.count : 5;
          const result = sowAt(system, game, siteKey, bag, count, this.now());
          this.game = result.state;
          await this.saveGame();
          return `${result.text}\n${this.floraLines(result.state, siteKey)}`;
        } catch (error) {
          return { text: error instanceof Error ? error.message : String(error), failed: true };
        }
      },
    };
  }

  private floraTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[15]!,
      handler: async (args) => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        const { game } = ready;
        const only = String(args.site ?? '').trim() || undefined;
        if (only && !game.sites.some((s) => s.key === only)) return { text: `没有这个站点：${only}`, failed: true };
        return this.floraLines(game, only);
      },
    };
  }

  private harvestTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[16]!,
      handler: async (args) => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        const { system, game } = ready;
        const note = this.transitNote(game);
        if (note) return note;
        const plantId = String(args.plant ?? '').trim();
        if (!plantId) return { text: '要收哪一株/哪一群？', failed: true };
        const asked = String(args.site ?? '').trim();
        const siteKey = asked || game.sites.find((s) => (game.plants[s.key] ?? []).some((p) => p.id === plantId))?.key;
        if (!siteKey) return { text: `找不到这株作物：${plantId}`, failed: true };
        try {
          const result = harvestAt(system, game, siteKey, plantId);
          this.game = result.state;
          await this.saveGame();
          return `${result.text}\n${this.inventoryLine(result.state)}`;
        } catch (error) {
          return { text: error instanceof Error ? error.message : String(error), failed: true };
        }
      },
    };
  }

  private burnTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[17]!,
      handler: async () => {
        return {
          text:
            '背包里不能直接烧生物质了——燃料得喂给【火力发电站】：先 genesis_install 传 id: "fire" 建一座（8,000 kJ + 1 份钨），再把生物质、纤维、木炭或干粮放进它的燃料仓，它每母星时烧 40 kg、灰进自带灰仓。',
          failed: true,
        };
      },
    };
  }

  private async floraAction(method: string, args: unknown[]): Promise<GenesisPanelState> {
    await this.sync();
    const system = this.system;
    const game = this.game;
    if (!system || !game) throw new Error('还没有创世。');
    try {
      let next: { state: GameState; text: string } | null = null;
      if (method === 'sell') {
        next = sellToMerchant(game, String(args[0]) as never, Number(args[1] ?? 1), this.now());
      } else if (method === 'site') {
        const loc = game.location;
        if (!loc) throw new Error('还不知道自己在哪。');
        next = foundSite(system, game, loc.latDeg, loc.lonDeg, this.now());
      } else if (method === 'plant') {
        next = sowAt(system, game, this.resolveSite(game, args[1]), String(args[0]), 5, this.now());
      } else if (method === 'harvest') {
        const raw = String(args[0] ?? '');
        let site: string | undefined;
        let plantId = raw;
        if (raw.includes('@')) {
          site = raw;
          plantId = (game.plants[raw] ?? []).find((p) => p.stage === 'ripe')?.id ?? '';
          if (!plantId) throw new Error(`${raw} 现在没有能收的作物。`);
        } else {
          const asked = String(args[1] ?? '').trim();
          site = asked
            || (raw.startsWith('planter:') ? raw : undefined)
            || game.sites.find((s) => (game.plants[s.key] ?? []).some((p) => p.id === raw))?.key;
        }
        if (!site) throw new Error(`找不到这株作物：${plantId}`);
        next = harvestAt(system, game, site, plantId);
      } else if (method === 'transplant') {
        const plantId = String(args[0] ?? '').trim();
        if (!plantId) throw new Error('要移栽哪一株/哪一群？');
        const asked = String(args[1] ?? '').trim();
        const site =
          asked ||
          Object.keys(game.plants).find((key) => (game.plants[key] ?? []).some((p) => p.id === plantId));
        if (!site) throw new Error(`找不到这株作物：${plantId}`);
        next = transplantAt(game, site, plantId);
      } else if (method === 'remove') {
        const plantId = String(args[0] ?? '').trim();
        if (!plantId) throw new Error('要拔掉哪一株/哪一群？');
        const asked = String(args[1] ?? '').trim();
        const site =
          asked ||
          Object.keys(game.plants).find((key) => (game.plants[key] ?? []).some((p) => p.id === plantId));
        if (!site) throw new Error(`找不到这株作物：${plantId}`);
        next = removePlant(game, site, plantId);
      } else if (method === 'breed') {
        const found = this.findPlant(game, args[0], args[1]);
        const partner = typeof args[2] === 'string' ? args[2] : undefined;
        next = breedAt(game, found.siteKey, found.plant.id, partner ? 'cross' : 'self', partner);
      } else if (method === 'algae') {
        const found = this.findPlant(game, args[0]);
        const target = this.resolveSite(game, args[1]);
        next = applyAlgae(system, game, target, found.siteKey, found.plant.id);
      } else if (method === 'inspect') {
        const found = this.findPlant(game, args[0], args[1]);
        const { climate, label } = this.climateForPlant(game, system, found.siteKey);
        return { text: inspectPlantText(found.plant, climate, label) } as never;
      } else if (method === 'burn') {
        next = burnBiomass(game, Number(args[0] ?? 0));
      } else if (method === 'build') {
        // 面板发的是 [{ kind, site? }]；早期调用方发的是 [kind, siteKey]。两种都收。
        const payload = args[0];
        const askedKind =
          payload && typeof payload === 'object'
            ? (payload as { kind?: unknown }).kind
            : payload;
        const askedSite =
          payload && typeof payload === 'object'
            ? (payload as { site?: unknown }).site
            : args[1];
        const kind = String(askedKind ?? '').trim();
        if (!Object.prototype.hasOwnProperty.call(BUILD_SPECS, kind)) {
          throw new Error(`不认识的建筑：${kind || '(空)'}——先在建造下拉里挑一个。`);
        }
        next = buildStructure(
          system,
          game,
          kind as StructureRecord['kind'],
          this.resolveSite(game, typeof askedSite === 'string' ? askedSite : undefined),
          this.now(),
        );
      }
      if (next) {
        this.game = next.state;
        await this.saveGame();
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
    return this.panelState();
  }

  /** 仓库/火箭：存、取、拆、以及一张总览。 */
  private storeTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[19]!,
      handler: async (args) => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        const { game } = ready;
        const action = String(args.action ?? '').trim();
        try {
          if (action === 'list') return this.storeList(game);
          if (action === 'grid') {
            return { text: this.gridLine(game) };
          }
          if (action === 'grid_in' || action === 'grid_out') {
            const kj = typeof args.kj === 'number' ? args.kj : GRID_TAP_KJ_PER_CALL;
            const moved = transferGridEnergy(this.system!, game, this.now(), action === 'grid_in' ? 'in' : 'out', kj);
            this.game = moved.state;
            await this.saveGame();
            return { text: moved.text + '\n\n' + this.gridLine(this.game) };
          }
          if (action === 'dry') {
            const siteKey = this.resolveSite(game, args.site);
            const kg = typeof args.kg === 'number' ? args.kg : 10;
            const result = dryFood(game, siteKey, kg);
            this.game = result.state;
            await this.saveGame();
            return result.text + '\n\n' + this.storeList(this.game);
          }
          if (action === 'fertilize') {
            const siteKey = this.resolveSite(game, args.site);
            const kg = typeof args.kg === 'number' && args.kg > 0 ? args.kg : 1;
            try {
              const put = applyFertilizer(this.system!, game, siteKey, kg);
              this.game = put.state;
              await this.saveGame();
              return put.text;
            } catch (error) {
              return { text: error instanceof Error ? error.message : String(error), failed: true };
            }
          }
          if (action === 'use') {
            const resource = String(args.resource ?? '').trim();
            const amount = typeof args.kg === 'number' && args.kg > 0 ? Math.floor(args.kg) : 1;
            const siteKey = this.resolveSite(game, undefined);
            try {
              const used = useCanned(game, siteKey, resource, amount);
              this.game = used.state;
              await this.saveGame();
              return used.text;
            } catch (error) {
              return { text: error instanceof Error ? error.message : String(error), failed: true };
            }
          }
          const building = String(args.building ?? '').trim();
          if (!building) return { text: '要指定 building（仓库或火箭的建筑 id；用 action: "list" 先看有哪些）。', failed: true };
          if (action === 'bags') {
            const container = game.structures.find((s) => s.id === building);
            if (!container || containerBagSlots(container) === 0) {
              return { text: `${building} 不是能装种子的容器：仓库、冷库、惰性气体室和交易终端才有袋位。`, failed: true };
            }
            const bags = bagsInContainer(game, building);
            const label = container.kind === 'terminal' ? '终端缓冲' : `${BUILD_SPECS[container.kind].label}里的种子`;
            if (bags.length === 0) {
              return {
                text: `${label}是空的（0/${CONTAINER_BAG_SLOTS} 袋）。${container.kind === 'terminal' ? '装上 buySpecies 或让商人送种子过来。' : '用机械臂或手动 deposit 把袋子放进来。'}`,
              };
            }
            const lines = bags.map(
              (b, i) => `  ${i + 1}. ${b.premium ? '高级' : '随机'}${speciesTempLabel(b.species)} ×${b.count} 粒（${b.id}，${bagWeightKg(b).toFixed(3)} kg）`,
            );
            return { text: `${label}（${bags.length}/${CONTAINER_BAG_SLOTS} 袋）：\n${lines.join('\n')}\n取一袋：action: "take"，building 传这个容器 id，bag 传括号里的 id。` };
          }
          if (action === 'take') {
            const bagId = typeof args.bag === 'string' && args.bag.trim() ? args.bag.trim() : undefined;
            let result: { state: typeof game; text: string };
            try {
              result = takeBagFromContainer(game, building, bagId);
            } catch (error) {
              return { text: error instanceof Error ? error.message : String(error), failed: true };
            }
            this.game = result.state;
            await this.saveGame();
            return result.text;
          }
          if (action === 'demolish') {
            const text = demolishStructure(game, building);
            const structures = game.structures.filter((s) => s.id !== building);
            const stores = { ...game.stores };
            delete stores[building];
            this.game = { ...game, structures, stores };
            await this.saveGame();
            return text;
          }
          const resource = String(args.resource ?? '').trim();
          const kg = Number(args.kg);
          if (!resource) return { text: '要指定 resource（例如 biomass / ash / survey）。', failed: true };
          if (!Number.isFinite(kg) || kg <= 0) return { text: 'kg 要是大于 0 的数字。', failed: true };
          const result = action === 'deposit'
            ? depositTo(game, building, resource, kg)
            : action === 'withdraw'
              ? withdrawFrom(game, building, resource, kg)
              : null;
          if (!result) return { text: 'action 只能是 deposit / withdraw / demolish / list。', failed: true };
          this.game = result.state;
          await this.saveGame();
          return `${result.text}\n\n${this.storeList(result.state)}`;
        } catch (error) {
          return { text: error instanceof Error ? error.message : String(error), failed: true };
        }
      },
    };
  }

  /** 所有容器的一行摘要：id、位置、装了什么、还剩多少空间。 */
  private storeList(game: GameState): string {
    const containers = game.structures.filter((s) => storeCapacityKg(s) > 0);
    const pod = game.stores[SHIP_POD_ID] ?? {};
    const lines = [
      `背包：${this.inventoryLine(game)}`,
      `着陆舱【pod】：粮 ${round3(pod.biomass ?? 0)} / ${POD_CAPACITY.biomass} kg、水 ${round3(pod.water_drink ?? 0)} / ${POD_CAPACITY.water_drink} L、氧 ${round3(pod.oxygen ?? 0)} / ${POD_CAPACITY.oxygen} kg（睡着的人先吃它；补舱用 deposit building: "pod"）`,
    ];
    if (containers.length === 0) {
      lines.push('（还没有仓库或火箭。仓库用 genesis_install id: "warehouse" 建在陆地站点上。）');
      return lines.join('\n');
    }
    for (const c of containers) {
      const store = game.stores[c.id] ?? {};
      const used = storeWeightKg(store);
      const cap = storeCapacityKg(c);
      const stuff = Object.entries(store).map(([k, v]) => `${RESOURCE_LABELS[k as keyof typeof RESOURCE_LABELS] ?? k} ${v} kg`).join('、') || '空的';
      const where = c.kind === 'rocket' ? `停在 p${c.dockedPlanetIndex ?? c.planetIndex}` : c.siteKey;
      const drone = game.structures.some((s) => s.kind === 'drone_cluster' && s.serves === c.id) ? ' · 有无人机集群' : '';
      lines.push(`【${c.id}】${where}${drone}：${stuff}（${used} / ${cap} kg）`);
    }
    return lines.join('\n');
  }

  /** 升级与维修的材料表：建筑/作物用 genesis_info 单条查，这里只管「船上那些设备要什么」。 */
  private recipesTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[20]!,
      handler: async () => {
        const ready = await this.readyState();
        if ('error' in ready) {
          return { text: '还没有创世：先 genesis_create，升级材料要按这一局的等级算。', failed: true };
        }
        await this.sync();
        const cards = ((this.upgradeState() as { cards: unknown[] }).cards ?? []) as Array<{
          id: string;
          label: string;
          status: string;
          costKj: number;
          buildHours: number;
          materials: Array<{ name: string; needKg: number; haveKg: number }>;
          canRepair: boolean;
          blockers: string[];
          level?: number;
          maxLevel?: number;
          benefits?: string;
        }>;
        const lines = ['升级与维修（造价 · 耗时 · 材料；括号里是「现有」）：'];
        for (const card of cards) {
          const level = card.level !== undefined && card.maxLevel !== undefined ? ` · lv ${card.level}/${card.maxLevel}` : '';
          const price = card.status === 'maxed' ? '已满级' : `${card.costKj.toLocaleString('en-US')} kJ · ${card.buildHours} 母星时`;
          lines.push(`- ${card.label}（id: "${card.id}"）${level}：${price}`);
          const mats = card.materials
            .map((m) => `${m.name} ${m.needKg}${m.needKg > m.haveKg ? `（现有 ${m.haveKg}）` : ''}`)
            .join(' · ');
          if (mats) lines.push(`    材料：${mats}`);
          if (!card.canRepair && card.blockers.length > 0) lines.push(`    还差：${card.blockers.join('；')}`);
          if (card.benefits) lines.push(`    效果：${card.benefits}`);
        }
        lines.push('', '开工用 genesis_upgrade { id }。建筑造价与作物参数用 genesis_info 单条查（例：genesis_info { query: "温室" }）。');
        return { text: lines.join('\n') };
      },
    };
  }
  /** 此刻、这里，一段话。 */
  private lookTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[21]!,
      handler: async () => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        try {
          this.game = ready.game;
          return this.withWildlife(ready.system, lookAround(ready.system, ready.game, this.now()).text);
        } catch (error) {
          return { text: errorText(error), failed: true };
        }
      },
    };
  }

  /** 原地等：按 1 母星时步进，事件逐条收。 */
  private waitTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[22]!,
      handler: async (args) => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        const hours = typeof args.hours === 'number' ? args.hours : undefined;
        const until = typeof args.until === 'string' ? (args.until as WaitUntil) : undefined;
        try {
          const result = waitFor(ready.system, ready.game, this.now(), { hours, until });
          this.game = result.state;
          await this.saveGame();
          for (const event of result.events) await this.push(event.type, event.text);
          const realHours = (result.advancedHomeHours * result.state.msPerPlanetHour) / REAL_MS_PER_HOUR;
          const lines = [
            `等了 ${result.advancedHomeHours.toFixed(1)} 母星时（现实约 ${realHours.toFixed(1)} 小时）。${result.reason}`,
          ];
          if (result.events.length > 0) {
            lines.push('', '期间发生：', ...result.events.map((e) => `- ${e.text}`));
          }
          lines.push('', this.timeLine(this.game));
          try {
            lines.push('', lookAround(ready.system, this.game!, this.now()).text);
          } catch {
            // 移动途中看不了环境，timeLine 已经说了在移动。
          }
          return lines.join('\n');
        } catch (error) {
          return { text: errorText(error), failed: true };
        }
      },
    };
  }

  /** 船上的升级：列清单，或修机动核心 / 射电望远镜阵列。 */
  private upgradeTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[23]!,
      handler: async (args) => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        const id = typeof args.id === 'string' ? args.id : '';
        if (!id) return this.upgradeListText(ready.game);
        try {
          const result =
            id === 'mobility_core'
              ? beginMobilityRepair(ready.game, this.now())
              : id === 'telescope'
                ? beginTelescopeUpgrade(ready.game, this.now())
                : id === 'spark_plug'
                  ? beginSparkPlugUpgrade(ready.game, this.now())
                  : id === 'battery'
                    ? beginBatteryUpgrade(ready.game, this.now())
                    : id === 'subagent'
                      ? beginSubagentUpgrade(ready.game, this.now())
                      : id === 'blueprints'
                        ? beginBlueprintsUpgrade(ready.game, this.now())
                        : id === 'spectrometer'
                          ? beginSpectrometerUpgrade(ready.game, this.now())
                          : null;
          if (!result) return { text: `船上没有这个可升级的东西：${id}（能修的是 mobility_core / telescope / spark_plug / battery / subagent / blueprints / spectrometer）。`, failed: true };
          this.game = result.state;
          await this.saveGame();
          return result.text;
        } catch (error) {
          return { text: errorText(error), failed: true };
        }
      },
    };
  }

  private upgradeListText(game: GameState): string {
    const lines = ['船上能修的东西：'];

    const repairingCore = game.builds.find((b) => b.kind === 'mobility_core');
    if (mobilityCoreReady(game)) {
      lines.push('- 机动核心：已经修好了。海面能过，气态行星的大气也能进。');
    } else if (repairingCore) {
      const left = Math.max(0, repairingCore.completeHomeHours - nowPlanetHours(game, this.now()));
      lines.push(`- 机动核心：正在修，还剩 ${left.toFixed(1)} 母星时。`);
    } else {
      lines.push('- 机动核心：烧坏了。海面过不去，气态行星的大气也进不去。');
      lines.push(`  要修它：${MOBILITY_CORE_COST_KJ.toLocaleString('en-US')} kJ，加上 ` +
        mobilityCoreMaterials(game).map((m) => `${m.name} ${m.needKg} kg（现有 ${m.haveKg} kg）`).join('、') +
        '，耗时 0.5 母星时。');
      lines.push(`  能量：${Math.floor(game.energyKj).toLocaleString('en-US')} kJ。` +
        (canRepairMobilityCore(game) ? '够了——genesis_upgrade 传 id: "mobility_core" 就能开工。' : '还不够。'));
    }

    const telescope = telescopeCard(game);
    const repairingScope = game.builds.find((b) => b.kind === 'telescope');
    lines.push('');
    if (telescope.level === 0) {
      lines.push('- 射电望远镜阵列：还没修好，所以母星上没有商店，星际商人听不到你的信号。');
    } else {
      lines.push(`- 射电望远镜阵列：lv${telescope.level} / lv${telescope.maxLevel}。${telescope.window}`);
    }
    if (repairingScope) {
      const left = Math.max(0, repairingScope.completeHomeHours - nowPlanetHours(game, this.now()));
      lines.push(`  正在修下一级，还剩 ${left.toFixed(1)} 母星时。`);
    } else if (telescope.next) {
      const next = telescope.next;
      lines.push(`  修到 lv${next.level}：${next.costKj.toLocaleString('en-US')} kJ，加上 ` +
        telescope.materials.map((m) => `${m.name} ${m.needKg} kg（现有 ${m.haveKg} kg）`).join('、') +
        `，耗时 ${next.homeHours} 母星时。收益：${next.summary}`);
      lines.push('  ' + (telescope.canBuild
        ? '够了——genesis_upgrade 传 id: "telescope" 就能开工。'
        : telescope.blockers.join(' ')));
    } else {
      lines.push('  已经到顶（lv3），没有下一级了。');
    }

    const spark = sparkPlugCard(game, this.now());
    const repairingSpark = game.builds.find((b) => b.kind === 'spark_plug');
    lines.push('');
    lines.push(`- 火花塞：lv${spark.level} / lv${spark.maxLevel}，人类手摇一次 ${spark.outputKj} kJ。`);
    if (repairingSpark) {
      const left = Math.max(0, repairingSpark.completeHomeHours - nowPlanetHours(game, this.now()));
      lines.push(`  正在修下一级，还剩 ${left.toFixed(1)} 母星时。`);
    } else if (spark.next) {
      const next = spark.next;
      lines.push(`  修到 lv${next.level}：${next.costKj.toLocaleString('en-US')} kJ` +
        (spark.materials.length > 0
          ? `，加上 ${spark.materials.map((m) => `${m.name} ${m.needKg} kg（现有 ${m.haveKg} kg）`).join('、')}`
          : '') +
        `，耗时 ${next.homeHours} 母星时。收益：${next.summary}`);
      lines.push('  ' + (spark.canBuild
        ? '够了——genesis_upgrade 传 id: "spark_plug" 就能开工。'
        : spark.blockers.join(' ')));
    } else {
      lines.push('  已经到顶（lv3），没有下一级了。');
    }

    const battery = batteryCard(game, this.now());
    const repairingBattery = game.builds.find((b) => b.kind === 'battery');
    lines.push('');
    lines.push(`- 蓄电池：lv${battery.level} / lv${battery.maxLevel}，能量上限 ${battery.capacityKj.toLocaleString('en-US')} kJ。`);
    if (repairingBattery) {
      const left = Math.max(0, repairingBattery.completeHomeHours - nowPlanetHours(game, this.now()));
      lines.push(`  正在扩，还剩 ${left.toFixed(1)} 母星时。`);
    } else if (battery.next) {
      const next = battery.next;
      lines.push(`  扩到 lv${next.level}：${next.costKj.toLocaleString('en-US')} kJ` +
        (battery.materials.length > 0
          ? `，加上 ${battery.materials.map((m) => `${m.name} ${m.needKg} kg（现有 ${m.haveKg} kg）`).join('、')}`
          : '') +
        `，耗时 ${next.homeHours} 母星时。收益：${next.summary}`);
      lines.push('  ' + (battery.canBuild
        ? '够了——genesis_upgrade 传 id: "battery" 就能开工。'
        : battery.blockers.join(' ')));
    } else {
      lines.push('  已经到顶（lv3），没有下一级了。');
    }

    const subagent = subagentCard(game, this.now());
    const repairingSub = game.builds.find((b) => b.kind === 'subagent');
    lines.push('');
    lines.push(`- 子代理：lv${subagent.level} / lv${subagent.maxLevel}，现在能同时开 ${buildQueueSlots(game)} 条施工队列。`);
    if (repairingSub) {
      const left = Math.max(0, repairingSub.completeHomeHours - nowPlanetHours(game, this.now()));
      lines.push(`  正在接下一组，还剩 ${left.toFixed(1)} 母星时。`);
    } else if (subagent.next) {
      const next = subagent.next;
      lines.push(`  接到 lv${next.level}：${next.costKj.toLocaleString('en-US')} kJ` +
        (subagent.materials.length > 0
          ? `，加上 ${subagent.materials.map((m) => `${m.name} ${m.needKg} kg（现有 ${m.haveKg} kg）`).join('、')}`
          : '') +
        `，耗时 ${next.homeHours} 母星时。收益：${next.summary}`);
      lines.push('  ' + (subagent.canBuild
        ? '够了——genesis_upgrade 传 id: "subagent" 就能开工。'
        : subagent.blockers.join(' ')));
    } else {
      lines.push('  已经全接上了（lv3），没有下一组了。');
    }

    const plans = blueprintsCard(game, this.now());
    const repairingPlans = game.builds.find((b) => b.kind === 'blueprints');
    lines.push('');
    lines.push(`- 蓝图结构优化：${plans.level > 0 ? '已经优化过，打印机每座建筑省 25% 的钨（1 份的不省）。' : '还没做——做了以后每座建筑省 25% 的钨。'}`);
    if (repairingPlans) {
      const left = Math.max(0, repairingPlans.completeHomeHours - nowPlanetHours(game, this.now()));
      lines.push(`  正在做，还剩 ${left.toFixed(1)} 母星时。`);
    } else if (plans.level === 0) {
      lines.push(`  ${plans.costKj.toLocaleString('en-US')} kJ，加上 ${plans.materials.map((m) => `${m.label} ${m.need}（现有 ${round3(m.have)}）`).join('、')}，耗时 ${plans.homeHours} 母星时。`);
      lines.push('  ' + (plans.canBuild ? '够了——genesis_upgrade 传 id: "blueprints" 就能开工。' : plans.blockers.join(' ')));
    }

    const spec = spectrometerCard(game, this.now());
    const repairingSpec = game.builds.find((b) => b.kind === 'spectrometer');
    lines.push('');
    lines.push(`- 质谱仪：${spec.level > 0 ? '装好了——genesis_veins 能扫附近的钨含量，每 6 母星时一次。' : '还没装——装好才能扫矿、找富矿放采矿机。'}`);
    if (repairingSpec) {
      const left = Math.max(0, repairingSpec.completeHomeHours - nowPlanetHours(game, this.now()));
      lines.push(`  正在装，还剩 ${left.toFixed(1)} 母星时。`);
    } else if (spec.level === 0) {
      lines.push(`  ${spec.costKj.toLocaleString('en-US')} kJ，加上 ${spec.materials.map((m) => `${m.label} ${m.need}（现有 ${round3(m.have)}）`).join('、')}，耗时 ${spec.homeHours} 母星时。`);
      lines.push('  ' + (spec.canBuild ? '够了——genesis_upgrade 传 id: "spectrometer" 就能开工。' : spec.blockers.join(' ')));
    }
    return lines.join('\n');
  }

  /** 升级面板的数据：机动核心 + 射电望远镜阵列 + 火花塞。 */
  private upgradeState(): unknown {
    const game = this.game;
    if (!game) return { locked: true, energyKj: 0, capacityKj: 0, cards: [] };
    const repairingCore = game.builds.find((b) => b.kind === 'mobility_core');
    const telescope = telescopeCard(game);
    const repairingScope = game.builds.find((b) => b.kind === 'telescope');
    const spark = sparkPlugCard(game, this.now());
    const repairingSpark = game.builds.find((b) => b.kind === 'spark_plug');
    const battery = batteryCard(game, this.now());
    const repairingBattery = game.builds.find((b) => b.kind === 'battery');
    const subagent = subagentCard(game, this.now());
    const repairingSub = game.builds.find((b) => b.kind === 'subagent');
    const plans = blueprintsCard(game, this.now());
    const repairingPlans = game.builds.find((b) => b.kind === 'blueprints');
    const spec = spectrometerCard(game, this.now());
    const repairingSpec = game.builds.find((b) => b.kind === 'spectrometer');
    return {
      locked: false,
      capacityKj: batteryCapacityKj(game.upgrades.battery),
      energyKj: Math.round(game.energyKj),
      cards: [
        {
          id: 'mobility_core',
          label: '机动核心',
          status: mobilityCoreReady(game) ? 'ready' : repairingCore ? 'repairing' : 'broken',
          costKj: MOBILITY_CORE_COST_KJ,
          buildHours: 0.5,
          leftHomeHours: repairingCore
            ? Math.max(0, repairingCore.completeHomeHours - nowPlanetHours(game, this.now()))
            : 0,
          materials: mobilityCoreMaterials(game),
          canRepair: canRepairMobilityCore(game),
          blockers: canRepairMobilityCore(game) ? [] : this.mobilityBlockers(game),
          flavor: this.mobilityFlavor(game),
        },
        {
          id: 'telescope',
          label: '射电望远镜阵列',
          status: telescope.level >= telescope.maxLevel ? 'maxed' : repairingScope ? 'repairing' : telescope.level > 0 ? 'ready' : 'broken',
          level: telescope.level,
          maxLevel: telescope.maxLevel,
          window: telescope.window,
          limitFactor: telescope.limitFactor,
          costKj: telescope.next?.costKj ?? 0,
          buildHours: telescope.next?.homeHours ?? 0,
          leftHomeHours: repairingScope
            ? Math.max(0, repairingScope.completeHomeHours - nowPlanetHours(game, this.now()))
            : 0,
          materials: telescope.materials,
          canRepair: telescope.canBuild,
          blockers: telescope.blockers,
          benefits: telescope.next ? telescope.next.summary : '已经到顶：每天 12:00–23:00 营业，每日限额 ×1.7。',
          flavor: this.telescopeFlavor(game),
        },
        {
          id: 'spark_plug',
          label: '火花塞',
          status: spark.level >= spark.maxLevel ? 'maxed' : repairingSpark ? 'repairing' : spark.level > 0 ? 'ready' : 'broken',
          level: spark.level,
          maxLevel: spark.maxLevel,
          costKj: spark.next?.costKj ?? 0,
          buildHours: spark.next?.homeHours ?? 0,
          leftHomeHours: repairingSpark
            ? Math.max(0, repairingSpark.completeHomeHours - nowPlanetHours(game, this.now()))
            : 0,
          materials: spark.materials,
          canRepair: spark.canBuild,
          blockers: spark.blockers,
          benefits: spark.next ? spark.next.summary : `已经到顶：手摇一次 ${spark.outputKj} kJ。`,
          flavor: this.sparkPlugFlavor(game),
        },
        {
          id: 'battery',
          label: '蓄电池',
          status: battery.level >= battery.maxLevel ? 'maxed' : repairingBattery ? 'repairing' : battery.level > 0 ? 'ready' : 'broken',
          level: battery.level,
          maxLevel: battery.maxLevel,
          costKj: battery.next?.costKj ?? 0,
          buildHours: battery.next?.homeHours ?? 0,
          leftHomeHours: repairingBattery
            ? Math.max(0, repairingBattery.completeHomeHours - nowPlanetHours(game, this.now()))
            : 0,
          materials: battery.materials,
          canRepair: battery.canBuild,
          blockers: battery.blockers,
          benefits: battery.next ? battery.next.summary : `已经到顶：上限 ${battery.capacityKj.toLocaleString('en-US')} kJ。`,
          flavor: this.batteryFlavor(game),
        },
        {
          id: 'subagent',
          label: '子代理',
          status: subagent.level >= subagent.maxLevel ? 'maxed' : repairingSub ? 'repairing' : subagent.level > 0 ? 'ready' : 'broken',
          level: subagent.level,
          maxLevel: subagent.maxLevel,
          costKj: subagent.next?.costKj ?? 0,
          buildHours: subagent.next?.homeHours ?? 0,
          leftHomeHours: repairingSub
            ? Math.max(0, repairingSub.completeHomeHours - nowPlanetHours(game, this.now()))
            : 0,
          materials: subagent.materials,
          canRepair: subagent.canBuild,
          blockers: subagent.blockers,
          benefits: subagent.next ? subagent.next.summary : `已经全接上：${buildQueueSlots(game)} 条施工队列。`,
          flavor: this.subagentFlavor(game),
        },
        {
          id: 'blueprints',
          label: '蓝图结构优化',
          status: plans.level > 0 ? 'maxed' : repairingPlans ? 'repairing' : 'broken',
          level: plans.level,
          maxLevel: plans.maxLevel,
          costKj: plans.costKj,
          buildHours: plans.homeHours,
          leftHomeHours: repairingPlans
            ? Math.max(0, repairingPlans.completeHomeHours - nowPlanetHours(game, this.now()))
            : 0,
          materials: plans.materials.map((m) => ({ name: m.label, needKg: m.need, haveKg: round3(m.have) })),
          canRepair: plans.canBuild,
          blockers: plans.blockers,
          benefits: '以后每座建筑少用 25% 的钨（1 份的不省：2→1、3→2、4→3、6→4）。',
          flavor: this.blueprintsFlavor(game),
        },
        {
          id: 'spectrometer',
          label: '质谱仪',
          status: spec.level > 0 ? 'maxed' : repairingSpec ? 'repairing' : 'broken',
          level: spec.level,
          maxLevel: spec.maxLevel,
          costKj: spec.costKj,
          buildHours: spec.homeHours,
          leftHomeHours: repairingSpec
            ? Math.max(0, repairingSpec.completeHomeHours - nowPlanetHours(game, this.now()))
            : 0,
          materials: spec.materials.map((m) => ({ name: m.label, needKg: m.need, haveKg: round3(m.have) })),
          canRepair: spec.canBuild,
          blockers: spec.blockers,
          benefits: '能扫 2,000 km 内的钨含量（每 6 母星时一次），找富矿再放采矿机——富矿一格能挖出好几倍的钨。',
          flavor: this.spectrometerFlavor(game),
        },
      ],
    };
  }

  private spectrometerFlavor(game: GameState): string {
    if (game.builds.some((b) => b.kind === 'spectrometer')) {
      return '探头还在校准。屏幕上一条一条的线，像心电图。';
    }
    if ((game.upgrades.spectrometer ?? 0) > 0) {
      return '探头贴着地面，把地下的金属味翻译成数字。这一片底下有没有东西，现在你看得见了。';
    }
    return '你看不见地底下有什么。采矿机放错了地方，挖的只是一堆普通石头。';
  }

  private blueprintsFlavor(game: GameState): string {
    if (game.builds.some((b) => b.kind === 'blueprints')) {
      return '打印机的图纸在重排。耗子密密麻麻，但你看得懂——少一圈支撑，少半份钨。';
    }
    if ((game.upgrades.blueprints ?? 0) > 0) {
      return '同样的骨架，现在只吃四分之三的料。打印机吐东西的时候，声音都轻了一点。';
    }
    return '打印机每次都在浪费：骨架比需要的更厚。你可以先花时间把图纸改瘦，再动手建。';
  }

  private mobilityBlockers(game: GameState): string[] {    if (mobilityCoreReady(game)) return ['已经修好了。'];
    if (game.builds.length >= buildQueueSlots(game)) return ['施工队列满了，先等一条空出来。'];
    const missing = mobilityCoreMaterials(game).filter((m) => m.haveKg + 1e-9 < m.needKg);
    const blockers = missing.map((m) => `${m.name}还差 ${(m.needKg - m.haveKg).toFixed(2)} kg`);
    if (game.energyKj < MOBILITY_CORE_COST_KJ) {
      blockers.push(`能量还差 ${Math.ceil(MOBILITY_CORE_COST_KJ - game.energyKj).toLocaleString('en-US')} kJ`);
    }
    return blockers;
  }

  private telescopeFlavor(game: GameState): string {
    const level = game.upgrades.telescope;
    if (level === 0) {
      return '阵列基座还在，天线面却塌了大半。你把最后一块配重焊回去，才敢把功率推上去。';
    }
    if (game.builds.some((b) => b.kind === 'telescope')) {
      return '你在校准阵元的相位。远处的杂音里，慢慢浮出一段规律的电波——有人在听。';
    }
    if (level === 1) return '第一天联系上商人：只要两小时的窗口，够了。';
    if (level === 2) return '阵列能撑到傍晚了。商人开始多留一会儿，价钱也肯多让一点。';
    return '整面阵列都在转。现在它可以一直听到深夜——像一艘船终于有了自己的港口。';
  }

  private async repairFromPanel(id: string): Promise<unknown> {
    await this.sync();
    if (!this.game) throw new Error('还没有创世。');
    const result =
      id === 'mobility_core'
        ? beginMobilityRepair(this.game, this.now())
        : id === 'telescope'
          ? beginTelescopeUpgrade(this.game, this.now())
          : id === 'spark_plug'
            ? beginSparkPlugUpgrade(this.game, this.now())
            : id === 'battery'
              ? beginBatteryUpgrade(this.game, this.now())
              : id === 'subagent'
                ? beginSubagentUpgrade(this.game, this.now())
                : id === 'blueprints'
                  ? beginBlueprintsUpgrade(this.game, this.now())
                  : id === 'spectrometer'
                    ? beginSpectrometerUpgrade(this.game, this.now())
                    : null;
    if (!result) throw new Error(`船上没有这个可升级的东西：${id}`);
    this.game = result.state;
    await this.saveGame();
    return this.upgradeState();
  }

  private subagentFlavor(game: GameState): string {
    const level = game.upgrades.subagent;
    if (level === 0) {
      return '施工网上只剩你一条手臂在动。别的子代理都停在半路，灯是暗的——你只能一件一件来。';
    }
    if (game.builds.some((b) => b.kind === 'subagent')) {
      return '你在给一排休眠节点重新上电。灯一盏一盏亮起来，像有人在黑暗里应了你一声。';
    }
    if (level === 1) return '终于有第二只手了：一边等温室，一边还能修别的。';
    if (level === 2) return '三条队列同时在跑。你开始能「安排」而不是「排队」了。';
    return '四条队列全开的时候，船坞里久违地有了动静——像这艘船终于又活过来一点。';
  }

  private batteryFlavor(game: GameState): string {    const level = game.upgrades.battery;
    if (level === 0) {
      return '电池组只剩一层壳。夜里发电机一停，面板上的数字就往下掉——它连一块帆的收成都存不住。';
    }
    if (game.builds.some((b) => b.kind === 'battery')) {
      return '你把新的电芯一排排码进去，旧的那几节烫得厉害。';
    }
    if (level === 1) return '多出来的一格电芯让灯稳住了。上限 300,000 kJ。';
    if (level === 2) return '电池仓扩到了原来的两倍多。上限 700,000 kJ。';
    return '整排电芯安静地亮着。上限 1,500,000 kJ——够它把一台监测器搬上天了。';
  }

  private sparkPlugFlavor(game: GameState): string {
    const level = game.upgrades.sparkPlug;
    if (level === 0) {
      return '手摇曲柄转起来很吃力，火花塞早就烧蚀了——现在一次只有 5 kJ。';
    }
    if (game.builds.some((b) => b.kind === 'spark_plug')) {
      return '你把手伸进发电机的腹腔，旧火花塞还卡在螺纹里。人类的工具比你的手臂细得多。';
    }
    if (level === 1) return '换了新的火花塞，曲柄轻了一点。一次 15 kJ。';
    if (level === 2) return '点火提前角对上了。一次 30 kJ，手背不那么酸了。';
    return '火花塞烧得干净利落。一次 50 kJ——这台机器终于肯替你出力了。';
  }

  /** 剧情：四段，随机动核心的状态推进。 */
  private mobilityFlavor(game: GameState): string {
    if (mobilityCoreReady(game)) {
      return '第一次，你听见了海的声音。船身不再瘸了——从坠地那天起，你一直等着能再飞一次。';
    }
    if (game.builds.some((b) => b.kind === 'mobility_core')) {
      return '你在龙骨里重新接上那几层密封。外面下着雨，船壳在慢慢变冷。';
    }
    const done = mobilityCoreMaterials(game).filter((m) => m.haveKg + 1e-9 >= m.needKg).length;
    if (done > 0) {
      return '外壳还能用，缺的是里面那几层密封。你手里的纤维，正好是它要的。';
    }
    return '船是迫降的。机动核心在坠落时烧穿了外壳，剩下的部分还卡在龙骨里。';
  }

  private guideTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[24]!,
      handler: async (args) => {
        const topic = typeof args.topic === 'string' && args.topic.trim() !== '' ? args.topic.trim() : undefined;
        try {
          return guideText(topic);
        } catch (error) {
          return { text: errorText(error), failed: true };
        }
      },
    };
  }

  private speedTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[40]!,
      handler: async (args: Record<string, unknown>): Promise<{ text: string }> => {
        await this.sync();
        if (!this.game) return { text: '还没有创世：先 genesis_create。' };
        this.game = setSpeed(this.game, Number(args.speed ?? 1), this.now());
        await this.saveGame();
        return {
          text:
            '时间倍速调到了 ' +
            (this.game.speed ?? DEFAULT_SPEED) +
            ' 倍（' +
            MIN_SPEED +
            '–' +
            MAX_SPEED +
            '）。现在一个母星时只花 ' +
            minutesPerHomeHour(this.game).toFixed(2) +
            ' 分钟现实时间。',
        };
      },
    };
  }

  /** 只算「住得下」的访客床位：太热、太冷或没通电的驿站不算。 */
  private lodgeBedsNow(game: GameState): number {
    if (!this.system) return game.structures.filter((s) => s.kind === 'visitor_lodge').length * 30;
    return (
      game.structures.filter(
        (s) => s.kind === 'visitor_lodge' && structurePowered(game, s) && interiorComfortable(structureInteriorC(this.system!, game, s, this.now()), LODGE_COMFORT_C),
      ).length * 30
    );
  }

  /** 只算「住得下」的员工床位。 */
  private housingBedsNow(game: GameState): number {
    if (!this.system) return game.structures.filter((s) => s.kind === 'staff_housing').length * RESIDENTS_PER_LABOR * 4;
    return (
      game.structures.filter(
        (s) => s.kind === 'staff_housing' && structurePowered(game, s) && interiorComfortable(structureInteriorC(this.system!, game, s, this.now()), STAFF_COMFORT_C),
      ).length * 20
    );
  }

  /** 因为太热/太冷而白建的住所，直接说给玩家听。 */
  private tempBlockedNow(game: GameState): string[] {
    if (!this.system) return [];
    const out: string[] = [];
    for (const s of game.structures) {
      if (s.kind !== 'visitor_lodge' && s.kind !== 'staff_housing') continue;
      const inside = structureInteriorC(this.system, game, s, this.now());
      const range = s.kind === 'visitor_lodge' ? LODGE_COMFORT_C : STAFF_COMFORT_C;
      if (interiorComfortable(inside, range)) continue;
      const label = s.kind === 'visitor_lodge' ? '访客驿站' : '员工公寓';
      out.push(label + '（室内 ' + inside + '℃）');
    }
    return out;
  }
  private async speedFromPanel(raw: unknown): Promise<{ text: string; state: unknown }> {
    await this.sync();
    if (!this.game) throw new Error('还没有创世。');
    this.game = setSpeed(this.game, Number(raw ?? 1), this.now());
    await this.saveGame();
    return { text: '时间倍速：' + (this.game.speed ?? DEFAULT_SPEED) + ' 倍。', state: await this.panelState() };
  }

  private wonderTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[41]!,
      handler: async (args: Record<string, unknown>): Promise<{ text: string; failed?: true }> => {
        await this.sync();
        if (!this.game) return { text: '还没有创世：先 genesis_create。' };
        try {
          const started = startWonder(this.game, String(args.id ?? ''), this.now());
          this.game = started.state;
          await this.saveGame();
          return { text: started.text };
        } catch (error) {
          return { text: error instanceof Error ? error.message : String(error), failed: true };
        }
      },
    };
  }

  private infoTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[34]!,
      handler: async (args) => {
        const query = typeof args.query === 'string' ? args.query : '';
        try {
          return infoText(query);
        } catch (error) {
          return { text: errorText(error), failed: true };
        }
      },
    };
  }

  private toolsTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[42]!,
      handler: async (args) => {
        const query = typeof args.query === 'string' && args.query.trim() !== '' ? args.query.trim() : undefined;
        try {
          return toolsSearch(query);
        } catch (error) {
          return { text: errorText(error), failed: true };
        }
      },
    };
  }

  /** 划领地：不传经纬度就按脚下的位置来。 */
  private territoryTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[43]!,
      handler: async (args) => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        const note = this.transitNote(ready.game);
        if (note) return note;
        await this.sync();
        const system = await this.readSystem();
        if (!system || !this.game) return { text: '还没有创世。先 genesis_create。', failed: true };
        const species = String(args.species ?? '').trim();
        const game = this.game;
        const planetIndex = game.homePlanetIndex;
        const lat = typeof args.latDeg === 'number' ? args.latDeg : (game.location?.latDeg ?? 0);
        const lon = typeof args.lonDeg === 'number' ? args.lonDeg : (game.location?.lonDeg ?? 0);
        const radius = typeof args.radiusKm === 'number' ? args.radiusKm : undefined;
        try {
          this.game = {
            ...game,
            territories: setTerritory(game.territories, planetIndex, species, lat, lon, radius ?? PATROL_RADIUS_DEFAULT_KM),
          };
          await this.saveGame();
          const found = territoryFor(this.game.territories, planetIndex, species);
          const label = animalSpecies(species).name;
          return { text: `划好了：${label}在 ${lat.toFixed(1)}°, ${lon.toFixed(1)}° 一带巡逻，半径约 ${found ? found.radiusKm : radius ?? PATROL_RADIUS_DEFAULT_KM} km。它们会赶走别的种类，但走得多、饿得也快。` };
        } catch (error) {
          return { text: errorText(error), failed: true };
        }
      },
    };
  }

  private transplantTool(): ToolDef {
    return this.uprootTool('transplant', 35);
  }

  private removeTool(): ToolDef {
    return this.uprootTool('remove', 39);
  }

  /** 移栽与拔除共用一套「找株 → 动手 → 存盘」；区别只在引擎函数。 */
  private uprootTool(kind: 'transplant' | 'remove', index: number): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[index]!,
      handler: async (args) => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        const note = this.transitNote(ready.game);
        if (note) return note;
        const plantId = String(args.plant ?? '').trim();
        if (!plantId) return { text: '要处理哪一株/哪一群？', failed: true };
        const asked = String(args.site ?? '').trim();
        const siteKey = asked || Object.keys(ready.game.plants).find((key) => (ready.game.plants[key] ?? []).some((p) => p.id === plantId));
        if (!siteKey) return { text: `找不到这株作物：${plantId}`, failed: true };
        try {
          const result =
            kind === 'transplant'
              ? transplantAt(ready.game, siteKey, plantId)
              : removePlant(ready.game, siteKey, plantId);
          this.game = result.state;
          await this.saveGame();
          return result.text;
        } catch (error) {
          return { text: errorText(error), failed: true };
        }
      },
    };
  }

  private protocolTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[25]!,
      handler: async () => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        await this.sync();
        return protocolText(ready.game);
      },
    };
  }

  private ordersTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[26]!,
      handler: async (args) => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        await this.sync();
        const now = this.now();
        const orderId = typeof args.order === 'string' ? args.order.trim() : '';
        try {
          if (orderId !== '') {
            const delivered = deliverOrder(ready.game, orderId, now);
            this.game = delivered.state;
            await this.saveGame();
            return delivered.text;
          }
          const orders = currentOrders(ready.game, now);
          const lines = orders.map((o) => orderText(o, SPECIES[o.species].name));
          return `今天的基因订单（${orders.length} 张）：\n${lines.join('\n')}\n（订单每天刷新。交货用 genesis_orders 带 order。）`;
        } catch (error) {
          return { text: errorText(error), failed: true };
        }
      },
    };
  }

  private mutateTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[27]!,
      handler: async (args) => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        await this.sync();
        const bag = typeof args.bag === 'string' ? args.bag.trim() : '';
        try {
          const mutated = mutateBag(ready.game, bag, this.now());
          this.game = mutated.state;
          await this.saveGame();
          return mutated.text;
        } catch (error) {
          return { text: errorText(error), failed: true };
        }
      },
    };
  }

  private wakeTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[28]!,
      handler: async (args) => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        await this.sync();
        const system = await this.readSystem();
        if (!system || !this.game) return { text: '还没有创世。', failed: true };
        try {
          const woke = wakeHumans(system, this.game, typeof args.habitat === 'string' ? args.habitat : undefined, this.now());
          this.game = woke.state;
          await this.saveGame();
          return woke.text;
        } catch (error) {
          return { text: errorText(error), failed: true };
        }
      },
    };
  }

  private veinsTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[29]!,
      handler: async () => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        await this.sync();
        try {
          const scanned = spectrometerScan(ready.system, this.game!, this.now());
          this.game = scanned.state;
          await this.saveGame();
          return scanned.text;
        } catch (error) {
          return { text: errorText(error), failed: true };
        }
      },
    };
  }

  private routeTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[30]!,
      handler: async (args) => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        await this.sync();
        const game = this.game!;
        const storageId = typeof args.storage === 'string' && args.storage.trim()
          ? args.storage.trim()
          : (game.structures.find((s) => s.kind === 'storage_terminal' && s.planetIndex === game.homePlanetIndex)?.id
            ?? game.structures.find((s) => s.kind === 'storage_terminal')?.id);
        if (!storageId) {
          return { text: '这颗行星上还没有【仓储终端】——先建一座，再编排序号。', failed: true };
        }
        const storageRec = game.structures.find((s) => s.id === storageId)!;
        const planet = storageRec.planetIndex;
        const raw = String(args.container ?? '').trim();
        const container = /^\d+$/.test(raw)
          ? game.structures.find((s) => s.planetIndex === planet && String(s.slot) === raw)
          : game.structures.find((s) => s.id === raw);
        if (!container) {
          const known = game.structures
            .filter((s) => s.planetIndex === planet && s.slot !== undefined)
            .map((s) => `${s.slot}=${s.id}`)
            .join('、');
          return { text: `没有这个容器：${raw}（这颗行星上的槽位：${known || '一个都没有'}）`, failed: true };
        }
        const priority = Number(args.priority);
        try {
          const result = routeContainer(game, storageId, container.id, priority);
          this.game = result.state;
          await this.saveGame();
          const storage = result.state.structures.find((s) => s.id === storageId)!;
          return `${result.text}\n${storageRouteText(result.state, storage)}`;
        } catch (error) {
          return { text: errorText(error), failed: true };
        }
      },
    };
  }

  private linkTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[31]!,
      handler: async (args) => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        await this.sync();
        const game = this.game!;
        const armId = typeof args.id === 'string' && args.id.trim()
          ? args.id.trim()
          : (game.structures.find((s) => s.kind === 'arm' && s.planetIndex === game.homePlanetIndex)?.id
            ?? game.structures.find((s) => s.kind === 'arm')?.id);
        if (!armId) return { text: '这颗行星上还没有【机械臂】——先建一座（genesis_install 传 id: "arm"）。', failed: true };
        const patch: { inputs?: string[]; output?: string; items?: string[] } = {};
        if (Array.isArray(args.inputs)) patch.inputs = args.inputs.map((v) => String(v).trim()).filter(Boolean);
        if (typeof args.output === 'string' && args.output.trim()) patch.output = args.output.trim();
        if (Array.isArray(args.items)) patch.items = args.items.map((v) => String(v).trim()).filter(Boolean);
        try {
          const result = relinkArm(ready.system, game, armId, patch);
          this.game = result.state;
          await this.saveGame();
          const arm = result.state.structures.find((s) => s.id === armId)!;
          const cycling = armsInCycle(result.state).some((a) => a.id === armId);
          return `${result.text}${cycling ? '\n注意：这条线接成环了——货会在这里绕圈，白烧电。' : ''}`;
        } catch (error) {
          return { text: errorText(error), failed: true };
        }
      },
    };
  }

  private dutyTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[32]!,
      handler: async (args) => {
        const ready = await this.readyState();
        if ('error' in ready) return { text: ready.error, failed: true };
        await this.sync();
        const game = this.game!;
        const dutyId = typeof args.id === 'string' && args.id.trim()
          ? args.id.trim()
          : (game.structures.find((s) => s.kind === 'duty' && s.planetIndex === game.homePlanetIndex)?.id
            ?? game.structures.find((s) => s.kind === 'duty')?.id);
        if (!dutyId) return { text: '这颗行星上还没有【值班终端】——先建一座（genesis_install 传 id: "duty"）。', failed: true };
        const patch: { habitat?: string; store?: string; sites?: string[] } = {};
        if (typeof args.habitat === 'string' && args.habitat.trim()) patch.habitat = args.habitat.trim();
        if (typeof args.store === 'string' && args.store.trim()) patch.store = args.store.trim();
        if (Array.isArray(args.sites)) patch.sites = args.sites.map((v) => String(v).trim()).filter(Boolean);
        try {
          const result = relinkDuty(ready.system, game, dutyId, patch);
          this.game = result.state;
          await this.saveGame();
          return result.text;
        } catch (error) {
          return { text: errorText(error), failed: true };
        }
      },
    };
  }

  private resetTool(): ToolDef {
    return {
      ...GENESIS_TOOL_DECLS[33]!,
      handler: async (args) => {
        if (String(args.confirm ?? '') !== 'DELETE') {
          return { text: '要删档重开请传 confirm: "DELETE"。', failed: true };
        }
        const deleted = await this.reset();
        return deleted ? '存档已删除，可以重新创世。' : '本来就没有存档。';
      },
    };
  }
}

/** 自动起名：面板【再创世】只有种子与恒星质量两个输入，名字由种子确定性生成。 */
const STAR_NAMES = ['启明', '长庚', '天狼', '织女', '南门', '毕宿', '参宿', '心宿', '镇星', '岁星'];
const HOME_NAMES = ['栖原', '临渊', '望舒', '沧鸣', '岩湾', '新野', '白岸', '孤屿', '沉岛', '霜原'];

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function staffCapOf(game: GameState): number {
  const housing = game.structures.filter((s) => s.kind === 'staff_housing').length;
  return housing * STAFF_PER_HOUSING;
}

function autoNames(seed: GenesisSpec['seed'], runs: number): { starName: string; homeName: string } {
  const key = typeof seed === 'number' ? `n:${seed}` : `s:${seed}`;
  const star = STAR_NAMES[hashSeed(`star:${key}`) % STAR_NAMES.length]!;
  const home = HOME_NAMES[hashSeed(`home:${key}:${runs}`) % HOME_NAMES.length]!;
  return { starName: star, homeName: home };
}
