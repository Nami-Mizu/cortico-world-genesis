import type { ConfigGroup } from 'cortico/core/types.ts';

/** `worlds.genesis` 这一段。 */
export interface GenesisConfigSection {
  enabled: boolean;
  /** 地形补丁的基准半径（km）；实际补丁半径 = viewBaseKm × 该行星的能见度。 */
  viewBaseKm: number;
}

export const GENESIS_DEFAULTS: GenesisConfigSection = {
  enabled: false,
  viewBaseKm: 1500,
};

export const GENESIS_CONFIG_GROUP: ConfigGroup = {
  id: 'world:genesis',
  owner: 'world:genesis',
  schema: {
    type: 'object',
    title: '创世',
    properties: {
      'worlds.genesis.viewBaseKm': {
        type: 'number',
        title: '地形视野（km）',
        description:
          '模型用 genesis_terrain 看「附近」地形时，补丁半径 = 这个定值 × 该行星的能见度（大气越厚、能见度越小）。改完立即生效。',
        'x-hot': true,
      },
    },
  },
};
