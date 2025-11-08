import { Router } from 'express';
import passport from '../config/passport';
import * as authController from '../controllers/authController';
import * as oauth2Controller from '../controllers/oauth2Controller';
import { authenticate } from '../middleware/auth';
import { env } from '../config/env';
import prisma from '../config/database';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/oauth2/providers', authController.getOAuthProviders);
router.post('/sso/login', authController.ssoLogin);
router.get('/profile', authenticate, authController.getProfile);
router.post('/logout', authController.logout);

const getActiveOAuthConfig = async (provider: string) => {
  try {
    const config = await prisma.oAuth2Config.findFirst({
      where: {
        provider: {
          equals: provider,
          mode: 'insensitive',
        },
        isActive: true,
      },
    });
    if (!config || !config.clientId || !config.clientSecret) {
      return null;
    }
    return config;
  } catch {
    return null;
  }
};

router.get('/oauth2/google', async (req, res, next) => {
  const config = await getActiveOAuthConfig('GOOGLE');
  if (!config) {
    return res.status(503).json({ success: false, message: 'Google OAuth 未启用' });
  }
  passport.authenticate('google', {
    session: false,
    scope: config.scope && config.scope.length > 0 ? config.scope : ['profile', 'email'],
  })(req, res, next);
});

router.get('/oauth2/google/callback',
  async (req, res, next) => {
    const config = await getActiveOAuthConfig('GOOGLE');
    if (!config) {
      return res.redirect(`${env.frontendUrl}/login?error=oauth_disabled`);
    }
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${env.frontendUrl}/login?error=oauth_failed`,
    })(req, res, next);
  },
  oauth2Controller.googleCallback
);

router.get('/oauth2/github', async (req, res, next) => {
  const config = await getActiveOAuthConfig('GITHUB');
  if (!config) {
    return res.status(503).json({ success: false, message: 'GitHub OAuth 未启用' });
  }
  passport.authenticate('github', {
    session: false,
    scope: config.scope && config.scope.length > 0 ? config.scope : ['read:user', 'user:email'],
  })(req, res, next);
});

router.get('/oauth2/github/callback',
  async (req, res, next) => {
    const config = await getActiveOAuthConfig('GITHUB');
    if (!config) {
      return res.redirect(`${env.frontendUrl}/login?error=oauth_disabled`);
    }
    passport.authenticate('github', {
      session: false,
      failureRedirect: `${env.frontendUrl}/login?error=oauth_failed`,
    })(req, res, next);
  },
  oauth2Controller.githubCallback
);

export default router;
