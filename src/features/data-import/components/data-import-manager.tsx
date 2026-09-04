'use client';

import {useMemo, useRef, useState} from 'react';
import {useMutation} from '@tanstack/react-query';
import {SlidersHorizontal, X} from 'lucide-react';
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
  const [moreFieldsRow, setMoreFieldsRow] = useState<number | null>(null);

  const errorsByRow = useMemo(() => {
    const map = new Map<number, string>();
    for (const err of sheet.errors) {
      map.set(err.rowNumber, err.message);
    }
    return map;
  }, [sheet.errors]);

  // One field carries the card's thumbnail; the other required fields ride
  // along in a single compact line under the title. Everything optional
  // stays out of the card entirely — it's one tap away in a popup instead of
  // pushing the rows below it around, which is what made the old inline
  // "more fields" expander disorienting to use.
  const imageField = useMemo(
    () => sheet.fieldsMeta.find((meta) => meta.type === 'IMAGE' || meta.type === 'VIDEO'),
    [sheet.fieldsMeta]
  );
  const lineFields = useMemo(
    () =>
      sheet.fieldsMeta.filter(
        (meta) => meta.required && meta.type !== 'IMAGE' && meta.type !== 'VIDEO'
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

  const activeRow =
    moreFieldsRow != null ? (sheet.rows.find((row) => row.rowNumber === moreFieldsRow) ?? null) : null;

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {t(SHEET_LABEL_KEYS[sheet.sheet] as never)}
      </h3>

      <div className="space-y-2">
        {sheet.rows.map((row) => {
          const rowError = errorsByRow.get(row.rowNumber);
          const sectionNameEnForFiltering = fieldValue(sheet.sheet, row, 'section_name_en');

          return (
            <article
              key={row.rowNumber}
              className={`flex items-start gap-3 rounded-2xl border p-3 ${
                rowError ? 'border-red-200 bg-red-50/60' : 'border-slate-200 bg-white'
              }`}
            >
              {imageField ? (
                <FieldEditor
                  meta={imageField}
                  value={fieldValue(sheet.sheet, row, imageField.field)}
                  options={sheet.fieldOptions[imageField.field] ?? []}
                  t={t}
                  layout="stacked"
                  onChange={(value) => setOverride(sheet.sheet, row.rowNumber, imageField.field, value)}
                  onClear={() => clearOverride(sheet.sheet, row.rowNumber, imageField.field)}
                  onPickMedia={() =>
                    onPickMedia(row.rowNumber, imageField.field, imageField.type === 'VIDEO' ? 'VIDEO' : 'IMAGE')
                  }
                />
              ) : null}

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {row.label || `#${row.rowNumber}`}
                  </p>
                  {secondaryFields.length > 0 ? (
                    <button
                      type="button"
                      title={t('showMoreFields')}
                      onClick={() => setMoreFieldsRow(row.rowNumber)}
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>

                {rowError ? <p className="mt-0.5 text-xs text-red-700">{rowError}</p> : null}

                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-xs text-slate-400">#{row.rowNumber}</span>
                  {lineFields.map((meta) => (
                    <FieldEditor
                      key={meta.field}
                      meta={meta}
                      value={fieldValue(sheet.sheet, row, meta.field)}
                      options={sheet.fieldOptions[meta.field] ?? []}
                      groupFilter={meta.field === 'category_name_en' ? sectionNameEnForFiltering : undefined}
                      t={t}
                      compact
                      onChange={(value) => setOverride(sheet.sheet, row.rowNumber, meta.field, value)}
                      onClear={() => clearOverride(sheet.sheet, row.rowNumber, meta.field)}
                      onPickMedia={() => {}}
                    />
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {activeRow ? (
        <div
          className="fixed inset-0 z-[135] bg-black/45 backdrop-blur-sm"
          onClick={() => setMoreFieldsRow(null)}
        >
          <div
            className="flex min-h-full items-center justify-center p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <h4 className="truncate text-base font-semibold text-slate-900">
                  {activeRow.label || `#${activeRow.rowNumber}`}
                </h4>
                <button
                  type="button"
                  onClick={() => setMoreFieldsRow(null)}
                  className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  {secondaryFields.map((meta) => (
                    <label key={meta.field} className="block space-y-1">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        {t(`field_${meta.field}` as never)}
                      </span>
                      <FieldEditor
                        meta={meta}
                        value={fieldValue(sheet.sheet, activeRow, meta.field)}
                        options={sheet.fieldOptions[meta.field] ?? []}
                        t={t}
                        onChange={(value) => setOverride(sheet.sheet, activeRow.rowNumber, meta.field, value)}
                        onClear={() => clearOverride(sheet.sheet, activeRow.rowNumber, meta.field)}
                        onPickMedia={() => {}}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
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
  // "compact" shrinks a text/select/etc. control to sit inline in the
  // card's one-line summary; "stacked" lays an image/video field out as a
  // card's leading thumbnail instead of the default beside-the-text form.
  compact?: boolean;
  layout?: 'inline' | 'stacked';
};

function FieldEditor({
  meta,
  value,
  options,
  groupFilter,
  t,
  onChange,
  onClear,
  onPickMedia,
  compact = false,
  layout = 'inline'
}: FieldEditorProps) {
  const inputClassName = compact
    ? 'w-auto min-w-[5rem] max-w-[10rem] rounded-lg border border-slate-300 bg-white px-2 py-0.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-accent)]/10'
    : 'w-full min-w-[11rem] rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-accent)]/10';

  if (meta.type === 'IMAGE' || meta.type === 'VIDEO') {
    const resolvedUrl = resolveMediaUrl(value || undefined);

    if (layout === 'stacked') {
      return (
        <div className="flex w-16 shrink-0 flex-col items-center gap-1">
          {resolvedUrl ? (
            <div className="h-16 w-16 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {meta.type === 'VIDEO' ? (
                <video src={resolvedUrl} className="h-full w-full object-cover" muted />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resolvedUrl} alt="" className="h-full w-full object-cover" />
              )}
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-[9px] leading-tight text-slate-400">
              {t('noImage')}
            </div>
          )}

          <button
            type="button"
            onClick={onPickMedia}
            className="text-center text-[11px] font-medium leading-tight text-[var(--color-primary)] hover:underline"
          >
            {resolvedUrl ? t('changeImage') : t('pickImage')}
          </button>

          {value ? (
            <button
              type="button"
              onClick={onClear}
              className="text-center text-[11px] font-medium leading-tight text-red-600 hover:underline"
            >
              {t('clearImage')}
            </button>
          ) : null}
        </div>
      );
    }

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
        className={compact ? inputClassName : `${inputClassName} min-w-[6rem]`}
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
