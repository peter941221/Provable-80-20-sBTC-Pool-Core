import { initSimnet } from "@stacks/clarinet-sdk";
import { Cl, cvToJSON } from "@stacks/transactions";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const artifactsDir = path.join(root, "artifacts");

const SBTC_REQUIREMENT_ADDRESS = "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4";
const SBTC_REQUIREMENT_CONTRACT = "sbtc-token";

function unwrapResult(result) {
  return cvToJSON(result.result);
}

async function buildSimnet() {
  const simnet = await initSimnet("./Clarinet.toml", true, {
    trackCosts: false,
    trackCoverage: false,
  });

  const accounts = simnet.getAccounts();
  const deployer = accounts.get("deployer");

  return { simnet, deployer };
}

async function exportScenario({
  scenarioId,
  scenarioLabel,
  sbtcTokenType,
  outputFile,
}) {
  const { simnet, deployer } = await buildSimnet();

  const quoteToken = Cl.contractPrincipal(deployer, "mock-quote");

  const sbtcToken =
    sbtcTokenType === "mock"
      ? Cl.contractPrincipal(deployer, "mock-sbtc")
      : Cl.contractPrincipal(SBTC_REQUIREMENT_ADDRESS, SBTC_REQUIREMENT_CONTRACT);

  // The demo quote token is always the local mock.
  simnet.callPublicFn(
    "mock-quote",
    "mint",
    [Cl.uint(500000000), Cl.standardPrincipal(deployer)],
    deployer,
  );

  // For the local mock sBTC we mint; for official sBTC we rely on the simnet
  // sbtc-balance wiring from the sBTC requirement.
  if (sbtcTokenType === "mock") {
    simnet.callPublicFn(
      "mock-sbtc",
      "mint",
      [Cl.uint(500000000), Cl.standardPrincipal(deployer)],
      deployer,
    );
  }

  const init = simnet.callPublicFn(
    "pool-80-20",
    "initialize",
    [
      sbtcToken,
      quoteToken,
      Cl.uint(200000),
      Cl.uint(2000000),
      Cl.uint(30),
      Cl.uint(1000),
    ],
    deployer,
  );

  const initJson = cvToJSON(init.result);
  if (!initJson.success) throw new Error(`pool initialize failed for scenario=${scenarioId}`);

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
    scenario: { id: scenarioId, label: scenarioLabel },
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
    path.join(artifactsDir, outputFile),
    `${JSON.stringify(output, null, 2)}\n`,
    "utf8",
  );

  console.log(`generated ${outputFile}`);
}

// Scenario 1: local mocks (deterministic artifact demo).
await exportScenario({
  scenarioId: "mock",
  scenarioLabel: "mock-sbtc + mock-quote",
  sbtcTokenType: "mock",
  outputFile: "judge-console-data.json",
});

// Scenario 2: official sBTC requirement token + local mock quote (wiring proof).
await exportScenario({
  scenarioId: "sbtc-requirement",
  scenarioLabel: `${SBTC_REQUIREMENT_ADDRESS}.${SBTC_REQUIREMENT_CONTRACT} + mock-quote`,
  sbtcTokenType: "requirement",
  outputFile: "judge-console-data-sbtc.json",
});
