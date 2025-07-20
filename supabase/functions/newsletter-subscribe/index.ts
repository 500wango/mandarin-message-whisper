import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

// Email template function
const createWelcomeEmailTemplate = (email: string) => {
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>欢迎订阅AI Navigator</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 2px;
          margin: 20px 0;
        }
        .content {
          background: white;
          border-radius: 14px;
          padding: 40px;
          text-align: center;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 20px;
        }
        .title {
          color: #1a202c;
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 16px;
        }
        .description {
          color: #4a5568;
          font-size: 16px;
          margin-bottom: 32px;
          line-height: 1.6;
        }
        .features {
          text-align: left;
          margin: 32px 0;
          padding: 0 20px;
        }
        .feature {
          margin-bottom: 16px;
          padding: 12px;
          background: #f7fafc;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }
        .feature-title {
          font-weight: bold;
          color: #2d3748;
          margin-bottom: 4px;
        }
        .feature-desc {
          color: #4a5568;
          font-size: 14px;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 32px;
          text-decoration: none;
          border-radius: 12px;
          font-weight: bold;
          margin: 24px 0;
          transition: transform 0.2s;
        }
        .cta-button:hover {
          transform: translateY(-2px);
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          color: #718096;
          font-size: 14px;
        }
        .unsubscribe {
          color: #a0aec0;
          font-size: 12px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <div class="logo">🤖 AI Navigator</div>
          <h1 class="title">欢迎加入AI Navigator社区！</h1>
          <p class="description">
            感谢您订阅我们的newsletter！您现在将第一时间获得最新的AI资讯、工具推荐和行业洞察。
          </p>
          
          <div class="features">
            <div class="feature">
              <div class="feature-title">🔥 热门AI工具推荐</div>
              <div class="feature-desc">每周为您精选最实用的AI工具和应用</div>
            </div>
            <div class="feature">
              <div class="feature-title">📰 行业前沿资讯</div>
              <div class="feature-desc">紧跟AI技术发展趋势，掌握最新行业动态</div>
            </div>
            <div class="feature">
              <div class="feature-title">💡 实用技巧分享</div>
              <div class="feature-desc">分享AI工具使用技巧和最佳实践</div>
            </div>
            <div class="feature">
              <div class="feature-title">🎯 个性化推荐</div>
              <div class="feature-desc">根据您的兴趣为您推荐相关内容</div>
            </div>
          </div>

          <a href="https://ai-navigator.app" class="cta-button">开始探索AI世界</a>
          
          <div class="footer">
            <p><strong>AI Navigator</strong> - 您的AI工具导航专家</p>
            <p>帮助您发现、学习和使用最好的AI工具</p>
          </div>
          
          <div class="unsubscribe">
            <p>如果您不想再收到这些邮件，可以<a href="#" style="color: #a0aec0;">取消订阅</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

const sendWelcomeEmail = async (email: string) => {
  try {
    const emailResponse = await resend.emails.send({
      from: 'AI Navigator <noreply@resend.dev>',
      to: [email],
      subject: '🎉 欢迎加入AI Navigator社区！',
      html: createWelcomeEmailTemplate(email),
    });

    console.log('Welcome email sent successfully:', emailResponse);
    return { success: true, data: emailResponse };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
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

      // Send welcome email for new subscriptions
      const emailResult = await sendWelcomeEmail(normalizedEmail);
      
      response_data = { 
        success: true, 
        new_subscription: true,
        message: '感谢您订阅我们的newsletter',
        email_sent: emailResult.success
      };
      
      if (!emailResult.success) {
        console.warn('Failed to send welcome email, but subscription was successful:', emailResult.error);
      }
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