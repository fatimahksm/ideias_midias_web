'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation, useQuery} from '@tanstack/react-query';
import {useLocale, useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {useEffect, useMemo} from 'react';
import {useForm} from 'react-hook-form';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select} from '@/components/ui/select';
import {toAppError} from '@/lib/api/client';
import {z} from 'zod';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {useToast} from '@/components/common/toast-provider';
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

  const {showSuccess, showError} = useToast();

  const isCreate = props.mode === 'create';
  const isEditMode = props.mode === 'edit' && typeof props.adminId === 'number';

  const adminQuery = useQuery({
    queryKey: ['admin-users', 'single', isEditMode ? props.adminId : 'new'],
    queryFn: async () => {
      if (!isEditMode) {
        throw new Error('Admin user id is required in edit mode.');
      }

      return getAdminUserById(props.adminId);
    },
    enabled: isEditMode,
    retry: false
  });

 const createForm = useForm<
  z.input<typeof createAdminUserSchema>,
  unknown,
  CreateAdminUserFormValues
>({
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
    if (!isEditMode || !adminQuery.data) {
      return;
    }

    editForm.reset({
      fullName: adminQuery.data.fullName,
      email: adminQuery.data.email,
      role: adminQuery.data.role
    });
  }, [adminQuery.data, editForm, isEditMode]);

  const mutation = useMutation({
    mutationFn: async (values: CreateAdminUserFormValues | UpdateAdminUserFormValues) => {
      if (isCreate) {
        return createAdminUser(values as CreateAdminUserFormValues);
      }

      if (!isEditMode) {
        throw new Error('Admin user id is required in edit mode.');
      }

      return updateAdminUser(props.adminId, values as UpdateAdminUserFormValues);
    },
    onSuccess: () => {
      showSuccess(isCreate ? t('createSuccess') : t('updateSuccess'));
      router.replace(`/${locale}/admin/users`);
    },
    onError: (error) => {
      showError(getErrorMessage(toAppError(error), (key) => errorT(key)));
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
    await mutation.mutateAsync(values);
  }

  async function handleEditSubmit(values: UpdateAdminUserFormValues) {
    await mutation.mutateAsync(values);
  }

  if (isEditMode && adminQuery.isPending) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">{t('loading')}</p>
      </div>
    );
  }

  if (isEditMode && adminQuery.isError) {
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
      <form
        onSubmit={handleSubmit(handleCreateSubmit)}
        className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            id="fullName"
            label={t('fullName')}
            {...register('fullName')}
            error={errors.fullName ? t('fullNameRequired') : undefined}
          />
          <Input
            id="email"
            type="email"
            label={t('email')}
            {...register('email')}
            error={errors.email ? t('invalidEmail') : undefined}
          />
        </div>

        <Input
          id="password"
          type="password"
          label={t('password')}
          {...register('password')}
          error={errors.password ? t('passwordTooShort') : undefined}
        />

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

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.replace(`/${locale}/admin/users`)}
          >
            {common('cancel')}
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting || mutation.isPending}
            loadingText={common('loading')}
          >
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
    <form
      onSubmit={handleSubmit(handleEditSubmit)}
      className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          id="fullName"
          label={t('fullName')}
          {...register('fullName')}
          error={errors.fullName ? t('fullNameRequired') : undefined}
        />
        <Input
          id="email"
          type="email"
          label={t('email')}
          {...register('email')}
          error={errors.email ? t('invalidEmail') : undefined}
        />
      </div>

      <Select
        id="role"
        label={t('role')}
        value={watch('role')}
        onChange={(event) =>
          setValue('role', event.target.value as 'ADMIN' | 'SUPER_ADMIN')
        }
        options={roleOptions}
      />

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.replace(`/${locale}/admin/users`)}
        >
          {common('cancel')}
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting || mutation.isPending}
          loadingText={common('loading')}
        >
          {t('saveChanges')}
        </Button>
      </div>
    </form>
  );
}