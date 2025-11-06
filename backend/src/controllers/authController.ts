import { Request, Response } from 'express';
import authService from '../services/authService';
import { env } from '../config/env';

export const register = async (req: Request, res: Response) => {
  try {
    const { user, token } = await authService.register(req.body);
    res.status(201).json({ success: true, data: { user, token } });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { user, token } = await authService.login(req.body, req.ip);
    res.json({ success: true, data: { user, token } });
  } catch (error) {
    res.status(401).json({ success: false, message: error instanceof Error ? error.message : 'Login failed' });
  }
};

export const ssoLogin = async (req: Request, res: Response) => {
  try {
    const { user, token, redirectUrl } = await authService.ssoLogin(req.body, req.ip);

    res.cookie('token', token, {
      httpOnly: true,
      secure: env.isProd,
      sameSite: 'lax',
    });

    res.json({
      success: true,
      data: {
        user,
        token,
        redirectUrl,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'SSO login failed' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user || 'token' in req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    res.json({ success: true, data: { user: req.user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
};
