import {HttpError} from './http-error';
import type {ApiErrorResponse, ApiResponse, AppError} from '@/types/api';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  token?: unknown;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

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

  try {
    localStorage.removeItem('admin_token');
  } catch {
    // ignore
  }
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

  // expected:
  // /en/admin
  // /pt/admin
  // fallback: /admin
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

  if (!response.ok) {
    handleAuthFailure(response.status);
  }

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
      if (apiPayload.status === 401 || apiPayload.status === 403) {
        handleAuthFailure(apiPayload.status);
      }

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

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {body, headers, token, ...rest} = options;
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
    cache: 'no-store'
  });

  return parseResponse<T>(response);
}