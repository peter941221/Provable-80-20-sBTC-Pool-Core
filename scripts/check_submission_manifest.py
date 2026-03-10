import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"

# Submission-grade bundle for the Judge Console + evidence pack.
REQUIRED_JSON = [
    "proof-status.json",
    "demo-manifest.json",
    "vector-pack.json",
    "claim-matrix.json",
    "console-snapshot.json",
    "judge-console-data.json",
    "judge-console-data-sbtc.json",
    "chaos-report.json",
    "submission-snapshot.json",
]


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    missing: list[str] = []
    invalid: list[str] = []

    for name in REQUIRED_JSON:
        path = ARTIFACTS / name
        if not path.exists():
            missing.append(name)
            continue
        try:
            load_json(path)
        except json.JSONDecodeError:
            invalid.append(name)

    if missing or invalid:
        raise SystemExit(f"missing={missing} invalid={invalid}")

    # A few shallow shape checks so a "present but wrong" file fails loudly.
    snapshot = load_json(ARTIFACTS / "submission-snapshot.json")
    if snapshot.get("version") != 1 or "git" not in snapshot or "env" not in snapshot:
        raise SystemExit("submission-snapshot.json has unexpected shape")

    sbtc = load_json(ARTIFACTS / "judge-console-data-sbtc.json")
    if not isinstance(sbtc, dict) or "binding" not in sbtc:
        raise SystemExit("judge-console-data-sbtc.json has unexpected shape")
    sbtc_is_requirement = (
        sbtc.get("binding", {}).get("value", {}).get("sbtc-is-requirement", {}).get("value")
    )
    if sbtc_is_requirement is not True:
        raise SystemExit("judge-console-data-sbtc.json does not show sbtc-is-requirement=true")

    print("submission manifest ok")


if __name__ == "__main__":
    main()

