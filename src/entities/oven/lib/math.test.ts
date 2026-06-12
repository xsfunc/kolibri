import { describe, it, expect } from "vite-plus/test";
import { BigNumber } from "@/shared/lib/bignumber";
import {
  mutezToXtz,
  shardToKusd,
  xtzToMutez,
  kusdToShard,
  collateralValueUsd,
  maxDebt,
  utilizationPct,
  liquidationPrice,
  healthFactor,
} from "./math";

const bn = (v: BigNumber.Value) => new BigNumber(v);

describe("unit conversions", () => {
  it("mutezToXtz divides by 1e6", () => {
    expect(mutezToXtz(bn("1000000")).toNumber()).toBe(1);
    expect(mutezToXtz(bn("2500000")).toNumber()).toBe(2.5);
    expect(mutezToXtz(bn(0)).toNumber()).toBe(0);
  });

  it("shardToKusd divides by 1e18", () => {
    expect(shardToKusd(bn("1000000000000000000")).toNumber()).toBe(1);
    expect(shardToKusd(bn("500000000000000000")).toNumber()).toBe(0.5);
  });

  it("xtzToMutez multiplies by 1e6 and rounds to integer", () => {
    expect(xtzToMutez("1").toString()).toBe("1000000");
    expect(xtzToMutez("2.5").toString()).toBe("2500000");
    // sub-mutez precision is rounded (BigNumber default ROUND_HALF_UP)
    expect(xtzToMutez("0.0000005").toString()).toBe("1");
    expect(xtzToMutez("0.0000014").toString()).toBe("1");
  });

  it("kusdToShard multiplies by 1e18 and floors to integer", () => {
    expect(kusdToShard("1").toString()).toBe("1000000000000000000");
    expect(kusdToShard("0.5").toString()).toBe("500000000000000000");
  });

  it("round-trips raw → human → raw", () => {
    const raw = bn("1234567");
    expect(xtzToMutez(mutezToXtz(raw)).toString()).toBe(raw.toString());
  });
});

describe("collateralValueUsd", () => {
  it("multiplies collateral by price", () => {
    expect(collateralValueUsd(bn(10), bn("0.5"))!.toNumber()).toBe(5);
  });

  it("returns null when price is unknown", () => {
    expect(collateralValueUsd(bn(10), null)).toBeNull();
  });
});

describe("maxDebt", () => {
  // collateralRate is a percentage as stored by the Minter (e.g. 155 = 155%).
  it("computes max debt = collateralValue * 100 / collateralRate", () => {
    // $200 collateral at 200% required ratio → $100 max debt
    expect(maxDebt(bn(200), bn(200))!.toNumber()).toBe(100);
    // $155 collateral at 155% required ratio → $100 max debt
    expect(maxDebt(bn(155), bn(155))!.toNumber()).toBe(100);
  });

  it("returns null when collateralValue is null", () => {
    expect(maxDebt(null, bn(200))).toBeNull();
  });

  it("returns null when collateralRate is null", () => {
    expect(maxDebt(bn(200), null)).toBeNull();
  });
});

describe("utilizationPct", () => {
  it("returns 0 when debt is zero", () => {
    expect(utilizationPct(bn(0), bn(100))).toBe(0);
  });

  it("returns 0 when maxDebt is null or zero", () => {
    expect(utilizationPct(bn(50), null)).toBe(0);
    expect(utilizationPct(bn(50), bn(0))).toBe(0);
  });

  it("computes debt / maxDebt as a percentage", () => {
    expect(utilizationPct(bn(50), bn(100))).toBe(50);
    expect(utilizationPct(bn(25), bn(200))).toBe(12.5);
  });

  it("clamps to 100 when over-utilized", () => {
    expect(utilizationPct(bn(150), bn(100))).toBe(100);
  });
});

describe("liquidationPrice", () => {
  it("returns null when there is no debt", () => {
    expect(liquidationPrice(bn(10), bn(0), bn(200))).toBeNull();
  });

  it("returns null when collateral is zero", () => {
    expect(liquidationPrice(bn(0), bn(50), bn(200))).toBeNull();
  });

  it("returns null when collateralRate is null", () => {
    expect(liquidationPrice(bn(10), bn(50), null)).toBeNull();
  });

  it("computes debt * rate / (collateral * 100)", () => {
    // collateralRate is a percentage (e.g. 155 = 155%)
    // 100 kUSD debt, 10 XTZ collateral, 200% ratio → 100 * 200 / (10 * 100) = 20
    expect(liquidationPrice(bn(10), bn(100), bn(200))!.toNumber()).toBe(20);
    // 100 kUSD debt, 10 XTZ collateral, 155% ratio → 100 * 155 / (10 * 100) = 15.5
    expect(liquidationPrice(bn(10), bn(100), bn(155))!.toNumber()).toBe(15.5);
  });
});

describe("healthFactor", () => {
  it("returns null when price is unknown", () => {
    expect(healthFactor(bn(10), bn(50), null)).toBeNull();
  });

  it("returns null when there is no debt", () => {
    expect(healthFactor(bn(10), bn(0), bn(2))).toBeNull();
  });

  it("computes collateralValue / debt", () => {
    // 10 XTZ * $2 = $20 collateral, $10 debt → factor 2.0
    expect(healthFactor(bn(10), bn(10), bn(2))!.toNumber()).toBe(2);
  });
});
