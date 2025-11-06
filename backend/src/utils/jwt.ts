import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  sessionId?: string;
}

export const generateToken = (payload: JwtPayload, expiresIn: string | number = env.jwt.expiresIn): string => {
  return jwt.sign(payload, env.jwt.secret, { expiresIn });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.jwt.secret) as JwtPayload;
};
