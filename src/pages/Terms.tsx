import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Shield, AlertTriangle, Scale, Gavel, Mail, Clock } from 'lucide-react';

const Terms = () => {
  const sections = [
    {
      id: "acceptance",
      title: "接受条款",
      icon: FileText,
      content: [
        "访问和使用本网站即表示您同意遵守本使用条款。",
        "如果您不同意这些条款，请不要使用本网站。",
        "我们有权随时修改这些条款，修改后的条款在发布时生效。",
        "继续使用网站即表示您接受修改后的条款。"
      ]
    },
    {
      id: "website-use",
      title: "网站使用",
      icon: Users,
      content: [
        "本网站仅供合法目的使用，您不得将其用于任何非法活动。",
        "您有责任确保您提供的所有信息准确、真实、完整。",
        "您不得干扰或破坏网站的正常运行或服务器安全。",
        "您不得使用自动化程序大量抓取网站内容。",
        "您同意不发布有害、诽谤、侵权或违法的内容。"
      ]
    },
    {
      id: "intellectual-property",
      title: "知识产权",
      icon: Shield,
      content: [
        "网站的所有内容，包括文字、图片、设计等均受知识产权法保护。",
        "未经明确授权，您不得复制、分发、修改或商业使用网站内容。",
        "用户生成的内容仍归用户所有，但您授予我们使用许可。",
        "我们尊重他人的知识产权，如发现侵权请及时联系我们。",
        "第三方链接的内容不代表我们的观点，其知识产权归原作者所有。"
      ]
    },
    {
      id: "user-accounts",
      title: "用户账户",
      icon: Users,
      content: [
        "您有责任保护您的账户信息和密码安全。",
        "任何通过您账户进行的活动都被视为您的行为。",
        "如发现账户被盗用，请立即联系我们。",
        "我们有权在必要时暂停或删除违规账户。",
        "账户删除后，相关数据可能会被永久删除。"
      ]
    },
    {
      id: "disclaimer",
      title: "免责声明",
      icon: AlertTriangle,
      content: [
        "网站内容仅供参考，我们不保证其完全准确性或时效性。",
        "您使用网站信息的风险由您自行承担。",
        "我们不对因使用网站而导致的任何损失承担责任。",
        "第三方链接和服务由其他公司提供，我们不承担相关责任。",
        "网站可能因维护或其他原因暂时中断服务。"
      ]
    },
    {
      id: "limitation-liability",
      title: "责任限制",
      icon: Scale,
      content: [
        "在法律允许的最大范围内，我们的责任仅限于提供网站服务。",
        "我们不对间接、偶然或后果性损害承担责任。",
        "任何情况下，我们的总责任不超过您支付给我们的费用。",
        "某些司法管辖区不允许责任限制，此类限制可能不适用于您。"
      ]
    },
    {
      id: "governing-law",
      title: "适用法律",
      icon: Gavel,
      content: [
        "本条款受中华人民共和国法律管辖。",
        "因本条款产生的争议应通过友好协商解决。",
        "无法协商解决的争议应提交有管辖权的人民法院裁决。",
        "条款的部分无效不影响其他条款的效力。"
      ]
    }
  ];

  const prohibitedActivities = [
    "发布虚假、误导或欺诈性信息",
    "侵犯他人知识产权或隐私权",
    "发布恶意软件或病毒",
    "进行网络攻击或破坏活动",
    "滥用网站功能或服务",
    "违反相关法律法规的行为"
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
                <Gavel className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              使用条款
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              本使用条款规定了您访问和使用AI资讯中心网站的规则和条件。请仔细阅读这些条款。
            </p>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
                <Clock className="h-5 w-5" />
                <p className="font-medium">生效日期：2024年7月20日</p>
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