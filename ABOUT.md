# ABOUT

This file is a ready-to-copy summary for GitHub “About” + hackathon submission blurbs.

## GitHub About (short)

Provable 80/20 sBTC Pool Core: a single-purpose Stacks/Clarity weighted AMM primitive that reduces the 80/20 invariant to integer form (`x^4 * y = K`) so swaps, witnesses, and safety envelopes are bounded, inspectable, and demoable with MXS realism.

## One-Liner

Fixed 80/20 pool math → integer invariant → conservative quotes + bounded witness + explicit safety guards + replayable evidence.

## Evidence Surfaces

- Claim map: `docs/claim-matrix.md` + `artifacts/claim-matrix.json`
- Judge Console: `frontend/judge-console/`
- Proof status: `artifacts/proof-status.json` (Lean workspace in `proof/`)
- Chaos / resilience: `docs/chaos-matrix.md` + `artifacts/chaos-report.json`

## Quick Commands

```bash
npm run validate:full
```

