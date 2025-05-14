
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import NavBar from '@/components/NavBar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Brain, GamepadIcon, Check, TrendingUp, Calendar, Award } from 'lucide-react';
import { getUserStats, getRecommendations, UserStats } from '@/lib/dashboard';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
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
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) {
      navigate('/');
      toast({
        title: "Access denied",
        description: "Please log in to access your dashboard",
        variant: "destructive"
      });
      return;
    }
    
    const loadUserData = async () => {
      try {
        setLoading(true);
        const userStats = await getUserStats(user.id);
        setStats(userStats);
        
        const userRecommendations = await getRecommendations(userStats);
        setRecommendations(userRecommendations);
      } catch (error) {
        console.error("Error loading user data:", error);
        toast({
          title: "Failed to load data",
          description: "There was a problem loading your statistics",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [user, navigate, toast]);
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleDateString();
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
        
        {loading ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-12 bg-gray-200 animate-pulse rounded-md"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-32 bg-gray-200 animate-pulse rounded-md"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <GamepadIcon className="h-8 w-8 mb-2 text-brain-purple" />
                  <div className="text-3xl font-bold">{stats.gamesPlayed}</div>
                  <p className="text-sm text-muted-foreground">Games Played</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <TrendingUp className="h-8 w-8 mb-2 text-brain-teal" />
                  <div className="text-3xl font-bold">{stats.streak}</div>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Award className="h-8 w-8 mb-2 text-brain-coral" />
                  <div className="text-3xl font-bold">{stats.overallScore}</div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Calendar className="h-8 w-8 mb-2 text-brain-purple" />
                  <div className="text-3xl font-bold">{formatDate(stats.lastPlayed)}</div>
                  <p className="text-sm text-muted-foreground">Last Played</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Cognitive Areas */}
            <h2 className="text-2xl font-bold mb-4">Cognitive Areas</h2>
            <div className="grid gap-4 md:grid-cols-3 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Memory</CardTitle>
                  <Brain className="h-4 w-4 text-brain-purple" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.memoryScore}%</div>
                  <Progress value={stats.memoryScore} className="h-2 mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">Based on memory games performance</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Focus</CardTitle>
                  <Check className="h-4 w-4 text-brain-teal" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.focusScore}%</div>
                  <Progress value={stats.focusScore} className="h-2 mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">Based on attention games performance</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Processing Speed</CardTitle>
                  <GamepadIcon className="h-4 w-4 text-brain-coral" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.speedScore}%</div>
                  <Progress value={stats.speedScore} className="h-2 mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">Based on reaction games performance</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Recommendations */}
            <h2 className="text-2xl font-bold mb-4">Your AI Recommendations</h2>
            <Card className="border-brain-teal/20 mb-8">
              <CardContent className="p-6">
                <p className="italic text-muted-foreground mb-4">
                  "Based on your recent games, we've noticed you excel at 
                  {stats.memoryScore > stats.focusScore && stats.memoryScore > stats.speedScore ? ' memory tasks' : 
                   stats.focusScore > stats.memoryScore && stats.focusScore > stats.speedScore ? ' focus exercises' : ' speed challenges'} 
                  but could benefit from more 
                  {stats.memoryScore < stats.focusScore && stats.memoryScore < stats.speedScore ? ' memory-building' : 
                   stats.focusScore < stats.memoryScore && stats.focusScore < stats.speedScore ? ' focus-building' : ' speed-building'} 
                  exercises."
                </p>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className={`${
                        rec.category === 'memory' ? 'bg-brain-purple/10' : 
                        rec.category === 'focus' ? 'bg-brain-teal/10' : 
                        'bg-brain-coral/10'
                      } p-2 rounded-full`}>
                        {rec.category === 'memory' ? (
                          <Brain className={`h-5 w-5 ${rec.category === 'memory' ? 'text-brain-purple' : rec.category === 'focus' ? 'text-brain-teal' : 'text-brain-coral'}`} />
                        ) : rec.category === 'focus' ? (
                          <Check className={`h-5 w-5 ${rec.category === 'memory' ? 'text-brain-purple' : rec.category === 'focus' ? 'text-brain-teal' : 'text-brain-coral'}`} />
                        ) : (
                          <GamepadIcon className={`h-5 w-5 ${rec.category === 'memory' ? 'text-brain-purple' : rec.category === 'focus' ? 'text-brain-teal' : 'text-brain-coral'}`} />
                        )}
                      </div>
                      <div>
                        <Button 
                          variant="link" 
                          className="h-auto p-0 font-medium text-left"
                          onClick={() => navigate(`/game/${rec.gameId}`)}
                        >
                          {rec.gameName}
                        </Button>
                        <div className="text-xs text-muted-foreground">{rec.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
