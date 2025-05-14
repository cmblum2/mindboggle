
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import NavBar from '@/components/NavBar';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Brain, GamepadIcon, Check, Award, Calendar, TrendingUp } from 'lucide-react';
import { getUserStats, getRecommendedGames, getDailyChallenges, UserStats } from '@/lib/dashboard';
import DailyChallenges from '@/components/DailyChallenges';
import TrainingPlan from '@/components/TrainingPlan';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
    // Only redirect if we've confirmed the auth state and the user is not authenticated
    if (user === null && authChecked) {
      navigate('/');
      toastFromUI({
        title: "Access denied",
        description: "Please log in to access your dashboard",
        variant: "destructive"
      });
      return;
    }
    
    // If user is authenticated, proceed with loading data
    if (user) {
      setAuthChecked(true);
      
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
    } else if (!authChecked) {
      // If this is the first render and we're still checking auth, mark as checked
      setAuthChecked(true);
    }
  }, [user, navigate, toastFromUI, authChecked]);
  
  // If we're still loading or checking auth, show a loading state
  if (user === null && !authChecked) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar 
          isLoggedIn={false}
          onLogout={logout}
          onLogin={() => {}}
        />
        <div className="flex-1 container px-4 py-6 md:py-10 flex items-center justify-center">
          <Skeleton className="h-24 w-1/2" />
        </div>
      </div>
    );
  }
  
  // Otherwise, if the user is null and we've checked auth, just return null
  if (user === null) {
    return null; // Will redirect in useEffect
  }
  
  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleDateString();
  };
  
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
        onLogin={() => {}}
      />
      
      <main className="flex-1 container px-4 py-6 md:py-10">
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
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <StatCard 
            title="Games Played" 
            value={stats.gamesPlayed.toString()} 
            icon={<GamepadIcon className="h-8 w-8 mb-2 text-brain-purple" />}
            isLoading={isLoading}
          />
          
          <StatCard 
            title="Day Streak" 
            value={stats.streak.toString()} 
            icon={<TrendingUp className="h-8 w-8 mb-2 text-brain-teal" />}
            isLoading={isLoading}
          />
          
          <StatCard 
            title="Total Points" 
            value={stats.overallScore.toString()} 
            icon={<Award className="h-8 w-8 mb-2 text-brain-coral" />}
            isLoading={isLoading}
          />
          
          <StatCard 
            title="Last Played" 
            value={formatDate(stats.lastPlayed)} 
            icon={<Calendar className="h-8 w-8 mb-2 text-brain-purple" />}
            isLoading={isLoading}
          />
        </div>
        
        {/* Main content - two column layout for larger screens */}
        <div className="grid gap-8 md:grid-cols-2 mb-8">
          {/* Cognitive Areas */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Cognitive Areas</h2>
            <div className="grid gap-4 mb-8">
              <CognitiveAreaCard 
                title="Memory" 
                score={stats.memoryScore} 
                icon={<Brain className="h-4 w-4 text-brain-purple" />}
                description="Based on memory games performance"
                isLoading={isLoading}
              />
              
              <CognitiveAreaCard 
                title="Focus" 
                score={stats.focusScore} 
                icon={<Check className="h-4 w-4 text-brain-teal" />}
                description="Based on attention games performance"
                isLoading={isLoading}
              />
              
              <CognitiveAreaCard 
                title="Processing Speed" 
                score={stats.speedScore} 
                icon={<GamepadIcon className="h-4 w-4 text-brain-coral" />}
                description="Based on reaction games performance"
                isLoading={isLoading}
              />
            </div>
            
            {/* New Training Plan Component */}
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
            <h2 className="text-2xl font-bold mb-4">Daily Challenges</h2>
            {user && (
              <DailyChallenges 
                userId={user.id}
                onChallengeComplete={handleChallengeComplete}
              />
            )}
            
            {/* Recommendations */}
            <h2 className="text-2xl font-bold mt-8 mb-4">Your AI Recommendations</h2>
            <Card className="border-brain-teal/20">
              <CardContent className="p-6">
                {isLoading ? (
                  <>
                    <Skeleton className="h-16 w-full mb-4" />
                    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="italic text-muted-foreground mb-4">
                      "Based on your recent games, we've noticed you excel at {getStrongestArea(stats)} tasks but could benefit from more {getWeakestArea(stats)}-building exercises. Try our recommended games to improve your overall cognitive fitness."
                    </p>
                    
                    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                      {recommendations.map((game, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                          <div className={`${getCategoryColor(game.category)} p-2 rounded-full`}>
                            {getCategoryIcon(game.category)}
                          </div>
                          <div>
                            <Button 
                              variant="link" 
                              className="h-auto p-0 font-medium text-left"
                              onClick={() => navigate(`/game/${game.id}`)}
                            >
                              {game.name}
                            </Button>
                            <div className="text-xs text-muted-foreground">
                              {index === 0 ? `Recommended to improve your ${game.category}` : 'New game for you'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper functions to determine cognitive strengths and weaknesses
const getWeakestArea = (stats: UserStats): string => {
  let weakestArea = 'memory';
  let weakestScore = stats.memoryScore;
  
  if (stats.focusScore < weakestScore) {
    weakestArea = 'focus';
    weakestScore = stats.focusScore;
  }
  
  if (stats.speedScore < weakestScore) {
    weakestArea = 'speed';
    weakestScore = stats.speedScore;
  }
  
  return weakestArea;
};

const getStrongestArea = (stats: UserStats): string => {
  let strongestArea = 'memory';
  let strongestScore = stats.memoryScore;
  
  if (stats.focusScore > strongestScore) {
    strongestArea = 'focus';
    strongestScore = stats.focusScore;
  }
  
  if (stats.speedScore > strongestScore) {
    strongestArea = 'speed';
    strongestScore = stats.speedScore;
  }
  
  return strongestArea;
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'memory':
      return <Brain className="h-5 w-5 text-brain-purple" />;
    case 'focus':
      return <Check className="h-5 w-5 text-brain-teal" />;
    case 'speed':
      return <GamepadIcon className="h-5 w-5 text-brain-coral" />;
    default:
      return <Brain className="h-5 w-5 text-brain-purple" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'memory':
      return 'bg-brain-purple/10';
    case 'focus':
      return 'bg-brain-teal/10';
    case 'speed':
      return 'bg-brain-coral/10';
    default:
      return 'bg-brain-purple/10';
  }
};

// Card components for better organization
const StatCard = ({ title, value, icon, isLoading }: { title: string; value: string; icon: React.ReactNode; isLoading: boolean }) => (
  <Card>
    <CardContent className="flex flex-col items-center justify-center p-6">
      {isLoading ? (
        <>
          <Skeleton className="h-8 w-8 mb-2 rounded-full" />
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-4 w-20" />
        </>
      ) : (
        <>
          {icon}
          <div className="text-3xl font-bold">{value}</div>
          <p className="text-sm text-muted-foreground">{title}</p>
        </>
      )}
    </CardContent>
  </Card>
);

const CognitiveAreaCard = ({ 
  title, 
  score, 
  icon, 
  description, 
  isLoading 
}: { 
  title: string; 
  score: number; 
  icon: React.ReactNode; 
  description: string;
  isLoading: boolean;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <>
          <Skeleton className="h-7 w-16 mb-2" />
          <Skeleton className="h-2 w-full mb-2" />
          <Skeleton className="h-4 w-40" />
        </>
      ) : (
        <>
          <div className="text-2xl font-bold">{score}%</div>
          <Progress value={score} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        </>
      )}
    </CardContent>
  </Card>
);

export default Dashboard;
