import type {SectionCategoryResponse} from './types';

export function emptyToNull(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function getNextCategorySortOrder(
  items: SectionCategoryResponse[],
  sectionId?: number
) {
  const scoped = sectionId
    ? items.filter((item) => item.sectionId === sectionId)
    : items;

  if (scoped.length === 0) return 1;

  return Math.max(...scoped.map((item) => item.sortOrder || 0)) + 1;
}