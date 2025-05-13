
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import GameCard, { Game } from '@/components/GameCard';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Games = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) {
      navigate('/');
      toast({
        title: "Access denied",
        description: "Please log in to access games",
        variant: "destructive"
      });
      return;
    }
    
    // Mock loading games data - in a real app, this would fetch from an API
    const loadMockGames = () => {
      // Simulate API delay
      setTimeout(() => {
        setGames([
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
        ]);
        setLoading(false);
      }, 800);
    };
    
    loadMockGames();
  }, [user, navigate, toast]);
  
  if (!user) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Brain Games</h1>
          <p className="text-muted-foreground">Exercise different cognitive areas with these fun games</p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Games;
