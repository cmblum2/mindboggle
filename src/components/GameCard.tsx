
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Brain, GamepadIcon, Clock, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/hooks/useAuth';

export interface Game {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: string;
  progress: number;
  icon: 'memory' | 'speed' | 'focus';
}

interface GameCardProps {
  game: Game;
  requireLogin?: boolean;
}

const GameCard = ({ game, requireLogin = false }: GameCardProps) => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const getGameIcon = () => {
    switch (game.icon) {
      case 'memory':
        return <Brain className="h-5 w-5 text-brain-purple" />;
      case 'speed':
        return <Clock className="h-5 w-5 text-brain-teal" />;
      case 'focus':
        return <Star className="h-5 w-5 text-brain-coral" />;
      default:
        return <GamepadIcon className="h-5 w-5 text-brain-purple" />;
    }
  };
  
  const getDifficultyColor = () => {
    switch (game.difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-blue-100 text-blue-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleGameAction = () => {
    if (requireLogin) {
      setShowAuthModal(true);
    } else {
      navigate(`/game/${game.id}`);
    }
  };
  
  return (
    <div className="game-container">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-full bg-opacity-10" 
          style={{ backgroundColor: game.icon === 'memory' ? 'rgba(123, 97, 255, 0.1)' : 
                              game.icon === 'speed' ? 'rgba(65, 191, 179, 0.1)' : 
                              'rgba(255, 107, 107, 0.1)' }}>
          {getGameIcon()}
        </div>
        <div className={`text-xs font-medium px-2.5 py-1 rounded-full ${getDifficultyColor()}`}>
          {game.difficulty}
        </div>
      </div>
      
      <h3 className="text-lg font-semibold mb-1">{game.name}</h3>
      <p className="text-sm text-muted-foreground mb-3">{game.description}</p>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span>{game.category}</span>
        <span className="flex items-center">
          <Clock className="h-3 w-3 mr-1" /> {game.duration}
        </span>
      </div>
      
      {game.progress > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="font-medium">Progress</span>
            <span>{game.progress}%</span>
          </div>
          <Progress value={game.progress} className="h-1.5" />
        </div>
      )}
      
      <Button 
        className="w-full bg-gradient-to-r from-brain-purple to-brain-teal hover:opacity-90 text-white"
        onClick={handleGameAction}
      >
        {requireLogin ? "Sign In to Play" : game.progress > 0 ? "Continue" : "Start"} Game
      </Button>
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={login}
        onSignup={signup}
      />
    </div>
  );
};

export default GameCard;
