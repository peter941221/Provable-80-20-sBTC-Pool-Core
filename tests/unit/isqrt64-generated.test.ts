import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { deployer } from "../helpers";

describe("isqrt64-generated", () => {
  it("computes floor and ceil integer square roots", () => {
    const floor15 = simnet.callReadOnlyFn(
      "isqrt64-generated",
      "floor-isqrt64",
      [Cl.uint(15)],
      deployer,
    );
    const ceil15 = simnet.callReadOnlyFn(
      "isqrt64-generated",
      "ceil-isqrt64",
      [Cl.uint(15)],
      deployer,
    );
    const exact16 = simnet.callReadOnlyFn(
      "isqrt64-generated",
      "floor-isqrt64",
      [Cl.uint(16)],
      deployer,
    );

    expect(floor15.result).toBeOk(Cl.uint(3));
    expect(ceil15.result).toBeOk(Cl.uint(4));
    expect(exact16.result).toBeOk(Cl.uint(4));
  });

  it("handles the max u64 boundary exactly", () => {
    const max = simnet.callReadOnlyFn(
      "isqrt64-generated",
      "floor-isqrt64",
      [Cl.uint(18446744073709551615n)],
      deployer,
    );

    expect(max.result).toBeOk(Cl.uint(4294967295n));
  });

  it("computes conservative fourth roots", () => {
    const down = simnet.callReadOnlyFn(
      "isqrt64-generated",
      "root4-down",
      [Cl.uint(82)],
      deployer,
    );
    const up = simnet.callReadOnlyFn(
      "isqrt64-generated",
      "root4-up",
      [Cl.uint(82)],
      deployer,
    );

    expect(down.result).toBeOk(Cl.uint(3));
    expect(up.result).toBeOk(Cl.uint(4));
  });
});
