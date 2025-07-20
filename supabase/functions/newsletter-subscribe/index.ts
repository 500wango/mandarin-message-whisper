import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscribeRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: '只支持POST请求' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const { email }: SubscribeRequest = await req.json();

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: '请输入有效的邮箱地址' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 创建Supabase客户端，使用service role key来绕过RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // 获取用户信息（如果可用）
    const userAgent = req.headers.get('user-agent') || '';
    const forwarded = req.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || '';

    console.log(`[NEWSLETTER-SUBSCRIBE] 尝试订阅邮箱: ${email}`);

    // 检查邮箱是否已经订阅
    const { data: existingSubscriber, error: checkError } = await supabaseClient
      .from('newsletter_subscribers')
      .select('id, is_active')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 是"找不到记录"的错误码
      console.error('[NEWSLETTER-SUBSCRIBE] 检查现有订阅时出错:', checkError);
      throw new Error('检查订阅状态时出错');
    }

    if (existingSubscriber) {
      if (existingSubscriber.is_active) {
        return new Response(
          JSON.stringify({ 
            message: '该邮箱已经订阅过了',
            already_subscribed: true 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } else {
        // 重新激活已取消的订阅
        const { error: updateError } = await supabaseClient
          .from('newsletter_subscribers')
          .update({ 
            is_active: true, 
            subscribed_at: new Date().toISOString(),
            updated_at: new Date().toISOString() 
          })
          .eq('id', existingSubscriber.id);

        if (updateError) {
          console.error('[NEWSLETTER-SUBSCRIBE] 重新激活订阅时出错:', updateError);
          throw new Error('重新激活订阅时出错');
        }

        console.log(`[NEWSLETTER-SUBSCRIBE] 重新激活订阅成功: ${email}`);
        return new Response(
          JSON.stringify({ 
            message: '重新订阅成功！',
            reactivated: true 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // 创建新订阅
    const { data: newSubscriber, error: insertError } = await supabaseClient
      .from('newsletter_subscribers')
      .insert({
        email: email.toLowerCase().trim(),
        user_agent: userAgent,
        ip_address: ipAddress,
        is_active: true
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[NEWSLETTER-SUBSCRIBE] 创建订阅时出错:', insertError);
      throw new Error('创建订阅时出错');
    }

    console.log(`[NEWSLETTER-SUBSCRIBE] 新订阅创建成功: ${email}, ID: ${newSubscriber.id}`);

    // TODO: 当提供Resend API密钥后，在这里添加欢迎邮件发送功能
    // 现在先返回成功消息
    
    return new Response(
      JSON.stringify({ 
        message: '订阅成功！欢迎加入我们的newsletter',
        subscriber_id: newSubscriber.id
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('[NEWSLETTER-SUBSCRIBE] 处理订阅时出现错误:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || '订阅时出现未知错误' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);