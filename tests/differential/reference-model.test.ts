import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { contractPrincipal, deployer } from "../helpers";

function initializePool() {
  simnet.callPublicFn(
    "mock-sbtc",
    "mint",
    [Cl.uint(500000000), Cl.standardPrincipal(deployer)],
    deployer,
  );
  simnet.callPublicFn(
    "mock-quote",
    "mint",
    [Cl.uint(500000000), Cl.standardPrincipal(deployer)],
    deployer,
  );

  simnet.callPublicFn(
    "pool-80-20",
    "initialize",
    [
      contractPrincipal("mock-sbtc"),
      contractPrincipal("mock-quote"),
      Cl.uint(100000),
      Cl.uint(1000000),
      Cl.uint(30),
      Cl.uint(1000),
    ],
    deployer,
  );
}

function runModel(direction: "sbtc-in" | "quote-in", amountIn: number) {
  return JSON.parse(
    execFileSync(
      "python",
      [
        "sim/reference_model.py",
        direction,
        "100000",
        "1000000",
        "30",
        "1000",
        String(amountIn),
      ],
      { encoding: "utf8" },
    ),
  ) as {
    amount_in_effective: number;
    amount_out_lower: number;
    amount_out_upper: number;
    trade_limit: number;
  };
}

describe("reference model differential", () => {
  it("matches sbtc-in quotes", () => {
    initializePool();
    const model = runModel("sbtc-in", 1000);
    const chain = simnet.callReadOnlyFn(
      "pool-80-20",
      "quote-sbtc-in",
      [Cl.uint(1000)],
      deployer,
    );

    expect(chain.result).toBeOk(
      Cl.tuple({
        "amount-in-effective": Cl.uint(model.amount_in_effective),
        "amount-out-lower": Cl.uint(model.amount_out_lower),
        "amount-out-upper": Cl.uint(model.amount_out_upper),
      }),
    );
  });

  it("matches quote-in quotes", () => {
    initializePool();
    const model = runModel("quote-in", 2000);
    const chain = simnet.callReadOnlyFn(
      "pool-80-20",
      "quote-quote-in",
      [Cl.uint(2000)],
      deployer,
    );

    expect(chain.result).toBeOk(
      Cl.tuple({
        "amount-in-effective": Cl.uint(model.amount_in_effective),
        "amount-out-lower": Cl.uint(model.amount_out_lower),
        "amount-out-upper": Cl.uint(model.amount_out_upper),
      }),
    );
  });

  it("matches add-liquidity arithmetic", () => {
    const model = JSON.parse(
      execFileSync(
        "python",
        [
          "sim/reference_model.py",
          "add-liquidity",
          "200000",
          "2000000",
          "30",
          "1000",
          "1000",
          "10000",
        ],
        { encoding: "utf8" },
      ),
    ) as {
      minted_shares: number;
      reserve_sbtc: number;
      reserve_quote: number;
      share_supply: number;
    };

    expect(model).toEqual({
      minted_shares: 1000,
      reserve_sbtc: 201000,
      reserve_quote: 2010000,
      share_supply: 201000,
    });
  });
});
