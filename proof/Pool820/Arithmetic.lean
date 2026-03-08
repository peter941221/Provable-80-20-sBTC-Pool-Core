namespace Pool820

def pow4 (value : Nat) : Nat := value * value * value * value

def ceilDiv (numerator denominator : Nat) : Nat :=
  if numerator = 0 then
    0
  else
    (numerator + denominator - 1) / denominator

def saturatingSub (left right : Nat) : Nat :=
  left - right

theorem pow4_zero : pow4 0 = 0 := by
  rfl

theorem pow4_one : pow4 1 = 1 := by
  rfl

/-
P0 targets for this file:

- `P0-A1` monotonicity of `pow4`
- `P0-A2` upper-bound behavior of `ceilDiv`
- `P0-A3` no-underflow direction for `saturatingSub`
-/

end Pool820
