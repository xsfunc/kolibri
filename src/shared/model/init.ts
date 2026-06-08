import { createEvent } from "effector";

/**
 * Single entry point of the application.
 * Called once when App mounts.
 * All initialization effects are wired via sample({ clock: appStarted }).
 */
export const appStarted = createEvent();
