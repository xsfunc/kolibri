import { createEvent, createStore } from "effector";

export const donateOpened = createEvent();
export const donateClosed = createEvent();

export const $donateOpen = createStore<boolean>(false)
  .on(donateOpened, () => true)
  .on(donateClosed, () => false);
