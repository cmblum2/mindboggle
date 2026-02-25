import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, GamepadIcon, Star, Sparkles, ChevronRight, Lightbulb } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { fadeIn, fadeInLeft, fadeInRight } from '@/lib/animate';
import { getUserStats } from '@/lib/dashboard';

interface IndexProps {
  navBarExtension?: React.ReactNode;
}

const Index = ({ navBarExtension }: IndexProps = {}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dailyProgress, setDailyProgress] = useState({
    completed: 0,
    total: 3
  });
  const [userStreak, setUserStreak] = useState<number>(0);
  
  useEffect(() => {
    if (user) {
      fetchDailyProgress();
      fetchUserStreak();
    }
  }, [user]);
  
  const fetchDailyProgress = async () => {
    if (!user) return;
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('cognitive_performance')
        .select('id')
        .eq('user_id', user.id)
        .gte('date', today.toISOString());
      
      if (error) throw error;
      
      setDailyProgress({
        completed: data ? data.length : 0,
        total: 3
      });
      
    } catch (err) {
      console.error("Error fetching daily progress:", err);
    }
  };

  const fetchUserStreak = async () => {
    if (!user) return;
    
    try {
      const stats = await getUserStats(user.id);
      setUserStreak(stats.streak);
    } catch (err) {
      console.error("Error fetching user streak:", err);
      setUserStreak(0);
    }
  };

  const handleButtonClick = (path: string) => {
    if (user) {
      navigate(path);
    } else {
      toast({
        title: "Login Required",
        description: "Please login or create an account to access this feature.",
        variant: "default",
      });
      
      const getStartedButton = document.querySelector('[data-get-started]') as HTMLButtonElement;
      if (getStartedButton) {
        getStartedButton.click();
      }
    }
  };
  
  const progressPercentage = Math.min(
    (dailyProgress.completed / dailyProgress.total) * 100, 
    100
  );
  
  const formatStreak = (streak: number) => {
    if (streak === 0) return 'Just started';
    if (streak === 1) return '1 day';
    return `${streak} days`;
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar 
        isLoggedIn={!!user}
        onLogout={logout}
        extension={navBarExtension}
      />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-28 overflow-visible">
          {/* Background decorations */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-0 w-80 h-80 bg-accent/5 dark:bg-accent/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <AnimateOnScroll animation={fadeInLeft(100)} className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 text-sm font-medium text-primary border border-primary/20">
                  <Sparkles className="h-4 w-4" />
                  Train your brain daily
                </div>
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-foreground">
                    Train Your Brain.
                    <span className="block mt-2 text-gradient"> 
                      Stay Sharp.
                    </span>
                  </h1>
                </div>
                <p className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed">
                  MindBoggle offers personalized brain exercises with AI-powered feedback to help maintain cognitive health.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    className="rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground px-8 group relative overflow-hidden shadow-lg transition-all hover:shadow-xl"
                    size="lg"
                    onClick={() => handleButtonClick('/dashboard')}
                  >
                    <span className="relative z-10 flex items-center">
                      Get Started 
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleButtonClick('/games')}
                    className="rounded-xl border-primary/30 hover:border-primary hover:bg-primary/10 transition-all group"
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
                  <div className="absolute -top-8 -left-8 w-40 h-40 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
                  <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-accent/20 rounded-full blur-2xl animate-pulse"></div>
                  {user ? (
                    <div className="relative z-10 glass-card p-8 rounded-2xl animate-float">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3 bg-brain-yellow/10 dark:bg-brain-yellow/20 p-4 rounded-xl transition-all hover:scale-105 cursor-pointer border border-brain-yellow/20">
                          <Brain className="h-8 w-8 text-brain-yellow" />
                          <div>
                            <div className="font-medium text-foreground">Memory</div>
                            <div className="text-xs text-muted-foreground">Build recall</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 bg-brain-teal/10 dark:bg-brain-teal/20 p-4 rounded-xl transition-all hover:scale-105 cursor-pointer border border-brain-teal/20">
                          <GamepadIcon className="h-8 w-8 text-brain-teal" />
                          <div>
                            <div className="font-medium text-foreground">Focus</div>
                            <div className="text-xs text-muted-foreground">Sharpen attention</div>
                          </div>
                        </div>
                        <div className="col-span-2 bg-muted/50 dark:bg-muted/30 backdrop-blur-sm p-4 rounded-xl border border-border/50">
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-sm font-medium text-foreground">Today's Progress</div>
                            <div className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                              {dailyProgress.completed}/{dailyProgress.total}
                            </div>
                          </div>
                          <div className="w-full bg-muted dark:bg-muted/50 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-2 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                          <div className="mt-3 text-xs text-muted-foreground flex justify-between items-center">
                            <span>{user.name ? `${user.name}'s streak: ${formatStreak(userStreak)}` : `Your streak: ${formatStreak(userStreak)}`}</span>
                            <Sparkles className="h-3 w-3 text-brain-yellow" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative z-10 glass-card p-8 rounded-2xl animate-float">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20">
                          <Brain className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">Train Your Brain</h3>
                        <div className="h-px w-16 bg-gradient-to-r from-primary/30 to-accent/30"></div>
                        <p className="text-sm text-muted-foreground max-w-xs">
                          Sign in to track your progress and access personalized brain training exercises designed for your cognitive needs.
                        </p>
                        <Button 
                          className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground group shadow-lg"
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
        
        {/* Features Section */}
        <section className="bg-muted/30 dark:bg-muted/10 py-16 md:py-24 overflow-hidden relative border-y border-border/50">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <AnimateOnScroll animation={fadeIn(100)} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 text-sm font-medium text-primary border border-primary/20 mb-4">
                <Lightbulb className="h-4 w-4" />
                How It Works
              </div>
              <h2 className="text-3xl font-bold mb-3 text-foreground">Train your brain through engaging games</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Improve cognitive abilities with scientifically-backed exercises and personalized feedback
              </p>
            </AnimateOnScroll>
            
            <div className="grid gap-6 md:grid-cols-3">
              <AnimateOnScroll animation={fadeIn(100)} className="group">
                <div className="glass-card p-6 rounded-2xl hover:border-primary/30 transition-all duration-300 h-full flex flex-col hover-lift">
                  <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-primary/20">
                    <GamepadIcon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">Play Games</h3>
                  <p className="text-muted-foreground">
                    Engage in fun cognitive exercises designed to target different areas of brain function and improve your mental agility.
                  </p>
                </div>
              </AnimateOnScroll>
              
              <AnimateOnScroll animation={fadeIn(200)} className="group">
                <div className="glass-card p-6 rounded-2xl hover:border-accent/30 transition-all duration-300 h-full flex flex-col hover-lift">
                  <div className="w-12 h-12 bg-accent/10 dark:bg-accent/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-accent/20">
                    <Lightbulb className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">Get AI Feedback</h3>
                  <p className="text-muted-foreground">
                    Receive personalized analysis and recommendations based on your performance to optimize your cognitive training.
                  </p>
                </div>
              </AnimateOnScroll>
              
              <AnimateOnScroll animation={fadeIn(300)} className="group">
                <div className="glass-card p-6 rounded-2xl hover:border-brain-coral/30 transition-all duration-300 h-full flex flex-col hover-lift">
                  <div className="w-12 h-12 bg-brain-coral/10 dark:bg-brain-coral/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-brain-coral/20">
                    <Star className="h-6 w-6 text-brain-coral" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">Track Progress</h3>
                  <p className="text-muted-foreground">
                    Monitor your cognitive improvements over time with detailed analytics and visualize your journey to better brain health.
                  </p>
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
