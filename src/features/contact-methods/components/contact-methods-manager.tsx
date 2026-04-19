'use client';

import {useMemo, useState} from 'react';
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
import {deleteContactMethod, getAllContactMethods} from '../api';
import type {ContactMethodResponse, ContactMethodType} from '../types';
import {ContactMethodCard} from './contact-method-card';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';
type SortBy = 'sortOrder' | 'labelEn' | 'updatedAt';

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

export default function ContactMethodsManager() {
  const t = useTranslations('ContactMethodsManager');
  const common = useTranslations('Common');
  const commonTypes = useTranslations('ContactMethodsCommon');
  const errorT = useTranslations('CommonErrors');
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | ContactMethodType>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('sortOrder');
  const [feedback, setFeedback] = useState('');
  const [feedbackTone, setFeedbackTone] = useState<'success' | 'error'>(
    'success'
  );
  const [deleteTarget, setDeleteTarget] = useState<ContactMethodResponse | null>(
    null
  );

  const sessionQuery = useAdminSession(hasAdminToken());

  const methodsQuery = useQuery({
    queryKey: ['contact-methods', 'all'],
    queryFn: getAllContactMethods
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContactMethod,
    onSuccess: async () => {
      setFeedbackTone('success');
      setFeedback(t('deleteSuccess'));
      await queryClient.invalidateQueries({queryKey: ['contact-methods']});
    },
    onError: (error) => {
      setFeedbackTone('error');
      setFeedback(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  const canDelete = sessionQuery.data?.role === 'SUPER_ADMIN';

  const items = useMemo(() => {
    const base = methodsQuery.data ?? [];
    const searchValue = search.trim().toLowerCase();

    const filtered = base.filter((item) => {
      const matchesSearch =
        !searchValue ||
        item.labelEn.toLowerCase().includes(searchValue) ||
        item.labelPt.toLowerCase().includes(searchValue) ||
        item.value.toLowerCase().includes(searchValue);

      const matchesType = typeFilter === 'ALL' || item.type === typeFilter;

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && item.isActive) ||
        (statusFilter === 'INACTIVE' && !item.isActive);

      return matchesSearch && matchesType && matchesStatus;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'labelEn') {
        return a.labelEn.localeCompare(b.labelEn);
      }

      if (sortBy === 'updatedAt') {
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return bTime - aTime;
      }

      return a.sortOrder - b.sortOrder || a.id - b.id;
    });
  }, [methodsQuery.data, search, typeFilter, statusFilter, sortBy]);

  function handleDelete(item: ContactMethodResponse) {
    setDeleteTarget(item);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setFeedback('');
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  const allItems = methodsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('stats.total')} value={allItems.length} />
        <StatCard
          label={t('stats.active')}
          value={allItems.filter((item) => item.isActive).length}
          tone="emerald"
        />
        <StatCard
          label={commonTypes('types.PHONE.label')}
          value={allItems.filter((item) => item.type === 'PHONE').length}
          tone="blue"
        />
        <StatCard
          label={commonTypes('types.SOCIAL.label')}
          value={allItems.filter((item) => item.type === 'SOCIAL').length}
          tone="amber"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {t('studioTitle')}
          </p>
          <p className="mt-1 text-sm text-slate-500">{t('studioSubtitle')}</p>
        </div>

        <Link href="/admin/contact-methods/new">
          <Button type="button">{t('createMethod')}</Button>
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
            label={t('typeFilterLabel')}
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as 'ALL' | ContactMethodType)
            }
            options={[
              {value: 'ALL', label: t('allTypes')},
              {value: 'PHONE', label: commonTypes('types.PHONE.label')},
              {value: 'WHATSAPP', label: commonTypes('types.WHATSAPP.label')},
              {value: 'EMAIL', label: commonTypes('types.EMAIL.label')},
              {value: 'SOCIAL', label: commonTypes('types.SOCIAL.label')}
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
              {value: 'labelEn', label: t('sortByLabelEn')},
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

      {methodsQuery.isPending ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">{t('loading')}</p>
        </div>
      ) : methodsQuery.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm text-red-700">
            {getErrorMessage(toAppError(methodsQuery.error), (key) => errorT(key))}
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
              <Link href="/admin/contact-methods/new">
                <Button type="button">{t('createMethod')}</Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {items.map((item) => (
            <ContactMethodCard
              key={item.id}
              item={item}
              canDelete={canDelete}
              isDeleting={
                deleteMutation.isPending &&
                deleteMutation.variables === item.id
              }
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('deleteDialogTitle')}
        description={
          deleteTarget ? t('deleteConfirm', {name: deleteTarget.labelEn}) : ''
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