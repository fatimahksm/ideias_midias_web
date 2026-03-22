import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import {getAdminToken} from '@/lib/auth/token';
import type {
  ContactMethodPayload,
  ContactMethodResponse
} from './types';

function getRequiredToken() {
  const token = getAdminToken();

  if (!token) {
    throw new Error('No admin token found.');
  }

  return token;
}

export async function getAllContactMethods() {
  return apiClient<ContactMethodResponse[]>(endpoints.admin.contactMethods, {
    method: 'GET',
    token: getRequiredToken()
  });
}

export async function getContactMethodById(id: number) {
  return apiClient<ContactMethodResponse>(
    `${endpoints.admin.contactMethods}/${id}`,
    {
      method: 'GET',
      token: getRequiredToken()
    }
  );
}

export async function createContactMethod(payload: ContactMethodPayload) {
  return apiClient<ContactMethodResponse>(endpoints.admin.contactMethods, {
    method: 'POST',
    token: getRequiredToken(),
    body: payload
  });
}

export async function updateContactMethod(
  id: number,
  payload: ContactMethodPayload
) {
  return apiClient<ContactMethodResponse>(
    `${endpoints.admin.contactMethods}/${id}`,
    {
      method: 'PUT',
      token: getRequiredToken(),
      body: payload
    }
  );
}

export async function deleteContactMethod(id: number) {
  return apiClient<void>(`${endpoints.admin.contactMethods}/${id}`, {
    method: 'DELETE',
    token: getRequiredToken()
  });
}