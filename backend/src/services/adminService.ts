import prisma from '../config/database';
import { AccessLevel, AuthProvider, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

export interface KnowledgeBaseDTO {
  name: string;
  description?: string;
  url: string;
  category?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateKnowledgeBaseDTO extends Partial<KnowledgeBaseDTO> {}

export interface SSOConfigDTO {
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

export interface UserDTO {
  email: string;
  displayName?: string;
  role?: UserRole;
  password?: string;
  erpUserCode?: string;
  isActive?: boolean;
  groups?: string[];
}

export interface BulkPermissionDTO {
  groupId: string;
  knowledgeBaseIds: string[];
  accessLevel: AccessLevel;
}

class AdminService {
  // Knowledge Bases
  async createKnowledgeBase(data: KnowledgeBaseDTO) {
    return prisma.knowledgeBase.create({
      data: {
        name: data.name,
        description: data.description,
        url: data.url,
        category: data.category,
        icon: data.icon,
        displayOrder: data.displayOrder || 0,
        isActive: data.isActive ?? true,
      },
    });
  }

  async updateKnowledgeBase(id: string, data: UpdateKnowledgeBaseDTO) {
    return prisma.knowledgeBase.update({
      where: { id },
      data,
    });
  }

  async listKnowledgeBases() {
    return prisma.knowledgeBase.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  async getKnowledgeBase(id: string) {
    return prisma.knowledgeBase.findUnique({
      where: { id },
    });
  }

  async deleteKnowledgeBase(id: string) {
    await prisma.knowledgeBase.delete({
      where: { id },
    });
  }

  // SSO Configs
  async createOrUpdateSSOConfig(data: SSOConfigDTO) {
    if (data.id) {
      const { id, allowedIPs, ...updateData } = data;
      return prisma.sSOConfig.update({
        where: { id },
        data: {
          ...updateData,
          ...(allowedIPs !== undefined ? { allowedIPs } : {}),
        },
      });
    }

    return prisma.sSOConfig.create({
      data: {
        name: data.name,
        desKey: data.desKey,
        desIV: data.desIV,
        desPadding: data.desPadding || 'pkcs5padding',
        desMode: data.desMode || 'CBC',
        tokenValidity: data.tokenValidity || 5,
        isActive: data.isActive ?? true,
        allowedIPs: data.allowedIPs || [],
      },
    });
  }

  async listSSOConfigs() {
    return prisma.sSOConfig.findMany();
  }

  async getSSOConfig(id: string) {
    return prisma.sSOConfig.findUnique({
      where: { id },
    });
  }

  async toggleSSOConfig(id: string, isActive: boolean) {
    return prisma.sSOConfig.update({
      where: { id },
      data: { isActive },
    });
  }

  async deleteSSOConfig(id: string) {
    await prisma.sSOConfig.delete({
      where: { id },
    });
  }

  // Users
  async createOrUpdateUser(data: UserDTO) {
    const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : undefined;

    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {
        displayName: data.displayName,
        role: data.role,
        erpUserCode: data.erpUserCode,
        isActive: data.isActive,
        ...(hashedPassword ? { password: hashedPassword } : {}),
      },
      create: {
        email: data.email,
        displayName: data.displayName,
        role: data.role || UserRole.USER,
        password: hashedPassword,
        erpUserCode: data.erpUserCode,
        authProvider: AuthProvider.LOCAL,
        isActive: data.isActive ?? true,
      },
    });

    if (data.groups) {
      await prisma.userGroupMember.deleteMany({
        where: { userId: user.id },
      });

      await prisma.userGroupMember.createMany({
        data: data.groups.map((groupId) => ({ userId: user.id, groupId })),
        skipDuplicates: true,
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  async listUsers() {
    const users = await prisma.user.findMany({
      include: {
        userGroups: { include: { group: true } },
      },
    });

    return users.map((user) => {
      const { password: _, ...rest } = user;
      return rest;
    });
  }

  async deactivateUser(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  // Groups
  async createGroup(name: string, description?: string) {
    return prisma.userGroup.create({
      data: {
        name,
        description,
      },
    });
  }

  async listGroups() {
    return prisma.userGroup.findMany({
      include: {
        permissions: true,
        members: {
          include: { user: true },
        },
      },
    });
  }

  async assignUsersToGroup(groupId: string, userIds: string[]) {
    await prisma.userGroupMember.createMany({
      data: userIds.map((userId) => ({ userId, groupId })),
      skipDuplicates: true,
    });
  }

  // Permissions
  async bulkAssignPermissions(data: BulkPermissionDTO) {
    await prisma.groupPermission.deleteMany({
      where: {
        groupId: data.groupId,
        knowledgeBaseId: { in: data.knowledgeBaseIds },
      },
    });

    await prisma.groupPermission.createMany({
      data: data.knowledgeBaseIds.map((kbId) => ({
        groupId: data.groupId,
        knowledgeBaseId: kbId,
        accessLevel: data.accessLevel,
      })),
    });
  }

  async getAccessAnalytics() {
    return prisma.userAccessLog.groupBy({
      by: ['knowledgeBaseId'],
      _count: {
        id: true,
      },
      _sum: {
        accessDuration: true,
      },
    });
  }

  async getSystemStats() {
    const [userCount, activeUserCount, knowledgeBaseCount, ssoConfigCount, recentAccessCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.knowledgeBase.count(),
      prisma.sSOConfig.count(),
      prisma.userAccessLog.count({
        where: {
          accessTime: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      userCount,
      activeUserCount,
      knowledgeBaseCount,
      ssoConfigCount,
      recentAccessCount,
    };
  }
}

export default new AdminService();
