import {HttpError} from './http-error';
import type {ApiErrorResponse, ApiResponse, AppError} from '@/types/api';
import {endpoints} from './endpoints';
import {clearAdminSession, getAdminToken, setAdminToken} from '@/lib/auth/token';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  token?: unknown;
  skipAuthRefresh?: boolean;
  /**
   * Seconds this response may be reused by Next's server-side fetch cache.
   * Set it on public reads: without it every visitor costs a fresh round trip
   * to the backend for content that changes only when the owner edits it.
   * Ignored in the browser, and never used for anything authenticated.
   */
  revalidate?: number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

let refreshPromise: Promise<string | null> | null = null;

function buildUrl(path: string) {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured.');
  }

  const base = API_BASE_URL.endsWith('/')
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${base}${cleanPath}`;
}

function buildAuthorizationHeader(token: unknown) {
  if (typeof token !== 'string') return undefined;

  const trimmed = token.trim();

  if (
    !trimmed ||
    trimmed === 'undefined' ||
    trimmed === 'null' ||
    trimmed === '[object Object]'
  ) {
    return undefined;
  }

  return trimmed.startsWith('Bearer ') ? trimmed : `Bearer ${trimmed}`;
}

function clearAdminSessionClientSide() {
  if (typeof window === 'undefined') return;
  clearAdminSession();
}

function redirectToAdminLoginIfNeeded() {
  if (typeof window === 'undefined') return;

  const {pathname} = window.location;

  if (!pathname.includes('/admin')) {
    return;
  }

  if (pathname.includes('/admin/login')) {
    return;
  }

  const segments = pathname.split('/').filter(Boolean);

  let loginPath = '/admin/login';

  if (segments.length >= 2 && segments[1] === 'admin') {
    loginPath = `/${segments[0]}/admin/login`;
  } else if (segments.length >= 1 && segments[0] === 'admin') {
    loginPath = '/admin/login';
  }

  window.location.replace(loginPath);
}

function handleAuthFailure(status: number) {
  if (typeof window === 'undefined') return;

  if (status === 401 || status === 403) {
    clearAdminSessionClientSide();
    redirectToAdminLoginIfNeeded();
  }
}

function isAdminApiPath(path: string) {
  return path.startsWith('/api/admin/');
}

function isAuthPath(path: string) {
  return (
    path === endpoints.auth.adminLogin ||
    path === endpoints.auth.adminRefresh ||
    path === endpoints.auth.adminLogout
  );
}

export function toAppError(error: unknown): AppError {
  if (error instanceof HttpError) {
    return {
      message: error.message,
      status: error.status,
      code: error.code,
      errors: error.errors,
      raw: error.raw
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      raw: error
    };
  }

  return {
    message: 'Something went wrong.',
    raw: error
  };
}

async function safeParseJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!isJson) {
    if (!response.ok) {
      throw new HttpError({
        message: `Request failed with status ${response.status}`,
        status: response.status
      });
    }

    return undefined as T;
  }

  const payload = (await safeParseJson(response)) as ApiResponse<T> | T | null;

  if (!response.ok) {
    const err = (payload || {}) as ApiErrorResponse;

    throw new HttpError({
      message: err.message || `Request failed with status ${response.status}`,
      status: err.status ?? response.status,
      code: err.code,
      errors: err.errors,
      raw: payload
    });
  }

  if (payload && typeof payload === 'object' && 'success' in payload) {
    const apiPayload = payload as ApiResponse<T>;

    if (apiPayload.success === false) {
      throw new HttpError({
        message: apiPayload.message || 'Request failed.',
        status: apiPayload.status ?? response.status,
        code: apiPayload.code,
        errors: apiPayload.errors,
        raw: payload
      });
    }

    return (apiPayload.data ?? payload) as T;
  }

  return payload as T;
}

async function refreshAdminAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(buildUrl(endpoints.auth.adminRefresh), {
          method: 'POST',
          headers: {
            Accept: 'application/json'
          },
          credentials: 'include',
          cache: 'no-store'
        });

        const payload = await parseResponse<{token: string}>(response);
        const newToken = payload?.token ?? null;

        if (newToken) {
          setAdminToken(newToken);
          return newToken;
        }

        clearAdminSessionClientSide();
        return null;
      } catch {
        clearAdminSessionClientSide();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

async function executeRequest<T>(
  path: string,
  options: RequestOptions
): Promise<T> {
  const {body, headers, token, revalidate, ...rest} = options;
  const authorizationHeader = buildAuthorizationHeader(token);

  const response = await fetch(buildUrl(path), {
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? {'Content-Type': 'application/json'} : {}),
      ...(authorizationHeader ? {Authorization: authorizationHeader} : {}),
      ...headers
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: rest.credentials ?? 'include',
    ...(revalidate !== undefined && revalidate > 0
      ? {next: {revalidate}}
      : {cache: 'no-store' as const})
  });

  return parseResponse<T>(response);
}

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  try {
    return await executeRequest<T>(path, options);
  } catch (error) {
    const appError = toAppError(error);
    const shouldTryRefresh =
      typeof window !== 'undefined' &&
      !options.skipAuthRefresh &&
      isAdminApiPath(path) &&
      !isAuthPath(path) &&
      (appError.status === 401 || appError.status === 403);

    if (!shouldTryRefresh) {
      if (appError.status === 401 || appError.status === 403) {
        handleAuthFailure(appError.status);
      }

      throw error;
    }

    const refreshedToken = await refreshAdminAccessToken();

    if (!refreshedToken) {
      handleAuthFailure(401);
      throw error;
    }

    return executeRequest<T>(path, {
      ...options,
      token: refreshedToken,
      skipAuthRefresh: true
    });
  }
}