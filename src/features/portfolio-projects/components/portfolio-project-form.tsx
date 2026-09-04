'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useLocale, useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {useEffect, useMemo, useState, type ReactNode} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Link} from '@/i18n/navigation';
import {FormStepNav} from '@/components/common/form-step-nav';
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
  createPortfolioProject,
  getAllPortfolioProjects,
  getPortfolioProjectById,
  updatePortfolioProject
} from '../api';
import {
  portfolioProjectSchema,
  type PortfolioProjectFormValues
} from '../schema';
import type {PortfolioProjectPayload} from '../types';
import {emptyToNull, getNextPortfolioProjectSortOrder} from '../utils';
import {PortfolioProjectFormSidebar} from './portfolio-project-form-sidebar';
import {CopyButton} from '@/components/common/copy-button';

type Props = {
  mode: 'create' | 'edit';
  projectId?: number;
  initialSectionId?: number;
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

export default function PortfolioProjectForm({
  mode,
  projectId,
  initialSectionId
}: Props) {
  const t = useTranslations('PortfolioProjectForm');
  const common = useTranslations('Common');
  const errorT = useTranslations('CommonErrors');
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [serverError, setServerError] = useState('');

  // The form is two screens: everything about the content, then publishing.
  // Both are one click away, so changing one field never means scrolling past
  // everything else.
  const [step, setStep] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  const isSectionLocked =
    mode === 'create' &&
    typeof initialSectionId === 'number' &&
    Number.isFinite(initialSectionId) &&
    initialSectionId > 0;

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: {errors, touchedFields}
  } = useForm<PortfolioProjectFormValues>({
    resolver: zodResolver(portfolioProjectSchema),
    defaultValues: {
      sectionId: initialSectionId ?? 0,
      titlePt: '',
      titleEn: '',
      shortDescriptionPt: '',
      shortDescriptionEn: '',
      fullDescriptionPt: '',
      fullDescriptionEn: '',
      clientName: '',
      projectDate: '',
      locationPt: '',
      locationEn: '',
      coverImageUrl: '',
      videoUrl: '',
      isFeatured: false,
      isActive: true,
      sortOrder: 0
    }
  });

  const sectionsQuery = useQuery({
    queryKey: ['sections', 'all'],
    queryFn: getAllSections
  });

  const projectsQuery = useQuery({
    queryKey: ['portfolio-projects', 'all'],
    queryFn: getAllPortfolioProjects
  });

  const projectQuery = useQuery({
    queryKey: ['portfolio-projects', projectId],
    queryFn: () => getPortfolioProjectById(projectId as number),
    enabled: mode === 'edit' && Boolean(projectId)
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: PortfolioProjectPayload) => {
      if (mode === 'edit' && projectId) {
        return updatePortfolioProject(projectId, payload);
      }

      return createPortfolioProject(payload);
    },
    onSuccess: async (savedProject) => {
      setServerError('');
      setSuccessMessage(
        mode === 'edit' ? t('saveSuccess') : t('createSuccess')
      );

      await queryClient.invalidateQueries({queryKey: ['portfolio-projects']});

      if (mode === 'create') {
        if (isSectionLocked) {
          router.replace(`/${locale}/admin/sections/${savedProject.sectionId}`);
          return;
        }

        router.replace(`/${locale}/admin/portfolio-projects/${savedProject.id}/edit`);
        return;
      }

      reset({
        sectionId: savedProject.sectionId,
        titlePt: savedProject.titlePt,
        titleEn: savedProject.titleEn,
        shortDescriptionPt: savedProject.shortDescriptionPt ?? '',
        shortDescriptionEn: savedProject.shortDescriptionEn ?? '',
        fullDescriptionPt: savedProject.fullDescriptionPt ?? '',
        fullDescriptionEn: savedProject.fullDescriptionEn ?? '',
        clientName: savedProject.clientName ?? '',
        projectDate: savedProject.projectDate ?? '',
        locationPt: savedProject.locationPt ?? '',
        locationEn: savedProject.locationEn ?? '',
        coverImageUrl: savedProject.coverImageUrl ?? '',
        videoUrl: savedProject.videoUrl ?? '',
        isFeatured: savedProject.isFeatured,
        isActive: savedProject.isActive,
        sortOrder: savedProject.sortOrder
      });
    },
    onError: (error) => {
      setSuccessMessage('');
      setServerError(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  useEffect(() => {
    if (!projectQuery.data) return;

    const project = projectQuery.data;

    reset({
      sectionId: project.sectionId,
      titlePt: project.titlePt,
      titleEn: project.titleEn,
      shortDescriptionPt: project.shortDescriptionPt ?? '',
      shortDescriptionEn: project.shortDescriptionEn ?? '',
      fullDescriptionPt: project.fullDescriptionPt ?? '',
      fullDescriptionEn: project.fullDescriptionEn ?? '',
      clientName: project.clientName ?? '',
      projectDate: project.projectDate ?? '',
      locationPt: project.locationPt ?? '',
      locationEn: project.locationEn ?? '',
      coverImageUrl: project.coverImageUrl ?? '',
      videoUrl: project.videoUrl ?? '',
      isFeatured: project.isFeatured,
      isActive: project.isActive,
      sortOrder: project.sortOrder
    });
  }, [projectQuery.data, reset]);

  const portfolioSections = useMemo(
    () =>
      (sectionsQuery.data ?? [])
        .filter((section) => section.sectionType === 'PORTFOLIO')
        .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
    [sectionsQuery.data]
  );

  useEffect(() => {
    if (mode !== 'create' || !isSectionLocked || !initialSectionId) return;
    if (!portfolioSections.some((section) => section.id === initialSectionId)) {
      return;
    }
    if (getValues('sectionId') === initialSectionId) return;

    setValue('sectionId', initialSectionId, {shouldValidate: true});
  }, [
    mode,
    isSectionLocked,
    initialSectionId,
    portfolioSections,
    getValues,
    setValue
  ]);

  const watchedValues = watch();

  const linkedSection = useMemo(() => {
    return portfolioSections.find(
      (section) => section.id === watchedValues.sectionId
    );
  }, [portfolioSections, watchedValues.sectionId]);

  useEffect(() => {
    if (mode !== 'create') return;
    if (!projectsQuery.data?.length) return;
    if (touchedFields.sortOrder) return;
    if ((getValues('sortOrder') || 0) > 0) return;

    setValue(
      'sortOrder',
      getNextPortfolioProjectSortOrder(
        projectsQuery.data,
        getValues('sectionId')
      ),
      {shouldValidate: true}
    );
  }, [mode, projectsQuery.data, touchedFields.sortOrder, getValues, setValue]);

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
      sortOrder: errors.sortOrder?.message
        ? t(errors.sortOrder.message as never)
        : undefined,
      clientName: errors.clientName?.message
        ? t(errors.clientName.message as never)
        : undefined,
      locationPt: errors.locationPt?.message
        ? t(errors.locationPt.message as never)
        : undefined,
      locationEn: errors.locationEn?.message
        ? t(errors.locationEn.message as never)
        : undefined
    }),
    [errors, t]
  );

  async function onSubmit(values: PortfolioProjectFormValues) {
    setServerError('');
    setSuccessMessage('');

    const payload: PortfolioProjectPayload = {
      sectionId: values.sectionId,
      titlePt: values.titlePt.trim(),
      titleEn: values.titleEn.trim(),
      shortDescriptionPt: emptyToNull(values.shortDescriptionPt),
      shortDescriptionEn: emptyToNull(values.shortDescriptionEn),
      fullDescriptionPt: emptyToNull(values.fullDescriptionPt),
      fullDescriptionEn: emptyToNull(values.fullDescriptionEn),
      clientName: emptyToNull(values.clientName),
      projectDate: emptyToNull(values.projectDate),
      locationPt: emptyToNull(values.locationPt),
      locationEn: emptyToNull(values.locationEn),
      coverImageUrl: emptyToNull(values.coverImageUrl),
      videoUrl: emptyToNull(values.videoUrl),
      isFeatured: values.isFeatured,
      isActive: values.isActive,
      sortOrder: values.sortOrder
    };

    await saveMutation.mutateAsync(payload);
  }

  if (mode === 'edit' && projectQuery.isPending) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">{common('loading')}</p>
      </div>
    );
  }

  if (mode === 'edit' && projectQuery.isError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-sm text-red-700">
          {getErrorMessage(toAppError(projectQuery.error), (key) => errorT(key))}
        </p>
      </div>
    );
  }

  const navSteps = [
    {key: 'content', label: t('stepContentLabel')},
    {key: 'publish', label: t('stepPublishLabel')}
  ];

  function showCard(cardStep: number) {
    return step === cardStep;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={
              isSectionLocked
                ? `/admin/sections/${initialSectionId}`
                : '/admin/portfolio-projects'
            }
          >
            <Button type="button" variant="outline">
              {isSectionLocked ? t('backToWorkspace') : t('backToProjects')}
            </Button>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            {successMessage ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                {successMessage}
              </span>
            ) : null}

            <Button
              type="submit"
              isLoading={saveMutation.isPending}
              loadingText={common('loading')}
            >
              {mode === 'edit' ? t('saveButton') : t('createButton')}
            </Button>
          </div>
        </div>

        {serverError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        ) : null}

        <FormStepNav
          steps={navSteps}
          currentStep={step}
          onSelect={setStep}
        />

        {showCard(0) && (
          <>
        <SettingsCard
          title={t('linkCardTitle')}
          description={t('linkCardDescription')}
        >
          <Controller
            name="sectionId"
            control={control}
            render={({field}) =>
              isSectionLocked ? (
                <Select
                  label={t('sectionLabel')}
                  value={
                    field.value
                      ? String(field.value)
                      : String(initialSectionId ?? '')
                  }
                  onChange={() => undefined}
                  options={portfolioSections
                    .filter(
                      (section) => section.id === (initialSectionId ?? field.value)
                    )
                    .map((section) => ({
                      value: String(section.id),
                      label: `${section.nameEn} (${section.slug})`
                    }))}
                  error={fieldErrors.sectionId}
                  hint={t('sectionLockedHint')}
                  disabled
                />
              ) : (
                <Select
                  label={t('sectionLabel')}
                  value={field.value ? String(field.value) : ''}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value ? Number(event.target.value) : 0
                    )
                  }
                  options={[
                    {value: '', label: t('sectionPlaceholder')},
                    ...portfolioSections.map((section) => ({
                      value: String(section.id),
                      label: `${section.nameEn} (${section.slug})`
                    }))
                  ]}
                  error={fieldErrors.sectionId}
                  hint={t('sectionHint')}
                />
              )
            }
          />
        </SettingsCard>

        <SettingsCard
          title={t('titlesCardTitle')}
          description={t('titlesCardDescription')}
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
          title={t('shortDescriptionCardTitle')}
          description={t('shortDescriptionCardDescription')}
        >
          <BilingualFieldGroup
            title={t('shortDescriptionGroupTitle')}
            description={t('shortDescriptionGroupDescription')}
            ptLabel={t('ptLabel')}
            enLabel={t('enLabel')}
            copyPtToEnLabel={t('copyPtToEn')}
            copyEnToPtLabel={t('copyEnToPt')}
            onCopyPtToEn={() =>
              setValue(
                'shortDescriptionEn',
                getValues('shortDescriptionPt'),
                {shouldDirty: true}
              )
            }
            onCopyEnToPt={() =>
              setValue(
                'shortDescriptionPt',
                getValues('shortDescriptionEn'),
                {shouldDirty: true}
              )
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
          title={t('fullDescriptionCardTitle')}
          description={t('fullDescriptionCardDescription')}
        >
          <BilingualFieldGroup
            title={t('fullDescriptionGroupTitle')}
            description={t('fullDescriptionGroupDescription')}
            ptLabel={t('ptLabel')}
            enLabel={t('enLabel')}
            copyPtToEnLabel={t('copyPtToEn')}
            copyEnToPtLabel={t('copyEnToPt')}
            onCopyPtToEn={() =>
              setValue('fullDescriptionEn', getValues('fullDescriptionPt'), {
                shouldDirty: true
              })
            }
            onCopyEnToPt={() =>
              setValue('fullDescriptionPt', getValues('fullDescriptionEn'), {
                shouldDirty: true
              })
            }
            ptField={
              <Textarea
                id="fullDescriptionPt"
                label={t('fullDescriptionPtLabel')}
                {...register('fullDescriptionPt')}
                hint={t('fullDescriptionPtHint')}
                rows={6}
              />
            }
            enField={
              <Textarea
                id="fullDescriptionEn"
                label={t('fullDescriptionEnLabel')}
                {...register('fullDescriptionEn')}
                hint={t('fullDescriptionEnHint')}
                rows={6}
              />
            }
          />
        </SettingsCard>

        <SettingsCard
          title={t('projectMetaCardTitle')}
          description={t('projectMetaCardDescription')}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Input
              id="clientName"
              label={t('clientNameLabel')}
              {...register('clientName')}
              error={fieldErrors.clientName}
              hint={t('clientNameHint')}
            />

            <Input
              id="projectDate"
              type="date"
              label={t('projectDateLabel')}
              {...register('projectDate')}
              hint={t('projectDateHint')}
            />
          </div>

          <div className="mt-5">
            <BilingualFieldGroup
              title={t('locationsGroupTitle')}
              description={t('locationsGroupDescription')}
              ptLabel={t('ptLabel')}
              enLabel={t('enLabel')}
              copyPtToEnLabel={t('copyPtToEn')}
              copyEnToPtLabel={t('copyEnToPt')}
              onCopyPtToEn={() =>
                setValue('locationEn', getValues('locationPt'), {
                  shouldDirty: true
                })
              }
              onCopyEnToPt={() =>
                setValue('locationPt', getValues('locationEn'), {
                  shouldDirty: true
                })
              }
              ptField={
                <Input
                  id="locationPt"
                  label={t('locationPtLabel')}
                  {...register('locationPt')}
                  error={fieldErrors.locationPt}
                  hint={t('locationPtHint')}
                />
              }
              enField={
                <Input
                  id="locationEn"
                  label={t('locationEnLabel')}
                  {...register('locationEn')}
                  error={fieldErrors.locationEn}
                  hint={t('locationEnHint')}
                />
              }
            />
          </div>
        </SettingsCard>

        <SettingsCard
          title={t('mediaCardTitle')}
          description={t('mediaCardDescription')}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Controller
              name="coverImageUrl"
              control={control}
              render={({field}) => (
                <MediaUploadField
                  label={t('coverImageLabel')}
                  value={field.value || ''}
                  type="IMAGE"
                  cropAspect={4 / 3}
cropShape="rect"
                  onChange={field.onChange}
                />
              )}
            />

            <Input
              id="videoUrl"
              label={t('videoUrlLabel')}
              {...register('videoUrl')}
              hint={t('videoUrlHint')}
            />
          </div>
        </SettingsCard>
          </>
        )}

        {showCard(1) && (
        <SettingsCard
          title={t('publishingCardTitle')}
          description={t('publishingCardDescription')}
        >
          <div className="grid gap-5 md:grid-cols-3">
            <Controller
              name="isFeatured"
              control={control}
              render={({field}) => (
                <Select
                  label={t('featuredLabel')}
                  value={field.value ? 'true' : 'false'}
                  onChange={(event) => field.onChange(event.target.value === 'true')}
                  options={[
                    {value: 'false', label: t('featuredNo')},
                    {value: 'true', label: t('featuredYes')}
                  ]}
                  hint={t('featuredHint')}
                />
              )}
            />

            <Controller
              name="isActive"
              control={control}
              render={({field}) => (
                <Select
                  label={t('publishingStatusTitle')}
                  value={field.value ? 'true' : 'false'}
                  onChange={(event) => field.onChange(event.target.value === 'true')}
                  options={[
                    {value: 'true', label: t('statusActive')},
                    {value: 'false', label: t('statusInactive')}
                  ]}
                  hint={t('publishingStatusHint')}
                />
              )}
            />

            <Controller
              name="sortOrder"
              control={control}
              render={({field}) => (
                <Input
                  id="sortOrder"
                  type="number"
                  label={t('sortOrderLabel')}
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value === '' ? 0 : Number(event.target.value)
                    )
                  }
                  error={fieldErrors.sortOrder}
                  hint={t('sortOrderHint')}
                />
              )}
            />
          </div>
        </SettingsCard>
        )}
      </div>

      <PortfolioProjectFormSidebar
        values={watchedValues}
        linkedSection={linkedSection}
      />
    </form>
  );
}