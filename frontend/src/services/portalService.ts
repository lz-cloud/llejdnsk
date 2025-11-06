import api from './api';
import { KnowledgeBase, RecentAccess, Favorite, UsageStats } from '../types/portal';

const portalService = {
  async getKnowledgeBases(): Promise<KnowledgeBase[]> {
    const { data } = await api.get('/portal/knowledge-bases');
    return data.data;
  },
  async recordAccess(knowledgeBaseId: string): Promise<void> {
    await api.post(`/portal/knowledge-bases/${knowledgeBaseId}/access`);
  },
  async getRecentAccess(): Promise<RecentAccess[]> {
    const { data } = await api.get('/portal/recent-access');
    return data.data;
  },
  async toggleFavorite(knowledgeBaseId: string): Promise<{ favorited: boolean }> {
    const { data } = await api.post('/portal/favorites', { knowledgeBaseId });
    return data.data;
  },
  async getFavorites(): Promise<Favorite[]> {
    const { data } = await api.get('/portal/favorites');
    return data.data;
  },
  async getUsageStats(): Promise<UsageStats> {
    const { data } = await api.get('/portal/usage-stats');
    return data.data;
  },
};

export default portalService;
