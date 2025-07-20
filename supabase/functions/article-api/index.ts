import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ArticleData {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status?: 'draft' | 'published' | 'archived';
  category_id?: string;
  meta_title?: string;
  meta_description?: string;
  featured_image_url?: string;
  author_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 创建Supabase客户端
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('Article API called:', req.method, req.url)

    const url = new URL(req.url)
    const articleId = url.pathname.split('/').pop()

    // 验证API密钥（用于工作流自动化）
    const apiKey = req.headers.get('x-api-key') || url.searchParams.get('api_key')
    const authHeader = req.headers.get('authorization')
    
    // 如果没有认证头，检查API密钥
    if (!authHeader && !apiKey) {
      console.log('Missing authentication')
      return new Response(
        JSON.stringify({ error: 'Missing authentication. Provide either Authorization header or x-api-key.' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 验证API密钥（如果提供）
    if (apiKey) {
      const validApiKey = Deno.env.get('ARTICLE_API_KEY')
      if (!validApiKey) {
        console.log('Article API key not configured')
        return new Response(
          JSON.stringify({ error: 'API key authentication not configured' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      if (apiKey !== validApiKey) {
        console.log('Invalid API key provided')
        return new Response(
          JSON.stringify({ error: 'Invalid API key' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // GET /article-api - 获取文章列表
    if (req.method === 'GET' && !articleId) {
      const { data: articles, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories (
            name,
            color
          ),
          profiles (
            display_name,
            email
          )
        `)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching articles:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ data: articles }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // GET /article-api/{id} - 获取单篇文章
    if (req.method === 'GET' && articleId) {
      const { data: article, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories (
            name,
            color
          ),
          profiles (
            display_name,
            email
          )
        `)
        .eq('id', articleId)
        .single()

      if (error) {
        console.error('Error fetching article:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ data: article }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // POST /article-api - 创建新文章
    if (req.method === 'POST') {
      const body = await req.json()
      console.log('Creating article with data:', body)

      // 验证必需字段
      if (!body.title || !body.content) {
        return new Response(
          JSON.stringify({ error: 'Title and content are required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // 生成slug（如果没有提供）
      if (!body.slug) {
        body.slug = body.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
      }

      // 智能分类功能（如果没有指定分类且启用了自动分类）
      if (!body.category_id && body.auto_categorize !== false) {
        console.log('Attempting auto-categorization for article:', body.title)
        
        // 获取所有分类
        const { data: categories, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name, slug, description')
        
        if (!categoriesError && categories && categories.length > 0) {
          // 简单的关键词匹配算法
          const contentLower = (body.title + ' ' + (body.excerpt || '') + ' ' + body.content).toLowerCase()
          
          // 定义分类关键词映射
          const categoryKeywords: { [key: string]: string[] } = {
            '科技': ['ai', '人工智能', '机器学习', '深度学习', '算法', '技术', '科技', '编程', '代码', '开发', '软件', '硬件', '芯片', '处理器'],
            '新闻': ['新闻', '资讯', '消息', '发布', '宣布', '报道', '最新', '今日', '昨日', '本周', '本月'],
            '教程': ['教程', '指南', '如何', '步骤', '方法', '学习', '入门', '基础', '进阶', '实战', '案例', '示例'],
            '观点': ['观点', '看法', '分析', '评论', '思考', '讨论', '观察', '预测', '趋势', '未来', '展望', '反思']
          }
          
          let bestMatch = { categoryId: '', score: 0 }
          
          // 为每个分类计算匹配分数
          for (const category of categories) {
            const keywords = categoryKeywords[category.name] || []
            let score = 0
            
            // 检查关键词匹配
            for (const keyword of keywords) {
              const matches = contentLower.split(keyword).length - 1
              score += matches
            }
            
            // 如果分类名称直接在内容中出现，增加权重
            if (contentLower.includes(category.name.toLowerCase())) {
              score += 10
            }
            
            // 如果分类slug在内容中出现，增加权重
            if (contentLower.includes(category.slug.toLowerCase())) {
              score += 5
            }
            
            console.log(`Category "${category.name}" score: ${score}`)
            
            if (score > bestMatch.score) {
              bestMatch = { categoryId: category.id, score }
            }
          }
          
          // 如果找到匹配度较高的分类（至少1分），则使用它
          if (bestMatch.score > 0) {
            body.category_id = bestMatch.categoryId
            console.log(`Auto-categorized article to category ID: ${bestMatch.categoryId} (score: ${bestMatch.score})`)
          } else {
            console.log('No suitable category found for auto-categorization')
          }
        }
      }

      // 设置默认作者（如果通过API密钥调用）
      if (apiKey && !body.author_id) {
        // 获取第一个管理员作为默认作者
        const { data: admin } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'admin')
          .limit(1)
          .single()
        
        if (admin) {
          body.author_id = admin.id
        }
      }

      const articleData: ArticleData = {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt,
        content: body.content,
        status: body.status || 'draft',
        category_id: body.category_id,
        meta_title: body.meta_title || body.title,
        meta_description: body.meta_description,
        featured_image_url: body.featured_image_url,
        author_id: body.author_id
      }

      // 如果状态是发布，设置发布时间
      const insertData = {
        ...articleData,
        published_at: articleData.status === 'published' ? new Date().toISOString() : null
      }

      const { data: article, error } = await supabase
        .from('articles')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('Error creating article:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('Article created successfully:', article.id)
      return new Response(
        JSON.stringify({ 
          data: article, 
          message: `Article ${articleData.status === 'published' ? 'published' : 'created'} successfully` 
        }),
        { 
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // PUT /article-api/{id} - 更新文章
    if (req.method === 'PUT' && articleId) {
      const body = await req.json()
      console.log('Updating article:', articleId, body)

      // 检查文章是否存在
      const { data: existingArticle, error: fetchError } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single()

      if (fetchError || !existingArticle) {
        return new Response(
          JSON.stringify({ error: 'Article not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const updateData: Partial<ArticleData> = {}
      
      // 只更新提供的字段
      if (body.title !== undefined) updateData.title = body.title
      if (body.slug !== undefined) updateData.slug = body.slug
      if (body.excerpt !== undefined) updateData.excerpt = body.excerpt
      if (body.content !== undefined) updateData.content = body.content
      if (body.status !== undefined) updateData.status = body.status
      if (body.category_id !== undefined) updateData.category_id = body.category_id
      if (body.meta_title !== undefined) updateData.meta_title = body.meta_title
      if (body.meta_description !== undefined) updateData.meta_description = body.meta_description
      if (body.featured_image_url !== undefined) updateData.featured_image_url = body.featured_image_url

      // 如果状态改为发布且之前未发布，设置发布时间
      const finalUpdateData = {
        ...updateData,
        published_at: updateData.status === 'published' && existingArticle.status !== 'published' 
          ? new Date().toISOString() 
          : existingArticle.published_at
      }

      const { data: article, error } = await supabase
        .from('articles')
        .update(finalUpdateData)
        .eq('id', articleId)
        .select()
        .single()

      if (error) {
        console.error('Error updating article:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('Article updated successfully:', articleId)
      return new Response(
        JSON.stringify({ 
          data: article, 
          message: 'Article updated successfully' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // DELETE /article-api/{id} - 删除文章
    if (req.method === 'DELETE' && articleId) {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId)

      if (error) {
        console.error('Error deleting article:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('Article deleted successfully:', articleId)
      return new Response(
        JSON.stringify({ message: 'Article deleted successfully' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 方法不支持
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})