import {MediaLibraryItem} from './types';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  ''
).replace(/\/$/, '');

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function isBlobOrDataUrl(url: string) {
  return url.startsWith('blob:') || url.startsWith('data:');
}

export function resolveMediaUrl(url?: string | null) {
  if (!url) return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  if (isAbsoluteUrl(trimmed) || isBlobOrDataUrl(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return API_BASE_URL ? `${API_BASE_URL}${trimmed}` : trimmed;
  }

  return API_BASE_URL ? `${API_BASE_URL}/${trimmed}` : `/${trimmed}`;
}

export function formatFileSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  const value = bytes / Math.pow(1024, index);

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export function formatMediaDate(
  value?: string,
  locale: string = 'en'
) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat(locale === 'pt' ? 'pt-PT' : 'en', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

export function sortMediaNewestFirst(items: MediaLibraryItem[]) {
  return [...items].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    return bTime - aTime;
  });
}