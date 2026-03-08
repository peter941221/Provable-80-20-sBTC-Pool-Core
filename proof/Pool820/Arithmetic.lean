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

theorem le_pow4 (value : Nat) : value ≤ pow4 value := by
  cases value with
  | zero => simp [pow4]
  | succ n =>
      have h1 : 1 ≤ Nat.succ n := by
        exact Nat.succ_le_of_lt (Nat.succ_pos _)
      have hsq : Nat.succ n ≤ Nat.succ n * Nat.succ n := by
        simpa using Nat.mul_le_mul_left (Nat.succ n) h1
      have hsqPos : 1 ≤ Nat.succ n * Nat.succ n := by
        exact Nat.succ_le_of_lt (Nat.mul_pos (Nat.succ_pos _) (Nat.succ_pos _))
      have h4 : Nat.succ n * Nat.succ n ≤ (Nat.succ n * Nat.succ n) * (Nat.succ n * Nat.succ n) := by
        simpa [Nat.mul_assoc] using Nat.mul_le_mul_left (Nat.succ n * Nat.succ n) hsqPos
      exact le_trans hsq (by simpa [pow4_eq_square_square] using h4)

theorem ceilDiv_ge_div (numerator denominator : Nat) : numerator / denominator ≤ ceilDiv numerator denominator := by
  by_cases h0 : numerator = 0
  · simp [ceilDiv, h0]
  · simp [ceilDiv, h0]

theorem saturatingSub_antitone_right {left first second : Nat}
    (h : first ≤ second) : saturatingSub left second ≤ saturatingSub left first := by
  simpa [saturatingSub] using Nat.sub_le_sub_left h left

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
