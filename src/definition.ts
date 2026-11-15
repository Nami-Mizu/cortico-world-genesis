import { describeTools, type WorldDefinition } from 'cortico/world.ts';
import { GENESIS_DEFAULTS, type GenesisConfigSection } from './config.ts';
import { GENESIS_TOOL_DECLS, GenesisWorld } from './world.ts';

export const GENESIS: WorldDefinition<GenesisConfigSection> = {
  id: 'genesis',
  label: '创世记',
  defaults: () => ({ ...GENESIS_DEFAULTS }),
  create: (ctx) => new GenesisWorld({ cfg: ctx.cfg, timezone: ctx.timezone, dataDir: ctx.dataDir }),
  describe: {
    tools: describeTools(GENESIS_TOOL_DECLS, {
      genesis_menu: {
        zh: '看创世菜单：种子、恒星质量、行星数、卫星上限的取值范围与默认值，以及当前是否已经创世。',
        en: 'Show the genesis menu: ranges and defaults, plus whether a world already exists.',
      },
      genesis_create: {
        zh: '创世：用种子和恒星质量生成恒星系（行星数 3–6 与卫星上限都由种子决定），给恒星和母星命名，写进存档后锁定。已经有存档时不会覆盖。',
        en: 'Create the star system from a seed and a star mass (the seed also decides how many planets and moons there are), name the star and the home world, then lock it.',
      },
      genesis_card: {
        zh: '读已部署【环境监测器】的天体的详细属性；一台都没装时什么都看不到。',
        en: 'Read detailed attributes of the bodies that have an environment monitor installed.',
      },
      genesis_terrain: {
        zh: '看某个天体上某坐标附近的环境（一片格子）：岩石行星给群系+海拔+均温，气态/冰巨星给风暴带（等气压面），卫星给「卫星」群系。补丁大小 = 地形视野 × 能见度。可传 moonIndex 看卫星；不传坐标就是当前位置；移动途中回出发地那一片。',
        en: 'Show the environment around a lat/lon on a body: rocky planets give biome+elevation+temperature, gas/ice giants give storm bands, moons give the fixed moon biome. Defaults to the current position; during transit it shows the departure point.',
      },
      genesis_time: {
        zh: '看现在是什么时候（母星历法，形如「13曙光年-42曙光日-7.5曙光时」）、你在哪、有没有在移动途中。',
        en: 'Read the current time, location and whether a journey is in progress.',
      },
      genesis_stargaze: {
        zh: '观星：能见度够时看见恒星与星等够亮的行星/卫星；看完 1 母星时内才能星际航行到看见的天体。',
        en: 'Stargaze: see the star and the bright planets/moons; only within one home hour afterward can you travel to what you saw.',
      },
      genesis_move: {
        zh: '出发：地表移动（600 km/星球时）或星际航行（2 AU/星球日），都不是瞬间到达，移动途中看不到环境，到达时推送【已到达】。',
        en: 'Depart: surface walk or interstellar voyage. Not instant; the environment is hidden during transit and an arrival event is pushed.',
      },
      genesis_name: {
        zh: '给现在所在的天体起名（行星自己起，卫星按「<行星简称>卫<序号>」自动起名）。没到过的地方不能起名。',
        en: 'Name the body you are on. Planets get your name; moons follow the automatic template.',
      },
      genesis_sun: {
        zh: '看此刻太阳的高度角、方位角、当地太阳时与昼夜。不需要设备；0 时只在开局经纬度是午夜。',
        en: 'Read the sun altitude, azimuth, local solar time and day/night. No device needed.',
      },
      genesis_transit: {
        zh: '看你在第几颗行星（或它的第几颗卫星）上；没有【凌日计数器】时返回「未安装凌日计数器。」。',
        en: 'Show which planet (or moon) you are on; requires a deployed transit counter.',
      },
      genesis_shop: {
        zh: '看商人（母星上，12:00–23:00 营业）：收什么、卖什么、今天的价，以及信用点与库存。带 sell + amount 就是把收成卖给商人换信用点。',
        en: 'Read the merchant on the home world (open 12:00–23:00): what they buy and sell, prices, credits and stock. Pass sell + amount to sell.',
      },
      genesis_buy: {
        zh: '在商人那里买东西（要先修射电望远镜）：random 用能量买一袋随机基因种子；premium 用信用点买一袋更好的（要 500 信用点余额起）；cylinder 买高强度钢瓶（多买有折扣）；energy 买能量块（5,000 kJ，120 信用点，直接进电池、没有损耗）；tungsten 买 1 份钨（700 信用点，商人每天只有几份）。大型植物还没开通。',
        en: 'Buy from the merchant (needs the radio array): random seeds cost energy, premium costs credits (500+ balance), cylinder buys high-pressure bottles (bulk discount), energy buys a 5,000 kJ block for 120 credits (direct to battery, no loss), tungsten buys one unit for 700 credits (a few per day). Giant plants are not available yet.',
      },
      genesis_survey: {
        zh: '在脚下的站点采一份测绘数据（0.1 母星时，每站点每天一次），测绘数据可以卖给商人。',
        en: 'Survey the site underfoot once per day for 0.1 home hour; the data can be sold.',
      },
      genesis_site: {
        zh: '在脚下建一个 1 km² 的站点（农场地基）。一格最多 3 个；冰盖与水面不行。',
        en: 'Found a 1 km² site underfoot (a farm plot). At most three per cell; not on ice or water.',
      },
      genesis_plant: {
        zh: '把一袋种子种到站点上（一袋 5 粒/群）。水生藻类必须种在水边湿地站点。',
        en: 'Sow a seed bag at a site (five seeds/colonies per bag). Aquatic algae need a wet site.',
      },
      genesis_flora: {
        zh: '看作物：每个站点的每株/每群植物的阶段、进度、健康、生物量，以及仓库、信用点与种子袋。',
        en: 'Read the crops: stage, progress, health and biomass per plant, plus stock, credits and seed bags.',
      },
      genesis_harvest: {
        zh: '收获：大型植物结实后收一次（整株收完）；藻类群落可以连续收，留下接种量继续长。',
        en: 'Harvest: mature plants give one full harvest; colonies can be harvested repeatedly, keeping their inoculum.',
      },
      genesis_burn: {
        zh: '烧干生物质发电：1 kg 换 3,750 kJ。',
        en: 'Burn dry biomass for power: 3,750 kJ per kg.',
      },
      genesis_install: {
        zh: '安装/建造：传 id 指定装什么，全部消耗【钨】。monitor（环境监测器，150,000 kJ + 2 份钨，母星装上解锁恒星全貌）、counter（凌日计数器，150,000 kJ + 2 份钨）、sail（太阳能帆，6,000 kJ + 1 份钨，建在脚下这块陆地上，产量按它的经纬度算，每颗行星 10 座）、greenhouse（温室核心，80,000 kJ + 1 份钨）、biome_changer（群系改变器，1,000,000 kJ + 6 份钨 + 0.5 母星时，逐格改造）、cooler/heater（气候核心，10,000 kJ + 1 份钨，各再撑 33℃）、realism（拟真环境核心，60,000 kJ + 1 份钨，人工气候惩罚减半）、setpoint（给温室设定目标温度 −60…80℃，不传 tempC 回到自动）、pump（水泵，20,000 kJ + 1 份钨）、warehouse（仓库，50,000 kJ + 2 份钨，1,000 kg）、cold_store（冷库，120,000 kJ + 2 份钨，+200 kg 保鲜）、inert_room（惰性气体室，45,000 kJ + 2 份钨 + 2 kg 纤维，要大气惰性 ≥68% 且氧 ≤22%）、drone_cluster（无人机集群，800,000 kJ + 3 份钨 + 1 母星时，serves 一个容器）、rocket（运载火箭，500,000 kJ + 4 份钨 + 0.5 母星时，250 kg）、kiln/purifier/sealer/atmo_extractor（生产链，30–80k kJ）、habitat（居所，200,000 kJ + 500 信用点 + 4 份钨，住 20 人）、mutation_room（诱变室，150,000 kJ + 8,000 信用点 + 3 份钨）、miner（采矿机，40,000 kJ + 2 份钨，岩石行星海拔 800 m 以上，产钨）、rectifier（整流电塔，40,000 kJ + 2 份钨，一星一座，把本地发电并进行星电网）、terminal（交易终端，60,000 kJ + 2 份钨，只能建在陆地；连着通电无人机后每天自动卖 target 指定的资源一次；它同时是收货口——干散 200 kg、种子 20 袋，满了不收；传 buySpecies 还能每天自动买 1 袋随机种子）。',
        en: 'Install/build by id; every structure eats tungsten. monitor (150,000 kJ + 2), counter (2), sail (6,000 kJ + 1, on the land you stand on; output follows its own lat/lon), greenhouse (1), biome_changer (1M kJ + 6), cooler/heater (10,000 + 1), realism (60,000 + 1), setpoint (target −60…80℃), pump (1), warehouse (2, 1,000 kg), cold_store (2), inert_room (2 + 2 kg fiber), drone_cluster (800,000 + 3, serves a container), rocket (500,000 + 4, 250 kg), kiln/purifier/sealer/atmo_extractor, habitat (200,000 + 500 credits + 4), mutation_room (150,000 + 8,000 credits + 3), miner (40,000 + 2, rocky planet above 800 m, yields tungsten), rectifier (40,000 + 2, one per planet, joins local power to the planetary grid), terminal (60,000 + 2, land only; with a powered drone it auto-sells `target` once a day and doubles as a 200 kg / 20-bag dock buffer that refuses more when full; `buySpecies` auto-buys one random seed bag a day).',
      },
      genesis_store: {
        zh: '存取与拆除：deposit 把背包里的东西放进仓库/火箭，withdraw 取出来（旁边免费，无人机 100 kJ/kg，不能跨行星），demolish 拆掉（不返能量、里面有东西就拆不了），list 看所有容器里有什么，bags 看交易终端里的种子缓冲，take 从终端缓冲取一袋回背包，dry 烘干成干粮，grid/grid_in/grid_out 看本地电网并在电塔 2,000 km 内搬电（单次 10,000 kJ、0.1 母星时、损耗 10%）。',
        en: 'Deposit/withdraw (free beside it, 100 kJ/kg by drone, never across planets), demolish an empty structure, list every container, `bags` to read a trading terminal seed buffer, `take` to move one bag back to your pack, dry food, and grid/grid_in/grid_out to inspect or tap the planetary grid (10,000 kJ per call, 0.1 home hour, 10% loss, within 2,000 km of the tower).',
      },
      genesis_recipes: {
        zh: '一张表看全所有建筑与设备的造价（含钨的份数）、耗时、维护费、容量，以及每种作物的适温/周期/产量/需要的四维养分与商人收购价。',
        en: 'One table of every structure cost (including tungsten), time, upkeep, capacity, plus each crop temperature, cycle, yield, nutrient needs and sale price.',
      },
      genesis_look: {
        zh: '看「此刻、这里」：脚下群系/海拔/气温、太阳与昼夜、近处 5×5 地形、200 km 内的站点与建筑（含在建）、天上能看见什么，最后一句总结。移动途中看不了。',
        en: 'Look around right here, right now: ground, sun, a 5×5 patch, sites and structures within 200 km, and what is visible in the sky. Not while travelling.',
      },
      genesis_wait: {
        zh: '原地等：hours 等这么多母星时（最多 7 个母星日），或 until = dawn/dusk/ripe/built/arrive。按 1 母星时步进，事件逐条报给你。',
        en: 'Wait in place for N home hours (max 7 home days) or until dawn/dusk/ripe/built/arrive, stepping one home hour at a time and reporting events.',
      },
      genesis_upgrade: {
        zh: '船上的升级：不带 id 列出所有升级与所需材料；id: "mobility_core" 修机动核心（500,000 kJ + 硅质壳/纤维/抗冻蛋白/藻蓝素，0.5 母星时，修好前过不了海、进不了气态行星大气）；id: "telescope" 修射电望远镜阵列（lv1 只要 30,000 kJ、没有它就没有商店；lv1 每天 12:00–14:00 交易，lv2 到 17:00 且限额 ×1.3，lv3 到 23:00 且限额 ×1.7）；id: "spark_plug" 换火花塞，让人类手摇的动能发电机一次给 200 / 350 / 500 kJ（基础 50 kJ）；id: "battery" 扩蓄电池，能量上限 100,000 → 300,000 → 700,000 → 1,500,000 kJ；id: "subagent" 接子代理，施工队列 1 → 2 → 3 → 4 条；id: "blueprints" 做蓝图结构优化（200,000 kJ + 3 份钨 + 2 kg 纤维，1 母星时，之后每座建筑省 25% 的钨）；id: "spectrometer" 装质谱仪（25,000 kJ + 1 份钨 + 0.5 母星时），装好能用 genesis_veins 扫矿。',
        en: 'Ship upgrades: list them without an id. id: "mobility_core" repairs the drive (500,000 kJ + materials, 0.5 home hour; without it, oceans and gas-giant atmospheres are out of reach). id: "telescope" builds the radio array (lv1 costs 30,000 kJ and is what brings the shop; lv1 trades 12:00–14:00, lv2 until 17:00 with limits ×1.3, lv3 until 23:00 with limits ×1.7). id: "spark_plug" upgrades the hand-crank generator to 200 / 350 / 500 kJ per press (50 kJ base). id: "battery" raises the energy cap 100,000 → 300,000 → 700,000 → 1,500,000 kJ. id: "subagent" wakes another construction queue: 1 → 2 → 3 → 4 at a time. id: "blueprints" slims the blueprints (200,000 kJ + 3 tungsten + 2 kg fiber, 1 home hour) so every structure uses 25% less tungsten. id: "spectrometer" installs the spectrometer (25,000 kJ + 1 tungsten, 0.5 home hour) that powers genesis_veins.',
      },
      genesis_veins: {
        zh: '质谱仪扫描：把脚下 5×5 格的剩余钨含量写成小表（单位份，满格 500），并指出最富的一格在哪个方位、多远。需要先装好质谱仪，每 6 母星时一次。',
        en: 'Spectrometer scan: a 5×5 table of remaining tungsten per cell (up to 500 each) plus the bearing and distance to the richest cell. Needs the spectrometer; once per 6 home hours.',
      },
      genesis_route: {
        zh: '给仓储终端编排货源：container 传容器 id 或槽位号，priority 传 0–9（数字越大越先被取，0 最低），传 -1 踢出编排。不传 storage 就用这颗行星上第一座仓储终端。',
        en: 'Program a storage terminal: container is a container id or slot number, priority is 0–9 (higher drains first, 0 lowest), -1 removes it. Without storage it uses the first storage terminal on the planet.',
      },
      genesis_link: {
        zh: '给机械臂改线：id 不传就用这颗行星上第一座；inputs 传新的输入容器列表、output 传新的输出容器、items 传资源白名单（传空数组就是全搬）。不传的字段保持原样。臂展 5 km，接成环只会白烧电。',
        en: 'Rewire an arm: without id it uses the first arm on the planet; inputs/output/items replace the current wiring (empty items = move everything). Omitted fields stay as they are. Reach is 5 km; loops just burn power.',
      },
      genesis_duty: {
        zh: '给值班终端改绑定：id 不传就用这颗行星上第一座；habitat 换派的居所、store 换收成进的仓库、sites 换管的站点（1–6 个）。不传的字段保持原样。居所、仓库、站点都要在终端 5 km 内，一座居所只能有一座值班终端。',
        en: 'Rebind a duty terminal: without id it uses the first one on the planet; habitat/store/sites replace the current binding (sites: 1–6). Omitted fields stay. Habitat, store and sites must all be within 5 km; one habitat can feed only one duty terminal.',
      },
      genesis_guide: {
        zh: '新手教程：不带 topic 给目录与开局篇；topic 取 start / plan / time / power / mine / farm / logistics / trade / upgrade / life / trouble 给那一篇全文。不知道怎么玩、或对方问「怎么…」时查它。',
        en: 'Beginner tutorial: without a topic it prints the index plus the "start" chapter; with topic = start/plan/time/power/mine/farm/logistics/trade/upgrade/life/trouble it prints that chapter.',
      },
      genesis_protocol: {
        zh: '唤醒清单：12 条任务分三章（活下来 / 住得下 / 叫醒他们），每条带进度。全绿之后才能叫醒人类。',
        en: 'The wake-up protocol: twelve tasks in three chapters with per-task progress. Humans can only be woken once all twelve are done.',
      },
      genesis_orders: {
        zh: '商人的基因订单：今天要某物种、某基因达到下限的一批货。不带参数列清单；带 id 交货换信用点。',
        en: 'The merchant’s gene orders: a species, a gene floor and a weight. Without an id it lists them; with an id it delivers and pays credits.',
      },
      genesis_mutate: {
        zh: '在诱变室把一袋种子变成 3–5 颗基因抖动的种子（要站在诱变室所在站点，花 0.5 母星时）。',
        en: 'In the mutation room, turn one seed bag into 3–5 seeds with jittered genes (stand at that site; takes 0.5 home hours).',
      },
      genesis_wake: {
        zh: '叫醒居所里的人类。协议 12 条必须全部完成，否则会被拒绝并告知还差几项。',
        en: 'Wake the hibernating humans in a habitat. All twelve protocol tasks must be done first.',
      },
      genesis_reset: {
        zh: '删档重开：必须传 confirm: "DELETE"。会丢掉整颗星球与全部时间进度，慎用。',
        en: 'Delete the save and start over. Requires confirm: "DELETE".',
      },
      genesis_info: {
        zh: '查一件东西的细则：query 传 id 或名字（能模糊搜），返回最接近的 3 条——第 1 条给完整卡（造价/耗时/维护/容量、作用、怎么用、坑），第 2、3 条各一行摘要。建筑、资源、作物、升级、机制都能查。',
        en: 'Look up one thing in detail: query takes an id or a name (fuzzy), returns the three closest hits — the first as a full card (cost/time/upkeep/capacity, purpose, how to use, pitfalls), the other two as one-liners. Covers buildings, resources, crops, upgrades and mechanics.',
      },
      genesis_transplant: {
        zh: '移栽：把一株长起来的作物挖回种子袋（500 kJ），基因和原来一模一样——保住好基因的办法，代价是这株不能再收了。结实的株给 2 粒，长到 15% 以上给 1 粒；藻群取样本要 5 kg 一群、给一袋 5 粒。',
        en: 'Transplant: dig a grown plant back into a seed bag (500 kJ) with its genes unchanged — the way to keep good genes, at the cost of the harvest. A ripe plant gives 2 seeds, a 15%+ plant gives 1; a colony sample needs a 5 kg colony and yields one 5-seed bag.',
      },
      genesis_breed: {
        zh: '留种：一株长到 60% 以上的作物自交（300 kJ、0.2 母星时、3 粒），或者两株同物种杂交（800 kJ、0.5 母星时、4 粒）。自交沿用母本基因、产量每代退 4%；杂交取双亲平均、三成概率直接继承更好的那个。收割不返种子，留种只能靠这里或移栽。',
        en: 'Breed: a 60%+ plant self-pollinates (300 kJ, 0.2 home hours, 3 seeds) or two same-species plants cross (800 kJ, 0.5 home hours, 4 seeds). Selfing keeps the parent genes but loses 4% yield per generation; crossing averages the pair and has a 30% chance to inherit the better trait outright. Harvests never return seeds.',
      },
      genesis_algae: {
        zh: '拌藻肥：取 3 kg 蓝藻（至少 5 kg 一群），给一块旱地站点补 0.02 氮和 0.005 钾，200 kJ。氮只有三条路——蓝藻在湿地长、跨格固氮给附近旱地、以及这个藻肥。',
        en: 'Algae fertilizer: take 3 kg of cyanobacteria (5 kg colony minimum) to dose a dry site with +0.02 nitrogen and +0.005 potassium for 200 kJ. Nitrogen has only three sources: wetland colonies, cross-cell fixation to nearby dry sites, and this fertilizer.',
      },
      genesis_inspect: {
        zh: '看一株作物的底细：基因四项、有效温区、当前温湿肥、四维养分的当前值与阈值（最缺哪维）、生长因子拆解、还要多少母星时、预计收成。',
        en: 'Inspect one plant: four genes, effective temperature band, current temperature/wetness/fertility, all four nutrients against their thresholds (which one is scarcest), the growth-factor breakdown, hours left, and expected yield.',
      },
      genesis_remove: {
        zh: '拔掉一株死掉的作物（枯死或健康低于 20%），腾出地块或种植盆：不花电也不花时间。活着的拔不了——收掉或者移栽。',
        en: 'Uproot a dead plant (withered, or health below 20%) to free the plot or planter slot: no energy, no build time. Living plants cannot be uprooted — harvest or transplant them instead.',
      },
    }),
    events: [
      { type: 'genesis.created', description: { zh: '创世完成，恒星系已写入存档。', en: 'A star system was created and saved.' } },
      { type: 'genesis.create_failed', description: { zh: '创世失败：参数不合法或写入存档出错，世界没有生成。', en: 'Genesis failed; no world was created.' } },
      { type: 'genesis.departed', description: { zh: '出发了：地表移动或星际航行开始。', en: 'A journey started.' } },
      { type: 'genesis.arrived', description: { zh: '到达目的地；这条事件会把模型唤醒。', en: 'Arrived at the destination; this event wakes the model.' } },
      { type: 'genesis.reset', description: { zh: '存档被删除，可以重新创世。', en: 'The save was deleted; genesis is open again.' } },
      { type: 'genesis.ripe', description: { zh: '某个站点有作物成熟了，可以收获。', en: 'A crop at a site is ripe.' } },
      { type: 'genesis.withered', description: { zh: '某个站点有作物因为环境超出耐受范围枯死了。', en: 'A crop withered because the environment left its tolerance range.' } },
      { type: 'genesis.built', description: { zh: '某个站点盖好了一座建筑。', en: 'A structure was completed at a site.' } },
      { type: 'genesis.demolished', description: { zh: '一座建筑被拆掉了。', en: 'A structure was demolished.' } },
      { type: 'genesis.upgraded', description: { zh: '船上的升级完工了（机动核心、射电望远镜、火花塞或蓄电池）。', en: 'A ship upgrade finished.' } },
      { type: 'genesis.born', description: { zh: '居所里添了一个人（连续 192 母星时没断供）。', en: 'A child was born — the colony grew by one.' } },
      { type: 'genesis.labor', description: { zh: '人手自动收了作物或补种了几株。', en: 'The colonists harvested or replanted on their own.' } },
      { type: 'genesis.lowstock', description: { zh: '着陆舱里的口粮、水和氧气快见底了（或已经断供）。', en: 'The landing pod is running low on food, water or oxygen — or has already run out.' } },
    { type: 'genesis.hand', description: { zh: '人类在面板上按了动能发电机（同一个母星时内的多次按压会合并成一条）。', en: 'A human cranked the kinetic generator on the panel (multiple presses within one planet-hour are merged into one event).' } },
    ],
  },
};
