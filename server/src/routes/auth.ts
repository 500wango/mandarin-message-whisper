import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../lib/database';
import { validate, userRegistrationSchema, userLoginSchema } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { createSuccessResponse, createErrorResponse } from '../lib/utils';
import { CreateUserData, LoginData, User, AuthenticatedRequest } from '../types';

const router = express.Router();

/**
 * 用户注册
 */
router.post('/register', validate(userRegistrationSchema), async (req, res) => {
  try {
    const { email, password, display_name }: CreateUserData = req.body;
    
    // 检查用户是否已存在
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json(createErrorResponse('该邮箱已被注册'));
    }
    
    // 加密密码
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // 创建用户
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, display_name) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, display_name, role, created_at`,
      [email, passwordHash, display_name || email.split('@')[0]]
    );
    
    const user = result.rows[0];
    
    // 生成JWT令牌
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    res.status(201).json(createSuccessResponse({
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role
      },
      token
    }, '注册成功'));
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(createErrorResponse('注册失败，请稍后重试'));
  }
});

/**
 * 用户登录
 */
router.post('/login', validate(userLoginSchema), async (req, res) => {
  try {
    const { email, password }: LoginData = req.body;
    
    // 查找用户
    const result = await pool.query(
      'SELECT id, email, password_hash, display_name, role FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json(createErrorResponse('邮箱或密码错误'));
    }
    
    const user = result.rows[0];
    
    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json(createErrorResponse('邮箱或密码错误'));
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    res.json(createSuccessResponse({
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role
      },
      token
    }, '登录成功'));
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(createErrorResponse('登录失败，请稍后重试'));
  }
});

/**
 * 获取当前用户信息
 */
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, display_name, avatar_url, bio, role, created_at FROM users WHERE id = $1',
      [req.user!.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('用户不存在'));
    }
    
    res.json(createSuccessResponse(result.rows[0]));
    
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json(createErrorResponse('获取用户信息失败'));
  }
});

/**
 * 更新用户资料
 */
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { display_name, bio, avatar_url } = req.body;
    
    const result = await pool.query(
      `UPDATE users 
       SET display_name = COALESCE($1, display_name),
           bio = COALESCE($2, bio),
           avatar_url = COALESCE($3, avatar_url)
       WHERE id = $4
       RETURNING id, email, display_name, avatar_url, bio, role`,
      [display_name, bio, avatar_url, req.user!.userId]
    );
    
    res.json(createSuccessResponse(result.rows[0], '资料更新成功'));
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json(createErrorResponse('更新资料失败'));
  }
});

/**
 * 修改密码
 */
router.put('/password', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { current_password, new_password } = req.body;
    
    if (!current_password || !new_password) {
      return res.status(400).json(createErrorResponse('当前密码和新密码都是必需的'));
    }
    
    // 验证新密码强度
    if (new_password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(new_password)) {
      return res.status(400).json(createErrorResponse('新密码必须至少8位，包含大小写字母和数字'));
    }
    
    // 获取当前密码哈希
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user!.userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json(createErrorResponse('用户不存在'));
    }
    
    // 验证当前密码
    const isValidPassword = await bcrypt.compare(current_password, userResult.rows[0].password_hash);
    
    if (!isValidPassword) {
      return res.status(400).json(createErrorResponse('当前密码错误'));
    }
    
    // 加密新密码
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(new_password, saltRounds);
    
    // 更新密码
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, req.user!.userId]
    );
    
    res.json(createSuccessResponse(null, '密码修改成功'));
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json(createErrorResponse('修改密码失败'));
  }
});

/**
 * 验证令牌
 */
router.post('/verify', authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json(createSuccessResponse({ valid: true, user: req.user }));
});

export default router;