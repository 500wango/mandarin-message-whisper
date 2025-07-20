import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Shield, AlertTriangle, Scale, Gavel, Mail, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Terms = () => {
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
        .eq('page_key', 'terms')
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
      id: "acceptance",
      title: "接受条款",
      icon: FileText,
      content: [
        "访问和使用本网站即表示您同意遵守本使用条款。",
        "如果您不同意这些条款，请不要使用本网站。"
      ]
    }
  ];

  const defaultProhibitedActivities = [
    "发布虚假、误导或欺诈性信息",
    "侵犯他人知识产权或隐私权"
  ];

  const hero = pageContent?.content?.hero || {};
  const sections = pageContent?.content?.sections || defaultSections;
  const prohibitedActivities = pageContent?.content?.prohibitedActivities || defaultProhibitedActivities;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        {/* Hero Section */}
        <section className="container py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
                <Gavel className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              {hero.title || '使用条款'}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {hero.description || '本使用条款规定了您访问和使用AI资讯中心网站的规则和条件。请仔细阅读这些条款。'}
            </p>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
                <Clock className="h-5 w-5" />
                <p className="font-medium">{hero.effectiveDate || '生效日期：2024年7月20日'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Terms Content */}
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

        {/* Prohibited Activities */}
        <section className="container py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <Card className="border-red-500/30 bg-red-500/5">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                  <CardTitle className="text-2xl text-red-600 dark:text-red-400">禁止行为</CardTitle>
                </div>
                <CardDescription>
                  以下行为被严格禁止，违反者将面临账户暂停或法律后果
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prohibitedActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                      <p className="text-muted-foreground">{activity}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* User Rights and Obligations */}
        <section className="container py-16">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-green-500/30 bg-green-500/5">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Shield className="h-6 w-6 text-green-500" />
                    <CardTitle className="text-green-600 dark:text-green-400">用户权利</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                      <p className="text-muted-foreground">免费访问和使用网站服务</p>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                      <p className="text-muted-foreground">获得技术支持和客户服务</p>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                      <p className="text-muted-foreground">保护个人信息和隐私</p>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                      <p className="text-muted-foreground">随时删除或注销账户</p>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-blue-500/30 bg-blue-500/5">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Users className="h-6 w-6 text-blue-500" />
                    <CardTitle className="text-blue-600 dark:text-blue-400">用户义务</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                      <p className="text-muted-foreground">遵守使用条款和相关法律</p>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                      <p className="text-muted-foreground">提供真实准确的个人信息</p>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                      <p className="text-muted-foreground">保护账户安全和密码</p>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                      <p className="text-muted-foreground">尊重他人权利和网站规则</p>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="container py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">条款相关咨询</CardTitle>
                <CardDescription>
                  如果您对使用条款有任何疑问，请联系我们
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    邮箱：legal@ai-news-center.com
                  </p>
                  <p className="text-muted-foreground">
                    地址：北京市朝阳区科技园区
                  </p>
                  <p className="text-sm text-muted-foreground">
                    我们会在收到您的咨询后尽快回复
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;