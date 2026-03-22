'use client';

import {useTranslations} from 'next-intl';
import type {SectionType} from '../types';

const toneMap: Record<SectionType, string> = {
  CONTENT: 'border-violet-200 bg-violet-50 text-violet-700',
  CATEGORY_ITEMS: 'border-blue-200 bg-blue-50 text-blue-700',
  DIRECT_ITEMS: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  PORTFOLIO: 'border-amber-200 bg-amber-50 text-amber-700'
};

export function SectionTypeBadge({type}: {type: SectionType}) {
  const t = useTranslations('SectionsCommon');

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${toneMap[type]}`}
    >
      {t(`types.${type}.label`)}
    </span>
  );
}