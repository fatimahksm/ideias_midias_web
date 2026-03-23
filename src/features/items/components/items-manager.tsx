'use client';

import {useMemo, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select} from '@/components/ui/select';
import {hasAdminToken} from '@/lib/auth/token';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {useAdminSession} from '@/features/admin-layout/hooks/use-admin-session';
import {getAllSections} from '@/features/sections/api';
import type {SectionResponse} from '@/features/sections/types';
import {getAllCategories} from '@/features/categories/api';
import type {SectionCategoryResponse} from '@/features/categories/types';
import {deleteItem, getAllItems, updateItem} from '../api';
import type {SectionItemPayload, SectionItemResponse} from '../types';
import {emptyToNull} from '../utils';
import {ItemCard} from './item-card';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';
type FeaturedFilter = 'ALL' | 'FEATURED' | 'REGULAR';
type SortBy = 'sortOrder' | 'titleEn' | 'updatedAt';

function StatCard({
  label,
  value,
  tone = 'slate'
}: {
  label: string;
  value: number;
  tone?: 'slate' | 'emerald' | 'blue' | 'amber';
}) {
  const toneClasses: Record<string, string> = {
    slate: 'border-slate-200 bg-white',
    emerald: 'border-emerald-200 bg-emerald-50',
    blue: 'border-blue-200 bg-blue-50',
    amber: 'border-amber-200 bg-amber-50'
  };

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${toneClasses[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

export default function ItemsManager() {
  const t = useTranslations('ItemsManager');
  const common = useTranslations('Common');
  const errorT = useTranslations('CommonErrors');
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [featuredFilter, setFeaturedFilter] =
    useState<FeaturedFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('sortOrder');
  const [feedback, setFeedback] = useState('');
  const [feedbackTone, setFeedbackTone] = useState<'success' | 'error'>(
    'success'
  );

  const sessionQuery = useAdminSession(hasAdminToken());

  const sectionsQuery = useQuery({
    queryKey: ['sections', 'all'],
    queryFn: getAllSections
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: getAllCategories
  });

  const itemsQuery = useQuery({
    queryKey: ['items', 'all'],
    queryFn: getAllItems
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: async () => {
      setFeedbackTone('success');
      setFeedback(t('deleteSuccess'));
      await queryClient.invalidateQueries({queryKey: ['items']});
    },
    onError: (error) => {
      setFeedbackTone('error');
      setFeedback(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (item: SectionItemResponse) => {
    const payload: SectionItemPayload = {
  sectionId: item.sectionId,
  categoryId: item.categoryId ?? null,
  titlePt: item.titlePt,
  titleEn: item.titleEn,
  shortDescriptionPt: emptyToNull(item.shortDescriptionPt),
  shortDescriptionEn: emptyToNull(item.shortDescriptionEn),
  fullDescriptionPt: emptyToNull(item.fullDescriptionPt),
  fullDescriptionEn: emptyToNull(item.fullDescriptionEn),
  coverImageUrl: emptyToNull(item.coverImageUrl),
  videoUrl: emptyToNull(item.videoUrl),
  itemType: emptyToNull(item.itemType),
  specificationsPt: emptyToNull(item.specificationsPt),
  specificationsEn: emptyToNull(item.specificationsEn),
  isFeatured: item.isFeatured,
  isActive: !item.isActive,
  sortOrder: item.sortOrder
};

      return updateItem(item.id, payload);
    },
    onSuccess: async (_, item) => {
      setFeedbackTone('success');
      setFeedback(
        item.isActive ? t('deactivateSuccess') : t('activateSuccess')
      );
      await queryClient.invalidateQueries({queryKey: ['items']});
    },
    onError: (error) => {
      setFeedbackTone('error');
      setFeedback(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  const itemSections = useMemo(
    () =>
      (sectionsQuery.data ?? [])
        .filter(
          (section) =>
            section.sectionType === 'CATEGORY_ITEMS' ||
            section.sectionType === 'DIRECT_ITEMS'
        )
        .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
    [sectionsQuery.data]
  );

  const filteredCategories = useMemo(() => {
    const all = categoriesQuery.data ?? [];

    if (sectionFilter === 'ALL') {
      return all.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    }

    return all
      .filter((category) => String(category.sectionId) === sectionFilter)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
  }, [categoriesQuery.data, sectionFilter]);

  const canDelete = sessionQuery.data?.role === 'SUPER_ADMIN';

  const items = useMemo(() => {
    const base = itemsQuery.data ?? [];
    const searchValue = search.trim().toLowerCase();

    const filtered = base.filter((item) => {
      const matchesSearch =
        !searchValue ||
        item.titleEn.toLowerCase().includes(searchValue) ||
        item.titlePt.toLowerCase().includes(searchValue);

      const matchesSection =
        sectionFilter === 'ALL' || String(item.sectionId) === sectionFilter;

      const matchesCategory =
        categoryFilter === 'ALL' ||
        String(item.categoryId ?? '') === categoryFilter;

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && item.isActive) ||
        (statusFilter === 'INACTIVE' && !item.isActive);

      const matchesFeatured =
        featuredFilter === 'ALL' ||
        (featuredFilter === 'FEATURED' && item.isFeatured) ||
        (featuredFilter === 'REGULAR' && !item.isFeatured);

      return (
        matchesSearch &&
        matchesSection &&
        matchesCategory &&
        matchesStatus &&
        matchesFeatured
      );
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'titleEn') {
        return a.titleEn.localeCompare(b.titleEn);
      }

      if (sortBy === 'updatedAt') {
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return bTime - aTime;
      }

      return a.sortOrder - b.sortOrder || a.id - b.id;
    });
  }, [
    itemsQuery.data,
    search,
    sectionFilter,
    categoryFilter,
    statusFilter,
    featuredFilter,
    sortBy
  ]);

  function getLinkedSection(item: SectionItemResponse): SectionResponse | undefined {
    return itemSections.find((section) => section.id === item.sectionId);
  }

  function getLinkedCategory(
    item: SectionItemResponse
  ): SectionCategoryResponse | undefined {
    if (!item.categoryId) return undefined;
    return (categoriesQuery.data ?? []).find(
      (category) => category.id === item.categoryId
    );
  }

  async function handleDelete(item: SectionItemResponse) {
    const confirmed = window.confirm(t('deleteConfirm', {name: item.titleEn}));
    if (!confirmed) return;

    setFeedback('');
    await deleteMutation.mutateAsync(item.id);
  }

  async function handleToggleStatus(item: SectionItemResponse) {
    setFeedback('');
    await toggleStatusMutation.mutateAsync(item);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('stats.total')} value={(itemsQuery.data ?? []).length} />
        <StatCard
          label={t('stats.active')}
          value={(itemsQuery.data ?? []).filter((item) => item.isActive).length}
          tone="emerald"
        />
        <StatCard
          label={t('stats.featured')}
          value={(itemsQuery.data ?? []).filter((item) => item.isFeatured).length}
          tone="amber"
        />
        <StatCard
          label={t('stats.linkedSections')}
          value={itemSections.length}
          tone="blue"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {t('studioTitle')}
          </p>
          <p className="mt-1 text-sm text-slate-500">{t('studioSubtitle')}</p>
        </div>

        <Link href="/admin/items/new">
          <Button type="button">{t('createItem')}</Button>
        </Link>
      </div>

      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-5">
        <Input
          id="itemSearch"
          label={t('searchLabel')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('searchPlaceholder')}
        />

        <Select
          id="sectionFilter"
          label={t('sectionFilterLabel')}
          value={sectionFilter}
          onChange={(event) => {
            setSectionFilter(event.target.value);
            setCategoryFilter('ALL');
          }}
          options={[
            {value: 'ALL', label: t('allSections')},
            ...itemSections.map((section) => ({
              value: String(section.id),
              label: section.nameEn
            }))
          ]}
        />

        <Select
          id="categoryFilter"
          label={t('categoryFilterLabel')}
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          options={[
            {value: 'ALL', label: t('allCategories')},
            ...filteredCategories.map((category) => ({
              value: String(category.id),
              label: category.nameEn
            }))
          ]}
        />

        <Select
          id="statusFilter"
          label={t('statusFilterLabel')}
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as StatusFilter)
          }
          options={[
            {value: 'ALL', label: t('allStatuses')},
            {value: 'ACTIVE', label: t('statusActive')},
            {value: 'INACTIVE', label: t('statusInactive')}
          ]}
        />

        <Select
          id="featuredFilter"
          label={t('featuredFilterLabel')}
          value={featuredFilter}
          onChange={(event) =>
            setFeaturedFilter(event.target.value as FeaturedFilter)
          }
          options={[
            {value: 'ALL', label: t('allFeaturedStates')},
            {value: 'FEATURED', label: t('featuredOnly')},
            {value: 'REGULAR', label: t('regularOnly')}
          ]}
        />
      </div>

      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-1">
        <Select
          id="sortBy"
          label={t('sortByLabel')}
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as SortBy)}
          options={[
            {value: 'sortOrder', label: t('sortOptions.sortOrder')},
            {value: 'titleEn', label: t('sortOptions.titleEn')},
            {value: 'updatedAt', label: t('sortOptions.updatedAt')}
          ]}
        />
      </div>

      {feedback ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedbackTone === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback}
        </div>
      ) : null}

      {itemsQuery.isPending || sectionsQuery.isPending || categoriesQuery.isPending ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">{common('loading')}</p>
        </div>
      ) : itemsQuery.isError || sectionsQuery.isError || categoriesQuery.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm text-red-700">
            {getErrorMessage(
              toAppError(itemsQuery.error || sectionsQuery.error || categoriesQuery.error),
              (key) => errorT(key)
            )}
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">
            {t('emptyTitle')}
          </p>
          <p className="mt-2 text-sm text-slate-500">{t('emptyDescription')}</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              linkedSection={getLinkedSection(item)}
              linkedCategory={getLinkedCategory(item)}
              canDelete={canDelete}
              isDeleting={
                deleteMutation.isPending && deleteMutation.variables === item.id
              }
              isTogglingStatus={
                toggleStatusMutation.isPending &&
                toggleStatusMutation.variables?.id === item.id
              }
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}