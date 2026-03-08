# P0 Proof Checklist

This is the smallest proof slice that materially increases confidence in the current repo.

It is intentionally narrower than “prove the full AMM”.

## P0-A Arithmetic Helpers

### `P0-A1` `pow4` monotone over `Nat`

Goal:

```text
a <= b -> pow4 a <= pow4 b
```

Why it matters:

- quote witnesses depend on monotone fourth-power growth
- swap bounds use the fact that larger denominators reduce outputs conservatively

Target file:

- `proof/Pool820/Arithmetic.lean`

### `P0-A2` `ceilDiv` upper-bounds exact division

Goal:

```text
ceilDiv n d >= n / d
```

Why it matters:

- upper post-trade reserve path for quote bounds depends on ceiling division moving against overpayment

Target file:

- `proof/Pool820/Arithmetic.lean`

### `P0-A3` `saturatingSub` never underflows

Goal:

```text
saturatingSub a b <= a
```

Why it matters:

- lower / upper outputs are computed through safe reserve differences

Target file:

- `proof/Pool820/Arithmetic.lean`

## P0-B Integer Root Helpers

### `P0-B1` `floorRoot4` is a lower bound

Goal:

```text
pow4 (floorRoot4 n) <= n
```

### `P0-B2` `ceilRoot4` is an upper bound

Goal:

```text
n <= pow4 (ceilRoot4 n)
```

### `P0-B3` `floorRoot4` / `ceilRoot4` differ by at most one step around exact fourth roots

Why it matters:

- quote-in path depends on controlled rounding around fourth-root reconstruction

Target file:

- `proof/Pool820/IntSqrt64.lean`

## P0-C Swap Bound Safety

### `P0-C1` `sbtc-in` lower bound does not exceed upper bound

Goal:

```text
amountOutLower <= amountOutUpper
```

### `P0-C2` write path uses `amountOutLower`

Goal:

```text
swap write output = readonly lower bound
```

### `P0-C3` `quote-in` lower bound does not exceed upper bound

Goal:

```text
amountOutLower <= amountOutUpper
```

### `P0-C4` lower-bound output does not overpay relative to the reconstructed post-trade reserve

Why it matters:

- this is the strongest honest claim the current repo should make early

Target file:

- `proof/Pool820/SwapBounds.lean`

## Explicit Non-P0 Items

These are important but should not block the first proof milestone:

- LP full accounting closure
- reserve preservation over long execution sequences
- contract-hash binding enforcement proof
- MXS / remote-data correctness claims

## Completion Rule

P0 is only “done” when each item has:

```text
claim id
├─ theorem name
├─ source file
├─ status = proved
└─ artifact link or log reference
```

## Next Steps

1. Convert each checklist item into one theorem skeleton
2. Reflect those theorem ids into `artifacts/proof-status.json`
3. Keep README wording aligned with actual proof status
