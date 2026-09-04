'use client';

import {Fragment, useMemo, useRef, useState} from 'react';
import {useMutation} from '@tanstack/react-query';
import {ChevronDown, ChevronUp} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import {SettingsCard} from '@/components/common/settings-card';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {MediaLibraryPickerModal} from '@/features/media-library/components/media-library-picker-modal';
import {resolveMediaUrl} from '@/features/media-library/utils';
import type {MediaLibraryItem} from '@/features/media-library/types';
import {commitImport, downloadImportTemplate, previewImport} from '../api';
import type {
  FieldOverride,
  ImportFieldMeta,
  ImportRowSummary,
  ImportSheetResult,
  ImportSummaryResponse
} from '../types';

type PickerTarget = {
  sheet: string;
  rowNumber: number;
  field: string;
  mediaType: 'IMAGE' | 'VIDEO';
};

const SHEET_LABEL_KEYS: Record<string, string> = {
  Sections: 'sheetLabelSections',
  Categories: 'sheetLabelCategories',
  Items: 'sheetLabelItems',
  PortfolioProjects: 'sheetLabelPortfolioProjects',
  ContentBlocks: 'sheetLabelContentBlocks',
  HomeCards: 'sheetLabelHomeCards',
  ContactMethods: 'sheetLabelContactMethods'
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
  const [overrides, setOverrides] = useState<Record<string, FieldOverride>>({});
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);

  const overridesList = useMemo(() => Object.values(overrides), [overrides]);

  const previewMutation = useMutation({
    mutationFn: ({file, fieldOverrides}: {file: File; fieldOverrides: FieldOverride[]}) =>
      previewImport(file, fieldOverrides),
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
    mutationFn: ({file, fieldOverrides}: {file: File; fieldOverrides: FieldOverride[]}) =>
      commitImport(file, fieldOverrides),
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
    previewMutation.mutate({file: selectedFile, fieldOverrides: overridesList});
  }

  function handleCommit() {
    if (!selectedFile) return;
    commitMutation.mutate({file: selectedFile, fieldOverrides: overridesList});
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

  function setOverride(sheet: string, rowNumber: number, field: string, value: string) {
    setOverrides((prev) => ({
      ...prev,
      [slotKey(sheet, rowNumber, field)]: {sheet, rowNumber, field, value}
    }));
  }

  function clearOverride(sheet: string, rowNumber: number, field: string) {
    setOverrides((prev) => {
      const next = {...prev};
      delete next[slotKey(sheet, rowNumber, field)];
      return next;
    });
  }

  function fieldValue(sheet: string, row: ImportRowSummary, field: string) {
    const override = overrides[slotKey(sheet, row.rowNumber, field)];
    return override ? override.value : (row.fields[field] ?? '');
  }

  function handlePickImage(item: MediaLibraryItem) {
    if (!pickerTarget) return;
    setOverride(pickerTarget.sheet, pickerTarget.rowNumber, pickerTarget.field, item.fileUrl);
    setPickerTarget(null);
  }

  const totalRows =
    result?.sheets.reduce((sum, sheet) => sum + sheet.totalDataRows, 0) ?? 0;
  const totalSucceeded =
    result?.sheets.reduce((sum, sheet) => sum + sheet.succeeded, 0) ?? 0;
  const totalErrors =
    result?.sheets.reduce((sum, sheet) => sum + sheet.errors.length, 0) ?? 0;

  const sheetsWithRows = result?.sheets.filter((sheet) => sheet.rows.length > 0) ?? [];

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

      {sheetsWithRows.length > 0 ? (
        <SettingsCard title={t('reviewCardTitle')} description={t('reviewCardDescription')}>
          <div className="space-y-8">
            {sheetsWithRows.map((sheet) => (
              <SheetReview
                key={sheet.sheet}
                sheet={sheet}
                t={t}
                fieldValue={fieldValue}
                setOverride={setOverride}
                clearOverride={clearOverride}
                onPickMedia={(rowNumber, field, mediaType) =>
                  setPickerTarget({sheet: sheet.sheet, rowNumber, field, mediaType})
                }
              />
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-5">
            <Button
              type="button"
              variant="outline"
              disabled={!selectedFile || isBusy}
              isLoading={previewMutation.isPending}
              loadingText={t('previewing')}
              onClick={handlePreview}
            >
              {t('recheckAction')}
            </Button>
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
                  <h3 className="text-base font-semibold text-slate-900">
                    {t(SHEET_LABEL_KEYS[sheet.sheet] as never)}
                  </h3>
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

type SheetReviewProps = {
  sheet: ImportSheetResult;
  t: ReturnType<typeof useTranslations<'DataImportManager'>>;
  fieldValue: (sheet: string, row: ImportRowSummary, field: string) => string;
  setOverride: (sheet: string, rowNumber: number, field: string, value: string) => void;
  clearOverride: (sheet: string, rowNumber: number, field: string) => void;
  onPickMedia: (rowNumber: number, field: string, mediaType: 'IMAGE' | 'VIDEO') => void;
};

function SheetReview({
  sheet,
  t,
  fieldValue,
  setOverride,
  clearOverride,
  onPickMedia
}: SheetReviewProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const errorsByRow = useMemo(() => {
    const map = new Map<number, string>();
    for (const err of sheet.errors) {
      map.set(err.rowNumber, err.message);
    }
    return map;
  }, [sheet.errors]);

  // Only the fields that matter at a glance (required ones, plus images —
  // the main thing this screen is for editing) get their own column; every
  // optional text/number field is one click away instead of stretching the
  // table with columns most rows leave blank.
  const primaryFields = useMemo(
    () =>
      sheet.fieldsMeta.filter(
        (meta) => meta.required || meta.type === 'IMAGE' || meta.type === 'VIDEO'
      ),
    [sheet.fieldsMeta]
  );
  const secondaryFields = useMemo(
    () =>
      sheet.fieldsMeta.filter(
        (meta) => !meta.required && meta.type !== 'IMAGE' && meta.type !== 'VIDEO'
      ),
    [sheet.fieldsMeta]
  );

  function toggleRow(rowNumber: number) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowNumber)) {
        next.delete(rowNumber);
      } else {
        next.add(rowNumber);
      }
      return next;
    });
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {t(SHEET_LABEL_KEYS[sheet.sheet] as never)}
      </h3>

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full min-w-max border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="sticky left-0 z-10 border-b border-slate-200 bg-slate-50 px-2.5 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('rowNumberColumn')}
              </th>
              {primaryFields.map((meta) => (
                <th
                  key={meta.field}
                  className="border-b border-slate-200 px-2.5 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {t(`field_${meta.field}` as never)}
                  {meta.required ? ' *' : ''}
                </th>
              ))}
              {secondaryFields.length > 0 ? (
                <th className="w-10 border-b border-l border-slate-200 bg-slate-50" />
              ) : null}
            </tr>
          </thead>

          <tbody>
            {sheet.rows.map((row) => {
              const rowError = errorsByRow.get(row.rowNumber);
              const sectionSlugForFiltering = fieldValue(sheet.sheet, row, 'section_slug');
              const rowBg = rowError ? 'bg-red-50/60' : 'bg-white';
              const isExpanded = expandedRows.has(row.rowNumber);

              return (
                <Fragment key={row.rowNumber}>
                  <tr className="border-b border-slate-100 last:border-b-0">
                    <td className={`sticky left-0 z-10 px-2.5 py-1.5 align-top ${rowBg}`}>
                      <p className="text-sm font-medium text-slate-800">#{row.rowNumber}</p>
                      {rowError ? (
                        <p className="mt-1 max-w-[12rem] text-xs text-red-700">{rowError}</p>
                      ) : null}
                    </td>

                    {primaryFields.map((meta) => (
                      <td key={meta.field} className={`px-2.5 py-1.5 align-top ${rowBg}`}>
                        <FieldEditor
                          meta={meta}
                          value={fieldValue(sheet.sheet, row, meta.field)}
                          options={sheet.fieldOptions[meta.field] ?? []}
                          groupFilter={
                            meta.field === 'category_name_en' ? sectionSlugForFiltering : undefined
                          }
                          t={t}
                          onChange={(value) =>
                            setOverride(sheet.sheet, row.rowNumber, meta.field, value)
                          }
                          onClear={() => clearOverride(sheet.sheet, row.rowNumber, meta.field)}
                          onPickMedia={() =>
                            onPickMedia(
                              row.rowNumber,
                              meta.field,
                              meta.type === 'VIDEO' ? 'VIDEO' : 'IMAGE'
                            )
                          }
                        />
                      </td>
                    ))}

                    {secondaryFields.length > 0 ? (
                      <td className={`border-l border-slate-100 px-1.5 py-1.5 align-top ${rowBg}`}>
                        <button
                          type="button"
                          onClick={() => toggleRow(row.rowNumber)}
                          className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                          {isExpanded ? t('hideMoreFields') : t('showMoreFields')}
                        </button>
                      </td>
                    ) : null}
                  </tr>

                  {isExpanded && secondaryFields.length > 0 ? (
                    <tr className="border-b border-slate-100 last:border-b-0">
                      <td colSpan={primaryFields.length + 2} className={`px-2.5 py-3 ${rowBg}`}>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {secondaryFields.map((meta) => (
                            <label key={meta.field} className="block space-y-1">
                              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                {t(`field_${meta.field}` as never)}
                              </span>
                              <FieldEditor
                                meta={meta}
                                value={fieldValue(sheet.sheet, row, meta.field)}
                                options={sheet.fieldOptions[meta.field] ?? []}
                                groupFilter={
                                  meta.field === 'category_name_en'
                                    ? sectionSlugForFiltering
                                    : undefined
                                }
                                t={t}
                                onChange={(value) =>
                                  setOverride(sheet.sheet, row.rowNumber, meta.field, value)
                                }
                                onClear={() => clearOverride(sheet.sheet, row.rowNumber, meta.field)}
                                onPickMedia={() => {}}
                              />
                            </label>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type FieldEditorProps = {
  meta: ImportFieldMeta;
  value: string;
  options: {value: string; label: string; groupKey: string | null}[];
  groupFilter?: string;
  t: ReturnType<typeof useTranslations<'DataImportManager'>>;
  onChange: (value: string) => void;
  onClear: () => void;
  onPickMedia: () => void;
};

function FieldEditor({
  meta,
  value,
  options,
  groupFilter,
  t,
  onChange,
  onClear,
  onPickMedia
}: FieldEditorProps) {
  const inputClassName =
    'w-full min-w-[11rem] rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-accent)]/10';

  if (meta.type === 'IMAGE' || meta.type === 'VIDEO') {
    const resolvedUrl = resolveMediaUrl(value || undefined);

    return (
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        {resolvedUrl ? (
          <div className="h-7 w-7 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
            {meta.type === 'VIDEO' ? (
              <video src={resolvedUrl} className="h-full w-full object-cover" muted />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resolvedUrl} alt="" className="h-full w-full object-cover" />
            )}
          </div>
        ) : (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-center text-[8px] leading-tight text-slate-400">
            {t('noImage')}
          </div>
        )}

        <button
          type="button"
          onClick={onPickMedia}
          className="text-xs font-medium text-[var(--color-primary)] underline-offset-2 hover:underline"
        >
          {resolvedUrl ? t('changeImage') : t('pickImage')}
        </button>

        {value ? (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-red-600 underline-offset-2 hover:underline"
          >
            {t('clearImage')}
          </button>
        ) : null}
      </div>
    );
  }

  if (meta.type === 'BOOLEAN') {
    return (
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClassName}
      >
        <option value="">{t('booleanDefault')}</option>
        <option value="true">{t('booleanYes')}</option>
        <option value="false">{t('booleanNo')}</option>
      </select>
    );
  }

  if (meta.type === 'SELECT') {
    const filteredOptions =
      meta.field === 'category_name_en'
        ? options.filter((option) => !groupFilter || option.groupKey === groupFilter.trim().toLowerCase())
        : options;

    return (
      <div className="space-y-1">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClassName}
        >
          <option value="">{t('selectPlaceholder')}</option>
          {filteredOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {filteredOptions.length === 0 ? (
          <span className="block text-xs whitespace-nowrap text-amber-700">
            {t('noOptionsAvailable')}
          </span>
        ) : null}
      </div>
    );
  }

  if (meta.type === 'DATE') {
    return (
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClassName}
      />
    );
  }

  if (meta.type === 'INTEGER') {
    return (
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClassName} min-w-[6rem]`}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={inputClassName}
    />
  );
}
