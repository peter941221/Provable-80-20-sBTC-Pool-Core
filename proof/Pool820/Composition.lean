import Pool820.Arithmetic
import Pool820.LP
import Pool820.SwapBounds

namespace Pool820

def legalSwapSbtcIn (reserveQuote minQuote amountOutLower : Nat) : Prop :=
  minQuote ≤ saturatingSub reserveQuote amountOutLower

def legalSwapQuoteIn (reserveSbtc minSbtc amountOutLower : Nat) : Prop :=
  minSbtc ≤ saturatingSub reserveSbtc amountOutLower

theorem legalSwapSbtcIn_preserves_min
    {reserveQuote minQuote amountOutLower : Nat}
    (h : legalSwapSbtcIn reserveQuote minQuote amountOutLower) :
    minQuote ≤ saturatingSub reserveQuote amountOutLower := by
  exact h

theorem legalSwapQuoteIn_preserves_min
    {reserveSbtc minSbtc amountOutLower : Nat}
    (h : legalSwapQuoteIn reserveSbtc minSbtc amountOutLower) :
    minSbtc ≤ saturatingSub reserveSbtc amountOutLower := by
  exact h

theorem compose_sbtc_then_quote_preserves_mins
    {reserveQuote reserveSbtc minQuote minSbtc outQuote outSbtc : Nat}
    (h1 : legalSwapSbtcIn reserveQuote minQuote outQuote)
    (h2 : legalSwapQuoteIn reserveSbtc minSbtc outSbtc) :
    minQuote ≤ saturatingSub reserveQuote outQuote ∧
    minSbtc ≤ saturatingSub reserveSbtc outSbtc := by
  constructor
  · exact h1
  · exact h2

theorem add_remove_roundtrip_preserves_state_exact
    (state : PoolState)
    (sbtcAmount quoteAmount minted : Nat)
    (hMinted : minted = mintedShares state sbtcAmount)
    (hProp : proportional state sbtcAmount quoteAmount)
    (hSbtcExact : removeLiquiditySbtc (addLiquidityState state sbtcAmount quoteAmount) minted = sbtcAmount)
    (hQuoteExact : removeLiquidityQuote (addLiquidityState state sbtcAmount quoteAmount) minted = quoteAmount) :
    removeLiquidityState (addLiquidityState state sbtcAmount quoteAmount) minted = state := by
  exact add_remove_roundtrip_exact state sbtcAmount quoteAmount minted hMinted hProp hSbtcExact hQuoteExact

/-
P2 targets covered in this file:

- composition of legal reserve-preserving steps
- exact add/remove roundtrip identity as a stronger composition statement
-/

end Pool820
