# SSO Integration Guide

## Overview

This platform supports custom Single Sign-On (SSO) using DES-encrypted parameter passing. This allows third-party systems to securely authenticate users and redirect them to specific knowledge bases.

## SSO Flow

1. Third-party system creates SSO payload with user information
2. Payload is DES-encrypted using configured key and IV
3. Encrypted payload is sent to the platform via URL parameters
4. Platform decrypts and validates the payload
5. User is authenticated and redirected to the target knowledge base

## Creating an SSO Configuration

### Via Admin UI
1. Navigate to Admin > SSO Configuration
2. Click "New Configuration"
3. Fill in the following fields:
   - **Name**: Configuration identifier
   - **DES Key**: 8-character encryption key
   - **DES IV**: 8-character initialization vector
   - **Padding**: `pkcs5padding` (default)
   - **Mode**: `CBC` (default)
   - **Token Validity**: Minutes the token remains valid (default: 5)
   - **Allowed IPs**: Whitelist of IPs that can initiate SSO (optional)
   - **Status**: Enable/Disable configuration

### Via API
```bash
POST /api/admin/sso-configs
Authorization: Bearer <admin_token>

{
  "name": "ERP System SSO",
  "desKey": "12345678",
  "desIV": "12345678",
  "desPadding": "pkcs5padding",
  "desMode": "CBC",
  "tokenValidity": 5,
  "isActive": true,
  "allowedIPs": []
}
```

## Implementing SSO in Your System

### Step 1: Create SSO Payload

The payload must be a JSON object with the following structure:

```json
{
  "UserCode": "employee123",
  "iat": 1234567890,
  "PageUrl": "https://fastgpt.example.com/knowledge-base/123"
}
```

**Fields:**
- `UserCode` (required): Unique user identifier from your system
- `iat` (required): Current Unix timestamp (seconds since epoch)
- `PageUrl` (optional): Target URL to redirect after authentication

### Step 2: Encrypt Payload

Using the DES configuration:
- **Mode**: CBC
- **Padding**: Pkcs5 / Pkcs7
- **Key**: 8-character key (e.g., "12345678")
- **IV**: 8-character IV (e.g., "12345678")
- **Output**: Base64-encoded string

#### Example in Node.js

```javascript
const CryptoJS = require('crypto-js');

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

// Usage
const payload = {
  UserCode: "user123",
  iat: Math.floor(Date.now() / 1000),
  PageUrl: "https://kb.example.com/kb1"
};

const encrypted = encryptSSO(payload, "12345678", "12345678");
console.log(encrypted);
```

#### Example in Python

```python
from Crypto.Cipher import DES
from Crypto.Util.Padding import pad
import json
import base64
import time

def encrypt_sso(payload, des_key, des_iv):
    cipher = DES.new(des_key.encode('utf-8'), DES.MODE_CBC, des_iv.encode('utf-8'))
    json_payload = json.dumps(payload)
    padded = pad(json_payload.encode('utf-8'), DES.block_size)
    encrypted = cipher.encrypt(padded)
    return base64.b64encode(encrypted).decode('utf-8')

# Usage
payload = {
    "UserCode": "user123",
    "iat": int(time.time()),
    "PageUrl": "https://kb.example.com/kb1"
}

encrypted = encrypt_sso(payload, "12345678", "12345678")
print(encrypted)
```

### Step 3: Redirect User

Once encrypted, redirect the user to:

```
https://platform.example.com/login?sso=<encrypted_params>&config=<sso_config_id>
```

**Parameters:**
- `sso`: URL-encoded encrypted payload
- `config`: SSO configuration ID from the admin panel

#### Complete Example URL

```javascript
const encryptedParams = encryptSSO(payload, "12345678", "12345678");
const encodedParams = encodeURIComponent(encryptedParams);
const ssoConfigId = "uuid-of-sso-config";
const loginUrl = `https://platform.example.com/login?sso=${encodedParams}&config=${ssoConfigId}`;

// Redirect user
window.location.href = loginUrl;
```

## User Mapping

The platform supports two user mapping modes:

### Mode 1: ERP User Code Mapping
- Users are identified by their `erpUserCode` field
- If user doesn't exist, a new user is created automatically
- Email format: `{UserCode}@sso.local`

### Mode 2: Manual User Creation
- Admin creates users in advance via Admin UI
- Sets the `erpUserCode` field for each user
- SSO matches incoming `UserCode` with existing users

## Security Considerations

1. **Token Expiration**: Tokens are valid for 5 minutes by default. Adjust `tokenValidity` as needed.

2. **IP Whitelisting**: Use `allowedIPs` to restrict SSO initiation to trusted servers.

3. **Time Synchronization**: Ensure your server time is synchronized with NTP. The platform checks the timestamp with a 5-minute tolerance.

4. **Key Security**: 
   - Use strong, random 8-character keys
   - Store keys securely (environment variables, secrets management)
   - Rotate keys periodically

5. **HTTPS**: Always use HTTPS in production to prevent man-in-the-middle attacks.

## Testing SSO

Use the test tool to verify your SSO implementation:

```bash
curl -X POST https://platform.example.com/api/auth/sso/login \
  -H "Content-Type: application/json" \
  -d '{
    "encryptedParams": "<encrypted_params>",
    "ssoConfigId": "<config_id>"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "jwt_token",
    "redirectUrl": "https://kb.example.com/kb1"
  }
}
```

## Troubleshooting

### "SSO token expired or invalid timestamp"
- Check server time synchronization
- Ensure `iat` is the current Unix timestamp in seconds

### "Invalid SSO parameters"
- Verify encryption key and IV match configuration
- Check JSON payload format

### "SSO configuration not found or inactive"
- Ensure SSO config exists and is active
- Verify `ssoConfigId` parameter

### "User account is inactive"
- Check user status in Admin UI
- Activate user if necessary

## Audit Logging

All SSO login attempts are logged with:
- User code
- Success/failure status
- Failure reason (if applicable)
- IP address
- Timestamp

Access logs via Admin > Access Analytics.
