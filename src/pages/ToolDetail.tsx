import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ExternalLink, Star, Users, Calendar, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  published_at: string;
  view_count: number;
  featured_image_url: string;
  category: Category | null;
}

const ToolDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedTools, setRelatedTools] = useState<Article[]>([]);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const { data: articleData } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          content,
          excerpt,
          slug,
          published_at,
          view_count,
          featured_image_url,
          category_id,
          categories (
            id,
            name,
            slug,
            color
          )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (articleData) {
        const formattedArticle = {
          ...articleData,
          category: articleData.categories
        };
        setArticle(formattedArticle);

        // 更新浏览量
        await supabase
          .from('articles')
          .update({ view_count: (articleData.view_count || 0) + 1 })
          .eq('id', articleData.id);

        // 获取相关工具
        await fetchRelatedTools(articleData.category_id);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedTools = async (categoryId: string) => {
    try {
      const { data: relatedData } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          content,
          excerpt,
          slug,
          published_at,
          view_count,
          featured_image_url,
          categories (
            id,
            name,
            slug,
            color
          )
        `)
        .eq('category_id', categoryId)
        .eq('status', 'published')
        .neq('slug', slug)
        .limit(4);

      if (relatedData) {
        const formattedRelated = relatedData.map(item => ({
          ...item,
          category: item.categories ? {
            id: item.categories.id,
            name: item.categories.name,
            slug: item.categories.slug,
            color: item.categories.color
          } : null
        }));
        setRelatedTools(formattedRelated);
      }
    } catch (error) {
      console.error('Error fetching related tools:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">加载中...</p>
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
        <div className="py-8">
          <div className="container mx-auto px-4 text-center py-16">
            <h1 className="text-2xl font-bold mb-4">工具未找到</h1>
            <p className="text-muted-foreground mb-6">抱歉，您访问的工具页面不存在。</p>
            <Link to="/tools">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回工具列表
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* 返回按钮 */}
          <div className="mb-6">
            <Link to="/tools">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回工具列表
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧主要内容 */}
            <div className="lg:col-span-2">
              {/* 工具头部 */}
              <div className="mb-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold mb-6 text-foreground leading-tight">
                      {article.title}
                    </h1>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(article.published_at)}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50">
                        <Eye className="h-4 w-4" />
                        <span>{article.view_count} 次查看</span>
                      </div>
                    </div>
                    {article.category && (
                      <Badge 
                        className="mb-6 px-4 py-2 text-sm font-medium"
                        style={{ 
                          backgroundColor: `${article.category.color}15`, 
                          color: article.category.color,
                          borderColor: `${article.category.color}30`
                        }}
                      >
                        {article.category.name}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* 工具截图/预览图 */}
                <div className="relative rounded-2xl overflow-hidden mb-8 shadow-lg">
                  <img 
                    src={article.featured_image_url || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=400&fit=crop'} 
                    alt={article.title}
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-white text-sm font-medium">
                        点击右侧按钮体验 {article.title}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 描述内容 */}
              <div className="mb-10">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-6 text-foreground border-b border-border pb-3">
                    Description:
                  </h2>
                </div>
                
                <div className="space-y-6">
                  {article.excerpt && (
                    <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
                      <p className="text-lg leading-relaxed text-foreground font-medium">
                        {article.excerpt}
                      </p>
                    </div>
                  )}
                  
                  <div className="prose prose-lg max-w-none">
                    <div 
                      dangerouslySetInnerHTML={{ __html: article.content }}
                      className="text-muted-foreground leading-8 space-y-6 [&>p]:mb-4 [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-foreground [&>h1]:mt-8 [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:text-foreground [&>h2]:mt-6 [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:font-medium [&>h3]:text-foreground [&>h3]:mt-4 [&>h3]:mb-2 [&>ul]:space-y-2 [&>ol]:space-y-2 [&>li]:ml-4 [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:bg-muted/20 [&>blockquote]:py-2 [&>code]:bg-muted [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>code]:text-sm [&>pre]:bg-muted [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>strong]:font-semibold [&>strong]:text-foreground [&>em]:italic"
                    />
                  </div>
                </div>
              </div>

              {/* 功能特性 */}
              <div className="mb-10">
                <h3 className="text-xl font-bold mb-4 text-foreground border-b border-border pb-2">
                  Key Features:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm font-medium">AI驱动技术</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm font-medium">高效自动化</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm font-medium">易于使用</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm font-medium">多平台支持</span>
                  </div>
                </div>
              </div>

              {/* 标签 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Tags:</h3>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="px-3 py-1 bg-primary/5 border-primary/20 text-primary hover:bg-primary/10">
                    AI工具
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 bg-blue-500/5 border-blue-500/20 text-blue-600 hover:bg-blue-500/10">
                    生产力
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 bg-green-500/5 border-green-500/20 text-green-600 hover:bg-green-500/10">
                    自动化
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 bg-purple-500/5 border-purple-500/20 text-purple-600 hover:bg-purple-500/10">
                    创新
                  </Badge>
                </div>
              </div>
            </div>

            {/* 右侧侧边栏 */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* 访问按钮 */}
                <Card>
                  <CardContent className="p-6">
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      size="lg"
                      onClick={() => window.open('#', '_blank')}
                    >
                      <span className="mr-2">Visit {article.title}</span>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Pricing Model:</span>
                        <Badge variant="outline" className="text-xs">
                          Freemium
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Category:</span>
                        <span className="text-sm font-medium">{article.category?.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Rating:</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">4.5</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Users:</span>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">10K+</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 相关工具 */}
                {relatedTools.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Explore Similar AI Tools:</h3>
                      <div className="space-y-4">
                        {relatedTools.map((tool) => (
                          <Link 
                            key={tool.id} 
                            to={`/tool/${tool.slug}`}
                            className="block group"
                          >
                            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                              <img 
                                src={tool.featured_image_url || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=60&h=60&fit=crop'} 
                                alt={tool.title}
                                className="w-12 h-12 rounded object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                                  {tool.title}
                                </h4>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                  {tool.excerpt}
                                </p>
                              </div>
                              <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ToolDetail;