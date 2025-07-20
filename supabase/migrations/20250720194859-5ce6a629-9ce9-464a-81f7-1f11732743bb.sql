-- 创建导航菜单表
CREATE TABLE public.navigation_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  href TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Brain',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 启用RLS
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Anyone can view active navigation items" 
ON public.navigation_items 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Only admins can manage navigation items" 
ON public.navigation_items 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- 插入默认的导航项
INSERT INTO public.navigation_items (name, href, icon, sort_order) VALUES
('首页', '/', 'Brain', 1),
('AI新闻', '/news', 'Zap', 2),
('AI工具', '/tools', 'Sparkles', 3),
('提示词工程', '/prompts', 'Brain', 4);

-- 创建网站设置表
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 启用RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Anyone can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage site settings" 
ON public.site_settings 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- 插入默认的网站设置
INSERT INTO public.site_settings (setting_key, setting_value, display_name, description) VALUES
('site_title', 'AI资讯中心', '网站标题', '显示在页面标题和品牌区域'),
('site_description', '专业的AI行业新闻、工具推荐和提示词工程资讯平台', '网站描述', '显示在首页和关于页面'),
('hero_title', '探索AI前沿资讯<br />赋能智能时代', '首页主标题', '首页Hero区域的主要标题'),
('hero_subtitle', '汇聚最新AI行业动态、精选工具推荐与专业提示词工程，<br />为AI从业者和爱好者提供一站式信息服务', '首页副标题', '首页Hero区域的描述文字');

-- 创建更新时间戳的触发器
CREATE TRIGGER update_navigation_items_updated_at
BEFORE UPDATE ON public.navigation_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();