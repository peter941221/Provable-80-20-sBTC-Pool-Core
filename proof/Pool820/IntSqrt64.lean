import Pool820.Arithmetic

namespace Pool820

abbrev U64Max : Nat := 18446744073709551615

def floorRoot4 (value : Nat) : Nat :=
  0

def ceilRoot4 (value : Nat) : Nat :=
  let lower := floorRoot4 value
  if pow4 lower = value then lower else lower + 1

theorem ceilRoot4_of_exact (value : Nat) (h : pow4 (floorRoot4 value) = value) :
    ceilRoot4 value = floorRoot4 value := by
  simp [ceilRoot4, h]

theorem ceilRoot4_of_inexact (value : Nat) (h : pow4 (floorRoot4 value) ≠ value) :
    ceilRoot4 value = floorRoot4 value + 1 := by
  simp [ceilRoot4, h]

/-
This file is a scaffold, not a completed proof.

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
