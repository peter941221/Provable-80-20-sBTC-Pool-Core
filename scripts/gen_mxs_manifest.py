from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "Clarinet.toml"
TARGET = ROOT / "Clarinet.mxs.toml"


REMOTE_BLOCK = 522000
API_URL = "https://api.mainnet.hiro.so"


def main() -> None:
    text = SOURCE.read_text(encoding="utf-8")
    if "[repl.remote_data]" in text:
        base = text.split("[repl.remote_data]", 1)[0].rstrip()
    else:
        base = text.rstrip()

    extra = f"""

[repl.remote_data]
enabled = true
api_url = "{API_URL}"
initial_height = {REMOTE_BLOCK}
use_mainnet_wallets = true
"""
    TARGET.write_text(base + extra + "\n", encoding="utf-8", newline="\n")
    print(f"wrote {TARGET}")


if __name__ == "__main__":
    main()
