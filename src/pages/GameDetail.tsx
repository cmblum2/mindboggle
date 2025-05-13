
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import MiniGame from '@/components/MiniGame';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Game } from '@/components/GameCard';
import { Skeleton } from '@/components/ui/skeleton';

const GameDetail = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) {
      navigate('/');
      toast({
        title: "Access denied",
        description: "Please log in to play games",
        variant: "destructive"
      });
      return;
    }
    
    if (!gameId) {
      navigate('/games');
      return;
    }
    
    // Mock fetching specific game - in a real app, this would fetch from an API
    const fetchGame = () => {
      // Simulate API delay
      setTimeout(() => {
        // Mock games data - in a real app this would be fetched from backend
        const allGames: Game[] = [
          {
            id: 'memory-match',
            name: 'Memory Match',
            description: 'Test your memory by matching pairs of cards',
            category: 'Memory',
            difficulty: 'Easy',
            duration: '5 min',
            progress: 75,
            icon: 'memory'
          },
          {
            id: 'number-sequence',
            name: 'Number Sequence',
            description: 'Remember and repeat sequences of numbers',
            category: 'Focus',
            difficulty: 'Medium',
            duration: '3 min',
            progress: 30,
            icon: 'focus'
          },
          {
            id: 'word-recall',
            name: 'Word Recall',
            description: 'Memorize and recall a list of words',
            category: 'Memory',
            difficulty: 'Medium',
            duration: '4 min',
            progress: 0,
            icon: 'memory'
          },
          {
            id: 'reaction-test',
            name: 'Reaction Test',
            description: 'Test your reaction time and processing speed',
            category: 'Speed',
            difficulty: 'Easy',
            duration: '2 min',
            progress: 0,
            icon: 'speed'
          },
          {
            id: 'pattern-recognition',
            name: 'Pattern Recognition',
            description: 'Identify patterns and complete sequences',
            category: 'Focus',
            difficulty: 'Hard',
            duration: '6 min',
            progress: 50,
            icon: 'focus'
          },
          {
            id: 'mental-math',
            name: 'Mental Math',
            description: 'Solve math problems quickly in your head',
            category: 'Speed',
            difficulty: 'Medium',
            duration: '5 min',
            progress: 0,
            icon: 'speed'
          }
        ];
        
        const foundGame = allGames.find(g => g.id === gameId);
        
        if (foundGame) {
          setGame(foundGame);
        } else {
          toast({
            title: "Game not found",
            description: "The requested game could not be found",
            variant: "destructive"
          });
          navigate('/games');
        }
        
        setLoading(false);
      }, 800);
    };
    
    fetchGame();
  }, [gameId, user, navigate, toast]);
  
  const handleGameComplete = (score: number) => {
    // In a real app, this would save the score to backend
    console.log(`Game completed with score: ${score}`);
    
    // Update local game progress (mock)
    if (game) {
      setGame({
        ...game,
        progress: Math.min(100, game.progress + 25)
      });
    }
  };
  
  if (!user || !gameId) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar 
        isLoggedIn={true}
        onLogout={logout}
        onLogin={() => {}}
      />
      
      <main className="flex-1 container px-4 py-6 md:py-10">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-[400px] w-full mt-4" />
          </div>
        ) : game ? (
          <div className="game-container">
            <MiniGame 
              game={game}
              onComplete={handleGameComplete}
              onBack={() => navigate('/games')}
            />
          </div>
        ) : (
          <div className="text-center p-10">
            <h2 className="text-2xl font-bold">Game not found</h2>
            <p className="text-muted-foreground mt-2">
              The game you're looking for doesn't exist or has been removed.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default GameDetail;
