import { Link } from 'react-router-dom';
import { Brain, Github, Twitter, Mail, Rss } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    content: [
      { name: 'AI新闻', href: '/news' },
      { name: 'AI工具', href: '/tools' },
      { name: '提示词工程', href: '/prompts' },
    ],
    company: [
      { name: '关于我们', href: '/about' },
      { name: '联系我们', href: '/contact' },
      { name: '隐私政策', href: '/privacy' },
      { name: '使用条款', href: '/terms' },
    ],
    social: [
      { name: 'GitHub', href: '#', icon: Github },
      { name: 'Twitter', href: '#', icon: Twitter },
      { name: '邮件订阅', href: '#', icon: Mail },
      { name: 'RSS', href: '#', icon: Rss },
    ],
  };

  return (
    <footer className="bg-card/50 border-t border-border/40 backdrop-blur">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
                AI资讯中心
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              专业的AI行业新闻、工具推荐和提示词工程资讯平台，为AI从业者和爱好者提供最新最全的信息。
            </p>
          </div>

          {/* Content Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">内容导航</h3>
            <ul className="space-y-2">
              {footerLinks.content.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">公司信息</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">关注我们</h3>
            <div className="flex space-x-4">
              {footerLinks.social.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="p-2 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-primary transition-all duration-200 hover:shadow-neon"
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © {currentYear} AI资讯中心. 保留所有权利.
          </p>
          <p className="text-muted-foreground text-sm mt-2 md:mt-0">
            专注AI，分享未来
          </p>
        </div>
      </div>
    </footer>
  );
};