# Demo Script (Verbatim)

This is a 5-minute judge-facing walkthrough. Every step is written as:

- **Say**: what to say out loud
- **Do**: what to click / run / point at

## Setup (before the call)

Do:

1. `npm run validate:chaos`
2. `python -m http.server 8000`
3. Open `http://127.0.0.1:8000/frontend/judge-console/`

Say:

- "Everything you see here is backed by artifacts generated from this repo, plus an optional live readonly mode."

## 30 Seconds (the core claim)

Say:

- "This is a fixed-scope 80/20 sBTC pool core on Stacks."
- "We reduce the weighted invariant to an integer form: `x^4 * y = K`."
- "That makes our quotes bounded and inspectable: `lower <= ideal <= upper`."

Do:

1. Point at the **Overview** panel.
2. Point at the vector selector (top controls) and mention vectors are replayable.

## 90 Seconds (bounded swap witness)

Say:

- "For each swap direction we can show a conservative lower/upper bound, and a witness trail that explains how it was derived."
- "The write path uses the conservative lower bound, never overpaying."

Do:

1. Select vector `swap-sbtc-in-1000`.
2. Click **Load Artifact Bundle**.
3. Point at **Swap Verifier** (expected lower/upper).
4. Point at **Witness Explorer** (trade-limit, next reserve, and post-trade bounds).

Optional (stronger, if you have a deployed contract principal):

1. Enter API URL, contract principal, and sender address.
2. Click **Load Live Readonly**.
3. Point out the console shows *expected* and *live* side-by-side for the selected vector.

## 3 Minutes (LP math + safety surfaces)

Say:

- "LP add/remove is proportional, and withdrawals require LP share ownership."
- "We surface the security envelope explicitly: math domain, hash-binding, and asset guards."

Do:

1. Select vector `lp-add-1000-10000` and point at the **LP Verifier** expected minted shares.
2. Select vector `lp-remove-1000` and point at the expected outflow amounts.
3. Point at **Safety & Bindings** and mention:
   - contract-level `min-out`
   - explicit `uint128` math-domain guard
   - hash-enforced token binding on write paths
   - client policy `postConditionMode = Deny`

## 5 Minutes (reproducibility + evidence chain)

Say:

- "This repo is designed to be reproducible: tests, artifacts, MXS, and proof slices align to the same claims."
- "The point is not protocol sprawl; the point is believable correctness."

Do:

1. Open `docs/claim-matrix.md` and show that each claim maps to contract surface + tests + artifacts (and theorems where applicable).
2. Switch **Dataset** to `official sbtc-token (requirement)` and point out `sbtc-is-requirement=true` in the bindings.
3. Point at **Proof Status** and mention P0/P1/P2 are tracked in `artifacts/proof-status.json`.
4. Point at **Chaos Summary** and mention resilience evidence is recorded in `artifacts/chaos-report.json`.
5. (If time) Run `npm run mxs:check` and show fixed-height MXS realism is wired.

## FAQ (expected judge questions)

**Q: Who can withdraw liquidity?**

- A: Only addresses with LP shares in `lp-balances` can withdraw (`remove-liquidity` and `quote-remove-shares` enforce it).

**Q: What stops token spoofing?**

- A: We capture token `contract-hash?` at init and enforce hash-binding on every write path.

## Commands (copy/paste)

```bash
npm run validate:full
npm run validate:chaos
python -m http.server 8000
```
