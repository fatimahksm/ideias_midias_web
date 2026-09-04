import {MediaLibraryItem} from './types';
import {resolveMediaUrl as resolveSharedMediaUrl} from '@/lib/media/resolve-media-url';

export function resolveMediaUrl(url?: string | null) {
  const resolved = resolveSharedMediaUrl(url);
  return resolved || null;
}

export function formatMediaDate(value?: string, locale: string = 'en') {
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