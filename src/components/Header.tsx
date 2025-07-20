import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, Menu, X, Zap, Sparkles } from 'lucide-react';

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: '首页', href: '/', icon: Brain },
    { name: 'AI新闻', href: '/news', icon: Zap },
    { name: 'AI工具', href: '/tools', icon: Sparkles },
    { name: '提示词工程', href: '/prompts', icon: Brain },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="relative">
            <Brain className="h-8 w-8 text-primary group-hover:animate-glow-pulse transition-all duration-300" />
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
            AI资讯中心
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-muted/80 ${
                  isActive(item.href)
                    ? 'bg-muted text-primary shadow-neon'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* CTA Button */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline" size="sm" className="border-primary/20 hover:border-primary hover:shadow-neon transition-all duration-300">
            订阅更新
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-card/95 backdrop-blur border-b border-border/40">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-muted text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <div className="pt-4 pb-2">
              <Button variant="outline" size="sm" className="w-full border-primary/20 hover:border-primary">
                订阅更新
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};