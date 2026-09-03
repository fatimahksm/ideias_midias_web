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
import {getAllSections} from '@/features/sections/api';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory
} from '../api';
import {categorySchema, type CategoryFormValues} from '../schema';
import type {SectionCategoryPayload} from '../types';
import {emptyToNull, getNextCategorySortOrder} from '../utils';
import {CategoryFormSidebar} from './category-form-sidebar';

type Props = {
  mode: 'create' | 'edit';
  categoryId?: number;
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

export default function CategoryForm({
  mode,
  categoryId,
  initialSectionId
}: Props) {
  const t = useTranslations('CategoryForm');
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
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      sectionId: initialSectionId ?? 0,
      namePt: '',
      nameEn: '',
      descriptionPt: '',
      descriptionEn: '',
      isActive: true,
      sortOrder: 0
    }
  });

  const sectionsQuery = useQuery({
    queryKey: ['sections', 'all'],
    queryFn: getAllSections
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: getAllCategories
  });

  const categoryQuery = useQuery({
    queryKey: ['categories', categoryId],
    queryFn: () => getCategoryById(categoryId as number),
    enabled: mode === 'edit' && Boolean(categoryId)
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: SectionCategoryPayload) => {
      if (mode === 'edit' && categoryId) {
        return updateCategory(categoryId, payload);
      }

      return createCategory(payload);
    },
    onSuccess: async (savedCategory) => {
      setServerError('');
      setSuccessMessage(mode === 'edit' ? t('saveSuccess') : t('createSuccess'));

      await queryClient.invalidateQueries({queryKey: ['categories']});

      if (mode === 'create') {
        if (isSectionLocked) {
          router.replace(`/${locale}/admin/sections/${savedCategory.sectionId}`);
          return;
        }

        router.replace(`/${locale}/admin/categories/${savedCategory.id}/edit`);
        return;
      }

      reset({
        sectionId: savedCategory.sectionId,
        namePt: savedCategory.namePt,
        nameEn: savedCategory.nameEn,
        descriptionPt: savedCategory.descriptionPt ?? '',
        descriptionEn: savedCategory.descriptionEn ?? '',
        isActive: savedCategory.isActive,
        sortOrder: savedCategory.sortOrder
      });
    },
    onError: (error) => {
      setSuccessMessage('');
      setServerError(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  useEffect(() => {
    if (!categoryQuery.data) return;

    const category = categoryQuery.data;

    reset({
      sectionId: category.sectionId,
      namePt: category.namePt,
      nameEn: category.nameEn,
      descriptionPt: category.descriptionPt ?? '',
      descriptionEn: category.descriptionEn ?? '',
      isActive: category.isActive,
      sortOrder: category.sortOrder
    });
  }, [categoryQuery.data, reset]);

  const categorySections = useMemo(
    () =>
      (sectionsQuery.data ?? [])
        .filter((section) => section.sectionType === 'CATEGORY_ITEMS')
        .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
    [sectionsQuery.data]
  );

  useEffect(() => {
    if (mode !== 'create' || !isSectionLocked || !initialSectionId) return;
    if (!categorySections.some((section) => section.id === initialSectionId)) {
      return;
    }
    if (getValues('sectionId') === initialSectionId) return;

    setValue('sectionId', initialSectionId, {shouldValidate: true});
  }, [
    mode,
    isSectionLocked,
    initialSectionId,
    categorySections,
    getValues,
    setValue
  ]);

  useEffect(() => {
    if (mode !== 'create') return;
    if (!categoriesQuery.data?.length) return;
    if (touchedFields.sortOrder) return;
    if ((getValues('sortOrder') || 0) > 0) return;

    setValue(
      'sortOrder',
      getNextCategorySortOrder(categoriesQuery.data, getValues('sectionId')),
      {shouldValidate: true}
    );
  }, [mode, categoriesQuery.data, touchedFields.sortOrder, getValues, setValue]);

  const watchedValues = watch();

  const linkedSection = useMemo(() => {
    return categorySections.find(
      (section) => section.id === watchedValues.sectionId
    );
  }, [categorySections, watchedValues.sectionId]);

  const fieldErrors = useMemo(
    () => ({
      sectionId: errors.sectionId?.message
        ? t(errors.sectionId.message as never)
        : undefined,
      namePt: errors.namePt?.message
        ? t(errors.namePt.message as never)
        : undefined,
      nameEn: errors.nameEn?.message
        ? t(errors.nameEn.message as never)
        : undefined,
      sortOrder: errors.sortOrder?.message
        ? t(errors.sortOrder.message as never)
        : undefined
    }),
    [errors, t]
  );

  async function onSubmit(values: CategoryFormValues) {
    setServerError('');
    setSuccessMessage('');

    const payload: SectionCategoryPayload = {
      sectionId: values.sectionId,
      namePt: values.namePt.trim(),
      nameEn: values.nameEn.trim(),
      descriptionPt: emptyToNull(values.descriptionPt),
      descriptionEn: emptyToNull(values.descriptionEn),
      isActive: values.isActive,
      sortOrder: values.sortOrder
    };

    await saveMutation.mutateAsync(payload);
  }

  if (mode === 'edit' && categoryQuery.isPending) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">{common('loading')}</p>
      </div>
    );
  }

  if (mode === 'edit' && categoryQuery.isError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-sm text-red-700">
          {getErrorMessage(toAppError(categoryQuery.error), (key) => errorT(key))}
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
                : '/admin/categories'
            }
          >
            <Button type="button" variant="outline">
              {isSectionLocked ? t('backToWorkspace') : t('backToCategories')}
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
                  options={categorySections
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
                    ...categorySections.map((section) => ({
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
          title={t('contentCardTitle')}
          description={t('contentCardDescription')}
        >
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
        </SettingsCard>
          </>
        )}

        {showCard(1) && (
        <SettingsCard
          title={t('publishingCardTitle')}
          description={t('publishingCardDescription')}
        >
          <div className="grid gap-5 md:grid-cols-2">
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

      <CategoryFormSidebar values={watchedValues} linkedSection={linkedSection} />
    </form>
  );
}