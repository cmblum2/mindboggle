
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import NavBar from '@/components/NavBar';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { getUserStats, getRecommendedGames, UserStats } from '@/lib/dashboard';
import DailyChallenges from '@/components/DailyChallenges';
import TrainingPlan from '@/components/TrainingPlan';
import StatsOverview from '@/components/dashboard/StatsOverview';
import CognitiveAreas from '@/components/dashboard/CognitiveAreas';
import AIRecommendations from '@/components/dashboard/AIRecommendations';

interface DashboardProps {
  navBarExtension?: React.ReactNode;
}

const Dashboard = ({ navBarExtension }: DashboardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast: toastFromUI } = useToast();
  const [refreshKey, setRefreshKey] = useState(0); // Used to force data refresh
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
  
  // Debounced refresh function to prevent multiple rapid refreshes
  const debouncedRefresh = useCallback(() => {
    // If already refreshing, don't trigger again
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Set a new timeout
    refreshTimeoutRef.current = window.setTimeout(() => {
      setRefreshKey(prevKey => prevKey + 1);
      
      // Show toast only once per session
      if (!toastDisplayedRef.current) {
        toast.info("Your AI recommendations have been updated based on your latest activity!");
        toastDisplayedRef.current = true;
      }
      
      refreshTimeoutRef.current = null;
    }, 1000); // 1 second debounce
  }, []);
  
  // Check if we should refresh stats (coming from game completion)
  useEffect(() => {
    // Check both location state and sessionStorage
    const shouldRefresh = location.state?.refreshStats || sessionStorage.getItem('refreshStats') === 'true';
    
    if (shouldRefresh) {
      console.log("Dashboard detected refresh request from game exit");
      
      // Clear the sessionStorage flag
      sessionStorage.removeItem('refreshStats');
      // Clear the location state
      if (location.state?.refreshStats) {
        window.history.replaceState({}, document.title);
      }
      
      // Trigger refresh using debounced function
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
        
        // Fetch user stats (now with all-time averages)
        console.log("Fetching user stats for userId:", user.id);
        const userStats = await getUserStats(user.id);
        console.log("Received user stats:", userStats);
        setStats(userStats);
        
        // Get game recommendations based on stats
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
  }, [user, refreshKey]); // Refresh when user or refreshKey changes
  
  // If authentication is still loading, showing a loading state is handled by ProtectedRoute
  if (!user) {
    return null; // Don't render anything if not authenticated, ProtectedRoute will handle the redirect
  }
  
  const handleChallengeComplete = () => {
    // Only trigger refresh once per session to prevent multiple notifications
    if (!challengeCompletedRef.current) {
      challengeCompletedRef.current = true;
      
      // Show a toast notification
      toast.success("Challenge completed! Keep up the good work!");
      
      // Refresh the dashboard data
      debouncedRefresh();
      
      // Reset the flag after 10 seconds to allow future notifications
      setTimeout(() => {
        challengeCompletedRef.current = false;
      }, 10000);
    }
  };
  
  // Clean up the timeout when component unmounts
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar 
        isLoggedIn={true}
        onLogout={() => {}} // onLogout is handled in NavBar via useAuth
        extension={navBarExtension}
      />
      
      <main className="flex-1 container px-4 py-6 md:py-10">
        {/* Header with welcome message and play button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Welcome, {user.name || user.email?.split('@')[0]}!</h1>
            <p className="text-muted-foreground">Track your cognitive fitness journey</p>
          </div>
          <Button 
            onClick={() => navigate('/games')}
            className="mt-4 md:mt-0 bg-gradient-to-r from-brain-purple to-brain-teal hover:opacity-90 text-white"
          >
            Play Games
          </Button>
        </div>
        
        {/* Stats Overview */}
        <StatsOverview stats={stats} isLoading={isLoading} />
        
        {/* Main content - two column layout for larger screens */}
        <div className="grid gap-8 md:grid-cols-2 mb-8">
          {/* Left Column - Cognitive Areas and Training Plan */}
          <div>
            {/* Cognitive Areas */}
            <CognitiveAreas 
              memoryScore={stats.memoryScore}
              focusScore={stats.focusScore}
              speedScore={stats.speedScore}
              isLoading={isLoading}
            />
            
            {/* Training Plan */}
            <h2 className="text-2xl font-bold mb-4">Training Plan</h2>
            <TrainingPlan
              memoryScore={stats.memoryScore}
              focusScore={stats.focusScore}
              speedScore={stats.speedScore}
              isLoading={isLoading}
            />
          </div>
          
          {/* Right Column - Daily Challenges and Recommendations */}
          <div>
            {/* Daily Challenges */}
            <h2 className="text-2xl font-bold mb-4">Daily Challenges</h2>
            {user && (
              <DailyChallenges 
                userId={user.id}
                onChallengeComplete={handleChallengeComplete}
              />
            )}
            
            {/* AI Recommendations */}
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
