# FastGPT Third-Party Platform API Documentation

## Authentication Endpoints

### Register
**POST** `/api/auth/register`

Request:
```json
{
  "email": "user@example.com",
  "password": "password",
  "username": "user",
  "displayName": "User Name"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "displayName": "User Name",
      "role": "USER"
    },
    "token": "jwt_token"
  }
}
```

### Login
**POST** `/api/auth/login`

Request:
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Response: Same as register

### SSO Login
**POST** `/api/auth/sso/login`

Request:
```json
{
  "encryptedParams": "base64_encrypted_string",
  "ssoConfigId": "uuid"
}
```

Encrypted Parameters Format:
```json
{
  "UserCode": "erp_user_code",
  "iat": 1234567890,
  "PageUrl": "http://optional-redirect-url.com"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "jwt_token",
    "redirectUrl": "http://optional-redirect-url.com"
  }
}
```

### Get Profile
**GET** `/api/auth/profile`
Headers: `Authorization: Bearer <token>`

Response:
```json
{
  "success": true,
  "data": {
    "user": {...}
  }
}
```

### Logout
**POST** `/api/auth/logout`

Response:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Portal Endpoints

All portal endpoints require authentication via Bearer token.

### Get Knowledge Bases
**GET** `/api/portal/knowledge-bases`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Knowledge Base 1",
      "description": "Description",
      "url": "https://kb1.example.com",
      "category": "Technical",
      "icon": "https://icon.url",
      "displayOrder": 0,
      "accessLevel": "READ",
      "isActive": true
    }
  ]
}
```

### Record Access
**POST** `/api/portal/knowledge-bases/:id/access`

Response:
```json
{
  "success": true,
  "message": "Access recorded successfully"
}
```

### Get Recent Access
**GET** `/api/portal/recent-access`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "knowledgeBaseId": "uuid",
      "accessTime": "2024-01-01T00:00:00Z",
      "accessDuration": 120,
      "knowledgeBase": {...}
    }
  ]
}
```

### Toggle Favorite
**POST** `/api/portal/favorites`

Request:
```json
{
  "knowledgeBaseId": "uuid"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "favorited": true
  }
}
```

### Get Favorites
**GET** `/api/portal/favorites`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "knowledgeBaseId": "uuid",
      "createdAt": "2024-01-01T00:00:00Z",
      "knowledgeBase": {...}
    }
  ]
}
```

### Get Usage Stats
**GET** `/api/portal/usage-stats`

Response:
```json
{
  "success": true,
  "data": {
    "totalAccess": 100,
    "totalDuration": 3600,
    "uniqueKnowledgeBases": 5,
    "accessByKB": {
      "kb-uuid-1": 50,
      "kb-uuid-2": 30
    }
  }
}
```

## Admin Endpoints

All admin endpoints require authentication with ADMIN role.

### Knowledge Base Management

**GET** `/api/admin/knowledge-bases` - List all knowledge bases

**POST** `/api/admin/knowledge-bases` - Create knowledge base
```json
{
  "name": "KB Name",
  "description": "Description",
  "url": "https://kb.example.com",
  "category": "Category",
  "icon": "https://icon.url",
  "displayOrder": 0,
  "isActive": true
}
```

**PUT** `/api/admin/knowledge-bases/:id` - Update knowledge base

**DELETE** `/api/admin/knowledge-bases/:id` - Delete knowledge base

### SSO Configuration

**GET** `/api/admin/sso-configs` - List SSO configs

**POST** `/api/admin/sso-configs` - Create/Update SSO config
```json
{
  "name": "SSO Config 1",
  "desKey": "12345678",
  "desIV": "12345678",
  "desPadding": "pkcs5padding",
  "desMode": "CBC",
  "tokenValidity": 5,
  "isActive": true,
  "allowedIPs": ["192.168.1.1", "10.0.0.1"]
}
```

**DELETE** `/api/admin/sso-configs/:id` - Delete SSO config

### User Management

**GET** `/api/admin/users` - List all users

**POST** `/api/admin/users` - Create/Update user
```json
{
  "email": "user@example.com",
  "displayName": "User Name",
  "role": "USER",
  "password": "password",
  "erpUserCode": "ERP123",
  "isActive": true,
  "groups": ["group-uuid-1", "group-uuid-2"]
}
```

**POST** `/api/admin/users/:id/deactivate` - Deactivate user

### Group Management

**GET** `/api/admin/groups` - List all groups

**POST** `/api/admin/groups` - Create group
```json
{
  "name": "Group Name",
  "description": "Description"
}
```

### Permissions

**POST** `/api/admin/bulk-permissions` - Assign bulk permissions
```json
{
  "groupId": "uuid",
  "knowledgeBaseIds": ["kb-uuid-1", "kb-uuid-2"],
  "accessLevel": "READ"
}
```

### Analytics

**GET** `/api/admin/access-analytics` - Get access analytics

**GET** `/api/admin/system-stats` - Get system statistics

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error message description"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting

API requests are limited to 100 requests per 15 minutes per IP address.

When rate limit is exceeded:
```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```
