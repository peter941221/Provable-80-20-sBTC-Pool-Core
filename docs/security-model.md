# Security Model

## Big Picture

This project does not rely on one protection mechanism. It layers protections so each layer covers a different failure mode.

```text
Safety
├─ Contract math and reserve invariants
├─ Clarity 4 asset movement guards
├─ Client-side post conditions
└─ Binding / inspection surfaces for judges and reviewers
```

## Contract-Level Protections

- explicit `min-out` checks on swap write paths
- explicit minimum reserve checks after output calculations
- explicit trade size limits through `max-trade-bps`
- conservative output policy: write paths use the lower bound, not an optimistic path
- proportional LP only, so share accounting stays small and inspectable

## Clarity 4 Guard Layer

Current implementation uses:

- `restrict-assets?` for inbound user-controlled asset movement
- `as-contract?` for outbound pool-controlled asset movement

Current guard coverage:

- initialization inbound transfers
- swap inbound and outbound transfers
- LP add inbound transfers
- LP remove outbound transfers

Current limitation:

- token binding is currently resolved through known supported token principals and readable binding status, not yet full hash-enforced production hardening

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
- `contract-hash?` is exposed for inspection but not enforced in writes yet
- the live frontend does not yet construct full production transaction payloads
- proof claims are still artifact-level placeholders, not completed machine proofs

## Next Steps

1. Enforce optional contract-hash binding in write paths
2. Reduce current `clarinet check` warnings by narrowing trusted surfaces
3. Add scenario-level tests for guard failures and slippage failures
