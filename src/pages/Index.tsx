
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, GamepadIcon } from 'lucide-react';
import NavBar from '@/components/NavBar';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, login, signup, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setShowAuthModal(true);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar 
        isLoggedIn={!!user}
        onLogout={logout}
        onLogin={() => setShowAuthModal(true)}
      />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-brain-purple/10 px-3 py-1 text-sm text-brain-purple">
                  Backed by Neuroscience
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Train Your Brain.
                  <span className="text-gradient"> Stay Sharp.</span>
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  MindBoggle offers personalized brain exercises based on the Bredesen Protocol 
                  with AI-powered feedback to help maintain cognitive health.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    className="bg-gradient-to-r from-brain-purple to-brain-teal hover:opacity-90 text-white px-8"
                    size="lg"
                    onClick={handleGetStarted}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/games')}
                  >
                    Explore Games
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -top-8 -left-8 w-40 h-40 bg-brain-purple/20 rounded-full blur-2xl animate-pulse-soft" />
                  <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-brain-teal/20 rounded-full blur-2xl animate-pulse-soft" />
                  <div className="relative z-10 bg-white p-6 rounded-xl shadow-xl border border-brain-teal/10 animate-float">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2 bg-brain-purple/10 p-3 rounded-lg">
                        <Brain className="h-8 w-8 text-brain-purple" />
                        <div>
                          <div className="font-medium">Memory</div>
                          <div className="text-xs text-muted-foreground">Build recall</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 bg-brain-teal/10 p-3 rounded-lg">
                        <GamepadIcon className="h-8 w-8 text-brain-teal" />
                        <div>
                          <div className="font-medium">Focus</div>
                          <div className="text-xs text-muted-foreground">Sharpen attention</div>
                        </div>
                      </div>
                      <div className="col-span-2 bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm font-medium mb-1">Today's Progress</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="h-2 rounded-full bg-gradient-to-r from-brain-purple to-brain-teal" style={{ width: '65%' }}></div>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">2/3 brain games complete</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="bg-brain-light py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">How It Works</h2>
              <p className="text-muted-foreground mt-2">Train your brain through engaging games and personalized feedback</p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <div className="brain-card">
                <div className="w-12 h-12 bg-brain-purple/10 rounded-full flex items-center justify-center mb-4">
                  <GamepadIcon className="h-6 w-6 text-brain-purple" />
                </div>
                <h3 className="text-xl font-bold mb-2">Play Games</h3>
                <p className="text-muted-foreground">
                  Engage in fun cognitive exercises designed to target different areas of brain function
                </p>
              </div>
              
              <div className="brain-card">
                <div className="w-12 h-12 bg-brain-teal/10 rounded-full flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-brain-teal" />
                </div>
                <h3 className="text-xl font-bold mb-2">Get AI Feedback</h3>
                <p className="text-muted-foreground">
                  Receive personalized analysis and recommendations based on your performance
                </p>
              </div>
              
              <div className="brain-card">
                <div className="w-12 h-12 bg-brain-coral/10 rounded-full flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-brain-coral" />
                </div>
                <h3 className="text-xl font-bold mb-2">Track Progress</h3>
                <p className="text-muted-foreground">
                  Monitor your cognitive improvements over time with detailed analytics
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={login}
        onSignup={signup}
      />
    </div>
  );
};

export default Index;
