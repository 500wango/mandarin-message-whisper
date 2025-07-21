import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Clock, Eye, User, Calendar } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { marked } from 'marked';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  published_at: string;
  view_count: number;
  featured_image_url?: string;
  meta_title?: string;
  meta_description?: string;
  categories?: {
    name: string;
    color: string;
  };
  profiles?: {
    display_name: string;
    email: string;
  };
}

const Article = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      navigate('/');
      return;
    }
    
    fetchArticle();
  }, [slug, navigate]);

  const fetchArticle = async () => {
    setLoading(true);
    
    try {
      let query = supabase
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
        .eq('status', 'published');

      // 智能判断查询方式
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug!);
      
      if (isUuid) {
        // 如果是UUID格式，按ID查询
        query = query.eq('id', slug);
      } else if (slug && slug.trim() !== '') {
        // 如果是有效的slug，按slug查询
        query = query.eq('slug', slug);
      } else {
        // 如果slug无效，抛出错误
        throw new Error('无效的文章标识符');
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('Database query error:', error);
        throw new Error(`数据库查询错误: ${error.message}`);
      }

      if (!data) {
        throw new Error('文章不存在或未发布');
      }

      setArticle(data);
      
      // 增加浏览量
      await supabase
        .from('articles')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);
        
    } catch (error: any) {
      console.error('Error fetching article:', error);
      toast({
        title: "文章不存在",
        description: error.message || "请检查链接是否正确",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContent = (content: string) => {
    // 配置 marked 选项
    marked.setOptions({
      breaks: true, // 支持换行
      gfm: true, // 支持 GitHub Flavored Markdown
    });

    // 使用 marked 解析 Markdown 并返回 HTML
    return marked(content);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded mb-4"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded mb-8"></div>
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">文章未找到</h1>
            <p className="text-muted-foreground mb-8">抱歉，您访问的文章不存在或已被删除。</p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回首页
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Article Header */}
      <section className="py-8 px-4 border-b border-border/40">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回首页
            </Button>
            
            <div className="space-y-4">
              {article.categories && (
                <Badge 
                  variant="secondary" 
                  className="mb-2"
                  style={{ 
                    backgroundColor: `${article.categories.color}20`, 
                    color: article.categories.color,
                    borderColor: `${article.categories.color}40`
                  }}
                >
                  {article.categories.name}
                </Badge>
              )}
              
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                {article.title}
              </h1>
              
              {article.excerpt && (
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {article.excerpt}
                </p>
              )}
              
              <div className="flex items-center space-x-6 text-sm text-muted-foreground pt-4">
                {article.profiles && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{article.profiles.display_name || article.profiles.email}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(article.published_at)}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>{article.view_count || 0} 次阅读</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            {article.featured_image_url && (
              <div className="mb-8">
                <img
                  src={article.featured_image_url}
                  alt={article.title}
                  className="w-full h-96 object-cover rounded-lg border border-border/40"
                />
              </div>
            )}
            
            <Card className="border-border/40">
              <CardContent className="p-8">
                <div 
                  className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-blockquote:text-muted-foreground prose-code:text-foreground prose-pre:bg-muted prose-a:text-primary hover:prose-a:text-primary/80"
                  dangerouslySetInnerHTML={{ 
                    __html: formatContent(article.content) 
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Article;