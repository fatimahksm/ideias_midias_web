'use client';

import {useLocale, useTranslations} from 'next-intl';
import {ChevronDown, ChevronUp} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import {resolveMediaUrl, formatMediaDate} from '@/features/media-library/utils';
import type {HomeCardResponse} from '../types';
import type {SectionResponse} from '@/features/sections/types';
import {getHomeCardIconOption} from '../home-card-icon-options';

type Props = {
  item: HomeCardResponse;
  linkedSection?: SectionResponse;
  canDelete: boolean;
  isDeleting: boolean;
  onDelete: (item: HomeCardResponse) => void;
  /** Reorder controls — only provided when the list is in manual-order mode. */
  onMoveUp?: (item: HomeCardResponse) => void;
  onMoveDown?: (item: HomeCardResponse) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  isReordering?: boolean;
};

export function HomeCardCard({
  item,
  linkedSection,
  canDelete,
  isDeleting,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  isReordering = false
}: Props) {
  const t = useTranslations('HomeCardsManager');
  const formT = useTranslations('HomeCardForm');
  const common = useTranslations('Common');
  const locale = useLocale();

  const imageUrl = resolveMediaUrl(item.imageUrl);
  const selectedIcon = getHomeCardIconOption(item.iconName);
  const SelectedIconComponent = selectedIcon?.icon;

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
              {t('updatedAt')}
            </dt>
            <dd className="mt-1 text-sm text-slate-700">
              {formatMediaDate(item.updatedAt, locale)}
            </dd>
          </div>
        </dl>

        {selectedIcon ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {t('iconNameLabel')}
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
              {SelectedIconComponent ? <SelectedIconComponent size={16} /> : null}
              <span>{formT(selectedIcon.labelKey as never)}</span>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {onMoveUp && onMoveDown ? (
            <div className="inline-flex overflow-hidden rounded-lg border border-slate-200">
              <button
                type="button"
                aria-label={t('moveUp')}
                title={t('moveUp')}
                disabled={!canMoveUp || isReordering}
                onClick={() => onMoveUp(item)}
                className="flex h-9 w-9 items-center justify-center text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <span className="w-px self-stretch bg-slate-200" />
              <button
                type="button"
                aria-label={t('moveDown')}
                title={t('moveDown')}
                disabled={!canMoveDown || isReordering}
                onClick={() => onMoveDown(item)}
                className="flex h-9 w-9 items-center justify-center text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          ) : null}

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