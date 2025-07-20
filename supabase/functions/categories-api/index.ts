import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CategoryData {
  name: string;
  slug: string;
  description?: string;
  color: string;
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
    
    console.log('Categories API called:', req.method, req.url)

    const url = new URL(req.url)
    const categoryId = url.pathname.split('/').pop()

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

    // GET /categories-api - 获取分类列表
    if (req.method === 'GET' && !categoryId) {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching categories:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ data: categories }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // GET /categories-api/{id} - 获取单个分类
    if (req.method === 'GET' && categoryId) {
      const { data: category, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single()

      if (error) {
        console.error('Error fetching category:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ data: category }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // POST /categories-api - 创建新分类
    if (req.method === 'POST') {
      const body = await req.json()
      console.log('Creating category with data:', body)

      // 验证必需字段
      if (!body.name || !body.slug) {
        return new Response(
          JSON.stringify({ error: 'Name and slug are required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const categoryData: CategoryData = {
        name: body.name,
        slug: body.slug,
        description: body.description,
        color: body.color || '#8B5CF6'
      }

      const { data: category, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select()
        .single()

      if (error) {
        console.error('Error creating category:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('Category created successfully:', category.id)
      return new Response(
        JSON.stringify({ 
          data: category, 
          message: 'Category created successfully' 
        }),
        { 
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // PUT /categories-api/{id} - 更新分类
    if (req.method === 'PUT' && categoryId) {
      const body = await req.json()
      console.log('Updating category:', categoryId, body)

      // 检查分类是否存在
      const { data: existingCategory, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single()

      if (fetchError || !existingCategory) {
        return new Response(
          JSON.stringify({ error: 'Category not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const updateData: Partial<CategoryData> = {}
      
      // 只更新提供的字段
      if (body.name !== undefined) updateData.name = body.name
      if (body.slug !== undefined) updateData.slug = body.slug
      if (body.description !== undefined) updateData.description = body.description
      if (body.color !== undefined) updateData.color = body.color

      const { data: category, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', categoryId)
        .select()
        .single()

      if (error) {
        console.error('Error updating category:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('Category updated successfully:', categoryId)
      return new Response(
        JSON.stringify({ 
          data: category, 
          message: 'Category updated successfully' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // DELETE /categories-api/{id} - 删除分类
    if (req.method === 'DELETE' && categoryId) {
      // 检查是否有文章使用这个分类
      const { data: articlesWithCategory, error: countError } = await supabase
        .from('articles')
        .select('id')
        .eq('category_id', categoryId)
        .limit(1)

      if (countError) {
        console.error('Error checking category usage:', countError)
        return new Response(
          JSON.stringify({ error: 'Error checking category usage' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      if (articlesWithCategory && articlesWithCategory.length > 0) {
        return new Response(
          JSON.stringify({ error: 'Cannot delete category that is in use by articles' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)

      if (error) {
        console.error('Error deleting category:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('Category deleted successfully:', categoryId)
      return new Response(
        JSON.stringify({ message: 'Category deleted successfully' }),
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