import { useState, useEffect } from 'react';
import { HeroSection } from '@/components/HeroSection';
import { NewsCard } from '@/components/NewsCard';
import { ToolCard } from '@/components/ToolCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Clock, Flame, Star, Mail, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [featuredNews, setFeaturedNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "请输入邮箱地址",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "请输入有效的邮箱地址",
        variant: "destructive",
      });
      return;
    }

    setIsSubscribing(true);

    try {
      const { data, error } = await supabase.functions.invoke('newsletter-subscribe', {
        body: { email: email.trim().toLowerCase() }
      });

      if (error) {
        throw error;
      }

      if (data.already_subscribed) {
        toast({
          title: "已经订阅过了",
          description: "该邮箱已经在我们的订阅列表中",
        });
      } else if (data.reactivated) {
        toast({
          title: "重新订阅成功！",
          description: "欢迎回来！您已重新订阅我们的newsletter",
        });
      } else {
        toast({
          title: "订阅成功！",
          description: "感谢您订阅我们的newsletter，我们会定期为您推送最新的AI资讯",
        });
      }

      setEmail(''); // 清空输入框

    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: "订阅失败",
        description: error.message || "订阅时出现错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  useEffect(() => {
    fetchFeaturedArticles();
  }, []);

  const fetchFeaturedArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories (
            name,
            color
          ),
          profiles (
            display_name
          )
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      if (data) {
        const formattedNews = data.map((article: any) => ({
          id: article.id,
          title: article.title,
          excerpt: article.excerpt || article.content.substring(0, 150) + '...',
          category: article.categories?.name || '未分类',
          publishDate: new Date(article.published_at).toLocaleDateString('zh-CN'),
          readTime: `${Math.ceil(article.content.length / 300)}分钟`,
          views: article.view_count || 0,
          imageUrl: article.featured_image_url || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
          slug: article.slug,
          featured: true
        }));
        setFeaturedNews(formattedNews);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      // 如果获取失败，使用模拟数据作为后备
      setFeaturedNews([
        {
          id: '1',
          title: 'OpenAI发布GPT-5预览版，多模态能力大幅提升',
          excerpt: 'OpenAI最新发布的GPT-5预览版在多模态理解、推理能力和安全性方面都有了显著提升，为AI应用带来了新的可能性...',
          category: '行业动态',
          publishDate: '2024-01-15',
          readTime: '5分钟',
          views: 12580,
          imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
          featured: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const popularTools = [
    {
      id: '1',
      name: 'ChatGPT Plus',
      description: 'OpenAI开发的强大对话AI，支持GPT-4模型，适用于写作、编程、分析等多种任务',
      category: '对话AI',
      rating: 4.8,
      users: '100M+',
      pricing: 'Freemium' as const,
      logoUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=100&h=100&fit=crop',
      websiteUrl: 'https://chat.openai.com',
      features: ['GPT-4模型', '多模态输入', 'API接入', '插件生态']
    },
    {
      id: '2',
      name: 'Midjourney',
      description: '业界领先的AI图像生成工具，专为创意设计和艺术创作而生',
      category: 'AI绘画',
      rating: 4.7,
      users: '15M+',
      pricing: 'Paid' as const,
      logoUrl: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=100&h=100&fit=crop',
      websiteUrl: 'https://midjourney.com',
      features: ['高质量图像', '多种风格', '商业许可', '社区分享']
    },
    {
      id: '3',
      name: 'Claude',
      description: 'Anthropic开发的AI助手，注重安全性和准确性，擅长分析和推理任务',
      category: 'AI助手',
      rating: 4.6,
      users: '5M+',
      pricing: 'Freemium' as const,
      logoUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=100&h=100&fit=crop',
      websiteUrl: 'https://claude.ai',
      features: ['长文本处理', '代码分析', '安全对话', '多语言支持']
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured News Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Flame className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">热门资讯</h2>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                最新
              </Badge>
            </div>
            <Button variant="outline" className="border-primary/20 hover:border-primary" asChild>
              <Link to="/news">
                查看全部
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <div className="p-4 bg-card rounded-b-lg border border-t-0">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredNews.map((news, index) => (
                <div key={news.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <NewsCard {...news} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Star className="h-6 w-6 text-accent" />
              <h2 className="text-3xl font-bold text-foreground">热门工具</h2>
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                推荐
              </Badge>
            </div>
            <Button variant="outline" className="border-primary/20 hover:border-primary" asChild>
              <Link to="/tools">
                发现更多
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTools.map((tool, index) => (
              <div key={tool.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <ToolCard {...tool} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto text-center bg-gradient-secondary rounded-2xl p-8 border border-border/40">
            <div className="flex justify-center mb-4">
              <Mail className="h-12 w-12 text-primary animate-glow-pulse" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground">订阅我们的Newsletter</h3>
            <p className="text-muted-foreground mb-6">
              获取最新的AI资讯、工具推荐和行业洞察，每周直达您的邮箱
            </p>
            <form onSubmit={handleNewsletterSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="输入您的邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribing}
                className="flex-1 px-4 py-2 rounded-lg bg-background border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <Button 
                type="submit"
                disabled={isSubscribing}
                className="bg-primary hover:bg-primary-glow transition-all duration-300 hover:shadow-neon disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    订阅中...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    订阅
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;