import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import GameCard from '@/components/GameCard';
import { Brain, Zap, Brain as BrainIcon, Puzzle, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/AuthModal';

// Mock game data
const gameData = [
  {
    id: 'memory',
    title: 'Memory Master',
    description: 'Test and improve your memory recall with progressive challenges',
    icon: <BrainIcon className="h-8 w-8 text-brain-purple" />,
    category: 'Memory',
    difficulty: 'Medium',
    timeToComplete: '5-10 min',
  },
  {
    id: 'focusFlow',
    title: 'Focus Flow',
    description: 'Enhance your concentration by identifying patterns under pressure',
    icon: <Zap className="h-8 w-8 text-brain-teal" />,
    category: 'Focus',
    difficulty: 'Hard',
    timeToComplete: '10-15 min',
  },
  {
    id: 'puzzleSolver',
    title: 'Puzzle Solver',
    description: 'Improve your problem-solving skills with complex puzzles',
    icon: <Puzzle className="h-8 w-8 text-brain-coral" />,
    category: 'Logic',
    difficulty: 'Medium',
    timeToComplete: '10-20 min',
  },
  {
    id: 'creativeSpark',
    title: 'Creative Spark',
    description: 'Unleash your creativity with challenges that require innovative thinking',
    icon: <Sparkles className="h-8 w-8 text-brain-yellow" />,
    category: 'Creative',
    difficulty: 'Easy',
    timeToComplete: '5-10 min',
  },
];

interface GamesProps {
  navBarExtension?: React.ReactNode;
}

const Games = ({ navBarExtension }: GamesProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar 
        isLoggedIn={!!user}
        onLogout={logout}
        extension={navBarExtension}
      />
      
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Brain Training Games
            </h1>
            <p className="mt-4 text-muted-foreground max-w-3xl mx-auto">
              Challenge your mind with our collection of cognitive games designed to test and improve different areas of brain function
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {gameData.map((game) => (
              <GameCard 
                key={game.id}
                game={game}
                onPlay={() => {
                  if (user) {
                    navigate(`/game/${game.id}`);
                  } else {
                    setShowAuthModal(true);
                  }
                }}
                isLoggedIn={!!user}
              />
            ))}
          </div>
        </div>
      </main>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default Games;
