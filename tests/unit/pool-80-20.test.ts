import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { contractPrincipal, deployer, wallet1 } from "../helpers";

const MAX_SAFE_SBTC_AT_MIN_QUOTE = 135818791n;
const MAX_SAFE_QUOTE_AT_MIN_SBTC = 3402823669209384634n;

function seedBalances(
  sbtcAmount: bigint = 500000000n,
  quoteAmount: bigint = 500000000n,
) {
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

function seedInitialBalances() {
  seedBalances();
}

function initializePoolWithAmounts(
  initialSbtc: bigint,
  initialQuote: bigint,
  poolFeeBps: bigint = 30n,
  poolMaxTradeBps: bigint = 1000n,
) {
  return simnet.callPublicFn(
    "pool-80-20",
    "initialize",
    [
      contractPrincipal("mock-sbtc"),
      contractPrincipal("mock-quote"),
      Cl.uint(initialSbtc),
      Cl.uint(initialQuote),
      Cl.uint(poolFeeBps),
      Cl.uint(poolMaxTradeBps),
    ],
    deployer,
  );
}

function initializePool() {
  seedInitialBalances();

  return initializePoolWithAmounts(100000n, 1000000n);
}

function initializePoolWithBuffer() {
  seedInitialBalances();

  return initializePoolWithAmounts(200000n, 2000000n);
}

describe("pool-80-20 shell", () => {
  it("initializes config, bindings, and guarded balances once", () => {
    const init = initializePool();

    expect(init.result).toBeOk(Cl.bool(true));
    expect(simnet.getDataVar("pool-80-20", "initialized")).toBeBool(true);
    expect(simnet.getDataVar("pool-80-20", "reserve-sbtc")).toBeUint(100000);
    expect(simnet.getDataVar("pool-80-20", "reserve-quote")).toBeUint(1000000);
    expect(simnet.getDataVar("pool-80-20", "sbtc-token")).toBeSome(
      contractPrincipal("mock-sbtc"),
    );

    const poolSbtcBalance = simnet.callReadOnlyFn(
      "mock-sbtc",
      "get-balance",
      [contractPrincipal("pool-80-20")],
      deployer,
    );
    const poolQuoteBalance = simnet.callReadOnlyFn(
      "mock-quote",
      "get-balance",
      [contractPrincipal("pool-80-20")],
      deployer,
    );

    expect(poolSbtcBalance.result).toBeOk(Cl.uint(100000));
    expect(poolQuoteBalance.result).toBeOk(Cl.uint(1000000));

    const lpBalance = simnet.callReadOnlyFn(
      "pool-80-20",
      "get-lp-balance",
      [Cl.standardPrincipal(deployer)],
      deployer,
    );

    expect(lpBalance.result).toEqual(
      Cl.tuple({
        owner: Cl.standardPrincipal(deployer),
        balance: Cl.uint(100000),
      }),
    );
  });

  it("rejects re-initialization", () => {
    initializePool();

    const second = initializePoolWithAmounts(100000n, 1000000n);

    expect(second.result).toBeErr(Cl.uint(400));
  });

  it("exposes the explicit math-domain guard in the safety envelope", () => {
    initializePool();

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
        "max-safe-sbtc-at-min-quote": Cl.uint(MAX_SAFE_SBTC_AT_MIN_QUOTE),
      }),
    );
  });

  it("allows the safe reserve frontier and rejects one step beyond it", () => {
    seedBalances(MAX_SAFE_SBTC_AT_MIN_QUOTE, 1000000n);

    const frontier = initializePoolWithAmounts(
      MAX_SAFE_SBTC_AT_MIN_QUOTE,
      1000000n,
    );

    expect(frontier.result).toBeOk(Cl.bool(true));
  });

  it("rejects initialization outside the explicit math domain", () => {
    seedBalances(MAX_SAFE_SBTC_AT_MIN_QUOTE + 1n, 1000000n);

    const init = initializePoolWithAmounts(
      MAX_SAFE_SBTC_AT_MIN_QUOTE + 1n,
      1000000n,
    );

    expect(init.result).toBeErr(Cl.uint(412));
    expect(simnet.getDataVar("pool-80-20", "initialized")).toBeBool(false);
  });

  it("returns conservative sbtc-in quotes and witness", () => {
    initializePool();

    const quote = simnet.callReadOnlyFn(
      "pool-80-20",
      "quote-sbtc-in",
      [Cl.uint(1000)],
      deployer,
    );
    const debug = simnet.callReadOnlyFn(
      "pool-80-20",
      "debug-sbtc-in",
      [Cl.uint(1000)],
      deployer,
    );

    expect(quote.result).toBeOk(
      Cl.tuple({
        "amount-in-effective": Cl.uint(997),
        "amount-out-lower": Cl.uint(38905),
        "amount-out-upper": Cl.uint(38906),
      }),
    );
    expect(debug.result).toBeOk(
      Cl.tuple({
        "amount-in": Cl.uint(1000),
        "amount-in-effective": Cl.uint(997),
        "amount-out-lower": Cl.uint(38905),
        "amount-out-upper": Cl.uint(38906),
        "invariant": Cl.uint(100000000000000000000000000n),
        "reserve-in": Cl.uint(100000),
        "reserve-out": Cl.uint(1000000),
        "trade-limit": Cl.uint(10000),
        "next-reserve-in-pricing": Cl.uint(100997),
        "pricing-denominator": Cl.uint(104048037938843092081n),
        "reserve-out-after-upper": Cl.uint(961095),
        "reserve-out-after-lower": Cl.uint(961094),
      }),
    );
  });

  it("returns conservative quote-in quotes and witness", () => {
    initializePool();

    const quote = simnet.callReadOnlyFn(
      "pool-80-20",
      "quote-quote-in",
      [Cl.uint(2000)],
      deployer,
    );
    const debug = simnet.callReadOnlyFn(
      "pool-80-20",
      "debug-quote-in",
      [Cl.uint(2000)],
      deployer,
    );

    expect(quote.result).toBeOk(
      Cl.tuple({
        "amount-in-effective": Cl.uint(1994),
        "amount-out-lower": Cl.uint(49),
        "amount-out-upper": Cl.uint(50),
      }),
    );
    expect(debug.result).toBeOk(
      Cl.tuple({
        "amount-in": Cl.uint(2000),
        "amount-in-effective": Cl.uint(1994),
        "amount-out-lower": Cl.uint(49),
        "amount-out-upper": Cl.uint(50),
        "invariant": Cl.uint(100000000000000000000000000n),
        "reserve-in": Cl.uint(1000000),
        "reserve-out": Cl.uint(100000),
        "trade-limit": Cl.uint(100000),
        "next-reserve-in-pricing": Cl.uint(1001994),
        "reserve-out-input-upper": Cl.uint(99800996812356161814n),
        "reserve-out-input-lower": Cl.uint(99800996812356161813n),
        "reserve-out-after-upper": Cl.uint(99951),
        "reserve-out-after-lower": Cl.uint(99950),
      }),
    );
  });

  it("executes swap-sbtc-in against lower bound and updates balances", () => {
    initializePoolWithBuffer();

    const swap = simnet.callPublicFn(
      "pool-80-20",
      "swap-sbtc-in",
      [Cl.uint(1000), Cl.uint(38905)],
      deployer,
    );

    expect(swap.result).toBeOk(
      Cl.tuple({
        "amount-in": Cl.uint(1000),
        "amount-out": Cl.uint(39387),
        "reserve-sbtc": Cl.uint(201000),
        "reserve-quote": Cl.uint(1960613),
      }),
    );
    expect(simnet.getDataVar("pool-80-20", "reserve-sbtc")).toBeUint(201000);
    expect(simnet.getDataVar("pool-80-20", "reserve-quote")).toBeUint(1960613);

    const deployerSbtc = simnet.callReadOnlyFn(
      "mock-sbtc",
      "get-balance",
      [Cl.standardPrincipal(deployer)],
      deployer,
    );
    const deployerQuote = simnet.callReadOnlyFn(
      "mock-quote",
      "get-balance",
      [Cl.standardPrincipal(deployer)],
      deployer,
    );

    expect(deployerSbtc.result).toBeOk(Cl.uint(499799000));
    expect(deployerQuote.result).toBeOk(Cl.uint(498039387));
  });

  it("executes swap-quote-in against lower bound and updates balances", () => {
    initializePoolWithBuffer();

    const swap = simnet.callPublicFn(
      "pool-80-20",
      "swap-quote-in",
      [Cl.uint(2000), Cl.uint(49)],
      deployer,
    );

    expect(swap.result).toBeOk(
      Cl.tuple({
        "amount-in": Cl.uint(2000),
        "amount-out": Cl.uint(49),
        "reserve-sbtc": Cl.uint(199951),
        "reserve-quote": Cl.uint(2002000),
      }),
    );
    expect(simnet.getDataVar("pool-80-20", "reserve-sbtc")).toBeUint(199951);
    expect(simnet.getDataVar("pool-80-20", "reserve-quote")).toBeUint(2002000);
  });

  it("rejects sbtc-in writes that would leave the explicit math domain", () => {
    seedBalances(MAX_SAFE_SBTC_AT_MIN_QUOTE + 1n, 1000000n);
    initializePoolWithAmounts(MAX_SAFE_SBTC_AT_MIN_QUOTE, 1000000n);

    const swap = simnet.callPublicFn(
      "pool-80-20",
      "swap-sbtc-in",
      [Cl.uint(1), Cl.uint(0)],
      deployer,
    );

    expect(swap.result).toBeErr(Cl.uint(412));
  });

  it("rejects quote-in writes that would leave the explicit math domain", () => {
    seedBalances(100000n, MAX_SAFE_QUOTE_AT_MIN_SBTC + 1n);
    initializePoolWithAmounts(100000n, MAX_SAFE_QUOTE_AT_MIN_SBTC);

    const swap = simnet.callPublicFn(
      "pool-80-20",
      "swap-quote-in",
      [Cl.uint(1), Cl.uint(0)],
      deployer,
    );

    expect(swap.result).toBeErr(Cl.uint(412));
  });

  it("exposes binding status and contract hashes", () => {
    initializePool();

    const bindingStatus = simnet.callReadOnlyFn(
      "pool-80-20",
      "get-binding-status",
      [],
      deployer,
    );
    const sbtcHash = simnet.callReadOnlyFn(
      "pool-80-20",
      "get-sbtc-contract-hash",
      [],
      deployer,
    );
    const quoteHash = simnet.callReadOnlyFn(
      "pool-80-20",
      "get-quote-contract-hash",
      [],
      deployer,
    );

    expect(bindingStatus.result).toEqual(
      Cl.tuple({
        "sbtc-token": Cl.some(contractPrincipal("mock-sbtc")),
        "quote-token": Cl.some(contractPrincipal("mock-quote")),
        "sbtc-is-mock": Cl.bool(true),
        "sbtc-is-requirement": Cl.bool(false),
        "quote-is-mock": Cl.bool(true),
        "sbtc-hash-bound": Cl.bool(true),
        "quote-hash-bound": Cl.bool(true),
      }),
    );
    expect(sbtcHash.result).toBeOk(expect.anything());
    expect(quoteHash.result).toBeOk(expect.anything());
  });

  it("adds liquidity proportionally and mints shares", () => {
    initializePoolWithBuffer();

    const result = simnet.callPublicFn(
      "pool-80-20",
      "add-liquidity",
      [Cl.uint(1000), Cl.uint(10000)],
      deployer,
    );

    expect(result.result).toBeOk(
      Cl.tuple({
        "minted-shares": Cl.uint(1000),
        "reserve-sbtc": Cl.uint(201000),
        "reserve-quote": Cl.uint(2010000),
        "share-supply": Cl.uint(201000),
      }),
    );
  });

  it("rejects proportional liquidity additions that would leave the explicit math domain", () => {
    seedBalances(MAX_SAFE_SBTC_AT_MIN_QUOTE * 2n, 2000000n);
    initializePoolWithAmounts(MAX_SAFE_SBTC_AT_MIN_QUOTE, 1000000n);

    const result = simnet.callPublicFn(
      "pool-80-20",
      "add-liquidity",
      [Cl.uint(MAX_SAFE_SBTC_AT_MIN_QUOTE), Cl.uint(1000000n)],
      deployer,
    );

    expect(result.result).toBeErr(Cl.uint(412));
  });

  it("removes liquidity proportionally", () => {
    initializePoolWithBuffer();
    simnet.callPublicFn(
      "pool-80-20",
      "add-liquidity",
      [Cl.uint(1000), Cl.uint(10000)],
      deployer,
    );

    const result = simnet.callPublicFn(
      "pool-80-20",
      "remove-liquidity",
      [Cl.uint(1000)],
      deployer,
    );

    expect(result.result).toBeOk(
      Cl.tuple({
        "amount-sbtc": Cl.uint(1000),
        "amount-quote": Cl.uint(10000),
        "reserve-sbtc": Cl.uint(200000),
        "reserve-quote": Cl.uint(2000000),
        "share-supply": Cl.uint(200000),
      }),
    );
  });

  it("rejects remove-liquidity for non-LP callers", () => {
    initializePoolWithBuffer();

    const result = simnet.callPublicFn(
      "pool-80-20",
      "remove-liquidity",
      [Cl.uint(1)],
      wallet1,
    );

    expect(result.result).toBeErr(Cl.uint(414));
  });
});
