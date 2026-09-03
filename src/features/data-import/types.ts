export type ImportRowError = {
  rowNumber: number;
  message: string;
};

export type ImportSheetResult = {
  sheet: string;
  present: boolean;
  totalDataRows: number;
  succeeded: number;
  errors: ImportRowError[];
};

export type ImportSummaryResponse = {
  committed: boolean;
  sheets: ImportSheetResult[];
};
