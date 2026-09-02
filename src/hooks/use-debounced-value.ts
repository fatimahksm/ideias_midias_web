'use client';

import {useEffect, useState} from 'react';

/**
 * Holds a value still for a moment before passing it on. Search boxes now
 * drive server queries, so without this every keystroke would be a request.
 */
export function useDebouncedValue<T>(value: T, delayMs = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
