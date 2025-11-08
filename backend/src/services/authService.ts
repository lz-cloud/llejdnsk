import { AuthProvider, User, UserRole } from '@prisma/client';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';
import { DESEncryption } from '../utils/encryption';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger';

export interface RegisterDTO {
  email: string;
  password: string;
  username?: string;
  displayName?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface SSOLoginDTO {
  encryptedParams: string;
  ssoConfigId: string;
}

export interface OAuth2DTO {
  providerId: string;
  email: string;
  displayName?: string;
  avatar?: string;
  provider: 'GOOGLE' | 'GITHUB';
}

class AuthService {
  async register(data: RegisterDTO): Promise<{ user: Partial<User>; token: string }> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        username: data.username,
        displayName: data.displayName,
        authProvider: AuthProvider.LOCAL,
      },
    });

    await prisma.loginAuditLog.create({
      data: {
        userId: user.id,
        email: user.email,
        authProvider: AuthProvider.LOCAL,
        success: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async login(data: LoginDTO, ipAddress?: string): Promise<{ user: Partial<User>; token: string }> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.password) {
      await prisma.loginAuditLog.create({
        data: {
          email: data.email,
          authProvider: AuthProvider.LOCAL,
          success: false,
          failureReason: 'User not found',
          ipAddress,
        },
      });
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      await prisma.loginAuditLog.create({
        data: {
          userId: user.id,
          email: data.email,
          authProvider: AuthProvider.LOCAL,
          success: false,
          failureReason: 'User is inactive',
          ipAddress,
        },
      });
      throw new Error('User account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      await prisma.loginAuditLog.create({
        data: {
          userId: user.id,
          email: data.email,
          authProvider: AuthProvider.LOCAL,
          success: false,
          failureReason: 'Invalid password',
          ipAddress,
        },
      });
      throw new Error('Invalid email or password');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await prisma.loginAuditLog.create({
      data: {
        userId: user.id,
        email: user.email,
        authProvider: AuthProvider.LOCAL,
        success: true,
        ipAddress,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async ssoLogin(data: SSOLoginDTO, ipAddress?: string): Promise<{ user: Partial<User>; token: string; redirectUrl?: string }> {
    const ssoConfig = await prisma.sSOConfig.findUnique({
      where: { id: data.ssoConfigId },
    });

    if (!ssoConfig || !ssoConfig.isActive) {
      throw new Error('SSO configuration not found or inactive');
    }

    try {
      if (ssoConfig.allowedIPs.length > 0) {
        const sanitizedIp = ipAddress?.replace('::ffff:', '') || '';
        if (!sanitizedIp || !ssoConfig.allowedIPs.includes(sanitizedIp)) {
          throw new Error('IP address not allowed for SSO login');
        }
      }

      const desEncryption = new DESEncryption({
        key: ssoConfig.desKey,
        iv: ssoConfig.desIV,
        mode: ssoConfig.desMode,
        padding: ssoConfig.desPadding,
      });

      const decryptedParams = desEncryption.decrypt(decodeURIComponent(data.encryptedParams));
      const params = JSON.parse(decryptedParams);

      const userCodeParamName = ssoConfig.userCodeParamName || 'UserCode';
      const timestampParamName = ssoConfig.timestampParamName || 'iat';
      const pageUrlParamName = ssoConfig.pageUrlParamName || 'PageUrl';

      if (!params[userCodeParamName] || !params[timestampParamName]) {
        throw new Error('Invalid SSO parameters: missing user code or timestamp');
      }

      const timestampValue = Number(params[timestampParamName]);
      if (!Number.isFinite(timestampValue)) {
        throw new Error('Invalid timestamp format');
      }

      const isTimestampValid = DESEncryption.verifySSOTimestamp(timestampValue, ssoConfig.tokenValidity);
      if (!isTimestampValid) {
        throw new Error('SSO token expired or invalid timestamp');
      }

      if (ssoConfig.appCodeValue) {
        const appCodeParamName = ssoConfig.appCodeParamName || 'appcode';
        const requestAppCode = params[appCodeParamName];
        if (!requestAppCode || requestAppCode !== ssoConfig.appCodeValue) {
          throw new Error('Invalid application code');
        }
      }

      const userCode = params[userCodeParamName];

      let user = await prisma.user.findUnique({
        where: { erpUserCode: userCode },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: `${userCode}@sso.local`,
            erpUserCode: userCode,
            displayName: userCode,
            authProvider: AuthProvider.SSO,
          },
        });
      }

      if (!user.isActive) {
        throw new Error('User account is inactive');
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      await prisma.loginAuditLog.create({
        data: {
          userId: user.id,
          email: user.email,
          authProvider: AuthProvider.SSO,
          success: true,
          ipAddress,
        },
      });

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const { password: _, ...userWithoutPassword } = user;

      return { user: userWithoutPassword, token, redirectUrl: params[pageUrlParamName] };
    } catch (error) {
      logger.error('SSO login error:', error);
      
      await prisma.loginAuditLog.create({
        data: {
          authProvider: AuthProvider.SSO,
          success: false,
          failureReason: error instanceof Error ? error.message : 'Unknown error',
          ipAddress,
        },
      });
      
      throw error;
    }
  }

  async oauth2Login(data: OAuth2DTO, ipAddress?: string): Promise<{ user: Partial<User>; token: string }> {
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { providerId: data.providerId, authProvider: data.provider },
        ],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: data.email,
          providerId: data.providerId,
          displayName: data.displayName,
          avatar: data.avatar,
          authProvider: data.provider,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          providerId: data.providerId,
          displayName: data.displayName,
          avatar: data.avatar,
          lastLoginAt: new Date(),
        },
      });
    }

    if (!user.isActive) {
      throw new Error('User account is inactive');
    }

    await prisma.loginAuditLog.create({
      data: {
        userId: user.id,
        email: user.email,
        authProvider: data.provider,
        success: true,
        ipAddress,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async getUserById(userId: string): Promise<Partial<User> | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getActiveOAuth2Providers() {
    return prisma.oAuth2Config.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default new AuthService();
