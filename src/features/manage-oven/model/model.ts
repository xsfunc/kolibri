import { createEffect, createEvent, createStore, sample, attach, combine } from "effector";
import { getOvenClient } from "@/shared/api/tezos/sdk";
import { $wallet, $walletBalanceXTZ, $walletBalance } from "@/entities/wallet";
import { refreshOvenFx, $ovenCalculations, $ovenHealthMap } from "@/entities/oven";
import type { HealthLevel } from "@/entities/oven";
import { BigNumber } from "@/shared/lib/bignumber";

// ─── Types ───────────────────────────────────────────────────────────────────

interface OvenActionParams {
  ovenAddress: string;
  amount: string;
}

export type Tab = "deposit" | "withdraw" | "borrow" | "repay";

// ─── Events ──────────────────────────────────────────────────────────────────

export const txSubmitted = createEvent<string>();
export const txConfirmed = createEvent<string>();

export const tabChanged = createEvent<Tab>();
export const ovenAddressSet = createEvent<string>();
export const dialogOpened = createEvent<{ ovenAddress: string; tab: Tab }>();
export const dialogClosed = createEvent();

export const depositAmountChanged = createEvent<string>();
export const withdrawAmountChanged = createEvent<string>();
export const borrowAmountChanged = createEvent<string>();
export const repayAmountChanged = createEvent<string>();

export const depositMaxClicked = createEvent();
export const withdrawMaxClicked = createEvent();
export const borrowMaxClicked = createEvent();
export const repayMaxClicked = createEvent();

export const depositSubmitted = createEvent();
export const withdrawSubmitted = createEvent();
export const borrowSubmitted = createEvent();
export const repaySubmitted = createEvent();

export const formCleared = createEvent();

// ─── Raw effects ─────────────────────────────────────────────────────────────

const depositRawFx = createEffect(async ({ ovenAddress, amount }: OvenActionParams) => {
  const client = getOvenClient(ovenAddress);
  await client.deposit(new BigNumber(amount));
  return ovenAddress;
});

const withdrawRawFx = createEffect(async ({ ovenAddress, amount }: OvenActionParams) => {
  const client = getOvenClient(ovenAddress);
  await client.withdraw(new BigNumber(amount));
  return ovenAddress;
});

const borrowRawFx = createEffect(async ({ ovenAddress, amount }: OvenActionParams) => {
  const client = getOvenClient(ovenAddress);
  await client.borrow(new BigNumber(amount));
  return ovenAddress;
});

const repayRawFx = createEffect(async ({ ovenAddress, amount }: OvenActionParams) => {
  const client = getOvenClient(ovenAddress);
  await client.repay(new BigNumber(amount));
  return ovenAddress;
});

// ─── Attached effects (guard: wallet must be connected) ──────────────────────

export const depositFx = attach({
  source: $wallet,
  effect: depositRawFx,
  mapParams: (params: OvenActionParams, wallet) => {
    if (!wallet) throw new Error("Wallet not connected");
    return params;
  },
});

export const withdrawFx = attach({
  source: $wallet,
  effect: withdrawRawFx,
  mapParams: (params: OvenActionParams, wallet) => {
    if (!wallet) throw new Error("Wallet not connected");
    return params;
  },
});

export const borrowFx = attach({
  source: $wallet,
  effect: borrowRawFx,
  mapParams: (params: OvenActionParams, wallet) => {
    if (!wallet) throw new Error("Wallet not connected");
    return params;
  },
});

export const repayFx = attach({
  source: $wallet,
  effect: repayRawFx,
  mapParams: (params: OvenActionParams, wallet) => {
    if (!wallet) throw new Error("Wallet not connected");
    return params;
  },
});

// ─── Stores: tab + active oven ───────────────────────────────────────────────

export const $activeTab = createStore<Tab>("deposit").on(tabChanged, (_, t) => t);
export const $activeOvenAddress = createStore("").on(ovenAddressSet, (_, addr) => addr);
export const $dialogOpen = createStore(false)
  .on(dialogOpened, () => true)
  .on(dialogClosed, () => false);

sample({ clock: dialogOpened, fn: ({ ovenAddress }) => ovenAddress, target: ovenAddressSet });
sample({ clock: dialogOpened, fn: ({ tab }) => tab, target: tabChanged });
sample({ clock: dialogOpened, target: formCleared });
sample({ clock: dialogClosed, target: formCleared });

// ─── Stores: form amounts ────────────────────────────────────────────────────

export const $depositAmount = createStore("").on(depositAmountChanged, (_, a) => a);
export const $withdrawAmount = createStore("").on(withdrawAmountChanged, (_, a) => a);
export const $borrowAmount = createStore("").on(borrowAmountChanged, (_, a) => a);
export const $repayAmount = createStore("").on(repayAmountChanged, (_, a) => a);

// ─── Stores: form errors ─────────────────────────────────────────────────────

export const $depositError = createStore("").on(depositAmountChanged, () => "");
export const $withdrawError = createStore("").on(withdrawAmountChanged, () => "");
export const $borrowError = createStore("").on(borrowAmountChanged, () => "");
export const $repayError = createStore("").on(repayAmountChanged, () => "");

// ─── Form reset ──────────────────────────────────────────────────────────────

const formStores = [
  $depositAmount,
  $withdrawAmount,
  $borrowAmount,
  $repayAmount,
  $depositError,
  $withdrawError,
  $borrowError,
  $repayError,
];

formStores.forEach((s) => s.reset(formCleared));

// ─── Derived: active oven ─────────────────────────────────────────────────────

export const $activeOvenCalc = combine(
  $ovenCalculations,
  $activeOvenAddress,
  (calcs, addr) => calcs[addr] ?? null,
);

export const $activeOvenHealthLevel = combine(
  $ovenHealthMap,
  $activeOvenAddress,
  (healthMap, addr): HealthLevel => healthMap[addr]?.level ?? "safe",
);

// ─── Derived: max amounts ────────────────────────────────────────────────────

export const $depositMax = $walletBalanceXTZ.map((xtz) => {
  if (!xtz) return null;
  const max = xtz.minus(0.1);
  return max.gt(0) ? max : new BigNumber(0);
});

export const $withdrawMax = $activeOvenCalc.map((calc) => {
  if (!calc) return null;
  const coll = calc.collateralXtz.toNumber();
  const debt = calc.debtKusd.toNumber();
  const max = calc.maxDebt?.toNumber() ?? 0;
  if (max <= 0 || debt <= 0) return calc.collateralXtz;
  const safeMax = coll * (1 - debt / max);
  return new BigNumber(Math.max(0, safeMax));
});

export const $borrowMax = $activeOvenCalc.map((calc) => {
  if (!calc?.maxDebt || !calc?.debtKusd) return null;
  const available = calc.maxDebt.minus(calc.debtKusd);
  return available.gt(0) ? available : null;
});

export const $repayMax = combine($activeOvenCalc, $walletBalance, (calc, kusdBalance) => {
  if (!calc?.debtKusd || !kusdBalance) return null;
  const repayMax = BigNumber.min(calc.debtKusd, kusdBalance);
  return repayMax.gt(0) ? repayMax : null;
});

// ─── Derived: utilization ────────────────────────────────────────────────────

export const $currentUtilization = $activeOvenCalc.map((calc) => calc?.utilizationPct ?? 0);

export const $depositProjectedUtil = combine($depositAmount, $activeOvenCalc, (amount, calc) => {
  const numAmount = Number(amount) || 0;
  if (numAmount <= 0) return null;
  if (!calc) return null;
  const coll = calc.collateralXtz.toNumber();
  const max = calc.maxDebt?.toNumber() ?? 0;
  const debt = calc.debtKusd.toNumber();
  if (coll <= 0 || max <= 0) return debt > 0 ? null : 0;
  const newMaxDebt = max * (1 + numAmount / coll);
  if (debt <= 0 || newMaxDebt <= 0) return 0;
  return Math.min(100, (debt / newMaxDebt) * 100);
});

export const $withdrawProjectedUtil = combine($withdrawAmount, $activeOvenCalc, (amount, calc) => {
  const numAmount = Number(amount) || 0;
  if (numAmount <= 0) return null;
  if (!calc) return null;
  const coll = calc.collateralXtz.toNumber();
  const max = calc.maxDebt?.toNumber() ?? 0;
  const debt = calc.debtKusd.toNumber();
  if (coll <= 0 || max <= 0) return null;
  const newColl = coll - numAmount;
  if (newColl <= 0) return debt > 0 ? 100 : 0;
  const newMaxDebt = max * (newColl / coll);
  if (debt <= 0 || newMaxDebt <= 0) return 0;
  return Math.min(100, (debt / newMaxDebt) * 100);
});

export const $borrowProjectedUtil = combine($borrowAmount, $activeOvenCalc, (amount, calc) => {
  const numAmount = Number(amount) || 0;
  if (numAmount <= 0) return null;
  if (!calc) return null;
  const max = calc.maxDebt?.toNumber() ?? 0;
  const debt = calc.debtKusd.toNumber();
  if (max <= 0) return null;
  return Math.min(100, ((debt + numAmount) / max) * 100);
});

export const $repayProjectedUtil = combine($repayAmount, $activeOvenCalc, (amount, calc) => {
  const numAmount = Number(amount) || 0;
  if (numAmount <= 0) return null;
  if (!calc) return null;
  const max = calc.maxDebt?.toNumber() ?? 0;
  const debt = calc.debtKusd.toNumber();
  if (max <= 0) return null;
  return Math.min(100, Math.max(0, ((debt - numAmount) / max) * 100));
});

// ─── Derived: pending states ─────────────────────────────────────────────────

export const $depositPending = depositFx.pending;
export const $withdrawPending = withdrawFx.pending;
export const $borrowPending = borrowFx.pending;
export const $repayPending = repayFx.pending;

// ─── Wiring: after any oven action → refresh + confirm + close ───────────────

const allOvenActionsDone = [
  depositFx.doneData,
  withdrawFx.doneData,
  borrowFx.doneData,
  repayFx.doneData,
];

sample({ clock: allOvenActionsDone, target: refreshOvenFx });
sample({ clock: allOvenActionsDone, target: txConfirmed });
sample({ clock: allOvenActionsDone, target: dialogClosed });

// ─── Wiring: max clicks → set amount ─────────────────────────────────────────

sample({
  clock: depositMaxClicked,
  source: $depositMax,
  filter: (max) => max !== null,
  fn: (max) => max!.toFixed(6),
  target: depositAmountChanged,
});

sample({
  clock: withdrawMaxClicked,
  source: $withdrawMax,
  filter: (max) => max !== null,
  fn: (max) => max!.toFixed(6),
  target: withdrawAmountChanged,
});

sample({
  clock: borrowMaxClicked,
  source: $borrowMax,
  filter: (max) => max !== null,
  fn: (max) => max!.toFixed(2),
  target: borrowAmountChanged,
});

sample({
  clock: repayMaxClicked,
  source: $repayMax,
  filter: (max) => max !== null,
  fn: (max) => max!.toFixed(2),
  target: repayAmountChanged,
});

// ─── Wiring: deposit submit ──────────────────────────────────────────────────

sample({
  clock: depositSubmitted,
  source: { amount: $depositAmount, ovenAddress: $activeOvenAddress },
  filter: ({ amount }) => amount !== "" && Number(amount) > 0,
  fn: ({ amount, ovenAddress }) => ({
    ovenAddress,
    amount: new BigNumber(amount).multipliedBy(1e6).integerValue().toString(),
  }),
  target: depositFx,
});

sample({
  clock: depositSubmitted,
  source: $depositAmount,
  filter: (amount) => amount === "" || Number(amount) <= 0,
  fn: () => "Amount must be greater than 0",
  target: $depositError,
});

sample({ clock: depositFx.fail, fn: () => "Deposit failed", target: $depositError });

// ─── Wiring: withdraw submit ─────────────────────────────────────────────────

sample({
  clock: withdrawSubmitted,
  source: { amount: $withdrawAmount, ovenAddress: $activeOvenAddress },
  filter: ({ amount }) => amount !== "" && Number(amount) > 0,
  fn: ({ amount, ovenAddress }) => ({
    ovenAddress,
    amount: new BigNumber(amount).multipliedBy(1e6).integerValue().toString(),
  }),
  target: withdrawFx,
});

sample({
  clock: withdrawSubmitted,
  source: $withdrawAmount,
  filter: (amount) => amount === "" || Number(amount) <= 0,
  fn: () => "Amount must be greater than 0",
  target: $withdrawError,
});

sample({ clock: withdrawFx.fail, fn: () => "Withdrawal failed", target: $withdrawError });

// ─── Wiring: borrow submit ───────────────────────────────────────────────────

sample({
  clock: borrowSubmitted,
  source: { amount: $borrowAmount, ovenAddress: $activeOvenAddress },
  filter: ({ amount }) => amount !== "" && Number(amount) > 0,
  fn: ({ amount, ovenAddress }) => ({
    ovenAddress,
    amount: new BigNumber(amount).multipliedBy(1e18).integerValue().toString(),
  }),
  target: borrowFx,
});

sample({
  clock: borrowSubmitted,
  source: $borrowAmount,
  filter: (amount) => amount === "" || Number(amount) <= 0,
  fn: () => "Amount must be greater than 0",
  target: $borrowError,
});

sample({ clock: borrowFx.fail, fn: () => "Borrow failed", target: $borrowError });

// ─── Wiring: repay submit ────────────────────────────────────────────────────

sample({
  clock: repaySubmitted,
  source: { amount: $repayAmount, ovenAddress: $activeOvenAddress },
  filter: ({ amount }) => amount !== "" && Number(amount) > 0,
  fn: ({ amount, ovenAddress }) => ({
    ovenAddress,
    amount: new BigNumber(amount).multipliedBy(1e18).integerValue().toString(),
  }),
  target: repayFx,
});

sample({
  clock: repaySubmitted,
  source: $repayAmount,
  filter: (amount) => amount === "" || Number(amount) <= 0,
  fn: () => "Amount must be greater than 0",
  target: $repayError,
});

sample({ clock: repayFx.fail, fn: () => "Repay failed", target: $repayError });
