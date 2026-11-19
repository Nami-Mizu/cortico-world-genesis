import { GENESIS } from './definition.ts';

export default GENESIS;
import { applyAlgae, breedAt } from './game.ts';
import { growFactorText, inspectPlantText } from './inspect.ts';

export { GENESIS };
export { applyAlgae, breedAt };
export { growFactorText, inspectPlantText };
export type { GenesisConfigSection } from './config.ts';
export type {
  GenesisBody,
  GenesisDraft,
  GenesisPanelClock,
  GenesisPanelFlora,
  GenesisPanelMonitor,
  GenesisPanelPower,
  GenesisPanelState,
  GenesisPlanetRow,
  GenesisSurfaceMap,
} from './panel-types.ts';
export type {
  BiomeId,
  BiomeStat,
  GenesisSpec,
  IsobaricSurface,
  MoonSurface,
  Planet,
  PlanetSurface,
  Star,
  StarSystem,
  SurfaceKind,
  TerrestrialSurface,
} from './model.ts';
export { createSystem, describeGenesisMenu } from './system.ts';
export { formatMoonLine, formatPlanetBlock, formatStarBlock, formatSystemCard } from './card.ts';
export { validateSave, assertSave } from './schema.ts';
export { GenesisStore } from './store.ts';
export { GameStore } from './game-store.ts';
export {
  advanceFlora,
  advanceArms,
  advanceMiners,
  advanceTerminals,
  armsInCycle,
  relinkArm,
  nextFreeSlot,
  routeContainer,
  routedContainers,
  storageRouteText,
  takeBagFromTerminal,
  terminalBags,
  beginBlueprintsUpgrade,
  beginSpectrometerUpgrade,
  blueprintsCard,
  spectrometerCard,
  spectrometerScan,
  oreContentAt,
  oreMinedAt,
  oreRemainingAt,
  oreKey,
  startupEnergyKj,
  buyMerchandise,
  gridCapacityFor,
  gridKeyFor,
  planetHasGrid,
  rectifierAt,
  transferGridEnergy,
  tungstenCostFor,
  beginInterstellar,
  beginSparkPlugUpgrade,
  beginBatteryUpgrade,
  beginSubagentUpgrade,
  batteryCard,
  subagentCard,
  buildQueueSlots,
  buildQueueBlocked,
  energyCapOf,
  beginSurfaceMove,
  beginTelescopeUpgrade,
  buildStructure,
  burnBiomass,
  buySeeds,
  canTravelTo,
  demolishStructure,
  depositTo,
  deployCounter,
  deployMonitor,
  deploySail,
  deserializeGame,
  bodyProbeId,
  displayName,
  foundSite,
  greenhouseClimate,
  harvestAt,
  homePlanetOf,
  installCore,
  nameBody,
  pressGenerator,
  returnHome,
  sellToMerchant,
  serializeGame,
  settlePower,
  sowAt,
  startGame,
  starterBags,
  stargazeAt,
  storeCapacityKg,
  storeWeightKg,
  sunAt,
  surveySite,
  sparkPlugCard,
  telescopeCard,
  tick,
  timeText,
  transitLabel,
  withdrawFrom,
  BUILD_SPECS,
  TUNGSTEN_START,
  BLUEPRINT_TUNGSTEN_FACTOR,
  ORE_PER_CELL_MAX,
  STARTUP_ENERGY_MIN,
  STARTUP_ENERGY_MAX,
  SPECTROMETER_COST_KJ,
  SPECTROMETER_TUNGSTEN,
  SPECTROMETER_RANGE_KM,
  SPECTROMETER_COOLDOWN_HOME_HOURS,
  GRID_TAP_KJ_PER_CALL,
  GRID_TAP_RANGE_KM,
  GRID_LOSS_FACTOR,
  TUNGSTEN_PRICE_CREDITS,
  ENERGY_BLOCK_KJ,
  ENERGY_BLOCK_CREDITS,
  DRONE_KJ_PER_KG,
  ROCKET_CAPACITY_KG,
  WAREHOUSE_CAPACITY_KG,
  TERMINAL_BUFFER_KG,
  TERMINAL_BAG_SLOTS,
  STORAGE_TERMINAL_COST_KJ,
  STORAGE_TERMINAL_TUNGSTEN,
  STORAGE_TERMINAL_KJ_PER_HOUR,
  ARM_COST_KJ,
  ARM_TUNGSTEN,
  ARM_KJ_PER_HOUR,
  ARM_KG_PER_HOUR,
  ARM_KJ_PER_KG,
  ARM_RANGE_KM,
  ARM_MAX_PER_PLANET,
  type GameState,
  type Location,
} from './game.ts';
export {
  SPECIES,
  SPECIES_IDS,
  NUTRIENT_LABELS,
  NUTRIENT_NEEDS,
  RESOURCE_LABELS,
  ASH_PER_KG,
  advancePlant,
  burnKj,
  newPlant,
  randomGenes,
  type Genes,
  type NutrientStock,
  type PlantRecord,
  type SpeciesId,
} from './flora.ts';
export { creditTier, dailyLimitFor, buildSlotsFor, nextSubagentLevel, subagentLevel, nextSparkPlugLevel, nextTelescopeLevel, shopOpen, shopWindowText, sparkPlugLevel, sparkPlugOutputKj, telescopeLevel, telescopeLimitFactor, telescopeWindow, GENERATOR_BASE_KJ, SELL_GOODS, BUY_GOODS, SPARK_PLUG_LEVELS, SPARK_PLUG_MAX_LEVEL, TELESCOPE_LEVELS, TELESCOPE_MAX_LEVEL, BATTERY_LEVELS, BATTERY_MAX_LEVEL, BATTERY_BASE_CAPACITY_KJ, batteryLevel, nextBatteryLevel, batteryCapacityKj, SUBAGENT_LEVELS, SUBAGENT_MAX_LEVEL, BASE_BUILD_SLOTS } from './trade.ts';
export { MONITOR_COST_KJ, SAIL_COST_KJ, SAIL_KJ_PER_HOME_HOUR, SAIL_MAX_PER_PLANET } from './power.ts';
export { daylightHomeHoursAt, planetSunBody, sunPosition, type SunBody, type SunPosition } from './sun.ts';
export {
  formatTime,
  describeCalendar,
  habitabilityScore,
  mostHabitable,
  type HomeCalendar,
} from './clock.ts';
export { stargaze, stargazeText, type StargazeResult } from './stargaze.ts';
export {
  cellsInRadius,
  effectiveBiome,
  targetBiomeFor,
  terraClimate,
  terraKey,
  terraProgress,
  terraSummary,
  BIOME_CHANGER_RADIUS_KM,
  TERRA_CELL_KJ_PER_HOUR,
  TERRA_CONVERT_HOME_HOURS,
  TERRA_REVERT_HOME_HOURS,
  type TerraCell,
  type TerraMap,
} from './terra.ts';
export { guideText, guideTopics, GUIDE_TOPICS, type GuideTopic } from './guide.ts';
export { infoText, searchInfo, scoreInfo, formatInfoEntry, INFO_ENTRIES, INFO_KIND_LABELS, type InfoEntry, type InfoKind } from './info.ts';
export {
  DORMANT_FRACTION,
  HABITAT_CAP,
  PEOPLE_PER_HABITAT,
  CYLINDER_COST_CREDITS,
  cylinderPriceCredits,
  type AtmosphereReading,
} from './life.ts';
export { HABITAT_COMFORT_C, HABITAT_CLIMATE_PULL_C, habitatInteriorC, habitatComfortIssue } from './game.ts';
export { structureInteriorC, interiorComfortable, STAFF_COMFORT_C, LODGE_COMFORT_C, S2_ENGINE_MAX, S2_COMPUTE_PER_HOUR, S2_KJ_PER_COMPUTE } from './game.ts';
export { ordersForDay, GENE_LABELS, type Order } from './orders.ts';
export { PROTOCOL_TASKS, CHAPTER_TITLES, protocolStatus, protocolDone, protocolComplete } from './protocol.ts';

export { ProfileStore, PROFILE_SCHEMA, FUEL_RESOURCE, RECREATE_ENERGY_KJ, RECREATE_FUEL_KG, RECREATE_SAMPLES, consumeRecreate, exportProfile, recreateBlockers } from './profile.ts';
export type { Profile, ProfileStoreOptions } from './profile.ts';
