# FastGPT 第三方平台

一个功能完整的知识库管理平台，支持OAuth2和自定义SSO单点登录，专为FastGPT集成设计。

## ✨ 核心功能

### 🔐 认证系统
- **OAuth2集成**：支持Google、GitHub等标准OAuth2提供商
- **自定义SSO**：基于DES加密的参数传递，支持配置化管理
- **双模式支持**：
  - ERP用户编码模式
  - 第三方系统用户映射模式
- **安全特性**：IP白名单、时间戳验证、审计日志

### 👨‍💼 管理员功能
- **知识库管理**：创建、编辑、删除知识库，配置访问地址和显示名称
- **SSO配置管理**：可视化界面配置多个SSO提供商
- **用户管理**：用户创建、编辑、禁用，支持多种认证方式
- **用户组管理**：批量权限管理，简化运维操作
- **系统监控**：实时数据统计、访问分析、审计日志
- **批量操作**：用户导入、权限批量设置

### 🚪 用户门户
- **知识库列表**：卡片式/列表式视图，支持搜索和筛选
- **最近访问**：快速访问历史记录
- **收藏管理**：个人收藏夹功能
- **使用统计**：个人访问数据可视化
- **iframe嵌入**：无缝嵌入知识库内容

## 🛠 技术栈

### 后端
- **框架**：Node.js + Express + TypeScript
- **数据库**：PostgreSQL + Prisma ORM
- **缓存**：Redis（会话管理）
- **认证**：Passport.js（OAuth2 + 自定义策略）
- **加密**：DES加密（CBC模式，pkcs5padding）
- **API文档**：Swagger/OpenAPI 3.0

### 前端
- **框架**：React 18 + TypeScript
- **UI组件库**：Ant Design 5
- **状态管理**：Redux Toolkit
- **路由**：React Router v6
- **HTTP客户端**：Axios
- **构建工具**：Vite

## 📁 项目结构

```
.
├── backend/                     # 后端API服务
│   ├── src/
│   │   ├── config/             # 配置文件（数据库、Redis、Passport）
│   │   ├── controllers/        # 控制器（认证、管理、门户、OAuth2）
│   │   ├── middleware/         # 中间件（认证、限流、错误处理）
│   │   ├── routes/             # 路由定义
│   │   ├── services/           # 业务逻辑层
│   │   ├── utils/              # 工具函数（加密、JWT、日志）
│   │   ├── types/              # TypeScript类型定义
│   │   ├── docs/               # Swagger文档配置
│   │   └── app.ts              # Express应用入口
│   ├── prisma/                 # 数据库Schema和迁移
│   │   └── schema.prisma       # Prisma数据模型
│   ├── Dockerfile              # Docker镜像构建
│   └── package.json
├── frontend/                    # React前端应用
│   ├── src/
│   │   ├── pages/              # 页面组件
│   │   │   ├── admin/          # 管理后台页面
│   │   │   ├── LoginPage.tsx   # 登录页
│   │   │   ├── PortalPage.tsx  # 知识库门户
│   │   │   └── ...
│   │   ├── services/           # API服务封装
│   │   ├── store/              # Redux状态管理
│   │   ├── types/              # TypeScript类型
│   │   ├── App.tsx             # 根组件
│   │   └── main.tsx            # 应用入口
│   ├── Dockerfile              # Docker镜像构建
│   └── package.json
├── docker-compose.yml          # Docker编排文件
└── docs/                       # 文档目录
```

## 🚀 快速开始

### 前置要求
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose（可选）

### 使用Docker（推荐）

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

服务地址：
- 前端应用：http://localhost:3000
- 后端API：http://localhost:5000
- API文档：http://localhost:5000/api-docs

默认管理员账号：
- 邮箱：admin@example.com
- 密码：Admin@123456

### 手动部署

#### 1. 数据库和Redis设置

```bash
# 启动PostgreSQL
docker run -d --name postgres -p 5432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=fastgpt_platform \
  postgres:14

# 启动Redis
docker run -d --name redis -p 6379:6379 redis:7
```

#### 2. 后端设置

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件，填入数据库连接信息等

# 生成Prisma客户端
npm run prisma:generate

# 运行数据库迁移
npm run prisma:migrate

# 启动开发服务器
npm run dev
```

> 注意：`SITE_URL` 用于配置平台默认网站地址（默认值：`http://localhost:5000`），部署到生产环境时请修改为真实访问域名，并避免末尾斜杠。

#### 3. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件，设置API地址

# 启动开发服务器
npm run dev
```

## ⚙️ 配置说明

### SSO DES加密配置

在管理后台可创建多个SSO配置，配置参数如下：

```javascript
{
  "name": "配置名称",
  "desKey": "8字符密钥",        // 8位自定义密钥
  "desIV": "8字符IV",           // 与密钥一致或自定义
  "desPadding": "pkcs5padding", // 填充方式
  "desMode": "CBC",             // 加密模式
  "tokenValidity": 5,           // 令牌有效期（分钟）
  "allowedIPs": ["1.2.3.4"],    // IP白名单（可选）
  "isActive": true              // 是否启用
}
```

### SSO登录流程

1. 第三方系统生成加密参数：
```javascript
const payload = {
  UserCode: "用户编码",
  iat: Math.floor(Date.now() / 1000),  // Unix时间戳
  PageUrl: "http://跳转地址"             // 可选
};
const encrypted = desEncrypt(JSON.stringify(payload));
```

2. 跳转到登录URL：
```
http://your-domain.com/login?sso={encrypted}&config={ssoConfigId}
```

3. 系统自动解密验证并登录用户

### OAuth2配置

编辑后端`.env`文件配置OAuth2提供商：

```env
# Google OAuth2
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/oauth2/google/callback

# GitHub OAuth2
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/oauth2/github/callback
```

## 📚 API文档

API文档自动生成，启动后端服务后访问：`http://localhost:5000/api-docs`

### 核心API端点

#### 认证相关
- `POST /api/auth/login` - 邮箱密码登录
- `POST /api/auth/sso/login` - SSO单点登录
- `GET /api/auth/oauth2/google` - Google OAuth2登录
- `GET /api/auth/oauth2/github` - GitHub OAuth2登录
- `GET /api/auth/profile` - 获取当前用户信息
- `POST /api/auth/logout` - 登出

#### 用户门户
- `GET /api/portal/knowledge-bases` - 获取可访问的知识库列表
- `POST /api/portal/knowledge-bases/:id/access` - 记录访问
- `GET /api/portal/recent-access` - 最近访问记录
- `POST /api/portal/favorites` - 收藏/取消收藏
- `GET /api/portal/favorites` - 获取收藏列表
- `GET /api/portal/usage-stats` - 使用统计

#### 管理员功能
- `GET /api/admin/knowledge-bases` - 获取知识库列表
- `POST /api/admin/knowledge-bases` - 创建知识库
- `PUT /api/admin/knowledge-bases/:id` - 更新知识库
- `DELETE /api/admin/knowledge-bases/:id` - 删除知识库
- `GET /api/admin/sso-configs` - 获取SSO配置列表
- `POST /api/admin/sso-configs` - 创建/更新SSO配置
- `GET /api/admin/users` - 获取用户列表
- `POST /api/admin/users` - 创建/更新用户
- `POST /api/admin/users/:id/deactivate` - 禁用用户
- `GET /api/admin/groups` - 获取用户组列表
- `POST /api/admin/groups` - 创建用户组
- `POST /api/admin/bulk-permissions` - 批量设置权限
- `GET /api/admin/access-analytics` - 访问分析数据
- `GET /api/admin/system-stats` - 系统统计

## 🔒 安全特性

- ✅ DES加密参数传输
- ✅ 服务器时间同步检查
- ✅ URL编码支持
- ✅ POST/Cookie参数传递
- ✅ IP白名单限制
- ✅ 访问频率限制（Rate Limiting）
- ✅ 异常登录检测
- ✅ 全面的审计日志
- ✅ JWT令牌认证
- ✅ 密码加密存储

## 📊 数据模型

### 核心表结构

- **User（用户）**：用户基本信息、认证方式、角色权限
- **KnowledgeBase（知识库）**：知识库配置、URL、分类
- **UserGroup（用户组）**：用户分组管理
- **UserAccess（用户权限）**：用户与知识库的访问权限
- **GroupPermission（组权限）**：用户组与知识库的权限
- **SSOConfig（SSO配置）**：DES加密配置参数
- **UserAccessLog（访问日志）**：用户访问记录
- **LoginAuditLog（登录审计）**：登录成功/失败记录
- **UserFavorite（用户收藏）**：知识库收藏关系

## 🎨 界面预览

### 登录页
- 邮箱密码登录
- Google OAuth2登录
- GitHub OAuth2登录
- SSO单点登录（通过URL参数）

### 用户门户
- 知识库卡片展示
- 搜索和筛选功能
- 最近访问快捷入口
- 收藏夹管理

### 管理后台
- 系统概览仪表板
- 知识库管理（CRUD操作）
- SSO配置管理
- 用户和用户组管理
- 访问分析和统计

## 🔧 开发指南

### 后端开发

```bash
cd backend

# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 代码检查
npm run lint

# 生成Prisma客户端
npm run prisma:generate

# 创建新的数据库迁移
npm run prisma:migrate

# 构建生产版本
npm run build

# 启动生产服务
npm start
```

### 前端开发

```bash
cd frontend

# 安装依赖
npm install

# 开发模式
npm run dev

# 代码检查
npm run lint

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 📦 生产部署

### Docker部署

```bash
# 构建并启动
docker-compose -f docker-compose.prod.yml up -d

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止并删除
docker-compose down -v
```

### 手动部署

1. **构建前端**
```bash
cd frontend
npm run build
# 将dist目录部署到Nginx或其他静态服务器
```

2. **构建后端**
```bash
cd backend
npm run build
```

3. **配置PostgreSQL和Redis**（生产环境）

4. **运行数据库迁移**
```bash
npm run prisma:migrate:deploy
```

5. **启动应用**
```bash
NODE_ENV=production npm start
```

### Nginx配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端
    location / {
        root /var/www/fastgpt-platform/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📈 监控指标

系统内置以下监控指标：

- 用户活跃度统计
- 知识库访问频率
- SSO登录成功率
- 系统响应时间
- 错误率统计
- 审计日志记录

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 开源协议

本项目采用 MIT 协议 - 详见 [LICENSE](LICENSE) 文件

## 💬 技术支持

- 提交Issue：[GitHub Issues](https://github.com/your-repo/issues)
- 邮件联系：support@example.com
- 文档：查看 `docs/` 目录

## 🙏 致谢

感谢以下开源项目：

- [Express](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [React](https://react.dev/)
- [Ant Design](https://ant.design/)
- [Passport.js](http://www.passportjs.org/)
