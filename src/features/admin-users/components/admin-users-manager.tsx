'use client';

import {useMemo, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {ActionMenu} from '@/components/ui/action-menu';
import {Button} from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import {Input} from '@/components/ui/input';
import {Select} from '@/components/ui/select';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import type {AdminUser} from '../types';
import {
  deleteAdminUser,
  getAllAdminUsers,
  resetAdminUserPassword,
  updateAdminUserStatus
} from '../api';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';
type RoleFilter = 'ALL' | 'ADMIN' | 'SUPER_ADMIN';

type ResetState = {
  adminId: number;
  name: string;
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

function formatDate(value?: string | null) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString();
}

export default function AdminUsersManager() {
  const t = useTranslations('AdminUsersManager');
  const common = useTranslations('Common');
  const errorT = useTranslations('CommonErrors');
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [feedback, setFeedback] = useState('');
  const [feedbackTone, setFeedbackTone] = useState<'success' | 'error'>(
    'success'
  );
  const [resetState, setResetState] = useState<ResetState | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const adminsQuery = useQuery({
    queryKey: ['admin-users', 'all'],
    queryFn: getAllAdminUsers
  });

  const statusMutation = useMutation({
    mutationFn: ({id, isActive}: {id: number; isActive: boolean}) =>
      updateAdminUserStatus(id, {isActive}),
    onSuccess: async (_, variables) => {
      setFeedbackTone('success');
      setFeedback(
        variables.isActive ? t('activateSuccess') : t('deactivateSuccess')
      );
      await queryClient.invalidateQueries({queryKey: ['admin-users']});
    },
    onError: (error) => {
      setFeedbackTone('error');
      setFeedback(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: async () => {
      setFeedbackTone('success');
      setFeedback(t('deleteSuccess'));
      await queryClient.invalidateQueries({queryKey: ['admin-users']});
    },
    onError: (error) => {
      setFeedbackTone('error');
      setFeedback(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  const resetMutation = useMutation({
    mutationFn: ({
      id,
      newPassword,
      confirmPassword
    }: {
      id: number;
      newPassword: string;
      confirmPassword: string;
    }) => resetAdminUserPassword(id, {newPassword, confirmPassword}),
    onSuccess: async () => {
      setFeedbackTone('success');
      setFeedback(t('resetPasswordSuccess'));
      setResetState(null);
      setNewPassword('');
      setConfirmPassword('');
      await queryClient.invalidateQueries({queryKey: ['admin-users']});
    },
    onError: (error) => {
      setFeedbackTone('error');
      setFeedback(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  const allItems = adminsQuery.data ?? [];

  const items = useMemo(() => {
    const value = search.trim().toLowerCase();

    return allItems.filter((item) => {
      const matchesSearch =
        !value ||
        item.fullName.toLowerCase().includes(value) ||
        item.email.toLowerCase().includes(value);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && item.isActive) ||
        (statusFilter === 'INACTIVE' && !item.isActive);

      const matchesRole = roleFilter === 'ALL' || item.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [allItems, roleFilter, search, statusFilter]);

  async function handleToggleStatus(item: AdminUser) {
    setFeedback('');
    await statusMutation.mutateAsync({id: item.id, isActive: !item.isActive});
  }

  function handleDelete(item: AdminUser) {
    setDeleteTarget(item);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setFeedback('');
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  async function handleResetPassword() {
    if (!resetState) return;

    setFeedback('');
    await resetMutation.mutateAsync({
      id: resetState.adminId,
      newPassword,
      confirmPassword
    });
  }

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
          label={t('stats.superAdmins')}
          value={allItems.filter((item) => item.role === 'SUPER_ADMIN').length}
          tone="blue"
        />
        <StatCard
          label={t('stats.admins')}
          value={allItems.filter((item) => item.role === 'ADMIN').length}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {t('studioTitle')}
          </p>
          <p className="mt-1 text-sm text-slate-500">{t('studioSubtitle')}</p>
        </div>

        <Link href="/admin/users/new">
          <Button type="button">{t('createAdmin')}</Button>
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr_1fr]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('searchPlaceholder')}
            label={common('search')}
          />

          <Select
            label={t('statusFilterLabel')}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            options={[
              {value: 'ALL', label: t('allStatuses')},
              {value: 'ACTIVE', label: t('statusActive')},
              {value: 'INACTIVE', label: t('statusInactive')}
            ]}
          />

          <Select
            label={t('roleFilterLabel')}
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
            options={[
              {value: 'ALL', label: t('allRoles')},
              {value: 'SUPER_ADMIN', label: t('superAdminRole')},
              {value: 'ADMIN', label: t('adminRole')}
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

      {adminsQuery.isPending ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">{t('loading')}</p>
        </div>
      ) : adminsQuery.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm text-red-700">
            {getErrorMessage(toAppError(adminsQuery.error), (key) => errorT(key))}
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
          <h3 className="text-2xl font-bold text-slate-900">{t('emptyTitle')}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {t('emptyDescription')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      {item.fullName}
                    </h3>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        item.role === 'SUPER_ADMIN'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.role === 'SUPER_ADMIN'
                        ? t('superAdminRole')
                        : t('adminRole')}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        item.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {item.isActive ? t('statusActive') : t('statusInactive')}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-slate-600">
                    <p>{item.email}</p>
                    <p>
                      {t('lastLogin')}: {formatDate(item.lastLoginAt)}
                    </p>
                    <p>
                      {t('createdAt')}: {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/users/${item.id}/edit`}>
                    <Button type="button" variant="outline">
                      {t('edit')}
                    </Button>
                  </Link>

                  <ActionMenu
                    label={common('moreActions')}
                    items={[
                      {
                        key: 'reset',
                        label: t('resetPassword'),
                        onSelect: () =>
                          setResetState({adminId: item.id, name: item.fullName})
                      },
                      {
                        key: 'toggleStatus',
                        label: item.isActive ? t('deactivate') : t('activate'),
                        onSelect: () => handleToggleStatus(item)
                      },
                      {
                        key: 'delete',
                        label: t('delete'),
                        tone: 'danger',
                        onSelect: () => handleDelete(item)
                      }
                    ]}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {resetState ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setResetState(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-slate-900">
              {t('resetPasswordTitle', {name: resetState.name})}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {t('resetPasswordSubtitle')}
            </p>

            <div className="mt-5 space-y-4">
              <Input
                type="password"
                label={t('newPassword')}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
              <Input
                type="password"
                label={t('confirmPassword')}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setResetState(null)}
              >
                {common('cancel')}
              </Button>
              <Button
                type="button"
                onClick={handleResetPassword}
                isLoading={resetMutation.isPending}
              >
                {t('resetPassword')}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('deleteDialogTitle')}
        description={
          deleteTarget ? t('deleteConfirm', {name: deleteTarget.fullName}) : ''
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