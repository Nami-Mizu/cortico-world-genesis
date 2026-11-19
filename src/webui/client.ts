/** 面板入口：把各页签拼成一份 bundle（每个 page 一个 `WebUiPanel`）。 */
import type { WebUiClientBundle } from 'cortico/web/shared/client-panel.ts';
import overview from './panels/overview.ts';
import surface from './panels/surface.ts';
import farm from './panels/farm.ts';
import industry from './panels/industry.ts';
import life from './panels/life.ts';
import savePanel from './panels/save.ts';
import { upgradePanel as upgrade } from './panels/upgrade.ts';
import { protocolPanel as protocol } from './panels/protocol.ts';
import { shopPanel as shop } from './panels/shop.ts';
import { guidePanel as guide } from './panels/guide.ts';

const bundle: WebUiClientBundle = {
  panels: { overview, surface, farm, industry, life, upgrade, protocol, shop, guide, save: savePanel },
};

export default bundle;
