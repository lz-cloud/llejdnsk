import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { env } from './env';
import authService from '../services/authService';
import logger from '../utils/logger';

// Google OAuth策略
if (env.oauth.google.clientId && env.oauth.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.oauth.google.clientId,
        clientSecret: env.oauth.google.clientSecret,
        callbackURL: env.oauth.google.callbackUrl,
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
}

// GitHub OAuth策略
if (env.oauth.github.clientId && env.oauth.github.clientSecret) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: env.oauth.github.clientId,
        clientSecret: env.oauth.github.clientSecret,
        callbackURL: env.oauth.github.callbackUrl,
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
}

export default passport;
