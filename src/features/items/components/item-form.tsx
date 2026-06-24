'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useLocale, useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {useEffect, useMemo, useRef, useState, type ReactNode} from 'react';
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
import {getAllCategories} from '@/features/categories/api';
import type {SectionCategoryResponse} from '@/features/categories/types';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {createItem, getAllItems, getItemById, updateItem} from '../api';
import {itemSchema, type ItemFormValues} from '../schema';
import type {SectionItemPayload} from '../types';
import {emptyToNull, getNextItemSortOrder} from '../utils';
import {ItemFormSidebar} from './item-form-sidebar';

type Props = {
  mode: 'create' | 'edit';
  itemId?: number;
  initialSectionId?: number;
  initialCategoryId?: number;
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

export default function ItemForm({
  mode,
  itemId,
  initialSectionId,
  initialCategoryId
}: Props) {
  const t = useTranslations('ItemForm');
  const common = useTranslations('Common');
  const errorT = useTranslations('CommonErrors');
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  // Set right before submit when the owner clicks "Save & add another".
  const addAnotherRef = useRef(false);

  const isSectionLocked =
    mode === 'create' &&
    typeof initialSectionId === 'number' &&
    Number.isFinite(initialSectionId) &&
    initialSectionId > 0;

  const isCategoryLocked =
    mode === 'create' &&
    typeof initialCategoryId === 'number' &&
    Number.isFinite(initialCategoryId) &&
    initialCategoryId > 0;

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: {errors, touchedFields}
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      sectionId: initialSectionId ?? 0,
      categoryId: initialCategoryId ?? undefined,
      titlePt: '',
      titleEn: '',
      shortDescriptionPt: '',
      shortDescriptionEn: '',
      fullDescriptionPt: '',
      fullDescriptionEn: '',
      coverImageUrl: '',
      videoUrl: '',
      itemType: '',
      specificationsPt: '',
      specificationsEn: '',
      isFeatured: false,
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

  const itemsQuery = useQuery({
    queryKey: ['items', 'all'],
    queryFn: getAllItems
  });

  const itemQuery = useQuery({
    queryKey: ['items', itemId],
    queryFn: () => getItemById(itemId as number),
    enabled: mode === 'edit' && Boolean(itemId)
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: SectionItemPayload) => {
      if (mode === 'edit' && itemId) {
        return updateItem(itemId, payload);
      }

      return createItem(payload);
    },
    onSuccess: async (savedItem) => {
      setServerError('');
      setSuccessMessage(mode === 'edit' ? t('saveSuccess') : t('createSuccess'));

      await queryClient.invalidateQueries({queryKey: ['items']});

      if (mode === 'create') {
        if (addAnotherRef.current) {
          addAnotherRef.current = false;
          // Keep the section + category, clear the rest, bump the order, so the
          // owner can add several items in a row without leaving the page.
          reset({
            sectionId: savedItem.sectionId,
            categoryId: savedItem.categoryId ?? undefined,
            titlePt: '',
            titleEn: '',
            shortDescriptionPt: '',
            shortDescriptionEn: '',
            fullDescriptionPt: '',
            fullDescriptionEn: '',
            coverImageUrl: '',
            videoUrl: '',
            itemType: '',
            specificationsPt: '',
            specificationsEn: '',
            isFeatured: false,
            isActive: true,
            sortOrder: (savedItem.sortOrder ?? 0) + 1
          });
          return;
        }

        if (isSectionLocked) {
          router.replace(`/${locale}/admin/sections/${savedItem.sectionId}`);
          return;
        }

        router.replace(`/${locale}/admin/items/${savedItem.id}/edit`);
        return;
      }

      reset({
        sectionId: savedItem.sectionId,
        categoryId: savedItem.categoryId ?? undefined,
        titlePt: savedItem.titlePt,
        titleEn: savedItem.titleEn,
        shortDescriptionPt: savedItem.shortDescriptionPt ?? '',
        shortDescriptionEn: savedItem.shortDescriptionEn ?? '',
        fullDescriptionPt: savedItem.fullDescriptionPt ?? '',
        fullDescriptionEn: savedItem.fullDescriptionEn ?? '',
        coverImageUrl: savedItem.coverImageUrl ?? '',
        videoUrl: savedItem.videoUrl ?? '',
        itemType: savedItem.itemType ?? '',
        specificationsPt: savedItem.specificationsPt ?? '',
        specificationsEn: savedItem.specificationsEn ?? '',
        isFeatured: savedItem.isFeatured,
        isActive: savedItem.isActive,
        sortOrder: savedItem.sortOrder
      });
    },
    onError: (error) => {
      setSuccessMessage('');
      setServerError(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  useEffect(() => {
    if (!itemQuery.data) return;

    const item = itemQuery.data;

    reset({
      sectionId: item.sectionId,
      categoryId: item.categoryId ?? undefined,
      titlePt: item.titlePt,
      titleEn: item.titleEn,
      shortDescriptionPt: item.shortDescriptionPt ?? '',
      shortDescriptionEn: item.shortDescriptionEn ?? '',
      fullDescriptionPt: item.fullDescriptionPt ?? '',
      fullDescriptionEn: item.fullDescriptionEn ?? '',
      coverImageUrl: item.coverImageUrl ?? '',
      videoUrl: item.videoUrl ?? '',
      itemType: item.itemType ?? '',
      specificationsPt: item.specificationsPt ?? '',
      specificationsEn: item.specificationsEn ?? '',
      isFeatured: item.isFeatured,
      isActive: item.isActive,
      sortOrder: item.sortOrder
    });
  }, [itemQuery.data, reset]);

  const itemSections = useMemo(
    () =>
      (sectionsQuery.data ?? [])
        .filter(
          (section) =>
            section.sectionType === 'CATEGORY_ITEMS' ||
            section.sectionType === 'DIRECT_ITEMS'
        )
        .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
    [sectionsQuery.data]
  );

  useEffect(() => {
    if (mode !== 'create' || !isSectionLocked || !initialSectionId) return;
    if (!itemSections.some((section) => section.id === initialSectionId)) return;
    if (getValues('sectionId') === initialSectionId) return;

    setValue('sectionId', initialSectionId, {shouldValidate: true});
  }, [mode, isSectionLocked, initialSectionId, itemSections, getValues, setValue]);

  const watchedValues = watch();

  const selectedSection = useMemo(() => {
    return itemSections.find((section) => section.id === watchedValues.sectionId);
  }, [itemSections, watchedValues.sectionId]);

  const isCategoryMode = selectedSection?.sectionType === 'CATEGORY_ITEMS';

  const availableCategories = useMemo(
    () =>
      (categoriesQuery.data ?? [])
        .filter((category) => category.sectionId === watchedValues.sectionId)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
    [categoriesQuery.data, watchedValues.sectionId]
  );

  useEffect(() => {
    if (!isCategoryMode) {
      if (watchedValues.categoryId !== undefined) {
        setValue('categoryId', undefined, {
          shouldDirty: true,
          shouldValidate: true
        });
      }
      return;
    }

    if (
      mode === 'create' &&
      isCategoryLocked &&
      initialCategoryId &&
      availableCategories.some((category) => category.id === initialCategoryId) &&
      watchedValues.categoryId !== initialCategoryId
    ) {
      setValue('categoryId', initialCategoryId, {
        shouldDirty: true,
        shouldValidate: true
      });
    }
  }, [
    isCategoryMode,
    watchedValues.categoryId,
    setValue,
    mode,
    isCategoryLocked,
    initialCategoryId,
    availableCategories
  ]);

  const linkedCategory = useMemo(() => {
    if (!watchedValues.categoryId) return undefined;

    return availableCategories.find(
      (category) => category.id === watchedValues.categoryId
    );
  }, [availableCategories, watchedValues.categoryId]);

  useEffect(() => {
    if (mode !== 'create') return;
    if (!itemsQuery.data?.length) return;
    if (touchedFields.sortOrder) return;
    if ((getValues('sortOrder') || 0) > 0) return;

    setValue(
      'sortOrder',
      getNextItemSortOrder(itemsQuery.data, getValues('sectionId')),
      {shouldValidate: true}
    );
  }, [mode, itemsQuery.data, touchedFields.sortOrder, getValues, setValue]);

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
      itemType: errors.itemType?.message
        ? t(errors.itemType.message as never)
        : undefined,
      sortOrder: errors.sortOrder?.message
        ? t(errors.sortOrder.message as never)
        : undefined
    }),
    [errors, t]
  );

  async function onSubmit(values: ItemFormValues) {
    setServerError('');
    setSuccessMessage('');

    const payload: SectionItemPayload = {
      sectionId: values.sectionId,
      categoryId: isCategoryMode ? (values.categoryId ?? null) : null,
      titlePt: values.titlePt.trim(),
      titleEn: values.titleEn.trim(),
      shortDescriptionPt: emptyToNull(values.shortDescriptionPt),
      shortDescriptionEn: emptyToNull(values.shortDescriptionEn),
      fullDescriptionPt: emptyToNull(values.fullDescriptionPt),
      fullDescriptionEn: emptyToNull(values.fullDescriptionEn),
      coverImageUrl: emptyToNull(values.coverImageUrl),
      videoUrl: emptyToNull(values.videoUrl),
      itemType: emptyToNull(values.itemType),
      specificationsPt: emptyToNull(values.specificationsPt),
      specificationsEn: emptyToNull(values.specificationsEn),
      isFeatured: values.isFeatured,
      isActive: values.isActive,
      sortOrder: values.sortOrder
    };

    await saveMutation.mutateAsync(payload);
  }

  if (mode === 'edit' && itemQuery.isPending) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">{common('loading')}</p>
      </div>
    );
  }

  if (mode === 'edit' && itemQuery.isError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-sm text-red-700">
          {getErrorMessage(toAppError(itemQuery.error), (key) => errorT(key))}
        </p>
      </div>
    );
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
                : '/admin/items'
            }
          >
            <Button type="button" variant="outline">
              {isSectionLocked ? t('backToWorkspace') : t('backToItems')}
            </Button>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            {successMessage ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                {successMessage}
              </span>
            ) : null}

            {mode === 'create' ? (
              <Button
                type="submit"
                variant="outline"
                isLoading={saveMutation.isPending}
                loadingText={common('loading')}
                onClick={() => {
                  addAnotherRef.current = true;
                }}
              >
                {t('createAndAddAnother')}
              </Button>
            ) : null}

            <Button
              type="submit"
              isLoading={saveMutation.isPending}
              loadingText={common('loading')}
              onClick={() => {
                addAnotherRef.current = false;
              }}
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

        <SettingsCard
          title={t('linkCardTitle')}
          description={t('linkCardDescription')}
        >
          <div className="grid gap-5 md:grid-cols-2">
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
                    options={itemSections
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
                      ...itemSections.map((section) => ({
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

            {isCategoryMode ? (
              <Controller
                name="categoryId"
                control={control}
                render={({field}) =>
                  isCategoryLocked && linkedCategory ? (
                    <Select
                      label={t('categoryLabel')}
                      value={String(linkedCategory.id)}
                      onChange={() => undefined}
                      options={[
                        {
                          value: String(linkedCategory.id),
                          label: linkedCategory.nameEn
                        }
                      ]}
                      hint={t('categoryLockedHint')}
                      disabled
                    />
                  ) : (
                    <Select
                      label={t('categoryLabel')}
                      value={field.value ? String(field.value) : ''}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value
                            ? Number(event.target.value)
                            : undefined
                        )
                      }
                      options={[
                        {value: '', label: t('categoryPlaceholder')},
                        ...availableCategories.map((category) => ({
                          value: String(category.id),
                          label: category.nameEn
                        }))
                      ]}
                      hint={t('categoryHint')}
                    />
                  )
                }
              />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  {t('categoryDisabledTitle')}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {t('categoryDisabledDescription')}
                </p>
              </div>
            )}
          </div>
        </SettingsCard>

        <SettingsCard
          title={t('contentCardTitle')}
          description={t('contentCardDescription')}
        >
          <SettingsCard
            title={t('metadataCardTitle')}
            description={t('metadataCardDescription')}
          >
            <Input
              id="itemType"
              label={t('itemTypeLabel')}
              {...register('itemType')}
              error={fieldErrors.itemType}
              hint={t('itemTypeHint')}
            />
          </SettingsCard>

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
              />
            }
            enField={
              <Textarea
                id="fullDescriptionEn"
                label={t('fullDescriptionEnLabel')}
                {...register('fullDescriptionEn')}
                hint={t('fullDescriptionEnHint')}
              />
            }
          />
        </SettingsCard>

        <SettingsCard
          title={t('specificationsCardTitle')}
          description={t('specificationsCardDescription')}
        >
          <BilingualFieldGroup
            title={t('specificationsGroupTitle')}
            description={t('specificationsGroupDescription')}
            ptLabel={t('ptLabel')}
            enLabel={t('enLabel')}
            copyPtToEnLabel={t('copyPtToEn')}
            copyEnToPtLabel={t('copyEnToPt')}
            onCopyPtToEn={() =>
              setValue('specificationsEn', getValues('specificationsPt'), {
                shouldDirty: true
              })
            }
            onCopyEnToPt={() =>
              setValue('specificationsPt', getValues('specificationsEn'), {
                shouldDirty: true
              })
            }
            ptField={
              <Textarea
                id="specificationsPt"
                label={t('specificationsPtLabel')}
                {...register('specificationsPt')}
                hint={t('specificationsPtHint')}
              />
            }
            enField={
              <Textarea
                id="specificationsEn"
                label={t('specificationsEnLabel')}
                {...register('specificationsEn')}
                hint={t('specificationsEnHint')}
              />
            }
          />
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
  label={t('imagePreview')}
  value={field.value}
  type="IMAGE"
  onChange={field.onChange}
  cropAspect={4 / 3}
  cropShape="rect"
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
                    {value: 'true', label: t('featuredYes')},
                    {value: 'false', label: t('featuredNo')}
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
      </div>

      <ItemFormSidebar
        values={watchedValues}
        linkedSection={selectedSection}
        linkedCategory={linkedCategory}
      />
    </form>
  );
}