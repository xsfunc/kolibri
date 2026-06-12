import {
  createEffect,
  createEvent,
  createStore,
  sample,
  attach,
  combine,
  type EventCallable,
  type Store,
  type StoreWritable,
} from "effector";
import { getOvenClient, type KolibriOperation } from "@/shared/api/tezos";
import { $wallet, $walletBalanceXTZ, $walletBalance } from "@/entities/wallet";
import { refreshOvenFx, $ovenCalculations, $ovenHealthMap } from "@/entities/oven";
import type { HealthLevel, OvenCalculations } from "@/entities/oven";
import {
  projectDepositUtil,
  projectWithdrawUtil,
  projectBorrowUtil,
  projectRepayUtil,
  xtzToMutez,
  kusdToShard,
} from "@/entities/oven";
import { BigNumber } from "@/shared/lib/bignumber";

// ─── Types ───────────────────────────────────────────────────────────────────

interface OvenActionParams {
  ovenAddress: string;
  amount: string;
}

interface OvenActionResult {
  ovenAddress: string;
  op: KolibriOperation;
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

// ─── Effect factory ─────────────────────────────────────────────────────────

type OvenActionMethod = "deposit" | "withdraw" | "borrow" | "repay";

interface CreateOvenActionConfig {
  method: OvenActionMethod;
  amount: Store<string>;
  amountChanged: EventCallable<string>;
  submitted: EventCallable<void>;
  maxClicked: EventCallable<void>;
  max: Store<BigNumber | null>;
  maxPrecision: number;
  error: StoreWritable<string>;
  toRaw: (amount: string) => BigNumber;
  errorMsg: string;
}

function createOvenAction({
  method,
  amount,
  amountChanged,
  submitted,
  maxClicked,
  max,
  maxPrecision,
  error,
  toRaw,
  errorMsg,
}: CreateOvenActionConfig) {
  const rawFx = createEffect(
    async ({ ovenAddress, amount }: OvenActionParams): Promise<OvenActionResult> => {
      const client = getOvenClient(ovenAddress);
      const op = await client[method](new BigNumber(amount));
      return { ovenAddress, op };
    },
  );

  const fx = attach({
    source: $wallet,
    effect: rawFx,
    mapParams: (params: OvenActionParams, wallet) => {
      if (!wallet) throw new Error("Wallet not connected");
      return params;
    },
  });

  sample({
    clock: maxClicked,
    source: max,
    filter: (max) => max !== null,
    fn: (max) => max!.toFixed(maxPrecision),
    target: amountChanged,
  });

  sample({
    clock: submitted,
    source: { amount, ovenAddress: $activeOvenAddress },
    filter: ({ amount }) => amount !== "" && Number(amount) > 0,
    fn: ({ amount, ovenAddress }) => ({
      ovenAddress,
      amount: toRaw(amount).toString(),
    }),
    target: fx,
  });

  sample({
    clock: submitted,
    source: amount,
    filter: (amount) => amount === "" || Number(amount) <= 0,
    fn: () => "Amount must be greater than 0",
    target: error,
  });

  sample({ clock: fx.fail, fn: () => errorMsg, target: error });

  return fx;
}

const confirmAndRefreshFx = createEffect(async ({ ovenAddress, op }: OvenActionResult) => {
  await op.confirmed();
  return ovenAddress;
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

function projectionInput(amount: string, calc: OvenCalculations | null) {
  if (!calc) return null;
  return {
    collateralXtz: calc.collateralXtz,
    debtKusd: calc.debtKusd,
    maxDebt: calc.maxDebt,
    amount: new BigNumber(Number(amount) || 0),
  };
}

export const $depositProjectedUtil = combine($depositAmount, $activeOvenCalc, (amount, calc) => {
  const input = projectionInput(amount, calc);
  return input ? projectDepositUtil(input) : null;
});

export const $withdrawProjectedUtil = combine($withdrawAmount, $activeOvenCalc, (amount, calc) => {
  const input = projectionInput(amount, calc);
  return input ? projectWithdrawUtil(input) : null;
});

export const $borrowProjectedUtil = combine($borrowAmount, $activeOvenCalc, (amount, calc) => {
  const input = projectionInput(amount, calc);
  return input ? projectBorrowUtil(input) : null;
});

export const $repayProjectedUtil = combine($repayAmount, $activeOvenCalc, (amount, calc) => {
  const input = projectionInput(amount, calc);
  return input ? projectRepayUtil(input) : null;
});

// ─── Oven actions ───────────────────────────────────────────────────────────

export const depositFx = createOvenAction({
  method: "deposit",
  amount: $depositAmount,
  amountChanged: depositAmountChanged,
  submitted: depositSubmitted,
  maxClicked: depositMaxClicked,
  max: $depositMax,
  maxPrecision: 6,
  error: $depositError,
  toRaw: xtzToMutez,
  errorMsg: "Deposit failed",
});

export const withdrawFx = createOvenAction({
  method: "withdraw",
  amount: $withdrawAmount,
  amountChanged: withdrawAmountChanged,
  submitted: withdrawSubmitted,
  maxClicked: withdrawMaxClicked,
  max: $withdrawMax,
  maxPrecision: 6,
  error: $withdrawError,
  toRaw: xtzToMutez,
  errorMsg: "Withdrawal failed",
});

export const borrowFx = createOvenAction({
  method: "borrow",
  amount: $borrowAmount,
  amountChanged: borrowAmountChanged,
  submitted: borrowSubmitted,
  maxClicked: borrowMaxClicked,
  max: $borrowMax,
  maxPrecision: 2,
  error: $borrowError,
  toRaw: kusdToShard,
  errorMsg: "Borrow failed",
});

export const repayFx = createOvenAction({
  method: "repay",
  amount: $repayAmount,
  amountChanged: repayAmountChanged,
  submitted: repaySubmitted,
  maxClicked: repayMaxClicked,
  max: $repayMax,
  maxPrecision: 2,
  error: $repayError,
  toRaw: kusdToShard,
  errorMsg: "Repay failed",
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

sample({ clock: allOvenActionsDone, fn: ({ op }) => op.opHash, target: txSubmitted });
sample({ clock: allOvenActionsDone, target: dialogClosed });
sample({ clock: allOvenActionsDone, target: confirmAndRefreshFx });
sample({ clock: confirmAndRefreshFx.doneData, target: refreshOvenFx });
sample({ clock: confirmAndRefreshFx.doneData, target: txConfirmed });
