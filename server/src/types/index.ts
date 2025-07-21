// 用户相关类型
export interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  role: 'user' | 'admin';
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  display_name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// 文章相关类型
export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  meta_title?: string;
  meta_description?: string;
  featured_image_url?: string;
  status: 'draft' | 'published' | 'archived';
  author_id: string;
  category_id?: string;
  view_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateArticleData {
  title: string;
  content: string;
  excerpt?: string;
  meta_title?: string;
  meta_description?: string;
  featured_image_url?: string;
  status?: 'draft' | 'published' | 'archived';
  category_id?: string;
}

// 分类相关类型
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// JWT Payload类型
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// 请求扩展类型
export interface AuthenticatedRequest extends Express.Request {
  user?: JwtPayload;
}