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
const apiUrlInput = document.querySelector("#api-url");
const contractPrincipalInput = document.querySelector("#contract-principal");
const senderAddressInput = document.querySelector("#sender-address");
const quoteAmountInput = document.querySelector("#quote-amount");

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

function setSource(label) {
  sourceBadge.textContent = `Source: ${label}`;
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

  const amount = BigInt(quoteAmountInput.value || "1000");
  const apiUrl = apiUrlInput.value.trim();

  const base = await loadArtifactBundle({ loadJson });

  const [poolState, quote, witness, safety, binding, sbtcHash, quoteHash, lpBalance] = await Promise.all([
    callReadOnly(apiUrl, contractPrincipal, "get-pool-state", [], senderAddress),
    callReadOnly(apiUrl, contractPrincipal, "quote-sbtc-in", [uintCV(amount)], senderAddress),
    callReadOnly(apiUrl, contractPrincipal, "debug-sbtc-in", [uintCV(amount)], senderAddress),
    callReadOnly(apiUrl, contractPrincipal, "get-safety-envelope", [], senderAddress),
    callReadOnly(apiUrl, contractPrincipal, "get-binding-status", [], senderAddress),
    callReadOnly(apiUrl, contractPrincipal, "get-sbtc-contract-hash", [], senderAddress),
    callReadOnly(apiUrl, contractPrincipal, "get-quote-contract-hash", [], senderAddress),
    callReadOnly(apiUrl, contractPrincipal, "get-lp-balance", [standardPrincipalCV(senderAddress)], senderAddress),
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
  const live = bundle.live;
  const poolState = live.poolState.value ?? live.poolState;
  const quote = live.quote.value?.value ?? live.quote.value ?? live.quote;
  const witness = live.witness.value?.value ?? live.witness.value ?? live.witness;
  const safety = live.safety.value ?? live.safety;
  const binding = live.binding?.value ?? live.binding;
  const claims = bundle.claimMatrix.claims ?? [];
  const lpTuple = live.lpBalance?.value ?? live.lpBalance;
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

  bodies[0].textContent = `${overviewInvariant} · ${overviewClaim} · reserves={sbtc:${uintValue(poolState["reserve-sbtc"])}, quote:${uintValue(poolState["reserve-quote"])}} · claims=${claims.length}`;
  bodies[1].textContent = `quote lower=${uintValue(quote["amount-out-lower"])} upper=${uintValue(quote["amount-out-upper"])} · source=${live.source ?? "artifact"}`;
  bodies[2].textContent = `witness effective=${uintValue(witness["amount-in-effective"])} lower=${uintValue(witness["amount-out-lower"])} upper=${uintValue(witness["amount-out-upper"])} · next=${uintValue(witness["next-reserve-in-pricing"] ?? witness["reserve-out-input-upper"] ?? { value: "n/a" })}`;
  bodies[3].textContent = `share supply=${uintValue(poolState["share-supply"])} · lp balance(sender)=${lpBalance} · CL-03: remove-liquidity requires lp-balances[tx-sender] (ERR-LP-BALANCE)`;
  bodies[4].textContent = `${bundle.snapshot.safety.post_condition_mode} + guard=${safety["clarity4-guard-skeleton-enabled"]?.value ?? bundle.snapshot.safety.guard_enabled} + mathDomain=${safety["math-domain-guard-enabled"]?.value ?? bundle.snapshot.safety.math_domain_guard_enabled} + hashBound={sbtc:${typedValueOrNA(binding?.["sbtc-hash-bound"])}, quote:${typedValueOrNA(binding?.["quote-hash-bound"])}} + sbtcHash=${live.sbtcHash.value?.value ?? live.sbtcHash.value ?? "n/a"}`;
  bodies[5].textContent = `chaos pass=${chaosSummary.pass} fail=${chaosSummary.fail} · updated=${chaosUpdatedAt} · failing=${chaosFailing || "none"}`;
  bodies[6].textContent = `${manifestStatus}; ${claims.map((claim) => claim.id).join(", ")} · P0=${proofP0}, P1=${proofP1}, P2=${proofP2}`;
  setSource(bundle.sourceLabel);
}

async function hydrateArtifacts() {
  const bundle = await loadArtifactBundle({ loadJson });
  render(bundle);
  renderIssues(bundle.issues);
}

async function hydrateLive() {
  const bundle = await loadLiveWithFallback({
    loadLiveBundle,
    loadArtifactBundle: () => loadArtifactBundle({ loadJson }),
  });
  render(bundle);
  renderIssues(bundle.issues);
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

hydrateArtifacts().catch((error) => {
  pushMessage(`Artifact load skipped: ${error.message}`);
});
