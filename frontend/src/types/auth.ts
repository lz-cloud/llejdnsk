export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  avatar?: string;
  role: 'ADMIN' | 'USER';
  authProvider: 'LOCAL' | 'GOOGLE' | 'GITHUB' | 'SSO';
  isActive: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SSOLoginPayload {
  encryptedParams: string;
  ssoConfigId: string;
}
