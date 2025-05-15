
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import MiniGame from '@/components/MiniGame';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Game } from '@/components/GameCard';
import { Skeleton } from '@/components/ui/skeleton';
import AuthModal from '@/components/AuthModal';

interface GameDetailProps {
  navBarExtension?: React.ReactNode;
}

const GameDetail = ({ navBarExtension }: GameDetailProps) => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [statsUpdated, setStatsUpdated] = useState(false);
  
  useEffect(() => {
    if (!gameId) {
      navigate('/games');
      return;
    }
    
    // Mock fetching specific game - in a real app, this would fetch from an API
    const fetchGame = () => {
      // Simulate API delay
      setTimeout(() => {
        // Get today's date for the daily challenge
        const today = new Date();
        const dateString = today.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        });
        
        // Mock games data - in a real app this would be fetched from backend
        const allGames: Game[] = [
          {
            id: 'memory-match',
            name: 'Memory Match',
            description: 'Test your memory by matching pairs of cards',
            category: 'Memory',
            difficulty: 'Easy',
            duration: '5 min',
            progress: user ? 75 : 0,
            icon: 'memory'
          },
          {
            id: 'number-sequence',
            name: 'Number Sequence',
            description: 'Remember and repeat sequences of numbers',
            category: 'Focus',
            difficulty: 'Medium',
            duration: '3 min',
            progress: user ? 30 : 0,
            icon: 'focus'
          },
          {
            id: 'word-recall',
            name: 'Word Recall',
            description: 'Memorize and recall a list of words',
            category: 'Memory',
            difficulty: 'Medium',
            duration: '4 min',
            progress: user ? 0 : 0,
            icon: 'memory'
          },
          {
            id: 'reaction-test',
            name: 'Reaction Test',
            description: 'Test your reaction time and processing speed',
            category: 'Speed',
            difficulty: 'Easy',
            duration: '2 min',
            progress: user ? 0 : 0,
            icon: 'speed'
          },
          {
            id: 'pattern-recognition',
            name: 'Pattern Recognition',
            description: 'Identify patterns and complete sequences',
            category: 'Focus',
            difficulty: 'Hard',
            duration: '6 min',
            progress: user ? 50 : 0,
            icon: 'focus'
          },
          {
            id: 'mental-math',
            name: 'Mental Math',
            description: 'Solve math problems quickly in your head',
            category: 'Speed',
            difficulty: 'Medium',
            duration: '5 min',
            progress: user ? 0 : 0,
            icon: 'speed'
          },
          {
            id: 'daily-challenge',
            name: `Daily Brain Challenge (${dateString})`,
            description: 'A new balanced training exercise each day that works on multiple cognitive skills simultaneously',
            category: 'Balanced',
            difficulty: 'Medium', // Changed from 'Adaptive' to valid type 'Medium'
            duration: '10 min',
            progress: user ? 0 : 0,
            icon: 'focus', // Changed from 'brain' to valid type 'focus'
            brainTarget: 'Multiple Brain Regions',
            cognitiveHealth: 'Provides comprehensive training across memory, attention, processing speed and executive function areas simultaneously.'
          }
        ];
        
        // Check if the game is the daily challenge, update its name
        let foundGame = allGames.find(g => g.id === gameId);
        
        if (foundGame) {
          setGame(foundGame);
          
          // If user is not logged in, show auth modal
          if (!user) {
            setShowAuthModal(true);
          }
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
  
  const handleGameComplete = async (score: number) => {
    // In a real app, this would save the score to backend
    console.log(`Game completed with score: ${score}`);
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    // Update local game progress (mock)
    if (game) {
      setGame({
        ...game,
        progress: Math.min(100, game.progress + 25)
      });
    }
    
    // Mark stats as updated so dashboard can refresh when user navigates there
    setStatsUpdated(true);
    
    // Store the refresh flag in sessionStorage so dashboard can detect it
    sessionStorage.setItem('refreshStats', 'true');
    
    // Show a success toast that mentions AI recommendations will be updated
    toast({
      title: "Game complete!",
      description: "Your stats have been recorded and your AI recommendations will be updated on the dashboard.",
      variant: "default"
    });
    
    // We don't navigate away automatically - user will stay on the feedback page
    // The FeedbackPanel in MiniGame will handle navigation when user clicks "Continue"
  };
  
  if (!gameId) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar 
        isLoggedIn={!!user}
        onLogout={logout}
        extension={navBarExtension}
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
              requireLogin={!user}
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
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default GameDetail;
