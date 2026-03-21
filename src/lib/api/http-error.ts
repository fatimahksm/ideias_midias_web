import type {AppError} from '@/types/api';

export class HttpError extends Error {
  status?: number;
  code?: string;
  errors?: Record<string, string>;
  raw?: unknown;

  constructor(error: AppError) {
    super(error.message);
    this.name = 'HttpError';
    this.status = error.status;
    this.code = error.code;
    this.errors = error.errors;
    this.raw = error.raw;
  }
}