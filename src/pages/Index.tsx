import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, GamepadIcon, Star, Sparkles, ChevronRight, Lightbulb } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { fadeIn, fadeInLeft, fadeInRight, scaleIn } from '@/lib/animate';
import { getUserStats } from '@/lib/dashboard';

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
  const [userStreak, setUserStreak] = useState<number>(0);
  
  // Fetch user's daily progress and streak
  useEffect(() => {
    if (user) {
      fetchDailyProgress();
      fetchUserStreak();
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

  // Fetch user streak from stats
  const fetchUserStreak = async () => {
    if (!user) return;
    
    try {
      const stats = await getUserStats(user.id);
      setUserStreak(stats.streak);
    } catch (err) {
      console.error("Error fetching user streak:", err);
      setUserStreak(0); // Default to 0 on error
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
  
  // Format streak display
  const formatStreak = (streak: number) => {
    if (streak === 0) return 'Just started';
    if (streak === 1) return '1 day';
    return `${streak} days`;
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar 
        isLoggedIn={!!user}
        onLogout={logout}
        extension={navBarExtension}
      />
      
      <main className="flex-1">
        {/* Hero Section with enhanced visuals */}
        <section className="relative py-16 md:py-28 overflow-visible">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 right-0 w-96 h-96 bg-brain-purple/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-0 w-80 h-80 bg-brain-teal/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <AnimateOnScroll animation={fadeInLeft(100)} className="space-y-6 overflow-visible">
                <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-brain-purple/10 to-brain-teal/10 text-sm font-medium text-brain-purple mb-2">
                  Train your brain daily
                </div>
                <div className="overflow-visible mb-10">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none mb-6 overflow-visible">
                    Train Your Brain.
                    <div className="block h-auto mt-3 overflow-visible">
                      <span className="text-gradient overflow-visible"> 
                        Stay Sharp.
                      </span>
                    </div>
                  </h1>
                </div>
                <p className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed">
                  MindBoggle offers personalized brain exercises with AI-powered feedback to help maintain cognitive health.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    className="bg-gradient-to-r from-brain-purple to-brain-teal hover:opacity-90 text-white px-8 group relative overflow-hidden shadow-lg transition-all"
                    size="lg"
                    onClick={() => handleButtonClick('/dashboard')}
                  >
                    <span className="relative z-10 flex items-center">
                      Get Started 
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleButtonClick('/games')}
                    className="border-brain-teal/30 hover:border-brain-teal hover:bg-brain-teal/10 transition-all group"
                  >
                    <span className="flex items-center">
                      Explore Games
                      <GamepadIcon className="ml-2 h-4 w-4 transition-transform group-hover:rotate-12" />
                    </span>
                  </Button>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll animation={fadeInRight(300)} className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -top-8 -left-8 w-40 h-40 bg-brain-purple/20 rounded-full blur-2xl animate-pulse-soft"></div>
                  <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-brain-teal/20 rounded-full blur-2xl animate-pulse-soft"></div>
                  {user ? (
                    <div className="relative z-10 bg-card p-8 rounded-xl shadow-xl border border-brain-teal/20 backdrop-blur-sm animate-float">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3 bg-brain-purple/10 p-4 rounded-lg dark:bg-brain-purple/20 transition-all hover:bg-brain-purple/20 cursor-pointer">
                          <Brain className="h-8 w-8 text-amber-500" />
                          <div>
                            <div className="font-medium">Memory</div>
                            <div className="text-xs text-muted-foreground">Build recall</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 bg-brain-teal/10 p-4 rounded-lg dark:bg-brain-teal/20 transition-all hover:bg-brain-teal/20 cursor-pointer">
                          <GamepadIcon className="h-8 w-8 text-brain-teal" />
                          <div>
                            <div className="font-medium">Focus</div>
                            <div className="text-xs text-muted-foreground">Sharpen attention</div>
                          </div>
                        </div>
                        <div className="col-span-2 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/10 shadow-inner">
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-sm font-medium">Today's Progress</div>
                            <div className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                              {dailyProgress.completed}/{dailyProgress.total}
                            </div>
                          </div>
                          <div className="w-full bg-muted-foreground/20 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-2 rounded-full bg-gradient-to-r from-brain-purple to-brain-teal animate-pulse-soft"
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                          <div className="mt-3 text-xs text-muted-foreground flex justify-between items-center">
                            <span>{user.name ? `${user.name}'s streak: ${formatStreak(userStreak)}` : `Your streak: ${formatStreak(userStreak)}`}</span>
                            <Sparkles className="h-3 w-3 text-amber-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative z-10 bg-card p-8 rounded-xl shadow-xl border border-brain-teal/20 backdrop-blur-sm animate-float">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-brain-purple/20 to-brain-teal/20 flex items-center justify-center">
                          <Brain className="h-8 w-8 text-brain-purple" />
                        </div>
                        <h3 className="text-xl font-semibold">Train Your Brain</h3>
                        <div className="h-px w-16 bg-gradient-to-r from-brain-purple/30 to-brain-teal/30"></div>
                        <p className="text-sm text-muted-foreground max-w-xs">
                          Sign in to track your progress and access personalized brain training exercises designed for your cognitive needs.
                        </p>
                        <Button 
                          className="w-full bg-gradient-to-r from-brain-purple to-brain-teal hover:opacity-90 text-white mt-2 group"
                          onClick={() => {
                            const getStartedButton = document.querySelector('[data-get-started]') as HTMLButtonElement;
                            if (getStartedButton) {
                              getStartedButton.click();
                            }
                          }}
                        >
                          <span className="flex items-center">
                            Sign In
                            <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>
        
        {/* Features Section with enhanced visuals */}
        <section className="bg-gradient-to-b from-muted/50 to-muted py-16 md:py-24 overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-brain-teal/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-brain-purple/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <AnimateOnScroll animation={fadeIn(100)} className="text-center mb-12">
              <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-brain-purple/10 to-brain-teal/10 text-sm font-medium text-brain-purple mb-2">
                How It Works
              </div>
              <h2 className="text-3xl font-bold mb-3">Train your brain through engaging games</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Improve cognitive abilities with scientifically-backed exercises and personalized feedback
              </p>
            </AnimateOnScroll>
            
            <div className="grid gap-8 md:grid-cols-3">
              <AnimateOnScroll animation={fadeIn(100)} className="group">
                <div className="brain-card bg-card p-6 rounded-xl border border-brain-purple/20 hover:border-brain-purple/40 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-brain-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-brain-purple/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <GamepadIcon className="h-6 w-6 text-brain-purple" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Play Games</h3>
                    <p className="text-muted-foreground">
                      Engage in fun cognitive exercises designed to target different areas of brain function and improve your mental agility.
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
              
              <AnimateOnScroll animation={fadeIn(200)} className="group">
                <div className="brain-card bg-card p-6 rounded-xl border border-brain-teal/20 hover:border-brain-teal/40 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-brain-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-brain-teal/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Lightbulb className="h-6 w-6 text-brain-teal" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Get AI Feedback</h3>
                    <p className="text-muted-foreground">
                      Receive personalized analysis and recommendations based on your performance to optimize your cognitive training.
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
              
              <AnimateOnScroll animation={fadeIn(300)} className="group">
                <div className="brain-card bg-card p-6 rounded-xl border border-brain-coral/20 hover:border-brain-coral/40 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-brain-coral/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-brain-coral/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Star className="h-6 w-6 text-brain-coral" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Track Progress</h3>
                    <p className="text-muted-foreground">
                      Monitor your cognitive improvements over time with detailed analytics and visualize your journey to better brain health.
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
