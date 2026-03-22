import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import {getAdminToken} from '@/lib/auth/token';
import type {SectionPayload, SectionResponse, SectionType} from './types';

function getRequiredToken() {
  const token = getAdminToken();

  if (!token) {
    throw new Error('No admin token found.');
  }

  return token;
}

export async function getAllSections() {
  return apiClient<SectionResponse[]>(endpoints.admin.sections, {
    method: 'GET',
    token: getRequiredToken()
  });
}

export async function getSectionById(id: number) {
  return apiClient<SectionResponse>(`${endpoints.admin.sections}/${id}`, {
    method: 'GET',
    token: getRequiredToken()
  });
}

export async function getSectionsByType(sectionType: SectionType) {
  return apiClient<SectionResponse[]>(
    `${endpoints.admin.sections}/type/${sectionType}`,
    {
      method: 'GET',
      token: getRequiredToken()
    }
  );
}

export async function createSection(payload: SectionPayload) {
  return apiClient<SectionResponse>(endpoints.admin.sections, {
    method: 'POST',
    token: getRequiredToken(),
    body: payload
  });
}

export async function updateSection(id: number, payload: SectionPayload) {
  return apiClient<SectionResponse>(`${endpoints.admin.sections}/${id}`, {
    method: 'PUT',
    token: getRequiredToken(),
    body: payload
  });
}

export async function deleteSection(id: number) {
  return apiClient<void>(`${endpoints.admin.sections}/${id}`, {
    method: 'DELETE',
    token: getRequiredToken()
  });
}