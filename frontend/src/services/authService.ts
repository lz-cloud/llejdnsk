import api from './api';
import { AuthResponse, LoginPayload, SSOLoginPayload, OAuthProviders } from '../types/auth';

const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post('/auth/login', payload);
    return data.data;
  },
  async ssoLogin(payload: SSOLoginPayload): Promise<AuthResponse & { redirectUrl?: string }> {
    const { data } = await api.post('/auth/sso/login', payload);
    return data.data;
  },
  async getProfile(): Promise<AuthResponse> {
    const { data } = await api.get('/auth/profile');
    return data.data;
  },
  async getOAuthProviders(): Promise<OAuthProviders> {
    const { data } = await api.get('/auth/oauth2/providers');
    return data.data;
  },
  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('authToken');
  },
};

export default authService;
