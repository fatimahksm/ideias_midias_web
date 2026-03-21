export type ApiFieldErrors = Record<string, string[]>;

export type ApiSuccessResponse<T = unknown> = {
  success: true;
  message?: string;
  data?: T;
  timestamp?: string;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  error?: string;
  status?: number;
  code?: string;
  path?: string;
  timestamp?: string;
  fieldErrors?: ApiFieldErrors;
};

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export type AppError = {
  message: string;
  status?: number;
  code?: string;
  fieldErrors?: ApiFieldErrors;
  raw?: unknown;
};