'use client';

import {useTranslations} from 'next-intl';
import {CollapsibleGuide} from '@/components/common/collapsible-guide';
import type {SectionType} from '../types';

type Props = {
  sectionType: SectionType;
};

/**
 * Section-specific "how do I add content here?" guide. Picks the copy for the
 * section type and renders it with the shared CollapsibleGuide. Steps reference
 * the real button labels (Create block, Create item, ...) of the manager
 * embedded right below.
 */
export function SectionGuide({sectionType}: Props) {
  const t = useTranslations('SectionGuide');

  return (
    <CollapsibleGuide
      storageKey="admin:section-guide:collapsed"
      title={t(`${sectionType}.title`)}
      intro={t(`${sectionType}.intro`)}
      steps={t.raw(`${sectionType}.steps`) as string[]}
      hideHint={t('hideHint')}
    />
  );
}
