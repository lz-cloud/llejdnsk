import { Router } from 'express';
import passport from '../config/passport';
import * as authController from '../controllers/authController';
import * as oauth2Controller from '../controllers/oauth2Controller';
import { authenticate } from '../middleware/auth';
import { env } from '../config/env';

const router = Router();

const isGoogleOAuthEnabled = Boolean(env.oauth.google.clientId && env.oauth.google.clientSecret);
const isGithubOAuthEnabled = Boolean(env.oauth.github.clientId && env.oauth.github.clientSecret);

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/sso/login', authController.ssoLogin);
router.get('/profile', authenticate, authController.getProfile);
router.post('/logout', authController.logout);

// OAuth2 Google
if (isGoogleOAuthEnabled) {
  router.get('/oauth2/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
  );
  router.get('/oauth2/google/callback',
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${env.frontendUrl}/login?error=oauth_failed`,
    }),
    oauth2Controller.googleCallback
  );
} else {
  router.get('/oauth2/google', (_req, res) => {
    res.status(503).json({ success: false, message: 'Google OAuth 未启用' });
  });
  router.get('/oauth2/google/callback', (_req, res) => {
    res.status(503).json({ success: false, message: 'Google OAuth 未启用' });
  });
}

// OAuth2 GitHub
if (isGithubOAuthEnabled) {
  router.get('/oauth2/github',
    passport.authenticate('github', { scope: ['user:email'], session: false })
  );
  router.get('/oauth2/github/callback',
    passport.authenticate('github', {
      session: false,
      failureRedirect: `${env.frontendUrl}/login?error=oauth_failed`,
    }),
    oauth2Controller.githubCallback
  );
} else {
  router.get('/oauth2/github', (_req, res) => {
    res.status(503).json({ success: false, message: 'GitHub OAuth 未启用' });
  });
  router.get('/oauth2/github/callback', (_req, res) => {
    res.status(503).json({ success: false, message: 'GitHub OAuth 未启用' });
  });
}

export default router;
