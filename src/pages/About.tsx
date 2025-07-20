import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Target, Users, Award, Lightbulb, Globe } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Brain,
      title: "专业AI资讯",
      description: "提供最新、最准确的人工智能行业新闻和趋势分析"
    },
    {
      icon: Target,
      title: "精选工具推荐",
      description: "严格筛选并推荐优质AI工具，帮助用户提高工作效率"
    },
    {
      icon: Lightbulb,
      title: "提示词工程",
      description: "深入研究和分享AI提示词技巧，释放AI工具的最大潜能"
    },
    {
      icon: Users,
      title: "社区驱动",
      description: "建立AI从业者和爱好者交流学习的优质社区平台"
    }
  ];

  const team = [
    {
      name: "技术团队",
      description: "由资深AI工程师和产品专家组成，专注于AI技术研究和应用推广"
    },
    {
      name: "内容团队",
      description: "专业的内容编辑和AI研究员，确保信息的准确性和时效性"
    },
    {
      name: "社区团队",
      description: "致力于维护健康的社区环境，促进用户间的交流与学习"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        {/* Hero Section */}
        <section className="container py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
                <Brain className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              关于AI资讯中心
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              我们是一个专注于人工智能领域的专业资讯平台，致力于为AI从业者、研究员和爱好者提供最新、最全面的行业信息和实用工具推荐。
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="container py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Award className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">我们的使命</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-lg text-muted-foreground leading-relaxed">
                  通过提供高质量的AI资讯、工具推荐和知识分享，帮助更多人了解和应用人工智能技术，
                  推动AI技术的普及和发展，让AI为人类创造更美好的未来。
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">我们的优势</h2>
            <p className="text-muted-foreground text-lg">
              为什么选择AI资讯中心作为您的AI信息来源
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:border-primary/40">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Team Section */}
        <section className="container py-16 bg-muted/30">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">我们的团队</h2>
            <p className="text-muted-foreground text-lg">
              专业、热情、创新的团队为您服务
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Vision Section */}
        <section className="container py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Globe className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-6">未来愿景</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              我们希望成为全球领先的AI资讯平台，不仅提供最新的技术动态和工具推荐，
              更要成为连接AI技术与实际应用的桥梁，帮助企业和个人在AI时代中找到属于自己的位置。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">技术领先</h3>
                <p className="text-muted-foreground">持续跟踪最前沿的AI技术发展</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">应用落地</h3>
                <p className="text-muted-foreground">关注AI技术的实际应用场景</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">社区共建</h3>
                <p className="text-muted-foreground">与用户共同构建AI知识生态</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;