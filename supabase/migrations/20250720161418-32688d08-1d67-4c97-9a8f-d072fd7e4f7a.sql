-- 更新文章表的RLS策略，只允许管理员创建文章
DROP POLICY IF EXISTS "Authors can manage their own articles" ON public.articles;
DROP POLICY IF EXISTS "Admins can manage all articles" ON public.articles;

-- 创建新的文章管理策略
CREATE POLICY "Only admins can create articles" 
ON public.articles 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update articles" 
ON public.articles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can delete articles" 
ON public.articles 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 更新用户资料表的RLS策略，只允许管理员修改用户角色
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile (except role)" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- 确保普通用户不能修改自己的角色
  (OLD.role = NEW.role OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ))
);

-- 只允许管理员修改其他用户的角色
CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);