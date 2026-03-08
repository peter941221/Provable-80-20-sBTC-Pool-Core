import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { deployer } from "../helpers";

describe("math-q32", () => {
  it("computes div-up and div-down", () => {
    const divDown = simnet.callReadOnlyFn(
      "math-q32",
      "div-down",
      [Cl.uint(7), Cl.uint(2)],
      deployer,
    );
    const divUp = simnet.callReadOnlyFn(
      "math-q32",
      "div-up",
      [Cl.uint(7), Cl.uint(2)],
      deployer,
    );

    expect(divDown.result).toBeOk(Cl.uint(3));
    expect(divUp.result).toBeOk(Cl.uint(4));
  });

  it("applies q32 multiplication and division conservatively", () => {
    const halfQ32 = 2n ** 31n;

    const mulDown = simnet.callReadOnlyFn(
      "math-q32",
      "mul-q-down",
      [Cl.uint(10), Cl.uint(halfQ32)],
      deployer,
    );
    const qdivUp = simnet.callReadOnlyFn(
      "math-q32",
      "qdiv-up",
      [Cl.uint(3), Cl.uint(2)],
      deployer,
    );

    expect(mulDown.result).toBeOk(Cl.uint(5));
    expect(qdivUp.result).toBeOk(Cl.uint(6442450944n));
  });

  it("applies fee-down and reserve domain checks", () => {
    const fee = simnet.callReadOnlyFn(
      "math-q32",
      "apply-fee-down",
      [Cl.uint(1000), Cl.uint(30)],
      deployer,
    );
    const okDomain = simnet.callReadOnlyFn(
      "math-q32",
      "assert-valid-reserve-domain",
      [Cl.uint(100000), Cl.uint(1000000)],
      deployer,
    );
    const badDomain = simnet.callReadOnlyFn(
      "math-q32",
      "assert-valid-reserve-domain",
      [Cl.uint(99999), Cl.uint(1000000)],
      deployer,
    );

    expect(fee.result).toBeOk(Cl.uint(997));
    expect(okDomain.result).toBeOk(Cl.bool(true));
    expect(badDomain.result).toBeErr(Cl.uint(102));
  });
});
