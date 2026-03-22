'use client';

import {useTranslations} from 'next-intl';
import type {ContactMethodType} from '../types';

const toneMap: Record<ContactMethodType, string> = {
  PHONE: 'border-blue-200 bg-blue-50 text-blue-700',
  WHATSAPP: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  EMAIL: 'border-violet-200 bg-violet-50 text-violet-700',
  SOCIAL: 'border-amber-200 bg-amber-50 text-amber-700'
};

export function ContactMethodTypeBadge({
  type
}: {
  type: ContactMethodType;
}) {
  const t = useTranslations('ContactMethodsCommon');

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${toneMap[type]}`}
    >
      {t(`types.${type}.label`)}
    </span>
  );
}