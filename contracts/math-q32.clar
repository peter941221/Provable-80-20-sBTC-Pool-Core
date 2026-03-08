(define-constant ERR-DIV-BY-ZERO u100)
(define-constant ERR-BPS-RANGE u101)
(define-constant ERR-DOMAIN u102)

(define-constant Q32 u4294967296)
(define-constant BPS-SCALE u10000)
(define-constant MIN-SBTC-RESERVE u100000)
(define-constant MIN-QUOTE-RESERVE u1000000)

(define-read-only (get-constants)
  {
    q32: Q32,
    bps-scale: BPS-SCALE,
    min-sbtc-reserve: MIN-SBTC-RESERVE,
    min-quote-reserve: MIN-QUOTE-RESERVE,
  }
)

(define-read-only (div-down (numerator uint) (denominator uint))
  (if (is-eq denominator u0)
    (err ERR-DIV-BY-ZERO)
    (ok (/ numerator denominator))
  )
)

(define-read-only (div-up (numerator uint) (denominator uint))
  (if (is-eq denominator u0)
    (err ERR-DIV-BY-ZERO)
    (ok (/ (+ numerator (- denominator u1)) denominator))
  )
)

(define-read-only (mul-q-down (left uint) (right uint))
  (ok (/ (* left right) Q32))
)

(define-read-only (mul-q-up (left uint) (right uint))
  (let ((product (* left right)))
    (if (is-eq product u0)
      (ok u0)
      (ok (/ (+ product (- Q32 u1)) Q32))
    )
  )
)

(define-read-only (mul-bal-q-down (balance uint) (weight-q32 uint))
  (mul-q-down balance weight-q32)
)

(define-read-only (mul-bal-q-up (balance uint) (weight-q32 uint))
  (mul-q-up balance weight-q32)
)

(define-read-only (qdiv-down (left uint) (right uint))
  (if (is-eq right u0)
    (err ERR-DIV-BY-ZERO)
    (ok (/ (* left Q32) right))
  )
)

(define-read-only (qdiv-up (left uint) (right uint))
  (if (is-eq right u0)
    (err ERR-DIV-BY-ZERO)
    (let ((numerator (* left Q32)))
      (if (is-eq numerator u0)
        (ok u0)
        (ok (/ (+ numerator (- right u1)) right))
      )
    )
  )
)

(define-read-only (apply-fee-down (amount uint) (fee-bps uint))
  (if (> fee-bps BPS-SCALE)
    (err ERR-BPS-RANGE)
    (ok (/ (* amount (- BPS-SCALE fee-bps)) BPS-SCALE))
  )
)

(define-read-only (assert-valid-reserve-domain (sbtc-reserve uint) (quote-reserve uint))
  (if (and (>= sbtc-reserve MIN-SBTC-RESERVE) (>= quote-reserve MIN-QUOTE-RESERVE))
    (ok true)
    (err ERR-DOMAIN)
  )
)
