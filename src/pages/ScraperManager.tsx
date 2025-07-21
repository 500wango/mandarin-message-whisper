import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Play, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';

interface ScraperLog {
  id: string;
  created_at: string;
  status: string;
  tools_scraped: number;
  tools_published: number;
  error_message?: string;
  execution_time_ms?: number;
}

const ScraperManager = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<ScraperLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('scraper_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        title: "获取日志失败",
        description: "无法加载抓取日志",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const runScraper = async () => {
    setIsRunning(true);
    try {
      console.log('Triggering FutureTools scraper...');
      
      const { data, error } = await supabase.functions.invoke('futuretools-scraper', {
        body: { manual: true }
      });

      if (error) throw error;

      toast({
        title: "抓取完成",
        description: `成功抓取并发布了 ${data.published} 个AI工具`,
      });

      // 刷新日志
      await fetchLogs();
    } catch (error: any) {
      console.error('Error running scraper:', error);
      toast({
        title: "抓取失败",
        description: error.message || "抓取过程中出现错误",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">抓取管理</h1>
            <p className="text-muted-foreground text-lg">
              管理 FutureTools.io 自动抓取系统
            </p>
          </div>

          {/* Control Panel */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>手动抓取</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                点击下方按钮手动触发 FutureTools.io 抓取流程。系统将自动抓取最新的AI工具，翻译内容并发布到网站。
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={runScraper} 
                  disabled={isRunning}
                  className="flex items-center gap-2"
                >
                  {isRunning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {isRunning ? '抓取中...' : '开始抓取'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={fetchLogs} 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  刷新日志
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Execution Logs */}
          <Card>
            <CardHeader>
              <CardTitle>执行日志</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">加载日志中...</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  暂无执行日志
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div 
                      key={log.id} 
                      className="flex items-center justify-between p-4 border border-border/40 rounded-lg bg-card/50"
                    >
                      <div className="flex items-center gap-4">
                        {getStatusIcon(log.status)}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              variant="outline" 
                              className={getStatusColor(log.status)}
                            >
                              {log.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(log.created_at)}
                            </span>
                          </div>
                          {log.status === 'success' ? (
                            <p className="text-sm">
                              抓取了 {log.tools_scraped} 个工具，发布了 {log.tools_published} 个
                            </p>
                          ) : (
                            <p className="text-sm text-red-600">
                              {log.error_message || '执行失败'}
                            </p>
                          )}
                        </div>
                      </div>
                      {log.execution_time_ms && (
                        <div className="text-sm text-muted-foreground">
                          {(log.execution_time_ms / 1000).toFixed(1)}s
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule Info */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>自动执行计划</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">
                <p className="mb-2">系统已配置自动抓取任务：</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>执行时间：每天上午 9:00</li>
                  <li>抓取数量：每次最多 10 个工具</li>
                  <li>翻译服务：Deepseek API</li>
                  <li>发布分类：AI工具</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ScraperManager;