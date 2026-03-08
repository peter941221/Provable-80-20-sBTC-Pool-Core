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
- guard surfaces are explicit
- reference model comparisons are automated
- sBTC requirement and MXS are already wired

## Close

This is not trying to win by adding protocol sprawl.

It wins by making correctness visible, bounded, and believable.

## Next Steps

1. Turn placeholder proof status into completed proof artifacts
2. Wire final live Judge Console reads
3. Package the repo, demo, and README around one consistent claim table
