# Demo Script

## 30 Seconds

- This is a fixed `80/20` sBTC pool core on Stacks
- We reduce weighted AMM math to `x^4 * y = K`
- That lets us expose a bounded witness and conservative swap outputs

## 90 Seconds

1. Show pool state and fixed scope
2. Show readonly quote for one sample trade
3. Show `amount-in-effective`, `lower`, `upper`, and witness values
4. Explain that the write path uses the conservative lower bound

## 3 Minutes

1. Open Judge Console
2. Show Overview panel
3. Show Swap Verifier panel
4. Show Witness Explorer panel
5. Execute or describe one matching write-path swap
6. Show Safety & Bindings panel, including the explicit math-domain envelope

## 5 Minutes

1. Show sBTC requirement wiring
2. Show MXS manifest generation and fixed-height assertion command
3. Show the claim matrix tying claims to theorem / test / artifact evidence
4. Show LP safety: `lp-balances` makes withdrawals require LP share ownership
5. Show resilience evidence: degraded artifact + live readonly fallback + chaos report
6. Close with why fixed 80/20 is the correct hackathon tradeoff

## Commands

```bash
npm run validate:full
npm run validate:chaos
python scripts/gen_mxs_manifest.py
```

## Next Steps

1. Add screenshots or gifs for each panel
2. Record one clean live-readonly walkthrough using a deployed contract principal
3. Extend pipeline-drift chaos only if it reduces demo-day risk
