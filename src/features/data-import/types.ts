export type ImportRowError = {
  rowNumber: number;
  message: string;
};

export type ImportFieldType =
  | 'TEXT'
  | 'BOOLEAN'
  | 'INTEGER'
  | 'DATE'
  | 'SELECT'
  | 'IMAGE'
  | 'VIDEO';

export type ImportFieldMeta = {
  field: string;
  type: ImportFieldType;
  required: boolean;
};

export type ImportFieldOption = {
  value: string;
  label: string;
  groupKey: string | null;
};

export type ImportRowSummary = {
  rowNumber: number;
  label: string | null;
  fields: Record<string, string>;
};

export type ImportSheetResult = {
  sheet: string;
  present: boolean;
  totalDataRows: number;
  succeeded: number;
  errors: ImportRowError[];
  rows: ImportRowSummary[];
  fieldsMeta: ImportFieldMeta[];
  fieldOptions: Record<string, ImportFieldOption[]>;
};

export type ImportSummaryResponse = {
  committed: boolean;
  sheets: ImportSheetResult[];
};

export type FieldOverride = {
  sheet: string;
  rowNumber: number;
  field: string;
  value: string;
};
