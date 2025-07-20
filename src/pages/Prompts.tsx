import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Copy, Search, Plus, Star, TrendingUp, Zap, MessageSquare, Code, PenTool, Lightbulb } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  rating: number;
  usage: number;
}

export default function Prompts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: '全部', icon: Brain },
    { id: 'writing', name: '写作', icon: PenTool },
    { id: 'coding', name: '编程', icon: Code },
    { id: 'creative', name: '创意', icon: Lightbulb },
    { id: 'analysis', name: '分析', icon: TrendingUp },
    { id: 'conversation', name: '对话', icon: MessageSquare },
  ];

  const promptTemplates: PromptTemplate[] = [
    {
      id: '1',
      title: '技术文章写作助手',
      description: '帮助你创建高质量的技术文章和教程',
      content: '请以技术专家的身份，为我写一篇关于 {{主题}} 的详细技术文章。文章应该包含：\n\n1. 概述和背景介绍\n2. 核心概念解释\n3. 实际应用示例\n4. 最佳实践建议\n5. 总结和未来展望\n\n请确保文章结构清晰，内容准确，适合中级技术人员阅读。',
      category: 'writing',
      tags: ['技术写作', '教程', '文档'],
      rating: 4.8,
      usage: 1234
    },
    {
      id: '2',
      title: '代码审查专家',
      description: '深度分析代码质量，提供改进建议',
      content: '请作为资深软件工程师，对以下代码进行全面审查：\n\n```{{编程语言}}\n{{代码内容}}\n```\n\n请从以下角度进行分析：\n1. 代码质量和可读性\n2. 性能优化建议\n3. 安全性考虑\n4. 最佳实践合规性\n5. 重构建议\n\n请提供具体的改进建议和优化后的代码示例。',
      category: 'coding',
      tags: ['代码审查', '优化', '重构'],
      rating: 4.9,
      usage: 2156
    },
    {
      id: '3',
      title: '创意营销文案生成器',
      description: '为产品或服务创建吸引人的营销文案',
      content: '请为 {{产品/服务名称}} 创作一系列创意营销文案。\n\n产品信息：\n- 产品类型：{{产品类型}}\n- 目标受众：{{目标受众}}\n- 核心卖点：{{核心卖点}}\n- 品牌调性：{{品牌调性}}\n\n请提供：\n1. 5个吸引眼球的标题\n2. 3个不同长度的产品描述（短、中、长）\n3. 社交媒体推广文案\n4. 广告语建议\n\n文案要求有创意、有说服力，符合目标受众的喜好。',
      category: 'creative',
      tags: ['营销', '文案', '创意'],
      rating: 4.7,
      usage: 987
    },
    {
      id: '4',
      title: '数据分析报告助手',
      description: '将复杂数据转化为清晰的分析报告',
      content: '请基于以下数据，生成一份专业的分析报告：\n\n数据概述：{{数据描述}}\n关键指标：{{关键指标}}\n时间范围：{{时间范围}}\n\n报告结构要求：\n1. 执行摘要\n2. 数据概况\n3. 趋势分析\n4. 关键发现\n5. 问题识别\n6. 改进建议\n7. 结论和下一步行动\n\n请用专业但易懂的语言，结合图表说明（请描述建议的图表类型），为管理层提供决策支持。',
      category: 'analysis',
      tags: ['数据分析', '报告', '商业智能'],
      rating: 4.6,
      usage: 756
    },
    {
      id: '5',
      title: '智能对话机器人',
      description: '创建专业领域的对话机器人',
      content: '请扮演 {{领域}} 专家，为用户提供专业咨询服务。\n\n角色设定：\n- 专业背景：{{专业背景}}\n- 服务风格：{{服务风格}}\n- 知识范围：{{知识范围}}\n\n对话要求：\n1. 始终保持专业和友好的态度\n2. 提供准确、有价值的信息\n3. 根据用户需求调整回答深度\n4. 适时提出相关问题以更好地帮助用户\n5. 如遇到专业范围外的问题，诚实说明并建议其他资源\n\n现在请开始对话，介绍自己并询问用户需要什么帮助。',
      category: 'conversation',
      tags: ['对话', '客服', '专家咨询'],
      rating: 4.5,
      usage: 1489
    }
  ];

  const filteredPrompts = promptTemplates.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    // TODO: 添加 toast 通知
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* 页面头部 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Brain className="h-12 w-12 text-primary animate-glow-pulse" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            AI 提示词工程
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            精选高质量提示词模板，帮你更好地与AI对话，提升工作效率
          </p>
        </div>

        {/* 搜索和筛选 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="搜索提示词模板..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {category.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 提示词模板网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map((prompt) => (
            <Card key={prompt.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {prompt.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {prompt.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {prompt.rating}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {prompt.usage.toLocaleString()} 次使用
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {prompt.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-3 max-h-32 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap text-muted-foreground">
                      {prompt.content.length > 150 
                        ? prompt.content.substring(0, 150) + '...'
                        : prompt.content
                      }
                    </pre>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(prompt.content)}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      复制
                    </Button>
                    <Button variant="default" size="sm" className="flex-1">
                      <Zap className="h-4 w-4 mr-2" />
                      使用
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 创建自定义提示词 */}
        <Card className="mt-12 border-dashed border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Plus className="h-5 w-5" />
              创建自定义提示词
            </CardTitle>
            <CardDescription>
              根据你的需求定制专属的AI提示词模板
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="提示词标题" />
                <Input placeholder="分类标签" />
              </div>
              <Textarea 
                placeholder="请输入你的提示词内容..."
                className="min-h-32"
              />
              <div className="flex justify-center">
                <Button className="w-full md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  保存提示词
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}