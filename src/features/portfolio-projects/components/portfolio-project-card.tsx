'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {Link} from '@/i18n/navigation';
import {ActionMenu} from '@/components/ui/action-menu';
import {Button} from '@/components/ui/button';
import {formatMediaDate, resolveMediaUrl} from '@/features/media-library/utils';
import type {SectionResponse} from '@/features/sections/types';
import type {PortfolioProjectResponse} from '../types';
import {PortfolioProjectStatusBadge} from './portfolio-project-status-badge';

type Props = {
  item: PortfolioProjectResponse;
  linkedSection?: SectionResponse;
  isDeleting: boolean;
  isTogglingStatus: boolean;
  canDelete: boolean;
  onDelete: (item: PortfolioProjectResponse) => void;
  onToggleStatus: (item: PortfolioProjectResponse) => void;
};

export function PortfolioProjectCard({
  item,
  linkedSection,
  isDeleting,
  isTogglingStatus,
  canDelete,
  onDelete,
  onToggleStatus
}: Props) {
  const t = useTranslations('PortfolioProjectsManager');
  const common = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();

  const imageUrl = resolveMediaUrl(item.coverImageUrl);

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-56 overflow-hidden bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.titleEn}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-6 text-center">
            <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              {t('cardPreviewBadge')}
            </span>
            <p className="mt-3 line-clamp-2 text-lg font-semibold text-slate-700">
              {item.titleEn}
            </p>
          </div>
        )}

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <PortfolioProjectStatusBadge isActive={item.isActive} />
          {item.isFeatured ? (
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              {t('featured')}
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-slate-900">
                {item.titleEn}
              </h3>
              <p className="truncate text-sm text-slate-500">{item.titlePt}</p>
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

          <p className="line-clamp-3 text-sm leading-6 text-slate-600">
            {item.shortDescriptionEn ||
              item.shortDescriptionPt ||
              t('noDescription')}
          </p>
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-3">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {t('linkedSection')}
            </dt>
            <dd className="mt-1 truncate text-sm text-slate-700">
              {linkedSection?.nameEn || t('unknownSection')}
            </dd>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {t('clientName')}
            </dt>
            <dd className="mt-1 truncate text-sm text-slate-700">
              {item.clientName || t('noClient')}
            </dd>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {t('projectDate')}
            </dt>
            <dd className="mt-1 truncate text-sm text-slate-700">
              {item.projectDate || t('noProjectDate')}
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
          <Link href={`/admin/portfolio-projects/${item.id}/edit`} className="grow sm:grow-0">
            <Button type="button" className="w-full sm:w-auto">
              {common('edit')}
            </Button>
          </Link>

          <ActionMenu
            label={common('moreActions')}
            items={[
              {
                key: 'media',
                label: t('manageMedia'),
                onSelect: () =>
                  router.push(`/${locale}/admin/portfolio-projects/${item.id}/media`)
              },
              ...(linkedSection
                ? [
                    {
                      key: 'section',
                      label: t('openSection'),
                      onSelect: () =>
                        router.push(`/${locale}/admin/sections/${linkedSection.id}`)
                    }
                  ]
                : []),
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