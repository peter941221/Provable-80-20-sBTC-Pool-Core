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
- a theorem-to-claim mapping in `artifacts/proof-status.json`

## What Is Already Evidenced

- quote paths expose `lower` and `upper`
- write paths consume the lower bound
- witness values explain how output bounds were derived
- differential tests compare on-chain quote results with a Python model
- contract write paths now enforce an explicit `uint128` math domain for reserve transitions
- Lean 4 workspace now builds successfully
- initial P0 lemmas around arithmetic, root bounds, and lower/upper ordering are encoded in Lean
- the current P0 checklist is mapped to theorem-level artifacts and marked complete for the current repo scope
- current P1 reserve / LP structural claims are encoded in Lean and marked complete for the current repo scope
- current P2 composition claims are encoded in Lean and marked complete for the current repo scope
- the explicit math-domain guard now has a theorem slice in `proof/Pool820/MathDomain.lean`

## What Is Not Yet Proved

- stricter theorem-to-contract path equivalence for every helper
- stronger reserve preservation claims with fewer assumptions
- broader end-to-end composition claims over longer sequences

## Next Steps

1. Keep theorem ids aligned with `artifacts/proof-status.json` and `artifacts/claim-matrix.json`
2. Add proof artifact links or source-file references for each judge-facing claim
3. Extend reserve-preservation statements only where they improve judge confidence
