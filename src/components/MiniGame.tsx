
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Game } from './GameCard';
import FeedbackPanel from './FeedbackPanel';
import MemoryGame from './games/MemoryGame';
import SequenceGame from './games/SequenceGame';
import WordGame from './games/WordGame';

interface MiniGameProps {
  game: Game;
  onComplete: (score: number) => void;
  onBack: () => void;
  requireLogin?: boolean;
}

interface GameState {
  score: number;
  timeLeft: number;
  isPlaying: boolean;
  showFeedback: boolean;
}

const MiniGame = ({ game, onComplete, onBack, requireLogin = false }: MiniGameProps) => {
  const [state, setState] = useState<GameState>({
    score: 0,
    timeLeft: 60,
    isPlaying: false,
    showFeedback: false,
  });
  
  const { toast } = useToast();
  
  // Timer for games
  useEffect(() => {
    let timer: number;
    
    if (state.isPlaying && state.timeLeft > 0) {
      timer = window.setInterval(() => {
        setState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
    } else if (state.timeLeft === 0 && state.isPlaying) {
      handleGameEnd();
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [state.isPlaying, state.timeLeft]);
  
  const startGame = () => {
    if (requireLogin) {
      toast({
        title: "Login required",
        description: "Please log in to play games and save your progress",
        variant: "default"
      });
      return;
    }
    
    setState({
      isPlaying: true,
      timeLeft: getGameDuration(),
      score: 0,
      showFeedback: false
    });
  };
  
  const handleGameEnd = () => {
    setState(prev => ({
      ...prev,
      isPlaying: false,
      showFeedback: true
    }));
    onComplete(state.score);
    toast({
      title: "Game complete!",
      description: `You scored ${state.score} points.`
    });
  };
  
  const getGameDuration = (): number => {
    // Convert duration string to seconds
    const durationMatch = game.duration.match(/(\d+)/);
    if (durationMatch) {
      return parseInt(durationMatch[0]) * 60; // Convert minutes to seconds
    }
    return 60; // Default 1 minute
  };
  
  const handleScoreChange = (newScore: number) => {
    setState(prev => ({
      ...prev,
      score: newScore
    }));
  };
  
  // Render the appropriate game component based on the game.id
  const renderGame = () => {
    switch (game.id) {
      case 'memory-match':
        return (
          <MemoryGame
            onScoreChange={handleScoreChange}
            onGameEnd={handleGameEnd}
            difficulty={getDifficulty()}
          />
        );
      case 'number-sequence':
        return (
          <SequenceGame
            onScoreChange={handleScoreChange}
            onGameEnd={handleGameEnd}
            difficulty={getDifficulty()}
          />
        );
      case 'word-recall':
        return (
          <WordGame
            onScoreChange={handleScoreChange}
            onGameEnd={handleGameEnd}
            difficulty={getDifficulty()}
          />
        );
      default:
        return (
          <div className="text-center">
            <p>Game simulation - click buttons to earn points</p>
            <div className="flex gap-2 mt-4 justify-center">
              <Button 
                variant="outline"
                onClick={() => handleScoreChange(state.score + 1)}
              >
                +1 Point
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleScoreChange(state.score + 5)}
              >
                +5 Points
              </Button>
            </div>
          </div>
        );
    }
  };
  
  // Convert difficulty string to game difficulty level
  const getDifficulty = (): 'easy' | 'medium' | 'hard' => {
    switch (game.difficulty.toLowerCase()) {
      case 'easy': return 'easy';
      case 'medium': return 'medium';
      case 'hard': return 'hard';
      default: return 'medium';
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <div className="text-xl font-bold">{game.name}</div>
        <div className="bg-muted rounded-md px-3 py-1 font-medium">
          Score: {state.score}
        </div>
      </div>
      
      {!state.isPlaying && !state.showFeedback && (
        <div className="text-center space-y-6 py-12">
          <h2 className="text-2xl font-bold">{game.name}</h2>
          <p className="text-muted-foreground">{game.description}</p>
          <p>This game helps improve your {game.category.toLowerCase()} abilities.</p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-brain-purple to-brain-teal hover:opacity-90 text-white"
            onClick={startGame}
          >
            {requireLogin ? "Login to Play" : "Start Playing"}
          </Button>
        </div>
      )}
      
      {state.isPlaying && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="bg-muted px-3 py-1 rounded-md">
              Time: {state.timeLeft}s
            </div>
            <Button variant="outline" onClick={handleGameEnd}>End Game</Button>
          </div>
          
          <div className="game-area min-h-[300px] border rounded-xl p-4">
            {renderGame()}
          </div>
        </div>
      )}
      
      {state.showFeedback && (
        <FeedbackPanel 
          score={state.score}
          gameType={game.category}
          onClose={() => {
            setState(prev => ({ ...prev, showFeedback: false }));
            onBack();
          }}
        />
      )}
    </div>
  );
};

export default MiniGame;
