'use client';

import {useTranslations} from 'next-intl';
import type {SectionResponse} from '@/features/sections/types';
import type {CategoryFormValues} from '../schema';

type Props = {
  values: CategoryFormValues;
  linkedSection?: SectionResponse;
};

export function CategoryFormSidebar({values, linkedSection}: Props) {
  const t = useTranslations('CategoryForm');

  return (
    <div className="space-y-5 xl:sticky xl:top-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
              values.isActive
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-slate-100 text-slate-700'
            }`}
          >
            {values.isActive ? t('statusActive') : t('statusInactive')}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-slate-900">
          {values.nameEn || t('untitledCategory')}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {values.namePt || t('untitledCategoryPt')}
        </p>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {t('linkedSectionLabel')}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {linkedSection?.nameEn || t('noSectionLinked')}
          </p>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {t('sidebarSortOrder')}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {values.sortOrder}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">
            {t('categoryPreviewTitle')}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {t('categoryPreviewDescription')}
          </p>
        </div>

        <div className="p-5">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="truncate text-base font-semibold text-slate-900">
                    {values.nameEn || t('untitledCategory')}
                  </h4>
                  <p className="mt-1 truncate text-sm text-slate-500">
                    {values.namePt || t('untitledCategoryPt')}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    values.isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {values.isActive ? t('statusActive') : t('statusInactive')}
                </span>
              </div>

              <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                {values.descriptionEn ||
                  values.descriptionPt ||
                  t('noDescriptionYet')}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  {linkedSection?.nameEn || t('noSectionLinked')}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  #{values.sortOrder}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}