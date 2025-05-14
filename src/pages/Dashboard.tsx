
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import NavBar from '@/components/NavBar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Brain, GamepadIcon, Check } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    streak: 0,
    overallScore: 0,
    memoryScore: 0,
    focusScore: 0,
    speedScore: 0,
    progress: 0,
    lastPlayed: null as Date | null
  });
  
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
    
    // Mock loading user stats - in a real app, this would fetch from an API
    const loadMockStats = () => {
      // Simulate API delay
      setTimeout(() => {
        setStats({
          gamesPlayed: Math.floor(Math.random() * 10) + 5,
          streak: Math.floor(Math.random() * 5) + 1,
          overallScore: Math.floor(Math.random() * 500) + 200,
          memoryScore: Math.floor(Math.random() * 100),
          focusScore: Math.floor(Math.random() * 100),
          speedScore: Math.floor(Math.random() * 100),
          progress: Math.floor(Math.random() * 100),
          lastPlayed: new Date(Date.now() - Math.floor(Math.random() * 86400000))
        });
      }, 500);
    };
    
    loadMockStats();
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
            <h1 className="text-3xl font-bold mb-1">Welcome, {user.name}!</h1>
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
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="text-3xl font-bold">{stats.gamesPlayed}</div>
              <p className="text-sm text-muted-foreground">Games Played</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="text-3xl font-bold">{stats.streak}</div>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="text-3xl font-bold">{stats.overallScore}</div>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
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
              "Based on your recent games, we've noticed you excel at memory tasks but could benefit from more focus-building exercises. 
              Try the Number Sequence game to improve your processing speed and concentration."
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="bg-brain-purple/10 p-2 rounded-full">
                  <Brain className="h-5 w-5 text-brain-purple" />
                </div>
                <div>
                  <div className="font-medium">Play Memory Match</div>
                  <div className="text-xs text-muted-foreground">Recommended for today</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="bg-brain-teal/10 p-2 rounded-full">
                  <GamepadIcon className="h-5 w-5 text-brain-teal" />
                </div>
                <div>
                  <div className="font-medium">Try Word Recall</div>
                  <div className="text-xs text-muted-foreground">New game for you</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
