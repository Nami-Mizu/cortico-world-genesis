/** 面板文案：中文/英文两套，按 `ctx.language` 选。 */

export interface Text {
  title: string;
  desc: string;
  loading: string;
  seed: string;
  star: string;
  planets: string;
  moons: string;
  starName: string;
  homeName: string;
  create: string;
  reset: string;
  saveTitle: string;
  saveExport: string;
  resetTitle: string;
  resetBody: string;
  created: string;
  locked: string;
  hint: string;
  hintNumber: string;
  hintText: string;
  seedHint: string;
  /** 滑块读数：1.00 M☉ / 0.30 M☉（暗红矮星）… */
  starMassValue: (mass: number) => string;
  /** 这颗种子会长出什么：「这颗种子：5 颗行星 · 每颗最多 3 颗卫星」。 */
  shapePreview: (planets: number, moons: number, minPlanets: number, maxPlanets: number) => string;
  mapTitle: string;
  mapDesc: string;
  mapPick: string;
  mapNoBody: string;
  mapLoading: string;
  mapOcean: string;
  mapWind: string;
  mapMoon: string;
  mapLegend: string;
  powerTitle: string;
  energy: string;
  generator: string;
  generatorBusy: string;
  generatorHint: string;
  gridIn: string;
  gridOut: string;
  gridStored: string;
  speedTitle: string;
  speedHint: (speed: number, realMinutes: number) => string;
  charterNone: string;
  charterTourism: (reputation: number, visitors: number, docks: number, lodges: number) => string;
  charterTech: (compute: number, staff: number, cap: number, fabs: number) => string;
  wonderLine: (label: string, percent: number) => string;
  bedsInfo: (lodge: number, housing: number) => string;
  tempWarning: (list: string) => string;
  wondersDone: (count: number) => string;
  gridReach: string;
  gridFar: string;
  gridTowerAt: string;
  gridNoTower: string;
  tungsten: string;
  /** 着陆舱补给那一行：「着陆舱：粮 40 kg、水 160 L、氧 24 kg · 20 个人睡着，还够 171 母星时」。 */
  shipLine: (food: number, water: number, oxygen: number, sleepers: number, hours: number) => string;
  /** 面板上的「买一张星图」按钮。 */
  buyChart: string;
  buyFertilizer: string;
  spreadFertilizer: string;
  /** 星图天体的「去这里」按钮。 */
  goHere: string;
  /** 种植盆。 */
  planterName: string;
  planterOk: string;
  planterOff: string;
  monitorTitle: string;
  monitorInstall: string;
  monitorCount: string;
  monitorStar: string;
  monitorNone: string;
  floraTitle: string;
  floraNone: string;
  floraSite: string;
  floraShop: string;
  floraInventory: string;
  floraEmpty: string;
  floraBags: string;
  floraPlant: string;
  floraHarvest: string;
  /** 站点这一格的湿度与肥力标签（2.1.6）。 */
  floraWet: string;
  floraFert: string;
  floraTransplant: string;
  floraRemove: string;
  floraInspect: string;
  floraBreed: string;
  floraClosed: string;
  storeTitle: string;
  storeRefresh: string;
  storeDeposit: string;
  storeWithdraw: string;
  storeDemolish: string;
  terminalBuffer: string;
  terminalFull: string;
  terminalTake: string;
  travelTitle: string;
  travelGo: string;
  travelHint: string;
  lookHere: string;
  surveyHere: string;
  surveyDone: string;
  lookHint: string;
  veinsHere: string;
  waitDawn: string;
  waitDusk: string;
  waitNoon: string;
  waitRipe: string;
  waitBuilt: string;
  waitArrive: string;
  buildTitle: string;
  buildHere: string;
  buildSite: string;
  buildBusy: string;
  buildSlots: string;
  buildFull: string;
  lifeTitle: string;
  lifeProtocol: string;
  lifeHabitat: string;
  lifeHours: string;
  lifeOrder: string;
  lifeDeliver: string;
  lifeCylinder: string;
  lifeWake: string;
  lifeLocked: string;
  buildNone: string;
  detailTitle: string;
  detailContents: string;
  armLine: string;
  dutyLine: string;
  armCycle: string;
  habitatLine: string;
  comfortOk: string;
  comfortHot: string;
  comfortCold: string;
  detailEmpty: string;
  detailDemolish: string;
  detailNear: string;
  detailClose: string;
  upTitle: string;
  upDesc: string;
  upEnergy: string;
  upRepair: string;
  upRepairing: string;
  upReady: string;
  upBroken: string;
  upMaxed: string;
  upUpgrade: string;
  upWindow: string;
  upLimit: string;
  upBenefit: string;
  upRefresh: string;
  upLocked: string;
  upNeed: string;
  protoTitle: string;
  protoDesc: string;
  protoDone: string;
  protoRefresh: string;
  protoHabitat: string;
  protoAwake: string;
  protoDormant: string;
  protoFood: string;
  protoWater: string;
  protoOxygen: string;
  protoHours: string;
  protoWake: string;
  recreateTitle: string;
  recreateDesc: string;
  recreateSeed: string;
  recreateMass: string;
  recreateGo: string;
  recreateBlocked: string;
  recreateDone: string;
  protoAwakened: string;
  protoLocked: string;
  protoPopulation: string;
  protoSleepers: string;
  protoLabor: string;
  protoBirthProgress: string;
  guideTitle: string;
  guideDesc: string;
  guidePick: string;
  guideEmpty: string;
  guideSearch: string;
  guideSearchHint: string;
  guideTools: string;
  shopTitle: string;
  shopDesc: string;
  shopOpenNow: string;
  shopClosedNow: string;
  shopWindowLabel: string;
  shopNextOpen: (hours: number) => string;
  shopCredits: string;
  shopEnergy: string;
  shopTungsten: string;
  shopSellHeader: string;
  shopBuyHeader: string;
  shopOrdersHeader: string;
  shopHeld: (amount: string) => string;
  shopSell: (name: string, unit: string) => string;
  shopBuy: (name: string) => string;
  shopDeliver: string;
  shopNoOrders: string;
  protoClear: string;
}

export const ZH: Text = {
  title: '创世记',
  desc: '一颗星，只成形一次。选好种子与几个旋钮，写进存档后就锁定。',
  loading: '正在读取存档…',
  seed: '种子',
  star: '恒星质量（太阳质量）',
  planets: '行星数',
  moons: '每颗行星的卫星上限',
  starName: '恒星的名字',
  homeName: '母星的名字',
  create: '创世',
  reset: '删档重开',
  saveTitle: '存档',
  saveExport: '导出存档',
  resetTitle: '确定要删掉这颗星球吗？',
  resetBody: '存档会被删除，之后可以重新创世。已经发生的故事不会回来。',
  created: '创世完成，已锁定。',
  locked: '已创世 · 锁定',
  hint: '同一种子与同一组旋钮永远得到同一个星系；换存档等于换一颗星。',
  hintNumber: '数字种子：同一个数字 + 这颗恒星，永远是同一个星系。想换世界就改数字。',
  hintText: '文字种子会被哈希成数字：同一句话永远是同一个星系，大小写与空格也算数。',
  seedHint: '数字，或任意一句话',
  starMassValue: (mass) => {
    const label = mass < 0.45 ? '红矮星' : mass < 0.8 ? '橙矮星' : mass < 1.1 ? '类太阳' : mass < 1.5 ? '亮黄星' : 'A 型星';
    return `${mass.toFixed(2)} M☉（${label}）`;
  },
  shapePreview: (planets, moons, minPlanets, maxPlanets) =>
    `这颗种子：${planets} 颗行星（这颗恒星给它 ${minPlanets}–${maxPlanets} 颗之间的位置）· 每颗最多 ${moons} 颗卫星`,
  mapTitle: '天体环境（墨卡托）',
  mapDesc: '按群系上色；划过或点一下看那个格子的纬度、经度与群系。岩石行星还有海拔，气态/冰巨星看风暴带。',
  mapPick: '天体',
  mapNoBody: '这个恒星系里没有能画地图的天体。',
  mapLoading: '正在画地图…',
  mapOcean: '海洋占比',
  mapWind: '风速',
  mapMoon: '卫星地表',
  mapLegend: '图例',
  powerTitle: '能量',
  energy: '能量',
  generator: '动能发电机（+{kj} kJ）',
  generatorBusy: '动能发电机（冷却中…）',
  generatorHint: '只有你能按；Agent 不会自己发电，缺电时会来求你。现在一次 {kj} kJ，0.5 秒冷却。修【火花塞】能让它更省力。',
  gridIn: '从电网搬电（-10%）',
  speedTitle: '时间倍速',
  speedHint: (x: number, realMin: number) => `${x} 倍：一个母星时 ${realMin.toFixed(2)} 分钟现实时间。`,
  charterNone: '还没选执照：去商店买【星际广播 · 旅游星系】或【星际广播 · 技术星系】（一局只能选一张）。',
  charterTourism: (rep: number, visitors: number, docks: number, lodges: number) =>
    `旅游星系 · 知名度 ${rep.toFixed(1)}/100 · 昨日到港 ${visitors} 位 · ${docks} 个停泊位 / ${lodges} 床`,
  charterTech: (compute: number, staff: number, cap: number, fabs: number) =>
    `技术星系 · 计算力 ${compute.toFixed(1)} · 员工 ${staff}/${cap} · ${fabs} 座晶圆厂`,
  gridOut: '把电送进电网（-10%）',
  bedsInfo: (lodge, housing) => `床位：访客 ${lodge} · 员工 ${housing}（太热太冷的不算）`,
  tempWarning: (list) => `⚠ 住不下：${list}`,
  wonderLine: (label, percent) => `奇观：${label} · ${percent}%`,
  wondersDone: (count) => `已落成奇观 ${count} 座`,
  gridStored: '本地电网：',
  gridReach: '电塔就在',
  gridFar: '离电塔',
  gridTowerAt: '电塔在',
  gridNoTower: '这颗星还没有【整流电塔】：帆发的电直接进电池，设备也没法在本地取电。',
  tungsten: '钨',
  shipLine: (food, water, oxygen, sleepers, hours) =>
    `着陆舱：粮 ${food} kg、水 ${water} L、氧 ${oxygen} kg · ${sleepers} 个人睡着，大约还够 ${hours} 母星时`,
  buyChart: '买一张星图（300 信用点）',
  buyFertilizer: '买 5 kg 复合肥',
  spreadFertilizer: '撒 1 kg 复合肥',
  goHere: '去这里',
  planterName: '种植盆',
  planterOk: '通电，22℃',
  planterOff: '断电，跟着外面冷热',
  monitorTitle: '环境监测器',
  monitorInstall: '在这颗天体装一台（150,000 kJ）',
  monitorCount: '已监测',
  monitorStar: '（恒星全貌已解锁）',
  monitorNone: '还没有装监测器的天体：看不到细节，也画不了地图。',
  floraTitle: '农场',
  floraNone: '还没有站点。走到地方以后，让 Agent 用 genesis_site 建一个。',
  floraSite: '在脚下建站点',
  floraShop: '商人',
  floraInventory: '仓库',
  floraEmpty: '空',
  floraBags: '种子袋',
  floraPlant: '种下',
  floraHarvest: '收成熟',
  floraWet: '湿度',
  floraFert: '肥力',
  floraTransplant: '移栽',
  floraRemove: '拔掉',
  floraInspect: '详情',
  floraBreed: '留种',
  floraClosed: '商人不在',
  storeTitle: '背包与仓库',
  storeRefresh: '刷新',
  storeDeposit: '存 10 kg',
  storeWithdraw: '取 10 kg',
  storeDemolish: '拆掉',
  terminalBuffer: '收货口缓冲',
  terminalFull: '满了：商人不再收货，等无人机或你自己来搬',
  terminalTake: '取一袋',
  travelTitle: '去别处',
  travelGo: '去',
  travelHint: '填经纬度，走过去（不是瞬移，到了会收到事件）。',
  lookHere: '看附近',
  surveyHere: '测绘一圈',
  surveyDone: '测过了',
  lookHint: '和模型调用 genesis_look 看到的是同一段文字。',
  veinsHere: '扫描矿脉',
  waitDawn: '等到天亮',
  waitDusk: '等到天黑',
  waitNoon: '等到中午（商店开门）',
  waitRipe: '等到作物熟',
  waitBuilt: '等到完工',
  waitArrive: '等到抵达',
  buildTitle: '建造',
  buildHere: '在原地建',
  buildSite: '在这里建站点',
  buildBusy: '在建',
  buildSlots: '施工队列',
  buildFull: '队列满了——去【升级】修子代理',
  lifeTitle: '协议与生命维持',
  lifeProtocol: '协议',
  lifeHabitat: '居所',
  lifeHours: '还能撑',
  lifeOrder: '基因订单',
  lifeDeliver: '交货',
  lifeCylinder: '买 10 个钢瓶',
  lifeWake: '叫醒人类',
  lifeLocked: '协议没全绿，还叫不醒。',
  buildNone: '没有在施工的工程。',
  detailTitle: '建筑',
  detailContents: '内容物',
  armLine: '机械臂',
  dutyLine: '值班终端',
  armCycle: '⚠ 这条线接成环了：货会在几座臂之间来回倒，白烧电。',
  habitatLine: '室内',
  comfortOk: '住得下',
  comfortHot: '太热了，人不会住',
  comfortCold: '太冷了，人不会住',
  detailEmpty: '里面是空的。',
  detailDemolish: '拆掉',
  detailNear: '走到附近',
  detailClose: '关掉',
  upTitle: '升级',
  upDesc: '船身上的东西。迫降时烧坏的部件在这里修——修好之前，有些地方去不了。',
  upEnergy: '能量',
  upRepair: '修',
  upRepairing: '正在修',
  upReady: '已修复',
  upBroken: '损坏',
  upMaxed: '已到顶',
  upUpgrade: '升级',
  upWindow: '营业时间',
  upLimit: '每日限额',
  upBenefit: '下一级',
  upRefresh: '刷新',
  upLocked: '还没有创世。',
  upNeed: '需要',
  protoTitle: '协议',
  protoDesc: '叫醒船上的人要做的事，分三章。全部完成之后，这里的按钮就能把休眠舱打开。',
  protoDone: '完成',
  protoRefresh: '刷新',
  protoHabitat: '居所',
  protoAwake: '清醒',
  protoDormant: '休眠',
  protoFood: '食物',
  protoWater: '饮用水',
  protoOxygen: '氧气',
  protoHours: '还能撑',
  protoWake: '叫醒他们',
  recreateTitle: '再创世',
  recreateDesc: '带着档案去下一张地图：1,000,000 kJ 能量、100 kg 氘氚燃料、1 份异星生命样本，机动核心还得是修好的。旧地图会归档作废，所有人回休眠舱。',
  recreateSeed: '种子',
  recreateMass: '恒星质量',
  recreateGo: '点火，去下一颗星',
  recreateBlocked: '还差这些',
  recreateDone: '点火了——飞向下一颗星。',
  protoAwakened: '人类已经醒了。',
  protoLocked: '还没有创世。先去「这一颗星球」页签创一次世，这里才会长出清单。',
  protoPopulation: '常住人口',
  protoSleepers: '休眠舱里还剩',
  protoLabor: '人手',
  protoBirthProgress: '下一胎进度（母星时）',
  guideTitle: '手册',
  guideDesc: '和 genesis_guide 同一份教程。左边挑一篇，右边看正文——改文案去 src/guide/*.md。',
  guidePick: '挑一篇：',
  guideEmpty: '挑一篇。不确定从哪看，先看「醒来」，再看「路线图」。',
  guideSearch: '查东西',
  guideSearchHint: '查一件东西：温室、钨、腐烂、duty…',
  guideTools: '工具表',
  shopTitle: '商店',
  shopDesc: '商人只在一定的时间来：卖货、买种子与设备、交订单都在这里。关张时按钮是灰的，价目照看。',
  shopOpenNow: '开张中',
  shopClosedNow: '关张',
  shopWindowLabel: '营业时间',
  shopNextOpen: (hours) => '还有 ' + hours + ' 母星时开张',
  shopCredits: '信用点',
  shopEnergy: '能量',
  shopTungsten: '钨',
  shopSellHeader: '卖给他',
  shopBuyHeader: '从他这买',
  shopOrdersHeader: '他带来的订单',
  shopHeld: (amount) => '手里 ' + amount,
  shopSell: (name, unit) => '卖 ' + unit + ' ' + name,
  shopBuy: (name) => '买 ' + name,
  shopDeliver: '交货',
  shopNoOrders: '这一会儿没有订单。',
  protoClear: '全部完成。',
};

export const EN: Text = {
  title: 'Genesis',
  desc: 'One star, formed once. Pick a seed and a few knobs; locked after saving.',
  loading: 'Reading the save…',
  seed: 'Seed',
  star: 'Star mass (solar masses)',
  planets: 'Planets',
  moons: 'Moons per planet (max)',
  starName: 'Star name',
  homeName: 'Home world name',
  create: 'Create',
  reset: 'Delete save',
  saveTitle: 'Save',
  saveExport: 'Export save',
  resetTitle: 'Delete this world?',
  resetBody: 'The save is removed and genesis opens again. The story so far does not come back.',
  created: 'Created and locked.',
  locked: 'Locked',
  hint: 'Same seed and knobs always give the same system; a new save means a new star.',
  hintNumber: 'Numeric seed: the same number with this star always gives the same system.',
  hintText: 'A text seed is hashed into a number: the same phrase always gives the same system — case and spaces count.',
  seedHint: 'A number, or any phrase',
  starMassValue: (mass) => {
    const label = mass < 0.45 ? 'red dwarf' : mass < 0.8 ? 'orange dwarf' : mass < 1.1 ? 'sun-like' : mass < 1.5 ? 'bright yellow' : 'A-type';
    return `${mass.toFixed(2)} M☉ (${label})`;
  },
  shapePreview: (planets, moons, minPlanets, maxPlanets) =>
    `This seed: ${planets} planets (between ${minPlanets} and ${maxPlanets}) · up to ${moons} moons each`,
  mapTitle: 'Body environment (Mercator)',
  mapDesc: 'Colored by biome; hover or click a cell to see its lat/lon and biome. Rocky planets also show elevation, gas/ice giants show storm bands.',
  mapPick: 'Body',
  mapNoBody: 'No body in this system can be mapped.',
  mapLoading: 'Drawing the map…',
  mapOcean: 'Ocean',
  mapWind: 'Wind',
  mapMoon: 'Moon surface',
  mapLegend: 'Legend',
  powerTitle: 'Energy',
  energy: 'Energy',
  generator: 'Kinetic generator (+{kj} kJ)',
  generatorBusy: 'Kinetic generator (cooling…)',
  generatorHint: 'Only you can press it; the agent never generates power and will ask you when it needs some. Now {kj} kJ per press, 0.5 s cooldown. Repairing the spark plug makes it go further.',
  gridIn: 'Tap the grid (−10%)',
  speedTitle: 'Time speed',
  speedHint: (x: number, realMin: number) => `${x}× — one home hour is ${realMin.toFixed(2)} real minutes.`,
  charterNone: 'No charter yet: buy a broadcast licence (tourism or tech) at the shop — one per run.',
  charterTourism: (rep: number, visitors: number, docks: number, lodges: number) =>
    `Tourism · fame ${rep.toFixed(1)}/100 · ${visitors} visitors yesterday · ${docks} docks / ${lodges} beds`,
  charterTech: (compute: number, staff: number, cap: number, fabs: number) =>
    `Tech · compute ${compute.toFixed(1)} · staff ${staff}/${cap} · ${fabs} fabs`,
  gridOut: 'Feed the grid (−10%)',
  bedsInfo: (lodge, housing) => `Beds: guests ${lodge} · staff ${housing} (hot/cold ones don’t count)`,
  tempWarning: (list) => `⚠ Unlivable: ${list}`,
  wonderLine: (label, percent) => `Wonder: ${label} · ${percent}%`,
  wondersDone: (count) => `${count} wonder(s) standing`,
  gridStored: 'Local grid: ',
  gridReach: 'tower is',
  gridFar: 'tower is',
  gridTowerAt: 'at',
  gridNoTower: 'This planet has no rectifier tower: sails charge the battery directly, and nothing here can draw local power.',
  tungsten: 'tungsten',
  shipLine: (food, water, oxygen, sleepers, hours) =>
    `Landing pod: ${food} kg food, ${water} L water, ${oxygen} kg oxygen · ${sleepers} asleep, about ${hours} home-hours left`,
  buyChart: 'Buy a star chart (300 credits)',
  buyFertilizer: 'Buy 5 kg fertilizer',
  spreadFertilizer: 'Spread 1 kg fertilizer',
  goHere: 'Fly there',
  planterName: 'planter',
  planterOk: 'powered, 22 °C',
  planterOff: 'unpowered — takes the outside weather',
  monitorTitle: 'Environment monitor',
  monitorInstall: 'Install one on this body (150,000 kJ)',
  monitorCount: 'Monitored',
  monitorStar: '(star fully unlocked)',
  monitorNone: 'No monitors yet: no details, no maps.',
  floraTitle: 'Farm',
  floraNone: 'No sites yet. Walk somewhere and have the agent found one with genesis_site.',
  floraSite: 'Found a site here',
  floraShop: 'Merchant',
  floraInventory: 'Stock',
  floraEmpty: 'empty',
  floraBags: 'Seed bags',
  floraPlant: 'Sow',
  floraHarvest: 'Harvest',
  floraWet: 'wet',
  floraFert: 'fertile',
  floraTransplant: 'Transplant',
  floraRemove: 'Uproot',
  floraInspect: 'Details',
  floraBreed: 'Breed',
  floraClosed: 'Merchant is away',
  storeTitle: 'Backpack & stores',
  storeRefresh: 'Refresh',
  storeDeposit: 'Deposit 10 kg',
  storeWithdraw: 'Withdraw 10 kg',
  storeDemolish: 'Demolish',
  terminalBuffer: 'Dock buffer',
  terminalFull: 'Full — the merchant takes no more; a drone or you must clear it',
  terminalTake: 'Take a bag',
  travelTitle: 'Travel',
  travelGo: 'Go',
  travelHint: 'Enter lat/lon. You walk there over time; an event arrives when you get there.',
  lookHere: 'Look around',
  surveyHere: 'Survey here',
  surveyDone: 'Already surveyed',
  lookHint: 'Same text the model gets from genesis_look.',
  veinsHere: 'Scan veins',
  waitDawn: 'Wait for dawn',
  waitDusk: 'Wait for dusk',
  waitNoon: 'Wait for noon (shop opens)',
  waitRipe: 'Wait for a crop',
  waitBuilt: 'Wait for build',
  waitArrive: 'Wait for arrival',
  buildTitle: 'Build',
  buildHere: 'Build here',
  buildSite: 'Found a site here',
  buildBusy: 'Under construction',
  buildSlots: 'Build queue',
  buildFull: 'queue full — repair subagents in Upgrades',
  lifeTitle: 'Protocol & life support',
  lifeProtocol: 'Protocol',
  lifeHabitat: 'Habitat',
  lifeHours: 'holds for',
  lifeOrder: 'Gene orders',
  lifeDeliver: 'Deliver',
  lifeCylinder: 'Buy 10 cylinders',
  lifeWake: 'Wake the humans',
  lifeLocked: 'Protocol not complete yet.',
  buildNone: 'Nothing under construction.',
  detailTitle: 'Structure',
  detailContents: 'Contents',
  armLine: 'Arm',
  dutyLine: 'Duty terminal',
  armCycle: '⚠ This line loops: goods will shuttle between arms and burn power.',
  habitatLine: 'Indoor',
  comfortOk: 'livable',
  comfortHot: 'too hot — nobody will stay',
  comfortCold: 'too cold — nobody will stay',
  detailEmpty: 'Empty.',
  detailDemolish: 'Demolish',
  detailNear: 'Walk over',
  detailClose: 'Close',
  upTitle: 'Upgrades',
  upDesc: 'Parts of the ship. What the crash burned out gets repaired here; some places stay out of reach until then.',
  upEnergy: 'Energy',
  upRepair: 'Repair',
  upRepairing: 'Repairing',
  upReady: 'Repaired',
  upBroken: 'Broken',
  upMaxed: 'Fully upgraded',
  upUpgrade: 'Upgrade',
  upWindow: 'Trade window',
  upLimit: 'Daily limit',
  upBenefit: 'Next level',
  upRefresh: 'Refresh',
  upLocked: 'No world yet.',
  upNeed: 'needs',
  protoTitle: 'Protocol',
  protoDesc: 'What it takes to wake the people aboard, in three chapters. When every line is done, the button here opens the pods.',
  protoDone: 'done',
  protoRefresh: 'Refresh',
  protoHabitat: 'Habitat',
  protoAwake: 'awake',
  protoDormant: 'dormant',
  protoFood: 'food',
  protoWater: 'water',
  protoOxygen: 'oxygen',
  protoHours: 'lasts',
  protoWake: 'Wake them',
  recreateTitle: 'Recreate',
  recreateDesc: 'Carry the profile to a new map: 1,000,000 kJ, 100 kg of deuterium fuel, 1 alien sample, and a repaired mobility core. The old map is archived and sealed; everyone goes back into the pods.',
  recreateSeed: 'Seed',
  recreateMass: 'Star mass',
  recreateGo: 'Ignite — fly to the next star',
  recreateBlocked: 'Not yet',
  recreateDone: 'Ignited — on our way to the next star.',
  protoAwakened: 'The people are awake.',
  protoLocked: 'Nothing has been created yet — create a world in the "This world" tab first.',
  protoPopulation: 'Colonists',
  protoSleepers: 'Still asleep',
  protoLabor: 'Hands',
  protoBirthProgress: 'Next birth (home hours)',
  guideTitle: 'Manual',
  guideDesc: 'The same chapters genesis_guide serves. Pick one on the left; edit the text in src/guide/*.md.',
  guidePick: 'Chapters:',
  guideEmpty: 'Pick a chapter. If you are not sure, start with "Waking up", then "Roadmap".',
  guideSearch: 'Look up',
  guideSearchHint: 'Look up one thing: greenhouse, tungsten, rot, duty…',
  guideTools: 'All tools',
  shopTitle: 'Shop',
  shopDesc: 'The merchant only comes around at certain hours: selling, buying seeds and gear, handing in orders — all here. Buttons grey out when he is away; prices stay visible.',
  shopOpenNow: 'Open',
  shopClosedNow: 'Closed',
  shopWindowLabel: 'Hours',
  shopNextOpen: (hours) => 'Opens in ' + hours + ' home hours',
  shopCredits: 'Credits',
  shopEnergy: 'Energy',
  shopTungsten: 'Tungsten',
  shopSellHeader: 'Sell',
  shopBuyHeader: 'Buy',
  shopOrdersHeader: 'His orders',
  shopHeld: (amount) => 'You hold ' + amount,
  shopSell: (name, unit) => 'Sell ' + unit + ' ' + name,
  shopBuy: (name) => 'Buy ' + name,
  shopDeliver: 'Deliver',
  shopNoOrders: 'No orders right now.',
  protoClear: 'All done.',
};

export function text(language: string): Text {
  return language.startsWith('zh') ? ZH : EN;
}
