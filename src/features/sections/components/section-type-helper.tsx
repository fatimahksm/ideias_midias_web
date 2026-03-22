'use client';

import {useTranslations} from 'next-intl';
import type {SectionType} from '../types';
import {SectionTypeBadge} from './section-type-badge';

export function SectionTypeHelper({type}: {type: SectionType}) {
  const t = useTranslations('SectionsCommon');

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <SectionTypeBadge type={type} />
        <p className="text-sm font-semibold text-slate-900">
          {t(`types.${type}.studioTitle`)}
        </p>
      </div>

      <p className="text-sm leading-6 text-slate-600">
        {t(`types.${type}.description`)}
      </p>

      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        <li>• {t(`types.${type}.nextOne`)}</li>
        <li>• {t(`types.${type}.nextTwo`)}</li>
      </ul>
    </div>
  );
}