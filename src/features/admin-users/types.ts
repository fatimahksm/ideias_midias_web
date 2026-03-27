export type AdminRole = 'ADMIN' | 'SUPER_ADMIN';

export type AdminUser = {
  id: number;
  fullName: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateAdminUserPayload = {
  fullName: string;
  email: string;
  password: string;
  isActive: boolean;
};

export type UpdateAdminUserPayload = {
  fullName: string;
  email: string;
  role: AdminRole;
};

export type UpdateAdminUserStatusPayload = {
  isActive: boolean;
};

export type ResetAdminUserPasswordPayload = {
  newPassword: string;
  confirmPassword: string;
};
