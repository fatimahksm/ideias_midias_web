'use client';

import {useEffect, useMemo, useState} from 'react';
import {useDebouncedValue} from '@/hooks/use-debounced-value';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/confirm-dialog';
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
import {deleteItem, getItemStats, getItemsPage, updateItem} from '../api';
import type {SectionItemPayload, SectionItemResponse} from '../types';
import {emptyToNull} from '../utils';
import {ItemCard} from './item-card';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';
type FeaturedFilter = 'ALL' | 'FEATURED' | 'REGULAR';
type SortBy = 'sortOrder' | 'titleEn' | 'updatedAt';

type Props = {
  sectionId?: number;
  categoryId?: number;
  initialSectionId?: number;
  initialCategoryId?: number;
  compact?: boolean;
  forceDirectMode?: boolean;
};

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

export default function ItemsManager({
  sectionId,
  categoryId,
  initialSectionId,
  initialCategoryId,
  compact = false,
  forceDirectMode = false
}: Props) {
  const t = useTranslations('ItemsManager');
  const common = useTranslations('Common');
  const errorT = useTranslations('CommonErrors');
  const queryClient = useQueryClient();

  const isSectionScoped = typeof sectionId === 'number';
  const isCategoryScoped = typeof categoryId === 'number';

  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState(
    isSectionScoped
      ? String(sectionId)
      : initialSectionId
        ? String(initialSectionId)
        : 'ALL'
  );
  const [categoryFilter, setCategoryFilter] = useState(
    isCategoryScoped
      ? String(categoryId)
      : initialCategoryId
        ? String(initialCategoryId)
        : 'ALL'
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [featuredFilter, setFeaturedFilter] =
    useState<FeaturedFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('sortOrder');
  const [feedback, setFeedback] = useState('');
  const [feedbackTone, setFeedbackTone] = useState<'success' | 'error'>(
    'success'
  );
  const [deleteTarget, setDeleteTarget] =
    useState<SectionItemResponse | null>(null);

  useEffect(() => {
    if (isSectionScoped && sectionId) {
      setSectionFilter(String(sectionId));
    }
  }, [isSectionScoped, sectionId]);

  useEffect(() => {
    if (isCategoryScoped && categoryId) {
      setCategoryFilter(String(categoryId));
    }
  }, [isCategoryScoped, categoryId]);

  const sessionQuery = useAdminSession(hasAdminToken());

  const sectionsQuery = useQuery({
    queryKey: ['sections', 'all'],
    queryFn: getAllSections
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: getAllCategories
  });

  // Filters and sorting run in the database now, so the screen can ask for
  // one page at a time without a filter silently missing rows.
  const debouncedSearch = useDebouncedValue(search);

  const effectiveSectionId = isSectionScoped
    ? sectionId
    : sectionFilter === 'ALL'
      ? null
      : Number(sectionFilter);

  const effectiveCategoryId = isCategoryScoped
    ? categoryId
    : categoryFilter === 'ALL'
      ? null
      : Number(categoryFilter);

  const featuredParam =
    featuredFilter === 'ALL' ? null : featuredFilter === 'FEATURED';

  const sortParam = sortBy === 'titleEn' ? 'title' : sortBy;

  const statsQuery = useQuery({
    queryKey: ['items', 'stats', effectiveSectionId, effectiveCategoryId],
    queryFn: () => getItemStats(effectiveSectionId, effectiveCategoryId)
  });

  const itemsQuery = useInfiniteQuery({
    queryKey: [
      'items',
      'page',
      effectiveSectionId,
      effectiveCategoryId,
      statusFilter,
      featuredFilter,
      debouncedSearch,
      sortBy
    ],
    initialPageParam: 0,
    queryFn: ({pageParam}) =>
      getItemsPage({
        sectionId: effectiveSectionId,
        categoryId: effectiveCategoryId,
        status: statusFilter,
        featured: featuredParam,
        search: debouncedSearch,
        sort: sortParam,
        page: pageParam
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined
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

  const selectedSection = useMemo(
    () => itemSections.find((section) => section.id === Number(sectionFilter)),
    [itemSections, sectionFilter]
  );

  const filteredCategories = useMemo(() => {
    const all = categoriesQuery.data ?? [];

    if (isSectionScoped && sectionId) {
      return all
        .filter((category) => category.sectionId === sectionId)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    }

    if (sectionFilter === 'ALL') {
      return all.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    }

    return all
      .filter((category) => String(category.sectionId) === sectionFilter)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
  }, [categoriesQuery.data, isSectionScoped, sectionId, sectionFilter]);

  const selectedCategory = useMemo(
    () =>
      filteredCategories.find(
        (category) => category.id === Number(categoryFilter)
      ),
    [filteredCategories, categoryFilter]
  );

  const isDirectMode =
    forceDirectMode || selectedSection?.sectionType === 'DIRECT_ITEMS';

  const canDelete = sessionQuery.data?.role === 'SUPER_ADMIN';

  const items = useMemo(
    () => itemsQuery.data?.pages.flatMap((page) => page.content) ?? [],
    [itemsQuery.data]
  );

  const totalItems = itemsQuery.data?.pages[0]?.totalElements ?? items.length;

  function getLinkedSection(
    item: SectionItemResponse
  ): SectionResponse | undefined {
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

  function handleDelete(item: SectionItemResponse) {
    setDeleteTarget(item);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setFeedback('');
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  async function handleToggleStatus(item: SectionItemResponse) {
    setFeedback('');
    await toggleStatusMutation.mutateAsync(item);
  }

  const createHref =
    selectedSection && !isDirectMode
      ? `/admin/items/new?sectionId=${selectedSection.id}${selectedCategory ? `&categoryId=${selectedCategory.id}` : ''}`
      : selectedSection
        ? `/admin/items/new?sectionId=${selectedSection.id}`
        : '/admin/items/new';

  return (
    <div className="space-y-6">
      {!compact ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label={t('stats.total')} value={statsQuery.data?.total ?? 0} />
          <StatCard
            label={t('stats.active')}
            value={statsQuery.data?.active ?? 0}
            tone="emerald"
          />
          <StatCard
            label={t('stats.featured')}
            value={statsQuery.data?.featured ?? 0}
            tone="amber"
          />
          <StatCard
            label={t('stats.linkedSections')}
            value={isSectionScoped ? 1 : itemSections.length}
            tone="blue"
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {t('studioTitle')}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {selectedCategory
              ? `${t('linkedCategory')}: ${selectedCategory.nameEn}`
              : selectedSection
                ? `${t('linkedSection')}: ${selectedSection.nameEn}`
                : t('studioSubtitle')}
          </p>
        </div>

        <Link href={createHref}>
          <Button type="button">{t('createItem')}</Button>
        </Link>
      </div>

      <div
        className={`grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ${
          isSectionScoped
            ? isDirectMode
              ? 'lg:grid-cols-4'
              : 'lg:grid-cols-5'
            : 'lg:grid-cols-5'
        }`}
      >
        <Input
          id="itemSearch"
          label={t('searchLabel')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('searchPlaceholder')}
        />

        {!isSectionScoped ? (
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
        ) : null}

        {!isDirectMode && !isCategoryScoped ? (
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
        ) : null}

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

      {itemsQuery.isPending ||
      sectionsQuery.isPending ||
      categoriesQuery.isPending ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">{common('loading')}</p>
        </div>
      ) : itemsQuery.isError ||
        sectionsQuery.isError ||
        categoriesQuery.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm text-red-700">
            {getErrorMessage(
              toAppError(
                itemsQuery.error || sectionsQuery.error || categoriesQuery.error
              ),
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

      {itemsQuery.hasNextPage ? (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-slate-500">
            {t('showingCount', {shown: items.length, total: totalItems})}
          </p>

          <Button
            type="button"
            variant="outline"
            isLoading={itemsQuery.isFetchingNextPage}
            loadingText={common('loading')}
            onClick={() => itemsQuery.fetchNextPage()}
          >
            {t('loadMore')}
          </Button>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('deleteDialogTitle')}
        description={
          deleteTarget ? t('deleteConfirm', {name: deleteTarget.titleEn}) : ''
        }
        confirmLabel={t('deleteAction')}
        cancelLabel={common('cancel')}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
        tone="danger"
      />
    </div>
  );
}