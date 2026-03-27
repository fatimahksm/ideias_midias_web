import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import {getAdminToken} from '@/lib/auth/token';
import type {
  AdminUser,
  CreateAdminUserPayload,
  ResetAdminUserPasswordPayload,
  UpdateAdminUserPayload,
  UpdateAdminUserStatusPayload
} from './types';

function getRequiredToken() {
  const token = getAdminToken();

  if (!token) {
    throw new Error('No admin token found.');
  }

  return token;
}

export function getAllAdminUsers() {
  return apiClient<AdminUser[]>(endpoints.admin.adminUsers, {
    method: 'GET',
    token: getRequiredToken()
  });
}

export function getAdminUserById(id: number) {
  return apiClient<AdminUser>(`${endpoints.admin.adminUsers}/${id}`, {
    method: 'GET',
    token: getRequiredToken()
  });
}

export function createAdminUser(payload: CreateAdminUserPayload) {
  return apiClient<AdminUser>(endpoints.admin.adminUsers, {
    method: 'POST',
    body: payload,
    token: getRequiredToken()
  });
}

export function updateAdminUser(id: number, payload: UpdateAdminUserPayload) {
  return apiClient<AdminUser>(`${endpoints.admin.adminUsers}/${id}`, {
    method: 'PUT',
    body: payload,
    token: getRequiredToken()
  });
}

export function updateAdminUserStatus(
  id: number,
  payload: UpdateAdminUserStatusPayload
) {
  return apiClient<AdminUser>(`${endpoints.admin.adminUsers}/${id}/status`, {
    method: 'PATCH',
    body: payload,
    token: getRequiredToken()
  });
}

export function resetAdminUserPassword(
  id: number,
  payload: ResetAdminUserPasswordPayload
) {
  return apiClient<void>(`${endpoints.admin.adminUsers}/${id}/reset-password`, {
    method: 'PATCH',
    body: payload,
    token: getRequiredToken()
  });
}

export function deleteAdminUser(id: number) {
  return apiClient<void>(`${endpoints.admin.adminUsers}/${id}`, {
    method: 'DELETE',
    token: getRequiredToken()
  });
}
