# Proof Outline

## Main Claim

The core claim for this repo is not “general AMM correctness”.

It is the narrower and more credible claim:

> for the fixed 80/20 pool, the implemented integer path returns conservative outputs, so the lower-bound output does not overpay.

## Proof Layers

```text
P0
├─ integer helper correctness
├─ sqrt / root4 helper correctness
└─ lower-bound rounding direction

P1
├─ reserve safety under legal swaps
├─ LP share accounting closure
└─ proportional add/remove rounding conservatism

P2
└─ stronger composition claims and broader packaging claims
```

## Current Repo State

Current code supports future proofs because it already exposes:

- deterministic math helpers
- generated fixed-step root helpers
- explicit witness values for readonly quote paths
- differential reference model comparisons
- a Lean 4 proof workspace scaffold in `proof/`
- a P0 checklist in `proof/P0_CHECKLIST.md`

## What Is Already Evidenced

- quote paths expose `lower` and `upper`
- write paths consume the lower bound
- witness values explain how output bounds were derived
- differential tests compare on-chain quote results with a Python model
- Lean 4 workspace now builds successfully
- initial P0 lemmas around arithmetic, root bounds, and lower/upper ordering are encoded in Lean

## What Is Not Yet Proved

- full machine-checked proof bundle
- full LP machine proof
- full write-path reserve preservation proof
- complete claim-to-artifact mapping beyond placeholder JSON

## Next Steps

1. Turn P0 claims into machine-checkable statements against current helper interfaces
2. Add proof logs and proof artifact links to `artifacts/proof-status.json`
3. Connect proof claims to Judge Console proof panel wording
