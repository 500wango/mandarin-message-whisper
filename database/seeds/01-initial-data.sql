-- 初始数据种子文件

-- 创建默认管理员用户（密码：Admin123）
INSERT INTO users (id, email, password_hash, display_name, role, email_verified)
VALUES (
  uuid_generate_v4(),
  'admin@example.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewwpJvJx0YlP2LGy', -- Admin123
  '系统管理员',
  'admin',
  true
);

-- 默认分类
INSERT INTO categories (id, name, slug, description, color) VALUES
(uuid_generate_v4(), 'AI工具', 'ai-tools', '介绍各种AI工具和应用', '#3B82F6'),
(uuid_generate_v4(), 'AI新闻', 'ai-news', '最新的AI行业新闻和动态', '#10B981'),
(uuid_generate_v4(), '提示词工程', 'prompt-engineering', '提示词设计和优化技巧', '#8B5CF6'),
(uuid_generate_v4(), '教程', 'tutorials', '技术教程和指南', '#F59E0B'),
(uuid_generate_v4(), '观点', 'opinions', '行业观点和分析', '#EF4444');

-- 默认网站设置
INSERT INTO site_settings (setting_key, setting_value, display_name, description) VALUES
('site_title', 'AI资讯网站', '网站标题', '显示在浏览器标题栏的网站名称'),
('site_description', '专业的AI技术资讯和工具分享平台', '网站描述', '网站的简短描述，用于SEO'),
('site_logo', '', '网站Logo', '网站的主要标识图片'),
('site_favicon', '', '网站图标', '显示在浏览器标签页的小图标'),
('contact_email', 'contact@example.com', '联系邮箱', '用户联系的邮箱地址'),
('footer_text', '© 2024 AI资讯网站. All rights reserved.', '页脚文字', '显示在网站底部的版权信息');

-- 默认导航菜单
INSERT INTO navigation_items (name, href, icon, sort_order, is_active) VALUES
('首页', '/', 'Home', 1, true),
('工具', '/tools', 'Wrench', 2, true),
('新闻', '/news', 'Newspaper', 3, true),
('提示词', '/prompts', 'MessageSquare', 4, true),
('关于', '/about', 'Info', 5, true),
('联系', '/contact', 'Mail', 6, true);

-- 示例文章（可选）
DO $$
DECLARE
    admin_id UUID;
    ai_tools_id UUID;
    ai_news_id UUID;
BEGIN
    -- 获取管理员ID
    SELECT id INTO admin_id FROM users WHERE email = 'admin@example.com';
    
    -- 获取分类ID
    SELECT id INTO ai_tools_id FROM categories WHERE slug = 'ai-tools';
    SELECT id INTO ai_news_id FROM categories WHERE slug = 'ai-news';
    
    -- 插入示例文章
    INSERT INTO articles (title, slug, content, excerpt, status, author_id, category_id, published_at) VALUES
    (
        '欢迎来到AI资讯网站',
        'welcome-to-ai-website',
        '<h1>欢迎来到AI资讯网站</h1><p>这里是您获取最新AI资讯、工具和技术的最佳平台。我们致力于为您提供高质量的内容和实用的工具推荐。</p><h2>我们的特色</h2><ul><li>最新的AI工具评测</li><li>行业新闻和趋势分析</li><li>实用的提示词工程技巧</li><li>详细的技术教程</li></ul>',
        '欢迎来到AI资讯网站，这里是您获取最新AI资讯、工具和技术的最佳平台。',
        'published',
        admin_id,
        ai_news_id,
        NOW()
    );
END $$;