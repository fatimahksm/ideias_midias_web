'use client';

import {useLocale, useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import {formatMediaDate, resolveMediaUrl} from '@/features/media-library/utils';
import type {SectionResponse} from '@/features/sections/types';
import type {SectionContentBlockResponse} from '../types';
import {ContentBlockStatusBadge} from './content-block-status-badge';

type Props = {
  item: SectionContentBlockResponse;
  linkedSection?: SectionResponse;
  isDeleting: boolean;
  isTogglingStatus: boolean;
  canDelete: boolean;
  onDelete: (item: SectionContentBlockResponse) => void;
  onToggleStatus: (item: SectionContentBlockResponse) => void;
};

export function ContentBlockCard({
  item,
  linkedSection,
  isDeleting,
  isTogglingStatus,
  canDelete,
  onDelete,
  onToggleStatus
}: Props) {
  const t = useTranslations('ContentBlocksManager');
  const common = useTranslations('Common');
  const locale = useLocale();

  const imageUrl = resolveMediaUrl(item.imageUrl);
  const previewTitle = item.titleEn || item.titlePt || t('untitledBlock');
  const previewText =
    item.subtitleEn ||
    item.subtitlePt ||
    item.contentEn ||
    item.contentPt ||
    t('noContent');

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-56 overflow-hidden bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={previewTitle}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-6 text-center">
            <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              {item.blockType}
            </span>
            <p className="mt-3 line-clamp-2 text-lg font-semibold text-slate-700">
              {previewTitle}
            </p>
          </div>
        )}

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <ContentBlockStatusBadge isActive={item.isActive} />
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {t(`types.${item.blockType}` as never)}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-slate-900">
                {previewTitle}
              </h3>
              <p className="truncate text-sm text-slate-500">
                {linkedSection?.nameEn || t('unknownSection')}
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

          <p className="line-clamp-3 text-sm leading-6 text-slate-600">
            {previewText}
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
              {t('updatedAt')}
            </dt>
            <dd className="mt-1 text-sm text-slate-700">
              {formatMediaDate(item.updatedAt, locale)}
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/content-blocks/${item.id}/edit`}>
            <Button type="button" size="sm">
              {common('edit')}
            </Button>
          </Link>

          {linkedSection ? (
            <Link href={`/admin/sections/${linkedSection.id}/edit`}>
              <Button type="button" variant="outline" size="sm">
                {t('openSection')}
              </Button>
            </Link>
          ) : null}

          <Button
            type="button"
            variant="outline"
            size="sm"
            isLoading={isTogglingStatus}
            loadingText={common('loading')}
            onClick={() => onToggleStatus(item)}
          >
            {item.isActive ? t('deactivate') : t('activate')}
          </Button>

          {canDelete ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              loadingText={common('loading')}
              onClick={() => onDelete(item)}
            >
              {common('delete')}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}