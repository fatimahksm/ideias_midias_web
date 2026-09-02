'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {Link} from '@/i18n/navigation';
import {ActionMenu} from '@/components/ui/action-menu';
import {Button} from '@/components/ui/button';
import {formatMediaDate, resolveMediaUrl} from '@/features/media-library/utils';
import type {PortfolioProjectResponse} from '@/features/portfolio-projects/types';
import type {PortfolioProjectMediaResponse} from '../types';
import {PortfolioProjectMediaStatusBadge} from './portfolio-project-media-status-badge';

type Props = {
  item: PortfolioProjectMediaResponse;
  linkedProject?: PortfolioProjectResponse;
  isDeleting: boolean;
  isTogglingStatus: boolean;
  canDelete: boolean;
  onDelete: (item: PortfolioProjectMediaResponse) => void;
  onToggleStatus: (item: PortfolioProjectMediaResponse) => void;
};

export function PortfolioProjectMediaCard({
  item,
  linkedProject,
  isDeleting,
  isTogglingStatus,
  canDelete,
  onDelete,
  onToggleStatus
}: Props) {
  const t = useTranslations('PortfolioProjectMediaManager');
  const common = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();

  const resolvedMediaUrl = resolveMediaUrl(item.mediaUrl);
  const resolvedThumbnailUrl = resolveMediaUrl(item.thumbnailUrl);

  const previewUrl =
    item.mediaType === 'VIDEO'
      ? resolvedThumbnailUrl || resolvedMediaUrl
      : resolvedMediaUrl;

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-56 overflow-hidden bg-slate-100">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={item.altTextEn || item.altTextPt || linkedProject?.titleEn || 'Media'}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-6 text-center">
            <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              {item.mediaType}
            </span>
            <p className="mt-3 line-clamp-2 text-lg font-semibold text-slate-700">
              {linkedProject?.titleEn || t('untitledLinkedProject')}
            </p>
          </div>
        )}

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <PortfolioProjectMediaStatusBadge isActive={item.isActive} />
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {item.mediaType}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-slate-900">
                {item.altTextEn || item.altTextPt || t('untitledMedia')}
              </h3>
              <p className="truncate text-sm text-slate-500">
                {linkedProject?.titleEn || t('untitledLinkedProject')}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-100 px-3 py-2 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {t('sortOrder')}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {item.sortOrder}
              </p>
            </div>
          </div>

          <p className="line-clamp-2 text-sm leading-6 text-slate-600">
            {item.altTextEn || item.altTextPt || t('noAltText')}
          </p>
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-3">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {t('linkedProject')}
            </dt>
            <dd className="mt-1 truncate text-sm text-slate-700">
              {linkedProject?.titleEn || t('unknownProject')}
            </dd>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {t('updatedAt')}
            </dt>
            <dd className="mt-1 text-sm text-slate-700">
              {formatMediaDate(item.updatedAt, locale)}
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/admin/portfolio-projects/${item.projectId}/media/${item.id}/edit`} className="grow sm:grow-0">
            <Button type="button" className="w-full sm:w-auto">
              {common('edit')}
            </Button>
          </Link>

          <ActionMenu
            label={common('moreActions')}
            items={[
              {
                key: 'open-project',
                label: t('openProject'),
                onSelect: () =>
                  router.push(
                    `/${locale}/admin/portfolio-projects/${item.projectId}/edit`
                  )
              },
              {
                key: 'toggle',
                label: isTogglingStatus
                  ? common('loading')
                  : item.isActive
                    ? t('deactivate')
                    : t('activate'),
                disabled: isTogglingStatus,
                onSelect: () => onToggleStatus(item)
              },
              ...(canDelete
                ? [
                    {
                      key: 'delete',
                      label: isDeleting ? common('loading') : common('delete'),
                      tone: 'danger' as const,
                      disabled: isDeleting,
                      onSelect: () => onDelete(item)
                    }
                  ]
                : [])
            ]}
          />
        </div>
      </div>
    </article>
  );
}