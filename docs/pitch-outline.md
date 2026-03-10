# Pitch Outline

## Opening

We turned weighted BTCFi math into a bounded, provable, demo-ready Stacks primitive.

## Problem

- General weighted AMMs are hard to implement and even harder to prove in a hackathon timeline
- If the protocol surface is too big, the evidence surface becomes weak

## Insight

- Fix the pool to `80/20`
- Reduce the invariant to `x^4 * y = K`
- Use integer witnesses and conservative rounding

## Why It Matters

- easier to inspect
- easier to test
- easier to explain to judges
- better fit for Stacks + Clarity + sBTC storytelling

## Demo Proof Points

- readonly quote exposes lower and upper
- write path uses the lower bound
- explicit math-domain checks guard reserve transitions
- guard surfaces are explicit
- reference model comparisons are automated
- sBTC requirement and fixed-height MXS assertions are already wired

## Close

This is not trying to win by adding protocol sprawl.

It wins by making correctness visible, bounded, and believable.

## Next Steps

1. Harden hash-enforced bindings on write paths
2. Expand the judge console vectors and keep the demo fully replayable (artifact + live readonly)
3. Package the final submission story: README, claim matrix, demo script, and screenshots/gifs
