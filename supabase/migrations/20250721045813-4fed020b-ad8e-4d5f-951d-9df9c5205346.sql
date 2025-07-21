-- 创建API密钥管理表
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  key TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 启用RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略 - 只有认证用户可以访问
CREATE POLICY "Authenticated users can view api_keys" 
ON public.api_keys 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert api_keys" 
ON public.api_keys 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update api_keys" 
ON public.api_keys 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete api_keys" 
ON public.api_keys 
FOR DELETE 
TO authenticated 
USING (true);

-- 添加更新时间戳触发器
CREATE TRIGGER update_api_keys_updated_at
BEFORE UPDATE ON public.api_keys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();