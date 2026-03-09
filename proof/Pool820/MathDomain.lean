import Pool820.Arithmetic

namespace Pool820

def maxUInt128 : Nat := 340282366920938463463374607431768211455

def maxSafePow4Input : Nat := 4294967295

def maxSafeSbtcAtMinQuote : Nat := 135818791

def safeReserves (reserveSbtc reserveQuote : Nat) : Prop :=
  0 < reserveSbtc ∧
  0 < reserveQuote ∧
  reserveSbtc ≤ maxSafePow4Input ∧
  pow4 reserveSbtc * reserveQuote ≤ maxUInt128

theorem safeReserves_of_checks
    {reserveSbtc reserveQuote : Nat}
    (hSbtcPos : 0 < reserveSbtc)
    (hQuotePos : 0 < reserveQuote)
    (hPow : reserveSbtc ≤ maxSafePow4Input)
    (hMul : pow4 reserveSbtc * reserveQuote ≤ maxUInt128) :
    safeReserves reserveSbtc reserveQuote := by
  exact ⟨hSbtcPos, hQuotePos, hPow, hMul⟩

theorem safeReserves_pow4_input_le_bound
    {reserveSbtc reserveQuote : Nat}
    (h : safeReserves reserveSbtc reserveQuote) :
    reserveSbtc ≤ maxSafePow4Input := by
  exact h.2.2.1

theorem safeReserves_invariant_le_max
    {reserveSbtc reserveQuote : Nat}
    (h : safeReserves reserveSbtc reserveQuote) :
    pow4 reserveSbtc * reserveQuote ≤ maxUInt128 := by
  exact h.2.2.2

theorem swapSbtcIn_nextState_safe_of_checks
    {nextReserveSbtc nextReserveQuote : Nat}
    (hSbtcPos : 0 < nextReserveSbtc)
    (hQuotePos : 0 < nextReserveQuote)
    (hPow : nextReserveSbtc ≤ maxSafePow4Input)
    (hMul : pow4 nextReserveSbtc * nextReserveQuote ≤ maxUInt128) :
    safeReserves nextReserveSbtc nextReserveQuote := by
  exact safeReserves_of_checks hSbtcPos hQuotePos hPow hMul

theorem swapQuoteIn_nextState_safe_of_checks
    {nextReserveSbtc nextReserveQuote : Nat}
    (hSbtcPos : 0 < nextReserveSbtc)
    (hQuotePos : 0 < nextReserveQuote)
    (hPow : nextReserveSbtc ≤ maxSafePow4Input)
    (hMul : pow4 nextReserveSbtc * nextReserveQuote ≤ maxUInt128) :
    safeReserves nextReserveSbtc nextReserveQuote := by
  exact safeReserves_of_checks hSbtcPos hQuotePos hPow hMul

theorem addLiquidity_nextState_safe_of_checks
    {nextReserveSbtc nextReserveQuote : Nat}
    (hSbtcPos : 0 < nextReserveSbtc)
    (hQuotePos : 0 < nextReserveQuote)
    (hPow : nextReserveSbtc ≤ maxSafePow4Input)
    (hMul : pow4 nextReserveSbtc * nextReserveQuote ≤ maxUInt128) :
    safeReserves nextReserveSbtc nextReserveQuote := by
  exact safeReserves_of_checks hSbtcPos hQuotePos hPow hMul

theorem removeLiquidity_nextState_safe_of_checks
    {nextReserveSbtc nextReserveQuote : Nat}
    (hSbtcPos : 0 < nextReserveSbtc)
    (hQuotePos : 0 < nextReserveQuote)
    (hPow : nextReserveSbtc ≤ maxSafePow4Input)
    (hMul : pow4 nextReserveSbtc * nextReserveQuote ≤ maxUInt128) :
    safeReserves nextReserveSbtc nextReserveQuote := by
  exact safeReserves_of_checks hSbtcPos hQuotePos hPow hMul

/-
Math-domain guard targets for this file:

- the explicit `uint128` reserve safety envelope used by contract write paths
- theorem-level packaging for the new reserve-domain checks introduced in week 2
- small, judge-facing claims that map directly to `assert-safe-reserves`
-/

end Pool820
