'use client';

import {useState} from 'react';

/** Every filter select uses this for "no filter applied". */
export const ALL_FILTER_VALUE = 'ALL';

/**
 * A filter that is normally the admin's to change, but gets pinned whenever the
 * screen is scoped to one section or category by the route.
 *
 * The pinned id can change while the screen stays mounted — moving from one
 * section's items to another's reuses the same component — so the filter has to
 * follow it. Re-deriving during render is React's documented answer for that;
 * doing it in an effect renders the stale value first and then immediately
 * again, which is the cascading render the lint rule warns about.
 *
 * A pinned id that goes away leaves the current value alone: the admin is back
 * on the unscoped screen and whatever they had selected still applies.
 */
export function usePinnedFilterState(
  pinnedId: number | undefined,
  initialValue: string = ALL_FILTER_VALUE
) {
  const [value, setValue] = useState(() =>
    typeof pinnedId === 'number' ? String(pinnedId) : initialValue
  );

  const [lastPinnedId, setLastPinnedId] = useState(pinnedId);

  if (pinnedId !== lastPinnedId) {
    setLastPinnedId(pinnedId);

    if (typeof pinnedId === 'number') {
      setValue(String(pinnedId));
    }
  }

  return [value, setValue] as const;
}
