export type ApiFieldErrors = Record<string, string>;

export type ApiSuccessResponse<T = unknown> = {
  success: true;
  message?: string;
  data?: T;
  timestamp?: string;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: ApiFieldErrors;
  timestamp?: string;
  status?: number;
  code?: string;
};

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export type AppError = {
  message: string;
  status?: number;
  code?: string;
  errors?: ApiFieldErrors;
  raw?: unknown;
};