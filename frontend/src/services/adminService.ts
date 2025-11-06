import api from './api';
import {
  KnowledgeBase,
  KnowledgeBasePayload,
  SSOConfig,
  SSOConfigPayload,
  User,
  UserPayload,
  UserGroup,
  AccessAnalytics,
  SystemStats,
  BulkPermissionPayload,
} from '../types/admin';

const adminService = {
  async listKnowledgeBases(): Promise<KnowledgeBase[]> {
    const { data } = await api.get('/admin/knowledge-bases');
    return data.data;
  },
  async createKnowledgeBase(payload: KnowledgeBasePayload): Promise<KnowledgeBase> {
    const { data } = await api.post('/admin/knowledge-bases', payload);
    return data.data;
  },
  async updateKnowledgeBase(id: string, payload: KnowledgeBasePayload): Promise<KnowledgeBase> {
    const { data } = await api.put(`/admin/knowledge-bases/${id}`, payload);
    return data.data;
  },
  async deleteKnowledgeBase(id: string): Promise<void> {
    await api.delete(`/admin/knowledge-bases/${id}`);
  },
  async listSSOConfigs(): Promise<SSOConfig[]> {
    const { data } = await api.get('/admin/sso-configs');
    return data.data;
  },
  async getSSOConfig(id: string): Promise<SSOConfig> {
    const { data } = await api.get(`/admin/sso-configs/${id}`);
    return data.data;
  },
  async saveSSOConfig(payload: SSOConfigPayload): Promise<SSOConfig> {
    const { data } = await api.post('/admin/sso-configs', payload);
    return data.data;
  },
  async toggleSSOConfig(id: string, isActive: boolean): Promise<SSOConfig> {
    const { data } = await api.patch(`/admin/sso-configs/${id}`, { isActive });
    return data.data;
  },
  async deleteSSOConfig(id: string): Promise<void> {
    await api.delete(`/admin/sso-configs/${id}`);
  },
  async listUsers(): Promise<User[]> {
    const { data } = await api.get('/admin/users');
    return data.data;
  },
  async createOrUpdateUser(payload: UserPayload): Promise<User> {
    const { data } = await api.post('/admin/users', payload);
    return data.data;
  },
  async deactivateUser(id: string): Promise<void> {
    await api.post(`/admin/users/${id}/deactivate`);
  },
  async listGroups(): Promise<UserGroup[]> {
    const { data } = await api.get('/admin/groups');
    return data.data;
  },
  async createGroup(name: string, description?: string): Promise<UserGroup> {
    const { data } = await api.post('/admin/groups', { name, description });
    return data.data;
  },
  async assignBulkPermissions(payload: BulkPermissionPayload): Promise<void> {
    await api.post('/admin/bulk-permissions', payload);
  },
  async getAccessAnalytics(): Promise<AccessAnalytics[]> {
    const { data } = await api.get('/admin/access-analytics');
    return data.data;
  },
  async getSystemStats(): Promise<SystemStats> {
    const { data } = await api.get('/admin/system-stats');
    return data.data;
  },
};

export default adminService;
