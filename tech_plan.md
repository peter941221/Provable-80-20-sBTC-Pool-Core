# 🏆 Provable 80/20 sBTC Pool Core — Tech Plan

> 状态：2026-03-08 第一名版本  
> 来源：`PRD.md` + `spec.md` + 2026-03-08 官方 Stacks / Clarity / Clarinet / sBTC 文档核对  
> 目标：把项目从“技术上成立”升级成“评委几乎没理由不给第一”的可执行技术与提交物总计划。

---

## 1. 北极星：这份文档真正要帮项目赢什么

这份 `tech_plan.md` 不只是合并 PRD 和 spec，而是把整个项目收敛成一个**第一名导向的交付系统**。

目标不是“做出一个 AMM”，而是同时打满三条分数线：

```text
第一名 = 硬核可信度 × 5分钟可感知度 × 生态想象力
```

换句话说，项目必须同时做到：

1. **30 秒让评委听懂你做了什么**
2. **5 分钟让评委相信你真的做成了**
3. **赛后让评委记住这不是玩具 Demo，而是 BTCFi 基础设施**

### 这份文档要回答的核心问题

1. **协议面到底做到哪里最容易拿第一**
2. **哪些东西必须锁死，避免后面返工**
3. **最新官方技术能力应该怎样真正落到设计里**
4. **Demo、证明、测试、README、视频要怎样形成一条评分证据链**
5. **最后什么才算“第一名级完成”**

### 这版相对前一版的升级

- 从“合并版技术计划”升级为“第一名版本技术计划”
- 保留原有数学、接口、证明、测试细节
- 新增第一名导向的主线：**不扩协议功能面，扩证据面、可视化面、主网真实感、提交物包装**
- 把原来“仍需冻结”的关键决策直接锁定为默认实施值
- 把验收标准从“技术完成”扩成“评分可感知完成”

---

## 2. 项目一句话与取胜主轴

### 一句话版本

**Provable 80/20 sBTC Pool Core** 是一个运行在 Stacks / Clarity 上的、固定 `80/20` 权重、固定单池、固定 `exact-in`、并且能用机器证明说明“不超付”的 BTCFi weighted pool primitive。

### 评委要记住的一句话

> We turned weighted BTCFi math into a bounded, provable, demo-ready Stacks primitive.

### 取胜主轴

这个项目不是靠“功能很多”赢，而是靠下面这个组合赢：

```text
协议功能面：刻意收缩
├─ 单池
├─ 80/20
├─ exact-in
└─ proportional LP

评委感知面：刻意拉满
├─ Witness 可视化
├─ lower <= ideal 同屏展示
├─ P1 级证明
├─ 主网真实感（sBTC + MXS）
└─ README / pitch / demo 全对齐
```

### 为什么 80/20 是正确收缩

```text
通用 weighted AMM
├─ 需要一般实数幂 / ln / exp
├─ Clarity 上证明面和实现面都太大
└─ Hackathon 期内高概率交付失控

固定 80/20 weighted AMM
├─ invariant: x^(4/5) * y^(1/5) = k
├─ 化约后: x^4 * y = K
├─ sBTC -> quote 只要四次方
├─ quote -> sBTC 只要四次根
├─ 四次根 = 两次平方根
└─ 可落到固定步数、精确整数 sqrt
```

这让问题从“通用实数金融数学引擎”收缩成“有界整数数学 + 固定步数 sqrt + 协议保守舍入 + Clarity 原生资产保护”。

---

## 3. 最新官方技术基线（2026-03-08 核对）

下面这些不是背景知识，而是会直接改变实现方案和得分方式的约束。

| 主题 | 最新官方事实 | 对本项目的直接影响 |
|---|---|---|
| Clarity 4 | Clarity 4 已上线；官方新增并强调 `restrict-assets?`、`as-contract?`、`contract-hash?` 等能力 | V0 应直接采用合约内资产保护与可选代码哈希绑定，不再按旧版 Clarity 设计 |
| 资产守卫语义 | `restrict-assets?` / `as-contract?` 都在执行后检查资产出流是否落在 allowance 内，且 body 的最终值不能是 `response` | 资产转移 helper 必须设计成“内部 `try!`，最终返回非 `response` 哨兵值” |
| Post conditions | 官方继续推荐 `postConditionMode = Deny`；同时明确它们主要约束发送侧出流，不保证最终接收归属 | 前端必须默认带 `Deny`，但合约里仍必须检查 `min-out` 与接收逻辑 |
| stacks.js | 官方读写调用路径仍是 `fetchCallReadOnlyFunction` 与 `makeContractCall` | 前端必须分离“免费 quote / debug”与“签名写交易”两类路径 |
| Clarinet | Clarinet 现行文档与迁移说明已经切到 `@stacks/clarinet-sdk` 与 `vitest-environment-clarinet` | 不再沿用旧的 `@hirosystems/*` 包名与旧测试模板 |
| MXS | 官方支持 Mainnet Execution Simulation，可在固定主网高度复现状态 | 第一名版本必须把主网真实感纳入 V0，而不是只做 simnet |
| sBTC 集成 | 官方 Clarinet 文档支持用 requirement 接入 sBTC，并在具备条件时自动注资本地环境 | 本地/测试环境可以直接验证与官方 sBTC 合约的接口兼容性 |
| SIP-010 | sBTC 是 SIP-010 FT；标准 trait 和 `transfer/get-balance/get-total-supply` 等接口是交互基线 | quote token、mock token、绑定检查都应按 SIP-010 风格设计 |

### 这些官方事实带来的直接策略结论

- **必须用 Clarity 4 的 guard 原语讲好安全故事**
- **必须把 sBTC requirement 和 MXS 纳入第一名版本，而不是“以后再补”**
- **必须用最新 Clarinet / stacks.js 路线，避免工具栈显得过时**
- **必须把 post-conditions 放在客户端层，不冒充合约 correctness**

---

## 4. 锁定决策、范围边界与默认值

## 4.1 已锁定的默认决策

这些值从本版本开始视为默认实施值，后续若要修改，必须同步重跑 proof、tests、demo vectors 和 README。

| 决策项 | 锁定值 | 说明 |
|---|---|---|
| Reference quote asset | `wSTX` | 比赛叙事和 Stacks 对齐度最强 |
| Local demo quote asset | `mock-quote` | 本地演示与 simnet 测试用 |
| Proof language | `Lean 4` | 机器证明主栈 |
| `MIN_SBTC_RESERVE` | `100000` | 参考实现默认的最小单位阈值 |
| `MIN_QUOTE_RESERVE` | `1000000` | 参考实现默认的最小单位阈值 |
| Frontend post condition mode | `Deny` | 所有写交易默认开启 |
| Proof 目标 | **P1 全量为第一名目标** | P0 必达，P1 作为第一名版本目标全部争取达成 |

> 注：`MIN_*_RESERVE` 以资产的最小单位计数。若未来 reference token 的 decimals 与当前假设不一致，必须在部署前同步调整常量、测试向量和 README 表述。

## 4.2 V0 必做

- 固定单池：`sBTC / quote-asset = 80 / 20`
- 双向 `exact-in swap`
- 比例加流动性
- 比例减流动性
- 保守只读报价
- Debug Witness 只读接口
- 安全包络与资产绑定只读接口
- Python 离线参考模型
- 机器证明包：P0 全部 + P1 全量作为第一名目标
- Judge Console / Verifier UI
- 自动化测试、CI、生成一致性检查
- sBTC requirement 集成
- MXS 主网真实感验证

## 4.3 明确不做

- 任意权重
- 工厂 / 多池
- `exact-out`
- 单边 LP
- 路由
- Oracle / TWAP
- 治理
- 通用 `ln / exp / pow`
- 升级代理与复杂权限系统
- 价格最优路径与聚合器

## 4.4 第一名版本的范围原则

```text
允许扩张的地方
├─ 证据面：proof / tests / manifests / replayability
├─ 可视化面：witness / proof status / safety panel
├─ 真实感：sBTC requirement / MXS / asset binding
└─ 提交物：README / video / demo script / docs

不允许扩张的地方
├─ 协议功能面
├─ 资产种类面
├─ 池子数量面
└─ 数学通用性面
```

这条原则是整个项目避免翻车的关键。

---

## 5. 系统总览

```text
User / Judge
   |
   v
Frontend Verifier Console
├─ Overview
├─ Swap Verifier
├─ Witness Explorer
├─ LP Verifier
├─ Safety & Bindings
└─ Proof Status
   |
   v
pool-80-20.clar
├─ math-q32.clar
├─ isqrt64-generated.clar
├─ SIP-010 sbtc token
└─ SIP-010 quote token

Off-chain evidence layer
├─ sim/reference_model.py
├─ proof/*.lean
├─ scripts/gen_isqrt_contract.py
├─ scripts/gen_test_vectors.py
├─ scripts/demo_vectors.py
├─ proof-status.json
├─ demo-manifest.json
└─ vector-pack.json
```

### 设计原则

- **固定步数**：所有核心算法都必须是有限且固定结构
- **先验边界**：先做域检查，再做算术
- **保守舍入**：宁可少付，不可超付
- **证明优先**：数学原语、sqrt、swap 保守性先于花哨 UX
- **评委可见**：每个核心 claim 必须能在 UI、测试或 proof 中看见证据
- **单池优先**：所有设计都要优先降低证明面和交付面

---

## 6. 数学与安全模型

## 6.1 数学核心

设当前储备为：

- `x = reserve-sbtc`
- `y = reserve-quote`

固定权重：

- `w_x = 4/5`
- `w_y = 1/5`

理想 invariant：

`x^(4/5) * y^(1/5) = k`

化约后：

`x^4 * y = K`

### 直接工程收益

- `sBTC -> quote`：只需 `r^4`
- `quote -> sBTC`：只需 `q^(1/4)`
- `q^(1/4)`：可化为两次平方根
- 平方根：可降到 `uint64` 域精确 `isqrt`

## 6.2 数值表示

- `SCALE = 2^32 = 4294967296`
- 定点格式：`UQ32.32`
- 储备和份额一律使用 token 最小单位整数
- 只有“比率”使用定点数
- 链上不计算 `x^4 * y`

## 6.3 安全包络

V0 固定采用：

- `SCALE = 4294967296`
- `BPS_SCALE = 10000`
- `MAX_RESERVE = 2^88 - 1`
- `MAX_TOTAL_SHARES = 2^39 - 1`
- `MAX_TRADE_BPS = 2000`
- `MAX_FEE_BPS = 100`
- `INITIAL_SHARES = 1000000000`
- `MIN_SBTC_RESERVE = 100000`
- `MIN_QUOTE_RESERVE = 1000000`

### 这些常量为什么现在就锁定

- 它们会直接影响初始化门槛、swap 前置条件、LP remove 边界、属性测试合法域和 proof 边界
- 第一名版本不接受“代码写到一半再改最小储备”的返工路线
- 任何未来调整都必须同步更新：合约常量、测试向量、proof claims、demo-manifest、README

### 实施说明

- `MIN_*_RESERVE` 默认以最小单位存储和比较
- `get-safety-envelope()` 必须对外返回这两个值
- 所有 property tests 和 MXS 场景都必须把这两个值视为合法域的一部分

## 6.4 舍入总原则

| 场景 | 舍入 | 原因 |
|---|---|---|
| `qdiv` 比率上界 | 向上 | keep 不能被低估 |
| `pow4` | 向上 | `keep` 上界保守 |
| `root4` | 向上 | `keep` 上界保守 |
| `mul-bal-q` 用于 keep | 向上 | 不超付 |
| fee 生效输入 | 向下 | 不高估输出 |
| add-liquidity 输入 | 向上 | 不少收 |
| remove-liquidity 输出 | 向下 | 不超付 |

---

## 7. 合约设计

## 7.1 模块拆分

### `math-q32.clar`

职责：

- `div-up/down`
- `qdiv-up/down`
- `mul-q-up/down`
- `mul-bal-q-up/down`
- `apply-fee-down`
- 域检查 helper

### `isqrt64-generated.clar`

职责：

- `floor-isqrt64`
- `ceil-isqrt64`
- `sqrt-up/down`
- `root4-up/down`

实现要求：

- 由脚本生成
- 固定 32 轮 restoring integer square root
- 无循环
- 无递归
- 无近似

### `pool-80-20.clar`

职责：

- 初始化
- 双向 `exact-in swap`
- 比例 add/remove liquidity
- quote 只读接口
- debug witness 只读接口
- 安全包络与资产绑定接口

### `mock-sbtc.clar` / `mock-quote.clar`

职责：

- 本地演示与 simnet 测试
- SIP-010 风格 mock FT

> 注：PRD 中写的是 `mock-wstx.clar`。第一名版本统一采用 `wSTX` 作为 reference quote asset，但本地演示与测试文件仍统一命名为 `mock-quote.clar`，以保持抽象层与 demo 层分离。

## 7.2 状态变量

必需状态：

- `reserve-sbtc : uint`
- `reserve-quote : uint`
- `total-shares : uint`
- `fee-bps : uint`
- `max-trade-bps : uint`
- `init-done : bool`
- `version-id : uint`
- `lp-balances : map principal -> uint`

不上链状态：

- `K`
- 理想实数输出
- 高精度验证轨迹
- 历史 witness 明细

## 7.3 写接口

- `initialize(initial-sbtc, initial-quote, initial-shares, fee-bps)`
- `swap-sbtc-in(amount-in, min-out, recipient)`
- `swap-quote-in(amount-in, min-out, recipient)`
- `add-liquidity-proportional(shares-to-mint, sbtc-max, quote-max)`
- `remove-liquidity-proportional(shares-to-burn, sbtc-min, quote-min)`

## 7.4 只读接口

- `quote-sbtc-in(amount-in)`
- `quote-quote-in(amount-in)`
- `quote-add-shares(shares-to-mint)`
- `quote-remove-shares(shares-to-burn)`
- `get-reserves()`
- `get-total-shares()`
- `get-safety-envelope()`
- `get-asset-bindings()`

## 7.5 Debug Witness 接口

- `quote-sbtc-in-debug(amount-in)`
- `quote-quote-in-debug(amount-in)`

Witness 输出必须足够解释：

- 生效输入 `dx-eff / dy-eff`
- 上界比率 `r-up / q-up`
- 中间幂或根 `r4-up / sqrt1-up / root4-up`
- 保守 keep 值 `y-keep-up / x-keep-up`
- 最终 `out-lower`

## 7.6 错误码基线

下面这些错误码视为实现基线，后续可以增补，但不应随意改名，以免 README、前端和测试用例漂移。

| 错误码 | 含义 |
|---|---|
| `ERR-NOT-INIT` | 池子未初始化 |
| `ERR-ALREADY-INIT` | 已初始化 |
| `ERR-ZERO-AMOUNT` | 输入为 0 |
| `ERR-FEE-TOO-HIGH` | 手续费超上限 |
| `ERR-TRADE-TOO-LARGE` | 单笔交易超比例 |
| `ERR-RESERVE-TOO-LARGE` | 储备超包络 |
| `ERR-RESERVE-TOO-SMALL` | 交易后储备低于最小阈值 |
| `ERR-SHARES-TOO-LARGE` | 总份额超包络 |
| `ERR-SLIPPAGE` | 未满足 `min-out` / `max-in` |
| `ERR-NOT-ENOUGH-SHARES` | LP 份额不足 |
| `ERR-DIV-BY-ZERO` | 非法除法 |
| `ERR-OVERFLOW-GUARD` | 域检查失败 |
| `ERR-TOKEN-TRANSFER` | 外部 FT 调用失败 |
| `ERR-ASSET-GUARD` | `restrict-assets?` / `as-contract?` allowance 校验失败 |
| `ERR-ASSET-HASH` | 资产绑定校验失败 |
| `ERR-UNSUPPORTED-ASSET` | 资产配置错误 |

## 7.7 公开面原则

- **不新增协议功能型写接口**
- **不新增为“显得功能多”而存在的链上只读接口**
- 新增的“第一名版本扩张”优先放在链下证据层，例如：
  - `proof-status.json`
  - `demo-manifest.json`
  - `vector-pack.json`

---

## 8. 资产安全与绑定策略

## 8.1 合约内输入资产保护

对 `swap-*` 与 `add-liquidity-proportional`：

- 使用 SIP-010 `transfer`
- 发送方固定为 `tx-sender`
- 接收方固定为池合约 principal
- 输入资产转入必须包在 `restrict-assets?` 内
- allowance 必须等于此次函数允许的最大用户出流

## 8.2 合约内输出资产保护

对 `swap-*` 输出与 `remove-liquidity-proportional`：

- 必须在 `as-contract?` 上下文中完成
- allowance 用 `with-ft` 明确声明
- allowance 金额必须等于这笔操作允许的最大协议出流
- 若 transfer 失败或 allowance 校验失败，整笔交易回滚

## 8.3 Clarity 4 语义落地约束

这是合并后新增的关键实现约束：

- `restrict-assets?` / `as-contract?` 的 body 最终值不能是 `response`
- 因此资产转移 helper 的标准模式应为：
  - body 内部用 `try!` 处理 FT `transfer`
  - body 最终返回 `true` 之类的非 `response` 哨兵值
  - 外层再用 `unwrap!` 把 allowance 失败映射为项目自己的错误码

## 8.4 客户端资产保护

前端必须默认附带：

- `postConditions`
- `postConditionMode = Deny`
- 用户输入资产的上限保护
- 合约参数中的 `min-out`

### 明确边界

`post-conditions` 是额外保护层，不替代：

- 合约内 `min-out`
- 接收方 principal 校验
- 协议内域检查

## 8.5 资产绑定策略

V0 采用**编译期固定 pair**：

- `SBTC_CONTRACT`
- `SBTC_TOKEN_NAME`
- `QUOTE_CONTRACT`
- `QUOTE_TOKEN_NAME`

### 可选增强

testnet / mainnet build 应支持：

- `contract-hash?` 查询资产合约哈希
- 在部署脚本或只读接口里对外暴露该哈希
- 必要时把 hash 作为部署时校验项

---

## 9. 核心执行逻辑

## 9.1 `sBTC in -> quote out`

设用户输入 `dx`：

1. `dx_eff = apply-fee-down(dx, fee-bps)`
2. `r_up = qdiv-up(x, x + dx_eff)`
3. `r4_up = pow4-up(r_up)`
4. `y_keep_up = mul-bal-q-up(y, r4_up)`
5. `out_lower = y - y_keep_up`

必须满足：

- `out_lower <= out_ideal`
- 执行后真实储备：
  - `x_post = x + dx`
  - `y_post = y - out_lower`

## 9.2 `quote in -> sBTC out`

设用户输入 `dy`：

1. `dy_eff = apply-fee-down(dy, fee-bps)`
2. `q_up = qdiv-up(y, y + dy_eff)`
3. `root4_up = root4-up(q_up)`
4. `x_keep_up = mul-bal-q-up(x, root4_up)`
5. `out_lower = x - x_keep_up`

必须满足：

- `out_lower <= out_ideal`
- 执行后真实储备：
  - `y_post = y + dy`
  - `x_post = x - out_lower`

## 9.3 LP 份额模型

### 初始化

- `initial-sbtc >= MIN_SBTC_RESERVE`
- `initial-quote >= MIN_QUOTE_RESERVE`
- `0 < initial-shares <= MAX_TOTAL_SHARES`
- `fee-bps <= MAX_FEE_BPS`

### 比例加流动性

- `dx_req = ceil(l * x / L)`
- `dy_req = ceil(l * y / L)`
- 协议目标：不少收、份额账闭合、误差向协议保守方向偏移

### 比例减流动性

- `dx_out = floor(l * x / L)`
- `dy_out = floor(l * y / L)`
- 协议目标：不超付、份额账闭合、误差向协议保守方向偏移

---

## 10. 证明、生成器、参考模型与证据层

## 10.1 证明分层

### P0：必须机器证明

1. 所有算术原语在合法域内无未检查溢出
2. `floor-isqrt64` 精确正确
3. `ceil-isqrt64` 精确正确
4. `sqrt-up/down` 上下界正确
5. `root4-up/down` 上下界正确
6. 双向 swap 永不超付

### P1：第一名版本目标

7. 交易后储备不跌破最小储备
8. LP 份额账闭合
9. add/remove 的保守舍入性质

### P2：拉分项

10. swap 下数学不变量的保守下界不下降

### 证明表述原则

所有 claim 在对外文档、README、Judge Console 和 pitch 中都必须分成 3 类：

- `Machine Proved`
- `Empirically Tested`
- `Intentionally Out of Scope`

这样评委会看到一条非常干净的证据链，而不是“所有东西都说自己证明了”。

## 10.2 离线参考模型

离线模型必须承担两件事：

- 作为高精度 truth model 参与差分测试
- 为 Judge Console 提供 `out_ideal` 与 witness 对照

建议结构：

- `sim/reference_model.py`：高精度池子模型
- `scripts/gen_test_vectors.py`：生成边界测试向量
- `scripts/demo_vectors.py`：生成演示场景输入

## 10.3 生成器

`isqrt64-generated.clar` 必须由脚本生成，且满足：

- 输入模板固定
- 输出字节稳定
- 同样输入重复生成结果一致
- 生成结果能被 manifest/hash 校验

## 10.4 第一名版本新增的链下证据产物

这些产物不是“附加材料”，而是评委感知 correctness 的关键接口。

### `proof-status.json`

至少包含：

- claim id
- claim name
- status（`proved` / `tested` / `out-of-scope`）
- evidence path
- last generated timestamp

### `demo-manifest.json`

至少包含：

- 演示场景 id
- 输入参数
- 预期关键观察点
- 对应链上调用路径
- 对应 UI 页面

### `vector-pack.json`

至少包含：

- 边界测试向量
- 随机种子
- reference model 对照值
- 可复现说明

---

## 11. 前端 / Judge Console

## 11.1 产品定位

这不是交易前端优先项目，而是**验证型 UX + 评分证据舞台**。

目标是让评委在 5 分钟内依次看到：

- 合约真的能跑
- 输出真的保守
- witness 真的能解释
- proof 真的有边界
- 资产安全真的用了 Stacks 原生能力
- 这东西真的像生态底座而不是黑客松玩具

## 11.2 页面结构

### 页面 1：Overview

展示：

- 项目一句话
- 80/20 化约图
- 评分维度映射
- 当前安全包络摘要
- 核心 claims 摘要

### 页面 2：Swap Verifier

展示：

- 输入金额
- `quote-*` 返回的 `out-lower`
- 离线 `out-ideal`
- `lower <= ideal` 的可视化判断
- 发起真实交易按钮

### 页面 3：Witness Explorer

展示：

- `dx-eff / dy-eff`
- `r-up / q-up`
- `r4-up / sqrt1-up / root4-up`
- `keep-up`
- `out-lower`

### 页面 4：LP Verifier

展示：

- `quote-add-shares`
- `quote-remove-shares`
- 实际 add/remove 写交易
- 份额账变化前后对照

### 页面 5：Safety & Bindings

展示：

- `get-safety-envelope()`
- `get-asset-bindings()`
- 当前 guard 模式说明
- `postConditionMode = Deny` 的客户端保护说明

### 页面 6：Proof Status

展示：

- P0 / P1 / P2 claim 列表
- 每条 claim 的 `proved / tested / out-of-scope`
- 对应 proof / test / script 入口
- 生成时间与版本信息

## 11.3 官方调用路径

前端必须采用：

- 读：`fetchCallReadOnlyFunction`
- 写：`makeContractCall`
- 解码：Clarity Value helpers

## 11.4 钱包与交易默认项

- 默认 `postConditionMode = Deny`
- 默认附加输入资产上限 post-condition
- 始终把 `min-out` 或 `max-in` 风险控制显示给用户
- 页面上明确区分“本次是只读验证”还是“本次会发链上交易”

## 11.5 Judge Console 的展示原则

- 不堆过多页面跳转，尽量做到一个页面一个结论
- 每个页面只回答一个评委问题
- 每个核心 claim 都必须在 UI 中有对应证据入口
- UI 文案必须偏“解释 correctness”，不是偏“交易功能营销”

---

## 12. 建议仓库结构

```text
contracts/
  math-q32.clar
  isqrt64-generated.clar
  pool-80-20.clar
  mock-sbtc.clar
  mock-quote.clar

proof/
  Arithmetic.lean
  IntSqrt64.lean
  Pool820.lean

scripts/
  gen_isqrt_contract.py
  gen_test_vectors.py
  check_manifest.py
  demo_vectors.py

sim/
  reference_model.py

frontend/
  judge-console/

tests/
  unit/
  property/
  differential/
  random-sequences/
  mxs/

artifacts/
  proof-status.json
  demo-manifest.json
  vector-pack.json

docs/
  proof-outline.md
  security-model.md
  demo-script.md
  pitch-outline.md
```

---

## 13. 第一名版本实施计划（3 周）

## Week 0：冻结与准备

输出：

- `tech_plan.md` 定稿
- 默认决策冻结并写入文档
- `README` 首页结构草图
- 证据产物格式冻结：`proof-status.json` / `demo-manifest.json` / `vector-pack.json`

完成标准：

- 任何实现者不需要再猜 scope
- 任何 proof / UI / test 都知道自己的 claim 来源

## Week 1：不可质疑的协议内核

输出：

- Clarinet 项目初始化
- `math-q32.clar`
- `isqrt64-generated.clar`
- `pool-80-20.clar` 基础状态与接口壳
- guard helper 设计定稿
- 数学原语 / sqrt / root4 单元测试

本周重点：

- 把所有合法域、错误码、常量边界先钉死
- 先做“不会翻车的内核”，再做 Demo 壳

周末门槛：

- `clarinet check` 应通过
- 数学原语核心单测应通过
- `isqrt` 生成结果应稳定

## Week 2：评委可见的 correctness 证据链

输出：

- 双向 swap 完成
- LP add/remove 完成
- `quote-*` / `debug-*` 完成
- Python reference model
- property / differential / random-sequence tests
- P0 proof 全部推进
- Judge Console 的 `Overview / Swap Verifier / Witness Explorer / LP Verifier`

本周重点：

- 把 `lower <= ideal` 做成视觉主轴
- 把 witness 做成“非数学评委也能看懂”的页面
- 把 proof status 和 test evidence 串起来

周末门槛：

- 核心 swap 和 LP 路径跑通
- `out_lower <= out_ideal` 有自动化验证
- Demo 页面能稳定展示 read-only correctness

## Week 3：主网真实感、包装、彩排

输出：

- sBTC requirement 集成
- MXS 固定高度场景
- Judge Console 的 `Safety & Bindings / Proof Status`
- `proof-status.json` / `demo-manifest.json` / `vector-pack.json`
- `README`、`proof-outline.md`、`security-model.md`
- `demo-script.md`、`pitch-outline.md`
- 彩排脚本与最终录屏流程

本周重点：

- 证明这不是玩具 Demo
- 把所有证据收口到提交物上
- 让评委在 5 分钟里完整看见：数学、代码、资产保护、真实感、生态故事

最终门槛：

- 至少 1 组 MXS 场景跑通
- P0 全过，P1 尽可能全过
- README / UI / pitch 的话术完全一致

---

## 14. 详细验收标准

下面的标准替代原文档里分散的“成功指标”“测试策略”“证明目标”。只有满足这些，V0 才算完成。

## 14.1 基线与脚手架验收

| ID | 验收项 | 通过标准 | 证据 |
|---|---|---|---|
| `AC-B01` | 工具链基线 | 项目使用 `@stacks/clarinet-sdk`、`vitest-environment-clarinet`、`@stacks/transactions`；不存在旧 `@hirosystems/*` 依赖 | `package.json` |
| `AC-B02` | Clarinet 结构 | 仓库含 `contracts/ tests/ settings/ deployments/ Clarinet.toml vitest.config.*` | 目录结构 |
| `AC-B03` | sBTC 集成预留 | requirement 配置可切换 mock 与官方 sBTC | `Clarinet.toml` / `settings/*.toml` |
| `AC-B04` | 可复现测试环境 | simnet 可跑，MXS 可固定主网高度复现 | 测试配置 + CI |
| `AC-B05` | 证据产物结构 | `artifacts/` 下存在 `proof-status.json`、`demo-manifest.json`、`vector-pack.json` 的生成入口 | 脚本 + CI |

## 14.2 数学原语验收

| ID | 验收项 | 通过标准 | 证据 |
|---|---|---|---|
| `AC-M01` | `div-up/down` | `b=0` 被显式拒绝；正常输入与参考实现一致 | 单测 |
| `AC-M02` | `qdiv-up/down` | 仅在合法域内运行；不存在未检查溢出；上下取整方向正确 | 单测 + proof |
| `AC-M03` | `mul-q-up/down` | 对 `q ∈ [0, SCALE]` 全边界输入结果正确 | 单测 |
| `AC-M04` | `mul-bal-q-up/down` | 对 `b <= MAX_RESERVE`、`q <= SCALE` 的边界结果正确 | 单测 |
| `AC-M05` | `apply-fee-down` | `fee-bps <= MAX_FEE_BPS`；结果不高估生效输入 | 单测 |
| `AC-M06` | 域检查策略 | 所有公共入口先做域检查，再做算术；合法路径不依赖 runtime abort | 代码审阅 + proof |

## 14.3 `isqrt` / `sqrt` / `root4` 验收

| ID | 验收项 | 通过标准 | 证据 |
|---|---|---|---|
| `AC-S01` | `floor-isqrt64` | 满足 `s^2 <= N < (s+1)^2`，覆盖 `0`、`1`、`2^64` 邻域边界 | 单测 + proof |
| `AC-S02` | `ceil-isqrt64` | 对完全平方与非完全平方都精确正确 | 单测 + proof |
| `AC-S03` | `sqrt-up/down` | 满足上下界关系；无近似误差逃逸 | 单测 + proof |
| `AC-S04` | `root4-up/down` | 等价于两次 `sqrt` 组合，边界正确 | 单测 + proof |
| `AC-S05` | 固定步数 | 生成合约固定 32 轮、无循环、无递归 | 生成代码审阅 |
| `AC-S06` | 生成稳定性 | 同一模板重复生成 `isqrt64-generated.clar` 输出一致 | 生成一致性测试 |

## 14.4 Swap 核心验收

| ID | 验收项 | 通过标准 | 证据 |
|---|---|---|---|
| `AC-P01` | 初始化 | 仅允许一次初始化；初值与 fee 边界检查完整 | 集成测试 |
| `AC-P02` | `swap-sbtc-in` 零值防护 | `amount-in = 0` 必须返回显式错误 | 集成测试 |
| `AC-P03` | `swap-quote-in` 零值防护 | `amount-in = 0` 必须返回显式错误 | 集成测试 |
| `AC-P04` | 最大交易比例 | 超过 `MAX_TRADE_BPS` 的交易被拒绝 | 集成测试 |
| `AC-P05` | 双向不超付 | 对所有合法测试样本满足 `out_lower <= out_ideal` | property + differential + proof |
| `AC-P06` | 真实储备更新 | 状态更新使用完整输入 `dx/dy`，不是 `dx_eff/dy_eff` | 集成测试 |
| `AC-P07` | 最小储备保护 | 任意合法执行后 `reserve-* >= MIN_*_RESERVE` | property 测试 |
| `AC-P08` | `min-out` 防滑点 | `out_lower < min-out` 时整笔交易回滚 | 集成测试 |
| `AC-P09` | witness 一致性 | debug 接口给出的中间值与写路径计算一致 | 集成测试 |
| `AC-P10` | 错误码完整 | 所有失败路径映射到明确错误码，不出现未预期 abort | 集成测试 |

## 14.5 LP 份额验收

| ID | 验收项 | 通过标准 | 证据 |
|---|---|---|---|
| `AC-L01` | 比例加流动性报价 | `quote-add-shares` 与写路径需要量一致 | 集成测试 |
| `AC-L02` | 比例减流动性报价 | `quote-remove-shares` 与写路径输出量一致 | 集成测试 |
| `AC-L03` | add 保守性 | `dx_req`、`dy_req` 都按向上取整，协议不少收 | 单测 + property |
| `AC-L04` | remove 保守性 | `dx_out`、`dy_out` 都按向下取整，协议不超付 | 单测 + property |
| `AC-L05` | 份额账闭合 | 任意序列后 `sum(lp-balances) = total-shares` | random sequence + proof |
| `AC-L06` | 储备下限保护 | remove 后两边储备不跌破最小阈值 | 集成测试 |
| `AC-L07` | 滑点上限/下限 | `sbtc-max` / `quote-max` / `sbtc-min` / `quote-min` 都生效 | 集成测试 |

## 14.6 资产安全验收

| ID | 验收项 | 通过标准 | 证据 |
|---|---|---|---|
| `AC-A01` | 输入资产 guard | 用户输入资产转入被 `restrict-assets?` 限制，超 allowance 回滚 | 集成测试 |
| `AC-A02` | 输出资产 guard | 协议资产转出在 `as-contract? + with-ft` 下执行，超 allowance 回滚 | 集成测试 |
| `AC-A03` | guard 语义适配 | `restrict-assets?` / `as-contract?` body 最终值不是 `response` | 代码审阅 |
| `AC-A04` | transfer 失败映射 | 外部 FT `transfer` 失败时返回项目错误码而不是悬空 abort | 集成测试 |
| `AC-A05` | 资产绑定可见性 | `get-asset-bindings` 返回 contract principal、token name、可选 code hash | 只读测试 |
| `AC-A06` | 客户端保护默认值 | 前端写交易默认 `postConditionMode = Deny` | 前端测试 / 手工演示 |
| `AC-A07` | 保护边界清晰 | UI 明确说明 post-conditions 不是 `min-out` 的替代 | 页面文案 |

## 14.7 前端 / Judge Console 验收

| ID | 验收项 | 通过标准 | 证据 |
|---|---|---|---|
| `AC-F01` | 无钱包可验证 | Quote / Witness 页面在无钱包连接时可正常 read-only 调用 | 手工测试 |
| `AC-F02` | 结果可解释 | Witness 页面完整展示 `dx-eff/dy-eff`、比率、幂/根、keep、`out-lower` | 手工测试 |
| `AC-F03` | lower vs ideal | Swap 页面同屏展示 `out-lower <= out-ideal` 的对照 | UI 演示 |
| `AC-F04` | 写交易安全参数 | 所有写交易 UI 都暴露 `min-out` / `max-in` 风险控制 | UI 演示 |
| `AC-F05` | 资产绑定可视化 | UI 可展示 `get-safety-envelope` 与 `get-asset-bindings` | UI 演示 |
| `AC-F06` | Proof Status 面板 | UI 可展示 P0/P1/P2 claim 状态与对应证据入口 | UI 演示 |
| `AC-F07` | 读写区分清晰 | 用户能一眼看出“本次是 read-only 还是 on-chain tx” | UI 演示 |

## 14.8 证明与参考模型验收

| ID | 验收项 | 通过标准 | 证据 |
|---|---|---|---|
| `AC-R01` | 参考模型正确性 | Python 模型可输出 `ideal` 值并与链上 lower-bound 差分比较 | 差分测试 |
| `AC-R02` | P0 机器证明 | P0 列表全部通过 | proof logs |
| `AC-R03` | P1 第一名目标 | 储备安全、份额账闭合、add/remove 保守舍入三项都完成机器证明；如未全过，必须在 `proof-status.json` 中明确剩余缺口 | proof logs + artifact |
| `AC-R04` | 代码-生成器一致性 | 生成脚本、产物与 manifest 校验保持一致 | CI |

## 14.9 测试、CI 与可复现性验收

| ID | 验收项 | 通过标准 | 证据 |
|---|---|---|---|
| `AC-V01` | 单元测试 | 数学原语 / sqrt / root4 / rounding 全覆盖关键边界 | test report |
| `AC-V02` | 属性测试 | 覆盖不超付、最小储备、LP 保守性、份额账闭合 | test report |
| `AC-V03` | 差分测试 | 链上实现与参考模型在大样本输入上无违反保守性样本 | test report |
| `AC-V04` | 随机序列测试 | 混合 swap/add/remove 后状态不变量持续成立 | test report |
| `AC-V05` | MXS 测试 | 至少一组固定主网高度场景验证 sBTC 接口兼容性 | mxs report |
| `AC-V06` | 静态检查 | `clarinet check` 通过 | CI |
| `AC-V07` | 生成一致性 | 重新生成 `isqrt64-generated.clar` 不产生非预期 diff | CI |
| `AC-V08` | 冷启动可复现 | 从干净环境按 README 命令可完成安装、检查、测试、演示 | README + 手工复核 |

## 14.10 Demo 与提交物验收

| ID | 验收项 | 通过标准 | 证据 |
|---|---|---|---|
| `AC-D01` | README 可读性 | 首页能在 1 分钟内讲清 what / why / stacks fit / proof / demo | README |
| `AC-D02` | 5 分钟讲清 | pitch script 能完整覆盖问题、洞察、实现、验证、影响 | demo-script |
| `AC-D03` | 演示稳定性 | 演示路径无需临场改参数即可稳定复现 | 彩排记录 |
| `AC-D04` | 评分映射 | 提交物结构能直接对应 Innovation / Technical / Stacks / UX / Impact | README + docs |
| `AC-D05` | 30秒记忆点 | 非项目成员观看 30 秒后能复述“80/20 把 weighted BTCFi 数学降成可证明整数路径” | 彩排记录 |
| `AC-D06` | 90秒正确性感知 | 非数学评委在 90 秒内能看懂 `lower <= ideal` 是核心结论 | 彩排记录 |
| `AC-D07` | 3分钟真实感 | 在 3 分钟内展示真实写交易、资产保护和 witness，而不是只有只读页面 | 彩排记录 |

---

## 15. 评分映射与提交物策略

为了稳拿第一，提交物必须主动替评委完成“打分动作”。

| 评分维度 | 评委应该看到什么 | 对应提交物 |
|---|---|---|
| Innovation | `80/20 -> x^4 * y = K` 的化约如何把 weighted BTCFi 变成可证明整数路径 | README 首屏、Overview、Pitch 前 60 秒 |
| Technical Implementation | Clarity 合约、guard、proof、tests、reference model、MXS 都是成体系的 | 合约、Proof Status、test reports、CI |
| Stacks Alignment | 用了 `sBTC`、Clarity 4 guard、post-conditions、stacks.js、Clarinet、MXS | Safety & Bindings、README、Demo |
| User Experience | 评委不懂数学也能看懂 `lower <= ideal` 和 witness | Swap Verifier、Witness Explorer |
| Impact Potential | 这不是一个池子，而是一套可扩展的 BTCFi primitive 方法论 | README Roadmap、Pitch 收尾、docs |

### 提交物必须具备的首页结构

1. What it is
2. Why it is innovative
3. Why Stacks makes this possible
4. Live demo flow
5. Security and proof claims
6. Why this becomes BTCFi infrastructure

---

## 16. 风险、反模式与缓解

| 风险 / 反模式 | 影响 | 缓解 |
|---|---|---|
| 证明承诺过大 | 交付失控 | 严格按 P0 / P1 / P2 分层，并在 `proof-status.json` 明确状态 |
| 资产守卫实现不熟 | 合约实现卡住 | 先写最小 guard helper 和专门集成测试 |
| 临时又想加协议功能 | 稀释第一名效果 | 严守“扩证据面，不扩协议面”原则 |
| 代码与生成器漂移 | 审计可信度下降 | CI 强制生成一致性检查 |
| UX 做成普通交易界面 | 评委记不住 | 明确走“验证体验”，不是花哨交易界面 |
| 只做 simnet | 与主网真实路径脱节 | 把 MXS 纳入 V0 验收 |
| README / pitch / UI 说法不一致 | 评委困惑 | 建一份统一 claims 表，三处共用 |

### 第一名版本明确禁止的做法

- 为了“显得更大”去加多池或路由
- 为了“更像产品”牺牲 correctness 可视化
- 在 README 里把 tested 说成 proved
- 把 post-conditions 当成合约正确性替代品
- 最后几天才补 MXS、README、视频脚本

---

## 17. 已锁定决策清单

从本版本开始，以下项目视为已锁定：

1. reference quote asset = `wSTX`
2. local demo quote asset = `mock-quote`
3. proof language = `Lean 4`
4. `MIN_SBTC_RESERVE = 100000`
5. `MIN_QUOTE_RESERVE = 1000000`
6. 第一名 proof 目标 = `P0 必达 + P1 全力完成`
7. 第一名范围原则 = **不扩协议功能面，只扩证据面 / 可视化面 / 真实感 / 提交物**

若后续要改这些值，必须同步更新：

- 合约常量
- proof claims
- 测试向量
- demo-manifest
- README 与 pitch 话术

---

## 18. Definition of Done（第一名版本）

只有同时满足下面 10 条，V0 才算真正达到第一名版本完成度：

1. `math-q32.clar`、`isqrt64-generated.clar`、`pool-80-20.clar` 三块都可运行
2. P0 机器证明全部通过
3. P1 三项尽可能全部通过；若有缺口，`proof-status.json` 明确标记
4. 双向 swap 与 LP 全流程自动化测试通过
5. 资产守卫、`min-out`、post-conditions 三层保护都已接入
6. Judge Console 可展示 `Overview / Swap / Witness / LP / Safety / Proof Status`
7. 至少一组 sBTC requirement 场景通过
8. 至少一组 MXS 场景通过
9. README / demo / pitch 能稳定复现并讲清核心洞察
10. 非项目成员观看 Demo 后，能在 30 秒、90 秒、3 分钟、5 分钟四个时间点复述关键结论

---

## 19. 官方资料（本次合并时核对）

- Clarity 概览与语言约束：<https://docs.stacks.co/concepts/clarity>
- Clarity 4 正式发布说明：<https://www.hiro.so/blog/clarity-4-is-now-live>
- `restrict-assets?` 参考：<https://docs.stacks.co/reference/functions#restrict-assets>
- `as-contract?` 与资产 allowance 参考：<https://docs.stacks.co/reference/functions#as-contract>
- `contract-hash?` 参考：<https://docs.stacks.co/reference/functions#contract-hash>
- Post conditions 文档：<https://docs.stacks.co/concepts/transactions/post-conditions>
- stacks.js contract calls：<https://docs.stacks.co/reference/stacks.js-references/stacks-transactions>
- Clarinet 最新迁移与包名：<https://www.hiro.so/blog/clarinet-is-now-maintained-by-stacks-labs>
- Clarinet 项目结构：<https://docs.stacks.co/reference/clarinet/project-structure>
- Clarinet MXS：<https://docs.stacks.co/reference/clarinet/mainnet-execution-simulation>
- sBTC 集成：<https://docs.stacks.co/reference/clarinet/integrate-sbtc>
- SIP-010 与 FT 开发：<https://docs.stacks.co/build/create-tokens/creating-a-ft>

---

## 20. 现在的下一步

1. 按 `Week 1` 把 Clarinet 项目脚手架、数学内核和 guard helper 搭起来
2. 同时提前建立 `artifacts/` 生成链，避免最后再补证据文件
3. 从第一天开始就让 README、UI、proof claims 使用同一套 wording，不要最后收口时再改叙事
