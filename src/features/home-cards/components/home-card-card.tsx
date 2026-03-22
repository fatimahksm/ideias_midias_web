'use client';

import {useLocale, useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import {resolveMediaUrl, formatMediaDate} from '@/features/media-library/utils';
import type {HomeCardResponse} from '../types';
import type {SectionResponse} from '@/features/sections/types';

type Props = {
  item: HomeCardResponse;
  linkedSection?: SectionResponse;
  canDelete: boolean;
  isDeleting: boolean;
  onDelete: (item: HomeCardResponse) => void;
};

export function HomeCardCard({
  item,
  linkedSection,
  canDelete,
  isDeleting,
  onDelete
}: Props) {
  const t = useTranslations('HomeCardsManager');
  const common = useTranslations('Common');
  const locale = useLocale();

  const imageUrl = resolveMediaUrl(item.imageUrl);

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
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
              item.isActive
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-slate-100 text-slate-700'
            }`}
          >
            {item.isActive ? t('statusActive') : t('statusInactive')}
          </span>
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
            {item.shortDescriptionEn || item.shortDescriptionPt || t('noDescription')}
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

        {item.iconName ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {t('iconNameLabel')}
            </p>
            <p className="text-sm font-medium text-slate-800">{item.iconName}</p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/home-cards/${item.id}/edit`}>
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