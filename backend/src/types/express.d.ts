import { User } from '@prisma/client';

type OAuthUserPayload = {
  user: Partial<User>;
  token: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: User | OAuthUserPayload;
    }
  }
}
