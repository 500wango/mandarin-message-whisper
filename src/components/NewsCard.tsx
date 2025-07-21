import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NewsCardProps {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  publishDate: string;
  readTime: string;
  views: number;
  imageUrl: string;
  featured?: boolean;
  slug?: string;
}

export const NewsCard = ({
  id,
  title,
  excerpt,
  category,
  publishDate,
  readTime,
  views,
  imageUrl,
  featured = false,
  slug
}: NewsCardProps) => {
  const articleLink = slug ? `/article/${slug}` : `/article/${id}`;
  
  return (
    <Link to={articleLink} className="block">
      <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:scale-[1.02] ${
        featured ? 'border-primary/20 shadow-neon' : 'border-border/40'
      } bg-gradient-secondary backdrop-blur cursor-pointer`}>
        {/* Image */}
        <div className="relative overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          
          {/* Category Badge */}
          <Badge
            variant="secondary"
            className="absolute top-4 left-4 bg-primary/90 text-primary-foreground border-0"
          >
            {category}
          </Badge>

          {featured && (
            <div className="absolute top-4 right-4">
              <Badge variant="outline" className="bg-accent/90 text-accent-foreground border-accent animate-glow-pulse">
                热门
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {title}
          </h3>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {excerpt}
          </p>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{readTime}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{views.toLocaleString()}</span>
              </div>
            </div>
            <span>{publishDate}</span>
          </div>

          {/* Read More Text */}
          <div className="inline-flex items-center space-x-2 text-primary hover:text-primary-glow transition-colors duration-200 text-sm font-medium group/link">
            <span>阅读全文</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-1" />
          </div>
        </div>
      </Card>
    </Link>
  );
};