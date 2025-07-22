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
        // 解析JSON格式的excerpt
        const parseExcerpt = (excerpt: string) => {
          if (!excerpt) return '';
          
          // 检查是否为JSON格式
          if (excerpt.trim().startsWith('```json') || excerpt.trim().startsWith('{')) {
            try {
              // 处理markdown代码块
              let jsonStr = excerpt.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
              
              // 如果以{开头，尝试直接解析
              if (jsonStr.startsWith('{')) {
                const parsed = JSON.parse(jsonStr);
                return parsed.description || '';
              }
              
              return '';
            } catch (error) {
              return '';
            }
          }
          
          return excerpt;
        };
        
        const formattedArticle = {
          ...articleData,
          title: articleData.title || 'AI工具',
          excerpt: parseExcerpt(articleData.excerpt),
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
                  
                  {/* 动态显示清理后的内容 */}
                  <div className="prose prose-lg max-w-none">
                    <div className="text-muted-foreground leading-8 space-y-6">
                      {(() => {
                        let content = article.content || '';
                        
                         // 智能处理内容，先尝试解析JSON并提取工具链接
                         const parseContentJSON = () => {
                           // 检查content中的JSON代码块
                           const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
                           if (jsonMatch) {
                             try {
                               const parsed = JSON.parse(jsonMatch[1]);
                               if (parsed.description) {
                                 // 将JSON块替换为解析后的描述
                                 content = content.replace(/```json[\s\S]*?```/, parsed.description);
                               }
                             } catch (error) {
                               // JSON解析失败，移除JSON块
                               content = content.replace(/```json[\s\S]*?```/g, '');
                             }
                           }
                         };
                         
                         parseContentJSON();
                         
                         // 提取工具访问链接
                         let toolLink = '';
                         const linkMatch = content.match(/\[([^\]]*(?:立即使用|Visit)[^\]]*)\]\(([^)]+)\)/);
                         if (linkMatch) {
                           toolLink = linkMatch[2]; // 提取URL
                         }
                         
                         // 清理其他格式
                         content = content
                           // 移除重复的标题（如果与页面标题相同）
                           .replace(new RegExp(`^#\\s*${article.title}\\s*\\n`, 'gm'), '')
                           .replace(new RegExp(`^!\\[${article.title}\\].*\\n`, 'gm'), '')
                           // 移除markdown标题标记和常见标题
                           .replace(/^#{1,6}\s+(.+)$/gm, '') 
                           .replace(/^(工具介绍|访问工具|工具特点|使用提示)[\s\n]*/gm, '')
                           // 移除所有markdown链接
                           .replace(/\[([^\]]+)\]\([^)]+\)/g, '')
                           // 移除图片
                           .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
                           // 移除URL
                           .replace(/https?:\/\/[^\s\)]+/g, '')
                           // 移除emoji和特殊符号行
                           .replace(/^[-\s]*[🚀⚡🎯📱💡🔧]\s*\*\*[^*]+\*\*.*$/gm, '')
                           // 移除分隔线
                           .replace(/^---+$/gm, '')
                           // 格式化markdown
                           .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                           .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                           // 清理多余空行
                           .replace(/\n\s*\n\s*\n/g, '\n\n')
                           .trim();
                         
                         // 如果提取到了工具链接，在内容开头添加
                         if (toolLink) {
                           content = `__VISIT_TOOL__${toolLink}__END__\n\n${content}`;
                         }
                        
                         // 如果清理后内容太短或为空，根据工具类别和名称生成针对性内容
                         if (!content || content.length < 50) {
                           const toolName = article.title || 'AI工具';
                           const categoryName = article.category?.name || '';
                           
                           // 根据不同类别生成不同的特点描述
                           const generateFeaturesByCategory = () => {
                             const toolNameLower = toolName.toLowerCase();
                             const categoryLower = categoryName.toLowerCase();
                             
                             // 视频类工具
                             if (toolNameLower.includes('video') || toolNameLower.includes('视频') || 
                                 categoryLower.includes('video') || categoryLower.includes('视频')) {
                               return {
                                 description: `${toolName} 是一款专业的AI视频制作工具，利用先进的人工智能技术，让视频创作变得简单高效。`,
                                 features: [
                                   '智能视频生成技术',
                                   '丰富的模板素材库', 
                                   '自动剪辑优化功能',
                                   '高质量输出效果'
                                 ],
                                 scenarios: [
                                   '营销宣传视频制作',
                                   '教育培训内容',
                                   '社交媒体短视频',
                                   '企业品牌推广'
                                 ]
                               };
                             }
                             
                             // 文字/写作类工具
                             if (toolNameLower.includes('write') || toolNameLower.includes('text') || toolNameLower.includes('写作') ||
                                 categoryLower.includes('写作') || categoryLower.includes('文本')) {
                               return {
                                 description: `${toolName} 是一款智能写作助手，运用先进的自然语言处理技术，帮助用户快速生成高质量文本内容。`,
                                 features: [
                                   '智能内容生成',
                                   '多风格写作支持',
                                   '实时语法检查',
                                   '创意灵感启发'
                                 ],
                                 scenarios: [
                                   '文章博客创作',
                                   '营销文案撰写',
                                   '学术论文辅助',
                                   '创意故事编写'
                                 ]
                               };
                             }
                             
                             // 图像/设计类工具
                             if (toolNameLower.includes('image') || toolNameLower.includes('design') || toolNameLower.includes('图像') ||
                                 categoryLower.includes('设计') || categoryLower.includes('图像')) {
                               return {
                                 description: `${toolName} 是一款创新的AI图像设计工具，结合深度学习算法，为用户提供专业级的视觉创作体验。`,
                                 features: [
                                   'AI智能生成图像',
                                   '多样化设计风格',
                                   '高精度图像处理',
                                   '批量编辑功能'
                                 ],
                                 scenarios: [
                                   '品牌视觉设计',
                                   '社交媒体配图',
                                   '电商产品图片',
                                   '艺术创作探索'
                                 ]
                               };
                             }
                             
                             // 音频类工具
                             if (toolNameLower.includes('audio') || toolNameLower.includes('voice') || toolNameLower.includes('音频') ||
                                 categoryLower.includes('音频') || categoryLower.includes('语音')) {
                               return {
                                 description: `${toolName} 是一款先进的AI音频处理工具，运用机器学习技术提供专业的音频编辑和生成服务。`,
                                 features: [
                                   'AI语音合成技术',
                                   '智能降噪处理',
                                   '多语言支持',
                                   '音质优化算法'
                                 ],
                                 scenarios: [
                                   '播客内容制作',
                                   '有声读物录制',
                                   '多媒体配音',
                                   '语音助手开发'
                                 ]
                               };
                             }
                             
                             // 代码/开发类工具
                             if (toolNameLower.includes('code') || toolNameLower.includes('dev') || toolNameLower.includes('代码') ||
                                 categoryLower.includes('开发') || categoryLower.includes('编程')) {
                               return {
                                 description: `${toolName} 是一款智能编程助手，利用AI技术帮助开发者提高编码效率和代码质量。`,
                                 features: [
                                   'AI代码生成',
                                   '智能错误检测',
                                   '代码优化建议',
                                   '多语言支持'
                                 ],
                                 scenarios: [
                                   '快速原型开发',
                                   '代码审查优化',
                                   '学习编程辅助',
                                   '项目架构设计'
                                 ]
                               };
                             }
                             
                             // 默认通用描述
                             return {
                               description: `${toolName} 是一款创新的AI工具，专注于为用户提供智能化的解决方案，提升工作效率和创造力。`,
                               features: [
                                 '智能AI技术驱动',
                                 '用户友好的界面',
                                 '高效处理能力',
                                 '灵活应用场景'
                               ],
                               scenarios: [
                                 '提升工作效率',
                                 '优化工作流程',
                                 '创新解决方案',
                                 '智能化处理'
                               ]
                             };
                           };
                           
                           const toolInfo = generateFeaturesByCategory();
                           
                           return (
                             <div className="space-y-6">
                               <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                                 <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">🚀 关于 {toolName}</h4>
                                 <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                                   {toolInfo.description}
                                 </p>
                               </div>
                               
                               <div className="grid md:grid-cols-2 gap-6">
                                 <div className="space-y-4">
                                   <h4 className="font-semibold text-foreground">✨ 主要特点</h4>
                                   <ul className="space-y-2 text-muted-foreground">
                                     {toolInfo.features.map((feature, index) => (
                                       <li key={index} className="flex items-start gap-2">
                                         <span className="text-primary">•</span>
                                         <span>{feature}</span>
                                       </li>
                                     ))}
                                   </ul>
                                 </div>
                                 
                                 <div className="space-y-4">
                                   <h4 className="font-semibold text-foreground">🎯 使用场景</h4>
                                   <ul className="space-y-2 text-muted-foreground">
                                     {toolInfo.scenarios.map((scenario, index) => (
                                       <li key={index} className="flex items-start gap-2">
                                         <span className="text-primary">•</span>
                                         <span>{scenario}</span>
                                       </li>
                                     ))}
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
                               // 处理工具访问链接
                               if (paragraph.includes('__VISIT_TOOL__')) {
                                 const linkMatch = paragraph.match(/__VISIT_TOOL__(.+?)__END__/);
                                 if (linkMatch) {
                                   const url = linkMatch[1];
                                   return (
                                     <div key={index} className="my-6">
                                       <a
                                         href={url}
                                         target="_blank"
                                         rel="noopener noreferrer"
                                         className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                                       >
                                         <ExternalLink className="h-4 w-4" />
                                         立即体验 {article.title}
                                       </a>
                                     </div>
                                   );
                                 }
                               }
                               
                               // 跳过空段落、特殊标记和不需要的内容
                               if (!paragraph.trim() || 
                                   paragraph.includes('__') ||
                                   paragraph.includes('工具介绍') || 
                                   paragraph.includes('访问工具') || 
                                   paragraph.includes('工具特点') ||
                                   paragraph.includes('使用提示') ||
                                   paragraph === article.title ||
                                   paragraph.startsWith('!') ||
                                   paragraph.includes('```') ||
                                   paragraph.match(/^[-\s]*[🚀⚡🎯📱💡🔧]/)) {
                                 return null;
                               }
                               
                               // 普通段落
                               return (
                                 <p key={index} className="leading-relaxed text-muted-foreground" 
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