# Security Model

## Big Picture

This project does not rely on one protection mechanism. It layers protections so each layer covers a different failure mode.

```text
Safety
├─ Contract math and reserve invariants
├─ Explicit uint128 math-domain checks
├─ Clarity 4 asset movement guards
├─ Client-side post conditions
└─ Binding / inspection surfaces for judges and reviewers
```

## Contract-Level Protections

- explicit `min-out` checks on swap write paths
- explicit minimum reserve checks after output calculations
- explicit trade size limits through `max-trade-bps`
- explicit `uint128` domain checks on reserve transitions and invariant math
- conservative output policy: write paths use the lower bound, not an optimistic path
- proportional LP only, with explicit `lp-balances`, so only LPs can withdraw and share accounting stays small and inspectable

## Clarity 4 Guard Layer

Current implementation uses:

- `restrict-assets?` for inbound user-controlled asset movement
- `as-contract?` for outbound pool-controlled asset movement

Current guard coverage:

- initialization inbound transfers
- swap inbound and outbound transfers
- LP add inbound transfers
- LP remove outbound transfers

Current hash-binding coverage:

- token principals are still restricted to the known supported set
- all write paths (swap/add/remove, including pure outflow) require the current `contract-hash?` to match the hash captured at initialization
- both inbound (`pull-*-in-bound`) and outbound (`push-*-out-bound`) asset movements assert hash-binding before transfer

## Client Layer

The expected client default is:

```text
postConditionMode = Deny
```

This does not replace contract checks. It is an additional guardrail.

## Binding Surfaces

The pool exposes:

- binding status
- token contract hash lookup
- safety envelope info

These help reviewers understand what the pool believes it is bound to.

## Residual Risk

- static-analysis warnings remain in `clarinet check`
- the live frontend does not yet construct full production transaction payloads
- proof coverage is real and machine-checked in Lean, and now includes theorem slices for both the explicit math-domain guard and hash-binding equality claims used by write paths

## Next Steps

1. Reduce current `clarinet check` warnings by narrowing trusted surfaces
2. Keep the claim matrix, proof artifacts, and live readonly console wording aligned
3. Extend theorem coverage only where it improves confidence more than packaging effort
