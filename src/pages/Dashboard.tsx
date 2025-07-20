import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CategoryManager from '@/components/CategoryManager';
import SiteSettings from '@/pages/SiteSettings';
import { 
  Plus, 
  FileText, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Calendar,
  User,
  TrendingUp,
  Users,
  Shield,
  AlertCircle,
  Mail,
  UserCheck,
  Image,
  Globe,
  Tag,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

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
  id: string;
  display_name: string;
  email: string;
  role: string;
  created_at: string;
}

interface UserProfile {
  display_name: string;
  role: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [pageContents, setPageContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [subscribersLoading, setSubscribersLoading] = useState(false);
  const [pageContentsLoading, setPageContentsLoading] = useState(false);
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
    // 如果是管理员，获取所有用户和订阅者
    if (profile?.role === 'admin') {
      fetchAllUsers();
      fetchSubscribers();
      fetchPageContents();
    }
  }, [user, navigate, profile?.role]);

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

  const fetchAllUsers = async () => {
    if (!user || profile?.role !== 'admin') return;
    
    setUsersLoading(true);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, email, role, created_at')
      .order('created_at', { ascending: false });
      
    if (error) {
      toast({
        title: "获取用户列表失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setAllUsers(data || []);
    }
    
    setUsersLoading(false);
  };

  const fetchSubscribers = async () => {
    if (!user || profile?.role !== 'admin') return;
    
    setSubscribersLoading(true);
    
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      toast({
        title: "获取订阅者列表失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSubscribers(data || []);
    }
    
    setSubscribersLoading(false);
  };

  const fetchPageContents = async () => {
    if (!user || profile?.role !== 'admin') return;
    
    setPageContentsLoading(true);
    
    const { data, error } = await (supabase as any)
      .from('page_content')
      .select('*')
      .order('page_key', { ascending: true });
      
    if (error) {
      toast({
        title: "获取页面内容失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setPageContents(data || []);
    }
    
    setPageContentsLoading(false);
  };

  const fetchArticles = async () => {
    if (!user) return;
    
    setLoading(true);
    
    let query = supabase
      .from('articles')
      .select(`
        *,
        categories (
          name,
          color
        )
      `);
    
    // 如果不是管理员，只显示自己的文章
    if (profile?.role !== 'admin') {
      query = query.eq('author_id', user.id);
    }
    
    const { data, error } = await query.order('updated_at', { ascending: false });
      
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

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);
      
    if (error) {
      toast({
        title: "更新用户角色失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "角色更新成功",
        description: "用户角色已更新",
      });
      fetchAllUsers();
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
      <Header />
      
      <div className="py-8">
      <header className="border-b border-border/40 bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                管理面板
                {profile?.role === 'admin' && (
                  <Badge variant="default" className="bg-red-500/20 text-red-400 border-red-500/30">
                    <Shield className="mr-1 h-3 w-3" />
                    管理员
                  </Badge>
                )}
              </h1>
              <p className="text-muted-foreground">
                欢迎回来，{profile?.display_name || user?.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {profile?.role === 'admin' && (
                <>
                  <Button variant="outline" onClick={() => navigate('/dashboard/media')}>
                    <Image className="mr-2 h-4 w-4" />
                    媒体管理
                  </Button>
                  <Button onClick={() => navigate('/dashboard/editor')}>
                    <Plus className="mr-2 h-4 w-4" />
                    新建文章
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={handleSignOut}>
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {profile?.role !== 'admin' && (
          <Card className="mb-8 border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-yellow-600 dark:text-yellow-400">权限提示</p>
                  <p className="text-sm text-yellow-600/80 dark:text-yellow-400/80">
                    您是普通用户，只能查看文章内容。如需创建或编辑文章，请联系管理员提升权限。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="articles" className="space-y-6">
          <TabsList className={`grid w-full ${profile?.role === 'admin' ? 'grid-cols-6' : 'grid-cols-1'}`}>
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              文章管理
            </TabsTrigger>
            {profile?.role === 'admin' && (
              <>
                <TabsTrigger value="categories" className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  分类管理
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  用户管理
                </TabsTrigger>
                <TabsTrigger value="subscribers" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  订阅管理
                </TabsTrigger>
                <TabsTrigger value="pages" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  页面管理
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  网站设置
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="articles" className="space-y-6">
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {profile?.role === 'admin' ? '全站文章' : '我的文章'}
                  </CardTitle>
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
                <CardTitle>{profile?.role === 'admin' ? '所有文章' : '我的文章'}</CardTitle>
                <CardDescription>
                  {profile?.role === 'admin' ? '管理全站文章内容' : '查看您的文章内容'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {articles.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {profile?.role === 'admin' ? '还没有文章' : '您还没有文章'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {profile?.role === 'admin' 
                        ? '开始创建第一篇文章吧' 
                        : '请联系管理员创建文章'
                      }
                    </p>
                    {profile?.role === 'admin' && (
                      <Button onClick={() => navigate('/dashboard/editor')}>
                        <Plus className="mr-2 h-4 w-4" />
                        新建文章
                      </Button>
                    )}
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
                        
                        {profile?.role === 'admin' && (
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
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            </TabsContent>

            {/* 分类管理 */}
            <TabsContent value="categories">
              <CategoryManager />
            </TabsContent>

          {profile?.role === 'admin' && (
            <>
              <TabsContent value="users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>用户管理</CardTitle>
                    <CardDescription>管理所有用户的角色和权限</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {usersLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">加载用户数据...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {allUsers.map((userProfile) => (
                          <div
                            key={userProfile.id}
                            className="flex items-center justify-between p-4 border border-border/40 rounded-lg"
                          >
                            <div className="flex items-center space-x-4">
                              <User className="h-8 w-8 text-muted-foreground" />
                              <div>
                                <h4 className="font-medium">{userProfile.display_name || userProfile.email}</h4>
                                <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                                <p className="text-xs text-muted-foreground">
                                  注册时间：{formatDate(userProfile.created_at)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge 
                                variant={userProfile.role === 'admin' ? 'destructive' : 'secondary'}
                                className={userProfile.role === 'admin' ? 'bg-red-500/20 text-red-400 border-red-500/30' : ''}
                              >
                                {userProfile.role === 'admin' ? '管理员' : '普通用户'}
                              </Badge>
                              <Select
                                value={userProfile.role}
                                onValueChange={(newRole) => handleUpdateUserRole(userProfile.id, newRole)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">普通用户</SelectItem>
                                  <SelectItem value="admin">管理员</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subscribers" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Newsletter 订阅管理</CardTitle>
                    <CardDescription>管理所有newsletter订阅者</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {subscribersLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">加载订阅者数据...</p>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4 text-green-500" />
                              <span>总订阅数: <span className="font-medium">{subscribers.length}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-blue-500" />
                              <span>活跃订阅: <span className="font-medium">{subscribers.filter(s => s.is_active).length}</span></span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {subscribers.length === 0 ? (
                            <div className="text-center py-8">
                              <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                              <h3 className="text-lg font-medium mb-2">暂无订阅者</h3>
                              <p className="text-muted-foreground">还没有用户订阅newsletter</p>
                            </div>
                          ) : (
                            subscribers.map((subscriber) => (
                              <div
                                key={subscriber.id}
                                className="flex items-center justify-between p-4 border border-border/40 rounded-lg"
                              >
                                <div className="flex items-center space-x-4">
                                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                    subscriber.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                                  }`}>
                                    <Mail className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{subscriber.email}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      订阅时间：{formatDate(subscriber.subscribed_at)}
                                    </p>
                                    {subscriber.ip_address && (
                                      <p className="text-xs text-muted-foreground">
                                        IP: {subscriber.ip_address}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <Badge 
                                    variant={subscriber.is_active ? 'default' : 'secondary'}
                                    className={subscriber.is_active ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
                                  >
                                    {subscriber.is_active ? '活跃' : '已取消'}
                                  </Badge>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pages" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>页面内容管理</CardTitle>
                    <CardDescription>编辑网站公司信息页面的内容</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pageContentsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">加载页面数据...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pageContents.length === 0 ? (
                          <div className="text-center py-8">
                            <Globe className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">暂无页面内容</h3>
                            <p className="text-muted-foreground">页面内容数据还未初始化</p>
                          </div>
                        ) : (
                          pageContents.map((page) => (
                            <div
                              key={page.id}
                              className="flex items-center justify-between p-4 border border-border/40 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="font-medium">{page.title}</h3>
                                  <Badge variant="outline">
                                    {page.page_key}
                                  </Badge>
                                  <Badge 
                                    variant={page.is_published ? 'default' : 'secondary'}
                                    className={page.is_published ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
                                  >
                                    {page.is_published ? '已发布' : '未发布'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground truncate mb-2">
                                  {page.meta_description}
                                </p>
                                <div className="flex items-center text-xs text-muted-foreground space-x-4">
                                  <span className="flex items-center">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {formatDate(page.updated_at)}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/dashboard/page-editor/${page.page_key}`)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  编辑
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(`/${page.page_key}`, '_blank')}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  预览
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <SiteSettings />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;