export type ImportRowError = {
  rowNumber: number;
  message: string;
};

export type ImportMediaType = 'IMAGE' | 'VIDEO';

export type ImportImageField = {
  field: string;
  mediaType: ImportMediaType;
  currentValue: string | null;
};

export type ImportRowSummary = {
  rowNumber: number;
  label: string | null;
  imageFields: ImportImageField[];
};

export type ImportSheetResult = {
  sheet: string;
  present: boolean;
  totalDataRows: number;
  succeeded: number;
  errors: ImportRowError[];
  rows: ImportRowSummary[];
};

export type ImportSummaryResponse = {
  committed: boolean;
  sheets: ImportSheetResult[];
};

export type ImageOverride = {
  sheet: string;
  rowNumber: number;
  field: string;
  url: string;
};
