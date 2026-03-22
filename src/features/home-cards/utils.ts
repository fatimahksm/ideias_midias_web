import type {HomeCardResponse} from './types';

export function emptyToNull(value?: string | null) {
  if (value == null) return null;

  const trimmed = value.trim();

  return trimmed.length ? trimmed : null;
}

export function getNextHomeCardSortOrder(items: HomeCardResponse[]) {
  if (!items.length) return 1;

  const max = items.reduce((acc, item) => {
    return Math.max(acc, Number(item.sortOrder) || 0);
  }, 0);

  return max + 1;
}