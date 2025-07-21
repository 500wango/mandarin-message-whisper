import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, Menu, X, Zap, Sparkles, User, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: string;
  sort_order: number;
}

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navigation, setNavigation] = useState<NavigationItem[]>([]);
  const [siteTitle, setSiteTitle] = useState('AI资讯中心');
  const location = useLocation();
  const { user, signOut } = useAuth();

  // 图标映射
  const iconMap: Record<string, any> = {
    Brain,
    Zap,
    Sparkles,
    Menu,
    X,
    User,
    LogIn
  };

  useEffect(() => {
    fetchNavigationItems();
    fetchSiteSettings();
  }, []);

  const fetchNavigationItems = async () => {
    try {
      const { data, error } = await supabase
        .from('navigation_items')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setNavigation(data || []);
    } catch (error) {
      console.error('Error fetching navigation items:', error);
      // 使用默认导航作为后备
      setNavigation([
        { id: '1', name: '首页', href: '/', icon: 'Brain', sort_order: 1 },
        { id: '2', name: 'AI新闻', href: '/news', icon: 'Zap', sort_order: 2 },
        { id: '3', name: 'AI工具', href: '/tools', icon: 'Sparkles', sort_order: 3 },
        { id: '4', name: '提示词库', href: '/prompts', icon: 'Brain', sort_order: 4 },
      ]);
    }
  };

  const fetchSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['site_title', 'site_logo_url']);

      if (error) {
        console.error('Error fetching site settings:', error);
        return;
      }
      
      const settingsMap = data?.reduce((acc: Record<string, string>, item) => {
        acc[item.setting_key] = item.setting_value;
        return acc;
      }, {}) || {};

      if (settingsMap.site_title) setSiteTitle(settingsMap.site_title);
      if (settingsMap.site_logo_url) setSiteLogoUrl(settingsMap.site_logo_url);
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  const [siteLogoUrl, setSiteLogoUrl] = useState('');

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="relative">
            {siteLogoUrl ? (
              <img 
                src={siteLogoUrl} 
                alt="Logo" 
                className="h-8 w-8 object-contain group-hover:scale-110 transition-all duration-300"
              />
            ) : (
              <Brain className="h-8 w-8 text-primary group-hover:animate-glow-pulse transition-all duration-300" />
            )}
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
            {siteTitle}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navigation.map((item) => {
            const IconComponent = iconMap[item.icon] || Brain;
            return (
              <Link
                key={item.id}
                to={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-muted/80 ${
                  isActive(item.href)
                    ? 'bg-muted text-primary shadow-neon'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Auth Section - Only show for authenticated users */}
        <div className="hidden md:flex items-center space-x-4">
          {user && (
            <>
              <Link to="/admin/dashboard">
                <Button variant="outline" size="sm" className="border-primary/20 hover:border-primary hover:shadow-neon transition-all duration-300">
                  <User className="mr-2 h-4 w-4" />
                  管理面板
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => signOut()}
                className="text-muted-foreground hover:text-foreground"
              >
                退出
              </Button>
            </>
          )}
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
              const IconComponent = iconMap[item.icon] || Brain;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-muted text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            {user && (
              <div className="pt-4 pb-2 space-y-2">
                <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full border-primary/20 hover:border-primary">
                    <User className="mr-2 h-4 w-4" />
                    管理面板
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  退出登录
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};