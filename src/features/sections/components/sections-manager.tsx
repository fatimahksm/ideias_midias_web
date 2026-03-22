'use client';

import {useMemo, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import {hasAdminToken} from '@/lib/auth/token';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {useAdminSession} from '@/features/admin-layout/hooks/use-admin-session';
import {
  countSectionsByType,
  emptyToNull,
  getNextSortOrder,
  slugify
} from '../utils';
import {
  createSection,
  deleteSection,
  getAllSections,
  updateSection
} from '../api';
import type {SectionPayload, SectionResponse, SectionType} from '../types';
import {SectionCard} from './section-card';
import {SectionEmptyState} from './section-empty-state';
import {SectionListToolbar} from './section-list-toolbar';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';
type SortBy = 'sortOrder' | 'nameEn' | 'updatedAt';

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

export default function SectionsManager() {
  const t = useTranslations('SectionsManager');
  const commonSections = useTranslations('SectionsCommon');
  const errorT = useTranslations('CommonErrors');
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | SectionType>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
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

  const deleteMutation = useMutation({
    mutationFn: deleteSection,
    onSuccess: async () => {
      setFeedbackTone('success');
      setFeedback(t('deleteSuccess'));
      await queryClient.invalidateQueries({queryKey: ['sections']});
    },
    onError: (error) => {
      setFeedbackTone('error');
      setFeedback(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: async (item: SectionResponse) => {
      const allItems = sectionsQuery.data ?? [];
      const nextSortOrder = getNextSortOrder(allItems);

      const payload: SectionPayload = {
        slug: `${slugify(item.slug)}-copy-${nextSortOrder}`,
        namePt: `${item.namePt} ${t('copySuffix')}`,
        nameEn: `${item.nameEn} ${t('copySuffix')}`,
        descriptionPt: emptyToNull(item.descriptionPt),
        descriptionEn: emptyToNull(item.descriptionEn),
        sectionType: item.sectionType,
        coverImageUrl: emptyToNull(item.coverImageUrl),
        coverVideoUrl: emptyToNull(item.coverVideoUrl),
        isActive: false,
        sortOrder: nextSortOrder
      };

      return createSection(payload);
    },
    onSuccess: async () => {
      setFeedbackTone('success');
      setFeedback(t('duplicateSuccess'));
      await queryClient.invalidateQueries({queryKey: ['sections']});
    },
    onError: (error) => {
      setFeedbackTone('error');
      setFeedback(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (item: SectionResponse) => {
      const payload: SectionPayload = {
        slug: item.slug,
        namePt: item.namePt,
        nameEn: item.nameEn,
        descriptionPt: emptyToNull(item.descriptionPt),
        descriptionEn: emptyToNull(item.descriptionEn),
        sectionType: item.sectionType,
        coverImageUrl: emptyToNull(item.coverImageUrl),
        coverVideoUrl: emptyToNull(item.coverVideoUrl),
        isActive: !item.isActive,
        sortOrder: item.sortOrder
      };

      return updateSection(item.id, payload);
    },
    onSuccess: async (_, item) => {
      setFeedbackTone('success');
      setFeedback(
        item.isActive ? t('deactivateSuccess') : t('activateSuccess')
      );
      await queryClient.invalidateQueries({queryKey: ['sections']});
    },
    onError: (error) => {
      setFeedbackTone('error');
      setFeedback(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  const canDelete = sessionQuery.data?.role === 'SUPER_ADMIN';

  const items = useMemo(() => {
    const base = sectionsQuery.data ?? [];
    const searchValue = search.trim().toLowerCase();

    const filtered = base.filter((item) => {
      const matchesSearch =
        !searchValue ||
        item.nameEn.toLowerCase().includes(searchValue) ||
        item.namePt.toLowerCase().includes(searchValue) ||
        item.slug.toLowerCase().includes(searchValue);

      const matchesType =
        typeFilter === 'ALL' || item.sectionType === typeFilter;

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && item.isActive) ||
        (statusFilter === 'INACTIVE' && !item.isActive);

      return matchesSearch && matchesType && matchesStatus;
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
  }, [sectionsQuery.data, search, typeFilter, statusFilter, sortBy]);

  const allSections = sectionsQuery.data ?? [];
  const isFiltered =
    Boolean(search.trim()) ||
    typeFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    sortBy !== 'sortOrder';

  async function handleDelete(item: SectionResponse) {
    const confirmed = window.confirm(t('deleteConfirm', {name: item.nameEn}));

    if (!confirmed) return;

    setFeedback('');
    await deleteMutation.mutateAsync(item.id);
  }

  async function handleDuplicate(item: SectionResponse) {
    setFeedback('');
    await duplicateMutation.mutateAsync(item);
  }

  async function handleToggleStatus(item: SectionResponse) {
    setFeedback('');
    await toggleStatusMutation.mutateAsync(item);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('stats.total')} value={allSections.length} />
        <StatCard
          label={t('stats.active')}
          value={allSections.filter((item) => item.isActive).length}
          tone="emerald"
        />
        <StatCard
          label={commonSections('types.CATEGORY_ITEMS.label')}
          value={countSectionsByType(allSections, 'CATEGORY_ITEMS')}
          tone="blue"
        />
        <StatCard
          label={commonSections('types.PORTFOLIO.label')}
          value={countSectionsByType(allSections, 'PORTFOLIO')}
          tone="amber"
        />
      </div>

      <PageActions />

      <SectionListToolbar
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

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

      {sectionsQuery.isPending ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">{t('loading')}</p>
        </div>
      ) : sectionsQuery.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm text-red-700">
            {getErrorMessage(toAppError(sectionsQuery.error), (key) => errorT(key))}
          </p>
        </div>
      ) : items.length === 0 ? (
        <SectionEmptyState
          hasAnySections={allSections.length > 0}
          activeTypeFilter={typeFilter}
          isFiltered={isFiltered}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {items.map((item) => (
            <SectionCard
              key={item.id}
              item={item}
              canDelete={canDelete}
              isDeleting={
                deleteMutation.isPending &&
                deleteMutation.variables === item.id
              }
              isDuplicating={
                duplicateMutation.isPending &&
                duplicateMutation.variables?.id === item.id
              }
              isTogglingStatus={
                toggleStatusMutation.isPending &&
                toggleStatusMutation.variables?.id === item.id
              }
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PageActions() {
  const t = useTranslations('SectionsManager');

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {t('studioTitle')}
        </p>
        <p className="mt-1 text-sm text-slate-500">{t('studioSubtitle')}</p>
      </div>

      <Link href="/admin/sections/new">
        <Button type="button">{t('createSection')}</Button>
      </Link>
    </div>
  );
}