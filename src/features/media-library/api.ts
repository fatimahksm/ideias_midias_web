import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import {getAdminToken} from '@/lib/auth/token';
import {HttpError} from '@/lib/api/http-error';
import type {ApiErrorResponse, ApiResponse} from '@/types/api';
import type {MediaFileType, MediaLibraryItem, PageResponse} from './types';

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

export async function uploadMedia(file: File): Promise<MediaLibraryItem> {
  const token = getRequiredToken();
  const formData = new FormData();

  formData.append('file', file);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoints.admin.mediaUpload}`,
    {
      method: 'POST',
      headers: {
        Authorization: token
      },
      body: formData
    }
  );

  return parseJsonResponse<MediaLibraryItem>(response);
}

export async function getAllMedia(): Promise<MediaLibraryItem[]> {
  return apiClient<MediaLibraryItem[]>(endpoints.admin.mediaLibrary, {
    method: 'GET',
    token: getRequiredToken()
  });
}

export const MEDIA_PAGE_SIZE = 24;

/**
 * One page of the library, newest first. The screens read the library this
 * way so a big library never arrives as one enormous response.
 */
export async function getMediaPage(
  fileType: MediaFileType | 'ALL',
  page: number,
  size: number = MEDIA_PAGE_SIZE
): Promise<PageResponse<MediaLibraryItem>> {
  const params = new URLSearchParams({page: String(page), size: String(size)});

  if (fileType !== 'ALL') {
    params.set('fileType', fileType);
  }

  return apiClient<PageResponse<MediaLibraryItem>>(
    `${endpoints.admin.mediaLibrary}/page?${params.toString()}`,
    {
      method: 'GET',
      token: getRequiredToken()
    }
  );
}

export async function getMediaByType(
  fileType: MediaFileType
): Promise<MediaLibraryItem[]> {
  return apiClient<MediaLibraryItem[]>(
    `${endpoints.admin.mediaLibrary}/type/${fileType}`,
    {
      method: 'GET',
      token: getRequiredToken()
    }
  );
}

export async function deleteMedia(id: number): Promise<void> {
  await apiClient<unknown>(`${endpoints.admin.mediaLibrary}/${id}`, {
    method: 'DELETE',
    token: getRequiredToken()
  });
}