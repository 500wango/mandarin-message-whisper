import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Send, Eye, ImageIcon, Grid } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video';
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

interface ArticleData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  category_id: string | null;
  meta_title: string;
  meta_description: string;
  featured_image_url: string;
}

const ArticleEditor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [articleData, setArticleData] = useState<ArticleData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    status: 'draft',
    category_id: null,
    meta_title: '',
    meta_description: '',
    featured_image_url: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/admin/auth');
      return;
    }
    
    fetchCategories();
    fetchMediaFiles();
    
    if (isEditing) {
      fetchArticle();
    }
  }, [user, navigate, id, isEditing]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  const fetchMediaFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('type', 'image')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // 类型转换以符合 MediaFile 接口
      const typedData: MediaFile[] = (data || []).map(item => ({
        ...item,
        type: item.type as 'image' | 'video'
      }));
      
      setMediaFiles(typedData);
    } catch (error: any) {
      console.error('Error fetching media files:', error);
    }
  };

  const fetchArticle = async () => {
    if (!id) return;
    
    setLoading(true);
    
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      toast({
        title: "获取文章失败",
        description: error.message,
        variant: "destructive",
      });
      navigate('/admin/dashboard');
    } else {
      setArticleData({
        title: data.title || '',
        slug: data.slug || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        status: (data.status as 'draft' | 'published' | 'archived') || 'draft',
        category_id: data.category_id || null,
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || '',
        featured_image_url: data.featured_image_url || ''
      });
    }
    
    setLoading(false);
  };

  const generateSlug = async (title: string) => {
    if (!title.trim()) {
      // 如果标题为空，生成随机slug
      return 'article-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    let baseSlug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    // 如果生成的slug为空，使用随机值
    if (!baseSlug) {
      return 'article-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // 检查slug是否已存在
    let finalSlug = baseSlug;
    let counter = 1;
    
    while (true) {
      const { data: existingArticles } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', finalSlug);
      
      // 如果没有找到重复的，或者找到的是当前编辑的文章，则使用这个slug
      if (!existingArticles || existingArticles.length === 0 || 
          (isEditing && existingArticles.length === 1 && existingArticles[0].id === id)) {
        break;
      }
      
      // 如果找到重复的，添加数字后缀
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return finalSlug;
  };

  const handleTitleChange = async (title: string) => {
    const newSlug = !isEditing ? await generateSlug(title) : articleData.slug;
    setArticleData(prev => ({
      ...prev,
      title,
      slug: newSlug,
      meta_title: !prev.meta_title ? title : prev.meta_title
    }));
  };

  const insertImageAtCursor = (imageUrl: string, altText: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const textBefore = articleData.content.substring(0, cursorPosition);
    const textAfter = articleData.content.substring(cursorPosition);
    const imageMarkdown = `![${altText}](${imageUrl})`;
    
    const newContent = textBefore + imageMarkdown + textAfter;
    setArticleData(prev => ({ ...prev, content: newContent }));
    
    // 重新定位光标到插入的图片之后
    setTimeout(() => {
      const newCursorPosition = cursorPosition + imageMarkdown.length;
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      textarea.focus();
    }, 0);
  };

  const getFileUrl = (file: MediaFile) => {
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(file.file_path);
    return publicUrl;
  };

  const handleImageSelect = (file: MediaFile) => {
    const imageUrl = getFileUrl(file);
    insertImageAtCursor(imageUrl, file.name);
    setImageDialogOpen(false);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleSave = async (status: 'draft' | 'published' = 'draft') => {
    if (!articleData.title.trim()) {
      toast({
        title: "请填写标题",
        variant: "destructive",
      });
      return;
    }

    if (!articleData.content.trim()) {
      toast({
        title: "请填写内容",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // 确保slug是唯一的
      let finalSlug = articleData.slug;
      if (!finalSlug || finalSlug.trim() === '') {
        finalSlug = await generateSlug(articleData.title);
      }

      const saveData = {
        ...articleData,
        slug: finalSlug,
        status,
        author_id: user?.id,
        published_at: status === 'published' && articleData.status !== 'published' 
          ? new Date().toISOString() 
          : undefined
      };
      if (isEditing) {
        const { error } = await supabase
          .from('articles')
          .update(saveData)
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "保存成功",
          description: status === 'published' ? "文章已发布" : "文章已保存为草稿",
        });
      } else {
        const { error } = await supabase
          .from('articles')
          .insert(saveData);

        if (error) throw error;

        toast({
          title: "创建成功",
          description: status === 'published' ? "文章已发布" : "文章已保存为草稿",
        });
      }

      navigate('/admin/dashboard');
    } catch (error: any) {
      toast({
        title: "操作失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    if (articleData.slug) {
      window.open(`/article/${articleData.slug}`, '_blank');
    } else {
      toast({
        title: "请先保存文章",
        description: "需要先保存文章才能预览",
        variant: "destructive",
      });
    }
  };

  if (loading && isEditing) {
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
      <header className="border-b border-border/40 bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回
              </Button>
              <div>
                <h1 className="text-xl font-bold">
                  {isEditing ? '编辑文章' : '新建文章'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {articleData.status === 'published' && (
                    <Badge variant="default" className="mr-2 bg-green-500/20 text-green-400 border-green-500/30">
                      已发布
                    </Badge>
                  )}
                  {articleData.status === 'draft' && (
                    <Badge variant="secondary" className="mr-2">
                      草稿
                    </Badge>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing && (
                <Button variant="outline" onClick={handlePreview}>
                  <Eye className="mr-2 h-4 w-4" />
                  预览
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => handleSave('draft')}
                disabled={loading}
              >
                <Save className="mr-2 h-4 w-4" />
                保存草稿
              </Button>
              <Button 
                onClick={() => handleSave('published')}
                disabled={loading}
              >
                <Send className="mr-2 h-4 w-4" />
                发布文章
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主编辑区域 */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>文章内容</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">标题 *</Label>
                  <Input
                    id="title"
                    value={articleData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="输入文章标题..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL别名</Label>
                  <Input
                    id="slug"
                    value={articleData.slug}
                    onChange={(e) => setArticleData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-slug"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    文章的URL路径，建议使用英文和连字符
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">摘要</Label>
                  <Textarea
                    id="excerpt"
                    value={articleData.excerpt}
                    onChange={(e) => setArticleData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="文章摘要，用于搜索和分享..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="content">正文 *</Label>
                    <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <ImageIcon className="mr-2 h-4 w-4" />
                          插入图片
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>选择图片</DialogTitle>
                        </DialogHeader>
                        <div className="max-h-96 overflow-y-auto">
                          {mediaFiles.length === 0 ? (
                            <div className="text-center py-8">
                              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                              <p className="text-muted-foreground">暂无图片文件</p>
                              <p className="text-sm text-muted-foreground mt-2">
                                请先到媒体管理上传图片
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {mediaFiles.map((file) => (
                                <div
                                  key={file.id}
                                  className="border border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
                                  onClick={() => handleImageSelect(file)}
                                >
                                  <div className="aspect-square bg-muted">
                                    <img
                                      src={getFileUrl(file)}
                                      alt={file.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="p-2">
                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {file.width}×{file.height} • {formatFileSize(file.file_size)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Textarea
                    id="content"
                    value={articleData.content}
                    onChange={(e) => setArticleData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="在这里输入文章内容..."
                    rows={20}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    支持Markdown格式，点击"插入图片"按钮可以从媒体库选择图片
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>发布设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">状态</Label>
                  <Select 
                    value={articleData.status} 
                    onValueChange={(value: 'draft' | 'published' | 'archived') => 
                      setArticleData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">草稿</SelectItem>
                      <SelectItem value="published">已发布</SelectItem>
                      <SelectItem value="archived">已归档</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">分类</Label>
                  <Select 
                    value={articleData.category_id || 'none'} 
                    onValueChange={(value) => 
                      setArticleData(prev => ({ ...prev, category_id: value === 'none' ? null : value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">无分类</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">SEO标题</Label>
                  <Input
                    id="meta_title"
                    value={articleData.meta_title}
                    onChange={(e) => setArticleData(prev => ({ ...prev, meta_title: e.target.value }))}
                    placeholder="SEO标题..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description">SEO描述</Label>
                  <Textarea
                    id="meta_description"
                    value={articleData.meta_description}
                    onChange={(e) => setArticleData(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="SEO描述..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featured_image">特色图片URL</Label>
                  <Input
                    id="featured_image"
                    value={articleData.featured_image_url}
                    onChange={(e) => setArticleData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor;