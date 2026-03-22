'use client';

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import type {SectionType} from '../types';

type Props = {
  sectionId?: number;
  sectionType: SectionType;
  isVisible: boolean;
};

export function SectionNextActions({
  sectionId,
  sectionType,
  isVisible
}: Props) {
  const t = useTranslations('SectionNextActions');

  if (!isVisible || !sectionId) {
    return null;
  }

  const content = {
    CONTENT: {
      title: t('CONTENT.title'),
      description: t('CONTENT.description'),
      primaryLabel: t('CONTENT.primaryLabel'),
      primaryHref: `/admin/sections/${sectionId}/edit`
    },
    CATEGORY_ITEMS: {
      title: t('CATEGORY_ITEMS.title'),
      description: t('CATEGORY_ITEMS.description'),
      primaryLabel: t('CATEGORY_ITEMS.primaryLabel'),
      primaryHref: `/admin/sections/${sectionId}/edit`
    },
    DIRECT_ITEMS: {
      title: t('DIRECT_ITEMS.title'),
      description: t('DIRECT_ITEMS.description'),
      primaryLabel: t('DIRECT_ITEMS.primaryLabel'),
      primaryHref: `/admin/sections/${sectionId}/edit`
    },
    PORTFOLIO: {
      title: t('PORTFOLIO.title'),
      description: t('PORTFOLIO.description'),
      primaryLabel: t('PORTFOLIO.primaryLabel'),
      primaryHref: `/admin/sections/${sectionId}/edit`
    }
  }[sectionType];

  return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
      <p className="text-sm font-semibold text-emerald-800">{content.title}</p>
      <p className="mt-2 text-sm leading-6 text-emerald-700">
        {content.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={content.primaryHref}>
          <Button type="button" size="sm">
            {content.primaryLabel}
          </Button>
        </Link>

        <Link href="/admin/sections">
          <Button type="button" variant="outline" size="sm">
            {t('backToStudio')}
          </Button>
        </Link>
      </div>
    </div>
  );
}