-- 创建安全函数来获取当前用户角色，避免RLS递归问题
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 删除现有的文章策略
DROP POLICY IF EXISTS "Authors can manage their own articles" ON public.articles;
DROP POLICY IF EXISTS "Admins can manage all articles" ON public.articles;

-- 创建新的文章管理策略 - 只允许管理员操作
CREATE POLICY "Only admins can create articles" 
ON public.articles 
FOR INSERT 
WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can update articles" 
ON public.articles 
FOR UPDATE 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can delete articles" 
ON public.articles 
FOR DELETE 
USING (public.get_current_user_role() = 'admin');

-- 删除现有的用户资料策略
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 创建新的用户资料策略
CREATE POLICY "Users can view and update their basic profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 允许管理员管理所有用户资料（包括角色修改）
CREATE POLICY "Admins can manage all user profiles" 
ON public.profiles 
FOR ALL
USING (public.get_current_user_role() = 'admin');