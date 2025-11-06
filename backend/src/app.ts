import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import passport from './config/passport';
import { env } from './config/env';
import { connectRedis } from './config/redis';
import { errorHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';
import routes from './routes';
import logger from './utils/logger';
import prisma from './config/database';
import bcrypt from 'bcryptjs';
import { UserRole, AuthProvider } from '@prisma/client';
import swaggerSpec from './docs/swagger';

const app: Application = express();

app.use(helmet());
app.use(cors({
  origin: env.corsOrigin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(apiRateLimiter);

app.use(env.apiPrefix, routes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const initializeAdminUser = async () => {
  try {
    const adminEmail = env.admin.email;
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(env.admin.password, 10);
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          displayName: 'System Administrator',
          role: UserRole.ADMIN,
          authProvider: AuthProvider.LOCAL,
        },
      });
      logger.info(`Admin user created with email: ${adminEmail}`);
    }
  } catch (error) {
    logger.error('Failed to initialize admin user:', error);
  }
};

const startServer = async () => {
  try {
    await connectRedis();
    logger.info('✓ Redis connected');

    await prisma.$connect();
    logger.info('✓ Database connected');

    await initializeAdminUser();

    app.listen(env.port, () => {
      logger.info(`✓ Server running on port ${env.port}`);
      logger.info(`✓ Environment: ${env.nodeEnv}`);
      logger.info(`✓ Site URL: ${env.siteUrl}`);
      logger.info(`✓ API Prefix: ${env.apiPrefix}`);
      logger.info(`✓ Frontend URL: ${env.frontendUrl}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
