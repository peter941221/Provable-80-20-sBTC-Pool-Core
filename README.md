# Provable 80/20 sBTC Pool Core

```text
   ___    ___  __   ___    ___  
  / _ \  / _ \ \ \ |__ \  / _ \ 
 | (_) || | | | \ \   ) || | | |
  > _ < | | | |  > > / / | | | |
 | (_) || |_| | / / / /_ | |_| |
  \___/  \___/ /_/ |____| \___/ 

  S B T C   P O O L   C O R E
```

Provable 80/20 sBTC Pool Core is a Stacks / Clarity weighted AMM primitive focused on one narrow, undeniable claim:

> Turn 80/20 weighted BTCFi math into a bounded, integer-based, provable, and demo-ready pool core.

This repository intentionally **rejects** building a sprawling, unverified AMM factory. Instead, it minimizes the protocol surface area to maximize the correctness surface, witness data transparency, and auditability.

---

## Judge Mode (Start Here)

For a rapid, high-signal review, follow this path:

1. **[0:30]** Open the **Judge Console** and inspect the invariant reduction (`x^4 * y = K`) + the `lower <= ideal <= upper` bounds.
2. **[1:30]** Select the replayable vector `swap-sbtc-in-1000` to evaluate the **Swap Verifier** and **Witness Explorer**.
3. **[5:00]** Review the **LP Verifier** and **Safety & Bindings**, then trace a claim end-to-end via the [Claim Matrix](docs/claim-matrix.md).

**One-Command Validation Pipeline**  
*(Generates artifacts, runs tests, performs MXS fixed-height simulation, and builds Lean 4 proofs)*
```bash
npm run validate:full
```

**Immutable Submission Snapshot**
- `artifacts/submission-snapshot.json`

### Key Visual Evidence
![Invariant reduction](docs/screenshots/invariant-reduction.svg?v=2)  
![Evidence chain](docs/screenshots/evidence-chain.svg?v=2)  
![Judge Console panel preview](docs/screenshots/judge-console-panels.png?v=4)

---

## FAQ (Judge Quick Answers)

**Q: Who can withdraw liquidity?**
- **A:** Only addresses with verified LP shares mapped in `lp-balances` can withdraw. The `remove-liquidity` function enforces `lp-balances[tx-sender] >= share-amount` and reverts explicitly with `ERR-LP-BALANCE`.

**Q: What prevents token spoofing or swapping tokens post-initialization?**
- **A:** The pool captures the `contract-hash?` of each token at initialization. A strict hash-binding guard is enforced on *every* write path (swaps, adds, removes) and pure outflow helpers. 

**Q: Why do artifacts often show mock tokens instead of official sBTC?**
- **A:** Artifact mode is optimized for deterministic, replayable vectors. Official sBTC wiring is fully proven (CL-06) via Clarinet requirements and fixed-height Mainnet Execution Simulation (MXS). The console can switch to an `official sbtc-token (requirement)` dataset to demonstrate this integration.

---

## Architecture & Innovation

### The Invariant Reduction
Our core technical moat is the reduction of general fractional powers to exact integers:

```text
[ Weighted Form ]         [ Integer Reduction ]
x^(4/5) * y^(1/5) = k  =>  x^4 * y = K
```

**Why it matters:**
- **Clarity Optimization:** Eliminates the need for complex, gas-heavy operations like `ln`, `exp`, or arbitrary `pow`.
- **Bounded Quotes:** `sBTC -> quote` uses a 4th-power path; `quote -> sBTC` uses a 4th-root path.
- **Provable Math:** Witnesses stay explicit. Conservative rounding (`lower <= ideal <= upper`) is easily audited.

### The Security Envelope

We combine three explicit layers of security:

```text
[1] Contract Logic
 ├─ Minimum reserve limits enforced
 ├─ Trade size constraints applied
 ├─ Strict min-out checks
 ├─ Explicit uint128 math-domain enforcement
 └─ Conservative lower-bound outputs on all writes

[2] Clarity 4 Asset Guards
 ├─ restrict-assets? (Scoped outflow limits)
 └─ as-contract? (Identity enforcement)

[3] Client Policy
 └─ postConditionMode = Deny
```
*(Read the full model: [`docs/security-model.md`](docs/security-model.md))*

---

## Project State

**Current Phase:** `week3-final-submission-pack`

**Core Capabilities:**
- Bidirectional readonly quote & witness derivation
- Bidirectional swap write paths (strictly using lower bounds)
- Proportional LP add/remove with closed-loop share accounting (`lp-balances`)
- Binding status & contract-hash enforcement
- Generated `isqrt64` / `root4` math primitives
- Realism: sBTC requirement wiring & Clarinet MXS manifest generation

**Verification & Evidence:**
- **Unit & Fuzz:** Differential tests against Python `sim/reference_model.py`
- **Proof:** Lean 4 theorems mapping to P0 / P1 / P2 claims (`artifacts/proof-status.json`)
- **Resilience:** Chaos engineering experiments (L1-L5) validating fallback systems (`artifacts/chaos-report.json`)
- **Transparency:** Browser-side live readonly console hydration

---

## Repository Map

```text
.
├── contracts/               # Clarity source
│   ├── pool-80-20.clar      # The core AMM logic
│   ├── math-q32.clar        # Fixed-point and root math
│   └── isqrt64-generated.clar
├── proof/                   # Lean 4 formalization
├── sim/                     # Python differential baseline
├── tests/                   # Vitest suite (unit, differential, mxs, chaos)
├── frontend/judge-console/  # Replayable evidence UI
├── artifacts/               # Generated proof data, snapshots, and vectors
└── docs/                    # Architectural decisions & claim matrix
```

---

## Running the Judge Console

The Judge Console hydrates local artifact bundles and provides a browser-side live readonly mode against deployed contracts.

**Quick Start (Artifact Mode):**
```bash
npm run validate:chaos
python -m http.server 8000
# Open: http://127.0.0.1:8000/frontend/judge-console/
```
To view official sBTC wiring data without live readonly access, switch the **Dataset** selector to `official sbtc-token (requirement)`.

---

## Submission Documentation

- [Security Model](docs/security-model.md)
- [Claim Matrix](docs/claim-matrix.md)
- [Proof Outline](docs/proof-outline.md)
- [Demo Script](docs/demo-script.md)
- [Video Script](docs/video-script.md)
- [Pitch Outline](docs/pitch-outline.md)
- [Chaos Engineering Matrix](docs/chaos-matrix.md)
