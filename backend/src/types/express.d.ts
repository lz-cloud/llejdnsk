import type { User as PrismaUser } from '@prisma/client';

export type OAuthUserPayload = {
  token: string;
  user?: Partial<PrismaUser>;
};

declare global {
  namespace Express {
    interface Request {
      user?: PrismaUser | OAuthUserPayload;
    }
  }
}

export {}
