# OAuth2 配置管理改进

## 概述

本次更新实现了完整的OAuth2配置管理功能，允许管理员在后台界面手动启用/禁用OAuth2提供商，默认启用Google和GitHub。

## 主要变更

### 1. 数据库种子文件 (backend/prisma/seed.ts)

创建了数据库种子文件，在系统初始化时自动创建：
- **管理员账户**（从环境变量读取）
- **Google OAuth2配置**（默认启用）
- **GitHub OAuth2配置**（默认启用）

运行方法：
```bash
cd backend
npm run prisma:seed
```

### 2. 动态OAuth2策略配置 (backend/src/config/passport.ts)

重构了Passport配置，改为从数据库动态加载OAuth2配置：

**变更前**：
- 从环境变量静态读取OAuth2配置
- 服务器启动后无法更改

**变更后**：
- 从数据库动态读取OAuth2配置
- 支持运行时重新配置（当管理员更新配置时）
- 自动清理已删除的策略

关键函数：
- `configurePassport()`: 从数据库加载并配置OAuth2策略
- `removeStrategy()`: 移除旧的OAuth2策略

### 3. OAuth2配置CRUD操作自动重配置

在管理员进行以下操作后，系统会自动重新配置OAuth2策略：
- 创建/更新OAuth2配置
- 启用/禁用OAuth2配置
- 删除OAuth2配置

### 4. 动态OAuth2路由检查 (backend/src/routes/authRoutes.ts)

OAuth2登录路由现在会实时检查数据库配置：

```typescript
router.get('/oauth2/google', async (req, res, next) => {
  const config = await getActiveOAuthConfig('GOOGLE');
  if (!config) {
    return res.status(503).json({ message: 'Google OAuth 未启用' });
  }
  passport.authenticate('google', { ... })(req, res, next);
});
```

### 5. OAuth2提供商状态API (backend/src/controllers/authController.ts)

更新了 `getOAuthProviders` API，改为基于数据库配置返回OAuth2状态：

**变更前**：
```typescript
const googleEnabled = Boolean(env.oauth.google.clientId && env.oauth.google.clientSecret);
```

**变更后**：
```typescript
const googleConfig = dbConfigs.find(config => config.provider.toUpperCase() === 'GOOGLE');
const googleEnabled = Boolean(googleConfig?.isActive && googleConfig.clientId && googleConfig.clientSecret);
```

## 使用流程

### 初始化系统

1. 配置环境变量（`.env`文件）：
```env
SITE_URL=http://localhost:5000

# 管理员账户
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123456

# Google OAuth2（可选，会在数据库中创建配置）
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/oauth2/google/callback

# GitHub OAuth2（可选，会在数据库中创建配置）
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/oauth2/github/callback
```

2. 运行数据库迁移和种子：
```bash
cd backend
npx prisma migrate deploy
npm run prisma:seed
```

3. 启动服务器：
```bash
npm run dev
```

### 管理OAuth2配置

1. 使用管理员账户登录
2. 进入"OAuth2 配置管理"页面
3. 可以查看已有的Google和GitHub配置
4. 编辑配置：
   - 更新Client ID和Client Secret
   - 修改Callback URL
   - 调整Scope
5. 使用开关按钮启用/禁用OAuth2提供商
6. 更改会立即生效，无需重启服务器

### 用户登录体验

1. 用户访问登录页面
2. 系统实时检查数据库中的OAuth2配置
3. 只显示已启用的OAuth2登录按钮
4. 禁用的按钮会显示提示："请联系管理员启用 XX 登录"

## 技术细节

### OAuth2配置表结构

```prisma
model OAuth2Config {
  id              String      @id @default(uuid())
  name            String      @unique
  provider        String      // GOOGLE, GITHUB, CUSTOM
  clientId        String
  clientSecret    String
  callbackUrl     String
  authUrl         String?
  tokenUrl        String?
  userInfoUrl     String?
  scope           String[]    @default([])
  isActive        Boolean     @default(true)  // 默认启用
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}
```

### 默认配置

数据库种子会创建以下默认配置：

**Google OAuth2**:
- Provider: GOOGLE
- isActive: true
- Scope: ['profile', 'email']
- Auth URL: https://accounts.google.com/o/oauth2/v2/auth
- Token URL: https://oauth2.googleapis.com/token
- User Info URL: https://www.googleapis.com/oauth2/v2/userinfo

**GitHub OAuth2**:
- Provider: GITHUB
- isActive: true
- Scope: ['read:user', 'user:email']
- Auth URL: https://github.com/login/oauth/authorize
- Token URL: https://github.com/login/oauth/access_token
- User Info URL: https://api.github.com/user

## 优势

1. **灵活性**：管理员可以在运行时启用/禁用OAuth2提供商
2. **可扩展性**：轻松添加新的OAuth2提供商
3. **安全性**：敏感信息存储在数据库中，支持权限控制
4. **用户体验**：登录界面只显示已启用的登录选项
5. **零停机**：配置更改无需重启服务器

## 兼容性

- 向后兼容：仍然支持从环境变量读取配置（用于初始化）
- 数据库优先：数据库配置优先于环境变量
- 平滑迁移：现有部署可以运行种子文件来迁移配置

## 故障排查

### OAuth2登录按钮禁用

**检查**：
1. 登录管理后台
2. 查看"OAuth2 配置管理"
3. 确认对应提供商的配置存在且已启用
4. 检查Client ID和Client Secret是否正确

### OAuth2登录失败

**检查**：
1. 确认Callback URL与OAuth2提供商设置一致
2. 查看服务器日志中的错误信息
3. 确认数据库中的配置是正确的

### 配置更改未生效

系统会在以下操作后自动重新配置：
- 创建/更新OAuth2配置
- 启用/禁用开关
- 删除配置

如果仍未生效，重启服务器即可。

## 文档

更多详细信息，请参阅：
- [backend/README_SEED.md](backend/README_SEED.md) - 数据库种子使用指南
- [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) - 完整部署指南
