(impl-trait .sip-010-ft-trait.sip-010-ft-trait)

(define-fungible-token mock-quote)

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED u300)

(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err ERR-UNAUTHORIZED))
    (try! (ft-mint? mock-quote amount recipient))
    (ok true)
  )
)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo_ (optional (buff 34))))
  (begin
    (asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender)) (err ERR-UNAUTHORIZED))
    (try! (ft-transfer? mock-quote amount sender recipient))
    (ok true)
  )
)

(define-read-only (get-name)
  (ok "Mock Quote")
)

(define-read-only (get-symbol)
  (ok "mQUOTE")
)

(define-read-only (get-decimals)
  (ok u6)
)

(define-read-only (get-balance (owner principal))
  (ok (ft-get-balance mock-quote owner))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply mock-quote))
)

(define-read-only (get-token-uri)
  (ok none)
)
