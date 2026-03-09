# MXS

Generate an MXS manifest with:

`python scripts/gen_mxs_manifest.py`

Smoke-check the manifest with:

`clarinet check -m Clarinet.mxs.toml -c`

Run the assertion suite with:

`npm run test:mxs`

This uses mainnet remote data starting at height `522000`.

Current fixed scenarios:

- official `sBTC` token wiring remains readable
- `pox-4` `burn-height-to-reward-cycle(u881065)` returns a positive `uint` under the fixed-height replay
- the pool's explicit math-domain safety envelope remains visible under the MXS manifest

If remote-data calls fail due to rate limits, set `HIRO_API_KEY` or retry against the default Hiro endpoint.

If MXS fails, treat it as an infra / remote-data dependency until proven otherwise:

- Run `npm run chaos:report` and inspect `artifacts/chaos-report.json` (`E-MXS-*`) for failure classification and the fixed `api_url` + `initial_height` context.
- Keep protocol-level failures separate (contract error codes, math-domain reverts, etc.).
