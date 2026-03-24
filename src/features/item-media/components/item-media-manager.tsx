'use client';

import {useMemo, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import {Select} from '@/components/ui/select';
import {hasAdminToken} from '@/lib/auth/token';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {useAdminSession} from '@/features/admin-layout/hooks/use-admin-session';
import {getItemById} from '@/features/items/api';
import {
  deleteItemMedia,
  getItemMediaByItem,
  updateItemMedia
} from '../api';
import type {
  ItemMediaType,
  SectionItemMediaPayload,
  SectionItemMediaResponse
} from '../types';
import {emptyToNull} from '../utils';
import {ItemMediaBulkUploader} from './item-media-bulk-uploader';
import {ItemMediaCard} from './item-media-card';

type Props = {
  itemId: number;
};

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';
type TypeFilter = 'ALL' | ItemMediaType;
type SortBy = 'sortOrder' | 'updatedAt';

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

export default function ItemMediaManager({itemId}: Props) {
  const t = useTranslations('ItemMediaManager');
  const common = useTranslations('Common');
  const errorT = useTranslations('CommonErrors');
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('sortOrder');
  const [feedback, setFeedback] = useState('');
  const [feedbackTone, setFeedbackTone] = useState<'success' | 'error'>(
    'success'
  );

  const sessionQuery = useAdminSession(hasAdminToken());

  const itemQuery = useQuery({
    queryKey: ['items', itemId],
    queryFn: () => getItemById(itemId)
  });

  const mediaQuery = useQuery({
    queryKey: ['item-media', 'item', itemId],
    queryFn: () => getItemMediaByItem(itemId)
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItemMedia,
    onSuccess: async () => {
      setFeedbackTone('success');
      setFeedback(t('deleteSuccess'));
      await queryClient.invalidateQueries({
        queryKey: ['item-media', 'item', itemId]
      });
    },
    onError: (error) => {
      setFeedbackTone('error');
      setFeedback(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (item: SectionItemMediaResponse) => {
      const payload: SectionItemMediaPayload = {
        itemId: item.itemId,
        mediaType: item.mediaType,
        mediaUrl: item.mediaUrl,
        thumbnailUrl: emptyToNull(item.thumbnailUrl),
        altTextPt: emptyToNull(item.altTextPt),
        altTextEn: emptyToNull(item.altTextEn),
        isActive: !item.isActive,
        sortOrder: item.sortOrder
      };

      return updateItemMedia(item.id, payload);
    },
    onSuccess: async (_, item) => {
      setFeedbackTone('success');
      setFeedback(
        item.isActive ? t('deactivateSuccess') : t('activateSuccess')
      );
      await queryClient.invalidateQueries({
        queryKey: ['item-media', 'item', itemId]
      });
    },
    onError: (error) => {
      setFeedbackTone('error');
      setFeedback(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  const canDelete = sessionQuery.data?.role === 'SUPER_ADMIN';

  const allMedia = mediaQuery.data ?? [];

  const nextSortOrder = useMemo(() => {
    if (!allMedia.length) return 0;
    return Math.max(...allMedia.map((item) => item.sortOrder ?? 0)) + 1;
  }, [allMedia]);

  const items = useMemo(() => {
    const filtered = allMedia.filter((item) => {
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && item.isActive) ||
        (statusFilter === 'INACTIVE' && !item.isActive);

      const matchesType = typeFilter === 'ALL' || item.mediaType === typeFilter;

      return matchesStatus && matchesType;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'updatedAt') {
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return bTime - aTime;
      }

      return a.sortOrder - b.sortOrder || a.id - b.id;
    });
  }, [allMedia, statusFilter, typeFilter, sortBy]);

  async function handleDelete(item: SectionItemMediaResponse) {
    const confirmed = window.confirm(t('deleteConfirm'));
    if (!confirmed) return;

    setFeedback('');
    await deleteMutation.mutateAsync(item.id);
  }

  async function handleToggleStatus(item: SectionItemMediaResponse) {
    setFeedback('');
    await toggleStatusMutation.mutateAsync(item);
  }

  async function handleBulkCompleted() {
    setFeedbackTone('success');
    setFeedback(t('bulkUploadSuccess'));
    await queryClient.invalidateQueries({
      queryKey: ['item-media', 'item', itemId]
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label={t('stats.total')} value={allMedia.length} />
        <StatCard
          label={t('stats.active')}
          value={allMedia.filter((item) => item.isActive).length}
          tone="emerald"
        />
        <StatCard
          label={t('stats.images')}
          value={allMedia.filter((item) => item.mediaType === 'IMAGE').length}
          tone="blue"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {t('studioTitle')}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {itemQuery.data
              ? t('studioSubtitleWithItem', {item: itemQuery.data.titleEn})
              : t('studioSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {itemQuery.data?.sectionId ? (
            <Link href={`/admin/sections/${itemQuery.data.sectionId}`}>
              <Button type="button" variant="outline">
                {t('backToWorkspace')}
              </Button>
            </Link>
          ) : null}

          <Link href={`/admin/items/${itemId}/edit`}>
            <Button type="button" variant="outline">
              {t('backToItem')}
            </Button>
          </Link>

          <Link href={`/admin/items/${itemId}/media/new`}>
            <Button type="button">{t('createMedia')}</Button>
          </Link>
        </div>
      </div>

      <ItemMediaBulkUploader
        itemId={itemId}
        nextSortOrder={nextSortOrder}
        onCompleted={handleBulkCompleted}
      />

      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-3">
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
            {value: 'IMAGE', label: t('typeImage')},
            {value: 'VIDEO', label: t('typeVideo')}
          ]}
        />

        <Select
          id="sortBy"
          label={t('sortByLabel')}
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as SortBy)}
          options={[
            {value: 'sortOrder', label: t('sortOptions.sortOrder')},
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

      {itemQuery.isPending || mediaQuery.isPending ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">{common('loading')}</p>
        </div>
      ) : itemQuery.isError || mediaQuery.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm text-red-700">
            {getErrorMessage(
              toAppError(itemQuery.error || mediaQuery.error),
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
            <ItemMediaCard
              key={item.id}
              item={item}
              linkedItem={itemQuery.data}
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