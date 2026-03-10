function joinPath(basePath, fileName) {
  const normalizedBase = String(basePath).replaceAll("\\", "/");
  const normalizedFile = String(fileName).replaceAll("\\", "/");

  const base = normalizedBase.endsWith("/")
    ? normalizedBase.replace(/\/+$/, "")
    : normalizedBase;
  const file = normalizedFile.startsWith("/")
    ? normalizedFile.replace(/^\/+/, "")
    : normalizedFile;

  return `${base}/${file}`;
}

function messageFrom(error) {
  if (!error) return "unknown error";
  if (typeof error === "string") return error;
  if (error instanceof Error && error.message) return error.message;
  return String(error);
}

async function safeLoadJson(loadJson, path, fallback, issues) {
  try {
    return await loadJson(path);
  } catch (error) {
    issues.push({
      layer: "L1-artifact",
      path,
      message: messageFrom(error),
    });
    return fallback;
  }
}

export async function loadArtifactBundle({ loadJson, basePath = "../../artifacts" }) {
  const issues = [];

  const proof = await safeLoadJson(
    loadJson,
    joinPath(basePath, "proof-status.json"),
    { phase: "unknown", status: "unavailable", claims: [] },
    issues,
  );
  const submissionSnapshot = await safeLoadJson(
    loadJson,
    joinPath(basePath, "submission-snapshot.json"),
    { version: 1, generated_by: "fallback", generated_at: null, git: {}, env: {} },
    issues,
  );
  const manifest = await safeLoadJson(
    loadJson,
    joinPath(basePath, "demo-manifest.json"),
    { status: "unavailable" },
    issues,
  );
  const snapshot = await safeLoadJson(
    loadJson,
    joinPath(basePath, "console-snapshot.json"),
    { overview: { invariant: "n/a", claim: "n/a" }, safety: {} },
    issues,
  );
  const liveMock = await safeLoadJson(
    loadJson,
    joinPath(basePath, "judge-console-data.json"),
    { source: "artifact-missing" },
    issues,
  );
  const liveSbtc = await safeLoadJson(
    loadJson,
    joinPath(basePath, "judge-console-data-sbtc.json"),
    { source: "artifact-missing" },
    issues,
  );
  const chaosReport = await safeLoadJson(
    loadJson,
    joinPath(basePath, "chaos-report.json"),
    { version: 1, generated_by: "fallback", generated_at: null, summary: { pass: 0, fail: 0 }, experiments: [] },
    issues,
  );
  const claimMatrix = await safeLoadJson(
    loadJson,
    joinPath(basePath, "claim-matrix.json"),
    { version: 1, generated_by: "fallback", claims: [] },
    issues,
  );
  const vectorPack = await safeLoadJson(
    loadJson,
    joinPath(basePath, "vector-pack.json"),
    { version: 1, generated_by: "fallback", config: {}, vectors: [] },
    issues,
  );

  return {
    proof,
    submissionSnapshot,
    manifest,
    snapshot,
    live: liveMock,
    liveVariants: {
      mock: liveMock,
      sbtc: liveSbtc,
    },
    chaosReport,
    claimMatrix,
    vectorPack,
    sourceLabel: issues.length ? "artifact bundle (degraded)" : "artifact bundle",
    issues,
  };
}

export async function loadLiveWithFallback({
  loadLiveBundle,
  loadArtifactBundle,
  shouldFallback,
}) {
  try {
    return await loadLiveBundle();
  } catch (error) {
    if (typeof shouldFallback === "function" && !shouldFallback(error)) throw error;
    if (error && typeof error === "object" && error.code === "INPUT") throw error;

    const fallback = await loadArtifactBundle();
    const fallbackIssues = [
      {
        layer: "L2-live-readonly",
        message: messageFrom(error),
      },
      ...(fallback.issues ?? []),
    ];
    return {
      ...fallback,
      sourceLabel: `${fallback.sourceLabel} (fallback from live)`,
      issues: fallbackIssues,
    };
  }
}
