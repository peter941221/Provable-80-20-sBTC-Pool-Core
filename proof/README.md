# Proof Workspace

This directory is the Lean 4 workspace scaffold for machine-checked claims around the fixed `80/20` pool core.

Current goal:

```text
week2-proof-engine-complete
├─ P0 math helper directionality
├─ P0 sqrt / root4 bounds
├─ P0 lower-bound swap safety
├─ P1 reserve / LP closure slices
└─ P2 composition slices
```

## Layout

```text
proof/
  README.md
  P0_CHECKLIST.md
  lakefile.lean
  lean-toolchain
  Pool820.lean
  Pool820/
    Arithmetic.lean
    Composition.lean
    HashBinding.lean
    IntSqrt64.lean
    LP.lean
    MathDomain.lean
    SwapBounds.lean
```

## Intended Usage

Once Lean 4 tooling is installed:

```bash
cd proof
lake update
lake build
```

## Scope Rule

This workspace is for proof-side claims only.

- contract implementation truth still lives in `contracts/`
- project scope truth still lives in `tech_plan.md`
- submission wording truth still lives in `README.md` and `docs/`

## Next Steps

1. Keep `artifacts/proof-status.json` and `artifacts/claim-matrix.json` aligned with theorem-level completion
2. Extend theorem coverage only where it maps to a judge-facing claim or real risk surface
3. Keep proof claims smaller than protocol ambition
