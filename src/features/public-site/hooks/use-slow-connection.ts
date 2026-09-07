'use client';

import {useSyncExternalStore} from 'react';

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
};

function getConnection() {
  if (typeof navigator === 'undefined') return undefined;

  return (navigator as Navigator & {connection?: NetworkInformation}).connection;
}

const SLOW_CONNECTIONS = ['slow-2g', '2g', '3g'];

function isSlowConnection() {
  if (typeof window === 'undefined') return false;

  const connection = getConnection();

  if (!connection) return false;
  if (connection.saveData) return true;

  return SLOW_CONNECTIONS.includes(connection.effectiveType ?? '');
}

/** Re-checks when the connection changes, e.g. mobile data to wi-fi. */
function subscribe(onChange: () => void) {
  const connection = getConnection();

  connection?.addEventListener?.('change', onChange);

  return () => {
    connection?.removeEventListener?.('change', onChange);
  };
}

/**
 * True when the visitor has asked to save data or is on a slow connection
 * (2g/3g). The server snapshot is always false so this never mismatches on
 * hydration - a visitor's own device is what decides, not the server.
 */
export function useIsSlowConnection() {
  return useSyncExternalStore(subscribe, isSlowConnection, () => false);
}
