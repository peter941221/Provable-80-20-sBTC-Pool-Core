import { initSimnet } from "@stacks/clarinet-sdk";
import { Cl, cvToJSON } from "@stacks/transactions";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const artifactsDir = path.join(root, "artifacts");

function unwrapResult(result) {
  return cvToJSON(result.result);
}

const simnet = await initSimnet("./Clarinet.toml", true, {
  trackCosts: false,
  trackCoverage: false,
});

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer");

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
    Cl.contractPrincipal(deployer, "mock-sbtc"),
    Cl.contractPrincipal(deployer, "mock-quote"),
    Cl.uint(200000),
    Cl.uint(2000000),
    Cl.uint(30),
    Cl.uint(1000),
  ],
  deployer,
);

const poolState = simnet.callReadOnlyFn("pool-80-20", "get-pool-state", [], deployer);
const quote = simnet.callReadOnlyFn("pool-80-20", "quote-sbtc-in", [Cl.uint(1000)], deployer);
const witness = simnet.callReadOnlyFn("pool-80-20", "debug-sbtc-in", [Cl.uint(1000)], deployer);
const safety = simnet.callReadOnlyFn("pool-80-20", "get-safety-envelope", [], deployer);
const binding = simnet.callReadOnlyFn("pool-80-20", "get-binding-status", [], deployer);
const sbtcHash = simnet.callReadOnlyFn("pool-80-20", "get-sbtc-contract-hash", [], deployer);
const quoteHash = simnet.callReadOnlyFn("pool-80-20", "get-quote-contract-hash", [], deployer);
const lpBalance = simnet.callReadOnlyFn(
  "pool-80-20",
  "get-lp-balance",
  [Cl.standardPrincipal(deployer)],
  deployer,
);

const output = {
  source: "simnet-readonly",
  poolState: unwrapResult(poolState),
  quote: unwrapResult(quote),
  witness: unwrapResult(witness),
  safety: cvToJSON(safety.result),
  binding: cvToJSON(binding.result),
  sbtcHash: cvToJSON(sbtcHash.result),
  quoteHash: cvToJSON(quoteHash.result),
  lpBalance: unwrapResult(lpBalance),
};

await mkdir(artifactsDir, { recursive: true });
await writeFile(
  path.join(artifactsDir, "judge-console-data.json"),
  `${JSON.stringify(output, null, 2)}\n`,
  "utf8",
);

console.log("generated judge-console-data.json");
