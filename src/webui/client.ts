import type { WebUiClientBundle, WebUiPanel, WebUiPanelContext } from 'cortico/web/shared/client-panel.ts';
import type { GenesisPanelState, GenesisProtocolPanel, GenesisSurfaceMap, GenesisUpgradeState } from '../panel-types.ts';

interface Text {
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
  gridReach: string;
  gridFar: string;
  gridTowerAt: string;
  gridNoTower: string;
  tungsten: string;
  /** 着陆舱补给那一行：「着陆舱：粮 40 kg、水 160 L、氧 24 kg · 20 个人睡着，还够 171 母星时」。 */
  shipLine: (food: number, water: number, oxygen: number, sleepers: number, hours: number) => string;
  /** 面板上的「买一张星图」按钮。 */
  buyChart: string;
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
  protoClear: string;
}

const ZH: Text = {
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
  gridOut: '把电送进电网（-10%）',
  gridStored: '本地电网：',
  gridReach: '电塔就在',
  gridFar: '离电塔',
  gridTowerAt: '电塔在',
  gridNoTower: '这颗星还没有【整流电塔】：帆发的电直接进电池，设备也没法在本地取电。',
  tungsten: '钨',
  shipLine: (food, water, oxygen, sleepers, hours) =>
    `着陆舱：粮 ${food} kg、水 ${water} L、氧 ${oxygen} kg · ${sleepers} 个人睡着，大约还够 ${hours} 母星时`,
  buyChart: '买一张星图（300 信用点）',
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
  protoClear: '全部完成。',
};

const EN: Text = {
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
  gridOut: 'Feed the grid (−10%)',
  gridStored: 'Local grid: ',
  gridReach: 'tower is',
  gridFar: 'tower is',
  gridTowerAt: 'at',
  gridNoTower: 'This planet has no rectifier tower: sails charge the battery directly, and nothing here can draw local power.',
  tungsten: 'tungsten',
  shipLine: (food, water, oxygen, sleepers, hours) =>
    `Landing pod: ${food} kg food, ${water} L water, ${oxygen} kg oxygen · ${sleepers} asleep, about ${hours} home-hours left`,
  buyChart: 'Buy a star chart (300 credits)',
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
  protoClear: 'All done.',
};

function text(language: string): Text {
  return language.startsWith('zh') ? ZH : EN;
}

const BIOME_LABELS = [
  '海洋', '冰盖', '苔原', '高山', '沙漠', '草原', '稀树草原', '针叶林', '温带森林', '热带季雨林', '热带雨林',
  '卫星', '平静带', '微风带', '风暴带', '强风暴带', '巨型风暴',
];
const BIOME_COLORS = [
  '#1f6fb2', // 0 海洋
  '#e8f4fb', // 1 冰盖
  '#9aa9a0', // 2 苔原
  '#8a7a6a', // 3 高山
  '#e0c070', // 4 沙漠
  '#a8c478', // 5 草原
  '#c2b06a', // 6 稀树草原
  '#5e7a52', // 7 针叶林
  '#4e8a44', // 8 温带森林
  '#3f9e5f', // 9 热带季雨林
  '#1f7a3f', // 10 热带雨林
  '#9a9aa0', // 11 卫星
  '#9fd0e8', // 12 平静带
  '#5ba6c9', // 13 微风带
  '#4a7fb5', // 14 风暴带
  '#7a5fb5', // 15 强风暴带
  '#c14b6b', // 16 巨型风暴
];

const MERC_LIMIT_DEG = 85;

function mercY(latDeg: number): number {
  const rad = (Math.min(MERC_LIMIT_DEG, Math.max(-MERC_LIMIT_DEG, latDeg)) * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
}

function yPx(latDeg: number, height: number): number {
  const half = mercY(MERC_LIMIT_DEG);
  return (1 - (mercY(latDeg) + half) / (2 * half)) * height;
}

function xPx(lonDeg: number, width: number): number {
  return ((lonDeg + 180) / 360) * width;
}

function pxToLatDeg(y: number, height: number): number {
  const half = mercY(MERC_LIMIT_DEG);
  const m = half - (y / height) * 2 * half;
  return ((2 * Math.atan(Math.exp(m)) - Math.PI / 2) * 180) / Math.PI;
}

function pxToLonDeg(x: number, width: number): number {
  return (x / width) * 360 - 180;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** 一行「标签 + 控件 + 说明」。控件既可以是 input，也可以是一整块（比如带读数的滑块）。 */
function field(ui: WebUiPanelContext['ui'], label: string, input: HTMLElement, hint: string): HTMLElement {
  const row = ui.h('div');
  row.style.display = 'grid';
  row.style.gap = '4px';
  const help = ui.h('span', 'muted', hint);
  help.style.fontSize = '12px';
  row.append(ui.h('label', 'muted', label), input, help);
  return row;
}

const WIDTH = 720;
const HEIGHT = 360;

function drawMap(canvas: HTMLCanvasElement, map: GenesisSurfaceMap): void {
  const context = canvas.getContext('2d');
  if (!context) return;
  context.clearRect(0, 0, WIDTH, HEIGHT);
  const { grid } = map;
  const lonStep = 360 / grid.lon;
  const latStep = 180 / grid.lat;
  for (let i = 0; i < grid.lat; i += 1) {
    const latTop = -90 + i * latStep;
    const latBottom = latTop + latStep;
    for (let j = 0; j < grid.lon; j += 1) {
      const lonLeft = -180 + j * lonStep;
      const lonRight = lonLeft + lonStep;
      const x0 = xPx(lonLeft, WIDTH);
      const x1 = xPx(lonRight, WIDTH);
      const y0 = yPx(latTop, HEIGHT);
      const y1 = yPx(latBottom, HEIGHT);
      context.fillStyle = BIOME_COLORS[map.biome[i]![j]!] ?? '#000';
      context.fillRect(x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0));
    }
  }
  // 群系改造：在底色上叠目标群系的颜色，透明度就是进度——1 这里一格正在变成新样子。
  for (const cell of map.terra ?? []) {
    if (!(cell.p > 0)) continue;
    const latTop = -90 + cell.i * latStep;
    const lonLeft = -180 + cell.j * lonStep;
    const x0 = xPx(lonLeft, WIDTH);
    const x1 = xPx(lonLeft + lonStep, WIDTH);
    const y0 = yPx(latTop + latStep, HEIGHT);
    const y1 = yPx(latTop, HEIGHT);
    context.globalAlpha = Math.min(1, Math.max(0, cell.p));
    context.fillStyle = BIOME_COLORS[cell.targetBiome] ?? '#fff';
    context.fillRect(x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0));
    context.globalAlpha = 1;
  }
  // 采掘留下的疤：叠一层灰褐，越矿越深——地图上能一眼看出哪片山被挖薄了。
  for (const cell of map.scar ?? []) {
    if (!(cell.v > 0)) continue;
    const latTop = -90 + cell.i * latStep;
    const lonLeft = -180 + cell.j * lonStep;
    const x0 = xPx(lonLeft, WIDTH);
    const x1 = xPx(lonLeft + lonStep, WIDTH);
    const y0 = yPx(latTop + latStep, HEIGHT);
    const y1 = yPx(latTop, HEIGHT);
    context.globalAlpha = Math.min(0.75, Math.max(0, cell.v) * 0.75);
    context.fillStyle = '#6b5a4a';
    context.fillRect(x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0));
    context.globalAlpha = 1;
  }
}

const panel: WebUiPanel = {
  async mount(ctx) {
    const t = text(ctx.language);
    const sheet = ctx.ui.sheet({ title: t.title, desc: t.desc });
    const box = ctx.ui.h('div');
    sheet.body.append(box);
    ctx.root.append(sheet.el);

    let state: GenesisPanelState | null = null;
    let busy = false;

    const form = ctx.ui.h('div');
    form.style.display = 'grid';
    form.style.gap = '12px';

    // 种子可以是数字，也可以是任意一句话（服务端会把它哈希成种子）。
    const seedInput = ctx.ui.input({ type: 'text', value: '20261111' }) as HTMLInputElement;
    seedInput.placeholder = t.seedHint;

    // 恒星质量：滑块比数字框直观——0.15 到 2.0 太阳质量，1.0 就是太阳。
    const doc = ctx.root.ownerDocument;
    const starRow = ctx.ui.h('div');
    starRow.style.display = 'grid';
    starRow.style.gap = '4px';
    const starLabel = ctx.ui.h('div', 'mono');
    starLabel.style.fontSize = '12px';
    const starInput = doc.createElement('input');
    starInput.type = 'range';
    starInput.min = '0.15';
    starInput.max = '2';
    starInput.step = '0.05';
    starInput.value = '1';
    starInput.style.width = '100%';
    starRow.append(starInput, starLabel);
    const setStarMass = (value: number): void => {
      starInput.value = String(value);
      starLabel.textContent = t.starMassValue(Number(starInput.value));
    };
    starInput.addEventListener('input', () => setStarMass(Number(starInput.value)));
    setStarMass(1);

    const starNameInput = ctx.ui.input({ type: 'text', value: '恒星' }) as HTMLInputElement;
    const homeNameInput = ctx.ui.input({ type: 'text', value: '母星' }) as HTMLInputElement;
    starNameInput.maxLength = 12;
    homeNameInput.maxLength = 12;

    const hint = ctx.ui.h('p', 'muted', t.hint);
    hint.style.fontSize = '12px';
    // 形状由种子决定：面板这边只问一句「这颗种子会长出几颗行星」，免得创世后才发现。
    const preview = ctx.ui.h('p', 'muted', '');
    preview.style.fontSize = '12px';
    let previewTimer: number | undefined;
    const refreshPreview = async (): Promise<void> => {
      try {
        const shape = await ctx.invoke<{ planetCount: number; maxMoons: number; minPlanets: number; maxPlanets: number }>(
          'preview',
          [seedInput.value],
        );
        preview.textContent = t.shapePreview(shape.planetCount, shape.maxMoons, shape.minPlanets, shape.maxPlanets);
      } catch {
        preview.textContent = '';
      }
    };
    const refreshHint = (): void => {
      const raw = seedInput.value.trim();
      hint.textContent = !raw ? t.hint : /^\d{1,15}$/.test(raw) ? t.hintNumber : t.hintText;
      if (previewTimer !== undefined) window.clearTimeout(previewTimer);
      previewTimer = window.setTimeout(() => void refreshPreview(), 180);
    };
    seedInput.addEventListener('input', refreshHint);
    const createButton = ctx.ui.button(t.create, { variant: 'primary', size: 'md', onClick: () => void create() });
    form.append(
      field(ctx.ui, t.seed, seedInput, t.seedHint),
      field(ctx.ui, t.star, starRow, '0.15 … 2.0 太阳质量'),
      field(ctx.ui, t.starName, starNameInput, '开局定，之后一直沿用'),
      field(ctx.ui, t.homeName, homeNameInput, '最宜居的那颗行星，之后一直沿用'),
      createButton,
      hint,
      preview,
    );

    const lockedBox = ctx.ui.h('div');
    lockedBox.style.display = 'grid';
    lockedBox.style.gap = '10px';
    const badge = ctx.ui.pill(t.locked, 'on');
    const clockBox = ctx.ui.h('div', 'muted');
    clockBox.style.fontSize = '13px';
    clockBox.style.lineHeight = '1.6';
    clockBox.hidden = true;
    // 等一会儿：人类最常想做的事之一，模型侧有 genesis_wait，这边给同一组按钮。
    const waitRow = ctx.ui.h('div');
    waitRow.style.display = 'flex';
    waitRow.style.flexWrap = 'wrap';
    waitRow.style.gap = '6px';
    waitRow.style.marginTop = '4px';
    for (const [label, until] of [
      [t.waitDawn, 'dawn'],
      [t.waitDusk, 'dusk'],
      [t.waitNoon, 'noon'],
      [t.waitRipe, 'ripe'],
      [t.waitBuilt, 'built'],
      [t.waitArrive, 'arrive'],
    ] as const) {
      waitRow.append(
        ctx.ui.button(label, {
          size: 'sm',
          onClick: () => {
            void (async () => {
              try {
                const result = await ctx.invoke<{ text: string; state: GenesisPanelState }>('wait', [{ until }]);
                state = result.state;
                waitNote.textContent = result.text;
                render();
                void ctx.refresh();
              } catch (error) {
                ctx.ui.toast(errorText(error), 'bad');
              }
            })();
          },
        }),
      );
    }
    const waitNote = ctx.ui.h('div', 'muted');
    waitNote.style.fontSize = '12px';
    waitRow.append(waitNote);
    const cardPre = ctx.ui.h('pre');
    cardPre.style.whiteSpace = 'pre-wrap';
    cardPre.style.fontSize = '13px';
    cardPre.style.lineHeight = '1.55';
    const resetButton = ctx.ui.button(t.reset, { variant: 'danger', size: 'sm', onClick: () => void reset() });

    // 能量与监测器：人类这一侧的操作区。
    const powerBox = ctx.ui.h('div');
    powerBox.style.display = 'grid';
    powerBox.style.gap = '6px';
    const energyLine = ctx.ui.h('div', 'mono');
    const shipLineEl = ctx.ui.h('div', 'mono');
    shipLineEl.style.fontSize = '12px';
    const genButton = ctx.ui.button(t.generator, { size: 'sm', variant: 'primary', onClick: () => void press() });
    const genHint = ctx.ui.h('div', 'muted', t.generatorHint);
    genHint.style.fontSize = '12px';
    const gridLineEl = ctx.ui.h('div', 'muted');
    gridLineEl.style.fontSize = '12px';
    const gridRow = ctx.ui.h('div');
    gridRow.style.display = 'flex';
    gridRow.style.gap = '6px';
    const gridInButton = ctx.ui.button(t.gridIn, { size: 'sm', onClick: () => void gridMove('grid_in') });
    const gridOutButton = ctx.ui.button(t.gridOut, { size: 'sm', onClick: () => void gridMove('grid_out') });
    gridRow.append(gridInButton, gridOutButton);
    powerBox.append(ctx.ui.h('h3', undefined, t.powerTitle), energyLine, shipLineEl, genButton, genHint, gridLineEl, gridRow);

    const monitorBox = ctx.ui.h('div');
    monitorBox.style.display = 'grid';
    monitorBox.style.gap = '6px';
    const monitorLine = ctx.ui.h('div', 'muted');
    const monitorButton = ctx.ui.button(t.monitorInstall, { size: 'sm', onClick: () => void installMonitor() });
    monitorBox.append(ctx.ui.h('h3', undefined, t.monitorTitle), monitorLine, monitorButton);

    // 农场：站点、库存、种子袋；人类这一侧也能直接建站/播种/收获/卖货。
    const floraBox = ctx.ui.h('div');
    floraBox.style.display = 'grid';
    floraBox.style.gap = '6px';
    const floraLine = ctx.ui.h('div', 'muted');
    floraLine.style.fontSize = '12px';
    // 作物详情：`inspect` 只回文本，不替换整页状态（以前把它当面板状态收下，页面会退回创世前）。
    const floraMsg = ctx.ui.h('pre', 'mono');
    floraMsg.hidden = true;
    floraMsg.style.whiteSpace = 'pre-wrap';
    const floraSites = ctx.ui.h('div');
    floraSites.style.display = 'grid';
    floraSites.style.gap = '4px';
    const floraInv = ctx.ui.h('div', 'muted');
    floraInv.style.fontSize = '12px';
    const floraBags = ctx.ui.h('div');
    floraBags.style.display = 'grid';
    floraBags.style.gap = '4px';
    const siteButton = ctx.ui.button(t.floraSite, { size: 'sm', onClick: () => void floraDo('site', []) });
    // 商人才有的东西：基因订单、钢瓶。他不在的时候整块藏起来。
    const floraTrade = ctx.ui.h('div');
    floraTrade.style.display = 'flex';
    floraTrade.style.gap = '6px';
    floraTrade.style.flexWrap = 'wrap';
    floraBox.append(
      ctx.ui.h('h3', undefined, t.floraTitle),
      floraLine,
      siteButton,
      floraTrade,
      floraSites,
      floraMsg,
      floraInv,
      floraBags,
    );

    // 地图区：只对岩石行星画，一次画一颗（按需调 map）。
    const mapBox = ctx.ui.h('div');
    mapBox.style.display = 'grid';
    mapBox.style.gap = '8px';
    const mapHead = ctx.ui.h('h3', undefined, t.mapTitle);
    const mapDesc = ctx.ui.h('p', 'muted', t.mapDesc);
    mapDesc.style.fontSize = '12px';
    const pickRow = ctx.ui.h('div');
    pickRow.style.display = 'grid';
    pickRow.style.gap = '4px';
    const pick = ctx.ui.select({ options: [] }) as HTMLSelectElement;
    const canvas = ctx.ui.h('canvas') as HTMLCanvasElement;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.imageRendering = 'auto';
    const readout = ctx.ui.h('div', 'muted');
    readout.style.fontSize = '12px';
    const oceanLine = ctx.ui.h('div', 'muted');
    oceanLine.style.fontSize = '12px';
    pickRow.append(ctx.ui.h('label', 'muted', t.mapPick), pick);
    const chartRow = ctx.ui.h('div');
    chartRow.style.display = 'flex';
    chartRow.style.gap = '6px';
    chartRow.style.flexWrap = 'wrap';
    chartRow.hidden = true;
    mapBox.append(mapHead, mapDesc, pickRow, chartRow, canvas, readout, oceanLine);

    // 地图下方：去别处、就地建造、建筑详情。
    const planBox = ctx.ui.h('div');
    planBox.style.display = 'grid';
    planBox.style.gap = '8px';
    const travelRow = ctx.ui.h('div');
    travelRow.style.display = 'flex';
    travelRow.style.gap = '6px';
    travelRow.style.alignItems = 'center';
    travelRow.style.flexWrap = 'wrap';
    const latInput = ctx.ui.input({ type: 'number', value: '0' }) as HTMLInputElement;
    latInput.step = '0.1';
    latInput.style.width = '88px';
    const lonInput = ctx.ui.input({ type: 'number', value: '0' }) as HTMLInputElement;
    lonInput.step = '0.1';
    lonInput.style.width = '88px';
    const goButton = ctx.ui.button(t.travelGo, { size: 'sm', variant: 'primary', onClick: () => void travel() });
    travelRow.append(
      ctx.ui.h('span', 'muted', t.travelTitle),
      ctx.ui.h('span', 'muted', '纬度'),
      latInput,
      ctx.ui.h('span', 'muted', '经度'),
      lonInput,
      goButton,
    );
    const travelHintEl = ctx.ui.h('div', 'muted', t.travelHint);
    travelHintEl.style.fontSize = '12px';
    // 「看附近」：和 genesis_look 同一段文字，人类不用问模型也能读。
    const lookRow = ctx.ui.h('div');
    lookRow.style.display = 'flex';
    lookRow.style.gap = '6px';
    lookRow.style.alignItems = 'center';
    const lookButton = ctx.ui.button(t.lookHere, { size: 'sm', onClick: () => void lookAroundPanel() });
    const veinsButton = ctx.ui.button(t.veinsHere, { size: 'sm', onClick: () => void veinsScan() });
    const surveyButton = ctx.ui.button(t.surveyHere, { size: 'sm', onClick: () => void surveyGround() });
    lookRow.append(lookButton, veinsButton, surveyButton, ctx.ui.h('span', 'muted', t.lookHint));
    const lookPre = ctx.ui.h('pre');
    lookPre.style.whiteSpace = 'pre-wrap';
    lookPre.style.fontSize = '12px';
    lookPre.style.margin = '0';
    lookPre.hidden = true;
    const buildRow = ctx.ui.h('div');
    buildRow.style.display = 'flex';
    buildRow.style.gap = '6px';
    buildRow.style.alignItems = 'center';
    buildRow.style.flexWrap = 'wrap';
    const buildSelect = ctx.ui.select({
      options: [
        { value: 'greenhouse', label: '温室核心' },
        { value: 'cooler', label: '制冷核心' },
        { value: 'heater', label: '制热核心' },
        { value: 'realism', label: '拟真核心' },
        { value: 'pump', label: '水泵' },
        { value: 'warehouse', label: '仓库' },
        { value: 'drone_cluster', label: '无人机集群' },
        { value: 'rocket', label: '运载火箭' },
        { value: 'biome_changer', label: '群系改变器' },
        { value: 'miner', label: '采矿机' },
        { value: 'rectifier', label: '整流电塔' },
        { value: 'terminal', label: '交易终端' },
        { value: 'storage_terminal', label: '仓储终端' },
        { value: 'arm', label: '机械臂' },
        { value: 'duty', label: '值班终端' },
        { value: 'sail', label: '太阳能帆' },
        { value: 'counter', label: '凌日计数器' },
        { value: 'kiln', label: '炭化炉' },
        { value: 'purifier', label: '净化器' },
        { value: 'sealer', label: '封装器' },
        { value: 'atmo_extractor', label: '大气提取器' },
        { value: 'habitat', label: '居所' },
        { value: 'mutation_room', label: '辐射诱变室' },
        { value: 'cold_store', label: '冷库' },
        { value: 'inert_room', label: '惰性气体室' },
        { value: 'planter', label: '种植盆' },
        { value: 'carrier', label: '空天母舰' },
        { value: 'wind', label: '风力发电站' },
        { value: 'fire', label: '火力发电站' },
        { value: 'converter', label: '气液转换机' },
      ],
    }) as HTMLSelectElement;
    const buildButton = ctx.ui.button(t.buildHere, { size: 'sm', variant: 'primary', onClick: () => void buildHere() });
    const siteButton2 = ctx.ui.button(t.buildSite, { size: 'sm', onClick: () => void floraDo('site', []) });
    buildRow.append(buildSelect, buildButton, siteButton2);
    const buildLine = ctx.ui.h('div', 'muted');
    buildLine.style.fontSize = '12px';
    const detailBox = ctx.ui.h('div', 'card');
    detailBox.style.display = 'grid';
    detailBox.style.gap = '4px';
    detailBox.hidden = true;
    const detailHead = ctx.ui.h('div', 'mono');
    const detailBody = ctx.ui.h('div', 'muted');
    detailBody.style.fontSize = '12px';
    detailBody.style.whiteSpace = 'pre-wrap';
    const detailActions = ctx.ui.h('div');
    detailActions.style.display = 'flex';
    detailActions.style.gap = '6px';
    detailBox.append(detailHead, detailBody, detailActions);
    planBox.append(travelRow, travelHintEl, lookRow, lookPre, ctx.ui.h('h3', undefined, t.buildTitle), buildRow, buildLine, detailBox);
    // 背包与仓库：人类也能存、取、拆；模型走 genesis_store，同一套规则。
    const storeBox = ctx.ui.h('div');
    storeBox.style.display = 'grid';
    storeBox.style.gap = '6px';
    const storeList = ctx.ui.h('pre', 'mono');
    storeList.style.fontSize = '12px';
    storeList.style.whiteSpace = 'pre-wrap';
    storeList.style.margin = '0';
    const storeRows = ctx.ui.h('div');
    storeRows.style.display = 'grid';
    storeRows.style.gap = '4px';
    storeBox.append(
      ctx.ui.h('h3', undefined, t.storeTitle),
      ctx.ui.button(t.storeRefresh, { size: 'sm', onClick: () => void refreshStore() }),
      storeList,
      storeRows,
    );
    // 协议与生命维持：一张检查表 + 居所还能撑多久 + 今天的基因订单。
    lockedBox.append(badge, clockBox, waitRow, powerBox, monitorBox, floraBox, storeBox, cardPre, mapBox, planBox, resetButton);

    const status = ctx.ui.msgline(t.loading);
    box.append(form, lockedBox, status);

    let seeded = false;
    let map: GenesisSurfaceMap | null = null;
    let mapKey: string | null = null;
    let selectedId: string | null = null;
    let cooldownMs = 0;

    /** 建筑与站点只画在当前正在看的那颗天体上。 */
    const paint = (): void => {
      if (!map) return;
      drawMap(canvas, map);
      const context = canvas.getContext('2d');
      if (!context || mapKey === null || state?.location?.bodyKey !== mapKey) return;
      for (const site of state?.flora?.sites ?? []) {
        const p = { x: xPx(site.lonDeg, WIDTH), y: yPx(site.latDeg, HEIGHT) };
        context.strokeStyle = '#ffffff';
        context.lineWidth = 1.5;
        context.strokeRect(p.x - 4, p.y - 4, 8, 8);
      }
      for (const structure of state?.structures ?? []) {
        const p = { x: xPx(structure.lonDeg, WIDTH), y: yPx(structure.latDeg, HEIGHT) };
        context.fillStyle = structure.id === selectedId ? '#ffd166' : '#ffffff';
        context.strokeStyle = '#1a1a1a';
        context.lineWidth = 1.5;
        if (structure.kind === 'arm') {
          context.fillRect(p.x - 5, p.y - 5, 10, 10);
          context.strokeRect(p.x - 5, p.y - 5, 10, 10);
          continue;
        }
        context.beginPath();
        context.moveTo(p.x, p.y - 7);
        context.lineTo(p.x + 7, p.y);
        context.lineTo(p.x, p.y + 7);
        context.lineTo(p.x - 7, p.y);
        context.closePath();
        context.fill();
        context.stroke();
      }
    };

    const renderPlan = (): void => {
      planBox.hidden = !(state?.locked ?? false);
      if (!state?.locked) return;
      const builds = state.builds ?? [];
      buildLine.textContent =
        `${t.buildSlots} ${builds.length}/${state.buildSlots ?? 1}` +
        (builds.length === 0
          ? ` · ${t.buildNone}`
          : '：' +
            builds
              .map((b) => `${b.label}（${b.siteKey}）还剩 ${b.leftHomeHours.toFixed(1)} 母星时`)
              .join('；')) +
        (state.buildQueueFull ? ` · ${t.buildFull}` : '');
      const chosen = (state.structures ?? []).find((s) => s.id === selectedId) ?? null;
      detailBox.hidden = chosen === null;
      if (!chosen) return;
      detailHead.textContent = `${t.detailTitle}：${chosen.label}（${chosen.id}） · ${chosen.siteKey}`;
      const contents =
        chosen.contents.length === 0
          ? t.detailEmpty
          : chosen.contents.map((c) => `${c.name} ${c.kg} kg`).join('、');
      detailBody.textContent =
        `${t.detailContents}：${contents}\n${Math.round(chosen.usedKg * 100) / 100} / ${chosen.capKg} kg` +
        (chosen.armText ? `\n${t.armLine}：${chosen.armText}` : '') +
        (chosen.dutyText ? `\n${t.dutyLine}：${chosen.dutyText}` : '') +
        (chosen.interiorC !== undefined ? `\n${t.habitatLine}：${chosen.interiorC}℃（${chosen.comfort === 'ok' ? t.comfortOk : chosen.comfort === 'hot' ? t.comfortHot : t.comfortCold}）` : '') +
        (chosen.armCycle ? `\n${t.armCycle}` : '');
      detailActions.replaceChildren(
        ctx.ui.button(t.detailNear, { size: 'sm', onClick: () => void travel(chosen.latDeg + 0.2, chosen.lonDeg + 0.2) }),
        ctx.ui.button(t.detailDemolish, { size: 'sm', variant: 'danger', onClick: () => void demolish(chosen.id) }),
        ctx.ui.button(t.detailClose, { size: 'sm', onClick: () => { selectedId = null; paint(); renderPlan(); } }),
      );
    };

    async function goTo(key: string): Promise<void> {
      if (busy) return;
      busy = true;
      try {
        state = await ctx.invoke<GenesisPanelState>('move', [{ target: key }]);
        render();
        void ctx.refresh();
      } catch (error) {
        fail(error);
      } finally {
        busy = false;
      }
    }

    async function travel(latDeg = Number(latInput.value), lonDeg = Number(lonInput.value)): Promise<void> {
      if (busy) return;
      busy = true;
      try {
        state = await ctx.invoke<GenesisPanelState>('move', [{ latDeg, lonDeg }]);
        render();
        void ctx.refresh();
      } catch (error) {
        fail(error);
      } finally {
        busy = false;
      }
    }

    async function lookAroundPanel(): Promise<void> {
      if (busy) return;
      busy = true;
      try {
        const result = await ctx.invoke<{ text: string }>('look', []);
        lookPre.textContent = result.text;
        lookPre.hidden = false;
      } catch (error) {
        fail(error);
      } finally {
        busy = false;
      }
    }
    /** 测绘：每颗行星每个群系只认第一次；结果写进同一块 pre。 */
    async function surveyGround(): Promise<void> {
      if (busy) return;
      busy = true;
      try {
        const result = await ctx.invoke<{ text: string; state: GenesisPanelState }>('survey', []);
        state = result.state;
        lookPre.textContent = result.text;
        lookPre.hidden = false;
        render();
        void ctx.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        ctx.ui.toast(/已经测过|只认第一次/.test(message) ? t.surveyDone : message, 'bad');
      } finally {
        busy = false;
      }
    }
    /** 质谱仪扫矿：和服务端 genesis_veins 同一段文字，结果写进同一块 pre。 */
    async function veinsScan(): Promise<void> {
      if (busy) return;
      busy = true;
      try {
        const result = await ctx.invoke<{ text: string }>('veins', []);
        lookPre.textContent = result.text;
        lookPre.hidden = false;
      } catch (error) {
        fail(error);
      } finally {
        busy = false;
      }
    }

    async function buildHere(): Promise<void> {
      if (busy) return;
      busy = true;
      try {
        const kind = buildSelect.value;
        if (kind === 'sail' || kind === 'counter') {
          const result = await ctx.invoke<{ text: string; state: GenesisPanelState }>('install', [{ id: kind }]);
          state = result.state;
          ctx.ui.toast(result.text, 'ok');
        } else if (kind === 'cooler' || kind === 'heater' || kind === 'realism') {
          // 2.1.6：气候核心与拟真核心不是「建筑」，是装在温室上的配件——走 install，不走进施工队列。
          const result = await ctx.invoke<{ text: string; state: GenesisPanelState }>('install', [{ id: kind }]);
          state = result.state;
          ctx.ui.toast(result.text, 'ok');
        } else {
          state = await ctx.invoke<GenesisPanelState>('build', [{ kind }]);
        }
        render();
        void ctx.refresh();
      } catch (error) {
        fail(error);
      } finally {
        busy = false;
      }
    }

    async function demolish(id: string): Promise<void> {
      if (busy) return;
      busy = true;
      try {
        state = await ctx.invoke<GenesisPanelState>('demolish', [id]);
        selectedId = null;
        render();
        void ctx.refresh();
      } catch (error) {
        fail(error);
      } finally {
        busy = false;
      }
    }

    const renderPower = (): void => {
      const power = state?.power ?? null;
      powerBox.hidden = power === null;
      if (!power) return;
      const kj = power.generatorKj ?? 5;
      const cap = power.capacityKj ?? 100_000;
      energyLine.textContent =
        `${t.energy}：${power.energyKj.toLocaleString('en-US')} / ${cap.toLocaleString('en-US')} kJ · ` +
        `${t.tungsten}：${(power.tungsten ?? 0).toLocaleString('en-US')} kg · ${power.sails} ${'台太阳能帆'}`;
      const ship = power.ship;
      shipLineEl.hidden = !ship || (ship.sleepers ?? 0) <= 0;
      if (ship) {
        shipLineEl.textContent = t.shipLine(
          ship.food,
          ship.water,
          ship.oxygen,
          ship.sleepers,
          ship.hoursLeft ?? 0,
        );
      }
      genButton.disabled = cooldownMs > 0;      genButton.textContent = cooldownMs > 0
        ? `${t.generatorBusy} ${(cooldownMs / 1000).toFixed(1)}s`
        : t.generator.replace('{kj}', String(kj));
      genHint.textContent = t.generatorHint.replace('{kj}', String(kj));
      const grid = power.grid;
      gridLineEl.textContent = grid
        ? grid.hasTower
          ? `${t.gridStored} ${grid.storedKj.toLocaleString('en-US')} / ${grid.capacityKj.toLocaleString('en-US')} kJ` +
            (grid.reachable
              ? `（${t.gridReach} ${grid.distanceKm} km）`
              : `（${t.gridFar} ${grid.distanceKm} km · ${t.gridTowerAt} ${grid.towerSite ?? ''}）`)
          : `${t.gridNoTower}`
        : '';
      const canTap = grid !== null && grid.hasTower && grid.reachable;
      gridInButton.disabled = !canTap || grid.storedKj <= 0;
      gridOutButton.disabled = !canTap || power.energyKj <= 0;
      gridRow.hidden = !grid || !grid.hasTower;
    };

    const renderMonitor = (): void => {
      const monitor = state?.monitor ?? null;
      monitorBox.hidden = monitor === null;
      if (!monitor) return;
      const n = monitor.monitored.length;
      monitorLine.textContent = n === 0
        ? t.monitorNone
        : `${t.monitorCount} ${n} 个天体${monitor.starUnlocked ? ` ${t.monitorStar}` : ''}`;
      monitorButton.hidden = monitor.currentKey === null || monitor.currentMonitored;
    };

    const renderFlora = (): void => {
      const flora = state?.flora ?? null;
      floraBox.hidden = flora === null;
      if (!flora) return;
      floraLine.textContent =
        `${flora.credits} 信用点（${flora.tier}） · ${Math.floor(flora.energyKj).toLocaleString('en-US')} kJ · ` +
        (flora.shopWindow || (flora.shopOpen ? t.floraShop : t.floraClosed));
      floraSites.replaceChildren();
      if (flora.sites.length === 0) {
        floraSites.append(ctx.ui.h('div', 'muted', t.floraNone));
      }
      for (const site of flora.sites) {
        const row = ctx.ui.h('div');
        row.style.display = 'flex';
        row.style.gap = '8px';
        row.style.alignItems = 'center';
        row.append(
          ctx.ui.h(
            'span',
            'mono',
            `${site.key} · ${site.kind} · ${t.floraWet} ${site.wetness == null ? '—' : `${Math.round(site.wetness * 100)}%`} · ` +
              `${t.floraFert} ${site.fertility == null ? '—' : `${Math.round(site.fertility * 100)}%`} · ${site.plants} 株/群`,
          ),
        );
        if (site.ripe > 0) {
          row.append(
            ctx.ui.button(`${t.floraHarvest} ${site.ripe}`, { size: 'sm', variant: 'primary', onClick: () => void floraDo('harvest', [site.key]) }),
          );
        }
        floraSites.append(row);
      }
      for (const planter of flora.planters ?? []) {
        const row = ctx.ui.h('div');
        row.style.display = 'flex';
        row.style.gap = '8px';
        row.style.alignItems = 'center';
        const stateLine = planter.powered ? t.planterOk : t.planterOff;
        row.append(ctx.ui.h('span', 'mono', `${planter.key} · ${t.planterName} · ${planter.plants}/3 · ${stateLine}`));
        if (planter.ripe > 0) {
          row.append(
            ctx.ui.button(`${t.floraHarvest} ${planter.ripe}`, { size: 'sm', variant: 'primary', onClick: () => void floraDo('harvest', [planter.key]) }),
          );
        }
        const bag = flora.bags[0];
        if (bag) {
          row.append(
            ctx.ui.button(`${t.floraPlant} ${bag.name}`, { size: 'sm', onClick: () => void floraDo('plant', [bag.id, planter.key]) }),
          );
        }
        floraSites.append(row);
      }
      // 2.0.6：每株都能挖回种子袋（基因不变，代价是不能再收）。
      for (const crop of flora.crops ?? []) {
        const row = ctx.ui.h('div');
        row.style.display = 'flex';
        row.style.gap = '8px';
        row.style.alignItems = 'center';
        row.append(
          ctx.ui.h('span', 'mono', `${crop.site} · ${crop.name} · ${Math.round(crop.progress * 100)}%${crop.ripe ? ' · 结实' : ''}${crop.dead ? ' · 枯死' : ''}`),
        );
        if (crop.dead) {
          row.append(
            ctx.ui.button(t.floraRemove, {
              size: 'sm',
              onClick: () => void floraDo('remove', [crop.id, crop.site]),
            }),
          );
        } else {
          row.append(
            ctx.ui.button(t.floraInspect, {
              size: 'sm',
              onClick: () => void inspectCrop(crop.id, crop.site),
            }),
            ctx.ui.button(t.floraBreed, {
              size: 'sm',
              onClick: () => void floraDo('breed', [crop.id, crop.site]),
            }),
            ctx.ui.button(t.floraTransplant, {
              size: 'sm',
              onClick: () => void floraDo('transplant', [crop.id, crop.site]),
            }),
          );
        }
        floraSites.append(row);
      }
      floraInv.replaceChildren();
      floraInv.textContent = flora.inventory.length === 0
        ? `${t.floraInventory}：${t.floraEmpty}`
        : `${t.floraInventory}：` + flora.inventory.map((item) => `${item.name} ${item.amount}`).join('、');
      for (const item of flora.inventory) {
        const sellButton = ctx.ui.button(`卖 1 ${item.name}`, { size: 'sm', onClick: () => void floraDo('sell', [item.id, 1]) });
        floraInv.append(sellButton);
      }
      // 商人不在就整块藏起来：基因订单与钢瓶都是跟他做的买卖。
      floraTrade.replaceChildren();
      floraTrade.hidden = !flora.shopOpen;
      if (flora.shopOpen) {
        for (const order of state?.orders ?? []) {
          floraTrade.append(
            ctx.ui.button(`${t.lifeOrder}：${order.species} · ${order.gene} ≥ ${order.min} · ${order.kg}kg → ${order.reward}`, {
              size: 'sm',
              onClick: () => void lifeDo('order', [order.id]),
            }),
          );
        }
        floraTrade.append(
          ctx.ui.button(t.lifeCylinder, { size: 'sm', onClick: () => void lifeDo('cylinder', [10]) }),
        );
        floraTrade.append(
          ctx.ui.button(t.buyChart, { size: 'sm', variant: 'primary', onClick: () => void lifeDo('chart', []) }),
        );
      }
      floraBags.replaceChildren();
      for (const bag of flora.bags) {
        const row = ctx.ui.h('div');
        row.style.display = 'flex';
        row.style.gap = '8px';
        row.style.alignItems = 'center';
        row.append(
          ctx.ui.h('span', 'mono', `${bag.id} · ${bag.name} ×${bag.count}${bag.premium ? ' · 高级' : ''}`),
          ctx.ui.button(t.floraPlant, { size: 'sm', onClick: () => void floraDo('plant', [bag.id]) }),
        );
        floraBags.append(row);
      }
      for (const gh of state?.greenhouses ?? []) {
        const row = ctx.ui.h('div');
        row.style.display = 'flex';
        row.style.gap = '8px';
        row.style.alignItems = 'center';
        const label = ctx.ui.h('span', 'mono', `温室 ${gh.siteKey}`);
        const value = ctx.ui.h('span', 'mono', gh.targetC === null ? `自动（室外 ${gh.ambientC ?? '—'}℃）` : `${gh.targetC}℃（温差 ${gh.deltaC}℃，拟真 ×${gh.realismCores}）`);
        const slider = ctx.ui.h('input') as HTMLInputElement;
        slider.type = 'range';
        slider.min = '-60';
        slider.max = '80';
        slider.step = '1';
        slider.value = String(gh.targetC ?? gh.ambientC ?? 20);
        slider.style.width = '160px';
        slider.addEventListener('change', () => {
          const tempC = Number(slider.value);
          void lifeDo('install', [{ id: 'setpoint', site: gh.siteKey, tempC }]);
        });
        const auto = ctx.ui.button('自动', {
          size: 'sm',
          onClick: () => void lifeDo('install', [{ id: 'setpoint', site: gh.siteKey }]),
        });
        const realism = ctx.ui.button('拟真核心', {
          size: 'sm',
          onClick: () => void lifeDo('install', [{ id: 'realism', site: gh.siteKey }]),
        });
        row.append(label, slider, value, auto, realism);
        floraBags.append(row);
      }
    };

    async function lifeDo(method: string, args: unknown[]): Promise<void> {
      if (busy) return;
      busy = true;
      try {
        const result = await ctx.invoke<{ text?: string; state?: GenesisPanelState }>(method, args);
        if (result?.state) state = result.state;
        if (result?.text) ctx.ui.toast(result.text, 'ok');
        render();
        void ctx.refresh();
      } catch (error) {
        fail(error);
      } finally {
        busy = false;
      }
    }

    async function floraDo(method: string, args: unknown[]): Promise<void> {
      if (busy) return;
      busy = true;
      try {
        const result = await ctx.invoke<GenesisPanelState | { text: string }>(method, args);
        // 有些方法只回一段文字（比如详情）。只有真拿到面板状态才替换 —— 否则整页会退回创世前。
        if (result && typeof result === 'object' && 'locked' in result && 'power' in result) {
          state = result as GenesisPanelState;
          render();
          void ctx.refresh();
        } else if (result && typeof result === 'object' && 'text' in result) {
          floraMsg.hidden = false;
          floraMsg.textContent = String((result as { text: string }).text);
        }
      } catch (error) {
        fail(error);
      } finally {
        busy = false;
      }
    }

    async function inspectCrop(id: string, site: string): Promise<void> {
      if (busy) return;
      busy = true;
      try {
        const result = await ctx.invoke<{ text: string }>('inspect', [id, site]);
        floraMsg.hidden = false;
        floraMsg.textContent = result.text;
      } catch (error) {
        fail(error);
      } finally {
        busy = false;
      }
    }

    interface StoreContainer {
      id: string;
      kind: string;
      where: string;
      usedKg: number;
      capKg: number;
      contents: Array<{ resource: string; name: string; kg: number }>;
      bags?: number;
      routesText?: string;
    }

    async function refreshStore(): Promise<void> {
      if (!(state?.locked ?? false)) {
        storeBox.hidden = true;
        return;
      }
      storeBox.hidden = false;
      try {
        const view = await ctx.invoke<{ list: string; containers: StoreContainer[] }>('store');
        storeList.textContent = view.list;
        storeRows.replaceChildren();
        for (const c of view.containers) {
          const row = ctx.ui.h('div');
          row.style.display = 'flex';
          row.style.gap = '6px';
          row.style.flexWrap = 'wrap';
          row.style.alignItems = 'center';
          const first = c.contents[0]?.resource ?? 'biomass';
          const bufferNote = c.kind === 'terminal'
            ? ctx.ui.h(
                'span',
                'muted',
                `${t.terminalBuffer} ${c.usedKg}/${c.capKg} kg · ${c.bags ?? 0}/20 ${c.usedKg >= c.capKg ? `— ${t.terminalFull}` : ''}`,
              )
            : null;
          const depositBtn = ctx.ui.button(`${t.storeDeposit} ${first}`, {
            size: 'sm',
            onClick: () => void storeDo('deposit', c.id, first, 10),
          });
          if (c.kind === 'terminal') {
            depositBtn.disabled = true;
            depositBtn.title = t.terminalFull;
          }
          row.append(
            ctx.ui.h('span', 'mono', `${c.id} · ${c.where} · ${c.usedKg}/${c.capKg} kg`),
            ...(bufferNote ? [bufferNote] : []),
            ...(c.routesText ? [ctx.ui.h('span', 'muted', c.routesText.split('\n').join(' · '))] : []),
            depositBtn,
            ctx.ui.button(`${t.storeWithdraw} ${first}`, { size: 'sm', onClick: () => void storeDo('withdraw', c.id, first, 10) }),
            ctx.ui.button(t.storeDemolish, { size: 'sm', onClick: () => void storeDo('demolish', c.id, '', 0) }),
            ...(c.kind === 'terminal'
              ? [ctx.ui.button(t.terminalTake, { size: 'sm', onClick: () => void storeDo('take', c.id, '', 0) })]
              : []),
          );
          storeRows.append(row);
        }
      } catch (error) {
        fail(error);
      }
    }

    async function storeDo(action: string, building: string, resource: string, kg: number): Promise<void> {
      if (busy) return;
      busy = true;
      try {
        const view = await ctx.invoke<{ list: string; containers: StoreContainer[] }>('storeDo', [action, building, resource, kg]);
        storeList.textContent = view.list;
        await refreshStore();
        void ctx.refresh();
      } catch (error) {
        fail(error);
      } finally {
        busy = false;
      }
    }

    const render = (): void => {
      const locked = state?.locked ?? false;
      form.hidden = locked;
      lockedBox.hidden = !locked;
      cardPre.textContent = state?.card ?? '';
      const clock = state?.game ?? null;
      clockBox.hidden = clock === null;
      clockBox.textContent = clock
        ? [
            `此刻：${clock.time}`,
            clock.where ? `你在：${clock.where}` : '',
            clock.transit ?? '没有在移动',
            clock.calendar,
          ]
            .filter((line) => line !== '')
            .join('\n')
        : '';
      if (state && !seeded) {
        seedInput.value = String(state.defaults.seed);
        setStarMass(state.defaults.starMass);
        seeded = true;
        void refreshPreview();
      }
      cooldownMs = state?.power?.generatorCooldownMs ?? 0;
      renderPower();
      renderMonitor();
      renderFlora();
      renderPlan();
      paint();
      storeBox.hidden = !locked;
      if (locked) void refreshStore();
    };

    // 冷却条只在本地倒数；真正的判定在 World 侧。
    ctx.interval(() => {
      if (cooldownMs <= 0) return;
      cooldownMs = Math.max(0, cooldownMs - 200);
      renderPower();
    }, 200);

    const rebuildPicker = (): void => {
      const bodies = state?.bodies ?? [];
      pick.replaceChildren();
      for (const body of bodies) {
        const option = document.createElement('option');
        option.value = body.key;
        option.textContent = body.label;
        pick.append(option);
      }
      pick.hidden = bodies.length === 0;
      // 只有星图、还没装监测器的天体：画不了地图，但直接能飞过去。
      const charted = bodies.filter((body) => body.charted && body.key !== state?.monitor?.currentKey);
      chartRow.replaceChildren();
      chartRow.hidden = charted.length === 0;
      for (const body of charted) {
        chartRow.append(
          ctx.ui.button(`${t.goHere}：${body.label}`, {
            size: 'sm',
            variant: 'primary',
            onClick: () => void goTo(body.key),
          }),
        );
      }
      canvas.hidden = bodies.length === 0;
      if (bodies.length === 0) {
        readout.textContent = t.mapNoBody;
        oceanLine.textContent = '';
      }
    };

    const showMap = (next: GenesisSurfaceMap): void => {
      map = next;
      paint();
      if (next.kind === 'terrestrial') {
        oceanLine.textContent = `${t.mapOcean} ${Math.round(next.oceanFraction * 100)}% · 海拔 ${next.minElevationM} … ${next.maxElevationM} m`;
      } else if (next.kind === 'isobaric') {
        oceanLine.textContent = `${t.mapWind} ${next.minWindMps} … ${next.maxWindMps} m/s · 均温 ${next.meanTempC} ℃`;
      } else {
        oceanLine.textContent = `${t.mapMoon} · 均温 ${next.meanTempC} ℃`;
      }
      readout.textContent = '';
    };

    async function loadMap(key: string): Promise<void> {
      readout.textContent = t.mapLoading;
      mapKey = key;
      try {
        showMap(await ctx.invoke<GenesisSurfaceMap>('map', [key]));
      } catch (error) {
        readout.textContent = error instanceof Error ? error.message : String(error);
      }
    }

    pick.addEventListener('change', () => {
      if (pick.value) void loadMap(pick.value);
    });

    const describeCell = (x: number, y: number): string => {
      if (!map) return '';
      const lat = pxToLatDeg(y, HEIGHT);
      const lon = pxToLonDeg(x, WIDTH);
      const { grid } = map;
      const latIndex = clamp(Math.floor((lat + 90) / (180 / grid.lat)), 0, grid.lat - 1);
      const lonIndex = clamp(Math.floor((lon + 180) / (360 / grid.lon)), 0, grid.lon - 1);
      const biome = map.biome[latIndex]![lonIndex]!;
      const biomeLabel = BIOME_LABELS[biome] ?? String(biome);
      const base = `纬度 ${lat.toFixed(1)}° · 经度 ${lon.toFixed(1)}° · ${biomeLabel}`;
      if (map.kind !== 'terrestrial') return base;
      const elevation = map.elevationM[latIndex]![lonIndex]!;
      return `${base} · 海拔 ${elevation} m`;
    };

    canvas.addEventListener('mousemove', (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * WIDTH;
      const y = ((event.clientY - rect.top) / rect.height) * HEIGHT;
      readout.textContent = describeCell(x, y);
    });
    canvas.addEventListener('click', (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * WIDTH;
      const y = ((event.clientY - rect.top) / rect.height) * HEIGHT;
      const hit = (state?.structures ?? []).find((s) => {
        const px = xPx(s.lonDeg, WIDTH);
        const py = yPx(s.latDeg, HEIGHT);
        return Math.hypot(px - x, py - y) <= 11;
      });
      if (hit) {
        selectedId = hit.id;
        paint();
        renderPlan();
        return;
      }
      readout.textContent = describeCell(x, y);
    });
    canvas.addEventListener('mouseleave', () => {
      if (map) readout.textContent = '';
    });

    const fail = (error: unknown): void => {
      const message = error instanceof Error ? error.message : String(error);
      status.textContent = message;
      status.classList.add('bad');
      ctx.ui.toast(message, 'bad');
    };

    async function create(): Promise<void> {
      if (busy) return;
      busy = true;
      const stop = ctx.ui.disable(createButton);
      try {
        state = await ctx.invoke<GenesisPanelState>('create', [
          {
            seed: normalizeSeedInput(seedInput.value),
            starMass: Number(starInput.value),
            starName: starNameInput.value,
            homeName: homeNameInput.value,
          },
        ]);
        status.textContent = '';
        status.classList.remove('bad');
        ctx.ui.toast(t.created, 'ok');
        void ctx.refresh();
      } catch (error) {
        fail(error);
      } finally {
        stop.dispose();
        busy = false;
        render();
      }
    }

    async function reset(): Promise<void> {
      if (busy) return;
      if (!(await ctx.ui.confirm({ title: t.resetTitle, body: t.resetBody, danger: true }))) return;
      busy = true;
      const stop = ctx.ui.disable(resetButton);
      try {
        state = await ctx.invoke<GenesisPanelState>('reset', ['DELETE']);
        map = null;
        status.textContent = '';
        status.classList.remove('bad');
        void ctx.refresh();
      } catch (error) {
        fail(error);
      } finally {
        stop.dispose();
        busy = false;
        render();
      }
    }

    async function press(): Promise<void> {
      if (busy) return;
      busy = true;
      const stop = ctx.ui.disable(genButton);
      try {
        state = await ctx.invoke<GenesisPanelState>('press');
        cooldownMs = state.power?.generatorCooldownMs ?? 0;
        render();
      } catch (error) {
        fail(error);
      } finally {
        stop.dispose();
        busy = false;
      }
    }

    async function gridMove(direction: 'grid_in' | 'grid_out'): Promise<void> {
      if (busy) return;
      busy = true;
      const stop = ctx.ui.disable(gridInButton, gridOutButton);
      try {
        await ctx.invoke<unknown>('storeDo', [direction]);
        state = await ctx.invoke<GenesisPanelState>('state');
        render();
        void ctx.refresh();
      } catch (error) {
        fail(error);
      } finally {
        stop.dispose();
        busy = false;
      }
    }

    async function installMonitor(): Promise<void> {
      const key = state?.monitor?.currentKey;
      if (!key || busy) return;
      busy = true;
      const stop = ctx.ui.disable(monitorButton);
      try {
        state = await ctx.invoke<GenesisPanelState>('monitor', [key]);
        render();
        rebuildPicker();
        if (pick.value) void loadMap(pick.value);
        void ctx.refresh();
      } catch (error) {
        fail(error);
      } finally {
        stop.dispose();
        busy = false;
      }
    }

    try {
      state = await ctx.invoke<GenesisPanelState>('state');
      status.textContent = '';
      render();
      rebuildPicker();
      if (pick.value) void loadMap(pick.value);
    } catch (error) {
      fail(error);
    }
  },
};

const upgradePanel: WebUiPanel = {
  async mount(ctx) {
    const t = text(ctx.language);
    const sheet = ctx.ui.sheet({ title: t.upTitle, desc: t.upDesc });
    const head = ctx.ui.rowbar();
    const energy = ctx.ui.h('span', 'grow', '');
    const refresh = ctx.ui.button(t.upRefresh, {
      size: 'sm',
      onClick: () => {
        void load();
      },
    });
    head.append(energy, refresh);
    const cards = ctx.ui.h('div');
    sheet.body.append(head, cards);
    ctx.root.append(sheet.el);

    const render = (state: GenesisUpgradeState): void => {
      energy.textContent = state.locked ? t.upLocked : `${t.upEnergy}：${state.energyKj.toLocaleString('en-US')} kJ`;
      cards.textContent = '';
      for (const card of state.cards) {
        const box = ctx.ui.h('div', 'cardbox');
        box.style.border = '1px solid var(--line, #333)';
        box.style.borderRadius = '8px';
        box.style.padding = '10px';
        box.style.marginTop = '10px';
        const status =
          card.status === 'ready'
            ? t.upReady
            : card.status === 'repairing'
              ? t.upRepairing
              : card.status === 'maxed'
                ? t.upMaxed
                : t.upBroken;
        const heading = card.level !== undefined ? `${card.label} · lv${card.level}${card.maxLevel ? ` / lv${card.maxLevel}` : ''}` : card.label;
        const title = ctx.ui.h('h3', '', `${heading} · ${status}`);
        title.style.margin = '0 0 6px';
        const flavor = ctx.ui.h('p', 'muted', card.flavor);
        flavor.style.margin = '0 0 8px';
        box.append(title, flavor);
        if (card.window) {
          const now = ctx.ui.h('p', '', `${t.upWindow}：${card.window}${card.limitFactor ? `（${t.upLimit} ×${card.limitFactor}）` : ''}`);
          now.style.margin = '0 0 6px';
          box.append(now);
        }
        if (card.status === 'repairing') {
          const left = ctx.ui.h('p', '', `${t.upRepairing} · 还剩 ${card.leftHomeHours.toFixed(1)} 母星时`);
          box.append(left);
          cards.append(box);
          continue;
        }
        if (card.status === 'maxed') {
          if (card.benefits) box.append(ctx.ui.h('p', 'muted', card.benefits));
          cards.append(box);
          continue;
        }
        const need = ctx.ui.h(
          'p',
          '',
          `${t.upNeed} ${card.costKj.toLocaleString('en-US')} kJ + ` +
            card.materials.map((m) => `${m.name} ${m.needKg} kg（${m.haveKg} kg）`).join('、') +
            ` · ${card.buildHours} 母星时`,
        );
        need.style.margin = '0 0 8px';
        box.append(need);
        if (card.benefits) {
          const benefit = ctx.ui.h('p', 'muted', `${t.upBenefit}：${card.benefits}`);
          benefit.style.margin = '0 0 6px';
          box.append(benefit);
        }
        const button = ctx.ui.button(card.status === 'broken' ? t.upRepair : t.upUpgrade, {
          variant: 'primary',
          size: 'sm',
          onClick: () => {
            void repair(card.id, button);
          },
        });
        if (!card.canRepair) {
          button.disabled = true;
          if (card.blockers.length > 0) {
            box.append(ctx.ui.h('p', 'muted', card.blockers.join('；')));
          }
        }
        box.append(button);
        cards.append(box);
      }
    };

    const load = async (): Promise<void> => {
      try {
        render(await ctx.invoke<GenesisUpgradeState>('state'));
      } catch (error) {
        ctx.ui.toast(errorText(error), 'bad');
      }
    };

    const repair = async (id: string, button: HTMLButtonElement): Promise<void> => {
      button.disabled = true;
      try {
        render(await ctx.invoke<GenesisUpgradeState>('repair', [id]));
        ctx.ui.toast(t.upRepairing, 'ok');
        void ctx.refresh();
      } catch (error) {
        ctx.ui.toast(errorText(error), 'bad');
        button.disabled = false;
      }
    };

    await load();
    ctx.interval(() => {
      void load();
    }, 5000);
  },
};

const protocolPanel: WebUiPanel = {
  async mount(ctx) {
    const t = text(ctx.language);
    const sheet = ctx.ui.sheet({ title: t.protoTitle, desc: t.protoDesc });
    const head = ctx.ui.rowbar();
    const progress = ctx.ui.h('span', 'grow', '');
    const refresh = ctx.ui.button(t.protoRefresh, {
      size: 'sm',
      onClick: () => {
        void load();
      },
    });
    head.append(progress, refresh);
    const body = ctx.ui.h('div');
    const habitatBox = ctx.ui.h('div');
    const wakeButton = ctx.ui.button(t.protoWake, {
      variant: 'primary',
      onClick: () => {
        void wake(wakeButton);
      },
    });
    // 未创世 / 读不到存档时，这个按钮不该存在——它按下去只会报错。
    wakeButton.hidden = true;
    wakeButton.style.marginTop = '10px';
    sheet.body.append(head, body, habitatBox, wakeButton);
    ctx.root.append(sheet.el);

    const render = (panel: GenesisProtocolPanel): void => {
      wakeButton.hidden = false;
      progress.textContent = `${t.protoDone} ${panel.done} / ${panel.total}`;
      body.textContent = '';
      for (const chapter of panel.chapters) {
        const heading = ctx.ui.h('h3', '', `${chapter.title} · ${chapter.done}/${chapter.total}`);
        heading.style.margin = '10px 0 4px';
        body.append(heading);
        for (const task of chapter.tasks) {
          const row = ctx.ui.h('div', '', `${task.done ? '✓' : '○'} ${task.title}${task.done ? '' : ` · ${task.progress}`}`);
          row.style.padding = '2px 0';
          row.style.color = task.done ? 'var(--muted, #8a8a8a)' : '';
          body.append(row);
        }
      }
      habitatBox.textContent = '';
      if (panel.population) {
        const p = panel.population;
        habitatBox.append(
          ctx.ui.h('h3', '', t.protoPopulation),
          ctx.ui.h(
            'p',
            '',
            `${p.population} / ${p.capacity} · ${t.protoSleepers} ${p.sleepers} · ${t.protoLabor} ${p.laborUnits}` +
              (p.population < p.capacity
                ? ` · ${t.protoBirthProgress} ${Math.floor(p.birthHours)} / 192`
                : ''),
          ),
        );
      }
      if (panel.habitat) {
        const h = panel.habitat;
        habitatBox.append(
          ctx.ui.h('h3', '', `${t.protoHabitat}`),
          ctx.ui.h(
            'p',
            '',
            `${t.protoAwake} ${h.awake} · ${t.protoDormant} ${h.dormant} · ` +
              `${t.protoFood} ${h.food.toFixed(1)} kg · ${t.protoWater} ${h.water.toFixed(1)} L · ` +
              `${t.protoOxygen} ${h.oxygen.toFixed(1)} kg · ${t.protoHours} ${Number.isFinite(h.hoursLeft) ? `${Math.floor(h.hoursLeft)} 母星时` : '—'}`,
          ),
        );
      }
      if (panel.awakened) {
        wakeButton.disabled = true;
        wakeButton.textContent = t.protoAwakened;
      } else {
        wakeButton.disabled = !panel.ready || !panel.habitat;
        wakeButton.textContent = panel.ready ? t.protoWake : `${t.protoWake}（${t.protoDone} ${panel.done}/${panel.total}）`;
      }
    };

    const load = async (): Promise<void> => {
      try {
        render(await ctx.invoke<GenesisProtocolPanel>('state'));
      } catch (error) {
        // 没有存档是常态（第一次打开面板），不是错误：给一句引导，别留一个会报错的按钮。
        wakeButton.hidden = true;
        progress.textContent = '';
        body.textContent = '';
        habitatBox.textContent = '';
        const message = errorText(error);
        body.append(
          ctx.ui.h('p', 'muted', /还没有创世|旧版本/.test(message) ? t.protoLocked : message),
        );
        if (/旧版本/.test(message)) body.append(ctx.ui.h('p', 'muted', message));
      }
    };

    const wake = async (button: HTMLButtonElement): Promise<void> => {
      button.disabled = true;
      try {
        const panel = await ctx.invoke<GenesisProtocolPanel>('wake', []);
        render(panel);
        ctx.ui.toast(t.protoAwakened, 'ok');
        void ctx.refresh();
      } catch (error) {
        ctx.ui.toast(errorText(error), 'bad');
        button.disabled = false;
      }
    };

    await load();
    ctx.interval(() => {
      void load();
    }, 5000);
  },
};

const guidePanel: WebUiPanel = {
  mount(ctx) {
    const t = text(ctx.language);
    const sheet = ctx.ui.sheet({ title: t.guideTitle, desc: t.guideDesc });
    const searchRow = ctx.ui.rowbar();
    const searchInput = ctx.ui.input({ placeholder: t.guideSearchHint });
    searchInput.type = 'text';
    const searchButton = ctx.ui.button(t.guideSearch, { size: 'sm' });
    searchRow.append(searchInput, searchButton);
    const chips = ctx.ui.h('div', 'rows');
    const article = ctx.ui.h('div', 'cols');
    const hint = ctx.ui.h('p', 'muted', t.guideEmpty);
    chips.append(ctx.ui.h('span', 'muted', t.guidePick));
    article.append(hint);
    sheet.body.append(searchRow, chips, article);
    ctx.root.append(sheet.el);

    let current: string | null = null;
    let topics: Array<{ id: string; title: string }> = [];

    const paintChips = (): void => {
      for (const chip of Array.from(chips.querySelectorAll('button'))) chip.remove();
      for (const topic of topics) {
        const button = ctx.ui.button(topic.title, { size: 'sm', variant: topic.id === current ? 'primary' : undefined });
        button.addEventListener('click', () => {
          void open(topic.id);
        });
        chips.append(button);
      }
    };

    const open = async (id: string): Promise<void> => {
      current = id;
      paintChips();
      try {
        const payload = await ctx.invoke<{ id: string; title: string; text: string }>('read', [id]);
        article.replaceChildren(renderMarkdown(document, payload.text));
      } catch (error) {
        article.replaceChildren(ctx.ui.h('p', 'muted', errorText(error)));
      }
    };

    const search = async (): Promise<void> => {
      const query = searchInput.value.trim();
      if (!query) return;
      const busy = ctx.ui.disable(searchButton);
      try {
        const payload = await ctx.invoke<{ text: string }>('search', [query]);
        const card = renderMarkdown(document, payload.text);
        card.classList.add('mono');
        article.replaceChildren(card);
      } catch (error) {
        article.replaceChildren(ctx.ui.h('p', 'muted', errorText(error)));
      } finally {
        busy.dispose();
      }
    };

    searchButton.addEventListener('click', () => void search());
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') void search();
    });

    const load = async (): Promise<void> => {
      try {
        const payload = await ctx.invoke<{ topics: Array<{ id: string; title: string }> }>('topics');
        topics = payload.topics ?? [];
        paintChips();
        if (topics.length === 0) return;
        if (!current || !topics.some((topic) => topic.id === current)) {
          await open(topics[0]!.id);
        }
      } catch (error) {
        hint.textContent = errorText(error);
      }
    };

    void load();
  },
};

/** 把教程正文的 markdown 铺成节点：标题、引用、列表、`代码`。 */
function renderMarkdown(owner: Document, text: string): HTMLElement {
  const root = owner.createElement('div');
  root.className = 'rows';
  let listEl: HTMLElement | null = null;
  let listKind: 'ul' | 'ol' | null = null;
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) {
      listEl = null;
      listKind = null;
      continue;
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      listEl = null;
      listKind = null;
      const level = heading[1]!.length;
      const el = owner.createElement(level === 1 ? 'h2' : level === 2 ? 'h3' : 'h4');
      el.append(...inlineNodes(owner, heading[2]!));
      root.append(el);
      continue;
    }
    const quote = /^>\s?(.*)$/.exec(line);
    if (quote) {
      listEl = null;
      listKind = null;
      const el = owner.createElement('blockquote');
      el.append(...inlineNodes(owner, quote[1]!));
      root.append(el);
      continue;
    }
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const numbered = /^\d+\.\s+(.*)$/.exec(line);
    if (bullet || numbered) {
      const kind = bullet ? 'ul' : 'ol';
      if (!listEl || listKind !== kind) {
        listEl = owner.createElement(kind);
        listKind = kind;
        root.append(listEl);
      }
      const li = owner.createElement('li');
      li.append(...inlineNodes(owner, (bullet ?? numbered)![1]!));
      listEl.append(li);
      continue;
    }
    listEl = null;
    listKind = null;
    const p = owner.createElement('p');
    p.append(...inlineNodes(owner, line));
    root.append(p);
  }
  return root;
}

function inlineNodes(owner: Document, text: string): Node[] {
  const nodes: Node[] = [];
  const pattern = /`([^`]+)`/g;
  let last = 0;
  let match: RegExpExecArray | null = pattern.exec(text);
  while (match) {
    if (match.index > last) nodes.push(owner.createTextNode(text.slice(last, match.index)));
    const code = owner.createElement('code');
    code.textContent = match[1]!;
    nodes.push(code);
    last = match.index + match[0].length;
    match = pattern.exec(text);
  }
  if (last < text.length) nodes.push(owner.createTextNode(text.slice(last)));
  return nodes;
}

const bundle: WebUiClientBundle = { panels: { system: panel, upgrade: upgradePanel, protocol: protocolPanel, guide: guidePanel } };

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** 纯数字按数字传，其余当字符串（服务端会哈希）；空串回落默认种子。 */
function normalizeSeedInput(raw: string): number | string {
  const text = raw.trim();
  if (!text) return 20261111;
  return /^\d{1,15}$/.test(text) ? Number(text) : text;
}

export default bundle;
