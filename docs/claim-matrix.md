# Claim Matrix

This file is the judge-facing map from claim -> contract -> theorem -> test -> artifact -> console panel.

## CL-01 — `sbtc-in` lower bound is conservative

- Claim: readonly `sbtc-in` quote keeps `lower <= upper`, and the write path uses the lower bound.
- Contract: `quote-sbtc-in`, `debug-sbtc-in`, `swap-sbtc-in`
- Proof: `sbtcIn_lower_le_upper`, `swapWriteOutput_eq_lower`, `swapWriteOutput_le_upper`
- Tests: `tests/unit/pool-80-20.test.ts`, `tests/differential/reference-model.test.ts`
- Artifacts: `artifacts/vector-pack.json`, `artifacts/judge-console-data.json`
- Judge Console: `Swap Verifier`

## CL-02 — `quote-in` lower bound is conservative

- Claim: readonly `quote-in` quote keeps `lower <= upper`, and the witness path stays inspectable.
- Contract: `quote-quote-in`, `debug-quote-in`, `swap-quote-in`
- Proof: `quoteIn_lower_le_upper`, `floorRoot4_input_le_ceilRoot4_input`
- Tests: `tests/unit/pool-80-20.test.ts`, `tests/differential/reference-model.test.ts`
- Artifacts: `artifacts/vector-pack.json`, `artifacts/judge-console-data.json`
- Judge Console: `Witness Explorer`

## CL-03 — LP state transitions stay proportional

- Claim: LP add/remove stays proportional, withdrawals require LP share ownership, and share accounting is closed over `share-supply` + `lp-balances`.
- Contract: `add-liquidity`, `remove-liquidity`, `quote-add-shares`, `quote-remove-shares`, `get-lp-balance`
- Proof: `addLiquidity_share_closed`, `removeLiquidity_share_closed`, `addLiquidity_reserves_increase`, `removeLiquidity_reserves_decrease`, `add_remove_roundtrip_exact`
- Tests: `tests/unit/pool-80-20.test.ts`, `tests/differential/reference-model.test.ts`
- Artifacts: `artifacts/vector-pack.json`, `artifacts/judge-console-data.json`
- Judge Console: `LP Verifier`

## CL-04 — Safety surfaces are explicit

- Claim: Clarity 4 guards, hash-enforced binding (including pure outflow paths), and post-condition expectations are explicit and reviewable.
- Contract: `get-safety-envelope`, `get-binding-status`, `get-sbtc-contract-hash`, `get-quote-contract-hash`, `swap-sbtc-in`, `swap-quote-in`, `add-liquidity`, `remove-liquidity`
- Proof: `hashBinding_accepts_matching`, `hashBinding_rejects_mismatch`, `pairHashBinding_accepts_matching`, `pairHashBinding_implies_component_equalities`, `initCapturesHashBinding`
- Tests: `tests/unit/pool-80-20.test.ts`
- Artifacts: `artifacts/console-snapshot.json`, `artifacts/judge-console-data.json`
- Judge Console: `Safety & Bindings`

## CL-05 — Differential evidence matches the reference model

- Claim: the Python reference model matches the on-chain readonly quote path for the sampled suite.
- Contract: `quote-sbtc-in`, `quote-quote-in`, `add-liquidity`, `remove-liquidity`
- Proof: none; this claim is test-backed.
- Tests: `tests/differential/reference-model.test.ts`
- Artifacts: `artifacts/vector-pack.json`
- Judge Console: `Overview`

## CL-06 — sBTC requirement and MXS realism are reproducible

- Claim: official sBTC requirement wiring and fixed-height MXS scenarios are reproducible.
- Contract: `SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token`, `SP000000000000000000002Q6VF78.pox-4`
- Proof: none; this claim is environment-backed.
- Tests: `tests/unit/sbtc-requirement.test.ts`, `tests/mxs/mainnet-realism.test.ts`
- Artifacts: `Clarinet.mxs.toml`, `artifacts/judge-console-data-sbtc.json`
- Judge Console: `Overview`

## CL-07 — Math domain is explicit and enforced

- Claim: write paths enforce an explicit `uint128` math domain for reserve transitions and invariant math.
- Contract: `initialize`, `swap-sbtc-in`, `swap-quote-in`, `add-liquidity`, `remove-liquidity`, `get-safety-envelope`
- Proof: `safeReserves_pow4_input_le_bound`, `safeReserves_invariant_le_max`, `swapSbtcIn_nextState_safe_of_checks`, `swapQuoteIn_nextState_safe_of_checks`, `addLiquidity_nextState_safe_of_checks`, `removeLiquidity_nextState_safe_of_checks`
- Tests: `tests/unit/pool-80-20.test.ts`
- Artifacts: `artifacts/console-snapshot.json`, `artifacts/judge-console-data.json`, `artifacts/claim-matrix.json`
- Judge Console: `Safety & Bindings`
