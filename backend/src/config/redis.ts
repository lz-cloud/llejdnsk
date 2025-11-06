import { createClient } from 'redis';
import { env } from './env';
import logger from '../utils/logger';

const redisClient = createClient({
  socket: {
    host: env.redis.host,
    port: env.redis.port,
  },
  password: env.redis.password,
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error', err);
});

redisClient.on('connect', () => {
  logger.info('Redis Client Connected');
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('Failed to connect to Redis', error);
    throw error;
  }
};

export default redisClient;
