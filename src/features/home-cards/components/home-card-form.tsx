'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useLocale, useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {useEffect, useMemo, useState, type ReactNode} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Link} from '@/i18n/navigation';
import {SettingsCard} from '@/components/common/settings-card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {MediaUploadField} from '@/features/media-library/components/media-upload-field';
import {getAllSections} from '@/features/sections/api';
import type {SectionResponse} from '@/features/sections/types';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {
  createHomeCard,
  getAllHomeCards,
  getHomeCardById,
  updateHomeCard
} from '../api';
import {homeCardSchema, type HomeCardFormValues} from '../schema';
import type {HomeCardPayload} from '../types';
import {emptyToNull, getNextHomeCardSortOrder} from '../utils';
import {HomeCardFormSidebar} from './home-card-form-sidebar';

type Props = {
  mode: 'create' | 'edit';
  cardId?: number;
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

export default function HomeCardForm({mode, cardId}: Props) {
  const t = useTranslations('HomeCardForm');
  const common = useTranslations('Common');
  const errorT = useTranslations('CommonErrors');
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: {errors, isSubmitting, touchedFields}
  } = useForm<HomeCardFormValues>({
    resolver: zodResolver(homeCardSchema),
    defaultValues: {
      sectionId: 0,
      titlePt: '',
      titleEn: '',
      shortDescriptionPt: '',
      shortDescriptionEn: '',
      imageUrl: '',
      iconName: '',
      sortOrder: 0,
      isActive: true
    }
  });

  const sectionsQuery = useQuery({
    queryKey: ['sections', 'all'],
    queryFn: getAllSections
  });

  const cardsQuery = useQuery({
    queryKey: ['home-cards', 'all'],
    queryFn: getAllHomeCards
  });

  const cardQuery = useQuery({
    queryKey: ['home-cards', cardId],
    queryFn: () => getHomeCardById(cardId as number),
    enabled: mode === 'edit' && Boolean(cardId)
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: HomeCardPayload) => {
      if (mode === 'edit' && cardId) {
        return updateHomeCard(cardId, payload);
      }

      return createHomeCard(payload);
    },
    onSuccess: async (savedCard) => {
      setServerError('');
      setSuccessMessage(mode === 'edit' ? t('saveSuccess') : t('createSuccess'));

      await queryClient.invalidateQueries({queryKey: ['home-cards']});

      if (mode === 'create') {
        router.replace(`/${locale}/admin/home-cards/${savedCard.id}/edit`);
        return;
      }

      reset({
        sectionId: savedCard.sectionId,
        titlePt: savedCard.titlePt,
        titleEn: savedCard.titleEn,
        shortDescriptionPt: savedCard.shortDescriptionPt ?? '',
        shortDescriptionEn: savedCard.shortDescriptionEn ?? '',
        imageUrl: savedCard.imageUrl ?? '',
        iconName: savedCard.iconName ?? '',
        sortOrder: savedCard.sortOrder,
        isActive: savedCard.isActive
      });
    },
    onError: (error) => {
      setSuccessMessage('');
      setServerError(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  useEffect(() => {
    if (!cardQuery.data) return;

    const card = cardQuery.data;

    reset({
      sectionId: card.sectionId,
      titlePt: card.titlePt,
      titleEn: card.titleEn,
      shortDescriptionPt: card.shortDescriptionPt ?? '',
      shortDescriptionEn: card.shortDescriptionEn ?? '',
      imageUrl: card.imageUrl ?? '',
      iconName: card.iconName ?? '',
      sortOrder: card.sortOrder,
      isActive: card.isActive
    });
  }, [cardQuery.data, reset]);

  useEffect(() => {
    if (mode !== 'create') return;
    if (!cardsQuery.data?.length) return;
    if (touchedFields.sortOrder) return;
    if ((getValues('sortOrder') || 0) > 0) return;

    setValue('sortOrder', getNextHomeCardSortOrder(cardsQuery.data), {
      shouldValidate: true
    });
  }, [mode, cardsQuery.data, touchedFields.sortOrder, getValues, setValue]);

  const watchedValues = watch();
  const linkedSection = useMemo(() => {
    return sectionsQuery.data?.find((section) => section.id === watchedValues.sectionId);
  }, [sectionsQuery.data, watchedValues.sectionId]);

  useEffect(() => {
    if (mode !== 'create') return;
    if (!linkedSection) return;

    if (!touchedFields.titleEn && !getValues('titleEn')) {
      setValue('titleEn', linkedSection.nameEn, {shouldDirty: true});
    }

    if (!touchedFields.titlePt && !getValues('titlePt')) {
      setValue('titlePt', linkedSection.namePt, {shouldDirty: true});
    }
  }, [mode, linkedSection, touchedFields.titleEn, touchedFields.titlePt, getValues, setValue]);

  const sectionOptions = useMemo(
    () =>
      (sectionsQuery.data ?? [])
        .filter((section) => section.isActive)
        .sort((a: SectionResponse, b: SectionResponse) => a.sortOrder - b.sortOrder)
        .map((section) => ({
          value: String(section.id),
          label: `${section.nameEn} (${section.slug})`
        })),
    [sectionsQuery.data]
  );

  const fieldErrors = useMemo(
    () => ({
      sectionId: errors.sectionId?.message
        ? t(errors.sectionId.message as never)
        : undefined,
      titlePt: errors.titlePt?.message
        ? t(errors.titlePt.message as never)
        : undefined,
      titleEn: errors.titleEn?.message
        ? t(errors.titleEn.message as never)
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

  if (mode === 'edit' && cardQuery.isPending) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">{common('loading')}</p>
      </div>
    );
  }

  if (mode === 'edit' && cardQuery.isError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-sm text-red-700">
          {getErrorMessage(toAppError(cardQuery.error), (key) => errorT(key))}
        </p>
      </div>
    );
  }

  async function onSubmit(values: HomeCardFormValues) {
    setServerError('');
    setSuccessMessage('');

    const payload: HomeCardPayload = {
      sectionId: values.sectionId,
      titlePt: values.titlePt.trim(),
      titleEn: values.titleEn.trim(),
      shortDescriptionPt: emptyToNull(values.shortDescriptionPt),
      shortDescriptionEn: emptyToNull(values.shortDescriptionEn),
      imageUrl: emptyToNull(values.imageUrl),
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
            title={t('linkCardTitle')}
            description={t('linkCardDescription')}
          >
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
              <Controller
                name="sectionId"
                control={control}
                render={({field}) => (
                  <Select
                    id="sectionId"
                    label={t('sectionLabel')}
                    value={String(field.value || '')}
                    onChange={(event) =>
                      field.onChange(Number(event.target.value))
                    }
                    options={[
                      {value: '', label: t('sectionPlaceholder')},
                      ...sectionOptions
                    ]}
                    error={fieldErrors.sectionId}
                    hint={t('sectionHint')}
                  />
                )}
              />

              <Input
                id="iconName"
                label={t('iconNameLabel')}
                {...register('iconName')}
                error={fieldErrors.iconName}
                hint={t('iconNameHint')}
              />
            </div>
          </SettingsCard>

          <SettingsCard
            title={t('contentCardTitle')}
            description={t('contentCardDescription')}
          >
            <BilingualFieldGroup
              title={t('titlesGroupTitle')}
              description={t('titlesGroupDescription')}
              ptLabel={t('ptLabel')}
              enLabel={t('enLabel')}
              copyPtToEnLabel={t('copyPtToEn')}
              copyEnToPtLabel={t('copyEnToPt')}
              onCopyPtToEn={() =>
                setValue('titleEn', getValues('titlePt'), {shouldDirty: true})
              }
              onCopyEnToPt={() =>
                setValue('titlePt', getValues('titleEn'), {shouldDirty: true})
              }
              ptField={
                <Input
                  id="titlePt"
                  label={t('titlePtLabel')}
                  {...register('titlePt')}
                  error={fieldErrors.titlePt}
                  hint={t('titlePtHint')}
                />
              }
              enField={
                <Input
                  id="titleEn"
                  label={t('titleEnLabel')}
                  {...register('titleEn')}
                  error={fieldErrors.titleEn}
                  hint={t('titleEnHint')}
                />
              }
            />
          </SettingsCard>

          <SettingsCard
            title={t('descriptionCardTitle')}
            description={t('descriptionCardDescription')}
          >
            <BilingualFieldGroup
              title={t('descriptionGroupTitle')}
              description={t('descriptionGroupDescription')}
              ptLabel={t('ptLabel')}
              enLabel={t('enLabel')}
              copyPtToEnLabel={t('copyPtToEn')}
              copyEnToPtLabel={t('copyEnToPt')}
              onCopyPtToEn={() =>
                setValue('shortDescriptionEn', getValues('shortDescriptionPt'), {
                  shouldDirty: true
                })
              }
              onCopyEnToPt={() =>
                setValue('shortDescriptionPt', getValues('shortDescriptionEn'), {
                  shouldDirty: true
                })
              }
              ptField={
                <Textarea
                  id="shortDescriptionPt"
                  label={t('shortDescriptionPtLabel')}
                  {...register('shortDescriptionPt')}
                  hint={t('shortDescriptionPtHint')}
                />
              }
              enField={
                <Textarea
                  id="shortDescriptionEn"
                  label={t('shortDescriptionEnLabel')}
                  {...register('shortDescriptionEn')}
                  hint={t('shortDescriptionEnHint')}
                />
              }
            />
          </SettingsCard>

          <SettingsCard
            title={t('mediaCardTitle')}
            description={t('mediaCardDescription')}
          >
            <Controller
              name="imageUrl"
              control={control}
              render={({field}) => (
                <MediaUploadField
                  label={t('imageLabel')}
                  type="IMAGE"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
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
            <Link href="/admin/home-cards">
              <Button type="button" variant="ghost">
                {t('backToCards')}
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

        <HomeCardFormSidebar values={watchedValues} linkedSection={linkedSection} />
      </div>
    </form>
  );
}