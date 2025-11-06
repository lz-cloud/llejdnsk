import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '../config/env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'FastGPT Third-Party Platform API',
      version: '1.0.0',
      description: 'API documentation for the FastGPT Third-Party Platform',
    },
    servers: [
      {
        url: `${env.siteUrl}${env.apiPrefix}`,
        description: 'Configured server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['src/routes/*.ts', 'src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
