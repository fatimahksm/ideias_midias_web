'use client';

import {useEffect} from 'react';
import {trackPageView} from '../track';

type Props = {
  /**
   * Locale-independent page path, e.g. "/" or "/sections/about". The English
   * and Portuguese versions of a page are the same page in the dashboard.
   */
  path: string;
  sectionSlug?: string;
};

/**
 * Reports one visit for the page it is mounted on. Rendering happens in the
 * browser, so only pages a person actually opened are counted — server-side
 * rendering and prefetching are not visits.
 */
export function PageViewTracker({path, sectionSlug}: Props) {
  useEffect(() => {
    void trackPageView(path, sectionSlug);
  }, [path, sectionSlug]);

  return null;
}
