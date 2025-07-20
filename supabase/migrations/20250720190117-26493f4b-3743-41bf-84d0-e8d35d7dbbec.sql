-- Create page_content table to store dynamic page content
CREATE TABLE public.page_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key text NOT NULL UNIQUE, -- 页面标识符，如 'about', 'contact', 'privacy', 'terms'
  title text NOT NULL,
  content jsonb NOT NULL, -- 存储页面的结构化内容
  meta_description text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view published page content" 
ON public.page_content 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage page content" 
ON public.page_content 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_page_content_updated_at
BEFORE UPDATE ON public.page_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content for the pages
INSERT INTO public.page_content (page_key, title, content, meta_description) VALUES
('about', '关于我们', '{
  "hero": {
    "title": "关于AI资讯中心",
    "description": "我们是一个专注于人工智能领域的专业资讯平台，致力于为AI从业者、研究员和爱好者提供最新、最全面的行业信息和实用工具推荐。"
  },
  "mission": {
    "title": "我们的使命",
    "content": "通过提供高质量的AI资讯、工具推荐和知识分享，帮助更多人了解和应用人工智能技术，推动AI技术的普及和发展，让AI为人类创造更美好的未来。"
  },
  "features": [
    {
      "title": "专业AI资讯",
      "description": "提供最新、最准确的人工智能行业新闻和趋势分析"
    },
    {
      "title": "精选工具推荐", 
      "description": "严格筛选并推荐优质AI工具，帮助用户提高工作效率"
    },
    {
      "title": "提示词工程",
      "description": "深入研究和分享AI提示词技巧，释放AI工具的最大潜能"
    },
    {
      "title": "社区驱动",
      "description": "建立AI从业者和爱好者交流学习的优质社区平台"
    }
  ]
}', '了解AI资讯中心的使命、愿景和团队'),

('contact', '联系我们', '{
  "hero": {
    "title": "联系我们",
    "description": "有任何问题、建议或合作意向？我们很乐意听到您的声音，让我们一起推动AI技术的发展和应用。"
  },
  "contactInfo": [
    {
      "title": "邮箱地址",
      "content": "contact@ai-news-center.com",
      "description": "我们会在24小时内回复您的邮件"
    },
    {
      "title": "在线客服",
      "content": "工作日 9:00-18:00",
      "description": "通过网站右下角客服窗口联系我们"
    },
    {
      "title": "公司地址",
      "content": "北京市朝阳区科技园区",
      "description": "欢迎预约参观我们的办公室"
    },
    {
      "title": "技术支持",
      "content": "support@ai-news-center.com", 
      "description": "技术问题和建议反馈专用邮箱"
    }
  ]
}', '联系AI资讯中心，获取技术支持和商务合作'),

('privacy', '隐私政策', '{
  "hero": {
    "title": "隐私政策",
    "description": "我们高度重视您的隐私保护。本隐私政策详细说明了我们如何收集、使用、存储和保护您的个人信息。"
  },
  "lastUpdated": "2024年7月20日",
  "sections": [
    {
      "title": "信息收集",
      "items": [
        "个人信息：当您注册账户、订阅邮件或联系我们时，我们可能收集您的姓名、邮箱地址等个人信息。",
        "使用数据：我们收集您在网站上的浏览行为、点击记录等使用数据，以改善用户体验。",
        "技术信息：包括IP地址、浏览器类型、操作系统、访问时间等技术信息。",
        "Cookie信息：我们使用Cookie来记住您的偏好设置和提供个性化服务。"
      ]
    }
  ]
}', 'AI资讯中心隐私政策，了解我们如何保护您的个人信息'),

('terms', '使用条款', '{
  "hero": {
    "title": "使用条款",
    "description": "本使用条款规定了您访问和使用AI资讯中心网站的规则和条件。请仔细阅读这些条款。"
  },
  "effectiveDate": "2024年7月20日",
  "sections": [
    {
      "title": "接受条款",
      "items": [
        "访问和使用本网站即表示您同意遵守本使用条款。",
        "如果您不同意这些条款，请不要使用本网站。",
        "我们有权随时修改这些条款，修改后的条款在发布时生效。",
        "继续使用网站即表示您接受修改后的条款。"
      ]
    }
  ]
}', 'AI资讯中心使用条款，了解网站使用规则和用户权利义务');