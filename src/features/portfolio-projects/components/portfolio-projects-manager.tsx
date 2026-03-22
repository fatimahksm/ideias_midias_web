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
import {
  deletePortfolioProject,
  getAllPortfolioProjects,
  updatePortfolioProject
} from '../api';
import type {
  PortfolioProjectPayload,
  PortfolioProjectResponse
} from '../types';
import {emptyToNull} from '../utils';
import {PortfolioProjectCard} from './portfolio-project-card';

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

export default function PortfolioProjectsManager() {
  const t = useTranslations('PortfolioProjectsManager');
  const common = useTranslations('Common');
  const errorT = useTranslations('CommonErrors');
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('ALL');
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

  const projectsQuery = useQuery({
    queryKey: ['portfolio-projects', 'all'],
    queryFn: getAllPortfolioProjects
  });

  const deleteMutation = useMutation({
    mutationFn: deletePortfolioProject,
    onSuccess: async () => {
      setFeedbackTone('success');
      setFeedback(t('deleteSuccess'));
      await queryClient.invalidateQueries({queryKey: ['portfolio-projects']});
    },
    onError: (error) => {
      setFeedbackTone('error');
      setFeedback(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (item: PortfolioProjectResponse) => {
      const payload: PortfolioProjectPayload = {
        sectionId: item.sectionId,
        titlePt: item.titlePt,
        titleEn: item.titleEn,
        shortDescriptionPt: emptyToNull(item.shortDescriptionPt),
        shortDescriptionEn: emptyToNull(item.shortDescriptionEn),
        fullDescriptionPt: emptyToNull(item.fullDescriptionPt),
        fullDescriptionEn: emptyToNull(item.fullDescriptionEn),
        clientName: emptyToNull(item.clientName),
        projectDate: emptyToNull(item.projectDate),
        locationPt: emptyToNull(item.locationPt),
        locationEn: emptyToNull(item.locationEn),
        coverImageUrl: emptyToNull(item.coverImageUrl),
        videoUrl: emptyToNull(item.videoUrl),
        isFeatured: item.isFeatured,
        isActive: !item.isActive,
        sortOrder: item.sortOrder
      };

      return updatePortfolioProject(item.id, payload);
    },
    onSuccess: async (_, item) => {
      setFeedbackTone('success');
      setFeedback(
        item.isActive ? t('deactivateSuccess') : t('activateSuccess')
      );
      await queryClient.invalidateQueries({queryKey: ['portfolio-projects']});
    },
    onError: (error) => {
      setFeedbackTone('error');
      setFeedback(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  const portfolioSections = useMemo(
    () =>
      (sectionsQuery.data ?? [])
        .filter((section) => section.sectionType === 'PORTFOLIO')
        .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
    [sectionsQuery.data]
  );

  const canDelete = sessionQuery.data?.role === 'SUPER_ADMIN';

  const items = useMemo(() => {
    const base = projectsQuery.data ?? [];
    const searchValue = search.trim().toLowerCase();

    const filtered = base.filter((item) => {
      const text =
        `${item.titleEn} ${item.titlePt} ${item.clientName || ''}`.toLowerCase();

      const matchesSearch = !searchValue || text.includes(searchValue);

      const matchesSection =
        sectionFilter === 'ALL' || String(item.sectionId) === sectionFilter;

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
    projectsQuery.data,
    search,
    sectionFilter,
    statusFilter,
    featuredFilter,
    sortBy
  ]);

  function getLinkedSection(item: PortfolioProjectResponse): SectionResponse | undefined {
    return portfolioSections.find((section) => section.id === item.sectionId);
  }

  async function handleDelete(item: PortfolioProjectResponse) {
    const confirmed = window.confirm(t('deleteConfirm', {name: item.titleEn}));
    if (!confirmed) return;

    setFeedback('');
    await deleteMutation.mutateAsync(item.id);
  }

  async function handleToggleStatus(item: PortfolioProjectResponse) {
    setFeedback('');
    await toggleStatusMutation.mutateAsync(item);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('stats.total')} value={(projectsQuery.data ?? []).length} />
        <StatCard
          label={t('stats.active')}
          value={(projectsQuery.data ?? []).filter((item) => item.isActive).length}
          tone="emerald"
        />
        <StatCard
          label={t('stats.featured')}
          value={(projectsQuery.data ?? []).filter((item) => item.isFeatured).length}
          tone="amber"
        />
        <StatCard
          label={t('stats.linkedSections')}
          value={portfolioSections.length}
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

        <Link href="/admin/portfolio-projects/new">
          <Button type="button">{t('createProject')}</Button>
        </Link>
      </div>

      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-5">
        <Input
          id="portfolioProjectSearch"
          label={t('searchLabel')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('searchPlaceholder')}
        />

        <Select
          id="sectionFilter"
          label={t('sectionFilterLabel')}
          value={sectionFilter}
          onChange={(event) => setSectionFilter(event.target.value)}
          options={[
            {value: 'ALL', label: t('allSections')},
            ...portfolioSections.map((section) => ({
              value: String(section.id),
              label: section.nameEn
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

      {projectsQuery.isPending || sectionsQuery.isPending ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">{common('loading')}</p>
        </div>
      ) : projectsQuery.isError || sectionsQuery.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm text-red-700">
            {getErrorMessage(
              toAppError(projectsQuery.error || sectionsQuery.error),
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
            <PortfolioProjectCard
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
    </div>
  );
}