'use client';

import {useTranslations} from 'next-intl';

type Props = {
  isActive: boolean;
};

export function PortfolioProjectStatusBadge({isActive}: Props) {
  const t = useTranslations('PortfolioProjectsManager');

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
        isActive
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-slate-200 bg-slate-100 text-slate-700'
      }`}
    >
      {isActive ? t('statusActive') : t('statusInactive')}
    </span>
  );
}