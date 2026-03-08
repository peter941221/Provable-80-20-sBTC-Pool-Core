import Pool820.Arithmetic
import Pool820.IntSqrt64

namespace Pool820

structure SwapQuote where
  amountIn : Nat
  amountInEffective : Nat
  amountOutLower : Nat
  amountOutUpper : Nat

def lowerLeUpper (quote : SwapQuote) : Prop :=
  quote.amountOutLower ≤ quote.amountOutUpper

/-
P0 targets for this file:

- `P0-C1` sbtc-in lower <= upper
- `P0-C2` write path uses lower bound
- `P0-C3` quote-in lower <= upper
- `P0-C4` lower-bound output is conservative

This file should stay at the claim/spec layer first.
Only after theorem statements stabilize should it mirror exact contract helper names more tightly.
-/

end Pool820
