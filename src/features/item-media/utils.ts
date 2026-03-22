import type {SectionItemMediaResponse} from './types';

export function emptyToNull(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function getNextItemMediaSortOrder(
  items: SectionItemMediaResponse[],
  itemId?: number
) {
  const scoped = itemId
    ? items.filter((item) => item.itemId === itemId)
    : items;

  if (scoped.length === 0) return 1;

  return Math.max(...scoped.map((item) => item.sortOrder || 0)) + 1;
}