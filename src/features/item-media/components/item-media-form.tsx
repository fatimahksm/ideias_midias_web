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
import {MediaUploadField} from '@/features/media-library/components/media-upload-field';
import {getItemById} from '@/features/items/api';
import type {SectionItemResponse} from '@/features/items/types';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {useToast} from '@/components/common/toast-provider';
import {
  createItemMedia,
  getItemMediaById,
  getItemMediaByItem,
  updateItemMedia
} from '../api';
import {itemMediaSchema, type ItemMediaFormValues} from '../schema';
import type {SectionItemMediaPayload} from '../types';
import {emptyToNull, getNextItemMediaSortOrder} from '../utils';
import {ItemMediaFormSidebar} from './item-media-form-sidebar';
import {CopyButton} from '@/components/common/copy-button';

type Props = {
  mode: 'create' | 'edit';
  itemId: number;
  mediaId?: number;
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

export default function ItemMediaForm({mode, itemId, mediaId}: Props) {
  const t = useTranslations('ItemMediaForm');
  const common = useTranslations('Common');
  const errorT = useTranslations('CommonErrors');
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();

  const {showSuccess, showError} = useToast();

  // The form is two screens: everything about the content, then publishing.
  // Both are one click away, so changing one field never means scrolling past
  // everything else.
  const [step, setStep] = useState(0);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: {errors, touchedFields}
  } = useForm<ItemMediaFormValues>({
    resolver: zodResolver(itemMediaSchema),
    defaultValues: {
      itemId,
      mediaType: 'IMAGE',
      mediaUrl: '',
      thumbnailUrl: '',
      altTextPt: '',
      altTextEn: '',
      isActive: true,
      sortOrder: 0
    }
  });

  const itemQuery = useQuery({
    queryKey: ['items', itemId],
    queryFn: () => getItemById(itemId)
  });

  const itemMediaQuery = useQuery({
    queryKey: ['item-media', 'item', itemId],
    queryFn: () => getItemMediaByItem(itemId)
  });

  const singleMediaQuery = useQuery({
    queryKey: ['item-media', mediaId],
    queryFn: () => getItemMediaById(mediaId as number),
    enabled: mode === 'edit' && Boolean(mediaId)
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: SectionItemMediaPayload) => {
      if (mode === 'edit' && mediaId) {
        return updateItemMedia(mediaId, payload);
      }

      return createItemMedia(payload);
    },
    onSuccess: async (savedMedia) => {
  showSuccess(mode === 'edit' ? t('saveSuccess') : t('createSuccess'));

  await Promise.all([
    queryClient.invalidateQueries({queryKey: ['item-media', 'item', itemId]}),
    queryClient.invalidateQueries({queryKey: ['item-media']})
  ]);

  if (mode === 'create') {
    router.replace(`/${locale}/admin/items/${itemId}/media`);
    return;
  }

  reset({
    itemId: savedMedia.itemId,
    mediaType: savedMedia.mediaType,
    mediaUrl: savedMedia.mediaUrl,
    thumbnailUrl: savedMedia.thumbnailUrl ?? '',
    altTextPt: savedMedia.altTextPt ?? '',
    altTextEn: savedMedia.altTextEn ?? '',
    isActive: savedMedia.isActive,
    sortOrder: savedMedia.sortOrder
  });
},
    onError: (error) => {
      showError(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  useEffect(() => {
    if (!singleMediaQuery.data) return;

    const media = singleMediaQuery.data;

    reset({
      itemId: media.itemId,
      mediaType: media.mediaType,
      mediaUrl: media.mediaUrl,
      thumbnailUrl: media.thumbnailUrl ?? '',
      altTextPt: media.altTextPt ?? '',
      altTextEn: media.altTextEn ?? '',
      isActive: media.isActive,
      sortOrder: media.sortOrder
    });
  }, [singleMediaQuery.data, reset]);

  useEffect(() => {
    setValue('itemId', itemId, {shouldValidate: true});
  }, [itemId, setValue]);

  useEffect(() => {
    if (mode !== 'create') return;
    if (!itemMediaQuery.data?.length) return;
    if (touchedFields.sortOrder) return;
    if ((getValues('sortOrder') || 0) > 0) return;

    setValue(
      'sortOrder',
      getNextItemMediaSortOrder(itemMediaQuery.data, itemId),
      {shouldValidate: true}
    );
  }, [
    mode,
    itemMediaQuery.data,
    itemId,
    touchedFields.sortOrder,
    getValues,
    setValue
  ]);

  const watchedValues = watch();

  const isVideo = watchedValues.mediaType === 'VIDEO';

  const fieldErrors = useMemo(
    () => ({
      mediaUrl: errors.mediaUrl?.message
        ? t(errors.mediaUrl.message as never)
        : undefined,
      altTextPt: errors.altTextPt?.message
        ? t(errors.altTextPt.message as never)
        : undefined,
      altTextEn: errors.altTextEn?.message
        ? t(errors.altTextEn.message as never)
        : undefined,
      sortOrder: errors.sortOrder?.message
        ? t(errors.sortOrder.message as never)
        : undefined
    }),
    [errors, t]
  );

  async function onSubmit(values: ItemMediaFormValues) {
    const payload: SectionItemMediaPayload = {
      itemId,
      mediaType: values.mediaType,
      mediaUrl: values.mediaUrl.trim(),
      thumbnailUrl: emptyToNull(values.thumbnailUrl),
      altTextPt: emptyToNull(values.altTextPt),
      altTextEn: emptyToNull(values.altTextEn),
      isActive: values.isActive,
      sortOrder: values.sortOrder
    };

    await saveMutation.mutateAsync(payload);
  }

  if ((mode === 'edit' && singleMediaQuery.isPending) || itemQuery.isPending) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">{common('loading')}</p>
      </div>
    );
  }

  if ((mode === 'edit' && singleMediaQuery.isError) || itemQuery.isError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-sm text-red-700">
          {getErrorMessage(
            toAppError(singleMediaQuery.error || itemQuery.error),
            (key) => errorT(key)
          )}
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
          <Link href={`/admin/items/${itemId}/media`}>
            <Button type="button" variant="outline">
              {t('backToMedia')}
            </Button>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              isLoading={saveMutation.isPending}
              loadingText={common('loading')}
            >
              {mode === 'edit' ? t('saveButton') : t('createButton')}
            </Button>
          </div>
        </div>

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
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {t('linkedItemLabel')}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {itemQuery.data?.titleEn || t('unknownItem')}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              #{itemId}
            </p>
          </div>
        </SettingsCard>

        <SettingsCard
          title={t('mediaCardTitle')}
          description={t('mediaCardDescription')}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Controller
              name="mediaType"
              control={control}
              render={({field}) => (
                <Select
                  label={t('mediaTypeLabel')}
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(event.target.value as 'IMAGE' | 'VIDEO')
                  }
                  options={[
                    {value: 'IMAGE', label: t('typeImage')},
                    {value: 'VIDEO', label: t('typeVideo')}
                  ]}
                  hint={t('mediaTypeHint')}
                />
              )}
            />

            <Controller
              name="mediaUrl"
              control={control}
              render={({field}) =>
                watchedValues.mediaType === 'IMAGE' ? (
                  <MediaUploadField
                    label={t('mediaUrlLabel')}
                    value={field.value || ''}
                    type="IMAGE"
                    onChange={field.onChange}
                  />
                ) : (
                  <Input
                    id="mediaUrl"
                    label={t('mediaUrlLabel')}
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldErrors.mediaUrl}
                    hint={t('mediaUrlVideoHint')}
                  />
                )
              }
            />
          </div>

          <div className="mt-5">
            <Controller
              name="thumbnailUrl"
              control={control}
              render={({field}) =>
                isVideo ? (
                  <MediaUploadField
                    label={t('thumbnailUrlLabel')}
                    value={field.value || ''}
                    type="IMAGE"
                    onChange={field.onChange}
                  />
                ) : (
                  <Input
                    id="thumbnailUrl"
                    label={t('thumbnailUrlLabel')}
                    value={field.value}
                    onChange={field.onChange}
                    hint={t('thumbnailUrlImageHint')}
                  />
                )
              }
            />
          </div>
        </SettingsCard>

        <SettingsCard
          title={t('altTextCardTitle')}
          description={t('altTextCardDescription')}
        >
          <BilingualFieldGroup
            title={t('altTextGroupTitle')}
            description={t('altTextGroupDescription')}
            ptLabel={t('ptLabel')}
            enLabel={t('enLabel')}
            copyPtToEnLabel={t('copyPtToEn')}
            copyEnToPtLabel={t('copyEnToPt')}
            onCopyPtToEn={() =>
              setValue('altTextEn', getValues('altTextPt'), {shouldDirty: true})
            }
            onCopyEnToPt={() =>
              setValue('altTextPt', getValues('altTextEn'), {shouldDirty: true})
            }
            ptField={
              <Input
                id="altTextPt"
                label={t('altTextPtLabel')}
                {...register('altTextPt')}
                error={fieldErrors.altTextPt}
                hint={t('altTextPtHint')}
              />
            }
            enField={
              <Input
                id="altTextEn"
                label={t('altTextEnLabel')}
                {...register('altTextEn')}
                error={fieldErrors.altTextEn}
                hint={t('altTextEnHint')}
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

      <ItemMediaFormSidebar
        values={watchedValues}
        linkedItem={itemQuery.data as SectionItemResponse | undefined}
      />
    </form>
  );
}