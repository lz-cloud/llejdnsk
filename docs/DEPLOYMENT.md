# Deployment Guide

## Prerequisites
- Docker & Docker Compose
- Node.js 18+ (if running without Docker)
- PostgreSQL 14+
- Redis 7+

## Environment Variables

### Backend
- `NODE_ENV` - Application environment (development, production)
- `PORT` - Backend port (default: 5000)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD`
- `JWT_SECRET` - JWT signing secret
- `SESSION_SECRET` - Session secret key
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`
- `SITE_URL` - Backend application base URL (default: http://localhost:5000)
- `FRONTEND_URL` - Frontend application base URL

### Frontend
- `VITE_API_URL` - Backend API base URL

## Docker Deployment

1. Copy environment files:
```bash
cp backend/.env.example backend/.env
tailor backend/.env
cp frontend/.env.example frontend/.env
```

2. Start all services:
```bash
docker-compose up -d --build
```

3. Apply database migrations:
```bash
docker-compose exec backend npx prisma migrate deploy
```

4. Access the applications:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Swagger: http://localhost:5000/api-docs

5. Logs:
```bash
docker-compose logs -f backend
```

6. Stopping services:
```bash
docker-compose down
```

## Manual Deployment

1. Install dependencies:
```bash
cd backend
npm install
cd ../frontend
npm install
```

2. Set up PostgreSQL and Redis servers

3. Configure environment variables (.env files)

4. Run database migrations:
```bash
cd backend
npx prisma migrate deploy
```

5. Build and start backend:
```bash
npm run build
npm start
```

6. Build frontend:
```bash
cd ../frontend
npm run build
```

7. Serve frontend static files with a web server (e.g., Nginx)

## Database Migrations

Using Prisma:

- Generate Prisma client:
```bash
npm run prisma:generate
```

- Create a new migration:
```bash
npx prisma migrate dev --name <migration_name>
```

- Apply migrations in production:
```bash
npx prisma migrate deploy
```

## Monitoring

Key metrics to monitor:
- API response times
- Authentication success rates
- Knowledge base access frequency
- SSO login failures
- Database and cache health

## Maintenance
- Run `npm run lint` and `npm run test` before deployments
- Regularly backup PostgreSQL database
- Monitor Redis memory usage
- Update OAuth credentials as required
