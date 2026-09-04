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
import {
  deletePortfolioProject,
  getPortfolioProjectStats,
  getPortfolioProjectsPage,
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

export default function PortfolioProjectsManager({
  sectionId,
  compact = false
}: Props) {
  const t = useTranslations('PortfolioProjectsManager');
  const common = useTranslations('Common');
  const errorT = useTranslations('CommonErrors');
  const queryClient = useQueryClient();

  const isSectionScoped = typeof sectionId === 'number';

  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState(
    isSectionScoped ? String(sectionId) : 'ALL'
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
    useState<PortfolioProjectResponse | null>(null);

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

  // Filters and sorting run in the database, so the screen can page through
  // projects without a filter quietly missing rows on later pages.
  const debouncedSearch = useDebouncedValue(search);

  const effectiveSectionId = isSectionScoped
    ? sectionId
    : sectionFilter === 'ALL'
      ? null
      : Number(sectionFilter);

  const featuredParam =
    featuredFilter === 'ALL' ? null : featuredFilter === 'FEATURED';

  const statsQuery = useQuery({
    queryKey: ['portfolio-projects', 'stats', effectiveSectionId],
    queryFn: () => getPortfolioProjectStats(effectiveSectionId)
  });

  const projectsQuery = useInfiniteQuery({
    queryKey: [
      'portfolio-projects',
      'page',
      effectiveSectionId,
      statusFilter,
      featuredFilter,
      debouncedSearch,
      sortBy
    ],
    initialPageParam: 0,
    queryFn: ({pageParam}) =>
      getPortfolioProjectsPage({
        sectionId: effectiveSectionId,
        status: statusFilter,
        featured: featuredParam,
        search: debouncedSearch,
        sort: sortBy === 'titleEn' ? 'title' : sortBy,
        page: pageParam
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined
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

  const selectedSection = useMemo(
    () => portfolioSections.find((section) => section.id === sectionId),
    [portfolioSections, sectionId]
  );

  const canDelete = sessionQuery.data?.role === 'SUPER_ADMIN';

  const items = useMemo(
    () => projectsQuery.data?.pages.flatMap((page) => page.content) ?? [],
    [projectsQuery.data]
  );

  const totalItems = projectsQuery.data?.pages[0]?.totalElements ?? items.length;

  function getLinkedSection(
    item: PortfolioProjectResponse
  ): SectionResponse | undefined {
    return portfolioSections.find((section) => section.id === item.sectionId);
  }

  function handleDelete(item: PortfolioProjectResponse) {
    setDeleteTarget(item);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setFeedback('');
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  async function handleToggleStatus(item: PortfolioProjectResponse) {
    setFeedback('');
    await toggleStatusMutation.mutateAsync(item);
  }

  const createHref =
    isSectionScoped && sectionId
      ? `/admin/portfolio-projects/new?sectionId=${sectionId}`
      : '/admin/portfolio-projects/new';

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
            value={isSectionScoped ? 1 : portfolioSections.length}
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
          {isSectionScoped && selectedSection && !compact ? (
            <Link href={`/admin/sections/${selectedSection.id}`}>
              <Button type="button" variant="outline">
                {t('backToWorkspace')}
              </Button>
            </Link>
          ) : null}

          <Link href={createHref}>
            <Button type="button">{t('createProject')}</Button>
          </Link>
        </div>
      </div>

      <div
        className={`grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ${
          isSectionScoped ? 'lg:grid-cols-4' : 'lg:grid-cols-5'
        }`}
      >
        <Input
          id="portfolioProjectSearch"
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
              ...portfolioSections.map((section) => ({
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

      {projectsQuery.hasNextPage ? (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-slate-500">
            {t('showingCount', {shown: items.length, total: totalItems})}
          </p>

          <Button
            type="button"
            variant="outline"
            isLoading={projectsQuery.isFetchingNextPage}
            loadingText={common('loading')}
            onClick={() => projectsQuery.fetchNextPage()}
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