import prisma from '../config/database';

class PortalService {
  async getUserKnowledgeBases(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userGroups: {
          include: {
            group: {
              include: {
                permissions: {
                  include: {
                    knowledgeBase: true,
                  },
                },
              },
            },
          },
        },
        userAccess: {
          include: {
            knowledgeBase: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const knowledgeBases = new Map();

    user.userAccess.forEach((access) => {
      if (access.knowledgeBase && access.knowledgeBase.isActive) {
        knowledgeBases.set(access.knowledgeBase.id, {
          ...access.knowledgeBase,
          accessLevel: access.accessLevel,
        });
      }
    });

    user.userGroups.forEach((membership) => {
      membership.group.permissions.forEach((permission) => {
        if (permission.knowledgeBase && permission.knowledgeBase.isActive && !knowledgeBases.has(permission.knowledgeBase.id)) {
          knowledgeBases.set(permission.knowledgeBase.id, {
            ...permission.knowledgeBase,
            accessLevel: permission.accessLevel,
          });
        }
      });
    });

    return Array.from(knowledgeBases.values()).sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async recordAccess(userId: string, knowledgeBaseId: string, ipAddress?: string, userAgent?: string) {
    return prisma.userAccessLog.create({
      data: {
        userId,
        knowledgeBaseId,
        ipAddress,
        userAgent,
      },
    });
  }

  async getRecentAccess(userId: string, limit: number = 10) {
    return prisma.userAccessLog.findMany({
      where: { userId },
      include: {
        knowledgeBase: true,
      },
      orderBy: {
        accessTime: 'desc',
      },
      take: limit,
    });
  }

  async toggleFavorite(userId: string, knowledgeBaseId: string) {
    const existing = await prisma.userFavorite.findUnique({
      where: {
        userId_knowledgeBaseId: {
          userId,
          knowledgeBaseId,
        },
      },
    });

    if (existing) {
      await prisma.userFavorite.delete({
        where: { id: existing.id },
      });
      return { favorited: false };
    } else {
      await prisma.userFavorite.create({
        data: {
          userId,
          knowledgeBaseId,
        },
      });
      return { favorited: true };
    }
  }

  async getFavorites(userId: string) {
    return prisma.userFavorite.findMany({
      where: { userId },
      include: {
        knowledgeBase: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUsageStats(userId: string) {
    const logs = await prisma.userAccessLog.findMany({
      where: {
        userId,
        accessTime: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const totalAccess = logs.length;
    const totalDuration = logs.reduce((sum, log) => sum + (log.accessDuration || 0), 0);
    const uniqueKnowledgeBases = new Set(logs.map((log) => log.knowledgeBaseId)).size;

    const accessByKB = logs.reduce((acc, log) => {
      acc[log.knowledgeBaseId] = (acc[log.knowledgeBaseId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAccess,
      totalDuration,
      uniqueKnowledgeBases,
      accessByKB,
    };
  }
}

export default new PortalService();
