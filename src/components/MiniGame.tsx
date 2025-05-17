
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { Game } from './GameCard';
import FeedbackPanel from './FeedbackPanel';
import MemoryGame from './games/MemoryGame';
import SequenceGame from './games/SequenceGame';
import WordGame from './games/WordGame';
import CreativeSparkGame from './games/CreativeSparkGame';
import { saveGameResults } from '@/lib/dashboard';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MiniGameProps {
  game: Game;
  onComplete: (score: number) => void;
  onBack: () => void;
  requireLogin?: boolean;
  onGameStateChange?: (isPlaying: boolean) => void;
}

interface GameState {
  score: number;
  timeLeft: number;
  isPlaying: boolean;
  showFeedback: boolean;
  resultsSaved: boolean; // Added flag to track if results were saved
}

const MiniGame = ({ game, onComplete, onBack, requireLogin = false, onGameStateChange }: MiniGameProps) => {
  const [state, setState] = useState<GameState>({
    score: 0,
    timeLeft: 60,
    isPlaying: false,
    showFeedback: false,
    resultsSaved: false, // Initialize as false
  });
  
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [exitAction, setExitAction] = useState<() => void>(() => () => {});
  
  const { toast: uiToast } = useToast();
  const { user } = useAuth();
  
  // Notify parent component when game state changes
  useEffect(() => {
    if (onGameStateChange) {
      onGameStateChange(state.isPlaying);
    }
  }, [state.isPlaying, onGameStateChange]);
  
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
      uiToast({
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
      showFeedback: false,
      resultsSaved: false, // Reset when starting a new game
    });
  };
  
  const handleGameEnd = async () => {
    // First, stop the game
    setState(prev => ({
      ...prev,
      isPlaying: false,
      showFeedback: true
    }));
    
    // Only save results if they haven't been saved yet for this game session
    if (user && !state.resultsSaved) {
      try {
        // Calculate normalized scores based on game category
        let memoryScore = 0;
        let focusScore = 0;
        let speedScore = 0;
        
        // Assign score to the appropriate cognitive area based on game category
        switch(game.category.toLowerCase()) {
          case 'memory':
            memoryScore = Math.min(state.score, 100);
            break;
          case 'focus':
            focusScore = Math.min(state.score, 100);
            break;
          case 'speed':
            speedScore = Math.min(state.score, 100);
            break;
          case 'balanced':
          case 'mixed':
            // For balanced training, distribute the score across all areas
            memoryScore = Math.min(Math.round(state.score / 3), 100);
            focusScore = Math.min(Math.round(state.score / 3), 100);
            speedScore = Math.min(Math.round(state.score / 3), 100);
            break;
          default:
            speedScore = Math.min(state.score, 100);
            break;
        }
        
        // Save results to database
        await saveGameResults(user.id, memoryScore, focusScore, speedScore);
        
        // Mark results as saved to prevent duplicate saving
        setState(prev => ({
          ...prev,
          resultsSaved: true
        }));
        
        toast.success("Game progress saved!");
        
        // Signal that stats should be updated, but we won't navigate away
        onComplete(state.score);
      } catch (error) {
        console.error("Error saving game results:", error);
        toast.error("Couldn't save your progress");
      }
    } else if (!user) {
      // Still call onComplete to update UI as needed
      onComplete(state.score);
    }
    
    uiToast({
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
  
  // Handle exit confirmation
  const confirmExit = (exitCallback: () => void) => {
    if (state.isPlaying) {
      setExitAction(() => exitCallback);
      setShowExitConfirmation(true);
    } else {
      // If not playing, just execute the callback directly
      exitCallback();
    }
  };
  
  const handleBackClick = () => {
    confirmExit(onBack);
  };
  
  const handleEndGameClick = () => {
    confirmExit(handleGameEnd);
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
      case 'daily-challenge':
      case 'balanced-training':
        // Fix: Use CreativeSparkGame instead of BalancedTraining as a fallback
        return (
          <CreativeSparkGame
            onScoreChange={handleScoreChange}
            onGameEnd={handleGameEnd}
            difficulty={getDifficulty()}
          />
        );
      case 'reaction-test':
        return (
          <CreativeSparkGame
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
        <Button variant="outline" onClick={handleBackClick}>Back</Button>
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
            <Button variant="outline" onClick={handleEndGameClick}>End Game</Button>
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
      
      {/* Exit Confirmation Dialog */}
      <AlertDialog
        open={showExitConfirmation}
        onOpenChange={setShowExitConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to exit?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress in this game will be lost if you exit now.
              {user ? " Your current score will be saved to your profile." : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, continue playing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                exitAction();
                setShowExitConfirmation(false);
              }}
            >
              Yes, exit game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MiniGame;
