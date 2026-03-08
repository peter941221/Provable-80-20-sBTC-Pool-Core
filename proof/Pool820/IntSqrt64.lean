import Pool820.Arithmetic

namespace Pool820

abbrev U64Max : Nat := 18446744073709551615

def floorRoot4Aux (value : Nat) : Nat → Nat
  | 0 => 0
  | bound + 1 =>
      if pow4 (bound + 1) ≤ value then bound + 1 else floorRoot4Aux value bound

def floorRoot4 (value : Nat) : Nat :=
  floorRoot4Aux value value

def ceilRoot4 (value : Nat) : Nat :=
  let lower := floorRoot4 value
  if pow4 lower = value then lower else lower + 1

theorem ceilRoot4_of_exact (value : Nat) (h : pow4 (floorRoot4 value) = value) :
    ceilRoot4 value = floorRoot4 value := by
  simp [ceilRoot4, h]

theorem ceilRoot4_of_inexact (value : Nat) (h : pow4 (floorRoot4 value) ≠ value) :
    ceilRoot4 value = floorRoot4 value + 1 := by
  simp [ceilRoot4, h]

theorem floorRoot4Aux_le_bound (value bound : Nat) : floorRoot4Aux value bound ≤ bound := by
  induction bound with
  | zero => simp [floorRoot4Aux]
  | succ n ih =>
      simp [floorRoot4Aux]
      split
      · omega
      · exact Nat.le_trans ih (Nat.le_succ _)

theorem floorRoot4Aux_spec (value bound : Nat) : pow4 (floorRoot4Aux value bound) ≤ value := by
  induction bound with
  | zero => simp [floorRoot4Aux, pow4_zero]
  | succ n ih =>
      simp [floorRoot4Aux]
      split
      · assumption
      · exact ih

theorem floorRoot4Aux_greatest {value bound x : Nat}
    (hxBound : x ≤ bound)
    (hx : pow4 x ≤ value) :
    x ≤ floorRoot4Aux value bound := by
  induction bound generalizing x with
  | zero =>
      have hx0 : x = 0 := by omega
      simp [floorRoot4Aux, hx0]
  | succ n ih =>
      simp [floorRoot4Aux]
      by_cases h : pow4 (n + 1) ≤ value
      · have hxCases : x ≤ n ∨ x = n + 1 := by
          omega
        cases hxCases with
        | inl hxn => omega
        | inr hxeq => simpa [hxeq]
      · have hxn : x ≤ n := by
          by_contra hNot
          have hnx : n + 1 ≤ x := by omega
          have hpow : pow4 (n + 1) ≤ pow4 x := pow4_monotone hnx
          exact h (le_trans hpow hx)
        exact ih hxn hx

theorem floorRoot4_spec (value : Nat) : pow4 (floorRoot4 value) ≤ value := by
  simpa [floorRoot4] using floorRoot4Aux_spec value value

theorem le_floorRoot4_of_pow4_le {x value : Nat} (hx : pow4 x ≤ value) : x ≤ floorRoot4 value := by
  have hxBound : x ≤ value := by
    exact le_trans (le_pow4 x) hx
  simpa [floorRoot4] using floorRoot4Aux_greatest hxBound hx

theorem floorRoot4_succ_pow4_gt (value : Nat) : value < pow4 (floorRoot4 value + 1) := by
  by_contra hNot
  have hLe : pow4 (floorRoot4 value + 1) ≤ value := by
    exact Nat.not_lt.mp hNot
  have hBound : floorRoot4 value + 1 ≤ value := by
    exact le_trans (le_pow4 (floorRoot4 value + 1)) hLe
  have hGreatest : floorRoot4 value + 1 ≤ floorRoot4 value := by
    simpa [floorRoot4] using floorRoot4Aux_greatest hBound hLe
  omega

theorem floorRoot4_monotone {a b : Nat} (h : a ≤ b) : floorRoot4 a ≤ floorRoot4 b := by
  apply le_floorRoot4_of_pow4_le
  exact le_trans (floorRoot4_spec a) h

theorem floorRoot4_le_ceilRoot4 (value : Nat) : floorRoot4 value ≤ ceilRoot4 value := by
  by_cases h : pow4 (floorRoot4 value) = value
  · simp [ceilRoot4, h]
  · simp [ceilRoot4, h]
    omega

theorem floorRoot4_input_le_ceilRoot4_input {a b : Nat} (h : a ≤ b) : floorRoot4 a ≤ ceilRoot4 b := by
  exact le_trans (floorRoot4_monotone h) (floorRoot4_le_ceilRoot4 b)

theorem le_pow4_ceilRoot4 (value : Nat) : value ≤ pow4 (ceilRoot4 value) := by
  by_cases h : pow4 (floorRoot4 value) = value
  · simp [ceilRoot4, h, h]
  · have hlt : value < pow4 (floorRoot4 value + 1) := floorRoot4_succ_pow4_gt value
    have hceil : ceilRoot4 value = floorRoot4 value + 1 := by
      simp [ceilRoot4, h]
    simpa [hceil] using Nat.le_of_lt hlt

/-
Planned theorem ids:

- `P0-B1` `pow4 (floorRoot4 n) <= n`
- `P0-B2` `n <= pow4 (ceilRoot4 n)`
- `P0-B3` exact-root neighborhood properties

The current contract has two root surfaces:

- generated `isqrt64` / `root4` in `contracts/isqrt64-generated.clar`
- pool-local `floor-root4-128` / `ceil-root4-128`

The first proof pass should target the logical property, not the generated syntax.
-/

end Pool820
