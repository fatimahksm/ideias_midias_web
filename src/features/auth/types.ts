export type AdminLoginPayload = {
  email: string;
  password: string;
};

export type AdminInfo = {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
};

export type AdminLoginResponse = {
  token?: string;
  accessToken?: string;
  tokenType?: string;
  expiresAt?: string;
  admin?: AdminInfo;
  user?: AdminInfo;
  message?: string;
};