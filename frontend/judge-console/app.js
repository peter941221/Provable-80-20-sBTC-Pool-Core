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
    body: "Reserve space for proportional add/remove liquidity witness data in the next step.",
  },
  {
    title: "Safety & Bindings",
    body: "Summarize post-conditions, in-contract guards, token bindings, and contract hashes.",
  },
  { title: "Proof Status", body: "Loading artifact data..." },
];

const root = document.querySelector("#panels");

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

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`failed to load ${path}`);
  return response.json();
}

async function hydrate() {
  try {
    const [proof, manifest, snapshot] = await Promise.all([
      loadJson("../../artifacts/proof-status.json"),
      loadJson("../../artifacts/demo-manifest.json"),
      loadJson("../../artifacts/console-snapshot.json"),
    ]);

    const bodies = root.querySelectorAll(".panel p");
    bodies[0].textContent = `${snapshot.overview.invariant} · ${snapshot.overview.claim}`;
    bodies[1].textContent = `sample in=${snapshot.sample_swap.amount_in}, lower=${snapshot.sample_swap.amount_out_lower}, upper=${snapshot.sample_swap.amount_out_upper}`;
    bodies[2].textContent = `effective=${snapshot.sample_swap.amount_in_effective}, lower=${snapshot.sample_swap.amount_out_lower}, upper=${snapshot.sample_swap.amount_out_upper}`;
    bodies[3].textContent = "LP add/remove is implemented on-chain; panel wiring is next for live view.";
    bodies[4].textContent = `${snapshot.safety.post_condition_mode} + guard=${snapshot.safety.guard_enabled} + ${snapshot.safety.binding_status}`;
    bodies[5].textContent = `${manifest.status}; P0=${proof.claims[0].status}, P1=${proof.claims[1].status}, P2=${proof.claims[2].status}`;
  } catch (error) {
    const panel = document.createElement("p");
    panel.textContent = `Artifact load skipped: ${error.message}`;
    panel.style.color = "#ffb4b4";
    root.parentElement.append(panel);
  }
}

hydrate();
