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
        // 清理数据中的JSON代码
        const cleanTitle = articleData.title || 'AI工具';
        const cleanExcerpt = articleData.excerpt && !articleData.excerpt.includes('json') && !articleData.excerpt.includes('"title"') 
          ? articleData.excerpt 
          : '';
        
        const formattedArticle = {
          ...articleData,
          title: cleanTitle,
          excerpt: cleanExcerpt,
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
                  {article.excerpt && !article.excerpt.includes('json') && !article.excerpt.includes('"title"') && (
                    <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
                      <p className="text-lg leading-relaxed text-foreground font-medium">
                        {article.excerpt}
                      </p>
                    </div>
                  )}
                  
                  {/* 动态显示清理后的内容 */}
                  <div className="prose prose-lg max-w-none">
                    <div className="text-muted-foreground leading-8 space-y-6">
                      {(() => {
                        let content = article.content || '';
                        
                        // 智能清理内容
                        content = content
                          // 移除JSON代码块
                          .replace(/```json[\s\S]*?```/g, '')
                          .replace(/json\s*\{[\s\S]*?\}/g, '')
                          // 移除技术标记
                          .replace(/#{1,6}\s*/g, '')
                          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除markdown链接但保留文本
                          .replace(/https?:\/\/[^\s\)]+/g, '') // 移除URL
                          // 格式化markdown
                          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                          // 处理特殊符号
                          .replace(/[🚀⚡🎯📱💡🔧]/g, '')
                          // 清理多余空行
                          .replace(/\n\s*\n\s*\n/g, '\n\n')
                          .trim();
                        
                        // 如果清理后内容太短或为空，生成基于标题的动态内容
                        if (!content || content.length < 50) {
                          const toolName = article.title || 'AI工具';
                          return (
                            <div className="space-y-6">
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">🚀 关于 {toolName}</h4>
                                <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                                  {toolName} 是一款功能强大的AI工具，专为提升工作效率和创造力而设计。
                                  通过集成最新的人工智能技术，为用户提供智能化的解决方案。
                                </p>
                              </div>
                              
                              <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-foreground">✨ 主要特点</h4>
                                  <ul className="space-y-2 text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                      <span className="text-primary">•</span>
                                      <span>先进的AI技术驱动</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <span className="text-primary">•</span>
                                      <span>直观易用的用户界面</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <span className="text-primary">•</span>
                                      <span>高效的处理能力</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <span className="text-primary">•</span>
                                      <span>多场景应用支持</span>
                                    </li>
                                  </ul>
                                </div>
                                
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-foreground">🎯 使用场景</h4>
                                  <ul className="space-y-2 text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                      <span className="text-primary">•</span>
                                      <span>日常工作自动化</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <span className="text-primary">•</span>
                                      <span>创意内容生成</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <span className="text-primary">•</span>
                                      <span>数据分析处理</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <span className="text-primary">•</span>
                                      <span>团队协作提效</span>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        
                        // 如果有有效内容，智能分段展示
                        const paragraphs = content.split('\n\n').filter(p => p.trim());
                        
                        return (
                          <div className="space-y-4">
                            {paragraphs.map((paragraph, index) => {
                              // 检查是否为标题格式
                              if (paragraph.includes(':') && paragraph.length < 100) {
                                return (
                                  <h4 key={index} className="text-lg font-semibold text-foreground mt-6 mb-3"
                                      dangerouslySetInnerHTML={{ __html: paragraph }} />
                                );
                              }
                              
                              // 普通段落
                              return (
                                <p key={index} className="leading-relaxed" 
                                   dangerouslySetInnerHTML={{ __html: paragraph }} />
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* 工具亮点 */}
              <div className="mb-10">
                <h3 className="text-xl font-bold mb-6 text-foreground border-b border-border pb-2">
                  Why Choose This Tool:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-5 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">⚡</span>
                      </div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">高效便捷</h4>
                    </div>
                    <p className="text-sm text-blue-800 dark:text-blue-200">简单易用的界面设计，快速上手无需学习成本</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-5 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">🎯</span>
                      </div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100">精准智能</h4>
                    </div>
                    <p className="text-sm text-green-800 dark:text-green-200">基于最新AI技术驱动，提供准确可靠的结果</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-5 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">🔧</span>
                      </div>
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100">功能丰富</h4>
                    </div>
                    <p className="text-sm text-purple-800 dark:text-purple-200">满足多种使用场景需求，一站式解决方案</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 p-5 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">📱</span>
                      </div>
                      <h4 className="font-semibold text-orange-900 dark:text-orange-100">跨平台支持</h4>
                    </div>
                    <p className="text-sm text-orange-800 dark:text-orange-200">支持多设备访问使用，随时随地提升效率</p>
                  </div>
                </div>
              </div>

              {/* 使用提示 */}
              <div className="mb-10">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-xl border-l-4 border-primary">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary text-lg">💡</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">使用提示</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        点击右侧的访问按钮即可直接跳转到工具官网，开始体验强大的AI功能。
                        建议首次使用时先了解基本功能，再根据需求探索高级特性。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 标签 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Tags:</h3>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="px-4 py-2 bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 transition-colors">
                    AI工具
                  </Badge>
                  <Badge variant="outline" className="px-4 py-2 bg-blue-500/5 border-blue-500/20 text-blue-600 hover:bg-blue-500/10 transition-colors">
                    生产力
                  </Badge>
                  <Badge variant="outline" className="px-4 py-2 bg-green-500/5 border-green-500/20 text-green-600 hover:bg-green-500/10 transition-colors">
                    自动化
                  </Badge>
                  <Badge variant="outline" className="px-4 py-2 bg-purple-500/5 border-purple-500/20 text-purple-600 hover:bg-purple-500/10 transition-colors">
                    创新科技
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
                                  {tool.excerpt && !tool.excerpt.includes('json') && !tool.excerpt.includes('"title"') 
                                    ? tool.excerpt 
                                    : '发现这个强大的AI工具'}
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