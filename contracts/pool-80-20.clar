(use-trait ft-trait .sip-010-ft-trait.sip-010-ft-trait)

(define-constant CONTRACT-OWNER tx-sender)

(define-constant ERR-ALREADY-INITIALIZED u400)
(define-constant ERR-NOT-INITIALIZED u401)
(define-constant ERR-ZERO-AMOUNT u402)
(define-constant ERR-MIN-SBTC-RESERVE u403)
(define-constant ERR-MIN-QUOTE-RESERVE u404)
(define-constant ERR-FEE-BPS u405)
(define-constant ERR-MAX-TRADE-BPS u406)
(define-constant ERR-GUARD u407)
(define-constant ERR-TRADE-TOO-LARGE u408)
(define-constant ERR-SLIPPAGE u409)
(define-constant ERR-LP-RATIO u410)
(define-constant ERR-SHARE-AMOUNT u411)
(define-constant ERR-NOT-IMPLEMENTED u499)

(define-constant MIN-SBTC-RESERVE u100000)
(define-constant MIN-QUOTE-RESERVE u1000000)
(define-constant MAX-FEE-BPS u1000)
(define-constant MIN-MAX-TRADE-BPS u1)
(define-constant MAX-MAX-TRADE-BPS u5000)
(define-constant BPS-SCALE u10000)



(define-data-var initialized bool false)
(define-data-var sbtc-token (optional principal) none)
(define-data-var quote-token (optional principal) none)
(define-data-var reserve-sbtc uint u0)
(define-data-var reserve-quote uint u0)
(define-data-var share-supply uint u0)
(define-data-var fee-bps uint u0)
(define-data-var max-trade-bps uint u0)

(define-private (assert-initialized)
  (if (var-get initialized)
    (ok true)
    (err ERR-NOT-INITIALIZED)
  )
)

(define-private (assert-positive (amount uint))
  (if (> amount u0)
    (ok true)
    (err ERR-ZERO-AMOUNT)
  )
)

(define-private (pow4 (value uint))
  (let ((square (* value value)))
    (* square square)
  )
)

(define-private (floor-root4-128 (value uint))
  (let (
    (acc-0 u0)
    (acc-1 (let ((candidate (+ acc-0 u2147483648)))
      (if (<= (pow4 candidate) value) candidate acc-0)))
    (acc-2 (let ((candidate (+ acc-1 u1073741824)))
      (if (<= (pow4 candidate) value) candidate acc-1)))
    (acc-3 (let ((candidate (+ acc-2 u536870912)))
      (if (<= (pow4 candidate) value) candidate acc-2)))
    (acc-4 (let ((candidate (+ acc-3 u268435456)))
      (if (<= (pow4 candidate) value) candidate acc-3)))
    (acc-5 (let ((candidate (+ acc-4 u134217728)))
      (if (<= (pow4 candidate) value) candidate acc-4)))
    (acc-6 (let ((candidate (+ acc-5 u67108864)))
      (if (<= (pow4 candidate) value) candidate acc-5)))
    (acc-7 (let ((candidate (+ acc-6 u33554432)))
      (if (<= (pow4 candidate) value) candidate acc-6)))
    (acc-8 (let ((candidate (+ acc-7 u16777216)))
      (if (<= (pow4 candidate) value) candidate acc-7)))
    (acc-9 (let ((candidate (+ acc-8 u8388608)))
      (if (<= (pow4 candidate) value) candidate acc-8)))
    (acc-10 (let ((candidate (+ acc-9 u4194304)))
      (if (<= (pow4 candidate) value) candidate acc-9)))
    (acc-11 (let ((candidate (+ acc-10 u2097152)))
      (if (<= (pow4 candidate) value) candidate acc-10)))
    (acc-12 (let ((candidate (+ acc-11 u1048576)))
      (if (<= (pow4 candidate) value) candidate acc-11)))
    (acc-13 (let ((candidate (+ acc-12 u524288)))
      (if (<= (pow4 candidate) value) candidate acc-12)))
    (acc-14 (let ((candidate (+ acc-13 u262144)))
      (if (<= (pow4 candidate) value) candidate acc-13)))
    (acc-15 (let ((candidate (+ acc-14 u131072)))
      (if (<= (pow4 candidate) value) candidate acc-14)))
    (acc-16 (let ((candidate (+ acc-15 u65536)))
      (if (<= (pow4 candidate) value) candidate acc-15)))
    (acc-17 (let ((candidate (+ acc-16 u32768)))
      (if (<= (pow4 candidate) value) candidate acc-16)))
    (acc-18 (let ((candidate (+ acc-17 u16384)))
      (if (<= (pow4 candidate) value) candidate acc-17)))
    (acc-19 (let ((candidate (+ acc-18 u8192)))
      (if (<= (pow4 candidate) value) candidate acc-18)))
    (acc-20 (let ((candidate (+ acc-19 u4096)))
      (if (<= (pow4 candidate) value) candidate acc-19)))
    (acc-21 (let ((candidate (+ acc-20 u2048)))
      (if (<= (pow4 candidate) value) candidate acc-20)))
    (acc-22 (let ((candidate (+ acc-21 u1024)))
      (if (<= (pow4 candidate) value) candidate acc-21)))
    (acc-23 (let ((candidate (+ acc-22 u512)))
      (if (<= (pow4 candidate) value) candidate acc-22)))
    (acc-24 (let ((candidate (+ acc-23 u256)))
      (if (<= (pow4 candidate) value) candidate acc-23)))
    (acc-25 (let ((candidate (+ acc-24 u128)))
      (if (<= (pow4 candidate) value) candidate acc-24)))
    (acc-26 (let ((candidate (+ acc-25 u64)))
      (if (<= (pow4 candidate) value) candidate acc-25)))
    (acc-27 (let ((candidate (+ acc-26 u32)))
      (if (<= (pow4 candidate) value) candidate acc-26)))
    (acc-28 (let ((candidate (+ acc-27 u16)))
      (if (<= (pow4 candidate) value) candidate acc-27)))
    (acc-29 (let ((candidate (+ acc-28 u8)))
      (if (<= (pow4 candidate) value) candidate acc-28)))
    (acc-30 (let ((candidate (+ acc-29 u4)))
      (if (<= (pow4 candidate) value) candidate acc-29)))
    (acc-31 (let ((candidate (+ acc-30 u2)))
      (if (<= (pow4 candidate) value) candidate acc-30)))
    (acc-32 (let ((candidate (+ acc-31 u1)))
      (if (<= (pow4 candidate) value) candidate acc-31)))
  )
    acc-32
  )
)

(define-private (ceil-root4-128 (value uint))
  (let ((floor-value (floor-root4-128 value)))
    (if (is-eq (pow4 floor-value) value)
      floor-value
      (+ floor-value u1)
    )
  )
)

(define-private (ceil-div (numerator uint) (denominator uint))
  (if (is-eq numerator u0)
    u0
    (/ (+ numerator (- denominator u1)) denominator)
  )
)

(define-private (saturating-sub (left uint) (right uint))
  (if (>= left right)
    (- left right)
    u0
  )
)

(define-private (apply-fee-down (amount uint) (fee uint))
  (/ (* amount (- BPS-SCALE fee)) BPS-SCALE)
)

(define-private (max-trade-amount (reserve uint))
  (/ (* reserve (var-get max-trade-bps)) BPS-SCALE)
)

(define-private (self-principal)
  (as-contract? () tx-sender)
)

(define-private (resolve-sbtc-asset-name (token <ft-trait>))
  (if (is-eq (contract-of token) .mock-sbtc)
    (ok "mock-sbtc")
    (if (is-eq (contract-of token) 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token)
      (ok "sbtc-token")
      (err ERR-GUARD)
    )
  )
)

(define-private (resolve-quote-asset-name (token <ft-trait>))
  (if (is-eq (contract-of token) .mock-quote)
    (ok "mock-quote")
    (err ERR-GUARD)
  )
)

(define-private (guard-transfer-in (token <ft-trait>) (asset-name (string-ascii 32)) (amount uint) (recipient principal))
  (restrict-assets? tx-sender
    ((with-ft (contract-of token) asset-name amount))
    (try! (contract-call? token transfer amount tx-sender recipient none))
  )
)

(define-private (pull-sbtc-in-bound (amount uint) (recipient principal))
  (match (var-get sbtc-token)
    token-principal
      (if (is-eq token-principal .mock-sbtc)
        (restrict-assets? tx-sender
          ((with-ft .mock-sbtc "mock-sbtc" amount))
          (try! (contract-call? .mock-sbtc transfer amount tx-sender recipient none))
        )
        (if (is-eq token-principal 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token)
          (restrict-assets? tx-sender
            ((with-ft 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token "sbtc-token" amount))
            (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer amount tx-sender recipient none))
          )
          (err ERR-GUARD)
        )
      )
    (err ERR-GUARD)
  )
)

(define-private (assert-share-amount (share-amount uint))
  (if (<= share-amount (var-get share-supply))
    (ok true)
    (err ERR-SHARE-AMOUNT)
  )
)

(define-private (pull-quote-in-bound (amount uint) (recipient principal))
  (match (var-get quote-token)
    token-principal
      (if (is-eq token-principal .mock-quote)
        (restrict-assets? tx-sender
          ((with-ft .mock-quote "mock-quote" amount))
          (try! (contract-call? .mock-quote transfer amount tx-sender recipient none))
        )
        (err ERR-GUARD)
      )
    (err ERR-GUARD)
  )
)

(define-private (push-sbtc-out-bound (amount uint) (recipient principal))
  (match (var-get sbtc-token)
    token-principal
      (if (is-eq token-principal .mock-sbtc)
        (as-contract? ((with-ft .mock-sbtc "mock-sbtc" amount))
          (try! (contract-call? .mock-sbtc transfer amount tx-sender recipient none))
        )
        (if (is-eq token-principal 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token)
          (as-contract? ((with-ft 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token "sbtc-token" amount))
            (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer amount tx-sender recipient none))
          )
          (err ERR-GUARD)
        )
      )
    (err ERR-GUARD)
  )
)

(define-private (push-quote-out-bound (amount uint) (recipient principal))
  (match (var-get quote-token)
    token-principal
      (if (is-eq token-principal .mock-quote)
        (as-contract? ((with-ft .mock-quote "mock-quote" amount))
          (try! (contract-call? .mock-quote transfer amount tx-sender recipient none))
        )
        (err ERR-GUARD)
      )
    (err ERR-GUARD)
  )
)

(define-private (compute-sbtc-in-quote (amount-in uint))
  (let (
    (reserve-in (var-get reserve-sbtc))
    (reserve-out (var-get reserve-quote))
    (effective-in (apply-fee-down amount-in (var-get fee-bps)))
    (trade-limit (max-trade-amount (var-get reserve-sbtc)))
  )
    (asserts! (<= amount-in trade-limit) (err ERR-TRADE-TOO-LARGE))
    (let (
      (invariant (* (pow4 reserve-in) reserve-out))
      (next-reserve-in-pricing (+ reserve-in effective-in))
      (pricing-denominator (pow4 (+ reserve-in effective-in)))
      (reserve-out-after-upper (ceil-div (* (pow4 reserve-in) reserve-out) (pow4 (+ reserve-in effective-in))))
      (reserve-out-after-lower (/ (* (pow4 reserve-in) reserve-out) (pow4 (+ reserve-in effective-in))))
    )
      (ok {
        amount-in: amount-in,
        amount-in-effective: effective-in,
        amount-out-lower: (saturating-sub reserve-out reserve-out-after-upper),
        amount-out-upper: (saturating-sub reserve-out reserve-out-after-lower),
        invariant: invariant,
        reserve-in: reserve-in,
        reserve-out: reserve-out,
        trade-limit: trade-limit,
        next-reserve-in-pricing: next-reserve-in-pricing,
        pricing-denominator: pricing-denominator,
        reserve-out-after-upper: reserve-out-after-upper,
        reserve-out-after-lower: reserve-out-after-lower,
      })
    )
  )
)

(define-private (compute-quote-in-quote (amount-in uint))
  (let (
    (reserve-in (var-get reserve-quote))
    (reserve-out (var-get reserve-sbtc))
    (effective-in (apply-fee-down amount-in (var-get fee-bps)))
    (trade-limit (max-trade-amount (var-get reserve-quote)))
  )
    (asserts! (<= amount-in trade-limit) (err ERR-TRADE-TOO-LARGE))
    (let (
      (invariant (* (pow4 reserve-out) reserve-in))
      (next-reserve-in-pricing (+ reserve-in effective-in))
      (reserve-out-input-upper (ceil-div (* (pow4 reserve-out) reserve-in) (+ reserve-in effective-in)))
      (reserve-out-input-lower (/ (* (pow4 reserve-out) reserve-in) (+ reserve-in effective-in)))
    )
      (let (
        (reserve-out-after-upper (ceil-root4-128 reserve-out-input-upper))
        (reserve-out-after-lower (floor-root4-128 reserve-out-input-lower))
      )
        (ok {
          amount-in: amount-in,
          amount-in-effective: effective-in,
          amount-out-lower: (saturating-sub reserve-out reserve-out-after-upper),
          amount-out-upper: (saturating-sub reserve-out reserve-out-after-lower),
          invariant: invariant,
          reserve-in: reserve-in,
          reserve-out: reserve-out,
          trade-limit: trade-limit,
          next-reserve-in-pricing: next-reserve-in-pricing,
          reserve-out-input-upper: reserve-out-input-upper,
          reserve-out-input-lower: reserve-out-input-lower,
          reserve-out-after-upper: reserve-out-after-upper,
          reserve-out-after-lower: reserve-out-after-lower,
        })
      )
    )
  )
)

(define-read-only (get-owner)
  CONTRACT-OWNER
)

(define-read-only (is-initialized)
  (var-get initialized)
)

(define-read-only (get-config)
  {
    initialized: (var-get initialized),
    fee-bps: (var-get fee-bps),
    max-trade-bps: (var-get max-trade-bps),
  }
)

(define-read-only (get-pool-state)
  {
    reserve-sbtc: (var-get reserve-sbtc),
    reserve-quote: (var-get reserve-quote),
    share-supply: (var-get share-supply),
  }
)

(define-read-only (get-asset-bindings)
  {
    sbtc-token: (var-get sbtc-token),
    quote-token: (var-get quote-token),
  }
)

(define-read-only (get-safety-envelope)
  {
    min-sbtc-reserve: MIN-SBTC-RESERVE,
    min-quote-reserve: MIN-QUOTE-RESERVE,
    post-condition-mode-deny-required: true,
    contract-hash-binding-enabled: false,
    clarity4-guard-skeleton-enabled: true,
  }
)

(define-read-only (get-binding-status)
  {
    sbtc-token: (var-get sbtc-token),
    quote-token: (var-get quote-token),
    sbtc-is-mock: (is-eq (var-get sbtc-token) (some .mock-sbtc)),
    sbtc-is-requirement: (is-eq (var-get sbtc-token) (some 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token)),
    quote-is-mock: (is-eq (var-get quote-token) (some .mock-quote)),
  }
)

(define-read-only (get-sbtc-contract-hash)
  (match (var-get sbtc-token)
    token-principal
      (contract-hash? token-principal)
    (err u1)
  )
)

(define-read-only (get-quote-contract-hash)
  (match (var-get quote-token)
    token-principal
      (contract-hash? token-principal)
    (err u1)
  )
)

(define-read-only (quote-sbtc-in (amount-in uint))
  (begin
    (try! (assert-initialized))
    (try! (assert-positive amount-in))
    (match (compute-sbtc-in-quote amount-in)
      quote
        (ok {
          amount-in-effective: (get amount-in-effective quote),
          amount-out-lower: (get amount-out-lower quote),
          amount-out-upper: (get amount-out-upper quote),
        })
      err-code
        (err err-code)
    )
  )
)

(define-read-only (quote-quote-in (amount-in uint))
  (begin
    (try! (assert-initialized))
    (try! (assert-positive amount-in))
    (match (compute-quote-in-quote amount-in)
      quote
        (ok {
          amount-in-effective: (get amount-in-effective quote),
          amount-out-lower: (get amount-out-lower quote),
          amount-out-upper: (get amount-out-upper quote),
        })
      err-code
        (err err-code)
    )
  )
)

(define-read-only (debug-sbtc-in (amount-in uint))
  (begin
    (try! (assert-initialized))
    (try! (assert-positive amount-in))
    (compute-sbtc-in-quote amount-in)
  )
)

(define-read-only (debug-quote-in (amount-in uint))
  (begin
    (try! (assert-initialized))
    (try! (assert-positive amount-in))
    (compute-quote-in-quote amount-in)
  )
)

(define-public (initialize (sbtc <ft-trait>) (quote <ft-trait>) (initial-sbtc uint) (initial-quote uint) (pool-fee-bps uint) (pool-max-trade-bps uint))
  (begin
    (asserts! (not (var-get initialized)) (err ERR-ALREADY-INITIALIZED))
    (asserts! (>= initial-sbtc MIN-SBTC-RESERVE) (err ERR-MIN-SBTC-RESERVE))
    (asserts! (>= initial-quote MIN-QUOTE-RESERVE) (err ERR-MIN-QUOTE-RESERVE))
    (asserts! (<= pool-fee-bps MAX-FEE-BPS) (err ERR-FEE-BPS))
    (asserts! (and (>= pool-max-trade-bps MIN-MAX-TRADE-BPS) (<= pool-max-trade-bps MAX-MAX-TRADE-BPS)) (err ERR-MAX-TRADE-BPS))
    (let (
      (pool-principal (unwrap! (self-principal) (err ERR-GUARD)))
      (sbtc-asset-name (unwrap! (resolve-sbtc-asset-name sbtc) (err ERR-GUARD)))
      (quote-asset-name (unwrap! (resolve-quote-asset-name quote) (err ERR-GUARD)))
    )
      (try! (guard-transfer-in sbtc sbtc-asset-name initial-sbtc pool-principal))
      (try! (guard-transfer-in quote quote-asset-name initial-quote pool-principal))
      (var-set sbtc-token (some (contract-of sbtc)))
      (var-set quote-token (some (contract-of quote)))
      (var-set reserve-sbtc initial-sbtc)
      (var-set reserve-quote initial-quote)
      (var-set share-supply initial-sbtc)
      (var-set fee-bps pool-fee-bps)
      (var-set max-trade-bps pool-max-trade-bps)
      (var-set initialized true)
      (ok true)
    )
  )
)

(define-public (swap-sbtc-in (amount-in uint) (min-out uint))
  (begin
    (try! (assert-initialized))
    (try! (assert-positive amount-in))
    (match (compute-sbtc-in-quote amount-in)
      quote
        (let (
          (amount-out (get amount-out-lower quote))
          (next-reserve-sbtc (+ (var-get reserve-sbtc) amount-in))
          (next-reserve-quote (saturating-sub (var-get reserve-quote) (get amount-out-lower quote)))
          (pool-principal (unwrap! (self-principal) (err ERR-GUARD)))
        )
          (asserts! (>= amount-out min-out) (err ERR-SLIPPAGE))
          (asserts! (>= next-reserve-quote MIN-QUOTE-RESERVE) (err ERR-MIN-QUOTE-RESERVE))
          (try! (pull-sbtc-in-bound amount-in pool-principal))
          (try! (push-quote-out-bound amount-out tx-sender))
          (var-set reserve-sbtc next-reserve-sbtc)
          (var-set reserve-quote next-reserve-quote)
          (ok {
            amount-in: amount-in,
            amount-out: amount-out,
            reserve-sbtc: next-reserve-sbtc,
            reserve-quote: next-reserve-quote,
          })
        )
      err-code
        (err err-code)
    )
  )
)

(define-public (swap-quote-in (amount-in uint) (min-out uint))
  (begin
    (try! (assert-initialized))
    (try! (assert-positive amount-in))
    (match (compute-quote-in-quote amount-in)
      quote
        (let (
          (amount-out (get amount-out-lower quote))
          (next-reserve-quote (+ (var-get reserve-quote) amount-in))
          (next-reserve-sbtc (saturating-sub (var-get reserve-sbtc) (get amount-out-lower quote)))
          (pool-principal (unwrap! (self-principal) (err ERR-GUARD)))
        )
          (asserts! (>= amount-out min-out) (err ERR-SLIPPAGE))
          (asserts! (>= next-reserve-sbtc MIN-SBTC-RESERVE) (err ERR-MIN-SBTC-RESERVE))
          (try! (pull-quote-in-bound amount-in pool-principal))
          (try! (push-sbtc-out-bound amount-out tx-sender))
          (var-set reserve-quote next-reserve-quote)
          (var-set reserve-sbtc next-reserve-sbtc)
          (ok {
            amount-in: amount-in,
            amount-out: amount-out,
            reserve-sbtc: next-reserve-sbtc,
            reserve-quote: next-reserve-quote,
          })
        )
      err-code
        (err err-code)
    )
  )
)

(define-public (add-liquidity (sbtc-amount uint) (quote-amount uint))
  (begin
    (try! (assert-initialized))
    (try! (assert-positive sbtc-amount))
    (try! (assert-positive quote-amount))
    (let (
      (reserve-sbtc-now (var-get reserve-sbtc))
      (reserve-quote-now (var-get reserve-quote))
      (share-supply-now (var-get share-supply))
      (pool-principal (unwrap! (self-principal) (err ERR-GUARD)))
    )
      (asserts! (is-eq (* sbtc-amount reserve-quote-now) (* quote-amount reserve-sbtc-now)) (err ERR-LP-RATIO))
      (let (
        (minted-shares (/ (* sbtc-amount share-supply-now) reserve-sbtc-now))
        (next-reserve-sbtc (+ reserve-sbtc-now sbtc-amount))
        (next-reserve-quote (+ reserve-quote-now quote-amount))
      )
        (try! (assert-positive minted-shares))
        (try! (pull-sbtc-in-bound sbtc-amount pool-principal))
        (try! (pull-quote-in-bound quote-amount pool-principal))
        (var-set reserve-sbtc next-reserve-sbtc)
        (var-set reserve-quote next-reserve-quote)
        (var-set share-supply (+ share-supply-now minted-shares))
        (ok {
          minted-shares: minted-shares,
          reserve-sbtc: next-reserve-sbtc,
          reserve-quote: next-reserve-quote,
          share-supply: (+ share-supply-now minted-shares),
        })
      )
    )
  )
)

(define-public (remove-liquidity (share-amount uint))
  (begin
    (try! (assert-initialized))
    (try! (assert-positive share-amount))
    (try! (assert-share-amount share-amount))
    (let (
      (reserve-sbtc-now (var-get reserve-sbtc))
      (reserve-quote-now (var-get reserve-quote))
      (share-supply-now (var-get share-supply))
      (amount-sbtc (/ (* share-amount reserve-sbtc-now) share-supply-now))
      (amount-quote (/ (* share-amount reserve-quote-now) share-supply-now))
    )
      (let (
        (next-reserve-sbtc (saturating-sub reserve-sbtc-now amount-sbtc))
        (next-reserve-quote (saturating-sub reserve-quote-now amount-quote))
        (next-share-supply (- share-supply-now share-amount))
      )
        (asserts! (>= next-reserve-sbtc MIN-SBTC-RESERVE) (err ERR-MIN-SBTC-RESERVE))
        (asserts! (>= next-reserve-quote MIN-QUOTE-RESERVE) (err ERR-MIN-QUOTE-RESERVE))
        (try! (push-sbtc-out-bound amount-sbtc tx-sender))
        (try! (push-quote-out-bound amount-quote tx-sender))
        (var-set reserve-sbtc next-reserve-sbtc)
        (var-set reserve-quote next-reserve-quote)
        (var-set share-supply next-share-supply)
        (ok {
          amount-sbtc: amount-sbtc,
          amount-quote: amount-quote,
          reserve-sbtc: next-reserve-sbtc,
          reserve-quote: next-reserve-quote,
          share-supply: next-share-supply,
        })
      )
    )
  )
)
