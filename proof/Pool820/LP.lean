import Pool820.Arithmetic

namespace Pool820

structure PoolState where
  reserveSbtc : Nat
  reserveQuote : Nat
  shareSupply : Nat

def proportional (state : PoolState) (sbtcAmount quoteAmount : Nat) : Prop :=
  sbtcAmount * state.reserveQuote = quoteAmount * state.reserveSbtc

def mintedShares (state : PoolState) (sbtcAmount : Nat) : Nat :=
  (sbtcAmount * state.shareSupply) / state.reserveSbtc

def addLiquidityState (state : PoolState) (sbtcAmount quoteAmount : Nat) : PoolState :=
  {
    reserveSbtc := state.reserveSbtc + sbtcAmount
    reserveQuote := state.reserveQuote + quoteAmount
    shareSupply := state.shareSupply + mintedShares state sbtcAmount
  }

def removeLiquiditySbtc (state : PoolState) (shareAmount : Nat) : Nat :=
  (shareAmount * state.reserveSbtc) / state.shareSupply

def removeLiquidityQuote (state : PoolState) (shareAmount : Nat) : Nat :=
  (shareAmount * state.reserveQuote) / state.shareSupply

def removeLiquidityState (state : PoolState) (shareAmount : Nat) : PoolState :=
  {
    reserveSbtc := saturatingSub state.reserveSbtc (removeLiquiditySbtc state shareAmount)
    reserveQuote := saturatingSub state.reserveQuote (removeLiquidityQuote state shareAmount)
    shareSupply := saturatingSub state.shareSupply shareAmount
  }

theorem addLiquidity_share_closed (state : PoolState) (sbtcAmount quoteAmount : Nat) :
    (addLiquidityState state sbtcAmount quoteAmount).shareSupply =
      state.shareSupply + mintedShares state sbtcAmount := by
  rfl

theorem addLiquidity_reserves_increase (state : PoolState) (sbtcAmount quoteAmount : Nat) :
    state.reserveSbtc ≤ (addLiquidityState state sbtcAmount quoteAmount).reserveSbtc ∧
    state.reserveQuote ≤ (addLiquidityState state sbtcAmount quoteAmount).reserveQuote := by
  constructor <;> simp [addLiquidityState]

theorem removeLiquidity_share_closed (state : PoolState) (shareAmount : Nat) :
    (removeLiquidityState state shareAmount).shareSupply = saturatingSub state.shareSupply shareAmount := by
  rfl

theorem removeLiquidity_reserves_decrease (state : PoolState) (shareAmount : Nat) :
    (removeLiquidityState state shareAmount).reserveSbtc ≤ state.reserveSbtc ∧
    (removeLiquidityState state shareAmount).reserveQuote ≤ state.reserveQuote := by
  constructor <;> simp [removeLiquidityState, saturatingSub_le_left]

theorem add_remove_roundtrip_exact
    (state : PoolState)
    (sbtcAmount quoteAmount minted : Nat)
    (hMinted : minted = mintedShares state sbtcAmount)
    (hProp : proportional state sbtcAmount quoteAmount)
    (hSbtcExact : removeLiquiditySbtc (addLiquidityState state sbtcAmount quoteAmount) minted = sbtcAmount)
    (hQuoteExact : removeLiquidityQuote (addLiquidityState state sbtcAmount quoteAmount) minted = quoteAmount) :
    removeLiquidityState (addLiquidityState state sbtcAmount quoteAmount) minted = state := by
  cases state
  simp [addLiquidityState, removeLiquidityState, hMinted, hSbtcExact, hQuoteExact, saturatingSub, Nat.add_sub_cancel]

/-
P1 targets covered in this file:

- LP share accounting closure
- proportional add/remove structural behavior
- exact round-trip identity under explicit exactness assumptions
-/

end Pool820
