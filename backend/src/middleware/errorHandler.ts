import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';

interface ApiError extends Error {
  status?: number;
  details?: unknown;
}

export const errorHandler = (err: ApiError, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`Error: ${message}`);
  if (err.details) {
    logger.error(`Details: ${JSON.stringify(err.details)}`);
  }

  res.status(status).json({
    success: false,
    message,
    ...(err.details ? { details: err.details } : {}),
  });
};
