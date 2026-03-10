import { loadArtifactBundle, loadLiveWithFallback } from "./bundle-loader.js";

const panels = [
  {
    title: "Overview",
    body: "State the 80/20 invariant reduction, current reserves, and the main correctness claim.",
  },
  {
    title: "Swap Verifier",
    body: "Show amount-in, effective-in, lower/upper quote, and the write-path result for one swap.",
  },
  {
    title: "Witness Explorer",
    body: "Expose the intermediate values used to derive lower <= ideal <= upper.",
  },
  {
    title: "LP Verifier",
    body: "Show the current share supply and the proportional LP claim surface.",
  },
  {
    title: "Safety & Bindings",
    body: "Summarize post-conditions, in-contract guards, token bindings, contract hashes, and math-domain limits.",
  },
  {
    title: "Chaos Summary",
    body: "Loading chaos report...",
  },
  { title: "Proof Status", body: "Loading artifact data..." },
];

const root = document.querySelector("#panels");
const sourceBadge = document.querySelector("#source-badge");
const loadArtifactButton = document.querySelector("#load-artifact");
const loadLiveButton = document.querySelector("#load-live");
const vectorIdSelect = document.querySelector("#vector-id");
const datasetIdSelect = document.querySelector("#dataset-id");
const manualDirectionSelect = document.querySelector("#manual-direction");
const apiUrlInput = document.querySelector("#api-url");
const contractPrincipalInput = document.querySelector("#contract-principal");
const senderAddressInput = document.querySelector("#sender-address");
const quoteAmountInput = document.querySelector("#quote-amount");

let currentBundle = null;
let didAutoSelectDefaultVector = false;

const messageRoot = document.createElement("section");
messageRoot.id = "messages";
messageRoot.style.display = "flex";
messageRoot.style.flexDirection = "column";
messageRoot.style.gap = "0.5rem";
messageRoot.style.margin = "1rem 0";
root.parentElement.insertBefore(messageRoot, root);

for (const panel of panels) {
  const article = document.createElement("article");
  article.className = "panel";

  const title = document.createElement("h2");
  title.textContent = panel.title;

  const body = document.createElement("p");
  body.textContent = panel.body;

  article.append(title, body);
  root.append(article);
}

function panelBodies() {
  return root.querySelectorAll(".panel p");
}

function vectorList(bundle) {
  return bundle?.vectorPack?.vectors ?? [];
}

function populateVectorOptions(vectors) {
  const previousSelection = vectorIdSelect.value;
  vectorIdSelect.innerHTML = '<option value="">Manual inputs</option>';

  for (const vector of vectors) {
    const option = document.createElement("option");
    option.value = vector.id;
    const kind = vector.kind ? ` · ${vector.kind}` : "";
    option.textContent = `${vector.id}${kind}`;
    vectorIdSelect.append(option);
  }

  vectorIdSelect.value = previousSelection;
}

function ensureDefaultVector(vectors) {
  if (didAutoSelectDefaultVector) return;
  if (vectorIdSelect.value) {
    didAutoSelectDefaultVector = true;
    return;
  }
  const preferred = vectors.find((vector) => vector.id === "swap-sbtc-in-1000") ?? vectors[0];
  if (!preferred) return;
  vectorIdSelect.value = preferred.id;
  didAutoSelectDefaultVector = true;
}

function selectedVector(bundle) {
  const id = vectorIdSelect.value;
  if (!id) return null;
  return vectorList(bundle).find((vector) => vector.id === id) ?? null;
}

function unwrapTypedValue(node) {
  return node?.value;
}

function uintValue(node) {
  return unwrapTypedValue(node);
}

function typedValueOrNA(node) {
  const value = uintValue(node);
  return value ?? "n/a";
}

function datasetLabel(id) {
  if (id === "sbtc") return "official sbtc-token (requirement)";
  return "mock-sbtc (artifact)";
}

function selectedDatasetId(bundle) {
  if (bundle?.live?.source === "browser-live-readonly") return null;
  if (!bundle?.liveVariants) return null;
  return datasetIdSelect?.value || "mock";
}

function resolveLive(bundle) {
  const datasetId = selectedDatasetId(bundle);
  if (!datasetId) return bundle.live ?? {};
  return bundle.liveVariants?.[datasetId] ?? bundle.live ?? {};
}

function setSource(label, datasetId) {
  const datasetSuffix = datasetId ? ` · dataset=${datasetId}` : "";
  sourceBadge.textContent = `Source: ${label}${datasetSuffix}`;
}

function clearMessages() {
  messageRoot.textContent = "";
}

function pushMessage(message) {
  const panel = document.createElement("p");
  panel.textContent = message;
  panel.style.color = "#ffb4b4";
  messageRoot.append(panel);
}

function renderIssues(issues) {
  clearMessages();
  if (!issues?.length) return;
  for (const issue of issues) {
    const suffix = issue.path ? ` (${issue.path})` : "";
    pushMessage(`[${issue.layer}] ${issue.message}${suffix}`);
  }
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`failed to load ${path}: HTTP ${response.status}`);
  return response.json();
}

function splitContractPrincipal(contractPrincipal) {
  const dot = contractPrincipal.indexOf(".");
  if (dot === -1) throw new Error("contract principal must look like ST...contract-name");
  return {
    address: contractPrincipal.slice(0, dot),
    name: contractPrincipal.slice(dot + 1),
  };
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function defaultSenderFor(contractPrincipal) {
  try {
    return splitContractPrincipal(contractPrincipal).address;
  } catch {
    return "";
  }
}

async function importStacksTransactions() {
  return import("https://esm.sh/@stacks/transactions@7.2.0");
}

async function callReadOnly(apiUrl, contractPrincipal, functionName, args, senderAddress) {
  const { serializeCV, cvToJSON, hexToCV } = await importStacksTransactions();
  const { address, name } = splitContractPrincipal(contractPrincipal);
  const response = await fetch(
    `${apiUrl.replace(/\/$/, "")}/v2/contracts/call-read/${address}/${name}/${functionName}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: senderAddress,
        arguments: args.map((arg) => `0x${bytesToHex(serializeCV(arg))}`),
      }),
    },
  );

  const payload = await response.json();
  if (!response.ok || payload.okay === false) {
    const error = new Error(payload.cause ?? `call-read failed for ${functionName}`);
    error.code = "LIVE_READONLY";
    throw error;
  }

  return cvToJSON(hexToCV(payload.result));
}

function inputError(message) {
  const error = new Error(message);
  error.code = "INPUT";
  return error;
}

async function loadLiveBundle() {
  const { uintCV, standardPrincipalCV } = await importStacksTransactions();
  const contractPrincipal = contractPrincipalInput.value.trim();
  if (!contractPrincipal) {
    throw inputError("enter a contract principal before loading live readonly data");
  }

  const senderAddress = senderAddressInput.value.trim() || defaultSenderFor(contractPrincipal);
  if (!senderAddress) {
    throw inputError("enter a sender address before loading live readonly data");
  }
  if (!senderAddressInput.value.trim()) {
    senderAddressInput.value = senderAddress;
  }

  const apiUrl = apiUrlInput.value.trim();

  const base = await loadArtifactBundle({ loadJson });

  populateVectorOptions(vectorList(base));
  ensureDefaultVector(vectorList(base));

  const vector = selectedVector(base);
  const manualDirection = manualDirectionSelect.value;
  const manualAmount = BigInt(quoteAmountInput.value || "1000");

  let quotePromise = Promise.resolve(null);
  let witnessPromise = Promise.resolve(null);

  if (vector?.kind === "swap") {
    const amount = BigInt(vector.amount_in);
    const direction = vector.direction;
    const quoteFn = direction === "quote-in" ? "quote-quote-in" : "quote-sbtc-in";
    const debugFn = direction === "quote-in" ? "debug-quote-in" : "debug-sbtc-in";
    quotePromise = callReadOnly(apiUrl, contractPrincipal, quoteFn, [uintCV(amount)], senderAddress);
    witnessPromise = callReadOnly(apiUrl, contractPrincipal, debugFn, [uintCV(amount)], senderAddress);
  } else if (vector?.kind === "lp-add") {
    quotePromise = callReadOnly(
      apiUrl,
      contractPrincipal,
      "quote-add-shares",
      [uintCV(BigInt(vector.sbtc_amount)), uintCV(BigInt(vector.quote_amount))],
      senderAddress,
    );
  } else if (vector?.kind === "lp-remove") {
    quotePromise = callReadOnly(
      apiUrl,
      contractPrincipal,
      "quote-remove-shares",
      [uintCV(BigInt(vector.share_amount))],
      senderAddress,
    );
  } else {
    const quoteFn = manualDirection === "quote-in" ? "quote-quote-in" : "quote-sbtc-in";
    const debugFn = manualDirection === "quote-in" ? "debug-quote-in" : "debug-sbtc-in";
    quotePromise = callReadOnly(
      apiUrl,
      contractPrincipal,
      quoteFn,
      [uintCV(manualAmount)],
      senderAddress,
    );
    witnessPromise = callReadOnly(
      apiUrl,
      contractPrincipal,
      debugFn,
      [uintCV(manualAmount)],
      senderAddress,
    );
  }

  const [poolState, safety, binding, sbtcHash, quoteHash, lpBalance, quote, witness] =
    await Promise.all([
      callReadOnly(apiUrl, contractPrincipal, "get-pool-state", [], senderAddress),
      callReadOnly(apiUrl, contractPrincipal, "get-safety-envelope", [], senderAddress),
      callReadOnly(apiUrl, contractPrincipal, "get-binding-status", [], senderAddress),
      callReadOnly(apiUrl, contractPrincipal, "get-sbtc-contract-hash", [], senderAddress),
      callReadOnly(apiUrl, contractPrincipal, "get-quote-contract-hash", [], senderAddress),
      callReadOnly(
        apiUrl,
        contractPrincipal,
        "get-lp-balance",
        [standardPrincipalCV(senderAddress)],
        senderAddress,
      ),
      quotePromise,
      witnessPromise,
    ]);

  const metadataSuffix = base.issues?.length ? " (artifact metadata degraded)" : "";

  return {
    ...base,
    live: {
      source: "browser-live-readonly",
      poolState,
      quote,
      witness,
      safety,
      binding,
      sbtcHash,
      quoteHash,
      lpBalance,
    },
    sourceLabel: `live readonly @ ${apiUrl}${metadataSuffix}`,
  };
}

function render(bundle) {
  const bodies = panelBodies();
  const datasetId = selectedDatasetId(bundle);
  const live = resolveLive(bundle);
  const hasLiveReadonly = live.source === "browser-live-readonly";

  const poolState = live.poolState?.value ?? live.poolState ?? {};
  const quote = live.quote?.value?.value ?? live.quote?.value ?? live.quote ?? null;
  const witness = live.witness?.value?.value ?? live.witness?.value ?? live.witness ?? null;
  const safety = live.safety?.value ?? live.safety ?? {};
  const binding = live.binding?.value ?? live.binding ?? null;
  const claims = bundle.claimMatrix.claims ?? [];
  const lpTuple = live.lpBalance?.value ?? live.lpBalance ?? null;
  const lpBalance = lpTuple ? uintValue(lpTuple["balance"]) : "n/a";

  const overviewInvariant = bundle.snapshot?.overview?.invariant ?? "n/a";
  const overviewClaim = bundle.snapshot?.overview?.claim ?? "n/a";
  const manifestStatus = bundle.manifest?.status ?? "manifest unavailable";
  const proofP0 = bundle.proof?.claims?.[0]?.status ?? "n/a";
  const proofP1 = bundle.proof?.claims?.[1]?.status ?? "n/a";
  const proofP2 = bundle.proof?.claims?.[2]?.status ?? "n/a";
  const chaosSummary = bundle.chaosReport?.summary ?? { pass: "n/a", fail: "n/a" };
  const chaosExperiments = bundle.chaosReport?.experiments ?? [];
  const chaosUpdatedAt = bundle.chaosReport?.generated_at ?? "n/a";
  const chaosFailing = chaosExperiments
    .filter((experiment) => experiment.pass_fail !== "pass")
    .map((experiment) => experiment.experiment_id)
    .join(", ");

  const submission = bundle.submissionSnapshot ?? {};
  const submissionCommit = submission?.git?.commit_short ?? "n/a";
  const submissionWhen = submission?.generated_at ?? "n/a";

  const vector = selectedVector(bundle);
  const manualLabel = `manual ${manualDirectionSelect.value} ${quoteAmountInput.value || "n/a"}`;
  const selectionLabel = vector ? `${vector.id}` : manualLabel;

  bodies[0].textContent =
    `${overviewInvariant} · ${overviewClaim} · reserves={sbtc:${typedValueOrNA(poolState["reserve-sbtc"])}, quote:${typedValueOrNA(poolState["reserve-quote"])}}` +
    (datasetId ? ` · ${datasetLabel(datasetId)}` : "") +
    ` · commit=${submissionCommit} @ ${submissionWhen}` +
    ` · vector=${selectionLabel} · claims=${claims.length}`;

  if (vector?.kind === "swap") {
    const expected = vector.expected_quote ?? {};
    const expectedWitness = vector.expected_witness ?? {};

    const expectedLower = expected["amount-out-lower"] ?? "n/a";
    const expectedUpper = expected["amount-out-upper"] ?? "n/a";
    const expectedEffective = expected["amount-in-effective"] ?? "n/a";

    const liveLower = hasLiveReadonly && quote ? uintValue(quote["amount-out-lower"]) : "n/a";
    const liveUpper = hasLiveReadonly && quote ? uintValue(quote["amount-out-upper"]) : "n/a";

    bodies[1].textContent =
      `swap ${vector.direction} in=${vector.amount_in} eff=${expectedEffective} · ` +
      `expected lower=${expectedLower} upper=${expectedUpper}` +
      (hasLiveReadonly ? ` · live lower=${liveLower} upper=${liveUpper}` : "");

    const expectedNext = expectedWitness["next-reserve-in-pricing"] ?? "n/a";
    const expectedTradeLimit = expectedWitness["trade-limit"] ?? expected["trade-limit"] ?? "n/a";
    const expectedAfterUpper = expectedWitness["reserve-out-after-upper"] ?? "n/a";

    const liveNext =
      hasLiveReadonly && witness
        ? uintValue(
            witness["next-reserve-in-pricing"] ?? witness["reserve-out-input-upper"] ?? { value: "n/a" },
          )
        : "n/a";

    bodies[2].textContent =
      `witness expected tradeLimit=${expectedTradeLimit} next=${expectedNext} outAfterUpper=${expectedAfterUpper}` +
      (hasLiveReadonly ? ` · live next=${liveNext}` : "");
  } else if (!vector) {
    const manualDirection = manualDirectionSelect.value;
    bodies[1].textContent = `swap ${manualDirection} manual in=${quoteAmountInput.value || "n/a"} · lower=${quote ? uintValue(quote["amount-out-lower"]) : "n/a"} upper=${quote ? uintValue(quote["amount-out-upper"]) : "n/a"} · source=${live.source ?? "artifact"}`;
    bodies[2].textContent = `witness effective=${witness ? uintValue(witness["amount-in-effective"]) : "n/a"} lower=${witness ? uintValue(witness["amount-out-lower"]) : "n/a"} upper=${witness ? uintValue(witness["amount-out-upper"]) : "n/a"} · next=${witness ? uintValue(witness["next-reserve-in-pricing"] ?? witness["reserve-out-input-upper"] ?? { value: "n/a" }) : "n/a"}`;
  } else {
    bodies[1].textContent = `Swap Verifier: select a swap vector (current=${vector.kind})`;
    bodies[2].textContent = `Witness Explorer: select a swap vector (current=${vector.kind})`;
  }

  if (vector?.kind === "lp-add") {
    const expected = vector.expected_result ?? {};
    const expectedMinted = expected["minted-shares"] ?? "n/a";
    const expectedNextSupply = expected["share-supply"] ?? "n/a";
    const liveMinted = hasLiveReadonly && quote ? uintValue(quote["minted-shares"]) : "n/a";
    const liveNextSupply = hasLiveReadonly && quote ? uintValue(quote["share-supply"]) : "n/a";
    bodies[3].textContent = `lp-add sbtc=${vector.sbtc_amount} quote=${vector.quote_amount} · expected minted=${expectedMinted} supply=${expectedNextSupply} · live minted=${liveMinted} supply=${liveNextSupply} · pool supply=${uintValue(poolState["share-supply"])} · lp balance(sender)=${lpBalance}`;
  } else if (vector?.kind === "lp-remove") {
    const expected = vector.expected_result ?? {};
    const expectedSbtc = expected["amount-sbtc"] ?? "n/a";
    const expectedQuote = expected["amount-quote"] ?? "n/a";
    const liveSbtc = hasLiveReadonly && quote ? uintValue(quote["amount-sbtc"]) : "n/a";
    const liveQuote = hasLiveReadonly && quote ? uintValue(quote["amount-quote"]) : "n/a";
    bodies[3].textContent = `lp-remove shares=${vector.share_amount} · expected out={sbtc:${expectedSbtc}, quote:${expectedQuote}} · live out={sbtc:${liveSbtc}, quote:${liveQuote}} · pool supply=${uintValue(poolState["share-supply"])} · lp balance(sender)=${lpBalance}`;
  } else {
    bodies[3].textContent = `share supply=${uintValue(poolState["share-supply"])} · lp balance(sender)=${lpBalance} · CL-03: remove-liquidity requires lp-balances[tx-sender] (ERR-LP-BALANCE)`;
  }

  bodies[4].textContent =
    `${bundle.snapshot.safety.post_condition_mode} + guard=${safety["clarity4-guard-skeleton-enabled"]?.value ?? bundle.snapshot.safety.guard_enabled} + mathDomain=${safety["math-domain-guard-enabled"]?.value ?? bundle.snapshot.safety.math_domain_guard_enabled}` +
    ` + sbtc={mock:${typedValueOrNA(binding?.["sbtc-is-mock"])}, requirement:${typedValueOrNA(binding?.["sbtc-is-requirement"])}}` +
    ` + hashBound={sbtc:${typedValueOrNA(binding?.["sbtc-hash-bound"])}, quote:${typedValueOrNA(binding?.["quote-hash-bound"])}}` +
    ` + sbtcHash=${live.sbtcHash?.value?.value ?? live.sbtcHash?.value ?? "n/a"}`;
  bodies[5].textContent = `chaos pass=${chaosSummary.pass} fail=${chaosSummary.fail} · updated=${chaosUpdatedAt} · failing=${chaosFailing || "none"}`;
  bodies[6].textContent = `${manifestStatus}; ${claims.map((claim) => claim.id).join(", ")} · P0=${proofP0}, P1=${proofP1}, P2=${proofP2}`;
  setSource(bundle.sourceLabel, datasetId);
}

async function hydrateArtifacts() {
  const bundle = await loadArtifactBundle({ loadJson });
  currentBundle = bundle;
  populateVectorOptions(vectorList(bundle));
  ensureDefaultVector(vectorList(bundle));
  render(bundle);
  renderIssues(bundle.issues);
}

async function hydrateLive() {
  const bundle = await loadLiveWithFallback({
    loadLiveBundle,
    loadArtifactBundle: () => loadArtifactBundle({ loadJson }),
  });
  currentBundle = bundle;
  populateVectorOptions(vectorList(bundle));
  ensureDefaultVector(vectorList(bundle));
  render(bundle);
  renderIssues(bundle.issues);
}

function rerender() {
  if (!currentBundle) return;
  render(currentBundle);
}

loadArtifactButton.addEventListener("click", async () => {
  try {
    await hydrateArtifacts();
  } catch (error) {
    pushMessage(`Artifact load skipped: ${error.message}`);
  }
});

loadLiveButton.addEventListener("click", async () => {
  try {
    await hydrateLive();
  } catch (error) {
    pushMessage(`Live readonly load failed: ${error.message}`);
  }
});

vectorIdSelect.addEventListener("change", rerender);
datasetIdSelect.addEventListener("change", rerender);
manualDirectionSelect.addEventListener("change", rerender);
quoteAmountInput.addEventListener("input", rerender);

hydrateArtifacts().catch((error) => {
  pushMessage(`Artifact load skipped: ${error.message}`);
});
