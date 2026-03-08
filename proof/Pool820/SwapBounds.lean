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

theorem lowerLeUpper_from_le (quote : SwapQuote)
    (h : quote.amountOutLower ≤ quote.amountOutUpper) : lowerLeUpper quote := by
  exact h

def sbtcInAmountOutLower (reserveOut reserveOutAfterUpper : Nat) : Nat :=
  saturatingSub reserveOut reserveOutAfterUpper

def sbtcInAmountOutUpper (reserveOut reserveOutAfterLower : Nat) : Nat :=
  saturatingSub reserveOut reserveOutAfterLower

theorem sbtcIn_lower_le_upper
    {reserveOut reserveOutAfterLower reserveOutAfterUpper : Nat}
    (h : reserveOutAfterLower ≤ reserveOutAfterUpper) :
    sbtcInAmountOutLower reserveOut reserveOutAfterUpper ≤
      sbtcInAmountOutUpper reserveOut reserveOutAfterLower := by
  exact saturatingSub_antitone_right h

theorem sbtcIn_lower_le_upper_from_formula
    (reserveOut invariant denominator : Nat) :
    sbtcInAmountOutLower reserveOut (ceilDiv invariant denominator) ≤
      sbtcInAmountOutUpper reserveOut (invariant / denominator) := by
  apply sbtcIn_lower_le_upper
  exact ceilDiv_ge_div invariant denominator

def quoteInAmountOutLower (reserveOut reserveOutAfterUpper : Nat) : Nat :=
  saturatingSub reserveOut reserveOutAfterUpper

def quoteInAmountOutUpper (reserveOut reserveOutAfterLower : Nat) : Nat :=
  saturatingSub reserveOut reserveOutAfterLower

theorem quoteIn_lower_le_upper
    {reserveOut inputLower inputUpper : Nat}
    (h : inputLower ≤ inputUpper) :
    quoteInAmountOutLower reserveOut (ceilRoot4 inputUpper) ≤
      quoteInAmountOutUpper reserveOut (floorRoot4 inputLower) := by
  apply saturatingSub_antitone_right
  exact floorRoot4_input_le_ceilRoot4_input h

def swapWriteOutput (quote : SwapQuote) : Nat :=
  quote.amountOutLower

theorem swapWriteOutput_eq_lower (quote : SwapQuote) :
    swapWriteOutput quote = quote.amountOutLower := by
  rfl

theorem swapWriteOutput_le_upper (quote : SwapQuote)
    (h : lowerLeUpper quote) :
    swapWriteOutput quote ≤ quote.amountOutUpper := by
  exact h

theorem write_uses_lower_bound
    (quote : SwapQuote) :
    swapWriteOutput quote = quote.amountOutLower := by
  rfl

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
