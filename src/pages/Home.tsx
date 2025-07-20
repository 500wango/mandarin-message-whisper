import { HeroSection } from '@/components/HeroSection';
import { NewsCard } from '@/components/NewsCard';
import { ToolCard } from '@/components/ToolCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, Flame, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  // 模拟数据
  const featuredNews = [
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
    },
    {
      id: '2',
      title: 'Google推出Gemini Ultra商业版，挑战ChatGPT企业市场',
      excerpt: 'Google正式推出Gemini Ultra的商业版本，专门针对企业用户设计，提供更强的安全性和定制化功能...',
      category: '产品发布',
      publishDate: '2024-01-14',
      readTime: '4分钟',
      views: 8920,
      imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop'
    },
    {
      id: '3',
      title: 'AI绘画工具Midjourney新版本支持视频生成功能',
      excerpt: 'Midjourney最新更新加入了视频生成功能，用户现在可以通过文字描述生成短视频内容，为创意工作者提供了新的工具...',
      category: '工具更新',
      publishDate: '2024-01-13',
      readTime: '3分钟',
      views: 15200,
      imageUrl: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=400&fit=crop'
    }
  ];

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredNews.map((news, index) => (
              <div key={news.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <NewsCard {...news} />
              </div>
            ))}
          </div>
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
            <h3 className="text-2xl font-bold mb-4 text-foreground">订阅我们的newsletter</h3>
            <p className="text-muted-foreground mb-6">
              获取最新的AI资讯、工具推荐和行业洞察，每周直达您的邮箱
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="输入您的邮箱地址"
                className="flex-1 px-4 py-2 rounded-lg bg-background border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
              />
              <Button className="bg-primary hover:bg-primary-glow transition-all duration-300 hover:shadow-neon">
                订阅
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;