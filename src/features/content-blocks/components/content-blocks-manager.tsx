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
import type {SectionResponse} from '@/features/sections/types';
import {
  deleteContentBlock,
  getAllContentBlocks,
  updateContentBlock
} from '../api';
import {CONTENT_BLOCK_TYPE_OPTIONS} from '../constants';
import type {
  ContentBlockType,
  SectionContentBlockPayload,
  SectionContentBlockResponse
} from '../types';
import {emptyToNull, getNextContentBlockSortOrder} from '../utils';
import {BulkImageUpload} from './bulk-image-upload';
import {ContentBlockCard} from './content-block-card';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';
type TypeFilter = 'ALL' | ContentBlockType;
type SortBy = 'sortOrder' | 'updatedAt' | 'titleEn';

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

export default function ContentBlocksManager({
  sectionId,
  compact = false
}: Props) {
  const t = useTranslations('ContentBlocksManager');
  const common = useTranslations('Common');
  const errorT = useTranslations('CommonErrors');
  const queryClient = useQueryClient();

  const isSectionScoped = typeof sectionId === 'number';

  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState(
    isSectionScoped ? String(sectionId) : 'ALL'
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('sortOrder');
  const [feedback, setFeedback] = useState('');
  const [feedbackTone, setFeedbackTone] = useState<'success' | 'error'>(
    'success'
  );
  const [deleteTarget, setDeleteTarget] =
    useState<SectionContentBlockResponse | null>(null);

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

  const contentBlocksQuery = useQuery({
    queryKey: ['content-blocks', 'all'],
    queryFn: getAllContentBlocks
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContentBlock,
    onSuccess: async () => {
      setFeedbackTone('success');
      setFeedback(t('deleteSuccess'));
      await queryClient.invalidateQueries({queryKey: ['content-blocks']});
    },
    onError: (error) => {
      setFeedbackTone('error');
      setFeedback(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (item: SectionContentBlockResponse) => {
      const payload: SectionContentBlockPayload = {
        sectionId: item.sectionId,
        blockType: item.blockType,
        titlePt: emptyToNull(item.titlePt),
        titleEn: emptyToNull(item.titleEn),
        subtitlePt: emptyToNull(item.subtitlePt),
        subtitleEn: emptyToNull(item.subtitleEn),
        contentPt: emptyToNull(item.contentPt),
        contentEn: emptyToNull(item.contentEn),
        imageUrl: emptyToNull(item.imageUrl),
        videoUrl: emptyToNull(item.videoUrl),
        isActive: !item.isActive,
        sortOrder: item.sortOrder
      };

      return updateContentBlock(item.id, payload);
    },
    onSuccess: async (_, item) => {
      setFeedbackTone('success');
      setFeedback(
        item.isActive ? t('deactivateSuccess') : t('activateSuccess')
      );
      await queryClient.invalidateQueries({queryKey: ['content-blocks']});
    },
    onError: (error) => {
      setFeedbackTone('error');
      setFeedback(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  const contentSections = useMemo(
    () =>
      (sectionsQuery.data ?? [])
        .filter((section) => section.sectionType === 'CONTENT')
        .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
    [sectionsQuery.data]
  );

  const selectedSection = useMemo(
    () => contentSections.find((section) => section.id === sectionId),
    [contentSections, sectionId]
  );

  const canDelete = sessionQuery.data?.role === 'SUPER_ADMIN';

  const scopedBase = useMemo(() => {
    const all = contentBlocksQuery.data ?? [];
    if (!isSectionScoped || !sectionId) return all;
    return all.filter((item) => item.sectionId === sectionId);
  }, [contentBlocksQuery.data, isSectionScoped, sectionId]);

  const items = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    const filtered = scopedBase.filter((item) => {
      const text =
        `${item.titleEn || ''} ${item.titlePt || ''} ${item.contentEn || ''} ${item.contentPt || ''}`.toLowerCase();

      const matchesSearch = !searchValue || text.includes(searchValue);

      const matchesSection =
        isSectionScoped ||
        sectionFilter === 'ALL' ||
        String(item.sectionId) === sectionFilter;

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && item.isActive) ||
        (statusFilter === 'INACTIVE' && !item.isActive);

      const matchesType = typeFilter === 'ALL' || item.blockType === typeFilter;

      return matchesSearch && matchesSection && matchesStatus && matchesType;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'titleEn') {
        return (a.titleEn || '').localeCompare(b.titleEn || '');
      }

      if (sortBy === 'updatedAt') {
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return bTime - aTime;
      }

      return a.sortOrder - b.sortOrder || a.id - b.id;
    });
  }, [
    scopedBase,
    search,
    isSectionScoped,
    sectionFilter,
    statusFilter,
    typeFilter,
    sortBy
  ]);

  function getLinkedSection(
    item: SectionContentBlockResponse
  ): SectionResponse | undefined {
    return contentSections.find((section) => section.id === item.sectionId);
  }

  function handleDelete(item: SectionContentBlockResponse) {
    setDeleteTarget(item);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setFeedback('');
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  async function handleToggleStatus(item: SectionContentBlockResponse) {
    setFeedback('');
    await toggleStatusMutation.mutateAsync(item);
  }

  const createHref =
    isSectionScoped && sectionId
      ? `/admin/content-blocks/new?sectionId=${sectionId}`
      : '/admin/content-blocks/new';

  return (
    <div className="space-y-6">
      {!compact ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label={t('stats.total')} value={scopedBase.length} />
          <StatCard
            label={t('stats.active')}
            value={scopedBase.filter((item) => item.isActive).length}
            tone="emerald"
          />
          <StatCard
            label={t('stats.contentSections')}
            value={isSectionScoped ? 1 : contentSections.length}
            tone="blue"
          />
          <StatCard
            label={t('stats.textBlocks')}
            value={scopedBase.filter((item) => item.blockType === 'TEXT').length}
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

          {isSectionScoped && sectionId ? (
            <BulkImageUpload
              sectionId={sectionId}
              startSortOrder={getNextContentBlockSortOrder(
                contentBlocksQuery.data ?? [],
                sectionId
              )}
              onUploaded={async (count) => {
                setFeedbackTone('success');
                setFeedback(t('bulkUploadSuccess', {count}));
                await queryClient.invalidateQueries({
                  queryKey: ['content-blocks']
                });
              }}
              onError={(message) => {
                setFeedbackTone('error');
                setFeedback(message);
              }}
            />
          ) : null}

          <Link href={createHref}>
            <Button type="button">{t('createBlock')}</Button>
          </Link>
        </div>
      </div>

      <div
        className={`grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ${
          isSectionScoped ? 'lg:grid-cols-4' : 'lg:grid-cols-5'
        }`}
      >
        <Input
          id="contentBlockSearch"
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
              ...contentSections.map((section) => ({
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
          id="typeFilter"
          label={t('typeFilterLabel')}
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
          options={[
            {value: 'ALL', label: t('allTypes')},
            ...CONTENT_BLOCK_TYPE_OPTIONS.map((option) => ({
              value: option.value,
              label: t(option.labelKey as never)
            }))
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

      {contentBlocksQuery.isPending || sectionsQuery.isPending ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">{common('loading')}</p>
        </div>
      ) : contentBlocksQuery.isError || sectionsQuery.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm text-red-700">
            {getErrorMessage(
              toAppError(contentBlocksQuery.error || sectionsQuery.error),
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
            <ContentBlockCard
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
          deleteTarget
            ? t('deleteConfirm', {
                name:
                  deleteTarget.titleEn ||
                  deleteTarget.titlePt ||
                  t('untitledBlock')
              })
            : ''
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