import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Image, 
  Video, 
  Trash2, 
  MoreHorizontal, 
  Calendar,
  HardDrive,
  Eye,
  Copy,
  Download,
  X,
  Search
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

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
  duration?: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

const MediaManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchMediaFiles();
  }, [user, navigate]);

  useEffect(() => {
    filterMediaFiles();
  }, [mediaFiles, searchTerm, filterType]);

  const fetchMediaFiles = async () => {
    setLoading(true);
    
    const { data, error } = await (supabase as any)
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      toast({
        title: "获取媒体文件失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setMediaFiles(data || []);
    }
    
    setLoading(false);
  };

  const filterMediaFiles = () => {
    let filtered = mediaFiles;

    if (searchTerm) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.file_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(file => file.type === filterType);
    }

    setFilteredFiles(filtered);
  };

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0 || !user) return;

    setUploading(true);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // 清理文件名，移除特殊字符和中文字符
        const cleanFileName = file.name
          .replace(/[^\w\s.-]/g, '') // 移除特殊字符，保留字母、数字、空格、点和连字符
          .replace(/\s+/g, '-') // 将空格替换为连字符
          .replace(/[^\x00-\x7F]/g, '') // 移除非ASCII字符（包括中文）
          .toLowerCase(); // 转为小写
        
        const fileExtension = cleanFileName.split('.').pop() || 'unknown';
        const fileNameWithoutExt = cleanFileName.replace(/\.[^/.]+$/, '') || 'file';
        const fileName = `${Date.now()}-${fileNameWithoutExt}.${fileExtension}`;
        const filePath = fileName; // 直接使用文件名作为路径，不需要额外的media/前缀

        // 上传文件到 Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        // 获取文件的公开 URL
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        // 确定文件类型
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const fileType = isImage ? 'image' : isVideo ? 'video' : 'image';

        // 获取图片或视频的尺寸信息
        let width: number | undefined;
        let height: number | undefined;
        let duration: number | undefined;

        if (isImage) {
          const img = new window.Image();
          img.src = publicUrl;
          await new Promise<void>((resolve) => {
            img.onload = () => {
              width = img.naturalWidth;
              height = img.naturalHeight;
              resolve();
            };
          });
        } else if (isVideo) {
          const video = document.createElement('video');
          video.src = publicUrl;
          await new Promise<void>((resolve) => {
            video.onloadedmetadata = () => {
              width = video.videoWidth;
              height = video.videoHeight;
              duration = video.duration;
              resolve();
            };
          });
        }

        // 保存文件元数据到数据库
        const { error: dbError } = await (supabase as any)
          .from('media')
          .insert([
            {
              name: fileNameWithoutExt || file.name.split('.')[0], // 使用清理后的文件名
              type: fileType,
              file_name: fileName,
              file_path: filePath,
              file_size: file.size,
              mime_type: file.type,
              width,
              height,
              duration,
              uploaded_by: user.id,
            }
          ]);

        if (dbError) {
          throw dbError;
        }
      }

      toast({
        title: "上传成功",
        description: `成功上传 ${selectedFiles.length} 个文件`,
      });

      setSelectedFiles(null);
      setUploadDialogOpen(false);
      fetchMediaFiles();
    } catch (error: any) {
      toast({
        title: "上传失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (file: MediaFile) => {
    try {
      // 从 Storage 删除文件
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([file.file_path]);

      if (storageError) {
        throw storageError;
      }

      // 从数据库删除记录
      const { error: dbError } = await (supabase as any)
        .from('media')
        .delete()
        .eq('id', file.id);

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "删除成功",
        description: "文件已删除",
      });

      fetchMediaFiles();
    } catch (error: any) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getFileUrl = (file: MediaFile) => {
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(file.file_path);
    return publicUrl;
  };

  const copyFileUrl = (file: MediaFile) => {
    const url = getFileUrl(file);
    navigator.clipboard.writeText(url);
    toast({
      title: "链接已复制",
      description: "文件链接已复制到剪贴板",
    });
  };

  const downloadFile = (file: MediaFile) => {
    const url = getFileUrl(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const stats = {
    total: mediaFiles.length,
    images: mediaFiles.filter(f => f.type === 'image').length,
    videos: mediaFiles.filter(f => f.type === 'video').length,
    totalSize: mediaFiles.reduce((sum, f) => sum + f.file_size, 0)
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="py-8">
        <header className="border-b border-border/40 bg-card/50 backdrop-blur">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  媒体管理
                </h1>
                <p className="text-muted-foreground">
                  管理图片和视频文件
                </p>
              </div>
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    上传文件
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>上传媒体文件</DialogTitle>
                    <DialogDescription>
                      支持图片（JPG, PNG, GIF, WebP）和视频（MP4, WebM, MOV）格式
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="file-upload">选择文件</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={(e) => setSelectedFiles(e.target.files)}
                      />
                    </div>
                    {selectedFiles && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          已选择 {selectedFiles.length} 个文件:
                        </p>
                        {Array.from(selectedFiles).map((file, index) => (
                          <div key={index} className="text-sm p-2 bg-muted rounded">
                            {file.name} ({formatFileSize(file.size)})
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setUploadDialogOpen(false)}
                        disabled={uploading}
                      >
                        取消
                      </Button>
                      <Button
                        onClick={handleFileUpload}
                        disabled={!selectedFiles || uploading}
                      >
                        {uploading ? '上传中...' : '上传'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总文件数</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">图片</CardTitle>
                <Image className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">{stats.images}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">视频</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{stats.videos}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总大小</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatFileSize(stats.totalSize)}</div>
              </CardContent>
            </Card>
          </div>

          {/* 搜索和筛选 */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索文件名..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Tabs value={filterType} onValueChange={(value) => setFilterType(value as any)}>
                  <TabsList>
                    <TabsTrigger value="all">全部</TabsTrigger>
                    <TabsTrigger value="image">图片</TabsTrigger>
                    <TabsTrigger value="video">视频</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {/* 媒体文件网格 */}
          {filteredFiles.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-12 h-12 mb-4 text-muted-foreground">
                  {filterType === 'image' ? <Image className="w-full h-full" /> : 
                   filterType === 'video' ? <Video className="w-full h-full" /> : 
                   <HardDrive className="w-full h-full" />}
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm || filterType !== 'all' ? '没有找到文件' : '还没有文件'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterType !== 'all' ? '尝试调整搜索条件或筛选器' : '开始上传第一个媒体文件'}
                </p>
                {!searchTerm && filterType === 'all' && (
                  <Button onClick={() => setUploadDialogOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    上传文件
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFiles.map((file) => (
                <Card key={file.id} className="overflow-hidden hover:shadow-lg transition-all duration-200">
                  <div className="aspect-video bg-muted relative group">
                    {file.type === 'image' ? (
                      <img
                        src={getFileUrl(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <Video className="w-12 h-12 text-primary/60" />
                        {file.duration && (
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {formatDuration(file.duration)}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* 悬浮操作按钮 */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setPreviewFile(file)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => copyFileUrl(file)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => downloadFile(file)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{file.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={file.type === 'image' ? 'default' : 'secondary'}>
                            {file.type === 'image' ? '图片' : '视频'}
                          </Badge>
                          {file.width && file.height && (
                            <span className="text-xs text-muted-foreground">
                              {file.width}×{file.height}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-2 space-x-3">
                          <span>{formatFileSize(file.file_size)}</span>
                          <span>{formatDate(file.created_at)}</span>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setPreviewFile(file)}>
                            <Eye className="mr-2 h-4 w-4" />
                            预览
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyFileUrl(file)}>
                            <Copy className="mr-2 h-4 w-4" />
                            复制链接
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadFile(file)}>
                            <Download className="mr-2 h-4 w-4" />
                            下载
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteFile(file)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 预览对话框 */}
      {previewFile && (
        <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{previewFile.name}</DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-center bg-muted rounded-lg p-4">
                {previewFile.type === 'image' ? (
                  <img
                    src={getFileUrl(previewFile)}
                    alt={previewFile.name}
                    className="max-w-full max-h-[60vh] object-contain"
                  />
                ) : (
                  <video
                    src={getFileUrl(previewFile)}
                    controls
                    className="max-w-full max-h-[60vh]"
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>文件名:</strong> {previewFile.file_name}
                </div>
                <div>
                  <strong>大小:</strong> {formatFileSize(previewFile.file_size)}
                </div>
                <div>
                  <strong>类型:</strong> {previewFile.mime_type}
                </div>
                <div>
                  <strong>上传时间:</strong> {formatDate(previewFile.created_at)}
                </div>
                {previewFile.width && previewFile.height && (
                  <div>
                    <strong>尺寸:</strong> {previewFile.width}×{previewFile.height}
                  </div>
                )}
                {previewFile.duration && (
                  <div>
                    <strong>时长:</strong> {formatDuration(previewFile.duration)}
                  </div>
                )}
              </div>
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => copyFileUrl(previewFile)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  复制链接
                </Button>
                <Button
                  variant="outline"
                  onClick={() => downloadFile(previewFile)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  下载
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Footer />
    </div>
  );
};

export default MediaManager;