-- 插入logo相关的网站设置
INSERT INTO public.site_settings (setting_key, setting_value, display_name, description) VALUES
('site_logo_url', '', '网站Logo', '网站的Logo图片链接'),
('site_favicon_url', '', '网站图标', '网站的favicon图标链接')
ON CONFLICT (setting_key) DO NOTHING;