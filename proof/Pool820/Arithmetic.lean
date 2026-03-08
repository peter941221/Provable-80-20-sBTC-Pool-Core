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

theorem ceilDiv_zero_left (denominator : Nat) : ceilDiv 0 denominator = 0 := by
  simp [ceilDiv]

theorem saturatingSub_zero (left : Nat) : saturatingSub left 0 = left := by
  simp [saturatingSub]

theorem saturatingSub_le_left (left right : Nat) : saturatingSub left right ≤ left := by
  simpa [saturatingSub] using Nat.sub_le left right

theorem pow4_monotone {a b : Nat} (h : a ≤ b) : pow4 a ≤ pow4 b := by
  have h2 : a * a ≤ b * b := Nat.mul_le_mul h h
  have h4 : (a * a) * (a * a) ≤ (b * b) * (b * b) := Nat.mul_le_mul h2 h2
  simpa [pow4, Nat.mul_assoc, Nat.mul_left_comm, Nat.mul_comm] using h4

theorem pow4_eq_square_square (value : Nat) : pow4 value = (value * value) * (value * value) := by
  simp [pow4, Nat.mul_assoc, Nat.mul_left_comm, Nat.mul_comm]

/-
P0 targets for this file:

- `P0-A1` monotonicity of `pow4`
- `P0-A2` upper-bound behavior of `ceilDiv`
- `P0-A3` no-underflow direction for `saturatingSub`

Current actually proved items:

- `pow4_zero`
- `pow4_one`
- `ceilDiv_zero_left`
- `saturatingSub_zero`
- `saturatingSub_le_left`
- `pow4_monotone`
- `pow4_eq_square_square`
-/

end Pool820
