import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"
REQUIRED = [
    "proof-status.json",
    "demo-manifest.json",
    "vector-pack.json",
]


def main() -> None:
    missing: list[str] = []
    invalid: list[str] = []

    for name in REQUIRED:
        path = ARTIFACTS / name
        if not path.exists():
            missing.append(name)
            continue
        try:
            json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            invalid.append(name)

    if missing or invalid:
        raise SystemExit(f"missing={missing} invalid={invalid}")

    print("artifact manifest ok")


if __name__ == "__main__":
    main()
