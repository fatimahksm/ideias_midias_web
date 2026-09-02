import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import {getVisitorId} from './visitor-id';

const SENT_PATHS_KEY = 'tracked_page_views';

/**
 * Paths already reported in this tab, so client-side navigation back and
 * forth does not fire the same visit again. The backend applies its own
 * (longer) dedupe window across tabs and reloads.
 */
function alreadySentInThisSession(path: string) {
  try {
    const raw = sessionStorage.getItem(SENT_PATHS_KEY);
    const sent = raw ? (JSON.parse(raw) as string[]) : [];

    if (sent.includes(path)) {
      return true;
    }

    sessionStorage.setItem(SENT_PATHS_KEY, JSON.stringify([...sent, path]));

    return false;
  } catch {
    return false;
  }
}

export async function trackPageView(path: string, sectionSlug?: string) {
  if (typeof window === 'undefined') return;

  if (alreadySentInThisSession(path)) return;

  try {
    await apiClient<void>(endpoints.public.pageViews, {
      method: 'POST',
      body: {
        path,
        sectionSlug: sectionSlug ?? null,
        visitorId: getVisitorId()
      }
    });
  } catch {
    // Analytics is never worth breaking a page over.
  }
}
