import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import News from "./pages/News";
import Tools from "./pages/Tools";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ArticleEditor from "./pages/ArticleEditor";
import Article from "./pages/Article";
import Prompts from "./pages/Prompts";
import MediaManager from "./pages/MediaManager";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import PageEditor from "./pages/PageEditor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/news" element={<News />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/article/:slug" element={<Article />} />
            <Route path="/prompts" element={<Prompts />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<Auth />} />
            <Route path="/admin/auth" element={<Auth />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/dashboard/editor" element={<ArticleEditor />} />
            <Route path="/admin/dashboard/editor/:id" element={<ArticleEditor />} />
            <Route path="/dashboard/editor/:id" element={<ArticleEditor />} />
            <Route path="/admin/dashboard/media" element={<MediaManager />} />
            <Route path="/admin/dashboard/page-editor/:pageKey" element={<PageEditor />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">404</h1>
                  <p className="text-xl text-muted-foreground mb-4">页面未找到</p>
                  <a href="/" className="text-primary hover:text-primary-glow underline">
                    返回首页
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
