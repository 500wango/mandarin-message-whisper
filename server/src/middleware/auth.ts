import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload, AuthenticatedRequest } from '../types';
import { createErrorResponse } from '../lib/utils';
import pool from '../lib/database';

/**
 * 验证JWT令牌中间件
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json(createErrorResponse('访问令牌缺失'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    // 验证用户是否仍然存在
    const userResult = await pool.query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json(createErrorResponse('用户不存在'));
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json(createErrorResponse('令牌已过期'));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json(createErrorResponse('无效的令牌'));
    }
    return res.status(500).json(createErrorResponse('服务器错误'));
  }
};

/**
 * 验证API密钥中间件
 */
export const authenticateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      return res.status(401).json(createErrorResponse('API密钥缺失'));
    }

    const keyResult = await pool.query(
      'SELECT id, name FROM api_keys WHERE key = $1 AND is_active = true',
      [apiKey]
    );

    if (keyResult.rows.length === 0) {
      return res.status(401).json(createErrorResponse('无效的API密钥'));
    }

    // 将API密钥信息添加到请求对象
    req.apiKey = keyResult.rows[0];
    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    return res.status(500).json(createErrorResponse('服务器错误'));
  }
};

/**
 * 要求管理员权限中间件
 */
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json(createErrorResponse('需要管理员权限'));
  }
  next();
};

/**
 * 可选认证中间件（用于允许匿名访问但需要用户信息的接口）
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      req.user = decoded;
    } catch (error) {
      // 令牌无效，但不阻止请求继续
      console.log('Optional auth failed:', error.message);
    }
  }

  next();
};