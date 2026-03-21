const ADMIN_TOKEN_KEY = 'admin_token';

export function setAdminToken(token: unknown) {
  if (typeof window === 'undefined') return;

  if (typeof token !== 'string') {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    return;
  }

  const trimmed = token.trim();

  if (
    !trimmed ||
    trimmed === 'undefined' ||
    trimmed === 'null' ||
    trimmed === '[object Object]'
  ) {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    return;
  }

  localStorage.setItem(ADMIN_TOKEN_KEY, trimmed);
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;

  const value = localStorage.getItem(ADMIN_TOKEN_KEY);

  if (
    !value ||
    value.trim() === '' ||
    value === 'undefined' ||
    value === 'null' ||
    value === '[object Object]'
  ) {
    return null;
  }

  return value;
}

export function removeAdminToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function hasAdminToken() {
  return Boolean(getAdminToken());
}