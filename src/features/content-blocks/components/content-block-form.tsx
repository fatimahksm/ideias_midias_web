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
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {
  createContentBlock,
  getAllContentBlocks,
  getContentBlockById,
  updateContentBlock
} from '../api';
import {CONTENT_BLOCK_TYPE_OPTIONS} from '../constants';
import {contentBlockSchema, type ContentBlockFormValues} from '../schema';
import type {SectionContentBlockPayload} from '../types';
import {emptyToNull, getNextContentBlockSortOrder} from '../utils';
import {ContentBlockFormSidebar} from './content-block-form-sidebar';

type Props = {
  mode: 'create' | 'edit';
  blockId?: number;
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

export default function ContentBlockForm({
  mode,
  blockId,
  initialSectionId
}: Props) {
  const t = useTranslations('ContentBlockForm');
  const common = useTranslations('Common');
  const errorT = useTranslations('CommonErrors');
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  // Set right before submit when the owner clicks "Save & add another" so the
  // form stays open on a fresh block instead of navigating away.
  const addAnotherRef = useRef(false);

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
  } = useForm<ContentBlockFormValues>({
    resolver: zodResolver(contentBlockSchema),
    defaultValues: {
      sectionId: initialSectionId ?? 0,
      blockType: 'TEXT',
      titlePt: '',
      titleEn: '',
      subtitlePt: '',
      subtitleEn: '',
      contentPt: '',
      contentEn: '',
      imageUrl: '',
      videoUrl: '',
      isActive: true,
      sortOrder: 0
    }
  });

  const sectionsQuery = useQuery({
    queryKey: ['sections', 'all'],
    queryFn: getAllSections
  });

  const blocksQuery = useQuery({
    queryKey: ['content-blocks', 'all'],
    queryFn: getAllContentBlocks
  });

  const blockQuery = useQuery({
    queryKey: ['content-blocks', blockId],
    queryFn: () => getContentBlockById(blockId as number),
    enabled: mode === 'edit' && Boolean(blockId)
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: SectionContentBlockPayload) => {
      if (mode === 'edit' && blockId) {
        return updateContentBlock(blockId, payload);
      }

      return createContentBlock(payload);
    },
    onSuccess: async (savedBlock) => {
      setServerError('');
      setSuccessMessage(mode === 'edit' ? t('saveSuccess') : t('createSuccess'));

      await queryClient.invalidateQueries({queryKey: ['content-blocks']});

      if (mode === 'create') {
        if (addAnotherRef.current) {
          addAnotherRef.current = false;
          // Keep the section + block type, clear the rest, bump the order, so the
          // owner can add several blocks in a row without leaving the page.
          reset({
            sectionId: savedBlock.sectionId,
            blockType: savedBlock.blockType,
            titlePt: '',
            titleEn: '',
            subtitlePt: '',
            subtitleEn: '',
            contentPt: '',
            contentEn: '',
            imageUrl: '',
            videoUrl: '',
            isActive: true,
            sortOrder: (savedBlock.sortOrder ?? 0) + 1
          });
          return;
        }

        if (isSectionLocked) {
          router.replace(`/${locale}/admin/sections/${savedBlock.sectionId}`);
          return;
        }

        router.replace(`/${locale}/admin/content-blocks/${savedBlock.id}/edit`);
        return;
      }

      reset({
        sectionId: savedBlock.sectionId,
        blockType: savedBlock.blockType,
        titlePt: savedBlock.titlePt ?? '',
        titleEn: savedBlock.titleEn ?? '',
        subtitlePt: savedBlock.subtitlePt ?? '',
        subtitleEn: savedBlock.subtitleEn ?? '',
        contentPt: savedBlock.contentPt ?? '',
        contentEn: savedBlock.contentEn ?? '',
        imageUrl: savedBlock.imageUrl ?? '',
        videoUrl: savedBlock.videoUrl ?? '',
        isActive: savedBlock.isActive,
        sortOrder: savedBlock.sortOrder
      });
    },
    onError: (error) => {
      setSuccessMessage('');
      setServerError(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  useEffect(() => {
    if (!blockQuery.data) return;

    const block = blockQuery.data;

    reset({
      sectionId: block.sectionId,
      blockType: block.blockType,
      titlePt: block.titlePt ?? '',
      titleEn: block.titleEn ?? '',
      subtitlePt: block.subtitlePt ?? '',
      subtitleEn: block.subtitleEn ?? '',
      contentPt: block.contentPt ?? '',
      contentEn: block.contentEn ?? '',
      imageUrl: block.imageUrl ?? '',
      videoUrl: block.videoUrl ?? '',
      isActive: block.isActive,
      sortOrder: block.sortOrder
    });
  }, [blockQuery.data, reset]);

  const contentSections = useMemo(
    () =>
      (sectionsQuery.data ?? [])
        .filter((section) => section.sectionType === 'CONTENT')
        .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
    [sectionsQuery.data]
  );

  useEffect(() => {
    if (mode !== 'create' || !isSectionLocked || !initialSectionId) return;
    if (!contentSections.some((section) => section.id === initialSectionId)) {
      return;
    }
    if (getValues('sectionId') === initialSectionId) return;

    setValue('sectionId', initialSectionId, {shouldValidate: true});
  }, [
    mode,
    isSectionLocked,
    initialSectionId,
    contentSections,
    getValues,
    setValue
  ]);

  const watchedValues = watch();

  const selectedSection = useMemo(() => {
    return contentSections.find((section) => section.id === watchedValues.sectionId);
  }, [contentSections, watchedValues.sectionId]);

  const isTextBlock = watchedValues.blockType === 'TEXT';
  const isImageBlock = watchedValues.blockType === 'IMAGE';
  const isVideoBlock = watchedValues.blockType === 'VIDEO';
  const isTextImageBlock = watchedValues.blockType === 'TEXT_IMAGE';
  const isGalleryBlock = watchedValues.blockType === 'GALLERY';

  const needsTextContent = isTextBlock || isTextImageBlock || isGalleryBlock;
  const needsImage = isImageBlock || isTextImageBlock || isGalleryBlock;
  const needsVideo = isVideoBlock;

  useEffect(() => {
    if (mode !== 'create') return;
    if (!blocksQuery.data?.length) return;
    if (touchedFields.sortOrder) return;
    if ((getValues('sortOrder') || 0) > 0) return;

    setValue(
      'sortOrder',
      getNextContentBlockSortOrder(blocksQuery.data, getValues('sectionId')),
      {shouldValidate: true}
    );
  }, [mode, blocksQuery.data, touchedFields.sortOrder, getValues, setValue]);

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
      subtitlePt: errors.subtitlePt?.message
        ? t(errors.subtitlePt.message as never)
        : undefined,
      subtitleEn: errors.subtitleEn?.message
        ? t(errors.subtitleEn.message as never)
        : undefined,
      sortOrder: errors.sortOrder?.message
        ? t(errors.sortOrder.message as never)
        : undefined
    }),
    [errors, t]
  );

  async function onSubmit(values: ContentBlockFormValues) {
    setServerError('');
    setSuccessMessage('');

    const payload: SectionContentBlockPayload = {
      sectionId: values.sectionId,
      blockType: values.blockType,
      titlePt: emptyToNull(values.titlePt),
      titleEn: emptyToNull(values.titleEn),
      subtitlePt: emptyToNull(values.subtitlePt),
      subtitleEn: emptyToNull(values.subtitleEn),
      contentPt: emptyToNull(values.contentPt),
      contentEn: emptyToNull(values.contentEn),
      imageUrl: emptyToNull(values.imageUrl),
      videoUrl: emptyToNull(values.videoUrl),
      isActive: values.isActive,
      sortOrder: values.sortOrder
    };

    await saveMutation.mutateAsync(payload);
  }

  if (mode === 'edit' && blockQuery.isPending) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">{common('loading')}</p>
      </div>
    );
  }

  if (mode === 'edit' && blockQuery.isError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-sm text-red-700">
          {getErrorMessage(toAppError(blockQuery.error), (key) => errorT(key))}
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
                : '/admin/content-blocks'
            }
          >
            <Button type="button" variant="outline">
              {isSectionLocked ? t('backToWorkspace') : t('backToBlocks')}
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
                    options={contentSections
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
                      ...contentSections.map((section) => ({
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

            <Controller
              name="blockType"
              control={control}
              render={({field}) => (
                <Select
                  label={t('blockTypeLabel')}
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value as ContentBlockFormValues['blockType']
                    )
                  }
                  options={CONTENT_BLOCK_TYPE_OPTIONS.map((option) => ({
                    value: option.value,
                    label: t(option.labelKey as never)
                  }))}
                  hint={t('blockTypeHint')}
                />
              )}
            />
          </div>
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
          title={t('subtitlesCardTitle')}
          description={t('subtitlesCardDescription')}
        >
          <BilingualFieldGroup
            title={t('subtitlesGroupTitle')}
            description={t('subtitlesGroupDescription')}
            ptLabel={t('ptLabel')}
            enLabel={t('enLabel')}
            copyPtToEnLabel={t('copyPtToEn')}
            copyEnToPtLabel={t('copyEnToPt')}
            onCopyPtToEn={() =>
              setValue('subtitleEn', getValues('subtitlePt'), {shouldDirty: true})
            }
            onCopyEnToPt={() =>
              setValue('subtitlePt', getValues('subtitleEn'), {shouldDirty: true})
            }
            ptField={
              <Input
                id="subtitlePt"
                label={t('subtitlePtLabel')}
                {...register('subtitlePt')}
                error={fieldErrors.subtitlePt}
                hint={t('subtitlePtHint')}
              />
            }
            enField={
              <Input
                id="subtitleEn"
                label={t('subtitleEnLabel')}
                {...register('subtitleEn')}
                error={fieldErrors.subtitleEn}
                hint={t('subtitleEnHint')}
              />
            }
          />
        </SettingsCard>

        {needsTextContent ? (
          <SettingsCard
            title={t('contentCardTitle')}
            description={t('contentCardDescription')}
          >
            <BilingualFieldGroup
              title={t('contentGroupTitle')}
              description={t('contentGroupDescription')}
              ptLabel={t('ptLabel')}
              enLabel={t('enLabel')}
              copyPtToEnLabel={t('copyPtToEn')}
              copyEnToPtLabel={t('copyEnToPt')}
              onCopyPtToEn={() =>
                setValue('contentEn', getValues('contentPt'), {shouldDirty: true})
              }
              onCopyEnToPt={() =>
                setValue('contentPt', getValues('contentEn'), {shouldDirty: true})
              }
              ptField={
                <Textarea
                  id="contentPt"
                  label={t('contentPtLabel')}
                  {...register('contentPt')}
                  hint={t('contentPtHint')}
                  rows={6}
                />
              }
              enField={
                <Textarea
                  id="contentEn"
                  label={t('contentEnLabel')}
                  {...register('contentEn')}
                  hint={t('contentEnHint')}
                  rows={6}
                />
              }
            />
          </SettingsCard>
        ) : null}

        {needsImage ? (
          <SettingsCard
            title={t('imageCardTitle')}
            description={t('imageCardDescription')}
          >
            <Controller
              name="imageUrl"
              control={control}
              render={({field}) => (
                <MediaUploadField
                  label={t('imageLabel')}
                  value={field.value || ''}
                  type="IMAGE"
                  onChange={field.onChange}
                />
              )}
            />
          </SettingsCard>
        ) : null}

        {needsVideo ? (
          <SettingsCard
            title={t('videoCardTitle')}
            description={t('videoCardDescription')}
          >
            <Input
              id="videoUrl"
              label={t('videoUrlLabel')}
              {...register('videoUrl')}
              hint={t('videoUrlHint')}
            />
          </SettingsCard>
        ) : null}

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
      </div>

      <ContentBlockFormSidebar
        values={watchedValues}
        linkedSection={selectedSection}
      />
    </form>
  );
}