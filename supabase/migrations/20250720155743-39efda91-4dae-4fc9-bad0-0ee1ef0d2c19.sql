-- 创建用户资料表
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- 启用RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 创建用户资料的RLS策略
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 创建新闻文章表
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  category_id UUID,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  meta_title TEXT,
  meta_description TEXT,
  view_count INTEGER NOT NULL DEFAULT 0
);

-- 启用RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- 创建文章分类表
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#8B5CF6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 启用RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 添加外键约束
ALTER TABLE public.articles 
ADD CONSTRAINT fk_articles_category 
FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

-- 创建文章的RLS策略
CREATE POLICY "Anyone can view published articles" 
ON public.articles 
FOR SELECT 
USING (status = 'published' OR auth.uid() = author_id);

CREATE POLICY "Authors can manage their own articles" 
ON public.articles 
FOR ALL
USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all articles" 
ON public.articles 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 创建分类的RLS策略
CREATE POLICY "Anyone can view categories" 
ON public.categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 创建触发器函数来自动更新时间戳
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有表添加更新时间戳触发器
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 创建自动创建用户资料的触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 触发器：用户注册时自动创建资料
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 创建一些初始分类
INSERT INTO public.categories (name, slug, description, color) VALUES
('科技', 'tech', 'AI、机器学习、编程等技术相关内容', '#8B5CF6'),
('新闻', 'news', '最新资讯和时事动态', '#06B6D4'),
('教程', 'tutorial', '技术教程和学习资源', '#10B981'),
('观点', 'opinion', '观点分析和深度思考', '#F59E0B');

-- 创建索引以提高查询性能
CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX idx_articles_category_id ON public.articles(category_id);
CREATE INDEX idx_articles_author_id ON public.articles(author_id);
CREATE INDEX idx_articles_slug ON public.articles(slug);