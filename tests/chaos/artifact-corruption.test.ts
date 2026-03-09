import { describe, expect, it } from "vitest";

import { loadArtifactBundle } from "../../frontend/judge-console/bundle-loader.js";

describe("chaos L1: artifact corruption", () => {
  it("degrades when claim-matrix.json is missing (no silent success)", async () => {
    const artifacts: Record<string, unknown> = {
      "artifacts/proof-status.json": {
        phase: "test",
        status: "in-progress",
        claims: [
          { id: "P0", status: "completed" },
          { id: "P1", status: "completed" },
          { id: "P2", status: "completed" },
        ],
      },
      "artifacts/demo-manifest.json": { status: "test" },
      "artifacts/console-snapshot.json": {
        overview: { invariant: "x^4 * y = K", claim: "lower <= ideal <= upper" },
        safety: { post_condition_mode: "Deny" },
      },
      "artifacts/judge-console-data.json": {
        source: "fixture",
        poolState: { type: "tuple", value: { "share-supply": { type: "uint", value: "1" } } },
        quote: { type: "tuple", value: {} },
        witness: { type: "tuple", value: {} },
        safety: { type: "tuple", value: {} },
        binding: { type: "tuple", value: {} },
        sbtcHash: { type: "response", value: "n/a" },
        quoteHash: { type: "response", value: "n/a" },
      },
    };

    const loadJson = async (path: string) => {
      if (!(path in artifacts)) throw new Error("missing");
      return artifacts[path];
    };

    const bundle = await loadArtifactBundle({ loadJson, basePath: "artifacts" });

    expect(bundle.sourceLabel).toContain("degraded");
    expect(bundle.claimMatrix.claims).toEqual([]);
    expect(bundle.issues.some((issue) => issue.path?.endsWith("claim-matrix.json"))).toBe(
      true,
    );
  });
});

