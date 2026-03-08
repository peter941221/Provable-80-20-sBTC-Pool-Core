import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"


def write_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    ARTIFACTS.mkdir(exist_ok=True)

    write_json(
        ARTIFACTS / "proof-status.json",
        {
            "phase": "week2-swap-ready",
            "status": "in-progress",
            "claims": [
                {
                    "id": "P0",
                    "status": "in-progress",
                    "build": {
                        "workspace": "proof/",
                        "command": "lake build",
                        "status": "passing"
                    },
                    "completed": [
                        "pow4_zero",
                        "pow4_one",
                        "ceilDiv_zero_left",
                        "ceilDiv_ge_div",
                        "saturatingSub_zero",
                        "saturatingSub_le_left",
                        "saturatingSub_antitone_right",
                        "pow4_monotone",
                        "pow4_eq_square_square",
                        "le_pow4",
                        "ceilRoot4_of_exact",
                        "ceilRoot4_of_inexact",
                        "floorRoot4_spec",
                        "le_floorRoot4_of_pow4_le",
                        "floorRoot4_succ_pow4_gt",
                        "floorRoot4_monotone",
                        "floorRoot4_le_ceilRoot4",
                        "floorRoot4_input_le_ceilRoot4_input",
                        "le_pow4_ceilRoot4",
                        "lowerLeUpper_from_le"
                        ,"sbtcIn_lower_le_upper"
                        ,"quoteIn_lower_le_upper"
                        ,"write_uses_lower_bound"
                    ],
                    "checklist": [
                        "P0-A1",
                        "P0-A2",
                        "P0-A3",
                        "P0-B1",
                        "P0-B2",
                        "P0-B3",
                        "P0-C1",
                        "P0-C2",
                        "P0-C3",
                        "P0-C4",
                    ],
                    "workspace": "proof/",
                },
                {"id": "P1", "status": "planned"},
                {"id": "P2", "status": "planned"},
            ],
        },
    )

    write_json(
        ARTIFACTS / "demo-manifest.json",
        {
            "console": [
                "Overview",
                "Swap Verifier",
                "Witness Explorer",
                "LP Verifier",
                "Safety & Bindings",
                "Proof Status",
            ],
            "status": "week2-live-data",
            "entry": "frontend/judge-console/index.html",
        },
    )

    write_json(
        ARTIFACTS / "vector-pack.json",
        {
            "version": 1,
            "generated_by": "scripts/gen_artifacts.py",
            "vectors": [
                {
                    "id": "swap-sbtc-in-1000",
                    "direction": "sbtc-in",
                    "amount_in": 1000,
                    "amount_out_lower": 38905,
                    "amount_out_upper": 38906,
                },
                {
                    "id": "swap-quote-in-2000",
                    "direction": "quote-in",
                    "amount_in": 2000,
                    "amount_out_lower": 49,
                    "amount_out_upper": 50,
                },
            ],
        },
    )

    write_json(
        ARTIFACTS / "console-snapshot.json",
        {
            "overview": {
                "claim": "lower <= ideal <= upper",
                "weights": "80/20",
                "invariant": "x^4 * y = K",
            },
            "sample_swap": {
                "amount_in": 1000,
                "amount_in_effective": 997,
                "amount_out_lower": 38905,
                "amount_out_upper": 38906,
            },
            "safety": {
                "post_condition_mode": "Deny",
                "guard_enabled": True,
                "binding_status": "mock-sbtc + mock-quote",
            },
        },
    )

    print("generated artifacts")


if __name__ == "__main__":
    main()
