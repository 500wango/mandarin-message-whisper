import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Save, Image as ImageIcon, Globe, Key, Plus, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

interface SiteSetting {
  setting_key: string;
  setting_value: string;
  display_name: string;
  description: string;
}

interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const SiteSettings = () => {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [navigation, setNavigation] = useState<NavigationItem[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newApiKey, setNewApiKey] = useState({ name: '', description: '' });
  const [showNewApiForm, setShowNewApiForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsResponse, navigationResponse] = await Promise.all([
        supabase.from('site_settings').select('*').order('setting_key'),
        supabase.from('navigation_items').select('*').order('sort_order')
      ]);

      if (settingsResponse.error) throw settingsResponse.error;
      if (navigationResponse.error) throw navigationResponse.error;

      setSettings(settingsResponse.data || []);
      setNavigation(navigationResponse.data || []);

      // 获取API密钥数据，使用更安全的方法
      try {
        const apiKeysResponse = await supabase
          .from('api_keys' as any)
          .select('*')
          .order('created_at');
        
        if (!apiKeysResponse.error && apiKeysResponse.data) {
          setApiKeys((apiKeysResponse.data as unknown) as ApiKey[]);
        }
      } catch (apiError) {
        console.log('API keys table not ready yet:', apiError);
        // API密钥表可能还没准备好，这是正常的
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "加载失败",
        description: "无法加载设置数据",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => prev.map(setting => 
      setting.setting_key === key 
        ? { ...setting, setting_value: value }
        : setting
    ));
  };

  const handleNavigationChange = (id: string, field: keyof NavigationItem, value: string | number | boolean) => {
    setNavigation(prev => prev.map(item => 
      item.id === id 
        ? { ...item, [field]: value }
        : item
    ));
  };

  const handleFileUpload = async (file: File, settingKey: string) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${settingKey}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      handleSettingChange(settingKey, publicUrl);
      
      toast({
        title: "上传成功",
        description: "文件已成功上传",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "上传失败",
        description: "文件上传过程中出现错误",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const saveSiteSettings = async () => {
    setSaving(true);
    try {
      const updates = settings.map(setting => ({
        setting_key: setting.setting_key,
        setting_value: setting.setting_value,
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .update({ setting_value: update.setting_value, updated_at: update.updated_at })
          .eq('setting_key', update.setting_key);
        
        if (error) throw error;
      }

      toast({
        title: "保存成功",
        description: "网站设置已更新",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "保存失败",
        description: "保存设置时出现错误",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveNavigation = async () => {
    setSaving(true);
    try {
      for (const item of navigation) {
        const { error } = await supabase
          .from('navigation_items')
          .update({
            name: item.name,
            href: item.href,
            icon: item.icon,
            sort_order: item.sort_order,
            is_active: item.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);
        
        if (error) throw error;
      }

      toast({
        title: "保存成功",
        description: "导航设置已更新",
      });
    } catch (error) {
      console.error('Error saving navigation:', error);
      toast({
        title: "保存失败",
        description: "保存导航时出现错误",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addNavigationItem = async () => {
    try {
      const { data, error } = await supabase
        .from('navigation_items')
        .insert({
          name: '新导航项',
          href: '/new-page',
          icon: 'Brain',
          sort_order: Math.max(...navigation.map(n => n.sort_order), 0) + 1,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      
      setNavigation(prev => [...prev, data]);
      
      toast({
        title: "添加成功",
        description: "新导航项已添加",
      });
    } catch (error) {
      console.error('Error adding navigation item:', error);
      toast({
        title: "添加失败",
        description: "添加导航项时出现错误",
        variant: "destructive",
      });
    }
  };

  const deleteNavigationItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('navigation_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setNavigation(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "删除成功",
        description: "导航项已删除",
      });
    } catch (error) {
      console.error('Error deleting navigation item:', error);
      toast({
        title: "删除失败",
        description: "删除导航项时出现错误",
        variant: "destructive",
      });
    }
  };

  const addApiKey = async () => {
    if (!newApiKey.name) {
      toast({
        title: "生成失败",
        description: "请填写API密钥名称",
        variant: "destructive",
      });
      return;
    }

    try {
      // 生成随机API密钥
      const generateApiKey = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = 'sk-';
        for (let i = 0; i < 48; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };

      const generatedKey = generateApiKey();

      const { data, error } = await supabase
        .from('api_keys' as any)
        .insert({
          name: newApiKey.name,
          key: generatedKey,
          description: newApiKey.description,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setApiKeys(prev => [...prev, (data as unknown) as ApiKey]);
        setNewApiKey({ name: '', description: '' });
        setShowNewApiForm(false);
        
        toast({
          title: "生成成功",
          description: "API密钥已生成，请妥善保管",
        });
      }
    } catch (error) {
      console.error('Error adding API key:', error);
      toast({
        title: "生成失败",
        description: "生成API密钥时出现错误",
        variant: "destructive",
      });
    }
  };

  const updateApiKey = async (id: string, field: keyof ApiKey, value: string | boolean) => {
    try {
      const { error } = await supabase
        .from('api_keys' as any)
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      setApiKeys(prev => prev.map(key => 
        key.id === id ? { ...key, [field]: value } : key
      ));
      
      toast({
        title: "更新成功",
        description: "API密钥已更新",
      });
    } catch (error) {
      console.error('Error updating API key:', error);
      toast({
        title: "更新失败",
        description: "更新API密钥时出现错误",
        variant: "destructive",
      });
    }
  };

  const deleteApiKey = async (id: string) => {
    try {
      const { error } = await supabase
        .from('api_keys' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setApiKeys(prev => prev.filter(key => key.id !== id));
      
      toast({
        title: "删除成功",
        description: "API密钥已删除",
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: "删除失败",
        description: "删除API密钥时出现错误",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">网站设置</h1>
          <p className="text-muted-foreground">管理网站的基本信息、导航菜单和API配置</p>
        </div>
      </div>

      {/* 网站基本设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            网站基本设置
          </CardTitle>
          <CardDescription>
            设置网站的基本信息，包括标题、描述和Logo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings.map((setting) => (
            <div key={setting.setting_key} className="space-y-2">
              <Label htmlFor={setting.setting_key}>{setting.display_name}</Label>
              {setting.description && (
                <p className="text-sm text-muted-foreground">{setting.description}</p>
              )}
              
              {setting.setting_key.includes('logo') || setting.setting_key.includes('favicon') ? (
                <div className="space-y-4">
                  {setting.setting_value && (
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <img 
                        src={setting.setting_value} 
                        alt={setting.display_name}
                        className="h-16 w-16 object-contain bg-muted rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">当前{setting.display_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{setting.setting_value}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      id={setting.setting_key}
                      placeholder={`输入${setting.display_name}URL或上传文件`}
                      value={setting.setting_value}
                      onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
                    />
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, setting.setting_key);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                      />
                      <Button type="button" variant="outline" disabled={uploading}>
                        {uploading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : setting.setting_key.includes('title') || setting.setting_key.includes('description') ? (
                setting.setting_value.length > 100 ? (
                  <Textarea
                    id={setting.setting_key}
                    value={setting.setting_value}
                    onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
                    rows={3}
                  />
                ) : (
                  <Input
                    id={setting.setting_key}
                    value={setting.setting_value}
                    onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
                  />
                )
              ) : (
                <Input
                  id={setting.setting_key}
                  value={setting.setting_value}
                  onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
                />
              )}
            </div>
          ))}
          
          <Separator />
          
          <div className="flex justify-end">
            <Button onClick={saveSiteSettings} disabled={saving}>
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              保存设置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 导航菜单设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            导航菜单设置
          </CardTitle>
          <CardDescription>
            管理网站的导航菜单项，可以添加、编辑或删除导航项
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {navigation.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-4 items-center p-4 border rounded-lg">
              <div className="col-span-2">
                <Label>排序</Label>
                <Input
                  type="number"
                  value={item.sort_order}
                  onChange={(e) => handleNavigationChange(item.id, 'sort_order', parseInt(e.target.value))}
                />
              </div>
              <div className="col-span-3">
                <Label>名称</Label>
                <Input
                  value={item.name}
                  onChange={(e) => handleNavigationChange(item.id, 'name', e.target.value)}
                />
              </div>
              <div className="col-span-3">
                <Label>链接</Label>
                <Input
                  value={item.href}
                  onChange={(e) => handleNavigationChange(item.id, 'href', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label>图标</Label>
                <Input
                  value={item.icon}
                  onChange={(e) => handleNavigationChange(item.id, 'icon', e.target.value)}
                  placeholder="Brain, Zap, Sparkles"
                />
              </div>
              <div className="col-span-1">
                <Label>状态</Label>
                <input
                  type="checkbox"
                  checked={item.is_active}
                  onChange={(e) => handleNavigationChange(item.id, 'is_active', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
              <div className="col-span-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteNavigationItem(item.id)}
                  className="text-destructive hover:text-destructive"
                >
                  删除
                </Button>
              </div>
            </div>
          ))}
          
          <Separator />
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={addNavigationItem}>
              添加导航项
            </Button>
            <Button onClick={saveNavigation} disabled={saving}>
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              保存导航
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API接口管理 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API接口管理
          </CardTitle>
          <CardDescription>
            为n8n工作流生成API密钥，用于自动化创建和发布文章。生成的API密钥可以在外部工作流中使用。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API端点信息 */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">API端点地址</h4>
            <div className="space-y-1 text-sm font-mono">
              <div><strong>文章API:</strong> https://dembuvipwnfolksvqygl.supabase.co/functions/v1/article-api</div>
              <div><strong>分类API:</strong> https://dembuvipwnfolksvqygl.supabase.co/functions/v1/categories-api</div>
            </div>
          </div>

          {/* API密钥列表 */}
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Input
                      value={apiKey.name}
                      onChange={(e) => updateApiKey(apiKey.id, 'name', e.target.value)}
                      className="font-medium max-w-xs"
                      placeholder="API密钥名称 (如: n8n工作流)"
                    />
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={apiKey.is_active}
                        onCheckedChange={(checked) => updateApiKey(apiKey.id, 'is_active', checked)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {apiKey.is_active ? '启用' : '禁用'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="password"
                      value={apiKey.key}
                      readOnly
                      className="font-mono text-sm bg-muted"
                      placeholder="生成的API密钥"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(apiKey.key);
                        toast({ title: "已复制", description: "API密钥已复制到剪贴板" });
                      }}
                    >
                      复制
                    </Button>
                  </div>
                  <Textarea
                    value={apiKey.description || ''}
                    onChange={(e) => updateApiKey(apiKey.id, 'description', e.target.value)}
                    placeholder="用途说明 (如: 用于n8n自动发布新闻文章)"
                    rows={2}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteApiKey(apiKey.id)}
                  className="text-destructive hover:text-destructive ml-4"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                创建时间: {new Date(apiKey.created_at).toLocaleString()}
              </div>
            </div>
          ))}

          {/* 添加新API密钥表单 */}
          {showNewApiForm && (
            <div className="p-4 border-2 border-dashed rounded-lg space-y-3">
              <Input
                placeholder="API密钥名称 (如: n8n工作流密钥)"
                value={newApiKey.name}
                onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
              />
              <Textarea
                placeholder="用途说明 (如: 用于n8n自动发布文章工作流)"
                value={newApiKey.description}
                onChange={(e) => setNewApiKey(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
              <div className="flex gap-2">
                <Button onClick={addApiKey} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  生成API密钥
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setShowNewApiForm(false);
                    setNewApiKey({ name: '', description: '' });
                  }}
                >
                  取消
                </Button>
              </div>
            </div>
          )}
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={() => setShowNewApiForm(true)}
              disabled={showNewApiForm}
            >
              <Plus className="h-4 w-4 mr-2" />
              生成新API密钥
            </Button>
            
            <Button 
              variant="secondary"
              onClick={() => window.open('https://docs.lovable.dev', '_blank')}
            >
              查看API文档
            </Button>
          </div>

          {/* API使用示例 */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">n8n使用示例</h4>
            <div className="text-sm space-y-2">
              <div><strong>1. 在n8n中创建HTTP Request节点</strong></div>
              <div><strong>2. 设置请求头:</strong> <code className="bg-background px-1 rounded">x-api-key: YOUR_API_KEY</code></div>
              <div><strong>3. 创建文章:</strong> <code className="bg-background px-1 rounded">POST /article-api</code></div>
              <div className="mt-2 p-2 bg-background rounded text-xs font-mono">
{`{
  "title": "文章标题",
  "content": "文章内容",
  "status": "published",
  "auto_categorize": true
}`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteSettings;