import { ToolCard } from '@/components/ToolCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Search, Filter, Star, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const Tools = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedPricing, setSelectedPricing] = useState('全部');
  const [sortBy, setSortBy] = useState('rating');

  const categories = ['全部', '对话AI', 'AI绘画', 'AI助手', '代码助手', '音频处理', '视频处理', '数据分析'];
  const pricingTypes = ['全部', 'Free', 'Freemium', 'Paid'];

  const tools = [
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
    },
    {
      id: '4',
      name: 'GitHub Copilot',
      description: 'AI驱动的代码补全工具，帮助开发者更快地编写高质量代码',
      category: '代码助手',
      rating: 4.5,
      users: '10M+',
      pricing: 'Paid' as const,
      logoUrl: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=100&h=100&fit=crop',
      websiteUrl: 'https://github.com/features/copilot',
      features: ['智能代码补全', '多语言支持', 'IDE集成', '代码解释']
    },
    {
      id: '5',
      name: 'DALL-E 3',
      description: 'OpenAI的图像生成模型，能根据文字描述创建高质量的原创图像',
      category: 'AI绘画',
      rating: 4.4,
      users: '8M+',
      pricing: 'Freemium' as const,
      logoUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=100&h=100&fit=crop',
      websiteUrl: 'https://openai.com/dall-e-3',
      features: ['文本到图像', '高分辨率', '风格多样', '商业使用']
    },
    {
      id: '6',
      name: 'Notion AI',
      description: '集成在Notion中的AI助手，帮助用户写作、总结、翻译和整理信息',
      category: 'AI助手',
      rating: 4.3,
      users: '20M+',
      pricing: 'Freemium' as const,
      logoUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop',
      websiteUrl: 'https://notion.so',
      features: ['文档编写', '内容总结', '翻译服务', '数据整理']
    }
  ];

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === '全部' || tool.category === selectedCategory;
    const matchesPricing = selectedPricing === '全部' || tool.pricing === selectedPricing;
    return matchesSearch && matchesCategory && matchesPricing;
  });

  const sortedTools = [...filteredTools].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'users':
        return parseInt(b.users.replace(/[^\d]/g, '')) - parseInt(a.users.replace(/[^\d]/g, ''));
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">AI工具推荐</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              发现最优秀的AI工具，提升你的工作效率
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="搜索AI工具..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-muted-foreground mr-2">分类:</span>
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

              {/* Pricing Filter */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-muted-foreground mr-2">定价:</span>
                {pricingTypes.map((pricing) => (
                  <Badge
                    key={pricing}
                    variant={selectedPricing === pricing ? "default" : "outline"}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedPricing === pricing
                        ? 'bg-accent text-accent-foreground'
                        : 'border-border/40 hover:border-accent hover:bg-accent/10'
                    }`}
                    onClick={() => setSelectedPricing(pricing)}
                  >
                    {pricing === 'Free' ? '免费' : pricing === 'Freemium' ? '免费增值' : pricing === 'Paid' ? '付费' : pricing}
                  </Badge>
                ))}
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm font-medium text-muted-foreground">排序:</span>
                <div className="flex gap-1">
                  <Button
                    variant={sortBy === 'rating' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy('rating')}
                    className="text-xs"
                  >
                    <Star className="mr-1 h-3 w-3" />
                    评分
                  </Button>
                  <Button
                    variant={sortBy === 'users' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy('users')}
                    className="text-xs"
                  >
                    <TrendingUp className="mr-1 h-3 w-3" />
                    用户数
                  </Button>
                  <Button
                    variant={sortBy === 'name' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy('name')}
                    className="text-xs"
                  >
                    名称
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTools.map((tool, index) => (
              <div key={tool.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <ToolCard {...tool} />
              </div>
            ))}
          </div>

          {/* No Results */}
          {sortedTools.length === 0 && (
            <div className="text-center py-16">
              <div className="text-muted-foreground text-lg mb-4">
                没有找到匹配的AI工具
              </div>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('全部');
                  setSelectedPricing('全部');
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

export default Tools;