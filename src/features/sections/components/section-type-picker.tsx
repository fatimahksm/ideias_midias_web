'use client';

import {useTranslations} from 'next-intl';
import type {SectionType} from '../types';
import {SectionTypeBadge} from './section-type-badge';

const TYPES: SectionType[] = [
  'CONTENT',
  'CATEGORY_ITEMS',
  'DIRECT_ITEMS',
  'PORTFOLIO'
];

type Props = {
  onSelect: (type: SectionType) => void;
};

export function SectionTypePicker({onSelect}: Props) {
  const t = useTranslations('SectionForm');
  const commonSections = useTranslations('SectionsCommon');

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-bold text-slate-900">{t('pickTypeTitle')}</h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        {t('pickTypeDescription')}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className="group flex flex-col items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50/60 p-5 text-left transition hover:border-[var(--color-primary)] hover:bg-white hover:shadow-md"
          >
            <SectionTypeBadge type={type} />

            <p className="text-base font-semibold text-slate-900">
              {commonSections(`types.${type}.shortMode`)}
            </p>

            <p className="text-sm leading-6 text-slate-600">
              {commonSections(`types.${type}.description`)}
            </p>

            <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)]">
              {t('pickTypeSelect')}
              <span aria-hidden="true" className="transition group-hover:translate-x-0.5">
                &rarr;
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
