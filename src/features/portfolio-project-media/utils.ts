import type {PortfolioProjectMediaResponse} from './types';

export function emptyToNull(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function getNextPortfolioProjectMediaSortOrder(
  items: PortfolioProjectMediaResponse[],
  projectId?: number
) {
  const scoped = projectId
    ? items.filter((item) => item.projectId === projectId)
    : items;

  if (scoped.length === 0) return 1;

  return Math.max(...scoped.map((item) => item.sortOrder || 0)) + 1;
}