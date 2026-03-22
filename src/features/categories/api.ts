import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import {getAdminToken} from '@/lib/auth/token';
import type {
  SectionCategoryPayload,
  SectionCategoryResponse
} from './types';

function getRequiredToken() {
  const token = getAdminToken();

  if (!token) {
    throw new Error('No admin token found.');
  }

  return token;
}

export async function getAllCategories() {
  return apiClient<SectionCategoryResponse[]>(endpoints.admin.categories, {
    method: 'GET',
    token: getRequiredToken()
  });
}

export async function getCategoryById(id: number) {
  return apiClient<SectionCategoryResponse>(
    `${endpoints.admin.categories}/${id}`,
    {
      method: 'GET',
      token: getRequiredToken()
    }
  );
}

export async function getCategoriesBySection(sectionId: number) {
  return apiClient<SectionCategoryResponse[]>(
    `${endpoints.admin.categories}/section/${sectionId}`,
    {
      method: 'GET',
      token: getRequiredToken()
    }
  );
}

export async function createCategory(payload: SectionCategoryPayload) {
  return apiClient<SectionCategoryResponse>(endpoints.admin.categories, {
    method: 'POST',
    token: getRequiredToken(),
    body: payload
  });
}

export async function updateCategory(
  id: number,
  payload: SectionCategoryPayload
) {
  return apiClient<SectionCategoryResponse>(
    `${endpoints.admin.categories}/${id}`,
    {
      method: 'PUT',
      token: getRequiredToken(),
      body: payload
    }
  );
}

export async function deleteCategory(id: number) {
  return apiClient<void>(`${endpoints.admin.categories}/${id}`, {
    method: 'DELETE',
    token: getRequiredToken()
  });
}