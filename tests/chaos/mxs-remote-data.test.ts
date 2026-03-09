import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import {
  classifyRemoteDataFailure,
  parseRemoteDataConfig,
} from "../../scripts/chaos-lib.js";

describe("chaos L3: MXS / remote-data classification", () => {
  it("records fixed-height remote_data config from Clarinet.mxs.toml", async () => {
    const toml = await readFile("Clarinet.mxs.toml", "utf8");
    const config = parseRemoteDataConfig(toml);

    expect(config.enabled).toBe(true);
    expect(config.api_url).toMatch(/^https?:\/\//);
    expect(config.initial_height).toBe(522000);
    expect(config.use_mainnet_wallets).toBe(true);
  });

  it("classifies 429 as infra rate_limit (not protocol)", () => {
    const classification = classifyRemoteDataFailure(
      new Error("HTTP 429 Too Many Requests"),
    );

    expect(classification.failure_classification).toBe("infra");
    expect(classification.kind).toBe("rate_limit");
    expect(classification.hint).toMatch(/HIRO_API_KEY/i);
  });

  it("classifies unreachable network failures as infra network", () => {
    const classification = classifyRemoteDataFailure(
      new Error("fetch failed: ECONNREFUSED"),
    );

    expect(classification.failure_classification).toBe("infra");
    expect(classification.kind).toBe("network");
  });
});

