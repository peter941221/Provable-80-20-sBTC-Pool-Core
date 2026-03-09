import { describe, expect, it } from "vitest";
import { Cl, cvToJSON } from "@stacks/transactions";
import { deployer } from "../helpers";

const SBTC_TOKEN = "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token";
const POX_4 = "SP000000000000000000002Q6VF78.pox-4";

describe("mxs mainnet-realism", () => {
  it("loads official sBTC token wiring under the fixed-height manifest", () => {
    const symbol = simnet.callReadOnlyFn(SBTC_TOKEN, "get-symbol", [], deployer);

    expect(symbol.result).toBeOk(Cl.stringAscii("sBTC"));
  }, 60000);

  it("replays a fixed pox-4 mapping at height 522000 without remote-data errors", () => {
    const rewardCycle = simnet.callReadOnlyFn(
      POX_4,
      "burn-height-to-reward-cycle",
      [Cl.uint(881065)],
      deployer,
    );

    const rewardCycleJson = cvToJSON(rewardCycle.result);

    expect(rewardCycleJson.type).toBe("uint");
    expect(Number(rewardCycleJson.value)).toBeGreaterThan(0);
  }, 60000);

  it("keeps the pool math-domain envelope visible under the mxs manifest", () => {
    const safetyEnvelope = simnet.callReadOnlyFn(
      "pool-80-20",
      "get-safety-envelope",
      [],
      deployer,
    );

    expect(safetyEnvelope.result).toEqual(
      Cl.tuple({
        "min-sbtc-reserve": Cl.uint(100000),
        "min-quote-reserve": Cl.uint(1000000),
        "post-condition-mode-deny-required": Cl.bool(true),
        "contract-hash-binding-enabled": Cl.bool(true),
        "clarity4-guard-skeleton-enabled": Cl.bool(true),
        "math-domain-guard-enabled": Cl.bool(true),
        "max-safe-pow4-input": Cl.uint(4294967295n),
        "max-safe-sbtc-at-min-quote": Cl.uint(135818791n),
      }),
    );
  }, 60000);
});
