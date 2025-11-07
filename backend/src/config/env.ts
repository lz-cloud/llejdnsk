import dotenv from 'dotenv';
import path from 'path';
import type { SignOptions } from 'jsonwebtoken';

dotenv.config({
  path: process.env.NODE_ENV === 'production'
    ? path.resolve(process.cwd(), '.env')
    : path.resolve(process.cwd(), '.env'),
});

const defaultJwtExpiresIn: SignOptions['expiresIn'] = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

const normalizeUrl = (url: string): string => url.replace(/\/$/, '');

const parseUrlList = (value?: string): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => normalizeUrl(item));
};

const siteUrl = normalizeUrl(process.env.SITE_URL || 'http://localhost:5000');
const defaultFrontendUrl = 'http://localhost:3000';
const frontendUrls = parseUrlList(process.env.FRONTEND_URL);
const fallbackFrontendUrls = frontendUrls.length > 0 ? frontendUrls : [normalizeUrl(defaultFrontendUrl)];
const corsOrigins = parseUrlList(process.env.CORS_ORIGIN);
const mergedCorsOrigins = corsOrigins.length > 0
  ? [...corsOrigins, ...fallbackFrontendUrls.filter((url) => !corsOrigins.includes(url))]
  : fallbackFrontendUrls;

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT || '5000', 10),
  apiPrefix: process.env.API_PREFIX || '/api',
  siteUrl,
  frontendUrl: fallbackFrontendUrls[0],
  jwt: {
    secret: process.env.JWT_SECRET || 'change_me',
    expiresIn: defaultJwtExpiresIn,
  },
  sessionSecret: process.env.SESSION_SECRET || 'change_session_secret',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackUrl: process.env.GOOGLE_CALLBACK_URL || `${siteUrl}/api/auth/oauth2/google/callback`,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackUrl: process.env.GITHUB_CALLBACK_URL || `${siteUrl}/api/auth/oauth2/github/callback`,
    },
  },
  corsOrigin: mergedCorsOrigins,
  defaultDesKey: process.env.DEFAULT_DES_KEY || '12345678',
  defaultDesIv: process.env.DEFAULT_DES_IV || '12345678',
  ssoTokenValidity: parseInt(process.env.SSO_TOKEN_VALIDITY || '5', 10),
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || (15 * 60 * 1000).toString(), 10),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
  },
};
