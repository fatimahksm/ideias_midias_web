'use client';

import {useMemo, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import {Select} from '@/components/ui/select';
import {Input} from '@/components/ui/input';
import {hasAdminToken} from '@/lib/auth/token';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {useAdminSession} from '@/features/admin-layout/hooks/use-admin-session';
import {getAllSections} from '@/features/sections/api';
import {deleteHomeCard, getAllHomeCards, updateHomeCard} from '../api';
import type {HomeCardPayload, HomeCardResponse} from '../types';
import {HomeCardCard} from './home-card-card';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';
type SortBy = 'sortOrder' | 'titleEn' | 'updatedAt';

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

export default function HomeCardsManager() {
  const t = useTranslations('HomeCardsManager');
  const common = useTranslations('Common');
  const errorT = useTranslations('CommonErrors');
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sectionFilter, setSectionFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('sortOrder');
  const [feedback, setFeedback] = useState('');
  const [feedbackTone, setFeedbackTone] = useState<'success' | 'error'>(
    'success'
  );
  const [deleteTarget, setDeleteTarget] = useState<HomeCardResponse | null>(
    null
  );

  const sessionQuery = useAdminSession(hasAdminToken());

  const cardsQuery = useQuery({
    queryKey: ['home-cards', 'all'],
    queryFn: getAllHomeCards
  });

  const sectionsQuery = useQuery({
    queryKey: ['sections', 'all'],
    queryFn: getAllSections
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHomeCard,
    onSuccess: async () => {
      setFeedbackTone('success');
      setFeedback(t('deleteSuccess'));
      await queryClient.invalidateQueries({queryKey: ['home-cards']});
    },
    onError: (error) => {
      setFeedbackTone('error');
      setFeedback(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  const reorderMutation = useMutation({
    mutationFn: async ({
      a,
      b
    }: {
      a: HomeCardResponse;
      b: HomeCardResponse;
    }) => {
      const toPayload = (
        card: HomeCardResponse,
        sortOrder: number
      ): HomeCardPayload => ({
        sectionId: card.sectionId,
        titlePt: card.titlePt,
        titleEn: card.titleEn,
        shortDescriptionPt: card.shortDescriptionPt ?? null,
        shortDescriptionEn: card.shortDescriptionEn ?? null,
        imageUrl: card.imageUrl ?? null,
        iconName: card.iconName ?? null,
        sortOrder,
        isActive: card.isActive
      });

      // Swap the two cards' sort orders to move one past the other.
      await updateHomeCard(a.id, toPayload(a, b.sortOrder));
      await updateHomeCard(b.id, toPayload(b, a.sortOrder));
    },
    onSuccess: async () => {
      setFeedbackTone('success');
      setFeedback(t('reorderSuccess'));
      await queryClient.invalidateQueries({queryKey: ['home-cards']});
    },
    onError: (error) => {
      setFeedbackTone('error');
      setFeedback(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  const canDelete = sessionQuery.data?.role === 'SUPER_ADMIN';

  const sectionsMap = useMemo(() => {
    return new Map(
      (sectionsQuery.data ?? []).map((section) => [section.id, section])
    );
  }, [sectionsQuery.data]);

  const items = useMemo(() => {
    const base = cardsQuery.data ?? [];
    const searchValue = search.trim().toLowerCase();

    const filtered = base.filter((item) => {
      const linkedSection = sectionsMap.get(item.sectionId);

      const matchesSearch =
        !searchValue ||
        item.titleEn.toLowerCase().includes(searchValue) ||
        item.titlePt.toLowerCase().includes(searchValue) ||
        (linkedSection?.nameEn || '').toLowerCase().includes(searchValue) ||
        (linkedSection?.slug || '').toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && item.isActive) ||
        (statusFilter === 'INACTIVE' && !item.isActive);

      const matchesSection =
        sectionFilter === 'ALL' || String(item.sectionId) === sectionFilter;

      return matchesSearch && matchesStatus && matchesSection;
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
  }, [cardsQuery.data, search, statusFilter, sectionFilter, sortBy, sectionsMap]);

  // Reordering only makes sense while the list is shown in manual sort order.
  const canReorder = sortBy === 'sortOrder';

  function handleMove(item: HomeCardResponse, direction: 'up' | 'down') {
    const index = items.findIndex((entry) => entry.id === item.id);
    const neighbor =
      direction === 'up' ? items[index - 1] : items[index + 1];

    if (!neighbor || reorderMutation.isPending) return;

    setFeedback('');
    reorderMutation.mutate({a: item, b: neighbor});
  }

  function handleDelete(item: HomeCardResponse) {
    setDeleteTarget(item);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setFeedback('');
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label={t('stats.total')} value={(cardsQuery.data ?? []).length} />
        <StatCard
          label={t('stats.active')}
          value={(cardsQuery.data ?? []).filter((item) => item.isActive).length}
          tone="emerald"
        />
        <StatCard
          label={t('stats.linkedSections')}
          value={new Set((cardsQuery.data ?? []).map((item) => item.sectionId)).size}
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

        <Link href="/admin/home-cards/new">
          <Button type="button">{t('createCard')}</Button>
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('searchPlaceholder')}
            label={common('search')}
          />

          <Select
            label={t('sectionFilterLabel')}
            value={sectionFilter}
            onChange={(event) => setSectionFilter(event.target.value)}
            options={[
              {value: 'ALL', label: t('allSections')},
              ...(sectionsQuery.data ?? []).map((section) => ({
                value: String(section.id),
                label: `${section.nameEn} (${section.slug})`
              }))
            ]}
          />

          <Select
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
            label={t('sortByLabel')}
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortBy)}
            options={[
              {value: 'sortOrder', label: t('sortBySortOrder')},
              {value: 'titleEn', label: t('sortByTitle')},
              {value: 'updatedAt', label: t('sortByUpdatedAt')}
            ]}
          />
        </div>
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

      {cardsQuery.isPending || sectionsQuery.isPending ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">{t('loading')}</p>
        </div>
      ) : cardsQuery.isError || sectionsQuery.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm text-red-700">
            {getErrorMessage(
              toAppError(cardsQuery.error || sectionsQuery.error),
              (key) => errorT(key)
            )}
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
          <div className="mx-auto max-w-xl space-y-4">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              {t('emptyBadge')}
            </div>

            <h3 className="text-2xl font-bold text-slate-900">
              {t('emptyTitle')}
            </h3>

            <p className="text-sm leading-6 text-slate-600">
              {t('emptyDescription')}
            </p>

            <div className="pt-2">
              <Link href="/admin/home-cards/new">
                <Button type="button">{t('createCard')}</Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {items.map((item, index) => (
            <HomeCardCard
              key={item.id}
              item={item}
              linkedSection={sectionsMap.get(item.sectionId)}
              canDelete={canDelete}
              isDeleting={
                deleteMutation.isPending &&
                deleteMutation.variables === item.id
              }
              onDelete={handleDelete}
              onMoveUp={canReorder ? (entry) => handleMove(entry, 'up') : undefined}
              onMoveDown={
                canReorder ? (entry) => handleMove(entry, 'down') : undefined
              }
              canMoveUp={index > 0}
              canMoveDown={index < items.length - 1}
              isReordering={reorderMutation.isPending}
            />
          ))}
        </div>
      )}

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