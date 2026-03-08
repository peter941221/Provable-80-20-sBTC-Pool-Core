import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { deployer } from "../helpers";

const SBTC_TOKEN = "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token";

describe("sbtc requirement wiring", () => {
  it("loads the official sbtc token requirement into the simnet", () => {
    const symbol = simnet.callReadOnlyFn(SBTC_TOKEN, "get-symbol", [], deployer);

    expect(symbol.result).toBeOk(Cl.stringAscii("sBTC"));
  });
});
