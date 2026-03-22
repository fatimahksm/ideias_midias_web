'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation, useQuery} from '@tanstack/react-query';
import {useTranslations} from 'next-intl';
import {useEffect, useMemo, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {SettingsCard} from '@/components/common/settings-card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {applyThemeVariables} from '@/lib/theme/css-variables';
import {defaultTheme} from '@/lib/theme/default-theme';
import type {ThemeSettings} from '@/lib/theme/types';
import {
  getAdminThemeSettings,
  updateAdminThemeSettings
} from '../api';
import {
  themeSettingsSchema,
  type ThemeSettingsFormValues
} from '../schema';

type ColorFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
};

function ColorField({
  label,
  hint,
  error,
  value,
  onChange
}: ColorFieldProps) {
  const normalizedValue =
    /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value) ? value : '#000000';

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <input
          type="color"
          value={normalizedValue.slice(0, 7)}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
          aria-label={label}
        />

        <div className="min-w-0 flex-1">
          <Input
            label={label}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="#0f172a"
            error={error}
            hint={hint}
          />
        </div>
      </div>
    </div>
  );
}

function ThemePreview({
  values,
  t
}: {
  values: ThemeSettingsFormValues;
  t: ReturnType<typeof useTranslations<'ThemeSettingsForm'>>;
}) {
  const previewTheme = {
    ...defaultTheme,
    ...values
  };

  return (
    <div
      className="rounded-3xl border p-5 shadow-sm"
      style={{
        backgroundColor: previewTheme.backgroundColor,
        color: previewTheme.textColor,
        borderColor: previewTheme.secondaryColor
      }}
    >
      <div
        className="rounded-3xl p-6"
        style={{
          background: `linear-gradient(135deg, ${previewTheme.heroOverlayColor}, ${previewTheme.secondaryColor})`,
          color: '#ffffff'
        }}
      >
        <p className="mb-2 text-sm font-medium opacity-90">{t('previewBadge')}</p>
        <h3 className="text-2xl font-bold">{t('previewTitle')}</h3>
        <p className="mt-2 max-w-xl text-sm opacity-90">
          {t('previewDescription')}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-xl px-4 py-2 text-sm font-medium"
            style={{
              backgroundColor: previewTheme.primaryColor,
              color: '#ffffff'
            }}
          >
            {t('previewPrimaryButton')}
          </button>

          <button
            type="button"
            className="rounded-xl border px-4 py-2 text-sm font-medium"
            style={{
              borderColor: '#ffffff',
              color: '#ffffff',
              backgroundColor: 'transparent'
            }}
          >
            {t('previewSecondaryButton')}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[
          ['primaryColor', values.primaryColor],
          ['secondaryColor', values.secondaryColor],
          ['accentColor', values.accentColor],
          ['backgroundColor', values.backgroundColor],
          ['textColor', values.textColor],
          ['heroOverlayColor', values.heroOverlayColor]
        ].map(([key, value]) => (
          <div
            key={key}
            className="rounded-2xl border border-slate-200 bg-white p-3"
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {t(key as keyof ThemeSettingsFormValues)}
            </p>
            <div className="flex items-center gap-3">
              <span
                className="inline-block h-8 w-8 rounded-full border border-slate-200"
                style={{backgroundColor: value}}
              />
              <span className="text-sm text-slate-700">{value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ThemeSettingsForm() {
  const t = useTranslations('ThemeSettingsForm');
  const errorT = useTranslations('CommonErrors');
  const common = useTranslations('Common');

  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: {errors, isSubmitting}
  } = useForm<ThemeSettingsFormValues>({
    resolver: zodResolver(themeSettingsSchema),
    defaultValues: defaultTheme
  });

  const themeQuery = useQuery({
    queryKey: ['admin-theme-settings'],
    queryFn: getAdminThemeSettings
  });

  useEffect(() => {
    if (!themeQuery.data) return;

    reset({
      primaryColor: themeQuery.data.primaryColor || defaultTheme.primaryColor,
      secondaryColor:
        themeQuery.data.secondaryColor || defaultTheme.secondaryColor,
      accentColor: themeQuery.data.accentColor || defaultTheme.accentColor,
      backgroundColor:
        themeQuery.data.backgroundColor || defaultTheme.backgroundColor,
      textColor: themeQuery.data.textColor || defaultTheme.textColor,
      heroOverlayColor:
        themeQuery.data.heroOverlayColor || defaultTheme.heroOverlayColor
    });
  }, [reset, themeQuery.data]);

  const themeValues = watch();

  const saveMutation = useMutation({
    mutationFn: updateAdminThemeSettings,
    onSuccess: (savedTheme) => {
      setServerError('');
      setSuccessMessage(t('saveSuccess'));
      reset(savedTheme);
      applyThemeVariables({
        ...defaultTheme,
        ...savedTheme
      });
    },
    onError: (error) => {
      setSuccessMessage('');
      setServerError(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  const fieldErrors = useMemo(
    () => ({
      primaryColor: errors.primaryColor?.message
        ? t(errors.primaryColor.message as never)
        : undefined,
      secondaryColor: errors.secondaryColor?.message
        ? t(errors.secondaryColor.message as never)
        : undefined,
      accentColor: errors.accentColor?.message
        ? t(errors.accentColor.message as never)
        : undefined,
      backgroundColor: errors.backgroundColor?.message
        ? t(errors.backgroundColor.message as never)
        : undefined,
      textColor: errors.textColor?.message
        ? t(errors.textColor.message as never)
        : undefined,
      heroOverlayColor: errors.heroOverlayColor?.message
        ? t(errors.heroOverlayColor.message as never)
        : undefined
    }),
    [errors, t]
  );

  async function onSubmit(values: ThemeSettingsFormValues) {
    setServerError('');
    setSuccessMessage('');
    await saveMutation.mutateAsync(values as ThemeSettings);
  }

  if (themeQuery.isPending) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
        {common('loading')}
      </div>
    );
  }

  if (themeQuery.isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
        {getErrorMessage(toAppError(themeQuery.error), (key) => errorT(key))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <SettingsCard
        title={t('paletteCardTitle')}
        description={t('paletteCardDescription')}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name="primaryColor"
            control={control}
            render={({field}) => (
              <ColorField
                label={t('primaryColor')}
                hint={t('primaryColorHint')}
                error={fieldErrors.primaryColor}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="secondaryColor"
            control={control}
            render={({field}) => (
              <ColorField
                label={t('secondaryColor')}
                hint={t('secondaryColorHint')}
                error={fieldErrors.secondaryColor}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="accentColor"
            control={control}
            render={({field}) => (
              <ColorField
                label={t('accentColor')}
                hint={t('accentColorHint')}
                error={fieldErrors.accentColor}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="backgroundColor"
            control={control}
            render={({field}) => (
              <ColorField
                label={t('backgroundColor')}
                hint={t('backgroundColorHint')}
                error={fieldErrors.backgroundColor}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="textColor"
            control={control}
            render={({field}) => (
              <ColorField
                label={t('textColor')}
                hint={t('textColorHint')}
                error={fieldErrors.textColor}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="heroOverlayColor"
            control={control}
            render={({field}) => (
              <ColorField
                label={t('heroOverlayColor')}
                hint={t('heroOverlayColorHint')}
                error={fieldErrors.heroOverlayColor}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title={t('previewCardTitle')}
        description={t('previewCardDescription')}
      >
        <ThemePreview values={themeValues} t={t} />
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

      <div className="flex justify-end">
        <Button
          type="submit"
          isLoading={isSubmitting || saveMutation.isPending}
          loadingText={common('loading')}
        >
          {t('save')}
        </Button>
      </div>
    </form>
  );
}