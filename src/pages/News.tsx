import { NewsCard } from '@/components/NewsCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const News = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');

  const categories = ['全部', '行业动态', '产品发布', '技术突破', '政策法规', '投资融资'];

  const newsData = [
    {
      id: '1',
      title: 'OpenAI发布GPT-5预览版，多模态能力大幅提升',
      excerpt: 'OpenAI最新发布的GPT-5预览版在多模态理解、推理能力和安全性方面都有了显著提升，为AI应用带来了新的可能性。新版本在视觉理解、代码生成和数学推理方面表现卓越。',
      category: '产品发布',
      publishDate: '2024-01-15',
      readTime: '5分钟',
      views: 12580,
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
      featured: true
    },
    {
      id: '2',
      title: 'Google推出Gemini Ultra商业版，挑战ChatGPT企业市场',
      excerpt: 'Google正式推出Gemini Ultra的商业版本，专门针对企业用户设计，提供更强的安全性和定制化功能，与OpenAI展开正面竞争。',
      category: '行业动态',
      publishDate: '2024-01-14',
      readTime: '4分钟',
      views: 8920,
      imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop'
    },
    {
      id: '3',
      title: 'AI绘画工具Midjourney新版本支持视频生成功能',
      excerpt: 'Midjourney最新更新加入了视频生成功能，用户现在可以通过文字描述生成短视频内容，为创意工作者提供了全新的创作工具。',
      category: '技术突破',
      publishDate: '2024-01-13',
      readTime: '3分钟',
      views: 15200,
      imageUrl: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=400&fit=crop'
    },
    {
      id: '4',
      title: '欧盟通过AI法案，全球首个AI监管框架正式生效',
      excerpt: '欧盟议会通过了全球首个全面的人工智能监管法案，为AI技术的发展和应用设定了明确的法律框架和伦理标准。',
      category: '政策法规',
      publishDate: '2024-01-12',
      readTime: '6分钟',
      views: 9850,
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop'
    },
    {
      id: '5',
      title: 'Anthropic获得40亿美元投资，估值达180亿美元',
      excerpt: 'AI安全公司Anthropic完成了由Amazon领投的40亿美元融资轮次，公司估值达到180亿美元，将用于扩大Claude AI的研发。',
      category: '投资融资',
      publishDate: '2024-01-11',
      readTime: '4分钟',
      views: 7630,
      imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop'
    },
    {
      id: '6',
      title: '自动驾驶技术突破：新算法实现L4级别完全自主驾驶',
      excerpt: '最新研究显示，通过改进的深度学习算法和传感器融合技术，自动驾驶汽车已能在复杂城市环境中实现L4级别的完全自主驾驶。',
      category: '技术突破',
      publishDate: '2024-01-10',
      readTime: '7分钟',
      views: 11400,
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop'
    }
  ];

  const filteredNews = newsData.filter(news => {
    const matchesSearch = news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         news.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '全部' || news.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">AI新闻资讯</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              获取最新的人工智能行业动态、产品发布和技术突破
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索新闻..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-lg bg-card border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground shadow-neon'
                      : 'border-border/40 hover:border-primary hover:bg-primary/10'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((news, index) => (
              <div key={news.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <NewsCard {...news} />
              </div>
            ))}
          </div>

          {/* Load More */}
          {filteredNews.length > 0 && (
            <div className="mt-12 text-center">
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary/20 hover:border-primary hover:bg-primary/10 transition-all duration-300"
              >
                加载更多新闻
              </Button>
            </div>
          )}

          {/* No Results */}
          {filteredNews.length === 0 && (
            <div className="text-center py-16">
              <div className="text-muted-foreground text-lg mb-4">
                没有找到匹配的新闻
              </div>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('全部');
                }}
                className="border-primary/20 hover:border-primary"
              >
                清除筛选条件
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default News;