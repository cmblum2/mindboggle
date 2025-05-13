
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Game } from './GameCard';
import FeedbackPanel from './FeedbackPanel';

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
  gameData: any;
}

const MiniGame = ({ game, onComplete, onBack, requireLogin = false }: MiniGameProps) => {
  const [state, setState] = useState<GameState>({
    score: 0,
    timeLeft: 60,
    isPlaying: false,
    showFeedback: false,
    gameData: null,
  });
  
  const { toast } = useToast();
  
  // Initialize game based on game.id
  useEffect(() => {
    if (game.id === 'memory-match') {
      initMemoryGame();
    } else if (game.id === 'number-sequence') {
      initSequenceGame();
    } else if (game.id === 'word-recall') {
      initWordGame();
    }
  }, [game.id]);
  
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
  
  const initMemoryGame = () => {
    // Create memory game data - pairs of cards
    const symbols = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍒', '🥝'];
    const cards = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({ id: index, symbol, flipped: false, matched: false }));
    
    setState(prev => ({
      ...prev,
      gameData: {
        cards,
        flippedCards: [],
        matches: 0
      }
    }));
  };
  
  const initSequenceGame = () => {
    // Generate sequence of numbers
    const generateSequence = () => {
      const length = Math.min(3 + Math.floor(state.score / 2), 9);
      return Array.from({ length }, () => Math.floor(Math.random() * 9) + 1);
    };
    
    setState(prev => ({
      ...prev,
      gameData: {
        sequence: generateSequence(),
        userSequence: [],
        showSequence: true,
        sequenceStep: 0
      }
    }));
  };
  
  const initWordGame = () => {
    const words = [
      'APPLE', 'BEACH', 'CLOUD', 'DANCE', 'EAGLE',
      'FLAME', 'GRAPE', 'HOUSE', 'IGLOO', 'JUICE'
    ];
    
    // Select random words based on level
    const count = Math.min(3 + Math.floor(state.score / 5), 7);
    const selectedWords = words
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
    
    setState(prev => ({
      ...prev,
      gameData: {
        words: selectedWords,
        showingWords: true,
        userGuesses: [],
        wordOptions: [...selectedWords].sort(() => Math.random() - 0.5)
      }
    }));
  };
  
  const startGame = () => {
    if (requireLogin) {
      toast({
        title: "Login required",
        description: "Please log in to play games and save your progress",
        variant: "default"
      });
      return;
    }
    
    setState(prev => ({
      ...prev,
      isPlaying: true,
      timeLeft: 60,
      score: 0
    }));
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
  
  // Simple placeholder UI - in real app, each game would have custom UI
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
          
          <div className="game-area min-h-[300px] flex items-center justify-center border rounded-xl p-4">
            <div className="text-center">
              <p>Game simulation - click buttons to earn points</p>
              <div className="flex gap-2 mt-4 justify-center">
                <Button 
                  variant="outline"
                  onClick={() => setState(prev => ({ ...prev, score: prev.score + 1 }))}
                >
                  +1 Point
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setState(prev => ({ ...prev, score: prev.score + 5 }))}
                >
                  +5 Points
                </Button>
              </div>
            </div>
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
