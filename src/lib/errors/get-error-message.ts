import type {AppError} from '@/types/api';

type ErrorTranslationKey =
  | 'networkError'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'validationError'
  | 'unknownError';

type TranslateFn = (key: ErrorTranslationKey) => string;

export function getErrorMessage(error: AppError | null, t: TranslateFn) {
  if (!error) return t('unknownError');

  if (error.status === 401) return t('unauthorized');
  if (error.status === 403) return t('forbidden');
  if (error.status === 404) return t('notFound');

  if (error.errors && Object.keys(error.errors).length > 0) {
    return error.message || t('validationError');
  }

  const normalizedMessage = error.message?.toLowerCase() || '';

  if (
    normalizedMessage.includes('failed to fetch') ||
    normalizedMessage.includes('network') ||
    normalizedMessage.includes('load failed')
  ) {
    return t('networkError');
  }

  return error.message || t('unknownError');
}