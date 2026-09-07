'use client';

import {useSyncExternalStore} from 'react';
import {useIsSlowConnection} from '../hooks/use-slow-connection';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;

  return window.matchMedia?.(REDUCED_MOTION_QUERY).matches ?? false;
}

function subscribeToMotionPreference(onChange: () => void) {
  const motionQuery = window.matchMedia?.(REDUCED_MOTION_QUERY);

  motionQuery?.addEventListener('change', onChange);

  return () => {
    motionQuery?.removeEventListener('change', onChange);
  };
}

type Props = {
  src: string;
  className?: string;
  /** Shown instead of the video when it is not worth loading. */
  posterUrl?: string;
};

/**
 * A muted, looping background video that is not part of the server-rendered
 * markup: the browser only learns about it after the page decides the
 * connection can carry it, so a slow visitor never starts the download. A
 * decorative background loop is never worth a multi-megabyte download on a
 * phone connection, or worth it to a visitor who asked for reduced motion.
 */
export function BackgroundVideo({src, className, posterUrl}: Props) {
  const isSlowConnection = useIsSlowConnection();
  // The server snapshot is always false, so the video is never in the
  // server-rendered HTML and no request starts before the check runs.
  const reducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    prefersReducedMotion,
    () => false
  );

  const canPlay = !isSlowConnection && !reducedMotion;

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
