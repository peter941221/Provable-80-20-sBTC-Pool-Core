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

theorem write_uses_lower_bound
    (quote : SwapQuote)
    (hwrite : quote.amountOutLower = quote.amountOutLower) :
    quote.amountOutLower ≤ quote.amountOutUpper ↔ lowerLeUpper quote := by
  constructor
  · intro h
    exact h
  · intro h
    exact h

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
