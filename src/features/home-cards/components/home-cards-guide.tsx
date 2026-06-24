'use client';

import {useTranslations} from 'next-intl';
import {CollapsibleGuide} from '@/components/common/collapsible-guide';

/**
 * Explains what homepage cards are and how they relate to sections, so owners
 * stop confusing "the homepage" with "the section content". Steps reference the
 * real "Create card" button of the manager below.
 */
export function HomeCardsGuide() {
  const t = useTranslations('HomeCardsGuide');

  return (
    <CollapsibleGuide
      storageKey="admin:home-cards-guide:collapsed"
      title={t('title')}
      intro={t('intro')}
      steps={t.raw('steps') as string[]}
      hideHint={t('hideHint')}
    />
  );
}
