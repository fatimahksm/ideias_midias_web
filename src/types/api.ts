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
  status?: number;
  code?: string;
  path?: string;
  timestamp?: string;
  errors?: ApiFieldErrors;
};

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export type AppError = {
  message: string;
  status?: number;
  code?: string;
  path?: string;
  timestamp?: string;
  errors?: ApiFieldErrors;
  raw?: unknown;
};
/** One page of a list, as the API returns it. */
export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};
