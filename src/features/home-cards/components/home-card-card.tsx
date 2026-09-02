'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {Link} from '@/i18n/navigation';
import {ActionMenu} from '@/components/ui/action-menu';
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
};

export function HomeCardCard({
  item,
  linkedSection,
  canDelete,
  isDeleting,
  onDelete
}: Props) {
  const t = useTranslations('HomeCardsManager');
  const formT = useTranslations('HomeCardForm');
  const common = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();

  const imageUrl = resolveMediaUrl(item.imageUrl);
  const selectedIcon = getHomeCardIconOption(item.iconName);
  const SelectedIconComponent = selectedIcon?.icon;

  return (
    <article className="rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-56 overflow-hidden rounded-t-[28px] bg-slate-100">
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

        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/admin/home-cards/${item.id}/edit`} className="grow sm:grow-0">
            <Button type="button" className="w-full sm:w-auto">
              {common('edit')}
            </Button>
          </Link>

          <ActionMenu
            label={common('moreActions')}
            items={[
              ...(linkedSection
                ? [
                    {
                      key: 'open-section',
                      label: t('openSection'),
                      onSelect: () =>
                        router.push(
                          `/${locale}/admin/sections/${linkedSection.id}/edit`
                        )
                    }
                  ]
                : []),
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