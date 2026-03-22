import type {SectionItemResponse} from './types';

export function emptyToNull(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function getNextItemSortOrder(
  items: SectionItemResponse[],
  sectionId?: number
) {
  const scoped = sectionId
    ? items.filter((item) => item.sectionId === sectionId)
    : items;

  if (scoped.length === 0) return 1;

  return Math.max(...scoped.map((item) => item.sortOrder || 0)) + 1;
}