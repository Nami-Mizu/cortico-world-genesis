# genesis 存档格式（schema 4）

这份文档定义 `genesis` 对外唯一的接口：一份 `system.json`。面板、工具、CLI、以后的步行引擎都读它，
所以格式的每个字段、单位、范围都写在这里；`src/schema.ts` 里有一份**同口径的运行时校验**，
文档与校验不一致时以校验为准（测试会跑校验）。

- 文件位置：`<dataDir>/genesis/system.json`
- 编码：UTF-8，`JSON.stringify(save, null, 2) + "\n"`
- 版本：顶层 `schema` 是整数，当前为 `4`。**任何字段改名/删字段/改单位都要升这个数字**；
  只新增可选字段不升版本。
- schema 1 → 2：行星多了 `surface`（岩石行星的地表网格）。schema 1 旧档不能读，删档重开。
- schema 2 → 3：**所有天体都有地表了**——气态/冰巨星的 `surface` 变成「可活动区域」（等气压面，
  群系 = 风暴强度），卫星也多了 `surface`（固定「卫星」群系）。schema 2 旧档不能读，删档重开。
- schema 3 → 4：岩石行星的地表多了 `wetness` / `fertility` 两套网格（生成时由离海距离 BFS 派生，
  供站点种植用），`generator` 升 `genesis-m3`。schema 3 旧档不能读，删档重开。
- 机器可读版本：`schema/system.schema.json`（JSON Schema 2020-12）。

## 顶层

```jsonc
{
  "schema": 4,
  "createdAt": "2026-11-11T17:31:12.000Z",   // ISO 8601，写档时间
  "spec":    { "seed": 20261111, "starMass": 1, "planetCount": 3, "maxMoons": 2 },
  "system":  { "...": "见下" }
}
```

`spec` 是 Agent 在创世时选的四个旋钮，写进存档后锁定；`system` 是由它确定的系统。
读档时会用 `spec` 重新生成一遍并与 `system.specHash` 比对——对不上就说明被改过，拒绝读取。

### spec

| 字段 | 类型 | 范围 | 含义 |
| --- | --- | --- | --- |
| `seed` | 整数 | 1 … 2147483647 | 随机种子；同种子同参数必得同一个系统 |
| `starMass` | 数字 | 0.15 … 2.0 | 恒星质量，单位太阳质量 M☉ |
| `planetCount` | 整数 | 1 … 8 | 行星数量 |
| `maxMoons` | 整数 | 0 … 4 | **每颗行星**的卫星数上限（实际 0 … maxMoons 颗） |

## system

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `spec` | 对象 | 与顶层 `spec` 相同（冗余一份，便于单独拿着 `system` 重算） |
| `specHash` | 字符串 | 8 位小写十六进制；由 spec 的规范串算 FNV-1a |
| `generator` | 字符串 | 生成器版本，当前 `genesis-m3` |
| `star` | 对象 | 恒星 |
| `planets` | 数组 | 由内到外，`aAU` 严格升序 |

### star

| 字段 | 单位 | 含义 |
| --- | --- | --- |
| `massSun` | M☉ | 质量 |
| `luminositySun` | L☉ | 光度（主序近似 `L = M^3.5`） |
| `radiusSun` | R☉ | 半径（`R = M^0.8`） |
| `teffK` | K | 有效温度（斯特藩-玻尔兹曼反解） |
| `spectralClass` | — | `M / K / G / F / A`（按 teff 分档） |
| `lifetimeGyr` | Gyr | 主序寿命近似 `10 · M / L` |
| `hzInnerAU` / `hzOuterAU` | AU | 保守宜居带 `0.95√L … 1.37√L` |

### planet

| 字段 | 单位 | 含义 |
| --- | --- | --- |
| `id` | — | 全局唯一，`planet-<n>` |
| `name` | — | 显示名，`行星 I` 这类 |
| `kind` | — | `rocky / ice / gas` |
| `aAU` | AU | 轨道半长轴 |
| `periodDays` | 天 | 公转周期（开普勒第三定律，与 `aAU`、恒星质量自洽） |
| `eccentricity` | — | 0 … 0.12 |
| `inclinationDeg` | 度 | 相对参考面，很小 |
| `massEarth` | M⊕ | 质量 |
| `radiusEarth` | R⊕ | 半径（由质量按类型的关系式反推） |
| `densityGcc` | g/cm³ | 体密度 |
| `gravity` | m/s² | 表面重力 |
| `escapeKms` | km/s | 逃逸速度 |
| `rotationHours` | 小时 | 自转周期；潮汐锁定时等于公转周期 |
| `tidallyLocked` | 布尔 | 是否潮汐锁定（`periodDays < 20`） |
| `obliquityDeg` | 度 | 转轴倾角，0 … 45 |
| `albedo` | — | 反照率 |
| `eqTempK` | K | 平衡温度（不含温室） |
| `meanTempK` | K | 平均表面温度（含温室） |
| `climate` | — | `frozen / cold / temperate / hot / scorched` |
| `atmosphere` | — | `none / thin / thick / hydrogen` |
| `habitable` | 布尔 | 温带、有大气、重力在 2 … 20 m/s² |
| `moons` | 数组 | 卫星，长度 ≤ `spec.maxMoons` |
| `surface` | 对象 | 地表：岩石是 `terrestrial`，气态/冰是 `isobaric`（见下） |

### surface（岩石行星：terrestrial）

模型是 `coarse-grid-v1`：72 列经度 × 36 行纬度（5° 一格），行从 -90° 到 +90°，列从 -180° 到 +180°。

| 字段 | 单位 | 含义 |
| --- | --- | --- |
| `model` | — | 固定 `coarse-grid-v1`；换模型要升 `schema` |
| `kind` | — | 固定 `terrestrial` |
| `grid` | — | `{ "lon": 72, "lat": 36 }` |
| `seaLevelM` | m | 海平面高度，固定 0 |
| `oceanFraction` / `landFraction` | — | 低于/高于海平面的格子占比，两者相加为 1 |
| `minElevationM` / `maxElevationM` | m | 网格里的最低/最高点 |
| `meanTempC` | ℃ | 按面积加权的地表均温；与 `planet.meanTempK` 对齐（海拔递减会让它略低） |
| `biomes` | 数组 | 每种群系的总计，按 `fraction` 降序 |
| `elevationM` | 数字[][] | 36 行 × 72 列，单位米；海洋是负值 |
| `biome` | 整数[][] | 36 行 × 72 列，群系 id 见下表（0 … 10） |
| `wetness` | 数字[][] | 36 行 × 72 列，0…1；生成时对海洋做 BFS 得到离海距离后派生（沿海湿、内陆干） |
| `fertility` | 数字[][] | 36 行 × 72 列，0…1；群系底值 × 水分 × 海拔折扣，供站点种植用 |

### surface（气态/冰巨星：isobaric）

「可活动区域」不是传统地表，而是等气压面（1 bar）；群系表示风暴强度。

| 字段 | 单位 | 含义 |
| --- | --- | --- |
| `model` | — | 固定 `coarse-grid-v1` |
| `kind` | — | 固定 `isobaric` |
| `grid` | — | `{ "lon": 72, "lat": 36 }` |
| `pressureBar` | bar | 等气压面，固定 1 |
| `minWindMps` / `maxWindMps` | m/s | 网格里的风速范围 |
| `meanTempC` | ℃ | 整片均匀，等于 `planet.meanTempK - 273.15` |
| `biomes` | 数组 | 每种风暴带的总计，按 `fraction` 降序 |
| `biome` | 整数[][] | 36 行 × 72 列，风暴等级 id（12 … 16） |

### surface（卫星：moon）

卫星地表最简单：无大气、无地形，整片固定「卫星」群系。

| 字段 | 单位 | 含义 |
| --- | --- | --- |
| `model` | — | 固定 `coarse-grid-v1` |
| `kind` | — | 固定 `moon` |
| `grid` | — | `{ "lon": 72, "lat": 36 }` |
| `meanTempC` | ℃ | 等于母行星平衡温度 `- 273.15` |
| `biomes` | 数组 | 只有一项 `{ id: 11, fraction: 1 }` |
| `biome` | 整数[][] | 36 行 × 72 列，全部是 11 |

### 群系 id（稳定，不随文案变）

| id | 群系 | 适用 | 判定（简化） |
| --- | --- | --- | --- |
| 0 | 海洋 | 岩石 | 低于海平面，且水温 > -2 ℃ |
| 1 | 冰盖 | 岩石 | 低于海平面且水温 ≤ -2 ℃，或陆地温度 < -12 ℃ |
| 2 | 苔原 | 岩石 | 陆地，-12 … 0 ℃ |
| 3 | 高山 | 岩石 | 海拔 > 3500 m 且温度 < 10 ℃ |
| 4 | 沙漠 | 岩石 | 降水 < 220 mm 且温度 > 8 ℃ |
| 5 | 草原 | 岩石 | 降水 < 500 mm |
| 6 | 稀树草原 | 岩石 | 其余温带 |
| 7 | 针叶林 | 岩石 | 温度 < 6 ℃ 且降水 ≥ 500 mm |
| 8 | 温带森林 | 岩石 | 降水 > 800 mm |
| 9 | 热带季雨林 | 岩石 | 温度 > 17 ℃ 且降水 > 800 mm |
| 10 | 热带雨林 | 岩石 | 温度 > 22 ℃ 且降水 > 1400 mm |
| 11 | 卫星 | 卫星 | 固定 |
| 12 | 平静带 | 气态/冰 | 风速 0 … 50 m/s |
| 13 | 微风带 | 气态/冰 | 风速 50 … 150 m/s |
| 14 | 风暴带 | 气态/冰 | 风速 150 … 300 m/s |
| 15 | 强风暴带 | 气态/冰 | 风速 300 … 500 m/s（副热带急流、风暴核） |
| 16 | 巨型风暴 | 气态/冰 | 风速 500 … 700 m/s（类大红斑的椭圆斑） |

### moon

| 字段 | 单位 | 含义 |
| --- | --- | --- |
| `id` | — | 全局唯一，`moon-<行星 n>-<序号>` |
| `name` | — | 显示名，`卫星 I-a` 这类 |
| `massEarth` | M⊕ | 质量（与行星的质量比按类型抽样） |
| `radiusEarth` | R⊕ | 半径（由质量与密度关系推） |
| `orbitKm` | km | 轨道半径（行星中心距）；至少 2 倍行星半径 |
| `periodDays` | 天 | 绕行星周期（开普勒，用行星质量） |
| `tideMeters` | m | 平衡潮差 `1.5 · R_p · (m_m/m_p) · (R_p/r)³`（地月 ≈ 0.54 m） |
| `surface` | 对象 | 卫星地表（固定「卫星」群系，见上） |

## 不变量（校验会检查）

1. `schema === 4`；`createdAt` 可被 `Date.parse` 解析。
2. `spec` 四个字段都在范围内且为整数/有限数。
3. `system.specHash` 是 8 位十六进制；`system.spec` 与顶层 `spec` 一致。
4. `planets.length === spec.planetCount`；`aAU` 由内到外升序。
5. 每颗行星的 `moons.length ≤ spec.maxMoons`；卫星 `orbitKm > 2 × radiusEarth × 6371`。
6. 每颗行星都有 `surface`，且 `kind` 与 `surface.kind` 匹配：`rocky → terrestrial`、`ice/gas → isobaric`。
7. 每颗卫星都有 `surface`，`kind` 为 `moon`，`biome` 全是 11。
8. `terrestrial` 的 `biome` 每个格子是 0 … 10；`isobaric` 的是 12 … 16；`moon` 的是 11。
9. `terrestrial.oceanFraction + landFraction === 1`；`isobaric.pressureBar > 0` 且 `minWindMps ≤ maxWindMps`。
10. `terrestrial.wetness` / `terrestrial.fertility` 都是 36×72、每格 0…1。
11. `id` 全局唯一；`kind / climate / atmosphere / surface.kind` 取值在枚举内。
12. 所有数值字段有限（不是 `NaN`、不是字符串）。

## 示例（节选）

```jsonc
{
  "schema": 4,
  "createdAt": "2026-11-11T17:31:12.000Z",
  "spec": { "seed": 20261111, "starMass": 1, "planetCount": 3, "maxMoons": 2 },
  "system": {
    "specHash": "1d5db81f",
    "generator": "genesis-m2",
    "star": { "massSun": 1, "luminositySun": 1, "radiusSun": 1, "teffK": 5772, "spectralClass": "G", "lifetimeGyr": 10, "hzInnerAU": 0.95, "hzOuterAU": 1.37 },
    "planets": [
      {
        "id": "p2", "name": "行星 II", "kind": "rocky", "aAU": 0.68, "periodDays": 203.5,
        "meanTempK": 322, "climate": "temperate", "atmosphere": "thin", "habitable": true,
        "moons": [{ "id": "p2-m1", "name": "卫星 II-a", "massEarth": 0.008, "radiusEarth": 0.2, "orbitKm": 194631, "periodDays": 6.4, "tideMeters": 2.84,
                   "surface": { "model": "coarse-grid-v1", "kind": "moon", "grid": { "lon": 72, "lat": 36 }, "meanTempC": -12.3, "biomes": [{ "id": 11, "label": "卫星", "count": 2592, "fraction": 1 }], "biome": [[11, 11, "…"]] } }],
        "surface": {
          "model": "coarse-grid-v1", "kind": "terrestrial",
          "grid": { "lon": 72, "lat": 36 },
          "seaLevelM": 0,
          "oceanFraction": 0.57, "landFraction": 0.43,
          "minElevationM": -4099, "maxElevationM": 3784, "meanTempC": 46.9,
          "biomes": [{ "id": 0, "label": "海洋", "count": 1477, "fraction": 0.57 }],
          "elevationM": [[-3200, -3100, "… 共 72 个"]],
          "biome": [[0, 0, "… 共 72 个"]]
        }
      },
      {
        "id": "p3", "name": "行星 III", "kind": "gas", "aAU": 4.0, "periodDays": 2922,
        "meanTempK": 90, "climate": "frozen", "atmosphere": "hydrogen", "habitable": false, "moons": [],
        "surface": {
          "model": "coarse-grid-v1", "kind": "isobaric",
          "grid": { "lon": 72, "lat": 36 },
          "pressureBar": 1, "minWindMps": 50, "maxWindMps": 700, "meanTempC": -183.2,
          "biomes": [{ "id": 14, "label": "风暴带", "count": 1400, "fraction": 0.54 }],
          "biome": [[14, 14, "… 共 72 个"]]
        }
      }
    ]
  }
}
```

## 兼容规则

- 读档只按本文件 + `src/schema.ts` 判断；字段多了不报错（向前兼容），少了/类型错要报错。
- 改了生成算法导致同 spec 生成不同系统：必须升 `generator` 和 `schema`，并在 CHANGELOG 说明
  「旧存档无法重算」，读档时按「与 spec 对不上」拒绝，让玩家删档重开。
