import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Star, Users, ExternalLink } from "lucide-react";

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
  const getPricingColor = (pricing: string): string => {
    switch (pricing) {
      case 'Free':
        return 'text-green-600 border-green-200 bg-green-50';
      case 'Freemium':
        return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'Paid':
        return 'text-orange-600 border-orange-200 bg-orange-50';
      default:
        return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card className="group h-full overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={logoUrl} 
              alt={`${name} logo`}
              className="w-12 h-12 rounded-lg object-cover border border-border/20"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=48&h=48&fit=crop';
              }}
            />
            <div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {name}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={`text-xs ${getPricingColor(pricing)}`}
          >
            {pricing}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
          {description}
        </p>
        
        {features.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">主要功能:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              {features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{users}</span>
          </div>
        </div>
        
        <Button 
          size="sm" 
          variant="ghost"
          className="h-8 px-3 text-primary hover:text-primary hover:bg-primary/10"
          onClick={() => window.open(websiteUrl, '_blank')}
        >
          <span className="mr-1">访问</span>
          <ExternalLink className="h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
};