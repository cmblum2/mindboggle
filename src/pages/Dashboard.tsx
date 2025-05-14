
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import NavBar from '@/components/NavBar';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { getUserStats, getRecommendedGames, UserStats, saveGameResults } from '@/lib/dashboard';
import DailyChallenges from '@/components/DailyChallenges';
import TrainingPlan from '@/components/TrainingPlan';
import StatsOverview from '@/components/dashboard/StatsOverview';
import CognitiveAreas from '@/components/dashboard/CognitiveAreas';
import AIRecommendations from '@/components/dashboard/AIRecommendations';

interface DashboardProps {
  navBarExtension?: React.ReactNode;
}

const Dashboard = ({ navBarExtension }: DashboardProps) => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast: toastFromUI } = useToast();
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
  
  // Force refresh data when coming back from a game
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Effect to detect navigation back to dashboard
  useEffect(() => {
    // If we're on the dashboard, increment the refresh key
    if (location.pathname === '/dashboard') {
      setRefreshKey(prevKey => prevKey + 1);
    }
  }, [location.pathname]);
  
  useEffect(() => {
    // Only proceed with loading data if we have a user and are not currently loading auth state
    if (!user && !authLoading) {
      // Only redirect if auth is finished loading and there's no user
      console.log("No user found and auth loading completed, redirecting to home");
      navigate('/');
      toastFromUI({
        title: "Access denied",
        description: "Please log in to access your dashboard",
        variant: "destructive"
      });
      return;
    }
    
    // If authentication is still loading, don't do anything yet
    if (authLoading) {
      console.log("Auth is still loading, waiting...");
      return;
    }
    
    // If user is authenticated, proceed with loading data
    if (user) {
      console.log("User authenticated, loading dashboard data");
      
      const loadDashboardData = async () => {
        try {
          setIsLoading(true);
          
          // Fetch user stats
          const userStats = await getUserStats(user.id);
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
    }
  }, [user, navigate, toastFromUI, authLoading, refreshKey]);
  
  // If we're still loading auth, show a loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar 
          isLoggedIn={false}
          onLogout={logout}
          extension={navBarExtension}
        />
        <div className="flex-1 container px-4 py-6 md:py-10 flex items-center justify-center">
          <Skeleton className="h-24 w-1/2" />
        </div>
      </div>
    );
  }
  
  // If no user is authenticated after auth check completes, the useEffect above will handle redirect
  if (!user) {
    return null;
  }
  
  const handleChallengeComplete = () => {
    // Refresh stats when a challenge is completed
    if (user) {
      getUserStats(user.id).then(freshStats => {
        setStats(freshStats);
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar 
        isLoggedIn={true}
        onLogout={logout}
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
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
