import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ArrowLeft, Save, Eye, Plus, Trash2, FileText } from 'lucide-react';

interface PageContent {
  id: string;
  page_key: string;
  title: string;
  content: any;
  meta_description: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const PageEditor = () => {
  const { pageKey } = useParams<{ pageKey: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    meta_description: '',
    is_published: true,
    content: {} as any
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (pageKey) {
      fetchPageContent();
    }
  }, [user, pageKey, navigate]);

  const fetchPageContent = async () => {
    if (!pageKey) return;
    
    setLoading(true);
    
    const { data, error } = await (supabase as any)
      .from('page_content')
      .select('*')
      .eq('page_key', pageKey)
      .single();
      
    if (error) {
      toast({
        title: "获取页面内容失败",
        description: error.message,
        variant: "destructive",
      });
      navigate('/dashboard');
    } else {
      setPageContent(data);
      setFormData({
        title: data.title,
        meta_description: data.meta_description || '',
        is_published: data.is_published,
        content: data.content
      });
    }
    
    setLoading(false);
  };

  const handleSave = async () => {
    if (!pageContent || !user) return;
    
    setSaving(true);
    
    const { error } = await (supabase as any)
      .from('page_content')
      .update({
        title: formData.title,
        meta_description: formData.meta_description,
        is_published: formData.is_published,
        content: formData.content,
        updated_by: user.id
      })
      .eq('id', pageContent.id);
      
    if (error) {
      toast({
        title: "保存失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "保存成功",
        description: "页面内容已更新",
      });
      fetchPageContent(); // 重新获取最新数据
    }
    
    setSaving(false);
  };

  const updateContentField = (path: string, value: any) => {
    const pathArray = path.split('.');
    const newContent = { ...formData.content };
    let current = newContent;
    
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) {
        current[pathArray[i]] = {};
      }
      current = current[pathArray[i]];
    }
    
    current[pathArray[pathArray.length - 1]] = value;
    
    setFormData(prev => ({
      ...prev,
      content: newContent
    }));
  };

  const addArrayItem = (path: string, newItem: any) => {
    const pathArray = path.split('.');
    const newContent = { ...formData.content };
    let current = newContent;
    
    for (let i = 0; i < pathArray.length - 1; i++) {
      current = current[pathArray[i]];
    }
    
    if (!Array.isArray(current[pathArray[pathArray.length - 1]])) {
      current[pathArray[pathArray.length - 1]] = [];
    }
    
    current[pathArray[pathArray.length - 1]].push(newItem);
    
    setFormData(prev => ({
      ...prev,
      content: newContent
    }));
  };

  const removeArrayItem = (path: string, index: number) => {
    const pathArray = path.split('.');
    const newContent = { ...formData.content };
    let current = newContent;
    
    for (let i = 0; i < pathArray.length - 1; i++) {
      current = current[pathArray[i]];
    }
    
    current[pathArray[pathArray.length - 1]].splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      content: newContent
    }));
  };

  const renderContentEditor = () => {
    if (!formData.content) return null;

    switch (pageKey) {
      case 'about':
        return (
          <div className="space-y-6">
            {/* Hero Section */}
            <Card>
              <CardHeader>
                <CardTitle>首页横幅</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hero-title">标题</Label>
                  <Input
                    id="hero-title"
                    value={formData.content.hero?.title || ''}
                    onChange={(e) => updateContentField('hero.title', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="hero-description">描述</Label>
                  <Textarea
                    id="hero-description"
                    value={formData.content.hero?.description || ''}
                    onChange={(e) => updateContentField('hero.description', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Mission Section */}
            <Card>
              <CardHeader>
                <CardTitle>使命宣言</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="mission-title">标题</Label>
                  <Input
                    id="mission-title"
                    value={formData.content.mission?.title || ''}
                    onChange={(e) => updateContentField('mission.title', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="mission-content">内容</Label>
                  <Textarea
                    id="mission-content"
                    value={formData.content.mission?.content || ''}
                    onChange={(e) => updateContentField('mission.content', e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Features Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>特色功能</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => addArrayItem('features', { title: '新功能', description: '功能描述' })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加功能
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {formData.content.features?.map((feature: any, index: number) => (
                  <Card key={index} className="mb-4">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">功能 {index + 1}</h4>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeArrayItem('features', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label>标题</Label>
                          <Input
                            value={feature.title || ''}
                            onChange={(e) => updateContentField(`features.${index}.title`, e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>描述</Label>
                          <Textarea
                            value={feature.description || ''}
                            onChange={(e) => updateContentField(`features.${index}.description`, e.target.value)}
                            rows={2}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            {/* Hero Section */}
            <Card>
              <CardHeader>
                <CardTitle>页面横幅</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hero-title">标题</Label>
                  <Input
                    id="hero-title"
                    value={formData.content.hero?.title || ''}
                    onChange={(e) => updateContentField('hero.title', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="hero-description">描述</Label>
                  <Textarea
                    id="hero-description"
                    value={formData.content.hero?.description || ''}
                    onChange={(e) => updateContentField('hero.description', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Info Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>联系方式</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => addArrayItem('contactInfo', { title: '新联系方式', content: '', description: '' })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加联系方式
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {formData.content.contactInfo?.map((info: any, index: number) => (
                  <Card key={index} className="mb-4">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">联系方式 {index + 1}</h4>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeArrayItem('contactInfo', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label>标题</Label>
                          <Input
                            value={info.title || ''}
                            onChange={(e) => updateContentField(`contactInfo.${index}.title`, e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>内容</Label>
                          <Input
                            value={info.content || ''}
                            onChange={(e) => updateContentField(`contactInfo.${index}.content`, e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>描述</Label>
                          <Input
                            value={info.description || ''}
                            onChange={(e) => updateContentField(`contactInfo.${index}.description`, e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>JSON 编辑器</CardTitle>
              <CardDescription>直接编辑页面内容的JSON结构</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={JSON.stringify(formData.content, null, 2)}
                onChange={(e) => {
                  try {
                    const parsedContent = JSON.parse(e.target.value);
                    setFormData(prev => ({ ...prev, content: parsedContent }));
                  } catch (error) {
                    // 忽略JSON解析错误，让用户继续编辑
                  }
                }}
                rows={20}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">加载页面内容...</p>
        </div>
      </div>
    );
  }

  if (!pageContent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">页面不存在</h3>
          <p className="text-muted-foreground mb-4">找不到指定的页面内容</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回管理面板
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回
              </Button>
              <div>
                <h1 className="text-3xl font-bold">编辑页面：{formData.title}</h1>
                <p className="text-muted-foreground">页面标识：{pageKey}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => window.open(`/${pageKey}`, '_blank')}
              >
                <Eye className="mr-2 h-4 w-4" />
                预览
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>保存中...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>保存</span>
                  </div>
                )}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="content" className="space-y-6">
            <TabsList>
              <TabsTrigger value="content">页面内容</TabsTrigger>
              <TabsTrigger value="settings">页面设置</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              {renderContentEditor()}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>页面设置</CardTitle>
                  <CardDescription>配置页面的基本信息和SEO设置</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="page-title">页面标题</Label>
                    <Input
                      id="page-title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="meta-description">SEO描述</Label>
                    <Textarea
                      id="meta-description"
                      value={formData.meta_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                      placeholder="用于搜索引擎优化的页面描述"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-published"
                      checked={formData.is_published}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                    />
                    <Label htmlFor="is-published">发布页面</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PageEditor;