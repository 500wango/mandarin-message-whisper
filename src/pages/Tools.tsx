import { ToolCard } from '@/components/ToolCard';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const Tools = () => {
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
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-3 mb-8">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">AI工具推荐</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <ToolCard key={tool.id} {...tool} />
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Tools;