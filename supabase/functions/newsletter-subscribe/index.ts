import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

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
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }

  try {
    const { email }: SubscribeRequest = await req.json();

    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: '邮箱地址是必需的' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return new Response(
        JSON.stringify({ error: '请输入有效的邮箱地址' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const { data: existingSubscriber, error: checkError } = await supabase
      .from('newsletter_subscribers')
      .select('is_active')
      .eq('email', normalizedEmail)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is expected for new subscribers
      console.error('Error checking existing subscriber:', checkError);
      throw new Error('检查订阅状态时出错');
    }

    let response_data: any = {};

    if (existingSubscriber) {
      if (existingSubscriber.is_active) {
        // Already subscribed and active
        response_data = { 
          success: true, 
          already_subscribed: true,
          message: '该邮箱已经在我们的订阅列表中'
        };
      } else {
        // Reactivate subscription
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({ 
            is_active: true,
            subscribed_at: new Date().toISOString()
          })
          .eq('email', normalizedEmail);

        if (updateError) {
          console.error('Error reactivating subscription:', updateError);
          throw new Error('重新激活订阅时出错');
        }

        response_data = { 
          success: true, 
          reactivated: true,
          message: '欢迎回来！您已重新订阅我们的newsletter'
        };
      }
    } else {
      // New subscription
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: normalizedEmail,
          user_agent: req.headers.get('user-agent') || null,
          ip_address: req.headers.get('x-forwarded-for') || 
                      req.headers.get('cf-connecting-ip') || 
                      null
        });

      if (insertError) {
        console.error('Error inserting new subscriber:', insertError);
        throw new Error('订阅时出错');
      }

      response_data = { 
        success: true, 
        new_subscription: true,
        message: '感谢您订阅我们的newsletter'
      };
    }

    // Log successful subscription
    console.log(`Newsletter subscription: ${normalizedEmail}`, response_data);

    return new Response(
      JSON.stringify(response_data),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in newsletter-subscribe function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || '订阅时发生未知错误，请稍后重试' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);