import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import authService from '../services/authService';
import logger from '../utils/logger';
import prisma from './database';

const removeStrategy = (name: string) => {
  const passportAny = passport as any;
  if (typeof passportAny.unuse === 'function') {
    try {
      passportAny.unuse(name);
      logger.info(`Removed existing ${name} strategy`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn(`Failed to unuse ${name} strategy: ${message}`);
    }
  }

  if (passportAny._strategies && passportAny._strategies[name]) {
    delete passportAny._strategies[name];
    logger.info(`Deleted ${name} strategy from registry`);
  }
};

export const configurePassport = async () => {
  const oauthConfigs = await prisma.oAuth2Config.findMany({
    where: { isActive: true },
  });

  removeStrategy('google');
  removeStrategy('github');

  const googleConfig = oauthConfigs.find((config) => config.provider.toUpperCase() === 'GOOGLE');
  const githubConfig = oauthConfigs.find((config) => config.provider.toUpperCase() === 'GITHUB');

  if (googleConfig && googleConfig.clientId && googleConfig.clientSecret) {
    passport.use(
      'google',
      new GoogleStrategy(
        {
          clientID: googleConfig.clientId,
          clientSecret: googleConfig.clientSecret,
          callbackURL: googleConfig.callbackUrl,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error('未能从Google获取电子邮件'));
            }

            const { user, token } = await authService.oauth2Login({
              providerId: profile.id,
              email,
              displayName: profile.displayName,
              avatar: profile.photos?.[0]?.value,
              provider: 'GOOGLE',
            });

            return done(null, { user, token });
          } catch (error) {
            logger.error('Google OAuth错误:', error);
            return done(error as Error);
          }
        }
      )
    );
    logger.info('Google OAuth strategy configured from database');
  } else {
    logger.info('Google OAuth strategy not configured (missing or inactive configuration)');
  }

  if (githubConfig && githubConfig.clientId && githubConfig.clientSecret) {
    passport.use(
      'github',
      new GitHubStrategy(
        {
          clientID: githubConfig.clientId,
          clientSecret: githubConfig.clientSecret,
          callbackURL: githubConfig.callbackUrl,
        },
        async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
          try {
            const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;

            const { user, token } = await authService.oauth2Login({
              providerId: profile.id,
              email,
              displayName: profile.displayName || profile.username,
              avatar: profile.photos?.[0]?.value,
              provider: 'GITHUB',
            });

            return done(null, { user, token });
          } catch (error) {
            logger.error('GitHub OAuth错误:', error);
            return done(error as Error);
          }
        }
      )
    );
    logger.info('GitHub OAuth strategy configured from database');
  } else {
    logger.info('GitHub OAuth strategy not configured (missing or inactive configuration)');
  }
};

export default passport;
