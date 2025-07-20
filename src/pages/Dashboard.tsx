import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  FileText, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Calendar,
  User,
  TrendingUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  view_count: number;
  categories?: {
    name: string;
    color: string;
  };
}

interface Profile {
  display_name: string;
  role: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    totalViews: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchProfile();
    fetchArticles();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('display_name, role')
      .eq('id', user.id)
      .single();
      
    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
    }
  };

  const fetchArticles = async () => {
    if (!user) return;
    
    setLoading(true);
    
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories (
          name,
          color
        )
      `)
      .eq('author_id', user.id)
      .order('updated_at', { ascending: false });
      
    if (error) {
      toast({
        title: "获取文章失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setArticles(data || []);
      
      // 计算统计数据
      const total = data?.length || 0;
      const published = data?.filter(a => a.status === 'published').length || 0;
      const drafts = data?.filter(a => a.status === 'draft').length || 0;
      const totalViews = data?.reduce((sum, a) => sum + (a.view_count || 0), 0) || 0;
      
      setStats({ total, published, drafts, totalViews });
    }
    
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteArticle = async (id: string) => {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);
      
    if (error) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "删除成功",
        description: "文章已删除",
      });
      fetchArticles();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">已发布</Badge>;
      case 'draft':
        return <Badge variant="secondary">草稿</Badge>;
      case 'archived':
        return <Badge variant="outline" className="border-orange-500/30 text-orange-400">已归档</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">管理面板</h1>
              <p className="text-muted-foreground">
                欢迎回来，{profile?.display_name || user?.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigate('/dashboard/editor')}>
                <Plus className="mr-2 h-4 w-4" />
                新建文章
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总文章数</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已发布</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{stats.published}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">草稿</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{stats.drafts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总浏览量</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalViews}</div>
            </CardContent>
          </Card>
        </div>

        {/* 文章列表 */}
        <Card>
          <CardHeader>
            <CardTitle>我的文章</CardTitle>
            <CardDescription>管理您的所有文章内容</CardDescription>
          </CardHeader>
          <CardContent>
            {articles.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">还没有文章</h3>
                <p className="text-muted-foreground mb-4">
                  开始创建您的第一篇文章吧
                </p>
                <Button onClick={() => navigate('/dashboard/editor')}>
                  <Plus className="mr-2 h-4 w-4" />
                  新建文章
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between p-4 border border-border/40 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium truncate">{article.title}</h3>
                        {getStatusBadge(article.status)}
                        {article.categories && (
                          <Badge 
                            variant="outline" 
                            style={{ 
                              borderColor: article.categories.color + '50', 
                              color: article.categories.color 
                            }}
                          >
                            {article.categories.name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-2">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground space-x-4">
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatDate(article.updated_at)}
                        </span>
                        <span className="flex items-center">
                          <Eye className="mr-1 h-3 w-3" />
                          {article.view_count} 浏览
                        </span>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(`/dashboard/editor/${article.id}`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => window.open(`/article/${article.slug}`, '_blank')}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          预览
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteArticle(article.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;