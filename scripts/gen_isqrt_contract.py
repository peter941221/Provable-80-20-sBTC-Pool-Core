from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "contracts" / "isqrt64-generated.clar"


MAX_U64 = 2**64 - 1


def render_floor_isqrt64() -> str:
    lines: list[str] = []
    lines.append("(define-read-only (floor-isqrt64 (value uint))")
    lines.append("  (if (> value MAX-U64)")
    lines.append("    (err ERR-DOMAIN)")
    lines.append("    (ok")
    lines.append("      (let (")
    lines.append("        (acc-0 u0)")
    for bit in range(31, -1, -1):
        idx = 32 - bit
        bit_value = 1 << bit
        lines.append(f"        (acc-{idx} (let ((candidate (+ acc-{idx - 1} u{bit_value})))")
        lines.append(f"          (if (<= (* candidate candidate) value) candidate acc-{idx - 1})))")
    lines.append("      )")
    lines.append("      acc-32")
    lines.append("    )")
    lines.append("  )")
    lines.append(")")
    lines.append(")")
    return "\n".join(lines)


CONTENT = f"""(define-constant ERR-DOMAIN u200)
(define-constant MAX-U64 u{MAX_U64})

(define-read-only (get-constants)
  {{
    max-u64: MAX-U64,
    rounds: u32,
  }}
)

{render_floor_isqrt64()}

(define-read-only (ceil-isqrt64 (value uint))
  (match (floor-isqrt64 value)
    floor-value
      (if (is-eq (* floor-value floor-value) value)
        (ok floor-value)
        (ok (+ floor-value u1))
      )
    err-code
      (err err-code)
  )
)

(define-read-only (sqrt-down (value uint))
  (floor-isqrt64 value)
)

(define-read-only (sqrt-up (value uint))
  (ceil-isqrt64 value)
)

(define-read-only (root4-down (value uint))
  (match (floor-isqrt64 value)
    sqrt-floor
      (floor-isqrt64 sqrt-floor)
    err-code
      (err err-code)
  )
)

(define-read-only (root4-up (value uint))
  (match (ceil-isqrt64 value)
    sqrt-ceil
      (ceil-isqrt64 sqrt-ceil)
    err-code
      (err err-code)
  )
)
"""


def main() -> None:
    OUT.write_text(CONTENT + "\n", encoding="utf-8", newline="\n")
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()
