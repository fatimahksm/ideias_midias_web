import type {AppError} from '@/types/api';

export class HttpError extends Error {
  status?: number;
  code?: string;
  fieldErrors?: Record<string, string[]>;
  raw?: unknown;

  constructor(error: AppError) {
    super(error.message);
    this.name = 'HttpError';
    this.status = error.status;
    this.code = error.code;
    this.fieldErrors = error.fieldErrors;
    this.raw = error.raw;
  }
}