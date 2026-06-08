import { createEvent, createStore } from "effector";

export const rpcSettingsOpened = createEvent();
export const rpcSettingsClosed = createEvent();

export const $rpcSettingsOpen = createStore<boolean>(false)
  .on(rpcSettingsOpened, () => true)
  .on(rpcSettingsClosed, () => false);
