import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Cookie, Database, Lock, Users, AlertTriangle, Mail } from 'lucide-react';

const Privacy = () => {
  const sections = [
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
    },
    {
      id: "information-use",
      title: "信息使用",
      icon: Eye,
      content: [
        "提供服务：使用您的信息来提供、维护和改进我们的服务。",
        "个性化体验：根据您的偏好提供个性化的内容推荐。",
        "沟通联系：发送重要通知、更新信息或回应您的询问。",
        "安全保护：检测和防止欺诈、滥用和其他有害活动。",
        "法律合规：遵守适用的法律法规要求。"
      ]
    },
    {
      id: "information-sharing",
      title: "信息共享",
      icon: Users,
      content: [
        "我们不会出售、租赁或以其他方式向第三方披露您的个人信息，除非：",
        "获得您的明确同意",
        "为提供您要求的服务所必需",
        "遵守法律要求或法院命令",
        "保护我们的合法权益或他人的安全",
        "与我们的服务提供商共享，但仅限于提供服务所需"
      ]
    },
    {
      id: "data-security",
      title: "数据安全",
      icon: Lock,
      content: [
        "加密保护：我们使用SSL加密技术保护数据传输安全。",
        "访问控制：严格限制对个人信息的访问权限。",
        "安全监控：持续监控系统安全，及时发现和处理安全威胁。",
        "定期备份：定期备份重要数据，确保数据不丢失。",
        "员工培训：对处理个人信息的员工进行安全培训。"
      ]
    },
    {
      id: "cookie-policy",
      title: "Cookie政策",
      icon: Cookie,
      content: [
        "必要Cookie：保证网站基本功能正常运行。",
        "功能Cookie：记住您的偏好设置，如语言选择。",
        "分析Cookie：帮助我们了解网站使用情况，改进服务质量。",
        "您可以通过浏览器设置管理Cookie，但禁用某些Cookie可能影响网站功能。"
      ]
    },
    {
      id: "user-rights",
      title: "用户权利",
      icon: Shield,
      content: [
        "访问权：您有权了解我们收集和处理的您的个人信息。",
        "更正权：您有权要求更正不准确的个人信息。",
        "删除权：在特定情况下，您有权要求删除您的个人信息。",
        "限制权：您有权要求限制对您个人信息的处理。",
        "携带权：您有权以结构化、常用的格式获取您的个人信息。"
      ]
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
                <Shield className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              隐私政策
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              我们高度重视您的隐私保护。本隐私政策详细说明了我们如何收集、使用、存储和保护您的个人信息。
            </p>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center space-x-2 text-yellow-600 dark:text-yellow-400">
                <AlertTriangle className="h-5 w-5" />
                <p className="font-medium">最后更新时间：2024年7月20日</p>
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