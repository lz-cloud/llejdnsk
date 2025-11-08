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
  userCodeParamName?: string;
  userCodeEncryption?: string;
  pageUrlParamName?: string;
  timestampParamName?: string;
  appCodeParamName?: string;
  appCodeValue?: string;
  enableThirdPartyMapping?: boolean;
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
  userCodeParamName?: string;
  userCodeEncryption?: string;
  pageUrlParamName?: string;
  timestampParamName?: string;
  appCodeParamName?: string;
  appCodeValue?: string;
  enableThirdPartyMapping?: boolean;
}

export interface UserGroupSummary {
  id: string;
  name: string;
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
  groups: UserGroupSummary[];
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

export interface BulkUserImportPayload {
  email: string;
  displayName?: string;
  role?: 'ADMIN' | 'USER';
  password?: string;
  erpUserCode?: string;
  groups?: string[];
}

export interface BulkUserImportResult {
  success: string[];
  failed: { email: string; reason: string }[];
}

export interface BulkUserGroupUpdatePayload {
  userIds: string[];
  groupIds: string[];
  replace?: boolean;
}

export interface OAuth2Config {
  id: string;
  name: string;
  provider: string;
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  authUrl?: string;
  tokenUrl?: string;
  userInfoUrl?: string;
  scope: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OAuth2ConfigPayload {
  id?: string;
  name: string;
  provider: string;
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  authUrl?: string;
  tokenUrl?: string;
  userInfoUrl?: string;
  scope?: string[];
  isActive?: boolean;
}
