# Judge Console

Judge-facing console for demo storytelling and evidence review.

Default mode:

- loads local artifacts from `artifacts/`
- hydrates the six judge panels

Live readonly mode:

- accepts a Stacks API base URL
- accepts a deployed `pool-80-20` contract principal
- calls browser-side readonly endpoints for pool state, quote, witness, and safety surfaces
- falls back to artifacts if live loading is unavailable

Open `frontend/judge-console/index.html` in a browser served over HTTP for the best experience.

Panels included:

- Overview
- Swap Verifier
- Witness Explorer
- LP Verifier
- Safety & Bindings
- Chaos Summary
- Proof Status
