import {describe, expect, it} from 'vitest';
import {getErrorMessage} from './get-error-message';
import type {AppError} from '@/types/api';

// Identity translator: returns the key so assertions read clearly.
const t = (key: string) => key;

describe('getErrorMessage', () => {
  it('returns unknownError when there is no error', () => {
    expect(getErrorMessage(null, t)).toBe('unknownError');
  });

  it('maps known status codes to fallback keys', () => {
    expect(getErrorMessage({status: 401} as AppError, t)).toBe('unauthorized');
    expect(getErrorMessage({status: 403} as AppError, t)).toBe('forbidden');
    expect(getErrorMessage({status: 404} as AppError, t)).toBe('notFound');
  });

  it('prefers the backend message over the fallback', () => {
    expect(
      getErrorMessage({status: 401, message: 'Token expired'} as AppError, t)
    ).toBe('Token expired');
  });

  it('returns validationError when field errors are present', () => {
    expect(
      getErrorMessage(
        {status: 400, errors: {email: ['required']}} as unknown as AppError,
        t
      )
    ).toBe('validationError');
  });

  it('detects network errors from the message text', () => {
    expect(
      getErrorMessage({message: 'Failed to fetch'} as AppError, t)
    ).toBe('networkError');
  });

  it('falls back to unknownError for unrecognized errors', () => {
    expect(getErrorMessage({} as AppError, t)).toBe('unknownError');
  });
});
