import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { initSimnet } from "@stacks/clarinet-sdk";
import { Cl, cvToJSON } from "@stacks/transactions";

import { loadArtifactBundle, loadLiveWithFallback } from "../frontend/judge-console/bundle-loader.js";
import { classifyRemoteDataFailure, parseRemoteDataConfig } from "./chaos-lib.js";

const root = process.cwd();
const artifactsDir = path.join(root, "artifacts");

const REMOTE_DATA_MANIFEST = "Clarinet.mxs.toml";

async function loadJsonFromDisk(relativePath) {
  const content = await readFile(path.join(root, relativePath), "utf8");
  return JSON.parse(content);
}

async function loadTextFromDisk(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

function nowIso() {
  return new Date().toISOString();
}

function passFail(value) {
  return value ? "pass" : "fail";
}

function summarize(experiments) {
  return experiments.reduce(
    (acc, exp) => {
      if (exp.pass_fail === "pass") acc.pass += 1;
      else acc.fail += 1;
      return acc;
    },
    { pass: 0, fail: 0 },
  );
}

function responseSummary(responseJson) {
  if (!responseJson || typeof responseJson.success !== "boolean" || !("value" in responseJson)) {
    return { ok: false, error: "not-a-response" };
  }

  if (responseJson.success) {
    return { ok: true, value: responseJson.value };
  }

  if (responseJson.value?.type === "uint") {
    return { ok: false, error_code: responseJson.value.value };
  }

  return { ok: false, error: responseJson.value };
}

function poolStateSnapshot(simnet, deployer) {
  const state = simnet.callReadOnlyFn("pool-80-20", "get-pool-state", [], deployer);
  const lpBalance = simnet.callReadOnlyFn(
    "pool-80-20",
    "get-lp-balance",
    [Cl.standardPrincipal(deployer)],
    deployer,
  );

  const stateJson = cvToJSON(state.result);
  const lpJson = cvToJSON(lpBalance.result);

  return {
    reserves: {
      sbtc: stateJson.value?.["reserve-sbtc"]?.value ?? "n/a",
      quote: stateJson.value?.["reserve-quote"]?.value ?? "n/a",
    },
    share_supply: stateJson.value?.["share-supply"]?.value ?? "n/a",
    lp_balance: lpJson.value?.balance?.value ?? "n/a",
  };
}

function unique(values) {
  return Array.from(new Set(values));
}

function parseDocClaimIds(markdownText) {
  return unique(
    String(markdownText)
      .split(/\r?\n/)
      .map((line) => line.trim())
      .map((line) => line.match(/^##\s+(CL-\d+)\b/)?.[1])
      .filter(Boolean),
  );
}

async function main() {
  const experiments = [];

  // L1: Artifact chaos — claim-matrix missing should degrade and be visible (no silent success)
  {
    const experimentId = "E-ART-01";
    const layer = "L1-artifact";
    const steadyState = "artifact bundle loads cleanly";
    const fault = "claim-matrix.json missing";
    const expected = "UI/data loader degrades, shows explicit error, and continues with claims=[]";

    const loadJson = async (p) => {
      if (p.endsWith("claim-matrix.json")) throw new Error("simulated missing claim-matrix.json");
      return loadJsonFromDisk(p);
    };

    const bundle = await loadArtifactBundle({ loadJson, basePath: "artifacts" });
    const ok =
      Array.isArray(bundle.claimMatrix?.claims) &&
      bundle.claimMatrix.claims.length === 0 &&
      bundle.issues?.some((issue) => issue.layer === "L1-artifact" && issue.path?.endsWith("claim-matrix.json"));

    experiments.push({
      experiment_id: experimentId,
      layer,
      steady_state: steadyState,
      fault,
      expected_behavior: expected,
      actual_behavior: ok ? "degraded with explicit issue and claims=[]" : "unexpected loader behavior",
      pass_fail: passFail(ok),
      residual_risk: "Front-end messaging style may still evolve; keep tests aligned with judge console UX.",
      details: {
        sourceLabel: bundle.sourceLabel,
        issues: bundle.issues,
      },
    });
  }

  // L2: Live readonly chaos — live failure should fallback to artifacts and be visible
  {
    const experimentId = "E-LIVE-01";
    const layer = "L2-live-readonly";
    const steadyState = "live readonly works or cleanly degrades";
    const fault = "live readonly HTTP 429 (simulated)";
    const expected = "fallback to artifact bundle, source badge changes, and explicit issue is recorded";

    const loadLiveBundle = async () => {
      const error = new Error("HTTP 429");
      error.code = "LIVE_READONLY";
      throw error;
    };

    const bundle = await loadLiveWithFallback({
      loadLiveBundle,
      loadArtifactBundle: () => loadArtifactBundle({ loadJson: loadJsonFromDisk, basePath: "artifacts" }),
    });

    const ok =
      typeof bundle.sourceLabel === "string" &&
      bundle.sourceLabel.includes("fallback from live") &&
      bundle.issues?.some((issue) => issue.layer === "L2-live-readonly");

    experiments.push({
      experiment_id: experimentId,
      layer,
      steady_state: steadyState,
      fault,
      expected_behavior: expected,
      actual_behavior: ok ? "fallback succeeded with explicit issue" : "no fallback or missing issue classification",
      pass_fail: passFail(ok),
      residual_risk: "Real network failures may have additional shapes; keep error classification strict but extensible.",
      details: {
        sourceLabel: bundle.sourceLabel,
        issues: bundle.issues,
      },
    });
  }

  // L3: MXS / remote-data chaos — classify infra failures and record fixed-height config
  {
    const manifestText = await loadTextFromDisk(REMOTE_DATA_MANIFEST);
    const remoteDataConfig = parseRemoteDataConfig(manifestText);

    const fault = new Error("fetch failed: ECONNREFUSED");
    const classification = classifyRemoteDataFailure(fault);

    const ok =
      remoteDataConfig.enabled === true &&
      typeof remoteDataConfig.api_url === "string" &&
      typeof remoteDataConfig.initial_height === "number" &&
      classification.failure_classification === "infra" &&
      classification.kind === "network";

    experiments.push({
      experiment_id: "E-MXS-01",
      layer: "L3-mxs-remote-data",
      steady_state: "MXS remote-data is configured and failure modes are classified as infra (not protocol)",
      fault: "remote_data endpoint unreachable (simulated)",
      expected_behavior: "chaos report records api_url + initial_height and classifies failure as infra/network",
      actual_behavior: ok ? "classified infra/network and recorded config" : "missing config or misclassified failure",
      pass_fail: passFail(ok),
      residual_risk: "This is classification evidence; live MXS replay evidence is tracked separately under tests/mxs.",
      details: {
        manifest: REMOTE_DATA_MANIFEST,
        remote_data: remoteDataConfig,
        simulated_error: classification,
      },
    });
  }

  {
    const classification = classifyRemoteDataFailure(new Error("HTTP 429 Too Many Requests"));
    const ok = classification.failure_classification === "infra" && classification.kind === "rate_limit";

    experiments.push({
      experiment_id: "E-MXS-02",
      layer: "L3-mxs-remote-data",
      steady_state: "MXS remote-data failures are explainable",
      fault: "Hiro API rate limit (HTTP 429) (simulated)",
      expected_behavior: "classified infra/rate_limit with HIRO_API_KEY hint",
      actual_behavior: ok ? "classified infra/rate_limit" : "misclassified rate limit failure",
      pass_fail: passFail(ok),
      residual_risk: "Real-world 429 shapes vary; keep classification table updated as new error strings appear.",
      details: {
        simulated_error: classification,
      },
    });
  }

  // L4: Boundary-state chaos — fixed, replayable multi-step sequence near the math domain boundary.
  {
    const simnet = await initSimnet("./Clarinet.toml", true, {
      trackCosts: false,
      trackCoverage: false,
    });

    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer");

    const initialSbtc = 100_000_000n;
    const initialQuote = 3_000_000n;

    simnet.callPublicFn(
      "mock-sbtc",
      "mint",
      [Cl.uint(initialSbtc + 20_000_000n), Cl.standardPrincipal(deployer)],
      deployer,
    );
    simnet.callPublicFn(
      "mock-quote",
      "mint",
      [Cl.uint(initialQuote + 600_000n), Cl.standardPrincipal(deployer)],
      deployer,
    );

    const steps = [];

    const init = simnet.callPublicFn(
      "pool-80-20",
      "initialize",
      [
        Cl.contractPrincipal(deployer, "mock-sbtc"),
        Cl.contractPrincipal(deployer, "mock-quote"),
        Cl.uint(initialSbtc),
        Cl.uint(initialQuote),
        Cl.uint(30),
        Cl.uint(1000),
      ],
      deployer,
    );

    steps.push({
      step: "initialize",
      result: responseSummary(cvToJSON(init.result)),
      snapshot: poolStateSnapshot(simnet, deployer),
    });

    const addSmall = simnet.callPublicFn(
      "pool-80-20",
      "add-liquidity",
      [Cl.uint(1_000_000), Cl.uint(30_000)],
      deployer,
    );

    steps.push({
      step: "add-liquidity:small",
      result: responseSummary(cvToJSON(addSmall.result)),
      snapshot: poolStateSnapshot(simnet, deployer),
    });

    const removeSmall = simnet.callPublicFn(
      "pool-80-20",
      "remove-liquidity",
      [Cl.uint(1_000_000)],
      deployer,
    );

    steps.push({
      step: "remove-liquidity:small",
      result: responseSummary(cvToJSON(removeSmall.result)),
      snapshot: poolStateSnapshot(simnet, deployer),
    });

    const snapshotBefore = poolStateSnapshot(simnet, deployer);
    const addTooLarge = simnet.callPublicFn(
      "pool-80-20",
      "add-liquidity",
      [Cl.uint(10_000_000), Cl.uint(300_000)],
      deployer,
    );

    const addTooLargeSummary = responseSummary(cvToJSON(addTooLarge.result));
    const snapshotAfter = poolStateSnapshot(simnet, deployer);

    steps.push({
      step: "add-liquidity:too-large",
      result: addTooLargeSummary,
      snapshot_before: snapshotBefore,
      snapshot_after: snapshotAfter,
    });

    const ok =
      steps[0].result.ok === true &&
      steps[1].result.ok === true &&
      steps[2].result.ok === true &&
      addTooLargeSummary.ok === false &&
      addTooLargeSummary.error_code === "412" &&
      JSON.stringify(snapshotAfter) === JSON.stringify(snapshotBefore);

    experiments.push({
      experiment_id: "E-BND-01",
      layer: "L4-boundary-sequence",
      steady_state: "multi-step state transitions remain within explicit uint128 math-domain envelope",
      fault: "proportional LP add that exceeds the explicit math-domain envelope",
      expected_behavior: "ERR-MATH-DOMAIN and no partial state updates",
      actual_behavior: ok ? "reverted with ERR-MATH-DOMAIN and state unchanged" : "unexpected result or state drift",
      pass_fail: passFail(ok),
      residual_risk: "This covers a fixed sequence; expand vectors if you want broader coverage near multiple edges.",
      details: {
        initial: { sbtc: initialSbtc.toString(), quote: initialQuote.toString() },
        steps,
      },
    });
  }

  // L5: Pipeline drift — keep docs, artifacts, and console wiring aligned.
  {
    const doc = await loadTextFromDisk("docs/claim-matrix.md");
    const claimMatrix = await loadJsonFromDisk("artifacts/claim-matrix.json");

    const docIds = parseDocClaimIds(doc);
    const artifactIds = unique((claimMatrix.claims ?? []).map((claim) => claim.id));

    const ok = JSON.stringify(docIds) === JSON.stringify(artifactIds);

    experiments.push({
      experiment_id: "E-PIPE-01",
      layer: "L5-pipeline-drift",
      steady_state: "docs/claim-matrix.md and artifacts/claim-matrix.json stay aligned",
      fault: "claim matrix drift (docs vs artifacts)",
      expected_behavior: "drift is detected and fix commands are provided",
      actual_behavior: ok ? "claim IDs aligned" : "claim IDs drift detected",
      pass_fail: passFail(ok),
      residual_risk: "Only checks claim IDs; expand to deeper field-level checks if needed.",
      details: {
        doc_ids: docIds,
        artifact_ids: artifactIds,
        fix_commands: ["npm run gen:artifacts", "npm run gen:console"],
      },
    });
  }

  {
    const manifest = await loadJsonFromDisk("artifacts/demo-manifest.json");
    const appJs = await loadTextFromDisk("frontend/judge-console/app.js");
    const consolePanels = manifest.console ?? [];
    const missing = consolePanels.filter((title) => !appJs.includes(`title: \"${title}\"`));
    const ok = consolePanels.includes("Chaos Summary") && missing.length === 0;

    experiments.push({
      experiment_id: "E-PIPE-02",
      layer: "L5-pipeline-drift",
      steady_state: "demo manifest console panels match the judge console UI titles",
      fault: "panel list drift (manifest vs UI)",
      expected_behavior: "drift is detected and fix commands are provided",
      actual_behavior: ok ? "panel titles aligned" : `missing_in_ui=${missing.join(", ")}`,
      pass_fail: passFail(ok),
      residual_risk: "String-match only; if titles become dynamic, migrate this check to a structured export.",
      details: {
        console_panels: consolePanels,
        missing_in_ui: missing,
        fix_commands: ["npm run gen:artifacts"],
      },
    });
  }

  {
    const live = await loadJsonFromDisk("artifacts/judge-console-data.json");
    const required = ["poolState", "quote", "witness", "safety", "binding", "sbtcHash", "quoteHash", "lpBalance"];
    const missing = required.filter((key) => !(key in live));
    const ok = missing.length === 0;

    experiments.push({
      experiment_id: "E-PIPE-03",
      layer: "L5-pipeline-drift",
      steady_state: "judge-console-data.json matches the UI-required shape",
      fault: "console data drift (missing keys)",
      expected_behavior: "drift is detected and regen commands are provided",
      actual_behavior: ok ? "shape aligned" : `missing=${missing.join(", ")}`,
      pass_fail: passFail(ok),
      residual_risk: "Does not validate CV schema depth; add stricter checks if console becomes more complex.",
      details: {
        required_keys: required,
        missing_keys: missing,
        fix_commands: ["npm run gen:console"],
      },
    });
  }

  {
    const proof = await loadJsonFromDisk("artifacts/proof-status.json");
    const ids = (proof.claims ?? []).map((claim) => claim.id);
    const ok = JSON.stringify(ids) === JSON.stringify(["P0", "P1", "P2"]);

    experiments.push({
      experiment_id: "E-PIPE-04",
      layer: "L5-pipeline-drift",
      steady_state: "proof-status artifact matches judge console expectations",
      fault: "proof status drift (missing P0/P1/P2 slots)",
      expected_behavior: "drift is detected and regen commands are provided",
      actual_behavior: ok ? "proof structure aligned" : `claims=${ids.join(", ")}`,
      pass_fail: passFail(ok),
      residual_risk: "This is a shallow structure check; theorem mapping drift should be tracked in proof artifacts and claim matrix.",
      details: {
        claim_ids: ids,
        fix_commands: ["npm run gen:artifacts"],
      },
    });
  }

  const report = {
    version: 1,
    generated_by: "scripts/gen_chaos_report.mjs",
    generated_at: nowIso(),
    summary: summarize(experiments),
    experiments,
  };

  await mkdir(artifactsDir, { recursive: true });
  await writeFile(
    path.join(artifactsDir, "chaos-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );

  console.log("generated artifacts/chaos-report.json");
}

await main();
