// src/webui/i18n.ts
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
  saveTitle: "\u5B58\u6863",
  saveExport: "\u5BFC\u51FA\u5B58\u6863",
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
  speedTitle: "\u65F6\u95F4\u500D\u901F",
  speedHint: (x, realMin) => `${x} \u500D\uFF1A\u4E00\u4E2A\u6BCD\u661F\u65F6 ${realMin.toFixed(2)} \u5206\u949F\u73B0\u5B9E\u65F6\u95F4\u3002`,
  charterNone: "\u8FD8\u6CA1\u9009\u6267\u7167\uFF1A\u53BB\u5546\u5E97\u4E70\u3010\u661F\u9645\u5E7F\u64AD \xB7 \u65C5\u6E38\u661F\u7CFB\u3011\u6216\u3010\u661F\u9645\u5E7F\u64AD \xB7 \u6280\u672F\u661F\u7CFB\u3011\uFF08\u4E00\u5C40\u53EA\u80FD\u9009\u4E00\u5F20\uFF09\u3002",
  charterTourism: (rep, visitors, docks, lodges) => `\u65C5\u6E38\u661F\u7CFB \xB7 \u77E5\u540D\u5EA6 ${rep.toFixed(1)}/100 \xB7 \u6628\u65E5\u5230\u6E2F ${visitors} \u4F4D \xB7 ${docks} \u4E2A\u505C\u6CCA\u4F4D / ${lodges} \u5E8A`,
  charterTech: (compute, staff, cap, fabs) => `\u6280\u672F\u661F\u7CFB \xB7 \u8BA1\u7B97\u529B ${compute.toFixed(1)} \xB7 \u5458\u5DE5 ${staff}/${cap} \xB7 ${fabs} \u5EA7\u6676\u5706\u5382`,
  gridOut: "\u628A\u7535\u9001\u8FDB\u7535\u7F51\uFF08-10%\uFF09",
  bedsInfo: (lodge, housing) => `\u5E8A\u4F4D\uFF1A\u8BBF\u5BA2 ${lodge} \xB7 \u5458\u5DE5 ${housing}\uFF08\u592A\u70ED\u592A\u51B7\u7684\u4E0D\u7B97\uFF09`,
  tempWarning: (list) => `\u26A0 \u4F4F\u4E0D\u4E0B\uFF1A${list}`,
  wonderLine: (label, percent) => `\u5947\u89C2\uFF1A${label} \xB7 ${percent}%`,
  wondersDone: (count) => `\u5DF2\u843D\u6210\u5947\u89C2 ${count} \u5EA7`,
  gridStored: "\u672C\u5730\u7535\u7F51\uFF1A",
  gridReach: "\u7535\u5854\u5C31\u5728",
  gridFar: "\u79BB\u7535\u5854",
  gridTowerAt: "\u7535\u5854\u5728",
  gridNoTower: "\u8FD9\u9897\u661F\u8FD8\u6CA1\u6709\u3010\u6574\u6D41\u7535\u5854\u3011\uFF1A\u5E06\u53D1\u7684\u7535\u76F4\u63A5\u8FDB\u7535\u6C60\uFF0C\u8BBE\u5907\u4E5F\u6CA1\u6CD5\u5728\u672C\u5730\u53D6\u7535\u3002",
  tungsten: "\u94A8",
  shipLine: (food, water, oxygen, sleepers, hours) => `\u7740\u9646\u8231\uFF1A\u7CAE ${food} kg\u3001\u6C34 ${water} L\u3001\u6C27 ${oxygen} kg \xB7 ${sleepers} \u4E2A\u4EBA\u7761\u7740\uFF0C\u5927\u7EA6\u8FD8\u591F ${hours} \u6BCD\u661F\u65F6`,
  buyChart: "\u4E70\u4E00\u5F20\u661F\u56FE\uFF08300 \u4FE1\u7528\u70B9\uFF09",
  buyFertilizer: "\u4E70 5 kg \u590D\u5408\u80A5",
  spreadFertilizer: "\u6492 1 kg \u590D\u5408\u80A5",
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
  recreateTitle: "\u518D\u521B\u4E16",
  recreateDesc: "\u5E26\u7740\u6863\u6848\u53BB\u4E0B\u4E00\u5F20\u5730\u56FE\uFF1A1,000,000 kJ \u80FD\u91CF\u3001100 kg \u6C18\u6C1A\u71C3\u6599\u30011 \u4EFD\u5F02\u661F\u751F\u547D\u6837\u672C\uFF0C\u673A\u52A8\u6838\u5FC3\u8FD8\u5F97\u662F\u4FEE\u597D\u7684\u3002\u65E7\u5730\u56FE\u4F1A\u5F52\u6863\u4F5C\u5E9F\uFF0C\u6240\u6709\u4EBA\u56DE\u4F11\u7720\u8231\u3002",
  recreateSeed: "\u79CD\u5B50",
  recreateMass: "\u6052\u661F\u8D28\u91CF",
  recreateGo: "\u70B9\u706B\uFF0C\u53BB\u4E0B\u4E00\u9897\u661F",
  recreateBlocked: "\u8FD8\u5DEE\u8FD9\u4E9B",
  recreateDone: "\u70B9\u706B\u4E86\u2014\u2014\u98DE\u5411\u4E0B\u4E00\u9897\u661F\u3002",
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
  guideTools: "\u5DE5\u5177\u8868",
  shopTitle: "\u5546\u5E97",
  shopDesc: "\u5546\u4EBA\u53EA\u5728\u4E00\u5B9A\u7684\u65F6\u95F4\u6765\uFF1A\u5356\u8D27\u3001\u4E70\u79CD\u5B50\u4E0E\u8BBE\u5907\u3001\u4EA4\u8BA2\u5355\u90FD\u5728\u8FD9\u91CC\u3002\u5173\u5F20\u65F6\u6309\u94AE\u662F\u7070\u7684\uFF0C\u4EF7\u76EE\u7167\u770B\u3002",
  shopOpenNow: "\u5F00\u5F20\u4E2D",
  shopClosedNow: "\u5173\u5F20",
  shopWindowLabel: "\u8425\u4E1A\u65F6\u95F4",
  shopNextOpen: (hours) => "\u8FD8\u6709 " + hours + " \u6BCD\u661F\u65F6\u5F00\u5F20",
  shopCredits: "\u4FE1\u7528\u70B9",
  shopEnergy: "\u80FD\u91CF",
  shopTungsten: "\u94A8",
  shopSellHeader: "\u5356\u7ED9\u4ED6",
  shopBuyHeader: "\u4ECE\u4ED6\u8FD9\u4E70",
  shopOrdersHeader: "\u4ED6\u5E26\u6765\u7684\u8BA2\u5355",
  shopHeld: (amount) => "\u624B\u91CC " + amount,
  shopSell: (name, unit) => "\u5356 " + unit + " " + name,
  shopBuy: (name) => "\u4E70 " + name,
  shopDeliver: "\u4EA4\u8D27",
  shopNoOrders: "\u8FD9\u4E00\u4F1A\u513F\u6CA1\u6709\u8BA2\u5355\u3002",
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
  saveTitle: "Save",
  saveExport: "Export save",
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
  speedTitle: "Time speed",
  speedHint: (x, realMin) => `${x}\xD7 \u2014 one home hour is ${realMin.toFixed(2)} real minutes.`,
  charterNone: "No charter yet: buy a broadcast licence (tourism or tech) at the shop \u2014 one per run.",
  charterTourism: (rep, visitors, docks, lodges) => `Tourism \xB7 fame ${rep.toFixed(1)}/100 \xB7 ${visitors} visitors yesterday \xB7 ${docks} docks / ${lodges} beds`,
  charterTech: (compute, staff, cap, fabs) => `Tech \xB7 compute ${compute.toFixed(1)} \xB7 staff ${staff}/${cap} \xB7 ${fabs} fabs`,
  gridOut: "Feed the grid (\u221210%)",
  bedsInfo: (lodge, housing) => `Beds: guests ${lodge} \xB7 staff ${housing} (hot/cold ones don\u2019t count)`,
  tempWarning: (list) => `\u26A0 Unlivable: ${list}`,
  wonderLine: (label, percent) => `Wonder: ${label} \xB7 ${percent}%`,
  wondersDone: (count) => `${count} wonder(s) standing`,
  gridStored: "Local grid: ",
  gridReach: "tower is",
  gridFar: "tower is",
  gridTowerAt: "at",
  gridNoTower: "This planet has no rectifier tower: sails charge the battery directly, and nothing here can draw local power.",
  tungsten: "tungsten",
  shipLine: (food, water, oxygen, sleepers, hours) => `Landing pod: ${food} kg food, ${water} L water, ${oxygen} kg oxygen \xB7 ${sleepers} asleep, about ${hours} home-hours left`,
  buyChart: "Buy a star chart (300 credits)",
  buyFertilizer: "Buy 5 kg fertilizer",
  spreadFertilizer: "Spread 1 kg fertilizer",
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
  recreateTitle: "Recreate",
  recreateDesc: "Carry the profile to a new map: 1,000,000 kJ, 100 kg of deuterium fuel, 1 alien sample, and a repaired mobility core. The old map is archived and sealed; everyone goes back into the pods.",
  recreateSeed: "Seed",
  recreateMass: "Star mass",
  recreateGo: "Ignite \u2014 fly to the next star",
  recreateBlocked: "Not yet",
  recreateDone: "Ignited \u2014 on our way to the next star.",
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
  guideTools: "All tools",
  shopTitle: "Shop",
  shopDesc: "The merchant only comes around at certain hours: selling, buying seeds and gear, handing in orders \u2014 all here. Buttons grey out when he is away; prices stay visible.",
  shopOpenNow: "Open",
  shopClosedNow: "Closed",
  shopWindowLabel: "Hours",
  shopNextOpen: (hours) => "Opens in " + hours + " home hours",
  shopCredits: "Credits",
  shopEnergy: "Energy",
  shopTungsten: "Tungsten",
  shopSellHeader: "Sell",
  shopBuyHeader: "Buy",
  shopOrdersHeader: "His orders",
  shopHeld: (amount) => "You hold " + amount,
  shopSell: (name, unit) => "Sell " + unit + " " + name,
  shopBuy: (name) => "Buy " + name,
  shopDeliver: "Deliver",
  shopNoOrders: "No orders right now.",
  protoClear: "All done."
};
function text(language) {
  return language.startsWith("zh") ? ZH : EN;
}

// src/webui/tokens.ts
var TOKENS = `
:root {
  --gx-bg: #080b0a;
  --gx-panel: #0d1210;
  --gx-line: #1d2a24;
  --gx-line-soft: #14201b;
  --gx-ink: #cfe7dc;
  --gx-ink-dim: #7d9a8c;
  --gx-ink-faint: #4d6158;
  --gx-accent: #5ef2a0;
  --gx-accent-dim: #2f8f63;
  --gx-warn: #ffb454;
  --gx-bad: #ff6b6b;
  --gx-glow: 0 0 0 1px rgba(94, 242, 160, 0.18), 0 0 14px rgba(94, 242, 160, 0.06);
  --gx-sp-1: 4px;
  --gx-sp-2: 8px;
  --gx-sp-3: 12px;
  --gx-sp-4: 16px;
  --gx-radius: 6px;
  --gx-mono: ui-monospace, SFMono-Regular, "Cascadia Mono", "JetBrains Mono", Menlo, Consolas, monospace;
  --gx-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.gx {
  background: var(--gx-bg);
  color: var(--gx-ink);
  font-family: var(--gx-sans);
  font-size: 13px;
  line-height: 1.55;
  border-radius: var(--gx-radius);
  padding: var(--gx-sp-4);
}

.gx-topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--gx-sp-2) var(--gx-sp-3);
  padding: var(--gx-sp-2) var(--gx-sp-3);
  margin-bottom: var(--gx-sp-3);
  background: var(--gx-panel);
  border: 1px solid var(--gx-line);
  border-radius: var(--gx-radius);
  box-shadow: var(--gx-glow);
}

.gx-topbar .gx-num { font-family: var(--gx-mono); font-variant-numeric: tabular-nums; }
.gx-topbar .gx-dim { color: var(--gx-ink-dim); }
.gx-topbar .gx-spacer { flex: 1 1 auto; }

.gx-body { display: grid; gap: var(--gx-sp-3); }

/* \u5BBF\u4E3B\u7ED9 h1\u2013h4 / p / li \u4E0A\u4E86\u6DF1\u8272\uFF0C\u6DF1\u8272\u5E95\u4E0A\u770B\u4E0D\u89C1\uFF1A\u53EA\u91CD\u7F6E\u6587\u5B57\u5BB9\u5668\uFF0C\u4E0D\u78B0 gx-ok/gx-bad \u8FD9\u7C7B\u5E26\u8272 span\u3002 */
.gx h1, .gx h2, .gx h3, .gx h4, .gx h5,
.gx p, .gx li, .gx ul, .gx ol, .gx dl, .gx dt, .gx dd,
.gx label, .gx table, .gx th, .gx td {
  color: inherit;
}
.gx h3 { font-size: 14px; font-weight: 600; margin: 0 0 var(--gx-sp-1); }
.gx h4 { font-size: 13px; font-weight: 600; margin: var(--gx-sp-2) 0 var(--gx-sp-1); color: var(--gx-ink-dim); }
.gx ul { margin: 0; padding-left: 18px; }
.gx a { color: var(--gx-accent); }

.gx-card {
  background: var(--gx-panel);
  border: 1px solid var(--gx-line-soft);
  border-radius: var(--gx-radius);
  padding: var(--gx-sp-3);
}

.gx-card-head {
  display: flex;
  align-items: center;
  gap: var(--gx-sp-2);
  margin-bottom: var(--gx-sp-2);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.gx-card-head::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gx-accent);
  box-shadow: 0 0 8px var(--gx-accent);
}

.gx-grid-2 { display: grid; gap: var(--gx-sp-2); grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
.gx-grid-3 { display: grid; gap: var(--gx-sp-2); grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }

.gx-row { display: flex; align-items: baseline; gap: var(--gx-sp-2); }
.gx-row + .gx-row { margin-top: var(--gx-sp-1); }
.gx-row .gx-k { color: var(--gx-ink-dim); }
.gx-row .gx-v { font-family: var(--gx-mono); font-variant-numeric: tabular-nums; }
.gx-row .gx-gap { flex: 1 1 auto; }

.gx-num { font-family: var(--gx-mono); font-variant-numeric: tabular-nums; }
.gx-ok { color: var(--gx-accent); }
.gx-warn { color: var(--gx-warn); }
.gx-bad { color: var(--gx-bad); }
.gx-dim { color: var(--gx-ink-dim); }
.gx-faint { color: var(--gx-ink-faint); }

.gx-bar {
  height: 6px;
  background: var(--gx-line-soft);
  border-radius: 3px;
  overflow: hidden;
}
.gx-bar > i { display: block; height: 100%; background: var(--gx-accent-dim); }
.gx-bar.is-warn > i { background: var(--gx-warn); }
.gx-bar.is-bad > i { background: var(--gx-bad); }

.gx-list { display: grid; gap: var(--gx-sp-1); }
.gx-list .gx-item {
  display: flex;
  gap: var(--gx-sp-2);
  padding: var(--gx-sp-1) var(--gx-sp-2);
  border-radius: var(--gx-sp-1);
  border: 1px solid transparent;
}
.gx-list .gx-item:hover { border-color: var(--gx-line); background: rgba(94, 242, 160, 0.03); }

.gx-empty { color: var(--gx-ink-faint); font-style: italic; }
.gx-msg {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 13px;
  line-height: 1.55;
  padding: var(--gx-sp-1) var(--gx-sp-2);
  border-left: 2px solid var(--gx-line);
  color: var(--gx-ink-dim);
}
.gx-msg.gx-ok { border-left-color: var(--gx-accent); color: var(--gx-ink); }
.gx-msg.gx-bad { border-left-color: var(--gx-bad); color: var(--gx-bad); }

/* \u7A84\u5C4F\uFF1A\u5361\u7247\u53E0\u6210\u4E00\u5217\uFF0C\u9876\u680F\u5141\u8BB8\u6362\u884C\uFF0C\u6570\u5B57\u4E0D\u6324\u5728\u4E00\u8D77\u3002 */
@media (max-width: 760px) {
  .gx-body { grid-template-columns: 1fr; }
  .gx-topbar { flex-wrap: wrap; gap: var(--gx-sp-1); }
  .gx-row { flex-wrap: wrap; }
  .gx-bar { width: 48px; }
  .gx-view { min-width: 0; }
}
`;
var installed = false;
function ensureStyles(owner) {
  if (installed || owner.querySelector("style[data-gx-tokens]")) return;
  const style = owner.createElement("style");
  style.setAttribute("data-gx-tokens", "1");
  style.textContent = TOKENS;
  owner.head.append(style);
  installed = true;
}

// src/webui/shell.ts
var EMPTY = "\u8FD8\u6CA1\u6709\u5B58\u6863 \u2014\u2014 \u53BB\u6700\u540E\u90A3\u4E2A\u300C\u5B58\u6863\u300D\u9875\u7B7E\u65B0\u5EFA\u4E00\u5C40\u3002";
function emptyText(state) {
  if (state && state.loadError) return `\u5B58\u6863\u8BFB\u4E0D\u8FDB\u6765\uFF1A${state.loadError}\uFF08\u539F\u6587\u4EF6\u5DF2\u5907\u4EFD\u4E3A game.json.before-repair\uFF09`;
  return EMPTY;
}
function num(value, digits = 0) {
  return value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
function bar(ratio, tone) {
  const wrap = document.createElement("span");
  wrap.className = tone ? `gx-bar is-${tone}` : "gx-bar";
  wrap.style.width = "72px";
  wrap.style.display = "inline-block";
  wrap.style.verticalAlign = "middle";
  const fill = document.createElement("i");
  fill.style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
  wrap.append(fill);
  return wrap;
}
function createShell(ctx, opts) {
  ensureStyles(ctx.root.ownerDocument);
  const sheet = ctx.ui.sheet({ title: opts.title, desc: opts.desc });
  const root = ctx.ui.h("div", "gx");
  const topbar = ctx.ui.h("div", "gx-topbar");
  const body = ctx.ui.h("div", "gx-body");
  root.append(topbar, body);
  sheet.body.append(root);
  ctx.root.append(sheet.el);
  const clock = ctx.ui.h("span", "gx-num");
  const where = ctx.ui.h("span", "gx-dim");
  const energy = ctx.ui.h("span", "gx-num");
  const energyBar = ctx.ui.h("span");
  const tungsten = ctx.ui.h("span", "gx-num");
  const credits = ctx.ui.h("span", "gx-num");
  const ship = ctx.ui.h("span", "gx-num");
  const charter = ctx.ui.h("span", "gx-num");
  const speedWrap = ctx.ui.h("span", "gx-row");
  speedWrap.style.gap = "4px";
  speedWrap.style.alignItems = "center";
  const speedInput = ctx.ui.h("input");
  speedInput.type = "range";
  speedInput.min = "1";
  speedInput.max = "200";
  speedInput.step = "1";
  speedInput.value = "1";
  speedInput.style.width = "84px";
  const speedLabel = ctx.ui.h("span", "gx-num gx-dim", "\xD71");
  speedInput.onchange = async () => {
    const value = Number(speedInput.value) || 1;
    speedLabel.textContent = `\xD7${value}`;
    try {
      await ctx.invoke("speed", [value]);
    } catch {
      speedLabel.textContent = "\xD7?";
    }
    void ctx.refresh();
  };
  speedWrap.append(speedInput, speedLabel);
  topbar.append(clock, where, ctx.ui.h("span", "gx-spacer"), speedWrap, energy, energyBar, tungsten, credits, ship, charter);
  return {
    root,
    body,
    updateLoose(info) {
      clock.textContent = info.time ?? "\u2014";
      where.textContent = info.where ?? "";
      if (info.energyKj !== void 0) {
        const capacity = info.capacityKj ?? 3e5;
        const ratio = capacity > 0 ? info.energyKj / capacity : 0;
        energy.textContent = `\u26A1 ${num(info.energyKj)} / ${num(capacity)} kJ`;
        energy.className = ratio < 0.1 ? "gx-num gx-bad" : ratio < 0.25 ? "gx-num gx-warn" : "gx-num";
        energyBar.replaceChildren(bar(ratio, ratio < 0.1 ? "bad" : ratio < 0.25 ? "warn" : void 0));
      }
      if (info.tungsten !== void 0) tungsten.textContent = `\u94A8 ${num(info.tungsten)}`;
      if (info.speed !== void 0) {
        speedInput.value = String(info.speed);
        const minutes = info.baseMinutesPerHomeHour !== void 0 ? info.baseMinutesPerHomeHour / info.speed : void 0;
        speedLabel.textContent = minutes === void 0 ? `\xD7${info.speed}` : `\xD7${info.speed} \xB7 ${minutes < 1 ? minutes.toFixed(2) : Math.round(minutes)} \u5206/\u65F6`;
      }
      if (info.credits !== void 0) credits.textContent = `\u{1F4B3} ${num(info.credits)}`;
    },
    update(state) {
      if (!state || state.locked) {
        clock.textContent = "\u672A\u521B\u4E16";
        where.textContent = "";
        energy.textContent = "";
        tungsten.textContent = "";
        credits.textContent = "";
        ship.textContent = "";
        charter.textContent = "";
        energyBar.replaceChildren();
        return;
      }
      clock.textContent = state.game?.time ?? "\u2014";
      where.textContent = state.game?.where ?? "";
      const power = state.power;
      if (power) {
        const ratio = power.capacityKj > 0 ? power.energyKj / power.capacityKj : 0;
        energy.textContent = `\u26A1 ${num(power.energyKj)} / ${num(power.capacityKj)} kJ`;
        energy.className = ratio < 0.1 ? "gx-num gx-bad" : ratio < 0.25 ? "gx-num gx-warn" : "gx-num";
        energyBar.replaceChildren(bar(ratio, ratio < 0.1 ? "bad" : ratio < 0.25 ? "warn" : void 0));
        tungsten.textContent = `\u94A8 ${num(power.tungsten)}`;
        credits.textContent = `\u{1F4B3} ${num(power.credits)}`;
        credits.className = "gx-num gx-dim";
        const charterInfo = power.charter;
        if (charterInfo) {
          const speed = charterInfo.speed ?? 1;
          speedInput.value = String(speed);
          const minutes = charterInfo.baseMinutesPerHomeHour !== void 0 ? charterInfo.baseMinutesPerHomeHour / speed : void 0;
          speedLabel.textContent = minutes === void 0 ? `\xD7${speed}` : `\xD7${speed} \xB7 ${minutes < 1 ? minutes.toFixed(3) : minutes.toFixed(1)} \u5206/\u65F6`;
        }
        const sleepers = power.ship?.sleepers ?? 0;
        if (sleepers > 0) {
          const hours = power.ship?.hoursLeft;
          ship.textContent = hours === null || hours === void 0 ? `\u8231\u5185 ${sleepers} \u4EBA` : `\u8231\u5185 ${sleepers} \u4EBA \xB7 \u7EA6 ${num(hours)} \u65F6`;
          ship.className = hours !== null && hours !== void 0 && hours < 72 ? "gx-num gx-warn" : "gx-num gx-dim";
        } else {
          ship.textContent = "";
        }
      } else {
        energy.textContent = "";
        energyBar.replaceChildren();
        tungsten.textContent = "";
        credits.textContent = "";
        ship.textContent = "";
      }
      const c = state.power?.charter;
      if (c?.charter === "tourism") {
        charter.textContent = `\u65C5\u6E38 \xB7 \u77E5\u540D\u5EA6 ${num(c.reputation ?? 0, 0)}`;
        charter.className = "gx-num gx-ok";
      } else if (c?.charter === "tech") {
        charter.textContent = `\u79D1\u6280 \xB7 \u7B97\u529B ${num(c.compute ?? 0, 1)}`;
        charter.className = "gx-num gx-ok";
      } else {
        charter.textContent = "";
      }
    }
  };
}

// src/webui/panels/overview.ts
function num2(value, digits = 0) {
  return value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
function card(ctx, title) {
  const el = ctx.ui.h("div", "gx-card");
  const body = ctx.ui.h("div");
  el.append(ctx.ui.h("div", "gx-card-head", title), body);
  return { el, body };
}
function row(ctx, key, value, tone) {
  const line = ctx.ui.h("div", "gx-row");
  line.append(ctx.ui.h("span", "gx-k", key), ctx.ui.h("span", "gx-gap"), ctx.ui.h("span", tone ? `gx-v ${tone}` : "gx-v", value));
  return line;
}
function nextSteps(state) {
  const out = [];
  const power = state.power;
  const ship = power?.ship;
  const people = state.habitats.reduce((sum, h) => sum + h.awake, 0);
  const pending = state.protocol ? state.protocol.total - state.protocol.done : 0;
  if (ship && ship.sleepers > 0 && ship.hoursLeft !== null && ship.hoursLeft < 72) {
    out.push({ label: `\u7740\u9646\u8231\u7684\u6C27\u6C14\u53EA\u591F\u7EA6 ${num2(ship.hoursLeft)} \u6BCD\u661F\u65F6\uFF1A\u5148\u53BB\u79CD\u3001\u53BB\u4EA7\u6C27`, tone: "bad", tab: "\u519C\u573A" });
  }
  if (power && power.capacityKj > 0 && power.energyKj < power.capacityKj * 0.1) {
    out.push({ label: "\u7535\u5FEB\u89C1\u5E95\uFF1A\u624B\u6447\u4E00\u4E0B\uFF0C\u6216\u8005\u53BB\u300C\u5DE5\u4E1A\u300D\u5EFA\u592A\u9633\u80FD\u5E06", tone: "bad", tab: "\u5DE5\u4E1A" });
  }
  if (people === 0 && ship && ship.sleepers > 0) {
    out.push({ label: "\u8FD8\u6CA1\u53EB\u9192\u4EFB\u4F55\u4EBA\uFF1A\u534F\u8BAE\u6E05\u5355\u5728\u300C\u534F\u8BAE\u300D\u9875", tone: "warn", tab: "\u534F\u8BAE" });
  }
  if (state.buildQueueFull) {
    out.push({ label: "\u65BD\u5DE5\u961F\u5217\u6EE1\u4E86\uFF1A\u53BB\u300C\u5347\u7EA7\u300D\u4FEE\u5B50\u4EE3\u7406", tone: "warn", tab: "\u5347\u7EA7" });
  }
  if (pending > 0) {
    out.push({ label: `\u534F\u8BAE\u8FD8\u5DEE ${pending} \u9879\uFF08\u5171 ${state.protocol?.total ?? 0}\uFF09`, tone: "warn", tab: "\u534F\u8BAE" });
  }
  if (out.length === 0) out.push({ label: "\u6CA1\u6709\u5361\u4F4F\u7684\u4E8B\uFF1A\u53EF\u4EE5\u53BB\u300C\u5730\u8868\u300D\u770B\u770B\u5730\u56FE\uFF0C\u6216\u8005\u63A8\u4E00\u63A8\u8FDB\u5EA6", tone: "ok", tab: "\u5730\u8868" });
  return out.slice(0, 4);
}
var panel = {
  async mount(ctx) {
    const t = text(ctx.language);
    const shell = createShell(ctx, { title: t.title, desc: t.desc ?? "" });
    let state = null;
    const lockedNote = ctx.ui.h("div", "gx-empty");
    const status = card(ctx, "\u72B6\u51B5");
    const vital = card(ctx, "\u8981\u7D27\u7684\u6570");
    const todo = card(ctx, "\u4E0B\u4E00\u6B65");
    shell.body.append(lockedNote, status.el, vital.el, todo.el);
    const render = () => {
      shell.update(state);
      if (!state || state.locked) {
        lockedNote.textContent = emptyText(state);
        status.body.replaceChildren();
        vital.body.replaceChildren();
        todo.body.replaceChildren();
        return;
      }
      lockedNote.textContent = "";
      status.body.replaceChildren(
        row(ctx, "\u65F6\u95F4", state.game?.time ?? "\u2014"),
        row(ctx, "\u4F4D\u7F6E", state.game?.where ?? "\u2014"),
        row(ctx, "\u72B6\u6001", state.game?.transit ?? "\u6CA1\u6709\u5728\u79FB\u52A8", state.game?.transit ? "gx-warn" : "gx-ok"),
        row(ctx, "\u5386\u6CD5", state.game?.calendar ?? "\u2014", "gx-dim")
      );
      const power = state.power;
      const ship = power?.ship;
      const people = state.habitats.reduce((sum, h) => sum + h.awake, 0);
      const capacity = state.habitats.length * 20;
      const food = ship ? `${num2(ship.food, 1)} kg` : "\u2014";
      const water = ship ? `${num2(ship.water, 0)} L` : "\u2014";
      const oxygen = ship ? `${num2(ship.oxygen, 1)} kg` : "\u2014";
      const hours = ship?.hoursLeft;
      const grid = ctx.ui.h("div", "gx-grid-3");
      const cells = [
        ["\u5E38\u4F4F\u4EBA\u53E3", `${num2(people)} / ${num2(capacity)}`, people === 0 ? "gx-warn" : "gx-ok"],
        ["\u7740\u9646\u8231 \xB7 \u7CAE", food],
        ["\u7740\u9646\u8231 \xB7 \u6C34", water],
        ["\u7740\u9646\u8231 \xB7 \u6C27", oxygen],
        ["\u8FD8\u80FD\u6491", hours === null || hours === void 0 ? "\u2014" : `${num2(hours)} \u6BCD\u661F\u65F6`, hours !== null && hours !== void 0 && hours < 72 ? "gx-bad" : void 0],
        ["\u7535", power ? `${num2(power.energyKj)} kJ` : "\u2014"],
        ["\u4FE1\u7528\u70B9", power ? num2(power.credits) : "\u2014"],
        ["\u94A8", power ? `${num2(power.tungsten)} \u4EFD` : "\u2014"]
      ];
      for (const [k, v, tone] of cells) {
        const cell = ctx.ui.h("div");
        cell.append(row(ctx, k, v, tone));
        grid.append(cell);
      }
      vital.body.replaceChildren(grid);
      const steps = nextSteps(state);
      const list = ctx.ui.h("div", "gx-list");
      for (const step of steps) {
        const item = ctx.ui.h("div", "gx-item");
        const light = step.tone === "bad" ? "gx-bad" : step.tone === "warn" ? "gx-warn" : "gx-ok";
        item.append(ctx.ui.h("span", light, "\u25CF"), ctx.ui.h("span", "gx-num", step.label), ctx.ui.h("span", "gx-gap"), ctx.ui.h("span", "gx-faint", step.tab));
        list.append(item);
      }
      todo.body.replaceChildren(list);
    };
    const load = async () => {
      state = await ctx.invoke("state", []);
      render();
    };
    await load();
  }
};
var overview_default = panel;

// src/webui/ui-kit.ts
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
function errorText(error) {
  return error instanceof Error ? error.message : String(error);
}

// src/webui/map.ts
var WIDTH = 720;
var HEIGHT = 360;
var PX_PER_DEG = HEIGHT / 180;
function drawMap(canvas, map, territories = []) {
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
  for (const territory of territories) {
    const cx = xPx(territory.lonDeg, WIDTH);
    const cy = yPx(territory.latDeg, HEIGHT);
    const radius = Math.max(2, territory.radiusKm / 111 * PX_PER_DEG);
    context.beginPath();
    context.arc(cx, cy, radius, 0, Math.PI * 2);
    context.strokeStyle = "#ffb454";
    context.globalAlpha = 0.7;
    context.lineWidth = 1;
    context.stroke();
    context.globalAlpha = 1;
  }
}

// src/webui/panels/surface.ts
var panel2 = {
  async mount(ctx) {
    const t = text(ctx.language);
    const shell = createShell(ctx, { title: t.mapTitle, desc: "\u5730\u56FE\u3001\u770B\u9644\u8FD1\u3001\u8D70\u4E00\u6BB5\u3001\u7B49\u4E00\u4F1A\u3002\u8DE8\u661F\u822A\u884C\u5728\u300C\u5DE5\u4E1A\u300D\u9875\u7B7E\u3002" });
    let state = null;
    let bodyKey = "";
    let map = null;
    const empty = ctx.ui.h("div", "gx-empty");
    const cardMap = ctx.ui.h("div", "gx-card");
    const cardLook = ctx.ui.h("div", "gx-card");
    const cardAct = ctx.ui.h("div", "gx-card");
    const canvas = ctx.ui.h("canvas");
    canvas.style.width = "100%";
    canvas.style.imageRendering = "pixelated";
    canvas.style.borderRadius = "6px";
    canvas.style.display = "block";
    const legend = ctx.ui.h("div", "gx-legend");
    const lookPre = ctx.ui.h("pre", "gx-pre");
    lookPre.style.display = "none";
    const picker = ctx.ui.h("div", "gx-chips");
    const msg = ctx.ui.h("div", "gx-msg");
    msg.hidden = true;
    const mapWrap = ctx.ui.h("div", "gx-mapwrap");
    mapWrap.append(canvas);
    cardMap.append(ctx.ui.h("div", "gx-card-head", t.mapTitle), picker, legend, mapWrap);
    cardLook.append(ctx.ui.h("div", "gx-card-head", t.lookHere), lookPre);
    cardAct.append(ctx.ui.h("div", "gx-card-head", "\u52A8\u4F5C"), msg);
    shell.body.append(empty, cardMap, cardLook, cardAct);
    const showMsg = (value, bad = false) => {
      msg.textContent = value;
      msg.className = bad ? "gx-msg gx-bad" : "gx-msg gx-ok";
      msg.hidden = false;
    };
    const run = async (method, args = [], consumeState = false) => {
      try {
        const result = await ctx.invoke(method, args);
        if (consumeState && result && typeof result === "object" && "power" in result) {
          state = result;
          render();
          const inner = result.text;
          if (inner) showMsg(inner);
          return;
        }
        const payload = result;
        showMsg(payload?.text ?? String(result));
      } catch (e) {
        showMsg(errorText(e), true);
      }
    };
    const refreshMap = async () => {
      if (!state || state.locked) {
        map = null;
        return;
      }
      try {
        map = await ctx.invoke("map", [bodyKey]);
      } catch (e) {
        map = null;
        showMsg(errorText(e), true);
      }
      draw();
    };
    const draw = () => {
      if (!map) {
        canvas.width = 0;
        canvas.height = 0;
        legend.replaceChildren();
        return;
      }
      drawMap(canvas, map, state?.territories ?? []);
      const seen = /* @__PURE__ */ new Set();
      legend.replaceChildren();
      for (const row2 of map.biome) {
        for (const id of row2) {
          if (seen.has(id)) continue;
          seen.add(id);
          const chip = ctx.ui.h("span", "gx-chip");
          const dot = ctx.ui.h("span", "gx-dot");
          dot.style.background = mapColor(id);
          chip.append(dot, ctx.ui.h("span", "gx-faint", String(id)));
          legend.append(chip);
        }
      }
    };
    const mapColor = (id) => {
      const palette = ["#1d4ed8", "#e5edf7", "#c2a35a", "#b7a06a", "#8bbf6b", "#5f9e4f", "#2f7a3f", "#1f6b3a", "#0f5a33", "#345e6e", "#6c7a83", "#9a9aa0", "#9fd0e8", "#5ba6c9", "#4a7fb5", "#7a5fb5", "#c14b6b"];
      return palette[id] ?? "#555";
    };
    const rebuildPicker = () => {
      picker.replaceChildren();
      if (!state) return;
      for (const body of state.bodies) {
        if (body.kind === "moon") continue;
        const active = body.key === bodyKey;
        const chip = ctx.ui.button(`${body.label}`, {
          size: "sm",
          variant: active ? "primary" : void 0,
          onClick: () => {
            bodyKey = body.key;
            rebuildPicker();
            void refreshMap();
          }
        });
        picker.append(chip);
      }
    };
    const render = () => {
      shell.update(state);
      if (!state || state.locked) {
        empty.textContent = emptyText(state);
        cardMap.hidden = true;
        cardLook.hidden = true;
        cardAct.hidden = true;
        return;
      }
      empty.textContent = "";
      cardMap.hidden = false;
      cardLook.hidden = false;
      cardAct.hidden = false;
      if (!bodyKey || !state.bodies.some((b) => b.key === bodyKey)) bodyKey = state.bodies.find((b) => b.kind !== "moon")?.key ?? "";
      rebuildPicker();
    };
    const latInput = ctx.ui.input({ value: "0" });
    const lonInput = ctx.ui.input({ value: "0" });
    const goButton = ctx.ui.button("\u8D70\u8FC7\u53BB", {
      size: "sm",
      variant: "primary",
      onClick: () => {
        void run("move", [{ latDeg: Number(latInput.value), lonDeg: Number(lonInput.value) }], true);
      }
    });
    const hereButton = ctx.ui.button("\u586B\u811A\u4E0B\u7684\u7ECF\u7EAC", {
      size: "sm",
      onClick: () => {
        if (!state?.location) return;
        latInput.value = state.location.latDeg.toFixed(1);
        lonInput.value = state.location.lonDeg.toFixed(1);
      }
    });
    const lookButton = ctx.ui.button(t.lookHere, { size: "sm", onClick: () => void run("look", []) });
    const waitButton = ctx.ui.button("\u7B49 1 \u65F6", { size: "sm", onClick: () => void run("wait", [{ until: "hours", hours: 1 }], true) });
    const noonButton = ctx.ui.button("\u7B49\u5230\u4E2D\u5348", { size: "sm", onClick: () => void run("wait", [{ until: "noon" }], true) });
    const veinsButton = ctx.ui.button("\u63A2\u77FF\u8109", { size: "sm", onClick: () => void run("veins", []) });
    const surveyButton = ctx.ui.button("\u6D4B\u7ED8\u4E00\u5708", { size: "sm", onClick: () => void run("survey", [], true) });
    const stargazeButton = ctx.ui.button("\u89C2\u661F", { size: "sm", onClick: () => void run("stargaze", []) });
    const travel = ctx.ui.h("div", "gx-row");
    travel.append(ctx.ui.h("span", "gx-k", "\u53BB\u54EA"), latInput, lonInput, goButton, hereButton);
    const quick = ctx.ui.h("div", "gx-row");
    quick.append(lookButton, waitButton, noonButton, veinsButton, surveyButton, stargazeButton);
    cardAct.append(travel, quick);
    const load = async () => {
      state = await ctx.invoke("state", []);
      render();
      await refreshMap();
      void run("look", []);
    };
    await load();
  }
};
var surface_default = panel2;

// src/webui/panels/farm.ts
function num3(value, digits = 0) {
  return value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
var panel3 = {
  async mount(ctx) {
    const t = text(ctx.language);
    const shell = createShell(ctx, { title: "\u519C\u573A", desc: "\u7AD9\u70B9\u3001\u4F5C\u7269\u3001\u79CD\u5B50\u3001\u6E29\u5BA4\u3002\u5EFA\u7AD9\u5148\u8D70\u5230\u6709\u5730\u7684\u5730\u65B9\u3002" });
    let state = null;
    let siteKey = "";
    const empty = ctx.ui.h("div", "gx-empty");
    const msg = ctx.ui.h("div", "gx-msg");
    msg.hidden = true;
    const sitesCard = ctx.ui.h("div", "gx-card");
    const cropsCard = ctx.ui.h("div", "gx-card");
    const seedsCard = ctx.ui.h("div", "gx-card");
    const houseCard = ctx.ui.h("div", "gx-card");
    shell.body.append(empty, msg, sitesCard, cropsCard, seedsCard, houseCard);
    const showMsg = (value, bad = false) => {
      msg.textContent = value;
      msg.className = bad ? "gx-msg gx-bad" : "gx-msg gx-ok";
      msg.hidden = false;
    };
    const act = async (method, args = []) => {
      try {
        const result = await ctx.invoke(method, args);
        if (result && typeof result === "object" && "power" in result) {
          state = result;
          const inner = result.text;
          if (inner) showMsg(inner);
          render();
          return;
        }
        const payload = result;
        showMsg(payload?.text ?? String(result));
        state = await ctx.invoke("state", []);
        render();
      } catch (e) {
        showMsg(errorText(e), true);
      }
    };
    const flora = () => state?.flora ?? null;
    const head = (title, ...extra) => {
      const bar2 = ctx.ui.h("div", "gx-row");
      bar2.append(ctx.ui.h("span", "gx-card-head", title), ctx.ui.h("span", "gx-gap"), ...extra);
      return bar2;
    };
    const renderSites = () => {
      const f = flora();
      sitesCard.replaceChildren();
      if (!f) return;
      const buildSite = ctx.ui.button("\u5728\u8FD9\u513F\u5EFA\u7AD9", { size: "sm", variant: "primary", onClick: () => void act("site", []) });
      sitesCard.append(head("\u7AD9\u70B9", buildSite));
      if (f.sites.length === 0) {
        sitesCard.append(ctx.ui.h("div", "gx-empty", "\u8FD8\u6CA1\u6709\u7AD9\u70B9\uFF1A\u8D70\u5230\u4E00\u5757\u9646\u5730\u4E0A\uFF0C\u70B9\u300C\u5728\u8FD9\u513F\u5EFA\u7AD9\u300D\u3002"));
        return;
      }
      for (const site of f.sites) {
        const rowEl = ctx.ui.h("div", "gx-item");
        const active = site.key === siteKey;
        const pick = ctx.ui.button(site.key, {
          size: "sm",
          variant: active ? "primary" : void 0,
          onClick: () => {
            siteKey = site.key;
            render();
          }
        });
        const wet = site.wetness === null || site.wetness === void 0 ? "\u2014" : `${Math.round(site.wetness * 100)}%`;
        const fert = site.fertility === null || site.fertility === void 0 ? "\u2014" : `${Math.round(site.fertility * 100)}%`;
        rowEl.append(
          pick,
          ctx.ui.h("span", "gx-dim", `${site.kind === "water" ? "\u6C34\u8FB9\u6E7F\u5730" : "\u65F1\u5730"} \xB7 \u6E7F ${wet} \xB7 \u80A5 ${fert} \xB7 ${site.plants} \u682A/\u7FA4${site.ripe > 0 ? ` \xB7 ${site.ripe} \u719F` : ""}`)
        );
        sitesCard.append(rowEl);
      }
    };
    const renderCrops = () => {
      const f = flora();
      cropsCard.replaceChildren();
      if (!f) return;
      cropsCard.append(head("\u4F5C\u7269"));
      const crops = f.crops ?? [];
      if (crops.length === 0) {
        cropsCard.append(ctx.ui.h("div", "gx-empty", "\u8FD8\u6CA1\u6709\u4F5C\u7269\uFF1A\u5728\u79CD\u5B50\u533A\u9009\u4E00\u888B\uFF0C\u79CD\u5230\u7AD9\u70B9\u6216\u79CD\u690D\u76C6\u91CC\u3002"));
        return;
      }
      for (const crop of crops.slice(0, 40)) {
        const rowEl = ctx.ui.h("div", "gx-item");
        const label = `${crop.name} ${crop.id} \xB7 ${crop.site}`;
        rowEl.append(ctx.ui.h("span", crop.dead ? "gx-bad" : "gx-num", label), ctx.ui.h("span", "gx-dim", `${crop.stage} ${Math.round(crop.progress * 100)}%`));
        const buttons = [];
        if (crop.ripe) buttons.push(ctx.ui.button("\u6536", { size: "sm", onClick: () => void act("harvest", [crop.site, crop.id]) }));
        buttons.push(ctx.ui.button("\u8BE6\u60C5", { size: "sm", onClick: () => void act("inspect", [crop.id, crop.site]) }));
        if (!crop.dead) {
          buttons.push(ctx.ui.button("\u7559\u79CD", { size: "sm", onClick: () => void act("breed", [crop.id, crop.site, "self"]) }));
          buttons.push(ctx.ui.button("\u79FB\u683D", { size: "sm", onClick: () => void act("transplant", [crop.id, crop.site]) }));
        }
        if (crop.dead || crop.health < 20) {
          buttons.push(ctx.ui.button("\u62D4\u6389", { size: "sm", onClick: () => void act("remove", [crop.id, crop.site]) }));
        }
        rowEl.append(...buttons);
        cropsCard.append(rowEl);
      }
    };
    const renderSeeds = () => {
      const f = flora();
      seedsCard.replaceChildren();
      if (!f) return;
      const planterSelect = ctx.ui.select({
        options: [
          { value: "", label: "\u79CD\u5230\uFF1A\u9009\u4E2D\u7684\u7AD9\u70B9" },
          ...(f.planters ?? []).map((p) => ({ value: p.key, label: `${p.key}\uFF08${p.plants}/3\uFF09` }))
        ]
      });
      seedsCard.append(head("\u79CD\u5B50", planterSelect));
      if (f.bags.length === 0) {
        seedsCard.append(ctx.ui.h("div", "gx-empty", "\u6CA1\u6709\u79CD\u5B50\uFF1A\u5546\u5E97\u4E70\u3001\u7559\u79CD\u3001\u6216\u8005\u79FB\u683D\u56DE\u6765\u3002"));
      }
      for (const bag of f.bags) {
        const rowEl = ctx.ui.h("div", "gx-item");
        rowEl.append(ctx.ui.h("span", "gx-num", `${bag.premium ? "\u9AD8\u7EA7" : "\u968F\u673A"} \xB7 ${bag.name} \xD7${bag.count}`));
        rowEl.append(
          ctx.ui.button("\u79CD\u4E0B", {
            size: "sm",
            onClick: () => {
              const target = planterSelect.value !== "" ? planterSelect.value : siteKey;
              if (!target) {
                showMsg("\u5148\u9009\u4E00\u4E2A\u7AD9\u70B9\uFF08\u6216\u8005\u4E00\u53EA\u79CD\u690D\u76C6\uFF09\u3002", true);
                return;
              }
              void act("plant", [bag.id, target]);
            }
          })
        );
        seedsCard.append(rowEl);
      }
      const inv = (f.inventory ?? []).filter((item) => item.amount > 0);
      if (inv.length > 0) {
        seedsCard.append(ctx.ui.h("div", "gx-faint", `\u80CC\u5305\uFF1A${inv.map((item) => `${item.name} ${num3(item.amount, item.amount < 10 ? 1 : 0)}`).join(" \xB7 ")}`));
      }
      const fert = (f.inventory ?? []).find((item) => item.id === "fertilizer");
      if (fert && fert.amount > 0) {
        seedsCard.append(
          ctx.ui.button("\u7ED9\u9009\u4E2D\u7AD9\u70B9\u6492 1 kg \u590D\u5408\u80A5", {
            size: "sm",
            onClick: () => void act("fertilize", [1, siteKey])
          })
        );
      }
    };
    const renderHouse = () => {
      const f = flora();
      houseCard.replaceChildren();
      if (!f) return;
      houseCard.append(head("\u6E29\u5BA4\u4E0E\u79CD\u690D\u76C6"));
      const list = ctx.ui.h("div", "gx-list");
      const greenhouses = state?.greenhouses ?? [];
      if (greenhouses.length === 0) list.append(ctx.ui.h("div", "gx-empty", "\u8FD8\u6CA1\u6709\u6E29\u5BA4\uFF1A\u6E29\u5BA4\u6309\u7AD9\u70B9\u751F\u6548\uFF0C\u6574\u7AD9\u4F5C\u7269\u90FD\u7B97\u3002"));
      for (const gh of greenhouses) {
        const rowEl = ctx.ui.h("div", "gx-item");
        const inside = gh.interiorC === null ? "\u65AD\u7535" : `${gh.interiorC}\u2103`;
        rowEl.append(ctx.ui.h("span", "gx-num", `${gh.siteKey} \xB7 ${gh.targetC === null ? "\u81EA\u52A8" : `\u8BBE\u5B9A ${gh.targetC}\u2103`} \xB7 \u5BA4\u5185 ${inside}\uFF08\u5BA4\u5916 ${gh.ambientC ?? "\u2014"}\u2103\uFF09`));
        const slider = ctx.ui.h("input");
        slider.type = "range";
        slider.value = gh.targetC === null ? "0" : String(gh.targetC);
        slider.min = "-60";
        slider.max = "80";
        slider.step = "1";
        slider.onchange = () => {
          const value = Number(slider.value);
          void act("install", [{ id: "setpoint", site: gh.siteKey, tempC: value === 0 ? "auto" : value }]);
        };
        rowEl.append(slider);
        list.append(rowEl);
      }
      for (const planter of f.planters ?? []) {
        const rowEl = ctx.ui.h("div", "gx-item");
        rowEl.append(ctx.ui.h("span", "gx-num", `${planter.key} \xB7 ${planter.plants}/3${planter.ripe > 0 ? ` \xB7 ${planter.ripe} \u719F` : ""}`));
        rowEl.append(ctx.ui.h("span", "gx-dim", planter.powered ? `\u901A\u7535 \xB7 \u5BA4\u5916 ${planter.ambientC ?? "\u2014"}\u2103` : "\u65AD\u7535\uFF08\u8DDF\u5BA4\u5916\uFF09"));
        list.append(rowEl);
      }
      houseCard.append(list);
      const build = ctx.ui.h("div", "gx-row");
      for (const [kind, label] of [
        ["greenhouse", "\u5EFA\u6E29\u5BA4\u6838\u5FC3"],
        ["planter", "\u5EFA\u79CD\u690D\u76C6"],
        ["fence", "\u5EFA\u56F4\u680F"],
        ["scarecrow", "\u5EFA\u7A3B\u8349\u4EBA"],
        ["feed_trough", "\u5EFA\u5582\u98DF\u69FD"]
      ]) {
        build.append(ctx.ui.button(label, { size: "sm", onClick: () => void act("install", [{ id: kind, site: siteKey }]) }));
      }
      houseCard.append(build);
    };
    const render = () => {
      shell.update(state);
      if (!state || state.locked) {
        empty.textContent = emptyText(state);
        for (const card2 of [sitesCard, cropsCard, seedsCard, houseCard]) card2.hidden = true;
        return;
      }
      empty.textContent = "";
      for (const card2 of [sitesCard, cropsCard, seedsCard, houseCard]) card2.hidden = false;
      if (!siteKey || !(state.flora?.sites ?? []).some((site) => site.key === siteKey)) {
        siteKey = state.flora?.sites[0]?.key ?? "";
      }
      renderSites();
      renderCrops();
      renderSeeds();
      renderHouse();
    };
    state = await ctx.invoke("state", []);
    render();
  }
};
var farm_default = panel3;

// src/webui/panels/industry.ts
function num4(value, digits = 0) {
  return value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
var KINDS = [
  ["", "\u519C\u4E1A\u4E0E\u98DF\u7269"],
  ["greenhouse", "\u6E29\u5BA4\u6838\u5FC3"],
  ["planter", "\u79CD\u690D\u76C6"],
  ["pump", "\u62BD\u6C34\u673A"],
  ["purifier", "\u51C0\u6C34\u5668"],
  ["kiln", "\u70AD\u7A91"],
  ["sealer", "\u5C01\u88C5\u5668"],
  ["mutation_room", "\u8BF1\u53D8\u5BA4"],
  ["feed_trough", "\u5582\u98DF\u69FD"],
  ["fence", "\u56F4\u680F"],
  ["scarecrow", "\u7A3B\u8349\u4EBA"],
  ["biome_changer", "\u7FA4\u7CFB\u6539\u53D8\u5668"],
  ["", "\u4ED3\u50A8\u4E0E\u7269\u6D41"],
  ["warehouse", "\u4ED3\u5E93"],
  ["cold_store", "\u51B7\u5E93"],
  ["inert_room", "\u60F0\u6027\u6C14\u4F53\u5BA4"],
  ["terminal", "\u4EA4\u6613\u7EC8\u7AEF"],
  ["storage_terminal", "\u4ED3\u50A8\u7EC8\u7AEF"],
  ["arm", "\u673A\u68B0\u81C2"],
  ["drone_cluster", "\u65E0\u4EBA\u673A\u96C6\u7FA4"],
  ["rocket", "\u706B\u7BAD"],
  ["", "\u7535\u529B\u4E0E\u5DE5\u4E1A"],
  ["rectifier", "\u6574\u6D41\u7535\u5854"],
  ["wind", "\u98CE\u529B\u53D1\u7535\u7AD9"],
  ["fire", "\u706B\u529B\u53D1\u7535\u7AD9"],
  ["converter", "\u6C14\u6DB2\u8F6C\u6362\u673A"],
  ["atmo_extractor", "\u5927\u6C14\u63D0\u53D6\u673A"],
  ["miner", "\u91C7\u77FF\u673A"],
  ["", "\u751F\u547D\u4E0E\u4EBA\u4E8B"],
  ["habitat", "\u5C45\u6240"],
  ["duty", "\u503C\u73ED\u7EC8\u7AEF"],
  ["carrier", "\u7A7A\u5929\u6BCD\u8230"],
  ["", "\u65C5\u6E38\u7EBF"],
  ["tourism_dock", "\u89C2\u5149\u5854\u53F0\uFF08\u65C5\u6E38\uFF09"],
  ["visitor_lodge", "\u8BBF\u5BA2\u9A7F\u7AD9\uFF08\u65C5\u6E38\uFF09"],
  ["tour_line", "\u89C2\u5149\u7EBF\u8DEF\u7AD9\uFF08\u65C5\u6E38\uFF09"],
  ["souvenir", "\u7EAA\u5FF5\u54C1\u5E97\uFF08\u65C5\u6E38\uFF09"],
  ["", "\u79D1\u6280\u7EBF"],
  ["recruit_office", "\u62DB\u52DF\u7AD9\uFF08\u79D1\u6280\uFF09"],
  ["staff_housing", "\u5458\u5DE5\u516C\u5BD3\uFF08\u79D1\u6280\uFF09"],
  ["fab", "\u6676\u5706\u5382\uFF08\u79D1\u6280\uFF09"],
  ["compute_array", "\u8BA1\u7B97\u9635\u5217\uFF08\u79D1\u6280\uFF09"],
  ["heavy_water", "\u91CD\u6C34\u63D0\u53D6\u5668\uFF08\u79D1\u6280\uFF09"],
  ["enrichment", "\u5BCC\u96C6\u5854\uFF08\u79D1\u6280\uFF09"],
  ["", "\u5B89\u88C5\u4EF6\uFF08\u4E0D\u8FDB\u65BD\u5DE5\u961F\u5217\uFF0C\u88C5\u5B8C\u7ACB\u5373\u53EF\u7528\uFF09"],
  ["sail", "\u592A\u9633\u80FD\u5E06"],
  ["monitor", "\u73AF\u5883\u76D1\u6D4B\u5668"],
  ["counter", "\u51CC\u65E5\u8BA1\u6570\u5668"],
  ["cooler", "\u5236\u51B7\u6838\u5FC3\uFF08\u88C5\u5728\u6E29\u5BA4\u4E0A\uFF09"],
  ["heater", "\u5236\u70ED\u6838\u5FC3\uFF08\u88C5\u5728\u6E29\u5BA4\u4E0A\uFF09"],
  ["realism", "\u62DF\u771F\u6838\u5FC3\uFF08\u88C5\u5728\u6E29\u5BA4\u4E0A\uFF09"]
];
var WONDERS = [
  ["sky_ring", "\u5929\u7A79\u73AF"],
  ["under_ice_eye", "\u51B0\u4E0B\u4E4B\u773C"],
  ["silicon_valley", "\u7845\u8C37"],
  ["orbital_mirror", "\u8F68\u9053\u955C\u9635"],
  ["s2_engine", "\u62DF\u9020S2\u673A\u5173"]
];
var panel4 = {
  async mount(ctx) {
    const t = text(ctx.language);
    const shell = createShell(ctx, { title: "\u5DE5\u4E1A", desc: "\u7535\u3001\u5EFA\u7B51\u3001\u5EFA\u9020\u3001\u822A\u884C\u3002\u624B\u6447\u51FA\u6765\u7684\u7535\u5148\u5B58\u8FDB\u7535\u6C60\u3002" });
    let state = null;
    const empty = ctx.ui.h("div", "gx-empty");
    const msg = ctx.ui.h("div", "gx-msg");
    msg.hidden = true;
    const powerCard = ctx.ui.h("div", "gx-card");
    const buildCard = ctx.ui.h("div", "gx-card");
    const listCard = ctx.ui.h("div", "gx-card");
    const travelCard = ctx.ui.h("div", "gx-card");
    const wonderCard = ctx.ui.h("div", "gx-card");
    shell.body.append(empty, msg, powerCard, buildCard, listCard, travelCard, wonderCard);
    const showMsg = (value, bad = false) => {
      msg.textContent = value;
      msg.className = bad ? "gx-msg gx-bad" : "gx-msg gx-ok";
      msg.hidden = false;
    };
    const act = async (method, args = []) => {
      try {
        const result = await ctx.invoke(method, args);
        if (result && typeof result === "object" && "power" in result) {
          state = result;
          const inner = result.text;
          if (inner) showMsg(inner);
        } else {
          const payload = result;
          showMsg(payload?.text ?? String(result));
          state = await ctx.invoke("state", []);
        }
      } catch (e) {
        showMsg(errorText(e), true);
      }
      render();
    };
    const head = (title, ...extra) => {
      const bar2 = ctx.ui.h("div", "gx-row");
      bar2.append(ctx.ui.h("span", "gx-card-head", title), ctx.ui.h("span", "gx-gap"), ...extra);
      return bar2;
    };
    const renderPower = () => {
      powerCard.replaceChildren();
      const power = state?.power;
      if (!power) return;
      const ratio = power.capacityKj > 0 ? power.energyKj / power.capacityKj : 0;
      const press = ctx.ui.button("\u624B\u6447\u4E00\u6B21", { size: "sm", variant: "primary", onClick: () => void act("press", []) });
      const sail = ctx.ui.button("\u5EFA\u592A\u9633\u80FD\u5E06", { size: "sm", onClick: () => void act("install", [{ id: "sail" }]) });
      const monitor = ctx.ui.button("\u88C5\u73AF\u5883\u76D1\u6D4B\u5668", { size: "sm", onClick: () => void act("monitor", []) });
      powerCard.append(head("\u80FD\u91CF\u4E0E\u8BBE\u5907", press, sail, monitor));
      powerCard.append(
        ctx.ui.h("div", "gx-row", `\u26A1 ${num4(power.energyKj)} / ${num4(power.capacityKj)} kJ\uFF08${Math.round(ratio * 100)}%\uFF09`),
        ctx.ui.h("div", "gx-row", `\u94A8 ${num4(power.tungsten)} kg \xB7 \u592A\u9633\u80FD\u5E06 ${power.sails} \u53F0`)
      );
      if (power.grid) {
        powerCard.append(
          ctx.ui.h("div", "gx-row", `\u7535\u7F51 ${num4(power.grid.storedKj)} / ${num4(power.grid.capacityKj)} kJ \xB7 ${power.grid.hasTower ? power.grid.reachable ? "\u5728\u7535\u5854\u65C1\uFF08\u53EF\u642C\u7535\uFF09" : "\u7535\u5854\u5728\u522B\u5904" : "\u6CA1\u6709\u7535\u5854"}`)
        );
        const kjInput = ctx.ui.input({ type: "number", value: "10000" });
        kjInput.min = "100";
        kjInput.style.width = "90px";
        const gridIn = ctx.ui.button("\u5B58\u8FDB\u7535\u7F51", {
          size: "sm",
          onClick: () => void act("storeDo", [{ action: "grid_in", kj: Number(kjInput.value) || 1e4 }])
        });
        const gridOut = ctx.ui.button("\u4ECE\u7535\u7F51\u53D6", {
          size: "sm",
          onClick: () => void act("storeDo", [{ action: "grid_out", kj: Number(kjInput.value) || 1e4 }])
        });
        gridIn.disabled = !power.grid.hasTower || !power.grid.reachable;
        gridOut.disabled = gridIn.disabled;
        const gridRow = ctx.ui.h("div", "gx-row");
        gridRow.append(kjInput, gridIn, gridOut);
        powerCard.append(ctx.ui.h("div", "gx-row", "\u7535\u7F51\u642C\u7535\uFF08\u4E00\u6B21\u6700\u591A 10,000 kJ\uFF09"), gridRow);
      }
    };
    const renderBuild = () => {
      const select = ctx.ui.select({ options: KINDS.map(([value, label]) => ({ value, label })) });
      const button = ctx.ui.button("\u5EFA\u5728\u811A\u4E0B", {
        size: "sm",
        variant: "primary",
        onClick: () => void act("install", [{ id: select.value }])
      });
      buildCard.replaceChildren(head("\u5EFA\u9020", select, button));
      if (state?.builds.length) {
        buildCard.append(
          ctx.ui.h("div", "gx-faint", `\u65BD\u5DE5\u4E2D\uFF1A${state.builds.map((b) => `${b.label}\uFF08\u8FD8\u5269 ${num4(b.leftHomeHours, 1)} \u65F6\uFF09`).join(" \xB7 ")}`)
        );
      } else {
        buildCard.append(ctx.ui.h("div", "gx-faint", `\u65BD\u5DE5\u961F\u5217 ${state?.builds.length ?? 0} / ${state?.buildSlots ?? 1}`));
      }
    };
    const renderList = () => {
      listCard.replaceChildren(head("\u5DF2\u5EFA\u5EFA\u7B51"));
      const list = ctx.ui.h("div", "gx-list");
      for (const item of state?.structures ?? []) {
        const rowEl = ctx.ui.h("div", "gx-item");
        rowEl.append(ctx.ui.h("span", "gx-num", `${item.label} \xB7 ${item.siteKey}`));
        if (item.capKg > 0) rowEl.append(ctx.ui.h("span", "gx-dim", `${num4(item.usedKg, 1)} / ${num4(item.capKg)} kg`));
        if (item.interiorC !== void 0) rowEl.append(ctx.ui.h("span", "gx-dim", `\u5BA4\u5185 ${item.interiorC}\u2103`));
        if (item.armText) rowEl.append(ctx.ui.h("span", "gx-dim", item.armText));
        if (item.dutyText) rowEl.append(ctx.ui.h("span", "gx-dim", item.dutyText));
        rowEl.append(
          ctx.ui.button("\u8D70\u8FC7\u53BB", { size: "sm", onClick: () => void act("move", [{ latDeg: item.latDeg, lonDeg: item.lonDeg }]) })
        );
        list.append(rowEl);
      }
      if ((state?.structures ?? []).length === 0) list.append(ctx.ui.h("div", "gx-empty", "\u8FD8\u6CA1\u6709\u5EFA\u7B51\u3002"));
      listCard.append(list);
    };
    const renderTravel = () => {
      travelCard.replaceChildren(head("\u8DE8\u661F\u822A\u884C"));
      const list = ctx.ui.h("div", "gx-chips");
      for (const body of state?.bodies ?? []) {
        if (body.kind === "moon") continue;
        list.append(
          ctx.ui.button(body.label, {
            size: "sm",
            onClick: () => void act("move", [{ kind: "interstellar", target: body.key }])
          })
        );
      }
      travelCard.append(list, ctx.ui.h("div", "gx-faint", "\u8981\u5148\u628A\u3010\u673A\u52A8\u6838\u5FC3\u3011\u4FEE\u597D\u3001\u5E76\u4E14\u770B\u5F97\u89C1\uFF08\u89C2\u661F\uFF09\u6216\u8005\u624B\u91CC\u6709\u661F\u56FE\u3002"));
    };
    const renderWonders = () => {
      wonderCard.replaceChildren(head("\u5947\u89C2"));
      const charter = state?.power?.charter;
      if (!charter || charter.charter === null) {
        wonderCard.append(ctx.ui.h("div", "gx-faint", "\u8FD8\u6CA1\u4E70\u6267\u7167\uFF1A\u53BB\u300C\u5546\u5E97\u300D\u4E70\u4E00\u5F20\u661F\u9645\u5E7F\u64AD\u3002"));
        return;
      }
      if (charter.wonder) {
        wonderCard.append(ctx.ui.h("div", "gx-row", `${charter.wonder.label} \xB7 ${Math.round(charter.wonder.progress * 100)}%\uFF08\u65AD\u7535\u4F1A\u70C2\u5C3E\uFF09`));
      } else {
        const chips = ctx.ui.h("div", "gx-chips");
        for (const [id, label] of WONDERS) {
          chips.append(ctx.ui.button(`\u9020${label}`, { size: "sm", onClick: () => void act("wonder", [{ id }]) }));
        }
        wonderCard.append(chips);
      }
      if (charter.wonders.length > 0) wonderCard.append(ctx.ui.h("div", "gx-faint", `\u5DF2\u843D\u6210\uFF1A${charter.wonders.join(" \xB7 ")}`));
    };
    const render = () => {
      shell.update(state);
      if (!state || state.locked) {
        empty.textContent = emptyText(state);
        for (const card2 of [powerCard, buildCard, listCard, travelCard, wonderCard]) card2.hidden = true;
        return;
      }
      empty.textContent = "";
      for (const card2 of [powerCard, buildCard, listCard, travelCard, wonderCard]) card2.hidden = false;
      renderPower();
      renderBuild();
      renderList();
      renderTravel();
      renderWonders();
    };
    state = await ctx.invoke("state", []);
    render();
  }
};
var industry_default = panel4;

// src/webui/panels/life.ts
function num5(value, digits = 0) {
  return value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
var panel5 = {
  async mount(ctx) {
    const t = text(ctx.language);
    const shell = createShell(ctx, { title: "\u751F\u547D\u4E0E\u4EBA\u4E8B", desc: "\u4EBA\u53E3\u3001\u5C45\u6240\u3001\u4EBA\u624B\u91CC\u5728\u5E72\u4EC0\u4E48\u3002\u53EB\u9192\u4E4B\u540E\u4ED6\u4EEC\u8981\u5403\u8981\u559D\u3002" });
    let state = null;
    const empty = ctx.ui.h("div", "gx-empty");
    const msg = ctx.ui.h("div", "gx-msg");
    msg.hidden = true;
    const peopleCard = ctx.ui.h("div", "gx-card");
    const houseCard = ctx.ui.h("div", "gx-card");
    const protocolCard = ctx.ui.h("div", "gx-card");
    shell.body.append(empty, msg, peopleCard, houseCard, protocolCard);
    const showMsg = (value, bad = false) => {
      msg.textContent = value;
      msg.className = bad ? "gx-msg gx-bad" : "gx-msg gx-ok";
      msg.hidden = false;
    };
    const act = async (method, args = []) => {
      try {
        const result = await ctx.invoke(method, args);
        if (result && typeof result === "object" && "power" in result) {
          state = result;
          const inner = result.text;
          if (inner) showMsg(inner);
        } else {
          const payload = result;
          showMsg(payload?.text ?? String(result));
          state = await ctx.invoke("state", []);
        }
      } catch (e) {
        showMsg(errorText(e), true);
      }
      render();
    };
    const head = (title, ...extra) => {
      const bar2 = ctx.ui.h("div", "gx-row");
      bar2.append(ctx.ui.h("span", "gx-card-head", title), ctx.ui.h("span", "gx-gap"), ...extra);
      return bar2;
    };
    const renderPeople = () => {
      peopleCard.replaceChildren();
      if (!state) return;
      const awake = state.habitats.reduce((sum, h) => sum + h.awake, 0);
      const capacity = state.habitats.length * 20;
      const sleepers = state.power?.ship?.sleepers ?? 0;
      const labor = Math.floor(awake / 5);
      const wake = ctx.ui.button("\u53EB\u9192\u4E00\u6279", {
        size: "sm",
        variant: "primary",
        onClick: () => void act("wake", [])
      });
      peopleCard.append(head("\u4EBA\u53E3", wake));
      peopleCard.append(
        ctx.ui.h("div", "gx-row", `\u5E38\u4F4F ${num5(awake)} / ${num5(capacity)} \xB7 \u4F11\u7720\u8231 ${num5(sleepers)} \u4EBA \xB7 \u4EBA\u624B ${num5(labor)} \u4EFD\uFF08\u6BCF 5 \u4EBA\u4E00\u4EFD\uFF09`)
      );
      const ship = state.power?.ship;
      if (ship && ship.sleepers > 0) {
        const hours = ship.hoursLeft === null ? "\u2014" : `${num5(ship.hoursLeft)} \u6BCD\u661F\u65F6`;
        peopleCard.append(ctx.ui.h("div", "gx-faint", `\u8231\u91CC\uFF1A\u7CAE ${num5(ship.food, 1)} kg \xB7 \u6C34 ${num5(ship.water)} L \xB7 \u6C27 ${num5(ship.oxygen, 1)} kg \xB7 \u8FD8\u80FD\u6491 ${hours}`));
        peopleCard.append(ctx.ui.h("div", "gx-faint", "\u8231\u7A7A\u4E86\u4E0D\u4F1A\u81EA\u52A8\u53BB\u4ED3\u5E93\u62FF\u8D27\uFF1A\u8865\u8231\u7528\u4ED3\u5E93\u7684 deposit\uFF0Cbuilding \u586B\u300Cpod\u300D\u3002"));
      }
      if (awake > 0) {
        peopleCard.append(ctx.ui.h("div", "gx-faint", "\u4EBA\u624B\u8981\u300C\u503C\u73ED\u7EC8\u7AEF\u300D\u624D\u4F1A\u5E72\u6D3B\uFF1A\u5EFA\u7EC8\u7AEF\u3001\u7ED1\u5C45\u6240\u4E0E\u4ED3\u5E93\uFF0C\u7136\u540E\u6BCF\u5929\u81EA\u52A8\u6536\u79CD\u65BD\u80A5\u3002"));
      }
    };
    const renderHouses = () => {
      houseCard.replaceChildren(head("\u5C45\u6240"));
      const list = ctx.ui.h("div", "gx-list");
      if ((state?.habitats ?? []).length === 0) list.append(ctx.ui.h("div", "gx-empty", "\u8FD8\u6CA1\u6709\u5C45\u6240\uFF1A\u5148\u5EFA\u4E00\u5EA7\uFF08\u4EBA\u53EA\u63A5\u53D7 5\u201332\u2103 \u7684\u5BA4\u5185\uFF09\u3002"));
      for (const habitat of state?.habitats ?? []) {
        const rowEl = ctx.ui.h("div", "gx-item");
        rowEl.append(ctx.ui.h("span", "gx-num", `${habitat.nickname} \xB7 ${habitat.awake}/${habitat.awake + habitat.dormant} \u4EBA`));
        rowEl.append(
          ctx.ui.h("span", "gx-dim", `\u7CAE ${num5(habitat.food, 1)} \xB7 \u6C34 ${num5(habitat.water)} \xB7 \u6C27 ${num5(habitat.oxygen, 1)} \xB7 \u8FD8\u80FD\u6491 ${num5(habitat.hoursLeft)} \u65F6`)
        );
        const structure = (state?.structures ?? []).find((item) => item.siteKey && item.kind === "habitat" && item.interiorC !== void 0);
        if (structure?.interiorC !== void 0) {
          const tone = structure.comfort === "ok" ? "gx-ok" : "gx-warn";
          rowEl.append(ctx.ui.h("span", tone, `\u5BA4\u5185 ${structure.interiorC}\u2103`));
        }
        list.append(rowEl);
      }
      houseCard.append(list);
    };
    const renderProtocol = () => {
      protocolCard.replaceChildren(head("\u534F\u8BAE\u8FDB\u5EA6"));
      const protocol = state?.protocol;
      if (!protocol) {
        protocolCard.append(ctx.ui.h("div", "gx-faint", "\u534F\u8BAE\u6E05\u5355\u5728\u300C\u534F\u8BAE\u300D\u9875\u7B7E\u3002"));
        return;
      }
      protocolCard.append(ctx.ui.h("div", "gx-row", `${protocol.done} / ${protocol.total} \u6761 \xB7 ${protocol.awakened ? "\u5DF2\u7ECF\u53EB\u9192" : protocol.complete ? "\u53EF\u4EE5\u53EB\u9192\u4E86" : "\u8FD8\u5DEE\u51E0\u6761"}`));
      const undone = protocol.tasks.filter((task) => !task.done).slice(0, 4);
      const list = ctx.ui.h("div", "gx-list");
      for (const task of undone) {
        const rowEl = ctx.ui.h("div", "gx-item");
        rowEl.append(ctx.ui.h("span", "gx-warn", "\u25CF"), ctx.ui.h("span", "gx-num", task.title), ctx.ui.h("span", "gx-faint", task.progress));
        list.append(rowEl);
      }
      if (undone.length === 0) list.append(ctx.ui.h("div", "gx-ok", "\u6E05\u5355\u5DF2\u7ECF\u5168\u7EFF\u3002"));
      protocolCard.append(list);
    };
    const render = () => {
      shell.update(state);
      if (!state || state.locked) {
        empty.textContent = emptyText(state);
        for (const card2 of [peopleCard, houseCard, protocolCard]) card2.hidden = true;
        return;
      }
      empty.textContent = "";
      for (const card2 of [peopleCard, houseCard, protocolCard]) card2.hidden = false;
      renderPeople();
      renderHouses();
      renderProtocol();
    };
    state = await ctx.invoke("state", []);
    render();
  }
};
var life_default = panel5;

// src/webui/panels/save.ts
function normalizeSeed(raw) {
  const text2 = raw.trim();
  if (text2 === "") return 20261111;
  return /^\d{1,15}$/.test(text2) ? Number(text2) : text2;
}
var panel6 = {
  async mount(ctx) {
    const shell = createShell(ctx, {
      title: "\u5B58\u6863",
      desc: "\u65B0\u5EFA\u4E00\u5C40\u3001\u5BFC\u5165\u522B\u4EBA\u7684\u5B58\u6863\u3001\u5BFC\u51FA\u8FD9\u4E00\u5C40\u3001\u6216\u8005\u5220\u6389\u91CD\u6765\u3002"
    });
    let state = null;
    const nowCard = ctx.ui.h("div", "gx-card");
    const nowLine = ctx.ui.h("p", "gx-dim");
    nowCard.append(ctx.ui.h("h3", void 0, "\u5F53\u524D\u5B58\u6863"), nowLine);
    const newCard = ctx.ui.h("div", "gx-card");
    const seedInput = ctx.ui.input({ type: "text", value: "20261111", placeholder: "\u6570\u5B57\uFF0C\u6216\u4EFB\u610F\u4E00\u53E5\u8BDD" });
    const starNameInput = ctx.ui.input({ type: "text", value: "\u957F\u5E9A", placeholder: "\u6052\u661F\u540D" });
    const homeNameInput = ctx.ui.input({ type: "text", value: "\u6816\u539F", placeholder: "\u6BCD\u661F\u540D" });
    const starMassLabel = ctx.ui.h("span", "gx-num", "1.00 M\u2609");
    const starMassInput = ctx.ui.h("input");
    starMassInput.type = "range";
    starMassInput.min = "0.15";
    starMassInput.max = "2";
    starMassInput.step = "0.05";
    starMassInput.value = "1";
    starMassInput.oninput = () => {
      starMassLabel.textContent = `${Number(starMassInput.value).toFixed(2)} M\u2609`;
    };
    const shapeLine = ctx.ui.h("p", "gx-dim", "");
    const createButton = ctx.ui.button("\u521B\u4E16", { variant: "primary" });
    let previewTimer;
    const refreshShape = async () => {
      try {
        const shape = await ctx.invoke(
          "preview",
          [normalizeSeed(seedInput.value)]
        );
        shapeLine.textContent = `\u8FD9\u9897\u79CD\u5B50\u4F1A\u957F\u51FA ${shape.planetCount} \u9897\u884C\u661F\uFF08${shape.minPlanets}\u2013${shape.maxPlanets}\uFF09\uFF0C\u6BCF\u9897\u6700\u591A ${shape.maxMoons} \u9897\u536B\u661F\u3002`;
      } catch {
        shapeLine.textContent = "";
      }
    };
    seedInput.oninput = () => {
      if (previewTimer !== void 0) window.clearTimeout(previewTimer);
      previewTimer = window.setTimeout(() => void refreshShape(), 180);
    };
    createButton.onclick = async () => {
      createButton.disabled = true;
      try {
        const next = await ctx.invoke("create", [
          {
            seed: normalizeSeed(seedInput.value),
            starMass: Number(starMassInput.value),
            starName: starNameInput.value.trim() || "\u6052\u661F",
            homeName: homeNameInput.value.trim() || "\u6BCD\u661F"
          }
        ]);
        state = next;
        render();
        void ctx.refresh();
      } catch (error) {
        msg(errorText(error), "bad");
      } finally {
        createButton.disabled = false;
      }
    };
    const formRows = ctx.ui.h("div", "gx-rows");
    formRows.append(
      row2(ctx, "\u79CD\u5B50", seedInput),
      row2(ctx, "\u6052\u661F\u8D28\u91CF", (() => {
        const wrap = ctx.ui.h("div", "gx-row");
        wrap.append(starMassInput, starMassLabel);
        return wrap;
      })()),
      row2(ctx, "\u6052\u661F\u540D", starNameInput),
      row2(ctx, "\u6BCD\u661F\u540D", homeNameInput)
    );
    newCard.append(ctx.ui.h("h3", void 0, "\u65B0\u5EFA\u5B58\u6863\uFF08\u521B\u4E16\uFF09"), formRows, shapeLine, createButton);
    const importCard = ctx.ui.h("div", "gx-card");
    const importInput = ctx.ui.h("input");
    importInput.type = "file";
    importInput.accept = "application/json";
    const importButton = ctx.ui.button("\u5BFC\u5165\u8FD9\u4EFD\u5B58\u6863", { size: "sm" });
    importButton.onclick = async () => {
      const file = importInput.files?.[0];
      if (!file) {
        msg("\u5148\u9009\u4E00\u4E2A .json \u6587\u4EF6\u3002", "bad");
        return;
      }
      importButton.disabled = true;
      try {
        const text2 = await file.text();
        const result = await ctx.invoke("import", [text2]);
        msg(result.text, "ok");
        state = await ctx.invoke("state", []);
        render();
        void ctx.refresh();
      } catch (error) {
        msg(errorText(error), "bad");
      } finally {
        importButton.disabled = false;
      }
    };
    importCard.append(ctx.ui.h("h3", void 0, "\u5BFC\u5165"), importInput, importButton);
    const exportCard = ctx.ui.h("div", "gx-card");
    const exportButton = ctx.ui.button("\u5BFC\u51FA\u8FD9\u4E00\u5C40", { size: "sm" });
    exportButton.onclick = async () => {
      exportButton.disabled = true;
      try {
        const result = await ctx.invoke("export", []);
        const blob = new Blob([result.text], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.filename;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 5e3);
        msg(`\u5DF2\u5BFC\u51FA\uFF1A${result.filename}`, "ok");
      } catch (error) {
        msg(errorText(error), "bad");
      } finally {
        exportButton.disabled = false;
      }
    };
    exportCard.append(ctx.ui.h("h3", void 0, "\u5BFC\u51FA"), ctx.ui.h("p", "gx-dim", "\u4E00\u4EFD JSON \u5C31\u662F\u6574\u5C40\uFF1A\u661F\u7CFB\u3001\u5B58\u6863\u3001\u79CD\u5B50\u90FD\u5728\u91CC\u9762\u3002"), exportButton);
    const deleteCard = ctx.ui.h("div", "gx-card");
    const deleteInput = ctx.ui.input({ type: "text", placeholder: "\u8F93\u5165 DELETE \u786E\u8BA4" });
    const deleteButton = ctx.ui.button("\u5220\u6389\u8FD9\u4E00\u5C40", { size: "sm", variant: "primary" });
    deleteButton.onclick = async () => {
      if (deleteInput.value.trim() !== "DELETE") {
        msg("\u8981\u5220\u6863\u8BF7\u5728\u6846\u91CC\u8F93\u5165 DELETE\uFF08\u5927\u5199\uFF09\u3002", "bad");
        return;
      }
      deleteButton.disabled = true;
      try {
        const next = await ctx.invoke("reset", ["DELETE"]);
        state = next;
        deleteInput.value = "";
        render();
        void ctx.refresh();
      } catch (error) {
        msg(errorText(error), "bad");
      } finally {
        deleteButton.disabled = false;
      }
    };
    deleteCard.append(ctx.ui.h("h3", void 0, "\u5220\u9664"), deleteInput, deleteButton);
    const message = ctx.ui.h("p", "gx-msg");
    const msg = (text2, tone) => {
      message.textContent = text2;
      message.className = `gx-msg gx-${tone}`;
    };
    shell.body.append(nowCard, newCard, importCard, exportCard, deleteCard, message);
    function row2(ctx2, label, field3) {
      const line = ctx2.ui.h("div", "gx-row");
      line.append(ctx2.ui.h("span", "gx-dim", label), field3);
      return line;
    }
    function render() {
      const created = !!state && !state.locked;
      nowLine.textContent = state === null ? emptyText(null) : created ? `${state.game?.time ?? "\u2014"} \xB7 ${state.game?.where ?? ""}` : emptyText(state);
      newCard.hidden = created;
      exportCard.hidden = !created;
      deleteCard.hidden = !created;
      importCard.hidden = created;
      shell.update(state);
    }
    try {
      state = await ctx.invoke("state", []);
    } catch (error) {
      msg(errorText(error), "bad");
    }
    render();
    void refreshShape();
  }
};
var save_default = panel6;

// src/webui/panels/upgrade.ts
var upgradePanel = {
  async mount(ctx) {
    const t = text(ctx.language);
    const shell = createShell(ctx, { title: t.upTitle, desc: t.upDesc });
    const cards = ctx.ui.h("div", "gx-list");
    shell.body.append(cards);
    const head = ctx.ui.rowbar();
    const energy = ctx.ui.h("span", "grow", "");
    const refresh = ctx.ui.button(t.upRefresh, {
      size: "sm",
      onClick: () => {
        void load();
      }
    });
    head.append(energy, refresh);
    shell.body.prepend(head);
    const render = (state) => {
      energy.textContent = state.locked ? t.upLocked : `${t.upEnergy}\uFF1A${state.energyKj.toLocaleString("en-US")} kJ`;
      shell.updateLoose(state.locked ? {} : { energyKj: state.energyKj, capacityKj: state.capacityKj });
      cards.textContent = "";
      for (const card2 of state.cards) {
        const box = ctx.ui.h("div", "gx-card");
        const status = card2.status === "ready" ? t.upReady : card2.status === "repairing" ? t.upRepairing : card2.status === "maxed" ? t.upMaxed : t.upBroken;
        const heading = card2.level !== void 0 ? `${card2.label} \xB7 lv${card2.level}${card2.maxLevel ? ` / lv${card2.maxLevel}` : ""}` : card2.label;
        const title = ctx.ui.h("h3", "", `${heading} \xB7 ${status}`);
        title.style.margin = "0 0 6px";
        const flavor = ctx.ui.h("p", "muted", card2.flavor);
        flavor.style.margin = "0 0 8px";
        box.append(title, flavor);
        if (card2.window) {
          const now = ctx.ui.h("p", "", `${t.upWindow}\uFF1A${card2.window}${card2.limitFactor ? `\uFF08${t.upLimit} \xD7${card2.limitFactor}\uFF09` : ""}`);
          now.style.margin = "0 0 6px";
          box.append(now);
        }
        if (card2.status === "repairing") {
          const left = ctx.ui.h("p", "", `${t.upRepairing} \xB7 \u8FD8\u5269 ${card2.leftHomeHours.toFixed(1)} \u6BCD\u661F\u65F6`);
          box.append(left);
          cards.append(box);
          continue;
        }
        if (card2.status === "maxed") {
          if (card2.benefits) box.append(ctx.ui.h("p", "muted", card2.benefits));
          cards.append(box);
          continue;
        }
        const need = ctx.ui.h(
          "p",
          "",
          `${t.upNeed} ${card2.costKj.toLocaleString("en-US")} kJ + ` + card2.materials.map((m) => `${m.name} ${m.needKg} kg\uFF08${m.haveKg} kg\uFF09`).join("\u3001") + ` \xB7 ${card2.buildHours} \u6BCD\u661F\u65F6`
        );
        need.style.margin = "0 0 8px";
        box.append(need);
        if (card2.benefits) {
          const benefit = ctx.ui.h("p", "muted", `${t.upBenefit}\uFF1A${card2.benefits}`);
          benefit.style.margin = "0 0 6px";
          box.append(benefit);
        }
        const button = ctx.ui.button(card2.status === "broken" ? t.upRepair : t.upUpgrade, {
          variant: "primary",
          size: "sm",
          onClick: () => {
            void repair(card2.id, button);
          }
        });
        if (!card2.canRepair) {
          button.disabled = true;
          if (card2.blockers.length > 0) {
            box.append(ctx.ui.h("p", "muted", card2.blockers.join("\uFF1B")));
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
    const refreshHeader = async () => {
      try {
        const full = await ctx.invoke("header");
        shell.update(full);
      } catch {
      }
    };
    void refreshHeader();
    ctx.interval(() => {
      void refreshHeader();
    }, 1e4);
    ctx.interval(() => {
      void load();
    }, 5e3);
  }
};

// src/webui/panels/protocol.ts
var protocolPanel = {
  async mount(ctx) {
    const t = text(ctx.language);
    const shell = createShell(ctx, { title: t.protoTitle, desc: t.protoDesc });
    const head = ctx.ui.rowbar();
    const progress = ctx.ui.h("span", "grow", "");
    const refresh = ctx.ui.button(t.protoRefresh, {
      size: "sm",
      onClick: () => {
        void load();
      }
    });
    head.append(progress, refresh);
    const body = ctx.ui.h("div", "gx-card");
    const habitatBox = ctx.ui.h("div", "gx-card");
    const wakeButton = ctx.ui.button(t.protoWake, {
      variant: "primary",
      onClick: () => {
        void wake(wakeButton);
      }
    });
    wakeButton.hidden = true;
    wakeButton.style.marginTop = "10px";
    const recreateBox = ctx.ui.h("div");
    recreateBox.style.marginTop = "18px";
    recreateBox.hidden = true;
    const recreateRow = ctx.ui.rowbar();
    const recreateSeedInput = ctx.ui.input({ placeholder: "20261111" });
    recreateSeedInput.type = "text";
    recreateSeedInput.style.width = "110px";
    const recreateMassInput = ctx.ui.input({});
    recreateMassInput.type = "range";
    recreateMassInput.min = "0.15";
    recreateMassInput.max = "2";
    recreateMassInput.step = "0.05";
    const recreateMassLabel = ctx.ui.h("span", "mono", "1.00");
    const recreateButton = ctx.ui.button(t.recreateGo, { variant: "primary" });
    recreateRow.append(
      ctx.ui.h("span", "muted", t.recreateSeed),
      recreateSeedInput,
      ctx.ui.h("span", "muted", t.recreateMass),
      recreateMassInput,
      recreateMassLabel,
      recreateButton
    );
    const recreateList = ctx.ui.h("ul", "");
    recreateBox.append(ctx.ui.h("h3", "", t.recreateTitle), ctx.ui.h("p", "muted", t.recreateDesc), recreateRow, recreateList);
    recreateBox.classList.add("gx-card");
    shell.body.append(head, body, habitatBox, wakeButton, recreateBox);
    const paintMass = () => {
      recreateMassLabel.textContent = Number(recreateMassInput.value || "1").toFixed(2);
    };
    recreateMassInput.addEventListener("input", paintMass);
    recreateButton.addEventListener("click", () => {
      void recreate(recreateButton);
    });
    const render = (panel7) => {
      wakeButton.hidden = false;
      progress.textContent = `${t.protoDone} ${panel7.done} / ${panel7.total}`;
      body.textContent = "";
      for (const chapter of panel7.chapters) {
        const heading = ctx.ui.h("h3", "", `${chapter.title} \xB7 ${chapter.done}/${chapter.total}`);
        heading.style.margin = "10px 0 4px";
        body.append(heading);
        for (const task of chapter.tasks) {
          const row2 = ctx.ui.h("div", "", `${task.done ? "\u2713" : "\u25CB"} ${task.title}${task.done ? "" : ` \xB7 ${task.progress}`}`);
          row2.style.padding = "2px 0";
          row2.style.color = task.done ? "var(--muted, #8a8a8a)" : "";
          body.append(row2);
        }
      }
      habitatBox.textContent = "";
      if (panel7.population) {
        const p = panel7.population;
        habitatBox.append(
          ctx.ui.h("h3", "", t.protoPopulation),
          ctx.ui.h(
            "p",
            "",
            `${p.population} / ${p.capacity} \xB7 ${t.protoSleepers} ${p.sleepers} \xB7 ${t.protoLabor} ${p.laborUnits}` + (p.population < p.capacity ? ` \xB7 ${t.protoBirthProgress} ${Math.floor(p.birthHours)} / 192` : "")
          )
        );
      }
      if (panel7.habitat) {
        const h = panel7.habitat;
        habitatBox.append(
          ctx.ui.h("h3", "", `${t.protoHabitat}`),
          ctx.ui.h(
            "p",
            "",
            `${t.protoAwake} ${h.awake} \xB7 ${t.protoDormant} ${h.dormant} \xB7 ${t.protoFood} ${h.food.toFixed(1)} kg \xB7 ${t.protoWater} ${h.water.toFixed(1)} L \xB7 ${t.protoOxygen} ${h.oxygen.toFixed(1)} kg \xB7 ${t.protoHours} ${Number.isFinite(h.hoursLeft) ? `${Math.floor(h.hoursLeft)} \u6BCD\u661F\u65F6` : "\u2014"}`
          )
        );
      }
      recreateBox.hidden = false;
      if (recreateSeedInput.value === "") recreateSeedInput.value = panel7.recreate.seed;
      if (recreateMassInput.value === "") recreateMassInput.value = String(panel7.recreate.starMass);
      paintMass();
      recreateButton.disabled = !panel7.recreate.ready;
      recreateList.textContent = "";
      if (!panel7.recreate.ready) {
        recreateList.append(ctx.ui.h("li", "muted", t.recreateBlocked));
        for (const blocker of panel7.recreate.blockers) recreateList.append(ctx.ui.h("li", "", blocker));
      }
      if (panel7.awakened) {
        wakeButton.disabled = true;
        wakeButton.textContent = t.protoAwakened;
      } else {
        wakeButton.disabled = !panel7.ready || !panel7.habitat;
        wakeButton.textContent = panel7.ready ? t.protoWake : `${t.protoWake}\uFF08${t.protoDone} ${panel7.done}/${panel7.total}\uFF09`;
      }
    };
    const load = async () => {
      try {
        render(await ctx.invoke("state"));
      } catch (error) {
        wakeButton.hidden = true;
        recreateBox.hidden = true;
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
        const panel7 = await ctx.invoke("wake", []);
        render(panel7);
        ctx.ui.toast(t.protoAwakened, "ok");
        void ctx.refresh();
      } catch (error) {
        ctx.ui.toast(errorText(error), "bad");
        button.disabled = false;
      }
    };
    const recreate = async (button) => {
      button.disabled = true;
      try {
        const result = await ctx.invoke("recreate", [
          recreateSeedInput.value,
          Number(recreateMassInput.value)
        ]);
        ctx.ui.toast(t.recreateDone, "ok");
        progress.textContent = result.text;
        await load();
        const refreshHeader = async () => {
          try {
            const full = await ctx.invoke("header");
            shell.update(full);
          } catch {
          }
        };
        void refreshHeader();
        ctx.interval(() => {
          void refreshHeader();
        }, 1e4);
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

// src/webui/panels/shop.ts
var shopPanel = {
  mount(ctx) {
    const t = text(ctx.language);
    const shell = createShell(ctx, { title: t.shopTitle, desc: t.shopDesc });
    const head = ctx.ui.rowbar();
    const statusLine = ctx.ui.msgline();
    const wallet = ctx.ui.h("span", "mono", "");
    const refreshButton = ctx.ui.button("\u5237\u65B0", { size: "sm" });
    head.append(refreshButton, statusLine, wallet);
    const sellBox = ctx.ui.h("div", "gx-card");
    const buyBox = ctx.ui.h("div", "gx-card");
    const orderBox = ctx.ui.h("div", "gx-card");
    shell.body.append(head, sellBox, buyBox, orderBox);
    const fmt = (value) => value.toLocaleString("en-US");
    async function act(method, args) {
      try {
        const result = await ctx.invoke(method, args);
        if (result?.text) ctx.ui.toast(result.text, "ok");
        if (result?.state) render(result.state);
        else await load();
        void ctx.refresh();
      } catch (error) {
        ctx.ui.toast(error instanceof Error ? error.message : String(error), "bad");
      }
    }
    function buyArgs(row2) {
      if (row2.id === "random_seed" || row2.id === "premium_seed") {
        return { kind: row2.id, ...row2.species ? { species: row2.species } : {} };
      }
      if (row2.id === "fertilizer") return { kind: "fertilizer", kg: 5 };
      if (row2.id === "cylinder") return { kind: "cylinder", count: 10 };
      return { kind: row2.id };
    }
    function render(panel7) {
      const open = panel7.open;
      statusLine.textContent = open ? t.shopOpenNow : t.shopClosedNow;
      shell.updateLoose({ energyKj: panel7.energyKj, capacityKj: panel7.capacityKj, credits: panel7.credits, tungsten: panel7.tungsten });
      wallet.textContent = [
        t.shopCredits + " " + fmt(panel7.credits),
        t.shopEnergy + " " + fmt(panel7.energyKj) + " kJ",
        t.shopTungsten + " " + fmt(panel7.tungsten) + " kg",
        t.shopWindowLabel + " " + panel7.window,
        open ? panel7.closedNote ?? "" : t.shopNextOpen(panel7.nextOpenHours)
      ].filter(Boolean).join(" \xB7 ");
      sellBox.replaceChildren(ctx.ui.h("h4", "", t.shopSellHeader));
      for (const row2 of panel7.sellables) {
        const line = ctx.ui.h("div");
        line.style.display = "flex";
        line.style.gap = "8px";
        line.style.alignItems = "center";
        line.append(
          ctx.ui.h("span", "mono", row2.name + " \xB7 " + row2.priceLabel + " \xB7 " + row2.limitLabel),
          ctx.ui.h("span", "muted", t.shopHeld(fmt(row2.held ?? 0)))
        );
        const sell = ctx.ui.button(t.shopSell(row2.name, "1"), {
          size: "sm",
          onClick: () => void act("sell", [{ id: row2.id, amount: 1 }])
        });
        sell.disabled = !open || (row2.held ?? 0) <= 0;
        line.append(sell);
        sellBox.append(line);
      }
      buyBox.replaceChildren(ctx.ui.h("h4", "", t.shopBuyHeader));
      for (const row2 of panel7.buyables) {
        const line = ctx.ui.h("div");
        line.style.display = "flex";
        line.style.gap = "8px";
        line.style.alignItems = "center";
        line.append(ctx.ui.h("span", "mono", row2.name + " \xB7 " + row2.priceLabel + " \xB7 " + row2.limitLabel));
        if (row2.note) line.append(ctx.ui.h("span", "muted", row2.note));
        const buy = ctx.ui.button(t.shopBuy(row2.name), {
          size: "sm",
          onClick: () => void act("buy", [buyArgs(row2)])
        });
        buy.disabled = !open;
        line.append(buy);
        buyBox.append(line);
      }
      orderBox.replaceChildren(ctx.ui.h("h4", "", t.shopOrdersHeader));
      if (panel7.orders.length === 0) {
        orderBox.append(ctx.ui.h("p", "muted", t.shopNoOrders));
      }
      for (const order of panel7.orders) {
        const line = ctx.ui.h("div");
        line.style.display = "flex";
        line.style.gap = "8px";
        line.style.alignItems = "center";
        line.append(ctx.ui.h("span", "mono", order.label));
        if (order.note) line.append(ctx.ui.h("span", "muted", order.note));
        const deliver = ctx.ui.button(t.shopDeliver, { size: "sm", onClick: () => void act("order", [{ id: order.id }]) });
        deliver.disabled = !open;
        line.append(deliver);
        orderBox.append(line);
      }
    }
    async function load() {
      try {
        const panel7 = await ctx.invoke("state", []);
        render(panel7);
      } catch (error) {
        statusLine.textContent = error instanceof Error ? error.message : String(error);
      }
    }
    refreshButton.addEventListener("click", () => void load());
    void load();
    const refreshHeader = async () => {
      try {
        const full = await ctx.invoke("header");
        shell.update(full);
      } catch {
      }
    };
    void refreshHeader();
    ctx.interval(() => {
      void refreshHeader();
    }, 1e4);
  }
};

// src/webui/markdown.ts
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

// src/webui/panels/guide.ts
var guidePanel = {
  mount(ctx) {
    const t = text(ctx.language);
    const shell = createShell(ctx, { title: t.guideTitle, desc: t.guideDesc });
    const searchRow = ctx.ui.rowbar();
    const searchInput = ctx.ui.input({ placeholder: t.guideSearchHint });
    searchInput.type = "text";
    const searchButton = ctx.ui.button(t.guideSearch, { size: "sm" });
    const toolsButton = ctx.ui.button(t.guideTools, { size: "sm" });
    searchRow.append(searchInput, searchButton, toolsButton);
    const chips = ctx.ui.h("div", "gx-card");
    const article = ctx.ui.h("div", "gx-card");
    const hint = ctx.ui.h("p", "muted", t.guideEmpty);
    chips.append(ctx.ui.h("span", "muted", t.guidePick));
    article.append(hint);
    shell.body.append(searchRow, chips, article);
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
        const card2 = renderMarkdown(document, payload.text);
        card2.classList.add("mono");
        article.replaceChildren(card2);
      } catch (error) {
        article.replaceChildren(ctx.ui.h("p", "muted", errorText(error)));
      } finally {
        busy.dispose();
      }
    };
    searchButton.addEventListener("click", () => void search());
    toolsButton.addEventListener("click", () => {
      void (async () => {
        try {
          const payload = await ctx.invoke("tools", []);
          const card2 = renderMarkdown(document, payload.text);
          card2.classList.add("mono");
          article.replaceChildren(card2);
        } catch (error) {
          article.replaceChildren(ctx.ui.h("p", "muted", errorText(error)));
        }
      })();
    });
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
    const refreshHeader = async () => {
      try {
        const full = await ctx.invoke("header");
        shell.update(full);
      } catch {
      }
    };
    void refreshHeader();
    ctx.interval(() => {
      void refreshHeader();
    }, 1e4);
  }
};

// src/webui/client.ts
var bundle = {
  panels: { overview: overview_default, surface: surface_default, farm: farm_default, industry: industry_default, life: life_default, upgrade: upgradePanel, protocol: protocolPanel, shop: shopPanel, guide: guidePanel, save: save_default }
};
var client_default = bundle;
export {
  client_default as default
};
