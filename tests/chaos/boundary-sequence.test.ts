import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

import { contractPrincipal, deployer } from "../helpers";

function mintMockTokens(sbtcAmount: bigint, quoteAmount: bigint) {
  simnet.callPublicFn(
    "mock-sbtc",
    "mint",
    [Cl.uint(sbtcAmount), Cl.standardPrincipal(deployer)],
    deployer,
  );
  simnet.callPublicFn(
    "mock-quote",
    "mint",
    [Cl.uint(quoteAmount), Cl.standardPrincipal(deployer)],
    deployer,
  );
}

function readPoolState() {
  const result = simnet.callReadOnlyFn(
    "pool-80-20",
    "get-pool-state",
    [],
    deployer,
  );
  return result.result;
}

describe("chaos L4: boundary-state sequences", () => {
  it("keeps state bounded and rejects an out-of-domain proportional LP add", () => {
    const initialSbtc = 100_000_000n;
    const initialQuote = 3_000_000n;

    // Ensure enough balance for init + both LP adds.
    mintMockTokens(initialSbtc + 20_000_000n, initialQuote + 600_000n);

    const init = simnet.callPublicFn(
      "pool-80-20",
      "initialize",
      [
        contractPrincipal("mock-sbtc"),
        contractPrincipal("mock-quote"),
        Cl.uint(initialSbtc),
        Cl.uint(initialQuote),
        Cl.uint(30),
        Cl.uint(1000),
      ],
      deployer,
    );

    expect(init.result).toBeOk(Cl.bool(true));

    const lpBalanceInit = simnet.callReadOnlyFn(
      "pool-80-20",
      "get-lp-balance",
      [Cl.standardPrincipal(deployer)],
      deployer,
    );
    expect(lpBalanceInit.result).toEqual(
      Cl.tuple({
        owner: Cl.standardPrincipal(deployer),
        balance: Cl.uint(initialSbtc),
      }),
    );

    const addSmall = simnet.callPublicFn(
      "pool-80-20",
      "add-liquidity",
      [Cl.uint(1_000_000), Cl.uint(30_000)],
      deployer,
    );

    expect(addSmall.result).toBeOk(
      Cl.tuple({
        "minted-shares": Cl.uint(1_000_000),
        "reserve-sbtc": Cl.uint(101_000_000),
        "reserve-quote": Cl.uint(3_030_000),
        "share-supply": Cl.uint(101_000_000),
      }),
    );

    const removeSmall = simnet.callPublicFn(
      "pool-80-20",
      "remove-liquidity",
      [Cl.uint(1_000_000)],
      deployer,
    );

    expect(removeSmall.result).toBeOk(
      Cl.tuple({
        "amount-sbtc": Cl.uint(1_000_000),
        "amount-quote": Cl.uint(30_000),
        "reserve-sbtc": Cl.uint(initialSbtc),
        "reserve-quote": Cl.uint(initialQuote),
        "share-supply": Cl.uint(initialSbtc),
      }),
    );

    const stateBefore = readPoolState();

    // This keeps the exact 3/100 ratio, but should exceed the explicit uint128 safety envelope.
    const addTooLarge = simnet.callPublicFn(
      "pool-80-20",
      "add-liquidity",
      [Cl.uint(10_000_000), Cl.uint(300_000)],
      deployer,
    );

    expect(addTooLarge.result).toBeErr(Cl.uint(412));

    const stateAfter = readPoolState();
    expect(stateAfter).toEqual(stateBefore);
  });
});

