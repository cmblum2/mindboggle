
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import NavBar from '@/components/NavBar';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { getUserStats, getRecommendedGames, UserStats } from '@/lib/dashboard';
import DailyChallenges from '@/components/DailyChallenges';
import TrainingPlan from '@/components/TrainingPlan';
import StatsOverview from '@/components/dashboard/StatsOverview';
import CognitiveAreas from '@/components/dashboard/CognitiveAreas';
import AIRecommendations from '@/components/dashboard/AIRecommendations';
import { Gamepad2, Sparkles } from 'lucide-react';

interface DashboardProps {
  navBarExtension?: React.ReactNode;
}

const Dashboard = ({ navBarExtension }: DashboardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshTimeoutRef = useRef<number | null>(null);
  const toastDisplayedRef = useRef(false);
  const challengeCompletedRef = useRef(false);
  
  const [stats, setStats] = useState<UserStats>({
    gamesPlayed: 0,
    streak: 0,
    overallScore: 0,
    memoryScore: 0,
    focusScore: 0,
    speedScore: 0,
    progress: 0,
    lastPlayed: null
  });
  
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const debouncedRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    refreshTimeoutRef.current = window.setTimeout(() => {
      setRefreshKey(prevKey => prevKey + 1);
      
      if (!toastDisplayedRef.current) {
        toast.info("Your AI recommendations have been updated based on your latest activity!");
        toastDisplayedRef.current = true;
      }
      
      refreshTimeoutRef.current = null;
    }, 1000);
  }, []);
  
  useEffect(() => {
    const shouldRefresh = location.state?.refreshStats || sessionStorage.getItem('refreshStats') === 'true';
    
    if (shouldRefresh) {
      console.log("Dashboard detected refresh request from game exit");
      sessionStorage.removeItem('refreshStats');
      if (location.state?.refreshStats) {
        window.history.replaceState({}, document.title);
      }
      debouncedRefresh();
    }
  }, [location.state, debouncedRefresh]);
  
  useEffect(() => {
    if (!user) {
      return;
    }
    
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching user stats for userId:", user.id);
        const userStats = await getUserStats(user.id);
        console.log("Received user stats:", userStats);
        setStats(userStats);
        
        const recommendedGames = await getRecommendedGames(userStats);
        setRecommendations(recommendedGames);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        toast.error("We couldn't retrieve your latest statistics");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [user, refreshKey]);
  
  if (!user) {
    return null;
  }
  
  const handleChallengeComplete = () => {
    if (!challengeCompletedRef.current) {
      challengeCompletedRef.current = true;
      toast.success("Challenge completed! Keep up the good work!");
      debouncedRefresh();
      
      setTimeout(() => {
        challengeCompletedRef.current = false;
      }, 10000);
    }
  };
  
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar 
        isLoggedIn={true}
        onLogout={() => {}}
        extension={navBarExtension}
      />
      
      <main className="flex-1 container px-4 py-6 md:py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-sm font-medium text-primary border border-primary/20 mb-3">
              <Sparkles className="h-3 w-3" />
              Dashboard
            </div>
            <h1 className="text-3xl font-bold mb-1 text-foreground">Welcome, {user.name || user.email?.split('@')[0]}!</h1>
            <p className="text-muted-foreground">Track your cognitive fitness journey</p>
          </div>
          <Button 
            onClick={() => navigate('/games')}
            className="mt-4 md:mt-0 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
          >
            <Gamepad2 className="h-4 w-4 mr-2" />
            Play Games
          </Button>
        </div>
        
        {/* Stats Overview */}
        <StatsOverview stats={stats} isLoading={isLoading} />
        
        {/* Main content */}
        <div className="grid gap-8 md:grid-cols-2 mb-8">
          {/* Left Column */}
          <div className="space-y-8">
            <CognitiveAreas 
              memoryScore={stats.memoryScore}
              focusScore={stats.focusScore}
              speedScore={stats.speedScore}
              isLoading={isLoading}
            />
            
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Training Plan</h2>
              <TrainingPlan
                memoryScore={stats.memoryScore}
                focusScore={stats.focusScore}
                speedScore={stats.speedScore}
                isLoading={isLoading}
              />
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Daily Challenges</h2>
              {user && (
                <DailyChallenges 
                  userId={user.id}
                  onChallengeComplete={handleChallengeComplete}
                />
              )}
            </div>
            
            <AIRecommendations 
              stats={stats}
              recommendations={recommendations}
              isLoading={isLoading}
              refreshKey={refreshKey} 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
