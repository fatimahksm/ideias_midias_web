import {endpoints} from '@/lib/api/endpoints';
import {getAdminToken} from '@/lib/auth/token';
import {HttpError} from '@/lib/api/http-error';
import type {ApiErrorResponse, ApiResponse} from '@/types/api';
import type {ImportSummaryResponse} from './types';

function getRequiredToken() {
  const token = getAdminToken();

  if (!token) {
    throw new Error('No admin token found.');
  }

  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!isJson) {
    if (!response.ok) {
      throw new HttpError({
        message: `Request failed with status ${response.status}`,
        status: response.status
      });
    }

    return undefined as T;
  }

  const payload = (await response.json()) as ApiResponse<T> | T;

  if (!response.ok) {
    const err = payload as ApiErrorResponse;

    throw new HttpError({
      message: err.message || `Request failed with status ${response.status}`,
      status: err.status ?? response.status,
      code: err.code,
      errors: err.errors,
      raw: payload
    });
  }

  if (payload && typeof payload === 'object' && 'success' in payload) {
    const apiPayload = payload as ApiResponse<T>;

    if (apiPayload.success === false) {
      throw new HttpError({
        message: apiPayload.message || 'Request failed.',
        status: apiPayload.status ?? response.status,
        code: apiPayload.code,
        errors: apiPayload.errors,
        raw: payload
      });
    }

    return (apiPayload.data ?? payload) as T;
  }

  return payload as T;
}

/** Downloads the empty import template and hands the browser a real file to save. */
export async function downloadImportTemplate(): Promise<void> {
  const token = getRequiredToken();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoints.admin.dataImportTemplate}`,
    {
      method: 'GET',
      headers: {Authorization: token}
    }
  );

  if (!response.ok) {
    throw new HttpError({
      message: `Request failed with status ${response.status}`,
      status: response.status
    });
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'import-template.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

async function uploadWorkbook(path: string, file: File): Promise<ImportSummaryResponse> {
  const token = getRequiredToken();
  const formData = new FormData();

  formData.append('file', file);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {Authorization: token},
    body: formData
  });

  return parseJsonResponse<ImportSummaryResponse>(response);
}

/** Validates the workbook without persisting anything. */
export async function previewImport(file: File): Promise<ImportSummaryResponse> {
  return uploadWorkbook(endpoints.admin.dataImportPreview, file);
}

/** Validates and persists every valid row, sheet by sheet. */
export async function commitImport(file: File): Promise<ImportSummaryResponse> {
  return uploadWorkbook(endpoints.admin.dataImportCommit, file);
}
