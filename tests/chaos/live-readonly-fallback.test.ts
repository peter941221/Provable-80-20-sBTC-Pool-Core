import { describe, expect, it } from "vitest";

import { loadLiveWithFallback } from "../../frontend/judge-console/bundle-loader.js";

describe("chaos L2: live readonly fallback", () => {
  it("falls back to artifacts when live readonly fails", async () => {
    const loadLiveBundle = async () => {
      const error = new Error("HTTP 429");
      (error as any).code = "LIVE_READONLY";
      throw error;
    };

    const loadArtifactBundle = async () => ({
      proof: { phase: "test", status: "ok", claims: [] },
      manifest: { status: "test" },
      snapshot: { overview: { invariant: "x^4 * y = K", claim: "lower <= ideal <= upper" }, safety: {} },
      live: { source: "artifact" },
      claimMatrix: { claims: [] },
      sourceLabel: "artifact bundle",
      issues: [],
    });

    const bundle = await loadLiveWithFallback({ loadLiveBundle, loadArtifactBundle });

    expect(bundle.sourceLabel).toContain("fallback from live");
    expect(bundle.issues?.[0]?.layer).toBe("L2-live-readonly");
  });

  it("does not fall back on input validation errors", async () => {
    const loadLiveBundle = async () => {
      const error = new Error("missing contract principal");
      (error as any).code = "INPUT";
      throw error;
    };

    const loadArtifactBundle = async () => {
      throw new Error("should not be called");
    };

    await expect(
      loadLiveWithFallback({ loadLiveBundle, loadArtifactBundle }),
    ).rejects.toMatchObject({ message: "missing contract principal" });
  });
});
