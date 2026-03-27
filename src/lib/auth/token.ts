const ADMIN_TOKEN_KEY = 'admin_token';

function normalizeStoredToken(token: unknown): string | null {
  if (typeof token !== 'string') {
    return null;
  }

  const trimmed = token.trim();

  if (
    !trimmed ||
    trimmed === 'undefined' ||
    trimmed === 'null' ||
    trimmed === '[object Object]'
  ) {
    return null;
  }

  return trimmed;
}

export function setAdminToken(token: unknown) {
  if (typeof window === 'undefined') return;

  const normalized = normalizeStoredToken(token);

  if (!normalized) {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    return;
  }

  localStorage.setItem(ADMIN_TOKEN_KEY, normalized);
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;

  const value = localStorage.getItem(ADMIN_TOKEN_KEY);
  const normalized = normalizeStoredToken(value);

  if (!normalized) {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    return null;
  }

  return normalized;
}

export function getAdminBearerToken(): string | null {
  const token = getAdminToken();

  if (!token) {
    return null;
  }

  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}

export function removeAdminToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function clearAdminSession() {
  removeAdminToken();
}

export function hasAdminToken() {
  return Boolean(getAdminToken());
}