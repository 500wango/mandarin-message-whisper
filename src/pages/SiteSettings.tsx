import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Save, Image as ImageIcon, Globe } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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

const SiteSettings = () => {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [navigation, setNavigation] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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
          <p className="text-muted-foreground">管理网站的基本信息和导航菜单</p>
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
    </div>
  );
};

export default SiteSettings;