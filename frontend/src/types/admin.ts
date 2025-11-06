export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  url: string;
  category?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeBasePayload {
  name: string;
  description?: string;
  url: string;
  category?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface SSOConfig {
  id: string;
  name: string;
  desKey: string;
  desIV: string;
  desPadding: string;
  desMode: string;
  tokenValidity: number;
  isActive: boolean;
  allowedIPs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SSOConfigPayload {
  id?: string;
  name: string;
  desKey: string;
  desIV: string;
  desPadding?: string;
  desMode?: string;
  tokenValidity?: number;
  isActive?: boolean;
  allowedIPs?: string[];
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  role: 'ADMIN' | 'USER';
  erpUserCode?: string;
  isActive: boolean;
  authProvider: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserPayload {
  email: string;
  displayName?: string;
  role?: 'ADMIN' | 'USER';
  password?: string;
  erpUserCode?: string;
  isActive?: boolean;
  groups?: string[];
}

export interface UserGroup {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  members?: any[];
  permissions?: { knowledgeBaseId: string; accessLevel: string }[];
}

export interface AccessAnalytics {
  knowledgeBaseId: string;
  _count: { id: number };
  _sum: { accessDuration: number | null };
}

export interface SystemStats {
  userCount: number;
  activeUserCount: number;
  knowledgeBaseCount: number;
  ssoConfigCount: number;
  recentAccessCount: number;
}

export interface BulkPermissionPayload {
  groupId: string;
  knowledgeBaseIds: string[];
  accessLevel: 'READ' | 'WRITE' | 'ADMIN';
}
