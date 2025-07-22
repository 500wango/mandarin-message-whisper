import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Star, Users, ExternalLink, Upload } from "lucide-react";
import { Link } from "react-router-dom";

interface ToolCardProps {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  slug: string;
  category: string;
  categoryColor: string;
  rating?: number;
  users?: string;
  pricing?: 'Free' | 'Freemium' | 'Paid';
}

export const ToolCard = ({
  title,
  excerpt,
  imageUrl,
  slug,
  category,
  categoryColor,
  rating = 4.5,
  users = "1K+",
  pricing = "Freemium"
}: ToolCardProps) => {
  const getPricingColor = (pricing: string): string => {
    switch (pricing) {
      case 'Free':
        return 'text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950';
      case 'Freemium':
        return 'text-blue-600 border-blue-200 bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:bg-blue-950';
      case 'Paid':
        return 'text-orange-600 border-orange-200 bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:bg-orange-950';
      default:
        return 'text-gray-600 border-gray-200 bg-gray-50 dark:text-gray-400 dark:border-gray-700 dark:bg-gray-800';
    }
  };

  return (
    <Link to={`/tool/${slug}`} className="block">
      <Card className="group h-full overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40 transition-all duration-300 cursor-pointer">
        {/* 工具截图 */}
        <CardHeader className="p-0 relative">
          <div className="relative overflow-hidden">
            <img 
              src={imageUrl || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=200&fit=crop'} 
              alt={title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=200&fit=crop';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* 上传图标 */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                <Upload className="h-4 w-4 text-white" />
              </div>
            </div>
            
            {/* 分类标签 */}
            <div className="absolute top-3 left-3">
              <Badge 
                variant="secondary" 
                className="text-xs font-medium backdrop-blur-sm"
                style={{ backgroundColor: `${categoryColor}20`, color: categoryColor, borderColor: `${categoryColor}40` }}
              >
                {category}
              </Badge>
            </div>
            
            {/* 定价标签 */}
            <div className="absolute bottom-3 left-3">
              <Badge 
                variant="outline" 
                className={`text-xs backdrop-blur-sm ${getPricingColor(pricing)}`}
              >
                {pricing}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed mb-4">
            {excerpt && !excerpt.includes('json') && !excerpt.includes('"title"') 
              ? excerpt 
              : '探索这个强大的AI工具，提升您的工作效率'}
          </p>
          
          {/* 评分和用户数 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{users}</span>
              </div>
            </div>
            
            <div className="flex items-center text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="mr-1">查看详情</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};