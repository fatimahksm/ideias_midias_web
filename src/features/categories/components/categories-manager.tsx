'use client';

import {useEffect, useMemo, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
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
import {deleteCategory, getAllCategories, updateCategory} from '../api';
import type {SectionCategoryPayload, SectionCategoryResponse} from '../types';
import {emptyToNull} from '../utils';
import {CategoryCard} from './category-card';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';
type SortBy = 'sortOrder' | 'nameEn' | 'updatedAt';

type Props = {
  sectionId?: number;
  compact?: boolean;
};

function StatCard({
  label,
  value,
  tone = 'slate'
}: {
  label: string;
  value: number;
  tone?: 'slate' | 'emerald' | 'blue';
}) {
  const toneClasses: Record<string, string> = {
    slate: 'border-slate-200 bg-white',
    emerald: 'border-emerald-200 bg-emerald-50',
    blue: 'border-blue-200 bg-blue-50'
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

export default function CategoriesManager({
  sectionId,
  compact = false
}: Props) {
  const t = useTranslations('CategoriesManager');
  const common = useTranslations('Common');
  const errorT = useTranslations('CommonErrors');
  const queryClient = useQueryClient();

  const isSectionScoped = typeof sectionId === 'number';

  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState(
    isSectionScoped ? String(sectionId) : 'ALL'
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('sortOrder');
  const [feedback, setFeedback] = useState('');
  const [feedbackTone, setFeedbackTone] = useState<'success' | 'error'>(
    'success'
  );
  const [deleteTarget, setDeleteTarget] =
    useState<SectionCategoryResponse | null>(null);

  useEffect(() => {
    if (isSectionScoped && sectionId) {
      setSectionFilter(String(sectionId));
    }
  }, [isSectionScoped, sectionId]);

  const sessionQuery = useAdminSession(hasAdminToken());

  const sectionsQuery = useQuery({
    queryKey: ['sections', 'all'],
    queryFn: getAllSections
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: getAllCategories
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      setFeedbackTone('success');
      setFeedback(t('deleteSuccess'));
      await queryClient.invalidateQueries({queryKey: ['categories']});
    },
    onError: (error) => {
      setFeedbackTone('error');
      setFeedback(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (item: SectionCategoryResponse) => {
      const payload: SectionCategoryPayload = {
        sectionId: item.sectionId,
        namePt: item.namePt,
        nameEn: item.nameEn,
        descriptionPt: emptyToNull(item.descriptionPt),
        descriptionEn: emptyToNull(item.descriptionEn),
        isActive: !item.isActive,
        sortOrder: item.sortOrder
      };

      return updateCategory(item.id, payload);
    },
    onSuccess: async (_, item) => {
      setFeedbackTone('success');
      setFeedback(
        item.isActive ? t('deactivateSuccess') : t('activateSuccess')
      );
      await queryClient.invalidateQueries({queryKey: ['categories']});
    },
    onError: (error) => {
      setFeedbackTone('error');
      setFeedback(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  const categorySections = useMemo(
    () =>
      (sectionsQuery.data ?? [])
        .filter((section) => section.sectionType === 'CATEGORY_ITEMS')
        .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
    [sectionsQuery.data]
  );

  const selectedSection = useMemo(
    () => categorySections.find((section) => section.id === sectionId),
    [categorySections, sectionId]
  );

  const canDelete = sessionQuery.data?.role === 'SUPER_ADMIN';

  const scopedBase = useMemo(() => {
    const all = categoriesQuery.data ?? [];
    if (!isSectionScoped || !sectionId) return all;
    return all.filter((item) => item.sectionId === sectionId);
  }, [categoriesQuery.data, isSectionScoped, sectionId]);

  const items = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    const filtered = scopedBase.filter((item) => {
      const matchesSearch =
        !searchValue ||
        item.nameEn.toLowerCase().includes(searchValue) ||
        item.namePt.toLowerCase().includes(searchValue);

      const matchesSection =
        isSectionScoped ||
        sectionFilter === 'ALL' ||
        String(item.sectionId) === sectionFilter;

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && item.isActive) ||
        (statusFilter === 'INACTIVE' && !item.isActive);

      return matchesSearch && matchesSection && matchesStatus;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'nameEn') {
        return a.nameEn.localeCompare(b.nameEn);
      }

      if (sortBy === 'updatedAt') {
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return bTime - aTime;
      }

      return a.sortOrder - b.sortOrder || a.id - b.id;
    });
  }, [scopedBase, search, isSectionScoped, sectionFilter, statusFilter, sortBy]);

  function getLinkedSection(item: SectionCategoryResponse) {
    return categorySections.find((section) => section.id === item.sectionId);
  }

  function handleDelete(item: SectionCategoryResponse) {
    setDeleteTarget(item);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setFeedback('');
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  async function handleToggleStatus(item: SectionCategoryResponse) {
    setFeedback('');
    await toggleStatusMutation.mutateAsync(item);
  }

  const createHref =
    isSectionScoped && sectionId
      ? `/admin/categories/new?sectionId=${sectionId}`
      : '/admin/categories/new';

  return (
    <div className="space-y-6">
      {!compact ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard label={t('stats.total')} value={scopedBase.length} />
          <StatCard
            label={t('stats.active')}
            value={scopedBase.filter((item) => item.isActive).length}
            tone="emerald"
          />
          <StatCard
            label={t('stats.linkedSections')}
            value={isSectionScoped ? 1 : categorySections.length}
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
            {isSectionScoped && selectedSection
              ? `${t('scopedSubtitlePrefix')}: ${selectedSection.nameEn}`
              : t('studioSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isSectionScoped && selectedSection ? (
            <Link href={`/admin/sections/${selectedSection.id}`}>
              <Button type="button" variant="outline">
                {t('backToWorkspace')}
              </Button>
            </Link>
          ) : null}

          <Link href={createHref}>
            <Button type="button">{t('createCategory')}</Button>
          </Link>
        </div>
      </div>

      <div
        className={`grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ${
          isSectionScoped ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
        }`}
      >
        <Input
          id="categorySearch"
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
            onChange={(event) => setSectionFilter(event.target.value)}
            options={[
              {value: 'ALL', label: t('allSections')},
              ...categorySections.map((section) => ({
                value: String(section.id),
                label: section.nameEn
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
          id="sortBy"
          label={t('sortByLabel')}
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as SortBy)}
          options={[
            {value: 'sortOrder', label: t('sortOptions.sortOrder')},
            {value: 'nameEn', label: t('sortOptions.nameEn')},
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

      {categoriesQuery.isPending || sectionsQuery.isPending ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">{common('loading')}</p>
        </div>
      ) : categoriesQuery.isError || sectionsQuery.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm text-red-700">
            {getErrorMessage(
              toAppError(categoriesQuery.error || sectionsQuery.error),
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
            <CategoryCard
              key={item.id}
              item={item}
              linkedSection={getLinkedSection(item)}
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('deleteDialogTitle')}
        description={
          deleteTarget ? t('deleteConfirm', {name: deleteTarget.nameEn}) : ''
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