// src/webui/client.ts
var ZH = {
  title: "\u521B\u4E16\u8BB0",
  desc: "\u4E00\u9897\u661F\uFF0C\u53EA\u6210\u5F62\u4E00\u6B21\u3002\u9009\u597D\u79CD\u5B50\u4E0E\u51E0\u4E2A\u65CB\u94AE\uFF0C\u5199\u8FDB\u5B58\u6863\u540E\u5C31\u9501\u5B9A\u3002",
  loading: "\u6B63\u5728\u8BFB\u53D6\u5B58\u6863\u2026",
  seed: "\u79CD\u5B50",
  star: "\u6052\u661F\u8D28\u91CF\uFF08\u592A\u9633\u8D28\u91CF\uFF09",
  planets: "\u884C\u661F\u6570",
  moons: "\u6BCF\u9897\u884C\u661F\u7684\u536B\u661F\u4E0A\u9650",
  starName: "\u6052\u661F\u7684\u540D\u5B57",
  homeName: "\u6BCD\u661F\u7684\u540D\u5B57",
  create: "\u521B\u4E16",
  reset: "\u5220\u6863\u91CD\u5F00",
  resetTitle: "\u786E\u5B9A\u8981\u5220\u6389\u8FD9\u9897\u661F\u7403\u5417\uFF1F",
  resetBody: "\u5B58\u6863\u4F1A\u88AB\u5220\u9664\uFF0C\u4E4B\u540E\u53EF\u4EE5\u91CD\u65B0\u521B\u4E16\u3002\u5DF2\u7ECF\u53D1\u751F\u7684\u6545\u4E8B\u4E0D\u4F1A\u56DE\u6765\u3002",
  created: "\u521B\u4E16\u5B8C\u6210\uFF0C\u5DF2\u9501\u5B9A\u3002",
  locked: "\u5DF2\u521B\u4E16 \xB7 \u9501\u5B9A",
  hint: "\u540C\u4E00\u79CD\u5B50\u4E0E\u540C\u4E00\u7EC4\u65CB\u94AE\u6C38\u8FDC\u5F97\u5230\u540C\u4E00\u4E2A\u661F\u7CFB\uFF1B\u6362\u5B58\u6863\u7B49\u4E8E\u6362\u4E00\u9897\u661F\u3002",
  hintNumber: "\u6570\u5B57\u79CD\u5B50\uFF1A\u540C\u4E00\u4E2A\u6570\u5B57 + \u8FD9\u9897\u6052\u661F\uFF0C\u6C38\u8FDC\u662F\u540C\u4E00\u4E2A\u661F\u7CFB\u3002\u60F3\u6362\u4E16\u754C\u5C31\u6539\u6570\u5B57\u3002",
  hintText: "\u6587\u5B57\u79CD\u5B50\u4F1A\u88AB\u54C8\u5E0C\u6210\u6570\u5B57\uFF1A\u540C\u4E00\u53E5\u8BDD\u6C38\u8FDC\u662F\u540C\u4E00\u4E2A\u661F\u7CFB\uFF0C\u5927\u5C0F\u5199\u4E0E\u7A7A\u683C\u4E5F\u7B97\u6570\u3002",
  seedHint: "\u6570\u5B57\uFF0C\u6216\u4EFB\u610F\u4E00\u53E5\u8BDD",
  starMassValue: (mass) => {
    const label = mass < 0.45 ? "\u7EA2\u77EE\u661F" : mass < 0.8 ? "\u6A59\u77EE\u661F" : mass < 1.1 ? "\u7C7B\u592A\u9633" : mass < 1.5 ? "\u4EAE\u9EC4\u661F" : "A \u578B\u661F";
    return `${mass.toFixed(2)} M\u2609\uFF08${label}\uFF09`;
  },
  shapePreview: (planets, moons, minPlanets, maxPlanets) => `\u8FD9\u9897\u79CD\u5B50\uFF1A${planets} \u9897\u884C\u661F\uFF08\u8FD9\u9897\u6052\u661F\u7ED9\u5B83 ${minPlanets}\u2013${maxPlanets} \u9897\u4E4B\u95F4\u7684\u4F4D\u7F6E\uFF09\xB7 \u6BCF\u9897\u6700\u591A ${moons} \u9897\u536B\u661F`,
  mapTitle: "\u5929\u4F53\u73AF\u5883\uFF08\u58A8\u5361\u6258\uFF09",
  mapDesc: "\u6309\u7FA4\u7CFB\u4E0A\u8272\uFF1B\u5212\u8FC7\u6216\u70B9\u4E00\u4E0B\u770B\u90A3\u4E2A\u683C\u5B50\u7684\u7EAC\u5EA6\u3001\u7ECF\u5EA6\u4E0E\u7FA4\u7CFB\u3002\u5CA9\u77F3\u884C\u661F\u8FD8\u6709\u6D77\u62D4\uFF0C\u6C14\u6001/\u51B0\u5DE8\u661F\u770B\u98CE\u66B4\u5E26\u3002",
  mapPick: "\u5929\u4F53",
  mapNoBody: "\u8FD9\u4E2A\u6052\u661F\u7CFB\u91CC\u6CA1\u6709\u80FD\u753B\u5730\u56FE\u7684\u5929\u4F53\u3002",
  mapLoading: "\u6B63\u5728\u753B\u5730\u56FE\u2026",
  mapOcean: "\u6D77\u6D0B\u5360\u6BD4",
  mapWind: "\u98CE\u901F",
  mapMoon: "\u536B\u661F\u5730\u8868",
  mapLegend: "\u56FE\u4F8B",
  powerTitle: "\u80FD\u91CF",
  energy: "\u80FD\u91CF",
  generator: "\u52A8\u80FD\u53D1\u7535\u673A\uFF08+{kj} kJ\uFF09",
  generatorBusy: "\u52A8\u80FD\u53D1\u7535\u673A\uFF08\u51B7\u5374\u4E2D\u2026\uFF09",
  generatorHint: "\u53EA\u6709\u4F60\u80FD\u6309\uFF1BAgent \u4E0D\u4F1A\u81EA\u5DF1\u53D1\u7535\uFF0C\u7F3A\u7535\u65F6\u4F1A\u6765\u6C42\u4F60\u3002\u73B0\u5728\u4E00\u6B21 {kj} kJ\uFF0C0.5 \u79D2\u51B7\u5374\u3002\u4FEE\u3010\u706B\u82B1\u585E\u3011\u80FD\u8BA9\u5B83\u66F4\u7701\u529B\u3002",
  gridIn: "\u4ECE\u7535\u7F51\u642C\u7535\uFF08-10%\uFF09",
  gridOut: "\u628A\u7535\u9001\u8FDB\u7535\u7F51\uFF08-10%\uFF09",
  gridStored: "\u672C\u5730\u7535\u7F51\uFF1A",
  gridReach: "\u7535\u5854\u5C31\u5728",
  gridFar: "\u79BB\u7535\u5854",
  gridTowerAt: "\u7535\u5854\u5728",
  gridNoTower: "\u8FD9\u9897\u661F\u8FD8\u6CA1\u6709\u3010\u6574\u6D41\u7535\u5854\u3011\uFF1A\u5E06\u53D1\u7684\u7535\u76F4\u63A5\u8FDB\u7535\u6C60\uFF0C\u8BBE\u5907\u4E5F\u6CA1\u6CD5\u5728\u672C\u5730\u53D6\u7535\u3002",
  tungsten: "\u94A8",
  shipLine: (food, water, oxygen, sleepers, hours) => `\u7740\u9646\u8231\uFF1A\u7CAE ${food} kg\u3001\u6C34 ${water} L\u3001\u6C27 ${oxygen} kg \xB7 ${sleepers} \u4E2A\u4EBA\u7761\u7740\uFF0C\u5927\u7EA6\u8FD8\u591F ${hours} \u6BCD\u661F\u65F6`,
  buyChart: "\u4E70\u4E00\u5F20\u661F\u56FE\uFF08300 \u4FE1\u7528\u70B9\uFF09",
  goHere: "\u53BB\u8FD9\u91CC",
  planterName: "\u79CD\u690D\u76C6",
  planterOk: "\u901A\u7535\uFF0C22\u2103",
  planterOff: "\u65AD\u7535\uFF0C\u8DDF\u7740\u5916\u9762\u51B7\u70ED",
  monitorTitle: "\u73AF\u5883\u76D1\u6D4B\u5668",
  monitorInstall: "\u5728\u8FD9\u9897\u5929\u4F53\u88C5\u4E00\u53F0\uFF08150,000 kJ\uFF09",
  monitorCount: "\u5DF2\u76D1\u6D4B",
  monitorStar: "\uFF08\u6052\u661F\u5168\u8C8C\u5DF2\u89E3\u9501\uFF09",
  monitorNone: "\u8FD8\u6CA1\u6709\u88C5\u76D1\u6D4B\u5668\u7684\u5929\u4F53\uFF1A\u770B\u4E0D\u5230\u7EC6\u8282\uFF0C\u4E5F\u753B\u4E0D\u4E86\u5730\u56FE\u3002",
  floraTitle: "\u519C\u573A",
  floraNone: "\u8FD8\u6CA1\u6709\u7AD9\u70B9\u3002\u8D70\u5230\u5730\u65B9\u4EE5\u540E\uFF0C\u8BA9 Agent \u7528 genesis_site \u5EFA\u4E00\u4E2A\u3002",
  floraSite: "\u5728\u811A\u4E0B\u5EFA\u7AD9\u70B9",
  floraShop: "\u5546\u4EBA",
  floraInventory: "\u4ED3\u5E93",
  floraEmpty: "\u7A7A",
  floraBags: "\u79CD\u5B50\u888B",
  floraPlant: "\u79CD\u4E0B",
  floraHarvest: "\u6536\u6210\u719F",
  floraWet: "\u6E7F\u5EA6",
  floraFert: "\u80A5\u529B",
  floraTransplant: "\u79FB\u683D",
  floraRemove: "\u62D4\u6389",
  floraInspect: "\u8BE6\u60C5",
  floraBreed: "\u7559\u79CD",
  floraClosed: "\u5546\u4EBA\u4E0D\u5728",
  storeTitle: "\u80CC\u5305\u4E0E\u4ED3\u5E93",
  storeRefresh: "\u5237\u65B0",
  storeDeposit: "\u5B58 10 kg",
  storeWithdraw: "\u53D6 10 kg",
  storeDemolish: "\u62C6\u6389",
  terminalBuffer: "\u6536\u8D27\u53E3\u7F13\u51B2",
  terminalFull: "\u6EE1\u4E86\uFF1A\u5546\u4EBA\u4E0D\u518D\u6536\u8D27\uFF0C\u7B49\u65E0\u4EBA\u673A\u6216\u4F60\u81EA\u5DF1\u6765\u642C",
  terminalTake: "\u53D6\u4E00\u888B",
  travelTitle: "\u53BB\u522B\u5904",
  travelGo: "\u53BB",
  travelHint: "\u586B\u7ECF\u7EAC\u5EA6\uFF0C\u8D70\u8FC7\u53BB\uFF08\u4E0D\u662F\u77AC\u79FB\uFF0C\u5230\u4E86\u4F1A\u6536\u5230\u4E8B\u4EF6\uFF09\u3002",
  lookHere: "\u770B\u9644\u8FD1",
  surveyHere: "\u6D4B\u7ED8\u4E00\u5708",
  surveyDone: "\u6D4B\u8FC7\u4E86",
  lookHint: "\u548C\u6A21\u578B\u8C03\u7528 genesis_look \u770B\u5230\u7684\u662F\u540C\u4E00\u6BB5\u6587\u5B57\u3002",
  veinsHere: "\u626B\u63CF\u77FF\u8109",
  waitDawn: "\u7B49\u5230\u5929\u4EAE",
  waitDusk: "\u7B49\u5230\u5929\u9ED1",
  waitNoon: "\u7B49\u5230\u4E2D\u5348\uFF08\u5546\u5E97\u5F00\u95E8\uFF09",
  waitRipe: "\u7B49\u5230\u4F5C\u7269\u719F",
  waitBuilt: "\u7B49\u5230\u5B8C\u5DE5",
  waitArrive: "\u7B49\u5230\u62B5\u8FBE",
  buildTitle: "\u5EFA\u9020",
  buildHere: "\u5728\u539F\u5730\u5EFA",
  buildSite: "\u5728\u8FD9\u91CC\u5EFA\u7AD9\u70B9",
  buildBusy: "\u5728\u5EFA",
  buildSlots: "\u65BD\u5DE5\u961F\u5217",
  buildFull: "\u961F\u5217\u6EE1\u4E86\u2014\u2014\u53BB\u3010\u5347\u7EA7\u3011\u4FEE\u5B50\u4EE3\u7406",
  lifeTitle: "\u534F\u8BAE\u4E0E\u751F\u547D\u7EF4\u6301",
  lifeProtocol: "\u534F\u8BAE",
  lifeHabitat: "\u5C45\u6240",
  lifeHours: "\u8FD8\u80FD\u6491",
  lifeOrder: "\u57FA\u56E0\u8BA2\u5355",
  lifeDeliver: "\u4EA4\u8D27",
  lifeCylinder: "\u4E70 10 \u4E2A\u94A2\u74F6",
  lifeWake: "\u53EB\u9192\u4EBA\u7C7B",
  lifeLocked: "\u534F\u8BAE\u6CA1\u5168\u7EFF\uFF0C\u8FD8\u53EB\u4E0D\u9192\u3002",
  buildNone: "\u6CA1\u6709\u5728\u65BD\u5DE5\u7684\u5DE5\u7A0B\u3002",
  detailTitle: "\u5EFA\u7B51",
  detailContents: "\u5185\u5BB9\u7269",
  armLine: "\u673A\u68B0\u81C2",
  dutyLine: "\u503C\u73ED\u7EC8\u7AEF",
  armCycle: "\u26A0 \u8FD9\u6761\u7EBF\u63A5\u6210\u73AF\u4E86\uFF1A\u8D27\u4F1A\u5728\u51E0\u5EA7\u81C2\u4E4B\u95F4\u6765\u56DE\u5012\uFF0C\u767D\u70E7\u7535\u3002",
  habitatLine: "\u5BA4\u5185",
  comfortOk: "\u4F4F\u5F97\u4E0B",
  comfortHot: "\u592A\u70ED\u4E86\uFF0C\u4EBA\u4E0D\u4F1A\u4F4F",
  comfortCold: "\u592A\u51B7\u4E86\uFF0C\u4EBA\u4E0D\u4F1A\u4F4F",
  detailEmpty: "\u91CC\u9762\u662F\u7A7A\u7684\u3002",
  detailDemolish: "\u62C6\u6389",
  detailNear: "\u8D70\u5230\u9644\u8FD1",
  detailClose: "\u5173\u6389",
  upTitle: "\u5347\u7EA7",
  upDesc: "\u8239\u8EAB\u4E0A\u7684\u4E1C\u897F\u3002\u8FEB\u964D\u65F6\u70E7\u574F\u7684\u90E8\u4EF6\u5728\u8FD9\u91CC\u4FEE\u2014\u2014\u4FEE\u597D\u4E4B\u524D\uFF0C\u6709\u4E9B\u5730\u65B9\u53BB\u4E0D\u4E86\u3002",
  upEnergy: "\u80FD\u91CF",
  upRepair: "\u4FEE",
  upRepairing: "\u6B63\u5728\u4FEE",
  upReady: "\u5DF2\u4FEE\u590D",
  upBroken: "\u635F\u574F",
  upMaxed: "\u5DF2\u5230\u9876",
  upUpgrade: "\u5347\u7EA7",
  upWindow: "\u8425\u4E1A\u65F6\u95F4",
  upLimit: "\u6BCF\u65E5\u9650\u989D",
  upBenefit: "\u4E0B\u4E00\u7EA7",
  upRefresh: "\u5237\u65B0",
  upLocked: "\u8FD8\u6CA1\u6709\u521B\u4E16\u3002",
  upNeed: "\u9700\u8981",
  protoTitle: "\u534F\u8BAE",
  protoDesc: "\u53EB\u9192\u8239\u4E0A\u7684\u4EBA\u8981\u505A\u7684\u4E8B\uFF0C\u5206\u4E09\u7AE0\u3002\u5168\u90E8\u5B8C\u6210\u4E4B\u540E\uFF0C\u8FD9\u91CC\u7684\u6309\u94AE\u5C31\u80FD\u628A\u4F11\u7720\u8231\u6253\u5F00\u3002",
  protoDone: "\u5B8C\u6210",
  protoRefresh: "\u5237\u65B0",
  protoHabitat: "\u5C45\u6240",
  protoAwake: "\u6E05\u9192",
  protoDormant: "\u4F11\u7720",
  protoFood: "\u98DF\u7269",
  protoWater: "\u996E\u7528\u6C34",
  protoOxygen: "\u6C27\u6C14",
  protoHours: "\u8FD8\u80FD\u6491",
  protoWake: "\u53EB\u9192\u4ED6\u4EEC",
  protoAwakened: "\u4EBA\u7C7B\u5DF2\u7ECF\u9192\u4E86\u3002",
  protoLocked: "\u8FD8\u6CA1\u6709\u521B\u4E16\u3002\u5148\u53BB\u300C\u8FD9\u4E00\u9897\u661F\u7403\u300D\u9875\u7B7E\u521B\u4E00\u6B21\u4E16\uFF0C\u8FD9\u91CC\u624D\u4F1A\u957F\u51FA\u6E05\u5355\u3002",
  protoPopulation: "\u5E38\u4F4F\u4EBA\u53E3",
  protoSleepers: "\u4F11\u7720\u8231\u91CC\u8FD8\u5269",
  protoLabor: "\u4EBA\u624B",
  protoBirthProgress: "\u4E0B\u4E00\u80CE\u8FDB\u5EA6\uFF08\u6BCD\u661F\u65F6\uFF09",
  guideTitle: "\u624B\u518C",
  guideDesc: "\u548C genesis_guide \u540C\u4E00\u4EFD\u6559\u7A0B\u3002\u5DE6\u8FB9\u6311\u4E00\u7BC7\uFF0C\u53F3\u8FB9\u770B\u6B63\u6587\u2014\u2014\u6539\u6587\u6848\u53BB src/guide/*.md\u3002",
  guidePick: "\u6311\u4E00\u7BC7\uFF1A",
  guideEmpty: "\u6311\u4E00\u7BC7\u3002\u4E0D\u786E\u5B9A\u4ECE\u54EA\u770B\uFF0C\u5148\u770B\u300C\u9192\u6765\u300D\uFF0C\u518D\u770B\u300C\u8DEF\u7EBF\u56FE\u300D\u3002",
  guideSearch: "\u67E5\u4E1C\u897F",
  guideSearchHint: "\u67E5\u4E00\u4EF6\u4E1C\u897F\uFF1A\u6E29\u5BA4\u3001\u94A8\u3001\u8150\u70C2\u3001duty\u2026",
  protoClear: "\u5168\u90E8\u5B8C\u6210\u3002"
};
var EN = {
  title: "Genesis",
  desc: "One star, formed once. Pick a seed and a few knobs; locked after saving.",
  loading: "Reading the save\u2026",
  seed: "Seed",
  star: "Star mass (solar masses)",
  planets: "Planets",
  moons: "Moons per planet (max)",
  starName: "Star name",
  homeName: "Home world name",
  create: "Create",
  reset: "Delete save",
  resetTitle: "Delete this world?",
  resetBody: "The save is removed and genesis opens again. The story so far does not come back.",
  created: "Created and locked.",
  locked: "Locked",
  hint: "Same seed and knobs always give the same system; a new save means a new star.",
  hintNumber: "Numeric seed: the same number with this star always gives the same system.",
  hintText: "A text seed is hashed into a number: the same phrase always gives the same system \u2014 case and spaces count.",
  seedHint: "A number, or any phrase",
  starMassValue: (mass) => {
    const label = mass < 0.45 ? "red dwarf" : mass < 0.8 ? "orange dwarf" : mass < 1.1 ? "sun-like" : mass < 1.5 ? "bright yellow" : "A-type";
    return `${mass.toFixed(2)} M\u2609 (${label})`;
  },
  shapePreview: (planets, moons, minPlanets, maxPlanets) => `This seed: ${planets} planets (between ${minPlanets} and ${maxPlanets}) \xB7 up to ${moons} moons each`,
  mapTitle: "Body environment (Mercator)",
  mapDesc: "Colored by biome; hover or click a cell to see its lat/lon and biome. Rocky planets also show elevation, gas/ice giants show storm bands.",
  mapPick: "Body",
  mapNoBody: "No body in this system can be mapped.",
  mapLoading: "Drawing the map\u2026",
  mapOcean: "Ocean",
  mapWind: "Wind",
  mapMoon: "Moon surface",
  mapLegend: "Legend",
  powerTitle: "Energy",
  energy: "Energy",
  generator: "Kinetic generator (+{kj} kJ)",
  generatorBusy: "Kinetic generator (cooling\u2026)",
  generatorHint: "Only you can press it; the agent never generates power and will ask you when it needs some. Now {kj} kJ per press, 0.5 s cooldown. Repairing the spark plug makes it go further.",
  gridIn: "Tap the grid (\u221210%)",
  gridOut: "Feed the grid (\u221210%)",
  gridStored: "Local grid: ",
  gridReach: "tower is",
  gridFar: "tower is",
  gridTowerAt: "at",
  gridNoTower: "This planet has no rectifier tower: sails charge the battery directly, and nothing here can draw local power.",
  tungsten: "tungsten",
  shipLine: (food, water, oxygen, sleepers, hours) => `Landing pod: ${food} kg food, ${water} L water, ${oxygen} kg oxygen \xB7 ${sleepers} asleep, about ${hours} home-hours left`,
  buyChart: "Buy a star chart (300 credits)",
  goHere: "Fly there",
  planterName: "planter",
  planterOk: "powered, 22 \xB0C",
  planterOff: "unpowered \u2014 takes the outside weather",
  monitorTitle: "Environment monitor",
  monitorInstall: "Install one on this body (150,000 kJ)",
  monitorCount: "Monitored",
  monitorStar: "(star fully unlocked)",
  monitorNone: "No monitors yet: no details, no maps.",
  floraTitle: "Farm",
  floraNone: "No sites yet. Walk somewhere and have the agent found one with genesis_site.",
  floraSite: "Found a site here",
  floraShop: "Merchant",
  floraInventory: "Stock",
  floraEmpty: "empty",
  floraBags: "Seed bags",
  floraPlant: "Sow",
  floraHarvest: "Harvest",
  floraWet: "wet",
  floraFert: "fertile",
  floraTransplant: "Transplant",
  floraRemove: "Uproot",
  floraInspect: "Details",
  floraBreed: "Breed",
  floraClosed: "Merchant is away",
  storeTitle: "Backpack & stores",
  storeRefresh: "Refresh",
  storeDeposit: "Deposit 10 kg",
  storeWithdraw: "Withdraw 10 kg",
  storeDemolish: "Demolish",
  terminalBuffer: "Dock buffer",
  terminalFull: "Full \u2014 the merchant takes no more; a drone or you must clear it",
  terminalTake: "Take a bag",
  travelTitle: "Travel",
  travelGo: "Go",
  travelHint: "Enter lat/lon. You walk there over time; an event arrives when you get there.",
  lookHere: "Look around",
  surveyHere: "Survey here",
  surveyDone: "Already surveyed",
  lookHint: "Same text the model gets from genesis_look.",
  veinsHere: "Scan veins",
  waitDawn: "Wait for dawn",
  waitDusk: "Wait for dusk",
  waitNoon: "Wait for noon (shop opens)",
  waitRipe: "Wait for a crop",
  waitBuilt: "Wait for build",
  waitArrive: "Wait for arrival",
  buildTitle: "Build",
  buildHere: "Build here",
  buildSite: "Found a site here",
  buildBusy: "Under construction",
  buildSlots: "Build queue",
  buildFull: "queue full \u2014 repair subagents in Upgrades",
  lifeTitle: "Protocol & life support",
  lifeProtocol: "Protocol",
  lifeHabitat: "Habitat",
  lifeHours: "holds for",
  lifeOrder: "Gene orders",
  lifeDeliver: "Deliver",
  lifeCylinder: "Buy 10 cylinders",
  lifeWake: "Wake the humans",
  lifeLocked: "Protocol not complete yet.",
  buildNone: "Nothing under construction.",
  detailTitle: "Structure",
  detailContents: "Contents",
  armLine: "Arm",
  dutyLine: "Duty terminal",
  armCycle: "\u26A0 This line loops: goods will shuttle between arms and burn power.",
  habitatLine: "Indoor",
  comfortOk: "livable",
  comfortHot: "too hot \u2014 nobody will stay",
  comfortCold: "too cold \u2014 nobody will stay",
  detailEmpty: "Empty.",
  detailDemolish: "Demolish",
  detailNear: "Walk over",
  detailClose: "Close",
  upTitle: "Upgrades",
  upDesc: "Parts of the ship. What the crash burned out gets repaired here; some places stay out of reach until then.",
  upEnergy: "Energy",
  upRepair: "Repair",
  upRepairing: "Repairing",
  upReady: "Repaired",
  upBroken: "Broken",
  upMaxed: "Fully upgraded",
  upUpgrade: "Upgrade",
  upWindow: "Trade window",
  upLimit: "Daily limit",
  upBenefit: "Next level",
  upRefresh: "Refresh",
  upLocked: "No world yet.",
  upNeed: "needs",
  protoTitle: "Protocol",
  protoDesc: "What it takes to wake the people aboard, in three chapters. When every line is done, the button here opens the pods.",
  protoDone: "done",
  protoRefresh: "Refresh",
  protoHabitat: "Habitat",
  protoAwake: "awake",
  protoDormant: "dormant",
  protoFood: "food",
  protoWater: "water",
  protoOxygen: "oxygen",
  protoHours: "lasts",
  protoWake: "Wake them",
  protoAwakened: "The people are awake.",
  protoLocked: 'Nothing has been created yet \u2014 create a world in the "This world" tab first.',
  protoPopulation: "Colonists",
  protoSleepers: "Still asleep",
  protoLabor: "Hands",
  protoBirthProgress: "Next birth (home hours)",
  guideTitle: "Manual",
  guideDesc: "The same chapters genesis_guide serves. Pick one on the left; edit the text in src/guide/*.md.",
  guidePick: "Chapters:",
  guideEmpty: 'Pick a chapter. If you are not sure, start with "Waking up", then "Roadmap".',
  guideSearch: "Look up",
  guideSearchHint: "Look up one thing: greenhouse, tungsten, rot, duty\u2026",
  protoClear: "All done."
};
function text(language) {
  return language.startsWith("zh") ? ZH : EN;
}
var BIOME_LABELS = [
  "\u6D77\u6D0B",
  "\u51B0\u76D6",
  "\u82D4\u539F",
  "\u9AD8\u5C71",
  "\u6C99\u6F20",
  "\u8349\u539F",
  "\u7A00\u6811\u8349\u539F",
  "\u9488\u53F6\u6797",
  "\u6E29\u5E26\u68EE\u6797",
  "\u70ED\u5E26\u5B63\u96E8\u6797",
  "\u70ED\u5E26\u96E8\u6797",
  "\u536B\u661F",
  "\u5E73\u9759\u5E26",
  "\u5FAE\u98CE\u5E26",
  "\u98CE\u66B4\u5E26",
  "\u5F3A\u98CE\u66B4\u5E26",
  "\u5DE8\u578B\u98CE\u66B4"
];
var BIOME_COLORS = [
  "#1f6fb2",
  // 0 海洋
  "#e8f4fb",
  // 1 冰盖
  "#9aa9a0",
  // 2 苔原
  "#8a7a6a",
  // 3 高山
  "#e0c070",
  // 4 沙漠
  "#a8c478",
  // 5 草原
  "#c2b06a",
  // 6 稀树草原
  "#5e7a52",
  // 7 针叶林
  "#4e8a44",
  // 8 温带森林
  "#3f9e5f",
  // 9 热带季雨林
  "#1f7a3f",
  // 10 热带雨林
  "#9a9aa0",
  // 11 卫星
  "#9fd0e8",
  // 12 平静带
  "#5ba6c9",
  // 13 微风带
  "#4a7fb5",
  // 14 风暴带
  "#7a5fb5",
  // 15 强风暴带
  "#c14b6b"
  // 16 巨型风暴
];
var MERC_LIMIT_DEG = 85;
function mercY(latDeg) {
  const rad = Math.min(MERC_LIMIT_DEG, Math.max(-MERC_LIMIT_DEG, latDeg)) * Math.PI / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
}
function yPx(latDeg, height) {
  const half = mercY(MERC_LIMIT_DEG);
  return (1 - (mercY(latDeg) + half) / (2 * half)) * height;
}
function xPx(lonDeg, width) {
  return (lonDeg + 180) / 360 * width;
}
function pxToLatDeg(y, height) {
  const half = mercY(MERC_LIMIT_DEG);
  const m = half - y / height * 2 * half;
  return (2 * Math.atan(Math.exp(m)) - Math.PI / 2) * 180 / Math.PI;
}
function pxToLonDeg(x, width) {
  return x / width * 360 - 180;
}
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function field(ui, label, input, hint) {
  const row = ui.h("div");
  row.style.display = "grid";
  row.style.gap = "4px";
  const help = ui.h("span", "muted", hint);
  help.style.fontSize = "12px";
  row.append(ui.h("label", "muted", label), input, help);
  return row;
}
var WIDTH = 720;
var HEIGHT = 360;
function drawMap(canvas, map) {
  const context = canvas.getContext("2d");
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
      context.fillStyle = BIOME_COLORS[map.biome[i][j]] ?? "#000";
      context.fillRect(x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0));
    }
  }
  for (const cell of map.terra ?? []) {
    if (!(cell.p > 0)) continue;
    const latTop = -90 + cell.i * latStep;
    const lonLeft = -180 + cell.j * lonStep;
    const x0 = xPx(lonLeft, WIDTH);
    const x1 = xPx(lonLeft + lonStep, WIDTH);
    const y0 = yPx(latTop + latStep, HEIGHT);
    const y1 = yPx(latTop, HEIGHT);
    context.globalAlpha = Math.min(1, Math.max(0, cell.p));
    context.fillStyle = BIOME_COLORS[cell.targetBiome] ?? "#fff";
    context.fillRect(x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0));
    context.globalAlpha = 1;
  }
  for (const cell of map.scar ?? []) {
    if (!(cell.v > 0)) continue;
    const latTop = -90 + cell.i * latStep;
    const lonLeft = -180 + cell.j * lonStep;
    const x0 = xPx(lonLeft, WIDTH);
    const x1 = xPx(lonLeft + lonStep, WIDTH);
    const y0 = yPx(latTop + latStep, HEIGHT);
    const y1 = yPx(latTop, HEIGHT);
    context.globalAlpha = Math.min(0.75, Math.max(0, cell.v) * 0.75);
    context.fillStyle = "#6b5a4a";
    context.fillRect(x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0));
    context.globalAlpha = 1;
  }
}
var panel = {
  async mount(ctx) {
    const t = text(ctx.language);
    const sheet = ctx.ui.sheet({ title: t.title, desc: t.desc });
    const box = ctx.ui.h("div");
    sheet.body.append(box);
    ctx.root.append(sheet.el);
    let state = null;
    let busy = false;
    const form = ctx.ui.h("div");
    form.style.display = "grid";
    form.style.gap = "12px";
    const seedInput = ctx.ui.input({ type: "text", value: "20261111" });
    seedInput.placeholder = t.seedHint;
    const doc = ctx.root.ownerDocument;
    const starRow = ctx.ui.h("div");
    starRow.style.display = "grid";
    starRow.style.gap = "4px";
    const starLabel = ctx.ui.h("div", "mono");
    starLabel.style.fontSize = "12px";
    const starInput = doc.createElement("input");
    starInput.type = "range";
    starInput.min = "0.15";
    starInput.max = "2";
    starInput.step = "0.05";
    starInput.value = "1";
    starInput.style.width = "100%";
    starRow.append(starInput, starLabel);
    const setStarMass = (value) => {
      starInput.value = String(value);
      starLabel.textContent = t.starMassValue(Number(starInput.value));
    };
    starInput.addEventListener("input", () => setStarMass(Number(starInput.value)));
    setStarMass(1);
    const starNameInput = ctx.ui.input({ type: "text", value: "\u6052\u661F" });
    const homeNameInput = ctx.ui.input({ type: "text", value: "\u6BCD\u661F" });
    starNameInput.maxLength = 12;
    homeNameInput.maxLength = 12;
    const hint = ctx.ui.h("p", "muted", t.hint);
    hint.style.fontSize = "12px";
    const preview = ctx.ui.h("p", "muted", "");
    preview.style.fontSize = "12px";
    let previewTimer;
    const refreshPreview = async () => {
      try {
        const shape = await ctx.invoke(
          "preview",
          [seedInput.value]
        );
        preview.textContent = t.shapePreview(shape.planetCount, shape.maxMoons, shape.minPlanets, shape.maxPlanets);
      } catch {
        preview.textContent = "";
      }
    };
    const refreshHint = () => {
      const raw = seedInput.value.trim();
      hint.textContent = !raw ? t.hint : /^\d{1,15}$/.test(raw) ? t.hintNumber : t.hintText;
      if (previewTimer !== void 0) window.clearTimeout(previewTimer);
      previewTimer = window.setTimeout(() => void refreshPreview(), 180);
    };
    seedInput.addEventListener("input", refreshHint);
    const createButton = ctx.ui.button(t.create, { variant: "primary", size: "md", onClick: () => void create() });
    form.append(
      field(ctx.ui, t.seed, seedInput, t.seedHint),
      field(ctx.ui, t.star, starRow, "0.15 \u2026 2.0 \u592A\u9633\u8D28\u91CF"),
      field(ctx.ui, t.starName, starNameInput, "\u5F00\u5C40\u5B9A\uFF0C\u4E4B\u540E\u4E00\u76F4\u6CBF\u7528"),
      field(ctx.ui, t.homeName, homeNameInput, "\u6700\u5B9C\u5C45\u7684\u90A3\u9897\u884C\u661F\uFF0C\u4E4B\u540E\u4E00\u76F4\u6CBF\u7528"),
      createButton,
      hint,
      preview
    );
    const lockedBox = ctx.ui.h("div");
    lockedBox.style.display = "grid";
    lockedBox.style.gap = "10px";
    const badge = ctx.ui.pill(t.locked, "on");
    const clockBox = ctx.ui.h("div", "muted");
    clockBox.style.fontSize = "13px";
    clockBox.style.lineHeight = "1.6";
    clockBox.hidden = true;
    const waitRow = ctx.ui.h("div");
    waitRow.style.display = "flex";
    waitRow.style.flexWrap = "wrap";
    waitRow.style.gap = "6px";
    waitRow.style.marginTop = "4px";
    for (const [label, until] of [
      [t.waitDawn, "dawn"],
      [t.waitDusk, "dusk"],
      [t.waitNoon, "noon"],
      [t.waitRipe, "ripe"],
      [t.waitBuilt, "built"],
      [t.waitArrive, "arrive"]
    ]) {
      waitRow.append(
        ctx.ui.button(label, {
          size: "sm",
          onClick: () => {
            void (async () => {
              try {
                const result = await ctx.invoke("wait", [{ until }]);
                state = result.state;
                waitNote.textContent = result.text;
                render();
                void ctx.refresh();
              } catch (error) {
                ctx.ui.toast(errorText(error), "bad");
              }
            })();
          }
        })
      );
    }
    const waitNote = ctx.ui.h("div", "muted");
    waitNote.style.fontSize = "12px";
    waitRow.append(waitNote);
    const cardPre = ctx.ui.h("pre");
    cardPre.style.whiteSpace = "pre-wrap";
    cardPre.style.fontSize = "13px";
    cardPre.style.lineHeight = "1.55";
    const resetButton = ctx.ui.button(t.reset, { variant: "danger", size: "sm", onClick: () => void reset() });
    const powerBox = ctx.ui.h("div");
    powerBox.style.display = "grid";
    powerBox.style.gap = "6px";
    const energyLine = ctx.ui.h("div", "mono");
    const shipLineEl = ctx.ui.h("div", "mono");
    shipLineEl.style.fontSize = "12px";
    const genButton = ctx.ui.button(t.generator, { size: "sm", variant: "primary", onClick: () => void press() });
    const genHint = ctx.ui.h("div", "muted", t.generatorHint);
    genHint.style.fontSize = "12px";
    const gridLineEl = ctx.ui.h("div", "muted");
    gridLineEl.style.fontSize = "12px";
    const gridRow = ctx.ui.h("div");
    gridRow.style.display = "flex";
    gridRow.style.gap = "6px";
    const gridInButton = ctx.ui.button(t.gridIn, { size: "sm", onClick: () => void gridMove("grid_in") });
    const gridOutButton = ctx.ui.button(t.gridOut, { size: "sm", onClick: () => void gridMove("grid_out") });
    gridRow.append(gridInButton, gridOutButton);
    powerBox.append(ctx.ui.h("h3", void 0, t.powerTitle), energyLine, shipLineEl, genButton, genHint, gridLineEl, gridRow);
    const monitorBox = ctx.ui.h("div");
    monitorBox.style.display = "grid";
    monitorBox.style.gap = "6px";
    const monitorLine = ctx.ui.h("div", "muted");
    const monitorButton = ctx.ui.button(t.monitorInstall, { size: "sm", onClick: () => void installMonitor() });
    monitorBox.append(ctx.ui.h("h3", void 0, t.monitorTitle), monitorLine, monitorButton);
    const floraBox = ctx.ui.h("div");
    floraBox.style.display = "grid";
    floraBox.style.gap = "6px";
    const floraLine = ctx.ui.h("div", "muted");
    floraLine.style.fontSize = "12px";
    const floraMsg = ctx.ui.h("pre", "mono");
    floraMsg.hidden = true;
    floraMsg.style.whiteSpace = "pre-wrap";
    const floraSites = ctx.ui.h("div");
    floraSites.style.display = "grid";
    floraSites.style.gap = "4px";
    const floraInv = ctx.ui.h("div", "muted");
    floraInv.style.fontSize = "12px";
    const floraBags = ctx.ui.h("div");
    floraBags.style.display = "grid";
    floraBags.style.gap = "4px";
    const siteButton = ctx.ui.button(t.floraSite, { size: "sm", onClick: () => void floraDo("site", []) });
    const floraTrade = ctx.ui.h("div");
    floraTrade.style.display = "flex";
    floraTrade.style.gap = "6px";
    floraTrade.style.flexWrap = "wrap";
    floraBox.append(
      ctx.ui.h("h3", void 0, t.floraTitle),
      floraLine,
      siteButton,
      floraTrade,
      floraSites,
      floraMsg,
      floraInv,
      floraBags
    );
    const mapBox = ctx.ui.h("div");
    mapBox.style.display = "grid";
    mapBox.style.gap = "8px";
    const mapHead = ctx.ui.h("h3", void 0, t.mapTitle);
    const mapDesc = ctx.ui.h("p", "muted", t.mapDesc);
    mapDesc.style.fontSize = "12px";
    const pickRow = ctx.ui.h("div");
    pickRow.style.display = "grid";
    pickRow.style.gap = "4px";
    const pick = ctx.ui.select({ options: [] });
    const canvas = ctx.ui.h("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.width = "100%";
    canvas.style.height = "auto";
    canvas.style.imageRendering = "auto";
    const readout = ctx.ui.h("div", "muted");
    readout.style.fontSize = "12px";
    const oceanLine = ctx.ui.h("div", "muted");
    oceanLine.style.fontSize = "12px";
    pickRow.append(ctx.ui.h("label", "muted", t.mapPick), pick);
    const chartRow = ctx.ui.h("div");
    chartRow.style.display = "flex";
    chartRow.style.gap = "6px";
    chartRow.style.flexWrap = "wrap";
    chartRow.hidden = true;
    mapBox.append(mapHead, mapDesc, pickRow, chartRow, canvas, readout, oceanLine);
    const planBox = ctx.ui.h("div");
    planBox.style.display = "grid";
    planBox.style.gap = "8px";
    const travelRow = ctx.ui.h("div");
    travelRow.style.display = "flex";
    travelRow.style.gap = "6px";
    travelRow.style.alignItems = "center";
    travelRow.style.flexWrap = "wrap";
    const latInput = ctx.ui.input({ type: "number", value: "0" });
    latInput.step = "0.1";
    latInput.style.width = "88px";
    const lonInput = ctx.ui.input({ type: "number", value: "0" });
    lonInput.step = "0.1";
    lonInput.style.width = "88px";
    const goButton = ctx.ui.button(t.travelGo, { size: "sm", variant: "primary", onClick: () => void travel() });
    travelRow.append(
      ctx.ui.h("span", "muted", t.travelTitle),
      ctx.ui.h("span", "muted", "\u7EAC\u5EA6"),
      latInput,
      ctx.ui.h("span", "muted", "\u7ECF\u5EA6"),
      lonInput,
      goButton
    );
    const travelHintEl = ctx.ui.h("div", "muted", t.travelHint);
    travelHintEl.style.fontSize = "12px";
    const lookRow = ctx.ui.h("div");
    lookRow.style.display = "flex";
    lookRow.style.gap = "6px";
    lookRow.style.alignItems = "center";
    const lookButton = ctx.ui.button(t.lookHere, { size: "sm", onClick: () => void lookAroundPanel() });
    const veinsButton = ctx.ui.button(t.veinsHere, { size: "sm", onClick: () => void veinsScan() });
    const surveyButton = ctx.ui.button(t.surveyHere, { size: "sm", onClick: () => void surveyGround() });
    lookRow.append(lookButton, veinsButton, surveyButton, ctx.ui.h("span", "muted", t.lookHint));
    const lookPre = ctx.ui.h("pre");
    lookPre.style.whiteSpace = "pre-wrap";
    lookPre.style.fontSize = "12px";
    lookPre.style.margin = "0";
    lookPre.hidden = true;
    const buildRow = ctx.ui.h("div");
    buildRow.style.display = "flex";
    buildRow.style.gap = "6px";
    buildRow.style.alignItems = "center";
    buildRow.style.flexWrap = "wrap";
    const buildSelect = ctx.ui.select({
      options: [
        { value: "greenhouse", label: "\u6E29\u5BA4\u6838\u5FC3" },
        { value: "cooler", label: "\u5236\u51B7\u6838\u5FC3" },
        { value: "heater", label: "\u5236\u70ED\u6838\u5FC3" },
        { value: "realism", label: "\u62DF\u771F\u6838\u5FC3" },
        { value: "pump", label: "\u6C34\u6CF5" },
        { value: "warehouse", label: "\u4ED3\u5E93" },
        { value: "drone_cluster", label: "\u65E0\u4EBA\u673A\u96C6\u7FA4" },
        { value: "rocket", label: "\u8FD0\u8F7D\u706B\u7BAD" },
        { value: "biome_changer", label: "\u7FA4\u7CFB\u6539\u53D8\u5668" },
        { value: "miner", label: "\u91C7\u77FF\u673A" },
        { value: "rectifier", label: "\u6574\u6D41\u7535\u5854" },
        { value: "terminal", label: "\u4EA4\u6613\u7EC8\u7AEF" },
        { value: "storage_terminal", label: "\u4ED3\u50A8\u7EC8\u7AEF" },
        { value: "arm", label: "\u673A\u68B0\u81C2" },
        { value: "duty", label: "\u503C\u73ED\u7EC8\u7AEF" },
        { value: "sail", label: "\u592A\u9633\u80FD\u5E06" },
        { value: "counter", label: "\u51CC\u65E5\u8BA1\u6570\u5668" },
        { value: "kiln", label: "\u70AD\u5316\u7089" },
        { value: "purifier", label: "\u51C0\u5316\u5668" },
        { value: "sealer", label: "\u5C01\u88C5\u5668" },
        { value: "atmo_extractor", label: "\u5927\u6C14\u63D0\u53D6\u5668" },
        { value: "habitat", label: "\u5C45\u6240" },
        { value: "mutation_room", label: "\u8F90\u5C04\u8BF1\u53D8\u5BA4" },
        { value: "cold_store", label: "\u51B7\u5E93" },
        { value: "inert_room", label: "\u60F0\u6027\u6C14\u4F53\u5BA4" },
        { value: "planter", label: "\u79CD\u690D\u76C6" },
        { value: "carrier", label: "\u7A7A\u5929\u6BCD\u8230" },
        { value: "wind", label: "\u98CE\u529B\u53D1\u7535\u7AD9" },
        { value: "fire", label: "\u706B\u529B\u53D1\u7535\u7AD9" },
        { value: "converter", label: "\u6C14\u6DB2\u8F6C\u6362\u673A" }
      ]
    });
    const buildButton = ctx.ui.button(t.buildHere, { size: "sm", variant: "primary", onClick: () => void buildHere() });
    const siteButton2 = ctx.ui.button(t.buildSite, { size: "sm", onClick: () => void floraDo("site", []) });
    buildRow.append(buildSelect, buildButton, siteButton2);
    const buildLine = ctx.ui.h("div", "muted");
    buildLine.style.fontSize = "12px";
    const detailBox = ctx.ui.h("div", "card");
    detailBox.style.display = "grid";
    detailBox.style.gap = "4px";
    detailBox.hidden = true;
    const detailHead = ctx.ui.h("div", "mono");
    const detailBody = ctx.ui.h("div", "muted");
    detailBody.style.fontSize = "12px";
    detailBody.style.whiteSpace = "pre-wrap";
    const detailActions = ctx.ui.h("div");
    detailActions.style.display = "flex";
    detailActions.style.gap = "6px";
    detailBox.append(detailHead, detailBody, detailActions);
    planBox.append(travelRow, travelHintEl, lookRow, lookPre, ctx.ui.h("h3", void 0, t.buildTitle), buildRow, buildLine, detailBox);
    const storeBox = ctx.ui.h("div");
    storeBox.style.display = "grid";
    storeBox.style.gap = "6px";
    const storeList = ctx.ui.h("pre", "mono");
    storeList.style.fontSize = "12px";
    storeList.style.whiteSpace = "pre-wrap";
    storeList.style.margin = "0";
    const storeRows = ctx.ui.h("div");
    storeRows.style.display = "grid";
    storeRows.style.gap = "4px";
    storeBox.append(
      ctx.ui.h("h3", void 0, t.storeTitle),
      ctx.ui.button(t.storeRefresh, { size: "sm", onClick: () => void refreshStore() }),
      storeList,
      storeRows
    );
    lockedBox.append(badge, clockBox, waitRow, powerBox, monitorBox, floraBox, storeBox, cardPre, mapBox, planBox, resetButton);
    const status = ctx.ui.msgline(t.loading);
    box.append(form, lockedBox, status);
    let seeded = false;
    let map = null;
    let mapKey = null;
    let selectedId = null;
    let cooldownMs = 0;
    const paint = () => {
      if (!map) return;
      drawMap(canvas, map);
      const context = canvas.getContext("2d");
      if (!context || mapKey === null || state?.location?.bodyKey !== mapKey) return;
      for (const site of state?.flora?.sites ?? []) {
        const p = { x: xPx(site.lonDeg, WIDTH), y: yPx(site.latDeg, HEIGHT) };
        context.strokeStyle = "#ffffff";
        context.lineWidth = 1.5;
        context.strokeRect(p.x - 4, p.y - 4, 8, 8);
      }
      for (const structure of state?.structures ?? []) {
        const p = { x: xPx(structure.lonDeg, WIDTH), y: yPx(structure.latDeg, HEIGHT) };
        context.fillStyle = structure.id === selectedId ? "#ffd166" : "#ffffff";
        context.strokeStyle = "#1a1a1a";
        context.lineWidth = 1.5;
        if (structure.kind === "arm") {
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
    const renderPlan = () => {
      planBox.hidden = !(state?.locked ?? false);
      if (!state?.locked) return;
      const builds = state.builds ?? [];
      buildLine.textContent = `${t.buildSlots} ${builds.length}/${state.buildSlots ?? 1}` + (builds.length === 0 ? ` \xB7 ${t.buildNone}` : "\uFF1A" + builds.map((b) => `${b.label}\uFF08${b.siteKey}\uFF09\u8FD8\u5269 ${b.leftHomeHours.toFixed(1)} \u6BCD\u661F\u65F6`).join("\uFF1B")) + (state.buildQueueFull ? ` \xB7 ${t.buildFull}` : "");
      const chosen = (state.structures ?? []).find((s) => s.id === selectedId) ?? null;
      detailBox.hidden = chosen === null;
      if (!chosen) return;
      detailHead.textContent = `${t.detailTitle}\uFF1A${chosen.label}\uFF08${chosen.id}\uFF09 \xB7 ${chosen.siteKey}`;
      const contents = chosen.contents.length === 0 ? t.detailEmpty : chosen.contents.map((c) => `${c.name} ${c.kg} kg`).join("\u3001");
      detailBody.textContent = `${t.detailContents}\uFF1A${contents}
${Math.round(chosen.usedKg * 100) / 100} / ${chosen.capKg} kg` + (chosen.armText ? `
${t.armLine}\uFF1A${chosen.armText}` : "") + (chosen.dutyText ? `
${t.dutyLine}\uFF1A${chosen.dutyText}` : "") + (chosen.interiorC !== void 0 ? `
${t.habitatLine}\uFF1A${chosen.interiorC}\u2103\uFF08${chosen.comfort === "ok" ? t.comfortOk : chosen.comfort === "hot" ? t.comfortHot : t.comfortCold}\uFF09` : "") + (chosen.armCycle ? `
${t.armCycle}` : "");
      detailActions.replaceChildren(
        ctx.ui.button(t.detailNear, { size: "sm", onClick: () => void travel(chosen.latDeg + 0.2, chosen.lonDeg + 0.2) }),
        ctx.ui.button(t.detailDemolish, { size: "sm", variant: "danger", onClick: () => void demolish(chosen.id) }),
        ctx.ui.button(t.detailClose, { size: "sm", onClick: () => {
          selectedId = null;
          paint();
          renderPlan();
        } })
      );
    };
    async function goTo(key) {
      if (busy) return;
      busy = true;
      try {
        state = await ctx.invoke("move", [{ target: key }]);
        render();
        void ctx.refresh();
      } catch (error) {
        fail(error);
      } finally {
        busy = false;
      }
    }
    async function travel(latDeg = Number(latInput.value), lonDeg = Number(lonInput.value)) {
      if (busy) return;
      busy = true;
      try {
        state = await ctx.invoke("move", [{ latDeg, lonDeg }]);
        render();
        void ctx.refresh();
      } catch (error) {
        fail(error);
      } finally {
        busy = false;
      }
    }
    async function lookAroundPanel() {
      if (busy) return;
      busy = true;
      try {
        const result = await ctx.invoke("look", []);
        lookPre.textContent = result.text;
        lookPre.hidden = false;
      } catch (error) {
        fail(error);
      } finally {
        busy = false;
      }
    }
    async function surveyGround() {
      if (busy) return;
      busy = true;
      try {
        const result = await ctx.invoke("survey", []);
        state = result.state;
        lookPre.textContent = result.text;
        lookPre.hidden = false;
        render();
        void ctx.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        ctx.ui.toast(/已经测过|只认第一次/.test(message) ? t.surveyDone : message, "bad");
      } finally {
        busy = false;
      }
    }
    async function veinsScan() {
      if (busy) return;
      busy = true;
      try {
        const result = await ctx.invoke("veins", []);
        lookPre.textContent = result.text;
        lookPre.hidden = false;
      } catch (error) {
        fail(error);
      } finally {
        busy = false;
      }
    }
    async function buildHere() {
      if (busy) return;
      busy = true;
      try {
        const kind = buildSelect.value;
        if (kind === "sail" || kind === "counter") {
          const result = await ctx.invoke("install", [{ id: kind }]);
          state = result.state;
          ctx.ui.toast(result.text, "ok");
        } else if (kind === "cooler" || kind === "heater" || kind === "realism") {
          const result = await ctx.invoke("install", [{ id: kind }]);
          state = result.state;
          ctx.ui.toast(result.text, "ok");
        } else {
          state = await ctx.invoke("build", [{ kind }]);
        }
        render();
        void ctx.refresh();
      } catch (error) {
        fail(error);
      } finally {
        busy = false;
      }
    }
    async function demolish(id) {
      if (busy) return;
      busy = true;
      try {
        state = await ctx.invoke("demolish", [id]);
        selectedId = null;
        render();
        void ctx.refresh();
      } catch (error) {
        fail(error);
      } finally {
        busy = false;
      }
    }
    const renderPower = () => {
      const power = state?.power ?? null;
      powerBox.hidden = power === null;
      if (!power) return;
      const kj = power.generatorKj ?? 5;
      const cap = power.capacityKj ?? 1e5;
      energyLine.textContent = `${t.energy}\uFF1A${power.energyKj.toLocaleString("en-US")} / ${cap.toLocaleString("en-US")} kJ \xB7 ${t.tungsten}\uFF1A${(power.tungsten ?? 0).toLocaleString("en-US")} kg \xB7 ${power.sails} ${"\u53F0\u592A\u9633\u80FD\u5E06"}`;
      const ship = power.ship;
      shipLineEl.hidden = !ship || (ship.sleepers ?? 0) <= 0;
      if (ship) {
        shipLineEl.textContent = t.shipLine(
          ship.food,
          ship.water,
          ship.oxygen,
          ship.sleepers,
          ship.hoursLeft ?? 0
        );
      }
      genButton.disabled = cooldownMs > 0;
      genButton.textContent = cooldownMs > 0 ? `${t.generatorBusy} ${(cooldownMs / 1e3).toFixed(1)}s` : t.generator.replace("{kj}", String(kj));
      genHint.textContent = t.generatorHint.replace("{kj}", String(kj));
      const grid = power.grid;
      gridLineEl.textContent = grid ? grid.hasTower ? `${t.gridStored} ${grid.storedKj.toLocaleString("en-US")} / ${grid.capacityKj.toLocaleString("en-US")} kJ` + (grid.reachable ? `\uFF08${t.gridReach} ${grid.distanceKm} km\uFF09` : `\uFF08${t.gridFar} ${grid.distanceKm} km \xB7 ${t.gridTowerAt} ${grid.towerSite ?? ""}\uFF09`) : `${t.gridNoTower}` : "";
      const canTap = grid !== null && grid.hasTower && grid.reachable;
      gridInButton.disabled = !canTap || grid.storedKj <= 0;
      gridOutButton.disabled = !canTap || power.energyKj <= 0;
      gridRow.hidden = !grid || !grid.hasTower;
    };
    const renderMonitor = () => {
      const monitor = state?.monitor ?? null;
      monitorBox.hidden = monitor === null;
      if (!monitor) return;
      const n = monitor.monitored.length;
      monitorLine.textContent = n === 0 ? t.monitorNone : `${t.monitorCount} ${n} \u4E2A\u5929\u4F53${monitor.starUnlocked ? ` ${t.monitorStar}` : ""}`;
      monitorButton.hidden = monitor.currentKey === null || monitor.currentMonitored;
    };
    const renderFlora = () => {
      const flora = state?.flora ?? null;
      floraBox.hidden = flora === null;
      if (!flora) return;
      floraLine.textContent = `${flora.credits} \u4FE1\u7528\u70B9\uFF08${flora.tier}\uFF09 \xB7 ${Math.floor(flora.energyKj).toLocaleString("en-US")} kJ \xB7 ` + (flora.shopWindow || (flora.shopOpen ? t.floraShop : t.floraClosed));
      floraSites.replaceChildren();
      if (flora.sites.length === 0) {
        floraSites.append(ctx.ui.h("div", "muted", t.floraNone));
      }
      for (const site of flora.sites) {
        const row = ctx.ui.h("div");
        row.style.display = "flex";
        row.style.gap = "8px";
        row.style.alignItems = "center";
        row.append(
          ctx.ui.h(
            "span",
            "mono",
            `${site.key} \xB7 ${site.kind} \xB7 ${t.floraWet} ${site.wetness == null ? "\u2014" : `${Math.round(site.wetness * 100)}%`} \xB7 ${t.floraFert} ${site.fertility == null ? "\u2014" : `${Math.round(site.fertility * 100)}%`} \xB7 ${site.plants} \u682A/\u7FA4`
          )
        );
        if (site.ripe > 0) {
          row.append(
            ctx.ui.button(`${t.floraHarvest} ${site.ripe}`, { size: "sm", variant: "primary", onClick: () => void floraDo("harvest", [site.key]) })
          );
        }
        floraSites.append(row);
      }
      for (const planter of flora.planters ?? []) {
        const row = ctx.ui.h("div");
        row.style.display = "flex";
        row.style.gap = "8px";
        row.style.alignItems = "center";
        const stateLine = planter.powered ? t.planterOk : t.planterOff;
        row.append(ctx.ui.h("span", "mono", `${planter.key} \xB7 ${t.planterName} \xB7 ${planter.plants}/3 \xB7 ${stateLine}`));
        if (planter.ripe > 0) {
          row.append(
            ctx.ui.button(`${t.floraHarvest} ${planter.ripe}`, { size: "sm", variant: "primary", onClick: () => void floraDo("harvest", [planter.key]) })
          );
        }
        const bag = flora.bags[0];
        if (bag) {
          row.append(
            ctx.ui.button(`${t.floraPlant} ${bag.name}`, { size: "sm", onClick: () => void floraDo("plant", [bag.id, planter.key]) })
          );
        }
        floraSites.append(row);
      }
      for (const crop of flora.crops ?? []) {
        const row = ctx.ui.h("div");
        row.style.display = "flex";
        row.style.gap = "8px";
        row.style.alignItems = "center";
        row.append(
          ctx.ui.h("span", "mono", `${crop.site} \xB7 ${crop.name} \xB7 ${Math.round(crop.progress * 100)}%${crop.ripe ? " \xB7 \u7ED3\u5B9E" : ""}${crop.dead ? " \xB7 \u67AF\u6B7B" : ""}`)
        );
        if (crop.dead) {
          row.append(
            ctx.ui.button(t.floraRemove, {
              size: "sm",
              onClick: () => void floraDo("remove", [crop.id, crop.site])
            })
          );
        } else {
          row.append(
            ctx.ui.button(t.floraInspect, {
              size: "sm",
              onClick: () => void inspectCrop(crop.id, crop.site)
            }),
            ctx.ui.button(t.floraBreed, {
              size: "sm",
              onClick: () => void floraDo("breed", [crop.id, crop.site])
            }),
            ctx.ui.button(t.floraTransplant, {
              size: "sm",
              onClick: () => void floraDo("transplant", [crop.id, crop.site])
            })
          );
        }
        floraSites.append(row);
      }
      floraInv.replaceChildren();
      floraInv.textContent = flora.inventory.length === 0 ? `${t.floraInventory}\uFF1A${t.floraEmpty}` : `${t.floraInventory}\uFF1A` + flora.inventory.map((item) => `${item.name} ${item.amount}`).join("\u3001");
      for (const item of flora.inventory) {
        const sellButton = ctx.ui.button(`\u5356 1 ${item.name}`, { size: "sm", onClick: () => void floraDo("sell", [item.id, 1]) });
        floraInv.append(sellButton);
      }
      floraTrade.replaceChildren();
      floraTrade.hidden = !flora.shopOpen;
      if (flora.shopOpen) {
        for (const order of state?.orders ?? []) {
          floraTrade.append(
            ctx.ui.button(`${t.lifeOrder}\uFF1A${order.species} \xB7 ${order.gene} \u2265 ${order.min} \xB7 ${order.kg}kg \u2192 ${order.reward}`, {
              size: "sm",
              onClick: () => void lifeDo("order", [order.id])
            })
          );
        }
        floraTrade.append(
          ctx.ui.button(t.lifeCylinder, { size: "sm", onClick: () => void lifeDo("cylinder", [10]) })
        );
        floraTrade.append(
          ctx.ui.button(t.buyChart, { size: "sm", variant: "primary", onClick: () => void lifeDo("chart", []) })
        );
      }
      floraBags.replaceChildren();
      for (const bag of flora.bags) {
        const row = ctx.ui.h("div");
        row.style.display = "flex";
        row.style.gap = "8px";
        row.style.alignItems = "center";
        row.append(
          ctx.ui.h("span", "mono", `${bag.id} \xB7 ${bag.name} \xD7${bag.count}${bag.premium ? " \xB7 \u9AD8\u7EA7" : ""}`),
          ctx.ui.button(t.floraPlant, { size: "sm", onClick: () => void floraDo("plant", [bag.id]) })
        );
        floraBags.append(row);
      }
      for (const gh of state?.greenhouses ?? []) {
        const row = ctx.ui.h("div");
        row.style.display = "flex";
        row.style.gap = "8px";
        row.style.alignItems = "center";
        const label = ctx.ui.h("span", "mono", `\u6E29\u5BA4 ${gh.siteKey}`);
        const value = ctx.ui.h("span", "mono", gh.targetC === null ? `\u81EA\u52A8\uFF08\u5BA4\u5916 ${gh.ambientC ?? "\u2014"}\u2103\uFF09` : `${gh.targetC}\u2103\uFF08\u6E29\u5DEE ${gh.deltaC}\u2103\uFF0C\u62DF\u771F \xD7${gh.realismCores}\uFF09`);
        const slider = ctx.ui.h("input");
        slider.type = "range";
        slider.min = "-60";
        slider.max = "80";
        slider.step = "1";
        slider.value = String(gh.targetC ?? gh.ambientC ?? 20);
        slider.style.width = "160px";
        slider.addEventListener("change", () => {
          const tempC = Number(slider.value);
          void lifeDo("install", [{ id: "setpoint", site: gh.siteKey, tempC }]);
        });
        const auto = ctx.ui.button("\u81EA\u52A8", {
          size: "sm",
          onClick: () => void lifeDo("install", [{ id: "setpoint", site: gh.siteKey }])
        });
        const realism = ctx.ui.button("\u62DF\u771F\u6838\u5FC3", {
          size: "sm",
          onClick: () => void lifeDo("install", [{ id: "realism", site: gh.siteKey }])
        });
        row.append(label, slider, value, auto, realism);
        floraBags.append(row);
      }
    };
    async function lifeDo(method, args) {
      if (busy) return;
      busy = true;
      try {
        const result = await ctx.invoke(method, args);
        if (result?.state) state = result.state;
        if (result?.text) ctx.ui.toast(result.text, "ok");
        render();
        void ctx.refresh();
      } catch (error) {
        fail(error);
      } finally {
        busy = false;
      }
    }
    async function floraDo(method, args) {
      if (busy) return;
      busy = true;
      try {
        const result = await ctx.invoke(method, args);
        if (result && typeof result === "object" && "locked" in result && "power" in result) {
          state = result;
          render();
          void ctx.refresh();
        } else if (result && typeof result === "object" && "text" in result) {
          floraMsg.hidden = false;
          floraMsg.textContent = String(result.text);
        }
      } catch (error) {
        fail(error);
      } finally {
        busy = false;
      }
    }
    async function inspectCrop(id, site) {
      if (busy) return;
      busy = true;
      try {
        const result = await ctx.invoke("inspect", [id, site]);
        floraMsg.hidden = false;
        floraMsg.textContent = result.text;
      } catch (error) {
        fail(error);
      } finally {
        busy = false;
      }
    }
    async function refreshStore() {
      if (!(state?.locked ?? false)) {
        storeBox.hidden = true;
        return;
      }
      storeBox.hidden = false;
      try {
        const view = await ctx.invoke("store");
        storeList.textContent = view.list;
        storeRows.replaceChildren();
        for (const c of view.containers) {
          const row = ctx.ui.h("div");
          row.style.display = "flex";
          row.style.gap = "6px";
          row.style.flexWrap = "wrap";
          row.style.alignItems = "center";
          const first = c.contents[0]?.resource ?? "biomass";
          const bufferNote = c.kind === "terminal" ? ctx.ui.h(
            "span",
            "muted",
            `${t.terminalBuffer} ${c.usedKg}/${c.capKg} kg \xB7 ${c.bags ?? 0}/20 ${c.usedKg >= c.capKg ? `\u2014 ${t.terminalFull}` : ""}`
          ) : null;
          const depositBtn = ctx.ui.button(`${t.storeDeposit} ${first}`, {
            size: "sm",
            onClick: () => void storeDo("deposit", c.id, first, 10)
          });
          if (c.kind === "terminal") {
            depositBtn.disabled = true;
            depositBtn.title = t.terminalFull;
          }
          row.append(
            ctx.ui.h("span", "mono", `${c.id} \xB7 ${c.where} \xB7 ${c.usedKg}/${c.capKg} kg`),
            ...bufferNote ? [bufferNote] : [],
            ...c.routesText ? [ctx.ui.h("span", "muted", c.routesText.split("\n").join(" \xB7 "))] : [],
            depositBtn,
            ctx.ui.button(`${t.storeWithdraw} ${first}`, { size: "sm", onClick: () => void storeDo("withdraw", c.id, first, 10) }),
            ctx.ui.button(t.storeDemolish, { size: "sm", onClick: () => void storeDo("demolish", c.id, "", 0) }),
            ...c.kind === "terminal" ? [ctx.ui.button(t.terminalTake, { size: "sm", onClick: () => void storeDo("take", c.id, "", 0) })] : []
          );
          storeRows.append(row);
        }
      } catch (error) {
        fail(error);
      }
    }
    async function storeDo(action, building, resource, kg) {
      if (busy) return;
      busy = true;
      try {
        const view = await ctx.invoke("storeDo", [action, building, resource, kg]);
        storeList.textContent = view.list;
        await refreshStore();
        void ctx.refresh();
      } catch (error) {
        fail(error);
      } finally {
        busy = false;
      }
    }
    const render = () => {
      const locked = state?.locked ?? false;
      form.hidden = locked;
      lockedBox.hidden = !locked;
      cardPre.textContent = state?.card ?? "";
      const clock = state?.game ?? null;
      clockBox.hidden = clock === null;
      clockBox.textContent = clock ? [
        `\u6B64\u523B\uFF1A${clock.time}`,
        clock.where ? `\u4F60\u5728\uFF1A${clock.where}` : "",
        clock.transit ?? "\u6CA1\u6709\u5728\u79FB\u52A8",
        clock.calendar
      ].filter((line) => line !== "").join("\n") : "";
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
    ctx.interval(() => {
      if (cooldownMs <= 0) return;
      cooldownMs = Math.max(0, cooldownMs - 200);
      renderPower();
    }, 200);
    const rebuildPicker = () => {
      const bodies = state?.bodies ?? [];
      pick.replaceChildren();
      for (const body of bodies) {
        const option = document.createElement("option");
        option.value = body.key;
        option.textContent = body.label;
        pick.append(option);
      }
      pick.hidden = bodies.length === 0;
      const charted = bodies.filter((body) => body.charted && body.key !== state?.monitor?.currentKey);
      chartRow.replaceChildren();
      chartRow.hidden = charted.length === 0;
      for (const body of charted) {
        chartRow.append(
          ctx.ui.button(`${t.goHere}\uFF1A${body.label}`, {
            size: "sm",
            variant: "primary",
            onClick: () => void goTo(body.key)
          })
        );
      }
      canvas.hidden = bodies.length === 0;
      if (bodies.length === 0) {
        readout.textContent = t.mapNoBody;
        oceanLine.textContent = "";
      }
    };
    const showMap = (next) => {
      map = next;
      paint();
      if (next.kind === "terrestrial") {
        oceanLine.textContent = `${t.mapOcean} ${Math.round(next.oceanFraction * 100)}% \xB7 \u6D77\u62D4 ${next.minElevationM} \u2026 ${next.maxElevationM} m`;
      } else if (next.kind === "isobaric") {
        oceanLine.textContent = `${t.mapWind} ${next.minWindMps} \u2026 ${next.maxWindMps} m/s \xB7 \u5747\u6E29 ${next.meanTempC} \u2103`;
      } else {
        oceanLine.textContent = `${t.mapMoon} \xB7 \u5747\u6E29 ${next.meanTempC} \u2103`;
      }
      readout.textContent = "";
    };
    async function loadMap(key) {
      readout.textContent = t.mapLoading;
      mapKey = key;
      try {
        showMap(await ctx.invoke("map", [key]));
      } catch (error) {
        readout.textContent = error instanceof Error ? error.message : String(error);
      }
    }
    pick.addEventListener("change", () => {
      if (pick.value) void loadMap(pick.value);
    });
    const describeCell = (x, y) => {
      if (!map) return "";
      const lat = pxToLatDeg(y, HEIGHT);
      const lon = pxToLonDeg(x, WIDTH);
      const { grid } = map;
      const latIndex = clamp(Math.floor((lat + 90) / (180 / grid.lat)), 0, grid.lat - 1);
      const lonIndex = clamp(Math.floor((lon + 180) / (360 / grid.lon)), 0, grid.lon - 1);
      const biome = map.biome[latIndex][lonIndex];
      const biomeLabel = BIOME_LABELS[biome] ?? String(biome);
      const base = `\u7EAC\u5EA6 ${lat.toFixed(1)}\xB0 \xB7 \u7ECF\u5EA6 ${lon.toFixed(1)}\xB0 \xB7 ${biomeLabel}`;
      if (map.kind !== "terrestrial") return base;
      const elevation = map.elevationM[latIndex][lonIndex];
      return `${base} \xB7 \u6D77\u62D4 ${elevation} m`;
    };
    canvas.addEventListener("mousemove", (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width * WIDTH;
      const y = (event.clientY - rect.top) / rect.height * HEIGHT;
      readout.textContent = describeCell(x, y);
    });
    canvas.addEventListener("click", (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width * WIDTH;
      const y = (event.clientY - rect.top) / rect.height * HEIGHT;
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
    canvas.addEventListener("mouseleave", () => {
      if (map) readout.textContent = "";
    });
    const fail = (error) => {
      const message = error instanceof Error ? error.message : String(error);
      status.textContent = message;
      status.classList.add("bad");
      ctx.ui.toast(message, "bad");
    };
    async function create() {
      if (busy) return;
      busy = true;
      const stop = ctx.ui.disable(createButton);
      try {
        state = await ctx.invoke("create", [
          {
            seed: normalizeSeedInput(seedInput.value),
            starMass: Number(starInput.value),
            starName: starNameInput.value,
            homeName: homeNameInput.value
          }
        ]);
        status.textContent = "";
        status.classList.remove("bad");
        ctx.ui.toast(t.created, "ok");
        void ctx.refresh();
      } catch (error) {
        fail(error);
      } finally {
        stop.dispose();
        busy = false;
        render();
      }
    }
    async function reset() {
      if (busy) return;
      if (!await ctx.ui.confirm({ title: t.resetTitle, body: t.resetBody, danger: true })) return;
      busy = true;
      const stop = ctx.ui.disable(resetButton);
      try {
        state = await ctx.invoke("reset", ["DELETE"]);
        map = null;
        status.textContent = "";
        status.classList.remove("bad");
        void ctx.refresh();
      } catch (error) {
        fail(error);
      } finally {
        stop.dispose();
        busy = false;
        render();
      }
    }
    async function press() {
      if (busy) return;
      busy = true;
      const stop = ctx.ui.disable(genButton);
      try {
        state = await ctx.invoke("press");
        cooldownMs = state.power?.generatorCooldownMs ?? 0;
        render();
      } catch (error) {
        fail(error);
      } finally {
        stop.dispose();
        busy = false;
      }
    }
    async function gridMove(direction) {
      if (busy) return;
      busy = true;
      const stop = ctx.ui.disable(gridInButton, gridOutButton);
      try {
        await ctx.invoke("storeDo", [direction]);
        state = await ctx.invoke("state");
        render();
        void ctx.refresh();
      } catch (error) {
        fail(error);
      } finally {
        stop.dispose();
        busy = false;
      }
    }
    async function installMonitor() {
      const key = state?.monitor?.currentKey;
      if (!key || busy) return;
      busy = true;
      const stop = ctx.ui.disable(monitorButton);
      try {
        state = await ctx.invoke("monitor", [key]);
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
      state = await ctx.invoke("state");
      status.textContent = "";
      render();
      rebuildPicker();
      if (pick.value) void loadMap(pick.value);
    } catch (error) {
      fail(error);
    }
  }
};
var upgradePanel = {
  async mount(ctx) {
    const t = text(ctx.language);
    const sheet = ctx.ui.sheet({ title: t.upTitle, desc: t.upDesc });
    const head = ctx.ui.rowbar();
    const energy = ctx.ui.h("span", "grow", "");
    const refresh = ctx.ui.button(t.upRefresh, {
      size: "sm",
      onClick: () => {
        void load();
      }
    });
    head.append(energy, refresh);
    const cards = ctx.ui.h("div");
    sheet.body.append(head, cards);
    ctx.root.append(sheet.el);
    const render = (state) => {
      energy.textContent = state.locked ? t.upLocked : `${t.upEnergy}\uFF1A${state.energyKj.toLocaleString("en-US")} kJ`;
      cards.textContent = "";
      for (const card of state.cards) {
        const box = ctx.ui.h("div", "cardbox");
        box.style.border = "1px solid var(--line, #333)";
        box.style.borderRadius = "8px";
        box.style.padding = "10px";
        box.style.marginTop = "10px";
        const status = card.status === "ready" ? t.upReady : card.status === "repairing" ? t.upRepairing : card.status === "maxed" ? t.upMaxed : t.upBroken;
        const heading = card.level !== void 0 ? `${card.label} \xB7 lv${card.level}${card.maxLevel ? ` / lv${card.maxLevel}` : ""}` : card.label;
        const title = ctx.ui.h("h3", "", `${heading} \xB7 ${status}`);
        title.style.margin = "0 0 6px";
        const flavor = ctx.ui.h("p", "muted", card.flavor);
        flavor.style.margin = "0 0 8px";
        box.append(title, flavor);
        if (card.window) {
          const now = ctx.ui.h("p", "", `${t.upWindow}\uFF1A${card.window}${card.limitFactor ? `\uFF08${t.upLimit} \xD7${card.limitFactor}\uFF09` : ""}`);
          now.style.margin = "0 0 6px";
          box.append(now);
        }
        if (card.status === "repairing") {
          const left = ctx.ui.h("p", "", `${t.upRepairing} \xB7 \u8FD8\u5269 ${card.leftHomeHours.toFixed(1)} \u6BCD\u661F\u65F6`);
          box.append(left);
          cards.append(box);
          continue;
        }
        if (card.status === "maxed") {
          if (card.benefits) box.append(ctx.ui.h("p", "muted", card.benefits));
          cards.append(box);
          continue;
        }
        const need = ctx.ui.h(
          "p",
          "",
          `${t.upNeed} ${card.costKj.toLocaleString("en-US")} kJ + ` + card.materials.map((m) => `${m.name} ${m.needKg} kg\uFF08${m.haveKg} kg\uFF09`).join("\u3001") + ` \xB7 ${card.buildHours} \u6BCD\u661F\u65F6`
        );
        need.style.margin = "0 0 8px";
        box.append(need);
        if (card.benefits) {
          const benefit = ctx.ui.h("p", "muted", `${t.upBenefit}\uFF1A${card.benefits}`);
          benefit.style.margin = "0 0 6px";
          box.append(benefit);
        }
        const button = ctx.ui.button(card.status === "broken" ? t.upRepair : t.upUpgrade, {
          variant: "primary",
          size: "sm",
          onClick: () => {
            void repair(card.id, button);
          }
        });
        if (!card.canRepair) {
          button.disabled = true;
          if (card.blockers.length > 0) {
            box.append(ctx.ui.h("p", "muted", card.blockers.join("\uFF1B")));
          }
        }
        box.append(button);
        cards.append(box);
      }
    };
    const load = async () => {
      try {
        render(await ctx.invoke("state"));
      } catch (error) {
        ctx.ui.toast(errorText(error), "bad");
      }
    };
    const repair = async (id, button) => {
      button.disabled = true;
      try {
        render(await ctx.invoke("repair", [id]));
        ctx.ui.toast(t.upRepairing, "ok");
        void ctx.refresh();
      } catch (error) {
        ctx.ui.toast(errorText(error), "bad");
        button.disabled = false;
      }
    };
    await load();
    ctx.interval(() => {
      void load();
    }, 5e3);
  }
};
var protocolPanel = {
  async mount(ctx) {
    const t = text(ctx.language);
    const sheet = ctx.ui.sheet({ title: t.protoTitle, desc: t.protoDesc });
    const head = ctx.ui.rowbar();
    const progress = ctx.ui.h("span", "grow", "");
    const refresh = ctx.ui.button(t.protoRefresh, {
      size: "sm",
      onClick: () => {
        void load();
      }
    });
    head.append(progress, refresh);
    const body = ctx.ui.h("div");
    const habitatBox = ctx.ui.h("div");
    const wakeButton = ctx.ui.button(t.protoWake, {
      variant: "primary",
      onClick: () => {
        void wake(wakeButton);
      }
    });
    wakeButton.hidden = true;
    wakeButton.style.marginTop = "10px";
    sheet.body.append(head, body, habitatBox, wakeButton);
    ctx.root.append(sheet.el);
    const render = (panel2) => {
      wakeButton.hidden = false;
      progress.textContent = `${t.protoDone} ${panel2.done} / ${panel2.total}`;
      body.textContent = "";
      for (const chapter of panel2.chapters) {
        const heading = ctx.ui.h("h3", "", `${chapter.title} \xB7 ${chapter.done}/${chapter.total}`);
        heading.style.margin = "10px 0 4px";
        body.append(heading);
        for (const task of chapter.tasks) {
          const row = ctx.ui.h("div", "", `${task.done ? "\u2713" : "\u25CB"} ${task.title}${task.done ? "" : ` \xB7 ${task.progress}`}`);
          row.style.padding = "2px 0";
          row.style.color = task.done ? "var(--muted, #8a8a8a)" : "";
          body.append(row);
        }
      }
      habitatBox.textContent = "";
      if (panel2.population) {
        const p = panel2.population;
        habitatBox.append(
          ctx.ui.h("h3", "", t.protoPopulation),
          ctx.ui.h(
            "p",
            "",
            `${p.population} / ${p.capacity} \xB7 ${t.protoSleepers} ${p.sleepers} \xB7 ${t.protoLabor} ${p.laborUnits}` + (p.population < p.capacity ? ` \xB7 ${t.protoBirthProgress} ${Math.floor(p.birthHours)} / 192` : "")
          )
        );
      }
      if (panel2.habitat) {
        const h = panel2.habitat;
        habitatBox.append(
          ctx.ui.h("h3", "", `${t.protoHabitat}`),
          ctx.ui.h(
            "p",
            "",
            `${t.protoAwake} ${h.awake} \xB7 ${t.protoDormant} ${h.dormant} \xB7 ${t.protoFood} ${h.food.toFixed(1)} kg \xB7 ${t.protoWater} ${h.water.toFixed(1)} L \xB7 ${t.protoOxygen} ${h.oxygen.toFixed(1)} kg \xB7 ${t.protoHours} ${Number.isFinite(h.hoursLeft) ? `${Math.floor(h.hoursLeft)} \u6BCD\u661F\u65F6` : "\u2014"}`
          )
        );
      }
      if (panel2.awakened) {
        wakeButton.disabled = true;
        wakeButton.textContent = t.protoAwakened;
      } else {
        wakeButton.disabled = !panel2.ready || !panel2.habitat;
        wakeButton.textContent = panel2.ready ? t.protoWake : `${t.protoWake}\uFF08${t.protoDone} ${panel2.done}/${panel2.total}\uFF09`;
      }
    };
    const load = async () => {
      try {
        render(await ctx.invoke("state"));
      } catch (error) {
        wakeButton.hidden = true;
        progress.textContent = "";
        body.textContent = "";
        habitatBox.textContent = "";
        const message = errorText(error);
        body.append(
          ctx.ui.h("p", "muted", /还没有创世|旧版本/.test(message) ? t.protoLocked : message)
        );
        if (/旧版本/.test(message)) body.append(ctx.ui.h("p", "muted", message));
      }
    };
    const wake = async (button) => {
      button.disabled = true;
      try {
        const panel2 = await ctx.invoke("wake", []);
        render(panel2);
        ctx.ui.toast(t.protoAwakened, "ok");
        void ctx.refresh();
      } catch (error) {
        ctx.ui.toast(errorText(error), "bad");
        button.disabled = false;
      }
    };
    await load();
    ctx.interval(() => {
      void load();
    }, 5e3);
  }
};
var guidePanel = {
  mount(ctx) {
    const t = text(ctx.language);
    const sheet = ctx.ui.sheet({ title: t.guideTitle, desc: t.guideDesc });
    const searchRow = ctx.ui.rowbar();
    const searchInput = ctx.ui.input({ placeholder: t.guideSearchHint });
    searchInput.type = "text";
    const searchButton = ctx.ui.button(t.guideSearch, { size: "sm" });
    searchRow.append(searchInput, searchButton);
    const chips = ctx.ui.h("div", "rows");
    const article = ctx.ui.h("div", "cols");
    const hint = ctx.ui.h("p", "muted", t.guideEmpty);
    chips.append(ctx.ui.h("span", "muted", t.guidePick));
    article.append(hint);
    sheet.body.append(searchRow, chips, article);
    ctx.root.append(sheet.el);
    let current = null;
    let topics = [];
    const paintChips = () => {
      for (const chip of Array.from(chips.querySelectorAll("button"))) chip.remove();
      for (const topic of topics) {
        const button = ctx.ui.button(topic.title, { size: "sm", variant: topic.id === current ? "primary" : void 0 });
        button.addEventListener("click", () => {
          void open(topic.id);
        });
        chips.append(button);
      }
    };
    const open = async (id) => {
      current = id;
      paintChips();
      try {
        const payload = await ctx.invoke("read", [id]);
        article.replaceChildren(renderMarkdown(document, payload.text));
      } catch (error) {
        article.replaceChildren(ctx.ui.h("p", "muted", errorText(error)));
      }
    };
    const search = async () => {
      const query = searchInput.value.trim();
      if (!query) return;
      const busy = ctx.ui.disable(searchButton);
      try {
        const payload = await ctx.invoke("search", [query]);
        const card = renderMarkdown(document, payload.text);
        card.classList.add("mono");
        article.replaceChildren(card);
      } catch (error) {
        article.replaceChildren(ctx.ui.h("p", "muted", errorText(error)));
      } finally {
        busy.dispose();
      }
    };
    searchButton.addEventListener("click", () => void search());
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") void search();
    });
    const load = async () => {
      try {
        const payload = await ctx.invoke("topics");
        topics = payload.topics ?? [];
        paintChips();
        if (topics.length === 0) return;
        if (!current || !topics.some((topic) => topic.id === current)) {
          await open(topics[0].id);
        }
      } catch (error) {
        hint.textContent = errorText(error);
      }
    };
    void load();
  }
};
function renderMarkdown(owner, text2) {
  const root = owner.createElement("div");
  root.className = "rows";
  let listEl = null;
  let listKind = null;
  for (const raw of text2.split("\n")) {
    const line = raw.replace(/\s+$/, "");
    if (!line.trim()) {
      listEl = null;
      listKind = null;
      continue;
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      listEl = null;
      listKind = null;
      const level = heading[1].length;
      const el = owner.createElement(level === 1 ? "h2" : level === 2 ? "h3" : "h4");
      el.append(...inlineNodes(owner, heading[2]));
      root.append(el);
      continue;
    }
    const quote = /^>\s?(.*)$/.exec(line);
    if (quote) {
      listEl = null;
      listKind = null;
      const el = owner.createElement("blockquote");
      el.append(...inlineNodes(owner, quote[1]));
      root.append(el);
      continue;
    }
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const numbered = /^\d+\.\s+(.*)$/.exec(line);
    if (bullet || numbered) {
      const kind = bullet ? "ul" : "ol";
      if (!listEl || listKind !== kind) {
        listEl = owner.createElement(kind);
        listKind = kind;
        root.append(listEl);
      }
      const li = owner.createElement("li");
      li.append(...inlineNodes(owner, (bullet ?? numbered)[1]));
      listEl.append(li);
      continue;
    }
    listEl = null;
    listKind = null;
    const p = owner.createElement("p");
    p.append(...inlineNodes(owner, line));
    root.append(p);
  }
  return root;
}
function inlineNodes(owner, text2) {
  const nodes = [];
  const pattern = /`([^`]+)`/g;
  let last = 0;
  let match = pattern.exec(text2);
  while (match) {
    if (match.index > last) nodes.push(owner.createTextNode(text2.slice(last, match.index)));
    const code = owner.createElement("code");
    code.textContent = match[1];
    nodes.push(code);
    last = match.index + match[0].length;
    match = pattern.exec(text2);
  }
  if (last < text2.length) nodes.push(owner.createTextNode(text2.slice(last)));
  return nodes;
}
var bundle = { panels: { system: panel, upgrade: upgradePanel, protocol: protocolPanel, guide: guidePanel } };
function errorText(error) {
  return error instanceof Error ? error.message : String(error);
}
function normalizeSeedInput(raw) {
  const text2 = raw.trim();
  if (!text2) return 20261111;
  return /^\d{1,15}$/.test(text2) ? Number(text2) : text2;
}
var client_default = bundle;
export {
  client_default as default
};
