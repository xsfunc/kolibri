import { createEvent, createStore, sample, combine, createEffect } from "effector";
import { donateXtzFx, donateKusdFx, donateUsdtFx, type Currency } from "./transfer";

export const donateOpened = createEvent();
export const donateClosed = createEvent();

export const $donateOpen = createStore<boolean>(false)
  .on(donateOpened, () => true)
  .on(donateClosed, () => false);

export const amountChanged = createEvent<string>();
export const currencyChanged = createEvent<Currency>();
export const donateSubmitted = createEvent();
export const donateFormReset = createEvent();

export const $amount = createStore("").on(amountChanged, (_, a) => a);
export const $currency = createStore<Currency>("XTZ").on(currencyChanged, (_, c) => c);

export type TxStatus = "idle" | "pending" | "success" | "error";
export const $txStatus = createStore<TxStatus>("idle");
export const $txError = createStore("");

export const $donatePending = combine(
  donateXtzFx.pending,
  donateKusdFx.pending,
  donateUsdtFx.pending,
  (a, b, c) => a || b || c,
);

const donateDispatchFx = createEffect(
  async ({ amount, currency }: { amount: string; currency: Currency }) => {
    switch (currency) {
      case "XTZ":
        return donateXtzFx({ amount });
      case "kUSD":
        return donateKusdFx({ amount });
      case "USDT":
        return donateUsdtFx({ amount });
    }
  },
);

sample({
  clock: donateSubmitted,
  source: { amount: $amount, currency: $currency },
  filter: ({ amount }) => amount !== "" && Number(amount) > 0,
  target: donateDispatchFx,
});

sample({
  clock: donateSubmitted,
  source: $amount,
  filter: (amount) => amount === "" || Number(amount) <= 0,
  fn: () => "Amount must be greater than 0",
  target: $txError,
});

sample({ clock: donateSubmitted, fn: () => "pending" as TxStatus, target: $txStatus });
sample({ clock: donateSubmitted, fn: () => "", target: $txError });
sample({ clock: donateDispatchFx.doneData, fn: () => "success" as TxStatus, target: $txStatus });
sample({
  clock: donateDispatchFx.failData,
  fn: (e) => (e instanceof Error ? e.message : "Transaction failed"),
  target: $txError,
});
sample({ clock: donateDispatchFx.failData, fn: () => "error" as TxStatus, target: $txStatus });

[$amount, $currency, $txStatus, $txError].forEach((s) => s.reset(donateFormReset));
sample({ clock: donateClosed, target: donateFormReset });
