import { Request, Response } from 'express';
import { env } from '../config/env';

export const googleCallback = (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.redirect(`${env.frontendUrl}/login?error=auth_failed`);
    }

    const { user, token } = req.user as any;
    const userEncoded = encodeURIComponent(JSON.stringify(user));

    res.redirect(`${env.frontendUrl}/oauth/callback?token=${token}&user=${userEncoded}`);
  } catch (error) {
    res.redirect(`${env.frontendUrl}/login?error=auth_failed`);
  }
};

export const githubCallback = (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.redirect(`${env.frontendUrl}/login?error=auth_failed`);
    }

    const { user, token } = req.user as any;
    const userEncoded = encodeURIComponent(JSON.stringify(user));

    res.redirect(`${env.frontendUrl}/oauth/callback?token=${token}&user=${userEncoded}`);
  } catch (error) {
    res.redirect(`${env.frontendUrl}/login?error=auth_failed`);
  }
};
