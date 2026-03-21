export type AdminLoginPayload = {
  email: string;
  password: string;
};

export type AdminLoginResponse = {
  token: string;
  tokenType: string;
  adminId: number;
  email: string;
  role: string;
};

export type AdminMeResponse = {
  adminId: number;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
};