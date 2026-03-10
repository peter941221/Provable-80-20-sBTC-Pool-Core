import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

function run(command, args) {
  try {
    return execFileSync(command, args, { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function hasDirtyWorkingTree() {
  const status = run("git", ["status", "--porcelain"]);
  return Boolean(status && status.length > 0);
}

const now = new Date().toISOString();
const commit = run("git", ["rev-parse", "HEAD"]) ?? "unknown";
const commitShort = run("git", ["rev-parse", "--short", "HEAD"]) ?? "unknown";
const dirty = hasDirtyWorkingTree();
const clarinetVersion = run("clarinet", ["--version"]);

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const npmVersion = run(npmCommand, ["--version"]);

const payload = {
  version: 1,
  generated_by: "scripts/gen_submission_snapshot.mjs",
  generated_at: now,
  git: {
    commit,
    commit_short: commitShort,
    dirty,
  },
  env: {
    node: process.version,
    npm: npmVersion ?? "unknown",
    clarinet: clarinetVersion ?? "unknown",
  },
  recommended: {
    full_validation: "npm run validate:full",
    judge_console: [
      "npm run validate:chaos",
      "python -m http.server 8000",
      "open http://127.0.0.1:8000/frontend/judge-console/",
    ],
  },
};

await mkdir("artifacts", { recursive: true });
await writeFile(
  path.join("artifacts", "submission-snapshot.json"),
  `${JSON.stringify(payload, null, 2)}\n`,
  "utf8",
);

if (dirty) {
  console.warn("warning: git working tree is dirty (snapshot includes uncommitted changes)");
}

console.log("wrote artifacts/submission-snapshot.json");

