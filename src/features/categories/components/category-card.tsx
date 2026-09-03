'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {Link} from '@/i18n/navigation';
import {ActionMenu} from '@/components/ui/action-menu';
import {Button} from '@/components/ui/button';
import {formatMediaDate} from '@/features/media-library/utils';
import type {SectionResponse} from '@/features/sections/types';
import type {SectionCategoryResponse} from '../types';
import {CategoryStatusBadge} from './category-status-badge';

type Props = {
  item: SectionCategoryResponse;
  linkedSection?: SectionResponse;
  canDelete: boolean;
  isDeleting: boolean;
  isTogglingStatus: boolean;
  onDelete: (item: SectionCategoryResponse) => void;
  onToggleStatus: (item: SectionCategoryResponse) => void;
};

export function CategoryCard({
  item,
  linkedSection,
  canDelete,
  isDeleting,
  isTogglingStatus,
  onDelete,
  onToggleStatus
}: Props) {
  const t = useTranslations('CategoriesManager');
  const common = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();

  const manageItemsHref = `/admin/items?sectionId=${item.sectionId}&categoryId=${item.id}`;
  const createItemHref = `/admin/items/new?sectionId=${item.sectionId}&categoryId=${item.id}`;

  return (
    <article className="rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-center gap-2">
              <CategoryStatusBadge isActive={item.isActive} />
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {t('sortOrder')} #{item.sortOrder}
              </span>
            </div>

            <h3 className="truncate text-lg font-semibold text-slate-900">
              {item.nameEn}
            </h3>
            <p className="mt-1 truncate text-sm text-slate-500">{item.namePt}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="line-clamp-4 text-sm leading-6 text-slate-600">
            {item.descriptionEn || item.descriptionPt || t('noDescription')}
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

        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/admin/categories/${item.id}/edit`} className="grow sm:grow-0">
            <Button type="button" className="w-full sm:w-auto">
              {common('edit')}
            </Button>
          </Link>

          <ActionMenu
            label={common('moreActions')}
            items={[
              {
                key: 'manage-items',
                label: t('manageItems'),
                onSelect: () => router.push(`/${locale}${manageItemsHref}`)
              },
              {
                key: 'add-item',
                label: t('addItem'),
                onSelect: () => router.push(`/${locale}${createItemHref}`)
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