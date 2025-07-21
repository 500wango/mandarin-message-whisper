import { NewsCard } from '@/components/NewsCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Brain } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  published_at: string;
  view_count: number;
  featured_image_url: string;
  category: Category | null;
}

const Prompts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      // 获取"提示词工程"分类的文章
      const { data: articlesData } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          excerpt,
          slug,
          published_at,
          view_count,
          featured_image_url,
          category_id,
          categories!inner (
            id,
            name,
            slug,
            color
          )
        `)
        .eq('status', 'published')
        .eq('categories.name', '提示词工程')
        .order('published_at', { ascending: false });

      // 转换文章数据格式
      const formattedArticles = (articlesData || []).map(article => ({
        ...article,
        category: article.categories
      }));
      
      setArticles(formattedArticles);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  const calculateReadTime = (content: string) => {
    const wordCount = content.length;
    const readTime = Math.max(1, Math.ceil(wordCount / 300));
    return `${readTime}分钟`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">加载中...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">提示词工程</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              掌握AI提示词的艺术，释放人工智能的无限潜能
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索提示词..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-lg bg-card border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
              />
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article, index) => (
              <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <NewsCard 
                  id={article.id}
                  title={article.title}
                  excerpt={article.excerpt || ''}
                  category={article.category?.name || '未分类'}
                  publishDate={formatDate(article.published_at)}
                  readTime={calculateReadTime(article.excerpt || '')}
                  views={article.view_count}
                  imageUrl={article.featured_image_url || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop'}
                  slug={article.slug}
                  featured={index === 0}
                />
              </div>
            ))}
          </div>

          {/* Load More */}
          {filteredArticles.length > 0 && (
            <div className="mt-12 text-center">
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary/20 hover:border-primary hover:bg-primary/10 transition-all duration-300"
              >
                加载更多内容
              </Button>
            </div>
          )}

          {/* No Results */}
          {filteredArticles.length === 0 && (
            <div className="text-center py-16">
              <div className="text-muted-foreground text-lg mb-4">
                {searchQuery ? '没有找到匹配的内容' : '暂无提示词工程文章'}
              </div>
              {searchQuery && (
                <Button 
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                  className="border-primary/20 hover:border-primary"
                >
                  清除搜索条件
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Prompts;