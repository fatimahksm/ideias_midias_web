'use client';

import {useSyncExternalStore} from 'react';

/** The hydration flag never changes after mount, so there is nothing to subscribe to. */
const subscribe = () => () => {};

const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * False while rendering on the server and through hydration, true afterwards.
 *
 * Anything that reads a browser-only source — localStorage above all — has to
 * wait for this, or the server and client render different markup and React
 * throws away the tree. The obvious `useState(false)` + `useEffect(() => set(true))`
 * does the same job but schedules a second render pass for every component that
 * uses it; `useSyncExternalStore` gets the value right on the first client
 * render instead.
 */
export function useIsHydrated() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
