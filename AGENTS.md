# 给接手这个包的人 / 模型

- `cortico.api` 是 6（world 契约版本）。Cortico 升契约时先跑 `pnpm check:extension <包目录>` 看它打印的版本。
- 改了工具、事件或 `src/ENV_PROMPT.md` 之后重跑 `pnpm describe:extension <包目录>`；发布前再跑 `check:extension`。
- World id 固定 `genesis`（全小写：页 id 是 `world:genesis`），显示名「创世记」。
- **锁定是数据层的**：`GenesisStore.createOnce()` 在存档存在时直接返回旧系统（`created: false`），不改文件。别在界面层「藏按钮」来代替它；`genesis_create` 在已创世时必须回「没有返回星卡」，不能把旧星卡交回去（那等于绕过监测器）。
- 读档会用存档里的 spec 重算并比对 `specHash`；手改 spec 必须报错，不能静默接受。
- 创世输入是 **四个**：`seed`（数字或任意一句话）、`starMass`（0.15–2.0）、`starName`、`homeName`。行星数（3–6）与每颗行星的卫星上限（3）由 `deriveGenesisShape(seed)` 推出来，不是参数。先 `validateSpec()` 再读存档。
- 两套存档：`<dataDir>/genesis/system.json`（创世产物，**schema 5**，删它就是删档）与 `<dataDir>/genesis/game.json`（玩法状态，**schema 6**，删它只是回到「刚创世」）。schema 升级是破坏性的，旧档要提示重新创世。
- 面板有四个：`system`（这一颗星球 / 地图 / 农场）、`upgrade`（修复与升级）、`protocol`（协议）、`guide`（手册 + 搜索）。`reset` 必须收到 `DELETE`。
- 面板 `src/webui/client.ts` 只能 `import type`；改完跑 `pnpm build:webui` 重打 `dist/webui.js`（这个产物是提交进仓库的，CI 会 `git diff --exit-code` 检查它有没有过期）。
- 面板方法有两类返回：**新的面板状态**（带 `locked`/`power`）与**一段文字**（`{ text }`）。客户端必须按形状分流，否则会把整页打回「还没创世」。
- `getMethods` 与 `invoke()` 的 switch 是两份手工清单，加面板方法要两处都改。
- 物理公式集中在 `src/physics.ts`，生成逻辑在 `src/system.ts`；改公式要同时看 `tests/world.test.ts` 与原型断言（地球平衡温度 254.8 K、重力 9.8、逃逸 11.2、地月潮汐 0.54 m）。
- `src/game.ts` 是玩法引擎（tick 链：能量 → 采矿 → 机械臂 → 采掘疤 → 终端 → 群系改造 → 工业 → 作物 → 生命维持 → 人手 → 施工 → 到达），`src/world.ts` 是工具与面板的接线层。改引擎后记得把同名文件拷回原型 `_dev/projects/genesis/src/`。
- 教程正文在 `src/guide/*.md`（11 篇），改完跑 `node scripts/build-guide-content.mjs` 重新生成 `src/guide-content.ts` 快照——harness 把 World 打成单文件时 .md 不在旁边，靠快照兜底。
- 新加「安装件」（不在 `BUILD_SPECS` 里的东西，如太阳能帆、三个气候核心）要同时补 `src/info.ts` 的 `devices`，否则 `genesis_info` 查不到。
- 测试不联网，用 `dryMountWorld` + `fakeWorldContext` + `FakeHost`；`scratch/verify.ts` 是本机的端到端 harness（不进 npm 包）。
- 提交前：`pnpm typecheck && pnpm test`；发布前 `describe:extension` 与 `check:extension`。
