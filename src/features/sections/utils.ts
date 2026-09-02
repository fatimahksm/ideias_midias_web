import type {SectionResponse, SectionType} from './types';

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function emptyToNull(value?: string | null) {
  if (value == null) return null;

  const trimmed = value.trim();

  return trimmed.length ? trimmed : null;
}

export function getNextSortOrder(items: SectionResponse[]) {
  if (!items.length) return 1;

  const max = items.reduce((acc, item) => {
    return Math.max(acc, Number(item.sortOrder) || 0);
  }, 0);

  return max + 1;
}

export function getSectionPreviewPath(slug?: string | null) {
  if (!slug) return '/';

  // Must match the public route, app/[locale]/sections/[slug].
  return `/sections/${slug}`;
}

export function countSectionsByType(items: SectionResponse[], type: SectionType) {
  return items.filter((item) => item.sectionType === type).length;
}