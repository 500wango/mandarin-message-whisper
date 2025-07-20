import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Home from './Home';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Home />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
