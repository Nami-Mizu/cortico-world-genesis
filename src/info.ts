// 单点查询的索引：建筑 / 资源 / 作物 / 升级 / 机制。
//
// 原则：**事实从表里生成，人只写「别名、怎么用、坑」**。这样改数值不会两边对不上。
// 新增一种建筑时，只要 BUILD_SPECS 里有它，这里自动出现一条；想让它更好查，
// 再往 BUILDING_NOTES 里补一句用法就行。

import {
  ARM_KG_PER_HOUR,
  ARM_KJ_PER_KG,
  ARM_MAX_PER_PLANET,
  ARM_RANGE_KM,
  BUILD_SPECS,
  COOLER_COST_KJ,
  DUTY_MAX_SITES,
  DUTY_RANGE_KM,
  HEATER_COST_KJ,
  TERMINAL_BAG_SLOTS,
  TERMINAL_BUFFER_KG,
  storeCapacityKg,
  type StructureRecord,
} from './game.ts';
import { COUNTER_COST_KJ, MONITOR_COST_KJ, SAIL_COST_KJ, SAIL_KJ_PER_HOME_HOUR, SAIL_MAX_PER_PLANET } from './power.ts';
import { RESOURCE_LABELS, SPECIES } from './flora.ts';
import { LABOR_YIELD_BONUS, LABOR_YIELD_BONUS_MAX, RESIDENTS_PER_LABOR } from './life.ts';
import { SELL_GOODS } from './trade.ts';
import { REALISM_CORE_COST_KJ, REALISM_CORE_UPKEEP_KJ_PER_HOUR } from './life.ts';

export type InfoKind = 'building' | 'resource' | 'crop' | 'upgrade' | 'mechanic';

export const INFO_KIND_LABELS: Record<InfoKind, string> = {
  building: '建筑',
  resource: '资源',
  crop: '作物',
  upgrade: '升级',
  mechanic: '机制',
};

export interface InfoEntry {
  id: string;
  kind: InfoKind;
  label: string;
  aliases: string[];
  /** 从表里生成的事实行（造价、耗时、维护、容量…）。 */
  facts: string[];
  /** 一句话：这个东西是干什么的。 */
  about: string;
  usage?: string;
  pitfalls?: string;
}

function kj(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M kJ`;
  return `${n.toLocaleString('en-US')} kJ`;
}

function hours(n: number): string {
  return n === 0 ? '瞬间' : `${n} 母星时`;
}

const probe = (kind: StructureRecord['kind']): StructureRecord => ({
  id: `probe-${kind}`,
  kind,
  siteKey: '',
  planetIndex: 0,
  builtHomeHours: 0,
});

interface Note {
  aliases?: string[];
  about: string;
  usage?: string;
  pitfalls?: string;
}

/** 建筑的手写部分：别名、干什么、怎么用、坑（事实行由 BUILD_SPECS 生成）。 */
const BUILDING_NOTES: Record<string, Note> = {
  greenhouse: {
    aliases: ['温室', 'gh'],
    about: '把站点的气候夹在 0–28℃，作物在里面不看外面的天。',
    usage: '站在站点上 `genesis_install { id: "greenhouse" }`；设定点 `{ id: "setpoint", tempC: 22 }`；冷热极端再装 `cooler` / `heater`。',
    pitfalls: '只管温度和湿度，不管肥力；超热超冷时裸温室无能为力，要靠核心各再撑 33℃；断电等于室外。',
  },
  biome_changer: {
    aliases: ['改变器', '改造器', 'terraformer'],
    about: '逐格改造 1,500 km 内的群系与气候，也能复垦采掘疤。',
    usage: '`genesis_install { id: "biome_changer" }`，之后它自己按格推进；进度看 `genesis_look` 的「群系改造中」。',
    pitfalls: '每格每母星时 1,250 kJ，按活跃格数收钱；断电 48 母星时后改造会慢慢退回；群系在 100% 那一刻才翻。',
  },
  pump: {
    about: '从有水的格子里抽水，装进容器。',
    usage: '建在有水的站点（湖、海、湿地），把出水接到仓库或冷库。',
    pitfalls: '旱地站点抽不到水；没容器可接就不产水。',
  },
  warehouse: {
    aliases: ['仓', 'wh'],
    about: '放散货和种子袋的通用容器，腐烂 ×1.5（比站点堆场快）。',
    usage: '`genesis_install { id: "warehouse" }`；`genesis_store` 存取；无人机、机械臂、值班终端都拿它当终点。',
    pitfalls: '不是冷库——生鲜放久了会烂；种子袋占袋位，20 袋满了就塞不进新的。',
  },
  drone_cluster: {
    aliases: ['无人机', 'drone'],
    about: '行星尺度的搬运工：连一座容器，替你收发货。',
    usage: '`genesis_install { id: "drone_cluster", serves: "<容器 id>" }`；交易终端的自动交易要靠它。',
    pitfalls: '只能连同行星的容器；必须通电；它只负责「连线」，真正搬多少由终端/机械臂的规则决定。',
  },
  rocket: {
    aliases: ['运载火箭', '发货'],
    about: '把货装进 250 kg 的货舱，发回轨道换信用点。',
    usage: '`genesis_store { action: "deposit" }` 装货，然后发货。',
    pitfalls: '一次只装 250 kg；发射要看天气窗口。',
  },
  kiln: {
    aliases: ['炭化炉', '草木灰'],
    about: '把生物质烧成草木灰——补矿物质，但氮会烧掉。',
    usage: '烧出来的灰用 `genesis_ash` 撒到站点。',
    pitfalls: '别指望它补氮；灰撒多了会压肥力。',
  },
  purifier: {
    about: '把生水净化成能喝的饮用水。',
    usage: '接水源，出水进冷库或居所。',
    pitfalls: '很耗电；没水可净化就空转。',
  },
  sealer: {
    about: '把食物封装成干粮，腐烂慢很多。',
    usage: '接仓库，把生物质封装成口粮。',
    pitfalls: '封装要耗电和材料；干粮还是会被吃光。',
  },
  atmo_extractor: {
    about: '从大气里分离氧气，装瓶或直接进居所。',
    usage: '建在站点，把氧气出口接到居所或仓库。',
    pitfalls: '大气太稀薄的行星产率很低；耗电大户。',
  },
  habitat: {
    aliases: ['住所', '房子'],
    about: '住人的地方：容量 20 人，内仓能装食物/水/氧气（是容量，不是库存）。',
    usage: '`genesis_install { id: "habitat" }`，再 `genesis_wake` 叫醒人；人手要有【值班终端】才干活。',
    pitfalls: '人只肯住 5–32℃ 的室内（通电最多拉 12℃）；断供会回休眠舱；入住后断电不会把人赶出来。',
  },
  inert_room: {
    about: '充惰性气体保鲜：腐烂 ×0.75，不耗电。',
    usage: '把易烂的货接进来；氧气浓度低于 22% 才有效。',
    pitfalls: '不耗电但也不制冷——热的地方照样烂。',
  },
  cold_store: {
    aliases: ['冷藏', 'fridge'],
    about: '低温保鲜：腐烂 ×0.5，很耗电。',
    usage: '接在产线和交易终端之间，别让生鲜在路上烂掉。',
    pitfalls: '断电就退化成普通仓库；维护费不低。',
  },
  mutation_room: {
    aliases: ['诱变室', '辐射室'],
    about: '花信用点诱变种子，赌极端性状（耐寒、耐热、产量）。',
    usage: '`genesis_mutate`；出的种子进仓库袋位。',
    pitfalls: '要信用点；诱变是随机的，可能白花钱。',
  },
  miner: {
    aliases: ['矿机', '挖矿'],
    about: '在格子上挖钨，产率跟这一格剩余矿量走（2.0 → 0.2 份/母星时）。',
    usage: '建在海拔 ≥800 m 的陆地格；同格可叠；配质谱仪找富矿。',
    pitfalls: '会留采掘疤（肥力最多掉 60%，疤还会往下坡传）；每挖 10 份钨产 1 kg 尾矿，堆满 500 kg 就停机。',
  },
  rectifier: {
    aliases: ['电塔', '电网'],
    about: '行星电网的节点：把电送到 2,000 km 内的站点。',
    usage: '`genesis_install { id: "rectifier" }`；`genesis_grid` 看覆盖，`grid_in` 手动搬 10,000 kJ。',
    pitfalls: '搬运有 10% 损耗；超出 2,000 km 就够不着。',
  },
  terminal: {
    aliases: ['交易终端', '商人', '收货口'],
    about: '和商人做生意的接口：自动卖出、可选自动买种子。',
    usage: '`genesis_install { id: "terminal", target: "slag", buySpecies: "grass" }`；无人机 `serves` 指它才自动交易。',
    pitfalls: `只做收货口：${TERMINAL_BUFFER_KG} kg 缓冲 + ${TERMINAL_BAG_SLOTS} 袋，自己倒不进去；每天只在 12:00–23:00 结算一次。`,
  },
  storage_terminal: {
    aliases: ['仓储终端', '编排'],
    about: '一张「先取哪个容器」的编排表：槽位 → 优先级，数字大的先取。',
    usage: '`genesis_install { id: "storage_terminal", feeds: "<交易终端 id>" }`；`genesis_route { container: "0", priority: 3 }`。',
    pitfalls: '它自己不装货；没进表的容器一律不动；不连它，终端就吃同行星所有容器（旧行为）。',
  },
  arm: {
    aliases: ['机械臂', '臂'],
    about: `站点内部的物流：把几个容器的散货搬进一个容器（${ARM_KG_PER_HOUR} kg/母星时、臂展 ${ARM_RANGE_KM} km）。`,
    usage: '`genesis_install { id: "arm", inputs: [...], output: "<容器>" }`；改线用 `genesis_link`。',
    pitfalls: `不搬散装液体之外的东西也算：它按槽位顺序取货、按名字排序搬；每颗行星最多 ${ARM_MAX_PER_PLANET} 座；成环不拦，但每天提醒一次（${ARM_KJ_PER_KG} kJ/kg 白烧）。`,
  },
  duty: {
    aliases: ['值班', '班组'],
    about: `给一座居所派班组：每 ${RESIDENTS_PER_LABOR} 人一份人手，自动收、种、施肥。`,
    usage: `\`genesis_install { id: "duty", habitat, store, sites: [...] }\`（${DUTY_RANGE_KM} km 内、最多 ${DUTY_MAX_SITES} 个站点）；改绑用 \`genesis_duty\`。`,
    pitfalls: `没终端人不干活；必须通电；收成进值班仓库，仓库满了就停；施肥补不了氮；增产 +${Math.round(LABOR_YIELD_BONUS * 100)}%/份、单站封顶 +${Math.round(LABOR_YIELD_BONUS_MAX * 100)}%。`,
  },
};

const CAPACITY_KINDS: Array<StructureRecord['kind']> = [
  'warehouse',
  'cold_store',
  'inert_room',
  'rocket',
  'terminal',
  'habitat',
];

function capacityFact(kind: StructureRecord['kind']): string | null {
  if (!CAPACITY_KINDS.includes(kind)) return null;
  const cap = storeCapacityKg(probe(kind));
  if (!cap) return null;
  if (kind === 'terminal') return `缓冲：${cap} kg + ${TERMINAL_BAG_SLOTS} 袋（收货口，不是仓库）`;
  if (kind === 'rocket') return `货舱：${cap} kg`;
  if (kind === 'habitat') return `内仓：${cap} kg（食物 300 kg / 水 300 L / 氧气 60 kg）`;
  return `容量：${cap} kg + 20 袋种子`;
}

/** 资源：在 RESOURCE_LABELS 的基础上补上商人收购价与几句用法。 */
const RESOURCE_NOTES: Record<string, { aliases?: string[]; about: string; usage?: string; pitfalls?: string }> = {
  biomass: { aliases: ['生物质', 'food'], about: '最基础的有机物：吃、烧、堆肥、喂人都行。', usage: '切碎/堆肥/烧灰；也是居所的口粮。', pitfalls: '会腐烂，20℃ 下 72 母星时就坏。' },
  phycocyanin: { aliases: ['藻蓝素'], about: '蓝藻产的高价值色素，商人收。', usage: '卖给商人；或喂给诱变室。' },
  silica: { aliases: ['硅质壳', '硅'], about: '硅藻产的硅质壳，做玻璃/电子件。', usage: '卖给商人；也是部分建筑的材料。' },
  antifreeze: { aliases: ['抗冻蛋白'], about: '冰藻产的抗冻蛋白，耐寒作物的关键材料。', usage: '卖给商人；育种/诱变时用。' },
  fiber: { aliases: ['纤维'], about: '苔藓产的纤维，绳子、布、建材都要。', usage: '卖给商人；蓝图和惰性气体室要。' },
  lichen_acid: { aliases: ['地衣酸'], about: '地衣产的酸，最贵的天然产物之一。', usage: '卖给商人；少量用于医药。' },
  slag: { aliases: ['尾矿', '矿渣'], about: '挖钨的废料：占地方、不能赚钱，但商人肯收（净价 0）。', usage: '交易终端 `target: "slag"` 自动清；或回填。', pitfalls: '每天收不了多少（50 kg）；堆满 500 kg 采矿机就停。' },
  tungsten: { aliases: ['钨', 'w'], about: '战略金属：几乎所有高级建筑都要消耗。', usage: '采矿机产；商人也卖（700 信用点/份）。', pitfalls: '矿脉有限，挖完那格就没了。' },
};

export const INFO_ENTRIES: InfoEntry[] = (() => {
  const entries: InfoEntry[] = [];

  for (const [id, spec] of Object.entries(BUILD_SPECS)) {
    const note = BUILDING_NOTES[id];
    const facts = [
      `造价：${kj(spec.costKj)}${spec.costCredits ? ` + ${spec.costCredits} 信用点` : ''} + ${spec.tungsten} 份钨`,
      `施工：${hours(spec.buildHours)}`,
      spec.upkeepKjPerHour ? `维护：${spec.upkeepKjPerHour.toLocaleString('en-US')} kJ/母星时` : '维护：不耗电',
    ];
    const cap = capacityFact(id as StructureRecord['kind']);
    if (cap) facts.push(cap);
    entries.push({
      id,
      kind: 'building',
      label: spec.label,
      aliases: note?.aliases ?? [],
      facts,
      about: note?.about ?? spec.label,
      usage: note?.usage,
      pitfalls: note?.pitfalls,
    });
  }

  // 只能「安装」、不在 BUILD_SPECS 里的设备（帆、监测器、凌日计数器、气候核心）。
  const devices: Array<{
    id: string;
    label: string;
    aliases: string[];
    facts: string[];
    about: string;
    usage?: string;
    pitfalls?: string;
  }> = [
    {
      id: 'pod',
      label: '着陆舱（pod）',
      aliases: ['着陆舱', '舱', 'pod', '补给舱', '着陆器'],
      facts: [
        '容量：干粮 40 kg、饮用水 160 L、氧气 24 kg',
        '睡着的人先吃它：每人每母星时 0.005 kg 粮 / 0.02 L 水 / 0.007 kg 氧',
        '三样都见底也不会死人，只是继续睡——叫醒之后才吃居所内仓',
      ],
      about: '开局那艘着陆器剩下的补给舱。它是全船最靠得住的一口粮，也是唯一没有建筑图纸的容器。',
      usage: '补舱：genesis_store { action: "deposit", building: "pod", resource: "biomass", kg: 10 }（水用 water_drink、氧用 oxygen）；取出来用 action: "withdraw"；先看余量用 action: "list"。',
      pitfalls: '只认干粮、饮用水、氧气三样；舱空之后不会自动去仓库拿，得你自己搬。',
    },
    {
      id: 'sail',
      label: '太阳能帆',
      aliases: ['帆', '太阳能', '发电', 'solar'],
      facts: [
        `造价：${kj(SAIL_COST_KJ)} + 0 份钨`,
        '施工：立刻（0.1 母星时）',
        '维护：不耗电',
        `产出：白天每母星时 ${SAIL_KJ_PER_HOME_HOUR.toLocaleString('en-US')} kJ，夜里 0`,
        `上限：每颗行星 ${SAIL_MAX_PER_PLANET} 座`,
      ],
      about: '最便宜的电：只在白天发电，产量按它自己的经纬度算。',
      usage:
        '站在陆地上 `genesis_install { id: "sail" }`。赤道常年一半一半，高纬冬天短、夏天长，极地有极昼极夜——选址是有意义的；经度错开可以让几座帆交替上班。',
      pitfalls: '水里建不了；气态/冰巨星上建不了；夜里不发电，夜里要靠电池或火电。',
    },
    {
      id: 'monitor',
      label: '环境监测器',
      aliases: ['监测器', '监控', '观测'],
      facts: [`造价：${kj(MONITOR_COST_KJ)} + 0 份钨`, '维护：不耗电'],
      about: '装上之后，这个天体的属性才是「事实」——面板与工具栏才有它的详细数据。',
      usage: '`genesis_install { id: "monitor" }`；母星装上会解锁恒星全貌。',
      pitfalls: '没装的天体只能靠 `genesis_stargaze` 看个大概，模型不该编它的参数。',
    },
    {
      id: 'counter',
      label: '凌日计数器',
      aliases: ['凌日', '计数器', 'transit counter'],
      facts: [`造价：${kj(COUNTER_COST_KJ)} + 0 份钨`, '维护：不耗电'],
      about: '盯着恒星看行星从前面划过去，测出周期与大小。',
      usage: '`genesis_install { id: "counter" }`。',
    },
    {
      id: 'cooler',
      label: '制冷核心',
      aliases: ['制冷', '冷却核心', '温室核心'],
      facts: [`造价：${kj(COOLER_COST_KJ)} + 0 份钨`, '维护：1,500 kJ/母星时'],
      about: '装在温室上，把温室的耐热上限再往上撑 33℃。',
      usage: '先有温室，再 `genesis_install { id: "cooler", site: "<站点>" }`。',
    },
    {
      id: 'heater',
      label: '制热核心',
      aliases: ['制热', '加热核心', '温室核心'],
      facts: [`造价：${kj(HEATER_COST_KJ)} + 0 份钨`, '维护：400 kJ/母星时'],
      about: '装在温室上，把温室的耐冷下限再往下撑 33℃。',
      usage: '先有温室，再 `genesis_install { id: "heater", site: "<站点>" }`。',
    },
    {
      id: 'realism',
      label: '拟真核心',
      aliases: ['拟真', 'realism', '气候模拟'],
      facts: [`造价：${kj(REALISM_CORE_COST_KJ)} + 0 份钨`, `维护：${REALISM_CORE_UPKEEP_KJ_PER_HOUR} kJ/母星时`],
      about: '装在温室上：温室不再把里面夹成一个恒温箱，而是跟着外面的季节、昼夜缓慢变化——更像一块地，也更难。',
      usage: '先有温室，再 `genesis_install { id: "realism", site: "<站点>" }`。',
      pitfalls: '装了之后作物会遇到与外面接近的冷热，挑错物种就会应激；想稳产就选耐性宽的。',
    },
  ];
  for (const device of devices) {
    entries.push({
      id: device.id,
      kind: 'building',
      label: device.label,
      aliases: device.aliases,
      facts: device.facts,
      about: device.about,
      usage: device.usage,
      pitfalls: device.pitfalls,
    });
  }

  for (const [id, label] of Object.entries(RESOURCE_LABELS)) {    const note = RESOURCE_NOTES[id];
    const sell = SELL_GOODS.find((good) => good.id === id);
    const facts = sell
      ? [`商人收购：${sell.basePrice} 信用点/${sell.unit}（每天最多 ${sell.dailyLimit} ${sell.unit}）`]
      : [];
    entries.push({
      id,
      kind: 'resource',
      label,
      aliases: note?.aliases ?? [],
      facts,
      about: note?.about ?? `${label}：一种可存储、可交易的物资。`,
      usage: note?.usage,
      pitfalls: note?.pitfalls,
    });
  }

  const extras: Array<{ id: string; label: string; aliases: string[]; about: string; usage?: string; pitfalls?: string }> = [
    {
      id: 'tungsten',
      label: '钨',
      aliases: ['w', 'tungsten'],
      about: '战略金属：几乎所有高级建筑都要消耗。',
      usage: '采矿机产；商人也卖（700 信用点/份）。',
      pitfalls: '每格矿脉有限（0–500 份），挖完那格就没了。',
    },
    {
      id: 'energy_block',
      label: '能量块',
      aliases: ['电池块', 'energy'],
      about: '压缩能量：商人卖的应急电，一块 5,000 kJ。',
      usage: '商人那里 120 信用点一块，`genesis_buy` 买。',
      pitfalls: '贵，只适合救急。',
    },
    {
      id: 'survey',
      label: '测绘数据',
      aliases: ['测绘', '数据'],
      about: '站点采样出的数据，商人收 50 信用点一份。',
      usage: '`genesis_survey` 采样，每个站点每天一次。',
      pitfalls: '不采就没有；数据本身不能当电用。',
    },
  ];

  for (const extra of extras) {
    const sell = SELL_GOODS.find((good) => good.id === extra.id);
    entries.push({
      id: extra.id,
      kind: 'resource',
      label: extra.label,
      aliases: extra.aliases,
      facts: sell ? [`商人收购：${sell.basePrice} 信用点/${sell.unit}（每天最多 ${sell.dailyLimit} ${sell.unit}）`] : [],
      about: extra.about,
      usage: extra.usage,
      pitfalls: extra.pitfalls,
    });
  }

  for (const species of Object.values(SPECIES)) {
    entries.push({
      id: species.id,
      kind: 'crop',
      label: species.name,
      aliases: [species.short],
      facts: [
        `介质：${species.medium === 'water' ? '水' : '陆地'}`,
        `温度：${species.tempMinC}–${species.tempMaxC}℃（最适 ${species.tempOptC}℃）`,
        `周期：${species.cycleHomeHours} 母星时 · 产量 ${species.yieldKg} kg`,
        `产物：${RESOURCE_LABELS[species.resource]}`,
      ],
      about: `${species.name}（${species.short}）：${species.model === 'colony' ? '微生物群落，逻辑斯蒂增长' : '植株，按积温成熟'}。`,
      usage: '播种用 `genesis_plant`，或交给值班终端的人手。',
      pitfalls: '温度、水分、肥力三样不达标就长得慢或枯死。',
    });
  }

  entries.push(
    {
      id: 'mobility_core',
      kind: 'upgrade',
      label: '机动核心',
      aliases: ['机动', 'mobility'],
      facts: ['造价：500,000 kJ + 材料 · 0.5 母星时'],
      about: '让船能在星球之间飞（星际航行）。',
      usage: '`genesis_upgrade { id: "mobility_core" }`。',
      pitfalls: '没它之前观星也走不了。',
    },
    {
      id: 'telescope',
      kind: 'upgrade',
      label: '射电望远镜',
      aliases: ['望远镜', 'telescope'],
      facts: ['三级：解商城窗口、扩大限购、提高商人库存'],
      about: '看得远、买得多：解锁商店并放宽每日限购。',
      usage: '`genesis_upgrade { id: "telescope" }`（升一级）。',
      pitfalls: '只影响交易，不影响探测。',
    },
    {
      id: 'spectrometer',
      kind: 'upgrade',
      label: '质谱仪',
      aliases: ['扫矿', '质谱'],
      facts: ['造价：25,000 kJ + 1 份钨 · 0.5 母星时', '扫描：2,000 km、每 6 母星时一次'],
      about: '扫出脚下 5×5 格的剩余钨含量与最富的一格。',
      usage: '`genesis_upgrade { id: "spectrometer" }`，再用 `genesis_veins`。',
      pitfalls: '只在岩石行星有用；冷却期间扫不了。',
    },
    {
      id: 'battery',
      kind: 'upgrade',
      label: '蓄电池',
      aliases: ['电池', 'battery'],
      facts: ['容量：100,000 → 300,000 → 700,000 → 1,500,000 kJ'],
      about: '存电，撑过夜晚与阴天。',
      usage: '`genesis_upgrade { id: "battery" }`。',
      pitfalls: '只扩容，不发电。',
    },
    {
      id: 'spark_plug',
      kind: 'upgrade',
      label: '火花塞',
      aliases: ['火花', 'spark'],
      facts: ['手摇一次：15 / 30 / 50 kJ'],
      about: '让手摇发电机更有效率。',
      usage: '`genesis_upgrade { id: "spark_plug" }`。',
      pitfalls: '还是得人手摇。',
    },
    {
      id: 'subagent',
      kind: 'upgrade',
      label: '子代理',
      aliases: ['施工队', 'subagent'],
      facts: ['施工队列：1 → 4'],
      about: '分身的施工队：能并行施工、替你顶班。',
      usage: '`genesis_upgrade { id: "subagent" }`。',
      pitfalls: '不加产能，只是多一些手。',
    },
    {
      id: 'blueprints',
      kind: 'upgrade',
      label: '蓝图',
      aliases: ['图纸', 'blueprint'],
      facts: ['造价：200,000 kJ + 3 份钨 + 2 kg 纤维 · 1 母星时', '效果：所有建筑用钨 ×0.75（向下取整，最少 1）'],
      about: '把钨省下来：高级建筑便宜四分之一。',
      usage: '`genesis_upgrade { id: "blueprints" }`。',
      pitfalls: '一次性升级，不叠加。',
    },
  );

  const mechanics: Array<Omit<InfoEntry, 'kind'>> = [
    {
      id: 'energy',
      label: '能量',
      aliases: ['电', 'kj', '电力'],
      facts: ['单位：kJ · 开局 2,000–5,000 kJ 残电'],
      about: '所有设备都吃电：手摇、太阳能帆、蓄电池、电网。',
      usage: '`genesis_power` 看余额；`press` 手摇；`set_solar` 开关帆。',
      pitfalls: '断电的温室等于室外、值班终端停工、机械臂停摆。',
    },
    {
      id: 'power_grid',
      label: '行星电网',
      aliases: ['电网', '电塔', 'grid'],
      facts: ['整流电塔：2,000 km 内 · 手动搬 10,000 kJ / 0.1 母星时 · 损耗 10%'],
      about: '把电从一个站点搬到另一个站点。',
      usage: '`genesis_grid` 看、`genesis_grid_in` 搬。',
      pitfalls: '超出 2,000 km 就够不着；每次搬都有损耗。',
    },
    {
      id: 'bag_slot',
      label: '种子袋位',
      aliases: ['袋位', '种子袋', 'bag'],
      facts: ['容器/终端各 20 个袋位 · 每袋 5 粒 · 袋重约 20 g'],
      about: '种子是带基因的离散物件，按「袋」占位，不按 kg。',
      usage: '`genesis_store { action: "bags" }` 看，`{ action: "take" }` 取。',
      pitfalls: '袋位满了再好的种子也放不进去。',
    },
    {
      id: 'scar',
      label: '采掘疤',
      aliases: ['疤', '废地', '过度采掘'],
      facts: ['每挖 1 份钨留下 1/500 的疤 · 肥力 ×(1−0.6×疤) · 每 24 母星时向下坡传 10%'],
      about: '挖矿把地挖薄了：肥力和微量元素上限都下降，疤 ≥60% 算废地。',
      usage: '群系改变器能复垦（每母星时 −0.02）。',
      pitfalls: '疤会顺着坡往下传，别在下游种地。',
    },
    {
      id: 'terraform',
      label: '群系改造',
      aliases: ['改造', '复垦', 'terra'],
      facts: ['每格 24 母星时 · 1,250 kJ/母星时/格 · 断电 48 母星时后开始退回'],
      about: '把一片地慢慢改成温带林/草原，气候在进度里连续插值。',
      usage: '建群系改变器，`genesis_look` 看进度；地图上叠了渐变。',
      pitfalls: '改造中的格子仍是原群系，100% 才翻；改造完的格子肥力 +0.1、微量元素上限 ×2。',
    },
    {
      id: 'rot',
      label: '腐烂',
      aliases: ['保鲜', '坏了'],
      facts: ['20℃、湿度 60% 下约 72 母星时坏完 · 冷库 ×0.5 · 惰性气体室 ×0.75 · 仓库 ×1.5'],
      about: '有机物会坏：温度越高越快，容器会改变速度。',
      usage: '用冷库/惰性气体室/干粮对付它。',
      pitfalls: '生物质和食物都算，别把口粮堆在露天站点。',
    },
    {
      id: 'labor',
      label: '人手',
      aliases: ['值班', '班组', 'labor', 'duty'],
      facts: ['每 5 人一份 · 3 收 + 3 种 + 20 kg 施肥/母星时 · +8%/份、单站封顶 +40%'],
      about: '醒着的人要有一座值班终端才干活。',
      usage: '`genesis_install { id: "duty", habitat, store, sites }`。',
      pitfalls: '没终端不干活；施肥不补氮；收成进值班仓库，满了就停。',
    },
    {
      id: 'life_support',
      label: '生命维持',
      aliases: ['氧气', '口粮', '水'],
      facts: ['每人每母星时：口粮 0.5 kg、水 2 L、氧气 0.3 kg'],
      about: '居所里的人按人头吃粮喝水吸氧，断供就回休眠舱。',
      usage: '把粮水氧接进居所；`genesis_life` 看余量。',
      pitfalls: '断供只回舱不死人，但人一睡就不干活了。',
    },
    {
      id: 'stargaze',
      label: '观星',
      aliases: ['看星星', '天文'],
      facts: ['能见度 > 0.5 且星等 < 6 才看得见 · 观星后 1 母星时内可航行'],
      about: '看清航线，才能确定往哪飞。',
      usage: '`genesis_stargaze`。',
      pitfalls: '阴天、白天、空气太厚都看不成。',
    },
    {
      id: 'travel',
      label: '航行',
      aliases: ['移动', '飞行'],
      facts: ['地表 600 km/星球时 · 星际 2 AU/星球日（各 ×4 加速时）'],
      about: '移动不是瞬时的，路上会消耗时间。',
      usage: '`genesis_move { kind: "surface" | "interstellar", ... }`；`genesis_time` 看还剩多久。',
      pitfalls: '移动途中不能建、不能播种、不能观星以外的操作。',
    },
    {
      id: 'credit',
      label: '信用点',
      aliases: ['钱', 'credits'],
      facts: ['四档：0 / 500 / 5,000 / 20,000（按当前余额）· 1 信用点 ≈ 100 kJ'],
      about: '和商人做生意的硬通货，只能在商人那里赚。',
      usage: '卖货给商人；高档货要余额够才卖给你。',
      pitfalls: '花掉会掉档，高级货重新锁上。',
    },
  ];

  for (const item of mechanics) {
    entries.push({ ...item, kind: 'mechanic' });
  }

  return entries;
})();

function normalize(text: string): string {
  return text.toLowerCase().replace(/[\s_\-·（）()]/g, '');
}

function isSubsequence(needle: string, haystack: string): boolean {
  let at = 0;
  for (const ch of haystack) {
    if (ch === needle[at]) at += 1;
    if (at >= needle.length) return true;
  }
  return needle.length === 0;
}

/** 打分：id 100、别名 90、名字包含 70、id 前缀 60、id 包含 50、子序列 40。 */
export function scoreInfo(entry: InfoEntry, query: string): number {
  const q = normalize(query);
  if (!q) return 0;
  if (normalize(entry.id) === q) return 100;
  for (const alias of entry.aliases) {
    if (normalize(alias) === q) return 90;
  }
  const label = normalize(entry.label);
  if (label.includes(q)) return 70 + Math.round((10 * q.length) / Math.max(1, label.length));
  const id = normalize(entry.id);
  if (id.startsWith(q)) return 60;
  if (id.includes(q)) return 50;
  if (isSubsequence(q, label) || isSubsequence(q, id)) return 40;
  return 0;
}

export interface InfoHit {
  entry: InfoEntry;
  score: number;
}

export const INFO_LIMIT = 3;

export function searchInfo(query: string, limit = INFO_LIMIT): InfoHit[] {
  const hits: InfoHit[] = [];
  for (const entry of INFO_ENTRIES) {
    const score = scoreInfo(entry, query);
    if (score > 0) hits.push({ entry, score });
  }
  hits.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.entry.kind.localeCompare(b.entry.kind) || a.entry.id.localeCompare(b.entry.id);
  });
  return hits.slice(0, limit);
}

function entryHead(entry: InfoEntry): string {
  return `${entry.label}（${entry.id}）· ${INFO_KIND_LABELS[entry.kind]}`;
}

function entryOneLine(entry: InfoEntry): string {
  const cost = entry.facts[0] ? ` · ${entry.facts[0].replace('造价：', '')}` : '';
  return `${entryHead(entry)}${cost}`;
}

/** 一条完整的卡（第一条）或一行摘要（备选）。 */
export function formatInfoEntry(entry: InfoEntry, full: boolean): string {
  if (!full) return entryOneLine(entry);
  const lines = [entryHead(entry)];
  if (entry.facts.length) lines.push(`  ${entry.facts.join(' · ')}`);
  lines.push(`  作用：${entry.about}`);
  if (entry.usage) lines.push(`  怎么用：${entry.usage}`);
  if (entry.pitfalls) lines.push(`  坑：${entry.pitfalls}`);
  return lines.join('\n');
}

function suggest(query: string): InfoEntry[] {
  const q = normalize(query);
  const chars = [...new Set([...q])];
  const scored = INFO_ENTRIES.map((entry) => {
    const text = normalize(`${entry.label}${entry.id}${entry.aliases.join('')}${entry.about}`);
    const hits = chars.filter((ch) => text.includes(ch)).length;
    return { entry, hits };
  })
    .filter((item) => item.hits > 0)
    .sort((a, b) => b.hits - a.hits || a.entry.label.length - b.entry.label.length);
  return scored.slice(0, INFO_LIMIT).map((item) => item.entry);
}

/** 整个工具的返回值：查得到就给卡，查不到就给最接近的三个 id。 */
export function infoText(query: string): string {
  const text = query.trim();
  if (!text) {
    const counts = (['building', 'resource', 'crop', 'upgrade', 'mechanic'] as InfoKind[])
      .map((kind) => `${INFO_KIND_LABELS[kind]} ${INFO_ENTRIES.filter((e) => e.kind === kind).length}`)
      .join('、');
    return `要查什么？传一个 id 或名字（建筑、资源、作物、升级、机制都能查；现在有${counts}条）。\n比如：genesis_info { query: "温室" }、{ query: "tungsten" }、{ query: "腐烂" }。`;
  }
  const hits = searchInfo(text);
  if (!hits.length) {
    const near = suggest(text);
    if (!near.length) return `没查到「${text}」。试试建筑 id（warehouse）、资源名（tungsten）、作物名（速生草）或机制（腐烂）。`;
    return `没查到「${text}」。最接近的是：${near.map((entry) => `${entry.id}（${entry.label}）`).join('、')}——把 id 传准一点。`;
  }
  const lines = [formatInfoEntry(hits[0]!.entry, true)];
  if (hits.length > 1) {
    lines.push('也像这些：');
    for (const hit of hits.slice(1)) lines.push(`  ${formatInfoEntry(hit.entry, false)}`);
  }
  if (hits[0]!.score < 70) lines.push('没找到完全对上的；要细则就把 id 传准（比如上面第一条的括号里那个）。');
  return lines.join('\n');
}
