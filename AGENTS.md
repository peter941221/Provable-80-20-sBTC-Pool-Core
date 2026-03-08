# 🧠 Project AGENTS

- 仓库：https://github.com/peter941221/Provable-80-20-sBTC-Pool-Core

```text
Project AGENTS
├─ Project goal
├─ Working commands
├─ Repo map
├─ Project rules
├─ Validation
└─ Reusable lessons
```

## 1) Project Snapshot

- Project name: `Provable 80-20 sBTC Pool Core`
- Main goal: 定义并后续实现一个运行在 Stacks / Clarity 上的、可运行、可证明、可演示的 `80/20 sBTC` weighted AMM 核心。
- Current phase: `week2-submission-readying`
- Primary outcome Peter cares about: `first-place hackathon impact + correctness + demo readiness`
- Main constraints:
  - 当前仓库是文档型工作区，尚未脚手架化为 Clarinet 项目
  - 方案必须贴合最新官方 Stacks / Clarity / Clarinet / sBTC 文档
  - V0 必须严格控 scope，避免从单池核心扩张成通用 AMM

## 2) Working Commands

- Current workspace state: 已完成双向 swap、LP add/remove、reference model、Judge Console 静态壳、README 与提交物文档初稿、MXS smoke 入口
- Working commands:
  - `python scripts/gen_isqrt_contract.py`
  - `python scripts/gen_artifacts.py`
  - `python scripts/check_manifest.py`
  - `clarinet check`
  - `vitest run tests/unit`
  - `vitest run tests/differential`
  - `cd proof && lake build`
  - `npm run proof:build`
  - `npm run validate:week1`
- Key environment notes:
  - 若接入官方 `sBTC` requirement，需使用支持该能力的较新 Clarinet 版本
  - 若启用 MXS，需固定主网高度；有条件时配置 `HIRO_API_KEY`

## 3) Repo Map

- Current canonical planning doc: `tech_plan.md`
- Week 1 core contracts:
  - `contracts/sip-010-ft-trait.clar`
  - `contracts/math-q32.clar`
  - `contracts/isqrt64-generated.clar`
  - `contracts/pool-80-20.clar`
  - `contracts/mock-sbtc.clar`
  - `contracts/mock-quote.clar`
- Week 1 supporting files:
  - `scripts/gen_isqrt_contract.py`
  - `scripts/gen_artifacts.py`
  - `scripts/check_manifest.py`
  - `tests/unit/`
  - `artifacts/`
- Week 2 added files:
  - `sim/reference_model.py`
  - `tests/differential/reference-model.test.ts`
  - `frontend/judge-console/index.html`
  - `frontend/judge-console/app.js`
  - `frontend/judge-console/style.css`
  - `README.md`
  - `docs/security-model.md`
  - `docs/proof-outline.md`
  - `docs/demo-script.md`
  - `docs/pitch-outline.md`
  - `proof/P0_CHECKLIST.md`
  - `proof/lakefile.lean`
  - `proof/Pool820/*.lean`
- Current requirement wiring:
  - `Clarinet.toml` includes `SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-deposit`
  - simnet can read `SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token`
- Background source docs:
  - `PRD.md`
  - `spec.md`
- Current project root knowledge file: `AGENTS.md`
- Expected future structure once scaffolded:
  - `contracts/`
  - `tests/`
  - `settings/`
  - `deployments/`
  - `frontend/`
  - `proof/`
  - `scripts/`

## 4) Project Rules

- `tech_plan.md` 是当前阶段的第一名版本技术真源；`PRD.md` 与 `spec.md` 保留为背景参考。
- 优先复用官方能力与文档，不要基于过时的 `@hirosystems/*` 或旧 Clarinet 用法继续设计。
- V0 固定为单池、固定 `80/20`、固定 `exact-in` 路线；不要悄悄扩展到多池、工厂、单边 LP、路由、通用幂函数。
- 第一名版本的范围扩张只允许发生在证据面、可视化面、主网真实感与提交物包装，不允许扩协议功能面。
- 默认以“证明面最小化”为决策标准：固定步数、显式边界检查、显式错误码、保守舍入。
- 资产安全分两层：
  - 合约内：`min-out`、域检查、`restrict-assets?` / `as-contract?`、可选 `contract-hash?`
  - 客户端：`postConditionMode = Deny`
- 不要把 post-conditions 当成合约逻辑的替代品。
- 若后续实现代码，优先修根因，不做表面补丁。

## 5) Validation Playbook

- Risk Tier defaults:
  - `L` = 文档、结构整理 -> 目录与内容一致性检查
  - `M` = 普通功能实现 -> `clarinet check` + 定向测试 + 关键路径回归
  - `H` = 资产安全、权限、生产部署 -> 全关键路径验证 + 回滚思路 + 主网/测试网绑定校验
- Minimum checks for this project:
  - Docs smoke: 标题结构、范围一致、术语一致、验收标准可执行
  - Contract smoke: `clarinet check`
  - Unit: 数学原语、sqrt/root4、舍入行为
  - Integration: swap / LP / asset transfer / slippage / error codes
  - Mainnet-realism: MXS 固定高度复现实测
- If validation is blocked:
  - 明确说明为什么无法运行
  - 至少做内容一致性与设计约束检查
  - 留下 Peter 可直接运行的后续命令

## 6) Reusable Lessons

- 当前仓库是“先合并文档、后搭脚手架”的项目；不要假设已有代码结构。
- Week 1 已完成 Clarinet 3.14.1 本地工具链安装；当前环境可直接运行 `clarinet check`。
- 最新平台基线已经进入 `Clarity 4` 时代，V0 设计应直接利用新的资产保护原语。
- `post-conditions` 只保护发送侧资产出流，不保证最终接收归属；`min-out` 仍必须由合约检查。
- Clarinet 现行文档与 SDK 以 `@stacks/*` 为主；新测试基线是 `@stacks/clarinet-sdk + Vitest + vitest-environment-clarinet`。
- Merged planning source of truth: `tech_plan.md`
- 当前第一名主线：`P0 必达 + P1 全力完成 + Witness 可视化 + sBTC requirement + MXS + 评分导向提交物`。
- `isqrt64-generated.clar` 由 `scripts/gen_isqrt_contract.py` 生成；若手改该文件，必须重跑生成并检查无 diff。
- `pool-80-20.clar` 当前已实现：初始化 guard、`quote-sbtc-in`、`quote-quote-in`、`debug-sbtc-in`、`debug-quote-in`、`swap-sbtc-in`、`swap-quote-in`、binding status、contract hash 读取。
- `pool-80-20.clar` 当前已实现：比例 `add-liquidity` / `remove-liquidity`。
- swap 写路径当前采用“完整输入入池 + lower bound 输出”更新储备，符合 `tech_plan.md` 的保守舍入主线。
- 当前差分基线来自 `sim/reference_model.py`，并由 `tests/differential/reference-model.test.ts` 对链上 quote 做样本对比。
- `frontend/judge-console/` 当前是静态壳，不含真实链上读写 wiring。
- `README.md` 当前已按 hackathon 首页结构补齐：What / Innovation / Stacks / Demo / Safety / Next Steps。
- MXS 当前已有 `scripts/gen_mxs_manifest.py` + `npm run mxs:check` smoke 路径；尚未补固定场景断言。
- `proof/` 当前已从占位目录升级为 Lean 4 scaffold；但仍是 theorem skeleton，不是 completed proof。
- 当前环境已安装 Lean 4 / Lake；`cd proof && lake build` 已通过。
- `pool-80-20.clar` 当前未实现：更严格的 hash-enforced binding、完整 live Judge Console wiring、MXS 场景级断言。
