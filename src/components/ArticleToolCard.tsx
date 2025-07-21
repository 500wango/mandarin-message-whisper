import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Eye, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ArticleToolCardProps {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  publishedAt: string;
  slug: string;
  category: string;
  categoryColor: string;
  viewCount: number;
  readTime: string;
}

export const ArticleToolCard = ({
  title,
  excerpt,
  imageUrl,
  slug,
  category,
  categoryColor,
  viewCount,
  readTime
}: ArticleToolCardProps) => {
  return (
    <Link to={`/article/${slug}`} className="block h-full">
      <Card className="group h-full overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300 cursor-pointer">
        <CardHeader className="p-0">
          <div className="relative overflow-hidden rounded-t-lg">
            <img 
              src={imageUrl || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=200&fit=crop'} 
              alt={title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=200&fit=crop';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-3 left-3">
              <Badge 
                variant="secondary" 
                className="text-xs font-medium"
                style={{ backgroundColor: `${categoryColor}20`, color: categoryColor, borderColor: `${categoryColor}40` }}
              >
                {category}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 flex-1">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
            {excerpt}
          </p>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{readTime}</span>
            </div>
          </div>
          
          <div className="flex items-center text-primary text-sm font-medium">
            <span className="mr-1">查看</span>
            <ExternalLink className="h-3 w-3" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};