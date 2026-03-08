import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { deployer, wallet1 } from "../helpers";

describe("mock tokens", () => {
  it("lets the deployer mint mock-sbtc", () => {
    const mint = simnet.callPublicFn(
      "mock-sbtc",
      "mint",
      [Cl.uint(250000000), Cl.standardPrincipal(wallet1)],
      deployer,
    );
    const balance = simnet.callReadOnlyFn(
      "mock-sbtc",
      "get-balance",
      [Cl.standardPrincipal(wallet1)],
      deployer,
    );

    expect(mint.result).toBeOk(Cl.bool(true));
    expect(balance.result).toBeOk(Cl.uint(250000000));
  });

  it("blocks non-owner minting on mock-quote", () => {
    const mint = simnet.callPublicFn(
      "mock-quote",
      "mint",
      [Cl.uint(1000000), Cl.standardPrincipal(wallet1)],
      wallet1,
    );

    expect(mint.result).toBeErr(Cl.uint(300));
  });
});
