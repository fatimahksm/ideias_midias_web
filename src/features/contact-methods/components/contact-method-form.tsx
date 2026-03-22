'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useLocale, useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {useEffect, useMemo, useState, type ReactNode} from 'react';
import {Controller, useForm} from 'react-hook-form';
import PhoneInput from 'react-phone-number-input';
import {Link} from '@/i18n/navigation';
import {SettingsCard} from '@/components/common/settings-card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select} from '@/components/ui/select';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {
  createContactMethod,
  getAllContactMethods,
  getContactMethodById,
  updateContactMethod
} from '../api';
import {
  contactMethodSchema,
  type ContactMethodFormValues
} from '../schema';
import type {
  ContactMethodPayload,
  ContactMethodType
} from '../types';
import {
  emptyToNull,
  getNextContactMethodSortOrder,
  detectSocialPlatform,
  getSuggestedSocialIcon
} from '../utils';
import {ContactMethodFormSidebar} from './contact-method-form-sidebar';
import {
  SOCIAL_PLATFORM_OPTIONS,
  getSuggestedIconForType,
  type SocialPlatformValue
} from '../contact-method-options';
import {ContactIconPicker} from './contact-icon-picker';

type Props = {
  mode: 'create' | 'edit';
  methodId?: number;
};

type BilingualFieldGroupProps = {
  title: string;
  description?: string;
  ptLabel: string;
  enLabel: string;
  copyPtToEnLabel: string;
  copyEnToPtLabel: string;
  ptField: ReactNode;
  enField: ReactNode;
  onCopyPtToEn: () => void;
  onCopyEnToPt: () => void;
};

function LanguageBadge({
  code,
  label,
  tone
}: {
  code: string;
  label: string;
  tone: 'emerald' | 'blue';
}) {
  const toneClasses =
    tone === 'emerald'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : 'border-blue-200 bg-blue-50 text-blue-700';

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClasses}`}
    >
      <span className="rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] font-bold tracking-wide">
        {code}
      </span>
      {label}
    </span>
  );
}

function CopyButton({
  children,
  onClick
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </button>
  );
}

function BilingualFieldGroup({
  title,
  description,
  ptLabel,
  enLabel,
  copyPtToEnLabel,
  copyEnToPtLabel,
  ptField,
  enField,
  onCopyPtToEn,
  onCopyEnToPt
}: BilingualFieldGroupProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
          {description ? (
            <p className="max-w-2xl text-xs leading-5 text-slate-500">
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <CopyButton onClick={onCopyPtToEn}>{copyPtToEnLabel}</CopyButton>
          <CopyButton onClick={onCopyEnToPt}>{copyEnToPtLabel}</CopyButton>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
          <div className="mb-3">
            <LanguageBadge code="PT" label={ptLabel} tone="emerald" />
          </div>
          {ptField}
        </div>

        <div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm">
          <div className="mb-3">
            <LanguageBadge code="EN" label={enLabel} tone="blue" />
          </div>
          {enField}
        </div>
      </div>
    </div>
  );
}

export default function ContactMethodForm({mode, methodId}: Props) {
  const t = useTranslations('ContactMethodForm');
  const common = useTranslations('Common');
  const commonTypes = useTranslations('ContactMethodsCommon');
  const errorT = useTranslations('CommonErrors');
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('LB');
  const [socialPlatform, setSocialPlatform] =
    useState<SocialPlatformValue>('instagram');

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: {errors, isSubmitting, touchedFields}
  } = useForm<ContactMethodFormValues>({
    resolver: zodResolver(contactMethodSchema),
    defaultValues: {
      type: 'PHONE',
      labelPt: '',
      labelEn: '',
      value: '',
      iconName: '',
      sortOrder: 0,
      isActive: true
    }
  });

  const methodsQuery = useQuery({
    queryKey: ['contact-methods', 'all'],
    queryFn: getAllContactMethods
  });

  const methodQuery = useQuery({
    queryKey: ['contact-methods', methodId],
    queryFn: () => getContactMethodById(methodId as number),
    enabled: mode === 'edit' && Boolean(methodId)
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: ContactMethodPayload) => {
      if (mode === 'edit' && methodId) {
        return updateContactMethod(methodId, payload);
      }

      return createContactMethod(payload);
    },
    onSuccess: async (savedMethod) => {
      setServerError('');
      setSuccessMessage(
        mode === 'edit' ? t('saveSuccess') : t('createSuccess')
      );

      await queryClient.invalidateQueries({queryKey: ['contact-methods']});

      if (mode === 'create') {
        router.replace(`/${locale}/admin/contact-methods/${savedMethod.id}/edit`);
        return;
      }

      reset({
        type: savedMethod.type,
        labelPt: savedMethod.labelPt,
        labelEn: savedMethod.labelEn,
        value: savedMethod.value,
        iconName: savedMethod.iconName ?? '',
        sortOrder: savedMethod.sortOrder,
        isActive: savedMethod.isActive
      });

      if (savedMethod.type === 'SOCIAL') {
        setSocialPlatform(detectSocialPlatform(savedMethod.value));
      }
    },
    onError: (error) => {
      setSuccessMessage('');
      setServerError(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  useEffect(() => {
    if (!methodQuery.data) return;

    const method = methodQuery.data;

    reset({
      type: method.type,
      labelPt: method.labelPt,
      labelEn: method.labelEn,
      value: method.value,
      iconName: method.iconName ?? '',
      sortOrder: method.sortOrder,
      isActive: method.isActive
    });

    if (method.type === 'SOCIAL') {
      setSocialPlatform(detectSocialPlatform(method.value));
    }
  }, [methodQuery.data, reset]);

  useEffect(() => {
    if (mode !== 'create') return;
    if (!methodsQuery.data?.length) return;
    if (touchedFields.sortOrder) return;
    if ((getValues('sortOrder') || 0) > 0) return;

    setValue('sortOrder', getNextContactMethodSortOrder(methodsQuery.data), {
      shouldValidate: true
    });
  }, [mode, methodsQuery.data, touchedFields.sortOrder, getValues, setValue]);

  const watchedValues = watch();
  const watchedType = watch('type');

  useEffect(() => {
    if (touchedFields.iconName) return;
    if (getValues('iconName')) return;

    if (watchedType === 'SOCIAL') {
      setValue('iconName', getSuggestedSocialIcon(socialPlatform), {
        shouldDirty: true
      });
      return;
    }

    setValue('iconName', getSuggestedIconForType(watchedType), {
      shouldDirty: true
    });
  }, [
    watchedType,
    socialPlatform,
    touchedFields.iconName,
    getValues,
    setValue
  ]);

  const typeOptions = useMemo(
    () => [
      {value: 'PHONE', label: commonTypes('types.PHONE.label')},
      {value: 'WHATSAPP', label: commonTypes('types.WHATSAPP.label')},
      {value: 'EMAIL', label: commonTypes('types.EMAIL.label')},
      {value: 'SOCIAL', label: commonTypes('types.SOCIAL.label')}
    ],
    [commonTypes]
  );

  const socialPlatformOptions = useMemo(
    () =>
      SOCIAL_PLATFORM_OPTIONS.map((platform) => ({
        value: platform.value,
        label: t(platform.labelKey as never)
      })),
    [t]
  );

  const fieldErrors = useMemo(
    () => ({
      type: errors.type?.message ? t(errors.type.message as never) : undefined,
      labelPt: errors.labelPt?.message
        ? t(errors.labelPt.message as never)
        : undefined,
      labelEn: errors.labelEn?.message
        ? t(errors.labelEn.message as never)
        : undefined,
      value: errors.value?.message
        ? t(errors.value.message as never)
        : undefined,
      iconName: errors.iconName?.message
        ? t(errors.iconName.message as never)
        : undefined,
      sortOrder: errors.sortOrder?.message
        ? t(errors.sortOrder.message as never)
        : undefined
    }),
    [errors, t]
  );

  if (mode === 'edit' && methodQuery.isPending) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">{common('loading')}</p>
      </div>
    );
  }

  if (mode === 'edit' && methodQuery.isError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-sm text-red-700">
          {getErrorMessage(toAppError(methodQuery.error), (key) => errorT(key))}
        </p>
      </div>
    );
  }

  async function onSubmit(values: ContactMethodFormValues) {
    setServerError('');
    setSuccessMessage('');

    const payload: ContactMethodPayload = {
      type: values.type,
      labelPt: values.labelPt.trim(),
      labelEn: values.labelEn.trim(),
      value: values.value.trim(),
      iconName: emptyToNull(values.iconName),
      sortOrder: values.sortOrder,
      isActive: values.isActive
    };

    await saveMutation.mutateAsync(payload);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <SettingsCard
            title={t('typeCardTitle')}
            description={t('typeCardDescription')}
          >
            <div className="grid gap-5 lg:grid-cols-2">
              <Controller
                name="type"
                control={control}
                render={({field}) => (
                  <Select
                    id="type"
                    label={t('typeLabel')}
                    value={field.value}
                    onChange={(event) =>
                      field.onChange(event.target.value as ContactMethodType)
                    }
                    options={typeOptions}
                    error={fieldErrors.type}
                    hint={t(`typeHint.${field.value}` as never)}
                  />
                )}
              />

              <Controller
                name="iconName"
                control={control}
                render={({field}) => (
                  <ContactIconPicker
                    label={t('iconNameLabel')}
                    value={field.value}
                    onChange={field.onChange}
                    hint={t('iconDropdownHint')}
                    error={fieldErrors.iconName}
                  />
                )}
              />
            </div>
          </SettingsCard>

          <SettingsCard
            title={t('labelsCardTitle')}
            description={t('labelsCardDescription')}
          >
            <BilingualFieldGroup
              title={t('labelsGroupTitle')}
              description={t('labelsGroupDescription')}
              ptLabel={t('ptLabel')}
              enLabel={t('enLabel')}
              copyPtToEnLabel={t('copyPtToEn')}
              copyEnToPtLabel={t('copyEnToPt')}
              onCopyPtToEn={() =>
                setValue('labelEn', getValues('labelPt'), {shouldDirty: true})
              }
              onCopyEnToPt={() =>
                setValue('labelPt', getValues('labelEn'), {shouldDirty: true})
              }
              ptField={
                <Input
                  id="labelPt"
                  label={t('labelPtLabel')}
                  {...register('labelPt')}
                  error={fieldErrors.labelPt}
                  hint={t('labelPtHint')}
                />
              }
              enField={
                <Input
                  id="labelEn"
                  label={t('labelEnLabel')}
                  {...register('labelEn')}
                  error={fieldErrors.labelEn}
                  hint={t('labelEnHint')}
                />
              }
            />
          </SettingsCard>

          <SettingsCard
            title={t('valueCardTitle')}
            description={t('valueCardDescription')}
          >
            <div className="space-y-5">
              {watchedType === 'PHONE' || watchedType === 'WHATSAPP' ? (
                <Controller
                  name="value"
                  control={control}
                  render={({field}) => (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-900">
                        {t('phoneLibraryLabel')}
                      </label>
                      <PhoneInput
  country={selectedCountry}
  onCountryChange={(country) => setSelectedCountry(country || 'LB')}
  international
  withCountryCallingCode
  placeholder={t(`valuePlaceholder.${watchedType}` as never)}
  value={field.value || undefined}
  onChange={(value) => field.onChange(value || '')}
/>
                      <p className="text-xs text-slate-500">
                        {t(`valueHint.${watchedType}` as never)}
                      </p>
                      {fieldErrors.value ? (
                        <p className="text-sm text-red-600">{fieldErrors.value}</p>
                      ) : null}
                    </div>
                  )}
                />
              ) : watchedType === 'SOCIAL' ? (
                <>
                  <Select
                    id="socialPlatform"
                    label={t('socialPlatformLabel')}
                    value={socialPlatform}
                    onChange={(event) =>
                      setSocialPlatform(
                        event.target.value as SocialPlatformValue
                      )
                    }
                    options={socialPlatformOptions}
                    hint={t('socialPlatformHint')}
                  />

                  <Input
                    id="value"
                    label={t('valueLabel')}
                    {...register('value')}
                    error={fieldErrors.value}
                    hint={t(`valueHint.${watchedType}` as never)}
                    placeholder={t(
                      `valuePlaceholderByPlatform.${socialPlatform}` as never
                    )}
                  />
                </>
              ) : (
                <Input
                  id="value"
                  label={t('valueLabel')}
                  {...register('value')}
                  error={fieldErrors.value}
                  hint={t(`valueHint.${watchedType}` as never)}
                  placeholder={t(`valuePlaceholder.${watchedType}` as never)}
                />
              )}
            </div>
          </SettingsCard>

          <SettingsCard
            title={t('publishingCardTitle')}
            description={t('publishingCardDescription')}
          >
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="mb-3 text-sm font-semibold text-slate-900">
                  {t('publishingStatusTitle')}
                </p>

                <Controller
                  name="isActive"
                  control={control}
                  render={({field}) => (
                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        variant={field.value ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => field.onChange(true)}
                      >
                        {t('statusActive')}
                      </Button>

                      <Button
                        type="button"
                        variant={!field.value ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => field.onChange(false)}
                      >
                        {t('statusInactive')}
                      </Button>
                    </div>
                  )}
                />

                <p className="mt-3 text-sm text-slate-500">
                  {t('publishingStatusHint')}
                </p>
              </div>

              <Input
                id="sortOrder"
                type="number"
                label={t('sortOrderLabel')}
                {...register('sortOrder', {valueAsNumber: true})}
                error={fieldErrors.sortOrder}
                hint={t('sortOrderHint')}
                min={0}
              />
            </div>
          </SettingsCard>

          {serverError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/admin/contact-methods">
              <Button type="button" variant="ghost">
                {t('backToMethods')}
              </Button>
            </Link>

            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                isLoading={isSubmitting || saveMutation.isPending}
                loadingText={common('loading')}
              >
                {mode === 'edit' ? t('saveButton') : t('createButton')}
              </Button>
            </div>
          </div>
        </div>

        <ContactMethodFormSidebar
          values={watchedValues}
          selectedPlatform={socialPlatform}
        />
      </div>
    </form>
  );
}