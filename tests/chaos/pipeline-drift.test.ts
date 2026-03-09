import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

function parseDocClaimIds(markdown: string): string[] {
  return markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .map((line) => line.match(/^##\s+(CL-\d+)\b/)?.[1])
    .filter((id): id is string => Boolean(id));
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

describe("chaos L5: pipeline drift detection", () => {
  it("keeps docs/claim-matrix.md claim IDs aligned with artifacts/claim-matrix.json", async () => {
    const docs = await readFile("docs/claim-matrix.md", "utf8");
    const artifact = JSON.parse(
      await readFile("artifacts/claim-matrix.json", "utf8"),
    ) as { claims: Array<{ id: string; panel?: string }> };

    const docIds = unique(parseDocClaimIds(docs));
    const artifactIds = unique(artifact.claims.map((claim) => claim.id));

    expect(docIds).toEqual(artifactIds);
  });

  it("keeps claim panels aligned with artifacts/demo-manifest.json console list", async () => {
    const artifact = JSON.parse(
      await readFile("artifacts/claim-matrix.json", "utf8"),
    ) as { claims: Array<{ id: string; panel?: string }> };
    const manifest = JSON.parse(
      await readFile("artifacts/demo-manifest.json", "utf8"),
    ) as { console: string[] };

    const consolePanels = new Set(manifest.console);
    const missing = artifact.claims
      .filter((claim) => claim.panel)
      .map((claim) => ({ id: claim.id, panel: claim.panel! }))
      .filter((entry) => !consolePanels.has(entry.panel));

    expect(missing).toEqual([]);
  });

  it("keeps judge console panel titles aligned with the demo manifest", async () => {
    const manifest = JSON.parse(
      await readFile("artifacts/demo-manifest.json", "utf8"),
    ) as { console: string[] };
    const app = await readFile("frontend/judge-console/app.js", "utf8");

    expect(manifest.console).toContain("Chaos Summary");

    for (const panelTitle of manifest.console) {
      expect(app).toContain(`title: "${panelTitle}"`);
    }
  });

  it("keeps artifacts/judge-console-data.json shape aligned with the UI expectations", async () => {
    const data = JSON.parse(
      await readFile("artifacts/judge-console-data.json", "utf8"),
    ) as Record<string, unknown>;

    for (const key of [
      "poolState",
      "quote",
      "witness",
      "safety",
      "binding",
      "sbtcHash",
      "quoteHash",
      "lpBalance",
    ]) {
      expect(data[key]).toBeDefined();
    }
  });

  it("keeps artifacts/proof-status.json claim structure aligned with the console", async () => {
    const proof = JSON.parse(
      await readFile("artifacts/proof-status.json", "utf8"),
    ) as { claims?: Array<{ id: string; status: string }> };

    const ids = proof.claims?.map((claim) => claim.id) ?? [];
    expect(ids).toEqual(["P0", "P1", "P2"]);
  });

  it("keeps artifacts/chaos-report.json internally consistent", async () => {
    const report = JSON.parse(
      await readFile("artifacts/chaos-report.json", "utf8"),
    ) as {
      summary?: { pass: number; fail: number };
      experiments?: Array<{ experiment_id: string; pass_fail: string }>;
    };

    const experiments = report.experiments ?? [];
    const summary = report.summary ?? { pass: 0, fail: 0 };

    expect(summary.pass + summary.fail).toBe(experiments.length);
    expect(experiments.map((exp) => exp.experiment_id)).toEqual(
      expect.arrayContaining(["E-ART-01", "E-LIVE-01", "E-MXS-01", "E-MXS-02", "E-BND-01"]),
    );
  });
});
