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

  const backendMessage = error.message?.trim();

  if (error.status === 401) {
    return backendMessage || t('unauthorized');
  }

  if (error.status === 403) {
    return backendMessage || t('forbidden');
  }

  if (error.status === 404) {
    return backendMessage || t('notFound');
  }

  if (error.errors && Object.keys(error.errors).length > 0) {
    return backendMessage || t('validationError');
  }

  const normalizedMessage = backendMessage?.toLowerCase() || '';

  if (
    normalizedMessage.includes('failed to fetch') ||
    normalizedMessage.includes('network') ||
    normalizedMessage.includes('load failed')
  ) {
    return t('networkError');
  }

  return backendMessage || t('unknownError');
}