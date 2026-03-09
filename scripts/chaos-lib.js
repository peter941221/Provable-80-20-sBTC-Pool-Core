function messageFrom(error) {
  if (!error) return "unknown error";
  if (typeof error === "string") return error;
  if (error instanceof Error && error.message) return error.message;
  return String(error);
}

function stripInlineComment(rawValue) {
  const hash = rawValue.indexOf("#");
  return hash === -1 ? rawValue.trim() : rawValue.slice(0, hash).trim();
}

function parseTomlValue(rawValue) {
  const value = stripInlineComment(rawValue);
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^\d+$/.test(value)) return Number(value);
  if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1);
  return value;
}

export function parseRemoteDataConfig(tomlText) {
  const lines = String(tomlText).split(/\r?\n/);
  let inBlock = false;
  const config = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#")) continue;
    if (trimmed.startsWith("[")) {
      inBlock = trimmed === "[repl.remote_data]";
      continue;
    }
    if (!inBlock) continue;

    const match = trimmed.match(/^([A-Za-z0-9_]+)\s*=\s*(.+)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    config[key] = parseTomlValue(rawValue);
  }

  return {
    enabled: Boolean(config.enabled),
    api_url: typeof config.api_url === "string" ? config.api_url : undefined,
    initial_height: typeof config.initial_height === "number" ? config.initial_height : undefined,
    use_mainnet_wallets: Boolean(config.use_mainnet_wallets),
  };
}

export function latencyBucketMs(latencyMs) {
  if (typeof latencyMs !== "number" || Number.isNaN(latencyMs)) return "unknown";
  if (latencyMs < 250) return "<250ms";
  if (latencyMs < 1000) return "250-1000ms";
  if (latencyMs < 5000) return "1-5s";
  return ">5s";
}

export function classifyRemoteDataFailure(error) {
  const message = messageFrom(error);
  const normalized = message.toLowerCase();

  const kind =
    normalized.includes("429") ||
    normalized.includes("too many requests") ||
    normalized.includes("rate limit")
      ? "rate_limit"
      : normalized.includes("401") ||
          normalized.includes("403") ||
          normalized.includes("unauthorized") ||
          normalized.includes("forbidden") ||
          normalized.includes("api_key") ||
          normalized.includes("api key")
        ? "auth"
        : normalized.includes("timeout") ||
            normalized.includes("timed out") ||
            normalized.includes("fetch failed") ||
            normalized.includes("network") ||
            normalized.includes("econnrefused") ||
            normalized.includes("enotfound") ||
            normalized.includes("socket") ||
            normalized.includes("connect")
          ? "network"
          : "unknown";

  const failure_classification = kind === "unknown" ? "unknown" : "infra";

  const hint =
    kind === "rate_limit"
      ? "Likely Hiro API rate limiting; set HIRO_API_KEY or retry."
      : kind === "auth"
        ? "Likely missing/invalid HIRO_API_KEY or endpoint auth."
        : kind === "network"
          ? "Likely network / DNS / endpoint reachability issue."
          : "Inspect logs and compare against protocol-level errors.";

  return {
    failure_classification,
    kind,
    message,
    hint,
  };
}

