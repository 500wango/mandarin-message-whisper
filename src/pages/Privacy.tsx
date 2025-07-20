import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Cookie, Database, Lock, Users, AlertTriangle, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Privacy = () => {
  const [pageContent, setPageContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPageContent();
  }, []);

  const fetchPageContent = async () => {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_key', 'privacy')
        .eq('is_published', true)
        .single();

      if (error) {
        console.error('Error fetching page content:', error);
        return;
      }

      setPageContent(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-8">
          <div className="container py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">加载中...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 默认内容，如果数据库没有内容则使用
  const defaultSections = [
    {
      id: "information-collection",
      title: "信息收集",
      icon: Database,
      content: [
        "个人信息：当您注册账户、订阅邮件或联系我们时，我们可能收集您的姓名、邮箱地址等个人信息。",
        "使用数据：我们收集您在网站上的浏览行为、点击记录等使用数据，以改善用户体验。",
        "技术信息：包括IP地址、浏览器类型、操作系统、访问时间等技术信息。",
        "Cookie信息：我们使用Cookie来记住您的偏好设置和提供个性化服务。"
      ]
    }
  ];

  const hero = pageContent?.content?.hero || {};
  const sections = pageContent?.content?.sections || defaultSections;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        {/* Hero Section */}
        <section className="container py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
                <Shield className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              {hero.title || '隐私政策'}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {hero.description || '我们高度重视您的隐私保护。本隐私政策详细说明了我们如何收集、使用、存储和保护您的个人信息。'}
            </p>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center space-x-2 text-yellow-600 dark:text-yellow-400">
                <AlertTriangle className="h-5 w-5" />
                <p className="font-medium">{hero.lastUpdated || '最后更新时间：2024年7月20日'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Policy Content */}
        <section className="container py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Card key={section.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-2xl">{section.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                          <p className="text-muted-foreground leading-relaxed">{item}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Additional Information */}
        <section className="container py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-6 w-6 text-primary" />
                    <CardTitle>联系我们</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    如果您对本隐私政策有任何疑问或需要行使您的权利，请通过以下方式联系我们：
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li>邮箱：privacy@ai-news-center.com</li>
                    <li>地址：北京市朝阳区科技园区</li>
                    <li>我们将在收到您的请求后30天内回复</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-6 w-6 text-primary" />
                    <CardTitle>政策更新</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    我们可能会不时更新本隐私政策。重要更新时我们会：
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li>• 在网站显著位置发布通知</li>
                    <li>• 通过邮件通知注册用户</li>
                    <li>• 更新本页面的"最后更新时间"</li>
                    <li>• 继续使用即表示同意新政策</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Legal Compliance */}
        <section className="container py-16">
          <div className="max-w-4xl mx-auto">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">法律依据</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground leading-relaxed">
                  本隐私政策符合《中华人民共和国网络安全法》、《中华人民共和国个人信息保护法》等相关法律法规的要求。
                  我们承诺严格遵守相关法律法规，保护用户的合法权益。
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;