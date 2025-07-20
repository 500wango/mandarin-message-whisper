-- 创建一个预设的管理员账户
-- 使用预设邮箱，首次登录时需要设置密码

-- 首先插入到 auth.users 表中创建管理员用户
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@yoursite.com',
  crypt('temp_password_change_me', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"display_name": "系统管理员", "must_change_password": true}',
  false,
  'authenticated',
  'authenticated',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- 在 profiles 表中创建对应的管理员资料
INSERT INTO public.profiles (
  id,
  email,
  display_name,
  role,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin@yoursite.com',
  '系统管理员',
  'admin',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- 创建一个函数来检查用户是否需要更改密码
CREATE OR REPLACE FUNCTION public.user_must_change_password(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (raw_user_meta_data->>'must_change_password')::boolean,
    false
  )
  FROM auth.users
  WHERE id = user_id;
$$;

-- 创建一个函数来更新用户密码并移除强制更改标记
CREATE OR REPLACE FUNCTION public.update_user_password_and_clear_flag(
  user_id uuid,
  new_password text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- 更新密码
  UPDATE auth.users
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    raw_user_meta_data = raw_user_meta_data - 'must_change_password',
    updated_at = now()
  WHERE id = user_id;
  
  IF FOUND THEN
    result := json_build_object('success', true, 'message', '密码更新成功');
  ELSE
    result := json_build_object('success', false, 'message', '用户不存在');
  END IF;
  
  RETURN result;
END;
$$;