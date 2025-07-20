import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-24 px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
      
      <div className="relative container mx-auto text-center">
        {/* Badge */}
        <Badge 
          variant="outline" 
          className="mb-6 bg-card/50 border-primary/20 text-primary hover:shadow-neon transition-all duration-300 animate-fade-in"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          全新AI资讯平台上线
        </Badge>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
          探索
          <span className="bg-gradient-primary bg-clip-text text-transparent"> AI未来</span>
          <br />
          赋能智能时代
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in">
          汇聚最新AI行业动态、精选工具推荐与专业提示词工程，
          <br className="hidden md:block" />
          为AI从业者和爱好者提供一站式信息服务
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-scale-in">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary-glow transition-all duration-300 hover:shadow-neon text-lg px-8"
            asChild
          >
            <Link to="/news">
              开始探索
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-primary/20 hover:border-primary hover:bg-primary/10 text-lg px-8 transition-all duration-300"
            asChild
          >
            <Link to="/tools">
              发现工具
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fade-in">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-6 w-6 text-primary mr-2" />
              <span className="text-3xl font-bold text-foreground">1000+</span>
            </div>
            <p className="text-muted-foreground">AI新闻资讯</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Sparkles className="h-6 w-6 text-accent mr-2" />
              <span className="text-3xl font-bold text-foreground">500+</span>
            </div>
            <p className="text-muted-foreground">精选AI工具</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-primary-glow mr-2" />
              <span className="text-3xl font-bold text-foreground">10K+</span>
            </div>
            <p className="text-muted-foreground">活跃用户</p>
          </div>
        </div>
      </div>
    </section>
  );
};