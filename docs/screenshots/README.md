# Screenshots

This folder holds judge-facing visuals for the README / hackathon submission.

Current file:

- `judge-console-panels.png`: a high-fidelity screenshot of the Judge Console panels.
- `invariant-reduction.svg`: the core math reduction (weighted 80/20 -> integer form).
- `evidence-chain.svg`: the claim -> contract -> tests -> artifacts -> console/proof chain.

To capture real screenshots (manual):

1. Run `npm run validate:chaos` (ensures artifacts + chaos report exist).
2. Run `python -m http.server 8000`.
3. Open `http://127.0.0.1:8000/frontend/judge-console/`.
4. Use your browser's screenshot tool and replace the SVG with PNGs if desired.
