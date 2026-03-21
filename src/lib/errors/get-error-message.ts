import type {AppError} from '@/types/api';

type ErrorTranslationKey =
  | 'networkError'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'validationError'
  | 'unknownError';

type TranslateFn = (key: ErrorTranslationKey) => string;

export function getErrorMessage(error: AppError, t: TranslateFn) {
  if (error.status === 401) return t('unauthorized');
  if (error.status === 403) return t('forbidden');
  if (error.status === 404) return t('notFound');

  if (error.errors && Object.keys(error.errors).length > 0) {
    return error.message || t('validationError');
  }

  if (
    error.message?.toLowerCase().includes('failed to fetch') ||
    error.message?.toLowerCase().includes('network') ||
    error.message?.toLowerCase().includes('load failed')
  ) {
    return t('networkError');
  }

  return error.message || t('unknownError');
}