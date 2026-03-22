'use client';

import {useTranslations} from 'next-intl';
import {Input} from '@/components/ui/input';
import {Select} from '@/components/ui/select';
import type {SectionType} from '../types';

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: 'ALL' | SectionType;
  onTypeFilterChange: (value: 'ALL' | SectionType) => void;
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE';
  onStatusFilterChange: (value: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  sortBy: 'sortOrder' | 'nameEn' | 'updatedAt';
  onSortByChange: (value: 'sortOrder' | 'nameEn' | 'updatedAt') => void;
};

export function SectionListToolbar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange
}: Props) {
  const t = useTranslations('SectionsManager');
  const common = useTranslations('Common');
  const commonSections = useTranslations('SectionsCommon');

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 xl:grid-cols-[1.3fr_repeat(3,minmax(0,0.8fr))]">
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t('searchPlaceholder')}
          label={common('search')}
        />

        <Select
          label={t('typeFilterLabel')}
          value={typeFilter}
          onChange={(event) =>
            onTypeFilterChange(event.target.value as 'ALL' | SectionType)
          }
          options={[
            {value: 'ALL', label: t('allTypes')},
            {value: 'CONTENT', label: commonSections('types.CONTENT.label')},
            {
              value: 'CATEGORY_ITEMS',
              label: commonSections('types.CATEGORY_ITEMS.label')
            },
            {
              value: 'DIRECT_ITEMS',
              label: commonSections('types.DIRECT_ITEMS.label')
            },
            {value: 'PORTFOLIO', label: commonSections('types.PORTFOLIO.label')}
          ]}
        />

        <Select
          label={t('statusFilterLabel')}
          value={statusFilter}
          onChange={(event) =>
            onStatusFilterChange(
              event.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE'
            )
          }
          options={[
            {value: 'ALL', label: t('allStatuses')},
            {value: 'ACTIVE', label: commonSections('status.active')},
            {value: 'INACTIVE', label: commonSections('status.inactive')}
          ]}
        />

        <Select
          label={t('sortByLabel')}
          value={sortBy}
          onChange={(event) =>
            onSortByChange(
              event.target.value as 'sortOrder' | 'nameEn' | 'updatedAt'
            )
          }
          options={[
            {value: 'sortOrder', label: t('sortBySortOrder')},
            {value: 'nameEn', label: t('sortByName')},
            {value: 'updatedAt', label: t('sortByUpdatedAt')}
          ]}
        />
      </div>
    </div>
  );
}