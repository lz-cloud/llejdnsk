import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  sessionId?: string;
}

export const generateToken = (payload: JwtPayload, expiresIn: SignOptions['expiresIn'] = env.jwt.expiresIn): string => {
  return jwt.sign(payload, env.jwt.secret, { expiresIn });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.jwt.secret) as JwtPayload;
};
