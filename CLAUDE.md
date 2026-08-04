# CLAUDE.md

uTools 插件「书签和历史记录」:快速查询并打开浏览器书签/历史记录、编辑器与 IDE 的最近项目、办公/笔记软件文档。支持 Windows / macOS / Linux。

## 架构

- **入口链**:`public/plugin.json`(清单)→ `public/preload.js` → `dist/Build.js`(构建产物)。构建产物整个 `dist/` 目录即 uTools 本地插件。
- **适配器**:`src/parser/` 按软件类别分目录(`editor/` VSCode/Sublime/Typora/Geany,`ide/` JetBrains/VS/Xcode,`browser/` bookmark+history,`notes/` `office/` `system/`)。每个软件一个 `ApplicationImpl` 子类,实现 `generateCacheProjectItems()` 解析配置文件为项目项。
- **注册**:`src/Applications.ts` 静态注册所有适配器并映射 feature code(`vscode-project` 等);`src/Entrance.ts` 处理搜索/选择;`src/Types.ts` 定义 Application 抽象基类体系(Config/Executor/Cache 组合);`src/setting/` 是 uTools 设置页 UI。
- **数据源解析**:多数浏览器/笔记用 sqlite(`src/utils/sqlite/SqliteExecutor.ts`,sql.js),编辑器读 JSON/XML,Office 读注册表。项目项经 `src/utils/index-generator/`(拼音/文件路径索引)生成搜索键。

## 构建

- `yarn build-win`(bin/build.ps1)或 `yarn build`(bin/build.sh):tsc 编译 → 组装 dist(public 拷贝、icon、css、node_modules 内嵌)。
- `yarn build-release`(bin/build-release.sh):打 `.upx` 包(需要 UTOOLS_KEY 环境变量,`bin/add-key.js` 写入插件 id `zllxg1y5`)。
- **Windows 注意**:
  - PowerShell 执行 build.ps1 前需把 `node_modules/.bin` 加入 PATH,否则找不到 tsc(如 `$env:PATH = '...node_modules\.bin;' + $env:PATH`)。
  - build.ps1 写临时 package.json 用 `Out-File -Encoding ascii`(UTF-8 BOM 会让 yarn 报 "Invalid package.json")。
  - 系统执行策略可能禁止脚本,用 `powershell -ExecutionPolicy Bypass`。
- `dist/`、`node_modules/`、`*.upx` 均在 .gitignore,不入库。

## 测试

- `yarn test`(ts-jest + jsdom,`test/Mock.ts` mock 全局 utools)。
- `test/` 按适配器类别组织,fixture 与测试同目录。
- **已知**:`test/office/wps-international/linux/WpsInterLinux.test.ts` 基线失败(与环境/数据有关,非本次改动引入);CI 目前不跑测试。

## 关键约定

- 插件 id `zllxg1y5`(仅发布时由 add-key.js 写入 plugin.json)。
- **VSCode 适配器双数据源**(`src/parser/editor/Vscode.ts`):`Vscode1640ApplicationImpl` 配置以 `.vscdb` 结尾走 sqlite,否则解析 `Code/User/globalStorage/storage.json`(新版 VSCode 已从 state.vscdb 迁移),合并 `profileAssociations.workspaces` / `windowsState` / `backupWorkspaces` 并去重;旧版 `VscodeApplicationImpl` 读 `Code/storage.json` 的 `openedPathsList.entries`。
- 依赖镜像:`.yarnrc` 指向 npmmirror(registry + electron_mirror)。
- 详细功能与设置说明见 README.md(不在本文件重复)。
