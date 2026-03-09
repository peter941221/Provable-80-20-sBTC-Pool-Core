# Chaos Matrix

This file maps chaos experiments to their evidence: tests + `artifacts/chaos-report.json`.

## L1 — Artifact Chaos

- E-ART-01: `claim-matrix.json` missing
  - Expected: loader degrades, shows explicit error, continues with `claims=[]`
  - Evidence:
    - Test: `tests/chaos/artifact-corruption.test.ts`
    - Report: `artifacts/chaos-report.json` (experiment_id `E-ART-01`)

## L2 — Live Readonly Chaos

- E-LIVE-01: live readonly HTTP 429 / rate limit (simulated)
  - Expected: fallback to artifact bundle, source label changes, explicit issue recorded
  - Evidence:
    - Test: `tests/chaos/live-readonly-fallback.test.ts`
    - Report: `artifacts/chaos-report.json` (experiment_id `E-LIVE-01`)

## L3 — MXS / Remote-Data Chaos

- E-MXS-01: remote_data endpoint unreachable (simulated)
  - Expected: classified as infra/network and recorded as remote-data (not protocol)
  - Evidence:
    - Test: `tests/chaos/mxs-remote-data.test.ts`
    - Report: `artifacts/chaos-report.json` (experiment_id `E-MXS-01`)

- E-MXS-02: Hiro API rate limit HTTP 429 (simulated)
  - Expected: classified as infra/rate_limit with `HIRO_API_KEY` hint
  - Evidence:
    - Test: `tests/chaos/mxs-remote-data.test.ts`
    - Report: `artifacts/chaos-report.json` (experiment_id `E-MXS-02`)

## L4 — Boundary-State Chaos

- E-BND-01: fixed multi-step sequence near the math-domain boundary
  - Expected: out-of-domain proportional LP add reverts with `ERR-MATH-DOMAIN` and state does not drift
  - Evidence:
    - Test: `tests/chaos/boundary-sequence.test.ts`
    - Report: `artifacts/chaos-report.json` (experiment_id `E-BND-01`)

## L5 — Pipeline Drift Chaos

- E-PIPE-01: claim matrix drift (docs vs artifacts)
  - Expected: drift is detected and fix commands are provided
  - Evidence:
    - Test: `tests/chaos/pipeline-drift.test.ts`
    - Report: `artifacts/chaos-report.json` (experiment_id `E-PIPE-01`)

- E-PIPE-02: panel list drift (manifest vs UI)
  - Expected: drift is detected and fix commands are provided
  - Evidence:
    - Test: `tests/chaos/pipeline-drift.test.ts`
    - Report: `artifacts/chaos-report.json` (experiment_id `E-PIPE-02`)

- E-PIPE-03: console data drift (missing keys)
  - Expected: drift is detected and regen commands are provided
  - Evidence:
    - Test: `tests/chaos/pipeline-drift.test.ts`
    - Report: `artifacts/chaos-report.json` (experiment_id `E-PIPE-03`)

- E-PIPE-04: proof status drift (missing P0/P1/P2 slots)
  - Expected: drift is detected and regen commands are provided
  - Evidence:
    - Test: `tests/chaos/pipeline-drift.test.ts`
    - Report: `artifacts/chaos-report.json` (experiment_id `E-PIPE-04`)

## How to Run

```text
npm run test:chaos
npm run chaos:report
npm run validate:chaos
```
