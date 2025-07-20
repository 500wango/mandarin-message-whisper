import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ExternalLink, Users, Zap } from 'lucide-react';

interface ToolCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  users: string;
  pricing: 'Free' | 'Freemium' | 'Paid';
  logoUrl: string;
  websiteUrl: string;
  features: string[];
}

export const ToolCard = ({
  id,
  name,
  description,
  category,
  rating,
  users,
  pricing,
  logoUrl,
  websiteUrl,
  features
}: ToolCardProps) => {
  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'Free':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Freemium':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Paid':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:scale-[1.02] border-border/40 bg-gradient-secondary backdrop-blur">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden">
              <img
                src={logoUrl}
                alt={name}
                className="w-10 h-10 object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors duration-200">
                {name}
              </h3>
              <Badge variant="outline" className="text-xs">
                {category}
              </Badge>
            </div>
          </div>
          
          <Badge className={`${getPricingColor(pricing)} text-xs`}>
            {pricing}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {description}
        </p>

        {/* Features */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {features.slice(0, 3).map((feature, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs bg-muted/50 hover:bg-muted transition-colors duration-200"
              >
                {feature}
              </Badge>
            ))}
            {features.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-muted/50">
                +{features.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{rating}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{users}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            className="flex-1 bg-primary hover:bg-primary-glow transition-all duration-200 hover:shadow-neon"
            asChild
          >
            <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              访问工具
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-primary/20 hover:border-primary hover:text-primary transition-all duration-200"
          >
            <Zap className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};