# 快速故障排查指南

本文档列出了FastGPT第三方平台常见问题的快速解决方案。

## 🔧 前端无法连接到后端

### 症状
- 浏览器控制台显示 `Network Error`
- API请求全部失败
- 登录按钮点击无响应

### 快速检查清单

#### 1. 检查后端是否运行

```bash
# 检查健康端点
curl http://localhost:5000/health

# 应返回: {"status":"ok","timestamp":"..."}
```

如果无响应，检查后端服务：

```bash
# Docker环境
docker-compose ps
docker-compose logs backend

# 手动部署
pm2 status
pm2 logs fastgpt-backend
```

#### 2. 检查环境变量配置

**后端配置检查 (backend/.env)**：

```bash
# 检查是否存在配置文件
ls -la backend/.env

# 如果不存在，创建它
cp backend/.env.example backend/.env
```

**前端配置检查 (frontend/.env)**：

```bash
# 检查是否存在配置文件
ls -la frontend/.env

# 如果不存在，创建它
cp frontend/.env.example frontend/.env
```

#### 3. 检查CORS配置

**后端 `backend/.env` 必须包含前端地址**：

```env
CORS_ORIGIN=http://localhost:3000
```

验证：

```bash
cat backend/.env | grep CORS_ORIGIN
```

#### 4. 检查API地址配置

**前端 `frontend/.env` 必须指向正确的后端地址**：

```env
VITE_API_URL=http://localhost:5000/api
```

验证：

```bash
cat frontend/.env | grep VITE_API_URL
```

#### 5. 检查端口占用

```bash
# 检查5000端口（后端）
lsof -i :5000
netstat -an | grep 5000

# 检查3000端口（前端）
lsof -i :3000
netstat -an | grep 3000
```

如果端口被占用，可以：
- 停止占用端口的进程
- 或在 `.env` 中修改端口号

### 完整修复步骤

```bash
# 1. 停止所有服务
docker-compose down

# 2. 确保配置文件存在
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. 验证配置
cat backend/.env | grep -E "CORS_ORIGIN|PORT"
cat frontend/.env | grep VITE_API_URL

# 4. 清理并重新启动
docker-compose down -v
docker-compose up -d --build

# 5. 查看日志确认启动成功
docker-compose logs -f

# 6. 测试连接
curl http://localhost:5000/health
```

### 浏览器控制台调试

在浏览器控制台执行以下命令：

```javascript
// 检查API基础地址
console.log('API URL:', import.meta.env.VITE_API_URL);

// 测试API连接
fetch('http://localhost:5000/health')
  .then(res => res.json())
  .then(data => console.log('Backend health:', data))
  .catch(err => console.error('Connection failed:', err));
```

## 🔑 登录失败或401错误

### 症状
- 登录后立即跳转回登录页
- API请求返回401 Unauthorized
- Token无效提示

### 快速修复

#### 1. 清除浏览器存储

```javascript
// 在浏览器控制台执行
localStorage.clear();
sessionStorage.clear();
```

然后刷新页面重新登录。

#### 2. 检查JWT配置

确保后端 `backend/.env` 中JWT密钥已设置：

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

#### 3. 检查管理员账号

```bash
# Docker环境
docker-compose exec backend npm run prisma:studio

# 手动部署
cd backend
npm run prisma:studio
```

在Prisma Studio中检查是否存在管理员用户：
- Email: admin@example.com
- Role: ADMIN

#### 4. 重置管理员密码

```bash
# 进入后端目录
cd backend

# 使用Node.js重置密码
node -e "
const bcrypt = require('bcryptjs');
const password = 'Admin@123456';
bcrypt.hash(password, 10).then(hash => {
  console.log('New password hash:', hash);
  console.log('Use this in Prisma Studio to update the admin password');
});
"
```

## 🗄️ 数据库连接失败

### 症状
- 后端启动失败
- 日志显示 `Can't reach database server`
- Prisma连接错误

### 快速修复

#### 1. 检查PostgreSQL服务

```bash
# Docker环境
docker-compose ps postgres
docker-compose logs postgres

# 手动部署
sudo systemctl status postgresql

# 测试连接
psql -U postgres -d fastgpt_platform -h localhost -p 5432
```

#### 2. 检查数据库URL配置

```bash
# 查看配置
cat backend/.env | grep DATABASE_URL

# 正确格式
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

#### 3. Docker环境数据库连接

Docker环境中，使用服务名而不是localhost：

```env
# backend/.env (Docker环境)
DATABASE_URL="postgresql://postgres:password@postgres:5432/fastgpt_platform?schema=public"
```

#### 4. 运行数据库迁移

```bash
# Docker环境
docker-compose exec backend npm run prisma:migrate:deploy

# 手动部署
cd backend
npm run prisma:migrate:deploy
```

#### 5. 重建数据库（警告：会丢失所有数据）

```bash
# Docker环境
docker-compose down -v
docker-compose up -d postgres
docker-compose exec backend npm run prisma:migrate:deploy

# 手动部署
sudo -u postgres psql
DROP DATABASE fastgpt_platform;
CREATE DATABASE fastgpt_platform;
\q

cd backend
npm run prisma:migrate:deploy
```

## 📦 Docker容器问题

### 症状
- 容器无法启动
- 容器频繁重启
- docker-compose up 失败

### 快速修复

#### 1. 完全清理并重建

```bash
# 停止所有容器
docker-compose down -v

# 清理Docker缓存
docker system prune -a --volumes

# 重新构建
docker-compose build --no-cache

# 启动
docker-compose up -d
```

#### 2. 检查Docker日志

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务
docker-compose logs backend
docker-compose logs postgres
docker-compose logs redis

# 持续查看日志
docker-compose logs -f --tail=100
```

#### 3. 检查容器健康状态

```bash
# 查看容器状态
docker-compose ps

# 进入容器调试
docker-compose exec backend sh
docker-compose exec postgres sh
```

#### 4. 验证docker-compose.yml

```bash
# 验证配置文件语法
docker-compose config

# 检查环境变量
docker-compose config | grep -E "CORS|API|DATABASE"
```

## 🌐 网络和CORS问题

### 症状
- 浏览器显示CORS错误
- 跨域请求被阻止
- OPTIONS请求失败

### 快速修复

#### 1. 检查浏览器控制台

查找类似以下的错误：
```
Access to XMLHttpRequest at 'http://localhost:5000/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

#### 2. 更新CORS配置

**backend/.env**：

```env
# 单个域名
CORS_ORIGIN=http://localhost:3000

# 多个域名（用逗号分隔）
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,https://your-domain.com
```

#### 3. 重启后端服务

```bash
# Docker
docker-compose restart backend

# PM2
pm2 restart fastgpt-backend
```

#### 4. 测试CORS

```bash
# 测试OPTIONS请求
curl -X OPTIONS http://localhost:5000/api/auth/profile \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

## 🔄 热重载不工作

### 症状
- 修改代码后页面不更新
- 需要手动刷新浏览器

### 快速修复

#### 1. 前端热重载

```bash
# 停止并重启前端开发服务器
docker-compose restart frontend

# 或清理node_modules
cd frontend
rm -rf node_modules .vite
npm install
npm run dev
```

#### 2. 后端热重载

```bash
# 停止并重启后端开发服务器
docker-compose restart backend

# 检查是否使用了nodemon
cd backend
npm run dev  # 应该使用nodemon或ts-node-dev
```

## 📊 性能问题

### 症状
- 页面加载缓慢
- API响应时间长
- 数据库查询慢

### 快速诊断

#### 1. 检查资源使用

```bash
# Docker环境
docker stats

# 查看特定容器
docker stats <container_name>
```

#### 2. 检查数据库性能

```bash
# 进入PostgreSQL
docker-compose exec postgres psql -U postgres -d fastgpt_platform

# 查看活动连接
SELECT * FROM pg_stat_activity;

# 查看慢查询
SELECT query, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

#### 3. 增加资源限制

编辑 `docker-compose.yml`：

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
```

## 🔍 日志和调试

### 查看日志

```bash
# Docker - 所有服务
docker-compose logs -f

# Docker - 特定服务
docker-compose logs -f backend
docker-compose logs -f frontend

# PM2
pm2 logs fastgpt-backend

# Nginx
sudo tail -f /var/log/nginx/fastgpt-error.log
sudo tail -f /var/log/nginx/fastgpt-access.log
```

### 启用调试模式

**后端调试**：

```env
# backend/.env
NODE_ENV=development
DEBUG=*
LOG_LEVEL=debug
```

**前端调试**：

在浏览器控制台：

```javascript
// 启用详细日志
localStorage.setItem('debug', '*');
```

## 🆘 仍然无法解决？

如果以上方法都无法解决问题：

1. **收集诊断信息**：

```bash
# 生成诊断报告
cat > diagnostic-report.txt << EOF
=== System Info ===
$(uname -a)
$(docker --version)
$(docker-compose --version)
$(node --version)

=== Service Status ===
$(docker-compose ps)

=== Backend Logs ===
$(docker-compose logs --tail=50 backend)

=== Frontend Logs ===
$(docker-compose logs --tail=50 frontend)

=== Environment Variables ===
$(cat backend/.env | grep -v SECRET | grep -v PASSWORD)
$(cat frontend/.env)

=== Network Test ===
$(curl -I http://localhost:5000/health)
EOF

cat diagnostic-report.txt
```

2. **查看完整部署文档**：[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

3. **提交Issue**：附上诊断报告和详细的错误信息

4. **社区支持**：
   - GitHub Issues: https://github.com/your-repo/issues
   - 技术支持邮箱: support@example.com

## 📚 相关文档

- [完整部署指南](./DEPLOYMENT_GUIDE.md)
- [API文档](../README.md#-api文档)
- [Docker编排规范](./DEPLOYMENT_GUIDE.md#docker编排修改规范)
- [SSO配置说明](./EXAMPLES.md)

---

**最后更新时间**：2024-01
