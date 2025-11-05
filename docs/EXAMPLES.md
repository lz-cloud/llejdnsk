# Usage Examples

## SSO Integration Example

### HTML Button with SSO Link

```html
<!DOCTYPE html>
<html>
<head>
  <title>ERP System</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js"></script>
</head>
<body>
  <button onclick="openKnowledgeBase()">Open Knowledge Base</button>

  <script>
    function encryptSSO(payload, desKey, desIV) {
      const key = CryptoJS.enc.Utf8.parse(desKey);
      const iv = CryptoJS.enc.Utf8.parse(desIV);
      
      const encrypted = CryptoJS.DES.encrypt(
        JSON.stringify(payload),
        key,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );
      
      return encrypted.toString();
    }

    function openKnowledgeBase() {
      const userCode = 'employee123'; // Get from session
      const payload = {
        UserCode: userCode,
        iat: Math.floor(Date.now() / 1000),
        PageUrl: 'https://fastgpt.example.com/kb/123'
      };

      const desKey = '12345678'; // From SSO config
      const desIV = '12345678';
      const ssoConfigId = 'your-config-uuid';

      const encrypted = encryptSSO(payload, desKey, desIV);
      const encodedParams = encodeURIComponent(encrypted);
      const loginUrl = `https://platform.example.com/login?sso=${encodedParams}&config=${ssoConfigId}`;

      window.location.href = loginUrl;
    }
  </script>
</body>
</html>
```

### Express.js Backend Integration

```javascript
const express = require('express');
const CryptoJS = require('crypto-js');
const app = express();

const SSO_CONFIG = {
  desKey: '12345678',
  desIV: '12345678',
  ssoConfigId: 'your-config-uuid',
  platformUrl: 'https://platform.example.com'
};

function generateSSOUrl(userCode, targetUrl) {
  const payload = {
    UserCode: userCode,
    iat: Math.floor(Date.now() / 1000),
    PageUrl: targetUrl
  };

  const key = CryptoJS.enc.Utf8.parse(SSO_CONFIG.desKey);
  const iv = CryptoJS.enc.Utf8.parse(SSO_CONFIG.desIV);
  
  const encrypted = CryptoJS.DES.encrypt(
    JSON.stringify(payload),
    key,
    {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  ).toString();
  
  const encodedParams = encodeURIComponent(encrypted);
  return `${SSO_CONFIG.platformUrl}/login?sso=${encodedParams}&config=${SSO_CONFIG.ssoConfigId}`;
}

app.get('/sso-login', (req, res) => {
  const userCode = req.session.userCode; // From your auth
  const targetKB = req.query.kb || '';
  
  const ssoUrl = generateSSOUrl(userCode, targetKB);
  res.redirect(ssoUrl);
});

app.listen(3000);
```

## Admin Configuration Examples

### Create Knowledge Base

```bash
curl -X POST http://localhost:5000/api/admin/knowledge-bases \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Technical Documentation",
    "description": "Internal technical documentation and API references",
    "url": "https://docs.internal.company.com",
    "category": "Technical",
    "icon": "https://cdn.company.com/icons/docs.png",
    "displayOrder": 1,
    "isActive": true
  }'
```

### Create SSO Configuration

```bash
curl -X POST http://localhost:5000/api/admin/sso-configs \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ERP System SSO",
    "desKey": "mykey123",
    "desIV": "myiv1234",
    "desPadding": "pkcs5padding",
    "desMode": "CBC",
    "tokenValidity": 5,
    "isActive": true,
    "allowedIPs": ["192.168.1.100", "10.0.0.5"]
  }'
```

### Assign Permissions to Group

```bash
curl -X POST http://localhost:5000/api/admin/bulk-permissions \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "group-uuid",
    "knowledgeBaseIds": ["kb-uuid-1", "kb-uuid-2", "kb-uuid-3"],
    "accessLevel": "READ"
  }'
```

## User Portal Examples

### Login and Access Knowledge Bases

```javascript
// Login
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});

const { data } = await loginResponse.json();
const token = data.token;

// Get accessible knowledge bases
const kbResponse = await fetch('http://localhost:5000/api/portal/knowledge-bases', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data: knowledgeBases } = await kbResponse.json();
console.log('Available knowledge bases:', knowledgeBases);

// Record access to a knowledge base
await fetch(`http://localhost:5000/api/portal/knowledge-bases/${knowledgeBases[0].id}/access`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Open knowledge base
window.open(knowledgeBases[0].url, '_blank');
```

### Toggle Favorite

```javascript
const toggleFavorite = async (knowledgeBaseId, token) => {
  const response = await fetch('http://localhost:5000/api/portal/favorites', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ knowledgeBaseId })
  });

  const { data } = await response.json();
  return data.favorited; // true or false
};
```

## OAuth2 Login

### Using Google OAuth

1. Configure Google OAuth in backend `.env`:
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/oauth2/google/callback
```

2. Redirect user to Google:
```javascript
window.location.href = 'http://localhost:5000/api/auth/oauth2/google';
```

3. Handle callback (backend automatically handles this)

### Using GitHub OAuth

1. Configure GitHub OAuth in backend `.env`:
```env
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/oauth2/github/callback
```

2. Redirect user:
```javascript
window.location.href = 'http://localhost:5000/api/auth/oauth2/github';
```

## Python Integration Example

```python
import requests
import json
from Crypto.Cipher import DES
from Crypto.Util.Padding import pad
import base64
import time
import urllib.parse

class FastGPTPlatformClient:
    def __init__(self, base_url, des_key, des_iv, sso_config_id):
        self.base_url = base_url
        self.des_key = des_key
        self.des_iv = des_iv
        self.sso_config_id = sso_config_id
    
    def encrypt_sso(self, payload):
        cipher = DES.new(
            self.des_key.encode('utf-8'),
            DES.MODE_CBC,
            self.des_iv.encode('utf-8')
        )
        json_payload = json.dumps(payload)
        padded = pad(json_payload.encode('utf-8'), DES.block_size)
        encrypted = cipher.encrypt(padded)
        return base64.b64encode(encrypted).decode('utf-8')
    
    def generate_sso_url(self, user_code, target_url=None):
        payload = {
            "UserCode": user_code,
            "iat": int(time.time())
        }
        if target_url:
            payload["PageUrl"] = target_url
        
        encrypted = self.encrypt_sso(payload)
        encoded = urllib.parse.quote(encrypted)
        
        return f"{self.base_url}/login?sso={encoded}&config={self.sso_config_id}"

# Usage
client = FastGPTPlatformClient(
    base_url="https://platform.example.com",
    des_key="12345678",
    des_iv="12345678",
    sso_config_id="your-config-uuid"
)

sso_url = client.generate_sso_url(
    user_code="employee123",
    target_url="https://kb.example.com/technical-docs"
)

print(f"SSO Login URL: {sso_url}")
```

## Docker Compose Example

```yaml
version: '3.8'

services:
  fastgpt-platform:
    image: fastgpt-platform:latest
    ports:
      - "80:3000"
    environment:
      VITE_API_URL: http://api.example.com/api
    depends_on:
      - backend

  backend:
    image: fastgpt-backend:latest
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/db
      REDIS_HOST: redis
      JWT_SECRET: your-secret
      FRONTEND_URL: http://localhost
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:14
    environment:
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7

volumes:
  postgres_data:
```
