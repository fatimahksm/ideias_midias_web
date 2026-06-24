'use client';

import dynamic from 'next/dynamic';
import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation, useQuery} from '@tanstack/react-query';
import {useTranslations} from 'next-intl';
import {useEffect, useMemo, useState, type ReactNode} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {SettingsCard} from '@/components/common/settings-card';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {MediaUploadField} from '@/features/media-library/components/media-upload-field';
import {siteSettingsSchema, type SiteSettingsFormValues} from '../schema';
import {getAdminSiteSettings, updateAdminSiteSettings} from '../api';
import type {SiteSettingsPayload, SiteSettingsResponse} from '../types';

const MapPickerField = dynamic(
  () => import('@/components/common/map-picker-field'),
  {ssr: false}
);

function emptyToNull(value?: string | null) {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

type BilingualFieldGroupProps = {
  title: string;
  description?: string;
  required?: boolean;
  requiredLabel?: string;
  ptCode?: string;
  enCode?: string;
  ptLabel: string;
  enLabel: string;
  copyPtToEnLabel?: string;
  copyEnToPtLabel?: string;
  ptField: ReactNode;
  enField: ReactNode;
  onCopyPtToEn?: () => void;
  onCopyEnToPt?: () => void;
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
  required,
  requiredLabel,
  ptCode = 'PT',
  enCode = 'EN',
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
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-900">{title}</h4>

            {required && requiredLabel ? (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                {requiredLabel}
              </span>
            ) : null}
          </div>

          {description ? (
            <p className="max-w-2xl text-xs leading-5 text-slate-500">
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {onCopyPtToEn && copyPtToEnLabel ? (
            <CopyButton onClick={onCopyPtToEn}>{copyPtToEnLabel}</CopyButton>
          ) : null}

          {onCopyEnToPt && copyEnToPtLabel ? (
            <CopyButton onClick={onCopyEnToPt}>{copyEnToPtLabel}</CopyButton>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
          <div className="mb-3">
            <LanguageBadge code={ptCode} label={ptLabel} tone="emerald" />
          </div>
          {ptField}
        </div>

        <div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm">
          <div className="mb-3">
            <LanguageBadge code={enCode} label={enLabel} tone="blue" />
          </div>
          {enField}
        </div>
      </div>
    </div>
  );
}

function SectionNote({children}: {children: ReactNode}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
      {children}
    </div>
  );
}

export default function SiteSettingsForm() {
  const t = useTranslations('SiteSettingsForm');
  const sectionsT = useTranslations('SiteSettingsSections');
  const common = useTranslations('Common');
  const errorT = useTranslations('CommonErrors');

  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const backgroundOptions = useMemo(
    () => [
      {value: 'IMAGE', label: t('backgroundTypeImage')},
      {value: 'VIDEO', label: t('backgroundTypeVideo')}
    ],
    [t]
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: {errors, isSubmitting}
  } = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      companyNamePt: '',
      companyNameEn: '',
      shortIntroPt: '',
      shortIntroEn: '',
      heroTitlePt: '',
      heroTitleEn: '',
      heroSubtitlePt: '',
      heroSubtitleEn: '',
      logoUrl: '',
      heroBackgroundType: 'IMAGE',
      heroBackgroundUrl: '',
      companyVideoUrl: '',
      addressPt: '',
      addressEn: '',
      mapEmbedUrl: '',
      locationLat: undefined,
      locationLng: undefined
    }
  });

  const heroBackgroundType = watch('heroBackgroundType');
  const locationLat = watch('locationLat');
  const locationLng = watch('locationLng');

  const siteSettingsQuery = useQuery<SiteSettingsResponse, Error>({
    queryKey: ['admin-site-settings'],
    queryFn: getAdminSiteSettings
  });

  const updateMutation = useMutation<
    SiteSettingsResponse,
    Error,
    SiteSettingsPayload
  >({
    mutationFn: updateAdminSiteSettings
  });

  useEffect(() => {
    if (!siteSettingsQuery.data) return;

    reset({
      companyNamePt: siteSettingsQuery.data.companyNamePt ?? '',
      companyNameEn: siteSettingsQuery.data.companyNameEn ?? '',
      shortIntroPt: siteSettingsQuery.data.shortIntroPt ?? '',
      shortIntroEn: siteSettingsQuery.data.shortIntroEn ?? '',
      heroTitlePt: siteSettingsQuery.data.heroTitlePt ?? '',
      heroTitleEn: siteSettingsQuery.data.heroTitleEn ?? '',
      heroSubtitlePt: siteSettingsQuery.data.heroSubtitlePt ?? '',
      heroSubtitleEn: siteSettingsQuery.data.heroSubtitleEn ?? '',
      logoUrl: siteSettingsQuery.data.logoUrl ?? '',
      heroBackgroundType: siteSettingsQuery.data.heroBackgroundType ?? 'IMAGE',
      heroBackgroundUrl: siteSettingsQuery.data.heroBackgroundUrl ?? '',
      companyVideoUrl: siteSettingsQuery.data.companyVideoUrl ?? '',
      addressPt: siteSettingsQuery.data.addressPt ?? '',
      addressEn: siteSettingsQuery.data.addressEn ?? '',
      mapEmbedUrl: siteSettingsQuery.data.mapEmbedUrl ?? '',
      locationLat: siteSettingsQuery.data.locationLat ?? undefined,
      locationLng: siteSettingsQuery.data.locationLng ?? undefined
    });
  }, [reset, siteSettingsQuery.data]);

  async function onSubmit(values: SiteSettingsFormValues) {
    setServerError('');
    setSuccessMessage('');

    const payload: SiteSettingsPayload = {
      companyNamePt: values.companyNamePt.trim(),
      companyNameEn: values.companyNameEn.trim(),
      shortIntroPt: emptyToNull(values.shortIntroPt),
      shortIntroEn: emptyToNull(values.shortIntroEn),
      heroTitlePt: emptyToNull(values.heroTitlePt),
      heroTitleEn: emptyToNull(values.heroTitleEn),
      heroSubtitlePt: emptyToNull(values.heroSubtitlePt),
      heroSubtitleEn: emptyToNull(values.heroSubtitleEn),
      logoUrl: emptyToNull(values.logoUrl),
      heroBackgroundType: values.heroBackgroundType,
      heroBackgroundUrl: emptyToNull(values.heroBackgroundUrl),
      companyVideoUrl: emptyToNull(values.companyVideoUrl),
      addressPt: emptyToNull(values.addressPt),
      addressEn: emptyToNull(values.addressEn),
      mapEmbedUrl: emptyToNull(values.mapEmbedUrl),
      locationLat: values.locationLat ?? null,
      locationLng: values.locationLng ?? null
    };

    try {
      await updateMutation.mutateAsync(payload);
      setSuccessMessage(t('saveSuccess'));
      await siteSettingsQuery.refetch();
    } catch (error) {
      const appError = toAppError(error);
      setServerError(getErrorMessage(appError, (key) => errorT(key)));
    }
  }

  if (siteSettingsQuery.isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">{common('loading')}</p>
      </div>
    );
  }

  if (siteSettingsQuery.isError) {
    const appError = toAppError(siteSettingsQuery.error);

    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-sm text-red-700">
          {getErrorMessage(appError, (key) => errorT(key))}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <SettingsCard
        title={sectionsT('identityTitle')}
        description={sectionsT('identityDescription')}
      >
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-4">
            <SectionNote>{t('identityNote')}</SectionNote>

            <BilingualFieldGroup
              title={t('companyNameGroupTitle')}
              description={t('companyNameGroupDescription')}
              required
              requiredLabel={t('bilingualRequired')}
              ptCode={t('ptCode')}
              enCode={t('enCode')}
              ptLabel={t('ptLabel')}
              enLabel={t('enLabel')}
              copyPtToEnLabel={t('copyPtToEn')}
              copyEnToPtLabel={t('copyEnToPt')}
              ptField={
                <Input
                  id="companyNamePt"
                  label={t('companyNamePt')}
                  placeholder={t('companyNamePtPlaceholder')}
                  error={
                    errors.companyNamePt?.message
                      ? t('companyNamePtRequired')
                      : undefined
                  }
                  {...register('companyNamePt')}
                />
              }
              enField={
                <Input
                  id="companyNameEn"
                  label={t('companyNameEn')}
                  placeholder={t('companyNameEnPlaceholder')}
                  error={
                    errors.companyNameEn?.message
                      ? t('companyNameEnRequired')
                      : undefined
                  }
                  {...register('companyNameEn')}
                />
              }
              onCopyPtToEn={() =>
                setValue('companyNameEn', getValues('companyNamePt'), {
                  shouldDirty: true,
                  shouldValidate: true
                })
              }
              onCopyEnToPt={() =>
                setValue('companyNamePt', getValues('companyNameEn'), {
                  shouldDirty: true,
                  shouldValidate: true
                })
              }
            />

            <BilingualFieldGroup
              title={t('shortIntroGroupTitle')}
              description={t('shortIntroGroupDescription')}
              ptCode={t('ptCode')}
              enCode={t('enCode')}
              ptLabel={t('ptLabel')}
              enLabel={t('enLabel')}
              copyPtToEnLabel={t('copyPtToEn')}
              copyEnToPtLabel={t('copyEnToPt')}
              ptField={
                <Textarea
                  id="shortIntroPt"
                  label={t('shortIntroPt')}
                  placeholder={t('shortIntroPtPlaceholder')}
                  error={
                    errors.shortIntroPt?.message ? t('textTooLong') : undefined
                  }
                  {...register('shortIntroPt')}
                />
              }
              enField={
                <Textarea
                  id="shortIntroEn"
                  label={t('shortIntroEn')}
                  placeholder={t('shortIntroEnPlaceholder')}
                  error={
                    errors.shortIntroEn?.message ? t('textTooLong') : undefined
                  }
                  {...register('shortIntroEn')}
                />
              }
              onCopyPtToEn={() =>
                setValue('shortIntroEn', getValues('shortIntroPt'), {
                  shouldDirty: true,
                  shouldValidate: true
                })
              }
              onCopyEnToPt={() =>
                setValue('shortIntroPt', getValues('shortIntroEn'), {
                  shouldDirty: true,
                  shouldValidate: true
                })
              }
            />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
            <Controller
              control={control}
              name="logoUrl"
              render={({field}) => (
                <MediaUploadField
  label={sectionsT('logoPreview')}
  value={field.value}
  type="IMAGE"
  onChange={field.onChange}
  cropAspect={1}
  cropShape="rect"
  hint={sectionsT('logoHint')}
/>
              )}
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title={sectionsT('heroTitle')}
        description={sectionsT('heroDescription')}
      >
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-4">
            <SectionNote>{t('heroNote')}</SectionNote>

            <BilingualFieldGroup
              title={t('heroTitleGroupTitle')}
              description={t('heroTitleGroupDescription')}
              ptCode={t('ptCode')}
              enCode={t('enCode')}
              ptLabel={t('ptLabel')}
              enLabel={t('enLabel')}
              copyPtToEnLabel={t('copyPtToEn')}
              copyEnToPtLabel={t('copyEnToPt')}
              ptField={
                <Input
                  id="heroTitlePt"
                  label={t('heroTitlePt')}
                  placeholder={t('heroTitlePtPlaceholder')}
                  error={
                    errors.heroTitlePt?.message ? t('textTooLong') : undefined
                  }
                  {...register('heroTitlePt')}
                />
              }
              enField={
                <Input
                  id="heroTitleEn"
                  label={t('heroTitleEn')}
                  placeholder={t('heroTitleEnPlaceholder')}
                  error={
                    errors.heroTitleEn?.message ? t('textTooLong') : undefined
                  }
                  {...register('heroTitleEn')}
                />
              }
              onCopyPtToEn={() =>
                setValue('heroTitleEn', getValues('heroTitlePt'), {
                  shouldDirty: true,
                  shouldValidate: true
                })
              }
              onCopyEnToPt={() =>
                setValue('heroTitlePt', getValues('heroTitleEn'), {
                  shouldDirty: true,
                  shouldValidate: true
                })
              }
            />

            <BilingualFieldGroup
              title={t('heroSubtitleGroupTitle')}
              description={t('heroSubtitleGroupDescription')}
              ptCode={t('ptCode')}
              enCode={t('enCode')}
              ptLabel={t('ptLabel')}
              enLabel={t('enLabel')}
              copyPtToEnLabel={t('copyPtToEn')}
              copyEnToPtLabel={t('copyEnToPt')}
              ptField={
                <Textarea
                  id="heroSubtitlePt"
                  label={t('heroSubtitlePt')}
                  placeholder={t('heroSubtitlePtPlaceholder')}
                  error={
                    errors.heroSubtitlePt?.message ? t('textTooLong') : undefined
                  }
                  {...register('heroSubtitlePt')}
                />
              }
              enField={
                <Textarea
                  id="heroSubtitleEn"
                  label={t('heroSubtitleEn')}
                  placeholder={t('heroSubtitleEnPlaceholder')}
                  error={
                    errors.heroSubtitleEn?.message ? t('textTooLong') : undefined
                  }
                  {...register('heroSubtitleEn')}
                />
              }
              onCopyPtToEn={() =>
                setValue('heroSubtitleEn', getValues('heroSubtitlePt'), {
                  shouldDirty: true,
                  shouldValidate: true
                })
              }
              onCopyEnToPt={() =>
                setValue('heroSubtitlePt', getValues('heroSubtitleEn'), {
                  shouldDirty: true,
                  shouldValidate: true
                })
              }
            />

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <Select
                id="heroBackgroundType"
                label={t('heroBackgroundType')}
                options={backgroundOptions}
                error={
                  errors.heroBackgroundType?.message
                    ? t('heroBackgroundTypeRequired')
                    : undefined
                }
                {...register('heroBackgroundType')}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
            <Controller
              control={control}
              name="heroBackgroundUrl"
              render={({field}) => (
              <MediaUploadField
  label={sectionsT('heroPreview')}
  value={field.value}
  type={heroBackgroundType === 'VIDEO' ? 'VIDEO' : 'IMAGE'}
  onChange={field.onChange}
  cropAspect={16 / 9}
  cropShape="rect"
  hint={sectionsT('heroHint')}
/>
              )}
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title={sectionsT('videoTitle')}
        description={sectionsT('videoDescription')}
      >
        <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
          <Controller
            control={control}
            name="companyVideoUrl"
            render={({field}) => (
              <MediaUploadField
                label={sectionsT('videoPreview')}
                value={field.value}
                type="VIDEO"
                onChange={field.onChange}
                hint={sectionsT('videoHint')}
              />
            )}
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title={sectionsT('locationTitle')}
        description={sectionsT('locationDescription')}
      >
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <SectionNote>{t('locationNote')}</SectionNote>

            <BilingualFieldGroup
              title={t('addressGroupTitle')}
              description={t('addressGroupDescription')}
              ptCode={t('ptCode')}
              enCode={t('enCode')}
              ptLabel={t('ptLabel')}
              enLabel={t('enLabel')}
              copyPtToEnLabel={t('copyPtToEn')}
              copyEnToPtLabel={t('copyEnToPt')}
              ptField={
                <Textarea
                  id="addressPt"
                  label={t('addressPt')}
                  placeholder={t('addressPtPlaceholder')}
                  {...register('addressPt')}
                />
              }
              enField={
                <Textarea
                  id="addressEn"
                  label={t('addressEn')}
                  placeholder={t('addressEnPlaceholder')}
                  {...register('addressEn')}
                />
              }
              onCopyPtToEn={() =>
                setValue('addressEn', getValues('addressPt'), {
                  shouldDirty: true,
                  shouldValidate: true
                })
              }
              onCopyEnToPt={() =>
                setValue('addressPt', getValues('addressEn'), {
                  shouldDirty: true,
                  shouldValidate: true
                })
              }
            />

            <input type="hidden" {...register('mapEmbedUrl')} />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <Input
                  id="locationLat"
                  type="number"
                  step="any"
                  label={t('locationLat')}
                  placeholder={t('locationLatPlaceholder')}
                  error={
                    errors.locationLat?.message ? t('invalidLatitude') : undefined
                  }
                  readOnly
                  {...register('locationLat', {
                    setValueAs: (value) =>
                      value === '' ? undefined : Number(value)
                  })}
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <Input
                  id="locationLng"
                  type="number"
                  step="any"
                  label={t('locationLng')}
                  placeholder={t('locationLngPlaceholder')}
                  error={
                    errors.locationLng?.message
                      ? t('invalidLongitude')
                      : undefined
                  }
                  readOnly
                  {...register('locationLng', {
                    setValueAs: (value) =>
                      value === '' ? undefined : Number(value)
                  })}
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
            <MapPickerField
              lat={locationLat ?? undefined}
              lng={locationLng ?? undefined}
              onChange={({lat, lng, address, mapUrl}) => {
                setValue('locationLat', lat, {
                  shouldDirty: true,
                  shouldValidate: true
                });

                setValue('locationLng', lng, {
                  shouldDirty: true,
                  shouldValidate: true
                });

                setValue('mapEmbedUrl', mapUrl, {
                  shouldDirty: true
                });

                if (address) {
                  setValue('addressPt', address, {
                    shouldDirty: true,
                    shouldValidate: true
                  });

                  setValue('addressEn', address, {
                    shouldDirty: true,
                    shouldValidate: true
                  });
                }
              }}
            />
          </div>
        </div>
      </SettingsCard>

      {serverError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
          {serverError}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-sm">
          {successMessage}
        </div>
      ) : null}

      <div className="sticky bottom-4 z-10">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-4 shadow-xl backdrop-blur md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">{t('saveBarHint')}</p>

          <Button
            type="submit"
            className="min-w-[180px] rounded-2xl shadow-lg"
            isLoading={isSubmitting || updateMutation.isPending}
            loadingText={common('loading')}
          >
            {t('save')}
          </Button>
        </div>
      </div>
    </form>
  );
}