# 数据库种子（Database Seeding）

## 概述

本系统使用数据库种子文件在系统初始化时自动创建默认配置，包括：
- 管理员账户
- Google OAuth2 配置（默认启用）
- GitHub OAuth2 配置（默认启用）

## 运行种子文件

### 方法1：手动运行

```bash
npm run prisma:seed
```

### 方法2：与迁移一起运行

```bash
npx prisma migrate reset  # 重置数据库并自动运行种子
```

或

```bash
npx prisma migrate dev  # 在开发环境下，新的迁移后自动运行种子
```

## 默认配置

### 管理员账户
- **邮箱**: 从环境变量 `ADMIN_EMAIL` 读取，默认为 `admin@example.com`
- **密码**: 从环境变量 `ADMIN_PASSWORD` 读取，默认为 `Admin@123456`

### Google OAuth2
- **名称**: Google OAuth2
- **提供商**: GOOGLE
- **状态**: 默认启用（isActive: true）
- **Client ID**: 从环境变量 `GOOGLE_CLIENT_ID` 读取
- **Client Secret**: 从环境变量 `GOOGLE_CLIENT_SECRET` 读取
- **Callback URL**: 从环境变量 `GOOGLE_CALLBACK_URL` 读取，默认为 `{SITE_URL}/api/auth/oauth2/google/callback`
- **Scope**: `['profile', 'email']`

### GitHub OAuth2
- **名称**: GitHub OAuth2
- **提供商**: GITHUB
- **状态**: 默认启用（isActive: true）
- **Client ID**: 从环境变量 `GITHUB_CLIENT_ID` 读取
- **Client Secret**: 从环境变量 `GITHUB_CLIENT_SECRET` 读取
- **Callback URL**: 从环境变量 `GITHUB_CALLBACK_URL` 读取，默认为 `{SITE_URL}/api/auth/oauth2/github/callback`
- **Scope**: `['read:user', 'user:email']`

## 环境变量配置

在 `.env` 文件中配置以下变量：

```bash
# 站点URL
SITE_URL=http://localhost:5000

# 管理员账户
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123456

# Google OAuth2
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/oauth2/google/callback

# GitHub OAuth2
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/oauth2/github/callback
```

## OAuth2 配置管理

### 在管理员界面管理

1. 登录管理员账户
2. 进入 "OAuth2 配置管理" 页面
3. 可以查看、编辑、启用/禁用 Google 和 GitHub OAuth2 配置
4. 可以添加自定义 OAuth2 提供商

### 启用/禁用 OAuth2

- 在管理员界面中，每个 OAuth2 配置都有一个开关按钮
- 切换开关可以启用或禁用该 OAuth2 提供商
- 默认情况下，Google 和 GitHub 是启用的
- 禁用后，用户在登录页面将无法使用该第三方登录

## 注意事项

1. **首次部署**: 运行 `npx prisma migrate deploy && npm run prisma:seed`
2. **开发环境**: 使用 `npx prisma migrate dev` 会自动运行种子
3. **生产环境**: 需要手动运行 `npm run prisma:seed`
4. **重复运行**: 种子文件使用 `upsert` 操作，可以安全地重复运行
5. **Client ID/Secret**: 如果环境变量中没有配置实际的值，将使用占位符，需要在管理员界面中手动更新

## 获取 OAuth2 凭证

### Google OAuth2
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 客户端ID
5. 设置授权重定向 URI: `http://your-domain/api/auth/oauth2/google/callback`
6. 复制 Client ID 和 Client Secret

### GitHub OAuth2
1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写应用信息
4. 设置 Authorization callback URL: `http://your-domain/api/auth/oauth2/github/callback`
5. 复制 Client ID 和 Client Secret
