import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

// 导入路由
import authRoutes from './routes/auth';
// import articlesRoutes from './routes/articles';
// import categoriesRoutes from './routes/categories';
// import mediaRoutes from './routes/media';

// 导入数据库连接
import pool from './lib/database';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 安全中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS配置
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// 解析JSON请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务（用于文件上传）
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API路由
app.use('/api/auth', authRoutes);
// app.use('/api/articles', articlesRoutes);
// app.use('/api/categories', categoriesRoutes);
// app.use('/api/media', mediaRoutes);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在'
  });
});

// 全局错误处理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message
  });
});

// 启动服务器
app.listen(PORT, async () => {
  try {
    // 测试数据库连接
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
});

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});