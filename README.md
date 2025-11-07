# FastGPT 第三方平台

一个功能完整的知识库管理平台，支持OAuth2和自定义SSO单点登录，专为FastGPT集成设计。

## 📖 快速导航

- [核心功能](#-核心功能)
- [快速开始](#-快速开始) - **首次使用从这里开始**
- [前端后端连接配置](#-前端后端连接配置) - **修复连接问题**
- [部署指南](#-部署指南) - **生产环境部署**
- [API文档](#-api文档)
- [常见问题](#常见连接问题排查) - **故障排除**

📄 **详细文档**：
- [完整部署指南](docs/DEPLOYMENT_GUIDE.md) - Docker、手动部署、生产环境配置
- [快速故障排查](docs/QUICK_TROUBLESHOOTING.md) - 常见问题快速解决方案
- [SSO配置示例](docs/EXAMPLES.md) - SSO集成实例

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

#### 步骤1：创建环境配置

```bash
# 复制环境变量模板
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

#### 步骤2：启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 初始化数据库
docker-compose exec backend npm run prisma:migrate:deploy

# 停止服务
docker-compose down
```

#### 步骤3：访问应用

服务地址：
- **前端应用**：http://localhost:3000
- **后端API**：http://localhost:5000
- **API文档**：http://localhost:5000/api-docs
- **健康检查**：http://localhost:5000/health

默认管理员账号：
- 邮箱：admin@example.com
- 密码：Admin@123456

> ⚠️ **重要提示**：
> - 首次启动前必须创建 `.env` 配置文件
> - 生产环境务必修改 `JWT_SECRET` 和 `SESSION_SECRET`
> - 确保 `CORS_ORIGIN` 配置正确，否则前端无法连接后端
>
> 📖 详细部署指南请查看：[完整部署文档](docs/DEPLOYMENT_GUIDE.md)

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
  "isActive": true              // 是否启用（可通过开关快速切换）
}
```

#### SSO启用/禁用功能

管理员可以在SSO配置管理页面通过开关按钮快速启用或禁用SSO配置：
- **启用**：用户可以使用该配置进行单点登录
- **禁用**：阻止新的SSO登录请求，但不影响已登录用户
- **配置保留**：禁用后所有配置信息都会保留，可随时重新启用

使用场景：
- 临时维护：SSO提供商维护期间临时禁用
- 安全响应：发现安全问题时立即禁用
- 环境切换：测试和生产环境配置切换
- 逐步迁移：新旧SSO系统平滑过渡

详细说明请参考：[SSO启用/禁用功能文档](docs/sso-toggle-feature.md)

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
- `GET /api/admin/sso-configs/:id` - 获取单个SSO配置
- `POST /api/admin/sso-configs` - 创建/更新SSO配置
- `PATCH /api/admin/sso-configs/:id` - 启用/禁用SSO配置
- `DELETE /api/admin/sso-configs/:id` - 删除SSO配置
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

## 🔧 前端后端连接配置

### 开发环境配置

项目采用前后端分离架构，需要正确配置API连接以确保前端可以访问后端服务。

#### 后端配置（backend/.env）

```env
# 服务器配置
NODE_ENV=development
PORT=5000
API_PREFIX=/api

# 数据库连接
DATABASE_URL="postgresql://postgres:password@localhost:5432/fastgpt_platform?schema=public"

# Redis连接
REDIS_HOST=localhost
REDIS_PORT=6379

# CORS配置 - 允许前端域名访问
CORS_ORIGIN=http://localhost:3000

# 后端服务地址（无末尾斜杠）
SITE_URL=http://localhost:5000

# 前端应用地址
FRONTEND_URL=http://localhost:3000

# JWT密钥（生产环境务必修改）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Session密钥（生产环境务必修改）
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# 管理员初始账号
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123456
```

#### 前端配置（frontend/.env）

```env
# API基础地址
VITE_API_URL=http://localhost:5000/api
```

### 连接检查清单

在启动应用前，请确认以下配置正确：

1. ✅ **后端 CORS 配置**：`CORS_ORIGIN` 包含前端地址
2. ✅ **前端 API 地址**：`VITE_API_URL` 指向后端API正确的地址
3. ✅ **数据库连接**：PostgreSQL服务正常运行且连接信息正确
4. ✅ **Redis连接**：Redis服务正常运行且连接信息正确
5. ✅ **端口可用**：确保5000（后端）和3000（前端）端口未被占用

### Docker环境配置

使用Docker Compose时，容器间通过服务名通信，但前端访问后端需要使用宿主机地址：

```yaml
# docker-compose.yml 关键配置
backend:
  environment:
    CORS_ORIGIN: http://localhost:3000
    SITE_URL: http://localhost:5000
    FRONTEND_URL: http://localhost:3000

frontend:
  environment:
    # 浏览器访问使用宿主机地址
    VITE_API_URL: http://localhost:5000/api
```

### 常见连接问题排查

#### 问题1：前端无法连接后端（Network Error）

**可能原因：**
- 后端服务未启动
- 端口被占用或防火墙阻止
- CORS配置不正确

**解决方案：**
```bash
# 1. 检查后端服务是否运行
curl http://localhost:5000/health

# 2. 检查端口占用
lsof -i :5000
netstat -an | grep 5000

# 3. 检查后端日志中的CORS错误
docker-compose logs backend | grep CORS
```

#### 问题2：401 Unauthorized错误

**可能原因：**
- JWT Token过期或无效
- 认证中间件配置问题

**解决方案：**
```javascript
// 清除浏览器中的过期Token
localStorage.removeItem('authToken');
// 然后重新登录
```

#### 问题3：Docker容器间连接失败

**可能原因：**
- 容器网络配置问题
- 使用了错误的主机名

**解决方案：**
```bash
# 检查容器网络
docker network ls
docker network inspect <network_name>

# 确保所有服务在同一网络中
docker-compose ps
```

## 📦 部署指南

### 方式一：Docker Compose 部署（推荐）

Docker Compose是最简单快速的部署方式，适合开发和测试环境。

#### 步骤1：环境准备

```bash
# 克隆项目
git clone <repository-url>
cd fastgpt-platform

# 创建必要的配置文件（如果不存在）
# 后端配置
cp backend/.env.example backend/.env
# 前端配置
cp frontend/.env.example frontend/.env
```

#### 步骤2：配置环境变量

编辑 `backend/.env` 和 `frontend/.env`，根据实际情况修改配置。

**重要配置项：**
- `DATABASE_URL`: PostgreSQL连接字符串
- `JWT_SECRET`: JWT密钥（必须修改）
- `SESSION_SECRET`: Session密钥（必须修改）
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`: 管理员账号
- `CORS_ORIGIN`: 前端域名
- `VITE_API_URL`: 后端API地址

#### 步骤3：启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

#### 步骤4：初始化数据库

```bash
# 进入后端容器
docker-compose exec backend sh

# 运行数据库迁移
npm run prisma:migrate:deploy

# 退出容器
exit
```

#### 步骤5：访问应用

- 前端应用：http://localhost:3000
- 后端API：http://localhost:5000
- API文档：http://localhost:5000/api-docs
- 健康检查：http://localhost:5000/health

默认管理员账号：
- 邮箱：admin@example.com
- 密码：Admin@123456

#### 维护命令

```bash
# 停止服务
docker-compose stop

# 启动服务
docker-compose start

# 重启服务
docker-compose restart

# 重建并启动服务（配置更改后）
docker-compose up -d --build

# 停止并删除容器、网络（保留数据卷）
docker-compose down

# 完全清理（包括数据卷）
docker-compose down -v

# 查看资源使用
docker-compose stats
```

### 方式二：手动部署

手动部署适合生产环境，可以更灵活地控制各个组件。

#### 步骤1：环境准备

**系统要求：**
- Ubuntu 20.04+ / CentOS 8+ / macOS 10.15+
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Nginx（可选，用于反向代理）

#### 步骤2：安装依赖服务

**PostgreSQL:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# macOS
brew install postgresql@14

# 启动PostgreSQL
sudo systemctl start postgresql  # Linux
brew services start postgresql@14  # macOS

# 创建数据库
sudo -u postgres psql
CREATE DATABASE fastgpt_platform;
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE fastgpt_platform TO postgres;
\q
```

**Redis:**
```bash
# Ubuntu/Debian
sudo apt-get install -y redis-server

# macOS
brew install redis

# 启动Redis
sudo systemctl start redis  # Linux
brew services start redis  # macOS
```

#### 步骤3：部署后端

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，修改数据库连接等配置

# 生成Prisma客户端
npm run prisma:generate

# 运行数据库迁移
npm run prisma:migrate:deploy

# 构建生产版本
npm run build

# 启动生产服务
NODE_ENV=production npm start

# 或使用 PM2 管理进程（推荐）
npm install -g pm2
pm2 start dist/app.js --name fastgpt-backend
pm2 save
pm2 startup  # 设置开机启动
```

#### 步骤4：部署前端

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置API地址

# 构建生产版本
npm run build

# 将 build 目录部署到 Web 服务器
# 方式1：使用serve（简单测试）
npx serve -s build -l 3000

# 方式2：复制到Nginx目录（推荐）
sudo cp -r build/* /var/www/fastgpt-platform/
```

#### 步骤5：配置 Nginx（推荐）

创建 Nginx 配置文件：

```bash
sudo nano /etc/nginx/sites-available/fastgpt-platform
```

添加以下配置：

```nginx
# /etc/nginx/sites-available/fastgpt-platform

# 上游后端服务
upstream backend {
    server localhost:5000;
}

# HTTP服务器配置
server {
    listen 80;
    server_name your-domain.com;  # 修改为你的域名

    # 访问日志
    access_log /var/log/nginx/fastgpt-access.log;
    error_log /var/log/nginx/fastgpt-error.log;

    # 前端静态文件
    location / {
        root /var/www/fastgpt-platform;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # 缓存配置
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 后端API代理
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        
        # WebSocket支持
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # 请求头设置
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # API文档
    location /api-docs {
        proxy_pass http://backend;
        proxy_set_header Host $host;
    }

    # 健康检查
    location /health {
        proxy_pass http://backend;
        access_log off;
    }
}
```

启用配置并重启Nginx：

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/fastgpt-platform /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 方式三：生产环境部署（带 SSL）

#### 步骤1：获取SSL证书

使用 Let's Encrypt 免费SSL证书：

```bash
# 安装 Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 获取证书并自动配置Nginx
sudo certbot --nginx -d your-domain.com

# 证书将自动续期，也可以手动测试续期
sudo certbot renew --dry-run
```

#### 步骤2：更新 Nginx 配置

Certbot会自动更新配置，但你也可以手动调整：

```nginx
# HTTPS服务器配置
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # 其他配置同上...
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

#### 步骤3：更新应用配置

更新 `backend/.env`：

```env
NODE_ENV=production
SITE_URL=https://your-domain.com
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```

更新 `frontend/.env`：

```env
VITE_API_URL=https://your-domain.com/api
```

#### 步骤4：重新构建和部署

```bash
# 后端
cd backend
npm run build
pm2 restart fastgpt-backend

# 前端
cd frontend
npm run build
sudo cp -r build/* /var/www/fastgpt-platform/

# 重启Nginx
sudo systemctl restart nginx
```

### Docker Compose 生产环境配置

创建 `docker-compose.prod.yml`:

```yaml
services:
  postgres:
    image: postgres:14
    restart: always
    environment:
      POSTGRES_DB: fastgpt_platform
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}  # 使用环境变量
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backup:/backup  # 数据备份目录
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    restart: always
    env_file:
      - ./backend/.env.production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    restart: always
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - nginx_logs:/var/log/nginx
    depends_on:
      - backend
      - frontend

volumes:
  postgres_data:
  redis_data:
  nginx_logs:
```

使用生产配置启动：

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 Docker编排修改规范

在修改 Docker Compose 配置时，请遵循以下规范：

### 1. 环境变量管理

**不要在 docker-compose.yml 中硬编码敏感信息：**

❌ 错误示例：
```yaml
environment:
  DATABASE_URL: postgresql://postgres:password123@postgres:5432/db
```

✅ 正确示例：
```yaml
environment:
  DATABASE_URL: ${DATABASE_URL}
```

或使用 `env_file`:
```yaml
env_file:
  - .env.production
```

### 2. 服务依赖管理

使用 `depends_on` 和健康检查确保服务按正确顺序启动：

```yaml
backend:
  depends_on:
    postgres:
      condition: service_healthy
    redis:
      condition: service_healthy
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

### 3. 数据持久化

**始终使用命名卷（named volumes）存储重要数据：**

```yaml
services:
  postgres:
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backup:/backup  # 备份目录

volumes:
  postgres_data:
    driver: local
```

### 4. 网络配置

**为生产环境创建自定义网络：**

```yaml
services:
  backend:
    networks:
      - app-network
      - db-network

  postgres:
    networks:
      - db-network

networks:
  app-network:
    driver: bridge
  db-network:
    driver: bridge
    internal: true  # 数据库网络不对外
```

### 5. 资源限制

**设置合理的资源限制防止单个服务占用过多资源：**

```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '1.0'
        memory: 1G
      reservations:
        cpus: '0.5'
        memory: 512M
```

### 6. 日志管理

**配置日志驱动和轮转策略：**

```yaml
backend:
  logging:
    driver: "json-file"
    options:
      max-size: "10m"
      max-file: "3"
      labels: "backend"
```

### 7. 重启策略

**生产环境使用 `always` 或 `unless-stopped`：**

```yaml
services:
  backend:
    restart: always  # 生产环境
    # restart: unless-stopped  # 也可以
```

开发环境可以使用：
```yaml
services:
  backend:
    restart: on-failure
```

### 8. 端口映射

**生产环境不暴露不必要的端口：**

❌ 开发环境（全部暴露）：
```yaml
services:
  postgres:
    ports:
      - "5432:5432"  # 暴露给宿主机
```

✅ 生产环境（通过网络通信）：
```yaml
services:
  postgres:
    expose:
      - "5432"  # 仅容器间可访问
```

### 9. 环境区分

**使用不同的compose文件区分环境：**

```
docker-compose.yml           # 基础配置
docker-compose.dev.yml       # 开发环境覆盖
docker-compose.prod.yml      # 生产环境覆盖
```

使用方式：
```bash
# 开发环境
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# 生产环境
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 10. 配置文件版本控制

**不同环境使用不同的配置文件：**

```
.env.example           # 模板文件（提交到Git）
.env                   # 本地开发配置（不提交）
.env.development       # 开发环境（不提交）
.env.production        # 生产环境（不提交）
```

`.gitignore` 配置：
```
.env
.env.local
.env.*.local
.env.development
.env.production
```

### 修改 Docker Compose 的完整流程

1. **备份当前配置**
   ```bash
   cp docker-compose.yml docker-compose.yml.backup
   ```

2. **在开发环境测试修改**
   ```bash
   docker-compose -f docker-compose.dev.yml config  # 验证语法
   docker-compose -f docker-compose.dev.yml up
   ```

3. **验证服务正常运行**
   ```bash
   docker-compose ps
   docker-compose logs
   curl http://localhost:5000/health
   ```

4. **应用到生产环境**
   ```bash
   # 先停止服务
   docker-compose -f docker-compose.prod.yml down
   
   # 备份数据
   docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres fastgpt_platform > backup.sql
   
   # 重新启动
   docker-compose -f docker-compose.prod.yml up -d
   
   # 验证
   docker-compose -f docker-compose.prod.yml ps
   ```

5. **回滚（如果出现问题）**
   ```bash
   docker-compose down
   cp docker-compose.yml.backup docker-compose.yml
   docker-compose up -d
   ```

### 生产环境配置检查清单

部署到生产环境前，请确认：

- [ ] 所有敏感信息使用环境变量
- [ ] JWT_SECRET 和 SESSION_SECRET 已修改为强密码
- [ ] 数据库密码已修改
- [ ] CORS_ORIGIN 配置正确
- [ ] 健康检查已配置
- [ ] 日志轮转已启用
- [ ] 资源限制已设置
- [ ] 数据卷已配置持久化
- [ ] 备份策略已实施
- [ ] 监控告警已配置
- [ ] SSL证书已配置（如果使用HTTPS）
- [ ] 防火墙规则已配置

## 📦 生产部署（原有内容）

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
