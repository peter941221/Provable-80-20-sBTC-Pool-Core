import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"


def write_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    ARTIFACTS.mkdir(exist_ok=True)

    claim_matrix = [
        {
            "id": "CL-01",
            "claim": "sbtc-in readonly quote keeps lower <= upper and write path uses the lower bound",
            "contract": ["quote-sbtc-in", "debug-sbtc-in", "swap-sbtc-in"],
            "proof": ["sbtcIn_lower_le_upper", "swapWriteOutput_eq_lower", "swapWriteOutput_le_upper"],
            "tests": ["tests/unit/pool-80-20.test.ts", "tests/differential/reference-model.test.ts"],
            "artifacts": ["artifacts/vector-pack.json", "artifacts/judge-console-data.json"],
            "panel": "Swap Verifier",
            "status": "proved-and-tested",
        },
        {
            "id": "CL-02",
            "claim": "quote-in readonly quote keeps lower <= upper and the witness stays inspectable",
            "contract": ["quote-quote-in", "debug-quote-in", "swap-quote-in"],
            "proof": ["quoteIn_lower_le_upper", "floorRoot4_input_le_ceilRoot4_input"],
            "tests": ["tests/unit/pool-80-20.test.ts", "tests/differential/reference-model.test.ts"],
            "artifacts": ["artifacts/vector-pack.json", "artifacts/judge-console-data.json"],
            "panel": "Witness Explorer",
            "status": "proved-and-tested",
        },
        {
            "id": "CL-03",
            "claim": "LP add/remove stays proportional, withdrawals require LP share ownership, and share accounting remains closed over share-supply + lp-balances",
            "contract": ["add-liquidity", "remove-liquidity", "get-lp-balance"],
            "proof": ["addLiquidity_share_closed", "removeLiquidity_share_closed", "addLiquidity_reserves_increase", "removeLiquidity_reserves_decrease", "add_remove_roundtrip_exact"],
            "tests": ["tests/unit/pool-80-20.test.ts", "tests/differential/reference-model.test.ts"],
            "artifacts": ["artifacts/judge-console-data.json"],
            "panel": "LP Verifier",
            "status": "proved-and-tested",
        },
        {
            "id": "CL-04",
            "claim": "Clarity 4 guards, hash-enforced binding (including pure outflow paths), and post-condition expectations are explicit and reviewable",
            "contract": [
                "get-safety-envelope",
                "get-binding-status",
                "get-sbtc-contract-hash",
                "get-quote-contract-hash",
                "swap-sbtc-in",
                "swap-quote-in",
                "add-liquidity",
                "remove-liquidity",
            ],
            "proof": ["hashBinding_accepts_matching", "hashBinding_rejects_mismatch", "pairHashBinding_accepts_matching", "pairHashBinding_implies_component_equalities", "initCapturesHashBinding"],
            "tests": ["tests/unit/pool-80-20.test.ts"],
            "artifacts": ["artifacts/console-snapshot.json", "artifacts/judge-console-data.json"],
            "panel": "Safety & Bindings",
            "status": "proved-tested-and-visible",
        },
        {
            "id": "CL-05",
            "claim": "The reference Python model matches the on-chain readonly quote path for the sampled differential suite",
            "contract": ["quote-sbtc-in", "quote-quote-in", "add-liquidity", "remove-liquidity"],
            "proof": [],
            "tests": ["tests/differential/reference-model.test.ts"],
            "artifacts": ["artifacts/vector-pack.json"],
            "panel": "Overview",
            "status": "tested",
        },
        {
            "id": "CL-06",
            "claim": "Official sBTC requirement wiring and fixed-height MXS scenarios are both reproducible",
            "contract": ["SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token", "SP000000000000000000002Q6VF78.pox-4"],
            "proof": [],
            "tests": ["tests/unit/sbtc-requirement.test.ts", "tests/mxs/mainnet-realism.test.ts"],
            "artifacts": ["Clarinet.mxs.toml"],
            "panel": "Overview",
            "status": "tested",
        },
        {
            "id": "CL-07",
            "claim": "Write paths enforce an explicit uint128 math domain for reserve transitions and invariant math",
            "contract": ["initialize", "swap-sbtc-in", "swap-quote-in", "add-liquidity", "remove-liquidity", "get-safety-envelope"],
            "proof": ["safeReserves_pow4_input_le_bound", "safeReserves_invariant_le_max", "swapSbtcIn_nextState_safe_of_checks", "swapQuoteIn_nextState_safe_of_checks", "addLiquidity_nextState_safe_of_checks", "removeLiquidity_nextState_safe_of_checks"],
            "tests": ["tests/unit/pool-80-20.test.ts"],
            "artifacts": ["artifacts/console-snapshot.json", "artifacts/judge-console-data.json"],
            "panel": "Safety & Bindings",
            "status": "proved-and-tested",
        },
    ]

    write_json(
        ARTIFACTS / "proof-status.json",
        {
            "phase": "week2-proof-engine-complete",
            "status": "in-progress",
            "claims": [
                {
                    "id": "P0",
                    "status": "completed",
                    "build": {
                        "workspace": "proof/",
                        "command": "lake build",
                        "status": "passing"
                    },
                    "items": [
                        {"id": "P0-A1", "status": "proved", "theorems": ["pow4_monotone"]},
                        {"id": "P0-A2", "status": "proved", "theorems": ["ceilDiv_ge_div"]},
                        {"id": "P0-A3", "status": "proved", "theorems": ["saturatingSub_le_left", "saturatingSub_antitone_right"]},
                        {"id": "P0-B1", "status": "proved", "theorems": ["floorRoot4_spec", "le_floorRoot4_of_pow4_le"]},
                        {"id": "P0-B2", "status": "proved", "theorems": ["le_pow4_ceilRoot4", "floorRoot4_succ_pow4_gt"]},
                        {"id": "P0-B3", "status": "proved", "theorems": ["ceilRoot4_of_exact", "ceilRoot4_of_inexact", "floorRoot4_le_ceilRoot4"]},
                        {"id": "P0-C1", "status": "proved", "theorems": ["sbtcIn_lower_le_upper", "sbtcIn_lower_le_upper_from_formula"]},
                        {"id": "P0-C2", "status": "proved", "theorems": ["swapWriteOutput_eq_lower", "write_uses_lower_bound"]},
                        {"id": "P0-C3", "status": "proved", "theorems": ["quoteIn_lower_le_upper", "floorRoot4_input_le_ceilRoot4_input"]},
                        {"id": "P0-C4", "status": "proved", "theorems": ["swapWriteOutput_le_upper"]}
                    ],
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
                        ,"sbtcIn_lower_le_upper_from_formula"
                        ,"quoteIn_lower_le_upper"
                        ,"swapWriteOutput_eq_lower"
                        ,"swapWriteOutput_le_upper"
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
                {
                    "id": "P1",
                    "status": "completed",
                    "items": [
                        {"id": "P1-R1", "status": "proved", "theorems": ["legalSwapSbtcIn_preserves_min", "legalSwapQuoteIn_preserves_min"]},
                        {"id": "P1-L1", "status": "proved", "theorems": ["addLiquidity_share_closed", "removeLiquidity_share_closed"]},
                        {"id": "P1-L2", "status": "proved", "theorems": ["addLiquidity_reserves_increase", "removeLiquidity_reserves_decrease"]},
                        {"id": "P1-D1", "status": "proved", "theorems": ["safeReserves_pow4_input_le_bound", "safeReserves_invariant_le_max", "swapSbtcIn_nextState_safe_of_checks", "swapQuoteIn_nextState_safe_of_checks", "addLiquidity_nextState_safe_of_checks", "removeLiquidity_nextState_safe_of_checks"]},
                        {"id": "P1-H1", "status": "proved", "theorems": ["hashBinding_accepts_matching", "hashBinding_rejects_mismatch", "pairHashBinding_accepts_matching", "pairHashBinding_implies_component_equalities", "initCapturesHashBinding"]}
                    ]
                },
                {
                    "id": "P2",
                    "status": "completed",
                    "items": [
                        {"id": "P2-C1", "status": "proved", "theorems": ["compose_sbtc_then_quote_preserves_mins"]},
                        {"id": "P2-C2", "status": "proved", "theorems": ["add_remove_roundtrip_exact", "add_remove_roundtrip_preserves_state_exact"]}
                    ]
                },
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
                "Chaos Summary",
                "Proof Status",
            ],
            "status": "week2-live-readonly-evidence-pack",
            "entry": "frontend/judge-console/index.html",
        },
    )

    write_json(
        ARTIFACTS / "claim-matrix.json",
        {
            "version": 1,
            "generated_by": "scripts/gen_artifacts.py",
            "claims": claim_matrix,
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
                "math_domain_guard_enabled": True,
                "binding_status": "mock-sbtc + mock-quote",
            },
        },
    )

    print("generated artifacts")


if __name__ == "__main__":
    main()
