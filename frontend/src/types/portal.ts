export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  url: string;
  category?: string;
  icon?: string;
  displayOrder: number;
  accessLevel?: 'READ' | 'WRITE' | 'ADMIN';
  isActive: boolean;
  isPublic?: boolean;
}

export interface RecentAccess {
  id: string;
  knowledgeBaseId: string;
  accessTime: string;
  accessDuration?: number;
  knowledgeBase: KnowledgeBase;
}

export interface Favorite {
  id: string;
  knowledgeBaseId: string;
  createdAt: string;
  knowledgeBase: KnowledgeBase;
}

export interface UsageStats {
  totalAccess: number;
  totalDuration: number;
  uniqueKnowledgeBases: number;
  accessByKB: Record<string, number>;
}
