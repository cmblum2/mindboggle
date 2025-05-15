
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, GamepadIcon, Star } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

interface IndexProps {
  navBarExtension?: React.ReactNode;
}

const Index = ({ navBarExtension }: IndexProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dailyProgress, setDailyProgress] = useState({
    completed: 0,
    total: 3
  });
  
  // Fetch user's daily progress
  useEffect(() => {
    if (user) {
      fetchDailyProgress();
    }
  }, [user]);
  
  const fetchDailyProgress = async () => {
    if (!user) return;
    
    try {
      // Get today's date with time set to midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Fetch games completed today
      const { data, error } = await supabase
        .from('cognitive_performance')
        .select('id')
        .eq('user_id', user.id)
        .gte('date', today.toISOString());
      
      if (error) throw error;
      
      // Update progress state
      setDailyProgress({
        completed: data ? data.length : 0,
        total: 3
      });
      
    } catch (err) {
      console.error("Error fetching daily progress:", err);
      // Keep default values on error
    }
  };

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    }
  };

  const handleButtonClick = (path: string) => {
    if (user) {
      navigate(path);
    } else {
      // Show toast notification that login is required
      toast({
        title: "Login Required",
        description: "Please login or create an account to access this feature.",
        variant: "default",
      });
      
      // This will trigger the auth modal through the NavBar component
      const getStartedButton = document.querySelector('[data-get-started]') as HTMLButtonElement;
      if (getStartedButton) {
        getStartedButton.click();
      }
    }
  };
  
  // Calculate progress percentage safely
  const progressPercentage = Math.min(
    (dailyProgress.completed / dailyProgress.total) * 100, 
    100 // Limit to maximum of 100%
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar 
        isLoggedIn={!!user}
        onLogout={logout}
        extension={navBarExtension}
      />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-serif">
                  Train Your Brain.
                  <span className="text-gradient"> Stay Sharp.</span>
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  MindBoggle offers personalized brain exercises with AI-powered feedback to help maintain cognitive health.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    className="bg-gradient-to-r from-brain-purple to-brain-teal hover:opacity-90 text-white px-8"
                    size="lg"
                    onClick={() => handleButtonClick('/dashboard')}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleButtonClick('/games')}
                  >
                    Explore Games
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -top-8 -left-8 w-40 h-40 bg-brain-purple/20 rounded-full blur-2xl animate-pulse-soft" />
                  <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-brain-teal/20 rounded-full blur-2xl animate-pulse-soft" />
                  {user ? (
                    <div className="relative z-10 bg-card p-6 rounded-xl shadow-xl border border-brain-teal/10 animate-float">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2 bg-brain-purple/10 p-3 rounded-lg dark:bg-brain-purple/20">
                          <Brain className="h-8 w-8 text-brain-purple" />
                          <div>
                            <div className="font-medium">Memory</div>
                            <div className="text-xs text-muted-foreground">Build recall</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-brain-teal/10 p-3 rounded-lg dark:bg-brain-teal/20">
                          <GamepadIcon className="h-8 w-8 text-brain-teal" />
                          <div>
                            <div className="font-medium">Focus</div>
                            <div className="text-xs text-muted-foreground">Sharpen attention</div>
                          </div>
                        </div>
                        <div className="col-span-2 bg-muted p-3 rounded-lg">
                          <div className="text-sm font-medium mb-1">Today's Progress</div>
                          <div className="w-full bg-muted-foreground/20 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-2 rounded-full bg-gradient-to-r from-brain-purple to-brain-teal" 
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {user.name ? `${user.name}'s progress: ` : ''}
                            {dailyProgress.completed}/{dailyProgress.total} brain games complete
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative z-10 bg-card p-6 rounded-xl shadow-xl border border-brain-teal/10 animate-float">
                      <div className="flex flex-col items-center text-center p-4 space-y-3">
                        <Brain className="h-12 w-12 text-brain-purple mb-2" />
                        <h3 className="text-lg font-medium">Train Your Brain</h3>
                        <p className="text-sm text-muted-foreground">
                          Sign in to track your progress and access personalized brain training
                        </p>
                        <Button 
                          className="w-full bg-gradient-to-r from-brain-purple to-brain-teal hover:opacity-90 text-white mt-2"
                          onClick={() => {
                            const getStartedButton = document.querySelector('[data-get-started]') as HTMLButtonElement;
                            if (getStartedButton) {
                              getStartedButton.click();
                            }
                          }}
                        >
                          Sign In
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="bg-muted py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">How It Works</h2>
              <p className="text-muted-foreground mt-2">Train your brain through engaging games and personalized feedback</p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <div className="brain-card">
                <div className="w-12 h-12 bg-brain-purple/10 rounded-full flex items-center justify-center mb-4 dark:bg-brain-purple/20">
                  <GamepadIcon className="h-6 w-6 text-brain-purple" />
                </div>
                <h3 className="text-xl font-bold mb-2">Play Games</h3>
                <p className="text-muted-foreground">
                  Engage in fun cognitive exercises designed to target different areas of brain function
                </p>
              </div>
              
              <div className="brain-card">
                <div className="w-12 h-12 bg-brain-teal/10 rounded-full flex items-center justify-center mb-4 dark:bg-brain-teal/20">
                  <Brain className="h-6 w-6 text-brain-teal" />
                </div>
                <h3 className="text-xl font-bold mb-2">Get AI Feedback</h3>
                <p className="text-muted-foreground">
                  Receive personalized analysis and recommendations based on your performance
                </p>
              </div>
              
              <div className="brain-card">
                <div className="w-12 h-12 bg-brain-coral/10 rounded-full flex items-center justify-center mb-4 dark:bg-brain-coral/20">
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
    </div>
  );
};

export default Index;
