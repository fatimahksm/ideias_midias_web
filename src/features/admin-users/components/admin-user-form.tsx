'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation, useQuery} from '@tanstack/react-query';
import {useLocale, useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {useEffect, useMemo, useState} from 'react';
import {useForm} from 'react-hook-form';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select} from '@/components/ui/select';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {
  createAdminUser,
  getAdminUserById,
  updateAdminUser
} from '../api';
import {
  createAdminUserSchema,
  type CreateAdminUserFormValues,
  type UpdateAdminUserFormValues,
  updateAdminUserSchema
} from '../schema';

type Props =
  | {mode: 'create'; adminId?: never}
  | {mode: 'edit'; adminId: number};

export default function AdminUserForm(props: Props) {
  const t = useTranslations('AdminUserFormPage');
  const common = useTranslations('Common');
  const errorT = useTranslations('CommonErrors');
  const locale = useLocale();
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isCreate = props.mode === 'create';

  const adminQuery = useQuery({
    queryKey: ['admin-users', 'single', props.mode === 'edit' ? props.adminId : 'new'],
    queryFn: () => getAdminUserById(props.adminId),
    enabled: props.mode === 'edit'
  });

  const createForm = useForm<CreateAdminUserFormValues>({
    resolver: zodResolver(createAdminUserSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      isActive: true
    }
  });

  const editForm = useForm<UpdateAdminUserFormValues>({
    resolver: zodResolver(updateAdminUserSchema),
    defaultValues: {
      fullName: '',
      email: '',
      role: 'ADMIN'
    }
  });

  useEffect(() => {
    if (props.mode === 'edit' && adminQuery.data) {
      editForm.reset({
        fullName: adminQuery.data.fullName,
        email: adminQuery.data.email,
        role: adminQuery.data.role
      });
    }
  }, [adminQuery.data, editForm, props.mode]);

  const mutation = useMutation({
    mutationFn: async (values: CreateAdminUserFormValues | UpdateAdminUserFormValues) => {
      if (props.mode === 'create') {
        return createAdminUser(values as CreateAdminUserFormValues);
      }

      return updateAdminUser(props.adminId, values as UpdateAdminUserFormValues);
    },
    onSuccess: () => {
      setServerError('');
      setSuccessMessage(
        props.mode === 'create' ? t('createSuccess') : t('updateSuccess')
      );
      router.replace(`/${locale}/admin/users`);
    },
    onError: (error) => {
      setSuccessMessage('');
      setServerError(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  const roleOptions = useMemo(
    () => [
      {value: 'ADMIN', label: t('adminRole')},
      {value: 'SUPER_ADMIN', label: t('superAdminRole')}
    ],
    [t]
  );

  async function handleCreateSubmit(values: CreateAdminUserFormValues) {
    setServerError('');
    setSuccessMessage('');
    await mutation.mutateAsync(values);
  }

  async function handleEditSubmit(values: UpdateAdminUserFormValues) {
    setServerError('');
    setSuccessMessage('');
    await mutation.mutateAsync(values);
  }

  if (props.mode === 'edit' && adminQuery.isPending) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">{t('loading')}</p>
      </div>
    );
  }

  if (props.mode === 'edit' && adminQuery.isError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-sm text-red-700">
          {getErrorMessage(toAppError(adminQuery.error), (key) => errorT(key))}
        </p>
      </div>
    );
  }

  if (isCreate) {
    const {
      register,
      handleSubmit,
      formState: {errors, isSubmitting},
      watch,
      setValue
    } = createForm;

    const isActive = watch('isActive');

    return (
      <form onSubmit={handleSubmit(handleCreateSubmit)} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <Input id="fullName" label={t('fullName')} {...register('fullName')} error={errors.fullName ? t('fullNameRequired') : undefined} />
          <Input id="email" type="email" label={t('email')} {...register('email')} error={errors.email ? t('invalidEmail') : undefined} />
        </div>

        <Input id="password" type="password" label={t('password')} {...register('password')} error={errors.password ? t('passwordTooShort') : undefined} />

        <Select
          id="isActive"
          label={t('status')}
          value={String(isActive)}
          onChange={(event) => setValue('isActive', event.target.value === 'true')}
          options={[
            {value: 'true', label: t('statusActive')},
            {value: 'false', label: t('statusInactive')}
          ]}
        />

        {serverError ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div> : null}
        {successMessage ? <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{successMessage}</div> : null}

        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.replace(`/${locale}/admin/users`)}>
            {common('cancel')}
          </Button>
          <Button type="submit" isLoading={isSubmitting || mutation.isPending} loadingText={common('loading')}>
            {t('createAdmin')}
          </Button>
        </div>
      </form>
    );
  }

  const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting},
    watch,
    setValue
  } = editForm;

  return (
    <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <Input id="fullName" label={t('fullName')} {...register('fullName')} error={errors.fullName ? t('fullNameRequired') : undefined} />
        <Input id="email" type="email" label={t('email')} {...register('email')} error={errors.email ? t('invalidEmail') : undefined} />
      </div>

      <Select
        id="role"
        label={t('role')}
        value={watch('role')}
        onChange={(event) => setValue('role', event.target.value as 'ADMIN' | 'SUPER_ADMIN')}
        options={roleOptions}
      />

      {serverError ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div> : null}
      {successMessage ? <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{successMessage}</div> : null}

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.replace(`/${locale}/admin/users`)}>
          {common('cancel')}
        </Button>
        <Button type="submit" isLoading={isSubmitting || mutation.isPending} loadingText={common('loading')}>
          {t('saveChanges')}
        </Button>
      </div>
    </form>
  );
}
