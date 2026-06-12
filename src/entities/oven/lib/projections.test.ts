import { describe, it, expect } from "vite-plus/test";
import { BigNumber } from "@/shared/lib/bignumber";
import {
  projectDepositUtil,
  projectWithdrawUtil,
  projectBorrowUtil,
  projectRepayUtil,
} from "./projections";

const bn = (v: BigNumber.Value) => new BigNumber(v);

// Base oven: 10 XTZ collateral, 50 kUSD debt, 100 kUSD max debt → 50% util.
function base(overrides: Partial<Parameters<typeof projectDepositUtil>[0]> = {}) {
  return {
    collateralXtz: bn(10),
    debtKusd: bn(50),
    maxDebt: bn(100),
    amount: bn(0),
    ...overrides,
  };
}

describe("projectDepositUtil", () => {
  it("returns null when amount is zero or negative", () => {
    expect(projectDepositUtil(base({ amount: bn(0) }))).toBeNull();
    expect(projectDepositUtil(base({ amount: bn(-1) }))).toBeNull();
  });

  it("returns null when maxDebt is null", () => {
    expect(projectDepositUtil(base({ amount: bn(5), maxDebt: null }))).toBeNull();
  });

  it("lowers utilization when adding collateral", () => {
    // +10 XTZ doubles collateral → maxDebt 200 → util 25%
    expect(projectDepositUtil(base({ amount: bn(10) }))).toBe(25);
  });

  it("returns 0 when there is no debt", () => {
    expect(projectDepositUtil(base({ amount: bn(5), debtKusd: bn(0) }))).toBe(0);
  });
});

describe("projectWithdrawUtil", () => {
  it("returns null when amount is zero", () => {
    expect(projectWithdrawUtil(base({ amount: bn(0) }))).toBeNull();
  });

  it("raises utilization when removing collateral", () => {
    // -5 XTZ halves collateral → maxDebt 50 → util 100%
    expect(projectWithdrawUtil(base({ amount: bn(5) }))).toBe(100);
  });

  it("returns 100 when withdrawing all collateral with outstanding debt", () => {
    expect(projectWithdrawUtil(base({ amount: bn(10) }))).toBe(100);
  });

  it("returns 0 when withdrawing all collateral with no debt", () => {
    expect(projectWithdrawUtil(base({ amount: bn(10), debtKusd: bn(0) }))).toBe(0);
  });
});

describe("projectBorrowUtil", () => {
  it("returns null when amount is zero", () => {
    expect(projectBorrowUtil(base({ amount: bn(0) }))).toBeNull();
  });

  it("returns null when maxDebt is null or zero", () => {
    expect(projectBorrowUtil(base({ amount: bn(10), maxDebt: null }))).toBeNull();
    expect(projectBorrowUtil(base({ amount: bn(10), maxDebt: bn(0) }))).toBeNull();
  });

  it("raises utilization when borrowing more", () => {
    // (50 + 25) / 100 = 75%
    expect(projectBorrowUtil(base({ amount: bn(25) }))).toBe(75);
  });

  it("clamps to 100 when borrowing beyond max", () => {
    expect(projectBorrowUtil(base({ amount: bn(100) }))).toBe(100);
  });
});

describe("projectRepayUtil", () => {
  it("returns null when amount is zero", () => {
    expect(projectRepayUtil(base({ amount: bn(0) }))).toBeNull();
  });

  it("lowers utilization when repaying", () => {
    // (50 - 25) / 100 = 25%
    expect(projectRepayUtil(base({ amount: bn(25) }))).toBe(25);
  });

  it("clamps to 0 when repaying more than the debt", () => {
    expect(projectRepayUtil(base({ amount: bn(100) }))).toBe(0);
  });
});
