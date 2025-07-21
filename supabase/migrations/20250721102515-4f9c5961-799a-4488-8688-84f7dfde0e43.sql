-- 启用所需的扩展
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 创建每日执行的定时任务，每天上午9点执行
SELECT cron.schedule(
  'daily-futuretools-scraper',
  '0 9 * * *', -- 每天上午9点
  $$
  SELECT
    net.http_post(
        url:='https://dembuvipwnfolksvqygl.supabase.co/functions/v1/futuretools-scraper',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbWJ1dmlwd25mb2xrc3ZxeWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NjE4ODAsImV4cCI6MjA2ODMzNzg4MH0.ZjXV_HFJ4vp98ZxFBpQbtH7VUO4R3lzi_QzpgYGmsMI"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- 创建用于存储抓取日志的表
CREATE TABLE IF NOT EXISTS public.scraper_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  status text NOT NULL,
  tools_scraped integer DEFAULT 0,
  tools_published integer DEFAULT 0,
  error_message text,
  execution_time_ms integer
);

-- 启用RLS
ALTER TABLE public.scraper_logs ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Admins can view scraper logs" 
ON public.scraper_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "System can insert scraper logs" 
ON public.scraper_logs 
FOR INSERT 
WITH CHECK (true);