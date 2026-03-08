# 🏆 Provable 80/20 sBTC Pool Core

Provable 80/20 sBTC Pool Core is a Stacks / Clarity weighted AMM primitive focused on one narrow claim:

> turn 80/20 weighted BTCFi math into a bounded, integer, provable, demo-ready pool core.

This repo intentionally does **not** try to be a full AMM factory. It keeps the protocol surface small so the correctness surface, witness surface, and hackathon submission surface can be much stronger.

## What It Is

- Single pool only
- Fixed `80/20` weighting
- Fixed `exact-in` swap path
- Proportional LP add/remove only
- Conservative quote path with explicit `lower` and `upper`
- Clarity 4 guard skeleton + client-side `postConditionMode = Deny`
- sBTC requirement wiring + MXS-ready manifest generation

## Why It Is Innovative

The key reduction is:

```text
80/20 weighted invariant
x^(4/5) * y^(1/5) = k

reduce to integer form
x^4 * y = K
```

That reduction matters because it turns a hard generalized weighted AMM problem into a smaller problem that fits Clarity much better:

```text
general weighted AMM
├─ ln / exp / arbitrary pow are painful to prove and implement
└─ hackathon scope tends to explode

fixed 80/20 pool
├─ sbtc -> quote uses fourth power path
├─ quote -> sbtc uses fourth-root path
├─ witness values stay explicit
└─ conservative rounding is easy to explain to judges
```

## Why Stacks Makes This Possible

- Clarity makes contract execution predictable and inspectable
- Clarity 4 gives in-contract asset guards like `restrict-assets?` and `as-contract?`
- sBTC makes the BTCFi story native to the Stacks ecosystem
- Clarinet + Vitest + MXS make the repo testable and demoable with mainnet realism

## Current Status

Current phase: `week2-swap-ready`

Implemented now:

- math primitives
- generated `isqrt` / `root4`
- mock SIP-010 assets
- pool initialization with guarded inbound asset movement
- bidirectional readonly quote + witness
- bidirectional swap write path using conservative lower-bound outputs
- proportional LP add/remove
- binding status + contract hash inspection
- reference model differential tests
- Judge Console static shell reading local artifacts
- sBTC requirement wiring
- MXS manifest generation

Not finished yet:

- proof artifacts beyond placeholder status
- full live Judge Console wiring
- MXS scenario assertions beyond smoke check
- mainnet-grade output guard and binding enforcement hardening

## Repo Map

```text
contracts/
  math-q32.clar
  isqrt64-generated.clar
  pool-80-20.clar
  mock-sbtc.clar
  mock-quote.clar

tests/
  unit/
  differential/
  mxs/

scripts/
  gen_isqrt_contract.py
  gen_artifacts.py
  gen_mxs_manifest.py

sim/
  reference_model.py

frontend/
  judge-console/

artifacts/
  proof-status.json
  demo-manifest.json
  vector-pack.json
  console-snapshot.json
```

## Demo Flow

1. Show `x^4 * y = K` and explain why fixed 80/20 matters
2. Show readonly quote for `sBTC -> quote`
3. Show witness values proving `lower <= ideal <= upper`
4. Execute the corresponding write-path swap
5. Show guard / binding / contract-hash surfaces
6. Show sBTC requirement and MXS readiness

Detailed demo notes live in `docs/demo-script.md`.

## Safety Model

Three layers are used together:

```text
1. contract logic
   ├─ min reserve checks
   ├─ trade size limits
   ├─ min-out checks
   └─ conservative lower-bound outputs

2. Clarity 4 asset guards
   ├─ restrict-assets?
   └─ as-contract?

3. client transaction policy
   └─ postConditionMode = Deny
```

More detail: `docs/security-model.md`

## Validation

Core validation commands:

```bash
npm run validate:week1
npm run validate:full
npm run mxs:check
```

What they cover:

- generated contract stability
- artifacts shape
- `clarinet check`
- unit tests
- differential tests
- MXS smoke manifest path

## Judge Console

Static shell entry:

- `frontend/judge-console/index.html`

It currently reads local artifact JSON files and lays out the six judge-facing panels.

## Submission Docs

- `docs/security-model.md`
- `docs/proof-outline.md`
- `docs/demo-script.md`
- `docs/pitch-outline.md`

## Next Steps

1. Wire Judge Console to real read-only contract calls
2. Expand proof status from placeholders to machine-checked claims
3. Add scenario-level MXS assertions and final submission packaging
