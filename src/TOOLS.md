# 工具总表

每个工具一行：**做什么 · 关键参数 · 一句提醒**。
价格、材料、当前等级一律现查（`genesis_info` / `genesis_recipes`），别凭记忆报价。

## 一、创世与档案

| 工具 | 说明 |
| --- | --- |
| `genesis_menu` | 创世菜单：四个输入的含义、行星数与卫星上限由种子决定。 | 
| `genesis_create` | 建世：`seed`（数字或一句话）、`starMass`（0.15–2.0）、`starName`、`homeName`。只能成功一次；重复调用只回「已经创世过了」，不返回星卡。 |
| `genesis_reset` | 删档重来：**必须** `confirm: "DELETE"`，且对方明确同意。 |
| `genesis_card` | 星卡：恒星与**已装监测器**的天体属性。没监测器的天体只会写「尚未观测」。 |
| `genesis_info` | 查单件东西：建筑、资源、作物、升级、机制。`query` 可写 id 或中文名，模糊搜，回 3 条。 |

## 二、时间、天象与观测

| 工具 | 说明 |
| --- | --- |
| `genesis_time` | 现在几点、在哪、是否在移动、电量与着陆舱补给。时间格式「13曙光年-42曙光日-7.5曙光时」。 |
| `genesis_sun` | 太阳高度角/方位角；高度角 > 0 是白天。换过经纬度后只能靠它判昼夜。 |
| `genesis_stargaze` | 观星：可见度 > 0.5 才可用，列出够亮的天体，开 1 母星时的航行窗口。望远镜 lv2 起可见度 +0.15。 |
| `genesis_transit` | 我在第几颗行星/卫星：需要所在天体装了【凌日计数器】。 |
| `genesis_veins` | 扫矿：脚下 5×5 格剩余钨含量 + 最富格的方位距离；需要【质谱仪】，每 6 母星时一次。 |

## 三、看与走

| 工具 | 说明 |
| --- | --- |
| `genesis_look` | 此刻这里：脚下、太阳、近处 5×5 地形、200 km 内站点与建筑、天上可见天体。 |
| `genesis_terrain` | 看某片地形：`lat`/`lon` 必填，`planetIndex`/`moonIndex` 可指别处；不指就是脚下。岩石行星给群系/海拔/均温，气态给风暴带。 |
| `genesis_move` | `kind: "surface"` 带 `lat`/`lon` 走过去；`"interstellar"` 带 `target`（`p2`、`p2-m1` 或【未抵星体-xxxx】）；`"home"` 回母星。都要时间，路上不能观星/起名。 |
| `genesis_wait` | 原地等：`hours`（≤7 母星日）或 `until: dawn\|dusk\|noon\|open\|ripe\|built\|arrive`。按 1 母星时步进并汇报。 |
| `genesis_name` | 给脚下天体起名（≤12 字，不重名）；恒星与已命名天体不能再改。 |

## 四、建造与安装

| 工具 | 说明 |
| --- | --- |
| `genesis_install` | 唯一的建造入口。`id` 取：`greenhouse` `pump` `warehouse` `cold_store` `inert_room` `drone_cluster` `rocket` `biome_changer` `monitor` `counter` `sail` `rectifier` `miner` `kiln` `purifier` `sealer` `atmo_extractor` `mutator` `habitat` `arm` `terminal` `storage_terminal` `duty` `carrier` `wind` `fire` `converter` `planter`，以及配件 `cooler` `heater` `realism`（配件不进队列）。气态/冰巨星的子建筑把 `site` 写成 `carrier:<母舰id>`。温室只管**它所在的那个站点**（整站作物），同一站点多建不叠加。 |
| `genesis_upgrade` | 船上升级：`mobility_core` `telescope` `spark_plug` `battery` `subagent` `blueprints` `spectrometer`。不带 `id` 只列清单。 |
| `genesis_recipes` | 升级与维修总表：等级、造价、材料（需要 vs 现有）、还差什么、下一级效果。 |
| `genesis_store` | 容器与背包：`list`、`deposit`、`withdraw`、`demolish`、`bags`、`take`、`use`（罐装液氨）、`grid`/`grid_in`/`grid_out`（电网）、`fertilize`（撒复合肥）。着陆舱用 `building: "pod"`。 |

## 五、农业

| 工具 | 说明 |
| --- | --- |
| `genesis_site` | 在脚下建 1 km² 站点（一格最多 3 个；水面不行，冰盖可以，会自带 100 L 冰窖）。`kind` 自动判湿地/旱地。 |
| `genesis_plant` | 播种：`site`（或 `planter:<建筑id>`）+ 种子袋 id，`count` 可一次多种。 |
| `genesis_flora` | 农场总览：站点气候、作物阶段/进度/健康、温室与种植盆状态；也用来建/收/施肥。 |
| `genesis_harvest` | 收一株或一片：大型作物一次收完，群落留接种量；收成进站点或值班仓库。 |
| `genesis_inspect` | 一株作物的全部细节：基因、有效温区、温湿肥、四维养分当前/阈值、生长因子拆解、剩余母星时、预计收成。 |
| `genesis_transplant` | 移栽：把进度 ≥15% 的作物挖回种子袋（基因不变，这株就没了）。 |
| `genesis_breed` | 留种：`mode: "self"`（300 kJ、0.2 时、3 粒，产量每代 −4%）/ `"cross"`（800 kJ、0.5 时、4 粒，需同物种另一株）。**一株一辈子只留一次**。 |
| `genesis_algae` | 藻肥：3 kg 蓝藻 → 目标旱地 +0.02 氮 +0.005 钾，200 kJ。 |
| `genesis_remove` | 拔掉枯死/应激到 20% 以下的作物，腾出位置。 |

## 六、贸易与信用点

| 工具 | 说明 |
| --- | --- |
| `genesis_shop` | 商店：货架、当日价、限额、营业窗口；带 `sell` + `amount` 可卖货。商人不在就什么都不行。 |
| `genesis_buy` | 买：`kind` 取 `random_seed` `premium_seed` `cylinder` `chart` `tungsten` `energy_block` `fertilizer`（`kg`）。种子用 kJ，其余多用信用点。 |
| `genesis_survey` | 测绘：每颗行星的每个群系只认第一次，普通 1 份、难去的地方 2 份，50 信用点/份。 |
| `genesis_orders` | 商人的基因订单：接单、交货；只在开张时能做。 |

## 七、物流与自动化

| 工具 | 说明 |
| --- | --- |
| `genesis_route` | 仓储终端编排表：给容器（按槽位或 id）设优先级，数字越大越先被取，0 最低；不写进去的不动。 |
| `genesis_link` | 改机械臂线路：`inputs`（多个）/ `output`（一个）/ `items`（白名单，不传全搬）。臂展 5 km，每行星 20 座，成环只提醒不拦。 |
| `genesis_duty` | 改值班终端绑定：`habitat` / `store` / `sites`（≤6）。没有值班终端，人只吃饭不干活。 |

## 八、生命、协议与手册

| 工具 | 说明 |
| --- | --- |
| `genesis_protocol` | 唤醒清单：12 条三章；门槛只数前 11 条，第 12 条是结果。 |
| `genesis_wake` | 叫醒人类：`habitat` 或 `carrier` 可指定；室内 5–32℃ 才肯住，休眠舱没人了会报错。 |
| `genesis_mutate` | 诱变：一袋种子 → 3–5 颗基因抖动的种子，需站在诱变室站点。 |
| `genesis_guide` | 教程：不带 `topic` 给目录；`start` `plan` `time` `power` `mine` `farm` `logistics` `trade` `upgrade` `life` `trouble`。 |
| `genesis_tools` | 这张表。`query` 可搜工具名或关键词。 |
| `genesis_burn` | **已停用**：燃料只能进【火力发电站】。 |
