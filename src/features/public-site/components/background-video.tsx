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

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Re-checks when the connection changes, e.g. mobile data to wi-fi. */
function subscribe(onChange: () => void) {
  const connection = getConnection();
  const motionQuery = window.matchMedia?.(REDUCED_MOTION_QUERY);

  connection?.addEventListener?.('change', onChange);
  motionQuery?.addEventListener('change', onChange);

  return () => {
    connection?.removeEventListener?.('change', onChange);
    motionQuery?.removeEventListener('change', onChange);
  };
}

type Props = {
  src: string;
  className?: string;
  /** Shown instead of the video when it is not worth loading. */
  posterUrl?: string;
};

const SLOW_CONNECTIONS = ['slow-2g', '2g', '3g'];

/**
 * True unless the visitor has asked to save data, is on a slow connection, or
 * has asked for reduced motion. A decorative background loop is never worth a
 * multi-megabyte download on a phone connection.
 */
function shouldLoadVideo() {
  if (typeof window === 'undefined') return false;

  if (window.matchMedia?.(REDUCED_MOTION_QUERY).matches) {
    return false;
  }

  const connection = getConnection();

  if (!connection) return true;
  if (connection.saveData) return false;

  return !SLOW_CONNECTIONS.includes(connection.effectiveType ?? '');
}

/**
 * A muted, looping background video that is not part of the server-rendered
 * markup: the browser only learns about it after the page decides the
 * connection can carry it, so a slow visitor never starts the download.
 */
export function BackgroundVideo({src, className, posterUrl}: Props) {
  // The server snapshot is always false, so the video is never in the
  // server-rendered HTML and no request starts before the check runs.
  const canPlay = useSyncExternalStore(subscribe, shouldLoadVideo, () => false);

  if (!canPlay) {
    return (
      <div
        className={className}
        style={
          posterUrl
            ? {
                backgroundImage: `url(${posterUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }
            : {backgroundColor: 'var(--color-secondary)'}
        }
      />
    );
  }

  return (
    <video
      className={className}
      src={src}
      poster={posterUrl}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
    />
  );
}
