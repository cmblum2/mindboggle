
import { useState, useEffect } from 'react';
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
  const [recommendationsKey, setRecommendationsKey] = useState(0); // New state to specifically trigger recommendations refresh
  
  // Check if we should refresh stats (coming from game completion)
  useEffect(() => {
    // Check both location state and sessionStorage
    const shouldRefresh = location.state?.refreshStats || sessionStorage.getItem('refreshStats') === 'true';
    
    if (shouldRefresh) {
      // Clear the sessionStorage flag
      sessionStorage.removeItem('refreshStats');
      // Clear the location state
      if (location.state?.refreshStats) {
        window.history.replaceState({}, document.title);
      }
      // Trigger refresh of both stats and recommendations
      setRefreshKey(prevKey => prevKey + 1);
      setRecommendationsKey(prevKey => prevKey + 1); // Force recommendations to refresh as well
      
      // Show toast to indicate recommendations have been updated
      toast.info("Your AI recommendations have been updated based on your latest activity!");
    }
  }, [location.state]);
  
  useEffect(() => {
    if (!user) {
      return;
    }
    
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user stats (now with all-time averages)
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
  }, [user, refreshKey]); // Refresh when user or refreshKey changes
  
  // If authentication is still loading, showing a loading state is handled by ProtectedRoute
  if (!user) {
    return null; // Don't render anything if not authenticated, ProtectedRoute will handle the redirect
  }
  
  const handleChallengeComplete = () => {
    // Refresh stats and recommendations when a challenge is completed
    setRefreshKey(prevKey => prevKey + 1);
    setRecommendationsKey(prevKey => prevKey + 1);
  };
  
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
              refreshKey={recommendationsKey} // Pass the key to force re-rendering
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
