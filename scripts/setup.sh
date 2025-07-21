#!/bin/bash

# 项目设置脚本

echo "🚀 开始设置项目..."

# 检查是否安装了必要的工具
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 创建必要的目录
echo "📁 创建目录..."
mkdir -p server/uploads
mkdir -p logs

# 复制环境变量文件
if [ ! -f server/.env ]; then
    echo "📋 创建环境变量文件..."
    cp server/.env.example server/.env
    echo "⚠️  请编辑 server/.env 文件并设置正确的配置值"
fi

# 启动数据库
echo "🗄️  启动数据库..."
docker-compose up -d postgres

# 等待数据库启动
echo "⏳ 等待数据库启动..."
sleep 10

# 检查数据库连接
echo "🔍 检查数据库连接..."
until docker-compose exec postgres pg_isready -U website_user -d website_db; do
    echo "等待数据库启动..."
    sleep 2
done

echo "✅ 数据库已就绪"

# 运行种子数据
echo "🌱 导入种子数据..."
docker-compose exec postgres psql -U website_user -d website_db -f /docker-entrypoint-initdb.d/seeds/01-initial-data.sql

# 安装服务器依赖
echo "📦 安装服务器依赖..."
cd server
npm install

# 构建服务器
echo "🔨 构建服务器..."
npm run build

echo "✅ 项目设置完成！"
echo ""
echo "📝 下一步："
echo "1. 编辑 server/.env 文件并设置正确的配置值"
echo "2. 运行 'cd server && npm run dev' 启动开发服务器"
echo "3. 在浏览器中访问 http://localhost:3001/health 检查服务器状态"
echo ""
echo "📖 默认管理员账户："
echo "邮箱: admin@example.com"
echo "密码: Admin123"