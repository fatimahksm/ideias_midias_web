'use client';

import {useMemo, useRef, useState} from 'react';
import {useMutation} from '@tanstack/react-query';
import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import {SettingsCard} from '@/components/common/settings-card';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {MediaLibraryPickerModal} from '@/features/media-library/components/media-library-picker-modal';
import {resolveMediaUrl} from '@/features/media-library/utils';
import type {MediaLibraryItem} from '@/features/media-library/types';
import {commitImport, downloadImportTemplate, previewImport} from '../api';
import type {ImageOverride, ImportMediaType, ImportSummaryResponse} from '../types';

type PickerTarget = {
  sheet: string;
  rowNumber: number;
  field: string;
  mediaType: ImportMediaType;
};

function slotKey(sheet: string, rowNumber: number, field: string) {
  return `${sheet}|${rowNumber}|${field}`;
}

export default function DataImportManager() {
  const t = useTranslations('DataImportManager');
  const errorT = useTranslations('CommonErrors');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportSummaryResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [overrides, setOverrides] = useState<Record<string, ImageOverride>>({});
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);

  const overridesList = useMemo(() => Object.values(overrides), [overrides]);

  const previewMutation = useMutation({
    mutationFn: ({file, imageOverrides}: {file: File; imageOverrides: ImageOverride[]}) =>
      previewImport(file, imageOverrides),
    onSuccess: (data) => {
      setResult(data);
      setErrorMessage('');
    },
    onError: (error) => {
      setResult(null);
      setErrorMessage(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  const commitMutation = useMutation({
    mutationFn: ({file, imageOverrides}: {file: File; imageOverrides: ImageOverride[]}) =>
      commitImport(file, imageOverrides),
    onSuccess: (data) => {
      setResult(data);
      setErrorMessage('');
    },
    onError: (error) => {
      setErrorMessage(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  const isBusy = previewMutation.isPending || commitMutation.isPending;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setResult(null);
    setErrorMessage('');
    setOverrides({});
  }

  async function handleDownloadTemplate() {
    setDownloadError('');
    try {
      await downloadImportTemplate();
    } catch (error) {
      setDownloadError(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  }

  function handlePreview() {
    if (!selectedFile) return;
    previewMutation.mutate({file: selectedFile, imageOverrides: overridesList});
  }

  function handleCommit() {
    if (!selectedFile) return;
    commitMutation.mutate({file: selectedFile, imageOverrides: overridesList});
  }

  function handleReset() {
    setSelectedFile(null);
    setResult(null);
    setErrorMessage('');
    setOverrides({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handlePickImage(item: MediaLibraryItem) {
    if (!pickerTarget) return;

    setOverrides((prev) => ({
      ...prev,
      [slotKey(pickerTarget.sheet, pickerTarget.rowNumber, pickerTarget.field)]: {
        sheet: pickerTarget.sheet,
        rowNumber: pickerTarget.rowNumber,
        field: pickerTarget.field,
        url: item.fileUrl
      }
    }));
    setPickerTarget(null);
  }

  function handleClearOverride(key: string) {
    setOverrides((prev) => {
      const next = {...prev};
      delete next[key];
      return next;
    });
  }

  const totalRows =
    result?.sheets.reduce((sum, sheet) => sum + sheet.totalDataRows, 0) ?? 0;
  const totalSucceeded =
    result?.sheets.reduce((sum, sheet) => sum + sheet.succeeded, 0) ?? 0;
  const totalErrors =
    result?.sheets.reduce((sum, sheet) => sum + sheet.errors.length, 0) ?? 0;

  const sheetsWithImages = result?.sheets.filter((sheet) => sheet.rows.length > 0) ?? [];

  return (
    <div className="space-y-6">
      <SettingsCard title={t('templateCardTitle')} description={t('templateCardDescription')}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="button" variant="outline" onClick={handleDownloadTemplate}>
            {t('downloadTemplate')}
          </Button>
          {downloadError ? (
            <p className="text-sm text-red-600">{downloadError}</p>
          ) : null}
        </div>
      </SettingsCard>

      <SettingsCard title={t('uploadCardTitle')} description={t('uploadCardDescription')}>
        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              disabled={isBusy}
              className="block w-full max-w-md text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-[var(--color-primary)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:opacity-90"
            />
          </div>

          {selectedFile ? (
            <p className="text-sm text-slate-600">
              {t('selectedFile', {name: selectedFile.name})}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={!selectedFile || isBusy}
              isLoading={previewMutation.isPending}
              loadingText={t('previewing')}
              onClick={handlePreview}
            >
              {t('previewAction')}
            </Button>

            <Button
              type="button"
              variant="primary"
              disabled={!selectedFile || isBusy}
              isLoading={commitMutation.isPending}
              loadingText={t('committing')}
              onClick={handleCommit}
            >
              {t('commitAction')}
            </Button>

            {selectedFile || result ? (
              <Button type="button" variant="ghost" disabled={isBusy} onClick={handleReset}>
                {t('resetAction')}
              </Button>
            ) : null}
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}
        </div>
      </SettingsCard>

      {sheetsWithImages.length > 0 ? (
        <SettingsCard title={t('imagesCardTitle')} description={t('imagesCardDescription')}>
          <div className="space-y-6">
            {sheetsWithImages.map((sheet) => (
              <div key={sheet.sheet}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {sheet.sheet}
                </h3>
                <div className="space-y-3">
                  {sheet.rows.map((row) => (
                    <div
                      key={row.rowNumber}
                      className="rounded-2xl border border-slate-200 p-3"
                    >
                      <p className="mb-3 text-sm font-medium text-slate-800">
                        {t('rowLabel', {
                          row: row.rowNumber,
                          label: row.label || t('untitledRow')
                        })}
                      </p>

                      <div className="flex flex-wrap gap-3">
                        {row.imageFields.map((field) => {
                          const key = slotKey(sheet.sheet, row.rowNumber, field.field);
                          const effectiveValue =
                            overrides[key]?.url ?? field.currentValue;
                          const resolvedUrl = resolveMediaUrl(effectiveValue);

                          return (
                            <div key={field.field} className="w-36 space-y-2">
                              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                {field.field}
                              </p>

                              <div className="h-20 w-full overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
                                {resolvedUrl ? (
                                  field.mediaType === 'VIDEO' ? (
                                    <video
                                      src={resolvedUrl}
                                      className="h-full w-full object-cover"
                                      muted
                                    />
                                  ) : (
                                    <img
                                      src={resolvedUrl}
                                      alt=""
                                      className="h-full w-full object-cover"
                                    />
                                  )
                                ) : (
                                  <div className="flex h-full items-center justify-center px-2 text-center text-xs text-slate-400">
                                    {t('noImage')}
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setPickerTarget({
                                      sheet: sheet.sheet,
                                      rowNumber: row.rowNumber,
                                      field: field.field,
                                      mediaType: field.mediaType
                                    })
                                  }
                                >
                                  {resolvedUrl ? t('changeImage') : t('pickImage')}
                                </Button>

                                {overrides[key] ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleClearOverride(key)}
                                  >
                                    {t('clearImage')}
                                  </Button>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SettingsCard>
      ) : null}

      {result ? (
        <SettingsCard
          title={result.committed ? t('resultsCommittedTitle') : t('resultsPreviewTitle')}
          description={t('resultsSummary', {
            total: totalRows,
            succeeded: totalSucceeded,
            errors: totalErrors
          })}
        >
          <div className="space-y-5">
            {result.sheets.map((sheet) => (
              <div key={sheet.sheet} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-slate-900">{sheet.sheet}</h3>
                  {sheet.present ? (
                    <span className="text-sm text-slate-500">
                      {t('sheetCounts', {
                        succeeded: sheet.succeeded,
                        total: sheet.totalDataRows
                      })}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">{t('sheetNotPresent')}</span>
                  )}
                </div>

                {sheet.errors.length > 0 ? (
                  <ul className="mt-3 space-y-1 text-sm text-red-700">
                    {sheet.errors.map((rowError) => (
                      <li key={rowError.rowNumber}>
                        {t('rowError', {row: rowError.rowNumber, message: rowError.message})}
                      </li>
                    ))}
                  </ul>
                ) : sheet.present && sheet.totalDataRows > 0 ? (
                  <p className="mt-3 text-sm text-green-700">{t('sheetAllOk')}</p>
                ) : null}
              </div>
            ))}

            {!result.committed && totalSucceeded > 0 ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {t('previewHint')}
              </div>
            ) : null}
          </div>
        </SettingsCard>
      ) : null}

      <MediaLibraryPickerModal
        open={pickerTarget !== null}
        type={pickerTarget?.mediaType ?? 'IMAGE'}
        onClose={() => setPickerTarget(null)}
        onSelect={handlePickImage}
      />
    </div>
  );
}
