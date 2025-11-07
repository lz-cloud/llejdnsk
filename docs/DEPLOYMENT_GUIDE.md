# FastGPT第三方平台 - 完整部署指南

本文档提供了FastGPT第三方平台的完整部署指南，包括前端后端连接配置、Docker部署、手动部署和常见问题排查。

## 目录

- [前端后端连接配置](#前端后端连接配置)
- [快速部署（Docker Compose）](#快速部署docker-compose)
- [手动部署](#手动部署)
- [生产环境部署](#生产环境部署)
- [Docker编排修改规范](#docker编排修改规范)
- [常见问题排查](#常见问题排查)
- [维护与监控](#维护与监控)

## 前端后端连接配置

### 架构说明

FastGPT第三方平台采用前后端分离架构：

```
┌─────────────┐      HTTP请求      ┌─────────────┐
│   前端应用   │ ───────────────► │   后端API   │
│  (React)    │ ◄─────────────── │  (Express)  │
│ Port: 3000  │      JSON响应      │ Port: 5000  │
└─────────────┘                   └─────────────┘
                                        │
                                        ├─► PostgreSQL
                                        └─► Redis
```

### 关键配置文件

#### 1. 后端配置（backend/.env）

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
REDIS_PASSWORD=

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

# OAuth2配置（可选）
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

#### 2. 前端配置（frontend/.env）

```env
# API基础地址
VITE_API_URL=http://localhost:5000/api
```

### 配置说明

#### CORS配置（重要）

CORS（跨域资源共享）配置是前后端连接的关键：

```env
# 后端 .env
CORS_ORIGIN=http://localhost:3000

# 多个域名使用逗号分隔
CORS_ORIGIN=http://localhost:3000,https://your-domain.com
```

#### API地址配置

前端需要知道后端API的地址：

```env
# 开发环境
VITE_API_URL=http://localhost:5000/api

# 生产环境
VITE_API_URL=https://your-domain.com/api
```

### 连接检查清单

在启动应用前，请确认以下配置正确：

- [x] **后端 CORS 配置**：`CORS_ORIGIN` 包含前端地址
- [x] **前端 API 地址**：`VITE_API_URL` 指向后端API正确的地址
- [x] **数据库连接**：PostgreSQL服务正常运行且连接信息正确
- [x] **Redis连接**：Redis服务正常运行且连接信息正确
- [x] **端口可用**：确保5000（后端）和3000（前端）端口未被占用
- [x] **环境变量**：所有必需的环境变量都已设置

## 快速部署（Docker Compose）

Docker Compose是最简单快速的部署方式，适合开发和测试环境。

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少2GB可用内存

### 步骤1：克隆项目

```bash
git clone <repository-url>
cd fastgpt-platform
```

### 步骤2：创建配置文件

```bash
# 复制环境变量模板
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 步骤3：修改配置（可选）

如果需要修改默认配置，编辑 `backend/.env` 和 `frontend/.env` 文件。

### 步骤4：启动服务

```bash
# 启动所有服务（后台运行）
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f
```

### 步骤5：初始化数据库

```bash
# 进入后端容器
docker-compose exec backend sh

# 运行数据库迁移
npm run prisma:migrate:deploy

# 退出容器
exit
```

### 步骤6：访问应用

- **前端应用**：http://localhost:3000
- **后端API**：http://localhost:5000
- **API文档**：http://localhost:5000/api-docs
- **健康检查**：http://localhost:5000/health

**默认管理员账号**：
- 邮箱：admin@example.com
- 密码：Admin@123456

### 常用Docker Compose命令

```bash
# 停止服务
docker-compose stop

# 启动服务
docker-compose start

# 重启服务
docker-compose restart

# 重建并启动服务（配置更改后）
docker-compose up -d --build

# 停止并删除容器、网络（保留数据）
docker-compose down

# 完全清理（包括数据卷）
docker-compose down -v

# 查看日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 查看资源使用
docker-compose stats

# 进入容器
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres -d fastgpt_platform
```

## 手动部署

手动部署适合生产环境，可以更灵活地控制各个组件。

### 系统要求

- **操作系统**：Ubuntu 20.04+ / CentOS 8+ / macOS 10.15+
- **Node.js**：18.0+
- **PostgreSQL**：14+
- **Redis**：7+
- **Nginx**：1.18+（可选，推荐）

### 步骤1：安装Node.js

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS
brew install node@18

# 验证安装
node --version
npm --version
```

### 步骤2：安装PostgreSQL

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
CREATE USER postgres WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE fastgpt_platform TO postgres;
\q
```

### 步骤3：安装Redis

```bash
# Ubuntu/Debian
sudo apt-get install -y redis-server

# macOS
brew install redis

# 启动Redis
sudo systemctl start redis  # Linux
brew services start redis  # macOS

# 验证Redis运行
redis-cli ping  # 应返回 PONG
```

### 步骤4：部署后端

```bash
# 克隆项目
git clone <repository-url>
cd fastgpt-platform/backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，修改数据库连接、JWT密钥等

# 生成Prisma客户端
npm run prisma:generate

# 运行数据库迁移
npm run prisma:migrate:deploy

# 构建生产版本
npm run build

# 启动生产服务
NODE_ENV=production npm start
```

### 步骤5：使用PM2管理后端进程（推荐）

PM2是一个进程管理器，可以确保应用持续运行。

```bash
# 安装PM2
npm install -g pm2

# 启动应用
cd backend
pm2 start dist/app.js --name fastgpt-backend

# 设置开机启动
pm2 startup
pm2 save

# 常用PM2命令
pm2 list              # 查看所有进程
pm2 logs              # 查看日志
pm2 restart all       # 重启所有进程
pm2 stop all          # 停止所有进程
pm2 delete all        # 删除所有进程
pm2 monit            # 监控资源使用
```

### 步骤6：部署前端

```bash
cd ../frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置API地址

# 构建生产版本
npm run build

# 将构建文件部署到Web服务器
# 方式1：使用serve（简单测试）
npx serve -s build -l 3000

# 方式2：复制到Nginx目录（推荐）
sudo mkdir -p /var/www/fastgpt-platform
sudo cp -r build/* /var/www/fastgpt-platform/
```

### 步骤7：配置Nginx（推荐）

创建Nginx配置文件：

```bash
sudo nano /etc/nginx/sites-available/fastgpt-platform
```

添加以下配置：

```nginx
# 上游后端服务
upstream backend {
    server localhost:5000;
}

# HTTP服务器配置
server {
    listen 80;
    server_name your-domain.com;

    # 访问日志
    access_log /var/log/nginx/fastgpt-access.log;
    error_log /var/log/nginx/fastgpt-error.log;

    # 客户端请求体大小限制
    client_max_body_size 100M;

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

# 设置开机启动
sudo systemctl enable nginx
```

## 生产环境部署

### SSL证书配置（HTTPS）

使用Let's Encrypt免费SSL证书：

```bash
# 安装Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 获取证书并自动配置Nginx
sudo certbot --nginx -d your-domain.com

# 证书将自动续期，也可以手动测试续期
sudo certbot renew --dry-run
```

### 更新应用配置

更新 `backend/.env`：

```env
NODE_ENV=production
SITE_URL=https://your-domain.com
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com

# 使用强密码
JWT_SECRET=<生成的强密码>
SESSION_SECRET=<生成的强密码>
```

更新 `frontend/.env`：

```env
VITE_API_URL=https://your-domain.com/api
```

### 重新构建和部署

```bash
# 后端
cd backend
npm run build
pm2 restart fastgpt-backend

# 前端
cd ../frontend
npm run build
sudo cp -r build/* /var/www/fastgpt-platform/

# 重启Nginx
sudo systemctl restart nginx
```

### 数据库备份

设置定期备份：

```bash
# 创建备份脚本
cat > /usr/local/bin/backup-fastgpt-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/fastgpt"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# 备份PostgreSQL
pg_dump -U postgres fastgpt_platform | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# 保留最近7天的备份
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: db_backup_$DATE.sql.gz"
EOF

# 添加执行权限
sudo chmod +x /usr/local/bin/backup-fastgpt-db.sh

# 添加到crontab（每天凌晨2点执行）
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-fastgpt-db.sh") | crontab -
```

## Docker编排修改规范

### 1. 环境变量管理

**❌ 错误示例**：
```yaml
environment:
  DATABASE_URL: postgresql://postgres:password123@postgres:5432/db
  JWT_SECRET: my-secret-key
```

**✅ 正确示例**：
```yaml
environment:
  DATABASE_URL: ${DATABASE_URL}
  JWT_SECRET: ${JWT_SECRET}

# 或使用env_file
env_file:
  - .env.production
```

### 2. 服务依赖管理

使用健康检查确保服务按正确顺序启动：

```yaml
services:
  postgres:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

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

始终使用命名卷存储重要数据：

```yaml
services:
  postgres:
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backup:/backup

volumes:
  postgres_data:
    driver: local
```

### 4. 日志管理

配置日志轮转策略：

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        compress: "true"
```

### 5. 资源限制

防止单个服务占用过多资源：

```yaml
services:
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

### 修改Docker Compose的完整流程

1. **备份当前配置**
   ```bash
   cp docker-compose.yml docker-compose.yml.backup
   cp .env .env.backup
   ```

2. **在开发环境测试修改**
   ```bash
   docker-compose config  # 验证语法
   docker-compose up
   ```

3. **验证服务正常运行**
   ```bash
   docker-compose ps
   curl http://localhost:5000/health
   ```

4. **应用到生产环境**
   ```bash
   # 先停止服务
   docker-compose down
   
   # 备份数据
   docker-compose exec postgres pg_dump -U postgres fastgpt_platform > backup.sql
   
   # 重新启动
   docker-compose up -d
   ```

5. **回滚（如果出现问题）**
   ```bash
   docker-compose down
   cp docker-compose.yml.backup docker-compose.yml
   cp .env.backup .env
   docker-compose up -d
   ```

## 常见问题排查

### 问题1：前端无法连接后端（Network Error）

**症状**：
- 浏览器控制台显示 `Network Error` 或 `ERR_CONNECTION_REFUSED`
- API请求失败

**可能原因**：
- 后端服务未启动
- 端口被占用或防火墙阻止
- CORS配置不正确
- API地址配置错误

**解决方案**：

```bash
# 1. 检查后端服务是否运行
curl http://localhost:5000/health

# 2. 检查端口占用
lsof -i :5000
netstat -an | grep 5000

# 3. 检查后端日志中的CORS错误
docker-compose logs backend | grep CORS

# 4. 验证环境变量
# 后端
cat backend/.env | grep CORS_ORIGIN
# 前端
cat frontend/.env | grep VITE_API_URL

# 5. 检查防火墙
sudo ufw status
sudo ufw allow 5000
```

### 问题2：401 Unauthorized错误

**症状**：
- 登录后仍然显示未授权
- API请求返回401错误

**可能原因**：
- JWT Token过期或无效
- Token未正确存储或发送
- 认证中间件配置问题

**解决方案**：

```javascript
// 在浏览器控制台执行
// 1. 清除过期Token
localStorage.removeItem('authToken');

// 2. 检查Token是否存在
console.log(localStorage.getItem('authToken'));

// 3. 检查Token格式
const token = localStorage.getItem('authToken');
console.log(atob(token.split('.')[1])); // 解码JWT payload
```

### 问题3：数据库连接失败

**症状**：
- 后端启动失败
- 日志显示数据库连接错误

**解决方案**：

```bash
# 1. 检查PostgreSQL服务状态
sudo systemctl status postgresql

# 2. 测试数据库连接
psql -U postgres -d fastgpt_platform -h localhost -p 5432

# 3. 检查数据库URL配置
cat backend/.env | grep DATABASE_URL

# 4. Docker环境检查网络
docker-compose exec backend sh
ping postgres
```

### 问题4：Redis连接失败

**症状**：
- 后端启动缓慢或失败
- 日志显示Redis连接超时

**解决方案**：

```bash
# 1. 检查Redis服务状态
sudo systemctl status redis

# 2. 测试Redis连接
redis-cli ping

# 3. 检查Redis配置
cat backend/.env | grep REDIS

# 4. Docker环境检查
docker-compose exec backend sh
redis-cli -h redis ping
```

### 问题5：Docker容器无法启动

**症状**：
- `docker-compose up` 失败
- 容器频繁重启

**解决方案**：

```bash
# 1. 查看详细日志
docker-compose logs -f

# 2. 检查容器状态
docker-compose ps

# 3. 检查健康检查
docker-compose exec backend curl -f http://localhost:5000/health

# 4. 验证docker-compose.yml语法
docker-compose config

# 5. 清理并重新构建
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## 维护与监控

### 日志管理

```bash
# Docker环境
docker-compose logs -f --tail=100 backend
docker-compose logs -f --tail=100 frontend

# PM2环境
pm2 logs fastgpt-backend
pm2 logs --lines 100

# Nginx日志
sudo tail -f /var/log/nginx/fastgpt-access.log
sudo tail -f /var/log/nginx/fastgpt-error.log
```

### 性能监控

```bash
# Docker资源使用
docker stats

# PM2监控
pm2 monit

# 数据库性能
psql -U postgres -d fastgpt_platform
SELECT * FROM pg_stat_activity;

# Redis监控
redis-cli info
redis-cli --stat
```

### 更新应用

```bash
# Docker环境
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 手动部署环境
git pull
cd backend
npm install
npm run build
pm2 restart fastgpt-backend

cd ../frontend
npm install
npm run build
sudo cp -r build/* /var/www/fastgpt-platform/
sudo systemctl restart nginx
```

### 健康检查

创建健康检查脚本：

```bash
cat > /usr/local/bin/check-fastgpt-health.sh << 'EOF'
#!/bin/bash

# 检查后端健康
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✓ Backend: OK"
else
    echo "✗ Backend: FAILED"
    # 可以添加告警通知
fi

# 检查PostgreSQL
if pg_isready -U postgres > /dev/null 2>&1; then
    echo "✓ PostgreSQL: OK"
else
    echo "✗ PostgreSQL: FAILED"
fi

# 检查Redis
if redis-cli ping > /dev/null 2>&1; then
    echo "✓ Redis: OK"
else
    echo "✗ Redis: FAILED"
fi
EOF

chmod +x /usr/local/bin/check-fastgpt-health.sh

# 添加到crontab（每5分钟检查一次）
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/check-fastgpt-health.sh") | crontab -
```

## 生产环境检查清单

部署到生产环境前，请确认：

- [ ] 所有敏感信息使用环境变量
- [ ] JWT_SECRET 和 SESSION_SECRET 已修改为强密码
- [ ] 数据库密码已修改
- [ ] CORS_ORIGIN 配置正确
- [ ] SSL证书已配置（HTTPS）
- [ ] 健康检查已配置
- [ ] 日志轮转已启用
- [ ] 资源限制已设置
- [ ] 数据卷已配置持久化
- [ ] 备份策略已实施
- [ ] 监控告警已配置
- [ ] 防火墙规则已配置
- [ ] 定期更新策略已制定

## 支持与联系

如果遇到问题，请：

1. 查看本文档的常见问题排查部分
2. 查看项目的GitHub Issues
3. 联系技术支持团队

---

**最后更新时间**：2024-01
