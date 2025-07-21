import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { createErrorResponse } from '../lib/utils';

/**
 * 通用验证中间件
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json(createErrorResponse(error.details[0].message));
    }
    next();
  };
};

/**
 * 用户注册验证模式
 */
export const userRegistrationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '请输入有效的邮箱地址',
    'any.required': '邮箱地址是必需的'
  }),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$')).required().messages({
    'string.min': '密码至少需要8位字符',
    'string.pattern.base': '密码必须包含大小写字母和数字',
    'any.required': '密码是必需的'
  }),
  display_name: Joi.string().max(100).optional().messages({
    'string.max': '显示名称不能超过100个字符'
  })
});

/**
 * 用户登录验证模式
 */
export const userLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '请输入有效的邮箱地址',
    'any.required': '邮箱地址是必需的'
  }),
  password: Joi.string().required().messages({
    'any.required': '密码是必需的'
  })
});

/**
 * 文章创建验证模式
 */
export const articleCreationSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.min': '文章标题不能为空',
    'string.max': '文章标题不能超过200个字符',
    'any.required': '文章标题是必需的'
  }),
  content: Joi.string().min(1).required().messages({
    'string.min': '文章内容不能为空',
    'any.required': '文章内容是必需的'
  }),
  excerpt: Joi.string().max(500).optional().messages({
    'string.max': '文章摘要不能超过500个字符'
  }),
  meta_title: Joi.string().max(60).optional().messages({
    'string.max': 'SEO标题不能超过60个字符'
  }),
  meta_description: Joi.string().max(160).optional().messages({
    'string.max': 'SEO描述不能超过160个字符'
  }),
  featured_image_url: Joi.string().uri().optional().messages({
    'string.uri': '特色图片必须是有效的URL'
  }),
  status: Joi.string().valid('draft', 'published', 'archived').optional().messages({
    'any.only': '状态必须是draft、published或archived之一'
  }),
  category_id: Joi.string().uuid().optional().messages({
    'string.uuid': '分类ID必须是有效的UUID'
  })
});

/**
 * 文章更新验证模式
 */
export const articleUpdateSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  content: Joi.string().min(1).optional(),
  excerpt: Joi.string().max(500).optional(),
  meta_title: Joi.string().max(60).optional(),
  meta_description: Joi.string().max(160).optional(),
  featured_image_url: Joi.string().uri().optional(),
  status: Joi.string().valid('draft', 'published', 'archived').optional(),
  category_id: Joi.string().uuid().optional()
});

/**
 * 分类创建验证模式
 */
export const categoryCreationSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.min': '分类名称不能为空',
    'string.max': '分类名称不能超过100个字符',
    'any.required': '分类名称是必需的'
  }),
  slug: Joi.string().min(1).max(100).pattern(/^[a-z0-9-]+$/).required().messages({
    'string.min': '分类别名不能为空',
    'string.max': '分类别名不能超过100个字符',
    'string.pattern.base': '分类别名只能包含小写字母、数字和连字符',
    'any.required': '分类别名是必需的'
  }),
  description: Joi.string().max(500).optional().messages({
    'string.max': '分类描述不能超过500个字符'
  }),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional().messages({
    'string.pattern.base': '颜色必须是有效的十六进制颜色值'
  })
});

/**
 * API密钥创建验证模式
 */
export const apiKeyCreationSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.min': 'API密钥名称不能为空',
    'string.max': 'API密钥名称不能超过100个字符',
    'any.required': 'API密钥名称是必需的'
  }),
  description: Joi.string().max(500).optional().messages({
    'string.max': 'API密钥描述不能超过500个字符'
  })
});