# Proof Workspace

This directory is the Lean 4 workspace scaffold for machine-checked claims around the fixed `80/20` pool core.

Current goal:

```text
P0
├─ math helper directionality
├─ sqrt / root4 bounds
└─ lower-bound swap safety
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
    IntSqrt64.lean
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

1. Replace placeholder sections with theorem statements tied to current contract helper names
2. Add proof logs or proof outputs into `artifacts/proof-status.json`
3. Keep proof claims smaller than protocol ambition
