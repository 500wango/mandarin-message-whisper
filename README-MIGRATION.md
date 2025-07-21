# 从 Supabase 迁移到本地 PostgreSQL

本文档描述了如何将现有的 Supabase 项目迁移到本地 PostgreSQL 数据库。

## 项目结构

```
your-project/
├── client/                 # 前端 React 应用
├── server/                 # 后端 Node.js 服务
├── database/              # 数据库脚本和迁移
├── scripts/               # 部署和维护脚本
└── docker-compose.yml     # 本地开发环境
```

## 快速开始

### 1. 环境要求

- Node.js 18+
- Docker 和 Docker Compose
- PostgreSQL 15+ (可选，如果不使用 Docker)

### 2. 项目设置

```bash
# 1. 克隆项目
git clone <your-repo>
cd your-project

# 2. 运行设置脚本
chmod +x scripts/setup.sh
./scripts/setup.sh

# 3. 配置环境变量
cp server/.env.example server/.env
# 编辑 server/.env 文件

# 4. 启动服务
cd server
npm run dev
```

### 3. 数据库设置

#### 使用 Docker（推荐）

```bash
# 启动 PostgreSQL 容器
docker-compose up -d postgres

# 查看数据库日志
docker-compose logs -f postgres
```

#### 手动安装 PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# 创建数据库和用户
sudo -u postgres psql
CREATE DATABASE website_db;
CREATE USER website_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE website_db TO website_user;

# 导入架构
psql -U website_user -d website_db -f database/schema.sql

# 导入种子数据
psql -U website_user -d website_db -f database/seeds/01-initial-data.sql
```

## 主要变更

### 1. 认证系统

**原来 (Supabase Auth):**
```typescript
import { supabase } from '@/integrations/supabase/client';
const { data, error } = await supabase.auth.signUp({
  email,
  password
});
```

**现在 (JWT Auth):**
```typescript
import { apiClient } from '@/lib/api';
const { user, token } = await apiClient.register(email, password, displayName);
```

### 2. 数据查询

**原来 (Supabase):**
```typescript
const { data, error } = await supabase
  .from('articles')
  .select('*')
  .eq('status', 'published');
```

**现在 (REST API):**
```typescript
const articles = await apiClient.getArticles({ status: 'published' });
```

### 3. 文件上传

**原来 (Supabase Storage):**
```typescript
const { data, error } = await supabase.storage
  .from('media')
  .upload(fileName, file);
```

**现在 (本地存储):**
```typescript
const formData = new FormData();
formData.append('file', file);
const { url } = await apiClient.uploadFile(formData);
```

## API 接口

### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `PUT /api/auth/profile` - 更新用户资料
- `PUT /api/auth/password` - 修改密码

### 文章接口

- `GET /api/articles` - 获取文章列表
- `GET /api/articles/:id` - 获取单篇文章
- `POST /api/articles` - 创建文章
- `PUT /api/articles/:id` - 更新文章
- `DELETE /api/articles/:id` - 删除文章

### 分类接口

- `GET /api/categories` - 获取分类列表
- `POST /api/categories` - 创建分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

## 环境变量

### 服务器环境变量 (.env)

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=website_db
DB_USER=website_user
DB_PASSWORD=your_secure_password

# JWT 配置
JWT_SECRET=your_jwt_secret_key_here

# 服务器配置
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# 文件上传配置
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

## 生产部署

### 1. 服务器要求

- Ubuntu 20.04+ 或 CentOS 8+
- Node.js 18+
- PostgreSQL 15+
- Nginx
- PM2 (可选)

### 2. 部署步骤

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. 安装 PostgreSQL
sudo apt install postgresql postgresql-contrib

# 4. 安装 Nginx
sudo apt install nginx

# 5. 配置防火墙
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# 6. 部署应用
git clone <your-repo>
cd your-project

# 配置环境变量
cp server/.env.example server/.env
# 编辑生产环境配置

# 安装依赖并构建
cd server
npm install --production
npm run build

# 使用 PM2 管理进程
npm install -g pm2
pm2 start dist/index.js --name "website-api"
pm2 startup
pm2 save
```

### 3. Nginx 配置

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /uploads {
        alias /path/to/your/project/server/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location / {
        root /path/to/your/project/client/dist;
        try_files $uri $uri/ /index.html;
        expires 1h;
    }
}
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 .env 文件中的数据库配置
   - 确认 PostgreSQL 服务正在运行
   - 检查防火墙设置

2. **JWT 令牌无效**
   - 确认 JWT_SECRET 已正确设置
   - 检查令牌是否已过期
   - 验证请求头格式

3. **文件上传失败**
   - 检查 uploads 目录权限
   - 确认文件大小限制
   - 验证文件类型限制

### 日志查看

```bash
# 服务器日志
pm2 logs website-api

# 数据库日志
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 维护

### 备份数据库

```bash
# 创建备份
pg_dump -U website_user -d website_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复备份
psql -U website_user -d website_db < backup_file.sql
```

### 更新应用

```bash
# 拉取最新代码
git pull origin main

# 重新构建
cd server
npm install
npm run build

# 重启服务
pm2 restart website-api
```

## 性能优化

1. **数据库索引**: 已在 schema.sql 中预设了必要索引
2. **缓存策略**: 可以添加 Redis 缓存
3. **CDN**: 使用 CDN 加速静态资源
4. **负载均衡**: 使用多个应用实例进行负载均衡

## 安全建议

1. **定期更新**: 保持系统和依赖包更新
2. **防火墙**: 配置合适的防火墙规则
3. **SSL证书**: 使用 Let's Encrypt 配置 HTTPS
4. **密码策略**: 强制使用强密码
5. **备份**: 定期备份数据库和文件