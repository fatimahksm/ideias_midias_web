'use client';

import {useRef, useState} from 'react';
import {useMutation} from '@tanstack/react-query';
import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import {SettingsCard} from '@/components/common/settings-card';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {commitImport, downloadImportTemplate, previewImport} from '../api';
import type {ImportSummaryResponse} from '../types';

export default function DataImportManager() {
  const t = useTranslations('DataImportManager');
  const errorT = useTranslations('CommonErrors');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportSummaryResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadError, setDownloadError] = useState('');

  const previewMutation = useMutation({
    mutationFn: previewImport,
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
    mutationFn: commitImport,
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
    previewMutation.mutate(selectedFile);
  }

  function handleCommit() {
    if (!selectedFile) return;
    commitMutation.mutate(selectedFile);
  }

  function handleReset() {
    setSelectedFile(null);
    setResult(null);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const totalRows =
    result?.sheets.reduce((sum, sheet) => sum + sheet.totalDataRows, 0) ?? 0;
  const totalSucceeded =
    result?.sheets.reduce((sum, sheet) => sum + sheet.succeeded, 0) ?? 0;
  const totalErrors =
    result?.sheets.reduce((sum, sheet) => sum + sheet.errors.length, 0) ?? 0;

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
    </div>
  );
}
