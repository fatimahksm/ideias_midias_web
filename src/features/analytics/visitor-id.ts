const VISITOR_ID_KEY = 'visitor_id';

function generateVisitorId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * A random id this browser keeps for itself, so the dashboard can tell "the
 * same person came back" from "a new visitor". It holds no personal data and
 * is never sent anywhere except to our own page-view endpoint.
 *
 * Returns null when storage is unavailable (private mode, blocked cookies);
 * the visit is still recorded, just without a stable identity.
 */
export function getVisitorId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(VISITOR_ID_KEY);

    if (stored && stored.trim()) {
      return stored.trim();
    }

    const created = generateVisitorId();
    localStorage.setItem(VISITOR_ID_KEY, created);

    return created;
  } catch {
    return null;
  }
}
