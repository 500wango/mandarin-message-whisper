-- 更新分类名称，使其与导航菜单一致
UPDATE categories 
SET 
  name = '提示词工程',
  slug = 'prompts',
  description = '提示词工程技巧和模板'
WHERE name = 'Promt';

-- 更新 AI工具 分类的 slug 使其与导航菜单一致
UPDATE categories 
SET slug = 'tools'
WHERE name = 'AI工具';

-- 更新 AI新闻 分类的 slug 使其与导航菜单一致  
UPDATE categories
SET slug = 'news'
WHERE name = 'AI新闻';