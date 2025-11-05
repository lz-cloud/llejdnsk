# FastGPT Third-Party Platform

A comprehensive SSO and knowledge base management platform for FastGPT integration, supporting OAuth2 and custom DES-encrypted SSO authentication.

## Features

### Authentication System
- **OAuth2 Integration**: Support for Google, GitHub, and other standard providers
- **Custom SSO**: DES-encrypted parameter passing with configurable settings
- **Dual Mode Support**:
  - ERP user code mode
  - Third-party system user mapping mode

### Admin Features
- Knowledge base management with access control
- SSO parameter configuration interface
- User and group management
- System monitoring dashboard
- Bulk user operations
- Access analytics and audit logs

### User Portal
- Personal knowledge base access list
- Card/List view with search and filtering
- Recent access history
- Favorites management
- Usage statistics
- Embedded knowledge base access via iframe

## Tech Stack

### Backend
- **Framework**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for session management
- **Authentication**: Passport.js with OAuth2 and custom strategies
- **Encryption**: DES encryption (CBC mode, pkcs5padding)

### Frontend
- **Framework**: React + TypeScript
- **UI Components**: Ant Design
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **HTTP Client**: Axios

## Project Structure

```
.
├── backend/                 # Backend API service
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── app.ts          # Express app
│   ├── prisma/             # Database schema and migrations
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # Redux store
│   │   ├── utils/          # Utility functions
│   │   └── App.tsx         # Root component
│   └── package.json
├── docker-compose.yml      # Docker orchestration
└── docs/                   # Documentation
```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose (optional)

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

### Manual Setup

#### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run prisma:migrate
npm run dev
```

#### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

## Configuration

### SSO DES Encryption Configuration

```javascript
{
  "mode": "CBC",
  "key": "8-char-key",        // 8 character custom key
  "padding": "pkcs5padding",
  "iv": "8-char-iv",          // Same as key or custom
  "output": "base64",
  "encoding": "utf-8"
}
```

### OAuth2 Configuration

Configure OAuth2 providers in `.env`:

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

## API Documentation

API documentation is auto-generated using Swagger and available at `/api-docs` when the server is running.

### Key Endpoints

#### Authentication
- `POST /api/auth/sso/login` - SSO login with encrypted parameters
- `GET /api/auth/oauth2/:provider` - OAuth2 login initiation
- `GET /api/auth/oauth2/:provider/callback` - OAuth2 callback
- `POST /api/auth/logout` - User logout

#### User Portal
- `GET /api/portal/knowledge-bases` - Get accessible knowledge bases
- `POST /api/portal/knowledge-bases/:id/access` - Record access
- `GET /api/portal/recent-access` - Get recent access history
- `POST /api/portal/favorites` - Manage favorites
- `GET /api/portal/usage-stats` - Get usage statistics

#### Admin
- `GET/POST /api/admin/knowledge-bases` - Manage knowledge bases
- `GET/POST /api/admin/sso-config` - Manage SSO configurations
- `GET/POST /api/admin/users` - User management
- `GET /api/admin/analytics` - Access analytics
- `POST /api/admin/bulk-permissions` - Bulk permission assignment

## Security Features

- DES encrypted parameter transmission
- Server time synchronization check
- URL encoding support
- POST/Cookie parameter passing
- LDAP domain authentication support
- IP whitelist restrictions
- Rate limiting
- Anomaly detection and alerts
- Comprehensive audit logging

## Deployment

### Docker Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

1. Build frontend:
```bash
cd frontend
npm run build
```

2. Build backend:
```bash
cd backend
npm run build
```

3. Set up PostgreSQL and Redis

4. Run migrations:
```bash
npm run prisma:migrate:deploy
```

5. Start the application:
```bash
npm start
```

## Monitoring

The platform includes monitoring for:
- User activity metrics
- Knowledge base access frequency
- SSO login success rate
- System response time
- Error rate statistics

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
