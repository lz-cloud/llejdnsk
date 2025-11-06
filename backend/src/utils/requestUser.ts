import type { Request } from 'express';
import type { User as PrismaUser } from '@prisma/client';

export type OAuthUserPayload = {
  token: string;
  user?: Partial<PrismaUser>;
};

type RequestUser = PrismaUser | OAuthUserPayload | undefined;

export const isOAuthUserPayload = (user: RequestUser): user is OAuthUserPayload => {
  return !!user && typeof user === 'object' && 'token' in user;
};

export const getAuthenticatedUser = (req: Request): PrismaUser | null => {
  const user = req.user as RequestUser;

  if (!user || isOAuthUserPayload(user)) {
    return null;
  }

  return user;
};
