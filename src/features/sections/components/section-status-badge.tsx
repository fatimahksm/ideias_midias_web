'use client';

import {useTranslations} from 'next-intl';

export function SectionStatusBadge({isActive}: {isActive: boolean}) {
  const t = useTranslations('SectionsCommon');

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
        isActive
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-slate-200 bg-slate-100 text-slate-700'
      }`}
    >
      {isActive ? t('status.active') : t('status.inactive')}
    </span>
  );
}