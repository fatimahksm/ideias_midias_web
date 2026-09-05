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
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {useToast} from '@/components/common/toast-provider';
import {
  createSection,
  getAllSections,
  getSectionById,
  updateSection
} from '../api';
import {sectionSchema, type SectionFormValues} from '../schema';
import type {SectionPayload, SectionType} from '../types';
import {emptyToNull, getNextSortOrder, slugify} from '../utils';
import {SectionFormSidebar} from './section-form-sidebar';
import {FormStepNav} from '@/components/common/form-step-nav';
import {SectionNextActions} from './section-next-actions';
import {SectionTypeBadge} from './section-type-badge';
import {SectionTypePicker} from './section-type-picker';
import {CopyButton} from '@/components/common/copy-button';

type Props = {
  mode: 'create' | 'edit';
  sectionId?: number;
};

/** Which cards each edit step shows: content first, then publishing. */
const EDIT_STEP_CARDS = [[1, 2, 3], [4]];

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

function StudioNote({children}: {children: ReactNode}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
      {children}
    </div>
  );
}

export default function SectionForm({mode, sectionId}: Props) {
  const t = useTranslations('SectionForm');
  const common = useTranslations('Common');
  const errorT = useTranslations('CommonErrors');
  const commonSections = useTranslations('SectionsCommon');
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();

  const {showSuccess, showError} = useToast();
  const [autoSlug, setAutoSlug] = useState(mode === 'create');
  const [savedSectionId, setSavedSectionId] = useState<number | undefined>(
    sectionId
  );
  const [savedSectionType, setSavedSectionType] =
    useState<SectionType>('CONTENT');

  const isWizard = mode === 'create';

  // Creating walks card by card, starting at the type picker (card 0).
  // Editing collapses the same cards into two screens — everything about the
  // content, then everything about publishing — so there is less to click
  // through when you only came to change one thing.
  const [step, setStep] = useState(0);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    trigger,
    formState: {errors, isSubmitting, touchedFields}
  } = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      slug: '',
      namePt: '',
      nameEn: '',
      descriptionPt: '',
      descriptionEn: '',
      sectionType: 'CONTENT',
      coverImageUrl: '',
      coverVideoUrl: '',
      isActive: true,
      sortOrder: 0
    }
  });

  const sectionsQuery = useQuery({
    queryKey: ['sections', 'all'],
    queryFn: getAllSections
  });

  const sectionQuery = useQuery({
    queryKey: ['sections', sectionId],
    queryFn: () => getSectionById(sectionId as number),
    enabled: mode === 'edit' && Boolean(sectionId)
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: SectionPayload) => {
      if (mode === 'edit' && sectionId) {
        return updateSection(sectionId, payload);
      }

      return createSection(payload);
    },
    onSuccess: async (savedSection) => {
      showSuccess(mode === 'edit' ? t('saveSuccess') : t('createSuccess'));
      setSavedSectionId(savedSection.id);
      setSavedSectionType(savedSection.sectionType);

      await queryClient.invalidateQueries({queryKey: ['sections']});

      if (mode === 'create') {
        router.replace(`/${locale}/admin/sections/${savedSection.id}/edit`);
        return;
      }

      reset({
        slug: savedSection.slug,
        namePt: savedSection.namePt,
        nameEn: savedSection.nameEn,
        descriptionPt: savedSection.descriptionPt ?? '',
        descriptionEn: savedSection.descriptionEn ?? '',
        sectionType: savedSection.sectionType,
        coverImageUrl: savedSection.coverImageUrl ?? '',
        coverVideoUrl: savedSection.coverVideoUrl ?? '',
        isActive: savedSection.isActive,
        sortOrder: savedSection.sortOrder
      });
    },
    onError: (error) => {
      showError(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  useEffect(() => {
    if (!sectionQuery.data) return;

    const section = sectionQuery.data;

    reset({
      slug: section.slug,
      namePt: section.namePt,
      nameEn: section.nameEn,
      descriptionPt: section.descriptionPt ?? '',
      descriptionEn: section.descriptionEn ?? '',
      sectionType: section.sectionType,
      coverImageUrl: section.coverImageUrl ?? '',
      coverVideoUrl: section.coverVideoUrl ?? '',
      isActive: section.isActive,
      sortOrder: section.sortOrder
    });

    setSavedSectionId(section.id);
    setSavedSectionType(section.sectionType);
    setAutoSlug(false);
  }, [reset, sectionQuery.data]);

  useEffect(() => {
    if (mode !== 'create') return;
    if (!sectionsQuery.data?.length) return;
    if (touchedFields.sortOrder) return;
    if ((getValues('sortOrder') || 0) > 0) return;

    setValue('sortOrder', getNextSortOrder(sectionsQuery.data), {
      shouldValidate: true
    });
  }, [mode, sectionsQuery.data, touchedFields.sortOrder, getValues, setValue]);

  const watchedNameEn = watch('nameEn');
  const watchedValues = watch();

  useEffect(() => {
    if (!autoSlug) return;

    const generated = slugify(watchedNameEn || '');

    setValue('slug', generated, {
      shouldValidate: true,
      shouldDirty: true
    });
  }, [autoSlug, watchedNameEn, setValue]);

  const sectionTypeOptions = useMemo(
    () => [
      {value: 'CONTENT', label: commonSections('types.CONTENT.label')},
      {
        value: 'CATEGORY_ITEMS',
        label: commonSections('types.CATEGORY_ITEMS.label')
      },
      {
        value: 'DIRECT_ITEMS',
        label: commonSections('types.DIRECT_ITEMS.label')
      },
      {
        value: 'PORTFOLIO',
        label: commonSections('types.PORTFOLIO.label')
      }
    ],
    [commonSections]
  );

  const fieldErrors = useMemo(
    () => ({
      slug: errors.slug?.message ? t(errors.slug.message as never) : undefined,
      namePt: errors.namePt?.message
        ? t(errors.namePt.message as never)
        : undefined,
      nameEn: errors.nameEn?.message
        ? t(errors.nameEn.message as never)
        : undefined,
      sortOrder: errors.sortOrder?.message
        ? t(errors.sortOrder.message as never)
        : undefined,
      sectionType: errors.sectionType?.message
        ? t(errors.sectionType.message as never)
        : undefined
    }),
    [errors, t]
  );

  if (mode === 'edit' && sectionQuery.isPending) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">{common('loading')}</p>
      </div>
    );
  }

  if (mode === 'edit' && sectionQuery.isError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-sm text-red-700">
          {getErrorMessage(toAppError(sectionQuery.error), (key) => errorT(key))}
        </p>
      </div>
    );
  }

  function showCard(cardStep: number) {
    return isWizard
      ? step === cardStep
      : Boolean(EDIT_STEP_CARDS[step]?.includes(cardStep));
  }

  const navSteps = (
    isWizard
      ? [
          'stepTypeLabel',
          'stepBasicsLabel',
          'stepDescriptionLabel',
          'stepMediaLabel',
          'stepPublishLabel'
        ]
      : ['stepContentLabel', 'stepPublishLabel']
  ).map((key) => ({key, label: t(key as never)}));

  async function goToNextStep(fieldsToValidate: (keyof SectionFormValues)[]) {
    const valid = fieldsToValidate.length
      ? await trigger(fieldsToValidate)
      : true;

    if (valid) {
      setStep((current) => current + 1);
    }
  }

  if (isWizard && step === 0) {
    return (
      <div className="space-y-6">
        <div>
          <Link href="/admin/sections">
            <Button type="button" variant="ghost">
              {t('backToSections')}
            </Button>
          </Link>
        </div>

        <SectionTypePicker
          onSelect={(type) => {
            setValue('sectionType', type, {shouldValidate: true});
            setStep(1);
          }}
        />
      </div>
    );
  }

  async function onSubmit(values: SectionFormValues) {

    const payload: SectionPayload = {
      slug: values.slug.trim(),
      namePt: values.namePt.trim(),
      nameEn: values.nameEn.trim(),
      descriptionPt: emptyToNull(values.descriptionPt),
      descriptionEn: emptyToNull(values.descriptionEn),
      sectionType: values.sectionType,
      coverImageUrl: emptyToNull(values.coverImageUrl),
      coverVideoUrl: emptyToNull(values.coverVideoUrl),
      isActive: values.isActive,
      sortOrder: values.sortOrder
    };

    await saveMutation.mutateAsync(payload);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <SectionNextActions
            sectionId={savedSectionId}
            sectionType={savedSectionType}
            isVisible={mode === 'edit' || Boolean(savedSectionId)}
          />

          <FormStepNav
            steps={navSteps}
            currentStep={step}
            onSelect={setStep}
            maxSelectableStep={isWizard ? step : undefined}
          />

          {showCard(1) && (
          <SettingsCard
            title={t('identityCardTitle')}
            description={t('identityCardDescription')}
          >
            <div className="space-y-5">
              <StudioNote>{t('identityStudioNote')}</StudioNote>

              <div className="grid gap-4 md:grid-cols-[1fr_1fr_0.85fr]">
                {isWizard ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-2 text-sm font-medium text-slate-900">
                      {t('sectionTypeLabel')}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <SectionTypeBadge type={watch('sectionType')} />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setStep(0)}
                      >
                        {t('changeType')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Controller
                    name="sectionType"
                    control={control}
                    render={({field}) => (
                      <Select
                        id="sectionType"
                        label={t('sectionTypeLabel')}
                        value={field.value}
                        onChange={(event) =>
                          field.onChange(event.target.value as SectionType)
                        }
                        options={sectionTypeOptions}
                        error={fieldErrors.sectionType}
                        hint={t('sectionTypeHint')}
                      />
                    )}
                  />
                )}

                <Input
                  id="slug"
                  label={t('slugLabel')}
                  value={watch('slug')}
                  onChange={(event) => {
                    setAutoSlug(false);
                    setValue('slug', slugify(event.target.value), {
                      shouldValidate: true,
                      shouldDirty: true
                    });
                  }}
                  error={fieldErrors.slug}
                  hint={t('slugHint')}
                />

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">
                    {t('slugToolsTitle')}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAutoSlug(true);
                        setValue('slug', slugify(getValues('nameEn')), {
                          shouldValidate: true,
                          shouldDirty: true
                        });
                      }}
                    >
                      {t('regenerateSlug')}
                    </Button>

                    <Button
                      type="button"
                      variant={autoSlug ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setAutoSlug((current) => !current)}
                    >
                      {t('autoSlugToggle')}
                    </Button>
                  </div>
                </div>
              </div>

              <BilingualFieldGroup
                title={t('namesGroupTitle')}
                description={t('namesGroupDescription')}
                ptLabel={t('ptLabel')}
                enLabel={t('enLabel')}
                copyPtToEnLabel={t('copyPtToEn')}
                copyEnToPtLabel={t('copyEnToPt')}
                onCopyPtToEn={() =>
                  setValue('nameEn', getValues('namePt'), {shouldDirty: true})
                }
                onCopyEnToPt={() =>
                  setValue('namePt', getValues('nameEn'), {shouldDirty: true})
                }
                ptField={
                  <Input
                    id="namePt"
                    label={t('namePtLabel')}
                    {...register('namePt')}
                    error={fieldErrors.namePt}
                    hint={t('namePtHint')}
                  />
                }
                enField={
                  <Input
                    id="nameEn"
                    label={t('nameEnLabel')}
                    {...register('nameEn')}
                    error={fieldErrors.nameEn}
                    hint={t('nameEnHint')}
                  />
                }
              />

              {isWizard ? (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() =>
                      goToNextStep(['slug', 'namePt', 'nameEn'])
                    }
                  >
                    {t('nextButton')}
                  </Button>
                </div>
              ) : null}
            </div>
          </SettingsCard>
          )}

          {showCard(2) && (
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
                setValue('descriptionEn', getValues('descriptionPt'), {
                  shouldDirty: true
                })
              }
              onCopyEnToPt={() =>
                setValue('descriptionPt', getValues('descriptionEn'), {
                  shouldDirty: true
                })
              }
              ptField={
                <Textarea
                  id="descriptionPt"
                  label={t('descriptionPtLabel')}
                  {...register('descriptionPt')}
                  hint={t('descriptionPtHint')}
                />
              }
              enField={
                <Textarea
                  id="descriptionEn"
                  label={t('descriptionEnLabel')}
                  {...register('descriptionEn')}
                  hint={t('descriptionEnHint')}
                />
              }
            />

            {isWizard ? (
              <div className="mt-5 flex justify-between">
                <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                  {t('backButton')}
                </Button>
                <Button type="button" onClick={() => goToNextStep([])}>
                  {t('nextButton')}
                </Button>
              </div>
            ) : null}
          </SettingsCard>
          )}

          {showCard(3) && (
          <SettingsCard
            title={t('coverCardTitle')}
            description={t('coverCardDescription')}
          >
            <div className="grid gap-5 xl:grid-cols-2">
              <Controller
                name="coverImageUrl"
                control={control}
                render={({field}) => (
                  <MediaUploadField
                    label={t('coverImageLabel')}
                    type="IMAGE"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              <Controller
                name="coverVideoUrl"
                control={control}
                render={({field}) => (
                  <MediaUploadField
                    label={t('coverVideoLabel')}
                    type="VIDEO"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            {isWizard ? (
              <div className="mt-5 flex justify-between">
                <Button type="button" variant="ghost" onClick={() => setStep(2)}>
                  {t('backButton')}
                </Button>
                <Button type="button" onClick={() => goToNextStep([])}>
                  {t('nextButton')}
                </Button>
              </div>
            ) : null}
          </SettingsCard>
          )}

          {showCard(4) && (
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
          )}

          {(!isWizard || showCard(4)) && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            {isWizard ? (
              <Button type="button" variant="ghost" onClick={() => setStep(3)}>
                {t('backButton')}
              </Button>
            ) : (
              <Link href="/admin/sections">
                <Button type="button" variant="ghost">
                  {t('backToSections')}
                </Button>
              </Link>
            )}

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
          )}
        </div>

        <SectionFormSidebar values={watchedValues} />
      </div>
    </form>
  );
}