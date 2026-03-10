# Demo Video Script (5 minutes)

Goal: show the reduction (`x^4 * y = K`), show conservative bounds (`lower <= ideal <= upper`), show LP ownership via `lp-balances`, show safety surfaces (Clarity 4 guards + hash-binding + math-domain), and show reproducibility (claims -> tests -> artifacts -> proof).

This script is optimized for a single-take screen recording.

## Preflight (before recording)

1. Run `npm run validate:full`.
2. Run `python -m http.server 8000`.
3. Open `http://127.0.0.1:8000/frontend/judge-console/`.

## 0:00 - 0:20 (Title + one-sentence claim)

Say:

- "This is a fixed-scope 80/20 sBTC pool core on Stacks. We turn weighted AMM math into bounded integer math so the demo, tests, and proofs are believable."

Do:

- Keep the Judge Console on screen.

## 0:20 - 0:55 (Core math reduction)

Say:

- "For 80/20, the weighted invariant reduces cleanly: `x^(4/5) * y^(1/5) = k` becomes `x^4 * y = K`."
- "That makes bounds easy to compute with integers: `lower <= ideal <= upper`."

Do:

- Point to the **Overview** panel.

## 0:55 - 2:10 (Bounded swap witness)

Say:

- "Each swap exposes a conservative lower and upper bound, plus a witness trail that shows intermediate values."
- "The write path uses the lower bound, so it does not overpay."

Do:

1. Select vector `swap-sbtc-in-1000`.
2. Click **Load Artifact Bundle**.
3. Point to **Swap Verifier** (expected lower/upper).
4. Point to **Witness Explorer** (trade limit, next reserve, and post-trade bounds).

Optional (if you have a deployed contract principal):

1. Enter API URL, contract principal, and sender address.
2. Click **Load Live Readonly** and mention it will fallback to artifacts if the API is unavailable.

## 2:10 - 3:20 (LP math + ownership)

Say:

- "LP add/remove is proportional. Withdrawals require share ownership tracked in `lp-balances`."

Do:

1. Select vector `lp-add-1000-10000` and point to **LP Verifier**.
2. Select vector `lp-remove-1000` and point to the expected outflow.

## 3:20 - 4:15 (Safety surfaces: guards + binding + domain)

Say:

- "We make safety reviewable: explicit `uint128` math-domain guard, Clarity 4 asset guards, and hash-enforced token binding on all write paths."

Do:

- Point to **Safety & Bindings**.

## 4:15 - 4:40 (sBTC wiring and MXS realism)

Say:

- "To prove sBTC wiring and mainnet realism, we wire the official sBTC requirement and run fixed-height MXS scenarios."

Do:

1. Switch **Dataset** to `official sbtc-token (requirement)` in the console, and point out `sbtc-is-requirement=true`.
2. Mention `tests/mxs/mainnet-realism.test.ts` replays at fixed height 522000.

## 4:40 - 5:00 (Close: evidence chain)

Say:

- "The point is not protocol sprawl. The point is that each claim maps to contract surface, tests, artifacts, and proof slices."

Do:

1. Open `docs/claim-matrix.md` and show one claim mapping.
2. Point to **Proof Status** and **Chaos Summary**.

## Post-video links (show on screen or in submission form)

- `docs/claim-matrix.md`
- `artifacts/claim-matrix.json`
- `artifacts/proof-status.json`
- `artifacts/chaos-report.json`
- `artifacts/submission-snapshot.json`

