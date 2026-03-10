import json
import sys


def ceil_div(numerator: int, denominator: int) -> int:
    if numerator == 0:
        return 0
    return (numerator + denominator - 1) // denominator


def pow4(value: int) -> int:
    return value * value * value * value


def floor_root4(value: int) -> int:
    left, right = 0, 2**32
    while left < right:
        mid = (left + right + 1) // 2
        if pow4(mid) <= value:
            left = mid
        else:
            right = mid - 1
    return left


def ceil_root4(value: int) -> int:
    floor_value = floor_root4(value)
    return floor_value if pow4(floor_value) == value else floor_value + 1


def apply_fee_down(amount: int, fee_bps: int) -> int:
    return amount * (10_000 - fee_bps) // 10_000


def quote_sbtc_in(reserve_sbtc: int, reserve_quote: int, fee_bps: int, max_trade_bps: int, amount_in: int) -> dict:
    effective_in = apply_fee_down(amount_in, fee_bps)
    trade_limit = reserve_sbtc * max_trade_bps // 10_000
    invariant = pow4(reserve_sbtc) * reserve_quote
    reserve_out_after_upper = ceil_div(invariant, pow4(reserve_sbtc + effective_in))
    reserve_out_after_lower = invariant // pow4(reserve_sbtc + effective_in)
    return {
        "amount_in": amount_in,
        "reserve_in": reserve_sbtc,
        "reserve_out": reserve_quote,
        "amount_in_effective": effective_in,
        "amount_out_lower": max(reserve_quote - reserve_out_after_upper, 0),
        "amount_out_upper": max(reserve_quote - reserve_out_after_lower, 0),
        "trade_limit": trade_limit,
        "invariant": invariant,
        "next_reserve_in_pricing": reserve_sbtc + effective_in,
        "pricing_denominator": pow4(reserve_sbtc + effective_in),
        "reserve_out_after_upper": reserve_out_after_upper,
        "reserve_out_after_lower": reserve_out_after_lower,
    }


def quote_quote_in(reserve_sbtc: int, reserve_quote: int, fee_bps: int, max_trade_bps: int, amount_in: int) -> dict:
    effective_in = apply_fee_down(amount_in, fee_bps)
    trade_limit = reserve_quote * max_trade_bps // 10_000
    invariant = pow4(reserve_sbtc) * reserve_quote
    reserve_out_input_upper = ceil_div(invariant, reserve_quote + effective_in)
    reserve_out_input_lower = invariant // (reserve_quote + effective_in)
    reserve_out_after_upper = ceil_root4(reserve_out_input_upper)
    reserve_out_after_lower = floor_root4(reserve_out_input_lower)
    return {
        "amount_in": amount_in,
        "reserve_in": reserve_quote,
        "reserve_out": reserve_sbtc,
        "amount_in_effective": effective_in,
        "amount_out_lower": max(reserve_sbtc - reserve_out_after_upper, 0),
        "amount_out_upper": max(reserve_sbtc - reserve_out_after_lower, 0),
        "trade_limit": trade_limit,
        "invariant": invariant,
        "next_reserve_in_pricing": reserve_quote + effective_in,
        "reserve_out_input_upper": reserve_out_input_upper,
        "reserve_out_input_lower": reserve_out_input_lower,
        "reserve_out_after_upper": reserve_out_after_upper,
        "reserve_out_after_lower": reserve_out_after_lower,
    }


def add_liquidity(reserve_sbtc: int, reserve_quote: int, share_supply: int, sbtc_amount: int, quote_amount: int) -> dict:
    if sbtc_amount * reserve_quote != quote_amount * reserve_sbtc:
      raise SystemExit("non-proportional")
    minted_shares = sbtc_amount * share_supply // reserve_sbtc
    return {
        "minted_shares": minted_shares,
        "reserve_sbtc": reserve_sbtc + sbtc_amount,
        "reserve_quote": reserve_quote + quote_amount,
        "share_supply": share_supply + minted_shares,
    }


def remove_liquidity(reserve_sbtc: int, reserve_quote: int, share_supply: int, share_amount: int) -> dict:
    amount_sbtc = share_amount * reserve_sbtc // share_supply
    amount_quote = share_amount * reserve_quote // share_supply
    return {
        "amount_sbtc": amount_sbtc,
        "amount_quote": amount_quote,
        "reserve_sbtc": reserve_sbtc - amount_sbtc,
        "reserve_quote": reserve_quote - amount_quote,
        "share_supply": share_supply - share_amount,
    }


def main() -> None:
    direction = sys.argv[1]
    reserve_sbtc = int(sys.argv[2])
    reserve_quote = int(sys.argv[3])
    fee_bps = int(sys.argv[4])
    max_trade_bps = int(sys.argv[5])
    amount_in = int(sys.argv[6])

    if direction == "sbtc-in":
        result = quote_sbtc_in(reserve_sbtc, reserve_quote, fee_bps, max_trade_bps, amount_in)
    elif direction == "quote-in":
        result = quote_quote_in(reserve_sbtc, reserve_quote, fee_bps, max_trade_bps, amount_in)
    elif direction == "add-liquidity":
        result = add_liquidity(reserve_sbtc, reserve_quote, reserve_sbtc, amount_in, int(sys.argv[7]))
    elif direction == "remove-liquidity":
        result = remove_liquidity(reserve_sbtc, reserve_quote, reserve_sbtc, amount_in)
    else:
        raise SystemExit(f"unsupported direction: {direction}")

    print(json.dumps(result))


if __name__ == "__main__":
    main()
